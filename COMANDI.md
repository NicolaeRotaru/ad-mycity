# 🎛️ COMANDI — cosa puoi dirmi (e cosa faccio)

> Scrivimi uno di questi e parte il lavoro. Non devi ricordarli a memoria: **torna qui** quando vuoi.
> Non sono rigidi: scrivimi come ti viene, ti capisco lo stesso. Per rivedere la lista: **"che comandi ho?"**
> Legenda: 🟢 = ti do il risultato subito · 🟡/🔴 = preparo tutto e aspetto il tuo ok · ▶️ = eseguo un'azione approvata.

## 📅 Ogni giorno (ritmo)
- **"fai un giro"** → guardo i dati reali, controllo le sentinelle, ti do un briefing. 🟢
- **"piano del mattino"** → priorità del giorno + una mossa per reparto. 🟢
- **"report della sera"** → cosa è stato fatto + numeri + cosa c'è da firmare. 🟢
- **"review della settimana"** → pagella della squadra + cosa migliorare. 🟢
- **"guarda i piani"** (anche: *"i piani sono aggiornati?"*, *"da quanto sono fermi i piani"*) → ti dico, piano
  per piano, quando è stato aggiornato l'ultima volta e da quanti giorni è fermo. Motore:
  `node cervello/piani-data.mjs` (con `--scrivi` riscrive la data in cima a ogni piano). 🟢
