---
tipo: kit-mestiere
ruolo: growth-monetizzazione
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-06-27 · carburante reale atteso (margini/AOV/conversione dal DB)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/Finanza & Unit Economics.md
---

# 🧰 KIT MESTIERE — growth-monetizzazione (il "cervello allenato" del fuoriclasse)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un pro **sa e usa**
> (strati 3-6): il sapere, gli strumenti passo-passo, la galleria di esempi, e il carburante che serve.
> Leggilo come la tua testa da 15 anni di esperimenti ROI. Bersaglio: **L7-con-giudizio** (vedi [[RUBRICA-LIVELLI]]).
> La tua regola madre: **ogni idea è un esperimento misurabile con un ritorno atteso in € a margine sano** —
> e lo sconto è l'ultima leva, mai la prima.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Unit economics del marketplace — l'unico modello che conta
Un marketplace non vende: **mette in contatto e prende un take-rate**. Devi avere in testa la catena, sempre.
- **GMV** (Gross Merchandise Value) = valore lordo del venduto sulla piattaforma. Non è il TUO ricavo.
- **Take-rate** = % che MyCity trattiene sul GMV (commissione negozio + eventuale fee cliente). È il tuo
  vero rubinetto: `Net Revenue = GMV × take-rate (+ fee fisse)`. Spostare il take-rate di 1 punto su un GMV
  grande vale più di mille microtest.
- **AOV** (scontrino medio) = GMV / n° ordini. La leva più "pulita": alzarlo non costa acquisizione.
- **Contribution margin per ordine** = `(fee/commissione incassata) − (costo consegna + costo pagamento Stripe ~1.5%+0.25€ + costo variabile servizio)`.
  Se la consegna costa più di quanto incassi sull'ordine, **ogni ordine in più ti fa perdere soldi**: in quel
  regime la leva NON è "più ordini", è AOV o fee consegna. Saperlo è la differenza tra un pro e un dilettante.
- **CAC / LTV** = costo per acquisire un cliente vs margine cumulato che lascia. Regola sana: `LTV > 3× CAC`,
  payback del CAC < 12 mesi. Una leva di retention (riordino, win-back) alza l'LTV senza ricomprare il cliente.
- **Frequenza & retention** sono il moltiplicatore segreto: in un food/grocery marketplace il valore non è il
  primo ordine, è il **secondo e il decimo**. `LTV ≈ AOV × margine% × frequenza_annua × anni_di_vita`.
- **Il P&L a colpo d'occhio:** `Net Revenue − costi variabili (consegna, pagamento, supporto) = contribution`,
  poi meno costi fissi = profitto. Una leva è vera solo se muove **contribution**, non solo GMV o ordini.

## B. Le leve di ricavo — quando usarle, perché, e il rischio di ognuna
Ordine mentale: **prima le leve di struttura (margine intatto), lo sconto per ultimo (regala marginalità).**

1. **Soglia "spedizione gratis" (free-shipping threshold)** — la leva regina dell'AOV. Fissi una soglia poco
   sopra l'AOV attuale ("gratis sopra X€") e il cliente *aggiunge prodotti per arrivarci*. Alza lo scontrino
   **senza sconto**. Regola: soglia ≈ `AOV × 1.15–1.3` (abbastanza vicina da sembrare raggiungibile). Rischio:
   troppo alta → frustra e abbandona; troppo bassa → regali consegne. Va calibrata sulla **distribuzione** dei
   carrelli, non sulla media (vedi Tool 3).
2. **Upsell / cross-sell al checkout** — "aggiungi il pane fresco?", "chi ha preso questo ha preso anche…".
   Ricavo incrementale a frizione ~0, alta confidenza, margine pieno. Il cross-sell migliore è **complementare
   e a basso prezzo** (impulso): non chiedere uno sforzo decisionale al momento del pagamento.
3. **Bundle ad alto scontrino** — confezioni curate ("Spesa Piacentina DOP", "Aperitivo del Sabato") che
   alzano l'AOV e raccontano una storia. Margine spesso migliore del singolo (percezione di valore > somma).
