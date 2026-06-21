# 🗺️ MyCity Marketplace — Index (MOC)

> Vault di prodotto per portare **MyCity** da MVP (1 negozio) a marketplace locale reale.
> Modello mentale: **Amazon** (catalogo + fiducia) × **eBay** (venditori + reputazione) × **Glovo** (consegna locale live).

**Stato attuale:** il **prodotto è costruito al ~90%** (vedi [[26-Audit-Codice-vs-Roadmap]]), ma con ~1 negozio e ~0 ordini. Il collo di bottiglia NON è il prodotto: è la **domanda/distribuzione**. Obiettivo immediato: (1) aggiungere altri negozi, (2) ricevere il primo ordine, (3) costruire fiducia.

---

## 📌 Note di navigazione
- [[01-Roadmap]] — Cosa costruire SUBITO dopo il primo negozio (tabella priorità)
- [[04-Metriche]] — North Star Metric + KPI per area
- [[05-Decisioni-Aperte]] — Trade-off e domande da risolvere
- [[06-Contesto-Piacenza]] — La realtà sul campo (negozi reali, concorrenza, fondatore)
- [[07-Strategia-Piacenza]] — Go-to-market: densità, cluster, negozi target, pitch, onboarding
- [[08-Domanda-Primi-Clienti]] — Da dove arrivano i PRIMI clienti (il lato domanda)
- [[09-Ricerca-Mercato-e-Numeri]] — Dati reali, concorrenza, unit economics, break-even (il "cervello imprenditore")
- [[26-Audit-Codice-vs-Roadmap]] — 🔍 Stato REALE del codice: cosa è già costruito (24/26 feature fatte) vs i 3 buchi veri

## 🔬 Ricerche di mercato approfondite
- [[10-Commercio-Piacenza]] — Tessuto retail, ZTL, desertificazione, ecosistema istituzionale
- [[11-Botteghe-Mappa]] — Mappa botteghe alimentari del centro per categoria + DOP
- [[12-Bandi-e-Finanziamenti]] — Soldi pubblici per MyCity (⚠️ scadenze) — startup + B2B
- [[13-Casi-Studio]] — Daje, Babaco, Cortilia, q-commerce: cosa imitare/evitare
- [[14-Consumatori-e-Angoli-Laterali]] — Anziani soli, ZTL, DOP-export, welfare, studenti
- [[15-Rischi-e-Compliance]] — Pagamenti, HACCP, rider, fisco + rischi di business

## 🧑‍💼 Board dei dirigenti (analisi per funzione)
- [[16-Finanza-e-Unit-Economics]] `CFO` — il conto del batching, break-even, proiezioni, capitale
- [[17-Prodotto-e-UX]] `Product` — PWA, carrello multi-negozio, peso variabile, retention
- [[18-Operazioni-e-Logistica]] `COO` — cut-off D+1, cargo-bike, micro-hub, catena del freddo
- [[19-Marketing-e-Crescita]] `CMO` — canali a basso costo, growth loops, lancio 90 giorni
- [[20-Tecnologia-e-Stack]] `CTO` — Supabase + Stripe Connect + Gemini + WhatsApp, costi
- [[21-Vendite-Negozi-B2B]] `Sales` — ICP, pipeline, carrello minimo vitale, bando come arma
- [[22-Strategia-e-Fossato]] `CSO` — moat, network effects, 3 motori, 5 scommesse
- [[23-Metriche-e-KPI]] `Data` — North Star, coorti settimanali, i 7 numeri, esperimenti
- [[24-Personas-e-JTBD]] `Insight` — beachhead Giulia, assunzioni da validare, Mom Test
- [[25-Brand-e-Posizionamento]] `Brand` — appartenenza civica, naming, tono, fossato di marca

## 🧭 Aree funzionali (Map of Content)
- [[Area - Venditori]] `#ebay` → come far entrare e crescere i negozi
- [[Area - Catalogo]] `#amazon` → prodotti, ricerca, schede
- [[Area - Consegna]] `#glovo` → zone, slot, tracking, rider
- [[Area - Pagamenti]] `#amazon #ebay` → checkout, payout, rimborsi
- [[Area - Fiducia]] `#amazon #ebay` → recensioni, reputazione, dispute, supporto
- [[Area - Crescita]] `#amazon` → acquisizione, retention, promozioni
- [[Area - Ops]] `#glovo` → operations, dashboard, monitoraggio

## 🎯 I 3 esperti del panel
- **Esperto Amazon** → catalogo, ricerca, recensioni, logistica, retention
- **Esperto eBay** → onboarding venditori, reputazione, listing, pagamenti, dispute
- **Esperto Glovo** → consegna locale, tracking live, geolocalizzazione, operations

## 🔢 Sequenza consigliata (il "primo anello")
1. [[Onboarding Venditori Self-Service]] → servono più negozi
2. [[Gestione Catalogo e Listing]] → servono prodotti vendibili
3. [[Ricerca e Navigazione Catalogo]] + [[Scheda Prodotto]] → il cliente trova cosa comprare
4. [[Carrello e Checkout]] + [[Pagamenti e Payout Venditori]] → arriva il primo ordine
5. [[Zone di Consegna e Geolocalizzazione]] + [[Gestione Stato Ordine]] → l'ordine viene consegnato
6. [[Notifiche Transazionali]] → cliente e negozio sanno cosa succede

---
#mvp #moc
