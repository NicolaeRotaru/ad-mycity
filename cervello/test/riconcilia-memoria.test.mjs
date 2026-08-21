#!/usr/bin/env node
// La riconciliazione della memoria del server: che allinei, e soprattutto che NON perda niente.
//
// Dal 18/8 il server ha venti commit di memoria che non riesce a pubblicare: il rebase trova
// conflitti sugli stessi file che intanto main ha riscritto. Il copione taglia il nodo — archivia
// tutto e riallinea — e la promessa che fa a Nicola è una sola: **il lavoro del server non si
// perde**. Qui quella promessa viene misurata, non dichiarata: si costruisce una finta con la
// divergenza vera, si esegue, e poi si va a RIPESCARE dall'archivio un contenuto che esisteva solo
// nei commit del server. Se non torna fuori, la prova è rossa.

import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const COPIONE = join(REPO, "cervello/vps/riconcilia-memoria.sh");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

const git = (cwd, ...a) => execFileSync("git", a, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

/** origin e server divergenti sugli STESSI file di memoria: è il nodo vero, non una finta comoda. */
function seminaDivergenza() {
  const base = mkdtempSync(join(tmpdir(), "riconcilia-"));
  const origin = join(base, "origin.git");
  const semina = join(base, "semina");
  const server = join(base, "server");
  const MEM = "MyCity-Vault/90-Memoria-AI";

  execFileSync("git", ["init", "-q", "--bare", origin]);
  execFileSync("git", ["init", "-q", semina]);
  git(semina, "config", "user.email", "t@t");
  git(semina, "config", "user.name", "t");
  mkdirSync(join(semina, MEM, "auto-coscienza"), { recursive: true });
  mkdirSync(join(semina, MEM, "Briefing"), { recursive: true });
  writeFileSync(join(semina, MEM, "STATO.md"), "base\n");
  writeFileSync(join(semina, MEM, "auto-coscienza", "tasso-chiusura.json"), "{}\n");
  git(semina, "add", "-A");
  git(semina, "commit", "-q", "-m", "base");
  git(semina, "push", "-q", origin, "HEAD:main");

  execFileSync("git", ["clone", "-q", "--branch", "main", origin, server]);
  git(server, "config", "user.email", "t@t");
  git(server, "config", "user.name", "t");

  // main va avanti per conto suo
  writeFileSync(join(semina, MEM, "STATO.md"), "scritto da main\n");
  writeFileSync(join(semina, MEM, "auto-coscienza", "tasso-chiusura.json"), '{"da":"main"}\n');
  git(semina, "commit", "-qam", "main: aggiorna memoria");
  git(semina, "push", "-q", origin, "HEAD:main");

  // il server scrive gli STESSI file (il conflitto) PIÙ un briefing che esiste solo qui
  mkdirSync(join(server, MEM, "Briefing"), { recursive: true }); // git non traccia le cartelle vuote
  writeFileSync(join(server, MEM, "STATO.md"), "scritto dal server\n");
  writeFileSync(join(server, MEM, "auto-coscienza", "tasso-chiusura.json"), '{"da":"server"}\n');
  writeFileSync(join(server, MEM, "Briefing", "2026-08-19.md"), "IL-BRIEFING-CHE-SOLO-IL-SERVER-HA\n");
  git(server, "add", "-A");
  git(server, "commit", "-q", "-m", "giro AD: aggiorna memoria");
  writeFileSync(join(server, MEM, "STATO.md"), "scritto dal server, ancora\n");
  git(server, "commit", "-qam", "giro AD: aggiorna memoria (2)");

  return { base, origin, server };
}

const lancia = (server, origin, ...args) =>
  spawnSync("bash", [COPIONE, ...args], {
    cwd: server,
    encoding: "utf8",
    env: { ...process.env, REPO: server, GIT_BRANCH: "main" },
    timeout: 60_000,
  });

prova("in prova non tocca niente", () => {
  const { base, origin, server } = seminaDivergenza();
  try {
    const prima = git(server, "rev-parse", "HEAD").trim();
    const r = lancia(server, origin);
    assert.equal(r.status, 0, `uscita ${r.status}\n${r.stdout}${r.stderr}`);
    assert.equal(git(server, "rev-parse", "HEAD").trim(), prima, "ha spostato il ramo in modalità prova");
    assert.match(r.stdout, /PROVA: non ho toccato niente/);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

prova("vede i commit fermi e li divide fra rigenerabili e storia", () => {
  const { base, origin, server } = seminaDivergenza();
  try {
    const r = lancia(server, origin);
    assert.match(r.stdout, /commit che ha solo il server: 2/);
    assert.match(r.stdout, /1 report che i motori rigenerano/);
    assert.match(r.stdout, /Briefing\/2026-08-19\.md/, "non ha riconosciuto il briefing come storia");
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

prova("allinea il ramo a quello di GitHub", () => {
  const { base, origin, server } = seminaDivergenza();
  try {
    const r = lancia(server, origin, "--esegui");
    assert.equal(r.status, 0, `uscita ${r.status}\n${r.stdout}${r.stderr}`);
    assert.equal(
      git(server, "rev-parse", "HEAD").trim(),
      git(server, "rev-parse", "origin/main").trim(),
      "il ramo non è allineato: il server resterebbe bloccato",
    );
    assert.equal(readFileSync(join(server, "MyCity-Vault/90-Memoria-AI/STATO.md"), "utf8").trim(), "scritto da main");
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

prova("il lavoro del server si ripesca davvero dall'archivio", () => {
  // È LA PROMESSA. Non basta che il copione dica «archiviato»: il contenuto deve tornare fuori.
  const { base, origin, server } = seminaDivergenza();
  try {
    const r = lancia(server, origin, "--esegui");
    const dir = (r.stdout.match(/archiviato e riletto: (.+)/) || [])[1]?.trim();
    assert.ok(dir && existsSync(dir), `archivio non trovato in output:\n${r.stdout}`);

    const bundle = join(dir, "commit-del-server.bundle");
    assert.ok(existsSync(bundle), "manca il bundle");

    // ripesco: da un clone pulito tiro dentro il bundle e cerco il file che esisteva solo lì
    const ripesca = mkdtempSync(join(tmpdir(), "ripesca-"));
    execFileSync("git", ["clone", "-q", origin, ripesca]);
    git(ripesca, "fetch", "-q", bundle, "HEAD");
    const ritrovato = git(ripesca, "show", "FETCH_HEAD:MyCity-Vault/90-Memoria-AI/Briefing/2026-08-19.md");
    assert.match(ritrovato, /IL-BRIEFING-CHE-SOLO-IL-SERVER-HA/, "il lavoro del server NON si ripesca: promessa rotta");
    rmSync(ripesca, { recursive: true, force: true });

    assert.match(readFileSync(join(dir, "elenco-commit.txt"), "utf8"), /giro AD: aggiorna memoria/);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

// ── La zona cieca: il lavoro STACCATO dal ramo ────────────────────────────────────────────────────
//
// Il 21/8 il server dichiarava 28 commit di memoria fermi alle 03:35. Alle 03:43 questo copione ne
// contava ZERO e diceva «niente da salvare» — mentre su GitHub l'ultimo commit del server era del
// 18/8. Non erano stati pubblicati: erano stati staccati dal ramo da un riallineamento automatico.
// Il conto guardava solo ciò che si raggiunge da HEAD, e un verde che arriva un istante prima di
// allineare è il modo più diretto di buttare via il lavoro che si era promesso di salvare.
//
// Queste due prove diventano rosse se il copione smette di guardare nel registro dei movimenti.

/** Come sul server: i commit del server esistono, poi qualcosa sposta il ramo su origin/main. */
function seminaOrfani() {
  const f = seminaDivergenza();
  git(f.server, "fetch", "-q", "origin", "main");
  git(f.server, "reset", "--hard", "origin/main"); // ← il riallineamento che stacca tutto
  return f;
}

prova("vede il lavoro staccato dal ramo e NON dice «niente da salvare»", () => {
  const { base, origin, server } = seminaOrfani();
  try {
    // il conto vecchio, quello che mi aveva ingannata, adesso è zero su entrambi i versi
    assert.equal(git(server, "rev-list", "--count", "origin/main..HEAD").trim(), "0", "la finta non riproduce il caso");

    const r = lancia(server, origin);
    assert.doesNotMatch(
      r.stdout,
      /niente di suo da salvare/,
      `dice che non c'è niente da salvare mentre il lavoro è staccato:\n${r.stdout}`,
    );
    assert.match(r.stdout, /rimasti senza ramo[^\n]*[1-9]/, `non conta gli orfani:\n${r.stdout}`);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

prova("aggancia il lavoro staccato a un ramo vero, e da lì si rilegge", () => {
  // Il bundle è un file e i file si perdono. Un ramo no: finché un commit è raggiungibile da un
  // ramo, git non lo tocca. È QUESTO il salvataggio che conta.
  const { base, origin, server } = seminaOrfani();
  try {
    const r = lancia(server, origin, "--esegui");
    assert.equal(r.status, 0, `uscita ${r.status}\n${r.stdout}${r.stderr}`);

    const rami = git(server, "branch", "--list", "memoria-server-*")
      .split("\n")
      .map((x) => x.replace("*", "").trim())
      .filter(Boolean);
    assert.ok(rami.length > 0, `nessun ramo di salvataggio creato:\n${r.stdout}`);

    // il contenuto che esisteva SOLO nei commit staccati deve rileggersi da lì
    let trovato = false;
    for (const ramo of rami) {
      const out = spawnSync("git", ["show", `${ramo}:MyCity-Vault/90-Memoria-AI/Briefing/2026-08-19.md`], {
        cwd: server,
        encoding: "utf8",
      });
      if (out.status === 0 && /IL-BRIEFING-CHE-SOLO-IL-SERVER-HA/.test(out.stdout)) trovato = true;
    }
    assert.ok(trovato, `i rami di salvataggio non contengono il lavoro del server: ${rami.join(", ")}`);

    // e il ramo di lavoro resta allineato a GitHub: il server riparte
    assert.equal(git(server, "rev-parse", "HEAD").trim(), git(server, "rev-parse", "origin/main").trim());
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
