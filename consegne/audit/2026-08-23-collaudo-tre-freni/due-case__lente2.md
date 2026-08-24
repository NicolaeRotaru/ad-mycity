# ROTTO

## prova eseguita
① CABLAGGIO — ho incollato in un albero di prova la riga esatta che il collega consegna all'AD:
  $ AD_REPO=<copia> node cervello/due-case.mjs
    passi del cancello: 23 · carte: 22
    ❌ ogni controllo del cancello gira in tutte e due le case — NESSUNA CARTA
    ⛔ una cosa da sistemare prima di consegnare.   rc=1

② IL PROCESSO CHE NON TORNA — cablato + carta 23 (quella che il freno stesso stampa) + impronta stantia:
  $ timeout 25 node cervello/due-case.mjs
    processi `node cervello/due-case.mjs` vivi dopo 20s: 204   (in una corsa lasciata piu a lungo: 992)
    rc=124 → non e' mai tornato
  $ timeout 20 node cervello/due-case.mjs --aggiorna   → rc=124  (anche la via d'uscita dichiarata non torna)

③ CLONE SUPERFICIALE (git clone --depth 1 + HOME vuota + CI=1):
  $ env -i HOME=<vuota> CI=1 GITHUB_ACTIONS=true node cervello/due-case.mjs
    ✅ tutti e 22 i passi… rc=0 in 66 ms    → su questo asse il freno REGGE

④ ROSSO D'AMBIENTE (stesso clone, impronta di prove-oneste.mjs falsata):
    ❌ «la casa spoglia non gli può fare da controfigura … È debito dichiarato, non una misura.»  rc=1
   stessa cosa falsando cervello/test-cervello.mjs → rc=1

⑤ CARTE CHE MENTONO (stesso clone, impronte falsate sui 14 rilanciabili, 2 secondi totali):
    forma-json.mjs → uscita 2 (cieco) · mutazioni-orfane.mjs → 2 · prossimo-ar.mjs → 2
    tutti e tre dichiarano git-storia in `legge_se_c_e`, cioe' «assenza gia' declassata a nota»

⑥ CHI LO LANCIA: grep in tutto il repo → nessun cancello, nessun giro, nessun workflow. Solo
   cervello/test/due-case.test.mjs riga 69, che pretende rc=0 sul repo VERO.
   node cervello/guardia-viva-check.mjs → rc=0 · node cervello/guardiani-check.mjs → rc=0
   Repo vero rimasto intatto: git status identico a prima, zero residui *.due-case-da-parte, zero processi appesi.

## dettaglio
In parole semplici: il freno regge sulla domanda per cui l'ho aperto (il clone superficiale) e crolla su tre cose che il collega non ha dichiarato. La piu' grave e' che, una volta attaccato al cancello come lui stesso chiede di attaccarlo, il freno si mette a rilanciare SE STESSO all'infinito e non torna piu' indietro.

COSA HO TROVATO, in ordine di gravita'.

1) IL FRENO SI MANGIA LA MACCHINA — bloccante, mai detto.
La regola ③ dice: se l'impronta di uno script non combacia, riesegui quello script nella casa spoglia. Il codice non fa nessuna eccezione per se stesso: `nellaCasaSpoglia(REPO, passo.script)` con `passo.script = "cervello/due-case.mjs"` lancia una copia del freno, che trova la stessa impronta fuori posto, e ne lancia un'altra. Ogni livello e' bloccato dentro `spawnSync`, che e' sincrono: il SIGTERM del timeout arriva ma nessuno lo puo' leggere finche' il figlio non torna, e il figlio non torna mai. Misurato: 204 processi annidati dopo 20 secondi, 992 in un paio di minuti, e il comando che non esce mai (rc=124 col cronometro esterno). Sul runner questo consuma i 30 minuti di `timeout-minutes` e il cancello diventa rosso per tutti, con dentro un albero di processi che cresce. Peggio: `--aggiorna`, cioe' la via d'uscita che il freno stampa da solo, esplode nello stesso modo — il ciclo delle impronte gira PRIMA del blocco `if (AGGIORNA)`. Non c'e' modo di ripararsi se non riscrivendo il JSON a mano. Serve una riga sola: se `passo.script` e' il file stesso, non rieseguirlo (o passare al figlio una variabile d'ambiente che gli dica di fermarsi).

