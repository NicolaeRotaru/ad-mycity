---
tipo: report-giornaliero
data: 2026-07-16 01:06
fonte: AD digitale
---

# Report giornaliero — giovedì 16 luglio 2026

> Generato alle 01:06 · fonte: REST marketplace + `sentinella-dati.mjs` + `sensore-cassa.mjs` 16/7 01:06 · report precedente 15/7 22:55

---

## In sintesi

Business fermo come dal 24 giugno: zero ordini pagati, Pane Quotidiano resta l’unica bottega reale. **Oggi giovedì 16/7 devi chiamare il fornaio** — è l’ultimo passo umano prima del Venerdì Piacentini di **domani venerdì 17/7**. La macchina ha vegliato tutta la notte; i numeri ordini sono leggibili via REST (MCP Supabase resta cieco in sessione, non blocca i KPI).

---

## I numeri del giorno

| Indicatore | Valore | Nota |
|---|---|---|
| North Star (ordini pagati) | **0** | invariato dal 24/6 |
| Stallo 1° ordine | **~519 ore** (≈ 21,6 giorni) | ultimo ordine 24/6 08:28 UTC |
| Negozi reali attivi | **1** (Pane Quotidiano) | payout OFF |
| Negozi con payout attivo | **0** | payout-test da fare su ordine vero |
| Ordini creati | **1** (annullato) | COD €19,05 del 24/6 — CANCELED |
| Ordini pagati / consegnati | **0** / **0** | serve un ordine nuovo ex-novo |
| Ordini ultime 24 h | **0** | REST 01:06 |
| Clienti buyer | **4** (0 nuovi in 7 gg) | 23 profili totali (baseline 7/7) |
| Prodotti disponibili PQ | **5** | `status=available` |
| Prodotti totali in catalogo | **258** | supervisione 15/7 22:20 |
| Lead negozi nel DB | **407** | baseline 7/7 |
| Cassa Stripe | **0 €** | sensore ok |
| Runway | **sconosciuto** (108 giri) | manca `BURN_MENSILE_EUR` in `.env` |
| Salute macchina (scan) | **100/100** | `sentinella-dati` 01:06 · 0 finding aperti |
| Worker | **vivo** (0 min fa) | 1 lavoro in corso |

> Fonte ordini/negozi: `sentinella-dati.mjs --json` 16/7 01:06 (`dati_leggibili=true`, `ordini_tot=1`, `ultimo_ordine=2026-06-24T08:28:40`). Clienti/prodotti/lead: baseline STATO (REST 15/7, invariati). Cassa: `sensore-cassa.mjs` 01:06. Gap: MCP Supabase cieco 7 giri (REST copre ordini); n8n/Telegram/uptime non configurati — non bloccano KPI business.

---

## Cosa è successo (15/7 sera → 16/7 notte)

### Business & finestra VP 17/7

- **Stato invariato** su tutti i giri: nessun ordine nuovo, North Star 0.
- **T-1 al Venerdì Piacentini:** venerdì 17/7 = presidio al **banco** Pane Quotidiano (ritiro, non domicilio: bici non pronta).
- **OGGI giovedì 16/7:** card **#ritiro-pq-vp17-checkin** — **chiama il fornaio (0523 388601)** e conferma presidio venerdì. È la priorità business n.1.
- **Meteo:** giovedì 22–34°C · venerdì 23–35°C sereno — favorevole per il banco in centro.
- **Bando ER commercio:** scade **21/7** (T-5) — leva vendita in pitch botteghe.

### Macchina & Pannello

- **Report serale 15/7 22:55** completato (supervisione 494 campi autofill, coda merge).
- **PR #402 mergiata** 15/7 19:20 — chat casella: Invia non resta bloccato, risposte con contesto scheda (card **#162** ✅ FATTO).
- **PR #403 aperta** 16/7 01:05 — fix fonti Comune (403 WAF non conta come fonte morta); card **#163** in Da approvare.
- **Ancora in attesa Approva:** #144 foto iPhone · #143 Onestà numeri · #146 Costo AI · #155 menu Memoria · #154 git-pr · #158–#161 merge PR #397–#400 · altre accumulate.
- **Coda lavori 24 h** (worker): **84 fatti**, **1 in attesa**, **1 in corso** (contesto worker 01:05).

### Automazione — avvisi non bloccanti

- **Telegram:** chiavi mancanti → 32 notifiche approvazione non inviate (opzionale).
- **MCP Supabase:** cieco 7 giri in sessione — ordini leggibili via REST.
- **n8n:** URL placeholder — sensore cieco, non blocca KPI ordini.
- **Runway:** `BURN_MENSILE_EUR` assente — card #burn-mensile-runway in coda.
- **freschezza-segnali:** warn — 7 guardiani senza battito fresco (monitoraggio interno).

---

## Da firmare — priorità adesso

### Business (esce dallo stallo)

| Cosa | Perché conta |
|---|---|
| **OGGI — chiama il fornaio** | Card #ritiro-pq-vp17-checkin — unica azione umana prima del VP domani |
| **Domani 17/7 — presidio PQ + 1° ordine** | North Star 0→1 · ritiro al banco · payout-test |
| **Pubblica post kefir** | Card #post-kefir-estate-1407 — visibilità locale col caldo |
| **Batch 494 campi catalogo** | Supervisione reversibile — catalogo più completo pre-VP |

### Macchina & piattaforma

| Cosa | Perché conta |
|---|---|
| **Burn mensile in `.env`** | Card #burn-mensile-runway — anche stima VPS+AI va bene |
| **Approva merge Pannello utili** | #144 foto iPhone · #143 Onestà numeri · #155 menu · #163 fonti Comune |
| **SQL 107 / RLS profiles** (#32) | Ultimo bloccante sicurezza prima di nuove botteghe |

---

## Lezione del giorno

Con **T-1 al VP 17/7**, la leva con più ritorno non è un’altra PR a notte fonda — è **la telefonata al fornaio oggi** e il presidio domani al banco.

---

## Oggi (16/7)

1. **Chiama Pane Quotidiano** — conferma presidio venerdì (card pronta con script).
2. Tieni pronto materiale VP: QR, payout-test, messaggio ritiro al banco.
3. Se vuoi sbloccare runway: imposta burn mensile (card già in coda).
4. Approva 2–3 merge Pannello utili (#144 foto, #143 numeri, #163 fonti) → Ctrl+Shift+R.

---

## Email a Nicola

**Non inviata.** Resend configurato, ma `cervello/mani-allowlist.json` ha `email: []` — cancello AR-103 blocca invio senza firma. Report in vault (`Report/2026-07-16-giornaliero.md`) e Pannello (Memoria › Report).

---

*Scritto dall'AD digitale · prossimo aggiornamento numeri al giro mattino 06:20 o su richiesta «come stiamo?»*
