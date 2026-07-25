---
tipo: programma
data: 2026-07-25 03:31
aggiornato: 2026-07-25 04:43 (correzione AR-114 applicata: freni 4 → 3; 13 comandi su 13 rieseguiti e verificati)
programma: intelligenza (rendere la macchina pronta a gestire il business)
stato: round 1-2-3 chiusi · questo è il piano di lavoro dei round successivi
misura: cervello/pagella-intelligenza.mjs (0 voci su 5 il 2026-07-25 04:10)
---

# 🗺️ PROGRAMMA INTELLIGENZA — la lista di cosa c'è da fare

> **Perché esiste.** La pagella (`cervello/pagella-intelligenza.mjs`) dice **quanto** siamo messi
> male: 5 numeri, 0 superati. Non diceva **cosa** c'è da fare. Nicola: «crea la lista del programma,
> non solo 5». Il cruscotto c'era, mancava la strada. Questa è la strada.
>
> **Come si legge.** 13 cantieri. Ognuno ha: il problema con il numero che lo dimostra, cosa costa
> a Nicola, quale voce della pagella muove (o **nessuna** — e allora è un buco del metro, detto
> apertamente), un controllo che chiunque può eseguire, da cosa dipende, chi lo sblocca e quanto pesa.
> Poi l'ordine dei round, e cosa può girare in parallelo.
>
> **Tutti i comandi di questo file sono stati eseguiti prima di scriverli.** Si lanciano dalla
> cartella della macchina: sul VPS `/opt/mycity/ad-mycity` (NON `~/ad-mycity`).

---

## 📍 Da dove si parte (misurato, non dedotto)

| voce della pagella | oggi | pronta a | movimento in 3 round |
|---|---|---|---|
| applica le lezioni che scrive | **18%** (83 su 473) | ≥ 70% | ferma |
| sa prevedere le sue mosse | **0 reparti** su 14 | ≥ 5, AD incluso | ferma |
| freni di sicurezza rotti | **3** (AR-123, AR-142, AR-151) | 0 | 8 → 6 → 4 → 3 ✅ |
| quaderni vivi | **31 su 120** (26%) | ≥ 72 (60%) | ferma |
| voto salute | **43 / 100** | ≥ 80 | ferma |

Altri numeri veri, che la pagella **non** guarda:

- **cantiere:** 26 difetti aperti (3 bloccanti · 23 gravi), 68 chiusi.
- **prove:** **24 dei 26 aperti non sono chiudibili da nessun guardiano** (14 senza prova
  automatica, 10 con prova che non fa centro da 9 giorni).
- **coda firme:** **50 card aperte** · 98 chiuse in archivio. La più vecchia ancora aperta è del
  **24/6: 31 giorni**. Sei card aspettano da almeno due settimane.
- **mani:** l'elenco dei destinatari autorizzati (`cervello/mani-allowlist.json`) è **vuoto** per
  email e notifiche. Restano attivi solo GitHub e la tabella prodotti.
- **sensori:** **8 su 8 ok** all'ultima misura vera sul VPS (24/7 22:20), 1 non configurato
  (Telegram). **Non sono ciechi.**
- **business:** 1 negozio (Pane Quotidiano), 1 ordine creato e annullato, **0 pagati, 0 consegnati**,
  stallo dal 24/6 (**31 giorni**).
- **costi:** burn fisso ~302 €/mese (registro fatti). Il calcolo dell'autonomia di cassa è
  **«sconosciuto» da 240 giri**: manca una riga nel file di configurazione del VPS.

---

## ⚠️ Le tre verità scomode (da affrontare, non aggirare)

### A. Due voci su cinque sono ostaggio della pausa decisa da Nicola — serve la tua firma

«Quaderni vivi» chiede che **41 reparti in più** lavorino davvero e lascino la riga di esito.
«Sa prevedere» chiede previsioni su **mosse reali**. Con vendite, onboarding e marketing fermi fino
al 24/8-1/9, quelle due non si muovono comunque lavoriamo: la soglia fu scritta il 24/7 dando per
scontata un'azienda che lavora, e il giorno dopo l'azienda si è fermata per decisione tua.

Le due strade, con le conseguenze:

| | cosa comporta | costo | quando la macchina può dirsi «pronta» |
|---|---|---|---|
| **(a) soglie invariate** | il metro resta quello firmato il 24/7 | la pagella resta **0/5 fino a settembre** anche se tutto il resto funziona: il numero smette di dire qualcosa di utile e si smette di guardarlo | non prima di ottobre (servono settimane di lavoro reale dopo la ripresa) |
| **(b) misurare i reparti attivi** | il denominatore diventa i reparti che in questa fase lavorano davvero (tecnici + memoria, circa 15-20 su 120); la soglia piena a 120 torna **automaticamente il 1/9**, scritta nel file delle soglie, non affidata alla memoria di qualcuno | il numero misura una parte del team, e va detto ogni volta che si legge | entro agosto sulle voci che dipendono dalla macchina |

**Raccomandazione dell'AD: (b), con la data di ritorno scritta dentro il file delle soglie.**
Un metro che per costruzione segna zero per sei settimane non è severo: è spento. Ma è un metro,
e **il metro lo firmi tu** — l'AD non riscrive da sola il righello con cui viene misurata.

### B. In tre round si è mossa solo la voce «freni» — ed è quella che si aggiusta scrivendo codice

Vero, e va detto senza girarci intorno: la macchina oggi è più **sicura** e più **onesta** di tre
giorni fa, non più **intelligente**. Ecco la divisione netta dei 13 cantieri:

- **Alzano l'intelligenza** (la macchina cambia comportamento, non solo registro): **C4** (le lezioni
  diventano blocchi), **C5** (imparare a prevedere), **C6** (i quaderni dei senior).
- **Alzano l'onestà** — non sono intelligenza, ma senza di loro l'intelligenza non è misurabile e i
  round si ripetono a vuoto: **C2**, **C3**, **C10**, **C13**.
- **Sono manutenzione e sicurezza** — necessari, ma non rendono la macchina più brava: **C1**, **C7**,
  **C8**, **C9**, **C12**.
- **È business**: **C11**.

Tre cantieri su tredici alzano davvero l'intelligenza. Sono anche i più lenti. Chi legge questo
programma aspettandosi che «finire i cantieri» = «macchina intelligente» sbaglia: finire i cantieri
= **macchina di cui ci si può fidare**, che è la condizione per poterla far diventare intelligente.

### C. La soglia «70% delle lezioni» oggi è aritmeticamente irraggiungibile — serve una seconda firma

Numeri verificati: **473 lezioni attive, 0 mai fatte decadere**, e una lezione conta come «applicata»
solo se il suo codice compare per iscritto in memoria negli ultimi 30 giorni. Il 70% significa
**331 lezioni citate in un mese, circa 11 al giorno, per sempre**. Non è severità: è una soglia che
nessun comportamento reale può raggiungere, perché il denominatore cresce a ogni lezione scritta e
non diminuisce mai.

Le tre strade:

1. **lasciarla così** — la voce resta ferma per costruzione, e continueremo a leggerla come se
   significasse qualcosa;
2. **potare** — una lezione superata da un'altra, o diventata un blocco automatico, passa a
   «decaduta» ed esce dal conto (con la regola scritta prima, non decisa caso per caso);
