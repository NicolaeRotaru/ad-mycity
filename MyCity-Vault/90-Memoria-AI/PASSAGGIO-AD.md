---
tipo: passaggio
data: 2026-11-13 03:40
da: session_015BmpnZ5ufx6s554FgYbUju (la terza chat dell'AD, arrivata a 471 mila token: regola 7)
---

# Il passaggio dell'AD

Questo foglio serve alla quarta chat dell'AD per ripartire senza rileggere la terza. Esempio: la terza era a 471 mila
token su un milione, e ogni sua risposta li rileggeva tutti.

## Il punto adesso
- ✅ Fatto: la #944 è unita, le tre migrazioni sono sul database vero, le card 236, 238 e 239 sono chiuse.
  - Nicola ha unito la #944 alle 02:55.
  - Le migrazioni 361, 363 e 364 sono sul database vero dalle 03:17. Le ho controllate una per una (card 238).
  - Nicola ha tolto a mano il permesso del database su `main`, commit 3a5778e (card 236).
  - Sulla card 239 ha scelto la «a».
  - Regola 10: chi scrive codice nasce con ultracode.
  - Il registro delle decisioni è completo fino alle 03:36.
- ⏳ In corso: due richieste aspettano i controlli di GitHub.
  - La #949 porta la memoria di stanotte; i suoi controlli sono in corso.
  - La #948 porta la CI in 3 minuti; manca l'ultima corsa su `0f204ff`. La segue l'AD.
- 👉 Tocca a te (Nicola): sei cose, tutte qui sotto.
  - Unire la #949.
  - Unire la #948, che è in bozza.
  - Confermare che il test del cervello giri solo su `main`.
  - Decidere sul difetto AR-1173 e sulle tre esenzioni del cancello dello stop.
  - Dare il via dell'onda 2 in una sessione sua (card 237, coi passi pronti).
  - Le due scelte del giudizio sul codice (#947): le librerie da aggiornare prima del 15/11 e il piano del riordino.
- 🕐 Da sapere: la #947 e la #949 vanno in conflitto su bacheca e stato. Chi viene unito per secondo si ripara. Con
  la sessione `…ZCaWUi` è d'accordo così: se Nicola unisce prima la #947, la #949 la sistema l'AD.

## Cosa non ho verificato
- Che ultracode si erediti da chi apre la sessione: è un'ipotesi fatta su tre casi.
- Il sito con le tre migrazioni: non ho fatto nessun ordine di prova. Il sito di oggi usa ancora la strada vecchia
  finché la mycity#288 non è unita e pubblicata.

---

## Dettagli tecnici

**Da leggere per primi:** `cervello/MANUALE-AD.md` · `cervello/sessioni-insieme.md` (dieci regole) · `BACHECA-SESSIONI.md` ·
`LAVORO-APERTO.md` · card 237 in `AZIONI-IN-ATTESA.md`.

**Il ramo:** `claude/sweet-galileo-0skkay`, ripartito da `main` a `13df338` dopo l'unione della #944. Ci sta sopra la #949.
Una sessione nuova che parte da `main` prima dell'unione della #949 non vede la regola 10, le card aggiornate e il
passaggio della regista in `REGIA.md`.

**Le sessioni:**
- CI in 3 minuti `session_015BmpnWjSJvwxssvANzndUF`: finita alle 03:33, 29,55 $ su 30. Cancello del lotto da 10 min 21 s
  a 2 min 36 s; test del cervello da circa 5 min a 2 min 20 s.
- Giudizio sul codice, seguito, `session_015BmpnZCaWUijDqfTAvJ4Dx`: tiene la #947 e le sue due scelte.
- Regista vecchia `session_015BmpnXsL6Y7tP3BhawauHw`: ferma. L'onda 2 la apre Nicola.
- Radiografia in sessioni `session_015BmpnVn722KGUHR5nRn23Z`: ferma, aspetta il via.

**Per la regista dell'onda 2:** prima di `applica --git` sull'onda 1 serve l'eccezione della «a» della card 239. Il
programma non ha un interruttore per onda su quella regola: basta un campo nel piano come `verifica_testa_dall_onda`,
con la sua prova e la sua mutazione. Sta scritto anche in `REGIA.md`.

**Il database del sito:** progetto Supabase `clmpyfvpvfjgeviworth`. La copia del sito in sola lettura si scarica con
`node cervello/collega-marketplace.mjs`; la #288 si legge con `git -C marketplace fetch origin pull/288/head`.

**Il conto:** la terza chat è costata 17,46 $ fino alle 03:33. La quota settimanale è in avviso fino al 19/11 alle 10.
