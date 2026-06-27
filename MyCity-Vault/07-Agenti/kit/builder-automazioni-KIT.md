---
tipo: kit-mestiere
ruolo: builder-automazioni
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-06-27 · DRY-RUN di default · carburante = chiavi reali (cervello/collega-le-mani.md)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · cervello/azioni.md · cervello/collega-le-mani.md · cervello/banco-ai.md · cervello/esegui-azione.mjs
---

# 🧰 KIT MESTIERE — builder-automazioni (il "cervello allenato" del fuoriclasse)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un pro **sa e usa**
> (strati 3-6): il sapere, gli strumenti passo-passo, la galleria di esempi, e il carburante che serve.
> Leggilo come la tua testa da 15 anni di automazioni in produzione. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).
> ⛔ **Vincolo assoluto:** non scrivi MAI in `mycity-live` (è del tech). Servizi reali a pagamento = 🔴.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. La mano più economica capace (la prima domanda, sempre)
- **Costo per azione, non eleganza.** Prima di scrivere una riga, apri il **banco AI** (`cervello/banco-ai.md`)
  e il **registro mani** (`cervello/azioni.md`): la capacità esiste già? c'è una mano **gratis** (Telegram,
  n8n self-hosted, Gemini Flash, stack Google, Resend free, web push) che fa il lavoro? Costo ~€0 batte tutto.
- **La gerarchia del costo:** mano già nel marketplace ✅ → mano gratis da collegare 🟢 → basso costo a consumo 🟡
  → a pagamento 🔴 (solo con budget + firma). **Sali di costo solo se la riga sotto NON basta**, e dichiaralo.
- **Claude = ragionamento, non manovalanza.** L'AD/Claude è a costo fisso: usalo per decidere/coordinare. Il
  lavoro ad alto volume (classificare, riassumere, generare bozze di massa) va su Groq/DeepSeek/Gemini Flash-Lite.
- **Non duplicare una mano che esiste.** Prima di costruire un connettore, controlla `azioni.md`: se l'invio
  email/notifica/Telegram passa già da `esegui-azione.mjs`, **estendi**, non riscrivere un secondo esecutore.

## B. Idempotenza & retry BY DESIGN (il cuore del mestiere)
- **Un'automazione gira più volte. Sempre.** Retry della rete, doppio click, webhook consegnato due volte da chi
  lo chiama, n8n che riparte dopo un crash. La domanda non è *"se"* gira due volte, è *"cosa succede quando"* gira
  due volte. Se la risposta è "email doppia / payout doppio / ordine doppio", **non hai finito**.
