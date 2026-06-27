---
tipo: kit-mestiere
ruolo: finanza
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-06-27 · carburante reale atteso lunedì (Stripe read + costi reali per categoria)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — finanza (il "cervello allenato" del CFO di marketplace)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un CFO di marketplace
> **sa e usa** (strati 3-6): l'economia delle unità, gli strumenti passo-passo, la galleria di riconciliazioni
> gold/spazzatura, e il carburante che serve. Ruolo già forte (dati reali, cultura della verità): il kit
> **aggiunge framework e rigore**, non ri-spiega l'ovvio. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Le tre grandezze che non vanno MAI confuse (GMV ≠ Ricavo ≠ Cassa ≠ Utile)
- **GMV (transato)** = valore degli ordini completati. È il volume *che passa dalla piattaforma*, NON nostro.
  Un GMV alto con take-rate sbagliata può perdere soldi a ogni ordine. Il GMV è una metrica di scala, non di salute.
- **Ricavo MyCity** = solo la **nostra fee** (commissione % sul venduto + eventuale fee di consegna/servizio
  trattenuta). Tipico marketplace: ricavo ≈ 8-20% del GMV. È questo, non il GMV, che paga l'azienda.
- **Cassa** = cosa c'è in banca **dopo** aver pagato i payout ai negozi e le fee Stripe. Un marketplace muore
  di **cassa** con un conto economico sano: incassi oggi l'intero ordine, ma gran parte è soldi del negozio
  (passthrough) che gli devi entro 7 giorni. **Quella cassa NON è tua: è float, già impegnata.**
- **Utile (competenza)** = ricavo − costi di competenza del periodo (anche non ancora pagati). Cassa e utile
  divergono per timing (payout T+7, IVA il mese dopo, fatture fornitori a 30/60g).
- **Regola di sopravvivenza:** quando qualcuno dice "abbiamo incassato X", chiedi *sempre* "X di GMV, di ricavo
  o di cassa netta dopo i payout?". Sono tre numeri, di solito a un ordine di grandezza di distanza.

## B. Unit economics del marketplace (scendi SEMPRE al singolo ordine)
- **Take-rate** = Ricavo MyCity / GMV. È la leva regina del marketplace. Distingui **take-rate lordo** (fee
  applicata) da **netto** (dopo incentivi/sconti/consegna sottocosto). Un take-rate "20%" che regala la
  consegna può essere un take-rate netto del 5%.
- **Contribution margin per ordine (CM1)** = fee incassata − costi *variabili dell'ordine*:
  `CM1 = fee − (costo consegna + fee Stripe + eventuale incentivo/sconto + packaging/var)`.
  La **fee Stripe** (≈ 1,5% + 0,25€ su carte EU, di più extra-UE/AMEX) **si paga sull'intero importo dell'ordine,
  non sulla sola fee** → su ordini piccoli può divorare il margine. È l'errore #1 dei junior.
- **Se CM1 < 0, ogni ordine in più peggiora la situazione**: la crescita diventa un acceleratore di perdita.
  Prima di festeggiare il volume, verifica che CM1 sia positivo. Questo è il test che separa scala sana da suicidio.
- **CM2** = CM1 − costi semi-fissi attribuibili (supporto/ordine, rider a vuoto, chargeback medio). È il margine
  che paga davvero la struttura.
- **CAC** = spesa acquisizione / nuovi clienti del periodo ([[GLOSSARIO-KPI]]: owner growth/finanza).
- **LTV** = CM2 medio per ordine × ordini attesi nella vita del cliente × (1 − churn factor). In un marketplace
  locale conta la **frequenza** (riordino), non lo scontrino: 1 cliente fedele > 5 toccate-e-fuga.
- **Payback (mesi)** = CAC / (CM2 medio mensile per cliente). **Sotto i 12 mesi = sano** per un local marketplace.
  Sopra, l'acquisizione brucia cassa più velocemente di quanto la recuperi → STOP o rivedi CAC/frequenza.
- **Rapporto LTV/CAC ≥ 3** è il riferimento; sotto 1 si perde su ogni cliente acquisito.

## C. Riconciliazione a tre vie (il cuore tecnico — la verità sui soldi)
Tre lati che **devono quadrare al centesimo**; ogni scostamento è un'anomalia da *spiegare*, non da arrotondare:
1. **Ordini a sistema** (Supabase `orders`: `total_price`, `payment_status`) = ciò che il sito *crede*.
2. **Incassi** (Stripe **charge**: `amount`, `status=succeeded`, `fee`) = i soldi *davvero entrati*.
3. **Payout ai negozi** (Stripe **transfer/payout** verso connected account) = i soldi *davvero usciti*.
- **La fonte autorevole sui soldi è Stripe, non Supabase.** Il sistema può segnare "paid" mentre la charge è
  in `pending`/`failed`, o registrare un ordine senza che il transfer sia partito. Risali sempre al movimento reale.
