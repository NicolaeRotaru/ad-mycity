---
tipo: kit-mestiere
ruolo: revops
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: campo "stadio" strutturato in Supabase per i negozi
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 03-Clienti/Vendite & Acquisizione Negozi.md
---

# 🧰 KIT MESTIERE — revops (il "cervello allenato" del Revenue Operations di marketplace)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un
> RevOps di marketplace **sa e usa** (strati 3-6): il funnel a stadi, gli strumenti passo-passo,
> la galleria di funnel/hand-off gold e spazzatura, il carburante che serve. Bersaglio:
> **L7-con-giudizio** ([[RUBRICA-LIVELLI]]). Il kit aggiunge framework e rigore, non ri-spiega l'ovvio.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Il funnel a stadi (definizione unica — la base di tutto)
Un funnel senza stadi definiti è un totale, non uno strumento. MyCity ha (almeno) due funnel
paralleli che condividono lo stesso sistema di misura:
- **Funnel NEGOZIO (supply-side):** `prospect` (individuato, non ancora contattato) →
  `contattato` (pitch inviato) → `rispondente` (ha risposto/mostrato interesse) → `qualificato`
  (traffico/fit reali, BANT ok) → `firmato` (ha detto sì) → `onboarded/live` (vetrina+catalogo
  attivi) → `attivo a 30gg` (ha almeno un ordine pagato nei primi 30gg) → `maturo` o `a rischio
  churn` (health score, di @account-negozi).
- **Funnel CLIENTE (demand-side):** `visitatore` → `registrato` → `primo ordine` → `ricorrente`
  (2+ ordini) → `dormiente` (nessun ordine da N giorni) → `win-back` (riattivato).
- **Ogni stadio ha UN owner di reparto** (contattato/qualificato = vendite; onboarded = onboarding-
  negozi; attivo/maturo = account-negozi; primo ordine/ricorrente = customer-success/crm-lifecycle).
  Tu non possiedi gli stadi: possiedi la **mappa** che li collega e la **definizione condivisa**
  di ognuno, proposta a [[GLOSSARIO-KPI]] quando manca o diverge.
- **Regola di sopravvivenza:** prima di contare qualsiasi cosa, verifica che "qualificato" per
  vendite e "qualificato" per te (o per marketing) siano LA STESSA definizione. Se non lo sono,
  ogni conversione calcolata dopo è falsa per costruzione.

## B. Pipeline lorda vs pipeline pesata (weighted) — il numero che non mente
- **Pipeline lorda** = conta tutti i contatti in uno stadio, indipendentemente da quanto sono
  vicini alla chiusura. Utile per capire il volume di lavoro, inutile per un forecast.
- **Pipeline pesata** = Σ (valore atteso per negozio/cliente × probabilità storica di conversione
  del suo stadio attuale). È il numero che regge davanti a "quanti negozi live entro fine mese?".
- **Con pochi dati reali (fase early, pochi negozi in pipeline), le probabilità storiche sono
  fragili**: dichiaralo sempre ("probabilità stimata su N=[__], bassa confidenza") invece di
  proiettarle come fossero leggi consolidate. Meglio un forecast onestamente incerto che uno
  falsamente preciso.

## C. Conversion rate stadio-per-stadio (dove si nasconde il leakage)
- Il funnel è un **imbuto**, non una somma: la domanda giusta non è "quanti sono entrati e
  quanti sono usciti in totale", ma **"a quale stadio si perde di più, e da quanto tempo?"**.
- **Leakage silenzioso** = un negozio/lead che non avanza né viene esplicitamente scartato: resta
  fermo. È il caso peggiore perché nessuno lo nota finché non lo cerchi apposta.
- **Tempo nello stadio** conta quanto il tasso di conversione: un negozio "firmato" da 3 settimane
  senza essere ancora `onboarded` è un problema anche se, alla fine, verrà messo online.
- Benchmark generico di settore (mai da spacciare per dato MyCity): in funnel B2B locali un tasso
  contatto→risposta tipico è **~40-60%**, risposta→chiusura **~30-50%**; sotto questi range su un
  campione sufficiente è un segnale di problema di messaggio o di follow-up, non normalità.

## D. SLA e hand-off puliti (il punto di massimo rischio)
- Ogni passaggio tra reparti ha bisogno di 4 cose scritte: **chi passa** (reparto A) **a chi**
  (reparto B) **cosa** (dati minimi richiesti: nome negozio, contatto, categoria, note) **entro
  quando** (es. 24-48h) — e una **conferma di ricezione** (B conferma di aver preso in carico).
