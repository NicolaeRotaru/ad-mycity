---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + STATO · AR-030)
aggiornato: 2026-07-29 06:20
---

# ✅ Cose che devo fare io (Nicola)

> Solo ciò che richiede **te**: firme, merge, materiali, decisioni umane.
> Rigenerata nel giro 29/7 06:20 (era ferma al 27/7 06:20, oltre la soglia di 2 giorni — AR-030).
> Le due domande "urgenti" del 27/7 (PI26, piano-squadra) le hai chiuse tu stanotte (29/7 00:10):
> tolte da qui, restano in [[DECISIONI]]. Business ancora **invariato**: 1 ordine (annullato, 24/6),
> 0 pagati, 7 clienti, 5 prodotti — stallo North Star 35 giorni, verificato via Supabase MCP.

---

## 🔴 URGENTE — l'unica porta ancora aperta sul Pannello

- [ ] 🔴 **Chiudi il login del Pannello (30 secondi)** — Vercel → progetto **ad-mycity** → Settings → Deployment Protection → attiva **Vercel Authentication** → Save. Oggi chi ha solo il link entra nella Cabina di Regia senza fare login e può cliccare "ok" su una card 🔴. Il codice che blocca gli script è già in produzione (PR #561, verificato da @security stanotte 00:16): manca solo questo interruttore, che solo tu hai in mano.
  → Card: `#radiografia-serratura-pannello`

- [ ] 🟡 **Dimmi quali dei 4 controlli-avviso del giro vuoi promuovere a blocco vero** (non solo avviso) — te l'ho proposto stanotte, la risposta con le 4 opzioni ti aspetta in coda.
  → Vedi [[RITMO]] · Piano del mattino 29/7.

---

## 🟡 MERGE PR — 6 righe genuinamente ancora aperte (pulizia fatta oggi: 66 righe stale segnate FATTO)

- [ ] 🔴 Mergia PR #403, #463, #465, #505 (ad-mycity → main) — verificate OGGI una per una contro `git log origin/main`: NON risultano ancora nella storia (a differenza delle altre ~66 "in attesa" della coda, che erano già mergiate e restavano segnate per errore — corretto oggi in housekeeping).
- [ ] 🔴 Mergia PR #217, #218 (repo `mycity`, il sito) — non verificabile da qui (repo diverso, non ho un fetch locale aggiornato): controlla direttamente su GitHub.
  → Righe #163/#183/#185/#215/#198/#213 in [[AZIONI-IN-ATTESA]].

> ✅ **Pulizia di oggi:** 66 righe "Merge PR"/"Mergia la PR" (PR #269→#556) erano già nella storia di `main` ma restavano segnate "in attesa" nella coda — verificate una per una con `git log origin/main --grep` e segnate ✅ FATTO. La coda passa da 77 a 11 righe "in attesa" vere. Non serve che tu le riguardi: è pulizia interna.

---

## 🟡 ENV & INFRA (sblocchi macchina, 5 minuti ciascuno — invariati da giorni)

- [ ] 🟡 **Aggiungi `BURN_MENSILE_EUR=302` in `cervello/vps/.env`** → restart worker. Sblocca il calcolo del runway (fermo a "sconosciuto" — cassa Stripe letta, manca solo questo numero).
  → Card: `#burn-mensile-env`

- [ ] 🟡 **Accendi Telegram sul VPS** — `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` in `cervello/vps/.env` → restart worker → workflow n8n n.31 e n.41 in Active.
  → Card: `#accendi-intelligence-sveglia`

---

## 🟡 MATERIALI MANCANTI (procura — la macchina non li inventa)

- [ ] 🟡 **Logo e città Pane Quotidiano** — supervisione negozi segnala il gap: serve foto/logo reale e la città per completare la scheda negozio.

- [ ] 🟡 **Tazzina espresso PQ** — scegli candidato + prezzo vendita (Excelsa ~€31 set 6 vs Ginori ~€55).
  → Card: `#inserisci-tazzina-pq`

---

## ⏸️ IN PAUSA (rinvio negozi confermato dopo 24/8-1/9 — non richiedono azione ora)

**Ordine di prova su Pane Quotidiano** (`#ordine-test-pq`, unico sblocco diretto del North Star 0→1, ~10 min quando riparte) · post social PQ · comunicato stampa PI26 (superato, PI26 chiuso non-idoneo) · referral "porta un amico" · mail Hub Urbano/Comune/Unione Commercianti: tutti pronti in coda ma volutamente fermi finché non riparte l'inserimento negozi (confermato ripresa dopo 24/8-1/9, piano-squadra approvato). Nessuna azione richiesta ora.

---

> ✅ Fatto nel giro 29/7 06:20: chiuse le 2 domande urgenti del 27/7 (Nicola le ha risposte stanotte) ·
> housekeeping coda: 66 righe merge-PR stale verificate contro `git log` e segnate FATTO (77→11 "in attesa" vere) ·
> coerenza-fatti: 0 copie vecchie del fatto PI26 nei file vivi (era rc=3 a inizio giro, ora rc=0).
> ✅ Fatto nel giro 27/7 06:20: misurato l'esperimento EXP-002 (WhatsApp anchor, mancata — gate mai partito) ·
> corretto un bug di cristallizzazione nell'apprendimento (principio "mobile" ora anche a livello di codice).
> ✅ Fatto nel giro 26/7 06:23: chiuso 1 debito di misura in calibrazione · esteso il fix "pulisci tag generici".
> ✅ Fatto 20/7: demo eliminati (1 PQ · 5 prodotti) · PostHog verde VPS+Pannello · coerenza-fatti pricing bonificata.
> ✅ Fatto 23/7 (giro 11:20): OKR-Squadra target scaduto riscritto in gate · checklist rigenerata (AR-030).
