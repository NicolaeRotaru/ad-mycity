---
data: 2026-11-17 20:20
tipo: quaderno della regista
stima_usd: 600
tetto_usd: 650
partenza: 2026-11-19 10:05
---

# Onda 9: il quaderno della regista

## In parole semplici
L'onda 9 ripara 200 difetti piccoli del sito con 10 riparatori. L'ordine l'ha scelto Nicola: prima quelli già pagati, poi quelli con la correzione già scritta, poi quelli che nessuno ha mai raggiunto, poi i mai tentati e i lasciati a metà. Nessuno tocca soldi, dati personali o permessi. Parte giovedì 19/11 alle 10:05, quando il limite settimanale si è azzerato.

## Cosa cambia per te
Niente fino alla PR del sito.

## Cosa devi fare
Niente: Nicola ha detto «fai così» alle 20:12 del 17/11.

## Cosa non ho verificato
Che il codice di ogni voce ci sia ancora: lo controlla il riparatore prima di spenderci.

---

## Dettagli tecnici

### L'elenco (`chiavi-onda9.txt`, gruppi in `gruppi-onda9.json`)
Calcolato il 17/11 alle 20:15 sulla base `522cfb01` (main dopo mycity#295) dai minori lavorabili (528), fuori le 42 dell'onda 8.
1. A, collaudo e basta: 5 (elenco A di `pronte`).
2. B, correzione già scritta nei referti: 27 (elenco B di `pronte`).
3. Mai raggiunti (ultimo esito non_fatto o senza referto): 49.
4. C, parziali con file altrui: 8.
5. Mai tentati: 77.
6. Parziali: 34.
Fuori: 83 delicati mai tentati (pagamenti, accessi, permessi, privacy, dati, migrazioni, o file come stripe, payout, checkout, webhook, cassa), le riservate e quelle con una domanda per Nicola. Il programma che ha fatto l'elenco: `onda9/scelta-onda9.mjs` (argomento: il perimetro dei minori, `perimetro --gravita minore` in una cartella di prova).

### Il giro di giovedì
1. `get_session`: il limite deve essere `allowed` (azzerato).
2. Rifare l'elenco sulla base di quel momento (main dopo l'onda 8): `node consegne/riparazioni/2026-11-12-sito-tutto/onda9/scelta-onda9.mjs <perimetro.json>`. Le voci chiuse dall'onda 8 escono da sole.
3. `perimetro --profilo scelta --file-chiavi onda9/chiavi-onda9.txt`, `dividi --sessioni 10 --per-sessione 20` per le 195 da riparare, schede con `--ramo ccr-30918361-coyajm-o9`.
4. Le 5 del gruppo A vanno a un collaudatore, senza riparatore.
5. 10 riparatori: Opus, xhigh, senza ultracode, 6 subagenti, consegna a 40 $ e tetto 45 $ per 20 voci. La spesa la legge la regia: i riparatori non la vedono.
6. 4 collaudatori, uno ogni 2-3 riparatori, aperti appena consegnano. Un controllore sul codice unito. Una PR del sito.

### Il preventivo
Circa 3 $ per voce data: 195 voci danno circa 585 $, più la regia, circa 600 $. Dentro il tetto totale di 1.200 $: le onde 6, 7 e 8 ne hanno spesi circa 325. Se regge il 50% come nell'onda 7, circa 95 difetti chiusi a circa 6 $ l'uno. Nel caso peggiore, 30%, circa 10 $. Il cancello è a 20 $ a difetto chiuso.
