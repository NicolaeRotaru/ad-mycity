# ROTTO

## prova
Tutto eseguito, niente dedotto. Il repo vero non l'ho toccato: `git status --porcelain` a fine lavoro e identico a quello di partenza (5 modificati + 8 non tracciati, gli stessi).

CLONE SUPERFICIALE FATTO BENE (punto 1) — il lotto COMMITTATO in una copia, poi clonato a profondita 1:
  cp -a /home/user/ad-mycity -> $SC/runner ; rm -rf .git ; git init ; git add -A ; git commit  (2763 file, i 7 nuovi del lotto dentro)
  git clone --depth 1 --no-local file://$SC/runner $SC/clone -> is-shallow-repository=true, rev-list --count HEAD=1
  cd $SC/clone && node cervello/puntatori-scollegati.mjs -> EXIT=0, "46 su 592 controllati (tetto 46)", stderr 0 byte, 0.188s
  Non e un verde muto: stampa i 46 uno per uno, la riga copertura (319 codice + 6 comando + 221 solo-commento) e il buco del 40% dichiarato sotto il verdetto.

DIPENDENZE ASSENTI SUL RUNNER (punto 2) — node=/opt/node22/bin/node, ND=$(dirname):
  cd / && env -i PATH=$ND HOME=/non/esiste node <abs>/puntatori-scollegati.mjs --json -> EXIT=0, stderr 0 byte, quanti 46   (git NON raggiungibile)
  cd / && env -i HOME=/non/esiste node <abs>/... (nessun PATH)                          -> EXIT=0, stderr 0 byte
  env -i ... TMPDIR=/non/esiste                                                          -> EXIT=0
  copia senza .git                                                                       -> EXIT=0, quanti 46
  chmod -R a-w sull'albero (filesystem in sola lettura)                                  -> EXIT=0, stderr 0 byte
  cartella accentata ($SC/citta` con accento) -> EXIT=0, quanti 46 (la guardia pathToFileURL regge)
  import del modulo -> non esegue: scollegati/ancorata/ancoraSoloCommento = function
  node_modules NON ESISTE affatto in questo repo, quindi non ci puo dipendere.
  Tutti gli input sono TRACCIATI da git (cantiere-difetti.json, tetti-lotto.json, mutanti.json): su un checkout pulito ci sono.
  Porte ⚪ verificate una per una: cantiere assente -> EXIT=2 · cantiere illeggibile -> EXIT=2 · cantiere con 0 schede -> EXIT=2 · tetto illeggibile -> EXIT=2 · file di prova sparito -> EXIT=2. mutanti.json assente o corrotto -> EXIT=0 con mutanti_letto:false (degrado dichiarato, corretto).

NASCE GIA ROSSO? (punto 3) — montato ed eseguito, non ragionato:
  (a) LOTTO MONTATO nel clone superficiale = 3 file nuovi + 3 schede nel cantiere (AR-796 portata a verifica comando, AR-797 -> due-case.test.mjs, AR-798 -> puntatori-scollegati.test.mjs):
      -> esito ok, quanti 46, tetto 46, controllati 595, EXIT=0. Schede del lotto fra gli accusati: NESSUNA.
  (b) LA SUA PROVA sul clone superficiale intatto, ambiente spogliato (env -i, PATH col solo node, HOME inesistente): # tests 30 # pass 30 # fail 0, EXIT=0. Stessa cosa col cantiere gia contenente le 3 schede: 30/30.
  (c) CANCELLO INTERO con il passo agganciato (in una copia usa e getta, non sul repo vero): 15 minuti di corsa, e nella lista dei passi:
      "✅ puntatori di prova scollegati (tetto) (exit 0)"
      ma nello stesso referto: "❌ test del cervello (exit 1) — 2 rosso/i contro un tetto di 0", e uno dei due e
      "❌ cervello/test/guardiano-mai-messo-di-guardia.test.mjs".
  (d) ISOLATO IL COLPEVOLE su una copia del repo VERO (con .git, niente clone, niente artefatti), agganciando ESATTAMENTE la riga della sua consegna:
      STATO 1 come consegnato (voce nel registro, passo NON agganciato):  guardia-viva-check EXIT=0 · prova di casa 18/18 VERDE
      STATO 2 dopo l'aggancio prescritto (voce + passo):                  guardia-viva-check EXIT=1, voci_fantasma ["puntatori-scollegati.mjs"] · prova di casa 17/18 ROSSO
      STATO 3 aggancio + voce tolta da guardiani-motivi.json:             guardia-viva-check EXIT=0 · prova di casa 18/18 VERDE
      STATO 4 voce tolta, passo non agganciato:                           guardia-viva-check EXIT=1 (senza_guardia ["puntatori-scollegati.mjs"])
      Causa letta nel codice: cervello/guardia-viva.mjs, funzione `fantasmi()` -> una voce del registro diventa fantasma quando `invocati.has(k)`, cioe proprio quando lo strumento viene cablato davvero.

DIPENDENZE INCROCIATE (punto 4):
  grep eseguibile su due-case/porte-gemelle dentro i miei due file: 0 riferimenti di codice (solo 2 righe di prosa nei commenti).
  AMPUTAZIONE 1 (tolti i due gemelli MA lasciate le loro schede): EXIT=2 ⚪ "2 cose non le ho potute leggere" — onesto, non un verde.
  AMPUTAZIONE 2 (corsie respinte del tutto, schede comprese): quanti 46, tetto 46, EXIT=0.
  MA, misurato: rinumerando la scheda della corsia GEMELLA da AR-797 a AR-801 -> quanti 47 contro tetto 46, EXIT=1, e l'accusato e {"id":"AR-801","file":"cervello/test/due-case.test.mjs"}. Stessa cosa se la SUA scheda non prende esattamente AR-798 (AR-800 -> EXIT=1).

COSTO NEL CASO PEGGIORE (punto 5):
  oggi: freno 0,19s + la sua prova 3,5s. Il freno rispezza 8,7 MB di righe (il caso piu pesante di oggi: 23 schede x 76,6 KB su sorvegliante.test.mjs).
  peggiore sintetico costruito apposta (2000 schede su un file di 487 KB ancorato solo da commenti): 7,1s. La crescita e lineare nel prodotto schede x dimensione del file: non e un problema, ma non e costante.

CONTROPROVA DI ONESTA sui rossi del clone: `mutazioni-orfane` EXIT=1 e `forma-json` EXIT=2 nel clone sono artefatti del mio clone isolato (nessun origin/main) — sul repo vero escono entrambi EXIT=0. Non li imputo al freno. Idem `c5-canale-di-pubblicazione` (origin finto file://).

## dettaglio
IL FRENO IN SE REGGE. Le prime due domande della lente le passa senza una crepa: clone superficiale vero col lotto committato -> EXIT=0 e verde parlante; e senza git, senza PATH, senza HOME, senza TMPDIR, senza .git, su filesystem in sola lettura, da cwd estranea, sotto cartella accentata -> sempre EXIT=0 con stderr vuoto. Le cinque porte ⚪ escono 2 davvero. Montato il lotto intero (tre file piu tre schede) fa 46 su 595 ed EXIT=0, e non accusa nessuna delle tre schede del lotto. Amputati i due gemelli resta 46/46. Nel cancello intero, il suo passo e verde: "✅ puntatori di prova scollegati (tetto) (exit 0)".

QUELLO CHE ROMPE NON E IL FRENO: E LA CONSEGNA. Il riparatore ha scritto in `cervello/guardiani-motivi.json` una voce per `puntatori-scollegati.mjs`, e nella `riga_per_il_cancello` dice all'AD di aggiungere il passo in `cervello/cancello-lotto.mjs`. Le due cose insieme non possono stare. Misurato su una copia del repo VERO, con .git, agganciando esattamente la riga che lui consegna:

  - senza aggancio (come sta oggi):  guardia-viva-check EXIT=0, prova di casa 18/18
  - con l'aggancio prescritto:       guardia-viva-check EXIT=1, voci_fantasma ["puntatori-scollegati.mjs"], e `cervello/test/guardiano-mai-messo-di-guardia.test.mjs` passa a 17/18

Quella prova sta dentro `test-cervello.mjs`, che e il passo "test del cervello" del cancello con tetto ZERO rossi. Nel cancello intero che ho fatto girare col passo montato, infatti: "❌ test del cervello (exit 1) — 2 rosso/i contro un tetto di 0" e in fondo "⛔ NON SI CONSEGNA". Cioe: nel minuto esatto in cui qualcuno esegue l'istruzione di consegna, il cancello diventa rosso per tutti. E la malattia AR-506/511/514/526/534 nella sua forma piu insidiosa — non un rosso alla nascita, un rosso a scoppio ritardato innescato dalla riga di montaggio che il riparatore stesso ha scritto.

PERCHE NON SE N'E ACCORTO, ed e scritto nella sua stessa consegna. Ha misurato `node cervello/guardia-viva-check.mjs` -> EXIT=0 e `node cervello/test-cervello.mjs` -> EXIT=0 ZERO rossi: entrambi VERI, ed entrambi misurati nello STATO 1, l'unico stato in cui la sua consegna e verde e l'unico che la sua istruzione dice di abbandonare. Nei buchi dichiara "NON HO LANCIATO cervello/cancello-lotto.mjs intero: il mandato mi vieta di toccare quel file" — il divieto e reale, ma non impediva di provare l'aggancio in una copia usa e getta, che e esattamente quello che ho fatto io in quindici minuti. Il suo "DUE COSE DA SAPERE PRIMA DI AGGANCIARLO" elenca il tetto e non-vacuita, e non nomina il registro dei motivi.

LA RIPARAZIONE E DA UNA RIGA, ED E MISURATA. Nello stesso commit che aggiunge il passo a `cancello-lotto.mjs` va TOLTA la voce `"puntatori-scollegati.mjs"` da `cervello/guardiani-motivi.json`. Provato: STATO 3 (agganciato + voce tolta) -> guardia-viva-check EXIT=0, voci_fantasma [], senza_guardia [], prova di casa 18/18. La causa e in `cervello/guardia-viva.mjs`, funzione `fantasmi()`: una voce del registro diventa fantasma appena `invocati.has(nome)` — la voce serve finche il freno NON e cablato e diventa una bugia nel momento in cui lo e. Nota per l'AD, non e il mio verdetto: la stessa voce e lo stesso trabocchetto esistono per `due-case.mjs` (agganciando tutti e tre: voci_fantasma ["due-case.mjs","puntatori-scollegati.mjs"]).

DUE COSE PIU PICCOLE, misurate, che non cambiano il verdetto ma vanno sul tavolo.

1) MARGINE ZERO = IL LOTTO DIVENTA UNA CATENA. Il tetto e 46 e il conto e 46. Se la scheda della corsia gemella non prende esattamente AR-797, il freno sale a 47, esce 1, e l'accusato stampato e `cervello/test/due-case.test.mjs` — cioe il file di un altro freno nuovo dello stesso lotto, e il cancello si blocca per tutti. Stessa cosa se la sua scheda non prende esattamente AR-798. Non e una dipendenza incrociata scritta nel codice (quella non c'e, e l'amputazione lo prova), ma con margine zero il verde di questo freno resta appeso alla numerazione che riceveranno le altre corsie. Lui lo dichiara come voluto; e difendibile, ma va detto all'AD prima e non dopo, perche il prezzo lo paga il cancello di tutti.

2) LA PORTA DEL TETTO CANCELLATO. Con `tetti-lotto.json` privo della chiave `puntatori_scollegati` il freno esce 0 dicendo "nessun tetto ancora fissato": una riga di JSON tolta lo spegne restando verde. NON lo conto contro di lui: e convenzione di casa, verificata sul fratello `prove-runtime-senza-mutazione.mjs`, che nella stessa condizione esce 0 con la stessa frase. E ho verificato la sua affermazione su `--aggiorna-tetti`: `cancello-lotto.mjs` riga 730 scrive `{...vecchio, aggiornato, ...nuovo}`, quindi le sue due chiavi sopravvivono. Su questo aveva ragione.

IN UNA RIGA: il motore e solido e provato in ogni ambiente ostile che ho saputo costruire, ma il pacchetto consegnato e verde solo finche resta scollegato — e l'istruzione che lo accompagna, eseguita alla lettera, fa uscire rosso il cancello per tutti. Finche quella riga sul registro dei motivi non e nella consegna, il verdetto e ROTTO.