---
tipo: consegna
reparto: seo
data: 2026-07-06 13:05
autore: senior SEO locale
oggetto: Playbook SEO locale ESECUTIVO — JSON-LD pronti da incollare + DIFF di codice per pagina (faro Pane Quotidiano)
stato: 🟢 ricerca + testi + JSON-LD + diff pronti · 🟡 patch codice in branch (da firmare) · 🔴 Google Business + campi DB negozio reale (da firmare)
allocazione: PQ = `confermato` (AR-006 OK) → pacchetto pieno intestato. Categorie = infrastruttura neutra riusabile. Garetti/Casa Linda ESCLUSI.
companion: costruisce SOPRA `2026-07-06-playbook-seo-locale-PQ.md` (strategia/keyword) e `PACCHETTO-SEO-LOCALE.md`. Qui c'è la PARTE ESECUTIVA: JSON-LD compilati + diff codice + azioni pronte.
---

# 🔎 Playbook SEO locale — parte esecutiva (pronta da incollare)

> **Cosa aggiunge questo file** rispetto alla strategia di stamattina: (1) i blocchi **JSON-LD compilati con
> dati veri di Pane Quotidiano**, pronti da incollare; (2) il **DIFF di codice concettuale prima→dopo** per
> ogni file `page.tsx`/`layout.tsx`; (3) le **azioni pronte** per la coda. La logica keyword non la ri-derivo:
> è nel companion, qui la richiamo in una riga.

## ⭐ Sblocco dal giro web di oggi (fatti nuovi, citabili — non più solo registro-realtà)
Cercando la SERP reale ho **confermato e arricchito** i dati di Pane Quotidiano da fonti pubbliche:
- **Orari reali** (prima erano "da procurare"): **Lun–Sab 9:00–13:00 e 16:30–19:30; chiuso giovedì pomeriggio e domenica**
  — fonte: schede PagineGialle/PagineBianche di "Pane Quotidiano, Via Calzolai 25". → **sblocca `openingHours` nello schema.**
- **Assortimento reale** (fonte PagineGialle/Terra Nuova/VeganHome): alimenti bio piacentini, **prodotti per intolleranze
  e allergie** (celiachia inclusa nel segmento dietetico), macrobiotica, **alimentazione vegana**, dieta dei gruppi
  sanguigni, fitoterapici, cosmesi naturale, detersivi ecologici. → **conferma la keyword #4 (senza glutine/intolleranze)**
  come reale, e apre "vegan/macrobiotica Piacenza".
- **PQ è già mappato ovunque**: Vita in Centro, VeganHome, Terra Nuova, PagineGialle, PagineBianche + **Facebook attivo**
  (`facebook.com/viacalzolai.piacenza`). → **la scheda Google esiste quasi certamente** (da rivendicare, non creare) e
  ho un `sameAs` reale (la pagina Facebook) per lo schema.
- **SERP contesa da**: BioVivo (0523 656441, consegna a domicilio), NaturaSì (Via Emilia Pavese 88), directory
  (Legambiente/PagineGialle). **Nessun marketplace** presidia l'angolo "bottega bio del centro + consegna con app". → nicchia
  ancora vincibile, esattamente come registrato il 24/6.

Confidenza: **alta** sui fatti PQ (multi-fonte concordante) · **media** sui volumi (nessun tool a pagamento → i numeri
veri si leggono in Search Console dopo il go-live; qui sono stime qualitative su scala Piacenza ~103k città).

---

## 1) 🔑 Le 5 ricerche ad alto intento (sintesi — dettaglio nel companion)
Volumi = **stima qualitativa** (decine–poche centinaia/mese su scala Piacenza); in local SEO vince **intento + prossimità**.

