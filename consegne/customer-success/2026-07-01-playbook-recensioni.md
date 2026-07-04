---
tipo: playbook-recensioni
reparto: customer-success
data: 2026-07-01 12:03
fonte: Supabase REST `clmpyfvpvfjgeviworth` · `orders` + `store_reviews` + `reviews`
stato: DRY-RUN — nessun invio
voce: Vicino Orgoglioso (FLUSSI-LIFECYCLE §3 · primo-ordine-faro PARTE B/C)
origine: playbook:recensioni
---

# ⭐ Playbook Recensioni — 2026-07-01 12:03

## Snapshot live

| Metrica | Valore | Fonte |
|---------|--------|-------|
| Ordini totali in DB | **1** | `orders` REST 1/7 12:03 |
| Consegne completate (`DELIVERED` o `delivered_at` valorizzato) | **0** | stesso |
| Recensioni negozio (`store_reviews`) | **0** | stesso |
| Recensioni prodotto (`reviews`) | **0** | stesso |
| **Consegne completate SENZA recensione** | **0** | nessuna consegna da sollecitare oggi |

> **Esito playbook:** oggi **non c'è nessun cliente** a cui mandare il messaggio post-consegna — la prima transazione (#16, Scelta A) è ancora in attesa di consegna. Le bozze sotto sono **pre-armate** per partire appena l'ordine passa a `Consegnato`.

## Ordine in pipeline (prima recensione attesa)

