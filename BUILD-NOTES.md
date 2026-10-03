# Build notes — _davRENAME v26.10.2

La codebase è predisposta per Windows, macOS e Linux.

## Verifiche eseguite

- test automatici complessivi: 25/25 PASS
- sintassi JavaScript: OK
- configurazioni JSON: valide
- workflow GitHub release: YAML valido
- audit commenti nei sorgenti: PASS
- confronto dei sorgenti funzionali con il pacchetto precedente: nessuna modifica

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

Rust/Cargo non è installato nell'ambiente usato per preparare questo archivio, quindi qui non sono stati prodotti installer nativi. È stato tentato anche un `npm ci` pulito, ma l'installazione ha superato il timeout disponibile; la directory parziale `node_modules` è stata rimossa dall'archivio. La pipeline GitHub inclusa installa le dipendenze, esegue i test e compila i bundle sui runner nativi.

