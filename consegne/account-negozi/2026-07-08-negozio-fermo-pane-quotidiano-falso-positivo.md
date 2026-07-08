---
data: 2026-07-08 10:31
reparto: account-negozi / AD
tipo: verifica-sentinella (cancello di serietà 🔬)
esito: falso positivo — nessun tocco anti-churn
---

# Sentinella «NEGOZIO FERMO» su Pane Quotidiano — falso positivo, non churn

## Cosa ha chiesto la sentinella
`negozio_fermo` (firma `c0b240c0…`) ha svegliato la macchina il **2026-07-08 10:28**:
> «1 negozio LIVE con 0 ordini negli ultimi 14 giorni (Pane Quotidiano). Prepara un
> check-in personalizzato anti-churn … se serve contattarli, prepara il messaggio.»

## Verdetto AD: NON preparo il tocco anti-churn. È un falso positivo noto.
Tre prove convergenti (verifica prima di agire, cancello 🔬):
1. **Correzione esplicita di Nicola (6/7).** Alla card «Chiama il fornaio di PQ per
   tenerlo dentro»: *«non c'è bisogno con PQ, li conosco e aspettano finché tutto non
   è pronto»*. PQ è una **relazione gestita direttamente da Nicola** + **attesa concordata**.
2. **Fatti canonici** (`registro-fatti.json`): PQ è l'**unico negozio reale** (faro), il
   lavoro operativo riprende il **13/7** (onboarding 6 botteghe, Nicola di persona), primo
   ordine reale non prima del **17/7**. I "0 ordini in 14g" sono **attesa pianificata**, non abbandono.
3. **Già deciso in coda:** azioni **#25** (A6 check-in) e **#29** (A9 rassicurazione) sono
   **❌ CHIUSE da Nicola il 6/7** per questo identico motivo. #56 (veglia anti-churn armata
   il 7/7) annota già «PQ non-churn».

Un tocco anti-churn qui = telefonata inutile su una relazione solida → **infastidisce**, non aiuta.
L'unica azione valida su PQ resta l'**upsell 🟢 (A7) DOPO la 1ª consegna**, come crescita non retention.

## Causa radice (perché la sentinella ricasca ogni giro)
`cervello/sentinella-dati.mjs:189-192`: il sensore conta **ogni** seller approvato da >14g con
0 ordini in 14g. **Non conosce l'eccezione «attesa concordata»** → finché PQ non incassa
(dal 13-17/7) tornerà a suonare a ogni giro (~ogni 2h): rumore che consuma cervello e, quando
colleghiamo le «mani», rischia un tocco automatico su una relazione che Nicola gestisce a mano.
Analogo a #24 (esclusione demo/seed) ma su un **negozio reale in attesa** — fix diverso.

## Proposta (🟡, firma tua — auto-modifica, non la applico da sola) → card #58
Allowlist «attesa concordata» nel sensore `negozio_fermo`, alimentata dal `registro-fatti.json`
(nessun id hard-coded nel codice): un seller in attesa concordata NON alza l'allarme churn finché
non ha il primo incasso. Patch minima e reversibile nel dettaglio della card #58.

## Loop
- 🟢 FATTO: falso positivo classificato, tocco anti-churn **bloccato**, traccia in DECISIONI.
- ⏳ ACCODATO: #58 — allowlist attesa-concordata nel sensore (spegne il rumore alla radice).
- 🙋 SERVE DA NICOLA: la firma su #58 (auto-modifica). Nessun contatto a PQ.