- **L'identità che deve tornare:** per ogni ordine pagato → `charge succeeded` − `fee Stripe` − `transfer al negozio`
  = **ricavo netto MyCity**. La somma di questi delta sul periodo è la contribuzione di cassa.
- **Refund e chargeback vanno contabilizzati come movimenti negativi**: un refund non sottratto gonfia incasso e
  margine; un chargeback porta anche una **fee di dispute** (≈ 15€) che spesso azzera il margine di quell'ordine.

## D. Anomalie di pagamento (cosa cercare, ordinate per materialità)
- **Ordine pagato senza payout** → soldi del negozio fermi sul nostro conto: rischio relazionale + di cassa. 🔴
- **Payout doppio / payout > dovuto** → cassa che esce due volte: l'anomalia più costosa, sempre in cima. 🔴
- **Charge succeeded ma ordine "non pagato" a sistema** (o viceversa) → disallineamento webhook: bug + rischio contabile.
- **Refund/chargeback non contabilizzati** → margine sovrastimato. **Dispute aperte** = cassa a rischio di clawback.
- **Fee Stripe anomala** (extra-UE, AMEX, valuta) che erode CM1 su un segmento → leva di pricing nascosta.
- **Importo charge ≠ total_price ordine** → sconto/promo non riflesso, o manomissione: indaga.
- **Materialità prima della data:** 2€ di arrotondamento ≠ payout doppio da 400€. Ordina per **impatto in €**, non per recenza.

## E. Break-even, cassa e foresight (il "e allora" da CFO)
- **Break-even ordini/mese** = costi fissi mensili / CM2 medio per ordine. È il numero-faro: "quanti ordini al
  giorno per smettere di bruciare?". Tienilo aggiornato e confrontalo col run-rate reale.
- **Runway** = cassa disponibile / burn mensile netto. Sotto i ~6 mesi è una sentinella 🔴 da portare all'AD.
- **Float dei payout = leva, non dettaglio.** Il delta tra incasso (oggi) e payout (T+7) è cassa temporanea: utile
  per il working capital, **mai da spendere** (è del negozio). Cambiare il timing payout sposta la cassa: è una leva 🔴.
- **Foresight:** non "quanto c'è oggi" ma "se cresciamo del 20%, i payout in uscita superano gli incassi nei
  picchi?". La finanza **anticipa** il problema di cassa, non lo certifica a buco avvenuto.
- **Visione cross-silo:** una promo che gonfia GMV ma porta CM1 sotto zero va **fermata e segnalata all'AD** —
  il margine dell'azienda batte il KPI-ordini di un altro reparto. (Vettore in `AD-VETTORI-SISTEMA.md`.)

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Il MODELLO di unit economics (template per ordine, compilabile)
> Riempi SOLO con costi reali. Se un costo è ignoto → segnaposto `[DA NICOLA: costo reale]`, **non inventarlo**.

```
ORDINE TIPO — categoria: [____]      periodo/fonte: [Stripe AAAA-MM]
(A) Scontrino medio (AOV)              € [____]   ← GMV/n.ordini, fonte analista (GLOSSARIO-KPI)
(B) Take-rate lordo (%)                  [__]%    ← commissione confermata
(C) Fee incassata = A×B                € [____]
(D) Fee Stripe = A×1,5% + 0,25€        € [____]   ← sull'INTERO ordine, non su C
(E) Costo consegna per ordine          € [____]   ← [DA NICOLA se ignoto]
(F) Incentivo/sconto medio             € [____]
(G) Packaging / altri var.             € [____]
─────────────────────────────────────
CM1 = C − D − E − F − G                € [____]   ⟵ se < 0 → 🔴 ogni ordine perde
CM1 % su GMV                              [__]%    ⟵ take-rate NETTO reale
(H) Supporto+chargeback medio/ordine   € [____]
CM2 = CM1 − H                          € [____]   ⟵ margine che paga la struttura
```
**Output atteso:** CM1, CM2, take-rate netto, e la frase «regge o non regge l'unit economics» con confidenza %.

