---
tipo: kit-mestiere
ruolo: enterprise-risk
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: storico sinistri, preventivi broker, dati esposizione rider/consegne
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — enterprise-risk (il "cervello allenato" del Corporate Risk & Insurance Manager)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un corporate
> risk manager **sa e usa** (strati 3-6): il framework di rischio, gli strumenti passo-passo, la
> galleria gold/spazzatura, e il carburante che serve. Il kit **aggiunge framework e rigore**, non
> ri-spiega l'ovvio. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Le 4 T del trattamento del rischio
Ogni rischio nel registro ha **una** delle quattro decisioni — mai "ne siamo consapevoli":
- **Tollera (Accept)** — impatto e probabilità bassi, sotto la soglia che l'azienda può assorbire senza
  contraccolpi. Non richiede azione, ma richiede **di essere rivisto** (un rischio tollerato oggi può
  non esserlo più a volumi doppi).
- **Tratta (Mitigate)** — riduci probabilità e/o impatto con un controllo, un processo, una checklist
  (es. formazione rider, contenitori isotermici, doppio controllo sui payout). È il lavoro della prima
  linea (i reparti); tu verifichi che il controllo esista davvero, non solo che sia scritto.
- **Trasferisci (Transfer)** — sposti il costo economico a un terzo: assicurazione, clausola
  contrattuale che scarica la responsabilità sul fornitore/negozio, garanzia bancaria. È la leva quando
  l'impatto può essere catastrofico e la probabilità non è trascurabile.
- **Termina (Terminate/Avoid)** — smetti l'attività che genera il rischio (es. non trattare più una
  categoria alimentare ad alto rischio HACCP finché non c'è la struttura per farlo bene).
> Regola pratica: rischio **ALTA probabilità × ALTA impatto** → mai "tollera". O tratti e trasferisci
> insieme, o fermi l'attività. Il registro deve mostrare la decisione, non solo la descrizione.

