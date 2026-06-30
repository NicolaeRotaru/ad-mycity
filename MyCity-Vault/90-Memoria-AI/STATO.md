---
tipo: stato
aggiornato: 2026-06-30 22:17
fonte: AD digitale (7 numeri = live REST 30/6 22:17 · Supabase clmpyfvpvfjgeviworth)
---

# 📟 STATO — Cruscotto dell'azienda

> 🧠 **30/6 22:17 — STALLO 155h, DATI LIVE RECUPERATI.** 7 numeri **riverificati live** via REST Supabase (fallback quando MCP cieco). **Invariati vs 29/6.** Ultimo evento reale: ordine €19,05 del 24/6. **VP 3/7 tra 3 giorni** (49 eventi). **Domani 1/7 pioggia/temporali** → leva delivery. Collo di bottiglia: **prima transazione Casa Linda** + **ordine zombie €19,05**.

## I 7 numeri (live 2026-06-30 22:17 · Supabase REST clmpyfvpvfjgeviworth)
| Numero | Oggi (30/6) | "Riuscito" | Note |
|---|---|---|---|
| Negozi approvati (con payout) | **2 approvati / 1 payout** | ≥1 LIVE vero | Casa Linda (payout ok) + Pane Quotidiano |
| Prodotti VERI del faro pubblicati | **0** | ≥5 | 250 "available" = seed/test, 7 draft, 1 sold |
| Ordini creati | **1** | ≥1 | COD €19,05 del 24/6, fermo su PENDING/NEW da **6,5 giorni** |
| Ordini pagati | **0** | 1 | COD non incassato |
| Ordini consegnati | **0** | 1 | nessuna consegna mai avvenuta |
| Payout testato | **0** | 1 | mai eseguito |
| Nuovi clienti reali | **4 buyer** (0 ultimi 7g) | crescita | ultimo nuovo: "samir?" il 16/6 |

## Semafori
- 🟢 Va bene: infrastruttura pronta (Stripe operativo, REST Supabase OK, 407 lead, 250 prodotti seed); memoria DB collegata.
- 🟡 Da tenere d'occhio: catalogo "finto" (solo seed); ordine €19,05 zombie 6,5 gg; 4 carrelli abbandonati; bando ER 21 giorni; incident Supabase mgmt ops (non lettura dati).
- 🔴 Problema: **stallo 155h** (0 ordini/eventi dal 24/6); 3 decisioni di lancio non firmate; VP 3/7 tra 3 giorni senza link lista d'attesa.

## Ultime mosse dell'AD
1. **Giro 30/6 22:17** — 7 numeri live REST (identici). Stallo 155h. Lista 10 lead food centro (🟢). Incident Supabase mgmt documentato; Stripe OK. Vedi [[2026-06-30]].
2. **Giro 30/6 17:17** — Primo passaggio con REST live; pacchetto ordine zombie prodotto.
3. **Giro 30/6 11:45** — Svolta meteo (fine caldo, pioggia); MCP cieco → baseline 29/6.
4. **Giri 29/6** — Stallo ~128-125h confermato; infrastruttura operativa (sentinella ops-02 OK).

## Prossime priorità (da approvare)
- [ ] 🔴 **Forzare la prima transazione con Casa Linda** (payout-ready): 1 prodotto vero → ordine-test → payout.
- [ ] 🔴 **Sbloccare l'ordine zombie €19,05** (accettare o annullare con nota al buyer).
- [ ] 🟡 **Kit "Bando ER + MyCity"** — leva onboarding urgente (21gg alla scadenza 21/7).
- [ ] 🟡 **Presidio VP 3/7** — kit QR #11 + contenuti #7 (tra 3 giorni).
- [ ] 🔴 Firmare le 3 decisioni di lancio — [[AZIONI-IN-ATTESA]].
- [ ] 🟡 **Wiring Vercel** memoria (#10).
- [x] ✅ Lista 10 lead food centro (30/6 22:17).
- [x] ✅ Pacchetto sblocco ordine zombie (30/6 17:17).

---
*Scritto dall'AD. Dettaglio in [[2026-06-30]]; decisioni in [[DECISIONI]].*
