# REGGE

## prova
Tutto eseguito da me su una COPIA del repo (PORTE_GEMELLE_REPO/PORTE_GEMELLE_REGISTRO). Repo vero a fine giro identico all'inizio: `git status --porcelain` = 5 M + 8 ??, HEAD f05b658, `grep -c porte-gemelle cervello/cancello-lotto.mjs` = 0.

A) LE 6 ACCUSE DEI REFERTI, RIGIOCATE DA ME (non credute al riparatore)
(B) «una riga innocua e il freno diventa verde» — CHIUSA. Registro senza tetto (mele con mele): base = `❌ [porta-scoperta] cervello/auto-fix.mjs:402`, EXIT=1. Poi, una alla volta in fondo ad auto-fix.mjs:
  · `export const NOTA = "ammissibilitaProva";`                          → «0 chiama/no la guardia · 1 scoperta/e» EXIT=1
  · `throw new Error("… vedi ammissibilitaProva in prova-ammissibile.mjs");` → EXIT=1
  · `import { ammissibilitaProva as _g } from "./prova-ammissibile.mjs";`   → EXIT=1
  · variante mia, non nel referto: `// esempio: ammissibilitaProva(scheda) va chiamata prima di chiudere` → EXIT=1
(C) «il rosso muore anche su una porta NUOVA» — CHIUSA. Registro VERO (tetto 1). Creato `cervello/porta-di-servizio.mjs` che chiama timbraChiusura senza guardia → `❌ [sopra-il-tetto] cervello/auto-fix.mjs:402, cervello/porta-di-servizio.mjs:3` EXIT=1. Aggiunta la riga-stringa in auto-fix.mjs (altro file) → ANCORA EXIT=1, «2 scoperta/e».
(D) «il tetto crolla a zero» — CHIUSA. `--aggiorna-tetti` con la riga innocua → «🔻 tetti abbassati: 0 (nessuno da abbassare)», tetto_porte resta 1.
(E) la causa (`\bnome\b` sul testo grezzo) — RIMOSSA: `chiamaLaGuardia` cerca `nome(` su `soloCodice(testo)`.
(F) «il test non lo copre» — CHIUSA: 20 casi (c'è N6 con 5 varianti, N7, N8, N9, N10, N11), e la mutazione n.2 rimette esattamente `new RegExp("\\b"+fuga(n)+"\\b").test(String(testo))` → il banco diventa rosso.
(lente2 ③) controllo ② tolto davvero: `grep -rln altra_porta` su cervello + pannello/src → solo porte-gemelle.mjs, e lì solo in due righe di commento. `grep due-case|puntatori-scollegati` sui suoi file → solo la riga in cui dichiara di non dipenderne.

B) IL DIFETTO VERO RICREATO, NELLA FORMA IN CUI CAPITA QUI
Porta nuova in `cervello/*.mjs` (timbraChiusura) → EXIT=1 col nome e la riga.
Porta nuova in `pannello/src/lib/chiudi-dalla-cabina.ts` con `scheda.stato = "chiuso"` → EXIT=1, `pannello/src/lib/chiudi-dalla-cabina.ts:3`.
Rosso che sopravvive al cieco: `rm -rf pannello` + porta nuova in cervello → EXIT=1 con ⚪ «MISURATO SOLO IN PARTE» accanto; senza porta nuova → EXIT=2, mai 0.

C) CACCIA ALLA SCORCIATOIA (8 righe provate in fondo alla porta scoperta)
Comprano il verde: `if (0) ammissibilitaProva();` · `function _mai(){return ammissibilitaProva({});}` · `import * as _P …; if (0) _P.ammissibilitaProva();` · `const finto={ammissibilitaProva:()=>true}; finto.ammissibilitaProva();` → tutte EXIT=0. Sono i limiti ② e ②bis/④ dichiarati in testa al file (chiamata, non percorso).
NON comprano il verde: `export const _API = { ammissibilitaProva };` · `typeof ammissibilitaProva === "function" ? … : null` → EXIT=1.

