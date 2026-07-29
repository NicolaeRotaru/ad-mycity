#!/usr/bin/env node
// AR-396 — «Il controllo del ramo prima di pubblicare sta prima del riallineamento, non prima
// dell'invio» — e il rebase che fallisce viene ingoiato.
//
// Due difetti nella stessa funzione (`pubblica_memoria` in cervello/gate-pubblicazione.sh), che è
// quella usata da TUTTI e quattro i pubblicatori:
//   ① `git rebase … || git rebase --abort … || true`: se anche l'abort fallisce l'errore sparisce e
//      si arriva al `git push` con l'albero A METÀ REBASE — un avanzamento parziale che dal remoto
//      risulta fast-forward, quindi il push riesce e su main finisce meno lavoro di quello che c'è;
//   ② `ramo_ammesso` era chiamato FUORI dal ciclo, cioè prima del fetch e del rebase: il commento
//      della funzione prometteva «subito prima del push» e la prova che ha chiuso AR-297/AR-315
//      cercava la PRESENZA del controllo, non la sua POSIZIONE.
//
// Perciò questa prova non cerca stringhe: mette un `git` finto in PATH, gli fa fallire il rebase e
// l'abort, ed esige ZERO push. È l'unica differenza fra «il controllo c'è» e «il controllo ferma».
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, existsSync, readFileSync, writeFileSync, rmSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";
import { decidiRebase } from "../esito-scrittura.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");
const GATE = join(CERVELLO, "gate-pubblicazione.sh");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

/**
 * Banco: un `git` finto che risponde come gli diciamo e REGISTRA ogni comando.
 *   rcRebase / rcAbort  = come vanno rebase e abort
 *   ramo                = cosa risponde `rev-parse --abbrev-ref HEAD` (dopo il rebase)
 *   rebaseInCorso       = se la cartella .git/rebase-merge esiste (albero a metà)
 */
function banco({ rcRebase = 0, rcAbort = 0, ramo = "main", rebaseInCorso = false, rcFetch = 0 } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "push-sporco-"));
  mkdirSync(join(dir, "bin"), { recursive: true });
  mkdirSync(join(dir, "repo/.git"), { recursive: true });
  if (rebaseInCorso) mkdirSync(join(dir, "repo/.git/rebase-merge"), { recursive: true });
  const log = join(dir, "git.log");
  writeFileSync(
    join(dir, "bin/git"),
    `#!/usr/bin/env bash
echo "$*" >> "${log}"
case "$*" in
  *"rev-parse --abbrev-ref HEAD"*) echo "${ramo}"; exit 0 ;;
  *"rev-parse --git-path rebase-merge"*) echo "${join(dir, "repo/.git/rebase-merge")}"; exit 0 ;;
  *"rev-parse --git-path rebase-apply"*) echo "${join(dir, "repo/.git/rebase-apply")}"; exit 0 ;;
  *"rebase --abort"*) exit ${rcAbort} ;;
  *rebase*) exit ${rcRebase} ;;
  *fetch*) exit ${rcFetch} ;;
  *push*) exit 0 ;;
esac
exit 0
`,
  );
  chmodSync(join(dir, "bin/git"), 0o755);
  return {
    dir,
    repo: join(dir, "repo"),
    log: () => (existsSync(log) ? readFileSync(log, "utf8") : ""),
    push: () => ((existsSync(log) ? readFileSync(log, "utf8") : "").match(/^push |\bpush /gm) || []).length,
    pulisci: () => rmSync(dir, { recursive: true, force: true }),
  };
}

