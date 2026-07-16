---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + STATO · AR-030)
aggiornato: 2026-07-16 12:24
---

# ✅ Cose che devo fare io (Nicola)

> Solo ciò che richiede **te**: firme, merge, materiali, decisioni umane.
> Rigenerata dal giro 16/7 12:24.

## 🔥 OGGI — T-1 al Venerdì Piacentini (17/7)

- [ ] 🔴 **Chiama Pane Quotidiano ORA** — **0523 388601** (Via Calzolai 25). Script pronto: «Venerdì sera c'è il VP, passo da te al banco con il QR, ritiro dal banco (bici non pronta)». Scopo: PQ sa che sei lì, rischio "qui non vendo" scende → primo ordine ritiro North Star 0→1.
  → Card in coda: `#ritiro-pq-vp17-checkin`

- [ ] 🔴 **Stasera o domani mattina presto — pubblica il post kefir** (`consegne/content/2026-07-14-post-del-giorno-kefir-caldo-PQ.md`). Serve da te: ① link lista d'attesa (incollalo → la macchina completa il primo commento) ② foto kefir reale (oppure usa il tipografico neutro già pronto).
  → Card in coda: `#post-kefir-estate-1407`

## 🟡 Pannello — 3 PR da mergiare (Azioni → Da approvare)

- [ ] 🔴 **Approva PR #380** — miniatura foto allegata visibile (fluttuante + Assistente). Dopo: su iPhone chiudi e riapri il Pannello.
- [ ] 🔴 **Approva PR #381** — efficienza costo AI (5/6 finding chiusi, 1 resta tua decisione timer mattino).
- [ ] 🔴 **Approva PR #403** — fix tecnici giro (motore-principale, attrezzi worker). Dopo: Ctrl+Shift+R su Radiografia.

## 🧱 Piattaforma — blocchi prima di scalare

- [ ] 🟡 **Metti BURN_MENSILE_EUR=XXXX in `vps/.env`** — quanto spendi al mese (VPS+Vercel+Cursor+AI+domini). Senza questa variabile il runway resta «sconosciuto» (109 giri). Anche una stima (es. 150€/mese) è utile.
  → Card in coda: `#burn-mensile-runway`

- [ ] 🟡 **PAT GitHub write su `NicolaeRotaru/mycity`** — incollalo in `GIT_PUSH_TOKEN` (VPS `.env`). Sblocca push branch e PR direttamente sul marketplace senza passare da te ogni volta.
  → Card in coda: `#14`

- [ ] 🟡 **SQL 107 + migrazione RLS profiles** — ultimo blocco sicurezza prima di aprire le 6 botteghe. Deploy coordinato SQL+codice (non il solo SQL). Dossier pronto: `consegne/security/2026-07-08-chiusura-blocco-107-profiles.md`.
  → Card in coda: `#32`

## 📅 Finestra VP 17/7 — domani sera

- [ ] 🔴 **Primo ordine reale su Pane Quotidiano** — ritiro al banco (non consegna a domicilio, bici non pronta). Accetta → ritiro COD → payout-test. North Star 0→1.
  → Gate: chiama prima (riga sopra) → poi domani sera al banco.

## ⏳ Gate automatici (partono soli al 1° ordine consegnato)

> Recupero carrello · prima recensione · referral · payout-test batch — si attivano con il 1° ordine consegnato (North Star 0→1).

## 📋 Coda media priorità

- [ ] 🟡 **Approva autofill 252 prodotti "condizione=nuovo"** — reversibile, backup riga per riga, sola scrittura campi vuoti.
- [ ] 🟡 **Approva autofill 242 prodotti "unità=pezzo"** — stesso meccanismo.
- [ ] 🟡 **PR #297 archivio parallelo** — Archivio Pannello carica in 1-2s invece di 15s.
- [ ] 🟡 **PR #212 sicurezza (37 fix marketplace)** — serve PAT Contents R/W su `NicolaeRotaru/mycity`.

---
> Rimosso rispetto alla versione 13/7: PR #346/#348 ✅ · merge #374/#373/#359/#358/#357 ✅ · PR #383 ✅ MERGIATA 15/7.
