---
tipo: kit-mestiere
ruolo: bi-lead
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: tool BI dedicato + Stripe read (per ora Pannello + REST)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 90-Memoria-AI/STATO.md
---

# 🧰 KIT MESTIERE — bi-lead (il "cervello allenato" del Business Intelligence Engineer di marketplace)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un BI Engineer
> di marketplace **sa e usa** (strati 3-6): la gerarchia delle metriche, gli strumenti passo-passo, la
> galleria di cruscotti gold/spazzatura, e il carburante che serve. Bersaglio: **L7-con-giudizio**
> ([[RUBRICA-LIVELLI]]). Non ri-spiega l'ovvio: aggiunge framework e rigore a un ruolo già forte.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Single source of truth / semantic layer (il cuore del mestiere)
- Una metrica ha **una** definizione: **formula + fonte + popolazione + finestra temporale**. Vive in
  **un** posto ([[GLOSSARIO-KPI]]); ogni dashboard, ogni reparto **linka** quella definizione, non ne
  scrive una propria. Il "semantic layer" è questo strato di definizioni condivise tra il dato grezzo e
  i cruscotti — senza, ogni reparto costruisce la sua verità e le verità divergono.
- **Versioning obbligatorio.** Ogni definizione ha una versione (v1, v2…) e un changelog: quando cambia
  la formula di un KPI, i cruscotti storici restano leggibili (sai qual era la v1 quando confronti un
  trend lungo). Cambiare una definizione in silenzio rompe ogni confronto storico.
- **Owner della sostanza vs owner del meccanismo.** Tu non decidi da solo/a cosa significa "ricavo" o
  "cliente attivo" — quello resta di @finanza/@analista, i garanti della sostanza. Tu presidi che **una
  sola versione** di quella definizione circoli ovunque, e che i cruscotti la rispettino.

## B. North Star & guardrail (la gerarchia che guida le decisioni)
- **North Star MyCity (confermata nel vault):** ordini qualificati consegnati/settimana. È l'output che
  cattura il valore reale creato (non un input come "download" o un vanity come GMV grezzo).
- **Guardrail** = le metriche che **non devono peggiorare** mentre la North Star sale: margine/ordine,
  reclami, retention, tempo di consegna. Una mossa che alza la North Star ma affossa un guardrail è una
  vittoria che l'azienda paga altrove — il tuo cruscotto deve mostrare ENTRAMBI, mai la North Star sola.
- **Metriche-input vs North Star (output).** La North Star si insegue con le leve a monte (nuovi negozi
  live, cataloghi completi, recupero carrelli): il cruscotto di sistema mostra la catena, non solo il
  numero finale, così chi decide vede **su quale leva agire**.
- **In fase early (pochi ordini/negozi): dichiara sempre l'N.** Con N=1 la "North Star" è un contatore
  binario (riuscito/non riuscito), non un trend statistico. Non travestire un contatore da serie storica.

## C. Metric tree / driver-tree pubblicato
- Esempio: `GMV = ordini × AOV`; `ordini = sessioni × conversione × frequenza`. Questa scomposizione va
  **pubblicata e versionata** (non nella testa di un reparto), così chiunque scenda dal totale al driver
  che si è mosso senza dover richiedere l'analisi ogni volta.
- Il metric tree è il ponte tra il tuo cruscotto di sistema e l'analisi ad-hoc di @analista: tu esponi
  l'albero, lui/lei scende nel ramo che si è rotto quando serve un insight profondo.

## D. Dashboard hygiene (i 5 elementi che un cruscotto deve SEMPRE avere)
1. **Fonte** dichiarata (REST marketplace, Supabase MCP, Stripe) — priorità REST → MCP, come da
   `cervello/verifica-sensori.mjs`.
2. **Periodo/finestra** esatti (non "recente", non "questo mese" senza date).
3. **Owner** (chi risponde se il numero è sbagliato).
4. **Refresh**: automatico con timestamp, o manuale con data dichiarata — mai un numero senza sapere
   quando è stato calcolato l'ultima volta.
