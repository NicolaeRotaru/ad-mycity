---
area: Crescita
fonte_ispirazione: Amazon
priorità: P2
effort: L
fase: Maturità
---

# Raccomandazioni Personalizzate

> Il motore di retention di Amazon: mostrare alla persona giusta il prodotto giusto. Si attiva solo con dati sufficienti.

## 🎯 Problema utente
- **Cliente:** "Suggeriscimi cosa potrebbe servirmi, fammi riscoprire i negozi del quartiere."
- **Per MyCity:** aumentare frequenza d'acquisto e scoperta dei negozi.

## 🏆 Come lo risolvono i grandi
- **Amazon:** "ispirato ai tuoi acquisti", "spesso comprati insieme", riacquisto.
- **Glovo:** "riordina", negozi vicini consigliati, preferiti.

## 🧩 Funzionalità per MyCity
Sezioni personalizzate: "riordina", "negozi vicino a te", "popolari nel tuo quartiere", "completa l'ordine". Inizio semplice (riordina + popolari per zona), poi modelli più sofisticati.

## ✅ Requisiti minimi v1
- "Riordina" (storico ordini del cliente)
- "Popolari nella tua zona" (best seller per quartiere)

## 🔗 Dipendenze
- Richiede dati da → [[Gestione Stato Ordine]] e [[Ricerca e Navigazione Catalogo]]
- ⚠️ Cold start: inutile senza traffico (vedi [[Roadmap & Stato Prodotto]] e [[Decisioni Aperte]])
- Si mostra in homepage e → [[Scheda Prodotto]]

## 📈 Metrica di successo
CTR raccomandazioni · % ordini da riacquisto · frequenza d'acquisto.

## 🛠️ Note tecniche
- v1: regole (riordina, top per zona). Poi collaborative filtering / embeddings.
- Necessita event tracking (view, add-to-cart, purchase).

#amazon #crescita
