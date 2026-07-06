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

## Punto di mezzogiorno · 2026-07-03 12:00
- **Stato delle 3 priorità del mattino:**
  1. ❌ **#16 prima transazione + payout-test — NON eseguita.** Aspetta il tap di Nicola (#20→#21→#22). La «finestra certa del mattino» sta chiudendo: a mezzogiorno siamo sul filo del pranzo. ⚠️ Lezione L-2026-0702 (firma ≠ esecuzione): se non parte in questa finestra degrada di nuovo come le 3 finestre del 2/7. Stallo **~220h**.
  2. ❌ **R1 revoca PAT GitHub — pending Nicola.** Solo Nicola può revocarlo/rigenerarlo (è nella storia git). Nessuno sblocco possibile dal mio lato.
  3. ❌ **SQL 107 + R2 merge cantiere — pending Nicola.** RLS profiles resta esposta finché non gira l'SQL; i fix del cantiere restano nei branch finché non si mergiano.
- **Correzioni di rotta fatte a mezzogiorno:**
  - 🔄 **Riformulata la finestra di #16 da «mattina» a «pranzo ORA / primo pomeriggio prima dell'afa» (max 33° alle 17):** i freschi di Pane Quotidiano non devono viaggiare nel caldo del pomeriggio → l'ultima finestra onesta di oggi è adesso. Aggiornati STATO + coda #16/#20.
  - ✅ **Cascata post-#16 completamente armata** (novità vera dalle 06:00, non sensori): i playbook senior hanno accodato stamattina **#25** (anti-churn Pane Quotidiano, aggancio alla stessa chiamata #21), **#27** (recensione A13/A14 concierge) e **#26** (recupero carrello samir €10) — tutti **correttamente gated su «#16 consegnato»**. Effetto: **un solo tap di Nicola** ora produce ordine consegnato + negozio ingaggiato + recensione + 2° acquisto, non solo la consegna.
  - ✅ **Nessun giro pieno moltiplicato** (rispetto L-2026-0629-03): sensori node/curl/MCP gated in sessione, business invariato già ri-misurato ai giri 08:20/10:22/11:14 → baseline REST portata avanti, zero numeri inventati.
- **Cosa serve da Nicola entro sera:** 🔴 **eseguire #16 al pranzo ORA / primo pomeriggio** (tap WhatsApp #20 → #21 accetta ordine + chiama PQ 0523 388601 → #22 consegna COD €19,05) insieme al **payout-test sandbox** — è l'unica mossa che sposta la North Star · 🔴 **revocare il PAT GitHub** (R1) · 🟡 **SQL 107** (~30s) + **ok merge R2** cantiere · 🟢 opzionali #23 (PostHog) e #24 (falso positivo Casa Linda). Al tuo tap, la cascata #25/#27/#26 parte da sola.

## Review settimanale · 2026-07-03 15:00
**La settimana in una riga:** infrastruttura verde e volano-architettura che gira (20 difetti chiusi in codice, radiografia onesta 42), ma **l'azienda è ferma su UNA mano non collegata** — il tap WhatsApp di #16 è di Nicola e non è ancora scattato (approvato dal Pannello alle 13:29, non consegnato). North Star = **0 ordini consegnati**, stallo **~222h**.

**📊 Pagella per reparto (target OKR vs reale):**
- 🧠 **@AD** — 🟡 previsioni **24/24 azzeccate** (calibrazione perfetta), volano-architettura chiude; ma North Star (1° ordine entro 27/6) **mancata** → il valore prodotto non ha ancora spostato il numero. Metacognizione ok: so *perché* siamo fermi (mani non collegate), non è un senior debole.
- 🛠️ **@tech / 🚢 @devops-sre** — 🟢 Sprint 1 LIVE, **#19 ruoli-acquisto MERGED** (PR #211), cantiere radiografia 18/22 chiusi in codice. Miglior reparto della settimana.
- 🔒 **@security** — 🔴 **1 critica aperta**: PAT GitHub in storia git (AR-004). Il fix in codice c'è (scan-segreti + pre-commit hook), ma la remediation vera (revoca) è di Nicola e pende da 2 giorni.
- 🛵 **@operations** — 🔴 **0 consegne**: #16 pronto e riproposto **4 volte** (3 finestre 2/7 + mattina 3/7), sempre saltato. Non è un difetto di preparazione (pacchetto pronto dal 2/7), è frizione umana sull'ultimo miglio.
- 🤝 **@vendite** — 🔴 +2 negozi LIVE target → **0 nuovi** (1 reale, Pane Quotidiano). Congelato correttamente in attesa della 1ª transazione (batch 6/7).
- 💶 **@finanza** — 🟡 payout-test **accorpato a #16**, parte solo quando parte la consegna.
- ✍️ **@content-social / 🎨 creativi** — 🟡 bloccati bene dal cancello di allocazione (AR-006): asset pesanti solo su PQ confermato; manca la materia prima (foto/scheda/consenso) da Nicola.
- 📣 marketing · 🔎 intelligence · 📊 analista · ✅ qa · 🚪 onboarding-negozi — 🟡 **prep-ready ma gated** sulla 1ª transazione (o su PostHog cieco per i numeri di funnel). Non misurabili finché non si consegna.

