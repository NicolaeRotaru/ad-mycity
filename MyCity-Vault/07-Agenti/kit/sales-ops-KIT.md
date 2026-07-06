---
tipo: kit-mestiere
ruolo: sales-ops
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: storico pipeline/conversione (oggi corto, MyCity in fase early)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 03-Clienti/Vendite & Acquisizione Negozi.md
---

# 🧰 KIT MESTIERE — sales-ops (il "cervello allenato" delle Sales Operations di marketplace)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un Sales Ops
> senior **sa e usa** (strati 3-6): la matematica di territori/quote, il toolkit passo-passo, la galleria
> di pipeline review gold/spazzatura, e il carburante che serve. Bersaglio: **L7-con-giudizio**
> ([[RUBRICA-LIVELLI]]). Ruolo giovane su dati corti: il kit installa il framework **oggi**, così regge
> quando il team vendite di MyCity crescerà da 1 canale a più zone/persone.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Territori: grappoli, non zone grigie
- **Densità > copertura sparsa.** Un territorio si disegna per **via/quartiere/categoria**, non a
  pioggia: 5 negozi nella stessa via generano prova sociale e passaparola, 5 negozi sparsi no
  (coerente con la logica "densità prima di varietà" di @vendite — sales-ops la traduce in regola di zona).
- **Zero sovrapposizioni.** Ogni indirizzo/categoria ha **UN owner del contatto** in un dato momento.
  La sovrapposizione produce: doppio contatto allo stesso negoziante (imbarazzo, danno reputazionale),
  offerte disallineate, tempo perso. Una mappa di territorio è **inutile se non è univoca**.
- **Il territorio ha una capacità.** Non è solo "chi copre cosa": è "quanti contatti qualificabili al
  mese ci sono in quella zona/categoria" — la base della quota (Sapere B).
- **Rotazione e faro.** Un negozio-faro già dentro (prova sociale forte, cfr. mansionario @vendite) va
  protetto nel territorio di chi lo ha portato: non spezzare una relazione che funziona per "bilanciare"
  il carico sulla carta.

## B. Quota: capacity-based, mai "a sensazione"
- **Formula base.** `Quota raggiungibile = capacità di lavoro (contatti qualificabili/mese) × tasso di
  conversione storico per fase (lead→qualificato→firmato→attivo)`. Se manca lo storico (oggi il caso più
  comune per MyCity), la quota è un'**ipotesi esplicita a bassa confidenza**, mai un numero certo.
- **Top-down vs bottom-up, riconciliati.** L'AD/OKR-Squadra fissa un target aziendale (top-down); tu
  costruisci il numero bottom-up (capacità reale del team). Se divergono, **la riconciliazione è il tuo
  lavoro**: o il target scende, o la capacità sale (più canali, più tempo), o il tasso di conversione
  migliora (processo migliore) — mai far finta che collimino.
- **Ramp curve per chi è nuovo.** Un venditore nuovo (o un nuovo canale) non converte al tasso "a regime"
  dal giorno 1: benchmark generico B2B locale, servono **60-90 giorni** di rampa prima della piena
  produttività. Non pretendere la quota piena da un canale appena aperto.
- **Coverage ratio.** Per centrare un target serve pipeline **aperta e pesata** pari a un multiplo del
  target rimanente: benchmark generico **~3-4×** (varia per settore/ciclo di vendita — dichiaralo come
  benchmark, mai come standard MyCity finché non c'è storico proprio). Sotto soglia = target a rischio,
  segnalalo **prima** che il mese chiuda, non a consuntivo.

## C. Processo di vendita: fasi con criterio di uscita oggettivo
- **Le fasi devono significare qualcosa di verificabile**, non una sensazione. Schema tipico per MyCity:
  `Lead (contatto identificato) → Qualificato (traffico/reputazione reali + titolare raggiungibile,
  criterio BANT/leva-valore di @vendite) → Pitch inviato (materiale specifico mandato, con data) →
  In trattativa (risposta ricevuta, obiezione in gestione) → Firmato → Live (via @onboarding-negozi) →
  Attivo a 30/60/90gg (via @account-negozi)`.
- **Ogni fase ha un'uscita e un tempo massimo atteso.** Un deal fermo oltre la soglia di fase (es. >14-21
  giorni senza attività) è un'**anomalia di processo**, non "sta ancora maturando": va segnalato, non lasciato lì.
