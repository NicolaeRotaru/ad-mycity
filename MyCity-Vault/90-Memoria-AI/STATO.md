---
tipo: stato
aggiornato: 2026-07-01 20:18
fonte: AD digitale (7 numeri = live REST 1/7 20:18 · Sprint 1 LIVE Render ~10:31 · Scelta A ordine 11:05 · Supabase clmpyfvpvfjgeviworth)
---

# 📟 STATO — Cruscotto dell'azienda

> 🧠 **1/7 20:18 — Giro AD:** stallo **177,8h** — **168h SUPERATA ~9,8h oltre** (+2,0h vs 18:18). Sprint 1 **LIVE** Render (#209+#210). Scelta A ordine firmata 11:05 → **#16 in attesa** (`ok 16`). **Finestra consegna CHIUSA** (slot 18:00–20:00 scaduto) — **giornata 1/7 a zero transazioni**. Ripiano **2/7 mattina**. SQL 107 policy ⏳ (Nicola ~30s). Sync VPS #17: Nicola «ok 17» 20:18 — install bloccato (serve 1× root Console Hetzner).
>
> 🧠 **1/7 17:05 — Casella Pannello «Benchmark AI ops»:** popolato `auto-radiografia.json` (LangSmith, Devin, Sidekick) + snapshot loop 4 fasi · voto salute **76** ▲ (da 72) · tasso lezioni **0,70** · calibrazione **@AD 15/15** · altri reparti **0** · divario alto: loop architettura 🟢 vs loop business 🔴 (0 consegnati, ~20 azioni ok/0 inviate).

## I 7 numeri (live 2026-07-01 20:18 · Supabase REST clmpyfvpvfjgeviworth)
| Numero | Oggi (1/7) | "Riuscito" | Note |
|---|---|---|---|
| Negozi REALI approvati | **1** (Pane Quotidiano) | ≥1 LIVE vero | Casa Linda = demo/seed — esclusa |
| Negozi con payout attivo | **0 reali** | 1 | Casa Linda payout demo; Pane Quotidiano payout OFF |
| Prodotti VERI del faro pubblicati | **0** | ≥5 | 5 PQ bio available; 250 seed test |
| Ordini creati | **1** | ≥1 | COD €19,05 del 24/6 · **Scelta A firmata 11:05** · esecuzione #16 |
| Ordini pagati | **0** | 1 | COD non incassato |
| Ordini consegnati | **0** | 1 | nessuna consegna mai avvenuta |
| Payout testato | **0** | 1 | payout-test Nicola **03/7 mattina** (sandbox) |
| Nuovi clienti reali | **4 buyer** (0 ultimi 7g) | crescita | ultimo nuovo: 16/6 |

## Sensori MCP (inventario 2026-07-01 20:18)
| Sensore | Config | Stato | Sblocco |
|---|---|---|---|
| Supabase marketplace+memoria | `.mcp.json` ✅ | ❌ cieco Cursor | `SUPABASE_ACCESS_TOKEN` in `vps/.env` |
| Stripe (incassi/payout) | ❌ mai cablato | assente | `sk_test_…` + server MCP in config 🟡 |
| PostHog (funnel) | ❌ mai cablato | assente | 🟢 opzionale (0 ordini pagati) |
| REST Supabase marketplace | env ✅ | ✅ HTTP 200 | fallback attivo (AR-001) |
| REST Supabase memoria | env ✅ | ✅ POST briefings OK | Cabina digest |
| WebFetch | globale ✅ | ⚠️ Allerta ER OK (mappe JS) | status.supabase.com OK |

## Guardrail azioni 🔴 (2026-07-01 01:59 · chat Nicola pre-mortem)
| Componente | Stato | Note |
|---|---|---|
| `guardrail-semaforo.mjs` | ✅ in repo locale | classifica rischio + blocca senza firma |
| `esegui-azione.mjs verifica` | ✅ 7/7 | doppio cancello ingresso + pre-invio |
| Worker `NICOLA_FIRMA=1` | ✅ in repo | solo job post-Approva Pannello |
| Autopilot | ✅ solo 🟢 | secondo gate guardrail |
| Deploy marketplace Render | ✅ **Sprint 1 live ~10:31** | #209+#210 · ⏳ SQL 107 policy Nicola |
| Deploy `main` Pannello + VPS sync | 🟡 **parziale** | merge ok chat ✅ · sync VPS **codice pronto** · Nicola **«ok 17»** 20:18 · install VPS **bloccato** (mycity senza sudo) → resta 1× root Console Hetzner · #14+#15 PAT |
| Kill-switch `AZIONI_LIVE=0` | ✅ attivo | protezione finché LIVE off |

## Semafori
- 🟢 Va bene: REST Supabase OK; checklist onboarding 6/7 🟢; escalation post-168h v11 🟢; ripiano consegna 2/7 🟢; playbook CRM carrelli 🟢; guardrail 🔴 codificato; **Sprint 1 LIVE Render**; Scelta A ordine firmata; `seller_public_profiles` VIEW in prod; memoria POST briefings OK.
- 🟡 Da tenere d'occhio: **#16 ripiano 2/7 mattina**; **SQL 107 policy**; **#14/#15 token GitHub**; sync VPS (1× root); MCP cieco (REST mitiga); **4 carrelli** >4h; kit bando #12; stallo **oltre 168h (+9,8h)**.
- 🔴 Problema: 0 transazioni reali — **giornata 1/7 chiusa senza consegna**; ~20 azioni approvate, 0 inviate (mani spente); **RLS profiles** — policy permissiva finché non gira SQL 107.

## Radiografia marketplace (2026-07-01)
| Metrica | Valore | Fonte |
|---|---|---|
| Problemi confermati | **46** (4·24·18) | `consegne/audit/2026-07-01-radiografia.md` |
| Bloccanti pre-live | **4** → **1 rimasto** (SQL 107) | webhook ✅ · fee UI ✅ · RLS ⏳ · COD rollback ✅ |
| Sprint 1 | **✅ LIVE Render ~10:31** [#209](https://github.com/NicolaeRotaru/mycity/pull/209)+[#210](https://github.com/NicolaeRotaru/mycity/pull/210) · **⏳ SQL 107 policy** | commit `5799654` |
| Sprint 2/3 | nel report, accodati dopo review Sprint 1 | chat Nicola 1/7 06:45 |

## Auto-coscienza (2026-07-01 20:18 · giro AD)
| Metrica | Valore | Fonte |
|---|---|---|
| Voto salute architettura | **76** = | `auto-radiografia.json` |
| Voto fiducia giro | **87** ▼ | `auto-analisi.json` |
| Tasso applicazione lezioni | **0,70** | `apprendimento.json` meta |
| Lezioni attive | **54** | `apprendimento.json` |
| Calibrazione previsioni | **@AD 15/15** · altri reparti **0** | registro-realta |
| Loop business | 🔴 bloccato | 0 ordini consegnati · ~20 azioni approvate, 0 inviate |

## Ultime mosse dell'AD
1. **Giro 1/7 20:18** — KPI live REST stallo 177,8h (+2,0h). Finestra consegna **CHIUSA**. Escalation v11 🟢 + ripiano 2/7 🟢.
2. **Chat 1/7 20:18** — Nicola «ok 17» → install sync bloccato (no sudo) · serve Console Hetzner root.
3. **Chat 1/7 20:02** — Nicola «ok configura sync VPS» → codice #17 in repo · spiegati #14/#15.
4. **Giro 1/7 18:18** — Finestra consegna APERTA → #16 entro 20:00 (non eseguito).
5. **Pannello 1/7 11:05** — Nicola **Scelta A** ordine zombie → **#16** in attesa

## Prossime priorità (1/7 20:18)
**Obiettivo domani 2/7:** 1° ordine consegnato **in mattinata**.

1. [ ] 🔴 **#16 — Eseguire Scelta A ordine €19,05 2/7 mattina** (WhatsApp buyer + dashboard + consegna COD · serve **`ok 16`** · `consegne/operations/2026-07-01-ripiano-consegna-2-luglio.md`)
2. [ ] 🟡 **SQL 107 policy** — Nicola incolla DROP policy in Supabase (30s) → «fatto sql 107»
3. [ ] 🟡 **Sync VPS #17** — 1× root Console Hetzner → `sudo bash …/install-sync-vps.sh`
4. [ ] 🟢 **Onboarding negozi 6/7** — Nicola inserisce; checklist pronta post-#16

**In coda (non bloccanti oggi):**
- [x] ~~Decisione A/B ordine zombie~~ — **Scelta A** Nicola 1/7 11:05
- [x] ~~Deploy Sprint 1 codice~~ — **LIVE** ~10:31
- [ ] 🔴 **Payout-test Stripe — Nicola 03/7 mattina** (sandbox)
- [ ] 🟡 **#14 token write mycity** · **#15 GITHUB_MERGE_TOKEN**
- [ ] ~~Presidio VP 3/7~~ — **RIMANDATO** (prossima finestra **10/17 lug**)

---
*Scritto dall'AD. Dettaglio in [[2026-07-01]]; decisioni in [[DECISIONI]].*
