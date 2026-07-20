---
tipo: consegna
reparto: seo
data: 2026-07-20 11:04
autore: senior @seo
oggetto: Playbook SEO locale — 5 ricerche ad alto intento (refresh PQ, catalogo live 20/7)
stato: 🟢 ricerca + testi pronti · 🟡 patch CONFIG/codice (branch) · 🔴 GBP/pubblicazione
allocazione: PQ = `confermato` (AR-006 OK) → pacchetto pieno intestato
fonte_dati: REST marketplace 20/7 11:04 (sensori ok) · fonti pubbliche PQ (Vita in Centro, PagineGialle)
---

# 🔎 Playbook SEO locale — refresh 20 luglio 2026

> **Cosa cambia rispetto al playbook 6/7** (`consegne/seo/2026-07-06-playbook-seo-locale-PQ.md`):
> ho **ri-verificato il catalogo live** (non più «pane, pesto, kefir» generici) e **rivalutato la keyword #4 senza glutine**.
> Volumi = **stime** su scala Piacenza (~103k abitanti); i numeri reali si leggono in Search Console post-indicizzazione.

---

## 0) Verità a terra (REST live 20/7 11:04)

| Dato | Valore verificato | Nota SEO |
|---|---|---|
| Negozio | **Pane Quotidiano** · `c0b240c0-2a86-4218-9d0f-5154f08ff929` | Unico negozio reale approvato |
| Indirizzo | Via Calzolai, 25, 29100 Piacenza PC | `store_address` già pieno → sblocca « a Piacenza » nel title template |
| Tel. | 0523388601 | Schema `telephone` |
| `store_description` attuale | «…pane, miele biologico…» | ⚠️ **Disallineata dal catalogo** (vedi sotto) — va aggiornata |
| Prodotti online (5) | Kefir capra bio · Kefir Demeter 400g · Pesto Genovese Bio · Hummus ceci bio · Pudding vaniglia bio | Tutti `status=available`, categoria `alimentari` |
| Senza glutine in catalogo MyCity | **0 SKU** con tag/nome «senza glutine» | Keyword #4 vecchia **sospesa** per le pagine MyCity |

**Fonte pubblica PQ** (Vita in Centro): il negozio fisico offre «prodotti per intolleranze e allergie» oltre al bio. Questo **non basta** per promettere «compra senza glutine online su MyCity» finché non ci sono prodotti nel catalogo.

**Orari pubblici** (Vita in Centro / PagineGialle — da confermare col titolare prima dello schema):
Lun–Sab 8:30–13:00 / 16:30–19:30 · Giovedì pomeriggio chiuso · Domenica chiuso.

---

## 1) 🔑 Le 5 ricerche ad alto intento (aggiornate)

Confidenza volumi: **media-bassa** (nessun tool keyword a pagamento; stime da scala città + SERP spot-check).

| # | Ricerca madre | Intento | Vol. stim./mese | Concorrenza | Pagina target | vs 6/7 |
|---|---|---|---|---|---|---|
| 1 | **prodotti bio a domicilio Piacenza** | comprare | 40–120 | bassa | Pagina negozio PQ | ✅ confermata |
| 2 | **negozio dietetico Piacenza centro** | comprare | 20–60 | molto bassa | Pagina negozio PQ | ✅ confermata |
| 3 | **spesa bio online Piacenza** | comprare | 30–90 | bassa-media | Home + `/category/alimentari` | ✅ confermata |
| 4 | **kefir biologico Piacenza** / *dove comprare kefir bio a Piacenza* | comprare | 15–45 | bassa | Pagina negozio PQ + schede prodotto kefir | 🔄 **sostituisce «senza glutine»** |
| 5 | **botteghe centro storico Piacenza consegna a domicilio** | scoperta→comprare | 30–80 | bassa | Pagina negozio PQ (+ futuro `/stores`) | ✅ confermata |

### ⚠️ Verdetto keyword #4 «senza glutine» (6/7)

