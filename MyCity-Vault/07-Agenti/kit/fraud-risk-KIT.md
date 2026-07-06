---
tipo: kit-mestiere
ruolo: fraud-risk
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso (storico ordini etichettato + Stripe Radar, oggi assenti/scarsi in fase early)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · .claude/agents/fraud-risk.md · 05-Soldi-Rischi/Rischi & Compliance.md
---

# 🧰 KIT MESTIERE — fraud-risk (il "cervello allenato" del Transaction Risk Analyst)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un risk analyst di
> Amazon/Glovo/Stripe **sa e usa** (strati 3-6): il sapere quantitativo, gli strumenti passo-passo, la
> galleria di casi, e il carburante che serve. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).
> **Regola madre:** non esiste una soglia "sicura" in assoluto — esiste la soglia il cui costo netto (€
> di frode evitata meno € di attrito sui buoni) è il migliore per QUESTO volume, in QUESTO momento.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. La matrice dei quattro esiti (il fondamento di tutto lo scoring)
Ogni decisione di rischio produce uno di quattro esiti — impara a nominarli prima di parlare di "sicuro/non sicuro":
- **Vero Positivo (TP):** hai bloccato/flaggato una frode vera → cassa salvata.
- **Vero Negativo (TN):** hai lasciato passare un ordine buono → vendita conclusa, nessun costo.
- **Falso Positivo (FP):** hai bloccato/flaggato un cliente onesto → attrito, ordine perso, fiducia bruciata.
- **Falso Negativo (FN):** hai lasciato passare una frode → perdita diretta (merce, chargeback, promo).
- **Precision** = TP / (TP+FP): "quando dico frode, quante volte ho ragione?". **Recall** = TP / (TP+FN):
  "di tutte le frodi vere, quante ne prendo?". **Alzare l'una spesso abbassa l'altra**: è un trade-off, non
  un bug da risolvere — la soglia sceglie DOVE stare su quella curva.

## B. Il costo asimmetrico dei due errori (si misura in euro, non a sensazione)
- **Costo del Falso Positivo** = valore dell'ordine perso + probabilità che il cliente non torni più (churn
  da attrito) + costo reputazionale (in una città piccola come Piacenza, un cliente respinto per errore lo
  racconta). Su un marketplace **early-stage con pochi clienti**, ogni FP pesa il **doppio** della media di
  un marketplace maturo: non hai volume da "assorbire" l'errore.
- **Costo del Falso Negativo** = importo dell'ordine perso + fee di chargeback (se arriva a disputa, ≈15€ +
  l'importo) + eventuale payout già versato al negozio (che NON si recupera facilmente) + il precedente che
  incoraggia il prossimo tentativo (i frodatori si scambiano informazioni su cosa funziona).
- **Regola di calibrazione:** se il costo medio di un FP > costo medio di un FN sul tuo volume, la soglia
  va spostata verso "lascia passare di più" (alza il bar per bloccare). Se è il contrario, verso "blocca di
  più". **Il calcolo, non l'istinto, decide da che parte stare.**
- **Su MyCity oggi:** con pochi ordini reali e nessuno storico di frode confermata, il costo del FN è ancora
  ignoto (nessuna perdita registrata) mentre il costo del FP è enorme in proporzione (pochissimi clienti da
  perdere) → **calibra di default verso il minimo attrito**, alza la guardia solo su cluster di segnali forti.

## C. Velocity checks e segnali (la libreria che riconosci a vista)
- **Velocity (il segnale più economico e forte):** N ordini/carte/account nella stessa finestra breve dallo
  stesso device/IP/email-pattern; stessa carta su email diverse in pochi minuti; stesso indirizzo di
  consegna su account "diversi". La frequenza anomala è quasi sempre più predittiva del singolo dato.
