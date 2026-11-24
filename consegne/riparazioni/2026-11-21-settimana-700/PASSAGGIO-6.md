---
data: 2026-11-22 04:35
tipo: passaggio di regia
da: «Settimana dei 700 · regia quinta», session_015BmpnXD1kFQo49GpQXkHw9 (309 mila token di storia su 1 milione, 6,14 $)
a: la regia sesta della settimana dei 700
---

# Settimana dei 700: il passaggio alla regia sesta

## In parole semplici
Questo foglio serve alla regia che chiude la riparazione delle voci semplici del sito.
Tutti i riparatori, 12 su 12, hanno chiuso il loro unico giro di correzione.
Tre collaudatori su quattro hanno chiuso anche il secondo collaudo: manca solo K04, che è a metà.
Un esempio: K01 ha ricontrollato 19 voci di R01, R06 e R11; 12 reggono, 4 sono a metà, 3 hanno fatto nascere un difetto piccolo.

## Cosa cambia per te
Per Nicola: niente sul sito vero finché non unisce lui. Restano da dare tre firme, elencate in fondo.
Per la regia sesta: si aspetta K04, poi si fa l'unione. Nessun riparatore è da riaprire.

## Cosa devi fare
- Leggi la skill `riparazione` (regole del 21/11, sorveglianza, F2, F3), `REGIA.md` e questo foglio. I dettagli riservati te li mando in chat: mai nel deposito.
- Aggiungi il sito con `add_repo` (accesso push) e clonalo in `/home/user/mycity`. I rami del sito si prendono col refspec esplicito: `git fetch origin +refs/heads/<ramo>:refs/remotes/origin/<ramo>`.
- Sorveglianza: `send_later` ogni 30 minuti con `MARKETPLACE_REPO=/home/user/mycity bash cervello/riparazione/sorveglia.sh consegne/riparazioni/2026-11-21-settimana-700/normali 1`. L'ultima l'ho fatta io alle 04:34; la catena l'ho fermata, la riparti tu.
- Quando K04 finisce: valida-collaudo rilanciato da te. Poi le firme di Nicola in `piano.json`, l'unione F3, il controllore C01 e la fermata 2 a Nicola.
- Passa la mano quando la storia arriva a 250 mila token su 1 milione. Il `get_session` parte già da circa 155 mila token, solo per le istruzioni.

## Cosa non ho verificato
- Le prove del codice dei riparatori: ho rilanciato guardia-ramo e valida-referto, non `npm run verify`.
- La spesa delle figlie: viene dai loro messaggi.

---

## Dettagli tecnici

### Stato alle 04:34
| Riparatore | Punta | Testa | Collaudo |
|---|---|---|---|
| R01 | f613e7e9 | f5836cc5 | K01 chiuso |
| R02 | b14dc117 | 23e86543 | K02 chiuso |
| R03 | 78780a17 | bfc33235 | K04 in corso (giro 2) |
| R04 | 7c615948 | 38baad8c | K02 chiuso |
| R05 | 00ea2092 | 89ef220e | K02 chiuso |
| R06 | 770ebfcd | 0968f181 | K01 chiuso |
| R07 | c9a78a95 | fc48cfd4 | K03 chiuso |
| R08 | 89b32b32 | 509ada50 | K03 chiuso |
| R09 | 0c113a4c | 3e36a739 | K03 chiuso |
| R10 | 5a567d4d (ramo -m10b) | 502ba692 | K04 in corso (giro 2) |
| R11 | a3a44907 | 7735a55c | K01 chiuso |
| R12 | 6a7672a8 | 16fc7e09 | K04 in corso (giro 2) |

Collaudi: K01 f0fd9a6, K02 8515188 (ramo -k02), K03 071367f: valida-collaudo verde, rilanciato dalla regia. K04 bozza spinta sul ramo -k04.

### Cadute due volte (restano aperte con la nota, terzo giro solo con Nicola)
R09-008 (copie su B2 con la barra iniziale), R11-012/007 e R11-005 (rompe altro, minori), R10-010 (rompe altro: «Il resto è salvato» prima del salvataggio), R10-014 (percorsi Facebook). Le altre di R03 e R12 le dice K04.

### Rossi noti e accettati
- R09, R11: guardia rossa sulle due prove comuni. Serve la firma «firmo le due prove».
- K02: guardia rossa per un file del sorvegliante nella storia del ramo. Il diff netto da 12fa1dde contiene solo K02.json; il ramo non si unisce. Accettato dalla regia (04:10).

### Firme da chiedere a Nicola (chieste, risposta non arrivata)
- `prove_comuni` onda 1 per due file: `tests/unit/cercare-per-pertinenza-non-e-ordinare-per-data.test.ts` (R11) e `tests/unit/minori-s02-freno-della-veloce.test.ts` (R09). Frase attesa: «firmo le due prove».
- `rimessa_a_mano` per R04-005, R04-009 e R04-010.
- `id_nel_commit` su 3cc4248: non serve più, R03 ha rifatto i commit separati.

### Altro per Nicola
- Il via alla sessione riservata (tetto 25 $). Cancellare su GitHub i rami `-s01`, `-s01b`, `-s01c`, `-s01d`, `-cf`, e più avanti `-m10`.
- Migrazioni nuove, nessuna applicata: 640 (R02), 660, 661 e 662 (R04), 701 e 702 (R08), più la colonna nella fascia 641-649 per R02-004.
- Testo di R08 per il GLOSSARIO-KPI (file di Nicola: va proposto), è nel referto R08.
- Domande di prodotto nei referti: R06, R11, R03-010, R07-005, R08, R09-001/007, R09-006 (attesa di circa 35 min e vendita persa se expire trattiene lo scaduto), R05-010/013/014, R12-014, R01-006.

### Da fare all'unione F3
- R08-009: `git mv` della prova zz-collaudo, lo fa la regia.
- I `serve_file_altrui` vanno al giro di correzione dopo l'unione, con `dividi --base <integrazione> --file-chiavi`.
- Prova comune di R11: il caso tolto era giusto. Va insegnato `or=(id.not.in…)` al finto in `tests/unit/aiuti/finto-postgrest.ts:125`, e il caso va rimesso.
- Proposta di R06: il nome della campagna nei nomi delle prove.
- Segnalato da K01 per la macchina: SendMessage non è sorvegliato da nessuna guardia. È un lavoro sulla macchina, quindi vuole la firma di Nicola.
