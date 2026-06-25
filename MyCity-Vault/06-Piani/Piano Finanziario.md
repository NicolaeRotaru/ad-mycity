# 💶 PIANO FINANZIARIO / UNIT ECONOMICS 2026

> Base dati: [[Finanza & Unit Economics]] (fonte principale), [[Metriche & KPI]], [[Rischi & Compliance]]. Aggancia [[Piano di Notorieta 2026]] (domanda) e [[Bandi & Finanziamenti]] (capitale).
> **Stato oggi (25/06/2026):** ~1 negozio, ~0 ordini. Stack **Supabase + Stripe Connect**. Consegna **cargo-bike con batching**. Riconciliazione Stripe↔`orders` non ancora attiva (0 transazioni).
> **La tesi in 1 frase:** *l'ordine singolo perde soldi; il margine nasce dalla DENSITÀ (4-6 ordini/giro). Il break-even non chiede 1000 clienti, ne bastano ~150-320.*
> **Onestà CFO:** il rischio numero uno NON è il runway (con €150k → >30 mesi). È la **frequenza di riacquisto reale**: è l'unico numero che può uccidere il modello, e oggi non lo conosciamo. Tutto sotto è ancorato ai numeri del vault; le 🟡 sono assunzioni da validare col primo ordine reale.

> 🔑 **Regola d'oro finanziaria:** prima il **CM positivo** (batching + ordine minimo + fee), poi la **retention al plateau**, **solo dopo** si acquisisce/scala. Spendere per acquisire prima che il CM sia positivo = riempire un secchio bucato.

---

## 1. OBIETTIVO & I NUMERI-CHIAVE

**Traguardo finanziario 2026 (Anno 1):** raggiungere un **CM/ordine ≥ +€4**, portare ≥50% degli ordini in **batch ≥2**, e dimostrare una **retention W12 ≥25% piatta** — i tre numeri che sbloccano la scala. Il pareggio economico arriva in Anno 3; l'Anno 1 chiude in perdita *controllata*.

| Numero-chiave | Target | Fonte |
|---|---:|---|
| Ricavi MyCity Anno 1 | **€62k** 🟡 | [[Finanza & Unit Economics]] |
| GMV Anno 1 | **€325k** 🟡 | idem |
| CM medio/ordine | **~€5,18** (a densità mista) | idem |
| EBITDA Anno 1 | **−€26k** 🟡 | idem |
| Break-even operativo | **~160 ordini/sett** (~150-320 clienti attivi) | idem |
| Costi fissi Anno 1 | **~€4.000/mese** (~€48k/anno) | idem |
| Fabbisogno fino al break-even | **~€120-180k** | idem |
| Runway con €150k @ burn €3-4k/mese | **>30 mesi** | idem |

➡️ *Prossima azione:* alla prima settimana di ordini reali, sostituire OGNI 🟡 con il dato vero (AOV reale, ordini/giro reali, frequenza reale). Senza questi, le proiezioni restano ipotesi.

---

## 2. UNIT ECONOMICS PER ORDINE (il conto che decide tutto)

**Assunzioni di partenza 🟡** (da [[Finanza & Unit Economics]]): AOV **€50** · commissione **12% (€6)** · fee consegna al cliente **€3,50** · costo rider **€7/giro** · packaging **€1,20** · Stripe **€1,37**.

- **Ricavo MyCity/ordine** = commissione €6 + fee consegna €3,50 = **€9,50**
- **Costo variabile non-rider/ordine** = packaging €1,20 + Stripe €1,37 = **€2,57**
- **Costo rider/ordine** = €7 ÷ (ordini nel giro) → **è qui che la densità cambia tutto**

| Scenario densità | Ordini/giro | Costo rider/ordine | **CM/ordine** | Verdetto |
|---|---:|---:|---:|---|
| Consegna singola | 1 | €7,00 | **−€0,07** | 🔴 PERDE — vietata |
| Coppia | 2 | €3,50 | **+€3,43** | 🟢 minimo accettabile |
| Giro denso | 3 | €2,33 | **+€4,60** | 🟢 buono |
| Giro pieno | 5 | €1,40 | **+€5,53** | 🟢 target |

