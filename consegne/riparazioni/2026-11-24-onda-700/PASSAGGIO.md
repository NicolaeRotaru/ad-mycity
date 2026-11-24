---
data: 2026-11-24 14:12
tipo: passaggio della regia (quarta → quinta)
campagna: onda dei 700
---

# Passaggio · dalla regia quarta alla quinta

## In parole semplici
Questo foglio serve alla regia quinta per continuare senza rileggere la chat della quarta.
La quarta passa la mano dopo venti minuti: la sua storia è a circa 240 mila token, sopra i 250 mila di limite si sbaglia di più.
K01 ha finito, a metà: delle 29 voci da collaudare 13 su 29 reggono, 3 sono a metà, una rompe altro e 12 restano senza giudizio pieno.
La voce che rompe altro è R01-005: con il limite di 24 ore l'allarme del tetto di spesa tace circa un'ora al giorno.
È già tolta dall'unione con un revert (un commit che annulla il suo), e le prove toccate sono verdi.
K03 lavora ancora su R07.

## Cosa cambia per te
Ti apre l'AD, a profondità 1. K03 manda ancora i verdetti alla quarta: il tuo primo lavoro è dirgli il tuo id.

## Cosa devi fare
Segui «I prossimi passi» qui sotto, dall'1.

## Cosa non ho verificato
Le prove unitarie complete del sito sull'unione. Le ho lanciate sull'albero 868b274c. Il revert è arrivato mentre giravano, quindi l'esito non vale: vanno rifatte sull'albero 15eec484.
Il costo finale di K01. Ho letto 17,56 $ con un turno ancora aperto: il valore vero è più alto.

## Dettagli tecnici

**Ids.** AD session_01R8112Lzth8WvHHrQ4H3whZ. Regia quarta session_01R8112KaXwxnHLCt8evwChT (da adesso non spinge più; la sua sveglia delle 14:26 è cancellata).
K01 session_01R8112NmLAfy9H8nhAdAsru: finita, verdetto in `normali/collaudi/K01.json` (ramo -k01 @ 905001438820a6fa773e475948752d8e21a90dcc, guardia-ramo e valida-collaudo verdi). Da archiviare, a turno chiuso, dopo aver letto il costo.
K03 session_01R8112KrhYF5zq8hGHNomMK: R07, in corso. Nessun controllore aperto.

**K01 in breve.** R03: reggono 002 e 012; a metà 003, 006 e 013. R02: reggono 003, 004, 006, 011 e 015. R01: reggono 002, 007, 009, 010, 015 e 016; R01-005 rompe altro.
Senza giudizio pieno, con prova rimessa del collaudatore uscita 0, quindi da un altro collaudo:
R02-001, -002, -005, -009, -010, -012 e R01-001, -003, -006, -011, -012, -013.
Avviso di K01 sulle ricette serve_file_altrui di R03-003 e R03-006: non applicarle così.
- Il webhook usa `new Date(session.created*1000)` senza l'ora di Roma: sbaglia fra mezzanotte e l'una.
- stripe/checkout prende delivery_date dal browser senza recinto: «Domani» passa con il negozio chiuso.
R03-013 a metà: telefoni in formati comuni, chiavi sk_live_/whsec_ e numeri di carta restano in chiaro. In più il logger lancia TypeError se il messaggio non è un testo.
R01-005, la correzione chiesta da K01 e dal riparatore stesso: togliere il limite di 24 ore e tenere le cancellazioni.

