// c4-banco.mjs — il banco di prova della corsia «cancelli dentro gli script di shell».
//
// Perché esiste. I difetti di questa corsia sono sopravvissuti per un motivo solo: la difesa vive
// dentro `giro.sh` o `worker.sh`, e nessuno può eseguire una riga in mezzo a milleseicento senza far
// girare un giro vero. Così un commento e la sua riga potevano dire il contrario per settimane.
// Qui si RITAGLIA il tratto vero dal file vero e lo si ESEGUE in una sandbox, con i guardiani
// sostituiti da finti che lasciano un sigillo quando partono. Nessuna prova di questa corsia guarda
// il sorgente: guardano cosa succede.
//
// Stessa tecnica di cervello/prove-difetti.mjs (che i test del cervello già eseguono): il debito che
// paga è lo stesso — una prova che cerca una parola non può fallire nel modo in cui fallisce la realtà.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, chmodSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

export const QUI = dirname(fileURLToPath(import.meta.url));
export const RADICE = join(QUI, "..", "..");

let usciti = 0;
const fatti = [];

export function ok(condizione, cosa, dettaglio = "") {
  fatti.push({ condizione: Boolean(condizione), cosa, dettaglio });
  if (condizione) console.log(`  ✅ ${cosa}`);
  else {
    usciti = 1;
    console.log(`  ❌ ${cosa}`);
    if (dettaglio) console.log(`     ${String(dettaglio).split("\n").slice(0, 12).join("\n     ")}`);
  }
  return Boolean(condizione);
}

export function titolo(t) {
  console.log(`\n${t}`);
}

export function finisci(nome) {
  const rossi = fatti.filter((f) => !f.condizione).length;
  console.log(`\n${rossi ? "❌" : "✅"} ${nome} — ${fatti.length - rossi}/${fatti.length} verifiche passate`);
  process.exit(usciti);
}

/** Una cartella temporanea che si cancella da sola a fine processo. */
export function sandbox(nome) {
  const d = mkdtempSync(join(tmpdir(), `c4-${nome}-`));
  process.on("exit", () => {
    try {
      rmSync(d, { recursive: true, force: true });
    } catch {
      /* la sandbox è temporanea: se non si cancella non è un fallimento della prova */
    }
  });
  return d;
}

/**
 * Ritaglia da uno script il tratto fra due ancore (la prima riga che contiene `da`, fino alla riga
 * PRIMA di quella che contiene `a`). Se un'ancora non c'è più, la prova è CIECA e lo dice: uno
 * script cambiato sotto i piedi non è un difetto riparato.
 */
export function tratto(file, da, a) {
  const righe = readFileSync(join(RADICE, file), "utf8").split("\n");
  const i = righe.findIndex((r) => r.includes(da));
  if (i < 0) throw new Error(`CIECO: non trovo più «${da}» in ${file} — lo script è cambiato sotto i piedi`);
  const j = righe.findIndex((r, k) => k > i && r.includes(a));
  if (j < 0) throw new Error(`CIECO: non trovo più «${a}» dopo «${da}» in ${file}`);
  return righe.slice(i, j).join("\n");
}

/** Uno script node finto che lascia un sigillo, stampa qualcosa ed esce col codice chiesto. */
export function guardianoFinto(dove, nomeFile, { stampa = "", rc = 0 } = {}) {
  const sigillo = join(dove, `partito-${nomeFile}`);
  writeFileSync(
    join(dove, nomeFile),
    `import { writeFileSync, appendFileSync, existsSync } from "node:fs";\n` +
      `appendFileSync(${JSON.stringify(sigillo)}, process.argv.slice(2).join(" ") + "\\n");\n` +
      (stampa ? `console.log(${JSON.stringify(stampa)});\n` : "") +
      `process.exit(${rc});\n`,
  );
  return sigillo;
}

/** Copia un file vero della macchina dentro la sandbox (per i moduli che il tratto chiama sul serio). */
export function copiaVera(dove, rel) {
  const src = join(RADICE, rel);
  if (!existsSync(src)) throw new Error(`CIECO: manca ${rel}`);
  const dst = join(dove, rel.split("/").pop());
  writeFileSync(dst, readFileSync(src));
  try {
    chmodSync(dst, 0o755);
  } catch {
    /* i permessi non cambiano il contenuto: se non si possono mettere, il file resta eseguibile via node */
  }
  return dst;
}

/**
 * Esegue un pezzo di bash nella sandbox. `preludio` prepara l'ambiente finto, `blocco` è il tratto
 * vero, `leggi` sono le variabili da riportare fuori (ognuna su un file suo: i vincoli vanno a capo,
 * quindi qualsiasi separatore condiviso finirebbe prima o poi dentro un valore).
 */
export function eseguiBash({ dove, preludio = "", blocco, coda = "", leggi = [], env = {} }) {
  const fileVar = (v) => join(dove, `var-${v}`);
  const script = join(dove, "prova.sh");
  writeFileSync(
    script,
    `#!/usr/bin/env bash\nset -uo pipefail\n` +
      `ts() { echo 00:00; }\n` +
      `esito_righe() { cat >/dev/null; }\n` +
      preludio +
      "\n" +
      blocco +
      "\n" +
      coda +
      "\n" +
      leggi.map((v) => `printf '%s' "\${${v}:-}" > ${JSON.stringify(fileVar(v))}`).join("\n") +
      "\n",
  );
  chmodSync(script, 0o755);
  const sintassi = spawnSync("bash", ["-n", script], { encoding: "utf8", timeout: 30_000 });
  if (sintassi.status !== 0) {
    return { cieco: `il tratto ritagliato non compila, quindi non l'ho eseguito: ${(sintassi.stderr || "").trim().split("\n")[0]}` };
  }
  const r = spawnSync("bash", [script], {
    encoding: "utf8",
    timeout: 120_000,
    cwd: dove,
    env: { ...process.env, ...env },
  });
  if (r.error) return { cieco: `non ho potuto eseguire il tratto: ${r.error.message}` };
  const vars = Object.fromEntries(
    leggi.map((v) => [v, existsSync(fileVar(v)) ? readFileSync(fileVar(v), "utf8") : ""]),
  );
  return { vars, rc: r.status, log: `${r.stdout || ""}${r.stderr || ""}` };
}

/** Un comando finto sul PATH che scrive i propri argomenti su un file (per guardare dentro argv). */
export function comandoSpia(dove, nome, { esci = 0, stampa = "" } = {}) {
  const bin = join(dove, "bin");
  mkdirSync(bin, { recursive: true });
  const log = join(dove, `argv-${nome}.txt`);
  writeFileSync(
    join(bin, nome),
    `#!/usr/bin/env bash\nprintf '%s\\n' "$*" >> ${JSON.stringify(log)}\n` +
      (stampa ? `printf '%s\\n' ${JSON.stringify(stampa)}\n` : "") +
      `exit ${esci}\n`,
  );
  chmodSync(join(bin, nome), 0o755);
  return { bin, log };
}
