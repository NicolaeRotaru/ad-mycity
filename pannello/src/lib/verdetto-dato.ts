// 🩶 IL TERZO STATO — «non l'ho potuto vedere» non è «va tutto bene».
//
// LA MALATTIA (corsia C del lotto): quando il Pannello NON riesce a misurare — rete caduta, 500 che
// arriva col suo bel corpo JSON, fonte non collegata, dato assente, organo senza sensore — la
// schermata mostra la RASSICURAZIONE al posto dell'ammissione. Nicola legge «Tutto ok» e decide
// sopra un dato che non è mai stato letto. È la bugia più cara che questa Cabina possa raccontare,
// perché è indistinguibile dalla buona notizia vera.
//
//   AR-401 — la Plancia fa sei letture. UNA sola (`/api/azioni-pronte`) sa dire «non lo so»; le
//     altre cinque sono `fetch().then(r => r.json()).then(...).catch(() => {})`: `r.ok` non viene
//     guardato e una 500 non fa nemmeno scattare il catch. Risultato su dato MAI letto:
//     «Nessun allarme. Tutto ok.», «Nessuna mossa in agenda.», «Nessuna cosa in sospeso.», badge a 0.
//   AR-406 — quattro degli otto organi della macchina hanno `ok: true` SCRITTO NEL CODICE: sono
//     verdi anche a macchina spenta. Gli altri quattro, quando la fetch fallisce, mostrano
//     «da collegare» — cioè un problema di configurazione — mentre la verità è «non lo so».
//   AR-237 — la targhetta dice «aggiornato · adesso» perché stampa `Date.now()` del browser: è
//     l'ora in cui HO CHIESTO, non l'età del dato. Su una fonte ferma da tre giorni sembra fresca.
//   AR-255 — lo stesso file (storico-salute.json) è letto da due strade con due tolleranze diverse:
//     una accetta l'elenco nudo, l'altra no e mostra il grafico vuoto — vuoto che si legge come
//     «non c'è storia», mentre la storia c'è.
//
// LA REGOLA, la stessa del cervello (`cervello/fonte-numero.mjs`): **al buio non dare la risposta
// comoda.** Qui la risposta comoda è «tutto a posto, non c'è niente da fare».
//
// PERCHÉ STA QUI E NON DENTRO I COMPONENTI. Dentro un componente React questa decisione non si può
// interrogare senza montare mezzo browser, e soprattutto si RIPETE: la schermata successiva nasce
// già malata perché ricopia il `.catch(() => {})` della sorella. Qui il verdetto si calcola UNA
// volta sul dato, al confine dell'atto (la lettura), e le schermate si limitano a disegnarlo.
//
// 🟢 Modulo puro: nessun import, nessun React, nessun window. Il solo pezzo che tocca la rete è
// `leggiDato`, e prende `fetchImpl` come parametro apposta per essere eseguibile in un test.
// Prove: cervello/test/plancia-cieca.test.mjs · organi-verdi-per-costante.test.mjs ·
//        freschezza-che-mente.test.mjs · storico-due-lettori.test.mjs

/** Quattro esiti possibili per un dato che si voleva mostrare. `cieco` e `stale` NON rassicurano. */
// Estensione esplicita: questo modulo lo esegue ANCHE il cervello con Node, che pretende il
// percorso completo (il tsconfig porta `allowImportingTsExtensions` per questo — AR-232).
import { vaultToIso } from "./format.ts";

export type StatoDato = "ok" | "vuoto" | "cieco" | "stale";

export type Semaforo = "verde" | "giallo" | "rosso" | "grigio";

export type Verdetto = {
  stato: StatoDato;
  /** Perché non l'ho potuto vedere. Vuoto solo quando il dato c'è davvero. */
  motivo: string;
  semaforo: Semaforo;
  /** Se falso, la schermata NON può stampare una frase tranquillizzante né un contatore a 0. */
  rassicurante: boolean;
  /** Vero solo se la lettura è avvenuta: `ok` o `vuoto`. */
  misurato: boolean;
};

/** Com'è finita la chiamata, prima ancora di guardare il contenuto. */
export type EsitoHttp =
  | { tipo: "mai" } // non ho ancora chiesto (primo render): non è un vuoto
  | { tipo: "rete"; messaggio: string } // fetch ha lanciato: DNS, offline, timeout
  | { tipo: "risposta"; ok: boolean; status: number };

/** L'esito di partenza di ogni schermata: non ho ancora guardato. Mai «vuoto». */
export const NON_LETTO: EsitoHttp = { tipo: "mai" };

