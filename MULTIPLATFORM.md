# _davRENAME — piattaforme e distribuzione

| Piattaforma | Architettura pubblica | Build GitHub |
|---|---|---|
| Windows | x64 | NSIS `.exe` |
| macOS | Universal Intel + Apple Silicon | `.dmg` |
| Linux | x64 | `.AppImage` + `.deb` |

## Build locali

| Piattaforma | Avvio | Build |
|---|---|---|
| Windows | `RUN-WINDOWS.bat` | `BUILD-WINDOWS.bat` |
| macOS | `./RUN-MACOS.sh` | `./BUILD-MACOS.sh` |
| Linux | `./RUN-LINUX.sh` | `./BUILD-LINUX.sh` |

## Release automatica

Il workflow `.github/workflows/release.yml` compila sui runner nativi di GitHub e allega i pacchetti direttamente a una GitHub Release.

Può essere avviato dalla scheda Actions oppure tramite un tag coerente con la versione dell'app, ad esempio `v1.1.2`.
