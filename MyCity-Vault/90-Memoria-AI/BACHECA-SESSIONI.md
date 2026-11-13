---
tipo: bacheca
aggiornato: 2026-11-13 03:36
regole: cervello/sessioni-insieme.md
---

# La bacheca delle sessioni

> **In due righe.** Qui stanno le decisioni di Nicola, chi fa cosa e gli id delle sessioni vive. Oggi l'AD è la terza chat,
> e la sessione della CI porta i controlli della macchina sotto i 3 minuti.

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
| AD | parla con Nicola, tiene la memoria e la bacheca | `MyCity-Vault/90-Memoria-AI/`, regole di scrittura |
| regista (`…XsL6Y7`) | ferma a 450 mila token: passaggio scritto in fondo a `consegne/riparazioni/2026-11-12-sito-tutto/REGIA.md` (13/11 01:35). L'onda 2 la guida una regista nuova, aperta dall'AD al «via la seconda» | la campagna del 12/11, la skill `riparazione` |
| CI della macchina | Finita alle 03:33, al tetto: 29,55 $ su 30. Il cancello del lotto ora ci mette 2 minuti e 36 secondi, prima 10 e 21. Il test del cervello ci mette 2 minuti e 20, prima circa 5. Nessun controllo tolto. La richiesta #948 è in bozza, e l'ultima corsa su `0f204ff` la segue l'AD | `.github/workflows/`, `cervello/cancello-lotto.mjs` |
| Radiografia del codice · seguito (`…ZCaWUi`) | segue la richiesta del giudizio sul codice del sito (ad-mycity#947) e aspetta Nicola su due scelte: le quattro librerie con falle note da aggiornare prima di domenica 15/11, e il piano con i costi del riordino dopo il lancio. Il codice del sito non lo tocca senza la sua firma | `consegne/audit/2026-11-13-giudizio-codice-sito.md` |
| radiografia | finita: aspetta il «via» alla prima corsa | la skill `radiografia-sessioni`, il suo programma |

## Le sessioni vive
| Ruolo | Id |
|---|---|
| AD, terza chat (dal 13/11 alle 02:20) | `session_015BmpnZ5ufx6s554FgYbUju` |
| CI della macchina in 3 minuti | `session_015BmpnWjSJvwxssvANzndUF` |
| Radiografia del codice · seguito (dal 13/11 alle 03:28) | `session_015BmpnZCaWUijDqfTAvJ4Dx` |
| Radiografia del codice, da non usare (partita prima delle regole nuove) | `session_015BmpnXaAEDNzGNRCfhqygd` |
| AD seconda chat, da non usare (390 mila token) | `session_015BmpnXznpQwCRc8GAKjgyw` |
| AD vecchia, da non usare | `session_015BmpnWWfcmEfYEhQ25M7s2` |
| regista del risolutore | `session_015BmpnXsL6Y7tP3BhawauHw` |
| radiografia in sessioni | `session_015BmpnVn722KGUHR5nRn23Z` |

## La quota
| Quando | Chi l'ha vista | Stato |
|---|---|---|
| 12/11 23:33 | AD | avviso: il limite settimanale si avvicina, si rinnova il 19/11 alle 10 |
