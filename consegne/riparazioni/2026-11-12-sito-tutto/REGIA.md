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
- La sessione dell'AD, dal 13/11 01:30, è `session_015BmpnXznpQwCRc8GAKjgyw` («AD — continua dal 13/11»).

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

**Onda 1 chiusa (12/11 alle 19:45) — FERMATA 2 mandata all'AD, si aspetta «via la seconda».**
- Integrazione sito `claude/sweet-galileo-0skkay` @ `b144746`: 11 rami uniti (R05 mai partito), verify ✅ 9646, SQL ✅.
- Tolte con revert: R03-001, R03-008, R11-015, R11-016, R12-012, R07-019, R06-014, R06-017. R10-019 lasciata (latente, abbonamento spento).
- `applica` a vuoto verde: 300 voci → 115 si chiudono, 7 già riparate, 178 aperte, 62 nati. `controlli/C01.json` copiato (forma delle riservate normalizzata).
- Costo misurato onda 1: 583 $ di listino (riparatori 399, collaudatori 137, C01 15, regia 32).
- Le falle riservate stanno SOLO nel messaggio all'AD della fermata 2, non qui.
- Al «via la seconda»: `dividi --base 3e820b069e0baf37daac343ea832539fb871d4d6` (la testa di integrazione di adesso) con `--file-chiavi` (le 25 di R05 + serve_file_altrui + tolte), poi schede, copertura-prima, F1.

**Le onde dopo.** `dividi --base <SHA di integrazione>`, con `--ultima` sull'onda 3. Il default è già 25 voci.

**La sorveglianza.** `bash cervello/riparazione/sorveglia.sh <C> <onda>` ogni 30 minuti, più `get_session`.

**I controllori.** Le regole stanno in `cervello/riparazione/LEGGIMI-controllore.md`. I referti vanno in
`<C>/controlli/`, e `applica` li legge da solo.

**Il conto.** Il consumo di ogni figlia si legge da `get_session`, nel campo `usage.cost_usd`. Va detto a ogni
fermata. Il preventivo detto a Nicola è di circa 1.300-1.500 $ in tutto.

**Passaggio alla regista dell'onda 2 (13/11 01:35, dalla regista `session_015BmpnXsL6Y7tP3BhawauHw`, a 450 mila token).**
- Sito, PR #288 in bozza, testa `3e820b0`, CI 17 su 17 verde. Dentro anche la falla dell'IBAN chiusa (`8bf33ea`, migrazione 365) e il blocco di Supabase, Vercel e Stripe per le sessioni del sito (`65934dc`, `3e820b0`, dell'AD).
- Database vero: applicate 250, 260, 270, 271, 272, 300, 320, 321, 322, 323, 360 e 365. Mancano 361, 363 e 364: Nicola ha detto «riprova», ma due volte la sessione si è riavviata con la conferma aperta (361 controllata: non applicata). La 350 NON si applica.
- Macchina, PR #944: le due regole del 12/11 sera, più le correzioni delle due radiografie (`cb4136c`, schede AR-1171 e AR-1172). Radiografia in corsa: 10 file su 10.
- In sospeso da Nicola: card #236, il lucchetto dei collaudatori, che oggi non si può mettere; fino alla scelta vale il controllo dopo con `list_events`. Poi la strada per le prove comuni: 1 stretta, 2 allentata (consigliata), 3 avviso. Con la regola di adesso, 9 rami su 11 dell'onda 1 hanno la guardia rossa (57 prove comuni) e `applica --git` su questa campagna è rossa: va deciso prima di `applica --scrivi`.
- `piano.json` ha `verifica_testa_dall_onda: 2`: i referti dell'onda 1 sono nati prima della regola.
- Regole da applicare all'onda 2, tutte nella skill: «Ultra Code Extra» (effort xhigh, controllo con get_session); `permission_mode: "auto"`; primo messaggio con LEGGIMI e scheda interi; due costi in ogni messaggio, anche in percentuale (1% ≈ 30 $, stima); `cervello/sessioni-insieme.md` (bacheca, urgente, passaggio oltre 400 mila); mai più di 12 subagenti senza chiedere, e uno scettico solo, sui gravi.
- Conto: questa sessione ha speso 164,49 $ (circa il 5,4% della settimana), di cui 106 $ dopo l'onda 1, quasi tutti per le due radiografie (87 agenti). La quota settimanale è in «allowed_warning».
- Su questa sessione restano: le notifiche delle PR #288 e #944 e un controllo programmato alle 04:11 (`trig_01JLh5Lu5UPy136nDfPcDxsm`). Se la sessione nuova li prende, quel controllo si cancella.
