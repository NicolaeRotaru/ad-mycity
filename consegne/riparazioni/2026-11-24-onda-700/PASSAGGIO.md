---
data: 2026-11-24 15:30
tipo: passaggio della regia (sesta → settima)
campagna: onda dei 700
---

# Passaggio · dalla regia sesta alla settima

## In parole semplici
Questo foglio serve alla regia settima per partire senza rileggere la chat della sesta.
Il controllo dell'onda è finito bene: il controllore C01 non ha trovato nessuna voce rossa su 103.
La fermata è già andata all'AD alle 15:25: si aspetta la risposta di Nicola.
Resta da fare il giro di correzione: 44 voci da riparare e 11 da collaudare, ma nel tetto ne stanno circa 22.
Prima del giro va spinto sul sito un revert che ho fatto solo in locale.
Per esempio: oggi un fattorino già approvato che rinnova la patente e rimanda la verifica resterebbe «In attesa di verifica» per sempre. Il revert toglie proprio quel pezzo.

## Cosa cambia per te
Ti apre l'AD, a profondità 1. Nessuna figlia lavora adesso: C01 è archiviata.
Parti solo quando arriva la risposta di Nicola alla fermata.

## Cosa devi fare
Segui «I prossimi passi» qui sotto, dall'1.

## Cosa non ho verificato
Le prove complete del sito dopo il revert: vedi la riga «vitest completo» nei dettagli.
Il costo finale della mia regia: leggilo tu con get_session a turno chiuso.

## Dettagli tecnici

**Ids.** AD session_01R8112Lzth8WvHHrQ4H3whZ. Regia sesta session_01R8112PQqQyV8Ak87dU7bp1: da adesso non spinge più.
C01 session_01R8112MCedazmwF5a39XHqD, finita e archiviata, 6,33 $. La regia quinta session_01R8112PeGJAFQGJ1DtJp6h5 ha il turno chiuso a 6,36 $.
La mia sveglia trig_01QGN2K2QEZP4hLwgjtBQHvS (14:17 UTC) è già scattata o scatta da me: non toccarla.
La regia terza è ferma su un clic di delete_trigger: lasciala così.

**La fermata, mandata all'AD alle 15:25.** Tre risposte di Nicola:
- il clic su add_repo per spingere il revert di R07-001 sul sito;
- il giro di correzione: A «via nel tetto» (22 voci su 44 e il collaudo delle 11), B «via tutto» (circa 405 $, oltre il tetto), C «fermati»;
- le domande dei riparatori e le tre firme sulle prove comuni (non fermano il giro).
Io ho consigliato A. Il giro parte solo con la risposta scritta di Nicola.

**Il revert da spingere.** Su a673164da05ab165480595967128d01795601ba9 restava 55d79fba, il primo commit di R07-001.
Dentro c'è proprio la logica bocciata da K03: approved_at e kyc_provider_checked_at nel profilo del fattorino.
C01 l'ha vista, ma ha scritto «non rompe niente»: guardava solo se la pagina si rompe, non il caso di K03.
Il mio revert locale era 6bdc18c3, ma nel tuo contenitore non c'è. Rifallo: `git revert --no-edit 55d79fba` su ccr-d7a54140-hak4ez.
Dopo il revert, `git diff 5b8c786c96ec789918b3e85361ca435cef726b92 HEAD -- app/rider/profile/page.tsx` deve essere vuoto, e la prova riparazione-r07-documento-ricaricato-dopo-l-approvazione sparisce.
Le prove che ho visto verdi dopo il revert: tsc 0, eslint su page.tsx 0, vitest sui 6 file di prova vicini 0 (25 prove).
vitest completo: IN CORSO alle 15:30.
Per spingere serve add_repo su NicolaeRotaru/mycity con accesso push. Fallo solo dopo il clic di Nicola, passato dall'AD.
L'AD aveva proposto un'altra strada: una sessione piccola con create_session sul sito e outcome_branch ccr-d7a54140-hak4ez, che fa il revert e spinge.
Alle 15:23 il controllo dei permessi della sessione l'ha negata come «aggirare la sorveglianza»: spingere sul sito senza il clic di Nicola.
Non riprovarla e non aggirarla: la spinta resta legata al clic di Nicola. Se Nicola vuole la strada senza clic, la autorizza lui nelle impostazioni.

