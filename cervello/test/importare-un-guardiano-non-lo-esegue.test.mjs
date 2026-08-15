#!/usr/bin/env node
// 🚪 AR-680 — IMPORTARE `keyword-owner-check` NON DEVE ESEGUIRLO (e la guardia deve reggere gli accenti).
//
// IL DIFETTO. `cervello/keyword-owner-check.mjs` è insieme libreria e programma: in fondo chiama
// `main()`, che legge i 120 senior, stampa un rapporto e chiama `process.exit`. Senza la guardia
// dell'entrypoint, chi lo importa per usarne una funzione si ritrova il programma intero che parte e
// esce — ed è la malattia censita `programma-che-parte-importando` (65 istanze). Nato come
// regressione: nel lotto 40 il file è stato reso importabile e la guardia è rimasta fuori.
//
// LA SECONDA METÀ, che la scheda non diceva. La guardia c'era ma nella forma fragile
// `import.meta.url === \`file://${process.argv[1]}\``. `import.meta.url` codifica sempre i caratteri
// fuori dall'ASCII; `file://` incollato al percorso no. Basta una cartella con un accento o uno
// spazio nel percorso perché il confronto sia falso: il guardiano **non parte, non stampa niente ed
// esce 0**. Un cancello che si spegne in silenzio è peggio di un cancello assente, perché il verde
// continua ad arrivare. Qui sotto la differenza non è argomentata: è ESEGUITA, sotto una cartella
// con l'accento.
//
// 🟢 Sola lettura sul repo. Le due copie di prova stanno in una cartella temporanea, cancellata alla
//    fine: la memoria non si sporca per misurare.
//
// NON-VACUITÀ (eseguita davvero): rimettendo in `keyword-owner-check.mjs` la forma
// `import.meta.url === \`file://${process.argv[1]}\`` il caso ③ diventa rosso; togliendo del tutto la
// riga di guardia diventa rosso ①.

import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const GUARDIANO = join(REPO, "cervello/keyword-owner-check.mjs");

const casi = [];
function prova(nome, fn) {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
}

/** Lancia node e torna { code, out } senza far esplodere il test sul codice d'uscita. */
function esegui(args, opz = {}) {
  try {
    const out = execFileSync("node", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opz });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? -1, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
}

// ═══ ① importarlo non fa girare il programma ═════════════════════════════════════════════════════

prova("① importare il guardiano NON ne esegue il programma", () => {
  const url = new URL(`file://${GUARDIANO}`).href; // basta per un percorso ASCII come questo repo
  const r = esegui(["--input-type=module", "-e", `await import(${JSON.stringify(url)}); console.log("IMPORTATO");`]);
  assert.equal(r.code, 0, `importarlo è uscito ${r.code}: il programma è partito e ha chiamato process.exit`);
  assert.match(r.out, /IMPORTATO/, "l'import non è nemmeno arrivato in fondo");
  assert.doesNotMatch(r.out, /mandato-owner/,
    "importandolo il guardiano ha stampato il suo rapporto: sta girando da solo appena qualcuno lo carica");
});

// ═══ ② lanciarlo invece lo fa girare davvero (la guardia non deve spegnerlo) ═════════════════════

prova("② lanciarlo lo fa girare: la guardia non ha spento il comando", () => {
  const r = esegui([GUARDIANO, "--json"]);
  assert.ok(r.out.trim().length > 0, "lanciato non stampa niente: la guardia lo sta spegnendo in silenzio");
  const j = JSON.parse(r.out);
  assert.ok(Number.isInteger(j.agenti) && j.agenti > 0, "il guardiano non ha letto nessun agente: gira a vuoto");
});

// ═══ ③ la guardia regge un percorso con l'accento — le due forme, eseguite ═══════════════════════

const CORPO = (guardia) =>
  `function main() { console.log("PARTITO"); }\n${guardia}\n`;

const FORMA_FRAGILE = "if (import.meta.url === `file://${process.argv[1]}`) main();";
const FORMA_ROBUSTA =
  'import { pathToFileURL } from "node:url";\n' +
  "if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();";

prova("③ sotto una cartella con l'accento la forma fragile SPEGNE il comando, la robusta no", () => {
  const base = mkdtempSync(join(tmpdir(), "guardia-"));
  try {
    const dir = join(base, "città però"); // accento + spazio: i due modi in cui un percorso si codifica
    mkdirSync(dir, { recursive: true });
    const fragile = join(dir, "fragile.mjs");
    const robusto = join(dir, "robusto.mjs");
    writeFileSync(fragile, CORPO(FORMA_FRAGILE));
    writeFileSync(robusto, CORPO(FORMA_ROBUSTA));

    assert.doesNotMatch(esegui([fragile]).out, /PARTITO/,
      "la forma fragile è partita lo stesso: allora questo test non dimostra niente, rivedilo");
    assert.match(esegui([robusto]).out, /PARTITO/,
      "nemmeno la forma robusta parte: il problema non è la codifica del percorso");

    // E il guardiano vero deve usare quella che regge.
    const src = readFileSync(GUARDIANO, "utf8");
    assert.match(src, /pathToFileURL\(process\.argv\[1\]\)\.href/,
      "keyword-owner-check usa ancora la guardia che si spegne su un percorso con l'accento");
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
