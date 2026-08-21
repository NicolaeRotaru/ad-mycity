# PR #804 — NicolaeRotaru/ad-mycity

## In parole semplici
Un giro delle 16:33 aveva scritto una riga nuova nel "diario" che dice quale motore AI (Claude,
Groq, ecc.) la macchina usa per ogni tipo di compito — quel diario si chiama `cervello/routing.json`.
Nessuna regola di instradamento è cambiata: solo il log si allunga di una riga. Il file vive dentro
`cervello/`, quindi le tue regole lo trattano come codice e vogliono una PR invece di un commit
diretto — è per questo che questa modifica minuscola ha comunque una PR sua.

## Cosa cambia per te
Niente in produzione. È un log interno che non tocca il sito né i soldi.

## Cosa devi fare
Quando hai un minuto, approva il merge dal Pannello (comando in fondo). Non è urgente.

## 🔧 Dettagli tecnici
- **Repo:** NicolaeRotaru/ad-mycity
- **Branch:** `memoria/routing-giro-2026-08-21` → `main`
- **URL:** https://github.com/NicolaeRotaru/ad-mycity/pull/804
- **Titolo:** giro AD: aggiorna log routing modelli (2026-08-21 16:33)
- **Creato:** 2026-08-21 16:35 (Europe/Rome)

## Merge
🔴 **Non mergeare da solo.** Nicola approva dal Pannello → `node cervello/git-merge.mjs --repo ad-mycity --pr 804`

## Anteprima
Vercel Preview se configurato sul repo ad-mycity.
