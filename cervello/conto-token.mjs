#!/usr/bin/env node
// 🧮 CONTO TOKEN — il contatore VERO dei gettoni che un'ondata di agenti ha consumato.
//
// PERCHÉ ESISTE. Il costo di un'ondata era scritto come «stimato e mai misurato»
// (cervello/lotto-a-pacchetti.md, sezione ⑦): circa 50.000 gettoni per l'AD, «il resto lo bruciano
// le squadre». Il 25/10 i transcript veri hanno detto un'altra cosa: un analista da 29 turni ha
// letto 3.632.127 gettoni in entrata e ne ha scritti 10.156 in uscita, e circa tre quarti di
// quell'entrata è il contesto fisso (strumenti, CLAUDE.md, elenco skill) riletto a OGNI turno.
// Una stima che sbaglia la forma del costo fa tagliare le cose sbagliate: si accorciano le
// risposte (l'1% del conto) e si lascia intatto il contesto riletto 29 volte.
//
// COSA MISURA. Legge i transcript che Claude Code lascia su disco — `agent-<id>.jsonl` più il suo
// `agent-<id>.meta.json` — e per ogni agente somma l'`usage` dei messaggi dell'assistente:
// turni, entrata al primo turno, scritti in cache, letti dalla cache, entrata non in cache, uscita.
//
// DUE CONTATORI, NON UNO. Non sappiamo cosa conti il limite settimanale di Nicola. I due contatori di
// questo comando — con e senza le letture dalla cache — NON coincidono col numero che il motore dei
// workflow chiama `subagent_tokens` (il «64M» del riesame del 16/10). Il collaudo del 25/10 l'ha
// misurato su wf_3e744be2: il motore dava 695.274, scritture in cache + uscita 799.856, il contatore
// senza letture 800.222; per un agente il numero del motore era quasi il contesto dell'ultimo turno
// (202.225 contro 202.217). Chi confronta il referto col numero del motore NON guarda lo stesso conto.
// Scegliere uno dei due e chiamarlo «il costo» sarebbe inventare: li stampo tutti e due e lo dico.
//
// LA QUOTA DEL CONTESTO FISSO è una STIMA, e si dichiara così: per ogni agente prendo l'entrata
// del primo turno (quello che l'agente si porta dietro prima di aver fatto niente), la moltiplico
// per i turni, e divido la somma per l'entrata totale. È un TETTO: sbaglia per eccesso, non per
// difetto. Il primo turno contiene anche il prompt del compito, che non è contesto fisso (quello è
// strumenti, CLAUDE.md, elenco skill): più il prompt è lungo, più la stima sale, e un agente da un
// turno solo dà sempre il 100%. Se poi l'agente compatta il contesto a metà strada, i turni dopo
// possono pesare meno del primo: anche lì la stima sale.
//
// TRE TRAPPOLE DEI TRANSCRIPT, tutte viste sui file veri:
//   · lo stesso messaggio compare su PIÙ righe (una per blocco: pensiero, testo, strumento) con lo
//     stesso `message.id`: sommarle tutte gonfia il conto di 2-3 volte. Si conta una volta per id;
//     se due righe dello stesso id portano numeri diversi (risposta in streaming) tengo il più alto
//     campo per campo, cioè la versione finale;
//   · i messaggi `<synthetic>` (errori, interruzioni) hanno usage a zero e non sono chiamate vere:
//     contarli come turni abbasserebbe l'entrata al primo turno a zero;
//   · una riga JSON rotta (file troncato mentre l'agente scriveva) non deve far cadere il comando:
//     si conta e si dichiara.
//
// USCITA. 0 se ha misurato almeno un agente. 2 se la cartella non c'è, non ha transcript, o nessuna
// riga porta `usage`: mai un verde con zero misure (la scorciatoia «verde muto» di
// cervello/scorciatoie-note.md). 2 anche per un comando scritto male: non ho misurato niente. E 2 se
// con --workflow una parte della radice non si legge: la ricerca sarebbe a metà (vedi trovaWorkflow).
//
// 🟢 Sola lettura: non scrive niente, da nessuna parte.
//
// Uso:
//   node cervello/conto-token.mjs --dir <cartella>        → una cartella con agent-*.jsonl e *.meta.json
//   node cervello/conto-token.mjs --workflow <runId>      → la cerca sotto ~/.claude/projects (basta l'inizio dell'id)
//   node cervello/conto-token.mjs --sessione <file.jsonl> → il ciclo principale (l'AD)
//   … --json                                              → gli stessi numeri in JSON
// Per le prove: CONTO_TOKEN_RADICE sostituisce ~/.claude/projects.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";

