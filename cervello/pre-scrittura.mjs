#!/usr/bin/env node
// ✋ PRIMA CHE ACCADA (AR-525) — l'unico freno che parla mentre la mossa è ancora annullabile.
//
// PERCHÉ ESISTE. Tutte le guardie di questa macchina arrivano DOPO. Il sorvegliante parla quando il
// file è già scritto, il cancello del lotto quando il lavoro è finito, quello dello Stop quando dico
// «ho finito». È una scelta giusta e dichiarata — un freno che ferma un Edit a metà lavoro viene
// spento in un giorno — ma lascia scoperte due cose che dopo non si riparano più:
//
//   ① LE SCRITTURE CHE NESSUNA GUARDIA VEDE. Il sorvegliante è agganciato a Edit/Write/MultiEdit e,
//      dal 3/8, ai comandi di shell (AR-502). Restano fuori gli strumenti MCP che scrivono
//      DIRETTAMENTE sul mondo: un file creato su GitHub via `create_or_update_file` o `push_files`
//      non passa né dalla guardia in tempo reale né dal `pre-commit` — cioè né dal controllo sulle
//      malattie, né da quello sui segreti, né dal perimetro di main. In una sessione remota come
//      quelle in cui lavoro adesso quello NON è il canale raro: è il canale principale.
//   ② LE MOSSE CHE SPENGONO LE GUARDIE. `git commit --no-verify` salta in un colpo i quattro cancelli
//      del pre-commit (sintassi shell, sintassi JavaScript, perimetro di main, segreti). Cancellare
//      un file che i registri dichiarano difesa toglie un freno lasciando il suo conteggio intatto —
//      il sorvegliante lo trova, ma DOPO, quando il file non c'è già più.
//
// COSA FA. Legge la mossa prima che parta e, nei casi qui sotto, chiede: `permissionDecision: "ask"`.
// Non nega mai da solo.
//
// PERCHÉ «CHIEDI» E NON «NEGA», che è la decisione di taratura di tutto il file. Un `deny` scritto da
// me è una regola che Nicola non ha firmato e che si scopre solo quando blocca qualcosa di legittimo:
// `--no-verify` È il bypass di emergenza dichiarato dal pre-commit, e togliergli la valvola vorrebbe
// dire spegnere il freno intero il giorno in cui serve davvero. `ask` invece mette la decisione dove
// deve stare — da Nicola — e costa un clic. Il potere di dire di no resta suo, quello di accorgersene
// diventa mio.
//
//   ① `git commit --no-verify`      → salta i quattro cancelli del pre-commit
//   ② cancellazione di una DIFESA   → un file che lezioni, mutazioni o hook dichiarano freno
//   ③ `git push --force` su main    → riscrive una storia che altri hanno già letto
//   ④ scrittura via strumento MCP   → non passa da nessuna guardia, né prima né dopo
//
// E UNA MOSSA CHE NON CHIEDE NIENTE, ma è la ragione per cui questo file è agganciato anche al `Task`:
// quando parte un senior, qui si pianta l'ancora del suo lavoro (commit + scatto della guardia + ora).
// Senza, il cancello dei senior non avrebbe modo di sapere DA DOVE guardare — e misurerebbe come
// «lavoro del senior» tutto ciò che c'era prima, cioè la stessa malattia del perimetro largo che il
// 4/8 mi ha fatto contestare sette file scritti tre giorni prima.
//
// COSA NON FA. Non legge il contenuto di ciò che sto per scrivere (l'evento porta gli argomenti dello
// strumento, non l'effetto): non sa se quella scrittura introduca una malattia — quello resta al
// sorvegliante, dopo, dove è misurabile. Non giudica se la mossa sia giusta. Quattro forme meccaniche,
// e dove passa un «forse» qui si tace.
//
// COPERTURA DICHIARATA: i comandi li riconosce dal TESTO. Un `--no-verify` costruito a runtime, letto
// da una variabile o nascosto in uno script che chiamo, non lo vedo. Un elenco di forme già pagate,
// non una teoria della shell — è la stessa copertura dichiarata di misura-cieca.mjs.
//
// Uso:
//   node cervello/pre-scrittura.mjs --hook          # per l'hook PreToolUse: evento da stdin
//   node cervello/pre-scrittura.mjs "<comando>"     # cosa direbbe su questo comando
//
// Uscita: 0 sempre in forma hook (la decisione viaggia nel JSON, non nel codice d'uscita)
//
// 🟢 Sola lettura sul repo. L'unica scrittura è l'ancora del senior, fuori da git (`_tmp_*`).

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BATTITO, difeseDelRepo } from "./sorvegliante.mjs";
import { annota, chiudi } from "./libro-mastro.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);