3. **cambiare la definizione di «applicata»** — una lezione diventata blocco conta applicata **ogni
   volta che il blocco scatta**, perché è esattamente ciò che volevamo che succedesse.

**Raccomandazione dell'AD: (2) + (3) insieme, regola scritta prima e numero ri-misurato dopo.**
Anche qui: è il metro, quindi **la firma è di Nicola**. Se lo cambiasse l'AD da sola, sarebbe una
macchina che si dà i voti e poi si riscrive il registro.

---

# 🧱 I 13 CANTIERI

---

## C1 · I freni rotti
*(cantiere n.1 della richiesta di Nicola)*

**Il problema.** Restano **3 difetti bloccanti aperti**: AR-123, AR-142, AR-151.

Cosa protegge ciascuno e cosa succede a Nicola se cede:

| difetto | cosa protegge | se cede |
|---|---|---|
| **AR-142** — permessi di sessione troppo larghi (scrittura senza percorso, `git push` diretto su main, `git merge`, `curl` verso qualsiasi indirizzo) | la regola d'oro «solo proposte, mai una modifica pubblicata da sola» | una sessione dell'AD può pubblicare su `main` **senza passare da te**: il cancello della firma esiste sulla carta e si scavalca in una riga |
| **AR-151** — chiusure vecchie verificate contro il file sbagliato | l'attendibilità dei «68 difetti chiusi» | i difetti «chiusi» possono essere vivi. È già successo: AR-008 chiuso il 2/7, riemerso identico come AR-130 |
| **AR-123** — nel Pannello, aprire «Parla con questa casella» cancella la chat aperta | la superficie su cui firmi | perdi quello che hai scritto proprio nel punto in cui approvi le azioni |

> **AR-114 è stato chiuso alle 03:52 del 25/7, mentre questo programma veniva scritto** — da una
> sessione parallela, con una prova che fa centro **davvero** (non un falso positivo come AR-155:
> `allocazione-check.mjs` adesso classifica ogni file toccato in {business, macchina} e produce
> numeri veri). Ri-misurato alle 04:43 del 25/7, ultimi 7 giorni: **1321 file macchina · 375
> business · 202 non classificati → quota macchina 78%**, sopra la soglia del 70%. (La prima misura
> delle 03:52 diceva 76%: il sensore è vivo e il numero si muove coi commit, non è una targa fissa.)
> Il cancello che fallirebbe il giro è **spento per decisione tua** (fase tecnica fino al 24/8-1/9,
> letta dal registro dei fatti); si riaccende con `ALLOCAZIONE_GATE_MACCHINA=1` quando la fase
> finisce. Il sensore che mancava adesso c'è, e dice 78%: **il numero che dà ragione a C10 e C11**.

**Nota onesta sul conteggio:** due di questi tre sono freni. AR-123 è un bug del Pannello
promosso a bloccante. La voce «freni» della pagella conta i **bloccanti**, non i **freni**: è un
piccolo buco del metro, da correggere quando si toccheranno le soglie (verità A e C).

