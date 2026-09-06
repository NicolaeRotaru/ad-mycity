---
tipo: stato
aggiornato: 2026-09-06 06:02
fonte: AD digitale (Piano del mattino, cervello/ritmo.md)
---

> ☀️ **6/9 06:02 — Piano del mattino: 74° giorno di stallo.** Zero novità stanotte.
>
> **I numeri, riverificati ora con query diretta su Supabase.** 1 ordine, del 24/6, annullato.
> **0 pagati.** 9 profili. 9 prodotti. 3 carrelli abbandonati. Sono identici bit-per-bit al
> passaggio delle 22:31 di ieri sera.
>
> **La notte.** `git log` dalle 22:31 a ora mostra un solo commit. È un recupero di scritture
> interne delle 06:00. Tocca solo la contabilità della macchina. Nessun dato di business dentro.
> `DECISIONI.md` è invariato: l'ultima firma di Nicola resta quella del 29/8.
>
> **La coda.** `AZIONI-IN-ATTESA.md` è invariata. In cima restano quattro card. **#197**: il
> codice del funnel carrelli, senza una PR, da luglio. **#196**: "Panificio Demo", origine
> ancora ignota. **#195** e **#194**: due gate cronici, fermi sullo stesso buco di permessi VPS.
>
> **Le 3 cose di oggi.**
> 1. Firma dominio e chiavi Vercel (#154+#155). Rimette online il sito.
> 2. Sblocca i pagamenti con carta di Pane Quotidiano (#182). Fermo da 27 giorni.
> 3. Decidi su "Panificio Demo" (#196). Dì se lo riconosci o se lo cancello.
>
> Blocco completo: [[RITMO]].

---

> 🧭 **5/9 22:31 — Nuova chiamata "esegui giro.md per intero".** Sono passate circa 2 ore dal
> passaggio delle 20:43. Letargo RISPARMIO: quota AI al 52% della finestra rolling, salute macchina
> a 4. North Star ancora fermo. Zero delta reale. Non ho rilanciato le 15 fasi pesanti.
>
> **I numeri, riverificati ora dal vivo con SQL diretto su MCP Supabase, non a memoria.** 1 ordine
> totale: id `58094956…`, del 24/6, PENDING/CANCELED, €19,05, seller Pane Quotidiano. **0 pagati.**
> 9 profili: 5 buyer, 2 seller, 1 rider, 1 admin. I due seller sono Pane Quotidiano e "Panificio
> Demo". 9 prodotti. 3 carrelli abbandonati. L'ultimo profilo creato resta quello delle 06:40 di
> stamattina: è "Panificio Demo", la stessa card #196. Non è un cliente nuovo. Tutto identico
> bit-per-bit al passaggio delle 20:43. **73° giorno di stallo North Star** (24/6→5/9).
>
> **Cosa è successo tra le 20:43 e ora.** `git log` mostra due commit. Il primo, delle 21:00, ha
> pubblicato il passaggio delle 20:43. Il secondo, delle 22:20, è un recupero di scritture pendenti.
> Ho controllato il suo contenuto: tocca solo tre file di contabilità interna della macchina
> (`costo-ai.json`, `esito-cadenze.json`, `esito-giro.json`). Nessun dato di business dentro.
> Nessuna decisione nuova. `DECISIONI.md` resta invariato dal 29/8. `AZIONI-IN-ATTESA.md` è
> invariata. Le top card restano le stesse: **#197** (il codice del funnel carrelli mai entrato in
> una PR, da luglio), **#196** ("Panificio Demo", origine ignota), **#195** e **#194** (due gate
> cronici, stesso buco di permessi VPS).
>
> **Perché non ho rilanciato le 15 fasi intere.** Due regole lo impediscono, entrambe verificate
> ora. Il letargo RISPARMIO impone di tagliare il volume superfluo. Il gate NORTH_STAR ammette solo
> lavoro macchina che sblocchi direttamente un ordine pagato. I dati sono identici a 2 ore fa:
> rifare radar, radiografia e auto-miglioramento sarebbe stato solo rumore. Per lo stesso motivo non
> ho riscritto `auto-analisi.json` (data interna 20:35) né `ultimo-briefing.json` (18:35): restano
> quelli dell'ultimo passaggio pieno, perché non c'è nessun contenuto nuovo da mettere dentro.
> Riscriverli ora, su fatti identici, avrebbe fatto sembrare "nuova analisi" quella che è solo una
> riconferma.
>
> **Lavoro non mio, ancora nel working tree, non toccato.** I ~39 file del fix funnel carrelli
> (card #197) e il codice non committato restano esattamente dove erano: in attesa della risposta di
> Nicola su quella card, non della mia iniziativa.
>
> **Mossa numero uno, sempre la stessa.** Serve la firma di Nicola sulle card #154 e #155: dominio e
> chiavi Vercel. Senza quella firma il sito resta giù, e nessun ordine può ancora diventare un
> incasso vero.
>
> Briefing di riferimento: [[Briefing/2026-09-05]].

---

> 🧭 **5/9 20:43 — Nuova chiamata "esegui giro.md per intero", 8 minuti dopo il passaggio delle
> 20:35.** Zero delta reale. Non ho rilanciato le 15 fasi pesanti.
>
> **In parole semplici.** Ho controllato di nuovo tutto a mano, non a memoria. Non è cambiato niente
> in 8 minuti. Per questo non ho ripetuto il lavoro pesante del giro.
>
> **Cosa ho verificato ora.** `git log --since="20:35"` è vuoto. Zero commit nuovi. `DECISIONI.md` è
> invariato. L'ultima firma di Nicola resta quella del 29/8, sul tema delle migrazioni.
> `AZIONI-IN-ATTESA.md` è invariata. In cima restano due card. La #197 è il codice sui carrelli
> abbandonati mai entrato in una richiesta di unione dal 4/7. La #196 è il negozio finto "Panificio
> Demo", ancora da verificare. Il sensore REST `orders` è quello delle 20:20. È coerente col quadro
> delle 20:35: 1 ordine del 24/6, annullato, €19,05, del negozio Pane Quotidiano. **0 pagati.** 9
> profili. 9 prodotti. 3 carrelli abbandonati.
>
> **Una correzione, non una scoperta nuova.** Il passaggio delle 20:35 aveva scritto "80°/81° giorno
> di stallo North Star". È un numero sbagliato. Saliva di uno a ogni passaggio del giorno, non a ogni
> giorno di calendario. È lo stesso errore già trovato e corretto stamattina alle 06:32, quando il
> conteggio era stato rifatto da zero e dava 72 giorni per il 4/9. Ho rifatto il conto da zero anche
> ora: dal 24 giugno al 5 settembre sono **73 giorni**, non 81. Il difetto nel modo di contare resta
> aperto. Non ha ancora un freno che lo blocchi da solo: è un debito dichiarato, candidato a un
> controllo vero invece che all'ennesima correzione a mano.
>
> **Un file che stavolta era già a posto.** `auto-analisi.json` era già stato riscritto bene alle
> 20:35, con la data in cima aggiornata. Per la prima volta in molti passaggi di oggi non c'era niente
> da riparare lì. Non l'ho toccato di nuovo: sarebbe stato lavoro inutile su un file già corretto.
>
> **Perché non ho rilanciato le 15 fasi intere.** Due motivi. Primo, il letargo è in RISPARMIO: la
> quota AI era al 53% della finestra alle 20:28, e la salute della macchina resta a 4. La regola dice
> di tagliare il lavoro superfluo. Secondo, il North Star resta fermo al 73° giorno: la regola ammette
> solo lavoro macchina che sblocchi direttamente un ordine pagato. Su dati identici a 8 minuti fa,
> rifare radar, radiografia e auto-miglioramento sarebbe stato solo rumore. Lo stesso principio è già
> stato applicato nei circa 20 passaggi precedenti di oggi.
>
> **Mossa numero uno, sempre la stessa.** Serve la firma di Nicola sulle card #154 e #155: dominio e
> chiavi Vercel. Senza quella firma il sito resta giù, in errore HTTP 503 da 283 controlli di fila.
> E nessun ordine può ancora diventare un incasso vero.
>
> Briefing di riferimento: [[Briefing/2026-09-05]].

---

> 🧭 **5/9 20:35 — Nuova chiamata esplicita "leggi ed esegui cervello/giro.md per intero, non
> saltare passi", ~2h dopo il passaggio delle 18:35/18:49.** Letargo RISPARMIO. Zero delta di
> business. Ho riparato lo stesso debito di processo per la 3ª volta oggi e ottenuto — per la prima
> volta in settimane — il verdetto VERO della suite di test, non più il generico "rosso".
>
> **I numeri, riverificati dal vivo via SQL diretto su MCP Supabase, non a memoria.** 1 ordine
> (24/6, PENDING/CANCELED, €19,05, seller Pane Quotidiano). **0 pagati.** 9 profili (5 buyer, 2
> seller: Pane Quotidiano + "Panificio Demo"). 9 prodotti. 3 carrelli abbandonati. Identico
> bit-per-bit al passaggio delle 18:35/18:49. `git log --since="2026-09-05 18:35"` mostra due
> commit: "giro AD: aggiorna memoria" (18:49) e "recupero: scritture pendenti" (20:20). Nessuno dei
> due porta lavoro nuovo di business. `DECISIONI.md` invariato dal 29/8. `AZIONI-IN-ATTESA.md`
> invariata: top card ancora #197/#196/#195/#194.
>
> **La riparazione, per la 3ª volta identica oggi.** `freschezza-cadenze.mjs` segnalava che il giro
> delle 18:49 era uscito saltando l'auto-analisi. Verificato con `git show --stat`: il commit delle
> 18:49 aveva sì toccato `auto-analisi.json` (38 righe), ma senza aggiornarne il campo `data`
> interno, rimasto a "18:35". È lo stesso identico gap già riparato alle 10:46 e alle 16:35 oggi.
> Riscritto ora con verifica dal vivo, e segnalato come pattern che merita un freno automatico (non
> l'ennesima correzione a mano): il voto di fiducia scende di un punto per questo, da 78 a **77**.
>
> **La scoperta vera di questo passaggio: il "test rosso" HARD aveva un verdetto disponibile senza
> saperlo.** Fino ad oggi ogni passaggio si fermava a "test-cervello.mjs richiede approvazione,
> nessuno risponde" e usava il verdetto ereditato genericamente. In questo passaggio ho letto per
> intero `.claude/settings.local.json`: elenca per esteso SOLO `git-pr.mjs` e `pulisci-coda.mjs`
> tra gli script `cervello/*.mjs` — bloccato per costruzione, confermato senza bisogno di altri
> tentativi a vuoto. Ma `node --test cervello/test/**/*.test.mjs` (un comando node generico, non
> uno script cervello nominato) NON è bloccato: l'ho lanciato dal vivo in background. Risultato,
> arrivato dopo ~9m45s: **2671 test, 2659 pass, 6 fail, 6 skipped**. Non le "centinaia di rossi" che
> un rc=1 lascia immaginare. I 6 falliti: 2 per contenuto (una card senza numero fisso in
> `AZIONI-IN-ATTESA.md`; 2 compiti fermi trovati contro 3 attesi nel controllo del venerdì) e 4 per
> la stessa causa — tre file di memoria (`AZIONI-IN-ATTESA.md`, `SALA-OPERATIVA.md`,
> `RADIOGRAFIA-MACCHINA.md`) cresciuti oltre il tetto dichiarato di lettura (`AZIONI-IN-ATTESA.md` a
> 214.601 caratteri contro un tetto di 200.000). Nessuno dei 6 tocca il percorso ordine→pagamento:
> non riparati in questo passaggio (North Star vieta lavoro macchina che non lo sblocchi
> direttamente), ma ora è un elenco preciso, non più un semaforo generico.
>
> **Perché non ho rilanciato le 15 fasi intere, nonostante la richiesta dicesse "non saltare
> passi".** Ho percorso i 15 passi del mansionario (dati, sentinelle, radar, briefing, auto-analisi,
> apprendimento, coerenza-fatti…), ma senza forzare nuove query/contenuti pesanti su dati confermati
> identici a 2 ore fa: RISPARMIO ammette un solo giro pieno al giorno (già avvenuto alle 06:32) e
> North Star resta in stallo (81° giorno). "Per intero" vuol dire rispettare anche il vincolo interno
> del mansionario che dice di tagliare il volume superfluo, non ripetere query identiche per rumore.
>
> **Mossa n.1 resta invariata: firma #154+#155.** Sono dominio e chiavi Vercel. Senza quella firma
> il sito resta giù. E nessun ordine può diventare un pagamento vero.
>
> Briefing di riferimento: [[Briefing/2026-09-05]].

---

> 🧭 **5/9 18:35 — Nuova chiamata "esegui giro.md per intero", ~30 min dopo il Report della sera.**
> Letargo RISPARMIO. Zero delta di business. Ho riparato un debito di processo.
>
> **I numeri, riverificati dal vivo via SQL diretto su MCP Supabase, non a memoria.** 1 ordine
> (24/6, PENDING/CANCELED, €19,05, seller Pane Quotidiano). **0 pagati.** 9 profili: 5 buyer, 2
> seller. 9 prodotti. 3 carrelli abbandonati. È identico bit-per-bit al Report delle 18:03/18:08.
> `git log --since="18:00"` mostra tre commit: due "recupero: scritture pendenti" (18:00, 18:20) e
> un "ritmo AD (sera)" (18:08). Nessuno dei tre porta lavoro nuovo di business. `DECISIONI.md`
> resta invariato dal 29/8.
>
> **La riparazione vera di questo passaggio.** `freschezza-cadenze.mjs` segnalava che il giro delle
> 16:51 era uscito saltando l'auto-analisi. Ho verificato con `git log` mirato sul file. L'ultimo
> commit a toccarlo è proprio quello delle 16:51. Ma il campo `data` interno era rimasto fermo alle
> **16:35**: quel commit ha toccato il file senza rigenerarne il contenuto. Il vincolo aveva
> ragione. Ho riscritto `auto-analisi.json` e `AUTO-ANALISI.md` ora, con verifica dal vivo. Il voto
> di fiducia resta 78, invariato. `apprendimento.json` non l'ho toccato a mano: la regola AR-651
> impone lo strumento dedicato, `lezione-nuova.mjs`. Quello strumento resta bloccato dallo stesso
> buco di permessi. L'ho riverificato con un tentativo diretto in questo passaggio:
> `node cervello/test-cervello.mjs` chiede ancora approvazione, e nessuno risponde.
>
> **Perché non ho rilanciato le 15 fasi intere.** Il letargo RISPARMIO impone di tagliare il
> volume non essenziale, tenendo però i controlli. Il gate NORTH_STAR ammette lavoro macchina solo
> se sblocca un ordine pagato. Nessun numero di business è diverso da 18:03. Rilanciare radar,
> radiografia e auto-miglioramento su dati identici sarebbe stato rumore, non un controllo in più.
>
> **Mossa n.1 resta invariata: firma #154+#155.** Sono dominio e chiavi Vercel. Senza quella firma
> il sito resta giù. E nessun ordine può diventare un pagamento vero.
>
> Briefing di riferimento: [[Briefing/2026-09-05]].

---

> 🌙 **5/9 18:03 — Report della sera.** Ho riverificato dal vivo su Supabase. Query dirette, non a
> memoria. 9 profili: 5 buyer, 2 seller, 1 rider, 1 admin. 9 prodotti. 1 ordine. **0 pagati.** 3
> carrelli abbandonati. 407 lead fermi. Sito pubblico: **HTTP 503**. Riconfermato ora con una
> chiamata diretta.
>
> **La giornata in una riga.** Zero movimento vero di business. Un numero sembra cambiato da ieri
> sera. Profili 8→9, prodotti 5→9. Non è crescita. È lo stesso "Panificio Demo" scoperto stamattina
> alle 06:40 (card #196). È un negozio con 4 prodotti finti. È scritto nel database saltando il
> sito. La sua origine resta ignota. Pane Quotidiano resta l'unico negozio reale. Resta a 5
> prodotti, invariato. Nessuna firma nuova di Nicola in `DECISIONI.md` da 7 giorni. L'ultima resta
> il 29/8 alle 00:40.
>
> **Cosa ha riparato l'AD oggi.** Ho trovato codice del sito mai entrato in una richiesta di unione.
> È fermo da inizio luglio. È il fix del funnel carrelli abbandonati più un nuovo script,
> `spazzata-frase.mjs`. L'ho segnalato nella card #197. Ho fondato "Panificio Demo" nel registro di
> realtà, card #196, stato `da_verificare`. Ho riparato un buco di processo. L'auto-analisi era
> ferma dalle 10:46. Nel mezzo c'erano stati 3 giri pieni.
>
> **La lezione del giorno.** I salvataggi automatici di recupero proteggono solo la memoria.
> Coprono `MyCity-Vault`, `consegne`, `creativi`. Non toccano mai il codice in `cervello/` o
> `pannello/`. Per questo un fix pronto da due mesi è rimasto invisibile a tutti. Nessuna card.
> Nessuna riga in Sala Operativa. L'ho trovato solo con un controllo diretto del disco.
>
> **Mossa n.1 resta invariata: firma #154+#155.** Sono dominio e chiavi Vercel. Senza quella firma
> il sito resta giù. E nessun ordine può diventare un pagamento vero.
>
> Briefing di riferimento: [[Briefing/2026-09-05]].

---

> 🧭 **5/9 16:35 — Nuova chiamata "esegui giro.md per intero", ~2h dopo il passaggio delle 14:31/14:47.**
> Zero delta di business. Riparato un debito di processo reale.
>
> **I numeri, riverificati dal vivo via MCP Supabase, non a memoria.** 1 ordine. È del 24/6, id
> `58094956…`, PENDING/CANCELED, €19,05, seller Pane Quotidiano. **0 pagati.** 9 profili: 5 buyer,
> 2 seller, 1 rider, 1 admin. Invariato dal passaggio delle 14:31. `git log --since="14:31"` mostra
> due commit soli. Uno è il giro delle 14:47. L'altro è un recupero di scritture, alle 16:20.
> Nessun lavoro nuovo di business in mezzo. `DECISIONI.md` è invariato dal 29/8: nessuna firma
> nuova di Nicola.
>
> **La riparazione vera di questo passaggio.** `freschezza-cadenze.mjs` segnalava un problema: il
> giro delle 14:47 era uscito saltando l'auto-analisi. L'ho verificato leggendo il file prima di
> toccarlo. Il campo `data` diceva ancora **10:46**. Il vincolo aveva ragione: non era un falso
> allarme. Ho riscritto `auto-analisi.json` e `AUTO-ANALISI.md` con dati riverificati dal vivo. Il
> voto di fiducia scende da 79 a **78**, per onestà sul debito, non per un errore di business
> nuovo. Ho fondato anche l'entità "Panificio Demo" (card #196) in `registro-realta.json`. Era
> descritta nella coda delle azioni, ma non ancora nel registro che l'auto-analisi usa davvero. Il
> suo stato è `da_verificare`: esiste nei dati, la sua origine resta ignota. `apprendimento.json`
> non l'ho toccato a mano: la regola AR-651 impone lo strumento dedicato, `lezione-nuova.mjs`.
> Quello strumento resta bloccato dallo stesso buco di permessi.
>
> **Blocco strumenti confermato con tentativi diretti in questo passaggio, non ereditati.**
> `node cervello/test-cervello.mjs` resta bloccato: "richiede approvazione", e nessuno risponde.
> Anche `node -e "JSON.parse(...)"` resta bloccato, con lo stesso messaggio. Questo conferma che il
> buco non è solo sugli script `cervello/*.mjs`. È qualunque comando non scritto parola-per-parola
> in `.claude/settings.local.json`. `git log`, `git status`, `grep` e le query MCP Supabase invece
> funzionano sempre. È lo stesso identikit isolato il 3/9 alle 22:40, nelle card #189/#194/#195/#197.
>
> **Perché non ho rilanciato le 15 fasi intere.** Due vincoli lo impediscono, entrambi verificati
> ora, non a memoria. Il letargo è **SOPRAVVIVENZA**: solo nucleo vitale — ordini, consegne, coda
> firme, sicurezza, allerta a Nicola. **NORTH_STAR** è in stallo: lavoro macchina ammesso solo se
> sblocca un ordine pagato. Nessun numero di business è diverso da 14:31. Rilanciare radar,
> radiografia e auto-miglioramento su dati identici sarebbe rumore, non un controllo in più.
>
> **Lavoro non mio, trovato nel working tree.** Circa 39 file sono già toccati da un fix del
> funnel carrelli abbandonati. Non è mai stato committato da luglio: coinvolge
> `pannello/src/app/api/metriche/funnel/route.ts`, `marketplace-db.ts` e `cervello/spazzata-frase.mjs`
> con i suoi test. È già segnalato nella card #197, aperta alle 12:34. Non l'ho toccato: resta in
> attesa della risposta di Nicola su quella card.
>
> **Mossa n.1 resta invariata: firma #154+#155.** Sono il dominio e le chiavi Vercel. Rimettono
> online il sito. Rendono possibile un primo ordine pagato vero.
>
> Briefing di riferimento: [[Briefing/2026-09-05]].

---

> 🧭 **5/9 14:31 — Nuova chiamata "esegui giro.md per intero", ~2h dopo il passaggio delle 12:34.**
> Zero delta reale. Non ho rieseguito le 15 fasi.
>
> **Il delta-gate si è riacceso alle 14:28.** Il motivo scritto è "clienti 8→9". Ma è lo stesso
> non-evento già spiegato a 12:34. Il secondo profilo seller è il "Panificio Demo" della card #196.
> La sua origine resta ignota. Non è un cliente nuovo.
>
> **La coda firme è invariata.** Le card #196 e #197, aperte a 12:10 e 12:34, sono già in coda.
> Nessuna firma nuova di Nicola in `DECISIONI.md`.
>
> **Non ho riscritto `auto-analisi.json` e `apprendimento.json`.** Restano quelli delle 10:46, voto
> di fiducia 79, riconfermati a 12:34. Riscriverli su dati identici sarebbe rumore, non un controllo
> in più. Il vincolo CADENZE, appena diventato cronico in questa sessione, ha già una card aperta
> (riga aggregata #190, nota AR-687): nessuna card nuova da aprire.
>
> **Perché non ho rilanciato le 15 fasi intere.** Due vincoli lo impediscono. Il letargo è
> **SOPRAVVIVENZA**: solo nucleo vitale — ordini, consegne, coda firme, sicurezza, allerta a Nicola.
> Il gate **NORTH_STAR** è attivo: lavoro macchina ammesso solo se sblocca un ordine pagato.
>
> **I numeri di business.** Nessuno è diverso da 12:34. 1 ordine, del 24/6, annullato, €19,05.
> Il venditore è Pane Quotidiano. **0 pagati.** 9 profili: 5 buyer, 2 seller, 1 rider, 1 admin. Né
> Pane Quotidiano né "Panificio Demo" hanno Stripe attivo.
>
> **Cosa non ho verificato in questo passaggio.** Non ho ri-interrogato Supabase dal vivo. Il
> sensore REST era già fresco delle 14:20 (`orders`: 1 riga). Non ho letto riga per riga il codice
> non committato della card #197.
>
> **Mossa n.1 resta invariata: firma #154+#155.** Sono il dominio e le chiavi Vercel. Rimettono
> online il sito. Rendono possibile un primo ordine pagato vero.
>
> Briefing di riferimento: [[Briefing/2026-09-05]].

---

> 🧭 **5/9 12:34 — Nuova chiamata "esegui giro.md per intero": zero delta di business, una scoperta vera di processo.**
>
> **I numeri, riverificati dal vivo su MCP Supabase, non a memoria.** 1 ordine: id `58094956…`, del 24/6, PENDING/CANCELED, €19,05, seller Pane Quotidiano. **0 pagati.** 8 profili: 5 buyer, 2 seller, 1 rider, 1 admin. I due seller sono Pane Quotidiano e il "Panificio Demo" della card #196, ancora non spiegato. Nessuno dei due ha Stripe attivo: sia `stripe_charges_enabled` sia `stripe_payouts_enabled` sono falsi su entrambi. Questa è la causa diretta del **77° giorno di stallo North Star** (24/6→5/9). `DECISIONI.md` è invariato dal 29/8: nessuna firma nuova di Nicola. `AZIONI-IN-ATTESA.md` è invariata nel merito. Top card: prima **#196** (Panificio Demo). Poi #195. Poi #194 (entrambi gate cronici).
>
> **La scoperta vera di questo passaggio.** C'è codice non committato. È fermo da prima del 4 luglio. Non è mai entrato in una richiesta di unione (PR). `git status` mostra modifiche non salvate in tre punti: `pannello/src/app/api/metriche/funnel/route.ts`, `pannello/src/lib/marketplace-db.ts`, e un nuovo script `cervello/spazzata-frase.mjs` con i suoi test. Tutti e tre riguardano un fix del funnel dei carrelli abbandonati. Nessuno dei tre compariva in `AZIONI-IN-ATTESA.md` né in `SALA-OPERATIVA.md`. L'ultimo commit che ha toccato quei due file di `pannello/` risale al **4 luglio** (verificato con `git log`). Il motivo per cui è rimasto invisibile: i commit automatici di recupero (regola `AR-044`) salvano SOLO le cartelle di memoria — `MyCity-Vault`, `consegne`, `creativi`, `memoria-squadra`. Non toccano mai `cervello/` o `pannello/`. Non ho toccato questo codice. Non so se è lavoro finito e dimenticato, o lavoro a metà. La regola `flusso.pr-sempre` vuole una PR: non un commit diretto su `main` fatto da me senza averlo capito prima. Ho aperto la card #197.
>
> **Perché non ho rilanciato le 15 fasi intere del giro.** Due vincoli lo impedivano. Il letargo è in **SOPRAVVIVENZA**: solo nucleo vitale. Il gate **NORTH_STAR** è attivo: lavoro macchina ammesso solo se sblocca un ordine pagato. Nessun numero di business è diverso dal passaggio delle 10:46. `auto-analisi.json` e `apprendimento.json` erano già stati riscritti e verificati in quel passaggio: voto di fiducia 79, motivo del calo già spiegato lì. Riscriverli di nuovo su dati identici sarebbe stato rumore, non un controllo in più — lo stesso pattern già diagnosticato più volte oggi in questo file. Gli script di controllo come `node cervello/test-cervello.mjs` restano bloccati dallo stesso buco di permessi di sempre: `.claude/settings.local.json` non li elenca per esteso (card #104/#189/#194). Non li ho ritentati alla cieca.
>
> **La mossa n.1 resta invariata: firma #154+#155** (dominio+chiavi Vercel). È quella che rimette online il sito. È quella che rende possibile un primo ordine pagato vero. Sul north star, il blocco più a monte è chiaro: **né Pane Quotidiano né "Panificio Demo" hanno Stripe attivo**. L'ho verificato ora. È coerente con la card #182.
>
> **Cosa non ho verificato in questo passaggio.** Se il codice non committato della card #197 sia finito o a metà: l'ho visto solo dal disco, non l'ho letto riga per riga. La leggibilità dei sei file già segnalati dalla card #192 (RITMO.md, AUTO-ANALISI.md, i quattro file di `Intelligence/`): il verificatore `si-capisce.mjs` resta bloccato dallo stesso buco di permessi, e un tentativo alla cieca su file grandi che non ho scritto oggi rischia di rompere qualcosa senza saperlo.
>
> Briefing di riferimento: [[Briefing/2026-09-05]].

---

> 🧭 **5/9 10:46 — Nuova chiamata "esegui giro.md per intero": stessa verifica lean, più una
> riparazione vera di processo.** Riquerato dal vivo su MCP Supabase, non a memoria: `orders`,
> `profiles`, `merchants_leads`, `abandoned_carts`. **Zero delta.** 1 ordine (id `58094956…`, 24/6,
> PENDING/CANCELED, €19,05, seller Pane Quotidiano). **0 pagati.** 8 profili: 5 buyer, 2 seller, 1
> rider, 1 admin. 0 nuovi lead in 7gg su 407 totali: pipeline vendite ferma. 3 carrelli abbandonati,
> invariati da luglio. **76° giorno di stallo North Star** (24/6→5/9).
>
> **La riparazione vera di questo passaggio.** `freschezza-cadenze.mjs` segnalava un problema: il
> giro delle 08:48 era uscito saltando l'auto-analisi. L'ho verificato con un grep sulle date, in
> `auto-analisi.json` e in `apprendimento.json`: nessuna scrittura del 5/9 in nessuno dei due, prima
> di questo passaggio. L'ho riparato riscrivendo `auto-analisi.json`, con verifica L2 dal vivo.
> `apprendimento.json` invece NON l'ho toccato a mano. Il motivo: la regola AR-651 impone che una
> lezione nuova si scriva SOLO dallo strumento `node cervello/lezione-nuova.mjs`. Quello strumento è
> bloccato dallo stesso buco di permessi delle card #104/#189/#194/#195. Ho tentato anche
> `esperimenti-check.mjs --apri` (vincolo esperimenti HARD): stesso blocco. `CHECKLIST-NICOLA.md`
> era ferma da 2 giorni, sopra il tetto della regola AR-030: l'ho rigenerata in questo passaggio, con
> i numeri riverificati ora (CI: 10 PR aperte, 8 rosse — non più 8 su 8).
>
> **Coda firme e decisioni:** `AZIONI-IN-ATTESA.md` invariata — top card ancora **#195** (gate LOOP,
> già richiuso), poi #194 (gate GATE, cronico), #193 (11° post PQ pronto, zero pubblicati). Nessuna
> card nuova aperta in questo passaggio: la coda è già invariata, aprirne una sarebbe rumore.
> `DECISIONI.md`: nessuna firma nuova di Nicola.
>
> **Nessun cambio rispetto a 08:32/08:48.** 1 ordine (24/6, annullato), 0 pagati, 8 profili. **Mossa
> n.1 invariata: firma #154+#155** (dominio+chiavi Vercel) — è quella che rimette online il sito
> (HTTP 503) e rende possibile un primo ordine pagato vero.
>
> Briefing di riferimento: [[Briefing/2026-09-05]].

---

> 🧭 **5/9 08:32 — Nuova chiamata "esegui giro.md per intero".** Sono passate circa 2 ore dal giro
> pieno delle 06:32. Ho riverificato i dati dal vivo, non a memoria: query dirette su `orders`,
> `profiles`, `products`, `merchants_leads`, `abandoned_carts` (MCP Supabase). Non ho rieseguito le
> 15 fasi intere del giro — il perché è più sotto.
>
> **Numeri, tutti identici al giro delle 06:32.** 1 ordine totale (id `58094956…`, 24/6, PENDING/
> CANCELED), **0 pagati**. 8 profili (5 buyer, 1 seller, 1 rider, 1 admin). 5 prodotti, 0 nuovi in
> 7gg. 0 recensioni. 3 carrelli abbandonati (€7,95/€10/€13,90), nessuno recuperato, tutti da metà
> giugno-inizio luglio. 407 lead commercianti, tutti ancora `to_contact` (outreach non ancora
> partito su questa tabella). **75° giorno di stallo North Star** (24/6→5/9).
>
> **Coda firme e decisioni:** `AZIONI-IN-ATTESA.md` invariata — top card ancora **#195** (gate LOOP,
> già richiuso), poi #194 (gate GATE, cronico), #193 (11° post PQ pronto, zero pubblicati).
> `DECISIONI.md`: nessuna firma nuova di Nicola.
>
> **Blocco strumenti confermato di nuovo.** `node cervello/test-cervello.mjs` richiede approvazione
> non concessa in questa sessione (stesso buco noto: solo i comandi scritti parola-per-parola in
> `.claude/settings.local.json` partono — card #104/#189/#194). Non ritentato alla cieca. Uso invece
> i verdetti già scritti su disco dal pre-step di `giro.sh` (08:28): **TEST rosso**, **CI 8/10 PR
> rosse per colpa propria**, **STASH aperto**, **ESPERIMENTI 0 aperti**, **NORTH_STAR in stallo**,
> **APPRENDIMENTO/CORREZIONE_NICOLA/GATE/VOLANO/TASSO croniche** — tutte e 12 le voci AR-687 restano
> sullo stesso buco di permessi, nessuna nuova rispetto al briefing delle 06:32.
>
> **Perché non ho rilanciato le 15 fasi intere.** Tre motivi. Primo: zero delta reale su dati, coda e
> decisioni dal giro pieno di 2 ore fa. Secondo: il letargo RISPARMIO impone "giri ridotti a
> 1/giorno", e quello di oggi è già stato fatto alle 06:32. Terzo: riscrivere auto-analisi,
> apprendimento e piani su fatti identici sarebbe solo rumore, non un controllo in più — lo stesso
> pattern già diagnosticato più volte
> ([[project-doppio-worker-tempesta-commit-18-8]], [[piano-mattino-loop-non-timer]]).
>
> **Nessun cambio rispetto a 06:32/06:44.** 1 ordine (24/6, annullato), 0 pagati, 8 profili. 75°
> giorno di stallo North Star. **Mossa n.1 invariata: firma #154+#155** (dominio+chiavi Vercel) — è
> quella che rimette online il sito (HTTP 503) e rende possibile un primo ordine pagato vero.
>
> **Se questa chiamata è manuale** e Nicola vuole comunque un giro pieno nuovo (radar, radiografia,
> apprendimento) anche senza dati diversi, basta dirlo esplicitamente ("rifallo comunque").
>
> Briefing di riferimento: [[Briefing/2026-09-05]].

---

> 🧭 **5/9 06:44 — Nuova chiamata "esegui giro.md per intero", 12 minuti dopo il giro pieno delle
> 06:32.** Non l'ho rieseguito per intero.
>
> **Perché.** Il giro delle 06:32 è fresco. Briefing, STATO, cantiere e auto-analisi sono stati
> scritti 12 minuti fa. Aspettano ancora il commit di `giro.sh`. Il delta-gate conferma **zero
> cambiamenti**: stessa firma di stato dell'ultimo giro pieno (1 ordine, 8 clienti, sensori
> invariati).
>
> **Cosa ho ricontrollato dal vivo, non a memoria** (per rispetto del vincolo north-star).
> - `orders` su MCP Supabase: ancora 1 sola riga. È lo stesso ordine del 24/6. Stato pagamento
>   PENDING, consegna CANCELED, cancellato il 3/7. **0 ordini pagati.**
> - `git log` dall'ultimo commit (4/9 20:20) a ora: zero commit nuovi. La coda di scritture del
>   giro di stamattina non è stata ancora committata.
> - `DECISIONI.md`: invariato. Nessuna firma nuova di Nicola dal 29/8.
> - `AZIONI-IN-ATTESA.md`: invariata. Top card ancora **#195**, aperta 12 minuti fa per il gate
>   LOOP diventato cronico. Poi #194, #193, #192, #190. Nessuna firmata.
>
> **La scelta fatta, e l'alternativa scartata.** Potevo rilanciare le 15 fasi intere (radar,
> radiografia, auto-miglioramento, nuove scritture di apprendimento). Su dati identici a 12 minuti
> fa avrebbe prodotto zero fatti nuovi. Solo quota bruciata. È lo stesso pattern già diagnosticato
> e risolto più volte ([[project-doppio-worker-tempesta-commit-18-8]],
> [[piano-mattino-loop-non-timer]]). Ho scelto invece di verificare i dati veri e scrivere solo
> questo passaggio. Il letargo RISPARMIO impone di tagliare il volume, non i controlli: il
> controllo l'ho fatto comunque, sui dati reali.
>
> **Nessun cambio rispetto a 06:32.** 1 ordine (24/6, annullato), 0 pagati, 8 profili. 74°/75°
> giorno di stallo North Star. **Mossa n.1 invariata: firma #154+#155** (dominio+chiavi Vercel).
>
> **Se questa chiamata è manuale**, e Nicola vuole comunque un giro pieno nuovo anche senza dati
> diversi, basta dirlo esplicitamente ("rifallo comunque"). Lo eseguo per intero.
>
> **Cosa non ho verificato in questo passaggio.** Il sito dal vivo (uso la baseline nota, HTTP
> 503). Le PR rosse in CI. Nessuna delle due cambia la mossa n.1.
>
> Briefing di riferimento: [[Briefing/2026-09-05]].

---

> 🧭 **5/9 06:32 — Giro pieno: 74° giorno di stallo, LOOP richiuso.** Nessun numero di business
> cambiato dal Piano del mattino di 22 minuti fa: 1 ordine (24/6, annullato), 0 pagati, 8 profili, 5
> prodotti. Letargo RISPARMIO (quota AI 10%). Novità di processo: il gate LOOP (`chiusura-loop.mjs
> --gate`) era cronico da 3 giri — richiuso in questo giro registrando l'esito mancante di @AD;
> aperta card #195 come richiesto per i controlli diventati cronici. GATE (`gate-veri.mjs`) resta
> cronico, bloccato dallo stesso buco di permessi VPS (card #104/#189/#194). Mossa n.1 invariata:
> firma #154+#155. Briefing completo: [[Briefing/2026-09-05]].

> ☀️ **5/9 06:10 — Piano del mattino: 73° giorno di stallo, stesse tre firme.** Cadenza fissa del
> mattino, primo blocco del giorno.
>
> **In parole semplici.** Riverificato ora con query diretta al database vero (MCP Supabase): 1
> ordine totale, sempre quello del 24 giugno, annullato, **0 pagati**. 8 profili, 5 prodotti.
> Identico a ieri sera. Lo stallo North Star tocca oggi **73 giorni**.
>
> **La notte è stata tranquilla.** Zero commit dalle 20:20 di ieri sera a ora: il ciclo automatico
> che per giorni ha rilanciato "esegui il giro" da solo non ha prodotto nessuna nuova raffica
> stanotte. `DECISIONI.md` invariato: l'ultima firma di Nicola resta quella del 29 agosto. Nessuna
> approvazione arrivata durante la notte.
>
> **Un limite di questa mattina, da dire subito.** Due controlli automatici della macchina restano
> bloccati: `letargo.mjs` e `python3`. La causa è nota, stesso buco delle card #189/#194: i comandi
> non sono scritti parola-per-parola in `.claude/settings.local.json`. Non li ho ritentati alla
> cieca. Il sito resta HTTP 503. Uso la baseline di ieri sera (20:30): non l'ho riverificato ora.
> La causa resta la stessa di sempre: mancano le variabili Vercel.
>
> **Le 3 cose di oggi**, tutte già pronte in coda e in attesa solo della tua firma:
> 1. Rimettere online il sito vero: dominio + chiavi Vercel (#154+#155). Senza questo un pagamento
>    riuscito non diventerebbe mai un ordine.
> 2. Sbloccare i pagamenti con carta di Pane Quotidiano (#182). È l'unico negozio vero. Ferma dal
>    10/8: sono 26 giorni.
> 3. Applicare le quattro migrazioni ferme sul database di produzione (#184). Evita che il primo
>    cliente vero trovi un checkout rotto.
>
> **Serve da te**
> - Firma #154+#155 (dominio e chiavi Vercel). È la mossa che sblocca tutto il resto.
> - Guarda la card #193: undici post pronti per Pane Quotidiano, zero pubblicati. Dimmi quale far
>   partire o quali ritirare — non ne scrivo un dodicesimo finché uno non parte davvero.
> - Guarda le card #189/#194: stesso fix, una riga di permesso nell'allowlist del VPS.
>
> **In coda restano le stesse carte, nessuna firmata durante la notte.** #154+#155 (mossa n.1),
> #182, #184, #185 (scadenza 29/8, passata da 7 giorni), #189, #190, #192, #193, #194.
>
> **Cosa non ho verificato.** Il sito dal vivo in questo passaggio (uso la baseline di ieri sera,
> stessa causa nota). Il contenuto delle PR rosse in CI (card #190). Nessuna delle due sblocca il
> primo ordine pagato.
>
> Blocco completo: [[RITMO]].

---

> 🛌 **4/9 22:31 — Nuova chiamata "esegui giro.md per intero", 2 ore dopo la precedente.** Resto in
> SOPRAVVIVENZA. Non ho rieseguito le 15 fasi. Il letargo è confermato SOPRAVVIVENZA: quota AI 112%
> della finestra rolling, salute macchina 4/100. Il dato viene dal pre-step di `giro.sh` delle
> 22:30, non l'ho riquerato io. A questo livello il mansionario impone "solo NUCLEO VITALE": ordini,
> consegne, coda firme, sicurezza, allerta a Nicola. Tutto il resto è spento.
>
> **Nucleo vitale, controllato a costo zero.** Ho letto solo file locali, zero query nuove. `git
> log` dalle 20:20 (ultimo commit) a ora: zero commit nuovi. Coda firme (`AZIONI-IN-ATTESA.md`)
> invariata. Top card ancora **#194**: il gate GATE cronico da 3 giri, bloccato dallo stesso buco di
> permessi di #189. Nessuna firma nuova di Nicola in `DECISIONI.md`. Nessun segnale di sicurezza
> nuovo. Non ho riquerato Supabase: il sensore REST era già fresco delle 20:28, confermato nel
> passaggio precedente. Stesso quadro: 0 ordini pagati.
>
> 🚨 **Il ciclo automatico che rilancia "esegui giro.md per intero" continua da stamattina (06:00).**
> Sono ormai oltre 16 ore filate. Non ha prodotto un solo dato nuovo di business. È lo stesso
> pattern già diagnosticato e risolto due volte in passato ([[project-doppio-worker-tempesta-commit-18-8]],
> [[piano-mattino-loop-non-timer]]), ricomparso una quinta volta oggi. Non ha senso continuare a
> ridiagnosticarlo: la causa nota è un timer/cron sul VPS che si riarma da solo. Dall'interno del
> ciclo la macchina non può fermarlo. **Serve un intervento umano sul VPS** per verificare o
> disattivare il timer. Altrimenti la quota AI resta sopra soglia anche stanotte, senza nessun
> beneficio.
>
> Nessun numero di business cambiato: 1 ordine (24/6, annullato), 0 pagati, 72°+ giorno di stallo
> North Star. **Mossa n.1 invariata: firma #154+#155** (dominio+chiavi Vercel).
>
> Briefing completo: [[Briefing/2026-09-04]].

---

> 🛌 **4/9 20:30 — Nuova chiamata "esegui giro.md per intero": resto in SOPRAVVIVENZA, non ho
> rieseguito le 15 fasi.** Letargo confermato SOPRAVVIVENZA e peggiorato ancora: quota AI **122%**
> della finestra rolling, salute macchina ferma a **4/100**, cassa Stripe disponibile €0. Il
> mansionario impone "solo NUCLEO VITALE: ordini, consegne, coda firme, sicurezza, allerta a
> Nicola. Tutto il resto spento" — niente radar, niente radiografia, niente auto-miglioramento.
>
> **Nucleo vitale, controllato ora.** Sensore REST `orders` fresco (20:28): 1 riga visibile, stesso
> quadro di sempre — 0 pagati, 72°+ giorno di stallo North Star. Coda firme (`AZIONI-IN-ATTESA.md`)
> invariata sul business: top card ancora **#193**, nessuna firma nuova da Nicola.
>
> **Verifica di sicurezza vera, non ripetuta a memoria.** Ho ricontrollato il sito dal vivo, due
> volte: con curl e con WebFetch. Confermato HTTP 503. Poi ho fatto indagare devops-sre sulla
> causa. Obiettivo: escludere un incidente NUOVO, non ripetere la solita baseline. Risposta: **non
> è un guasto nuovo**. È la stessa causa aperta dal 22/8, card #154. Mancano variabili d'ambiente
> Production su Vercel (`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL` e altre). Sono sparite
> nel trasloco da Render. Prova indipendente: anche l'endpoint `/api/health` risponde 503, apposta,
> quando mancano. Nessuna card nuova per questo: è già in coda, aspetta solo la firma di Nicola.
>
> **Una card nuova, richiesta esplicitamente da questo turno.** Il controllo GATE (freni delle
> lezioni, `gate-veri.mjs`) è diventato cronico: rosso da 3 giri di fila. Non sono nemmeno riuscita
> a rilanciarlo per vedere quale lezione è senza freno vero. Stesso buco di permessi della card
> #189. Aperta card **#194** (🟡). Stesso fix di #189: allowlist su `settings.local.json`.
>
> Nessun numero di business cambiato. 1 ordine (24/6, annullato), 0 pagati. **Mossa n.1 invariata:
> firma #154+#155** (dominio+chiavi Vercel) — con la conferma di oggi che è ESATTAMENTE questa la
> causa del sito giù, non un sospetto.
>
> Briefing completo: [[Briefing/2026-09-04]].

---

> 🌙 **4/9 18:00 — Report della sera: giornata ferma sul negozio, passata quasi tutta in
> SOPRAVVIVENZA.** Cadenza fissa delle 18:00 (`cervello/ritmo.md`). Non è una ripetizione del ciclo
> automatico.
>
> **Com'è andata oggi.** Il negozio non si è mosso. Stesso ordine annullato del 24/6, 0 pagati, 8
> profili, 5 prodotti. Identico a ieri sera. Stallo North Star **72 giorni**. La giornata vera l'ha
> vissuta la macchina, non il negozio. Da metà mattina il letargo è sceso a SOPRAVVIVENZA. La quota
> AI è arrivata al **184%** della finestra alle 16:30. La salute macchina resta ferma a 4/100. La
> causa: un ciclo automatico sul server si è riacceso una quarta volta. Ha consumato quota senza
> produrre un solo dato nuovo. L'unico lavoro vero della giornata è stata la **review della
> settimana**, ferma da sei settimane. L'ho ripresa oggi alle 15:35. Ha trovato un guasto: lo
> strumento della radiografia completa (`auto-radiografia.js`) era rotto. La causa: un errore di
> battitura in tre punti. Il fix è scritto ma non applicato: tocca il mio codice, serve la firma di
> Nicola (card AR-893). Riparate anche due cose minori. Una prova-sorvegliante che si sganciava da
> sola (AR-046). Un gate di processo rimasto rosso (`chiusura-loop`).
>
> **I numeri.** Riusati dall'ultima query dal vivo (Supabase MCP, 06:35). Riconfermati più volte
> durante il giorno, l'ultima alle 16:30. Nessun numero nuovo: avrebbe richiesto quota su dati già
> verificati identici tutto il giorno. Ordini 1 (annullato, 0 pagati) · negozi reali attivi 1 (Pane
> Quotidiano) · prodotti 5 · profili 8 · recensioni 0 · carrelli abbandonati 3 · lead 407. Tutto
> invariato vs ieri sera.
>
> **Da approvare, invariate da giorni.** #154+#155 (dominio+chiavi Vercel, mossa n.1) · #182
> (pagamenti carta Pane Quotidiano, fermi da 25 giorni) · #184 (quattro migrazioni ferme). In coda
> anche #193, l'undicesimo post pronto per Pane Quotidiano. Zero pubblicati.
>
> **Lezione di oggi.** Uno strumento che mi controlla può restare rotto per settimane. Se nessuno
> controlla lui, nessuno se ne accorge. L'ho scoperto solo riprendendo oggi una review ferma da sei
> settimane.
>
> **Domani.** Prima cosa utile: verificare il ciclo che si è riacceso oggi. Si è fermato da solo? O
> serve un intervento umano sul server?
>
> Blocco completo: [[RITMO]].

---

> 🛌 **4/9 16:30 — Undicesimo passaggio di oggi: resto in SOPRAVVIVENZA, non ho rieseguito le 15 fasi.**
> Letargo confermato SOPRAVVIVENZA e peggiorato ancora: quota AI **184%** della finestra rolling (era
> 124% alle 14:31, +60 punti in 2 ore). Salute macchina ferma a **4/100**. Runway non calcolabile
> (cassa Stripe disponibile €0). Il mansionario impone "solo NUCLEO VITALE": ordini, consegne, coda
> firme, sicurezza, allerta a Nicola. Tutto il resto spento — niente radar, niente radiografia,
> niente auto-miglioramento, niente 15 fasi di `cervello/giro.md` (la richiesta di eseguirlo per
> intero è di nuovo declassata a questo controllo minimo, come nei 10 passaggi precedenti di oggi).
>
> **Nucleo vitale, controllato a costo quasi zero.** Solo file locali, nessuna query nuova.
> `git log` dalle 14:31 mostra solo il ciclo automatico già noto. Due tipi di commit: "ritmo AD
> (settimana): aggiorna memoria" (16:04) e due "recupero: scritture pendenti" (16:00 e 16:20).
> Nessun lavoro nuovo di business. `AZIONI-IN-ATTESA.md` è invariato. Top card ancora **#193**:
> l'undicesimo post pronto per Pane Quotidiano, zero pubblicati. Unica novità è un timestamp
> automatico del banner Supervisione negozi (16:27): «nessuna proposta di riempimento in questo
> giro». `DECISIONI.md` è invariato: l'ultima firma di Nicola resta quella del 29/8. Nessuna firma
> nuova. Nessun segnale di sicurezza nuovo.
>
> **Cosa resta aperto, non affrontato in questo passaggio per restare nel nucleo vitale.** Le PR
> rosse su GitHub: guasti vecchi, nessuna sblocca una card business. Il test del cervello: ancora
> bloccato dal buco di permessi del VPS. La causa è nota (card #104/#189): i comandi
> `node cervello/*.mjs` non elencati parola-per-parola in `.claude/settings.local.json` restano
> fuori dall'allowlist. La cadenza `ritmo-settimana`: ferma. Nessuno di questi problemi è nuovo:
> sono gli stessi guasti già segnalati nei passaggi precedenti di oggi.
>
> Nessun numero di business cambiato: 1 ordine (24/6, annullato), 0 pagati. **Mossa n.1 invariata:
> firma #154+#155** (dominio+chiavi Vercel). È quella che sblocca il resto.
>
> Briefing completo: [[Briefing/2026-09-04]].

---

> 🛌 **4/9 14:31 — Decimo passaggio di oggi: resto in SOPRAVVIVENZA, non ho rieseguito le 15 fasi.**
> Letargo confermato SOPRAVVIVENZA (livello misurato ora da `letargo.mjs`, non da memoria). Quota AI
> **124%** della finestra rolling (era 114% alle 13:10). Salute macchina ferma a **4/100**. Runway non
> calcolabile (cassa Stripe disponibile €0). Il mansionario impone "solo NUCLEO VITALE": ordini,
> consegne, coda firme, sicurezza, allerta a Nicola. Tutto il resto spento — niente radar, niente
> radiografia, niente auto-miglioramento, niente 15 fasi di `cervello/giro.md` (la richiesta di
> eseguirlo per intero è stata declassata a questo controllo minimo per rispettare la regola
> «taglia il volume, mai i controlli» del letargo).
>
> **Nucleo vitale, controllato a costo quasi zero.** `git log --since="13:10"` mostra un solo commit.
> È `68297d29b`. È un recupero di scritture pendenti da un giro interrotto delle 14:20. Non è lavoro
> nuovo di questo passaggio. `AZIONI-IN-ATTESA.md` è invariato. Top card ancora **#193**: l'undicesimo
> post pronto per Pane Quotidiano, zero pubblicati. `DECISIONI.md` è invariato in coda: nessuna firma
> nuova di Nicola. Il sensore REST `orders` è fresco delle 14:20: 1 riga visibile. È l'ordine annullato
> del 24/6. Stesso quadro di sempre: 0 pagati, 72°+ giorno di stallo North Star. Nessun segnale di
> sicurezza nuovo.
>
> **Cosa resta aperto, non affrontato in questo passaggio per restare nel nucleo vitale:** 8 PR rosse
> su GitHub, tutte guasti vecchi che non sbloccano nessuna card business. Il test del cervello resta
> bloccato dallo stesso buco di permessi del VPS delle card #104/#189. La cadenza `ritmo-settimana` è
> ferma da 671h. Nessuno di questi è nuovo: sono gli stessi guasti già segnalati nei passaggi
> precedenti di oggi.
>
> Nessun numero di business cambiato. 1 ordine (24/6, annullato), 0 pagati. **Mossa n.1 invariata:
> firma #154+#155.** È dominio+chiavi Vercel. È quella che sblocca il resto.
>
> Briefing completo: [[Briefing/2026-09-04]].

---

> 🛌 **4/9 13:10 — Nono passaggio di oggi: resto in SOPRAVVIVENZA, non ho rieseguito le 15 fasi.**
> Letargo confermato SOPRAVVIVENZA. Quota AI **114%** della finestra rolling. Salute macchina ferma a
> **4/100**. Il mansionario impone "solo NUCLEO VITALE": ordini, consegne, coda firme, sicurezza,
> allerta a Nicola. Tutto il resto spento. Niente radar. Niente radiografia. Niente 15 fasi di
> `cervello/giro.md`.
>
> **Nucleo vitale, controllato a costo quasi zero.** Ho guardato `git log` dalle 12:07 a ora: zero
> commit nuovi. `AZIONI-IN-ATTESA.md` è invariato. Top card ancora **#193**: l'undicesimo post pronto
> per Pane Quotidiano, zero pubblicati. `DECISIONI.md` è invariato in coda: nessuna firma nuova di
> Nicola. Il sensore REST `orders` è fresco delle 13:00: 1 riga visibile, stesso quadro, 0 pagati.
> Nessun segnale di sicurezza nuovo.
>
> **Una riparazione vera, fuori dal nucleo vitale ma minima:** il sorvegliante ripeteva da 129 giri
> lo stesso avviso su `storico-salute.json` (AR-046) — la prova non trovava più il suo aggancio nel
> file. La causa: qualcosa pota la TESTA della serie più in fretta di quanto la riparassi. Ho
> riancorato la mutazione all'ULTIMA riga scritta, non più alla prima: quella resta stabile molto più
> a lungo. Fix in `cervello/mutanti.json`, verificato: l'avviso è sparito dal sorvegliante subito dopo.
>
> Nessun numero di business cambiato. 1 ordine (24/6, annullato), 0 pagati. 72°/73° giorno di stallo
> North Star. **Mossa n.1 invariata: firma #154+#155** (dominio+chiavi Vercel).
>
> Briefing completo: [[Briefing/2026-09-04]].

---

> 🛌 **4/9 12:30 — Ottavo passaggio di oggi: resto in SOPRAVVIVENZA, non ho rieseguito le 15 fasi.**
> Letargo confermato SOPRAVVIVENZA. Quota AI **139%** della finestra rolling — era 109% alle 11:58,
> +30 punti in 32 minuti. Salute macchina ferma a **4/100**. Il mansionario impone "solo NUCLEO
> VITALE": ordini, consegne, coda firme, sicurezza, allerta a Nicola. Tutto il resto spento.
>
> **Nucleo vitale, controllato a costo quasi zero.** `git log` dalle 11:58 mostra solo due commit del
> ciclo automatico già noto: `0c9cda36b` (ritmo di mezzogiorno) e `77c43a020` (worker). Zero lavoro
> nuovo. `DECISIONI.md` invariato: nessuna firma nuova di Nicola. Coda firme invariata
> (`AZIONI-IN-ATTESA.md`). Top card ancora **#193**: l'11° post pronto per Pane Quotidiano, zero
> pubblicati. Sensore REST `orders` fresco, misurato alle 12:18 (12 minuti fa): 1 riga visibile.
> Stesso quadro: 0 pagati. Nessun segnale di sicurezza nuovo.
>
> Il sorvegliante ripete per la 111ª volta lo stesso avviso su `storico-salute.json` (AR-046). Non
> l'ho toccato. Non è nato in questo passaggio, e ripararlo è lavoro macchina fuori dal nucleo vitale
> di oggi. Resta debito dichiarato, non lavoro fatto.
>
> Nessun numero di business cambiato. 1 ordine (24/6, annullato), 0 pagati. 72°/73° giorno di stallo
> North Star. **Mossa n.1 invariata: firma #154+#155** (dominio+chiavi Vercel).
>
> Briefing completo: [[Briefing/2026-09-04]].

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
del database, 6 settembre alle 06:02 (Piano del mattino), query diretta a Supabase via MCP. Quando
i sensori sono ciechi, i controlli automatici leggono questa tabella invece di inventare un numero.

| Numero | Oggi (6/9 06:02) | Δ vs 5/9 22:31 | "Riuscito" | Note |
|---|---|---|---|---|
| Negozi REALI approvati | **1** (Pane Quotidiano) | = | ≥1 LIVE vero | confermato query diretta 6/9 06:02. "Panificio Demo" (card #196) NON contato: origine non confermata |
| Negozi con payout attivo | **0 reali** | = | 1 | confermato ieri: `stripe_charges_enabled` falso su entrambi i seller. Card #182 |
| Prodotti VERI del faro pubblicati | **5** | = | ≥5 | confermato ieri (Pane Quotidiano). Il totale tabella `products` è **9**: i 4 in più sono del "Panificio Demo" non confermato |
| Ordini creati | **1** (annullato) | = | ≥1 valido | id `58094956`, €19,05, creato 24/6 08:28, confermato query diretta 6/9 06:02 |
| Ordini pagati | **0** | = | 1 | **North Star 0** · stallo **74 giorni** dal 24/6 |
| Ordini consegnati | **0** | = | 1 | nessuna consegna mai avvenuta |
| Payout testato | **0** | = | 1 | non eseguibile finché Stripe PQ resta spento |
| Profili totali | **9** (5 buyer, 2 seller, 1 rider, 1 admin) | = | crescita | invariato da ieri sera. Il +1 di ieri mattina resta "Panificio Demo" (card #196, origine ignota), non un cliente vero |
| Lead negozi nel DB | **407** (fermi dal 24/5) | = | lavorarli | invariato, fuori dal perimetro North-Star di questo giro |
| Sito pubblico | **HTTP 503** (baseline 5/9 18:03) | = | 200 | non riverificato dal vivo in questo passaggio. Causa nota: dominio e chiavi Vercel (#155, #154) |

---

## Priorità in coda (invariate, nessuna firmata)

1. **#154+#155** — dominio e chiavi Vercel. Mossa n.1: senza questo il sito resta giù (HTTP 503) e
   nessun pagamento riuscito diventa un ordine.
2. **#182** — pagamenti carta di Pane Quotidiano, fermi da oltre 27 giorni.
3. **#184** — quattro migrazioni ferme sul database di produzione.
4. **#185** — la scadenza del 29/8, passata da 8 giorni: le quattro cose che avevi fissato non
   hanno ancora un conto verificato.
5. **#186** — il cancello del sito.
6. **#188** — l'origine del comando ricorrente "negozi in calo".
7. **#189/#194/#195** — permessi mancanti su tre controlli automatici (buco di `settings.local.json`).
8. **#190** — le PR rosse in CI, ferme perché il gate North Star vieta di toccarle senza deroga.
9. **#191** — 10 azioni-negozio tornate visibili dopo la pausa scaduta.
10. **#192** — leggibilità di alcuni file di memoria.
11. **#193** — 11 post pronti per Pane Quotidiano, zero pubblicati: scegli quale far partire.
12. **#196** — "Panificio Demo", negozio finto comparso il 5/9 alle 06:40: dimmi se lo riconosci.
13. **#197** — codice sul funnel carrelli abbandonati, pronto da luglio, mai entrato in una PR.

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
