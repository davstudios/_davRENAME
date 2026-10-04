# Build notes — _davRENAME v26.10.3

La codebase è predisposta per Windows, macOS e Linux.

## Verifiche eseguite

- test automatici complessivi: 28/28 PASS
- sintassi JavaScript: OK
- configurazioni JSON: valide
- workflow GitHub release: YAML valido
- audit commenti nei sorgenti: PASS
- motore di rinomina e backend funzionale preservati; modifiche limitate a UI/motion, packaging e documentazione

## Release metadata

Questa release adotta lo standard package `_davstudios`: licenza MIT, publisher, homepage, copyright, descrizioni del pacchetto e metadata Linux DEB sono dichiarati nella configurazione bundle.

## GitHub Release description

Il workflow legge la Description bilingue dal commit associato al tag. Prima della pubblicazione sono obbligatorie entrambe le sezioni `🇮🇹` e `🇺🇸`.

## Unsigned distribution

I pacchetti Windows e macOS sono distribuiti senza un certificato commerciale Windows trusted e senza Apple Developer ID/notarizzazione. Il README documenta i flussi previsti per SmartScreen e Gatekeeper.

## Output della pipeline

- Windows: NSIS `.exe`
- macOS: DMG Universal Intel + Apple Silicon
- Linux: AppImage e `.deb`

## Limite dell'ambiente di generazione

Rust/Cargo e le dipendenze frontend installate non sono disponibili nell'ambiente usato per preparare questo archivio, quindi qui non è stato compilato il bundle Tauri nativo. I test Node e le validazioni statiche sono stati eseguiti localmente; GitHub Actions installa le dipendenze e compila i bundle sui runner Windows, macOS e Linux.


## Final polish v52

Il motion system segue il riferimento del sito `_davstudios` v52. Le build Windows Release usano il GUI subsystem per evitare una finestra console separata; le build debug mantengono il comportamento utile allo sviluppo. La versione non viene mostrata nell’interfaccia ordinaria.
