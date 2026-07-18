---
tipo: report-giornaliero
data: 2026-07-18 21:07
fonte: AD digitale
---

# Report giornaliero — 18 luglio 2026

## La situazione in una riga

Giornata intensa sul fronte tecnico e bandi, business ancora fermo a zero — il collo di bottiglia rimane il primo ordine su PQ.

---

## Numeri chiave (ore 21:07 — fonte REST + Stripe)

| KPI | Valore | Var. |
|-----|--------|------|
| Ordini completati | **0** | = (stallo da 24/6) |
| Clienti registrati | **23** | = |
| Negozi live con payout | **1** (Pane Quotidiano) | = |
| Stallo North Star | **~592h / 24,7 giorni** | ▼ peggiorato |
| Cassa incassata | **0 €** | = |
| Prospect validi mappati | **13 botteghe** | stabile |
| Ristoranti esclusi | **6** | nuovo (Nicola 18/7 14:00) |

Sensori ore 21:07: REST ✅ · Stripe ✅ · Resend ✅ · Sito ✅ · Pannello ✅ · n8n cieco 79 giri · MCP Supabase cieco 7 giri.

---

## Fatto oggi (🟢)

**Bandi:**
- Analisi completa CCIAA: bando giusto è **PI26** (non BT26/BE26) — 50% fondo perduto, max €10k, spese tech da maggio 2026, a sportello. Bozza domanda in `consegne/relazioni-istituzionali/`.
- Scheda 1-pagina per i negozi del batch (PI26) in `consegne/relazioni-istituzionali/bandi-cciaa-kit.md`.

**Codice — completato con 17+ passaggi di giro:**
- **35 fix gravi radiografia pushati** su branch `fix/35-gravi-radiografia-2026-07-07` (marketplace) — pronti per PR #213 che Nicola mergia.
- **PR #453 mergiata** — timer lista chat corretto (mostra ora ultimo messaggio, non ora corrente).
- **PR #454 mergiata** — volano tasso legge ESITI reali (non si autoalimenta).
- **PR #457 mergiata** — volano blocco auto-referenziale rimosso.
- **PR #458 mergiata** — sezioni Archivio chiuse di default nel Pannello.
- **PR #456 aperta** — fix nuova chat: premere «+» non rimette i messaggi vecchi (in attesa merge).
- **Housekeeping coda automatico** attivato in `giro.sh` — la coda si autopulisce a ogni giro.

**Prospect:**
- Registro-realtà aggiornato: **13 prospect validi** + 6 ristoranti esclusi su indicazione Nicola ("ristoranti non sono il nostro target"). Nomi: Garetti, Peretti, Amendolara + Frolla Couture, Rasparini, Struzzi, Panetteria Del Corso, Macelleria Callegari, Anzico Forno, L'Albero del Pane, Macelleria Scalabrini, Macelleria Polleria, Macelleria Carne Bovina.

**Coda e macchina:**
- 84 card archiviate dalla coda Pannello (pulizia).
- 8 ESITO reparti registrati (volano calibrazione).
- Guardiani ✅: allocazione, registro-scelte, coerenza-fatti (exit 0 alle 20:40).

---

## Da firmare — in ordine di urgenza

### 🔴 URGENTE STASERA/DOMANI
1. **#bandi-cciaa-2007** — Registrati su `restart.infocamere.it` OGGI per il bando PI26. **Domani 20/7 ore 10:00 lo sportello apre**: chi arriva tardi perde i €10k. Non delegabile.
2. **#fix-35-gravi** — Mergia PR #213 su GitHub (35 fix gravi del marketplace) → poi in prossima chat l'AD applica le 3 migrazioni DB (109/110/111).

### 🟡 Priorità alta — sblocca il North Star
3. **#ordine-test-pq** — Fai un ordine su Pane Quotidiano (10 minuti, prezzo del prodotto). Porta North Star da 0 a 1, prova che la macchina funziona fine-to-fine.
4. **#whatsapp-3-anchor-pi26** — Manda 3 WhatsApp a Garetti, Peretti e Amendolara. Testi pronti in `consegne/vendite/`. La leva è: "PI26 ti rimborsa il 50% delle spese tech per entrare su MyCity".
5. **#welcome-email-23** — Email benvenuto ai 23 iscritti via Gmail. Sono fermi da settimane senza notizie.

### 🟡 Pannello — merge tecnici
6. **#mergia-pr-446** — Fix chat cross-device (smartphone vede chat vuota).
7. **#mergia-pr-456** — Fix nuova chat non rimette messaggi vecchi (PR aperta oggi).
8. **❌ #mergia-pr-455** — **Chiudi senza merge** PR #455 (sostituita da #457, ancora aperta su GitHub).

---

## Segnali macchina (warn aperti)

- **tick-coscienza-leggero**: warn — nessun blocco critico, giri continui.
- **notifica-approvazioni**: warn — 50 notifiche non inviate (manca TELEGRAM_BOT_TOKEN).
- **freschezza-segnali**: warn — 7 guardiani senza battito fresco (manca:sensori, manca:allinea-scan-can).
- **taste-file**: warn — log ancora vuoto (0 verdetti reali).

Nessuno di questi blocca l'operatività. Il vero blocco è il North Star.

---

## Mano email

Resend ✅ configurato. L'invio automatico di questo report a Nicola non è ancora cablato come azione automatica — accodato come #report-email-nicola per quando il flusso sarà completato.

---

## Prospettive domani (19-20 luglio)

- **20/7 ore 10:00** — Sportello PI26 apre: presentarsi con firma digitale + lista fatture Supabase/Vercel/Render da maggio 2026.
- **Piogge previste dal 20/7** — finestra delivery alta: post meteo (#post-meteo-pioggia-20lug) da pubblicare la mattina del 20/7 nei gruppi Facebook.
- **Bici in riparazione** — se pronta questa settimana (21-25/7), i 3 WhatsApp di oggi possono diventare visite fisiche.

---

*Generato da AD digitale MyCity — 2026-07-18 21:07 (Europe/Rome)*
