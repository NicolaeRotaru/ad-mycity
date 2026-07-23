---
tipo: report-giornaliero
data: 2026-07-23 17:10
fonte: AD digitale
---

# Report giornaliero — 23 luglio 2026 (aggiornamento pomeriggio)

## La situazione in una riga

Il business resta fermo agli stessi numeri da fine giugno (0 ordini pagati, stallo ~29 giorni), ma oggi è stata una giornata di sblocchi tecnici importanti: entrambi i token GitHub rotti (VPS e Vercel) sono stati rigenerati da Nicola e verificati con un push reale — la macchina può di nuovo aprire PR e il Pannello online torna ad aggiornarsi. Resta un nuovo bug di interfaccia da controllare (voce di menu sparita) e restano da firmare le stesse 3 mosse umane di sempre.

---

## Numeri chiave (ore 17:06 — fonte: query SQL diretta al database Supabase del marketplace, tabelle `orders`/`profiles`/`products`)

| KPI | Valore | Var. vs report mattina (11:49) |
|-----|--------|---------------------------|
| **Ordini pagati (North Star)** | **0** | = (stallo dal 24/6) |
| Ordini creati nel database | 1 (annullato, €19,05 COD, 24/6) | = |
| Ordini consegnati | 0 | = |
| **Clienti (buyer)** | **4** | = |
| Negozi live/approvati | **1** (Pane Quotidiano) | = |
| Prodotti a catalogo | **5** (tutti in stato "available") | = |
| Incasso pagato (Stripe) | **0 €** | = |
| Stallo North Star | **~29 giorni** dall'ultimo ordine (24/6) | invariato |
| Runway | non calcolabile — `BURN_MENSILE_EUR` ancora assente nel `.env` VPS (burn reale noto: **~302 €/m**, confermato da Nicola il 20/7, ma non ancora scritto in env) | = |

Sensori: 8/9 canali ok (REST marketplace, Stripe, PostHog, Resend, sito, Pannello, n8n, REST memoria). Solo Telegram non collegato (canale mai attivato, non un guasto).

---

## Cosa è cambiato da stamattina (11:49 → 17:06)

**✅ Risolto — Token GitHub del VPS (blocco PR).** Nicola ha rigenerato un PAT unico e lo ha messo su VPS `.env`, verificato con una PR vera (#510). Card #219 chiusa.

**✅ Risolto — Token GitHub di Vercel (Pannello bloccato in cache).** Stesso PAT incollato anche in `GITHUB_TOKEN`/`OBSIDIAN_TOKEN` su Vercel, confermato "tutto verde" da Nicola. Card #221 chiusa.

**🆕 Nuovo problema segnalato da Nicola (~16:53) — non ancora verificato.** Dopo l'ultimo Redeploy manuale su Vercel è sparita la voce di menu "Diretta contenuti" (sopra "Lavori") dal Pannello. Ipotesi dell'AD, da confermare: il Redeploy ha ripubblicato un build di Vercel precedente al 19/7 (data in cui quella voce è entrata nel codice) invece dell'ultimo commit. **Serve da Nicola:** su Vercel → Deployments, controllare quale build è marcato "Production" e se serve un Redeploy sul deployment più recente, non uno storico.

**Nessun cambiamento sui numeri di business**: stessi 4 clienti, 1 negozio, 0 ordini pagati.

---

## Da firmare — in ordine di urgenza

### 🔴 Business (soldi e visibilità)

1. **PI26** — Invia la domanda sul portale CCIAA (fondo perduto fino a 10.000€, scade **30/7 ore 16:00**, 7 giorni residui, non risulta ancora inviata).
2. **Pubblica il carosello** "Cosa c'è di buono questa settimana" (testo e visual già pronti, proposto per oggi 17:00-19:00 — è l'orario in cui siamo ora).
3. **Ordine di prova su Pane Quotidiano** (~10 minuti) — è l'unica cosa che sblocca la North Star da 0 a 1 ordine pagato e a cascata recupero carrelli, referral e recensioni, tutti già pronti e fermi in attesa di questo.

### 🟡 Da controllare

4. **Bug "Diretta contenuti" sparito dal menu Pannello** — verificare su Vercel quale deployment è in Production e ri-lanciare il Redeploy sull'ultimo commit se serve.
5. **BURN_MENSILE_EUR** nel `.env` del VPS — il valore (~302 €/m) è già confermato da Nicola, manca solo scriverlo in env per sbloccare il calcolo del runway.
6. Restano **~47 azioni aperte** in coda (post social, referral "porta un amico", welcome email, WhatsApp ai 3 negozi target PI26, ecc.) — quasi tutte in attesa dello stesso sblocco: il primo ordine pagato su Pane Quotidiano.

---

## Segnali macchina (warn aperti)

| Segnale | Stato | Impatto |
|---------|-------|---------|
| north-star | warn | stallo 29,1 giorni (soglia d'allarme: 3) |
| notifica-approvazioni | warn | 71 avvisi pronti non inviati (mancano le chiavi Telegram) |
| tick-coscienza-leggero | warn | tasso di avviso sopra soglia, esperimenti ok |
| freschezza-segnali | warn | 8 guardiani senza battito fresco (max 60min) |
| cassa-runway | warn (invariato) | runway sconosciuto, manca il burn mensile in env (valore noto, solo da scrivere) |

Nessuno di questi blocca il lavoro immediato. Il vero collo di bottiglia resta lo stesso da settimane: **zero ordini pagati** + **PI26 da inviare**.

---

## Lezione del giorno

Oggi la macchina ha chiuso due guasti tecnici reali che bloccavano da giorni PR e aggiornamento del Pannello — un progresso concreto sull'infrastruttura. Ma nessuno di questi due sblocchi sposta la North Star di un millimetro. Le uniche tre cose che contano restano umane: **l'ordine di prova**, **l'invio di PI26**, **la pubblicazione del carosello**.

---

## Domani (24 luglio)

- Prima cosa: se PI26 non è ancora partita, è la priorità assoluta (6 giorni residui dopo oggi).
- Verificare se il bug "Diretta contenuti" è stato risolto col Redeploy corretto.
- Se il carosello è uscito, controllare i risultati (click, eventuali ordini).
- Se l'ordine di prova è stato fatto, avviare a cascata welcome email, recensione e primo dato reale al negozio.

---

## Mano email

Resend è configurato e funzionante (sensore verde), ma **l'invio automatico di questo report non è stato eseguito**: la lista degli indirizzi autorizzati (`cervello/mani-allowlist.json` → campo `email`) è vuota — per la regola di sicurezza AR-103 questo forza la modalità "pronto ma non inviato" anche con i permessi attivi. Per ricevere questo report via email ogni giorno: aggiungi la tua email nella allowlist e dimmi "ok invio report".

---

*Generato da AD digitale MyCity — 2026-07-23 17:10 (Europe/Rome)*
