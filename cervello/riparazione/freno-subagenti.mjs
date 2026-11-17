#!/usr/bin/env node
// 🛑 IL FRENO SUGLI AGENTI — un hook PreToolUse (matcher «Agent|Task|Workflow») che conta i subagenti aperti da
// ogni sessione di una campagna di riparazione e ferma quello di troppo.
//
// PERCHÉ ESISTE. Nell'onda 2 (13-15/11) il tetto di 12 subagenti per riparatore era scritto nella skill, e quattro
// sessioni su dodici l'hanno superato: R15 13, R16 14, R17 15, R19 14. Il costo dei riparatori per voce lavorata è
// passato da 1,45 $ a 4,16 $. Il conto in dollari arriva tardi, quello dei lanci no: qui si contano i lanci.
// pre-scrittura.mjs davanti a un Task pianta un'ancora, ma non conta niente.
//
// CHI HA UN TETTO. Solo le sessioni di una campagna, riconosciute dal loro ruolo. Il ruolo NON lo dichiara la
// sessione stessa (scorciatoia A1, «la carta scritta a mano»): lo scrive la regista nella prima riga del prompt
// con cui apre la sessione, `ruolo-freno: <ruolo>` (la riga la stampa la scheda), oppure lo dà l'ambiente
// (FRENO_RUOLO). Si legge UNA volta, al primo lancio, e resta fissato per tutta la sessione: un file letto dopo
// non lo può cambiare. Una sessione senza ruolo (l'AD, il giro) non ha tetto da qui.
//   riparatore-minori 6 · riparatore-gravi 8 · collaudatore 4 · controllore 4 · regia 2
// Lo strumento Workflow apre molti agenti con un lancio solo (R16 e R22 ne hanno aperti 4-5): per riparatori e
// collaudatori è bloccato del tutto.
//
// Uscita (contratto degli hook): 0 passa · 2 bloccato, con il motivo su stderr (Claude Code lo mostra all'agente).
// Senza session_id non si può contare: si blocca.
//
// Il contatore sta fuori dal deposito (FRENO_SUBAGENTI_DIR, predefinito <tmp>/freno-subagenti): un file per
// sessione, una riga per lancio, scritta in append. Due lanci nello stesso messaggio arrivano insieme: ognuno
// conta la sua posizione nel file, così il settimo resta il settimo anche quando partono in parallelo.

import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readFileSync, readSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const TETTI_FRENO = Object.freeze({
  "riparatore-minori": 6,
  "riparatore-gravi": 8,
  collaudatore: 4,
  controllore: 4,
  regia: 2,
});
export const SENZA_WORKFLOW = new Set(["riparatore-minori", "riparatore-gravi", "collaudatore"]);
export const STRUMENTI = new Set(["Agent", "Task", "Workflow"]);
const ID_VALIDO = /^[A-Za-z0-9_-]{1,128}$/;
const RIGA_RUOLO = /^[ \t>*-]*ruolo-freno:\s*([a-z-]+)\s*$/m;

/** Il ruolo dalla prima riga utile del prompt d'apertura. Un ruolo che non esiste vale come nessun ruolo. PURA. */
export function ruoloDalPrompt(testo) {
  const m = RIGA_RUOLO.exec(String(testo ?? ""));
  return m && Object.hasOwn(TETTI_FRENO, m[1]) ? m[1] : null;
}

/** Il primo messaggio scritto da una persona o da chi ha aperto la sessione (mai un risultato di strumento). PURA. */
export function primoPrompt(trascritto) {
  for (const riga of String(trascritto ?? "").split("\n")) {
    if (!riga.trim()) continue;
    let e;
    try { e = JSON.parse(riga); } catch { continue; }
    if (e?.type !== "user" || e.isMeta) continue;
    const c = e.message?.content;
    if (typeof c === "string") return c;
    if (Array.isArray(c)) {
      if (c.some((b) => b?.type === "tool_result")) continue;
      const testo = c.filter((b) => b?.type === "text").map((b) => b.text).join("\n");
      if (testo.trim()) return testo;
    }
  }
  return null;
}

/**
 * La decisione su un lancio. PURA.
 * @param {{ sessionId?: string, strumento: string, ruolo: string|null, posizione: number }} x
 *   posizione = il numero d'ordine di questo lancio nella sessione (1 il primo), contati anche quelli già bloccati.
 * @returns {{ esito: "passa"|"blocca", motivo: string }}
 */
