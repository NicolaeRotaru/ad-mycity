# 🚀 PIANO DI CRESCITA & ESPERIMENTI (Growth & Monetizzazione)

> Base dati: [[Metriche & KPI]] (North Star + i 7 numeri + i primi 4 esperimenti), [[Clienti, Personas & Crescita]] (i 5 loop organici), [[Area - Crescita]], [[Finanza & Unit Economics]].
> **Stato reale oggi (25/06/2026):** ~1 negozio, ~0 ordini. Non c'è ancora traffico → **non si "ottimizza la conversione" del nulla.** Questo piano è una **macchina che scala con la crescita**: parte da esperimenti a **costo ~0 e ad alto apprendimento**, e accende le leve di monetizzazione solo quando c'è volume per misurarle.
> **Onestà:** a 0 ordini ogni numero qui è un'**ipotesi da validare**, non un fatto. La disciplina è: 1 metrica di successo dichiarata PRIMA, 1 cosa per volta, baseline → durata → criterio di stop. Si uccidono i perdenti.

> 🔑 **Regola d'oro del growth:** prima **CM/ordine positivo** (batching + minimo + fee), poi **retention al plateau** (≥25% curva piatta), **solo dopo** si acquisisce/scala. Non si scala un secchio bucato.

---

## 1. OBIETTIVO & NORTH STAR

**North Star Metric (NSM):** **Ordini qualificati consegnati / settimana** = a clienti unici, entro la finestra promessa, senza rimborso, con item-fill ≥90%. (Non GMV, non download, non n. negozi.)

**Obiettivo del growth a sostegno della NSM:** trasformare ogni unità di traffico e ogni cliente in **più ordini, scontrino più alto, margine positivo, riacquisto** — al costo più basso possibile.

**Come si misura (i 7 numeri che governano MyCity):**
| # | Numero | Target | A cosa serve nel growth |
|---|---|---|---|
| 1 | NSM (ordini qualificati/sett) | in crescita +10-20%/sett (fase cluster) | il risultato di tutto |
| 2 | Retention coorte | plateau ≥25% (W12) | dice se vale la pena acquisire |
| 3 | % ordini batch | ≥50-60% | abilita il margine (densità) |
| 4 | CM/ordine | > €0 | la leva di monetizzazione n.1 |
| 5 | Item-fill | ≥90% | guardrail invisibile sul riacquisto |
| 6 | WAC × repeat rate | in salita | volume × abitudine |
| 7 | LTV/CAC | ≥3, payback <6 mesi | il via libera allo scaling |

➡️ *Prossima azione:* strumenta il **giorno 1** (5 eventi PostHog + UTM su ogni QR + tabella `orders` con tutti i timestamp). Senza strumentazione nessun esperimento è leggibile. Handoff a **@data-engineer / @builder-automazioni**.

---

## 2. IL BACKLOG DI ESPERIMENTI (priorità ICE)

**ICE = Impatto × Confidenza × Facilità** (1-5 ciascuno; score = media). Prima le leve a **costo ~0** e a **basso traffico richiesto**. Le righe 🔴 toccano prezzi/fee reali → si **propongono e si firmano**, non si attivano da soli.

