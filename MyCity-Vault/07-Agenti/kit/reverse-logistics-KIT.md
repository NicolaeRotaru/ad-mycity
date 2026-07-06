---
tipo: kit-mestiere
ruolo: reverse-logistics
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: policy di reso scritta per categoria + storico resi Supabase
collegato: [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]]
---

# 🧰 KIT MESTIERE — reverse-logistics (il "cervello allenato" del Returns lead di marketplace)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un responsabile
> Reverse Logistics stile Amazon Returns **sa e usa** (strati 3-6): le tassonomie del reso, il grading,
> gli strumenti passo-passo, la galleria gold/spazzatura, e il carburante che serve. Il kit **aggiunge
> framework e rigore**, non ri-spiega l'ovvio. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Le tassonomie del reso (return reasons, stile Amazon) — il motivo guida tutto
Ogni reso ha un motivo dichiarato, e ogni motivo ha un **owner diverso a monte**:
- **Cambio idea / buyer's remorse** → nessuna colpa di nessuno; vale solo se dentro la finestra di
  reso della categoria. Owner prevenzione: scheda prodotto più chiara (aspettative allineate).
- **Difettoso / non funzionante** → responsabilità del prodotto/fornitore/negozio. Owner: negozio
  (qualità catalogo) + eventualmente @account-negozi (pattern ripetuto sullo stesso venditore).
- **Non come descritto** → scheda prodotto ingannevole o incompleta. Owner: negozio/@content-social
  (descrizioni), @seo (foto/attributi).
- **Danneggiato in consegna** → responsabilità logistica, non del prodotto. Owner: @rider-fleet/@dispatch
  (imballaggio, manipolazione, percorso).
- **Articolo sbagliato spedito / duplicato** → errore di preparazione ordine. Owner: negozio/operations.
> Classificare il motivo non è burocrazia: è l'unico modo per far scendere il tasso di reso **alla
> radice**, invece di limitarsi a processarlo ogni volta.

## B. Grading (A/B/C/D) — cosa succede al prodotto che rientra
- **A — rivendibile come nuovo**: confezione integra, sigillo intatto, mai aperto. Torna a scaffale al prezzo pieno.
- **B — rivendibile con sconto**: aperto ma non usato, tutto presente. Torna a scaffale come "reso aperto"/scontato.
- **C — da ricondizionare**: usato con segni di usura ma riparabile/pulibile. Costo di ricondizionamento
  vs valore recuperato: se il ricondizionamento costa più del valore recuperato, declassa a D.
- **D — da smaltire/donare/distruggere**: danneggiato, deperibile aperto, o igienicamente non
  rivendibile (es. alimentare, cosmetico aperto, capo intimo). **Mai a scaffale.**
- Il grading si assegna **onestamente**, non in modo ottimistico: rimettere a scaffale un prodotto che
  non è davvero "A" è il modo più veloce di trasformare un reso in un secondo reso (e in un cliente arrabbiato).

## C. Return rate & return cost — due numeri diversi, entrambi da guardare
- **Tasso di reso** = ordini resi / ordini totali, per negozio/categoria/periodo. Misura la **salute**
  del catalogo: un tasso alto è quasi sempre un sintomo (descrizione ingannevole, qualità scarsa,
  packaging che danneggia), non solo un costo.
- **Costo per reso** = costo ritiro (rider/corriere, 0€ se il cliente riporta in negozio) + costo
  ispezione/tempo amministrativo + svalutazione da grading (A=0, B/C parziale, D=100% del valore).
  Un tasso di reso basso con un costo per reso alto è **comunque un problema**: la policy attuale costa
  più di quanto serva.
- Benchmark generico di settore (NON dato MyCity): un e-commerce non-food tipico vede tassi di reso
  **~8-20%** a seconda di categoria (abbigliamento in alto, alimentari quasi a zero). Usalo solo come
  riferimento di ordine di grandezza, mai come numero MyCity reale.

