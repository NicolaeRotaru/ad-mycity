---
tipo: gate-compliance
owner: qa + legale-privacy
colore: 🔴
creato: 2026-07-02 12:59
---

# 🔴 GATE COMPLIANCE PRE-LANCIO — checklist bloccante prima della prima consegna di deperibili

> Difetto AR-017: HACCP/catena del freddo è un rischio 🔴 ("sanzioni a prescindere dal fatturato") ma non
> c'era **alcun cancello** che impedisse a un negozio di deperibili di andare LIVE senza i requisiti. Questo
> file È il cancello: nessun negozio che vende **freschi/deperibili** (carne, pesce, latticini, gastronomia)
> va LIVE finché ogni riga qui sotto non è ✅. La sentinella "Negozio di deperibili verso LIVE senza gate
> compliance" (in `cervello/sentinelle.md`) rimanda qui. Owner: **@qa + @legale-privacy**. Firma finale: 🔴 Nicola.

## Come si usa
Per ogni negozio di deperibili, copia questo blocco in `consegne/vendite/<negozio>-gate-compliance.md`, spunta,
e allega le prove (attestati, foto contenitori, ricevuta SCIA/ASL). Se anche UNA riga è ❌ → **LIVE bloccato**.

## ✅ Checklist (rischi N1-N4, N6 di [[Rischi & Compliance]])

### 🧊 HACCP / catena del freddo (N3) — BLOCCANTE
- [ ] Contenitori isotermici idonei + gel refrigeranti (foto allegata)
- [ ] Attestato HACCP valido per **ogni** rider che consegna quel negozio (copia allegata)
- [ ] Manuale HACCP con **finestre di consegna** e temperature (~0/+4°C freschi; ≤−18°C surgelati)
- [ ] Notifica/SCIA alla **ASL di Piacenza** effettuata (ricevuta allegata) · 🟡 confermata idoneità contenitori
- [ ] Registro pulizia contenitori attivo

### 💳 Pagamenti (N1) — BLOCCANTE
- [ ] Incasso via **PSP con split payment** (Stripe Connect): i fondi NON atterrano sul conto MyCity
- [ ] `payout` verso il negozio testato almeno una volta (importo simbolico) e riconciliato

### 🧑‍🔧 Rider (N4) — BLOCCANTE
- [ ] Rider inquadrato (subordinato o co.co.co. CCNL rider) con **INAIL attiva** · 🟡 contratto validato da consulente del lavoro

### 🍷 Alcolici (N6) — se il negozio vende vino/alcolici
- [ ] Verifica **età 18+** attiva in checkout **e** alla consegna

### 🧾 Fiscale (N5) — non bloccante per il LIVE ma da tracciare
- [ ] Modello di **mandato/intermediazione** in essere (MyCity mandatario, non rivenditore) · 🟡 validato da commercialista

## Esito
- Negozio: __________  ·  Data: __________  ·  Compilato da: @qa/@legale-privacy
- Tutte le righe BLOCCANTI ✅ → **proposta LIVE** a Nicola (🔴 firma)
- Anche una ❌ → **LIVE BLOCCATO**, apri le azioni mancanti in [[AZIONI-IN-ATTESA]]
