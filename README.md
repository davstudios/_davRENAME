<div align="center">
  <img src="src-tauri/icons/app-icon.png" width="112" alt="_davRENAME icon">

# _davRENAME

**Rinomina file in massa in modo veloce, prevedibile e sicuro.**  
**Fast, predictable and safe bulk file renaming.**

Windows · macOS · Linux · Local-first · Open source

[![Italiano](https://img.shields.io/badge/Italiano-006EDB?style=for-the-badge)](#-italiano)
[![English](https://img.shields.io/badge/English-141416?style=for-the-badge)](#-english)
</div>

---

# 🇮🇹 Italiano

_davRENAME è un'app desktop multipiattaforma di **_davstudios** per rinominare file e raccolte in batch mantenendo sempre il controllo sul risultato. Aggiungi i file, costruisci le regole, verifica l'anteprima e conferma solo quando i nuovi nomi sono corretti. L'elaborazione avviene localmente sul computer.

<p>
  <a href="https://www.davstudios.it"><img src=".github/assets/website-it.svg" height="46" alt="Visita il sito"></a>
  <a href="https://buymeacoffee.com/davstudios"><img src=".github/assets/buy-coffee-it.svg" height="46" alt="Offrimi Un Caffè"></a>
</p>

## Funzioni principali

- selezione nativa di file e cartelle e drag & drop;
- scansione ricorsiva senza seguire symlink;
- anteprima live prima della rinomina;
- Find & Replace ed espressioni regolari;
- prefissi, suffissi e numerazione progressiva;
- maiuscolo, minuscolo e Title Case;
- rimozione caratteri e normalizzazione spazi;
- date di creazione, modifica ed EXIF `DateTimeOriginal`;
- template con `{name}`, `{ext}`, `{counter}`, `{date}`, `{created}`, `{modified}` ed `{exif}`;
- preset integrati e personalizzati;
- filtri per estensione e cartella;
- esportazione dry-run CSV;
- rilevamento collisioni e validazione specifica per sistema operativo;
- cronologia locale e Undo delle operazioni compatibili;
- interfaccia italiana e inglese con tema Sistema, Chiaro e Scuro.

> Cambiare l'estensione rinomina il file ma non ne converte il formato.

## Sicurezza della rinomina

Prima dell'esecuzione `_davRENAME` controlla collisioni e destinazioni non valide. Il backend valida nuovamente l'operazione e utilizza una rinomina in due fasi con nomi temporanei univoci, consentendo anche scambi come `A.txt → B.txt` e `B.txt → A.txt`. In caso di errore viene tentato il rollback dei file già spostati.

## Privacy e local-first

- nessun account;
- nessun upload dei file;
- nessuna elaborazione cloud;
- nessuna telemetria integrata;
- nessun limite artificiale al numero di file imposto dall'app.

Nomi e contenuti dei file restano sul dispositivo.

## Piattaforme

| Sistema | Architettura | Pacchetto |
| --- | --- | --- |
| Windows 10/11 | x64 | NSIS `.exe` |
| macOS | Intel + Apple Silicon | Universal `.dmg` |
| Linux | x64 | `.AppImage` / `.deb` |

Le release vengono compilate tramite GitHub Actions sui rispettivi sistemi operativi.

## Installazione di release non firmate

Le build pubbliche non utilizzano attualmente un certificato commerciale Windows né Apple Developer ID/notarizzazione. Scarica sempre gli artefatti dalla repository GitHub ufficiale di `_davstudios`.

### Windows

SmartScreen può mostrare **Windows ha protetto il PC**. Se il file proviene dalla repository ufficiale, scegli **Ulteriori informazioni → Esegui comunque**. La build Release è configurata come applicazione GUI e non apre una finestra CMD separata.

### macOS

Se Gatekeeper blocca la prima apertura, prova ad aprire l'app e poi vai in **Impostazioni di Sistema → Privacy e Sicurezza → Apri comunque**.

### Linux

Per un'AppImage può essere necessario renderla eseguibile:

```bash
chmod +x _davRENAME*.AppImage
```

## Sviluppo

Requisiti: Node.js, Rust e prerequisiti Tauri del sistema operativo.

```bash
npm install
npm run desktop
```

Test:

```bash
npm test
```

Build locale:

```bash
npm run bundle
```

Gli artefatti vengono generati in `src-tauri/target/release/bundle/`.

## Stack e identità

- Tauri 2;
- Rust;
- JavaScript + Vite;
- Plus Jakarta Sans;
- motion system coerente con il sito `_davstudios`;
- bundle identifier stabile: `studio.dav.rename`;
- licenza MIT.

La versione dell'app è gestita nei manifest tecnici e nelle GitHub Release; non viene mostrata nell'interfaccia ordinaria per mantenere la UI pulita e impedire stringhe di versione duplicate.

## Licenza

Distribuito con licenza **MIT**. Consulta [`LICENSE`](LICENSE).

---

# 🇺🇸 English

_davRENAME is a cross-platform desktop app by **_davstudios** for safely renaming files and large collections in batches. Add files, build rules, review the live preview and confirm only when the final names are correct. Processing stays local on your computer.

<p>
  <a href="https://www.davstudios.it/en"><img src=".github/assets/website-en.svg" height="46" alt="Visit website"></a>
  <a href="https://buymeacoffee.com/davstudios"><img src=".github/assets/buy-coffee-en.svg" height="46" alt="Buy Me A Coffee"></a>
</p>

## Main features

- native file/folder selection and drag & drop;
- recursive scanning without following symlinks;
- live preview before renaming;
- Find & Replace and regular expressions;
- prefixes, suffixes and sequential numbering;
- uppercase, lowercase and Title Case;
- character removal and whitespace cleanup;
- creation, modification and EXIF `DateTimeOriginal` dates;
- templates with `{name}`, `{ext}`, `{counter}`, `{date}`, `{created}`, `{modified}` and `{exif}`;
- built-in and custom presets;
- extension and folder filters;
- CSV dry-run export;
- collision detection and OS-specific filename validation;
- local history and Undo for compatible operations;
- Italian and English interface with System, Light and Dark themes.

> Changing an extension renames the file but does not convert its format.

## Rename safety

Before execution `_davRENAME` checks collisions and invalid destinations. The backend validates the operation again and uses a two-stage rename with unique temporary names, allowing swaps such as `A.txt → B.txt` and `B.txt → A.txt`. If a transaction fails, the app attempts to roll back files that were already moved.

## Privacy and local-first

- no account;
- no file uploads;
- no cloud processing;
- no built-in telemetry;
- no artificial app-imposed file-count limit.

File names and contents remain on your device.

## Platforms

| System | Architecture | Package |
| --- | --- | --- |
| Windows 10/11 | x64 | NSIS `.exe` |
| macOS | Intel + Apple Silicon | Universal `.dmg` |
| Linux | x64 | `.AppImage` / `.deb` |

Releases are compiled through GitHub Actions on the corresponding operating systems.

## Installing unsigned releases

Public builds currently do not use a commercial Windows signing certificate or Apple Developer ID/notarization. Always download artifacts from the official `_davstudios` GitHub repository.

### Windows

SmartScreen may display **Windows protected your PC**. If the file comes from the official repository, choose **More info → Run anyway**. Release builds use the Windows GUI subsystem and do not open a separate CMD window.

### macOS

If Gatekeeper blocks the first launch, attempt to open the app and then go to **System Settings → Privacy & Security → Open Anyway**.

### Linux

An AppImage may need executable permission:

```bash
chmod +x _davRENAME*.AppImage
```

## Development

Requirements: Node.js, Rust and the Tauri prerequisites for your operating system.

```bash
npm install
npm run desktop
```

Tests:

```bash
npm test
```

Local build:

```bash
npm run bundle
```

Artifacts are generated under `src-tauri/target/release/bundle/`.

## Stack and identity

- Tauri 2;
- Rust;
- JavaScript + Vite;
- Plus Jakarta Sans;
- motion system aligned with the `_davstudios` website;
- stable bundle identifier: `studio.dav.rename`;
- MIT License.

The application version is managed by the technical manifests and GitHub Releases; it is intentionally omitted from the ordinary interface to keep the UI clean and prevent duplicated version strings.

## License

Released under the **MIT License**. See [`LICENSE`](LICENSE).
