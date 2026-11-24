---
data: 2026-11-22 01:12
tipo: passaggio di regia
da: «Settimana dei 700 · regia terza», session_015BmpnZUjbtZs5V56c5GPWN (303 mila token, 12,16 $)
a: la regia quarta della settimana dei 700
---

# Settimana dei 700: il passaggio alla regia quarta

## In parole semplici
I 12 riparatori delle voci semplici sono al lavoro dalle 00:25 circa. Tre hanno finito (R01, R06, R11) e il loro collaudo K01 è appena partito.
Dai piani ho tolto 11 voci: 10 delicate (soldi, permessi, dati personali, annulli) vanno all'onda dei delicati, una (ritiro in negozio, quarto giro) va a Nicola.
Per esempio: il ritiro in negozio non lo ripara nessun riparatore, perché prima serve una scelta di Nicola.

## Cosa cambia per te
Per Nicola: niente finché non unisce la richiesta del sito.
Per la regia quarta: prende la sorveglianza dei 12 riparatori e dei collaudi.

## Cosa non ho verificato
- Il costo delle figlie: alle 01:10 non lo mostravano ancora. Tetto del giro 480 $.
- `prova-unione` non l'ho ancora lanciata.

## Cosa devi fare
1. Leggi la skill `riparazione`, `REGIA.md` e questo foglio. I dettagli riservati te li mando in chat: mai nel deposito.
2. Iscriviti alla PR ad-mycity#990 (`subscribe_pr_activity`).
3. Sorveglianza: `send_later` ogni 30 minuti con `bash cervello/riparazione/sorveglia.sh consegne/riparazioni/2026-11-21-settimana-700/normali 1` (con `MARKETPLACE_REPO=/home/user/mycity`). Il sito va clonato in `/home/user/mycity` (add_repo push). La sorveglianza delle 00:09 era l'ultima mia: la prossima la metti tu.
4. Collaudatori: K01 aperto (R01, R06, R11). K02, K03, K04 appena finiscono altri tre riparatori ciascuno (stesso prompt di K01, vedi `normali/sessioni.json`).
5. Poi l'unione F3, il controllore C01, la fermata 2 a Nicola tramite l'AD/chat diretta (Nicola parla con la regia).
6. Passa la mano a 250 mila token.

---

## Dettagli tecnici

### Rossi aperti alle 01:10
- R03: `valida-referto` rosso, il commit 3cc4248 non cita R03-007. Mandato a R03 di sistemare il referto.
- R12: guardia rossa su due prove comuni (riparazione-r02-piede-280, riparazione-r15-col-testo-grande…). Mandato a R12: ripristino, o serve_file_altrui.
- R09: guardia rossa su `tests/unit/minori-s02-freno-della-veloce.test.ts`: deroga della regia (la prova fissava il difetto di R09-006). Da accettare all'unione.
- R11: guardia rossa su `tests/unit/cercare-per-pertinenza-non-e-ordinare-per-data.test.ts`: deroga della regia (+1 attesa per R11-009).

### Voci tolte dai piani (non_fatto, all'onda dei delicati)
R01-010, R03-005, R03-016, R04-008, R05-004, R06-010, R07-008, R08-002, R09-010, R10-002. A Nicola: R06-008 (ritiro in negozio).

### Finiti
- R01: 4 riparati · 4 serve_file_altrui · 1 già · 1 parziale · 1 non_fatto · 12,00 $ · punta bed546a4, testa ad49df0d.
- R06: finito, punta 770ebfcd, testa 0968f181.
- R11: 7 riparati · 2 già · 1 parziale · 2 serve_file_altrui · 5,27 $ · punta 7bc4a923, testa 546959a8.

### Domande per Nicola (da portare alla fermata)
- R11: togliere placehold.co da tutti e cinque i file (dopo aver guardato se il database vero ha prodotti con quelle foto)? Chi fa le due schermate dell'installazione?
- R06-008: ritiro in negozio, quarto giro.
- Ancora aperti da prima: unire la #990 (squash, senza cancellare il ramo), cancellare i rami -s01, -s01b, -s01c, -s01d, -cf, il via alla sessione riservata (tetto 25 $).
