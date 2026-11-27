---
data: 2026-11-27 03:10
tipo: collaudo
oggetto: flusso n8n «16 · Attività da visitare» (repo N8N, branch claude/bold-noether-1jwuy6, commit 6849890)
collaudatore: tech (non ha costruito il flusso)
---

# Collaudo del flusso 16 · Attività da visitare

## Verdetto: BOCCIATO

Il motore funziona: legge la mappa, toglie, mette in fila e protegge l'HTML. Il conto dei risultati mente invece in
silenzio nel lavoro di tutti i giorni. E le prove non coprono i punti che fanno girare il flusso dentro n8n.

## In parole semplici

Ho rifatto i conti del giro vero (esecuzione 3458) con un programma mio, in un'altra lingua: tornano tutti, 1.037 su 1.037.
Ho rifatto la seconda settimana con la tabella piena: le 10 attività già proposte restano fuori, come deve essere.
Ho passato tutte le 655 attività vere nei messaggi Telegram: 742 messaggi, nessuno rotto.

Il difetto che boccia sta nel conto che il messaggio porta il lunedì: «visitate, hanno detto sì, iscritte».
Chi scrive nella tabella «sì» con l'accento, oppure «iscritto», non viene contato, e il messaggio non lo dice.
Esempio vero: 4 visite segnate a mano diventano «2 visitate», e l'iscrizione diventa «0 iscritte».

Il secondo problema riguarda le prove. Su 13 modifiche dannose al codice, 6 lasciano la suite verde. Fra queste,
due spegnerebbero il flusso dentro n8n senza che nessuna prova se ne accorga.

## Cosa cambia per te

Se il flusso va in modalità «vero» così com'è, la lista del lunedì arriva e la tabella si riempie. Il conto delle visite
però può dire meno del vero, e una lista avrà doppioni. Per esempio la seconda settimana porta tre righe che quasi
certamente sono lo stesso forno (Groppi), fra il 15° e il 17° posto.

## Cosa devi fare

Niente subito: il flusso è in prova. Prima di passarlo in «vero», chi l'ha costruito deve chiudere i due difetti gravi
qui sotto. Gli altri sono minori e possono aspettare.

## Cosa non ho verificato

Niente è stato eseguito dentro n8n: ho fatto girare il codice dei nodi fuori da n8n, sul banco del repo, con i dati
veri del giro 3458. Il comportamento di n8n (righe vuote, riprova, tabella) l'ho ragionato, non visto. L'elenco
completo sta in fondo, nella sezione «Limiti del collaudo».

---

## Dettagli tecnici

Tutti i comandi partono dalle prove salvate in `consegne/audit/2026-11-27-collaudo-flusso-16/prove/`. I dati si
estraggono con `NODE_USE_ENV_PROXY=1 node prove/estrai-3458.mjs <cartella>`, che fa solo una GET sull'esecuzione 3458.
Nel testo `$S` = la cartella di lavoro con la copia del repo (`collaudo-n8n`), la copia «prima» (`collaudo-prima`) e i dati (`dati/`).
Il repo vero `/home/user/N8N` non l'ho toccato: dopo ogni mutazione ho ricontrollato che fosse intatto.
Mentre lavoravo, chi ha costruito il flusso ha fatto il commit `6849890`. Ho confrontato il commit con la copia che ho
collaudato: i 5 file di codice, le prove e `nomi.mjs` sono identici. Cambiano solo il testo del listino nel Config
(`costruisci.mjs:35-45`) e `LEGGIMI.md`, e nessun difetto qui sotto dipende da loro. Sul commit le prove del 16
restano 11 su 11 verdi.

### I difetti, uno per riga

