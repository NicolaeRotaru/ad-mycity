---
tipo: stato
aggiornato: 2026-07-01 11:05
fonte: AD digitale (7 numeri = live REST 1/7 08:17 · Nicola Pannello Scelta A ordine zombie 11:05 · chat 11:00 ok merge scelta-ab → main 853c33a · Supabase clmpyfvpvfjgeviworth · Sprint 1 ok 07:30)
---

# 📟 STATO — Cruscotto dell'azienda

> 🧠 **1/7 10:22 — Chat Nicola:** chiarito che **`pannello/` non è repo separato** — sottocartella `ad-mycity` (Vercel root `pannello/`). Vuole **merge automatico da AD con permesso esplicito** («ok merge …» o card Pannello) per risparmiare tempo; serve **`GITHUB_MERGE_TOKEN`** (scope merge) in `cervello/vps/.env` — accodato **#15**. Tre tubi: memoria→`memoria-ad` · codice→`main`→Vercel+VPS · marketplace→repo `mycity`→Render 🔴.
>
> 🧠 **1/7 11:05 — Pannello Nicola:** **Scelta A** ordine zombie €19,05 (Pane Quotidiano · buyer 348 642 1766) — accetta e organizza consegna · decisione in [[DECISIONI]] · esecuzione accodata **#16** · **NON riproporre A/B** al prossimo giro.
>
> 🧠 **1/7 11:00 — Chat Nicola:** «**ok merge scelta-ab universale**» → push **`main`** `853c33a` · Vercel redeploy ~2 min · bottoni A/B dinamici su **tutte** le proposte binarie.
>
> 🧠 **1/7 10:50 — Chat Nicola:** «Applica A o B **ogni volta** che devo scegliere, non solo ordine zombie» · generalizzato `tipo: scelta_ab` in Pannello · deploy completato 11:00.
>
> 🧠 **1/7 10:45 — Chat Nicola:** «impara e applica sempre flusso target» + **come creare token merge** · istruzioni PAT consegnate · regola fissa: merge/push **solo** dopo ok esplicito · #15 resta in coda finché non incolli il token nel VPS.
>
> 🧠 **1/7 10:36 — Chat Nicola:** «**ok merge bottoni A/B**» → push su **`main`** commit `c50148d` · Vercel redeploy ~2 min · VPS: `sudo bash cervello/vps/aggiorna-cervello.sh` · **Decisione ordine A/B ancora 🔴** (click A o B sulla card).
>
> 🧠 **1/7 10:09 — Chat Nicola:** «3ª volta che lo approvo» — chiarito: **Approva proposta ≠ A/B ordine**; firme passate erano altro (batch 30/6, foglio-firma, Sprint 1).

## I 7 numeri (live 2026-07-01 08:17 · Supabase REST clmpyfvpvfjgeviworth)
| Numero | Oggi (1/7) | "Riuscito" | Note |
|---|---|---|---|
| Negozi REALI approvati | **1** (Pane Quotidiano) | ≥1 LIVE vero | Casa Linda = demo/seed — esclusa |
| Negozi con payout attivo | **0 reali** | 1 | Casa Linda payout demo; Pane Quotidiano payout OFF |
| Prodotti VERI del faro pubblicati | **0** | ≥5 | 5 PQ bio available; 250 seed test |
| Ordini creati | **1** | ≥1 | COD €19,05 del 24/6 · ID `58094956…` · buyer 348 642 1766 · **Scelta A firmata 11:05** · esecuzione #16 |
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
- 🟢 Va bene: REST Supabase OK; checklist onboarding 6/7 🟢; escalation 168h v5 🟢; WebFetch worker ✅; guardrail 🔴 codificato in repo (self-test 7/7); Sprint 1 codice pronto.
- 🟡 Da tenere d'occhio: **push PR Sprint 1 bloccato 403** (#14 token); **merge-on-approval PR API** (#15 token — push diretto main ✅ testato 10:36); deploy guardrail 🔴 su main+VPS; **sync VPS post-merge bottoni A/B** (`aggiorna-cervello.sh`); MCP Supabase cieco (REST mitiga); **4 carrelli** >4h; kit bando #12; onboarding 6/7 (Nicola); temporali + allerta calore oggi.
- 🔴 Problema: 0 transazioni reali (consegna non ancora avvenuta); ~20 azioni approvate, 0 inviate (mani spente); **4 bloccanti in prod** (fix in branch, non deployati); ordine zombie €19,05 — **Scelta A firmata 11:05**, esecuzione #16 in attesa.

