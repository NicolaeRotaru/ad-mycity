---
tipo: stato
aggiornato: 2026-07-01 07:41
fonte: AD digitale (7 numeri = live REST 1/7 06:18 · Supabase clmpyfvpvfjgeviworth · Sprint 1 branch 1/7 07:30 · push PR 403 07:41 · chat Nicola)
---

# 📟 STATO — Cruscotto dell'azienda

> 🧠 **1/7 07:41 — PR Sprint 1:** Nicola chiede PR → **push `mycity` ancora 403** (PAT scrive solo `ad-mycity`). Codice + patch pronti; accodato **#14** token write su mycity. Mossa n.1 = **tu push 2 min** O **`ok 14`** poi **`ok push Sprint 1`**.

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
- 🟡 Da tenere d'occhio: **Sprint 1 branch pronto** — push PR `NicolaeRotaru/mycity` + migrazione `107` + review → **`ok deploy Sprint 1`** 🔴; **deploy guardrail 🔴 su main+VPS**; **MCP Supabase cieco** (REST mitiga); **Stripe MCP assente** (pre payout 03/7); stallo **163,8h** → **168h ~4,2h**; **4 carrelli** >4h; kit bando #12; **PR Quaderni senior su `main`** (tab assente 06:31); onboarding 6/7 (Nicola); temporali + allerta giallo PC.
- 🔴 Problema: 0 transazioni reali; ~20 azioni approvate, 0 inviate (mani spente); **4 bloccanti in prod** (fix in branch, non deployati); ordine zombie €19,05.

## Radiografia marketplace (2026-07-01)
| Metrica | Valore | Fonte |
|---|---|---|
| Problemi confermati | **46** (4·24·18) | `consegne/audit/2026-07-01-radiografia.md` |
| Bloccanti pre-live | **4** | webhook · fee UI · RLS profiles · COD ghost |
| Sprint 1 | **#13 codice pronto** · PR **bloccata 403** · patch `consegne/tech/sprint-1-radiografia-marketplace.patch` | Nicola ok 1/7 07:30 · token #14 |
| Sprint 2/3 | nel report, accodati dopo review Sprint 1 | chat Nicola 1/7 06:45 |

## Ultime mosse dell'AD
1. **Chat 1/7 07:41** — Nicola «crea la PR» → push+API GitHub **403** (PAT senza write su `mycity`). Patch salvata · **#14** token in coda.
2. **Chat 1/7 07:30** — Nicola «**ok Sprint 1**» → fix 4 bloccanti + extra urgenti su branch marketplace (no deploy).

## Prossime priorità (da approvare)
- [ ] 🔴 **Sbloccare ordine zombie €19,05 — Pane Quotidiano** (1ª transazione reale — **entro ~4h / ~10:30**)
- [x] ~~Ok Sprint 1 radiografia~~ — codice pronto 1/7 07:30
- [ ] 🟡 **Push + PR marketplace** — bloccato 403 · patch in `consegne/tech/` · opzione rapida sotto
- [ ] 🟡 **#14 Token write su mycity** — sblocca push automatici futuri
- [ ] 🔴 **Deploy Sprint 1** — post-review + migrazione `107_seller_public_profiles.sql` su prod
- [ ] 🔴 **Payout-test Stripe — Nicola 03/7 mattina** (sandbox ✅)
- [ ] 🟢 **Onboarding negozi 6/7** — Nicola inserisce; checklist `consegne/onboarding/checklist-batch-6-luglio.md`
- [x] ~~Foglio-firma lancio~~ — **FATTO** Nicola 1/7 01:02
- [ ] ~~Presidio VP 3/7~~ — **RIMANDATO** (prossima finestra VP **10/17 lug**)
- [ ] 🟡 **Kit bando #12** — rivedere post-chiusura FESR 23/6

---
*Scritto dall'AD. Dettaglio in [[2026-07-01]]; decisioni in [[DECISIONI]].*
