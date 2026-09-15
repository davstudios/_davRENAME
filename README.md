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

_davRENAME è un'app desktop multipiattaforma di **_davstudios** pensata per rinominare pochi file o grandi raccolte senza doverli modificare uno alla volta.

L'idea è semplice: aggiungi i file, costruisci le regole, controlli l'anteprima e solo quando sei sicuro confermi la rinomina. Tutto avviene **localmente sul computer**.

<p>
  <a href="https://www.davstudios.it"><img src=".github/assets/website-it.svg" height="46" alt="Visita il sito"></a>
  <a href="https://buymeacoffee.com/davstudios"><img src=".github/assets/buy-coffee-it.svg" height="46" alt="Comprami Un Caffè"></a>
</p>

## Perché _davRENAME

Quando devi rinominare decine, centinaia o migliaia di file, le operazioni manuali diventano lente e facili da sbagliare. _davRENAME permette di combinare più regole e vedere **in tempo reale** il risultato finale prima che venga modificato qualsiasi nome.

```text
IMG_0182.JPG  →  roma-001.jpg
IMG_0183.JPG  →  roma-002.jpg
IMG_0184.JPG  →  roma-003.jpg
```

### Funzioni principali

- selezione nativa di file e cartelle;
- drag & drop;
- scansione ricorsiva delle cartelle senza seguire symlink;
- anteprima completa prima dell'esecuzione;
- Find & Replace;
- espressioni regolari;
- prefissi e suffissi;
- numerazione progressiva;
- maiuscolo, minuscolo e Title Case;
- rimozione di caratteri e normalizzazione degli spazi;
- data di creazione e modifica;
- data EXIF `DateTimeOriginal` per le immagini supportate;
- template con `{name}`, `{ext}`, `{counter}`, `{date}`, `{created}`, `{modified}` ed `{exif}`;
- modifica dell'estensione come operazione di rinomina;
- rilevamento delle collisioni;
- validazione dei nomi specifica per Windows, macOS e Linux;
- Undo di più operazioni compatibili direttamente dalla cronologia;
- interfaccia in italiano e inglese;
- tema Sistema, Chiaro e Scuro.
- preset di regole integrati e personalizzati salvabili;
- filtri rapidi per estensione e cartella;
- esportazione del dry run in CSV prima della rinomina;

> **Nota:** cambiare l'estensione rinomina il file, ma non ne converte il formato. Per esempio, rinominare `foto.png` in `foto.jpg` non trasforma un PNG in JPEG.

<details>
<summary><strong>Sicurezza della rinomina</strong></summary>

_davRENAME è progettato per evitare sovrascritture e risultati ambigui.

Prima dell'esecuzione controlla collisioni e destinazioni non valide. Il backend valida nuovamente l'operazione e usa una rinomina in due fasi con nomi temporanei univoci, permettendo anche scambi come:

```text
A.txt → B.txt
B.txt → A.txt
```

Se un'operazione fallisce durante la transazione, viene tentato un rollback dei file già spostati.

</details>

<details>
<summary><strong>Privacy e filosofia locale</strong></summary>

- nessun account;
- nessun upload dei file;
- nessuna elaborazione cloud;
- nessuna telemetria integrata;
- nessun limite artificiale al numero di file imposto dall'app.

I nomi e i contenuti dei file restano sul dispositivo.

</details>

## Piattaforme

| Sistema | Architettura | Pacchetto previsto |
| --- | --- | --- |
| Windows 10/11 | x64 | NSIS `.exe` |
| macOS | Intel + Apple Silicon | Universal `.dmg` |
| Linux | x64 | `.AppImage` / `.deb` |

Le build di release vengono generate tramite GitHub Actions sui rispettivi sistemi operativi.

## Installazione

Per gli utenti finali, scarica il pacchetto adatto al tuo sistema dalla sezione **Releases** del repository e avvialo normalmente. Non è necessario installare Node.js, Rust o clonare il codice sorgente.

## Sviluppo locale

Requisiti: Node.js, Rust e i prerequisiti Tauri del sistema operativo.

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

Gli artefatti vengono creati in `src-tauri/target/release/bundle/`.

## Tecnologia

_davRENAME usa **Tauri 2** per l'app desktop, **Rust** per il backend e **JavaScript + Vite** per l'interfaccia. Il design e il motion system seguono l'identità visiva di `_davstudios`.

## Licenza

Distribuito con licenza **MIT**. Consulta [`LICENSE`](LICENSE).

### Supporta _davstudios

Se `_davRENAME` ti è utile e vuoi sostenere lo sviluppo dei prossimi strumenti della suite, puoi offrirmi un caffè.