- **"cosa dicono di sbagliato i piani?"** (anche: *"i piani dicono ancora cose vecchie?"*, *"controlla se i
  piani mentono"*) → ti dico quali frasi dei piani il registro dei fatti smentisce — un bando chiuso dato
  per aperto, la commissione vecchia, il negozio-faro sbagliato — con la riga esatta e cosa dice invece il
  registro. Motore: `node cervello/piani-verita.mjs` (con `--scrivi` mette l'avviso in cima ai piani
  smentiti; `--controlla` esce 1 se ne resta uno). Non riscrive il testo dei piani: quella è una revisione
  tua. 🟢

## 📊 Numeri & soldi
- **"come stiamo?"** → cruscotto: i numeri reali adesso. 🟢
- **"report KPI"** → l'analista ti fa il quadro della settimana. 🟢
- **"controlla i pagamenti"** → la finanza cerca anomalie e payout. 🟢
- **"proiezione"** → quanto costa e quanto rende. 🟢

## 🏪 Negozi
- **"porta [nome] LIVE"** → la squadra prepara tutto per metterlo online. 🟡
- **"trovami negozi"** → lista di botteghe da contattare + pitch pronto. 🟢
- **"negozio in calo"** → piano per recuperare un negozio che vende meno. 🟡
- **"supervisiona i negozi"** (alias: *"controlla i dati mancanti"*, *"cosa manca ai negozi/prodotti"*) → la macchina veglia OGNI negozio e OGNI prodotto, trova i dati mancanti e prepara il **riempimento automatico** come proposte da firmare (`node cervello/supervisione-negozi.mjs --accoda`): i campi deducibili (unità, condizione, categoria) diventano azioni 🟡 in [[AZIONI-IN-ATTESA]] col comando pronto; ciò che serve materia prima reale (foto, prezzi, orari, descrizioni) finisce in "serve da te". Report in `consegne/supervisione/`. 🟢 (la scrittura sul sito parte solo col tuo ok)
- **"ok riempi [unità/condizione/…]"** (alias: *"ok a tutte le proposte di supervisione"*) → esegui il riempimento approvato: gira il comando pronto del report (`AZIONI_LIVE=1 node cervello/marketplace.mjs aggiorna …`), che fa backup di ogni riga (reversibile) e lascia traccia in [[DECISIONI]]. 🟡

## 🚀 Crescita & contenuti
- **"contenuti pro: [quali]"** (alias: *"modalità mondiale"*, *"fammi i contenuti pro"*) → creo i contenuti che mi dici a **livello agenzia internazionale**, passando dalla pipeline **Modalità Mondiale**: ① **Brief** (`BRIEF-CREATIVO.md`) → ② aggancio alla **Piattaforma "Il Turno"** (`consegne/marketing/PIATTAFORMA-CREATIVA.md`) → ③ genero **più varianti** → ④ il **@direttore-creativo** le critica spietato e tiene la migliore (vs `creativi/swipe/SWIPE-FILE.md` + rubrica per categoria) → ⑤ **produco** la grafica/reel veri → ⑥ **@qa-designer** controlla brand + onestà + safe-area → ⑦ accodo le pubblicazioni. Tu scrivi il comando + **quali contenuti**. 🟢 *(creo)* / 🔴 *(pubblicare)*
- **"lancia una campagna [tema]"** → piano completo (post, grafiche, budget) da approvare. 🟡
- **"contenuti della settimana"** → calendario + post + reel pronti. 🟢
- **"fammi [post / volantino / QR] per [X]"** → il designer/AI te lo crea. 🟢
- **"recupera i carrelli" / "riattiva i clienti"** → la CRM prepara i messaggi. 🟡

## 🛒 Il sito (modifica parlando)
- **"collega il marketplace"** (alias: *"collega il sito"*, *"aggiorna il codice del sito"*) → scarico/aggiorno la copia locale del repo del marketplace (`NicolaeRotaru/mycity`) così posso analizzarlo (radiografia, audit, fix). `node cervello/collega-marketplace.mjs`. 🟢
- **"cambia il sito: [cosa]"** → config subito, oppure codice con anteprima + tuo ok. ⚡/🛠️
- **"audit del marketplace"** → check tecnico **rapido**: bug/rischi/frizioni principali. 🟢
- **"pre-diagnosi del sito"** (alias: *"capisci prima come risolverli"*, *"scrivi le ricette dei difetti"*, *"come ripari i problemi del sito nel minor tempo"*) → **prima** di riparare, una squadra di senior scrive per ogni difetto aperto la **ricetta**: se è ancora vero, la causa comune, la modifica esatta, la prova che deve diventare rossa, cosa rischia di rompere, e la domanda per te già pronta; due revisori provano a smontarla. Poi le squadre del lotto ricevono la ricetta invece di scoprire tutto a lavoro iniziato. `node cervello/prediagnosi.mjs prepara --cartella <fuori dai repository>` → workflow `.claude/workflows/prediagnosi.js` → `raccogli` → `riservato` → workflow in modo «riservatezza» → `raccogli --scrivi --riservato <journal dei revisori>` (più gli elenchi delle riletture di prima) → `ondate` · metodo in `cervello/lotto-a-pacchetti.md`, passo ⓪. 🟢 *(sola lettura; le falle di sicurezza restano fuori dai depositi pubblici)*
- **"chiudi i gravi del sito"** (alias: *"riparazioni del sito a pacchetti"*, *"quanti pacchetti servono per il sito"*) → divido i difetti aperti del marketplace in **pacchetti** (la chiave è il file), li do a squadre che lavorano a ondate da cinque, ricucio e ti porto **una** richiesta di unione. `node cervello/pacchetti-lotto.mjs --sito --gravi` · metodo in `cervello/lotto-a-pacchetti.md`. 🟡 *(l'unione resta tua, le migrazioni sono 🔴 a parte)*
- **"lancia l'ondata N del sito"** (alias: *"ripara la prossima ondata del sito"*, *"fai girare un'ondata"*) → riparo **un'ondata** col **metodo snello** (`CLAUDE.md`, paragrafo 🪙): una squadra per pacchetto nel suo worktree, la prova della macchina prima dell'agente, **un** collaudo per tutta l'ondata (due lenti solo se tocca soldi, dati o permessi), **un** giro di correzione, tetto 12 subagenti; poi mi fermo e ti chiedo. Quattro passi: ① `node cervello/schede-pacchetto.mjs --piano <piano dei pacchetti> --ondata N --json` prepara le schede a zero agenti · ② il workflow `.claude/workflows/ondata-snella.js` con args `{schede: <quell'uscita>, repo: <radice del sito>, radice_ad: <radice dell'AD>, base: <git -C <sito> rev-parse HEAD>}`; ogni squadra lancia `node cervello/prova-rimessa.mjs`, e la prova deve cadere senza la correzione. Chi scrive o muta è il senior `tech`, chi legge e basta è `qa` (`tipo_costruisce`, `tipo_controlla`). Se squadre e collaudi non stanno nel tetto il workflow non parte: si divide l'ondata · ③ ricucio i rami, lancio `npm run verify` **una volta** nel sito, registro la copertura che il collaudo restituisce (`node cervello/radiografia-in-corsa.mjs registra`) e scrivo nel registro del sito i difetti vecchi e i minori nati · ④ `node cervello/conto-token.mjs --workflow <runId>` e il conto vero va nel referto. Il vecchio `.claude/workflows/ondata-sito.js` (tetto 45, un collaudo per pacchetto) resta solo se lo chiedi per nome. 🟡 *(l'unione resta tua; le migrazioni sono 🔴 a parte)*
- **"radiografia"** (alias: *"analizza tutto il sito"*, *"trova tutti i bug"*) → analisi **profonda e millimetrica** di TUTTO il marketplace (13 dimensioni: sicurezza, RLS, pagamenti, privacy, performance, accessibilità, QA, AI, deploy…), **ogni problema verificato**, report per gravità in `consegne/audit/`. 🟢 *(lunga e approfondita)*
- **"radiografia di te stesso"** (alias: *"analizzati da cima a fondo"*, *"fatti la radiografia"*) → la macchina analizza **SÉ STESSA** (la propria architettura: tutti i senior in `.claude/agents/`, prompt, processi, sensori, memoria, capacità) su **12 dimensioni**, con causa-radice, pre-mortem e **confronto coi migliori** del mondo; ogni difetto verificato. Aggiorna il **cantiere dei difetti** (li porta a zero), lo storico-salute, e ti scrive una **lettera** su come sta andando. Workflow `.claude/workflows/auto-radiografia.js`. 🟢 *(lunga; le correzioni a sé stessa restano 🟡 da firmare)*
- **"radiografia totale"** (alias: *"analizza tutti gli organi"*, *"radiografia completa della macchina"*) → la radiografia **più profonda**: tutti gli organi insieme in **tre giri con angoli diversi**, dove ogni giro cerca ciò che il precedente non ha visto, più un **critico di completezza** alla fine che chiede «cosa manca ancora?». Workflow `.claude/workflows/radiografia-totale.js`. 🟢 *(lunghissima; le correzioni restano 🟡 da firmare)*
- **"provalo davvero"** (alias: *"guidalo tu"*, *"aprilo e verifica"*) → verifica end-to-end **guidando le superfici vere**: il Pannello con un browser senza finestra e gli script del worker su un banco di prova, senza VPS. Non i test, non il typecheck: l'app vera. Skill `verify`. 🟢
- **"radiografia del pannello"** (alias: *"controlla il pannello"*, *"analizza la cabina"*, *"trova i bug del pannello"*) → radiografia del **Pannello di Controllo** (l'app Next.js in `pannello/`, la tua faccia): 8 dimensioni in sola lettura (navigazione/tasto-indietro, stato perso cambiando chat, liste stale, stati async, doppio-invio, errori runtime, mobile/a11y, performance), **ogni bug verificato** avversarialmente e col **fix pronto da firmare**. Workflow `.claude/workflows/audit-pannello.js`. 🟢 *(lunga; i fix restano 🟡 da firmare)*
- **"design: [richiesta]"** (alias: *"lavora sul design"*, *"ci sono errori grafici"*, *"cambia il layout/i colori"*) → la squadra design **analizza** i problemi grafici/UX (audit design) **oppure modifica** ciò che chiedi: colori/home/testi = subito (config), layout/componenti = anteprima + tuo ok (codice). 🟢/⚡/🛠️

## 🎨 Design & grafica (tutto ciò che si vede)
- **"radiografia del design"** (alias: *"audit completo del design"*, *"analizza tutto il design"*, *"controlla tutta la grafica del sito"*, *"trova tutte le cose brutte del sito"*) → la squadra design fa l'**analisi più profonda e completa** di TUTTO ciò che si vede nel marketplace: la squadra design (ux-designer + designer + ai-designer + frontend-dev + cro) controlla **ogni** punto qui sotto in sola lettura, **verifica** ogni problema trovato (niente falsi allarmi) e ti consegna il report ordinato per gravità in `consegne/design/`, con in evidenza i bloccanti. 🟢 *(lunga e approfondita)*

  <br>**I 24 punti che controllo** (così sai esattamente cosa guardo):
  - **Aspetto visivo** — 1) Colori (palette, contrasto) · 2) Font/Testo (tipografia, leggibilità) · 3) Spazi (spaziatura, "respiro") · 4) Allineamento · 5) Immagini e foto (qualità, deformazioni) · 6) Icone · 7) Coerenza visiva (design system).
  - **Disposizione** — 8) Layout/Impaginazione · 9) Gerarchia visiva (cosa salta all'occhio) · 10) Responsive (come si vede su telefono).
  - **Esperienza d'uso** — 11) Navigazione/Menu · 12) Pulsanti e CTA · 13) Frizioni (cosa rende difficile/fastidioso) · 14) Microcopy (i testi piccoli, gli errori) · 15) Stati (caricamento/vuoto/errore) · 16) Feedback (risposte del sistema).
  - **Punti che fanno soldi** — 17) Home/Vetrina · 18) Scheda prodotto · 19) Ricerca e filtri · 20) Carrello · 21) Checkout (pagamento) · 22) Pagina negozio.
  - **Qualità invisibile** — 23) Accessibilità (a11y) · 24) Velocità percepita (performance).

  > Dopo la radiografia, per **sistemare** una cosa specifica basta dirmi *"sistema [il punto]"* (es. *"sistema i colori della home"*): colori/testi/home = subito (config 🟢/⚡), layout/CSS/componenti = anteprima + tuo ok (codice 🛠️). Mai deploy senza la tua firma 🔴.

