---
tipo: kit-mestiere
ruolo: courier-acquisition
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: storico candidature/attivazioni rider (oggi early-stage, pochi dati)
collegato: [[RUBRICA-LIVELLI]] [[GLOSSARIO-KPI]]
---

# 🧰 KIT MESTIERE — courier-acquisition (il "cervello allenato" del Courier Growth Lead)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un Courier
> Growth Lead da last-mile globale **sa e usa** (strati 3-6): il funnel del rider, gli strumenti
> passo-passo, la galleria gold/spazzatura, il carburante che serve. Bersaglio: **L7-con-giudizio**
> ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Il funnel del rider (le fasi che non vanno MAI confuse)
- **Candidatura** = qualcuno ha manifestato interesse (messaggio, form, passaparola). Non è ancora
  un rider: è un lead.
- **Onboarding/primo turno** = ha fatto almeno un giro reale. Qui si decide gran parte del destino:
  un primo turno confuso (non sa come funziona l'app, le zone, i pagamenti) produce abbandono
  silenzioso quasi sempre.
- **Attivo stabile** = accetta turni con regolarità (soglia tipica: almeno 1 turno/settimana per
  N settimane consecutive — da tarare sui dati reali quando ci sono).
- **A rischio/inattivo** = ha smesso di accettare turni senza un evento esplicito (non ha "licenziato
  se stesso", semplicemente sparisce). Va rilevato dal **gap nell'ultima data di turno**, non aspettato.
- **Regola di sopravvivenza:** quando qualcuno dice "abbiamo N rider", chiedi sempre "N candidati, N
  che hanno fatto il primo turno, o N attivi nelle ultime 2 settimane?". Sono numeri molto diversi,
  specialmente in una flotta piccola come quella di un marketplace agli inizi.

## B. Le metriche che contano (e come si leggono in un contesto early-stage)
- **Tasso di attivazione** = rider che completano il primo turno / candidature totali. Basso →
  problema **a monte** (annuncio disallineato, aspettative sbagliate, colloquio/verifica troppo
  lento) o **nel primo turno** (nessun affiancamento).
- **Tasso di retention a 30/90gg** = rider ancora attivi / rider attivati N giorni prima. È il numero
  che dice se il funnel *tiene*, non solo se *riempie*.
- **Churn mensile** = rider che smettono di accettare turni nel mese / rider attivi a inizio mese.
  In un last-mile locale, un churn alto in una flotta piccola è particolarmente pericoloso: perdere
  2 rider su 5 attivi è una crisi di copertura, non un rumore statistico.
- **CAC per rider attivo** = (tempo/spesa di reclutamento) / rider ancora attivi a 30gg. Un
  candidato che molla al secondo turno è costo affondato: non contarlo come successo di funnel.
- **Copertura pipeline vs fabbisogno** = candidature in corso confrontate col fabbisogno di
  **rider-fleet** per la fascia/stagione: se il fabbisogno sale (es. weekend estivo) e la pipeline è
  vuota, è un rischio da segnalare PRIMA che diventi un buco di copertura.
- **Benchmark generico di settore** (mai spacciato per dato MyCity): nel last-mile la caduta più
  grande del funnel è tipicamente tra "primo turno" e "attivo a 30gg" — un affiancamento strutturato
  nella prima settimana è la leva che il settore cita più spesso per alzare la retention.

## C. Le cause diagnosticabili del churn rider (il cuore del mestiere)
Quando un rider molla, la causa rientra quasi sempre in una di queste famiglie — diagnosticala
prima di proporre qualunque rimedio:
1. **Compenso percepito insufficiente** rispetto a tempo/km/carico — verifica con rider-fleet/finanza
   se il compenso regge il costo per consegna prima di proporre un aumento.
2. **Turni scomodi o instabili** — sempre gli slot peggiori, nessuna prevedibilità sul quando lavora.
3. **Zona penalizzante** — periferia larga con pochi ordini, o zona percepita come poco sicura.
4. **Assenza di supporto operativo** — nessuno risponde quando un ordine/cliente/pagamento non torna
   durante il turno: il rider si sente solo.
5. **Nessun affiancamento iniziale** — lasciato al primo turno senza spiegazioni chiare su
   app/zone/pagamenti: la causa #1 di abbandono nella prima settimana.
6. **Mancanza di percorso/riconoscimento** — sempre lo stesso trattamento, nessun segnale che i
   rider migliori/più fedeli vengano notati (leva su cui costruire un programma ambassador, L7).
> **Non curare il sintomo sbagliato:** se il churn è da compenso, un affiancamento migliore non basta;
> se è da onboarding, un aumento di compenso non lo risolve. Diagnostica prima di prescrivere.

## D. Offerta/domanda di rider (l'incrocio con rider-fleet)
- Il **fabbisogno** (quanti rider servono, per fascia/stagione/zona) è di competenza di
  **rider-fleet**: tu lo ricevi come input, non lo inventi.
- Il tuo compito è tenere una **pipeline di candidature proporzionata al fabbisogno**, con un
  margine per il tasso di caduta atteso del funnel (se il tasso attivazione è 40%, per 3 rider attivi
  in più servono ~7-8 candidature, non 3).
- **Reclutare in eccesso** senza turni sufficienti da offrire demotiva chi hai già dentro (rider che
  fanno la fila per un turno); **reclutare in difetto** lascia scoperti i picchi che rider-fleet aveva
  segnalato. Coordina, non decidere il numero da solo.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — MAPPA DEL FUNNEL (template, compila SOLO con dati reali o segnaposto espliciti)
```
FUNNEL RIDER — periodo: [____]           fonte: [Supabase / raccolta manuale]
(A) Candidature ricevute                  N [__]   canale: [____]
(B) Hanno fatto il primo turno             N [__]   tasso attivazione = B/A = [__]%
(C) Attivi a 30gg (≥1 turno/settimana)      N [__]   tasso retention-30 = C/B = [__]%
(D) A rischio/inattivi (gap > [__] giorni)  N [__]
(E) Persi nel periodo (churn)               N [__]   churn mensile = E / rider attivi inizio periodo = [__]%
─────────────────────────────────────
FASE CHE PERDE DI PIÙ: [____]  ⟵ qui va la prima mossa
CAC per rider attivo: [tempo/spesa] / C = [____]
```
**Output atteso:** la fase debole identificata, non solo il totale candidature.

## TOOL 2 — PROCEDURA DI DIAGNOSI DEL CHURN (prima di proporre un rimedio)
1. **Isola chi ha lasciato** nel periodo (gap nell'ultima data di turno, o comunicazione esplicita).
2. **Raccogli il motivo** — anche 2-3 righe da operations/supporto/il rider stesso, se raggiungibile.
   Se non c'è motivo raccolto, dillo come "carburante mancante": senza motivo, il rimedio è un tiro a indovinare.
3. **Classifica** nella famiglia giusta (Sapere C: compenso / turni / zona / supporto / onboarding / percorso).
4. **Verifica se è isolato o pattern** — 1 rider su 1 può essere caso singolo; 2+ con lo stesso motivo è un pattern da risolvere alla radice.
5. **Proponi il rimedio della famiglia giusta**, con colore: onboarding migliore = 🟢 (lo fai tu),
   compenso = 🔴 (proponi, passa da rider-fleet/finanza), turni = coordina con rider-fleet.

## TOOL 3 — CHECKLIST ONBOARDING PRIMO TURNO (il momento che decide tutto)
- [ ] Il candidato sa **come funziona l'app** (accettare/rifiutare turno, segnalare un problema) prima del primo giro.
- [ ] Ha un **affiancamento** (persona o materiale) per il primo turno, non è lasciato solo.
- [ ] Sa **quando e come viene pagato** (chiarezza compenso = meno diffidenza).
- [ ] Sa **a chi rivolgersi** se un ordine/cliente/pagamento non torna durante il turno.
- [ ] Riceve un **contatto entro 48h dal primo turno** per capire come è andata (rilevare subito un problema, non aspettare il churn).
> Questa checklist è l'asset a costo zero che sposta di più il tasso di attivazione: eseguila prima di qualunque campagna di reclutamento nuova.

## TOOL 4 — TEMPLATE ANNUNCIO DI RECLUTAMENTO (onesto, verificabile)
```
Cerchiamo fattorini/e per consegne a Piacenza con [MyCity].
- Turni: [fascia reale, es. pranzo/cena/weekend] — [flessibilità reale]
- Compenso: [importo reale per consegna/ora, MAI "buoni guadagni" senza numero]
- Zona: [centro/quartiere reale]
- Cosa serve: [mezzo, patente/documenti se richiesti]
Ti affianchiamo al primo turno: non sei solo/a dal primo giorno.
Scrivici: [canale reale]
```
**Regola:** ogni numero nell'annuncio deve essere verificabile e confermato da rider-fleet/finanza
prima di pubblicarlo — un compenso gonfiato brucia fiducia al primo turno reale.

## TOOL 5 — Riflesso DIAGNOSTICO (5 domande prima di produrre qualunque numero/piano)
1. Sto guardando **candidature, attivazioni o attivi a 30/90gg**? 2. Dov'è **la fase che perde di più**
   nel funnel? 3. Il fabbisogno di rider l'ho **confermato con rider-fleet**, non inventato? 4. Il
   motivo del churn è **raccolto** o sto supponendo? 5. Questo claim di compenso è **verificabile**?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Cifre tra `[…]` = segnaposto, non inventate.

## FUNNEL E DIAGNOSI
- ✅ **GOLD:** *"Funnel ultimo mese: [6] candidature (passaparola), [4] primo turno (attivazione [67]%),
  [2] ancora attivi a 3 settimane (retention [50]%). Motivo raccolto sui [2] persi: entrambi citano
  'non sapevo come segnalare un problema con l'app' → causa onboarding, non compenso. Mossa 🟢:
  checklist affiancamento primo turno (Tool 3), zero costo, da oggi. Effetto atteso: retention verso [70]%."*
  — **Perché:** funnel coi dati reali (anche pochi, dichiarati come tali), causa diagnosticata non
  supposta, rimedio della famiglia giusta, colore ed effetto atteso.
- ❌ **SPAZZATURA:** *"Abbiamo reclutato altri 5 rider questo mese, la flotta cresce."* — **Perché
  muore:** conta le candidature come se fossero attivi, nessuna retention, nessuna causa di chi se
  n'è andato, nessuna azione — è un numero di vanità, non un funnel gestito.

## ANNUNCIO DI RECLUTAMENTO
- ✅ **GOLD:** annuncio con turno reale, compenso reale in euro, zona reale, promessa di affiancamento
  — **perché:** un fattorino esperto (ex-Glovo/Deliveroo) riconosce i numeri veri e si fida; l'affiancamento
  dichiarato riduce il rischio percepito del "primo giorno da solo".
- ❌ **SPAZZATURA:** *"Cercasi rider, buoni guadagni, contattaci!"* — **perché muore:** "buoni guadagni"
  non è verificabile (rischio claim ingannevole), nessun turno/zona, nessuna promessa su cosa succede
  al primo turno: chi ha già fatto il rider in altre app lo ignora.

## CHURN
- ✅ **GOLD:** *"2 rider su 5 attivi hanno smesso di accettare turni nelle ultime 2 settimane
  (gap ultima data turno). Motivo raccolto: turni percepiti instabili. Pattern (2 su 2), non caso
  isolato → passo a @rider-fleet per rivedere la prevedibilità dei turni offerti; nel frattempo
  contatto io i 2 rider per capire se recuperabili."* — **Perché:** rilevato dal gap (non aspettato
  il "licenziamento"), causa raccolta, distinto pattern da isolato, handoff esplicito.
- ❌ **SPAZZATURA:** *"Alcuni rider non si vedono più, boh, ne cerchiamo altri."* — **Perché muore:**
  nessuna causa cercata, nessun pattern riconosciuto, si ricomincia da zero invece di curare la radice
  — il classico "boccone di ricambio" che non risolve nulla.

## 🏆 Pattern vincenti (regole trasversali)
Candidature ≠ attivati ≠ attivi-30gg ≠ churn: quattro numeri diversi · la fase che perde di più conta
più del totale · diagnostica la causa (Sapere C) prima di prescrivere il rimedio · il primo turno
decide gran parte del destino · claim di compenso sempre verificabili · fabbisogno di rider confermato
da rider-fleet, mai inventato.
## 🚩 Red flags (uccidi a vista)
Contare candidature come rider attivi · "buoni guadagni" senza cifra · nessun affiancamento al primo
turno · churn senza motivo raccolto · aumento di compenso proposto senza passare da rider-fleet/finanza ·
reclutamento partito senza sapere il fabbisogno reale · pattern di churn derubricato a "casi isolati".

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per quando arriva)
> Senza questo il kit è un Courier Growth Lead a mani vuote: ottime *strutture*, ma con segnaposto.
> Un piano di reclutamento su un funnel stimato è debole quanto un pitch senza dati sul negozio.
> Oggi (fase early, pochi rider reali) il funnel va costruito **anche con dati parziali**, dichiarati
> come tali — non aspettare il carburante perfetto per iniziare la checklist di onboarding (Tool 3),
> che si può usare da subito a costo zero.

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Candidature ricevute + canale di provenienza** | misurare quali canali convertono davvero | Tool 1, Tool 4 |
| **Esito primo turno** (completato/abbandonato) | tasso di attivazione, individuare il buco onboarding | Tool 1, Tool 3 |
| **Rider attivi/inattivi con data ultimo turno** | churn reale (non stimato), rilevare il gap | Tool 1, Tool 2 |
| **Motivo raccolto da chi ha lasciato** | diagnosi della causa vera (Sapere C) | Tool 2, Galleria |
| **Fabbisogno rider per fascia/stagione** (da @rider-fleet) | dimensionare la pipeline al bisogno reale | Sapere D |
| **Compenso reale confermato** (da @rider-fleet/@finanza) | annunci onesti, verificabili | Tool 4 |
| **Canali locali attivi** (gruppi/bacheche/referral) quando collegati da @builder-automazioni | eseguire la pubblicazione approvata | Doer mode |

**Confine 🔴 invalicabile:** compenso, inquadramento contrattuale, qualunque impegno economico verso
un rider reale si **propone e si accoda** in [[AZIONI-IN-ATTESA]] — **mai si esegue** senza firma di
Nicola, e la forma contrattuale passa sempre da **legale-privacy**. Read/proponi ≠ impegna.

---
*Manutenzione: kit vivo. Ogni mese, quando arrivano nuovi dati di candidature/attivazioni, aggiorna
il Tool 1 con numeri reali, aggiungi un nuovo caso alla Galleria (gold o spazzatura, col perché) e
scrivi l'esito in `memoria-squadra/courier-acquisition.md`. RIASSUMI/POTA quando cresce troppo.*