<p>
  <a href="https://buymeacoffee.com/davstudios"><img src=".github/assets/buy-coffee-it.svg" height="46" alt="Comprami Un Caffè"></a>
  <a href="https://www.davstudios.it"><img src=".github/assets/website-it.svg" height="46" alt="Visita davstudios.it"></a>
</p>

<div align="right"><a href="#davrename">↑ Torna all'inizio</a></div>

---

# 🇬🇧 English

_davRENAME is a cross-platform desktop app by **_davstudios** designed to rename anything from a handful of files to large collections without editing them one by one.

The workflow is straightforward: add your files, build your rules, review the live preview, and only confirm the rename when everything looks right. Processing stays **local on your computer**.

<p>
  <a href="https://www.davstudios.it/en"><img src=".github/assets/website-en.svg" height="46" alt="Visit website"></a>
  <a href="https://buymeacoffee.com/davstudios"><img src=".github/assets/buy-coffee-en.svg" height="46" alt="Buy Me A Coffee"></a>
</p>

## Why _davRENAME

Renaming dozens, hundreds, or thousands of files manually is slow and error-prone. _davRENAME lets you combine multiple rules and see the **final result in real time** before any filename is changed.

```text
IMG_0182.JPG  →  rome-001.jpg
IMG_0183.JPG  →  rome-002.jpg
IMG_0184.JPG  →  rome-003.jpg
```

### Main features

- native file and folder selection;
- drag & drop;
- recursive folder scanning without following symlinks;
- full preview before execution;
- Find & Replace;
- regular expressions;
- prefixes and suffixes;
- sequential numbering;
- uppercase, lowercase and Title Case;
- character removal and whitespace cleanup;
- creation and modification dates;
- EXIF `DateTimeOriginal` for supported images;
- templates using `{name}`, `{ext}`, `{counter}`, `{date}`, `{created}`, `{modified}` and `{exif}`;
- extension changes as a rename operation;
- collision detection;
- OS-specific filename validation for Windows, macOS and Linux;
- multi-level Undo for compatible operations directly from history;
- Italian and English interface;
- System, Light and Dark themes.
- built-in and custom savable rule presets;
- quick filters by extension and folder;
- dry-run CSV export before renaming;

> **Note:** changing a file extension only renames the file; it does not convert its format. For example, renaming `photo.png` to `photo.jpg` does not convert a PNG into a JPEG.

<details>
<summary><strong>Rename safety</strong></summary>

_davRENAME is designed to avoid overwrites and ambiguous results.

Before execution it checks for collisions and invalid destinations. The backend validates the operation again and performs renames in two stages using unique temporary names, which also makes swaps like this possible:

```text
A.txt → B.txt
B.txt → A.txt
```

If an operation fails during the transaction, the app attempts to roll back files that were already moved.

</details>

<details>
<summary><strong>Privacy and local-first approach</strong></summary>

- no account;
- no file uploads;
- no cloud processing;
- no built-in telemetry;
- no artificial file-count limit imposed by the app.

Your filenames and file contents stay on your device.

</details>

## Platforms

| System | Architecture | Planned package |
| --- | --- | --- |
| Windows 10/11 | x64 | NSIS `.exe` |
| macOS | Intel + Apple Silicon | Universal `.dmg` |
| Linux | x64 | `.AppImage` / `.deb` |

Release builds are generated through GitHub Actions on the corresponding operating systems.

## Installation

For end users, download the package for your operating system from the repository's **Releases** section and launch it normally. Node.js, Rust, and the source repository are not required to use a compiled release.

## Local development

Requirements: Node.js, Rust, and the Tauri prerequisites for your operating system.

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

Build artifacts are created under `src-tauri/target/release/bundle/`.

## Technology

_davRENAME uses **Tauri 2** for the desktop application, **Rust** for the backend, and **JavaScript + Vite** for the interface. Its visual language and motion system follow the `_davstudios` identity.

## License

Released under the **MIT License**. See [`LICENSE`](LICENSE).

### Support _davstudios

If `_davRENAME` is useful to you and you would like to support the development of the next tools in the suite, you can buy me a coffee.

<p>
  <a href="https://buymeacoffee.com/davstudios"><img src=".github/assets/buy-coffee-en.svg" height="46" alt="Buy Me A Coffee"></a>
  <a href="https://www.davstudios.it/en"><img src=".github/assets/website-en.svg" height="46" alt="Visit davstudios.it"></a>
</p>

<div align="right"><a href="#davrename">↑ Back to top</a></div>
