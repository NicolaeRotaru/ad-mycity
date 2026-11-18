---
data: 2026-11-18 07:50
tipo: passaggio di regia
da: «Ondata 9 · 2.0» (session_015BmpnVz75xRKsz1trmeMzu), a 470 mila token
a: «Ondata 9 · 3.0»
---

# Onda 9: il passaggio alla regia 3.0

## In parole semplici
La notte del 17/11 sei riparatori hanno lavorato su 81 difetti del sito. La mattina del 18/11 Nicola ha chiesto i collaudi e il controllo: li hanno fatti due collaudatori e un controllore. Delle 57 riparazioni giudicate, 45 reggono al collaudo, e il controllore ne ha bocciate altre 5. Sei riparazioni che rompono qualcos'altro sono uscite dal codice unito, e il codice che resta passa il controllo completo. Un esempio: R03-019 faceva salvare una scorta sbagliata in «Modifica prodotto» quando le taglie arrivano in ritardo, e non c'è più. La 2.0 passa la mano perché ha superato i 400 mila token.

## Cosa cambia per te
Niente: Nicola parla con la 3.0 come parlava con la 2.0.

## Cosa devi fare
Le tre cose in attesa di Nicola stanno sotto, in «Quello che aspetta Nicola».

## Cosa non ho verificato
- Le prove sul database del sito non sono state lanciate, perché nessuno dei sei ha toccato migrazioni.
- Il codice unito esiste solo nella copia della 2.0: la 3.0 lo ricostruisce con la ricetta qui sotto.

---

## Dettagli tecnici

### Lo stato (18/11 07:50)
- Riparatori R01, R02, R03, R06, R07, R10: tutti `finita`, referti in `referti/RNN.json`, costi in `sessioni.json` (123,02 $). Nessuno archiviato.
- Collaudatori: K01 (R02, R03, R06) 14,54 $, K02 (R01, R07, R10) 13,67 $. Verdetti in `collaudi/K01.json` e `K02.json`, valida-collaudo verdi. 57 voci: 45 reggono, 7 parziali, 1 non regge (R10-002), 4 rompe_altro.
- Controllore C01, 9,96 $, referto in `controlli/C01.json`. 5 voci rosse: R03-019 (grave, rompe_altro), R10-002 (rompe_altro), R07-001, R03-009, R03-003. 3 difetti nuovi minori.
- Spesa dell'onda: circa 197 $ su 240 (riparatori 123,02, collaudi 28,21, controllore 9,96, chat «Ondata 9» circa 19,30, regia 2.0 16,87). Limite settimanale «allowed_warning», senza uso extra; si azzera giovedì 19/11 verso le 10:00.

### Il codice unito (non spinto: il permesso di scrivere sul sito non c'è)
Ricetta, verificata due volte con la stessa impronta:
`git checkout --detach f93d246a42b25cd5fa86da712755526d7d6388dc`, poi `git merge --no-edit` di `origin/claude/adoring-bohr-kixq35-o9-m01`, `-m02`, `-m03`, `-m06`, `-m07`, `-m10` in quest'ordine (nessun conflitto), poi
`git revert --no-edit 85f2677b7576b29c7e7e8594699dcba58609579f f07aaad50144ae663f2c203e8022ba5557b1324c 9842603c 55edefd4cd157c7ae91cdff04fc9697f2cfed93e b03a4312fa1741a42b1776040b257cafa34dad6e 9be1a8a1443ab0f5c16b652c373d4d2478335954 4f0bd4ad5bfd87e467886a7b504f207ed94436ab` (R01-012, R02-002, R07-002, R10-005, R10-002),
poi `git revert --no-edit 19b705f73405290d1d04903958e50d55480d8090` (R03-019): litiga solo su `tests/unit/riparazione-r03-modulo-resta-quando-torna-la-rete.test.tsx`, ritoccata da b164a55b; si risolve con `git rm` di quella prova e `git revert --continue`.
Impronta attesa: `git rev-parse HEAD^{tree}` = `e7de3f27017f16c7a6dbb8584f7e39a5c5441cde`. Su quel codice `npm run verify` è verde (11.132 prove, 0 errori di tipi e di stile). Il verify vuole `NODE_OPTIONS=--max-old-space-size=6144`.

