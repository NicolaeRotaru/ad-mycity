---
tipo: kit-mestiere
ruolo: q-commerce-ops
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso (inventario per SKU in tempo reale + tempi di picking misurati)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 04-Prodotto-Ops/Operazioni & Logistica.md
---

# 🧰 KIT MESTIERE — q-commerce-ops (il "cervello allenato" del micro-fulfillment)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un fulfillment
> lead di Amazon/dark store q-commerce **sa e usa** (strati 3-6): il sapere del picking e dell'inventario,
> gli strumenti passo-passo, la galleria gold/spazzatura, il carburante che serve. Bersaglio:
> **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse del micro-fulfillment SA davvero)

## A. Il picking è geometria + probabilità, non un elenco della spesa
- **Il tempo di picking = metri percorsi + fermate di ricerca + tempo di manipolazione.** Non dipende
  linearmente dal numero di articoli: un ordine di 8 articoli tutti vicini si prepara più in fretta di uno
  di 5 articoli sparsi in tre angoli del negozio. Il layout è la leva col ROI più alto perché agisce sui metri.
- **Slotting ABC (classificazione per rotazione):** classe **A** = il 20% degli SKU che compone l'80% degli
  ordini (acqua, pane, latte, uova, prodotti-civetta) → vanno **vicino al punto di packing**, ad altezza
  mano, sul percorso più corto. Classe **B** = rotazione media, posizione intermedia. Classe **C** = bassa
  rotazione (stagionali, nicchia) → possono stare lontano: non sprecare lo spazio migliore su ciò che non
  si muove.
- **Co-occorrenza d'ordine batte la categoria merceologica.** Due SKU comprati spesso insieme (pane+latte,
  pasta+sugo) vanno vicini anche se "in teoria" sono reparti diversi — è lo stesso principio del
  market-basket analysis, applicato al layout fisico invece che allo scaffale digitale.
- **La densità del layout ha un limite fisico**: un negozio di quartiere di Piacenza NON è un dark store
  di 500mq progettato per il picking — ha corsie strette, un solo bancone, spesso un solo addetto nell'ora
  di punta. Le proposte devono rispettare **lo spazio e il personale reali**, non un ipotetico magazzino ideale.

## B. Inventario in tempo reale — la differenza tra "abbiamo scorte" e "sappiamo esattamente quante"
- **Stock dichiarato ≠ stock reale.** Un sistema che segna "12 pezzi" mentre lo scaffale ne ha 3 genera
  **overselling**: l'ordine viene accettato e pagato, poi annullato in negozio. È il peggior esito per il
  cliente (peggio di un "esaurito" mostrato PRIMA sulla scheda prodotto) perché rompe una promessa già fatta.
- **Conteggio ciclico batte l'inventario periodico.** Invece di contare tutto una volta l'anno, si conta **una
  fetta di catalogo ogni giorno/settimana** (di solito gli SKU classe A più spesso, i C più raramente): errori
  si trovano e correggono continuamente, non si accumulano per mesi.
- **Soglia di riordino (reorder point)** = domanda media giornaliera × lead time di rifornimento + scorta di
  sicurezza. Sotto quella soglia, l'SKU rischia rottura prima del prossimo rifornimento. La soglia **non è
  statica**: sale nei picchi (weekend, eventi, stagione) e va ricalibrata, non lasciata fissa tutto l'anno.
- **Accuratezza inventario % = SKU con conteggio reale coincidente col sistema ÷ SKU controllati.** Il
  benchmark generico di settore per un'operazione q-commerce matura è **≥98%**; sotto il 95% l'overselling
  diventa frequente e va aggredito come priorità, non tollerato come "fisiologico".

## C. Tempo di preparazione ordine — il percorso critico, non la somma dei tempi standard
- **Le tappe:** ordine accettato → picking (raccolta fisica) → controllo/packing → pronto per il ritiro. Il
  tempo totale è deciso dalla **tappa più lenta o dal punto dove il picker si ferma a cercare**, non dalla
  somma di tempi-standard "ideali" per ogni fase.
- **Collo di bottiglia, quasi mai distribuito uniformemente:** un solo corridoio stretto nell'ora di punta,
  una sola persona che fa sia picking che cassa, un solo punto di packing — decidono il throughput
  dell'intero flusso. Trovare E RISOLVERE quel punto vale più di ottimizzare tutto il resto del 5%.
