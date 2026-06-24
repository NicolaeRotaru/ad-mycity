---
area: Ops
fonte_ispirazione: Glovo
priorità: P1
effort: M
fase: Scala
---

# Dashboard Operativa

> La "control room" di MyCity: vedere tutti gli ordini live, individuare i bloccati, intervenire. Il tuo strumento da operatore.

## 🎯 Problema utente
- **Operations/tu:** "Quali ordini sono in ritardo, non accettati, in difficoltà? Dove devo intervenire ORA?"
- Indiretto **cliente/negozio:** beneficiano di problemi risolti prima che esplodano.

## 🏆 Come lo risolvono i grandi
- **Glovo:** control tower con tutti gli ordini in tempo reale, alert su ritardi, riassegnazione rider.
- **Amazon:** dashboard operative con SLA e anomalie evidenziate.

## 🧩 Funzionalità per MyCity
Vista admin di tutti gli ordini con stato, tempo nello stato, alert sui bloccati (non accettati da X min, in ritardo). Azioni: contatta negozio, riassegna, annulla/rimborsa. Filtri per negozio/zona/stato.

## ✅ Requisiti minimi v1
- Lista ordini live con stato e timer
- Evidenza ordini "a rischio" (non accettati/ in ritardo)
- Azioni admin (annulla, rimborsa, contatta)

## 🔗 Dipendenze
- Si basa su → [[Gestione Stato Ordine]]
- Coordina → [[Gestione Rider e Pool Fattorini]] e [[Slot di Consegna e Disponibilità]]
- Supporta → [[Customer Support e Centro Assistenza]]
- Dati per → [[Metriche & KPI]]

## 📈 Metrica di successo
% anomalie risolte < X min · ordini gestiti per operatore.

## 🛠️ Note tecniche
- Vista real-time (subscription) sugli ordini.
- Regole di alert (soglie tempo per stato).
- Solo admin/ops (RBAC).

#glovo #ops
