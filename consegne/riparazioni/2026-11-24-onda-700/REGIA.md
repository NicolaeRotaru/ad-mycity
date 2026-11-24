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

## I primi passi della regia
1. `get_session` su di te (quota) e `git fetch` dei due depositi. Clona il sito in /home/user/mycity se manca.
2. Chiedi subito all'AD, con `send_message`, le firme `prove_comuni` e `rimessa_a_mano` per il giro dei normali (lezione del 22/11: arrivate a metà hanno chiesto tre giri). Non aspettarle per partire col passo 1.
3. Passo 1, ricontrollo lampo delle 198 voci con file cambiati: `prepasso.mjs` della cartella del 21/11 (dà i file cambiati e quelli spariti), poi il metodo del ricontrollo del 21/11 (`consegne/radiografia/2026-11-21-ricontrollo/`, `node cervello/radiografia-sessioni.mjs`), 2 sessioni + controllore, senza ultracode sulle voci normali. Le voci delicate del ricontrollo: lettura sola, niente ultracode serve (non si ripara).
4. Passo 2: in `normali/`, `schede --ramo ccr-d7a54140-hak4ez --regista <il tuo id>`, `copertura-prima`, `segnaposti`; R01-R07 dal sito @ base, rami `ccr-d7a54140-hak4ez-m01`…`-m07`, senza ultracode, `effort: "xhigh"`, `permission_mode: "auto"`. Controllo a 10 minuti. Poi collaudatori, controllore, unione, come dice la skill.
5. Fermate e costi all'AD (session_01R8112Lzth8WvHHrQ4H3whZ), nei quattro blocchi, coi due costi e la percentuale stimata.

## Fermo su
- 2026-11-24 11:45 preparazione fatta, FERMATA 1 mandata a Nicola. Nessuna sessione aperta.
- 2026-11-24 11:58 «Via» di Nicola sui passi 1 e 2, tetto 360 $. L'AD apre la regia.
- 2026-11-24 12:26 regia (session_01R8112LxmCk5Y1BXWKNWKCY) al lavoro. Sito clonato col git normale in /home/user/mycity (niente add_repo: avvisare l'AD PRIMA di chiamarlo con push, in F3). Firme `prove_comuni` e `rimessa_a_mano` chieste all'AD alle 12:13, non ancora arrivate.
  - main del sito è andato avanti: e67ed29d86a207d58c0faf9afb55f8315bbf9d4a (9 commit, pagamento dei servizi). I riparatori restano sulla base 5b8c786 (un solo file in comune coi normali: lib/database.types.ts, R02).
  - Passo 1, cambiato: il ricontrollo guarda il sito a e67ed29 e prende 141 voci (207 lavorabili con un file cambiato da 1ad51b4c a e67ed29, meno le 66 normali che vanno ai riparatori, che controllano da soli se la voce c'è ancora). Cartella `ricontrollo/`, registro filtrato solo per `prepara` (in scratchpad: ad `applica` si passa il registro vero). S01 (120 voci, 8 lotti) e S01b (21 voci), senza ultracode, rami `-s01`/`-s01b`, partenza SHA_REGISTA 33f51c26faf22ee0cf5d68aa2812a2960f6a54cc.
  - Passo 2: R01-R07 aperti sul sito @ 5b8c786, rami `-m01`…`-m07`, senza ultracode, xhigh, auto, regole e scheda per intero nel primo messaggio; tetto 35 $ a riparatore, consegna a 24 $. `campione_fino_a_40_dall_onda: 1` nel piano dei normali. Id in `normali/sessioni.json` e `ricontrollo/sessioni.json`.
  - stima_usd: 360 (tetto rigido dei passi 1 e 2). Prossimo: controllo a 10 minuti, piani da approvare, poi sorveglianza ogni 30 minuti.
- 2026-11-24 12:30 piani R01-R05 approvati. Correzione: R02-009 e R05-008 ridefiniscono la stessa funzione della campanella «ordine pronto» (321) → la fa solo R02 nella 832 (giorno + «fattorino»); R05-008 va a serve_file_altrui, da chiudere dopo l'unione. Il costo delle figlie compare in get_session a turno chiuso (R01 piano 1,23 $).
- 2026-11-24 12:31 piani R06 e R07 approvati: tutti e 7 i riparatori al lavoro. R06-008 riparato solo nella scelta (nel dubbio «nessuno», ritorno a mano); R06-009 scelta di Nicola (rilascio automatico di Vercel).
- 2026-11-24 12:35 S01b finita (ba725db), guardia e referto verdi, archiviata: 21 voci, 16 ancora_vero, 5 cambiato, 0 chiuse; 3 domande per Nicola (chi paga lo sconto MyCity; variabile E2E e chiavi Stripe di prova in CI, con proposta di abbassare a minore la voce delle prove della cassa vera; reclutamento fattorini dal sito). Costo 8,94 $. Referto in ricontrollo/referti/S01b.json.
- 2026-11-24 12:40 controllo a 10 minuti: R01-R07 tutti WORKING, nessuna figlia ferma. S01 finita (9119689), guardia e referto verdi: 120 voci, 67 ancora_vero, 37 cambiato, 14 non_piu_vero (1 grave: il reclamo del cliente che non arrivava a nessuno, confermato dal verificatore), 2 non_verificabili; 4 domande per Nicola. doppioni, grezzo (0 difetti) e conti verdi. Costo S01 34,88 $ (turno ancora aperto). Passo 1 finora circa 44 $ per 14 chiusure. Prossimo: CF del ricontrollo (riservatezza, 3 prove a sorpresa), poi applica.
- 2026-11-24 12:48 S01 archiviata (costo finale 36,70 $; passo 1 = 45,64 $ più il CF). CF del ricontrollo aperto (session_01R8112KZNkwa12CzqesffGN, ramo -cf-ricontrollo, tetto 12 $). La regia prima è a ~400 mila token: passaggio in PASSAGGIO.md, apre la regia seconda.
- 2026-11-24 12:50 regia seconda (session_01R8112LSUYWZ7q4nU6dz1Fa) al lavoro. Avvisate R01-R07 e il CF del ricontrollo; stato e 7 domande all'AD. Primo giro di sorveglianza: nessun rosso (3 rami spinti su 7), CF senza chiamate al database vero. main del sito ora 636554b8bc224a3fffb2230b11ca42754319dda2. Costi: regia prima 9,45 $, passo 1 45,64 $ + CF.
