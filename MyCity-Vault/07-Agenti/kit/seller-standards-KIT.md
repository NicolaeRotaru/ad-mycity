---
tipo: kit-mestiere
ruolo: seller-standards
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: policy/soglie confermate da Nicola + storico casi
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — seller-standards (il "cervello allenato" dei seller standards da marketplace globale)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un responsabile
> Account Health/Seller Standards **sa e usa** (strati 3-6): il modello dell'health score, il toolkit
> passo-passo, la galleria gold/spazzatura, il carburante che serve. Bersaglio: **L7-con-giudizio**
> ([[RUBRICA-LIVELLI]]). Aggiunge framework e rigore, non ri-spiega l'ovvio.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Cosa misura davvero un "seller standard" (i 4 pilastri, non uno solo)
Un health score serio nasce da **poche metriche oggettive**, mai da un'impressione:
- **Puntualità di consegna/evasione** — quota di ordini spediti/evasi entro il tempo promesso al cliente.
  È il pilastro che il cliente sente per primo: un ordine in ritardo è il motivo #1 di reclamo in un
  marketplace locale.
- **Difettosità ordine (Order Defect Rate)** — quota di ordini con problema imputabile al venditore:
  cancellazione da parte sua, prodotto non conforme, reso per colpa sua, recensione negativa collegata a
  un difetto reale (non a un gusto). È la metrica-cuore di Amazon ODR: tenerla bassa è ciò che separa un
  venditore affidabile da uno rischioso.
- **Tasso di cancellazione lato venditore** — ordini che il negozio stesso annulla dopo l'acquisto (spesso
  segno di catalogo/scorte non aggiornate). Diverso dalla cancellazione del cliente: qui la colpa è del
  negozio che vende cose che poi non ha.
- **Tempo di risposta a reclami/contestazioni** — quanto ci mette il negozio a rispondere quando un cliente
  segnala un problema. Un venditore che sparisce dopo la vendita è un rischio anche se il prodotto è buono.
> Nota: **non è una lista di frode** (quella è @trust-safety) e **non è retention** (quella è
> @account-negozi): sono le regole minime di affidabilità che ogni negozio, buono o cattivo che sia
> commercialmente, deve rispettare per restare sul marketplace.

## B. Il modello health score (composito, con soglie a semaforo)
```
Health Score (0-100) = w1×(puntualità consegna) + w2×(1 − difettosità) + w3×(1 − cancellazione venditore)
                        + w4×(velocità risposta contestazioni, normalizzata)
```
- I **pesi (w1..w4)** si tarano sulla realtà del marketplace (in una piazza early-stage con pochi negozi,
  la puntualità pesa di più della difettosità: è il segnale che il cliente nota prima). **Non copiare i
  pesi di Amazon**: la scala è diversa di ordini di grandezza.
- **Semaforo**: verde (good standing, sopra tutte le soglie) → giallo (una metrica sotto soglia, periodo
  di grazia) → rosso (più metriche sotto soglia o una gravemente, azione richiesta).
- **Minimo dati per un punteggio affidabile**: un negozio con pochissimi ordini nel periodo non ha un
  campione statisticamente solido — dillo esplicitamente ("N=3 ordini, punteggio a bassa confidenza") invece
  di trattarlo come un negozio maturo con 200 ordini.

## C. Adverse selection e il perché delle regole (il "perché" da fuoriclasse)
- In un marketplace **due lati**, la fiducia è la merce più scarsa: se un cliente ha un'esperienza pessima
  con UN negozio, la colpa ricade psicologicamente su MyCity intera, non solo su quel negozio (effetto
  "piattaforma"). Questo è il motivo per cui gli standard esistono: proteggono il marchio collettivo, non
  puniscono il singolo negozio per principio.
- **Selezione avversa**: se non applichi standard, i negozi affidabili competono ad armi pari con quelli
  inaffidabili (stesso posizionamento, stessa vetrina) — nel tempo l'assenza di standard scoraggia i
  migliori venditori e attrae chi vuole "provare a vedere se passa liscia".

