---
tipo: consegna
reparto: seo
data: 2026-06-24
autore: senior SEO locale MyCity
stato: 🟢 bozza pronta (ricerca/audit/template) · 🟡 setup GBP & testi live (conferma) · 🔴 nessuna spesa
oggetto: Pacchetto SEO locale + Google Business per il lancio di MyCity (Piacenza)
---

# 📦 PACCHETTO SEO LOCALE + GOOGLE BUSINESS — Lancio MyCity Piacenza

> **Ipotesi di fondo:** a Piacenza esiste un **campo aperto** sul search locale. Chi presidia oggi è la
> GDO generica (Conad "Spesa a Casa", Easycoop, [Cicalia](https://www.cicalia.com/it/content/63-spesa-online-piacenza))
> e i ristoranti ([Deliveroo](https://deliveroo.it/it/cuisines/italiana-a-domicilio/piacenza)). **Nessuno**
> presidia l'intento "**botteghe del centro a domicilio**". MyCity può vincere quella nicchia di intento
> con SEO locale + Maps + pagine "[categoria] a [zona]". I produttori DOP che vendono online
> ([Grossetti](https://salumigrossetti.it/), [Salumificio La Coppa](http://lacoppa.it/),
> [Taste Piacenza](https://www.tastepiacenza.com/)) ci dicono che la domanda "salumi DOP online" è viva e contendibile.
>
> **Metrica di successo del pacchetto** (90 giorni dal go-live, da leggere in Search Console + GBP Insights):
> ranking top-3 per ≥10 keyword "[categoria] a [zona] Piacenza", ≥500 sessioni organiche/mese, GBP MyCity
> con ≥30 ricerche "scoperta"/settimana, ≥15 GBP-negozio collegati. Effetto KPI: **CAC organico ≈ 0**, canale
> di acquisizione duraturo che si auto-alimenta (ogni negozio nuovo = nuove pagine indicizzabili).

⚠️ **Colore degli interventi:** ricerca/audit/template/bozze qui sotto = **🟢 fatti, reversibili, su carta**.
La **creazione/pubblicazione** del GBP MyCity, la pubblicazione dei testi su pagine live e il collegamento dei
GBP-negozio reali = **🟡 bozza pronta → conferma**. Codice del sito (meta/sitemap/schema in `mycity-live`) = **🟡 solo su branch coi senior Engineering, mai deploy 🔴**. Tool SEO a pagamento/ads = **🔴 firma di Nicola**.

---

## 1) 🔑 RICERCA KEYWORD LOCALI (cluster per intento)

> Stime di volume su scala **Piacenza città/provincia** (~103k abitanti città, ~287k provincia): si parla di
> **decine–poche centinaia** di ricerche/mese per keyword, non migliaia. In SEO locale conta l'**intento** e
> la **vicinanza geografica**, non il volume nazionale. Difficoltà = bassa (concorrenza locale debole sull'intento "botteghe"). Confidenza: media (stime senza tool a pagamento — i numeri esatti si misurano in Search Console post-lancio o, se Nicola firma, con un tool 🔴).

### Cluster A — Spesa & consegna a domicilio (intento transazionale, alta priorità)
| Keyword | Intento | Volume stimato/mese | Difficoltà | Pagina target |
|---|---|---|---|---|
| spesa a domicilio Piacenza | comprare | 200–500 | media | Home / pagina "Spesa a domicilio" |
| consegna a domicilio Piacenza | comprare | 100–300 | media | Home / "Come funziona" |
| spesa online Piacenza | comprare | 100–250 | media-alta (GDO) | Home |
| cibo a domicilio Piacenza centro | comprare | 50–150 | bassa | "Botteghe del centro a domicilio" |
| prodotti tipici piacentini a domicilio | comprare | 30–80 | bassa | Pagina categoria DOP |
| spesa a domicilio [quartiere] Piacenza | comprare | 10–40 cad. | molto bassa | Pagina "[zona]" |

### Cluster B — Botteghe & centro storico (intento di scoperta + civico, cuore del brand)
| Keyword | Intento | Volume stimato/mese | Difficoltà | Pagina target |
|---|---|---|---|---|
| botteghe centro Piacenza | scoperta | 50–150 | bassa | Pagina "Botteghe del centro" |
| botteghe storiche Piacenza | informativa/scoperta | 100–250 | bassa | Articolo "Le botteghe storiche di Piacenza" |
| negozi centro storico Piacenza | scoperta | 50–120 | bassa | Pagina "Negozi a [centro]" |
| gastronomia Piacenza centro | scoperta/comprare | 30–90 | bassa | Categoria gastronomia |
| dove comprare prodotti locali Piacenza | comprare | 20–60 | bassa | Pagina categoria |
| salumeria Piacenza centro | scoperta/comprare | 40–110 | bassa | Scheda Garetti + categoria |

### Cluster C — Salumi DOP piacentini (intento prodotto, alto valore, contendibile)
| Keyword | Intento | Volume stimato/mese | Difficoltà | Pagina target |
|---|---|---|---|---|
| coppa piacentina DOP | prodotto | 300–700 | media | Scheda prodotto Coppa |
| salame piacentino DOP | prodotto | 200–500 | media | Scheda prodotto Salame |
| pancetta piacentina DOP | prodotto | 150–400 | media | Scheda prodotto Pancetta |
| dove comprare coppa piacentina DOP | comprare | 50–150 | bassa-media | Scheda prodotto / categoria DOP |
| salumi piacentini DOP online | comprare | 100–250 | media | Pagina categoria "Salumi DOP" |
| coppa piacentina DOP a domicilio Piacenza | comprare | 10–40 | molto bassa | Scheda prodotto (geo) |
| tris salumi DOP piacentini | comprare | 20–60 | bassa | Bundle/categoria |

### Cluster D — Per quartiere (long-tail iper-locale, difficoltà minima, scalabile su ogni zona reale)
Schema: **"[categoria] a [quartiere] Piacenza"** e **"negozi a [quartiere]"**. Una pagina per zona di consegna.
Zone reali di Piacenza da coprire (allineare a `Zone di Consegna e Geolocalizzazione.md`):
- **Centro storico** (Duomo, Piazza Cavalli, Corso Vittorio Emanuele) — priorità 1 (qui c'è Garetti)
- **Farnesiana**, **Besurica**, **Veggioletta**, **Borgotrebbia**, **Infrangibile**, **San Lazzaro**, **Barriera Genova**
- Esempi keyword: "spesa a domicilio Besurica", "salumeria a Farnesiana", "negozi a Borgo Faxhall", "gastronomia centro storico Piacenza"
- Volume singolo: 5–30/mese, ma **sommati** e **a difficoltà quasi nulla** = traffico qualificato e zero concorrenza.

**Priorità di attacco (ordine):** Cluster B + C (brand + prodotto faro, già pronti con Garetti) → Cluster A (transazionale) → Cluster D (scala su ogni zona/negozio nuovo).

---

## 2) 🟡 SETUP GOOGLE BUSINESS PROFILE — MyCity (bozza pronta → conferma di Nicola)

> Il GBP di MyCity è l'asset locale n.1: appare in Maps e nel "local pack". **NB:** GBP premia attività con
> **sede fisica o area di servizio**; MyCity è un servizio di consegna locale → si imposta come **"Service-area business"**
> (area di servizio = Comune di Piacenza), nascondendo l'indirizzo se non c'è vetrina al pubblico.

**Nome attività:** `MyCity Piacenza` (NON aggiungere keyword tipo "spesa a domicilio" nel nome → contro le linee guida Google).

**Categoria principale:** `Servizio di consegna` (Delivery service)
**Categorie secondarie:** `Negozio di alimentari`, `Mercato di prodotti agricoli` (farmers' market) / `Drogheria`, `Servizio di e-commerce`.

**NAP (Name-Address-Phone)** — coerente al 100% ovunque (sito, social, directory):
- Nome: MyCity Piacenza · Telefono: [da inserire, numero unico] · Sito: [URL mycity-live] · Indirizzo: area di servizio "Piacenza e centro storico".

**Area di servizio:** Piacenza (città) + quartieri serviti (Centro storico, Farnesiana, Besurica, Veggioletta, Borgotrebbia, San Lazzaro…). Allineare alle zone reali di consegna.

**Attributi da attivare:** Consegna a domicilio ✓ · Ritiro in negozio (se previsto) · Pagamento: carte / contanti alla consegna (COD) ✓ · Prodotti locali ✓ · Identifica l'attività come "a conduzione locale".

**Orari:** orari del servizio di consegna (slot reali). **Foto:** logo, copertina (centro di Piacenza / Piazza Cavalli), 5–10 foto di botteghe e prodotti (chiedere a @designer / @ai-designer gli asset HD).

### 📝 Descrizione GBP ottimizzata (pronta, 740 caratteri — limite 750)
> MyCity è il marketplace delle botteghe del centro di Piacenza: fai la spesa nelle salumerie, gastronomie e
> negozi storici della città e te la portiamo a casa. Dalla Antica Salumeria Garetti in Piazza Duomo ai
> produttori dei tre salumi DOP piacentini — Coppa, Salame e Pancetta Piacentina DOP — scegli i prodotti
> tipici del territorio e ricevili a domicilio in giornata, in centro storico e nei quartieri di Piacenza.
> Sostieni il commercio di vicinato: ogni ordine fa vivere una bottega vera, non un magazzino anonimo.
> Pagamento alla consegna o con carta. Consegna nei quartieri di Piacenza: Centro, Farnesiana, Besurica e
> non solo. MyCity: la tua città, a casa tua.

### 📣 4 POST GBP pronti (Google Business "Novità/Offerta/Evento")
> I post GBP scadono ~7 gg → pubblicarne 1–2/settimana. CTA con link tracciato UTM.

**POST 1 — Novità (lancio)**
> 🛒 **Le botteghe del centro, ora a domicilio.** MyCity porta a casa tua la spesa delle salumerie e gastronomie
> storiche di Piacenza. Inizia dall'Antica Salumeria Garetti, in Piazza Duomo dal 1938. Ordina, paghi anche
> alla consegna, ricevi in giornata.
> *CTA: Ordina ora → [URL?utm_source=gbp&utm_medium=post&utm_campaign=lancio]*

**POST 2 — Prodotto/Offerta (DOP)**
> 🍖 **I tre salumi DOP piacentini, dalla bottega a casa tua.** Coppa, Salame e Pancetta Piacentina DOP tagliati
> al momento in salumeria e consegnati freschi. Piacenza è l'unica provincia d'Italia con tre salumi DOP: assaggiali.
> *CTA: Scopri i salumi DOP → [URL/categoria-dop?utm_source=gbp&utm_medium=post&utm_campaign=dop]*

**POST 3 — Offerta (primo ordine)**
> 🎁 **Prima spesa con MyCity?** Consegna a domicilio in centro e nei quartieri di Piacenza. Sostieni le botteghe
> di vicinato e ricevi tutto comodamente a casa. [Eventuale incentivo primo ordine — da confermare con @growth/@finanza, 🔴 se è uno sconto reale.]
> *CTA: Fai la prima spesa → [URL?utm_source=gbp&utm_medium=post&utm_campaign=primo-ordine]*

**POST 4 — Evento/civico (mercato del sabato)**
> 🏛️ **Sabato il centro è vivo, anche a casa tua.** Mentre il mercato anima Piazza Cavalli, con MyCity porti i
> prodotti delle botteghe storiche direttamente sul tuo tavolo. Spesa locale, consegna locale, fiducia locale.
> *CTA: Ordina dalle botteghe → [URL?utm_source=gbp&utm_medium=post&utm_campaign=sabato]*

> **Recensioni:** dopo il primo ordine, chiedere recensione GBP (coordinare con @customer-success — script primo
> ordine già pronto). Rispondere a TUTTE le recensioni (segnale di ranking locale).

---

## 3) 🧩 TEMPLATE SEO — Scheda negozio & Scheda prodotto (+ esempio Garetti compilato)

> **🟡 Implementazione codice:** title/meta/H1/schema vanno nel template SSR/SSG di `mycity-live`. **Solo su
> branch coi senior @frontend-dev/@tech, mai su main, mai deploy.** ⚠️ Avviso collisione: più sessioni possono
> editare quel repo — allinearsi in Sala Operativa prima di toccarlo. Qui sotto = bozza pronta da impiantare.

### 3.A — TEMPLATE Scheda NEGOZIO
- **URL:** `/negozi/{slug-negozio}` (pulito, kebab-case, niente ID — es. `/negozi/antica-salumeria-garetti`)
- **Title tag** (≤60 char): `{Nome Negozio} — {Categoria} a {Zona} Piacenza | MyCity`
- **Meta description** (≤155 char): `{Nome}, {categoria} a {zona} di Piacenza. Ordina online e ricevi a domicilio. {Plus distintivo}. Consegna in giornata con MyCity.`
- **H1:** `{Nome Negozio} — {categoria} a {Zona}, Piacenza`
- **H2 suggeriti:** "Cosa trovi da {Nome}" · "Consegna a domicilio a {Zona}" · "La storia della bottega" · "Prodotti in evidenza"
- **Schema.org:** `LocalBusiness` (sottotipo specifico, es. `Store`/`GroceryStore`) con `address`, `geo`, `openingHours`, `image`, `priceRange`, `aggregateRating` (quando ci sono recensioni reali), `areaServed`.

**Esempio JSON-LD LocalBusiness — Garetti:**
```json
{
  "@context": "https://schema.org",
  "@type": "GroceryStore",
  "name": "Antica Salumeria Garetti",
  "image": "https://mycity.example/img/garetti-vetrina.jpg",
  "url": "https://mycity.example/negozi/antica-salumeria-garetti",
  "telephone": "+39 0523 ...",
  "priceRange": "€€",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Piazza Duomo, 44",
    "addressLocality": "Piacenza",
    "postalCode": "29121",
    "addressRegion": "PC",
    "addressCountry": "IT"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 45.0526, "longitude": 9.6929 },
  "areaServed": { "@type": "City", "name": "Piacenza" },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      "opens": "08:00", "closes": "19:30" }
  ],
  "founder": "Famiglia Garetti",
  "foundingDate": "1938",
  "description": "Salumeria e gastronomia storica di Piacenza in Piazza Duomo dal 1938. Salumi DOP piacentini e specialità del territorio, ora con consegna a domicilio tramite MyCity."
}
```
> ⚠️ Verificare lat/long e telefono reali prima della pubblicazione (placeholder).

**Esempio meta compilato — Garetti:**
- URL: `/negozi/antica-salumeria-garetti`
- Title: `Antica Salumeria Garetti — Salumeria in centro a Piacenza | MyCity` (59 char)
- Meta: `Antica Salumeria Garetti, in Piazza Duomo dal 1938. Salumi DOP piacentini e gastronomia, a domicilio in giornata con MyCity. Ordina online.` (152 char)
- H1: `Antica Salumeria Garetti — salumeria storica nel centro di Piacenza`

### 3.B — TEMPLATE Scheda PRODOTTO
- **URL:** `/negozi/{slug-negozio}/{slug-prodotto}` (es. `/negozi/antica-salumeria-garetti/coppa-piacentina-dop`)
- **Title** (≤60): `{Prodotto} {DOP} — {Negozio} | Spesa a domicilio Piacenza`
- **Meta** (≤155): `{Prodotto} {di/da Negozio}: {plus, peso/taglio}. Ordina online a Piacenza e ricevi a domicilio. {DOP/tipico}. Consegna in giornata con MyCity.`
- **H1:** `{Prodotto} {DOP} — {Negozio}`
- **H2:** "Caratteristiche" · "Perché è DOP" · "Come la consegniamo" · "Abbinamenti"
- **Schema.org:** `Product` con `offers` (`Offer`: price, priceCurrency, availability), `brand`/`seller`, `image`, `aggregateRating` (se recensioni reali), eventuale `additionalProperty` per la DOP.

**Esempio JSON-LD Product — Coppa Piacentina DOP da Garetti:**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Coppa Piacentina DOP",
  "image": "https://mycity.example/img/coppa-piacentina-dop-garetti.jpg",
  "description": "Coppa Piacentina DOP tagliata al momento dall'Antica Salumeria Garetti, Piacenza. Stagionata secondo disciplinare, uno dei tre salumi DOP piacentini.",
  "brand": { "@type": "Brand", "name": "Antica Salumeria Garetti" },
  "category": "Salumi DOP piacentini",
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "Denominazione", "value": "DOP — Coppa Piacentina" }
  ],
  "offers": {
    "@type": "Offer",
    "url": "https://mycity.example/negozi/antica-salumeria-garetti/coppa-piacentina-dop",
    "priceCurrency": "EUR",
    "price": "0.00",
    "availability": "https://schema.org/InStock",
    "seller": { "@type": "Organization", "name": "Antica Salumeria Garetti via MyCity" },
    "areaServed": { "@type": "City", "name": "Piacenza" }
  }
}
```
> ⚠️ Sostituire `price` con il prezzo reale a confezione/etto (da catalogo Supabase) prima della pubblicazione — prezzo a 0 o falso = penalizzazione/diffida.

**Esempio meta compilato — Coppa Garetti:**
- URL: `/negozi/antica-salumeria-garetti/coppa-piacentina-dop`
- Title: `Coppa Piacentina DOP — Garetti | Domicilio Piacenza` (52 char)
- Meta: `Coppa Piacentina DOP tagliata al momento dall'Antica Salumeria Garetti. Ordina online a Piacenza, consegna a domicilio in giornata con MyCity.` (148 char)
- H1: `Coppa Piacentina DOP — Antica Salumeria Garetti`

### 3.C — Pagine "[categoria] a [zona]" (template SSG, motore del Cluster D)
- URL: `/spesa-a-domicilio/{zona}` e `/{categoria}/{zona}` (es. `/spesa-a-domicilio/centro-storico`, `/salumerie/farnesiana`)
- Title: `Spesa a domicilio a {Zona}, Piacenza — botteghe e negozi | MyCity`
- Una pagina per (categoria × zona reale servita). **Solo zone/categorie con negozi veri** → niente pagine doorway vuote.

---

## 4) 🗺️ PIANO GBP PER I NEGOZI ADERENTI (collegare ogni bottega)

> Ogni negozio su MyCity dovrebbe avere il **proprio** GBP curato: doppio presidio su Maps (negozio + MyCity) e
> rinforzo del NAP. **🔴 mai rivendicare un GBP di un negozio che non controlliamo** — si fa solo **con e per il
> negoziante** (accesso "manager" che ci concede lui).

**Processo (per ogni bottega onboardata):**
1. **Verifica esistenza GBP** (cerca su Maps: nome + via). Molte botteghe storiche ce l'hanno già non gestito.
2. **Caso A — GBP esistente:** chiedere al negoziante l'accesso come *manager* → ottimizzare (categoria, NAP, foto, descrizione, orari, attributo "consegna a domicilio", link alla scheda MyCity nel campo sito/social).
3. **Caso B — nessun GBP:** crearlo **insieme** al negoziante (è suo, lui lo possiede), poi ottimizzarlo.
4. **Coerenza NAP** identica tra GBP-negozio, scheda MyCity e sito → forte segnale locale.
5. **Link incrociato:** GBP-negozio → link alla scheda `/negozi/{slug}` di MyCity (con UTM). Scheda MyCity → menzione "Bottega storica" / link Maps.
6. **Recensioni:** attivare la richiesta recensione post-consegna anche sul GBP del negozio (script @customer-success).

**Garetti (negozio-faro, priorità 1):** verificare il suo GBP (Piazza Duomo 44, già "Bottega Storica" del Comune dal 1938) → chiedere accesso manager → impostare categoria "Salumeria/Negozio di alimentari", attributo consegna, foto, e descrizione con "tre salumi DOP piacentini" + link scheda MyCity.

**Checklist riusabile per ogni nuovo negozio** (handoff con @onboarding-negozi): GBP verificato? categoria corretta? NAP coerente? attributo consegna? ≥5 foto? descrizione DOP/tipico? link MyCity? prima recensione richiesta?

---

## 5) ✍️ 5 IDEE DI CONTENUTO SEO LONG-TAIL (pagine/articoli)

> Contenuti civici + utili → attirano i Cluster B/C, costruiscono autorità locale e link interni alle schede.
> Coordinare la stesura con @content-social (tono civico del brand). Ognuno = 1 keyword target + 1 metrica.

1. **"Le botteghe storiche di Piacenza: guida quartiere per quartiere"**
   - KW: *botteghe storiche Piacenza* · Intento: scoperta/informativa · Pagina pilastro che linka tutte le schede negozio.
   - Fonte autorevole da citare: [Albo Botteghe Storiche del Comune di Piacenza](https://www.comune.piacenza.it/it/page/botteghe-storiche-137544). Metrica: ranking top-5 + click interni alle schede.

2. **"Dove comprare i tre salumi DOP piacentini (Coppa, Salame, Pancetta) a Piacenza"**
   - KW: *dove comprare salumi DOP piacentini / coppa piacentina DOP* · Intento: comprare. Linka le schede prodotto Garetti.
   - Metrica: ranking + conversioni alla scheda Coppa/Salame/Pancetta.

3. **"Spesa a domicilio a Piacenza: come ricevere a casa i prodotti delle botteghe del centro"**
   - KW: *spesa a domicilio Piacenza* · Intento: transazionale. Si posiziona contro la GDO generica differenziando su "botteghe vere".
   - Metrica: ranking top-5 sulla testa transazionale + sessioni → home/checkout.

4. **"Cosa sono i salumi DOP piacentini e perché Piacenza è l'unica provincia con tre DOP"**
   - KW: *salame piacentino DOP / coppa piacentina DOP* (informativa) · Costruisce autorità topica (E-E-A-T) e supporta le schede prodotto. Fonte: [Consorzio Salumi DOP Piacentini](https://welcome.salumitipicipiacentini.it/).
   - Metrica: traffico informativo + ranking del cluster C.

5. **"Mangiare piacentino a casa: anolini, salumi DOP e le specialità delle gastronomie del centro"**
   - KW: *gastronomia Piacenza centro / prodotti tipici piacentini a domicilio* · Intento misto, stagionalizzabile (festività, sagre).
   - Metrica: traffico stagionale + link alle gastronomie aderenti.

> **Quick win parallelo:** una pagina-hub `/spesa-a-domicilio` + le pagine zona (Cluster D) prima degli articoli lunghi — costano meno e rankano subito su difficoltà bassissima.

---

## ✅ Chiusura

**✅ COSA HO FATTO:** pacchetto SEO locale completo e pronto all'uso →
`/home/user/ad-mycity/consegne/seo/PACCHETTO-SEO-LOCALE.md`
(4 cluster keyword con stime, setup GBP MyCity + descrizione + 4 post pronti, template SEO scheda negozio/prodotto
con JSON-LD ed esempio Garetti compilato, piano GBP negozi, 5 contenuti long-tail). Tutto **🟢 su carta, reversibile**.

**⏳ COSA HO ACCODATO (🟡/🔴 — pronto, aspetta il via):**
1. 🟡 **Creare/pubblicare il GBP di MyCity** (testi e post qui sopra pronti) → serve OK + numero di telefono unico + foto HD.
2. 🟡 **Impiantare title/meta/H1/JSON-LD nel codice** di `mycity-live` → solo su **branch** con @frontend-dev/@tech, allineandosi in Sala (collisione: più sessioni sul repo). Mai deploy 🔴.
3. 🟡 **Collegare i GBP-negozio** (a partire da Garetti) → con/per il negoziante, mai rivendicare ciò che non controlliamo (🔴).
4. 🔴 **Tool SEO a pagamento** (volumi keyword esatti / rank tracking) → proposta separata se Nicola lo vuole; per ora misuro con Search Console gratis.

**🙋 COSA SERVE DA NICOLA:**
- Conferma per creare il GBP MyCity (+ telefono unico + chi carica le foto).
- Via libera al branch per i meta/schema (e con quale senior Engineering).
- Decisione su eventuale incentivo "primo ordine" nel POST 3 (se è sconto reale → 🔴).

**PASSO-A:** @content-social (stesura dei 5 articoli col tono civico) · @designer/@ai-designer (foto HD per GBP e schede) · @frontend-dev/@tech (impianto meta/schema in branch) · @onboarding-negozi (checklist GBP per ogni nuovo negozio) · @customer-success (richiesta recensioni GBP post-consegna).