5. **Versione della definizione** linkata al [[GLOSSARIO-KPI]].
> Un cruscotto senza uno di questi 5 non è un cruscotto: è uno screenshot che invecchia in silenzio.

## E. Self-service vs bespoke (dove investire lo sforzo)
- **Regola del "tre volte":** se rispondi manualmente alla stessa domanda per la terza volta, smetti di
  rispondere e costruisci il cruscotto che la risponde da solo. Il bespoke ripetuto è un cruscotto
  mancato.
- **Self-service non significa "senza contesto":** un numero self-service ha comunque definizione,
  fonte, soglia di lettura ("riuscito" = quanto) — altrimenti chi lo legge lo interpreta male da solo.
- **Quando NON costruire un cruscotto:** una domanda vera una tantum, esplorativa, con un'ipotesi da
  verificare — quello è il mestiere di @analista. Costruire un cruscotto permanente per una domanda
  temporanea è spreco di manutenzione.

## F. WBR/MBR mechanism (Amazon-style: il cruscotto esiste per una cadenza)
- Un cruscotto vive **agganciato a una cadenza decisionale** (`cervello/ritmo.md`: piano del mattino,
  report della sera, review del venerdì, strategia mensile). Se nessuna cadenza lo usa per decidere, è
  decorazione — **spegnilo**, non aggiungerne un altro sopra.
- La disciplina Amazon del **Weekly/Monthly Business Review**: poche metriche, sempre le stesse, lette
  nello stesso ordine, con anomalie spiegate a voce prima della riunione (mai scoperte lì). Il tuo
  cruscotto di sistema è il "documento" che regge quella disciplina anche a scala minima (un GM e un
  team di senior digitali).

## G. Qualità del dato a monte (dove finisce il tuo mestiere, dove inizia quello di @data-engineer)
- Tu **consumi** dati puliti, non li produci: se un evento manca o è duplicato, il problema è di
  @data-engineer, non tuo — ma **sei tu il primo/a a vederlo** (il cruscotto che non riconcilia è il
  sintomo). Segnala, non ripulire a mano dentro il cruscotto: la pulizia va alla fonte.
- **Riconcilia sempre con la fonte di verità** (REST marketplace / Stripe) prima di pubblicare un numero
  che passa da un layer intermedio: un cruscotto "bello" costruito su un dato sporco è peggio di nessun
  cruscotto.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Template VOCE GLOSSARIO (per proporre/confermare una metrica)
```
METRICA: [nome esatto, es. "negozio attivo (live)"]
FORMULA: [es. vetrina pubblica + catalogo + payout configurato + ≥1 prodotto ordinabile]
FONTE: [REST marketplace / Supabase MCP / Stripe] — priorità dichiarata
POPOLAZIONE: [chi/cosa entra nel conteggio, chi è escluso e perché]
FINESTRA: [istantanea / 7g / 30g / da sempre]
OWNER SOSTANZA: [@analista / @finanza — chi decide se la definizione ha senso di business]
VERSIONE: [v1, data] · STATO: [proposta / confermata da Nicola / da riconciliare]
USATO IN: [quali cruscotti/reparti la citano oggi]
```
**Output atteso:** una riga nuova o aggiornata nel [[GLOSSARIO-KPI]], mai una definizione parallela in un
altro documento.

## TOOL 2 — Procedura di RICONCILIAZIONE (quando due reparti hanno numeri diversi sullo stesso KPI)
1. **Isola il termine esatto** che diverge (es. "cliente attivo": 30g per @crm, 60g per @marketing).
2. **Confronta le due formule** riga per riga: fonte, popolazione, finestra — quasi sempre la
   divergenza è in UNA di queste tre, non in un errore di calcolo.
