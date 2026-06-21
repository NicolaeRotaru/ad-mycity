---
area: Consegna
fonte_ispirazione: Glovo
priorità: P1
effort: M
fase: Scala
---

# Slot di Consegna e Disponibilità

> Allineare la domanda alla capacità: orari del negozio, fasce di consegna, "aperto/chiuso adesso".

## 🎯 Problema utente
- **Cliente:** "Posso ricevere oggi? A che ora? Il negozio è aperto?"
- **Negoziante:** vuole ricevere ordini solo quando può prepararli e consegnarli.

## 🏆 Come lo risolvono i grandi
- **Glovo:** orari di apertura del negozio, stato aperto/chiuso, tempi di preparazione.
- **Amazon Fresh / Deliveroo:** slot di consegna prenotabili a fasce orarie.

## 🧩 Funzionalità per MyCity
Orari di apertura per negozio (consegna disponibile solo se aperto) + opzione di slot/fasce di consegna ("oggi 18-19", "domani mattina") e consegna ASAP. Gestione capacità (max ordini per fascia).

## ✅ Requisiti minimi v1
- Orari di apertura per negozio → stato aperto/chiuso
- Modalità "consegna ASAP" quando aperto
- (Opz.) slot orari prenotabili

## 🔗 Dipendenze
- Estende → [[Zone di Consegna e Geolocalizzazione]]
- Mostrato in → [[Scheda Prodotto]] e [[Carrello e Checkout]]
- Capacità coordinata da → [[Dashboard Operativa]]

## 📈 Metrica di successo
% ordini consegnati nello slot promesso · % ordini rifiutati per capacità.

## 🛠️ Note tecniche
- Calendario orari per negozio + override (chiusure/festivi).
- Capacità per fascia (contatore ordini).

#glovo #consegna
