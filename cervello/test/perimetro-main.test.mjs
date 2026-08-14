#!/usr/bin/env node
// AR-332 — su `main` il codice passa da una PR, non da un commit a mano.
//
// L'episodio, il 27/7: lavorando al lotto 6 un modulo nuovo è finito su main dentro un commit di
// MEMORIA invece che nella sua PR. È bastato un `git add -A` in una shell.
//
// Il gate di pubblicazione costruito nel lotto 3 (AR-314) non l'ha visto, e non poteva: è una
// FUNZIONE bash che i cinque script CHIAMANO — chi non la chiama non la incontra. Una regola che vale
// per il REPOSITORY era implementata come una funzione da invocare. Ora è un cancello che il
// repository impone a chiunque committi: worker, giro, sessioni AD, persone.
//
// Questo test ESEGUE l'hook vero dentro un repo git usa-e-getta, con i tre casi che contano. Non
// tocca il repo di lavoro: la prima versione lo faceva switchando rami, e uno `stash -u` ha portato
// via l'hook stesso rendendo la prova muta — poi un `reset --hard` ha cancellato la modifica. Provare
// un cancello camminandoci dentro è il modo di non provarlo affatto.

import { execFileSync } from "node:child_process";
// AR-694 — `existsSync` e `readFileSync` si importano QUI, non dentro i casi. Il banco qui sotto
// lancia i casi con `fn()` secco: un caso scritto `async` solo per poter fare `await import("node:fs")`
// restituisce una promessa che nessuno raccoglie, e l'asserzione gira dopo che il conteggio è già
// stampato — un `1 = 2` là dentro esce «passato». Due casi di questo file erano così.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Un repo git minimo con l'hook e la regola veri, su un ramo dato. */
function repoFinto(ramo) {
  const d = mkdtempSync(join(tmpdir(), "mycity-perim-"));
  const git = (...a) => execFileSync("git", a, { cwd: d, encoding: "utf8", stdio: "pipe" });
  git("init", "-q", "-b", ramo);
  git("config", "user.email", "test@mycity.local");
  git("config", "user.name", "test");
  mkdirSync(join(d, ".githooks"), { recursive: true });
  mkdirSync(join(d, "cervello"), { recursive: true });
  mkdirSync(join(d, "MyCity-Vault/90-Memoria-AI"), { recursive: true });
  cpSync(join(REPO, ".githooks/pre-commit"), join(d, ".githooks/pre-commit"));
  cpSync(join(REPO, "cervello/gate-pubblicazione.sh"), join(d, "cervello/gate-pubblicazione.sh"));
  execFileSync("chmod", ["+x", join(d, ".githooks/pre-commit")]);
  git("config", "core.hooksPath", ".githooks");
  // Un primo commit per avere una storia (il gate dei segreti ha bisogno di node: qui non c'è lo
  // scanner, quindi quel cancello si limita ad avvisare — è il comportamento voluto, non un buco).
  writeFileSync(join(d, "MyCity-Vault/90-Memoria-AI/STATO.md"), "# stato\n");
  git("add", "-A");
  git("commit", "-q", "-m", "base", "--no-verify");
  return {
    dir: d,
    git,
    /** Prova a committare i file dati. Torna {rc, out}. */
    commit(files, msg = "prova") {
      for (const [f, testo] of Object.entries(files)) {
        mkdirSync(dirname(join(d, f)), { recursive: true });
        writeFileSync(join(d, f), testo);
      }
      git("add", ...Object.keys(files));
      try {
        const out = execFileSync("git", ["commit", "-m", msg], { cwd: d, encoding: "utf8", stdio: "pipe" });
        return { rc: 0, out };
      } catch (e) {
        return { rc: e.status ?? 1, out: `${e.stdout || ""}${e.stderr || ""}` };
      }
    },
    pulisci() {
      rmSync(d, { recursive: true, force: true });
    },
  };
}

const con = (ramo, fn) => {
  const r = repoFinto(ramo);
  try {
    return fn(r);
  } finally {
    r.pulisci();
  }
};