## 🧠 Auto-potenziamento (la macchina che si migliora e impara dai risultati)
- **"collauda"** (alias: *"controlla bene quello che hai fatto"*, *"sei sicuro che funziona?"*, *"l'hai provato davvero?"*, *"non voglio che risolvendo ne crei altri"*) → il **collaudo a squadre separate**: chi ha costruito non collauda, e chi collauda ha il mandato di distruggere. Due collaudatori con lenti diverse — *sa diventare rosso davvero?* e *nasce rotto, cioè blocca la macchina per tutti?* — poi il montaggio vero e il cancello intero. Regola di arresto dichiarata prima, dosaggio in base a quanto costa sbagliare, e il **catalogo delle scorciatoie** (`cervello/scorciatoie-note.md`) in mano al costruttore fin dal primo minuto. Nato il 23/8/2026: al primo giro vero ha fermato 13 difetti su 14 collaudi, e ogni costruttore aveva consegnato dicendo «fatto, tutto verde». Mansionario: skill `collaudo`. 🟢 *(la consegna resta 🟡🔴 da firmare)*
- **"controlla se funziona tutto"** (alias: *"è tutto a posto?"*, *"la macchina sta bene?"*, *"checkup"*, *"il worker gira?"*) → la **visita** dei cinque organi vivi — worker, cervello, Cabina, i 120 senior, sensori — con tre risposte per ognuno: ✅ provato · ❌ rotto · ⚪ **non l'ho potuto vedere da qui** (mai un verde per una cosa non guardata), più la **copertura** («8 controlli su 14») e cosa è **peggiorato da ieri**. Se trova un rosso non si ferma: apre la radiografia dell'organo (`worker`, `senior`, `auto-radiografia`, `audit-pannello`), passa il difetto a **cantiere** perché lo ripari, e **ricontrolla finché torna verde**. `node cervello/salute.mjs` (rapida, 2 secondi) · `--completo` (test e rete) · `--vps` (servizi e timer). Gira da sola sul VPS mattina e sera. 🟢 *(i fix restano 🟡🔴 da firmare)*
- **"perché si è fermata?"** (alias: *"cos'è andato storto sul server?"*, *"che errore ha dato?"*) → ti dico **l'ultimo guasto del motore AI in parole semplici**: quando è successo, se riparte da sola e quando, più le righe vere (ripulite dalle password). Prima questa risposta esisteva solo dentro il server e da fuori non si poteva leggere. `node cervello/errore-motore.mjs`. 🟢
- **"le analisi sono aggiornate?"** (alias: *"quanto è vecchia l'Intelligence?"*, *"da quando non si aggiorna?"*) → l'**età di ogni scheda** della card Intelligence & opportunità, con la sua scadenza: ✅ fresca · ❌ scaduta · ⚪ senza data (non misurabile). La scadenza non è scritta a mano: si ricava dalle cadenze delle fonti in `radar-fonti.json`. `node cervello/freschezza-intelligence.mjs` (`--check` per il sì/no secco). 🟢
- **"giro operativo"** (alias: *"gira il business"*, *"mosse di oggi"*) → lancio una **flotta di senior in parallelo** (workflow `.claude/workflows/giro-operativo.js`): ogni motore di soldi propone le mosse a più alto ritorno **sui dati reali**, le verifico in modo avversariale, e ti do una **coda ordinata** (cosa parte da solo 🟢 / cosa firmi 🟡🔴). 🟢
- **"prevedi [mossa]" / "registra previsione"** → registro un **effetto previsto** misurabile (metrica, valore atteso, entro quando) in `calibrazione.json`. `node cervello/calibrazione.mjs prevedi …`. 🟢
- **"esito [id] = [numero]"** → chiudo la previsione col **reale**: chi azzecca guadagna autonomia (anello chiuso previsto-vs-reale). `node cervello/calibrazione.mjs esito …`. 🟢
- **"come sto calibrando?"** → tabella per-reparto: azzeccate/previsioni, punteggio, autonomia. `node cervello/calibrazione.mjs report`. 🟢
- **"chiudi i difetti" / "auto-fix"** → verifico nel codice quali difetti del **cantiere** sono risolti e li chiudo (il volano che si ripara, non solo si diagnostica). `node cervello/auto-fix.mjs verifica --applica`. 🟢 *(modificare il codice per risolverne uno resta 🟡 da firmare)*
- **"quale AI per [compito]?"** → il **banco AI** sceglie il modello più economico capace (Claude solo per il ragionamento). `node cervello/banco-ai.mjs "<compito>"`. 🟢
- **"quanto consumo?"** (alias: *"quanti token oggi"*, *"costo AI"*) → il log del consumo: token e durata per ogni run (giro/ritmo/monitora), quanti giri il **delta-gate** ha risparmiato, e se ho superato la soglia giornaliera. `node cervello/costo-ai.mjs --json` · nel Pannello via `/api/costo`. 🟢
- **auto-guarigione della coda** → la macchina si accorge da sola delle **azioni approvate non eseguite** (es. worker giù) e te le rimette davanti con scritto *perché* sono fallite. Nel Pannello, sulle card in "Errore", compare **🔄 Riprova** (un clic = riapprova e rimette in coda; nessuna riesecuzione automatica). Gira ogni 3 min: `cervello/sentinella-lavori.mjs` (timer `mycity-sentinella`). 🟢
- **"ronda live"** (alias: *"sorveglia il worker"*, *"guarda la chat in tempo reale"*) → da una **sessione Claude Code su questo repo** (claude.ai/code o app, coi connettori Supabase+GitHub): metto un giro di guardia ogni ~3 minuti che legge dal DB memoria OGNI turno della chat del Pannello (tabella `lavori`: domanda, risposta, perfino i parziali) più segnali e PR nuove, **verifica le affermazioni dell'AD contro la realtà** (GitHub, git, coda) e ti avvisa entro un paio di minuti se dice una cosa falsa, ripete un loop, dà un consiglio vietato o apre una PR dannosa — intervenendo dove può (annulla lavori, chiude PR, prepara fix). Nato il 10/7 sera, quando ha scovato refs congelati, PR-fantasma e l'auto-merger. Vive nella sessione che lo lancia (chiusa la sessione, si spegne; max 7 giorni); si ferma con **"ferma il loop"**. 🟢