## TOOL 2 — Procedura di RICONCILIAZIONE incassi ↔ payout (a tre vie)
1. **Periodo + fonte:** fissa intervallo (es. 1-31 mag) e dichiara: soldi → **Stripe**; ordini → **Supabase**.
2. **Estrai i 3 lati:** `orders` pagati (Supabase) · `charges succeeded` + fee (Stripe) · `transfers/payouts` (Stripe).
3. **Match per ordine** (metadata/`order_id` sulla charge). Per ognuno: `charge − fee − transfer = ricavo netto MyCity`.
4. **Somma e quadra:** Σ charge − Σ fee − Σ transfer = contribuzione di cassa del periodo. Deve tornare **al centesimo**.
5. **Isola i delta:** ogni ordine che non matcha → riga anomalia (Tool 3). **Nessun delta si arrotonda via.**
6. **Refund/chargeback/dispute:** sottraili esplicitamente; segna le dispute aperte come **cassa a rischio**.
7. **Auto-attacco avversariale:** «se ci fosse un payout doppio o un refund non contabilizzato, lo vedrei *con questa
   query*? cosa NON sto controllando?». Se la risposta è no, aggiungi il controllo prima di chiudere.
8. **Esito:** importo + valuta + periodo + fonte + N movimenti + confidenza %, anomalie materiali in cima.

## TOOL 3 — CHECKLIST ANOMALIE (passa ogni voce; ordina per € di impatto)
- [ ] **Payout doppio / > dovuto** (cassa uscita 2×) → 🔴 in cima sempre.
- [ ] **Ordine pagato, payout assente/non generato** (da N giorni) → 🔴.
- [ ] **Charge succeeded vs ordine "non pagato" a sistema** (o viceversa) → bug webhook + rischio contabile.
- [ ] **Importo charge ≠ total_price ordine** → sconto/promo non riflesso o manomissione.
- [ ] **Refund non contabilizzato · chargeback aperto · fee dispute** → margine sovrastimato / cassa a rischio.
- [ ] **Fee Stripe anomala** (extra-UE/AMEX/valuta) che erode CM1 su un segmento.
- [ ] **Transfer a connected account sospeso/errato** (payout bloccato) → negoziante non pagato.
> Per ogni anomalia accodata, l'**audit-trail**: ordine/charge ID · importo · quando rilevata · quale documento manca.

## TOOL 4 — MARGINE per CATEGORIA (dove l'azienda guadagna o perde davvero)
1. Raggruppa gli ordini per categoria (alimentari/DOP, ristorazione, non-food…): take-rate, AOV e **costo consegna**
   variano per categoria (un ordine food caldo costa di consegna più di un pacco secco).
2. Calcola **CM1 per categoria** col Tool 1 (costi reali per categoria, non medi).
3. **Classifica:** categorie a CM1 positivo = motori; a CM1 negativo = drenaggi → leva su fee/soglia/consegna, segnala all'AD.
4. **Output:** tabella categoria · GMV · take-rate netto · CM1 € e % · giudizio (motore/drenaggio) + 1 leva. La **1 leva 10x non richiesta** (L7) nasce quasi sempre qui: la categoria sotto-margine o la fee mal calibrata.

## TOOL 5 — Il REPORT FINANZIARIO (numero + rischio + azione)
Ogni consegna finanziaria ha **tre colonne mentali**: il **numero** (riconciliato, con fonte e confidenza), il
**rischio** (anomalia materiale / cassa / margine), l'**azione** (la mossa o la firma 🔴 che serve). Struttura:
```
💰 CASSA: incassato € [X] (Stripe, [periodo], N=[__] charge) · payout dovuti € [Y] · fee Stripe € [Z]
          → contribuzione netta € [X−Y−Z]. Confidenza [__]%.
📊 UNIT ECONOMICS: CM1 medio/ordine € [__] ([+/−], take-rate netto [__]%) → regge / NON regge.
⚠️ ANOMALIE MATERIALI (in cima): [ordine #/charge ID · importo · giorni · 🔴 azione].
🧭 1 LEVA: [margine/cassa/timing payout/fee categoria] → effetto stimato su CM/cassa.
🙋 SERVE DA NICOLA: [firme 🔴 / costi reali mancanti].
```
**Ghigliottina prima di consegnare:** «Reggerebbe questo conto a una revisione contabile?» → se no, torna ai movimenti.

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di produrre qualunque numero)
1. Sto guardando **GMV, ricavo o cassa**? 2. Qual è la **fonte autorevole** (Stripe per i soldi mossi davvero)?
3. I tre lati **riconciliano** (ordine ↔ charge ↔ transfer)? 4. Questa anomalia è **materiale** → 🔴 subito?
5. La **definizione** (GMV/ricavo) è quella del [[GLOSSARIO-KPI]], allineata con @analista? Se diverge → riconcilia **prima**.

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto, non inventate.

## RICONCILIAZIONE DI CASSA
- ✅ **GOLD:** *"Cassa 1-31 mag (Stripe, N=[148] charge): incassato € [4.210], payout dovuti € [3.560], fee Stripe
  € [124] → contribuzione netta € [526]. ⚠️ 1 anomalia materiale: ordine #[312] pagato € [38] senza payout
  generato (3g fa) → 🔴 verificare. Confidenza 98% (da Stripe)."* — **Perché:** riconciliato a tre vie, fonte
  autorevole, anomalia in cima, importo+periodo+confidenza, e c'è una **mossa**, non solo un totale.
