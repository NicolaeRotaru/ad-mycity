# ROTTO

## prova eseguita
Ho ricostruito i difetti veri in alberi finti (AD_REPO=…) e lanciato il freno del collega, senza toccare il repo vero.

=== A) AR-514 RIGIOCATO PER DAVVERO — uno script che legge ~/.claude ed esce 2 quando non c'e ===
$ cat cervello/spia-chat.mjs
  const dir = join(homedir(), ".claude", "projects");
  if (!existsSync(dir)) { console.error("⚪ non ho le trascrizioni…"); process.exit(2); }
$ HOME=$(mktemp -d) CI=1 node cervello/spia-chat.mjs
  ⚪ non ho le trascrizioni della chat: non ho potuto misurare
  exit=2                          ← sul runner e ESATTAMENTE AR-514

A1) passo nuovo, nessuna carta:
$ AD_REPO=$PWD node /home/user/ad-mycity/cervello/due-case.mjs
  ❌ contatore del blocco mancante — NESSUNA CARTA (cervello/spia-chat.mjs)
     Non si aggiunge un controllo al cancello senza dire da cosa legge. Incolla questa voce…
       { "legge": ["git-tracciato"], … "impronta": "16047ccce26fb40c", "perche": "DA SCRIVERE: …" }
  exit=1

A2) INCOLLO LA VOCE ESATTA CHE IL FRENO MI HA STAMPATO, senza cambiare una virgola:
$ AD_REPO=$PWD node /home/user/ad-mycity/cervello/due-case.mjs
  ✅ tutti e 2 i passi hanno la loro carta, nessuno legge una fonte impossibile sul runner…
  exit=0                          ← AR-514 INTATTO, E VERDE

=== B) LO STESSO, CON UN COMANDO SOLO ===
$ AD_REPO=$PWD node /home/user/ad-mycity/cervello/due-case.mjs --aggiorna
  ✍️  due-case: riscritte le impronte di 2 carte…   exit=0
$ node -e '…stampa la carta nata da sola…'
  { "nome": "contatore del blocco mancante", "script": "cervello/spia-chat.mjs",
    "legge": ["git-tracciato"],  ← DICHIARAZIONE MAI VERIFICATA, SCRITTA DAL FRENO STESSO
    "impronta": "16047ccce26fb40c", "perche": "DA SCRIVERE: da cosa legge il verdetto…" }
$ AD_REPO=$PWD node /home/user/ad-mycity/cervello/due-case.mjs
  ✅ …   exit=0                   ← verde con dentro scritto «DA SCRIVERE»

=== C) LA TERZA USCITA: legge_se_c_e — ZERO BYTE CAMBIATI NELLO SCRIPT ===
carta onesta  legge:["trascrizioni-chat"] → exit=1  («NON ESISTE MAI (AR-514)»)
sposto la stessa parola in legge_se_c_e   → exit=0
$ HOME=$(mktemp -d) CI=1 node cervello/spia-chat.mjs → exit=2   ← lo script e identico

=== D) AR-511 RIGIOCATO — e qui il freno lo BENEDICE ===
$ cat cervello/spia-indice.mjs
  git diff --cached --name-only … process.exit(rotti.length ? 1 : 0)
$ git reset      # stage pulito = la condizione VERA del runner
$ AD_REPO=$PWD node …/due-case.mjs        # impronta falsata apposta: COSTRINGO la casa spoglia a girare
  ho rilanciato cervello/spia-indice.mjs nella casa spoglia (HOME vuota, CI=1) → uscita 0 (verde),
  la carta dichiara «verde».
  → la casa spoglia CONFERMA: scrivi l'impronta con `node cervello/due-case.mjs --aggiorna`.
$ AD_REPO=$PWD node …/due-case.mjs --aggiorna && AD_REPO=$PWD node …/due-case.mjs
  ✅ …   exit=0                   ← AR-511 verde, script intatto

=== E) IL VERDE DI OGGI HA GUARDATO QUALCOSA? ===
$ node cervello/due-case.mjs --json | …
  daRiverificare (= case spoglie ESEGUITE oggi): 0 · nonImitabili: 0 · impossibili: 0 · senzaCarta: 0
