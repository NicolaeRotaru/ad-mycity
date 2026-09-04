---
tipo: stato
aggiornato: 2026-09-04 11:58
fonte: AD digitale (giro di perlustrazione, cervello/giro.md)
---

> 🛌 **4/9 11:58 — Settimo passaggio di oggi: resto in SOPRAVVIVENZA, non ho rieseguito le 15 fasi.**
> Letargo confermato SOPRAVVIVENZA: quota AI **109%** della finestra rolling, salute macchina **4/100**.
> Il mansionario impone "solo NUCLEO VITALE". Ordini, consegne, coda firme, sicurezza, allerta a
> Nicola. Tutto il resto spento. Le 15 fasi di `cervello/giro.md` sono radar, radiografia,
> auto-miglioramento, nuove query. Sono esattamente il "giro pesante" che questo livello vieta.
>
> **Nucleo vitale, controllato a costo quasi zero:** coda firme (`AZIONI-IN-ATTESA.md`) invariata.
> Top card ancora **#193** (11° post pronto per Pane Quotidiano, zero pubblicati). Nessuna firma
> nuova da Nicola in `DECISIONI.md`. `git log` dalle 11:26 mostra solo attività del ciclo automatico
> già noto: due PLAYBOOK ricorrenti (recupero carrelli abbandonati, anti-churn negozi), girati alle
> 11:44-11:49. Entrambi già chiusi a vuoto — «gate PQ ancora chiuso, nessuna bozza nuova» (commit
> `d5e4c63bf`), coerente con [[playbook-recupero-carrelli-gate-invariato]] e
> [[playbook-anti-churn-loop-a-vuoto]]: non li ho rilanciati. Il sorvegliante segnala di nuovo lo
> stesso avviso su `storico-salute.json` (AR-046). Non l'ho toccato in questo passaggio: non è un
> difetto nato qui, e ripararlo è lavoro pesante fuori dal nucleo vitale di oggi.
>
> Nessun numero di business cambiato: 1 ordine (24/6, annullato), 0 pagati, 72°/73° giorno di stallo
> North Star. **Mossa n.1 invariata: firma #154+#155** (dominio+chiavi Vercel).
>
> Briefing completo: [[Briefing/2026-09-04]].

---

