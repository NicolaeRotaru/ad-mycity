---
data: 2026-11-27 00:50
tipo: passaggio della regia (settima → AD della campagna)
campagna: tutti i difetti del sito che non chiedono Nicola (26/11)
---

# Passaggio · fine della regia

## In parole semplici
La campagna è arrivata alla richiesta del sito: mycity#342, in bozza, unita con main e con tutte le prove verdi.
Non apro un'ottava regia: resta solo da guardare la CI e, dopo che Nicola unisce, scrivere le chiusure nel registro.
Per esempio: dopo l'unione si lancia `chiudi-sito` per le cartelle delle tre onde, e le 97 voci si chiudono.

## Cosa cambia per te
Le prossime mosse le fa l'AD della campagna, non una regia nuova.

## Cosa devi fare
Nicola: «ok migrazioni» sulle 9 migrazioni prima di unire, contare il catalogo per la 911, poi unire mycity#342.

## Cosa non ho verificato
La CI di GitHub sulla #342 non l'ho vista finire. K08 costa circa 10 $: non l'ho letto.

## Dettagli tecnici
- Integrazione del sito `ccr-a672a2b3-92w5w1` @ 932163a9 (onde 1+2+3, unita con main 6b3d5ff5, `.riparazione/` tolta). PR mycity#342 in bozza. La settima regia è iscritta all'attività della PR: chi la segue dopo si iscrive con `subscribe_pr_activity`.
- Dopo l'unione: `node cervello/chiudi-sito.mjs consegne/riparazioni/2026-11-26-tutti-onda{1,2,3}/frammenti --applica --pr 342 --commit <sha di unione>`, poi `conti --cartella` per onda, poi STATO, ESITO e voto (F3 punti 8-10).
- Onda 3: collaudi K07-K10 e C03 in `-onda3/`; revert in `-onda3/da-togliere.txt`; R26 dal ramo `-m26b` (copia lineare, `sessioni.json`).
- Spesa stimata circa 995 $ su 1.200; riga in `cervello/riparazione/misure.json`. Quota settimanale in avviso.
- Voci aperte da guardare: R21-001 (ripensamento rifiutato sui dolci confezionati), R27-002, R22-003 (oltre 1.000 ordini), R21-012.
