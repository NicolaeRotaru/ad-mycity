#!/usr/bin/env node
// onesta-ambito.mjs — LE DUE DOMANDE che il metro dell'onestà deve saper rispondere da solo:
//
//   ① «questo file è STORIA o è VIVO?»          → cosa ha senso giudicare adesso
//   ② «questo rilievo è un falso positivo DICHIARATO?» → cosa non è mai stato un difetto
//
// 🚧 AR-394 — «Il cancello comune promette quattro controlli e ne fa tre: il quarto è un parametro
// morto.» La causa di sistema, scritta nella scheda: quando un controllo dà fastidio lo si degrada
// a informativo lasciandone in piedi la FORMA — il nome nella lista, il parametro, il commento — e
// la forma continua a rassicurare chi legge molto dopo che la sostanza è sparita.
//
// Il rimedio scelto allora fu ESCLUDERE il controllo d'onestà invece di RESTRINGERLO, perché
// `onesta-check.mjs` ha due falsi positivi noti sulla memoria della macchina. Restringere costava di
// più, quindi si è saltato. Questo file è il costo pagato: l'ambito e le esenzioni diventano una
// decisione scritta, con un motivo accanto a ciascuna, che una prova può ESEGUIRE.
//
// ⚖️ LA REGOLA CHE GOVERNA QUESTO FILE. Un'esenzione senza il motivo scritto è vietata: è
// esattamente il silenzio che stiamo curando. `verificaEsenzioni()` gira all'IMPORT — se qualcuno
// aggiunge un'esenzione muta, il metro non parte affatto. Un metro che non può fallire e un metro
// che non parte sono due cose diverse: il secondo lo vedi subito.
//
// 🟢 Sola lettura e senza dipendenze: nessun import, nessun I/O, nessuna rete, nessun git. È la
//    condizione perché una prova possa eseguirla invece di cercarla con un grep.

// ─────────────────────────────────────────────────────────────────────────────
// ① STORIA O VIVO — l'AMBITO
// ─────────────────────────────────────────────────────────────────────────────
//
// La regola del vault (CLAUDE.md, AR-102) dice già quali file sono STORIA: «La storia (DECISIONI,
// Briefing, SALA-OPERATIVA, quaderni) NON si riscrive: è esente.» Pretendere oggi l'onestà su una
// riga scritta a luglio significa chiedere di riscrivere la storia per poter pubblicare il presente:
// è per questo che il controllo era stato staccato del tutto invece che ristretto.
//
// Restringere vuol dire due tagli, non uno:
//   · per FILE   — un file che per contratto è append-only non si giudica affatto;
//   · per PARTE  — dentro un file vivo, le righe di citazione `> …` sono il diario dei giri passati
//                  (stessa forma di DECISIONI.md) e restano fuori: si giudica ciò che il giro
//                  riscrive ADESSO, cioè ciò che sta per essere pubblicato.

/** I file di memoria che per contratto non si riscrivono mai: giudicarli è chiedere di riscrivere la storia. */
const STORICI = [
  {
    quando: /(^|\/)MyCity-Vault\/90-Memoria-AI\/DECISIONI\.md$/i,
    motivo: "log append-only per contratto (CLAUDE.md: «Non riscrivere mai le righe vecchie») — una riga di giugno non è correggibile oggi",
  },
  {
    quando: /(^|\/)MyCity-Vault\/90-Memoria-AI\/SALA-OPERATIVA\.md$/i,
    motivo: "canale condiviso append-only: AR-102 lo elenca fra i file di storia esenti dalla riscrittura",
  },
  {
    quando: /(^|\/)MyCity-Vault\/90-Memoria-AI\/(Archivio|Storico|Report)\//i,
    motivo: "archivio, storico e report passati: fotografie di giri già chiusi, per definizione non riscrivibili",
  },
  {
    quando: /(^|\/)memoria-squadra\//i,
    motivo: "quaderni dei reparti: AR-102 li elenca fra i file di storia esenti dalla riscrittura",
  },
];