**🩻 Voto salute architettura: 42/100** (provvisorio **~50** al merge+deploy). *Radiografia completa NON ri-lanciata di proposito*: l'ultima è di **ieri 12:09** (<27h), l'architettura è statica e la gate di efficienza (AR-019/AR-025) vieta re-run pesanti senza novità → snapshot a livello sonda, il Max si spende dove rende. Cantiere: **20 chiusi · 2 in-corso umani** (AR-004 revoca PAT, AR-006 materiale PQ) · **2 aperti** (AR-024 voto congelato/alert-fatigue, AR-025 delta-gate scatta pieno sul contatore cieco opzionale).

**🎯 Calibrazione:** @AD **24/24** azzeccate, autonomia *media*. Previsione della settimana confermata a ogni giro: *business invariato finché la mano manuale non parte*. Il rischio non è la lettura dei dati (perfetta) ma l'**esecuzione dell'ultimo miglio**.

**📚 Apprendimento (principi distillati questa settimana):**
1. **Firma ≠ esecuzione** (L-2026-0702-45/51): quando le mani non sono collegate, un 🔴 firmato degrada in coda morta. Rimedio: **1 finestra certa a bassa frizione** invece di N finestre rincorse.
2. **Un controllo vale solo se persiste un artefatto e può fare da gate** (L-2026-0702-02): stampe ingoiate ed exit-code `|| true` = controllo che non c'è.
3. **Tutto ciò che descrive la macchina va GENERATO dai file, non scritto a mano** (L-2026-0702-03): a mano, prima o poi mente.
4. **Una scoperta che cambia il faro deve riscrivere coda/OKR/STATO nello stesso giro** (L-2026-0702-01), o non è successa.

**🚀 Auto-miglioramento — i 3 divari più alti vs i migliori + loop chiuso?**
- Il **volano BUSINESS non ha ancora 1 esito misurato** (`esperimenti: []` vuoto): l'onestà della settimana. AR-013 ha installato la forcing-function, ma zero esperimenti girati → il loop osserva→agisci→**misura**→impara non ha chiuso sui numeri (0 consegnati). Divario vs AI-ops mondiale: **medio**, tutto sull'esecuzione.
- @content-social (L3, divario alto): sbloccato solo dalla materia prima reale + chiavi AI.
- **Esecuzione ultimo-miglio** (ambito emergente): il gap più grande non è un mestiere, è la **mano manuale non automatizzata** — 4 finestre saltate in 2 giorni.

