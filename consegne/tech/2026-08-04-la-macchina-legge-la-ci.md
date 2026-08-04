# La macchina adesso guarda com'è andata la prova, prima di dirti «fatto»

**In parole semplici.** Questo lavoro riguarda le richieste di unione: quelle che apro su GitHub ogni
volta che tocco il codice, e che tu poi approvi o no. Appena ne apro una, GitHub fa girare da solo
dei controlli. Se qualcosa non passa, la richiesta diventa rossa. Quel colore io non l'ho mai
guardato. Ti dicevo «fatto» e il rosso lo scoprivi tu. Stasera l'ho guardato per la prima volta:
delle sei richieste aperte, cinque erano rosse, e la sesta non aveva nemmeno un controllo partito.

**Cosa cambia per te.** Tre cose. Primo: quando ti consegno un lavoro ti dico anche se le prove sono
passate. Secondo: non unisco più niente che non abbia passato le prove. Vale anche se hai firmato:
tu firmi il lavoro, il colore dei controlli devo guardarlo io. Terzo: davanti a un rosso adesso so
dire se l'ho rotto io o se era già rotto prima. È la differenza che conta: i cinque rossi di stasera
erano un guasto solo, vecchio di quattro ore, non cinque guasti nuovi.

**Cosa devi fare.** Niente, se non vuoi. Per guardare da solo come stanno le richieste aperte il
comando è `node cervello/ci-stato.mjs`. Risponde in una schermata sola: una riga per richiesta, più
cosa farei io.

**Cosa non ho verificato.** La chiamata vera a GitHub da qui. Questa sessione gira sul cloud e il suo
token non vale per l'API di GitHub. Lo strumento allora si dichiara cieco ed esce con l'errore
giusto: è una delle prove. La lettura vera parte sul VPS, dove la chiave c'è. I dati su cui ho
costruito la lettura sono però quelli veri delle sei richieste di stasera.

---

## Il fatto che l'ha reso necessario

Stasera, 4 agosto, alle 19. Nessun segnale, nessuna traccia in memoria, nessuna riga in una
schermata: il colore delle richieste viveva solo nei tuoi occhi. E il guasto non l'aveva causato
nessuna di quelle cinque richieste — il ramo principale era rosso dalle 15:08, e ognuna aperta dopo
se lo portava dietro.

Questa è la ragione per cui la parte difficile non è leggere il rosso: è capire **di chi è**. Una
macchina che vede rosso e si mette a riparare avrebbe aperto cinque richieste di riparazione su un
guasto di qualcun altro. Cinque lavori sbagliati, e il guasto vero ancora lì.

## Il guasto vero, e perché era arrivato

Il rosso del ramo principale erano due cose, tutte e due partite da te, senza colpa tua:

1. Hai agganciato i freni nuovi modificando le impostazioni dalla pagina di GitHub. Un controllo
   teneva ancora scritto «questo freno non è agganciato»: la nota era diventata falsa nel momento in
   cui l'hai agganciato, e una nota falsa lì dentro vale rosso.
2. Quelle stesse cinque modifiche il contatore delle consegne le ha lette come cinque consegne mie
   senza risposta. Il debito è salito da 238 a 240, il tetto si è rotto, e da lì ogni richiesta
   aperta era rossa. Cioè: il tuo lavoro contato come debito mio.

Sono riparate entrambe qui dentro: la prima togliendo la nota diventata falsa, la seconda insegnando
al contatore che un file che io non posso scrivere non può contenere una mia consegna.

## Cosa NON fa

Non unisce, non chiude richieste, non ripara da sola, non rilancia i controlli. Legge e dice. La
riparazione resta un lavoro con la sua richiesta di unione, e la firma resta tua.

---

## 🔧 Dettagli tecnici

**Cosa ho aggiunto**

- `cervello/ci-lettura.mjs` — la parte che ragiona, senza rete: quattro stati (verde · rosso ·
  in-corso · ⚪ non misurato), l'estrazione delle righe di guasto da un log di GitHub Actions,
  l'impronta che appiattisce i numeri (`240 contro 238` e `241 contro 238` sono lo stesso guasto), e
  l'attribuzione della colpa: `mia` · `ereditata` · `mista` · `ignota`.
