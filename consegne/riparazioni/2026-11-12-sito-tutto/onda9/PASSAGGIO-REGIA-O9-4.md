---
data: 2026-11-19 10:10
tipo: passaggio di regia
da: «Ondata 9 · 3.0» (session_015BmpnZQiGiFfMYaWbMDKVT), a 343 mila token
a: «Ondata 9 · 4.0»
---

# Onda 9: il passaggio alla regia 4.0

## In parole semplici
Il 18/11 la 3.0 ha portato sul sito le riparazioni della notte del 17/11. Nicola ha unito sia la memoria della macchina sia il codice del sito: 27 difetti riparati sono in produzione. Un esempio: dopo aver rinominato una lista, la pagina delle liste mostrava ancora il titolo vecchio, e adesso no. Il 19/11 alle 10:05 è scattato il promemoria del giro di correzione, col limite settimanale di nuovo «allowed». La 3.0 non lo apre: ha 343 mila token di storia, e ogni risveglio costerebbe circa il triplo. Il giro lo fa la 4.0, dall'inizio alla fine.

## Cosa cambia per te
Niente: Nicola scrive alla 4.0 come scriveva alla 3.0.

## Cosa devi fare
Partire dal giro di correzione, con le regole in «Giovedì 19/11» qui sotto.

## Cosa non ho verificato
- Il rilascio in produzione dopo l'unione della mycity#297: non l'ho seguito.
- La guardia delle aperture (passo 3 del promemoria): non l'ho lanciata, la lancia la 4.0 prima di aprire.

---

## Dettagli tecnici

### Lo stato (19/11 10:10)
- ad-mycity: la #985 è unita (`5df210e`). Sul ramo `claude/adoring-bohr-kixq35` ci sono in più solo memorie della regia 3.0: righe in `REGIA-ONDA-9.md`, `pr_sito` in `sessioni.json`, `eccezioni_firmate` in `piano.json`, una voce in `DECISIONI.md` e una in `BACHECA-SESSIONI.md`. Vanno in `main` con la prossima PR della macchina.
- Sito: la mycity#297 è unita (`336f2fbd`). L'albero di `main` del sito è `e7de3f27`, lo stesso su cui `npm run verify` era verde. Dentro ci sono 27 voci riparate; le 6 tolte (R01-012, R02-002, R07-002, R10-005, R10-002, R03-019) non ci sono.
- Le basi del giro: i rami dei riparatori restano su `f93d246a`; l'integrazione adesso è `main` del sito (`336f2fbd`). Le riparazioni rifatte vanno in una PR nuova del sito da `main`.
- Limite: «allowed», senza uso extra, prossimo rinnovo il 26/11 alle 10:00. Tetto del giro: 650 $ in tutto, dentro i 1.200 $; consegna a 40 $ e tetto 45 $ per riparatore; stop sopra i 20 $ a difetto chiuso.
- Spesa della 3.0: 10,51 $ al 19/11 10:06.

### La firma delle eccezioni e il nodo rimasto
- Nicola ha firmato il 18/11 alle 12:52 («Firmo l'eccezione»). In `piano.json` c'è `eccezioni_firmate`: una per `prove_comuni` (le due prove di R02) e sei per `id_nel_commit` (i sei commit di R02, R03 e R06).
- `applica --git /home/user/mycity` a vuoto: le due prove comuni sono sospese dalla firma. Restano 7 rossi della regola «il messaggio cita RNN-NNN, che non è una voce di …» (`cervello/riparazione-sessioni.mjs`, riga 1187). Quella regola non chiama `ctx.deroga`: nessuna firma la sospende. La 2.0 l'aveva chiamata `id_nel_commit` per errore.
- Finché resta rossa, `applica --scrivi` e poi `chiudi-sito --applica --pr 297 --commit 336f2fbd` non si possono fare: le 27 voci restano aperte nel registro.
- La scelta è a Nicola (domanda del 18/11 alle 12:55, ancora senza risposta). Le strade: una riga che fa passare quella regola da `ctx.deroga("id_nel_commit", perche, c.commit)`, con una prova e una mutazione, collaudata da un altro agente (modifica alla macchina: 🟡, serve la sua firma); oppure lasciare le 27 voci aperte. Raccomandazione della 3.0: farla come primo passo del giro, se Nicola firma.

### Giovedì 19/11 (il giro di correzione)
Le regole sono quelle di `PASSAGGIO-REGIA-O9.md`, sezione «Giovedì 19/11 alle 10:05», con le basi aggiornate qui sopra:
- il giro di correzione dei 6 (le 6 tolte, le 3 rosse del controllore R07-001, R03-009 e R03-003, le parziali e le serve_file_altrui dei referti);
- R04, R05, R08 e R09 solo dopo averli rifiltrati sul TESTO delle voci (fuori soldi, dati personali, permessi e migrazioni);
- il collaudo del gruppo A (`chiavi-collaudo-A.txt`, 5 voci);
- poi collaudo, controllore e la PR nuova del sito.
- Collaudatori e controllore senza ultracode, scritto nel loro primo messaggio.

### Da sapere
- Il permesso di scrivere sul sito era della sessione 3.0. La 4.0 lo chiede con `add_repo` (NicolaeRotaru/mycity, accesso push) quando deve spingere l'integrazione: è Nicola che approva la finestra.
- Il registro del sorvegliante si riscrive da solo a ogni turno: si salva in locale e parte col lavoro vero.
- `guardia-ramo` non accetta i controllori (`CNN`): sul ramo del controllore si guarda a mano.
- Il controllo della spesa è il promemoria `trig_01CE9YMeeT8hwPB7aB7G56tC`, spento.
- Due falle riservate: i dettagli arrivano alla 4.0 solo nel primo messaggio. Nel deposito c'è solo il titolo.