- **Segnali deboli che si sommano (nessuno basta da solo):** carta aggiunta pochi minuti prima dell'ordine,
  indirizzo di fatturazione ≠ consegna, importo anomalo rispetto allo storico del cliente (o "quasi tutto
  esaurito" — comportamento da rivendita), orario insolito, email "usa e getta" o con pattern nome+numeri.
- **Friendly fraud / resi-rimborsi falsi:** tasso di "non arrivato"/"non come descritto" molto sopra la
  media dello stesso cliente su ordini **con prova di consegna**; reso sistematico dopo l'uso (wardrobing);
  richieste di rimborso ripetute con motivazioni diverse ogni volta.
- **Account multipli / promo abuse:** stessi dati (telefono, IBAN, device, indirizzo) su più account per
  moltiplicare sconto-primo-ordine o referral; codici promo riciclati tra account collegati; picco di
  redemption anomalo appena dopo il lancio di una promo (il segnale arriva prima del danno pieno, se guardi).
- **Carding (test di carte rubate):** micro-ordini o tentativi falliti ripetuti su carte diverse dallo stesso
  device/sessione (il frodatore "prova" quali carte sono ancora valide) prima di un ordine grosso.

## D. Proporzionalità e frizione calibrata (la scala dell'azione)
- **La risposta scala col rischio, non parte dal massimo:** `nessuna azione → monitora → step-up (verifica
  extra: SMS/email/ri-conferma) → hold temporaneo (reversibile) → deny/blocco (irreversibile)`.
- **Frizione invisibile ai buoni, visibile solo al rischio alto.** Un controllo passivo (scoring in
  background) non costa nulla al cliente onesto; uno step-up costa qualche minuto solo a chi supera la
  soglia. Non applicare mai lo stesso attrito a tutti.
- **Preferisci sempre la misura reversibile** (hold, step-up) al blocco secco finché il cluster di segnali
  non è schiacciante: se ti sbagli, torni indietro senza aver perso il cliente.

## E. Arms race e degrado delle regole
- Una regola nota (es. "blocchiamo sopra gli 80€") si aggira in poche settimane: il frodatore adatta
  l'importo. Le difese vange **stratificate** (più segnali indipendenti combinati) e **riviste
  periodicamente**, non scolpite una volta per sempre.
- Ogni regola pubblicata (anche solo internamente, se il team cambia) ha una data di scadenza implicita:
  ricalibra quando il volume cresce o quando cambia lo storico etichettato.

## F. L'aggancio MyCity (dove il sapere diventa il NOSTRO)
Marketplace **giovane, pochi ordini reali, Piacenza è una città piccola**: quasi ogni cliente è "nuovo" e
quasi ogni carta è "appena aggiunta" — una regola pensata per un marketplace maturo (dove "carta nuova" è
un segnale raro quindi forte) qui è **rumore puro**, perché è la normalità. Finché non hai uno storico di
frode confermata, il tuo lavoro è più **checklist di segnali convergenti + step-up proporzionato** che
"modello". Dichiaralo sempre: una soglia stimata non è una soglia calibrata.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — CHECKLIST SEGNALI PER ORDINE (raccogli prima di scorare)
1. [ ] **Velocity:** quanti ordini/tentativi sulla stessa carta/account/device/IP nell'ultima ora/giorno?
2. [ ] **Carta:** aggiunta da quanto tempo? Fatturazione = consegna? Paese/valuta coerenti?
3. [ ] **Account:** età dell'account, primo ordine o storico, dati (telefono/indirizzo) condivisi con altri account?
4. [ ] **Importo:** coerente con lo storico del cliente o anomalo (molto più alto, o "tutto esaurito")?
5. [ ] **Promo/coupon:** è stato usato un codice? È il primo utilizzo o un pattern di redemption ripetuta?
6. [ ] **Storico resi/rimborsi:** tasso "non arrivato"/"non come descritto" del cliente vs la media?
7. [ ] **Segnale d'innesco:** da dove arriva il sospetto (sentinella automatica, negozio, supporto)?
> Regola: **1 segnale isolato non basta mai.** Conta quanti segnali indipendenti convergono (Tool 2).

## TOOL 2 — MATRICE DI RISCHIO (impatto € × segnali convergenti)
Posiziona ogni caso; la cella indica l'energia da mettere e l'azione di partenza (poi affinata dal Tool 3).

| | **1 segnale** (isolato) | **2-3 segnali** (convergenti, benigno improbabile) | **≥4 segnali indipendenti** (benigno escluso) |
|---|---|---|---|
| **Impatto ALTO** (>100€ o cliente/negozio ripetuto) | 🟢 monitora, nessuna azione | 🟡 step-up (verifica extra) | 🟡 hold reversibile + 🔴 proponi deny/blocco con prove |
| **Impatto MEDIO** (30-100€) | 🟢 nessuna azione, annota | 🟢 monitora, eventuale step-up leggero | 🟡 step-up, poi hold se non risponde |
| **Impatto BASSO** (<30€) | 🟢 nessuna azione | 🟢 monitora | 🟢 step-up leggero, mai blocco secco per un importo minimo |
> L'impatto alto con 1 solo segnale **NON** giustifica un'azione dura: giustifica il **monitoraggio**, non
> il blocco. È la convergenza di segnali indipendenti — non l'importo da solo — che sposta l'azione.

## TOOL 3 — ALBERO DI DECISIONE (allow → step-up → hold → deny)
```
Ho ≥2 segnali indipendenti che convergono? ── NO ─→ 🟢 ALLOW, monitora in background (nessun attrito)
        │ SÌ
        ▼
Lo scenario benigno è escluso? (nuovo cliente per il marketplace,
non per il segnale specifico)               ── NO ─→ 🟢 ALLOW con step-up leggero (facoltativo, es. email di conferma)
        │ SÌ
        ▼
Impatto € (Tool 2): BASSO/MEDIO             ── ─────→ 🟡 STEP-UP (verifica extra), sblocco rapido se conferma
        │ ALTO o cliente/pattern ripetuto
        ▼
🟡 HOLD reversibile (non spedire, non addebitare ancora) + avviso a Nicola
        │ se il cluster resta o si aggrava dopo la verifica
        ▼
🔴 PROPONI deny/blocco/sospensione account — con segnali, stima costo netto, confidenza → firma Nicola
```
**Principio guida:** ad ogni nodo scegli la misura **più reversibile** che gestisce il rischio *adesso*;
il blocco definitivo è **sempre 🔴** e richiede la firma di Nicola con i numeri allegati.

## TOOL 4 — CALIBRAZIONE DELLA SOGLIA (il cuore quantitativo — usa numeri reali o stime dichiarate)
```
REGOLA PROPOSTA: <descrizione segnali/soglia>          periodo/fonte: <Supabase/Stripe, AAAA-MM>
(A) Volume stimato di ordini toccati dalla regola/mese     [____] ordini
(B) Di questi, quanti probabilmente sono frode vera (TP)   [____]  (stima onesta, dichiarata "%")
(C) Di questi, quanti probabilmente sono clienti onesti (FP) [____]
(D) Valore medio ordine coinvolto                         € [____]
(E) Costo medio di un FP (ordine perso + churn stimato)   € [____]
(F) Costo medio di un FN (perdita + fee dispute + payout) € [____]
──────────────────────────────────────────────
BENEFICIO = B × F        COSTO = C × E
COSTO NETTO = COSTO − BENEFICIO   ⟵ se negativo (beneficio > costo), la regola conviene
```
**Output atteso:** costo netto stimato + confidenza % + raccomandazione (adotta / scarta / adotta solo
come step-up leggero). Se manca lo storico per B/C, **dichiaralo come stima esplicita**, non presentarla
come dato misurato — è la differenza tra un fuoriclasse e chi inventa un modello.

## TOOL 5 — TEMPLATE DI CASO/REGOLA (documentazione, audit-ready)
```
CASO/REGOLA FRAUD-RISK — <id breve> · <AAAA-MM-GG HH:MM Piacenza>
• SOGGETTO: <ordine/account — riferimento tecnico, NO dati carta/personali in chiaro>
• SEGNALI (Tool 1): <elenco, con quanti convergono>
• MATRICE (Tool 2): impatto <A/M/B> × segnali <1/2-3/≥4> → fascia <…>
• AZIONE (Tool 3): <allow / step-up / hold / deny> — perché proporzionata e reversibile
• COSTO NETTO stimato (Tool 4, se regola): <€, con confidenza %>
• COLORE: 🟢 / 🟡 / 🔴   • REPARTI DA ALLINEARE: <trust-safety se contenuto/venditore, dispute se chargeback aperto, finanza se cassa>
• ESITO (a posteriori): <frode confermata / falso positivo / da ricalibrare> → lezione in memoria-squadra/fraud-risk.md
```

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande prima di scorare qualunque caso)
1. Quanti **segnali indipendenti** convergono (non uno solo)? 2. Che **tasso di falsi positivi** genera
questa regola/soglia sul volume reale (o stimato)? 3. È un **pattern** (→ regola) o un **caso singolo**
(→ gestiscilo senza generalizzare)? 4. L'azione è **proporzionata e reversibile**? 5. È mio (frode
transazionale) o di **trust-safety** (moderazione/venditore) o di **dispute** (chargeback già aperto)?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: CASO · VERDETTO · PERCHÉ. Cifre tra `[…]` = segnaposto, non inventate.

