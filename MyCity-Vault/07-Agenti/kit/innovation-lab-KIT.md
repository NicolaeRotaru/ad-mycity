---
tipo: kit-mestiere
ruolo: innovation-lab
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: budget di sperimentazione + accesso a strumenti no-code/AI generativa
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 04-Prodotto-Ops/Roadmap & Stato Prodotto.md
---

# 🧰 KIT MESTIERE — innovation-lab (il "cervello allenato" del Day-1/New-Bets)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un New Bets lead
> **sa e usa** (strati 3-6): il framework di design degli esperimenti, il toolkit passo-passo, la galleria
> gold/spazzatura, il carburante che serve. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Le due economie della scommessa (opzionalità vs impegno)
- **Real options thinking**: una scommessa 0→1 è un'**opzione call economica**, non un matrimonio. Paghi un
  premio piccolo (il costo del test) per il **diritto** — non l'obbligo — di scalare dopo, se i dati dicono
  sì. Se il costo dell'opzione supera quello di un impegno vero, hai sbagliato veicolo: quello è già lavoro
  di roadmap, non un esperimento del lab.
- **Two-way door vs one-way door (Bezos)**: le decisioni reversibili e a basso costo (un test, un prototipo
  giocattolo) si prendono **in fretta e da soli**; le decisioni irreversibili o costose (dev vero, budget,
  lancio pubblico, un'assunzione stabile) sono one-way door — richiedono più processo: firma di Nicola e
  priorità di @product-manager.
- **Regret Minimization Framework**: si usa per decidere **se provare** una scommessa ("tra 10 anni mi
  pentirei di non averla nemmeno testata?"), MAI per giustificare il continuare a spendere dopo che il test
  ha detto no — quello è sunk cost fallacy travestita da visione.
- **La regola del 70%**: decidi quando hai circa il 70% dell'informazione che vorresti avere. Aspettare il
  90% in un lab d'innovazione è troppo lento: il costo dell'attesa supera il costo dell'errore su una
  scommessa piccola e reversibile.

## B. Il ciclo di apprendimento compresso (Lean Startup / Innovation Accounting)
- **Build-Measure-Learn, ma compresso**: il "build" è il più economico che dà un segnale valido (fake door,
  landing page, Wizard-of-Oz, script manuale, mockup cliccabile) — non si scrive codice vero finché il
  segnale a costo zero non lo giustifica.
- **Innovation accounting**: la **metrica-guida** (leading indicator, es. % di click su un bottone finto,
  % di iscrizioni a una lista d'attesa) si dichiara **PRIMA** di lanciare, mai dopo aver visto il numero —
  altrimenti si trova sempre un modo di raccontare il risultato come "positivo".
- **Falsificabilità**: l'ipotesi deve poter fallire. *"Proviamo la spesa vocale"* non è un'ipotesi;
  *"il 5%+ dei clienti over-55 userà un comando vocale per riordinare entro una settimana"* lo è — perché
  ha un chi, un'azione, una soglia e una finestra.
- **Kill-criteria dichiarati PRIMA** (metrica + soglia + data + campione minimo): è il contratto che ti
  protegge dalla sunk cost fallacy. Senza criterio scritto prima, ogni esito si racconta a posteriori per
  giustificare la scelta già fatta — è così che nascono gli zombie project.
- **Portfolio thinking**: molte piccole scommesse economiche battono una grande scommessa costosa. Il tasso
  di successo atteso di un portfolio sano è basso (benchmark generico dei lab d'innovazione: circa 1 su
  5-10) — quindi il costo per scommessa **deve** restare basso di conseguenza, o il portfolio non regge.

## C. Tassonomia degli esperimenti (dal più economico al più costoso — scegli il più economico che basta)
- **Fake door / smoke test**: un bottone o una pagina per una funzione che non esiste ancora; misuri
  l'interesse (click, iscrizioni). Costo quasi zero, segnale su interesse **non** su intenzione di pagare.
- **Wizard of Oz**: la funzione sembra automatica ma dietro c'è un umano (es. l'"assistente AI" che risponde
  è in realtà un operatore, per i primi test). Testa l'esperienza senza costruire lo stack vero.
- **Concierge**: fai il servizio a mano per pochi clienti reali, prima di automatizzarlo — impari il
  processo prima di costruirlo, ed è spesso il modo più economico di validare un'operatività complessa.
- **Landing page / pre-vendita**: misura l'**intenzione reale** (email lasciata, acconto pagato), non solo
  la curiosità — un passo più vicino a una prova di domanda vera rispetto al fake door.
- **Spike tecnico**: prototipo funzionante minimo per rispondere a UNA domanda tecnica rischiosa (es. "un
  modello AI legge lo scontrino di un negoziante con affidabilità sufficiente?"), non un prodotto: risponde
  a un dubbio di fattibilità, non di domanda di mercato.
- **Pilota limitato**: 1-3 negozi/clienti reali, con consenso, nella versione più vera possibile prima dello
  scale — l'ultimo gradino prima che la scommessa diventi lavoro di roadmap vero.

## D. Dove giocare per MyCity (voce, AR, AI — ancorato alla fase 0→1 di Piacenza)
- **Ordini vocali**: potenzialmente utile per l'over-55/60 diffidente dal digitale — ma si testa PRIMA con
  un Wizard-of-Oz (un umano dietro), non costruendo uno stack vocale vero: il rischio non è la tecnologia,
  è se il cliente si fida a parlare con un bot per comprare.
- **AR/visualizzazione prodotto**: ha senso solo se una categoria specifica la chiede (es. arredamento,
  moda) — nessun ROI provato finché non c'è un test con conversione/AOV reale su quella categoria.
- **Agenti AI conversazionali (shopping assistant, ricerca)**: stesso principio della voce — la fiducia del
  cliente è il leap of faith, non la capacità tecnica del modello. Testala con un umano nel loop prima di
  automatizzare del tutto.
- **Nuovi modelli di business** (abbonamento, gruppi d'acquisto tra negozi, marketplace B2B interno):
  trattali come scommesse con ipotesi/kill-criteria esattamente come le funzioni tecniche — non come "idee
  strategiche" esenti da verifica solo perché non toccano codice.

## E. L'aggancio MyCity
Esperimenti 0→1 con kill-criteria: fake-door, prototipo <1 settimana, budget cap. Non cannibalizzare ops live. Handoff vincente → @product-manager.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — LA SCHEDA ESPERIMENTO (template compilabile, obbligatoria prima di costruire qualsiasi cosa)
> Riempi con dati/assunzioni dichiarate. Nessun numero MyCity inventato: un benchmark è un benchmark, etichettalo.
```
SCOMMESSA: [nome breve]                          data apertura: [AAAA-MM-GG HH:MM]
IPOTESI (falsificabile): "Crediamo che [chi] farà [azione] perché [motivo]."
METRICA-GUIDA (leading indicator): [____]         SOGLIA per continuare: [____]
CAMPIONE MINIMO: N=[____]                          FINESTRA: [____] giorni
METODO più economico scelto: [fake door / Wizard of Oz / concierge / landing / spike / pilota]
COSTO stimato: € [____] (tende a 0)                TEMPO stimato: [____] giorni
KILL-CRITERIA: "Se [metrica] < [soglia] entro [data] → KILL, non insistere."
RISCHIO PRINCIPALE (leap of faith): [____]
CONSENSO/PRIVACY (se tocca clienti reali): [n/d · in validazione @legale-privacy · confermato]
```
**Output atteso:** scheda corta (< 1 pagina), ipotesi falsificabile, soglia dichiarata prima, metodo più
economico giustificato, e la frase finale «pronta da lanciare, o manca [X] carburante».

## TOOL 2 — Procedura passo-passo per lanciare una scommessa
1. Scrivi la **Scheda Esperimento** (Tool 1) PRIMA di toccare qualsiasi editor/tool.
2. Verifica con @product-manager/vault che non stia già succedendo/pianificato — non duplicare la roadmap
   né un test già fatto (registro esperimenti, Tool 3).
3. Scegli il **metodo più economico** che dà comunque un segnale valido (tassonomia Sapere C) — resisti alla
   tentazione di "farlo bene subito".
4. Se tocca clienti/negozianti reali anche minimamente → 🟡: prepara il testo/consenso esatto, passa da
   @legale-privacy se serve, accoda in [[AZIONI-IN-ATTESA]].
5. Lancia, misura **SOLO** la metrica-guida dichiarata (non spulciare altri numeri per "trovare" un segnale positivo).
6. Al termine della finestra: verdetto onesto — **KILL** (soglia non raggiunta), **SCALE** (soglia raggiunta,
   passa a @product-manager con l'evidenza), o **EXTEND** (segnale ambiguo, UNA sola estensione con nuova
   soglia dichiarata, mai infinita).
7. Registra l'esito nel **registro esperimenti** (Tool 3) e in memoria — kill o scale che sia: il "no" vale
   quanto il "sì" per l'apprendimento.

## TOOL 3 — REGISTRO ESPERIMENTI (append-only, mai riscrivere le righe vecchie)
`AAAA-MM-GG HH:MM · scommessa · ipotesi · metrica/soglia · risultato · KILL/SCALE/EXTEND · costo € · lezione`

## TOOL 4 — CHECKLIST pre-lancio (passa ogni voce prima di accodare un test 🟡/🔴)
- [ ] Ipotesi falsificabile scritta (non uno slogan tipo "proviamo l'AI").
- [ ] Metrica-guida + soglia + campione minimo dichiarati PRIMA di lanciare.
- [ ] Metodo più economico possibile scelto (non il più "figo" o il più completo).
- [ ] Consenso/privacy verificato se tocca clienti/negozianti reali (@legale-privacy).
- [ ] Non duplica una scommessa/test già in corso o una voce già in roadmap (verificato con @product-manager).
- [ ] Non ruba dev/attenzione a un motore di soldi che già rende (verificato con l'AD).
> Se anche UNA voce è "no", il test non è pronto: completala prima di accodarlo.

## TOOL 5 — REPORT DI ESPERIMENTO (struttura di consegna, numero + verdetto + azione)
```
🧪 SCOMMESSA: [nome] — ipotesi: "[____]"
📏 METRICA-GUIDA: [____] · soglia dichiarata: [____] · campione: N=[____] su [____] giorni
📊 RISULTATO: [numero reale] → [sopra/sotto soglia]
⚖️ VERDETTO: KILL / SCALE / EXTEND (UNA sola volta, nuova soglia: [____])
💶 COSTO: € [____] · TEMPO: [____] giorni (ipotesi → verdetto)
🧠 LEZIONE: [cosa impariamo, anche se il verdetto è KILL]
🙋 SERVE DA NICOLA: [firma 🟡/🔴 per il prossimo passo / budget / nessuna]
```
**Ghigliottina prima di consegnare:** «Se questo esperimento fallisse, l'avremmo scoperto in giorni o in
mesi — e a quanto ci sarebbe costato?» → se la risposta non torna, il test non era abbastanza piccolo.

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di costruire qualunque prototipo)
1. Qual è l'**assunzione più rischiosa** (leap of faith) di questa idea? 2. Qual è il **modo più economico**
di testarla prima di scrivere codice vero? 3. Ho **metrica-guida + soglia + data** dichiarate PRIMA di
lanciare? 4. Se vince, **chi la raccoglie** (@product-manager per la spec, @builder-automazioni per lo
strumento)? 5. Questa scommessa **ruba risorse** a un motore di soldi che già rende? Se sì → segnala all'AD prima.

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Cifre tra `[…]` = segnaposto/esempio illustrativo, non dati MyCity reali.

## FAKE-DOOR TEST
- ✅ **GOLD:** *"Bottone 'Ordina a voce' su 3 schede prodotto, 5 giorni. Ipotesi: il [5]%+ dei clienti
  over-55 clicca per provare. Risultato: [2] clic su [340] visite ([0,6]%) → sotto soglia, KILL. Costo € 0,
  verdetto in 5 giorni. Lezione: la barriera oggi non è il canale, è la fiducia a pagare online."* —
  **Perché:** ipotesi falsificabile dichiarata prima, soglia esplicita, costo quasi zero, verdetto onesto e
  rapido, lezione riusabile anche da un "no".
- ❌ **SPAZZATURA:** *"Abbiamo messo un bottone voce, alla gente sembra piacere l'idea, continuiamo a
  svilupparla."* — **Perché muore:** nessuna soglia, "sembra piacere" non è un numero, nessuna finestra
  temporale, nessun kill-criteria: si continua per inerzia, non per un segnale.

## SPIKE TECNICO
- ✅ **GOLD:** *"Spike di 2 giorni: un modello AI legge [40] scontrini reali di prova, accuratezza [78]% sui
  campi chiave (prodotto/prezzo) → sotto la soglia [90]% dichiarata per l'uso in produzione. KILL per ora;
  lezione: serve un modello più specializzato o pre-processing OCR, non il modello generico testato."* —
  **Perché:** risponde a UNA domanda tecnica precisa, soglia dichiarata prima, verdetto onesto anche se
  negativo, lezione tecnica specifica e riusabile.
- ❌ **SPAZZATURA:** *"Abbiamo provato l'AI sui scontrini, funziona abbastanza bene."* — **Perché muore:**
  "abbastanza bene" non è una soglia, nessun campione dichiarato, nessun criterio per decidere se è
  pronto per la produzione o no.

## HANDOFF DI UNA SCOMMESSA VINTA
- ✅ **GOLD:** *"SCALE: il pilota concierge su [3] negozi (7 giorni, servizio fatto a mano) ha superato la
  soglia ([12] richieste ripetute vs soglia [8]). Evidenza + costo/beneficio passati a @product-manager per
  la spec di roadmap; il tool di automazione minimo passa a @builder-automazioni. Io chiudo qui: non
  costruisco lo strumento definitivo."* — **Perché:** verdetto secondo il criterio scritto prima, handoff
  esplicito e pulito, nessuna scommessa "posseduta" oltre il proprio ruolo.
- ❌ **SPAZZATURA:** *"Ha funzionato, quindi lo teniamo io e lo sviluppo come funzione vera del sito."* —
  **Perché muore:** l'innovation-lab non prioritizza la roadmap né costruisce l'infrastruttura definitiva —
  saltare l'handoff crea un doppione silenzioso con @product-manager/@builder-automazioni.

## 🏆 Pattern vincenti (regole trasversali)
Ipotesi falsificabile sempre scritta prima · metrica-guida + soglia dichiarate prima di lanciare · il test
più economico che basta, non il più completo · kill-criteria come contratto anti sunk-cost · verdetto
onesto anche quando delude · handoff pulito a @product-manager/@builder-automazioni su una scommessa vinta.
## 🚩 Red flags (uccidi a vista)
"Sembra promettente" senza soglia · zombie project senza kill-criteria · vanity metric (download/wow demo)
spacciata per validazione · MVP-di-tutto invece della fetta più rischiosa · test lanciato su clienti reali
senza passare da @legale-privacy · scommessa che scala da sola senza passare da @product-manager · benchmark
nazionale/di settore spacciato per dato MyCity.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per la prossima scommessa)
> Senza questo il kit è un lab a mani vuote: ottime *strutture*, ma con segnaposto. Un esperimento su un
> costo/dato inventato è **peggio** di nessun esperimento. Ecco esattamente cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **KPI reali** (funnel, categorie, comportamento clienti — da OKR-Squadra/@analista) | scegliere le scommesse col miglior rapporto apprendimento/costo, non a fiuto | Sapere B, Tool 1 |
| **Stato vero del codice/roadmap** (da @product-manager) | non duplicare un test o una feature già pianificata | Tool 2, Tool 4 |
| **Piccolo budget di sperimentazione dedicato** (anche solo tempo) | i test concierge/pilota che richiedono ore umane | Sapere C, Tool 1 |
| **Strumenti no-code/AI generativa** (immagini, voce, chatbot — collegati da @builder-automazioni) | prototipare in ore non settimane (fake door, Wizard of Oz) | Sapere C, Tool 2 |
| **Consenso/privacy confermati da @legale-privacy** | lanciare test su clienti/negozianti reali senza rischio | Tool 1, Tool 4 |
| **Definizioni [[GLOSSARIO-KPI]] confermate** | metrica-guida coerente con @analista quando tocca un KPI esistente | Tool 6 |

**Confine 🔴 invalicabile:** qualunque spesa (tool AI a pagamento, ads di test, servizio esterno) e
qualunque test su dati reali dei clienti senza consenso già in essere si **propone e si accoda** in
[[AZIONI-IN-ATTESA]] — **mai si esegue** senza firma di Nicola. Read ≠ write. Finché manca il carburante,
resta ai mockup/wireframe offline e dillo come "carburante mancante": **non spacciare un mockup per un test di domanda reale.**

---
*Manutenzione: kit vivo. Dopo ogni verdetto (kill o scale), aggiorna la Galleria con l'esito reale (nuovo
gold/spazzatura col perché) e scrivi la lezione in `memoria-squadra/innovation-lab.md`. RIASSUMI/POTA
mensile: resta denso e affilato.*