$ node --input-type=module -e '…casaSpogliaAttesa su tutti i 22 col runner IDEALE…'
  MAI eseguibile: test del cervello · sorvegliante del delta · consegne senza esito ·
  prove non vacue · typecheck del Pannello
  eseguibili nella casa spoglia (anche col runner IDEALE): 17/22

=== F) COSA PROVANO DAVVERO LE SUE 25 PROVE ===
$ grep -n "rigiocato" -A 8 cervello/test/due-case.test.mjs
  AR-514: script: { "blocco.mjs": "process.exit(0);\n" }   ← script INNOCENTE
  AR-506: script: { "stop.mjs":   "process.exit(0);\n" }   ← script INNOCENTE
  AR-511 / AR-526: verdettoCarta(carta(…)) — nessuno script, solo la carta
$ node cervello/test/due-case.test.mjs → 25 pass, 0 fail (verificato: passano davvero)

=== G) NON HO SPORCATO NIENTE ===
$ git status --short | grep -c due-case-da-parte → 0 residui; repo vero intatto.

## dettaglio
**In parole semplici.** Il freno non guarda cosa fa uno script: guarda cosa uno ha SCRITTO che lo script fa. Diventa rosso solo se chi aggiunge il controllo si autodenuncia. E chi si autodenuncia non aveva il difetto.

**Il difetto vero, rigiocato, passa.** Ho scritto uno script che legge le trascrizioni della chat ed esce 2 quando non le trova — AR-514 identico, provato: `exit=2` con HOME vuota. Il freno lo becca finche il passo non ha carta. Poi ho fatto **la cosa che il freno stesso mi ordina di fare** — «Incolla questa voce» — e ha detto ✅ exit=0. La voce che stampa arriva gia riempita con `legge: ["git-tracciato"]` (la fonte innocua) e con **l'impronta gia calcolata**, quindi la casa spoglia — l'unico pezzo che misura davvero — non gira mai. Il rimedio stampato dal freno È la scappatoia.

**Con `--aggiorna` e anche peggio: la carta se la scrive lui.** Per un passo senza carta, `bozzaDiCarta(p, null)` finisce dentro `AGGIORNA` e nasce una voce che **dichiara `legge:["git-tracciato"]` su uno script che il freno non ha mai eseguito**, con dentro ancora `"perche": "DA SCRIVERE"`. Un comando, exit=0, verde. Un freno che firma da solo la dichiarazione che deve controllare non e un freno.

**Terza uscita, la piu comoda:** basta spostare la fonte da `legge` a `legge_se_c_e`. Provato: carta onesta → rosso; stessa parola spostata di riga → verde; **zero byte cambiati nello script**, che continua a uscire 2. Il messaggio d'errore del freno la suggerisce lui («allora la fonte va in `legge_se_c_e`»): l'istruzione ha due meta — cambia lo script E sposta la voce — e il freno verifica solo la seconda.

**Su AR-511 non e cieco: lo assolve.** Ho costretto la casa spoglia a girare su uno script che legge l'indice di git ed esce 0 avendo guardato zero, con lo stage pulito (la condizione vera del runner). Risposta: «**la casa spoglia conferma**: scrivi l'impronta con `--aggiorna`». Il criterio della casa spoglia e «il codice d'uscita combacia col dichiarato», e la malattia di AR-511 e proprio *uscire 0 senza aver misurato*: strutturalmente invisibile. La casa spoglia non pulisce nemmeno l'indice di git — dei quattro assi che servivano, imita HOME, `CI=1` e i `_tmp_`, non lo stage ne `.claude/settings.json` del repo. Quindi **dei cinque casi fondatori, la macchina che misura ne puo riprodurre due (AR-506, AR-514); AR-511 e AR-526 poggiano al 100% su una dichiarazione a mano, e AR-534 e fuori (dichiarato, correttamente)**.

**Il verde di oggi e muto nella sostanza.** `--json` sul repo vero: `daRiverificare: 0`, `nonImitabili: 0`, `impossibili: 0`. Zero case spoglie eseguite. Le regole ② e ③ oggi non hanno misurato niente: il verde e il confronto fra due file, uno dei quali l'ha scritto a mano lo stesso autore. Non e verde-cieco al 100% — la regola ① deriva davvero i 22 passi dal cancello e il conto della copertura e reale, quello regge — ma le due regole che dovevano curare la malattia sono inerti. E anche nel caso migliore, col runner ideale, solo **17 passi su 22** possono mai essere eseguiti nella casa spoglia.

