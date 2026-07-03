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
- le righe della **Sala Operativa** e i titoli in **DECISIONI**.

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

---

## Il controllo dei 20 secondi (prima di salvare un titolo)
- Un estraneo capirebbe **cosa deve succedere** leggendo solo il titolo? Se no, riscrivi.
- C'è una **sigla o un codice** che non spiega niente a Nicola? Toglilo dal titolo, mettilo nel Contenuto.
- Suona come **te che parli** o come un log di sistema? Deve suonare come la lettera.
- **Cosa cambia** e **Se va bene** sono piene e in italiano semplice? (Se vuote, la card mette un testo generico peggiore.)

> Regola d'oro del reparto: **se poteva scriverlo un terminale, riscrivilo.** Nicola non deve tradurre: deve capire.
