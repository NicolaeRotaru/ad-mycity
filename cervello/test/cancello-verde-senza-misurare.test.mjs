#!/usr/bin/env node
// 🧪 AR-473 · AR-460 — IL CANCELLO DICEVA VERDE SU CIÒ CHE NON AVEVA MISURATO.
//
// Due passi del cancello prendono il loro riferimento dal diff di git, e in due situazioni OPPOSTE
// finivano per non misurare niente — uscendo 0 e venendo stampati come ✅.
//
//   ① LA FORMA DEI JSON. `origin/main...HEAD` vede i COMMIT del ramo, non il disco: a metà lavoro,
//      col working tree sporco, stampava «nessun JSON toccato da questo ramo». Cioè era cieco
//      esattamente nel momento in cui uno lo lancia. E in una sessione cloud il clone è superficiale,
//      `origin/main` non esiste, non c è un riferimento: ogni file sembrava «nuovo» e il verdetto
//      tornava verde per la ragione peggiore (AR-460).
//   ② LE MUTAZIONI. Il passo che rompe il fix apposta — l unico che misura se gli ALTRI controlli
//      servono a qualcosa — girava solo sui difetti «toccati». Su un clone superficiale, dopo il
//      commit, i pezzi già committati non risultano toccati: zero difetti, il passo spariva
//      dall elenco senza una riga, e il verdetto finale restava «✅ SI PUÒ CONSEGNARE».
//
// Provato sul repo vero l 11/8: il guardiano di prima, con due JSON modificati sul disco, ha stampato
// «nessun JSON toccato da questo ramo» ed è uscito 0.
//
// QUI SI ESEGUONO I GUARDIANI VERI — i file di produzione, in repo finti costruiti su misura. Non si
// cerca una parola nel sorgente: si guarda il codice d uscita.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, cpSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { mutazioniNonGirate } = await import(join(REPO, "cervello", "cancello-lotto.mjs"));

const GIT = ["-c", "user.email=prova@mycity.test", "-c", "user.name=prova", "-c", "commit.gpgsign=false"];
const git = (dir, ...args) => spawnSync("git", [...GIT, ...args], { cwd: dir, encoding: "utf8" });

/** Un JSON scritto con l'indentazione chiesta: è la cosa che il guardiano deve saper vedere cambiare. */
const dati = (spazi) => `${JSON.stringify({ a: 1, b: { c: 2 } }, null, spazi)}\n`;

/**
 * Un repo finto con dentro il guardiano VERO.
 *
 * Si copiano i tre file che compongono il controllo — forma-json, la porta degli elenchi git e il
 * modulo del verdetto — e si sostituisce `git-github.mjs` con un guscio che espone le due sole cose
 * che il guardiano gli chiede. Così ciò che gira è il codice di produzione, e ciò che è finto è solo
 * il pezzo che con questa decisione non c'entra.
 */
function repoFinto() {
  const dir = mkdtempSync(join(tmpdir(), "forma-json-"));
  mkdirSync(join(dir, "cervello"));
  for (const f of ["forma-json.mjs", "percorsi-git.mjs", "misura-o-cieco.mjs"]) {
    cpSync(join(REPO, "cervello", f), join(dir, "cervello", f));
  }
  writeFileSync(
    join(dir, "cervello", "git-github.mjs"),
    [
      'import { resolve, dirname } from "node:path";',
      'import { fileURLToPath } from "node:url";',
      'export const AD_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");',
      'export const nowPiacenza = () => "2026-08-13 22:00";',
      "",
    ].join("\n"),
  );

  git(dir, "init", "-q", "-b", "lavoro");
  writeFileSync(join(dir, "dati.json"), dati(2));
  git(dir, "add", "-A");
  git(dir, "commit", "-qm", "base");
  // Il ramo pubblicato, come lo vede un clone normale.
  const sha = git(dir, "rev-parse", "HEAD").stdout.trim();
  git(dir, "update-ref", "refs/remotes/origin/main", sha);
  return dir;
}

function lancia(dir, ...args) {
  const r = spawnSync(process.execPath, [join(dir, "cervello", "forma-json.mjs"), ...args], { cwd: dir, encoding: "utf8" });
  return { rc: r.status, out: `${r.stdout}${r.stderr}` };
}

