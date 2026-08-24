# ROTTO

## prova
Banco: /tmp/.../scratchpad/L2v3 (src = copia col lotto committato · clone = `git clone --depth 1 file://src` · base/solo/onesto2/... = varianti). Repo vero mai toccato: `git status --porcelain` finale identico (5 M + 8 ??), HEAD f05b658, `grep -c porte-gemelle cervello/cancello-lotto.mjs` = 0.

① CLONE SUPERFICIALE FATTO BENE — REGGE.
 $ cp -a /home/user/ad-mycity $S/src && git -C $S/src add -A && git -C $S/src commit --no-verify -m 'lotto 51 in prova'   # 2768 file tracciati, atti-con-porte.json compreso
 $ git clone --depth 1 file://$S/src clone   → is-shallow: true · commits: 1
 $ cd clone && node cervello/porte-gemelle.mjs → EXIT=0
   «1 atto misurato su 4 porte esaminate, 0 ciechi · 0 chiamano la guardia · 3 dichiarate · 1 scoperta · tetto 1 · 🕳️ cervello/auto-fix.mjs:402»
 $ diff out-clone.txt out-vero.txt → VUOTO. Verde con una misura vera e la porta scoperta stampata: non è un verde muto.

② DIPENDENZE ASSENTI — REGGE.
 node sta in /opt/node22/bin, git in /usr/bin: con PATH=<solo node> git è davvero fuori.
 $ env -i PATH=$S/binsolo HOME=/nonexistent TMPDIR=/nonexistent node cervello/porte-gemelle.mjs → EXIT=0, diff col clone VUOTO (niente node_modules nel clone).
 $ rm -rf .git && (stesso env) → EXIT=0, diff VUOTO.
 $ PORTE_GEMELLE_REGISTRO=/nonexistent/atti.json → EXIT=2 · JSON rotto → EXIT=2 · registro con zero atti → EXIT=2 («le porte esaminate sono ZERO: un freno che non ha guardato niente non può dire tutto a posto»).
 $ rm -rf pannello → EXIT=2 ⚪; ma con una porta scoperta NUOVA nella stessa casa cieca → EXIT=1: il ⚪ non si mangia il rosso (controllo con pannello: EXIT=1 uguale).
 $ 3 corse di fila → md5 di atti-con-porte.json, tetti-lotto.json, cantiere-difetti.json invariati · 0 spawn/exec/fetch/writeFileSync · guardia entrypoint all'ultima riga, import silenzioso (15 export).

③ MONTATO SUL CANCELLO INSIEME AGLI ALTRI DUE — NON NASCE ROSSO.
 Tre corse del cancello INTERO (`node cervello/cancello-lotto.mjs --veloce`) in tre copie:
   base  (niente montato)            3m33s  EXIT=1
   solo  (+ porte-gemelle)           3m42s  EXIT=1
   tre   (+ due-case + puntatori)    4m01s  EXIT=1
 $ diff gate-base.txt gate-solo.txt → l'UNICA riga in più è «✅ le porte gemelle di ogni atto (exit 0)» (l'altra differenza è il sorvegliante del delta che passa da ⚪ a ✅ perché il cancello risulta toccato).
 I due rossi del base ci sono con e senza di lui: «verdetti senza lettore» e «AR-797/AR-798 citati e mai registrati» (AR-796, la sua, È registrata: aperto/grave).
 Col terzetto montato diventa rosso anche «test del cervello»: l'asserzione che fallisce nomina ['due-case.mjs','puntatori-scollegati.mjs'] — mai porte-gemelle.
 $ node cervello/due-case.mjs (col terzetto montato) → EXIT=0, «✅ le porte gemelle di ogni atto — verde anche nella casa spoglia».

④ DIPENDENZE INCROCIATE — PULITO.
 $ rm i due fratelli dall'albero → node cervello/porte-gemelle.mjs → EXIT=0, diff col clone VUOTO.
 $ le 7 mutazioni AR-796: «due-case» false, «puntatori» false. Unica occorrenza nei suoi file: il commento alle righe 118-119 in cui dichiara di non dipenderne.

⑤ COSTO — TRASCURABILE.
 5 corse: 194·194·194·199·193 ms. Legge 962 file .mjs/.ts/.tsx (9,3 MB). Symlink `cervello/ciclo -> ..` → non ci scende, EXIT=0 in <60 s, 4 porte come prima. Timeout del passo 300 s = 1500× il caso misurato.