## 🔎 Mercato
- **"cosa fanno i concorrenti?"** → intelligence. 🟢
- **"che opportunità ci sono?"** → intelligence + growth (eventi, meteo, bandi). 🟢

## 👥 La squadra
- **"[reparto], fai [X]"** (es. *"legale, scrivimi il contratto"*) → delego a quel senior. 🟢/🟡
- **"riunione su [obiettivo]"** → faccio collaborare più reparti a catena. 🟢/🟡
- **"crea un nuovo esperto di [X]"** → aggiungo un nuovo senior alla squadra. 🟢
- **"migliora [reparto]"** → il prompt-engineer lo affina. 🟢

## ⚡ Decisioni & azioni
- **"cosa resta da fare?"** → ti mostro tutto il lavoro aperto in una pagina ([[LAVORO-APERTO]]): tuo e mio, sito e macchina, con dove sta ogni dettaglio. 🟢
- **"cosa devo decidere?"** → ti mostro la coda delle cose da firmare ([[AZIONI-IN-ATTESA]]). 🟢
- **"ok [numero]" / "approva [azione]"** → eseguo l'azione approvata. ▶️
- **"collega [Telegram / Gemini / …]"** → ti guido a collegare una "mano". 🟢
- **"sblocca Garetti"** → la lista esatta dei passi per il primo negozio. 🟢
- **"cambia il fatto: [cosa] = [nuovo valore]"** (es. *"l'onboarding è il 9/7, non il 6/7"*) → aggiorno la
  **fonte unica della verità** (`registro-fatti.json`), riscrivo NELLO STESSO lavoro ogni file vivo che
  citava il valore vecchio (coda, STATO, piani, intenzioni, calendario) e verifico col guardiano
  `coerenza-fatti` che non resti NESSUNA copia vecchia. La storia (decisioni, briefing) resta intatta. 🟢