/** L'ancora del lavoro dei senior. Fuori da git, come tutte le misure di sessione (AR-464). */
export const ANCORA_SENIOR = "cervello/_tmp_senior-ancora.json";

/**
 * Gli strumenti che scrivono sul mondo SENZA passare da nessuna guardia di questa macchina.
 *
 * Riconosciuti per FORMA del nome, non per elenco chiuso: `mcp__<server>__<verbo>` dove il verbo dice
 * «sto scrivendo». Un elenco di nomi esatti sarebbe il perimetro dedotto di AR-347 — resterebbe
 * indietro al primo strumento nuovo, ed è proprio il caso in cui restare indietro non si vede.
 */
export const VERBI_DI_SCRITTURA = /(create|update|delete|push|write|merge|apply|deploy|remove|add)/i;

/** Riconosce uno strumento MCP dal nome, che per contratto comincia così. */
export const E_MCP = /^mcp__/;

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — puro. Riceve la mossa già letta e torna la decisione: così una prova può eseguire ogni
// caso senza avere né un repo né un evento vero.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La decisione su una mossa.
 *
 * @param {object} m
 * @param {string} m.strumento   nome dello strumento (Bash, Edit, mcp__github__push_files, …)
 * @param {string} m.comando     il testo del comando, quando lo strumento è Bash
 * @param {Map<string,string>} m.difese  percorso → perché qualcuno lo dichiara difesa
 * @returns {{chiedi:boolean, motivo:string|null, classe:string|null}}
 */
export function decidi({ strumento = "", comando = "", difese = new Map() } = {}) {
  const no = { chiedi: false, motivo: null, classe: null };

  // ④ Uno strumento MCP che scrive. Vale PRIMA degli altri perché è l'unico caso in cui, se taccio,
  //    non parlerà più nessuno: dopo non resta nemmeno un diff locale da guardare.
  if (E_MCP.test(strumento)) {
    const verbo = strumento.split("__").pop() || "";
    if (VERBI_DI_SCRITTURA.test(verbo)) {
      return {
        chiedi: true,
        classe: "scrittura-senza-guardia",
        motivo:
          `«${strumento}» scrive fuori da questa copia: non passa dal sorvegliante (che guarda solo Edit/Write e i comandi) ` +
          `né dal pre-commit (sintassi, perimetro di main, segreti). Se quel contenuto va anche committato qui, fallo da qui: ` +
          `così almeno una guardia lo vede.`,
      };
    }
    return no;
  }

  if (!comando || strumento !== "Bash") return no;
  const c = String(comando);

  // ① Il bypass dei quattro cancelli del pre-commit.
  if (/\bgit\s+commit\b[^\n]*(--no-verify|(?:^|\s)-n(?:\s|$))/.test(c)) {
    return {
      chiedi: true,
      classe: "cancelli-saltati",
      motivo:
        "questo commit salta i quattro cancelli del pre-commit: sintassi shell, sintassi JavaScript, perimetro di main e segreti. " +
        "Il quarto è quello che conta: è l'unico posto dove un token vero viene fermato prima di entrare nella storia.",
    };
  }

  // ③ La storia riscritta sotto i piedi di chi l'ha già letta.
  if (/\bgit\s+push\b[^\n]*(--force\b|--force-with-lease\b|\s-f\b)/.test(c) && /\bmain\b/.test(c)) {
    return {
      chiedi: true,
      classe: "storia-riscritta",
      motivo: "un push forzato su main riscrive commit che il Pannello e le altre copie hanno già letto: quello che era vero un minuto fa smette di esistere.",
    };
  }

  // ② Una difesa cancellata. Solo su percorsi che qualcun ALTRO dichiara freno: un elenco scritto
  //    qui sarebbe il perimetro dedotto di AR-347 dentro il file che lo deve impedire.
  if (/\b(rm|git\s+rm|unlink|shred)\b/.test(c)) {
    for (const [p, perche] of difese) {
      if (!c.includes(p)) continue;
      return {
        chiedi: true,
        classe: "difesa-cancellata",
        motivo:
          `«${p}» ${perche}. Cancellandolo il conteggio dei freni resta identico e la difesa non esiste più: ` +
          `nessuno se ne accorgerà, perché non resta niente che possa diventare rosso.`,
      };
    }
  }

  return no;
}