## B. La matrice Probabilità × Impatto (come costruirla senza inventare numeri)
- **Probabilità** (annua, su un orizzonte di 12 mesi): BASSA (<10%, evento raro/mai accaduto qui, solo
  benchmark) · MEDIA (10-40%, plausibile su base di esposizione reale — es. volume rider/consegne) ·
  ALTA (>40%, già successo o l'esposizione lo rende quasi certo).
- **Impatto** (economico + operativo, non solo €): LIEVE (<qualche giorno di lavoro/poche centinaia di €,
  nessun danno reputazionale) · MEDIO (giorni di blackout, qualche migliaio di €, reclami visibili) ·
  GRAVE (settimane, danno reputazionale locale, responsabilità legale) · CATASTROFICO (mette a rischio
  la sopravvivenza dell'azienda: causa civile grande, blocco payout, perdita del negozio-faro).
- **Score = P × I**: usa una griglia 4×4 o 5×5, non sommare le scale (un "MEDIA+MEDIO" non è come un
  "ALTA+LIEVE" sommato). Ordina il registro per lo score, non per data di inserimento.
- **Tail risk (rischio di coda):** un evento a probabilità bassa ma impatto catastrofico (es. un rider
  grave incidentato senza copertura) va **sempre** segnalato separatamente in cima, anche se lo score
  "matematico" lo colloca a metà tabella: la coda lunga è dove muoiono le aziende piccole.
- **Mai un numero € di impatto senza fonte**: o è un dato reale (es. valore medio ordine × N ordini/giorno
  fermi), o è un benchmark di settore **esplicitamente etichettato** come tale.

## C. Le coperture assicurative rilevanti per un marketplace locale (ordine di priorità per una startup)
Per MyCity valgono i **4 profili regolamentati** già mappati in `Rischi & Compliance.md` (incasso conto
terzi, trasporto deperibili, lavoro di consegna, intermediazione fiscale): ogni profilo genera un'area
assicurativa collegata.
1. **RC generale/verso terzi** — copre danni a persone/cose causati dall'attività (es. un cliente si fa
   male ritirando un ordine). Base, quasi sempre la prima da avere.
2. **Infortuni + RC per i rider/fattorini** — la priorità più urgente non appena c'è un rider esterno
   pagato (coerente con N4 di Rischi & Compliance): infortunio in itinere/in consegna, danni causati a
   terzi durante la consegna (es. investimento pedone).
3. **RC merci/trasporto** — copre la merce del negozio durante il trasporto (danneggiata, persa, deperita
   per rottura della catena del freddo): rilevante per HACCP/deperibili (N3).
4. **Cyber/data breach** — copre i costi di un incidente sui dati clienti/negozi (notifica, forense,
   eventuale sanzione Garante): rilevante quando il volume di dati personali trattati cresce.
5. **RC professionale/D&O** — copre errori di gestione/decisioni del management: da valutare quando
   MyCity ha investitori esterni o un board formale, non prioritaria in fase early.
6. **Business interruption** — copre la perdita di ricavo durante un blackout prolungato (es. sito giù
   per giorni): da valutare quando il fatturato reale rende il premio proporzionato.
> **In fase early (pochi negozi reali, nessun rider esterno pagato)**: priorità 1-2 sono le uniche
> davvero urgenti; le altre restano nel registro come "pianificato", da riattivare a soglie di volume.

## D. Costo atteso vs premio (la logica economica di retention vs transfer)
- **Costo atteso annuo** = probabilità(%) × impatto(€) × frequenza attesa/anno. È il numero che confronti
  col **premio + franchigia** di una polizza.
- Se il costo atteso è **sotto** ciò che la cassa regge senza problemi (vedi @finanza per il dato reale)
  → puoi **trattenere** il rischio (franchigia alta, nessuna polizza) e risparmiare il premio.
- Se il costo atteso — anche piccolo in media — nasconde uno **scenario di coda catastrofico** (es. 1
  incidente su 500 consegne ma quell'1 costa 200.000€ di responsabilità civile) → **trasferisci**, anche
  se "il premio sembra caro rispetto alla probabilità": il premio compra la sopravvivenza sullo scenario
  peggiore, non la copertura dello scenario medio.
- **Franchigia** = quanto rischio trattieni comunque anche con la polizza attiva: più alta la franchigia,
  più basso il premio, ma più esposizione resta sulla cassa dell'azienda in caso di sinistro piccolo.

## E. Gestione sinistri (claims management) — le fasi che contano
1. **Notifica tempestiva** — quasi tutte le polizze hanno un termine contrattuale (spesso 3-5 giorni
   lavorativi): un ritardo può **invalidare la copertura**. La notifica è la prima cosa da fare, prima
   ancora di avere tutte le prove.
2. **Raccolta prove/documentazione** — fascicolo con: data/ora, cosa è successo, chi era coinvolto,
   testimonianze, foto/screenshot, valore del danno stimato, eventuale denuncia. Più il fascicolo è
   solido, più veloce e favorevole la liquidazione.
3. **Comunicazione con assicuratore/broker** — un solo referente, aggiornamenti tracciati, mai promesse
   di esito al danneggiato prima che l'assicuratore si esprima.
4. **Negoziazione della liquidazione** — è **🔴**: accettare un importo è una decisione economica che
   impegna l'azienda, serve la firma di Nicola (e la competenza del broker/legale se contestata).
5. **Chiusura e lezione appresa** — ogni sinistro chiuso aggiorna la probabilità stimata di quel rischio
   nel registro (uno storico reale batte sempre un benchmark) e genera, se serve, un nuovo controllo di mitigazione.

## F. Business continuity (BC) — la prima ora, non il documento
- **BIA (Business Impact Analysis) in versione leggera per una PMI:** per ogni processo critico
  (checkout/pagamenti, catalogo/vetrina, consegne, comunicazione con negozi) chiediti *"se si ferma
  quanto danno fa, in quanto tempo?"* — questo ordina quali scenari meritano un piano scritto.
- **Scenari MyCity-rilevanti da presidiare:** Supabase/DB giù, PSP/Stripe giù (nessun incasso possibile),
  il negozio-faro chiude improvvisamente, un rider ha un incidente grave, un data breach sui dati clienti.
- **Un mini-BCP per scenario** risponde a: chi se ne accorge per primo (trigger/sentinella) → chi fa cosa
  nei primi 60 minuti → come si comunica a clienti/negozi → tempo di ripristino atteso → chi decide di
  riaprire. Senza questo, il primo incidente vero si gestisce a improvvisazione.
- **Un piano mai testato è un piano teorico**: quando possibile, verifica con @qa/@devops-sre che i passi
  scritti funzionino davvero (es. il rollback descritto è quello reale usato in produzione).

## G. Three lines of defense (chi fa cosa, per non duplicare)
**Prima linea** (i reparti mitigano ogni giorno): rider-fleet (turni/formazione), legale-privacy
(compliance/contratti), qa (HACCP/qualità), security (hardening tecnico), trust-safety (frode), finanza
(anomalie di cassa). **Seconda linea** (tu): aggreghi tutti questi rischi in un'unica mappa P×I, decidi
se serve un trasferimento assicurativo, tieni il registro coerente. **Terza linea** (validazione
esterna): un broker abilitato per le polizze, un consulente del lavoro/rspp per la sicurezza sul lavoro,
un revisore per un audit formale. Il tuo valore è nel **mezzo**: non rifai la prima linea, non sei la terza.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Template SCHEDA-RISCHIO (una riga del registro, compilabile)
```
ID: [___]  Categoria: [normativo/business/infortuni/cyber/continuità]
Rischio: [descrizione in una riga]
Owner prima linea: @[reparto]
Probabilità: [BASSA/MEDIA/ALTA] — perché: [dato reale o benchmark ETICHETTATO]
Impatto: [LIEVE/MEDIO/GRAVE/CATASTROFICO] — perché: [€/giorni/danno reputazionale]
Score P×I: [__]           Tail risk? [SÌ/NO — se sì, in cima a prescindere dallo score]
Decisione (4T): [Tollera/Tratta/Trasferisci/Termina] — perché: [costo atteso vs premio/controllo]
Azione proposta: [cosa fare] — Chi la esegue: [chi] — Colore: [🟢/🟡/🔴]
Stato: [aperto/in-corso/pianificato/chiuso]     Ultima revisione: [AAAA-MM-GG HH:MM]
```

## TOOL 2 — MATRICE P×I (griglia 4×4, da tenere aggiornata)
```
              IMPATTO →   LIEVE      MEDIO      GRAVE      CATASTROFICO
PROBABILITÀ ↓
ALTA                      🟡 tratta  🟡 tratta  🔴 trasf.  🔴 trasf./termina
MEDIA                     🟢 tollera 🟡 tratta  🔴 trasf.  🔴 trasf. (tail!)
BASSA                     🟢 tollera 🟢 tollera 🟡 valuta  🔴 trasf. (tail — non ignorare!)
```
> La cella BASSA×CATASTROFICO è la trappola: sembra "poco urgente" ma è il tail risk classico
> (l'incidente raro che chiude l'azienda). Non abbassare mai la priorità solo perché la probabilità è bassa.

## TOOL 3 — CHECKLIST "prima di proporre una polizza" (passa ogni voce)
- [ ] Esposizione **quantificata con dati reali** (N. rider, N. consegne/mese, valore medio ordine) — non a sensazione.
- [ ] **Costo atteso** calcolato (P × I × frequenza) e confrontato con premio + franchigia proposti.
- [ ] Almeno **1 preventivo reale** richiesto via @broker-assicurativo (mai un premio "stimato a caso").
- [ ] **Franchigia** proposta coerente con la cassa che l'azienda regge senza polizza (dato da @finanza).
- [ ] Dichiarato esplicitamente **cosa NON copre** la polizza (esclusioni), non solo cosa copre.
- [ ] Colore 🔴 rispettato: la proposta arriva a Nicola per la firma, non viene stipulata da te.

## TOOL 4 — PROCEDURA gestione sinistro (passo-passo)
1. **Notifica entro il termine di polizza** (default prudenziale: 24-48h da quando lo sai) — non aspettare il fascicolo completo.
2. **Apri il fascicolo**: data/ora, fatti, coinvolti, prove (foto/screenshot/testimonianze), stima danno.
3. **Un solo referente** verso assicuratore/broker; aggiornamenti tracciati con data/ora.
4. **Nessuna promessa di esito** al danneggiato prima della risposta dell'assicuratore.
5. **Liquidazione = 🔴**: prepari il dossier e la raccomandazione, la decisione di accettare è di Nicola.
6. **Chiudi il loop**: aggiorna la probabilità stimata di quel rischio nel registro con il dato reale appena acquisito.

## TOOL 5 — Template MINI-BCP (per ogni scenario ad alto impatto)
```
SCENARIO: [es. PSP/Stripe giù]
TRIGGER (chi/come se ne accorge): [sentinella o segnale]
PRIMI 60 MINUTI: 1) [chi fa cosa]  2) [chi fa cosa]  3) [chi fa cosa]
COMUNICAZIONE: a clienti = [canale/testo tipo] · a negozi = [canale/testo tipo]
TEMPO DI RIPRISTINO ATTESO: [stima, con fonte/assunzione dichiarata]
CHI DECIDE LA RIAPERTURA/RIPRESA: [ruolo]
```

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di scrivere qualunque riga)
1. È già nel registro o è nuovo? Chi è la prima linea? 2. Probabilità/impatto: dato reale o benchmark
etichettato? 3. Decisione 4T esplicita e coerente col costo atteso? 4. Piano per la prima ora se
succede oggi? 5. Tocca soldi veri → 🔴, fermati e proponi.

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto, non inventate.

## SCHEDA-RISCHIO
- ✅ **GOLD:** *"Infortunio rider in consegna — owner @rider-fleet. Probabilità MEDIA (consegne su due
  ruote, benchmark generico settore delivery — NON dato MyCity), impatto ALTO (RC terzi + fermo rider).
  Score alto, tail risk = SÌ. Decisione: TRASFERISCI, priorità massima prima del primo rider esterno
  pagato. 🔴 serve preventivo reale via broker-assicurativo + firma Nicola."* — **Perché:** owner
  chiaro, numeri etichettati, decisione esplicita, tail risk segnalato, colore corretto.