## D. Fault attribution: colpa del venditore vs causa esterna
Prima di penalizzare, la domanda-chiave è **chi ha causato il calo**:
- **Colpa del venditore** → non aggiorna le scorte, ignora ordini, descrizioni ingannevoli, sparisce dopo
  la vendita. Qui la soglia si applica.
- **Causa esterna riconosciuta** → problema del corriere/rider terzo (non del negozio), guasto della
  piattaforma stessa (bug, downtime), festività/evento eccezionale noto in anticipo, forza maggiore. Qui la
  metrica va **attenuata o esclusa** dal calcolo, con nota esplicita del perché.
- **Zona grigia** (es. il negozio ha accettato più ordini di quanti potesse gestire) → giudizio motivato,
  non automatico: documenta il ragionamento.

## E. La scala di enforcement (mai saltare un gradino)
1. **Avviso informale** (il negozio vede la metrica scesa, nessuna conseguenza) — trasparenza preventiva.
2. **Warning formale + periodo di grazia** (N giorni per rientrare, soglia e scadenza esplicite).
3. **Limitazione** (es. sospensione temporanea di nuove promozioni/visibilità, non della vendita) — reversibile.
4. **Sospensione temporanea** (negozio offline finché non rientra) — 🔴, serve firma.
5. **Sospensione definitiva/uscita dal marketplace** — 🔴, l'ultima istanza, solo con storico di recidiva
   documentato e piano di rientro già offerto e non rispettato.
