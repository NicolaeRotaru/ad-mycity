# Lotto minori del sito — 2026-09-06 — stato

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

**Totale a fine ondata 4: 84 chiusi su 122 lavorati** (79 riparati, 5 trovati già a posto).

## Da portare a Nicola quando il lotto si chiude

1. **Il confine della consegna a 25 km dal negozio.** La squadra 17 ha dovuto mettere un numero
   per chiudere il difetto della zona: 25 km fa passare Piacenza e la cintura, e taglia fuori
   Milano e Cremona. È una decisione di business, non una riparazione: la firma è di Nicola. Con
   20 km diventava rossa una prova esistente, perché il sito una consegna a 24 km la serve già.
   Attaccato: la promessa «30-60 minuti» non regge al bordo — a 24 km la stima è 75 minuti.
2. **Le cose che si chiudono fuori dal codice** (🔴): protezione password su Supabase Auth, Web
   Analytics su Vercel, i doppioni di regole in produzione, l'aggiornamento delle dipendenze
   (peggiorato da 3 a 4 vulnerabilità), il DAC7 e il periodo di conservazione dei dati.
3. **Da guardare con gli occhi prima dell'unione**: nessuna squadra ha avuto un browser. In
   particolare il ritmo verticale della home, i titoli della scheda prodotto passati a 24px
   serif, e le foto verticali che ora mostrano bande laterali.
