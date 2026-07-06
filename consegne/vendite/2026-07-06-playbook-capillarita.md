---
tipo: playbook
reparto: vendite + designer + relazioni-istituzionali
data: 2026-07-06 13:20
autore: AD digitale
colore: 🟢 produzione template · 🔴 stampa + posa fisica
stato: template pronti · stampa/posa accodate in [[AZIONI-IN-ATTESA]]
---

# 📍 PLAYBOOK Capillarità — kit fisico del negozio + presenza in città

> **Scopo:** ogni nuovo negozio che aderisce a MyCity esce dal go-live con un **kit fisico
> pronto** (QR in vetrina, vetrofania, sacchetti brandizzati) e la città si riempie di **punti
> di presenza** che portano i clienti sul marketplace. Capillarità = essere *ovunque nel centro*
> a costo quasi zero, sfruttando le vetrine dei negozi come cartelloni.

## 🚦 Cancello di allocazione (AR-006) — letto PRIMA di produrre
Fonte: `registro-realta.json` (agg. 2026-07-06 11:11) + [[STATO]].

| Entità | Stato | Cosa può avere ORA |
|---|---|---|
| **Pane Quotidiano** (Via Calzolai 25) | ✅ `confermato` (unico negozio reale) | **Kit personalizzato** (nome + QR alla sua pagina) — *ma stampa gated*, vedi sotto |
| **Casa Linda** | ❌ `demo` (seed) | Niente — esclusa |
| **Shortlist 27 food + 407 lead** | 🟡 `scelta_ragionata` / `to_contact` (non firmati, non nel DB) | **Solo template NEUTRI riusabili** — nessun pacchetto intestato |

**Regola applicata:** i template qui sotto sono **neutri e riusabili** (brand MyCity, zero dati
di negozio) → si istanziano in 2 minuti il giorno che il negozio firma. L'unico kit *intestato*
è quello di Pane Quotidiano, l'unico negozio reale. Nessuno sforzo pesante dorme su un prospect.

---

## 🎒 Il KIT FISICO — 3 pezzi (spec di stampa)
Brand (fonte `creativi/brand.mjs`): terracotta `#C0492C`, senape `#E8A33D`, oliva `#5A7C42`,
inchiostro `#2C2A28`, panna `#FBF7F0`. Font display **Fraunces**, testo **Inter**.
Tagline: *«La spesa che tiene viva la città.»*

### 1) 🟦 QR in vetrina / alla cassa (cartoncino A5 + adesivo tondo Ø10 cm)
- **Cosa fa:** il cliente inquadra → apre la pagina del negozio su MyCity e ordina a casa.
- **Copy:** «Ordina da **[NEGOZIO]** e te lo portiamo a casa» + sotto «Inquadra e scegli».
- **QR punta a:** `https://mycity-marketplace.com/store/{ID}/{slug}` (URL reale verificato — pattern
  route `app/store/[id]/[slug]`). Per un negozio nuovo: la sua pagina appena creata. Template
  neutro: QR alla **home** `https://mycity-marketplace.com` («Scopri i negozi di Piacenza»).
- **Safe-area:** QR ≥ 3 cm lato, margine bianco 2 mm, correzione errore M (già in `genera-qr.mjs`).

### 2) 🪟 Vetrofania «Trovi [NEGOZIO] su MyCity» (statica trasparente 20×20 cm, esterno vetrina)
- **Cosa fa:** segnala dalla strada che il negozio consegna con MyCity → capillarità visiva.
- **Copy:** logo MyCity + «Ci trovi anche su MyCity — ordina e te lo portiamo» + QR piccolo in basso.
- **Palette:** fondo panna, testo inchiostro, bollino senape sul QR. Doppia versione (chiaro/scuro vetrina).

### 3) 🛍️ Sacchetto brandizzato (carta kraft, stampa 1 colore terracotta)
- **Cosa fa:** ogni consegna diventa un cartellone che gira per la città (il cliente lo riusa).
- **Copy:** wordmark MyCity + tagline + QR sul lato → «Riordina in 3 tap».
- **Formati:** 2 misure (pane/piccolo 18×22, spesa/grande 26×32). 1 colore = costo minimo.

---

## 🧩 Cosa produco ORA (🟢) vs cosa aspetta la firma (🔴)

**🟢 Prodotto/pronto in questo giro (reversibile, nessun costo):**
- Questo playbook + le **3 spec di stampa** neutre riusabili (sopra).
- Brief di render per il designer con brand token esatti (sotto).
- QR render: comando pronto (serve solo `npm i qrcode`, poi `node creativi/genera-qr.mjs`).

