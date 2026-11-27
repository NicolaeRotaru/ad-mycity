---
data: 2026-11-27 02:10
tipo: quaderno di bordo della regia
campagna: i 200 risolti del 27/11 (strada B, tetto 3.000 $), seguito della riparazione del 26/11
---

# Regia · 200 difetti risolti, e se si può 400

## In parole semplici
Il 27/11 verso le 02:00 Nicola ha chiesto 200 difetti del sito risolti davvero, «e se riesci 400», con un tetto di 3.000 $.
97 risolti sono già pronti nella riparazione del 26/11 (mycity#342, in bozza): mancano il controllore finale e l'unione di Nicola.
Questa campagna lavora i 320 difetti rimasti che non chiedono Nicola, partendo dal codice di quella riparazione.
Per esempio: i 39 difetti rimasti a metà il 26/11 ripartono dalla correzione già scritta, non da zero.

## Cosa cambia per te
Niente: lavora la macchina. Le unioni sul sito restano di Nicola.

## Cosa devi fare
Segui «Il piano». Il via di Nicola copre tutte le onde dentro il tetto: alle fermate scrivi all'AD e vai avanti.

## Cosa non ho verificato
Che le voci rimaste a metà il 26/11 siano ancora a metà sul codice di oggi: la scheda è un indizio, comanda il codice.

## Dettagli tecnici
- AD: session_015BmpnWXi7guL4RmfTAwzbU (fermate ed esito con send_message). Ramo ad-mycity e sito: `ccr-819e0c8d-7ryjjr`; riparatori `ccr-819e0c8d-7ryjjr-mNN`.
- Base del sito: **main @ 2ba05a74de2e9ad96fa94178df89711923119b0e** (Nicola ha unito la #342 alle 01:49; correzione dell'AD alle 02:25). Prima era l'integrazione del 26/11 `f1b35670`, che è un genitore di main. Integrazione della campagna sul sito: `ccr-819e0c8d-7ryjjr` @ 2ba05a74. Le 9 migrazioni della #342 non sono applicate: non toccare il database vero.
- Registro: `registro-26-11.json`, fuori da git perché pesa 11,7 MB: lo ricrei con `git show de5836c5fd91b249cc62f94462c454bb2b49c51a:MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json > <C>/registro-26-11.json` (il registro del ramo del 26/11, con i suoi 41 nati: 646 aperti). Si passa con `--registro`.
- Perimetro (`tutto/`): 466 lavorabili. `lavorabili-ora.mjs`: fuori 97 che si chiudono con la #342, 49 che chiedono Nicola → **320** (1 che blocca il lancio, 33 gravi, 286 minori). Di questi 122 lavorati il 26/11 (39 parziali, 30 file altrui, 36 non fatti, 15 riparati senza verdetto, 2 già riparati), 198 mai toccati.
- Le 43 con file di migrazione (`chiavi-con-migrazione.txt`) vanno in un'onda a parte, alla fine: `dividi` dà fasce da 1000 in su e il sito ordina i file per byte (1000_ prima di 100_). Difetto AR-1194. Nelle onde 1-2 **nessuna migrazione nuova**: se una voce la chiede, resta parziale con l'SQL nel referto.
- Onda 1 (`onda1/`, `dividi --per-sessione 16`): 12 sessioni, 174 voci (26 gravi), 103 all'onda 2. Schede da scrivere: `schede --cartella <C>/onda1 --ramo ccr-819e0c8d-7ryjjr --regista <id>`, poi `copertura-prima` e `segnaposti`.
- La preparazione di prima (200 dalla base main, si sovrapponeva al 26/11) è in `superata/`.

## Preventivo (dalle misure: 26/11 senza ultracode 10,3 $ a chiuso, circa 3,3 $ a voce data)
Onda 1 circa 575 $ · onda 2 circa 340 $ · migrazioni circa 170 $ · correzioni circa 270 $ · regia circa 150 $ → **circa 1.500 $** (stima_usd 1500). Chiusi attesi 145-165 sui 320, più i 97 della #342: **circa 240-260 risolti**. 400 si avvicinano solo con le risposte di Nicola (64 domande, 49 voci sue) e il binario riservato (96).

## Il piano
0. Il controllore finale della #342 lo apre l'AD della campagna del 26/11 (session_015BmpnWupeVireM1DyLQB3e), avvisato dall'AD alle 02:10. Non aprirlo tu: segui solo l'esito.
1. Onda 1: 12 riparatori senza ultracode (`effort: "xhigh"`, `permission_mode: "auto"`), limite 25 $ con gravi e 20 $ minori; 4 collaudatori; unione; C01.
2. Giro di correzione dopo ogni unione: bocciate, parziali, file altrui, nati senza Nicola (regola del 14/11 e Nicola 26/11).
3. Onda 2: le 103 rimaste, dall'integrazione dell'onda 1. Poi l'onda delle migrazioni quando la numerazione oltre 999 è decisa (chiedila all'AD).
4. Avanti finché restano solo voci di Nicola o finisce il tetto. PR del sito in bozza, controllore finale, unione di Nicola, `chiudi-sito`.

## Regole da tenere
Tetto 3.000 $ rigido: a 2.250 $ misurati non si apre niente di nuovo senza l'AD. Sopra 12 $ a chiuso lo dici all'AD col numero. Niente ultracode. Lotti al massimo da 16. Niente id di altre voci nei commit. Controllo a 10 minuti con list_sessions. La regia passa la mano a 400 mila token (firma del 24/11). Riga in `cervello/riparazione/misure.json` a fine onda. Voci che chiedono Nicola: in `per-nicola.md`, senza fermate. Ci si ferma solo per la lista «Quando ti fermi» della skill (tranne la conferma fra un'onda e l'altra, già data).

## Scelte di Nicola
- 2026-11-27 01:15 «Riesci a riparare 200 difetto adesso, e dico 200 esatti».
- 2026-11-27 01:35 «A», poi fermata dall'AD: si sovrapponeva al 26/11 (vedi `superata/`).
- 2026-11-27 ~01:55 «No scusa la B. 200 esatti difetti risolti. E se ne riesci cerca di arrivare anche a 400. C'è la puoi fare.» Alle domande dell'AD: tetto **3.000 $**, limite settimanale **sotto il 50%**.

## Diario della regia
- 2026-11-27 02:35 Regista nata (session_015BmpnYPczqtRmcwQzQzjV6). Limite settimanale `allowed_warning`, senza uso extra: il via di Nicola copre le onde dentro il tetto.
- 2026-11-27 02:50 Schede dell'onda 1 scritte, con in fondo le note del 26/11 voce per voce (`regole-campagna.md` entra nel primo messaggio). Il registro del 26/11 serve anche ai riparatori: lo ricreano fuori dal deposito e lo passano con `--registro`.
- 2026-11-27 02:58 Arriva la correzione dell'AD sulla base. Fermate le aperture: era nata solo R05 (0,25 $), interrotta. Rifatti `perimetro` e `dividi --per-sessione 16` su 2ba05a74: divisione identica (12 sessioni, 174 voci, 26 gravi; 103 all'onda 2). Schede riscritte, controlli verdi, SHA_REGISTA 0c9469a8.
- 2026-11-27 03:05 R05 rimessa in moto con la correzione (stessa sessione, ramo rifatto da 2ba05a74). Aperte le altre 11.
- 2026-11-27 03:20 Tutte e 12 aperte e al lavoro (`onda1/sessioni.json`), nessuna ferma. Piani approvati: R01, R02, R05, R06, R07, R08, R09, R10, R11; attesi R03, R04, R12. Scelte della regia: un revisore può guardare due gravi insieme, mai mescolati coi minori; R06 ha 9 subagenti invece di 8. La spesa di una figlia si legge con `get_session` col suo id scritto: senza id il campo `usage` non c'è.
- Falso allarme del cancello dello stop: l'esenzione delle schede (`eSchedaRisolutore`) non copre `<C>/onda1/schede/`. Da dire all'AD come difetto della macchina.
- 2026-11-27 03:25 Tutti i 12 piani approvati (R03 fino a 10 subagenti, R04 revisori rifatti). La regia prima passa la mano a 356 mila token: `PASSAGGIO.md`. Regia seconda aperta dalla prima.
- 2026-11-27 02:30 Regia seconda nata (session_015BmpnXMPYJa9T9pP6LW8kP). Avvisate le 12 figlie, `sessioni.json` col suo id. Sito clonato in `/home/user/mycity`, collegato come `marketplace`. Registro del 26/11 ricreato. Main del sito è andato avanti a 1bf83687 (mycity#344, 8 file sotto `lib/agenti/`, nessuno della campagna): la base resta 2ba05a74.
- 2026-11-27 02:30 Primo giro: R01, R02, R05, R06 spinti, gli altri 8 no; nessuna figlia ferma. R02 guardia rossa: ha toccato la prova comune `la-chat-mostra-la-proposta-che-il-server-applica.test.ts` (importa file di altre sessioni). Detto a R02 di riportarla alla base e lasciare le 7 righe nel referto: le applica la regia sull'integrazione prima di `npm run verify`. Spesa alle 02:30: R01 5,76 $, R03 5,53 $. Sorveglianza muta (`sorveglia.sh --attendi`) accesa.
- Il difetto del cancello dello stop (passo 5 del passaggio) l'ha già registrato l'AD (5f2b1b5).
- Nota sugli orari: dalla regia seconda le ore vengono da `TZ=Europe/Rome date`. Le righe della prima dalle 02:35 alle 03:25 sono circa un'ora avanti: la prima è nata alle 01:52 di Piacenza (00:52 UTC).
- 2026-11-27 02:36 Spinti anche R04, R07, R09. R04 guardia rossa per lo stesso motivo di R02: ha toccato la prova comune `riparazione-r07-reso-pane.test.tsx`. Stessa istruzione: la riporta alla base e lascia la modifica nel referto, la applica la regia. Spesa letta male da R01 (scriveva 2,57 $, misurati 5,76) e R03 (0,77 contro 5,53): detto il numero vero; la regia ricontrolla la spesa a ogni risveglio.
- 2026-11-27 02:53 Giro sulla spesa, misurata con get_session per id: R01 13,88 · R02 13,43 · R03 12,11 · R04 11,03 · R05 14,20 · R06 10,28 · R07 17,68 · R08 9,31 · R09 14,98 · R10 11,97 · R11 14,24 · R12 7,75 → circa 151 $ per i 12 riparatori (limiti 275 $). Oltre il 70%: R07, R09, R11, detto a ognuno niente lotti nuovi e un tetto duro. R09 guardia rossa su due prove comuni (stessa istruzione di R02 e R04). R05 parte davvero da 2ba05a74 anche se la sessione dichiara f1b35670.
- 2026-11-27 03:02 R12 finito (referto 2320bd2f, spesa 18,75 $): 2 riparati, 3 parziali, 6 già riparati, 1 file altrui; valida-referto con --registro verde, guardia rossa per il nome di un file d'aiuto nuovo (`finto-r12-…`): chiesto il rinomino, poi va al collaudo. Una falla riservata dei pagamenti è arrivata solo in chat: resta fuori dal deposito, va all'AD alla fermata. R10 oltre il 70% (14,43 $) si ferma da solo: una voce ritirata col revert perché rompeva altro.
- 2026-11-27 03:06 R11 finito e verde. Aperto K01 (session_015BmpnXZw6B1LCCHKMiTyZb) su R11, partenza 74938e41 (stessi programmi di SHA_REGISTA, ma con `sessioni.json` dentro: a 0c9469a8 la cartella dell'onda non c'era). Nel primo messaggio: niente ultracode, registro del 26/11 con --registro, prove comuni da giudicare con la nota, tetto 30 $. R12 va a K01 dopo il rinomino.
- 2026-11-27 03:07 R03 finito e verde, passato a K01: 1 riparato, 2 parziali, 1 già riparato, 12 non fatti per 17,13 $. Costo per chiusa sopra i 12 $: da dire all'AD alla fermata col numero.
- 2026-11-27 03:08 R07 finito e verde, aperto K02 (session_015BmpnYhCRtBMUTLYxub3cz) su R07. R03 segnala un grave nuovo da verificare sui rimborsi in contanti (la quota del negozio tolta due volte): è nei nuovi difetti del referto. R11 ha lasciato una seconda falla riservata solo in chat: va all'AD alla fermata.
- 2026-11-27 03:09 R09 finito e verde, passato a K02: 1 riparato, 7 parziali, 2 già riparati, 4 file altrui, 1 scelta di Nicola, 1 non fatto per 17,77 $. Anche qui oltre 12 $ a chiusa. La correzione di R09-006 (d7e3261) non va ripresa così: il revisore ha trovato un passo indietro.