**Le sue 25 prove misurano il vocabolario, non la malattia.** Nei casi «AR-514 rigiocato» e «AR-506 rigiocato» lo script-finto e letteralmente `process.exit(0);` — innocente — e la carta contiene la parola proibita. Su AR-511 e AR-526 non c'e nemmeno uno script: si chiama `verdettoCarta()` a mano. Provano che il freno rifiuta **un'autodenuncia**. Nessuna delle 25 costruisce uno script che ha davvero il difetto; io l'ho fatto, e passa. E' l'asticella in vestito nuovo: non e un grep, ma quello che fa scattare il rosso resta una **parola scritta**, non un comportamento.

**Cosa regge, e va detto.** La meccanica c'e e funziona: la casa spoglia esegue davvero, becca davvero un'impronta fuori posto (provato: `uscita 2 (cieco), la carta dichiara «verde»` → exit=1), il ripristino e pulito (zero residui `.due-case-da-parte`, repo intatto), la guardia sull'entrypoint c'e, le 25 prove passano davvero, e i limiti ⑤ ⑦ ⑧ sono dichiarati in testa al file con onesta. Ma **un limite dichiarato che si mangia quattro dei cinque casi fondatori non e un limite: e la copertura.** Il freno vale per un caso solo — «uno script gia carteggiato viene riscritto e qualcuno se ne dimentica» — mentre tutti e cinque i casi veri sono nati come **passi nuovi**, dove il freno regala la carta.

**La frase che riassume:** questo freno fa la domanda giusta, ma la fa solo a chi conosce gia la risposta — e chi conosceva gia la risposta non avrebbe scritto AR-506, AR-511, AR-514 ne AR-526.

**Cosa servirebbe perche regga** (per l'AD, non per me da decidere): ① `--aggiorna` e la bozza NON devono poter nascere verdi — una carta nuova va marcata `da_provare` e la casa spoglia deve girare **almeno una volta** su ogni passo nuovo prima che il verde sia possibile; ② `legge` va **dedotta e confrontata** con quello che lo script apre davvero (import + chiamate a `homedir`/`_tmp_`/`--cached`), altrimenti resta una parola d'onore; ③ la casa spoglia deve spogliare anche l'indice di git, o AR-511 resta fuori portata; ④ finche ① non c'e, la riga nel cancello aggiunge un passo che oggi non puo diventare rosso su nessuno dei difetti che dice di curare.

**Cosa non ho verificato da qui.** Non ho lanciato niente su GitHub Actions: le mie prove girano su alberi finti su questa macchina. Non ho provato la finestra in cui i `cervello/_tmp_*` sono spostati sotto carico parallelo. Non ho riletto tutti e 21 gli script del cancello per stabilire se una delle 22 carte di oggi sia gia bugiarda — se lo fosse, il freno sarebbe nato verde su un malato (e il suo stesso limite ⑧ lo ammette).

**Dettagli tecnici.** File esaminati: `/home/user/ad-mycity/cervello/due-case.mjs` (676 righe), `/home/user/ad-mycity/cervello/due-case.json` (22 carte, 10 fonti), `/home/user/ad-mycity/cervello/test/due-case.test.mjs` (25 casi). Alberi di prova: `…/scratchpad/finto` (AR-514), `…/scratchpad/finto2` (AR-511, con git init per l'indice), `…/scratchpad/finto3` (`--aggiorna`). Il punto di codice che regala il verde e in `main()`: `const c = perNome.get(p.nome) || bozzaDiCarta(p, null);` dentro il ramo `if (AGGIORNA)`, piu `if (ora === carta.impronta) continue;` che salta la casa spoglia. Nel repo vero non ho cambiato nulla: le 13 righe di `git status` sono le 11 di partenza piu `tetti-lotto.json` e `test/puntatori-scollegati.test.mjs`, di un altro agente sulla stessa copia.