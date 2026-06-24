---
area: Pagamenti
fonte_ispirazione: Amazon
priorità: P0
effort: M
fase: MVP+1
---

# Carrello e Checkout

> Il momento della verità: dove il cliente passa da "mi piace" a "ho pagato". Il primo ordine nasce qui.

## 🎯 Problema utente
- **Cliente:** vuole comprare in pochi tap, pagare in modo sicuro, sapere quando arriva e quanto paga di consegna.
- **Negoziante:** vuole ordini confermati e pagati, non "interessati" che spariscono.

## 🏆 Come lo risolvono i grandi
- **Amazon:** 1-Click, carrello persistente, checkout minimale, indirizzo e pagamento salvati.
- **eBay:** checkout con riepilogo costi (prodotto + spedizione), pagamento integrato.
- **Glovo:** carrello per negozio, fee di consegna trasparente, indirizzo geolocalizzato, ETA visibile prima di pagare.

## 🧩 Funzionalità per MyCity
Carrello + checkout con: indirizzo di consegna (geolocalizzato), riepilogo costi (prodotti + fee consegna + commissione se sul cliente), metodo di pagamento, ETA di consegna. **Gestire carrelli multi-negozio**: se il cliente compra da 2 negozi, sono 2 consegne (decisione importante).

## ✅ Requisiti minimi v1
- Carrello (anche single-negozio per iniziare)
- Inserimento indirizzo + verifica copertura zona
- Riepilogo costi trasparente
- Pagamento online (carta) via PSP
- Conferma ordine

## 🔗 Dipendenze
- Parte da → [[Scheda Prodotto]]
- Richiede → [[Pagamenti e Payout Venditori]] (incasso + split)
- Verifica copertura con → [[Zone di Consegna e Geolocalizzazione]]
- Genera → [[Gestione Stato Ordine]] e [[Notifiche Transazionali]]
- Commissioni/fee → decisione in [[Decisioni Aperte]]

## 📈 Metrica di successo
Checkout completion rate (carrello → pagato) · valore medio ordine (AOV).

## 🛠️ Note tecniche
- Integrazione PSP (es. Stripe) con Payment Intent.
- Validazione indirizzo dentro zona di consegna **prima** del pagamento.
- v1: 1 negozio per ordine. Multi-negozio = multi-consegna in fase Scala.

#amazon #mvp #priorità/alta #pagamenti
