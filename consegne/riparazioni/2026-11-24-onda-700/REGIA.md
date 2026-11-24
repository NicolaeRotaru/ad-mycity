---
data: 2026-11-24 11:45
tipo: quaderno di bordo della regia
campagna: onda dei 700 (24/11), seguito della settimana dei 700 (21-23/11)
---

# Regia · la nuova onda dei 700

## In parole semplici
Questo quaderno serve alla regia per partire senza rileggere la chat.
Il 24/11 Nicola ha chiesto di risolvere 700 difetti in una settimana.
I conti dicono che in una settimana se ne chiudono 130-170: i 700 non ci sono nemmeno (gli aperti del sito sono 624).
Si parte solo col suo «via» sui passi e col tetto che dà lui.

## Cosa cambia per te
Niente finché Nicola non dice «via». Poi i passi qui sotto, uno alla volta.

## Cosa devi fare
Segui «Il piano» qui sotto, dal primo passo col via di Nicola.

## Cosa non ho verificato
La quota vera: la percentuale del limite settimanale la vede solo Nicola in app.
La resa del ricontrollo lampo: è stimata, non misurata su queste voci.

## Dettagli tecnici

- AD: session_01R8112Lzth8WvHHrQ4H3whZ (le fermate vanno lì con send_message).
- Ramo di ad-mycity: `ccr-d7a54140-hak4ez` (nato dalla punta di `claude/settimana-700-regia` @ e930741: porta anche le 70 chiusure e la memoria dei giri del 22-23/11, mai arrivate su main).
- Base del sito: `main` @ 5b8c786c96ec789918b3e85361ca435cef726b92 (SHA intero in source_revision: lo SHA corto ha fermato C02 per 52 minuti).
- Perimetro (24/11 11:20): 624 aperti · 452 lavorabili (4 bloccanti, 46 gravi, 402 minori) · fuori 89 riservate, 65 con domanda (`domande-per-nicola.md`), 18 senza percorso.
- Filtro dei delicati sul testo (`filtro-delicati.mjs`, regola 4): 349 delicati (tutti i 50 gravi e bloccanti) · 103 normali. Le chiavi in `chiavi-delicati.txt` e `chiavi-normali.txt`.
- Divisione a 16 voci: `normali/` 7 sessioni, 103 voci, nessuna dopo · `delicati/` onda 1: 12 sessioni, 192 voci (45 gravi), 157 alle onde dopo. I delicati si ridividono dall'integrazione dei normali (i numeri R e le fasce di migrazione oggi coincidono).
- 198 lavorabili hanno almeno un file cambiato sul sito fra 1ad51b4c (21/11) e la base: sono il ricontrollo lampo (`prepasso.mjs` della cartella del 21/11, poi `radiografia-sessioni.mjs`).
- Preventivo: `preventivo.json` (passi 1-4, 1.300-1.900 $, 130-170 chiuse).

## Il piano (si parte col via di Nicola, un passo alla volta)
1. Ricontrollo lampo delle 198 voci (circa 50 $). Le voci sparite si chiudono senza riparazione.
2. Le 103 normali: 7 riparatori senza ultracode, `effort: "xhigh"`, `permission_mode: "auto"`, 3 collaudatori, 1 controllore (circa 215 $).
3. I delicati onda 1: solo col sì di Nicola al costo per chiusa (circa 15 $, sopra la soglia di 12 $).
4. I delicati onda 2 e le correzioni.
Regole da tenere (lezioni del 22/11): SHA interi; controllo a 10 minuti anche per collaudatori e controllori; le firme sulle prove comuni si chiedono PRIMA del via; la «prova spenta» non si deroga; la regia passa la mano a 250 mila token; riga in `cervello/riparazione/misure.json` a fine giro.

