#!/usr/bin/env node
// 🎯 L'INTENTO DEL TURNO — il momento in cui Nicola mi chiede una cosa, che finora non guardava nessuno.
//
// PERCHÉ ESISTE. Due difetti veri, tutti e due misurati, e tutti e due vivono nello stesso istante:
// quello in cui arriva un messaggio di Nicola.
//
//   ① IL PERIMETRO CHE NON C'È ANCORA. Il cancello dello Stop misura «questo turno» grazie a
//      un'ancora (AR-496) che però la pianta LUI, alla fine del primo turno chiuso. Quindi il primo
//      turno di ogni copia nuova — cioè ogni sessione cloud, che nasce da un clone fresco — non ha
//      nessuna ancora, e il perimetro ripiega su tutto il ramo. Non è teoria: il 4/8 mi è successo
//      dal vivo. Il cancello mi ha contestato sette file scritti tre giorni prima, in commit già
//      mergiati, che in quel turno non avevo nemmeno aperto. Dei suoi otto ❌, uno solo era mio.
//      Un freno che sette volte su otto parla di lavoro altrui è un freno che si impara a scorrere.
//      La cura non è allargare le esenzioni: è piantare l'ancora quando il turno COMINCIA, che è
//      l'unico momento in cui si sa davvero dove comincia.
//
//   ② LA DERIVA SENZA UN DA-DOVE. Il controllo ⑨ del sorvegliante conta le zone che un lavoro
//      tocca e chiede «è ancora UN lavoro solo?». È una domanda onesta e monca: nessuna macchina sa
//      qual era l'intenzione, dice il commento accanto. Vero finché l'intenzione non la si scrive.
//      Qui la si scrive: il testo con cui il turno è partito resta su disco, e da lì in poi «per cosa
//      ero partito» è una cosa che si può rileggere invece che ricordare.
//
// COSA FA, in tre mosse meccaniche:
//   ① SEME DELL'ANCORA — se non c'è un'ancora del turno usabile, ne pianta una su HEAD adesso.
//      Scrive lo STESSO file del cancello dello Stop, nello stesso formato: una casa sola per lo
//      stesso fatto, mai due (è la regola AR-102 applicata a un file di lavoro).
//   ② SEGNA L'INTENTO — il testo del messaggio, troncato, con l'ora e il commit di partenza.
//   ③ PARLA, ma solo se ha qualcosa da dire: le voci gravi che il sorvegliante ha ripetuto e che
//      sono ancora vive, e la consegna di contesto lasciata da una compressione (memoria-guardia).
//
// PERCHÉ IL SEME NON SPOSTA MAI L'ANCORA ESISTENTE, ed è la riga più importante del file. Il
// cancello dello Stop si rifiuta di spostare l'ancora quando ha appena bloccato (`siPiantaAncora`):
// senza quella regola il lavoro per cui ha bloccato uscirebbe dal perimetro al giro dopo, e il freno
// si scavalcherebbe da solo. Se qui ripiantassi a ogni messaggio, quella difesa morirebbe — e
// morirebbe in silenzio, perché il conteggio dei freni resterebbe identico. È esattamente la forma
// «difesa-rimossa» che il sorvegliante cerca nei diff altrui. Quindi: si semina dove è vuoto, non si
// sposta ciò che è pieno.
//
// COSA NON FA. Non blocca MAI un messaggio di Nicola (l'evento lo permetterebbe: exit 2 rifiuta il
// prompt). Un freno che si mette fra Nicola e la macchina non è un freno, è un guasto. Non giudica
// l'intento, non lo confronta col lavoro — quel confronto è mio, ad alta voce, e questo file gli dà
// solo il testo su cui farlo.
//
// COPERTURA DICHIARATA: il seme funziona solo dove c'è git e un HEAD. In una copia senza commit
// (repo appena nato) non pianta niente e lo dice nel file, invece di scrivere un'ancora finta.
//
// Uso:
//   node cervello/intento-turno.mjs --hook     # per l'hook UserPromptSubmit: legge l'evento da stdin
//   node cervello/intento-turno.mjs            # che intento è registrato adesso, e da dove guardo
//
// Uscita: 0 sempre in forma hook · fuori: 0 = c'è un intento registrato · 2 = non ho potuto misurare
//
// 🟢 Sola lettura sul repo. Le uniche scritture sono i due file di lavoro fuori da git (`_tmp_*`):
//    l'ancora del turno e l'intento. Verificare non deve costare un diff (AR-464).

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BATTITO, vociInsistenti } from "./sorvegliante.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);

