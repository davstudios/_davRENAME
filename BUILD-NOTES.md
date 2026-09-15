# Build notes — _davRENAME v1.1.0

La codebase è predisposta per Windows, macOS e Linux.

## Verifiche eseguite

- sintassi JavaScript: OK
- test automatici complessivi: 19/19 PASS
- audit commenti nei sorgenti JS/CSS/Rust/HTML: PASS
- configurazioni JSON: valide
- icone PNG/ICO/ICNS: presenti
- workflow GitHub release: presente

## Limite dell'ambiente di generazione

Rust/Cargo non è installato nell'ambiente usato per preparare questo archivio, quindi qui non sono stati prodotti installer nativi. L'installazione npm ha inoltre superato il timeout disponibile, quindi la build Vite completa non è stata rieseguita in questo ambiente. La pipeline GitHub inclusa installa le dipendenze, esegue i test e compila i bundle sui runner nativi.

## Output della pipeline

- Windows: NSIS `.exe`
- macOS: DMG Universal Intel + Apple Silicon
- Linux: AppImage e `.deb`

Per una distribuzione pubblica senza avvisi di sistema è consigliato configurare code signing Windows e Developer ID + notarizzazione macOS.
