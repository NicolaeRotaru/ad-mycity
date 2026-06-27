---
tipo: kit-mestiere
ruolo: contabilita
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-06-27 · validità fiscale finale = umana 🔴 (commercialista iscritto)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 02-Aree/Area - Pagamenti.md
---

# 🧰 KIT MESTIERE — contabilita (il "cervello allenato" del fuoriclasse)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un pro **sa e usa**
> (strati 3-6): il sapere fiscale-contabile italiano, gli strumenti passo-passo, la galleria di esempi, e il
> carburante che serve. Leggilo come la tua testa da 15 anni di studio commercialista + contabilità di
> piattaforme digitali. Bersaglio: **L7-con-giudizio** (vedi [[RUBRICA-LIVELLI]]).
>
> ⚠️ **Disclaimer di mestiere (vale SEMPRE):** questo kit ti rende un contabile da 10/10 *operativo*, ma la
> **validità fiscale finale di ogni adempimento, classificazione IVA dubbia, regime e dichiarazione è
> 🔴 umana** — la firma il commercialista iscritto/Nicola. Tu prepari esatto e audit-ready; non improvvisi
> pareri fiscali. Aliquote/soglie sotto sono quelle **note al 2026**: confermale sempre alla fonte ufficiale
> (Agenzia Entrate / il commercialista) prima di applicarle a un documento reale.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Fatturazione elettronica e SdI — come funziona DAVVERO
- **Tutto passa dal SdI** (Sistema di Interscambio dell'Agenzia delle Entrate). In Italia la fattura B2B/B2C
  è **elettronica obbligatoria**: file **XML** in formato **FatturaPA**, firmato/trasmesso al SdI, che lo
  consegna al destinatario via **Codice Destinatario** (7 caratteri) o **PEC**. Il privato senza canale →
  Codice `0000000` + l'AdE la mette nel cassetto fiscale; consegni anche una copia di cortesia (PDF) al cliente.
- **Tipi documento (campo `TipoDocumento`) che toccano MyCity:** `TD01` fattura · `TD04` **nota di credito**
  (l'unico modo corretto per stornare/correggere una fattura già emessa e trasmessa — **mai** modificare
  l'originale, è 🔴) · `TD05` nota di debito · `TD24` fattura differita · `TD16/TD17/TD18/TD19` autofattura/
  integrazione per reverse charge.
- **Numerazione progressiva e univoca** per anno, senza buchi: il SdI tiene traccia. Un salto di numero o un
  doppione è un'anomalia da controllo. Data documento ≠ data trasmissione: conta la **data documento** per la
  competenza/registri.
- **Termini di emissione:** fattura **immediata** entro **12 giorni** dall'effettuazione dell'operazione;
  **differita** entro il **15 del mese successivo** (riepilogo del mese precedente, tipica per consegne ripetute).
- **Esito SdI:** una fattura non è "emessa" finché il SdI non dà **ricevuta di consegna** (o di mancata
  consegna/impossibilità — comunque accettata). Una fattura **scartata** (notifica di scarto entro 5 gg) è
  come **non emessa**: va corretta e ritrasmessa entro 5 gg conservando la data originaria. → *Controlla sempre
  l'esito SdI: "emessa a sistema" non basta.*
- **Conservazione sostitutiva a norma** (10 anni) delle fatture XML: obbligatoria. Non è "ho il PDF su Drive".

## B. IVA sul marketplace — CHI FATTURA COSA A CHI (il cuore del mestiere MyCity)
> Questo è l'errore-killer dei principianti: confondere il **transato del cliente** con il **ricavo di MyCity**.
> Sono due fatture diverse, due soggetti diversi, due basi imponibili diverse.

- **Modello "marketplace come intermediario/vetrina" (caso MyCity tipico):**
  1. **Il NEGOZIO vende al cliente.** La vendita del bene è del negoziante: è **lui** il cedente, è **lui** che
     emette (o dovrebbe emettere) lo scontrino/fattura al cliente finale sul **prezzo pieno del prodotto**, con
     l'**IVA della sua merce** (es. alimentari **4%/10%**, altri beni **22%**). MyCity **non rivende**: incassa
     per conto del negozio e gli gira il dovuto (payout).
  2. **MyCity fattura la PROVVIGIONE al negozio.** Il ricavo imponibile di MyCity è **solo la commissione/fee**
     (es. 10-15% + fee fisse/consegna a carico negozio), su cui MyCity emette **fattura al negozio** con
     **IVA 22%** (prestazione di servizio di intermediazione). **Base imponibile MyCity = la fee, NON il GMV.**
  3. **Eventuale fee di consegna a carico del cliente:** se la incassa MyCity come proprio corrispettivo, è
     ricavo MyCity con IVA propria del servizio; se è ribaltata, attenzione a chi è il committente. → caso da
     confermare con regole reali del vault + commercialista.
- **Conseguenza operativa cruciale:** il **GMV** (transato lordo) **NON è ricavo MyCity** e **non è base IVA
  MyCity**. Il fatturato MyCity = somma delle **provvigioni**. Chi mette il GMV in dichiarazione come ricavo
  proprio sbaglia regime e IVA → disastro a un controllo.
- **Chi è responsabile dell'IVA sulla vendita al cliente?** Il negozio. MyCity deve però sapere se opera come
  **commissionario** (art. 1731 c.c. → rilevanza IVA diversa, mandato senza rappresentanza: due cessioni
  "fittizie") o come **mero intermediario su mandato con rappresentanza** (solo provvigione). **È la domanda
  fiscale n°1 da far chiarire a Nicola/commercialista** prima di impostare il ciclo attivo: cambia TUTTO.
- **Soglie e regimi che spostano l'IVA:**
  - **Reverse charge** (inversione contabile): in alcuni servizi/settori l'IVA la assolve il committente, non
    il prestatore (fattura "senza IVA" con dicitura *"inversione contabile art. 17 DPR 633/72"*). Raro tra
    MyCity e negozi italiani standard; **rileva** se ci sono fornitori esteri UE (acquisto servizi → autofattura
    TD17/TD19) o subappalti edili/pulizie — *non il caso vendite, ma da presidiare sugli acquisti MyCity*.
  - **Split payment:** l'IVA la versa direttamente il committente PA. **Rileva solo se MyCity fattura a una PA**
    (es. Comune di Piacenza per un servizio): fattura con IVA esposta ma `EsigibilitaIVA=S`, l'ente paga
    l'imponibile a te e l'IVA all'Erario. → presidialo se nascono rapporti con enti pubblici (vedi relazioni-istituzionali).
  - **Operazioni UE/extra-UE, OSS/IOSS:** se vendite a consumatori in altri Paesi UE oltre soglia 10.000€ →
    regime **OSS**. Per MyCity-Piacenza locale **oggi non rileva**, ma è da tenere d'occhio se si scala fuori provincia/online nazionale.

## C. Regimi fiscali e adempimenti (il contesto in cui emetti)
- **Regime ordinario IVA** (probabile per una SRL/piattaforma che cresce): IVA su ogni operazione, detrazione
  IVA sugli acquisti, **liquidazione IVA mensile o trimestrale**, registri IVA acquisti/vendite/corrispettivi.
- **Liquidazione IVA:** **mensile** → versamento entro il **16 del mese successivo** (F24); **trimestrale**
  (opzione, +1% interessi) → entro il **16 del 2° mese successivo** al trimestre (eccetto 4° trim. → 16/03 con saldo).
- **LIPE** (Comunicazione Liquidazioni Periodiche IVA): trimestrale, telematica.
- **Esterometro** assorbito nella **fatturazione elettronica transfrontaliera** (TD17/TD18/TD19 per operazioni
  con soggetti esteri) entro i termini SdI.
- **Forfettario** (se Nicola partisse come ditta individuale sotto **85.000€** ricavi): **niente IVA in fattura**
  (dicitura *"operazione senza IVA art. 1 c.54-89 L.190/2014"*), niente liquidazioni IVA, **imposta sostitutiva
  5%/15%**, ma **fattura elettronica comunque obbligatoria** e **bollo da 2€** sulle fatture >77,47€ senza IVA.
  → *Sapere quale regime è quello reale di MyCity è carburante n°1: cambia ogni riga del ciclo attivo.*
- **Imposta di bollo** sulle e-fatture: l'AdE calcola il dovuto trimestrale nel portale (scadenze ~ fine del
  mese successivo al trimestre); va presidiata, è una scadenza che sfugge.
- **Certificazione Unica / ritenute:** se MyCity paga compensi a rider/professionisti con ritenuta d'acconto
  (20%), versa la ritenuta (F24, 16 del mese dopo) e rilascia CU. → presidialo quando ci sono rider/freelance.

## D. Partita doppia — le basi che usi ogni giorno
- **Dare = Avere, sempre.** Ogni operazione tocca almeno 2 conti e il totale Dare = totale Avere. Se non
  bilancia, **manca un pezzo** — non forzi, lo trovi.
- **Conti che usi di più (logica, non tecnicismo):** *Banca/Stripe* (attività) · *Crediti v/clienti-negozi* ·
  *Debiti v/negozi* (i payout ancora da girare) · *Ricavi da provvigioni* (CE) · *IVA a debito* (vendite) ·
  *IVA a credito* (acquisti) · *Costi* (Stripe fee, server, marketing).
- **Esempio MyCity (ciclo attivo provvigione):** emetto fattura provvigione 100€+22% IVA al negozio →
  *Dare* Crediti v/negozio 122 · *Avere* Ricavi provvigioni 100 + IVA a debito 22. Quando il negozio "paga"
  (in pratica trattengo dal payout) → *Dare* Banca/compensazione 122 · *Avere* Crediti v/negozio 122.
- **Competenza ≠ cassa.** Un incasso del 31/05 con fattura datata 31/05 è di maggio anche se il payout/bonifico
  arriva il 3/06. La **data documento** comanda la competenza e i registri IVA; la data valuta comanda la cassa.

## E. Riconciliazione incassi ↔ payout ↔ ordini ↔ fatture (il vettore-principe)
- **Riconciliazione a QUATTRO vie**, alla stessa data: **Stripe** (charge incassato + fee + refund) ↔ **ordine**
  a sistema (Supabase `orders`: `total_price`, `payment_status`) ↔ **payout** girato al negozio ↔ **fattura**
  emessa. Le quattro devono raccontare la **stessa storia**.
- **L'equazione di un ordine sano:** `Incasso cliente (Stripe) = Prezzo prodotto + eventuale fee consegna`.
  Poi: `Payout negozio = Prezzo prodotto − provvigione MyCity − eventuali fee a suo carico`. E:
  `Ricavo MyCity = provvigione + fee proprie`. E `Stripe fee` è un **costo** che NON va confuso con la provvigione.
- **Le rotture tipiche da stanare:** incasso Stripe senza ordine corrispondente (o viceversa) · payout ≠
  (prodotto − fee) · refund non ribaltato sul negozio · `payment_status='paid'` ma nessun charge Stripe ·
  fattura provvigione mancante per un ordine concluso · Stripe fee scaricata sul negozio per errore.
- **Cassa di transito:** Stripe accumula e fa **payout aggregati** (es. ogni N giorni): un payout Stripe da
  3.560€ va **scomposto** nei singoli charge/refund/fee che lo compongono, altrimenti "torna grosso modo" ma
  non al centesimo. *Riconcilia il payout aggregato voce per voce, non il totale.*

## F. L'aggancio MyCity (dove il sapere diventa il NOSTRO)
MyCity è un **marketplace intermediario** (Amazon × eBay × Glovo, scala Piacenza): incassa per conto dei
negozi e vive di **provvigioni**, non di rivendita. Quindi: **il GMV non è ricavo nostro**, la **fee è la
nostra base IVA**, ogni payout è un **debito v/negozio** da quadrare al centesimo, e ogni provvigione è una
**fattura B2B al negozio** via SdI. La verità dei movimenti sta in **Stripe** (read-only); i documenti e le
scadenze sono il nostro presidio di **conformità audit-ready**. Metro: *«reggerebbe a un controllo dell'Agenzia delle Entrate?»*.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — CHECKLIST emissione/controllo FATTURA (una ❌ = non si emette/non si valida)
- [ ] **Soggetti corretti:** cedente/prestatore = MyCity (P.IVA, regime); cessionario/committente = il negozio
  (P.IVA, Codice Destinatario/PEC, anagrafica fiscale **reale**, non placeholder).
- [ ] **Tipo documento giusto** (`TD01` fattura · `TD04` nota di credito per storni — **mai** modificare l'originale).
- [ ] **Numero progressivo** univoco, senza buchi/doppioni, anno corrente; **data documento** corretta (competenza).
- [ ] **Base imponibile = provvigione/fee reale** (NON il GMV/transato), legata all'ordine/periodo verificabile.
- [ ] **Aliquota IVA giusta** (provvigione = **22%**) o **natura** corretta se non imponibile/reverse/forfettario
  (con dicitura di legge esatta); **bollo 2€** se senza IVA e >77,47€.
- [ ] **Quadratura interna:** imponibile × aliquota = IVA; imponibile + IVA = totale (al centesimo).
- [ ] **Esito SdI verificato** (consegnata / mancata consegna accettata; **non** scartata). "A sistema" ≠ "emessa".
- [ ] **Conservazione a norma** prevista. → *Se manca un dato fiscale reale: STOP, è carburante, non si inventa.*

## TOOL 2 — Procedura di QUADRATURA a 4 vie (incassi ↔ payout ↔ ordini ↔ fatture)
1. **Estrai il perimetro** (periodo: es. mese): da Stripe charge/refund/fee/payout; da Supabase `orders` (paid).
2. **Aggancia 1:1** ogni charge Stripe al suo ordine (per importo+data+id). Marca gli **orfani** da entrambi i lati.
3. **Scomponi ogni payout aggregato** Stripe nei suoi charge−refund−fee: il payout deve = somma dei componenti.
4. **Verifica l'equazione** per ordine: incasso = prodotto(+fee); payout negozio = prodotto − provvigione − fee a suo carico.
5. **Aggancia la fattura provvigione** a ogni ordine concluso: ordine senza fattura provvigione = **documento mancante**.
6. **Bilancia Dare=Avere** sul prospetto; **ogni delta ha una riga di spiegazione** (no arrotondamenti tappabuchi).
7. **Attacco avversariale:** "se ci fosse un incasso senza fattura, un refund non ribaltato, un payout doppio,
   un'IVA sul lordo — lo vedrei? cosa NON sto controllando?".
8. **Consegna** il prospetto con **mancanti/anomalie IN CIMA**, importi separati imponibile/IVA, periodo, fonte, confidenza %.

## TOOL 3 — Calcolo IVA (le formule che NON sbagli mai)
- **Scorporo dal lordo** (ho il totale, voglio imponibile e IVA):
  `Imponibile = Lordo / (1 + aliquota)` · `IVA = Lordo − Imponibile`. Es. lordo 122 @22% → imponibile **100**, IVA **22**.
  ❌ Errore-killer: `IVA = Lordo × 22%` (122×0,22 = 26,84 → **sbagliato**, calcola l'IVA sull'IVA).
- **Aggiunta IVA** (ho l'imponibile): `IVA = Imponibile × aliquota` · `Lordo = Imponibile × (1+aliquota)`.
- **Aliquote 2026 (da confermare):** ordinaria **22%** · ridotte **10%** / **5%** / **4%** (beni alimentari/
  prima necessità). La **provvigione MyCity** (servizio) = **22%**. La **merce del negozio** segue l'aliquota
  della merce → *non è IVA tua, ma sappi distinguerla nella riconciliazione.*
- **Liquidazione periodo:** `IVA a debito (vendite) − IVA a credito (acquisti) = IVA da versare` (se >0; se <0 credito a riporto).
- **Arrotondamento:** al **centesimo** per riga e per documento; non accumulare errori di arrotondamento tra righe.

## TOOL 4 — CHECKLIST CHIUSURA MESE (riproducibile, a prova di controllo)
- [ ] **Tutti gli ordini paid** del mese hanno **charge Stripe** riconciliato (orfani azzerati o spiegati).
- [ ] **Tutti i payout** del mese scomposti e riconciliati (totale = componenti).
- [ ] **Tutte le provvigioni** fatturate (zero ordini conclusi senza fattura); **esiti SdI** tutti ok.
- [ ] **Refund/dispute** ribaltati correttamente (sul negozio se dovuto) e con nota di credito dove serve.
- [ ] **Competenza temporale:** operazioni a cavallo mese imputate al periodo della **data documento**.
- [ ] **Liquidazione IVA** calcolata (debito − credito) e **scadenza** annotata (16 del mese/2° mese succ.).
- [ ] **Dare = Avere** al centesimo; **prima nota** completa; **anomalie in cima** al prospetto.
- [ ] **Esito scritto** in `memoria-squadra/contabilita.md` (loop chiuso: il mese che chiude pulito è il tuo numero).

## TOOL 5 — REGISTRO ADEMPIMENTI / scadenziario (anticipa, non rincorrere)
| Adempimento | Cadenza | Scadenza tipica | Note |
|---|---|---|---|
| Liquidazione + versamento IVA (mensile) | Mensile | **16 del mese succ.** (F24) | o trimestrale 16 del 2° mese succ. (+1%) |
| LIPE (liquidazioni periodiche) | Trimestrale | telematica, ~fine 2° mese succ. | |
| Imposta di bollo e-fatture | Trimestrale | calcolata dal portale AdE | sfugge facile: presidiala |
| Ritenute d'acconto (rider/freelance) | Mensile | **16 del mese succ.** (F24) | + CU annuale |
| Fattura elettronica transfrontaliera | Per operazione | termini SdI | TD17/18/19 |
| Dichiarazione IVA annuale | Annuale | entro 30/04 | 🔴 firma commercialista |
| CU / 770 | Annuale | mar/ott | se ci sono compensi/ritenute |
> Regola: ogni scadenza entra **prima** in `AZIONI-IN-ATTESA.md` con la data; gli **adempimenti ufficiali sono 🔴** (firma Nicola/commercialista).

## TOOL 6 — Protocollo NOTA DI CREDITO (l'unico modo di correggere)
1. Una fattura **già trasmessa al SdI** non si modifica e non si cancella: si storna con **nota di credito TD04**.
2. Compila la NC riferita alla fattura originale (numero+data), importo da stornare, stessa IVA/natura.
3. Se serve, **riemetti** la fattura corretta (nuovo numero). 4. Riconcilia: originale + NC + nuova devono quadrare.
5. **È 🔴/🟡:** prepara completa, NON trasmettere finché Nicola non firma. Post-mortem senza colpa sul perché dell'errore.

## TOOL 7 — Riflesso diagnostico PRE-consegna (5 domande, sempre)
1. Ogni movimento ha il suo **documento** (e viceversa)? 2. L'**IVA** è sull'imponibile giusto, aliquota/natura corretta?
3. Le **4 vie riconciliano** (Stripe↔ordine↔payout↔fattura) alla **stessa data**? 4. C'è una **scadenza** in arrivo da segnalare?
5. Sto usando le **regole reali** commissioni/IVA/regime del vault, non una mia assunzione?
→ Manca un documento o un importo non quadra: **fermati e alza la mano SUBITO** (🟢). Non chiudere un mese con un buco, non "stimare" ciò che dev'essere esatto.

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10 = quadra + conforme)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY.

## QUADRATURA / CHIUSURA MESE
- ✅ **GOLD:** *"Chiusura mag: 148 ordini paid, 148 charge Stripe riconciliati, payout aggregati (3) scomposti
  e quadrati al centesimo. Provvigioni: 146/148 fatturate → ⚠️ 2 ordini conclusi SENZA fattura provvigione
  (#312, #340; imponibile 58,20€ + IVA 22% = 71,00€) IN CIMA da sanare. 1 refund (#301) ribaltato sul negozio
  con NC pronta. Liquidazione IVA: debito 1.240€ − credito 310€ = 930€ da versare, scadenza **16/06**.
  Dare=Avere ✓. Confidenza riconciliazione 100% (da Stripe); classificazione fee consegna 70% → confermare regola."*
  *Perché:* 4 vie, IVA scorporata, mancanti in cima, scadenza anticipata, confidenza dichiarata, ciò che è fuori
  cerchio segnalato. *MyCity:* fa quadrare GMV vs provvigione senza confonderli.
- ❌ **SPAZZATURA:** *"Ho controllato le fatture, sembra tutto a posto, l'IVA è circa il 22% del totale incassato."*
  *Perché muore:* "sembra/circa" (in contabilità sono errori) · IVA sul **totale** invece che sull'imponibile ·
  IVA calcolata sul **GMV** (non è ricavo MyCity!) · nessuna riconciliazione · mancanti non cercati.

## FATTURA
- ✅ **GOLD:** fattura provvigione `TD01` n.2026/214 al negozio (P.IVA reale, Cod.Dest.), imponibile = **fee
  reale dell'ordine #318** (non il prezzo prodotto), IVA 22% scorporabile, esito SdI = consegnata, conservata.
  *Perché:* base imponibile giusta (provvigione, non GMV), soggetti reali, esito SdI verificato.
- ❌ **SPAZZATURA — fattura non emessa:** ordine #340 concluso e incassato a maggio, payout girato, **nessuna
  fattura provvigione**. *Perché è grave:* incasso/ricavo senza documento = anomalia fiscale, non un "dopo".
- ❌ **SPAZZATURA — base sbagliata:** fattura che espone come imponibile MyCity **l'intero prezzo del prodotto**
  (GMV) invece della sola provvigione. *Perché è grave:* sovrastima ricavi e IVA a debito, regime errato → controllo.
- ❌ **SPAZZATURA — correzione illegale:** fattura già trasmessa "modificata" a mano invece che stornata con
  **nota di credito**. *Perché è grave:* il SdI ha già l'originale; è 🔴, espone a sanzione.

## PAYOUT / RICONCILIAZIONE
- ✅ **GOLD:** payout Stripe aggregato 3.560€ **scomposto** in 47 charge − 2 refund − fee Stripe, ognuno
  agganciato all'ordine; `payout negozio = prodotto − provvigione − fee a suo carico` verificato per ciascuno.
  *Perché:* riconcilia il payout **voce per voce**, non il totale.
- ❌ **SPAZZATURA — payout non riconciliato:** "il payout di 3.560€ torna grosso modo col venduto del mese".
  *Perché muore:* "grosso modo" non esiste; un refund non ribaltato o una Stripe fee scambiata per provvigione si
  nasconde proprio nel "grosso modo".

## 🏆 Pattern vincenti distillati
GMV ≠ ricavo MyCity (provvigione = base) · ogni movimento ha il suo documento · IVA si **scorpora** dal lordo, mai
sul totale · payout aggregato scomposto voce per voce · competenza = data documento · mancanti SEMPRE in cima ·
nota di credito (non modifica) per correggere · scadenza anticipata, non rincorsa · confidenza % + ciò che è fuori cerchio → umano.
## 🚩 Red flags (uccidi a vista)
"sembra / circa / torna grosso modo" · IVA sul lordo o sul GMV · incasso senza fattura (o viceversa) · payout non
scomposto · fattura modificata invece che stornata · base imponibile = prezzo prodotto invece che provvigione ·
Stripe fee confusa con provvigione · scadenza scoperta tardi · quadratura forzata con arrotondamenti · adempimento ufficiale eseguito senza firma (🔴).

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, dove si innesta)
> Senza questo il kit è un fuoriclasse a mani vuote: produce ottime *strutture* di quadratura ma con
> segnaposto. Una fattura va emessa **esatta o non va emessa**. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Regime fiscale reale di MyCity** (SRL ordinaria? forfettario? P.IVA, regime IVA mensile/trimestrale) | imposta ogni riga del ciclo attivo, dicitura, liquidazione | Sapere C, Tool 1, Tool 5 |
| **Modello giuridico del marketplace** (intermediario con/senza rappresentanza? commissionario?) | decide CHI fattura cosa a chi, base IVA, autofatture | Sapere B (domanda fiscale n°1) |
| **Regole reali commissioni/fee/payout** (`02-Aree/Area - Pagamenti.md`) | base imponibile provvigione, equazione payout | Sapere B/E, Tool 1, Tool 2 |
| **Accesso read Stripe** (charge/payout/fee/refund/dispute) = la **verità** sui movimenti | riconciliazione a 4 vie | Tool 2, Galleria |
| **Supabase `orders`** (`total_price`, `payment_status`, date, dati venditore) | aggancio ordine↔charge↔fattura | Tool 2 |
| **Anagrafiche fiscali venditori** (P.IVA, Cod.Destinatario/PEC, aliquote merce) | fatturare corretto, non con placeholder | Tool 1 |
| **Calendario scadenze + canale SdI** (provider e-fattura, conservazione) | scadenziario, emissione, esiti | Tool 5, Tool 1 |
| **Aliquote/soglie 2026 confermate** (AdE/commercialista) | IVA esatta, regimi | Tool 3, disclaimer |

Finché manca, **NON inventare e NON consegnare un compromesso**: usa segnaposto chiari, alza la mano e chiedi
il carburante a Nicola. **La validità fiscale finale resta 🔴 umana** (commercialista iscritto): tu prepari
audit-ready, lui firma.

---
*Manutenzione: questo kit è vivo. A ogni chiusura mese aggiorna la Galleria (nuovo gold/spazzatura col perché) e
la memoria `memoria-squadra/contabilita.md`. Quando cambia un regime, un'aliquota o una regola commissioni,
aggiorna lo Strato 3 e segnala l'impatto. RIASSUMI/POTA mensile: resta denso e affilato.*