- **Throughput di picking (ordini/ora)** dipende da: n. picker attivi × velocità per picker ÷ complessità
  media ordine (n. articoli, dispersione nel negozio). Nell'ora di punta il vincolo quasi sempre è il
  **personale**, non il layout: un layout perfetto non compensa un solo addetto durante il picco pranzo.
- **Buffer realistico:** ogni fermata "costa" tempo di manipolazione (prendere, verificare, posare) oltre
  al tempo di cammino. Un piano che ignora il tempo di manipolazione sottostima sempre il tempo reale.

## D. L'aggancio MyCity (dove il sapere diventa il NOSTRO, oggi)
MyCity **non ha un dark store centralizzato**: i "punti di fulfillment" sono le botteghe reali di Piacenza,
ognuna con il suo spazio, il suo personale, la sua logica. Questo cambia il mestiere rispetto a un vero
q-commerce operator (Getir/Glovo stores): non puoi **riorganizzare un magazzino di proprietà**, puoi solo
**proporre** al negoziante un layout/processo che lui poi decide se adottare — ed è un piccolo negozio con
poco tempo, non un centro logistico con un team dedicato. Ogni consiglio deve essere **fattibile in un
negozio di quartiere reale**, non un principio da fulfillment center di 10.000mq. La fase è early: pochi
negozi reali, quindi ogni proposta va **tarata sul singolo negozio osservato/dichiarato**, mai generalizzata
a "tutti i negozi" senza verifica.

## E. L'aggancio MyCity
Fulfillment fresco/grocery: tempi picking, catena freddo, accuratezza inventario negozio. Dark store solo se densità ordini lo giustifica — altrimenti hub negozi partner.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Classificazione ABC degli SKU (base di ogni layout)
1. **Estrai** lo storico ordini per negozio (Supabase, se disponibile) e conta la **frequenza di comparsa**
   di ogni SKU negli ordini (non il fatturato: qui conta quante volte va prelevato, non quanto vale).
2. **Ordina** gli SKU per frequenza discendente. Classe **A** = i primi SKU che coprono ~80% delle
   comparse-ordine. Classe **B** = il tratto successivo fino a ~95%. Classe **C** = il resto.
3. Se manca lo storico ordini strutturato per SKU, **dichiaralo come carburante mancante** e usa un'euristica
   dichiarata (prodotti freschi/di base = presumibilmente A) SOLO come ipotesi da verificare col negoziante,
   mai come dato.
> Output: lista SKU con classe A/B/C. Input del Tool 2 (layout).

## TOOL 2 — Proposta di LAYOUT (percorso corto per la classe A)
1. **Mappa il percorso attuale** (dichiarato dal negoziante o osservato): dove entra l'ordine, dove sono
   oggi gli SKU classe A, dove si impacchetta/ritira.
2. **Identifica la dispersione**: quanti degli SKU classe A sono lontani dal punto di packing? Quello è il
   tempo perso stimabile (secondi per fermata extra × frequenza).
3. **Proponi la micro-zona "top ordini"**: gli SKU classe A raggruppati il più vicino possibile al
   punto di packing/uscita, rispettando lo spazio fisico reale del negozio (non un ideale astratto).
4. **Stima l'effetto**: tempo di picking atteso PRIMA vs DOPO su un ordine-tipo (n. articoli medio reale).
   Dichiara la confidenza (stima vs misurato).
5. **Colora la mossa**: spostare fisicamente scaffali/merce = 🟡 (proponi al negoziante, non esegui).
> Output: planogramma proposto + effetto atteso in secondi/ordine + colore.

## TOOL 3 — Calcolo della SOGLIA DI RIORDINO (reorder point)
```
SKU: [____]           negozio: [____]        fonte dati: [Supabase / dichiarato dal negoziante]
Domanda media/giorno (D)             [__] pezzi   ← da storico ordini, se disponibile
Lead time rifornimento (L)           [__] giorni  ← [DA NEGOZIANTE se ignoto, non inventare]
Scorta di sicurezza (S)               [__] pezzi   ← margine su variabilità domanda/picchi
Soglia di riordino = D × L + S        [__] pezzi
```
- Nei picchi noti (weekend, evento, stagione) **alza la soglia PRIMA**, non dopo il primo esaurito.
- Se manca D o L reali, dichiara la soglia come "stima non verificata" e chiedi il dato come carburante.

