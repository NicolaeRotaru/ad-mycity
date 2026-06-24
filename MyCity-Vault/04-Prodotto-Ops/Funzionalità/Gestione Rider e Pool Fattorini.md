---
area: Consegna
fonte_ispirazione: Glovo
priorità: P1
effort: L
fase: Scala
---

# Gestione Rider e Pool Fattorini

> Il terzo lato del marketplace (quando lo attivi): chi porta fisicamente l'ordine. Pesante ma potente per qualità ed esperienza.

## 🎯 Problema utente
- **Cliente:** vuole consegne rapide e affidabili.
- **Negoziante:** non sempre ha personale per consegnare; vuole delegare la logistica.
- **Rider:** vuole ricevere ordini, navigare, confermare consegne, essere pagato.

## 🏆 Come lo risolvono i grandi
- **Glovo:** app rider con dispatching automatico, accettazione ordine, navigazione, prova di consegna, paga a consegna.
- **Amazon Flex:** blocchi di consegna, routing, scansione consegna.

## 🧩 Funzionalità per MyCity
App/area rider: ricezione ordini assegnati, navigazione al negozio e al cliente, cambio stato (ritirato/consegnato), prova di consegna. Dispatching: assegnazione ordine→rider (manuale all'inizio, poi automatica).

## ✅ Requisiti minimi v1
- Anagrafica rider + onboarding base
- Assegnazione ordine a rider (manuale ok per iniziare)
- App rider con stati e GPS
- Conferma consegna (foto/firma/codice)

## 🔗 Dipendenze
- Alimenta → [[Tracking Live Consegna]]
- Coordinata da → [[Dashboard Operativa]]
- Alternativa: il negozio consegna in proprio o 3PL → decisione in [[Decisioni Aperte]]
- Stati confluiscono in → [[Gestione Stato Ordine]]

## 📈 Metrica di successo
Tempo di assegnazione rider · % consegne on-time · costo per consegna.

## 🛠️ Note tecniche
- App mobile rider (PWA o nativa) con GPS in background.
- Dispatching: v1 manuale, poi algoritmo (vicinanza, carico).
- Decisione strategica: non attivare prima di avere densità di ordini.

#glovo #consegna
