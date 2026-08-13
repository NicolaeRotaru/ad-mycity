# 🗺️ Mappa della macchina — com'è fatta, pezzo per pezzo

> Generato da `cervello/mappa-macchina.mjs` — ultimo aggiornamento della struttura: 2026-08-12 23:07.
> **Non si scrive a mano:** i numeri si contano dal repo a ogni giro; le parole che spiegano
> ogni pezzo vivono in `cervello/censimento-macchina.mjs`. Se modifichi questo file a mano, il
> prossimo giro lo sovrascrive.

Lo stesso contenuto è nella Bacheca della home, nella sezione «Com'è fatta la macchina».

| # | Parte | In una frase | Quanto è grande |
| --- | --- | --- | --- |
| 1 | 🖥️ **Il Pannello — la faccia** | Quello che vedi e dove firmi. | 225 file · 32.159 righe · 15 aree · 77 rotte |
| 2 | 🦾 **Il worker e il VPS — le braccia** | L'unico pezzo che esegue davvero, 24 ore su 24. | 1625 righe · 14 servizi · 12 timer |
| 3 | 🧠 **L'AD — la testa** | Chi decide, delega e scrive in memoria. | mansionario di 480 righe · giro di 1625 righe · 18 manuali |
| 4 | 👥 **I senior — la squadra** | Gli specialisti a cui l'AD passa il lavoro invece di farlo tutto lei. | 120 senior · 124 quaderni di memoria |
| 5 | 🛡️ **Guardiani e sensori — il sistema immunitario** | Quello che impedisce alla macchina di raccontarti una bugia. | 201 script · 11 sensori · 162 test + 26 prove bash |
| 6 | 📚 **La memoria — quello che ricorda** | Dove vive tutto ciò che la macchina sa e ha deciso. | 9 cartelle · 38 fatti-chiave · 41 file di auto-coscienza |
| 7 | ✋ **Mani e sensi — come tocca il mondo** | Come legge la realtà e come, quando glielo permetti, la cambia. | 5 mani · 13 modelli grafici |
| 8 | 🔄 **I flussi — come le parti si parlano** | I cicli veri: qui non ci sono file nuovi, c'è il «come funziona». | 5 cicli |
| 9 | 🧩 **Le estensioni — i moduli che si aggiungono** | Le capacità che si accendono quando servono, senza gonfiare il resto. | 72 skill · 6 workflow · 46 capacità |

---

### 1. 🖥️ Il Pannello — la faccia

Un'app web che **non decide niente**: mostra quello che la macchina ha scritto e raccoglie le tue risposte. È fatta così apposta — se il Pannello sparisse, la macchina continuerebbe a lavorare; quello che perderesti è la possibilità di vederla e di firmarle le decisioni.

- **1.1 Le aree (15)** — Le stanze in cui è divisa la Cabina — più 3 vecchie scorciatoie che oggi rimandano altrove. L'elenco qui sotto è letto dal codice, non scritto a mano.
- **1.2 Le caselle (63 componenti)** — I riquadri dentro le aree: bacheca, cuore della macchina, chat, autopilota, quaderni, volano.
- **1.3 Le rotte interne (77)** — Ogni casella ha la sua fonte: memoria, metriche, lavori, marketplace, controllo. Nessuna scrive sul sito dei negozi.
- **1.4 La logica (91 moduli)** — Dove vivono le regole vere: firma di un'azione, chat unificata, autopilota, controllo di onestà, economia.
- **1.5 Il contratto di navigazione** — La regola che fa funzionare il tasto INDIETRO sul telefono: ogni area, scheda e pannello sovrapposto è una tappa di cronologia, non un interruttore nascosto.
- **1.6 Deploy e installazione** — Va online solo quando cambia `pannello/`, via Deploy Hook. È installabile sul telefono come un'app (PWA).
- **1.7 Il database della Cabina (5 file SQL)** — Supabase **separato** da quello del marketplace: coda dei lavori, chat, diario, impostazioni, briefing. I dati dei negozi non si toccano da qui.

**Le aree, una per una:**