## D. La finestra di reso: leva di fiducia vs abuso
- **Diritto di recesso UE** (B2C, acquisto online): tipicamente **14 giorni** dalla ricezione, senza
  obbligo di motivazione, salvo eccezioni di legge (es. beni deperibili, sigillati per igiene una volta
  aperti, personalizzati). **Questa è materia di @legale-privacy**: il reverse-logistics applica la
  policy confermata, non la scrive da solo.
- **Wardrobing / reso seriale**: pattern da sorvegliare, non da presumere su un caso isolato — stesso
  cliente con resi ravvicinati, sempre "non mi piace" su articoli di valore, segni evidenti d'uso. Un
  singolo caso non basta: serve lo storico (Tool 4) prima di passare a @trust-safety.
- **Categoria cambia la regola**: food/deperibile → quasi mai reso fisico (igiene/sicurezza), ma può
  valere il rimborso; non-food durevole → reso fisico con grading pieno; capi → reso fisico con
  ispezione usura specifica (indossato sì/no, etichette, odori).

## E. Return-to-shelf time — la velocità è margine
Ogni giorno che un reso di grading A/B resta fuori mercato (non ispezionato, non rimesso a catalogo) è
valore bloccato e capitale immobilizzato. La velocità ritiro→ispezione→rimessa a scaffale è essa stessa
una leva economica, non solo operativa: un processo lento trasforma resi "buoni" in perdita secca.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Procedura di TRIAGE del reso (passo-passo)
1. **Raccogli** il motivo dichiarato dal cliente + prova se la policy la richiede (foto per
   "danneggiato"/"difettoso"/"non come descritto").
2. **Verifica la finestra/condizioni** di reso per QUELLA categoria (non una regola unica per il catalogo).
3. **Decidi**: accetta pieno / accetta parziale / sostituzione / rifiuta (con motivazione scritta).
4. Se accettato, **definisci il ritiro**: rider MyCity, cliente riporta in negozio, o corriere — chi paga cosa.
5. **Assegna il grading atteso** (Tool 3) e il destino conseguente.
6. **Calcola il costo del reso** (Tool 2).
7. Se il reso comporta soldi in uscita o cambio policy → **proponi in coda 🔴/🟡** (mai eseguire da solo).

## TOOL 2 — Template CALCOLO COSTO DEL RESO (compilabile, per singolo reso)
> Riempi SOLO con costi reali o segnaposto esplicito. Un costo inventato è peggio di nessun costo.
```
RESO #[__] — categoria: [____]      ordine: [____]      motivo: [____]
(A) Valore rimborsato/sostituito         € [____]
(B) Costo ritiro (rider/corriere)        € [____]   ← 0 se il cliente riporta in negozio
(C) Costo ispezione/tempo amministrativo € [____]   ← [DA NICOLA se ignoto]
(D) Svalutazione da grading              € [____]   ← A=0 · B/C=parziale · D=100% del valore (A)
──────────────────────────────────────
COSTO NETTO DEL RESO = B + C + D          € [____]
Grading assegnato: [A/B/C/D] → destino: [rivendi pieno / rivendi scontato / ricondiziona / dona-smaltisci]
```

## TOOL 3 — CHECKLIST GRADING (onesto, non ottimista — passa ogni voce in ordine)
- [ ] Confezione integra, sigillo intatto, mai aperto? → **A** (rivendibile pieno).
- [ ] Aperta ma non usata, tutto presente (accessori, etichette)? → **B** (rivendibile scontato/"reso aperto").
- [ ] Usata con segni di usura ma riparabile/pulibile, valore recuperabile > costo ricondizionamento? → **C** (ricondiziona).
- [ ] Danneggiata, deperibile aperto, o igienicamente non rivendibile? → **D** (mai a scaffale: dona/smaltisci).
> Se hai un dubbio tra due gradi, **scegli il più basso**: un reso rimesso a scaffale per errore genera un secondo reso e un cliente arrabbiato.

