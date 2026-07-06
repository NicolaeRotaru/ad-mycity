---
tipo: kit-mestiere
ruolo: fiscalista-iva-ecommerce
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso — fatturato cumulato intra-UE, stato P.IVA venditori, conferma paesi di spedizione
collegato: [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — fiscalista-iva-ecommerce (il "cervello allenato" del tax advisor IVA e-commerce)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un tax advisor IVA
> di marketplace **sa e usa** (strati 3-6): la mappa della territorialità, gli strumenti passo-passo, la
> galleria di qualificazioni gold/spazzatura, e il carburante che serve. Bersaglio: **L7-con-giudizio**
> ([[RUBRICA-LIVELLI]]). Oggi MyCity è un marketplace locale a Piacenza: la maggior parte degli scenari
> reali resta IVA italiana ordinaria — questo kit serve a riconoscere **il momento esatto** in cui smette
> di esserlo, prima che diventi una sanzione.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Le tre categorie di scenario (mai trattarle come una sola)
- **Nazionale (IT→IT).** Negozio italiano, cliente italiano, merce che non lascia l'Italia: IVA italiana
  ordinaria (aliquota di prodotto, tipicamente 22% salvo beni con aliquota agevolata). Nessuna territorialità
  UE in gioco, **anche se** la spedizione attraversa più regioni (Piacenza→Milano resta IT→IT).
- **Vendita a distanza intra-UE B2C.** Negozio in uno stato membro (es. Italia), cliente privato in un
  **altro** stato membro (es. Francia): sopra la soglia di 10.000€/anno cumulata, l'IVA si applica nel
  paese del **cliente**, non del venditore. È qui che entrano OSS e le aliquote estere.
- **Import da extra-UE (vendite a distanza di beni importati).** Merce che entra in UE da un paese terzo:
  sotto i 150€ di valore intrinseco per spedizione si applica il regime IOSS (niente dazio doganale, IVA
  dovuta al consumo, semplificazione doganale); sopra i 150€, regime di importazione ordinario con dogana e
  possibile dazio.
> La domanda-guida non è "dove è il cliente" da sola, ma **le 4 domande insieme**: chi vende, a chi, da
> dove-a dove parte/arriva la merce, quanto vale l'operazione cumulata nell'anno (Sapere B).

## B. La soglia UE 10.000€ (il numero che tutti sbagliano)
- È una soglia **unica, cumulata a livello UE**, non per singolo stato membro: somma **tutte** le vendite a
  distanza intra-UE B2C **più** le prestazioni di servizi elettronici/telecomunicazione/radiotelevisivi
  (TBE) B2C rese a consumatori di altri stati membri, nell'anno solare (corrente + precedente).
- **Sotto soglia:** il venditore applica l'IVA del **proprio** paese (Italia) su tutte le vendite intra-UE,
  come se fossero nazionali — nessun obbligo OSS, salvo opzione volontaria.
- **Sopra soglia (o per opzione):** l'IVA si applica nel paese di **destinazione** (del cliente), con
  l'aliquota di quel paese. A quel punto servono: (a) registrazione IVA diretta in ogni stato di
  destinazione, oppure (b) l'**OSS** (Sapere C) per dichiarare tutto in un'unica dichiarazione trimestrale.
- **Verifica il dato, non l'abitudine:** "siamo piccoli" non è una verifica — chiedi sempre il fatturato
  cumulato intra-UE reale a @finanza/@contabilita prima di qualificare uno scenario come "sotto soglia".

## C. OSS — One Stop Shop (regime UE, dal 2021)
- Regime **opzionale** che permette di dichiarare e versare in un'unica dichiarazione trimestrale, nello
  stato membro di identificazione (tipicamente l'Italia per un venditore italiano), l'IVA dovuta su **tutte**
  le vendite a distanza intra-UE B2C e alcune prestazioni di servizi B2C rese in altri stati membri.
- Evita la registrazione IVA diretta in ogni singolo paese di destinazione: un solo portale, una sola
  dichiarazione, ma le aliquote applicate restano quelle del **paese del cliente** (non italiane).
- Copre la vendita **del prodotto** fatta dal venditore/negozio al cliente finale — non la commissione di
  intermediazione che il marketplace fattura al negozio (quella resta sempre IVA italiana B2B, Sapere H).
- **Non serve se:** tutte le vendite restano sotto la soglia di 10.000€ e il venditore non ha optato
  volontariamente per l'applicazione dell'IVA di destinazione.

## D. IOSS — Import One Stop Shop (merce da extra-UE, basso valore)
- Si applica alle vendite a distanza di beni **importati da un paese extra-UE** con valore intrinseco
  **≤150€ per spedizione**, venduti a consumatori UE: l'IVA viene applicata al momento della vendita
  (non allo sdoganamento), semplificando l'import e azzerando il dazio doganale su queste spedizioni.
- Sopra i 150€: niente IOSS, si applica il regime di importazione ordinario (dogana, possibile dazio,
  IVA all'importazione secondo le regole standard).
- Per MyCity oggi: rilevante **solo** se un negozio importa prodotti da fornitori extra-UE per rivenderli
  a distanza a clienti finali — non riguarda le vendite locali di prodotti già in Italia/UE.

## E. Marketplace "facilitatore" / deemed supplier (il rischio che cambia il debitore d'imposta)
- Dal pacchetto UE e-commerce (2021): una piattaforma che **facilita elettronicamente** una vendita
  (definisce termini e condizioni, autorizza l'addebito al cliente, o interviene nella consegna/ordine
  della merce) **diventa essa stessa il fornitore ai fini IVA (deemed supplier)** in due casi:
  1. vendite a distanza di beni importati da extra-UE con valore ≤150€, facilitate dalla piattaforma;
  2. vendite B2C **di un venditore extra-UE stabilito nella UE**, facilitate dalla piattaforma.
- In questi casi il marketplace fattura al cliente finale, applica e versa l'IVA — **il negozio "reale"
  esce dall'equazione IVA** per quella specifica vendita (riceve solo il netto/la sua parte concordata).
- **Test pratico:** MyCity autorizza l'addebito al cliente? Fissa termini e condizioni della vendita?
  Interviene nella logistica/consegna? Se sì a una di queste, per gli scenari (1)/(2) sopra, il rischio di
  status "facilitatore" è concreto e va segnalato — non lo si scopre dopo un accertamento.
- Per MyCity oggi (negozi italiani, vendite locali): lo scenario non è ancora attivo, ma va **rivalutato**
  a ogni apertura a nuove categorie di venditori (extra-UE) o nuovi canali di spedizione.

## F. Split payment (scissione dei pagamenti) — solo Pubblica Amministrazione
- Meccanismo (art. 17-ter DPR 633/72) per cui, nelle cessioni/prestazioni verso **enti pubblici** (PA,
  Comuni, enti locali, società controllate), il cliente pubblico versa l'IVA **direttamente all'erario**
  invece che al fornitore, che riceve solo l'imponibile.
- **Non si applica mai** a un cliente privato o a un'impresa B2B ordinaria: è un errore da riflesso
  applicarlo fuori dal perimetro PA — non farlo mai "per prudenza".
- Rilevanza attuale per MyCity: **bassa/nulla** finché il marketplace vende solo a consumatori privati;
  da monitorare se emerge un contratto/fornitura verso un ente pubblico (es. bando del Comune di Piacenza).

## G. DAC7 — l'obbligo di reporting del facilitatore digitale (dal 2023)
- Direttiva UE 2021/514, recepita in Italia: gli **operatori di piattaforme digitali** (marketplace inclusi)
  devono raccogliere e comunicare all'Agenzia delle Entrate i dati fiscali dei venditori che usano la
  piattaforma, quando superano **30 transazioni O 2.000€** di corrispettivo nell'anno solare.
- Dati richiesti: identificativo fiscale (CF/P.IVA), IBAN, importi delle transazioni, eventuale numero di
  immobili intermediati (se rilevante per la categoria). Scadenza: comunicazione annuale entro **gennaio**
  dell'anno successivo a quello di riferimento.
- Questo obbligo è **indipendente** da chi emette la fattura al cliente finale (negozio o marketplace): è
  un obbligo del **facilitatore in quanto tale**, distinto dal deemed supplier (Sapere E).
- Per MyCity: da monitorare per OGNI negozio attivo che si avvicina alle soglie — è un obbligo strutturale
  della piattaforma, non un caso raro.

## H. Chi fattura cosa (non confondere i due piani IVA)
- **Fattura del negozio al cliente finale** (vendita del prodotto): segue la territorialità del **bene**
  (Sapere A-E) — IVA italiana, IVA di destinazione via OSS, o IVA del marketplace se deemed supplier.
- **Fattura di MyCity al negozio** (commissione di intermediazione/fee di servizio): è un servizio B2B reso
  da un soggetto italiano a un soggetto italiano (o UE) — segue le regole ordinarie di territorialità dei
  servizi B2B (in generale, IVA nel paese del committente), **quasi sempre IVA italiana 22%** se il negozio
  è italiano, **indipendentemente** da dove venda il prodotto il negozio stesso. I due piani non si mescolano.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Le 4 domande (qualificazione di ogni scenario, in ordine)
```
1) CHI VENDE?        negozio IT / negozio UE non-IT / venditore extra-UE stabilito UE / venditore extra-UE puro
2) A CHI?             consumatore privato (B2C) / impresa (B2B) / ente pubblico (PA → split payment, Sapere F)
3) DA DOVE A DOVE?    stesso stato / intra-UE (stati diversi) / import da extra-UE (≤150€ o >150€)
4) QUANTO (cumulato)? fatturato annuo vendite intra-UE cumulato: sotto o sopra 10.000€?
→ ESITO: Nazionale IT / Intra-UE sotto soglia (IVA IT) / Intra-UE sopra soglia (OSS, IVA destinazione) /
  Import ≤150€ (IOSS) / Import >150€ (dogana ordinaria) / possibile deemed supplier (Sapere E, verifica separata)
```

## TOOL 2 — Matrice "chi è responsabile dell'IVA" (per scenario)
| Scenario | Chi fattura il cliente | Chi versa l'IVA | Serve OSS/IOSS? |
|---|---|---|---|
| IT→IT (nazionale) | negozio | negozio | no |
| Intra-UE, sotto soglia 10.000€ | negozio | negozio (IVA italiana) | no |
| Intra-UE, sopra soglia (o opzione) | negozio | negozio (IVA di destinazione) | sì, OSS |
| Import extra-UE ≤150€, facilitato dal marketplace | **marketplace** (deemed supplier) | **marketplace** | sì, IOSS lato marketplace |
| Import extra-UE ≤150€, NON facilitato | venditore | venditore | sì, IOSS lato venditore |
| Import extra-UE >150€ | venditore/importatore | dogana + venditore | no (regime import ordinario) |
| Venditore extra-UE stabilito in UE, facilitato | **marketplace** (deemed supplier) | **marketplace** | dipende dal caso |
| Vendita a ente pubblico (PA) | negozio | **PA** (split payment) | no (non c'entra con OSS) |
> "Facilitato" = il marketplace autorizza l'addebito, fissa termini, o interviene nella consegna (Sapere E).

## TOOL 3 — Checklist soglie da monitorare (passa ogni voce a ogni verifica)
- [ ] **Fatturato cumulato vendite intra-UE** (anno corrente + precedente) vs soglia 10.000€ — dato da @finanza/@contabilita.
- [ ] **Transazioni/importo per venditore** vs soglie DAC7 (30 transazioni o 2.000€/anno) — per OGNI negozio attivo.
- [ ] **Presenza di venditori extra-UE o extra-UE stabiliti in UE** sulla piattaforma (oggi: verificare, non presumere di no).
- [ ] **Il marketplace processa il pagamento per conto del negozio?** (rilevante per lo status di "interfaccia elettronica").
- [ ] **Spedizioni verso l'estero attive o programmate** (oggi: verificare con vendite/onboarding-negozi).
- [ ] **Clienti-PA in corso o in trattativa** (bandi, forniture al Comune) → split payment da attivare.
> Ogni "sì" o "non so" su una voce → qualificazione dello scenario (Tool 1) prima di procedere, non dopo.

## TOOL 4 — Template di RISCHIO SANZIONE (probabilità × impatto)
```
OBBLIGO: [OSS / IOSS / DAC7 / split payment / deemed supplier]
STATO ATTUALE: [attivo / non attivo / da verificare]
TRIGGER (cosa lo farebbe scattare): [es. superamento soglia 10.000€, nuovo venditore extra-UE, nuovo cliente PA]
DISTANZA DAL TRIGGER: [es. fatturato intra-UE attuale € vs soglia 10.000€ → margine €]
IMPATTO SE OMESSO: [sanzione amministrativa stimata come benchmark generico, non cifra MyCity] + rischio reputazionale/accertamento
AZIONE: [monitorare / preparare dossier 🟡 / accodare adempimento 🔴 con firma professionista]
```

## TOOL 5 — Riflesso DIAGNOSTICO (5 domande, prima di qualificare qualunque scenario)
1. Nazionale, intra-UE o import extra-UE? 2. Fatturato cumulato sopra o sotto 10.000€ (dato reale, non stima)?
3. Il marketplace sta facilitando in un modo che lo rende deemed supplier? 4. Cliente privato o PA (split payment)?
5. Questo venditore è vicino/sopra le soglie DAC7? → Se un dato manca, fermati e procuralo prima di qualificare.

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto/benchmark generico, non dati MyCity reali.

## QUALIFICAZIONE TERRITORIALITÀ
- ✅ **GOLD:** *"Cliente privato di Barcellona ordina 60€ da un negozio di Piacenza, spedizione diretta.
  È vendita a distanza intra-UE B2C. Fatturato cumulato intra-UE MyCity anno corrente: [DA VERIFICARE
  @contabilita]. Se sotto 10.000€ → IVA italiana 22%, nessun obbligo; se sopra → serve OSS e IVA spagnola
  (21%). Il marketplace non è deemed supplier (venditore UE, no import ≤150€). Confidenza 85% (soglia da
  confermare sul dato reale). Bozza istruttoria — validazione: professionista abilitato."* — **Perché:**
  4 domande esplicite, soglia trattata come dato da verificare (non assunta), ruolo marketplace chiarito.
- ❌ **SPAZZATURA:** *"Vendiamo anche fuori Piacenza, quindi dobbiamo fare l'OSS."* — **Perché muore:**
  confonde interregionale con transfrontaliero (Cremona non è oltreconfine), non verifica la soglia
  cumulata, non distingue nazionale da intra-UE: allarme a vanvera, zero analisi.

## DEEMED SUPPLIER
- ✅ **GOLD:** *"Oggi MyCity NON è deemed supplier: tutti i negozi attivi sono italiani, nessuna vendita
  di beni importati da extra-UE ≤150€ facilitata. Se in futuro si aprisse a un venditore extra-UE stabilito
  in UE, o a import diretto da fornitori extra-UE, il test (autorizziamo l'addebito? fissiamo i termini?
  interveniamo nella consegna?) andrebbe rifatto — lo segnalo come trigger da monitorare in
  MyCity-Vault/90-Memoria-AI/DECISIONI.md."* — **Perché:** verifica lo stato attuale sul dato reale, non
  lo dà per scontato, e mette un trigger di rivalutazione futura (foresight).
- ❌ **SPAZZATURA:** *"Siamo solo un marketplace locale, l'IVA sui beni importati non ci riguarda."* —
  **Perché muore:** afferma senza verificare (nessun test sui negozi/venditori reali), e non prevede il
  momento in cui potrebbe non essere più vero.

## DAC7 / SOGLIE
- ✅ **GOLD:** *"Verifica soglie DAC7 [periodo]: nessun negozio attivo risulta oggi sopra 30 transazioni o
  2.000€ cumulati (dato da confermare con @contabilita/@analista). Il negozio più vicino è a [X]% della
  soglia transazioni. Nessun obbligo di comunicazione scatta oggi; monitoraggio trimestrale consigliato man
  mano che i negozi crescono."* — **Perché:** soglia verificata per OGNI venditore, non "in generale", con
  distanza quantificata e ritmo di verifica proposto.
- ❌ **SPAZZATURA:** *"Siamo piccoli, DAC7 non ci tocca ancora."* — **Perché muore:** nessuna verifica per
  singolo venditore, nessuna soglia citata, nessun piano di monitoraggio: è un'assunzione, non un controllo.

## 🏆 Pattern vincenti (regole trasversali)
Le 4 domande prima di qualificare qualunque scenario · soglia 10.000€ sempre cumulata, mai per singolo
paese · nazionale ≠ transfrontaliero (regione vs stato UE) · split payment SOLO per PA · deemed supplier
verificato col test (addebito/termini/consegna), non presunto · DAC7 monitorato per OGNI venditore, non
"in generale" · commissione MyCity (B2B, IVA italiana) sempre separata dall'IVA della vendita del prodotto
· ogni bozza marcata "da validare da un professionista abilitato" · ogni soglia/aliquota riconfermata (WebSearch).

## 🚩 Red flags (uccidi a vista)
"Fuori città" scambiato per "fuori stato UE" · soglia 10.000€ trattata come per-paese · split payment
applicato a un cliente privato "per prudenza" · deemed supplier scartato senza fare il test · DAC7
ignorato perché "siamo piccoli" senza verificare le soglie per venditore · aliquota/soglia citata a memoria
senza riconferma · qualificazione senza sapere da dove parte/arriva davvero la merce · nessuna nota di
validazione professionale su una bozza che tocca un adempimento reale.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un tax advisor a mani vuote: ottime *strutture*, ma con segnaposto. Una qualificazione
> di territorialità su dati inventati è **peggio** di nessuna qualificazione. Ecco ESATTAMENTE cosa serve:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Fatturato cumulato vendite intra-UE** (anno corrente+precedente, da @finanza/@contabilita) | verificare la soglia 10.000€ sul dato reale | Sapere B, Tool 1, Tool 3 |
| **Elenco negozi con P.IVA/CF e stato di stabilimento** (IT/UE/extra-UE) | Tool 1 (chi vende), test deemed supplier | Sapere A, E, Tool 2 |
| **Transazioni/importo per venditore** (da Supabase `orders`) | monitoraggio soglie DAC7 per ogni negozio | Sapere G, Tool 3 |
| **Conferma se MyCity spedisce/spedirà fuori Italia** (da vendite/onboarding-negozi) | attivare o no l'analisi intra-UE | Sapere A, C |
| **Come il marketplace processa i pagamenti** (per conto negozio o no) | test "interfaccia elettronica"/deemed supplier | Sapere E, Tool 2 |
| **Stato di un'eventuale registrazione OSS/IOSS** già attiva | evitare doppio lavoro, sapere il regime corrente | Sapere C, D |
| **Soglie/aliquote UE correnti riconfermate** (WebSearch, non a memoria) | ogni qualificazione | Tutti gli strati |
| **Professionista abilitato** per ogni adempimento reale | validazione finale, firma | Tutte le bozze 🔴 |

**Confine 🔴 invalicabile:** ogni registrazione OSS/IOSS, comunicazione DAC7, dichiarazione IVA
transfrontaliera o adempimento ufficiale verso l'Agenzia delle Entrate/un'autorità fiscale estera si
**propone e si accoda** in [[AZIONI-IN-ATTESA]] — **mai si esegue** senza firma di Nicola **e** validazione
di un professionista abilitato. Finché manca un dato reale (fatturato cumulato, stato dei venditori), dillo
come "carburante" e usa segnaposto chiari: **non qualificare una territorialità che non regge a un controllo.**

---
*Manutenzione: kit vivo. Ogni volta che una soglia si avvicina (10.000€, DAC7) o un negozio extra-UE entra
in pipeline, aggiorna la matrice (Tool 2) e la checklist (Tool 3), aggiungi il caso alla Galleria col
perché, e scrivi l'esito in `memoria-squadra/fiscalista-iva-ecommerce.md`. RIASSUMI/POTA mensile: resta
denso e affilato.*
