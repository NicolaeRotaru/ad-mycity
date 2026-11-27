---
data: 2026-11-27 02:25
tipo: ricollaudo
oggetto: flusso n8n «16 · Attività da visitare», riparazioni del primo collaudo (repo N8N, commit 72cf6f2 sopra 6849890)
collaudatore: tech (non ha costruito né riparato il flusso)
---

# Ricollaudo del flusso 16 · Attività da visitare

## Verdetto: BOCCIATO

Questo è il secondo controllo della macchina che ogni lunedì trova i negozi da visitare e li manda a Nicola.
Serve a dire se le riparazioni chieste dal primo controllo funzionano davvero.
La riparazione del conto delle visite regge sulle frasi del primo referto, ma non sulla frase successiva che una
persona scrive davvero. E la riparazione della tabella che non risponde funziona solo nella prova, non dentro n8n.

## In parole semplici

Il flusso 16 è la macchina che ogni lunedì trova i negozi da visitare e manda la lista a Nicola su Telegram.
Il primo collaudo l'aveva bocciato; chi l'ha costruito ha riparato. Io ho ricontrollato le riparazioni con i dati veri.

Molto ora va bene. La lista dei primi 60 negozi è pulita: sono sparite la tabaccheria al 14° posto e due doppioni
del forno Groppi. I messaggi veri della prova del 27/11 escono identici a quelli che Telegram ha già accettato.
Le 26 modifiche dannose di chi ha riparato fanno tutte diventare rosse le prove.

Resta però il difetto che bocciava. Il messaggio del lunedì dice quante attività sono state visitate e quante si sono
iscritte. Chi scrive nella tabella «sì, non ancora iscritta» viene contato come **iscritto**. Chi scrive «visitata, sì»
viene contato come visitato, ma il suo sì si perde. Nessun avviso.
Un esempio vero, fatto con le 10 righe che il flusso ha scritto il 27/11: quattro righe scritte così fanno dire al messaggio «4 iscritte», quando le iscritte sono zero.

Il secondo problema: se la tabella su n8n non risponde, la prova dice che il flusso se ne accorge. Dentro n8n vero
non se ne accorge. Ripropone i 10 negozi già proposti e li riscrive nella tabella.

## Cosa cambia per te

Il flusso ha già girato una volta in modalità «vero»: il 27/11 alle 01:45 (esecuzione 3460, avviata a mano). Ti ha
mandato la lista e ha scritto 10 righe nella tabella. Quindi lunedì prossimo è già la «seconda settimana».
Se in quelle righe scrivi lo stato con una parola sola (visitata, si, no, iscritta), il conto è giusto.
Se scrivi una frase con «non» dentro, il conto sbaglia, e sbaglia verso l'alto: ti mostra iscrizioni che non ci sono.

## Cosa devi fare

Niente subito. Finché il difetto non è chiuso, nella colonna «stato» scrivi una parola sola: visitata, si, no o
iscritta. Le note vanno nella colonna «esito». Chi ha riparato deve chiudere il difetto grave qui sotto prima che il
flusso giri da solo il lunedì.

## Cosa non ho verificato

Non ho fatto girare niente dentro n8n: era vietato. Ho fatto girare il codice dei nodi fuori da n8n, con i dati veri
delle esecuzioni 3458 e 3460. Come si comporta n8n quando un nodo va in errore l'ho letto nel codice sorgente
pubblico di n8n, non visto succedere. Quale versione di n8n gira sul server non sono riuscito a saperlo.
La lista completa è in fondo, nella sezione «Limiti».

---

## Dettagli tecnici

Nel testo: `$S` = `/tmp/claude-0/-home-user/8bb88832-e0e9-500f-ab70-58a43f8d846f/scratchpad`, con la copia del
repo in `$S/ricollaudo-n8n` (identica al commit `72cf6f2`, controllato file per file con `git show HEAD:… | cmp`) e i
dati in `$S/dati`. `$P` = `consegne/audit/2026-11-27-collaudo-flusso-16/prove/ricollaudo/` (i miei programmi),
`$Q` = `…/prove/` (quelli del primo collaudo, da cui uso `tg-html.mjs` e `mutazioni-dopo-riparazione.mjs`).
I dati si estraggono con `NODE_USE_ENV_PROXY=1 node $P/estrai.mjs $S/dati`: due sole GET, sulle esecuzioni 3458 e 3460.
Il codice «prima» è `git show 6849890:…`. Il repo vero `/home/user/N8N` non l'ho toccato: `git status --short` vuoto
prima e dopo tutte le mutazioni.