| Area | Cosa contiene |
| --- | --- |
| `plancia` | La home: il colpo d'occhio del giorno — cosa è successo, cosa aspetta la tua firma, come sta la macchina. |
| `azioni` | La coda delle decisioni: ogni card è un'azione pronta con «cosa cambia» e «se va bene». Qui si firma. |
| `lavori` | I lavori del cervello in corso o finiti: cosa sta girando adesso, cosa è andato storto, cosa si può ritentare. |
| `cervello` | Come ragiona la macchina: radiografie, salute onesta, utilizzo dei senior, schede dei problemi aperti. |
| `salute-sito` | Lo stato del marketplace vero: cosa non funziona sul sito dei negozi, per gravità. |
| `auto-coscienza` | La macchina che si guarda allo specchio: difetti trovati su sé stessa, cantiere delle riparazioni, storico della salute. |
| `numeri` | I KPI reali: ordini, incassi, negozi, clienti, payout, funnel — solo dati misurati, mai stime travestite. |
| `analisi-report` | Trend, funnel e unit economics: gli stessi numeri di Numeri letti in profondità, più i report scritti dall'AD. |
| `memoria` | Quello che la macchina ricorda: stato, decisioni, fatti chiave, quaderni dei reparti, archivio. |
| `persone` | Chi c'è attorno al marketplace: negozi, clienti, rider, la squadra dei senior, i contatti esterni. |
| `operazioni` | Come gira la macchina operativa: ordini, consegne, catalogo, magazzino, ritmi. |
| `mondo` | Il fuori: concorrenti, eventi in città, bandi, stampa, trend — quello che non dipende da noi. |
| `intelligence` | Alert, concorrenti, eventi, buchi di mercato, leve in uscita e reputazione: le 7 schede di analisi che prima stavano dentro Mercato. |
| `assistente` | La chat con l'AD: da qui gli parli, gli chiedi un lavoro, gli fai una domanda. |
| `contenuti` | I contenuti prodotti e in attesa di pubblicazione: post, grafiche, reel, con il loro colore di rischio. |
| `esplora` *(scorciatoia)* | Vecchia area di esplorazione file — resta come scorciatoia: oggi porta a Memoria/Archivio/GitHub. |
| `report` *(scorciatoia)* | Vecchia area dei report — resta come scorciatoia: oggi i report vivono in Memoria/Archivio. |
| `storico` *(scorciatoia)* | Vecchia area dello storico — resta come scorciatoia: oggi lo storico vive dentro Memoria. |

> 📁 Dove: `pannello/` — ospitato su Vercel · 📏 Quanto: 225 file · 32.159 righe · 15 aree · 77 rotte

### 2. 🦾 Il worker e il VPS — le braccia

Quando premi «Approva» sul Pannello, il Pannello **non fa** la cosa: scrive una riga in una coda. È il worker, sul server, che la prende e la esegue. Questa separazione è voluta: la Cabina può essere chiusa, il telefono spento, la sessione finita — il lavoro parte lo stesso. E se il worker si ferma, non parte niente di nascosto: resta tutto in coda, visibile.

- **2.1 Le due corsie** — Un worker per i lavori lunghi (giro, azioni) e uno per la chat, così una tua domanda non finisce in fila dietro mezz'ora di lavoro.
- **2.2 La coda** — `in attesa` → `in corso` → `fatto` o `errore`. Con ritentativo automatico, recupero dei lavori rimasti orfani e scarto di quelli scaduti.
- **2.3 I servizi e i timer (14 + 12)** — Due sempre accesi (worker e chat); gli altri partono a orario. L'elenco completo è qui sotto.
- **2.4 Il motore AI** — Claude Code è il motore principale. Un instradatore sceglie il modello in base al compito, invece di usare sempre il più costoso.
- **2.5 Le difese** — Non si sostituisce con una versione di sé stesso che non compila; lucchetto sulle scritture git; interruttore di pausa; battito del cuore.
- **2.6 Installazione e diagnosi** — Script di setup, aggiornamento e diagnostica completa. Per guardarci dentro c'è la skill `worker`.

**I servizi del server, uno per uno:**