| # | Query target | Perché alto-intento | Intento utente | Pagina di destinazione |
|---|---|---|---|---|
| 1 | **prodotti biologici a domicilio Piacenza** / *dove comprare bio a Piacenza* | "a domicilio/dove comprare" = pronto all'acquisto; SERP oggi solo directory+GDO, angolo bottega libero | comprare bio, consegna | `/store/[PQ]` + `/category/alimentari` |
| 2 | **negozio alimenti dietetici Piacenza centro** / *dieta gruppi sanguigni Piacenza* | nicchia specifica, concorrenza quasi nulla, PQ è LA risposta | comprare dietetico | `/store/[PQ]` |
| 3 | **spesa bio online Piacenza** / *biologico consegna a casa Piacenza* | "online/consegna a casa" = transazionale puro | comprare online | Home `/` + `/category/alimentari` |
| 4 | **prodotti senza glutine / per intolleranze Piacenza** | bisogno urgente e ricorrente (celiachia); PQ tiene la linea (confermato oggi) | comprare senza glutine | `/store/[PQ]` |
| 5 | **negozi del centro storico Piacenza con consegna a casa** / *botteghe del centro a domicilio* | scoperta→acquisto, presidia il posizionamento MyCity, PQ è in centro (Via Calzolai) | scoprire + comprare | `/store/[PQ]` + `/near` |

> `[PQ]` = UUID reale del profilo Pane Quotidiano in `seller_public_profiles`. **Non lo invento**: va letto dal DB
> (`select id from seller_public_profiles where store_name ilike '%pane quotidiano%'`) al momento dell'esecuzione. La
> route è `/store/<quel-uuid>`.

---

## 2) 📄 Pagina negozio Pane Quotidiano — testi esatti

**URL:** `/store/[PQ]`

**Title (≤60):**
`Pane Quotidiano — Bio e dietetico a Piacenza · MyCity` *(52 char)*

**Meta description (≤155):**
`Alimenti biologici, dietetici, senza glutine e vegan a Piacenza dal 1976 (Via Calzolai 25). Consegna a casa o ritiro. Ordina su MyCity.` *(134 char)*

**H1:**
`Pane Quotidiano — biologico e dietetico a Piacenza dal 1976`

**Come si ottengono nel codice attuale:** title/meta di `store/[id]/layout.tsx` sono **derivati dai campi DB**
(`store_name`, `store_description`, `store_address`). Riempiendo `store_description` con il testo qui sotto, title e
meta escono **automaticamente** keyword-ricchi (leva a rischio più basso, corsia CONFIG — vedi §5).

**`store_description` da scrivere nel DB (≈155 char, tutto vero):**
> *Pane Quotidiano: alimenti biologici e dietetici a Piacenza dal 1976, in Via Calzolai 25 (centro). Bio, senza glutine, vegan e macrobiotica — consegna a casa o ritiro su MyCity.*

---

## 3) 🧩 JSON-LD PRONTI DA INCOLLARE

### 3a) Pagina negozio — `Store` (LocalBusiness) arricchito + BreadcrumbList
Compilato con i dati **reali** di PQ. `[PQ]`, `[APP_URL]`, `[LOGO_URL]`, `[LAT]`/`[LNG]` = segnaposto da riempire in
esecuzione (UUID/URL veri; coordinate = geocodifica esatta di Via Calzolai 25, **non inventate**). **Nessun
`aggregateRating`**: PQ non ha ancora recensioni reali su MyCity → ometterlo (inventarlo = manual action Google).

```json
{
  "@context": "https://schema.org",
  "@type": "HealthFoodStore",
  "@id": "[APP_URL]/store/[PQ]#store",
  "name": "Pane Quotidiano",
  "description": "Alimenti biologici e dietetici a Piacenza dal 1976: bio, senza glutine, vegan, macrobiotica, dieta dei gruppi sanguigni, fitoterapici, cosmesi naturale e detersivi ecologici. Consegna a casa o ritiro su MyCity.",
  "image": "[LOGO_URL]",
  "url": "[APP_URL]/store/[PQ]",
  "telephone": "+39 0523 388601",
  "priceRange": "€€",
  "currenciesAccepted": "EUR",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Via Calzolai 25",
    "addressLocality": "Piacenza",
    "postalCode": "29121",
    "addressRegion": "PC",
    "addressCountry": "IT"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": "[LAT]", "longitude": "[LNG]" },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Friday","Saturday"], "opens": "09:00", "closes": "13:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Friday","Saturday"], "opens": "16:30", "closes": "19:30" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Thursday", "opens": "09:00", "closes": "13:00" }
  ],
  "sameAs": ["https://www.facebook.com/viacalzolai.piacenza"],
  "areaServed": { "@type": "City", "name": "Piacenza" }
}
```
> Nota orari: giovedì solo mattina (pomeriggio chiuso), domenica chiuso → semplicemente non compaiono. Questo è
> **il riflesso esatto della realtà** (fonte PagineGialle): schema onesto.

