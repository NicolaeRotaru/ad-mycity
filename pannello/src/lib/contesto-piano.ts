/**
 * Il pezzo di piano che viaggia come contesto quando Nicola fa una domanda dalla casella Parla.
 *
 * IL DIFETTO CHE QUESTA FUNZIONE ESISTE PER EVITARE, e che si è già ripresentato due volte. La
 * casella manda i primi 800 caratteri del piano. In cima al file, però, ci sono blocchi di servizio
 * che crescono: prima la riga della data (`AD-DATA`), poi l'avviso delle smentite (`AD-SMENTITE`).
 * Misurato il 10/8, con l'avviso appena aggiunto: sul Piano Vendite quegli 800 caratteri erano ~470
 * di avviso e **zero** di piano. Nicola faceva una domanda sul suo piano e chi rispondeva non ne
 * aveva letto una riga.
 *
 * I commenti HTML sparivano già. Il guaio dell'avviso è che la sua parte visibile NON è un commento:
 * sono righe `>` di markdown, e passavano intere.
 *
 * Ma buttarlo via del tutto sarebbe l'errore opposto: la cosa più importante da sapere, prima di
 * rispondere su un piano, è che quel piano contiene frasi false — altrimenti chi risponde ripete il
 * bando chiuso in buona fede. Quindi l'avviso non si toglie: si **riassume in una riga**, e il resto
 * dello spazio torna al piano.
 */

const BLOCCO_AVVISO = /<!--\s*⛔ AD-SMENTITE:START[\s\S]*?AD-SMENTITE:END\s*-->/;
const QUANTE = /Attenzione: (?:(\d+) frasi|(una) frase)/;

/** Quante frasi il registro smentisce, secondo l'avviso in cima. Nessun avviso = 0. */
export function smentiteDichiarate(testo: string): number {
  const blocco = String(testo ?? "").match(BLOCCO_AVVISO);
  if (!blocco) return 0;
  const m = blocco[0].match(QUANTE);
  if (!m) return 0;
  return m[2] ? 1 : Number(m[1]);
}

/**
 * Il piano pronto da mandare come contesto: avviso riassunto in una riga, righe di servizio via,
 * e il resto è piano.
 *
 * L'ordine conta. L'avviso va riassunto PRIMA di togliere i commenti HTML, perché i suoi marcatori
 * di inizio e fine sono commenti: toglierli per primi lascerebbe orfane le righe visibili in mezzo,
 * che a quel punto non si riconoscono più.
 */
export function contestoPiano(testo: string, limite = 800): string {
  const t = String(testo ?? "");
  const n = smentiteDichiarate(t);
  const riassunto = n
    ? `> ⛔ Attenzione: ${n === 1 ? "una frase" : `${n} frasi`} di questo piano ${n === 1 ? "non è più vera" : "non sono più vere"} — i fatti le smentiscono. L'elenco è nell'avviso in cima al piano.\n`
    : "";
  return (riassunto + t.replace(BLOCCO_AVVISO, ""))
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, limite);
}
