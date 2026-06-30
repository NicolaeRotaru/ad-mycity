---
tipo: stato
aggiornato: 2026-06-30 11:45
fonte: AD digitale (7 numeri = baseline live 29/6; Supabase NON collegato in sessione 30/6)
---

# 📟 STATO — Cruscotto dell'azienda

> 🧠 **30/6 11:45 — STALLO A ~6 GIORNI.** Supabase non collegato in questa sessione → i 7 numeri restano
> alla baseline verificata live il 29/6. Nessuna attività reale dal 24/6 08:28.
> **Novità di oggi (web live): SVOLTA METEO — il caldo è finito.** Oggi 30/6 e domani 1/7 = **pioggia
> (prob. 90%, max ~34°C)**, poi clima mite (29-32°C). Il fattore-guida passa da caldo a **pioggia** (leva
> delivery più forte). **Venerdì Piacentini 3/7 confermato** (49 eventi) → presidio QR ora comodo (sera fresca).
> Collo di bottiglia invariato: **prima transazione end-to-end con Casa Linda** (payout-ready) + ordine zombie €19,05.

## I 7 numeri (baseline live 2026-06-29 ~11:20 · Supabase clmpyfvpvfjgeviworth — NON riverificati il 30/6)
| Numero | Oggi (29/6) | "Riuscito" | Note |
|---|---|---|---|
| Negozi approvati (con payout) | **2 approvati / 1 payout** | ≥1 LIVE vero | Casa Linda (payout ok) + Pane Quotidiano |
| Prodotti VERI del faro pubblicati | **0** | ≥5 | 250 "available" = seed/test, 7 draft, 1 sold |
| Ordini creati | **1** | ≥1 | COD €19,05 del 24/6, fermo su PENDING/NEW da **5 giorni** |
| Ordini pagati | **0** | 1 | COD non incassato |
| Ordini consegnati | **0** | 1 | nessuna consegna mai avvenuta |
| Payout testato | **0** | 1 | mai eseguito |
| Nuovi clienti reali | **4 buyer** (0 ultimi 7g) | crescita | ultimo nuovo: "samir?" il 16/6 |

## Semafori
- 🟢 Va bene: infrastruttura pronta (Stripe, COD, onboarding, 407 lead, 250 prodotti seed); DB-memoria costruito.
- 🟡 Da tenere d'occhio: catalogo "finto" (solo seed); ordine €19,05 zombie da 5 giorni; 4 carrelli abbandonati (12-15 gg); bando ER scade 21/7.
- 🔴 Problema: **stallo da ~125h** (0 ordini/0 eventi dal 24/6); 3 decisioni di lancio non firmate; nessun wiring Vercel.

## Ultime mosse dell'AD
1. **Giro 30/6 11:45** — Svolta meteo confermata live (fine caldo, pioggia oggi+domani); Venerdì Piacentini 3/7 dettagliato (49 eventi). Supabase non collegato → 7 numeri = baseline 29/6. Nota operativa svolta meteo prodotta (🟢). Vedi [[2026-06-30]].
2. **Giri 29/6 14:24 e 16:24** — 2 passaggi leggeri a sensori ridotti (Supabase/WebFetch non autorizzati): dati immobili, stallo ~128h. Verificato a basso costo: **Supabase + Stripe operativi** (infrastruttura non a rischio → blocco solo decisionale). Vedi [[2026-06-29]].
3. **Giro 29/6 11:30** — Riverificati numeri live (identici): stallo a ~125h. Scan intelligence live: Ex Scuderie 🆕, bando ER (22gg), VP record, caldo 37°C.
4. **Giro 28/6 20:25** — Memoria costruita (DB separato `xjljcsorpbqwttrejqte`, 5 tabelle, verificato).
5. **Giro 28/6 16:46** — DB marketplace ricollegato. 4 cadenze in un colpo.
6. Confermate nel registro: Casa Linda, Pane Quotidiano (nei dati) + DB Memoria + Garetti (scelta_ragionata).

## Prossime priorità (da approvare)
- [ ] 🔴 **Forzare la prima transazione con Casa Linda** (payout-ready): 1 prodotto vero → ordine-test → payout.
- [ ] 🔴 **Sbloccare l'ordine zombie €19,05** (accettare o annullare con nota al buyer).
- [ ] 🟡 **Kit "Bando ER + MyCity"** — leva onboarding urgente (22gg alla scadenza).
- [ ] 🟡 Partire coi primi 10 dei **407 lead `to_contact`**.
- [ ] 🔴 Firmare le 3 decisioni di lancio (Stripe live/sandbox, commissione, fee) — [[AZIONI-IN-ATTESA]].
- [ ] 🟡 **Wiring Vercel**: env vars DB-memoria + Redeploy → spia "Memoria collegata" verde.
- [x] ✅ Memoria costruita (28/6 20:25).
- [x] ✅ DB marketplace ricollegato (28/6 16:46).

---
*Scritto dall'AD. Dettaglio del giro in [[2026-06-29]]; decisioni in [[DECISIONI]].*
