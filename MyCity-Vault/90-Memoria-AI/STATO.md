---
tipo: stato
aggiornato: 2026-09-03 14:30
fonte: AD digitale (chiamata "esegui giro.md" — SOPRAVVIVENZA, giro pieno NON eseguito)
---

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
| Sito pubblico | **HTTP 503** (baseline 1/9) | = | 200 | non riverificato con un check diretto oggi: comando bloccato da approvazione. Causa nota: dominio e chiavi Vercel (#155, #154) |

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