test("AR-473 — un JSON riformattato SOLO sul disco viene visto: rosso, non verde", () => {
  const dir = repoFinto();
  try {
    writeFileSync(join(dir, "dati.json"), dati(1)); // riformattato, mai committato
    const { rc, out } = lancia(dir);
    assert.equal(rc, 1, `il ramo non ha commit: prima usciva 0 dicendo «nessun JSON toccato». Uscita:\n${out}`);
    assert.match(out, /dati\.json/, "deve nominare il file che ha cambiato forma");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("AR-473 — un JSON toccato sul disco ma con la forma giusta viene CONTATO, non saltato", () => {
  const dir = repoFinto();
  try {
    writeFileSync(join(dir, "dati.json"), `${JSON.stringify({ a: 9, b: { c: 2 } }, null, 2)}\n`);
    const { rc, out } = lancia(dir, "--json");
    assert.equal(rc, 0, `uscita:\n${out}`);
    const v = JSON.parse(out);
    assert.equal(v.controllati, 1, "se contasse 0 sarebbe di nuovo un verde che non ha guardato niente");
    assert.equal(v.esito, "ok");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("AR-460 — senza il riferimento pubblicato il verdetto è ⚪ (exit 2), mai verde", () => {
  const dir = repoFinto();
  try {
    // È la sessione cloud: il clone è superficiale e `origin/main` non c'è.
    git(dir, "update-ref", "-d", "refs/remotes/origin/main");
    const { rc, out } = lancia(dir);
    assert.equal(rc, 2, `senza riferimento non si può dire «nessuno ha cambiato indentazione». Uscita:\n${out}`);
    assert.match(out, /origin\/main non raggiungibile|non ho misurato/i, "deve DIRE cosa non ha guardato");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("AR-460 — senza riferimento, ma con una violazione trovata, resta ROSSO: il buco non annacqua l'accusa", () => {
  const dir = repoFinto();
  try {
    git(dir, "update-ref", "-d", "refs/remotes/origin/main");
    writeFileSync(join(dir, "dati.json"), dati(1));
    const { rc } = lancia(dir);
    assert.equal(rc, 1, "aver visto poco non rende meno vero ciò che si è visto");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("il verde onesto resta verde: niente di sporco e il riferimento c'è → 0", () => {
  const dir = repoFinto();
  try {
    const { rc, out } = lancia(dir);
    assert.equal(rc, 0, `un guardiano che non può mai essere verde si impara a saltare. Uscita:\n${out}`);
    assert.match(out, /nessun JSON toccato/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("--staged continua a misurare l'indice, non il disco (AR-511 non si disfa)", () => {
  const dir = repoFinto();
  try {
    writeFileSync(join(dir, "dati.json"), dati(1));
    git(dir, "add", "dati.json");
    const { rc, out } = lancia(dir, "--staged");
    assert.equal(rc, 1, `la riformattazione messa in staging dev'essere fermata al commit. Uscita:\n${out}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ═══ ② il passo delle mutazioni che spariva ═══════════════════════════════════


// ── ① la decisione ───────────────────────────────────────────────────────────

test("se il passo ha girato, non c'è niente da dichiarare", () => {
  assert.equal(mutazioniNonGirate({ toccati: ["AR-1"], quanteMutazioni: 2, cantiereCambiato: true }), null);
});

test("se non so quali difetti tocca il lotto, lo dico: è cecità, non «niente da fare»", () => {
  const m = mutazioniNonGirate({ toccati: null, quanteMutazioni: 0, cantiereCambiato: true });
  assert.ok(m && /non so quali difetti/.test(m), `atteso un motivo, ricevuto: ${m}`);
});

test("cantiere cambiato ma zero difetti toccati → cieco (è il clone superficiale)", () => {
  const m = mutazioniNonGirate({ toccati: [], quanteMutazioni: 0, cantiereCambiato: true });
  assert.ok(m && /clone superficiale/.test(m), `atteso un motivo, ricevuto: ${m}`);
});

test("lotto che non lavora sui difetti → nessuna mutazione da rompere, ed è VERO", () => {
  assert.equal(
    mutazioniNonGirate({ toccati: [], quanteMutazioni: 0, cantiereCambiato: false }),
    null,
    "un cancello che non può mai essere verde si impara a saltare: qui il verde è onesto",
  );
});

test("mutanti.json illeggibile → il passo non ha girato, e si dice", () => {
  const m = mutazioniNonGirate({ mutantiLetti: false, toccati: ["AR-1"], quanteMutazioni: 0 });
  assert.ok(m && /mutanti\.json/.test(m));
});

// ── ② il punto che la chiama ─────────────────────────────────────────────────


/** Un cantiere minimo e sano: una scheda aperta con una prova che esegue e un file che esiste. */
function cantiere(nota) {
  return {
    difetti: [
      {
        id: "AR-924",
        titolo: "difetto finto per la prova",
        gravita: "grave",
        stato: "aperto",
        nato: "2026-01-01 10:00",
        impatto_crescita: "basso",
        nota_fix: nota,
        verifica: { comando: "node cervello/prova-finta.test.mjs" },
      },
    ],
  };
}

/** Un repo finto con dentro il cervello VERO: ciò che gira è il cancello di produzione. */
function repoFintoCantiere() {
  const dir = mkdtempSync(join(tmpdir(), "cancello-"));
  cpSync(join(REPO, "cervello"), join(dir, "cervello"), {
    recursive: true,
    filter: (src) => !src.includes(`${"cervello"}/test`) && !src.includes(`${"cervello"}/vps`),
  });
  mkdirSync(join(dir, "MyCity-Vault/90-Memoria-AI/auto-coscienza"), { recursive: true });
  writeFileSync(join(dir, "cervello/prova-finta.test.mjs"), "// il file a cui punta la prova: esiste\n");
  writeFileSync(join(dir, "cervello/mutanti.json"), `${JSON.stringify({ mutanti: [] }, null, 1)}\n`);
  writeFileSync(join(dir, "cervello/tetti-lotto.json"), `${JSON.stringify({ prova_con_or: 99, mutazione_mancante: 99, prova_debole: 999 }, null, 1)}\n`);
  writeFileSync(join(dir, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), `${JSON.stringify(cantiere("prima"), null, 1)}\n`);

  git(dir, "init", "-q", "-b", "lavoro");
  git(dir, "add", "-A");
  git(dir, "commit", "-qm", "base");
  git(dir, "update-ref", "refs/remotes/origin/main", git(dir, "rev-parse", "HEAD").stdout.trim());
  return dir;
}

/**
 * Il cancello VERO, con l'elenco dei ciechi in forma leggibile.
 *
 * `--veloce --json`: in un repo finto molti guardiani falliranno per ragioni loro (manca il vault,
 * mancano gli hook) e il codice d'uscita non dice niente su questa decisione. Ciò che si guarda è
 * `ciechiProve` — la colonna che, a differenza degli avvisi, cambia il verdetto: finché il motivo
 * finiva fra gli avvisi, «non ho misurato» viaggiava sotto un ✅.
 */
function ciechiDelCancello(dir) {
  const r = spawnSync(process.execPath, [join(dir, "cervello", "cancello-lotto.mjs"), "--veloce", "--json"], {
    cwd: dir,
    encoding: "utf8",
    timeout: 300_000,
  });
  try {
    return JSON.parse(r.stdout).ciechiProve || [];
  } catch {
    throw new Error(`il cancello non ha prodotto JSON leggibile:\n${r.stdout}\n${r.stderr}`);
  }
}

test("il cancello vero: cantiere cambiato senza difetti toccati → il ⚪ viene dichiarato", () => {
  const dir = repoFintoCantiere();
  try {
    assert.equal(
      ciechiDelCancello(dir).some((c) => /non ha girato/.test(c)),
      false,
      "col cantiere identico al ramo pubblicato non c'è niente da provare: il ⚪ qui sarebbe rumore",
    );

    // Il lotto lavora — cambia una nota — ma non tocca nessuna `verifica`: è la forma esatta di ciò
    // che vede il cancello su un clone superficiale con il lavoro già committato.
    const p = join(dir, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
    writeFileSync(p, `${JSON.stringify(cantiere("dopo"), null, 1)}\n`);
    assert.notEqual(readFileSync(p, "utf8"), git(dir, "show", "origin/main:MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json").stdout);

    const ciechi = ciechiDelCancello(dir);
    assert.ok(
      ciechi.some((c) => /la prova che le prove provino non ha girato/.test(c)),
      `il passo non ha girato e il cancello deve dirlo. Ciechi dichiarati: ${JSON.stringify(ciechi)}`,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("un cieco dichiarato fa uscire il cancello 2, non 0 (il collegamento che rende utile la riga)", async () => {
  const { readFileSync: leggi } = await import("node:fs");
  const src = leggi(join(REPO, "cervello", "cancello-lotto.mjs"), "utf8");
  assert.match(
    src,
    /if \(ciechi\.length \|\| ciechiProve\.length\) process\.exit\(2\)/,
    "senza questa riga `ciechiProve` sarebbe una colonna che non cambia niente, cioè un avviso con un altro nome",
  );
});