/** Il prefisso e il suffisso dei transcript dei subagenti, come li scrive Claude Code. */
const PREFISSO = "agent-";
const SUFFISSO = ".jsonl";
/** Il modello che Claude Code mette sui messaggi finti (errori, interruzioni): non sono chiamate. */
const MODELLO_SINTETICO = "<synthetic>";

export const AVVERTENZA_LIMITE =
  "Quale dei due contatori conti il limite settimanale non è noto: li riporto entrambi, nessuno dei due è «il costo».";

const n0 = (v) => (Number.isFinite(v) && v > 0 ? v : 0);

/**
 * Misura UN transcript (il testo intero del .jsonl). Funzione pura: niente disco.
 * `escludiLaterali`: nella sessione principale le righe `isSidechain` sono di un subagente, non dell'AD.
 */
export function misuraTesto(testo, { escludiLaterali = false } = {}) {
  const perId = new Map(); // message.id → usage già fuso (un messaggio = un turno)
  const ordine = []; // l'ordine di comparsa: il primo turno è il primo id visto, non il più piccolo
  let righeRotte = 0;
  let laterali = 0;
  let sintetici = 0;
  let senzaId = 0;
  for (const riga of String(testo ?? "").split("\n")) {
    if (!riga.trim()) continue;
    let x;
    try {
      x = JSON.parse(riga);
    } catch {
      righeRotte++;
      continue;
    }
    if (x?.type !== "assistant" || !x.message?.usage) continue;
    if (escludiLaterali && x.isSidechain === true) {
      laterali++;
      continue;
    }
    if (x.message.model === MODELLO_SINTETICO) {
      sintetici++;
      continue;
    }
    const u = x.message.usage;
    const letto = {
      input: n0(u.input_tokens),
      scritti_cache: n0(u.cache_creation_input_tokens),
      letti_cache: n0(u.cache_read_input_tokens),
      uscita: n0(u.output_tokens),
    };
    // Senza id non posso riconoscere i doppioni: ogni riga vale un turno, e lo dichiaro.
    const id = x.message.id || `senza-id-${++senzaId}`;
    const gia = perId.get(id);
    if (!gia) {
      perId.set(id, letto);
      ordine.push(id);
    } else {
      for (const k of Object.keys(letto)) gia[k] = Math.max(gia[k], letto[k]);
    }
  }
  const t = { turni: 0, primo_turno: 0, input: 0, scritti_cache: 0, letti_cache: 0, uscita: 0 };
  for (const id of ordine) {
    const u = perId.get(id);
    t.turni++;
    if (t.turni === 1) t.primo_turno = u.input + u.scritti_cache + u.letti_cache;
    t.input += u.input;
    t.scritti_cache += u.scritti_cache;
    t.letti_cache += u.letti_cache;
    t.uscita += u.uscita;
  }
  t.entrata_totale = t.input + t.scritti_cache + t.letti_cache;
  return { ...t, righe_rotte: righeRotte, righe_laterali_escluse: laterali, messaggi_sintetici: sintetici, messaggi_senza_id: senzaId };
}

/** L'etichetta leggibile: la description del meta, poi la label, poi l'id del file. */
export function etichettaDa(meta, id) {
  const d = typeof meta?.description === "string" ? meta.description.trim() : "";
  const l = typeof meta?.label === "string" ? meta.label.trim() : "";
  return d || l || id;
}

