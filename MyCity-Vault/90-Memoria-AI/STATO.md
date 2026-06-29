---
tipo: stato
aggiornato: 2026-06-29 14:24
fonte: AD digitale (passaggio 14:24 a sensori ridotti — Supabase/WebFetch non autorizzati; numeri dal check live delle 11:20)
---

# 📟 STATO — Cruscotto dell'azienda

> 🧠 **29/6 14:24 — STALLO A ~128h.** Passaggio leggero in giornata: i 7 numeri sono congelati (dati live
> delle 11:20, stessa giornata) e fuori non è cambiato nulla da stamattina. ⚠️ In sessione **Supabase MCP e
> WebFetch non autorizzati** → niente re-verifica live e niente apertura pagine (solo WebSearch). Il collo di
> bottiglia non è più l'analisi: sono le **3 decisioni 🔴 in attesa di firma** (Casa Linda, ordine zombie,
> foglio-lancio). **Novità esterna calda (invariata dalle 11:30):** Ex Scuderie (3 spazi food premium
> approvati dal Comune), Bando Commercio ER (40% fondo perduto, scade **21/7 — 22 giorni**), Venerdì
> Piacentini 3/10/17 lug confermati. Collo di bottiglia operativo: **prima transazione end-to-end con Casa
> Linda** (payout-ready).

## I 7 numeri (verificati live 2026-06-29 ~11:20 · Supabase clmpyfvpvfjgeviworth)
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
1. **Giro 29/6 14:24** — Passaggio leggero a sensori ridotti (Supabase/WebFetch non autorizzati). Niente novità da stamattina; stallo ~128h. Verdetto onesto: la palla è in mano a Nicola (3 firme 🔴). Vedi [[2026-06-29]].
2. **Giro 29/6 11:30** — Riverificati numeri live (identici): stallo a ~125h. Scan intelligence live: Ex Scuderie 🆕, bando ER confermato (22gg), Venerdì Piacentini record, caldo 37°C.
2. **Giro 28/6 20:25** — Memoria costruita (DB separato `xjljcsorpbqwttrejqte`, 5 tabelle, verificato).
3. **Giro 28/6 16:46** — DB marketplace ricollegato. 4 cadenze in un colpo.
4. Confermate nel registro: Casa Linda, Pane Quotidiano (nei dati) + DB Memoria + Garetti (scelta_ragionata).

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
