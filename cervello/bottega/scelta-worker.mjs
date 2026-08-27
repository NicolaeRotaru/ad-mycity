// 🔀 IL PONTE FRA LA CODA VERA E IL TURNO — AR-804.
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// `corsie.mjs` sa fare il turno fra i negozi: 18 casi, 7 mutazioni rosse, scritto il 23/8. E fino a
// oggi non lo chiamava nessuno. Il worker vero prendeva il lavoro con `order=created_at.asc&limit=1`
// — l'ordine d'arrivo — perché la tabella `lavori` non aveva il campo del negozio (AR-801).
//
// Quel campo adesso c'è: `negozio_id` è NOT NULL sulla coda dal 26/8, 3.281 righe, nessuna vuota.
// Il blocco che AR-804 dichiarava è caduto, e questo file è il pezzo che mancava per collegare i due:
// da una parte le righe grezze che il worker legge in HTTP, dall'altra `prossimoLavoro`, che vuole
// corsie dichiarate e non sa niente di database.
//
// La malattia da cui nasce: **un cancello costruito bene e montato su una porta che nessuno usa.**
// Un turno che esiste come funzione e non come comportamento non è un turno.
//
// ─────────────────────────────────────────────────────────────────────────────
// IL CENTRO NON È UNA BOTTEGA
// ─────────────────────────────────────────────────────────────────────────────
// `statoSpesa` è severo apposta: un negozio senza tetto dichiarato NON lavora, perché «un tetto
// assente non è un tetto infinito». È la cosa giusta per una bottega che paga il canone.
//
// Ma oggi tutte e 3.281 le righe della coda sono del `centro`, cioè della macchina stessa: giro,
// ritmo, chat, metabolizzazione. Il centro non è un cliente e il suo freno di spesa esiste già e sta
// altrove (`costo-ai.mjs`). Applicargli il tetto delle botteghe fermerebbe la macchina intera al
// primo giro — la coda avrebbe lavori e nessuna corsia potrebbe prenderli.
//
// L'esenzione è UNA sola e stretta: il centro passa quando la corsia è ferma **solo** perché il
// tetto non è dichiarato. Se il centro un tetto ce l'ha e l'ha finito, si ferma come tutti; se ha la
// quota piena o la corsia guasta, si ferma come tutti. Nessun freno viene riscritto qui: si riusa
// `statoCorsia` intero e si guarda il verdetto che torna.
//
// ─────────────────────────────────────────────────────────────────────────────
// COSA QUESTO FILE NON FA, E VA DETTO
// ─────────────────────────────────────────────────────────────────────────────
// · La spesa per negozio **non è ancora contata da nessuno**: `speso` arriva solo se qualcuno lo
//   scrive nelle impostazioni. Finché non c'è, un tetto dichiarato protegge dal superamento solo
//   quando il numero gliel'ha passato qualcun altro. Il tetto è collegato; il contatore no.
// · `CENTRO` qui è la seconda casa della stessa costante: la prima è
//   `pannello/src/lib/lavoro-negozio.ts`. Il Pannello è TypeScript e non importa dal cervello, così
//   le due non si possono ancora unire. Due copie di una regola non sono una regola: sta nel
//   cantiere, non nascosto qui.
//
// 🟢 Il modulo è puro. L'unica cosa che tocca il mondo è `main()`, e legge da stdin.
//
// Prova: node --test cervello/test/il-negozio-lento-non-ferma-gli-altri.test.mjs

import { daDopoIlUltimo, statoCorsia } from "./corsie.mjs";
import { negozioDellaRiga } from "./lavoro.mjs";

/** Il negozio della macchina stessa. Seconda casa: vedi l'intestazione. */
export const CENTRO = "centro";

export function eDelCentro(negozioId) {
  return String(negozioId ?? "").trim() === CENTRO;
}

/** Quanti lavori insieme, per un negozio, se nessuno lo dichiara. Uno: il turno vale sul tempo. */
export const QUOTA_PREDEFINITA = 1;

/**
 * La corsia di un negozio, col centro esente dal solo tetto mancante.
 *
 * Non riscrive nessun freno: chiama `statoCorsia` e legge il verdetto. `frazione === null` è il
 * segno esatto di «tetto non dichiarato» — un tetto dichiarato e finito torna un numero, e lì il
 * centro si ferma come chiunque altro.
 */
export function statoCorsiaBottega(negozio = {}, { inCorso = 0 } = {}) {
  const base = statoCorsia(negozio, { inCorso });
  if (base.puoLavorare) return base;
  if (!eDelCentro(base.negozioId)) return base;
  const fermoSoloPerTettoMancante = Boolean(base.spesa) && base.spesa.frazione === null && !base.guasto;
  if (!fermoSoloPerTettoMancante) return base;
  return { ...base, puoLavorare: true, motivo: "", esenteTetto: true };
}