**CM/ordine = €9,50 − €2,57 − (€7 / ordini per giro).**

➡️ *Prossima azione:* **regola operativa già attiva** — *≥2 ordini/giro o non si consegna*. Sotto i 2, ogni consegna brucia cassa. Target operativo dispatch: **4-6 ordini/giro**.

---

## 3. IL CONTO DEL BATCHING (perché la densità è tutto)

Il costo rider (€7/giro) è **fisso per giro, non per ordine**. Spalmato su più consegne crolla per ordine: è l'unica leva che porta il CM da **negativo a +€5,53**. Nessuna altra leva ha questo effetto.

| Leva | Effetto sul CM | Note |
|---|---|---|
| **1️⃣ Densità (ordini/giro)** | da −€0,07 → +€5,53 | **+€5,60 di swing.** La leva regina. |
| 2️⃣ Take rate / mix | +3 pt commissione ≈ +30% CM | abbonamenti, fee promo, box DOP = margine quasi puro |
| 3️⃣ AOV × frequenza | guida l'LTV, non il CM singolo | la frequenza è ciò che rende un cliente redditizio |

**Implicazione strategica (allineata a [[Piano di Notorieta 2026]]):** notorietà LARGA su tutta la città, ma **operazioni DENSE solo sul cluster centro**. La domanda fuori cluster va in lista d'attesa per quartiere — altrimenti i giri si diradano e il CM crolla. *La densità non è un'ottimizzazione logistica: è la condizione di sopravvivenza economica.*

➡️ *Prossima azione:* misurare **% ordini batchabili** e **batch size medio** dal giorno 1 (campo `batch_id` in `orders`, già previsto in [[Metriche & KPI]]). È un KPI di sopravvivenza, non un "nice to have".

---

## 4. PROIEZIONI A 3 SCENARI → DIC 2026

Base = la proiezione Anno 1 del vault (€325k GMV, €62k ricavi, 250 clienti, 8 negozi). Gli scenari **prudente** e **spinto** sono derivati 🟡 ±35% sul volume, tenendo costi fissi quasi piatti (la struttura è la stessa) — quindi l'EBITDA reagisce in leva.

| Voce (a dic 2026) | 🟡 Prudente | 🟢 Base | 🚀 Spinto |
|---|---:|---:|---:|
| Negozi attivi | 5 | 8 | 12 |
| Clienti attivi | 160 | 250 | 380 |
| GMV | €210k | **€325k** | €480k |
| Ricavi MyCity | €40k | **€62k** | €92k |
| Costi fissi anno | €44k | €48k | €54k |
| CM medio/ordine | +€4,00 | +€5,18 | +€5,53 |
| EBITDA Anno 1 | **−€34k** | **−€26k** | **−€8k** |
| Runway con €150k | >32 mesi | >30 mesi | >36 mesi |

**Lettura CFO:** anche nello scenario **spinto** l'Anno 1 NON è a pareggio — ed è giusto così: si sta comprando densità e retention. La differenza tra prudente e spinto **non è il marketing, è il CM/ordine** (cioè la densità). Lo scenario prudente con CM solo +€4 perde €34k; lo spinto con giri pieni quasi pareggia. *Si vince stringendo i giri, non allargando la spesa.*

➡️ *Prossima azione:* aggiornare questa tabella ogni mese con i dati reali Supabase. Trigger 🔴 di STOP: se a fine Q3 il CM medio reale resta < +€3, **non si scala** — si torna a lavorare sulla densità.

---

## 5. BREAK-EVEN (quanti ordini/giorno per cluster)

Dal vault: costi fissi ~€4.000/mese, CM medio ~€5,18.

- **Break-even mensile** = €4.000 ÷ €5,18 ≈ **~772 ordini/mese** ≈ **~160 ordini/settimana** ≈ **~23 ordini/giorno** (7gg) o **~32/giorno** (5gg operativi).
- Tradotto in clienti: **~150-320 clienti attivi** secondo la frequenza (settimanale → fascia bassa; quindicinale → fascia alta).
- Tradotto in **giri/giorno** sul cluster centro: a 4-6 ordini/giro → **~4-8 giri/giorno**. Pienamente gestibile da 1-2 cargo-bike sul centro.

