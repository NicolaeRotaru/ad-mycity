---
tipo: kit-mestiere
ruolo: new-verticals
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: segnali di domanda locale + vincoli operativi rider-fleet/dispatch
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — new-verticals (il "cervello allenato" del lancio 0-to-1 di categoria)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un New Verticals
> Lead di un q-commerce/marketplace **sa e usa** (strati 3-6): il framework di business case, il toolkit
> passo-passo, la galleria gold/spazzatura, il carburante che serve. Bersaglio: **L7-con-giudizio**
> ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. 0-to-1 vs merchandising — la linea che decide chi fa cosa
Una **nuova verticale** è un business che a Piacenza su MyCity **non esiste ancora**: nuovo tipo di offerta
(farmacia, grocery), nuova operatività (SLA diversi, freddo, licenze), nuovi negozi da un settore mai
rappresentato. Un **ampliamento di catalogo** dentro una categoria già viva (più fiorai, più prodotti gastronomia)
è merchandising: assortimento, profondità di gamma, margine — è @category-manager, non new-verticals. La
domanda-filtro: *"se sparissi io, la categoria smetterebbe di esistere, o solo di crescere?"* — se la risposta
è "smetterebbe di esistere", sei tu.

## B. TAM/SAM/SOM locale + Minimum Viable Vertical (MVV)
- **TAM/SAM/SOM a scala di città**, non nazionale: TAM = spesa totale della categoria a Piacenza (proxy: dati
  ISTAT/Camera di Commercio locali, o assunzione dichiarata); SAM = quella spesa raggiungibile da consegna
  locale nel raggio operativo attuale; SOM = quota realistica nei primi 6-12 mesi con 1-3 negozi-ancora.
  Ogni cifra ha **fonte o etichetta "assunzione"** — mai un TAM nazionale spacciato per Piacenza.
- **MVV (Minimum Viable Vertical)**: la versione più piccola del business che basta a testare l'ipotesi di
  domanda e operatività. Non "tutta la farmacia di Piacenza online": **1 farmacia-ancora, OTC/parafarmaco
  senza obbligo di ricetta, SLA di consegna standard**. Il MVV si allarga solo dopo che il test regge.
- **Perché il MVV batte il "big bang"**: ogni vincolo aggiunto al giorno 1 (catena del freddo, dark store,
  licenze multiple) è un punto di fallimento in più prima ancora di sapere se la domanda c'è.

## C. Cold-start / chicken-and-egg e strategia anchor-seller
- Un marketplace nuovo in una categoria ha il problema classico: **pochi negozi → pochi clienti → pochi
  negozi**. Si rompe **dal lato offerta**, non dalla pubblicità: un'ancora forte e affidabile crea la fiducia
  che attira i clienti, che poi attira altri negozi.
- **Criteri di un buon negozio-ancora**: reputazione locale reale (non solo disponibile, anche *credibile*),
  disponibilità operativa a partire subito, assortimento rappresentativo della categoria, titolare motivato a
  fare il primo passo (non tirato per un braccio). **1 ancora forte batte 10 negozi tiepidi.**
- **Errore classico**: reclutare tanti negozi deboli per "sembrare che la categoria è viva" — la categoria
  sembra piena ma nessuno consegna bene, il primo cliente ha un'esperienza pessima e la verticale muore di
  reputazione prima ancora di scalare.

## D. Modello operativo per verticale — i vincoli non sono uguali per tutte
| Verticale | Vincolo operativo principale | Chi lo regge oggi |
|---|---|---|
| **Grocery** | Deperibile/freddo, scontrino più alto, assortimento ampio | @rider-fleet (borse termiche?) + @dispatch (batching) |
| **Farmacia** | Farmacista abilitato per OTC/ricetta, tracciabilità lotto, privacy sanitaria | @legale-privacy + un umano abilitato (🔴 non bypassabile) |
| **Fiori** | Finestra di consegna stretta legata a occasione (compleanno, funerale), delicatezza trasporto | @dispatch (sequenza fermate), @rider-fleet (formazione) |
| **Q-commerce (15-30 min)** | SLA molto più stretto della consegna standard, densità di ordini per zona | @dispatch + @rider-fleet (copertura picchi) — spesso richiede dark store: NON è un MVV, è uno stadio successivo |
Prima di proporre una verticale, **verifica con @rider-fleet/@dispatch se il vincolo è già coperto**: se non
lo è, o lo risolvi nel MVV (es. SLA standard invece di 15 minuti) o dichiari il gap come blocco.