| Campo | Valore |
|-------|--------|
| order_id | `58094956-4b9b-49b4-9299-7a5c645d7cb3` |
| Negozio | **Pane Quotidiano** (Via Calzolai · bio dal 1976) |
| Totale | **€19,05** COD |
| Stato attuale | `NEW` / `PENDING` — esecuzione **#16** in attesa (`ok 16` + data/ora consegna) |
| Buyer UUID | `9262fa38-225c-4a25-bce6-a37503327bb4` |
| Contatto | WhatsApp **348 642 1766** (da pacchetto operations #16) |
| Prodotti | Pesto Genovese Bio · Kefir capra · Kefir Berchtesgadener · Hummus bio |
| Link recensione | `https://mycity-marketplace.com/orders/58094956-4b9b-49b4-9299-7a5c645d7cb3/review` |

**Regola d'oro (FLUSSI §3):** invio recensione **solo se feedback ≠ negativo**. Telefonata concierge (2–4h post-consegna) ha priorità sui primi 10 ordini — l'email/WhatsApp è backup.

---

## Sequenza post-consegna — ordine #16

### Touch 1 · Feedback (+3h da `Consegnato`) · 🟡

**Canale:** WhatsApp (già usato per #16) · backup email/in-app  
**Precondizione:** ordine segnato `Consegnato` in dashboard

**WhatsApp:**
> Ciao! Sono Nicola di MyCity 👋
> Ti è arrivata la spesa da **Pane Quotidiano**? Spero pesto e kefir siano come al banco.
>
> Siamo appena nati e ogni tua parola conta. **Com'è andata?**
> 👍 Tutto bene · 😐 Così così · 👎 C'è stato un problema
>
> Se qualcosa non va, rispondi qui: lo sistemo io oggi stesso.
> Grazie per aver scelto la bottega del quartiere 🧡

**Email (se disponibile):** oggetto *Com'è andata? (rispondi pure a questa mail)* — corpo allineato a FLUSSI §3.1 (sostituire Garetti → Pane Quotidiano).

**In-app (notifica):**
> Grazie per l'ordine da Pane Quotidiano! Com'è andata? Tocca per dirci due righe — ci aiuti a migliorare.

**Ramo 👎:** handoff @supporto — **NON** inviare Touch 2 finché non risolto.

---

### Touch 2 · Richiesta recensione (+1 giorno, solo se 👍) · 🟡

**Canale:** WhatsApp + email/in-app  
**Precondizione:** feedback positivo (telefonata o risposta 👍)

**WhatsApp:**
> Buongiorno! Come promesso, ecco il link per lasciare **due righe su Pane Quotidiano** 🌟
> 👉 https://mycity-marketplace.com/orders/58094956-4b9b-49b4-9299-7a5c645d7cb3/review
>
> Bastano 30 secondi: stelline + una frase vera. Se ti serve uno spunto:
> *"Prodotti bio freschi, consegna puntuale a mano, gentilissimi."*
>
> Sarebbe la **prima recensione verificata di MyCity a Piacenza** — grazie di cuore!

**Email:** oggetto *Aiuti Pane Quotidiano con 30 secondi? ⭐* — corpo FLUSSI §3.2 adattato.

**Promemoria unico (+2 giorni se silenzio):** una sola ripetizione gentile del link — poi stop.

---

### Touch 0 · Telefonata concierge (prioritaria, +2–4h) · 🟡

Script breve (primo ordine reale):
> *"Buonasera, sono Nicola di MyCity — quello che le ha portato la spesa da Pane Quotidiano. La disturbo un minuto: è andato tutto bene? Pesto e kefir come al banco?"*

Se positivo → annuncio link recensione domani (Touch 2). Vedi `consegne/customer-success/primo-ordine-faro.md` PARTE B.

---

## Automazione futura

Quando volume > 10 ordini/settimana: collegare trigger `Consegnato` → coda notifiche (Resend + in-app) via @builder-automazioni. Fino ad allora: **concierge manuale** sui primi ordini.

## Accodato in AZIONI-PRONTE

| ID | Cosa |
|----|------|
| A4 | Indice playbook recensioni (questo giro) |
| A13 | Touch 1 feedback ordine #16 |
| A14 | Touch 2 recensione ordine #16 |
| A15 | SKIP — nessuna consegna completata oggi |

---

## Ri-esecuzione 2026-07-03 11:40 (playbook:recensioni)

**Snapshot invariato** (live gated in sessione: node/REST + MCP marketplace entrambi ciechi → baseline REST STATO 3/7 11:14, zero numeri inventati):
- Ordini consegnati: **0** → **consegne completate senza recensione: 0**. Nessun cliente reale da sollecitare oggi.
- Prima consegna imminente ancora **#16** (Pane Quotidiano, COD €19,05, buyer WhatsApp 348 642 1766), programmata **mattina 3/7** con il payout-test.

**Correzione gap:** il run 1/7 dichiarava A13/A14 «accodati», ma non erano mai finiti nella coda. Oggi **materializzati davvero**: blocchi **A13/A14** aggiunti in `AZIONI-PRONTE.md` + **riga #27** nella coda canonica `AZIONI-IN-ATTESA.md` (gated su #16 consegnato). Le bozze restano identiche a quelle qui sopra (voce Vicino Orgoglioso).

---

## Ri-esecuzione 2026-07-04 04:40 (playbook:recensioni)

**Finding invariato** (live gated in sessione: MCP marketplace + node/REST/curl entrambi bloccati dai permessi → baseline REST STATO 3/7 21:21, zero numeri inventati):
- **Consegne completate in tutto il marketplace: 0** (`Ordini consegnati=0`, «nessuna consegna mai avvenuta», stallo ~230h) → **recensioni da sollecitare oggi: 0**. Nessun cliente reale, niente destinatari inventati.
- L'unica consegna che accenderà la sequenza resta **#16** (Pane Quotidiano, COD €19,05, buyer WhatsApp 348 642 1766): **approvata dal Pannello 3/7 13:29 ma non ancora consegnata** (approvato ≠ consegnato).

**Nessun doppione (AR-008):** il messaggio post-consegna è già preparato e armato — **A13** (Touch 1: grazie + feedback, +3h) → se 👍 **A14** (Touch 2: richiesta recensione, +1g). Coda canonica = **riga #27**, già presente e ora ri-verificata/aggiornata. Non creo una seconda riga: aggiorno lo stato della stessa. Parte automaticamente quando #16 passa a `Consegnato`.
