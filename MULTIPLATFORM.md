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

Può essere avviato dalla scheda Actions oppure tramite un tag coerente con la versione dell'app, ad esempio `v26.10.1`.

## Release v26.10.1

La release adotta i metadata ufficiali `_davstudios`, la licenza MIT e il versioning `YY.M.REVISIONE`. Il workflow usa la Description bilingue del commit associato al tag come descrizione della GitHub Release e richiede entrambe le sezioni `🇮🇹` e `🇺🇸`.

Le build GitHub continuano a essere generate su runner nativi per Windows, macOS e Linux. Il workflow Linux disabilita eventuali sorgenti Microsoft non raggiungibili prima di `apt-get update`.

Le release Windows e macOS non sono ancora firmate con certificati trusted; le istruzioni per SmartScreen e Gatekeeper sono incluse nel README.
