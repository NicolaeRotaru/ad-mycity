#!/usr/bin/env node
// Il codice deve arrivare da main ANCHE quando i commit del server non si riescono a pubblicare.
//
// Il 20/8 il server è rimasto dodici giorni senza ricevere codice: aveva 19 commit di memoria che il
// rebase non riusciva a rimettere in fila, e `aggiorna-cervello.sh` usciva su quell'errore PRIMA di
// allineare il codice. Risultato: la riparazione del lucchetto, già mergiata su main, non è mai
// arrivata lassù — e la macchina non era più riparabile da remoto proprio mentre serviva ripararla.
//
// La finta riproduce il guasto VERO: server e main hanno scritto tutti e due sullo STESSO file di
// memoria, quindi il rebase va in conflitto e il codice non arriva da sé. Una finta col solo push
// rotto NON basta: lì il rebase riesce e porta il codice comunque, e il test resta verde col difetto.
//
// Scritto in .mjs e non in .bats apposta: bats non è installato dove il banco gira davvero, e una
// prova che nessuno esegue non è una prova (cancello «prove in bash senza esecutore»).

import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, chmodSync, copyFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
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

const git = (cwd, ...args) =>
  execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

/** origin con la riparazione + server fermo indietro, con memoria sua in conflitto. */
function seminaFinta() {
  const base = mkdtempSync(join(tmpdir(), "allineamento-"));
  const origin = join(base, "origin.git");
  const semina = join(base, "semina");
  const server = join(base, "server");

  execFileSync("git", ["init", "-q", "--bare", origin]);
  execFileSync("git", ["init", "-q", semina]);
  git(semina, "config", "user.email", "t@t");
  git(semina, "config", "user.name", "t");
  mkdirSync(join(semina, "cervello", "vps"), { recursive: true });
  mkdirSync(join(semina, "MyCity-Vault", "90-Memoria-AI"), { recursive: true });
  writeFileSync(join(semina, "cervello", "worker.sh"), "vecchio\n");
  writeFileSync(join(semina, "MyCity-Vault", "90-Memoria-AI", "STATO.md"), "base\n");
  git(semina, "add", "-A");
  git(semina, "commit", "-q", "-m", "base");
  git(semina, "push", "-q", origin, "HEAD:main");
  // main porta la riparazione E tocca la memoria: è il conflitto che blocca il rebase del server
  writeFileSync(join(semina, "cervello", "worker.sh"), "RIPARATO\n");
  writeFileSync(join(semina, "MyCity-Vault", "90-Memoria-AI", "STATO.md"), "memoria scritta su main\n");
  git(semina, "commit", "-qam", "fix del lucchetto + memoria");
  git(semina, "push", "-q", origin, "HEAD:main");

  execFileSync("git", ["clone", "-q", "--branch", "main", origin, server]);
  git(server, "config", "user.email", "t@t");
  git(server, "config", "user.name", "t");
  git(server, "reset", "-q", "--hard", "HEAD~1");
  writeFileSync(join(server, "MyCity-Vault", "90-Memoria-AI", "STATO.md"), "memoria scritta dal server\n");
  git(server, "commit", "-qam", "giro AD: aggiorna memoria");
  mkdirSync(join(server, "cervello", "vps"), { recursive: true });
  copyFileSync(join(REPO, "cervello/vps/aggiorna-cervello.sh"), join(server, "cervello/vps/aggiorna-cervello.sh"));
  copyFileSync(join(REPO, "cervello/allineamento-esito.sh"), join(server, "cervello/allineamento-esito.sh"));
  if (existsSync(join(REPO, "cervello/scritture-a-rischio.mjs"))) {
    copyFileSync(join(REPO, "cervello/scritture-a-rischio.mjs"), join(server, "cervello/scritture-a-rischio.mjs"));
  }
  git(server, "add", "-A");
  git(server, "commit", "-q", "-m", "copioni");

  // Da root il copione si ri-lancia via sudo come utente del server: qui quell'utente non c'è, e a
  // noi interessa il ramo che fa il lavoro. Ci presentiamo non-root.
  const bin = join(base, "bin");
  mkdirSync(bin, { recursive: true });
  writeFileSync(join(bin, "id"), '#!/usr/bin/env bash\n[ "$1" = -un ] && { echo tester; exit 0; }\nexec /usr/bin/id "$@"\n');
  chmodSync(join(bin, "id"), 0o755);

  return { base, origin, server, bin };
}

prova("la memoria che non si pubblica NON impedisce al codice di arrivare da main", () => {
  const { base, origin, server, bin } = seminaFinta();
  try {
    const r = spawnSync("bash", ["cervello/vps/aggiorna-cervello.sh"], {
      cwd: server,
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${bin}:${process.env.PATH}`,
        REPO: server,
        GIT_BRANCH: "main",
        GIT_REMOTE_URL: origin,
        GIT_PUSH_TOKEN: "finto",
        GIT_REPO: "finto/finto",
      },
    });

    // esce 5: «commit del server non pubblicati» — il segnale resta quello giusto
    assert.equal(r.status, 5, `uscita attesa 5, arrivata ${r.status}\n${r.stdout}${r.stderr}`);
    // ...ma la riparazione è arrivata lo stesso: è questa la riga che diventa rossa col difetto
    assert.equal(
      readFileSync(join(server, "cervello", "worker.sh"), "utf8").trim(),
      "RIPARATO",
      "il codice di main NON è arrivato: l'uscita d'errore copre di nuovo l'allineamento",
    );
    // ...e il commit del server è ancora qui, non buttato
    assert.match(git(server, "log", "--oneline"), /giro AD: aggiorna memoria/, "il commit del server è sparito");
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
