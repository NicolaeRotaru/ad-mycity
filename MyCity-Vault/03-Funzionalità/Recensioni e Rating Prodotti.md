---
area: Fiducia
fonte_ispirazione: Amazon
priorità: P1
effort: M
fase: Scala
---

# Recensioni e Rating Prodotti

> Il social proof che fa comprare da sconosciuti. Il primo cliente apre la strada al secondo.

## 🎯 Problema utente
- **Cliente:** "Mi posso fidare di questo prodotto/negozio? Altri sono stati contenti?"
- **Negoziante:** le buone recensioni aumentano le vendite e la visibilità.

## 🏆 Come lo risolvono i grandi
- **Amazon:** rating a stelle + recensioni con foto, "acquisto verificato", utilità delle recensioni.
- **eBay:** feedback su transazione (positivo/neutro/negativo).
- **Glovo:** rating su negozio e consegna dopo l'ordine.

## 🧩 Funzionalità per MyCity
Dopo un ordine consegnato, il cliente può lasciare rating + recensione su prodotto, negozio e (se attiva) consegna. Recensioni "verificate" perché legate a ordini reali. Mostrate su scheda prodotto e profilo negozio.

## ✅ Requisiti minimi v1
- Rating a stelle + commento, solo da chi ha ordinato (verificato)
- Visualizzazione su [[Scheda Prodotto]] e profilo negozio
- Richiesta recensione post-consegna (via notifica)

## 🔗 Dipendenze
- Richiede → ordini reali da [[Gestione Stato Ordine]] (stato "Consegnato")
- Alimenta → [[Reputazione Venditore]]
- Sollecitata da → [[Notifiche Transazionali]]
- ⚠️ Inutile senza transazioni (vedi [[01-Roadmap]])

## 📈 Metrica di successo
% ordini recensiti · rating medio · correlazione rating→conversione.

## 🛠️ Note tecniche
- Recensione legata a `order_id` (verifica acquisto).
- Moderazione base (anti-spam/offese).
- Aggregazione rating su prodotto e negozio.

#amazon #fiducia
