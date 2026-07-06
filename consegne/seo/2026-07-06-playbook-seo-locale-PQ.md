---
tipo: consegna
reparto: seo
data: 2026-07-06 12:20
autore: AD digitale (senior SEO locale)
oggetto: Playbook SEO locale — 5 ricerche ad alto intento + pagine negozio/categoria ottimizzate (faro Pane Quotidiano)
stato: 🟢 ricerca + testi + template pronti · 🟡 riempimento campi DB e patch codice (da firmare) · 🔴 Google Business (da firmare)
allocazione: PQ = `confermato` (AR-006 OK) → pacchetto pieno intestato. Garetti/salumi DOP = `scelta_ragionata` → restano template neutri nel pacchetto 24/6, NON espansi qui.
---

# 🔎 Playbook SEO locale — intercettare "dove comprare X a Piacenza"

> **Ripivot rispetto al pacchetto 24/6** (`PACCHETTO-SEO-LOCALE.md`, tarato su Garetti/salumi DOP):
> l'unico negozio **reale e confermato** su MyCity è **Pane Quotidiano** — *alimenti bio/dietetici dal 1976,
> Via Calzolai 25 (centro, zona Piazza Cavalli), tel 0523 388601, 5 prodotti bio disponibili*
> (fonte: registro-realtà + DB live 6/7). Lo sforzo pesante SEO va **dove c'è un negozio che può incassare** →
> le pagine si intestano a PQ e alla sua nicchia (bio/dietetico), non ai salumi DOP di un prospect non firmato.

## 0) Scoperta chiave dal codice del sito (perché è a basso rischio)
Ho letto come il marketplace genera SEO oggi (repo `marketplace/`):
- **Titolo + meta descrizione della pagina negozio** (`app/store/[id]/layout.tsx`) sono **derivati dai campi DB**:
  `store_name`, `store_description`, `store_address`. Se `store_description` è **vuota**, escono un titolo e una
  descrizione **generici** → oggi PQ probabilmente non sfrutta nessuna keyword.
- Lo **Schema.org `Store` (LocalBusiness) JSON-LD esiste già** (`app/store/[id]/page.tsx`), ma è **affamato di dati**:
  pesca `telephone`, `store_address`, `geo (lat/lng)` dal DB → se quei campi sono vuoti, lo schema esce **monco**
  (niente telefono, niente indirizzo, niente coordinate). Manca del tutto `openingHours`.
- **Conseguenza:** la leva SEO **n.1, a rischio più basso, reversibile** non è toccare codice — è **riempire i campi
  DB di PQ** con testo vero e keyword-ricco (corsia CONFIG `marketplace.mjs aggiorna`, backup per riga). Riempire
  `store_description` migliora **in un colpo**: meta title, meta description, testo on-page **e** lo schema.org.

---

## 1) 🔑 Le 5 ricerche locali ad alto intento (ancorate a ciò che PQ vende davvero)
Volumi = stima su scala Piacenza (~103k città / ~287k provincia): **decine–poche centinaia/mese**, non migliaia.
In SEO locale conta **intento + vicinanza**, non il volume nazionale. Concorrenza sull'angolo "bio a domicilio" = **debole**.
Confidenza: media (stime senza tool a pagamento; i numeri veri si leggono in Search Console dopo il go-live).

| # | Ricerca ("dove comprare X a Piacenza") | Intento | Volume stim./mese | Concorrenza | Pagina target |
|---|---|---|---|---|---|
| 1 | **prodotti bio a domicilio Piacenza** / *dove comprare prodotti biologici a Piacenza* | comprare | 40–120 | bassa | **PQ store** + categoria bio |
| 2 | **alimenti dietetici Piacenza** / *negozio dietetico Piacenza centro* | comprare | 20–60 | molto bassa | **PQ store** |
| 3 | **spesa bio online Piacenza** / *biologico consegna a casa Piacenza* | comprare | 30–90 | bassa-media | **Home / categoria bio** (marketplace) |
| 4 | **prodotti senza glutine Piacenza** / *dove comprare senza glutine a Piacenza* | comprare | 40–110 | bassa | **PQ store** ⚠️ *da confermare che PQ tenga la linea senza glutine* |
| 5 | **negozi del centro storico Piacenza con consegna a casa** | scoperta→comprare | 30–80 | bassa | **PQ store** (Via Calzolai, centro) + pagina "botteghe del centro" |

> ⚠️ **Onestà (riga 4):** "senza glutine/celiaci" è un sotto-segmento plausibile del "dietetico" di PQ ma **non
> verificato nei dati**. → **serve conferma di Nicola/PQ** che il catalogo abbia quella linea prima di intestarci
> una pagina. Se non c'è: la riga 4 si sospende (niente claim inventati).

---

## 2) ✍️ Testi ottimizzati pronti (pagina negozio Pane Quotidiano)
Tutto vero, tarato sui fatti pubblici di PQ. **≤160 caratteri** dove serve alla meta.

**`store_description` proposta (guida title + meta + on-page + schema):**
> *Pane Quotidiano: alimenti biologici e dietetici a Piacenza dal 1976, in Via Calzolai 25 (centro). Prodotti bio
> per mangiar sano — su MyCity con consegna locale o ritiro in negozio.*  ⟶ (≈155 caratteri)

