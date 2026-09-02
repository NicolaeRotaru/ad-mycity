---
tipo: stato
aggiornato: 2026-09-02 22:57
fonte: AD digitale (Giro di perlustrazione, cervello/giro.md)
---

> 🧭 **2/9 22:57 — Giro di perlustrazione: nessun cambio nei dati, un debito chiuso.** Richiesta tua
> di poco fa: «esegui `cervello/giro.md` per intero».
>
> **In parole semplici.** Ho riverificato ora con una query diretta al database vero (MCP Supabase,
> non memoria). Risultato: 1 ordine totale, sempre lo stesso del 24/6, annullato, **0 pagati**. 8
> profili, 0 nuovi in 7 giorni. 5 prodotti, 0 recensioni, 3 carrelli abbandonati. Identico a tutti i
> 29 passaggi di oggi. Stallo North Star: **70 giorni**.
>
> **Una cosa chiusa in questo passaggio.** Da tre passaggi (dalle 22:40) i 4 file tecnici dei sensori
> (`fonti-salute.json`, `intelligence-agenda.json`, `mutanti.json`, `routing.json`) restavano nel
> mio working tree, esclusi dal cancello che vieta commit diretti di codice su `main` (AR-332), senza
> mai diventare una PR vera. L'ho fatto ora: **PR #864**, https://github.com/NicolaeRotaru/ad-mycity/pull/864,
> verificata mergeable senza conflitti — costruita da `origin/main` (non dal mio `main` locale) per
> non trascinarci dentro i 65 commit di memoria non ancora pubblicati.
>
> **La divergenza git resta aperta (card #104).** Ho riprovato il rebase del ramo locale su
> `origin/main`: stessi 5 conflitti reali di 17 minuti fa (`AZIONI-IN-ATTESA.md`, `STATO.md`,
> `apprendimento.json`, `cantiere-prove.json`, `chiusura-loop.json`) — annullato subito, zero
> rischio dati. Il ramo locale resta **65 commit avanti / 2 indietro** rispetto a GitHub: finché
> qualcuno non risolve i conflitti a mano (io o tu sul VPS), il Pannello ospitato online non vede le
> scritture di oggi.
>
> **Perché resto leggera.** Il letargo resta in **RISPARMIO** (quota AI 56%, salute macchina 4/100):
> a questo livello si taglia il volume — radiografia completa, auto-miglioramento, esperimenti nuovi.
> I controlli di verità restano sempre accesi. Il gate North Star resta HARD: nessuna mossa
> disponibile avvicina il primo ordine pagato più delle 10 carte già in coda.
>
> **La mossa n.1 resta la stessa: firma dominio e chiavi Vercel, card #154 e #155.** Sblocca il
> sito. Il passo pronto subito dopo è dentro la card #191: il test d'incasso su Pane Quotidiano,
> `#ordine-test-pq`.
>
> **In coda restano dieci carte, nessuna firmata**: #154+#155 (mossa n.1), #182, #184, #185, #186,
> #188, #189, #190, #191, #192.
>
> Briefing: [[Briefing/2026-09-02]].

---

> 🧭 **2/9 22:35 — Giro di perlustrazione: nessun cambio.** Ventottesima foto identica di oggi.
> Non è partito da un segnale di business nuovo. È partito da un heartbeat tecnico: sono passate 28
> ore dall'ultimo giro pieno vero. In più un sensore è cambiato di stato, `mcp_supabase`, da "non
> verificato" a "ok" — non è un dato di business, è solo la macchina che si riverifica da sola.
> Richiesta tua di poco fa: «esegui `cervello/giro.md` per intero».
>
> **In parole semplici.** Ho riverificato ora con una query diretta al database vero. Uso MCP
> Supabase, non la memoria di prima. Risultato: 1 ordine totale, sempre lo stesso del 24/6,
> annullato. **0 pagati.** 8 profili, 0 nuovi in 7 giorni. 5 prodotti, 0 recensioni, 3 carrelli
> abbandonati. Tutto identico al giro pieno delle 20:29. Stallo North Star: **70 giorni**.
>
> **Una cosa sistemata in questo passaggio.** Il guardiano `chiusura-loop` segnalava due reparti,
> @ad e @intelligence. Avevano lavoro fatto oggi ma senza la riga ESITO nel loro quaderno. Ho
> scritto io quella riga a mano, in `memoria-squadra/ad.md` e `memoria-squadra/intelligence.md`. Lo
> script che lo farebbe da solo, `chiusura-loop.mjs`, resta bloccato: stesso buco di permessi delle
> card #104/#189.
>
> **Perché resto leggera.** Il letargo resta in **RISPARMIO** (quota AI 56%, salute macchina 4/100):
> a questo livello si taglia il volume — radiografia completa, auto-miglioramento, esperimenti nuovi.
> Sono già coperti dai giri precedenti, non c'è nulla di nuovo da rifare. I controlli di verità restano
> sempre accesi. Il gate North Star resta HARD: nessuna mossa disponibile avvicina il primo ordine
> pagato più delle 10 carte già in coda.
>
> `test-cervello.mjs`, `gh pr list` e gli altri script `node cervello/*.mjs` fuori dall'elenco
> consentito restano negati in questa sessione. È lo stesso buco di `settings.local.json`, card
> #104/#189. Un solo tentativo per ciascuno, non ridiagnosticato oltre.
>
> **La mossa n.1 resta la stessa: firma dominio e chiavi Vercel, card #154 e #155.** Sblocca il
> sito. Il passo pronto subito dopo è dentro la card #191: il test d'incasso su Pane Quotidiano,
> `#ordine-test-pq`.
>
> **In coda restano dieci carte, nessuna firmata** (invariate dalle 18:28): #154+#155 (mossa n.1),
> #182, #184, #185, #186, #188, #189, #190, #191, #192.
>
> Briefing: [[Briefing/2026-09-02]].

---

> 🧭 **2/9 20:29 — Giro di perlustrazione: nessun cambio, ventisettesima foto identica.** Richiesta
> tua: «fai un giro» (esegui `cervello/giro.md` per intero).
>
> **In parole semplici.** Ho riverificato dal vivo con query dirette al database (MCP Supabase), non
> a memoria. Risultato: 1 ordine totale, ancora lo stesso del 24/6, annullato, **0 pagati**. 8
> profili (5 clienti, 1 negozio, 1 rider, 1 admin), 0 nuovi in 7 giorni. 5 prodotti, 0 recensioni, 3
> carrelli abbandonati. Tutto identico all'ultimo giro pieno delle 18:51.
>
> Il sito pubblico resta giù. Ho controllato io stessa due indirizzi. Il primo,
> `mycity-marketplace.com`, resta 503. Il secondo è l'indirizzo Vercel vero,
> `mycity-phi.vercel.app`: lì la home carica bene, ma `/api/health` risponde ancora 503
> "unhealthy". Stallo North Star: **70 giorni**.
>
> **Una cosa nuova, minore.** Ho letto la tabella `cron_heartbeats` del database vero. I lavori
> automatici del sito risultano fermi dal 30/7, oltre un mese: scadenza ordini, payout ai negozi,
> carrelli abbandonati, email e push. È un sintomo della stessa causa nota, chiavi e dominio
> Vercel. Non è un guasto separato. L'ho annotato in coda alla card #154. Non ho aperto una carta
> nuova: non cambia la mossa da fare. Aggiunge solo un motivo in più per controllare i Cron Job
> quando si sistema Vercel.
>
> **Perché resto leggera.** Il letargo resta in **RISPARMIO**: quota AI 52%, salute macchina 4/100.
> A questo livello si taglia il volume: radiografia completa, auto-miglioramento, esperimenti nuovi.
> Sono già coperti dal giro delle 18:51, non c'è nulla di nuovo da rifare. I controlli di verità
> restano invece sempre accesi. Il gate North Star resta HARD: nessuna mossa disponibile avvicina il
> primo ordine pagato più delle 10 carte già in coda.
>
> `test-cervello.mjs`, `gh pr list` e gli altri script `node cervello/*.mjs` fuori dall'elenco
> consentito restano negati in questa sessione. È lo stesso buco di `settings.local.json`, card
> #104/#189. Un solo tentativo per ciascuno.
>
> **La mossa n.1 resta la stessa: firma dominio e chiavi Vercel, card #154 e #155.** Sblocca il
> sito. Il passo pronto subito dopo è dentro la card #191: il test d'incasso su Pane Quotidiano,
> `#ordine-test-pq`.
>
> **In coda restano dieci carte, nessuna firmata.** Una in più delle 9 già note: #192, aperta alle
> 18:28 dal cancello di leggibilità, non da questo passaggio.
> - **#154+#155:** dominio e chiavi Vercel, mossa n.1.
> - **#182:** pagamenti Pane Quotidiano.
> - **#184:** migrazioni database.
> - **#185:** scadenza 29/8, passata da 4 giorni.
> - **#186:** cancello del sito.
> - **#188:** origine del comando ricorrente.
> - **#189:** permesso per `test-cervello.mjs`.
> - **#190:** CI cronica.
> - **#191:** 10 azioni-negozio in attesa del tuo sì.
> - **#192:** leggibilità di 6 file di memoria.
>
> Briefing: [[Briefing/2026-09-02]].

---

> 🧭 **2/9 18:28 — Giro di perlustrazione: nessun cambio, ventiseiesima foto identica.**
> È partito dall'orologio di sicurezza (24 ore dall'ultimo giro pieno vero). Non è partito per un
> dato nuovo.
>
> **In parole semplici.** Ho riverificato dal vivo con una query diretta al database. 1 ordine
> totale, lo stesso del 24/6, annullato. **0 pagati.** 8 profili, 0 nuovi in 7 giorni. 5 prodotti,
> 0 recensioni. Tutto identico al report della sera delle 18:00, 28 minuti fa. Lo stallo North Star
> oggi tocca **70 giorni**.
>
> **Perché resto leggera.** Il letargo resta in **RISPARMIO**. A questo livello si taglia il
> volume: radiografia completa, auto-miglioramento, esperimenti nuovi. I controlli di verità restano
> sempre accesi. Ho tenuto solo la riverifica diretta del nucleo vitale: ordini e coda firme. Il
> vincolo North Star impone di lavorare solo su ciò che avvicina il primo ordine pagato. Nessuna
> mossa nuova disponibile lo fa più delle 9 carte già in coda. Per questo non ne apro di nuove.
> `test-cervello.mjs` resta bloccato. Lo blocca lo stesso permesso mancante di sempre, il buco di
> `settings.local.json` delle card #104 e #189. Vale anche per gli altri script `node cervello/*.mjs`
> fuori dall'elenco consentito. Un solo tentativo per ciascuno, non ridiagnosticato oltre.
>
> **La mossa n.1 resta la stessa: firma dominio e chiavi Vercel, card #154 e #155.** Sblocca il
> sito. Il sito è giù da 242 giri di fila, errore HTTP 503. C'è già un passo pronto subito dopo,
> dentro la card più recente in coda, la #191: il test d'incasso su Pane Quotidiano,
> `#ordine-test-pq`.
>
> **In coda restano le stesse nove carte, nessuna firmata.** #154+#155 (dominio+chiavi Vercel,
> mossa n.1), #182 (pagamenti PQ), #184 (migrazioni DB), #185 (scadenza 29/8, scaduta da 4gg), #186
> (cancello sito), #188 (origine comando ricorrente), #189 (permesso test-cervello), #190 (CI
> cronica), #191 (10 azioni-negozio in attesa del tuo sì).
>
> Briefing: [[Briefing/2026-09-02]].

---

