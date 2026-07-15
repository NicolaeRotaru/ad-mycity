---
tipo: report-giornaliero
data: 2026-07-15 22:55
fonte: AD digitale
---

# Report giornaliero — mercoledì 15 luglio 2026

> Generato alle 22:55 · fonte: REST marketplace + `sentinella-dati.mjs` + `sensore-cassa.mjs` 15/7 22:55 · briefing 11:04 · supervisione 22:20

---

## In sintesi

Business fermo come dal 24 giugno: zero ordini pagati, Pane Quotidiano resta l’unica bottega reale. **Domani giovedì 16/7 devi chiamare il fornaio** — è il passo umano che sblocca il Venerdì Piacentini di venerdì 17/7. La macchina ha vegliato catalogo e sensori; in coda restano molte merge Pannello e il post kefir.

---

## I numeri del giorno

| Indicatore | Valore | Nota |
|---|---|---|
| North Star (ordini pagati) | **0** | invariato dal 24/6 |
| Stallo 1° ordine | **~516 ore** (≈ 21,5 giorni) | ultimo ordine 24/6 08:28 UTC |
| Negozi reali attivi | **1** (Pane Quotidiano) | payout OFF |
| Negozi con payout attivo | **0** | payout-test da fare su ordine vero |
| Ordini creati | **1** (annullato) | COD €19,05 del 24/6 — CANCELED |
| Ordini pagati / consegnati | **0** / **0** | serve un ordine nuovo ex-novo |
| Ordini ultime 24 h | **0** | REST 22:55 |
| Clienti buyer | **4** (0 nuovi in 7 gg) | 23 profili totali (baseline 7/7) |
| Prodotti disponibili PQ | **5** | `status=available` |
| Prodotti totali in catalogo | **258** | supervisione 22:20 |
| Lead negozi nel DB | **407** | baseline 7/7 |
| Cassa Stripe | **0 €** | sensore ok |
| Runway | **sconosciuto** (107 giri) | manca `BURN_MENSILE_EUR` in `.env` |
| Salute macchina (scan) | **100/100** | `sentinella-dati` 22:55 · 0 finding aperti |
| Worker | **vivo** (0 min fa) | 1 lavoro in corso |

> Fonte ordini/negozi: `sentinella-dati.mjs --json` 15/7 22:55 (`dati_leggibili=true`, `ordini_tot=1`, `ultimo_ordine=2026-06-24T08:28:40`). Clienti/prodotti/lead: tabella «I 7 numeri» STATO (REST 14/7, invariati). Cassa: `sensore-cassa.mjs` 22:55. Zero numeri inventati.

---

## Cosa è successo oggi (15/7)

### Business & finestra VP 17/7

- **Stato invariato** su tutti i giri del giorno (06:20, 11:04, serale): nessun ordine nuovo, North Star 0.
- **T-2 → T-1:** venerdì 17/7 è il Venerdì Piacentini — presidio al **banco** Pane Quotidiano (ritiro, non domicilio: bici non pronta).
- **Domani giovedì 16/7:** card **#ritiro-pq-vp17-checkin** — chiama il fornaio (0523 388601) e conferma presidio venerdì.
- **Meteo:** oggi caldo intenso (briefing 37°C); venerdì 23–35°C sereno — favorevole per il banco in centro.
- **Bando ER commercio:** scade **21/7** (T-6) — leva vendita in pitch botteghe.

### Macchina & supervisione

- **Giro mattino 11:04:** briefing completo, sensori REST+Stripe+Resend ok, automazione VPS verde.
- **Supervisione 22:20:** 17 negozi vegliati, 258 prodotti — **494 campi** proposti in autofill reversibile (252 condizione «nuovo» + 242 unità «pezzo»), **34** servono materia prima tua (foto, descrizioni vetrina). Niente scritto sul sito.
- **Giro serale 22:20:** interrotto con scritture memoria pendenti (recupero in corso).
- **Salute macchina:** voto **100** alle 22:55 (0 finding aperti in radiografia scan).