E il **BreadcrumbList** della pagina negozio (oggi manca nel JSON-LD del negozio — c'è solo nell'UI):
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "[APP_URL]/" },
    { "@type": "ListItem", "position": 2, "name": "Negozi", "item": "[APP_URL]/stores" },
    { "@type": "ListItem", "position": 3, "name": "Pane Quotidiano", "item": "[APP_URL]/store/[PQ]" }
  ]
}
```

### 3b) Pagina categoria (neutra) — CollectionPage + ItemList
Infrastruttura riusabile: vale per `alimentari` oggi (PQ dietro) e per ogni futura categoria. `[NAME]`/`[SLUG]` dinamici;
gli `item` dell'ItemList si popolano dai primi N prodotti realmente presenti (se 0 prodotti → **non emettere ItemList**,
solo CollectionPage, per non dichiarare una lista vuota).

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "[NAME] a Piacenza",
  "description": "[NAME] dai negozi di Piacenza su MyCity. Consegna a casa in 24-48h o ritiro in negozio.",
  "url": "[APP_URL]/category/[SLUG]",
  "isPartOf": { "@type": "WebSite", "name": "MyCity", "url": "[APP_URL]" },
  "about": { "@type": "Thing", "name": "[NAME]" },
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "url": "[APP_URL]/product/[ID_1]", "name": "[NOME_PRODOTTO_1]" }
    ]
  }
}
```
Il `BreadcrumbList` categoria **esiste già** (`category/[slug]/page.tsx`) → tenerlo, aggiungere solo il `CollectionPage`.

### 3c) Scheda prodotto — `Product`/`Offer` (già presente, va rifinito)
Il `Product` JSON-LD **c'è già** in `product/[id]/page.tsx`. Due rifiniture oneste da aggiungere all'`Offer`:
```json
{
  "priceValidUntil": "[YYYY-12-31]",
  "url": "[APP_URL]/product/[ID]",
  "itemCondition": "https://schema.org/NewCondition"
}
```
`aggregateRating` resta **gated sulle recensioni reali** (come già è): giusto così, non toccarlo.

---

## 4) 🩹 DIFF di codice concettuale (prima → dopo) — per file
Tutte **🟡 in branch del repo `marketplace/`, mai deploy**. Owner esecuzione: **frontend-dev** (UI/schema) con review
**tech**. Cancello: i test SEO esistenti `tests/e2e/06-seo-and-a11y.spec.ts`.

### `app/store/[id]/page.tsx` — schema negozio
| | Prima | Dopo |
|---|---|---|
| `@type` | `"Store"` fisso | data-driven: `"HealthFoodStore"`/`"GroceryStore"` per food-bio, fallback `"Store"` |
| `url` | `typeof window !== 'undefined' ? window.location.href : undefined` → **il crawler SSR vede `undefined`** 🐞 | URL canonico costruito server-side: `` `${APP_URL}/store/${store.id}` `` |
| `openingHours` | assente | aggiungere `openingHoursSpecification` (dai campi orari DB; per PQ i valori del §3a) |
| `priceRange` | assente | `"€€"` (o da campo DB se esiste) |
| `BreadcrumbList` | solo nell'UI `<Breadcrumb>` | emettere anche il JSON-LD `BreadcrumbList` del §3a |
| `@id` | assente | `` `${APP_URL}/store/${store.id}#store` `` (nodo referenziabile) |

> 🐞 Il bug `window.location.href` è il fix SEO tecnico n.1: oggi il campo `url` dello schema **non arriva mai a
> Googlebot** perché renderizzato lato server dove `window` è undefined. Va reso server-side.