/** Somma gli agenti già misurati e calcola i due contatori e la quota del contesto fisso. */
export function riassumi(agenti = []) {
  const tot = { agenti: agenti.length, agenti_misurati: 0, turni: 0, input: 0, scritti_cache: 0, letti_cache: 0, uscita: 0, entrata_totale: 0 };
  let fisso = 0;
  const perFase = {};
  for (const a of agenti) {
    if (a.turni > 0) tot.agenti_misurati++;
    for (const k of ["turni", "input", "scritti_cache", "letti_cache", "uscita", "entrata_totale"]) tot[k] += a[k] || 0;
    fisso += (a.primo_turno || 0) * (a.turni || 0);
    if (a.fase) {
      const f = (perFase[a.fase] ||= { agenti: 0, turni: 0, con_letture_cache: 0, senza_letture_cache: 0 });
      f.agenti++;
      f.turni += a.turni || 0;
      f.con_letture_cache += contatori(a).con_letture_cache;
      f.senza_letture_cache += contatori(a).senza_letture_cache;
    }
  }
  return {
    totali: tot,
    contatori: contatori(tot),
    contesto_fisso: {
      stima: true,
      come: "somma su ogni agente di (entrata al primo turno × turni), divisa per l'entrata totale",
      direzione: "per eccesso: il primo turno contiene anche il prompt del compito (un agente da un turno solo dà sempre il 100%)",
      token: fisso,
      quota: tot.entrata_totale > 0 ? fisso / tot.entrata_totale : null,
    },
    per_fase: perFase,
  };
}

/** I due contatori: con e senza le letture dalla cache. Entrambi includono l'uscita. */
export function contatori(x) {
  const senza = (x.input || 0) + (x.scritti_cache || 0) + (x.uscita || 0);
  return { con_letture_cache: senza + (x.letti_cache || 0), senza_letture_cache: senza };
}

/** Misura una cartella di subagenti. Restituisce { cieco, motivo } se non c'è niente da misurare. */
export function misuraCartella(dir) {
  if (!dir || !existsSync(dir) || !statSync(dir).isDirectory()) return { cieco: true, motivo: `la cartella ${dir} non esiste` };
  const file = readdirSync(dir)
    .filter((n) => n.startsWith(PREFISSO) && n.endsWith(SUFFISSO))
    .sort();
  if (!file.length) return { cieco: true, motivo: `nessun transcript ${PREFISSO}*${SUFFISSO} in ${dir}` };
  let metaIlleggibili = 0;
  const agenti = file.map((f) => {
    const id = f.slice(PREFISSO.length, -SUFFISSO.length);
    const percorsoMeta = join(dir, `${PREFISSO}${id}.meta.json`);
    let meta = {};
    if (existsSync(percorsoMeta)) {
      try {
        meta = JSON.parse(readFileSync(percorsoMeta, "utf8")) || {};
      } catch {
        metaIlleggibili++; // l'agente si misura lo stesso: perde solo il nome
      }
    }
    const m = misuraTesto(readFileSync(join(dir, f), "utf8"));
    return { id, etichetta: etichettaDa(meta, id), tipo: meta.agentType || null, fase: meta.workflowPhase || null, ...m };
  });
  return componi({ modo: "cartella", percorso: dir }, agenti, metaIlleggibili);
}

/** Misura il transcript del ciclo principale, che è un agente solo. */
export function misuraSessione(file) {
  if (!file || !existsSync(file) || !statSync(file).isFile()) return { cieco: true, motivo: `il file di sessione ${file} non esiste` };
  const m = misuraTesto(readFileSync(file, "utf8"), { escludiLaterali: true });
  const id = basename(file, SUFFISSO);
  return componi({ modo: "sessione", percorso: file }, [{ id, etichetta: `ciclo principale ${id}`, tipo: "principale", fase: null, ...m }], 0);
}

function componi(sorgente, agenti, metaIlleggibili) {
  agenti.sort((a, b) => b.entrata_totale - a.entrata_totale);
  const r = riassumi(agenti);
  const righeRotte = agenti.reduce((s, a) => s + a.righe_rotte, 0);
  const senzaUsage = agenti.filter((a) => a.turni === 0).map((a) => a.id);
  if (r.totali.agenti_misurati === 0) {
    // Il motivo dice DOVE sono finite le righe con usage, se c'erano. «Nessuna riga con usage»
    // detto di un transcript di subagente passato a --sessione (125 righe con usage, tutte
    // laterali) manda chi legge a cercare il guasto nel posto sbagliato.
    const laterali = agenti.reduce((s, a) => s + a.righe_laterali_escluse, 0);
    const sintetici = agenti.reduce((s, a) => s + a.messaggi_sintetici, 0);
    const scartate = [];
    if (laterali) scartate.push(`${laterali} righe con usage escluse perché laterali, cioè isSidechain: sono di un subagente e non del ciclo principale, per un subagente usa --dir sulla sua cartella`);
    if (sintetici) scartate.push(`${sintetici} messaggi sintetici saltati (errori e interruzioni, non chiamate vere)`);
    if (righeRotte) scartate.push(`${righeRotte} righe JSON rotte`);
    const cosa = laterali || sintetici ? "nessun turno misurabile" : "nessuna riga con usage";
    const perche = scartate.length ? ` (${scartate.join("; ")})` : "";
    return { cieco: true, motivo: `${agenti.length} transcript letti ma ${cosa}${perche}: zero misure non è un verde`, righe_rotte: righeRotte };
  }
  return {
    cieco: false,
    sorgente,
    agenti: agenti.map((a) => ({ ...a, ...contatori(a) })),
    ...r,
    righe_rotte: righeRotte,
    meta_illeggibili: metaIlleggibili,
    agenti_senza_usage: senzaUsage,
    avvertenza: AVVERTENZA_LIMITE,
  };
}

