---
data: 2026-11-17 17:50
tipo: quaderno della regista
stima_usd: 140
tetto_usd: 170
---

# Onda 7: il quaderno della regista

## In parole semplici
L'onda 7 ripara 52 difetti piccoli del sito mai tentati, in 4 sessioni da 13. Prima chiude il lavoro già pagato dell'onda 6: 6 riparazioni da collaudare e una che regge già.

## Cosa cambia per te
Niente finché la PR del sito non è pronta: quello che spetta a Nicola sarà scritto lì.

## Cosa devi fare
Niente. Nicola ha dato il via alle 17:38.

## Cosa non ho verificato
Quante voci reggeranno: lo dicono il collaudo e il controllore.

---

## Dettagli tecnici

### Chi
- Regia: la chat dell'AD «Ondata 7 difetti» `session_015BmpnWeHkst12TRwrzmMfw`. Ramo ad-mycity `ccr-30918361-coyajm`, ramo di integrazione sul sito `ccr-30918361-coyajm`.
- Avanzi dell'onda 6 passati dalla regista O5 `session_015BmpnYvNwUpgfdhaKx9PKT` alle 17:41.

### Il limite
`allowed_warning` alle 17:45, nessun extra, si azzera giovedì 19/11 alle 10:00. Nicola sceglie di partire lo stesso. Prima di ogni apertura si rilegge `rate_limit_info`: con `rejected` o uso extra ci si ferma.

### Il sito
- main `c83c3e4e6decc5c167bd0cefceb269364f388cd0` (#294).
- Integrazione `ccr-30918361-coyajm` @ `bc36f48120ec38bf20880c7d68b3171015744681` = main + `-o6` (d312818b, R01 cucitura con R33-022) + `-o6-m03` (0eaca5c7) + `-o6-m02` ricopiato (3f76cf43 diventa 2207f8e0, messaggio senza «R07-009»; contenuto identico a ee2988ad).

### Passo 0 (cartella `onda6/`)
- K02 collauda R02-001, R02-002, R03-001, R03-003, R03-004, R03-009 sui rami `-o6-m02` e `-o6-m03`. Ramo `ccr-30918361-coyajm-o6-k02`, tetto 5 $.
- Poi C01 (`onda6/controlli/C01.json`) sulla testa `bc36f481`, tetto 6 $.
- R01-011 regge (K01): si chiude dopo l'unione della PR del sito.
- Fuori: R03-006 (serve la rigenerazione di `lib/database.types.ts`), R03-002 e 005 (manca codice sulla base), le parziali R01.

### Onda 7 (cartella `onda7/`)
- Candidate 64 (`chiavi-onda7.txt`): 49 rimandate dall'onda 6 + 15 mai iniziate (R02-003…012, R03-007/008/010/011/012 dell'onda 6). Tutte minori.
- `dividi --sessioni 4 --per-sessione 13`: R01 accessibilità (13), R02 architettura (13), R03 flussi-conversione (13), R04 frontend-ux (13). 12 all'onda dopo. `copertura-prima` e `segnaposti` verdi.
- Riparatori: Opus, effort xhigh, senza ultracode, al massimo 6 subagenti, niente Workflow. Consegna verso i 24 $, tetto 28 $. Rami `ccr-30918361-coyajm-mNN`.
- Collaudo: K01 per R01+R02, K02 per R03+R04, ognuno sui 26 minori senza campione. Ramo `ccr-30918361-coyajm-kNN`, tetto 13 $.
- Controllore C01 di `onda7/` sulla testa unita finale, tetto 6 $. Poi la PR del sito.

### Il tetto
Atteso 140 $, tetto 170 $: riparatori 96-112 $, collaudi 26 $, passo 0 11 $, controllori 12 $, regia 20 $. Cancello: stop sopra i 12 $ a chiuso.

### Stato
- 17:50 cartella `onda7/` pronta, decisione in DECISIONI e bacheca.
- 17:48 aperte, senza nessuna richiesta a Nicola: K02 dell'onda 6 `session_015BmpnYbF1A4qxsRXWWgoeH` (ramo `ccr-30918361-coyajm-o6-k02`), R01 `session_015BmpnYgRJ2nThdqp4z1F41`, R02 `session_015BmpnWpKkj3VXdnrdtAc4b`, R03 `session_015BmpnZ6MiCTaF52P9H1E5L`, R04 `session_015BmpnWQtM3nnP4b4XgAfEj`. Limite `allowed_warning`. Regia a 229 mila token e 1,78 $: resta qui oltre i 250 mila, perché una regia nuova in ad-mycity farebbe chiedere conferma a Nicola a ogni apertura (guardia `pre-scrittura.mjs`).
