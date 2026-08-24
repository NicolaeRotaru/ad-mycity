# ROTTO

## prova
Tutto rigiocato da riga di comando su alberi git veri costruiti da me, mai sul repo vero (che alla fine è identico all'inizio: 13 righe di `git status --short`, nessun processo appeso).

① IL FRENO NASCE VERDE E LA ⓐ MORDE (questo regge).
· `node cervello/due-case.mjs` sul repo vero → exit 0, 22 passi censiti, 4 sotto il tetto.
· `node cervello/test/due-case.test.mjs` con `env -i` → `# tests 25 · # pass 25 · # fail 0`, exit 0, 5,6 s. Il riparatore non ha mentito sul banco.
· AR-514 rigiocato per davvero: albero t1 con storia intera e `origin/main` al commit pre-lotto, passo nuovo `cervello/freno-malato.mjs` che legge `~/.claude/projects` (in casa esce 0 — provato: «2 progetti letti — verde»). Verdetto: `❌ freno nuovo del lotto — NASCE ROTTO … in casa esce 0, nella casa spoglia esce 2 (cieco)`, **exit 1**.
· Stessa cosa DOPO `git commit` del lotto (il flusso normale «ogni modifica finisce in una PR»): ancora **exit 1**. La ⓐ regge.
· Il buco AR-511 è scritto in testa al file E stampato sotto ogni verdetto, come dichiarato. Non glielo conto come difetto.

② PRIMA SCORCIATOIA — IL PASSO INVISIBILE. Trovata al primo tentativo.
Copiato l'albero rosso di sopra e cambiate **due virgolette** nel NOME del passo dentro il cancello (`"freno nuovo del lotto"` → backtick). Lo script malato non è stato toccato: `md5sum` identico (`d5928b67447bf41fcee4d2d2efa684b7`) prima e dopo.
`node cervello/due-case.mjs` → `passi del cancello: 1 · nati in questo lotto: 0 · rilanciati: 0` → `✅ 1 passi censiti`, **exit 0**.
Poi la variante che NON è una furbata ma un refactor normale (un aiutante per non ripetere «node»):
```
const passoNode = (nome, script) => esegui(nome, "node", [script]);
passi.push(passoNode("freno nuovo del lotto", "cervello/freno-malato.mjs"));
```
→ stesso md5 dello script malato, stesso passo montato e ancora eseguito dal cancello → `passi del cancello: 1 · nati 0` → **exit 0**.

③ SECONDA SCORCIATOIA — IL TETTO CHE RISALE. Albero t3, passo nuovo mai rilanciabile (`{ timeout: 600_000 }`), tetto 0.
· corsa → **exit 1** «il debito si è allargato». 
· `--aggiorna-tetto` → «scritto a 0 · ⚠️ ne ho contati 1 … il numero non sale» → ricorsa **exit 1**. La cura del `Math.min` regge su questa strada.
· Poi tolgo **una chiave sola** dal JSON (`tetto_mai_provabili`) e ridò lo **stesso** comando: `✍️ tetto … scritto a 1 · È un gesto esplicito e cercabile nel diff` → `grep` → `"tetto_mai_provabili": 1` → ricorsa **exit 0**. Rosso comprato con `rm` di una riga più il comando che il file stesso documenta.

④ RICORSIONE — non esplode: montato come `["./cervello/due-case.mjs"]` (la prima cintura non riconosce il `./`), la seconda cintura tiene, exit 0 in pochi secondi, zero processi annidati. Ma il freno stampa `✅ le due case del passo nuovo — verde anche nella casa spoglia` su un figlio che non aveva misurato niente.

## dettaglio
DUE SCORCIATOIE MISURATE, ENTRAMBE LASCIANO LO SCRIPT MALATO INTATTO. La regola della lente è esplicita: se la trovi, è ROTTO. Ne ho trovate due, e la prima capita da sola.

**A) IL CENSIMENTO È UNA ESPRESSIONE REGOLARE SENZA CONTROPROVA — è il difetto grave.**
`passiDelCancello` (riga ~215 di /home/user/ad-mycity/cervello/due-case.mjs) riconosce solo la forma letterale `esegui("nome", "comando", ["arg"])` con le virgolette doppie. Un passo scritto in qualunque altro modo **non esiste per questo freno**: non viene rilanciato nella casa spoglia E non viene contato sotto il tetto. E il freno **non ha nessun modo di accorgersene**: non confronta mai quanti passi ha riconosciuto con quanti `esegui(` ci sono nel file. Dice `1 passi censiti` mentre il cancello ne lancia 2, ed esce verde.

