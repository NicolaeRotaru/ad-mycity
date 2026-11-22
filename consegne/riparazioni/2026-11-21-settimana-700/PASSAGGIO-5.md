---
data: 2026-11-22 02:20
tipo: passaggio di regia
da: «Settimana dei 700 · regia quarta», session_015BmpnZUFb1f4oPiVC94n2Z (360 mila token, 10,61 $)
a: la regia quinta della settimana dei 700
---

# Settimana dei 700: il passaggio alla regia quinta

## In parole semplici
Tutti e 12 i riparatori hanno finito, e i 4 collaudatori sono aperti.
Tre collaudi sono finiti: K01, K02 e K03. Le voci bocciate sono tornate ai riparatori per un solo giro di correzione.
Mancano i secondi collaudi, il collaudo K04 e poi l'unione del giro.

## Cosa non ho verificato
- La spesa vera di tutte le figlie: i costi qui sotto vengono dai loro messaggi.
- `prova-unione` non l'ho guardata nel dettaglio.

## Cosa devi fare
1. Leggi la skill `riparazione` (regole del 21/11, sorveglianza, F2, F3), `REGIA.md` e questo foglio. I dettagli riservati te li mando in chat: mai nel deposito.
2. Aggiungi il sito con `add_repo` (accesso push) e clonalo in `/home/user/mycity`. Per i rami del sito usa il refspec esplicito (`git fetch origin +refs/heads/<ramo>:refs/remotes/origin/<ramo>`): il clone è a ramo singolo.
3. Sorveglianza: `send_later` ogni 30 minuti con `bash cervello/riparazione/sorveglia.sh consegne/riparazioni/2026-11-21-settimana-700/normali 1` (con `MARKETPLACE_REPO=/home/user/mycity`). L'ultima l'ho fatta io alle 02:19, la prossima la metti tu.
4. Quando un riparatore chiude il giro: guardia-ramo e valida-referto rilanciati da te, poi le nuove punte al suo collaudatore (che è rimasto acceso).
5. Quando tutti i collaudi sono chiusi: le firme di Nicola in `piano.json`, poi l'unione F3, il controllore C01, la fermata 2 a Nicola. Nicola parla direttamente con la regia.
6. Passa la mano a 250 mila token (il `get_session` parte già da circa 155 mila).

---

## Dettagli tecnici

### Stato alle 02:19
| Riparatore | Collaudo | Stato |
|---|---|---|
| R01 | K01 | giro di correzione su 006 (pulsante reclamo: si nasconde solo con reclamo aperto) e 011 |
| R02 | K02 | giro chiuso tranne l'ultimo commit: togliere il blocco di 120 s dell'avvio (scelta della regia). Referto rosso finché non lo aggiorna |
| R03 | K04 | finito; valida-referto rosso solo per R03-007 (commit 3cc4248 non lo cita). Si chiude con la firma su quel commit, o al giro di correzione |
| R04 | K02 | giro su 010 (carosello storie) in corso; referto rosso finché non lo aggiorna |
| R05 | K02 | giro chiuso (punta 00ea2092), dato a K02 |
| R06 | K01 | niente da correggere |
| R07 | K03 | giro chiuso e ricollaudato: campione accettato, 5 su 5 |
| R08 | K03 | giro su 001, 010, 006, 003 in corso (tetto 30 $) |
| R09 | K03 | giro su 006 e 008 in corso |
| R10 | K04 | finito sul ramo **-m10b** (punta 9b0efd5d, testa 38a1e1ac), dato a K04 dopo R03 e R12. Il ramo -m10 ha un nodo di unione e non conta |
| R11 | K01 | giro su 005, 007, 009, 010, 011, 012 in corso |
| R12 | K04 | finito (punta bfe3ab52), dato a K04 |

Collaudatori: K01 `session_015BmpnZJMmhSXcaKQETZNYW`, K02 `session_015BmpnYUXgLn9X8WCXzQuCh`, K03 `session_015BmpnWZt6PfWs9rdjLvNP4`, K04 `session_015BmpnYNfhenQ3yW7EJHG96`. Tutti in `normali/sessioni.json`; i referti K01, K02, K03 copiati in `normali/collaudi/`.

### Firme da chiedere a Nicola (chieste in chat il 22/11 verso le 01:55, risposta non ancora arrivata)
- `prove_comuni` onda 1, solo per due file: `tests/unit/cercare-per-pertinenza-non-e-ordinare-per-data.test.ts` (R11) e `tests/unit/minori-s02-freno-della-veloce.test.ts` (R09). Cambiano un'attesa che fissava il difetto; la firma a del 21/11 copre solo l'aggiunta di casi. Frase attesa: «firmo le due prove».
- `rimessa_a_mano` per R04-005 e R04-009 (voci di sole prove).
- `id_nel_commit` sul commit intero di 3cc4248 se R03-006 e R03-007 reggono al collaudo K04.

### Altro per Nicola, ancora aperto
- Il via alla sessione riservata (tetto 25 $).
- Cancellare su GitHub i rami `claude/settimana-700-regia-s01`, `-s01b`, `-s01c`, `-s01d`, `-cf` (contengono dettagli riservati), e più avanti `-m10`.
- Le migrazioni nuove, nessuna applicata: 640 (R02), 660 e 661 (R04), 701 e 702 (R08), più la colonna in fascia 641-649 per la cura intera di R02-004.
- Domande di prodotto da portare alla fermata, nei referti: R06 (quattro scelte, fra cui il ritiro in negozio), R11 (foto finte di placehold.co, schermate dell'installazione), R03-010 (servizio delle coordinate), R07-005 (anteprime da approvare), R08 (voto medio e altre tre), R09-001 e R09-007, R05-010/013/014, R12 (passi della scala del testo), R01-006 (pulsante reclamo).

### Da fare all'unione F3
- R08-009: `git mv` della prova zz-collaudo (guardia la legge come cancellazione), lo fa la regia.
- Le modifiche ai file altrui scritte nei referti (`serve_file_altrui`) vanno al giro di correzione dopo l'unione, con `dividi --base <integrazione> --file-chiavi`.
- Proposta di R06: mettere il nome della campagna nei nomi delle prove (`riparazione-r06-<tema>` si scontra con prove di campagne passate).

### Decisioni prese da Nicola in questa regia
- 2026-11-22 01:55 «sì a R10» (spinta forzata): la guardia automatica della sessione R10 l'ha rifiutata lo stesso. Strada presa: ramo nuovo -m10b, senza forzare.
