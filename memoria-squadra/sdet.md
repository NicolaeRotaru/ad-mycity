---
tipo: quaderno-memoria
reparto: sdet
bootstrap: 2026-07-14 02:31
---

# 🧠 Quaderno di sdet
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro 🟡/🔴.
> Formato: AAAA-MM-GG · contesto · scorecard 6 assi · atteso→reale · #tag

## Esiti
- 2026-07-19 18:44 · CI spiegata + merge #214 — Nicola «mangiato 214 prima 215» + «A cosa serve la CI?» · atteso: rassicurazione + spiegazione semplice · reale: ordine invertito ok; CI = collaudo pre-deploy; #215 ancora pendente per unit verdi · L-314 · #ci #merge-order #esito
- 2026-07-19 18:40 · CI PR #215 — Nicola «Prepara la pr» · atteso: PR fix unit su main + suite verde · reale: migration 107 + mock Stripe fix → **715/715** locale → **PR #215** accodata (#195); merge prima di #214 · L-313 · #ci #unit-test #pr-215 #esito
- 2026-07-19 18:38 · CI PR #214 — Nicola «Tu riesci a lavorare con CI?» · atteso: diagnosi check + impatto merge · reale: E2E+integration ✅; unit ❌ pre-esistenti su main (migration 107 duplicata + mock Stripe, 13/715); PR #214 mergeable; fix CI main = PR separata offerta · L-311 · #ci #unit-test #pr-214 #esito
