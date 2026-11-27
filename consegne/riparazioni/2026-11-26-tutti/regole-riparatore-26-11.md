---
tipo: istruzioni
per: i riparatori della campagna del 26/11
data: 2026-11-26 13:50
---

## In parole semplici
Questo foglio dice alle sessioni che riparano cosa cambia oggi rispetto alle regole di sempre.
Il punto è uno: Nicola non vuole richieste di approvazione mentre si lavora.
Per esempio: se una voce chiede una sua scelta, la sessione scrive la domanda e passa alla voce dopo, invece di fermarsi ad aspettarlo.

## Cosa cambia per te
Niente: lo leggono le sessioni.

## Cosa devi fare
Niente.

## Cosa non ho verificato
Che ogni sessione lo rispetti: lo controllano il collaudo e il programma.

---

## Dettagli tecnici

# Le regole di questa campagna (26/11) — valgono SOPRA il foglio qui sotto dove lo contraddicono

Nicola, 26/11: lavorare tutti i difetti che non chiedono lui, **senza chiedergli nessuna approvazione**. Quindi:

1. **Niente ultracode, anche con gravi.** Oggi non si accende (il comando arriva come testo): lavori allo sforzo che hai e NON aspetti ultracode. Per compensare, su ogni voce grave o di soldi/dati/permessi il subagente che prova a smentire è sul modello grande, uno per voce.
2. **Il piano non aspetta.** Scrivi il piano (corto: lotti, voci, prova attesa), mandalo alla regista con `send_message` e **comincia subito il primo lotto** nello stesso turno. La regista ti scrive solo se c'è da correggere.
3. **Mai chiedere firme o clic.** Se una voce chiede una scelta di Nicola, una firma su una prova comune, un dato del database vero o un'impostazione esterna: esito `scelta_di_nicola` o `non_codice` con la domanda in una riga, e passi alla voce dopo. Non tocchi prove comuni (che importano file di altre sessioni). Mai codici di altre voci nei messaggi di commit.
4. **Limite di spesa della tua sessione:** 25 $ se la scheda ha un grave, 20 $ se ha solo minori. A fine di ogni lotto leggi `usage.cost_usd` di `get_session` senza id (c'è solo a turno chiuso: se manca, conta i lotti). All'80% finisci il lotto in corso e consegni quello che hai.
5. **Subagenti:** al massimo 6 (8 con un grave), un lotto alla volta, mai Workflow. Lotti di soli minori senza soldi/dati/permessi col modello piccolo (`model: "sonnet"`).
6. **Migrazioni:** solo se indispensabili, nella tua fascia, una per voce, provate con `--sql`. Dichiarale nella `nota` della voce.
7. **Postgres locale** per le prove SQL, se serve: `pg_ctlcluster 16 main start; su postgres -c "createuser -s root"` e poi `PGHOST=/var/run/postgresql PGUSER=root`. Le migrazioni stanno in `migrations/`.
8. **SHA sempre interi** (40 caratteri) nel referto e nei messaggi.
9. **Mai il database vero, mai Stripe vero, mai messa online.** Scrivilo nel mandato di ogni subagente.
10. **Finito vuol dire:** `npm run verify` verde aspettato sulla testa, `valida-referto` verde, referto con `"finita": true` spinto, e una riga alla regista con `send_message` (riparati, parziali, file altrui, già riparati, scelte, non fatti, spesa).
11. **Il deposito ad-mycity** ti serve solo per i comandi del programma: `git clone --filter=blob:none https://github.com/NicolaeRotaru/ad-mycity ../ad-mycity && git -C ../ad-mycity checkout SHA_REGISTA`. Se non riesci, dillo alla regista e vai avanti: i controlli li lancia lei.
