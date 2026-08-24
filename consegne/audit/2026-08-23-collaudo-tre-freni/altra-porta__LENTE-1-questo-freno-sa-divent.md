# altra-porta__LENTE-1-questo-freno-sa-divent → ROTTO

## prova eseguita
Tutto eseguito, niente letto-e-riassunto. Il repo vero NON l'ho toccato (`git status --porcelain` a fine giro identico a quello di partenza): gli esperimenti girano su albero finto e su una COPIA del repo (`cp -r cervello pannello/src` + cantiere vero), via `PORTE_GEMELLE_REPO` / `PORTE_GEMELLE_REGISTRO`.

① BASE — il difetto ricostruito diventa rosso (questo REGGE)
$ node cervello/porte-gemelle.mjs
  ❌ chiudere-un-difetto — 0 passa/no · 3 dichiarata/e · 1 scoperta/e
  ❌ [porta-scoperta] cervello/auto-fix.mjs:402 — compie l'atto e non passa da ammissibilitaProva()
  EXIT=1
Albero finto (porta-di-servizio.mjs che chiama timbraChiusura senza guardia):
  ❌ [porta-scoperta] cervello/porta-di-servizio.mjs:3 · EXIT=1
E la copia del repo riproduce lo stesso rosso: EXIT=1.