D) IL VERDE HA GUARDATO QUALCOSA
Repo vero: EXIT=0 con 4 porte esaminate e 1 scoperta stampata a ogni corsa. Pavimento provato: registro con `atti: []`, rilevatore che non trova niente, guardia senza file → sempre ⚪ EXIT=2 con «le porte esaminate sono ZERO», mai 0.

E) BANCO E CONTORNO (ambiente pulito, `env -i` senza HOME e con solo node nel PATH)
`cervello/test/altra-porta-lasciata-aperta.test.mjs` → 20 pass, 0 fail, EXIT=0, 1,7 s · `test-cervello.mjs --solo altra-porta` → 1 file su 1, 20 asserzioni · `non-vacuita.mjs --difetti AR-796` → 7 mutazioni su 7 rendono rosso il test, EXIT=0 (le ho lette: sono sostituzioni vere di codice, non etichette).
Sola lettura: 3 corse, md5 del registro invariato · 0 spawn/exec/child_process/fetch · nessun writeFileSync crudo · import del modulo non fa partire niente (15 esportazioni, zero stampe) · due corse identiche carattere per carattere.

F) I BUCHI CHE HO TROVATO IO (misurati, non ipotizzati)
① Il rilevatore vede 4 grafie su 8 di una porta NUOVA: VISTE `timbraChiusura(…)`, `d.stato = "chiuso"`, `Object.assign(d,{stato:"chiuso"})`, `"chiuso".toString()`; INVISIBILI `d.stato = 'chiuso'` (apici singoli), `` d.stato = `chiuso` `` (template), `d["stato"] = "chiuso"`, costante intermedia. Provato con file veri: la stessa porta in pannello/src passa da EXIT=1 a EXIT=0 solo cambiando le virgolette.
② Il tetto si alza a mano: `tetto_porte` 1 → 5 nel registro trasforma un rosso PROVATO (2 porte scoperte) in EXIT=0, e il rapporto continua a stampare «un tetto dichiarato che scende e non risale». Nessun guardiano copre `atti-con-porte.json` (`tetto-guardiano.mjs` non lo nomina).
③ Manomettendo il registro (guardia.file inesistente · rilevatore che non trova niente · `dove` ridotto) un rosso provato diventa ⚪ EXIT=2, e il cancello alla riga 606 (`fallito: codice !== 0 && codice !== 2`) non blocca sul 2.
④ Il lettore `soloCodice` provato con 12 sonde avversariali (stringa, regex letterale, template su più righe, interpolazione vera, commento a blocco, apostrofo JSX, divisione, doppia divisione, proprietà omonima): tutte come dichiarate. L'unico verso in cui sbaglia in VERDE è la virgoletta lasciata aperta — ed è scritto in testa al file.

## dettaglio
## In parole semplici

Il freno regge. Ho rigiocato una per una tutte e sei le accuse che lo avevano bocciato, con comandi miei e non fidandomi di quelli del riparatore: sono chiuse davvero. Le quattro righe che prima bastavano a spegnere il rosso — una parola dentro una stringa, un messaggio d'errore, un import mai usato, un commento — adesso lo lasciano al suo posto tutte e quattro. E la cosa che conta di più: una porta nuova, cioè un programma nuovo che chiude una scheda senza passare dalla guardia, lo fa diventare rosso col nome del file e il numero della riga. L'ho provato due volte, una in `cervello` e una nel Pannello.

## Cosa cambia per te

Se lo monti, questo freno fa il suo mestiere: il giorno in cui qualcuno scrive un secondo programma che chiude i difetti scavalcando il controllo, la consegna si ferma e ti dice dove. Oggi esce verde, ma un verde che stampa il debito: quattro porte guardate, una ancora scoperta (`auto-fix.mjs`, riga 402), e quella riga te la ripete a ogni corsa. Non è «tutto a posto»: è «il debito è uno e lo vedi».

Due cose però le devi sapere, perché il freno non le dice.

