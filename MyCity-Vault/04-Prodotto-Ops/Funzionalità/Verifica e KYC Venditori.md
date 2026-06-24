---
area: Fiducia
fonte_ispirazione: eBay
priorità: P1
effort: M
fase: Scala
---

# Verifica e KYC Venditori

> La porta d'ingresso "seria": verificare che il negozio sia reale e legalmente pagabile. Protegge clienti, piattaforma e legge.

## 🎯 Problema utente
- **Cliente:** vuole comprare da negozi reali, non truffe.
- **Per MyCity:** per legge non puoi pagare (payout) un'entità non verificata; serve anche per ridurre frodi.
- **Negoziante:** vuole un processo chiaro per essere abilitato a incassare.

## 🏆 Come lo risolvono i grandi
- **eBay/Amazon:** verifica identità, dati fiscali, conto bancario prima di abilitare i payout. Verifiche progressive (più vendi, più verifichi).
- **Glovo:** contratto partner + dati fiscali del locale.

## 🧩 Funzionalità per MyCity
Raccolta e verifica di: identità del titolare, P.IVA/dati fiscali, conto bancario per payout. Idealmente delegata al PSP (Stripe Connect onboarding). Stato "verificato" sblocca i payout.

## ✅ Requisiti minimi v1
- Onboarding KYC (delegato al PSP dove possibile)
- Verifica P.IVA + IBAN
- Stato verificato → abilita [[Pagamenti e Payout Venditori]]

## 🔗 Dipendenze
- Parte di → [[Onboarding Venditori Self-Service]]
- Blocca → [[Pagamenti e Payout Venditori]]
- Decisione curato vs aperto → [[Decisioni Aperte]]

## 📈 Metrica di successo
% negozi verificati · tempo medio di verifica · frodi/insoluti evitati.

## 🛠️ Note tecniche
- Sfruttare KYC del PSP (Stripe Connect) per ridurre compliance interna.
- Stato KYC sul `seller`; gating dei payout.

#ebay #fiducia
