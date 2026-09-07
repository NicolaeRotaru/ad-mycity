# Stato del lotto: i difetti minori del sito, aperto il 6 settembre 2026

> **In due righe.** Dei 275 difetti minori del sito ne sono chiusi 198. Il sito passa da 304 problemi
> aperti a 150. Questo file è il diario di bordo del lotto: cosa hanno fatto le 48 squadre, ondata per ondata.

**In parole semplici.** Un «lotto» è un blocco di riparazioni fatto tutto insieme. Le squadre lavorano
in parallelo, ognuna chiusa nei suoi file, e alla fine io ricucio il lavoro in una consegna sola.

**Cosa cambia per te.** Ti arriva una richiesta di unione sola invece di 48. Il sito ha 154 difetti
in meno. Esempio concreto: la foto scattata con l'iPhone si poteva trascinare nella vetrina e
spariva senza dire niente. Adesso il negoziante vede un messaggio.

**Cosa devi fare.** Guardare la richiesta di unione numero 250 e decidere se unirla. Le tre cose che
aspettano una tua risposta stanno in fondo a questo file.

**Cosa non ho verificato.** Non ho provato il sito con un ordine vero su un negozio vero: le prove
girano tutte sul codice, non in produzione.

**Cosa è.** 275 difetti di gravità minore del marketplace, divisi in 126 pacchetti su 27 ondate da 5
squadre. Il piano è `consegne/audit/2026-09-06-1509-pacchetti-sito-304difetti.json`, filtrato ai soli
minori. Fuori dal lotto restano 3 bloccanti e 26 gravi: quelli hanno un'altra asticella.

**Regole del lotto.** Ramo `claude/marketplace-open-issues-0gudy6` nei due repo. Le squadre non
committano: commit per ondata, li fa l'AD. Cancello finale: `npm run verify` nel repo del sito +
`node cervello/radiografia-in-corsa.mjs --repo ../mycity`. Colore 🟡: l'unione resta di Nicola.

## Avanzamento

| ondata | squadre | difetti | esito | commit |
|---|---|---|---|---|
| 1 | 1-5 | 31 | 13 chiusi | ondata-1 |
| 2 | 6-10 | 32 | 28 chiusi | ondata-2 |
| 3 | 11-15 | 30 | 25 chiusi | ondata-3 |
| 4 | 16-20 | 29 | 18 chiusi | ondata-4 |
| 5 | 21-25 | 17 | 13 chiusi | ondata-5 |
| 6 | 201-205 | 32 | 25 chiusi | ondata-6 |
| 7 | 206-210 | 31 | 24 chiusi | ondata-7 |
| 8 | 211-215 | 31 | 22 chiusi | ondata-8 |
| 9 | 216-220 | 31 | 23 chiusi | ondata-9 |
| 10 | 221-222 | 11 | 7 chiusi | ondata-10 |
| perimetro | 223, 230-237 | 17 | 15 chiusi | riparazioni |

## Come è finita

**198 chiusi su 275** (186 riparati, 12 trovati già a posto). Il registro del sito passa da 304
difetti aperti a 150: 3 bloccanti, 38 gravi, 109 minori.

**La radiografia del perimetro** è stata fatta a lotto finito. Ha riguardato i 202 file toccati,
con la lente di ognuna delle nove dimensioni. Ha trovato **58 difetti**.
Di questi, **sei gravi erano nati dal lotto stesso**. Sono stati riparati prima della consegna,
da squadre diverse da quelle che li avevano creati:

1. alla cassa il pulsante che incassa si premeva e non succedeva niente. Ci sono volute due riparazioni incrociate;
2. una lettura del database caduta marcata come «rimborso senza ritorno»: soldi del cliente fermi;
3. «scarica i miei dati» spacciava per elenco vuoto una sezione non letta;
4. lo stesso ordine scriveva l'importo in due modi su canali diversi;
5. la foto HEIC trascinata spariva senza messaggio in due moduli su tre;
6. il modulo prodotto salvava un campo che l'utente non aveva toccato.

Più il peggiore, trovato per caso: **il foglio di stile del sito era rotto in silenzio** da un
commento chiuso male, e il compilatore produceva zero righe. Era già dentro un commit ed è passato
sotto 3573 prove verdi, perché nessuna prova compilava il CSS.

**Consegna**: richiesta di unione NicolaeRotaru/mycity#250 — 11 commit, 290 file, +14.574/−1.285.
Il cancello è verde. `npm run verify` esce 0, su 495 file di test e 3654 prove.
Il foglio di stile compila in 11.243 righe.
E `radiografia-in-corsa --repo ../mycity` esce 0, su 208 file e 9 dimensioni.

## Da portare a Nicola quando il lotto si chiude

1. **Il confine della consegna a 25 km dal negozio.** → accodata come card #196. La squadra 17 ha dovuto mettere un numero
   per chiudere il difetto della zona: 25 km fa passare Piacenza e la cintura, e taglia fuori
   Milano e Cremona. È una decisione di business, non una riparazione: la firma è di Nicola. Con
   20 km diventava rossa una prova esistente, perché il sito una consegna a 24 km la serve già.
   Attaccato: la promessa «30-60 minuti» non regge al bordo — a 24 km la stima è 75 minuti.
2. **`RESEND_FROM` su Vercel prima di unire** → card #195. E **i moduli che rifiutano HEIC** → card #194.
3. **Le cose che si chiudono fuori dal codice** (🔴): protezione password su Supabase Auth, Web
   Analytics su Vercel, i doppioni di regole in produzione, l'aggiornamento delle dipendenze
   (peggiorato da 3 a 4 vulnerabilità), il DAC7 e il periodo di conservazione dei dati.
4. **Da guardare con gli occhi prima dell'unione**: nessuna squadra ha avuto un browser. In
   particolare il ritmo verticale della home, i titoli della scheda prodotto passati a 24px
   serif, e le foto verticali che ora mostrano bande laterali.