export function decidiFreno({ sessionId, strumento, ruolo, posizione }) {
  if (!STRUMENTI.has(strumento)) return { esito: "passa", motivo: "non è un lancio di agenti" };
  if (!sessionId || !ID_VALIDO.test(String(sessionId))) {
    return { esito: "blocca", motivo: "🛑 freno sugli agenti: la chiamata non porta un session_id leggibile, e senza non si può contare. Bloccata." };
  }
  if (!ruolo) return { esito: "passa", motivo: "sessione senza ruolo di campagna: nessun tetto" };
  if (strumento === "Workflow" && SENZA_WORKFLOW.has(ruolo)) {
    return { esito: "blocca", motivo: `🛑 freno sugli agenti: un ${ruolo} non lancia Workflow (un lancio apre molti agenti insieme). Usa i programmi della campagna, oppure spingi il referto del lotto e fermati.` };
  }
  if (!Object.hasOwn(TETTI_FRENO, ruolo)) {
    return { esito: "blocca", motivo: `🛑 freno sugli agenti: il ruolo fissato per questa sessione («${ruolo}») non è nell'elenco, e non so quale tetto dargli. Bloccata.` };
  }
  const tetto = TETTI_FRENO[ruolo];
  if (posizione > tetto) {
    return { esito: "blocca", motivo: `🛑 freno sugli agenti: questo sarebbe il lancio numero ${posizione}, e il tetto di un ${ruolo} è ${tetto}. Spingi il referto del lotto e fermati.` };
  }
  return { esito: "passa", motivo: `lancio ${posizione} di ${tetto} (${ruolo})` };
}

// ── L'hook: legge stdin, fissa il ruolo una volta, prende la posizione, decide ──────────────────
const cartella = () => resolve(process.env.FRENO_SUBAGENTI_DIR || join(tmpdir(), "freno-subagenti"));

// Solo l'inizio del trascritto: il prompt d'apertura sta lì, e un trascritto lungo pesa decine di MB.
function inizioDel(file, byte = 512 * 1024) {
  const fd = openSync(file, "r");
  try { const b = Buffer.alloc(byte); const n = readSync(fd, b, 0, byte, 0); return b.subarray(0, n).toString("utf8"); } finally { closeSync(fd); }
}

function ruoloFissato(sid, dati) {
  const file = join(cartella(), `${sid}.ruolo`);
  if (existsSync(file)) return readFileSync(file, "utf8").trim();
  let ruolo = Object.hasOwn(TETTI_FRENO, process.env.FRENO_RUOLO || "") ? process.env.FRENO_RUOLO : null;
  if (!ruolo && dati.transcript_path) {
    try { ruolo = ruoloDalPrompt(primoPrompt(inizioDel(dati.transcript_path))); } catch { /* trascritto illeggibile: nessun ruolo */ }
  }
  // Senza ruolo non si scrive niente: una sessione qualunque non tocca il disco e non si blocca per un disco pieno.
  if (!ruolo) return null;
  mkdirSync(cartella(), { recursive: true });
  // «wx»: se due lanci arrivano insieme vince il primo che scrive, e l'altro rilegge quello.
  try { writeFileSync(file, ruolo, { flag: "wx" }); } catch { return readFileSync(file, "utf8").trim(); }
  return ruolo;
}

function prendiPosizione(sid) {
  const file = join(cartella(), `${sid}.lanci`);
  const segno = `${process.pid}-${process.hrtime.bigint()}-${Math.random().toString(36).slice(2)}`;
  appendFileSync(file, segno + "\n");
  const righe = readFileSync(file, "utf8").split("\n").filter(Boolean);
  return righe.indexOf(segno) + 1;
}

export function hook(testoStdin) {
  let dati;
  try { dati = JSON.parse(testoStdin || "{}"); } catch { dati = {}; }
  const strumento = String(dati.tool_name ?? "");
  if (!STRUMENTI.has(strumento)) return { codice: 0 };
  const sid = dati.session_id;
  if (!sid || !ID_VALIDO.test(String(sid))) {
    const d = decidiFreno({ sessionId: sid, strumento, ruolo: null, posizione: 0 });
    return { codice: 2, messaggio: d.motivo };
  }
  const ruolo = ruoloFissato(sid, dati);
  if (!ruolo) return { codice: 0 };
  const posizione = strumento === "Workflow" && SENZA_WORKFLOW.has(ruolo) ? 0 : prendiPosizione(sid);
  const d = decidiFreno({ sessionId: sid, strumento, ruolo, posizione });
  return d.esito === "blocca" ? { codice: 2, messaggio: d.motivo } : { codice: 0 };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let testo = "";
  try { testo = readFileSync(0, "utf8"); } catch { testo = ""; }
  let r;
  try { r = hook(testo); } catch (e) { r = { codice: 2, messaggio: `🛑 freno sugli agenti: non ho potuto contare (${e.message}). Bloccata.` }; }
  if (r.messaggio) process.stderr.write(r.messaggio + "\n");
  process.exitCode = r.codice;
}
