# I difetti minori del sito: ne restano 109 su 275, e sei cose le avevo rotte io

**In parole semplici.** Mi hai chiesto di chiudere a pacchetti i difetti minori del marketplace.
Erano 275. Ne ho chiusi 198, cioè quasi tre su quattro. Di questi 198, ne ho riparati 186 e ne ho
trovati 12 già a posto.
Ne restano 77 di quelli di partenza. A questi si aggiungono 32 difetti nuovi, che ho trovato
proprio mentre riparavo. Il conto di tutto il sito passa da 304 difetti aperti a 150.

Il lavoro l'hanno fatto 48 squadre in dieci giri, ognuna chiusa nei suoi file perché non si
pestassero i piedi. Io ho diviso il lavoro, l'ho distribuito e l'ho ricucito: tu vedi **una sola
richiesta di unione**, la numero 250.

**Cosa cambia per te.** Il cliente che compra vede meno cose storte: i prezzi si scrivono in
italiano dappertutto — prima lo stesso ordine diceva «35,00 €» nell'email e «€35.00» sulla notifica
al negoziante e sull'etichetta del fattorino. Il carrello e la cassa dicono lo stesso costo di
spedizione. Alla cassa il pulsante che incassa non si preme più a vuoto. Chi vede poco riesce a
leggere nomi e prezzi anche mentre la pagina si aggiorna. Il negoziante che carica una foto
rifiutata capisce perché, in italiano, in tutti i moduli.

Il sito però resta chiuso al pubblico finché non sblocchi tu i tre bloccanti: il database di
produzione indietro di ventuno migrazioni, il nome del sito che porta a un server spento, e le
unioni che pubblicano senza aspettare i controlli. Nessuno di quei tre si chiude da qui.

**La cosa più importante di tutta la giornata.** Finiti i dieci giri ho riguardato i 202 file che
le squadre avevano toccato, con la lente di ognuno dei nove mestieri. Ho trovato 58 difetti, e sei
di quelli **gravi li avevo creati io oggi**. Li ho fatti riparare prima di consegnarti qualcosa,
da squadre diverse da quelle che li avevano fatti.

Il peggiore non era nemmeno fra quei sei. Riscrivendo un commento nel foglio di stile era rimasta
una riga fuori dal commento, e da lì in giù il foglio non valeva più niente: il compilatore
produceva zero righe. Non un pezzo: tutto il foglio di stile del sito. Era già dentro un commit
mio, ed è passato sotto 3573 prove verdi senza che nessuna se ne accorgesse, perché **nessuna
prova compilava il foglio di stile**: lo leggevano tutte come testo. L'ha trovato per caso una
squadra che stava misurando altro.

Adesso c'è una prova che compila per davvero e cade se il foglio non arriva in fondo. Ed è la
lezione che porto via: una ricerca di parole non può fallire nel modo in cui fallisce la realtà.

**Cosa devi fare.** Due cose vogliono la tua firma prima che questa roba vada online.

La prima: la zona di consegna adesso ha un confine, e prima non ce l'aveva. L'ho messo a 25
chilometri dal negozio — Piacenza e la cintura passano, Milano e Cremona no. Non è una riparazione
tecnica: dice a chi possiamo vendere. E c'è una crepa attaccata: la promessa «30-60 minuti» al
bordo della zona non regge, a 24 chilometri la stima è 75.

La seconda: prima di pubblicare va messa su Vercel la variabile del mittente delle email. Da oggi,
senza quella, la posta non parte più in silenzio da un indirizzo finto — si ferma e lo dice. Il
manuale del progetto insegna da sempre un nome diverso da quello che il codice legge davvero,
quindi è concreto che oggi in produzione manchi.

C'è poi una terza cosa più piccola, ma è tua: i moduli adesso rifiutano le foto in HEIC, che è il
formato di serie di ogni iPhone. Il rifiuto c'era anche prima, ma era muto; adesso si sente. La
domanda vera è se quel rifiuto ci debba essere.

**Cosa non ho verificato.** Nessuna squadra ha avuto un browser. Vuol dire che **niente di quello
che ho cambiato l'ha guardato qualcuno a schermo**. Le prove leggono il codice, eseguono le funzioni e
calcolano i contrasti dai colori dichiarati — non guardano i pixel. Vanno viste con gli occhi
almeno la home, la scheda prodotto e la cassa su un telefono vero.

Non ho toccato niente in produzione, non ho applicato nessuna migrazione e non ho visto il
database vero: dove serviva una migrazione mi sono fermato, e ho lasciato lo script scritto.

E la contabilità della mia stessa radiografia è incompleta: il guardiano identifica le schede del
sito dal titolo e separa gli elenchi con la virgola, ma i titoli sono frasi italiane e 25 su 58 una
virgola ce l'hanno. Il lavoro è stato fatto tutto, il registro ne dichiara 33. Te l'ho messo in coda come carta #197 invece di far
finta di niente: ripararlo vuol dire toccare la macchina, e quello non lo faccio da sola.

---

**Dettagli tecnici** — richiesta di unione [NicolaeRotaru/mycity#250](https://github.com/NicolaeRotaru/mycity/pull/250), ramo `claude/marketplace-open-issues-0gudy6`, 11 commit, 290 file, +14.574/−1.285.
Cancello: `npm run verify` esce 0. Copre 495 file di test e 3654 prove, con typecheck e lint puliti.
Poi `npx tailwindcss -i app/globals.css` produce 11.243 righe.
Infine `node cervello/radiografia-in-corsa.mjs --repo ../mycity` esce 0 su 208 file e 9 dimensioni.
Le prove sono passate da 424 file / 3230 casi a 495 / 3654: +71 file e +424 casi.
Conto del registro: 898 schede, 748 chiuse, 150 aperte (3 bloccanti, 38 gravi, 109 minori), da `node cervello/radiografia-marketplace-conti.mjs`.
Piano dei pacchetti in `consegne/audit/2026-09-06-1509-pacchetti-sito-304difetti.json`; frammenti delle squadre, referti delle nove radiografie e `ricuci.mjs` in `MyCity-Vault/90-Memoria-AI/auto-coscienza/lotti/sito-2026-09-06/`.
Il difetto del guardiano è accodato come carta #197; il comando che lo riproduce è `node cervello/radiografia-in-corsa.mjs registra --dimensione qa-flussi --toccati --trovati 1 --schede "<un titolo con la virgola>" --repo ../mycity`, che oggi esce 1.