### Pannello — merge e coda

- **Fatto oggi:** card **#145** — PR **#383** Rischio tecnico mergiata alle **11:52** (`417ded09`) — 6/8 finding chiusi.
- **Ancora in attesa Approva** (priorità utile per te):
  - **#144** PR #380 — miniatura foto su iPhone (fluttuante + Assistente)
  - **#143** PR #379 — Onestà sui numeri (4/4 fix, mergeable)
  - **#146** PR #381 — Costo dell’AI (5/6 fix; resta timer mattina da decidere)
  - **#155** PR #392 — Memoria sotto Azioni, titolo sezione tolto
  - **#154** PR #393 — hardening `git-pr.mjs` (anti-conflitti body memoria)
  - **#140–#141** PR #374–#375 — Scoperte leggibili + ordine chat stabile
  - Altre merge accumulate (#357–#401): sync Pannello, menu Memoria, allegati Lavori, ecc.
- **Coda lavori 24 h** (worker): **94 fatti**, **2 in attesa**, **1 in corso** (contesto worker 22:53).

### Automazione — avvisi non bloccanti

- **Telegram:** chiavi mancanti → 32 notifiche approvazione non inviate (opzionale).
- **n8n:** URL placeholder — sensore cieco, **non** blocca KPI ordini (REST ok).
- **taste-file / freschezza-segnali:** warn — guardian senza battito fresco (monitoraggio interno).

---

## Da firmare — priorità adesso

### Business (esce dallo stallo)

| Cosa | Perché conta |
|---|---|
| **Giovedì 16/7 — chiama il fornaio** | Card #ritiro-pq-vp17-checkin — unica azione umana prima del VP 17/7 |
| **Venerdì 17/7 — presidio PQ + 1° ordine** | North Star 0→1 · ritiro al banco · payout-test |
| **Pubblica post kefir** | Card #post-kefir-estate-1407 — visibilità locale col caldo |
| **Batch 494 campi catalogo** | Supervisione reversibile — catalogo più completo pre-VP |

### Macchina & piattaforma

| Cosa | Perché conta |
|---|---|
| **Burn mensile in `.env`** | Card #burn-mensile-runway — anche stima VPS+AI va bene; sblocca runway |
| **Approva merge Pannello in cima** | #144 foto iPhone · #143 Onestà numeri · #155 menu Memoria · #154 git-pr |
| **SQL 107 / RLS profiles** (#32) | Ultimo bloccante sicurezza prima di nuove botteghe |

### Coda storica (non urgente stasera)

Archivio parallelo (#297), recensioni automatiche, 35 fix gravi sito, anti-churn 13/7, chip chat normale, togli API AI a pagamento (#59), R4 radiografia Opus 7/7.

---

## Lezione del giorno

Il business non si muove da solo: con **T-1 al VP 17/7**, la leva con più ritorno non è un’altra PR — è **la telefonata al fornaio domani mattina** e il presidio venerdì al banco.

---

## Domani (16/7)

1. **Chiama Pane Quotidiano** — conferma presidio venerdì (card pronta con script).
2. Tieni pronto materiale VP: QR, payout-test, messaggio ritiro al banco.
3. Se vuoi sbloccare runway: imposta burn mensile (card già in coda).
4. Approva 2–3 merge Pannello utili (#144 foto, #143 numeri, #155 menu) → Ctrl+Shift+R.

---

## Email a Nicola

**Non inviata.** Resend configurato (`verifica-sensori` ok), ma `cervello/mani-allowlist.json` ha `email: []` — cancello AR-103 blocca qualsiasi invio senza firma esplicita. Report disponibile nel vault (`Report/2026-07-15-giornaliero.md`) e nel Pannello (Memoria › Report).

Per riceverlo via email ogni sera: aggiungi la tua email in `mani-allowlist.json` e di’ «ok invio report».

---

*Scritto dall'AD digitale · prossimo aggiornamento numeri al giro serale o su richiesta «come stiamo?»*