function pubblica(b) {
  const script = `set -uo pipefail
exec 2>&1
export PATH="${join(b.dir, "bin")}:$PATH"
SCRIPT_DIR="${CERVELLO}"
cd "${b.repo}"
. "${GATE}"
pubblica_memoria "https://finto/repo.git" "main" 1 5
echo "RC=$?"`;
  try {
    return execFileSync("bash", ["-c", script], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    return (e.stdout || "") + (e.stderr || "");
  }
}

// ── la testa ─────────────────────────────────────────────────────────────────
prova("AR-396: rebase fallito + abort fallito = albero SPORCO, non si pubblica", () => {
  const r = decidiRebase({ rcRebase: 1, rcAbort: 1 });
  assert.equal(r.stato, "sporco");
  assert.equal(r.puoiPushare, false);
});

prova("AR-396: rebase fallito ma abort riuscito = albero pulito, il push può partire", () => {
  const r = decidiRebase({ rcRebase: 1, rcAbort: 0 });
  assert.equal(r.stato, "abortito");
  assert.equal(r.puoiPushare, true, "l'albero è tornato indietro: il push non-ff lo rifiuta il remoto");
});

prova("AR-396: un rebase «riuscito» con la cartella di rebase ancora lì non si pubblica", () => {
  assert.equal(decidiRebase({ rcRebase: 0, rebaseInCorso: true }).puoiPushare, false);
});

prova("AR-396: il rebase riuscito resta pubblicabile (il fix non blocca il caso normale)", () => {
  assert.equal(decidiRebase({ rcRebase: 0 }).puoiPushare, true);
});

// ── il freno, eseguito ───────────────────────────────────────────────────────
prova("AR-396 (runtime): con l'albero a metà rebase NON parte NESSUN push", () => {
  const b = banco({ rcRebase: 1, rcAbort: 1, rebaseInCorso: true });
  try {
    const out = pubblica(b);
    assert.equal(b.push(), 0, `un avanzamento parziale è finito su main:\n${b.log()}`);
    assert.match(out, /PUSH ANNULLATO/);
    assert.match(out, /RC=1/, "la funzione deve dire al chiamante che non ha pubblicato");
  } finally {
    b.pulisci();
  }
});

prova("AR-396 (runtime): rebase in conflitto ma abort riuscito → il push si tenta (nessuna regressione)", () => {
  const b = banco({ rcRebase: 1, rcAbort: 0 });
  try {
    pubblica(b);
    assert.equal(b.push(), 1, `il caso storico buono è stato bloccato per sbaglio:\n${b.log()}`);
  } finally {
    b.pulisci();
  }
});

prova("AR-396 (runtime): se il rebase ci ha staccati da main, il push NON parte", () => {
  // È il caso che il commento della funzione prometteva di coprire: fra il gate e il push passano un
  // commit e un rebase. Col controllo fuori dal ciclo il ramo veniva guardato PRIMA di quel rebase.
  const b = banco({ rcRebase: 0, ramo: "HEAD" });
  try {
    const out = pubblica(b);
    assert.equal(b.push(), 0, `pubblicato da un HEAD staccato:\n${b.log()}`);
    assert.match(out, /PUSH ANNULLATO/);
  } finally {
    b.pulisci();
  }
});

prova("AR-396 (runtime): il caso normale pubblica ancora", () => {
  const b = banco({ rcRebase: 0, ramo: "main" });
  try {
    const out = pubblica(b);
    assert.equal(b.push(), 1, `il fix ha rotto la pubblicazione normale:\n${b.log()}`);
    assert.match(out, /RC=0/);
  } finally {
    b.pulisci();
  }
});

prova("AR-396 (runtime): se la testa non risponde, fail-closed (niente push)", () => {
  const b = banco({ rcRebase: 1, rcAbort: 1 });
  try {
    const script = `set -uo pipefail
exec 2>&1
export PATH="${join(b.dir, "bin")}:$PATH"
SCRIPT_DIR="/nonesiste-$$"
cd "${b.repo}"
. "${GATE}"
pubblica_memoria "https://finto/repo.git" "main" 1 5
echo "RC=$?"`;
    const out = execFileSync("bash", ["-c", script], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    assert.equal(b.push(), 0, "senza classificazione dell'albero non si pubblica");
    assert.match(out, /RC=1/);
  } finally {
    b.pulisci();
  }
});

// ── il caso vero: git vero, conflitto vero (la prova che la scheda chiede) ───
prova("AR-396 (git vero): con un conflitto di rebase la memoria NON finisce su main a metà", () => {
  const dir = mkdtempSync(join(tmpdir(), "push-git-vero-"));
  const g = (cwd, ...args) =>
    execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" },
    });
  try {
    const remoto = join(dir, "remoto.git");
    const locale = join(dir, "locale");
    mkdirSync(remoto, { recursive: true });
    g(dir, "init", "--bare", "-b", "main", remoto);
    g(dir, "clone", remoto, locale);
    writeFileSync(join(locale, "STATO.md"), "riga uno\n");
    g(locale, "add", "-A");
    g(locale, "commit", "-m", "base");
    g(locale, "push", "origin", "main");
    // qualcun altro cambia la stessa riga sul remoto
    const altro = join(dir, "altro");
    g(dir, "clone", remoto, altro);
    writeFileSync(join(altro, "STATO.md"), "riga di un altro\n");
    g(altro, "add", "-A");
    g(altro, "commit", "-m", "altro");
    g(altro, "push", "origin", "main");
    // noi cambiamo la stessa riga in locale → il rebase su FETCH_HEAD entra in conflitto
    writeFileSync(join(locale, "STATO.md"), "riga nostra\n");
    g(locale, "add", "-A");
    g(locale, "commit", "-m", "nostro");

    const script = `set -uo pipefail
exec 2>&1
SCRIPT_DIR="${CERVELLO}"
cd "${locale}"
. "${GATE}"
pubblica_memoria "${remoto}" "main" 1 20
echo "RC=$?"`;
    const out = execFileSync("bash", ["-c", script], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    assert.match(out, /RC=1/, `la pubblicazione doveva fallire, non riuscire a metà:\n${out}`);
    // il remoto deve essere rimasto quello dell'altro: niente avanzamento parziale pubblicato
    const testa = execFileSync("git", ["--git-dir", remoto, "log", "-1", "--format=%s"], { encoding: "utf8" }).trim();
    assert.equal(testa, "altro", `su main è finito qualcosa di parziale: «${testa}»`);
    // e l'albero locale non deve restare a metà rebase
    assert.ok(!existsSync(join(locale, ".git/rebase-merge")), "rebase lasciato a metà nel worktree");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── esito ────────────────────────────────────────────────────────────────────
const rotti = casi.filter((c) => !c.ok);
for (const c of casi) process.stdout.write(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n     ${c.err}`}\n`);
process.stdout.write(`\n${casi.length - rotti.length}/${casi.length} passati\n`);
process.exit(rotti.length ? 1 : 0);