export const VERDETTO_INIZIALE: Verdetto = {
  stato: "cieco",
  motivo: "non l'ho ancora letto",
  semaforo: "grigio",
  rassicurante: false,
  misurato: false,
};

function verdetto(stato: StatoDato, motivo: string, quandoOk: Semaforo): Verdetto {
  const misurato = stato === "ok" || stato === "vuoto";
  return {
    stato,
    motivo,
    semaforo: stato === "cieco" ? "grigio" : stato === "stale" ? "giallo" : quandoOk,
    rassicurante: misurato,
    misurato,
  };
}

/**
 * La bandiera di cecità che le route di questo Pannello dichiarano già da sole: `collegato: false`
 * più il motivo (`motivo_coda` per la coda, `messaggio` per le altre). Va passata a `verdettoLettura`
 * dai chiamanti la cui route usa `collegato` in quel senso — NON da chi legge `/api/cuore`, dove
 * `collegato` significa «memoria Supabase collegata» e il resto della risposta è valido lo stesso.
 */
export function collegatoFalso(corpo: any): string | null {
  if (!corpo || typeof corpo !== "object") return null;
  if (corpo.collegato !== false) return null;
  const m = String(corpo.motivo_coda || corpo.messaggio || "").trim();
  return m || "la fonte non è collegata";
}

/**
 * IL CUORE DELLA CORSIA: da un esito di rete + un corpo JSON al verdetto sul dato.
 *
 * L'ordine dei controlli è la cura, e ogni riga è un modo in cui il Pannello mentiva:
 *  1. non ho chiesto            → cieco (non «vuoto»: è il primo render)
 *  2. la fetch ha lanciato      → cieco
 *  3. `res.ok` falso            → cieco  ← una 500 arriva col corpo e NON fa scattare il catch
 *  4. corpo non oggetto/JSON    → cieco
 *  5. la route dichiara cecità  → cieco  ← `collegato: false` con il suo motivo
 *  6. il campo atteso non c'è   → cieco  ← contratto rotto: non è una lista vuota
 *  7. la lista è vuota          → vuoto  ← QUI, e solo qui, rassicurare è corretto
 */
export function verdettoLettura<T>(p: {
  esito: EsitoHttp;
  corpo?: unknown;
  estrai: (corpo: any) => T | null | undefined;
  eVuoto?: (dato: T) => boolean;
  cieco?: (corpo: any) => string | null;
  quandoOk?: Semaforo;
}): { verdetto: Verdetto; dato: T | null; corpo: any } {
  const quandoOk = p.quandoOk || "verde";
  const ko = (motivo: string) => ({ verdetto: verdetto("cieco", motivo, quandoOk), dato: null, corpo: p.corpo ?? null });

  const e = p.esito;
  if (!e || e.tipo === "mai") return ko("non l'ho ancora letto");
  if (e.tipo === "rete") return ko(`non riesco a raggiungere il server (${e.messaggio || "rete"})`);
  if (!e.ok) return ko(`il server ha risposto ${e.status}`);

  const corpo = p.corpo;
  if (corpo == null || typeof corpo !== "object") return ko("risposta non leggibile (JSON non valido)");

  const dichiarata = p.cieco ? p.cieco(corpo) : null;
  if (dichiarata) return ko(dichiarata);

  let dato: T | null | undefined;
  try {
    dato = p.estrai(corpo as any);
  } catch (err: any) {
    return ko(`risposta di forma imprevista (${err?.message || "estrazione fallita"})`);
  }
  if (dato == null) return ko("il server non ha mandato il dato che questa scheda mostra");

  const vuoto = p.eVuoto ? p.eVuoto(dato) : Array.isArray(dato) ? dato.length === 0 : false;
  return { verdetto: verdetto(vuoto ? "vuoto" : "ok", "", quandoOk), dato, corpo };
}

/**
 * La frase da mostrare quando a schermo non c'è niente. «Vuoto» e «cieco» devono produrre due
 * frasi DIVERSE: è la differenza fra «ho controllato, sei a posto» e «non ho potuto controllare».
 */
export function fraseVuoto(v: Verdetto, testi: { vuoto: string; cieco?: string }): string {
  if (v.stato === "cieco") return testi.cieco ? `${testi.cieco} ${v.motivo}.` : `⚠️ Non lo so: ${v.motivo}.`;
  if (v.stato === "stale") return `⚠️ Dati fermi: ${v.motivo}.`;
  return testi.vuoto;
}

/**
 * Il contatore di una scheda. Su una lettura cieca il numero NON è zero: è «?». Uno zero grande e
 * tondo su una lista mai letta è la stessa bugia della frase rassicurante, scritta in cifre.
 */