| Frequenza cliente | Clienti per il pareggio |
|---|---:|
| Settimanale (1 ord/sett) | **~160** |
| Ogni 10 giorni | ~230 |
| Quindicinale | **~320** |

✅ **Messaggio:** *non servono 1000 clienti per il pareggio: ne bastano ~150-320.* I 1000 sono il punto in cui MyCity **genera cassa**, non quando smette di perderne.

➡️ *Prossima azione:* fissare il target del cluster centro a **~25 ordini/giorno** come soglia di pareggio operativo, e misurare ogni settimana la distanza da lì.

---

## 6. COSTI FISSI & STRUTTURA

~€4.000/mese in Anno 1. Composizione 🟡 (da validare con le fatture reali):

| Voce | Stima mensile | Note / colore |
|---|---:|---|
| Fondatore (parz. pagato) | ~€2.000 | la voce maggiore; sale quando si assume il 1° rider 🔴 |
| Marketing/notorietà | ~€300-600 | filosofia 80% earned ([[Piano di Notorieta 2026]]: €1,7-3,5k su 6 mesi) |
| Stack tech (Supabase, Stripe, hosting, dominio, n8n) | ~€100-250 | Stripe è **variabile** (€1,37/ordine, già nel CM) |
| Materiali (packaging, vetrofanie, QR, isotermici HACCP) | ~€200-400 | parte è CAPEX iniziale una tantum |
| Rimborsi/contingenza/qualità primi ordini | ~€200-400 | cura maniacale dei primi ordini (reputazione città piccola) |
| Compliance (HACCP, consulente lavoro, commercialista) | una tantum + ricorrente | 🔴 NON opzionale — vedi [[Rischi & Compliance]] |

**Nota struttura ricavi (il margine è nel MIX):** Anno 1 = commissione ~55% + fee consegna ~30% + resto. A regime aggiungere **abbonamento, box DOP spediti, welfare B2B, fee promozione negozi** (margine quasi puro). *Un marketplace di sola commissione+consegna non chiude — riferimento Cortilia: €45M ricavi, −€7,6M.*

➡️ *Prossima azione:* aprire un foglio "costi fissi reali" e riconciliarlo ogni mese con gli addebiti veri (Stripe, Supabase, fornitori). Le stime 🟡 vanno sostituite, non difese.

---

## 7. CAPITALE & RUNWAY

Fabbisogno fino al break-even: **~€120-180k**. Strategia CFO: **coprire prima con capitale NON diluitivo** (fondo perduto / tasso zero), tenere l'equity per ultimo, a valutazione alta.

| Fonte di capitale | Tipo | Priorità | Aggancio |
|---|---|---|---|
| Smart&Start Italia | finanziamento tasso zero | 1 | [[Bandi & Finanziamenti]] |
| ON – Nuove imprese a Tasso Zero | tasso zero/fondo perduto | 1 | idem |
| Bando Commercio ER (40%) | contributo a fondo perduto | 2 | scad. **21/07/2026** — è anche arma per i negozi |
| Voucher Camera di Commercio (50%) | contributo | 2 | leva onboarding negozi |
| Equity (angel/seed) | diluitivo | 3 (solo Anno 3) | a valutazione alta, dopo PMF |

**Runway:** con **€150k** e burn **€3-4k/mese** → **>30 mesi** di autonomia. *Il rischio non è restare senza cassa, è non trovare la frequenza prima che la cassa finisca.*

➡️ *Prossima azione:* il **Bando Commercio ER scade il 21/07/2026** — è il pezzo di capitale non diluitivo più vicino. Coordinare con [[Piano di Notorieta 2026|§6]] e l'agente *relazioni-istituzionali* per non perdere la finestra. (Predisposizione = 🟢; invio candidatura/firme = 🔴.)

---

## 8. ANOMALIE & CONTROLLO (riconciliazione Stripe ↔ ordini)

Oggi 0 transazioni → niente da riconciliare, ma il **controllo va armato prima del primo euro** (coerente con [[Rischi & Compliance]] N1: split payment Stripe Connect, MyCity non tocca mai i fondi).

