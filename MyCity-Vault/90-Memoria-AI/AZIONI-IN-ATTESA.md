---
tipo: coda-azioni
fonte: senior dell'AD
---

# ⏳ AZIONI IN ATTESA — pronte a partire, aspettano il via di Nicola

> Qui i senior accodano le azioni **🟡/🔴 già PRONTE** (testo esatto, destinatario, importo, canale).
> Le **🟢** non passano di qui: i senior le fanno e basta.
> Nicola dà l'ok → l'azione passa a ✅ FATTO e parte (via i canali del marketplace o a mano).

## Come approvare
Scrivi all'AD: **"ok [numero/azione]"** oppure **"ok a tutte le 🟡"**. L'AD esegue, segna FATTO qui e lascia la traccia in [[DECISIONI]].

---

### 🟡 #pr-323-avvisi-parla — Mergia PR #323: «Parla con questa casella» su schede Avvisi · ⏳ IN ATTESA · accodata 2026-07-13 14:33

**Cosa fa:** sotto ogni scheda gialla «memoria incoerente» in Avvisi compare il link **«Parla con questa casella»** — apri chat contestuale, l'AD vede il testo completo dell'avviso e la data.

**PR su GitHub:** [#323 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/323)

**Cosa cambia:** da sola lettura dell'avviso a dialogo con l'AD su cosa significa e cosa fare — stesso pattern delle altre card del Pannello.
**Se va bene:** mergi #323 dal Pannello → deploy Vercel → Avvisi → sotto ogni scheda gialla trovi «Parla con questa casella».

- **Colore:** 🔴 (merge dal Pannello — card #96)

---

### 🟡 #pr-320-worker-plugins — Mergia PR #320: plugin worker token (grilling, ponytail, caveman) · ⏳ IN ATTESA · accodata 2026-07-13 12:38

**Cosa fa:** manifest `cervello/worker-plugins.json` + script `sync-worker-plugins.mjs` + 3 skill GitHub curati. Grilling = stress-test decisioni/PR; ponytail = codice minimo (solo `pannello/`, `cervello/`, `creativi/`); caveman-internal = output telegrafico SOLO su giro/lavori/metabolizza — MAI in chat con te.

**PR su GitHub:** [#320 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/320) ← branch `fix/worker-plugins-skills`, commit `6478a01e`

**Cosa cambia:** il worker risparmia token su giri e codice; la chat con te resta chiara e non tecnica.
**Se va bene:** mergi #320 dal Pannello → riavvia worker per caricare le nuove regole; fase 2 (altri 10 plugin in `candidati_fase2`) dopo review @security.

- **Colore:** 🔴 (merge dal Pannello — card #95)

---

### 🟡 #pr-319-volano-tasso — Mergia PR #319: fix volano tasso lezioni (ESITI quaderni + STATO) · ⏳ IN ATTESA · accodata 2026-07-13 12:42

**Cosa fa:** il calcolo del tasso lezioni legge anche gli ESITI dei quaderni senior e le citazioni in STATO, non solo i briefing — tasso onesto **0,29** (39/133). Fix pipeline in `giro.sh` + `tasso-lezioni.mjs` + `sentinella-dati.mjs`.

**PR su GitHub:** [#319 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/319) ← branch `fix/volano-tasso-lezioni`, commit `2d8ff61f` (conflitti risolti 13/7 12:42 — uniti #317+#318 su main)

**Cosa cambia:** il volano auto-coscienza misura le lezioni realmente applicate nel lavoro, non sottostima più.
**Se va bene:** mergi #319 dal Pannello → prossimo giro aggiorna sentinella volano con tasso corretto.

- **Colore:** 🔴 (merge dal Pannello — card #96)

---

### ✅ #pr-305-ordine-conversazioni — FATTO 2026-07-12 17:44 · fix già su main via PR #303 mergiata da Nicola

Aprire una chat non la sposta più in cima nella lista Conversazioni — ordine stabile (pinnate 📌 + data creazione). Commit `67c6b804` su main. PR #305/#306/#304 doppioni da chiudere senza merge (conflitti su file cervello). Deploy Vercel automatico.

- **Colore:** 🟢 (già merged via #303)

---

### 🟡 #pr-297-archivio-parallelo — Mergia PR #297: Archivio carica in 1-2 sec invece di 15 · ⏳ IN ATTESA · accodata 2026-07-12

**Cosa fa:** la route API dell'Archivio leggeva le cartelle una alla volta (15 chiamate HTTP in fila = ~15 secondi). Con `Promise.all()` tutte le chiamate partono insieme — il tempo diventa quello della cartella più lenta (~1-2 secondi).

**PR su GitHub:** [#297 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/297) ← branch pulito, solo `route.ts`, zero conflitti

⚠️ **Chiudi PR #296 su GitHub senza mergiare** — aveva conflitti su `sentinella-dati.json`, superata da #297.

**Cosa cambia:** apri Archivio → vedi i file in 1-2 secondi invece di aspettare 15.
**Se va bene:** deploy automatico, Archivio diventa comodo da usare ogni giorno.

- **Colore:** 🟡 (codice Pannello → il merge lo fai tu)

---

### ❌ #pr-299-badge-fix — SOSTITUITA da PR #316 · 2026-07-13 12:14

**Cosa è successo:** PR #299 (fix parziale badge) superata da #316 che unisce sync chat cross-device + logica badge completa secondo specifica Nicola 13/7.

**Da fare:** Chiudi PR #299 su GitHub senza mergiare. ~~Mergia **#316**~~ → sync già su main (#317); chiudi #316 senza merge.

---

### ❌ #pr-316-chat-sync-badge — SOSTITUITA · sync già su main · 2026-07-13 12:39

**Cosa è successo:** sync chat PC↔telefono + fix pallini rossi entrati su `main` con merge #317 (13/7 ~12:30). PR #316 obsoleta — stesso fix già live.

**Da fare:** Chiudi PR #316 su GitHub **senza mergiare**. Chiudi anche #299 se ancora aperta.

---

### 🟡 #pr-318-chat-ux-tre-fix — Mergia PR #318: X prompt + chat evidenziata + annulla invio · ⏳ IN ATTESA · accodata 2026-07-13 12:27

**Cosa fa:** (1) **X** sulla card «Prompt pronto» — chiudi senza copiare; (2) chat aperta **evidenziata** nel cassetto (bordo colorato + «aperta ora»), anche in chat fluttuante; (3) **Annulla invio** mentre compare «sto pensando…» — ferma l'AD, toglie il messaggio, rimette il testo nella casella.

**PR su GitHub:** [#318 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/318) ← branch `fix/chat-ux-tre-fix`, commit `03751823`, solo `globals.css` + `page.tsx` (conflitti risolti 13/7 12:39 — file worker contatore lezioni rimossi dal branch)

⚠️ **Non mergiare #316** — sync già su main. Opzionale: chiudi #316 senza merge.

**Cosa cambia:** UX chat più controllabile — chiudi prompt, vedi quale chat hai aperto, annulla invii per sbaglio.
**Se va bene:** deploy automatico Vercel; i tre fix online su PC e telefono.

- **Colore:** 🔴 (merge dal Pannello — card #94)

---

### ✅ #pr-conv-pin-badge — FATTO 2026-07-12 02:22 · PR #294 MERGIATA da Nicola · pin + badge "non letto" live

Feature: graffetta (📌) per pinnare chat in cima + pallino rosso per messaggi non letti (localStorage). PR #292 e #293 scartate per conflitti su file di memoria → risolto al terzo tentativo con branch pulito da main HEAD + solo `pannello/src/app/page.tsx`. Deploy Vercel automatico partito.

⚠️ **Chiudi PR #292 e #293 su GitHub senza mergiare** (superate da #294 già merged).

- **Colore:** 🟢 (già merged)

---

### ❌ #pr-290-report-piani — CHIUDERE SENZA MERGE · PR #290 basata su malinteso · 2026-07-12 01:39

**Cosa è successo:** PR #290 spostava "Archivio" in una sezione dedicata "Report & Piani" nel sidebar. Nicola ha chiarito che NON vuole quella sezione — vuole rimettere "Archivio" com'era prima (dentro "Approfondisci"). La PR #290 va chiusa su GitHub **senza mergiare**.

**Cosa voleva davvero Nicola:** il navigatore ad albero (Opzione A). **Già fatto:** commit `cc99d5e7` su main, deploy automatico in corso — Archivio mostra cartelle cliccabili.

**Da fare:** Nicola chiude PR #290 su GitHub senza mergiare (il navigatore è già live senza bisogno di quella PR).

---

### ❌ #pr-289-guard-pannello-main — SOSTITUITA da PR #295 (aveva conflitti) · 2026-07-12 02:35

PR #289 aveva conflitti su `sentinella-dati.json` e `routing.json`. Sostituita da PR #295 (branch pulito, zero conflitti). **Chiudi PR #289 su GitHub senza mergiare.**

---

### ✅ #pr-295-guard-pannello-main-v3 — FATTO 2026-07-12 02:40 · PR #295 MERGIATA da Nicola · guard giro.sh v3 live

La guard in `giro.sh` è attiva: il sistema di recupero VPS non commette più `pannello/` o `cervello/` su main automaticamente.

⚠️ **Chiudi PR #289 su GitHub senza mergiare** — superata da #295 già merged.

- **Colore:** 🟢 (già merged)

---

### ✅ #pr-288-scroll-chat — FATTO 2026-07-12 01:14 · Fix già su main (commit bf1ac43d) — nessuna PR da mergiare

Il sistema di recupero VPS ha committato il fix `forzaScrollRef` direttamente su main, come già successo con PR #286. **PR #288 va chiusa su GitHub (è superata — la modifica è già live).** La chat ora si apre sempre all'ultimo messaggio.

- **Colore:** 🟢 (già su main)

---

### 🟡 #pr-archivio-sezioni-chiuse — Pusha il branch e apri PR: sezioni Archivio chiuse di default · ⏳ IN ATTESA · accodata 2026-07-12 00:46

**Cosa fa:** le sezioni dell'Archivio (account-negozi, Audit & radiografie, ecc.) partono chiuse invece di aperte. Clicchi sul titolo → si apre; clicchi ancora → si richiude. Freccia ruota di 180°. La ricerca mostra i risultati comunque.

**Branch locale:** `fix/archivio-sezioni-chiuse-default` · commit `35524d20` (SOLO LOCALE — non pushato)
**File modificato:** `pannello/src/app/archivio/Documenti.tsx`

**Per sbloccare — scegli una delle due:**
- (A) Dal VPS: `git push origin fix/archivio-sezioni-chiuse-default` → poi apri PR su GitHub
- (B) In chat: scrivi **"ok pr archivio sezioni"** → l'AD esegue `node cervello/git-pr.mjs --repo ad-mycity --base main --accoda`

**Cosa cambia:** l'Archivio si apre pulito — vedi solo i titoli delle sezioni; espandi solo quelle che ti servono.
**Se va bene:** Nicola mergia la PR → deploy automatico → Archivio aggiornato nel Pannello.

- **Colore:** 🟡 (codice Pannello → il merge lo fai tu)

---

### ✅ #pr-chat-fluttuante-v2 — FATTO 2026-07-12 00:42 · Fix già su main (commit 4bcdd5c5) — nessuna PR da mergiare

Il sistema di recupero ha committato il fix direttamente su main prima che fosse possibile mergiare la PR #286. **PR #286 va chiusa su GitHub (è superata — la modifica è già live).**

- **Colore:** 🟢 (già su main)

---

### ✅ #pr-284-archivio — FATTO 2026-07-12 00:40 · PR #287 mergiata da Nicola · "Archivio" ora nel menu del Pannello

- **Colore:** 🟡 (codice Pannello → il merge lo fai tu)

---

### ✅ #pr-276-grafica-chat-coda — FATTO 2026-07-12 02:44 · PR #276 MERGIATA da Nicola · grafica "In coda" a 3 livelli live

La sezione **Lavori** del Pannello mostra ora 3 stati visivi distinti: in elaborazione (animato), in coda (grigio), errore (rosso). PR #275 (superata) chiusa. Deploy Vercel automatico.

- **Colore:** 🟢 (già merged)

---

### ✅ #pr-274-memoria-chat — FATTO 2026-07-12 02:44 · PR #274 MERGIATA da Nicola · chat con memoria sessioni precedenti live

Ogni messaggio include automaticamente le ultime conversazioni compresse. #272 (contesto memoria in coda), #270 (errori AutoCoscienza), #269 (chat caselle compatta) — tutte mergiata nello stesso batch. Deploy Vercel automatico.

- **Colore:** 🟢 (già merged)

---

### ✅ #crea-tabella-conversazioni — FATTO 2026-07-12 01:30 · Nicola ha eseguito il SQL su Supabase SQL Editor · tabella `conversazioni` + index + RLS + policy creati nel DB Memoria

⚡ **APPROVATA in chat da Nicola il 12/7 00:35 ("fallo tu")** — firma data. Il MCP Supabase Memoria è connesso (`apply_migration` disponibile). L'AD può eseguire direttamente nel prossimo turno.

**Problema:** le chat del Pannello si perdono a ogni ricarica perché la tabella `conversazioni` non esiste nel DB Memoria. Il codice è pronto, la tabella no.

**Passi — firma Nicola (2 opzioni):**

**Opzione A — 3 minuti su Supabase (subito):**
1. Vai su [supabase.com](https://supabase.com) → progetto Memoria (`xjljcsorpbqwttrejqte`)
2. SQL Editor → incolla e clicca **Run**:
```sql
create table if not exists public.conversazioni (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  titolo text not null default 'Conversazione',
  messaggi jsonb not null default '[]'::jsonb,
  ultima_lettura timestamptz
);
create index if not exists conversazioni_updated_at_idx on public.conversazioni (updated_at desc);
alter table public.conversazioni enable row level security;
create policy "service role full access" on public.conversazioni
  using (true) with check (true);
```

> ⚡ **Aggiornato 2026-07-12:** aggiunto `ultima_lettura timestamptz` — usato per mostrare il badge "non letto" nella lista conversazioni (se l'ultimo messaggio AI è più recente di `ultima_lettura`, compare il pallino). Si aggiorna ogni volta che si apre la chat. Richiesto da Nicola 12/7.

**Opzione B — aggiungi token al VPS (poi l'AD crea la tabella da solo):**
- Aggiungi `SUPABASE_ACCESS_TOKEN` (Management API token da supabase.com/account/tokens) nel file `.env` del VPS

**Cosa cambia:** le chat vengono salvate e sincronizzate — non si perdono più a ogni ricarica.
**Se va bene:** riapri il Pannello e la chat ripartirà da dove l'hai lasciata.

- **Colore:** 🔴 (operazione DB in produzione — firma Nicola)
- **Blocco n.1** da risolvere prima di `#allegati-vercel-env` (le env var servono, ma senza tabella non basta)

---

### 🔴 #allegati-vercel-env — Aggiungi 2 variabili su Vercel per sbloccare gli allegati nella chat · ⏳ IN ATTESA · accodata 2026-07-11 15:41

**Problema:** il Pannello non riesce a far leggere all'AD i file allegati. Il Pannello li carica su Supabase Memoria Storage, poi manda il percorso al worker. Il caricamento fallisce perché Vercel non ha le credenziali Supabase.

**Passi (2 minuti, su [vercel.com](https://vercel.com)) — firma Nicola:**
1. Vai al progetto Pannello → **Settings → Environment Variables**
2. Aggiungi `SUPABASE_URL` = `https://xjljcsorpbqwttrejqte.supabase.co`
3. Aggiungi `SUPABASE_SERVICE_KEY` = valore dalla riga `SUPABASE_SERVICE_KEY=eyJhbGci…` nel file `.env` del VPS
4. Clicca **Save** — il prossimo deploy le userà automaticamente

**Nota:** il worker VPS ha già entrambe le chiavi e sa scaricare i file — manca solo il lato Vercel.

**Cosa cambia:** il Pannello riesce a caricare file su Supabase Memoria; l'AD può leggerli e rispondere al loro contenuto.
**Se va bene:** test immediato — allega un file in chat e l'AD risponde al contenuto (no più errore).

- **Colore:** 🔴 (variabili d'ambiente in produzione — firma Nicola)

---

### 🟡 #recensioni-trigger — Attiva il messaggio "grazie + recensione" automatico dopo ogni consegna · ⏳ IN ATTESA · accodata 2026-07-11 15:50

**Template pronto:** `consegne/customer-success/2026-07-11-template-email-recensione.md`

**Situazione attuale (dati reali 11/7):**
- Ordini con `delivery_status = 'delivered'`: **0** (nessuna consegna completata)
- Recensioni in DB: **0** (tabella `reviews` e `store_reviews` entrambe vuote)
- L'unico ordine è quello zombie CANCELED (€19,05, PQ, 24/6) — non va contattato

**Cosa attivare:** costruire l'automazione in **n8n** (o webhook Supabase) che su cambio `delivery_status → delivered` invia l'email template via Resend, dopo 15–30 minuti. Delegare a **builder-automazioni** quando dai il via.

**Cosa cambia:** ogni cliente che riceve la spesa riceve entro 30 minuti un ringraziamento + link recensione. Non costa nulla (Resend già configurato). Genera le prime stelle sul marketplace.
**Se va bene:** le prime recensioni compaiono entro 24h dal primo ordine reale del 17/7. Stima: 1 recensione ogni 5 consegne nelle prime settimane.

- **Colore:** 🟡 (tocca Resend — email a clienti reali; l'automazione è nuova)
- **Attiva quando:** primo negozio online post-13/7, prima di accettare ordini reali

---

### 🔴 #post-bts-lunedi — Pubblica "Lunedì mattina ci vado di persona" sui canali social · ⏳ IN ATTESA · accodata 2026-07-11 15:30

**Contenuto completo:** `consegne/content/2026-07-11-post-del-giorno-lunedi-busso.md`

**Testo pronto (versione Gruppi Facebook — dal profilo personale del fondatore):**

> Lunedì mattina mi alzo presto, prendo la bici e giro nel centro storico di Piacenza.
>
> Busso alle saracinesche delle botteghe che voglio portare su MyCity. Di persona.
>
> Non mando una mail. Non pago un agente. Ci vado io.
>
> Perché se dico ai piacentini "la tua spesa la prepara qualcuno del centro", devo conoscere il centro anch'io. Devo sapere come si chiama il panettiere, a che ora alza la saracinesca, cosa va tenuto in fresco.
>
> Questa settimana le prime botteghe. La prossima, vi dico chi c'è.
>
> Un marketplace di Piacenza costruito a Piacenza — un negozio alla volta.
>
> *La spesa che tiene viva la città. Fai il tuo turno.*
>
> (nel 1° commento il link)

**Prima del post servono da Nicola (👁️ due minuti):**
1. **Link lista d'attesa** — incollalo qui e la macchina aggiunge il 1° commento al testo
2. **Visual** — opzione rapida: testo *"Lunedì mattina ci vado di persona."* su sfondo cotto-brand (si prepara in 5 minuti col template); oppure una foto tua in bici/piedi per il centro

**Timing suggerito:** sabato pomeriggio (oggi) o domenica mattina — finestra migliore per i gruppi FB; il lunedì 13/7 diventa "atteso".

**Cosa cambia:** primo post BTS-fondatore della serie "Il Turno" — mostra la faccia di chi costruisce il marketplace, non solo il prodotto. Angolo impossibile da copiare per Amazon.
**Se va bene:** commenti con "ci sono anch'io" + click lista d'attesa → follow-up naturale lunedì sera con "ecco le botteghe che ho incontrato" (post #5 già pianificato).

- **Colore:** 🔴 (pubblicazione su profilo personale / pagina — firma Nicola prima)
- **Canale:** Gruppi Facebook locali piacentini (profilo personale) + Instagram/Facebook Pagina MyCity

---

### 🟡 #pr-5bloccanti — PR #212: ⚠️ Manca PAT con scope mycity + rebase corretto · aggiornata 2026-07-11 04:00

**✅ Commit (2026-07-11 ~01:30):** `987b85b` — 46 file, 969 ins, 117 del. ✅ PR #212 aperta su GitHub. ✅ Rebase dal terminale VPS fatto. ⚠️ Push ha risposto "Everything up-to-date" — branch già in sync con origin PRIMA del fetch → PR ha ancora conflitti.

**Causa radice:** `GIT_PUSH_TOKEN` in `cervello/vps/.env` ha scope su `ad-mycity`, NON su `NicolaeRotaru/mycity`. Serve un PAT separato.

**⏳ Passi per chiudere — dal terminale VPS (in ordine):**

1. **Crea un nuovo PAT** su [github.com/settings/tokens](https://github.com/settings/tokens):
   - Tipo: Fine-grained · Repository: `NicolaeRotaru/mycity` · Permesso: `Contents: Read and write`

2. **Esegui sul VPS (⚠️ stash prima — ci sono modifiche non-staged che bloccano il rebase):**
```bash
cd /opt/mycity/ad-mycity/marketplace
git stash
git remote set-url origin "https://NicolaeRotaru:IL_NUOVO_PAT@github.com/NicolaeRotaru/mycity.git"
git fetch origin
git rebase origin/main
git push --force-with-lease origin fix/5-bloccanti-sicurezza
git stash pop
```

3. **Mergia la PR #212** su GitHub: [https://github.com/NicolaeRotaru/mycity/pull/212](https://github.com/NicolaeRotaru/mycity/pull/212)

**Cosa è fixato (nei commit del branch):**
1. `migrations/108+109` — RLS rider e auto-assign: anonimo non legge più dati clienti **(B2 chiuso)**
2. `app/api/seller/orders/[id]/reject/route.ts` — rifiuto venditore rimborsa Stripe automaticamente **(B4 chiuso)**
3. `migrations/110` — profilo pubblico non espone IBAN/CF/stripe_account_id **(G10 chiuso)**
4. `migrations/111` — fix migrazione 020 broken (RLS recensioni rider + 9 indici) **(G13 chiuso)**
5. `migrations/112` — wallet ripristinato su cancel/reject COD **(G4 chiuso)**
6. `migrations/113` — coupon check atomico **(G8 chiuso)**
7. `migrations/114` — newsletter double opt-in **(G17 chiuso)**
8. `migrations/115` — rimborsi incrementali scalano payout venditore **(G5 chiuso)**
9. `middleware.ts` — fail-closed senza variabili Supabase **(G11 chiuso)**
10. XSS JSON-LD: escape dati venditore **(G12 chiuso)**

**PR:** https://github.com/NicolaeRotaru/mycity/pull/212
**Cosa cambia:** 4 bloccanti + 8 gravi chiusi. Clienti protetti (GDPR, RLS), vendor rimborsati correttamente, coupon sicuri, newsletter conforme.
**Se va bene:** Nicola mergia la PR → migrazioni applicate al DB → sito sicuro.

- **Colore:** 🟡 (codice del sito → il merge lo fai tu).

---

### 🟡 #fix-35-gravi — Crea branch e scrivi i 35 fix gravi della radiografia · ⏳ IN ATTESA · accodata 2026-07-11 07:40

**Richiesta di Nicola (11/7 ~07:40):** risolvere TUTTI i 35 problemi gravi della radiografia (non solo i 5 bloccanti già in PR #212).

**⏳ Bloccante:** i comandi `git checkout` nel marketplace richiedono approvazione manuale. Approva questi due comandi dal terminale VPS:

```bash
git -C /opt/mycity/ad-mycity/marketplace checkout main
git -C /opt/mycity/ad-mycity/marketplace checkout -b fix/35-gravi-radiografia-2026-07-07
```

Poi dì **"ok #fix-35-gravi"** e scrivo tutti i 35 fix uno per uno (Write/Edit, nessuna altra approvazione necessaria per la scrittura dei file).

**Cosa cambia:** 35 problemi gravi del sito chiusi (sicurezza, pagamenti, UX, dati). Clienti e venditori più protetti, meno bug operativi.
**Se va bene:** PR aperta → Nicola mergia → migrazioni e codice in produzione.

- **Colore:** 🟡 (creazione branch + commit finale richiedono approvazione; la scrittura dei file è 🟢 immediata).

---

### 🟡 #checkin-pane-quotidiano — Porta questo kit alla visita di Pane Quotidiano lunedì 13/7 · ⏳ IN ATTESA · accodata 2026-07-11 10:40 · **aggiornato 2026-07-13 11:18**

> ℹ️ **Contesto:** PQ non è in churn. Nicola li conosce di persona e aspettano che la piattaforma sia pronta. La sentinella "negozio fermo" è scattata di nuovo oggi (firma `c0b240c0…`) — **cancello 🔬 confermato: falso positivo, nessuna telefonata anti-churn.** Il problema operativo resta la **vetrina scheletrica** (2/8), non l'abbandono.
>
> **Dossier stampabile aggiornato:** `consegne/account-negozi/2026-07-13-checkin-pane-quotidiano-sentinella.md`

**Health score — Pane Quotidiano (unico negozio approvato)**

| Dimensione | Stato | Note |
|---|---|---|
| Approvato sul marketplace | ✅ | Unico negozio LIVE |
| Prodotti caricati | ✅ | 258 prodotti presenti |
| Ordini ultimi 14 giorni | ⚠️ 0 | Atteso: PQ aspetta la piattaforma — non è abbandono |
| Logo negozio | ❌ manca | Da raccogliere fisicamente |
| Foto prodotti | ❌ 1+ mancanti | Da raccogliere fisicamente |
| Descrizione vetrina | ❌ manca | Da scrivere con loro (ai-copywriter dopo) |
| Indirizzo / città | ❌ manca | "Piacenza" — 1 riga da aggiungere |
| Fee consegna / min ordine | ⚠️ da verificare | Coerenti con l'operatività reale? |

**Punteggio: 2/8 — la vetrina è scheletrica.** Non blocca ora, ma abbassa la qualità percepita dai clienti del 13/7+.

---

**Kit per la visita del 13/7 — 3 cose da raccogliere di persona:**

1. 📸 **Logo** — chiedi se hanno un file (JPG/PNG) o fai una foto del cartello su sfondo neutro
2. 📸 **3–5 foto prodotti** — gli articoli più riconoscibili: banco reale o fondo bianco
3. ✍️ **Descrizione in 2 righe** — "Chi siete, cosa vendete di speciale, da quando" — bastano le loro parole, ci pensa la macchina a formattarle in copia

**Domande da fare durante la visita:**
- Avete accesso al vostro account? Riuscite a entrare?
- Avete ricevuto l'email di conferma attivazione?
- Quando volete iniziare a prendere ordini sul serio?
- Preferite che scrivo io la descrizione vetrina, o volete farlo voi?

---

**Cosa cambia:** la vetrina di PQ passa da scheletrica a completa → i clienti del 13/7+ vedono un negozio affidabile, non una pagina vuota.
**Se va bene:** Nicola torna con logo + foto + descrizione → la macchina li carica (🟢) e PQ è pronto al 100% per il primo ordine reale (obiettivo VEN 17/7).

- **Chi:** Nicola (visita fisica il 13/7)
- **Canale:** di persona — non un'email automatica
- **Colore:** 🟡 — il via di Nicola attiva la visita; i file raccolti dopo vanno in `consegne/negozi/pane-quotidiano/` e la macchina li carica.

---

### 🟡 #antichurn-13lug — Lancia il ciclo di check-in per i 6 ristoranti tattici dopo il 13/7 · ⏳ IN ATTESA · accodata 2026-07-11 12:15

> **Playbook completo:** `consegne/account-negozi/2026-07-11-playbook-antichurn-6-botteghe.md` (titolo storico — target = 6 ristoranti/trattorie, non botteghe core)
>
> **Dati reali al 11/7:** 0 negozi con ordini in calo reale. Pane Quotidiano (unico approvato) è escluso dall'anti-churn per design (aspetta la piattaforma, non è abbandono). 16 negozi demo sospesi = irrilevanti.

**Questo playbook si attiva il 13/7**, dopo che Nicola ha incontrato i 6 ristoranti (mossa tattica, non profilo core botteghe) e li ha onboardati.

**4 touch point per ogni ristorante onboardato (colori esatti nel playbook):**

| Giorno | Trigger | Azione | Chi |
|---|---|---|---|
| **T+3** (≈ mer 16/7) | 3gg dall'onboarding | WhatsApp/tel caldo: "come va?" | Nicola |
| **T+7** (≈ dom 20/7) | 0 ordini | Chiamata check-in + ottimizzazione vetrina | Nicola |
| **T+14** (≈ dom 27/7) | < 3 ordini | Post social bottega + boost su MyCity | AD + Nicola |
| **T+45** (≈ 29/8) | Health score < 50 | Decisione: upsell / promozione / ritiro | Nicola 🔴 |

**I 6 ristoranti e il loro aggancio principale:**

| Ristorante | Telefono | Aggancio anti-churn |
|---|---|---|
| Tigellabella | 366 162 8361 | Già su Deliveroo → "commissione 12% vs 30%" |
| La Forchetta | [raccogliere 13/7] | Sito perso → "la tua vetrina ora funziona" |
| Le Tre Ganasce | [raccogliere 13/7] | #4 TripAdvisor → "il #4 di Piacenza arriva a casa" |
| Osteria Carducci | [raccogliere 13/7] | Clienti abituali → "dì ai tuoi fissi che sei online" |
| La Dispensa | [raccogliere 13/7] | Fine dining → "box regalo vino+gastronomia" |
| Pescatori | [raccogliere 13/7] | ⚠️ No consegna (Calendasco) → asporto/prenotazione |

**Cosa faccio dopo il tuo "ok [#antichurn-13lug] + conferma quali ristoranti hai firmato":**
1. Inserisco i numeri di telefono raccolti il 13/7 nel playbook
2. Preparo il messaggio WhatsApp T+3 personalizzato per ogni ristorante (testo pronto, tu invii)
3. Setto le date dei touch point T+7/T+14/T+45 nel calendario (scadenzario)

**Cosa cambia:** ogni nuovo ristorante onboardato ha un ciclo di cura garantito nei primi 45 giorni — nessuno "si perde" in silenzio dopo l'onboarding.
**Se va bene:** primo ristorante con ≥ 5 ordini nei primi 14 giorni = segnale che il ciclo funziona → estendiamo il modello a tutte le future.

- **Chi avvia:** Nicola dopo le visite del 13/7 con "ok #antichurn-13lug + [nomi firmati]"
- **Canale:** WhatsApp/telefono diretto (Nicola) + AD prepara i testi pronti
- **Colore:** 🟡 (check-in reali con persone reali — Nicola li avvia, la macchina prepara i testi)

---

### 🟡 #pr-270-errori-undefined — Mergia PR #270: caselle AutoCoscienza mostrano testo vero degli errori · ⏳ IN ATTESA · accodata 2026-07-11 15:39

**Cosa cambia:** le caselle "Errore: undefined" nel Pannello (sezione AutoCoscienza) mostrano ora il testo reale dell'errore (es. "MCP marketplace gated in sessione..."). Bug: il giro scriveva `errori` come array di stringhe, il componente cercava `.titolo` su ciascuna → undefined.

**PR:** https://github.com/NicolaeRotaru/ad-mycity/pull/270

**Cosa cambia:** il Pannello smette di mostrare caselle vuote con "Errore: undefined" — ogni errore ha il suo titolo leggibile.
**Se va bene:** Nicola mergia la PR → deploy Vercel → caselle mostrano il testo degli errori.

- **Colore:** 🟡 (codice Pannello → il merge lo fai tu).

---

### 🟡 #pr-269-chat-height — Mergia PR #269: chat delle caselle più compatta · ⏳ IN ATTESA · accodata 2026-07-11 15:37

**Cosa cambia:** l'area messaggi nella chat delle caselle passa da 144px (`h-36`) a 96px (`h-24`) — un terzo di spazio in meno, il campo di testo rimane dov'è. Tocca `ChatCasella.tsx` (e la componente gemella se presente).

**PR:** https://github.com/NicolaeRotaru/ad-mycity/pull/269

**Cosa cambia:** la chat è più compatta e meno invasiva nel layout della casella.
**Se va bene:** Nicola mergia la PR → deploy Vercel → chat accorciata online. Se l'altezza risultasse ancora troppa o troppo poca, basta riaprire e cambiare il valore in 30 secondi.

- **Colore:** 🟡 (codice Pannello → il merge lo fai tu).

---

### ✅ #pr-255 — SUPERATA: sostituita da PR #257 · 2026-07-10 18:50

Branch `fix/chat-parla-casella-ux` presente su GitHub ma il commit non arrivava su `origin/main` in modo pulito. La PR #257 include gli stessi fix + la causa radice trovata (vercel.json). Non mergiare la #255.

---

### ✅ #pr-257 — MERGIATA (auto-merge): vercel.json + ParlaCasella UX · FATTO 2026-07-10 18:57

**Fix confermati su `origin/main`:**
1. `vercel.json`: `"deploymentEnabled": {"main": false}` → `true` — deploy Vercel sbloccati
2. `ParlaCasella.tsx`: altezza `h-36`, scroll al fondo all'apertura, nessun doppio a capo

**Nota:** PR mergiata via auto-merge (non da Nicola). I fix sono verificati su GitHub.
Vercel dovrebbe buildare a breve; il Pannello si aggiorna in 1-2 minuti dal merge.

---

### ❌ #pr-252 — ANNULLATA: sostituita dalla #255 · 2026-07-10 18:35

Branch non era su GitHub. Fix ripushato tramite PR #255.

---

### 🟡 #trigger-build-pannello — Committa un trigger su pannello/ per forzare il build Vercel · ⏳ IN ATTESA · accodata 2026-07-10 19:00

I 3 fix UX di `ParlaCasella.tsx` (altezza compatta, scroll all'ultimo messaggio, niente doppi a capo) + il fix `vercel.json` (deploy sbloccati) sono su `origin/main` via PR #257, ma **Vercel non ha ancora buildato** — Nicola non vede le modifiche nel Pannello.

**Cosa faccio:** creo un commit con 1 riga su `pannello/.deploy-trigger` e lo pusho su `main` (già in allowlist come `git push origin main`).

**Cosa cambia:** Vercel riceve il webhook, vede `pannello/` cambiato, builda il codice con la config aggiornata (`deploymentEnabled: main→true`) — in 1-2 minuti il Pannello mostra i 3 fix.
**Se va bene:** apri il Pannello, apri una casella → la chat è compatta e parte dall'ultimo messaggio.

- **Colore:** 🟡 (push su main, 1 riga in un file trigger, nessun codice cambiato).

---

### 🟡 #chip-chat-normale — Pusho il branch e apro la PR per i chip nella chat normale · ⏳ IN ATTESA · accodata 2026-07-10 18:00

I chip delle skill rapide funzionano in «Parla con questa casella» ma **mancano nella chat normale** (la chat principale che usi adesso). Il fix è già committato nel branch `fix/chat-altezza-scroll-spaziatura` — manca solo pubblicarlo.

Per sbloccarmi, aggiungi questa riga in `.claude/settings.local.json` (dopo `"Bash(git push origin feature/*:*)"`):
```json
"Bash(git push origin fix/*:*)",
```
Poi dimmi «fatto» e pusho + PR in 10 secondi.

In alternativa, pusha tu dal terminale:
```bash
cd /opt/mycity/ad-mycity && git push origin fix/chat-altezza-scroll-spaziatura
```

**Cosa cambia:** i chip (🔄 Giro, /verify, /auto-radiografia ecc.) compaiono anche nella chat normale, identici a quelli che già vedi in «Parla con questa casella».
**Se va bene:** il Pannello si deploya al merge e le due chat sono finalmente uguali.

---

### ✅ #chat-fix-1 — Pusha il branch fix/chat-altezza-scroll-spaziatura e apri la PR · FATTO 2026-07-10 18:10

PR #251 MERGIATA (Nicola, 10/7 ~18:15). Fix deployati su Vercel.

Fix inclusi:
- Altezza fissa finestra messaggi (`h-36`), scroll al fondo all'apertura, scroll al fondo dopo ogni risposta
- `motore-ai.sh`: in auto Claude viene scelto per primo; Cursor gira solo se `CERVELLO_MOTORE=cursor` esplicito

⚠️ `module_not_found` segnalato ancora da Nicola dopo il merge (10/7 ~23:59) → vedi azione `#worker-restart` qui sotto.

---

### 🟡 #sblocca-pannello — Push trigger-build + riavvio worker (1 comando, ~20 secondi) · ⏳ IN ATTESA · accodata 2026-07-11 14:48

**Cosa ho già fatto:** commit `4d37c741` pronto su `main` locale — tocca `pannello/.build-trigger` per far scattare la GitHub Action → Vercel builda il Pannello. Script push già scritto in `cervello/vps/trigger-build.sh`.

**Non riesco a fare da solo:** push su GitHub (richiede token, bloccato dal tool) + sudo restart (richiede privilegi).

**Esegui dal terminale VPS** (~20 secondi):
```bash
cd /opt/mycity/ad-mycity && bash cervello/vps/trigger-build.sh && sudo systemctl restart mycity-worker mycity-worker-chat
```

Lo script fa automaticamente:
1. `git push origin main` con il GIT_PUSH_TOKEN dal `.env`
2. Chiama la GitHub Action `deploy-pannello.yml` via workflow_dispatch → Vercel builda il Pannello
3. `sudo systemctl restart` riavvia entrambi i worker → `module_not_found` sparisce

**Verifica in 2 minuti:** vai su [pannello Vercel] e scrivi «come stai?» nella chat — se rispondo normalmente, tutto è risolto.

**Cosa cambia:** Pannello online aggiornato (build con le ultime 12 modifiche) + worker con env fresco (CERVELLO_MOTORE=claude caricato).
**Se va bene:** la Cabina è viva prima del 13/7, puoi vedere tutto prima di arrivare dalle botteghe.

- **Colore:** 🟡 (push su main + riavvio worker di produzione).

---

## 2026-07-09 23:30 · @devops-sre → 🔴 Accendi gli allegati in chat su Vercel (variabili + Redeploy)
Il codice degli allegati (foto + file nella chat con l'AD) è pronto nel branch. Perché funzioni online servono due passi che tocco NON posso fare io (sono nella dashboard Vercel): li devi fare tu, in 5 minuti.

**Passo 1 — Metti due variabili su Vercel** (Project → Settings → Environment Variables, ambiente *Production*). Sono quelle del progetto Supabase **MEMORIA** (NON il marketplace), le stesse che hai sul VPS in `cervello/vps/.env`:
- `SUPABASE_URL` = l'URL del progetto memoria (`https://…​.supabase.co`)
- `SUPABASE_SERVICE_KEY` = la service_role key del progetto memoria (segreta, resta solo sul server)

Servono perché la route `/api/allegato` carica il file nel bucket privato `chat-allegati` con quella chiave. Il bucket si crea da solo al primo upload: nessun passo manuale sul database.

**Passo 2 — Fai il Redeploy** (Deployments → ultimo deploy → Redeploy) così Vercel builda il codice nuovo del Pannello con gli allegati.

- **Cosa cambia:** dopo questi due passi potrai allegarmi foto e PDF/documenti direttamente dalla chat, e io li leggo. Finché non li fai, il pulsante graffetta compare ma l'upload dà errore.
- **Se va bene:** provalo tu dal browser (allega una foto, mandamela) → se la vedo, è fatto; poi mergiamo il branch su `main`.
- **Colore:** 🔴 — tocca la produzione (variabili + deploy). Lo firmi/fai tu; io non entro nella dashboard.

---

### 🔴 #60 — Metti le variabili di Storage su Vercel e fai partire il deploy (foto/file in chat) · ⏳ IN ATTESA · accodata 2026-07-09 23:11
**Cosa cambia:** con queste variabili la chat del Pannello inizia ad accettare **foto e file (PDF/documenti)** — li carica su Supabase Storage e li mostra in conversazione. Senza variabili + deploy, il codice c'è ma resta spento online.
**Se va bene:** provo l'upload nel browser sul Pannello vero e ti mostro che una foto e un PDF arrivano davvero, prima di dichiararlo fatto.

- **Colore:** 🔴 (tocca la produzione: dashboard Vercel + deploy online).
- **Superficie:** usi **Vercel online** → le variabili vanno in **Vercel → Progetto del Pannello → Settings → Environment Variables** (non sul VPS).
- **Passo A — variabili su Vercel** (Nicola, ~3 min): apri Settings → Environment Variables e verifica/aggiungi le chiavi Supabase del progetto **memoria** che servono allo Storage:
  - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (progetto memoria) — se già presenti per la chat, sono queste.
  - la chiave di **service role** lato server per scrivere nel bucket (nome esatto lo confermo quando ho pronto il branch del codice).
  - il bucket Storage dedicato (es. `chat-allegati`) creato sul progetto memoria.
  > Nota: i nomi esatti li fisso io quando finisco il codice nel branch — questa card è il segnaposto perché il passo non si perda. Non aggiungere nulla alla cieca finché non ti do la lista chiusa.
- **Passo B — deploy** (Nicola, 1 clic): dopo aver salvato le variabili, **Redeploy** dell'ultimo commit del Pannello su Vercel, così il codice foto/file va online.
- **Cosa NON faccio io:** non ho le mani sulla dashboard Vercel né sul deploy in produzione → li firmi tu. Io preparo il codice nel branch e ti do la lista esatta delle variabili.
- Traccia: [[DECISIONI]] 2026-07-09 23:11 · richiesta Nicola «aggiungi foto e file in chat».

---

### 🟡 #59 — Togli dalla macchina tutto ciò che usa le API AI a pagamento
**Cosa cambia:** spariscono i pezzi di codice che chiamerebbero API AI a consumo (generazione immagini/video/testi) — così non c'è più modo di far partire una spesa "credito AI". Sparisce anche la chiave Cursor inutilizzata dal server. L'AD continua a funzionare identico: gira già sul piano fisso Claude, non su un'API a consumo.
**Se va bene:** apro un branch con la rimozione (nessun file toccato sul ramo vivo finché non approvi il merge), poi tu revochi la chiave Cursor su cursor.com. Diventa impossibile, per costruzione, che un giro o l'autopilot brucino credito AI.

- **Colore:** 🟡 (auto-modifica del cervello → firma prima, mai da sola).
- **Cosa RIMUOVO in branch** (sono tutte "API AI a pagamento"):
  - `cervello/content-factory/ai/gemini-image.mjs`, `…/canva.mjs`, `…/ai-video.mjs` (connettori generazione a pagamento — oggi scheletri DRY-RUN dormienti, nessuna chiave).
  - `cervello/banco-ai.mjs` + `cervello/banco-ai.md` + `cervello/routing.json` (il "router" che sceglie tra Gemini/Groq/OpenAI/Whisper/ElevenLabs — ha senso solo se usi quelle API).
  - Il ramo **Cursor** in `cervello/motore-ai.sh` (`CURSOR_API_KEY` = API a consumo) → il motore resta fisso su Claude (forfait), com'è già ora.
  - Le sezioni "contenuti pro / modalità mondiale" in `CLAUDE.md` e `COMANDI.md` che promettono foto/video AI → riscritte su "solo rendering locale con template, niente API AI".
  - Aggancio in `cervello/worker.sh` al router `banco-ai` (righe AR-089).
- **Cosa NON tocco:** il motore Claude che fa vivere l'AD (è il piano fisso con cui parli ora); i publisher email/telegram/facebook (canali, non AI); Supabase/Stripe; il rendering grafico locale `content-factory/render*.mjs` (template, niente AI).
- **Cosa TENGO (consiglio):** i sensori `costo-ai.mjs` + `sentinella-budget.mjs` (+ metabolismo/letargo) — **non sono API AI**, sono la guardia-budget che questa casella chiedeva. Se li vuoi via comunque, dimmelo.
- **Azione TUA (🔴 credenziale):** revoca `CURSOR_API_KEY` su cursor.com (è viva) e toglila dal `.env` del VPS. Io dal repo non tocco il `.env` (vive solo sul server).
- **Resta valido a prescindere (non è AI):** l'autopilot deve rifiutare il LIVE su canali a pagamento (WhatsApp/SMS) senza budget-cap esplicito, e de-duplicare le voci del calendario. Lo tengo in cantiere separato.
- Traccia: [[DECISIONI]] 2026-07-08 23:40 · casella «Pre-mortem: Loop che brucia budget».


---

## 🩻 RADIOGRAFIA DELLA MACCHINA — cantiere 2/7 · PRIORITÀ
> 18/22 difetti chiusi in codice. Restano 3 cose che richiedono TE:

### 🔴 R1 — REVOCA IL TOKEN GITHUB (AR-004) · azione TUA · ✅ **FATTA — Nicola ha revocato il vecchio PAT (chat 2026-07-07)** → buco AR-004 chiuso. Resta solo la verifica a occhio: il Pannello hosted mostra ancora il giro di oggi? (se cieco = Vercel condivideva il token → dargli un suo PAT read-only + Redeploy). **↺ 7/7 10:57 — verifica trasformata in doer:** ordine A→B chiarito (prima la causa PRIMA = push `origin/main` **#54/#35**, poi il token). Il fix token è ora una card discreta **#55** (condizionata: parte solo se `/api/diagnosi` «Vault GitHub» è ROSSO dopo il push). Diagnosi completa: `consegne/devops/2026-07-07-verifica-pannello-hosted-token.md`. Il check «a occhio» dei 30 s resta l'unico passo umano (URL hosted non nel repo, rete gated in sessione).
Il file `cervello/vps/.env.save` col PAT è stato **rimosso dal repo**, il `.gitignore` è esteso (`.env*`/`*.save`) e ora c'è un **pre-commit hook** (`.githooks/pre-commit`) che passa **ogni commit** dallo scan-segreti e lo blocca — non più solo il giro. Ma il token **è già nella storia git**: vai su GitHub → *Settings → Developer settings → PAT* e **revocalo**, poi generane uno nuovo (solo nel `.env` del VPS, mai committato). È l'unica cosa che chiude davvero il buco.
> 📄 **Runbook pronto (sequenza esatta, ~5 min):** `consegne/security/2026-07-04-R1-revoca-pat-github-runbook.md`.
> ⚠️ **Difetto trovato in questo giro (🟢, 1 comando):** su QUESTO checkout del VPS il pre-commit hook **non è agganciato** (`core.hooksPath` non impostato, manca `.git/hooks/pre-commit`). L'ho preparato ma il write di git-config aspetta il tuo ok → lancia `bash cervello/installa-hooks.sh`.

> **Decisione Nicola 2026-07-03 (Pannello):** *"Genera nuovo PAT solo nel `.env` VPS."* → nuovo PAT solo in `cervello/vps/.env` (`GIT_PUSH_TOKEN`), non condiviso con Vercel.
> ⚠️ **Trappola da rispettare nella sequenza:** oggi lo STESSO token serve anche al **Pannello su Vercel** (`GITHUB_TOKEN`, `obsidian.ts`). Se revochi e metti il nuovo solo nel VPS, il Pannello va **cieco** (non legge più `memoria-ad` né il codice per radiografia/audit). Ordine corretto: 1) genera nuovo PAT (repo ad-mycity+mycity, Contents R/W + PR R/W) → VPS `.env`; 2) dai a Vercel un suo valore in `GITHUB_TOKEN` (consigliato: 2° PAT **read-only** = least-privilege, oppure lo stesso nuovo PAT); 3) **solo allora REVOCA il vecchio** su GitHub. Tutto 🔴, solo Nicola.

### R2 — Merge + deploy dei fix del cantiere · ✅ **FATTO 2026-07-07 13:35 — Nicola: «l'ho fatto»** → `git push origin main` eseguito: i 20 fix del cantiere (PR #212) sono **canonici su `origin/main`** + la memoria pubblicata nello **stesso push** (chiude anche #54). **Non verificato dal VPS in sessione** (fetch/push gated) → prova del nove a video = il Pannello hosted mostra i fix + il giro di oggi; se in `/api/diagnosi` la voce «Vault GitHub» è **ROSSA** → card token **#55**. Il testo storico sotto è **superato**.
> ⛔ **[SUPERATO 7/7 13:35 — vedi header] Tentativo di esecuzione 2026-07-04 15:22 — BLOCCATO (nessun merge fatto).** Motivo: **non esiste nessuna PR da mergiare.** `github-merge`/`git-merge.mjs` mergia solo una PR già aperta (la recupera via API GitHub) — non la crea. Strada A: branch `claude/machine-analysis-ez7g3e` **assente dai ref locali** (morta). Strada B: creare branch→push→aprire PR→merge, ma **rete/git-push chiusi in questa sessione** (`git ls-remote`, esecuzione `node`, `printenv` tutti negati). `main` ora è **459 commit** dietro `memoria-ad` (non più 116). ➡️ Resta ⏳: serve una sessione con **rete + git push aperti** (VPS/cloud-agent) per creare e mergiare la PR Strada B. Nessun dato inventato, niente ✅ FATTO finché il merge non avviene davvero.
I fix di codice del cantiere (timeout giro AR-005, gate sensori anti-invenzione, guardiano agenti, `sensore-cassa`, `allocazione-check` AR-006, **pre-commit hook segreti AR-004**, gate HACCP) vanno resi **canonici in `main`**.
> 🔎 **Scoperta di questo giro (cambia la premessa):** i fix **NON sono inerti** — sono già committati e **ATTIVI su `memoria-ad`**, il branch da cui gira il VPS (`giro.sh` li richiama davvero). Il problema vero è che **`main` è indietro di ~116 commit / ~150 file**: alla prossima avanzata di `main`, `aggiorna-cervello.sh` (righe 122-124, propaga le cancellazioni) **cancellerebbe da `memoria-ad` i file-fix assenti da main → romperebbe `giro.sh`**. Quindi R2 = **mettere in salvo i fix** rendendoli canonici, non "accenderli".
> ⚠️ **Mina:** non spingere in `main` l'oggetto tracciato `marketplace` (copia locale del repo mycity, va escluso). `.mcp.json` è pulito.
> 📄 **Runbook pronto (Strada A branch scoped / Strada B code-only, verifica + rollback):** `consegne/devops/2026-07-04-R2-merge-deploy-cantiere-runbook.md`.
> 🔗 **Coordina con #33** (no-path-cablati, stesso cantiere, mid-giro) e **#34/R1** (usa il PAT nuovo se R1 fatto prima). Deploy = **automatico** via `watch-main.timer` (~5 min, riavvia il worker): nessun `systemctl` a mano.

### 🟡 R3 — Ripuntare i contenuti su Pane Quotidiano (AR-006) · ✅ IN CORSO
**Correzione di rotta:** Casa Linda era una **demo**, non un negozio. L'**unico negozio reale** su MyCity è **Pane Quotidiano** (contratto firmato 1/7). Il cancello di allocazione è ora **attivo** (`cervello/allocazione-check.mjs`, gira a ogni giro). Fatto in questo giro: **pubblicazioni Garetti pesanti congelate/rimandate** (righe 6-8, 11 — prospect non firmato → solo bozze-template; la riga 9 resta come da tua approvazione del 30/6), **template neutro riusabile** creato (`consegne/content/TEMPLATE-bottega-riusabile.md`) e **skeleton pacchetto Pane Quotidiano** creato (`consegne/content/PANE-QUOTIDIANO-pacchetto.md`). **Serve da te:** foto/scheda/consenso di Pane Quotidiano per portare il pacchetto a livello pro (i segnaposti `[SERVE DA NICOLA]` dicono cosa manca).

### 🩻 R4 — Firma 6 fix di salute della macchina (radiografia Opus del 7/7) · ⏳ IN ATTESA DI FIRMA
> La radiografia profonda del 7/7 ha trovato **74 difetti macchina**: 34 già chiusi in codice, 6 in attesa di merge, **1 aperto-davvero già risolto oggi** (AR-030, checklist rigenerata) e **6 bloccanti che aspettano la tua firma** — sono auto-modifiche, per regola non le applico da sola. In ordine di **impatto sulla crescita**:
> 1. 🟡 **Il contatore dei costi AI è cieco** (AR-043) — registra ~882 token per un giro da 20 min (sottostima ~1000×): non possiamo decidere niente su costo/valore finché mente. Fix: leggere l'usage reale del motore (`--output-format json`).
> 2. 🟡 **Il volano non misura mai gli esiti** (AR-040/041/042) — 18 previsioni loggate ma 0 entrano nel punteggio (schema incompatibile) e nessun codice apre un esperimento: autonomia reparti ferma a 0 da sempre. Fix: ponte previsto→misura obbligatorio nel giro.
> 3. 🟡 **Il giro può pubblicare il proprio codice senza firma** (AR-044) — `git add -A` mette in produzione anche eventuali auto-modifiche del motore. Fix: guardiano-integrità che blocca il push se tocca codice fuori dalla memoria.
> 4. 🟡 **Pannello: "approva/ignora" risponde ok anche se il salvataggio fallisce** (AR-034) — con le azioni reali accese = rischio doppio invio. Fix: rollback della card + chiave di idempotenza (da chiudere insieme al claim atomico worker).
> 5. 🟡 **Checklist di Nicola — la radice** (AR-030) — il sintomo è risolto (rigenerata oggi), ma senza un guardiano che la rigeneri dalla coda a ogni report della sera torna stantia. Fix: (a) freschezza nel giro, oppure (b) far derivare la checklist dal parser della coda nel Pannello (elimina la copia).
> Dettaglio e causa-radice di ciascuno: `MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json` (AR-030, AR-034, AR-040→044). **Cosa cambia:** finché non firmi, il termometro-salute resta gated (voto pieno 0, provvisorio 55) e il volano-business non misura un solo esito. **Se va bene:** con le firme la macchina inizia a misurare il proprio costo e i propri risultati, e non può più modificarsi di nascosto.

---

> 🟢 **Scorciatoia lancio:** le righe **1-2** (le 3 decisioni 🔴 di lancio) sono consolidate in
> un **foglio-firma da 2 minuti** → `consegne/decisioni/2026-06-26-foglio-firma-lancio.md`. Firma lì.

## Coda
> ✍️ **Il titolo (colonna `Azione`) è il testo grosso della card:** scrivilo come lo diresti a voce, con un verbo
> e una cosa vera, **senza codici/sigle/ID/path** — quelli vanno in `Contenuto`, per chi esegue. Metro: la lettera
> a Nicola. Regola completa: `cervello/scrittura-umana.md`.
> Le ultime 2 colonne (**Cosa cambia · Se va bene**) sono la spiegazione che compare nella card del Pannello:
> scrivile in parole semplici per Nicola. Sono opzionali — se vuote, il Pannello mette un testo per-reparto.

>
> ⚠️ **Impatto sistema (AR-081 · pre-mortem cross-silo):** se una mossa di reparto rischia di **brucia margine**
> o **intasa operations** (spillover su altri silos), segnalalo in "Cosa cambia" con `⚠️ impatto sistema: …`.
> È la forcing-function della visione olistica (AD-VETTORI-SISTEMA): una vittoria di reparto non deve costare all'azienda.
| # | Data e ora | Reparto | Azione (pronta) | Colore | Contenuto | Canale | Stato | Cosa cambia | Se va bene |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-06-25 10:09 | vendite→legale | Termini commerciali **Pane Quotidiano**: commissione **12%**, **0€ costi fissi**, **payout a consegna**, **nessun vincolo** | 🔴 | `consegne/legale/contratto-pane-quotidiano-bozza.md` | firma col negozio (dopo validazione legale) | ✅ **FIRMATA** Nicola 1/7 01:02 · contratto creato · firma negozio 🔴 | Pane Quotidiano accetta 12% e 0€ fissi: può ricevere ordini veri e MyCity incassa commissione sul primo incasso. | Contratto firmato col negozio → onboarding payout + ordine zombie €19,05. |
| 2 | 2026-06-25 10:09 | finanza | Payout-test Stripe / flusso pagamenti | 🔴 | consegne/finanza/payout-faro.md | **Nicola esegue 03/07 mattina — ACCORPATO a #16** | ✅ **PROGRAMMATO** Nicola 1/7 01:02 · Stripe **sandbox** (decisione #3) · **⚠️ ri-ancorato 6/7: #16 è ANNULLATO**, non è più il caso-test → il payout-test va fatto sul **1° ordine reale nuovo** (o in sandbox pura senza ordine), non su #16 | Quando nasce la prima transazione reale, quella fa da payout-test: incasso riconciliato vs ordine (sandbox → nessuna carta). | Flusso validato su caso vero → si può passare a LIVE o replicare su nuovi ordini. |
| 3 | 2026-06-25 10:09 | customer-success | Via libera a inviare i **messaggi/telefonate ai clienti reali** del primo ordine (testi pronti) | 🟡 | consegne/customer-success/primo-ordine-faro.md | manuale (poi email/n8n) | ✅ approvato Pannello 30/6 09:08 · in coda | Partono i contatti veri al primo cliente (messaggio + telefonata di feedback): è la cura concierge che evita la "brutta prima esperienza". | Il primo cliente è seguito a mano, il problema viene intercettato prima del reclamo e si chiede la prima recensione. |
| 4 | 2026-06-24 10:43 | tech | Fix checkout (tab bar mobile copriva "Conferma ordine") | 🔴 | PR #199 | — | ✅ MERGED |  |  |
| 5 | 2026-06-24 10:43 | frontend-dev | Gruppo 1 audit-design (conversione & messaggi) | 🔴 | PR #200 | — | ✅ MERGED |  |  |
| 6 | 2026-06-26 23:05 | content-social | Pubblicare post storia-bottega Garetti "La saracinesca" su **IG + FB** (FB: link nel 1° commento). Serve il **LINK reale lista d'attesa** da Nicola | 🔴 | consegne/content/POST-storia-bottega-garetti-saracinesca.md + creativi/output/social/storia-bottega-garetti-saracinesca.png | IG + FB (manuale, poi n8n) | ⏸️ **CONGELATO** (AR-006) — Garetti è prospect non firmato: pubblicazione pesante bloccata dal cancello di allocazione finché non firma; il contenuto resta come bozza-template | Nessuna pubblicazione intestata a un negozio che non incassa: si evita di bruciare sforzo su un'ipotesi. | Quando Garetti firma (diventa `confermato`) si scongela in 1 minuto; nel frattempo lo sforzo va su Pane Quotidiano. |
| 7 | 2026-06-27 02:10 | content-social | Pubblicare "I TRE VENERDÌ" (post+storia IG/FB + post gruppo locale) **nelle sere dei Venerdì Piacentini rimasti: 3, 10, 17 lug**. FB: link nel 1° commento. **FINESTRA REALE che si chiude il 17/7** → serve LINK lista d'attesa + ok lancio | 🔴 | consegne/content/GARETTI-kit-L7.md | IG + FB + gruppi FB locali (manuale, poi n8n) | ⏸️ **RIMANDATO** Nicola 1/7 (priorità negozi 6/7; VP 3/7 saltato) | I 3 post escono nelle sere dei Venerdì Piacentini (3/10/17 lug), quando il centro è pieno: cavalchi l'evento. Finestra reale che si chiude il 17/7. | Picco di iscritti agganciato all'evento; poi "Bottega × Evento" può diventare una rubrica fissa. |
| 8 | 2026-06-27 02:10 | content-social→relazioni-istituzionali/pr-stampa | Contattare **organizzatori Venerdì Piacentini / pagine "Sei di Piacenza se…"** per ricondivisione DI VALORE (mini-storia bottega del centro, non spam) durante la finestra | 🔴 | consegne/content/GARETTI-kit-L7.md §3B | DM/email a pagine locali | ⏸️ **RIMANDATO** Nicola 1/7 (priorità negozi 6/7; VP 3/7 saltato) | Pagine e organizzatori locali ricondividono la mini-storia della bottega: portata gratis verso un pubblico già piacentino. | MyCity entra nelle conversazioni locali senza spendere, con la credibilità di chi ti ripubblica. |
| 9 | 2026-06-27 02:10 | content-social (proposta L7) | Rendere **"Bottega × Evento" rubrica fissa** (format-motore che aggancia ogni evento del centro PC a una bottega). Serve calendario eventi PC da @intelligence + consensi-bottega | 🔴 | consegne/content/GARETTI-kit-L7.md §7 | decisione strategica Nicola | ✅ approvato Pannello 30/6 09:08 · in coda | Si decide se trasformare "Bottega × Evento" in una rubrica fissa (ogni evento del centro agganciato a una bottega). | Diventa un format-motore che sforna contenuti rilevanti a ogni evento, quasi in automatico. |
| 10 | 2026-06-28 20:25 | AD/Tech | **Wiring Vercel della memoria**: impostare `SUPABASE_URL=https://xjljcsorpbqwttrejqte.supabase.co` + `SUPABASE_SERVICE_KEY=<service_role del progetto memoria>` nelle env del Pannello + **Redeploy** | 🟡 | la service key la prendi da Supabase → progetto ad-mycity → Settings → API | Vercel (manuale, lato Nicola) | ❌ rifiutato Pannello 30/6 09:08 | Il Pannello inizia a leggere/scrivere la memoria nel DB giusto: la spia "Memoria collegata" diventa verde e i briefing compaiono nella card "Cosa ho scoperto". | Ogni giro si accumula da solo nella Cabina, senza che io riscriva file a mano. |
| 11 | 2026-06-28 20:25 | designer→vendite | **Kit QR "Venerdì Piacentini"**: vetrofania + cartoncino-cassa con QR "ordina e te lo portiamo" per le botteghe aperte nelle sere del 3/10/17 lug (presidio offline, NON delivery in ZTL) | 🟡 | da produrre in creativi/output/ (brief @designer) — serve il LINK reale lista d'attesa | stampa + consegna a mano alle botteghe (manuale) | ⏸️ **RIMANDATO** Nicola 1/7 (priorità negozi 6/7) | Davanti a 50-60k persone/sera in centro, le botteghe espongono un QR che porta i clienti su MyCity: acquisizione a costo ≈0. Serve il link reale della lista d'attesa. | Primi iscritti agganciati all'evento più grande della città; il presidio diventa ripetibile ogni venerdì. |
| 12 | 2026-06-29 11:30 | vendite→legale-privacy | **Kit "Bando ER + MyCity"** per onboarding negozi: one-pager con preventivo MyCity intestabile + descrizione spesa ammissibile + mini-guida Sfinge + disclaimer "mai promettere l'esito". **⚠️ Giro web 1/7 01:29:** bando FESR Commercio ER **chiuso 23/6** (tet domande) — rivedere leva e scadenze prima del pitch; non citare 40% fondo perduto finché kit non aggiornato | 🟡 | da produrre in consegne/vendite/ (@vendite + @legale-privacy) | di persona + email ai lead | ✅ approvato Pannello 30/6 09:08 · **⚠️ da rivedere** post-giro web 1/7 | Kit bando va aggiornato: lo sportello FESR Commercio non accetta più domande dal 23/6. | Dopo revisione @relazioni-istituzionali + @legale: kit corretto o pivot su prossimo bando ER/Comune. |
| 13 | 2026-07-01 02:17 | tech→security | **Sprint 1 radiografia marketplace** — branch fix 4 bloccanti pre-live: (1) webhook Stripe rollback se insert fallisce (2) fee €3/consegna/negozio in UI checkout (3) RLS profiles → view pubblica (4) COD rollback se order_items fallisce | 🟡 | `consegne/audit/2026-07-01-radiografia.md` § Sprint 1 · `consegne/tech/sprint-1-radiografia-marketplace.md` · patch `consegne/tech/sprint-1-radiografia-marketplace.patch` · branch `fix/sprint-1-radiografia-2026-07-01` commit `03d66e6` | branch marketplace (no deploy) | ✅ **DEPLOY CODICE 1/7 ~10:31** Render auto da #209+#210 · fee UI + `seller_public_profiles` in prod · **⏳ migrazione 107 policy** (DROP policy — 1 SQL Nicola) · AD senza `MARKETPLACE_SUPABASE_WRITE_KEY` | Il checkout mostra il prezzo vero, non perde ordini Stripe/COD e non espone IBAN/KYC negozi: prerequisito sicuro prima del batch negozi 6/7. | Dopo SQL 107 → smoke COD + carta test → batch 6/7 sicuro. |
| 14 | 2026-07-01 07:41 | devops | **Token GitHub write su `NicolaeRotaru/mycity`** — estendere `GIT_PUSH_TOKEN` (fine-grained) con *Contents: Read and write* su repo **mycity** **oppure** aggiungere `MARKETPLACE_GIT_TOKEN` in `cervello/vps/.env` | 🟡 | `cervello/vps/.env.example` · oggi PAT scrive solo su `ad-mycity` | GitHub PAT + env VPS | ⏳ **SBLOCCATO 2/7 12:35** — Nicola ha creato `github_push_token` (mycity+ad-mycity, Contents+PR R/W); basta incollarlo in `GIT_PUSH_TOKEN` (VPS `.env`) 🔴 | L'AD può pushare branch e aprire PR sul marketplace senza passare da te ogni volta. | Nicola incolla il token → push marketplace testato (chiude 403 Sprint 1). |
| 15 | 2026-07-01 10:22 | devops→AD | **Token GitHub merge (`GITHUB_MERGE_TOKEN`)** — PAT fine-grained su **`ad-mycity` + `mycity`**: *Contents* + *Pull requests: Read and write* · incolla in `cervello/vps/.env` (può coincidere con `GIT_PUSH_TOKEN` / `MARKETPLACE_GIT_TOKEN` se stesso PAT) · guida: chat AD 1/7 10:45 + `cervello/vps/.env.example` | 🟡 | Nicola: «impara flusso merge-on-approval» · istruzioni PAT consegnate 10:45 | GitHub PAT + env VPS + `systemctl restart mycity-worker` | ⏳ **SBLOCCATO 2/7 12:35** — coincide con `github_push_token` (stesso PAT, ha già Pull requests R/W); basta il valore in `GIT_PUSH_TOKEN` | Dopo il tuo ok esplicito l'AD mergia la PR su GitHub al posto tuo — niente browser. Vercel redeploya il Pannello; opzionale sync VPS. | Card «Merge PR #N?» nel Pannello + un click «Ok merge» chiude il loop deploy 🟡. Deploy prod marketplace resta 🔴 separato. |
| 16 | 2026-07-01 11:05 (agg. 2026-07-04 09:31) | operations→supporto | **Eseguire Scelta A ordine zombie €19,05 — Pane Quotidiano** · approvato **`ok 16`** Pannello **2/7 08:38** · **decisione binaria 2/7 17:09 = Scelta A (esegui, non archivia)** · **#20 WhatsApp FATTO** (4/7 04:51) · **PROPOSTA APPROVATA 4/7 09:31: consegna STASERA cena 19–21** · **ri-approvata 4/7 09:58** (card precedente "stamattina 3/7", `proposta:esegui-16-stamattina-3-7-tap-whatsapp-20-21-22-c` → **registrata, non riproporre**; stesso mandato, slot serale confermato) → resta accettazione ordine + consegna, accorpata al payout-test #2 | 🔴 | `consegne/operations/2026-07-02-esecuzione-ok16-pranzo.md` | dashboard + consegna COD (manuale) | ❌ **DECADUTA — Nicola/Pannello 2026-07-06 16:15**: l'ordine #16 risulta **ANNULLATO** nel DB (`delivery_status=CANCELED`, alert Pannello «1 consegne annullate»). La macchina lo dava «in consegna» perché l'MCP era cieco. **Non c'è consegna da eseguire** — lo zombie €19,05 del 24/6 non si riesuma. Il 1° ordine reale va CREATO ex-novo. Cadono con questa anche #21 e #22 e la cascata gated su «#16 consegnato». | — | Il primo ordine reale va fatto NASCERE (domanda vera su PQ), poi consegna + payout-test su quel caso. |
| 20 | 2026-07-02 08:38 (chiuso 2026-07-04 04:51) | operations→supporto | **#16.1 WhatsApp buyer 348 642 1766** — messaggio + richiesta indirizzo reale (placeholder in DB) · link wa.me in pacchetto ok16 §PASSO 1 | 🔴 | `consegne/operations/2026-07-02-esecuzione-ok16-pranzo.md` § PASSO 1 | WhatsApp (Nicola) | ✅ **FATTO** (storico) — WhatsApp inviato il 4/7 04:51. **Nota 6/7:** l'ordine #16 è poi risultato **ANNULLATO** (CANCELED) → il contatto non ha prodotto un ordine reale; #21/#22 decadute. | — | — |
| 21 | 2026-07-02 08:38 (slot serale 2026-07-04 09:31) | operations | **Accetta l'ordine e chiama il fornaio Pane Quotidiano per confermarlo** — stasera verso le 19 | 🔴 | `consegne/operations/2026-07-02-esecuzione-ok16-pranzo.md` § PASSO 2 · in dashboard «Accetta» l'ordine `58094956…` · tel. negozio 0523 388601 · script A6 in AZIONI-PRONTE | dashboard + telefono (Nicola) | ❌ **DECADUTA — 2026-07-06 16:15**: segue #16, ordine ANNULLATO (CANCELED) → non c'è ordine da accettare. | — | — |
| 22 | 2026-07-02 08:38 (slot serale 2026-07-04 09:31) | operations→customer-success | **Ritira dal fornaio, consegna e incassa €19,05 in contanti, poi segna «Consegnato»** — finestra 19–21 | 🔴 | `consegne/operations/2026-07-02-esecuzione-ok16-pranzo.md` § PASSO 3–4 · ritiro Pane Quotidiano in Via Calzolai 25 → consegna all'indirizzo del buyer → «Consegnato» in app → poi A13 feedback + A14 recensione | consegna manuale + app (Nicola) | ❌ **DECADUTA — 2026-07-06 16:15**: segue #16, ordine ANNULLATO (CANCELED) → niente ritiro/consegna. La 1ª transazione end-to-end va fatta su un ordine reale nuovo. | — | — |
| 17 | 2026-07-01 20:02 | devops | **Attiva sync VPS automatico** — 1 comando root sul VPS (Nicola «ok configura sync VPS» + **«ok 17»** 20:18): `sudo bash /opt/mycity/ad-mycity/cervello/vps/install-sync-vps.sh` | 🟡 | `cervello/vps/install-sync-vps.sh` · `mycity-sync-vps.sudoers` | Console Hetzner root (1×) | ⏳ **Nicola ok 17** · install **bloccato** (mycity senza sudo) · handler `sync-vps` ✅ in `worker.sh` · **resta 1× root** Console Hetzner | Dopo ogni merge su `main` l'AD allinea il worker da solo — non devi più lanciare `aggiorna-cervello.sh` a mano. | Post-merge: dici «ok merge …» → merge GitHub → Vercel redeploy → VPS si aggiorna in automatico (~30s). |

> 📋 I **4 gruppi rimasti** (2 errori-vuoti · 3 contrasto · 4 brand+layout · 5 immagini/PWA) sono nel piano [[PIANO-FIX-DESIGN]] — eseguibili uno alla volta con *"sistema il gruppo N dell'audit design"*.

| 18 | 2026-07-02 07:09 | @tech | Porta online le modifiche del Pannello (approva il merge della PR #131) | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/131 · merge ad-mycity → main | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 19 | 2026-07-02 07:35 | tech | **Deploy fix ruoli acquisto** — admin bloccato, seller solo via «Vai al marketplace» (modalità cookie) | 🔴 | `consegne/tech/2026-07-02-ruoli-acquisto-admin-seller.md` · PR **#211** merged `f84fc70` · smoke `consegne/qa/2026-07-02-smoke-ruoli-acquisto-post-19.md` | Render (marketplace) | ✅ **MERGED** Nicola **`ok merge fix ruoli-acquisto`** 2/7 08:40 · Render auto-deploy ~2–5 min · @qa smoke post-deploy | Gli account assistenza non possono più creare carrelli/ordini test; i venditori non finiscono sul catalogo per errore — solo se cliccano il pulsante dedicato. | CRM pulito (1 solo carrello buyer reale); meno confusione ruoli in onboarding 6/7. |
| 23 | 2026-07-03 02:50 (agg. 2026-07-04 11:56) | AD/data-engineer | **Il sensore che misura le vendite del sito (PostHog) è spento da 24 giri: serve la chiave giusta** — quella di lettura, la generi dal tuo account PostHog | 🟡 | `cervello/vps/.env:27` (sostituisci il valore) · verificatore `cervello/verifica-sensori.mjs:158` · diagnosi: sulla riga 27 c'è una **Project Key** `phc_…` (solo scrittura eventi) → l'endpoint di lettura dà 401. Serve una **Personal API Key** `phx_` (PostHog → Settings → Personal API keys → Create, scope Project:read; verifica `POSTHOG_HOST` EU/US). ⚠️ Il codice legge `POSTHOG_API_KEY` per prima: **sostituisci il valore sulla riga 27** con la `phx_`, non aggiungere una seconda variabile (resterebbe ignorata). Il Pannello usa un'altra chiave client-side: nessun impatto | env VPS (sostituisci riga 27 + `systemctl restart mycity-worker`) | ⏳ in attesa — la Personal Key la generi tu dal tuo account PostHog | Il sensore funnel/conversione torna a vedere: al prossimo giro il contatore giri-ciechi si azzera e la sentinella 🧠 si spegne. Finché è cieco: nessun numero PostHog scritto come fatto. | Sensore verde → possiamo misurare conversione/eventi del marketplace, non solo i 7 numeri Supabase. |
| 25 | 2026-07-03 11:26 (agg. 2026-07-04 11:52) | account-negozi | **Telefonata di 2 minuti al fornaio Pane Quotidiano per non farlo mollare** — agganciata alla chiamata dell'ordine (#21); l'unico negozio reale aspetta da ~10 giorni | 🟡 | `MyCity-Vault/90-Memoria-AI/AZIONI-PRONTE.md` **A6** (check-in) + **A7** (upsell 🟢 post-consegna) · registro `consegne/account-negozi/2026-07-04-playbook-anti-churn.md` · stessa telefonata 0523 388601, +2 min, poi follow-up dopo la consegna. Rischio qui = primo ordine fermo da ~243h (peggiorato +24h vs 3/7) → «qui non vendo». Non duplica #16/#21: è lo strato-relazione | telefono (rider su #21) | ❌ **CHIUSA — Nicola 2026-07-06** («non c'è bisogno con PQ, li conosco e aspettano finché tutto non è pronto»): PQ **non è a rischio churn**, è un'attesa concordata. La telefonata anti-churn non serve. Resta valido solo A7 (upsell 🟢) **dopo** la 1ª consegna, non come retention | — | — |
| 27 | 2026-07-03 11:40 (ri-verif. 2026-07-09 11:30) | customer-success | **Chiedi la prima recensione al cliente dopo la consegna del primo ordine** — prima un messaggio di feedback, poi (solo se è contento) la recensione | 🔴 (bozze 🟢) | [[AZIONI-PRONTE]] **A13** feedback (+3h da «Consegnato») → se 👍 **A14** richiesta recensione (+1g) · modello neutro **A4** · testo pieno `consegne/customer-success/2026-07-01-playbook-recensioni.md` · parte quando il 1° ordine reale è «Consegnato» (oggi 0 consegne complete nel marketplace → nessuno da sollecitare). Coperto dalla firma #3; non duplica #22 | WhatsApp 348 642 1766 (+ email/in-app) | ⏳ in attesa — **gate ri-ancorato 6/7: 1° ordine reale consegnato (NON #16, annullato)**; parte quando nasce e si consegna un ordine vero; ramo 👎 → @supporto, A14 sospesa | Il primo cliente reale viene seguito post-consegna: prima intercettiamo eventuali problemi, poi (solo se contento) chiediamo la recensione. | Prima recensione verificata di MyCity a Piacenza → social proof sulla scheda del faro + aggancio a #26 (carrello samir) per il 2° acquisto. |
| 24 | 2026-07-03 02:57 | account-negozi/AD | **Zittisci un falso allarme: la macchina segnala «negozio fermo» su Casa Linda, che è solo una demo** — bastano 3 righe di codice, con la tua firma | 🟡 | `consegne/account-negozi/2026-07-03-negozio-fermo-casalinda-falso-positivo.md` (patch dentro) · `cervello/sentinella-dati.mjs:185-188` · il sensore `negozio_fermo` conta anche i negozi demo/seed (UUID `11111111…`): vanno esclusi così scatta solo sui negozi VERI fermi da 14g. Fix (dopo riga 187): `const SEED_DEMO = /^11111111-1111-1111-1111-/i;` + `.filter((v) => !SEED_DEMO.test(v.id))`. Auto-modifica → firma tua, non applicata da sola | commit branch `memoria-ad` (no deploy) | ⏳ in attesa firma | La sentinella «negozio fermo» smette di svegliare la macchina su un negozio inesistente: scatterà solo su negozi REALI fermi da 14g (oggi: nessuno). | Coda pulita + zero rischio di contattare un negozio demo quando colleghiamo le «mani». |
| 26 | 2026-07-03 11:40 (ri-verif. 2026-07-04 11:47) | crm-lifecycle | **Riporta indietro il cliente che ha lasciato un carrello da €10** (samir: 3 prodotti bio Pane Quotidiano, fermo dal 16/6) — parte dopo che ha ricevuto il primo ordine | 🟡 | `consegne/crm/2026-07-03-recupero-carrelli-pronte.md` · playbook `consegne/crm/2026-07-01-playbook-recupero-carrelli.md` · carrello `57494b3e…`, unico carrello buyer reale. Bozze pronte: Touch #1 promemoria senza sconto 🟡 · Touch #2 col codice `BENVENUTO10` 🔴 (solo se #1 non converte). Parte SOLO dopo #16 consegnato (stesso cliente). Gli altri 3 carrelli abbandonati sono admin/seller/demo → SKIP | Email (Resend, spento) — manuale finché mani off | ⏳ in attesa — **gate ri-ancorato 6/7: 1° ordine reale consegnato (NON #16, annullato) + ok @legale-privacy (consenso, `email_marketing=false`) + email da /admin/users** | L'unico cliente reale riceve un promemoria caldo del carrello da €10 dopo aver ricevuto il primo ordine: un secondo acquisto invece del silenzio. | Se torna: primo cliente con 2 ordini → base per riordino/referral; se muto dopo Touch #2, si archivia. |
| 37 | 2026-07-06 14:32 | crm-lifecycle | **Accendi il "porta un amico" e manda il primo invito** — 5€ al cliente + 5€ all'amico quando l'amico ordina e riceve | 🔴 | `consegne/crm/2026-07-06-playbook-referral.md` · testi in [[AZIONI-PRONTE]] **A17** · il loop è GIÀ nel codice (referrals mig.015, premio €5 su consegna mig.089, welcome €5 mig.029, no self-referral mig.092, pagina `/profile/referral` live). Costo reale incrementale ≈€5 per cliente nuovo con ordine ricevuto. Anti-frode già attiva (premio solo su CONSEGNATO, no auto-invito) | Email/WhatsApp (Resend spento) + pagina invito nel sito | 🅿️ **RIMANDATA da Nicola 2026-07-09 12:12: si riparla del referral DOPO che inserisce il primo negozio** (inserimento previsto 13/7, di persona). Gate precedente resta valido a valle: 1° ordine reale consegnato + cliente contento (A13 👍) + mani Resend accese. Fino ad allora fuori dalle card "da approvare". | Si accende il referral e parte il primo invito a samir dopo che riceve #16: se porta un vicino che ordina, 5€ a lui e 5€ all'amico. Il canale di crescita più economico che abbiamo (CAC ≈€5). | Un cliente ne porta un altro senza spesa pubblicitaria → primo motore organico; poi si aggiungono i tetti anti-frode (🟡) prima di scalare. |
| 39 | 2026-07-06 15:40 | vendite→onboarding | **Chiama le botteghe food per farle entrare su MyCity** — parte la campagna di prospecting sulle botteghe food del centro (panetterie, macellerie, gastronomie). Copione, ordine di chiamata e obiezioni sono pronti; la demo forte è "c'è già Pane Quotidiano online in centro". ⛔ Leva bando ER: CHIUSO il 23/6/2026 (limite 350 domande raggiunto — non più disponibile). Pitch alternativo: retail piacentino −6,6% Q2 + caldo 40°C il 15-17/7 = urgenza reale senza scadenza artificiale. Chi dice sì → handoff a @onboarding-negozi (vetrina <48h). **Lista: 10 botteghe verificate dal DB pronte + 17 da completare con un giro dati live** (query pronta nel file). | 🟡 | `consegne/vendite/2026-07-06-lista-27-botteghe-food-da-chiamare.md` (scheda chiamate + copione) · kit `consegne/vendite/kit-bando-er-mycity.md` | Telefono (numeri da recuperare Maps/visita) · poi email/WhatsApp | ⏳ in attesa — **gate: dal 13/7** (Nicola riparte operativo) · meglio **dopo la 1ª consegna #16** (demo "funziona davvero") · telefoni non nel DB → da recuperare · **⚠️ aggiornamento 6/7 16:35:** le **6 prioritarie-A** (Osteria Carducci, La Forchetta, Tre Ganasce, La Dispensa, Trattoria dei Pescatori, Tigellabella) Nicola le fa **DI PERSONA il 13/7, non le chiama** — dossier profondo pronto in `consegne/vendite/2026-07-06-dossier-6-botteghe-visita-13-7.md` **+ schede-cheat tascabili da stampare** (`consegne/vendite/2026-07-06-schede-cheat-6-botteghe-visita-13-7.md`: 1 pagina/bottega — apertura, offerta-che-non-sa-di-volere, 3 obiezioni+risposta, cosa verificare dal vivo) — agg. 6/7 16:50; le chiamate valgono solo per il resto della lista dei 27 | Il motore vendite si riaccende sulle prime 10 botteghe food reali del centro: ogni "sì" è un negozio nuovo che può incassare, e il bando ER (scade 21/7) dà un motivo per rispondere adesso. | Prima bottega che dice sì → onboarding done-for-you <48h → secondo negozio reale su MyCity dopo Pane Quotidiano; poi si scala alle altre della lista. |
| 28 | 2026-07-03 19:46 | AD/Tech→DevOps | **Merge + deploy PR #167 — fix lettura vault del Pannello** (memoria-ad→main auto-guarente in sola lettura + ramo servito osservabile in `/api/stato` + parsing briefing tollerante). Toglie la causa radice del «Pannello non vede tutti i dati di GitHub». | 🟡 merge / 🔴 deploy | branch `claude/github-obsidian-vault-integration-cl02mq` · **PR #167** · `pannello/src/lib/obsidian.ts` · `pannello/src/app/api/stato/route.ts` · `pannello/.env.example` | GitHub merge + Vercel redeploy | ⏳ **PRONTO** · `tsc`+`next build` verdi · **deploy Vercel bloccato oggi** dal limite free «api-deployments-free-per-day» (>100/die) → si sblocca ~24h | Il Pannello smette di mostrare schermate vuote quando la memoria è su un ramo disallineato, e segnala da quale ramo sta leggendo (spia di deriva). | «ok merge 28» → merge PR #167; quando il limite Vercel si sblocca (o su piano Pro) il redeploy porta il fix in produzione. |
| 29 | 2026-07-04 00:20 | account-negozi | **Rassicura il titolare di Pane Quotidiano mentre l'ordine è ancora fermo** — telefonata standalone di 2 min: ci prendiamo noi la colpa del ritardo, gli diciamo che è stato scelto come primo negozio. **Parte SOLO se #16 slitta ancora**; se l'ordine si chiude → salta A9 e vai a A6/A7. **Non duplica A6** (A6 = relazione sulla chiamata #21; A9 = tocco che parte se #21 non parte). Playbook anti-churn: 0 negozi con trend −X% (1 solo negozio reale nel marketplace), churn qui = **time-to-first-value** (0 incassi da ~230h). | 🔴 (bozza 🟢) | `MyCity-Vault/90-Memoria-AI/AZIONI-PRONTE.md` **A9** · `consegne/account-negozi/2026-07-04-anti-churn-standalone-pane-quotidiano.md` | Telefono 0523 388601 · backup WhatsApp/in-app | ❌ **CHIUSA — Nicola 2026-07-06**: PQ non è a rischio (relazione nota, attesa concordata). Anche la casella post-annullamento («Chiama il fornaio…») che sostituiva A6/A9 è **archiviata**: non chiamare per anti-churn. | — | — |
| 30 | 2026-07-04 04:31 | content-social | **Pubblica il post del sabato di Pane Quotidiano** — "È sabato: fai il tuo turno, la spesa dalle botteghe del centro da casa, senza ZTL". Angolo utilità/weekend agganciato a "Il Turno", **complementare** alla storia-bottega di ieri (A8): quella racconta il negozio, questo spinge l'azione del sabato + iscrizione lista. Sul faro reale (Pane Quotidiano, `confermato`); Garetti resta congelato (AR-006). Gate onestà passato: solo "bio dal 1976" (fonte pubblica), 0 numeri finti, 0 testimonianze. | 🔴 (bozza 🟢 fatta) | `consegne/content/2026-07-04-POST-turno-del-sabato-PQ.md` · anteprima [[AZIONI-PRONTE]] **A15** | IG feed @mycity.piacenza + storia 9:16 + gruppi FB locali | ⏳ in attesa firma — **versione neutra tipografica pubblicabile con sola firma**; versione col nome+foto = ok titolare (chiamata A6/#21); serve link lista con UTM `turno_sabato` (@builder-automazioni) | Esce il post del sabato del negozio reale su MyCity: spinta di iscrizioni nel weekend, a costo ≈0, ripubblicabile dal negozio; complementa il ritratto di ieri senza duplicarlo. | Il negozio ripubblica ai suoi clienti → primi iscritti caldi alla lista; si consolida il ritmo settimanale del motore "Volti/Il Turno". |
| 32 | 2026-07-04 05:23 · **↺ ri-approvata dal Pannello 2026-07-08 22:40** | AD/security→frontend-dev→qa | **Chiudere l'ultimo blocco di sicurezza del sito prima delle 6 botteghe (SQL 107 / RLS `profiles`)** — proposta approvata oggi dal Pannello. **⚠️ SCOPE CORRETTO 8/7 (cancello 🔬):** NON è "1 comando SQL" come scritto l'1/7 — la verifica di oggi ha trovato **~34 embed raw `profiles!...fkey` ancora nel codice client** → 107 nuda chiude il leak IBAN/KYC **ma spegne insieme vetrina, ordini e RITIRO RIDER** (con `!inner` i prodotti spariscono dalla ricerca). Chiusura sicura = **deploy coordinato SQL+codice**: (1) 🟡 branch `fix/107-embed-migration-2026-07-08` che migra i ~34 embed vetrina allo helper `seller_public_profiles` (helper già in produzione; **branch NON producibile in sessione 8/7: git/npx su `marketplace/` negati dal sandbox** → spec pronto nel dossier, si costruisce al giro VPS o con Bash aperto); (2) 🔴 anteprima+smoke (scheda prodotto, ordine, ritiro rider, ricerca, COD); (3) 🔴 deploy branch **+** SQL 107 nella stessa finestra (mai SQL prima del codice); (4) 🔴 verifica RLS (anon → `stripe_account_id/billing_iban` = 403). **Firma già data** (2/7 «eseguilo tu, io approvo», ri-confermata 4/7 e oggi dal Pannello); **non serve altra firma**. Blocco unico = **la mano**: MCP write `execute_sql`/`apply_migration` **ancora negato in sessione** (ri-provato oggi) + branch da deployare su Render. **Fuori scope** (follow-up blocco 110/GDPR): embed che leggono `full_name` di controparti rider/buyer/reviewer — 107 non li rompe. | 🟡+🔴 | dossier `consegne/security/2026-07-08-chiusura-blocco-107-profiles.md` · patch `consegne/tech/2026-07-08-107-embed-migration.patch` *(da generare quando la mano è aperta)* · smoke `consegne/qa/2026-07-04-verifica-rls-smoke-checkout.sh` · runbook `consegne/tech/2026-07-04-sql-107-drop-policy-runbook.md` · fonte `marketplace/migrations/107_seller_public_profiles.sql` | **Sblocco = la mano:** (A) concedi `mcp__supabase-marketplace__apply_migration`/`execute_sql` in sessione live + deploy branch su Render → l'AD applica SQL+verifica+smoke · (B) giro sul VPS con rete+creds che esegue SQL e smoke; il branch codice va comunque mergiato/deployato prima o insieme | ⏳ in attesa — **AD-owned, firmato, bloccato solo sulla mano** (branch pronto + grant tool/giro VPS) | Chiunque senza login smette di poter leggere IBAN/KYC/Stripe dei negozi, la vetrina resta viva (view) e il ritiro rider non si rompe: prerequisito di sicurezza del batch 6/7 chiuso in modo sicuro, non un DROP che spegne il sito. | Deploy coordinato → anon non legge più i dati sensibili (403), vetrina/ordini/ritiro-rider funzionano dalla view, smoke COD passa → via libera al batch 6/7 del 13/7. |
| 31 | 2026-07-04 05:10 | qa | **Prova in prod i blocchi di ruolo sugli acquisti** — verifica che dopo #19 l'admin NON possa comprare (403 sugli ordini) e che il negoziante venga rimandato alla sua area. Lo script è pronto (`bash consegne/qa/smoke-ruoli-post19.sh`): la parte anonima gira da sola, la matrice completa serve un login da admin, negoziante e cliente (bastano i loro cookie). Serve solo dare il via / girarlo dal VPS dove la rete è aperta. | 🟡 | `consegne/qa/2026-07-04-smoke-ruoli-acquisto-post19.md` · script `consegne/qa/smoke-ruoli-post19.sh` | curl in sola lettura verso `mycity-marketplace.com` (nessun ordine creato) | ⏳ in attesa — la parte anonima è 🟢 pronta ma la rete è chiusa in questa sessione; la matrice autenticata serve 3 login (cookie admin/seller/buyer) | Confermiamo dal vivo che nessun admin può creare ordini e che i negozianti restano nella loro area: il guard di #19 è davvero attivo in produzione, non solo nel codice. | Se tutto verde → via libera al recupero carrello samir (coda #26); se rosso → fix urgente a backend/frontend e stop alle comunicazioni d'acquisto. |

| 34 | 2026-07-04 09:40 | security→AD | **Revoca il token GitHub compromesso e sostituiscilo** (AR-004 · proposta R1 approvata dal Pannello) — un vecchio PAT è già entrato nella storia git: l'unico modo di chiudere il buco è revocarlo su GitHub. **Ordine anti-blackout (5 min):** 1) genera un nuovo PAT (repo ad-mycity+mycity, Contents R/W + PR R/W) → incollalo in `cervello/vps/.env` (`GIT_PUSH_TOKEN`, `chmod 600`, mai committato); 2) dai a Vercel un valore per `GITHUB_TOKEN` (consigliato: 2° PAT read-only, oppure lo stesso nuovo); redeploy Pannello; 3) **SOLO ORA** revoca il vecchio su GitHub; 4) verifica push VPS + Pannello. Runbook con i passi esatti pronto. | 🔴 | `consegne/security/2026-07-04-R1-revoca-pat-github-runbook.md` | GitHub (revoca+genera) + env VPS + Vercel — mani di Nicola | ✅ **FATTA — Nicola ha revocato il vecchio PAT (chat 2026-07-07)**: buco AR-004 chiuso, il segreto nella storia git è ora carta straccia. Resta solo verifica a occhio del Pannello hosted (se cieco → Vercel condivideva il token, dargli un suo PAT read-only + Redeploy). Storicamente **RI-APPROVATA dal Pannello 2026-07-04 15:33** («Revoca il vecchio token GitHub (R1)», rosso), **aspetta solo le tue mani su GitHub/Vercel/VPS** (io non tocco token/env reali 🔴). Runbook anti-blackout pronto e ri-verificato.<br>⛔ **Comando Pannello «esegui il merge» 2026-07-04 15:24 — NON eseguibile come `github-merge` (nessun merge fatto):** #34 **non è una PR** ma una **revoca+rotazione di PAT**; `github-merge` mergia solo una PR già aperta e **non esiste alcun numero PR** (né inventabile). L'AD non tocca token/env reali (🔴) né inventa PR (🔬) → resta ⏳ finché non ci metti le mani. | Il segreto già finito nella storia git diventa carta straccia: nessuno che clona il repo può più usarlo per entrare su GitHub. La difesa anti-ricaduta (gitignore + hook + scan) è già in piedi. | Vecchio PAT morto + nuovo attivo su VPS e Vercel → buco AR-004 chiuso davvero, cantiere radiografia da 2/3 a 1/3 residuo (restano R2 merge/deploy e R3). |
| 36 | 2026-07-04 12:10 | content-social | **Pubblica il post di Sant'Antonino di Pane Quotidiano** — "Oggi Piacenza festeggia sé stessa: una città si tiene viva quando qualcuno alza la saracinesca". Cavalca il momento unico di OGGI (Sant'Antonino, patrono di Piacenza — fiera, centro pieno, snapshot reale [[STATO]] 4/7), agganciato a "Il Turno". **Non duplica A8/A15** (storia-bottega / sabato): angolo nuovo, a scadenza di giornata. Sul faro reale (Pane Quotidiano, `confermato`); Garetti congelato (AR-006). Gate onestà passato: Sant'Antonino il 4/7 e "bio dal 1976" = fatti pubblici, 0 numeri finti, 0 testimonianze, festa citata con rispetto. Ghigliottina "poteva farlo Amazon?" → no. | 🔴 (bozza 🟢 fatta) | `consegne/content/2026-07-04-POST-santantonino-PQ.md` · anteprima [[AZIONI-PRONTE]] **A16** | IG feed @mycity.piacenza + storia 9:16 + gruppi FB locali | ⏳ in attesa firma — **versione neutra tipografica pubblicabile con sola firma OGGI**; versione col nome+foto = ok titolare (chiamata A6/#21); serve link lista con UTM `turno_santantonino` (@builder-automazioni). ⏰ **A scadenza di giornata: vale solo il 4/7** | MyCity si fa vedere nel giorno di massima attenzione locale associando il negozio reale alla festa della città: reach nel picco di oggi + primi iscritti caldi, a costo ≈0, ripubblicabile dal negozio. | Il negozio ripubblica ai suoi clienti → iscritti caldi alla lista nel giorno-picco; si consolida il ritmo del motore "Volti/Il Turno". |
| 35 | 2026-07-04 09:50 | AD/DevOps-SRE | **Metti in salvo i fix della macchina rendendoli canonici in `main`** (R2 · ✅ **RI-APPROVATA dal Pannello 2026-07-07**: «Metti in salvo i fix della macchina nel ramo principale», rosso). **AGGIORNAMENTO 2026-07-07 10:40 — l'azione si è SEMPLIFICATA a un fast-forward push.** Il mondo del 4/7 (fix su `memoria-ad`, main ~116 indietro, riconciliazione Strada A/B via PR) è superato: con il RAMO UNICO `main` applicato, i 20 fix del cantiere (timeout giro AR-005, sicurezza worker AR-026/027/028, allocazione AR-031, verifica-sensori AR-035, claim atomico AR-037, pausa fail-closed AR-038, AR-039, gate sensori anti-invenzione, guardiano agenti, sensore-cassa, hook segreti AR-004, gate HACCP) sono **già dentro `main` locale del VPS** (merge **PR #212**). Resta solo **pubblicarli su `origin/main`** (indietro di **1831 commit**) — il ramo letto da Pannello hosted e da watch-main. **Comando unico non-force:** `cd /opt/mycity/ad-mycity && git pull --rebase origin main && git push origin main` (committa prima le scritture di memoria pendenti). ⚠️ **È lo STESSO push di #54** (la memoria): un solo `git push origin main` chiude entrambe (AR-008, niente doppioni). | 🔴 | `consegne/devops/2026-07-07-R2-metti-in-salvo-fix-verifica.md` (supera il runbook del 04-07) | git push su `origin/main` — sessione VPS con rete aperta, oppure «ok 35» / il giro VPS lo fa da sé | ✅ **FATTA — Nicola: «l'ho fatto» (2026-07-07)**: il `git push origin main` è stato eseguito → i 20 fix (PR #212) sono canonici su `origin/main` e la memoria di oggi (#54) è pubblicata nello stesso push. **#35 e #54 chiuse insieme.** ⚠️ **Non verificato dal VPS in questa sessione** (fetch/ls-remote verso GitHub sono gated qui, la punta locale `origin/main` è ancora ferma al 27/6 finché non si fa fetch): **prova del nove a video = il Pannello hosted mostra i fix + il giro di oggi**; se dopo il push `/api/diagnosi` «Vault GitHub» è ROSSO → parte la card token #55 (Vercel condivideva il PAT revocato). **Verifiche di sicurezza fatte 07/07 10:40 (VPS):** ✅ `git merge-base --is-ancestor origin/main main` → `origin/main` è **antenato** di `main` = **fast-forward pulito, niente `--force`** · ✅ divergenza **1831 avanti / 0 dietro** (solo avanti) · ✅ `marketplace` **assente dal tree di `main`** (`git cat-file -p HEAD^{tree}` → niente landmine, non trascina la copia codice) · ✅ i fix sono in `main` (grafo PR #212). Rollback = `git revert` mirato (FF puro, storia non riscritta). | I 20 fix del cervello dell'AD smettono di vivere solo nel `main` **locale** non pushato — dove un allineamento futuro da `origin/main` (indietro) li spazzerebbe via rompendo `giro.sh`/i guardiani: diventano canonici in `origin/main`. Nello stesso push va live anche la memoria del giro (Pannello hosted allineato). | Push → Vercel ripubblica il Pannello hosted (vede subito i fix + il giro) e `watch-main` riallinea il VPS in ~5 min riavviando il worker coi guardiani attivi; cantiere radiografia protetto, #35 e #54 chiuse insieme. |
| 33 | 2026-07-04 08:40 | AD/DevOps | **Togli il path Windows dai due workflow di radiografia** — resta cablato `return 'C:\Users\InfinitaPossibilita\mycity-live'` in `.claude/workflows/radiografia.js:46` e `audit-design.js:46`. La fonte di verità (`cervello/marketplace-repo.mjs`) è **già ripulita** e c'è un **guardiano anti-ricaduta** (`cervello/no-path-cablati-check.mjs`, gira a ogni giro). Questi 2 file l'harness li marca "file sensibili" e blocca ogni scrittura senza il tuo ok. Modifica identica in entrambi: sostituire il blocco `const local = join(adRoot,'marketplace'); if(existsSync(local)) return local; return 'C:\\...'` con **`return join(adRoot, 'marketplace')`** (fallback cross-platform). Sblocco = **approva l'Edit** in una sessione live, oppure girala dal VPS. | 🟡 | `.claude/workflows/radiografia.js:41-47` · `.claude/workflows/audit-design.js:41-47` · guardiano `cervello/no-path-cablati-check.mjs` | approva Edit sui 2 file sensibili (o giro VPS) | ⏳ in attesa — bloccato solo sul permesso di scrivere i 2 file sensibili | Le due radiografie del sito smettono per sempre di dipendere da una cartella del vecchio PC Windows: girano ovunque (VPS, cloud) leggendo `MARKETPLACE_REPO` o `marketplace/`. | Guardiano verde a ogni giro → l'errore non può più rientrare; radiografia/audit-design portabili al 100%. |
| 40 | 2026-07-06 16:52 | devops-sre→AD | **Controlla che la sentinella veda gli ordini annullati al prossimo giro** — il codice è pronto (la sentinella ora legge lo stato di annullamento e alza un allarme sui nuovi ordini cancellati); resta solo confermare che sul VPS giri davvero al primo tick e non ripeta l'allarme sul vecchio ordine di test. | 🟡 (accendere il timer = 🔴) | codice `cervello/sentinella-dati.mjs` (regola A7 «ordine annullato», watermark `ultimo_annullo_visto` su `canceled_at`) · doc `cervello/sentinelle.md` · timer `mycity-sentinella-dati.timer` sul VPS (attivarlo se spento = `sudo bash cervello/vps/install-ritmo-timers.sh`, 🔴) | giro/tick sul VPS (o dry-run `node cervello/sentinella-dati.mjs`) | ⏳ in attesa — **auto-modifica firmata dall'approvazione della proposta**; non testata a runtime in sessione (`node` gated qui) → verifica al 1° giro live | La macchina smette di essere cieca sugli ordini annullati: un ordine cancellato scatta un allarme (con la causa e, se pagato, la proposta di rimborso da firmare) invece di restare invisibile fino a quando apri il Pannello. | Al 1° giro live: 0 falsi allarmi sull'ordine di test (24/6, watermark), e un annullamento vero futuro sveglia subito operations. |
| 41 | 2026-07-06 11:11 | @onboarding-negozi/@finanza | Fai un primo ordine di prova su Pane Quotidiano e attiva il payout-test | 🔴 | Il vecchio ordine #16 (`58094956…`, COD €19,05) risulta ANNULLATO dal 3/7 15:38 nel DB → è morto, non si consegna più. Serve un ordine-prova pulito su PQ (seller `c0b240c0…`, Via Calzolai 25, tel 0523 388601) da chiudere per intero: accetta → consegna → payout-test. `consegne/finanza/payout-faro.md` | manuale + dashboard PQ | in attesa | Porti la North Star da 0 a 1 su un negozio reale e verifichi che i soldi arrivino davvero al negozio (payout), cosa mai successa finora. | Il ciclo end-to-end è validato una volta: da lì si replica su ogni nuovo negozio della shortlist. |
| 42 | 2026-07-06 12:21 | @crm-lifecycle | Tieni pronta l'email che riporta indietro chi si ferma: parte da sola quando un cliente resta due settimane senza riordinare — oggi non c'è ancora nessuno da riattivare | 🟡→🔴 | Pacchetto ARMATO (dry-run, 0 invii): `consegne/crm/2026-07-06-win-back-pronte.md`. **Segmento dormienti reali = 0 oggi** (0 ordini completati nel DB → nessuno da riattivare; fonte MCP Supabase 6/7 11:11 + STATO). Sequenza pronta: mail #1 "ci manchi" a **€0** (🟡) → mail #2 con **consegna offerta cap ~€4** oppure codice **SPED5** (gratis sopra €25, già in DB) 1×/cliente (🔴) → telefonata per chi avrà ≥2 ordini. **Incentivo entro budget €0: nessun coupon nuovo, `BENVENUTO10` escluso.** Trigger: primo ordine PQ consegnato (#21) + 14 gg fermo. samir escluso (già in recupero carrelli, AR-008). 4 gate chiusi: dormiente reale, consenso marketing, mani Resend, firma incentivo | email (Resend, mani spente) | ⏸ armato — nessun invio | Appena un cliente reale smette di ordinare per due settimane, riceve da solo l'invito a tornare; se serve, la seconda mail gli offre la consegna (max ~4€, una volta sola). Oggi non parte niente: nessun cliente ha ancora completato un ordine. | Quando arrivano i primi clienti veri non li perdiamo in silenzio: il flusso li recupera da solo a costo quasi zero e misuriamo quanti tornano (holdout per il dato incrementale). |
| 43 | 2026-07-06 12:40 | @vendite | Dal 9/7 aggiungi al giro chiamate le 3 botteghe della spesa fresca che mancano nel centro | 🔴 | Scout categorie mancanti nel cluster (oggi solo Pane Quotidiano; la shortlist è tutta ristorazione). 3 target `scelta_ragionata` su fatti pubblici (prospect, non nel DB): **Ortofrutta** → Peretti Frutta e Verdura, Via Alberici · **Salumeria/DOP** → Antica Salumeria Garetti, Piazza Duomo 44 (già #1) · **Formaggi/gastronomia** → Caseificio Amendolara, Via Trento 7. Pitch pronti + condizioni (12%/0€ fissi/payout a consegna) e agganci (⛔ bando ER CHIUSO il 23/6; argomento alternativo: caldo 40°C + retail −6,6%): `consegne/vendite/2026-07-06-scout-negozi-categorie-mancanti.md` · dettaglio esteso A18 in [[AZIONI-PRONTE]] | telefono/di persona (manuale) | in attesa | La pipeline mira alle botteghe che completano il carrello-spesa (frutta, salumi, formaggi) attorno al faro, invece di inseguire pizza/sushi dove Glovo/JustEat già competono. | Anche 1-2 sì e MyCity diventa "la spesa completa del centro" — offerta unica in città e fine del rischio "un solo negozio reale". |
| 44 | 2026-07-06 12:51 | @growth-monetizzazione | Accendi la fedeltà di rete: punti spendibili in tutti i negozi MyCity | 🔴 | Programma *MyCity Punti* pronto (meccanica + economia + comunicazione): 1 punto ogni €1 speso, 1 punto = €0,02 (cashback 2%), spendibili su TUTTA la rete, soglia riscatto 100 punti = €2, tetto 30–50% del carrello, scadenza 12 mesi. **Il montepremi lo paga il margine MyCity, non il negozio.** ⚠️ impatto sistema: erode il margine (2/12 ≈ 17% delle commissioni) → @finanza fissa il % con l'incrementale (holdout) PRIMA. Meccanica completa: `consegne/growth/2026-07-06-playbook-fedelta-di-rete.md` (Parte A) · dettaglio A19 in [[AZIONI-PRONTE]]. **ARMATO dietro gate di scala:** parte solo a ≥5 negozi reali + ordini reali avviati (oggi 1 negozio, 0 transazioni) — niente rete = niente dove spendere i punti. | config banner + account cliente (codice) + email (Resend, spente) | ⏸ armato — nessun lancio | I clienti guadagnano un vantaggio spendibile in tutti i negozi del centro: è il moat locale che Amazon non copia. Oggi non parte: manca la rete (1 solo negozio). | Quando ci sono ≥5 negozi la fedeltà è già scritta e firmabile: alza frequenza e scontrino, misurata con holdout per il dato incrementale. |
| 45 | 2026-07-06 12:51 | @growth-monetizzazione→@legale-privacy/@contabilita | Vendi le Gift Card MyCity: incasso anticipato che gira nei negozi del centro | 🔴 | Gift card digitali €10/€25/€50 spendibili su tutta la rete. **Incasso subito, paghi il negozio solo al riscatto** → cassa positiva upfront senza debito. Non-usato dopo scadenza = breakage (ricavo). **Prima di vendere serve:** parere @legale-privacy + @contabilita su IVA (buono MULTIUSO, art. 6-ter DPR 633/72 → IVA all'utilizzo) + registro passività `giftcard_liability` + anti-frode @trust-safety. Mani: Stripe write (oggi sola lettura) + generatore codici (@builder). Meccanica: `consegne/growth/2026-07-06-playbook-fedelta-di-rete.md` (Parte B) · dettaglio A20 in [[AZIONI-PRONTE]]. **ARMATO:** nessuna vendita finché Stripe write non è collegato e il parere fiscale non è dato. | pagina marketplace + Stripe (spente) | ⏸ armato — nessuna vendita | Entrano soldi veri oggi (incasso anticipato) che poi girano nelle botteghe reali; "Regala Piacenza" invece di un buono Amazon. Serve prima il sì fiscale e la mano Stripe. | Carburante di cassa senza debito + un prodotto-regalo che porta clienti nuovi nella rete (welfare aziendale locale B2B). |
| 46 | 2026-07-06 13:23 | @content-social | Pubblica il post di oggi "Il Lunedì della Bottega" di Pane Quotidiano su Instagram e Facebook | 🔴 | Post del giorno pronto (rubrica settimanale nuova, #1): testo + storia + versione gruppi FB in `consegne/content/2026-07-06-POST-lunedi-della-bottega-PQ.md`. Angolo: oggi 34° a Piacenza (fonte iLMeteo/3BMeteo) → la spesa fresca/bio di Pane Quotidiano (Via Calzolai, bio dal 1976) arriva a casa al fresco del mattino. Visual **tipografico neutro** = pubblicabile con sola firma (nessuna foto/consenso); versione col prodotto solo con ok titolare (aggancio #26). **Serve il LINK reale della lista d'attesa** (UTM `lunedi_bottega`) nel 1° commento su FB / in bio su IG. Gate onestà passato: 0 numeri finti, 0 testimonianze, CTA = lista d'attesa (non "ordina ora", il flusso non è ancora provato). | IG + FB + gruppi FB locali (manuale, poi n8n) — mattina | ⏸️ PARCHEGGIATA (Nicola 2026-07-09) — **gate: pubblicare SOLO dopo che il primo negozio è dentro MyCity** (onboarding botteghe food previsto 13/7). Motivo: mandare gente sul marketplace prima che ci sia una bottega evadibile brucia i primi iscritti caldi. La rubrica "Il Lunedì della Bottega" riparte dal primo lunedì utile a bottega online; l'angolo-meteo (34°) era legato al 6/7 → il #1 va riscritto con l'hook del giorno di ripartenza. Coerente con AR-006 (sforzo pesante dove c'è un negozio che può incassare). | Esce il post del giorno sull'unico negozio reale, con un hook vero e nasce un appuntamento fisso del lunedì: i clienti del centro scoprono che i freschi bio arrivano a casa. Serve il link reale della lista d'attesa. | Primi iscritti caldi via UTM a costo ≈0; se la rubrica attecchisce diventa un format-motore settimanale. |
| 47 | 2026-07-06 13:05 | @seo→@frontend-dev/@tech | Completa la scheda schema.org dei negozi e correggi l'indirizzo web che Google non vede | 🟡 | Patch in un branch del repo marketplace, test SEO come cancello (`tests/e2e/06-seo-and-a11y.spec.ts`), mai deploy senza firma. 4 interventi su `app/store/[id]/page.tsx`: ① bug URL canonico (`window.location.href` → undefined lato server, il crawler non lo vede) da costruire server-side · ② aggiungere `openingHoursSpecification` (serve orari reali PQ) · ③ `@type` da generico `Store` a `GroceryStore`/`HealthFoodStore` · ④ `Product`/`Offer` sulle schede prodotto + `BreadcrumbList` sulla categoria. Spec: `consegne/seo/2026-07-06-playbook-seo-locale-PQ.md` (§3) · dettaglio A22 in [[AZIONI-PRONTE]]. | branch → anteprima → merge | in attesa | Lo schema.org di ogni negozio (da PQ in poi) esce completo e leggibile dai motori: telefono, indirizzo, orari, tipo corretto, prodotti con prezzo. Migliora come MyCity appare su Google/Maps. Serve: orari reali PQ + firma al merge. | Base tecnica SEO solida e riusabile per OGNI negozio futuro — si scrive una volta e vale per tutta la rete. |
| 48 | 2026-07-06 13:26 | @designer→@vendite | Stampa e posa il kit fisico del negozio (QR in cassa, vetrofania in vetrina, sacchetti) — parte quando il primo negozio sa evadere | 🔴 | Playbook Capillarità: `consegne/vendite/2026-07-06-playbook-capillarita.md`. **Template neutri riusabili PRODOTTI (🟢, gratis):** `creativi/output/kit-capillarita/` (vetrofania neutra, cartoncino QR A5 cassa, adesivo tondo Ø10, sacchetti 18×22 e 26×32) + istanza intestata PQ `creativi/output/capillarita/vetrofania-pane-quotidiano.svg`. **Cosa firma questa riga:** ① preventivo tipografia locale (cartoncini + vetrofanie su adesivo statico + sacchetti kraft 1 colore terracotta) e ② posa fisica in Pane Quotidiano. **Gate — NON stampare prima:** PQ dev'essere di nuovo evadibile (ordine-prova #21 chiuso: accetta→consegna→payout-test) — coerente con anti-churn #26 e carrello #27; mandare gente in vetrina prima brucia la prima impressione. Prima della stampa serve l'**URL pieno pagina PQ** (o ok a leggerlo dal DB: seller `c0b240c0…`, pattern `/store/{id}/pane-quotidiano`) per il QR reale. Aggancio risparmio: bando «Vita in Centro» rimborsa ≤50% dei materiali (A1). | tipografia locale (preventivo→stampa) + posa a mano in negozio | ⏸ pronto — gated su PQ evadibile (#21) | Il primo negozio reale esce dal go-live con QR in cassa + vetrofania in vetrina + sacchetti brandizzati: ogni consegna e ogni vetrina diventano un cartellone che porta clienti su MyCity, a costo di sola stampa (dimezzabile col bando). ⚠️ impatto sistema: nessuno finché è 1 negozio; scala solo con ≥3 negozi evadibili. | Il kit di PQ è il «primo esemplare»: dal 9/7, per ogni nuovo negozio firmato bastano 2 minuti per istanziare il template e stampare — la capillarità diventa ripetibile. |
| 49 | 2026-07-06 13:26 | @vendite→@relazioni-istituzionali | Semina i punti QR in città (partner di quartiere, banchetti eventi, bacheche) — quando ci sono almeno 3 negozi che consegnano | 🔴 | Playbook Capillarità §"Punti di presenza" (`consegne/vendite/2026-07-06-playbook-capillarita.md`). Adesivo tondo neutro pronto in `creativi/output/kit-capillarita/qr-adesivo-tondo.svg`. Punti: bar/edicole/associazioni (consenso di ogni partner, via @relazioni-istituzionali con Vita in Centro), banchetti/negozi aperti ai **Venerdì Piacentini (17/7 ultima data)**, locandine su bacheche/Comune. **Gate di scala (AR-081):** parte con **≥3 negozi reali evadibili** — oggi 1 (PQ, non ancora evadibile): riempire la città di QR verso un marketplace con un solo negozio fermo brucia la prima impressione. Ogni QR punta al marketplace con UTM per misurare i punti che rendono. | posa a mano + DM/email ai partner (manuale) | ⏸ armato — gated su ≥3 negozi | La città si riempie di punti QR verso MyCity a costo ≈0 (vetrine e casse altrui come cartelloni): acquisizione capillare nel centro. Oggi non parte: manca la rete. | Con ≥3 negozi la mappa dei punti è già scritta e firmabile; si misura con UTM quali punti portano iscritti veri e si raddoppia su quelli. |
| 50 | 2026-07-06 13:52 | @account-negozi→@analista | Regala al fornaio il report che solo noi possiamo dargli: cosa vende di più, quando ordinano, chi torna | 🔴 | Playbook **Dati-come-servizio** pronto (stampo + query SOLA LETTURA riusabili per ogni negozio): `consegne/account-negozi/2026-07-06-playbook-dati-come-servizio.md`. **Onestà (cancello 🔬):** oggi il report è VUOTO di transato — 0 ordini consegnati su PQ → «cosa vende di più / orari di punta / clienti di ritorno» non è calcolabile ancora, e 0 clienti di ritorno per definizione (fonte MCP 6/7 11:11). Il dato reale che esiste è solo: 5 prodotti attivi + 1 composizione-carrello osservata (pesto+2 kefir bio, €10, buyer samir). **Gate:** il primo report REALE si genera e si consegna appena PQ chiude il primo ordine vero (aggancio #21); prima non c'è niente da mostrare. Poi diventa tocco di retention mensile (aggancio anti-churn #26) e, a ≥5 negozi, tier premium a pagamento (owner @growth-monetizzazione). | report generato dai dati + consegna al titolare (email/telefono, manuale) | ⏸ stampo pronto — gated su #21 (primo ordine PQ) | Il fornaio riceve ogni mese un mini-report con dati che dal banco non può vedere (venduto online, orari della domanda a domicilio, clienti che tornano): un motivo concreto per restare su MyCity. Oggi non parte: servono prima ordini veri. | Diventa un'arma di retention riusabile per ogni negozio e, a scala, un servizio dati da vendere (ricavo ricorrente che non tocca la commissione). |
| 51 | 2026-07-06 14:20 | @trust-safety→@frontend-dev/@backend-dev | Fai in modo che il badge «Verificato» appaia solo ai negozi che lo meritano davvero, non a tutti | 🟡 | **Difetto verificato nel codice del sito (6/7):** il badge "Negozio verificato da MyCity" (`components/ui/VerifiedBadge.tsx`) è reso **senza condizione** in 4 punti su 5 — `StoreListRow.tsx:44`, `StorePreviewCard.tsx:76`, `home/HeroStoreCard.tsx:137 e 235` — mentre solo `store-sections/HeroSection.tsx:167` lo condiziona (a `is_approved`). Risultato: nelle liste/card/home OGNI negozio (anche la demo Casa Linda) risulta "verificato" → badge decorativo, non guadagnato. **Fix (branch, reversibile):** un predicato unico `lib/store-trust.ts::isVerifiedStore(profile)` = approvato + Stripe `charges_enabled` + `payouts_enabled`, applicato a tutti e 5 i punti + un test-cancello anti-regressione. Spec pronta: `consegne/trust-safety/2026-07-06-gate-codice-badge-verificato.md`. Il livello di badge pubblico (Identità Verificata vs Verificato completo) lo fissa lo standard. | branch → anteprima → merge | ⏸️ PARCHEGGIATA — Nicola 7/7 «forse più avanti» (chat): non parte ora, spec non scade. **Non re-flaggare urgente nei giri intermedi**; ripescare all'onboarding dei negozi reali (6 botteghe food dal 13/7). Vedi DECISIONI 00:28 + [[badge-verificato-parcheggiato]] | Il badge di fiducia smette di comparire su chiunque: appare solo ai negozi che hanno superato la verifica e possono davvero incassare/pagare. Un negozio finto non può più risultare "verificato". | Il badge diventa un vero segnale di fiducia (leva di conversione onesta, stile Etsy/Stripe) e regge per ogni negozio futuro senza intervento manuale. |
| 52 | 2026-07-06 14:45 | @relazioni-istituzionali | Manda le due mail per far entrare MyCity nell'Hub Urbano del centro: una all'Ufficio Commercio del Comune, una all'Unione Commercianti | 🔴 | Testi pronti + destinatari reali verificati oggi in `consegne/relazioni-istituzionali/2026-07-06-playbook-bandi-mail-istituzioni.md`. **Mail #1** → Ufficio Commercio Comune di Piacenza (margherita.maini@comune.piacenza.it · 0523 492212; PEC SUAP suap@cert.comune.piacenza.it): propone MyCity come servizio digitale condiviso dell'Hub. **Mail #2** → Unione Commercianti PC, capofila del partenariato Hub (direzione@unionecommerciantipc.it · 0523 461852): apre i negozi soci in blocco. Leva comune: **Bando Commercio ER** (fondo perduto fino a €50.000, sportello **aperto fino al 21/7/2026 ore 13:00**, ri-verificato oggi — fonte Regione ER) → i negozi lo usano per pagarsi l'onboarding. **Serve da Nicola prima dell'invio:** firma reale (telefono/email/sito MyCity, oggi segnaposto) + conferma di citare **Pane Quotidiano** come esempio (unico negozio reale, NON Garetti/Casa Linda, AR-006). Mai promettere l'esito del bando. | email (Comune) + email (Unione Commercianti) — manuale | ⏸️ PARCHEGGIATA (Nicola 2026-07-09 11:45) — **gate: inviare SOLO dopo che la prima bottega è dentro MyCity** (onboarding botteghe food previsto 13/7). Motivo: presentarsi al tavolo Hub con un negozio reale attivo, non con la sola demo. ⚠️ Bando Commercio ER scade **21/7 ore 13:00**: se il primo negozio entra dopo il ~18/7 la leva-bando si accorcia — riproporre a Nicola l'invio appena la bottega è online. | MyCity entra nel tavolo pubblico-privato del centro storico come alleato dell'Hub, non concorrente: due porte (Comune amministrativo + Unione che apre i negozi), un solo racconto. L'aggancio al bando 21/7 dà urgenza vera. | Incontro di 20 min → pilota su 3-5 negozi soci del centro, ciascuno agganciato al Bando Commercio; poi @vendite fa l'onboarding done-for-you con la copertura di fiducia delle istituzioni. |
| 53 | 2026-07-06 20:22 | AD/devops-sre | **Sposta la lettura del Pannello sul binario giusto: due impostazioni da cambiare (Vercel e VPS)** | 🟡 | Oggi il cervello sul VPS scrive la memoria su un ramo (`memoria-ad`) e i giri cloud su un altro (`main`): il Pannello legge il primo e non vede il secondo — è il «pannello non legge da main». Questa riconciliazione ha già riunito la memoria su `main`; restano 2 mani tue: ① Vercel → Settings → Environment Variables: `OBSIDIAN_BRANCH=main` (tieni `OBSIDIAN_BRANCH_FALLBACK=memoria-ad` per la transizione) + Redeploy; ② VPS → `cervello/vps/.env`: `GIT_BRANCH=main`, poi `sudo bash cervello/vps/aggiorna-cervello.sh`. ③ Dopo le due mani dimmi «riconcilia il residuo»: riporto su `main` le scritture arrivate su `memoria-ad` nel frattempo e il vecchio ramo va in pensione (backup già fatto: `backup/memoria-ad-20260704-1335`). Riferimenti: `cervello/giro.md` (RAMO UNICO — Fase 2). | Vercel + VPS (manuale, lato Nicola) | ✅ **FATTO — confermato da Nicola 2026-07-07**: le due mani sono state fatte (① Vercel `OBSIDIAN_BRANCH=main` + Redeploy · ② VPS `GIT_BRANCH=main`, **verificato** in `cervello/vps/.env`). ③ Residuo: **niente da riportare** — `memoria-ad` è fermo al 30/6 (tip precedente allo switch), nessuna scrittura vi è arrivata dopo, quindi il VPS ora pubblica già su `main`. Ramo `memoria-ad` in pensione (backup `backup/memoria-ad-20260704-1335`). La canonicalizzazione dei fix-codice storici resta tracciata a parte in **R2/#35**. · **🗄️ CARD CHIUSA/RITIRATA 2026-07-07 01:44** — proposta Pannello «Marca come fatta la card sul binario di lettura» eseguita: le due mani (Vercel + VPS) le hai già fatte tu, non resta nulla da approvare; decisione registrata **non-riproporre** in [[DECISIONI]]. | Pannello e cervello smettono di lavorare su due binari diversi: tutto vive su `main`, la Cabina mostra sempre l'ultima memoria (oggi le scritture del VPS non si vedevano dai giri cloud e viceversa). | La memoria non si spacca mai più in due; il prossimo giro pubblica direttamente dove il Pannello legge e `memoria-ad` va in pensione con backup. |
| 54 | 2026-07-07 01:36 | AD/devops-sre | **Pubblica su GitHub la memoria del giro di stanotte, così il Pannello online la vede** | 🟡 | La memoria del giro cloud di stanotte (briefing `2026-07-07` + `STATO.md`, commit `5c50543a`) è **già sul `main` locale del VPS**: il merge nel ramo principale è **fatto**. Manca solo **pubblicarla su `origin/main`**, che è **indietro di 1599 commit** — perciò la copia hosted del Pannello (che legge `origin/main`) non vede ancora il giro. In questa sessione la **rete/git-push è chiusa dal sandbox** (`git fetch`/`push` negati), quindi l'ho preparata pronta. **Comando (flusso sanzionato, non-force con rebase — `cervello/giro.md` RAMO UNICO):** `cd /opt/mycity/ad-mycity && git pull --rebase origin main && git push origin main`. **Verifiche fatte:** landmine oggetto `marketplace` **NON tracciato** su `main` (ok); divergenza = solo avanti (0 dietro). Deploy del Pannello hosted = **automatico** via Vercel al push (nessun comando extra). **↺ Precisazione 7/7 10:57:** in realtà il Pannello hosted legge `main` **live via API GitHub** (`obsidian.ts`, `cache:no-store`) → il contenuto compare **senza redeploy**, basta il push; `vercel.json` ha comunque `deploymentEnabled.main=false` (un push NON fa partire un deploy — irrilevante per il contenuto, rilevante solo se cambia una env). **Se dopo il push il Pannello resta cieco → è il token: vedi #55.** | git push su `origin/main` (sessione VPS con rete aperta, oppure «ok 54») | ⏳ pronto — gated su rete/git-push | Il Pannello **online** mostra briefing e STATO aggiornati di stanotte: oggi la copia hosted legge `origin/main` fermo a 1599 commit fa e non vede il giro. Sulla copia VPS (legge il filesystem) è già visibile. | La Cabina online resta sempre allineata al VPS; il push diventa il passo standard di chiusura di ogni giro cloud e la memoria non resta più "ferma in locale". |
| 55 | 2026-07-07 10:57 | AD/devops-sre | **Dai al Pannello online un token GitHub tutto suo di sola lettura e rifai il Redeploy** | 🔴 | **Condizionata, a valle di #54.** Il Pannello hosted legge il vault da GitHub via API con `OBSIDIAN_TOKEN`→fallback `GITHUB_TOKEN` (`pannello/src/lib/obsidian.ts`, `cache:no-store`, ramo `main`). Oggi Nicola ha revocato il vecchio PAT (R1): se su Vercel quel token era ancora il valore revocato, il Pannello è **cieco in lettura** (401/403). **Check a occhio (30 s):** apri `<url-pannello>/api/diagnosi` → voce **«Vault GitHub (Pannello)»**: se **ROSSO «accesso KO»** → esegui questa card; se **verde** ma manca il giro di oggi → è solo #54 (push), questa card NON serve. **Passi (least-privilege):** ① GitHub → fine-grained PAT read-only, repo `ad-mycity`+`mycity`, *Contents: Read-only* (nome `vercel-pannello-readonly`); ② Vercel → Settings → Env: `GITHUB_TOKEN`=nuovo PAT (opz. anche `OBSIDIAN_TOKEN`), lascia `OBSIDIAN_BRANCH=main`; ③ Vercel → Deployments → **Redeploy a mano** (`vercel.json` ha `deploymentEnabled.main=false` → il push non lo fa da solo); ④ ricontrolla `/api/diagnosi` = verde. Dettaglio: `consegne/devops/2026-07-07-verifica-pannello-hosted-token.md`. Separato dal `GIT_PUSH_TOKEN` del VPS (che scrive) — chiude AR-004 senza dare a Vercel poteri di scrittura. | Vercel (manuale, lato Nicola) | ✅ **NON SERVE — 2026-07-09: Nicola conferma «Vault GitHub» VERDE in `/api/diagnosi`.** Il token su Vercel legge il vault, la condizione (ROSSO) non si è avverata → card chiusa senza fare nulla. Il PAT read-only dedicato resta un nice-to-have di igiene (least-privilege), non un'urgenza. | Il Pannello online torna a leggere la memoria: la spia «Vault GitHub» diventa verde e briefing/STATO ricompaiono. Se il check è verde, non serve fare nulla qui. | Cabina hosted allineata al VPS in tempo reale (lettura live, senza altri redeploy); il buco del token revocato resta chiuso con un token di sola lettura. |
| 56 | 2026-07-07 12:05 | account-negozi | **Arma la veglia anti-churn sui negozi prima dell'onda del 13/7** | 🟡 | Playbook anti-churn 7/7: **oggi 0 negozi in calo** (1 solo negozio reale, senza storico; PQ non-churn, già chiuso da te il 6/7 con #25/#29). Il churn nasce dal **13/7** con le 6 botteghe food → armare l'health-score PRIMA le protegge dal giorno 1. Soglie (sola lettura): 🟡 0 ordini a 5g dal go-live (no-value) · 🟡 0 da 14g (silenzio) · 🔴 0 da 30g o «tolgo il negozio». Nessun contatto automatico: alza solo una card «negozio a rischio» sul Pannello. Non tocca #25/#29 né #40 (è la lente salute/retention, oggi assente). Dettaglio + template check-in neutro: `consegne/account-negozi/2026-07-07-playbook-anti-churn.md` · blocco A25 in [[AZIONI-PRONTE]]. | giro.sh (sola lettura) + Pannello | ⏳ in attesa firma | La macchina veglia da sola il tempo-al-primo-ordine di ogni bottega del 13/7 e ti segnala chi rischia di mollare in tempo per la spinta, invece che a molla persa. | Le 6 botteghe non ammutoliscono nel silenzio: chi rischia il "no value" riceve ordine di prova + post prima di andarsene. Riusabile per ogni negozio futuro. |
| 57 | 2026-07-07 12:12 | content-social | **Pubblica il post del giorno "Oggi è il tuo turno" su Facebook e Instagram** | 🔴 | Post-manifesto pronto (versioni Gruppi FB + IG/FB Pagina + idea visual): `consegne/content/2026-07-07-post-del-giorno-il-turno.md`. È **neutro** (parla della causa, non di un negozio → nessun consenso bottega, cancello allocazione ok). Aggancio piattaforma "Il Turno" + cavalca il momento del gigante online (anti-Prime-Day). **Prima di uscire servono 4 cose da te:** ① il **link reale della lista d'attesa** (oggi manca ovunque — è il tappo n.1; va nel 1° commento su FB e in bio su IG, con UTM); ② conferma **fonte del −22%** (o si toglie la cifra); ③ ok sull'aggancio Prime Day (se non cade questi giorni si pubblica senza la 1ª riga); ④ la **foto** della saracinesca all'alba (o via libera a immagine AI dichiarata). Zero numeri/testimonianze inventati (ONESTA-RULES superato). | IG + Facebook (manuale, poi n8n) | ⏳ pronto — aspetta link lista + firma | Esce il primo contenuto sotto la piattaforma "Il Turno": manifesto della causa che chiede le prime 50 famiglie del centro, senza promettere numeri che non abbiamo. Riempie il vuoto social (oggi 0 follower). | Primo mattone di notorietà + prime iscrizioni tracciabili via UTM; poi il manifesto diventa la testa della rubrica settimanale "Il Turno". |
| 58 | 2026-07-08 10:31 | account-negozi/AD | **Insegna alla macchina che Pane Quotidiano sta aspettando, così smette di segnalarlo come negozio a rischio** | 🟡 | **Falso positivo alla radice.** Il sensore «negozio fermo» (`cervello/sentinella-dati.mjs:189-192`) conta ogni negozio approvato da >14g con 0 ordini in 14g e stamattina (10:28) ha di nuovo svegliato la macchina su PQ chiedendo un tocco anti-churn — che hai **già escluso il 6/7** («li conosco e aspettano», #25/#29 chiuse). Il sensore **non conosce l'eccezione «attesa concordata»** → ricasca a ogni giro (~2h) e, quando colleghiamo le «mani», rischia un tocco automatico su una relazione che gestisci a mano. **Fix minimo e reversibile:** allowlist alimentata dal `registro-fatti.json` (nessun id nel codice) — un negozio in *attesa concordata* non alza l'allarme churn finché non ha il 1° incasso, poi rientra normale. Estende lo stesso sensore di #24 (esclude le demo) ai negozi **reali in attesa**. Auto-modifica → **non la applico da sola**. Dettaglio + le 3 prove: `consegne/account-negozi/2026-07-08-negozio-fermo-pane-quotidiano-falso-positivo.md`. | commit branch (no deploy) | ⏳ in attesa firma | La sentinella smette di suonare a vuoto su PQ e di consumare cervello ogni 2h; nessun rischio di tocco automatico su una relazione che gestisci tu. Scatterà solo su negozi reali **davvero** fermi (dal 13/7, le botteghe che ammutoliscono). | La macchina distingue «silenzio = abbandono» da «silenzio = attesa concordata»: l'eccezione vale per ogni futuro negozio in pre-lancio, non solo PQ. |
| 59 | 2026-07-08 11:20 | content-social | **Pubblica il post del giorno "Il tuo turno, senza la trafila" su Facebook e Instagram** | 🔴 | Post del giorno 8/7 pronto (versioni Gruppi FB + IG/FB Pagina + idea visual): `consegne/content/2026-07-08-post-del-giorno-il-turno-comodo.md`. Angolo **utilità/ZTL (P4)** — diverso dal manifesto-causa di ieri (#57, P1) → non duplica: apre col dolore concreto della spesa del sabato (ZTL, parcheggio, 5 negozi) e lo risolve con "la tua spesa è il tuo turno". **Neutro** (parla della comodità, non di un negozio → nessun consenso bottega, cancello allocazione AR-006 ok; Pane Quotidiano resta il faro ma non è intestato). Zero numeri/testimonianze inventati: la multa ZTL è lasciata qualitativa (ONESTA-RULES superato). ⛔ L'aggancio anti-Prime-Day di ieri è **scaduto** — Prime Day 2026 era 23-26 giugno. **Prima di uscire servono 2 cose da te:** ① il **link reale della lista d'attesa** (manca ovunque — tappo n.1; va nel 1° commento su FB, in bio su IG, con UTM); ② la **foto** (borsa spesa sulla soglia di un portone del centro, o via libera a immagine AI dichiarata). | IG + Facebook (manuale, poi n8n) | ⏳ pronto — aspetta link lista + firma | Esce il 2° contenuto sotto "Il Turno", stavolta sul lato pratico (comodità senza la trafila): parla a chi vive il centro e la ZTL, senza promettere numeri che non abbiamo. | Secondo mattone di notorietà + iscrizioni tracciabili via UTM; con #57 nasce la coppia causa+utilità che regge la rubrica settimanale "Il Turno". |
| 60 | 2026-07-09 11:21 | content-social | **Pubblica il post del giorno "Il tuo ordine ha un nome" su Facebook e Instagram** | 🔴 | Post del giorno 9/7 pronto (versioni Gruppi FB + IG/FB Pagina + idea visual): `consegne/content/2026-07-09-post-del-giorno-volti-non-algoritmi.md` · anteprima [[AZIONI-PRONTE]] **A26**. Angolo **IL MOTORE "Volti, non algoritmi"** (swipe #3: il volto prima del prodotto) — pilastro diverso dai due già usati (7/7 causa P1 #57 · 8/7 comodità P4 #59) → **non duplica**: dice il *chi* c'è dietro l'ordine (una persona con un nome, non un algoritmo/magazzino anonimo). **Neutro** (figure archetipiche fornaio/salumiere, nessun negozio intestato → nessun consenso bottega, cancello allocazione AR-006 ok; Pane Quotidiano resta il faro ma non è intestato). Ghigliottina "poteva farlo Amazon?" → no (Amazon *è* l'algoritmo). Zero numeri/testimonianze inventati (ONESTA-RULES superato). **Prima di uscire servono 2 cose da te:** ① il **link reale della lista d'attesa** (manca ovunque — tappo n.1; va nel 1° commento su FB, in bio su IG, con UTM); ② la **foto** delle mani/gesto di un bottegaio che incarta (o via libera a immagine AI dichiarata); col volto reale → serve anche ok del titolare (ponte verso l'angolo "ritratto"). | IG + Facebook (manuale, poi n8n) | ⏳ pronto — aspetta link lista + firma | Esce il 3° contenuto sotto "Il Turno", stavolta sul *chi* (volti, non algoritmi): differenzia MyCity dal delivery anonimo senza promettere numeri che non abbiamo. | Terzo mattone di notorietà + iscrizioni tracciabili via UTM; con #57 e #59 la rubrica "Il Turno" ha tre pilastri diversi in fila (causa · comodità · volti) e regge come appuntamento settimanale. |

> ℹ️ **Righe #41–#52 importate il 2026-07-06 20:22 dal giro cloud** (riconciliazione del ramo unico `main`):
> nella coda del giro cloud erano numerate diversamente — i rimandi «#21/#26/#36…» DENTRO quelle righe seguono la vecchia numerazione.
> Mappa: #21→#41 (ordine-prova PQ) · #24→#42 (win-back) · #25→#43 (scout 3 botteghe) · #28→#44 (punti) · #29→#45 (gift card) · #29→#46 (post lunedì) · #31→#47 (schema.org) · #33→#48 (kit fisico) · #34→#49 (semina QR) · #35→#50 (report dati) · #36→#51 (gate badge nel codice) · #39→#52 (mail istituzioni).
> Non importate perché superate da decisioni successive di Nicola o già in coda: chiamate alle 6 botteghe (16:35: ci va di persona il 13/7), anti-churn PQ (15:52: chiusa), sentinella annullati (≡#40), carrello samir (≡#26), SEO vetrina (≡blocchi 16:10), scheda Google MyCity (16:08: parcheggiata), comunicazione badge (≡blocco standard).

| 61 | 2026-07-10 18:13 | @tech | Merge PR #252 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/252 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 62 | 2026-07-10 18:27 | @tech | Merge PR #255 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/255 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 63 | 2026-07-10 18:42 | @tech | Merge PR #257 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/257 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 64 | 2026-07-11 00:08 | @tech | Merge PR #212 mycity → main | 🔴 | https://github.com/NicolaeRotaru/mycity/pull/212 | github | in attesa | Il codice in anteprima va online su Render (sito) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 65 | 2026-07-11 00:09 | @tech | Merge PR #212 mycity → main | 🔴 | https://github.com/NicolaeRotaru/mycity/pull/212 | github | in attesa | Il codice in anteprima va online su Render (sito) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 66 | 2026-07-11 15:36 | @tech | Merge PR #269 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/269 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 67 | 2026-07-11 15:37 | @tech | Merge PR #270 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/270 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 68 | 2026-07-11 15:54 | @tech | Merge PR #272 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/272 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 69 | 2026-07-11 16:00 | @tech | Merge PR #274 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/274 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 70 | 2026-07-11 16:05 | @tech | Merge PR #275 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/275 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 71 | 2026-07-11 16:09 | @tech | Merge PR #276 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/276 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 72 | 2026-07-11 22:46 | @tech | Merge PR #283 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/283 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 73 | 2026-07-12 00:02 | @tech | Merge PR #284 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/284 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 74 | 2026-07-12 00:12 | @tech | Merge PR #285 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/285 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 75 | 2026-07-12 00:16 | @tech | Merge PR #286 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/286 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 76 | 2026-07-12 00:37 | @tech | Merge PR #287 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/287 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 77 | 2026-07-12 00:53 | @tech | Merge PR #288 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/288 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 78 | 2026-07-12 01:04 | @tech | Merge PR #289 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/289 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 79 | 2026-07-12 01:06 | @tech | Merge PR #290 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/290 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 80 | 2026-07-12 01:29 | @tech | Merge PR #291 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/291 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 81 | 2026-07-12 02:35 | @tech | Merge PR #296 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/296 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 82 | 2026-07-12 02:41 | @tech | Merge PR #297 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/297 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 83 | 2026-07-12 19:35 | @tech | Merge PR #305 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/305 | github | ✅ FATTO 2026-07-12 17:44 | Aprire una chat non la sposterà più in cima nella lista Conversazioni — ordine stabile (pinnate + data creazione). | Fix già su main via PR #303 mergiata 17:44 (commit `67c6b804`). Chiudere #305/#306/#304 senza merge. |
| 84 | 2026-07-12 17:39 | @tech | Merge PR #302 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/302 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 85 | 2026-07-12 19:47 | @tech | Merge PR #308 ad-mycity → main | ❌ | https://github.com/NicolaeRotaru/ad-mycity/pull/308 | github | CHIUDI SENZA MERGE · sostituita da #309 2026-07-12 19:53 | Conflitti: git-pr aveva incluso routing/sentinella nel branch. | Usa #309 (solo 4 file pannello). |
| 86 | 2026-07-12 19:53 | @tech | Merge PR #309 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/309 | github | ✅ FATTO 2026-07-13 · mergiata su main | Caselle dark mode leggibili — Quaderni/Numeri/Grafo con token tema. | Deploy Vercel automatico; ricarica Pannello per verificare. #308 chiudere senza merge. |
| 87 | 2026-07-13 11:16 | @tech | Merge PR #312 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/312 | github | in attesa | Le prossime PR del Pannello non si bloccheranno più per routing/sentinella — un solo file script. | Chiudi #310 e #311 senza merge (sporche); mergia #312. |
| — | 2026-07-13 11:16 | @tech | CHIUDI #310 e #311 senza merge | ❌ | #310 #311 | github | CHIUDI · sostituite da #312 | Stesso errore di sempre: file worker nel branch. #312 verificata: solo git-pr.mjs, zero conflitti in simulazione. | Mergia solo #312. |
| 88 | 2026-07-13 11:24 | @tech | Merge PR #313 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/313 | github | in attesa | Le caselle «Confronto coi migliori» in Miglioramento mostrano @content-social e @AD con obiettivo/divario — non più vuote né «undefined». | Dopo Approva: merge + deploy Vercel; ricarica Auto-coscienza per verificare.
| 89 | 2026-07-13 11:29 | @tech | Merge PR #314 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/314 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 90 | 2026-07-13 11:32 | @tech | Merge PR #315 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/315 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 91 | 2026-07-13 11:37 | @tech | Merge PR #315 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/315 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 92 | 2026-07-13 12:14 | @tech | Merge PR #316 ad-mycity → main | ❌ | https://github.com/NicolaeRotaru/ad-mycity/pull/316 | github | CHIUDI SENZA MERGE · sync già su main via #317 2026-07-13 12:39 | Sync chat + badge già live su main — #316 duplicata. | Chiudi #316 e #299 senza merge. |
| 93 | 2026-07-13 12:24 | @tech | Merge PR #317 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/317 | github | ✅ FATTO 2026-07-13 · mergiata su main | Volano ponte applicazione lezioni + sync chat inclusa. | Sync PC↔telefono già attiva; chiudi #316. |
| 94 | 2026-07-13 12:27 | @tech | Merge PR #318 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/318 | github | in attesa | X su Prompt pronto, chat aperta evidenziata, Annulla invio durante «sto pensando…». | Dopo Approva: deploy Vercel; tre fix UX chat online. Commit `03751823`, conflitti risolti 12:39. |
| 95 | 2026-07-13 12:59 | @tech | Merge PR #322 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/322 | github | in attesa | Tab Piani mostra ogni piano dall'inizio (titolo/obiettivo), non più tronca a metà frase. | Dopo Approva: deploy Vercel; ricarica tab Piani — «💶 PIANO FINANZIARIO» all'inizio, non «…he il CM sia positivo». |
| 96 | 2026-07-13 14:33 | @tech | Merge PR #323 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/323 | github | in attesa | Sotto ogni avviso «memoria incoerente» compare «Parla con questa casella» — chat contestuale come le altre card. | Dopo Approva: deploy Vercel; Avvisi → clic su avviso giallo → «Parla con questa casella» sotto la scheda. |
| 97 | 2026-07-13 16:09 | @tech | Merge PR #324 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/324 | github | in attesa | Su telefono Invio va a capo nella casella chat; per inviare usi il bottone Invia (PC invariato: Invio manda). | Da telefono: Invio = nuova riga, Invia = manda; ricarica Pannello post-deploy e riprova.
| 98 | 2026-07-13 16:16 | @tech | Merge PR #325 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/325 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
<!-- I senior aggiungono righe qui sotto. Metti SEMPRE data E ora (AAAA-MM-GG HH:MM).
     Le ultime 2 colonne (Cosa cambia · Se va bene) sono OPZIONALI ma consigliate: sono la spiegazione che Nicola legge nella card. Esempio:
| 1 | 2026-06-25 14:30 | crm | Email benvenuto ai primi 10 iscritti | 🟡 | consegne/crm/benvenuto.md | email (Resend) | in attesa | I primi 10 iscritti ricevono il benvenuto e capiscono come funziona MyCity. | Più clienti completano il primo ordine invece di sparire dopo l'iscrizione. |
-->

### 2026-06-24 · @pr-stampa · 🔴 Pacchetto earned media di lancio (kit pronto)
**Stato 30/6 09:09:** ❌ **rifiutato** da Nicola via Pannello — non riproporre finché non chiede esplicitamente.
Fonte: `consegne/pr/KIT-STAMPA-LANCIO.md`. Tutto scritto e pronto; serve la firma per gli invii reali.
1. 🔴 **Invio email ESCLUSIVA a Libertà** (+ proposta servizio Telelibertà). Verificare prima il nome del direttore attuale (Rocco vs Visconti).
2. 🔴 **Invio email alle 3 testate online** (PiacenzaSera, Piacenza24, IlPiacenza) — solo DOPO l'uscita su Libertà o dopo 48h di silenzio.
3. 🔴 **Autorizzazione citazione titolare Garetti** (ok scritto del negoziante prima di pubblicarla).
4. 🔴 **Richiesta citazione/foto assessore Fornasari** (via @relazioni-istituzionali).
5. Completare campi [INSERIRE]: numero/email/sito stampa, fonte ufficiale del -22%, data di lancio.

---
## 🔴 Pubblicazione contenuti social — Settimane 1-4 (content-social)
- **Data proposta:** 2026-06-24
- **Cosa:** pubblicare i 16 post + bio IG/FB del calendario `consegne/content/CALENDARIO-4-SETTIMANE.md` sui canali reali (gruppi FB locali, IG feed/storie).
- **Perché 🔴:** tocca canali pubblici reali in città piccola; cita nome/foto del negoziante.
- **Pre-condizioni prima del via:** (1) ok firmato di Garetti per nome/foto; (2) segnaposto [Garetti/MyCity/Cliente] riempiti coi dati veri; (3) dialetto validato da madrelingua; (4) URL lista d'attesa reale; (5) ⏳ grafiche DA GENERARE — la Content Factory (`render.mjs`) esiste, ma su disco c'è SOLO `creativi/output/social/storia-bottega-garetti-saracinesca.png`: i 4 PNG S1 + il reel .webm vanno ancora prodotti (non spuntare come pronti finché non sono su disco); (6) peer review @finanza sulla promo "primi 50 gratis".
- **Mani:** canali social → da collegare via @builder-automazioni (o pubblicazione manuale).
- **Stato:** IN ATTESA DI FIRMA NICOLA.
- **Nota builder (2026-06-24):** le grafiche di base ci sono già a €0. Per i contenuti AI fotorealistici / Canva pro / video MP4 servono le chiavi (`GEMINI_API_KEY` / `CANVA_TOKEN` / `RUNWAY_API_KEY|KLING_API_KEY`) — collegabili da @builder-automazioni al via di Nicola.

## 2026-06-24 · @crm-lifecycle · Flussi lifecycle pronti (DRY-RUN)
Fonte: consegne/crm/FLUSSI-LIFECYCLE.md — niente è stato inviato.
- [ ] 🔴 Approvare incentivo "prima consegna gratis" primi 50 iscritti (cap ~200€).
- [ ] 🔴 Approvare referral give-get 5€+5€ (budget mensile suggerito 250€) + anti-frode.
- [ ] 🔴 Approvare "Regala una spesa" (gift, prepagato = cash-positive) + scadenza buono 12 mesi.
- [ ] 🔴 Approvare consegna offerta su win-back #2 e carrello #2 (1 volta/cliente, ~4€).
- [ ] 🟡 Via libera all'INVIO dei 3 Welcome + transazionali ai primi clienti reali (dopo validazione legale-privacy footer/consenso).
- [ ] 🛠️ @builder-automazioni: collegare RESEND_API_KEY (+ dominio/SPF/DKIM), VAPID push, Telegram, webhook stato ordine.
- [ ] ⚖️ @legale-privacy: validare footer disiscrizione + testi consenso (marketing vs transazionale) prima del primo invio.
- [ ] 🔴 Pubblicare il MANIFESTO-CAUSA "Ogni spesa è un voto" (post gruppi FB + feed IG @mycity.piacenza). Testo pronto in `consegne/content/C1-manifesto-causa.md` (⏳ PNG `creativi/output/social/C1-manifesto-causa.png` DA GENERARE — non ancora su disco). PRECONDIZIONI: (a) confermare il dato −22%/12 anni + fonte citabile [vault riporta anche −20,4% al 2035]; (b) link reale lista d'attesa nel 1° commento (da @builder-automazioni); (c) [opz.] validare la variante dialetto con madrelingua.

## 🔴 Pubblicare il POV/ZTL "Sabato e ti tocca prendere la coppa" (C4) — @cro/@content-social
- **Data proposta:** 2026-06-25
- **Cosa:** pubblicare il contenuto POV relatable su canali reali: gruppi FB locali ("Sei di Piacenza se…", "Piacenza Mia") + IG feed @mycity.piacenza + rilancio in Storia. Testo+visual pronti in `consegne/content/C4-pov-ztl.md` (PNG: `creativi/output/social/C4-pov-ztl.png`).
- **Perché 🔴:** tocca canali pubblici reali in città piccola; cita ZTL/multa/vigile (tono bonario, da validare @legale-privacy).
- **Pre-condizioni prima del via:** (1) conferma cifra multa ZTL Piacenza — uso **83€** come ordine di grandezza, correggibile in 1 riga del render o rimovibile; (2) link reale in bio (lista d'attesa o /store) con UTM `pov_ztl` da @builder-automazioni; (3) caption versione "uno di noi" senza hashtag nei gruppi FB, link nel 1° commento; (4) [opz.] validazione tono @legale-privacy (non diffamatorio verso Comune/PL).
- **Mani:** canali social → @builder-automazioni o pubblicazione manuale.
- **Quando consigliato:** venerdì sera 18-20 (o sabato mattina 8:30-9:30 per max identificazione).
- **Stato:** IN ATTESA DI FIRMA NICOLA.

## 2026-06-26 · @content-social · Pubblicare il ritratto "Il nostro bottegaio" (Garetti) — 🔴
- **Cosa:** pubblicare post FB + caption IG (carosello) + reel su @mycity.piacenza e gruppi locali Piacenza.
- **Contenuto pronto:** `consegne/content/W3-ritratto-bottega.md` · grafica `creativi/output/social/W3-ritratto-bottega.png`.
- **Canale:** Facebook/Instagram MyCity (+ gruppi quartiere). Le "mani" social passano da n8n/integrazioni → @builder-automazioni se non collegate.
- **🔴 BLOCCO finché non arrivano:** ① foto vera del volto di Garetti · ② frase reale sua · ③ consenso scritto uso nome/volto/frase (in città piccola la reputazione conta).
- **Effetto atteso KPI:** iscritti lista d'attesa (acquisizione calda dai clienti di Garetti, portata a costo ≈0 via ripubblicazione del negozio).
- **Via libera:** "ok" di Nicola DOPO foto+frase+consenso.

## 2026-06-26 · @ai-video · Reel W4 "Dietro la saracinesca"
- 🟡 **Consenso Garetti** (volto+voce+nome) prima di girare/pubblicare il BTS. Chi va a chiederlo?
- 🔴 **Pubblicare il reel** su IG/FB/TikTok (canali reali) → firma Nicola. Contenuto pronto in `consegne/content/W4-bts-bottega.md`, cover in `creativi/output/social/W4-bts-cover.png`.
- 📋 Pre-requisito: riempire segnaposto in negozio (anni attività, prodotto-orgoglio DOP, parentela) + scegliere traccia audio royalty-free con licenza social.

## 2026-06-26 23:40 · @content-social · SISTEMA DI LANCIO Garetti (L6) → primi 50 iscritti
Piano completo (5 canali + funnel + L7): `consegne/content/PIANO-LANCIO-garetti-L6.md`. È il sistema dentro cui vive il post L3 già fatto. Cosa tocca il mondo reale (🔴/🟡):
- [ ] 🔴 **PRE-CONDIZIONE n°1 — Landing lista d'attesa reale** (1 campo + "primi 50 gratis" + UTM per canale). Senza, OGNI canale converte 0. → @builder-automazioni + @frontend-dev + @cro. *Questo sblocca tutto il resto.*
- [ ] 🔴 **Canale 2 (il più ricco) — SÌ di Garetti su 3 cose:** (a) ricondividere il post L3 "La saracinesca" ai suoi clienti, (b) QR + vetrofania in cassa, (c) [opz.] comparire su Libertà. Senza il suo consenso il funnel scende sotto i 50 nel caso peggiore. → richiesta da portare via @vendite/@onboarding-negozi.
- [ ] 🔴 **Canale 1 — pubblicare il Contenuto-faro nei gruppi FB locali** (già in coda; CORREZIONE d'onestà obbligatoria: togliere il −22% non confermato + ZTL solo se cifra blindata). Presidio commenti primi 90'.
- [ ] 🔴 **Canale 5 — angolo stampa Libertà** ("le botteghe storiche sfidano il delivery, parte da Piazza Duomo") → @pr-stampa, su base §4D del piano. Serve data lancio + consenso Garetti.
- [ ] 🟡 **Referral civico** (riga §4C in thank-you page, no budget, gloria non sconto) → @crm-lifecycle. Tenere distinto dal give-get 5€+5€.
- [ ] 🔴 **Vetrofania + cartoncino-cassa + QR per Garetti** → @designer (brief §6), check @qa-designer.
- [ ] 🔴 **Conferma/blinda dato −22% + cifra ZTL + cap incentivo "primi 50 gratis"** → @analista/@finanza prima di pubblicare.
- **Stato:** IN ATTESA DI FIRMA NICOLA. **Mani social** → @builder-automazioni o pubblicazione manuale.

## 2026-06-26 23:40 · @content-social · 🔴🚀 PROPOSTA L7 (mossa 10x non richiesta) — Evento "IL PRIMO TURNO" in Piazza Duomo
- **Cosa:** evento civico di lancio nel sabato di apertura — Garetti alza la saracinesca in Piazza Duomo + partono le prime 50 consegne in cargo-bike. Trasforma "iscriviti alla lista" in "sii tra le 50 consegne del Primo Turno". Dettagli: §8 del piano `PIANO-LANCIO-garetti-L6.md`.
- **Perché 10x:** dà a stampa+gruppi FB un EVENTO (data+luogo iconico+immagine forte) → earned media; trasforma l'iscrizione in un rito civico; arruola Vita in Centro/Comune/altre botteghe a costo ≈0; nativamente "Il Turno", incopiabile da Amazon; i 50 iscritti diventano i primi 50 CLIENTI reali (fine dei "0 ordini").
- **Serve:** una data · ok Garetti a fare il "primo turno" in piazza · mini-budget €0-300 · catena @relazioni-istituzionali + @pr-stampa + @designer + @operations.
- **Colore:** 🔴 PROPOSTA — non eseguita. Aspetta valutazione/firma di Nicola.
- **Stato:** PROPOSTA SUL TAVOLO.

## 2026-07-03 11:34 · @content-social · 📣 Post del giorno "Il turno più lungo di Piacenza" (Pane Quotidiano) — 🔴
- **Cosa:** pubblicare il post storia-bottega sul faro reale (partner firmato) su @mycity.piacenza (feed+storia) + gruppi FB locali. Gancio verificabile "bio dal 1976" agganciato alla piattaforma "Il Turno".
- **Contenuto pronto + anteprima estesa:** `consegne/content/2026-07-03-POST-turno-piu-lungo-PQ.md` · blocco [[AZIONI-PRONTE]] **A8**.
- **Cosa cambia:** primo ritratto pubblico di un negozio reale MyCity; nome/immagine di Pane Quotidiano nella campagna (città piccola).
- **Se va bene:** il negozio ripubblica ai suoi clienti → primi iscritti caldi; parte il ritmo settimanale del motore "Volti".
- **🔴 Due strade:** (a) versione col **nome+foto** → serve **ok del titolare** (chiedibile nella chiamata A6/#21); (b) versione **neutra tipografica** → pubblicabile subito con sola firma Nicola.
- **Pre-condizione tecnica:** link reale in bio con UTM `turno_pq` (@builder-automazioni). **Mani social** → @builder-automazioni o pubblicazione manuale.
- **Onestà:** gate ONESTA-RULES passato (0 numeri finti, 0 testimonianze, "1976" = fonte pubblica Vita in Centro/Pagine Gialle).
- **Stato:** IN ATTESA DI FIRMA NICOLA.

## 2026-07-06 15:10 · @trust-safety · 🛡️ Dai il bollino «Negozio Verificato» al primo negozio che se lo merita (#38)
- **Cosa:** far nascere il bollino «Negozio Verificato MyCity» — lo standard di fiducia della città (5 criteri verificabili nei dati) — e assegnarlo al primo negozio che li rispetta tutti. Standard, criteri, idoneità e bozze pronti in `consegne/trust-safety/2026-07-06-badge-negozio-verificato.md` · anteprima estesa [[AZIONI-PRONTE]] **A18**.
- **I 5 criteri (tutti verificabili):** ① identità reale (P.IVA/sede + KYC Stripe) · ② bottega attiva e approvata (≥5 prodotti veri) · ③ pagamenti sicuri (payout Stripe ON) · ④ consegna provata (≥1 consegnato, 0 dispute) · ⑤ regole rispettate (contratto+GDPR, 0 segnalazioni). Il badge si **perde** se un pilastro cade → così vale qualcosa.
- **Idoneità reale oggi (2026-07-06):** **0 verificati, 1 candidato = Pane Quotidiano** (3/5 pilastri; mancano payout ON + 1ª consegna). Casa Linda = demo (esclusa), Garetti = prospect non nel DB (non idoneo). PQ diventa il **1° Negozio Verificato di Piacenza** appena #16 è consegnato + payout acceso.
- **Cosa cambia:** nasce lo standard di fiducia cittadino e il primo negozio reale che consegna si guadagna un bollino visibile a video → segnale di garanzia per i clienti, fossato contro Glovo/Amazon.
- **Se va bene:** diventa il rito di qualità dell'onboarding dei negozi dal 13/7 (entri → payout+catalogo → 1ª consegna → bollino).
- **🔴 Pre-condizioni (onestà):** (a) annuncio pubblico **solo con ≥1 negozio davvero verificato** — mai "lo standard della città" con 0 verificati · (b) mostrare il bollino su PQ = ok Nicola + validazione claim @legale-privacy · (c) 🟡 corsia tecnica: flag `verified` sul profilo (backend-dev) + bollino a video (frontend-dev/CONFIG), in branch, da collegare al via.
- **Stato:** STANDARD DEFINITO (🟢). Assegnazione + annuncio **IN ATTESA DI FIRMA NICOLA** (condizionati alla prima consegna reale).

## 2026-07-06 16:10 · @seo→@tech · 🔎 Riempi la vetrina di Pane Quotidiano con le parole cercate su Google — APPROVATA
- **Cosa:** scrivere `store_description` (bio dal 1976, pane/pesto/kefir bio, bottega del centro, consegna a domicilio Piacenza) + `store_address` (Via Calzolai 25, Piacenza) sul profilo PQ, così title/meta/OG/schema del sito intercettano *prodotti bio a Piacenza · spesa bio online · pane bio a domicilio · botteghe del centro con consegna*. Comando + JSON pronti in `consegne/seo/2026-07-06-riempimento-vetrine-SEO.md` §1.
- **Approvazione:** Nicola 2026-07-06 «lo approvo e devi farlo con tutti i negozi» (Pannello).
- **Colore:** 🟡 — CONFIG marketplace (`marketplace.mjs aggiorna profiles`), **mai DB clienti, mai deploy**. Backup automatico per riga → **reversibile** (rollback dal backup).
- **Canale/mani:** `node cervello/marketplace.mjs aggiorna` — esegue via Pannello/giro autorizzato (il comando è gated nella chat: prima `leggi` conferma id `c0b240c0…` + valori attuali, poi `aggiorna`).
- **Cosa cambia:** la scheda di Pane Quotidiano su Google smette di uscire con testo generico e inizia a intercettare 5 ricerche bio/consegna del centro — traffico organico gratis verso l'unico negozio reale che può incassare.
- **Se va bene:** stessa cosa in automatico su ogni negozio nuovo (regola-standing sotto) → le 6 botteghe dal 13/7 nascono già ottimizzate.
- **Onestà:** solo fatti verificati (bio dal 1976, indirizzo reale, prodotti a catalogo). "Senza glutine/dietetico" **NON inserito** — linea da confermare col titolare.
- **Stato:** IN ATTESA DI ESECUZIONE (config autorizzato).

## 2026-07-06 16:10 · @onboarding-negozi → @seo · 🟢 Regola-standing: SEO-fill nell'onboarding di OGNI negozio
- **Cosa:** rendere il riempimento vetrina (`store_description` con le parole cercate + `store_address` pieno) un **passo obbligatorio del go-live** di ogni negozio nuovo. Handoff: @onboarding-negozi raccoglie i campi reali → @seo compila il template (`consegne/seo/2026-07-06-riempimento-vetrine-SEO.md` §2) → proposta 🟡 col comando pronto → firma → `aggiorna`.
- **Colore:** 🟢 regola di processo (l'esecuzione per-negozio resta 🟡 firma).
- **Cosa cambia:** "farlo con tutti i negozi" diventa automatico, non un secondo giro manuale; ogni bottega dal 13/7 nasce già ottimizzata per Google.
- **Casa Linda (demo):** esclusa in modo permanente finché resta seed — non si mette un negozio finto nell'indice.
- **Stato:** REGOLA ATTIVA — si applica al primo onboarding dal 13/7.


## 2026-07-06 23:55 · @frontend-dev → @devops-sre · 🟡 Metti il codice fisso «#A42 — nome» su ogni card del Pannello (branch + verifica + PR)
- **Cosa:** ho scritto la modifica che dà a ogni casella del Pannello un'etichetta STABILE visibile nel formato «#codice — nome» (codice + nome sempre insieme, come chiesto). File toccati: `pannello/src/lib/azioni-attesa.ts` (il codice ora è `#A42` col cancelletto + helper `etichettaCasella`), `pannello/src/components/aree/Azioni.tsx` (codice inline col titolo nella card "Da approvare"), `pannello/src/components/aree/Plancia.tsx` (codice + «—» nella lista "Da firmare"). Il codice deriva dall'hash del contenuto dell'azione: NON si rinumera a ogni giro.
- **Perché serve la tua mano:** nella mia sessione i comandi git/typecheck/browser sono bloccati, quindi il branch NON è ancora creato e la modifica NON è stata provata a video. I comandi pronti (copia-incolla dal VPS) sono qui sotto.
- **Colore:** 🟡 — modifica UI in un branch, **nessun deploy**. La PR resta da mergiare a mano (Vercel redeploy solo dopo merge su `main`).
- **Canale/mani:** terminale VPS (git + `npm run dev` per la prova a video) → poi PR su GitHub.
- **Comandi (VPS, cartella `/opt/mycity/ad-mycity`):**
  1. `git checkout -b pannello/etichetta-stabile-card`
  2. `git add pannello/src/lib/azioni-attesa.ts pannello/src/components/aree/Azioni.tsx pannello/src/components/aree/Plancia.tsx`
  3. `cd pannello && npm run build` (verifica typecheck+build verdi) poi `cd ..`
  4. `cd pannello && npm run dev` → apri http://localhost:3000, vai su "Azioni → Da approvare" e sulla Plancia "Da firmare": controlla che ogni card mostri «#codice — nome» sulla stessa riga e che il codice non cambi ricaricando.
  5. `git commit -m "Pannello: etichetta stabile #codice — nome su ogni card della coda"`
  6. `git push -u origin pannello/etichetta-stabile-card` poi apri la PR su `main` (NO deploy diretto).
- **Cosa cambia:** quando l'AD ti scrive «guarda #A42» tu trovi subito quella card nel Pannello — oggi le caselle non hanno numero e non le ritrovi.
- **Se va bene:** merghi la PR su `main`, Vercel ripubblica, il codice è visibile in produzione su ogni card.
- **Stato:** IN ATTESA — branch/verifica/PR da eseguire (bloccati nella mia sessione).


## 2026-07-08 23:03 · @devops-sre → 🟡 Blocca il push del giro se la memoria è incoerente (gate coerenza-fatti + sanità del vault)
- **Cosa:** due innesti in `cervello/giro.sh`, sullo STESSO meccanismo che già blocca su segreti/onestà (`GIRO_PUSH_OK=0`, righe 445-482):
  1. **Ri-eseguire `coerenza-fatti.mjs` prima del push** (accanto a scan-segreti/onesta-check, dopo che l'AI ha scritto — non solo a inizio giro alla riga 217, dove l'AI non ha ancora bonificato). Se `rc≠0` → memoria NON pubblicata su `main` + Telegram «memoria incoerente, giro non pubblicato» via `notifica-approvazioni.mjs`.
  2. **Check di sanità pre-commit del vault:** frontmatter valido, nessun marcatore di conflitto `<<<<<<`/`>>>>>>`, nessun file del vault a 0 byte. Se fallisce → blocca il commit del vault.
- **Perché:** oggi il gate coerenza-fatti è solo un vincolo testuale passato all'AI (righe 217-222): se l'AI non bonifica tutte le copie vecchie di un fatto, il valore vecchio resta e il push parte comunque → il Pannello lo mostra a Nicola come vero. Idem per uno snapshot sporco da rebase/merge in conflitto (righe 88-96) o scritture a metà auto-committate (righe 68-72).
- **Colore:** 🟡 — auto-modifica di `giro.sh` in un branch. Firma obbligatoria (regola: mai toccarsi da sola). **Nessun deploy** (è lo script del VPS, non il sito).
- **Canale/mani:** terminale VPS, @devops-sre, in un branch → prova con la skill `verify` (bats sugli script) → commit.
- **Cosa cambia:** una memoria incoerente o mezza-scritta viene TRATTENUTA sul server invece di finire su `main`; il caso peggiore diventa «un giro non pubblicato + una notifica», mai un dato falso in Cabina.
- **Se va bene:** ogni giro futuro pubblica solo memoria coerente e integra; il rischio pre-mortem della casella è chiuso alla radice.
- **Stato:** ✅ FIRMATA da Nicola («ok», 2026-07-08 23:48) — ora IN ESECUZIONE. Codice scritto e riletto a mano (`giro.sh` modificato + `vault-sanita.mjs` + `avviso-telegram.mjs` + test bats `gate-coerenza-vault-pre-push.bats`), **non ancora provato a runtime** (bash -n / node --check / bats gated in sessione). Restano da Nicola: approvare le verifiche, isolare i 4 file nel branch `ops/gate-coerenza-vault-pre-push` (oggi mescolati col lavoro AR-103), merge (🟡), e confermare `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` in `cervello/vps/.env` (altrimenti l'avviso resta dry-run).


<!-- SUPERVISIONE-NEGOZI:INIZIO -->
## 🛡️ Supervisione negozi & prodotti — proposte di riempimento (aggiornato 2026-07-13 14:20)
Report completo con comandi pronti: `consegne/supervisione/2026-07-13-supervisione.md`. Tutte 🟡, con **valore DEDOTTO** (non fornito dal negozio), reversibili (backup versionato per riga).

### 🟡 Metti «nuovo» come condizione ai 252 prodotti che non ce l'hanno

| Colore | Quanti | Cosa cambia | Se va bene |
|---|---|---|---|
| 🟡 | 252 | 252 schede oggi incomplete mostrano condizione = «nuovo» (valore dedotto) ai clienti. | Cataloghi più completi = ricerca/filtri migliori e più fiducia; poi passi al gruppo successivo. Undo: annulla-batch. |

Approva **solo questo gruppo**: «ok riempi condizione». Comando e undo nel report.

### 🟡 Metti «pezzo» come unità di misura ai 242 prodotti che non ce l'hanno

| Colore | Quanti | Cosa cambia | Se va bene |
|---|---|---|---|
| 🟡 | 242 | 242 schede oggi incomplete mostrano unità di misura = «pezzo» (valore dedotto) ai clienti. | Cataloghi più completi = ricerca/filtri migliori e più fiducia; poi passi al gruppo successivo. Undo: annulla-batch. |

Approva **solo questo gruppo**: «ok riempi unità di misura». Comando e undo nel report.


> ⚠️ **Scritture al database: si approva un gruppo alla volta** (niente «ok a tutte»). Ogni gruppo
> è un valore DEDOTTO dalla macchina, non fornito dal negozio; per prezzo/orari/descrizione serve prima
> la conferma del dato dal negozio (restano «da procurare», non li scrive nessun autofill).
<!-- SUPERVISIONE-NEGOZI:FINE -->
