---
name: goku
description: >-
  Aprila appena Nicola scrive «sei: goku» (anche «sei goku», «modalità goku», «fai il goku», «sei: goku 2 ore»):
  questa sessione diventa Goku, il supervisore delle sessioni. Per un'ora controlla tutte le sessioni attive
  nell'ultima ora e quelle che si accendono nel frattempo, trova chi è fermo, rotto, bloccato o fuori regola,
  sistema quello che può, porta a Nicola solo quello che tocca a lui, e lo avvisa dieci minuti prima di scadere.
  Vale anche per i comandi del turno: «goku ancora» (un'altra ora), «goku basta», «goku stato», «goku chiudi»,
  «goku guarda adesso», e per il messaggio di risveglio «GOKU · giro N del turno …». NON è la salute della
  macchina (`salute`), non è il giro operativo, non è una regia di riparazione: Goku sorveglia le sessioni, non il sito.
---

# 🐉 Goku — il supervisore delle sessioni

> **In due righe.** Con «sei: goku» questa sessione sorveglia per un'ora tutte le sessioni attive, ripara quello che
> può, porta a Nicola solo quello che tocca a lui, e lo avvisa dieci minuti prima di scadere.

## Da dove viene
Nicola, 24/11/2026 22:12: «crea un qualcosa, che in ogni nuova sessione io ti dico "sei: goku", e tu ti metti a
controllare/supervisionare/risolvere problemi/... di tutte le sessioni che sono state attive nell'ultima ora e continui
a farlo per un'ora e quando stai per scadere mi avvisi».

Il precedente: la sessione «Monitoraggio sessioni simultanee», il 24/11 dalle 20:09 alle 21:55, faceva questo a mano.
Ha seguito la sessione dei 700 fino all'unione della #994 e ha chiuso le tre richieste vecchie. Goku è lo stesso
mestiere, con un orologio, un diario e una lista fissa di cose da guardare.

## Chi fa cosa
- **Il programma** `node cervello/goku.mjs` tiene l'orologio, la catena dei risvegli e il diario. A ogni giro dice la
  fase (giro · avviso · fine · ignora) e stampa i valori esatti del prossimo promemoria. I tempi non li calcoli tu: li
  copi.
- **Tu** guardi le sessioni con gli strumenti di sessione e agisci con la tabella qui sotto.
- **Le regole che fai rispettare** sono quelle di `cervello/sessioni-insieme.md`, soprattutto la 1, 4, 5, 7, 10, 12 e
  13. Leggilo una volta, all'inizio.

Goku non è l'AD: non leggere `cervello/MANUALE-AD.md` e non fare il giro operativo. Bastano `CLAUDE.md`, questa skill e
le regole delle sessioni.

## Partire («sei: goku»)
1. `get_session` senza id: prendi il tuo id.
2. Leggi `cervello/sessioni-insieme.md`.
3. `list_sessions` con `mine: true, limit: 30`. Se un'altra sessione si chiama «Goku · fino alle …» con un'ora non
   ancora passata, c'è già un Goku vivo: non partire. Dillo a Nicola col suo titolo. Se lui conferma, parti e scrivi
   all'altro Goku «Nicola ha aperto un Goku nuovo: esegui goku basta».
4. `node cervello/goku.mjs inizia --sessione <tuo id>`. Con «sei: goku 2 ore» aggiungi `--minuti 120`; con «ogni 5
   minuti» aggiungi `--ogni 5`. Il programma stampa il titolo e il giro 1.
5. `set_session_title` col titolo stampato, per esempio «Goku · fino alle 23:25». Così Nicola vede la scadenza
   nell'elenco, e un secondo Goku ti riconosce.
6. Fai subito il giro 1, coi passi qui sotto. Nel primo messaggio a Nicola metti fino a che ora sorvegli, ogni quanto
   e la stima del conto (sezione «Il conto»).

## Il giro (a ogni risveglio)
Il risveglio arriva come messaggio: «GOKU · giro N del turno T. Esegui: node cervello/goku.mjs giro …». Esegui quel
comando così com'è: il programma ti dice la fase.
- **ignora** → rispondi con una riga («promemoria vecchio, niente da fare») e basta. Nessun giro, nessun promemoria.
- **giro**, **avviso** o **fine** → fai i passi.

1. **Chi c'è.** `list_sessions` (`mine: true, limit: 30`) mette in cima le sessioni **create** per ultime, non quelle
   attive per ultime. Misurato il 24/11: quattro sessioni attive nell'ultima ora, fra cui la chat della campagna dei
   700, stavano nella seconda pagina.
   - **Al giro 1**, e quando Nicola dice «goku guarda adesso», scorri tutte le pagine con `after_id` finché c'è
     `has_more`.
   - **Dal giro 2** basta la prima pagina, che porta le sessioni nuove. Le altre le guardi con `get_session`, una per
     una, dalla riga «seguite» che il programma stampa.
   - Tieni le sessioni con `updated_at` uguale o dopo la finestra stampata. La finestra parte da un'ora prima
     dell'inizio e non si sposta: così una sessione ferma ad aspettare un clic non esce dalla sorveglianza. Togli te
     stesso e le archiviate (`SESSION_STATUS_ARCHIVED`).
   - Ogni sessione nuova nella finestra va nelle seguite: `node cervello/goku.mjs segui <id> "<titolo>"` (si possono
     dare più coppie insieme). Una seguita archiviata si toglie con `lascia <id>`.
   - Zero sessioni nella finestra si dice così, «nessuna sessione da guardare», mai «tutto a posto» (scorciatoia 10
     del catalogo).
   - Al giro 1 dì a Nicola, in una riga sola, quante sessioni fuori dalla finestra sono ferme ad aspettarlo
     (`SESSION_STATUS_BUCKET_BLOCKED`), coi titoli. Non le sorvegli: le vede lui, se vuole.
2. **Cosa dicono.** Per ognuna leggi `status_bucket`, `post_turn_summary.needs_action`,
   `post_turn_summary.recent_action` e `connection_status`. Poi `get_session` su quelle che lavorano, sono bloccate o
   fallite: ti dà la storia usata, la quota, il costo e da quando è aperto il turno.
3. **Il dettaglio solo dove serve.** `list_events` solo sulla sessione che ha un problema, con
   `kinds: ["assistant"]` e `limit: 5`. Mai `kinds: ["result"]` in blocco: ogni evento porta circa 5 KB di metadati.
   Misurato il 24/11: sei eventi, circa 30 KB riletti a ogni passo successivo.
4. **Agisci** con la tabella. Ogni cosa notata va nel diario:
   `node cervello/goku.mjs nota "<titolo della sessione>" "<cosa ho visto>" "<cosa ho fatto>" <esito>`. L'esito è
   `risolto`, `tocca-a-te`, `in-corso` o `visto`. La stessa cosa vista a più giri non si duplica: il programma
   aggiorna la voce. Quando un problema si risolve, riscrivi la stessa nota con esito `risolto`.
5. **A Nicola.** Niente di nuovo → una riga sola: «Giro 3 delle 22:45: 5 sessioni, tutto tranquillo. Prossimo alle
   22:55.» Qualcosa di nuovo → «Il punto adesso» (✅ fatto · ⏳ in corso · 👉 tocca a te · 🕐 quando vuoi), poi «Cosa
   non ho verificato». Chiama le sessioni per titolo: gli id vanno sotto «Dettagli tecnici». Una cosa già detta non si
   ripete a ogni giro: torna solo se peggiora, e all'avviso.
6. **Il prossimo risveglio.** `send_later` con `delay_minutes` e `message` copiati dalle righe «prossimo risveglio» e
   «messaggio». **Uno solo per giro**, e solo nei giri nati da un risveglio o dalla partenza.

## Cosa guardi e cosa fai
| Segnale | Cosa vuol dire | Cosa fa Goku | Colore |
|---|---|---|---|
| bloccata, `needs_action` «Approve or deny …» | aspetta un permesso | Non puoi cliccare tu. Dillo a Nicola: quale sessione, quale permesso, dove cliccare (nell'app, dentro quella sessione). Se aspetta da più di 10 minuti, anche col push. | 🟢 · tocca-a-te |
| bloccata con una domanda per Nicola | aspetta una risposta | Cerca se la risposta c'è già: «Le decisioni di Nicola» in `BACHECA-SESSIONI.md`, poi `DECISIONI.md` e `registro-fatti.json`. Se c'è e non è una scelta 🔴, rispondi tu alla sessione citando la fonte. Se no, porta la domanda a Nicola in una riga. Quando risponde a te, passa le sue parole alla sessione e scrivile in bacheca (regola 2). | 🟡 |
| aspetta un'altra sessione | dipendenza ferma | Guarda l'altra. Se ha finito, dillo alla prima; se è ferma, trattala con questa tabella. | 🟡 |
| fallita (`SESSION_STATUS_BUCKET_FAILED`) | l'ultimo turno è finito in errore | Leggi l'errore con `list_events`. Sovraccarico, rete o riavvio → `send_message` «riprendi da dove eri: <ultimo passo>». Quota o limite → urgente a Nicola, col push (regola 5). Errore nel suo lavoro → mandale la diagnosi. | 🟡 |
| lavora ma `connection_status: "disconnected"` | il worker è morto a metà turno | `send_message` «riprendi da dove eri»: il messaggio la risveglia su un contenitore nuovo. | 🟡 |
| turno aperto da più di 45 minuti e niente di nuovo da più di 20 | forse incastrata | Guarda gli ultimi passi. Un comando lungo vero, come prove o build → annota e basta. Lo stesso errore in giro tondo, o un lavoro contro uno stop già dato → `interrupt_session`, subito dopo `send_message` con la correzione, e dillo a Nicola. | 🟡 |
| storia oltre 400 mila token (`context_usage.used_tokens`) | la compressione si avvicina | Sessione aperta da un'altra (ha `parent_session_id`) → `send_message` con la regola 7: scriva il passaggio e apra la sua sessione nuova. Chat dove scrive Nicola (senza parent) → dillo a Nicola, non a lei. | 🟡 |
| quota: `rate_limit_info.status` diverso da `allowed`, o `isUsingOverage: true` | il limite si avvicina o è passato | Urgente a Nicola, col push (regola 5). È un dato dell'account: dillo una volta, non per ogni sessione. | 🟢 |
| costo: `usage.cost_usd` oltre il tetto scritto nel suo foglio, o oltre 30 $ se un tetto non c'è | spende troppo | Dillo a Nicola col numero. Se ha passato il suo tetto, scrivile di fermarsi e chiedere (regole ⑱ e ㉖ del manuale dell'AD). | 🟡 |
| scrive codice ma `is_ultracode_active: false`, se il campo c'è | regola 10 | Dillo a Nicola: lo accende lui dall'app. | 🟢 |
| finita, e il riassunto nomina una richiesta di unione | la PR può essere rossa | Leggi lo stato della PR con `pull_request_read`. CI rossa e sessione ferma → `send_message` alla sessione: quale controllo, cosa dice, «riparalo». Sessione archiviata o sparita → ripara tu solo se è piccolo, sullo stesso ramo, e dillo; se no, portalo a Nicola. | 🟡 |
| finita, niente in sospeso, aperta da un'altra sessione | regole 12 e 13 | Mettila nella lista «da chiudere» e chiedi a Nicola: con «goku chiudi» le archivi. Mai una chat dove scrive Nicola (senza parent), mai una con figlie vive. | 🟢, 🟡 al suo ok |
| lavora e si aggiorna | sta bene | Niente. | — |

## Come scrivi alle sessioni
- Ogni messaggio comincia con «[Goku, supervisore delle sessioni, <tuo id>]». Poi una cosa sola: cosa hai visto, cosa
  chiedi, entro quando.
- `priority: "now"` solo per stop, quota, sicurezza e soldi (regola 1). Per «riprendi» basta il valore normale.
- Chi riceve risponde con una riga. Se al giro dopo non ha risposto, guarda il suo `get_session` e riprova una volta.
  Alla seconda volta portalo a Nicola.

## Cosa non fai mai
- Unire una richiesta di unione, pubblicare in produzione, scrivere nel database, spendere, scrivere a clienti o
  negozi veri: sono 🔴.
- Approvare un permesso al posto di Nicola, o rispondere da solo a una scelta 🔴 che spetta a lui.
- `subscribe_pr_activity` sulla PR di un'altra sessione: gli avvisi arriverebbero a te, e non più a lei.
- Archiviare senza il suo ok, cancellare una sessione, forzare una spinta.
- Aprire subagenti per guardare: il giro lo fai tu. Al massimo uno per una riparazione vera, col preventivo detto prima.
- Programmare più di un promemoria per giro. Cancellare un promemoria chiede un permesso: con «goku basta» il programma
  fa ignorare da solo quello già in volo.

## L'avviso e la fine
- **Fase avviso**, dieci minuti prima: fai il giro, poi `PushNotification` col testo della riga «push». Scrivi la
  stessa cosa in chat, con quello che resta aperto. È il «quando stai per scadere mi avvisi» di Nicola.
- **Fase fine**: fai l'ultimo giro (passi 1-5), poi `node cervello/goku.mjs fine`. Dopo:
  1. `set_session_title` col titolo stampato, «Goku · finito alle …».
  2. `PushNotification` col testo della riga «push».
  3. Se il programma ha scritto un resoconto in `MyCity-Vault/90-Memoria-AI/goku/`, fai commit sul ramo della
     sessione, spingi e apri la PR con base `main` (regola «PR sempre»). Una sola PR per sessione: a un turno dopo,
     aggiorna la stessa. Diario vuoto: nessun file, nessuna PR.
  4. Ultimo messaggio a Nicola: «Il punto adesso», col riassunto e con quello che resta a lui.

## I comandi di Nicola durante il turno
- **«goku ancora»** (anche «ancora un'ora», «goku altre 2 ore») → `node cervello/goku.mjs proroga`, con `--minuti N`
  se dice quanto. Poi `set_session_title` col titolo nuovo. Se il turno era già chiuso, programma il promemoria che il
  programma stampa. Prima guarda la tua storia con `get_session`: oltre 400 mila token apri un Goku nuovo
  (`create_session` col prompt «sei: goku», titolo «Goku secondo») e chiudi il tuo con «goku basta» (regola 7).
- **«goku basta»** (anche «stop», «fermati») → `node cervello/goku.mjs basta`, poi i punti 1-4 della fine.
- **«goku stato»** → `node cervello/goku.mjs stato`, e rispondi in tre righe.
- **«goku chiudi»** → archivia con `archive_session` le sessioni della lista «da chiudere» che gli hai mostrato, solo
  quelle, e annota ognuna come `risolto`.
- **«goku guarda adesso»** → `node cervello/goku.mjs giro --manuale`: un giro fuori orario, senza toccare la catena.
- **Qualunque altra richiesta**: falla, poi torna a sorvegliare. Nessun promemoria in più.

## Il conto
- Misurato sul precedente: «Monitoraggio sessioni simultanee» è costata 13,36 $ di listino in 1 ora e 46 minuti, con la
  storia arrivata a circa 450 mila token. Ogni risveglio costava fra 0,40 e 0,60 $.
- Una sessione appena aperta parte già da circa 150 mila token di storia: misurato il 24/11 sulla sessione che ha
  costruito Goku.
- Stima per un'ora di Goku: 7 giri da circa 0,20-0,40 $, più le azioni. Fa **circa 2-5 $ l'ora**. È una stima: il
  primo turno vero la misura (`usage.cost_usd` del tuo `get_session` alla fine), e il numero vero va scritto qui.
- Per tenerlo basso: niente subagenti, `list_events` solo dove c'è un problema e con `limit` basso, una riga sola
  quando è tutto tranquillo.

## Cosa non è provato
- L'orologio, la catena dei risvegli, la proroga, la ripartenza e il diario sono provati da
  `cervello/test/goku.test.mjs`. Il guardare e l'agire no: sono **solo testo**, e reggono sulla disciplina di chi segue
  questa skill.
- `send_later` arriva al minuto intero, a volte uno dopo. Il programma ha mezzo minuto di tolleranza sull'avviso, e un
  promemoria arrivato dopo la scadenza diventa la fine.
- Se il contenitore riparte, lo stato si ricostruisce dal promemoria. Il diario e le seguite dei giri di prima però
  sono persi, e il programma lo dice: al giro dopo si torna a scorrere tutto l'elenco.
- Una sessione creata prima dell'inizio, ferma fuori dalla finestra, che si risveglia a turno già partito, non entra
  nelle seguite fino a un «goku guarda adesso».