- **Sales velocity** (quanto velocemente la pipeline genera valore): `Velocity = (n. deal aperti × tasso
  di vittoria medio × valore medio del deal) / durata media del ciclio (giorni)`. Per MyCity il "valore
  del deal" è il negozio live e attivo, non un euro secco — adatta la metrica al North Star reale.
- **Forecast pipeline-weighted, non "a naso".** Ogni deal pesa per la probabilità della sua fase
  (es. Qualificato 20%, In trattativa 50%, Firmato 90%) moltiplicata per il suo valore: il forecast è la
  **somma pesata**, non la sensazione del venditore su "quanti chiuderò questo mese".

## D. CRM/pipeline hygiene: il dato pulito prima del numero
- **Dimensioni da controllare, in ordine:** completezza (campi chiave vuoti: contatto, categoria, stage,
  data ultimo contatto) · freschezza (stage non aggiornato da N giorni) · duplicati (stesso negozio
  inserito 2 volte, spesso da canali diversi) · integrità di stage (un deal "firmato" senza data firma è
  un dato rotto).
- **Regola pratica:** nessun KPI (coverage, win rate, forecast) si calcola su un CRM che non ha superato
  prima questi 4 controlli. Un report costruito su dati sporchi è **peggio di nessun report**: dà falsa sicurezza.
- **Cadenza.** L'igiene non è un evento, è un ciclo: pipeline review settimanale minima (deal fermi,
  duplicati), riconciliazione mensile con gli esiti reali di @onboarding-negozi/@account-negozi.

## E. Incentivi/comp: l'incentivo guida il comportamento, non l'intenzione
- **Principio guida:** premia l'esito che conta per l'azienda, non l'atto isolato. Pagare solo su "firma"
  spinge a firmare negozi deboli che poi churnano; un piano sano lega (almeno in parte) il premio alla
  **retention** (negozio ancora attivo a 30/60/90gg, cfr. metro di @vendite).
- **Anti-pattern classici da evitare nel disegno (benchmark generico da SaaS/marketplace, non regola MyCity
  finché non firmata):** doppio conteggio dello stesso negozio su canali diversi · commissione piena
  pagata prima che il negozio sia effettivamente live · nessun claw-back se il negozio chiude/churna
  entro 30-60gg · target così alti da spingere a "gonfiare" gli stage per sembrare in linea.
- **Il comp plan è una proposta 🟡/soldi veri 🔴**, mai un'esecuzione tua: disegni la struttura, la logica,
  le soglie — la stanzia e la paga chi ha il mandato (Nicola/@finanza).

## F. Reportistica: il numero + il criterio + l'azione
- Ogni report di vendita ha tre colonne mentali: **il numero** (pipeline, coverage, forecast — con fonte
  e confidenza), **il rischio** (coverage sotto soglia, deal fermi, territorio scoperto), **l'azione**
  (la leva o la firma 🟡/🔴 che serve). Un numero senza le altre due è un totale, non un report di Sales Ops.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Calcolo QUOTA capacity-based (template)
```
CANALE/ZONA: [____]                         periodo: [AAAA-MM]
(A) Contatti qualificabili/mese              [____]   ← capacità reale, non aspirazionale
(B) Tasso Lead→Qualificato storico            [__]%   ← da CRM, N=[__] casi (se N<10: bassa confidenza)
(C) Tasso Qualificato→Firmato storico          [__]%
(D) Tasso Firmato→Attivo 30gg (da @onboarding) [__]%
──────────────────────────────────────────
Quota LORDA (firmati attesi) = A×B×C           [____]
Quota "che conta" (attivi attesi) = A×B×C×D    [____]   ⟵ il numero che l'azienda vuole davvero
Confidenza                                     [__]%   ⟵ bassa se N storico piccolo — dillo sempre
```
**Output atteso:** quota con la matematica visibile + il confronto col target top-down + la riconciliazione se divergono.

## TOOL 2 — CRM HYGIENE CHECKLIST (passa ogni voce prima di calcolare KPI)
- [ ] **Deal fermi**: nessuna attività da >14-21gg → elenca, proponi chiudere-perso o riattivare.
- [ ] **Duplicati**: stesso negozio/indirizzo inserito più volte (canali diversi) → unifica.
- [ ] **Campi chiave vuoti**: contatto, categoria, stage, data ultimo contatto mancanti → completa o segnala a chi possiede il deal.
- [ ] **Stage senza criterio soddisfatto**: "qualificato" senza verifica traffico/titolare, "firmato" senza data → correggi lo stage reale.
- [ ] **Territorio**: due contatti aperti sullo stesso indirizzo → assegna un owner unico, avvisa entrambi.
> Solo dopo questa checklist ha senso calcolare coverage/forecast/win rate.