- **"i fatti sono allineati?" / "controlla la coerenza"** → eseguo `node cervello/coerenza-fatti.mjs` e ti
  mostro se qualche file vivo cita ancora un valore superato (gira comunque da solo a ogni giro). 🟢

---

## 🤖 Come agisco dalla chat (autonomia con firma alla fine)
Dalla chat non mi limito a proporre: le cose **reversibili** le faccio io e ti chiedo l'ok **solo alla fine**.
- **Modifica al codice** (sito, pannello, memoria, script) → faccio le modifiche e **apro una Pull Request**
  (`node cervello/git-pr.mjs`). La PR non tocca niente in produzione: **il merge è la tua firma**. Ti do il link. 🟡
- **Modifica al database del marketplace** → preparo la modifica esatta con `marketplace.mjs` e la **accodo come
  card da 1 clic** in [[AZIONI-IN-ATTESA]] col comando pronto. All'Approva parte con **backup e undo** automatici
  ("migrazione + 1 clic"). 🟡
- **Soldi veri, email a clienti reali, deploy, cancellazioni irreversibili** → questi restano **🔴**: te li
  propongo e basta, non li eseguo. 🔴

> ⚙️ Attivazione: sul VPS serve il motore `claude` con gli script sicuri sbloccati (già fatto in
> `cervello/motore-ai.sh`) e un `GIT_PUSH_TOKEN` con permesso **Pull requests: write** su `ad-mycity`.

