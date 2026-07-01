---
tipo: stato
aggiornato: 2026-07-01 11:52
fonte: AD digitale (7 numeri = live REST 1/7 11:52 · Sprint 1 LIVE Render ~10:31 · Scelta A ordine 11:05 · Supabase clmpyfvpvfjgeviworth)
---

# 📟 STATO — Cruscotto dell'azienda

> 🧠 **1/7 11:52 — Giro AD:** stallo **169,4h** — **168h SUPERATA ~10:30**. Sprint 1 **LIVE** Render (#209+#210). Scelta A ordine firmata 11:05 → **#16 in attesa** (`ok 16` + data/ora). SQL 107 policy ⏳ (Nicola ~30s). Temporali 15-16 oggi.
>
> 🧠 **1/7 11:29 — Casella Pannello «SQL 107 DROP policy»:** Nicola «l'ho approvato, perché chiede di nuovo?» · **Non è un secondo deploy** — «ok deploy Sprint 1» (11:10) = codice Render ✅ già live · **resta 1 passo manuale** Supabase (DROP policy) · verificato: anon legge ancora `profiles.stripe_account_id` · card rimossa da Proposte · **Ignora** la card · incolla SQL → scrivi «fatto sql 107»
>
> 🧠 **1/7 11:05 — Pannello Nicola:** **Scelta A** ordine zombie €19,05 (Pane Quotidiano · buyer 348 642 1766) — accetta e organizza consegna · decisione in [[DECISIONI]] · esecuzione accodata **#16** · **NON riproporre A/B**

## I 7 numeri (live 2026-07-01 11:52 · Supabase REST clmpyfvpvfjgeviworth)
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

## Sensori MCP (inventario 2026-07-01 11:52)
| Sensore | Config | Stato | Sblocco |
|---|---|---|---|
| Supabase marketplace+memoria | `.mcp.json` ✅ | ❌ cieco Cursor | `SUPABASE_ACCESS_TOKEN` in `vps/.env` |
| Stripe (incassi/payout) | ❌ mai cablato | assente | `sk_test_…` + server MCP in config 🟡 |
| PostHog (funnel) | ❌ mai cablato | assente | 🟢 opzionale (0 ordini pagati) |
| REST Supabase marketplace | env ✅ | ✅ HTTP 200 | fallback attivo (AR-001) |
| REST Supabase memoria | env ✅ | ✅ POST briefings OK | Cabina digest |
| WebFetch | globale ✅ | ✅ worker | merge 1/7 01:37 |

## Guardrail azioni 🔴 (2026-07-01 01:59 · chat Nicola pre-mortem)
| Componente | Stato | Note |
|---|---|---|
| `guardrail-semaforo.mjs` | ✅ in repo locale | classifica rischio + blocca senza firma |
| `esegui-azione.mjs verifica` | ✅ 7/7 | doppio cancello ingresso + pre-invio |
| Worker `NICOLA_FIRMA=1` | ✅ in repo | solo job post-Approva Pannello |
| Autopilot | ✅ solo 🟢 | secondo gate guardrail |
| Deploy marketplace Render | ✅ **Sprint 1 live ~10:31** | #209+#210 · ⏳ SQL 107 policy Nicola |
| Deploy `main` Pannello + VPS sync | 🟡 **parziale** | merge ok · `aggiorna-cervello.sh` da lanciare |
| Kill-switch `AZIONI_LIVE=0` | ✅ attivo | protezione finché LIVE off |

## Semafori
- 🟢 Va bene: REST Supabase OK; checklist onboarding 6/7 🟢; escalation post-168h v6 🟢; WebFetch worker ✅; guardrail 🔴 codificato; **Sprint 1 LIVE Render**; Scelta A ordine firmata; `seller_public_profiles` VIEW in prod.
- 🟡 Da tenere d'occhio: **#16 esecuzione ordine** (in attesa `ok 16`); **SQL 107 policy**; **#14/#15 token GitHub**; sync VPS; MCP cieco (REST mitiga); **4 carrelli** >4h; kit bando #12; temporali 15-16 oggi; stallo **oltre 168h**.
- 🔴 Problema: 0 transazioni reali (consegna non ancora avvenuta); ~20 azioni approvate, 0 inviate (mani spente); **RLS profiles** — policy permissiva finché non gira SQL 107.

## Radiografia marketplace (2026-07-01)
| Metrica | Valore | Fonte |
|---|---|---|
| Problemi confermati | **46** (4·24·18) | `consegne/audit/2026-07-01-radiografia.md` |
| Bloccanti pre-live | **4** → **1 rimasto** (SQL 107) | webhook ✅ · fee UI ✅ · RLS ⏳ · COD rollback ✅ |
| Sprint 1 | **✅ LIVE Render ~10:31** [#209](https://github.com/NicolaeRotaru/mycity/pull/209)+[#210](https://github.com/NicolaeRotaru/mycity/pull/210) · **⏳ SQL 107 policy** | commit `5799654` |
| Sprint 2/3 | nel report, accodati dopo review Sprint 1 | chat Nicola 1/7 06:45 |

## Ultime mosse dell'AD
1. **Giro 1/7 11:52** — KPI live REST stallo 169,4h (168h superata). Escalation post-168h v6 🟢. Briefing + auto-coscienza.
2. **Pannello 1/7 11:29** — Nicola chiarito SQL 107 ≠ secondo deploy · card ritirata
3. **Pannello 1/7 11:05** — Nicola **Scelta A** ordine zombie → **#16** in attesa
4. **Chat 1/7 11:10** — Nicola «ok deploy Sprint 1» → Render già live · resta SQL 107
5. **Piano del mattino 1/7 11:18** — 3 priorità: #16 · deploy Sprint 1 ✅ · batch 6/7

## Prossime priorità (1/7 11:52)
**Obiettivo giornata:** 1° ordine consegnato + piattaforma pronta per batch 6/7.

1. [ ] 🔴 **#16 — Eseguire Scelta A ordine €19,05** (WhatsApp buyer + dashboard + consegna COD · serve **data/ora** + `ok 16`) — **PRIMA temporali 15-16 se possibile**
2. [ ] 🟡 **SQL 107 policy** — Nicola incolla DROP policy in Supabase (30s) → «fatto sql 107»
3. [ ] 🟢 **Onboarding negozi 6/7** — Nicola inserisce; checklist `consegne/onboarding/checklist-batch-6-luglio.md`

**In coda (non bloccanti oggi):**
- [x] ~~Decisione A/B ordine zombie~~ — **Scelta A** Nicola 1/7 11:05
- [x] ~~Deploy Sprint 1 codice~~ — **LIVE** ~10:31
- [ ] 🟡 **Sync VPS** — `sudo bash cervello/vps/aggiorna-cervello.sh`
- [ ] 🔴 **Payout-test Stripe — Nicola 03/7 mattina** (sandbox)
- [ ] 🟡 **#14 token write mycity** · **#15 GITHUB_MERGE_TOKEN**
- [ ] ~~Presidio VP 3/7~~ — **RIMANDATO** (prossima finestra **10/17 lug**)

---
*Scritto dall'AD. Dettaglio in [[2026-07-01]]; decisioni in [[DECISIONI]].*
