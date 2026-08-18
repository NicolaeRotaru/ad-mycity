# PR #760 — NicolaeRotaru/ad-mycity

## In parole semplici
A volte il programma che fa girare la macchina (il "worker") parte due volte insieme per errore.
Le due copie lavorano sugli stessi file di memoria senza saperlo l'una dell'altra. Stanotte è
successo davvero: due copie accese insieme hanno riempito la memoria di 2.169 righe vuote in poche
ore. Questa modifica mette un lucchetto: se una copia è già accesa, la seconda si ferma subito.

## Cosa cambia per te
Niente sul sito o sui negozi. È una correzione interna che rende il lavoro automatico più
affidabile.

## Cosa devi fare
Vai sul Pannello e, quando vuoi, approva il merge di questa PR. Finché non la approvi, resta in
attesa.

## Cosa non ho verificato
Non ho ancora visto il lucchetto scattare dal vivo su una doppia partenza reale in produzione.
L'ho verificato solo leggendo il codice, non facendolo girare per davvero.

## 🔧 Dettagli tecnici
- **Repo:** NicolaeRotaru/ad-mycity
- **Branch:** `fix/worker-lock-istanza-singola` → `main`
- **URL:** https://github.com/NicolaeRotaru/ad-mycity/pull/760
- **Titolo:** fix(worker): lucchetto di istanza singola su worker.sh
- **Creato:** 2026-08-18 05:00 (Europe/Rome)

## Merge
🔴 **Non mergeare da solo.** Nicola approva dal Pannello → `node cervello/git-merge.mjs --repo ad-mycity --pr 760`

## Anteprima
Vercel Preview se configurato sul repo ad-mycity.
