// 📖 glossario-kpi.mjs — la regola del guardiano del glossario dei KPI, in funzioni pure (AR-962).
//
// Il confronto fra il registro dei KPI (cervello/kpi-registro.json), il glossario
// (MyCity-Vault/07-Agenti/GLOSSARIO-KPI.md) e i numeri che le vetrine del codice consegnano davvero.
// Sta in un file suo perché una prova lo possa ESEGUIRE su dati finti senza far partire il guardiano:
// la riga di comando, che legge il disco ed esegue le vetrine, è cervello/glossario-kpi-check.mjs.
//
// 🟢 Nessuna dipendenza, nessuna lettura dal disco, nessun effetto all'import: chi chiama passa i dati.

/**
 * Le nature ammesse per un campo che esce da una vetrina ma NON è un KPI, col tipo che il valore
 * misurato deve avere. Un numero non può travestirsi da «flag», «testo» o «struttura»: il tipo si
 * misura sull'uscita vera. Può dichiararsi «soglia» o «contatore del sensore», ma solo per scritto,
 * col perché, in un registro che si rilegge.
 */
export const NATURE = {
  flag: "boolean",
  testo: "string",
  struttura: "object",
  soglia: "number",
  "contatore-sensore": "number",
};

const spazi = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const tipoDi = (v) => (Array.isArray(v) ? "object" : typeof v);

/**
 * I termini del glossario: per ogni riga di tabella il cui primo campo comincia in grassetto, il
 * termine è il testo in grassetto e la definizione è la seconda colonna. PURA.
 *
 * Le righe senza grassetto in testa (intestazioni, separatori, la tabella delle divergenze che
 * comincia con «D1») non sono definizioni, e non contano.
 *
 * @returns {Map<string, string>} termine → definizione
 */
export function terminiDelGlossario(testo = "") {
  const termini = new Map();
  for (const grezza of String(testo).split(/\r?\n/)) {
    const riga = grezza.trim();
    if (!riga.startsWith("|")) continue;
    const celle = riga.replace(/^\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());
    if (celle.length < 2) continue;
    const m = /^\*\*(.+?)\*\*/.exec(celle[0]);
    if (!m) continue;
    const termine = spazi(m[1]);
    if (termine && !termini.has(termine)) termini.set(termine, celle[1]);
  }
  return termini;
}

/** Una definizione vuota, o un trattino, non definisce niente. */
const definizioneVuota = (d) => !spazi(d) || /^[-—–?]+$/.test(spazi(d));

/**
 * IL CUORE. Confronta il registro con il glossario e con quello che le vetrine consegnano davvero.
 * PURA: chi chiama misura (esegue le vetrine, legge il glossario, importa i moduli) e passa i dati.
 *
 * @param {object} p
 * @param {{esposizioni: Array, kpi: Array}} p.registro
 * @param {Map<string,string>|Record<string,string>} p.termini  termine del glossario → definizione
 * @param {Record<string, {ok: boolean, campi?: object, perche?: string}>} p.esposti  vetrina → uscita misurata
 * @param {Record<string, {ok: boolean, esiste?: boolean, perche?: string}>} [p.puntatori]  "file#funzione" → esito
 * @param {string[]} [p.vetrineNote]  le vetrine che il guardiano sa eseguire: il registro le deve nominare tutte
 * @returns {{esito: 0|1|2, problemi: Array, ciechi: Array, conti: object}}
 */
