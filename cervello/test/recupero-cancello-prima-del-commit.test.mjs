#!/usr/bin/env node
// AR-690 — nel recupero del monitoraggio il cancello guardava lo stage DOPO che il commit l'aveva
// svuotato.
//
// LA RADICE, ereditata da AR-395. Il commit svuota lo stage: un cancello che gira dopo legge un
// insieme vuoto e risponde «nessun file di codice, si passa». Zero significa due cose diverse — «ho
// guardato e va bene» e «non c'era niente da guardare» — e la seconda stampa verde come la prima.
// *Un cancello che gira quando non serve più è indistinguibile da un cancello assente.* Nel giro
// l'ordine era già stato raddrizzato; nel recupero del monitoraggio no, ed è il punto dove fa più
// male: quel ramo scatta quando un run è morto a metà scrittura, cioè quando la memoria è più a rischio.
//
// PERCHÉ QUESTA PROVA GIRA LE RIGHE VERE. L'ordine fra due atti non si vede cercando una parola in un
// file: si vede solo eseguendo. Qui le righe del ramo «recupero» vengono ESTRATTE da monitora.sh e
// mandate in bash con `git` e il cancello finti, che scrivono su un foglio l'ordine in cui sono stati
// chiamati. Niente rete, niente repo vero, nessun commit.
//
// COSA PROVA:
//   ① il cancello viene chiamato PRIMA del commit, non dopo;
//   ② se il cancello dice no, il commit non avviene affatto (fermare il push non basta: il commit è
//      già la scrittura che poi qualcuno pubblica).
//
// NON-VACUITÀ (verificata rompendo il fix apposta): rimettendo in `cervello/monitora.sh` la chiamata
// al cancello DOPO il commit, i casi ① e ② diventano ROSSI.

import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MONITORA = join(REPO, "cervello", "monitora.sh");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Le righe VERE del ramo «recupero: scritture pendenti», estratte dal file e non ricopiate. */
function ramoDelRecupero() {
  const righe = readFileSync(MONITORA, "utf8").split("\n");
  const da = righe.findIndex((r) => r.includes('git rev-parse --abbrev-ref HEAD') && r.trimStart().startsWith("if ["));
  assert.ok(da >= 0, "il ramo del recupero non si trova più in monitora.sh: la prova non può passare a vuoto");
  const indent = righe[da].length - righe[da].trimStart().length;
  const a = righe.findIndex((r, i) => i > da && r === `${" ".repeat(indent)}fi`);
  assert.ok(a > da, "non trovo la fine del ramo del recupero");
  return righe.slice(da, a + 1).join("\n");
}

/** Esegue quelle righe con git e cancello finti, e torna l'ordine in cui sono stati chiamati. */
function ordineDegliAtti(rispostaDelCancello) {
  const tmp = mkdtempSync(join(tmpdir(), "recupero-monitora-"));
  const ordine = join(tmp, "ordine.log");
  writeFileSync(ordine, "");
  // Il finto cancello vive dove monitora.sh va a cercarlo: così la riga che lo carica resta quella
  // vera, e non c'è nessun pezzo del codice sotto prova riscritto per farlo passare.
  writeFileSync(
    join(tmp, "gate-pubblicazione.sh"),
    ["gate_pubblicazione() {", `  echo CANCELLO >> '${ordine}'`, `  return ${rispostaDelCancello}`, "}", ""].join("\n"),
  );
  const copione = [
    "set -u",
    "ts() { echo 00:00; }",
    "branch=main",
    `SCRIPT_DIR='${tmp}'`,
    `REPO='${tmp}'`,
    "url=https://esempio.invalido/x.git",
    "GIT_ID=(-c user.email=t@t -c user.name=t)",
    "MEM_DIRS=(MyCity-Vault)",
    "git() {",
    "  case \"$*\" in",
    "    *rev-parse*) echo main ;;",
    "    *status*) echo ' M MyCity-Vault/x.md' ;;",
    `    *commit*) echo COMMIT >> '${ordine}' ;;`,
    `    *push*) echo PUSH >> '${ordine}'; return 1 ;;`,
    "    *) : ;;",
    "  esac",
    "}",
    ramoDelRecupero(),
  ].join("\n");
  const copioneFile = join(tmp, "prova.sh");
  writeFileSync(copioneFile, copione);
  chmodSync(copioneFile, 0o755);
  const r = spawnSync("bash", [copioneFile], { encoding: "utf8", cwd: tmp });
  assert.equal(r.status, 0, `il ramo estratto non gira: ${r.stderr}`);
  return readFileSync(ordine, "utf8").split("\n").filter(Boolean);
}

prova("⬇️ ① il cancello gira PRIMA del commit, non dopo che ha svuotato lo stage", () => {
  const atti = ordineDegliAtti(0);
  assert.deepEqual(atti.slice(0, 2), ["CANCELLO", "COMMIT"], `ordine trovato: ${atti.join(" → ")} — prima era COMMIT e poi CANCELLO`);
});

prova("⬇️ ② se il cancello dice no, il commit non avviene affatto", () => {
  const atti = ordineDegliAtti(1);
  assert.deepEqual(atti, ["CANCELLO"], "un cancello che dice no dopo il commit non ferma la scrittura: ferma solo il push");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
