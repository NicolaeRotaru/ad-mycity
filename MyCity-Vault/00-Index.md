# 🗺️ MyCity Marketplace — Index (MOC)

> 🏠 Cerchi la **porta d'ingresso generale**? Apri **[[INIZIA-QUI]]**. Questa è la mappa di *dettaglio della conoscenza*.

> Vault di prodotto per portare **MyCity** da MVP (1 negozio) a marketplace locale reale.
> Modello mentale: **Amazon** (catalogo + fiducia) × **eBay** (venditori + reputazione) × **Glovo** (consegna locale live).

**Stato attuale:** il **prodotto è costruito al ~90%** ([[Roadmap & Stato Prodotto]]), ma con ~1 negozio e ~0 ordini. Il collo di bottiglia NON è il prodotto: è la **domanda/distribuzione**. Obiettivo immediato: (1) aggiungere altri negozi, (2) ricevere il primo ordine, (3) costruire fiducia.

> 🧭 **Come è organizzato il vault:** 6 cartelle tematiche + il dettaglio prodotto (Aree e Funzionalità). Gli approfondimenti originali, prima delle fusioni, sono in `_Archivio/`.

---

## 🧭 01 · Strategia
- [[Strategia & Fossato]] — Documento maestro: densità, volano a 2 lati, GTM, moat, network effects, 3 motori, 5 scommesse
- [[Decisioni Aperte]] — Trade-off e domande strategiche da risolvere (consegna, pagamenti, commissioni, nome…)
- [[Brand & Posizionamento]] — Appartenenza civica, naming, tono, tagline, fossato di marca

## 📈 02 · Mercato & Ricerca
- [[Mercato, Numeri & Contesto]] — Stato reale sul campo + TAM/SAM/SOM, concorrenza, GDO, ZTL, desertificazione, trend
- [[Botteghe del Centro - Mappa]] — Mappa delle botteghe alimentari del centro per categoria + DOP
- [[Casi Studio]] — Daje, Babaco, Cortilia, q-commerce: cosa imitare/evitare
- [[Bandi & Finanziamenti]] — Soldi pubblici per MyCity (⚠️ scadenze) — startup + B2B

## 🚀 03 · Clienti & Crescita
- [[Clienti, Personas & Crescita]] — I 3 lati, personas/JTBD, canali a costo ~0, 5 loop organici, angoli laterali, volano istituzionale, lancio 90gg
- [[Vendite & Acquisizione Negozi]] — `Sales` ICP, pipeline, carrello minimo vitale, pitch, bando come arma

## 📱 04 · Prodotto, Operazioni & Tech
- [[Roadmap & Stato Prodotto]] — Roadmap per priorità × audit del codice reale (24/26 feature fatte, i 3 buchi veri)
- [[Prodotto & UX]] — `Product` PWA, carrello multi-negozio, peso variabile, retention
- [[Operazioni & Logistica]] — `COO` cut-off D+1, cargo-bike, micro-hub, catena del freddo
- [[Tecnologia & Stack]] — `CTO` Supabase + Stripe Connect + Gemini + WhatsApp, costi
- 📂 `Aree/` e `Funzionalità/` — il dettaglio prodotto (le 7 aree funzionali + le 26 feature, vedi sotto)

## 💶 05 · Soldi, Metriche & Rischi
- [[Finanza & Unit Economics]] — `CFO` il conto del batching, break-even, proiezioni, capitale
- [[Metriche & KPI]] — `Data` North Star, KPI per area, coorti settimanali, i 7 numeri, esperimenti
- [[Rischi & Compliance]] — Pagamenti, HACCP, rider, fisco + rischi di business

## 🧩 06 · Piani & Deliverable
- [[Business Model Canvas]] — Il BMC compilato (9 blocchi multi-sided + Value Proposition Canvas + test assunzioni)
- [[Prompt - Business Model Canvas]] — Il prompt che lo genera (vista Strategyzer)
- [[Piano d'Azione]] — Piano operativo 90 giorni (ordini/conversione, densità)
- [[Piano di Notorieta 2026]] — Piano di notorietà: metà negozi + metà popolazione di Piacenza

## 🤖 07 · L'AD digitale (il cervello AI)
- [[AGENTI]] — Organigramma dei 19 senior digitali (chi fa cosa, con quali poteri)
- [[CULTURA-SQUADRA]] — I principi della squadra + le catene di collaborazione (team play)
- [[OKR-Squadra]] · [[PLAYBOOK-ECCEZIONI]] · [[RUBRICA-QUALITA]] — le 7 capacità (numeri, imprevisti, qualità)
- `CLAUDE.md` (radice) — Il manuale operativo dell'AD: regola 🟢🟡🔴, doer mode, squadra
- `.claude/agents/` — I 19 mansionari operativi (con doer mode + collaborazione)
- `cervello/` — Gli script per far girare l'AD da solo (giri, coda lavori, esecutore azioni)
- `consegne/` e `creativi/` — Dove i senior salvano i lavori finiti (testi e grafiche/QR)

## 🧠 90 · Memoria dell'AD (scrive lui)
- [[STATO]] — Cruscotto: i 7 numeri chiave + ultime mosse (aggiornato dall'AD)
- [[SALA-OPERATIVA]] — Il canale condiviso della squadra (richieste, handoff, "fatto")
- [[AZIONI-IN-ATTESA]] — Coda delle azioni 🟡/🔴 pronte, in attesa della firma di Nicola
- [[DECISIONI]] — Registro append-only delle decisioni 🟡/🔴 (tracciabilità)
- `90-Memoria-AI/Briefing/` — Un file per ogni giro di perlustrazione
- [[Collegamento-AD]] — Come collegare il Pannello di Controllo web (cartella `pannello/`) a questo vault

---

## 🧭 Aree funzionali (Map of Content → `04-Prodotto-Ops/Aree`)
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

## 🔢 Sequenza consigliata (il "primo anello", → `04-Prodotto-Ops/Funzionalità`)
1. [[Onboarding Venditori Self-Service]] → servono più negozi
2. [[Gestione Catalogo e Listing]] → servono prodotti vendibili
3. [[Ricerca e Navigazione Catalogo]] + [[Scheda Prodotto]] → il cliente trova cosa comprare
4. [[Carrello e Checkout]] + [[Pagamenti e Payout Venditori]] → arriva il primo ordine
5. [[Zone di Consegna e Geolocalizzazione]] + [[Gestione Stato Ordine]] → l'ordine viene consegnato
6. [[Notifiche Transazionali]] → cliente e negozio sanno cosa succede

---
#mvp #moc