2) NASCE ROSSO NEL MOMENTO IN CUI LO ATTACCHI — bloccante, dichiarato al contrario.
La `riga_per_il_cancello` consegnata all'AD, incollata cosi' com'e', porta i passi da 22 a 23 mentre le carte restano 22: `node cervello/due-case.mjs` esce 1. E non e' solo il passo nuovo a diventare rosso: `cervello/test/due-case.test.mjs` alla riga 69 pretende `status === 0` sul repo vero, quindi si spegne anche `test-cervello.mjs`, cioe' tutti e due i workflow (`cancello-lotto.yml` e `test-cervello.yml`). Il collega scrive «NASCE VERDE PER COSTRUZIONE sulle 22 voci di oggi»: e' vero solo finche' nessuno lo attacca, cioe' finche' non e' un freno. Il rimedio e' meccanico (una carta, che il freno stesso stampa gia' pronta), ma va consegnato INSIEME alla riga, non lasciato a chi la incolla.

3) UNA NON-MISURA CONTATA COME ROSSO, NON COME ⚪ — contratto della casa violato.
`rotto = senzaCarta || impossibili || daRiverificare || nonImitabili`. Ma `nonImitabili` e' proprio il caso in cui il freno dice, con parole sue, «e' debito dichiarato, non una misura»: il passo scrive, oppure questa macchina e' piu' povera del runner. Provato: nel clone superficiale, toccare `prove-oneste.mjs` da rc=1 con un messaggio che parla del clone; toccare `test-cervello.mjs` da rc=1 con «questo passo SCRIVE». In casa il contratto e' 0 verde / 1 rosso / 2 non misurato, e il commento in testa al file promette l'opposto di quello che fa: «li' il freno si tira indietro e lo DICE, invece di produrre un rosso che parla dell'ambiente e non del codice (e' AR-437)». Produce un rosso. Su questa macchina, che ha il clone superficiale, sono quattro dei ventidue passi a poter diventare rossi per l'ambiente appena qualcuno li tocca.

4) LA SCAPPATOIA `legge_se_c_e` NON E' VERIFICATA, E TRE CARTE SU VENTIDUE LA USANO A SPROPOSITO.
La correzione ② che il collega rivendica introduce `legge_se_c_e` per «le fonti lette di sfuggita, la cui assenza e' gia' declassata a nota dentro lo script». La regola ② non guarda dentro quel campo, e nemmeno il controllo di poverta' della casa spoglia. Misurato: `forma-json.mjs`, `mutazioni-orfane.mjs` e `prossimo-ar.mjs` dichiarano `git-storia` li' dentro, ma senza la storia escono 2 — non e' una nota, e' un cieco. Il freno li riesegue lo stesso e li accusa: «NON combacia: sul runner questo passo non fara' quello che la carta promette», che e' falso (sul runner c'e' `fetch-depth: 0`). Ed e' un buco che vale in avanti: una carta futura puo' nascondere `trascrizioni-chat` o `fuori-da-git` in `legge_se_c_e` e la regola ② — l'unica difesa vera contro il ritorno di AR-514 — non guarda.

COSA INVECE REGGE, e va detto.
· Clone superficiale: verde in 66 ms, non rosso e non muto. Il verdetto non passa da git: legge davvero i due file e confronta 22 carte contro 22 passi. Su questa domanda il collega ha ragione.
· Niente rete, niente chiavi, niente Pannello, niente browser. I quattro moduli importati (`scrivi-json`, `esito-guardiano`, `ambiente-prova`, `storia-git`) sono tutti tracciati in git; nessuno dei tre file nuovi e' escluso da `.gitignore`.
· Tempo: 66 ms sulla corsia normale; la corsia lenta peggiore realistica — 14 script rilanciati di fila — costa 2 secondi. Sul cancello non pesa. L'unico tempo fuori scala e' la ricorsione del punto 1, che non e' tempo: e' un processo che non torna.
· Il ripristino dei `cervello/_tmp_*` ha tenuto anche sotto l'albero di 992 processi ammazzato a freddo: repo vero identico a prima, zero residui `*.due-case-da-parte`.
· Guardiani: `guardia-viva-check` e `guardiani-check` escono tutti e due 0 con la dichiarazione messa in `guardiani-motivi.json`. Oggi pero' il freno lo lancia SOLO la sua prova (che pero' gira in CI dentro la suite): come rete e' agganciato di striscio, e la parola `cablato` in quel file racconta piu' di quello che c'e'.

Cosa non ho potuto vedere da qui: non ho fatto girare niente su GitHub Actions vero — i punti 1, 2 e 4 li ho misurati su cloni locali, e il punto 3 su un clone superficiale che imita la poverta' di questa macchina, non la ricchezza del runner.

Dettagli tecnici — file: /home/user/ad-mycity/cervello/due-case.mjs (righe ~596-604: il ciclo che riesegue, senza guardia sul file stesso; riga ~626: `if (AGGIORNA)` dopo il ciclo; riga ~641: `nonImitabili` dentro `rotto`), /home/user/ad-mycity/cervello/due-case.json (carte 3, 11, 12 con `git-storia` in `legge_se_c_e`), /home/user/ad-mycity/cervello/test/due-case.test.mjs riga 69. Alberi di prova in /tmp/claude-0/-home-user/08541dc6-c549-54e8-a220-706eff039da9/scratchpad/ (repo-cablato, clone-ci).