export function verificaGlossarioKpi({ registro, termini, esposti = {}, puntatori = {}, vetrineNote = [] } = {}) {
  const problemi = [];
  const ciechi = [];
  const no = (tipo, messaggio, extra = {}) => problemi.push({ tipo, messaggio, ...extra });
  const glossario = termini instanceof Map ? termini : new Map(Object.entries(termini || {}));
  const terminiNorm = new Map([...glossario].map(([t, d]) => [spazi(t), d]));

  const esposizioni = Array.isArray(registro?.esposizioni) ? registro.esposizioni : [];
  const kpi = Array.isArray(registro?.kpi) ? registro.kpi : [];

  // ── La forma del registro: un registro storto non può dare un verde ─────────────────────────
  const idEsposizioni = new Set();
  for (const e of esposizioni) {
    if (!e || !spazi(e.id)) {
      no("registro", "una vetrina del registro non ha l'id");
      continue;
    }
    if (idEsposizioni.has(e.id)) no("registro", `la vetrina «${e.id}» è scritta due volte nel registro`);
    idEsposizioni.add(e.id);
    for (const n of e.non_kpi || []) {
      if (!n || !spazi(n.campo)) no("registro", `vetrina «${e.id}»: una voce non_kpi non ha il campo`);
      else if (!Object.hasOwn(NATURE, n.natura)) no("registro", `vetrina «${e.id}»: il campo «${n.campo}» ha natura «${n.natura}», che non esiste (ammesse: ${Object.keys(NATURE).join(", ")})`);
      else if (!spazi(n.perche)) no("registro", `vetrina «${e.id}»: il campo «${n.campo}» è dichiarato non-KPI senza il perché`);
    }
  }
  // Togliere una vetrina intera dal registro, insieme ai suoi KPI, la toglierebbe dal controllo con
  // un verde: chi sa eseguirla pretende che il registro la nomini.
  for (const v of vetrineNote) {
    if (!idEsposizioni.has(v)) no("registro", `il guardiano sa eseguire la vetrina «${v}», e il registro non la nomina: i suoi numeri non li controllerebbe nessuno`, { esposizione: v });
  }
  if (!kpi.length) no("registro", "il registro non ha nessun KPI: zero controllati non è un verde");
  const idKpi = new Set();
  for (const k of kpi) {
    const nome = spazi(k?.id) || "(senza id)";
    if (!spazi(k?.id)) no("registro", "un KPI del registro non ha l'id");
    else if (idKpi.has(k.id)) no("registro", `il KPI «${k.id}» è scritto due volte nel registro`);
    idKpi.add(k?.id);
    for (const campo of ["nome", "glossario", "file", "funzione"]) {
      if (!spazi(k?.[campo])) no("registro", `il KPI «${nome}» non dice ${campo === "glossario" ? "la riga del glossario che lo definisce" : `il ${campo}`}`, { kpi: nome });
    }
    if (!Array.isArray(k?.campi) || !k.campi.length) no("registro", `il KPI «${nome}» non dice con quali campi esce`, { kpi: nome });
    if (!Array.isArray(k?.esposizioni) || !k.esposizioni.length) no("registro", `il KPI «${nome}» non dice da quale vetrina esce`, { kpi: nome });
    for (const e of k?.esposizioni || []) {
      if (!idEsposizioni.has(e)) no("registro", `il KPI «${nome}» esce dalla vetrina «${e}», che il registro non conosce`, { kpi: nome });
    }
  }

  // ── ① Ogni KPI del registro ha la sua riga nel glossario ─────────────────────────────────────
  for (const k of kpi) {
    if (!spazi(k?.glossario)) continue; // già detto sopra
    const def = terminiNorm.get(spazi(k.glossario));
    if (def === undefined) {
      no("senza-glossario", `il KPI «${k.id}» rimanda alla riga «${k.glossario}», che nel glossario non c'è: il numero esce senza una definizione condivisa`, { kpi: k.id });
    } else if (definizioneVuota(def)) {
      no("senza-glossario", `il KPI «${k.id}» ha la riga «${k.glossario}» nel glossario, ma la definizione è vuota`, { kpi: k.id });
    }
  }

  // ── ② Nessun numero esce fuori registro, e nessuna voce del registro è un fantasma ───────────
  let campiEsposti = 0;
  let misurate = 0;
  for (const e of esposizioni) {
    if (!e || !spazi(e.id)) continue;
    const misura = esposti[e.id];
    if (!misura || !misura.ok || !misura.campi || typeof misura.campi !== "object") {
      ciechi.push({ dove: `vetrina «${e.id}»`, perche: misura?.perche || "non eseguita: non so quali numeri consegna" });
      continue;
    }
    misurate++;
    const uscita = misura.campi;
    const campiUsciti = Object.keys(uscita);
    campiEsposti += campiUsciti.length;

    // Chi possiede ogni campo, dentro questa vetrina.
    const padrone = new Map();
    for (const k of kpi) {
      if (!(k?.esposizioni || []).includes(e.id)) continue;
      for (const c of k.campi || []) {
        if (padrone.has(c)) no("registro", `nella vetrina «${e.id}» il campo «${c}» è di due KPI: «${padrone.get(c)}» e «${k.id}»`, { campo: c });
        else padrone.set(c, `KPI ${k.id}`);
      }
    }
    for (const n of e.non_kpi || []) {
      if (!n || !spazi(n.campo)) continue;
      if (padrone.has(n.campo)) no("registro", `nella vetrina «${e.id}» il campo «${n.campo}» è insieme un KPI e un non-KPI`, { campo: n.campo });
      else padrone.set(n.campo, "non_kpi");
    }

    for (const c of campiUsciti) {
      if (!padrone.has(c)) {
        no("fuori-registro", `la vetrina «${e.id}» consegna il campo «${c}», che il registro non conosce: un numero nuovo senza un KPI e senza una riga nel glossario`, { esposizione: e.id, campo: c });
      }
    }
    for (const [c, chi] of padrone) {
      if (!Object.hasOwn(uscita, c)) {
        no("fantasma", `il registro dice che la vetrina «${e.id}» consegna «${c}» (${chi}), e il codice non lo consegna più`, { esposizione: e.id, campo: c });
      }
    }
    for (const n of e.non_kpi || []) {
      if (!n || !Object.hasOwn(NATURE, n.natura) || !Object.hasOwn(uscita, n.campo)) continue;
      const v = uscita[n.campo];
      if (v === null || v === undefined) continue; // un null non dice il tipo: non lo giudico
      if (tipoDi(v) !== NATURE[n.natura]) {
        no("natura", `nella vetrina «${e.id}» il campo «${n.campo}» è dichiarato ${n.natura} ma esce come ${tipoDi(v)}${tipoDi(v) === "number" ? ": un numero non si dichiara non-KPI così" : ""}`, { esposizione: e.id, campo: n.campo });
      }
    }
  }
  if (esposizioni.length && misurate === 0 && !ciechi.length) ciechi.push({ dove: "vetrine", perche: "nessuna vetrina misurata" });
  if (!esposizioni.length) no("registro", "il registro non nomina nessuna vetrina: non so da dove escono i numeri");

  // ── ③ Il puntatore di ogni KPI: il file e la funzione che lo calcola esistono davvero ────────
  for (const k of kpi) {
    if (!spazi(k?.file) || !spazi(k?.funzione)) continue;
    const chiave = `${k.file}#${k.funzione}`;
    const p = puntatori[chiave];
    if (!p) continue; // chi chiama non l'ha misurato: la prova pura può non passarli
    if (!p.ok) ciechi.push({ dove: chiave, perche: p.perche || "modulo non importabile" });
    else if (!p.esiste) no("puntatore", `il KPI «${k.id}» dice che lo calcola ${k.funzione} in ${k.file}, e lì quella funzione esportata non c'è`, { kpi: k.id });
  }

  const esito = problemi.length ? 1 : ciechi.length ? 2 : 0;
  return {
    esito,
    problemi,
    ciechi,
    conti: { kpi: kpi.length, vetrine: esposizioni.length, vetrine_misurate: misurate, campi_esposti: campiEsposti, termini_glossario: glossario.size },
  };
}