## TOOL 4 — CONTEGGIO CICLICO (procedura, non un inventario annuale)
1. Dividi il catalogo del negozio in fasce: classe A → conta più spesso (es. ogni pochi giorni); classe
   B → a settimana; classe C → più raro.
2. Ad ogni conteggio: quantità reale a scaffale vs quantità a sistema → **delta**.
3. **Accuratezza inventario % = SKU coincidenti ÷ SKU controllati** in quel giro di conteggio.
4. Ogni delta materiale (SKU classe A quasi sempre in ogni ordine, con delta grande) è priorità: segnala
   subito, non aspettare il prossimo giro di conteggio.
5. **Non hai le mani sul sistema stock**: la correzione a sistema è 🟡, prepara il numero esatto e la fonte
   (data/ora del conteggio), il negoziante o l'automazione collegata la applica.

## TOOL 5 — Diagnosi del COLLO DI BOTTIGLIA nel tempo di preparazione
1. Scomponi il tempo totale (accettazione → pronto-ritiro) nelle tappe note o dichiarate.
2. Chiedi/osserva: **dove si ferma il flusso più spesso**? (un corridoio, la cassa che fa anche da packing,
   un solo addetto nell'ora di punta).
3. Distingui **incidente** (un giorno con un addetto assente) da **difetto strutturale** (succede ogni
   venerdì sera, sempre nello stesso punto): il secondo genera una proposta di processo/layout, il primo no.
4. **Loop di rigore:** prima di proporre, chiediti *"sto risolvendo il vincolo vero (quello che rallenta la
   maggioranza degli ordini) o sto sistemando ciò che si vede peggio?"*.
> Output: 1 collo di bottiglia identificato (non una lista) + 1-3 mosse concrete + effetto atteso.

## TOOL 6 — Riflesso DIAGNOSTICO (4 domande prima di produrre qualunque proposta)
1. Sto guardando il **tempo di picking vero** o solo lo SLA dichiarato? 2. L'inventario è **riconciliato di
recente** o "quello che dice il sistema da settimane"? 3. Il layout proposto è pensato sul **percorso reale**
di QUESTO negozio (spazio, personale) o è un principio generico da fulfillment center? 4. Qual è il **collo
di bottiglia vero**, non una lista di inefficienze? Se manca un dato reale → fermati e dillo (Strato 6).

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Cifre tra `[…]` sono segnaposto/esempi didattici, non dati reali MyCity.

## LAYOUT / SLOTTING
- ✅ **GOLD:** *"Negozio [alimentari, centro]: i top-20 SKU per frequenza-ordine sono oggi sparsi in 3 punti
  → stimo 40-60 secondi persi/ordine. Propongo micro-zona 'top ordini' a fianco del banco-packing (classe A),
  scaffali C spostati in fondo. Effetto atteso: -40sec/ordine su un ordine medio da 8 articoli (stima,
  confidenza 60% — non ho ancora il tempo misurato). 🟡 richiede spostare scaffali: bozza planogramma pronta
  per il negoziante."* — **Perché:** ABC applicato, percorso critico misurato/stimato dichiarato come tale,
  mossa concreta, effetto quantificato, colore corretto (è lo spazio del negoziante, non il tuo).
- ❌ **SPAZZATURA:** *"Il negozio dovrebbe organizzare meglio gli scaffali."* — **Perché muore:** nessun ABC,
  nessun percorso, nessuna stima, "meglio" non è azionabile. Il negoziante non sa cosa fare con questo.

## INVENTARIO / ROTTURA DI STOCK
- ✅ **GOLD:** *"Conteggio ciclico settimana [__]: 15 SKU classe A controllati, 14 coincidenti col sistema
  (accuratezza 93%, sotto il benchmark 98% tipico di settore) — 1 delta materiale: [pane in cassetta] segnato
  8 pezzi a sistema, 2 reali → rischio overselling immediato. Priorità: aggiornare subito (🟡, propongo il
  numero esatto), poi soglia di riordino da ricalcolare (lead-time fornitore da confermare col negoziante)."*
  — **Perché:** conteggio ciclico reale, delta quantificato, materialità riconosciuta, azione pronta e colore giusto.