La prima. Il freno riconosce una porta nuova solo in quattro modi di scriverla su otto. La forma giusta di questa casa — il timbro unico `timbraChiusura`, quello che AR-575 ha reso obbligatorio — la vede sempre. Ma se qualcuno scrive la chiusura a mano con gli apici singoli invece che doppi, la porta diventa invisibile e il freno resta verde. Ho fatto la prova con lo stesso file: con le virgolette doppie esce rosso, con gli apici singoli esce verde. In questa casa gli apici singoli sono rari — 7 righe su 798 nel Pannello, circa 2 su 100 in `cervello` — quindi è un buco stretto, ma è un buco, e non è scritto fra i limiti dichiarati.

La seconda. Il rapporto dice «un tetto che scende e non risale», ma niente lo fa rispettare: cambiando a mano il numero da 1 a 5 nel registro, un rosso che avevo appena provato torna verde, e la frase sul tetto che non risale continua a comparire. È come funzionano anche gli altri tetti della casa, quindi non è una malattia nuova — ma è una frase che il codice non mantiene.

## Cosa devi fare

Se lo monti, chiedi due aggiunte piccole, nessuna delle quali tocca il motore:

1. Nel registro, allargare il riconoscitore alle altre grafie della stessa riga (apici singoli, apici inversi, `d["stato"]`). È un carattere in più nell'espressione, non un lavoro.
2. Se non la vuoi fare adesso, va scritta fra i limiti in testa al file: oggi il limite ③ parla di porte «costruite a runtime», e una virgoletta diversa non è una porta costruita a runtime.

## Cosa non ho verificato

Non ho lanciato il cancello del lotto per intero: non è agganciato e non l'ho toccato, quindi ho misurato il passo, non la corsa completa. Non ho girato su un runner della fabbrica vera: ho provato l'ambiente spoglio, senza casa e senza percorsi, non il resto. Non ho giudicato se le tre esenzioni scritte nel registro siano giuste nel merito — ho verificato che ci siano, che abbiano il perché e la data, e che il freno le tolga quando muoiono. E non ho misurato la seconda lente: se questo freno, montato, fa partire rosso la macchina per tutti.

## Dettagli tecnici

- Motore: `/home/user/ad-mycity/cervello/porte-gemelle.mjs` — `soloCodice` (lettore carattere per carattere), `chiamaLaGuardia` (cerca `nome(`, ammette `nome?.(`, `oggetto.nome(` e gli alias di un import con rinomina), `porteDiUnAtto`, `verdettoAtto`, pavimento del verde sui `porte.length === 0`, rifiuto di `--aggiorna-tetti` su misura parziale, guardia dell'entrypoint all'ultima riga.
- Registro: `/home/user/ad-mycity/cervello/atti-con-porte.json` — 1 atto, `tetto_porte: 1`, 3 esenti `fino_al 2026-10-15`. Il rilevatore col buco: `"timbraChiusura\\s*\\(|\\bstato\\s*[:=]\\s*\"chiuso\""` — la seconda metà accetta solo le virgolette doppie.
- Prova: `/home/user/ad-mycity/cervello/test/altra-porta-lasciata-aperta.test.mjs` — 20 casi, EXIT=0 in `env -i`; scoperto dal runner (`test-cervello.mjs --solo altra-porta`).
- Mutazioni: `/home/user/ad-mycity/cervello/mutanti.json` — 7 voci AR-796, tutte lette e verificate come sostituzioni reali di codice; la n.2 rimette esattamente il difetto di questo giro (`\bnome\b` sul testo grezzo) e il banco diventa rosso.
- Alberi di prova: `/tmp/claude-0/-home-user/08541dc6-c549-54e8-a220-706eff039da9/scratchpad/verif3/` (`copia/`, `reg-senza-tetto.json`, `reg-copia.json`, `reg-x.json`, `reg-y.json`, `reg-z.json`, `reg-alzato.json`).
- Repo vero intatto: `git status --porcelain` identico a inizio giro (5 M + 8 ??), HEAD `f05b658`, nessun commit, nessun push, `cervello/cancello-lotto.mjs` con 0 occorrenze di `porte-gemelle`.