/**
 * Trova la cartella di un workflow sotto la radice dei progetti. Claude Code la mette in
 * `<progetto>/<sessione>/subagents/workflows/<runId>`; guardo anche un livello sopra per i formati
 * più vecchi. Prima l'id esatto; se non c'è, chi comincia con l'id dato (basta copiarne l'inizio).
 *
 * UNA CARTELLA CHE NON SI LEGGE NON È UNA CARTELLA VUOTA. Che `subagents/workflows` non esista è il
 * caso normale (quasi tutte le sessioni non hanno workflow): lì non c'è niente da trovare. Ogni altro
 * errore — permessi, un collegamento che gira in tondo, un disco che non risponde — vuol dire che una
 * parte della radice non l'ho guardata, e proprio lì poteva stare l'id esatto, o la seconda cartella
 * che rende ambiguo un inizio d'id. Un «trovato» o un «non trovato» calcolato su una ricerca a metà ha
 * la stessa faccia di uno completo: per questo lancio un errore col nome della cartella, e chi mi
 * chiama esce cieco (2) invece di misurare la cartella sbagliata.
 */
export function trovaWorkflow(radice, runId) {
  if (!runId || !existsSync(radice)) return [];
  const contenitori = [];
  const illeggibili = [];
  const sottocartelle = (d) => {
    let voci;
    try {
      voci = readdirSync(d, { withFileTypes: true });
    } catch (e) {
      if (e?.code !== "ENOENT" && e?.code !== "ENOTDIR") illeggibili.push(`${d} (${e?.code || e?.message || e})`);
      voci = [];
    }
    return voci.filter((e) => e.isDirectory()).map((e) => join(d, e.name));
  };
  for (const progetto of sottocartelle(radice)) {
    contenitori.push(join(progetto, "subagents", "workflows"));
    for (const sessione of sottocartelle(progetto)) contenitori.push(join(sessione, "subagents", "workflows"));
  }
  const esatti = [];
  const perInizio = [];
  for (const c of contenitori) {
    for (const d of sottocartelle(c)) {
      const nome = basename(d);
      if (nome === runId) esatti.push(d);
      else if (nome.startsWith(runId)) perInizio.push(d);
    }
  }
  if (illeggibili.length) {
    throw new Error(
      `${illeggibili.length} cartelle sotto ${radice} non si leggono: ${illeggibili.join(", ")}. ` +
        "La ricerca sarebbe a metà, e un risultato a metà sembra completo: se conosci la cartella del workflow, passala con --dir",
    );
  }
  return esatti.length ? esatti : perInizio;
}

