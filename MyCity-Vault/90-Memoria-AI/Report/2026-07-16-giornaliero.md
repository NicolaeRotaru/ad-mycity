---
tipo: report-giornaliero
data: 2026-07-16 01:02
fonte: AD digitale
---

# Report giornaliero — giovedì 16 luglio 2026

> Generato alle 01:02 · fonte: REST marketplace `sentinella-dati.mjs` + `sensore-cassa.mjs` + `verifica-sensori.mjs` 16/7 01:02 · report serale 15/7 in vault 22:55

---

## In sintesi

Business fermo come dal 24 giugno: zero ordini pagati, Pane Quotidiano resta l’unica bottega reale. **Oggi giovedì 16/7 la mossa che conta è una sola: chiama il fornaio** (card pronta) — è l’ultimo passo umano prima del **Venerdì Piacentini di domani 17/7** al banco. La macchina è sana (100/100); sensori ordini ok via REST.

---

## I numeri del giorno

| Indicatore | Valore | Nota |
|---|---|---|
| North Star (ordini pagati) | **0** | invariato dal 24/6 |
| Stallo 1° ordine | **~519 ore** (≈ 21,6 giorni) | ultimo ordine 24/6 08:28 UTC |
| Negozi reali attivi | **1** (Pane Quotidiano) | payout OFF |
| Negozi con payout attivo | **0** | payout-test su ordine vero |
| Ordini creati | **1** (annullato) | COD €19,05 del 24/6 — CANCELED |
| Ordini pagati / consegnati | **0** / **0** | serve ordine nuovo ex-novo |
| Ordini ultime 24 h | **0** | REST 00:01 |
| Clienti buyer | **4** (0 nuovi in 7 gg) | 23 profili totali (baseline 7/7) |
| Prodotti disponibili PQ | **5** | `status=available` |
| Prodotti totali in catalogo | **258** | baseline supervisione 15/7 |
| Lead negozi nel DB | **407** | baseline 7/7 |
| Cassa Stripe | **0 €** | sensore ok |
| Runway | **sconosciuto** (112 giri) | manca `BURN_MENSILE_EUR` in `.env` |
| Salute macchina (scan) | **100/100** | `sentinella-dati` 01:02 · 0 finding aperti |
| Worker | **vivo** (0 min fa) | 1 lavoro in corso (questo report) |

> Fonte ordini/negozi: `sentinella-dati.mjs --json` 16/7 01:02 (`dati_leggibili=true`, `ordini_tot=1`, `ultimo_ordine=2026-06-24T08:28:40`). Clienti/prodotti/lead: tabella «I 7 numeri» STATO (REST, invariati). Cassa: `sensore-cassa.mjs` 01:02. Zero numeri inventati.

---

## Cosa è successo ieri (15/7)

### Business

- **Stato invariato** su tutti i giri: nessun ordine nuovo, North Star 0.
- **T-1 al VP 17/7:** domani venerdì = Venerdì Piacentini — presidio al **banco** Pane Quotidiano (ritiro, non domicilio).
- **Oggi 16/7:** card **#ritiro-pq-vp17-checkin** — telefonata al fornaio (0523 388601) con script in coda.

### Macchina

- **Report serale 22:55** già scritto (`Report/2026-07-15-giornaliero.md`).
- **Chat casella:** fix Invia bloccato + risposta vuota **già su main** (#401+#402) — se ancora rotto: Ctrl+Shift+R o Nuova chat.
- **Salute macchina:** voto **100** (0 finding aperti).
- **PR #383** Rischio tecnico mergiata 15/7 11:52 (6/8 finding chiusi).
- **Worker 24 h:** 84 lavori fatti, 2 in attesa, 1 in corso (telemetry worker 22:56).

### Sensori (01:02)

- **REST marketplace:** ok — numeri ordini affidabili.
- **Stripe + Resend:** ok.
- **n8n / PostHog / uptime / Telegram:** ciechi o non configurati (9 giri consecutivi su almeno un sensore) — **non** bloccano KPI ordini; REST copre i 7 numeri.
- **MCP Supabase:** cieco in sessione Cursor — REST copre.
- **Telegram:** chiavi assenti — 32 notifiche approvazione non inviate (opzionale).
- **Fonti web:** `comprapiacenza.it` **DNS morto** — **archiviata** 16/7, monitoraggio su pagina CNA (HTTP 200). Comune.piacenza.it resta 403 (bot) — intelligence usa WebSearch, non fetch diretto. Piano: `consegne/intelligence/2026-07-16-piano-fonti-web-morte.md`.

---

## Da firmare — priorità adesso

### Business (esce dallo stallo)

| Cosa | Perché conta |
|---|---|
| **Oggi — chiama il fornaio** | Card #ritiro-pq-vp17-checkin — ultimo passo prima del VP |
| **Domani 17/7 — presidio PQ + 1° ordine** | North Star 0→1 · ritiro al banco · payout-test |
| **Pubblica post kefir** | Card #post-kefir-estate-1407 — visibilità locale (se non fatto ieri) |

### Macchina & piattaforma

| Cosa | Perché conta |
|---|---|
| **Burn mensile in `.env`** | Card #burn-mensile-runway — sblocca runway |
| **Approva merge Pannello utili** | Foto iPhone (#144) · Onestà numeri (#143) · menu Memoria (#155) |
| **SQL 107 / RLS profiles** (#32) | Ultimo bloccante sicurezza prima di nuove botteghe |

---

## Lezione del giorno

Con **domani il Venerdì Piacentini**, la leva con più ritorno non è un altro fix software — è **la telefonata al fornaio oggi** e il presidio al banco domani.

---

## Oggi (16/7)

1. **Chiama Pane Quotidiano** — conferma presidio domani (script in card).
2. Tieni pronto kit VP: QR, payout-test, messaggio ritiro al banco.
3. Opzionale: burn mensile in `.env` · 2–3 merge Pannello utili.

---

## Email a Nicola

**Non inviata.** Resend ok, ma `cervello/mani-allowlist.json` ha `email: []` — cancello AR-103. Report in vault e Pannello (Memoria › Report).

---

*Scritto dall'AD digitale · prossimo aggiornamento numeri al giro 06:20 o su «come stiamo?»*