| # | Gravità | Dove | Cosa | Comando → uscita vera |
|---|---|---|---|---|
| G1 | **grave** | `componi.js:30`, `metti-in-fila.js:69` | Il conto riconosce solo `visitata`, `si`, `no`, `iscritta` scritti così. «sì» con l'accento (la grafia giusta, e il messaggio stesso scrive «hanno detto sì») e «iscritto» (il negozio) si perdono, senza una riga «stati non riconosciuti». È la scorciatoia #11: quello che non sa leggere lo dà per assente. | `node prove/settimana2.mjs /home/user/N8N $S/dati` → con `visitata, si, no, iscritta`: «10 proposte · 4 visitate · 2 hanno detto sì · 1 iscritte». Con `Visitata, sì, " si ", iscritto`: «10 proposte · **2** visitate · **1** hanno detto sì · **0** iscritte». Con `sì, iscritta / no grazie / visitata ✓`: «0 visitate · 0 … · 0 iscritte». |
| G2 | **grave** (prove) | `test/16-attivita-da-visitare.test.mjs:24` e `:202-220` | Le prove mettono in scena la forma comoda. La mappa finta risponde in `body`, ma n8n vero (risposta «text») risponde in `data`: la riga che lo legge (`metti-in-fila.js:15`) non è coperta. Nessuna prova controlla `alwaysOutputData` né `returnAll` sulla lettura della tabella (`costruisci.mjs:71-72`). È la scorciatoia #6. | `node prove/mutazioni.mjs $S/collaudo-n8n` → «M5 … tolta la lettura del campo «data»: VERDE»; «M9 … senza alwaysOutputData: VERDE»; «M10 … senza returnAll: VERDE». Sulla risposta vera M5 dà `{"letta":false,"motivo":"risposta della mappa illeggibile (Unexpected end of JSON input)"}`: la lista non c'è più, ogni settimana. |
| m1 | minore | `metti-in-fila.js:46`, `:90-92` | I doppioni si tolgono solo con nome identico entro 80 m. Lo stesso negozio con nomi diversi resta: «forneria», «panetteria groppi» e «Groppi» sono a ~10 m fra loro, ai posti 15-16-17, cioè nella lista della seconda settimana. La normalizzazione dell'apostrofo sbaglia: «L' Enoteca» diventa `l enoteca` e «L'enoteca» diventa `lenoteca`. Due punti a 2 m restano doppi. | `python3 -I prove/coppie.py $S/dati …` → `(1, 22, 'Bio Forno', 24, "L'Albero del Pane")`, `(2, 104, "L' Enoteca - Maison du Cognac", 448, "L'enoteca - Maison du Cognac")`; coordinate di «forneria» 45.05057,9.69646, «panetteria groppi» 45.05061,9.69650, «Groppi» 45.05053,9.69657. |
| m2 | minore | `metti-in-fila.js:29`, `:38-41` | Il codice esclude `lottery`, `betting`, `e-cigarette`, `mobile_phone`, ma le stesse cose passano con un altro tag. 13 `shop=tobacco` sono in fila, fra cui «Tabacchi Lotto», «Tabaccheria Totocalcio», «Tabaccheria Ricevitoria», «Sigarette Elettroniche». Passano anche «Cover Store» (`mobile_phone_accessories`), «CANON» (`printer_ink`), «gas sales» (`energy`), «società locale gas» (`gas`). «Zilli Paola Tabaccheria» (`shop=convenience`) è al 14° posto come «fresco», con peso 100. | `python3 -I prove/categorie.py $S/dati` → «shop=tobacco 13 … shop=mobile_phone_accessories 1 … shop=printer_ink 1 … shop=energy 1 … shop=gas 1»; `node prove/prime60.mjs …` → «14 120.1 409m node/4484448036 «Zilli Paola Tabaccheria» [fresco] shop=convenience». |
| m3 | minore | `metti-in-fila.js:44` | Catene che passano: nessuna nelle prime 60, 17 più in giù. «Pinalli» è al 65° posto (settimana 7), «Città del Sole» all'84°. Dopo: Yogorino, La Piadeneria, Pizzium, Chef Express, Pinko, Borbonese, Luisa Spagnoli, Grimaldi Immobiliare, SUN68, Furla, Coin, Pitta Rosso, MaxiZoo, Sportspecialist/DF Sport Specialist, OBI. Due sono errori di scrittura dell'elenco: c'è `maxi zoo` ma sulla mappa è «MaxiZoo»; c'è `la piadineria` ma sulla mappa è «La Piadeneria». | `python3 -I prove/nomi.py $S/dati` → «65:Pinalli», «84:Città del Sole Piacenza», «554:Coin», «643:MaxiZoo», «651:OBI», «297:La Piadeneria» … (riconoscimento come catena = mio giudizio, non un dato della mappa). |
| m4 | minore | `metti-in-fila.js:82` | 3 delle 117 «catene» sono probabilmente negozi indipendenti col tag `brand` uguale al proprio nome. «Pelletterie Pugni» ha `brand=PUGNI` e una email gmail del titolare. «Ristorante Brazuka» ha `brand=Ristorante Brazuka`. «Lbo Ottica Piacenza» ha `brand=O bag`, un tag sbagliato. | `node prove/catene.mjs /home/user/N8N $S/dati` → «46. node/4761697366 «Pelletterie Pugni» shop=bag :: brand=PUGNI», «31. … «Ristorante Brazuka» … :: brand=Ristorante Brazuka», «42. … «Lbo Ottica Piacenza» … :: brand=O bag»; «totale 117». |
| m5 | minore | `metti-in-fila.js:38` | `shop=yes` vuol dire «categoria sconosciuta», ma il codice lo mette fra le categorie escluse. Così 16 negozi veri, fra cui «Fumetteria», «i giochi di Stefania e Paolo», «Laboratorio Orafo» e «Drogheria», finiscono nel messaggio come «in categorie dove non entriamo». Anche `supermarket` toglie minimarket indipendenti: «Mini Market Piacenza», «Est Market Piacenza», «BuonPerTe». | `node prove/escluse.mjs /home/user/N8N $S/dati` → «yes 16: Fumetteria \| Cervini Timbri s.a.s. \| … \| i giochi di Stefania e Paolo \| …», «supermarket 14: … Mini Market Piacenza \| Est Market Piacenza …»; «totale 84». |
| m6 | minore | `componi.js:52`, `prepara-lavoro.js:23-25`, `comune.mjs:42` | Un blocco oltre i 3.800 caratteri si taglia a 3.780, e il taglio può cadere dentro `<a href="…`. Telegram allora rifiuta il messaggio, il nodo ha `onError: continue` e nessuna riprova: il messaggio si perde in silenzio, mentre le righe si scrivono lo stesso. Succede solo se l'AD scrive ~665 caratteri per campo, cioè 2,2 volte i 300 chiesti, e lo schema non ha un `maxLength`. Con i 300 chiesti non succede. | `node prove/taglio.mjs /home/user/N8N $S/dati $S/script` → «campi di 300 caratteri: 6 messaggi … HTML rotto: 0»; «campi di 665 caratteri: … link a Maps arrivati 9 su 10, messaggi con HTML rotto: 1 · parte 3 (3781 car.): tag aperto e mai chiuso con «>» … «<a href="https://www.google.com/maps/sea»»; «campi di 700 caratteri: … link a Maps arrivati 0 su 10, messaggi con HTML rotto: 7». |
| m7 | minore | `costruisci.mjs:72`, `metti-in-fila.js:65-70`, `componi.js:30` | Se la tabella non risponde, il flusso la tratta come «zero proposte»: le prime 10 tornano in fila e si riscrivono, e la riga del conto sparisce senza avviso. È il contrario di quello che il flusso fa, giustamente, con la mappa. | `node prove/tabella-non-letta.mjs /home/user/N8N $S/dati` → «gia_proposte 0 · proposte_finora 0», «il messaggio parla della tabella? no». |
| m8 | minore (non visto su n8n) | `costruisci.mjs:66` e `:69` | Su «Chiedi alla mappa» c'è `retryOnFail` insieme a `neverError: true`. Secondo come funziona n8n, un 429 o un 504 di Overpass non è un errore del nodo, quindi non si riprova. La settimana va persa finché qualcuno non rilancia a mano. Il messaggio lo dice in modo onesto. | Letto nel codice; non eseguito su n8n (vedi Limiti). |
| m9 | minore | `nomi.mjs:16`, `PIANO-ORDINE.md:190`, `LEGGIMI.md` | Su n8n esiste ancora «16 · Montatore», che non è stato rinominato. Con questo flusso i numeri 16 sono due, e in LEGGIMI ci sono due sezioni «## 16 ·». Riguarda solo i nomi, non il funzionamento. | `grep -n "16 ·" flussi/PIANO-ORDINE.md` → riga 190 «fatta il 25/11 per tutti i flussi vivi, tranne «16 · Montatore»». |

