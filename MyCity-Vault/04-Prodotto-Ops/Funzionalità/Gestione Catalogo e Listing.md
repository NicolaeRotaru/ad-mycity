---
area: Catalogo
fonte_ispirazione: Amazon
priorità: P0
effort: M
fase: MVP+1
---

# Gestione Catalogo e Listing

> Lo strumento con cui il negozio mette i suoi prodotti in vendita. Senza prodotti, il marketplace è una vetrina vuota.

## 🎯 Problema utente
- **Negoziante:** vuole caricare i suoi prodotti (foto, prezzo, descrizione, disponibilità) in modo semplice e veloce.
- **Cliente:** vuole vedere prodotti chiari, con foto vere e prezzi corretti.

## 🏆 Come lo risolvono i grandi
- **Amazon:** catalogo a SKU condivisi — una scheda prodotto, più venditori che ci si "agganciano". Categorie e attributi strutturati.
- **eBay:** listing liberi per venditore (titolo, foto, condizione, prezzo). Più flessibile, adatto a venditori eterogenei.
- **Glovo:** menu/prodotti per negozio con categorie, foto, prezzi, varianti.

## 🧩 Funzionalità per MyCity
Editor prodotto per il negozio: titolo, descrizione, foto multiple, prezzo, categoria, disponibilità, eventuali varianti (taglia/peso). Modello consigliato all'inizio: **listing liberi per negozio** (stile eBay/Glovo), perché i negozi locali sono eterogenei (alimentari, ferramenta, fiori…). Decisione in [[Decisioni Aperte]].

## ✅ Requisiti minimi v1
- CRUD prodotto con foto, prezzo, descrizione, categoria, disponibilità on/off
- Categorie predefinite (per ricerca e navigazione)
- Pubblica / metti in bozza
- Validazione prezzo e foto obbligatoria

## 🔗 Dipendenze
- Si accede da → [[Dashboard Venditore]]
- Alimenta → [[Scheda Prodotto]] e [[Ricerca e Navigazione Catalogo]]
- Evolve in → [[Gestione Inventario e Disponibilità]]

## 📈 Metrica di successo
N. prodotti pubblicati per negozio · % negozi con ≥5 prodotti live.

## 🛠️ Note tecniche
- Modello `product` legato a `seller_id`, con categoria, prezzo, stock flag.
- Storage immagini + ridimensionamento/ottimizzazione.
- Tassonomia categorie semplice e condivisa per abilitare i filtri.

#amazon #mvp #priorità/alta #catalogo