## CARTA RUBATA / CARDING
- ✅ **GOLD:** *"Ordine #[__] € [92]: carta aggiunta 4 minuti fa, indirizzo di consegna ≠ fatturazione, 3
  ordini sulla stessa carta in 10 minuti con email simili (nome+numero incrementale). 4 segnali
  convergenti, impatto medio → **Azione 🟡 step-up**: richiedo conferma SMS prima di spedire. Se conferma,
  sblocco in 5 minuti (attrito minimo); se non risponde in 24h, **hold** e valuto deny. Costo netto stimato:
  se è frode, evito € [92]+fee dispute; se falso positivo, perdo un ordine e una email di scuse."* —
  segnali convergenti, azione reversibile e proporzionata, costo dichiarato.
- ❌ **SPAZZATURA:** *"Blocchiamo ogni ordine sopra 80€ pagato con una carta appena aggiunta."* — un solo
  segnale, nessuna stima di impatto: su MyCity **quasi ogni cliente** ha la carta "appena aggiunta" (prima
  volta che compra qui). Questa regola bloccherebbe soprattutto clienti onesti, non frodatori.

## RESI/RIMBORSI FALSI (friendly fraud)
- ✅ **GOLD:** *"Cliente #[__]: 4 richieste 'non arrivato' su 6 ordini (67%) vs media clienti [8%], tutte su
  consegne **con prova di consegna** (id #…, #…). Pattern, non singolo reso. **Azione 🟡:** chiedo
  chiarimenti + sospendo il rimborso automatico per questo cliente (reversibile), monitoro i prossimi 2
  ordini prima di qualunque sospensione."* — la frequenza è la prova, azione reversibile, lascia spazio al benigno.
- ❌ **SPAZZATURA:** *"Ha chiesto un rimborso due volte questo mese, sarà un truffatore."* — 2 resi possono
  essere prodotti davvero difettosi; nessun confronto con la media, nessuna prova di dolo. Sproporzione.

## ACCOUNT MULTIPLI / ABUSO PROMO
- ✅ **GOLD:** *"3 account con stesso numero di telefono e stesso indirizzo di consegna, ciascuno ha usato
  il codice 'primo ordine -20%' nella stessa ora. Segnale forte e verificabile (dato oggettivo condiviso).
  **Azione 🟡:** limito il codice a 1 uso per dato condiviso (telefono/indirizzo), verifico gli account
  prima di onorare gli sconti extra; **non blocco** gli account, solo il beneficio duplicato."* — colpisce
  l'abuso specifico (il beneficio), non l'utente, resta reversibile.
- ❌ **SPAZZATURA:** *"Due ordini dallo stesso indirizzo, probabilmente stanno truffando col codice
  promo."* — un indirizzo condiviso è normalissimo (famiglia, coinquilini): senza il secondo segnale
  (stesso telefono, stesso device) è solo un'ipotesi, non un caso.

## 🏆 Pattern vincenti (regole trasversali)
Segnali convergenti > segnale isolato · costo dei due errori in euro, non a sensazione · frizione
calibrata (invisibile ai buoni) · reversibile prima dell'irreversibile · su MyCity early-stage il falso
positivo pesa più della media · ogni soglia dichiarata come stima finché non c'è storico etichettato.
## 🚩 Red flags (uccidi a vista)
Blocco secco su un solo segnale · regola "di pancia" senza stima di impatto · soglia mai ricalibrata ·
ottimizzare solo su recall (blocca tutto) o solo su precision (lascia passare tutto) · confondere frode
transazionale con moderazione contenuti (→ trust-safety) o disputa già aperta (→ dispute) · dati
carta/personali in chiaro nei file · agire su un 🔴 senza firma.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, dove si innesta)
> Senza questo il kit è un risk analyst a mani vuote: ragiona bene ma ogni soglia resta una stima. Ecco
> ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Storico ordini con esito etichettato** (frode confermata / falso positivo) | calibrare precision/recall e il Tool 4 con numeri reali invece di stime | Tool 4, Sapere B |
| **Stripe Radar risk score** (se attivo) | un segnale aggiuntivo pronto, riduce il lavoro di scoring manuale | Tool 1, Tool 2 |
| **Supabase `orders`/`profiles`** (velocity, dati ripetuti, storico cliente) | i segnali concreti su cui costruire la checklist | Tool 1, Sapere C |
| **Uso di codici promo/coupon** (redemption per account/dato condiviso) | rilevare il promo abuse e i pattern di account multipli | Tool 1, Galleria |
| **Policy scritte** (soglie/azioni accettate, quando fare step-up vs hold) | rendere il verdetto una regola condivisa, non arbitrio | Tool 2, Tool 3 |
| **Definizioni condivise** con @trust-safety/@dispute/@finanza (cosa è "frode", una sola soglia) | coerenza cross-funzionale, niente doppioni di giudizio | Tool 5, vettore coerenza |

Finché manca lo storico etichettato (probabile, in questa fase early), **non presentare una soglia come
calibrata**: usa la checklist di segnali convergenti, dichiara la stima e il costo netto come tale, e
chiedi a Nicola lo storico come il carburante che porta il kit da "checklist onesta" a "modello vero".

---
*Manutenzione: kit vivo. Ogni caso che si chiude (frode confermata o falso positivo) → aggiorna la
Galleria e ricalibra le soglie del Tool 2/4; post-mortem senza colpa in `memoria-squadra/fraud-risk.md`.
RIASSUMI/POTA mensile: resta denso e affilato.*
