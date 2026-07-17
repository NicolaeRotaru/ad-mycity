---
data: 2026-07-17 21:10
tipo: report-giornaliero
fonte: AD digitale — giro sera + dati REST Supabase + Stripe + chat Nicola
---

# 📊 Report giornaliero MyCity — 17 luglio 2026

## 1. Situazione in 3 righe

**Il primo ordine non è ancora arrivato.** Stallo 564h (≈23,5 giorni) da quando PQ è online.
**Stasera è la finestra:** Venerdì Piacentini è in corso adesso (20:00-22:30, Via Calzolai) — banco PQ è l'unica mossa che può rompere lo stallo stanotte.
**La macchina ha lavorato:** 7 PR aperte oggi, 3 già su main, piattaforma più stabile.

---

## 2. Numeri chiave

| Metrica | Valore | Fonte |
|---|---|---|
| Negozi attivi | 1 (Pane Quotidiano) | REST Supabase 20:30 |
| Clienti registrati | 23 | REST Supabase 20:30 |
| Ordini consegnati | 0 | REST Supabase 20:30 |
| North Star (ordini/giorno) | 0 | stallo dal 24/6 |
| Stallo | ~564h ≈ 23,5 giorni | dal 24/6/2026 |
| Cassa | 0 € | Stripe ok 20:30 |
| Giri AD oggi | 6+ | giri_totali=194 |

---

## 3. Mosse fatte oggi

### Piattaforma (codice)
- ✅ **PR #428 mergiata** — video live in chat con mic, textarea, chat laterale (Nicola ha mergiato da Pannello stamattina)
- ✅ **PR #424 mergiata** — 3 fix bug chat: doppia risposta eliminata, flicker tolto, bottone smartphone ok (build Vercel ~2 min)
- ✅ **PR #424 auto-mergiata dal Pannello** — confermato che il sistema azioni funziona anche senza intervento manuale
- 🟡 **Branch fix/bloccanti-macchina committato** (commit da524a30) — 3 fix: poll chat usa solo 1 job, volano soglia 5%, voto salute stabile — attende push+merge (#435)
- 🟡 **PR #432 aperta** — script pulisci-coda.mjs per eliminare 121 job errore accumulati (#433 attende merge)
- 🟡 **PR #430** — bottone fluttuante e schermo intero Worker
- 🟡 **PR #431** — debounce messaggi multipli in chat (sostituisce #429)

### Business
- 🔴 **Post VP accodato** (#post-vp-day-1707) — testo pronto, attende link da Nicola
- 🟡 **Tazzina espresso PQ accodata** (#inserisci-tazzina-pq) — inserimento prodotto pronto, bloccato su prezzo da confermare
- 🟢 **Intelligence aggiornata** — 3 file scritti: Prosus/JustEat, meteo svolta 20/7, bandi CCIAA

### Macchina (auto-miglioramento)
- 🟢 **6 lezioni registrate** in LEZIONI-CHAT.md (video live, PR già aperte, verifica prima di rispondere, ecc.)
- 🟢 **3 file auto-coscienza aggiornati** (auto-miglioramento.json, sentinella-dati.json, routing.json) — non ancora committati

---

## 4. Segnali e allerte

| Segnale | Stato | Nota |
|---|---|---|
| REST Supabase | ✅ ok | fonte dati primaria |
| Stripe | ✅ ok | cassa verificata |
| Resend | ✅ ok | email pronte |
| n8n | ⚠️ cieco | 42 giri consecutivi — automazioni sospese |
| MCP Supabase | ⚠️ cieco | 3 giri — fallback REST attivo |
| Telegram notifiche | ⚠️ warn | 42 approvazioni non inviate (chiavi mancanti) |
| Coda lavori in errore | ⚠️ 121 job | spazzatura accumulata — pulisci con PR #433 |
| BURN_MENSILE_EUR | ❌ mancante | runway ignoto da 116 giri |

---

## 5. Opportunità segnalate oggi

1. **Meteo svolta 20/7** — da domenica piogge a Piacenza per più giorni → finestra delivery superiore al banco; momento per spingere ordini online
2. **Prosus acquista JustEat** — convergenza con Glovo in 12-24 mesi; costruire moat MyCity (fiducia, locali, relazioni) adesso, prima che il grande arrivi
3. **Bandi CCIAA BT26+BE26** — aprono **domani 20 luglio**, scadenza **30 luglio**: €7k (BT26) + €20k (BE26) per bottega; bozze domanda pronte (#bandi-cciaa-2007)

---

## 6. Da firmare (ordinati per urgenza)

| # | Azione | Colore | Cosa cambia | Se va bene |
|---|---|---|---|---|
| #post-vp-day-1707 | Pubblica "Stasera è il tuo turno" per VP | 🔴 | Il post esce sui canali — 23 clienti e follower vedono MyCity al VP stasera | Qualcuno ordina o si presenta al banco PQ |
| #mergia-pr-435 | Mergia PR #435: 3 fix bloccanti macchina | 🟡 | Chat non usa 121 job inutili, volano riprende a imparare, voto salute stabile | Macchina più reattiva e calibrata |
| #mergia-pr-433 | Mergia PR #433: pulisce 121 job errore | 🟡 | Coda da 121 → ~2-3 item reali | Pannello mostra numeri veri, non spazzatura |
| #mergia-pr-430 | Mergia PR #430: bottone fluttuante | 🟡 | Chat fluttuante più usabile e schermo intero nel Worker | Esperienza Nicola migliora dal Pannello |
| #mergia-pr-431 | Mergia PR #431: debounce messaggi | 🟡 | Messaggi doppi eliminati alla radice | Chat stabile |
| #bandi-cciaa-2007 | Prepara bozze bandi CCIAA BT26+BE26 | 🟡 | Bozze pronte prima dell'apertura sportello 20/7 | Negozi onboardati possono ricevere fino a €27k |
| #inserisci-tazzina-pq | Inserisci tazzina espresso su PQ | 🟡 | Nuovo prodotto live su Pane Quotidiano (serve il prezzo da Nicola) | Catalogo PQ cresce, maggiore attrattiva |

---

## 7. Prossimo passo (domani 18 luglio)

1. **Verifica primo ordine VP** — se qualcuno ha ordinato stasera, scatta #touch1-vp17 (messaggio feedback)
2. **Bandi CCIAA** — aprono 20/7: finalizza bozze domanda oggi
3. **Inserimento negozi** — Nicola ha la bici in riparazione, atteso avvio settimana prossima
4. **Ruota PAT GitHub** (#ruota-pat-github 🔴) — token trovati in chiaro nel config git VPS

---

*Generato automaticamente dall'AD digitale · dati REST Supabase 20:30 + Stripe + chat 17/7 · fuso Europe/Rome*