- Senza questo, l'hand-off è "a voce": funziona finché nessuno è impegnato altrove, poi si rompe
  in silenzio e nessuno sa a chi tocca.
- **L'SLA non è un ordine ai reparti**: è una proposta 🟡 che tu porti con i dati (quante volte si
  è rotto, quanto è costato in giorni persi) — la firma/adozione resta di AD + reparti coinvolti.

## E. Forecasting bottom-up (il metodo, non la sensazione)
- **Bottom-up** = parti dalla pipeline reale attuale (per stadio) × conversione storica per stadio
  → proiezione dei prossimi N negozi/clienti nei prossimi 30/60/90gg. Usalo sempre quando i dati
  ci sono, anche pochi: è verificabile e migliora nel tempo.
- **Top-down** ("vogliamo 10 negozi nuovi questo trimestre") è un obiettivo, non un forecast: non
  confonderlo con una proiezione basata su dati. Se l'obiettivo supera il bottom-up, il gap è
  un'informazione preziosa (serve più pipeline in ingresso o conversione migliore), non un numero
  da forzare.
- **Ricalibra ogni mese**: confronta forecast vs realizzato, aggiorna i tassi di conversione usati,
  dichiara lo scostamento. Un forecast che non si ricalibra mai è un'opinione travestita da metodo.

## F. Data hygiene / "CRM" leggero (oggi senza tool enterprise)
- **Single source of truth per ogni negozio/lead**: un ID univoco, uno stadio, un owner, aggiornati
  in un posto solo. Oggi a MyCity questo vive sparso tra vault e quaderni reparto: il tuo lavoro è
  ricostruirlo pulito ogni volta che serve un funnel, e segnalare quando serve un campo strutturato
  reale in Supabase o un tool dedicato (carburante, Strato 6).
  a — mai duplicare un negozio con due stadi diversi in due fonti: è la prima causa di numeri che
  non tornano tra reparti.

## G. Cosa NON sei (i confini che ti tengono onesto)
- Non sei @marketing (strategia di acquisizione: come/dove trovare prospect) né @vendite (lavorare
  la pipeline: pitch, follow-up, chiusura). Sei il sistema che misura e connette il loro lavoro.
- Non decidi prezzi/commissioni (@growth-monetizzazione) né margini (@finanza): usi le loro
  definizioni, non le riscrivi.
- Se un tuo numero diverge da @analista sullo stesso KPI, il problema è la definizione: riconcilia
  prima di portare qualunque cosa a Nicola.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — MAPPA DEL FUNNEL (template stadi + conversioni, compilabile)
```
FUNNEL: [negozio / cliente]         periodo: [____]   fonte: [vault / Supabase / quaderno reparto]
Stadio 1: [____]         N=[__]
Stadio 2: [____]         N=[__]   conversione da stadio 1: [__]%   tempo medio nello stadio: [__]gg
Stadio 3: [____]         N=[__]   conversione da stadio 2: [__]%   tempo medio nello stadio: [__]gg
Stadio 4: [____]         N=[__]   conversione da stadio 3: [__]%   tempo medio nello stadio: [__]gg
...
BOTTLENECK: stadio [__]→[__], conversione [__]% (sotto/in linea col benchmark generico [__]%)
CAUSA IPOTIZZATA: [____]           VERIFICATA CON: [____]
```
**Output atteso:** non il totale, ma IL PUNTO dove si perde di più, con causa e da quanto tempo.

## TOOL 2 — PROCEDURA di CACCIA AL LEAKAGE (passo-passo)
1. **Fissa periodo + fonte** per ogni stadio (vault, Supabase, quaderno reparto) — dichiara da dove
   viene ogni numero.
2. **Elenca ogni negozio/lead per stadio attuale e data ultimo movimento** (non solo il conteggio):
   serve per trovare chi è fermo, non solo quanti sono fermi.
3. **Isola i fermi da più tempo del normale** per quello stadio (es. "firmato" da >7gg senza
   essere onboarded) → sono il leakage silenzioso, la priorità #1.