| # | Ipotesi (se… allora…) | Leva | Metrica di successo | Sforzo | Impatto atteso | Traffico min. | Colore | ICE |
|---|---|---|---|---|---|---|---|---|
| E1 | Se ogni negozio mette **QR cassa + sacchetto + vetrofania univoci**, allora i suoi clienti fedeli fanno il 1° ordine | Loop "negozio come canale" | scan→1° ordine per negozio | Basso | Alto (è IL canale CAC~0) | da subito | 🟡 attiva e avvisa | **4,7** |
| E2 | Se al checkout mostro **soglia "spedizione gratis sopra €X"**, allora l'AOV sale senza erodere CM | Soglia free-shipping | AOV + **CM totale/sett** (arbitro) | Basso (config UI) | Alto | ~30 ordini | 🟡 (logica UI) · 🔴 se cambia la fee reale | **4,3** |
| E3 | Se mando un **nudge 2° ordine** (reminder vs sconto vs nulla), allora più clienti riordinano entro 14gg | Nudge riacquisto | % 2° ordine ≤14gg | Basso | Alto (retention) | ~20 clienti | 🟢 disegno · 🔴 se sconto reale | **4,3** |
| E4 | Se attivo **"Regala una spesa"** (gift), allora il destinatario converte più di un codice sconto | Loop gifting | k-factor del gift, conv. destinatario | Medio (già in prodotto) | Alto (virale) | da subito | 🟢 disegno · 🟡 attiva | **4,0** |
| E5 | Se recupero i **carrelli abbandonati** (email/push a T+1h, T+24h), allora ne riconquisto il 5-15% | Recupero carrelli | % carrelli recuperati | Basso | Alto (~50-61% abbandono al pagamento) | ~50 carrelli | 🟡 attiva · 🔴 se sconto reale | **4,0** |
| E6 | Se testo **ordine minimo €15→20→25**, allora trovo il punto che massimizza CM senza uccidere frequenza | Pricing soglia ordine | **CM totale/sett** (non l'AOV) | Basso | Alto su margine | ~40 ordini | 🔴 cambia regola reale | **3,7** |
| E7 | Se faccio **win-back** di chi salta 2 settimane (telefonata concierge), allora riattivo a costo ~0 | Win-back dormienti | % riattivati/30gg | Basso (manuale) | Medio-Alto | ~15 dormienti | 🟢 disegno · 🟡 esecuzione | **4,0** |
| E8 | Se **upsell/cross-sell nel carrello** ("chi compra pane prende…", "manca il vino dei pisarei"), allora +items/ordine | Upsell carrello | items/ordine + AOV | Medio | Medio | ~30 ordini | 🟡 (UI) | **3,7** |
| E9 | Se testo **prezzo consegna** (€2,90 vs €3,90 vs gratis>€30), allora trovo l'elasticità e il CM dopo batching | Fee consegna | elasticità + CM/ordine | Basso | Alto su margine | ~40 ordini | 🔴 prezzo reale | **3,7** |
| E10 | Se lancio **referral give-get bilaterale** (premio anche all'invitato), allora la conversione ~raddoppia | Loop referral | conv. invitati, K-factor | Medio (in prodotto) | Medio | ~30 clienti | 🟢 disegno · 🟡 attiva | **3,7** |
| E11 | Se propongo **slot stretti vs "appena pronto"**, allora massimizzo il batch size (margine) | Ops/batch | % ordini batch | Medio | Alto su margine | ~30 ordini | 🟡 (UI/ops) | **3,7** |
| E12 | Se introduco **bundle ad alto scontrino** ("Spesa Piacentina DOP", box weekend), allora alzo l'AOV con margine alto | Bundle/cross-sell | AOV box + margine | Medio | Medio-Alto | da subito (DOP slegato dal raggio) | 🟢 crea bundle · 🔴 se prezzo nuovo | **3,7** |
| E13 | Se attivo **"ordine di gruppo per via"** (team-buy), allora aumento inviti E densità | Loop team-buy | inviti + ordini/via | Medio | Medio (densità=margine) | ~20 clienti | 🟢 disegno · 🟡 attiva | **3,3** |
| E14 | Se monitoro **health negozi** e intervengo sul calo, allora abbasso il churn negozi | Stop churn negozi | churn negozi <5%/mese | Basso | Medio | ≥5 negozi | 🟢 monitor · 🟡 azione | **3,3** |
| E15 | Se introduco **abbonamento "Spesa del lunedì"** (dopo i primi 100), allora ricavo prevedibile + churn basso | Membership | % abbonati, ricavo ricorrente | Alto | Alto (a regime) | ≥100 clienti | 🔴 prezzo reale | **3,0** |

➡️ *Prossima azione:* parti da **E1, E3, E4, E5, E7** (costo ~0, attivabili da subito o a bassissimo traffico). Le leve 🔴 di pricing (E6, E9, E15) restano **proposte pronte**, si firmano quando c'è volume.

---

## 3. I 5 LOOP ORGANICI DI CRESCITA (il motore del passaparola)

Sono il cuore: **K-factor realistico 0,3-0,7** (non virale puro) → si ottimizza il **tempo di ciclo** (invito→1° ordine 1-2 giorni), non solo il valore di K. Loop 2, 3, 4 sono **già in buona parte costruiti** → vanno **attivati e orchestrati**, non sviluppati.

| # | Loop | Come gira | Stato | Owner |
|---|---|---|---|---|
| 1 | **Il negozio come canale** (offerta→domanda) | QR cassa + sacchetto brandizzato + vetrofania; incentivo **performance-gated** (premio quando i clienti portati completano N ordini, non alla firma) | da attivare | @vendite + @designer |
| 2 | **"Regala una spesa"** (gifting) | il destinatario riceve **valore concreto** (una spesa vera) → converte più di un codice sconto | in prodotto | @crm-lifecycle |
| 3 | **Ordine di gruppo per via** (team-buy) | consegna gratis/sconto se più vicini ordinano nella stessa finestra → +inviti +densità (su gruppi WhatsApp/FB) | in prodotto | @crm-lifecycle |
| 4 | **Referral give-get bilaterale** | premiare anche l'invitato ~raddoppia la conversione | in prodotto | @crm-lifecycle |
| 5 | **Prova sociale di prossimità** | "vedo il sacchetto del vicino", "i tuoi vicini su MyCity", inviti per indirizzo (Nextdoor) | da costruire | @content-social + @designer |

➡️ *Prossima azione:* **attiva e orchestra** i loop 2-3-4 (già in prodotto) appena parte il 1° sabato concierge; misura il **tempo di ciclo** non solo il volume. Handoff a **@crm-lifecycle**.

---

## 4. LEVE DI MONETIZZAZIONE (con cautela — prezzi/commissioni reali = 🔴)

> ⚠️ **Cambiare prezzi, fee, commissioni o ordine minimo reali è 🔴: si propone, si firma, NON si attiva da soli.** Qui sotto sono **proposte di esperimento pronte**, non modifiche.

**Sequenza corretta (da [[Finanza & Unit Economics]]): prima CM positivo, poi retention, poi scala.**

| Leva | Ipotesi di monetizzazione | Arbitro (la metrica che decide) | Colore |
|---|---|---|---|
| **Take rate** (15-25%) | un take rate sano sostiene il marketplace senza il 30% di Glovo (argomento di vendita) | CM/ordine + churn negozi | 🔴 |
| **Ordine minimo** (€15→20→25) | alza il CM concentrando il valore per giro | **CM totale/sett** (non l'AOV) | 🔴 |
| **Fee consegna dinamica** (€2,90/3,90/gratis>€30) | prezza la consegna in base a densità/orario → protegge il margine | elasticità + CM dopo batching | 🔴 |
| **Soglia free-shipping** | "spedizione gratis sopra €X" spinge l'AOV verso l'alto | AOV + CM totale | 🟡 (UI) / 🔴 (se cambia fee) |
| **Upsell/cross-sell carrello** | +items per ordine senza nuovo CAC | items/ordine + AOV | 🟡 (UI) |
| **Bundle alto scontrino** ("Spesa Piacentina DOP") | margine alto, box DOP slegato dal raggio consegna (spedibile) | AOV box + margine % | 🟢 crea / 🔴 prezzo nuovo |
| **Membership "Spesa del lunedì"** | ricavo ricorrente prevedibile, churn basso (dopo i primi 100) | % abbonati + retention | 🔴 |

➡️ *Prossima azione:* prepara le proposte 🔴 (E6, E9) come **schede-esperimento firmabili** (baseline, varianti, durata, guardrail su NSM/item-fill) e accodale in [[AZIONI-IN-ATTESA]]. Peer review numeri con **@finanza**.

---

## 5. RETENTION & LIFECYCLE (carrelli, win-back, referral) → handoff a @crm-lifecycle

La leva di retention è **l'abitudine, non lo sconto** (gli sconti profondi attirano cacciatori di offerte che non tornano — caso Groupon).

| Meccanica | Trigger | Azione | Colore |
|---|---|---|---|
| **Recupero carrelli** | carrello fermo T+1h, T+24h | email/push (no sconto prima, reminder) | 🟡 attiva · 🔴 se sconto |
| **Nudge 2° ordine** | post-1ª consegna | reminder vs sconto vs nulla (A/B) | 🟢 disegno · 🔴 sconto |
| **Win-back dormienti** | salta 2 settimane | **telefonata concierge** (nessun competitor lo fa, tu sì) | 🟢 disegno · 🟡 esecuzione |
| **Referral give-get** | post-ordine soddisfatto | premio a entrambi, ciclo breve | 🟢 disegno · 🟡 attiva |
| **"Regala una spesa"** | cliente felice | gift di una spesa vera | 🟢 disegno · 🟡 attiva |
| **Promemoria riordino** | abitudine settimanale (stesso giorno/ora) | reminder + riordino 1-click | 🟡 |

➡️ *Prossima azione:* **@crm-lifecycle** possiede tutto questo blocco. Growth fornisce ipotesi + soglie; CRM costruisce i flussi (n8n/Resend) e misura. Consenso/GDPR dei messaggi → peer review **@legale-privacy**.

---

## 6. COME SI MISURA UN ESPERIMENTO (la disciplina, non opzionale)

Ogni esperimento ha **5 campi obbligatori PRIMA di partire** (se ne manca uno, non parte):

1. **Baseline:** il numero di oggi (query Supabase/PostHog). A 0 ordini → la baseline è "0" e il primo dato È la baseline.
2. **Una metrica di successo dichiarata prima** (no metriche scelte dopo per "vincere").
3. **Una variabile per volta** (mai due cambi insieme, altrimenti non sai cosa ha funzionato).
4. **Durata ≥2 settimane** (la spesa è settimanale: serve almeno una coorte completa).
5. **Guardrail:** NSM e **item-fill ≥90%** non devono peggiorare. Se un esperimento alza l'AOV ma rompe l'item-fill → **fallisce**.

**Criterio di stop:** se a metà finestra il leading indicator va contro l'ipotesi e il guardrail soffre → **uccidi subito**. A fine finestra: vince solo se batte la baseline con margine chiaro; altrimenti **kill** e si annota la lezione.

**OKR del growth (trimestre):**
- **O:** portare il cluster a CM/ordine > €0 con retention al plateau.
- **KR1:** ≥4 esperimenti chiusi/mese (vinti o uccisi, mai "in sospeso").
- **KR2:** % 2° ordine ≤14gg ≥40%.
- **KR3:** CM/ordine da negativo → > €0.
- **KR4:** quota organica/passaparola in salita, CAC per zona in discesa.

➡️ *Prossima azione:* tieni un **registro esperimenti** (1 Google Sheet, ~20 min/sett): ipotesi · baseline · variante · risultato · vinto/ucciso · lezione.

---

## 7. OWNERSHIP & BUDGET (ogni leva un proprietario)

| Leva | Owner | Budget | STOP automatico |
|---|---|---|---|
| Loop negozio (E1) | @vendite + @designer | stampa QR/sacchetti (basso, 🔴 spesa) | se scan→ordine ~0 dopo 2 negozi |
| Carrelli/win-back/referral (E3,5,7,10) | @crm-lifecycle | €0 (email/push/telefono) | — |
| Pricing/fee/minimo (E2,6,9) | growth + **@finanza** | €0 (config) | se CM/ordine peggiora |
| Bundle DOP (E12) | growth + @content + @designer | €0 (riuso catalogo) | se AOV box non > AOV medio |
| Membership (E15) | growth + @finanza | €0 fino al lancio | solo dopo 100 clienti |
| Misurazione | @data-engineer | €0 | — |

**Regole budget:** ogni leva possiede un KPI; **STOP se brucia senza rendere** (es. uno sconto che alza ordini ma affonda il CM); **ogni spesa reale è 🔴** (stampa, ads, campioni → proposta firmabile, mai spesa autonoma). Niente ads finché l'organico funziona.

➡️ *Prossima azione:* allinea ogni riga al proprietario in [[OKR-Squadra]] (target + budget + STOP).

---

## 8. REGOLE 🟢🟡🔴 DEL GROWTH

- 🟢 **VERDE** — **disegnare e proporre** esperimenti, analizzare dati, creare bundle/copy, scrivere schede-esperimento, aggiornare la memoria → **faccio da solo**.
- 🟡 **GIALLO** — **attivare** un esperimento che cambia l'esperienza utente senza toccare il prezzo reale (logica UI di una soglia, sequenza email di recupero carrello, nudge reminder) → **faccio e avviso subito**.
- 🔴 **ROSSO** — **cambiare prezzi / fee / commissioni / ordine minimo reali** o **spendere budget** (ads, stampa, sconti reali) → **propongo e aspetto la firma di Nicola.** Mai da solo.
> Nel dubbio salgo di colore. E dopo ogni esperimento **misuro e uccido i perdenti** — niente numeri gonfiati.

---

## ✅ LE 5 AZIONI DI QUESTA SETTIMANA (esperimenti a costo zero, da lanciare appena c'è traffico)

1. **Strumenta il giorno 1** (E0): 5 eventi PostHog + UTM su ogni QR + tabella `orders` coi timestamp → senza questo nessun esperimento è leggibile. (→ @data-engineer)
2. **Attiva il loop negozio (E1):** QR + sacchetto + vetrofania **univoci per negozio** sul negozio-faro, incentivo **performance-gated**. (→ @vendite + @designer)
3. **Prepara il recupero carrelli (E5):** sequenza email/push T+1h e T+24h **senza sconto** (solo reminder), pronta in n8n. (→ @crm-lifecycle)
4. **Disegna il nudge 2° ordine (E3)** come A/B (reminder vs sconto vs nulla) + **win-back telefonico (E7)** per chi salta 2 settimane — script pronto. (→ @crm-lifecycle + @customer-success)
5. **Scrivi le schede-esperimento 🔴 firmabili** per ordine minimo (E6) e fee consegna (E9) — baseline/varianti/durata/guardrail — e accodale in [[AZIONI-IN-ATTESA]]. (review numeri @finanza)

➡️ *Tutte e 5 sono a costo ~0.* Le uniche spese (stampa QR/sacchetti) e i cambi di prezzo restano 🔴: proposti, non eseguiti.

#growth #monetizzazione #esperimenti #ice #retention #piano #piacenza #priorità/alta

<!-- 🤖 AD-AGGIORNAMENTO:START · non scrivere qui dentro: lo rigenera l'AD a ogni giro -->
## 🤖 Aggiornamento dell'AD — 2026-07-02 08:36
> Proposte 🟡 dall'auto-analisi (radar / Intelligence / briefing). NON riscrivono il piano sopra: spunti da validare.
- **Gate crescita:** #16 oggi pranzo → prima transazione → sblocca outreach 407 lead.
- **Automazione verde 08:36** — deploy #19 via merge senza frizione tecnica.
- **6/7 batch** = leva densità cluster post-piattaforma pulita.
<!-- 🤖 AD-AGGIORNAMENTO:END -->