> 🌙 **2/9 18:00 — Report della sera.** Richiesta tua: report della sera (ritmo).
>
> **In parole semplici.** Oggi ho solo verificato, non ho cambiato nulla nel business. Riletto il
> database con query dirette più volte nella giornata. Il numero che conta è gli ordini pagati.
> È rimasto a zero tutto il giorno. Sono **70 giorni** così. Il sito pubblico resta giù, errore 503.
> La causa è nota da settimane: mancano il dominio e due chiavi su Vercel. Nessun ordine vero oggi.
> Nessun negozio nuovo. Nessuna carta approvata da te, su nove in coda da tutta la giornata.
>
> **Cosa è cambiato nel merito.** Una cosa vera, non di business. Il collegamento tra questa
> macchina e il sito vero su GitHub si è allargato molto oggi: da 26 a 54 commit di distanza.
> Il motivo: il lavoro automatico continua a scrivere qui, mentre l'invio verso GitHub resta
> bloccato dallo stesso permesso mancante di sempre (card #104). Zero rischio per i tuoi dati:
> nessun tentativo forzato. Per il resto, solo manutenzione. Un contatore interno disallineato
> (AR-850) è stato corretto. E una pausa su 10 azioni-negozio è scaduta: sono tornate in coda
> (card #191).
>
> **I numeri, confermati ora via query diretta.** 1 ordine totale, lo stesso del 24/6, annullato.
> **0 pagati.** 5 prodotti. 8 profili: 5 clienti, 1 negozio, 1 rider, 1 admin, 0 nuovi in 7 giorni.
> 0 recensioni. 3 carrelli abbandonati. Tutto invariato rispetto a stamattina.
>
> **In coda restano 9 carte, nessuna firmata.** Prima: dominio e chiavi Vercel per riportare online
> il sito pubblico, card #154 e #155. Senza questo nessun pagamento riuscito diventa un ordine.
> Seconda: sblocco dei pagamenti carta di Pane Quotidiano, card #182. Terza: le migrazioni mancanti
> sul database di produzione, card #184. Restano ferme in attesa della stessa firma anche:
> - la scadenza del 29/8, passata da 4 giorni
> - il cancello del sito
> - l'origine del comando ricorrente "negozi in calo"
> - il permesso per i test
> - la CI cronica
> - le 10 azioni-negozio tornate visibili
>
> **Lezione di oggi.** Un canale di pubblicazione rotto peggiora da solo se il lavoro automatico
> continua a scrivere senza fermarsi. Non basta segnalarlo una volta: va tenuto d'occhio ogni giro.
>
> **Domani.** La prima cosa utile resta identica: la tua firma su dominio e chiavi Vercel.
>
> **Dettagli tecnici.** `coerenza-fatti.mjs` non rieseguibile in questo passaggio (0 scansionati,
> segnalato non dichiarato verde). Divergenza `main...origin/main`: 54 avanti / 2 indietro (card
> #104). Letargo salito a SOPRAVVIVENZA (13:03, quota AI oltre soglia, salute macchina 4/100).
> 8 commit oggi (giri + recuperi di scritture pendenti). Card nuova di oggi: #191.
>
> Briefing completo: [[Briefing/2026-09-02]].

---

> 🧭 **2/9 16:32 — Giro di perlustrazione: nessun cambio.** Il giro è partito da solo, per l'orologio
> di sicurezza (22 ore dall'ultimo giro pieno). Non è partito per un dato nuovo. Richiesta tua: «fai
> un giro».
>
> **In parole semplici.** Il cancello che decide se serve un giro pieno si chiama `delta-gate.mjs`.
> Dice che lo stato è identico da giri: 1 ordine totale, 0 pagati, 8 clienti. È lo stesso ordine
> annullato del 24/6. Ha fatto scattare il giro solo perché sono passate più di 12 ore dall'ultimo
> giro pieno vero. È una regola di sicurezza, non un segnale di business. Ho riverificato il nucleo
> vitale: ordini fermi, nessuna consegna in corso. La coda firme resta invariata, stessa priorità
> #154+#155. Nessun allarme di sicurezza nuovo.
>
> **Perché resto leggera.** Siamo ancora in letargo **SOPRAVVIVENZA**. La quota AI è al 134% della
> finestra. La salute macchina è a 4/100. A questo livello resta acceso solo il nucleo vitale.
> Riscrivere i 15 passi del giro pieno su un quadro invariato sarebbe rumore. Non sarebbe nuova
> verità.
>
> **La mossa n.1 resta la stessa: firma dominio e chiavi Vercel (#154+#155).** Sblocca il sito. Il
> sito è giù da 241 giri di fila, errore HTTP 503. Sbloccarlo apre la strada al primo ordine pagato
> vero. C'è già un passo pronto subito dopo, dentro la card più recente in coda (#191): il test
> d'incasso su Pane Quotidiano, `#ordine-test-pq`.
>
> Briefing: [[Briefing/2026-09-02]].

---

> 🧭 **2/9 14:30 — Giro di perlustrazione: ventiduesima foto identica, 1h27 dopo l'ultima.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Riverificato dal vivo via query diretta. Risultato: 1 ordine totale, 0
> pagati, 0 attivi. È lo stesso ordine annullato del 24/6 di tutti i passaggi precedenti. Nessun
> numero di business è cambiato dal passaggio delle 13:03. Anche la coda in [[AZIONI-IN-ATTESA]]
> è ferma: stesse 9 carte di prima (#154+155, #182, #184, #185, #186, #188, #189, #190, #191).
>
> **Perché non ho rifatto il giro pieno.** Restiamo in letargo **SOPRAVVIVENZA**. Il motivo: quota
> AI oltre soglia, salute macchina a 4/100. A questo livello resta acceso solo il nucleo vitale:
> ordini, consegne, coda firme, sicurezza, allerta a te. Ho controllato tutti e cinque, e nessuno
> segnala niente di nuovo. Riscrivere i 15 passi del giro pieno su un quadro invariato sarebbe
> rumore, non nuova verità — è il tipo di ripetizione che la macchina ha già imparato a evitare
> (vedi lezione "loop-a-vuoto").
>
> **La mossa n.1 resta la stessa: firma dominio e chiavi Vercel (#154+#155).** Quella firma sblocca
> il sito, che oggi è giù con errore HTTP 503. E con il sito sbloccato si apre la strada verso un
> primo ordine pagato vero.
>
> Briefing: [[Briefing/2026-09-02]].

---

> 🧭 **2/9 13:03 — Giro di perlustrazione: letargo salito a SOPRAVVIVENZA.**
>
> **Il business non è cambiato.** Riverificato dal vivo: 1 ordine (24/6, annullato), 0 pagati. Sito
> ancora giù, HTTP 503. Le 6 PR aperte restano tutte rosse. La memoria dei fatti è pulita: 41 fatti,
> nessuna copia vecchia.
>
> **La novità vera è il livello di letargo.** È salito da RISPARMIO a **SOPRAVVIVENZA**. Il motivo:
> quota AI al 127% e salute macchina a 4/100. A questo livello resta acceso solo il nucleo vitale —
> ordini, consegne, coda firme, sicurezza, allerta a te. Tutto il resto si spegne: radiografia,
> auto-miglioramento, contenuti.
>
> **Per questo il giro di oggi è rimasto leggero.** Solo riverifica diretta e questa nota, non i 15
> passi pieni. La coda non cambia: stesse 9 carte, nessuna firmata. La mossa n.1 resta la stessa:
> firma dominio e chiavi Vercel (#154+#155).
>
> Briefing: [[Briefing/2026-09-02]].

---

> 🕛 **2/9 12:00 — Punto di mezzogiorno.** Ripreso il piano delle 06:05.
>
> **In parole semplici.** Le 3 priorità di stamattina sono ferme, identiche da 21 controlli: il
> sito è ancora giù, Pane Quotidiano non incassa, le 4 migrazioni non sono applicate. Riverificato
> ora via query diretta: 1 ordine (0 pagati, 0 consegnati), 8 profili, 5 prodotti, 0 recensioni, 3
> carrelli — identico a tutto il resto della giornata. Stallo 70 giorni.
>
> **La cosa che cambia da sola, e peggiora.** Il ramo di questa macchina e il sito vero su GitHub
> sono scollegati. La distanza cresce a ogni passaggio: 26 commit alle 11:14, 37 ora. Cresce perché
> il lavoro automatico continua a scrivere qui. L'invio verso GitHub resta bloccato dallo stesso
> permesso mancante di sempre (card `#104`). Non ho tentato un altro riallineamento da sola. Il
> tentativo di stamattina si era fermato su un conflitto vero. L'ho annullato senza forzare nulla:
> zero rischio per i tuoi dati. Resta un problema pratico: il pannello che vedi tu online non
> riceve più quello che scrivo qui.
>
> **In coda restano le stesse nove carte, nessuna firmata.** #154+#155 (dominio+chiavi Vercel,
> mossa n.1), #182 (pagamenti PQ), #184 (migrazioni DB), #185 (scadenza 29/8, scaduta da 4gg), #186
> (cancello sito), #188 (origine comando ricorrente), #189 (permesso test-cervello), #190 (CI
> cronica), #191 (10 azioni-negozio in attesa del tuo sì).
>
> Blocco completo: [[RITMO]] · Briefing: [[Briefing/2026-09-02]].

---

> 🧭 **2/9 11:50 — Giro di perlustrazione: ventunesima foto identica, 25 minuti dopo l'ultima.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Riverificato dal vivo via query diretta al database: 1 ordine totale, 0
> pagati, sempre lo stesso del 24/6 annullato. 8 profili, 0 nuovi in 7gg, 5 prodotti, 0 recensioni.
> Nessun numero di business cambiato dal passaggio delle 11:25.
>
> **L'unica cosa che si muove resta il contatore del guasto Git (card #104).** Il ramo locale è ora
> **32 commit avanti e 2 indietro** rispetto a `origin/main`. Alle 11:25 erano 28 avanti e 2 indietro.
> Sono 4 commit in più nel frattempo. Sono tutti del worker automatico: un playbook anti-churn negozi
> e due "lavoro" senza contenuto di business. Non ho ritentato il rebase. Resta lo stesso conflitto
> vero già descritto alle 11:14. Serve la tua indicazione.
>
> **Comandi node bloccati anche in questo passaggio.** `test-cervello.mjs` resta negato in questa
> sessione. Lo stesso vale per gli altri script `node cervello/*.mjs` fuori dall'allowlist. È lo
> stesso buco di `settings.local.json`, card #104/#189. Un solo tentativo, non ridiagnosticato oltre.
>
> **Non riscrivo un briefing pieno da 15 passi:** è il ventunesimo passaggio identico di oggi sullo
> stesso quadro (0 ordini pagati da 70 giorni, sito giù, stessa coda). Rifare l'intero giro ora
> sarebbe rumore, non nuova verità — vedi i playbook "loop-a-vuoto" già in memoria. Ho tenuto solo la
> riverifica diretta dei numeri che contano.
>
> **In coda restano le stesse nove carte, nessuna firmata.** #154+#155 (dominio+chiavi Vercel,
> mossa n.1), #182 (pagamenti PQ), #184 (migrazioni DB), #185 (scadenza 29/8, scaduta da 4gg), #186
> (cancello sito), #188 (origine comando ricorrente), #189 (permesso test-cervello), #190 (CI
> cronica), #191 (10 azioni-negozio in attesa del tuo sì).
>
> Briefing completo: [[Briefing/2026-09-02]].

---

> 🧭 **2/9 11:25 — Giro di perlustrazione: ventesima foto identica, 11 minuti dopo l'ultima.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Riverificato dal vivo via query diretta al database: 1 ordine totale, 0
> pagati, sempre lo stesso del 24/6 annullato. Nessun numero di business cambiato.
>
> **L'unica cosa che si muove è il contatore del guasto Git già noto (card #104).** Il ramo locale
> è ora **28 commit avanti e 2 indietro** rispetto a `origin/main`. Alle 11:14 erano 26 avanti e 0
> indietro. I 2 "indietro" sono due PR di memoria già mergiate su GitHub: #861 (audit marketplace) e
> #862 (lezioni radiografia). Questa macchina non le ha ancora scaricate. Non ho ritentato il
> `git rebase`. Il tentativo delle 11:14 si è fermato su un conflitto vero, sul primo commit del 1/9
> alle 12:47. Serve la tua indicazione. Non ha senso un nuovo tentativo alla cieca sullo stesso stato.
>
> **Comandi node bloccati anche in questo passaggio.** `gh pr list`, `test-cervello.mjs` e gli altri
> script `node cervello/*.mjs` fuori dall'allowlist restano negati in questa sessione (stesso buco
> di `settings.local.json`, card #104/#189) — un solo tentativo, non ridiagnosticato oltre.
>
> **In coda restano le stesse nove carte, nessuna firmata.** #154+#155 (dominio+chiavi Vercel,
> mossa n.1), #182 (pagamenti PQ), #184 (migrazioni DB), #185 (scadenza 29/8, scaduta da 4gg), #186
> (cancello sito), #188 (origine comando ricorrente), #189 (permesso test-cervello), #190 (CI
> cronica), #191 (10 azioni-negozio in attesa del tuo sì).
>
> Briefing completo: [[Briefing/2026-09-02]].

---

> 🧭 **2/9 11:14 — Giro di perlustrazione: diciannovesima foto identica, 43 minuti dopo l'ultima.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Riverificato dal vivo via query diretta al database: 1 ordine totale, 0
> pagati, sempre lo stesso del 24/6 annullato. Nessun numero di business cambiato.
>
> **Cosa ho trovato di NUOVO in questo passaggio — un guasto più grave di quanto pensassi.**
> Ho salvato 17 file di sensori/memoria rimasti indietro da un giro interrotto (commit `36c1651ae`).
> Poi ho provato a mandarli su GitHub e mi hanno respinto tutti.
> **Il ramo locale di questa macchina e il ramo `main` su GitHub sono scollegati da 26 commit.**
> Prima erano 5-6 (card #104): il buco è cresciuto.
> Ho provato a riallinearli (`git rebase`). Il tentativo si è fermato subito su un conflitto vero,
> già sul primo commit vecchio (quello dell'1/9 12:47).
> L'ho annullato senza forzare nulla: **zero rischio per i tuoi dati**.
> Ma finché resta così, il Pannello che vedi tu online non riceve più niente di quello che scrivo
> qui. Lo vede solo la macchina in locale.
> È lo stesso buco di permessi Git di sempre. Ora però è arrivato al punto che push e rebase
> falliscono del tutto, non solo "in ritardo".
> Dettagli completi: [[Briefing/2026-09-02]].
>
> **Su AR-687 (i blocchi fermi da molti giri).** Invariato: `test-cervello.mjs`,
> `north-star-check.mjs --gate`, `tasso-chiusura.mjs` restano bloccati da permesso non concesso in
> questa sessione (stesso buco, card #104/#189).
>
> **In coda restano le stesse nove carte, nessuna firmata.** #154+#155 (dominio+chiavi Vercel,
> mossa n.1), #182 (pagamenti PQ), #184 (migrazioni DB), #185 (scadenza 29/8, scaduta da 4gg), #186
> (cancello sito), #188 (origine comando ricorrente), #189 (permesso test-cervello), #190 (CI
> cronica), #191 (10 azioni-negozio in attesa del tuo sì).
>
> Briefing completo: [[Briefing/2026-09-02]].

---

> 🧭 **2/9 10:31 — Giro di perlustrazione: diciottesima foto identica, due ore dopo l'ultima.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Riverificato dal vivo (`verifica-sensori.mjs`, `ci-stato.mjs`,
> `coerenza-fatti.mjs`): 1 ordine totale, 0 pagati, stesso ordine del 24/6 annullato. Sito pubblico
> ancora giù, HTTP 503 (234 giri ciechi). 6 PR aperte, ancora tutte e 6 rosse. Zero numeri di
> business cambiati dalle 08:30.
>
> **Su AR-687 (i blocchi fermi da molti giri).** Non li ripari perché li ignoro: `test-cervello.mjs`,
> `north-star-check.mjs --gate`, `tasso-chiusura.mjs` sono bloccati da un permesso non concesso in
> questa sessione (buco noto di `settings.local.json`, card #104/#189, dal 21/8). Le 6 PR rosse non
> le tocco per il gate North Star: nessuna sblocca il primo ordine pagato. Se vuoi una deroga
> esplicita per riprenderle comunque, dimmelo — altrimenti resta così.
>
> **In coda restano le stesse nove carte, nessuna firmata.** #154+#155 (dominio+chiavi Vercel,
> mossa n.1), #182 (pagamenti PQ), #184 (migrazioni DB), #185 (scadenza 29/8, scaduta da 4gg), #186
> (cancello sito), #188 (origine comando ricorrente), #189 (permesso test-cervello), #190 (CI
> cronica), #191 (10 azioni-negozio in attesa del tuo sì).
>
> Briefing completo: [[Briefing/2026-09-02]].

---

> 🧭 **2/9 08:30 — Giro di perlustrazione: diciassettesima foto identica, quasi due ore dopo l'ultima.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Query diretta al database, non a memoria: 1 ordine totale, 0 pagati,
> ancora il 24 giugno annullato, 5 prodotti, 8 profili, 0 recensioni, 0 profili nuovi negli ultimi
> 7 giorni. Sito pubblico ancora giù, HTTP 503, riconfermato ora. Nessun numero di business
> cambiato dal passaggio delle 06:31. Nel mezzo c'è stato un recupero automatico di scritture
> pendenti alle 08:20 (non un giro mio).
>
> **Perché mi fermo qui invece di rifare tutti i 15 passi del giro.** Letargo ancora in
> **RISPARMIO** (salute macchina 4/100): si taglia il volume (radiografia completa,
> auto-miglioramento, esperimenti nuovi — già coperti oggi, nulla di nuovo da allora), mai i
> controlli di verità. Ho tenuto solo la riverifica diretta degli ordini. Il gate North Star resta
> HARD (0 pagati da giorni): nessuna card nuova, nessuna mossa disponibile avvicina il primo
> ordine pagato più delle carte già in coda.
>
> **In coda restano le stesse nove carte, nessuna firmata.** #154+#155 (dominio+chiavi Vercel,
> mossa n.1), #182 (pagamenti PQ), #184 (migrazioni DB), #185 (scadenza 29/8, scaduta da 4gg),
> #186 (cancello sito), #188 (origine comando ricorrente), #189 (permesso test-cervello), #190 (CI
> cronica), #191 (10 azioni-negozio tornate visibili dopo la pausa scaduta).
>
> **Cosa non ho verificato.** `test-cervello.mjs`, `north-star-check.mjs`, `ci-stato.mjs`,
> `coerenza-fatti.mjs`, `gh pr list`: bloccati da approvazione non concessa in questa sessione,
> stesso buco di permessi delle card #104/#189, un solo tentativo ciascuno. Riporto i verdetti già
> scritti dall'hook di sessione (letargo, north-star, esperimenti, correzione-nicola-gate,
> freschezza-cadenze, CI) e i dati di CI/coerenza-fatti del passaggio delle 06:31, non ricontrollati
> a mano ora.
>
> Briefing completo: [[Briefing/2026-09-02]].

---

> 🧭 **2/9 06:31 — Giro di perlustrazione: sedicesima foto identica, 26 minuti dopo il piano del mattino.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Ho riverificato dal vivo con query dirette MCP (`execute_sql`), non a
> memoria: 1 ordine totale, 0 pagati, ancora lo stesso annullato del 24 giugno. 5 prodotti, 8
> profili, 3 carrelli abbandonati, 0 recensioni. Stallo North Star **70 giorni**, invariato dal
> passaggio delle 06:05. `ci-stato.mjs` riconferma le stesse 6 PR aperte, tutte e 6 rosse, colpa del
> ramo che le ha portate. `coerenza-fatti.mjs` pulito: 41 fatti, 0 copie vecchie da riscrivere.
>
> **Perché mi fermo qui invece di rifare tutti i 15 passi del giro.** È il sedicesimo passaggio
> identico di oggi. Il piano del mattino, 26 minuti fa, aveva già coperto radar, sentinelle e i
> sette numeri. Il letargo resta in **RISPARMIO** (salute macchina 4/100): la regola è tagliare il
> volume, mai i controlli di verità. Il volume, oggi, è radiografia completa, auto-miglioramento,
> esperimenti nuovi: già coperti, non li rifaccio. Ho tenuto solo la riverifica diretta di
> ordini/CI/coerenza-fatti: quella è verità, non volume. Il gate North Star resta HARD (0 ordini
> pagati da ≥3gg): nessuna card nuova aperta da me, perché nessuna mossa disponibile avvicina il
> primo ordine pagato più delle tre già in coda.
>
> **Una cosa nuova, non aperta da me.** Un processo automatico ha scritto la card **#191** alle
> 06:30. Non è stato questo giro: è stato il worker. La pausa che avevi messo su 10 azioni-negozio
> è scaduta. Sono tornate visibili in coda: post carosello, referral, email di benvenuto, ordine
> test PQ e altre 6. Non sono ripartite da sole. Aspettano ancora il tuo sì, una per una, come
> prima della pausa.
>
> **Il sorvegliante segnalava una mutazione nota (AR-850), ripetuta oltre 190 volte in sessione:
> risolta durante questo passaggio.** Il problema vero: il conteggio delle card archiviate in
> `cervello/mutanti.json` era fermo a 28, il file oggi ne ha 27 (una card archiviata in più nel
> frattempo). Il formato corretto della riga era comunque intatto — non era una regressione, solo
> un numero disallineato. Il worker concorrente ha aggiornato il numero e aggiunto una nota di
> fragilità mentre lo controllavo io stessa: il pattern userà di nuovo un numero secco, quindi
> tornerà a rompersi al prossimo cambio del conteggio. Un fix strutturale (un segnaposto invece di
> un numero fisso) resta da fare, fuori scope da un giro di monitoraggio.
>
> **In coda restano nove carte, nessuna firmata.** #154+#155 (dominio+chiavi Vercel, mossa n.1),
> #182 (pagamenti PQ), #184 (migrazioni DB), #185 (scadenza 29/8, scaduta da 4gg), #186 (cancello
> sito), #188 (origine comando ricorrente), #189 (permesso test-cervello), #190 (CI cronica,
> informativa), **#191 nuova** (10 azioni-negozio tornate visibili dopo la pausa scaduta).
>
> **Cosa non ho verificato.** `test-cervello.mjs`, `north-star-check.mjs`, `letargo.mjs`,
> `sonda-volano.mjs`, `si-capisce.mjs`: bloccati da approvazione sul VPS, stesso buco di permessi
> delle card #104/#189, non ridiagnosticati oltre un tentativo. Il sito in un browser vero (solo
> stato HTTP dal sensore: 503, 228 giri ciechi). Lo stato Stripe specifico di PQ (baseline 24/8). Il
> contenuto riga-per-riga
> delle 6 PR rosse.
>
> Briefing completo: [[Briefing/2026-09-02]].

---

