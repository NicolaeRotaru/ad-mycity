---
tipo: ritmo
fonte: AD digitale
nota: "Il battito quotidiano. L'AD aggiunge in fondo un blocco per ogni cadenza. Metti SEMPRE data E ora. Formato: '## Piano del mattino · AAAA-MM-GG HH:MM' o '## Report della sera · AAAA-MM-GG HH:MM', poi righe '- ...'. Il pannello mostra l'ultimo di ciascuno."
---

# 🕗 Ritmo del giorno

## Piano del mattino · 2026-06-26 08:00
- Priorità n°1: portare la bottega Garetti al primo go-live (vetrina + payout-test).
- Marketing: pubblicare il primo post + aprire la lista d'attesa.
- Sentinelle da tenere d'occhio: carrelli abbandonati e recensioni.
- Cosa serve da Nicola: confermare Stripe live/sandbox.

## Report della sera · 2026-06-26 20:00
- Fatto: pannello operativo (azioni pronte + mani email + sentinelle).
- In coda: collegare marketplace e Resend per accendere i dati veri.
- Domani: primo contatto operativo con Garetti.

## Piano del mattino · 2026-06-28 16:46
- Priorità n°1: **far avvenire la prima transazione end-to-end** (ordine→pagato→consegnato→payout) con **Casa Linda**, l'unico negozio payout-ready. Stop all'attesa di Garetti.
- Priorità n°2: **sbloccare l'ordine zombie** da €19,05 (fermo su PENDING da 4 giorni): accettarlo o annullarlo con nota al buyer.
- Priorità n°3: **riaccendere le vendite** — primi 10 dei 407 lead `to_contact`.
- Sentinelle da tenere d'occhio: 🔴 marketplace silente (0 ordini/eventi da 96h), 🟡 catalogo finto (0 prodotti veri), 🟡 4 carrelli abbandonati.
- Cosa serve da Nicola: ① chiarire dove scrive la memoria (DB separato o stesso del marketplace); ② via libera su Casa Linda; ③ firmare le 3 decisioni di lancio.

## Report della sera · 2026-06-28 16:46
- Fatto: **database ricollegato** dopo il pagamento abbonamento → riverificati i 7 numeri sul vivo (primi dati freschi dal 24/6). Eseguite le 4 cadenze in un colpo (giro + mattino + sera + review settimanale).
- Numeri vs baseline 24/6: tutto fermo (2 negozi approvati / 1 payout / 0 prodotti veri / 1 ordine zombie / 0 pagati / 0 consegnati / 4 clienti). **4 giorni di silenzio totale.**
- In coda da firmare: prima transazione Casa Linda 🔴, sblocco ordine €19,05 🔴, 3 decisioni di lancio 🔴.
- Lezione del giorno: i sensori che cadono nascondono lo stallo. Appena tornati i dati, la verità era netta: il collo di bottiglia non è più tecnico, è **mettere in moto la prima vendita vera**.