**🔴 Accodato per la firma di Nicola (costa soldi / tocca il mondo):**
- **Stampa fisica** del kit (tipografia locale) — spesa vera.
- **Posa dei punti di presenza** in città (alcuni richiedono consenso del partner).

---

## 🗺️ PUNTI DI PRESENZA — la mappa della capillarità a Piacenza
Principio: partire **denso attorno al faro** (centro storico / Piazza Cavalli, dov'è Pane
Quotidiano) e allargarsi a ogni nuovo negozio. Ogni punto = un QR che porta al marketplace.

| Livello | Dove | Cosa si posa | Consenso | Colore |
|---|---|---|---|---|
| ① Il negozio stesso | Vetrina + cassa di ogni negozio aderente | QR A5 + vetrofania | il negoziante (già dentro) | 🔴 stampa |
| ② Il sacchetto | In mano a ogni cliente che riceve la consegna | sacchetto brandizzato | nessuno | 🔴 stampa |
| ③ Eventi del centro | **Venerdì Piacentini** (10/7 e 17/7 — ultime date) | cartoncini QR al banchetto/negozi aperti | organizzatori | 🔴 |
| ④ Partner di quartiere | bar, edicole, associazioni (Vita in Centro) | adesivo tondo QR alla cassa | ogni partner | 🔴 + relazioni-istituzionali |
| ⑤ Bacheche & Comune | bando «Vita in Centro» (rimborso ≤50% materiali) | locandine QR | Ufficio Commercio | 🔴 (aggancio A1) |

> **⚠️ Gate di scala (AR-081, cross-silo):** i livelli ③④⑤ (capillarità di massa) partono
> **quando ci sono ≥3 negozi reali evadibili**. Oggi c'è **1 solo negozio reale (PQ) e non ancora
> evadibile** (payout OFF, ordine-prova #21 da chiudere): riempire la città di QR che portano a un
> marketplace con un solo negozio fermo brucia la prima impressione. Prima si accende il ciclo su PQ
> (#21), poi arriva il 2°–3° negozio (shortlist #22/#25), **poi** si apre la capillarità di città.
> Il playbook è pronto e firmabile: scatta al segnale, non prima.

---

## 🥖 Istanza Pane Quotidiano (l'unico negozio reale — kit intestato)
- **Dati reali:** Pane Quotidiano, Via Calzolai 25, tel. 0523 388601, seller `c0b240c0…`, 5 prodotti bio.
- **QR vetrina →** `https://mycity-marketplace.com/store/{ID_PQ}/pane-quotidiano`
  (l'`{ID_PQ}` è il seller id pieno — nel registro è troncato `c0b240c0…`: **da completare dal DB**
  con la chiave di lettura, non lo invento).
- **Stampa PQ = 🔴 gated:** si stampa e si posa **dopo** che PQ è di nuovo evadibile (ordine-prova
  #21 chiuso: accetta → consegna → payout-test). Coerente col carrello #27 e l'anti-churn #26:
  non mando gente in vetrina prima che il negozio sappia evadere.

---

## 🎨 Brief per il designer (render 🟢)
Obiettivo: 3 template neutri + 1 istanza PQ, in `creativi/output/kit-capillarita/`.
- Usa `creativi/brand.mjs` (colori/font/tagline sopra) e `creativi/genera-qr.mjs` per i QR.
- File: `qr-a5-neutro.png`, `qr-adesivo-tondo.png`, `vetrofania-20x20.png` (chiaro+scuro),
  `sacchetto-piccolo.png`, `sacchetto-grande.png` + le stesse versioni `-pane-quotidiano`.
- Segnaposto evidenti dove manca il dato reale (nome negozio / URL) — regole `ONESTA-RULES.md`.
- Cancelli qualità: @direttore-creativo (è da agenzia?) → @qa-designer (safe-area/segnaposti/brand).

## 💰 Cosa serve da Nicola (carburante che alza il livello)
1. **URL pieno pagina PQ** (o ok a leggerlo dal DB con la chiave) → per il QR reale di Pane Quotidiano.
2. **Preventivo tipografia locale** per il kit (cartoncini, vetrofanie, sacchetti) → poi firma la stampa 🔴.
3. **Ok al bando «Vita in Centro»** (A1): può rimborsare ≤50% dei materiali di stampa — la capillarità
   costa quasi zero se agganciata al bando.
