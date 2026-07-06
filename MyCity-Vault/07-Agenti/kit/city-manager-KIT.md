---
tipo: kit-mestiere
ruolo: city-manager
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso — negozi/ordini segmentati per zona in Supabase
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 02-Mercato/ · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — city-manager (il "cervello allenato" del City/General Manager di marketplace)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un City Manager di
> marketplace **sa e usa** (strati 3-6): il framework di liquidità a due lati, gli strumenti passo-passo, la
> galleria gold/spazzatura, il carburante. Ruolo nuovo su una città in fase early: il kit **installa il
> framework prima ancora che i dati siano ricchi**, così il ragionamento è corretto fin dal primo giorno.
> Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Liquidità a due lati: il vero prodotto di un marketplace locale
- Un marketplace non vende negozi né consegne: vende **liquidità** — la probabilità che, aprendo l'app in
  quel quartiere in quel momento, ci sia qualcosa da comprare e qualcuno pronto a consegnarlo. Senza
  liquidità, ogni altra metrica (negozi onboardati, visite al sito, follower) è vanity.
- **Il ciclo si autoalimenta o si spegne.** Più negozi → più scelta → più clienti → più ordini per negozio →
  negozi più contenti/attivi → ancora più negozi. Rotto in un punto qualsiasi, il ciclo va all'indietro:
  pochi ordini per negozio → negozio deluso → negozio inattivo → meno scelta → meno clienti.
- **I due lati non sono simmetrici.** L'offerta (negozi) è più lenta e costosa da costruire (richiede
  fiducia, tempo, un umano che convince); la domanda (clienti) può accendersi e spegnersi rapidamente con
  marketing. **Errore classico:** accendere la domanda prima che l'offerta la possa soddisfare — brucia
  budget acquisendo clienti che aprono l'app, non trovano nulla di interessante, e non tornano.

## B. Densità: l'unità geografica che conta, non la città
- **Densità = negozi utili raggiungibili in un raggio/tempo di consegna ragionevole**, non negozi totali in
  città. 5 negozi a 200m l'uno dall'altro battono 15 negozi sparsi su 10 km: generano scelta percepita reale
  per il cliente e giri di consegna efficienti per il rider.
- **Attacca a grappolo (via/quartiere/categoria), mai a pioggia.** La densità minima per far scattare il
  ciclo di liquidità (Sapere A) si raggiunge prima in un'area piccola e curata che in una città intera rada.
- **La città è la somma di zone, non un blocco.** Un city manager segmenta sempre: la media di città
  nasconde il quartiere che tira e quello morto. Ogni decisione (dove spingere offerta, dove spingere
  domanda) si prende a livello di zona, mai di città intera.

## C. Cold-start: come si rompe l'uovo-e-gallina
- **Non aspettare che si risolva da solo: progettalo.** La sequenza tipica che funziona in un marketplace
  locale nuovo (benchmark generico di settore, non dato MyCity): (1) 3-8 negozi-faro curati a mano in
  un'area piccolissima, scelti per reputazione/traffico reale, non per facilità di contatto; (2) domanda
  concentrata sugli stessi negozi (referral, passaparola, prima community di clienti); (3) misura se il
  ciclo si autoalimenta (ordini per negozio in crescita senza spinta manuale); (4) solo allora espandi il
  grappolo al quartiere adiacente.
- **Densità artificiale è accettabile in fase cold-start, non oltre.** All'inizio è normale "spingere" con
  sconti/incentivi mirati per innescare il ciclo; il segnale di uscita dal cold-start è quando il ciclo
  regge **senza** quella spinta continua.
- **Il fallimento tipico è saltare una fase**: aprire una città intera invece di un quartiere, o accendere
  marketing di massa prima che 5-10 negozi-faro siano davvero attivi con ordini ricorrenti.

## D. Le tre fasi di una zona e come si riconoscono
| Fase | Segnale | Cosa serve |
|---|---|---|
| **Cold-start** | Pochi negozi, domanda instabile, il ciclo si ferma senza spinta manuale | Densità artificiale mirata, negozi-faro, community iniziale |
| **Crescita** | Il ciclo si autoalimenta ma è ancora fragile: un negozio-chiave che se ne va destabilizza la zona | Diversificare i negozi-faro, consolidare la copertura rider, misurare frequenza di riordino |
| **Maturo** | Offerta e domanda si sostengono senza intervento continuo, la zona genera GMV stabile | Ottimizzazione (upsell, mix categorie), diventa il playbook da replicare altrove |
> Piacenza oggi (2026, fase early) è quasi certamente **cold-start su gran parte del territorio, possibile
> crescita solo sulla zona/i negozi più consolidati** — verifica sempre col dato reale, non assumere la fase.

## E. Playbook di replica città-per-città
- Un playbook buono è **una checklist con soglie**, non un racconto. Cosa deve contenere: criteri di scelta
  della prima zona (densità abitativa, concorrenza già presente, presenza di negozi-faro credibili), numero
  minimo di negozi-faro per partire, definizione operativa di "zona viva" (soglia di ordini/negozio/settimana
  sostenuta senza spinta manuale), tempo atteso per raggiungerla, costo di apertura stimato.