## Piano del mattino · 2026-07-01 11:18
- **Priorità n°1:** eseguire **#16 Scelta A** — ordine zombie €19,05 Pane Quotidiano (Nicola ha firmato A 11:05): WhatsApp buyer 348 642 1766 + accetta dashboard + consegna COD → **1° ordine reale**.
- **Priorità n°2:** **Deploy Sprint 1** in prod (PR #209+#210 mergiate su `mycity/main`) — migrazione `107` + smoke test checkout/fee/RLS/COD → prerequisito batch negozi **6/7**.
- **Priorità n°3:** **Onboarding negozi 6/7** — Nicola inserisce botteghe; @onboarding-negozi presidia checklist catalogo/payout/foto.
- **Sentinelle:** ordine in ritardo (in esecuzione) · 4 carrelli >4h · negozio LIVE 0 pagati · stallo >168h superato · temporali pomeriggio.
- **Assegnazioni chiave:** @operations+#16 🔴 · @tech deploy Sprint 1 🟡/🔴 · @onboarding-negozi checklist 🟢 · @customer-success feedback post-consegna 🟢 · @analista snapshot fine giornata 🟢.
- **Cosa serve da Nicola:** 🔴 **data/ora consegna** per WhatsApp #16 · 🔴 **`ok deploy Sprint 1`** · 🔴 **`ok 16`** · 🟡 sync VPS · 🟢 inserimento negozi 6/7.

## Piano del mattino · 2026-07-02 07:51
- **Priorità n°1:** **Eseguire #16 Scelta A** — ordine zombie €19,05 Pane Quotidiano (firmato 1/7 11:05): ripiano **2/7 mattina** WhatsApp buyer 348 642 1766 + accetta dashboard + consegna COD entro pranzo → **North Star: 1° ordine consegnato**.
- **Priorità n°2:** **Deploy #19 fix ruoli acquisto** — admin bloccato + seller solo via «Vai al marketplace» (branch `fix/ruoli-acquisto-admin-seller-2026-07-02` pronto) → CRM pulito (1 solo carrello buyer reale).
- **Priorità n°3:** **SQL 107 policy** (~30s Supabase) + **presidio onboarding 6/7** — piattaforma sicura e pronta per batch negozi dopo la prima transazione.
- **Sentinelle:** ordine in ritardo · 1 carrello buyer reale (samir €10, 3 interni SKIP) · negozio LIVE 0 pagati · stallo **>177h** (+9,8h oltre 168h) · loop business 🔴 (0 consegnati, ~20 azioni ok/0 inviate).
- **Assegnazioni:** @operations+#16 🔴 · @tech deploy #19 🔴 · @qa smoke post-deploy 🟢 · @customer-success feedback post-consegna 🟢 · @crm-lifecycle samir post-#19 🟢 · @onboarding-negozi checklist 6/7 🟢 · @devops-sre root sync #17 🟡 · @finanza payout-test **03/7 mattina** 🔴 · @analista snapshot fine giornata 🟢.
- **Cosa serve da Nicola:** 🔴 **`ok 16`** (consegna mattina/pranzo) · 🔴 **`ok merge fix ruoli-acquisto`** · 🟡 **SQL 107** (30s) · 🟡 **Console Hetzner root** (1× `install-sync-vps.sh`, già ok 17) · 🟢 inserimento negozi 6/7 (nessuna approvazione).

## Piano del mattino · 2026-07-02 08:36
- **Priorità n°1:** **Eseguire #16 Scelta A** — ordine zombie €19,05 Pane Quotidiano (firmato 1/7 11:05): WhatsApp buyer 348 642 1766 + accetta dashboard + consegna COD **oggi pranzo** (meteo sereno 20–31°C · escalation v12) → **North Star: 1° ordine consegnato**.
- **Priorità n°2:** **Deploy #19 fix ruoli acquisto** — admin bloccato + seller solo via «Vai al marketplace»; merge `mycity/main` → Render auto (no token Render; serve #14+#15 PAT o chat **`ok merge fix ruoli-acquisto`**).
- **Priorità n°3:** **SQL 107 policy** (~30s Supabase) + **presidio onboarding 6/7** — RLS pulita e checklist pronta dopo la prima transazione.
- **Sentinelle scattate:** ordine in ritardo **189,9h** · carrello >4h (1 buyer reale samir €10 — CRM post-#19) · negozio LIVE 0 consegnati · stallo **+21,9h oltre 168h** · loop business 🔴 (0 consegnati).
- **Assegnazioni:** @operations+#16 🔴 · @tech merge #19 🔴 · @qa smoke post-deploy 🟢 · @customer-success feedback post-consegna 🟢 · @crm-lifecycle samir post-#19 🟢 · @onboarding-negozi checklist 6/7 🟢 · @devops-sre root sync #17 🟡 · @finanza payout-test **03/7 mattina** 🔴 · @analista snapshot fine giornata 🟢.
- **Cosa serve da Nicola:** 🔴 **`ok 16`** (pranzo) · 🔴 **`ok merge fix ruoli-acquisto`** · 🟡 **SQL 107** (30s) · 🟡 **Console Hetzner root** (1× install sync, ok 17) · 🟢 batch negozi 6/7 (dopo #16+#19+SQL).

## Report della sera · 2026-07-02 18:00
- **Fatto oggi:** ✅ **#19 fix ruoli acquisto MERGED** (PR #211 `f84fc70` → Render LIVE ~08:45; smoke @qa da chiudere) · ✅ **cantiere radiografia macchina** (Cloud Agent 10:15: 18/22 difetti chiusi, PR #138 → main, voto salute architettura **42→80 ▲**) · ✅ **decisione binaria #16 risolta 17:09** → Nicola sceglie **A = ESEGUI** (non «archivia zombie»), slot spostato a **cena 19–21** · 5 giri AD nel giorno (08:20 · 10:19 · 16:53 · 17:01 · 17:21).
- **Numeri vs ieri:** invariati — **1** negozio reale (Pane Quotidiano) · **0** payout attivi · **5** prodotti · **1** ordine COD €19,05 mai consegnato · **0** pagati / **0** consegnati / **0** payout · **4** buyer (0 nuovi 7g). ⚠️ **Gap di misura:** live gated (MCP non autorizzato + node non approvato) → i 7 numeri = **baseline REST 10:19 portata avanti**, nessun numero inventato. **Stallo ~201,5h** (ancora ordine 24/6 08:28; +~9h vs ieri sera 20:18 a 177,8h).
- **Azioni in coda da firmare:** 🔴 **#16 STASERA** — tap link WhatsApp #20 (cena 19–21) → #21 accetta ordine + chiama PQ 0523 388601 → #22 consegna COD €19,05 → scrivi «consegna fatta» · 🔴 **R1 revoca PAT GitHub** (AR-004, buco in storia git) · 🟡 **R2 merge+deploy fix cantiere** (branch machine-analysis) · 🟡 **SQL 107** DROP policy (~30s) · 🟡 **Console Hetzner root** (#17 sync VPS automatico).
- **Lezione del giorno (L-2026-0702):** una firma non è un'esecuzione. `ok 16` firmato alle **08:38** è rimasto fermo tutto il giorno perché la «mano» reale (tap WhatsApp) è di Nicola e non è scattata → pranzo perso, poi decisione binaria a fine giornata. **Regola:** un'azione 🔴 firmata va eseguita/ricordata nella STESSA finestra, o degrada in coda morta. Il vero collo di bottiglia non sono i sensori ma le **mani non collegate** (WhatsApp/consegna manuali). Aggancio: AR-019 (delta-gate) + automazione mani.
- **Domani (3/7):** payout-test Stripe sandbox (mattina, programmato) · se #16 consegnato → concierge A13/A14 + prima recensione · onboarding batch 6/7 (checklist pronta).

## Piano del mattino · 2026-07-03 06:00
- **Contesto:** oggi è **Venerdì Piacentini** (centro pieno stasera) e il **meteo è favorevole** (sereno, 19–32°C) → finestra di consegna comoda. È **la finestra certa**: le 3 finestre del 2/7 (pranzo/pomeriggio/cena) sono state saltate. Stallo sul primo ordine **~213h** (ancora l'ordine del 24/6 08:28). I 7 numeri sono la baseline REST invariata (live gated in sessione — nessun numero inventato).
- **Priorità n°1 — 🔴 PRIMA TRANSAZIONE REALE, stamattina:** eseguire **#16 Scelta A** (firmata 1/7 11:05) accorpandola al **payout-test già in agenda 03/7 mattina** — una sola finestra, due risultati. Passi: tap link WhatsApp **#20** (buyer 348 642 1766, slot mattina) → **#21** accetta ordine `58094956…` in dashboard + chiama Pane Quotidiano 0523 388601 → **#22** consegna COD **€19,05** + «Consegnato» in app → scrivi «consegna fatta». È l'unica mossa che sposta la North Star (1° ordine consegnato).
- **Priorità n°2 — 🔴 Chiudi il buco di sicurezza (R1):** revoca il **PAT GitHub** (AR-004) — il token è già nella storia git, solo Nicola può revocarlo e rigenerarlo (nuovo valore solo nel `.env` del VPS, mai committato). È l'unica remediation che chiude davvero il buco.
- **Priorità n°3 — 🟡 Piattaforma pronta per il batch 6/7:** **SQL 107** (DROP policy profiles, ~30s in Supabase) + **R2 merge+deploy dei fix del cantiere** (branch machine-analysis) → RLS pulita, sensori col gate anti-invenzione e guardiani attivi prima di inserire negozi il 6/7.
- **Assegnazioni (1 mossa per reparto):** @operations+#16 🔴 (pronto, aspetta il tap di Nicola) · @supporto assistenza messaggio buyer + stato ordine 🔴 · @finanza payout-test sandbox accorpato a #16 🔴 · @customer-success script feedback A13/A14 pronto per il post-consegna 🟢 · @security nota remediation R1 pronta 🔴-Nicola · @tech SQL 107 + prep merge cantiere 🟡 · @devops-sre sync VPS post-merge (#17, 1× root) 🟡 · @data-engineer #23 sblocco PostHog (Personal Key phx_) 🟡 · @account-negozi #24 fix falso positivo Casa Linda demo 🟡 · @onboarding-negozi checklist batch 6/7 pronta 🟢 · @intelligence radar VP 3/7 + meteo consegna 🟢 · @analista snapshot KPI baseline pre/post prima transazione 🟢.
- **Cosa serve da Nicola stamattina:** 🔴 **eseguire #16** (tap WhatsApp #20 → #21 → #22) insieme al **payout-test sandbox** · 🔴 **revocare il PAT GitHub** (R1) · 🟡 **SQL 107** (~30s) · 🟡 **ok merge R2** fix cantiere + 1× root sync VPS (#17) · 🟢 firma opzionale #23 (PostHog) e #24 (falso positivo Casa Linda). Tutto il resto è già pronto in coda: al tuo via parte.
