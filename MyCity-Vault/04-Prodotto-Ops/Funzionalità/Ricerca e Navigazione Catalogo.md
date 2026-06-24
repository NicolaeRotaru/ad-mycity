---
area: Catalogo
fonte_ispirazione: Amazon
priorità: P0
effort: M
fase: MVP+1
---

# Ricerca e Navigazione Catalogo

> Il modo in cui il cliente trova cosa comprare. Se non trova, non compra.

## 🎯 Problema utente
- **Cliente:** "Voglio del pane / una vite M6 / un mazzo di fiori vicino a me." Deve trovarlo in pochi tap, filtrato per ciò che è davvero consegnabile a casa sua.
- **Negoziante:** vuole essere trovato dai clienti del suo quartiere.

## 🏆 Come lo risolvono i grandi
- **Amazon:** barra di ricerca dominante, autocomplete, filtri (prezzo, categoria, rating, disponibilità), ordinamento per rilevanza.
- **eBay:** ricerca + filtri per condizione, venditore, prezzo, località.
- **Glovo:** navigazione per categorie e per negozio, con filtro implicito "consegnabile alla tua posizione".

## 🧩 Funzionalità per MyCity
Ricerca testuale + navigazione per categorie e per negozio. **Filtro geografico chiave:** mostra solo prodotti consegnabili all'indirizzo del cliente. Ordinamento per rilevanza/disponibilità/vicinanza.

## ✅ Requisiti minimi v1
- Barra di ricerca per nome prodotto
- Browse per categoria e per negozio
- Filtro "consegna alla mia zona" (basato su [[Zone di Consegna e Geolocalizzazione]])
- Solo prodotti disponibili in evidenza

## 🔗 Dipendenze
- Cerca dentro → [[Gestione Catalogo e Listing]]
- Filtra per → [[Zone di Consegna e Geolocalizzazione]]
- Porta a → [[Scheda Prodotto]]
- Evolverà con → [[Raccomandazioni Personalizzate]] (P2)

## 📈 Metrica di successo
Search success rate (% ricerche con click su risultato) · % ricerche a zero risultati (da minimizzare).

## 🛠️ Note tecniche
- v1: ricerca SQL/full-text semplice. A scala: motore di ricerca dedicato (es. Postgres FTS → poi Typesense/Elastic).
- Indicizzare categoria + zona di consegna per il filtro geografico.

#amazon #mvp #priorità/alta #catalogo
