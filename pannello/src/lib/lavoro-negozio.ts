/**
 * A quale negozio appartiene un lavoro della coda — e perché non può non appartenere a nessuno.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IL DIFETTO CHE QUESTO FILE CHIUDE (AR-801)
 * ─────────────────────────────────────────────────────────────────────────────
 * `ARCHITETTURA-TRE-MACCHINE.md`, meccanismo ①: «`negozio_id` su ogni riga, ovunque. Nessuna
 * tabella senza». Il lato codice della BOTTEGA quel muro ce l'ha già — `cervello/bottega/lavoro.mjs`
 * non sa costruire un lavoro senza negozio. Ma la coda vera, la tabella `lavori` che il worker
 * legge, il campo non ce l'aveva: letta dal vivo il 23/8, 3.255 righe, nessun negozio.
 *
 * Finché è così il muro tiene solo per chi passa dal modulo nuovo. **Il primo che scrive in coda
 * con una query diretta lo aggira senza accorgersene** — e non se ne accorge nemmeno chi legge,
 * perché la riga arriva normale.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DUE POSTI DOVE IL NEGOZIO SPARIVA IN SILENZIO, e li ho trovati leggendo, non cercandoli
 * ─────────────────────────────────────────────────────────────────────────────
 * ① `bodyJsonLavoro` non passa il payload al database: lo **ricostruisce** da zero, campo per
 *    campo. Un campo che non è nella sua lista non arriva mai al database, e chi l'ha messo nel
 *    payload non lo sa. Aggiungere `negozio_id` a `creaLavoroEsito` e basta sarebbe stato un fix
 *    che non fixa: il campo sarebbe morto una riga dopo.
 * ② `postLavoroUnaVolta`, se l'inserimento fallisce, **riprova togliendo `gruppo_id`** — perché
 *    quella colonna potrebbe non esistere ancora sul database. È una cura giusta per il gruppo, che
 *    serve a raggruppare la chat: perderlo fa un danno estetico.
 *
 *    Sul negozio la stessa cura sarebbe **il difetto stesso, automatizzato**: «il database rifiuta
 *    la riga col negozio? e allora scrivila senza». Il lavoro di una bottega finirebbe nel mucchio
 *    comune, in silenzio, e la riga risulterebbe scritta bene. Qui quel ripiego vale SOLO per il
 *    centro, che nel mucchio comune ci sta di casa.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PERCHÉ IL CENTRO HA UN NOME E NON UN CAMPO VUOTO
 * ─────────────────────────────────────────────────────────────────────────────
 * I lavori che la macchina fa per sé (giri, report, chat con Nicola) non sono di nessun negozio. La
 * tentazione è lasciarli col campo vuoto. Ma un campo che può essere vuoto è un campo che si può
 * *dimenticare*, e il muro nel database (AR-802) dovrebbe poi decidere cosa fare del vuoto: «vuoto
 * vede tutto» e «vuoto non vede niente» sono tutt'e due trappole.
 *
 * Col centro che ha un nome suo, `negozio_id` può diventare obbligatorio: allora una scrittura
 * diretta che si dimentica il negozio **non riesce**, invece di riuscire male. È lo stesso
 * principio della porta stretta di `cervello/bottega/lavoro.mjs`: rendere indicibile la cosa
 * sbagliata, invece di scrivere una regola che qualcuno deve ricordarsi.
 *
 * Prova: pannello/src/lib/lavoro-negozio.test.mts
 */

/** La corsia dei lavori che la macchina fa per sé: non sono di nessun negozio, ma hanno un nome. */
export const CENTRO = "centro";

/**
 * Il negozio da scrivere in coda.
 *
 * ⚠️ Le tre risposte non sono due. `undefined`/`null` vuol dire «questo lavoro è del centro» ed è
 * legittimo. Una stringa piena è il negozio. Una stringa **vuota o di soli spazi** invece è un
 * errore di chi chiama: qualcuno *credeva* di avere un negozio e non ce l'aveva. Farla scivolare
 * nel centro la trasformerebbe in un lavoro del mucchio comune senza che nessuno se ne accorga —
 * cioè di nuovo il difetto, un piano più in basso.
 */
export function negozioPerLaCoda(negozioId?: string | null): string {
  if (negozioId === undefined || negozioId === null) return CENTRO;
  const pulito = String(negozioId).trim();
  if (!pulito) throw new Error("negozio-dichiarato-e-vuoto");
  return pulito;
}

/** Questo lavoro è della macchina stessa, non di una bottega? */
export function eDelCentro(negozioId: string): boolean {
  return negozioId === CENTRO;
}

/**
 * Si può riprovare l'inserimento TOGLIENDO il negozio, se il database quella colonna non ce l'ha?
 *
 * Solo per il centro. Per una bottega la risposta è no e deve restare no: un lavoro di negozio
 * scritto senza negozio è esattamente il buco che stiamo chiudendo, e un ripiego automatico lo
 * riaprirebbe a ogni inserimento, per sempre, senza lasciare traccia.
 */
export function siPuoRipiegareSenzaNegozio(negozioId: string): boolean {
  return eDelCentro(negozioId);
}