Una nota che non è un difetto, ma una domanda per Nicola. Ai primi posti ci sono i concorrenti diretti del negozio
faro: al 2° posto «Pane e Caffè Pasticceria e Pasta Fresca», un forno a 17 m da Pane Quotidiano in Via Calzolai 13,
e al 9° «Sapore di Pane». Il punteggio premia proprio «fresco e vicino».

### Domanda 1 — I conti del giro 3458, ricalcolati da me

Il programma è mio, in Python (`prove/riconta.py`). Dal file di produzione legge solo gli elenchi (catene, escluse,
segmenti) come dati; la logica è riscritta da capo.

```
$ python3 -I prove/riconta.py mappa-grezza.json negozi.json …/metti-in-fila.js
{'senza_nome': 169, 'in_fila': 655, 'catene': 117, 'categorie_escluse': 84, 'doppioni': 11, 'gia_su_mycity': 1}
somma 1037 letti 1037
gia_su_mycity: [('node', 7603668770, 'Pane Quotidiano Snc')]
distanza massima nella risposta 4987
per segmento (ricontato): {'cura della persona': 104, 'regali': 68, 'bar e ristoranti': 251, 'fresco': 50, 'altri negozi': 171, 'artigiani': 10, 'pescheria (fase 2)': 1} somma 655
```