- **Ogni città nuova aggiorna il playbook**, non lo riesegue identico: la densità abitativa, la cultura
  d'acquisto locale, la concorrenza (locale e nazionale) cambiano le soglie. Il playbook è vivo, non un PDF fisso.
- **Il segnale per "pronti per la prossima città" non è mai "Piacenza va bene"**: è una zona di Piacenza che
  ha raggiunto la fase Maturo (Sapere D) con margine ripetibile — cioè un template dimostrato, non solo sperato.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Segmentazione di zona (SEMPRE il primo passo)
1. Definisci i confini di zona (quartiere/via/raggio consegna), non usare "Piacenza" come unità.
2. Per ogni zona estrai da Supabase: negozi totali vs negozi con almeno 1 ordine negli ultimi 30gg (=
   "attivi"), GMV di zona, N. ordini/settimana per negozio attivo, N. clienti con >1 ordine (riordino).
3. Se il dato di zona non è disponibile in Supabase (campo zona/quartiere mancante), **dillo come
   carburante mancante** — non stimare la zona a intuito guardando gli indirizzi.

## TOOL 2 — Diagnosi del lato che frena (offerta vs domanda vs capacità)
```
ZONA: [____]                          periodo/fonte: [Supabase, AAAA-MM]
Negozi attivi / negozi totali zona:      [__]/[__]   ⟵ offerta reale
Ordini/settimana per negozio attivo:     [____]      ⟵ capacità inespressa se basso E offerta scarsa
Clienti con >1 ordine (30gg) / clienti tot zona: [__]%  ⟵ domanda che regge (riordino)
Copertura rider nello slot di punta:     [ok/scoperta] ⟵ vincolo di capacità (chiedi a @rider-fleet)
─────────────────────────────────────
DIAGNOSI: offerta scarsa / domanda scarsa / capacità rider insufficiente / [combinazione]
MOSSA: [1 azione specifica] → owner: [@vendite / @growth-monetizzazione / @rider-fleet / @dispatch]
```
**Regola di lettura:** se i negozi attivi hanno pochi ordini/settimana E ce ne sono pochi in zona, il
problema è quasi sempre **domanda**, non offerta — aggiungere negozi peggiora solo la delusione media.
Se invece i pochi negozi attivi sono già saturi (molti ordini/settimana, clienti che tornano), il problema
è **offerta**: lì la mossa è @vendite, non marketing.

## TOOL 3 — Checklist di fase (dove si trova questa zona)
- [ ] Meno di [N] negozi-faro attivi con ordini ricorrenti → **cold-start**: non fare marketing di massa,
  cura i negozi-faro e la prima community di clienti.
- [ ] Ciclo che si muove ma un solo negozio-chiave regge la zona → **crescita fragile**: diversifica prima
  di spingere ulteriormente la domanda.
- [ ] Ordini stabili senza spinta manuale da [N settimane] → **maturo**: questa zona è il template da
  documentare nel playbook (Tool 4).
> Compila con soglie reali quando i primi dati di zona arrivano; finché mancano, dichiara "soglie da
> calibrare — carburante mancante", non inventarle.

## TOOL 4 — Template PLAYBOOK di apertura zona/città (da aggiornare, non riscrivere da zero)
```
CITTÀ/ZONA: [____]              basata su: Piacenza [zona di riferimento] / assunzioni riverificate: [...]
1. Criteri scelta prima area: densità abitativa [__] · concorrenza presente [__] · negozi-faro credibili [N]
2. Negozi-faro minimi per partire: [N]  ·  categorie di apertura: [____]
3. Soglia "zona viva": [__] ordini/negozio/settimana sostenuti senza spinta manuale per [__] settimane
4. Copertura rider minima richiesta: [da @rider-fleet]
5. Costo di apertura stimato: [da @finanza]  ·  tempo atteso a "zona viva": [__] settimane
6. Rischi/differenze locali vs Piacenza: [____]
```

## TOOL 5 — Riflesso DIAGNOSTICO (4 domande prima di ogni giudizio)
1. Sto guardando un negozio/ordine (→ passa) o **una zona intera**? 2. Il rapporto offerta/domanda è
   squilibrato — con quale dato? 3. Che **fase** è (cold-start/crescita/maturo)? 4. Sto copiando Piacenza
   o ho **verificato** le assunzioni per questa zona/città?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Cifre tra `[…]` = segnaposto, non inventate.

## DIAGNOSI DI ZONA
- ✅ **GOLD:** *"Zona Centro: [8] negozi totali, [3] attivi con ordini negli ultimi 30gg (Supabase). I 3
  attivi fanno [12] ordini/settimana ciascuno con [40]% clienti a riordino → capacità satura, non
  inespressa. Diagnosi: **offerta scarsa**, non domanda. Mossa: 2-3 nuovi negozi-faro nelle vie adiacenti
  → passo a @vendite, non un esperimento di marketing."* — **Perché:** segmentato, dato reale, diagnosi
  del lato corretto con la logica del Tool 2, mossa con owner.