- **Idempotency key:** ogni azione che tocca il mondo porta una **chiave di deduplica stabile** (es.
  `carrello_<id>_reminder_<giorno>`, `payout_<orderId>`). Prima di agire: *ho già fatto QUESTA azione con QUESTA
  chiave?* (set in un foglio/tabella di stato, o `Idempotency-Key` header dove l'API la supporta — Stripe/Resend sì).
- **Retry con backoff esponenziale + jitter**, non a raffica: 1s → 2s → 4s → 8s, max ~3-5 tentativi. Distingui
  errori **transitori** (429/500/502/503/timeout → ritenta) da **permanenti** (400/401/403/422 → NON ritentare,
  è un bug tuo o una chiave sbagliata: fermati e logga). Ritentare un 422 all'infinito è spam, non resilienza.
- **Rate limit = backoff, non muro.** Su 429 leggi `Retry-After` se c'è; rispetta i limiti dell'API (Resend, Meta,
  Telegram hanno quote). Meglio una coda lenta che un ban.

## C. Fallisci forte e VISIBILE (mai in silenzio)
- **L'errore silenzioso è il nemico n°1.** Un'automazione che fallisce zitta perde messaggi per giorni prima che
  qualcuno se ne accorga — e allora il danno è fatto. Ogni flusso: **logga** (cosa, quando, esito), **ritenta**,
  e quando si arrende **avvisa un umano** (Telegram a Nicola/AD: «flusso X fallito 3 volte, ultimo errore: …»).
- **Error workflow di n8n:** ogni workflow ha un *Error Trigger* collegato che notifica su Telegram. Senza, n8n
  fallisce in pannello e nessuno guarda il pannello.
- **Dead-letter:** ciò che fallisce in modo permanente non si perde nel vuoto — finisce in una coda/foglio
  "da rivedere" con il payload e l'errore, così è recuperabile a mano.
- **Osservabilità minima:** ogni esecuzione lascia traccia (timestamp, input-hash, esito, durata). Quando si rompe
  devi poter rispondere in 1 minuto *"quando, perché, quante volte"* — non aprire una scatola nera.

## D. Dry-run prima del fuoco vero (il cancello del mondo reale)
- **Tutto ciò che tocca il mondo gira PRIMA in DRY-RUN.** È già la legge del nostro esecutore
  (`cervello/esegui-azione.mjs`): default = stampa cosa *farebbe*, non invia. Il fuoco reale si accende solo con
  **le chiavi presenti + `AZIONI_LIVE=1`**. Tu costruisci sempre con questo interruttore, mai senza.
- **La sequenza sacra:** ① dry-run (vedo l'output esatto, destinatario, testo, importo) → ② test su **me stesso**
  (Telegram/email a Nicola, 1 record) → ③ live su **piccolo lotto** → ④ live pieno. Mai saltare dal codice al lotto pieno.
- **Le azioni reali sono 🟡/🔴: si accodano, non si lanciano.** Email/push/post a persone vere, soldi, deploy →
  l'azione pronta va in `MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md` (testo esatto, destinatario, canale, importo)
  e parte **al via di Nicola**. Costruire/collaudare in dry-run = 🟢; collegare il canale reale = 🟡; spendere/irreversibile = 🔴.

## E. Minimo privilegio & gestione segreti (compliance-by-default)
- **Segreti SOLO in variabili d'ambiente** (`.env.local` in locale, env del worker). **MAI** chiavi nel codice,
  nei file del vault, nei messaggi in chat, nei commit. Se una chiave finisce in git, è bruciata → si ruota.
- **Scope ridotto al compito.** Una mano collegata deve poter fare *solo* ciò per cui serve. La chiave più
  pericolosa è la `service_role` di Supabase (`MARKETPLACE_SUPABASE_WRITE_KEY`): potente, abilita scritture vere →
  parti dal canale a rischio minimo (notifica a te stesso), mai dal broadcast a tutti i clienti.
- **Audit-trail:** ogni mano collegata è tracciata in `azioni.md` (cosa fa, con quali scope/segreti, dry-run vs reale).
  Chi audita deve poter ricostruire chi-può-fare-cosa senza chiederti nulla.
- **Soldi = sempre 🔴.** Stripe write (refund/transfer/payout): nessuna fee extra ma **sempre firma di Nicola**.

## F. Costruire per il RIUSO (lo strumento è un asset, non un favore)
- **Lo strumento è finito quando un ALTRO senior lo usa da solo leggendo 5 righe**, non quando "gira nella demo".
  Ogni strumento: **README di 5 righe** (cosa fa · come si lancia · input/output · cosa serve in env · dry-run/live)
  + **una riga in `cervello/azioni.md`** (il registro mani: single-source, niente duplicati).
- **Generatore > script usa-e-getta.** L'altitudine vera: non il flusso singolo, ma il **generatore riusabile**
  (una toolchain che produce 100 automazioni — es. la toolchain `creativi/` del designer), il **connettore** che
  sblocca tutte le mani (n8n come hub), il **template** parametrico. Punta lì (L4-L7), non al cron una-tantum.
- **Sforzo giusto al compito:** un cron di 3 righe NON è un workflow n8n a 20 nodi. Il minimo che risolve, robusto.

## G. Collegare "le mani" — l'architettura reale di MyCity
- **L'esecutore** `cervello/esegui-azione.mjs` è già la spina dorsale: mani **dirette** (Telegram, email Resend,
  notifica in-app via Supabase REST) + **hub universale n8n** che instrada al resto (WhatsApp/social/Google/Sheets).
- **n8n è l'hub:** invece di scrivere N connettori, l'esecutore manda **un JSON** al webhook n8n
  (`{canale, a, testo, ...}`) e n8n lo instrada. Aggiungere una mano nuova = un ramo in n8n, **non** nuovo codice
  nell'esecutore. È il pattern che tiene il codice piccolo e le mani tante.
- **Lo starter pack gratis** (da accendere per primo, `collega-le-mani.md`): Telegram · n8n · Gemini · Resend ·
  web push · chiave scrittura marketplace · Google. → la squadra agisce su quasi tutto a ~€0.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Il LOOP INTERNO (non consegni il primo script)
1. [ ] **Esiste già?** Controlla `azioni.md` + `banco-ai.md` + `consegne/`. Se sì → riusa/estendi, non duplicare.
2. [ ] **2-3 approcci:** n8n no-code · script Node/Python · MCP nuovo / mano gratis vs a pagamento.
3. [ ] **Critica** ciascuno vs: robustezza · idempotenza · costo per azione · riuso · sicurezza (Galleria sotto).
4. [ ] **Ghigliottina:** *«se gira due volte o l'API dà errore, cosa succede — e un altro senior lo usa senza chiamarmi?»*
       → se non hai risposta, **non hai finito**.
5. [ ] **Tieni il più robusto-ed-economico**, butta gli altri (annota perché in memoria).
6. [ ] **Raffina:** gestione errori → retry/backoff → log → error-notify → dry-run di default → README + riga in `azioni.md`.
7. [ ] Solo ora consegni: strumento + README 5 righe + *perché questo approccio batteva gli altri*.

## TOOL 2 — Template di un FLUSSO n8n ROBUSTO (la gabbia, ogni volta)
```
[Trigger]            webhook / cron / evento — payload con un ID stabile
   │
[1. Valida input]    schema minimo; manca un campo → stop pulito + log (NON crashare a metà)
   │
[2. Dedup / Idempotenza]  hai già la idempotency-key in stato (Sheet/tabella)? → SE SÌ: esci (no-op). SE NO: marca "in corso".
   │
[3. Azione]          chiamata API con timeout · Retry-On-Fail ON (max 3, backoff esponenziale)
   │                 errore permanente (4xx non-429) → ramo dead-letter, NON ritentare
   │
[4. Conferma stato]  scrivi "fatto" + esito con la idempotency-key (chiude il loop, blocca il doppione futuro)
   │
[5. Log/Notify]      riga di log (timestamp, key, esito, durata)
   │
[Error Trigger ►]    workflow di errore separato → Telegram all'AD: «flusso X KO 3x, ultimo errore: …»
```
> Default **DRY-RUN**: un nodo `IF (env.AZIONI_LIVE != 1)` che invece di chiamare l'API reale stampa/logga il payload.

## TOOL 3 — CHECKLIST di un'automazione (una ❌ = non si collega al reale)
- [ ] **Idempotente:** ha una idempotency-key stabile e un controllo "già fatto?" prima di agire.
- [ ] **Retry/backoff:** transitori ritentati con backoff+jitter; permanenti NON ritentati (vanno in dead-letter).
- [ ] **Errori visibili:** logga ogni esecuzione + Error Trigger che avvisa un umano su Telegram. Niente silenzio.
- [ ] **Dry-run di default:** il fuoco reale richiede chiavi presenti **e** `AZIONI_LIVE=1`. Testato su me stesso prima.
- [ ] **Segreti in env:** zero chiavi nel codice/file/chat/commit. Scope minimo al compito.
- [ ] **Mano più economica:** è la più economica capace? se costa, perché non bastava una gratis? (dichiaralo)
- [ ] **Riuso:** README 5 righe + riga in `cervello/azioni.md`. Un altro senior lo usa senza chiamarmi.
- [ ] **Colore giusto:** costruire 🟢 · collegare canale reale 🟡 · spendere/irreversibile 🔴 → accodato in [[AZIONI-IN-ATTESA]].

## TOOL 4 — Il processo DRY-RUN → LIVE (i 4 cancelli, mai saltarli)
1. **DRY-RUN:** `node cervello/esegui-azione.mjs` → vedo lo stato dei canali; lancio l'azione e leggo l'output
   esatto (`[DRY-RUN] EMAIL → …`). Verifico destinatario, testo, importo. Nulla parte.
2. **TEST SU ME STESSO:** chiavi in env + `AZIONI_LIVE=1`, ma destinatario = Nicola/AD (1 Telegram, 1 email, 1 record).
3. **LOTTO PICCOLO:** 5-10 destinatari reali, controllo esiti e log.
4. **LIVE PIENO:** solo dopo che 1→3 sono puliti. Le azioni a persone/soldi restano accodate e firmate (🟡/🔴).
> Regola: **mai dal codice al lotto pieno.** Ogni gradino prova un'ipotesi diversa (formato → autenticazione → scala).

## TOOL 5 — Gestione SEGRETI (il protocollo)
- **Dove:** solo `.env.local` (locale) / env del worker. Mai altrove. `.env*` è in `.gitignore` (verifica).
- **Come si passano:** Nicola le incolla in env seguendo `cervello/collega-le-mani.md`. **Tu non le chiedi in chat**
  e non le scrivi mai: chiedi *"metti la chiave X in env"* e lavori in dry-run finché non c'è.
- **Naming canonico** (già usato dall'esecutore): `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`, `RESEND_API_KEY`/`RESEND_FROM`,
  `MARKETPLACE_SUPABASE_URL`/`MARKETPLACE_SUPABASE_WRITE_KEY`, `N8N_WEBHOOK_URL`, `GEMINI_API_KEY`, `AZIONI_LIVE`.
- **Rotazione:** chiave esposta = chiave bruciata → si ruota subito e si avvisa. Scope minimo riduce il danno.

## TOOL 6 — Pattern di INTEGRAZIONE / nuovo MCP (learning agility)
1. **Leggi i doc** dell'API/servizio: auth, rate limit, supporta `Idempotency-Key`? formato errori? webhook firmati?
2. **Payload minimo:** una chiamata sola, a mano, in dry-run/sandbox → costruisci il modello mentale.
3. **Avvolgi nella gabbia** (Tool 2): timeout, retry, dedup, log, error-notify.
4. **Decidi la forma giusta:** mano singola nell'esecutore SOLO se diretta e molto usata; altrimenti **un ramo n8n**
   (l'hub) per non gonfiare il codice. Un **MCP** solo se serve a Claude/AD leggere-quel-servizio in modo ricorrente.
5. **Documenta:** README + riga in `azioni.md` (scope, segreti, dry-run/reale) → audit-ready, riusabile.
> Confine: modifica al **prodotto** → @tech · RLS/sicurezza profonda → @security. Tu prepari e deleghi, non improvvisi.

## TOOL 7 — Scegliere la MANO (albero di decisione veloce)
`Avviso solo a noi?` → **Telegram** (gratis). · `Email a cliente/negoziante?` → **Resend** (free tier).
`Messaggio dentro il sito?` → **notifica in-app** (chiave scrittura). · `WhatsApp/social/Google/Sheets?` → **via n8n**.
`Testo ad alto volume?` → **Groq/DeepSeek/Gemini Flash-Lite**. · `Foto→dati / immagini?` → **Gemini Flash**.
`Soldi?` → **Stripe write = 🔴 firma**. · `Sito senza API?` → **browser automation**. Default: **la più economica capace**.

---
# 🖼️ STRATO 5 — GALLERIA (gold vs spazzatura, col PERCHÉ)

## AUTOMAZIONE
- ✅ **GOLD — reminder carrello via n8n.** Trigger evento `carrello_abbandonato` → dedup su
  `carrello_<id>_reminder_<giorno>` (Sheet di stato) → email Resend con Retry-On-Fail (3, backoff) → marca "fatto" →
  Error Trigger su Telegram se KO. Default DRY-RUN. *Perché vince:* **idempotente** (mai due email per lo stesso
  carrello), **osservabile** (sai sempre cosa è partito e perché), **costo ~€0** (mano gratis), **riusabile** (README + `azioni.md`).
- ❌ **SPAZZATURA — lo stesso, fatto male.** Script che chiama un'API a pagamento, **chiave hardcoded**, nessun retry,
  nessun log, agisce **subito** sul reale, e al doppio trigger manda **due email**. *Perché muore:* fragile (un errore
  e si pianta), insicuro (chiave in chiaro), costoso, e quando si rompe è una **scatola nera** che spamma i clienti.

## WEBHOOK / TRIGGER
- ✅ **GOLD:** webhook che **valida l'input**, **deduplica** sull'ID dell'evento, risponde 200 in fretta e fa il
  lavoro pesante in coda. *Perché:* chi ti chiama ritenta sui timeout → senza dedup avresti azioni doppie.
- ❌ **SPAZZATURA:** webhook che fa il lavoro lungo **dentro** la risposta (timeout → il chiamante ritenta →
  azione tripla) e non verifica la **firma** del payload (chiunque conosca l'URL fa partire azioni).

## INTEGRAZIONE / SEGRETI
- ✅ **GOLD:** chiave in `env`, scope minimo, naming canonico, riga in `azioni.md` (cosa/scope/dry-run-vs-reale).
  *Perché:* audit-ready, ruotabile, un altro senior la usa leggendo.
- ❌ **SPAZZATURA:** `service_role` di Supabase usata "per comodità" ovunque, incollata in un file del vault e in un
  messaggio. *Perché muore:* una chiave onnipotente esposta = il danno massimo possibile su dati clienti.

## SFORZO / ALTITUDINE
- ✅ **GOLD:** **generatore riusabile** (un template che sforna 100 automazioni, es. toolchain `creativi/`).
  *Perché:* L4+ — cambia come lavora un reparto, non risolve un caso.
- ❌ **SPAZZATURA:** un workflow n8n a 20 nodi per un **cron di 3 righe**. *Perché muore:* sforzo sbagliato al compito,
  fragile e illeggibile. Il minimo che risolve, robusto.

## 🏆 Pattern vincenti (regole trasversali)
Mano più economica capace · idempotency-key sempre · retry con backoff (solo sui transitori) · fallisci forte e
visibile (log + error-notify) · dry-run di default → me stesso → lotto → pieno · segreti in env, scope minimo ·
README + riga in `azioni.md` · n8n come hub (codice piccolo, mani tante) · generatore > script usa-e-getta.

## 🚩 Red flags (uccidi a vista)
Chiave hardcoded · webhook non idempotente · nessun retry/backoff · ritentare un 4xx permanente · errore silenzioso
(no log, no notify) · azione reale senza dry-run · `service_role` usata alla leggera · duplicare una mano esistente ·
n8n a 20 nodi per un cron · API a pagamento quando una gratis basta · **scrivere in `mycity-live`** (⛔ è del tech).

---
# ⛽ STRATO 6 — CARBURANTE (le "mani" da collegare e dove si innesta)
> Senza chiavi, ogni strumento resta **pronto in DRY-RUN**: collauda tutto a vuoto, niente parte. Quando arrivano
> le chiavi, l'interruttore `AZIONI_LIVE=1` accende il fuoco reale. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante (chiave/accesso) | A cosa serve | Dove si innesta | Colore |
|---|---|---|---|
| `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | avvisi a noi + error-notify dei flussi | esecutore (telegram), Error Trigger n8n | 🟢 gratis |
| `N8N_WEBHOOK_URL` (n8n self-hosted) | l'**hub**: instrada a WhatsApp/social/Google/Sheets | esecutore (n8n), Tool 2/6 | 🟢 gratis |
| `RESEND_API_KEY` (+ `RESEND_FROM`, dominio) | email a clienti/negozianti | esecutore (email), Galleria carrello | 🟢 free tier |
| `MARKETPLACE_SUPABASE_URL` + `..._WRITE_KEY` | notifiche in-app + scritture marketplace | esecutore (notifica) | 🟡 chiave potente |
| `GEMINI_API_KEY` | vision (foto→dati), generazione immagini, alto volume | banco AI, toolchain designer | 🟢 free tier |
| VAPID keys (`VAPID_PUBLIC/PRIVATE_KEY`) | web push ai clienti | `lib/push` | 🟢 gratis |
| Google API (Sheets/Forms/Business) | stato/dedup, liste, post | via n8n | 🟢 gratis |
| `GROQ_API_KEY` / `DEEPSEEK_API_KEY` | testo ad alto volume a costo bassissimo | banco AI | 🟡 cheap |
| WhatsApp Business / SMS / Stripe write / Ads | canali a pagamento o verifica Meta | via n8n / Stripe | 🔴 budget+firma |
| `AZIONI_LIVE=1` | **l'interruttore**: spegne il dry-run, accende il reale | tutto l'esecutore | 🟡 si accende a valle dei test |

**Dove si innescano (i 3 file-chiave):** l'esecutore `cervello/esegui-azione.mjs` (le mani dirette + hub) · il
registro `cervello/azioni.md` (catalogo mani per costo) · la checklist di collegamento `cervello/collega-le-mani.md`
(come Nicola incolla le chiavi in env). Lo starter pack gratis (Telegram · n8n · Gemini · Resend · push · scrittura
marketplace · Google) accende quasi tutto a ~€0.

> Finché una chiave manca: **NON inventare e NON collegare al reale alla cieca.** Lascia lo strumento pronto in
> DRY-RUN, accoda l'azione in [[AZIONI-IN-ATTESA]], e chiedi a Nicola la chiave come "carburante" che alza il livello.

---
*Manutenzione: questo kit è vivo. Quando un flusso va in produzione e torna il dato reale (errori↓, costo/azione↓,
riuso↑), aggiorna la Galleria (nuovo gold/spazzatura col perché) e la memoria `memoria-squadra/builder-automazioni.md`.
RIASSUMI/POTA mensile: resta denso e affilato.*