const punti = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export function aVoce(esito) {
  const out = [];
  const { totali: t, contatori: c, contesto_fisso: f } = esito;
  out.push(`🧮 CONTO TOKEN — ${esito.sorgente.modo} ${esito.sorgente.percorso}`);
  out.push("");
  for (const a of esito.agenti) {
    const nome = `${String(a.etichetta).slice(0, 36).padEnd(36)} ${String(a.tipo || "-").slice(0, 18).padEnd(18)}`;
    if (!a.turni) {
      out.push(`${nome} nessun messaggio con usage`);
      continue;
    }
    out.push(
      `${nome} turni ${String(a.turni).padStart(3)} · primo turno ${punti(a.primo_turno).padStart(9)} · ` +
        `scritti cache ${punti(a.scritti_cache).padStart(10)} · letti cache ${punti(a.letti_cache).padStart(11)} · ` +
        `non in cache ${punti(a.input).padStart(7)} · uscita ${punti(a.uscita).padStart(8)}`,
    );
  }
  out.push("");
  out.push(
    `TOTALE ${t.agenti_misurati} agenti misurati su ${t.agenti} · turni ${punti(t.turni)} · entrata ${punti(t.entrata_totale)} ` +
      `(scritti in cache ${punti(t.scritti_cache)}, letti dalla cache ${punti(t.letti_cache)}, non in cache ${punti(t.input)}) · uscita ${punti(t.uscita)}`,
  );
  out.push(`  con le letture dalla cache:  ${punti(c.con_letture_cache)}`);
  out.push(`  senza le letture dalla cache: ${punti(c.senza_letture_cache)}  (entrata non in cache + scritture in cache + uscita)`);
  if (f.quota !== null) {
    out.push(`  contesto fisso (STIMA, un tetto): ${punti(f.token)} token, il ${(f.quota * 100).toFixed(0)}% dell'entrata — ${f.come}; sbaglia ${f.direzione}`);
  }
  const fasi = Object.entries(esito.per_fase);
  if (fasi.length > 1) {
    out.push("");
    out.push("PER FASE");
    for (const [nome, v] of fasi) {
      out.push(`  ${nome.padEnd(20)} ${String(v.agenti).padStart(4)} agenti · ${String(v.turni).padStart(5)} turni · senza letture ${punti(v.senza_letture_cache).padStart(11)} · con letture ${punti(v.con_letture_cache).padStart(13)}`);
    }
  }
  if (esito.righe_rotte) out.push(`⚠️  ${esito.righe_rotte} righe JSON rotte saltate (contate qui, non nei totali)`);
  if (esito.meta_illeggibili) out.push(`⚠️  ${esito.meta_illeggibili} meta.json illeggibili: quegli agenti hanno l'id al posto del nome`);
  if (esito.agenti_senza_usage.length) out.push(`⚠️  ${esito.agenti_senza_usage.length} transcript senza nessun usage: ${esito.agenti_senza_usage.join(", ")}`);
  out.push(`ℹ️  ${esito.avvertenza}`);
  return out.join("\n");
}

/** Legge `--chiave valore` o `--chiave=valore`. */
function argomento(argv, chiave) {
  const attaccato = argv.find((a) => a.startsWith(`${chiave}=`));
  if (attaccato) return attaccato.slice(chiave.length + 1);
  const i = argv.indexOf(chiave);
  if (i < 0) return undefined;
  const v = argv[i + 1];
  return v && !v.startsWith("--") ? v : "";
}

function main() {
  const argv = process.argv.slice(2);
  const JSON_MODE = argv.includes("--json");
  const cieco = (motivo) => {
    // Cieco non è verde: esco 2, e chi mi ha chiamato sa che non ho misurato niente.
    if (JSON_MODE) console.log(JSON.stringify({ ok: false, cieco: true, motivo }));
    else console.error(`⚪ CONTO TOKEN — ${motivo}`);
    process.exit(2);
  };
  const dir = argomento(argv, "--dir");
  const run = argomento(argv, "--workflow");
  const sessione = argomento(argv, "--sessione");
  const scelte = [dir, run, sessione].filter((v) => v !== undefined);
  if (scelte.length !== 1) cieco("serve esattamente uno fra --dir <cartella>, --workflow <runId>, --sessione <file.jsonl>");
  if (scelte[0] === "") cieco("l'opzione è stata data senza un valore");

  let esito;
  if (sessione !== undefined) esito = misuraSessione(sessione);
  else if (dir !== undefined) esito = misuraCartella(dir);
  else {
    const radice = process.env.CONTO_TOKEN_RADICE || join(homedir(), ".claude", "projects");
    let trovati;
    try {
      trovati = trovaWorkflow(radice, run);
    } catch (e) {
      cieco(e.message);
    }
    if (!trovati.length) cieco(`nessuna cartella di workflow «${run}» sotto ${radice}`);
    if (trovati.length > 1) cieco(`«${run}» è ambiguo, combacia con ${trovati.length} cartelle: ${trovati.join(", ")}`);
    esito = misuraCartella(trovati[0]);
    if (!esito.cieco) esito.sorgente = { modo: "workflow", percorso: trovati[0], run };
  }
  if (esito.cieco) cieco(esito.motivo);
  console.log(JSON_MODE ? JSON.stringify({ ok: true, ...esito }, null, 2) : aVoce(esito));
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
