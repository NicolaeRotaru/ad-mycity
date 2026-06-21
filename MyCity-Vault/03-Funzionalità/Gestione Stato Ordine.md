---
area: Ops
fonte_ispirazione: Glovo
priorità: P0
effort: M
fase: MVP+1
---

# Gestione Stato Ordine

> La spina dorsale operativa: il "ciclo di vita" di ogni ordine, da pagato a consegnato. Tutti (cliente, negozio, ops) guardano lo stesso stato.

## 🎯 Problema utente
- **Cliente:** "Il mio ordine è stato accettato? Sta arrivando?"
- **Negoziante:** "Cosa devo preparare adesso?"
- **Operations:** "Quali ordini sono bloccati e vanno sbloccati?"

## 🏆 Come lo risolvono i grandi
- **Amazon:** stati ordine chiari (confermato → in preparazione → spedito → consegnato) con timestamp.
- **eBay:** stato pagamento + spedizione + tracking.
- **Glovo:** macchina a stati real-time (accettato → in preparazione → rider in arrivo → ritirato → consegnato).

## 🧩 Funzionalità per MyCity
Macchina a stati dell'ordine: `Pagato → Accettato dal negozio → In preparazione → Pronto → In consegna → Consegnato` (+ `Annullato` / `Problema`). Ogni transizione genera eventi e notifiche.

## ✅ Requisiti minimi v1
- Modello stato ordine con timestamp per transizione
- Azioni negozio (accetta, pronto) da [[Dashboard Venditore]]
- Vista stato per il cliente
- Stato "annullato/rimborsato" collegato ai pagamenti

## 🔗 Dipendenze
- Creato da → [[Carrello e Checkout]]
- Aggiornato dal → [[Dashboard Venditore]]
- Innesca → [[Notifiche Transazionali]]
- Alimenta → [[Tracking Live Consegna]] e [[Dashboard Operativa]]
- Stati di rimborso → [[Gestione Resi e Rimborsi]]

## 📈 Metrica di successo
% ordini che arrivano a "Consegnato" senza intervento manuale · tempo per stato.

## 🛠️ Note tecniche
- State machine esplicita con log di transizioni (audit trail).
- Eventi pub/sub per notifiche e dashboard real-time.
- Gli stati guidano anche i payout (paga il negozio dopo "Consegnato").

#glovo #mvp #priorità/alta #ops