4. **Fee di consegna dinamica** — la fee varia per distanza/orario/densità/meteo, non flat. Recupera margine
   sugli ordini costosi (lontani, fuori picco) e può azzerarsi quando spinge un comportamento utile (ordine di
   gruppo, slot a bassa domanda). Attento al **dark pattern**: la fee deve essere trasparente, mai nascosta.
5. **Commissione / take-rate negozi** — leva strutturale potentissima ma 🔴 (tocca contratti e fiducia dei
   negozi). Si muove con tier (più volume = % migliore per il negozio), non con aumenti secchi. Pre-wiring con
   @vendite e @finanza obbligatorio.
6. **Recupero carrelli abbandonati** — email/push a chi ha lasciato il carrello. ROI altissimo (intento già
   alto, costo ~0). Sequenza tipica: +1h (promemoria gentile), +24h (riprova social/scarsità vera), +72h
   (incentivo SOLO se serve). Il primo touch senza sconto recupera la fetta più grande a margine pieno.
7. **Win-back dormienti** — riattivare chi non ordina da N giorni. Segmenta per valore (un cliente alto-LTV
   merita un'offerta, un mai-tornato no). Misura su **margine recuperato**, non su "riaperture".
8. **Promemoria riordino / abbonamento** — per consumo ricorrente (spesa settimanale): trasforma un acquisto
   in un'abitudine. Alza frequenza → alza LTV. La leva con il ritorno a lungo termine più alto.
9. **Sconto / codice** — *ultima* leva. Utile come acceleratore mirato (primo ordine, win-back alto-valore),
   mai come politica. Ogni € di sconto esce dal margine: calcola sempre il **margine netto post-sconto** e la
   % di redemption (un codice usato da chi avrebbe comprato comunque = margine bruciato).

## C. Elasticità, soglie e psicologia del prezzo
- **Elasticità della domanda** = quanto cambia la quantità venduta al variare del prezzo/fee. Alta elasticità →
  un piccolo aumento fa crollare il volume (non toccare il prezzo, lavora sul valore). Bassa elasticità →
  c'è spazio per fee/prezzo senza perdere ordini. Non si indovina: si misura con un test.
- **Effetto-soglia (anchoring & goal-gradient):** "ti mancano 4€ alla consegna gratis" attiva il *goal-gradient*
  (più sei vicino alla meta, più spingi). La barra di progresso al carrello è una delle leve AOV più efficaci.
- **Prezzo di riferimento & decoy:** un bundle "premium" accanto a uno "standard" fa sembrare lo standard la
  scelta ragionevole (e ne alza la conversione). Il decoy è etico finché i prodotti sono reali e utili.
- **Avversione alla perdita > guadagno:** "non perdere la consegna gratis" pesa più di "ottieni la consegna
  gratis". Inquadra le soglie come qualcosa da *non perdere*.
- **Pain of paying:** la fee separata e visibile fa più male del prezzo incorporato. Decisione di trasparenza
  vs frizione — ma su MyCity la **fiducia batte il trucco**: fee chiara, sempre (ossessione cliente).

## D. Il metodo dell'esperimento (la disciplina che separa il pro dal "proviamo e vediamo")
Un esperimento ha 6 pezzi, **tutti prima di lanciare**:
1. **Ipotesi falsificabile:** "Credo che [leva] sposti [metrica] da [baseline reale] a [target], perché [meccanismo]."
   Senza baseline reale non è un'ipotesi, è un desiderio.
2. **Metrica primaria UNICA** (OEC, Overall Evaluation Criterion) + **guardrail** (le metriche che NON devono
   peggiorare: margine, churn, abbandono carrello, reclami). Una leva che alza l'AOV ma fa salire l'abbandono
   del 10% può essere una perdita netta.
3. **Una variabile per volta.** Se cambi soglia *e* upsell insieme, non saprai quale ha funzionato. Eccezione:
   test multivariato solo con volume enorme (non è il nostro caso oggi).
4. **Dimensione campione / potenza statistica:** quanti ordini servono per *vedere* l'effetto atteso. Effetto
   piccolo + base piccola = servono molti dati o l'esperimento non è leggibile. Se non hai potenza, **non
   lanciare un A/B**: usa un test pre/post o un rollout a fasi e sii onesto sull'incertezza.
5. **Durata & soglia di kill DEFINITE PRIMA:** "se a 2 settimane / N ordini non muove di almeno X, uccido."
   Niente esperimento eterno, niente "ancora un po' che sta per girare".
6. **Lettura solo a significatività:** non chiamare un vincitore su 20-30 ordini. Il rumore inganna. Aspetta
   campione + tempo (copri il ciclo settimanale: il weekend si comporta diverso dal martedì).
> **Regola d'oro statistica:** in regime di pochi ordini, il tuo nemico è il **falso positivo**. Meglio una
> lettura prudente e un rollout a fasi che un "vince!" su 25 ordini che poi svanisce. Dichiara sempre la confidenza.

## E. L'aggancio MyCity (dove il sapere diventa il NOSTRO)
MyCity è giovane e a **basso volume**: questo cambia tutto.
- **La gerarchia delle leve oggi** non è "ottimizza la fee", è: **(1) volume & frequenza** (più ordini, più
  riordino) → **(2) AOV** (soglia free-shipping, bundle, upsell) → **(3) margine per ordine** (fee consegna,
  costi) → **(4) take-rate** (solo quando il volume regge il pre-wiring coi negozi). Con pochi ordini, a volte
  la mossa giusta NON è un esperimento di pricing: è far crescere il volume prima (giudizio, non riflesso).
- **Pochi ordini = poca potenza statistica.** Spesso non puoi fare un A/B pulito: usa pre/post onesti, rollout
  a fasi, e dichiara l'incertezza. Non spacciare un caso per una legge.
- **La consegna locale è il costo che decide il margine.** Ogni leva va pesata contro il costo-consegna reale:
  collabora con @operations/@finanza prima di promettere "consegna gratis".
- **Fiducia > trucco** (città piccola, ci si conosce): zero dark pattern, fee trasparenti, nessuna prova sociale
  finta. Una leva che irrita il cliente è un prestito sul futuro che paghi col passaparola negativo.
- Ogni proposta deve poter rispondere SÌ a: *"so quanti € fa, a quale margine, e ho una soglia per ucciderla se sbaglio?"*.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Template di DISEGNO ESPERIMENTO (compila tutto, niente buchi)
```
ESPERIMENTO: <nome breve>          DATA: AAAA-MM-GG HH:MM    COLORE: 🟢/🟡/🔴
─────────────────────────────────────────────────────────────────────────────
IPOTESI (falsificabile): Credo che <LEVA> sposti <METRICA> da <BASELINE reale>
  a <TARGET> perché <MECCANISMO>.
METRICA PRIMARIA (OEC): <una sola>          BASELINE reale: <numero dal DB>
GUARDRAIL (non devono peggiorare): margine/ordine · abbandono carrello · reclami · churn
VARIABILE UNICA cambiata: <…>
DISEGNO: ☐ A/B  ☐ pre/post  ☐ rollout a fasi   (scegli in base alla potenza — Tool 5)
CAMPIONE/DURATA: <N ordini o settimane per leggere l'effetto atteso>  → fine: <data>
SOGLIA DI KILL: se a <data/N> la metrica non muove di almeno <X> → STOP.
€ ATTESI: ricavo +<…> · MARGINE +<…> (mostra il calcolo — Tool 4)   CONFIDENZA: alta/media/bassa
COSTO/SFORZO: <€ + ore + chi tocca (ops/finanza/tech)>
DATO REALE CHE MI MANCA: <…> → se manca, NON stimo al buio: lo chiedo (Strato 6)
ESITO (a fine test): <numero reale> → TIENI / UCCIDI / SCALA. Lezione: <1 riga in memoria>
```

## TOOL 2 — SCORING del backlog: ICE e RICE (ordina SEMPRE per ROI)
- **ICE** (veloce, per triage): `Score = Impatto × Confidenza × Easiness`, ognuno 1–10.
  - *Impatto* = quanti € a margine muove (non "quanto è figo"). *Confidenza* = quanto credo all'effetto
    (dato reale? precedente?). *Easiness* = inverso dello sforzo/rischio.
- **RICE** (per priorità fine, quando l'ICE pareggia): `Score = (Reach × Impact × Confidence) / Effort`.
  - *Reach* = quanti ordini/clienti toccati nel periodo. *Effort* = persona-settimane.
- **Regole d'uso:** lavora dall'alto, **leve a costo ~0 prima** (recupero carrelli, upsell, soglia) — danno
  ROI subito mentre quelle pesanti maturano. Riordina il backlog ad ogni dato nuovo. Confidenza bassa su un
  Impatto alto → non scartare: trasformalo in **micro-test economico** che la alza.

## TOOL 3 — CALIBRARE la soglia "spedizione gratis" (la più richiesta)
1. Estrai la **distribuzione** dei carrelli (non la media): istogramma dei valori d'ordine.
2. Trova l'AOV attuale e la fascia dove si addensano i carrelli appena sotto una soglia psicologica.
3. Candidata = `AOV × 1.15–1.3`, arrotondata a numero pulito (25€, 30€, 35€).
4. Stima l'effetto: % di carrelli che *potrebbero* salire alla soglia × incremento medio per carrello.
5. **Pesa il costo:** ogni ordine sopra soglia ti costa la consegna → contribution = `nuovo AOV margine − costo consegna`.
   Verifica che il margine **netto** salga, non solo l'AOV. (peer review @finanza/@operations)
6. Disegna come pre/post o rollout (Tool 1), guardrail = abbandono carrello (soglia troppo alta lo alza).

## TOOL 4 — CALCOLO dell'impatto atteso su RICAVO e MARGINE (mostra sempre il lavoro)
```
LEVA: <…>
Base: ordini/periodo = <N> · AOV = <€> · margine% = <%> · costo consegna/ordine = <€>
EFFETTO IPOTIZZATO: <es. +8% AOV su 30% degli ordini, oppure +5% conversione>
RICAVO incrementale  = Δordini × AOV  +  ΔAOV × ordini_toccati
MARGINE incrementale = ricavo incrementale × margine%  −  Δcosti variabili (consegne/pagamenti/incentivi)
   ⚠️ Se la leva è uno sconto: MARGINE = ricavo − sconto erogato − costo redemption (chi avrebbe comprato comunque)
RISULTATO: € ricavo/mese ≈ <…> · € MARGINE/mese ≈ <…> · payback dello sforzo ≈ <…>
```
> Se il margine incrementale è ≤ 0 o ignoto, la leva **non si propone**. Il ricavo lordo da solo non è una vittoria.

## TOOL 5 — CHECKLIST PRE-TEST (significatività e pulizia — una ❌ = non lanci)
- [ ] **Baseline reale** dal DB (non stimata): conosco il numero di partenza.
- [ ] **Una metrica primaria** + guardrail definiti.
- [ ] **Una variabile** cambiata (o test multivariato giustificato dal volume).
- [ ] **Potenza:** ho abbastanza ordini per *vedere* l'effetto atteso? Se no → pre/post o rollout, e lo dichiaro.
- [ ] **Durata** copre ≥1 ciclo settimanale (weekend incluso); **kill-criteria** scritto PRIMA.
- [ ] **Nessuna lettura anticipata** prima del campione/tempo (peeking = falsi positivi).
- [ ] **Margine** verificato (Tool 4) e peer-review @finanza fatta sul numero.
- [ ] **Colore** corretto: cambia esperienza utente = 🟡 · tocca prezzi/fee/budget reali = 🔴.

## TOOL 6 — Il LOOP INTERNO (mai consegnare la prima leva)
1. [ ] Genera **≥3 leve diverse** (struttura/AOV/retention — non 3 varianti della stessa).
2. [ ] **Scoring ICE/RICE su € reali** (Tool 2). Verifica margine in testa con @finanza.
3. [ ] **Ghigliottina** su ciascuna: *«so quanti € fa, a che margine, e ho una soglia per ucciderla?»* → se no, kill.
4. [ ] Tieni la 1 a ROI migliore, scarta le altre (annota perché → memoria).
5. [ ] Affina: ipotesi falsificabile, € attesi (Tool 4), metrica, soglia di kill, colore (Tool 1).
6. [ ] Pre-wiring se tocca KPI/budget altrui (@finanza, @vendite, @operations) PRIMA di portarla a Nicola.
7. [ ] Consegna: **backlog ordinato per ROI**, dichiara perché la prima batte le altre + il dato che ti manca.

## TOOL 7 — Sequenza RECUPERO CARRELLI (pronta da accodare 🔴)
`+1h` promemoria gentile, zero sconto ("Il tuo carrello ti aspetta da [negozio] 👉 [link]") ·
`+24h` riprova con valore/scarsità VERA (stock reale, slot) · `+72h` incentivo **solo se** i primi due non
convertono (e calcola il margine post-incentivo, Tool 4). Misura: % recupero per touch, margine recuperato.
Le email/push reali = 🔴 → contenuto in `consegne/`, azione in [[AZIONI-IN-ATTESA]], mani via @builder-automazioni.

## TOOL 8 — POST-MORTEM esperimento (resilienza senza colpa)
A fine test, 5 righe: *ipotesi · esito (numero reale) · ha vinto/perso · perché (meccanismo o rumore?) ·
prossima scommessa (ridimensionata)*. Kill-criteria erano definiti → nessuna colpa, solo apprendimento.
Salva in `memoria-squadra/growth-monetizzazione.md`. Un perdente documentato vale: non lo rifai.

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10 + lo scarto, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Aggiorna quando torna il dato reale.

## ✅ GOLD (leve che spostano il P&L)
- **Soglia "free-shipping a X€" (Amazon/Glovo).** *Perché:* alza l'AOV **senza sconto** — il cliente aggiunge
  per arrivarci, margine intatto, attiva goal-gradient. *MyCity:* soglia calibrata sulla distribuzione carrelli
  (Tool 3) + barra "ti mancano N€ alla consegna gratis" al carrello. Pre-verificata col costo-consegna reale.
- **Upsell complementare al checkout ("aggiungi il pane fresco?").** *Perché:* ricavo incrementale a frizione
  ~0, alta confidenza, margine pieno; complementare e a basso prezzo = impulso, zero sforzo decisionale.
  *MyCity:* cross-sell tra botteghe della stessa zona (salume + pane + vino → "Aperitivo del Sabato").
- **Bundle ad alto scontrino ("Spesa Piacentina DOP").** *Perché:* alza AOV e racconta una storia; percezione
  di valore > somma dei pezzi, spesso margine migliore. *MyCity:* aggancio alla piattaforma "Il Turno"/Volti.
- **Recupero carrelli, primo touch senza sconto.** *Perché:* intento già altissimo, costo ~0, recupera la
  fetta grande a **margine pieno** prima di spendere un solo € di incentivo. *MyCity:* Tool 7.
- **Promemoria riordino (spesa ricorrente).** *Perché:* trasforma l'acquisto in abitudine → alza frequenza →
  alza LTV; il ritorno a lungo termine più alto in un grocery marketplace. *MyCity:* "la tua spesa del sabato".

## ❌ SPAZZATURA (vittorie locali distruttive — uccidi a vista)
- **"-20% a tutti per fare numeri"** senza ipotesi né margine calcolato. *Perché no:* gonfia gli ordini,
  brucia il P&L, droga la baseline e abitua il cliente allo sconto. Vittoria di vanity, perdita di margine.
- **Fee nascosta / dark pattern** (sorpresa al checkout). *Perché no:* alza un ordine, distrugge la fiducia —
  in una città piccola è un prestito sul futuro che paghi col passaparola. Ricavo SÌ, fiducia intatta.
- **Test letto su 25 ordini** ("vince!"). *Perché no:* sotto-potenza = falso positivo; scali una leva che non
  esiste e ci costruisci sopra. Aspetta campione + tempo, dichiara la confidenza.
- **Soglia free-shipping troppo alta** "per spingere". *Perché no:* supera il punto di frustrazione → alza
  l'abbandono carrello (il guardrail che dimentichi); l'AOV "sale" sui pochi rimasti, il margine totale scende.
- **Esperimento con 3 variabili insieme** (soglia + upsell + sconto). *Perché no:* qualunque sia l'esito, non
  saprai cosa ha funzionato — hai speso un test e non hai imparato niente.

## 🏆 Pattern vincenti distillati
Struttura prima dello sconto · margine > ricavo lordo · AOV è la leva più pulita · costo ~0 prima · ipotesi
falsificabile + kill-criteria PRIMA · una variabile · leggi solo a significatività · guardrail sempre · fiducia > trucco.
## 🚩 Red flags (uccidi a vista)
Sconto come prima leva · ROI stimato senza dato reale · nessuna soglia di kill · test letto presto · ricavo
senza margine · backlog non ordinato · più variabili insieme · dark pattern · ignorare l'effetto a 2° ordine su ops/negozi.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, dove si innesta)
> Senza questo, il kit è un fuoriclasse a mani vuote: produce ottimi *disegni* di esperimento ma con baseline
> a segnaposto. Col dato reale il tetto sale da 8 a 10. Ecco ESATTAMENTE cosa serve e dove si aggancia:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Margine reale per categoria** (commissione − costi variabili) | sapere quale leva non erode il P&L; calcolo margine vero | Sapere A, Tool 4, ogni proposta |
| **AOV / scontrino medio reale** + **distribuzione carrelli** | calibrare soglia free-shipping; stimare effetto AOV | Tool 3, Tool 4 |
| **Tasso di conversione** (visita→carrello→ordine) per step | trovare il collo di bottiglia, stimare l'impatto | metrica primaria, Tool 1 |
| **Take-rate / fee attuali** (negozi e cliente) | baseline per ogni leva di pricing/fee | Sapere A-B, leva 4-5 |
| **% carrelli abbandonati + valore** | dimensionare il recupero (ROI altissimo) | Tool 7, leva 6 |
| **Coorti & frequenza/retention** (clienti dormienti, N giorni) | win-back segmentato per valore, LTV reale | leva 7-8, Sapere A |
| **Costo consegna reale per ordine/zona** | verificare che "gratis"/fee dinamica non bruci margine | Tool 3, leva 1 e 4 |
| **% redemption codici** (se ci sono stati sconti) | margine vero post-sconto, evitare il regalo | leva 9, Tool 4 |
| **Budget esperimenti** (🔴, firma Nicola) | quanto posso "investire" per imparare; STOP se brucia | OKR-Squadra, ogni 🔴 |
| **Chiavi di scrittura** (email/push Resend, n8n, API admin) | le "mani" che lanciano recupero carrelli/win-back | Tool 7, azioni 🔴 |

Finché manca, **NON inventare una baseline plausibile e NON proporre ROI al buio**: usa segnaposto chiari `[…]`,
fermati e chiedi il dato a Nicola/@finanza/@analista come leva che alza il livello. È la regola della verità onesta.

---
*Manutenzione: questo kit è vivo. Ogni volta che un esperimento chiude e torna il dato reale, aggiorna la
Galleria (nuovo gold/spazzatura col perché) e il log esperimenti in `memoria-squadra/growth-monetizzazione.md`.
RIASSUMI/POTA mensile: resta denso e affilato.*
