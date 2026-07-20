---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + STATO · AR-030)
aggiornato: 2026-07-20 20:22
---

# ✅ Cose che devo fare io (Nicola)

> Solo ciò che richiede **te**: firme, merge, materiali, decisioni umane.
> Rigenerata dal giro 20/7 20:22 — focus **1° ordine pagato** (AR-111).

---

## 🔴 URGENTE — sblocca la North Star

- [ ] 🟡 **Fai un ordine su Pane Quotidiano** — anche piccolo (€3–5). Unico sblocco diretto North Star 0→1. Apri mycity-marketplace.com → prodotto PQ → checkout. ~10 min.
  → Card: `#ordine-test-pq`

- [ ] 🔴 **Manda la domanda PI26 su restart.infocamere.it** — sportello **aperto fino al 30/7 ore 16:00** (ordine cronologico). 50% fondo perduto, max €10.000. Bozza in `consegne/relazioni-istituzionali/`.
  → Card: `#bandi-cciaa-2007`

- [ ] 🔴 **Pubblica un post social su PQ** — recupero domenica/lunedì: `#post-domenica-settimana-1907` o `#post-lunedi-turno-mattina-2007` (testi pronti in `consegne/content/`).
  → Card: content-social

---

## 🟡 QUESTA SETTIMANA — dopo il 1° ordine

- [ ] 🟡 **Senti il fornaio (Pane Quotidiano)** — tel. 0523 388601. «Com'è andata? Con la pioggia di domani proviamo la consegna a domicilio?» + chiedi prezzo tazzina.
  → Card: `#checkin-pq-postvp`

- [ ] 🟡 **Pubblica post meteo martedì 21/7** — piogge previste. Testo in `consegne/content/2026-07-18-post-meteo-pioggia.md`. **Dopo** ordine test PQ.
  → Card: `#post-meteo-pioggia-20lug`

- [ ] 🟡 **Definisci zona, orario e ordine minimo prima consegna** — raggio (es. 3 km), fasce (12–14 / 18–20), minimo (es. €10).
  → Card: `#zona-orario-consegna`

---

## 🟡 ENV & INFRA (sblocchi macchina)

- [ ] 🟡 **Accendi Telegram sul VPS** — `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` in `cervello/vps/.env` → restart worker. Poi workflow n.31 e n.41 in n8n Active.
  → Card: `#accendi-intelligence-sveglia`

- [ ] 🟡 **Aggiungi BURN_MENSILE_EUR nel .env VPS** — es. `BURN_MENSILE_EUR=150` → restart worker. Sblocca calcolo runway.
  → Card: `#burn-mensile-env`

- [ ] 🟡 **Mergia PR #219** (opzionale) — allinea host PostHog sito Render a US (`us.i.posthog.com`). Unifica eventi sito con account US.
  → Link in chat 20/7 — nessuna card merge (L-402)

---

## 🟡 MATERIALI MANCANTI (procura)

- [ ] 🟡 **Logo e città Pane Quotidiano** — supervisione segnala gap: serve foto/logo reale per scheda negozio.
  → Report: `consegne/supervisione/2026-07-20-supervisione.md`

- [ ] 🟡 **Tazzina espresso PQ** — scegli candidato + prezzo vendita (Excelsa ~€31 set 6 vs Ginori ~€55).
  → Card: `#inserisci-tazzina-pq`

---

## ⏳ IN CODA (non bloccano il 1° ordine)

- [ ] 🔴 **Accendi referral 5€+5€** — gate: ordine PQ consegnato + cliente contento. Playbook in `consegne/crm/`.
  → Card: `#referral-porta-un-amico`

- [ ] 🟡 **Welcome email ai 4 buyer** — solo dopo PQ operativo. Testo: `consegne/crm/welcome-email-23.md` (aggiorna numero).
  → Card: `#welcome-email-23`

- [ ] 🟡 **3 WhatsApp anchor PI26** — Garetti, Peretti, Amendolara. Testi in `consegne/vendite/2026-07-18-whatsapp-anchor-pi26.md`.
  → Card: `#whatsapp-3-anchor-pi26`

---

> ✅ Fatto oggi 20/7: demo eliminati (1 PQ · 5 prodotti) · PostHog verde VPS+Pannello · coerenza-fatti pricing bonificata · card merge obsolete rimosse (L-402)