- `cervello/ci-stato.mjs` — il comando. Sola lettura sull'API di GitHub: PR aperte → check-run e
  status del commit in testa → per i rossi scarica i log dei job falliti e li confronta con gli
  stessi controlli sul ramo di partenza. Opzioni: `--pr N`, `--repo mycity`, `--attendi 300`,
  `--json`, `--sonda`, `--senza-log`. Uscita: `0` niente da riparare · `1` c'è una PR rossa per colpa
  sua (o mai provata) · `2` non ho potuto misurare.
- `cervello/test/ci-rossa-di-chi.test.mjs` — 13 prove, con dentro le righe vere dei log del run
  30929719614 (PR #680) e 30924098083 (main).

**Dove è agganciato** (uno strumento costruito e mai messo di guardia è un buco, AR-376/AR-393)

- `cervello/git-merge.mjs` — freno duro prima di unire: rosso, controlli ancora in corso o controlli
  mancanti mentre la base ce li ha → esce 1 e non unisce. Nessuna opzione per saltarlo, come non c'è
  più `--force` (AR-272). `mergeable` di GitHub non serviva: risponde a un'altra domanda (git sa
  fondere i rami?), ed è `true` anche con la suite rossa.
- `cervello/giro.sh` — sonda a ogni giro; il vincolo hard al motore scatta SOLO sul rosso di cui la
  PR è responsabile, perché un rosso ereditato è un guasto solo moltiplicato per il numero di PR.
- `cervello/worker.sh` — i due prompt (chat e lavori) ora dicono: aperta la PR, `ci-stato --attendi
  300`, poi `mia` → correggi qui · `ereditata` → non toccare · ⚪ → dillo.
- `cervello/motore-ai.sh` — `ci-stato.mjs` negli strumenti consentiti al worker (è in sola lettura).
- `cervello/censimento-guardiani.mjs` — la riga per la bacheca, famiglia `test`.
- `cervello/mutanti.json` — 4 mutazioni nuove, tutte verificate rosse con `node
  cervello/non-vacuita.mjs`: freno del merge disattivato, impronta che riconta i numeri, «zero
  controlli = verde», esclusione dei file non scrivibili tolta.

**Le due riparazioni del rosso ereditato**

- `cervello/guardiani-motivi.json` — tolta la voce `mano-fermata.mjs`, che dichiarava
  «in-attesa-di-aggancio». L'aggancio c'è: `cervello/mano-fermata.mjs` è nel blocco `hooks` di
  `.claude/settings.json` (l'hai messo tu oggi) e la sua prova lo esegue in
  `cervello/test/mano-fermata.test.mjs`. Il freno non si è mosso: è sparita la nota che diceva il
  contrario, e che il guardiano contava come scusa scaduta.
- `cervello/conta-verdetti-muti.mjs` — nuova `fileVietatiAllaMacchina()`, derivata dai divieti
  `Write(…)`/`Edit(…)` di `.claude/settings.json` (solo percorsi concreti, niente glob). I commit
  che toccano solo quei file escono dal conto e il taglio è dichiarato nel referto
  (`esclusi_non_scrivibili`) e a schermo. Effetto misurato: 15 commit esclusi in 30 giorni, mute da
  240 → 228, tetto 238 → verde. Il tetto NON l'ho abbassato: il calo viene da una misura corretta,
  non da debito ripagato, e ribassare un cricchetto su un metro appena cambiato è una decisione tua.

**Provato qui**

- `node cervello/test-cervello.mjs` → 149 file, 1561 asserzioni, tutte verdi.
- `node cervello/non-vacuita.mjs` → le 4 mutazioni nuove rendono rossa la loro prova.
- `bash -n` su `giro.sh`, `worker.sh`, `motore-ai.sh`.
- `node cervello/conta-verdetti-muti.mjs` → 228 contro un tetto di 238, exit 0.

**Non provato da qui, e va detto**: la chiamata vera all'API di GitHub. In una sessione cloud il
token di questo ambiente non vale per `api.github.com` (401) e `ci-stato.mjs` esce 2 dichiarandosi
cieco — che è il comportamento giusto, ed è una delle 13 prove. La lettura vera gira sul VPS, dove
`GIT_PUSH_TOKEN` esiste: la forma dei dati usata qui è quella misurata stasera sulle sei PR aperte.

**Trovato di lato, lasciato aperto**: `cervello/sorvegliante.mjs` ha una mutazione che non fa
diventare rossa la sua prova (`AR-495 — spostare un guardiano viene punito come toglierlo`). È
precedente a questo lavoro e non lo tocca.