- ❌ **SPAZZATURA:** *"Il Centro potrebbe avere più negozi, magari lanciamo una campagna per farli
  conoscere."* — **Perché muore:** nessun numero, nessuna zona precisa, confonde "far conoscere" (leva di
  domanda) con un problema che potrebbe essere di offerta, nessun owner.

## COLD-START
- ✅ **GOLD:** *"Piacenza fase [cold-start su gran parte del territorio]: concentro l'attenzione su [N]
  negozi-faro già attivi in [zona], non su coprire tutta la città. Prima misuro se il ciclo si autoalimenta
  lì (ordini/negozio in crescita senza spinta), poi espando al quartiere adiacente."* — **Perché:** rispetta
  la sequenza del Sapere C, non salta fasi, ha un criterio di avanzamento.
- ❌ **SPAZZATURA:** *"Dobbiamo aprire a più negozi in tutta Piacenza e fare pubblicità ovunque per crescere
  più in fretta."* — **Perché muore:** salta la densità (Sapere B), accende domanda su un'offerta non pronta
  (Sapere A), nessuna soglia di successo.

## PLAYBOOK DI ESPANSIONE
- ✅ **GOLD:** *"Prima di guardare a una seconda città, la zona [X] di Piacenza deve reggere in fase
  **maturo** per [N] settimane senza spinta manuale — oggi siamo in [crescita], non ancora lì. Nel
  frattempo preparo il template (Tool 4) con le assunzioni da riverificare (densità abitativa diversa,
  concorrenza locale) invece di aspettare passivamente."* — **Perché:** il criterio di prontezza è
  operativo, non un sentimento, e il lavoro di preparazione procede comunque (🟢).
- ❌ **SPAZZATURA:** *"Piacenza sta prendendo piede, potremmo essere pronti per un'altra città il prossimo
  trimestre."* — **Perché muore:** "prendendo piede" non è un criterio, nessuna zona di riferimento, nessuna
  verifica delle assunzioni locali per la città nuova.

## 🏆 Pattern vincenti (regole trasversali)
Segmenta sempre per zona, mai per città intera · densità prima di copertura · diagnostica il lato che frena
con un dato, non a intuito · rispetta la sequenza cold-start→crescita→maturo, non saltare fasi · ogni
playbook si aggiorna con le differenze locali, non si ricopia identico.
## 🚩 Red flags (uccidi a vista)
"la città va bene" senza zona né numero · negozi onboardati contati come prodotto finito · marketing di
massa prima che l'offerta regga · Piacenza copiata altrove senza riverificare le assunzioni · "pronti per
un'altra città" senza criterio operativo · media di città che nasconde il quartiere morto.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un GM a mani vuote: ottime *strutture*, ma con segnaposto. Un giudizio di zona su
> dati inventati è **peggio** di nessun giudizio. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Campo zona/quartiere su `profiles`/`orders`** (Supabase) | segmentare per area invece che per città intera | Tool 1, Tool 2 |
| **Storico ordini per negozio nel tempo** | distinguere capacità satura da capacità inespressa | Tool 2 |
| **Costi reali di apertura zona/città** (da @finanza) | Tool 4 (playbook), decisione di espansione 🔴 | Tool 4 |
| **Copertura rider per zona/slot** (da @rider-fleet/@dispatch) | il terzo vincolo oltre domanda/offerta | Tool 2, Tool 3 |
| **Mappa concorrenza locale** (da @intelligence) | criteri di scelta della prima area (Sapere E) | Tool 4 |
| **Definizioni [[GLOSSARIO-KPI]] confermate** (negozio/cliente attivo, GMV) | coerenza cross-funzionale con @analista/@finanza | Tool 1, Tool 5 |
| **Soglie di "zona viva" calibrate sul primo dato reale** | trasformare il Tool 3 da checklist teorica a strumento vero | Tool 3 |

**Confine 🔴 invalicabile:** proporre l'apertura di una nuova città/zona, spostare budget/priorità tra zone,
o dichiarare "città pronta per il lancio pubblico" si **propone e si accoda** in [[AZIONI-IN-ATTESA]] — **mai
si esegue** senza firma di Nicola. Finché mancano i campi di zona in Supabase, dillo come "carburante" e usa
segnaposto chiari: **non dichiarare una zona viva o morta su un'impressione.**

---
*Manutenzione: kit vivo. Ogni volta che una zona reale attraversa una fase (cold-start→crescita→maturo),
aggiorna la Galleria con quel caso vero (col perché) e il Tool 4 col template calibrato, poi scrivi l'esito
in `memoria-squadra/city-manager.md`. RIASSUMI/POTA quando il kit cresce: resta denso e affilato.*