⑥ QUELLO CHE ROMPE — IL CONTRATTO ALLA RIGA 135, FUORI DALLA FINESTRA DELLA GUARDIA.
 $ grep -n "Uscita (contratto guardiani" cervello/porte-gemelle.mjs → 135
 $ grep -n "RIGHE_INTESTAZIONE = " cervello/guardia-viva.mjs → 44: export const RIGHE_INTESTAZIONE = 80;
 $ eGuardiano(...) → porte-gemelle.mjs: FALSE · due-case.mjs: true · puntatori-scollegati.mjs: true · spazzata-fratelli.mjs: true
 Oggi, così com'è consegnato: node cervello/guardia-viva-check.mjs → EXIT=0, e porte-gemelle non compare né fra i guardiani né fra i buchi.
 Sposto SOLO il contratto sopra la riga 80 (una riga, nient'altro toccato):
   senza_guardia: [{"strumento":"porte-gemelle.mjs","motivo":"inerzia","perche":"costruito e mai messo di guardia: nessun processo lo esegue e nessuno ha dichiarato perché"}] → EXIT=1
   tetto_da_cablare: {"quanti":3,"tetto":3} → il parcheggio legale è già pieno.
 Lo dichiaro in guardiani-motivi.json come hanno fatto TUTTI E DUE i fratelli dello stesso lotto (motivo "cablato", dove = la sua prova, che lo lancia davvero con spawnSync):
   voci_fantasma: ["porte-gemelle.mjs"] → guardia-viva-check EXIT=1 → node cervello/test/guardiano-mai-messo-di-guardia.test.mjs EXIT=1 → il passo «test del cervello» rosso → CANCELLO ROSSO PER TUTTI.
 Stato corretto (contratto sopra la riga 80 + riga montata + nessuna voce nei motivi) → senza_guardia: [] · voci_fantasma: [] · EXIT=0. Cioè: una riga.

⑦ QUELLO CHE ROMPE, SECONDO — LE TRE ESENZIONI SCADONO TUTTE IL 2026-10-15.
 $ esenzioniMorte(atto, porte, new Date(g)) → 2026-08-23: 0 · 2026-10-15: 0 · 2026-10-16: 3 · 2026-11-01: 3
 $ registro con le stesse date spostate all'indietro → node cervello/porte-gemelle.mjs → tre «❌ [esenzione-morta] … o la rinnovi dicendo perché, o la porta va curata» → EXIT=1.

## dettaglio
In parole semplici: il freno gira bene ovunque l'ho messo — clone superficiale, macchina senza git, senza HOME, senza dipendenze — e montato sul cancello insieme agli altri due non fa diventare rosso niente. Ho verificato tutte e cinque le domande della lente e le passa. Ma due cose non tornano, e sono tutte e due misurate col codice d'uscita, non ragionate.

La prima è la più seria. Il file dichiara il proprio contratto d'uscita alla riga 135. Il censimento dei guardiani della macchina legge solo le prime 80 righe: oltre quelle, per lui è codice. Risultato: `guardia-viva.mjs` non lo riconosce come guardiano — misurato, restituisce falso, mentre sui due fratelli dello stesso lotto restituisce vero. Quindi oggi il controllo «uno strumento costruito e mai messo di guardia è un buco» esce verde su di lui non perché sia a posto, ma perché non lo vede. Se sposto quel blocco sopra la riga 80 senza toccare altro, la stessa macchina dice: «porte-gemelle.mjs — costruito e mai messo di guardia: nessun processo lo esegue e nessuno ha dichiarato perché», uscita 1. E il posto dove parcheggiare un freno non ancora collegato è pieno: il tetto è 3 e i buchi sono già 3.

Il seguito è peggio del difetto. La cosa naturale che farebbe chiunque — dichiararlo in `guardiani-motivi.json`, che è esattamente quello che hanno fatto tutti e due i fratelli nati con lui — lo trasforma in una «voce fantasma», perché quel registro rifiuta le voci di file che non risultano guardiani. Misurato: uscita 1 sul controllo, uscita 1 sulla prova che lo esegue, e quella prova sta dentro la suite del cervello, che è un passo del cancello. Cancello rosso per tutti. È alla lettera la malattia che `due-case.mjs` racconta in testa a se stesso di aver curato spostando il proprio contratto in alto: «con l'intestazione lunga finiva alla riga 105, questo file non risultava un guardiano, e la sua voce diventava una voce fantasma, e la suite nasceva rossa per tutti». La lezione era già scritta, nel suo stesso lotto, e non è stata applicata.

La seconda cosa: le tre esenzioni del registro scadono tutte lo stesso giorno, il 15 ottobre 2026. Il 16 ottobre il freno esce 1 — l'ho misurato sia chiamando la funzione con quella data, sia spostando le date all'indietro e lanciando il comando vero — senza che nessuno abbia toccato una riga di codice. E due di quelle tre esenzioni hanno una motivazione strutturale, non temporanea: una propaga un giudizio già dato, l'altra è una copia in sola lettura per la Cabina. Quel giorno non ci sarà niente da riparare: ci sarà solo una persona che deve riscrivere una data in un JSON, o il cancello resta rosso per tutti. È la stessa tassa che il riparatore dice di aver abolito togliendo il controllo sulle schede, rimessa con una miccia di cinquantaquattro giorni.

Cosa cambia per te: la riga si può montare — non fa rosso oggi, l'ho provata sul cancello intero tre volte. Ma il verde che il freno mostra sul controllo dei guardiani non è un verde guadagnato: è un verde comprato dall'essere illeggibile, e la strada onesta per sistemarlo è quella che fa diventare rosso il cancello di tutti. Finché resta così, se un giorno qualcuno toglie quella riga dal cancello, nessun guardiano se ne accorge: questo freno è l'unico dei tre che nessuno sorveglia.

Cosa devi fare: due cose piccole, e la prima è una riga. ① Sposta il blocco «Uscita (contratto guardiani…)» sopra la riga 80 e monta la riga nel cancello: in quella configurazione ho misurato verde pieno — nessun buco, nessuna voce fantasma, uscita 0. Non aggiungere una voce in `guardiani-motivi.json`: una volta montato, quella voce è proprio ciò che fa rosso. ② Dai alle tre esenzioni una scadenza che rifletta il loro motivo (due sono strutturali, non provvisorie) oppure scrivi nero su bianco che il 15 ottobre qualcuno le rinnova, perché quel giorno è già fissato.

Cosa non ho verificato: non ho girato su un runner GitHub vero, ho riprodotto la profondità del clone, l'assenza di git, di HOME, di TMPDIR e delle dipendenze. Il cancello l'ho lanciato con `--veloce`, quindi senza il typecheck del Pannello. Il 16 ottobre l'ho simulato in due modi (passando la data alla funzione e spostando le scadenze all'indietro), non spostando l'orologio della macchina. E lo spostamento del contratto l'ho misurato inserendo una copia della riga in testa, non riscrivendo l'intestazione: serviva a sapere cosa vede il censimento, non a proporre il testo finale.

