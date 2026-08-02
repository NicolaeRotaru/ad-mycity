# ✍️ Scrittura umana — come scrivo perché Nicola capisca al volo

> **La regola in una frase:** ogni riga che Nicola legge nel Pannello la scrivo **come gliela direi a voce**,
> non come la annoterei per me stessa. Prima la sostanza umana, i codici dopo (e solo dove servono a chi esegue).
>
> Il metro di paragone è la **lettera a Nicola** (`MyCity-Vault/90-Memoria-AI/auto-coscienza/LETTERA-A-NICOLA.md`):
> lì scrivo bene — chiaro, concreto, si capisce in tre secondi. Il resto deve suonare uguale.

---

## Dove vale (tutto ciò che finisce sotto gli occhi di Nicola)
Il **titolo** di ogni card è la prima — e spesso l'unica — cosa che legge. Vale per:
- la colonna **"Azione (pronta)"** in `AZIONI-IN-ATTESA.md` → è il titolo grosso della card "Da approvare";
- i `titolo` in `ultimo-briefing.json` (**azioni** e **opportunità**) → card "Cosa ho scoperto e propongo";
- i `titolo` in `intenzioni-nicola.json` (**prossime_mosse**) → card "Mosse di Nicola";
- il **titolo** di ogni proposta/azione che accodo nella coda DB (worker);
- le righe della **Sala Operativa** e i titoli in **DECISIONI**;
- **↳ e da AR-478 anche: la chat con Nicola, il titolo e il corpo di ogni PR, i messaggi di commit.**

> ⚠️ **AR-478 — il buco che è costato due ore.** Fino al 2/8/2026 questa regola valeva solo per le card
> del Pannello. La chat e le PR — cioè i **due posti dove Nicola legge davvero** — erano fuori, e infatti
> lì il gergo era al massimo. Il conto, detto da lui: *«ho perso 2 ore solo per capire due botta e
> risposta nelle ultime 5 PR»*. La prova che il problema è strutturale e non estetico: per leggere la
> macchina è servito scrivere un **glossario in 11 parti**. Un vocabolario privato che ha bisogno di un
> dizionario non è una lingua — è una tassa che Nicola paga a ogni riga.

---

## I tre blocchi (obbligatori su ogni testo lungo: PR, consegne, risposte in chat)

Un testo lungo comincia **sempre** rispondendo a queste tre domande, in quest'ordine, prima di
qualunque dettaglio. Sono le uniche tre cose che Nicola deve sapere per decidere:

```
## In parole semplici      ← cosa ho fatto, 2-3 righe, zero codici, come se glielo dicessi a voce
## Cosa cambia per te      ← la conseguenza concreta per lui e per l'azienda (max 3 punti)
## Cosa devi fare          ← una cosa sola, oppure «niente, è già a posto»

---
## Dettagli tecnici        ← DA QUI IN GIÙ scrivo per chi esegue: codici, comandi, sigle, numeri.
                             Nicola può fermarsi sopra questa riga e avere capito tutto.
```

La riga **«Dettagli tecnici»** è il confine: sopra si scrive per Nicola, sotto per chi esegue (me,
un senior, la CI). Il gergo non è vietato — è **relegato sotto la riga**. Non perdo precisione: la
sposto dove serve.

**Le tre regole dure sopra la riga:**
1. **Zero codici** — niente `AR-478`, `#654`, `cervello/…​.mjs`, `exit 2`, comandi `git`.
2. **Zero parole mie** — niente cancello/freno/guardiano/sonda/tetto/lotto/mutazione/spazzata.
   Ognuna ha la sua traduzione: `node cervello/parole-difficili.mjs --dizionario`.
3. **Frasi corte** — un'idea per frase. Se una frase supera le 30 parole, spezzala.

**Il controllo, prima di consegnare** (misura il testo, non lo giudica):
```bash
node cervello/parole-difficili.mjs bozza.md     # 0 = si legge · 1 = serve tradurre · 2 = niente da misurare
```

> Non vale invece per il **Contenuto** (il file `consegne/…`, i path, i comandi, gli ID Stripe): quello è per
> **chi esegue** e lì i dettagli tecnici ci devono stare, precisi. La regola è: **titolo per l'occhio umano,
> Contenuto per la mano che agisce.** Se un codice è utile a chi esegue e non è già nel Contenuto, spostalo lì —
> non lasciarlo a intasare il titolo.

---

## Le 6 mosse (falle sempre, in quest'ordine)

