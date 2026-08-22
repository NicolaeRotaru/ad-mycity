#!/usr/bin/env node
// I CONFLITTI DI MEMORIA CHE NESSUNO RISOLVEVA — dodici commit fermi sul server.
//
// LA STORIA (22/8 09:20). La sera del 21 avevamo tolto l'ostacolo che impediva al rebase del server
// di PARTIRE. Il mattino dopo il rebase parte, e si ferma un passo più in là:
//
//     ⛔ commit del server non pubblicati — 12 commit restano qui.
//        Causa: il rebase ha trovato conflitti: vanno risolti a mano
//
// «A mano» sul server vuol dire «mai»: lassù non entra nessuno tutti i giorni. È la stessa malattia
// del giorno prima in un altro punto — un'operazione che sa rimandarsi e non ha un tetto rimanda per
// sempre, e da fuori sembra una macchina ferma.
//
// COSA PROVA QUESTO FILE, in ordine di importanza:
//   ① il RIFIUTO. Se fra i conflitti c'è un file che non è memoria — un file di codice, la coda delle
//      carte — non si tocca NIENTE, nemmeno gli altri. È il confine che rende accettabile una
//      risoluzione automatica, ed è la prova che deve reggere anche fra sei mesi.
//   ② che nessuna riga sparisca: i quaderni tengono entrambe le parti, gli archivi a id si uniscono.
//   ③ che i lati del rebase siano quelli GIUSTI. Al primo tentativo li avevo invertiti: durante un
//      rebase lo stadio 2 è main e il 3 è il commit del server, non il contrario. Su questa domanda
//      si chiede a git — perciò qui si costruiscono repo veri.
//
// 🟢 Sola lettura sul repo dell'AD: tutto avviene in /tmp.

import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";
import { classifica, fondiAppendOnly, fondiArchivioAId, risolvi } from "../conflitti-memoria.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));

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

const scrivi = (dir, rel, testo) => {
  mkdirSync(dirname(join(dir, rel)), { recursive: true });
  writeFileSync(join(dir, rel), testo);
};

const archivio = (ids) => `${JSON.stringify({ lezioni: ids.map((id) => ({ id, testo: `lezione ${id}` })) }, null, 1)}\n`;

/**
 * Un repo dove server e main hanno scritto tutti e due sugli stessi file di memoria, fermo a metà
 * rebase con i conflitti aperti. È la fotografia del server del 22/8 alle 09:20.
 * `extra` permette di aggiungere un file fuori perimetro, per provare il rifiuto.
 */
