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

## Ancora aperto per Nicola dal giro prima
Cancellare i rami `claude/settimana-700-regia-cf`, `-s01`, `-s01b`, `-s01c`, `-s01d` (ad-mycity) e `-m10` (mycity); migrazione 703; scelte R17-002/003, R17-010, R18-004, R14-002, R15-015, S02-04; giro riservato (S02-02, -05, -06, 4 nati di KS02, S02-04, S02-08).

## Fermo su (compattato il 24/11 13:25; la storia minuto per minuto è nel git del ramo)
- Regie: prima session_01R8112LxmCk5Y1BXWKNWKCY (9,45 $), seconda session_01R8112LSUYWZ7q4nU6dz1Fa (6,59 $ a 13:20, passa la mano a 294 mila token il 24/11 13:25), terza: vedi PASSAGGIO.md.
- Sito: base dei riparatori 5b8c786c96ec789918b3e85361ca435cef726b92; main 636554b8bc224a3fffb2230b11ca42754319dda2 (24/11 12:50). Clone col git normale in /home/user/mycity, niente add_repo senza avvisare l'AD.
- **Passo 1 chiuso** (24/11 13:00): ricontrollo di 141 voci a main e67ed29, CF verde (19d27af, archiviato); `radiografia-sessioni.mjs applica --scrivi` sul registro vero: 14 chiuse, aperte 624 → 610. Costo 50,65 $ (S01 36,70 + S01b 8,94 + CF 5,01). Residuo Nominatim del CF = voce già aperta nei delicati (rotta geocode riga 46): nessun nato.
- **Passo 2 in corso**: R01-R07 sul sito @ base, rami `-m01`…`-m07`, senza ultracode, tetto 35 $, consegna a 24 $. Correzioni date: R05-008 → serve_file_altrui (la fa R02 nella 832); R02-009 fa «fattorino» anche nella campanella ASSIGNED (commit a parte, detto nel referto); R06-008 solo nella scelta, R06-009 scelta di Nicola.
- La prova tests/sql/rls/48 righe 97-98 (di nessuno in quest'onda): la cambia la regia sul ramo unito, prima di run.sh, col diff che R02 scrive nel referto.
- Giro 24/11 13:20: guardia rossa «prove_comuni» su R01 (tests/unit/riparazione-r04-allarme-ripiego, riparazione-r13-allarme-tetto-dal-cron), R06 (il-ritorno-indietro-non-torna-sullo-stesso-commit), R07 (riparazione-r10-slogan-e-social): serve la firma di Nicola, chiesta alle 12:13 e risollecitata alle 13:25. Referti parziali di R03 (esiti vuoti) e R07 (segnaposti «<sha>»): normali a metà lavoro, da riempire alla consegna.
- Spesa dichiarata dai riparatori (24/11 13:05-13:12): R01 6,00 · R02 14,33 · R03 15,10 · R04 6,32 · R05 0,92 · R06 1,28 · R07 11,99. Proiezione: tutti a 24 $ = ~168 $. Per stare nei 360 $: collaudatori K01-K03 con tetto 20 $ (non 30), controllore C01 15 $.
- Spesa a 13:25: misurata 66,69 $ (passo 1 50,65 + regia prima 9,45 + regia seconda 6,59), più 55,94 $ dichiarati dai riparatori = circa 123 $ su 360 $.
- Regia terza session_01R8112PV6Phn3WXaFfB7G85 (dal 24/11 13:23). Regola dell'AD (24/11 13:24): al passaggio si scrive PASSAGGIO.md, si spinge e si manda all'AD lo SHA e la riga di apertura; la regia quarta la apre l'AD a profondità 1, mai la regia.
- 2026-11-24 13:28 R04 (16,93 $ dichiarati) e R05 (19,18 $ misurati) finiti, verdi: K02 session_01R8112Njtre8g4wLRA1wx4o li collauda, R06 in catena. Prove comuni senza firma: detto a R01, R06, R07 di togliere dal ramo la modifica (e la correzione che ne dipende, voce → serve_file_altrui col diff completo). Se la firma arriva, la regia riapplica i diff sul ramo unito.
- Per Nicola alla fermata (da R05, R03, R01 e R02): R02 ha le migrazioni nuove 830, 831, 832 e 3 domande (R02-008, R02-003, R02-002); R01 ha le migrazioni nuove 821 e 822 e la domanda «bloccare un secondo reclamo dopo uno chiuso?»; R03 ha 7 domande nel referto, fra cui la migrazione nuova 840; migrazione nuova 860 (ok migrazioni); R05-004 placehold.co da togliere da seed, CSP e elenchi host o lasciare; ricalcolo una tantum del traguardo «venditore più votato» dopo la 860.
- All'unione, dal referto di R02: prova 48 righe 97-98 col diff di R02-009; per R02-004 i 5 diff dei finti (due fanno il mock di lib/logger, di R03) poi cherry-pick di a6bee2db: va nel giro di correzione, non nell'unione.
