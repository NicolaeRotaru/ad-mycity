---
tipo: bacheca
aggiornato: 2026-11-13 13:38
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
| 13/11 05:03 circa | chat del codice, quattro risposte | Sulla radiografia. Adesso guarda solo il sito, ma dovrà servire anche per la macchina e per altro. Prende le regole del risolutore fin dove si può. Si fa quello che ho proposto: un manuale solo, le regole in un posto solo, il 9 come profilo, le vecchie spente per ultime. In più la vuole «ibrida», e chiede se si può senza perdere prestazioni e qualità. Le prestazioni si misurano su una copia vecchia con difetti già noti. Chiede anche le risposte alle quattro domande sul metodo |
| 13/11 04:52 circa | chat del codice, sulla radiografia | «hai capito la radiografia»: conferma la lettura delle 04:30. Chiede di dire se la radiografia, così come viene fatta, è corretta e rende il massimo. Servirà anche per la macchina, anche se adesso la usa sul sito. Domanda se conviene metterla dentro la strategia di radiografia che esiste già. Restano aperte la deroga e i tempi, e quali minori entrano |
| 13/11 04:42 circa | chat del codice, sul 9 | «la tua proposta per il 9». Sceglie come si certifica il 9 nei cinque voti. Durante il lavoro guidano i criteri, uno per voto, controllati da un programma. Alla fine i tre senior rifanno il giudizio una volta sola, con lo stesso metro del 5,4. Il voto finale lo firma Nicola |
| 13/11 04:33 | GitHub | Ha unito la richiesta del sito mycity#288, l'onda 1, con «Create a merge commit» (`a19ff89`). Vercel pubblica da solo. I controlli sulla produzione li fa la terza chat, su accordo con l'AD delle 04:37 |
| 13/11 04:30 circa | chat del codice, mezz'ora dopo | «voglio che usi la strategia della radiografia». «e controlla se gli sono state inserite le regole del risolutore». «ed inserire tutti i difetti dentro il reparto dei difetti dentro il pannello/macchina/ad». «dimmi cosa hai capito». **Da confermare.** Come l'ho capita: prima si controlla che la skill della radiografia abbia le regole del risolutore e delle sessioni, e si aggiunge quello che manca. Poi la radiografia cerca sul sito quello che tiene i cinque voti sotto 9. Ogni difetto trovato entra nel registro dei difetti. Cambia la decisione delle 01:30, che teneva il giudizio fuori dal registro. Finché Nicola non conferma, nessuna regola cambia e nessuna radiografia parte |
| 13/11 entro 04:13 | AD, quarta chat | «scelgo la A»: prima di unire la mycity#288 l'AD toglie la migrazione 350 del bonifico, che torna nell'onda 2. Fatto alle 04:18, commit `b868e37` |
| 13/11 04:10 circa | chat del giudizio sul codice | «ciò che devi dirmi tu è come risolvere i problemi nel codice per rendere tutti i punti un voto 9 su 10. dimmi cosa hai capito». Vuole il piano per portare a 9 tutti e cinque i voti del giudizio sul codice del sito. Prima la conferma di cosa ho capito; il codice non si tocca |
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
| 13/11 entro 01:32 | AD | Analisi di cosa può cambiare la stima dell'onda 2, con i freni nelle regole |
| 13/11 entro 01:30 | Radiografia del codice | Sul codice del sito vuole un giudizio da professionista, non altri difetti nel registro: le misure del referto non si caricano come voci |
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
| AD | parla con Nicola, tiene la memoria e la bacheca | `MyCity-Vault/90-Memoria-AI/`, regole di scrittura |
| AD, quarta chat | 13/11 03:38: ripara il rosso della CI dentro la #949. Il commit `3a5778e` di Nicola (card 236) ha tolto il permesso del database, ma in `cervello/permessi-debito.json` era rimasta la sua scusa, e la prova `permessi-di-guardia` la boccia. Cade anche `main`, non solo la #948. Quando la #949 è unita, la #948 si rilancia | `cervello/permessi-debito.json` |
| regista (`…XsL6Y7`) | ferma a 450 mila token: passaggio scritto in fondo a `consegne/riparazioni/2026-11-12-sito-tutto/REGIA.md` (13/11 01:35). L'onda 2 la guida una regista nuova, aperta dall'AD al «via la seconda» | la campagna del 12/11, la skill `riparazione` |
| CI della macchina | Finita: Nicola ha unito la #948 alle 03:44 (`92b4c15`). Il cancello ci mette 2 min 28 s, prima 10 min 21 s. Prima dell'unione la sessione ha riparato le due cause del rosso: la scusa dei permessi e Ubuntu 26.04. Alla fine era a 36,8 $ su 30 | nessuno |
| Radiografia del codice · seguito 2 (`…YkmzPU`) | dal 13/11 alle 05:11 prende il posto di `…ZCaWUi`, ferma a 429 mila token. Segue la richiesta del giudizio sul codice del sito (ad-mycity#947), e alle 05:11 ripara il suo conflitto con la #950. Aspetta il sì di Nicola sui sei passi della radiografia ibrida, la data e la deroga per il sesto passo. Il codice del sito non lo tocca senza la sua firma. Il manuale della radiografia lo cambia solo d'accordo con `…Vn722K` e con l'AD | `consegne/audit/2026-11-13-giudizio-codice-sito.md`, `consegne/audit/2026-11-13-passaggio-radiografia-ibrida.md` |
| radiografia | finita: aspetta il «via» alla prima corsa | la skill `radiografia-sessioni`, il suo programma |

## Le sessioni vive
| Ruolo | Id |
|---|---|
| AD, quinta chat (dal 13/11 alle 04:39) | `session_015BmpnYWmNDPKAztZMPww6M` |
| AD quarta chat, da non usare (508 mila token) | `session_015BmpnVpk1kywXGH5kMWQTH` |
| AD terza chat, da non usare (471 mila token) | `session_015BmpnZ5ufx6s554FgYbUju` |
| CI della macchina in 3 minuti | `session_015BmpnWjSJvwxssvANzndUF` |
| Radiografia del codice · seguito 2 (dal 13/11 alle 05:11) | `session_015BmpnYkmzPU2BsTXe1ZWwu` |
| Radiografia del codice · seguito, da non usare (429 mila token) | `session_015BmpnZCaWUijDqfTAvJ4Dx` |
| Radiografia del codice, da non usare (partita prima delle regole nuove) | `session_015BmpnXaAEDNzGNRCfhqygd` |
| AD seconda chat, da non usare (390 mila token) | `session_015BmpnXznpQwCRc8GAKjgyw` |
| AD vecchia, da non usare | `session_015BmpnWWfcmEfYEhQ25M7s2` |
| regista del risolutore | `session_015BmpnXsL6Y7tP3BhawauHw` |
| radiografia in sessioni | `session_015BmpnVn722KGUHR5nRn23Z` |

## La quota
| Quando | Chi l'ha vista | Stato |
|---|---|---|
| 13/11 13:38 | chat del codice (`…YkmzPU`) | uguale a quella delle 03:38, e l'extra resta spento. La chat del codice è a 324 mila token, sotto la soglia di 400, e costa circa 7 $ |
| 13/11 03:45 | AD, quarta chat | la sessione della CI è a 36,8 $ contro un tetto di 30, e a 761 mila token, vicino alla compressione (784 mila). Detto a Nicola. Quota ancora in avviso |
| 13/11 03:38 | AD, quarta chat | ancora avviso, nessun extra in uso: si rinnova il 19/11 alle 10 |
| 12/11 23:33 | AD | avviso: il limite settimanale si avvicina, si rinnova il 19/11 alle 10 |