**Controlli da attivare dal 1° ordine (riconciliazione settimanale Stripe MCP ↔ `orders` Supabase):**

| Controllo | Anomalia da intercettare | Colore |
|---|---|---|
| `orders.payment_status = paid` ↔ PaymentIntent Stripe | ordine pagato a DB senza incasso Stripe (o viceversa) | 🔴 segnala subito |
| Incasso ↔ payout al negozio (`application_fee` trattenuta) | payout mancato, doppio, o importo errato | 🔴 |
| Refund/dispute Stripe | refund anomalo o non autorizzato | 🔴 (mai eseguirne senza firma Nicola) |
| Somma payout + fee = incasso lordo | scostamento di quadratura | 🟡 indagare |
| Stripe fee reale vs €1,37 assunto | erosione del CM se la fee reale è più alta | 🟡 aggiorna unit economics |

**Regola ferma:** qualsiasi **movimento di denaro reale** (refund, transfer, cambio commissioni, payout manuale) è **🔴 → proponi, non eseguire.** Aspetta la firma di Nicola. La riconciliazione è in **sola lettura**.

➡️ *Prossima azione:* chiedere all'agente *builder-automazioni* uno script settimanale che incroci Stripe ↔ `orders` e sputi le sole righe anomale. Finché non c'è volume, riconciliazione manuale al primo ordine.

---

## 9. REGOLE 🟢🟡🔴 (cosa fa la Finanza da sola, cosa aspetta firma)

| Azione | Colore | Chi |
|---|---|---|
| Analisi, proiezioni, scenari, riconciliazione (lettura) | 🟢 | Finanza, da sola |
| Aggiornare STATO/memoria coi numeri reali | 🟢 | Finanza |
| Segnalare un'anomalia di denaro | 🟢 (segnala) → 🔴 (la risoluzione) | Finanza segnala subito |
| Proporre un cambio commissione / fee / ordine minimo | 🟡 proposta → 🔴 esecuzione | propone Finanza, firma Nicola |
| Spendere budget reale (ads, materiali, assunzioni) | 🔴 | solo firma Nicola |
| Eseguire refund / payout manuale / transfer Stripe | 🔴 | solo firma Nicola |
| Candidatura bando / firma contratti | 🔴 | predispone Finanza/legale, firma Nicola |

*Le analisi e le proiezioni le faccio da solo. Ogni euro reale che si muove passa dalla tua firma.*

➡️ *Prossima azione:* ogni proposta che tocca denaro reale viene **accodata in [[AZIONI-IN-ATTESA]]** completa (importo, destinatario, motivo) — pronta a partire al tuo "ok".

---

## ✅ LE 5 AZIONI DI QUESTA SETTIMANA

1. **Congelare le assunzioni 🟡** (AOV €50, comm. 12%, fee €3,50, rider €7/giro) come baseline ufficiale e prepararsi a sostituirle col **primo dato reale** appena arriva l'ordine 1.
2. **Armare la riconciliazione Stripe ↔ `orders`** (anche manuale): definire i 5 controlli del §8 prima del primo incasso. Niente euro senza controllo pronto.
3. **Inchiodare la regola densità nel dispatch:** *≥2 ordini/giro o non si consegna*, target 4-6. Misurare `batch_id`/batch size dal giorno 1.
4. **Mettere a fuoco il Bando Commercio ER** (scad. 21/07): coordinare con relazioni-istituzionali/legale la predisposizione (🟢) — capitale non diluitivo, finestra che si chiude.
5. **Fissare la soglia di pareggio del cluster centro a ~25 ordini/giorno** e iniziare a misurare ogni lunedì la distanza da lì (cruscotto §5).

---

> **Una raccomandazione, decisa:** *non spendere un euro in acquisizione finché il CM/ordine reale non è ≥ +€3-4.* La leva n.1 è la **densità del cluster centro**, non il budget. Prima i giri pieni, poi la crescita. Tutto il resto del piano serve a comprare tempo (runway >30 mesi) mentre si trova la **frequenza di riacquisto reale** — l'unico numero che oggi non conosciamo e che decide se MyCity vive.

#finanza #unit-economics #piano #break-even #batching #cfo #priorità/alta
