# 🚦 Roadmap & Stato del Prodotto

> Unisce la **roadmap per priorità** (cosa sblocca il prossimo passo) con l'**audit del codice reale** (cosa è già costruito). Mappatura sul repo `NicolaeRotaru/mycity` (clone `mycity-live`, package `piacenza-market`), eseguita 2026-06-17. Stack → [[Tecnologia & Stack]].

## 🧭 Verdetto in una riga
**Il prodotto è costruito al ~90%: 24 feature FATTE, 2 PARZIALI, 0 mancanti — più ~24 feature extra non in roadmap.**
➡️ **Il collo di bottiglia per crescere NON è il prodotto: è la domanda/distribuzione.** Conferma [[Clienti, Personas & Crescita]]. Il 95% dell'energia va su acquisizione negozi + ordini reali, **non** su nuove feature.

## 🧱 La logica di priorità (un marketplace è un volano a 2 lati)
1. **Aggiungere altri negozi** → offerta (lato venditore)
2. **Ricevere il primo ordine** → transazione (lato cliente)
3. **Costruire fiducia** → ripetizione (entrambi i lati)
> Ordinata per **cosa sblocca il prossimo passo**, non per quanto è "figa" la feature. Senza negozi non c'è offerta; senza ordini i negozi se ne vanno; senza fiducia non ci sono ordini ripetuti.

## 📊 Le 26 feature: priorità roadmap × stato nel codice

### Fase MVP+1 — "Far girare il volano" (P0)
| # | Feature | Area | Fonte | Stato | Prova nel codice |
|---|---|---|---|---|---|
| 1 | [[Onboarding Venditori Self-Service]] | Venditori | eBay | ✅ FATTA | `/api/auth/signup`, migration 021 (approval+KYC) |
| 2 | [[Dashboard Venditore]] | Venditori | eBay | ✅ FATTA | `/seller/*` (orders, products, earnings, analytics) |
| 3 | [[Gestione Catalogo e Listing]] | Catalogo | Amazon | ✅ FATTA | `/seller/products/*`, products + search_tsv |
| 4 | [[Scheda Prodotto]] | Catalogo | Amazon | ✅ FATTA | `/product/[id]` + opengraph-image SEO |
| 5 | [[Ricerca e Navigazione Catalogo]] | Catalogo | Amazon | ✅ FATTA | `/search`, FTS italiano + pg_trgm (027) |
| 6 | [[Carrello e Checkout]] | Pagamenti | Amazon | ✅ FATTA | `/cart`, `/checkout`, pending_checkouts multi-seller (042) |
| 7 | [[Pagamenti e Payout Venditori]] | Pagamenti | eBay | ✅ FATTA | Stripe Connect `/api/stripe/connect/*`, COD (024,097), payout post-delivery |
| 8 | [[Zone di Consegna e Geolocalizzazione]] | Consegna | Glovo | ✅ FATTA | zone_codes (033) per CAP, user_addresses lat/lng (014) |
| 9 | [[Gestione Stato Ordine]] | Ops | Glovo | ✅ FATTA | delivery_status 8 stati + timestamp per fase (011) |
| 10 | [[Notifiche Transazionali]] | Crescita | Glovo | ✅ FATTA | notifications (008), email_queue (033), push (027), cron |

### Fase Scala — "Renderlo affidabile e ripetibile" (P1)
| # | Feature | Area | Fonte | Stato | Prova nel codice |
|---|---|---|---|---|---|
| 11 | [[Tracking Live Consegna]] | Consegna | Glovo | ✅ FATTA* | rider_lat/lng realtime (011); *manca UI mappa lato cliente* |
| 12 | [[Gestione Rider e Pool Fattorini]] | Consegna | Glovo | ✅ FATTA* | ruolo rider, auto-assegnazione READY; *app rider scheletrica* |
| 13 | [[Slot di Consegna e Disponibilità]] | Consegna | Glovo | ✅ FATTA | store_hours (010), email scheduling (033) |
| 14 | [[Recensioni e Rating Prodotti]] | Fiducia | Amazon | ✅ FATTA | reviews (001), store/rider reviews (014), foto (030) |
| 15 | [[Reputazione Venditore]] | Fiducia | eBay | ✅ FATTA | approval_status + KYC (021), rating aggregato |
| 16 | [[Verifica e KYC Venditori]] | Fiducia | eBay | ✅ FATTA | `/api/kyc/*`, bucket kyc (041), provider Stripe |
| 17 | [[Gestione Resi e Rimborsi]] | Pagamenti | Amazon | ✅ FATTA | tabella returns (024), `/api/returns/*`, refund Stripe |
| 18 | [[Customer Support e Centro Assistenza]] | Fiducia | Amazon | ✅ FATTA | chat buyer-seller, `/admin/support-chat`, `/api/contact` |
| 19 | [[Gestione Inventario e Disponibilità]] | Catalogo | Amazon | ⚠️ PARZIALE | solo `status` available/sold; **niente quantità per SKU** |
| 20 | [[Dashboard Operativa]] | Ops | Glovo | ✅ FATTA | `/admin/orders`, `/admin/today`, audit log (027) |

