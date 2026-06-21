---
area: Fiducia
fonte_ispirazione: eBay
priorità: P1
effort: M
fase: Scala
---

# Reputazione Venditore

> Il "punteggio di affidabilità" del negozio. Su eBay è il cuore della fiducia tra estranei.

## 🎯 Problema utente
- **Cliente:** "Questo negozio è serio? Consegna in tempo? Tratta bene i clienti?"
- **Negoziante:** una buona reputazione = più vendite e più visibilità; incentivo a comportarsi bene.

## 🏆 Come lo risolvono i grandi
- **eBay:** feedback score, % positivi, badge "Top Rated Seller", metriche di performance (spedizioni in ritardo, dispute).
- **Amazon:** seller rating + metriche di account health (late shipment, defect rate).

## 🧩 Funzionalità per MyCity
Profilo negozio con rating aggregato, n. ordini completati, % on-time, % problemi. Badge "negozio affidabile" per i migliori. Usato per ordinare i risultati e per la fiducia del cliente.

## ✅ Requisiti minimi v1
- Rating aggregato del negozio (da [[Recensioni e Rating Prodotti]])
- Metriche base: ordini completati, % consegne on-time
- Mostrato su profilo negozio e [[Scheda Prodotto]]

## 🔗 Dipendenze
- Si nutre di → [[Recensioni e Rating Prodotti]] e [[Gestione Stato Ordine]]
- Influenza → [[Ricerca e Navigazione Catalogo]] (ranking)
- Collegata a → [[Gestione Dispute]] (le dispute pesano sulla reputazione)

## 📈 Metrica di successo
Distribuzione rating negozi · correlazione reputazione→GMV.

## 🛠️ Note tecniche
- Punteggio aggregato calcolato da recensioni + metriche operative.
- Soglie per badge. Aggiornamento periodico/event-driven.

#ebay #fiducia