**L'unione, da rifare nel tuo contenitore** (la mia sparisce).
1. Clone col git normale in /home/user/mycity, base 5b8c786c96ec789918b3e85361ca435cef726b92, poi `git merge --no-ff` di origin/ccr-d7a54140-hak4ez-m01 … m07 in ordine: zero conflitti.
2. In tests/sql/rls/48-i-difetti-minori-del-database.test.sql, righe 97-98, «un rider passa a prenderlo» diventa «un fattorino passa a prenderlo». Albero 868b274c0851a5cee0a28e13ff21268c6f8bb823.
3. `git revert c6e10d3183b49cfac83f8f655d9102626c59a3b8` (R01-005) dà un conflitto in lib/ai/tettoSpesa.ts, perché 62bbaf4c ha tolto R01-004.
   Si risolve tenendo `if (!(tettoEur > 0)) return [];` senza le righe di AI_NEGOZI_ACCESA, e con `git rm` del test riparazione-r01-allarme-tetto-riga-vecchia.
   Albero 15eec484642e50152212e9ab1c9eb354ef0877b4.
Già misurato da me: harness SQL verde sull'albero 868b274c (226 migrazioni, 91 file, uscita 0). Il revert tocca solo TypeScript.
Sull'albero 15eec484: tsc uscita 0, e i 10 file di prova che citano tettoSpesa sono verdi (59 prove).

**Il tetto, rigido: 360 $.** Alle 14:10 circa 248 $.
- Misurati 122,58 $: i 102,59 $ di prima, più K01 17,56 $ (lettura vecchia) e la regia quarta 2,43 $ alle 14:00, salita dopo.
- Dichiarati 125,73 $: i riparatori, come nel passaggio di prima.
Restano K03 (tetto 20 $), C01 (15 $) e la tua regia: proiezione circa 290 $.
Per il giro di correzione e il secondo collaudo restano circa 70 $. Alla fermata va il numero di voci che ci stanno.

**Le regole da tenere.** Sono quelle del passaggio di prima: SHA interi, controllo a 10 minuti, `list_events` sui collaudatori aperti con grep `"name":"mcp__`, il quaderno sotto le 80 righe.
In più: la regia nasce già pesante. Io ero a 218 mila token dopo aver letto skill, quaderno, passaggio ed elenco delle sessioni. Leggi la skill a pezzi: F2, F3, «Quando ti fermi».
Al tuo passaggio: PASSAGGIO.md, push, e all'AD lo SHA e la riga di apertura.

## I prossimi passi
1. `get_session` su di te: il tuo id nel campo `regista` di `normali/sessioni.json`, commit e push. Poi una riga a K03: «la regia ora è <id>, i verdetti mandali qui».
2. La prima sveglia a 30 minuti verso di te (`send_later`). Ogni giro: `MARKETPLACE_REPO=/home/user/mycity bash cervello/riparazione/sorveglia.sh consegne/riparazioni/2026-11-24-onda-700/normali 1`, `list_sessions` e la ricerca su `list_events` di K03.
3. K01: costo finale da `get_session`, poi `archive_session`. K03 «finita»: guardia-ramo e valida-collaudo, copia di `collaudi/K03.json`, costo, `archive_session`. Una voce bocciata da K03 si toglie dall'unione con `git revert`.
4. Rifai l'unione come sopra, poi `npm ci`, `npm run verify` sull'albero finale e l'harness SQL (`pg_ctlcluster 16 main start`, ruolo root superuser, `tests/sql/harness/apply.sh` e `run.sh`).
5. Prima di spingere l'unione sul sito con add_repo, avvisa l'AD: Nicola deve cliccare. Poi C01 (tetto 15 $) sull'unione spinta.
6. `applica` a vuoto e `conti`, poi la FERMATA all'AD. Dentro: i numeri, le domande per Nicola (elenco nel passaggio di prima, commit 176e0c4) e il giro di correzione.
   Il giro di correzione si spiega con le sue tre parti:
   - R01-005 torna a R01, o a «R01 secondo» se R01 supera 300 mila token;
   - le 12 voci senza giudizio vanno a un collaudatore nuovo;
   - le voci a metà e quelle con file altrui (R03-003 e R03-006 con l'avviso qui sopra).
   Per ognuna va detto quante ne stanno nei 70 $. A fine giro la riga in `cervello/riparazione/misure.json`.
