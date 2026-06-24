---
area: Catalogo
fonte_ispirazione: Amazon
priorità: P1
effort: M
fase: Scala
---

# Gestione Inventario e Disponibilità

> Evitare di vendere ciò che non c'è. Niente uccide la fiducia come un ordine annullato "perché esaurito".

## 🎯 Problema utente
- **Cliente:** non voglio ordinare qualcosa che poi scopro non disponibile.
- **Negoziante:** voglio tenere allineata la disponibilità reale senza fatica.

## 🏆 Come lo risolvono i grandi
- **Amazon:** quantità a stock, "solo X rimasti", out-of-stock automatico, gestione FBA.
- **eBay:** quantità per listing, fine annuncio a esaurimento.
- **Glovo:** prodotti "non disponibili" disattivati in tempo reale dal negozio.

## 🧩 Funzionalità per MyCity
Disponibilità per prodotto: semplice on/off all'inizio, poi quantità a stock con decremento all'ordine e blocco automatico a zero. Toggle rapido "esaurito" dalla dashboard.

## ✅ Requisiti minimi v1
- Flag disponibile/esaurito per prodotto (già base in [[Gestione Catalogo e Listing]])
- Toggle rapido da [[Dashboard Venditore]]
- (Evoluzione) quantità a stock + decremento automatico

## 🔗 Dipendenze
- Estende → [[Gestione Catalogo e Listing]]
- Si riflette su → [[Scheda Prodotto]] e [[Ricerca e Navigazione Catalogo]]
- Evita annullamenti in → [[Gestione Stato Ordine]]

## 📈 Metrica di successo
% ordini annullati per "non disponibile" (da minimizzare).

## 🛠️ Note tecniche
- Campo stock + lock transazionale a checkout per evitare oversell.
- Eventi di esaurimento → nascondono il prodotto in ricerca.

#amazon #catalogo
