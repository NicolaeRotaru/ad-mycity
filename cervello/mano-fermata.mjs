#!/usr/bin/env node
// 🖐️ MANO FERMATA — l'errore già censito non si scrive: l'azione non parte proprio.
//
// PERCHÉ ESISTE (AR-519, Nicola 4/8): «voglio qualcos'altro che ti permetta di far bene il lavoro,
// che impedisca di fare errori». Fino a oggi la macchina scopriva un errore noto UN SECONDO DOPO
// averlo scritto: il sorvegliante gira dopo ogni modifica (PostToolUse), avvisa, e la riparazione è
// un tornare indietro. Questo file sta un passo prima — l'hook PreToolUse riceve il testo che sto
// PER scrivere, e se dentro c'è una malattia già censita in cervello/malattie.json, la scrittura
// viene rifiutata con il perché davanti agli occhi. Il danno non si ripara: non si fa.
//
// COSA BLOCCA, e la taratura è tutto: SOLO le malattie censite nel registro — le forme di difetto
// che questa casa ha già pagato, scritte con pattern precisi, estensioni e percorsi propri, ed
// esenzioni motivate. Niente euristiche, niente giudizi sul merito: un freno pre-scrittura che
// sbaglia una volta su dieci viene spento in un giorno (è la regola per cui il sorvegliante stesso
// scelse di NON bloccare a metà lavoro). Qui si blocca solo ciò che è certo.
//
// COME NE ESCO quando mi ferma — due uscite legittime, scritte nel rifiuto:
//   · curo la riga PRIMA di scriverla (il caso normale);
//   · dichiaro l'esenzione in cervello/malattie.json col PERCHÉ accanto (il caso raro e motivato).
// La terza via — scriverla e basta — è quella che questo freno esiste per chiudere.
//
// LA LOGICA NON È UNA COPIA. Il riconoscimento è ESATTAMENTE il controllo ① del sorvegliante
// (`sorveglia()` importata, con le sue esenzioni, i suoi percorsi, il suo filtro dei commenti):
// due copie della stessa conoscenza divergono sempre — è la ragione per cui il registro è UNO.
//
// CABLAGGIO: hook `PreToolUse` su `Edit|Write|MultiEdit` in `.claude/settings.json`. Quel file è
// nel deny-list della macchina (giustamente): l'aggancio è 🟡 in AZIONI-IN-ATTESA, firma di Nicola.
//
// Uso:
//   node cervello/mano-fermata.mjs --hook           # per l'hook PreToolUse (stdin JSON, SEMPRE exit 0)
//   node cervello/mano-fermata.mjs --prova <file>   # cosa direbbe su un file già su disco
//   node cervello/mano-fermata.mjs --cablaggio      # i due hook della prevenzione sono cablati in
//       settings.json? 0 = sì (AR-519 chiudibile) · 1 = no — è la prova che auto-fix esegue per
//       chiudere la scheda da solo il giorno in cui Nicola incolla lo snippet della card in coda.
//
// 🟢 Sola lettura: legge il registro malattie, non scrive niente, non tocca git. In caso di
//    QUALSIASI errore interno lascia passare: un freno rotto che blocca ogni scrittura è il modo
//    più veloce di farsi spegnere — fail-open dichiarato, il sorvegliante a valle guarda comunque.

import { readFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { righeDiFileNuovo, sorveglia } from "./sorvegliante.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — funzioni pure: un test le esegue su testi finti, un mutante le può accecare.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Le malattie censite che il testo IN ARRIVO contiene. Riusa il controllo ① del sorvegliante:
 * stesse esenzioni (SALTA_MALATTIE, fixture), stessi filtri (estensioni, percorsi, commenti).
 * Il numero di riga è relativo al testo che stavo per scrivere, non al file: è l'unico che esiste.
 */
export function giudizioScrittura({ file = "", testo = "", malattie = [] } = {}) {
  const aggiunte = righeDiFileNuovo(String(testo)) || [];
  if (!aggiunte.length) return [];
  // I registri che qui non servono (mutanti, difese) restano vuoti: i loro «motivi» di cecità
  // riguardano controlli che questo freno non usa, e le voci si filtrano comunque per classe.
  const { voci } = sorveglia({ toccati: [{ file, aggiunte, contenuto: null }], malattie });
  return voci.filter((v) => v.classe === "malattia-nuova");
}

/**
 * La busta per l'hook PreToolUse: `null` = lascia scrivere (il silenzio è la risposta giusta),
 * altrimenti il JSON che RIFIUTA la scrittura con il perché e le due uscite legittime.
 */
export function bustaManoFermata(voci = [], file = "") {
  if (!voci.length) return null;
  const righe = voci.slice(0, 3).map((v) => `· riga ${v.riga} del testo nuovo — ${v.cosa}\n  perché è grave: ${v.perche}`);
  const testo =
    `🖐️ MANO FERMATA — non ho scritto su ${file}: il testo che stavo per mettere contiene ${voci.length} malattia/e già censita/e.\n` +
    righe.join("\n") +
    (voci.length > 3 ? `\n· …e altre ${voci.length - 3}.` : "") +
    `\n→ due uscite legittime: cura la riga PRIMA di scriverla, oppure dichiara l'esenzione in cervello/malattie.json col PERCHÉ scritto accanto. Scriverla uguale non è una delle due.`;
  return JSON.stringify({
    hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: testo },
  });
}

