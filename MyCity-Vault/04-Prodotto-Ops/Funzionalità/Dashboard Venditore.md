---
area: Venditori
fonte_ispirazione: eBay
priorità: P0
effort: M
fase: MVP+1
---

# Dashboard Venditore

> Il "posto di lavoro" del negozio. Dove gestisce prodotti, ordini e si accorge che sta vendendo.

## 🎯 Problema utente
- **Negoziante:** "Ho ricevuto ordini? Cosa devo preparare? I miei prodotti sono online?" Serve un unico posto per gestire l'attività.
- **Per MyCity:** un negozio che vede i suoi ordini e li evade velocemente = clienti contenti = volano che gira.

## 🏆 Come lo risolvono i grandi
- **eBay Seller Hub:** ordini, listing, performance, messaggi in un'unica dashboard.
- **Amazon Seller Central:** "ordini da evadere" in evidenza, alert sulle azioni richieste.
- **Glovo Partner App/tablet:** notifica sonora di nuovo ordine, accetta/rifiuta, tempo di preparazione.

## 🧩 Funzionalità per MyCity
Dashboard con: nuovi ordini da accettare/preparare, elenco prodotti (pubblica/modifica/metti out-of-stock), riepilogo vendite, stato payout. Notifica chiara di nuovo ordine.

## ✅ Requisiti minimi v1
- Lista ordini con stati (nuovo → accettato → pronto → consegnato)
- Azione "accetta ordine" e "segna pronto"
- Gestione prodotti (CRUD) → link a [[Gestione Catalogo e Listing]]
- Riepilogo incassi base

## 🔗 Dipendenze
- Nasce da → [[Onboarding Venditori Self-Service]]
- Mostra ordini gestiti in → [[Gestione Stato Ordine]]
- Mostra payout da → [[Pagamenti e Payout Venditori]]
- Notifica nuovo ordine via → [[Notifiche Transazionali]]

## 📈 Metrica di successo
Tempo medio di accettazione ordine dal negozio · % ordini accettati < 5 min.

## 🛠️ Note tecniche
- Vista filtrata per `seller_id` (multi-tenant).
- Web responsive da subito; app/tablet dedicato in fase [[Dashboard Operativa|Scala]].
- Realtime su nuovi ordini (websocket/subscription) + suono/notifica.

#ebay #mvp #priorità/alta #venditori
