---
data: 2026-11-27 03:14
tipo: passaggio della regia (seconda → terza)
campagna: i 200 risolti del 27/11
---

# Passaggio della regia · onda 1 fra riparazione e collaudo

## In parole semplici
La regia seconda passa la mano a 353 mila token: il limite firmato il 24/11 è 400 mila.
Lo fa prima dell'unione, che è la fase più pesante.
Dei 12 riparatori dell'onda 1, 6 hanno finito e sono in collaudo; gli altri 6 stanno chiudendo, quasi tutti oltre il 70% della spesa.
Per esempio: R12 ha consegnato 2 riparati e 6 già riparati prima, e il collaudatore K01 lo sta giudicando.

## Cosa cambia per te
Niente: la regia terza riparte da qui.

## Cosa devi fare
Segui «I prossimi passi», dall'1.

## Cosa non ho verificato
Il merito delle riparazioni: lo giudicano K01-K04. I referti dei 6 ancora al lavoro non li ho visti.

## Dettagli tecnici

**Dove siamo (2026-11-27 03:14).**
- Sito: base 2ba05a74; main del sito è a 1bf83687 (mycity#344, 8 file sotto `lib/agenti/`, nessuno della campagna). Il sito NON è nel container nuovo: `add_repo` NicolaeRotaru/mycity (push), `git clone --depth 1 https://github.com/NicolaeRotaru/mycity /home/user/mycity`, poi `ln -sfn /home/user/mycity /home/user/ad-mycity/marketplace` (`deposito` lo cerca lì) e i fetch dei rami `ccr-819e0c8d-7ryjjr-mNN` con `--depth=60`, più `git fetch --depth=60 origin 2ba05a74de2e9ad96fa94178df89711923119b0e`.
- Registro del 26/11: ricrealo (comando in REGIA.md) in `<C>/registro-26-11.json` e passalo sempre con `--registro`.
- Finiti, con guardia-ramo e valida-referto (con --registro) verdi, referti in `onda1/referti/`: R03, R07, R09, R10, R11, R12.
- Collaudatori aperti (in `onda1/sessioni.json`): K01 = R11, R03, R12 · K02 = R07, R09, R10. Pieni. Partenza 74938e41 (programmi identici a SHA_REGISTA, ma con la cartella dell'onda dentro: a 0c9469a8 non c'era).
- Ancora al lavoro (spesa letta alle 03:12 con get_session per id): R01 23,66 $ su 25 (detto: chiudi, tetto 25) · R02 22,09 su 25 (chiude; gli ho detto di scrivere «verde» con la nota dei 3 casi rossi delle prove comuni) · R05 21,31 su 25 (chiude, tetto 24) · R06 18,85 su 25 (L5 fermato, due revisori, tetto 23) · R04 15,52 su 25 (V1/V2, poi L4 solo sotto 17 $) · R08 13,84 su 20 (verify in corso). Il ramo di R08 non era ancora spinto alle 03:12.
- Spesa: riparatori circa 221 $ (limiti 275), regia prima 16,37, seconda 11,06, K01-K02 appena partiti. Totale circa 250 $ sui 3.000 del tetto.

**I prossimi passi.**
1. Scrivi a R01, R02, R04, R05, R06, R08, K01, K02 che la regista adesso sei tu, col tuo id. I referti finiti e i verdetti arrivano a chi c'è scritto nel loro messaggio.
2. Riaccendi la sorveglianza muta: `bash cervello/riparazione/sorveglia.sh --attendi <C>/onda1 1` in sottofondo; i segnali già visti stanno in `onda1/rossi-noti.txt`. Per ogni «finita RNN»: copia il referto in `onda1/referti/`, guardia-ramo e valida-referto **con --registro**, poi al collaudo.
3. Collaudatori K03 e K04 per i 6 ancora al lavoro, tre a testa, come K01: `create_session` su ad-mycity alla punta della regia (programmi invariati), `outcome_branch` `ccr-819e0c8d-7ryjjr-kNN`, tag `riparazione:2026-11-27-duecento` e `onda-1-collaudatori`, effort xhigh, auto. Prompt: la riga della skill (F2) più le regole della campagna: niente ultracode; il registro del 26/11 con --registro (comando fetch+show di de5836c5); le prove comuni riportate alla base si giudicano con la nota, non sono «rompe_altro»; tetto 30 $; mai database vero, messa online o Stripe; la regista è il tuo id; le falle riservate solo in chat.
4. Unione nel ramo `ccr-819e0c8d-7ryjjr` del sito, in ordine di numero, poi le modifiche di `onda1/da-applicare-all-unione.md`, poi `npm run verify` e l'harness SQL, poi C01. Il 26/11 l'unione l'ha fatta una sessione a parte (U03): conviene anche qui, la regia resta leggera.
5. Fermata all'AD (session_015BmpnWXi7guL4RmfTAwzbU) dopo C01, con i numeri di `conti` e `applica` a vuoto. Dentro: il costo per chiusa (R03 e R09 sopra 12 $ a testa), le domande per Nicola dei referti (`domande_per_nicola`) più `per-nicola.md`, e le falle riservate, che la seconda ti manda in chat (mai nel deposito).
6. Poi giro di correzione (bocciate, parziali, file altrui, non fatti per spesa) e onda 2 con le 103 rimaste.

**La lezione dell'onda 1.** Il costo dei subagenti entra tardi in `usage.cost_usd`: le figlie leggono un numero vecchio e passano il 70% senza saperlo (R01 al 95%, R02 all'88%, R05 all'85% senza un avviso). La regia legge la spesa di tutte con `get_session` per id a ogni risveglio e manda lei lo stop. Per l'onda 2: limiti più bassi nel primo messaggio, o lotti più piccoli.