**Tornano tutti**, voce per voce e segmento per segmento, e la somma fa 1.037. La risposta grezza: 947 nodi, 89 vie,
1 relazione, nessun `remark` di errore.

Nota: il codice che ha girato nella 3458 non è identico al repo. Manca una voce, `food: 'alimentari'`, per questo il
messaggio vero scrive «· food ·». I conti sono uguali, perché quella riga cambia solo l'etichetta.

### Domanda 2 — La fila vera, prime 60 e campione delle catene

Ho fatto girare `metti-in-fila.js` intatto sulla risposta vera, con i negozi `['Pane Quotidiano','Casa Linda']` e la
tabella vuota. Per vedere oltre il tetto di 30 ho usato il flusso stesso: ho segnato le prime 30 come «già proposte»
e ho rifatto il giro (`prove/prime60.mjs`). Con 22 giri così ho avuto la fila intera, 655 su 655
(`prove/fila-intera.mjs`).

- **Catene nelle prime 60:** nessuna che io riconosca. Le prime arrivano al 65° posto (Pinalli) e all'84° (Città del
  Sole); l'elenco completo è al difetto m3.
- **Chiuse:** nessuna marcata come chiusa sulla mappa. Ci sono però segni di nomi vecchi rimasti sulla mappa, cioè
  due nomi nello stesso punto: «Bio Forno» e «L'Albero del Pane» a 1 m (posti 22 e 24), e il gruppo Groppi (15-17).
  Da qui non posso sapere quale dei due è chiuso.
- **Cose che non vendono o categorie da non toccare:** al 14° posto «Zilli Paola Tabaccheria», in `shop=convenience`
  e quindi messa nel «fresco». Più in giù 13 tabaccherie con lotto e scommesse, una di sigarette elettroniche e due
  di elettronica (difetto m2). Nelle prime 60 un solo tag sbagliato sulla mappa: «Colorificio Bazzani», segnato
  `shop=books`, è al 49° posto fra i «regali».
