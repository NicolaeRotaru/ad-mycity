---
tipo: quaderno-di-bordo
data: 2026-11-12 15:25
per: la sessione regista della campagna «sito, tutto»
---

# La regia della campagna «sito, tutto»

## In parole semplici
Questo foglio lo legge la regista. È la sessione che apre i riparatori, li sorveglia e unisce il loro lavoro.
Prima legge la guida del risolutore e il manuale dell'AD. Qui trova solo cosa è già fatto e cosa resta.
Per esempio: la prima onda ha 12 riparatori da 25 difetti l'uno, e il riparatore R11 parte dal pannello dei bonifici.

## Cosa cambia per te
Nicola parla solo con l'AD. Ogni fermata, e il messaggio finale, vanno all'AD con un messaggio fra sessioni.
L'AD li mostra a Nicola e riporta la sua risposta. Il «via» arriva sempre da lì.

## Cosa devi fare
Finire la preparazione, aspettare il «via», poi guidare tre onde, la cucitura e i controllori.

## Cosa non ho verificato
Non ho provato ad aprire le sessioni figlie. La regista è in modalità «auto» (controllato alle 15:45): le figlie nascono in «auto».

---

## Dettagli tecnici

**Le scelte di Nicola, 12/11.**
- Casa `sito`, profilo `tutto`.
- Riparatori da 25 voci al massimo, in tre onde. Fermate: prima dell'onda 1, dopo l'onda 1, dopo l'onda 2.
- Un controllore dopo ogni onda e uno finale, oltre ai collaudatori.
- Niente lavoro inutile: vale la sezione «Il lavoro che non si fa» della guida.
- La sessione dell'AD è `session_015BmpnWWfcmEfYEhQ25M7s2`.

**Già fatto.**
- `perimetro.json`: 662 lavorabili su 828 aperti. Sono 5 bloccanti, 74 gravi e 583 minori.
- Fuori dal perimetro: 88 riservate, 67 con una domanda per Nicola, 11 senza percorso.
- La base del sito è `db5164c52e856c0e3eab1c02197ae755fca76eb3`.
- `piano.json`: l'onda 1 è divisa, con 12 sessioni e 300 voci. Ne restano 362 per le onde dopo.
- La simulazione delle onde dopo: 12 sessioni con 233 voci, poi 6 con 85, poi la cucitura e circa 4 voci in eccedenza.

**Preparazione finita (12/11 alle 15:36, regista `session_015BmpnXsL6Y7tP3BhawauHw`).**
- Sito clonato in `/home/user/mycity` alla base `db5164c`, `npm ci` lanciato. RAMO_SITO = `claude/sweet-galileo-0skkay`.
- Schede R01-R12 e `registro-compatto.txt` scritti; `copertura-prima` e `segnaposti` verdi.
- Il «via» di Nicola è arrivato alle 15:34: l'onda 1 parte subito dopo il push di questo commit (SHA_REGISTA).
- Gli id delle figlie stanno in `sessioni.json`, il diario in `diario-della-sorveglianza.txt`.

**Le onde dopo.** `dividi --base <SHA di integrazione>`, con `--ultima` sull'onda 3. Il default è già 25 voci.

**La sorveglianza.** `bash cervello/riparazione/sorveglia.sh <C> <onda>` ogni 30 minuti, più `get_session`.

**I controllori.** Le regole stanno in `cervello/riparazione/LEGGIMI-controllore.md`. I referti vanno in
`<C>/controlli/`, e `applica` li legge da solo.

**Il conto.** Il consumo di ogni figlia si legge da `get_session`, nel campo `usage.cost_usd`. Va detto a ogni
fermata. Il preventivo detto a Nicola è di circa 1.300-1.500 $ in tutto.