### `app/category/[slug]/page.tsx` — schema categoria
| | Prima | Dopo |
|---|---|---|
| JSON-LD | solo `BreadcrumbList` | **aggiungere `CollectionPage` + `ItemList`** (§3b), popolato dai prodotti reali della griglia; se 0 prodotti → solo `CollectionPage` |
| breadcrumb `item` | path relativi (`/`, `/categorie`) | preferibile URL assoluti `[APP_URL]/...` per coerenza cross-schema |

### `app/store/[id]/layout.tsx` — metadata negozio
| | Prima | Dopo |
|---|---|---|
| title | `${name}${cityHint} — Acquista online · MyCity Piacenza` (può superare 60 char con nomi lunghi) | template più corto: `${name} — ${cityHint} · MyCity` e clamp a 60; per PQ = `Pane Quotidiano — Bio e dietetico a Piacenza · MyCity` |
| description | fallback generico se `store_description` vuota | (nessuna modifica codice necessaria) → **basta riempire `store_description`** nel DB (§2, corsia CONFIG) |

### `app/product/[id]/page.tsx` — schema prodotto
| | Prima | Dopo |
|---|---|---|
| `Offer` | `price`, `priceCurrency`, `availability`, `seller` | aggiungere `url`, `itemCondition`, `priceValidUntil` (§3c) |
| resto | ok, `aggregateRating` già gated | nessun'altra modifica |

### sitemap / robots
Già solidi: sitemap dinamica (categorie+store+prodotti approvati), robots blocca aree pro/checkout. **Nessuna modifica.**

---

## 5) 🎛️ Campi DB del negozio reale (corsia CONFIG, 🟡 reversibile con backup per riga)
Riempire i campi di PQ è la leva a **rischio più basso** perché migliora in un colpo title+meta+on-page+schema, senza
toccare codice. **Tocca il profilo di un negozio reale → 🟡, va nella coda con l'ok di Nicola.**

| Campo | Valore (tutto verificato oggi) | Fonte |
|---|---|---|
| `store_description` | testo del §2 | scelta ragionata su fatti PagineGialle/Terra Nuova |
| `store_address` | `Via Calzolai 25, 29121 Piacenza (PC)` | multi-fonte |
| `store_phone` | `0523 388601` | PagineGialle/PagineBianche |
| `store_lat` / `store_lng` | geocodifica esatta di Via Calzolai 25 — **da confermare, non invento coordinate** | Nominatim/Google |

---

## 6) 📍 Google Business Profile — 🔴 serve OK del titolare PQ + firma Nicola
La scheda PQ **esiste quasi certamente** (attività dal 1976, già su directory e Facebook). È il profilo del **negoziante**,
non nostro → **non lo tocchiamo senza il suo ok.**

| Azione (pronta, non eseguita) | Colore |
|---|---|
| Rivendicare/verificare la scheda "Pane Quotidiano, Via Calzolai 25". Categoria: **Negozio di alimenti naturali/biologici**. Orari reali (§3a). Foto. **Link alla vetrina MyCity**. Post: *"Ora consegniamo a domicilio con MyCity"*. | 🔴 OK titolare PQ + Nicola |
| Scheda **MyCity** come *service-area business* (zona Piacenza), categoria "Consegna spesa", descrizione keyword, link sito. | 🔴 firma Nicola |

---

## 7) 📈 Misura (zero numeri inventati)
Post go-live, in **Google Search Console** + **GBP Insights** (gratis): impression/click/posizione per le 5 query,
ricerche "scoperta" della scheda PQ. Target realistico 90 gg: top-3 locale per le query 1–2–4, prima pagina su 3 e 5.
Esito reale → lo scrivo in `memoria-squadra/seo.md` (loop chiuso).

## 📌 Riepilogo colori
- 🟢 questo documento, JSON-LD, testi, diff concettuali, template categoria = **fatti**.
- 🟡 patch codice (in branch, mai deploy) + riempimento campi DB di PQ = **pronti, da firmare**.
- 🔴 Google Business (PQ e MyCity) = **serve OK titolare + Nicola**.