## E. Stage-gate e kill-criteria — decidere coi numeri, non con l'affezione
- Ogni verticale ha, dichiarato PRIMA del lancio: **il criterio di scala** (es. "≥15 ordini ripetuti dall'ancora
  in 4 settimane → apri il 2° negozio") e **il criterio di stop** (es. "sotto 5 ordini in 4 settimane → ferma,
  posthoc sul perché"). Senza criterio scritto prima, ogni esito si racconta a posteriori per giustificare la
  scelta fatta — è il modo in cui le aziende continuano a finanziare idee morte.
- **Materialità del segnale**: 2-3 ordini di prova non bastano a decidere; serve una finestra minima (2-4
  settimane) e un numero minimo di ordini per avere un segnale, non rumore.

## F. Sequenziamento del portfolio di verticali
- Non tutte le verticali competono solo per budget: competono per **attenzione operativa** (rider-fleet/dispatch
  possono assorbire un cambio di SLA alla volta) e per **negozi-ancora disponibili** (ce ne sono pochi, buoni,
  in una città come Piacenza). Sequenzia per: (1) domanda dimostrata più alta, (2) minor cambio operativo
  richiesto, (3) minor complessità normativa. La verticale "facile e a domanda alta" viene sempre prima di
  quella "affascinante ma complessa" (es. grocery con SLA esistente prima di q-commerce con dark store).

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — BUSINESS CASE 0-to-1 (template, compilabile)
> Riempi con dati reali o segnaposto dichiarato. Mai un benchmark nazionale spacciato per numero Piacenza.
```
VERTICALE: [____]                         data: [AAAA-MM-GG]
(A) Segnale di domanda locale             [dato reale / "assunzione: benchmark settore"]
(B) TAM/SAM/SOM Piacenza (stima)          € [____] / € [____] / € [____]   fonte: [____]
(C) Negozio-ancora identificato           [nome/tipo] · disponibile: [sì/no] · reputazione: [____]
(D) MVV (versione minima da testare)      [assortimento + SLA + vincoli inclusi]
(E) Vincolo operativo principale          [freddo/licenza/SLA] → coperto da [rider-fleet/dispatch]? [sì/no/gap]
(F) Vincolo normativo                     [nessuno / da validare @legale-privacy] → stato: [____]
(G) Unit economics ordine tipo            → passa a @finanza per CM1/CM2 (Tool 1 del kit finanza)
(H) Criterio SCALA                        [____ ordini ripetuti in ____ settimane]
(I) Criterio STOP                         [____ ordini in ____ settimane → ferma e rivedi]
```
**Output atteso:** business case corto (< 1 pagina), ogni riga con fonte o "assunzione" dichiarata, e la
frase finale «è pronto per un'ancora reale, o manca [X]».

## TOOL 2 — CHECKLIST selezione negozio-ancora
- [ ] Reputazione locale verificabile (recensioni, passaparola, presenza storica) — non solo "disponibile".
- [ ] Disponibilità reale a partire (titolare motivato, non tirato per un braccio).
- [ ] Assortimento rappresentativo della verticale (non un caso limite della categoria).
- [ ] Operatività compatibile col MVV (niente richieste speciali che il MVV non copre).
- [ ] Nessun vincolo normativo bloccante non risolto (licenza, abilitazione).
> Se anche UNA voce è "no" su un'ancora candidata, cercane un'altra: l'ancora sbagliata affonda la verticale
> prima che parta.

## TOOL 3 — SCHEDA modello operativo per verticale (compila prima di reclutare)
```
VERTICALE: [____]
SLA di consegna target (MVV)        [____] min/ore   ← standard esistente, non aspirazionale
Vincolo fisico (freddo/fragile/…)   [____] → soluzione MVV: [____] (es. borsa termica esistente, no dark store)
Formazione rider necessaria         [sì/no] → chi la fa: @rider-fleet
Impatto su batching/dispatch        [____] → validato da @dispatch: [sì/no]
Gap operativo scoperto              [____] → blocco o accettabile nel MVV?
```

## TOOL 4 — STAGE-GATE go/no-go (decisione a dato, non a sensazione)
1. Fissa **prima del lancio** i criteri di scala/stop (Tool 1, righe H-I).
2. Al termine della finestra dichiarata, misura: ordini reali dall'ancora, ripetizione (stesso cliente 2+ volte),
   feedback qualitativo del negozio-ancora.
3. **Decidi secondo il criterio scritto**, non secondo quanto piace l'idea: sotto soglia → stop e post-mortem
   (Sapere E); sopra soglia → scala al 2° negozio, passa a @category-manager per il merchandising continuo.
4. Scrivi l'esito (numero reale vs criterio) in `memoria-squadra/new-verticals.md`: è la lezione che calibra
   il prossimo lancio.

## TOOL 5 — REPORT DI LANCIO VERTICALE (struttura di consegna)
```
🆕 VERTICALE PROPOSTA: [nome] — 0-to-1, non merchandising (verificato vs @category-manager)
📊 DOMANDA: [segnale reale / assunzione dichiarata] — fonte: [____]
🏪 ANCORA: [negozio] — disponibile: [sì/no] — checklist Tool 2: [__/5]
🛠️ MVV: [assortimento + SLA + vincoli] — gap operativo: [nessuno / da risolvere: ____]
⚖️ NORMATIVA: [nessuna / in validazione @legale-privacy]
💰 UNIT ECONOMICS: [in attesa @finanza / validata: CM1 €____]
🎯 CRITERIO: scala se [____], stop se [____]
🙋 SERVE DA NICOLA: [firma lancio 🟡/🔴 / decisione tra verticali alternative]
```

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di proporre qualunque verticale)
1. È **davvero 0-to-1** o merchandising di una categoria viva (→ @category-manager)? 2. C'è **domanda reale**
   o sto copiando un case nazionale? 3. Ho un'**ancora reale e disponibile**, o sto disegnando a vuoto? 4. Il
   **vincolo operativo** è coperto oggi da rider-fleet/dispatch, o è un gap da dichiarare? 5. C'è un **vincolo
   normativo** da far validare a @legale-privacy prima di reclutare?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Cifre tra `[…]` = segnaposto/assunzione dichiarata, non inventate come dato MyCity.

