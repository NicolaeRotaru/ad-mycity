---
data: 2026-11-24 13:52
tipo: passaggio della regia (terza → quarta)
campagna: onda dei 700
---

# Passaggio · dalla regia terza alla quarta

## In parole semplici
Questo foglio serve alla regia quarta per continuare senza rileggere la chat della terza.
La terza passa la mano perché la sua storia pesa 348 mila token, contro un limite di 250 mila.
Tutti e sette i riparatori hanno consegnato, con guardia e referto verdi.
Il collaudo è a buon punto: K02 ha finito, K01 e K03 lavorano.
Un esempio: R05 aveva 14 voci. K02 ne ha confermate 8: 5 riparate e 3 già a posto. Altre 3 restano a metà, e nessuna cade.
L'unione di prova, fatta nel contenitore della terza, è verde sul database di prova: 91 controlli su 91.

## Cosa cambia per te
Ti apre l'AD, non la regia: sei a profondità 1.
K01 e K03 mandano ancora i verdetti alla terza. Il tuo primo lavoro è dire loro il tuo id.

## Cosa devi fare
Segui «I prossimi passi» qui sotto, dall'1.

## Cosa non ho verificato
Le prove unitarie del sito sull'unione: alla consegna giravano ancora. Tipi e lint erano già passati.
La spesa vera di sei riparatori: le cifre sono quelle dichiarate. Solo R05, K02 e la regia terza sono misurati.
La firma di Nicola sulle prove comuni: non è arrivata, e la campagna non la aspetta più.

## Dettagli tecnici

**Ids.** AD session_01R8112Lzth8WvHHrQ4H3whZ. Regia terza session_01R8112PV6Phn3WXaFfB7G85 (da adesso non spinge più).
Collaudatori in `normali/sessioni.json`: K01 session_01R8112NmLAfy9H8nhAdAsru (R03, R02, R01, in corso), K02 finita e archiviata, K03 session_01R8112KrhYF5zq8hGHNomMK (R07, in corso). Nessun controllore aperto.

**Già fatto, non rifarlo.**
- R01-R07 consegnati, ognuno con guardia e referto verdi al giro delle 13:51. Le prove comuni sono state tolte dai rami con dei revert: R01-004, R06-008 e R07-007 sono serve_file_altrui, col diff completo nella nota. Con la firma si riapplicano: R01-004 con git apply del diff nella nota (commit di prima 4f04b579), R06-008 con cherry-pick di 99c4faf1, R07-007 con cherry-pick di 602c64d7.
- K02: R05 8 reggono e 3 a metà, R04 14 e 1, R06 7 e 1. Verdetto copiato in `normali/collaudi/K02.json`, guardia e valida-collaudo verdi, costo 6,93 $.
- Unione LOCALE (nel contenitore della terza, che sparisce): base 5b8c786c96ec789918b3e85361ca435cef726b92, poi `git merge --no-ff` di origin/ccr-d7a54140-hak4ez-m01 … m07 in ordine, zero conflitti. Poi la prova tests/sql/rls/48 righe 97-98: «un rider passa a prenderlo» diventa «un fattorino passa a prenderlo» nelle due righe (diff nel referto di R02, voce R02-009). Albero risultante 868b274c0851a5cee0a28e13ff21268c6f8bb823: rifacendo gli stessi passi devi ottenere lo stesso albero (`git rev-parse HEAD^{tree}`).
- Sull'unione: harness SQL verde (226 migrazioni, 91 file di controllo, uscita 0). `npm run verify`: tipi e lint passati, prove unitarie in corso alla consegna.
- Nessun ramo cambia package.json o package-lock.json.

**Per l'unione (dai referti).** R02-004: i 5 diff dei finti più cherry-pick di a6bee2db, nel giro di correzione (due finti fanno il mock di lib/logger, che è di R03). R06-007: con una copia foto su destinazione cifrata serve STORAGE_SYNC_STORICO, va detto a Nicola.

**Domande per Nicola alla fermata.** Migrazioni nuove da approvare: 821, 822 (R01), 830, 831, 832 (R02), 840 (R03), 860 (R05). Le domande nei referti: R01 un secondo reclamo dopo uno chiuso; R02-008, R02-003, R02-002; R03 sette domande; R05-004 placehold.co e il ricalcolo del traguardo «venditore più votato»; R06-009 rilascio automatico di Vercel, R06-010 migrazioni 164 e 181, R06-002 la variabile Sentry su Vercel; R07 tre domande e R07-004.

**Il tetto, rigido: 360 $.** A 2026-11-24 13:52 circa 228 $: misurati 102,59 $ (passo 1 e regie prima e seconda 66,69 · R05 19,18 · K02 6,93 · regia terza 9,79) più 125,73 $ dichiarati (R01 22,94 · R02 24,64 · R03 18,73 · R04 16,93 · R06 19,97 · R07 22,52). Restano K01 e K03 (tetto 20 $ l'uno), C01 (15 $) e la tua regia: proiezione circa 300 $. Per il giro di correzione restano circa 60 $: alla fermata va il numero di voci che ci stanno.

**Le regole da tenere.** SHA interi in source_revision. Controllo a 10 minuti anche per collaudatori e controllori. Su collaudatori e controllori aperti, `list_events` (kinds assistant): l'uscita grande finisce su file da sola, e si cerca con grep `"name":"mcp__` (i nomi del database vero compaiono anche nei divieti scritti ai subagenti: non sono chiamate). Al tuo passaggio: PASSAGGIO.md, push, e all'AD lo SHA e la riga di apertura; la regia dopo la apre l'AD. Il quaderno resta sotto le 80 righe.

## I prossimi passi
1. `get_session` su di te. Metti il tuo id nel campo `regista` di `normali/sessioni.json`, commit e push. Poi una riga a K01 e a K03 con `send_message`: «la regia ora è <id>, i verdetti mandali qui».
2. La sorveglianza: la catena della terza finisce qui. Crea tu la prima sveglia a 30 minuti verso di te (`send_later`). Ogni giro: clona il sito col git normale in /home/user/mycity se manca, poi `MARKETPLACE_REPO=/home/user/mycity bash cervello/riparazione/sorveglia.sh consegne/riparazioni/2026-11-24-onda-700/normali 1`, `list_sessions` e la ricerca su `list_events` dei collaudatori aperti.
3. Quando K01 e K03 mandano «finita»: guardia-ramo e valida-collaudo sui loro rami, copia di `collaudi/K0N.json` nella cartella, costo da `get_session`, `archive_session`. Le voci bocciate tornano allo stesso riparatore per un giro (F2).
4. Rifai l'unione nel tuo contenitore come scritto sopra, e controlla l'albero 868b274c. Se un collaudo ha bocciato una voce, `git revert` del suo commit sull'unione. Poi `npm ci`, `npm run verify`, l'harness SQL (`pg_ctlcluster 16 main start`, un ruolo root superuser, `tests/sql/harness/apply.sh` e `run.sh`).
5. Prima di spingere l'unione sul sito con add_repo, avvisa l'AD: Nicola deve cliccare. Poi C01 (tetto 15 $) sull'unione spinta.
6. `applica` a vuoto e `conti`, poi la FERMATA all'AD con i numeri, le domande per Nicola qui sopra e quante voci del giro di correzione stanno nel tetto. A fine giro la riga in `cervello/riparazione/misure.json`.