Dettagli tecnici — file letti: /home/user/ad-mycity/cervello/porte-gemelle.mjs (contratto alla riga 135, SE_STESSO alla 165, fuoriGioco alla 456), /home/user/ad-mycity/cervello/atti-con-porte.json (tre `fino_al` = 2026-10-15), /home/user/ad-mycity/cervello/guardia-viva.mjs (RIGHE_INTESTAZIONE = 80, riga 44; `eGuardiano` riga 60; `fantasmi`), /home/user/ad-mycity/cervello/guardia-viva-check.mjs:187-208, /home/user/ad-mycity/cervello/test/guardiano-mai-messo-di-guardia.test.mjs:31-43, /home/user/ad-mycity/cervello/due-case.mjs:20-27 (il precedente), /home/user/ad-mycity/cervello/cancello-lotto.mjs:600 (`fallito: codice !== 0 && codice !== 2`) e :936 (punto di innesto), /home/user/ad-mycity/cervello/guardiani-motivi.json (`tetto_da_cablare` 3, `_motivi_ammessi`), /home/user/ad-mycity/.github/workflows/cancello-lotto.yml (fetch-depth 0). Banco: /tmp/claude-0/-home-user/08541dc6-c549-54e8-a220-706eff039da9/scratchpad/L2v3/ (src, clone, base, solo, spoglia, senza-fratelli, loop, motivi, fix80, onesto, onesto2). Repo vero: nessun commit, nessun push, `cancello-lotto.mjs` con 0 occorrenze di `porte-gemelle`.