/** I file di memoria che il giro riscrive a ogni passaggio: sono l'atto che sta per essere pubblicato. */
const VIVI = [
  {
    quando: /(^|\/)MyCity-Vault\/90-Memoria-AI\/STATO\.md$/i,
    motivo: "i numeri chiave che il Pannello mostra a Nicola: riscritti a ogni giro, quindi correggibili adesso",
  },
  {
    quando: /(^|\/)MyCity-Vault\/90-Memoria-AI\/RITMO\.md$/i,
    motivo: "il battito delle cadenze: l'ultima riga è quella che il giro sta scrivendo",
  },
  {
    quando: /(^|\/)MyCity-Vault\/90-Memoria-AI\/Briefing\//i,
    // Perché un briefing sta fra i vivi e non fra gli storici, pur essendo nell'elenco di AR-102: i
    // due chiamanti veri (`giro.sh` e `gate-pubblicazione.sh`) prendono sempre e solo il più recente
    // — `ls -t … | head -1` — quindi un briefing che arriva a questo metro è quello che si sta
    // pubblicando adesso. Se un giorno qualcuno passasse un briefing vecchio, il metro sarebbe
    // severo su una storia che non si può più riscrivere: la casa della decisione è questa riga.
    motivo: "il briefing del giro in corso: i chiamanti passano sempre il più recente (ls -t | head -1), cioè quello che si sta pubblicando",
  },
];

/**
 * Che natura ha questo file per il metro dell'onestà.
 *   "storico" → non si giudica: la storia non si riscrive
 *   "vivo"    → si giudica la parte che il giro riscrive adesso
 *   "altro"   → non è memoria della macchina: regole invariate (contenuti, consegne, audit…)
 */
export function naturaFile(percorso = "") {
  const p = String(percorso || "").replace(/\\/g, "/");
  if (!p || p.startsWith("(")) {
    // "(stdin)" / "(--testo)": un testo senza casa. Chi lo passa ha già scelto l'ambito a monte
    // (il cancello di pubblicazione manda la parte viva), quindi qui non si toglie nient'altro.
    return { natura: "altro", motivo: "testo senza percorso: l'ambito lo ha già scelto chi lo manda" };
  }
  for (const r of STORICI) if (r.quando.test(p)) return { natura: "storico", motivo: r.motivo };
  for (const r of VIVI) if (r.quando.test(p)) return { natura: "vivo", motivo: r.motivo };
  return { natura: "altro", motivo: "non è memoria append-only: si misura per intero, come sempre" };
}

/**
 * Il testo che ha senso giudicare, dato il file.
 *
 * `vivo` è la stringa da misurare: vuota per uno storico (non c'è niente da correggere), il testo
 * senza il diario `> …` per un file vivo, il testo intero per tutto il resto.
 *
 * ⚠️ Duplicazione dichiarata: la stessa regola del diario vive in `cervello/istante-cancello.mjs`
 * (`parteViva`), che serve la corsia shell del cancello di pubblicazione. È ripetuta qui di
 * proposito perché questo modulo deve restare SENZA DIPENDENZE — è la condizione che permette a una
 * prova di eseguirlo e a un clone parziale di non caricarne mezzo. Se un giorno si uniscono, la casa
 * è questa.
 */