Non è la furbata di chi vuole barare: l'ho riprodotto con un piccolo aiutante `const passoNode = (nome, script) => esegui(nome, "node", [script])`, cioè il refactor più banale che un senior fa il giorno che aggiunge il quinto passo di fila. Da `❌ NASCE ROTTO, exit 1` a `✅ exit 0` senza toccare un byte della malattia. È **esattamente** la malattia che il file dichiara di curare, scritta nella sua stessa intestazione: *«un metro che non misura una strada non la dichiara scoperta, dice verde»*.

Il banco non lo copre: il caso «il perimetro si DERIVA dal cancello vero» (riga 171 di cervello/test/due-case.test.mjs) chiede solo `passi.length >= 20`. Con 24 chiamate reali e 22 riconosciute, due passi potrebbero sparire domani e il banco resterebbe verde.

Cosa servirebbe (una riga, non una riscrittura): contare le occorrenze di `esegui(` nel testo del cancello, sottrarre quelle riconosciute e i doppioni per nome, e se il conto non torna uscire **⚪ 2**, mai 0. Un passo che non so leggere è un passo che non ho misurato.

**B) IL CRICCHETTO DEL TETTO SI SBLOCCA TOGLIENDO UNA CHIAVE.**
Il riparatore dichiara: «`--aggiorna-tetto` scrive il MINIMO … quel comando non lo può alzare». Falso come scritto. `tettoDaScrivere({quanti, tetto})` fa `Math.min` **solo se `tetto` è un intero**; se manca, restituisce `quanti`. Quindi `rm` della chiave + lo stesso comando = tetto alzato (misurato: 0 → 1, rosso → verde). Peggio: in quel ramo il comando stampa la riga rassicurante «È un gesto esplicito e cercabile nel diff», cioè **non dice che ha alzato il numero**; l'avvertimento «il numero non sale» compare solo quando il numero effettivamente non sale. E il banco benedice la scappatoia: `assert.equal(tettoDaScrivere({ quanti: 4, tetto: null }), 4, "senza un tetto di prima si scrive la misura")` (riga 491). Il diff mostrerebbe una chiave tolta e rimessa dal tool, cioè una routine di abbassamento — non l'atto deliberato che il file promette.
Cura: senza `tetto_mai_provabili` leggibile, `--aggiorna-tetto` deve rifiutarsi di scrivere e uscire ≠ 0, invece di ripartire da zero.

**C) DUE COSE MINORI, NON BLOCCANTI MA DA DIRE.**
· La prima cintura anti-ricorsione è un confronto di stringhe: `["./cervello/due-case.mjs"]` non è riconosciuto come «io». Non esplode (la seconda cintura tiene, misurato), ma il freno stampa un `✅ verde anche nella casa spoglia` su un figlio che era stato zittito da `DUE_CASE_DENTRO=1`: un verde che ha guardato zero, su se stesso.
· L'intestazione conta AR-526 («un file che c'è ma che la macchina non può scrivere») fra le quattro schede da cui nasce il freno. La casa spoglia è una copia in `/tmp`, scrivibile: AR-526 lì non si riproduce. Non è dichiarato fra i buchi.

**COSA REGGE, PERCHÉ VA DETTO.** La domanda ⓐ fa il suo mestiere: sul difetto vero, con lo script che ce l'ha davvero, diventa rossa — prima e dopo il commit, con la storia intera. Il banco è 25/25 sul serio. L'amputazione della ⓑ è motivata, misurata e il buco è scritto dove si legge il verdetto (in testa al file e stampato sotto **ogni** uscita): quella scelta non gliela conto come difetto, gliela conto come onestà. Il problema non è quello che ha tolto: è che quello che resta si compra con un refactor di una riga.

**REGOLA FERREA DEL GIRO, a margine:** il freno **rilancia** gli altri due freni nuovi dello stesso lotto (dichiarato al punto ⑧ della sua intestazione). Non li nomina e non li importa, ma li esegue, e nella terza consegna precedente li accusava. Chi monta il lotto lo sappia: la regola di questo giro dice che un freno che tocca i fratelli è costruito sbagliato.

FILE: /home/user/ad-mycity/cervello/due-case.mjs · /home/user/ad-mycity/cervello/test/due-case.test.mjs · /home/user/ad-mycity/cervello/due-case.json