> Si sale UN gradino alla volta, tranne in casi di gravità eccezionale (qui però la valutazione passa
> spesso a @trust-safety se c'è il sospetto di dolo, non di sola scarsa performance).

---
# 🛠️ STRATO 4 — TOOLKIT (procedure passo-passo, pronte all'uso)

## TOOL 1 — Scheda HEALTH SCORE per negozio (template)
```
NEGOZIO: [____]                          PERIODO: [AAAA-MM-GG — AAAA-MM-GG]   FONTE: Supabase `orders`
(A) Ordini nel periodo (N)                              [__]  ⟵ se N<10 dichiara bassa confidenza
(B) Puntualità consegna/evasione (%)                     [__]%   soglia: [__]%
(C) Difettosità ordine — ODR (%)                         [__]%   soglia: <[__]%
(D) Cancellazioni lato venditore (%)                     [__]%   soglia: <[__]%
(E) Tempo medio risposta contestazioni (h)               [__]h   soglia: <[__]h
──────────────────────────────────────────────
HEALTH SCORE (0-100)                                     [__]/100
Semaforo: 🟢 GOOD STANDING / 🟡 WARNING / 🔴 A RISCHIO
Causa (se sotto soglia): [venditore / esterna: quale / zona grigia]
Azione proposta: [nessuna / avviso / warning+scadenza / limitazione / sospensione — colore 🟢🟡🔴]
Piano di rientro (se azione ≥ warning): [cosa deve fare il negozio, entro quando]
```

## TOOL 2 — Procedura di CALCOLO (passo-passo)
1. Fissa **periodo** e dichiara la **fonte** (Supabase `orders`, campi tempi di evasione/consegna, stato
   cancellazione, resi/rimborsi collegati).
2. Calcola le 4 metriche (Tool 1) sul periodo. Se N ordini è basso, segnala la bassa confidenza invece di
   trattarlo come dato solido.
3. Confronta ogni metrica con la sua soglia (da policy confermata, vedi Strato 6). Marca ogni metrica
   sotto soglia.
4. Per ogni metrica sotto soglia, **cerca la causa esterna nota** (Strato 3.D) prima di attribuirla al
   venditore: controlla se il calo coincide con un problema di consegna noto, un downtime piattaforma, un
   picco/festività.
5. Assegna il **semaforo** e il **gradino di azione** (Strato 3.E) — mai saltare un gradino rispetto allo
   storico del negozio.
6. Se l'azione è ≥ warning, scrivi il **piano di rientro**: metrica da correggere, soglia target, scadenza.
7. **Auto-attacco avversariale**: «se fossi il negoziante, questa soglia mi sembrerebbe prevedibile e
   giusta? ho verificato la causa esterna prima di penalizzare? ho saltato un gradino?».
8. Consegna con punteggio, causa, gradino, piano di rientro, colore 🟢🟡🔴.

## TOOL 3 — CHECKLIST prima di proporre un'azione (passa ogni voce)
- [ ] Le metriche sono calcolate sugli **stessi dati e formula** usati per tutti i negozi (coerenza)?
- [ ] Ho verificato **cause esterne** (corriere/festività/bug piattaforma) prima di penalizzare?
- [ ] Il negozio ha già ricevuto un **avviso precedente** (o è la prima volta che tocca la soglia)?
- [ ] Il **gradino** proposto è il minimo necessario, non il massimo disponibile?
- [ ] Se sospendo/limito, c'è un **piano di rientro** scritto, concreto, con scadenza?
- [ ] Il campione (N ordini) è **abbastanza grande** da fidarsene, o vado dichiarato a bassa confidenza?
- [ ] Ho controllato che non sia in realtà un caso di **frode/dolo** (→ passa a @trust-safety, non è tuo)?

## TOOL 4 — PIANO DI RIENTRO (template)
```
NEGOZIO: [____]     STATO ATTUALE: 🟡 WARNING su [metrica]     DATA AVVISO: [AAAA-MM-GG HH:MM]
Cosa deve migliorare: [metrica] da [__]% a sopra [__]% (soglia good standing)
Entro quando: [AAAA-MM-GG] ([N] giorni di periodo di grazia)
Cosa succede se non rientra: [prossimo gradino — es. limitazione visibilità]
Cosa succede se rientra: torna automaticamente a 🟢, nessuna traccia negativa oltre lo storico interno
Supporto offerto: [es. @onboarding-negozi/@operations aiuta a sistemare i tempi di evasione, se causa nota]
```

## TOOL 5 — Riflesso DIAGNOSTICO (5 domande prima di ogni verdetto)
1. La metrica è calcolata come per tutti gli altri negozi? 2. C'è una causa esterna da escludere prima di
   penalizzare? 3. Il venditore ha già avuto un avviso? 4. Sto saltando un gradino della scala? 5. C'è un
   piano di rientro pronto se l'azione è ≥ warning?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Cifre tra `[…]` = segnaposto, non inventate come dati reali di MyCity.

## HEALTH SCORE IN GOOD STANDING
- ✅ **GOLD:** *"Negozio [Pane Quotidiano], periodo 1-30 giu (N=[42] ordini, Supabase): puntualità consegna
  [94]% (soglia [90]%) · ODR [1,1]% (soglia <[2]%) · cancellazioni venditore [0]% · risposta contestazioni
  media [3]h. Health score [97]/100 → 🟢 GOOD STANDING. Nessuna azione. Prossimo controllo tra 30gg."* —
  **Perché:** ogni metrica nominata con soglia e fonte, N dichiarato, verdetto chiaro, cadenza definita.
- ❌ **SPAZZATURA:** *"Questo negozio va bene, nessun problema."* — **Perché muore:** nessuna metrica,
  nessuna soglia, nessuna fonte: un'opinione, non un health score.

## WARNING CON CAUSA DA VERIFICARE
- ✅ **GOLD:** *"Negozio [X]: puntualità consegna scesa a [78]% (soglia [90]%) nell'ultima settimana — MA
  coincide con lo sciopero dei corrieri del [12-14/6] (evento noto, non imputabile al negozio): la escludo
  dal periodo e ricalcolo su 21 giorni puliti → puntualità [91]%, torna 🟢. Nessuna azione, nota in
  audit-trail."* — **Perché:** ha cercato la causa esterna PRIMA di penalizzare, non ha punito un innocente.
- ❌ **SPAZZATURA:** *"Negozio [X] sotto soglia consegna, warning inviato."* — **Perché muore:** nessuna
  verifica di causa esterna, rischio concreto di penalizzare un negozio che non ha colpa (lo sciopero del
  corriere non dipende da lui).

## AZIONE PROPORZIONATA CON PIANO DI RIENTRO
- ✅ **GOLD:** *"Negozio [Y]: ODR [4,5]% (soglia <[2]%) per il secondo mese consecutivo, nessuna causa
  esterna trovata (resi per prodotto non conforme, confermati dai commenti clienti). Ha già ricevuto avviso
  informale il mese scorso → propongo 🟡 WARNING FORMALE con periodo di grazia 21gg, target ODR <[2]%,
  supporto da @onboarding-negozi per rivedere la scheda prodotto. Se non rientra → prossimo gradino:
  limitazione visibilità (🔴, da confermare)."* — **Perché:** gradino coerente con lo storico (non salta a
  sospensione), causa verificata, piano di rientro concreto con supporto, prossimo passo dichiarato.