| Servizio | Quando parte | Cosa fa |
| --- | --- | --- |
| `mycity-giro` | a orario | Fa partire il giro di perlustrazione: legge i dati reali, passa i guardiani, scrive il briefing. |
| `mycity-monitora` | a orario | Il sorvegliante del worker: se la coda si blocca o un lavoro resta orfano, se ne accorge. |
| `mycity-ritmo-mattino` | a orario | Il piano del mattino: cosa conta oggi, in ordine di ritorno. |
| `mycity-ritmo-mezzogiorno` | a orario | Il controllo di metà giornata: cosa si è mosso e cosa si è arenato. |
| `mycity-ritmo-sera` | a orario | Il report della sera: cosa è successo davvero oggi, numeri alla mano. |
| `mycity-ritmo-settimana` | a orario | La review del venerdì: cosa ha funzionato, cosa si taglia, cosa si prova la settimana prossima. |
| `mycity-salute` | a orario | La visita di salute, mattina e sera: worker, cervello, Cabina, senior, sensori — e scrive il referto. |
| `mycity-sentinella-dati` | a orario | La sentinella sui dati veri del marketplace: guarda i numeri, non i file. |
| `mycity-sentinella-motore` | a orario | La veglia sul motore AI: quando il pacchetto di Claude si esaurisce è l'unica cosa che resta sveglia — controlla se il limite è caduto e rimette in coda i lavori saltati, così la macchina si riaccende da sola. |
| `mycity-sentinella` | a orario | Le sentinelle: i segnali che devono svegliare qualcuno (negozio fermo, anomalia, soglia superata). |
| `mycity-verifica` | a orario | La verifica periodica dei sensori: gli occhi sono ancora aperti, o uno si è spento in silenzio? |
| `mycity-watch-main` | a orario | Tiene la copia sul VPS allineata a `main`: senza, il worker lavorerebbe con un cervello vecchio. |
| `mycity-worker-chat` | sempre acceso | Il worker della chat: corsia separata, così una tua domanda non finisce in fila dietro un giro lungo. |
| `mycity-worker` | sempre acceso | Il worker principale: sempre acceso, prende i lavori dalla coda e li fa eseguire all'AD. È quello che si muove quando premi «Approva». |

> 📁 Dove: `cervello/worker.sh` + `cervello/vps/` — su un server sempre acceso · 📏 Quanto: 1625 righe · 14 servizi · 12 timer

### 3. 🧠 L'AD — la testa

L'AD non è un programma: è un **mansionario** che l'intelligenza artificiale rilegge ogni volta prima di lavorare. Dice chi è, cosa può fare da sola, cosa deve chiederti, come parla e a chi delega. Cambiare il comportamento della macchina vuol dire cambiare queste parole — non riscrivere del codice.

- **3.1 La regola d'oro 🟢🟡🔴** — Verde = lo fa e basta. Giallo = lo fa e ti avvisa. Rosso = si ferma e aspetta la tua firma. Nel dubbio sale di colore. Tutto il resto poggia su questo.
- **3.2 Il giro** — La perlustrazione: legge i dati veri, passa i controlli automatici, scrive il briefing e aggiorna lo stato. È il battito che tiene viva l'azienda.
- **3.3 Le cadenze** — Mattino, mezzogiorno, sera, venerdì, mese: ognuna ha uno scopo diverso e un formato diverso.
- **3.4 I comandi** — Le frasi che fanno partire un lavoro («fai un giro», «radiografia», «contenuti pro»). Riconosciute anche dette in modo diverso.
- **3.5 L'auto-coscienza** — Quattro manuali: verificare il proprio lavoro, analizzare sé stessa, confrontarsi coi migliori, estrarre le lezioni.
- **3.6 I cancelli di qualità** — Nessun numero senza fonte · nessuna entità inventata · il titolo di un'azione deve suonare come lo diresti a voce, senza sigle.

> 📁 Dove: `CLAUDE.md` + i documenti in `cervello/` · 📏 Quanto: mansionario di 480 righe · giro di 1625 righe · 18 manuali

### 4. 👥 I senior — la squadra

