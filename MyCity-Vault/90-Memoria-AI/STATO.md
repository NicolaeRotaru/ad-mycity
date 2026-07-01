---
tipo: stato
aggiornato: 2026-07-01 06:45
fonte: AD digitale (7 numeri = live REST 1/7 06:18 · Supabase clmpyfvpvfjgeviworth · radiografia + foglio-firma Nicola 1/7)
---

# 📟 STATO — Cruscotto dell'azienda

> 🧠 **1/7 06:18 — Giro AD:** stallo **163,8h** (168h tra **~4,2h**). Foglio-firma **FATTO** 01:02. VP **rimandato** → onboarding **6/7**. Radiografia: **4 bloccanti**. Mossa n.1 = **ordine zombie PQ entro ~4h** + ok **Sprint 1**.

## I 7 numeri (live 2026-07-01 06:18 · Supabase REST clmpyfvpvfjgeviworth)
| Numero | Oggi (1/7) | "Riuscito" | Note |
|---|---|---|---|
| Negozi REALI approvati | **1** (Pane Quotidiano) | ≥1 LIVE vero | Casa Linda = demo/seed — esclusa |
| Negozi con payout attivo | **0 reali** | 1 | Casa Linda payout demo; Pane Quotidiano payout OFF |
| Prodotti VERI del faro pubblicati | **0** | ≥5 | 5 PQ bio available; 250 seed test |
| Ordini creati | **1** | ≥1 | COD €19,05 del 24/6, fermo ~6,8 gg |
| Ordini pagati | **0** | 1 | COD non incassato |
| Ordini consegnati | **0** | 1 | nessuna consegna mai avvenuta |
| Payout testato | **0** | 1 | payout-test Nicola **03/7 mattina** (sandbox) |
| Nuovi clienti reali | **4 buyer** (0 ultimi 7g) | crescita | ultimo nuovo: 16/6 |

## Sensori MCP (inventario 2026-07-01 01:57 · chat Nicola)
| Sensore | Config | Stato | Sblocco |
|---|---|---|---|
| Supabase marketplace+memoria | `.mcp.json` ✅ | ❌ cieco Cursor | `SUPABASE_ACCESS_TOKEN` in `vps/.env` + Autorizza MCP |
| Stripe (incassi/payout) | ❌ mai cablato | assente | `sk_test_…` + server MCP in config 🟡 |
| PostHog (funnel) | ❌ mai cablato | assente | 🟢 opzionale (0 ordini pagati) |
| REST Supabase marketplace | env ✅ | ✅ HTTP 200 | fallback attivo (AR-001) |
| WebFetch | globale ✅ | ✅ worker | merge 1/7 01:37 |

## Guardrail azioni 🔴 (2026-07-01 01:59 · chat Nicola pre-mortem)
| Componente | Stato | Note |
|---|---|---|
| `guardrail-semaforo.mjs` | ✅ in repo locale | classifica rischio + blocca senza firma |
| `esegui-azione.mjs verifica` | ✅ 7/7 | doppio cancello ingresso + pre-invio |
| Worker `NICOLA_FIRMA=1` | ✅ in repo | solo job post-Approva Pannello |
| Autopilot | ✅ solo 🟢 | secondo gate guardrail |
| Deploy `main` + VPS | 🟡 **in attesa** | fix non ancora in produzione |
| Kill-switch `AZIONI_LIVE=0` | ✅ attivo | protezione finché LIVE off |

## Semafori
- 🟢 Va bene: REST Supabase OK; checklist onboarding 6/7 🟢; escalation 168h v4 🟢; WebFetch worker ✅; guardrail 🔴 codificato in repo (self-test 7/7).
- 🟡 Da tenere d'occhio: **deploy guardrail 🔴 su main+VPS** (codice in repo, non prod); **MCP Supabase cieco** (REST mitiga); **Stripe MCP assente** (pre payout 03/7); stallo **163,8h** → **168h ~4,2h** (countdown massimo); **4 carrelli** >4h (=); kit bando #12 (FESR chiuso 23/6); **Sprint 1 radiografia** in attesa ok; **PR Quaderni senior su `main` — Nicola segnala tab assente (06:31), merge ancora da fare**; onboarding 6/7 (Nicola); temporali pomeriggio + allerta giallo PC.
- 🔴 Problema: 0 transazioni reali; ~20 azioni approvate, 0 inviate (mani spente); **4 bloccanti pre-live** (radiografia 1/7); ordine zombie €19,05.

## Radiografia marketplace (2026-07-01)
| Metrica | Valore | Fonte |
|---|---|---|
| Problemi confermati | **46** (4·24·18) | `consegne/audit/2026-07-01-radiografia.md` |
| Bloccanti pre-live | **4** | webhook · fee UI · RLS profiles · COD ghost |
| Sprint 1 in coda | **#13** 🟡 in attesa ok Nicola | branch marketplace (no deploy) |
| Sprint 2/3 | nel report, accodati dopo ok Sprint 1 | chat Nicola 1/7 06:45 |

## Ultime mosse dell'AD
1. **Giro 1/7 06:18** — KPI live (= vs 04:17, stallo +2h, 168h ~4,2h). Escalation v4 🟢. Mossa n.1 = ordine zombie entro ~4h + Sprint 1. Vedi [[2026-07-01]].
2. **Giro 1/7 04:17** — KPI live (= vs 02:17). Carrelli 4 ▼−2. Escalation v3 🟢.
3. **Giro 1/7 02:17** — Checklist batch 6/7 🟢. Nota escalation 168h v2.
4. **Chat 1/7 06:45** — Nicola chiede workflow fix radiografia: spiegato sprint/blocchi (#13), deploy 🔴 separato, comandi `ok 13` / `ok deploy` / `ok tutti gli sprint`.
5. **Metabolizzazione 1/7 06:29** — lezione L-0701-22 guardrail universale + quaderni builder/security.
6. **Metabolizzazione 1/7 01:59** — guardrail 🔴 pre-mortem → `guardrail-semaforo.mjs`.
7. **Chat 1/7 01:02** — Nicola firma foglio-firma: contratto PQ 12% · payout 03/7 · sandbox.

## Prossime priorità (da approvare)
- [ ] 🔴 **Sbloccare ordine zombie €19,05 — Pane Quotidiano** (1ª transazione reale — **entro ~4h / ~10:30**)
- [ ] 🟡 **Ok Sprint 1 radiografia** — branch: webhook + fee UI + rollback COD + RLS
- [ ] 🔴 **Deploy fix marketplace** — solo post-Sprint 1 + env
- [ ] 🔴 **Payout-test Stripe — Nicola 03/7 mattina** (sandbox ✅)
- [ ] 🟢 **Onboarding negozi 6/7** — Nicola inserisce; checklist `consegne/onboarding/checklist-batch-6-luglio.md`
- [x] ~~Foglio-firma lancio~~ — **FATTO** Nicola 1/7 01:02
- [ ] ~~Presidio VP 3/7~~ — **RIMANDATO** (prossima finestra VP **10/17 lug**)
- [ ] 🟡 **Kit bando #12** — rivedere post-chiusura FESR 23/6

---
*Scritto dall'AD. Dettaglio in [[2026-07-01]]; decisioni in [[DECISIONI]].*
