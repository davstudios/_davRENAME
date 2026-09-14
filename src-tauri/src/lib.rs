mod rename;

use rename::{execute_rename, get_history, scan_paths, undo_last};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            scan_paths,
            execute_rename,
            get_history,
            undo_last
        ])
        .run(tauri::generate_context!())
        .expect("error while running _davRENAME");
}
