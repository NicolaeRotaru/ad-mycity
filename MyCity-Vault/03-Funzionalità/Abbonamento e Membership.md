---
area: Crescita
fonte_ispirazione: Amazon
priorità: P2
effort: L
fase: Maturità
---

# Abbonamento e Membership

> Il "Prime" locale: consegne gratuite/scontate a fronte di un abbonamento. Massima leva di retention e frequenza, ma solo a marketplace maturo.

## 🎯 Problema utente
- **Cliente:** "Ordino spesso nel quartiere — voglio risparmiare sulle consegne."
- **Per MyCity:** lock-in, frequenza d'acquisto e ricavo ricorrente prevedibile.

## 🏆 Come lo risolvono i grandi
- **Amazon Prime:** consegna gratis + vantaggi → frequenza e fedeltà enormi.
- **Glovo Prime / Deliveroo Plus:** consegne illimitate gratuite a canone mensile.

## 🧩 Funzionalità per MyCity
Abbonamento mensile "MyCity Plus": consegne gratuite/scontate sopra una soglia, offerte riservate, supporto prioritario. Gestione billing ricorrente.

## ✅ Requisiti minimi v1
- Piano mensile con billing ricorrente
- Benefit "consegna gratis sopra X" applicato a [[Carrello e Checkout]]
- Gestione stato abbonamento (attivo/scaduto)

## 🔗 Dipendenze
- Richiede → [[Pagamenti e Payout Venditori]] (billing ricorrente)
- Ha senso solo con → frequenza d'acquisto già dimostrata ([[Raccomandazioni Personalizzate]], retention)
- Benefit applicati in → [[Carrello e Checkout]] e [[Slot di Consegna e Disponibilità]]

## 📈 Metrica di successo
% clienti abbonati · frequenza d'acquisto abbonati vs non · churn abbonamento · LTV.

## 🛠️ Note tecniche
- Subscription billing del PSP (Stripe Billing).
- Logica benefit a checkout. Gestione rinnovi/cancellazioni.
- ⚠️ Ultimo della lista: serve massa critica di ordini ricorrenti.

#amazon #crescita
