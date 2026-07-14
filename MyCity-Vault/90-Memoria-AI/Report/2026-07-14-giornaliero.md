---
tipo: report-giornaliero
data: 2026-07-14 02:40
fonte: AD digitale
---

# Report giornaliero — martedì 14 luglio 2026

> Generato alle 02:40 · fonte: REST marketplace 14/7 02:40 (`sentinella-dati.mjs`) + STATO 14/7 02:34 + coda Da approvare

---

## In sintesi

Business fermo come dal 24 giugno: zero ordini pagati, Pane Quotidiano è l’unica bottega reale. Stanotte la macchina ha lavorato sul Pannello (sync, squadra 120/120, coda ripulita) — il primo ordine vero resta l’obiettivo del venerdì 17 luglio.

---

## I numeri del giorno

| Indicatore | Valore | Nota |
|---|---|---|
| North Star (ordini pagati) | **0** | invariato dal 24/6 |
| Stallo 1° ordine | **~474 ore** (≈ 20 giorni) | ultimo ordine 24/6 08:28 |
| Negozi reali attivi | **1** (Pane Quotidiano) | payout OFF |
| Negozi con payout attivo | **0** | payout-test da fare su ordine vero |
| Ordini creati | **1** (annullato) | COD €19,05 del 24/6 — CANCELED |
| Ordini pagati / consegnati | **0** / **0** | serve un ordine nuovo ex-novo |
| Clienti buyer | **4** (0 nuovi in 7 gg) | 23 profili totali (baseline STATO) |
| Prodotti disponibili PQ | **5** | `status=available` |
| Lead negozi nel DB | **407** | baseline 7/7 |
| Ordini ultime 24 h | **0** | REST 02:40 |
| Worker | **vivo** (1 min fa) | 2 lavori in corso |
| Salute macchina | **75/100** | radiografia scan ~6 gg fa |

> Fonte ordini/negozi: `sentinella-dati.mjs --json` 14/7 02:40 (`dati_leggibili=true`, `ordini_tot=1`, `ultimo_ordine=2026-06-24T08:28:40`). Clienti/prodotti/lead: tabella «I 7 numeri» in STATO.md (REST 13/7 20:20, invariati). Zero numeri inventati.

---

## Cosa è successo (13/7 sera → 14/7 notte)

### Pannello — maratona continua

- **Coda ripulita** (01:12): Da approvare da 101 a ~22 card — tolte merge duplicate e PR già chiuse.
- **Sync rete** (#362): mergiata su main — Radiografia, Azioni, Plancia si aggiornano senza refresh (parziale: Scoperte/Proposte ancora legate all’ultimo giro finché non mergi #369).
- **Coerenza agenti** (#365): mergiata 02:02 — drift 0, voto casella 92; se vedi ancora 5 rossi = cache Pannello (Ctrl+Shift+R).
- **Come pensa l’AD** (#370): PR aperta — 120/120 quaderni, `stampo-check` verde, in attesa merge.
- **Sync completo** (#369): Proposte, Scoperte, radice Plancia su rete `mycity:sync` — in attesa merge.
- **Numeri dell’azienda** (#368): due schede in alto (Tutti i numeri + Analisi & report) — in attesa merge.
- **Chat Lavori** (#363): allegati foto + selezione testo leggibile — in attesa merge.
- **Radiografia in italiano** (#364): titoli umani + dettagli sotto accordion — in attesa merge (card #132).
- **Menu Memoria** (#357–#359): hub Archivio/Storico/GitHub — in attesa merge.

### Macchina

- Worker attivo (ultimo battito 02:39).
- Sensori: REST marketplace ok · Stripe ok · Resend ok · PostHog spento (scelta Nicola) · Telegram senza chiavi.
- Coda lavori 24 h: **340 fatti**, **33 in attesa**, **1 in corso** (questo report).

### Business

- Invariato: nessun ordine nuovo, PQ fermo da 14 giorni senza vendite (sentinella `negozio_fermo`).
- Cliente core confermato: **botteghe**, non ristoranti (Nicola 13/7 22:34).
- Finestra operativa: **Venerdì Piacentini 17/7** per il primo ordine reale su Pane Quotidiano.

---

## Da firmare — priorità adesso

### Critici (sbloccano il Pannello che usi ogni giorno)

| Cosa | Perché conta |
|---|---|
| **Mergia #369** (sync tutto) | Proposte e Scoperte si aggiornano in tempo reale come il resto |
| **Mergia #368** (due schede numeri) | KPI e report in due pagine chiare in alto |
| **Mergia #370** (squadra 120/120) | Casella «Come pensa l’AD» verde, guardiano stampo attivo |
| **Mergia #363** (chat Lavori) | Foto e testo selezionato funzionano su telefono |
| **Mergia #364** (radiografia umana) | Problemi tecnici spiegati in italiano semplice |

### Business (quando vuoi uscire dallo stallo)

| Cosa | Perché conta |
|---|---|
| **Primo ordine vero su Pane Quotidiano** | North Star 0→1 — aggancio 17/7 |
| **Post Venerdì Piacentini** (in coda) | Visibilità locale per la finestra del 17 |
| **SQL 107 / RLS profiles** (#32) | Ultimo bloccante piattaforma prima di nuovi negozi |

### Coda storica (non urgente stanotte)

- Archivio parallelo (#297), recensioni automatiche, 35 fix gravi sito, anti-churn 13/7, chip chat normale, togli API AI a pagamento (#59), R4 radiografia Opus 7/7.

---

## Lezione del giorno

Ripetere «fai tutti i fix» non serve se il codice è già su main — prima Ctrl+Shift+R sul Pannello, poi merge solo ciò che manca davvero (stanotte: #368–#370 e sync #369).

---

## Domani (14/7)

1. Approva le merge Pannello in cima (#368 → #369 → #370) e ricarica con Ctrl+Shift+R.
2. Tieni pronto il piano per il **17/7** (ordine test PQ + materiale Il Turno).
3. Se vuoi il report anche via email ogni sera: aggiungi la tua email in `cervello/mani-allowlist.json` e di’ «ok invio report» — oggi la mano Resend è configurata ma l’allowlist è vuota, quindi niente invio automatico.

---

## Email a Nicola

**Non inviata.** Resend configurato, ma `mani-allowlist.json` ha `email: []` — cancello AR-103 blocca qualsiasi invio senza firma esplicita. Report disponibile nel vault e nel Pannello (Memoria / Report).

---

*Scritto dall'AD digitale · prossimo aggiornamento numeri al giro serale o su richiesta «come stiamo?»*
