# 🔍 26 — Audit Codice vs Roadmap (stato reale del prodotto)

> Mappatura del **codice vero** (repo `NicolaeRotaru/mycity`, clone locale `mycity-live`, package `piacenza-market`) contro le 26 feature di [[01-Roadmap]].
> Eseguito: 2026-06-17. Stack reale → [[20-Tecnologia-e-Stack]].

## 🧭 Verdetto in una riga
**Il prodotto è costruito al ~90%: 24 feature FATTE, 2 PARZIALI, 0 mancanti — più 24 feature extra non in roadmap.**
→ Il collo di bottiglia per crescere **non è il prodotto, è la domanda/distribuzione.** Conferma [[08-Domanda-Primi-Clienti]] e [[19-Marketing-e-Crescita]].

## 📊 Stato delle 26 feature

| # | Feature | Stato | Prova nel codice |
|---|---|---|---|
| 1 | [[Onboarding Venditori Self-Service]] | ✅ FATTA | `/api/auth/signup`, migration 021 (approval+KYC) |
| 2 | [[Dashboard Venditore]] | ✅ FATTA | `/seller/*` (orders, products, earnings, analytics) |
| 3 | [[Gestione Catalogo e Listing]] | ✅ FATTA | `/seller/products/*`, products + search_tsv |
| 4 | [[Scheda Prodotto]] | ✅ FATTA | `/product/[id]` + opengraph-image SEO |
| 5 | [[Ricerca e Navigazione Catalogo]] | ✅ FATTA | `/search`, FTS italiano + pg_trgm (027) |
| 6 | [[Gestione Inventario e Disponibilità]] | ⚠️ PARZIALE | solo `status` available/sold; **niente quantità per SKU** |
| 7 | [[Carrello e Checkout]] | ✅ FATTA | `/cart`, `/checkout`, pending_checkouts multi-seller (042) |
| 8 | [[Pagamenti e Payout Venditori]] | ✅ FATTA | Stripe Connect `/api/stripe/connect/*`, COD (024,097), payout post-delivery |
| 9 | [[Gestione Resi e Rimborsi]] | ✅ FATTA | tabella returns (024), `/api/returns/*`, refund Stripe |
| 10 | [[Zone di Consegna e Geolocalizzazione]] | ✅ FATTA | zone_codes (033) per CAP, user_addresses lat/lng (014) |
| 11 | [[Tracking Live Consegna]] | ✅ FATTA* | rider_lat/lng realtime (011); *manca UI mappa lato cliente* |
| 12 | [[Gestione Rider e Pool Fattorini]] | ✅ FATTA* | ruolo rider, auto-assegnazione READY; *app rider scheletrica* |
| 13 | [[Slot di Consegna e Disponibilità]] | ✅ FATTA | store_hours (010), email scheduling (033) |
| 14 | [[Gestione Stato Ordine]] | ✅ FATTA | delivery_status 8 stati + timestamp per fase (011) |
| 15 | [[Dashboard Operativa]] | ✅ FATTA | `/admin/orders`, `/admin/today`, audit log (027) |
| 16 | [[Recensioni e Rating Prodotti]] | ✅ FATTA | reviews (001), store/rider reviews (014), foto (030) |
| 17 | [[Reputazione Venditore]] | ✅ FATTA | approval_status + KYC (021), rating aggregato |
| 18 | [[Verifica e KYC Venditori]] | ✅ FATTA | `/api/kyc/*`, bucket kyc (041), provider Stripe |
| 19 | [[Customer Support e Centro Assistenza]] | ✅ FATTA | chat buyer-seller, `/admin/support-chat`, `/api/contact` |
| 20 | [[Gestione Dispute]] | ✅ FATTA | disputes (027), `/admin/disputes`, refund integrato |
| 21 | [[Notifiche Transazionali]] | ✅ FATTA | notifications (008), email_queue (033), push (027), cron |
| 22 | [[Programma Referral]] | ✅ FATTA | referrals (015), reward on delivery (089), no self-ref (092) |
| 23 | [[Promozioni e Coupon]] | ✅ FATTA | coupons (014), seller_promotions (031), zone discount (033) |
| 24 | [[Raccomandazioni Personalizzate]] | ⚠️ PARZIALE | recently_viewed + trending 24h + liste curate; **niente ML** |
| 25 | [[SEO Locale e Pagine Negozio]] | ✅ FATTA | `/store/[id]/[slug]`, `/stores`, seller site |
| 26 | [[Abbonamento e Membership]] | ✅ FATTA | subscription Stripe seller (~€50/mese), billing portal |

\* = backend fatto, ma c'è un buco di UX/completezza (vedi sotto).

## ➕ Feature EXTRA già nel codice (non erano in roadmap)
Vision extract prodotti da foto · Catalog-batch AI (Message Batches API) · Barcode/EAN lookup · AI copilot/chat prodotto · SEO AI · Varianti prodotto (080) · **Gift card** · **Wallet + loyalty points + tier** · **Achievement/badge** · **Sponsored listings/ads** · Abandoned-cart recovery · **Ordini ricorrenti** (weekly/biweekly) · **B2B con fatturazione SDI** · Import prodotti esterni (eBay/Amazon) · Q&A prodotto · Seller stories · Shop of month · Cashback · Cron health monitoring · Buyer public profile.
→ Implica che parte del lavoro futuro è **rimuovere/nascondere** complessità, non aggiungerla. Vedi [[17-Prodotto-e-UX]].

## 🕳️ I 3 buchi VERI (gli unici dev che contano ora)
1. **Inventario unitario mancante.** Nessun campo `quantity` per SKU: un prodotto è solo `available|sold`. Rischio **overselling** — grave sul food fresco. → impatta [[Gestione Inventario e Disponibilità]].
2. **Mappa live consegna assente lato cliente.** Il DB traccia `rider_lat/lng` in realtime, ma nessuna pagina ordine mostra la mappa (0 occorrenze di Leaflet/Map in `/app/orders/`). Il dato c'è, manca la **vista**. → completa [[Tracking Live Consegna]] e [[18-Operazioni-e-Logistica]].
3. **Geofencing per raggio assente.** Le zone sono CAP+sconto, non "consegno entro N km dal mio punto". Rilevante per il modello a cluster. → estende [[Zone di Consegna e Geolocalizzazione]].

### Buchi minori
- Nessuna notifica "payout inviato" al venditore (solo stato PENDING/HELD).
- App rider scheletrica: no storico consegne, no rating, no offline mode (problema reale nei sottopassi di Piacenza).

## ✅ Implicazione strategica
- **NON costruire nuove feature alla cieca**: ne hai già più di Glovo.
- Le uniche 3 cose di prodotto che meritano dev sono i buchi sopra (specie inventario + mappa live).
- Il 95% dell'energia va su [[08-Domanda-Primi-Clienti]] / [[19-Marketing-e-Crescita]] / [[21-Vendite-Negozi-B2B]]: portare negozi e ordini reali.

## 🔗 Collegato a
[[01-Roadmap]] · [[20-Tecnologia-e-Stack]] · [[17-Prodotto-e-UX]] · [[18-Operazioni-e-Logistica]] · [[08-Domanda-Primi-Clienti]]

#audit #prodotto #stato-reale #piacenza
