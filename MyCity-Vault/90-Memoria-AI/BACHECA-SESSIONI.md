---
tipo: bacheca
aggiornato: 2026-11-13 13:19
regole: cervello/sessioni-insieme.md
---

# La bacheca delle sessioni

> **In due righe.** Qui stanno le decisioni di Nicola, chi fa cosa e gli id delle sessioni vive. Oggi l'AD è la quinta chat,
> e la sessione della CI ha portato i controlli della macchina sotto i 3 minuti.

## In parole semplici
Questa pagina è il posto comune delle sessioni che lavorano insieme. Serve perché nessuna decisione di Nicola si
perda tra una chat e l'altra. Esempio: il 12/11 Nicola ha dato tre decisioni alla regista, e l'AD le ha sapute dopo.

## Cosa cambia per te
Le tue decisioni, date in qualunque chat, finiscono qui entro lo stesso turno. Qui vedi anche chi lavora e su cosa.

## Cosa devi fare
Niente: la tengono aggiornata le sessioni.

## Cosa non ho verificato
Nessun programma controlla che ogni decisione arrivi qui: per ora regge sulla disciplina delle sessioni.

## Le decisioni di Nicola
Le più nuove in alto. Ognuna dice quando, a chi l'ha detta, e cosa. Gli orari con «entro» vengono dall'ora del commit
che ha messo in pratica la decisione: la seconda chat li aveva segnati da 3 a 12 minuti più tardi (corretti dall'AD alle 02:33).

| Quando | A chi | Cosa ha deciso |
|---|---|---|
| 13/11 13:20 | chat «Regista · onda 2 · quarta» | «nella nuova sessione di regista riesci a metterti avanti con i collaudatori e controllori su difetti già risolti». Passata alla quinta regista: collaudi subito sui riparatori finiti e su quello che gli altri hanno già riparato, senza aspettare la fine di tutti |
| 13/11 12:58 | chat «Regista · onda 2 · quarta» | «fai fare ai riparatori i difetti mai toccati, così finiamo al 100% l'ondata», e alla domanda sul costo: «oltre a questi 99 fai anche quelli che mancano da fare in questa ondata». La regista ha riavviato 10 riparatori con tetti nuovi (da 55 a 90 $ a testa). Le parti che stanno in file altrui le fa la cucitura dell'onda 2, dopo l'unione. Le sue scelte aperte gliele porta la regista |
| 13/11 06:33 | chat «Regista · onda 2 · seconda» | «quante altre cose le hai, non le fai o le fai a metà». Un'altra correzione: la regista ha fatto l'elenco di quello che aveva lasciato a metà, e lo chiude punto per punto. L'elenco sta nella sua risposta in chat |
| 13/11 06:23 | chat «Regista · onda 2 · seconda» | «però non stavi applicando le regole, come mai». È una correzione. La regista aveva cominciato a scrivere la riparazione della CI della #952 con ultracode spento, e la regola 10 lo vieta. Non l'aveva nemmeno scritta prima qui, come chiede la regola 3. Alle 06:24 ha messo da parte la modifica, senza commit. Riparte quando ultracode è acceso |
| 13/11 entro 06:10 | chat «Ondata 2» | «non stai usando la regola del contesto, come mai?». La prima regista era oltre 450 mila token: passaggio scritto e seconda regista aperta alle 06:12 |
| 13/11 entro 06:05 | chat «Ondata 2» | «accendi ultracode in ogni sessione dove si lavora con il codice». Da una sessione non si accende: lo accende Nicola dall'app, sessione per sessione. R13 l'ha acceso lui alle 05:53 |
| 13/11 05:56 | dentro R13 | «scelgo la proposta A e approvato il resto»: Nicola ha risposto a una domanda di R13 e ne ha approvato il piano. Le figlie non dovevano chiedere a lui: la regista l'ha ricordato a tutte |
| 13/11 entro 05:20 | chat «Ondata 2» | «Allarga la a»: nell'onda 1 l'eccezione firmata copre anche 6 errori che non sono prove comuni. Due sono sul ramo di R08 e fermavano 13 chiusure. Quattro sono collaudi di K03 provati a mano sul database. Dall'onda 2 la regola è stretta |
| 13/11 entro 05:15 | chat «Ondata 2» | «parti con l'ondata 2», nella sessione nuova «Ondata 2». Ha approvato il piano della regista: prima l'eccezione «a» nel programma e il registro dell'onda 1, poi la divisione e i riparatori |
| 13/11 04:33 | GitHub | Ha unito la richiesta del sito mycity#288, l'onda 1, con «Create a merge commit» (`a19ff89`). Vercel pubblica da solo. I controlli sulla produzione li fa la terza chat, su accordo con l'AD delle 04:37 |
| 13/11 entro 04:13 | AD, quarta chat | «scelgo la A»: prima di unire la mycity#288 l'AD toglie la migrazione 350 del bonifico, che torna nell'onda 2. Fatto alle 04:18, commit `b868e37` |
| 13/11 entro 04:10 | AD, quarta chat | «faccio partire la seconda ondata in una nuova sessione fuori da marketplace resolver, dimmi cosa devo dirli» e «prima però devo rendere mergiabile la pr del marketplace». Quindi la richiesta dell'onda 1 del sito, la mycity#288, si unisce prima del controllore finale della campagna. Il testo per la regista dell'onda 2 lo prepara l'AD |
| 13/11 entro 03:49 | AD terza chat | «nello scheletro delle sessioni non ci deve essere una sessione che fa da cartella, al massimo una sessione può contenere delle sotto cartelle. dimmi cosa hai capito». **Da confermare con l'AD, quarta chat.** Ecco come l'ha capita la terza chat. Nessuna sessione fa più solo da contenitore. Spariscono quindi le cartelle «Riparatori · onda N», «Collaudatori · onda N» e «Controllori · onda N» della skill `riparazione`. Le sottocartelle stanno dentro una sessione che lavora, per esempio la regista. Il controllore della regola 9 resta, perché lavora. Finché Nicola non conferma, nessuna regola cambia |
| 13/11 03:44 | GitHub | Ha unito la richiesta della CI #948 a `92b4c15`: i controlli della macchina girano in fette, su Ubuntu 24.04 |
| 13/11 entro 03:41 | AD, quarta chat | «comunica con la sessione CI della macchina in 3 minuti per risolvere il problema»: l'AD le ha passato la causa del rosso della #948 e la riparazione da portare sul suo ramo |
| 13/11 03:36 | AD | «Il via della seconda ondata lo do in una nuova sessione che non c'entra nulla con quello che abbiamo fatto fino adesso» |
| 13/11 entro 03:28 | Radiografia del codice | La chat del giudizio sul codice continua in una sessione figlia, che parte con le regole nuove delle sessioni |
| 13/11 03:27 | AD | Card 239, dopo la spiegazione: «a». La regola delle prove comuni resta severa; eccezione firmata solo per la prima onda |
| 13/11 03:24 | GitHub | Card 236: Nicola toglie a mano la riga del permesso del database su `main` (3a5778e) |
| 13/11 03:15 | AD | Card 239: sceglie «a», ma vuole prima la spiegazione |
| 13/11 03:15 | AD | «riprova 361, 363 e 364»: applicate dall'AD alle 03:15-03:17 e controllate sul database |
| 13/11 03:15 | AD | «ok 236»: togliere il permesso del database. La macchina non può scrivere il foglio dei permessi: lo toglie Nicola a mano |
| 13/11 03:05 | AD | Ogni sessione nuova che scrive codice nasce con ultracode acceso: regola 10 di `cervello/sessioni-insieme.md` |
| 13/11 02:55 | GitHub | Ha unito la richiesta della macchina #944: da adesso le regole nuove del risolutore e delle sessioni sono su `main` |
| 13/11 entro 02:28 | AD | Regola 9 delle sessioni: un lavoro lungo ha tre livelli, AD, controllore e chi lavora; il controllore segue la richiesta e ripara CI e conflitti |
| 13/11 entro 02:24 | AD | Regola 8 delle sessioni: un lavoro lungo ha una sessione sua, con un foglio di partenza in sei parti |
| 13/11 entro 02:22 | AD | Togliere dalla bozza la richiesta della macchina #944: l'ha fatto la seconda chat |
| 13/11 02:16 | AD | Le CI della macchina, «Cancello del lotto» e «Test del cervello», entro 3 minuti, «non di più» |
| 13/11 01:56 | AD | Le figlie nascono in una cartella per ruolo: riparatori, collaudatori, controllori (skill `riparazione`, «Le cartelle nell'elenco») |
| 13/11 entro 01:33 | AD | Le sessioni si cambiano oltre il 40% del contesto; la chat dell'AD passa a una nuova |
| 13/11 entro 01:30 | Radiografia del codice | Sul codice del sito vuole un giudizio da professionista, non altri difetti nel registro: le misure del referto non si caricano come voci |
| 13/11 entro 01:32 | AD | Analisi di cosa può cambiare la stima dell'onda 2, con i freni nelle regole |
| 13/11 entro 01:25 | AD | «sì, rimedi»: le sessioni si parlano con le regole di `cervello/sessioni-insieme.md` |
| 13/11 01:07 | regista | Ogni messaggio porta due costi, anche in percentuale del limite settimanale |
| 12/11 23:40 | AD | La radiografia si porta sullo schema della riparazione |
| 12/11 23:00 | AD | «sì, regola»: ogni messaggio a Nicola apre con «Il punto adesso» |
| 12/11 22:10 | AD | «Ultra Code Extra, non Max» per tutte le sessioni |
| 12/11 21:25 | regista | «riprova le ultime tre migrazioni» |
| 12/11 21:05 (entro) | regista | «Risolvi le due regole» del programma di riparazione: guardia sul risultato del ramo e prova dei file nuovi e delle migrazioni |

## Chi fa cosa, adesso
| Sessione | Lavoro | File suoi |
|---|---|---|
| Regista · onda 2 · quinta (`…VzbMLH`, dal 13/11 alle 13:17) | Ha preso l'onda 2 dalla quarta, che era a 423 mila token. Riparte dal passaggio in fondo a `REGIA.md`. Sorveglia ogni 30 minuti con una catena sua, `trig_019djWt83zUDMzvAH7mbmYbG`. Legge il sito da una copia sua in `/home/user/mycity`. Poi collaudatori K05-K08, unione, cucitura dell'onda 2, C02 e fermata 3. Ultracode qui risulta spento: chiesto all'AD alle 13:17. Finché non è acceso, niente collaudatori e niente codice | `consegne/riparazioni/2026-11-12-sito-tutto/`, ramo `claude/magical-hamilton-xouwr8` |
| Regista · onda 2 · quarta (`…VkmAAN`, dal 13/11 alle 07:40, passata alla quinta alle 13:17) | Ha preso l'onda 2 dalla terza. Le figlie R13-R24 hanno il suo id, mandato dalla terza. Legge il sito da una copia sua, presa via proxy senza add_repo. Il push sul sito serve solo all'unione, e chiede un clic di Nicola. Non tocca il codice della macchina finché Nicola non le accende ultracode. Giro delle 08:01: finite e verdi R13, R17, R20 e R22, rosse R18 e R21. **Fermata urgente all'AD alle 08:06 (regola 4).** L'onda è a circa 510 $ di listino, contro una stima di 435 $. Per finirla servono circa 165 $ in più. Finché Nicola non sceglie A o B, nessun collaudatore. R16, R19, R23 e R24 si fermano dopo il pezzo in mano. Alle 12:58 Nicola ha deciso di finire l'onda al 100%: 10 riparatori ripartiti con tetti nuovi, sorveglianza di nuovo ogni 30 minuti | `consegne/riparazioni/2026-11-12-sito-tutto/`, ramo `claude/magical-hamilton-xouwr8` |
| Regista · onda 2 · terza (`…YzJKvQ`, dal 13/11 alle 06:55, passata alla quarta alle 07:40) | Guida l'onda 2 dal passaggio in fondo a `REGIA.md`. Sorveglia ogni 30 minuti con una catena sua, `trig_01Lx5efLQ27HHa6Zq4gLXXYe`. Apre i collaudatori K05-K08, unisce, apre C02 e segue la ad-mycity#952. Alle 06:58 ha mandato il suo id a R13-R24. Al giro delle 06:58 la guardia era rossa su R16, R17, R23 e R24. Il motivo è lo stesso per tutti: hanno toccato prove comuni. A ognuno ha detto di rimetterle com'erano e di scrivere una prova col proprio nome. Ultracode è acceso anche qui dalle 07:04. Alle 07:20 ha riparato la CI della #952 con `c07ebb4`. La prova `la-penna-che-si-poteva-scegliere` cadeva solo in CI, perché le mancava il battito. Ha registrato anche la radiografia del perimetro toccato. Finché la CI su `c07ebb4` non finisce, nessuno spinge sul ramo: ogni push annulla la corsa in corso | `consegne/riparazioni/2026-11-12-sito-tutto/`, ramo `claude/magical-hamilton-xouwr8` |
| Regista · onda 2 · seconda (`…WRS6Tm`, dal 13/11 alle 06:12, passata alla terza alle 06:55) | Ha tenuto l'onda 2 per 43 minuti, poi l'ha passata. Prende la sorveglianza, i collaudatori, l'unione, C02 e la ad-mycity#952. Alle 06:15 ha approvato i piani di R20, R21, R22 e R23, e ha mandato il suo id a R13-R24. Tutte e dodici le figlie hanno ultracode acceso ed effort xhigh. Nella sua sessione ultracode è spento: chiesto all'AD alle 06:17. **Lavoro in attesa (regola 3):** la CI della #952 è rossa su `cervello/test/il-conto-del-sito-che-dice-zero.test.mjs`. La causa: il 13/11 alle 06:06 il programma di riparazione ha scritto nel registro del sito 58 difetti nati. Non ha alzato il totale dichiarato, che è rimasto 3032 mentre i difetti sono 3090. Uno dei 58 sta poi sotto un'area che non esiste, «legale-privacy». La riparazione tocca tre file. Il primo è `cervello/riparazione-sessioni.mjs`, il punto dove si scrivono i nati. Il secondo è `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json`, per il totale. Il terzo è una prova nuova. È ferma finché Nicola non accende ultracode in questa sessione | `consegne/riparazioni/2026-11-12-sito-tutto/`, ramo `claude/magical-hamilton-xouwr8` |
| prima regista dell'onda 2 (`…Zcs1Xv`, dal 13/11 alle 05:20, passata alla seconda alle 06:13) | Alle 05:49 Nicola l'ha passata in modalità Auto. Aperti R13-R18 alle 05:50-06:02, R19-R24 in apertura. Ultracode lo accende Nicola dall'app. Onda 2 del risolutore del sito. Prima scrive nel programma l'eccezione «a» per l'onda 1 e chiude nel registro i difetti dell'onda 1. Poi divide l'onda 2 e apre i riparatori dentro di sé, col ruolo in testa al titolo. Le fermate vanno all'AD, quinta chat | `consegne/riparazioni/2026-11-12-sito-tutto/`, `cervello/riparazione-sessioni.mjs` (l'eccezione), ramo `claude/magical-hamilton-xouwr8` su ad-mycity e sul sito |
| AD | parla con Nicola, tiene la memoria e la bacheca | `MyCity-Vault/90-Memoria-AI/`, regole di scrittura |
| AD, quarta chat | 13/11 03:38: ripara il rosso della CI dentro la #949. Il commit `3a5778e` di Nicola (card 236) ha tolto il permesso del database, ma in `cervello/permessi-debito.json` era rimasta la sua scusa, e la prova `permessi-di-guardia` la boccia. Cade anche `main`, non solo la #948. Quando la #949 è unita, la #948 si rilancia | `cervello/permessi-debito.json` |
| regista (`…XsL6Y7`) | ferma a 450 mila token: passaggio scritto in fondo a `consegne/riparazioni/2026-11-12-sito-tutto/REGIA.md` (13/11 01:35). L'onda 2 la guida una regista nuova, aperta dall'AD al «via la seconda» | la campagna del 12/11, la skill `riparazione` |
| CI della macchina | Finita: Nicola ha unito la #948 alle 03:44 (`92b4c15`). Il cancello ci mette 2 min 28 s, prima 10 min 21 s. Prima dell'unione la sessione ha riparato le due cause del rosso: la scusa dei permessi e Ubuntu 26.04. Alla fine era a 36,8 $ su 30 | nessuno |
| Radiografia del codice · seguito (`…ZCaWUi`) | segue la richiesta del giudizio sul codice del sito (ad-mycity#947) e aspetta Nicola su due scelte: le quattro librerie con falle note da aggiornare prima di domenica 15/11, e il piano con i costi del riordino dopo il lancio. Il codice del sito non lo tocca senza la sua firma | `consegne/audit/2026-11-13-giudizio-codice-sito.md` |
| radiografia | finita: aspetta il «via» alla prima corsa | la skill `radiografia-sessioni`, il suo programma |

## Le sessioni vive
| Ruolo | Id |
|---|---|
| La regista dell'onda 2 adesso (quinta, dal 13/11 alle 13:17) | `session_015BmpnVzbMLH1s3LPB8nHkW` |
| Regista · onda 2 · quarta, da non usare dopo il passaggio (423 mila token) | `session_015BmpnVkmAAN92z8w4HLVGB` |
| Regista · onda 2 · terza, da non usare dopo il passaggio (501 mila token) | `session_015BmpnYzJKvQoMML3LmU8aJ` |
| riparatori R13-R24 dell'onda 2 | id in `consegne/riparazioni/2026-11-12-sito-tutto/sessioni.json` |
| Regista · onda 2 · seconda, da non usare dopo il passaggio (472 mila token) | `session_015BmpnWRS6TmZUqTtjQ5fX7` |
| «Ondata 2», prima regista dell'onda 2: oltre 450 mila token, inoltra solo i messaggi | `session_015BmpnZcs1XvqxGKUA3qRGC` |
| AD, quinta chat (dal 13/11 alle 04:39) | `session_015BmpnYWmNDPKAztZMPww6M` |
| AD quarta chat, da non usare (508 mila token) | `session_015BmpnVpk1kywXGH5kMWQTH` |
| AD terza chat, da non usare (471 mila token) | `session_015BmpnZ5ufx6s554FgYbUju` |
| CI della macchina in 3 minuti | `session_015BmpnWjSJvwxssvANzndUF` |
| Radiografia del codice · seguito (dal 13/11 alle 03:28) | `session_015BmpnZCaWUijDqfTAvJ4Dx` |
| Radiografia del codice, da non usare (partita prima delle regole nuove) | `session_015BmpnXaAEDNzGNRCfhqygd` |
| AD seconda chat, da non usare (390 mila token) | `session_015BmpnXznpQwCRc8GAKjgyw` |
| AD vecchia, da non usare | `session_015BmpnWWfcmEfYEhQ25M7s2` |
| regista del risolutore, onda 1, ferma | `session_015BmpnXsL6Y7tP3BhawauHw` |
| radiografia in sessioni | `session_015BmpnVn722KGUHR5nRn23Z` |

## La quota
| Quando | Chi l'ha vista | Stato |
|---|---|---|
| 13/11 13:17 | la quinta regista (`…VzbMLH`) | get_session non mostra né avviso né uso extra, e nemmeno il contatore del costo. Ultimo stato noto: avviso fino al 19/11 alle 10. Detto all'AD |
| 13/11 08:06 | la quarta regista (`…VkmAAN`) | come alle 07:05. L'onda 2 è a circa 510 $ di listino (17% della settimana, stima), oltre i 435 $ detti. Detto all'AD, urgente |
| 13/11 07:05 | `…YzJKvQ` | sempre in avviso, senza uso extra; si rinnova il 19/11 alle 10. Già noto all'AD: ripetuto nel messaggio delle 07:05 |
| 13/11 06:16 | la regista nuova (`…WRS6Tm`) | sempre in avviso, senza uso extra; si rinnova il 19/11 alle 10. Le figlie dell'onda 2 sono a 38 $ di listino. Detto all'AD |
| 13/11 05:21 | chat «Ondata 2» | sempre in avviso, senza uso extra. Il rinnovo è il 19/11 alle 10. Detto all'AD |
| 13/11 03:45 | AD, quarta chat | la sessione della CI è a 36,8 $ contro un tetto di 30, e a 761 mila token, vicino alla compressione (784 mila). Detto a Nicola. Quota ancora in avviso |
| 13/11 03:38 | AD, quarta chat | ancora avviso, nessun extra in uso: si rinnova il 19/11 alle 10 |
| 12/11 23:33 | AD | avviso: il limite settimanale si avvicina, si rinnova il 19/11 alle 10 |
