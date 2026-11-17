---
data: 2026-11-17 20:35
tipo: quaderno della regista
stima_usd: 65
tetto_usd: 75
---

# Onda 8b: le correzioni già scritte

## In parole semplici
Sono 25 difetti piccoli che un riparatore di un'onda passata aveva già studiato, scrivendo cosa cambiare. Non li aveva potuti toccare perché il file era di un'altra sessione. Adesso li applicano 2 riparatori, poi c'è il collaudo. Nicola l'ha chiesto alle 20:28: «non riesci ad aggiungere in questa sessione i 27 con la correzione già scritta».

## Cosa cambia per te
Niente fino alla PR del sito, che sarà insieme a quella dell'onda 8.

## Cosa devi fare
Niente.

## Cosa non ho verificato
Che le correzioni scritte siano ancora giuste sul codice di oggi: 88 delle 95 modifiche sono descritte a parole, non come diff. Il riparatore le rilegge sul codice vero.

---

## Dettagli tecnici
- 27 dell'elenco B di `pronte` (onde 1-5), meno 2 con file in comune con l'onda 8 (`lib/queries/griglia-prodotti.ts` e `app/product/[id]/page.tsx`, di R02 dell'onda 8): vanno all'onda 9. Restano 25 (`chiavi-B.txt`).
- Le correzioni scritte, voce per voce: `correzioni-scritte.json` (referto, id, nota, modifiche file per file).
- Base `522cfb01` (main dopo mycity#295). `dividi --sessioni 2 --per-sessione 13`: R01 ai-endpoints 13, R02 api-backend 12. Nessun file in comune con R01-R03 dell'onda 8. Rami `ccr-30918361-coyajm-o8b-mNN`. Si uniscono nell'integrazione `ccr-30918361-coyajm-o8` dell'onda 8.
- Collaudo: lo stesso collaudatore dell'onda 8, oppure uno suo. Il controllore dell'onda 8 guarda anche questi.
- 20:15 aperti R01 `session_015BmpnYRBGAQ3sBM96pErCE` e R02 `session_015BmpnZ1MKqYmXxKyhgoX9C` (limite `allowed_warning`, regia 24,04 $).
