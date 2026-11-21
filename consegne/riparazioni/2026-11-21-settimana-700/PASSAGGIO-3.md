---
data: 2026-11-21 23:20
tipo: passaggio di regia
da: «Settimana dei 700 · regia seconda», session_015BmpnWf7s8MAmqD6Xbh5ap (250 mila token, soglia raggiunta)
a: la regia terza della settimana dei 700
---

# Settimana dei 700: il passaggio alla regia terza

## In parole semplici
Questo foglio serve alla regia terza per riprendere la settimana dei 700 senza rileggere la chat.
Nicola ha detto sì: si parte con le 182 voci semplici, con la strategia preparata. Sono 12 sessioni da 16 voci, ultracode spento, circa 370 $.
Le delicate restano ferme finché Nicola non dice sì al loro costo (circa 17 $ a chiusa).
Nessun riparatore è ancora aperto.

## Cosa cambia per te
Niente sul sito finché i riparatori non consegnano. Per esempio: la prima sessione, R01, lavora 16 voci sul suo ramo `-m01`, e il sito cambia solo quando Nicola unisce.

## Cosa non ho verificato
- Le schede e `copertura-prima` della cartella `normali/` non sono ancora state scritte.
- Il deposito di ad-mycity è pubblico: la richiesta all'indirizzo pubblico di GitHub risponde 200.

## Cosa devi fare
1. Leggi la skill `riparazione`, `REGIA.md` e questo foglio. I dettagli delle voci riservate te li mando in chat: non vanno mai nel deposito.
2. Iscriviti alla PR ad-mycity#990 (`subscribe_pr_activity`): io mi tolgo.
3. In `consegne/riparazioni/2026-11-21-settimana-700/normali/`: `schede --ramo claude/settimana-700-regia --regista <il tuo id>`, poi `copertura-prima` e `segnaposti`, tutti verdi. Commit e push: lo SHA è `SHA_REGISTA`.
4. Apri R01-R12 sul sito (base `1ad51b4c`, rami `claude/settimana-700-regia-m01`…`-m12`), senza ultracode, `effort: "xhigh"`, `permission_mode: "auto"`, con LEGGIMI-riparatore e scheda per intero nel primo messaggio. Poi la sorveglianza. Poi 4 collaudatori, uno ogni 3 riparatori. Poi il controllore, come dice la skill.
5. Tetto di questo giro: 480 $ (il massimo della forchetta). Oltre, ci si ferma e si dice a Nicola.
6. Passa la mano a 250 mila token, con un foglio come questo.

---

## Dettagli tecnici

### Le scelte di Nicola (21/11 23:15 circa, in chat con la regia seconda)
- Riservatezza dei rami: «scegli tu». Scelta della regia: strada b (cancellare i rami laterali, unire la #990 compressa e poi cancellare il ramo). Dalla sessione la cancellazione è rifiutata (403 del proxy, nessuno strumento GitHub per cancellare un ramo): i rami `claude/settimana-700-regia-s01`, `-s01b`, `-s01c`, `-s01d` e `-cf` li cancella Nicola dalla pagina dei rami su GitHub. Il ramo `-cf` contiene anche il commit `7353225`.
- Preventivo: «inizia con le 182 semplici, mantenendo la strategia che hai creato».
- Ha chiesto se può unire la «PR 998»: non esiste né in ad-mycity né in mycity. Probabilmente intendeva la #990: è in bozza e porta preparazione e ricontrollo. Si unisce dopo la #988, compressa, poi si cancella il ramo.

### Numeri
- Registro del sito: 632 aperti · 463 lavorabili · normali 182 (onda 1: 150 voci in 12 sessioni, 32 alle onde dopo) · delicati 281 (fermi).
- Spesa della settimana: circa 130 $ prima della regia seconda, più 5,08 $ della regia seconda.
- Quota: `allowed`, rinnovo il 26/11.
