# Checklist onboarding batch — 6 luglio 2026

> @onboarding-negozi · 🟢 preparato AD giro 1/7 02:17 · per Nicola (inserimento negozi)

## Prima di iniziare (Nicola)
- [ ] Lista negozi da inserire (nome, indirizzo, tel, categoria, referente)
- [ ] Foto prodotti/vetrina (min. 3 per negozio) o slot per scatto AD
- [ ] Orari apertura + slot consegna
- [ ] IBAN / dati fatturazione (per payout Stripe sandbox)

## Per ogni negozio (~20 min done-for-you)

### 1. Vetrina
- [ ] Profilo seller creato · `store_name`, indirizzo, tel, logo
- [ ] Descrizione bottega (2-3 righe, tono Turno)
- [ ] `approval_status` → approved (dopo check dati)

### 2. Catalogo minimo LIVE
- [ ] ≥5 prodotti **available** (nome, prezzo, foto, categoria)
- [ ] Zero prodotti draft obbligatori al go-live
- [ ] Stock >0 su freschi

### 3. Pagamenti (sandbox — decisione Nicola 1/7 01:02)
- [ ] Stripe Connect onboarding avviato
- [ ] `stripe_charges_enabled` + `stripe_payouts_enabled` verificati
- [ ] Test payout sandbox (Nicola programmato **03/7 mattina**)

### 4. Consegna
- [ ] Fee consegna comunicata al negozio (⚠️ UI checkout: fee €3/negozio **non visibile** — bloccante Sprint 1 radiografia)
- [ ] ZTL/orari rider allineati

### 5. Go-live check
- [ ] Ordine test end-to-end (COD o sandbox)
- [ ] QR cassa (se materiale pronto)
- [ ] Contratto 12% / termini — bozza Pane Quotidiano come template: `consegne/legale/contratto-pane-quotidiano-bozza.md`

## Dopo il batch
- [ ] Aggiornare STATO + registro-realta (nuovi negozi confermati)
- [ ] Non usare kit bando FESR Commercio ER finché non rivisto (#12 — sportello **chiuso 23/6**)

## Riferimenti
- Payout faro: `consegne/finanza/payout-faro.md`
- Radiografia bloccanti pre-live: `consegne/audit/2026-07-01-radiografia.md`
- Pacchetto ordine zombie PQ: `consegne/operations/pacchetto-sblocco-ordine-zombie-19-05.md`
