// 🚧 IL MURO PRIMA DELLA PORTA — AR-839.
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHE' ESISTE, E PERCHE' ESISTE ADESSO E NON DOPO
// ─────────────────────────────────────────────────────────────────────────────
// I due meccanismi che tengono separati i negozi dal lato del TESTO — il contesto isolato e le
// chiavi mai dentro il discorso — stanno in `lavoro.mjs` dal 23/8, provati. Non li chiama nessuno,
// e la ragione NON e' che qualcuno se li salta: e' che il consumatore non esiste ancora. I tipi di
// lavoro che il worker sa fare sono tutti del centro, e un lavoro del centro non ha nessun negozio
// da tenere separato.
//
// Il difetto e' quello che succede DOPO: il giorno che qualcuno costruisce il percorso di un lavoro
// di bottega, niente lo obbliga a passare da `testoPerAI`. La porta stretta di `nuovoLavoro` — che
// senza negozio lancia — non ha un fratello sul lato del testo.
//
// `ARCHITETTURA-TRE-MACCHINE.md` e' esplicito sull'ordine: «il muro non e' una rifinitura da mettere
// dopo il pilota. E' la prima cosa, o non si parte», perche' aggiungerlo su dati gia' mescolati e'
// «il lavoro piu' caro e pericoloso che esista». Quindi il muro si e' costruito PRIMA della porta
// che doveva sorvegliare, e finche' la porta non c'e' stata non ha fatto passare niente.
//
// Il 27/8 la porta e' arrivata: il tipo di lavoro `bottega`, dietro `bottega/testo-lavoro.mjs`, che
// e' l'unico posto da cui esce il testo di un lavoro di negozio. Il muro adesso ha qualcosa da
// sorvegliare, e il suo mestiere non e' cambiato: chi non e' nell'elenco non passa.
//
// ─────────────────────────────────────────────────────────────────────────────
// FAIL-CLOSED: un lavoro di un negozio che il worker non sa trattare NON si esegue
// ─────────────────────────────────────────────────────────────────────────────
// Il verso di questo freno e' scelto, non casuale. Un lavoro di bottega eseguito dal percorso del
// centro girerebbe benissimo — e sarebbe esattamente il modo in cui i dati di due negozi si
// incontrano la prima volta, senza che nessuno se ne accorga, perche' il risultato sembra normale.
// Meglio un lavoro fermo con scritto perche'.
//
// 🟢 Modulo puro: nessun disco, nessuna rete, nessun orologio.
//
// Prova: node cervello/test/il-muro-arriva-prima-della-porta.test.mjs

/** Il negozio della macchina stessa. Seconda casa dichiarata: vedi AR-837. */
export const CENTRO = "centro";

/**
 * I tipi di lavoro che sanno trattare un negozio, cioe' quelli il cui testo per l'AI esce da
 * `testoPerAI` e non dal prompt generico del centro.
 *
 * Aggiungere un nome qui e' l'atto che APRE il muro, e non e' gratis: la prova di questo file
 * prende ogni nome dell'elenco, gli manda le righe di DUE negozi e guarda il testo che esce
 * davvero. Se di quel tipo non esiste il percorso isolato, il caso diventa rosso — quindi il tipo
 * e il suo percorso nascono nello stesso lavoro, o non nascono.
 *
 * `bottega` (27/8) e' il primo, e la sua porta e' `bottega/testo-lavoro.mjs`.
 */
export const TIPI_DI_BOTTEGA = ["bottega"];

/**
 * Questo lavoro si puo' eseguire?
 *
 * Torna sempre il perche', anche quando la risposta e' si': un lavoro fermo senza motivo e' la
 * telefonata del lunedi' mattina.
 */
export function puoEseguire({ negozio = "", tipo = "" } = {}) {
  const n = String(negozio ?? "").trim();
  const t = String(tipo ?? "").trim();

  // Un lavoro che non dice di chi e' NON e' «di tutti»: e' «non lo so», e non si esegue. La coda ha
  // il campo obbligatorio dal 26/8, quindi questo caso vuol dire che qualcosa lo sta aggirando.
  if (!n) {
    return { si: false, motivo: "il lavoro non dice a quale negozio appartiene: non lo eseguo" };
  }
  if (n === CENTRO) return { si: true, motivo: "" };
  if (TIPI_DI_BOTTEGA.includes(t)) return { si: true, motivo: "" };
  return {
    si: false,
    motivo:
      `lavoro del negozio «${n}» di tipo «${t || "senza tipo"}»: il percorso di bottega non e' ancora ` +
      "costruito, e il percorso del centro non sa tenere separati i dati fra negozi. " +
      "Non lo eseguo (AR-839).",
  };
}
