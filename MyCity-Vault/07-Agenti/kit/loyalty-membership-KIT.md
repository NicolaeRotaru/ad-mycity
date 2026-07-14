---
tipo: kit-mestiere
ruolo: loyalty-membership
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: dati clienti ricorrenti + costo consegna reale (da finanza/operations)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — loyalty-membership (il "cervello allenato" di chi possiede il Prime di MyCity)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che chi ha
> costruito un programma stile Amazon Prime / Glovo Prime **sa e usa** (strati 3-6): l'economia
> dell'abbonamento ricorrente, gli strumenti passo-passo, la galleria gold/spazzatura, e il
> carburante che serve. Il kit **aggiunge framework e rigore**, non ri-spiega l'ovvio. Bersaglio:
> **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Cos'è davvero un programma membership (e cosa NON è)
- Un membership ricorrente (fee mensile/annuale o soglia "gratis se ordini X volte") **vende
  frequenza futura**, non uno sconto sull'ordine di oggi. Il cliente paga (in denaro o in
  comportamento) per rimuovere una frizione — tipicamente il **costo di consegna** — su ogni
  ordine successivo.
- **Non è** un coupon travestito: un coupon spinge UN acquisto, il membership cambia
  **l'abitudine** (frequenza settimanale/mensile) nel tempo. Se dopo 60 giorni la frequenza dei
  membri non si distingue da quella dei non-membri, il programma non sta facendo il suo lavoro,
  qualunque sia il tasso di iscrizione.
- **Due leve distinte da non confondere:** (1) il **beneficio operativo** (consegna
  inclusa/scontata, accesso anticipato a offerte) che costa alla struttura ordine per ordine; (2)
  i **punti fedeltà**, che sono una passività differita (si spendono dopo, non subito) e vanno
  trattati come un "conto punti" con un tasso di riscatto atteso, non come un costo immediato.
- Benchmark generico di settore (MAI dato MyCity finché non misurato): i programmi
  membership consumer-ricorrenti di successo (Amazon Prime, Glovo Prime/Deliveroo Plus) mostrano
  tipicamente **frequenza d'ordine dei membri 1,5-3× superiore** ai non-membri e **tassi di
  rinnovo mensile ~60-80%** quando il beneficio è percepito come reale. Sono riferimenti per
  calibrare l'ambizione, non numeri da promettere a Nicola come se fossero già nostri.

## B. L'unità economica del membro (scendi SEMPRE al singolo membro/mese)
- **Costo del beneficio per membro/mese** = costo medio di consegna per ordine × ordini/mese del
  membro che rientrano nel beneficio (es. consegna inclusa sotto soglia).
- **Ricavo incrementale per membro/mese** = (ordini/mese del membro − ordini/mese di un
  non-membro comparabile) × contribuzione media per ordine (CM1, dal kit finanza) + eventuale fee
  di iscrizione mensile.
- **Break-even in "ordini extra necessari"** = costo del beneficio per membro/mese ÷
  contribuzione media per ordine (CM1). È il numero-faro: quanti ordini in più al mese deve fare
  un membro rispetto a un non-membro perché il programma smetta di essere un costo.
- **Scenario peggiore (cannibalizzazione totale)**: assumi che ZERO membri cambino comportamento
  — continuano a ordinare come farebbero comunque, ma ora il beneficio (consegna gratis) lo
  ottengono senza contropartita. Questo è il costo massimo del programma se fallisce: va sempre
  calcolato e dichiarato, mai nascosto sotto lo scenario ottimistico.
- **MRR (ricavo mensile ricorrente) della loyalty** = fee di iscrizione × membri paganti attivi.
  È un numero diverso dal GMV: prevedibile, ma piccolo all'inizio — non gonfiarlo confondendolo
  col transato generato dai membri.

## C. Segmentazione e misura (coorte, non aneddoto)
- **Coorte membri vs coorte di controllo**: per ogni metrica (frequenza, scontrino, retention a
  90 giorni) confronta SEMPRE i membri con un gruppo di non-membri comparabile per storico
  d'acquisto pre-iscrizione (altrimenti selezioni solo i clienti già più fedeli, e il programma
  sembra funzionare quando in realtà stai solo misurando chi era già un buon cliente — bias di
  selezione classico).
