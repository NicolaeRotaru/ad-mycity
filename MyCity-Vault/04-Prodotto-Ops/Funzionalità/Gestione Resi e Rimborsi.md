---
area: Pagamenti
fonte_ispirazione: Amazon
priorità: P1
effort: M
fase: Scala
---

# Gestione Resi e Rimborsi

> La rete di sicurezza che fa comprare senza paura. "Se va male, mi rimborsano" è ciò che sblocca il primo acquisto.

## 🎯 Problema utente
- **Cliente:** "Se il prodotto è sbagliato/non arriva/è di scarsa qualità, riavrò i miei soldi?"
- **Negoziante:** vuole regole chiare e non subire abusi.
- **Per MyCity:** i rimborsi gestiti bene costruiscono fiducia; gestiti male bruciano cassa e reputazione.

## 🏆 Come lo risolvono i grandi
- **Amazon:** reso facile, A-to-z Guarantee, rimborso rapido, spesso a favore del cliente.
- **eBay:** Money Back Guarantee, processo di reso con finestre temporali.
- **Glovo:** rimborso/credito per ordini mancanti o errati, spesso istantaneo.

## 🧩 Funzionalità per MyCity
Flusso di richiesta rimborso/reso dal cliente (motivo, foto), decisione (auto per casi semplici, manuale per il resto), rimborso tramite PSP, addebito al negozio se responsabile. Politica di reso chiara.

## ✅ Requisiti minimi v1
- Richiesta rimborso dal cliente con motivo
- Rimborso (totale/parziale) via [[Pagamenti e Payout Venditori]]
- Aggiornamento [[Gestione Stato Ordine]] → "rimborsato"
- Regole base (finestra temporale, casi ammessi)

## 🔗 Dipendenze
- Usa → [[Pagamenti e Payout Venditori]]
- Aggiorna → [[Gestione Stato Ordine]]
- Sfocia in → [[Gestione Dispute]] se contestato
- Gestita anche da → [[Customer Support e Centro Assistenza]]

## 📈 Metrica di successo
Tasso di reso/rimborso · tempo di risoluzione · CSAT post-rimborso.

## 🛠️ Note tecniche
- Refund API del PSP (totale/parziale).
- Logica di addebito al negozio (riduzione payout) se colpa sua.
- Audit trail su [[Gestione Stato Ordine]].

#amazon #pagamenti #fiducia
