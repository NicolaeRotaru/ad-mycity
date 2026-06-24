---
area: Fiducia
fonte_ispirazione: Amazon
priorità: P1
effort: M
fase: Scala
---

# Customer Support e Centro Assistenza

> Quando qualcosa va storto, è il supporto a salvare (o perdere) il cliente. Nel locale, il passaparola amplifica ogni esperienza.

## 🎯 Problema utente
- **Cliente:** "L'ordine non è arrivato / è sbagliato — chi mi aiuta, subito?"
- **Negoziante:** ha bisogno di aiuto su payout, ordini, account.
- **Per MyCity:** un problema risolto bene crea un cliente fedele; ignorato, un detrattore.

## 🏆 Come lo risolvono i grandi
- **Amazon:** centro assistenza, chat, "contatta riguardo a un ordine", self-service first.
- **eBay:** centro risoluzioni integrato con le dispute.
- **Glovo:** chat in-app legata all'ordine in corso, supporto live durante la consegna.

## 🧩 Funzionalità per MyCity
Centro assistenza con FAQ + canale di contatto legato all'ordine (chat/email/form). Per il negozio, un canale dedicato. Ticketing base per ops.

## ✅ Requisiti minimi v1
- FAQ self-service
- Contatto legato all'ordine (form/email) per il cliente
- Casella ticket per ops (anche email all'inizio)

## 🔗 Dipendenze
- Si appoggia a → [[Gestione Stato Ordine]] (contesto ordine)
- Gestisce casi di → [[Gestione Resi e Rimborsi]] e [[Gestione Dispute]]
- Monitorato da → [[Dashboard Operativa]]

## 📈 Metrica di successo
Tempo di prima risposta · % ticket risolti al primo contatto · CSAT.

## 🛠️ Note tecniche
- v1: email + form con `order_id` allegato. A scala: tool di ticketing/chat.
- Macro/risposte rapide per i casi comuni.

#amazon #fiducia