- **Tasso di rinnovo** (chi resta al ciclo 2, 3, 4) è il verdetto vero, più delle iscrizioni
  lorde. Iscrizioni facili da ottenere con un'offerta di lancio; il rinnovo dice se il valore è
  reale.
- **Tasso di riscatto dei punti** = punti spesi / punti emessi in un periodo. Punti emessi e mai
  spesi non fidelizzano nessuno — sono solo un numero che gonfia un dashboard.
- **Segmenta per comportamento pre-iscrizione**: un cliente che ordinava già 3×/settimana e si
  iscrive non genera lo stesso incrementale di uno che ordinava 1×/mese. Il break-even si calcola
  meglio per segmento, non su una media che nasconde le due popolazioni.

## D. Rischi tipici di un programma membership (early stage)
- **Cannibalizzazione**: il cliente più fedele (quello che avrebbe ordinato comunque) è anche il
  primo a iscriversi — gli dai un beneficio che non ti serviva dare per tenerlo.
- **Capacità operativa**: "consegna inclusa illimitata" senza tetto può intasare i rider nelle ore
  di punta (coordina con @rider-fleet/@dispatch prima di rimuovere ogni soglia).
- **Passività punti**: punti emessi in volume senza piano di riscatto sono un debito verso i
  clienti che nessuno sta tracciando in cassa.
- **Scala prematura**: lanciare a tutta la base clienti prima di un pilota misurato rende
  impossibile isolare l'effetto vero (nessuna coorte di controllo pulita, perché "tutti sono
  membri").

## E. L'aggancio MyCity
Prime/abbonamento: break-even su consegne incluse vs frequenza ordini Piacenza. Non promettere benefit che @operations non regge. Test su cohort piccola prima del lancio.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Il MODELLO di break-even del beneficio (compilabile)
> Riempi SOLO con costi/numeri reali. Se un dato è ignoto → segnaposto `[DA NICOLA/FINANZA:
> costo reale]`, **non inventarlo**.

```
BENEFICIO: [es. consegna inclusa sotto 25€]     periodo/fonte: [___]
(A) Costo medio consegna/ordine (da @finanza)        € [____]
(B) Ordini/mese coperti dal beneficio per membro tipo  [____]
(C) Costo beneficio/membro/mese = A × B              € [____]
(D) CM1 medio per ordine (kit finanza, Tool 1)        € [____]
(E) Fee iscrizione/mese (se presente)                € [____]
─────────────────────────────────────────────
BREAK-EVEN (ordini extra/mese necessari) = C ÷ D       [____] ordini
Ordini extra oggi osservati (pilota/coorte)            [____] ordini   ⟵ se < break-even → 🔴 non regge
SCENARIO PEGGIORE (0 ordini extra, 100% cannibalizzazione):
Costo netto/membro/mese = C − E                      € [____]  ⟵ dichiara SEMPRE questo numero
```
**Output atteso:** break-even in ordini, confronto con l'osservato (o "nessun dato ancora —
serve pilota"), scenario peggiore quantificato, giudizio "regge / non regge / serve pilota".