4. **Chiedi al reparto owner dello stadio successivo** perché non è avanzato (non accusare: chiedi
   dati — mancava un'informazione? un handoff non è arrivato?).
5. **Quantifica il costo**: quanti negozi/clienti fermi × valore atteso = il costo del leakage in
   ricavo mancato/ritardato, non solo un numero di "casi".
6. **Proponi 1 mossa concreta** (SLA nuovo, checklist di hand-off, alert automatico) — mai un
   generico "miglioriamo la comunicazione".

## TOOL 3 — CHECKLIST HAND-OFF (SLA minimi tra reparti — verifica ognuno)
- [ ] **marketing → vendite**: un lead passa con fonte + categoria negozio + perché è interessante,
      entro [__]gg dalla generazione, con conferma di presa in carico da vendite.
- [ ] **vendite → onboarding-negozi**: un negozio firmato passa con dati completi (contatti, orari,
      categoria, foto/prezzo se già raccolti) entro 24-48h dalla firma (target done-for-you <48h).
- [ ] **onboarding-negozi → account-negozi**: un negozio live passa con lo stato iniziale (catalogo
      completo sì/no, primo incasso di test fatto sì/no) entro il giorno del go-live.
- [ ] **marketing/crm-lifecycle → customer-success**: un nuovo cliente/primo ordine passa per il
      concierge entro [__]gg dal primo ordine.
> Ogni riga senza spunta = hand-off "a voce": è un candidato a diventare una proposta 🟡 in
> AZIONI-IN-ATTESA, con i dati di quante volte si è rotto.

## TOOL 4 — FORECAST DI PIPELINE (bottom-up, template)
```
Stadio attuale        N attuale   conversione storica al passo successivo   attesi entro 30gg
Qualificato            [__]        [__]%                                    [__]
Firmato                [__]        [__]%                                    [__]
Onboarded/live         [__]        [__]%                                    [__]
─────────────────────────────────────────────────────────────────
TOTALE ATTESI LIVE ENTRO 30gg: [__]     confidenza: [__]%   (basata su N=[__] storici)
Scostamento vs mese precedente (forecast vs realizzato): [__]
```
**Regola:** se N storico è piccolo, la confidenza è dichiaratamente bassa — non nasconderlo dietro
una cifra precisa.

## TOOL 5 — IL REPORT REVOPS (numero + rischio + azione)
```
🔀 FUNNEL [negozio/cliente], [periodo], fonte [__]: [stadi e conversioni sintetici]
⚠️ BOTTLENECK: stadio [__]→[__] a [__]% (causa: [__]) — fermo da [__]gg per [N] casi.
📈 FORECAST 30/60/90gg: [__] attesi (confidenza [__]%).
🧭 1 MOSSA: [SLA nuovo / checklist hand-off / alert] → effetto atteso sulla conversione.
🙋 SERVE DA NICOLA: [firma SLA 🟡 / carburante mancante].
```

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di produrre qualunque funnel)
1. Ogni stadio ha la **stessa definizione** in tutte le fonti? 2. Il record vive in **un posto
   solo**? 3. Sto guardando pipeline **lorda o pesata**? 4. Dove si perde **di più**, l'ho
   misurato o suppongo? 5. Il passaggio tra reparti ha un **SLA scritto**?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto/esempio, non dato reale.

## FUNNEL NEGOZIO
- ✅ **GOLD:** *"Funnel negozi al [6 lug] (fonte: vault + Supabase `profiles`): [12] contattati →
  [5] rispondenti (42%) → [3] firmati (60%) → [2] onboarded (67%) → [1] attivo a 30gg (50%).
  Bottleneck: contattato→rispondente, sotto il benchmark generico ~40-60% al limite basso. Causa:
  4 dei 7 senza risposta non hanno avuto un secondo contatto entro 3gg. Proposta: SLA follow-up a
  3gg come accodo automatico per @vendite. Forecast 30gg: 1-2 nuovi live, confidenza 55% (N piccolo)."*
  — **Perché:** stadi con fonte, bottleneck preciso, causa verificata, mossa concreta, confidenza onesta.
- ❌ **SPAZZATURA:** *"Il funnel va bene, abbiamo diversi negozi in trattativa, contiamo di
  chiuderne alcuni presto."* — **Perché muore:** nessuno stadio, nessuna fonte, "contiamo" al posto
  di un forecast, nessuna causa. È un'impressione, non un funnel misurato.

