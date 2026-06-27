---
titolo: Mappa delle analisi automatiche di MyCity OS + i buchi da coprire
data: 2026-06-27 16:40
autore: AD digitale
colore: 🟢
---

# 🔬 Le 3 analisi automatiche di MyCity — radiografia + buchi da coprire

> Obiettivo: capire **a fondo** cosa analizza oggi il sistema (i 3 motori),
> dove è **cieco**, e quali analisi **mancano** ma sarebbero ad alto ritorno.
> Tutto basato sul codice reale (`pannello/`, `cervello/`, `.claude/workflows/`).

---

## PARTE A — Cosa analizziamo OGGI (e cosa NON possiamo vedere)

### Analisi 1 — Il Pannello a regole (€0, Vercel, sempre attivo)
**Dati:** `getMetriche()` legge in sola lettura `orders`, `profiles`,
`abandoned_carts`, `store_reviews` + PostHog. Calcola ~50 numeri (ordini/incasso/
scontrino oggi-7g-30g, clienti attivi/dormienti, carrelli + recuperati, negozi,
consegne, tempo medio consegna, annullati, recensione media).
**Cosa fa:** alert a soglia (`/api/alert`) + sentinelle che **preparano l'azione
pronta** (`lib/sentinelle.ts`) + autopilota che esegue da solo le 🟢 + trend 30g
+ unit economics + pensiero del giorno.
**Forza:** istantaneo, gratis, sempre on, "mai sorprese".
**Cecità strutturale:**
- Vede solo **fotografie aggregate** del PRESENTE. Nessuna **coorte**, nessun
  **per-negozio**, nessun **per-prodotto**, nessun **funnel step-by-step**.
- Le soglie sono **fisse e assolute** (es. "<3 negozi"): non si adattano al
  contesto né imparano.
- Nessuna **causa**: dice "ordini a 0" ma non "perché".
- Non legge i **Piani** né le **intenzioni di Nicola**. Non riconcilia i numeri
  con Stripe/STATO.md.

### Analisi 2 — Il giro / ritmo (Claude Max, ragiona)
**Cosa fa:** `cervello/giro.md` → dati interni 7g + **sentinelle** + **radar
esterno** (50 fattori: concorrenti, eventi, meteo, bandi, ZTL…) → **briefing a 11
sezioni** (opportunità, rischi, azioni 🟢🟡🔴). Aggiorna STATO, i 3 file
Intelligence, e **propone** spunti nei Piani. Cadenze: mattino, sera, venerdì, mese.
**Forza:** unisce interno+esterno, ragiona, lascia traccia, doer-mode.
**Cecità strutturale:**
- Sui Piani **scrive** proposte ma non li **legge come "volontà del capo"**: non
  estrae cosa Nicola sta per fare per allinearsi/anticipare.
- Calibrazione **previsto vs reale** citata nel ritmo ma **non automatizzata**.
- Niente **pre-mortem di sistema** prima di accodare un'azione (rischio cross-silo).
- Retention/coorti/LTV e funnel non calcolati (mancano gli strumenti dato).

### Analisi 3 — Le radiografie profonde (Claude Max, on-demand)
**`radiografia`** (13 dim: architettura, sicurezza/auth, RLS, Stripe, privacy,
performance, frontend, a11y, QA-flussi, API, AI-endpoint, analytics, deploy) e
**`audit-design`** (11 dim UX/UI). Ogni problema **verificato in avversariale**.
**Forza:** profondità chirurgica, anti-falsi-positivi, per gravità.
**Cecità strutturale:**
- Guardano il **codice/design**, non il **business** (numeri, clienti, soldi).
- Sono **on-demand**: nessuna versione "continua/leggera" che vigila tra una
  radiografia e l'altra.
- Niente radiografia **legale/contratti**, **dati/qualità del dato**, **brand dei
  creativi già pubblicati**, **salute della macchina stessa**.

---

## PARTE B — Le analisi che MANCANO (in ordine di ritorno, fase 0→1)