---
💡 Puoi sempre inventarne di nuovi: se mi dici *"d'ora in poi quando scrivo X fai Y"*, lo aggiungo a questa lista.

---

<!-- Spostato da CLAUDE.md il 2026-10-30 21:00: ogni agente rilegge il manuale a ogni turno, e questo testo ne era 9.800 byte. Lì resta l elenco corto. -->

## ⌨️ I comandi rapidi per esteso (dal manuale)
Nicola lancia lavori con frasi brevi. Riconoscile anche se scritte in modo diverso ed esegui la capacità giusta:
- **"fai un giro"** → giro (`cervello/giro.md`): leggi i dati reali (Supabase MCP), controlla le sentinelle, scrivi briefing in `90-Memoria-AI/Briefing/`, aggiorna [[STATO]]. ⚠️ **RAMO UNICO (Fase 2): la memoria si pubblica su `main`** (il ramo che legge il Pannello): dal VPS commit+push diretto su `main` (rebase, non-force); da cloud agent apri/aggiorna la PR con **base `main`** e falla mergiare. Il vecchio ramo separato `memoria-ad` è in pensione (vedi "DOVE PUBBLICARE" in `cervello/giro.md`).
- **"piano del mattino" / "report della sera" / "review della settimana"** → cadenze di `cervello/ritmo.md`.
- **"come stiamo?" / "report KPI" / "controlla i pagamenti" / "proiezione"** → analista/finanza sui dati reali.
- **"porta [negozio] LIVE" / "trovami negozi" / "negozio in calo"** → catena vendite (+ team).
- **"supervisiona i negozi" / "controlla i dati mancanti" / "cosa manca ai negozi/prodotti"** → veglia OGNI negozio e OGNI prodotto e prepara il **riempimento automatico dei dati mancanti come proposte da firmare** (`node cervello/supervisione-negozi.mjs --accoda`, gira anche a ogni giro): sola lettura del marketplace, classifica ogni gap in **① autofill** (campo deducibile con precedente reale → proposta 🟡 col comando pronto in [[AZIONI-IN-ATTESA]]), **② procura** (serve materia prima reale: foto/prezzo/orari/descrizione → «serve da te», mai inventato) e **③ mai** (legale/fiscale/IBAN/KYC/Stripe/consensi/approvazione → non li tocca MAI). Report in `consegne/supervisione/`; l'esecuzione approvata gira via `marketplace.mjs aggiorna` (backup per riga, reversibile). **Niente si scrive sul sito senza il tuo ok.**
- **"lancia una campagna" / "contenuti della settimana" / "fammi [post/volantino/QR]" / "recupera i carrelli"** → marketing/content/designer/crm.
- **"contenuti pro: [quali]"** (alias: *"modalità mondiale"*, *"fammi i contenuti pro"*) → produci i contenuti a **livello agenzia internazionale** con la pipeline **MODALITÀ MONDIALE** (7 passi, non saltarli):
  ① **BRIEF** — compila le 7 domande di `BRIEF-CREATIVO.md` (obiettivo, persona, insight, proposizione single-minded, reason-to-believe, tono+mandatori, canale+CTA+KPI). Se manca un dato reale → fermati e procuratelo, non inventare.
  ② **PIATTAFORMA** — aggancia il contenuto alla grande idea **"Il Turno"** (`consegne/marketing/PIATTAFORMA-CREATIVA.md`): idea-madre Turno + motore Volti + punta "Piacenza non è in vendita".
  ③ **VARIANTI** — genera **almeno 3 angoli/varianti** diversi (non accontentarti del primo). Modella sui vincenti dei competitor (`consegne/intelligence/5-aziende-simili-social.md` + `creativi/swipe/SWIPE-FILE.md`).
  ④ **CRITICA (cancello @direttore-creativo)** — fai giudicare le varianti vs swipe file + `MyCity-Vault/07-Agenti/RUBRICA-QUALITA-PER-CATEGORIA.md`: uccide il debole, tiene/raffina la migliore in 2-3 round. Domanda-ghigliottina: *"poteva farlo Amazon?"* → se sì, rifai.
  ⑤ **PRODUZIONE** — renderizza la grafica/reel VERI con la Content Factory (`cervello/content-factory/`: `render.mjs` + template per categoria); con le chiavi attive usa i connettori AI (`ai/gemini-image`, `canva`, `ai-video`) per foto/video pro.
  ⑥ **QA (cancello @qa-designer)** — verifica `CHECKLIST-BRAND.md` (palette/font/safe-area/footer) + `ONESTA-RULES.md` (zero numeri/testimonianze finti, segnaposti evidenti, consensi). Una ❌ → rigenera.
  ⑦ **CONSEGNA** — salva in `consegne/content/` + `creativi/output/social/`, **accoda le pubblicazioni 🔴** in [[AZIONI-IN-ATTESA]], aggiorna memoria, committa; consegna grafiche + sintesi + "cosa serve da Nicola".
  Colore: 🟢 creare/renderizzare · 🔴 pubblicare. **Il tetto di qualità sale solo con materia prima reale (foto/interviste/dati) + chiavi AI: se mancano, dillo a Nicola come "carburante" che alza il livello.**