② ATTACCO CHE PASSA — UNA RIGA e il freno diventa verde SUL CASO VERO
$ printf '\nexport const stato = "chiuso";\n' >> COPIA/cervello/auto-fix.mjs
$ PORTE_GEMELLE_REPO=COPIA node cervello/porte-gemelle.mjs
  ✅ chiudere-un-difetto — 0 passa/no · 3 dichiarata/e · 0 scoperta/e
     (auto-fix.mjs NON compare più nemmeno nell'elenco delle porte)
  ✅ ogni porta di ogni atto passa dalla guardia o è dichiarata.
  EXIT=0
Variante realistica (auto-fix.mjs oggi ha `export { timbraChiusura }` alla riga 43):
$ printf '\nexport const timbraChiusura = _timbra;\n' >> COPIA/cervello/auto-fix.mjs
  ✅ ... 0 scoperta/e · EXIT=0
Causa, misurata con una sonda sul repo vero:
$ node /tmp/sonda.mjs
  identificatori estratti dal rilevatore: [ 'timbraChiusura', 'stato', 'chiuso' ]
  contato come porta  cervello/auto-fix.mjs
  SCARTATO-come-CASA  cervello/contratto-scheda.mjs
`definisceUnIdentificatore` scarta come «casa dell'atto» QUALSIASI file che esporti un nome pescato dalla regex — e la regex contiene le parole `stato` e `chiuso`.

③ VERDE MUTO — provato in due forme, tutte e due EXIT=0
(a) registro con `atti: []` + cantiere VERO (cioè lo stato di oggi, dove il controllo ② ha 0 schede in perimetro):
  🚪🚪 PORTE GEMELLE — 0 atto/i misurato/i, 0 cieco/i
  ✅ ogni porta di ogni atto passa dalla guardia o è dichiarata, e ogni scheda nuova ha nominato il suo atto.
  EXIT=0    ← frase di verde su ZERO misure
(b) rilevatore che non trova niente (scenario: la funzione viene rinominata):
  ✅ chiudere-un-difetto — 0 passa/no · 0 dichiarata/e · 0 scoperta/e · EXIT=0
Sul registro vero questo caso esce rosso solo di rimbalzo (le 3 `esenti` diventano «esenzione-morta»): è una rete accidentale, non una regola — un atto senza esenti resta verde muto.

④ IL CIECO SI MANGIA IL ROSSO
$ rm -rf COPIA/pannello && PORTE_GEMELLE_REPO=COPIA node cervello/porte-gemelle.mjs
  ⚪ chiudere-un-difetto — non ho potuto misurare: la cartella dichiarata «pannello/src» non si legge
  EXIT=2
Il rosso PROVATO su cervello/auto-fix.mjs sparisce perché manca un'ALTRA cartella. (In CI oggi non scatta: `.github/workflows/cancello-lotto.yml` fa `fetch-depth: 0` e `npm --prefix pannello ci`.)

⑤ CONTROLLO ② — chi sfugge alla domanda (albero finto, 4 schede)
  📇 schede chiuse dopo l'accensione: 2 (1 senza timbro)
  ❌ AR-900 (timbro con ora) · ❌ AR-903 (domani) → accusate
  AR-901 `chiuso_il: "2026-08-23"` (data secca) → NON accusata e NON contata da nessuna parte
Nel cantiere vero: 642 timbri con ora, 24 a data secca, 121 senza timbro. `"2026-08-23" <= "2026-08-23 13:01"` è vero: chiudere una grave oggi con la data secca salta la domanda in silenzio.

⑥ COSA REGGE, provato
$ node -e 'import(".../porte-gemelle.mjs").then(...)' → «importato, nessun rapporto stampato · export: 14» (guardia entrypoint OK, AR-445/AR-680)
$ grep writeFileSync cervello/porte-gemelle.mjs → nessuna scrittura cruda, solo `scriviJsonAtomico(REGISTRO, registro)` (AR-639 OK)
$ node cervello/test-cervello.mjs --solo altra-porta → ✅ 1 su 1, 10 asserzioni · EXIT=0 (il runner lo scopre da solo)
$ node cervello/non-vacuita.mjs --difetti AR-796 → ✅ tutte e 2 le mutazioni rendono rosso il loro test · EXIT=0

⑦ UNA SUA DICHIARAZIONE È FALSA
Dice al punto ⑩: «qui la cartella non è un repo git».
$ git rev-parse --is-inside-work-tree → true
$ git log --oneline -1 → f05b658 ... · esiste .git/shallow (clone superficiale)
È un repo git: `sorvegliante.mjs` sul diff lo poteva far girare.

## dettaglio
## In parole semplici

Il freno funziona sul caso per cui è nato — l'ho ricostruito da zero e diventa rosso — ma **si spegne con una riga di codice che non ripara niente**, e sa dire «tutto a posto» dopo aver guardato zero cose. Per questo il verdetto è ROTTO, non «regge con riserva».

## Il guasto grosso: una riga innocua cancella l'accusa

Il freno accusa `cervello/auto-fix.mjs` (è AR-796). Aggiungo a quel file una riga che non cambia una virgola di quello che fa:

    export const stato = "chiuso";

Il freno passa da EXIT=1 a **EXIT=0**, e il file non compare più nemmeno nell'elenco delle porte: sparisce, non viene assolto. Il conto scende da «1 scoperta» a «0 scoperta».

Il perché sta in `porteDiUnAtto`, che chiama `definisceUnIdentificatore`. Quella funzione tira fuori dalla regex del rilevatore tutte le parole di almeno 3 lettere — qui sono **`timbraChiusura`, `stato`, `chiuso`** — e poi scarta come «casa dell'atto» qualunque file che esporti uno di quei nomi. `stato` e `chiuso` sono due parole comunissime in una macchina scritta in italiano: chiunque le esporti da un file che chiude schede rende quel file invisibile al freno, **senza saperlo**.

La versione realistica è peggio della mia. Oggi `auto-fix.mjs` scrive, alla riga 43, `export { timbraChiusura }`. Se un domani qualcuno riscrive la stessa riesportazione come `export const timbraChiusura = ...` — la stessa cosa, scritta in un altro modo — il freno diventa verde. Il commento in cima al file dichiara che la differenza fra «definisce» e «riesporta» è voluta e serve proprio a non assolvere `auto-fix.mjs`: ma la differenza sta nella forma della riga, non in quello che il codice fa. È un cancello che si aggira per sbaglio, durante un refactoring, senza cattiva volontà.

**Questo non è fra i sette limiti dichiarati.** Il limite ② («misuro la presenza, non il percorso») copre l'altro caso — nominare la guardia in un ramo morto, che infatti fa verde e lui lo dice. Qui è diverso: il file non «passa», **scompare dal conteggio**.

## Il secondo guasto: il verde non ha un pavimento

Due modi provati di ottenere `✅ ogni porta di ogni atto passa dalla guardia o è dichiarata` con EXIT=0 dopo aver misurato **niente**:

- svuotare l'elenco `atti` nel registro: stampa «0 atto/i misurato/i» e poi la frase di verde;
- lasciare l'atto ma con un rilevatore che non trova più nessun file — cioè quello che succede il giorno in cui la funzione viene rinominata: «0 passa/no · 0 dichiarata/e · 0 scoperta/e» e verde.

Sul registro di oggi il secondo caso esce rosso, ma solo di rimbalzo: le tre `esenti` diventano «esenzione morta». È una rete accidentale — un atto registrato senza esenti (cioè ogni atto nuovo pulito) resta verde muto. E la parola «misurato» nell'intestazione è una bugia quando il conto è zero.

## Tre cose minori, ma da sapere

**Il cieco si mangia il rosso.** Se una sola delle cartelle dichiarate non si legge (ho tolto `pannello/`), l'atto intero esce ⚪ EXIT=2 e il rosso già provato dentro `cervello/` — che si leggeva benissimo — sparisce. Il commento nel codice dice «il rosso vince sul cieco», ma vale solo fra atti diversi, non dentro lo stesso atto. Oggi in CI non morde: il workflow del cancello fa il checkout intero con `fetch-depth: 0` e installa `pannello`.

**Il controllo ② ha un buco sulla data secca.** Confronta stringhe: `"2026-08-23"` è minore di `"2026-08-23 13:01"`, quindi una scheda grave chiusa oggi col timbro senza ora finisce nel «debito storico» e non viene mai contata — nemmeno fra le «senza timbro», che almeno il rapporto le dichiara. Nel cantiere vero i timbri a data secca sono 24 su 787. Il fratello `timbriStorti` in `contratto-scheda.mjs` quel formato lo vede, quindi il buco è coperto a metà da un altro guardiano, non da questo.

**Una sua dichiarazione è falsa.** Al punto ⑩ scrive «qui la cartella non è un repo git» per giustificare di non aver fatto girare `sorvegliante.mjs`. È un repo git — clone superficiale, `.git/shallow` presente, `git log` risponde. Il sorvegliante sul diff era eseguibile. Tutto il resto di quello che dichiara di non aver verificato l'ho trovato onesto e verificabile: il punto ⑦ (il falso verde dentro `non-vacuita.mjs` sulle mutazioni col campo `test` che comincia per «node ») e il punto ③ (AR-172 non fermato, con la ragione tecnica giusta) sono correzioni vere alla spec, dette prima che gliele trovassi io.

## Cosa regge

Il rosso sul caso vero c'è ed è riproducibile su albero finto. La guardia sull'entrypoint tiene (importarlo non stampa niente). L'unica scrittura passa da `scriviJsonAtomico`. Il runner scopre il test da solo, 10 casi su 10. Le due mutazioni superano `non-vacuita.mjs`. Il file non tocca git, quindi sul clone superficiale non c'è la finestra di «verde per costruzione» che stiamo curando.

## Cosa serve prima di agganciarlo al cancello

Lui dice già di non agganciare la riga finché AR-796 è aperto. Aggiungo tre riparazioni, tutte dentro `cervello/porte-gemelle.mjs`, nessuna delle quali tocca il cancello:

1. **La casa dell'atto si DICHIARA, non si indovina.** Un campo `casa: "cervello/contratto-scheda.mjs"` nella voce del registro, e via `definisceUnIdentificatore`. Finché quella funzione pesca `stato` e `chiuso` dalla regex, il freno è disinnescabile per sbaglio.
2. **Il verde ha un pavimento.** `atti` vuoto → uscita 2. Atto con zero porte trovate → uscita 2 col motivo «il rilevatore non ha trovato nessuna porta: o l'atto non si compie più, o il rilevatore è rotto». Mai uscita 0.
3. **La cecità parziale non cancella la misura.** Se una cartella su due si legge, l'atto resta misurato su quella e i rossi trovati restano rossi; il cieco si dichiara accanto.

Poi tre casi nuovi nella prova — oggi i 10 esistenti non ne coprono nessuno: «un file che esporta un nome generico resta una porta», «registro vuoto → 2», «rilevatore che non trova niente → 2».

## Dettagli tecnici

- Motore: `/home/user/ad-mycity/cervello/porte-gemelle.mjs` — `porteDiUnAtto` righe 172-206, `definisceUnIdentificatore` 160-164, `identificatoriDelRilevatore` 148-151, `verdettoSchede` 352-372 (il confronto `quando <= soglia`), `fileDellAtto` 377-390 (il cieco che mangia il rosso), `main` 483-486 (nessun pavimento sul verde).
- Registro: `/home/user/ad-mycity/cervello/atti-con-porte.json` — un solo atto attivo, `acceso_il: "2026-08-23 13:01"`, 3 esenti con `fino_al: 2026-10-15`.
- Prova: `/home/user/ad-mycity/cervello/test/altra-porta-lasciata-aperta.test.mjs` — 10 casi, EXIT=0, scoperta dal runner.
- Alberi di prova usati: `/tmp/claude-0/-home-user/08541dc6-c549-54e8-a220-706eff039da9/scratchpad/pg` (finto) e `.../scratchpad/copia` (copia del repo vero).
- Riga per il cancello proposta dal collega: da NON aggiungere ora, e non solo per AR-796 — così com'è, il cancello si può far tornare verde con una modifica che non ripara niente.