### 🥇 1. Analisi dei PIANI e delle intenzioni di Nicola  *(la tua idea)*
**Cosa:** leggere `06-Piani/` + `CHECKLIST-NICOLA.md` + `AZIONI-IN-ATTESA.md` per
estrarre **cosa Nicola sta per fare**: primi negozi da contattare, ordine delle
mosse, scadenze, scommesse. Oggi l'AD ci **scrive** ma non li **legge come intento**.
**Output:** una scheda "Cosa sta per fare Nicola" + per ogni sua mossa: l'AD
**pre-prepara** il materiale (pitch del negozio, contratto, QR), **anticipa** gli
ostacoli, **segnala conflitti/rischi** ("contatti la Bottega X ma è chiusa il
lunedì"), evita di **duplicare**. Si allinea invece di andare in parallelo cieco.
**Dato:** vault (già c'è). **Colore:** 🟢 (legge e prepara). **Costo:** basso.
**Aggancio:** nuovo passo del giro + card Pannello "Le prossime mosse di Nicola".

### 🥈 2. Health-score e churn PER NEGOZIO
**Cosa:** `moduli.ts` lo dichiara già "in arrivo". Per ogni bottega: ordini, GMV,
trend 7/30g, recensioni, giorni dall'ultimo ordine, tempo-to-live, **rischio
abbandono**. **Perché:** con pochi negozi, **perderne uno è critico**; oggi
`account-negozi` lavora **senza dati**.
**Dato:** `orders.seller` + `profiles(role=seller)` + `store_reviews`.
**Colore:** 🟢 analisi · 🟡 il check-in al negozio. **Costo:** basso-medio.

### 🥉 3. Coorti, retention e LTV (la verità della crescita)
**Cosa:** % clienti che **riordinano**, tempo tra 1°e 2° ordine, curva di
retention per mese di iscrizione, **LTV**, frequenza. Oggi esiste solo il conteggio
"dormienti". **Perché:** in un marketplace la retention **è** il business; senza,
si scala un secchio bucato.
**Dato:** `orders(user_id, created_at)` — **già disponibile**. **Colore:** 🟢.
**Costo:** basso. Enorme valore/costo.

### 4. Funnel di conversione step-by-step
**Cosa:** home→negozio→prodotto→carrello→checkout→pagato, con **drop-off per
step** e dove si abbandona. Oggi solo il rapporto ordini/visitatori.
**Dato:** PostHog `paths` (già collegato) + ordini. **Colore:** 🟢 → alimenta CRO.

### 5. Verità dei numeri — riconciliazione cross-fonte
**Cosa:** confronta **STATO.md vs DB live vs Stripe** (payout vs ordini PAID) e
segnala le **divergenze** prima di decidere (mandato "una sola verità" in CLAUDE.md
+ GLOSSARIO-KPI). Include il badge "dati non affidabili" già abbozzato nel codice.
**Dato:** DB + Stripe MCP + vault. **Colore:** 🟡 (tocca la fiducia nei numeri).

### 6. Pre-mortem di sistema sulle azioni in coda
**Cosa:** prima di accodare/eseguire una 🟡/🔴, simulare **2-3 mosse avanti**:
brucia margine? intasa operations? contraddice un'altra azione? (AD-VETTORI).
**Dato:** azioni-in-attesa + unit econ + capacità rider. **Colore:** 🟢 (analisi
che protegge). Aggancio: gate prima dell'autopilota e della firma.

### 7. Self-diagnosi della macchina (l'autonomia gira davvero?)
**Cosa:** il cron sta partendo? memoria collegata? briefing freschi (<24h)? budget
AI in pista? le sentinelle vengono valutate? Oggi `/cuore` mostra il battito ma non
**diagnostica** se il loop è vivo. **Perché:** un'autonomia che si è spenta in
silenzio è il rischio numero uno. **Colore:** 🟢. **Costo:** basso.

### 8. Pattern temporali (quando si ordina)
**Cosa:** ore di punta, giorno della settimana, stagionalità → **copertura rider**
e **orario dei push/post**. **Dato:** `orders.created_at` (già c'è). **Colore:** 🟢.

### 9. Analisi del catalogo / prodotti
**Cosa:** best-seller, prodotti **mai venduti**, **categorie mancanti vs domanda**
(ricerche a vuoto), prezzi anomali, stock. **Perché:** dice a `vendite` quali
botteghe/categorie servono davvero. **Dato:** tabella `products`/`order_items` (da
verificare l'accesso). **Colore:** 🟢.

### 10. Calibrazione previsto vs reale (qualità delle decisioni)
**Cosa:** registrare l'**impatto previsto** di ogni azione e confrontarlo col
**reale**; chi stima bene guadagna autonomia (ritmo.md lo chiede, non è automatico).
**Dato:** DECISIONI.md + metriche dopo. **Colore:** 🟢.

### Altre utili (seconda ondata)
- **Margine per segmento** (negozio/categoria/zona): quali ordini **perdono** soldi.
- **Sentiment testuale recensioni**: temi ricorrenti dei reclami, non solo la media.
- **Trust & safety/frodi**: account multipli, abuso resi, recensioni finte.
- **Prezzi competitor nel tempo**: snapshot strutturato (oggi solo nota live).
- **SEO/presenza locale**: ranking Google/Maps, GBP per negozio.
- **Runway/cassa**: burn e mesi di autonomia (strategico in fase 0→1).
- **Audit brand dei creativi già pubblicati**: deriva dal brand nel tempo.
- **Radiografia legale/contratti**: la 14ª dimensione che manca alla radiografia.

---

## Priorità consigliata (le prime 4 da costruire)
1. **Analisi dei Piani/intenzioni di Nicola** — allinea l'AD a te (la tua idea).
2. **Retention/coorti/LTV** — dato già pronto, valore enorme, costo zero.
3. **Health per negozio** — sblocca `account-negozi`, protegge l'asset critico.
4. **Self-diagnosi della macchina** — garantisce che tutto il resto giri davvero.

> Tutte 🟢 in fase di analisi. Diventano 🟡/🔴 solo quando **agiscono** sul mondo.
> Servono da Nicola: ok a costruirle e (per il catalogo/Stripe) conferma che le
> tabelle `products`/payout siano leggibili dalla chiave di sola lettura.