## Scelte di Nicola
- 2026-11-24 11:58 Nicola: «Via», in risposta alla proposta dell'AD (passi 1 e 2 subito, circa 265 $; delicati dopo il rinnovo di giovedì 26/11 alle 10, se il costo per chiusa tiene).
  - Via dato: **passo 1 (ricontrollo lampo) e passo 2 (103 normali)**. Il passo 3 NON parte senza un sì nuovo di Nicola, e non prima del rinnovo.
  - Tetto dei passi 1 e 2: **360 $** (il massimo delle due forchette: 60 + 300). La percentuale della quota non l'ha data: il tetto è rigido, oltre ci si ferma e si dice all'AD (regola 2 del 15/11: non si alza a metà).
  - Mandato stretto: non ha risposto → restano le regole di sempre (i nati vanno nel registro, R-B).
  - Le 65 domande: non ancora risposte.
- 2026-11-24 17:03 Nicola, scritto nella chat della regia settima: «A» alla fermata delle 15:25 → giro di correzione nel tetto (circa 22 voci delle 44 più il collaudo delle 11), tetto sempre 360 $. Firme sulle prove comuni e domande: non date.
- 2026-11-24 17:20 Nicola, chat della regia settima: «Fai anche le 11 che aspettano la mia firma» → FIRMA sulle prove comuni per le 11 voci R01-004, R01-014, R06-013, R02-014, R03-009, R03-010, R01-008, R07-013, R02-004, R06-008 (cherry-pick 99c4faf1), R07-007 (cherry-pick 602c64d7). Si fanno in un'onda 3 tutta loro, dopo l'unione di R08-R10 (R01-004 tocca lib/ai/tettoSpesa.ts di R08), con `eccezioni_firmate: [{onda: 3, regole: ["prove_comuni", "prova_esistente_altrui"], firma: "Nicola 2026-11-24 17:20: «Fai anche le 11 che aspettano la mia firma»"}]` nel piano. Costo stimato 15-20 $: supera il tetto di 360 $, chiesto a Nicola se alzarlo.
- 2026-11-24 17:21 Nicola, chat della regia settima: «Sì, alza il tetto a 380» → **tetto totale 380 $**: 360 $ per i passi 1 e 2 (giro di correzione compreso) + 20 $ per l'onda 3 delle 11 voci firmate. Oltre 380 ci si ferma.
- 2026-11-24 17:23 Nicola: «Dalla prossima ondata ti occupi solo di quelle che puoi risolvere, lasciando da parte quelle che mi servono: firme, risposte o cose che devo fare io». Dalle onde prossime si lavorano solo le voci risolvibili senza Nicola; le voci che chiedono una sua firma, una sua risposta o un suo gesto (domande, scelte, non_codice, migrazioni da applicare) restano da parte, senza fermate. Conto alle 17:23 sul registro (610 aperti): senza Nicola 398 (289 delicati senza migrazioni, 89 riservate, 20 normali: 11 firmate, 5 rimandate, 4 pagamenti) + 31 in lavoro; 18 senza percorso da capire; 50 con una migrazione (codice nostro, applicazione sua); 77 tutte sue (65 domande, 8 scelte, 4 non codice); 36 pronte all'unione. Il passo 3 resta col suo sì sul costo e dopo il rinnovo del 26/11 alle 10.

