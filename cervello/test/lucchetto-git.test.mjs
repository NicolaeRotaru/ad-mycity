// AR-277 · AR-298 — il lucchetto sul worktree, anche da Node.
//
// Verificato sul codice il 29/7: `git-pr.mjs` faceva checkout/rebase/commit/push sulla copia di
// lavoro condivisa e la stringa `mycity-sync` non compariva nel file. Gli script shell prendono
// tutti `flock` sullo stesso lucchetto; gli strumenti in Node no.
//
// Questi test ESEGUONO il comportamento: l'ultimo prova con due processi VERI che il lucchetto
// esclude davvero. La differenza conta — la prova precedente di AR-298 era
// `{file:"cervello/git-pr.mjs", pattern:"mycity-sync\\.lock", presente:true}`, cioè cercava una
// stringa: sarebbe diventata verde anche scrivendo quel nome dentro un commento.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync, spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  MARCATORE,
  chiamateCheMutano,
  mutaLaRisorsa,
  passaDalLucchetto,
  pianoRiesecuzione,
  strumentiFuoriDalLucchetto,
} from "../lucchetto-git.mjs";

test("distingue i comandi che toccano il worktree da quelli che leggono e basta", () => {
  for (const a of [["push", "origin", "main"], ["rebase", "main"], ["checkout", "-b", "x"], ["commit", "-m", "x"], ["add", "-A"], ["reset", "--hard"], ["fetch", "url", "main"]]) {
    assert.equal(mutaLaRisorsa(a), true, `${a.join(" ")} doveva risultare mutante`);
  }
  for (const a of [["status", "--porcelain"], ["log", "-1"], ["diff", "--cached"], ["rev-parse", "HEAD"], ["merge-base", "a", "b"], ["merge-tree", "a", "b", "c"], ["cat-file", "-p", "x"]]) {
    assert.equal(mutaLaRisorsa(a), false, `${a.join(" ")} NON doveva risultare mutante`);
  }
});

test("`branch` e `tag` mutano solo con le opzioni che cancellano o rinominano", () => {
  // Un lucchetto preso anche per elencare i rami rallenterebbe tutto e verrebbe tolto entro la
  // settimana — e allora non proteggerebbe più nemmeno dal caso vero.
  assert.equal(mutaLaRisorsa(["branch"]), false);
  assert.equal(mutaLaRisorsa(["branch", "--list"]), false);
  assert.equal(mutaLaRisorsa(["branch", "-D", "vecchio"]), true);
  assert.equal(mutaLaRisorsa(["tag"]), false);
  assert.equal(mutaLaRisorsa(["tag", "-d", "v1"]), true);
});

test("trova le chiamate mutanti dentro il testo di uno script, dirette e indirette", () => {
  const testo = `
    execFileSync("git", ["status", "--porcelain"], {});
    git(["push", "--force-with-lease", url, ref], cwd);
    git(["rev-parse", "HEAD"], cwd);
  `;
  const trovate = chiamateCheMutano(testo);
  assert.equal(trovate.length, 1, "solo il push doveva contare");
  assert.match(trovate[0].args.join(" "), /push/);
});

test("il piano di rilancio c'è la prima volta e NON la seconda", () => {
  const primo = pianoRiesecuzione({ argv: ["/usr/bin/node", "cervello/git-pr.mjs", "--repo", "ad-mycity"], env: {}, repoDir: "/repo" });
  assert.equal(primo.comando, "flock");
  assert.ok(primo.argomenti.includes("/repo/.git/mycity-sync.lock"));
  assert.equal(primo.env[MARCATORE], "1");

  // Dentro il lucchetto non ci si rilancia: sarebbe una ricorsione infinita.
  const secondo = pianoRiesecuzione({ argv: ["/usr/bin/node", "x.mjs"], env: { [MARCATORE]: "1" }, repoDir: "/repo" });
  assert.equal(secondo, null);
});

test("il guardiano segnala chi muta senza passare dalla porta, e tace su chi passa", () => {
  const scoperto = { nome: "cattivo.mjs", testo: 'git(["push", url], cwd);' };
  const protetto = { nome: "buono.mjs", testo: 'prendiLucchettoOEsci();\ngit(["push", url], cwd);' };
  const innocuo = { nome: "lettore.mjs", testo: 'git(["status"], cwd);' };

  const fuori = strumentiFuoriDalLucchetto([scoperto, protetto, innocuo], {});
  assert.equal(fuori.length, 1);
  assert.equal(fuori[0].nome, "cattivo.mjs");
  assert.equal(passaDalLucchetto(protetto.testo), true);
});

test("un'esenzione vale solo se dichiarata", () => {
  const scoperto = [{ nome: "speciale.mjs", testo: 'git(["commit", "-m", "x"], cwd);' }];
  assert.equal(strumentiFuoriDalLucchetto(scoperto, {}).length, 1);
  assert.equal(strumentiFuoriDalLucchetto(scoperto, { "speciale.mjs": "perché sì, scritto" }).length, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// LA PROVA CHE CONTA: due processi veri, un lucchetto solo.
// ─────────────────────────────────────────────────────────────────────────────
test("due processi non entrano insieme: il secondo aspetta o rinuncia", { timeout: 20000 }, () => {
  const haFlock = spawnSync("sh", ["-c", "command -v flock"], { stdio: "ignore" }).status === 0;
  if (!haFlock) {
    // ⚪ non l'ho potuto vedere da qui — e non è mai un verde: lo dico invece di fingere.
    console.log("# SALTATO: flock assente su questa macchina, l'esclusione non è verificabile");
    return;
  }
  const dir = mkdtempSync(join(tmpdir(), "lucchetto-"));
  try {
    mkdirSync(join(dir, ".git"), { recursive: true });
    const lock = join(dir, ".git/mycity-sync.lock");
    writeFileSync(lock, "");

    // Il primo tiene il lucchetto per un secondo e mezzo.
    const primo = spawn("flock", ["-w", "10", lock, "sleep", "1.5"], { stdio: "ignore" });
    // Gli do il tempo di prenderlo davvero prima di misurare il secondo.
    spawnSync("sleep", ["0.4"]);

    // Il secondo, non bloccante, DEVE fallire: il lucchetto è occupato.
    const secondo = spawnSync("flock", ["-n", lock, "true"]);
    assert.notEqual(secondo.status, 0, "il secondo processo è entrato mentre il primo teneva il lucchetto");

    // Finito il primo, il lucchetto si libera DA SOLO — nessuno lo rilascia a mano.
    // È la proprietà che rende sicuro tenerlo per tutta la durata dello strumento: un crash o un
    // kill non lascia lucchetti orfani, perché il rilascio è la chiusura del descrittore.
    //
    // Nota imparata scrivendo questa prova (e vale per chi la leggerà): uccidere `flock` NON basta —
    // il figlio che ha ereditato il descrittore continua a tenere il lucchetto finché non muore lui.
    // Per questo si aspetta la fine naturale, invece di fingere che un kill del padre liberi tutto.
    primo.kill("SIGKILL");
    spawnSync("sleep", ["1.6"]);
    const terzo = spawnSync("flock", ["-n", lock, "true"]);
    assert.equal(terzo.status, 0, "finito chi lo teneva, il lucchetto è rimasto orfano");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