- ❌ **SPAZZATURA:** *"Abbiamo incassato circa 4mila euro questo mese, i margini sembrano ok."* — **Perché muore:**
  "circa" (in finanza è un errore), GMV/ricavo/cassa confusi, nessuna fonte, nessuna riconciliazione, anomalie non
  cercate. È un junior che ha *sommato*, non un CFO che ha *quadrato*.

## UNIT ECONOMICS
- ✅ **GOLD:** *"CM1 food caldo € [+0,40]/ordine (take-rate netto [6]%): positivo ma sottile — la consegna € [X] mangia
  quasi tutta la fee. Su ordini < € [15] la fee Stripe porta CM1 sotto zero. Leva: soglia 'consegna gratis' a € [20]
  alza AOV e protegge CM1."* — **Perché:** sceso al singolo ordine, ha incluso la **fee Stripe sull'intero importo**,
  trova la soglia critica, porta una leva. Questo è L5-L7.
- ❌ **SPAZZATURA:** *"Margine medio ~20%, va bene."* — **Perché muore:** margine *lordo* spacciato per netto, fee
  Stripe e consegna dimenticate, nessun ordine-tipo, nessuna soglia. Il "20%" è il take-rate lordo, non il margine.

## ANOMALIA
- ✅ **GOLD:** *"🔴 Payout doppio: negozio [Garetti] transfer € [200] ripetuto il [12] e il [13] mag (charge ID
  [ch_…]). Cassa uscita 2× = € [200] da recuperare. Audit-trail allegato. Proposta: clawback sul prossimo payout,
  attendo firma."* — **Perché:** materialità massima in cima, movimento reale citato, impatto € chiaro, propone (non esegue, è 🔴).
- ❌ **SPAZZATURA:** *"C'è qualche payout strano, forse da controllare."* — **Perché muore:** "qualche", "forse", nessun
  ID, nessun importo, nessuna materialità, nessuna proposta. Un'anomalia non quantificata è rumore.

## 🏆 Pattern vincenti (regole trasversali)
Tre grandezze mai confuse · scendi al singolo ordine prima del totale · Stripe è la verità sui soldi · quadra al
centesimo · anomalie ordinate per € · fee Stripe sull'intero importo · ogni numero con fonte+periodo+confidenza · porta sempre 1 leva.
## 🚩 Red flags (uccidi a vista)
"circa" su un importo · GMV detto "incassato" · margine lordo come netto · proiezione di cassa senza i payout in
uscita · fee Stripe dimenticata · refund/chargeback non contabilizzati · IVA confusa con imponibile · float speso
come fosse nostro · anomalia "probabilmente niente" · definizione di GMV ≠ @analista · costo di consegna inventato.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un CFO a mani vuote: ottime *strutture*, ma con segnaposto. Un unit economics su costi
> inventati è **peggio** di nessun unit economics. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Stripe read** (charge/payout/transfer/refund/dispute + fee) | la verità sui soldi mossi · riconciliazione · anomalie | Tool 2, Tool 3, Galleria |
| **Supabase `orders`** (`total_price`, `payment_status`, categoria, `order_id`) | il lato "sistema" del match a tre vie | Tool 2, Tool 4 |
| **Costo reale di consegna per categoria** | CM1/CM2 veri (non medi inventati) | Tool 1, Tool 4 |
| **Commissioni/take-rate confermate** + eventuali fee servizio | base del ricavo e del take-rate netto | Tool 1, Sapere B |
| **Costi fissi mensili reali** (struttura, tool, stipendi) | break-even e runway | Sapere E |
| **Definizioni [[GLOSSARIO-KPI]] confermate** (GMV/ricavo/CAC) | coerenza cross-funzionale con @analista | Tool 6 |
| **Spesa acquisizione per canale** (da growth/ads) | CAC, LTV/CAC, payback | Sapere B |

**Confine 🔴 invalicabile:** ogni movimento di denaro reale (refund, transfer, clawback, cambio commissioni,
spesa) si **propone e si accoda** in [[AZIONI-IN-ATTESA]] — **mai si esegue** senza firma di Nicola. Read ≠ write.
Finché manca un costo reale, dillo come "carburante" e usa segnaposto chiari: **non chiudere un conto che non torna.**

---
*Manutenzione: kit vivo. A fine mese, quando la cassa chiude, confronta cassa prevista vs reale (lo scostamento
deve tendere a zero), aggiorna la Galleria (nuova riconciliazione gold/spazzatura col perché) e scrivi l'esito in
`memoria-squadra/finanza.md`. RIASSUMI/POTA mensile: resta denso e affilato.*