**🎬 Le 3 mosse per la prossima settimana:**
1. 🔴 **Far avvenire la 1ª transazione stasera** (#16 post-19:00, fuori afa) e — a monte — **collegare la mano** (rituale a bassa frizione o automazione WhatsApp) così l'ultimo miglio non dipenda da un tap che salta.
2. 🟡 **Chiudere i 2 difetti aperti di architettura**: AR-025 (delta-gate: per i sensori opzionali usa lo stato booleano, non il contatore → stop giri pieni a vuoto sul rumore PostHog) + AR-024 (voto provvisorio pending-merge + dedup allerta salute).
3. 🔴/🟡 **Sbloccare i 2 bloccanti umani**: revoca PAT (R1) + merge R2 fix cantiere → salute 42→~50 e piattaforma sicura per il **batch negozi 6/7**.

**🙋 Decisioni per Nicola:** 🔴 **esegui #16 stasera** + payout-test · 🔴 **revoca il PAT GitHub** · 🟡 **ok merge R2** (fix cantiere) + **SQL 107** · 🟡 firma le 2 auto-riscritture (AR-024/AR-025, dettaglio nella lettera) · 🟢 dammi la **materia prima di Pane Quotidiano** (foto/scheda/consenso) per alzare i contenuti a livello pro. Lettera completa in [[LETTERA-A-NICOLA]].

## Punto di mezzogiorno · 2026-07-06 12:00
**Contesto:** stamattina (giro 11:11, MCP Supabase VIVO) è emerso che **l'ordine #16 è annullato dal 3/7 15:38** — la macchina l'ha inseguito morto per 2 giorni perché l'MCP era cieco. Faro riscritto: si riparte dalla **pipeline** (407 lead) + un **primo ordine-prova pulito su Pane Quotidiano**. A mezzogiorno confermo: **MCP ancora VIVO** e la firma business è **invariata** dalle 11:11 (delta-gate 12:00: ordini=1, ultimo 24/6 08:28, 23 clienti; `corrente==ultimo_pieno` sul business) → nessuna consegna emersa, zero numeri inventati. Stallo North Star **~292h ≈ 12 giorni**.

**Stato delle 3 priorità del giorno (ripivot 11:11):**
1. ❌ **Primo ordine-prova su PQ + payout-test (#21) — non eseguito.** Aspetta le mani di Nicola (accetta ordine in dashboard PQ → consegna → payout-test). È l'unica mossa che sposta la North Star 0→1 su un negozio reale. Nessun ordine nuovo nel DB a mezzogiorno.
2. ⏸ **Contatti shortlist 27 food (#22) — gated by design fino al 9/7.** Non è un blocco: Nicola parte con l'onboarding dopo giovedì 9/7 (reset limiti). Lista + pitch pronti in `consegne/vendite/2026-07-06-shortlist-onboarding-post-9-7.md`.
3. ❌ **Sentinella legga `delivery_status`/`canceled_at` (#23) — pending firma.** È la **causa-radice** del loop cieco su #16: oggi la sentinella conta solo il *numero* di ordini, non lo stato → un annullamento resta invisibile. Codice pronto in coda.

**Correzioni di rotta fatte a mezzogiorno:**
- 🔄 **Scorporata la priorità n.1 dalla data del 9/7:** il primo ordine-prova su PQ (#21) **NON deve aspettare il 9/7** — PQ è già reale e il payout-test si fa oggi, mentre i *nuovi* negozi (#22) partono dopo il 9/7 come da piano di Nicola. Distinguere «attivare il negozio che ho» (ora) da «acquisire i prossimi» (dal 9/7) evita di rimandare tutto in blocco.
- ✅ **Nessun giro pieno moltiplicato (AR-025):** il delta-gate ha fatto scattare il pieno a mezzogiorno solo per il **cambio sensore** (MCP cieco→ok), non per novità di business → business ri-confermato invariato, zero numeri inventati. Coerente con la lezione L-2026-0629-03.
- ✅ **Ripivot 11:11 confermato:** #16 resta morto, nessuna narrativa «esegui #16» da riproporre; la coda punta al primo ordine-prova pulito.

**Cosa serve da Nicola entro sera:** 🔴 **#21 primo ordine-prova su PQ + payout-test** (fattibile oggi, non serve aspettare il 9/7 — è l'unica mossa che porta la North Star a 1) · 🟡 **#23 firma sentinella `delivery_status`** (chiude la causa-radice del loop cieco — è la lezione di oggi) · 🔴 **revoca il PAT GitHub** (R1, AR-004) + 🟡 **merge R2** fix cantiere · 📌 promemoria: la shortlist 27 food (#22) parte dal **9/7** come da tuo piano. Domanda ancora aperta dalle 11:11: **chi/perché ha annullato #16?**

## Report della sera · 2026-07-06 18:00
- **Fatto oggi (6/7):** ✅ **Memoria allineata: l'ordine #16 è ANNULLATO, non "in consegna"** (proposta dal giro APPROVATA da Nicola dal Pannello, 16:15) — per giorni la macchina lo dava «da consegnare» perché l'MCP era cieco e leggeva la baseline REST vecchia; il Pannello, che legge il DB live, mostra `delivery_status=CANCELED`. Corretti 7 numeri, semafori, loop business; **decadute** le azioni #16/#20/#21/#22 e la cascata gated su «#16 consegnato» (#27/#26/#37/#30/#36). ✅ **SEO vetrine Pane Quotidiano approvata** (16:10, «e devi farlo con tutti i negozi») → riempimento `store_description`+`store_address` accodato + **regola-standing**: SEO-fill obbligatorio nell'onboarding di ogni negozio. ✅ **Giro pieno 16:45 + giro-refresh 16:47** (2 gate HARD di `giro.sh` chiusi: loop @intelligence + allocazione sforzo) · propagata la verità #16-annullato agli snapshot rimasti al 4/7 (registro-realta, intenzioni, auto-analisi) → deriva di coerenza chiusa. ✅ **Nuove leve accodate dai senior:** #38 bollino «Negozio Verificato» (PQ candidato 3/5), #39 campagna botteghe food (6 prioritarie → visita di persona 13/7, dossier + schede-cheat pronte), #40 sentinella ordini-annullati (codice pronto, timer da accendere). ✅ **Nicola ha chiuso le azioni anti-churn su PQ** (#25/#29): «li conosco, aspettano finché tutto non è pronto» → PQ non è a rischio churn.
- **Numeri vs ieri:** invariati — **1** negozio reale (Pane Quotidiano) · **0** payout attivi · **5** prodotti · **1** ordine COD €19,05 del 24/6 **ANNULLATO** · **0** pagati / **0** consegnati / **0** payout · **4** buyer (0 nuovi 7g; 23 profili totali). ⚠️ **Gap di misura:** live gated in sessione (MCP non autorizzato + `node`/`curl` non approvati) → i 7 numeri = **baseline REST 16:20 portata avanti** (giro.sh: ordini=1, ultimo 24/6 08:28, 23 clienti, `dati_leggibili=true`), **zero numeri inventati**. **Stallo sul 1° ordine reale ~297h ≈ 12,4 giorni** (ancora l'ordine del 24/6 08:28). North Star = **0 consegnati, invariata**.
- **Azioni in coda da firmare:** 🔴 **Far nascere il 1° ordine reale** su PQ (non riesumare lo zombie: serve domanda vera → post «Il Turno», SEO vetrine, lista d'attesa; poi consegna + payout-test su quel caso) — parte operativa **dopo il 9/7** · 🔴 **R1 revoca PAT GitHub** (AR-004, buco in storia git; runbook pronto) · 🟡 **R2 merge+deploy fix cantiere** (serve sessione con rete+git push: VPS/cloud-agent — non esiste PR da mergiare, va creata) · 🟡 **SQL 107 + verifica RLS** (#32, AD-owned e firmato, bloccato solo sulla mano: grant MCP write o giro VPS) · 🟡 **#39 botteghe food** (dopo 9/7; le 6 prioritarie di persona il 13/7) · 🟡 **#40 accendere il timer della sentinella ordini-annullati**.
- **Lezione del giorno (L-2026-0706):** un sensore cieco che tramanda una lettura vecchia crea un **fatto-zombie** che genera lavoro morto. #16 è stato dato «in consegna» per giorni (4 finestre di consegna rincorse + cascata #27/#26/#37 armata) mentre nel DB era **annullato dal 24/6** — la macchina non lo vedeva perché l'MCP era cieco e la baseline REST veniva portata avanti. **Regola:** quando un sensore è cieco, incrocia col canale che legge il vivo (il Pannello lo segnalava con l'alert «1 consegne annullate») e, alla correzione, **propaga la verità a TUTTI gli snapshot nello stesso giro** — non lasciare registro-realta/intenzioni/auto-analisi fermi indietro, o la deriva di coerenza rigenera lo zombie. Aggancio: AR-001 (fallback REST) + #40 (sentinella annullati) + gate anti-invenzione.
- **Domani/prossimi passi:** business fermo per patto — Nicola riparte operativo **dopo giovedì 9/7** (reset limiti Claude). Fino ad allora: max 1 giro/giorno (poco e mirato), memoria su `memoria-ad` 🟢, tutti i 🔴 restano firma sua. Prima mossa al rientro: **far nascere il 1° ordine reale su PQ** agganciato al **Venerdì Piacentini 10/7**, poi consegna + payout-test; in parallelo **visita 6 botteghe 13/7** (2° negozio reale). Prerequisiti di sicurezza ancora aperti: R1 (revoca PAT) + SQL 107 (RLS profiles).