### Quello che aspetta Nicola
1. **Le due eccezioni.** Senza firma `applica` blocca la cartella. Quando Nicola scrive «Firmo le eccezioni», si aggiunge a `piano.json` la chiave `eccezioni_firmate` (formato in `onda8/piano.json`):
   - `{onda: 1, sessione: "R02", regole: ["prove_comuni"], file: ["tests/unit/riparazione-r03-chi-siamo-testo-grande.test.ts", "tests/unit/riparazione-r15-col-testo-grande-la-pagina-non-scorre-di-lato.test.tsx"], perche: "K01: nessuna asserzione persa; rimettendo il difetto tornano rosse", firma: "<le sue parole, con ora e sessione>"}`;
   - una voce `{onda: 1, commit: "<40 cifre>", regole: ["id_nel_commit"], firma: …}` per ognuno dei sei commit: ab1dfaf95e60051ea94380aeb479fd3568a06c74, f07aaad50144ae663f2c203e8022ba5557b1324c (R02), d5cc38278982a85d5274e4c5a2feb308fd30f829, 7ffe94441a90a1bfe309877ea37c4b87ad8dfd77, ef3188359d8c51ed964382bc2fd585450196f6f3 (R03), 677b393d04c004441f81b6dd175ff16135bb3375 (R06). K01: toccano solo la voce del titolo.
   Poi `guardia-ramo` verde sui tre rami, e `applica --git ../mycity` a vuoto.
2. **Il permesso di scrivere sul sito** (`add_repo` NicolaeRotaru/mycity, accesso push): la richiesta del 18/11 alle 06:36 è stata annullata. Serve per spingere il ramo unito `claude/adoring-bohr-kixq35-o9` e per la PR del sito.
3. **La descrizione della #985** è indietro: va aggiornata con Nicola sveglio, e Nicola la unisce prima di giovedì alle 10:05.

### Le scelte per Nicola dai referti (13, già nel conto delle 23:44 alla chat «Ondata 9»)
R01-005, R02-011, R03 (Upstash in produzione; colonna per l'ora dell'errore dell'import), R06-001, R06-005, R07-003, R07-008, R07-009, R07-010, R07-011, R10-001, R10-010.

### Giovedì 19/11 alle 10:05
Il promemoria è sulla 3.0. Prima `get_session`: il limite deve essere «allowed». Poi:
- **Il giro di correzione dei 6** (regola del 14/11: entrano sempre anche parziali e serve_file_altrui): le 6 tolte (R01-012, R02-002, R07-002, R10-005, R10-002, R03-019), le rosse del controllore (R07-001, R03-009, R03-003), le parziali e le serve_file_altrui dei referti. Le bocciate tornano al loro riparatore. Per le serve_file_altrui serve `dividi --base <integrazione> --file-chiavi`, perché il file ha un altro padrone.
- R04, R05, R08 e R09 si aprono solo dopo averli rifiltrati sul testo delle voci (fuori soldi, dati personali, permessi e migrazioni).
- Il collaudo del gruppo A (`chiavi-collaudo-A.txt`, 5 voci): non è stato fatto il 18/11.
- Consegna a 40 $ e tetto 45 $ per riparatore. Il prompt dei riparatori è quello di R03 del 17/11 (`list_events` sulla sessione di R03, primo evento `user`).
- Collaudatori e controllore nascono senza ultracode (regola 5 del 15/11): il LEGGIMI vecchio dice di non partire senza, e lo chiedono ogni volta. Va scritto nel loro primo messaggio.

### Da sapere
- Il registro del sorvegliante (`MyCity-Vault/90-Memoria-AI/auto-coscienza/sorvegliante-storico.json`) si riscrive da solo a ogni turno. Spinto da solo, fa ripartire le prove della #985, che svegliano la regia: un giro a vuoto. Si salva in locale e parte col lavoro vero.
- `guardia-ramo` non accetta i controllori (`CNN`): sul ramo del controllore si guarda a mano che ci sia solo `controlli/CNN.json`.
- Il controllo della spesa è il promemoria `trig_01CE9YMeeT8hwPB7aB7G56tC`, spento: si riaccende con `update_trigger` (prompt, `run_once_at`, `enabled`).
- Due falle riservate: i dettagli arrivano alla 3.0 solo in chat. Nel deposito c'è solo il titolo.