/** La busta della decisione. `null` quando non c'è niente da chiedere: il silenzio è la norma. */
export function bustaDecisione(d = {}) {
  if (!d.chiedi) return null;
  return JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: `✋ ${d.classe} — ${d.motivo}`,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// L'ANCORA DEL SENIOR — la parte che non chiede niente e serve al cancello dei senior.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * L'ancora aggiornata quando parte un senior.
 *
 * `aperti` conta i senior in volo: l'evento non dice QUALE senior sta finendo, quindi con più di uno
 * il perimetro è per forza condiviso — e il cancello dei senior lo dichiara invece di fingere
 * precisione. Un numero onesto e una frase onesta valgono più di un'attribuzione inventata.
 */
export function apriSenior(precedente = null, { commit = null, scatto = 0, quando = "" } = {}) {
  if (precedente && Number(precedente.aperti) > 0) {
    return { ...precedente, aperti: Number(precedente.aperti) + 1 };
  }
  return { commit, scatto, quando, aperti: 1 };
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O
// ─────────────────────────────────────────────────────────────────────────────

function leggiJson(percorso) {
  try {
    return JSON.parse(readFileSync(join(REPO, percorso), "utf8"));
  } catch {
    return null;
  }
}

function headOra() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

async function leggiStdin() {
  const pezzi = [];
  for await (const p of process.stdin) pezzi.push(p);
  return Buffer.concat(pezzi).toString("utf8");
}

/** Il testo del comando dagli argomenti dello strumento: `command` per Bash, niente per il resto. */
export function comandoDi(toolInput = {}) {
  return typeof toolInput?.command === "string" ? toolInput.command : "";
}

async function main() {
  const argv = process.argv.slice(2);
  const hook = argv.includes("--hook");

  if (!hook) {
    const comando = argv.find((a) => !a.startsWith("--")) || "";
    const d = decidi({ strumento: "Bash", comando, difese: difeseDelRepo() });
    if (!d.chiedi) {
      console.log("✅ niente da chiedere su questo comando.");
      process.exit(0);
    }
    console.log(`✋ ${d.classe}\n   ${d.motivo}`);
    process.exit(0);
  }

  let ev = null;
  try {
    ev = JSON.parse(await leggiStdin());
  } catch {
    // Nessun payload leggibile: non invento una decisione. Un freno che chiede senza aver letto la
    // mossa insegna a cliccare «sì» senza guardare, che è il modo più veloce per renderlo inutile.
    process.exit(0);
  }

  const strumento = ev?.tool_name || "";

  // Il libro mastro: da qui in poi ogni uscita chiude la sua riga. Aprirla senza chiuderla
  // significherebbe dichiarare questa guardia morta a metà, che è il difetto opposto.
  const mastro = annota({ guardia: "pre-scrittura", evento: "PreToolUse", strumento, bersaglio: comandoDi(ev?.tool_input) });

  // Parte un senior: pianto l'ancora del suo lavoro e non chiedo niente.
  if (strumento === "Task") {
    const b = leggiJson(BATTITO);
    const nuova = apriSenior(leggiJson(ANCORA_SENIOR), {
      commit: headOra(),
      scatto: Number(b?.scatto) || 0,
      quando: new Date().toISOString(),
    });
    try {
      writeFileSync(join(REPO, ANCORA_SENIOR), JSON.stringify(nuova));
    } catch {
      // Senza ancora il cancello dei senior guarderà un perimetro largo e lo dirà: peggiore, non falso.
    }
    chiudi(mastro, "ok", "parte un senior: ancora piantata, niente da chiedere");
    process.exit(0);
  }

  const d = decidi({ strumento, comando: comandoDi(ev?.tool_input), difese: difeseDelRepo() });
  const busta = bustaDecisione(d);
  if (busta) console.log(busta);
  chiudi(mastro, d.chiedi ? "chiede" : "ok", d.chiedi ? d.motivo : "");
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
