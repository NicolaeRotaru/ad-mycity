# 📊 04 — Metriche

## ⭐ North Star Metric
**Ordini locali consegnati con successo / settimana.**

Perché: cattura tutti e 3 i lati del marketplace in un solo numero — c'è offerta (un negozio ha listato), c'è domanda (un cliente ha comprato), c'è evasione (è stato consegnato bene). Cresce solo se il volano gira davvero.

> Metrica di supporto early-stage (mentre i numeri sono piccoli): **% negozi attivi con ≥1 ordine negli ultimi 7gg**. Misura se l'offerta è "viva".

---

## KPI per area

### [[Area - Venditori]] #ebay
- N. negozi attivi (≥1 listing pubblicato)
- Tempo di onboarding (signup → primo prodotto live)
- % negozi con ≥1 ordine / settimana
- GMV per negozio

### [[Area - Catalogo]] #amazon
- N. prodotti pubblicati
- % ricerche con ≥1 risultato cliccato (search success rate)
- Conversion rate scheda prodotto → carrello

### [[Area - Consegna]] #glovo
- % ordini consegnati on-time
- Tempo medio di consegna (ordine → porta)
- Tasso ordini falliti / annullati per cause logistiche

### [[Area - Pagamenti]] #amazon #ebay
- Checkout completion rate (carrello → pagato)
- Tempo di payout al venditore
- Tasso di pagamenti falliti / contestati

### [[Area - Fiducia]] #amazon #ebay
- Rating medio prodotti e venditori
- % ordini con recensione
- Tasso di reso / dispute
- CSAT / tempo di prima risposta supporto

### [[Area - Crescita]] #amazon
- Clienti attivi mensili (MAU)
- Retention a 30gg (% clienti che riordinano)
- CAC vs LTV
- % ordini da clienti di ritorno

### [[Area - Ops]] #glovo
- Ordini gestiti per operatore
- Tempo medio di accettazione ordine dal negozio
- % anomalie risolte < X minuti

---

## 🎯 Funnel marketplace (da ottimizzare in ordine)
`Visita → Ricerca → Scheda prodotto → Carrello → Checkout → Pagamento → Evasione negozio → Consegna → Recensione → Riacquisto`

Ogni step ha una feature owner:
[[Ricerca e Navigazione Catalogo]] → [[Scheda Prodotto]] → [[Carrello e Checkout]] → [[Pagamenti e Payout Venditori]] → [[Gestione Stato Ordine]] → [[Tracking Live Consegna]] → [[Recensioni e Rating Prodotti]] → [[Programma Referral]]

#metriche #mvp
