# Base di misura del lotto 44

## In parole semplici

Prima di riparare qualunque cosa ho fotografato lo stato di partenza. Serve a una cosa sola: se
domani qualcosa è rosso, si deve poter dire se l'ho rotto io o se era già rotto prima.

La fotografia è del commit `4a4c6ff`, cioè il ramo principale al momento in cui il lotto è partito.
L'ho scattata in una copia separata del progetto. Così le nove corsie potevano lavorare senza
sporcare la misura.

## Cosa cambia per te

C'è una scoperta dentro questa fotografia, ed è quella che ha cambiato il conto finale.

Nel cantiere risultavano 184 difetti aperti. Di questi, 60 avevano già una prova automatica. Ho
lanciato quelle prove sul codice di partenza: **35 su 36 erano verdi**.

Vuol dire che una fetta del cantiere era **già riparata** e nessuno l'aveva timbrata. Il timbro si
mette solo dopo che tu unisci una richiesta, e l'ultima volta quel passaggio non è avvenuto. Quindi
il numero che vedevi era più brutto della realtà.

Esempio concreto: AR-666 diceva «l'ora scritta a mano vive ancora in diciassette punti del cervello».
Il codice era già a posto in tutti e dieci i file curati. La scheda diceva ancora «aperto».

## Cosa devi fare

Niente su questo documento. È materiale di lavoro, non una decisione da firmare.

Serve a chi apre il prossimo lotto: qui trova da dove si partiva, e non deve rimisurarlo.

## Cosa non ho verificato

Una prova verde non basta per chiudere un difetto. Tre motivi, tutti già pagati in passato.

**Uno.** Una prova può essere condivisa fra più difetti. `prova-che-non-puo-fallire.test.mjs` è la
prova di otto difetti insieme. Se non li nomina tutti, chiuderne uno ne timbra sette mai toccati.

**Due.** Una prova può essere verde perché guarda dalla parte sbagliata. È successo con AR-698.

**Tre.** Il fix può essersi disfatto mentre la prova resta verde.

Per questo non ho chiuso niente in blocco. Ogni difetto l'ha verificato la sua corsia, uno per uno,
sul codice vero.

---

## Dettagli tecnici

Fotografia scattata in un worktree fermo su `4a4c6ff` (= `origin/main`), prima che le corsie
toccassero l'albero.

**Le prove dei difetti aperti, sul commit di partenza.** 60 difetti aperti su 184 avevano già una
prova a comando, per un totale di 36 comandi distinti. Lanciati tutti: 35 verdi, 1 rosso.

- 🔴 `node cervello/test/c4-schermo-coda.test.mjs` → exit 1. È la prova di AR-613, l'area della firma
  invisibile ai lettori di schermo. Era rosso **prima** di questo lotto.
- 🟢 gli altri 35.

**Altre misure di partenza.**

- `cervello/tetti-lotto.json`: `prova_con_or 9` · `mutazione_mancante 0` · `prova_debole 39` ·
  `prove_oneste 0` · `test_cervello 2` · `prove_bash_senza_esecutore 29` ·
  `prove_runtime_senza_mutazione 0`.
- Spazzata dei fratelli: nessuna malattia allargata. Le vive con più istanze erano
  `programma-che-parte-importando` 64 · `data-senza-ora` 25 · `git-letto-senza-tetto` 18 ·
  `esito-di-un-guardiano-buttato` 9 · `una-parola-con-due-padroni` 5.
- Cantiere: 716 schede. 476 chiuse, 184 aperte, 56 da riverificare.