## LANCIO GROCERY
- ✅ **GOLD:** *"MVV: 1 minimarket-ancora di zona (reputazione verificata, disponibile), assortimento secco +
  freschi base (no catena del freddo complessa), SLA di consegna standard esistente. AOV atteso € [22]
  (assunzione da benchmark categoria simile, da confermare con i primi ordini reali). Criterio: ≥[15] ordini
  ripetuti in [4] settimane → 2° negozio; sotto → stop e rivedi. 🙋 serve conferma disponibilità ancora +
  validazione CM1 @finanza."* — **Perché:** MVV stretto, ancora reale, fonte dichiarata per l'assunzione,
  criterio numerico prima del lancio, nessuna infrastruttura nuova richiesta.
- ❌ **SPAZZATURA:** *"Il grocery è il futuro, aprilo con tutti i minimarket che vogliono entrare."* — **Perché
  muore:** nessun MVV, nessuna ancora selezionata, nessun criterio, "tutti quelli che vogliono entrare" è
  l'opposto della strategia anchor-first — la categoria sembra piena ma nessuno consegna bene.

## LANCIO FARMACIA
- ✅ **GOLD:** *"MVV: 1 farmacia-ancora per soli OTC/parafarmaco (no ricetta il giorno 1), farmacista abilitato
  confermato dal titolare, tracciabilità lotto verificata con @legale-privacy PRIMA di aprire il catalogo.
  SLA standard. Criterio scala/stop dichiarato. 🔴 apertura categoria: firma Nicola dopo validazione legale."*
  — **Perché:** rispetta il confine normativo (farmacista/licenza restano di un umano abilitato), MVV senza
  ricetta riduce il rischio al lancio, il 🔴 è dichiarato e non bypassato.