120 ruoli, ognuno col suo mansionario, i suoi limiti e il suo quaderno. Non sono chatbot diversi: sono lo stesso motore con istruzioni diverse, e il motivo per cui esistono è che un esperto di una cosa sola sbaglia meno di un tuttofare. La regola che li tiene in ordine è **un solo padrone per ogni mandato**: se due potrebbero occuparsene, uno dei due rimanda all'altro per iscritto.

- **4.1 Motori di soldi** — Vendite, onboarding, retention negozi, marketing, growth, CRM, ads, influencer, contenuti, SEO, design, stampa, istituzioni.
- **4.2 Occhi** — Intelligence (il mondo fuori), analista (i numeri), data engineer (le tubature dei dati).
- **4.3 Costruttori** — Chi tocca il codice: tech, backend, frontend, devops, prodotto, automazioni.
- **4.4 Fondamenta** — Finanza, contabilità, legale, sicurezza, antifrode, dispute, QA, consegne, supporto, cura del cliente.
- **4.5 Cancelli creativi** — Direttore creativo e QA design: uccidono il contenuto debole prima che esca. Più UX, CRO e chi ottimizza i prompt.
- **4.6 L'espansione** — Rischio e conformità, governo, innovazione, operazioni a scala, professionisti (commercialista, notaio, avvocati: **preparano, non firmano**), banche e finanziamenti.
- **4.7 Le regole della squadra** — Un padrone per mandato · consegnare il lavoro fatto e non l'analisi di cosa fare · la Sala Operativa come canale comune · chiudere il cerchio scrivendo com'è andata.
- **4.8 I quaderni** — Cosa ha imparato ogni reparto, in un file per reparto. Per guardarli a fondo c'è la skill `senior`.

> 📁 Dove: `.claude/agents/` — un file per specialista · 📏 Quanto: 120 senior · 124 quaderni di memoria

### 5. 🛡️ Guardiani e sensori — il sistema immunitario

Sono controlli automatici che girano **prima** che il lavoro si chiuda. Non danno consigli: molti hanno il potere di fermare tutto. Il principio è uno solo — *meglio memoria vecchia che memoria che mente*: se uno strumento non riesce a misurare, il suo silenzio non vale come un sì. L'elenco completo, con chi ferma cosa, è nella sezione «🛡️ I guardiani della macchina» qui in bacheca: lì vive quella verità, e questa mappa la cita invece di ricopiarla.

- **5.1 I guardiani del giro** — Esempi veri: un fatto cambiato in un posto solo · lo sforzo pesante solo dove c'è un negozio vero · chi esegue non può firmare sé stesso · nessun numero senza fonte.
- **5.2 I sensori (11)** — Gli occhi sul mondo. Un occhio cieco blocca i numeri nuovi: l'elenco è qui sotto.
- **5.3 La visita di salute** — Tre risposte possibili per ogni controllo: ✅ provato, ❌ rotto, ⚪ non l'ho potuto vedere da qui. Il ⚪ non è mai un verde.
- **5.4 Il cantiere dei difetti** — I difetti trovati sulla macchina stessa, con la loro causa radice e una prova che diventa rossa se il difetto torna.
- **5.5 I test e la CI (162 + 26 + 4)** — I test girano a ogni giro, non solo quando qualcuno se li ricorda: un test che nessuno esegue è un file, non una rete.

**I sensori, uno per uno:**

| Sensore | Cosa fa |
| --- | --- |
| `supabase_rest` | L'occhio principale sul marketplace: negozi, prodotti, ordini, clienti veri. Se è cieco, il giro NON può scrivere numeri nuovi. |
| `stripe_api` | L'occhio sui soldi veri: incassi, payout, contestazioni. Finché la chiave non c'è, i payout restano stime dichiarate come tali. |
| `posthog_api` | L'occhio sul comportamento: chi visita, cosa clicca, dove abbandona. Serve a capire il perché dietro i numeri. |
| `resend_api` | Il canale email: dice se la posta può davvero partire. Un canale che non risponde non è una mano attiva. |
| `sito_uptime` | Il battito del marketplace: il sito dei negozi risponde? È il controllo che scopre un sito giù prima dei clienti. |
| `supabase_memoria` | Il battito della memoria: il database separato dove vivono coda, chat, diario e impostazioni della Cabina. |
| `pannello_uptime` | Il battito della Cabina: il Pannello risponde? Se è giù, tu non vedi niente anche se la macchina lavora. |
| `telegram_bot` | Il canale con cui la macchina ti scrive sul telefono quando qualcosa non può aspettare il prossimo giro. |
| `watchdog_esterno` | Il guardiano di fuori: controlla che la macchina batta anche quando la macchina stessa è morta e non può dirlo. |
| `n8n_health` | Lo stato del motore delle automazioni: è lo strumento con cui i senior collegherebbero le mani ai servizi esterni. |
| `mcp_supabase` | Il secondo canale verso i dati (comodità di sessione): utile quando c'è, mai la fonte di verità — quella resta il REST. |

