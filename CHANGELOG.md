# Changelog

## 26.10.2

- Eseguita la repository normalization completa dell'intero pacchetto, aggiornando realmente tutti i file della release senza modifiche funzionali.
- Sincronizzata la versione `26.10.2` in package.json, package-lock.json, configurazione Tauri, Cargo.toml e Cargo.lock.
- Estesi i controlli automatici di versione a package-lock.json e Cargo.lock.
- Reso esplicitamente robusto il parser di Cargo.lock sui checkout Windows con terminatori CRLF.
- Rafforzato il workflow GitHub Actions con verifica completa dei manifest e lockfile prima della build.
- Aggiornati in modo non visivo gli asset icona per associare anche i file binari al commit corrente preservando i pixel originali.
- Nessuna modifica al motore di rinomina, all'interfaccia o alla logica funzionale dell'app.

## 26.10.1

- Adottato il nuovo standard di versioning `_davstudios` `YY.M.REVISIONE`.
- Sincronizzata la versione `26.10.1` nei metadata npm, Tauri e Cargo.
- Standardizzati publisher, homepage, copyright, licenza MIT, descrizioni del pacchetto e metadata Linux.
- Mantenuto invariato l'identifier storico `studio.dav.rename`.
- Aggiunte al README le istruzioni per le release non firmate su Windows, macOS e Linux.
- Il workflow GitHub usa ora automaticamente la Description bilingue del commit associato al tag come descrizione della GitHub Release.
- Aggiunta la verifica obbligatoria delle sezioni `🇮🇹` e `🇺🇸` prima della pubblicazione.
- Rafforzato il workflow Linux contro repository Microsoft non raggiungibili.
- Aggiunti controlli automatici sul contratto di packaging e release.
- Nessuna modifica al motore di rinomina, all'interfaccia o alla logica funzionale dell'app.

## 1.1.2

- The version shown in the app now comes directly from the Tauri runtime instead of being hardcoded in the UI.
- Added automatic tests that keep package.json, tauri.conf.json and Cargo.toml versions aligned.
- Updated the GitHub release workflow to build the exact pushed or manually selected tag and validate its version before compiling.

## 1.1.0

- Added built-in and custom savable rule presets.
- Added quick filtering by file extension and source folder.
- Added CSV dry-run export before renaming.
- Added multi-level Undo from the local history with backend safety validation.
- Preserved unfiltered files in the current workspace when renaming a filtered subset.
- Added explicit Tauri opener permissions for davstudios.it and davstudios.it/en.
- Kept the bilingual history rendering and shared _davstudios design system.

## 1.0.0
- Cronologia attività localizzata dinamicamente: titolo, conteggio file e formato data seguono sempre la lingua attualmente selezionata, anche per operazioni create in precedenza.
- Added localized Buy Me a Coffee support button in the sidebar with the supplied SVG icon and external browser opening.
- Branding definitivo `_davRENAME`.
- Motion system allineato al sito `_davstudios`.
- Transizioni iniziali, cambio pagina, caricamento workspace, regole, menu e toast.
- Transizione dedicata al cambio tema con View Transitions e fallback animato.
- Transizione lingua con uscita e ingresso coerenti con il motion system del sito.
- Menu Tema e Lingua personalizzati con apertura, chiusura, stagger, focus e navigazione da tastiera animati.
- Toggle tema con transizione coordinata sole/luna.
- Supporto `prefers-reduced-motion`.
- Rimossi i commenti dai file sorgente JS, CSS, Rust e HTML, con test automatico che blocca future regressioni.
- Pipeline GitHub Release automatica per Windows, macOS Universal e Linux.
- Installer Windows NSIS, DMG macOS Universal, AppImage e deb Linux.
- Icon set multipiattaforma derivato dall'icona fornita.
- Motore di anteprima e rinomina sicura mantenuto con 11 test automatici.

## 0.1.1

- Aggiornamento completo dell'icon set.

## 0.1.0

- Prima versione multipiattaforma.