/**
 * Le impostazioni per negozio, lette dalle righe della tabella `impostazioni`.
 *
 * Chiave `bottega:negozio:<id>`, valore un JSON con quota/tetto/speso/interruttore.
 *
 * Un valore illeggibile NON diventa «nessun limite»: diventa una corsia senza tetto, cioè ferma,
 * col perché scritto. Il verso sbagliato di questo errore è una bolletta senza fondo.
 */
export const PREFISSO_IMPOSTAZIONE = "bottega:negozio:";

export function impostazioniDaRighe(righe = []) {
  const out = {};
  for (const r of Array.isArray(righe) ? righe : []) {
    const chiave = String(r?.chiave ?? "");
    if (!chiave.startsWith(PREFISSO_IMPOSTAZIONE)) continue;
    const id = chiave.slice(PREFISSO_IMPOSTAZIONE.length).trim();
    if (!id) continue;
    try {
      const v = JSON.parse(String(r?.valore ?? ""));
      out[id] = v && typeof v === "object" ? v : { illeggibile: true };
    } catch {
      out[id] = { illeggibile: true };
    }
  }
  return out;
}

/**
 * Le corsie, dedotte dalla coda: c'è una corsia per ogni negozio che ha lavori in attesa.
 *
 * L'ordine è quello di **prima apparizione** nella coda, che arriva ordinata per data. Così il giro
 * parte da chi ha accodato prima, e non dall'alfabeto: un ordine di lista travestito da turno
 * darebbe sempre il primo posto allo stesso negozio.
 */
export function corsieDallaCoda(coda = [], impostazioni = {}, speso = {}) {
  const visti = [];
  for (const riga of Array.isArray(coda) ? coda : []) {
    const id = negozioDellaRiga(riga);
    if (id && !visti.includes(id)) visti.push(id);
  }
  return corsieDaIdentita(visti, impostazioni, speso);
}

/** La forma di una corsia, da un id e dalle impostazioni. Una casa sola: la usano tutte e due le porte. */
export function corsieDaIdentita(ids = [], impostazioni = {}, speso = {}) {
  return ids.map((negozioId) => {
    const conf = impostazioni?.[negozioId] ?? {};
    // AR-838 — la spesa CONTATA batte quella dichiarata a mano nelle impostazioni. Un numero
    // scritto a mano e' una dichiarazione; questo e' una misura, e fra le due vince la misura.
    const contato = Number(speso?.[negozioId]);
    const quota = Number.isFinite(conf.quota) && conf.quota > 0 ? conf.quota : QUOTA_PREDEFINITA;
    return {
      negozioId,
      quota,
      tetto: Number.isFinite(conf.tetto) ? conf.tetto : null,
      speso: Number.isFinite(contato) ? contato : Number.isFinite(conf.speso) ? conf.speso : 0,
      interruttore: conf.interruttore === "spento" ? "spento" : "acceso",
      falliti: Number.isFinite(conf.falliti) ? conf.falliti : 0,
      scaduti: Number.isFinite(conf.scaduti) ? conf.scaduti : 0,
    };
  });
}

/** Quanti lavori ha in corso ogni negozio, contati dalle righe `in_corso`. */
export function inCorsoPerNegozio(righe = []) {
  const out = {};
  for (const r of Array.isArray(righe) ? righe : []) {
    const id = negozioDellaRiga(r);
    if (!id) continue;
    out[id] = (out[id] || 0) + 1;
  }
  return out;
}

/**
 * LA SCELTA DEL NEGOZIO — a chi tocca, sapendo solo QUALI negozi hanno lavori in attesa.
 *
 * Esiste perche' la prima versione leggeva una FINESTRA della coda (le 200 righe piu' vecchie) e da
 * quella dedeuceva le corsie. Misurato: un negozio con 200 lavori in attesa riempie la finestra
 * intera, e il lavoro appena accodato da un altro negozio diventa INVISIBILE — il worker risponde
 * «tutte le corsie sono ferme» con la coda piena. Cioe' la fame che AR-804 esiste per togliere,
 * rimessa dentro dal tetto della finestra, e proprio alla scala in cui serve.
 *
 * Adesso il turno si decide sui soli id dei negozi (righe corte, tutte, nessun tetto), e il lavoro
 * lo si chiede DOPO, al negozio scelto: due richieste, nessuna finestra, nessuna fame.
 */
export function scegliNegozio({ negoziInAttesa = [], impostazioni = {}, inCorso = {}, ultimo = null, speso = {} } = {}) {
  const visti = [];
  for (const g of Array.isArray(negoziInAttesa) ? negoziInAttesa : []) {
    const id = typeof g === "string" ? g.trim() : negozioDellaRiga(g);
    if (id && !visti.includes(id)) visti.push(id);
  }
  const negozi = corsieDaIdentita(visti, impostazioni, speso);
  const corsie = negozi.map((n) => statoCorsiaBottega(n, { inCorso: Number(inCorso[n.negozioId]) || 0 }));
  const fermi = corsie.filter((c) => !c.puoLavorare).map((c) => ({ negozioId: c.negozioId, motivo: c.motivo }));
  const ordine = daDopoIlUltimo(corsie.map((c) => c.negozioId).filter(Boolean), ultimo);
  for (const id of ordine) {
    if (corsie.find((c) => c.negozioId === id)?.puoLavorare) {
      return { negozioId: id, fermi, motivo: "" };
    }
  }
  return { negozioId: "", fermi, motivo: motivoDelNulla(visti, corsie, fermi) };
}

