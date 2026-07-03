---
tipo: stato
aggiornato: 2026-07-03 21:30
fonte: AD digitale (7 numeri VERI — Supabase MCP clmpyfvpvfjgeviworth, riletti live 03/7 21:30)
---

# 📟 STATO — Cruscotto dell'azienda

> 🧠 **03/7 21:30 — DATI VERI RECUPERATI.** Stasera il Supabase MCP risponde: i 7 numeri sono di nuovo misurati live (chiuso il gap 30/6-2/7).
> **Notizia n.1 (⛔):** l'unico ordine del marketplace — €19,05 COD di **Pane Quotidiano** (il faro) — è stato **ANNULLATO oggi alle 15:38**
> (`delivery_status=CANCELED`, mai accettato/consegnato). Il primo ordine di sempre è **perso**; thread vivi ora = **0**.
> **Notizia n.2 (✅):** il faro **Pane Quotidiano ha 5 prodotti VERI pubblicati** (`available`: kefir, hummus, pesto, budino — €2-5, stock 10) —
> non 0 come si credeva (era un errore di misura: si filtrava `status='active'`, l'enum reale è `available`). La vetrina è pronta a vendere.
> **FARO (decisione Nicola 3/7): Pane Quotidiano = unico negozio REALE. Casa Linda = demo scartata.**
> Collo di bottiglia (invariato, ora più urgente): **attivare il payout Stripe su Pane Quotidiano + prima transazione end-to-end vera.**

## I 7 numeri (VERI — 2026-07-03 21:30 · Supabase clmpyfvpvfjgeviworth)
| Numero | Oggi (03/7) | "Riuscito" | Note |
|---|---|---|---|
| Negozi REALI (faro) | **1 (Pane Quotidiano)** | ≥1 LIVE vero | ★ FARO. Approvato; payout ancora da attivare. (2 storefront approvati tot; Casa Linda = demo) |
| Prodotti VERI del faro pubblicati | **5** | ≥5 | ✅ obiettivo raggiunto: 5 `available` (kefir, hummus, pesto, budino), online dal 16/6 |
| Ordini creati | **1** | ≥1 | €19,05 COD del 24/6 |
| Ordini pagati | **0** | 1 | COD `PENDING`, mai incassato |
| Ordini consegnati | **0** | 1 | ⛔ ordine ora `CANCELED` (annullato 03/7 15:38) |
| Payout testato | **0** | 1 | `AWAITING_REMITTANCE`, mai eseguito |
| Nuovi clienti reali | **0 (7g)** | crescita | 23 profili tot; ultimo nuovo 16/6; 3 negli ultimi 30g |

## Semafori
- 🟢 Va bene: faro con **catalogo vero pronto** (5 prodotti); infrastruttura (Stripe Connect, COD, onboarding); 407 lead; DB-memoria costruito; MCP dati leggibile stasera.
- 🟡 Da tenere d'occhio: 227 prodotti seed "orfani" in vetrina; 4 carrelli abbandonati (1 attivo il 2/7, €7,95); **token GitHub `ad-mycity` 401 + timer VPS assenti** (giri automatici forse fermi); bando ER scade 21/7.
- 🔴 Problema: **thread vivi = 0** (ordine unico annullato); stallo transazioni da ~9 giorni; 3 decisioni di lancio non firmate; payout faro non attivo.

## Ultime mosse dell'AD
1. **Giro 03/7 21:30** — Dati VERI recuperati (MCP ok). Scoperto: ordine €19,05 **annullato** alle 15:38; faro Pane Quotidiano ha **5 prodotti veri** (corretto errore di misura). Flag automazione: token 401 + timer VPS assenti (da verificare). Vedi [[2026-07-03]].
2. **Sessione 03/7 15:00-15:20** — FARO deciso (Pane Quotidiano; Casa Linda demo); collaudo STAMPO (indifferente); PostHog rimandato a dopo 10/7. Vedi [[DECISIONI]].
3. **Giro 30/6 11:45** — Svolta meteo (fine caldo); Venerdì Piacentini 3/7. Supabase non collegato → 7 numeri = baseline 29/6. Vedi [[2026-06-30]].
4. **Giri 29/6** — Riverificati numeri live; Supabase + Stripe operativi (blocco solo decisionale).
5. **Giro 28/6 20:25** — Memoria costruita (DB separato `xjljcsorpbqwttrejqte`, 5 tabelle).

## Prossime priorità (da approvare)
- [ ] 🔴 **Attivare il payout Stripe su Pane Quotidiano** (il faro): sblocca l'incasso.
- [ ] 🔴 **Prima transazione end-to-end su Pane Quotidiano**: 1 prodotto vero → ordine → pagato → consegnato → payout.
- [ ] 🟡 **Verificare il VPS** (token `ad-mycity` 401, timer/worker assenti): i giri automatici sono ancora vivi?
- [ ] 🟡 **Pulire la vetrina** dai 227 prodotti seed orfani.
- [ ] 🟡 **Kit "Bando ER + MyCity"** — leva onboarding urgente (18gg alla scadenza).
- [ ] 🔴 Firmare le 3 decisioni di lancio (Stripe live/sandbox, commissione, fee) — [[AZIONI-IN-ATTESA]].
- [ ] 🟡 **Wiring Vercel**: env vars DB-memoria + Redeploy → spia "Memoria collegata" verde.

---
*Scritto dall'AD. Dettaglio del giro in [[2026-07-03]]; decisioni in [[DECISIONI]].*