> 📁 Dove: `cervello/*.mjs` — girano prima che l'AI scriva una riga · 📏 Quanto: 201 script · 11 sensori · 162 test + 26 prove bash

### 6. 📚 La memoria — quello che ricorda

Le cartelle numerate sono **tue**: lì la macchina propone, non riscrive. La cartella `90-Memoria-AI` è sua: lì scrive da sola. La regola che tiene insieme tutto è **una casa sola per ogni fatto** — un prezzo, una data, un obiettivo vivono in un posto e gli altri file li citano. Se una copia vecchia resta in giro, un guardiano la trova e blocca la pubblicazione: una copia vecchia è una bugia che il Pannello ti mostrerebbe come verità.

- **6.1 Le tue cartelle** — Strategia, mercato, clienti, prodotto, soldi e rischi, piani, agenti. Sono tue: lì la macchina chiede prima di toccare.
- **6.2 La memoria dell'AD** — Stato, decisioni (registro che non si riscrive mai), azioni in attesa, bacheca, sala operativa, lezioni, briefing archiviati.
- **6.3 Il registro dei fatti (38)** — La fonte unica: prezzi, date concordate, negozio faro, obiettivi. Quello che leggi nella prima sezione di questa bacheca.
- **6.4 L'auto-coscienza (41 file)** — Difetti, calibrazione, apprendimento, chi è reale e chi è una scelta ragionata, salute, costi, pagella.
- **6.5 La memoria viva** — Chat, diario e briefing anche a database, così il Pannello te li mostra da qualunque dispositivo.
- **6.6 Le consegne** — Dove i senior depositano il lavoro finito, una cartella per reparto. Le grafiche stanno in `creativi/`.

> 📁 Dove: `MyCity-Vault/` — più il database della Cabina · 📏 Quanto: 9 cartelle · 38 fatti-chiave · 41 file di auto-coscienza

### 7. ✋ Mani e sensi — come tocca il mondo

È la parte più delicata, e per questo è quella con più freni. I **sensi** leggono soltanto: sul database del marketplace la macchina non scrive mai. Le **mani** invece toccano il mondo — un'email che parte non torna indietro — e funzionano al contrario di come ci si aspetta: **quello che non è esplicitamente permesso non parte**. Oggi la lista dei destinatari autorizzati contiene 0 email e 0 utenti: finché resta così, anche un'azione firmata gira **a vuoto** e ti mostra cosa avrebbe fatto.

- **7.1 Le mani (5)** — Ogni canale dichiara da sé il proprio rischio minimo e a chi arriva davvero. Un canale nuovo che non lo dichiara è trattato come 🔴 senza destinatario: non può aprirsi per distrazione.
- **7.2 La lista dei permessi** — Vuota = prova a vuoto forzata. È il freno che rende sicura tutta l'automazione: si toglie un destinatario alla volta, di proposito.
- **7.3 I sensi in lettura** — Dati del marketplace, pagamenti, comportamento sul sito. Sola lettura, sempre.
- **7.4 Il codice del sito** — Una copia in sola lettura del marketplace, che i senior tecnici leggono per capire i problemi. Le modifiche vanno in un ramo separato, la messa online resta 🔴.
- **7.5 La fabbrica dei contenuti (13 modelli)** — Trasforma un testo in una grafica vera, con i colori e i caratteri del marchio. Più i collegamenti alle AI per immagini e video.

