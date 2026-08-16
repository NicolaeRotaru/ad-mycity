#!/usr/bin/env node
// LOTTO 44, CORSIA 7 — i due freni del commit, provati facendoli scattare su un repo git VERO.
//
//   ① AR-345 — un commit che cancella una skill mentre la misura del trigger è in corso deve
//      essere RIFIUTATO, e senza misura in corso deve passare. Non è teorico: il 29/7 lo stop-hook
//      di sessione ha chiesto tre volte di committare, e le uniche modifiche pendenti erano la
//      cancellazione apparente della skill.
//   ② AR-645 — un commit che salta i cancelli deve lasciare una riga CONTATA, e i messaggi di
//      blocco del pre-commit non devono più insegnare il comando che li annulla.
//
// Perché un repo vero e non un finto comodo: la decisione che conta è «git ha chiamato l'hook, o
// no?», e quella domanda si può porre solo a git. Un finto risponderebbe quello che gli ho detto.
//
// Si lancia con: node cervello/test/c7-cancelli-che-fermano.test.mjs

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const M = await import(join(REPO, "cervello/cancelli-commit.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n").slice(0, 3).join(" | ") });
  }
};

// ── il banco: un repo git vero, con i NOSTRI hook installati ────────────────
function repoFinto() {
  const dir = mkdtempSync(join(tmpdir(), "c7-cancelli-"));
  const g = (args, opts = {}) =>
    execFileSync("git", args, { cwd: dir, encoding: "utf8", maxBuffer: 8 * 1024 * 1024, ...opts });
  g(["init", "-q", "-b", "lavoro"]);
  g(["config", "user.email", "prova@example.com"]);
  g(["config", "user.name", "Prova"]);
  g(["config", "core.hooksPath", join(REPO, ".githooks")]);
  // Il pre-commit cerca i suoi guardiani sotto la radice del repo: qui non ci sono, quindi
  // saltano da soli (`[ -f ... ]`) e restano in piedi solo i due cancelli che sto provando.
  return { dir, g };
}

function commit(g, msg, extra = []) {
  return g(["commit", "-q", "-m", msg, ...extra], { stdio: ["ignore", "pipe", "pipe"] });
}

// ── ① AR-345 · la skill spostata non si cancella ────────────────────────────

prova("AR-345: col marcatore della misura, un commit che cancella una skill viene RIFIUTATO", () => {
  const { dir, g } = repoFinto();
  try {
    mkdirSync(join(dir, ".claude/skills/cantiere"), { recursive: true });
    writeFileSync(join(dir, ".claude/skills/cantiere/SKILL.md"), "# cantiere\n");
    g(["add", "-A"]);
    commit(g, "la skill c'è");

    // Adesso succede quello che succede davvero durante la misura: la cartella non c'è più.
    rmSync(join(dir, ".claude/skills/cantiere"), { recursive: true, force: true });
    g(["add", "-A"]);

    // Senza marcatore: è una cancellazione voluta, il cancello non c'entra e il commit passa.
    commit(g, "cancellazione voluta");
    assert.equal(existsSync(join(dir, ".claude/skills/cantiere/SKILL.md")), false);

    // Con il marcatore: la stessa identica cancellazione deve essere fermata.
    g(["revert", "-n", "--no-edit", "HEAD"]);
    g(["commit", "-q", "-m", "rimetto la skill"]);
    rmSync(join(dir, ".claude/skills/cantiere"), { recursive: true, force: true });
    g(["add", "-A"]);
    writeFileSync(join(dir, ".git", M.NOME_MARCATORE_MISURA), `${dir}/.git/prova-trigger-xyz/cantiere-da-parte\n`);

    let bloccato = false;
    let messaggio = "";
    try {
      commit(g, "committo mentre la misura gira");
    } catch (e) {
      bloccato = true;
      messaggio = String(e.stderr || "");
    }
    assert.equal(bloccato, true, "il commit doveva essere rifiutato: sta cancellando una skill spostata, non abbandonata");
    assert.match(messaggio, /cantiere-da-parte/, "il blocco deve dire DOVE sta la copia, o chi legge non sa come rimediare");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("AR-345: la decisione, da sola — blocca solo se la misura è in corso", () => {
  const cancellati = [".claude/skills/cantiere/SKILL.md", "cervello/altro.mjs"];
  assert.equal(M.bloccaSkillCancellata({ misuraInCorso: true, percorsoCopia: "/x/y", cancellati }).blocca, true);
  assert.equal(M.bloccaSkillCancellata({ misuraInCorso: false, cancellati }).blocca, false);
  assert.equal(M.bloccaSkillCancellata({ misuraInCorso: true, cancellati: ["cervello/altro.mjs"] }).blocca, false);
  assert.match(M.bloccaSkillCancellata({ misuraInCorso: true, percorsoCopia: "/x/y", cancellati }).motivo, /\/x\/y/);
});

// ── ② AR-645 · la forzatura si conta ────────────────────────────────────────

prova("AR-645: un commit che salta i cancelli lascia una riga contata, uno normale no", () => {
  const { dir, g } = repoFinto();
  try {
    writeFileSync(join(dir, "a.txt"), "uno\n");
    g(["add", "-A"]);
    commit(g, "primo, controllato");

    writeFileSync(join(dir, "a.txt"), "due\n");
    g(["add", "-A"]);
    commit(g, "secondo, forzato", ["--no-verify"]);

    const registro = readFileSync(join(dir, ".git", M.NOME_REGISTRO), "utf8");
    const c = M.contaBypass(registro);
    assert.equal(c.totale, 2, `il registro deve avere una riga per commit, non ${c.totale}`);
    assert.equal(c.controllati, 1, "il primo è passato dai cancelli");
    assert.equal(c.bypass, 1, "il secondo li ha saltati, e finché nessuno lo contava era indistinguibile dal primo");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("AR-645: nessun messaggio di blocco del pre-commit insegna come aggirarlo", () => {
  const hook = readFileSync(join(REPO, ".githooks/pre-commit"), "utf8");
  const righe = M.righeCheInsegnano(hook);
  assert.deepEqual(
    righe.map((r) => r.riga),
    [],
    `il pre-commit regala ancora il comando per saltarlo alle righe ${righe.map((r) => r.riga).join(", ")}`
  );
  // e il metro non è vuoto: sulla frase vecchia deve dire di sì.
  assert.equal(M.insegnaLaScappatoia("Bypass consapevole (sconsigliato): git commit --no-verify."), true);
  assert.equal(M.insegnaLaScappatoia("Correggi la sintassi e ri-committa."), false);
});

prova("AR-645: rebase e unioni non sono forzature — un registro rumoroso non lo guarda nessuno", () => {
  assert.equal(M.classificaPassaggio({ marcatoreMs: null, rebaseInCorso: true }).esito, "non-applicabile");
  assert.equal(M.classificaPassaggio({ marcatoreMs: null, parenti: 2 }).esito, "non-applicabile");
  assert.equal(M.classificaPassaggio({ marcatoreMs: null }).esito, "bypass");
  assert.equal(M.classificaPassaggio({ marcatoreMs: Date.now() }).esito, "controllato");
  // Un segno vecchio non vale: sarebbe il modo di far passare una forzatura per un controllo.
  assert.equal(M.classificaPassaggio({ marcatoreMs: Date.now() - 3600_000 }).esito, "bypass");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