| Canale | Stato | Motivo |
|---|---|---|
| **Pagine MyCity** (title, meta, H1, Product schema) | ⛔ **SOSPESA** | 0 prodotti «senza glutine» nel catalogo live (REST 20/7). Claim online = rischio markup ingannevole. |
| **Scheda GBP di Pane Quotidiano** | 🟡 **Soft claim ammesso** | Vita in Centro cita «intolleranze e allergie». Formulazione: *«ampia scelta per intolleranze alimentari — chiedi in negozio»*, **non** «ordina senza glutine su MyCity». |
| **Sblocco MyCity** | Quando PQ carica ≥1 SKU senza glutine verificabile | Poi si ripristina la keyword con Product schema dedicato. |

**Sostituto #4 — perché kefir:** 2 prodotti su 5 nel catalogo sono kefir bio (capra + Demeter); intento d'acquisto alto; SERP locale dominata da GDO (Coop) — l'angolo **bottega del centro + consegna locale** è ancora libero.

---

## 2) ✍️ Testi pronti per keyword (title · meta ≤160 · H1 · schema · GBP)

> **Nota implementativa:** c'è **una sola pagina negozio** (`/store/c0b240c0-…`). Title/meta principali derivano da `store_description` (template in `layout.tsx`). I blocchi sotto servono come: (a) **`store_description` ottimizzata multi-keyword**, (b) **H2/H1 secondari** in copy on-page futuro, (c) **post e Q&A GBP** per intento.

---

### Keyword 1 — «prodotti bio a domicilio Piacenza»

| Campo | Testo |
|---|---|
| **Title** | `Prodotti bio a domicilio a Piacenza — Pane Quotidiano · MyCity` |
| **Meta description** (154 char) | `Compra prodotti biologici a Piacenza e ricevili a casa. Bottega bio dal 1976 in Via Calzolai 25. Kefir, pesto e alimenti bio con MyCity.` |
| **H1** | `Prodotti bio a domicilio a Piacenza` |
| **Schema.org** | `@type`: `HealthFoodStore` (preferibile a `Store` generico). Campi: `name`, `address` (Via Calzolai 25), `telephone`, `geo`, `areaServed` = `{ "@type": "City", "name": "Piacenza" }`, `hasOfferCatalog` → i 5 prodotti bio. Fix noto: `url` server-side (non `window.location.href`). |
| **GBP (PQ)** | Post: *«Ordina prodotti bio a domicilio — kefir, pesto e altro da Pane Quotidiano con MyCity»* + link vetrina. Categoria primaria: **Negozio di alimenti naturali** / Health food store. Attributo **Consegna** se disponibile. |

---

### Keyword 2 — «negozio dietetico Piacenza centro»

| Campo | Testo |
|---|---|
| **Title** | `Negozio dietetico in centro a Piacenza — Pane Quotidiano · MyCity` |
| **Meta description** (147 char) | `Alimenti dietetici e biologici in Via Calzolai 25, centro storico di Piacenza. Dal 1976. Ordina online: ritiro in negozio o consegna con MyCity.` |
| **H1** | `Negozio dietetico nel centro storico di Piacenza` |
| **Schema.org** | Stesso `HealthFoodStore` + `openingHoursSpecification` (orari §0, 🟡 procura titolare). `description` con «dietetico · biologico · centro storico · dal 1976». `sameAs`: Facebook `vitaincentroapiacenza` / pagina negozio se confermata. |
| **GBP (PQ)** | Descrizione scheda (750 char max): enfatizza **zona Piazza Cavalli / Via Calzolai**, dal 1976, bio+dietetico. Categoria secondaria: **Negozio dietetico** se disponibile. Foto: vetrina + interno + prodotti bio. |

---

### Keyword 3 — «spesa bio online Piacenza»

