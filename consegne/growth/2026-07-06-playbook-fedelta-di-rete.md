---
tipo: playbook
reparto: growth-monetizzazione
data: 2026-07-06 12:51
colore: 🔴 (tocca i soldi — firma Nicola)
stato: ARMATO — meccanica pronta, NON lanciato (gate di scala)
autore: AD digitale (+ finanza, legale-privacy, crm-lifecycle, contabilita, designer, builder-automazioni)
fonte-dati: MCP Supabase 6/7 11:11 + [[STATO]]
---

# 🎟️ PLAYBOOK — Fedeltà di rete: MyCity Punti + Gift Card

> **La grande idea:** un cliente che compra da *un* negozio di Piacenza guadagna un vantaggio
> spendibile in *tutti* i negozi della rete. È il moat che Amazon non può copiare (è locale) e
> che eBay/Glovo non hanno (è una rete di fiducia di quartiere). Le gift card sono la stessa
> idea vista dall'incasso: **soldi veri che entrano oggi** e girano nei negozi del centro, non su Amazon.
> Aggancio di piattaforma: **"Il Turno"** → *"Piacenza non è in vendita: qui il valore resta in città."*

---

## ⛔ Verità prima di tutto (cancello 🔬 — dove siamo DAVVERO)
Numeri reali (live 6/7 11:11): **1 negozio reale** (Pane Quotidiano, payout OFF) · **0 transazioni completate**
di sempre · **0 ordini pagati** · **23 profili**, **1 cliente vero** (samir) · North Star **0**, business fermo da **~12 giorni**.

**Conseguenza onesta:** una fedeltà "spendibile in tutta la rete" **oggi non ha una rete su cui girare**
(un punto guadagnato da PQ si spenderebbe… da PQ). Lanciarla ora sarebbe sforzo pesante su un'ipotesi —
viola il cancello di allocazione (AR-006: asset pesanti solo su entità `confermata` che può incassare).

**Perciò questo playbook è ARMATO, non acceso:** preparo la **meccanica completa e riusabile** + la
**comunicazione**, la accodo 🔴 per la tua firma, ma con un **gate di scala** esplicito. Nessun numero
inventato, nessuna promessa a clienti che non esistono ancora. Si accende quando la rete c'è.

