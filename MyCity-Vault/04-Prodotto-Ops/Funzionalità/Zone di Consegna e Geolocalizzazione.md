---
area: Consegna
fonte_ispirazione: Glovo
priorità: P0
effort: M
fase: MVP+1
---

# Zone di Consegna e Geolocalizzazione

> La base della consegna locale: definire **dove** un negozio consegna e mostrare al cliente solo ciò che può davvero arrivare a casa sua.

## 🎯 Problema utente
- **Cliente:** non voglio vedere prodotti che non possono essere consegnati a casa mia.
- **Negoziante:** voglio vendere solo nelle zone che riesco a coprire.
- **Operations:** servono confini chiari per organizzare la consegna.

## 🏆 Come lo risolvono i grandi
- **Glovo:** ogni negozio ha un raggio/poligono di consegna; il cliente inserisce l'indirizzo e vede solo i negozi che lo coprono. ETA calcolato sulla distanza.
- **Amazon:** verifica CAP/indirizzo per disponibilità e tempi.
- **eBay:** località e zone di spedizione del venditore.

## 🧩 Funzionalità per MyCity
Ogni negozio definisce la sua **area di consegna** (raggio in km o quartieri/CAP). Il cliente inserisce l'indirizzo → MyCity mostra solo negozi/prodotti che lo coprono e stima un ETA locale. Gestione fee in base alla distanza (opzionale).

## ✅ Requisiti minimi v1
- Geocoding indirizzo cliente (lat/long)
- Area di consegna per negozio (raggio o lista CAP/quartieri)
- Filtro "consegnabile qui" applicato a ricerca e checkout
- ETA stimato semplice (per fascia/distanza)

## 🔗 Dipendenze
- Definita durante → [[Onboarding Venditori Self-Service]]
- Filtra → [[Ricerca e Navigazione Catalogo]]
- Blocca/abilita → [[Carrello e Checkout]]
- Mostra ETA su → [[Scheda Prodotto]]
- Base per → [[Tracking Live Consegna]] e [[Gestione Rider e Pool Fattorini]]

## 📈 Metrica di successo
% indirizzi coperti da ≥1 negozio · % checkout bloccati per "fuori zona" (da ridurre acquisendo negozi).

## 🛠️ Note tecniche
- Geocoding (Google/Mapbox/Nominatim). Coordinate sui negozi e indirizzi.
- v1: raggio (distanza haversine) o match su CAP. A scala: poligoni (PostGIS).

#glovo #mvp #priorità/alta #consegna
