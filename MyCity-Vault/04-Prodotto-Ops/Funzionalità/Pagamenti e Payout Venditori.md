---
area: Pagamenti
fonte_ispirazione: eBay
priorità: P0
effort: L
fase: MVP+1
---

# Pagamenti e Payout Venditori

> Il cuore finanziario del marketplace: incassare dal cliente, trattenere la commissione, pagare il negozio. Senza questo, non c'è business.

## 🎯 Problema utente
- **Negoziante:** vuole essere pagato in modo affidabile e puntuale per ogni vendita.
- **Cliente:** vuole pagare in sicurezza e, se qualcosa va storto, essere protetto.
- **Per MyCity:** vuole incassare la commissione automaticamente e restare in regola.

## 🏆 Come lo risolvono i grandi
- **eBay (Managed Payments):** eBay incassa, trattiene le fee, paga il venditore con payout programmati.
- **Amazon:** incassa, trattiene referral fee, paga i seller a cadenza fissa, gestisce reserve per rischio.
- **Glovo:** incassa dal cliente, riconcilia con i partner periodicamente.

## 🧩 Funzionalità per MyCity
Modello **marketplace con split payment**: MyCity incassa il pagamento, trattiene la commissione, accredita il resto al negozio (payout programmato o on-demand). Gestione fee di consegna. Reportistica incassi per il negozio.

## ✅ Requisiti minimi v1
- Incasso online con split automatico (commissione MyCity vs quota negozio)
- Onboarding bancario del negozio (collegato a [[Verifica e KYC Venditori]])
- Storico transazioni e payout nel pannello negozio
- Gestione base dei rimborsi → [[Gestione Resi e Rimborsi]]

## 🔗 Dipendenze
- Innescato da → [[Carrello e Checkout]]
- Richiede → [[Verifica e KYC Venditori]] (per legge, per pagare)
- Visualizzato in → [[Dashboard Venditore]]
- Rimborsi → [[Gestione Resi e Rimborsi]] e [[Gestione Dispute]]
- Modello (incassiamo noi vs paga il negozio) → [[Decisioni Aperte]]

## 📈 Metrica di successo
% pagamenti riusciti · tempo di payout · tasso di chargeback/dispute.

## 🛠️ Note tecniche
- **Stripe Connect** (o equivalente) con account collegati per negozio + `application_fee` per la commissione MyCity.
- Compliance: gestione fondi di terzi, KYC/AML demandata in larga parte al PSP.
- Webhook per stati pagamento → aggiornano [[Gestione Stato Ordine]].

#ebay #amazon #mvp #priorità/alta #pagamenti