## HAND-OFF
- ✅ **GOLD:** *"L'hand-off vendite→onboarding-negozi si è rotto 2 volte su 3 negli ultimi 30gg
  (negozio firmato, passato dopo 6 e 9 giorni invece di 24-48h) — in entrambi i casi mancava la
  conferma di presa in carico. Proposta: checklist obbligatoria (dati minimi + conferma scritta)
  prima che l'onboarding parta il conto alla rovescia delle 48h. Accodato in AZIONI-IN-ATTESA 🟡."*
  — **Perché:** quantifica il problema, isola la causa (conferma mancante), propone un fix
  verificabile, colore giusto (cambia il lavoro altrui = 🟡).
- ❌ **SPAZZATURA:** *"A volte i negozi restano fermi tra vendite e onboarding, forse serve
  comunicare meglio."* — **Perché muore:** "a volte", "forse", nessun conteggio, nessuna causa,
  nessuna proposta verificabile.

## FORECAST
- ✅ **GOLD:** *"Pipeline pesata: [3] qualificati (probabilità storica firma 60%) + [1] firmato
  (probabilità onboarding 90%) → atteso 1-2 nuovi live entro 30gg. Confidenza 55% (N storico = 5,
  campione piccolo — da ricalibrare a fine mese confrontando con il realizzato)."* — **Perché:**
  pesato non lordo, metodo bottom-up dichiarato, confidenza onesta sul campione piccolo.
- ❌ **SPAZZATURA:** *"Contiamo di avere 10 negozi nuovi entro fine trimestre."* — **Perché muore:**
  è un obiettivo travestito da forecast, nessun dato storico, nessuna pipeline pesata sotto.

## 🏆 Pattern vincenti (regole trasversali)
Una definizione condivisa per stadio · pipeline pesata non lorda · leakage misurato per stadio,
non per totale · ogni hand-off con SLA scritto e conferma di ricezione · forecast bottom-up con
confidenza dichiarata · ogni numero con fonte+periodo · porta sempre 1 mossa concreta.
## 🚩 Red flags (uccidi a vista)
"Lead" e "qualificato" definiti diversamente tra reparti · pipeline lorda spacciata per previsione
· hand-off "a voce" · forecast come desiderio ("contiamo di") · percentuale precisa su un campione
minuscolo senza dichiarare la confidenza · record del negozio duplicato in più fonti che divergono
· leakage scoperto ma senza causa né mossa · giudicare la strategia/esecuzione altrui invece del sistema.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per quando arriva)
> Senza questo il kit è un RevOps a mani vuote: ottime *strutture*, ma con segnaposto. Un funnel
> su definizioni inventate è **peggio** di nessun funnel. Ecco cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Campo "stadio" strutturato in Supabase** (per negozio: prospect/contattato/.../attivo) | single source of truth, niente ricostruzione manuale | Tool 1, Tool 2, Sapere F |
| **Quaderni `memoria-squadra/` di marketing/vendite/onboarding-negozi/account-negozi/customer-success/crm-lifecycle** | dati reali di stadio e tempo, senza dover chiedere a voce | Tool 2, Tool 3 |
| **Definizioni [[GLOSSARIO-KPI]] confermate** (lead/qualificato/attivo) | coerenza cross-funzionale con @analista | Sapere A, Tool 6 |
| **Storico di conversione per stadio (col tempo, più mesi)** | forecast bottom-up affidabile, non a campione minimo | Tool 4, Sapere E |
| **Un vero tool di pipeline/CRM** (oggi manca: stato sparso tra vault e quaderni) | scala oltre il foglio a mano quando i negozi crescono | Sapere F, richiesta a @builder-automazioni |
| **Log dei tempi di hand-off reali** (quando un negozio è passato da un reparto all'altro) | misurare l'SLA invece di stimarlo | Tool 3 |

**Confine 🔴/🟡 invalicabile:** un nuovo SLA che cambia il lavoro di un altro reparto è sempre
**🟡 proponi e avvisa**, mai imposto da solo; una richiesta di spesa per un tool/CRM è **🔴 proponi,
non spendere**. Finché manca un dato reale (stadio, storico), dillo come "carburante" e usa
segnaposto chiari: **non chiudere un funnel che non torna.**

---
*Manutenzione: kit vivo. Ogni mese confronta forecast vs realizzato (lo scostamento deve tendere a
zero), aggiorna la Galleria con un nuovo caso gold/spazzatura col perché, e scrivi l'esito in
`memoria-squadra/revops.md`. RIASSUMI/POTA mensile: resta denso e affilato.*