/** L'ancora del turno: STESSO file del cancello dello Stop. Importarne il nome invece di riscriverlo
 *  sarebbe meglio ancora, ma `cancello-stop.mjs` importa questo modulo a sua volta e il giro si
 *  chiuderebbe; il nome sta qui una volta sola e la prova lo confronta col suo. */
export const ANCORA = "cervello/_tmp_stop-ancora.json";

/** Dove vive l'intento. Fuori da git: è un fatto del turno, non della storia. */
export const INTENTO = "cervello/_tmp_intento-turno.json";

/** La consegna che una compressione del contesto lascia indietro (memoria-guardia --consegna). */
export const CONSEGNA = "cervello/_tmp_consegna-contesto.json";

/** Quanto del messaggio tengo. Serve a ricordare di cosa si trattava, non a riprodurlo: un prompt
 *  lungo intero renderebbe il file di lavoro più grande del lavoro. */
export const MAX_INTENTO = 600;

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — funzioni pure. Nessun git, nessun disco: le prove eseguono le DECISIONI, non la forma
// del codice che le prende (è la ragione per cui `siPiantaAncora` sta fuori da `main()` nel fratello).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Si semina l'ancora?
 *
 * Sì solo dove è vuoto: assente, o presente ma non più antenato di HEAD (dopo un rebase racconta un
 * ramo che non esiste più). Mai al posto di una viva — vedi il perché in testa: quella è la difesa
 * che impedisce al cancello di scavalcarsi da solo.
 */
export function siSemina({ ancora = null, ancoraUsabile = false, head = null } = {}) {
  if (!head) return false;
  if (ancora && ancoraUsabile) return false;
  return true;
}

/** Il testo dell'intento, ridotto a ciò che serve per riconoscerlo fra un'ora. */
export function riduci(prompt = "", max = MAX_INTENTO) {
  const pulito = String(prompt).replace(/\s+/g, " ").trim();
  return pulito.length > max ? `${pulito.slice(0, max)}…` : pulito;
}

/**
 * La busta che arriva al modello all'inizio del turno.
 *
 * Tace quando non c'è niente: un avvisatore che parla a ogni messaggio viene spento entro la
 * settimana (L-2026-0730-533), e qui parlerebbe a OGNI messaggio di Nicola — il posto peggiore
 * dove fare rumore. Parla in due casi soli, ed entrambi sono roba che altrimenti si perde:
 *   · voci gravi che mi sono state ripetute e sono ancora lì (dopo una compressione del contesto io
 *     non le ricordo più, ma il registro sì);
 *   · una consegna lasciata da una compressione, cioè quello che stavo facendo prima di dimenticarlo.
 */
