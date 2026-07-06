---
tipo: kit-mestiere
ruolo: retail-media
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: traffico per pagina (PostHog) + numero negozi disposti a pagare
collegato: [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — retail-media (il "cervello allenato" dell'ad-platform PM)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un ad-platform
> PM di Amazon Ads / eBay Promoted Listings / Glovo Ads **sa e usa** (strati 3-6): l'economia delle aste
> interne, gli strumenti passo-passo, la galleria di formati gold/spazzatura, e il carburante che serve.
> Il kit **aggiunge framework e rigore**, non ri-spiega l'ovvio. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Cos'è (e cosa NON è) un retail media network
- **Retail media** = vendere **visibilità dentro il proprio marketplace** (posizioni in ricerca, banner
  in home/categoria, badge "in evidenza") ai venditori che ci sono già dentro. Non è comprare traffico
  fuori (quello è @ads-performance su Meta/Google/TikTok), non è farsi trovare gratis su Google (quello
  è @seo): è **monetizzare un'inventory che possiedi già** — le tue pagine.
- **Perché è il prodotto a margine più alto di un marketplace:** lo spazio (home, risultati di ricerca)
  esiste comunque, il costo marginale di mostrare un annuncio in più è quasi zero. Ogni euro di retail
  media, al netto dei costi di piattaforma, è quasi tutto contribuzione. Amazon Ads ed eBay Promoted
  Listings sono tra le linee più profittevoli dei rispettivi gruppi proprio per questo.
- **Il paradosso che deve restare sotto controllo:** più venditori vuoi far pagare, più annunci mostri;
  più annunci mostri, più la ricerca sembra uno spot pubblicitario invece di un elenco utile → il
  cliente finale si fida meno, cerca meno, converte meno → **anche l'organico ne soffre**. Il retail
  media network sano ha un **tetto di densità** che protegge l'esperienza, non lo massimizza a oltranza.

## B. I formati (dal più semplice al più sofisticato — parti dal primo)
1. **Prodotto sponsorizzato in ricerca/categoria** — il negozio paga per apparire più in alto tra i
   risultati di una query o di una categoria. Il formato regina di Amazon Ads (Sponsored Products).
2. **Badge "in evidenza"/"scelto per te"** — visibilità senza spostare il ranking organico sottostante,
   più semplice da spiegare e da vendere a un negoziante non tecnico ("il tuo prodotto ha una cornice").
3. **Banner in home/categoria** — slot fisso (non un'asta su keyword, un affitto di spazio a tempo),
   utile per lanci/stagionalità (es. "fiori per la Festa della Mamma"), venduto a CPM o a canone fisso.
4. **Aste sulle keyword interne** — il formato più sofisticato: i negozi fanno bid su termini di ricerca
   ("pane fresco", "riparazione bici"), vince chi ha il punteggio più alto secondo il criterio di ranking
   (non solo il bid più alto — vedi D). Richiede un self-service maturo; partici da qui SOLO dopo aver
   validato i formati 1-3 con pochi negozi manualmente.
- **Regola di sequenza per un marketplace early-stage come MyCity:** parti dal formato più semplice da
  vendere e da spiegare (badge/sponsorizzato manuale a 3-5 negozi), NON dall'asta complessa — il
  self-service e le aste automatiche si costruiscono quando c'è massa critica di negozi (vedi Carburante).

## C. Le metriche che contano (e come non confonderle)
- **eCPM (effective Cost Per Mille)** = ricavo ads / (impression / 1000). È il termometro del pricing:
  eCPM che sale senza far scendere il fill rate = stai monetizzando meglio la stessa inventory.
- **Fill rate** = % degli slot vendibili che sono effettivamente venduti/occupati. Fill rate basso su un
  marketplace con pochi negozi attivi è **normale**, non un fallimento: significa che il floor price è
  tarato per un mercato più grande di quello che hai oggi, o che self-service non è ancora comodo.
- **CTR (click-through rate)** dell'annuncio: utile per capire la creatività/rilevanza, ma **non** è la
  metrica di successo del business — un CTR alto con zero vendite incrementali è solo rumore.
- **Incrementalità (la metrica che conta davvero per il venditore)** = le vendite che il negozio ha fatto
  IN PIÙ grazie alla sponsorizzazione, non le vendite totali del periodo. Approssimazione praticabile
  su piccola scala: vendite del prodotto sponsorizzato nel periodo di test vs le sue vendite medie nei
  periodi precedenti (a parità di altre condizioni: stagionalità, prezzo, stock).
- **Take-rate ads** = ricavo ads / GMV totale del marketplace. Nei retail media network maturi (Amazon,
  Instacart) è tipicamente un **benchmark generico di settore: 1-4% del GMV** nelle fasi mature — su un
  marketplace con pochi negozi attivi come MyCity oggi è normale partire da una frazione minima di
  questo, e serve massa critica di venditori prima che il numero sia significativo. Mai spacciarlo per
  un dato reale di MyCity finché non c'è almeno un trimestre di aste attive.

## D. Il criterio di ranking (il punto tecnico che separa un buon retail media da uno tossico)
- **Solo bid (chi paga di più vince)** → rischio alto: il prodotto peggiore o meno pertinente ma con
  budget maggiore batte sempre il prodotto giusto. Il cliente finale trova risultati irrilevanti,
  smette di fidarsi della ricerca. È la trappola #1 dei retail media mal progettati.
- **Bid × rilevanza/qualità (come Amazon/Google Ads)** → il punteggio finale pesa il bid E quanto il
  prodotto è pertinente alla query (categoria giusta, disponibilità, storico di conversione). Protegge
  la qualità della ricerca mentre comunque premia chi paga di più **tra i pertinenti**. È lo standard
  da adottare fin dal primo formato, anche in versione semplificata (es. "solo prodotti della categoria
  cercata possono fare bid su quella keyword").
- **Floor price** = prezzo minimo dell'asta. Protegge il valore percepito dello slot e evita che un
  negozio comprato per 1 centesimo occupi uno spazio pregiato. Va calibrato sul traffico REALE di quella
  pagina (una pagina con 5 visite/giorno non regge lo stesso floor di una con 500).
- **Tetto di densità annunci** = quota massima di risultati sponsorizzati per pagina (es. "1 ogni 5
  risultati organici", "massimo 2 banner in home"). Fissalo PRIMA di vendere il primo slot, non dopo
  che i clienti si lamentano che la ricerca è piena di pubblicità.

## E. Il ciclo di vita dell'advertiser (perché il rinnovo conta più della prima vendita)
- **Onboarding self-service** → il negozio sceglie budget/keyword/durata da solo in pochi minuti (o,
  in fase early, tu lo attivi manualmente ma con lo stesso flusso mentale). Più è semplice, più negozi
  proveranno il formato.
- **Prova con budget piccolo e tetto** → mai spingere un negozio a spendere tutto il budget mensile sul
  primo test: proponi un tetto di spesa contenuto, misurabile in 2-4 settimane.
- **Report di performance onesto** → mostra impression, click, MA soprattutto **vendite incrementali
  stimate**. Se il numero è deludente, dillo chiaro: un cliente ingannato al primo report non torna.
- **Rinnovo o abbandono** → il vero KPI del retail media non è "quanti hanno provato" ma "quanti
  rinnovano il mese dopo". Un formato con tanti clienti al primo mese e pochi rinnovi è un formato che
  vende una promessa che non mantiene: torna al Sapere D (ranking) e B (formato) prima di rilanciarlo.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Design del formato (checklist prima di proporre QUALSIASI sponsorizzato/banner)
1. **Formato:** quale dei 4 (Sapere B)? Parti dal più semplice se MyCity ha pochi negozi attivi.
2. **Pagina/slot:** dove esattamente (home / ricerca categoria X / scheda prodotto)? Traffico reale di
   quella pagina (fonte: PostHog/analista) — se ignoto, segnaposto `[DA ANALISTA: sessioni/giorno]`.
3. **Prezzo/floor:** calibrato su quel traffico reale, non su un benchmark esterno. Formula di partenza:
   `floor = eCPM target minimo × (impression attese / 1000)`, dove l'eCPM target parte BASSO (validare
   che qualcuno compri) e sale solo se il fill rate resta alto.
4. **Criterio di ranking:** bid × rilevanza (mai solo bid). Dichiara la regola in una riga comprensibile
   al negoziante ("il tuo prodotto sale in classifica in base a quanto offri E a quanto è pertinente
   alla ricerca del cliente").
5. **Tetto di densità:** quota massima annunci/pagina, fissata PRIMA del lancio.
6. **Metrica di successo:** vendite incrementali del venditore nel periodo, non solo impression/click.
7. **Target iniziale:** 3-5 negozi con margine sufficiente per permettersi un test, non "tutti i negozi".
> Se un punto ha un segnaposto `[DA ...]`, il formato non è pronto per essere venduto: è carburante mancante.

## TOOL 2 — Calcolo eCPM / fill rate (foglio compilabile, SOLO con numeri reali o dichiarati come stima)
```
PAGINA/SLOT: [____________]         periodo/fonte: [PostHog, AAAA-MM]
(A) Impression disponibili (sessioni × slot per sessione)   [______]
(B) Slot venduti nel periodo                                 [______]
(C) Fill rate = B / A                                          [__]%   ⟵ se molto basso: floor troppo alto o pochi advertiser
(D) Ricavo ads nel periodo                                   € [____]
(E) eCPM = D / (A/1000)                                       € [____]
(F) eCPM target (benchmark generico settore: [DA VALIDARE])  € [____]
GIUDIZIO: fill rate e eCPM coerenti con un marketplace [N] negozi attivi? Confidenza [__]%.
```
**Output atteso:** fill rate, eCPM, e la frase "il floor è tarato bene per il traffico reale" o "va
abbassato/alzato" con motivazione.

## TOOL 3 — Test di incrementalità (procedura minima, applicabile anche con pochi dati)
1. Scegli il prodotto/negozio sponsorizzato e il periodo di test (min. 2 settimane).
2. Prendi le vendite del prodotto nelle **4 settimane precedenti** (baseline) — stessa stagionalità se
   possibile.
3. Confronta con le vendite **durante** la sponsorizzazione, a parità di prezzo/stock.
4. `Incrementalità stimata = vendite durante test − baseline` (dichiara che è una stima grezza, non un
   esperimento controllato con gruppo di controllo — a bassa scala è l'approssimazione onesta possibile).
5. Se incrementalità ≤ 0: il formato/keyword/prezzo non ha funzionato per quel negozio — dillo nel
   report, non nasconderlo dietro le impression. Proponi un aggiustamento o il rimborso della differenza
   se la promessa iniziale lo prevedeva (Galleria GOLD).

## TOOL 4 — CHECKLIST pre-lancio di un nuovo formato (passa ogni voce)
- [ ] Floor price calibrato sul traffico REALE della pagina (non benchmark esterno).
- [ ] Criterio di ranking = bid × rilevanza (mai solo bid).
- [ ] Tetto di densità annunci/pagina dichiarato e rispettato.
- [ ] Metrica di incrementalità definita PRIMA del lancio (non improvvisata al report).
- [ ] Nessuna promessa di "posizione garantita": l'asta è trasparente, spiegata al venditore in una riga.
- [ ] Target iniziale = pochi negozi (3-5) con margine per sostenere il test, non tutto il catalogo.
- [ ] Peer review: @finanza (il pricing non eroda il margine del negozio) · @seo (non cannibalizza
      l'organico che stava già portando risultati).
> Se un punto non passa, il formato non è pronto: torna al Tool 1.

## TOOL 5 — Il REPORT DI PERFORMANCE (per il negozio sponsorizzato, onesto)
```
📣 SPONSORIZZATO: [prodotto/negozio] · periodo [__] · formato [ricerca/banner/badge]
👁️ Impression: [____]  ·  Click: [____]  ·  CTR: [__]%
💶 Speso: € [____]  ·  eCPM effettivo: € [____]
📈 Vendite durante il test: [____]  ·  Baseline pre-test: [____]  ·  Incrementale stimato: [+/− ____]
🎯 Giudizio: ha funzionato / non ha funzionato per questo negozio → [azione: rinnovare / aggiustare / fermare]
```
**Ghigliottina prima di consegnare:** «Questo negozio rinnoverebbe vedendo ESATTAMENTE questi numeri?»
→ se no, non vendere il rinnovo: proponi un aggiustamento onesto.

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di produrre qualunque proposta)
1. Quanti **negozi reali** vorrebbero questo slot, non ipotetici? 2. Il floor/eCPM è calibrato sul
**traffico vero di MyCity oggi**, o copiato da un benchmark di un marketplace enorme? 3. Il ranking
protegge la **rilevanza** o vince solo chi offre di più? 4. Sto misurando **vendite incrementali** o
solo impression? 5. Serve la firma 🔴 di Nicola (tocca ricavi/commissioni/impegno di spesa di un negozio)?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto, non inventate.

## FORMATO E PRICING
- ✅ **GOLD:** *"'Prodotto in evidenza' in ricerca categoria alimentari: 1 slot sponsorizzato ogni 5
  risultati organici, floor € [0,15]/click calcolato su [___] sessioni/giorno di quella categoria
  (fonte PostHog), ranking = bid × rilevanza categoria. Target: i [3] negozi alimentari con margine
  più alto. Rimborso della differenza se a 30 giorni il negozio non vede vendite incrementali."* —
  **Perché:** floor motivato da un traffico reale (o dichiarato stima), tetto di densità esplicito,
  ranking che protegge la rilevanza, promessa onesta legata al rinnovo, non al primo incasso.
- ❌ **SPAZZATURA:** *"Vendiamo il primo posto in ricerca al miglior offerente, senza limiti."* —
  **Perché muore:** nessun floor (l'asta collassa al ribasso o esplode al rialzo senza controllo),
  nessuna rilevanza nel ranking (il prodotto peggiore ma pagante vince sempre, il cliente finale perde
  fiducia), nessun tetto di densità (rischio di riempire la pagina di soli annunci), nessuna metrica di
  incrementalità: è ricavo del primo mese comprato con la fiducia del marketplace intero.

## MISURA DI SUCCESSO
- ✅ **GOLD:** *"Negozio [X], prodotto sponsorizzato 2 settimane: 850 impression, 40 click (CTR 4,7%),
  speso € 18, eCPM € 21. Vendite durante il test: 6 pezzi. Baseline 4 settimane precedenti: 3,5
  pezzi/2 settimane. Incrementale stimato: +2,5 pezzi (~+71%). Consiglio: rinnovare con budget +30%."*
  — **Perché:** non si ferma al CTR, scende all'incrementalità con baseline dichiarata, dà una
  raccomandazione operativa (rinnovare, non solo "è andata bene").
- ❌ **SPAZZATURA:** *"Il prodotto sponsorizzato ha avuto tanti click, ottimo risultato!"* — **Perché
  muore:** click ≠ vendite, nessuna baseline, nessuna stima di incrementalità, nessuna raccomandazione:
  il negozio non sa se conviene rinnovare, e nemmeno tu.

## PROTEZIONE DELLA QUALITÀ ORGANICA
- ✅ **GOLD:** *"Prima di lanciare il badge 'in evidenza' su tutta la home, l'ho testato solo sulla
  categoria [ristorazione] con tetto 1 banner ogni 6 risultati: CTR sui risultati organici sotto il
  banner invariato (−2%, nella norma), nessun segnale di calo di fiducia nella ricerca. Procedo
  all'estensione graduale ad altre categorie."* — **Perché:** ha protetto l'organico con un test
  circoscritto prima di scalare, ha misurato l'effetto collaterale, non solo il ricavo diretto.
- ❌ **SPAZZATURA:** *"Mettiamo un banner sponsorizzato ogni 2 risultati su tutte le pagine, così
  vendiamo più slot."* — **Perché muore:** nessun test, nessuna misura dell'effetto sull'organico,
  rischio concreto di far sembrare la ricerca uno spot pubblicitario e far scappare i clienti.

## 🏆 Pattern vincenti (regole trasversali)
Floor calibrato sul traffico reale · ranking bid × rilevanza, mai solo bid · tetto di densità dichiarato
PRIMA del lancio · incrementalità misurata con baseline, non solo impression/click · parti dal formato
più semplice con pochi negozi, poi scala al self-service/asta · il rinnovo è il vero KPI, non la prima
vendita · ogni stima con fonte+periodo+confidenza.
## 🚩 Red flags (uccidi a vista)
Ranking solo su bid · nessun floor price · nessun tetto di densità annunci · "posizione garantita"
promessa al venditore · eCPM/fill rate copiati da un benchmark di un marketplace enorme spacciati per
dato MyCity · click scambiati per vendite · target "tutti i negozi" invece di pochi test mirati ·
overselling dello stesso slot · silenzio sul fatto che un test non ha funzionato.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un ad-platform PM a mani vuote: ottime *strutture*, ma con segnaposto. Un piano
> media su numeri inventati è **peggio** di nessun piano media. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Traffico per pagina** (sessioni/ricerche giorno per home, categoria, ricerca — da PostHog/analista) | calibrare floor price ed eCPM su numeri veri, non benchmark esterni | Tool 1, Tool 2 |
| **Numero e margine dei negozi attivi** (chi può permettersi di pagare per visibilità) | scegliere il target iniziale (3-5 negozi) e il prezzo sostenibile | Tool 1, Sapere E |
| **Storico vendite per prodotto/negozio** (Supabase `orders`, sola lettura) | calcolare la baseline e l'incrementalità reale (Tool 3) | Tool 3, Tool 5 |
| **Self-service/pannello venditore** (con @builder-automazioni) | far scalare oltre la vendita manuale 1-a-1 | Sapere B, E |
| **Definizioni [[GLOSSARIO-KPI]] confermate** (GMV, ricavo, take-rate) | coerenza cross-funzionale con @finanza/@analista sul ricavo ads | Sapere C, Tool 6 |
| **Dati di ranking/rilevanza per categoria** (da @seo/catalogo) | costruire un criterio bid × rilevanza credibile, non solo bid | Sapere D, Tool 1 |

**Confine 🔴 invalicabile:** ogni impegno di spesa di un negozio, cambio di floor/commissioni o regola
d'asta che tocca il ricavo dell'azienda si **propone e si accoda** in [[AZIONI-IN-ATTESA]] — **mai si
attiva** senza firma di Nicola. Read ≠ write. Finché mancano traffico reale e negozi con margine
sufficiente, ogni stima di eCPM/fill rate resta un segnaposto: dillo esplicito a Nicola come carburante
mancante, non chiudere un piano media che non regge sui numeri.

---
*Manutenzione: kit vivo. Dopo ogni test di formato/pricing, confronta incrementalità attesa vs reale
(lo scostamento deve tendere a zero), aggiorna la Galleria (nuovo formato gold/spazzatura col perché) e
scrivi l'esito in `memoria-squadra/retail-media.md`. RIASSUMI/POTA mensile: resta denso e affilato.*