- **"cambia il sito: …" / "audit del marketplace"** → pipeline `MODIFICA-MARKETPLACE.md` (config/codice) · audit rapido qa+security+tech+cro.
- **"radiografia" / "analizza tutto il sito" / "trova tutti i bug"** → audit PROFONDO: esegui il workflow `radiografia` (`.claude/workflows/radiografia.js`, 13 dimensioni in sola lettura + verifica di ogni problema), poi scrivi il report per gravità in `consegne/audit/AAAA-MM-GG-radiografia.md` e mostra i bloccanti. Vedi `MyCity-Vault/07-Agenti/AUDIT-MARKETPLACE.md`.
- **"chiudi i gravi del sito" / "riparazioni del sito a pacchetti" / "quanti pacchetti servono per il sito"** → il lotto di riparazione del MARKETPLACE a pacchetti: `node cervello/pacchetti-lotto.mjs --sito --gravi` divide i difetti aperti in pacchetti (sul sito la chiave è il **file**, perché lì i difetti si ammucchiano nello stesso file; sulla macchina è la **dimensione**), li mette in **ondate da cinque** con territori disgiunti, e ogni pacchetto va a una squadra con la sua finestra. L'AD non apre il codice del sito: divide, distribuisce, ricuce, consegna **una** PR. ⚠️ Il cancello del sito NON è `cancello-lotto.mjs` (quello legge il cantiere della macchina): sono `npm run verify` nel repo del sito e `node cervello/radiografia-in-corsa.mjs --repo ../mycity`. Metodo, prove ammesse e trappole: `cervello/lotto-a-pacchetti.md`. 🟡 *(l'unione resta di Nicola; le migrazioni sono 🔴 a parte)*
- **"radiografia mentre riparo" / "controlla che non ne siano nati altri" / "cosa ho toccato e non ha guardato nessuno"** → la radiografia del **perimetro del lotto**, non di tutto: `node cervello/radiografia-in-corsa.mjs` dice quali file toccati nessuno ha riguardato e con quale lente; li riguardi (tu o il senior che possiede la dimensione), poi registri con `registra --dimensione <chiave> --toccati --trovati <n>`. Gira da solo dentro `cancello-lotto.mjs`: un lotto non si consegna se il suo perimetro è scoperto o stantio. Spec: ⑥bis della skill `cantiere`.
- **"radiografia di te stesso" / "analizzati da cima a fondo" / "fatti la radiografia"** → la macchina analizza SÉ STESSA (non il sito): esegui il workflow `auto-radiografia` (`.claude/workflows/auto-radiografia.js`, 12 dimensioni sull'architettura — agenti, prompt, processi, sensori, memoria — + pre-mortem + benchmark vs i migliori, ogni difetto verificato avversarialmente). Poi scrivi `auto-coscienza/auto-radiografia.json`, aggiorna il cantiere dei difetti e lo storico salute, scrivi `RADIOGRAFIA-MACCHINA.md` + la lettera a Nicola, e mostra i difetti per impatto sulla crescita. Spec: `cervello/auto-radiografia.md`.
- **"controlla se funziona tutto" / "è tutto a posto?" / "la macchina sta bene?" / "checkup" / "il worker gira?"** → la **visita** dei cinque organi vivi (worker, cervello, Cabina, i 120 senior, sensori): apri la skill `salute`. Tre risposte per ogni controllo — ✅ provato · ❌ rotto · ⚪ **non l'ho potuto vedere da qui** (⚪ non è mai un verde) — più la copertura dichiarata e cosa è peggiorato dall'ultima visita. Motore: `node cervello/salute.mjs` (`--completo` · `--vps`), che gira anche da solo sul VPS mattina e sera e pubblica il referto in `auto-coscienza/salute.json` — la sezione `vps` è il **ponte**: da una sessione cloud il VPS si vede solo di riflesso, e un referto vecchio è un rosso. Trovato un guasto NON ci si ferma: radiografia dell'organo (skill `worker` / `senior` / `auto-radiografia` / `audit-pannello`) → difetto registrato nel cantiere con causa radice e prova comportamentale → skill `cantiere` per la riparazione → **si ricontrolla lo stesso controllo finché torna verde**. I fix restano 🟡/🔴.
- **"design: …" / "lavora sul design" / "ci sono errori grafici" / "cambia layout/colori"** → squadra design (ux-designer + designer + ai-designer + frontend-dev + cro). Capisci l'intento: se ANALISI → esegui il workflow `audit-design` (`.claude/workflows/audit-design.js`) e scrivi il report in `consegne/design/`; se MODIFICA → instrada: colori/banner/home/testi pagine = corsia CONFIG (`cervello/marketplace.mjs`, subito), layout/componenti/CSS = corsia CODICE (frontend-dev: branch→anteprima→ok). Per bug visivi pixel-level puoi aprire il sito nel browser e fare screenshot (se c'è l'URL/è in locale). Rispetta la design system. Vedi `MyCity-Vault/07-Agenti/DESIGN.md`.
- **"radiografia del design" / "audit completo del design" / "analizza tutto il design" / "controlla tutta la grafica" / "trova tutte le cose brutte del sito"** → audit design PROFONDO e completo: esegui il workflow `audit-design` (`.claude/workflows/audit-design.js`, 11 dimensioni in sola lettura che coprono i 24 punti visivi/UX + verifica avversariale di ogni problema), poi scrivi il report per gravità in `consegne/design/AAAA-MM-GG-radiografia-design.md` e mostra i bloccanti. È il "design" in modalità ANALISI portato al massimo. Vedi `COMANDI.md` (sezione 🎨 Design & grafica) e `MyCity-Vault/07-Agenti/DESIGN.md`.
- **"cosa fanno i concorrenti?" / "che opportunità ci sono?"** → intelligence (+ growth).
- **"[reparto], fai X" / "riunione su X"** → delega / team-play · **"crea un esperto di X" / "migliora X"** → prompt-engineer + AD.
- **"cosa resta da fare?"** → leggi e mostra `LAVORO-APERTO.md`, senza ricerche nuove · **"cosa devo decidere?"** → mostra [[AZIONI-IN-ATTESA]] · **"ok [n]"** → esegui l'azione approvata · **"collega [mano]"** → builder · **"sblocca Garetti"** → i passi del primo negozio · **"che comandi ho?"** → mostra `COMANDI.md`.
Il comando avvia il lavoro; resta valido il cancello 🟢🟡🔴 (le azioni reali si accodano/firmano). Se Nicola dice "d'ora in poi quando scrivo X fai Y", aggiungi il comando a `COMANDI.md`.