- **Indipendenti esclusi come catena:** le ho guardate tutte e 117, non un campione (`prove/catene.mjs`). 19 sono
  escluse solo per il nome, e sono tutte catene vere. 88 hanno più motivi. 10 hanno solo il tag `brand`: fra queste
  ci sono i 3 probabili indipendenti del difetto m4.

### Domanda 3 — La settimana 2

Ho preso le 10 righe prodotte davvero da `righe-tabella.js` e le ho rimesse nella forma del nodo Data Table, con `id`,
`createdAt` e `updatedAt`.

```
$ node prove/settimana2.mjs /home/user/N8N $S/dati
S1 righe scritte: 10 campi: osm,settimana,proposta_il,nome,tipo,segmento,indirizzo,telefono,sito,distanza_m,punteggio,perche,offerta,mappa,dossier,stato,esito
S2 gia_proposte: 10 · delle 10 di S1 tornate in fila: 0 · proposte_finora: 10 · stati: {"da_visitare":10}
S2 conto nel messaggio: Il conto finora: 10 proposte · 0 visitate · 0 hanno detto sì · 0 iscritte.
S2 «tolte»: Tolte 117 catene, 84 in categorie dove non entriamo, 11 doppioni, 1 già su MyCity, 10 già proposte, 169 senza nome, ne restano 645 in fila
```

Le 10 restano fuori e il conto è giusto finché gli stati sono scritti esattamente come dice la nota. Con gli stati
scritti a mano in modo naturale il conto scende, senza avviso: è il difetto G1. «Visitata» con la maiuscola e « si »
con gli spazi vanno bene, perché il codice toglie maiuscole e spazi; «sì», «iscritto», «visitato» e «no grazie» invece
si perdono.

### Domanda 4 — Telegram (HTML)

- I 2 messaggi veri della 3458 (3.746 e 1.045 caratteri) sono puliti: `node prove/messaggi-veri.mjs` → «problemi: []».
- Tutte le 655 attività vere, 30 alla volta, con e senza un dossier pieno di `& < > " → «» 🍞`:
  `node prove/tutti-i-messaggi.mjs` → «messaggi controllati 742, con HTML rotto o troppo lunghi 0, il più lungo 3900
  caratteri». La protezione dei caratteri regge, e anche la `&` nei link.
- **Nell'uso normale non ho trovato un messaggio rotto né oltre i 4.096 caratteri.** L'unico caso rotto che ho trovato
  è quello del difetto m6: serve un dossier dell'AD più lungo del doppio di quanto chiesto. In quel caso il messaggio
  si perde in silenzio e le righe si scrivono lo stesso.

### Domanda 5 — La raccolta intera e «nasce rotto?»

```
repo vero:            # tests 347 · pass 345 · fail 1 · skipped 1   → not ok 129 - il listino copiato nel 19 è parola per parola quello del sito
copia, git stash -u:  # tests 336 · pass 334 · fail 1 · skipped 1   → not ok 118 - il listino copiato nel 19 …
```

La prova del listino era **già rossa prima** di questo lavoro. Nella copia l'ho lanciata con
`MYCITY_REPO=/home/user/mycity`, così legge lo stesso file del sito. Il motivo, nel log: «sul sito non c'è più: «Un’analisi
completa all’avvio: …»»; dipende da `mycity/lib/agenzia/preventivo.ts` e non tocca il flusso 16. La differenza fra
prima e dopo è +11 prove, cioè le 11 del 16, tutte verdi. Il cambio a `nomi.mjs` non rompe nient'altro: `nomi.test.mjs`
è verde. L'unica prova saltata è la stessa prima e dopo (FLUSSO_12 non indicato).

### Domanda 6 — Mutazioni sul codice di produzione (nella copia)

`node prove/mutazioni.mjs $S/collaudo-n8n`. Lancia `node --test flussi/test/16-attivita-da-visitare.test.mjs` dopo
ogni mutazione, rimette il file com'era e controlla che il repo vero sia intatto.