### Fase Maturità — "Crescere e difendere il margine" (P2)
| # | Feature | Area | Fonte | Stato | Prova nel codice |
|---|---|---|---|---|---|
| 21 | [[Gestione Dispute]] | Fiducia | eBay | ✅ FATTA | disputes (027), `/admin/disputes`, refund integrato |
| 22 | [[Programma Referral]] | Crescita | Amazon | ✅ FATTA | referrals (015), reward on delivery (089), no self-ref (092) |
| 23 | [[Promozioni e Coupon]] | Crescita | eBay | ✅ FATTA | coupons (014), seller_promotions (031), zone discount (033) |
| 24 | [[Raccomandazioni Personalizzate]] | Crescita | Amazon | ⚠️ PARZIALE | recently_viewed + trending 24h + liste curate; **niente ML** |
| 25 | [[SEO Locale e Pagine Negozio]] | Crescita | Amazon | ✅ FATTA | `/store/[id]/[slug]`, `/stores`, seller site |
| 26 | [[Abbonamento e Membership]] | Crescita | Amazon | ✅ FATTA | subscription Stripe seller (~€50/mese), billing portal |

\* = backend fatto, ma c'è un buco di UX/completezza (vedi sotto).

## ➕ Feature EXTRA già nel codice (non erano in roadmap)
Vision extract prodotti da foto · Catalog-batch AI (Message Batches API) · Barcode/EAN lookup · AI copilot/chat prodotto · SEO AI · Varianti prodotto (080) · **Gift card** · **Wallet + loyalty points + tier** · **Achievement/badge** · **Sponsored listings/ads** · Abandoned-cart recovery · **Ordini ricorrenti** (weekly/biweekly) · **B2B con fatturazione SDI** · Import prodotti esterni (eBay/Amazon) · Q&A prodotto · Seller stories · Shop of month · Cashback · Cron health monitoring · Buyer public profile.
→ Implica che parte del lavoro futuro è **rimuovere/nascondere** complessità, non aggiungerla. Vedi [[Prodotto & UX]].

## 🕳️ I 3 buchi VERI (gli unici dev che contano ora)
1. **Inventario unitario mancante.** Nessun campo `quantity` per SKU: un prodotto è solo `available|sold`. Rischio **overselling** — grave sul food fresco. → [[Gestione Inventario e Disponibilità]].
2. **Mappa live consegna assente lato cliente.** Il DB traccia `rider_lat/lng` in realtime, ma nessuna pagina ordine mostra la mappa. Il dato c'è, manca la **vista**. → [[Tracking Live Consegna]] e [[Operazioni & Logistica]].
3. **Geofencing per raggio assente.** Le zone sono CAP+sconto, non "consegno entro N km dal mio punto". Rilevante per il modello a cluster. → [[Zone di Consegna e Geolocalizzazione]].

**Buchi minori:** nessuna notifica "payout inviato" al venditore · app rider scheletrica (no storico, no rating, no offline mode — problema reale nei sottopassi di Piacenza).

## ⚠️ Anti-pattern da evitare ora
- Costruire [[Tracking Live Consegna]] prima di avere ordini → vanity feature.
- Recensioni prima di avere transazioni → niente da recensire.
- Raccomandazioni personalizzate senza dati di traffico → cold start inutile.
- **NON costruire nuove feature alla cieca:** ne hai già più di Glovo. Le uniche 3 cose che meritano dev sono i buchi sopra (specie inventario + mappa live).
- Trade-off completi → [[Decisioni Aperte]].

#mvp #roadmap #audit #stato-reale #priorità/alta
