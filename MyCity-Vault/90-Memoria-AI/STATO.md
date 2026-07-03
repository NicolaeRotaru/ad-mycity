---
tipo: stato
aggiornato: 2026-07-03 14:20
fonte: AD digitale (🔭 Giro refresh 3/7 14:20 · #16 APPROVATO dal Pannello 13:29 ma NON ancora consegnato · 7 numeri baseline REST invariati dal 24/6 · MCP+node/curl gated in sessione · PostHog cieco 15 giri · stallo ~222h da ancora 24/6 08:28 · oggi Venerdì Piacentini · meteo già ri-verificato LIVE al mattino: sereno 20-33° + AFA pomeriggio → finestra consegna serale post-19:00)
---

# 📟 STATO — Cruscotto dell'azienda

> ✅ **2/7 17:09 — DECISIONE BINARIA #16 RISOLTA — Scelta A (Pannello):** Nicola sceglie **ESEGUIRE**, non «archivia zombie». `ok 16` era firmato alle 08:38 ma non eseguito in ~8h (pranzo perso) → la card chiedeva una scelta netta. **Slot spostato a CENA 19:00–21:00.** Azioni #20→#21→#22 attive (WhatsApp buyer + accetta ordine dashboard PQ + consegna COD €19,05). Pacchetto aggiornato · card decisione binaria **da NON rigenerare**. Dettaglio: [[DECISIONI]] · [[AZIONI-IN-ATTESA]] #16/#20.
>
> 🩻 **2/7 — RADIOGRAFIA + CANTIERE.** Radiografia profonda della macchina: voto **42/100** (3 bloccanti,
> 46 gravi, 34 minori). Poi **18/22 difetti CHIUSI in codice** (branch machine-analysis). **Da te 3 cose:** ① **revoca il PAT
> GitHub** (era in `.env.save`, ora rimosso ma già nella storia — solo tu chiudi il buco); ② merge+deploy dei
> fix; ③ ok a ripuntare i contenuti su **Casa Linda**. Dettaglio: [[RADIOGRAFIA-MACCHINA]] · [[AZIONI-IN-ATTESA]].
>
> 🧠 **2/7 08:40 — ok merge #19:** PR #211 merged `f84fc70` → Render LIVE · smoke @qa da completare.

## I 7 numeri (baseline REST · invariati dal 24/6 · MCP+node gated in sessione 3/7 14:20)
| Numero | Oggi (3/7 14:20) | "Riuscito" | Note |
|---|---|---|---|
| Negozi REALI approvati | **1** (Pane Quotidiano) | ≥1 LIVE vero | Casa Linda = demo/seed — esclusa |
| Negozi con payout attivo | **0 reali** | 1 | PQ payout OFF · payout-test sandbox oggi |
| Prodotti VERI del faro pubblicati | **5** | ≥5 | PQ `status=available` |
| Ordini creati | **1** | ≥1 | COD €19,05 del 24/6 · **#16 APPROVATO dal Pannello 13:29** · consegna non ancora avvenuta → finestra serale post-19:00 |
| Ordini pagati | **0** | 1 | COD non incassato |
| Ordini consegnati | **0** | 1 | nessuna consegna mai avvenuta · stallo **~222h** (14:20) |
| Payout testato | **0** | 1 | payout-test Nicola **03/7** (sandbox) → accorpare #16 |
| Nuovi clienti reali | **4 buyer** (0 ultimi 7g) | crescita | ultimo nuovo: 16/6 · 23 profili totali |

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
- 🟢 Va bene: REST OK; Stripe/Resend ok; Sprint 1 LIVE; **#19 ruoli LIVE**; **#16 APPROVATO dal Pannello 13:29**; memoria POST briefings OK; token GitHub push mycity OK.
- 🟡 Da tenere d'occhio: **#16 approvato — manca solo la consegna manuale #20–#22** (tap link WhatsApp, finestra serale post-19:00 col payout-test); **@qa smoke post-#19**; **SQL 107**; sync VPS (1× root); 1 carrello buyer reale (samir).
- 🔴 Problema: **0 transazioni reali** — stallo **~222h** (+54h oltre 168h); #16 approvato 13:29 ma consegna non ancora partita; afa pomeridiana (33° alle 17) → freschi meglio la sera; loop business 🔴 finché #20–#22 non partono a mano; RLS profiles finché non gira SQL 107; **PAT GitHub ancora in storia git (R1)**.

## Auto-coscienza (2026-07-03 14:20 · 🔭 giro AD refresh)
| Metrica | Valore | Fonte |
|---|---|---|
| Voto salute architettura | **42** (completa 12:09 2/7) | `auto-radiografia.json` top-level |
| Voto fiducia giro | **79** = | `auto-analisi.json` (refresh onesto: unica novità = #16 approvato 13:29 non ancora consegnato; live gated; contatore cieco PostHog 13→15) |
| Cantiere difetti | **20 chiusi · 2 in-corso (umani) · 1 aperto (AR-024)** | `cantiere-difetti.json` |
| Calibrazione previsioni | **@AD 20/20** | calibrazione.json |
| Loop business | 🔴 in corso | #16 approvato 13:29 ma consegna non ancora partita → finestra serale |

## Ultime mosse dell'AD
0R. **📅 REVIEW SETTIMANALE 3/7 15:00** — retrospettiva 27/6→3/7. Verdetto: infrastruttura verde + volano-architettura gira (20 difetti chiusi in codice, salute 42/~50 pending-merge), ma **North Star = 0 consegnati** — azienda ferma su UNA mano non collegata (#16 approvato 13:29 ≠ consegnato, 4 finestre saltate). Volano-BUSINESS ancora aperto (0 esperimenti misurati). Radiografia completa NON ri-lanciata di proposito (ultima 07-02 12:09 <27h, gate AR-019/AR-025). Pagella + 4 principi + calibrazione 24/24 in [[RITMO]]; lettera riscritta [[LETTERA-A-NICOLA]]; 2 auto-riscritture 🟡 proposte (AR-024/AR-025). 3 mosse settimana: ① 1ª transazione stasera + collegare la mano · ② chiudere AR-024/AR-025 · ③ sbloccare i 2 bloccanti umani (R1 revoca PAT + R2 merge).
0. **🔭 Giro refresh 3/7 14:20** — full da delta-gate (14:20 «cambio stato sensori»: PostHog cieco **15** giri, era 13). **Unica novità reale:** dalle intenzioni risulta **#16 APPROVATO dal Pannello alle 13:29** (decisione registrata) — ma la firma REST 14:20 è invariata (ordini=1, ultimo 24/6 08:28, 23 profili): **approvato ≠ consegnato**, l'ordine è ancora zombie. MCP+node/curl gated in sessione → baseline REST, zero numeri inventati. Meteo/eventi non ri-controllati (già LIVE al mattino, cadenza). Stallo **~222h**. Timestamp Cabina riallineati. **4ª conferma oggi** del falso-nuovo delta-gate (contatore cieco PostHog). ⏰ Siamo nel picco d'afa (33° alle 17) → **finestra freschi spostata a stasera post-19:00** (Venerdì Piacentini, aria più fresca). → Mossa n.1: esegui la **consegna** di #16 (già approvata) stasera col payout-test.
0-. **🔭 Giro refresh 3/7 11:14** — full da delta-gate (11:13 «cambio stato sensori»: PostHog cieco **13** giri, era 12). **Nessuna novità di business:** firma invariata (ordini=1, ultimo 24/6 08:28, 23 profili) — delta-gate 10:29 ha ri-misurato LIVE `corrente==ultimo_pieno`. MCP+node/curl gated in questa sessione → baseline REST, zero numeri inventati. Meteo/eventi non ri-controllati (già LIVE al mattino, cadenza rispettata). Stallo **~219h**. Timestamp Cabina riallineati (briefing/STATO/ultimo-briefing/auto-coscienza/registro-realta). **3ª conferma oggi** del falso-nuovo delta-gate (contatore cieco-opzionale PostHog). → Mossa n.1 confermata: esegui #16 **oggi in mattinata** col payout-test, prima dell'afa.
0-. **🔭 Giro refresh 3/7 10:22** — full da delta-gate (10:20 «cambio stato sensori»: PostHog cieco **12** giri, era 11). **Nessuna novità di business:** firma invariata (ordini=1, ultimo 24/6 08:28, 23 profili; `corrente==ultimo_pieno` sul business). MCP Supabase ri-confermato cieco **anche in questa sessione** (probe MCP marketplace negato dai permessi) → baseline REST, zero numeri inventati. Meteo/eventi non ri-controllati (già LIVE al mattino, cadenza rispettata). Stallo **~218h**. Timestamp Cabina riallineati (briefing/STATO/ultimo-briefing/auto-coscienza/registro-realta). 2ª conferma oggi del falso-nuovo delta-gate (contatore cieco-opzionale). → Mossa n.1 confermata: esegui #16 **oggi** col payout-test.
0-. **🔭 Giro refresh 3/7 08:20** — full da delta-gate (08:20 «cambio stato sensori»: PostHog cieco **11** giri, era 10). **Nessuna novità di business:** firma invariata (ordini=1, ultimo 24/6 08:28, 23 profili; `corrente==ultimo_pieno` sul business). MCP Supabase ri-confermato cieco **anche in questa sessione** (probe MCP marketplace negato dai permessi) → baseline REST, zero numeri inventati. Meteo/eventi non ri-controllati (già LIVE al mattino, cadenza rispettata per non sprecare il Max). Stallo **~216h**. Timestamp Cabina riallineati (briefing/STATO/ultimo-briefing/auto-coscienza). → Mossa n.1 confermata: esegui #16 **stamattina** col payout-test.
0-. **☀️ Giro del mattino 3/7 06:28** — full da delta-gate (06:20 «cambio stato sensori»: PostHog cieco 10 giri; business firma invariata: ordini=1, ultimo 24/6, 23 profili). **Dato nuovo e azionabile: meteo di oggi ri-verificato LIVE (3BMeteo/iLMeteo) → sereno 20→33°C con ALLERTA AFA nel pomeriggio (max 33° alle 17)** → la finestra consegna migliore per i freschi è **STAMATTINA**: rafforza «esegui #16 stamattina» prima del caldo pomeridiano. Oggi Venerdì Piacentini (centro pieno → ritiro facile). Stallo **~214h**. Timestamp Cabina riallineati (briefing/STATO/ultimo-briefing/auto-coscienza). Osservazione: il delta-gate fa scattare giri pieni sul solo incremento del contatore cieco PostHog (opzionale) → rifinitura AR-019/AR-024 in apprendimento. → Mossa n.1 confermata: esegui #16 **stamattina** col payout-test.
0-. **🔭 Giro notte 3/7 00:33 (refresh +6min)** — **delta-gate 00:31 conferma `corrente==ultimo_pieno`** (nessun cambiamento di stato reale): 7 numeri = baseline REST 22:28 invariata; MCP+node gated in sessione. Unica variazione sensori: **PostHog cieco 9 giri** (era 8). Radar non ri-verificato (meteo/eventi già live al 00:08). Aggiornati timestamp Cabina (briefing/STATO/ultimo-briefing/auto-coscienza) → Mossa n.1 confermata: esegui #16 **stamattina 3/7** col payout-test.
0-. **🔭 Giro notte 3/7 00:27 (refresh +4min)** — delta-gate `corrente==ultimo_pieno`; 7 numeri baseline REST invariati. Unica variazione sensori: PostHog cieco 8 giri (era 7). Timestamp Cabina riallineati.
0-. **🔭 Giro notte 3/7 00:23 (refresh +5min)** — delta-gate `corrente==ultimo_pieno`; 7 numeri baseline REST invariati. Unica variazione sensori: PostHog cieco 7 giri (era 6). Timestamp Cabina riallineati.
0-. **🔭 Giro notte 3/7 00:18 (heartbeat +10min)** — nessuna novità di business. Unica variazione sensori: PostHog cieco 6 giri. Timestamp Cabina riallineati.
0-. **🔭 Giro notte 3/7 00:08** — full da delta-gate, +2h dal precedente. **Nessuna novità business** (7 numeri = baseline REST 22:28: 1 ordine, ultimo 24/6, 23 profili; MCP+node gated in sessione). **Unico dato nuovo: meteo di oggi 3/7 sereno 32°/19° (pioggia 30%) → finestra consegna favorevole**; oggi è **Venerdì Piacentini** (centro pieno, presidio rimandato ma facilita il ritiro). Stallo **~206h**. → Mossa n.1 confermata: esegui #16 **stamattina 3/7** col payout-test.
0a. **🔭 Giro serale/notte 2/7 22:20** — full da delta-gate (cambio stato sensori: PostHog cieco 3 giri). 7 numeri LIVE REST invariati. Finestra cena 19–21 SALTATA — #16 non eseguito (3ª finestra saltata). Stallo ~206h → riprogrammato mattina 3/7.
0b. **🌙 Report della sera 2/7 18:00** — chiusura giornata: #19 MERGED (Render LIVE), cantiere radiografia 42→80, decisione #16 = esegui (cena 19–21). Lezione L-2026-0702: firma ≠ esecuzione (mani non collegate). RITMO.md + SALA aggiornati.
1. **Giro 2/7 17:21** — delta 12 min dopo la decisione #16: registrato stato «esegui», stallo ricalcolato **~199h**, timestamp/snapshot aggiornati. Live gated (MCP/node), baseline REST 10:19 avanti, nessun numero nuovo.
1. **Decisione binaria #16 2/7 17:09** — Nicola **Scelta A (esegui, non archivia)** dal Pannello · slot → **cena 19–21** · #20–#22 attive · pacchetto + DECISIONI + coda aggiornati · card da non rigenerare.
2. **Giro 2/7 17:01** — delta 8 min: nulla di nuovo, stallo ~198,6h · decisione binaria stasera (poi risolta 17:09). Live gated, baseline REST portata avanti.
3. **Giro 2/7 10:19** — KPI live REST stallo 191,9h. #19 LIVE. ok 16 in esecuzione. Automazione verde.
4. **ok merge #19 2/7 08:40** — PR #211 merged `f84fc70` → Render auto-deploy fix ruoli.
5. **ok 16 2/7 08:38** — Nicola approva esecuzione #16 · pacchetto pranzo + passi #20–#22 accodati.

## Prossime priorità (🔭 Giro refresh 3/7 14:20 · #16 approvato 13:29 · finestra reale = SERA post-19:00, fuori afa)
**Approvato (Pannello 13:29):** eseguire la consegna del 1° ordine. Le 3 finestre del 2/7 + la mattina di oggi sono passate; ora è pomeriggio con **allerta AFA (33° alle 17)** → i freschi conviene consegnarli **stasera post-19:00**, quando l'aria si rinfresca e il centro è pieno per il **Venerdì Piacentini**, accorpando il payout-test. Manca solo il tap manuale #20. Stallo **~222h**.

1. [ ] 🔴 **#16 — ESEGUI LA CONSEGNA (mano Nicola) STASERA post-19:00 + payout-test:** tap link WhatsApp #20 (slot sera) → #21 accetta ordine + chiama PQ 0523 388601 → #22 consegna COD €19,05 → scrivi «consegna fatta» · accorpato al payout-test sandbox
2. [ ] 🔴 **R1 — Revoca PAT GitHub** (AR-004) — l'unica remediation del segreto in storia git
3. [ ] 🟡 **SQL 107 policy** — DROP policy profiles (~30s) + **R2 merge+deploy fix cantiere** (branch machine-analysis) → piattaforma sicura per batch 6/7
4. [ ] 🟡 **#23 PostHog** (Personal Key phx_, cieco 15 giri) · **#24 falso positivo Casa Linda demo** — firma opzionale
5. [ ] 🟢 **Onboarding 6/7** — checklist pronta (indipendente dallo zombie)

**Sentinelle attive:** ordine ritardo ~222h · 1 carrello buyer reale · negozio LIVE 0 delivered · stallo >168h (+54h) · loop business 🔴 · **sensore cieco ≥3 giri: PostHog (401, cieco 15 giri, opzionale)** · voto salute architettura 42 (<60, pending-merge AR-024, completa già fatta 12:09) · chiusura-loop 5 quaderni fermi (ad, direttore-creativo, marketing, qa-designer, relazioni-istituzionali).

---
*Scritto dall'AD. Dettaglio in [[2026-07-02]]; decisioni in [[DECISIONI]].*
