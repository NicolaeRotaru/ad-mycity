---
tipo: stato
aggiornato: 2026-07-02 16:53
fonte: AD digitale (7 numeri = baseline REST 2/7 10:19 portata avanti · Supabase clmpyfvpvfjgeviworth · stallo ricalcolato da ancora 24/6)
---

# 📟 STATO — Cruscotto dell'azienda

> 🧠 **2/7 16:53 — Giro AD:** **finestra pranzo PERSA** — `ok 16` firmato 08:38 ma #20–#22 mai eseguiti in tutta la giornata · stallo **~198,5h** (+6,6h) · 0 transazioni. **Decisione binaria stasera:** eseguire #16 (cena 18–20) **o** «archivia zombie» → focus payout-test 3/7 + batch 6/7.
>
> 🩻 **2/7 — RADIOGRAFIA + CANTIERE.** Radiografia profonda della macchina: voto **42/100** (3 bloccanti,
> 46 gravi, 34 minori). Poi **18/22 difetti CHIUSI in codice** (branch machine-analysis). **Da te 3 cose:** ① **revoca il PAT
> GitHub** (era in `.env.save`, ora rimosso ma già nella storia — solo tu chiudi il buco); ② merge+deploy dei
> fix; ③ ok a ripuntare i contenuti su **Casa Linda**. Dettaglio: [[RADIOGRAFIA-MACCHINA]] · [[AZIONI-IN-ATTESA]].
>
> 🧠 **2/7 08:40 — ok merge #19:** PR #211 merged `f84fc70` → Render LIVE · smoke @qa da completare.

## I 7 numeri (baseline REST 2/7 10:19 portata avanti · non ri-pullati live alle 16:53 — vedi Gap briefing)
| Numero | Oggi (2/7) | "Riuscito" | Note |
|---|---|---|---|
| Negozi REALI approvati | **1** (Pane Quotidiano) | ≥1 LIVE vero | Casa Linda = demo/seed — esclusa |
| Negozi con payout attivo | **0 reali** | 1 | PQ payout OFF |
| Prodotti VERI del faro pubblicati | **5** | ≥5 | PQ `status=available` |
| Ordini creati | **1** | ≥1 | COD €19,05 del 24/6 · ok 16 firmato 08:38 · **non eseguito (pranzo perso)** |
| Ordini pagati | **0** | 1 | COD non incassato |
| Ordini consegnati | **0** | 1 | nessuna consegna mai avvenuta · stallo **~198,5h** |
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
- 🔴 Problema: **0 transazioni reali** — stallo **~198,5h** (+30,5h oltre 168h); **finestra pranzo persa** (ok 16 firmato 08:38, #20–#22 mai eseguiti); loop business 🔴; RLS profiles finché non gira SQL 107; **PAT GitHub ancora in storia git (R1)**.

## Auto-coscienza (2026-07-02 16:53 · giro AD)
| Metrica | Valore | Fonte |
|---|---|---|
| Voto salute architettura | **42** (completa 12:09) | `auto-radiografia.json` top-level |
| Voto fiducia giro | **84** ▼ | `auto-analisi.json` (malus: pranzo perso, esecuzione bloccata) |
| Cantiere difetti | **18 chiusi · 4 in-corso · 0 aperti** | `cantiere-difetti.json` |
| Calibrazione previsioni | **@AD 17/17** | calibrazione.json |
| Loop business | 🔴 in corso | ok 16 firmato ma non eseguito tutta la giornata (pranzo perso) |

## Ultime mosse dell'AD
1. **Giro 2/7 16:53** — stallo ~198,5h · **pranzo perso** (#16 non eseguito) · decisione binaria stasera (esegui o archivia zombie). Baseline REST portata avanti (live non ri-pullati).
2. **Giro 2/7 10:19** — KPI live REST stallo 191,9h. #19 LIVE. ok 16 in esecuzione. Automazione verde.
3. **ok merge #19 2/7 08:40** — PR #211 merged `f84fc70` → Render auto-deploy fix ruoli.
4. **ok 16 2/7 08:38** — Nicola approva esecuzione #16 · pacchetto pranzo + passi #20–#22 accodati.
5. **Giro 2/7 08:36** — KPI live REST stallo 190,1h. Automazione verde. Meteo OK #16 pranzo.

## Prossime priorità (2/7 16:53 · pranzo perso)
**Decisione binaria stasera:** **1° ordine consegnato in finestra cena 18–20** (#20–#22) **OPPURE** «archivia zombie» → focus payout-test 3/7 + batch 6/7.

1. [ ] 🔴 **#16 — decisione binaria:** esegui #20 WhatsApp (cena) → #21 → #22 → «consegna fatta» **o** «archivia zombie»
2. [ ] 🔴 **R1 — Revoca PAT GitHub** (AR-004) — l'unica remediation del segreto in storia git
3. [ ] 🟡 **SQL 107 policy** — DROP policy profiles (~30s)
4. [ ] 🟡 **R2 — Merge+deploy fix cantiere** (branch machine-analysis)
5. [ ] 🟢 **Onboarding 6/7** — checklist pronta (indipendente dallo zombie)

**Sentinelle attive:** ordine ritardo ~198,5h · 1 carrello buyer reale · negozio LIVE 0 delivered · stallo >168h (+30,5h) · loop business 🔴 · voto salute architettura 42 (<60, completa già fatta 12:09).

---
*Scritto dall'AD. Dettaglio in [[2026-07-02]]; decisioni in [[DECISIONI]].*