export function badgeConteggio(v: Verdetto, n: number): { testo: string; acceso: boolean; incerto: boolean } {
  if (!v.misurato) return { testo: "?", acceso: false, incerto: true };
  return { testo: String(n), acceso: n > 0, incerto: false };
}

/**
 * Il verdetto di un indicatore alimentato da più letture: basta che UNA sia riuscita perché quel
 * pezzo di Cabina sia misurato; se nessuna lo è, si tiene il primo motivo — che è la spiegazione
 * da mostrare. Serve a non ricostruire a mano un `Verdetto` dentro un componente.
 */
export function migliore(...verdetti: Verdetto[]): Verdetto {
  const lista = (verdetti || []).filter(Boolean);
  if (!lista.length) return VERDETTO_INIZIALE;
  return lista.find((v) => v.misurato) || lista[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-406 — un indicatore deve dichiarare DA QUALE DATO viene
// ─────────────────────────────────────────────────────────────────────────────

export type StatoOrgano = "acceso" | "spento" | "non-misurato";
export type Organo = {
  stato: StatoOrgano;
  icona: "✅" | "🟡" | "⚪";
  semaforo: Semaforo;
  nota: string;
  misurato: boolean;
  fonte: string;
};

/**
 * Il verdetto di un pallino del Pannello. Non si può più scrivere `ok: true`: per essere verde un
 * organo deve avere (a) una FONTE dichiarata, (b) una lettura riuscita, (c) una misura vera.
 * Se manca uno dei tre è ⚪ «non misurato» — grigio, che è la verità, e non verde, che è comodo.
 */
export function organo(p: {
  fonte: string;
  lettura: Verdetto;
  misura?: boolean | null;
  notaAcceso?: string;
  notaSpento?: string;
  notaNonMisurato?: string;
}): Organo {
  const fonte = String(p.fonte || "").trim();
  const grigio = (nota: string): Organo => ({ stato: "non-misurato", icona: "⚪", semaforo: "grigio", nota, misurato: false, fonte });

  if (!fonte) return grigio(p.notaNonMisurato || "non misurato: nessuna fonte dichiarata");
  if (!p.lettura || !p.lettura.misurato) return grigio(`non lo so: ${p.lettura?.motivo || "lettura non riuscita"}`);
  if (p.misura == null) return grigio(p.notaNonMisurato || `non misurato: nessun sensore su ${fonte}`);
  return p.misura
    ? { stato: "acceso", icona: "✅", semaforo: "verde", nota: p.notaAcceso || "attivo", misurato: true, fonte }
    : { stato: "spento", icona: "🟡", semaforo: "giallo", nota: p.notaSpento || "da collegare", misurato: true, fonte };
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-237 — l'età del DATO, non l'ora in cui ho chiesto
// ─────────────────────────────────────────────────────────────────────────────

/** Millisecondi da una data del vault (`AAAA-MM-GG[ HH:MM]`, fuso di Piacenza), ISO, numero o Date. */
export function quandoMs(x: unknown): number | null {
  if (x == null || x === "") return null;
  if (x instanceof Date) return Number.isNaN(x.getTime()) ? null : x.getTime();
  if (typeof x === "number") return Number.isFinite(x) && x > 0 ? x : null;
  const s = String(x).trim();
  // Se la stringa porta già il suo fuso (…Z, +02:00) è una data assoluta: si legge com'è. La
  // convenzione di Piacenza vale SOLO per le date del vault, che il fuso non ce l'hanno scritto.
  const conFuso = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(s);
  const m = conFuso ? null : s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (m) {
    // AR-414 — qui c'era `+02:00` scritto a mano. `+02:00` è l'ora legale: da fine ottobre a fine
    // marzo sbagliava di un'ora piena, sempre nella stessa direzione, e l'età che ne esce si
    // confronta con soglie misurate IN ORE. Il fuso si calcola per la data che si sta leggendo
    // (`vaultToIso` interroga Europe/Rome), non si scrive.
    const [, y, mo, d, h = "12", mi = "00"] = m;
    const t = Date.parse(vaultToIso(`${y}-${mo}-${d} ${h}:${mi}`));
    return Number.isNaN(t) ? null : t;
  }
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : t;
}

/** La più recente fra più date (le fonti di una schermata). `null` se nessuna è leggibile. */
export function piuRecente(date: unknown[]): string | null {
  let best: { t: number; v: string } | null = null;
  for (const d of date || []) {
    const t = quandoMs(d);
    if (t == null) continue;
    if (!best || t > best.t) best = { t, v: String(d) };
  }
  return best ? best.v : null;
}

export type Freschezza = {
  stato: "fresco" | "vecchio" | "ignota";
  oreFa: number | null;
  /** Il prefisso onesto della targhetta: mai «aggiornato» su un dato di cui non so l'età. */
  prefisso: string;
  ambra: boolean;
  /** Vero quando la targhetta va mostrata comunque, anche senza data: il silenzio è il difetto. */
  mostra: boolean;
};

/**
 * L'età del dato mostrato. Tre risposte, non due:
 *   · «dati del …»            — la fonte ha una data e non è vecchia
 *   · «dati del …» in ambra   — la fonte ha una data più vecchia del tetto (24h): FERMA
 *   · «non so di quando …»    — la fonte non porta nessuna data: non si scrive «adesso»
 *
 * `Date.now()` del browser non compare da nessuna parte: è l'ora in cui ho chiesto, non l'età del
 * dato, ed è esattamente ciò che AR-237 chiama la targhetta che mente.
 */
export function freschezza(p: {
  dataDato?: unknown;
  adesso?: number;
  tettoOre?: number;
}): Freschezza {
  const tetto = Number(p.tettoOre) > 0 ? Number(p.tettoOre) : 24;
  const t = quandoMs(p.dataDato);
  if (t == null) {
    return { stato: "ignota", oreFa: null, prefisso: "non so di quando sono questi dati", ambra: true, mostra: true };
  }
  const adesso = Number(p.adesso) > 0 ? Number(p.adesso) : Date.now();
  const oreFa = Math.max(0, (adesso - t) / 3_600_000);
  const vecchio = oreFa > tetto;
  return { stato: vecchio ? "vecchio" : "fresco", oreFa, prefisso: "dati del", ambra: vecchio, mostra: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-255 — un file, un lettore: la forma si normalizza AL CONFINE, non in ogni schermata
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La serie dello storico, comunque sia scritta sul file: `{serie:[…]}` (forma di oggi) oppure
 * l'elenco nudo in cima (forma che si è già presentata davvero — la tolleranza in
 * `salute-onesta` è la cicatrice di quel guasto). Torna SEMPRE un array, senza buchi.
 *
 * Serve una funzione sola perché il file è uno solo: finché i due lettori tenevano tolleranze
 * diverse, la stessa pagina poteva mostrare la storia in un riquadro e il vuoto nell'altro — e il
 * vuoto si legge come «non c'è storia», che è una bugia. Il `for (const s of serie)` del componente
 * su un oggetto lanciava in pieno render.
 */
export function serieSicura<T = any>(storico: unknown): T[] {
  if (Array.isArray(storico)) return storico.filter(Boolean) as T[];
  const s = (storico as any)?.serie;
  if (Array.isArray(s)) return s.filter(Boolean) as T[];
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Il confine dell'atto: UNA lettura, un verdetto. Le schermate non rifanno la catena.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Legge una route del Pannello e torna dato + verdetto. Tutta la parte che DECIDE è
 * `verdettoLettura` (pura, provata); qui c'è solo la rete. `fetchImpl` è iniettabile apposta:
 * il test esegue questa funzione con una fetch che lancia, che risponde 500, che torna
 * `collegato:false` — cioè i casi veri, non un pattern cercato nel sorgente.
 */
export async function leggiDato<T>(
  url: string,
  p: {
    estrai: (corpo: any) => T | null | undefined;
    eVuoto?: (dato: T) => boolean;
    cieco?: (corpo: any) => string | null;
    quandoOk?: Semaforo;
  },
  fetchImpl?: typeof fetch,
): Promise<{ verdetto: Verdetto; dato: T | null; corpo: any }> {
  const f = fetchImpl || (typeof fetch !== "undefined" ? fetch : null);
  if (!f) return verdettoLettura<T>({ esito: { tipo: "rete", messaggio: "fetch non disponibile" }, ...p });

  let res: Response | null = null;
  try {
    res = await f(url, { cache: "no-store" });
  } catch (e: any) {
    return verdettoLettura<T>({ esito: { tipo: "rete", messaggio: e?.message || "rete" }, ...p });
  }
  const esito: EsitoHttp = { tipo: "risposta", ok: Boolean(res?.ok), status: Number(res?.status) || 0 };
  if (!res?.ok) return verdettoLettura<T>({ esito, ...p });

  let corpo: unknown = null;
  try {
    corpo = await res.json();
  } catch {
    corpo = null;
  }
  return verdettoLettura<T>({ esito, corpo, ...p });
}
