---
area: Catalogo
fonte_ispirazione: Amazon
priorità: P0
effort: S
fase: MVP+1
---

# Scheda Prodotto

> La pagina dove avviene la decisione d'acquisto. Converte un curioso in un cliente.

## 🎯 Problema utente
- **Cliente:** "È quello che cerco? È disponibile? Quanto costa? Chi lo vende? Quando arriva?" Tutto deve essere chiaro in 5 secondi.
- **Negoziante:** vuole che il suo prodotto sia presentato bene per vendere.

## 🏆 Come lo risolvono i grandi
- **Amazon:** foto, titolo, prezzo, disponibilità, "venduto da", recensioni, tempi di consegna, CTA "Aggiungi al carrello" sempre visibile.
- **eBay:** condizione prodotto, venditore con reputazione visibile, costi e tempi di spedizione.
- **Glovo:** foto, descrizione breve, prezzo, disponibilità del negozio, tempo di consegna stimato.

## 🧩 Funzionalità per MyCity
Pagina prodotto con: foto, titolo, prezzo, descrizione, negozio venditore (con link al profilo), disponibilità, **zona/tempo di consegna stimato locale**, CTA aggiungi al carrello.

## ✅ Requisiti minimi v1
- Foto + titolo + prezzo + descrizione + nome negozio
- Stato disponibilità (disponibile / esaurito)
- CTA "Aggiungi al carrello"
- Indicazione consegna ("Consegna nel tuo quartiere oggi/in X")

## 🔗 Dipendenze
- Dati da → [[Gestione Catalogo e Listing]]
- Raggiunta da → [[Ricerca e Navigazione Catalogo]]
- Porta a → [[Carrello e Checkout]]
- Mostrerà → [[Recensioni e Rating Prodotti]] e [[Reputazione Venditore]] (fase Scala)
- Consegna stimata da → [[Zone di Consegna e Geolocalizzazione]]

## 📈 Metrica di successo
Conversion rate scheda → "aggiungi al carrello".

## 🛠️ Note tecniche
- Pagina con URL SEO-friendly (utile poi per [[SEO Locale e Pagine Negozio]]).
- Componenti riusabili (badge disponibilità, blocco venditore, blocco consegna).

#amazon #mvp #priorità/alta #catalogo