## TOOL 2 — Procedura di PILOTA prima dello scale-up
1. **Scegli un campione piccolo** (es. 20-50 clienti ricorrenti reali, non tutta la base) e un
   **gruppo di controllo comparabile** (stesso storico d'acquisto pre-pilota, non iscritto).
2. **Fissa la durata** (60-90 giorni: abbastanza per vedere 2-3 cicli d'ordine, non un solo mese).
3. **Misura ogni ciclo**: frequenza d'ordine, scontrino medio, tasso di rinnovo (se c'è una fee),
   costo del beneficio erogato — pilota vs controllo, sempre appaiati.
4. **Confronta col break-even** (Tool 1) usando i numeri REALI del pilota, non la stima iniziale.
5. **Decidi**: scala / ridisegna il beneficio (soglia, importo) / ferma. Scrivi il perché in
   `memoria-squadra/loyalty-membership.md`.

## TOOL 3 — CHECKLIST prima di proporre un beneficio o un cambio (passa ogni voce)
- [ ] Costo del beneficio calcolato con dati reali (non stimato "a occhio").
- [ ] Break-even in ordini extra/mese calcolato (Tool 1).
- [ ] Scenario peggiore (100% cannibalizzazione) dichiarato esplicitamente.
- [ ] Confronto con una coorte di controllo (reale o pilota proposto se non esiste ancora).
- [ ] Tetto/soglia sul beneficio (mai "illimitato" senza limite quantificato).
- [ ] Impatto sulla capacità di consegna verificato con @rider-fleet/@dispatch se il beneficio
      tocca la consegna.
- [ ] Cambi ai termini per membri già iscritti passati da @legale-privacy.
- [ ] Nessun numero di Amazon Prime/Glovo Prime spacciato per dato MyCity (solo benchmark
      etichettato).

## TOOL 4 — Il REPORT LOYALTY (numero + rischio + azione)
```
🎯 PROGRAMMA/BENEFICIO: [es. MyCity Prime — consegna inclusa sotto 25€]
💶 COSTO/MEMBRO/MESE: € [__] (fonte: @finanza, [periodo]) · BREAK-EVEN: [__] ordini extra/mese
📊 OSSERVATO (pilota/coorte): [__] ordini extra/mese reali · tasso rinnovo [__]% · N=[__] membri
⚠️ SCENARIO PEGGIORE: € [__] /membro/mese se zero cambio comportamento (100% cannibalizzazione)
🧭 GIUDIZIO: regge / non regge / serve pilota — [1 riga di perché]
🙋 SERVE DA NICOLA: [firma pilota / firma cambio prezzo (→growth-monetizzazione) / niente]
```
**Ghigliottina prima di consegnare:** «Se 500 clienti si iscrivessero domani tutti insieme, cassa
e consegne reggerebbero questo beneficio, o è un regalo che non possiamo permetterci in scala?»

## TOOL 5 — Riflesso DIAGNOSTICO (5 domande prima di proporre qualunque beneficio)
1. Il beneficio ha un **break-even calcolato** o è "sembra ragionevole"? 2. Sto confrontando
membri **vs coorte di controllo** reale? 3. Il numero che cito è **reale MyCity o benchmark
etichettato**? 4. Ho dichiarato lo **scenario peggiore** (cannibalizzazione totale)? 5. Questa
mossa è mia (il programma) o va passata a **crm-lifecycle** (canale/invio) o
**growth-monetizzazione** (prezzo/leva generale)?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto/pilota, non inventate come dato consolidato.

## PROPOSTA DI LANCIO
- ✅ **GOLD:** *"MyCity Prime, 4,90€/mese, consegna inclusa sotto 25€. Costo consegna reale
  3,50€/ordine (da @finanza). Se un membro fa [2] ordini/mese coperti → costo beneficio 7€/mese;
  con CM1 medio [2,50€]/ordine servono ~2,8 ordini extra/mese per pareggiare. Oggi zero dati di
  coorte (nessun iscritto): propongo pilota su [30] clienti ricorrenti reali per 60 giorni prima
  di aprire a tutti. Scenario peggiore (0 ordini extra): costo netto 7€−4,90€=2,10€/membro/mese,
  limitato ai 30 del pilota. 🟡 accodo il pilota per la firma di Nicola."* — **Perché:** costo
  reale, break-even esplicito, scenario peggiore quantificato e limitato, pilota prima di scalare,
  colore corretto.
- ❌ **SPAZZATURA:** *"Lanciamo un Prime a 4,90€/mese con consegna gratis illimitata su tutto,
  come Amazon, funzionerà sicuramente."* — **Perché muore:** nessun costo reale, "illimitata"
  senza tetto, nessun break-even, benchmark Amazon come certezza, nessun pilota, rischio di cassa
  e di consegna non quantificato.

## MISURA DEL PROGRAMMA
- ✅ **GOLD:** *"Pilota 60gg, N=[28] membri vs [28] controllo comparabile: frequenza membri
  [2,1]→[3,4] ordini/mese (+62%), controllo stabile a [2,0]. Tasso rinnovo al ciclo 2: [71]%.
  Break-even era 2,8 ordini extra: osservato 1,3 extra → 🔴 non ancora in pareggio, ma il trend
  di rinnovo è sano: propongo estendere il pilota 30gg invece di scalare subito."* — **Perché:**
  coorte di controllo vera, numero contro break-even, decisione proporzionata al dato (non scala
  né abbandona di colpo).
- ❌ **SPAZZATURA:** *"Il 90% di chi si è iscritto ha ordinato di nuovo, il programma funziona
  benissimo."* — **Perché muore:** nessuna coorte di controllo (chi si iscrive ordina comunque di
  più, bias di selezione), "ordinato di nuovo" non è break-even, nessun costo confrontato.

