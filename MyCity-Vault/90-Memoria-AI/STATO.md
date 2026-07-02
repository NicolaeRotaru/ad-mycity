---
tipo: stato
aggiornato: 2026-07-02 08:38
fonte: AD digitale (7 numeri = live REST 2/7 08:38 · Supabase clmpyfvpvfjgeviworth)
---

# 📟 STATO — Cruscotto dell'azienda

> 🧠 **2/7 08:38 — ok 16 APPROVATO:** esecuzione #16 pranzo **avviata** · pacchetto `consegne/operations/2026-07-02-esecuzione-ok16-pranzo.md` · passi #20–#22 in coda · stallo **190,1h**.
>
> 🧠 **2/7 08:36 — Giro AD:** stallo 190,1h · meteo sereno · automazione verde.

## I 7 numeri (live 2026-07-02 08:36 · Supabase REST clmpyfvpvfjgeviworth)
| Numero | Oggi (2/7) | "Riuscito" | Note |
|---|---|---|---|
| Negozi REALI approvati | **1** (Pane Quotidiano) | ≥1 LIVE vero | Casa Linda = demo/seed — esclusa |
| Negozi con payout attivo | **0 reali** | 1 | PQ payout OFF |
| Prodotti VERI del faro pubblicati | **5** | ≥5 | PQ `status=available` |
| Ordini creati | **1** | ≥1 | COD €19,05 del 24/6 · Scelta A firmata 11:05 |
| Ordini pagati | **0** | 1 | COD non incassato |
| Ordini consegnati | **0** | 1 | nessuna consegna mai avvenuta |
| Payout testato | **0** | 1 | payout-test Nicola **03/7 mattina** (sandbox) |
| Nuovi clienti reali | **4 buyer** (0 ultimi 7g) | crescita | ultimo nuovo: 16/6 |

## Sensori MCP (inventario 2026-07-02 08:36)
| Sensore | Config | Stato | Sblocco |
|---|---|---|---|
| Supabase marketplace+memoria | `.mcp.json` ✅ | ❌ cieco Cursor | `SUPABASE_ACCESS_TOKEN` in `vps/.env` |
| Stripe (incassi/payout) | ❌ mai cablato | assente | `sk_test_…` + server MCP 🟡 |
| PostHog (funnel) | ❌ mai cablato | assente | 🟢 opzionale (0 ordini pagati) |
| REST Supabase marketplace | env ✅ | ✅ HTTP 200 | fallback attivo (AR-001) |
| REST Supabase memoria | env ✅ | ✅ POST briefings OK | Cabina digest |
| verifica-automazione.mjs | ✅ | ✅ tutto verde 08:36 | token mycity push OK |

## Guardrail azioni 🔴 (2026-07-01 01:59 · chat Nicola pre-mortem)
| Componente | Stato | Note |
|---|---|---|
| `guardrail-semaforo.mjs` | ✅ in repo locale | classifica rischio + blocca senza firma |
| `esegui-azione.mjs verifica` | ✅ 7/7 | doppio cancello ingresso + pre-invio |
| Worker `NICOLA_FIRMA=1` | ✅ in repo | solo job post-Approva Pannello |
| Autopilot | ✅ solo 🟢 | secondo gate guardrail |
| Deploy marketplace Render | ✅ Sprint 1 LIVE ~10:31 · **#19 ruoli LIVE ~08:40** | GitHub→Render auto · PR #211 `f84fc70` merged 2/7 08:40 |
| Deploy `main` Pannello + VPS sync | 🟡 **parziale** | ok 17 ✅ · install sudoers **⏳ 1× root** |
| Kill-switch `AZIONI_LIVE=0` | ✅ attivo | AZIONI_LIVE=1 su worker (merge LIVE) |

## Semafori
- 🟢 Va bene: REST OK; automazione tutto verde 08:36; meteo consegna OK oggi pranzo; Sprint 1 LIVE; **#19 ruoli merged 08:40** (Render deploy in corso); Scelta A firmata; memoria POST briefings OK; token GitHub push mycity OK.
- 🟡 Da tenere d'occhio: **#16 IN ESECUZIONE** (ok 16 08:38 — passi manuali #20–#22); **@qa smoke post-#19**; **SQL 107**; sync VPS (1× root); 1 carrello buyer reale (samir).
- 🔴 Problema: **0 transazioni reali** — stallo **190,1h** (+22,1h oltre 168h); loop business 🔴 (0 consegnati); RLS profiles finché non gira SQL 107.

## Auto-coscienza (2026-07-02 08:36 · giro AD)
| Metrica | Valore | Fonte |
|---|---|---|
| Voto salute architettura | **76** = | `auto-radiografia.json` sonda |
| Voto fiducia giro | **89** = | `auto-analisi.json` |
| Tasso applicazione lezioni | **0,70** | `apprendimento.json` meta |
| Lezioni attive | **58** | `apprendimento.json` |
| Calibrazione previsioni | **@AD 16/16** | calibrazione.json |
| Loop business | 🔴 in corso | #16 ok 16 approvato · 0 consegnati finché non chiude #22 |

## Ultime mosse dell'AD
1. **ok merge #19 2/7 08:40** — PR #211 merged `f84fc70` → Render auto-deploy fix ruoli admin/seller.
2. **ok 16 2/7 08:38** — Nicola approva esecuzione #16 · pacchetto pranzo + passi #20–#22 accodati.
3. **Giro 2/7 08:36** — KPI live REST stallo 190,1h. Automazione verde. Meteo OK #16 pranzo.
4. **Chat 2/7 08:16** — Chiarito Render vs GitHub PAT (#19).
5. **Chat 2/7 07:35** — Fix ruoli admin/seller → branch + #19 accodato.

## Prossime priorità (2/7 08:40 · #19 merged)
**Obiettivo oggi 2/7:** **1° ordine consegnato entro pranzo** (#16 in esecuzione) + smoke #19 + SQL 107.

1. [ ] ⏳ **#16 IN ESECUZIONE** — passi #20 WhatsApp · #21 dashboard+negozio · #22 COD → scrivi «consegna fatta»
2. [x] ✅ **#19 — Deploy fix ruoli acquisto** — merged PR #211 · Render ~2–5 min · smoke @qa
3. [ ] 🟡 **SQL 107 policy** — DROP policy profiles (~30s)
4. [ ] 🟡 **Sync VPS #17** — 1× root Console Hetzner
5. [ ] 🟢 **Onboarding 6/7** — checklist pronta; **dopo** #16+#19+SQL

**Sentinelle attive:** ordine ritardo 190,1h · 1 carrello buyer reale · negozio LIVE 0 delivered · stallo >168h · loop business 🔴.

---
*Scritto dall'AD. Dettaglio in [[2026-07-02]]; decisioni in [[DECISIONI]].*