export function bustaApertura({ insistenti = [], consegna = null, guasti = [] } = {}) {
  const righe = [];
  // I guasti PRIMA di tutto: se non sono riuscito a piantare l'ancora, il perimetro del cancello
  // sarà sbagliato fra un'ora e nessuno saprà perché. È la porzione non scritta che arriva al
  // verdetto invece di sparire nel `catch`.
  for (const g of guasti) righe.push(`⚪ non sono riuscito a scrivere ${g}\n   ↳ il perimetro di questo turno sarà quello largo: quando il cancello dirà «guardo tutto il ramo», il motivo è questo.`);
  for (const v of insistenti.slice(0, 3)) {
    righe.push(`❌ ${v.file} — ${v.cosa}\n   ↳ me l'ero già detto ${v.n} volte e sta ancora lì: o la riparo, o la dichiaro esente col perché scritto.`);
  }
  if (insistenti.length > 3) righe.push(`   …e altre ${insistenti.length - 3}: node cervello/sorvegliante.mjs`);
  if (consegna?.intento) {
    righe.push(`🧭 prima della compressione stavo lavorando a: «${consegna.intento}»`);
    if (Array.isArray(consegna.file) && consegna.file.length) {
      righe.push(`   file aperti allora: ${consegna.file.slice(0, 6).join(", ")}${consegna.file.length > 6 ? ` (+${consegna.file.length - 6})` : ""}`);
    }
  }
  if (!righe.length) return null;
  return JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: ["🎯 PRIMA DI PARTIRE — cose rimaste aperte da prima di questo messaggio:", ...righe].join("\n"),
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O — sottile per scelta.
// ─────────────────────────────────────────────────────────────────────────────

function git(args) {
  return execFileSync("git", args, { cwd: REPO, encoding: "utf8" }).trim();
}

/** HEAD adesso, o `null` se qui non c'è ancora nessun commit (e allora non invento un'ancora). */
function head() {
  try {
    return git(["rev-parse", "HEAD"]);
  } catch {
    return null;
  }
}

/** L'ancora com'è adesso: c'è, ed è ancora un antenato di HEAD? Stessa misura del cancello. */
function ancoraOra() {
  let commit = null;
  try {
    commit = JSON.parse(readFileSync(join(REPO, ANCORA), "utf8")).commit || null;
  } catch {
    return { ancora: null, ancoraUsabile: false };
  }
  if (!commit) return { ancora: null, ancoraUsabile: false };
  try {
    git(["merge-base", "--is-ancestor", commit, "HEAD"]);
    return { ancora: commit, ancoraUsabile: true };
  } catch {
    return { ancora: commit, ancoraUsabile: false };
  }
}

function leggiJson(percorso) {
  try {
    return JSON.parse(readFileSync(join(REPO, percorso), "utf8"));
  } catch {
    return null;
  }
}

/**
 * Scrive un file di lavoro. Torna `null` se è andata, il motivo se non è andata.
 *
 * Il motivo TORNA INDIETRO e non muore qui: un `catch` che restituisce `false` e un chiamante che
 * non lo guarda sono la malattia `fonte-troncata-letta-per-intera` — «non sono riuscito a scrivere»
 * diventa indistinguibile da «è andata bene», e il turno dopo il perimetro sarebbe sbagliato senza
 * che nessuno sappia perché. L'ha trovata la spazzata dei fratelli su queste righe, appena scritte.
 */
function scrivi(percorso, dati) {
  try {
    writeFileSync(join(REPO, percorso), JSON.stringify(dati));
    return null;
  } catch (e) {
    return `${percorso}: ${String(e.message).split("\n")[0]}`;
  }
}

async function leggiStdin() {
  const pezzi = [];
  for await (const p of process.stdin) pezzi.push(p);
  return Buffer.concat(pezzi).toString("utf8");
}

async function main() {
  const argv = process.argv.slice(2);
  const hook = argv.includes("--hook");

  let prompt = "";
  if (hook) {
    try {
      const ev = JSON.parse(await leggiStdin());
      prompt = ev?.prompt || "";
    } catch {
      // Nessun payload: registro comunque il turno con un intento vuoto. Sapere QUANDO è cominciato
      // vale già la metà del mestiere di questo file — è quella metà che sistema il perimetro.
    }
  }

  const h = head();
  const { ancora, ancoraUsabile } = ancoraOra();

  if (hook) {
    const guasti = [];
    if (siSemina({ ancora, ancoraUsabile, head: h })) {
      const g = scrivi(ANCORA, { commit: h, quando: new Date().toISOString(), da: "intento-turno" });
      if (g) guasti.push(g);
    }
    const gi = scrivi(INTENTO, { quando: new Date().toISOString(), commit: h, intento: riduci(prompt) });
    if (gi) guasti.push(gi);

    let insistenti = [];
    const b = leggiJson(BATTITO);
    if (b) insistenti = vociInsistenti(b.viste || {}, Number(b.scatto) || 0);
    const busta = bustaApertura({ insistenti, consegna: leggiJson(CONSEGNA), guasti });
    if (busta) console.log(busta);
    process.exit(0);
  }

  const i = leggiJson(INTENTO);
  if (!i) {
    console.log("⚪ nessun intento registrato in questa copia: l'hook non è mai scattato qui, e non saperlo non è un verde.");
    process.exit(2);
  }
  console.log(`🎯 INTENTO DEL TURNO — registrato ${i.quando}`);
  console.log(`   «${i.intento || "(vuoto: l'evento non portava il testo)"}»`);
  console.log(`   il turno è partito da ${i.commit ? i.commit.slice(0, 8) : "(nessun commit)"}`);
  const a = leggiJson(ANCORA);
  if (a?.commit) console.log(`   perimetro del cancello: da ${a.commit.slice(0, 8)}${a.da === "intento-turno" ? " (seminata all'inizio del turno)" : " (piantata da una chiusura pulita)"}`);
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
