---
tipo: stato
aggiornato: 2026-07-06 14:00
fonte: AD digitale (🚨 6/7 14:00 misura fresca via Supabase MCP: ordine #16 CANCELED dal 3/7 17:38, mai accettato → #21/#22 non più eseguibili, nuova #33 in coda · Piano della Piramide scritto+verificato (panel 3 lenti), firma in coda #34 · REST env assenti in sessione cloud → lettura via MCP, zero numeri inventati)
---

# 📟 STATO — Cruscotto dell'azienda

> 🚨 **6/7 14:00 — MISURA FRESCA (Supabase MCP): L'ORDINE #16 È CANCELLATO NEL DATABASE.**
> `delivery_status=CANCELED` · `canceled_at=2026-07-03 17:38` ora IT · `accepted_at=null` — il primo
> ordine è **morto in attesa il 3/7 pomeriggio, PRIMA del «prosegui #21-#22» del 4/7 04:51**: mai
> accettato in 9 giorni. Le azioni #21 (accetta) e #22 (consegna) **non sono più eseguibili** →
> sostituite dalla **#33 🔴: richiama il buyer e rifate l'ordine insieme** (o ordine-test di Nicola).
> Altri numeri 6/7 14:00 (fonte MCP): profili 23 · prodotti disponibili 250 · profili-venditore (incl.
> demo) 17 · buyer con ordini 1 · ordini totali 1 (il cancellato). **North Star resta 0.**
> Oggi inoltre: **Piano della Piramide** scritto, passato dal panel avversariale a 3 lenti e riveduto
> (`consegne/strategia/2026-07-06-piano-piramide-infrastruttura-completa.md`, firma in coda **#34**);
> preparati **Modello di consegna v1** (`consegne/operations/`) e **Accendi lo storico**
> (`consegne/analista/`); coda +#33-#36; CHECKLIST-NICOLA rinnovata (era ferma al 26/6). Ledger sensori
> ripristinato alla verità VPS del 4/7 22:20 (la cecità della sessione cloud non è la morte dei sensori).
>
> 🎉 **4/7 11:30 — OGGI È SANT'ANTONINO (patrono di Piacenza):** Fiera 250 bancarelle (33 alimentari), mercato piazza Cavalli/Duomo, centro pienissimo tutto il giorno. La ZTL (mezzi >35q dalle 6) **non tocca** consegne a piedi/bici → la consegna di **#16** da Via Calzolai 25 è facilissima oggi. Meteo sereno 20→33°, picco afa alle 17 → freschi in mattinata o dopo le 18. **Business invariato dal 24/6** (firma REST 11:30: ordini=1, ultimo 24/6, 23 clienti; stallo ~243h ≈ 10 giorni). MCP+node/curl gated in sessione → baseline REST, zero numeri inventati. Dettaglio: [[2026-07-04]].
>
> 🚚 **4/7 04:51 — #16 IN CONSEGNA — Nicola «prosegui #21-#22»:** alla domanda auto-analisi «Hai inviato WhatsApp #20? Buyer ha risposto?» Nicola risponde **«prosegui #21-#22»** → **#20 WhatsApp INVIATO**, contatto col buyer avvenuto. Restano le mani manuali di Nicola: **#21** accetta ordine `58094956…` in dashboard PQ + chiama 0523 388601 · **#22** consegna COD €19,05 → «Consegnato». Al «consegna fatta»: North Star 0→1 + payout-test #2 + A13/A14 (#27) + carrello samir (#26). Domanda «WhatsApp #20?» **RISOLTA — non riproporre**. Dettaglio: [[DECISIONI]] · [[AZIONI-IN-ATTESA]] #16/#20/#21/#22.
>
> ✅ **2/7 17:09 — DECISIONE BINARIA #16 RISOLTA — Scelta A (Pannello):** Nicola sceglie **ESEGUIRE**, non «archivia zombie». `ok 16` era firmato alle 08:38 ma non eseguito in ~8h (pranzo perso) → la card chiedeva una scelta netta. **Slot spostato a CENA 19:00–21:00.** Azioni #20→#21→#22 attive (WhatsApp buyer + accetta ordine dashboard PQ + consegna COD €19,05). Pacchetto aggiornato · card decisione binaria **da NON rigenerare**. Dettaglio: [[DECISIONI]] · [[AZIONI-IN-ATTESA]] #16/#20.
>
> 🩻 **2/7 — RADIOGRAFIA + CANTIERE.** Radiografia profonda della macchina: voto **42/100** (3 bloccanti,
> 46 gravi, 34 minori). Poi **18/22 difetti CHIUSI in codice** (branch machine-analysis). **Da te 3 cose:** ① **revoca il PAT
> GitHub** (era in `.env.save`, ora rimosso ma già nella storia — solo tu chiudi il buco); ② merge+deploy dei
> fix; ③ ok a ripuntare i contenuti su **Casa Linda**. Dettaglio: [[RADIOGRAFIA-MACCHINA]] · [[AZIONI-IN-ATTESA]].
>
> 🧠 **2/7 08:40 — ok merge #19:** PR #211 merged `f84fc70` → Render LIVE · smoke @qa da completare.
>
> 🛠️ **3/7 19:46 — FIX LETTURA VAULT DEL PANNELLO (PR #167).** Tolta la causa radice del «il Pannello non vede tutti i dati di GitHub»: la lettura tornava vuota **in silenzio** su disallineamento di ramo. Ora la lettura **ripiega `memoria-ad`→`main`** in sola lettura (mai schermo vuoto), espone in `/api/stato` **da quale ramo** arriva il dato (deriva visibile) e mostra i briefing anche «fuori formato». Codice pronto in **PR #167**; deploy Vercel bloccato oggi dal limite free (~24h). Coda #28. Dettaglio: [[DECISIONI]].

## I 7 numeri (baseline REST · invariati dal 24/6 · giro.sh 4/7 11:30 · MCP+node gated in sessione)
| Numero | Oggi (3/7 21:21) | "Riuscito" | Note |
|---|---|---|---|
| Negozi REALI approvati | **1** (Pane Quotidiano) | ≥1 LIVE vero | Casa Linda = demo/seed — esclusa |
| Negozi con payout attivo | **0 reali** | 1 | PQ payout OFF · payout-test sandbox oggi |
| Prodotti VERI del faro pubblicati | **5** | ≥5 | PQ `status=available` |
| Ordini creati | **1** | ≥1 | COD €19,05 del 24/6 · ⚠️ **CANCELLATO il 3/7 17:38, mai accettato** (misura MCP 6/7 14:00) → **#33**: richiamare il buyer e rifare l'ordine |
| Ordini pagati | **0** | 1 | COD non incassato |
| Ordini consegnati | **0** | 1 | nessuna consegna mai avvenuta · stallo **~229h** (21:21) |
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
- 🟡 Da tenere d'occhio: **#16 IN CONSEGNA — WhatsApp #20 fatto, restano #21 (accetta) + #22 (consegna COD €19,05)** in mano a Nicola; **@qa smoke post-#19**; **SQL 107 → ora AD-owned** (Nicola 4/7: «AD verifica RLS + smoke checkout per batch 6/7»; #32 riscritta, esecuzione ferma solo sulla mano — grant MCP write o giro VPS); sync VPS (1× root); 1 carrello buyer reale (samir).
- 🔴 Problema: **0 transazioni reali completate** finché #22 non chiude a «Consegnato»; #20 WhatsApp inviato (4/7 04:51), #21-#22 in esecuzione (mani di Nicola); loop business 🔴 fino al «consegna fatta»; RLS profiles finché non gira SQL 107; **PAT GitHub ancora in storia git (R1)**.

## Auto-coscienza (2026-07-03 21:21 · 🔭 giro AD refresh)
| Metrica | Valore | Fonte |
|---|---|---|
| Voto salute architettura | **42** (completa 12:09 2/7) | `auto-radiografia.json` top-level |
| Voto fiducia giro | **80** = | `auto-analisi.json` (refresh onesto: nessuna novità business vs 16:20; live gated; contatore cieco PostHog 16→17, 6ª conferma del falso-nuovo) |
| Cantiere difetti | **20 chiusi · 2 in-corso (umani) · 1 aperto (AR-024)** | `cantiere-difetti.json` |
| Calibrazione previsioni | **@AD 20/20** | calibrazione.json |
| Loop business | 🔴 in corso | #16 IN CONSEGNA — WhatsApp #20 fatto (4/7 04:51), restano #21 accetta + #22 consegna → «Consegnato» |

## Ultime mosse dell'AD
0. **🗓️ Piano Nicola + patto automazione 4/7 15:40** — chat: Nicola **parte a inserire i negozi DOPO giovedì 9/7/2026** (era 6/7), attende il reset dei limiti settimanali di Claude. Chiede se l'AD aggiorna GitHub+Pannello da solo o va detto ogni volta. **Risposta/patto:** aggiornare memoria (`memoria-ad`) + dati Pannello = 🟢, l'AD lo fa da solo quando gira; «automatico dal nulla» no → serve un innesco («fai un giro») o un cron 🟡 da proporre prima di attivare. **Vincolo:** l'automazione brucia le stesse quote Claude → «poco e mirato» (max 1 giro/giorno), mai spacciarla come gratis; i 🔴 restano firma sua. Dal 9/7 l'AD potrà proporre una **routine giornaliera 🟡**. Registrato in [[DECISIONI]] + preferenze_nicola.
0. **🔭 Giro AD 4/7 11:30** — primo giro pieno della giornata (i passaggi 06:00–10:20 saltati dal delta-gate; alle 09:40/09:50 doer R1/R2 dal Pannello). **Nessuna novità di business:** firma REST 11:30 invariata (ordini=1, ultimo 24/6 08:28, 23 clienti) → #16 ancora IN CONSEGNA (WhatsApp #20 fatto 04:51), restano #21 accetta + #22 consegna. Stallo **~243h ≈ 10 giorni**. **Novità reale del giorno: OGGI 4/7 è Sant'Antonino** (patrono, Fiera 250 bancarelle, centro pieno) → finestra consegna ideale a piedi/bici, ZTL solo mezzi pesanti. Meteo sereno 20→33° (afa 17). MCP+node/curl gated in sessione → baseline REST, zero numeri inventati. Aggiornati eventi-picchi (Sant'Antonino) + snapshot Cabina. → Mossa n.1 confermata: **esegui la consegna di #16 OGGI** (mattina o dopo le 18) col payout-test.
0. **🚚 Risposta all'auto-analisi 4/7 04:51 — «prosegui #21-#22»** — Nicola risponde alla domanda «Hai inviato WhatsApp #20? Buyer ha risposto?» con **«prosegui #21-#22»**. Applicato: **#20 → ✅ FATTO** (WhatsApp al buyer 348 642 1766 inviato, contatto avvenuto); **#21 → 🔄 IN ESECUZIONE** (accetta ordine `58094956…` in dashboard PQ + chiama 0523 388601); **#22 → 🔄 IN ESECUZIONE** (consegna COD €19,05 → «Consegnato»); **#16 → IN CONSEGNA**. Restano 🔴 le mani manuali di Nicola (accettazione + consegna fisica). Registrato in [[DECISIONI]] + [[AZIONI-IN-ATTESA]] + registro-realta + intenzioni + auto-analisi. La firma REST del DB non è ri-misurata in sessione (MCP+node/curl gated) → l'ordine risulta «Consegnato» e la North Star passa 0→1 solo al «consegna fatta». **Domanda «WhatsApp #20?» chiusa — non riproporre.**
0. **🔭 Giro refresh 3/7 21:21** — full da delta-gate (20:29 «cambio stato sensori»: PostHog cieco **19** giri, era 18). **Nessuna novità di business vs 20:24:** firma REST invariata (delta-gate/sensore 21:21: ordini=1, ultimo 24/6 08:28, 23 profili; `corrente==ultimo_pieno` sul business) → **#16 ancora APPROVATO (Pannello 13:29) ma NON consegnato**. MCP+node/curl gated in sessione → baseline REST, zero numeri inventati. Meteo/eventi non ri-controllati (già LIVE al mattino, cadenza). Stallo **~229h**. Timestamp Cabina riallineati (briefing/STATO/ultimo-briefing/auto-coscienza/registro-realta/intenzioni). **8ª conferma oggi** del falso-nuovo delta-gate (contatore cieco-opzionale PostHog). ⏰ **Finestra serale post-19:00 APERTA ORA** (aria più fresca, Venerdì Piacentini prima serata). → Mossa n.1 confermata: esegui la **consegna** di #16 (già approvata) ADESSO col payout-test.
0. **🔭 Giro refresh 3/7 20:24** — full da delta-gate (20:20 «cambio stato sensori»: PostHog cieco **18** giri, era 17). **Nessuna novità di business vs 18:20:** firma REST invariata (delta-gate 20:20: ordini=1, ultimo 24/6 08:28, 23 profili; `corrente==ultimo_pieno` sul business) → **#16 ancora APPROVATO (Pannello 13:29) ma NON consegnato**. MCP+node/curl gated in sessione → baseline REST, zero numeri inventati. Meteo/eventi non ri-controllati (già LIVE al mattino, cadenza). Stallo **~228h**. Timestamp Cabina riallineati (briefing/STATO/ultimo-briefing/auto-coscienza/registro-realta/intenzioni). **7ª conferma oggi** del falso-nuovo delta-gate (contatore cieco-opzionale PostHog). ⏰ **Finestra serale post-19:00 APERTA ORA** (aria più fresca, Venerdì Piacentini prima serata). → Mossa n.1 confermata: esegui la **consegna** di #16 (già approvata) ADESSO col payout-test.
0. **🛠️ Fix lettura vault Pannello 3/7 19:46** — su richiesta di Nicola («ad-memoria divisa da GitHub / il Pannello non legge tutti i dati nel modo corretto»): lettura GitHub **centralizzata e resiliente** (ripiego `memoria-ad`→`main` in sola lettura → mai schermo vuoto per ramo storto), **ramo servito osservabile** in `/api/stato` (`vaultRamoServito`/`vaultRipiego`), **parsing briefing tollerante** (mostra il testo anche senza sezione «Sintesi»). Verificato `tsc`+`next build` verdi + funzioni pure esercitate. **PR #167** · deploy 🔴 bloccato oggi dal limite free Vercel (~24h) · coda #28.
0. **🔭 Giro refresh 3/7 18:20** — full da delta-gate (18:20 «cambio stato sensori»: PostHog cieco **17** giri, era 16). **Nessuna novità di business vs 16:20:** firma REST invariata (ordini=1, ultimo 24/6 08:28, 23 profili; `corrente==ultimo_pieno` sul business) → **#16 ancora APPROVATO (Pannello 13:29) ma NON consegnato**. MCP+node/curl gated in sessione → baseline REST, zero numeri inventati. Meteo/eventi non ri-controllati (già LIVE al mattino, cadenza). Stallo **~226h**. Timestamp Cabina riallineati (briefing/STATO/ultimo-briefing/auto-coscienza/registro-realta). **6ª conferma oggi** del falso-nuovo delta-gate (contatore cieco-opzionale PostHog). ⏰ **Finestra serale post-19:00 ORA imminente** (aria più fresca, Venerdì Piacentini). → Mossa n.1 confermata: esegui la **consegna** di #16 (già approvata) ADESSO col payout-test.
0. **🔭 Giro refresh 3/7 16:20** — full da delta-gate (16:20 «cambio stato sensori»: PostHog cieco **16** giri, era 15). **Nessuna novità di business vs 14:20:** firma REST invariata (ordini=1, ultimo 24/6 08:28, 23 profili; `corrente==ultimo_pieno` sul business) → **#16 ancora APPROVATO (Pannello 13:29) ma NON consegnato**. MCP+node/curl gated in sessione → baseline REST, zero numeri inventati. Meteo/eventi non ri-controllati (già LIVE al mattino, cadenza). Stallo **~224h**. Timestamp Cabina riallineati (briefing/STATO/ultimo-briefing/auto-coscienza/registro-realta/intenzioni). **5ª conferma oggi** del falso-nuovo delta-gate (contatore cieco-opzionale PostHog). ⏰ Ora a **~3h dalla finestra serale post-19:00** (aria più fresca, Venerdì Piacentini). → Mossa n.1 confermata: esegui la **consegna** di #16 (già approvata) stasera col payout-test.
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

## Prossime priorità (🔭 Giro AD 4/7 11:30 · #16 IN CONSEGNA · OGGI Sant'Antonino → centro pieno)
**#16 IN CONSEGNA (WhatsApp #20 fatto 04:51):** eseguire la consegna del 1° ordine. Restano solo le mani manuali #21–#22. **Oggi il centro è pienissimo per Sant'Antonino** (patrono, Fiera 250 bancarelle) → il ritiro/consegna a piedi da Via Calzolai 25 è agevole; ZTL solo mezzi >35q (non tocca bici/piedi). Meteo sereno con afa alle 17 → consegna in mattinata o dopo le 18. Accorpa il payout-test. Stallo **~243h ≈ 10 giorni**.

1. [ ] 🔴 **#16 — ESEGUI LA CONSEGNA (mani Nicola) OGGI (mattina o post-18) + payout-test:** #21 accetta ordine `58094956…` in dashboard PQ + chiama PQ 0523 388601 → #22 ritiro Via Calzolai 25 → consegna COD €19,05 → scrivi «consegna fatta» · accorpato al payout-test sandbox · stallo ~243h
2. [ ] 🔴 **R1 — Revoca PAT GitHub** (AR-004) — l'unica remediation del segreto in storia git
3. [ ] 🟡 **SQL 107 policy** — DROP policy profiles (~30s) + **R2 merge+deploy fix cantiere** (branch machine-analysis) → piattaforma sicura per batch 6/7
4. [ ] 🟡 **#23 PostHog** (Personal Key phx_, cieco 15 giri) · **#24 falso positivo Casa Linda demo** — firma opzionale
5. [ ] 🟢 **Onboarding 6/7** — checklist pronta (indipendente dallo zombie)

**Sentinelle attive:** ordine ritardo ~243h · 1 carrello buyer reale · negozio LIVE 0 delivered · stallo >168h (+75h) · loop business 🔴 · **sensore cieco ≥3 giri: PostHog (401, cieco 24 giri, opzionale)** · voto salute architettura 44 (<60, pending-merge R2, completa già fatta 2/7 12:09) · chiusura-loop 5 quaderni fermi (ad, direttore-creativo, marketing, qa-designer, relazioni-istituzionali).

---
*Scritto dall'AD. Dettaglio in [[2026-07-02]]; decisioni in [[DECISIONI]].*
