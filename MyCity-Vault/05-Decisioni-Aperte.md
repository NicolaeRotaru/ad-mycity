# 🔀 05 — Decisioni Aperte (trade-off & domande)

> Domande strategiche da risolvere. Ognuna blocca o influenza più feature.

## 1. Modello di consegna: rider propri vs negozi vs 3PL
- **Opzione A — il negozio consegna** (come molti marketplace locali early): zero costi logistici, ma qualità incostante e niente [[Tracking Live Consegna]] vero.
- **Opzione B — pool rider MyCity** (modello Glovo): controllo qualità + tracking, ma costoso e operativamente pesante → [[Gestione Rider e Pool Fattorini]].
- **Opzione C — 3PL / corrieri locali**: scalabile, ma margine eroso e poca esperienza live.
- 👉 *Raccomandazione AGGIORNATA (vedi [[18-Operazioni-e-Logistica]]):* con il **carrello multi-negozio l'Opzione A è incompatibile** (5 botteghe non consegnano alla stessa porta). Va scelta **B = rider proprio su cargo-bike elettrica** (accesso ZTL 8-19), con **batching giornaliero D+1** e micro-hub di consolidamento. All'inizio il rider è il fondatore. Decide molto di [[Area - Consegna]].

## 2. Pagamenti: marketplace vs facilitatore
- Incassiamo noi e poi [[Pagamenti e Payout Venditori]] (split payment, modello Amazon/eBay) **oppure** il cliente paga il negozio direttamente?
- Incassare noi = controllo su fiducia, resi, commissioni, dati — ma serve compliance (KYC, antiriciclaggio, gestione fondi di terzi).
- 👉 *Raccomandazione:* incassare noi tramite PSP con split (es. Stripe Connect) fin da subito. Sblocca [[Gestione Resi e Rimborsi]] e fiducia. Richiede [[Verifica e KYC Venditori]].

## 3. Commissioni: chi paga e quanto
- Commissione sul venditore (% GMV), fee di consegna sul cliente, o entrambe?
- Trade-off: fee alte sul cliente uccidono la conversione locale; fee alte sul negozio rallentano l'onboarding ([[Onboarding Venditori Self-Service]]).
- 👉 *Raccomandazione (dati):* commissione al negozio **10-15%** (vs ~30% di Glovo, odiato dai negozi) + **fee consegna al cliente ~€2,50** (benchmark Daje) o €4-5 (Everli). È la leva di vendita verso i negozi. ⚠️ Verificare che il margine copra il costo consegna **solo col batching** (vedi [[09-Ricerca-Mercato-e-Numeri|§4]] e [[13-Casi-Studio]]).
- 👉 Da definire prima di [[Carrello e Checkout]].

## 4. Curato vs aperto (chi può vendere)
- Selezioniamo i negozi a mano (qualità, modello Glovo early) o apertura self-service totale (modello eBay)?
- 👉 *Raccomandazione:* **curato + onboarding assistito** nei primi N negozi, poi self-service con [[Verifica e KYC Venditori]].

## 5. Profondità del catalogo: strutturato vs libero
- Catalogo a SKU condivisi (modello Amazon, 1 scheda per prodotto, più venditori) **oppure** listing liberi per negozio (modello eBay)?
- Per negozi locali eterogenei (alimentari, fiorai, ferramenta) il modello eBay/listing-libero è più realistico all'inizio. Impatta [[Gestione Catalogo e Listing]] e [[Ricerca e Navigazione Catalogo]].

## 6. Geografia di lancio
- Una sola città/quartiere a fondo (densità) vs espandere presto? La densità locale è ciò che rende sostenibile [[Area - Consegna]].
- 👉 *Raccomandazione:* dominare **un quartiere** prima di espandere.

## 7. Cold start della fiducia
- Senza recensioni iniziali, come convincere il primo cliente? Garanzia MyCity? Reso facile? → vedi [[Gestione Resi e Rimborsi]] e [[Customer Support e Centro Assistenza]].

## 8. Nome del brand: "MyCity" vs un nome piacentino
- "MyCity" è inglese, generico, non dice Piacenza/botteghe/fresco → debole per un brand la cui forza è l'identità civica.
- 👉 *Raccomandazione (vedi [[25-Brand-e-Posizionamento]]):* valutare **`Bottega Piacenza`** + firma `la Primogenita`, oppure tenere MyCity con architettura endorser ("MyCity · le botteghe del centro di Piacenza"). Decisione da prendere prima di investire in identità visiva/stampa.

#decisioni #mvp #priorità/alta