## TOOL 3 — PIPELINE REVIEW (procedura settimanale)
1. **Igiene prima di tutto** (Tool 2).
2. **Coverage ratio**: pipeline pesata per fase / target residuo del periodo → confronta col benchmark (~3-4×).
3. **Deal materiali**: ordina per valore/urgenza, non per data di inserimento — i grandi/fermi in cima.
4. **Territorio**: verifica che ogni zona attiva abbia un owner e nessuna sovrapposizione nuova.
5. **Forecast pesato**: somma (valore deal × probabilità di fase) → confronta col forecast del ciclo precedente, misura lo scostamento.
6. **Auto-attacco avversariale**: "se uno stage stesse mentendo, lo vedrei con questa review? il coverage regge a uno shock (un canale si ferma)?".
7. **Esito**: coverage % + forecast + N anomalie CRM sistemate + 1 raccomandazione, con confidenza.

## TOOL 4 — FORECAST PESATO PER FASE (template)
```
STAGE               N deal   Valore medio*   Probabilità   Contributo forecast
Qualificato          [__]      [____]          20%          [____]
In trattativa         [__]      [____]          50%          [____]
Firmato               [__]      [____]          90%          [____]
──────────────────────────────────────────────────────────────────
FORECAST TOTALE PESATO                                        [____]
Scostamento vs forecast ciclo precedente (Actual - Forecast)   [____]  ⟵ deve restringersi nel tempo
```
*Valore = "negozio live e attivo" per MyCity, non necessariamente un euro — dichiara l'unità usata.

## TOOL 5 — TERRITORY MAP (procedura)
1. Elenca vie/quartieri/categorie non ancora coperte (da @vendite/@intelligence) e quelle già assegnate.
2. Assegna **un owner per zona/categoria**, mai due. Se due canali toccano la stessa zona, decidi e comunica prima che accada un doppio contatto.
3. Stima la **capacità** della zona (Tool 1, riga A) per costruire la quota di chi la lavora.
4. Rivedi la mappa quando cambia il team o quando una zona satura (tutti i negozi validi già contattati).

## TOOL 6 — COMP PLAN: griglia di disegno (proposta, mai esecuzione)
```
Componente premiata     Peso    Trigger                         Claw-back?
Negozio firmato          [__]%  firma contratto                  sì, se churna entro 30gg
Negozio live             [__]%  primo ordine/incasso reale        —
Negozio attivo 60/90gg   [__]%  ancora attivo/vendite ricorrenti  —
```
**Regola:** nessuna componente pesa 100% sulla sola firma. Il piano finale (importi reali) è **🔴**: proponi la griglia, la stanzia Nicola/@finanza.

## TOOL 7 — Riflesso DIAGNOSTICO (5 domande, prima di produrre quota/report/comp plan)
1. La quota è **capacity-based** o "a sensazione"? 2. Il **coverage ratio** copre il target residuo?
3. Ogni stage ha un **criterio di uscita oggettivo**? 4. L'incentivo premia il **comportamento giusto**
   (retention) o solo la firma? 5. Sto restando nel mio perimetro (zone/quote/processo/CRM/incentivi) o
   sto sconfinando su un pitch specifico (@vendite) / sull'orchestrazione del funnel intero (@revops)?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto, non inventate.

## QUOTA
- ✅ **GOLD:** *"Quota prossimo mese, canale prospezione diretta: [15] contatti qualificabili × [27]%
  conversione a firmato (storico N=[11], da @vendite) × [80]% firmato→attivo 30gg (da @onboarding) ≈
  **[3] negozi attivi attesi**, non i [6] 'a sensazione' proposti inizialmente. Confidenza [55]% (N storico
  piccolo, dichiarato)."* — **Perché:** matematica esplicita, fonte per ogni tasso, il numero "che conta"
  (attivo) non solo firmato, confidenza onesta su storico corto.
- ❌ **SPAZZATURA:** *"Puntiamo a 10 negozi questo mese, diamoci da fare."* — **Perché muore:** nessuna
  capacità, nessuna conversione, nessuna fonte: è un desiderio vestito da target.

