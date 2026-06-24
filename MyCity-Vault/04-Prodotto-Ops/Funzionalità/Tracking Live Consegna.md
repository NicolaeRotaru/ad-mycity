---
area: Consegna
fonte_ispirazione: Glovo
priorità: P1
effort: L
fase: Scala
---

# Tracking Live Consegna

> La magia "Glovo": vedere il tuo ordine muoversi sulla mappa. Riduce l'ansia e le chiamate al supporto.

## 🎯 Problema utente
- **Cliente:** "Dov'è il mio ordine, quanto manca?" Vuole certezza in tempo reale.
- **Operations:** vuole vedere le consegne in corso e intervenire sui ritardi.

## 🏆 Come lo risolvono i grandi
- **Glovo:** mappa live con posizione del rider, ETA aggiornato, fasi (in preparazione → in viaggio → quasi arrivato).
- **Amazon:** mappa "X fermate prima della tua" nel giorno della consegna.

## 🧩 Funzionalità per MyCity
Pagina di tracking dell'ordine con stato live e, dove c'è un rider, posizione su mappa + ETA. Dove il negozio consegna in proprio, almeno gli stati real-time ("in preparazione → in consegna → consegnato").

## ✅ Requisiti minimi v1
- Pagina tracking per ordine con stato real-time
- Posizione rider su mappa (se modello rider) → [[Gestione Rider e Pool Fattorini]]
- ETA aggiornato

## 🔗 Dipendenze
- Si basa su → [[Gestione Stato Ordine]]
- Richiede (per la mappa) → [[Gestione Rider e Pool Fattorini]]
- ETA da → [[Zone di Consegna e Geolocalizzazione]]
- ⚠️ Non costruire prima di avere ordini reali (vedi [[Roadmap & Stato Prodotto]] anti-pattern)

## 📈 Metrica di successo
% ordini con tracking aperto · riduzione ticket "dov'è il mio ordine".

## 🛠️ Note tecniche
- Posizione rider via app rider (GPS) → backend → client (websocket).
- ETA = distanza + storico tempi. Mappe (Mapbox/Google).

#glovo #consegna