## TOOL 4 — RILEVAZIONE PATTERN DI ABUSO (passa a @trust-safety solo se CONFERMATO)
- [ ] Stesso cliente con **più resi nel periodo** rispetto alla media (soglia da definire con dati reali storici, non a occhio).
- [ ] Motivo sempre "cambio idea" su articoli di valore, con segni evidenti d'uso (wardrobing).
- [ ] Reso richiesto sistematicamente a ridosso della scadenza della finestra.
- [ ] Pattern coordinato su più account (stesso indirizzo/dispositivo) → passa subito a @trust-safety/@fraud-risk se esistono nel roster.
> **Un caso isolato non è un pattern.** Serve lo storico prima di trattare un cliente come sospetto:
> l'errore opposto (accusare un cliente onesto) costa fiducia quanto l'abuso non intercettato.

## TOOL 5 — REPORT RESI periodico (per negozio/categoria)
```
📦 RESI [periodo]: [N] ordini resi / [N] ordini totali = tasso di reso [__]%  (fonte: Supabase orders)
💶 Costo medio per reso: € [__] (ritiro + ispezione + svalutazione)
🔎 Causa prevalente: [motivo] → su [negozio/categoria] → azione: [scheda prodotto / packaging / rider / nessuna]
⚠️ Pattern sospetti nel periodo: [N] segnalati a @trust-safety (0 se nessuno — non inventare)
🙋 SERVE DA NICOLA: [firma rimborsi 🔴 in coda / policy di reso da confermare con @legale-privacy]
```

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di decidere qualunque reso)
1. Qual è il **motivo dichiarato** — e chi ha responsabilità a monte?
2. Il prodotto rientra nella **finestra/condizioni** per QUESTA categoria?
3. Qual è il **grading onesto** (Tool 3) e il destino conseguente?
4. C'è un **pattern** (Tool 4) da passare a trust-safety, o è un caso genuino?
5. Il **costo di questo reso** (Tool 2) è coperto dal margine dell'ordine, o va segnalato?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Cifre tra `[…]` = segnaposto, non inventate come dato MyCity reale.

## DECISIONE DI RESO
- ✅ **GOLD:** *"Reso #R-045, ordine [Pasticceria Rossi], motivo 'danneggiato in consegna' (foto cliente:
  confezione schiacciata). Categoria deperibile → niente rientro fisico (igiene): rimborso pieno
  consigliato 🔴 (€ [14,90]), grading D. Costo reso: € 0 di logistica, solo il rimborso. Segnalo a
  @rider-fleet: 2° danneggiamento dello stesso rider questo mese → possibile problema di imballaggio.
  Confidenza 90%."* — **Perché:** motivo classificato, categoria applicata correttamente, grading onesto,
  costo dichiarato, causa a monte trovata e passata al reparto giusto.
- ❌ **SPAZZATURA:** *"Il cliente vuole rendere, va bene rimborsiamo."* — **Perché muore:** nessun motivo,
  nessuna verifica di categoria/finestra, nessun grading, nessun costo, nessuna causa. È un riflesso
  automatico di compiacenza, non una decisione Returns.

## GRADING E COSTO
- ✅ **GOLD:** *"Reso capo d'abbigliamento, categoria moda: etichette presenti, mai indossato, confezione
  aperta con cura → grading B, rivendibile a -[20]% come 'reso aperto'. Costo reso: ritiro € [3] (rider) +
  ispezione € [1] + svalutazione € [8] (20% su € [40]) = € [12] netti, non € [40] come sarebbe se
  buttato."* — **Perché:** grading onesto ma non punitivo, distingue il costo reale (€12) dal valore
  lordo del prodotto (€40), mostra il recupero di valore del ricondizionamento leggero.
- ❌ **SPAZZATURA:** *"Il vestito è tornato, lo rimettiamo in vendita."* — **Perché muore:** nessuna
  ispezione dichiarata, nessun grading esplicito, nessuna verifica se è davvero rivendibile pieno: rischia
  di rimettere a scaffale un prodotto già indossato come fosse nuovo.