Uso i negozi MyCity veri letti nella 3460 («SDG Agenzia», «Pane Quotidiano»), non quelli finti del primo collaudo.
Il codice vecchio, con questi negozi, rifà esattamente i conti del primo referto (655 in fila, 117 catene, 84
categorie escluse, 11 doppioni): il confronto prima/dopo è quindi solo merito delle riparazioni.

### I difetti, uno per riga

| # | Gravità | Dove | Cosa | Comando → uscita vera |
|---|---|---|---|---|
| G1-bis | **grave** | `metti-in-fila.js:78-86` (`:81` «iscritt» senza guardare il «non»; `:84` «visitat» senza guardare il «non»; `:82` il sì vale solo in testa) | Gli stati scritti come una frase si leggono nel posto sbagliato, in silenzio: nessuno finisce fra i «non capiti». «Non iscritta» conta come iscritta, «non visitata» come visitata, «visitata, sì» perde il sì. È la stessa malattia di G1 (scorciatoia #11), con in più il numero che sbaglia verso l'alto (#8). La prova `test:159-169` ripete parola per parola gli esempi del primo referto, e lì è verde. | `node $P/stati.mjs $S/ricollaudo-n8n $S/dati` (le 10 righe vere scritte dalla 3460) → `"sì, non ancora iscritta", "si - non iscritta", "visitata, non iscritta", "no, non iscritta"` → `stati letti: {"iscritta":4,"da_visitare":6}` · `Il conto finora: 10 proposte · 4 visitate · 4 hanno detto sì · 4 iscritte.` (vere: 4 visitate, 2 sì, 0 iscritte). `"non visitata", "non ancora visitata", "non visitato (chiuso)"` → `{"visitata":3,…}` · `3 visitate`. `"visitata, sì", "visitata - ha detto sì", "visitata: si", "visitata, no"` → `{"visitata":4,…}` · `4 visitate · 0 hanno detto sì`. |
| m7-bis | minore (la riparazione non regge dentro n8n) | `metti-in-fila.js:88-94` (`:90` legge `it.json.error`), prova `test:172` | Quando la lettura della tabella fallisce, n8n non mette l'errore dentro `json`. Il nodo Data Table restituisce `{ json: <l'elemento che aveva in ingresso>, error }`, e l'ingresso è l'uscita di «Leggi i negozi di MyCity». Il codice non vede nessun errore e nessuna riga: tabella vuota, come prima della riparazione. La prova usa la forma comoda `{ json: { error } }` (scorciatoia #6, la stessa di G2). | Sorgente n8n `packages/nodes-base/nodes/DataTable/actions/router.ts`, righe 106-113 su master: `operationResult.push({ json: inputData, error })`; stessa forma ai tag 1.113.0, 1.115.0, 1.118.0, 1.120.0, 2.0.0, 2.3.0. `node $P/tabella-rotta-vera.mjs $S/ricollaudo-n8n $S/dati` → forma della prova: `letta: false … tornate in fila: 0 · righe che si riscriverebbero: 0`; forma vera: `letta: true · motivo: "" · già proposte: 0 … delle 10 già scritte nella tabella dalla 3460, tornate in fila: 10 · righe che si riscriverebbero: 10 · il messaggio parla della tabella? no`. |
| m4-bis | minore (regressione) | `metti-in-fila.js:106` | «Il marchio uguale al proprio nome non fa catena» fa entrare due catene vere, proprio le due che il primo referto nominava (M11): «Poltronesofà» (`brand=Poltronesofà`) al 628° posto e «Crudo» (`brand=Crudo`, `branch=Piacenza`, gestore «G.S. Nippon Rubiera S.r.l.») al 623°. Entrano anche i due indipendenti giusti, Pelletterie Pugni e Ristorante Brazuka. Anche «Q8» passa la barriera delle catene; la ferma solo la categoria. | `node $P/motivi.mjs $S/ricollaudo-n8n <prima>/metti-in-fila.js <dopo>/metti-in-fila.js $S/dati/mappa-grezza-3458.json $S/dati/negozi-3458.json $S/dati/diff.json` → `catene → in_fila#628(altri negozi) node/9169997764 «Poltronesofà» [brand=Poltronesofà shop=furniture]`, `catene → in_fila#623(bar e ristoranti) node/10206774409 «Crudo» [… brand=Crudo]`, `catene → categorie_escluse way/98854638 «Q8»`. |
| m5-bis | minore (regressione) | `metti-in-fila.js:40-43` | Togliere `supermarket` dalle escluse fa entrare, insieme ai minimarket veri, tre supermercati di catena e un operatore telefonico: prima li fermava la categoria, ora l'elenco dei nomi non li conosce (scorciatoia #39). | stesso comando → `categorie_escluse → in_fila#543 way/184123358 «MD market»`, `#617 way/96573901 «SMA»`, `#633 way/183437249 «Metro»` (cash and carry, `building=industrial`), `#542 node/4484518219 «LycaMobile»`. |
| m1-bis | minore | `metti-in-fila.js:119-127` | Fra due nomi fusi resta quello visto per primo, cioè quello con l'id più basso, anche se è il nome generico. In più, «stesso tipo» vale anche per `shop=yes`, che vuol dire «tipo sconosciuto». Sui dati veri: resta «Drogheria», sparisce «La Pecora Nera». Sono due `shop=yes` a 11 m, mappati con gli stessi tag di rilievo, quindi quasi certamente due negozi. Fuori dalla riparazione dichiarata resta «Bio Forno» / «L'Albero del Pane», stesso civico 80 di Via Dieci Giugno a ~1 m, ai posti 19 e 21. | stesso comando → `categorie_escluse → doppioni node/7597829628 «La Pecora Nera» [shop=yes] <== fuso con node/7597802965 «Drogheria» yes … a 11 m`. |
| m2-bis | minore | `metti-in-fila.js:45` | Il `\b` del filtro sui nomi non vede le parole attaccate: «Baccotabacco» (un bar) resta al 362° posto. Intanto quattro bar con «tabacchi/lotto» nel nome escono come categoria esclusa. Se i bar-tabacchi vadano tolti è una scelta da chiedere a Nicola; oggi non è coerente in nessuno dei due sensi. | `node $P/motivi.mjs …` → `in_fila#217 «bar tabaccheria» [amenity=bar]`, `#228 «Lotto» [amenity=cafe]`, `#255 «Bar tabacchi del corso»`, `#310 «Totocalcio» [amenity=bar]` → `categorie_escluse`; nella fila nuova (`$S/dati/fila-dopo.json`, scritta da `node $P/fila-tutta.mjs $S/ricollaudo-n8n <dopo>/metti-in-fila.js $S/dati/mappa-grezza-3458.json $S/dati/negozi-3458.json $S/dati/fila-dopo.json`) c'è `362 node/4484167080 Baccotabacco · bar e ristoranti · amenity=bar`. |
| m6-bis | minore (raro) | `componi.js:7` | `corto` taglia per unità di testo di JavaScript, non per carattere: se un campo supera i 500 caratteri e un'emoji cade proprio sul taglio, ne resta mezza. Sui dossier veri non succede: il campo più lungo dei 60 della 3460 è di 175 caratteri, e nessuno ha emoji. | `node $P/dossier-lunghi.mjs $S/ricollaudo-n8n $S/dati $Q` → `messaggi 342 · oltre 4096: 0 · con problemi HTML: 50 · giri con link persi: 0 · il più lungo 3885` / `emoji_al_taglio mezzo carattere (surrogato spaiato) → campi da 501,520,700,1000,3000`. |
| P | minore (prove) | `test/16-attivita-da-visitare.test.mjs` | Restano verdi 5 mutazioni mie con un effetto vero: la mappa senza `onError` (R2); `tobacco` tolto da solo, perché lo copre il filtro sui nomi (R4, la barriera doppia #39); `printer_ink`, `energy` e `gas` tolti (R5); il «nome dentro l'altro» anche coi nomi di 1 lettera (R7); lo schema senza `maxLength` (R9). | `node $P/mutazioni-mie.mjs $S/ricollaudo-n8n /home/user/N8N` → vedi Domanda 3. Effetto sui dati veri: R4 → «Bar del Tribunale» (#584) e «Caffe' Via Roma» (#615), due `shop=tobacco`, tornano in fila; R7 → «M» (abbigliamento) sparisce come doppione. |
| m9 | minore (solo nomi) | `flussi/LEGGIMI.md:10` e `:49` | Sul server la dichiarazione è vera: un solo flusso «16 ·». Nel LEGGIMI restano però due sezioni «## 16 ·», e la seconda («Nuovo cliente da MyCity») sul server si chiama «26 ·». | GET `/api/v1/workflows` → `flussi sul server: 75` · `Yp60H6Eo9DkuGxxf "16 · Attività da visitare"` · `LRYfyQRHTLBAvW9c "31 · Montatore"` · `numeri usati da più di un flusso non archiviato: nessuno`; `grep -n "^## 16" flussi/LEGGIMI.md` → `10:## 16 · Attività da visitare…`, `49:## 16 · Nuovo cliente da MyCity`. |

Le riparazioni che reggono, provate: G2 (le prove usano `data`, e M5, M9 e M10 sono rosse), m3 (le 18 catene del primo
referto escono tutte), il resto di m1 (Groppi e l'Enoteca), il resto di m2 (le 13 `shop=tobacco` più energy, gas e
inchiostri), m5 (13 dei 16 `shop=yes` e i minimarket entrano), m6 (nessun tag tagliato) e m8. Su m8: nel sorgente di n8n
(`workflow-execute.ts`, master) la riprova scatta anche con «continua in caso di errore», se l'uscita ha
`json.error`. È proprio la forma che il nodo HTTP 4.2 produce (`HttpRequestV3.node.ts`, `json: { error: responseData.reason }`).

### Domanda 1 — La fila vera della 3458, intera, prima e dopo

`node $P/fila-tutta.mjs …` fa girare la fila intera in un giro solo; il tetto dei 30 lo tolgo solo nella copia in
memoria.

```
prima: {"letti":1037,"senza_nome":169,…,"catene":117,"categorie_escluse":84,"doppioni":11,"gia_su_mycity":1,…,"in_fila":655}
dopo:  {"letti":1037,"senza_nome":169,…,"catene":130,"categorie_escluse":79,"doppioni":19,"gia_su_mycity":1,…,"in_fila":639}
somma 1037 letti 1037 (tutte e due)
```

Voce per voce (`$P/motivi.mjs`), 80 attività cambiano destino:

- **Escono, ed è giusto (43):** 18 catene (Pinalli, Città del Sole, Yogorino, La Piadeneria, Pizzium, Chef Express,
  Pinko, Borbonese, Luisa Spagnoli, Grimaldi Immobiliare, SUN68, Furla, Coin, Pitta Rosso, MaxiZoo, Sportspecialist,
  DF Sport Specialist, OBI). Poi 13 tabaccherie e sigarette, «Zilli Paola Tabaccheria» (era 14ª), Cover Store, CANON,
  «gas sales», «società locale gas». Infine 7 doppioni plausibili: «forneria» e «Groppi» (erano 15° e 17°), l'Enoteca
  a 2 m, «living art cafè», «turkish city», «Alphaville Piacenza», «Eurols».
- **Escono, ed è dubbio (5):** «La Pecora Nera» (m1-bis) e i 4 bar con tabacchi o lotto nel nome (m2-bis).
- **Entrano, ed è giusto o almeno plausibile (25):** 13 dei 16 `shop=yes` (Fumetteria, Laboratorio Orafo, i giochi di
  Stefania e Paolo, Drogheria…; degli altri 3, due tabaccherie restano fuori per il nome e La Pecora Nera è fusa),
  10 dei 14 `supermarket` (Mini Market Piacenza, Est Market, BuonPerTe, una stireria…) e i due indipendenti col
  marchio uguale al nome.
- **Entrano, ed è sbagliato (6):** Poltronesofà e Crudo (m4-bis); MD market, SMA, Metro e LycaMobile (m5-bis).
  Sono tutti fra il 542° e il 633° posto, cioè non prima della 55ª settimana.

**Prime 60:** cambiano solo per le tre uscite (Zilli, forneria, Groppi). Non ci sono catene, tabaccherie né cose che
non vendono. Restano due nomi allo stesso civico (Bio Forno 19°, L'Albero del Pane 21°).
**Tutta la fila:** di catene e tabaccherie restano quelle di m4-bis, m5-bis e m2-bis. Restano anche voci che non
vendono, ma c'erano già prima e dipendono da tag sbagliati sulla mappa: «Palazzetto dello Sport» (591°, prima 610°),
«campo BIFFI» (631°), «AgenzaViaggi» segnata come mobili (505°), due attività chiamate «Unknown» (164° e 566°).
**Negozi veri fusi per errore:** fra i 19 doppioni, 18 sono lo stesso negozio. Ci sono gli 11 di prima, stesso nome
a pochi metri, spesso su civici accanto (5 e 7, 84 e 84a, 153-155-157…), e i 7 nuovi elencati sopra. L'unico dubbio è
La Pecora Nera.

### Domanda 2 — G1: il conto della settimana 2

Con le 10 righe vere che la 3460 ha scritto (forma vera della tabella: `id`, `createdAt`, `updatedAt`):

```
righe vere lette: 10 · già proposte: 10 · tornate in fila: 0
come dice la nota: "visitata", "si", "no", "iscritta" → 10 proposte · 4 visitate · 2 hanno detto sì · 1 iscritte.
i casi del primo collaudo: "Visitata", "sì", " si ", "iscritto", "no grazie", "visitata ✓", "Sì, iscritta"
  → {"visitata":2,"si":2,"iscritta":2,"no":1,"da_visitare":3} · 10 proposte · 7 visitate · 4 hanno detto sì · 2 iscritte.
altre parole naturali: "interessato", "non interessato", "rifiuta", "da richiamare", "chiuso", "okay", "sì!"
  → … · 6 con uno stato che non capisco (scrivi visitata, si, no o iscritta).
```

Le parole singole, anche scritte male, ora si contano giuste, e quelle sconosciute si dicono. **Sono lette male, in
silenzio, le frasi** del difetto G1-bis: «sì, non ancora iscritta» diventa iscritta, «non visitata» diventa visitata,
«visitata, sì» perde il sì. Anche una cella con solo un segno, come la spunta verde (U+2705) o il pollice in su
(U+1F44D), diventa «da visitare» e non «non capito», perché i simboli si tolgono e la cella resta vuota.

### Domanda 3 — Le mutazioni

`node $Q/mutazioni-dopo-riparazione.mjs $S/ricollaudo-n8n` → **26 su 26 rosse**, confermato (da «M1 byte→caratteri:
rossa» a «m8 neverError rimesso: rossa»).

Le mie, `node $P/mutazioni-mie.mjs $S/ricollaudo-n8n /home/user/N8N`:

| Mutazione | Suite | Cosa vuol dire davvero |
|---|---|---|
| R1 mappa con `maxTries: 1` | verde | Innocua: n8n porta i tentativi ad almeno 2 (`getRetryParams`, `Math.max(2, …)`). |
| **R2 mappa senza `onError`** | **verde** | Dopo 3 tentativi il flusso si ferma: niente messaggio «la lista non c'è», arriva solo l'avviso generico del 99. |
| R3 tabella senza `onError` | verde | Innocua: il flusso si ferma e non scrive niente. |
| **R4 tolto solo `tobacco`** | **verde** | Barriera doppia (#39): sui dati veri tornano 2 tabaccherie. |
| **R5 tolti `printer_ink`, `energy`, `gas`** | **verde** | Tornano CANON, «gas sales», «società locale gas». |
| R6 «nome dentro l'altro» fino a 500 m | rossa | — |
| **R7 «nome dentro l'altro» con nomi di 1 lettera** | **verde** | Sui dati veri sparisce «M». |
| R8 nome generico fino a 150 m | rossa | — |
| **R9 schema senza `maxLength`** | **verde** | Il tetto dichiarato all'AD non è provato. |
| R10 «non iscritta» non conta come iscritta | verde | Non è un danno, è la correzione: la prova non decide il caso G1-bis né in un senso né nell'altro. |
| R11 «ok» non vale più sì | verde | Voce di elenco, peso piccolo. |
| R12 cella di soli simboli = «non capito» | verde | Come R10: comportamento non fissato dalla prova. |
| R13 «obi» tolto dalle catene esatte | verde | Voce di elenco, peso piccolo. |

Dopo ogni mutazione il file è rimesso com'era, e il controllo sul repo vero non ha stampato differenze.

### Domanda 4 — Messaggi Telegram

- **I 10 dossier veri della 3460:** `componi.js` riparato, con le uscite esatte dei nodi della 3460, dà **4 messaggi
  identici, carattere per carattere**, a quelli che Telegram ha accettato quella notte (`Manda a Nicola`: `ok: true`
  ×4). Con la fila rifatta dal codice riparato (`node $P/messaggi-3460.mjs $S/ricollaudo-n8n $S/dati $Q`):
  `stessa fila di 10 della 3460: true` · `riparato parte 1/4: 3631 car., problemi: []` … `parte 4/4: 202 car.,
  problemi: []` · `link a Maps 10 · dossier «Chi è» arrivati interi 10 su 10 · righe «Dossier troppo lungo» 0`.
- **Tutte le 639 attività vere**, 30 alla volta, con e senza dossier pieno di `& < > "`: `node $Q/tutti-i-messaggi.mjs
  $S/ricollaudo-n8n $S/dati-tutti $Q` (in `dati-tutti` la fila intera riparata, nei due file che il programma si aspetta)
  → `messaggi controllati 724, con HTML rotto o troppo lunghi 0, il più lungo 3897 caratteri`.
- **Dossier finti lunghi** (100-3.000 caratteri per campo; testo normale, simboli, emoji): 342 messaggi, **nessuno oltre
  4.096, nessun tag rotto, nessun link perso**. 50 messaggi hanno mezzo carattere, solo nel caso m6-bis (campo oltre
  500 con l'emoji sul taglio).

### Domanda 5 — «Nasce rotto?»

```
$ cd $S/ricollaudo-n8n && MYCITY_REPO=/home/user/mycity node --test "flussi/test/*.test.mjs"
# tests 354 · pass 352 · fail 1 · skipped 1
not ok 136 - il listino copiato nel 19 è parola per parola quello del sito
```

L'unica rossa è quella ammessa, già rossa prima. Il file del 16 da solo: `# tests 18 · pass 18 · fail 0`. Il primo
collaudo contava 347 prove sul repo; ora sono 354, cioè le 7 prove nuove del 16.

### Limiti (cosa non ho potuto verificare)

- **Niente dentro n8n.** Come n8n tratta gli errori dei nodi l'ho letto nel sorgente pubblico su GitHub: master di
  `workflow-execute.ts`, `HttpRequestV3.node.ts` e `DataTable/actions/router.ts`; per la tabella anche i tag da 1.113.0
  a 2.3.0. Non l'ho visto succedere. La versione del server non la conosco: `/rest/settings` non la mostra.
  Per m7-bis la forma `{ json: ingresso, error }` è la stessa in tutte le versioni guardate.
- **La tabella vera** non l'ho letta. Ho usato le 10 righe che l'esecuzione 3460 ha restituito dopo averle scritte.
- **Telegram vero:** non ho mandato niente. Non so se Telegram rifiuta un testo col mezzo carattere di m6-bis.
- **Catene e negozi doppi** sono giudizi miei, dai nomi e dai tag. Crudo lo dice il tag `branch`; Poltronesofà, MD,
  SMA e Metro sono marchi nazionali. Che La Pecora Nera e Drogheria siano due negozi diversi non l'ho visto sul posto.
- **I bar-tabacchi:** se debbano stare fuori è una scelta commerciale, non un errore di codice.
- Ho avviato solo programmi `node` brevi e nessun server. Le chiamate a n8n sono state tutte GET: le esecuzioni 3458
  e 3460 (due volte), l'elenco dei flussi e `/rest/settings`.