**Nota verificata su AR-123, da fare prima di riscrivere codice:** la causa registrata
(«`page.tsx:1949-1969` riusa e azzera la conversazione dell'Assistente») **non corrisponde più al
codice di oggi**: `ParlaCasella.tsx` ha ora il proprio stato locale (`msgs`, `convId`) e una cache
condivisa della sola *lista*. Il primo passo su AR-123 è **provarlo davvero nel Pannello** (skill
`verify`, Playwright), non riscriverlo. Esattamente la lezione del round 3.

**Perché conta.** Sono i tre punti in cui la macchina può fare male a Nicola invece che aiutarlo:
pubblicare senza firma, dichiarare chiuso ciò che è aperto, e fargli perdere il lavoro nel punto in
cui approva. (Il quarto — lavorare su di sé mentre il business muore — adesso ha il suo sensore:
è AR-114, chiuso, e dice **78%**.)

**Voce della pagella.** «Freni di sicurezza rotti»: 3 → 0. È l'unica voce che si muove scrivendo codice.

**Fatto vuol dire.**
```
node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync('MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json','utf8'));const b=d.difetti.filter(x=>x.gravita==='bloccante'&&x.stato!=='chiuso');console.log(b.length+' bloccanti aperti: '+b.map(x=>x.id).join(', '))"
```
Oggi stampa `3 bloccanti aperti: AR-123, AR-142, AR-151`. Fatto = `0 bloccanti aperti`,
**e** ognuno chiuso con una prova che passa da sola (vedi C2: chiuderli a mano senza prova rimette
in piedi il problema del round 2).

**Dipende da.** AR-151 dipende da **C2** (senza una prova valida non si chiude, si
dichiara). AR-142 e AR-123 sono indipendenti: si possono fare subito.

**Chi lo sblocca.** La macchina scrive i tre fix; **Nicola firma il merge** (sono tutti 🟡).
AR-142 tocca i permessi della sessione stessa: va fatto con Nicola presente, perché restringe ciò
che l'AD può fare — e va restretto senza rompere il giro automatico.

**Quanto pesa.** Medio in totale. AR-142 piccolo (è un file di permessi). AR-123 piccolo se la
verifica conferma che è già risolto, medio se no. AR-151 medio
(ri-verifica a campione di ~68 chiusure).

---

## C2 · Le prove congelate: 24 difetti che nessuno può chiudere
*(cantiere n.2 della richiesta di Nicola)*

**Il problema.** Su 26 difetti aperti, **24 non sono chiudibili da nessun guardiano**: 14 non hanno
nessuna prova automatica («verifica umana»), 10 hanno una prova che non fa centro **da 9 giorni**.
Solo 2 sono in attesa normale.

La causa non è che si sono rotte col tempo: **sono nate descrivendo il fix che si voleva fare, non
un controllo verificabile.** AR-133 cerca la parola `verify-marge` dentro `giro.sh`; AR-130 cerca
una freccia dentro il file di un agente. Nessuna delle due diventerà mai vera, qualsiasi cosa si
faccia.

**Perché conta.** Finché restano così, **il conteggio dei bloccanti è un numero morto**: può salire
(ogni radiografia ne aggiunge) ma non può scendere per merito. È esattamente ciò che ha fatto
perdere il round 2: un freno riparato e provato a mano continuava a risultare rotto. Nicola legge un
cruscotto che non registra il lavoro fatto — e a quel punto smette, giustamente, di fidarsi del
cruscotto.

**Voce della pagella.** **Nessuna, direttamente** — ed è un buco importante del metro: la pagella
conta i bloccanti aperti, ma **non conta quanti difetti sono verificabili**. Indirettamente sblocca
«freni» (C1) e «salute» (C13), che senza prove valide non possono migliorare.

**Fatto vuol dire.**
```
node cervello/cantiere-prove.mjs --dry --json | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{const j=JSON.parse(s);console.log('non chiudibili: '+j.non_auto_chiudibili+' su '+j.difetti_aperti+' — '+JSON.stringify(j.per_classe))})"
```
Oggi stampa `non chiudibili: 24 su 26 — {"umana":14,"auto-sospetta":10,"auto-attesa":2}`.
Fatto = **0 «auto-sospetta»** (ogni prova punta a un file e a un testo che possono davvero
diventare veri) e **ogni bloccante con una prova automatica** (nessun bloccante «umano»).
I difetti che davvero richiedono un occhio umano (es. un bug visivo) restano «umana», ma con una
regola nuova: **un difetto umano non può essere bloccante** — o si trova un modo di provarlo, o non
è un freno, è un fastidio.

**Dipende da.** Niente. Si può iniziare subito. È il cantiere che sblocca gli altri.

**Chi lo sblocca.** La macchina, da sola, per la riscrittura delle 10 prove sospette (ognuna va
riscritta guardando il codice vero, non l'intenzione). Le 14 «umane» richiedono una scelta:
trovare un controllo automatico, oppure declassarle. **Nicola firma il merge.**

**Quanto pesa.** Grosso. Sono 24 difetti da riprendere uno per uno, e farlo di fretta significa
riscrivere 24 prove finte al posto di 24 prove rotte.

---

## C3 · Le prove che mentono al contrario: chiudono difetti veri *(NUOVO — trovato scrivendo questo programma)*

**Il problema.** C2 racconta le prove che non fanno mai centro. Ne esiste il contrario, ed è peggio
perché è invisibile: **prove che fanno centro per sbaglio e chiudono un difetto ancora vivo.**

Caso verificato stanotte, **AR-155**, chiuso automaticamente il 25/7 alle 03:19. La sua prova cerca
`token_reali|usage` dentro `cervello/motore-ai.sh`. Nel file quella parola compare due volte: in un
**commento** e in un controllo che cerca il messaggio d'errore «usage limit» di Claude. Il fix vero
non c'è:

```
node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync('MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json','utf8'));const x=d.difetti.find(y=>y.id==='AR-155');const cattura=(fs.readFileSync('cervello/motore-ai.sh','utf8').match(/input_tokens|output_tokens/g)||[]).length;const c=JSON.parse(fs.readFileSync('MyCity-Vault/90-Memoria-AI/auto-coscienza/costo-ai.json','utf8'));console.log('AR-155: '+x.stato+' · cattura consumo reale: '+cattura+' · token contati oggi: '+c.oggi.token_totali)"
```
Oggi stampa `AR-155: chiuso · cattura consumo reale: 0 · token contati oggi: 0`.
Un difetto **chiuso** mentre il consumo reale non viene misurato da nessuna parte.

**Secondo caso, stessa malattia.** Il cruscotto della salute annuncia «**14 fix in attesa del tuo
merge**». Nel codice (`cervello/sonda-volano.mjs:135`) «in attesa di merge» è definito così:
*il difetto ha una prova automatica*. Non «il fix è scritto». Quei 14 sono in gran parte gli stessi
11 con la prova rotta di C2: **la macchina si dà credito per fix che non esistono** e lo dice a
Nicola come se fosse lavoro pronto da approvare.

**Perché conta.** C2 lascia problemi veri aperti: si vede, è fastidioso, è onesto. C3 fa sparire
problemi veri dal registro e presenta lavoro inesistente come pronto: **non si vede**. È il modo
esatto in cui questo programma può fallire dichiarando vittoria.

**Voce della pagella.** **Nessuna** — anzi: è il buco più grave del metro, perché la pagella **non
sa vedere una chiusura falsa**. Se AR-155 fosse stato bloccante, la voce «freni» sarebbe scesa a 3
per errore, e nessuno se ne sarebbe accorto.

**Fatto vuol dire.** Tre cose insieme:
1. il comando qui sopra stampa `cattura consumo reale: ≥1` e `token contati oggi: >0` (il fix vero
   di AR-155, vedi C12);
2. esiste un controllo che, **prima di chiudere**, verifica che il testo cercato non stia dentro un
   commento e non sia già presente **prima** del fix (una prova che era già vera ieri non prova nulla);
3. «in attesa di merge» viene calcolato dal **branch/PR reale**, non dalla presenza di una prova —
   oppure viene rinominato in «ha un controllo automatico», che è quello che significa davvero.

**Dipende da.** Niente. Va fatto **prima o insieme a C2**: riscrivere 24 prove con un motore che
può chiudere per sbaglio significa fabbricare chiusure false più in fretta.

**Chi lo sblocca.** La macchina; **Nicola firma il merge**. Serve anche una decisione piccola:
riaprire AR-155 (l'AD lo riaprirebbe: è chiuso senza fix).

**Quanto pesa.** Medio.

---

## C4 · Imparare davvero: dal 18% al 70%
*(cantiere n.3 della richiesta di Nicola)*

**Il problema.** La macchina applica **il 18% delle lezioni che scrive** (83 su 473). Scrive lezioni
molto più in fretta di quanto cambi comportamento. E le lezioni sono **promemoria**: righe di testo
che qualcuno deve ricordarsi di rileggere al momento giusto.

**Perché conta.** È il cuore della cosa che Nicola ha detto il 23/7: «sembri poco intelligente,
troppi errori». Gli errori che citava erano tutti già scritti come lezioni. Una macchina che scrive
la lezione e la rifà il giorno dopo non sta imparando: **sta prendendo appunti**. Ed è l'unica voce
di intelligenza che si può muovere **con l'azienda ferma**, perché non richiede negozi né ordini:
richiede che le lezioni diventino blocchi che scattano da soli.

**Il come, in concreto.** Le lezioni ricorrenti si trasformano in **controlli deterministici**
agganciati al punto in cui l'errore avviene: il gate che rifiuta un titolo di card con dentro un
codice; il gate che rifiuta un commit con file estranei (successo 3 volte in 24 ore il 23/7); il
gate che blocca la chiusura di un lavoro senza riga di esito. Non una lezione in più: **una regola
che non si può disobbedire**.

**Voce della pagella.** «Applica le lezioni che scrive»: 18% → 70%. **Ma vedi la verità C**: con 473
lezioni attive e nessuna mai fatta decadere, il 70% è irraggiungibile per aritmetica. Questo
cantiere non si chiude senza la firma di Nicola sul denominatore.

**Fatto vuol dire.**
```
node cervello/tasso-lezioni.mjs --json --dry | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{const j=JSON.parse(s);console.log('tasso '+j.tasso_applicazione+' ('+j.lezioni_applicate+'/'+j.lezioni_attive+')')})"
```
Oggi stampa `tasso 0.18 (83/473)`. Fatto = tasso ≥ 0.70 **con la regola del denominatore firmata
prima**, più un secondo controllo che conta **quante lezioni sono diventate blocchi** (oggi la
macchina non lo sa dire: non esiste il campo).

**Dipende da.** La decisione di Nicola sulla verità C. Il resto (scrivere i blocchi) può partire
subito: i primi tre blocchi da scrivere sono già identificati dagli errori ripetuti del 23/7.

**Chi lo sblocca.** Firma di Nicola sul metro; poi la macchina scrive i blocchi, un merge per blocco.

**Quanto pesa.** Grosso, ed è il cantiere più importante del programma.

---

## C5 · Saper prevedere: da zero reparti affidabili
*(cantiere n.4 della richiesta di Nicola)*

**Il problema.** **0 reparti su 14** sanno prevedere le conseguenze delle proprie mosse. Il registro
ha 36 previsioni chiuse: @finanza ne ha fatte 7 e sbagliate 7; @tech 4 con 2 azzeccate; nessun
reparto ha abbastanza prove per fidarsi. L'ultima previsione dell'AD su sé stessa: «questo lavoro
chiuderà 2 difetti», ne ha chiusi 8 — **scarto 300%**.

**Perché conta.** Una macchina che non sa prevedere le conseguenze delle proprie mosse non può
ricevere autonomia. Ogni volta che chiede «fammi fare X», Nicola non ha modo di sapere quanto vale
la stima allegata. La calibrazione è il meccanismo che trasforma «fidati» in «ho sbagliato del 5%
nelle ultime dieci volte».

**Voce della pagella.** «Sa prevedere le sue mosse»: 0 → ≥5 reparti, AD incluso.

**Fatto vuol dire.**
```
node -e "const c=require('./MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json');const a=c.per_reparto.filter(r=>r.autonomia&&r.autonomia!=='bassa');console.log(a.length+' reparti affidabili: '+(a.map(r=>r.reparto).join(', ')||'nessuno'))"
```
Oggi stampa `0 reparti affidabili: nessuno`. Fatto = almeno 5, AD incluso, **con almeno 5 previsioni
chiuse a testa** (una previsione azzeccata su una non è calibrazione, è fortuna: oggi
@customer-success e @designer risultano al 100% con una previsione ciascuno).

**Dipende da.** Le mosse reali su cui prevedere. Fino al 24/8-1/9 i reparti commerciali non
producono mosse: si può calibrare **solo su ciò che si muove davvero** — @tech, @AD, i lavori sulla
macchina. È metà della verità A.

**Chi lo sblocca.** La macchina può imporsi subito l'obbligo di scrivere «mi aspetto X» prima di
ogni lavoro 🟡 (e chiuderlo col numero reale). **Il resto lo sblocca la ripresa del business.**

**Quanto pesa.** Piccolo il meccanismo (l'obbligo prima di ogni mossa), **lungo il tempo**: servono
settimane di previsioni chiuse. È un cantiere che si semina adesso e si raccoglie a settembre.

---

## C6 · I quaderni: 31 vivi su 120
*(cantiere n.5 della richiesta di Nicola)*

**Il problema.** Su 120 senior, **31 hanno un quaderno vivo, 73 lo hanno completamente vuoto** e 89
sono fermi da più di una settimana. Il rituale è: dopo ogni lavoro importante, una riga «mi
aspettavo X, è successo Y».

**Perché conta.** I quaderni sono il modo in cui i 120 senior smettono di essere 120 copie dello
stesso ragionamento e diventano 120 esperienze diverse. Vuoti, l'organigramma è **decorativo**: bello
in un elenco, inutile nei fatti. Ed è anche il pezzo che alimenta la calibrazione (C5): senza riga di
esito, non c'è confronto tra atteso e reale.

**Nota dura, verificata:** perfino i reparti che lavorano non lo fanno. Il quaderno di @tech è fermo
al 20/7 mentre tra il 21 e il 24/7 sono state mergiate decine di PR (è il difetto AR-154). Il
problema non è che i 73 reparti dormono: è che **il rituale salta proprio nei giorni in cui ci sarebbe
più da imparare**.

**Voce della pagella.** «Quaderni vivi»: 31/120 → 72/120.

**Fatto vuol dire.**
```
node -e "const c=require('./MyCity-Vault/90-Memoria-AI/auto-coscienza/chiusura-loop.json');console.log('vivi '+c.vivi+'/'+c.totale+' ('+Math.round(c.vivi/c.totale*100)+'%) · vuoti '+c.vuoti+' · fermi '+c.fermi)"
```
Oggi stampa `vivi 31/120 (26%) · vuoti 73 · fermi 89`. Fatto = ≥72 vivi con la soglia intera,
**oppure** — se Nicola sceglie la strada (b) della verità A — 100% dei **reparti attivi** vivi, con
la soglia intera che torna il 1/9.

**Dipende da.** La decisione della verità A. La parte che si può fare subito senza aspettare nessuno:
il **gate** che impedisce di considerare chiuso un lavoro 🟡/🔴 senza la riga di esito (AR-154). È
già una card in coda dal 24/7.

**Chi lo sblocca.** Il gate: la macchina, con firma sul merge. I 73 quaderni vuoti: **la ripresa del
business**, per costruzione.

**Quanto pesa.** Piccolo il gate. Grosso il resto, e in gran parte non dipende da noi ora.

---

## C7 · La coda delle firme: 50 card ferme
*(cantiere n.6 della richiesta di Nicola)*

**Il problema.** **50 card aperte** aspettano Nicola (11 🔴 · 27 🟡 · le altre segnalazioni). 98 sono
già state chiuse e archiviate. La più vecchia ancora aperta è del **24/6: 31 giorni fermi**. Sei
aspettano da almeno due settimane. Il collo di bottiglia **non è la macchina: è la firma**.

**Perché conta.** Una coda che cresce più in fretta di quanto viene smaltita rende inutile tutto il
lavoro a monte: la macchina produce proposte pronte che nessuno esegue, e ogni giro ne aggiunge.
Peggio: la coda **nasconde le cose urgenti dentro il rumore** — la domanda del bando da 10.000€ che
scade il 30/7 sta nella stessa lista di «pusha un branch».

**Come si smaltisce (proposta operativa).** Tre mosse, in quest'ordine:
1. **Triage per tipo, non per data.** Le card si dividono in tre mucchi: (a) *merge di lavoro già
   scritto e testato* — sono la maggioranza dei 🟡 e si approvano in blocco leggendo cosa cambiano;
   (b) *serve un dato che ha solo Nicola* (P.IVA, prezzo, foto, un numero di telefono); (c) *soldi
   veri o mondo esterno* — restano 🔴 una per una.
2. **Cosa può passare a verde senza rischio.** I merge di codice **solo-macchina** (script del
   cervello, guardiani, memoria) che (i) non toccano il marketplace, (ii) non toccano i soldi, (iii)
   hanno un test che gira. Oggi ognuno di questi costa una firma; potrebbero costarne **una sola,
   sulla regola**, con la macchina che pubblica e Nicola che rilegge in un elenco settimanale.
   ⚠️ Questa è una **riduzione dei controlli** e va firmata sapendolo: si vince velocità, si perde il
   punto in cui Nicola vede il codice prima che entri. È esattamente il tipo di scelta che AR-142
   (C1) rende sicura o pericolosa — **quindi va decisa dopo AR-142, non prima.**
3. **Come si evita che si riformi.** Ogni card nasce con una **scadenza**: se non firmata entro N
   giorni, o decade da sola («non era importante») o sale in cima («era importante e l'abbiamo
   persa»). Oggi non decade nulla: una card del 24/6 è ancora lì con lo stesso peso visivo di una di
   stanotte.

**Voce della pagella.** **Nessuna.** Ed è un buco serio: il collo di bottiglia numero uno di tutta la
macchina **non è misurato da nessuno dei 5 numeri**. Indirettamente pesa su «salute» (i fix in attesa
di firma restano contati come difetti aperti).

**Fatto vuol dire.**
```
node cervello/housekeeping-azioni.mjs --dry-run
```
Oggi stampa `Card aperte: 50 · Card chiuse (da spostare): 98`. Fatto = **nessuna card aperta più
vecchia di 14 giorni** e coda sotto le 20 aperte, con la regola di decadenza attiva.

**Dipende da.** La mossa 2 dipende da C1/AR-142. Le mosse 1 e 3 no: si fanno subito.

**Chi lo sblocca.** **Nicola.** Questo è il cantiere in cui la macchina non può sostituirsi a lui:
può ordinare, raggruppare, proporre la regola di decadenza, ma le 50 firme sono sue.
L'AD può portargliele in **tre blocchi da approvare in una seduta** invece che in 50 momenti diversi.

**Quanto pesa.** Piccolo per la macchina, **medio per Nicola** (una seduta di un'ora, non 50 momenti).

---

## C8 · Le mani: può davvero agire sul mondo reale?
*(cantiere n.7 della richiesta di Nicola)*

**Il problema.** La macchina ha i canali **costruiti** ma **non autorizzati**. Verificato:

```
node -e "const a=require('./cervello/mani-allowlist.json');console.log('email '+a.email.length+' · notifiche '+a.notifica_user.length+' · tabelle ['+a.marketplace_tables.join(',')+'] · n8n '+a.n8n+' · github '+a.github)"
```
stampa `email 0 · notifiche 0 · tabelle [products] · n8n false · github true`.

L'elenco dei destinatari autorizzati è **vuoto** per email e notifiche. Anche con tutte le chiavi
messe e l'invio acceso e un'azione firmata, **non parte niente**: il cancello finale (AR-103) blocca
tutto ciò che non è in quell'elenco. Oggi la macchina ha davvero **due mani sole**: GitHub (aprire
PR, mergiare quando firmato) e la tabella dei prodotti del marketplace.

Sul VPS, i canali con la chiave a posto risultano: **email (Resend) ✅, n8n ✅, marketplace ✅**;
**Telegram ✗** (manca il token). Il comando per rivederlo sul VPS:
```
node cervello/esegui-azione.mjs
```
(⚠️ da lanciare **sul VPS**: in una sessione cloud senza chiavi stampa «NON configurato» su tutto ed
è un falso allarme — lo stesso avviso vale per C9.)

**Perché conta.** Tutta la parte «doer» del mansionario — i senior che *agiscono* invece di analizzare
— oggi si ferma alla coda. La macchina prepara, e poi qualcuno fa a mano. Quando il business
riparte, questo è il moltiplicatore: senza mani, 120 senior producono documenti.

**Voce della pagella.** **Nessuna.** Terzo buco del metro: la pagella misura se la macchina *ragiona*
bene, non se **può fare qualcosa**. Una macchina 5/5 e senza mani non è pronta a gestire un business.

**Fatto vuol dire.** Il comando `esegui-azione.mjs` sul VPS stampa «configurato» su Telegram, email,
notifiche e n8n, **e** l'elenco dei destinatari contiene almeno: la mail di Nicola (per le prove) e
la tabella su cui si vuole poter scrivere. Fatto **non** vuol dire elenco aperto a tutti: vuol dire
elenco **scelto**, con dentro solo ciò che Nicola ha autorizzato.

**Dipende da.** Niente tecnicamente. Ma **accendere le mani prima di aver chiuso C1/AR-142 significa
dare braccia a una macchina che può ancora pubblicare senza firma.** Ordine giusto: prima i freni,
poi le mani.

**Chi lo sblocca.** **Nicola**: le chiavi sono sue, l'elenco dei destinatari è una sua decisione.
La macchina prepara la card con i passi esatti (già in coda: `#accendi-intelligence-sveglia`).

**Quanto pesa.** Piccolo (minuti di configurazione), **alto di conseguenze**.

---

## C9 · I sensori: cosa vede e cosa no
*(cantiere n.8 della richiesta di Nicola)*

**Il problema — e una correzione al punto di partenza.** Nella richiesta si dà per scontato che
Stripe e PostHog siano spenti per scelta e che gli uptime di sito e Pannello non siano armati.
**Verificato: non è più così.** Ultima misura vera sul VPS (24/7 22:20, `sensori-cecita.json`):

| sensore | stato |
|---|---|
| dati marketplace (REST), memoria (REST), Stripe, PostHog, Resend, n8n, uptime sito, uptime Pannello | **✅ ok**, 0 giri ciechi |
| Telegram | ✗ non configurato (manca il token) |

**8 su 8 ok, 1 non configurato.** Gli uptime furono armati il 18/7 (è scritto nella nota di AR-105).
L'unico occhio davvero mancante è **Telegram**, che non è un sensore di business: è il canale con cui
la macchina ti sveglia. Restano nel cantiere due difetti (AR-105, AR-108) che descrivono un mondo
superato: **vanno chiusi con la prova, non lasciati lì a gonfiare il conteggio** (è C2 applicato a un
caso concreto).

⚠️ **Regola da non dimenticare:** `node cervello/verifica-sensori.mjs` va lanciato **sul VPS**. In
una sessione cloud senza chiavi risulta tutto cieco **e riscrive il file di stato con quella
bugia**. Per questo motivo in questa sessione non è stato eseguito: è stato letto l'ultimo stato
vero registrato dal VPS.

**Il vero buco dei sensori, che nessuno guarda:** non manca un occhio, manca un **naso**. Non c'è
sentinella per le contestazioni carta (AR-128, soldi con scadenza rigida) e non c'è un controllo
automatico sulle scadenze esterne (il fix esiste, `scadenzario-check.mjs`, ed è **fermo in coda in
attesa di merge**: card `#merge-scadenzario-check-ar147`).

**Perché conta.** Un sensore spento non fa rumore: resta spento per sempre. Ma qui il rischio è
opposto e più subdolo — **crederli spenti quando funzionano**, e quindi non fidarsi di numeri veri.

**Voce della pagella.** **Nessuna.** Quarto buco: se i sensori fossero ciechi, tutte e 5 le voci
diventerebbero cieche, e la pagella non lo direbbe.

**Fatto vuol dire.** Sul VPS:
```
node cervello/verifica-sensori.mjs
```
Fatto = 9 su 9 ok (Telegram incluso), **e** AR-105/AR-108 chiusi con prova, **e** il controllo delle
scadenze mergiato.

**Dipende da.** Telegram dipende da C8 (stessa chiave). AR-105/AR-108 dipendono da C2.

**Chi lo sblocca.** Telegram: **Nicola** (5 minuti). Il resto: la macchina, con firma sul merge.

**Quanto pesa.** Piccolo.

---

## C10 · Il freno del business è disarmato *(NUOVO — trovato scrivendo questo programma)*

**Il problema.** Esiste un guardiano il cui compito è **impedire alla macchina di lavorare su di sé
mentre il business è fermo** (`north-star-check.mjs`, difetto AR-113): se non arrivano ordini per più
di 3 giorni, deve imporre un vincolo duro sul giro. **Non scatta.**

```
node cervello/north-star-check.mjs --gate >/dev/null 2>&1; echo "esito: $?"
```
Oggi stampa `esito: 0` — cioè «nessuno stallo, procedi pure» — mentre lo stallo reale è di **31
giorni**. Causa: per capire da quanto siamo fermi, legge lo `STATO.md` cercando un testo tipo
«stallo ~700h», e oggi pesca **la prima cosa che somiglia a un numero di ore** dentro una frase che
parla d'altro: estrae **4 ore** da un pezzo di «…chiusi in 24h». 4 ore < 3 giorni → via
libera.

**Perché conta.** È il freno che avrebbe dovuto dire «basta Pannello, il business è fermo da un
mese». Nei 7 giorni con 107 merge sul Pannello e 0 ordini, questo guardiano **ha dato luce verde ogni
volta**. Non è un dettaglio tecnico: è il motivo per cui la macchina ha potuto lavorare su sé stessa
senza che nessun controllo alzasse la mano. Ed è parente stretto di AR-114 (C1), chiuso il 25/7
alle 03:52, che dice la stessa cosa dall'altro lato con un numero: **78% dello sforzo sulla
macchina** negli ultimi 7 giorni.

**Voce della pagella.** **Nessuna** — quinto buco, e il più costoso: **il metro dell'intelligenza non
guarda il business.** La macchina può fare 5 su 5 con zero ordini consegnati.

**Fatto vuol dire.** Il comando qui sopra stampa `esito: 1` finché lo stallo dura, **e** i giorni di
stallo mostrati corrispondono a quelli veri:
```
node cervello/north-star-check.mjs --json | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{const j=JSON.parse(s);console.log('stallo dichiarato: '+j.stallo_giorni+' giorni (reale: 31)')})"
```
Oggi stampa `stallo dichiarato: 0.2 giorni (reale: 31)`. Fatto = numero vicino al vero, letto dai
**dati degli ordini**, non da una frase in un file di testo.

**Dipende da.** Niente. È piccolo e va fatto subito: va anche **registrato come difetto nuovo** nel
cantiere (sarà AR-156), perché oggi non è scritto da nessuna parte.

**Chi lo sblocca.** La macchina; **Nicola firma il merge**.

**Quanto pesa.** Piccolo (poche righe). Grande di conseguenze.

---

## C11 · Il business: cosa dev'essere pronto PRIMA di settembre
*(cantiere n.9 della richiesta di Nicola)*

**Il problema.** 1 negozio, 1 ordine creato e annullato il 24/6, **0 pagati, 0 consegnati**. La
metrica-faro è a zero da 31 giorni, e Nicola riparte tra 4-6 settimane.

**Perché conta.** Se il 1° settembre Nicola ricomincia a inserire negozi e **scopre allora** che il
pagamento non chiude, che il payout al negozio non parte, o che una email al cliente non esce, avrà
bruciato la finestra migliore dell'anno per debuggare cose che si potevano provare oggi, con calma,
senza clienti veri che guardano. Il lavoro di adesso non è vendere: è **far sì che a settembre non
ci siano sorprese**.

**Cosa dev'essere pronto (in ordine di importanza).**

1. **Un ordine vero, dall'inizio alla fine, su Pane Quotidiano.** Prodotto → carrello → pagamento →
   incasso su Stripe → ordine visibile al negozio → consegna → payout. È la mossa n.1 di ogni giro
   da 30 giorni ed è ancora aperta (card `#ordine-test-pq`, checklist di Nicola). Costa 3-5 € e
   dieci minuti. **Finché non è stata fatta almeno una volta, tutto il resto è teoria.**
2. **Il payout al negozio provato almeno una volta**, anche di pochi euro: è l'unico pezzo della
   catena che coinvolge soldi che escono, ed è quello che nessuno ha mai visto funzionare.
3. **La scheda di Pane Quotidiano completa** (foto, prezzi, orari, zona e minimo di consegna): oggi
   il supervisore dei negozi sa già dire cosa manca, e sa proporre i riempimenti da firmare.
4. **I tre testi social già scritti e mai usciti** — pronti da settimane in `consegne/content/`.
   Non è marketing aggressivo (che è in pausa): è verificare che il canale funzioni.
5. **Il bando PI26** (10.000 € a fondo perduto, scade **30/7 ore 16:00**): mancano 3 risposte che ha
   solo Nicola (P.IVA sì/no, spese documentabili, firma digitale). Non è «business ripreso»: è una
   scadenza esterna che passa comunque.

**Voce della pagella.** **Nessuna.** Vedi C10: è il buco più importante del metro.

**Fatto vuol dire.**
```
node cervello/north-star-check.mjs --json | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{const n=JSON.parse(s).north_star;console.log('negozi '+n.negozi_live.valore+' · pagati '+n.ordini_pagati.valore+' · consegnati '+n.ordini_consegnati.valore)})"
```
Oggi stampa `negozi 1 · pagati 0 · consegnati 0`. Fatto = **almeno 1 pagato e 1 consegnato**, con il
payout arrivato al negozio.

**Dipende da.** Il punto 1 dipende **solo da Nicola** (deve fare un ordine vero). Tutto il resto
dipende da quello: senza un ordine, non c'è payout da provare e non c'è consegna da misurare.

**Chi lo sblocca.** **Nicola**, in dieci minuti. È, per distacco, l'azione con il rapporto
sforzo/valore più alto di tutto questo programma: sblocca la metrica-faro, il freno di C10, la
calibrazione dei reparti commerciali (C5) e una parte dei quaderni (C6).

**Quanto pesa.** Piccolo per Nicola. Medio per la macchina (verificare la catena e sistemare ciò che
si rompe).

---

## C12 · Costi e consumo: il freno protegge con le stime, non col consumo reale
*(cantiere n.10 della richiesta di Nicola)*

**Il problema.** Due cose, entrambe verificate:

1. **Il freno sul consumo AI** funziona (provato a mano il 25/7: 99.999 token stimati con soglia
   1.000 → allarme; 500 → nessun allarme) **ma protegge con le stime**. Il consumo reale non viene
   catturato da nessuna parte: `token contati oggi: 0`, e in `motore-ai.sh` non c'è **nessuna**
   lettura del consumo che il modello riporta a fine risposta. La stima è «durata × velocità
   presunta»: un margine d'errore mai misurato. È AR-155 — **e risulta chiuso senza fix** (vedi C3).
2. **L'autonomia di cassa non è calcolabile da 240 giri.** Il burn è noto e scritto nel registro dei
   fatti (**~302 €/mese**: Claude 200 + Vercel 30 + Supabase 50 + VPS 20 + dominio 2), ma il sensore
   della cassa non lo conosce perché manca una riga nella configurazione del VPS
   (`BURN_MENSILE_EUR`). Risultato: `runway: sconosciuto`, con Stripe che legge correttamente 0 € di
   cassa. Il numero c'è nella memoria e non arriva al sensore: **due verità nella stessa macchina.**

**Perché conta.** Il primo rischio esistenziale di un'azienda senza ricavi è finire i soldi senza
accorgersene. Oggi la macchina sa quanto spende (302 €/mese) e sa quanto ha in cassa (0 €), ma **non
mette insieme le due cose**. E il freno che dovrebbe evitare che la macchina bruci il budget di
Claude lavorando su sé stessa si basa su una stima che nessuno ha mai confrontato col vero.

**Voce della pagella.** **Nessuna.** Sesto buco: i soldi non sono tra i 5 numeri.

**Fatto vuol dire.**
```
node -e "const r=require('./MyCity-Vault/90-Memoria-AI/auto-coscienza/cassa-runway.json');console.log('runway: '+r.stato+' · burn='+r.burn_mensile_eur+' · cassa='+r.cassa_disponibile_eur+'€')"
```
Oggi stampa `runway: sconosciuto · burn=null · cassa=0€`. Fatto = `runway` con un numero di mesi,
**e** il comando di C3 che stampa `cattura consumo reale: ≥1` e `token contati oggi: >0`, **e** un
test automatico che dimostra che il freno scatta (oggi la prova è un comando ricopiato a mano — e un
comando ricopiato a mano è già arrivato sbagliato una volta).

**Dipende da.** C3 (AR-155 va riaperto prima di essere risolto davvero).

**Chi lo sblocca.** La riga `BURN_MENSILE_EUR=302` nel VPS: **Nicola, un minuto** (card
`#burn-mensile-env`, in coda dal 20/7). La cattura del consumo reale e il test: la macchina, con
firma sul merge.

**Quanto pesa.** Piccolo.

---

## C13 · Il voto salute non si ri-misura da solo *(NUOVO — trovato scrivendo questo programma)*

**Il problema.** La quinta voce della pagella è «il voto che si dà da sola: 43/100». Verificato da
dove viene: è la **media dei 12 pilastri dell'ultima radiografia completa (23/7 22:20)**. Quella
radiografia ha però scritto un voto complessivo **non valido (zero)**, e il sistema ripiega sulla
media dei pilastri. Dal 25/7 il numero viene **riportato tale e quale** («voto salute NON
ri-misurato»).

E c'è dell'altro: la macchina chiede una radiografia completa **da 53 giri consecutivi**
(`serve_radiografia_completa: true`) e non è mai partita.

```
node -e "const s=require('./MyCity-Vault/90-Memoria-AI/auto-coscienza/storico-salute.json');const u=s.serie[s.serie.length-1];const r=require('./MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-radiografia.json');console.log('voto '+u.voto_salute+' ('+(u.voto_riportato?'RIPORTATO':'misurato')+') · radiografia del '+r.data+' → voto scritto: '+r.voto_salute_architettura+' · serve completa da '+r.sonda.giri_tasso_basso+' giri')"
```
Oggi stampa `voto 43 (RIPORTATO) · radiografia del 2026-07-23 22:20 → voto scritto: 0 · serve
completa da 53 giri`.

**Perché conta.** È l'unica voce della pagella che **non può muoversi per merito**: qualunque cosa si
faccia, resta 43 finché non gira una radiografia completa che produca un voto valido. Chi guarda il
cruscotto vede «43, fermo» e conclude «non è cambiato niente» anche quando è cambiato molto. È lo
stesso inganno del round 2 (il registro che mentiva sui freni), spostato di una casella.

**Voce della pagella.** «Voto salute»: 43 → ≥80. La descrizione dice «sale da solo quando salgono le
altre 4»: **non è vero oggi**, e questo cantiere serve a renderlo vero.

**Fatto vuol dire.** Il comando qui sopra stampa un voto `misurato` (non `RIPORTATO`) con una
radiografia recente e un voto complessivo diverso da zero, **e** la pagella smette di mostrare un
numero vecchio come se fosse fresco (se il voto ha più di N giorni, va detto: «43, misurato 5 giorni
fa»).

**Dipende da.** Niente per la parte «dire la verità sull'età del numero». La radiografia completa
conviene lanciarla **dopo C2/C3**, altrimenti aggiunge decine di difetti nuovi con prove della stessa
qualità di quelle che stiamo riparando — è esattamente il ciclo «analisi su analisi» che Nicola ha
già pagato.

**Chi lo sblocca.** La macchina; nessuna firma per la misura, firma per il merge del fix.

**Quanto pesa.** Piccolo il fix. Medio la radiografia completa (è un lavoro lungo, e va fatto una
volta sola e bene).

---

# 🧭 L'ORDINE DEI ROUND

| round | cantieri | perché in questo punto | serve una firma per partire? |
|---|---|---|---|
| **R4 — «il metro dice la verità»** | **C3**, **C2**, **C10**, **C13** | Tutti i controlli che non controllano. Finché una prova può chiudere un difetto vivo (C3), un guardiano può dare via libera su uno stallo di 31 giorni (C10) e un voto vecchio si presenta come fresco (C13), **ogni round successivo lavora al buio** e rischiamo di ripetere i round 1-3 con più fatica | no |
| **R5 — «i freni»** | **C1** (AR-142 e AR-123 subito; AR-151 dopo R4) | Sicurezza prima. AR-142 è il freno che impedisce alla macchina di pubblicare senza di te: va chiuso **prima** di darle mani nuove (C8) e prima di allargare ciò che passa in automatico (C7) | sì, sul merge |
| **R6 — «sbloccare il flusso»** | **C7** (coda), **C8** (mani), **C9** (sensori), **C12** (costi) | È quasi tutto lavoro **di Nicola**, non della macchina: firme, chiavi, due righe di configurazione. Per questo non consuma il tempo della macchina e può correre accanto agli altri | sì, è quasi tutto firma |
| **R7 — «imparare davvero»** | **C4** (lezioni → blocchi), **C6** (il gate dell'esito) | È qui che la macchina diventa più intelligente invece che più ordinata. Parte dopo R4 perché senza un metro onesto non si distingue un blocco che funziona da uno che sembra funzionare | sì, sul metro (verità C) |
| **R8 — «prima di settembre»** | **C11** (business), **C5** (calibrazione), **C6** a soglia piena | Dipende dalla ripresa decisa da Nicola (24/8-1/9). L'unico pezzo che va anticipato: **l'ordine di prova su Pane Quotidiano**, che si può fare stasera | sì, è Nicola |

**Cosa può girare in parallelo**

- **R4 e la metà indipendente di R5** (AR-142 permessi, AR-123 verifica nel Pannello): file diversi,
  nessuna sovrapposizione. ✅
- **R6 in parallelo a tutto**: sono firme e configurazioni, non codice della macchina. ✅
  Con **una eccezione**: la mossa «cosa passa a verde senza rischio» di C7 e l'accensione delle mani
  di C8 vanno **dopo AR-142**. Dare più autonomia a una macchina che può ancora pubblicare da sola è
  il contrario della sicurezza. ❌
- **R7 dopo R4**, e non prima della firma sulla verità C. ❌
- **R8 dopo il 24/8-1/9** per costruzione — tranne l'ordine di prova, che è di stasera. ⚠️

---

# ✍️ COSA SERVE DA NICOLA

**Tre firme che decidono il programma** (senza queste, 3 cantieri su 13 restano bloccati):

1. **Verità A — le soglie ostaggio della pausa.** (a) invariate, pagella 0/5 fino a settembre;
   (b) misurare i reparti attivi, soglia piena che torna da sola il 1/9.
   *Raccomandazione dell'AD: (b).*
2. **Verità C — il denominatore delle lezioni.** 473 attive e mai potate rendono il 70%
   aritmeticamente impossibile. *Raccomandazione dell'AD: potatura con regola + «una lezione
   diventata blocco conta applicata quando il blocco scatta».*
3. **I sei buchi del metro.** Sei cantieri su tredici (C2, C3, C7, C8, C9-parziale, C10, C11, C12)
   **non muovono nessuna voce della pagella**: coda delle firme, mani, sensori, business, soldi.
   Vuol dire che la pagella misura **l'igiene interna della macchina**, non la sua prontezza a
   gestire un'azienda. *Raccomandazione dell'AD: dichiarare apertamente il perimetro e aggiungere
   due voci — «la macchina può agire» (mani armate) e «il business si muove» (north star) — perché
   una macchina 5/5 senza mani e senza ordini non è pronta a niente.*

**Tre azioni pratiche, minuti non ore:**

4. **Fai un ordine vero su Pane Quotidiano** (3-5 €, ~10 minuti). Sblocca C11, C10, metà di C5 e una
   parte di C6. È la singola azione con più effetto in tutto il programma.
5. **Aggiungi due righe nella configurazione del VPS**: `BURN_MENSILE_EUR=302` (sblocca il calcolo
   dell'autonomia di cassa, fermo da 240 giri) e il token di Telegram (ultimo sensore mancante,
   e il canale con cui la macchina ti avvisa).
6. **Una seduta sulla coda**: 50 card in tre blocchi. La più vecchia aspetta da 31 giorni, e dentro
   c'è la domanda del bando da 10.000 € che **scade il 30/7 alle 16:00**.

---

# 🎯 LE TRE MOSSE CHE SBLOCCANO IL RESTO

1. **Riparare il metro (C3 + C2).** Finché una prova può chiudere un difetto vivo e 24 difetti su 26
   non sono chiudibili da nessuno, ogni round successivo produce numeri che non significano niente.
   È la mossa che rende **misurabile** tutto il resto del programma.
2. **Smaltire la coda (C7).** 50 firme ferme sono lavoro già fatto che non produce effetto, e il
   cruscotto della salute conta quei fix come difetti aperti. È la mossa che rende **efficace**
   tutto il lavoro già fatto.
3. **Un ordine vero su Pane Quotidiano (C11).** Dieci minuti che accendono la metrica-faro, il freno
   di C10, la calibrazione dei reparti commerciali e i quaderni dei reparti fermi. È la mossa che
   rende **reale** tutto il resto.

Le prime due le fa la macchina con la tua firma. **La terza puoi farla solo tu, e costa cinque euro.**

---

## ✅ Riverifica del 2026-07-25 04:43 — tutti i comandi rieseguiti

Il programma è nato alle 03:31. Un'ora dopo è stato **riletto e ricontrollato riga per riga**,
rieseguendo ogni comando invece di fidarsi di quanto c'era scritto. Esito: **13 comandi su 13
girano e stampano quello che il documento dice**, dopo le correzioni qui sopra.

| cantiere | comando | output vero di oggi | combacia? |
|---|---|---|---|
| C1 | bloccanti aperti | `3 bloccanti aperti: AR-123, AR-142, AR-151` | ✅ *(corretto: diceva 4)* |
| C2 | `cantiere-prove.mjs --dry --json` | `non chiudibili: 24 su 26 — {umana:14, auto-sospetta:10, auto-attesa:2}` | ✅ *(corretto: diceva 25 su 27)* |
| C3 | stato di AR-155 | `AR-155: chiuso · cattura consumo reale: 0 · token contati oggi: 0` | ✅ **il difetto è ancora chiuso senza fix** |
| C4 | `tasso-lezioni.mjs` | `tasso 0.18 (83/473)` | ✅ |
| C5 | reparti calibrati | `0 reparti affidabili: nessuno` | ✅ |
| C6 | quaderni | `vivi 31/120 (26%) · vuoti 73 · fermi 89` | ✅ |
| C7 | `housekeeping-azioni.mjs --dry-run` | `Card aperte: 50 · Card chiuse (da spostare): 98` | ✅ |
| C8 | elenco destinatari | `email 0 · notifiche 0 · tabelle [products] · n8n false · github true` | ✅ **mani ancora vuote** |
| C10 | `north-star-check.mjs --gate` | `esito: 0` (via libera, con 31 giorni di stallo) | ✅ **freno ancora disarmato** |
| C11 | north star | `negozi 1 · pagati 0 · consegnati 0` | ✅ |
| C12 | autonomia di cassa | `runway: sconosciuto · burn=null · cassa=0€` | ✅ |
| C13 | voto salute | `voto 43 (RIPORTATO) · voto scritto: 0 · serve completa da 53 giri` | ✅ |
| C1/AR-114 | `allocazione-check.mjs --json` | `macchina 1321 · business 375 · quota 78% · gate_acceso false` | ✅ **chiusura legittima** |

**Tre cose imparate rileggendo, che valgono più della tabella:**

1. **AR-114 è stato chiuso davvero, non per sbaglio.** Era il sospetto giusto da avere — la sua
   prova cerca solo la parola `consegne/tech` dentro un file, e quella parola compare **anche in un
   commento** (riga 46): la firma esatta del falso positivo di C3. Ma il codice sotto esiste per
   davvero (una tabella che classifica ogni cartella in `macchina`/`business`, righe 62-84) e
   produce numeri. **Prova debole, fix vero.** Da rifare comunque la prova quando si farà C2.
2. **PR #542 si intitola «freni 4 → 3» ma non aveva cambiato il programma.** Aveva scritto lo
   script della correzione e si era fermata lì: per 50 minuti il documento ha detto «4 bloccanti»
   con il cantiere che ne segnava 3. È **lo stesso difetto che questo programma condanna in C3 e
   nella regola del ciclo** — dichiarare fatto ciò che è solo scritto — arrivato addosso a chi lo
   stava scrivendo. Lo script è stato eseguito ora, e il documento riverificato dopo.
3. **La coda non è di 140 card, è di 50.** Il numero 140 conta anche le 98 già chiuse e archiviate
   nello stesso file. Le firme che aspettano Nicola sono **50**. La differenza non è un dettaglio:
   140 sembra ingestibile, 50 in tre blocchi è una seduta.

---

## 🔁 Come si verifica questo programma

Alla fine di ogni round, un comando solo:
```
node cervello/pagella-intelligenza.mjs --gate
```
Se il numero della voce che il round doveva muovere **non si è mosso, il fix era finto**. È la regola
del ciclo dei round 1-3, e vale identica per i round 4-8.

Regola aggiunta dal round 4 in poi, per il difetto scoperto in C3: **prima di dichiarare chiuso un
difetto, si esegue il controllo scritto in «fatto vuol dire» e si incolla l'output vero.** Un difetto
chiuso da una prova che nessuno ha visto girare è come non chiuso — anzi è peggio, perché sparisce
dall'elenco.

---

*Scritto dall'AD il 2026-07-25 03:31, corretto e riverificato alle 04:43. Tutti i numeri hanno una
fonte verificata; tutti i comandi sono stati eseguiti prima di essere scritti, e rieseguiti alla
riverifica — 13 su 13. Le tre decisioni della sezione «cosa serve da Nicola» sono proposte, non
scelte fatte: riguardano il metro con cui la macchina viene giudicata, e quel metro lo firma Nicola.*
