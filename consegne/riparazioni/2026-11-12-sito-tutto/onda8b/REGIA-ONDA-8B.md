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
- 20:25 I riparatori hanno visto che quasi ogni correzione scritta sta in file che non erano loro (la divisione guardava solo i file della voce, non quelli della correzione: errore della regia, il modo giusto era `dividi --file-chiavi` con i file che servono). Corretto a mano in `piano.json`: aggiunti a R01 23 file e a R02 27 file presi dalle correzioni scritte, solo quelli esistenti sulla base e senza padrone nelle onde 8 e 8b (6 restano in scontro: serve_file_altrui). Schede rifatte, `copertura-prima` e `segnaposti` verdi.
- 20:58 R02 consegnato (`ddd5f67c`, testa `92094312`, 25,80 $): 3 riparati (003, 005, 010), 2 parziali, 2 già riparati, 2 serve_file_altrui (prove esistenti da cancellare o spostare: per l'onda 9), 3 non_fatto (migrazione, privacy, ritiro spento). Guardia e referto verdi. Si apre K01 dell'8b su R02.
- 21:20 R01 consegnato (`67309f42`, testa `061508ce`, 21,26 $): 8 riparati, 2 già riparati, 2 serve_file_altrui, 1 non_fatto (migrazione e permessi). Guardia, referto e `prova-unione` dell'8b verdi. Aggiunto a K01 (tetto 14 $), R01-013 con due lenti perché tocca l'accesso admin.
- 21:29 K01 finito (`28171b82`, `valida-collaudo` verde). Reggono: R01-003, 005, 008, 009, 010, 011, 012 e R02-003, 005 (9); già riparati che reggono R01-001, R02-001, R02-006. Parziali: R01-004 (era già riparato: va coi delicati), R01-013 (l'accesso admin regge, resta app/sell), R02-002, 004, 010. Nessun rompe_altro. Uniti nell'integrazione `ccr-30918361-coyajm-o8` @ `7f59df78` (referti di lavoro tolti prima). Controllore C01 unico per 8 e 8b.