- 2026-11-24 19:01 Nicola, all'AD: «A» alla fermata delle 18:42 → **tetto totale 390 $**. Ordine: C02 sulle modifiche nuove (circa 4 $), poi l'onda 3 delle 11 voci firmate (circa 20 $), poi il ricollaudo K06 delle 8 voci lasciate da K04 (circa 5 $). Le 13 voci di `onda3-se-440.txt` restano fuori senza il suo sì scritto. Spesa misurata alle 19:05: 361,27 $ (350,51 fino all'ottava + K05 6,19 + regia nona 4,57): restano 28,73 $, regia decima compresa. Con 1 $ di margine i tre pezzi stanno stretti: se la proiezione passa 389 $, il ricollaudo K06 si ferma e lo si dice all'AD.

## Ancora aperto per Nicola dal giro prima
Cancellare i rami `claude/settimana-700-regia-cf`, `-s01`, `-s01b`, `-s01c`, `-s01d` (ad-mycity) e `-m10` (mycity); migrazione 703; scelte R17-002/003, R17-010, R18-004, R14-002, R15-015, S02-04; giro riservato (S02-02, -05, -06, 4 nati di KS02, S02-04, S02-08).

## Fermo su (compattato il 2026-11-24 15:20; la storia minuto per minuto è nel git del ramo)
- Regie: prima session_01R8112LxmCk5Y1BXWKNWKCY (10,32 $), seconda session_01R8112LSUYWZ7q4nU6dz1Fa (9,24 $), terza session_01R8112PV6Phn3WXaFfB7G85 (11,78 $, ferma su un clic di delete_trigger: non spende, lasciala così), quarta session_01R8112KaXwxnHLCt8evwChT (4,95 $), quinta session_01R8112PeGJAFQGJ1DtJp6h5 (6,36 $, turno chiuso 15:13), sesta session_01R8112PQqQyV8Ak87dU7bp1 (dal 15:05, non spinge più), settima session_01R8112PFGvwN9iRDAdkSTz1 (dal 15:26, passa la mano alle 17:32 a 384 mila token, 12,67 $, non spinge più), ottava session_01R8112NR6WVqr3y8AwMjC44 (dal 17:31). Giro di correzione: R08, R09, R10, K04 (id e stato in PASSAGGIO.md). Ogni regia la apre l'AD a profondità 1, mai la regia: al passaggio PASSAGGIO.md, push, SHA e riga di apertura all'AD.
- Sito: base 5b8c786c96ec789918b3e85361ca435cef726b92. Clone col git normale in /home/user/mycity; niente add_repo senza avvisare l'AD.
- **Passo 1 chiuso** (13:00): 141 voci ricontrollate, 14 chiuse nel registro (624 → 610), 50,65 $.
- **Passo 2**: R01-R07 (rami -m01…-m07) consegnati verdi; collaudi K01 (R03, R02, R01), K02 (R05, R04, R06), K03 (R07), tutti archiviati. Rompono altro R01-005 e R07-001: revertite. Prove comuni di R01, R06, R07 senza firma di Nicola: tolte dai rami (voci → serve_file_altrui col diff); con la firma, la regia riapplica (R06-008 = cherry-pick 99c4faf1, R07-007 = 602c64d7).
- Unione spinta (15:00): ramo ccr-d7a54140-hak4ez @ a673164da05ab165480595967128d01795601ba9, albero 1bc16e41. npm run verify verde (2088 file, 12.674 prove), harness SQL verde (226 migrazioni, 91 file).
- 2026-11-24 15:13 C01 session_01R8112MCedazmwF5a39XHqD finita e archiviata: 0 voci rosse su 103, 2 nati minori, 6,33 $, nessuna chiamata al database vero. Referto copiato in normali/controlli/C01.json (sul ramo -c01 solo quel file, 5b522b55a5d0e55045a739b541bdaa5c77bbf700).
- 2026-11-24 15:54 Revert di R07-001 COMPLETO e spinto (clic di Nicola su add_repo): d000e3b04bc9d12ab160f5ebc55c0d665fc6e5a9 revert di 55d79fba su a673164d. page.tsx uguale alla base, la prova di R07-001 sparita. tsc 0, eslint 0, 6 file di prova vicini verdi (25 prove); vitest completo della sesta: 2087 file, 12.670 prove, verde. **Integrazione del sito per il giro di correzione: ccr-d7a54140-hak4ez @ d000e3b04bc9d12ab160f5ebc55c0d665fc6e5a9.**
- 2026-11-24 15:18 applica a vuoto con C01 verde: 21 si chiudono, 15 già riparate, 67 aperte, 31 nati (29 + 2 di C01). conti verde: 103 aperte nel registro.
- Le 67 aperte: 8 scelta di Nicola, 4 non codice (fuori dal giro) · 2 rompono altro (R01-005 a R01, R07-001 a R07) · 23 a metà · 19 file altrui · 11 riparate senza verdetto pieno (al collaudo).
- Spesa MISURATA 2026-11-24 17:55 (get_session): 350,51 $ (fino alla quarta 278,01 · quinta 6,36 · C01 6,33 · sesta 5,51 · settima 16,00 · R08 10,66 · R09 5,66 · R10 4,30 · K04 12,27 · ottava 5,41). Tetto 380 = 360 passi 1-2 + 20 onda 3.
- Per il giro di correzione: R02-004 = i 5 diff dei finti del referto di R02 (due fanno il mock di lib/logger, di R03), poi cherry-pick a6bee2db; R06-007 vuole STORAGE_SYNC_STORICO se la copia va su una destinazione cifrata; per R03-003 e R03-006 l'avviso di K01 (commit a76a1a6). Le domande per Nicola: elenco nel commit 176e0c4 e in PASSAGGIO.md.
- 2026-11-24 17:36 K04 chiuso dalla regia ottava per tetto e archiviato (12,27 $): punta c69d997906944b9f40c1c47346e13933532f627a, guardia-ramo e valida-collaudo verdi. Giudicate 4 voci di R02 (R02-009, R02-010, R02-012 reggono; R02-005 parziale). Senza verdetto, da ricollaudare: R01 (5 voci), R02-001, R02-002, R07-014.
- 2026-11-24 17:57 Giro di correzione consegnato, tutti verdi (guardia-ramo, valida-referto --ramo, prova-unione --onda 2) e archiviati: R08 -m08 ab803f50178b8b4f460534aa4cc167cbf5743630 (6 riparate + 1 già prima), R09 -m09 38d213fc34322a4c945a86bb4b26cb0b78a54d8e (6 riparate, 1 parziale), R10 -m10 fd69bb04288ed2558423c16681ddc417f49b0e01 (1 riparata, 3 parziali, 1 file altrui). Referti in normali/referti/.
- 2026-11-24 17:46 Fermata sul tetto all'AD: proiezione dei passi 1-2 a circa 369 $. A = tetto 390, B = resta 380 e l'onda 3 cala, C = resta 360 e le 8 di K04 aspettano. Senza risposta: C. Risposta non arrivata alle 17:58.
- 2026-11-24 17:58 La regia ottava passa la mano a 283 mila token (PASSAGGIO.md, riga di apertura della nona dentro).
- 2026-11-24 17:59 Regia nona session_01R8112JxCuigmCaUkgBjJNs (aperta dall'AD alle 17:57). Alle 18:00 nessuna risposta di Nicola alla fermata delle 17:46: vale C (tetto 360 per i passi 1-2). K05 session_01R8112NFfioktgK2UyUJotU dalle 17:59 (R08-R10, 5 $).
- 2026-11-24 18:10 **Unione del giro di correzione spinta** (clic di Nicola su add_repo): -m08, -m09, -m10 su d000e3b0 senza conflitti → **ccr-d7a54140-hak4ez @ 07b237144638b96ca5dee7310fcfb7556d0c6208**, albero f7c45867. npm run verify verde (2103 file, 12.727 prove, lint 0 errori), harness SQL verde (226 migrazioni, 0 fallite).
- 2026-11-24 18:40 K05 finito (6,19 $ sul limite di 5), guardia-ramo e valida-collaudo verdi, punta 20569c3fec514422be31fca125b75297b2b31909: reggono 8, a metà 8 (anche R08-002 e R08-006), rompono altro R09-006 e R09-007 → revert di 10f73a8c e d695062a, file uguali alla base, tsc ed eslint verdi, 10 file di prova vicini verdi: **integrazione ccr-d7a54140-hak4ez @ e173796f6a402d02c9c1ebe748db615ce5ba8dbd**. applica a vuoto: 32 si chiudono, 15 già riparate, 75 aperte, 36 nati. conti verde.
- 2026-11-24 18:42 Fermata all'AD: C02 (4 $) non sta nei 360 (spesa ≥ 359,18). A = 390, B = 380 con C02 preso dall'onda 3 (raccomandata), C = 360 senza C02. Senza risposta: fermi.
- 2026-11-24 18:46 La regia nona passa la mano a circa 235 mila token, sulla fermata (PASSAGGIO.md, riga di apertura della decima dentro).
- 2026-11-24 19:05 Regia decima session_01R8112M7WZeyGuQA6fHFUzp (aperta dall'AD alle 19:01) con la «A» di Nicola: tetto 390 $.