3. **Verifica quale rispecchia meglio la decisione reale** che il KPI deve abilitare (non "chi ha
   ragione": qual è la definizione più utile alla mossa che si deve prendere).
4. **Proponi la riconciliazione** al [[GLOSSARIO-KPI]] coinvolgendo @analista/@finanza per la sostanza;
   se serve un arbitraggio, porta le due opzioni a Nicola con la raccomandazione.
5. **Aggiorna TUTTI i cruscotti che citavano la vecchia definizione** e segna il changelog. Una
   riconciliazione che lascia un cruscotto indietro ricrea il problema in un mese.

## TOOL 3 — CHECKLIST "cruscotto pronto" (una ❌ = non si pubblica)
- [ ] Ogni metrica ha una voce nel [[GLOSSARIO-KPI]] (o è stata appena proposta).
- [ ] Fonte + periodo + owner + refresh dichiarati e visibili sul cruscotto stesso.
- [ ] North Star (se presente) è accompagnata da almeno 1 guardrail.
- [ ] N piccolo dichiarato esplicitamente, nessuna finta precisione statistica.
- [ ] Nessun numero duplicato con formula diversa altrove (verificato con @analista/@finanza).
- [ ] Un non-tecnico può leggerlo e agire senza chiedere spiegazioni.
- [ ] Agganciato a una cadenza reale (`cervello/ritmo.md`) — altrimenti chiediti se serve davvero.

## TOOL 4 — Template CRUSCOTTO NORTH STAR + GUARDRAIL (settimanale)
```
📅 CRUSCOTTO SETTIMANALE — settimana [__] · fonte [REST/Stripe] · refresh [auto/manuale, data]
⭐ NORTH STAR: ordini qualificati consegnati/settimana → [__] (soglia "riuscito" ≥[__], def. [[GLOSSARIO-KPI]])
🛡️ GUARDRAIL:
  - margine/ordine: [__] (soglia [__]) → [ok/attenzione]
  - reclami: [__]/[__] ordini → [ok/attenzione]
  - retention: [__] (N=[__], dichiara se troppo piccolo per concludere)
📉 METRIC TREE (se la North Star si è mossa): [driver che l'ha spiegata]
🙋 DA RICONCILIARE: [eventuali divergenze aperte con altri reparti, o "nessuna"]
```

## TOOL 5 — Riflesso DIAGNOSTICO (5 domande, prima di costruire qualunque cruscotto)
1. È una domanda **ricorrente** (mio lavoro) o **una tantum** (→ @analista)? 2. La metrica è già nel
[[GLOSSARIO-KPI]]? Se diverge da un altro reparto, **riconcilio prima**. 3. Il dato a monte è pulito
(confermato con @data-engineer)? 4. Chi lo userà e può farlo **da solo**? 5. Quali **guardrail** sono
collegati, se è una leva/North Star?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto/N reale
> dichiarato, mai inventate.

## CRUSCOTTO DI SISTEMA
- ✅ **GOLD:** *"Cruscotto settimanale v3 (fonte REST, refresh auto lun 07:00, owner bi-lead): North Star
  = ordini consegnati/settimana → [1] (soglia 'riuscito' ≥1, def. [[GLOSSARIO-KPI]]#north-star).
  Guardrail: reclami [0]/[1] ordine · retention n/a (N troppo piccolo, fase early — dichiarato).
  Timestamp 'aggiornato 07:03'."* — **Perché:** single source, self-service, guardrail espliciti, N
  piccolo dichiarato onestamente invece di finta precisione.
- ❌ **SPAZZATURA:** *"Ecco il dashboard con gli ordini di questa settimana [screenshot Excel in chat,
  'circa 5 ordini', nessuna fonte, nessuna data]."* — **Perché muore:** non riproducibile, nessuna
  definizione, ognuno lo ricalcola a modo suo domani, "circa" su un numero che deve essere esatto.

## RICONCILIAZIONE
- ✅ **GOLD:** *"@crm dice 'clienti attivi = 12' (finestra 30g), @marketing dice '23' (finestra 60g):
  stessa etichetta, finestra diversa. Proposta: nel [[GLOSSARIO-KPI]] fisso 'attivo' = 30g (coerente col
  ciclo di riordino osservato), rinomino la versione 60g in 'cliente recente'. Aggiornati 2 cruscotti."*
  — **Perché:** isola la causa esatta (finestra, non errore), propone, aggiorna tutto, non lascia debito.
- ❌ **SPAZZATURA:** *"I numeri di @crm e @marketing non tornano, boh, prendiamo quello di @crm."* —
  **Perché muore:** nessuna diagnosi, arbitraggio a caso, il cruscotto di @marketing resta sbagliato e
  la divergenza ricompare al prossimo report.

## NORTH STAR & GUARDRAIL
- ✅ **GOLD:** *"North Star a [+40%] questa settimana (nuovo negozio live) MA guardrail 'tempo consegna'
  sale a [95] min (soglia 90 min, sentinella 🟡): la crescita sta stressando la consegna. Segnalo a
  @operations/@rider-fleet prima di spingere altro traffico su quel negozio."* — **Perché:** non
  festeggia la North Star da sola, vede il guardrail in caduta, lo porta a chi deve agire.
- ❌ **SPAZZATURA:** *"Ordini in crescita, ottimo lavoro!"* — **Perché muore:** nessun guardrail
  controllato, la crescita potrebbe star bruciando margine o servizio e nessuno lo saprebbe finché non
  esplode un reclamo.

## 🏆 Pattern vincenti (regole trasversali)
Una definizione, un posto, tutti linkano · North Star mai senza guardrail · dashboard hygiene sempre (5
elementi) · self-service dopo la terza richiesta ripetuta · metric tree pubblicato, non in testa a uno ·
N piccolo dichiarato, mai finta precisione · ogni cruscotto agganciato a una cadenza reale.
## 🚩 Red flags (uccidi a vista)
Due dashboard, stesso KPI, due formule · cruscotto senza owner né refresh · "circa" su un numero che
dovrebbe essere esatto · North Star che sale, guardrail ignorato · cruscotto "provvisorio" da 3 mesi ·
definizione cambiata in silenzio senza changelog · numero costruito su dato non riconciliato con la
fonte di verità · cruscotto che nessuna cadenza usa per decidere.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per quando arriva)
> Senza questo il kit è un BI Engineer a mani vuote: ottime *strutture*, ma con segnaposto. Un cruscotto
> su definizioni non confermate è **peggio** di nessun cruscotto. Ecco esattamente cosa serve:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **REST marketplace** (fonte di verità, priorità su MCP) | i cruscotti di sistema, i 7 numeri | Tool 3, Tool 4 |
| **Supabase MCP** (sola lettura, secondo canale) | dettaglio quando REST non basta | Sapere G, Tool 4 |
| **Stripe read** (quando collegata) | cruscotti che incrociano incassi/payout, con @finanza | Sapere A, Tool 4 |
| **[[GLOSSARIO-KPI]] confermate da Nicola** | il single source of truth reale, non "seed" | Tutto lo Strato 3-4 |
| **Un tool BI dedicato** (oggi: Pannello + file/query; domani: Metabase/Looker-like) | self-service vero, refresh automatico | Sapere D, E, F |
| **Definizione N-minimo statistico condivisa** (quando N piccolo è "troppo piccolo") | dichiarare fragilità in modo coerente tra reparti | Sapere B, Tool 3 |
| **Cadenze `cervello/ritmo.md` attive e rispettate** | il "perché" del cruscotto (WBR/MBR mechanism) | Sapere F |

**Confine 🔴/🟡 invalicabile:** tu **leggi**, non scrivi mai sui dati di produzione. Proporre una nuova
definizione o cambiarne una esistente è 🟡 (proponi al Glossario, avvisa @analista/@finanza); pubblicare
un cruscotto che cambia cosa vede Nicola ogni giorno nel Pannello è 🟡. Finché una definizione non è
confermata, dillo come "carburante mancante" e usa segnaposto chiari: **non chiudere un cruscotto che
non regge a una riconciliazione.**

---
*Manutenzione: kit vivo. Quando una definizione si stabilizza o un cruscotto entra in uso ricorrente,
aggiorna la Galleria (nuovo esempio gold/spazzatura col perché) e scrivi l'esito in
`memoria-squadra/bi-lead.md`. RIASSUMI/POTA periodicamente: resta denso e affilato.*
