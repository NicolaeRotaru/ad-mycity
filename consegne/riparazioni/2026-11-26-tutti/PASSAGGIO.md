---
data: 2026-11-26 15:25
tipo: passaggio della regia (prima → seconda)
campagna: tutti i difetti del sito che non chiedono Nicola (26/11)
---

# Passaggio · alla seconda regia

## In parole semplici
Questo foglio serve alla regia nuova per continuare senza rileggere la chat della prima.
La prima regia passa la mano perché la sua storia è a 518 mila token: ogni risveglio costava troppo.
Per esempio: l'onda 1 è quasi collaudata, l'onda 2 lavora, e il prossimo passo è l'unione dell'onda 1.

## Cosa cambia per te
Niente: la campagna continua da sola. Le notizie importanti arrivano all'AD, che te le riassume.

## Cosa devi fare
Niente.

## Cosa non ho verificato
Le spese di K03, K04 e dell'onda 2: sono ancora in corso.

## Dettagli tecnici

**Chi.** AD (parla con Nicola, legge solo le pietre miliari): session_015BmpnXuogkPZVts89PH67a. La regia nuova scrive all'AD
solo a: unione fatta, PR del sito pronta, spesa al 75% e al 100% del tetto, fine campagna, una falla riservata nuova.
Nicola ha chiesto (26/11 13:45): tutti i difetti senza di lui, **nessuna richiesta di approvazione**; i nati senza di lui tornano nel giro.
Tetto: **1.200 $** (il suo «ok 1.200» del 24/11). A 1.100 $ misurati non si apre più niente. Il tetto non si alza.

**File.** `REGIA.md` (regole e diario) · `STRATEGIA.md` (analisi) · `per-nicola.md` (le voci sue) · cartelle
`consegne/riparazioni/2026-11-26-tutti-onda1/` e `-onda2/` (piano, schede, sessioni.json, referti, collaudi, rossi-noti, diario).

**Basi.** Sito main @ ed12ed8ec8190e1132b690f6e034c30f0a5d55ba. Ramo ad-mycity e integrazione sito: `ccr-a672a2b3-92w5w1`.
Clone del sito in /home/user/mycity (export MARKETPLACE_REPO=/home/user/mycity).

**Onda 1** (R01-R11, 116 voci, tutte consegnate). Collaudi: K01 e K02 finiti e archiviati (collaudi in `collaudi/`).
- K03 session_015BmpnWgMH75yfHvVuJBocm: R05, R09, R06 (in corso).
- K04 session_015BmpnYdBaMKhL4fw54TdXB: R01 (in corso). **R02 aspetta**: guardia rossa per una prova comune (R02-011), gli è stato
  chiesto il revert alle 15:17. Quando scrive, rifai guardia-ramo e valida-referto e mandalo a K04 con punta e testa.
- **Da togliere all'unione (rompono altro):** R03-008, R07-006, R04-005, R10-003, R10-004, R10-005, più quelli che diranno K03/K04.
  R10-003/004/005 sono giuste ma senza la migrazione 960 in produzione le pagine col prezzo vanno in errore: nel giro di
  correzione serve un ripiego sull'errore 42703 (colonna/funzione che non c'è) in lib/queries/griglia-prodotti.ts.

**Onda 2** (R12-R16, 70 voci che non toccano i file dell'onda 1, base ed12ed8e, rinumerate a mano, migrazioni nelle fasce
870/900/930/950/970). Id in `-onda2/sessioni.json`. Collaudatori non ancora aperti: uno ogni 3 riparatori finiti.

**L'unione senza clic di Nicola.** La regia nuova non ha il permesso di scrivere sul sito: l'unione la fa una figlia
«U01» con `source_url` mycity, `source_revision` ed12ed8e…, `outcome_branch` `ccr-a672a2b3-92w5w1`. Mandato: unire i rami -m01…-m11
in ordine (e poi -m12…-m16 quando collaudati), revert dei commit elencati, `npm run verify`, harness SQL
(`pg_ctlcluster 16 main start; su postgres -c "createuser -s root"`; `tests/sql/harness/apply.sh` e `run.sh`), spingere, dire lo SHA.
Poi C01 (controllore, LEGGIMI-controllore) sull'integrazione; poi `applica` a vuoto.

**Il registro.** La radiografia ha scritto 45 chiusure sul suo ramo ccr-aa566c13-nvkbaw @ 348a2b1 (non ancora su main alle 15:20).
Prima di `applica --scrivi` (nati e note): `git fetch`; se la sua PR è unita, merge di origin/main; se no, merge del suo ramo.
Le chiusure vere si scrivono solo dopo che Nicola unisce la PR del sito (`chiudi-sito.mjs`).

**Le falle riservate.** Sono 5, viste da R03, R07, R10, R06 e R01: dettagli solo nella chat dell'AD. Le ripara l'AD con una
sessione privata. Nei referti c'è solo il titolo generico: `applica --scrivi` le mette nel registro come riservate.

**Il giro dopo (onda 3) dall'integrazione unita.** `dividi --base <SHA integrazione> --file-chiavi` con: parziali, serve_file_altrui,
non_fatto, rompono altro (con la nota del collaudo), le 137 di `consegne/riparazioni/2026-11-26-tutti/chiavi-onda2-dopo-unione.txt`,
i nati senza Nicola. Fuori: prova comune che chiede la firma, scelte, non codice (vanno in `per-nicola.md`).
**Numeri:** rinumera a mano da R17; migrazioni solo ≤ 999 (si applicano in ordine di byte: 1000 andrebbe prima di 108) nelle fasce
non usate (882-889, 891-899, 911-919, 921-929, 941-949, 961-969, 980-999). Poi le 48 voci con migrazione, al massimo 15 per PR.

**Spesa misurata alle 15:20 (cost_usd).** Riparatori onda 1: R11 12,51 · R03 11,58 · R07 11,42 · R10 18,44 · R08 19,12 · R04 ~18,5 ·
R09 ~16,5 · R05 22,44 · R06 22,91 · R01 23,68 · R02 ~24,5. Collaudi: K01 22,43 · K02 24,64. Regia prima 25,60.
Totale misurato circa 274 $; in corso K03, K04, R12-R16 (preventivo circa 130 $). Chiusure attese onda 1: circa 40 reggono.

**Regole imparate oggi.** Collaudatore: tetto 9 subagenti, limite 20 $, due lenti solo su soldi/dati/permessi. Riparatore: lotti
da 6 al massimo, un grave da solo (R04 ha speso tutto su un lotto da 5 gravi). Una prova comune non si tocca nemmeno nel titolo.
Firme mai dedotte dalle frasi di Nicola (il sistema l'ha fermato alle 14:10). La sorveglianza muta duplicava i messaggi: basta
`list_sessions` a 10 minuti dall'apertura e i messaggi delle figlie. Riga in `cervello/riparazione/misure.json` a fine onda.

**Riga di apertura per la regia nuova:** «Sei la regista della campagna consegne/riparazioni/2026-11-26-tutti (seconda regia).
Leggi consegne/riparazioni/2026-11-26-tutti/PASSAGGIO.md e REGIA.md, e di .claude/skills/riparazione/SKILL.md le regole del 21/11 e
del 15/11 e la sezione F3; poi continua da «Onda 1». L'AD è session_015BmpnXuogkPZVts89PH67a.»