// ── il caso che è successo davvero ───────────────────────────────────────────
prova("il caso che ha rotto: su main, codice INSIEME alla memoria viene fermato", () =>
  con("main", (r) => {
    // È l'episodio del 27/7, riga per riga: un modulo nuovo più un file di memoria, un `git add`, via.
    const { rc, out } = r.commit({
      "cervello/volano-regole.mjs": "export function x() {}\n",
      "MyCity-Vault/90-Memoria-AI/STATO.md": "# stato aggiornato\n",
    });
    assert.notEqual(rc, 0, "il commit doveva essere bloccato");
    assert.match(out, /COMMIT BLOCCATO/);
    assert.match(out, /AR-332/);
    assert.match(out, /cervello\/volano-regole\.mjs/, "deve dire QUALE file è di troppo");
  }));

prova("su main, anche il codice DA SOLO viene fermato", () =>
  con("main", (r) => {
    const { rc } = r.commit({ "cervello/qualcosa.mjs": "// x\n" });
    assert.notEqual(rc, 0);
  }));

prova("su main la MEMORIA passa: il worker e il giro devono continuare a pubblicare", () =>
  con("main", (r) => {
    // Se questo cancello bloccasse anche la memoria, fermerebbe la macchina — sarebbe un rimedio
    // peggiore del male, e verrebbe disattivato entro la settimana.
    const { rc, out } = r.commit({
      "MyCity-Vault/90-Memoria-AI/STATO.md": "# nuovo\n",
      "consegne/nota.md": "nota\n",
      "memoria-squadra/tech.md": "esito\n",
      "creativi/x.txt": "x\n",
    });
    assert.equal(rc, 0, `la memoria dev'essere pubblicabile: ${out}`);
  }));

// ── i rami di lavoro non hanno perimetro ────────────────────────────────────
prova("su un ramo di lavoro il codice passa: è lì che si lavora", () =>
  con("fix/lotto-7", (r) => {
    const { rc, out } = r.commit({ "cervello/nuovo.mjs": "// codice\n" });
    assert.equal(rc, 0, `un ramo di lavoro non ha perimetro: ${out}`);
  }));

prova("su un ramo di lavoro passa anche codice + memoria insieme", () =>
  con("claude/qualcosa", (r) => {
    const { rc } = r.commit({
      "cervello/nuovo.mjs": "// codice\n",
      "MyCity-Vault/90-Memoria-AI/STATO.md": "# x\n",
    });
    assert.equal(rc, 0);
  }));

// ── la regola è una sola ────────────────────────────────────────────────────
prova("l'hook IMPORTA la regola invece di ricopiarla", () => {
  const hook = readFileSync(join(REPO, ".githooks/pre-commit"), "utf8");
  assert.match(hook, /\.\s+"\$ROOT\/cervello\/gate-pubblicazione\.sh"/, "deve caricare il gate condiviso");
  assert.match(hook, /perimetro_ok "\$_staged"/, "deve usare la funzione, non una regex ricopiata");
  // Due copie di un perimetro non sono un perimetro: è il difetto che questo cancello impedisce.
  const copie = (hook.match(/MyCity-Vault\|consegne\|creativi\|memoria-squadra/g) || []).length;
  assert.ok(copie <= 1, `il perimetro è scritto ${copie} volte nell'hook: una per il messaggio, non di più`);
});

prova("il cancello non si spegne se manca il file della regola", () => {
  // Un cancello che si disattiva quando uno strumento manca non è un cancello (AR-322). Qui la
  // condizione è esplicita nell'hook: senza gate-pubblicazione.sh il perimetro non gira — e allora
  // il file DEVE esistere ed essere versionato.
  assert.ok(existsSync(join(REPO, "cervello/gate-pubblicazione.sh")), "il gate dev'essere versionato, non locale");
  const tracciato = execFileSync("git", ["ls-files", "cervello/gate-pubblicazione.sh"], { cwd: REPO, encoding: "utf8" });
  assert.ok(tracciato.trim().length > 0, "il gate dev'essere in git, altrimenti su un clone nuovo il cancello è muto");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