## Radiografia marketplace (2026-07-01)
| Metrica | Valore | Fonte |
|---|---|---|
| Problemi confermati | **46** (4·24·18) | `consegne/audit/2026-07-01-radiografia.md` |
| Bloccanti pre-live | **4** | webhook · fee UI · RLS profiles · COD ghost |
| Sprint 1 | **✅ codice pronto** (Nicola ok 07:30) · PR **bloccata 403** · patch `consegne/tech/sprint-1-radiografia-marketplace.patch` | commit `8dc0f88` |
| Sprint 2/3 | nel report, accodati dopo review Sprint 1 | chat Nicola 1/7 06:45 |

## Auto-coscienza macchina (2026-07-01 09:39 · chat Nicola)
| Finding | Stato | Note |
|---|---|---|
| **AR-002** (`MARKETPLACE_REPO` Windows in radiografia.js) | spostato → **`copertura-cieca`** | audit marketplace, non cadenza |
| **cadenza-esecuzione** | ✅ chiuso | unit systemd in repo · attiva sul VPS con `install-ritmo-timers.sh` |
| **AR-005** (timer systemd ritmo su VPS) | ✅ chiuso (repo) | Nicola «ok timer ritmo» 09:43 · install root sul VPS ancora da lanciare |

## Ultime mosse dell'AD
1. **Pannello 1/7 11:05** — Nicola **Scelta A** ordine zombie €19,05 → DECISIONI + **#16** (WhatsApp + dashboard + consegna COD) · card A/B **chiusa**
2. **Chat 1/7 11:00** — Nicola «**ok merge scelta-ab universale**» → push **`main`** `853c33a` · Vercel redeploy
3. **Chat 1/7 10:50** — Nicola «A/B su **tutte** le scelte binarie» → `scelta-ab.ts` + API `/api/scelta-ab` + regola in `giro.md` · deploy completato 11:00
4. **Chat 1/7 10:36** — Nicola «**ok merge bottoni A/B**» → push **`main`** `c50148d` (3 file Pannello) · Vercel redeploy
5. **Chat 1/7 10:22** — Nicola chiede architettura `pannello/` + **merge automatico con permesso** · spiegati 3 tubi git/deploy · **#15 GITHUB_MERGE_TOKEN**
6. **Chat 1/7 10:13** — Nicola ok fix UX: bottoni **A/B** al posto di Approva/Ignora sulla proposta ordine zombie · deploy completato 10:36
7. **Chat 1/7 09:43** — Nicola «ok timer ritmo» → unit + script in repo · AR-005 chiuso
8. **Chat 1/7 09:39** — Nicola rettifica casella cadenza-esecuzione: tolto mycity-live · AR-002 → copertura-cieca
9. **Giro 1/7 08:17** — KPI live REST stallo 165,8h (+2h). Escalation v5 🟢. Briefing + auto-coscienza.
10. **Chat 1/7 07:30** — Nicola «**ok Sprint 1**» → fix 4 bloccanti su branch marketplace (no deploy).

## Prossime priorità (da approvare)
- [ ] 🔴 **Eseguire Scelta A ordine €19,05 — #16** (WhatsApp buyer 348 642 1766 + accetta dashboard PQ + consegna COD · serve [DATA/ORA])
- [x] ~~Decisione A/B ordine zombie~~ — **Scelta A** Nicola Pannello 1/7 11:05
- [ ] 🟡 **Sync VPS post-merge** — `sudo bash cervello/vps/aggiorna-cervello.sh` (fix permessi `.git/config` + allinea worker)
- [x] ~~Deploy scelta A/B universale~~ — Nicola «ok merge scelta-ab universale» 11:00 · `main` `853c33a`
- [x] ~~Deploy bottoni A/B ordine zombie~~ — Nicola «ok merge bottoni A/B» 10:36 · `main` `c50148d`
- [x] ~~Ok Sprint 1 radiografia~~ — codice pronto 1/7 07:30
- [ ] 🟡 **Push + PR marketplace** — bloccato 403 · patch in `consegne/tech/` · push manuale o **`ok 14`**
- [ ] 🔴 **Deploy Sprint 1** — post-review + migrazione `107_seller_public_profiles.sql` su prod
- [ ] 🔴 **Payout-test Stripe — Nicola 03/7 mattina** (sandbox ✅)
- [ ] 🟢 **Onboarding negozi 6/7** — Nicola inserisce; checklist `consegne/onboarding/checklist-batch-6-luglio.md`
- [x] ~~Foglio-firma lancio~~ — **FATTO** Nicola 1/7 01:02
- [ ] ~~Presidio VP 3/7~~ — **RIMANDATO** (prossima finestra VP **10/17 lug**)
- [ ] 🟡 **Kit bando #12** — rivedere post-chiusura FESR 23/6

---
*Scritto dall'AD. Dettaglio in [[2026-07-01]]; decisioni in [[DECISIONI]].*