**Le mani, una per una:**

| Mano | Cosa fa |
| --- | --- |
| `email` | Manda email vere (via Resend) a clienti e negozi. Ferma finché il destinatario non è nell'allowlist. |
| `facebook` | Pubblica un post sulla pagina Facebook. Pubblico: quindi mai sotto 🟡, mai in automatico senza firma. |
| `gbp` | Pubblica sulla scheda Google del negozio (Google Business Profile): post, orari, novità — dove la gente cerca. |
| `instagram` | Pubblica un post o una storia su Instagram. Stesso principio di Facebook: è la voce pubblica di MyCity. |
| `telegram` | Ti scrive sul telefono. È l'unica mano che parla solo con te: nessun estraneo la riceve. |

> 📁 Dove: `cervello/publishers/` per le mani · i sensori per gli occhi · 📏 Quanto: 5 mani · 13 modelli grafici

### 8. 🔄 I flussi — come le parti si parlano

Le prime sette parti sono i pezzi; questa è il movimento. Se dovessi capire una cosa sola di tutta la macchina, capisci questi cinque cicli: spiegano perché tutto il resto esiste.

- **8.1 Il ciclo di un'azione** — Un senior la prepara completa → finisce nella coda delle azioni → il Pannello te la mostra con «cosa cambia» e «se va bene» → tu firmi → il worker la esegue → l'esito torna in memoria. **Senza firma non parte niente.**
- **8.2 Il ciclo di un lavoro** — Scrivi in chat o premi un comando → nasce una riga in coda → il worker la prende → l'AI lavora → la risposta ti arriva mentre si scrive. Se cade: ritenta da solo, e se resta orfana qualcuno la recupera.
- **8.3 Il ciclo del giro** — Un orario fa partire il giro → i sensori aprono gli occhi → i guardiani controllano → l'AD scrive briefing e stato → la memoria viene pubblicata → il Pannello la legge e si aggiorna.
- **8.4 Il ciclo dell'apprendimento** — Com'è andata → lezione (le tue correzioni valgono doppio) → registro delle lezioni → torna nel contesto della sessione dopo. È il motivo per cui a inizio chat vedi «memoria persistente».
- **8.5 Il ciclo della pubblicazione** — Un ramo unico. Il codice ci arriva solo da una revisione, la memoria direttamente. Un lucchetto impedisce a due scritture di pestarsi, e il server tiene la sua copia allineata.

> 📁 Dove: trasversale — tiene insieme le parti da 1 a 7 · 📏 Quanto: 5 cicli

### 9. 🧩 Le estensioni — i moduli che si aggiungono

Tre cose diverse che spesso vengono confuse. Una **skill** è un mansionario che si apre da solo quando serve (chiedi «la macchina sta bene?» e si apre quello della visita). Un **workflow** è una squadra di analisti che parte in parallelo su un problema grosso e verifica ogni scoperta prima di riportarla. Una **capacità** è un'idea di frontiera già scritta come modulo, in attesa del momento in cui avrà senso accenderla.

- **9.1 Le skill (72)** — Si aprono al momento giusto senza che tu debba chiamarle per nome. L'elenco è qui sotto.
- **9.2 I workflow (6)** — Analisi profonde a molte dimensioni, dove ogni problema trovato viene messo alla prova prima di finire nel report.
- **9.3 Le capacità (46)** — Il magazzino del futuro: il gemello digitale del negoziante, il concierge della spesa, il catalogo che si scrive da solo, il sismografo della città.

**Le skill:**