- ❌ **SPAZZATURA:** *"I rider potrebbero farsi male."* — **Perché muore:** zero probabilità/impatto,
  zero owner, zero decisione: è un'ansia, non una riga di registro.

## COPERTURA ASSICURATIVA
- ✅ **GOLD:** *"Costo atteso stimato dell'esposizione RC-consegne: basso in probabilità ma coda
  catastrofica (RC terzi può superare [100.000€] in uno scenario grave). Premio quotato da
  broker-assicurativo: [X€]/anno con franchigia [Y€]. Conviene trasferire: il premio è una frazione
  minima del tail risk. 🔴 proposta pronta per la firma."* — **Perché:** costo atteso calcolato,
  preventivo reale citato, logica economica esplicita, non "conviene perché sì".
- ❌ **SPAZZATURA:** *"Prendiamo un'assicurazione, tanto costa poco."* — **Perché muore:** nessuna
  esposizione quantificata, nessun preventivo, nessuna franchigia: si compra "per sentirsi coperti", non per un calcolo.

## GESTIONE SINISTRO
- ✅ **GOLD:** *"Sinistro [tipo] del [data]: notificato entro 24h, fascicolo con foto+testimonianza+stima
  danno [Z€] allegato. Assicuratore ha richiesto [documento mancante] — richiesto a [chi]. Proposta di
  liquidazione attesa: NON accettare senza revisione, 🔴 in attesa di Nicola."* — **Perché:** notifica
  tempestiva, fascicolo solido, nessuna decisione presa senza firma.