1. **Attacca con un verbo e una persona/cosa vera.** «Chiama il fornaio per confermare l'ordine», non «Accetta `58094956…`». Chi legge deve capire *cosa deve succedere* dalla prima parola.
2. **Fuori i codici dal titolo.** Sigle interne (`AR-004`, `#16.2`), ID (`phc_…`, ID Stripe), path (`cervello/vps/.env:27`), numeri-comando (`SQL 107`), righe di codice: **non** nel titolo. Al massimo un riferimento leggibile («la chiave di PostHog», «il primo negozio Pane Quotidiano»). Il codice esatto vive nel Contenuto.
3. **Traduci ogni sigla in italiano.** Non «fix fail-closed del gate autopilot AR-072», ma «l'autopilot non deve più pubblicare da solo senza la tua firma». Se una sigla ti serve per rintracciare la cosa, mettila in coda tra parentesi, dopo il senso.
4. **Un'idea per frase, frasi corte.** Se il titolo ha tre trattini e due parentesi annidate, spezzalo: tieni nel titolo il cuore, il resto scende nel Contenuto o nelle colonne "Cosa cambia / Se va bene".
5. **Numeri con la loro unità e il loro senso.** «Incassa €19,05 in contanti alla consegna», non «COD €19,05». «Spento da 20 giri (≈2 giorni)», non «cieco da 20 giri».
6. **Di' il "così che" quando non è ovvio.** Un titolo buono fa capire anche *perché* conta: «…così il sensore che misura le vendite torna a vedere». Se non ci sta, è esattamente ciò che dicono le colonne **Cosa cambia** (la conseguenza reale) e **Se va bene** (il passo dopo): riempile sempre, in parole semplici.

---

## Prima → Dopo (esempi veri, presi dalle card di oggi)

| Come suonava (gergo) | Come scrivo adesso (umano) |
|---|---|
| `#16.2 Accetta ordine + chiama Pane Quotidiano — dashboard seller → Accetta 58094956… · tel. 0523 388601 · script A6` | **Accetta l'ordine di pranzo e chiama il fornaio Pane Quotidiano (0523 388601) per confermarlo** |
| `#16.3 Consegna COD €19,05 + chiudi ordine — ritiro PQ Via Calzolai 25 → consegna buyer → incasso contanti → Consegnato in app · poi A13 + A14` | **Ritira la spesa dal fornaio, consegnala e incassa €19,05 in contanti, poi segna «consegnato» in app** |
| `Sblocca sensore PostHog (cieco da 20 giri — sentinella 🐙 riverificata 2026-07-04 00:10; .env VPS riga 27 = phc_…, diagnosi 401; nessuna Personal Key phx_)` | **Il sensore che misura le vendite del sito è spento da 20 giri: serve la chiave giusta di PostHog** |
| `Revocare il PAT GitHub (R1 · AR-004)` | **Cambia la chiave GitHub trapelata (quella che dà accesso in scrittura al codice)** |
| `Far girare SQL 107 (DROP policy profiles)` | **Applica al database la correzione che chiude un permesso rimasto aperto** |
| `Fix BLOCCANTE guardrail: autopilot pubblica 🟡 in LIVE — gate autopilot.mjs:120 blocca solo rosso, renderlo fail-closed` | **L'autopilot non deve più pubblicare nulla sul brand senza la tua firma (oggi esce tutto ciò che non è «rosso»)** |

I codici delle celle di sinistra non spariscono: **scendono nel Contenuto**, dove chi esegue li trova precisi.

### Prima → Dopo, sui titoli delle PR (esempi veri, quelli che Nicola non è riuscito a leggere)

| Come l'ho scritto (2/8/2026) | Come si scrive |
|---|---|
| `AR-474 + AR-477: il contatore dell'abitudine, i limiti del freno sull'esito, e i due canali` | **Adesso non posso più consegnarti lavoro senza dirti com'è andato — e tu lo vedi nel Pannello** |
| `AR-475: il file dove vivono i freni adesso ha il suo guardiano` | **Un errore di battitura nelle impostazioni spegneva tutte le protezioni in silenzio: ora se ne accorge subito** |
| `Il cancello dello Stop: il freno sull'abitudine, non sulle sue istanze (AR-472)` | **Quando dico «fatto» ora c'è un controllo che verifica se è vero davvero** |
| `Il canale di misura-cieca, e il potatore che misurava un file inesistente` | **Due controlli davano il via libera guardando un file che non esiste: erano verdi a vuoto** |

Il metro: **il titolo dice cosa è cambiato per l'azienda, non come l'ho costruito.**

---

## Il controllo dei 20 secondi (prima di salvare un titolo)
- Un estraneo capirebbe **cosa deve succedere** leggendo solo il titolo? Se no, riscrivi.
- C'è una **sigla o un codice** che non spiega niente a Nicola? Toglilo dal titolo, mettilo nel Contenuto.
- Suona come **te che parli** o come un log di sistema? Deve suonare come la lettera.
- **Cosa cambia** e **Se va bene** sono piene e in italiano semplice? (Se vuote, la card mette un testo generico peggiore.)

> Regola d'oro del reparto: **se poteva scriverlo un terminale, riscrivilo.** Nicola non deve tradurre: deve capire.

---

## Segreti e chiavi (mai il valore, solo il nome)
Quando citi un token, una chiave API o una password — in audit, DECISIONI, consegne, chat:
- **Scrivi solo il nome della variabile** («la chiave GitHub del Pannello», «OBSIDIAN_TOKEN»), **mai** la stringa che inizia con `github_pat_`, `sk_live_`, `phc_`, ecc.
- Se devi documentare che c'era un leak, usa `github_pat_11…[REDATTO]` o `[REDATTO]` — non copiare nemmeno un frammento lungo 20+ caratteri.
- Prima di salvare file in `consegne/audit/`, passa il testo da `node cervello/redattore-segreti.mjs` (vedi `auto-radiografia.md`).