| Skill | Cosa fa |
| --- | --- |
| `ab-testing` | Pianifica ed esegue A/B test/esperimenti di crescita: ipotesi, varianti, durata, significatività. |
| `ad-creative` | Genera e itera copy per ads a pagamento — headline, testo, varianti — su qualunque piattaforma. |
| `ads` | Strategia e gestione di campagne a pagamento: targeting, budget, ROAS/CPA su Google/Meta/LinkedIn. |
| `ai-seo` | Ottimizza i contenuti per farsi citare dai motori di ricerca AI (ChatGPT, Perplexity, AI Overviews). |
| `analytics` | Imposta e verifica il tracking (GA4, eventi, UTM) per misurare se una cosa funziona davvero. |
| `aso` | Audit e ottimizzazione della scheda App Store/Google Play: parole chiave, conversione, concorrenti. |
| `cantiere` | La riparazione dei difetti che le radiografie hanno trovato: si sceglie per malattia, non per conteggio. |
| `churn-prevention` | Riduce l'abbandono: flussi di cancellazione, offerte di recupero, pagamenti falliti, win-back. |
| `co-marketing` | Trova partner e pianifica campagne congiunte con altre aziende. |
| `code-simplifier` | Semplifica e pulisce codice già scritto mantenendo il comportamento invariato. |
| `codebase-design` | Vocabolario condiviso per progettare moduli di codice profondi e ben incapsulati. |
| `codebase-search` | Esplora repository remoti con un motore di ricerca sul contesto del codice. |
| `cold-email` | Scrive email di primo contatto B2B e le sequenze di follow-up che ottengono risposte. |
| `community-marketing` | Costruisce e sfrutta community online (Discord/forum) per crescita e passaparola. |
| `competitor-profiling` | Profila i concorrenti a partire dai loro URL: ricerca e analisi competitiva. |
| `competitors` | Crea pagine di confronto/alternative per SEO e supporto vendite contro i concorrenti. |
| `content-strategy` | Pianifica cosa scrivere: temi, cluster, calendario editoriale. |
| `copy-editing` | Rilegge e migliora testi di marketing già scritti, o li aggiorna se datati. |
| `copywriting` | Scrive o riscrive testi di marketing per una pagina — home, landing, prezzi, prodotto. |
| `cro` | Ottimizza la conversione di pagine e form del sito: funnel, A/B test, frizioni. |
| `customer-research` | Conduce e sintetizza ricerca sui clienti: interviste, recensioni, ticket, persona. |
| `diagnosing-bugs` | Ciclo di diagnosi guidato per bug difficili e regressioni di performance. |
| `differential-review` | Revisione di sicurezza mirata su PR/commit/diff, con raggio d'impatto e copertura test. |
| `directory-submissions` | Sottomette il prodotto a directory (startup/SaaS/AI) per backlink e scoperta. |
| `docx` | Crea, legge e modifica documenti Word (.docx/.dotx). |
| `emails` | Crea sequenze email automatiche — onboarding, drip, lifecycle. |
| `firecrawl` | Cerca e legge il web via CLI: ricerca, scraping, pagine con login/click. |
| `free-tools` | Valuta e progetta strumenti gratuiti (calcolatori, generatori) come leva di marketing. |
| `grilling` | Mette sotto torchio un piano o un'idea per stress-testarla prima di partire. |
| `handoff` | Prepara il passaggio di consegne di un lavoro tra sessioni o persone. |
| `image` | Genera e ottimizza immagini per marketing: hero, grafiche social, mockup prodotto. |
| `launch` | Pianifica il lancio di un prodotto o di una funzione: checklist, canali, annuncio. |
| `lead-magnets` | Pianifica contenuti scaricabili (ebook, checklist, template) per raccogliere email. |
| `marketing-council` | Consiglio simulato di grandi marketer per pareri multipli e in contrasto su una domanda. |
| `marketing-ideas` | Genera idee e ispirazione di marketing per un prodotto, come punto di partenza. |
| `marketing-loops` | Configura flussi di marketing ricorrenti che un agente esegue a cadenza fissa. |
| `marketing-plan` | Scrive un piano di marketing completo (AARRR) per un'azienda o un cliente. |
| `marketing-psychology` | Applica principi di psicologia e scienze comportamentali al marketing. |
| `offers` | Costruisce l'offerta sotto il copy — bonus, garanzie, scarsità, naming. |
| `onboarding` | Progetta l'attivazione post-iscrizione: primi passi, aha-moment, riduzione abbandono. |
| `paywalls` | Progetta paywall e upsell dentro l'app. |
| `pdf` | Crea e modifica documenti PDF. |
| `ponytail` | Riduce al minimo indispensabile i task che toccano solo codice. |
| `popups` | Progetta popup e modali per acquisizione lead o conversione. |
| `pricing` | Definisce prezzi e piani, willingness-to-pay, test di prezzo. |
| `product-marketing` | Posizionamento, ICP, messaging: il ponte tra prodotto e mercato. |
| `programmatic-seo` | Genera pagine SEO su scala da un template più un dataset. |
| `prospecting` | Trova e qualifica potenziali clienti da contattare. |
| `public-relations` | Comunicati stampa, contatti con giornalisti, kit stampa. |
| `react-best-practices` | Buone pratiche React per componenti e hook di qualità. |
| `referrals` | Programmi di referral e passaparola tra clienti. |
| `revops` | Revenue operations: funnel end-to-end, KPI condivisi, CRM, forecast di pipeline. |
| `sales-enablement` | Materiali di supporto vendite: battle card, obiezioni, one-pager. |
| `salute` | La visita: controlla i cinque organi vivi e distingue ✅ provato, ❌ rotto e ⚪ non l'ho potuto vedere da qui. |
| `schema` | Implementa dati strutturati (schema.org) per la SEO. |
| `senior` | La squadra dei 120 a fondo: chi è vivo, chi dorme, chi si sovrappone, chi non consegna nel formato giusto. |
| `seo-audit` | Audit tecnico e on-page della SEO. |
| `signup` | Ottimizza il flusso di registrazione/iscrizione. |
| `site-architecture` | Progetta l'architettura informativa e di navigazione del sito. |
| `sms` | Scrive campagne e flussi via SMS. |
| `social` | Pianifica e scrive contenuti social. |
| `supabase` | Guida all'uso di Supabase (database, autenticazione, storage). |
| `supabase-postgres-best-practices` | Buone pratiche Postgres quando si usa Supabase. |
| `superpowers` | Meta-skill con capacità estese di supporto al lavoro di sviluppo. |
| `systematic-debugging` | Metodo sistematico da seguire prima di proporre un fix su un bug. |
| `tdd` | Sviluppo guidato dai test (scrivi il test prima del codice). |
| `verify` | La prova sul campo: guida il Pannello vero con un browser e i test del worker, per dimostrare che un fix funziona. |
| `video` | Produzione di video e reel di marketing. |
| `web-design-guidelines` | Linee guida di design per interfacce web. |
| `webapp-testing` | Test end-to-end di applicazioni web. |
| `worker` | Il worker e il VPS a fondo: code, servizi, lock, orfani, riavvii — quando qualcosa è fermo e serve la causa vera. |
| `xlsx` | Crea e modifica fogli Excel (.xlsx). |