Con questa descrizione + i campi indirizzo/telefono pieni, il codice attuale produce **da solo**:
- **Meta title:** `Pane Quotidiano a Piacenza — Acquista online · MyCity Piacenza` *(template già in `layout.tsx`)*
- **Meta description:** i primi 160 char della `store_description` sopra (keyword: *biologici, dietetici, Piacenza,
  bio, consegna locale*).
- **Schema.org `Store`** completo di `telephone`, `address` (streetAddress Via Calzolai 25 · Piacenza · PC · IT),
  `geo` (se riempiamo lat/lng), `description`.

**Campi DB da riempire (tutti veri):**
| Campo | Valore proposto | Fonte |
|---|---|---|
| `store_description` | testo sopra | scelta ragionata su fatti pubblici PQ |
| `store_address` | `Via Calzolai 25, 29121 Piacenza (PC)` | registro-realtà + DB live |
| `store_phone` | `0523 388601` | registro-realtà + Pagine Gialle |
| `store_lat` / `store_lng` | *geocodifica esatta di Via Calzolai 25* — **da confermare** (non invento coordinate) | Google/Nominatim |

---

## 3) 🧩 Schema.org — cosa c'è, cosa riempire, cosa aggiungere
| Elemento | Stato oggi | Azione | Corsia / colore |
|---|---|---|---|
| `Store` JSON-LD pagina negozio | ✅ esiste, ma dati vuoti | riempire campi DB (§2) → si popola da solo | CONFIG · 🟡 reversibile |
| `openingHours` nello schema | ❌ assente | aggiungere `openingHoursSpecification` (serve orari reali PQ) | CODICE branch · 🟡 + *procura orari* |
| `@type` più specifico | generico `Store` | per negozi food-bio usare `GroceryStore`/`HealthFoodStore` (data-driven da categoria) | CODICE branch · 🟡 |
| `url` nello schema | ⚠️ bug: `window.location.href` → **undefined lato server**, il crawler non lo vede | costruire l'URL canonico server-side | CODICE branch · 🟡 (SEO tecnica) |
| `Product` + `Offer` sui prodotti | ❓ meta prodotto c'è, JSON-LD `Product` **pare assente** | aggiungere `Product`/`Offer` (prezzo, disponibilità) → rich result | CODICE branch · 🟡 |
| `BreadcrumbList` + `CollectionPage` categoria | breadcrumb UI c'è, JSON-LD da verificare | aggiungere JSON-LD categoria + long-desc "bio/biologico" | CODICE branch · 🟡 |

> Le patch CODICE vanno **in un branch del repo marketplace**, con i test SEO esistenti
> (`tests/e2e/06-seo-and-a11y.spec.ts`) come cancello. **Mai deploy 🔴 senza firma.** Owner: frontend-dev/tech.

---

## 4) 📍 Google Business Profile (la leva locale più forte per "vicino a me")
| Scheda | Azione | Colore |
|---|---|---|
| **Pane Quotidiano** | Rivendicare/verificare la scheda esistente (attività dal 1976 → quasi certamente già mappata): categoria "Negozio di alimenti naturali/biologici", orari reali, foto, **link alla vetrina MyCity**, post "ora consegniamo a domicilio con MyCity". | 🔴 *serve OK di Nicola + del titolare PQ (è la scheda del negozio, non nostra)* |
| **MyCity** | Creare la scheda "MyCity — marketplace dei negozi di Piacenza" come *service-area business* (zona Piacenza), categoria "Servizio di consegna spesa", link al sito, descrizione con keyword. | 🔴 *creazione/pubblicazione = firma Nicola* |

Campi esatti pronti (nome, categorie, descrizione, orari, foto da procurare) → li preparo al via, non li pubblico.

---

## 5) 📈 Come misuriamo (senza inventare numeri)
Post go-live, in **Google Search Console** + **GBP Insights** (gratis): impression/click per le 5 query, posizione
media, ricerche "scoperta" della scheda PQ. Obiettivo realistico a 90 gg: top-3 locale per le ricerche 1–2–4,
prime pagine su 3 e 5. **Nessun numero dichiarato come fatto finché non è in Search Console.**

## ✅ Accodato per la firma (2026-07-06 13:05)
Le azioni di questo playbook sono ora nella coda da approvare — dettaglio in `[[AZIONI-PRONTE]]`, card in `[[AZIONI-IN-ATTESA]]`:
- **#30 / A21** 🟡 — riempi i campi vetrina PQ (config `marketplace.mjs`, reversibile) → §0-2.
- **#31 / A22** 🟡 — completa lo schema.org + fix URL canonico (branch, test come cancello) → §3.
- **#32 / A23** 🔴 — rivendica i due Google Business Profile (PQ + MyCity) → §4.

## 🍞 Carburante che alza il tetto (da Nicola/PQ)
1. **Nomi esatti dei 5 prodotti bio** + foto → schede prodotto ottimizzate e `Product` schema veri.
2. **Orari di apertura reali di PQ** → `openingHours` nello schema (forte per il local pack).
3. **Conferma linea "senza glutine/celiaci"** → sblocca la ricerca #4.
4. **OK a rivendicare i due Google Business** (PQ + MyCity).
