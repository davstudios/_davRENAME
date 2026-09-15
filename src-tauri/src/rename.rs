use chrono::{DateTime, NaiveDateTime, Utc};
use exif::{In, Reader, Tag, Value};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashSet,
    fs::{self, File},
    io::{BufReader, Write},
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager};
use uuid::Uuid;
use walkdir::WalkDir;

const HISTORY_LIMIT: usize = 100;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileItem {
    path: String,
    parent: String,
    name: String,
    size: u64,
    modified: Option<i64>,
    created: Option<i64>,
    exif_date: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RenameOperation {
    old_path: String,
    new_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryEntry {
    id: String,
    timestamp: String,
    operations: Vec<RenameOperation>,
    #[serde(default)]
    undone: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RenameResult {
    id: String,
    timestamp: String,
    operations: Vec<RenameOperation>,
    warning: Option<String>,
}

#[tauri::command]
pub fn scan_paths(paths: Vec<String>, recursive: bool) -> Result<Vec<FileItem>, String> {
    let mut result = Vec::new();
    let mut seen = HashSet::new();

    for raw in paths {
        let path = PathBuf::from(raw);
        if !path.exists() {
            continue;
        }

        if path.is_file() {
            push_file(&path, &mut result, &mut seen);
            continue;
        }

        if path.is_dir() {
            if recursive {
                for entry in WalkDir::new(&path).follow_links(false).into_iter().filter_map(Result::ok) {
                    if entry.file_type().is_file() && !entry.file_type().is_symlink() {
                        push_file(entry.path(), &mut result, &mut seen);
                    }
                }
            } else if let Ok(entries) = fs::read_dir(&path) {
                for entry in entries.flatten() {
                    let p = entry.path();
                    if let Ok(meta) = fs::symlink_metadata(&p) {
                        if meta.file_type().is_file() && !meta.file_type().is_symlink() {
                            push_file(&p, &mut result, &mut seen);
                        }
                    }
                }
            }
        }
    }

    result.sort_by(|a, b| naturalish_key(&a.name).cmp(&naturalish_key(&b.name)).then_with(|| a.path.cmp(&b.path)));
    Ok(result)
}

#[tauri::command]
pub fn execute_rename(app: AppHandle, operations: Vec<RenameOperation>) -> Result<RenameResult, String> {
    if operations.is_empty() {
        return Err("Nessuna operazione da eseguire.".into());
    }

    validate_operations(&operations)?;
    perform_safe_rename(&operations)?;

    let timestamp = Utc::now().to_rfc3339();
    let id = Uuid::new_v4().to_string();
    let entry = HistoryEntry {
        id: id.clone(),
        timestamp: timestamp.clone(),
        operations: operations.clone(),
        undone: false,
    };
    let warning = append_history(&app, entry).err().map(|error| {
        format!("I file sono stati rinominati, ma la cronologia locale non è stata salvata: {error}")
    });

    Ok(RenameResult { id, timestamp, operations, warning })
}

#[tauri::command]
pub fn get_history(app: AppHandle) -> Result<Vec<HistoryEntry>, String> {
    let mut entries = load_history(&app)?;
    entries.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
    Ok(entries)
}

#[tauri::command]
pub fn undo_last(app: AppHandle) -> Result<RenameResult, String> {
    let mut history = load_history(&app)?;
    let Some(index) = history.iter().rposition(|entry| !entry.undone) else {
        return Err("Non ci sono operazioni da annullare.".into());
    };

    let original = history[index].clone();
    let inverse: Vec<RenameOperation> = original
        .operations
        .iter()
        .map(|op| RenameOperation {
            old_path: op.new_path.clone(),
            new_path: op.old_path.clone(),
        })
        .collect();

    validate_operations(&inverse)?;
    perform_safe_rename(&inverse)?;
    history[index].undone = true;
    save_history(&app, &history)?;

    Ok(RenameResult {
        id: original.id,
        timestamp: Utc::now().to_rfc3339(),
        operations: inverse,
        warning: None,
    })
}

fn push_file(path: &Path, result: &mut Vec<FileItem>, seen: &mut HashSet<String>) {
    let Ok(meta) = fs::metadata(path) else { return; };
    let key = normalize_path(path);
    if !seen.insert(key) { return; }

    let Some(name) = path.file_name().map(|v| v.to_string_lossy().to_string()) else { return; };
    let parent = path.parent().unwrap_or_else(|| Path::new("")).to_string_lossy().to_string();
    result.push(FileItem {
        path: path.to_string_lossy().to_string(),
        parent,
        name,
        size: meta.len(),
        modified: meta.modified().ok().and_then(system_time_millis),
        created: meta.created().ok().and_then(system_time_millis),
        exif_date: read_exif_date(path),
    });
}

fn read_exif_date(path: &Path) -> Option<i64> {
    let extension = path.extension()?.to_string_lossy().to_ascii_lowercase();
    if !matches!(extension.as_str(), "jpg" | "jpeg" | "tif" | "tiff" | "heic" | "heif" | "avif" | "png" | "webp") {
        return None;
    }
    let file = File::open(path).ok()?;
    let mut reader = BufReader::new(file);
    let exif = Reader::new().read_from_container(&mut reader).ok()?;
    let field = exif
        .get_field(Tag::DateTimeOriginal, In::PRIMARY)
        .or_else(|| exif.get_field(Tag::DateTime, In::PRIMARY))?;
    let Value::Ascii(values) = &field.value else { return None; };
    let raw = values.first()?;
    let raw = String::from_utf8_lossy(raw).trim_matches(char::from(0)).trim().to_string();
    let naive = NaiveDateTime::parse_from_str(&raw, "%Y:%m:%d %H:%M:%S").ok()?;
    Some(DateTime::<Utc>::from_naive_utc_and_offset(naive, Utc).timestamp_millis())
}

fn system_time_millis(value: SystemTime) -> Option<i64> {
    value.duration_since(UNIX_EPOCH).ok().map(|d| d.as_millis() as i64)
}

fn validate_operations(operations: &[RenameOperation]) -> Result<(), String> {
    if operations.len() > 100_000 {
        return Err("Per sicurezza una singola operazione non può superare 100.000 file.".into());
    }

    let mut sources = HashSet::new();
    let mut destinations = HashSet::new();

    for op in operations {
        let old = PathBuf::from(&op.old_path);
        let new = PathBuf::from(&op.new_path);

        if !old.is_file() {
            return Err(format!("File sorgente non trovato: {}", old.display()));
        }
        let old_parent = old.parent().ok_or_else(|| format!("Percorso sorgente non valido: {}", old.display()))?;
        let new_parent = new.parent().ok_or_else(|| format!("Percorso destinazione non valido: {}", new.display()))?;
        if normalize_path(old_parent) != normalize_path(new_parent) {
            return Err("_davRENAME può cambiare il nome, ma non spostare file in un’altra cartella.".into());
        }
        let new_name = new.file_name().and_then(|v| v.to_str()).ok_or_else(|| "Nome destinazione non valido.".to_string())?;
        validate_filename_backend(new_name)?;

        let old_key = normalize_path(&old);
        let new_key = normalize_path(&new);
        if !sources.insert(old_key.clone()) {
            return Err(format!("File sorgente duplicato: {}", old.display()));
        }
        if !destinations.insert(new_key.clone()) {
            return Err(format!("Due file finirebbero nello stesso nome: {}", new.display()));
        }
    }

    for op in operations {
        let new = PathBuf::from(&op.new_path);
        let new_key = normalize_path(&new);
        let old_key = normalize_path(Path::new(&op.old_path));
        if new.exists() && new_key != old_key && !sources.contains(&new_key) {
            return Err(format!("Esiste già un file non coinvolto nell’operazione: {}", new.display()));
        }
    }

    Ok(())
}

fn validate_filename_backend(name: &str) -> Result<(), String> {
    if name.trim().is_empty() || name == "." || name == ".." {
        return Err("Nome file vuoto o riservato.".into());
    }
    if name.contains('/') || name.contains('\0') {
        return Err(format!("Nome file non valido: {name}"));
    }
    #[cfg(target_os = "windows")]
    {
        let forbidden = ['<', '>', ':', '"', '/', '\\', '|', '?', '*'];
        if name.chars().any(|c| forbidden.contains(&c) || (c as u32) < 32) {
            return Err(format!("Il nome contiene caratteri non consentiti da Windows: {name}"));
        }
        if name.ends_with('.') || name.ends_with(' ') {
            return Err(format!("Windows non consente punto o spazio finale: {name}"));
        }
        let base = name.split('.').next().unwrap_or("").to_ascii_lowercase();
        let reserved = ["con", "prn", "aux", "nul", "com1", "com2", "com3", "com4", "com5", "com6", "com7", "com8", "com9", "lpt1", "lpt2", "lpt3", "lpt4", "lpt5", "lpt6", "lpt7", "lpt8", "lpt9"];
        if reserved.contains(&base.as_str()) {
            return Err(format!("Nome riservato da Windows: {name}"));
        }
    }
    Ok(())
}

fn perform_safe_rename(operations: &[RenameOperation]) -> Result<(), String> {
    let tx = Uuid::new_v4();
    let mut staged: Vec<(RenameOperation, PathBuf)> = Vec::with_capacity(operations.len());

    for (index, op) in operations.iter().cloned().enumerate() {
        let old = PathBuf::from(&op.old_path);
        let parent = old.parent().ok_or_else(|| "Percorso sorgente non valido.".to_string())?;
        let temp = unique_temp_path(parent, tx, index);
        if let Err(error) = fs::rename(&old, &temp) {
            for (prev, prev_temp) in staged.iter().rev() {
                let _ = fs::rename(prev_temp, &prev.old_path);
            }
            return Err(format!("Impossibile preparare la rinomina di {}: {}. _davRENAME ha tentato di ripristinare i file già preparati.", old.display(), error));
        }
        staged.push((op, temp));
    }

    for index in 0..staged.len() {
        let (op, temp) = &staged[index];
        let new = PathBuf::from(&op.new_path);
        if let Err(error) = fs::rename(temp, &new) {
            rollback_after_phase2_failure(&staged, index);
            return Err(format!("Rinomina interrotta su {}: {}. _davRENAME ha tentato il ripristino automatico.", new.display(), error));
        }
    }

    Ok(())
}

fn rollback_after_phase2_failure(staged: &[(RenameOperation, PathBuf)], completed_count: usize) {
    let recovery_tx = Uuid::new_v4();
    let mut recovery: Vec<(PathBuf, PathBuf)> = Vec::new();

    for (index, (op, original_temp)) in staged.iter().enumerate() {
        let current = if index < completed_count { PathBuf::from(&op.new_path) } else { original_temp.clone() };
        if !current.exists() { continue; }
        let parent = current.parent().unwrap_or_else(|| Path::new("."));
        let temp = unique_temp_path(parent, recovery_tx, index);
        if fs::rename(&current, &temp).is_ok() {
            recovery.push((temp, PathBuf::from(&op.old_path)));
        }
    }
    for (temp, old) in recovery {
        let _ = fs::rename(temp, old);
    }
}

fn unique_temp_path(parent: &Path, tx: Uuid, index: usize) -> PathBuf {
    let mut attempt = 0usize;
    loop {
        let candidate = parent.join(format!(".davrename-{tx}-{index}-{attempt}.tmp"));
        if !candidate.exists() { return candidate; }
        attempt += 1;
    }
}

fn history_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_local_data_dir().map_err(|e| format!("Cartella dati app non disponibile: {e}"))?;
    fs::create_dir_all(&dir).map_err(|e| format!("Impossibile creare la cartella dati: {e}"))?;
    Ok(dir.join("rename-history.json"))
}

fn load_history(app: &AppHandle) -> Result<Vec<HistoryEntry>, String> {
    let path = history_path(app)?;
    if !path.exists() { return Ok(Vec::new()); }
    let data = fs::read_to_string(&path).map_err(|e| format!("Impossibile leggere la cronologia: {e}"))?;
    serde_json::from_str(&data).map_err(|e| format!("Cronologia locale danneggiata: {e}"))
}

fn append_history(app: &AppHandle, entry: HistoryEntry) -> Result<(), String> {
    let mut history = load_history(app)?;
    history.push(entry);
    if history.len() > HISTORY_LIMIT {
        let drop_count = history.len() - HISTORY_LIMIT;
        history.drain(0..drop_count);
    }
    save_history(app, &history)
}

fn save_history(app: &AppHandle, history: &[HistoryEntry]) -> Result<(), String> {
    let path = history_path(app)?;
    let temp = path.with_extension("json.tmp");
    let bytes = serde_json::to_vec_pretty(history).map_err(|e| format!("Impossibile serializzare la cronologia: {e}"))?;
    let mut file = File::create(&temp).map_err(|e| format!("Impossibile creare il file cronologia: {e}"))?;
    file.write_all(&bytes).map_err(|e| format!("Impossibile scrivere la cronologia: {e}"))?;
    file.sync_all().map_err(|e| format!("Impossibile sincronizzare la cronologia: {e}"))?;
    if path.exists() { let _ = fs::remove_file(&path); }
    fs::rename(&temp, &path).map_err(|e| format!("Impossibile finalizzare la cronologia: {e}"))
}

fn normalize_path(path: &Path) -> String {
    let text = path.to_string_lossy().replace('\\', "/");
    #[cfg(any(target_os = "windows", target_os = "macos"))]
    { text.to_lowercase() }
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    { text }
}

fn naturalish_key(name: &str) -> String {
    name.to_lowercase()
}