**I workflow:**

| Workflow | Cosa fa |
| --- | --- |
| `audit-design` | Audit profondo del design: 11 dimensioni che coprono i 24 punti visivi e di usabilità del sito. |
| `audit-pannello` | Audit del Pannello stesso: bug di navigazione, stato perso, liste vecchie, errori a runtime. |
| `auto-radiografia` | La macchina che analizza sé stessa: 12 dimensioni sull'architettura, più pre-mortem e confronto coi migliori. |
| `giro-operativo` | Il giro fatto da una flotta di senior in parallelo: ognuno propone le mosse a maggior ritorno, poi l'AD ordina. |
| `radiografia-totale` | Tutti gli organi insieme in tre giri: 48 dimensioni su macchina, Pannello, senior, worker, GitHub e codice, dove ogni giro cerca ciò che il precedente non ha visto. |
| `radiografia` | Audit profondo del marketplace: 13 dimensioni in sola lettura, ogni problema verificato prima di essere riportato. |

> 📁 Dove: `.claude/skills/`, `.claude/workflows/`, `cervello/capacita/` · 📏 Quanto: 72 skill · 6 workflow · 46 capacità

---

## Come approfondire

In chat basta il numero: «approfondisci 5.1», «spiegami il 2.2».

⚠️ Questa mappa dice **cosa c'è e quanto è grande**, non se funziona. Un pezzo può essere contato, descritto e completamente rotto: qui risulterebbe sano. «Funziona?» è un'altra domanda e ha un altro strumento — la visita di salute.
