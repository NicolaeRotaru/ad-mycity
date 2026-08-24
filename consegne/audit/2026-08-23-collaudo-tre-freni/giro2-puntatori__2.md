# ROTTO

## prova
TUTTI ESEGUITI, output vero. Repo vero mai toccato (git status identico a inizio e fine).

① CLONE SUPERFICIALE (punto 1)
  git clone --depth 1 --no-local file:///home/user/ad-mycity <clone1>
    → shallow? true · commits: 1 · ls cervello/puntatori-scollegati.mjs → "No such file or directory"
      (il freno NON e in nessun commit: e untracked, e tetti-lotto.json e modificato ma non committato)
  <clone2> = stesso clone superficiale + i file del lotto copiati dentro (com'e in CI dopo il commit):
    node cervello/puntatori-scollegati.mjs --json → EXIT=0
    {"esito":"debito","quanti":52,"controllati":592,"su":787,"saltati":0,"tetto":53,"ciechi":0}
  <clone2> + cantiere MONTATO: node cervello/puntatori-scollegati.mjs → EXIT=0, 53 su 595 (tetto 53)
    node cervello/test/puntatori-scollegati.test.mjs → # tests 22 # pass 22 # fail 0, EXIT=0

② DIPENDENZE (punto 2)
  clone senza node_modules (verificato assente), senza cervello/vps/.env (in repo c'e solo .env.example)
  cartella con .git CANCELLATO + cd / + env -i PATH=... HOME=/nonesistente:
    node <abs>/puntatori-scollegati.mjs --json → EXIT=0, stderr vuoto
  grep writeFile|appendFile|mkdir|unlink|scriviJson su puntatori-scollegati.mjs → (nessuna scrittura)
  grep spawn|exec|child_process su puntatori-scollegati.mjs → (nessuno)
  stdout su pipe vs file: 10413 byte = 10413 byte (nessun troncamento da process.exit)

③ NASCE GIA ROSSO SUL TETTO? (punto 3) — montaggio fatto da me, non ripreso dal riparatore
  cantiere + AR-796 chiusa con comando + AR-797 + AR-798:
    CANTIERE_FILE=<montato> node cervello/puntatori-scollegati.mjs --json → EXIT=0
    {"esito":"ok","quanti":53,"controllati":595,"su":789,"saltati":0,"tetto":53}
    del lotto ancora scollegato: AR-797 → cervello/test/due-case.test.mjs
  grep: due-case.test.mjs non nomina AR-797 (0) · altra-porta-lasciata-aperta.test.mjs nomina AR-796 (2)
  → il tetto 53 REGGE il montaggio. Questa accusa della bocciatura e chiusa.

④ IL FRENO AGGANCIATO AL CANCELLO (punti 3 e 4) — LA PROVA CHE LO SPACCA
  <full> = repo con STORIA INTERA: commit "base" (magazzino senza lotto) = origin/main,
          poi commit "lotto" coi tre freni + la riga di aggancio della consegna dentro
          cervello/cancello-lotto.mjs (solo nella copia).
    node cervello/due-case.mjs → EXIT=1
      passi del cancello: 23 · confronto con: 595ef84 (antenato comune con origin/main)
      nati in questo lotto: 1 · rilanciati nella casa spoglia: 1
      ❌ puntatori di prova scollegati (tetto) — NASCE SENZA MORSO (cervello/puntatori-scollegati.mjs)
         nessuna mutazione in cervello/mutanti.json dichiara di far diventare rosso questo passo
      ⛔ una cosa da sistemare prima di consegnare.
    node cervello/test/due-case.test.mjs → EXIT=1 · # tests 24 # pass 23 # fail 1
      not ok 1 - VERDE sul repo vero: il freno non nasce rosso per chi lo aggancia
  Perche: mutazioniDelPasso(mutanti,"cervello/puntatori-scollegati.mjs") → 0
    (misurato importando la funzione vera: 0 anche per due-case.mjs e porte-gemelle.mjs)
  E la mutazione dichiarata non salva comunque:
    (ancorata → return true)  node cervello/puntatori-scollegati.mjs → EXIT=0  ← "non-morde"
    (ancorata → return false) node cervello/puntatori-scollegati.mjs → EXIT=1  ← questa morderebbe
  Controprova sul clone superficiale <wire> (stesso aggancio, storia troncata):
    node cervello/due-case.mjs → EXIT=0, "nati in questo lotto: 0" (li il confronto ripiega su HEAD)

⑤ RICORSIONE E DURATA (punti 4 e 5)
  import del modulo: 25 ms, stdout 0 byte, exit 0 (la guardia AR-680 regge)
  freno: real 0m0.133s · prova: real 0m1.945s (22/22) · due-case che lo rilancia: ~3,0 s

## dettaglio
VERDETTO: ROTTO. Non per il tetto — quello e stato riparato davvero — ma perche la riga di aggancio che la consegna consegna all'AD, eseguita alla lettera, fa diventare rosso il cancello per tutti.

IL DIFETTO, in una frase: appena `cervello/puntatori-scollegati.mjs` diventa un passo di `cancello-lotto.mjs`, il freno gemello dello stesso lotto — `cervello/due-case.mjs` (AR-797) — lo vede come passo NATO, cerca in `cervello/mutanti.json` una mutazione che dichiari di far diventare rosso QUEL passo, non ne trova nessuna, e lo bolla «NASCE SENZA MORSO». `senza-morso` finisce in `rossi` (due-case.mjs riga 622) e l'esito finale e 1. E `cervello/test/due-case.test.mjs` caso 1 lancia due-case sul repo vero e pretende uscita 0: quel caso diventa rosso, la suite di casa diventa rossa, e il tetto `test_cervello` in `cervello/tetti-lotto.json` e ZERO. Cancello rosso per tutti, e nessuno ha scritto una riga di codice sbagliata. E' esattamente la malattia AR-506/511/514/526/534, rifatta una terza volta.

NON E' UN RAGIONAMENTO: l'ho montato. Ho ricostruito in `/tmp/claude-0/-home-user/08541dc6-c549-54e8-a220-706eff039da9/scratchpad/full` un repo con la storia intera — commit «base» senza il lotto puntato da `origin/main`, poi commit col lotto e con la riga di aggancio dentro `cervello/cancello-lotto.mjs` (solo nella copia: il file vero non l'ho toccato). Li `node cervello/due-case.mjs` esce 1 e `node cervello/test/due-case.test.mjs` esce 1 con 1 caso su 24 fallito. Il testo del rosso e riportato per intero nella prova eseguita.

PERCHE' IL RIPARATORE NON L'HA VISTO: sul clone che ha sotto le dita — `/home/user/ad-mycity` e esso stesso un clone superficiale — due-case non riesce a risalire al ramo di base, ripiega sul confronto con HEAD, conta «nati in questo lotto: 0» e esce verde. L'ho misurato anch'io (copia `<wire>`, EXIT=0). Ma quello e il caso fortunato: su qualunque copia con la storia (il VPS, una macchina di sviluppo, il checkout della PR con la storia) il confronto e col ramo pubblicato, il passo risulta nato, e si accende il rosso. Un freno che passa solo dove la storia manca non e verde: e non guardato.

E NON SI RIPARA CAMBIANDO UN'ETICHETTA. La mutazione consegnata per AR-798 dichiara `test: "node cervello/test/puntatori-scollegati.test.mjs"` — cioe punta alla PROVA, non al PASSO. Anche riscrivendola come `test: "cervello/puntatori-scollegati.mjs"` non basterebbe, perche quella mutazione (`ancorata → return true`) manda il conto a zero e il passo esce 0: due-case direbbe «non-morde», che finisce nello stesso mucchio rosso. Misurato: con `return true` EXIT=0, con `return false` EXIT=1. Serve una mutazione NUOVA, nel verso opposto (`ancorata → return false`, che porta 592 scollegati sopra il tetto 53 e fa uscire 1), col campo `test` uguale al percorso dello script. Due-case stampa da solo il blocco da incollare. Sono cinque righe in `cervello/mutanti.json` — ma finche non ci sono, la consegna non e agganciabile.

COSA INVECE REGGE, e va detto perche e la parte riparata sul serio:
· Clone superficiale: il freno da gli stessi identici numeri di qui (52 su 592 senza il lotto, 53 su 595 col lotto montato), EXIT=0, e la sua prova passa 22/22 dentro il clone. Non legge git, non legge la storia, non ha nulla da perdere in un `--depth 1`.
· Dipendenze: nessuna. Niente rete, niente chiavi, niente `node_modules` (assente nel clone e gira lo stesso), niente `bats`, niente Pannello, HOME inesistente, cwd estranea, ambiente svuotato con `env -i`, `.git` cancellato → EXIT=0. Sola lettura verificata: zero chiamate di scrittura nel file. Non gli importa che l'indice di git sia sporco perche git non lo apre mai.
· Tetto: il montaggio l'ho fatto io, non l'ho preso dal riparatore. 53 contro un tetto di 53 → EXIT=0. L'accusa che aveva ucciso la prima versione e chiusa. Resta pero ZERO margine: e un pareggio esatto, e l'unico puntatore del lotto ancora scollegato (AR-797 → `cervello/test/due-case.test.mjs`) sta nel file di un'altra corsia.
· Ricorsione dal suo lato: il freno non lancia nessun processo (nessun `spawn`/`exec`), e importarlo non lo esegue (25 ms, zero byte di stampa). La ricorsione non parte da lui — arriva su di lui, ed e il gemello a rilanciarlo.
· Durata: 0,133 s il freno, 1,9 s la sua prova, ~3 s il rilancio di due-case. Non e un problema di tempo.

DUE COSE MINORI, dichiarate perche il referto le tocca:
① La corsa su clone superficiale che il riparatore riporta non e riproducibile come l'ha scritta. `git clone --depth 1 --no-local file:///home/user/ad-mycity` non porta dentro ne il freno (untracked) ne il tetto 53 (modifica non committata): il comando esce con «Cannot find module». Verificato anche col reflog: nessun commit di oggi contiene quei file. I numeri riportati tornano solo copiando a mano i file del lotto dentro il clone — cosa che io ho fatto e che nel referto non e scritta. La misura in se e giusta; il modo in cui e presentata fa credere a una prova che quel comando non puo dare.
② `cervello/guardiani-motivi.json` — file vivo, dentro il lotto — descrive ancora un caso che non esiste piu: «la CALIBRAZIONE, che pretende uscita 0 col tetto 52 e uscita 1 col tetto 51». Il tetto consegnato e 53 e la CALIBRAZIONE e stata riscritta sull'albero montato. Nessun guardiano legge quella prosa (`guardia-viva-check` esce 0), quindi non blocca niente: e una descrizione vecchia lasciata in un registro vivo.

FILE: /home/user/ad-mycity/cervello/puntatori-scollegati.mjs · /home/user/ad-mycity/cervello/due-case.mjs (righe 505-508 e 622) · /home/user/ad-mycity/cervello/test/due-case.test.mjs (riga 132) · /home/user/ad-mycity/cervello/mutanti.json · /home/user/ad-mycity/cervello/tetti-lotto.json · /home/user/ad-mycity/cervello/guardiani-motivi.json
BANCHI DI PROVA lasciati in piedi per chi ripara: /tmp/claude-0/-home-user/08541dc6-c549-54e8-a220-706eff039da9/scratchpad/full (storia intera, lotto montato, passo agganciato → il rosso) · .../scratchpad/wire (clone superficiale, stesso aggancio → il falso verde) · .../scratchpad/clone2 (clone --depth 1 + file del lotto) · .../scratchpad/cantiere-montato.json