**Gate di lancio (tutte e 4, altrimenti resta armato):**
1. **≥ 5 negozi reali** attivi con payout funzionante (oggi 1) — così i punti hanno *dove* essere spesi.
2. **Flusso ordini reali** avviato (almeno il ciclo end-to-end #21 chiuso: accetta→consegna→**payout-test**).
3. **Stripe write** collegato (oggi sola lettura) — serve per incassare le gift card e per i rimborsi punti.
4. **Parere legale-privacy + contabilità** su gift card (IVA buono monouso/multiuso) e trasparenza punti.

---

## PARTE A — 🎯 MyCity Punti (fedeltà spendibile su tutta la rete)

### A.1 Meccanica (semplice da spiegare a voce)
- **Nome:** *MyCity Punti* (alias "Punti di Quartiere").
- **Accumulo:** **1 punto ogni €1 speso** su *qualunque* negozio della rete. **1 punto = €0,02 di sconto**
  → cashback effettivo **2%** (default proposto; il numero finale lo fissa @finanza — vedi economia sotto).
- **Spesa:** i punti valgono **su tutta la rete**, non solo dove li hai guadagnati (è il cuore del moat).
  - **Soglia minima riscatto:** 100 punti = **€2** (evita micro-frizioni e liability polverizzata).
  - **Tetto per ordine:** i punti coprono al **massimo il 30–50% del carrello** (il resto è contante) —
    così il negozio incassa sempre una quota reale e il margine MyCity non va a zero su un singolo ordine.
- **Scadenza:** **12 mesi** dall'ultimo movimento (riduce la passività e la teniamo trasparente — obbligo Codice del Consumo).
- **Bonus onboarding:** **nessun coupon nuovo** (budget €0). Riusiamo `BENVENUTO10` già a DB. I punti si accumulano da soli.

### A.2 Chi paga i punti (il punto che fa vivere o morire il programma)
- **Il montepremi punti è a carico del MARGINE MyCity (la commissione), NON del negozio.**
  Al riscatto il **negozio incassa il valore pieno** dell'ordine; MyCity scala il valore-punti **dal proprio take**.
  → Il negoziante non teme mai che "i punti che il cliente spende da me escano dalla mia tasca". Argomento di vendita, non un freno.
- **Contabilità:** i punti emessi sono una **passività** (deferred) fino al riscatto → registro `punti_liability`
  (owner @contabilita). Alla scadenza dei punti non usati → **breakage** = ricavo.

### A.3 Economia (⚠️ impatto sistema — da validare @finanza PRIMA del lancio)
- Cashback **2%** su GMV, finanziato dal margine. Commissione MyCity = **12%** → il programma costa
  **2/12 ≈ 17% del ricavo commissioni** *sul venduto che matura punti*. Sostenibile **solo se** alza
  frequenza/scontrino abbastanza da ripagarsi. **⚠️ impatto sistema: erode il margine** — @finanza deve
  fissare il % con l'incrementale atteso (holdout), non a intuito. Leve di sicurezza già dentro: soglia,
  tetto per ordine, scadenza 12 mesi.
- **Misura (owner @analista):** gruppo di controllo (holdout) su chi *non* riceve i punti → si legge il
  **valore incrementale** (ordini in più – costo punti), non il lordo. Se non è incrementale, si spegne (STOP OKR).

### A.4 Comunicazione — Punti
- **Al cliente (claim):** *"Ogni spesa nel tuo quartiere ti fa punti. E li spendi in TUTTI i negozi MyCity."*
  Sotto-messaggio Turno: *"Il valore che crei a Piacenza, resta a Piacenza."*
- **Al negozio (1 riga):** *"I punti li mette MyCity, non tu. Quando un cliente li spende da te, tu incassi pieno."*
- **Canali (a lancio):** banner home marketplace (corsia CONFIG), scheda "I miei punti" nell'account cliente
  (corsia CODICE → frontend-dev), 1 email di annuncio ai clienti con consenso (Resend), post social (content-social).
  → **Tutti in bozza-template neutra finché il gate non è verde.**

---

## PARTE B — 🎁 Gift Card MyCity (incasso anticipato)

### B.1 Meccanica
- **Tagli:** **€10 · €25 · €50**, spendibili **su tutta la rete** MyCity (stessa logica di rete dei punti).
- **Formato:** codice digitale (email/PDF stampabile "Regala Piacenza") — zero costo fisico. Card fisica in cassa = fase 2 (designer).
- **Incasso anticipato:** MyCity **incassa subito** l'intero importo; il negozio viene pagato **solo al momento
  del riscatto**, sul venduto reale. → **cassa positiva upfront = carburante** senza debito.
- **Scadenza:** minimo di legge, dichiarata in chiaro (trasparenza Codice del Consumo). Non-usato dopo scadenza = **breakage** → ricavo.

### B.2 Legale / Fiscale (🔴 — @legale-privacy + @contabilita PRIMA di vendere)
- Le gift card MyCity sono spendibili su **categorie con IVA diverse** (pane, ristorazione, ortofrutta…) →
  quasi certamente **buono MULTIUSO** (art. 6-ter DPR 633/72): **IVA all'utilizzo**, non all'emissione. Da confermare.
  - Se fosse *monouso* (IVA nota all'emissione) → IVA subito. Il perimetro-rete spinge verso *multiuso*.
- Serve: informativa scadenza/termini d'uso, gestione rimborsabilità (di norma **non** rimborsabili in contanti),
  registro `giftcard_liability` (deferred revenue), trattamento breakage. **Owner: @contabilita + @legale-privacy.**
- **Anti-frode (@trust-safety):** limite acquisto/giorno, blocco rivendita massiva, codici a uso singolo, watch su chargeback.

### B.3 Comunicazione — Gift Card
- **Claim:** *"Regala Piacenza."* — *"Un buono che si spende nei negozi veri del centro, non su Amazon."*
- **Occasioni:** Natale, compleanni, "grazie", welfare aziendale locale (B2B: aziende che regalano ai dipendenti spesa nel centro).
- **Canali:** pagina "Gift Card" sul marketplace (frontend-dev), post social, PR locale ("il regalo che sostiene le botteghe").

### B.4 Mani tecniche (@builder-automazioni)
- Emissione = **Stripe write** (incasso) + generatore codici univoci + tabella `gift_cards` (saldo, scadenza, stato) + redemption al checkout.
- Oggi **Stripe è sola lettura** e le mani Resend sono spente → **resta armato**: niente vendita finché non c'è la mano.

---

## ✅ Cosa consegno oggi (🟢, già fatto) · ⏳ Cosa accodo (🔴, tua firma) · 🙋 Cosa serve da te
- **✅ FATTO (🟢):** questo playbook completo (meccanica + economia + legale + comunicazione), riusabile e neutro — nessun asset intestato a un negozio, nessun invio, nessun numero inventato.
- **⏳ ACCODATO (🔴):** in [[AZIONI-IN-ATTESA]] → **#28** (avvio MyCity Punti) e **#29** (avvio Gift Card). Dettaglio esteso in [[AZIONI-PRONTE]] A19–A20. Restano ARMATI dietro il gate di scala.
- **🙋 SERVE DA NICOLA (quando la rete c'è):** ① la firma sul modello economico dei punti (% e tetti, con @finanza); ② ok a chiedere il parere @legale/@contabilita sulle gift card (IVA multiuso); ③ Stripe write + mani Resend collegate (@builder); ④ il via al lancio **solo** a gate verde (≥5 negozi + ordini reali).

## 🧭 Prossimo passo concreto (coerente con la rotta reale)
Non serve decidere i punti oggi. Serve **avere una rete**: chiudere il ciclo end-to-end su Pane Quotidiano
(coda #21) e portare i primi negozi dalla shortlist dal 13/7 (coda #22/#25). **Questo playbook è il
"pronto all'uso" che si accende da solo appena quei numeri esistono** — così, quando la rete arriva, non
partiamo da zero: la leva di fidelizzazione è già scritta e firmabile in 2 minuti.