/**
 * LA SCELTA: quale lavoro prende il worker adesso.
 *
 * Torna sempre il perché, anche quando non prende niente — «la coda ha lavori e non parte nessuno»
 * senza motivo è la telefonata del lunedì mattina.
 */
export function scegli({ coda = [], impostazioni = {}, inCorso = {}, ultimo = null, speso = {} } = {}) {
  const negozi = corsieDallaCoda(coda, impostazioni, speso);
  const corsie = negozi.map((n) => statoCorsiaBottega(n, { inCorso: Number(inCorso[n.negozioId]) || 0 }));
  // Le corsie ferme non entrano nel turno: `prossimoLavoro` rifarebbe il conto del tetto senza
  // sapere del centro. Qui gli si passano solo quelle che possono lavorare, e i motivi degli altri
  // se li porta dietro la risposta.
  const fermi = corsie
    .filter((c) => !c.puoLavorare)
    .map((c) => ({ negozioId: c.negozioId, motivo: c.motivo }));

  // Qui NON si chiama `prossimoLavoro`, e la ragione e' stata misurata invece che immaginata: quella
  // funzione ricalcola `statoCorsia` sulle corsie che riceve, quindi buttava via l'esenzione del
  // centro e tornava «le corsie libere non hanno lavori in coda» — con la coda piena. Cioe' la
  // macchina ferma, oggi, su tutte e 3.281 le righe. Passargli solo le corsie ammesse non basta:
  // le riesamina lo stesso.
  //
  // Si riusa allora il pezzo che il turno lo FA davvero — `daDopoIlUltimo`, la stessa primitiva che
  // `prossimoLavoro` usa dentro — e i freni restano quelli di `statoCorsia`, gia' interrogati sopra.
  // Quello che resta qui e' una ricerca, non un freno: il primo lavoro di quel negozio.
  const ordine = daDopoIlUltimo(corsie.map((c) => c.negozioId).filter(Boolean), ultimo);
  for (const id of ordine) {
    if (!corsie.find((c) => c.negozioId === id)?.puoLavorare) continue;
    // Dentro la corsia di un negozio vale l'ordine d'arrivo: il turno e' FRA i negozi, non dentro.
    const riga = coda.find((l) => negozioDellaRiga(l) === id);
    if (riga) return { id: String(riga.id ?? ""), negozioId: id, riga, fermi, motivo: "" };
  }
  return { id: "", negozioId: "", riga: null, fermi, motivo: motivoDelNulla(coda, corsie, fermi) };
}

function motivoDelNulla(coda, corsie, fermi) {
  if (!coda.length) return "la coda è vuota";
  if (!corsie.length) return "la coda ha lavori e nessuno di loro dice a che negozio appartiene";
  if (fermi.length === corsie.length) {
    return `tutte le corsie sono ferme: ${fermi.map((f) => `${f.negozioId} (${f.motivo})`).join(" · ")}`;
  }
  return "le corsie libere non hanno lavori in coda";
}

/**
 * La bocca del worker: JSON da stdin, JSON su stdout, una riga.
 *
 * Da stdin e non dagli argomenti perché una coda intera non ci sta in una riga di comando — e
 * perché quello che si passa in `argv` lo legge chiunque abbia accesso a `/proc` (AR-826).
 */
export async function main() {
  let grezzo = "";
  for await (const pezzo of process.stdin) grezzo += pezzo;
  let dentro;
  try {
    dentro = JSON.parse(grezzo || "{}");
  } catch (e) {
    process.stdout.write(JSON.stringify({ id: "", motivo: `ingresso illeggibile: ${e.message}` }) + "\n");
    process.exitCode = 2;
    return;
  }
  const comune = {
    impostazioni: impostazioniDaRighe(dentro.impostazioni),
    inCorso: inCorsoPerNegozio(dentro.inCorso),
    ultimo: dentro.ultimo ?? null,
    speso: dentro.speso && typeof dentro.speso === "object" ? dentro.speso : {},
  };
  // Due modi di chiedere. `negoziInAttesa` e' quello che usa il worker: decide il TURNO senza
  // leggere nessuna riga di lavoro, quindi nessuna finestra e nessuna fame. `coda` resta per chi
  // ha gia' le righe in mano.
  const esito = Array.isArray(dentro.negoziInAttesa)
    ? scegliNegozio({ negoziInAttesa: dentro.negoziInAttesa, ...comune })
    : scegli({ coda: dentro.coda, ...comune });
  process.stdout.write(JSON.stringify(esito) + "\n");
}

if (process.argv[1] && process.argv[1].endsWith("scelta-worker.mjs")) main();