## PUNTI FEDELTÀ
- ✅ **GOLD:** *"Proposta punti: 1 punto ogni 10€, riscatto a 100 punti = 5€ di sconto. Tasso di
  riscatto atteso da benchmark generico settore: 20-40% (MAI dato MyCity). Senza dati di riscatto
  reali, propongo tetto emissione [500 punti/mese] finché non misuriamo il tasso vero, per non
  accumulare una passività non tracciata."* — **Perché:** tratta i punti come passività, mette un
  tetto prudente, etichetta il benchmark come tale.
- ❌ **SPAZZATURA:** *"Diamo punti su ogni ordine, i clienti li adorano."* — **Perché muore:**
  nessun piano di riscatto, nessun tetto, nessuna misura, passività silenziosa.

## 🏆 Pattern vincenti (regole trasversali)
Break-even sempre al singolo membro/mese · scenario peggiore (100% cannibalizzazione) sempre
dichiarato · coorte di controllo sempre appaiata · pilota prima dello scale-up · punti trattati
come passività con tetto · benchmark di settore sempre etichettato, mai spacciato per dato MyCity
· ogni cambio di beneficio passa dalla checklist (Tool 3).

## 🚩 Red flags (uccidi a vista)
"Illimitato" senza tetto · break-even mai calcolato · iscritti confusi con clienti fedeli ·
numero di Amazon/Glovo citato come dato nostro · nessuna coorte di controllo · punti emessi senza
piano di riscatto · scale-up diretto senza pilota · beneficio che tocca la consegna senza sentire
@rider-fleet/@dispatch · cambio termini a membri esistenti senza @legale-privacy.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per il prossimo pilota)
> Senza questo il kit è un framework a mani vuote: ottime *strutture*, ma con segnaposto. Un
> break-even su costi inventati è **peggio** di nessun break-even. Ecco esattamente cosa serve:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Costo reale di consegna per ordine** (da @finanza/@rider-fleet) | il break-even del beneficio | Tool 1, Tool 4 |
| **CM1 medio per ordine** (kit finanza) | quanti ordini extra servono per pareggiare | Tool 1 |
| **Numero di clienti ricorrenti reali** (Supabase `orders`/`profiles`) | costruire il campione pilota e la coorte di controllo | Tool 2 |
| **Frequenza d'ordine attuale per cliente** (da @analista) | baseline per misurare l'incrementale | Tool 2, Sapere C |
| **Capacità di consegna nelle ore di punta** (da @rider-fleet/@dispatch) | fissare il tetto del beneficio senza intasare le consegne | Sapere D, Tool 3 |
| **Definizioni [[GLOSSARIO-KPI]] confermate** (retention, frequenza) | coerenza cross-funzionale con @analista/@finanza | Tool 5 |

**Confine 🔴 invalicabile:** il prezzo finale dell'abbonamento e le leve di pricing generali si
coordinano con **growth-monetizzazione**; le comunicazioni ai membri (email/push) passano da
**crm-lifecycle**; i cambi di termini contrattuali per membri già iscritti passano da
**legale-privacy**. Tu proponi il beneficio e il break-even — non esegui da solo ciò che tocca
prezzo, canale o contratto. Finché manca un costo reale, dillo come "carburante" e usa
segnaposto chiari: **non proporre un programma che non regge a un conto vero.**

---
*Manutenzione: kit vivo. A ogni chiusura di ciclo pilota, confronta break-even previsto vs
osservato (lo scostamento deve tendere a zero), aggiorna la Galleria con la riconciliazione
gold/spazzatura reale e scrivi l'esito in `memoria-squadra/loyalty-membership.md`. RIASSUMI/POTA
mensile: resta denso e affilato.*