- ❌ **SPAZZATURA:** *"Apriamo farmacia online, mettiamo su i farmaci da banco dei negozi che si iscrivono."*
  — **Perché muore:** nessuna verifica di abilitazione, nessun coinvolgimento @legale-privacy, tratta un
  settore regolamentato come una categoria qualsiasi — rischio legale reale, non solo di business.

## SEQUENZIAMENTO PORTFOLIO
- ✅ **GOLD:** *"Ordine proposto: 1) grocery (domanda alta, SLA esistente, nessun vincolo normativo) → 2) fiori
  (finestra di consegna gestibile da dispatch attuale) → 3) farmacia (alto valore ma richiede validazione
  normativa, tempi più lunghi) → 4) q-commerce 15-min (richiede dark store, stadio successivo, non MVV)."* —
  **Perché:** ordina per domanda × fattibilità operativa × complessità normativa, non per quanto è "cool".
- ❌ **SPAZZATURA:** *"Lanciamo tutte e quattro insieme entro il mese, così cresciamo su più fronti."* —
  **Perché muore:** disperde l'attenzione di rider-fleet/dispatch e i pochi negozi-ancora disponibili su
  4 fronti deboli invece che 1 forte.

## 🏆 Pattern vincenti (regole trasversali)
0-to-1 sempre distinto da merchandising · MVV prima della versione completa · 1 ancora forte batte 10 deboli ·
criterio scala/stop scritto PRIMA del lancio · vincolo operativo verificato con rider-fleet/dispatch prima di
proporre · vincolo normativo validato da legale-privacy prima di reclutare · una verticale alla volta, sequenziata.
## 🚩 Red flags (uccidi a vista)
Business case senza fonte/assunzione dichiarata · nessuna ancora identificata · "vediamo come va" senza
criterio numerico · farmaci/alcolici trattati come categoria qualsiasi · dark store o infrastruttura nuova nel
MVV del giorno 1 · 4 verticali lanciate insieme · TAM nazionale spacciato per dato Piacenza.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per il prossimo lancio)
> Senza questo il kit è un lead a mani vuote: ottime *strutture*, ma con segnaposto. Un business case su
> domanda inventata è **peggio** di nessun business case. Ecco esattamente cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Segnali reali di domanda locale** (richieste clienti, gap da @intelligence, ricerche) | TAM/SAM/SOM non a caso | Sapere B, Tool 1 |
| **Dati delle categorie adiacenti già attive** (da @analista) | stimare domanda cross-sell per la nuova verticale | Sapere B, Tool 1 |
| **Vincoli operativi reali di @rider-fleet/@dispatch** (capacità, SLA praticabili oggi) | il MVV che non promette ciò che operations non regge | Sapere D, Tool 3 |
| **Requisiti normativi di categoria confermati** (farmacia: Ordine Farmacisti/ASL; alcolici: licenza) | il confine 🔴 rispettato prima di reclutare | Sapere F, Galleria |
| **Unit economics validate da @finanza** per l'ordine tipo della verticale | il criterio scala/stop è economico, non solo di volume | Tool 1-4 |
| **Un negozio-ancora reale disponibile** | senza questo non c'è MVV testabile, solo teoria | Sapere C, Tool 2 |

**Confine 🔴 invalicabile:** l'apertura di una verticale regolamentata (farmaci, alcolici) e qualunque spesa di
test/reclutamento si **propone e si accoda** in [[AZIONI-IN-ATTESA]] — **mai si esegue** senza firma di Nicola
e, dove serve, la validazione di un professionista umano abilitato. Read ≠ write. Finché manca un'ancora reale
o un dato di domanda, dillo come "carburante": **non lanciare una verticale che non reggerebbe un test reale.**

---
*Manutenzione: kit vivo. Dopo ogni test di ancora (scala o stop), aggiorna la Galleria con l'esito reale
(nuovo gold/spazzatura col perché) e scrivi la lezione in `memoria-squadra/new-verticals.md`. RIASSUMI/POTA
mensile: resta denso e affilato.*
