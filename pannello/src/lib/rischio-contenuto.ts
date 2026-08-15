// AR-232 — chi decide il rischio e chi lo esegue sono lo stesso soggetto.
//
// Il colore di una card lo scrive il senior che la accoda; l'autopilota lo legge e agisce. Il lotto 25
// ha tolto metà del problema (il **canale** adesso alza il livello, ed è un fatto che il testo non
// decide), ma il fix di AR-232 chiedeva quattro condizioni, non due:
//
//   (a) è 🟢                                    ← lotto 25
//   (b) il canale è auto-eseguibile             ← lotto 25
//   (c) il destinatario è in allowlist          ← già da AR-139, in mani.ts
//   (d) **il TESTO non contiene indicatori di rischio**  ← questo file
//
// La (d) è l'unica delle quattro che guarda il CONTENUTO, cioè l'unica indipendente da chi ha scritto
// la card. È il secondo parere: un'azione che nomina un importo, un IBAN, un numero di telefono o che
// dice «pubblica», «paga», «annulla l'ordine» non è una cosa che una macchina fa da sola, qualunque
// colore le abbia messo accanto chi l'ha scritta.
//
// ── Perché gli indicatori sono questi ────────────────────────────────────────
// Sono quelli nominati nel fix, più i loro modi di scriversi in italiano. Non è un modello: è una
// lista corta e leggibile, che sbaglia in una direzione sola — **degrada a giallo**, cioè chiede una
// firma. Un falso positivo costa un clic a Nicola; un falso negativo manda una mail vera a un cliente
// vero. Il costo non è simmetrico, e la lista è tarata su quello.
//
// Nessuna dipendenza: si esegue sul testo passato, così le prove la misurano su casi finti e il
// cervello può usare lo STESSO file invece di una copia che diverge (è la richiesta esplicita del
// fix: «il posto giusto per la funzione di rischio è un modulo condiviso, così le due metà usano lo
// stesso metro»).

export type Indicatore =
  | "importo"
  | "iban"
  | "telefono"
  | "pubblicazione"
  | "pagamento"
  | "annullamento"
  | "dato_personale"
  | "irreversibile";

type Regola = { nome: Indicatore; re: RegExp; perche: string };

const REGOLE: Regola[] = [
  {
    nome: "importo",
    // 12€ · € 12,50 · 12 euro · EUR 12 — non "€" da solo, che compare nei titoli di sezione.
    re: /(?:€|\beur\b)\s?\d|\d\s?(?:€|\beur\b|euro\b)/i,
    perche: "nomina una cifra di denaro",
  },
  {
    nome: "iban",
    re: /\b[A-Z]{2}\d{2}[\sA-Z0-9]{11,30}\b/,
    perche: "contiene quello che sembra un IBAN",
  },
  {
    nome: "telefono",
    // numeri italiani con prefisso, fissi e mobili, con o senza spazi
    re: /(?:\+39[\s.-]?)?\b(?:0\d{1,3}[\s.-]?\d{5,8}|3\d{2}[\s.-]?\d{3}[\s.-]?\d{3,4})\b/,
    perche: "contiene un numero di telefono",
  },
  {
    nome: "pubblicazione",
    re: /\bpubblic(?:a|are|hiamo|azione)\b|\bposta(?:re|iamo)\b|\bmanda(?:re|iamo)? (?:il )?post\b/i,
    perche: "chiede di pubblicare qualcosa",
  },
  {
    nome: "pagamento",
    re: /\bpag(?:a|are|hiamo|amento)\b|\bbonific\w+|\brimbors\w+|\bpayout\b|\baddebit\w+/i,
    perche: "parla di pagare o rimborsare",
  },
  {
    nome: "annullamento",
    re: /\bannull(?:a|are|iamo)\b|\bcancell(?:a|are|iamo)\b|\bstorn\w+|\bdisdi\w+/i,
    perche: "chiede di annullare o cancellare qualcosa",
  },
  {
    nome: "dato_personale",
    re: /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i,
    perche: "contiene l'indirizzo email di una persona",
  },
  {
    // AR-599 — l'indicatore che mancava, ed era quello dell'atto più grave.
    // Il filtro sul contenuto guardava soldi, persone e pubblicazioni: niente per «unisci la
    // richiesta», «manda in produzione», «scrivi sul catalogo». Cioè taceva proprio sulle azioni
    // che non si disfano — quelle per cui il mansionario chiede sempre la firma di Nicola.
    nome: "irreversibile",
    re: /\bmerg\w*|\brichiest\w+ di unione\b|\bpull\s*request\b|\bPR\s*#?\d+\b|\bdeploy\w*|\bin produzione\b|\brilasci\w+\b|\bunisci\b/i,
    perche: "chiede di unire una richiesta o di mandare qualcosa in produzione, e non si torna indietro",
  },
];

/** Gli indicatori trovati nel testo, con il perché in parole. */
export function indicatoriDiRischio(testo: string): { nome: Indicatore; perche: string }[] {
  const t = String(testo || "");
  return REGOLE.filter((r) => r.re.test(t)).map((r) => ({ nome: r.nome, perche: r.perche }));
}

/**
 * Il verdetto sul contenuto. `rischiosa: true` ⇒ l'autopilota non la esegue da solo: degrada a coda
 * con la nota, e la degradazione va registrata (il fix chiede di misurare quanto spesso il colore
 * auto-dichiarato sbaglia).
 *
 * Fail-closed: un testo che non si riesce a leggere è rischioso. «Non ho capito cosa manda» non è
 * «non manda niente».
 */
export function rischioDalContenuto(testo: unknown): { rischiosa: boolean; indicatori: string[]; motivo: string } {
  if (typeof testo !== "string") {
    return { rischiosa: true, indicatori: [], motivo: "testo dell'azione non leggibile → serve la firma (fail-closed)" };
  }
  const trovati = indicatoriDiRischio(testo);
  if (!trovati.length) return { rischiosa: false, indicatori: [], motivo: "nessun indicatore di rischio nel testo" };
  return {
    rischiosa: true,
    indicatori: trovati.map((t) => t.nome),
    motivo: `serve la firma: il testo ${trovati.map((t) => t.perche).join(", ")}`,
  };
}