function repoInConflitto({ extra = null } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "conflitti-memoria-"));
  execFileSync("git", ["init", "-q", "-b", "main", dir]);
  git(dir, "config", "user.email", "t@t");
  git(dir, "config", "user.name", "t");

  scrivi(dir, "MyCity-Vault/90-Memoria-AI/DECISIONI.md", "# Decisioni\n\n- riga di partenza\n");
  scrivi(dir, "memoria-squadra/devops-sre.md", "## Esiti\n- esito di partenza\n");
  scrivi(dir, "MyCity-Vault/90-Memoria-AI/auto-coscienza/salute.json", '{"quando":"base"}\n');
  scrivi(dir, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json", archivio(["L-1"]));
  if (extra) scrivi(dir, extra.file, extra.base);
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "base");
  git(dir, "branch", "server");

  // main scrive
  scrivi(dir, "MyCity-Vault/90-Memoria-AI/DECISIONI.md", "# Decisioni\n\n- riga di partenza\n- SCRITTA DA MAIN\n");
  scrivi(dir, "memoria-squadra/devops-sre.md", "## Esiti\n- esito di partenza\n- ESITO DI MAIN\n");
  scrivi(dir, "MyCity-Vault/90-Memoria-AI/auto-coscienza/salute.json", '{"quando":"main, il piu recente"}\n');
  scrivi(dir, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json", archivio(["L-1", "L-DA-MAIN"]));
  if (extra) scrivi(dir, extra.file, extra.main);
  git(dir, "commit", "-qam", "main scrive la memoria");

  // il server scrive le SUE cose sugli stessi file
  git(dir, "checkout", "-q", "server");
  scrivi(dir, "MyCity-Vault/90-Memoria-AI/DECISIONI.md", "# Decisioni\n\n- riga di partenza\n- SCRITTA DAL SERVER\n");
  scrivi(dir, "memoria-squadra/devops-sre.md", "## Esiti\n- esito di partenza\n- ESITO DEL SERVER\n");
  scrivi(dir, "MyCity-Vault/90-Memoria-AI/auto-coscienza/salute.json", '{"quando":"server, piu vecchio"}\n');
  scrivi(dir, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json", archivio(["L-1", "L-DAL-SERVER"]));
  if (extra) scrivi(dir, extra.file, extra.server);
  git(dir, "commit", "-qam", "giro AD: memoria del server");

  // il rebase parte e si ferma sui conflitti: è lo stato del server
  try {
    git(dir, "rebase", "main");
  } catch {
    /* atteso: conflitti */
  }
  return dir;
}

const leggi = (dir, rel) => readFileSync(join(dir, rel), "utf8");

// ── ① IL CONFINE, che è la prova più importante ──────────────────────────────
prova("un conflitto FUORI dalla memoria blocca tutto, e non tocca nemmeno gli altri file", () => {
  const dir = repoInConflitto({
    extra: { file: "cervello/giro.sh", base: "echo base\n", main: "echo main\n", server: "echo server\n" },
  });
  try {
    const primaDecisioni = leggi(dir, "MyCity-Vault/90-Memoria-AI/DECISIONI.md");
    const r = risolvi(dir, { applica: true });
    assert.equal(r.esito, "fuori-perimetro", `atteso rifiuto, arrivato ${r.esito}`);
    assert.ok(r.fuori.includes("cervello/giro.sh"), `doveva nominare il file di codice: ${JSON.stringify(r.fuori)}`);
    assert.equal(
      leggi(dir, "MyCity-Vault/90-Memoria-AI/DECISIONI.md"),
      primaDecisioni,
      "ha risolto i file di memoria pur avendo rifiutato: una risoluzione a metà lascia il rebase in uno stato che nessuno ha scelto",
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("la coda delle carte NON è memoria automatica: lì decide una persona", () => {
  // I numeri delle carte e le chiusure sono giudizio, non meccanica: due volte in due giorni ho
  // dovuto risolverli a mano guardando il contenuto. Se finissero qui dentro sarebbe un danno.
  assert.equal(classifica("MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md"), "fuori-perimetro");
  assert.equal(classifica("cervello/giro.sh"), "fuori-perimetro");
  assert.equal(classifica("pannello/app/page.tsx"), "fuori-perimetro");
});

// ── ② NESSUNA RIGA SPARISCE ──────────────────────────────────────────────────
prova("sui file in coda restano ENTRAMBE le righe, di main e del server", () => {
  const dir = repoInConflitto();
  try {
    const r = risolvi(dir, { applica: true });
    assert.equal(r.esito, "risolti", `atteso risolti, arrivato ${r.esito} ${JSON.stringify(r.fuori || [])}`);
    const dec = leggi(dir, "MyCity-Vault/90-Memoria-AI/DECISIONI.md");
    assert.match(dec, /SCRITTA DA MAIN/, "persa la riga di main");
    assert.match(dec, /SCRITTA DAL SERVER/, "persa la riga del server: è il lavoro che stiamo cercando di salvare");
    const quaderno = leggi(dir, "memoria-squadra/devops-sre.md");
    assert.match(quaderno, /ESITO DI MAIN/);
    assert.match(quaderno, /ESITO DEL SERVER/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("l'archivio a id li tiene tutti e tre: nessuna lezione sparisce", () => {
  const dir = repoInConflitto();
  try {
    risolvi(dir, { applica: true });
    const a = JSON.parse(leggi(dir, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"));
    const ids = new Set(a.lezioni.map((l) => l.id));
    // per INSIEME e non per elenco ordinato: qui conta che non ne sparisca nessuna, non in che
    // ordine stanno. La prima versione confrontava un array ordinato e falliva sull'ordine
    // alfabetico invece che su una perdita — un rosso che non parlava del difetto.
    for (const atteso of ["L-1", "L-DA-MAIN", "L-DAL-SERVER"]) {
      assert.ok(ids.has(atteso), `manca ${atteso}: trovate ${[...ids].join(", ")}`);
    }
    assert.equal(ids.size, 3, `attese 3 lezioni, trovate ${ids.size}: ${[...ids].join(", ")}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── ③ I LATI DEL REBASE, chiesti a git e non dedotti ─────────────────────────
prova("sul registro rigenerato vince MAIN, non il server: i lati non sono invertiti", () => {
  // Al primo tentativo avevo scritto «stadio 3» per «la versione di main». Durante un rebase lo
  // stadio 3 è il commit DEL SERVER: il codice avrebbe fatto l'opposto del suo commento, tenendo la
  // fotografia più vecchia. Questa riga diventa rossa se qualcuno rimette l'inversione.
  const dir = repoInConflitto();
  try {
    risolvi(dir, { applica: true });
    const salute = leggi(dir, "MyCity-Vault/90-Memoria-AI/auto-coscienza/salute.json");
    assert.match(salute, /main, il piu recente/, `ha tenuto la copia sbagliata: ${salute.trim()}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("dopo la risoluzione il rebase arriva in fondo e i commit del server esistono", () => {
  const dir = repoInConflitto();
  try {
    risolvi(dir, { applica: true });
    execFileSync("git", ["-c", "core.editor=true", "rebase", "--continue"], {
      cwd: dir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, GIT_EDITOR: "true" },
    });
    const log = git(dir, "log", "--oneline");
    assert.match(log, /giro AD: memoria del server/, "il commit del server non è sopravvissuto al rebase");
    assert.match(log, /main scrive la memoria/, "manca il commit di main: il rebase non è arrivato in fondo");
    assert.equal(git(dir, "status", "--porcelain").trim(), "", "l'albero è rimasto sporco dopo il rebase");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── ④ IL COPIONE INTERO DEL SERVER, che è la cosa che deve funzionare ────────
// Le prove sopra guardano l'attrezzo. Questa guarda il risultato: il server, con dei commit di
// memoria in conflitto con main, deve arrivare a PUBBLICARE. Prima si fermava con «vanno risolti a
// mano» e i commit restavano lì — dodici, alle 09:20 del 22/8.
prova("il server pubblica davvero: il conflitto di memoria non lo blocca più", () => {
  const base = mkdtempSync(join(tmpdir(), "server-pubblica-"));
  const origin = join(base, "origin.git");
  const semina = join(base, "semina");
  const server = join(base, "server");
  const REPO_AD = join(QUI, "..", "..");
  try {
    execFileSync("git", ["init", "-q", "--bare", origin]);
    execFileSync("git", ["init", "-q", "-b", "main", semina]);
    git(semina, "config", "user.email", "t@t");
    git(semina, "config", "user.name", "t");

    // Si copia la cartella `cervello` INTERA, come sta sul server.
    // Il primo tentativo ne copiava sei file scelti a mano: il risolutore moriva su un modulo
    // mancante, il copione lo scambiava per un rifiuto, e la prova diceva «non pubblica» senza dire
    // perché. Un elenco di dipendenze scritto a mano è la trappola di AR-347 in un'altra forma.
    const copioni = (dove) => {
      execFileSync("cp", ["-r", join(REPO_AD, "cervello"), join(dove, "cervello")]);
    };

    scrivi(semina, "MyCity-Vault/90-Memoria-AI/DECISIONI.md", "# Decisioni\n\n- partenza\n");
    copioni(semina);
    git(semina, "add", "-A");
    git(semina, "commit", "-q", "-m", "base");
    git(semina, "push", "-q", origin, "HEAD:main");

    execFileSync("git", ["clone", "-q", "--branch", "main", origin, server]);
    git(server, "config", "user.email", "t@t");
    git(server, "config", "user.name", "t");

    // main scrive una decisione
    scrivi(semina, "MyCity-Vault/90-Memoria-AI/DECISIONI.md", "# Decisioni\n\n- partenza\n- DECISIONE DI MAIN\n");
    git(semina, "commit", "-qam", "main scrive");
    git(semina, "push", "-q", origin, "HEAD:main");

    // il server scrive la SUA sullo stesso file: conflitto garantito
    scrivi(server, "MyCity-Vault/90-Memoria-AI/DECISIONI.md", "# Decisioni\n\n- partenza\n- DECISIONE DEL SERVER\n");
    git(server, "commit", "-qam", "giro AD: decisione del server");

    const bin = join(base, "bin");
    mkdirSync(bin, { recursive: true });
    writeFileSync(join(bin, "id"), '#!/usr/bin/env bash\n[ "$1" = -un ] && { echo tester; exit 0; }\nexec /usr/bin/id "$@"\n');
    execFileSync("chmod", ["755", join(bin, "id")]);

    // spawnSync e non execFileSync: il copione puo' uscire con un codice suo anche dopo aver
    // pubblicato, e un throw qui nasconderebbe l'unica cosa che voglio guardare — cosa c'e' su
    // origin adesso.
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

    // il verdetto vero non è l'uscita del copione: è cosa c'è su origin adesso.
    if (process.env.MOSTRA) { console.log("--- rc", r.status); console.log(r.stdout); console.log(r.stderr); }
    const pubblicato = execFileSync("git", ["show", "main:MyCity-Vault/90-Memoria-AI/DECISIONI.md"], {
      cwd: origin,
      encoding: "utf8",
    });
    assert.match(pubblicato, /DECISIONE DEL SERVER/, `il lavoro del server NON è arrivato su GitHub (rc=${r.status}):\n${r.stdout}\n${r.stderr}`);
    assert.match(pubblicato, /DECISIONE DI MAIN/, "la decisione di main è stata sovrascritta: non doveva sparire niente");
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

// ── le funzioni pure, su ingressi finti ──────────────────────────────────────
prova("fondere due file in coda non duplica le righe uguali", () => {
  const out = fondiAppendOnly("a\nb\n", "a\nc\n");
  assert.equal(out, "a\nb\nc\n", `uscita: ${JSON.stringify(out)}`);
});

prova("fondere un archivio non duplica un id già presente", () => {
  const spec = { campo: "lezioni", chiave: "id" };
  const { testo, riaggiunte } = fondiArchivioAId(archivio(["L-1", "L-2"]), archivio(["L-2", "L-3"]), spec);
  const ids = JSON.parse(testo).lezioni.map((l) => l.id);
  assert.deepEqual(ids, ["L-1", "L-2", "L-3"]);
  assert.equal(riaggiunte, 1);
});

prova("un archivio malformato fa rumore invece di risolvere a caso", () => {
  assert.throws(() => fondiArchivioAId('{"altro":[]}', '{"altro":[]}', { campo: "lezioni", chiave: "id" }));
});

let falliti = 0;
for (const c of casi) {
  console.log(c.ok ? `  ✓ ${c.nome}` : `  ✗ ${c.nome}\n      ${c.err}`);
  if (!c.ok) falliti++;
}
console.log(`\n${casi.length - falliti}/${casi.length} passate`);
process.exit(falliti ? 1 : 0);
