# 🚦 01 — Roadmap (priorità post primo negozio)

> Ordinata per **cosa sblocca il prossimo passo del marketplace**, non per quanto è "figa" la feature.
> Logica: un marketplace è un volano a 2 lati. Senza negozi non c'è offerta; senza ordini i negozi se ne vanno; senza fiducia non ci sono ordini ripetuti.

## 🧱 Le 3 domande che guidano la priorità
1. **Aggiungere altri negozi** → offerta (lato venditore)
2. **Ricevere il primo ordine** → transazione (lato cliente)
3. **Costruire fiducia** → ripetizione (entrambi i lati)

---

## Fase MVP+1 — "Far girare il volano" (P0)
Obiettivo: passare da 1 negozio + 0 ordini a N negozi + ordini reali consegnati.

| # | Funzionalità | Area | Fonte | Prio | Effort | Sblocca |
|---|---|---|---|---|---|---|
| 1 | [[Onboarding Venditori Self-Service]] | Venditori | eBay | P0 | M | + negozi |
| 2 | [[Dashboard Venditore]] | Venditori | eBay | P0 | M | + negozi |
| 3 | [[Gestione Catalogo e Listing]] | Catalogo | Amazon | P0 | M | + prodotti |
| 4 | [[Scheda Prodotto]] | Catalogo | Amazon | P0 | S | acquisto |
| 5 | [[Ricerca e Navigazione Catalogo]] | Catalogo | Amazon | P0 | M | scoperta |
| 6 | [[Carrello e Checkout]] | Pagamenti | Amazon | P0 | M | 1° ordine |
| 7 | [[Pagamenti e Payout Venditori]] | Pagamenti | eBay | P0 | L | soldi al negozio |
| 8 | [[Zone di Consegna e Geolocalizzazione]] | Consegna | Glovo | P0 | M | consegna locale |
| 9 | [[Gestione Stato Ordine]] | Ops | Glovo | P0 | M | evasione |
| 10 | [[Notifiche Transazionali]] | Crescita | Glovo | P0 | S | trasparenza |

## Fase Scala — "Renderlo affidabile e ripetibile" (P1)
Obiettivo: la gente torna, i negozi vendono prevedibilmente, le operations reggono.

| # | Funzionalità | Area | Fonte | Prio | Effort |
|---|---|---|---|---|---|
| 11 | [[Tracking Live Consegna]] | Consegna | Glovo | P1 | L |
| 12 | [[Gestione Rider e Pool Fattorini]] | Consegna | Glovo | P1 | L |
| 13 | [[Slot di Consegna e Disponibilità]] | Consegna | Glovo | P1 | M |
| 14 | [[Recensioni e Rating Prodotti]] | Fiducia | Amazon | P1 | M |
| 15 | [[Reputazione Venditore]] | Fiducia | eBay | P1 | M |
| 16 | [[Verifica e KYC Venditori]] | Fiducia | eBay | P1 | M |
| 17 | [[Gestione Resi e Rimborsi]] | Pagamenti | Amazon | P1 | M |
| 18 | [[Customer Support e Centro Assistenza]] | Fiducia | Amazon | P1 | M |
| 19 | [[Gestione Inventario e Disponibilità]] | Catalogo | Amazon | P1 | M |
| 20 | [[Dashboard Operativa]] | Ops | Glovo | P1 | M |

## Fase Maturità — "Crescere e difendere il margine" (P2)
Obiettivo: retention, margine, difendibilità competitiva.

| # | Funzionalità | Area | Fonte | Prio | Effort |
|---|---|---|---|---|---|
| 21 | [[Gestione Dispute]] | Fiducia | eBay | P2 | M |
| 22 | [[Programma Referral]] | Crescita | Amazon | P2 | S |
| 23 | [[Promozioni e Coupon]] | Crescita | eBay | P2 | M |
| 24 | [[Raccomandazioni Personalizzate]] | Crescita | Amazon | P2 | L |
| 25 | [[SEO Locale e Pagine Negozio]] | Crescita | Amazon | P2 | M |
| 26 | [[Abbonamento e Membership]] | Crescita | Amazon | P2 | L |

---

## ⚠️ Anti-pattern da evitare ora
- Costruire [[Tracking Live Consegna]] prima di avere ordini → vanity feature.
- Recensioni prima di avere transazioni → niente da recensire.
- Raccomandazioni personalizzate senza dati di traffico → cold start inutile.
- Aprire a venditori senza [[Verifica e KYC Venditori]] *quando* scali, ma non bloccare il primo onboarding manuale.

Vedi i trade-off completi in [[05-Decisioni-Aperte]].

#mvp #priorità/alta #roadmap