**I numeri dopo C01.** `applica` a vuoto è verde: 21 si chiudono, 15 erano già riparate, 67 restano aperte, 31 nati (29 dai referti e 2 da C01, tutti minori).
`conti` è verde: 103 aperte nel registro, come deve essere prima dell'unione di Nicola.
Il referto di C01 è copiato in `normali/controlli/C01.json`. Sul ramo -c01 c'era solo quel file (5b522b55a5d0e55045a739b541bdaa5c77bbf700).

**Le 67 aperte, per il giro.** Sono contate da `normali/decisioni.json`.
- Fuori dal giro: 8 aspettano una scelta di Nicola, 4 non sono codice.
- Al riparatore di prima: 2 rompono altro, cioè R01-005 a R01 e R07-001 a R07.
- Da ridividere dall'integrazione: 23 a metà e 19 con un file altrui (`dividi --base <SHA dell'integrazione col revert> --file-chiavi`).
- A un collaudatore nuovo: 11 voci riparate senza ancora un verdetto pieno.
- Con A si sceglie quali 22 delle 44: prima le 2 che rompono altro, poi le voci a metà con il verdetto «regge» (7), poi le file altrui che chiedono meno file.
- Note già scritte in REGIA.md: R02-004 (5 diff dei finti, poi cherry-pick a6bee2db), R06-007 (STORAGE_SYNC_STORICO), l'avviso di K01 su R03-003 e R03-006 (commit a76a1a6).

**Il tetto, rigido: 360 $.** Misurato con get_session alle 15:18: 292,33 $.
- 278,01 $ fino alla quarta, più quinta 6,36, C01 6,33 e sesta 1,63 (a metà turno).
- Restano circa 67 $. Togli la tua regia (circa 10 $) e il collaudo delle 11 (circa 8 $): per riparare restano circa 45 $.
- A circa 2 $ a voce (1,48 di riparazione, 0,38 di collaudo, 0,15 di controllo) sono circa 22 voci.

**Le regole da tenere.** SHA interi. Controllo a 10 minuti su ogni figlia: get_session, poi `list_events` kinds assistant con grep `"name":"mcp__` (niente database vero).
Il quaderno REGIA.md è a 64 righe: tienilo sotto le 80, compattalo prima di aggiungere.
Un hook riscrive `MyCity-Vault/90-Memoria-AI/auto-coscienza/sorvegliante-storico.json`: non usare `commit -a`, e committalo da solo, in un commit a parte. Se al push dà conflitto, tieni la versione remota e riaggiungi solo la riga nuova della tua sessione.
Un'altra lezione di oggi: una voce con due commit va revertita con tutti e due. Controlla con `git log base..HEAD -- <file della voce>`.

## I prossimi passi
1. `get_session` su di te: il tuo id nel campo `regista` di `normali/sessioni.json`, commit e push.
2. Clone del sito col git normale in /home/user/mycity, `git fetch` dei rami -m01…-m07 e di ccr-d7a54140-hak4ez. Rifai il revert di 55d79fba e le prove vicine.
3. Con il clic di Nicola: add_repo push, spingi il revert, scrivi il nuovo SHA dell'integrazione in REGIA.md.
4. Con la risposta di Nicola sul giro (A, B o C): F2 della skill `riparazione`, «Il giro di correzione». Divisione dall'integrazione col revert, schede, riparatori, un collaudo, un controllo sulle sole modifiche nuove, `applica` coi loro referti. La fermata viene solo dopo.
5. A fine giro, la riga in `cervello/riparazione/misure.json`.
