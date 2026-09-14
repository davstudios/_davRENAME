# GitHub setup

## Creazione repository con GitHub Desktop

Impostare:

- Name: `_davRENAME`
- Local path: la cartella padre, ad esempio `C:\Users\_davstudios\Documents\GitHub`
- Description: `Cross-platform bulk file renamer by _davstudios.`
- Initialize this repository with a README: disattivato
- Git ignore: `None`
- License: `None`

README, `.gitignore` e licenza MIT sono già inclusi nel progetto.

Dopo la creazione, copiare il contenuto di questo progetto direttamente dentro la cartella repository `_davRENAME`, quindi creare il primo commit e pubblicare il repository su GitHub. Se il progetto deve essere open source, pubblicarlo come repository Public.

## Prima release

Dopo il push del progetto:

1. Aprire la repository su GitHub.
2. Aprire `Actions`.
3. Selezionare `Release _davRENAME`.
4. Usare `Run workflow`.
5. Attendere le tre build.
6. Aprire `Releases` per trovare gli installer pronti da scaricare.

Il workflow usa la versione presente nel progetto per creare il tag e la release, ad esempio `v1.0.0`.

In alternativa si può creare e pushare un tag `v1.0.0`, che avvierà la stessa pipeline automaticamente.
