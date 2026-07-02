---
tipo: stato
aggiornato: 2026-07-02 10:19
fonte: AD digitale (7 numeri = live REST 2/7 10:19 · Supabase clmpyfvpvfjgeviworth)
---

# 📟 STATO — Cruscotto dell'azienda

> 🩻 **2/7 — RADIOGRAFIA + CANTIERE.** Radiografia profonda della macchina: voto **42/100** (3 bloccanti,
> 46 gravi, 34 minori). Poi **18/22 difetti CHIUSI in codice** (branch machine-analysis): sicurezza, battito,
> sensori, volano, agenti (drift→0), rischi, cassa, HACCP, sentinelle. **Da te 3 cose:** ① **revoca il PAT
> GitHub** (era in `.env.save`, ora rimosso ma già nella storia — solo tu chiudi il buco); ② merge+deploy dei
> fix; ③ ok a ripuntare i contenuti su **Casa Linda**. Dettaglio: [[RADIOGRAFIA-MACCHINA]] · [[AZIONI-IN-ATTESA]].

> 🧠 **2/7 10:19 — Giro AD:** stallo **191,9h** (+1,8h) · **ok 16 IN ESECUZIONE** · **#19 MERGED** 08:40 · passi #20–#22 pendenti · meteo OK pranzo.
>
> 🧠 **2/7 08:40 — ok merge #19:** PR #211 merged `f84fc70` → Render LIVE · smoke @qa da completare.

## I 7 numeri (live 2026-07-02 10:19 · Supabase REST clmpyfvpvfjgeviworth)
| Numero | Oggi (2/7) | "Riuscito" | Note |
|---|---|---|---|
| Negozi REALI approvati | **1** (Pane Quotidiano) | ≥1 LIVE vero | Casa Linda = demo/seed — esclusa |
| Negozi con payout attivo | **0 reali** | 1 | PQ payout OFF |
| Prodotti VERI del faro pubblicati | **5** | ≥5 | PQ `status=available` |
| Ordini creati | **1** | ≥1 | COD €19,05 del 24/6 · ok 16 approvato 08:38 |
| Ordini pagati | **0** | 1 | COD non incassato |
| Ordini consegnati | **0** | 1 | nessuna consegna mai avvenuta |
| Payout testato | **0** | 1 | payout-test Nicola **03/7 mattina** (sandbox) |
| Nuovi clienti reali | **4 buyer** (0 ultimi 7g) | crescita | ultimo nuovo: 16/6 |

## Sensori MCP (inventario 2026-07-02 10:19)
| Sensore | Config | Stato | Sblocco |
|---|---|---|---|
| Supabase marketplace+memoria | `.mcp.json` ✅ | ❌ cieco Cursor | `SUPABASE_ACCESS_TOKEN` in `vps/.env` |
| Stripe (incassi/payout) | ❌ mai cablato | cieco (REST) | `STRIPE_SECRET_KEY` + server MCP 🟡 |
| PostHog (funnel) | ❌ mai cablato | assente | 🟢 opzionale (0 ordini pagati) |
| REST Supabase marketplace | env ✅ | ✅ HTTP 200 | fallback attivo (AR-001) |
| REST Supabase memoria | env ✅ | ✅ POST briefings OK | Cabina digest |
| verifica-automazione.mjs | ✅ | ✅ tutto verde 10:19 | token mycity push OK |

## Guardrail azioni 🔴 (2026-07-01 01:59 · chat Nicola pre-mortem)
| Componente | Stato | Note |
|---|---|---|
| `guardrail-semaforo.mjs` | ✅ in repo locale | classifica rischio + blocca senza firma |
| `esegui-azione.mjs verifica` | ✅ 7/7 | doppio cancello ingresso + pre-invio |
| Worker `NICOLA_FIRMA=1` | ✅ in repo | solo job post-Approva Pannello |
| Autopilot | ✅ solo 🟢 | secondo gate guardrail |
| Deploy marketplace Render | ✅ Sprint 1 LIVE ~10:31 · **#19 ruoli LIVE ~08:45** | PR #211 `f84fc70` merged 2/7 08:40 |
| Deploy `main` Pannello + VPS sync | 🟡 **parziale** | ok 17 ✅ · install sudoers **⏳ 1× root** |
| Kill-switch `AZIONI_LIVE=0` | ✅ attivo | AZIONI_LIVE=1 su worker (merge LIVE) |

## Semafori
- 🟢 Va bene: REST OK; automazione tutto verde 10:19; meteo consegna OK pranzo; Sprint 1 LIVE; **#19 ruoli LIVE**; ok 16 approvato; memoria POST briefings OK; token GitHub push mycity OK.
- 🟡 Da tenere d'occhio: **#16 IN ESECUZIONE** (passi #20–#22 manuali); **@qa smoke post-#19**; **SQL 107**; sync VPS (1× root); 1 carrello buyer reale (samir).
- 🔴 Problema: **0 transazioni reali** — stallo **191,9h** (+23,9h oltre 168h); loop business 🔴 (ok 16 approvato ma 0 consegnati); RLS profiles finché non gira SQL 107.

## Auto-coscienza (2026-07-02 10:19 · giro AD)
| Metrica | Valore | Fonte |
|---|---|---|
| Voto salute architettura | **80** = | `auto-radiografia.json` sonda |
| Voto fiducia giro | **88** ▼ | `auto-analisi.json` |
| Tasso applicazione lezioni | **0,70** | `apprendimento.json` meta |
| Lezioni attive | **59** | `apprendimento.json` |
| Calibrazione previsioni | **@AD 16/16** | calibrazione.json |
| Loop business | 🔴 in corso | ok 16 approvato · 0 consegnati finché non chiude #22 |

## Ultime mosse dell'AD
1. **Giro 2/7 10:19** — KPI live REST stallo 191,9h. #19 LIVE. ok 16 in esecuzione. Automazione verde.
2. **ok merge #19 2/7 08:40** — PR #211 merged `f84fc70` → Render auto-deploy fix ruoli.
3. **ok 16 2/7 08:38** — Nicola approva esecuzione #16 · pacchetto pranzo + passi #20–#22 accodati.
4. **Giro 2/7 08:36** — KPI live REST stallo 190,1h. Automazione verde. Meteo OK #16 pranzo.
5. **Chat 2/7 08:16** — Chiarito Render vs GitHub PAT (#19).

## Prossime priorità (2/7 10:19 · #19 LIVE)
**Obiettivo oggi 2/7:** **1° ordine consegnato entro pranzo** (#20–#22) + smoke #19 + SQL 107.

1. [ ] ⏳ **#16 IN ESECUZIONE** — passi #20 WhatsApp · #21 dashboard+negozio · #22 COD → scrivi «consegna fatta»
2. [x] ✅ **#19 — Deploy fix ruoli acquisto** — merged PR #211 · Render LIVE · smoke @qa
3. [ ] 🟡 **SQL 107 policy** — DROP policy profiles (~30s)
4. [ ] 🟡 **Sync VPS #17** — 1× root Console Hetzner
5. [ ] 🟢 **Onboarding 6/7** — checklist pronta; **dopo** #16+#19 smoke+SQL

**Sentinelle attive:** ordine ritardo 191,9h · 1 carrello buyer reale · negozio LIVE 0 delivered · stallo >168h · loop business 🔴.

---
*Scritto dall'AD. Dettaglio in [[2026-07-02]]; decisioni in [[DECISIONI]].*