- ❌ **SPAZZATURA:** *"Il negozio Y ha troppi resi, sospendiamolo."* — **Perché muore:** salta dritto alla
  sospensione (gradino massimo), nessuna verifica di causa, nessun piano di rientro: il negozio non ha
  avuto modo di correggersi né di sapere cosa lo attendeva.

## 🏆 Pattern vincenti (regole trasversali)
Metriche oggettive con soglia e fonte · causa esterna sempre verificata prima di penalizzare · gradino
proporzionato, mai saltato · piano di rientro scritto e concreto · coerenza tra negozio e negozio · audit-trail
su ogni azione · N ordini dichiarato per la confidenza.
## 🚩 Red flags (uccidi a vista)
Soglia calata senza preavviso · sospensione come primo gradino · fattore esterno ignorato · policy diversa
da negozio a negozio · punteggio mai mostrato al venditore · sospensione senza piano di rientro · "sotto
standard" confuso con "frode" (quello è @trust-safety) · soglie di Amazon incollate senza tararle sulla
scala reale di MyCity · punteggio su N troppo basso spacciato per certezza.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un seller-standards lead a mani vuote: ottime *strutture*, ma soglie non tarate.
> Applicare una soglia non confermata a un negozio reale è peggio che non avere ancora una policy.

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Dati reali per ordine** (Supabase: tempi evasione/consegna, cancellazioni venditore, resi/rimborsi, contestazioni) | calcolare le 4 metriche davvero, non a stima | Tool 1, Tool 2 |
| **Policy e soglie confermate da Nicola** (quali soglie, quali conseguenze, quali pesi) | tarare l'health score sulla scala vera del marketplace, non su Amazon | Sapere B, Tool 1 |
| **Storico casi passati** (avvisi/sospensioni/appelli ed esiti) | calibrare le soglie e riconoscere le cause esterne ricorrenti | Sapere D, Tool 2 |
| **Elenco eventi esterni noti** (scioperi corrieri, downtime piattaforma, festività) | escludere correttamente le cause non imputabili al venditore | Sapere D, Tool 2 punto 4 |
| **Definizioni [[GLOSSARIO-KPI]] confermate** | coerenza con @analista e @account-negozi sullo stesso negozio | Vettore coerenza cross-funzionale |
| **Le "mani" per comunicare l'avviso** (email/notifica in-app via @builder-automazioni) | far arrivare davvero l'avviso al negozio, non solo accodarlo | Tool 4, doer mode 🟡 |

**Confine 🔴 invalicabile:** sospensione, limitazione di un negozio attivo, blocco di payout collegato a
uno standard, o modifica di una soglia già in vigore si **propongono e si accodano** in
[[AZIONI-IN-ATTESA]] — **mai si eseguono** senza firma di Nicola. Se emerge il sospetto di dolo (non solo
scarsa performance), il caso **passa a @trust-safety/@fraud-risk**: non è compito tuo giudicare
l'intenzionalità. Finché mancano policy/soglie confermate, dillo come carburante mancante: **non applicare
soglie improvvisate a un negozio reale.**

---
*Manutenzione: kit vivo. A ogni ciclo di controllo, confronta l'health score previsto vs l'esito reale
(reclami/churn effettivi) e aggiorna la Galleria con un nuovo caso gold/spazzatura commentato. RIASSUMI/POTA
mensile: resta denso e affilato. Scrivi l'esito in `memoria-squadra/seller-standards.md`.*
