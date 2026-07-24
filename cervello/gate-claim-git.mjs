#!/usr/bin/env node
// 🚦 GATE-CLAIM-GIT — il PRIMO gate vero: trasforma la lezione più ripetuta di Nicola in un CONTROLLO
// che fallisce quando l'errore sta per rifarsi, non nell'ennesima riga di prompt.
//
// LA LEZIONE (caso-studio Nicola, 5 evidenze, conf 0.99): «"committato" ≠ "pushato" ≠ "mergiato", e NON
// dire mai «pushato/mergiato» senza aver verificato che sia davvero arrivato». Il cluster «git» è tornato
// 35× in 19 lezioni (9 da correzioni di Nicola) e non era MAI diventato un gate: restava testo iniettato
// nel contesto, che provabilmente non basta (l'errore si ripeteva lo stesso). Questo script è il gate.
//
// COSA FA (sola lettura del remoto — `git ls-remote`, nessuna scrittura, nessun fetch che muta ref):
//   pushed <branch>   → il tip locale di <branch> è DAVVERO su origin/<branch>? (sha locale == sha remoto)
//   merged <branch>   → <branch> è DAVVERO dentro origin/<base>? (il suo sha è raggiungibile da base)
//   Esce 0 se il claim è VERO, 2 se è FALSO (→ non dire «fatto»), 3 se non verificabile (tooling: fail-open,
//   non bloccare per un problema di rete/strumento — ma dillo).
//
// USO:
//   node cervello/gate-claim-git.mjs pushed <branch> [--cwd <repo>] [--json]
//   node cervello/gate-claim-git.mjs merged <branch> [--base main] [--cwd <repo>] [--json]
//
// PERCHÉ È UN GATE E NON UN PROMEMORIA: lo chiama git-pr.mjs subito dopo `git push` (prima di stampare il
// «✓ Push»), così lo script stesso non può dichiarare un push che non è atterrato. Chiamalo anche a mano
// prima di scrivere a Nicola «pushato»/«mergiato»: se esce 2, la frase è una bugia — riscrivila.

import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const JSON_OUT = args.includes("--json");
const azione = args[0];
const branch = args[1] && !args[1].startsWith("--") ? args[1] : null;

function opt(name, def = null) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
}
const CWD = opt("--cwd", process.cwd());
const BASE = opt("--base", "main");

function git(a) {
  return execFileSync("git", a, { cwd: CWD, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function fine(payload, exit) {
  if (JSON_OUT) process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
  else {
    const seg = { vero: "✅", falso: "❌", indeterminato: "⚠️" }[payload.verdetto] || "•";
    process.stdout.write(`${seg} ${payload.messaggio}\n`);
  }
  process.exit(exit);
}

// sha remoto di un ref (branch) via ls-remote — sola lettura, non tocca nulla in locale.
function shaRemoto(ref) {
  try {
    const out = git(["ls-remote", "origin", `refs/heads/${ref}`]);
    const line = out.split("\n").find(Boolean);
    return line ? line.split(/\s+/)[0] : null;
  } catch {
    return null;
  }
}

function shaLocale(ref) {
  try {
    return git(["rev-parse", ref]);
  } catch {
    return null;
  }
}

if (!azione || !branch || !["pushed", "merged"].includes(azione)) {
  fine(
    { verdetto: "indeterminato", messaggio: "uso: gate-claim-git.mjs <pushed|merged> <branch> [--base main] [--cwd repo]" },
    3,
  );
}

if (azione === "pushed") {
  const locale = shaLocale(branch) || shaLocale("HEAD");
  const remoto = shaRemoto(branch);
  if (!locale) fine({ verdetto: "indeterminato", azione, branch, messaggio: `impossibile leggere lo sha locale di '${branch}' (repo ${CWD}).` }, 3);
  if (!remoto)
    fine(
      { verdetto: "falso", azione, branch, locale, remoto: null, messaggio: `NON dire «pushato»: 'origin/${branch}' non esiste sul remoto. Il branch non è mai stato pushato.` },
      2,
    );
  if (locale === remoto)
    fine({ verdetto: "vero", azione, branch, sha: locale, messaggio: `Push VERIFICATO: origin/${branch} == HEAD locale (${locale.slice(0, 7)}).` }, 0);

  // Sha diversi: la domanda giusta non è «coincidono» ma «ho commit locali NON ancora su origin?».
  // È l'essenza della lezione «committato ≠ pushato». Serve l'oggetto remoto in locale: se manca,
  // un fetch (aggiorna solo i ref di tracking, non muta i branch locali) e si riprova.
  function nonPushati() {
    try {
      return git(["rev-list", "--count", `${remoto}..${locale}`]);
    } catch {
      return null;
    }
  }
  let count = nonPushati();
  if (count == null) {
    try {
      execFileSync("git", ["fetch", "--quiet", "origin", branch], { cwd: CWD, stdio: "ignore" });
    } catch {
      /* offline o ref assente: sotto gestiamo l'indeterminato */
    }
    count = nonPushati();
  }
  if (count == null)
    fine(
      { verdetto: "indeterminato", azione, branch, locale, remoto, messaggio: `sha diversi (locale ${locale.slice(0, 7)} ≠ origin ${remoto.slice(0, 7)}) ma non verificabile in locale: fai «git fetch origin ${branch}» e riprova.` },
      3,
    );
  const n = Number(count);
  if (n === 0)
    fine(
      { verdetto: "vero", azione, branch, locale, remoto, dietro: true, messaggio: `Push VERIFICATO: nessun commit locale fuori da origin/${branch} (il remoto è più avanti — sei tu a essere indietro, ma non hai nulla di non pushato).` },
      0,
    );
  fine(
    {
      verdetto: "falso",
      azione,
      branch,
      locale,
      remoto,
      non_pushati: n,
      messaggio: `NON dire «pushato»: hai ${n} commit locali su '${branch}' che NON sono su origin (locale ${locale.slice(0, 7)}, origin ${remoto.slice(0, 7)}). Fai il push e verifica.`,
    },
    2,
  );
}

if (azione === "merged") {
  const localeSha = shaLocale(branch);
  if (!localeSha) fine({ verdetto: "indeterminato", azione, branch, messaggio: `impossibile leggere lo sha di '${branch}'.` }, 3);
  const baseRemoto = shaRemoto(BASE);
  if (!baseRemoto) fine({ verdetto: "indeterminato", azione, branch, messaggio: `impossibile leggere origin/${BASE} dal remoto.` }, 3);
  // è mergiato se il tip del branch è raggiungibile da origin/base. Serve avere l'oggetto localmente;
  // se non c'è, è indeterminato (fail-open) — meglio «non so» che un falso «mergiato».
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", localeSha, baseRemoto], { cwd: CWD, stdio: "ignore" });
    fine({ verdetto: "vero", azione, branch, base: BASE, messaggio: `Merge VERIFICATO: ${branch} (${localeSha.slice(0, 7)}) è dentro origin/${BASE}.` }, 0);
  } catch (e) {
    // exit 1 di is-ancestor = NON antenato → non mergiato; altro = oggetto assente → indeterminato
    if (e && e.status === 1)
      fine({ verdetto: "falso", azione, branch, base: BASE, messaggio: `NON dire «mergiato»: ${branch} non è dentro origin/${BASE}.` }, 2);
    fine({ verdetto: "indeterminato", azione, branch, base: BASE, messaggio: `non verificabile in locale (oggetto ${localeSha.slice(0, 7)} o ${baseRemoto.slice(0, 7)} assente): fai «git fetch» e riprova.` }, 3);
  }
}