| Mutazione | Suite |
|---|---|
| M1 tetto dei 64 KB contato in caratteri invece che in byte | rossa |
| M2 tetto alzato oltre la routine (50.000 → 66.000) | rossa |
| M3 tolta l'esclusione delle già proposte | rossa |
| M4 mappa: ignorato il codice di risposta (429/504 presi per buoni) | rossa |
| **M5 mappa: tolta la lettura del campo `data` (la forma vera in n8n)** | **verde** |
| M6 righe nella tabella anche in prova | rossa |
| **M7 tolto il taglio dei blocchi oltre 3.800 caratteri** | **verde** |
| **M8 tetto del messaggio alzato (3.900 → 4.300, oltre i 4.096 di Telegram)** | **verde** |
| **M9 «Leggi le attività già proposte» senza `alwaysOutputData`** | **verde** |
| **M10 lettura della tabella senza `returnAll` (n8n ne dà 50)** | **verde** |
| **M11 catene: tolta da sola la barriera del tag `brand`** | **verde** |
| M12 componi manda anche in prova | rossa |
| M13 tolta l'esclusione dei negozi già su MyCity | rossa |

Uscita finale: «repo vero intatto dopo tutte le mutazioni». Cosa vuol dire ognuna delle 6 verdi:

- **M5:** il flusso vero non legge più la mappa, mai, e le prove restano verdi. Provato sulla risposta vera, vedi G2.
- **M9:** senza quella riga, il primo lunedì la tabella è vuota e n8n non passa nessun elemento ai nodi dopo. Niente
  lista e niente righe, con l'esecuzione segnata «riuscita». È come lavora n8n, non l'ho visto girare.
- **M10:** dalla settimana 7, con più di 50 righe, le attività già proposte tornano in fila. Stesso limite: non visto
  su n8n.
- **M11:** è la scorciatoia #39, la barriera doppia. Nella prova la pizzeria finta ha sia `brand` sia `brand:wikidata`.
  Sui dati veri, senza la barriera `brand` entrano 6 attività, fra cui «Poltronesofà» e «Crudo», che sono catene.
- **M7 e M8:** il ramo del taglio non è mai esercitato dalle prove. Nessun blocco di prova supera i 3.800 caratteri,
  e il controllo «≤ 4096» non può fallire con i testi usati.

### Limiti del collaudo (cosa non ho potuto verificare)

- **Niente dentro n8n.** I nodi li ho fatti girare con il banco `esegui-codice.mjs`. Questi comportamenti di n8n li ho
  ragionati e non visti: l'assenza di elementi quando manca `alwaysOutputData`, la riprova che non scatta con
  `neverError`, il limite di 50 righe senza `returnAll`, la lettura della tabella senza filtri che restituisce tutte le
  righe. Su quest'ultima nel repo non c'è un altro flusso che la usi, e la documentazione di n8n
  (docs.n8n.io) non è raggiungibile da questa sessione: andrebbe permessa nelle impostazioni di rete.
- **La tabella vera** `ym5WaeuBbBf0ZuQe` non l'ho letta, perché mi era vietato. Non so se le sue colonne coincidono
  con le 17 che il flusso scrive, né se una colonna testo accetta un dossier di ~2.000 caratteri.
- **Telegram vero:** non ho mandato messaggi. Il controllo HTML è un mio programma (`prove/tg-html.mjs`) che segue le
  regole pubblicate da Telegram. Che Telegram rifiuti l'intero messaggio con un `<a` aperto è la sua regola nota, ma
  non l'ho provato.
- **Chiuse e catene sul terreno:** chi è una catena o chi ha chiuso l'ho giudicato io, dai nomi e dai tag. La mappa
  non ha la data dell'ultima modifica (`out tags center`), quindi un negozio chiuso ma non segnato non si vede.
- **L'esecuzione 3460 in corso** non l'ho guardata né toccata.
- **«Chiedi all'AD» vero:** non so quanto spesso l'AD supera i 300 caratteri per campo, e da questo dipende quanto è
  probabile il difetto m6.
- Ho avviato solo programmi `node` e `python3` brevi, e nessun server. Non resta acceso niente.