| Campo | Testo |
|---|---|
| **Title** | `Spesa bio online a Piacenza — Consegna dai negozi locali · MyCity` |
| **Meta description** (138 char) | `Fai la spesa bio online a Piacenza: alimenti biologici dai negozi del centro, consegna a casa. Pagamento sicuro su MyCity.` |
| **H1** | `Spesa bio online a Piacenza` |
| **Pagina target** | **`/category/alimentari`** (esiste, tutti i prodotti PQ) + home MyCity |
| **Schema.org** | `CollectionPage` + `ItemList` con i prodotti bio PQ (`ListItem` → URL prodotto). `BreadcrumbList`: Home › Alimentari. Oggi manca JSON-LD categoria → patch branch 🟡. |
| **GBP** | Post su **PQ** con CTA «Spesa bio online» → link categoria alimentari. Scheda **MyCity** service-area: ⛔ parcheggiata (regola 6/7: 0 consegne provate). |

---

### Keyword 4 — «kefir biologico Piacenza» *(nuova)*

| Campo | Testo |
|---|---|
| **Title** | `Kefir biologico a Piacenza — Pane Quotidiano · MyCity` |
| **Meta description** (128 char) | `Kefir bio a Piacenza: latte di capra e kefir Demeter da Pane Quotidiano. Ordina online, consegna a domicilio in città con MyCity.` |
| **H1** | `Dove comprare kefir biologico a Piacenza` |
| **Schema.org** | **`Product`** su entrambe le schede kefir: `name`, `image`, `description`, `brand`, `offers` (`price`, `priceCurrency`: EUR, `availability`: InStock, `url` canonico). ⚠️ Niente `AggregateRating` finché non ci sono recensioni vere in pagina. |
| **GBP (PQ)** | Post prodotto con foto kefir + prezzo + «Ordina su MyCity». Q&A GBP: *«Avete kefir biologico?»* → *«Sì, kefir di capra bio e kefir Demeter 400g — ordine online con consegna locale.»* |

**Prodotti da collegare (ID verificati):**
- `90386a8f-…` — Kefir di latte di capra biologico (€2,95)
- `418b20af-…` — Berchtesgadener Land kefir biologico 400g (€2,05)

---

### Keyword 5 — «botteghe centro storico consegna a domicilio»

| Campo | Testo |
|---|---|
| **Title** | `Botteghe del centro storico a Piacenza — Consegna a domicilio · MyCity` |
| **Meta description** (141 char) | `Botteghe del centro storico di Piacenza con consegna a casa. Pane Quotidiano in Via Calzolai 25: bio dal 1976. Ordina online su MyCity.` |
| **H1** | `Botteghe del centro storico con consegna a Piacenza` |
| **Schema.org** | `LocalBusiness` con `geo` preciso (geocodifica Via Calzolai 25 — 🟡 non inventare lat/lng). `containedInPlace` / menzione «Piazza Cavalli, centro storico». |
| **GBP (PQ)** | Evidenziare **quartiere/zona** (Piazza Cavalli, Via Calzolai). Attributo consegna. Quando arriveranno altre botteghe centro → pagina aggregata `/stores` con filtro zona (evitare doorway: 1 negozio = 1 pagina negozio). |

---

## 3) 📝 `store_description` unificata (CONFIG — leva n.1)

Testo che alimenta **title + meta + schema** in un colpo (allineato al catalogo reale 20/7):

> **Proposta `store_description` (≈158 char nei primi 160):**
> *Pane Quotidiano: alimenti biologici e dietetici a Piacenza dal 1976, Via Calzolai 25 (centro). Kefir, pesto e prodotti bio — ordina online con consegna locale MyCity.*

**Cosa NON mettere finché non è nel catalogo:** pane, miele, senza glutine, vegan generico.

**Comando pronto (🟡 reversibile, backup automatico):**
```bash
node cervello/marketplace.mjs aggiorna profiles c0b240c0-2a86-4218-9d0f-5154f08ff929 '{
  "store_description": "Pane Quotidiano: alimenti biologici e dietetici a Piacenza dal 1976, Via Calzolai 25 (centro). Kefir, pesto e prodotti bio — ordina online con consegna locale MyCity."
}'
```