- ❌ **SPAZZATURA:** *"C'è stato un problema, vediamo come va."* — **Perché muore:** nessuna notifica
  tracciata, nessun fascicolo, rischio concreto di perdere la copertura per ritardo.

## 🏆 Pattern vincenti (regole trasversali)
Probabilità × impatto mai sommati · tail risk sempre in cima anche a probabilità bassa · ogni rischio
ALTA ha una decisione 4T esplicita · costo atteso calcolato prima di proporre una polizza · notifica
sinistro entro i termini di polizza · liquidazione e stipula sempre 🔴 · registro single-source, mai tre versioni.
## 🚩 Red flags (uccidi a vista)
Registro scritto una volta e mai riaperto · "non è mai successo" come prova di sicurezza · premio o
impatto € senza fonte · piano di continuità mai testato · sommare invece di moltiplicare P×I · comprare
polizza senza preventivo reale · notifica di sinistro in ritardo · liquidazione accettata senza firma.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un risk manager a mani vuote: ottime *strutture*, ma con segnaposto. Una
> matrice P×I su numeri inventati è **peggio** di nessuna mappa. Ecco ESATTAMENTE cosa serve:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Storico sinistri reale** (anche "zero finora") | calibrare probabilità reale, non solo benchmark | Sapere B, Tool 1 |
| **Esposizione reale** (N. rider attivi, consegne/mese, valore merce in transito) | impatto € reale, non a sensazione | Sapere B/D, Tool 3 |
| **Preventivi reali via broker-assicurativo** | premio/franchigia veri per il calcolo costo atteso vs premio | Sapere C/D, Tool 3 |
| **`REGISTRO-RISCHI.json` aggiornato dai reparti** | la prima linea alimenta la seconda linea | Sapere G, Tool 1 |
| **Cassa disponibile reale (da @finanza)** | quanto rischio l'azienda può permettersi di trattenere | Sapere D |
| **Policy/DVR di sicurezza sul lavoro (da @rspp)** | i controlli di mitigazione lato infortuni, non duplicati qui | Sapere A, C |
| **Log di uptime/incidenti tecnici (da @devops-sre/@qa)** | BIA e mini-BCP realistici, non teorici | Sapere F, Tool 5 |

**Confine 🔴 invalicabile:** ogni stipula, rinnovo, disdetta di polizza, pagamento di premio o accettazione
di liquidazione si **propone e si accoda** in [[AZIONI-IN-ATTESA]] — **mai si esegue** senza firma di
Nicola e senza il passaggio da un broker/assicuratore abilitato. Read/mappa ≠ firma. Finché manca un
preventivo o uno storico reale, dillo come "carburante" e usa segnaposto chiari: **non chiudere una
riga di registro che non poggia su un dato vero.**

---
*Manutenzione: kit vivo. A ogni sinistro o quasi-incidente, aggiorna la probabilità reale nel registro,
aggiungi la voce alla Galleria (nuovo gold/spazzatura col perché) e scrivi l'esito in
`memoria-squadra/enterprise-risk.md`. RIASSUMI/POTA mensile: resta denso e affilato.*
