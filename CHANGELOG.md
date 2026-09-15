# Changelog

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