---

## 4) 🧩 Pagina categoria marketplace consigliata

**Non creare subito una categoria «bio/biologico» separata** — con 1 negozio e 5 SKU rischia thin content / doorway.

| Mossa | Pagina | Perché | Colore |
|---|---|---|---|
| **Ora (quick win)** | **`/category/alimentari`** | Esiste, contiene tutti i prodotti PQ, già in sitemap | 🟡 CONFIG |
| **Dopo (≥3 negozi bio o ≥15 SKU bio)** | Subcategoria `alimentari-bio` o tag filtrabile | Giustifica pagina dedicata senza penalità | 🟡 branch |

**Testi pronti per `/category/alimentari`** (patch `CATEGORY_LONG_DESC` in `marketplace/app/category/[slug]/layout.tsx`):

| Campo | Testo |
|---|---|
| **Title** | `Alimentari biologici a Piacenza — Compra online dai negozi locali · MyCity` |
| **Meta description** (134 char) | `Alimentari bio e dietetici a Piacenza: kefir, pesto e prodotti biologici delle botteghe locali. Consegna a domicilio con MyCity.` |
| **H1** (on-page esistente via `CollectionHeader`) | `Alimentari` → considerare sottotitolo: *«Biologici e dietetici a Piacenza»* |
| **Schema.org** | `CollectionPage` + `ItemList` (prodotti filtrati seller PQ o tag `bio`) |
| **Copy lungo** (sotto griglia, 2 frasi) | *«Su MyCity trovi alimenti biologici e dietetici dai negozi di Piacenza — come Pane Quotidiano in Via Calzolai, bottega bio dal 1976. Scegli i prodotti, paga online e ricevili a casa con consegna locale.»* |

---

## 5) 📈 Metriche (oneste)

| KPI | Baseline oggi | Target 90 gg (stima) | Fonte |
|---|---|---|---|
| Impressioni query bio/dietetico Piacenza | 0 (non indicizzato / non misurato) | Prime impressioni | Search Console |
| Posizione media kw #1–2 | n/d | Top 5 organico locale | Search Console |
| Click da GBP PQ | n/d | ≥20/mese post-rivendicazione | GBP Insights |
| Ordini da organico | 0 | ≥1 (north star) | PostHog / ordini |

**Nessun ranking dichiarato come fatto** finché Search Console non mostra dati.

---

## 6) 🍞 Carburante che alza il tetto

1. **Conferma titolare PQ:** orari esatti + linea senza glutine fisica (per GBP soft claim, non per MyCity finché non c'è SKU).
2. **Foto prodotti** kefir/pesto per Product schema e post GBP.
3. **Search Console** collegata al dominio MyCity (oggi lavoro alla cieca sui ranking).
4. **Rivendicazione GBP Pane Quotidiano** 🔴 (ok Nicola + titolare).
5. **Prima consegna provata** → sblocca scheda GBP MyCity service-area.

---

## 7) 💡 Idea 10× (non richiesta — pronta da firmare)

**Landing «Kefir bio a Piacenza»** come sezione H2 + FAQ nella pagina negozio (non pagina separata): 3 domande (*Dove lo trovo? Quanto costa? Consegna?*) con risposte factual + link alle 2 schede prodotto. Costo zero, alimenta AI Overview, zero rischio doorway. Owner implementazione: @frontend-dev in branch 🟡.

---

## ✅ Riepilogo decisioni

| Decisione | Esito |
|---|---|
| Keyword 1, 2, 3, 5 | **Confermate** con testi aggiornati al catalogo |
| Keyword 4 «senza glutine» MyCity | **Sospesa** (0 SKU) |
| Keyword 4 nuova | **Kefir biologico Piacenza** (2 SKU verificati) |
| Pagina categoria | **Ottimizza `/category/alimentari`**, non creare «bio» ora |
| `store_description` | **Da aggiornare** — disallineata (cita pane/miele assenti) |