## PIPELINE REVIEW
- ✅ **GOLD:** *"Coverage [2,3]× la quota residua (target [4] negozi live, pipeline pesata [9,2]) → **sotto
  soglia** (benchmark ~3-4×), segnalo il gap 3 settimane prima di fine mese. CRM hygiene: [2] deal fermi
  >[21]gg (via XY, categoria alimentari) senza stage aggiornato → proposta: chiudere persi o riattivare
  entro venerdì. 1 leva: apro il canale [Z] (zona non coperta) per alzare la capacità."* — **Perché:**
  coverage esplicito con soglia benchmark dichiarata, CRM pulito prima del numero, gap segnalato per
  tempo (non a consuntivo), 1 leva concreta.
- ❌ **SPAZZATURA:** *"La pipeline sembra piena, dovremmo farcela."* — **Perché muore:** nessun coverage
  ratio, nessuna igiene CRM verificata, "sembra"/"dovremmo" al posto di un numero.

## COMP PLAN
- ✅ **GOLD:** *"Proposta comp: [70]% del premio su negozio live (primo incasso reale), [30]% su attivo a
  60gg con **claw-back** se il negozio chiude entro 30gg dalla firma — evita di premiare la firma facile
  che poi sparisce. Nessuna componente sulla sola firma contratto. 🔴 struttura pronta, importi da
  confermare con @finanza."* — **Perché:** lega il premio alla retention, claw-back esplicito, colore
  corretto (proposta, non stanziamento).
- ❌ **SPAZZATURA:** *"Paghiamo una commissione per ogni negozio firmato."* — **Perché muore:** premia
  l'atto isolato, nessun legame con la retention, apre la porta a firme deboli per il premio.

## 🏆 Pattern vincenti (regole trasversali)
Quota sempre capacity-based con fonte e confidenza · coverage ratio dichiarato prima del target · stage
con criterio di uscita verificabile · CRM pulito prima di ogni KPI · incentivo legato alla retention, non
solo alla firma · territorio senza sovrapposizioni · forecast pesato per fase, mai "a naso".
## 🚩 Red flags (uccidi a vista)
Quota "a sensazione" senza matematica · stage che non significa niente · deal fermo da settimane senza
segnalazione · duplicati/campi vuoti ignorati nel calcolo dei KPI · comp plan 100% sulla sola firma ·
due contatti aperti sullo stesso negozio · forecast del venditore preso senza pesatura per fase ·
benchmark di settore spacciato per dato reale MyCity.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per quando arriva)
> Senza questo il kit è un Sales Ops a mani vuote: ottime *strutture*, ma con segnaposto. Una quota su
> conversioni inventate è **peggio** di nessuna quota. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Accesso alla pipeline/CRM reale** usata da @vendite (oggi: poche righe, storico corto) | base di ogni calcolo: coverage, hygiene, forecast | Tool 2, Tool 3, Tool 4 |
| **Storico di conversione per fase** (lead→qualificato→firmato→attivo, da @vendite/@onboarding-negozi) | la matematica della quota, non un numero a sensazione | Tool 1, Sapere B |
| **Capacità oraria realistica** di chi fa prospezione (quante ore/contatti a settimana) | il lato "capacità" della quota | Tool 1, Sapere A |
| **Condizioni economiche/incentivi confermate** da Nicola/@finanza | trasformare la griglia comp (Tool 6) in un piano reale | Tool 6, Sapere E |
| **Definizioni [[GLOSSARIO-KPI]] confermate** (negozio attivo, firmato, live) | coerenza cross-funzionale con @analista/@vendite | Tool 7, Sapere C |
| **Mappa botteghe/zone di Piacenza** (da @intelligence/@vendite) | disegno del territorio senza sovrapposizioni | Tool 5, Sapere A |

**Confine 🔴 invalicabile:** ogni stanziamento reale di denaro (commissioni pagate, bonus, claw-back
eseguito) si **propone e si accoda** in [[AZIONI-IN-ATTESA]] — **mai si esegue** senza firma di Nicola/
@finanza. Read ≠ write. Finché lo storico di conversione è corto, dillo come "carburante mancante" e usa
segnaposto chiari: **non chiudere una quota che non ha la matematica dietro.**

---
*Manutenzione: kit vivo. Ogni ciclo, quando arrivano nuovi esiti reali (firme, attivazioni, churn),
confronta forecast vs reale (lo scostamento deve tendere a zero), aggiorna la Galleria con un caso vero
gold/spazzatura col perché, e scrivi l'esito in `memoria-squadra/sales-ops.md`. RIASSUMI/POTA mensile:
resta denso e affilato.*