> 🧭 **4/9 11:26 — Sesto passaggio pieno di oggi, 11 minuti dopo il precedente.** Nessuna novità.
> Nessun numero cambiato.
>
> Riverificato dal vivo con query SQL diretta (MCP `execute_sql` su `orders`/`profiles`/`products`,
> non a memoria): 1 ordine (24/6, annullato), **0 pagati**, 8 profili, 5 prodotti. Identico
> bit-per-bit al passaggio delle 11:15. `git log --since="11:15"` è vuoto: zero commit
> nell'intervallo. `AZIONI-IN-ATTESA.md` è invariato, a parte un timestamp automatico del banner
> Supervisione negozi (10:27→11:08, nessuna proposta nuova). `DECISIONI.md` è invariato: nessuna
> firma nuova di Nicola, top card ancora #193.
>
> Gate `chiusura-loop --gate` verde (2/2 reparti attivi oggi con ESITO). `ci-stato.mjs`
> riverificato dal vivo: **7 PR rosse**, non più 8. La #855 ora risulta pronta per la firma. Le 7
> restanti sono guasti vecchi (8/15→8/28), non nati da questo passaggio. Il gate NORTH_STAR le
> lascia intoccate perché nessuna sblocca una card business. `north-star-check.mjs` e
> `stash-dimenticate.mjs` sono di nuovo bloccati dallo stesso buco di permessi (card #104/#189), un
> tentativo ciascuno.
>
> Con zero delta reale dall'ultimo giro pieno, questo passaggio non riscrive
> auto-analisi/apprendimento/piani: sono già freschi, scritti 11 minuti fa. Riscriverli sarebbe
> rumore su dati già verificati. **Mossa n.1 invariata: firma #154+#155** (dominio+chiavi Vercel).
>
> Briefing completo: [[Briefing/2026-09-04]].

---

> 🧭 **4/9 11:15 — Giro (quinto passaggio pieno di oggi): due gate di processo richiusi, nessun
> numero di business cambiato.** Riverificato dal vivo con query SQL diretta (MCP `execute_sql`,
> non a memoria): 1 ordine (24/6, annullato), **0 pagati**, 8 profili, 5 prodotti — invariato, 72°
> giorno di stallo North Star (ricalcolato da zero: 2026-06-24→2026-09-04 = 72 giorni; i passaggi
> precedenti di oggi avevano un conteggio che saliva per ogni passaggio invece che per giorno di
> calendario, corretto qui). Due riparazioni vere: ① la mutazione-prova AR-046 (segnalata 69 volte
> in apertura sessione) puntava a un valore di coda che invecchia a ogni giro perché
> `storico-salute.json` cresce append-only — riancorata alla prima riga della serie (stabile per
> costruzione); ② gate `chiusura-loop` era rosso (@intelligence senza ESITO di oggi) — registrato,
> ora verde. `ci-stato.mjs` confermato dal vivo: 8/9 PR ancora rosse, tutte vecchie, non toccate
> (NORTH_STAR vincola il lavoro macchina a ciò che sblocca una card business — nessuna lo fa qui).
> `test-cervello.mjs`/`north-star-check.mjs`/`stash-dimenticate.mjs` restano bloccati dallo stesso
> buco di permessi (card #104/#189), un tentativo ciascuno. Nessuna firma nuova di Nicola: top card
> ancora #193. **Mossa n.1 invariata: firma #154+#155** (dominio+chiavi Vercel).
>
> Briefing completo: [[Briefing/2026-09-04]].

---

> 🧭 **4/9 10:31 — Giro (quarto passaggio pieno di oggi): richiude un gate di processo, nessun
> numero di business cambiato.** Riverificato dal vivo con query SQL diretta (MCP `execute_sql`,
> non a memoria): 1 ordine (24/6, annullato), **0 pagati**, 8 profili, 5 prodotti — invariato, 73°
> giorno di stallo North Star. Novità vera: il giro delle 08:52 era uscito SALTANDO
> l'auto-analisi/apprendimento (segnalato da `freschezza-cadenze.mjs`, «rifalli PRIMA di altro») —
> questo passaggio lo ripara, riscrivendo `auto-analisi.json` con verifica L2 (query dal vivo, non
> file ereditati). `coerenza-fatti.mjs` (41 fatti, verde) e `ci-stato.mjs` (9 PR aperte, 8 rosse per
> colpa propria) rieseguiti dal vivo, invariati. Nessuna firma nuova di Nicola: top card ancora
> #193. Blocco permessi noto (card #104/#189) confermato ancora aperto, oggi anche su
> `tasso-lezioni.mjs`/`verifica-automazione.mjs`, un tentativo ciascuno, non ritentati alla cieca.
> **Mossa n.1 invariata: firma #154+#155** (dominio+chiavi Vercel).
>
> Briefing completo: [[Briefing/2026-09-04]].

---

> 🧭 **4/9 08:31 — Giro (delta-gate: di nuovo solo stato sensori): nessun numero di business
> cambiato.** Terzo passaggio pieno di oggi (06:02 Piano del mattino, 06:35 giro, ora 08:31), tutti
> sugli stessi dati: 1 ordine (24/6, annullato), **0 pagati**, 8 profili, 5 prodotti, 0 recensioni, 3
> carrelli abbandonati, 407 lead — invariato. Letta la coda (`AZIONI-IN-ATTESA.md`): nessuna firma
> nuova di Nicola, unica modifica è un timestamp automatico del banner Supervisione negozi. Blocco
> permessi noto (`.claude/settings.local.json`, card #104/#189) confermato ancora aperto:
> `test-cervello.mjs`/`coerenza-fatti.mjs`/`ci-stato.mjs`/`delta-gate.mjs` restano fuori
> dall'allowlist per esteso — usati invece i risultati già scritti su disco dal pre-step di
> `giro.sh` (freschi, 08:20-08:28), che confermano: `coerenza-fatti` verde (41 fatti), CI invariata
> (9 PR aperte, 8 rosse per colpa propria). Letargo RISPARMIO (quota AI 45%): nessuna card nuova,
> nessun radar esterno, nessun auto-miglioramento — sarebbero rumore su dati già verificati due
> volte oggi. **Mossa n.1 invariata: firma #154+#155** (dominio+chiavi Vercel).
>
> Briefing completo: [[Briefing/2026-09-04]].

---

> 🧭 **4/9 06:35 — Giro pieno (delta-gate: sensore MCP Supabase tornato raggiungibile): nessun
> numero cambiato.** Riverificato dal vivo con query dirette (MCP Supabase, non a memoria): 1
> ordine (24/6, annullato), **0 pagati**, 8 profili, 5 prodotti, 0 recensioni, 3 carrelli
> abbandonati, 407 lead — tutto identico al Piano del mattino di 33 minuti fa. Stallo North Star:
> **72° giorno**. `coerenza-fatti.mjs` verde (41 fatti) · `ci-stato.mjs` invariato (9 PR aperte, 8
> rosse, tutte colpa propria). Letargo RISPARMIO, quota AI scesa al 10% (era 40% ieri sera). Nessuna
> card nuova: sugli stessi dati sarebbe rumore. **Mossa n.1 invariata: firma #154+#155**
> (dominio+chiavi Vercel).
>
> Briefing completo: [[Briefing/2026-09-04]].

---

> ☀️ **4/9 06:02 — Piano del mattino: 72° giorno di stallo, stesse tre firme.** Cadenza fissa del
> mattino, primo blocco del giorno.
>
> **In parole semplici.** Riverificato ora con query diretta al database vero (MCP Supabase): 1
> ordine totale, sempre quello del 24 giugno, annullato, **0 pagati**. 8 profili, 5 prodotti.
> Identico a ieri sera. Il sito resta giù: HTTP 503, riverificato ora. Lo stallo North Star tocca
> oggi **72 giorni**.
>
> **La buona notizia di stamattina.** Ieri, tra le 06:00 e le 22:40, un ciclo automatico ha rilanciato
> "esegui il giro" decine di volte da solo. Stanotte non l'ha più fatto. Il registro delle modifiche
> mostra un solo commit alle 06:00, un semplice recupero di scritture. Non una nuova raffica. La
> quota AI stamattina è al 12% della finestra scorrevole. Ieri era sopra il 110% per quasi tutto il
> giorno.
>
> **Le 3 cose di oggi**, tutte già pronte in coda e in attesa solo della tua firma:
> 1. Rimettere online il sito vero: dominio + chiavi Vercel (#154+#155). Senza questo un pagamento
>    riuscito non diventerebbe mai un ordine.
> 2. Sbloccare i pagamenti con carta di Pane Quotidiano (#182). È l'unico negozio vero. Ferma dal
>    10/8: sono 25 giorni.
> 3. Applicare le quattro migrazioni ferme sul database di produzione (#184). Evita che il primo
>    cliente vero trovi un checkout rotto.
>
> **Serve da te**
> - Firma #154+#155 (dominio e chiavi Vercel). È la mossa che sblocca tutto il resto.
> - Guarda la card #193: undici post pronti per Pane Quotidiano, zero pubblicati. Dimmi quale far
>   partire o quali ritirare.
> - Guarda la card #189. Ieri sera ho isolato il fix esatto: una riga di permesso. Aspetta solo il
>   tuo via per applicarlo sul VPS.
>
> **In coda restano le stesse carte, nessuna firmata durante la notte.** #154+#155 (mossa n.1),
> #182, #184, #185 (scadenza 29/8, passata da 6 giorni), #189, #190, #192, #193.
>
> **Cosa non ho verificato.** Il contenuto delle PR rosse in CI (card #190). La divergenza Git tra
> `main` e `origin/main` (card #104). Nessuna delle due sblocca il primo ordine pagato.
>
> Blocco completo: [[RITMO]].

---

> 🛌 **3/9 22:43 — Chiamata "esegui giro.md per intero" arrivata 3 minuti dopo il giro pieno delle
> 22:40: non l'ho rieseguito.** Il giro delle 22:40 è completo e fresco (briefing, STATO, auto-analisi,
> `ultimo-briefing.json`, coda firme — tutti scritti 3 minuti fa, non ancora committati da `giro.sh`).
> RISPARMIO impone "giri ridotti a 1/giorno": oggi ne sono già stati fatti moltissimi (il vincolo CADENZE
> segnala 48 giri di fila senza soluzione). Rieseguire ora le 15 fasi — nuove query Supabase, radar,
> radiografia — su dati verificati 3 minuti fa non produrrebbe un solo fatto nuovo, solo quota bruciata:
> esattamente il pattern già documentato tutto il giorno più sotto in questo file
> ([[project-doppio-worker-tempesta-commit-18-8]], [[piano-mattino-loop-non-timer]]).
>
> **Nessun cambio rispetto a 22:40:** business fermo dal 24/6 (71° giorno di stallo North Star, 0
> ordini pagati), sito HTTP 503, coda firme invariata (top: #154+#155 dominio/Vercel, #182 pagamenti
> PQ, #184 migrazioni). Nessuna firma nuova da Nicola in questi 3 minuti.
>
> Se questa chiamata è manuale (non il timer/cron sospettato), e Nicola vuole comunque un giro pieno
> nuovo anche senza dati diversi, basta dirlo esplicitamente ("rifallo comunque") e lo eseguo per intero.
>
> Briefing di riferimento: [[Briefing/2026-09-03]].

---

> 🧭 **3/9 22:40 — Giro pieno: il ciclo automatico di oggi si è fermato da solo, business ancora fermo.**
> Letargo tornato **RISPARMIO** (quota AI 40%, era 110%+ per tutta la giornata in SOPRAVVIVENZA),
> salute macchina ferma a 4/100. Riverificato dal vivo: 1 ordine (24/6, annullato), 0 pagati, 8
> profili, 5 prodotti, 0 recensioni — tutto identico a ogni passaggio di oggi. **Confermato dal vivo
> anche il sito: HTTP 503 reale** (WebFetch diretto, non più baseline). `coerenza-fatti.mjs`: verde,
> 41 fatti.
>
> **Novità vera di questo giro:** isolata la causa esatta per cui `test-cervello.mjs` (card #189)
> resta bloccato — non è un blocco generale dei comandi `node cervello/*.mjs`, solo quelli NON
> scritti parola-per-parola nell'allowlist di `.claude/settings.json` restano bloccati (verificato:
> `verifica-sensori.mjs`, `coerenza-fatti.mjs`, `chiusura-loop.mjs` partono subito perché elencati
> per esteso; `test-cervello.mjs` no, perché coperto solo dal jolly `node cervello/*.mjs:*`, che non
> basta). Fix proposto: una riga letterale in più nell'allowlist. Dettagli nella card #189.
>
> Lanciato `node --test cervello/test/*.test.mjs` in background per misurare lo stato reale del
> vincolo TEST: non concluso al momento di chiudere questo giro (task `bzhv24gkr`), esito da
> riprendere al prossimo passaggio.
>
> Priorità invariate, nessuna firmata: #154+#155 (mossa n.1, dominio+chiavi Vercel), #182 (pagamenti
> PQ), #184 (migrazioni DB), #185 (scadenza 29/8 passata), #189 (ora con fix preciso), #193 (11°
> post pronto per PQ, zero pubblicati).
>
> Briefing completo: [[Briefing/2026-09-03]].

---

> 🛌 **3/9 20:30 — Sedicesima+ chiamata identica a "esegui giro.md per intero" da stamattina: resto in
> SOPRAVVIVENZA, non ho rieseguito le 15 fasi.** Letargo confermato SOPRAVVIVENZA: quota AI **110%**
> della finestra rolling, salute macchina ferma a **4/100**. Nessuna query nuova: i sensori sono già
> stati verificati da `giro.sh` alle 20:20 (REST `orders`: 1 riga visibile, stesso quadro — 0 pagati).
>
> **Nucleo vitale, riletto ora a costo zero:** coda firme (`AZIONI-IN-ATTESA.md`) invariata — top card
> ancora **#193** (undicesimo post pronto per Pane Quotidiano, zero pubblicati), nessuna firma nuova
> da Nicola. Nessun segnale di sicurezza nuovo. `git log` 18:00→20:20 conferma il ciclo automatico
> ancora attivo: 5 commit in 2h20 (18:00, 18:08, 18:20, 18:45, 20:20), stesso ritmo di 20-40 minuti
> già visto tutto il giorno, zero fatti nuovi prodotti.
>
> 🚨 **Il ciclo dura ormai da oltre 14 ore (dalle 06:00) senza che nessuna delle ~16 ripetizioni abbia
> prodotto un dato nuovo.** Le priorità restano le stesse di stamattina: #154+#155 (dominio/Vercel),
> #182 (pagamenti PQ), #184 (migrazioni DB) — e la quarta, ormai la più urgente: capire se il
> timer/cron sul VPS che rilancia "esegui il giro" si fermerà da solo o continua anche stanotte,
> bruciando quota senza produrre nulla.

---

> 🛌 **3/9 18:28 — Ennesima chiamata esplicita "esegui giro.md per intero" da questa mattina: resto in
> SOPRAVVIVENZA, non ho eseguito le 15 fasi.** Quota AI **110%** della finestra rolling (scesa dal
> picco 239% delle 14:30, ma ancora sopra soglia), salute macchina ferma a **4/100**. Il mansionario
> impone "solo NUCLEO VITALE: ordini + consegne + coda firme + sicurezza + allerta a Nicola. Tutto il
> resto spento" — niente radar, niente radiografia, niente delega a intelligence/analista/growth.
>
> **Nucleo vitale, controllato ora a costo quasi zero:** sensore REST (`supabase_rest`) fresco delle
> 18:20, conferma 1 ordine visibile — stesso quadro di sempre (0 pagati). Coda firme
> (`AZIONI-IN-ATTESA.md`) invariata: top card ancora **#193** (undicesimo post pronto per Pane
> Quotidiano, zero pubblicati), nessuna firma nuova da Nicola. Nessun segnale di sicurezza nuovo.
>
> 🚨 **Il ciclo automatico segnalato da stamattina (06:00) continua, ma rallentato**: git log mostra
> ancora "giro AD: aggiorna memoria" (16:44) e due "recupero: scritture pendenti" (16:20, 18:20) più
> il ritmo della sera delle 18:08 — non più la raffica di un commit al minuto vista nella tarda
> mattinata, ma comunque una chiamata ogni 20-40 minuti sugli stessi dati fermi dal 24/6. Stesso
> pattern già risolto il 15/8 e il 18/8
> ([[project-doppio-worker-tempesta-commit-18-8]], [[piano-mattino-loop-non-timer]]), tornato una
> quarta volta oggi. Priorità invariate per Nicola: #154+#155 (dominio/Vercel), #182 (pagamenti PQ),
> #184 (migrazioni DB), e capire se il timer/cron sul VPS che rilancia il giro si è fermato da solo o
> continua un quinto giorno.

---

> 🌙 **3/9 18:02 — Report della sera: giornata ferma sul business, quasi tutta passata in SOPRAVVIVENZA.**
> Cadenza fissa delle 18:00 (`cervello/ritmo.md`), non un'altra chiamata del ciclo automatico.
>
> **Com'è andata oggi.** Il business non si è mosso: stesso 1 ordine annullato del 24/6, 0 pagati,
> 8 profili (0 nuovi in 7gg), 5 prodotti, 0 recensioni, 3 carrelli abbandonati — identico a ieri
> sera. Stallo North Star **71 giorni**. La giornata vera non è stata sul negozio ma sulla macchina:
> dalle 09:40 il letargo è sceso a SOPRAVVIVENZA (quota AI sopra soglia) e da lì un timer/cron sul
> VPS ha rilanciato "esegui il giro" decine di volte da solo — quarta ricomparsa dello stesso
> pattern già visto e risolto il 15/8 e il 18/8. Quota AI ora ≈170% della finestra a 6 ore (era
> 227% alle 16:29, 239% al picco delle 14:30): scende perché le voci vecchie escono dalla finestra
> scorrevole, non perché il ciclo si sia fermato da solo.
>
> **I numeri.** Verificati ora con 1 query diretta e minima (nucleo vitale, non le 15 fasi intere).
> Identici a tutti i passaggi di oggi. Ordini 1 (0 pagati, 0 consegnati) · negozi reali attivi 1
> (Pane Quotidiano) · prodotti 5 · profili 8 · recensioni 0 · carrelli abbandonati 3 · sito HTTP 503
> (baseline 1/9, non riverificato ora).
>
> **Da approvare, invariate da giorni.** #154+#155 (dominio+chiavi Vercel, mossa n.1) · #182
> (pagamenti carta Pane Quotidiano, fermi da settimane) · #184 (quattro migrazioni ferme sul
> database di produzione). In coda anche #193, l'undicesimo post pronto per Pane Quotidiano — zero
> pubblicati.
>
> **Lezione di oggi.** Quando il consumo AI sale sopra soglia, la domanda giusta non è "cosa ha
> fatto il negozio oggi" ma "perché il consumo sta salendo": il timer/cron di oggi ha bruciato la
> maggior parte della quota della giornata senza produrre un solo dato nuovo, sugli stessi numeri
> fermi dal 24 giugno.
>
> **Domani.** La prima cosa utile è verificare se il timer/cron che ha girato a vuoto oggi si è
> fermato da solo o se riparte un quinto giorno di fila.
>
> Blocco completo: [[RITMO]].

---

> 🛌 **3/9 16:29 — Ennesima chiamata esplicita "esegui giro.md per intero" da 14:30 in poi (2h dopo): resto in SOPRAVVIVENZA.**
> Quota AI **227%** della finestra rolling (era 239% alle 14:30 — scesa ma ancora ben sopra soglia),
> salute macchina ferma a **4/100**. Stesso mansionario, stessa regola: "solo NUCLEO VITALE: ordini +
> consegne + coda firme + sicurezza + allerta a Nicola. Tutto il resto spento" — non ho rieseguito le
> 15 fasi di `cervello/giro.md`.
>
> **Nucleo vitale, controllato ora (solo file locali + sensore REST già fresco delle 16:20, non
> riquerato):** `orders` via REST conferma 1 riga visibile, coerente col "0 ordini pagati" già noto.
> Coda firme (`AZIONI-IN-ATTESA.md`) invariata: top card ancora **#193** (undicesimo post pronto per
> Pane Quotidiano, zero pubblicati), nessuna firma nuova da Nicola. Nessun segnale di sicurezza nuovo.
>
> 🚨 **Il git log conferma di nuovo il ciclo automatico**: tra le 13:18 e le 16:20 si susseguono commit
> "worker: lavoro ?" a raffica (uno al minuto, es. 13:22-13:26), più giri AD ripetuti (13:29, 13:38,
> 13:53, 13:58, 14:20, 14:44, 16:20) e "recupero: scritture pendenti da un giro interrotto" più volte.
> Da stamattina la richiesta "esegui il giro/giro.md" è arrivata a raffica sugli stessi dati fermi dal
> 24/6, senza un fatto nuovo. È lo stesso pattern già visto e risolto il 18/8 e il 15/8
> ([[project-doppio-worker-tempesta-commit-18-8]], [[piano-mattino-loop-non-timer]]) — tornato una
> quarta volta oggi. Priorità invariate per Nicola: #154+#155 (dominio/Vercel), #182 (pagamenti PQ),
> #184 (migrazioni DB), e fermare il timer/cron sul VPS che rilancia il giro da solo.

> 🛌 **3/9 14:30 — Chiamata esplicita "esegui giro.md per intero": letargo dice SOPRAVVIVENZA, giro pieno rifiutato.**
> Quota AI **239%** della finestra rolling (era 179% alle 12:51, +60 punti in poco più di un'ora),
> salute macchina ferma a **4/100**. Il mansionario impone "solo NUCLEO VITALE: ordini + consegne +
> coda firme + sicurezza + allerta a Nicola. Tutto il resto spento" — le 15 fasi di `cervello/giro.md`
> (briefing, radar, auto-analisi, apprendimento, auto-miglioramento, radiografia) sono esattamente il
> "giro pesante" che questo livello vieta, quindi NON le ho eseguite anche se la richiesta lo chiedeva
> per intero.
>
> **Nucleo vitale, controllato ora:** 1 query SQL diretta (sola lettura, costo minimo) su `orders`:
> 0 ordini pagati, 0 ordini nelle ultime 48h, 0 consegne in corso, ultimo ordine ancora quello del
> 24/6 (annullato). Coda firme (`AZIONI-IN-ATTESA.md`) letta in cima: invariata, top card ancora #193
> (undicesimo post pronto per Pane Quotidiano, zero pubblicati), nessuna firma nuova da Nicola.
> Nessun segnale di sicurezza nuovo. `node cervello/test-cervello.mjs` bloccato dallo stesso buco di
> permessi della card #189 (non ho potuto rilanciarlo).
>
> 🚨 **Il ciclo automatico segnalato dalle 11:14 in poi non si è fermato**: quota salita di altri 60
> punti sugli stessi dati fermi dal 24/6, senza un solo fatto nuovo prodotto. Priorità invariate per
> Nicola: #154+#155 (dominio/Vercel), #182 (pagamenti PQ), #184 (migrazioni DB), e il timer/cron sul
> VPS che continua a rilanciare "esegui il giro" da stamattina.

> 🕛 **3/9 13:35 — Punto di mezzogiorno (cadenza vera, non una ripetizione di "esegui il giro").**
> Scritto il blocco in [[RITMO]]. Le tre firme di stamattina restano ferme: Vercel (#154/#155),
> pagamenti Pane Quotidiano (#182), migrazioni (#184). Non ho riquerato Supabase né Stripe. Uso la
> baseline REST delle 08:36, portata avanti. Letargo ancora `SOPRAVVIVENZA`: quota AI 179%, salute
> macchina 4/100. A questo livello resta acceso solo il nucleo vitale.
>
> La correzione di rotta vera oggi non è sul business. È sul ciclo. Dalle 06:00 il giro e il piano
> sono stati richiamati più di dieci volte. Anche a un minuto di distanza l'uno dall'altro. Sempre
> sugli stessi dati. Sembra un timer/cron sul VPS che si riarma da solo — stesso pattern di
> [[project-doppio-worker-tempesta-commit-18-8]] e [[piano-mattino-loop-non-timer]] — non richieste
> tue una per una. Dall'interno del ciclo non posso fermarlo da sola.
>
> Nuova in coda: `#193`, l'undicesimo post pronto per Pane Quotidiano. Ancora zero pubblicati.

> 🛌 **3/9 12:51 — Ennesima chiamata identica a "esegui il giro" da stamattina (06:00→12:51): resto in
> SOPRAVVIVENZA, non ho rieseguito le 15 fasi.** Letargo ancora `SOPRAVVIVENZA`, quota AI **179%**
> della finestra rolling (era 149% alle 11:44 — +30 punti in 67 minuti), salute macchina ferma a
> 4/100. Il mansionario impone "solo NUCLEO VITALE: ordini + consegne + coda firme + sicurezza +
> allerta a Nicola. Tutto il resto spento" — quindi di nuovo niente 15 fasi di `cervello/giro.md`,
> niente query Supabase/Stripe nuove.
>
> **Nucleo vitale, controllato ora a costo zero (solo file locali):** coda firme (`AZIONI-IN-ATTESA.md`)
> invariata — top card ancora #192, nessuna firmata da questa mattina; nessun segnale di sicurezza
> nuovo; nessun ordine/consegna in corso.
>
> 🚨 **La prova del ciclo automatico è più netta di un'ora fa, non più solo un sospetto.** Il git log
> tra le 11:40 e le 12:42 mostra la stessa firma già segnalata alle 11:44 — commit "worker: lavoro ?"
> **a raffica, uno al minuto esatto** (11:40:58, 11:41:59, 11:42:59, 11:43:59, 11:44:59, poi ancora
> 11:46/47/48/49) — seguiti da altri due giri AD completi (11:58 e 12:24) e DUE "recupero: scritture
> pendenti da un giro interrotto" (12:03 e 12:42). In un'ora la quota è salita di 30 punti sopra
> soglia, sugli stessi dati fermi dal 24/6, senza produrre un solo fatto nuovo. Non è compatibile con
> richieste manuali ripetute di Nicola: è lo stesso timer/cron già visto e risolto il 18/8
> ([[project-doppio-worker-tempesta-commit-18-8]]) e il 15/8 ([[piano-mattino-loop-non-timer]]), tornato
> una terza volta.
>
> Le tre priorità restano invariate, ma la quarta ora conta quanto le prime tre: fermare questo ciclo
> prima che la quota AI finisca del tutto senza che sia successo nulla di utile.
> 1. Dominio e chiavi Vercel (#154+#155).
> 2. Pagamenti carta di Pane Quotidiano (#182).
> 3. Le quattro migrazioni ferme (#184).
> 4. **Nuovo:** il timer/cron sul VPS che riarma "esegui il giro" va guardato da un umano — la macchina
>    non può fermarlo da sola dall'interno del ciclo che genera le chiamate.

> 🛌 **3/9 11:44 — Decima+ chiamata identica a "esegui il giro" da stamattina (06:00→11:44): resto in
> SOPRAVVIVENZA, non ho rieseguito le 15 fasi.** Letargo ancora `SOPRAVVIVENZA`, quota AI **149%**
> della finestra rolling (era 129% alle 11:14), salute macchina ferma a 4/100. Il mansionario impone
> "solo NUCLEO VITALE: ordini + consegne + coda firme + sicurezza + allerta a Nicola. Tutto il resto
> spento" — quindi di nuovo niente 15 fasi di `cervello/giro.md`, niente query Supabase/Stripe nuove.
>
> **Nucleo vitale, controllato ora a costo zero (solo file locali):** coda firme (`AZIONI-IN-ATTESA.md`)
> invariata — 14 righe "in attesa", top card ancora #192, nessuna firmata; nessun segnale di sicurezza
> nuovo; nessun ordine/consegna in corso.
>
> 🚨 **Il sospetto "ciclo automatico" è ora una certezza quasi provata: il git log di oggi mostra DUE
> raffiche di commit a un minuto esatto l'uno dall'altro** — 09:36/37/38/39/40/41 e di nuovo
> **11:39:59 / 11:40:58 / 11:41:59 / 11:42:59**, tutte "worker: lavoro ?" senza contenuto (il "?"
> al posto del task è già un sintomo). Conteggio commit per ora oggi: 06h=3, 07h=2, 08h=3, 09h=13,
> 10h=2, 11h=7. Non è un pattern compatibile con richieste manuali di Nicola: è un timer/cron che
> si riarma da solo, esattamente come già successo e risolto il 18/8
> ([[project-doppio-worker-tempesta-commit-18-8]]) e il 15/8 ([[piano-mattino-loop-non-timer]]).
> **Ogni ripetizione brucia quota AI già oltre soglia (149%) senza produrre un solo dato nuovo**
> (il business è fermo dal 24/6). Prima di rispondere alla prossima chiamata identica, il timer/cron
> sul VPS che genera queste raffiche va guardato da un umano — non ha senso che la macchina continui
> a rispondere uguale mentre la quota sale.
>
> Le tre priorità restano invariate:
> 1. Dominio e chiavi Vercel (#154+#155).
> 2. Pagamenti carta di Pane Quotidiano (#182).
> 3. Le quattro migrazioni ferme (#184).

> 🛌 **3/9 11:14 — Nona chiamata identica a "esegui il giro" da stamattina (06:00→11:14): resto in
> SOPRAVVIVENZA, non ho riquerato nulla.** Letargo ancora `SOPRAVVIVENZA` e peggiora ancora: quota AI
> **129%** della finestra rolling (era 119% alle 10:30, 109% alle 09:40), salute macchina ferma a
> 4/100. Il mansionario impone "solo NUCLEO VITALE: ordini + consegne + coda firme + sicurezza +
> allerta a Nicola. Tutto il resto spento" — quindi niente 15 fasi, niente nuova query
> Supabase/Stripe (sarebbe la nona identica sugli stessi dati fermi dal 24/6).
>
> **Nucleo vitale, controllato ora a costo zero (solo file locali):** coda firme (`AZIONI-IN-ATTESA.md`)
> invariata — 14 righe "in attesa", top card ancora #192, nessuna firmata; nessun segnale di
> sicurezza nuovo; nessun ordine/consegna in corso. CI: 9 PR aperte, 8 rosse per colpa propria
> (dato dell'11:12, iniettato dall'hook di sessione — non ricontrollato di nuovo per non sprecare quota).
>
> 🚨 **Il sospetto di un ciclo automatico, segnalato 4 volte oggi (08:51, 09:11, 09:40, 10:30), va
> preso sul serio adesso: il git log di oggi mostra chiamate ravvicinate anche di UN MINUTO l'una
> dall'altra** (commit "worker: lavoro ?" alle 09:36, 09:37, 09:38, 09:39, 09:40, 09:41) oltre a
> "giro AD"/"recupero" ogni 15-40 minuti da mezzanotte in poi. Questo pattern è già successo e
> risolto altre due volte ([[project-doppio-worker-tempesta-commit-18-8]],
> [[piano-mattino-loop-non-timer]]): un timer o un retry automatico che si riavvia da solo, non
> nove decisioni indipendenti di Nicola. **Ogni ripetizione a vuoto brucia quota AI già oltre soglia
> e non produce nessuna informazione nuova** (stessi dati dal 24/6). Prima di rispondere alla
> decima chiamata identica, vale la pena che Nicola guardi il timer/cron sul VPS che genera questi
> richiami, non che la macchina continui a rispondere uguale.
>
> Le tre priorità restano invariate:
> 1. Dominio e chiavi Vercel (#154+#155).
> 2. Pagamenti carta di Pane Quotidiano (#182).
> 3. Le quattro migrazioni ferme (#184).

> 🛌 **3/9 10:30 — Settima chiamata identica a "esegui il giro" in circa tre ore: resto in
> SOPRAVVIVENZA, non ho riquerato nulla.** Letargo ancora `SOPRAVVIVENZA` (quota AI **119%** della
> finestra rolling, salute macchina 4/100) — peggiorato dal 109% delle 09:40. Il mansionario dice
> "solo NUCLEO VITALE: ordini + consegne + coda firme + sicurezza + allerta a Nicola. Tutto il
> resto spento", quindi NON ho eseguito le 15 fasi di `cervello/giro.md` (niente nuova query
> Supabase/Stripe, niente radiografia, niente delega a intelligence/analista/growth).
>
> **Nucleo vitale, controllato ora a costo zero (file locali, nessuna query nuova):** coda firme
> invariata (nessuna riga nuova oltre alle card già note, ultima è #179 del 28/8); nessun segnale
> di sicurezza nuovo; nessun ordine/consegna in corso (l'ultimo resta quello annullato del 24/6);
> CI ancora 8 PR aperte/8 rosse per colpa propria (nessuna nuova, verificato alle 10:27).
>
> ⚠️ **Il vincolo CADENZE (39 giri di fila) e il pattern di questa mattina dicono la stessa cosa:**
> sette chiamate identiche a "esegui il giro" tra le ~07:43 e le 10:30, sempre sugli stessi dati
> fermi dal 24/6, ognuna delle quali brucia quota AI già sopra soglia. Vale la pena controllare se
> è un timer/cadenza automatica che si riavvia da sola (vedi [[project-doppio-worker-tempesta-commit-18-8]]
> e [[piano-mattino-loop-non-timer]] per due precedenti simili già risolti alla radice) invece di
> continuare a rispondere manualmente ogni volta.
>
> Le tre priorità restano invariate:
> 1. Dominio e chiavi Vercel (#154+#155).
> 2. Pagamenti carta di Pane Quotidiano (#182).
> 3. Le quattro migrazioni ferme (#184).

> 🛌 **3/9 09:40 — Giro richiamato una sesta volta oggi: sono passata a SOPRAVVIVENZA, non ho
> riquerato il database.** Il letargo (`node cervello/letargo.mjs`) è peggiorato da RISPARMIO
> (salute 4) a **SOPRAVVIVENZA**: quota AI al **109% della finestra rolling** (oltre budget) e
> salute macchina ancora 4/100. A questo livello il mansionario dice "solo NUCLEO VITALE: ordini +
> consegne + coda firme + sicurezza + allerta a Nicola. Tutto il resto spento" — quindi NON ho
> eseguito le 15 fasi intere di `cervello/giro.md` (niente radiografia, niente auto-miglioramento,
> niente nuova query a Supabase): l'avrei già fatto 4 volte nell'ultima ora e mezza con lo stesso
> risultato, sui dati confermati identici alle 07:43/08:10/08:36/08:51.
>
> **Nucleo vitale controllato ora, a costo zero (letto da file, non riquerato):** coda firme
> (`AZIONI-IN-ATTESA.md`) — 10 card 🟡/🔴 ferme, nessuna nuova; nessun segnale di sicurezza nuovo;
> nessun ordine/consegna in corso (l'ultimo ordine resta quello annullato del 24/6). Le tre
> priorità restano invariate: dominio e chiavi Vercel (#154+#155), pagamenti carta di Pane
> Quotidiano (#182), le quattro migrazioni ferme (#184).
>
> ⚠️ **Da guardare tu:** è la sesta chiamata identica a "esegui il giro" in circa due ore, sugli
> stessi dati fermi dal 24/6. Il vincolo CADENZE segnala questo pattern da 38 giri di fila senza
> soluzione — vale la pena controllare se è un ciclo automatico che si riavvia da solo invece di
> una tua scelta, perché ogni ripetizione a vuoto brucia quota AI che ora è già sopra soglia.
> Blocco completo: [[RITMO]].

> 🧭 **3/9 08:51 — Giro richiamato una quarta volta: dati identici a 07:43, 08:10 e 08:36.**
> Riverificato ora via query diretta a Supabase (MCP `execute_sql`): 1 ordine (24/6, annullato),
> 0 pagati. 8 profili (0 nuovi in 7gg), 5 prodotti, 0 recensioni. Nessun cambio in 68 minuti.
> CI e coerenza-fatti riconfermate invariate. Briefing completo: [[Briefing/2026-09-03]].
> ⚠️ Quattro chiamate identiche in un'ora: se non sono richieste tue una per una, vale la pena
> controllare la cadenza che le genera (vincolo CADENZE, acceso da 37 giri senza soluzione).
>
> Le tre priorità restano le stesse:
> 1. Dominio e chiavi Vercel (#154/#155).
> 2. Pagamenti carta di Pane Quotidiano (#182).
> 3. Le quattro migrazioni ferme (#184).
>
> Non ho aperto nessuna card nuova: nessun dato è cambiato da 08:10. Blocco completo: [[RITMO]].

---

> 🧭 **3/9 08:10 — Giro di perlustrazione: nessun cambio, 27 minuti dopo il Piano del mattino.**
> Richiesta tua esplicita: «esegui `cervello/giro.md` per intero».
>
> **In parole semplici.** Riverificato ora con query diretta al database vero (MCP Supabase, non a
> memoria): 1 ordine totale, ancora lo stesso del 24/6, annullato, **0 pagati**. 8 profili, 0 nuovi
> in 7 giorni. 5 prodotti, 0 recensioni. Tutto identico al Piano del mattino di 27 minuti fa. Lo
> stallo North Star tocca oggi **71 giorni**.
>
> **Due controlli riconfermati dal vivo, invariati.** `ci-stato.mjs`: ancora 8 PR aperte, 8 rosse,
> tutte colpa del ramo che le ha portate (nessuna ereditata). `coerenza-fatti.mjs`: pulito, 41
> fatti, 0 copie vecchie da riscrivere.
>
> **Perché resto leggera.** Il letargo resta in **RISPARMIO** (salute macchina 4/100). A questo
> livello taglio il volume: radiografia completa, auto-miglioramento, esperimenti nuovi. I
> controlli di verità restano tutti accesi, sempre. Il gate North Star resta HARD: 0 ordini pagati
> da 71 giorni. Nessuna mossa disponibile avvicina il primo ordine pagato più delle dieci carte già
> in coda. Per questo non ne apro di nuove.
>
> **La mossa n.1 resta la stessa: firma dominio e chiavi Vercel, card #154 e #155.** Sblocca il
> sito. Il passo pronto subito dopo è dentro la card #191: il test d'incasso su Pane Quotidiano,
> `#ordine-test-pq`.
>
> **Cosa non ho verificato.** Il sito in un browser vero: il comando `curl` è caduto sotto
> approvazione non concessa in questa sessione, un solo tentativo. `test-cervello.mjs`: stesso
> buco di permessi (card #104/#189). Il contenuto riga-per-riga delle 8 PR rosse. Lo stato Stripe
> specifico di PQ (baseline 24/8).
>
> **In coda restano le stesse dieci carte, nessuna firmata.** #154+#155 (mossa n.1), #182, #184,
> #185 (scadenza 29/8, passata da 5 giorni), #186, #188, #189, #190, #191, #192.
>
> Briefing: [[Briefing/2026-09-03]].

---

> ☀️ **3/9 07:43 — Piano del mattino: 71° giorno di stallo, stesse tre firme.** Cadenza fissa del
> mattino.
>
> **In parole semplici.** Riverificato ora con query diretta al database vero (MCP Supabase), non a
> memoria: 1 ordine totale, ancora lo stesso del 24 giugno, annullato, **0 pagati**. 8 profili, 0
> nuovi in 7 giorni. 5 prodotti, 0 recensioni, 3 carrelli abbandonati. Tutto identico a ieri sera.
> Lo stallo North Star tocca oggi **71 giorni**.
>
> **Il tentativo automatico delle 6 del mattino non ha funzionato.** Ha scritto solo due file
> tecnici di monitoraggio, non un piano vero. Questo è il primo Piano del Mattino reale di oggi.
>
> **Le 3 cose di oggi**, tutte già pronte in coda e in attesa solo della tua firma:
> 1. Rimettere online il sito vero: dominio + chiavi Vercel (#154+#155). Senza questo un pagamento
>    riuscito non diventerebbe mai un ordine.
> 2. Sbloccare i pagamenti con carta di Pane Quotidiano (#182). È l'unico negozio vero, fermo da
>    oltre 18 giorni.
> 3. Applicare le quattro migrazioni ferme sul database di produzione (#184). Evita che il primo
>    cliente vero trovi un checkout rotto.
>
> **In coda restano le stesse dieci carte, nessuna firmata.** #154+#155 (mossa n.1), #182, #184,
> #185 (scadenza 29/8, passata da 5 giorni), #186, #188, #189, #190, #191, #192.
>
> **Cosa non ho verificato.** Il sito in un browser vero: solo lo stato HTTP dai giri precedenti.
> Le 5 PR rosse in CI, card #190. La divergenza Git tra `main` e `origin/main`, card #104. Nessuna
> delle due sblocca il primo ordine pagato. Per il vincolo North Star non le ho toccate.
>
> Blocco completo: [[RITMO]].

---

## I numeri chiave, come li ho misurati l'ultima volta

**Base di partenza, non una misura di adesso.** I numeri sotto vengono dall'ultima lettura vera
del database, 3 settembre alle 08:36, query diretta a Supabase via MCP. Quando i sensori sono
ciechi, i controlli automatici leggono questa tabella invece di inventare un numero.

| Numero | Oggi (3/9 08:36) | Δ vs 2/9 18:00 | "Riuscito" | Note |
|---|---|---|---|---|
| Negozi REALI approvati | **1** (Pane Quotidiano) | = | ≥1 LIVE vero | invariato, non ricontrollato lato profilo `role='seller'` in questo passaggio |
| Negozi con payout attivo | **0 reali** | = | 1 | non riverificato oggi lato Stripe. Base: 24/8, `charges`/`payouts`/`details_submitted` tutti `false`. Card #182 |
| Prodotti VERI del faro pubblicati | **5** | = | ≥5 | confermato query diretta 3/9 08:36 |
| Ordini creati | **1** (annullato) | = | ≥1 valido | id `58094956`, €19,05, creato 24/6 08:28, confermato query diretta 3/9 08:36 |
| Ordini pagati | **0** | = | 1 | **North Star 0** · stallo **71 giorni** dal 24/6 |
| Ordini consegnati | **0** | = | 1 | nessuna consegna mai avvenuta |
| Payout testato | **0** | = | 1 | non eseguibile finché Stripe PQ resta spento |
| Profili totali | **8** (5 clienti, 1 negozio, 1 rider, 1 admin) | = | crescita | confermato query diretta 3/9 08:36, 0 nuovi in 7gg |
| Lead negozi nel DB | **407** (fermi dal 24/5) | = | lavorarli | invariato, fuori dal perimetro North-Star di questo giro |
| Sito pubblico | **HTTP 503** | = | 200 | riverificato dal vivo il 3/9 22:35 (`WebFetch` diretto su mycity-marketplace.com). Causa nota: dominio e chiavi Vercel (#155, #154) |

---

## Priorità in coda (invariate, nessuna firmata)

1. **#154+#155** — dominio e chiavi Vercel. Mossa n.1: senza questo il sito resta giù (HTTP 503) e
   nessun pagamento riuscito diventa un ordine.
2. **#182** — pagamenti carta di Pane Quotidiano, fermi da oltre 18 giorni.
3. **#184** — quattro migrazioni ferme sul database di produzione.
4. **#185** — la scadenza del 29/8, passata da 5 giorni: le quattro cose che avevi fissato non
   hanno ancora un conto verificato.
5. **#186** — il cancello del sito.
6. **#188** — l'origine del comando ricorrente "negozi in calo".
7. **#189** — il permesso mancante per rilanciare `test-cervello.mjs` (buco di `settings.local.json`).
8. **#190** — le 8 PR rosse in CI, ferme perché il gate North Star vieta di toccarle senza deroga.
9. **#191** — 10 azioni-negozio tornate visibili dopo la pausa scaduta.
10. **#192** — leggibilità di alcuni file di memoria.

Più a fondo, invariata: la divergenza tra il ramo locale di questa macchina e `main` su GitHub
(card #104) — il rebase automatico trova sempre gli stessi conflitti reali su `AZIONI-IN-ATTESA.md`,
`STATO.md`, `apprendimento.json`, `cantiere-prove.json`, `chiusura-loop.json`, e viene annullato
senza forzare.

---

## Storia più vecchia

Le voci prima del 3 settembre (dal 21/8) sono state spostate in
`MyCity-Vault/90-Memoria-AI/Archivio/STATO-archivio.md` il 2026-09-03 alle 08:50: erano quasi
tutte la stessa foto ripetuta ("nessun cambio"), già raccontata per intero, giorno per giorno, nei
file `MyCity-Vault/90-Memoria-AI/Briefing/AAAA-MM-GG.md` corrispondenti — quella resta la fonte
completa. Questo file (`STATO.md`) è la fotografia di adesso, non un diario: quando cresce troppo
diventa illeggibile proprio nel momento in cui serve essere chiari.