/** Il testo che una chiamata Edit/Write/MultiEdit sta per aggiungere. `null` = non è una scrittura. */
export function testoInArrivo(toolInput = {}) {
  if (typeof toolInput.content === "string") return toolInput.content; // Write: il file intero
  if (typeof toolInput.new_string === "string") return toolInput.new_string; // Edit: il pezzo nuovo
  if (Array.isArray(toolInput.edits)) {
    const pezzi = toolInput.edits.map((e) => e?.new_string).filter((s) => typeof s === "string");
    return pezzi.length ? pezzi.join("\n") : null; // MultiEdit: tutti i pezzi nuovi
  }
  return null;
}

/**
 * I due agganci della prevenzione a monte dentro il testo di settings.json: ci sono?
 * Pura, sul TESTO e non sul JSON: se il file è malformato la risposta onesta è «non cablato»,
 * non un errore — e un test la esegue su testi finti di qualunque forma.
 */
export function cablaggioPresente(testoSettings = "") {
  const t = String(testoSettings);
  return {
    mano: /"PreToolUse"[\s\S]*mano-fermata\.mjs --hook/.test(t),
    scheda: /"UserPromptSubmit"[\s\S]*contesto-lezioni\.mjs --richiesta/.test(t),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O — stdin dell'hook, registro malattie. Fail-open su tutto: vedi testa del file.
// ─────────────────────────────────────────────────────────────────────────────

function leggiMalattie() {
  try {
    return JSON.parse(readFileSync(join(QUI, "malattie.json"), "utf8")).malattie || [];
  } catch {
    return []; // registro illeggibile: senza forme da cercare non si blocca nessuno (fail-open)
  }
}

async function leggiStdin() {
  const pezzi = [];
  for await (const p of process.stdin) pezzi.push(p);
  return Buffer.concat(pezzi).toString("utf8");
}

async function main() {
  const argv = process.argv.slice(2);

  if (argv.includes("--cablaggio")) {
    let testo = "";
    try {
      testo = readFileSync(join(REPO, ".claude", "settings.json"), "utf8");
    } catch {
      console.error("⚪ non riesco a leggere .claude/settings.json: non so se i freni siano cablati.");
      process.exit(2);
    }
    const c = cablaggioPresente(testo);
    if (c.mano && c.scheda) {
      console.log("✅ i due freni della prevenzione a monte sono cablati: mano-fermata (PreToolUse) e scheda su misura (UserPromptSubmit).");
      process.exit(0);
    }
    console.log(
      `❌ cablaggio incompleto: mano-fermata ${c.mano ? "✅" : "manca"} · scheda su misura ${c.scheda ? "✅" : "manca"} — lo snippet esatto è nella card #prevenzione-a-monte in AZIONI-IN-ATTESA.md (firma di Nicola).`,
    );
    process.exit(1);
  }

  if (argv.includes("--prova")) {
    const percorso = argv[argv.indexOf("--prova") + 1];
    if (!percorso) {
      console.error("uso: node cervello/mano-fermata.mjs --prova <file>");
      process.exit(2);
    }
    let testo = "";
    try {
      testo = readFileSync(join(REPO, percorso), "utf8");
    } catch {
      console.error(`⚪ non riesco a leggere ${percorso}`);
      process.exit(2);
    }
    const voci = giudizioScrittura({ file: percorso, testo, malattie: leggiMalattie() });
    if (!voci.length) {
      console.log(`✅ nessuna malattia censita in ${percorso}: la mano non si fermerebbe.`);
      process.exit(0);
    }
    for (const v of voci) console.log(`❌ riga ${v.riga} — ${v.cosa}`);
    process.exit(1);
  }

  // Forma hook: SEMPRE exit 0 — il rifiuto viaggia nel JSON, mai nel codice d'uscita.
  try {
    const ev = JSON.parse(await leggiStdin());
    const testo = testoInArrivo(ev?.tool_input || {});
    const assoluto = ev?.tool_input?.file_path || "";
    if (testo == null || !assoluto) process.exit(0);
    const file = isAbsolute(assoluto) ? relative(REPO, assoluto) : assoluto;
    if (file.startsWith("..")) process.exit(0); // fuori dalla casa: non è giurisdizione di questo freno
    const busta = bustaManoFermata(giudizioScrittura({ file, testo, malattie: leggiMalattie() }), file);
    if (busta) process.stdout.write(busta);
  } catch {
    // Fail-open dichiarato: un freno rotto non deve murare ogni scrittura.
  }
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