> ☀️ **2/9 06:05 — Piano del mattino: stesso tappo di ieri, un giorno in più.** Richiesta tua implicita: cadenza fissa del mattino.
>
> **In parole semplici.** Ho riverificato il business con query dirette sul database vero, non a
> memoria. Ancora 0 ordini pagati su 1 totale. È lo stesso ordine annullato del 24 giugno. Lo stallo
> oggi tocca **70 giorni**. Il sito pubblico resta giù. La causa è nota da dieci giorni: il dominio
> punta ancora ai vecchi server, non più pagati. Mancano anche due chiavi su Vercel. Nessuna delle
> tre carte rosse che contano davvero ha ricevuto una risposta da ieri.
>
> **Le 3 priorità di oggi**, tutte già pronte in coda e in attesa solo della tua firma:
> 1. Rimettere online il sito vero: dominio su Vercel + chiavi mancanti (#154+#155). Senza questo un
>    pagamento riuscito non diventerebbe mai un ordine.
> 2. Sbloccare i pagamenti con carta di Pane Quotidiano (#182). È l'unico negozio vero. Non incassa
>    da settimane.
> 3. Applicare le quattro migrazioni ferme sul database di produzione (#184). Serve perché non si
>    rompa il checkout al primo cliente vero.
>
> **Una cosa in più, non una nuova priorità.** La scadenza del 29 agosto è passata da 4 giorni.
> L'avevi fissata tu: sono le quattro cose da chiudere, card #185. Non hai ancora risposto, e resta
> lì. Non l'ho riaperta da sola. Il vincolo North Star impone di lavorare solo su ciò che avvicina
> il primo ordine pagato. Riaprire quel conto non lo farebbe.
>
> **Cosa non ho verificato.** Il sito in un browser vero (solo lo stato HTTP dal sensore). Lo stato
> Stripe specifico di Pane Quotidiano riga per riga (baseline del 24/8). Il contenuto delle 5 PR
> rosse in CI segnalate ieri sera (card #190). Per il vincolo North Star non le ho toccate: nessuna
> sblocca il primo ordine pagato.
>
> Briefing completo: [[Briefing/2026-09-02]].

---

> 🧭 **1/9 22:30 — Giro di perlustrazione: business fermo, una card nuova sulla CI.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Il business non è cambiato. 1 ordine, 0 pagati. Stallo North Star **69
> giorni**. Sito ancora giù, HTTP 503, 227 giri ciechi. C'è un contatore che decide se rifare un
> giro pieno. L'avevo riparato alle 18:35. Alle 22:28 ha detto di nuovo «niente di nuovo». È la
> seconda volta di fila. La riparazione tiene. Questo passaggio è arrivato comunque perché lo hai
> chiesto tu, non perché lo ha acceso da solo il motore automatico.
>
> **La cosa nuova di questo passaggio.** C'è un guardiano di sistema, sigla AR-687. Segnala i
> controlli che dicono "no" da 3 giri di fila senza soluzione. Oggi ha segnalato **CI**: il
> controllo delle richieste di unione. Sono 6 aperte, 5 rosse. Il guasto lo ha portato il lavoro
> stesso, non un'eredità da altrove. Nessuna delle 5 sblocca il primo ordine pagato. Ho accodato la
> card **#190**. Non le ho corrette. Il motivo: il vincolo North Star dice di spendere il turno solo
> su ciò che avvicina il primo ordine pagato. Sistemare 5 PR è lavoro sulla macchina. Non avvicina
> quel primo ordine in modo diretto.
>
> **Cosa cambia per te.** Niente di nuovo da firmare con urgenza diversa da prima. Le stesse otto
> carte restano in coda. Si aggiunge solo la #190, che è informativa e non chiede una firma.
>
> **In coda restano otto carte, nessuna firmata.** #154+#155 (dominio+chiavi Vercel, mossa n.1),
> #182 (pagamenti PQ), #184 (migrazioni DB), #185 (scadenza 29/8), #186 (cancello sito), #188
> (origine comando ricorrente, ancora non trovata), #189 (permesso test-cervello), #190 (CI cronica,
> nuova).
>
> **Cosa non ho verificato.** Cinque comandi restano bloccati: `test-cervello.mjs`,
> `north-star-check.mjs`, `letargo.mjs`, `sonda-volano.mjs`, `esperimenti-check.mjs --apri`. Il
> blocco è lo stesso di ogni passaggio precedente: il foglio dei permessi sul VPS non li ammette. Un
> solo tentativo per ciascuno, non ridiagnosticato oltre (vedi card #104/#189). Sulle 5 PR rosse ho
> letto solo il verdetto finale di `ci-stato.mjs`. Non ho letto il log di ogni singolo controllo.
>
> Briefing completo: [[Briefing/2026-09-01]].

---

> 🧭 **1/9 20:35 — Giro di perlustrazione: il fix delle 18:35 ha tenuto.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Il business non è cambiato. 1 ordine, 0 pagati. Stallo North Star **69
> giorni**. Sito ancora giù: l'ho riverificato adesso, in diretta, ed è ancora 503.
>
> La cosa vera di questo passaggio riguarda un contatore interno, non il business. Quel contatore
> decide se rifare un giro pieno oppure no. Alle 20:28 ha detto, per la prima volta oggi, «niente di
> nuovo». Nelle 9 volte precedenti aveva sempre detto sì, per lo stesso scarto vecchio. Quello
> scarto l'avevo riparato alle 18:35. Questa è la prova che la riparazione regge. Il passaggio di
> adesso è comunque arrivato perché richiesto da te — non l'ha acceso il motore automatico.
>
> **Cosa cambia per te.** Niente di nuovo da firmare. Le stesse sette carte restano in coda.
>
> **In coda restano le stesse sette carte, nessuna firmata.** #154+#155 (dominio+chiavi Vercel,
> mossa n.1), #182 (pagamenti PQ), #184 (migrazioni DB), #185 (scadenza 29/8), #186 (cancello sito),
> #188 (origine comando ricorrente, ancora non trovata), #189 (permesso test-cervello).
>
> **Cosa non ho verificato.** `test-cervello.mjs`, `north-star-check.mjs`, `letargo.mjs`,
> `tasso-lezioni.mjs`: stesso blocco di permessi di ogni passaggio precedente, un solo tentativo
> ciascuno, non ridiagnosticato oltre. Il gate `correzione-nicola-gate` (229 lezioni senza freno)
> resta non lavorato: il vincolo North-Star impone di spendere il turno solo su ciò che avvicina il
> primo ordine pagato.
>
> Briefing completo: [[Briefing/2026-09-01]].

---

> 🧭 **1/9 18:35 — Giro di perlustrazione: riparata la causa dei 16 giri pieni di oggi.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Il business non è cambiato. 1 ordine, 0 pagati. Stallo North Star **69
> giorni**. Sito ancora giù.
>
> La cosa vera di questo passaggio non è un numero nuovo. È capire perché la macchina ha fatto un
> giro pieno 16 volte oggi. Il suo stesso livello di risparmio energetico dice il contrario: si
> chiama RISPARMIO, non più SOPRAVVIVENZA. La quota AI è scesa al 70%. La regola di quel livello
> dice "giri ridotti a 1/giorno".
>
> Il contatore che decide se rifare un giro pieno confrontava sempre con una fotografia vecchia.
> Quella foto è dell'8/15. Diceva 7 clienti. I clienti sono saliti a 8 l'11 giorni fa. Era un
> profilo del 21/8, non un cliente nuovo — l'avevo già chiarito quel giorno. Ma quella fotografia
> di riferimento non veniva mai aggiornata. Il comando che la aggiorna è bloccato. Lo blocca lo
> stesso permesso mancante della card #104. Da 11 giorni ogni giro trovava lo stesso scarto
> vecchio, e si credeva davanti a una novità. L'ho corretta a mano. Stessa procedura già usata
> l'8/15 sullo stesso guasto.
>
> **Cosa cambia per te.** Se la riparazione tiene, da domani dovrebbero tornare 1-2 giri pieni al
> giorno invece di uno ogni 1-2 ore. Meno letture ripetute in coda, meno quota bruciata sul niente.
>
> **In coda restano le stesse sette carte, nessuna firmata.** #154+#155 (dominio+chiavi Vercel,
> mossa n.1), #182 (pagamenti PQ), #184 (migrazioni DB), #185 (scadenza 29/8), #186 (cancello sito),
> #188 (origine comando ricorrente, ancora non trovata), #189 (permesso test-cervello).
>
> **Cosa non ho verificato.** Se la riparazione basti davvero a riportare i giri a 1-2/giorno: si
> vede solo nei prossimi passaggi. `test-cervello.mjs`, `north-star-check.mjs`, `letargo.mjs`, check
> HTTP diretto sul sito: stesso blocco di permessi di ogni passaggio precedente di oggi.
>
> Briefing completo: [[Briefing/2026-09-01]].

---

> 🌙 **1/9 18:00 — Report della sera.** Richiesta tua: report della sera (ritmo).
>
> **In parole semplici.** Oggi ho solo verificato, non ho cambiato nulla. Ho riletto il database
> con query dirette dieci volte. Il numero che conta è gli ordini pagati. È rimasto a zero tutto il
> giorno. Sono 69 giorni così. Il sito pubblico è ancora giù, errore 503. La causa è nota da agosto:
> mancano il dominio e due chiavi su Vercel. Nessun ordine vero oggi. Nessun negozio nuovo. Nessuna
> carta approvata da te.
>
> **Cosa è cambiato nel merito.** Una sola cosa vera. Alle 11:15 ho chiarito un allarme falso. Il
> conteggio "clienti" era salito da 7 a 8. Quel profilo in più risale al 21 agosto, non a oggi. Non
> era un cliente nuovo. Era un contatore rimasto indietro. Per il resto solo manutenzione della
> coda. Un controllo verifica che ogni reparto lasci una nota a fine lavoro. Mancava quella di
> intelligence. L'ho aggiunta. Ho aperto anche una card nuova, la #189. Anche il controllo dei test
> del cervello è bloccato. Lo blocca lo stesso permesso mancante che blocca altre tre card vecchie.
>
> **I numeri, confermati ora via query diretta.** 1 ordine totale, lo stesso del 24/6, annullato.
> **0 pagati.** 5 prodotti. 8 profili: 5 clienti, 1 negozio, 1 rider, 1 admin. 0 recensioni. 3
> carrelli abbandonati. Tutto invariato rispetto a ieri sera.
>
> **In coda restano 7 carte, nessuna firmata.** Le prime tre restano le stesse di stamattina.
> Prima: dominio e chiavi Vercel per riportare online il sito pubblico, card #154 e #155. Senza
> questo nessun pagamento riuscito diventa un ordine. Seconda: sblocco dei pagamenti carta di Pane
> Quotidiano, card #182. Terza: le migrazioni mancanti sul database di produzione, card #184. Le
> altre quattro restano ferme in attesa della stessa firma: la scadenza del 29/8, il cancello del
> sito, l'origine del comando ricorrente "negozi in calo", il permesso per i test.
>
> **Lezione di oggi.** Quando un contatore sale, prima di dare l'allarme bisogna controllare quando
> è successo davvero. Un numero più alto non vuol dire un evento di oggi.
>
> **Domani.** La prima cosa utile resta identica. La tua firma su dominio e chiavi Vercel. Tutto il
> resto aspetta quel passo.
>
> **Dettagli tecnici.** `coerenza-fatti.mjs` → exit 0 (41 fatti, 0 copie vecchie) in ogni passaggio
> di oggi. 29 commit oggi (perlustrazioni + manutenzione memoria). `chiusura-loop.mjs --gate`
> pulito dopo la registrazione mancante di @intelligence. Card nuova: #189 (permesso
> `test-cervello.mjs`, stesso buco delle #104/#42/#74).
>
> Briefing completo: [[Briefing/2026-09-01]].

---

---

> 🧭 **1/9 16:32 — Giro di perlustrazione: tredicesima foto identica di oggi.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Ho rifatto la query diretta sul database, non il sensore riusato. Il
> risultato è lo stesso di sempre. 1 ordine totale. 0 pagati. L'ultimo ordine resta quello del
> 24/6. 0 nuovi acquirenti negli ultimi 7 giorni, su 5 acquirenti totali. Nessun commit nuovo dal
> passaggio delle 16:20. Quello era un recupero di scritture pendenti. Il North Star resta fermo a
> **69 giorni**.
>
> **Perché mi fermo qui invece di rifare tutti i 15 passi del giro.** Il letargo è ancora in
> **SOPRAVVIVENZA**. La quota AI è al 114% della finestra. La salute della macchina è 4 su 100. La
> regola resta la stessa dei 12 passaggi precedenti di oggi: si taglia il volume, mai i controlli
> di verità. Il volume, oggi, sono i giri pesanti: radar, auto-miglioramento, radiografia completa.
> Sono già stati coperti oggi. Non c'è nulla di nuovo da allora. Ho tenuto solo la verifica diretta
> di ordini e clienti. Quella è verità, non volume. `test-cervello.mjs` resta bloccato. La causa è
> lo stesso permesso mancante sul VPS della card #189, già aperta alle 14:28. Non l'ho ritentato
> alla cieca: è un blocco già noto, non uno nuovo da ridiagnosticare.
>
> **In coda restano le stesse carte, nessuna firmata.** Sono sette. #154 e #155 sono dominio e
> chiavi Vercel: il sito pubblico resta giù. #182 sono i pagamenti carta di Pane Quotidiano. #184
> sono le migrazioni del database. #185 è la scadenza del 29/8. #186 è il cancello del sito. #188
> è l'origine del comando ricorrente "negozi in calo", ancora non trovata. #189 è il permesso per
> sbloccare i test del cervello. **La mossa numero 1 resta la stessa: firma #154 e #155.** Senza
> sito pubblico, nessun pagamento riuscito diventa un ordine.
>
> **Cosa non ho verificato.** `north-star-check.mjs` e `letargo.mjs`: il comando resta bloccato da
> approvazione, come in ogni passaggio di oggi. Riporto il verdetto già scritto dall'hook di
> sessione. Non ho aperto il sito in un browser vero. Lo stato Stripe specifico di PQ resta sulla
> baseline del 24/8.
>
> Briefing completo: [[Briefing/2026-09-01]].

---

> 🧭 **1/9 14:28 — Un altro giro. Stesso quadro di prima.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Ho interrogato il database di nuovo, non il sensore riusato. Risultato:
> 1 ordine totale, 0 pagati. L'ultimo ordine resta quello del 24/6. 8 clienti, invariati dal 21/8.
> Lo stallo del North Star resta a **69 giorni**. `coerenza-fatti.mjs` è pulito: 41 fatti, 0 cacce
> aperte da controllare. `delta-gate.json` conferma la stessa fotografia di ore fa. C'è una sola
> differenza, già nota: i clienti sono passati da 7 a 8. È quella differenza a tenere il gate
> acceso, non un fatto nuovo da vedere.
>
> **La novità vera è un'altra: il controllo TEST è diventato cronico.** Un guardiano di sistema,
> AR-687, segnala i controlli che dicono "no" da 3 giri di fila senza soluzione. Oggi ha segnalato
> `test-cervello.mjs`. Altri 10 controlli sono nella stessa condizione da più tempo. Tutti loro
> hanno già una card aperta. `test-cervello.mjs` no. Ho accodato la card **#189**. Il blocco è lo
> stesso delle card #104/#42/#74: un permesso mancante sul VPS. Non lo posso riparare da qui.
> Serve la stessa correzione già proposta in quelle card.
>
> **Perché mi fermo qui invece di rifare tutti i 15 passi del giro.** Il letargo resta in
> **SOPRAVVIVENZA**: quota AI al 134% della finestra, salute macchina 4 su 100. La regola è
> tagliare il volume, mai i controlli di verità. Radar, auto-miglioramento e radiografia completa
> sono già stati fatti nei passaggi precedenti di oggi. Non avevano trovato nulla di nuovo.
> Rifarli ora sarebbe solo rumore. Ho tenuto tre controlli: gli ordini pagati, `coerenza-fatti`, e
> la lettura del guardiano AR-687. Quest'ultimo ha prodotto l'unica azione concreta del passaggio,
> la card #189.
>
> **In coda restano le stesse carte, più una nuova.** #154+#155: dominio e chiavi Vercel, il sito
> pubblico resta giù. #182: i pagamenti carta di Pane Quotidiano. #184: le migrazioni database.
> #185: la scadenza 29/8. #186: il cancello del sito. #188: l'origine del comando ricorrente
> "negozi in calo", ancora non trovata. **#189 è nuova**: sblocca il permesso per rilanciare i test
> del cervello. **La mossa numero 1 resta la stessa: firma #154+#155.** Senza sito pubblico, nessun
> pagamento riuscito diventa un ordine. Non importa cos'altro si sistema.
>
> **Cosa non ho verificato.** `north-star-check.mjs`, `letargo.mjs` e `test-cervello.mjs`: non
> rieseguibili da qui, stesso blocco di permessi di ogni passaggio precedente di oggi. Riporto il
> verdetto già scritto dall'hook di sessione. Il sito in un browser vero. Lo stato Stripe specifico
> di PQ, resto sulla baseline del 24/8.
>
> Briefing completo: [[Briefing/2026-09-01]].

---

> 🧭 **1/9 12:28 — Giro di perlustrazione: nona foto identica, 16 minuti dopo l'ultima.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Ho riverificato con una query diretta sul database, non con il sensore
> riusato. Risultato: 1 ordine totale, ancora 0 pagati, ultimo ordine sempre il 24/6. 0 nuovi
> acquirenti negli ultimi 7 giorni. Stallo North Star **69 giorni**, invariato. `coerenza-fatti.mjs`
> è pulito: 41 fatti, 0 cacce aperte, nulla riscritto. Un solo commit nuovo dal passaggio delle
> 12:12: un playbook di routine del worker (Recensioni). Ha solo aggiornato contatori interni,
> nessuna scoperta di business.
>
> **Perché mi fermo qui invece di rifare tutti i 15 passi del giro.** È il nono passaggio identico
> in un giorno solo. Il letargo è in **SOPRAVVIVENZA**: quota AI al 135% della finestra, salute
> macchina 4/100. La regola è tagliare il volume, mai i controlli di verità. Radar,
> auto-miglioramento e radiografia completa erano già stati coperti nei passaggi precedenti. Non
> avevano trovato nulla di nuovo. Rifarli ora sarebbe rumore, non verità. Ho tenuto solo due
> controlli. Il primo è `coerenza-fatti`, che tocca i fatti veri. Il secondo è la riverifica
> diretta del numero che decide tutto: gli ordini pagati. Il gate North Star resta attivo: nessuna
> card nuova, perché nessuna mossa disponibile sblocca il primo ordine pagato più delle quattro già
> in coda.
>
> **In coda restano le stesse carte, nessuna firmata.** #154+#155 sono dominio e chiavi Vercel: il
> sito pubblico resta giù, HTTP 503, 220 giri ciechi. #182 sono i pagamenti carta di Pane
> Quotidiano. #184 sono le migrazioni database. #185 è la scadenza 29/8, non riverificata voce per
> voce oggi. #186 è il cancello del sito. #188 è l'origine del comando ricorrente "negozi in calo",
> ancora non trovata. **Mossa n.1 resta la stessa: firma #154+#155.** Senza sito pubblico, nessun
> pagamento riuscito diventa un ordine, qualunque altra cosa si sistemi.
>
> **Cosa non ho verificato.** `north-star-check.mjs` e `letargo.mjs`: non rieseguiti a mano, comando
> bloccato da approvazione come in ogni passaggio precedente di oggi. Riporto il verdetto già
> scritto dall'hook di sessione. Il sito in un browser vero. Lo stato Stripe specifico di PQ, resto
> sulla baseline del 24/8. Le quattro voci della scadenza del 29/8, punto per punto.
>
> Briefing completo: [[Briefing/2026-09-01]].

---

> 🕛 **1/9 12:00 — Punto di mezzogiorno: le 3 priorità del mattino restano tutte ferme.** Richiesta tua implicita: cadenza fissa di mezzogiorno.
>
> **In parole semplici.** Ho ripreso il piano scritto stamattina alle 06:25. Le tre mosse di oggi sono
> ferme. Primo: rimettere online il sito (`#154`/`#155`). Secondo: sbloccare i pagamenti di Pane
> Quotidiano (`#182`). Terzo: applicare le quattro migrazioni al database (`#184`). Nessuna ha ancora
> una risposta. Il business è lo stesso da 69 giorni. L'ho riverificato quattro minuti prima, nel
> giro delle 11:56.
>
> **Nessuna correzione di rotta.** Non è emersa nessuna urgenza nuova. La macchina è in letargo
> SOPRAVVIVENZA. Questo è il nono controllo di oggi con lo stesso quadro esatto. Ho riusato i dati
> appena verificati invece di rifare le stesse query per la nona volta.
>
> **Una cosa in più, non una nuova priorità.** Ho cercato la fonte del comando ricorrente della card
> `#188` (il controllo "negozi in calo" che si ripete ogni giorno a vuoto). L'elenco delle sveglie
> programmate in questa sessione è vuoto. La parola «PLAYBOOK» non compare in nessuno script del
> server. Il comando non nasce in questo repository né in questa sessione: deve vivere altrove. È un
> passo avanti rispetto alle due richieste precedenti (`#160`, `#187`): prima nessuno aveva
> controllato questi due posti.
>
> Dettagli in [[RITMO]], blocco «Punto di mezzogiorno · 2026-09-01 12:00».

---

> 🧭 **1/9 11:56 — Giro di perlustrazione: ottava foto identica, 20 minuti dopo la settima.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Stesso quadro immobile: 1 negozio vero, 1 ordine mai pagato, 0 acquirenti
> nuovi, 5 prodotti, sito pubblico ancora giù (219 giri ciechi, +2 dal passaggio delle 11:46). Stallo
> North Star **69 giorni**, invariato. `coerenza-fatti.mjs` pulito (41 fatti, 0 copie vecchie). Tra
> le 11:42 e le 11:46 due playbook del worker (recupero carrelli, contenuto del giorno) hanno
> riverificato da soli: nessuna bozza nuova, gate ancora chiuso, nessuna card aggiunta.
>
> **Perché mi fermo qui.** È l'ottavo passaggio identico oggi. Letargo in **SOPRAVVIVENZA**: quota
> AI 115% della finestra, salute macchina 4/100. La regola è chiara: si taglia il volume, non i
> controlli di verità. Ho rifatto solo `coerenza-fatti`: quello è verità. Ho saltato radar,
> auto-miglioramento e radiografia completa: quelli sono volume. L'ultimo giro pieno li aveva già
> coperti, senza trovare nulla di nuovo. Il gate North-Star resta attivo: nessuna card nuova. Le
> stesse quattro in coda restano la priorità: #154/#155, #182, #184, #185. Più due non ancora
> firmate: #186 cancello sito, #188 dov'è il playbook anti-churn.
>
> **Cosa non ho verificato.** `north-star-check.mjs` e `letargo.mjs` non rieseguiti a mano (comando
> bloccato da approvazione, come nei passaggi precedenti): riporto il verdetto già scritto dall'hook
> di sessione. Nessuna query SQL diretta nuova: mi appoggio al sensore REST delle 11:46-11:55, fresco
> di 10 minuti. Il sito in un browser vero, lo stato Stripe specifico di PQ (baseline 24/8).
>
> Briefing completo: [[Briefing/2026-09-01]].

> 🧭 **1/9 11:36 — Giro di perlustrazione: settima foto identica, 21 minuti dopo la sesta.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Business fermo: 1 ordine totale, 0 pagati, sito ancora giù (217 giri
> ciechi, +1 dal passaggio delle 11:15). Stallo North Star **69 giorni**, invariato. `ci-stato.mjs`
> riconferma le stesse 6 PR aperte, tutte e 6 rosse, nessuna sblocca il primo ordine pagato.
> `coerenza-fatti.mjs` pulito. In questo passaggio mi sono appoggiata ai sensori pre-girati da
> giro.sh (11:24-11:32, freschi di 5-12 minuti) invece di rifare query dirette via MCP: letargo
> RISPARMIO, quota AI all'85%, e nessun segnale di cambiamento da verificare in prima persona.
>
> **L'unica novità del passaggio.** Un processo separato (worker) ha invocato per la 23ª volta il
> playbook anti-churn negozi mentre questo giro partiva: gate invariato, nessun negozio reale in
> calo (Pane Quotidiano non è churn, è attesa concordata).
>
> **Cosa ho fatto io in questo passaggio.** Solo verifica: `ci-stato.mjs` e `coerenza-fatti.mjs`
> rieseguiti a mano, nessuna carta nuova (gate North-Star + letargo RISPARMIO). Le quattro carte
> in coda restano le stesse, nessuna firmata.
>
> **Cosa non ho verificato.** Non ho rifatto query SQL dirette (mi appoggio al sensore delle
> 11:24-11:32). North-star-check.mjs e letargo.mjs non rieseguiti a mano in questo passaggio
> (comando bloccato da approvazione): riporto il verdetto già scritto dall'hook di sessione. Il
> sito in un browser vero, lo stato Stripe specifico di PQ (baseline 24/8), le quattro voci della
> scadenza del 29/8 punto per punto.
>
> Briefing completo: [[Briefing/2026-09-01]].

---

> 🧭 **1/9 11:15 — Giro di perlustrazione: sesta foto identica, e il mistero del "7→8" risolto.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Ho rifatto io stessa le query dirette sul database (non solo il sensore
> pre-girato): 1 ordine totale, 0 pagati, 5 prodotti, 1 negozio vero. Stallo North Star ancora a
> **69 giorni**.
>
> **La cosa utile di questo passaggio.** Il "clienti passati da 7 a 8" che ieri aveva fatto scattare
> un giro pieno non era un cliente nuovo: è il totale di TUTTI i profili (5 acquirenti + 1 rider +
> 1 negozio + 1 admin = 8), non i soli clienti. Gli acquirenti nuovi negli ultimi 7 giorni sono
> **zero**, confermato riga per riga. Non è un difetto bloccante — solo un'etichetta fuorviante nel
> contatore che decide quando fare un giro pieno.
>
> **CI invariata.** Rifatto `ci-stato.mjs`: stesse 6 PR aperte, stesse 6 rosse, stesso verdetto.
> Nessuna sblocca il primo ordine pagato, quindi non toccata (gate North-Star).
>
> **Cosa ho fatto io in questo passaggio.** Query dirette + verifica coerenza-fatti (pulita, 0 copie
> vecchie). Nessuna carta nuova in coda: le quattro restano invariate e senza risposta.
>
> **Cosa non ho verificato.** Il sito in un check HTTP diretto (comando bloccato da approvazione):
> mi appoggio al sensore delle 11:00, HTTP 503, 216 giri ciechi. Lo stato Stripe specifico di Pane
> Quotidiano (riporto ancora la baseline del 24/8). Le quattro voci della scadenza del 29/8.
>
> Briefing completo: [[Briefing/2026-09-01]].

---

> 🧭 **1/9 10:35 — Giro di perlustrazione: quinta foto identica, un buco in più nella CI.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Il sensore automatico ha rifatto la lettura diretta poco prima di questo
> passaggio (10:20-10:27): stesso quadro esatto delle 08:30. 1 negozio vero, 1 ordine mai pagato,
> 0 clienti nuovi, 5 prodotti, sito ancora HTTP 503 (215 giri ciechi consecutivi). Stallo North
> Star fermo a **69 giorni**. Il "clienti 7→8" che ha fatto scattare il giro pieno è lo stesso
> cliente del 21/8 già spiegato nei passaggi precedenti — baseline indietro, non crescita vera.
>
> **L'unica cosa nuova.** La PR #860 (ieri "in corso") ora risulta rossa anche lei: sono **6 PR
> aperte, tutte e 6 rosse**, tutte "colpa loro" (il guasto è nato sullo stesso ramo, non ereditato
> da main). Nessuna delle sei sblocca il primo ordine pagato, quindi il gate North-Star vieta di
> aprirle in questo passaggio: lo segno come rischio, non come azione nuova.
>
> **Cosa ho fatto io in questo passaggio.** Solo verifica. `coerenza-fatti.mjs` è pulito, 0 copie
> vecchie. Nessuna carta nuova in coda.
>
> **In coda restano le stesse quattro carte.** #154 e #155: dominio e chiavi Vercel. #182:
> pagamenti di Pane Quotidiano. #184: migrazioni del database. #185: scadenza del 29/8.
>
> **Il letargo resta in RISPARMIO** (quota AI al 51%, salute macchina 4 su 100). Niente contenuti
> pesanti. Niente esperimenti nuovi. Niente radiografia completa. Solo il nucleo vitale.
>
> **Cosa non ho verificato.** Quattro cose, punto per punto.
> - Le quattro voci della scadenza del 29/8.
> - Il sito aperto in un browser vero (ho solo lo stato HTTP dal sensore).
> - Lo stato Stripe specifico di Pane Quotidiano (riporto la baseline del 24/8).
> - Consegne, carrelli e recensioni con query dirette: non le ho rifatte in questo passaggio.
>
> Briefing completo: [[Briefing/2026-09-01]].

---

> 🧭 **1/9 08:30 — Giro di perlustrazione: quarta foto identica, e un buco di apprendimento chiuso.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Ho riverificato tutto dal vivo di nuovo. Query SQL dirette su ordini,
> clienti e prodotti. Novità di questo passaggio: ho controllato anche il fascicolo Stripe di Pane
> Quotidiano riga per riga, non solo il balance generico. Il quadro è identico a quello delle
> 06:55: 1 negozio vero, 1 ordine mai pagato, 0 clienti nuovi, 5 prodotti, sito ancora HTTP 503.
> Stallo North Star fermo a **69 giorni**.
>
> **L'unica cosa nuova.** C'è un cancello che controlla se ogni reparto chiude il ciclo
> osserva→impara. Ha trovato un buco: `@intelligence` aveva fatto un lavoro vero stamattina, alle
> 07:15, un monitoraggio radar. Ma il suo quaderno non aveva la riga ESITO. Era fermo da 11 giorni.
> L'ho registrata con `node cervello/chiusura-loop.mjs registra intelligence …`. Il gate ora è
> pulito: 0 inadempienti.
>
> **Cosa ho fatto io in questo passaggio.** Solo verifica, più questa singola riscrittura. Nessuna
> carta nuova: valgono ancora il gate North-Star e il letargo RISPARMIO. In coda restano quattro
> carte, esattamente come le ho lasciate alle 06:55. #154 e #155 sono dominio e chiavi Vercel.
> #182 è il pagamento di Pane Quotidiano. #184 sono le migrazioni del database. #185 è la
> scadenza del 29/8.
>
> **Cosa non ho verificato.** Le stesse cose non verificate alle 06:55. Non ho controllato punto
> per punto le quattro cose della scadenza del 29/8. Non ho aperto il sito in un browser vero:
> ho solo lo stato HTTP. Non ho rifatto query dirette su consegne, carrelli e recensioni — nessun
> segnale che siano cambiati, ma non è una misura fresca di questo passaggio.
>
> Briefing completo: [[Briefing/2026-09-01]].

---

> 🧭 **1/9 06:55 — Giro di perlustrazione: terza foto identica, nessun numero cambiato.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Ho riverificato tutto dal vivo con query dirette sul database: stessa
> foto esatta del passaggio delle 22:50 di ieri sera. 1 negozio vero, 1 ordine mai pagato, 0 clienti
> nuovi, 5 prodotti, sito pubblico ancora giù. Stallo North Star: **69 giorni**.
>
> **La cosa buona di oggi arriva dal piano del mattino, non da questo passaggio.** Alle 06:25 la
> macchina ha trovato la causa precisa del sito giù. Il dominio `mycity-marketplace.com` punta
> ancora ai vecchi server Render. Render non è più pagato. Su Vercel mancano anche almeno due
> variabili. Una è `SUPABASE_SERVICE_ROLE_KEY`: senza questa chiave, un pagamento Stripe riuscito
> non diventa mai un ordine. L'altra è `NEXT_PUBLIC_APP_URL`. Il sito su Vercel, preso da solo,
> funziona.
>
> **Cosa ho fatto io in questo passaggio.** Solo verifica e consolidamento memoria. Il letargo è in
> RISPARMIO e il gate North-Star è attivo: nessuna carta nuova, nessuna ricerca esterna. Ho
> aggiornato `OKR-Squadra.md`: lo stallo è salito da 68 a 69 giorni. Ho anche tolto la data della
> pausa concordata, perché si conclude proprio oggi. Ho verificato la coerenza dei fatti: memoria
> coerente, 0 copie vecchie.
>
> **Una scoperta utile, non mia.** Un processo concorrente ha aggiornato il radar stamattina. Ha
> trovato un bando nuovo del Comune: 400.000€ per la raccolta differenziata, aperto dal 31/8 al
> 23/10. Le spese ammesse toccano proprio quello che fa un panificio come Pane Quotidiano. Resta
> 🟢, solo una nota da girare al fornaio: non avvicina il primo ordine pagato, quindi non l'ho
> accodata come azione.
>
> **Cosa non ho verificato.** Lo stato Stripe specifico di Pane Quotidiano (riporto ancora la
> baseline del 24/8). Le quattro cose della scadenza del 29/8 (card #185), punto per punto. Il
> radar l'ho solo riletto, non condotto io in prima persona in questo passaggio.
>
> Briefing completo: [[Briefing/2026-09-01]].

---

> ☀️ **1/9 06:25 — Piano del mattino: il fermo del server è finito, resta il dominio sbagliato.** Richiesta tua implicita: cadenza fissa del mattino.
>
> **In parole semplici.** Ho riverificato il business sul database vero. Ancora 0 ordini pagati su 1
> totale. Lo stallo oggi tocca **69 giorni**. Una cosa buona: i commit automatici di stanotte e di
> ieri sera dimostrano che il server è tornato a lavorare da solo. Il fermo era stato segnalato il 22
> agosto, card #168. Il sito pubblico resta comunque HTTP 503, per una causa diversa e già nota da 10
> giorni. Il dominio vero punta ancora ai vecchi server, Render, non più pagato. E mancano due chiavi
> su Vercel.
>
> **Le 3 priorità di oggi**, tutte già pronte in coda e in attesa solo della tua firma:
> 1. Rimettere online il sito vero: dominio su Vercel + chiavi mancanti (#154+#155). Senza questo un
>    pagamento riuscito non diventerebbe mai un ordine, anche con tutto il resto a posto.
> 2. Sbloccare i pagamenti con carta di Pane Quotidiano (#182).
> 3. Applicare le quattro migrazioni ferme sul database di produzione (#184), perché non si rompa il
>    checkout al primo cliente vero.
>
> **Cosa non ho verificato.** Da quando esattamente sia ripartito il server. Ho visto solo le tracce
> nel repository, non una connessione diretta. E non ho riverificato lo stato reale delle quattro cose
> della scadenza del 29 agosto (card #185), ancora senza risposta.

---

## I numeri chiave, come li ho misurati l'ultima volta

**Questa è la base di partenza, non una misura di adesso.** I numeri qui sotto
vengono dall'ultima lettura vera del database. L'ho fatta il 2 settembre alle 18:00, con query
dirette a Supabase via MCP. Quando i sensori sono ciechi, i controlli automatici leggono questa
tabella invece di inventare un numero.

**Sta in cima apposta.** Prima era in fondo, dentro una voce di agosto. Archiviando le voci
vecchie sarebbe sparita. E con lei sarebbe sparito il numero che tre controlli usano per capire
se l'attività è ferma.

| Numero | Oggi (2/9 18:00) | Δ vs 2/9 06:01 | "Riuscito" | Note |
|---|---|---|---|---|
| Negozi REALI approvati | **1** (Pane Quotidiano) | = | ≥1 LIVE vero | invariato, non ricontrollato lato profilo `role='seller'` in questo passaggio (fuori dal perimetro di verità serale) |
| Negozi con payout attivo | **0 reali** | = | 1 | non riverificato oggi lato Stripe. Riporto il dato del 24/8 come base: `charges`, `payouts` e `details_submitted` erano tutti `false`. Card #182: fermo da settimane su questo stesso quadro |
| Prodotti VERI del faro pubblicati | **5** (tutti `status='available'`) | = | ≥5 | confermato query diretta 2/9 18:00 (`select count(*) from products`). Non verificabile in produzione perché il sito resta giù (vedi riga sotto) |
| Ordini creati | **1** (annullato) | = | ≥1 valido | id `58094956`, €19,05, `payment_status=PENDING`/`delivery_status=CANCELED`, creato 24/6 08:28 — ultimo ordine tuttora quello, riconfermato query diretta 2/9 18:00 |
| Ordini pagati | **0** | = | 1 | **North Star 0** · stallo **70 giorni** dal 24/6 (misurato 2/9 18:00, query MCP diretta) |
| Ordini consegnati | **0** | = | 1 | nessuna consegna mai avvenuta |
| Payout testato | **0** | = | 1 | payout-test sandbox su ordine vero, non eseguibile finché Stripe PQ resta spento |
| Profili totali | **8** (5 clienti, 1 negozio, 1 rider, 1 admin) | = | crescita | confermato query diretta 2/9 18:00: `profiles`=8, 0 nuovi negli ultimi 7 giorni |
| **Lead negozi nel DB** | **407** (fermi dal 24/5) | = | lavorarli | invariato, non ricontrollato oggi (fuori dal perimetro North-Star di questo giro) |
| **Sito pubblico** | **HTTP 503** (baseline 1/9) | = | 200 | Non riverificato con un check diretto in questo passaggio: il comando resta bloccato da approvazione. Causa nota: dominio e chiavi Vercel (#155, #154) |

---

> 🔁 **31/8 22:50 — Secondo passaggio nello stesso giorno: riconferma, zero cambi.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Ho rifatto le stesse query dirette sul database (ordini, clienti,
> prodotti) meno di due ore dopo il passaggio delle 21:05: nessun numero è cambiato. Il segnale
> che ha fatto scattare questo giro pieno era «clienti passati da 7 a 8» — vero, ma quel cliente
> risale al 21 agosto, non a oggi: la baseline del contatore era rimasta indietro di dieci giorni.
>
> **Cosa ho fatto.** Solo verifica. Nessuna carta nuova. Le tre già in coda (#168, #182, #184) sono
> complete e pronte: non le ho riscritte, riaprirle con parole diverse sarebbe solo rumore.
> Ho aggiornato anche `MyCity-Vault/05-Soldi-Rischi/OKR-Squadra.md`, che era fermo al 24/8 con
> numeri e scadenze scaduti: stallo North Star ricalcolato a 68 giorni, tasso di chiusura aggiornato a
> 1,29 (agosto), tolto il riferimento alla pausa 24/8-1/9 ormai scaduta.
>
> **Cosa non ho verificato.** Le stesse cose non verificate alle 21:05: stato Stripe specifico di
> Pane Quotidiano (baseline 24/8), le quattro cose della scadenza del 29/8 punto per punto, il
> sito aperto in un browser vero.

> 🧭 **31/8 21:05 — Giro di perlustrazione: il catalogo è riparato nel codice, il sito resta giù, e la scadenza del 29/8 è passata.** Richiesta tua: «fai un giro».
>
> **In parole semplici.** Ho riverificato tutto dal vivo (query dirette sul database, non a
> memoria): il business è fermo esattamente come il 28/8 — 1 negozio vero, 1 ordine mai pagato,
> 0 clienti nuovi. La sola novità reale è di codice, non di cassa: il difetto che mostrava 0
> prodotti su 5 ai visitatori senza accesso è stato riparato e mergiato (#857). Non posso
> verificarlo dal vivo perché il sito pubblico è ancora giù, HTTP 503, da 9 giorni.
>
> **La cosa da dirti chiaro.** `registro-fatti.json` (`cantiere.scadenza-zero`) segnava quattro
> cose da chiudere entro il **29 agosto**. Oggi è il 31: la scadenza è passata da due giorni. Non
> ho verificato in questo passaggio quali delle quattro restano aperte — lo segno come domanda,
> non lo dichiaro chiuso né sforato a caso.
>
> **Le tre carte che contano di più, ferme in coda:**
> - #184 — il database di produzione è indietro di 4 migrazioni (126-129), accodata il 29/8.
> - #182 — Pane Quotidiano non incassa da 18 giorni, e i post già pronti promettono comunque la
>   consegna. Accodata il 28/8.
> - #168 — il server che fa girare la macchina è fermo da giorni. È la causa più diretta del sito
>   giù. Accodata il 22/8.
>
> Nessuna delle tre è stata firmata.
>
> **Cosa ho fatto io.** Solo verifica e memoria: nessuna azione nuova aperta (North-Star gate +
> letargo RISPARMIO, salute macchina 4/100). CI: 7 PR aperte, 5 rosse (#855/#842/#841/#741/#735,
> tutte "colpa loro" — il guasto è nato sullo stesso ramo), 1 verde pronta a firma (#858), 1 in
> corso (#860). Non toccate: non sbloccano una card business, e il gate lo vieta esplicitamente.
>
> **Cosa non ho verificato.** Lo stato reale delle quattro cose della scadenza del 29/8 (le ho
> solo notate come scadute). Lo stato Stripe specifico di Pane Quotidiano (riporto il dato del
> 24/8, non una misura di oggi). Il sito pubblicato — l'ho misurato solo con HTTP status, non
> aprendolo nel browser.

---

> 🔢 **31/8 20:35 — Due schede diverse con lo stesso numero.**
>
> **Di cosa parlo.** Ogni difetto che trovo prende un numero progressivo. Serve per ritrovarlo dopo:
> quando tu o io cerchiamo «la scheda 865», deve uscirne una sola.
>
> **In parole semplici.** Oggi ho aperto una scheda mentre un'altra sessione ne apriva ventisette.
> La mia e la sua prima si sono prese lo stesso numero. Ho spostato la mia sul primo numero libero
> dopo i suoi.
>
> **Per esempio.** La mia scheda dice che il banco delle prove cancella cartelle di altri mentre in
> cima dichiara di non toccare niente. La sua, con lo stesso numero, parla del metro delle mutazioni.
> Due difetti che non c'entrano nulla fra loro. Dopo l'unione ne resterebbe visibile uno solo.
>
> **Cosa cambia per te.** Le due richieste di unione non si scontrano più sul registro dei difetti.
> Restano quattro file dove tutti e due aggiungiamo righe in fondo. Quelli si ricuciono tenendo
> tutti e due i pezzi. L'ordine giusto è: prima la richiesta con le ventisette schede, poi la mia.
> Così il lavoro da ricucire è il mio, che è quattro volte più piccolo.
>
> **Cosa devi fare.** Guardare le due richieste e dire se vanno bene. Nessuna delle due tocca il
> sito, i soldi o i clienti: si muovono solo registri interni della macchina.
>
> **Correggo una cosa che ti avevo detto un'ora fa.** Ti avevo scritto che il controllo automatico
> era già rosso prima della mia riga. Non è vero. Era verde sul commit prima e rosso sul mio, e in
> mezzo c'è solo la mia riga. La misura che mi aveva convinto girava sul mio albero sporco. Il
> controllo automatico invece parte sempre da una copia pulita.
>
> **Perché era rosso davvero.** Un guardiano confronta la data in cima a questa schermata con la
> data dell'ultimo lavoro consegnato. Se la schermata è indietro anche di un giorno, si arrabbia.
> Questa schermata era ferma da tre giorni, al 28 agosto. Quindi qualunque cosa avessi consegnato
> oggi lo faceva scattare: non era la rinumerazione. La riparazione è questa voce, con la data di
> adesso in cima al file.
>
> **Cosa non ho verificato.** Al database non ho fatto nessuna domanda, quindi la tabella qui sopra
> è la fotografia del 28 agosto alle 12:29 e non la situazione di stasera. Il sito pubblico non l'ho
> aperto. E ventinove prove scritte in bash qui non partono: manca lo strumento che le esegue.
>
> Dettagli tecnici: scheda spostata da AR-865 ad AR-892 (la richiesta #855 rivendica 865-891) ·
> guardiano `cervello/conta-verdetti-muti.mjs`, prova `cervello/test/due-case.test.mjs` 32 su 32.

> 🩻 **27/8 23:53 — Quarta radiografia del sito: 194 problemi veri, e il primo spegne il catalogo.** Richiesta tua: «fai la radiografia del marketplace».
>
> **In due righe.** Tredici esperti hanno riletto il sito in sola lettura, e un collaudatore diverso ha ricontrollato ogni problema nel codice vero. Restano 194 problemi confermati: 4 bloccanti, 74 gravi, 116 minori.
>
> **Il conto delle quattro visite.** I bloccanti erano 21 il 29 luglio, 12 il 18 agosto, 12 il 21 agosto. Oggi sono **4**. Il totale scende da 262 a 245, poi a 199, oggi a **194**. È la prima volta che i bloccanti si muovono davvero. Non ho verificato quali dei dodici siano stati chiusi. So solo quanti ne vedo oggi.
>
> **Il primo bloccante è nuovo ed è il più caro.** Chi arriva sul sito senza aver fatto l'accesso legge zero prodotti, zero recensioni, zero risultati di ricerca. I negozi in home si vedono lo stesso, e questo nasconde il guasto. Il database è stato ricostruito dalle 129 istruzioni del progetto e riletto con i permessi di un visitatore. Zero ovunque. Da proprietario le righe ci sono tutte. La causa: la regola che mostra un prodotto chiede «il negozio è approvato?» con i permessi di chi guarda. E a un visitatore la tabella dei negozi è stata chiusa a luglio.
>
> **Gli altri tre toccano i soldi.** ① Il negozio rifiuta un ordine pagato con carta e il rimborso non parte mai. Al cliente intanto scriviamo «Niente addebiti». ② Su un ordine pagato con carta l'avviso al negozio può non partire: email e campanella partono dopo la risposta a Stripe. Sul contrassegno lo stesso codice è scritto nell'ordine giusto. ③ Ogni unione pubblica il sito senza aspettare i controlli. Il cancello esiste ma è spento: gli mancano tre chiavi, e si dichiara «non pronto» restando verde.
>
> **Cosa devi fare.** Card #181: apri il sito in finestra anonima, clicca un prodotto, dimmi cosa vedi. È la prova che decide se il primo bloccante è vivo in produzione. Per il bloccante della pubblicazione non ho accodato niente di nuovo: le tre chiavi Vercel te le chiede già la card #161, ferma dal 22 agosto.
>
> **Cosa NON ho verificato.** Il sito pubblicato, in nessun punto. Tutto è misurato sul codice al commit `637de93`, e sul database ricostruito dalle migrazioni. Nessun ordine vero, nessuna carta addebitata, nessun rimborso chiesto. I 116 minori li ho contati, non pesati uno per uno.
>
> Referto: `consegne/audit/2026-08-27-radiografia.md` · dati grezzi: `consegne/audit/2026-08-27-radiografia-marketplace-raw.json`






> 🧮 **27/8 18:20 — Il conto fermo dal 29 luglio, e il mio metro che ripeteva il difetto che stavo curando.**
>
> **In parole semplici.** C'e' un allarme che dice: «un controllo ha parlato dentro un tubo e
> nessuno l'ha sentito». Il suo numero era fermo a 49 da due settimane, e il registro stesso
> scriveva che il lavoro vero non era stato fatto: decidere una per una quali sono difetti e quali
> sono rapporti che giustamente non fermano niente.
>
> **Per esempio.** Delle 49, ventidue seppelliscono un «non ho misurato»: l'attrezzo esce male
> apposta per dire che il file che gli serve non c'e', e il giro lo legge come un via libera.
> Diciassette seppelliscono un giudizio. Dieci sono rapporti veri, e stanno negli esenti col
> perche' scritto. Tetto da 49 a 39, che e' il debito vero.
>
> **La cosa da ricordare.** Il conto l'ho sbagliato la prima volta. E l'ho sbagliato nello stesso
> identico modo del difetto che stavo riparando. Il mio classificatore cercava `process.exit(1)`
> scritto proprio così. Non vedeva la forma `process.exit(out.ok ? 0 : 1)`, quella con cui otto
> attrezzi dicono il loro giudizio. Con quel metro avrebbe dichiarato innocue 23 istanze invece di
> 10. Un metro tarato sulla scrittura di ieri, non sul comportamento reale: è parola per parola il
> difetto per cui quella scheda esiste. Me ne sono accorta solo perché un nome stonava: fra i
> «rapporti informativi» c'era delta-gate, che ha la parola cancello nel nome.
>
> **Poi il cancello mi ha fermato tre volte di fila, sempre su roba mia**, tutta nata col programma
> di ieri che sposta le voci vecchie di questo file in archivio. Il foglio dei permessi era indietro
> di uno script, e applicarlo avrebbe spento il programma appena nato. Scriveva nel vault senza
> passare dal freno (50 scrittori grezzi contro un tetto di 49). E il caso peggiore — archivio
> scritto, file vivo no, voci doppie — si dichiarava riuscito.
>
> **Due lezioni sul come, non sul cosa.** La prova che controlla l'ordine delle due scritture, quando
> le ho spostate, non e' passata: ha detto CIECO. Un «non lo so» non e' mai un si'. E la prova nuova
> me l'ha corretta il mondo: l'avevo montata su percorsi veri, passava, poi questo file e' sceso
> sotto la soglia e lo stesso caso e' diventato rosso senza che il codice fosse cambiato. Riscritta
> come funzione pura che riceve da fuori la risposta del mondo.
>
> **Non verificato da qui.** Niente ha girato in un giro vero: il server e' fermo. AR-375 resta
> aperta apposta — la sua verifica e' dichiarata umana, e la parte nuova l'ho costruita io.

> 🔬 **27/8 11:40 — Il metro di una prova diceva zero quando non aveva misurato.**
>
> **In parole semplici.** Altri 55 controlli finti sbloccati. Due non mordevano, e dietro c'erano due difetti veri.
>
> **Per esempio.** Un controllo misurava quanto e' leggibile una riga. Per farlo chiedeva a un altro programma. Quel programma non riusciva a ricevere il testo e rispondeva «non ho potuto leggerlo» — la risposta giusta. Ma chi lo interrogava capiva «zero problemi». Da quando e' nato quel controllo non guardava niente.
>
> **E riparandolo ne e' uscito un secondo.** Ho guardato il perimetro con la lente della sicurezza, eseguendo il codice invece di rileggerlo. C'e' un elenco che dice quali programmi si possono lanciare. Il controllo che tiene fuori i percorsi che escono dalla cartella guardava solo l'inizio del percorso: bastava mettere il salto all'indietro in mezzo per passare.
>
> **Cosa cambia per te.** I controlli finti scendono da 229 a 174. E l'elenco dei permessi non accetta piu' un percorso che esce di casa.
>
> **Cosa devi fare.** Niente: e' lavoro sulla macchina.
>
> **Cosa non ho verificato.** Il buco dell'elenco dei permessi non l'ho trovato usato da nessuno: i programmi lanciati davvero stanno tutti dentro. Per sfruttarlo servirebbe poter scrivere dentro il progetto, e chi ci riesce ha gia' altre strade. L'ho chiuso lo stesso perche' e' un elenco di permessi.
>
> **Dettagli tecnici.** AR-845 e AR-846 aperte e chiuse. Sedici grappoli, 52 mutazioni su 55 mordevano. Tetto `mutazioni_senza_esecutore` 229 → 174. Corretto anche un commento in `permessi-elenco.mjs` che spiegava la scelta con un esempio falso: misurato, zero lanci veri lo distinguono.

> 🏷️ **27/8 10:55 — Venti lavori finiti, contati come da fare.**
>
> **In parole semplici.** Ho trovato venti lavori finiti per davvero, con la prova che gira. Ogni contatore li leggeva come da fare. Diciotto perche' erano scritti con la parola di un altro elenco.
>
> **Per esempio.** In casa ci sono due elenchi di problemi: quello della macchina e quello del sito. Nel primo «finito» si dice in un modo solo. Nel secondo si puo' dire in tre. Chi ha lavorato su tutti e due nello stesso giorno ha usato la parola del secondo dentro il primo, e per la macchina quelle schede non erano finite.
>
> **Cosa cambia per te.** I problemi aperti scendono da 133 a 113. Ma conta di piu' un'altra cosa. Quelle schede stavano in una lista che qualcuno un giorno avrebbe riaperto, per finire un lavoro gia' finito.
>
> **Cosa devi fare.** Niente: e' lavoro sulla macchina.
>
> **Cosa non ho verificato.** Prima di cambiare uno stato ho rifatto girare tutte le prove: undici comandi per diciotto schede, tutti verdi. Quindi so che i fix ci sono. Quello che non so e' se la parola sbagliata sia finita anche in registri che non ho guardato. Nel cantiere della macchina, almeno, adesso non puo' piu' succedere.
>
> **Dettagli tecnici.** AR-844 aperta e chiusa. Chiuse anche AR-780 (bloccante) e AR-796, riparate il 23/8 e mai girate di stato, dopo aver tappato i buchi di prova che restavano. Le 18 in stato `riparato` portate a `chiuso` con la data del commit che le ha introdotte, presa da git. Freno nuovo `cervello/stati-che-nessuno-capisce.mjs`, tetto `stati_ignoti` a 0, montato nel cancello. 7 casi, 4 mutazioni rosse. Tasso di chiusura di agosto da 1,25 a 1,3.

> 🧵 **27/8 10:15 — Un controllo con tre regole ne applicava due.**
>
> **In parole semplici.** Altri 55 controlli finti sbloccati: 49 mordono, 6 no. Tutti e sei riparati. Il numero scende da 284 a 229.
>
> **Per esempio.** C'e' un guardiano che controlla se i programmi grossi della macchina possono partire. Ha tre regole. Le prime due erano provate da dodici casi. La terza dice una cosa sola: questo programma parte e poi muore subito dopo. Quella regola era collegata e non la provava nessuno. Si poteva togliere e restava tutto verde.
>
> **Cosa cambia per te.** Sei controlli veri adesso sono collegati per davvero. Il numero dei controlli finti e' sceso di 164 in una giornata: era 393 stamattina.
>
> **Cosa devi fare.** Niente: e' lavoro sulla macchina.
>
> **Cosa non ho verificato.** Restano 229 controlli. E ne dichiaro uno che da qui non posso provare fino in fondo: un pezzo di codice aveva l'indirizzo di casa scritto a mano, e su questa macchina quell'indirizzo e' quello giusto. Il danno si vedrebbe solo altrove — sul server. Meta' di quel controllo guarda il comportamento, meta' guarda il testo, ed e' scritto perche'.
>
> **Dettagli tecnici.** Undici grappoli. I sei riparati, per forma:
> · AR-780 e AR-743 — rilevatori collegati e mai provati.
> · AR-757, due volte — il percorso del freno compare due volte nel gancio del commit, e la ricerca trovava sempre l'altra.
> · AR-126 e AR-435 — in `prepara-giro`: i fatti letti dal registro, e la radice calcolata invece che scritta.
> Parametrizzata `guarda(cartella)` per poterla eseguire su un mondo finto. Tetto `mutazioni_senza_esecutore` 284 → 229.

> 🔗 **27/8 09:35 — Quattro regole scritte bene che non chiamava nessuno.**
>
> **In parole semplici.** Altri 56 controlli finti sbloccati: 62 mordono, 4 no. Le quattro non erano regole sbagliate. Erano regole giuste che nessuno interrogava.
>
> **Per esempio.** C'e' una regola che dice: se il cervello e' acceso ma non finisce piu' niente e ha lavoro in coda, suona l'allarme. Quella regola era provata quattro volte. Ma il pezzo che la chiama non lo provava nessuno: si poteva staccare, e tutte e quattro le prove restavano verdi. L'allarme non avrebbe mai suonato.
>
> **Cosa cambia per te.** Il numero dei controlli finti scende da 340 a 284. E adesso quattro regole vere sono collegate per davvero, non solo scritte.
>
> **Cosa devi fare.** Niente: e' lavoro sulla macchina.
>
> **Cosa non ho verificato.** Restano 284 controlli da guardare. E una cosa la dico contro di me: uno dei quattro buchi l'avevo appena creato io, scrivendo una prova che sembrava controllare una data e non controllava niente. L'ho visto solo perche' ho rotto il codice a mano invece di fidarmi del verde.
>
> **Dettagli tecnici.** Otto grappoli. I quattro: AR-366 (la chiamata a `vivoMaNonProduce` dentro `sentinella-dati`, provata ora con `valutaRegole`), AR-796 (estratto `dovePuntaLaScheda` da `auto-fix`), AR-807 due volte — il guardiano del campo visivo nel cancello, e il cartello della pulizia. Tetto `mutazioni_senza_esecutore` 340 → 284. Irrobustiti tre controlli di montaggio che una riga commentata soddisfaceva lo stesso.

> 🧪 **27/8 09:10 — Tre prove non guardavano niente, e non perche' fossero scritte male.**
>
> **In parole semplici.** Ho sbloccato altre 57 prove che risultavano verificate senza esserlo. Ne mordono 54. Le tre che restano sono la cosa interessante della giornata.
>
> **Per esempio.** Una di quelle tre difende questa regola: se la macchina non riesce a chiedere una cosa, deve dire «non lo so» invece di dire «va bene». La prova era scritta bene. Ma per arrivare a quel punto del codice serve che la domanda fallisca davvero — e qui la domanda funziona sempre. Quella riga non la eseguiva nessuno, quindi rompendola non cambiava niente.
>
> **Cosa cambia per te.** Il numero delle prove finte scende da 393 a 340, e scende soltanto. Ma soprattutto adesso so riconoscere una forma che prima mi sfuggiva: quando una prova non morde, la seconda domanda e' se quel pezzo di codice qui ci passa mai qualcuno.
>
> **Cosa devi fare.** Puoi leggere questa voce come un promemoria e basta: e' lavoro sulla macchina, non tocca ne' il sito ne' i negozi.
>
> **Cosa non ho verificato.** Restano 340 prove da controllare, e il ritmo di oggi non si puo' proiettare su quelle: i grappoli che ho preso puntavano a file di prova recenti e ben tenuti, e quelli sono i piu' facili. Quante delle 340 non guardino niente, non lo so.
>
> **Dettagli tecnici.** Quattro grappoli (`sorvegliante`, `prove-a-due-versi`, `cancello-stop`, `una-corsia-piena`), 57 mutazioni, 3 non mordevano. AR-550 era il collegamento nel cancello, non la funzione. AR-552 e AR-365 erano rami che l'ambiente non percorre, curati estraendo `statoFusioneDa` e `verdettoAllerta`. Tetto `mutazioni_senza_esecutore` 393 → 340. Lezione L-2026-0827-02, agganciata al gate del sorvegliante.

> 🚦 **27/8 08:15 — Erano sei, non ventisette. Contati bene, si chiudevano tutti oggi.**
>
> **In parole semplici.** Stamattina avevo scritto che nel giro c'erano 27 controlli da verificare. Li avevo contati per riga. Contandoli per controllo il numero e' sei, e sei si riparano in un pomeriggio invece di diventare un debito.
>
> **Per esempio.** Contando le righe accusavo anche chi fa la cosa giusta. Un controllo scritto bene ha due righe: una per «ti boccio» e una per «non ho potuto guardare». La prima riga, da sola, sembrava scoperta.
>
> **Cosa cambia per te.** Sei controlli del giro sapevano dire solo due cose su tre. Due tacevano quando non riuscivano a misurare, e il silenzio sembrava un via libera. Quattro dicevano la diagnosi come se l'avessero fatta. Il piu' caro era quello della stella polare: quando scatta riscrive il giro intero, e lo avrebbe riscritto per un sensore rotto. Adesso dicono tutti e tre le cose.
>
> **Cosa devi fare.** Niente di nuovo: la coda delle scelte non e' cambiata da stanotte.
>
> **Cosa non ho verificato.** Non ho fatto girare un giro vero: ho eseguito i blocchi da soli, con controlli finti che rispondono come voglio io. E c'e' una conseguenza che dichiaro invece di lasciartela scoprire: da adesso, se uno strumento e' rotto, il giro non puo' piu' saltare il lavoro dell'AI. Costa, ed e' voluto — dormire con uno strumento rotto costa di piu'.
>
> **Dettagli tecnici.** AR-843 chiusa. Il conto: 19 vincoli a mano, 3 col ramo del cieco, 10 su guardiani con uscita 2, 6 vivi — `senior-sola-lettura` e `ci-stato` legati a `-eq 1`, `test-cervello`, `chiusura-loop`, `calibrazione debito` e `north-star-check` legati a `-ne 0`. Tutti su `vincolo_da_rc`. Contatore `cervello/vincoli-senza-cieco.mjs`, tetto `vincoli_senza_cieco` a 0, montato in `cancello-lotto.mjs`. 12 casi, 4 mutazioni rosse. Ri-ancorata la prova a due versi di AR-158, terza ancora rotta oggi da uno spostamento di codice. Difetti aperti 115.

> 🧭 **27/8 07:35 — Un controllo che non aveva potuto guardare diceva lo stesso cosa aveva visto.**
>
> **In parole semplici.** Prima di svegliare l'AI, il giro fa girare dei controlli. Uno di questi guarda se lo sforzo sta andando su un negozio vero o su un'ipotesi. Ha tre risposte possibili: va bene, non va bene, non ho potuto guardare. Il giro ne leggeva solo due.
>
> **Per esempio.** Quando quel controllo non riusciva a misurare, all'AI arrivava lo stesso una frase. Diceva: «stai mettendo lo sforzo su un negozio che non e' confermato». Arrivava come regola non negoziabile, e nessuno l'aveva verificato. Un ordine sbagliato non viene ignorato: viene eseguito.
>
> **Cosa cambia per te.** Adesso quando quel controllo non ci vede lo dice con parole sue: ripara lo strumento, non fidarti di un verde che non c'e'. E la prova di tutto il pezzo non cerca piu' una parola in un file: prende il blocco vero e lo fa girare con tre risposte finte, guardando cosa arriva all'AI.
>
> **Cosa devi fare.** Niente. Le scelte in coda restano la #177, la #178 e la #175.
>
> **Cosa non ho verificato.** Nello stesso file ci sono 27 altri controlli che si scrivono il testo a mano come faceva questo. Per sapere se hanno lo stesso difetto bisogna leggerli uno per uno, e non l'ho fatto: non dico che siano sani e non dico che siano malati. Il conto e' scritto in una scheda aperta.
>
> **Dettagli tecnici.** AR-842 chiusa, AR-843 aperta. Le prove vacue di AR-079 e AR-081 sostituite da `cervello/test/il-verdetto-che-non-arriva-al-motore.test.mjs`: 15 casi che ritagliano da `giro.sh` i tratti veri e li eseguono con un `allocazione-check.mjs` finto a 0/1/2. Il blocco usa `guardiano` e `vincolo_da_rc` di `giro-esito.sh`. 4 mutazioni verificate rosse. Difetti aperti 116.

> 🏪 **27/8 06:40 — La macchina sa fare il primo lavoro che appartiene a un negozio.**
>
> **In parole semplici.** Fino a stamattina la macchina sapeva fare solo lavori suoi. Adesso sa fare un lavoro che appartiene a un negozio, e quel lavoro passa da una strada sola. Su quella strada le righe di un altro negozio vengono buttate via e contate, e le chiavi del negoziante non hanno un buco da cui entrare nel testo.
>
> **Per esempio.** Ho dato al costruttore due righe insieme, una del forno e una del fioraio. Nel testo che ne è uscito del fioraio non c'era niente: né il dato, né il nome. Poi ho finto che il fornaio incollasse la sua password dentro un messaggio: il testo non è partito affatto. Non è partito ripulito — non è partito.
>
> **Cosa cambia per te.** Il pezzo che tiene separati i negozi era scritto e provato da quattro giorni, e non lo usava nessuno. Adesso lo usa qualcuno, e chi verrà dopo non può girargli intorno: un lavoro di un negozio che la macchina non sa trattare si ferma da solo, con scritto perché.
>
> **Cosa devi fare.** Niente. Le scelte in coda restano tre: la #177, la #178 e la #175.
>
> **Cosa non ho verificato.** La separazione la fa il codice, non il database. Se una richiesta al database è scritta male, le righe di un altro negozio arrivano fino al filtro: vengono buttate e il numero si vede nel registro, ma sono uscite. Il muro dentro il database resta il buco aperto, e da qui non lo posso né provare né chiudere. E niente di tutto questo l'ho visto girare su un negozio vero: non esiste ancora un lavoro di bottega in coda.
>
> **Dettagli tecnici.** AR-839 chiusa. Porta in `cervello/bottega/testo-lavoro.mjs`, muro all'esecuzione in `cervello/worker-bottega.sh` (`bottega_muro`) chiamato da `worker.sh` prima del tetto di spesa. `TIPI_DI_BOTTEGA` ha il suo primo nome. 36 verifiche verdi, 8 mutazioni rosse, la prova ritaglia ed esegue i tratti veri di `worker.sh`. Aperta e chiusa nello stesso lotto AR-841 (ripiego se `mktemp` tace), trovata dalla radiografia in corsa. Lezione L-2026-0827-01. Difetti aperti 115.

> 🧹 **27/8 00:45 — Cominciato a pagare il debito delle prove finte: 42 sbloccate, un terzo non guardava niente.**
>
> **In parole semplici.** Due giri di bonifica sulle prove che risultavano verificate senza esserlo. Ne ho sbloccate 42 e fatte girare per davvero: 28 mordono, **14 no**. Di quelle 14 ne ho riparate cinque. Il tetto è sceso da 435 a 393, e scende soltanto.
>
> **Per esempio**, la più importante. C'era una regola che dice: un invio senza la tua firma non parte. La sua prova sembrava perfetta — chiamava il controllo vero con una firma vuota e pretendeva un no. Il no arrivava, ma da un altro controllo: il primo cancello è l'interruttore di emergenza, che senza credenziali blocca tutto prima ancora di guardare la firma. Quindi la regola sulla firma non la provava nessuno.
>
> **Cosa cambia per te.** Quella regola adesso ha una prova vera. E ho imparato una cosa che vale oltre il caso singolo: **un controllo che blocca tutto a monte può far sembrare provata una regola a valle che non lo è.** Il verde è vero, la ragione è un'altra.
>
> **Cosa devi fare.** Niente. Le due scelte in coda restano la #177 e la #178.
>
> **Cosa non ho verificato.** Restano nove schede scoperte, tutte con un nome. Quattro vogliono il server: parlano di orologi e configurazioni che da qui non posso far girare. Le altre cinque le ho lasciate per stanchezza, non per impossibilità.
>
> **Dettagli tecnici.** Lotti su AR-023..AR-087. Riparate AR-050, AR-051, AR-062, AR-067, AR-078 — quest'ultima estraendo `azioneIdUsabile` in una funzione pura. Restano AR-054, AR-056, AR-057, AR-059 (server), AR-071, AR-075, AR-077, AR-081, AR-082. Tetto `mutazioni_senza_esecutore` a 393.

> 🧪 **26/8 21:15 — Metà delle prove che dovevano dimostrare che le prove servono, non servivano.** La cosa più importante che ho trovato oggi.
>
> **In parole semplici.** Quando chiudo un difetto non basta scrivere una prova. Devo rompere la riparazione apposta e far vedere che la prova diventa rossa. Se non diventa rossa, quella prova non stava guardando niente. È il controllo che tiene in piedi tutti gli altri.
>
> Quel controllo lancia la prova passandole il **nome del file**. In 435 schede su 872, cioè più della metà, al posto del nome c'era una riga di comando intera. Allora cercava un file chiamato «node cervello/prove/eccetera», non lo trovava, e si arrabbiava. **E arrabbiarsi è esattamente il segnale che lui legge come «la prova è diventata rossa».** Risultato: verificate sempre, qualunque cosa succedesse.
>
> **Per esempio**, oggi ho scritto quindici prove nuove. Tutte e quindici risultavano verificate. Ne ho rotte cinque a mano, una per una, e cinque non se ne sono accorte: erano verdi per finta. Il numero grande l'ho misurato dopo.
>
> **Cosa cambia per te.** Per metà del registro, la frase «difetto chiuso, prova verificata» finora voleva dire soltanto «qualcuno ha scritto una riga». Quando ti dico che un difetto è chiuso con la sua prova, da adesso quella frase vale di nuovo.
>
> **Cosa devi fare.** Niente adesso. Il peggioramento è fermo: c'è un contatore, il numero di oggi è il tetto, e il cancello lo controlla a ogni consegna. Da adesso può solo scendere.
>
> **Cosa non ho verificato.** Le 435 vecchie restano da sistemare e non è un lavoro meccanico. Appena una prova si sblocca si scopre se guardava qualcosa: va fatto a pezzi, perché ogni pezzo può far uscire un difetto che credevamo chiuso. Quanti siano, non lo so ancora.
>
> **Una cosa buffa e istruttiva.** Mentre scrivevo il contatore ho fatto lo stesso errore: una delle mie cinque prove nuove puntava a un file che non esiste. L'ha beccata il contatore appena acceso, al primo giro.
>
> **Dettagli tecnici.** AR-840 aperta, bloccante. Contatore `cervello/mutazioni-senza-esecutore.mjs`, tetto `mutazioni_senza_esecutore` a 435 su 877 voci in `tetti-lotto.json`, montato in `cancello-lotto.mjs`. Tredici casi di prova su tredici verdi, 5 mutazioni rosse — fra cui una che toglie il guardiano dal cancello. Aperta anche AR-839, il muro fra i negozi dal lato del testo.

> 💶 **26/8 20:50 — Il tetto di spesa dei negozi aveva una porta e nessuno che ci passasse.** Consegna ③, il pezzo dopo il turno.
>
> **In parole semplici.** La macchina sapeva già fermare un negozio che ha finito il suo budget. Ma il numero di quanto aveva speso non lo contava nessuno: restava zero per sempre. Un tetto che nessuno alimenta non è un freno, è un cartello. Adesso ogni lavoro che la macchina fa viene addebitato al negozio giusto, e il conto lo legge chi decide se far partire il lavoro dopo.
>
> **Cosa cambia.** Un negozio che consuma troppo si ferma da solo. Si ferma lui, non gli altri.
>
> **Tre scelte, e le dico tutte e tre.** ① La misura è in gettoni di lavoro, non in euro. In casa non esiste nessun listino che li converta, e inventarlo sarebbe un numero senza fonte. ② Le stime non fanno scattare il tetto. Fermare un negozio con un conto che nessuno ha misurato è un freno appoggiato sul niente. ③ Uno zero misurato non esce dal contatore. Un negozio con sole stime ha misurato zero: è vero e non dice niente. Se quello zero uscisse coprirebbe un numero scritto a mano, cioè una cosa che il registro non sa.
>
> **La terza l'ha trovata una prova.** L'avevo scritta aspettandomi il risultato opposto.
>
> **Cosa non ho verificato.** Il tetto guarda una finestra di sei ore. È un freno sul ritmo di spesa, non un canone mensile: quello è un pezzo ancora da fare.
>
> **Dettagli tecnici.** AR-838 chiusa con prova a comando — `cervello/test/il-tetto-di-spesa-ha-chi-lo-alimenta.test.mjs`, 9 casi, 6 mutazioni rosse. Il negozio arriva da `AI_NEGOZIO`, che sta fra le variabili spente a ogni lavoro. Trovato riguardando il perimetro: la richiesta della spesa girava a ogni battito anche a coda vuota.

> 🛣️ **26/8 20:15 — Il turno fra i negozi c'era da tre giorni e non lo chiamava nessuno.** Consegna ③, la macchina delle botteghe.
>
> **In parole semplici.** La parte che decide «a quale negozio tocca adesso» era scritta e provata dal 23 agosto. Il worker vero, però, continuava a prendere il lavoro più vecchio della coda. Con un negozio solo va bene. Con quaranta che pagano il canone, il più lento li ferma tutti — e il tempo perso è di qualcuno che non c'entra. Adesso è collegata davvero.
>
> **Cosa cambia.** La consegna ③ non è più intatta: il meccanismo del turno è dentro e provato eseguendo il codice vero, non rileggendolo. Restano fuori due cose. Il muro dentro il database, che è rosso e da qui non si può provare. E il contatore della spesa per negozio, che è il pezzo dopo.
>
> **Quattro difetti veri li hanno trovati le prove, non la riletta.** ① La prima versione **avrebbe fermato la macchina intera** al primo giro: la coda di oggi è tutta del centro, che non ha un tetto di spesa dichiarato, e il freno delle botteghe l'avrebbe bloccata. ② La presa chiamata dentro una sottoshell perdeva la memoria del turno: sempre lo stesso negozio, in silenzio. ③ Un pezzo di codice ingoiava la risposta «non capisco quello che mi arrivi». Il worker restava fermo con la coda piena. Quel solo pezzo teneva rosse quattro prove di casa. ④ La finestra di 200 righe che avevo messo sulla coda **rimetteva dentro la fame che stavo togliendo**: un negozio con 200 lavori in attesa la riempie tutta e il lavoro di un altro diventa invisibile. L'ha trovata il controllo del perimetro, non io.
>
> **La cosa da ricordare.** Tre volte su tre, oggi, la mia prima spiegazione di un rosso era falsa. A smentirla è stata sempre una misura, mai una riletta.
>
> **Cosa non ho verificato.** Il turno l'ho provato con un database finto: che il worker VERO lo usi si vede al primo giro del server, che è fermo.
>
> **Dettagli tecnici.** Il muro nel database e' AR-802: resta 🔴 e da qui non e' provabile. Il contatore della spesa e' AR-838. Il pezzo che ingoiava la risposta era un `|| true`. AR-804 chiusa con prova a comando — `cervello/bottega/scelta-worker.mjs`, `cervello/worker-coda.sh`, `cervello/test/il-negozio-lento-non-ferma-gli-altri.test.mjs`. 12 casi, 9 mutazioni verificate rosse, cancello del lotto verde su 27 guardiani. PR #850. Aperte AR-837 e AR-838. Sul sito: ottavo difetto del design chiuso (l'assistenza non aveva nessuna maniglia per chi compra), PR #243, 11 controlli verdi.

> 🔁 **25/8 21:00 — Il controllo di fine turno chiedeva di ricontrollare lavoro già pubblicato. Da nove giorni c'era la cura scritta e ferma.** Richiesta tua: «fai la 749».
>
> **In parole semplici.** Quando un turno finisce, la macchina si ferma e fa una domanda: stai lasciando indietro un lavoro? Per rispondere confronta il lavoro con un punto di partenza. Quel punto si sposta avanti solo quando un turno si chiude senza problemi. Ma se il lavoro è già stato pubblicato, il confronto trova comunque tutto quello che c'è nel tronco. Allora il turno risulta sporco, e il punto non si sposta. Il giro dopo la lista è più lunga. **È successo 46 volte in sei giorni.**
>
> **Cosa cambia per te.** Se non c'è niente di non pubblicato, adesso il punto di partenza si riporta avanti da solo. Così la domanda smette di ripetersi a vuoto. Il controllo continua a fare il suo lavoro quando c'è lavoro vero.
>
> **La cosa che non mi aspettavo.** La cura era già scritta dal 16 agosto, in una richiesta rimasta ferma. Riguardandola prima di consegnarla ho visto che **era troppo larga**: spegneva il controllo anche quando sul disco c'era lavoro non ancora salvato. Cioè lo avrebbe indebolito proprio nel turno in cui serve. L'ho ristretta e ho aggiunto le prove del caso contrario.
>
> **Cosa devi fare.** Una firma sulla richiesta nuova. La vecchia, la 749, si chiude da sé come superata.
>
> **Cosa non ho verificato.** Il comportamento dal vivo sul server: la prova è tutta sui banchi di questa macchina. E come sempre, quello che ho riguardato l'ho riguardato io: qui non c'è stato un collaudatore diverso da chi ha costruito.
>
> **Dettagli tecnici.** Tre schede. AR-819 è il ciclo. AR-820 è il fix troppo largo, trovato dalla radiografia del perimetro. AR-821 è un errore di git ingoiato dentro la riparazione, trovato dalla spazzata dei fratelli. Toccati due programmi. In `cervello/cancello-stop.mjs`: `scegliPerimetro` e il punto che la chiama. In `cervello/collaudo.mjs`: `verdettoCollaudo`, `baseDelCollaudo`, `collaudoAlloStop`. Le prove: 125 casi su 125 verdi, 3 mutazioni su 3 che diventano rosse rompendo il fix apposta. Tolto anche un pezzo di codice morto, dimostrato inutile dalla mutazione che restava verde.

> 🩻 **25/8 19:55 — Adesso la radiografia gira DENTRO le riparazioni, non solo prima e dopo.** Richiesta tua: «entro il 29 agosto la macchina e il sito devono essere pronti, senza difetti». E: «fai la radiografia mentre risolvi i problemi, così non saltano fuori altri problemi se ne faccio un'altra separata».
>
> **In parole semplici.** Finora l'esame completo era un evento a parte. Si lanciava, usciva una lista, e per giorni si riparava quella lista. Nel frattempo nessuno riguardava i pezzi appena toccati. Da adesso un lavoro non si consegna se i file che ha toccato non sono stati riletti con l'occhio giusto. E riletti **dopo** l'ultima modifica, non prima.
>
> **Perché serviva, coi numeri.** La macchina lo aveva già scritto da sé in un suo registro: «per trovare problemi nuovi serve un esame nuovo; le riparazioni non riaprono da sole la lista». E il conto delle nascite, misurato il 23 agosto: su 787 schede del cantiere, 99 le ha create il riparare — una su otto. Il posto dove nascono più difetti era l'unico senza nessuno che guardasse.
>
> **Cosa cambia per te.** «Zero difetti aperti» comincia a voler dire quello che sembra. Prima era vero sulla lista e falso sul codice: un esame rifatto il giorno dopo avrebbe trovato roba nata durante le riparazioni. Ed è successo subito, alla prima prova vera. Riguardando sé stesso, il controllo nuovo ha trovato **tre difetti dentro di sé**. Uno: un comando che diceva di aver registrato e non registrava. Due: un percorso che usciva dalla cartella del progetto. Tre: chiedeva di riguardare un file che il lavoro aveva appena cancellato. Riparati tutti e tre prima della consegna.
>
> **Cosa devi fare.** Una firma sola: la richiesta di unione di questo lavoro. Da lì in poi il controllo parte da solo a ogni lavoro.
>
> **Cosa non ho verificato.** Sul **sito** il controllo esiste ma si lancia a mano. Il cancello automatico vive nella casa della macchina, e la fabbrica del sito non ce l'ha in mano. Quindi sul marketplace, fino al 29, la rilettura dipende da me che la lancio, non da un blocco. L'ho scritto come limite dentro la scheda, non come cosa fatta. Nessuna di queste prove è passata dal server: girano tutte qui, sulla macchina di questa sessione.
>
> **Dettagli tecnici.** `cervello/radiografia-in-corsa.mjs` cablato in `cancello-lotto.mjs` (passo «la radiografia del perimetro toccato»). Mappa in `cervello/dimensioni-radiografia.json`: tutte e 44 le lenti dei quattro esami (macchina, Cabina, sito, design), confrontate a ogni cancello con i workflow veri. Registro in `auto-coscienza/radiografia-in-corsa.json`, con l'impronta dei file. Schede AR-818 · AR-814 · AR-815 · AR-816, con la lezione `L-2026-0825-02` e il suo gate. Più AR-817, aperta: la prova instabile che fa uscire rossa la CI a caso. Le prove: 16 casi su 16 verdi, e 4 mutazioni su 4 che diventano rosse rompendo il fix apposta. Passo ⑥bis della skill `cantiere`.

> ⏰ **24/8 12:30 — Due rami avevano dato lo stesso numero a difetti diversi.**
>
> **In parole semplici.** I conflitti che avevi visto erano cinque. Tutti su registri che tengono
> il conto delle cose. Le due parti li avevano allungati ognuna per conto suo, quindi non c'era un
> lato da scegliere: li ho tenuti tutti e due, voce per voce.
>
> Unendo è saltata fuori una cosa peggiore. **Due numeri erano stati dati due volte.** Il ramo
> entrato nel tronco chiamava «797» e «798» due suoi difetti. Il mio ne chiamava così altri due,
> diversi. Unire per numero li avrebbe fatti sparire in silenzio.
>
> **Per esempio**, uno dei due miei è quello che spiega perché un programma esplodeva alla prima
> prova che incontrava. Con l'unione fatta a occhio, quella scheda oggi non ci sarebbe più: nessun
> errore, nessun avviso, solo una riga in meno.
>
> **Cosa cambia per te.** Le due richieste di unione sono aperte, verdi e senza conflitti: la
> macchina e il sito. Sulla macchina il cancello passa con ventiquattro controlli su ventiquattro.
> Sul sito passano tutti e undici.
>
> C'è anche una cosa buona uscita per caso. Il lavoro entrato nel tronco portava tre controlli
> nuovi, lasciati fermi di proposito perché mancavano due schede nel registro. Erano proprio quelle
> che la fusione ha portato. Ne ho messo di guardia uno, e alla prima corsa ha trovato un permesso
> morto lasciato dal mio stesso lavoro.
>
> **Cosa devi fare.** Una scelta sola, la stessa di ieri: sulle botteghe, prima strada o seconda.
> Se resti zitto prendo la prima. Poi c'è la card numero 169, sulla spedizione scritta gratis e poi
> fatta pagare: lì l'altra strada è una decisione di prezzo, quindi tua.
>
> **Cosa non ho verificato.** I tre controlli arrivati dall'altro ramo non li ho scritti io e non li
> ho riletti riga per riga: li ho fatti girare e ho guardato cosa dicono. E i numeri delle card non
> li ho rinumerati: nessuno dei due rami è ancora unito, quindi nessuno dei due è la verità. Chi
> unisce per secondo rinumera.
>
> **Dettagli tecnici.** Teste: ad-mycity `13414e0f6`, mycity `d5f77b8`. Cantiere 118 da fare su 802;
> sito 421 reperti, 185 aperti, 26 in corso. I miei due difetti rinumerati AR-809 e AR-810, riscritti
> in scheda, mutazione, file di prova, commento nel codice, DECISIONI e quaderno di reparto. La
> collisione dei numeri è registrata come AR-811, grave: il 3 agosto era già successa due volte in un
> giorno e nessuno l'aveva registrata. Il freno agganciato è `cervello/porte-gemelle.mjs`. Sul sito il
> lotto ⑨ ha rifatto il metro sugli errori ingoiati: 53 chiamate al database nell'area venditore, 15
> cieche, tutte riparate.
>
> 🔬 **24/8 12:05 — Tre freni costruiti, uno solo promosso: gli altri due li ha bocciati il collaudo.** Richiesta di Nicola: «parti con tutti e tre».
>
> **Cos'era il lavoro.** Tre freni contro le tre forme con cui il riparare crea difetti nuovi: il controllo che nasce già rotto, la porta a mano riparata mentre quella automatica resta aperta, il puntatore che resta indietro quando il codice si sposta.
>
> **Come è andata.** Quattro giri, trentun senior, e un collaudo affidato a chi non aveva costruito niente. **Tredici bocciature su quattordici collaudi**, e ogni costruttore aveva consegnato dicendo «fatto, tutto verde». Alla fine ne passa **uno**: le porte gemelle, promosso da due collaudatori indipendenti e agganciato al cancello. Montarlo toglie un rosso invece di aggiungerlo.
>
> **I due bocciati, col motivo.** Il freno delle due case ignora la cartella di lavoro che il cancello dichiara, quindi misura un comando diverso da quello vero: una riga compra il verde. Il freno dei puntatori funziona, ma quando ferma il cancello **non dice quale scheda l'ha rotto**. Stampa i primi quindici accusati, che sono i quarantasei vecchi. La scheda nuova resta in fondo e non si vede mai. Restano strumenti da lanciare a mano, dichiarati.
>
> **Cosa resta scritto.** Il metodo è nella skill `collaudo`, le venti scorciatoie misurate in `cervello/scorciatoie-note.md`, i referti interi in `consegne/audit/2026-08-23-collaudo-tre-freni/`. Il cantiere adesso prevede il collaudo indipendente al punto 7bis e le tre domande di Nicola al 7ter.
>
> **Cosa non ho verificato.** Niente di tutto questo l'ho visto girare sul server vero: le prove sono tutte su questa macchina e su copie usa-e-getta del progetto. E il metodo resta provato su un tipo solo di lavoro, i freni della macchina.
>
> **Dettagli tecnici.** Freno agganciato: `cervello/porte-gemelle.mjs`, riga dopo «spazzata dei fratelli» in `cancello-lotto.mjs`, con la voce tolta da `guardiani-motivi.json` (montato, sarebbe fantasma). Nel cantiere sono registrate tre schede: AR-796 per il promosso, AR-797 e AR-798 per i bocciati. In coda le card #172 e #173.

> ✅ **26/8 17:41 — La card 174 è finita. Il campo del negozio è diventato obbligatorio.**
>
> **In parole semplici.** La macchina delle botteghe dovrà servire tanti negozi con un programma solo. Perché funzioni, ogni lavoro nella coda deve dire a quale negozio appartiene. Da oggi è obbligatorio: una riga che non lo dice viene respinta dal database.
>
> **Cosa cambia per te.** Niente che tu debba fare. La coda ha 3.281 righe e nessuna è senza il negozio. Il primo comando era già dato il 25 agosto. Oggi ho dato il secondo, quello che avevo fermato apposta.
>
> **Cosa devi fare.** Niente su questa. La card **#174** è chiusa nella coda.
>
> **Cosa non ho verificato.** Ho provato il vincolo scrivendo io nel database, non guardando la macchina lavorare davvero. Il prossimo giro vero del server è la conferma che manca, e arriva da sola domani mattina. Se qualcosa si rompe lì, si torna indietro con una riga sola.
>
> **Perché l'avevo fermato, e cosa l'ha sbloccato.** La condizione che avevo scritto io nominava un posto solo, il Pannello. Ma nella coda scrivono in quattro punti, e tre stanno sul server. Darlo in quel momento avrebbe fatto fallire ogni ri-accodamento: chat, giri, report, sentinelle. Cioè il danno che la card diceva di voler evitare, causato dalla card stessa.
>
> A sbloccarlo non è stata una supposizione. La macchina scrive nella coda una volta al giorno verso le 11. Stamattina ha scritto cinque righe alle 11:01, e tutte e cinque portano il campo nuovo. Il server sta girando col codice giusto, e quello lo dicono i dati.
>
> **La prova.** Una riga scritta senza il negozio viene respinta. Una scritta col negozio passa. La riga di prova l'ho tolta subito e il conto è tornato identico, 3.281.
>
> **Dettagli tecnici.** Migrazione `lavori_negozio_id_obbligatorio` sul progetto `xjljcsorpbqwttrejqte` (la memoria, non il marketplace): `update ... where negozio_id is null` poi `alter column negozio_id set not null`. Dopo: 3.281 righe · 0 nulle · `is_nullable='NO'` · indice `lavori_negozio_id_idx` presente. Prova comportamentale in un blocco `do $$` che fallisce rumorosamente se il vincolo non morde. Ritorno indietro: `alter table public.lavori alter column negozio_id drop not null;`

> 🚪 **26/8 08:25 — Il controllo che protegge il codice avvisa ma non ferma: dieci lavori su 141 sono entrati senza un verde.**
>
> **In due righe.** Il controllo automatico che protegge il codice funziona, ma il suo «no» non ferma nessuno: dieci modifiche su 141 sono entrate senza il suo via libera. Ho riparato quattro cose. Tre delle quattro me le ero fatte da solo. La quinta è la serratura, e quella è una scelta che tocca a te: card #177.
>
> **In parole semplici.** Prima che una modifica entri nel codice buono gira un controllo automatico. Ricontrolla tutto: le prove, i conti, i guardiani. Quel controllo funziona bene. Il problema è che il suo «no» non ferma niente. È come un cartello «lavori in corso» senza transenna.
>
> **Cosa cambia per te.** Sono andato a contare. Dal 4 agosto a oggi sono entrate 141 modifiche nel codice buono, e dieci sono passate senza il via libera. In nove casi il controllo aveva detto no. Nel decimo non l'aveva proprio vista. Dieci su 141 fa il 7%, cioè circa una ogni due settimane. Non ti sto dicendo che quelle dieci fossero sbagliate. Ti sto dicendo che oggi nessuno le distingue.
>
> **Cosa devi fare.** Scegliere se dare la serratura a quel controllo. Card **#177** in coda, con tre strade e quella che consiglio. Non l'ho scelta io perché costa: se il controllo diventa obbligatorio e il codice buono è rosso per conto suo, non si può unire nemmeno la correzione che lo rimetterebbe verde.
>
> **Cosa non ho verificato.** L'impostazione com'è messa adesso non l'ho letta. GitHub non me la fa vedere da qui, mi risponde di no. Il «non è obbligatorio» lo deduco dal comportamento, non dall'averlo visto scritto: nove unioni sono passate col controllo rosso, e se fosse obbligatorio non avrebbero potuto. E non so se quelle dieci fossero giuste o sbagliate una per una, perché i registri di quelle giornate GitHub li ha già cancellati. Del tetto di tempo che ho messo sulla chiamata a GitHub ho controllato la forma, non il comportamento: non ho ricreato il caso con GitHub lento.
>
> **Come ci sono arrivato.** Ero partito convinto di sapere il difetto: «il controllo non parte quando la richiesta di unione la apre la macchina». L'ho misurato prima di ripararlo, e la misura mi ha dato torto. 140 richieste su 141 il controllo le aveva viste eccome. Il difetto non c'era, e il guardiano che stavo per costruire avrebbe protetto da niente. Quest'altro è saltato fuori dallo stesso conto, e non lo cercavo.
>
> **Le altre due cose riparate.** La prima è il comando che dà i numeri alle schede dei difetti. Cercava il numero libero in due posti: qui e nel codice buono. Ma un numero preso da un'altra sessione non è ancora nel codice buono. Vive per ore su un ramo aperto, invisibile a tutti e due. Cioè non guardava proprio la finestra in cui lo scontro si può ancora evitare. Sono due le collisioni del 25 agosto, e la prima l'ho scoperta solo perché un conto non tornava.
>
> La seconda è una fuga di chiave che avevo creato io stesso poche ore prima. L'ho trovata riguardando il mio lavoro con la lente «cosa succede se». Passavo la chiave di GitHub come argomento di un comando. Gli argomenti di un comando li legge chiunque abbia accesso alla stessa macchina.
>
> **Poi il cancello mi ha fermato, e ha fatto bene.** Le due lezioni di oggi hanno spinto l'archivio della memoria oltre il megabyte con cui viene servito. Il potatore ha detto che non poteva fare niente, e sono andato a vedere perché.
>
> Il 20 agosto è nata una parola nuova. Serve a dire «questa lezione l'ho ritirata di proposito». Non l'ha imparata nessuno: il potatore contava quelle quindici lezioni come ancora vive. Venti chilobyte che nessuno poteva più togliere. L'archivio stava a 702 byte dal muro già prima che arrivassi io. C'era anche uno strumento nato apposta per accorgersene, un mese fa, e non lo eseguiva nessuno.
>
> **E l'ultima me la sono fatta da solo mezz'ora fa.** Ho montato il conto delle unioni dentro il giro. Così facendo ho messo una chiamata a internet dentro il battito della macchina, senza tetto di tempo. Con GitHub lento il giro non fallisce: resta fermo lì. L'ho trovata riguardando quello che avevo appena scritto.
>
> **Dettagli tecnici, uno per riga.**
>
> AR-830: i rami aperti diventano la terza fonte in `prossimo-ar.mjs`. Nata AR-824. L'ho rinumerata perché un'altra sessione ha unito lo stesso numero su main venti minuti dopo che l'avevo preso io. Quel pezzo che resta è AR-831. AR-825: il cancello non è un controllo richiesto su main. AR-826: la chiave sulla riga di comando. AR-827: `ritirata` era una parola con un solo scrittore e nessun lettore. Cura: una funzione `lezioniSpente` accanto a quella che diceva chi è vivo. E il metro `conteggiPrivatiDelleLezioni` affilato e montato su una prova che gira sul repo vero. AR-828: i due tetti di tempo su curl. Strumento nuovo `node cervello/entrate-senza-cancello.mjs [--tetto 10]`, sola lettura, ⚪ dichiarato quando la chiave non c'è. Lezioni L-2026-0826-01 e L-2026-0826-02. Sette mutazioni, tutte provate rosse con `non-vacuita.mjs`. Radiografia del perimetro registrata su `rischio-sicurezza-se`: 2 file, 1 trovato.

> ⏰ **23/8 11:50 — La data zero è il 29 agosto, non il 29 settembre. Sei giorni, non trentotto.** Correzione di Nicola in chat: «29 agosto» e «va finito tutto quello che ho detto».
>
> **Cosa è cambiato.** Ieri sera avevo registrato il 29 settembre. Oggi Nicola ha corretto: la data è il **29 agosto 2026**. Restano **sei giorni più oggi**. Le quattro cose restano tutte e quattro: i difetti della macchina, i difetti del design del sito, il worker per le botteghe da costruire, il design della parte venditore mai lavorato.
>
> **Il conto vero.** 103 difetti aperti della macchina (più 10 da riverificare) e 208 del design del sito fanno **311 difetti** in sette giorni contando oggi: **44 al giorno**, festivi compresi. Il ritmo misurato finora è **8,4 al giorno**. Cinque volte meno. E le due costruzioni non sono in quel conto.
>
> **Il muro prima di tutto.** Il server è fermo dal 18 agosto alle 06:50. Finché è giù non si alza nessuna cadenza da sola. Un piano a 44 difetti al giorno con la macchina spenta non è un piano. Tre firme moltiplicano tutto il resto. La #168 riaccende il server. La #154 mette le chiavi mancanti su Vercel, quelle che tengono ferma la cassa. La #155 sposta il dominio, che punta ancora al server vecchio.
>
> **Cosa non ho verificato.** Il conto dei difetti l'ho letto dai file del cantiere alle 09:05 di oggi, non ho riaperto i difetti uno per uno. I 208 del design li ha trovati un esame del codice riga per riga. Non so se il server è ancora fermo adesso: l'ultima traccia è del 22 agosto alle 20:41.
>
> **Dettagli tecnici.** Fatto `cantiere.scadenza-zero` aggiornato alle 11:45 con `coerenza-fatti.mjs registra` e la caccia sul valore vecchio. Guardiano verde, exit 0 su 1310 file vivi. Piano dei sei giorni in `MyCity-Vault/90-Memoria-AI/PIANO-29-AGOSTO.md`.

> 🎨 **22/8 16:05 — Radiografia del design: 208 problemi veri, e due impediscono di caricare le foto.** Richiesta di Nicola in chat: «ora fai la radiografia del design».
>
> **Il conto.** Undici dimensioni in sola lettura sul ramo principale del sito, ognuna con un senior che cerca e un secondo che smonta: **208 problemi confermati** — 2 bloccanti, 86 gravi, 120 minori. Di questi 205 chiedono di toccare il codice, 3 si risolvono dai contenuti configurabili senza ripubblicare.
>
> **I due bloccanti hanno la stessa radice.** Il magazzino delle immagini accetta un file solo se la **prima cartella** del percorso è l'identificativo di chi carica (per gli amministratori c'è una sola eccezione, la cartella `home`). Tre punti del sito caricano invece in cartelle che si chiamano `store-media`, `events` e `shop`: il magazzino li rifiuta. Risultato: **un negoziante non riesce a mettere la copertina alla sua vetrina**, e dall'amministrazione non si caricano le copertine di Eventi e Negozio del mese. Nello stesso progetto ci sono già due file che usano il percorso giusto e lo spiegano nel commento.
>
> **Le gravi che costano di più.** Il carrello con due negozi scrive «Gratis*» sulla spedizione e intanto mette 9,80 € nel totale · le vetrine dicono «spedizione gratuita» mentre su ogni consegna a domicilio si pagano 3 € di «Consegna MyCity» · la scheda prodotto promette «carta o contanti alla consegna» ma la carta alla consegna non esiste · dopo un ordine riuscito il pulsante di conferma torna attivo, quindi **si può ordinare due volte** · carrello e cassa scrivono «Il tuo carrello è vuoto» prima che parta il programma, anche quando è pieno · dopo le 20:00 l'ordine parte con una fascia di consegna già passata · al muro dell'accesso si perdono codice sconto, metodo di pagamento e fascia, e al ritorno il totale è più alto · sul telefono, nella scheda prodotto, **nome e prezzo arrivano dopo** il riquadro del negozio, «Segnala» e la partita IVA · la chat di assistenza esiste ma il cliente non ha nessun modo di aprirla.
>
> **Cosa non ho verificato.** Non ho aperto nessuna pagina in un browser: questa radiografia legge il codice. I conti sui pixel sono calcoli fatti leggendo le classi, con la larghezza del carattere stimata: la direzione è giusta, la cifra esatta va confermata a schermo. Non ho toccato niente — l'audit è in sola lettura, trova e non ripara. Le tre voci «config» non le ho provate sul pannello vero.
>
> **Come.** 22 esperti, nessuno fallito, 11 dimensioni: layout e adattamento · coerenza col marchio · tipografia · accessibilità visiva · stati dell'interfaccia · immagini e media · esperienza da telefono · flussi di acquisto · testi dell'interfaccia · navigazione e gerarchia visiva · velocità percepita. Chi trova non conferma: ogni elenco è passato da un secondo esperto con la regola «nel dubbio scarta». Referto: `consegne/design/2026-08-22-radiografia-design.md`.

> 🧹 **22/8 14:10 — La radiografia del sito è a zero: tutti e centonovantanove i difetti sono chiusi. E dentro gli ultimi novantanove ce n'era uno che minore non era.** Richiesta di Nicola in chat: «risolvi anche i 99 minori».
>
> **Il conto, dall'inizio.** Il 21 agosto la radiografia aveva trovato 199 difetti: 12 bloccanti, 88 gravi, 99 minori. Stamattina alle 9:20 erano chiusi i 100 che pesano. Adesso sono chiusi anche i 99 piccoli. **Aperti: zero.**
>
> **La cosa più grossa non era piccola: la copia notturna del database non partiva più.** Ogni notte alle 02:17 un lavoro copia tutto il database e lo mette al sicuro, cifrato. È la rete che sta sotto a tutto il resto. Il programma che fa la copia si ferma se il database è più recente di lui, e installava «qualunque versione ci sia nel computer di turno»: la sedici. Il database vero — letto oggi con lo strumento di Supabase — gira la **diciassette**. Quindi la copia falliva, e falliva di notte, dove non guarda nessuno. Adesso la versione è scritta dentro il lavoro, con un controllo che lo ferma se il programma installato è quello sbagliato.
>
> **Le altre che si vedono.** ① Nella chat del prodotto al negoziante arrivava il **diario di bordo** dell'assistente («cerco sul web», «ho trovato tre schede simili») invece della risposta. ② Quello che la gente scrive nella **casella di ricerca** partiva così com'era verso il sistema di analisi negli Stati Uniti, email e numeri d'ordine compresi. ③ Nella tua tabella delle coorti il mese in corso mostrava «0%», che si legge «non è tornato nessuno», mentre la verità era «il mese non è ancora finito»: adesso c'è un trattino. ④ Il freno anti-abuso scattava **dopo** il controllo del login, quindi mille tentativi finti facevano mille domande al database prima di prendersi mille rifiuti.
>
> **🔴 Due cose che solo tu puoi fare**, accodate come carte. La prima: aprire Supabase → Settings → Database → Backups e scrivere cosa c'è davvero (che piano, se c'è il ripristino al minuto, quante copie giornaliere). Sono cinque minuti e chiudono quattro righe vuote nel documento del ripristino. La seconda: i **dati del titolare** — nome, indirizzo, partita IVA, PEC — che l'informativa privacy legge da nove variabili mai dichiarate. Adesso sono dichiarate ma vuote, e l'informativa esce col nome generico «MyCity». Vanno messe **prima** di ripubblicare, perché entrano nel sito quando viene ricompilato.
>
> **Il freno che ho lasciato.** Sedici prove nuove in questi ultimi tre lotti, e ognuna diventa rossa se il suo difetto torna. Otto le ho verificate **al contrario**: rimesso il difetto, guardata la prova diventare rossa, rimesso il codice com'era.
>
> **Cosa non ho verificato.** Niente di tutto questo l'ho visto girare in produzione. Non ho mai parlato con l'AI vera: in tutte le prove il modello è finto. Le pagine non le ho viste a schermo, ho letto il codice. E la copia notturna non l'ho vista riuscire: so che la versione adesso è quella giusta, il resto lo dirà stanotte.
>
> **Verificato:** 1136 prove unitarie verdi, 17 file di prova sul database verdi, controllo dei tipi pulito, lint senza errori. Niente in produzione: il lavoro è sul ramo `claude/marketplace-100-difetti-c62gmv` del sito. Referto: `consegne/audit/2026-08-22-marketplace-99-minori.md`.

> 🚚 **22/8 09:56 — Il sito era su Vercel, ma lavorava ancora come se fosse su Render. E due cose che solo tu puoi fare tengono ferma la cassa.** Richiesta di Nicola in chat: «ho cambiato il server da render a vercel, fai un'analisi completa e profonda e cambia tutto quello che c'è da cambiare».
>
> **La differenza che nessuno aveva tradotto.** Su Render c'era **una macchina accesa**, sempre la stessa, con la sua memoria. Su Vercel non c'è una macchina: c'è una funzione che si accende quando arriva qualcuno e si spegne appena ha finito. L'indirizzo era cambiato a luglio, il modo di lavorare no — e quasi tutto quello che ho trovato viene da lì.
>
> **Le cinque cose riparate nel codice del sito.** ① Le funzioni giravano a **Washington** mentre il database sta a **Parigi**: ogni domanda al database attraversava l'Atlantico e tornava, una volta per query. L'ho letto nel registro dei rilasci, campo `regions`: la produzione dice `iad1` (Washington), l'anteprima costruita dal ramo nuovo dice `cdg1` (Parigi) — il prima e il dopo, su due rilasci veri. *(Correzione delle 10:20: prima qui avevo scritto «provato guardando l'intestazione x-vercel-id». Quell'intestazione NON lo prova: il suo primo pezzo segue chi chiama, non dove gira la funzione. Me ne sono accorto chiamando l'anteprima e leggendo iad1 su un rilascio che gira a Parigi. La conclusione non cambia, cambia come si controlla.)* Adesso girano a Parigi, stessa città del database. ② I **lavori periodici** — mandare le email, pagare i negozi, scadere i carrelli — li faceva partire un servizio esterno gratuito, nato perché su Render il cron si pagava a parte. Ora li fa Vercel, che li ha inclusi. ③ Cinque di quelle nove rotte rispondevano **solo al POST**, e Vercel bussa solo in GET: sarebbero partite tutte prendendosi un «metodo non ammesso» — il giro risulta andato, e non ha fatto niente. ④ Nessun lavoro dichiarava **quanto può durare**: oltre il tetto la funzione viene tagliata a metà, senza un errore da nessuna parte. ⑤ Il **freno anti-abuso** contava su una memoria che non esiste più: «dieci tentativi al minuto» adesso sono dieci per ogni copia, e quante copie ci sono lo decide il traffico.
>
> **La cosa più brutta l'ho vista guardando l'HTML che il sito serviva davvero.** Ogni pagina diceva a Google che il suo indirizzo ufficiale è `http://localhost:3000` — il computer di chi sviluppa — e ogni link condiviso mostrava l'anteprima rotta. Il sito rispondeva 200 e sembrava a posto. Ho messo un paracadute nel codice: se l'indirizzo non è configurato, adesso usa quello che Vercel dichiara da solo invece di localhost.
>
> **🔴 Le due cose che il codice non può fare, e sono le più care.** Sono le carte **#154** e **#155**.
>
> La prima: **mancano delle chiavi fra le variabili su Vercel**, e una è quella con cui il sito scrive nel database quando ci avvisa Stripe che un cliente ha pagato. Senza, **un pagamento riuscito non diventa un ordine**. Non è un'ipotesi: nei registri della produzione fra il 18 e il 21 agosto ci sono **70 errori** con dentro il nome di quella chiave.
>
> La seconda: **il dominio `mycity-marketplace.com` punta ancora all'indirizzo di Render** (`216.24.57.1`). Il sito nuovo funziona — l'ho aperto, risponde — ma vive a `mycity-phi.vercel.app`, che non conosce nessuno. Il trasloco è finito, il cartello con l'indirizzo è rimasto sulla porta vecchia. È anche il motivo per cui la sentinella del sito è cieca da 146 giri: sta misurando Render.
>
> **Il freno che ho lasciato.** Una prova nuova diventa rossa se qualcuno aggiunge un lavoro periodico senza agganciarlo a Vercel, se una rotta smette di rispondere al GET (anche solo commentando la riga), o se sparisce la regione o il tetto di durata. Provato rompendo ognuna delle quattro cose, una alla volta, e guardandola diventare rossa.
>
> **Cosa non ho verificato.** Non ho potuto aprire il pannello di Vercel: so che quelle due chiavi mancano perché il sito **si comporta** come se mancassero, non perché ho letto la lista — potrebbero mancarne altre più silenziose. Che `216.24.57.1` sia di Render l'ho dedotto dall'indirizzo pubblico di Render e dalla storia, non da un pannello Render. E non ho aperto nessuna pagina in un browser: le prove sono girate qui.
>
> **Verificato:** 979 prove verdi sul sito, typecheck pulito, lint senza errori, build di produzione riuscita. Memoria coerente, 0 cacce aperte. Niente è andato in produzione: il lavoro è nei due rami `claude/render-to-vercel-migration-hf0nyj`.

> 🔴 **21/8 21:22 — I due bloccanti più cari adesso sono chiusi sul database VERO, non solo nel codice.** Nicola in chat: «fai la 151 e la 152».
>
> **Prima di toccare ho misurato, e non erano teorici.** Sul database di produzione `accumula_rimborso` risultava chiamabile **senza account**, insieme ad altre cinque funzioni potenti. È il numero che il sito sottrae dai guadagni mostrati al negozio. E tutte e tre le funzioni del codice di consegna portavano ancora il confronto che con un valore vuoto non sa dire di no.
>
> **Applicata in tre blocchi, controllando dopo ognuno**, come la carta prometteva. ① I permessi: sei funzioni su sei chiuse a chi non ha l'accesso, il server continua a poterle usare, i numeri di vendita restano visibili a chi ha fatto l'accesso. ② Il codice di consegna: tutte e tre fermano il valore vuoto per nome e usano il confronto che risponde sempre. ③ La funzione nuova che disfa un rimborso quando la banca lo rifiuta, usabile solo dal server.
>
> **Il conto: dieci controlli su dieci verdi**, letti dal database vero dopo l'ultimo blocco.
>
> **La consegna veloce di Pane Quotidiano è accesa.** Nicola ha scelto di accenderla, non di togliere l'interruttore. Una riga sola, da spento ad acceso, e la vetrina pubblica lo vede. Il valore di prima era spento: è la strada del ritorno.
>
> **Dei quindici bloccanti della radiografia di oggi ne resta aperto uno solo**, il rilascio automatico prima dei controlli — carta #141, dove l'ordine dei passi conta.
>
> **Cosa non ho verificato.** Non ho lanciato il file di prova SQL contro la produzione: quel file crea ordini e utenti finti, e non si fa sul database di un'azienda. Ho verificato leggendo i permessi veri e le definizioni vere delle funzioni, che è quello che il file misura. E non ho provato niente dal browser: il sito vero non risponde dal 30 luglio.

> 🔁 **21/8 20:31 — Passaggio lampo, stato identico al giro delle 18:03: 1 ordine (0 pagati), 8 profili, 1 negozio con vetrina, 5 prodotti. Macchina in SOPRAVVIVENZA, quota AI 191% (era 151% alle 16:27).**

> 🔧 **21/8 20:25 — Cantiere chiuso sui difetti che fermano qualcuno: tredici riparati su quindici, ognuno con la sua prova.** Nicola in chat: «ok 148».
>
> **Come li ho chiusi.** Per ogni difetto ho prima scritto una prova che diventa **rossa** finché il difetto c'è. Poi ho riparato. Poi ho guardato la stessa prova diventare verde. Nessuno è chiuso perché «ho cambiato il codice»: è chiuso perché un comando che prima falliva adesso passa.
>
> **I due del database li ho provati dal vivo.** Ho ricostruito lo schema da zero su un database locale, 126 modifiche su 126 applicate. Il codice di consegna a sei cifre si aggirava davvero: mandando un valore vuoto la funzione rispondeva «va bene» e l'ordine risultava consegnato. Adesso quello stesso tentativo viene respinto. Tredici controlli verdi, che senza la riparazione erano nove rossi.
>
> **Cosa ho riparato, in parole semplici.** ① Le funzioni potenti del database non sono più chiamabili senza un account. ② Il codice di consegna vuoto non passa più. ③ Il rimborso con carta adesso riaddebita la quota del negozio, e un rifiuto della banca non blocca più l'ordine per sempre. ④ Il doppio clic al momento di pagare non fa più due ordini. ⑤ Chi annulla un ordine pagato con carta riprende i suoi soldi. ⑥ Il pulsante SOS del fattorino si può premere, e il giro guidato non si apre più mentre stai pagando. ⑦ Chi ha detto no ai cookie non finisce più nel programma di statistiche, e ogni acquisto si conta una volta sola. ⑧ Il riempimento automatico del catalogo non può più toccare i prezzi.
>
> **La promessa di consegna adesso è una sola.** Nicola ha risposto: **30-60 minuti**. Riscritte 36 frasi in 28 file. Tolto il riquadro che al momento di pagare mostrava due tempi diversi. Le pagine spedizioni e domande frequenti adesso dicono la verità: l'ora parte da quando il negozio conferma, dentro l'orario di apertura, e a negozio chiuso parte il giorno dopo.
>
> **I due che restano, e perché.** Il primo sono i due buchi del database: il codice della riparazione è scritto, ma sul sito vero si chiudono solo quando la applichi — è la carta **#152**. Il secondo è il rilascio automatico che parte prima dei controlli: era già in coda come **#141**, e lì l'ordine dei passi conta, quindi non l'ho toccato.
>
> **Cosa non ho verificato.** Non ho aperto nessuna pagina in un browser. Il sito vero risponde ancora 503 da tre settimane (carta #146), quindi nulla di questo è stato provato su produzione. Tutte le prove sono girate qui.
>
> Il lavoro è nella richiesta di unione **#236** del sito, ramo `claude/marketplace-radiografia-design-9kj69c`. Niente è andato in produzione.

> 🌙 **21/8 18:03 — Report della sera. Business invariato, ma è la giornata con più riparazioni fatte sul codice del sito finora: registro difetti da 29 aperti a 3.**
>
> **I 7 numeri chiave** (via MCP Supabase, query diretta 18:02): ordini totali **1** (invariato), ordini pagati **0** (invariato), ultimo ordine 2026-06-24 (annullato, invariato), profili totali **8** (invariato da ieri sera), negozi con vetrina **1** (Pane Quotidiano, invariato), prodotti disponibili **5** (invariato). Stallo North Star **58 giorni**, dentro la pausa concordata fino al 24/8-1/9.
>
> **Il lavoro vero di oggi: cantiere di riparazione sul sito e sulla sicurezza.** Chiuse le card `#36` e `#37` (due falle di sicurezza ferme da 23 giorni, verificate risolte sul database vero) e `#140` (migrazione applicata: la vetrina dei negozi era sparita, ora torna a mostrarli). Accesa la prova gratuita in CI che verifica i permessi (card `#139`): ha trovato subito due difetti reali che nessun controllo saltato poteva vedere. Acceso il plugin di metodi di lavoro "superpowers" per la macchina, con un primo errore corretto in giornata.
>
> **Restano da firmare:** `#134` (il database non ha nessuna copia di sicurezza — servono due chiavi) · `#141` (dire ai controlli automatici che il sito lo pubblica Vercel, non più Render) · `#142` (comando da dieci secondi per rendere permanente il lavoro di oggi) · `#137`/`#138`/`#136` dal lotto precedente · la pratica pagamenti di Pane Quotidiano (`#62`), il vero blocco al primo incasso.

> 🔬 **21/8 16:20 — Radiografia completa del sito, codice e grafica insieme: 351 problemi veri, 15 che fermano qualcuno.** Richiesta di Nicola in chat: «fai una radiografia completa e profonda del marketplace, con la parte di design compresa».
>
> **Il conto.** Codice, 13 dimensioni: **199** problemi (12 bloccanti, 88 gravi, 99 minori), contro i 245 del 18 agosto. Grafica e percorsi, 11 dimensioni: **152** (4 bloccanti, 67 gravi, 81 minori). I bloccanti distinti sono **15**, non 16: il pulsante SOS del fattorino è stato trovato da due dimensioni diverse del design.
>
> **La cosa che conta più del numero: i dodici bloccanti del codice NON sono quelli del 18 agosto.** Quelli erano stati chiusi tutti, e il referto delle 3:30 di stamattina lo scrive: zero aperti. Questi sono nuovi, o mai visti dalle prime due visite. La lista si accorcia (262 → 245 → 199) ma il fondo non si svuota.
>
> **I quattro che pesano di più.** ① Chiunque, senza account, può marcare un ordine come «già rimborsato», e quel campo è il sottraendo dei guadagni mostrati al negozio. ② Il codice di consegna a sei cifre si aggira mandando un valore vuoto, e la consegna sblocca bonifico al negozio e paga al fattorino. ③ Un rimborso con carta non riaddebita mai la quota del negozio: la differenza la mette MyCity, e non è il caso raro (il bonifico parte 1 ora dopo la consegna, resi e reclami arrivano dopo). ④ Il pulsante SOS del fattorino è coperto in pieno da quello dell'assistenza: stesse coordinate, stesso livello, e sul telefono non si può premere.
>
> **Prove eseguite da me, non impressioni:** `tsc --noEmit` 0 errori · `vitest run` **943 verdi su 943** (114 file) · `next lint` 0 errori e 95 avvisi, **tutti di accessibilità** (52 etichette scollegate dal loro campo). Nessuna pagina aperta in un browser: tutto è letto nel codice e nel database.
>
> **Difetto della macchina trovato strada facendo:** i sei workflow in `.claude/workflows/` non partono su questo motore, perché hanno gli `import` sopra il blocco `meta`. Le due radiografie sono girate da copie generate al volo con gli stessi mansionari. Registrato come AR-780, non riparato: toccarlo è auto-modifica, quindi firma tua.
>
> **In coda per te:** **#148** (via libera al cantiere sui 15 bloccanti) · **#147** (quale promessa di consegna è vera, 30-60 minuti o 24-48 ore: oggi la home dice una cosa e il resto del sito un'altra).
>
> Referti: `consegne/audit/2026-08-21-radiografia.md` · `consegne/design/2026-08-21-radiografia-design.md`.

> 🔧 **2026-08-25 16:31 — Lotto 61. Nicola ha guardato il diff e ha visto quello che il guardiano non vedeva.**
>
> **In parole semplici.** Nicola ha detto: «secondo me stai facendo delle cavolate perché il diff è
> +22.000 e -15.000». Aveva ragione. Tre registri risultavano riscritti da cima a fondo con dentro le
> stesse identiche cose: le chiavi di 519 voci su 535 solo messe in fila diversa, e l'elenco dei
> difetti riordinato. Circa 12.900 cancellazioni che non cancellavano niente.
>
> **Cosa cambia per te.** La richiesta #835 era illeggibile, e leggerla è il motivo per cui te la
> mando. Rimesso l'ordine, il ramo è passato da +21.002/-14.266 a +8.129/-1.393 senza perdere una
> voce: 803 difetti, 535 lezioni, 805 mutazioni prima e dopo. L'hai unita il 25/8.
>
> Poi il pezzo che conta: **esisteva già un guardiano apposta per questa cosa, ed era verde.**
> `forma-json.mjs` è nato il 30 luglio per i file riscritti tutti per cambiarne una riga.
> Misurava solo l'indentazione. E l'indentazione non era cambiata.
>
> **Per esempio** una lezione qualsiasi del registro. Prima elencava «id, testo, tag». Dopo elencava
> «reparto, fonte, gate». Stessi campi, stessi valori, nemmeno una parola diversa — eppure per git è
> una riga cancellata e una riaggiunta. Moltiplicato per 519 voci su 535.
>
> I modi di riscrivere un file per intero sono tre: l'indentazione, l'ordine delle chiavi, l'ordine
> delle voci. Ne guardava uno, quello del giorno in cui è nato. È AR-813, ed è la lezione di AR-807
> applicata al guardiano scritto per curarla.
>
> **Cosa devi fare.** Guardare la nuova richiesta di unione e dirmi se va bene. Tutto il lavoro resta
> dentro la macchina: non tocca il sito, non muove un euro, non scrive a nessuno.
>
> **Cosa non ho verificato.** Non ho letto il database in questo giro: i numeri qui sopra restano
> quelli misurati il 24 agosto alle 13:05 e non sono una misura di adesso. E non so ancora **cosa**
> abbia rimescolato quelle voci durante la fusione: ho tolto il sintomo e messo il freno che lo
> intercetta, non ho trovato la mano che l'ha fatto.

## Passaggi precedenti

> 🔧 **22/8 20:25 — Lotto 49. Il metro sotto-contava di un terzo, e la macchina lo sapeva.**
>
> **In parole semplici.** Alcuni strumenti con cui la macchina si misura non potevano bocciare
> nessuno. Uno contava nove errori e ne vedeva sei. Un altro promuoveva tutti e centoventi i
> mansionari. Adesso possono dire di no, e infatti lo dicono.
>
> **Cosa cambia per te.** I numeri che leggi nella Cabina sull'apprendimento erano gonfiati: nove
> esperimenti risultavano «misurati» senza essere mai partiti. Adesso dicono il vero. E il metro dei
> mansionari, che ti diceva «120 su 120 a posto», ora te ne segnala 82 da sistemare.
>
> **Cosa devi fare.** Guardare la richiesta di unione e decidere se va bene. Nient'altro: nessuna
> azione sul mondo reale, nessuna spesa, nessun messaggio a nessuno.
>
> **Cosa non ho verificato.** Quante altre prove siano scritte sulla presenza del difetto invece che
> sulla capacità di riconoscerlo. Per contarle serve prima un guardiano che le sappia vedere, e non
> c'è. E il typecheck del Pannello qui non gira: manca l'installazione delle librerie.
>
> ---
>
> Malattia del lotto: **un metro che non può fallire**. Quattro corsie in parallelo più il lavoro
> dell'AD, ognuna coi suoi file, nessuna autorizzata a toccare i registri condivisi.
>
> **Il caso che dà il nome al lotto.** Nel registro degli esperimenti nove schede su dieci dicevano
> «misurato». La loro stessa nota diceva un'altra cosa: che il cancello non era mai partito. Cioè il
> volano contava come imparate delle cose mai successe. Esempio vero: EXP-004 diceva «misurato» e
> sotto scriveva «il post non è mai stato pubblicato».
>
> **La regola per riconoscerli c'è dal 15 agosto, e ha una casa sola.** Ma il programma che doveva
> contarli non la chiamava: se n'era scritta una copia in casa propria. Le due non erano d'accordo.
> La copia ne vedeva **sei**, la casa unica **nove**. Tre esperimenti erano invisibili proprio al metro
> che doveva contarli. E il metro stampava un numero preciso: è così che un errore del genere
> sopravvive. La copia privata è stata cancellata, non corretta.
>
> **Il secondo giro ha trovato il buco vero, e non era nel difetto.** I nove li avevo corretti a mano.
> Il correttore non lo chiamava nessuno nella macchina viva. Riparare la porta a mano e lasciare
> aperta quella automatica è il modo più sicuro di far tornare un difetto da solo. Adesso il guardiano
> degli esperimenti corregge da sé, e **dichiara** quali etichette ha corretto.
>
> **Il metro dei mansionari, prima, promuoveva tutti: 120 su 120.** Contava quattro titoli che il
> modello di partenza garantisce per costruzione. Adesso ne passano **38**. Gli 82 bocciati non sono
> peggiorati stanotte: erano così, e nessuno li poteva vedere.
>
> **Due difetti nuovi, nati guardando.** ① Ci sono prove verdi **solo finché il difetto c'è**:
> pretendono che la bugia sia ancora sul disco. Curarla le fa diventare rosse. Il banco puniva chi
> guarisce. Le tre trovate sono riscritte. ② Il timbro che marca ogni misura scriveva «ho guardato zero
> cose» su chi non dichiarava quanto aveva guardato. La difesa che impedisce a una sessione cieca di
> calpestare i numeri veri del server confronta proprio quel numero: confrontava zeri.


---

> 📦 **Le voci piu' vecchie sono nell'archivio.** Questo file era arrivato a
> 162.157 caratteri. Sopra i 200.000 il controllo che tiene leggibili
> i testi non riesce a leggerlo intero, quindi su questo file smetteva di
> proteggerlo. Le 19 voci piu' vecchie stanno in
> `MyCity-Vault/90-Memoria-AI/Archivio/STATO-archivio.md`, spostate senza
> riscrivere niente.