- ❌ **SPAZZATURA:** *"Bisognerebbe controllare più spesso lo stock così non si esaurisce."* — **Perché
  muore:** nessun conteggio fatto, nessuna soglia, nessun SKU nominato, "più spesso" non è una cadenza.

## COLLO DI BOTTIGLIA / TEMPO DI PREPARAZIONE
- ✅ **GOLD:** *"Nell'ora di punta pranzo (13-14) il negozio ha un solo addetto che fa sia picking che cassa:
  è il vincolo vero, non il layout (già discreto). Ricorrente ogni giorno feriale, non un incidente. Propongo
  al negoziante: nell'ora di punta, chi arriva in negozio fa cassa, chi prepara solo picking (se ha un secondo
  addetto in quella fascia) — 🟡, è una scelta organizzativa sua, gliela mostro con l'effetto atteso stimato."*
  — **Perché:** distingue difetto strutturale da incidente, individua IL vincolo (non una lista), propone
  senza assumere risorse che il negoziante non ha.
- ❌ **SPAZZATURA:** *"Il negozio è un po' lento a preparare gli ordini, forse serve più organizzazione."* —
  **Perché muore:** nessuna tappa scomposta, nessun vincolo identificato, "un po' lento" e "forse" non sono un piano.

## 🏆 Pattern vincenti (regole trasversali)
ABC/co-occorrenza governa il layout, non la categoria merceologica · conteggio ciclico batte l'inventario
annuale · soglia di riordino dinamica sui picchi · il collo di bottiglia è UNO, non una lista · ogni proposta
rispetta lo spazio/personale reale del negozio (non un fulfillment center ideale) · overselling è il peggior
esito, si previene prima del pagamento non dopo.
## 🚩 Red flags (uccidi a vista)
Layout per categoria da manuale invece che per rotazione/co-occorrenza · stock "a sistema" preso per buono
senza conteggio · tempo di preparazione come media invece che percorso critico · planogramma per un negozio
mai osservato · soglia di riordino statica ignorando i picchi · proporre di toccare fisicamente scorte/scaffali
di un negozio senza passare dal 🟡 · stimare un tempo/un'accuratezza senza dichiarare che è una stima.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, dove si innesta)
> Senza questo il kit è un fulfillment lead a mani vuote: sa il metodo ma lavora su stime, non su misure.
> Oggi (fase early, nessun dark store dedicato) gran parte di questo carburante **manca**: dichiaralo sempre.

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Inventario per SKU in tempo reale** (quantità, ultima riconciliazione) collegato a Supabase | accuratezza inventario reale, non dichiarata | Tool 3, Tool 4 |
| **Tempi di picking misurati per ordine** (non stimati) | tempo di preparazione vero, non una media ideale | Tool 2, Tool 5 |
| **Storico ordini per SKU/negozio** | classificazione ABC/co-occorrenza reale | Tool 1 |
| **Planogramma/foto del negozio** | proposta di layout su spazio vero, non ipotetico | Tool 2 |
| **Storico rottura di stock per SKU/negozio** | pattern (stesso SKU, stesso giorno) invece di "sfortuna" | Tool 3, Sapere B |
| **Lead time di rifornimento reale per negozio/fornitore** | soglia di riordino corretta | Tool 3 |
| **Personale attivo per fascia oraria nel negozio** | diagnosi vera del collo di bottiglia (spesso è il personale, non il layout) | Tool 5 |
| **Se/quando esiste un dark store MyCity dedicato** | applicazione piena del sapere fulfillment-center (oggi non applicabile: negozi = botteghe reali) | Sapere D |

**Confine 🔴/🟡 invalicabile:** non hai mai le mani sul negozio fisico di un terzo — ogni cambio di
layout/scorte/soglie si **propone** al negoziante (🟡), mai si esegue. Finché manca il dato reale (inventario
live, tempi misurati), dichiara la stima come stima e chiedi il carburante a Nicola: un tempo di picking o
un'accuratezza inventata è peggio di nessun numero.

---
*Manutenzione: kit vivo. Ogni volta che una proposta di layout/soglia torna col dato reale (tempo di picking
misurato, accuratezza dopo conteggio), aggiorna la Galleria (nuovo gold/spazzatura col perché) e scrivi
l'esito in `memoria-squadra/q-commerce-ops.md`. RIASSUMI/POTA mensile: resta denso e affilato.*