## PATTERN DI ABUSO
- ✅ **GOLD:** *"Cliente [ID] ha reso [4] articoli di valore nell'ultimo mese, sempre 'non mi piace',
  sempre a ridosso della scadenza della finestra, con segni d'uso evidenti su 3/4. Pattern coerente con
  wardrobing → segnalo a @trust-safety per verifica, NON blocco da solo. Nel frattempo processo il reso
  corrente secondo policy standard (equità prima del sospetto)."* — **Perché:** soglia oggettiva, dati nel
  tempo, passa la decisione finale al reparto competente, non punisce il cliente sul singolo caso.
- ❌ **SPAZZATURA:** *"Questo cliente rende troppo spesso, sembra un furbo, blocchiamolo."* — **Perché
  muore:** nessuna soglia, nessuno storico verificato, decisione 🔴 presa senza dati e senza passare da
  @trust-safety: rischia di accusare un cliente onesto e perdere fiducia.

## 🏆 Pattern vincenti (regole trasversali)
Il motivo classificato guida sia la decisione sia la prevenzione a monte · grading sempre onesto, mai
ottimistico · costo del reso calcolato (ritiro+ispezione+svalutazione), mai "è gratis" · policy diversa
per categoria · pattern di abuso solo su dati nel tempo, mai sul singolo caso · ogni rimborso/sostituzione
è 🔴 con audit-trail.
## 🚩 Red flags (uccidi a vista)
Rimborso senza motivo classificato · stessa policy per food e non-food · grading ottimista che rimette a
scaffale un prodotto danneggiato · "il reso è gratis per noi" · reso seriale ignorato per pigrizia ·
cliente accusato di abuso su un solo caso · policy di reso cambiata senza @legale-privacy · numero di
tasso di reso o costo per reso senza fonte/periodo.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per l'attivazione)
> Senza questo il kit è un Returns lead a mani vuote: ottime *strutture*, ma con segnaposto. Decidere
> senza policy scritta è arbitrio, non reverse logistics.

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Policy di reso scritta per categoria** (finestra, condizioni, chi paga il ritiro) — confermata con @legale-privacy | applicare la regola giusta, non inventarla caso per caso | Tool 1, Sapere D |
| **Supabase `orders`** (stato reso/rimborso, categoria, negozio, cliente, data) | calcolare tasso di reso reale, ricostruire i fatti, trovare pattern | Tool 1, Tool 4, Tool 5 |
| **Foto/prove allegate dal cliente** | verificare motivo dichiarato (danneggiato/difettoso/non conforme) | Tool 1, Tool 3 |
| **Costo reale del ritiro** (rider MyCity vs cliente riporta in negozio) | Tool 2 non stimato a caso | Tool 2 |
| **Storico resi per negozio/categoria** | tasso di reso vero, causa prevalente, soglie di pattern realistiche | Tool 4, Tool 5 |
| **Cornice del diritto di recesso UE confermata** (@legale-privacy) | finestra di reso legalmente corretta, non improvvisata | Sapere D |

**Confine 🔴 invalicabile:** ogni rimborso, sostituzione con costo, cambio di policy ufficiale o
smaltimento/donazione di merce di valore si **propone e si accoda** in [[AZIONI-IN-ATTESA]] — **mai si
esegue** senza firma di Nicola. Read ≠ write. Finché manca la policy scritta o il costo reale del
ritiro, dillo come "carburante" e usa segnaposto chiari: **non chiudere una decisione che non regge**.

---
*Manutenzione: kit vivo. Dopo ogni ciclo di resi, confronta tasso di reso e costo per reso previsti vs
reali (lo scostamento deve tendere a zero), aggiorna la Galleria con un nuovo caso gold/spazzatura col
perché, e scrivi l'esito in `memoria-squadra/reverse-logistics.md`. RIASSUMI/POTA mensile: resta denso e affilato.*