export function parteVivaDelFile(percorso = "", testo = "") {
  const t = String(testo ?? "");
  const n = naturaFile(percorso);
  if (n.natura === "storico") return { ...n, vivo: "", righeStoriche: t.split("\n").length };
  if (n.natura === "altro") return { ...n, vivo: t, righeStoriche: 0 };
  const righe = t.split("\n");
  const vive = righe.filter((r) => !/^\s*>/.test(r));
  return { ...n, vivo: vive.join("\n"), righeStoriche: righe.length - vive.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// ② I FALSI POSITIVI DICHIARATI — le ESENZIONI
// ─────────────────────────────────────────────────────────────────────────────
//
// Ogni voce ha un `motivo` scritto per esteso, come si fa per le malattie: chi legge deve poter
// dire «questa esenzione è sbagliata» senza aprire il codice. Una voce muta non è ammessa —
// `verificaEsenzioni()` la fa esplodere all'import.
//
// La misura che le ha decise (parte VIVA di STATO.md, 22/8): 35 numeri segnalati come «senza
// fonte», 33 dei quali erano pezzi di data o di orario. Con 33 rumori su 35 il metro non poteva
// essere acceso in modo bloccante senza fermare per sempre la pubblicazione della memoria — ed è
// esattamente il motivo per cui era stato staccato.

export const ESENZIONI = [
  {
    id: "data-di-calendario",
    regola: "numero-senza-fonte",
    motivo:
      "Due regole della casa si scontrano: «ogni numero porta la sua fonte» e «ogni traccia in memoria porta la data e l'ora» (CLAUDE.md, regola dell'orario). Il giorno e il mese di una data NON sono un claim di business: sono il timbro che dice quando la misura è stata presa, cioè la fonte stessa. Senza questa esenzione ogni riga datata — quindi ogni riga della memoria — è una violazione.",
    esempio: "«fatta il 21 agosto», «SQL diretta 19/8 18:00», «creato 24/6», «2026-08-18»",
  },
  {
    id: "orario",
    regola: "numero-senza-fonte",
    motivo:
      "Stessa collisione della data, sull'ora: «14:29» è il minuto in cui la lettura è stata fatta, non una cifra da fondare. La regola dell'orario di CLAUDE.md pretende l'ora su OGNI traccia, quindi punirla è punire l'obbedienza a un'altra regola.",
    esempio: "«fra le 14:29 e le 14:31», «19/8 18:00», «08:28»",
  },
  {
    id: "snippet-di-shell-fra-parentesi-quadre",
    regola: "segnaposto",
    motivo:
      "La regola dei segnaposto cerca qualunque cosa fra parentesi quadre: in un file di memoria che cita il codice della macchina, un test di shell come [ -f \"$1\" ] viene letto come un buco da riempire. Un segnaposto vero non ha spazi subito dentro le parentesi e non contiene variabili o operatori di confronto: è [NOME], non [ -n \"${x}\" ]. Si esenta solo la seconda forma.",
    esempio: "[ -f \"$1\" ] · [ \"$rc\" -ne 0 ] · [ -z \"${GATE_ONESTA:-}\" ]",
  },
];

/** Il motivo deve essere una frase vera, non una parola messa lì per far passare il controllo. */
const MOTIVO_MINIMO = 60;

/**
 * Rifiuta un'elenco di esenzioni mute. Gira all'import: se qualcuno aggiunge un'esenzione senza il
 * suo perché, il metro dell'onestà NON PARTE — e un metro che non parte si vede, mentre un metro
 * che tace no. È la stessa scelta di fondo del contratto dei guardiani (AR-322): cieco non è verde.
 */
export function verificaEsenzioni(elenco = ESENZIONI) {
  if (!Array.isArray(elenco) || elenco.length === 0) {
    throw new Error("onesta-ambito: l'elenco delle esenzioni non è leggibile");
  }
  for (const e of elenco) {
    const id = e && e.id ? String(e.id) : "(senza id)";
    if (!e || !e.id || !e.regola) {
      throw new Error(`onesta-ambito: esenzione ${id} senza id o senza la regola che esenta`);
    }
    const motivo = String(e.motivo || "").trim();
    if (motivo.length < MOTIVO_MINIMO) {
      throw new Error(
        `onesta-ambito: l'esenzione «${id}» non ha il motivo scritto (${motivo.length} caratteri, ne servono almeno ${MOTIVO_MINIMO}). ` +
          "Un'esenzione muta è il silenzio che AR-394 cura: scrivi PERCHÉ quel rilievo non è mai stato un difetto, o toglila.",
      );
    }
  }
  return true;
}

// Il freno sta qui, all'import, non in un comando che qualcuno deve ricordarsi di lanciare.
verificaEsenzioni();

const MESI = "gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre";

/** «21» in «21/8», «21 agosto», «2026-08-21»: un pezzo di data, non una cifra di business. */
function eUnaData({ raw, prima, dopo }) {
  const n = Number(String(raw).replace(/[^\d]/g, ""));
  const giorno = n >= 1 && n <= 31;
  const mese = n >= 1 && n <= 12;
  // giorno seguito da /mese  → «21/8», «24/8-1/9»
  if (giorno && /^\/(0?[1-9]|1[0-2])\b/.test(dopo)) return true;
  // mese preceduto da giorno/ → «19/12»
  if (mese && /\b(0?[1-9]|[12]\d|3[01])\/$/.test(prima)) return true;
  // giorno seguito dal mese scritto in lettere → «21 agosto»
  if (giorno && new RegExp(`^\\s+(${MESI})\\b`, "i").test(dopo)) return true;
  // forma ISO «2026-08-18»: il mese ha davanti l'anno, il giorno anno-mese
  if (mese && /\b(19|20)\d{2}-$/.test(prima)) return true;
  if (giorno && /\b(19|20)\d{2}-(0?[1-9]|1[0-2])-$/.test(prima)) return true;
  return false;
}

/** «14» in «14:29», «29» in «14:29»: un pezzo d'orario. */
function eUnOrario({ raw, prima, dopo }) {
  const n = Number(String(raw).replace(/[^\d]/g, ""));
  // ora seguita dai minuti
  if (n >= 0 && n <= 23 && /^:[0-5]\d\b/.test(dopo)) return true;
  // minuti preceduti dall'ora
  if (n >= 0 && n <= 59 && /\b([01]?\d|2[0-3]):$/.test(prima)) return true;
  return false;
}

/** «[ -f "$1" ]» è un pezzo di shell citato, non un buco da riempire. */
function eUnoSnippetDiShell(raw) {
  const t = String(raw || "");
  if (!/^\[\s/.test(t) || !/\s\]$/.test(t)) return false; // un segnaposto vero è [NOME], senza spazi dentro
  return /(\$|-eq\b|-ne\b|-gt\b|-lt\b|-ge\b|-le\b|\s-[fdnzex]\s|=)/.test(t);
}

const COME_DECIDE = {
  "data-di-calendario": (r) => eUnaData(r),
  orario: (r) => eUnOrario(r),
  "snippet-di-shell-fra-parentesi-quadre": (r) => eUnoSnippetDiShell(r.raw),
};

/**
 * Questo rilievo è uno dei falsi positivi DICHIARATI?
 *
 *   rilievo = { regola, raw, prima, dopo }
 *     regola → "numero-senza-fonte" | "segnaposto" | "claim-non-verificato"
 *     raw    → il pezzo di testo segnalato
 *     prima  → i caratteri subito prima (bastano una decina)
 *     dopo   → i caratteri subito dopo
 *
 * Torna { esente:false } oppure { esente:true, id, motivo }. Il motivo esce SEMPRE insieme
 * all'esenzione: chi legge il referto deve vedere perché quel rilievo è stato messo da parte.
 */
export function esenzioneDelRilievo({ regola = "", raw = "", prima = "", dopo = "" } = {}) {
  const r = { regola: String(regola), raw: String(raw), prima: String(prima), dopo: String(dopo) };
  for (const e of ESENZIONI) {
    if (e.regola !== r.regola) continue;
    const decide = COME_DECIDE[e.id];
    if (typeof decide !== "function") continue;
    if (decide(r)) return { esente: true, id: e.id, motivo: e.motivo };
  }
  return { esente: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI — per guardare a occhio cosa il metro esenta e perché
// ─────────────────────────────────────────────────────────────────────────────
if (process.argv[1] && process.argv[1].endsWith("onesta-ambito.mjs")) {
  const cosa = process.argv[2] || "esenzioni";
  if (cosa === "natura") {
    console.log(JSON.stringify(naturaFile(process.argv[3] || ""), null, 2));
  } else {
    for (const e of ESENZIONI) console.log(`• ${e.id} [regola: ${e.regola}]\n  perché: ${e.motivo}\n  esempi: ${e.esempio}\n`);
  }
}
