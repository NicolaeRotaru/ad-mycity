#!/usr/bin/env node
// 🧪 AR-830 — il comando che dà il numero libero non guardava dove la collisione è ancora evitabile.
//
// Il 25/8, in un giorno solo, la stessa collisione due volte.
//
// La prima l'ho scoperta contando male una fusione: 536 + 1 + 1 doveva fare 538 e faceva 537. La
// scheda mancante era la mia AR-814 — main ne aveva già una con quel numero, scritta da un'altra
// sessione. Se non avessi fatto quel conto sarebbe sparita in silenzio.
//
// La seconda l'ho evitata per fortuna: prima di scrivere sono andato a leggere il lavoro di
// un'altra sessione e ho visto che teneva tre numeri su un ramo aperto. Stavo per dare esattamente
// quei tre.
//
// LA RADICE. `prossimo-ar.mjs` è nato apposta per non cercare il numero libero nella propria copia
// («come guardare l'orologio fermo»). Poi però lo cercava in due posti soli: qui e su main. Ma un
// numero preso da un'altra sessione NON è ancora su main — vive per ore su un ramo aperto. La
// finestra in cui la collisione è possibile era esattamente la finestra che il comando non guardava.
//
// Queste prove girano su repository FINTI, con la radice sostituita: un guardiano che non è mai
// stato visto fallire non si distingue da uno che non guarda.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { numeriUsati, prossimiLiberi, ramiRemoti, cantiereDiRamo, CANTIERE } from "../prossimo-ar.mjs";

const COMANDO = join(import.meta.dirname, "..", "prossimo-ar.mjs");

const git = (dove, ...a) =>
  execFileSync("git", a, { cwd: dove, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

/** Un repo finto con un `origin` vero, così `refs/remotes/origin/*` esiste davvero. */
function repoFinto(schedeSuMain) {
  const radice = mkdtempSync(join(tmpdir(), "ar-numeri-"));
  const origine = join(radice, "origine");
  const copia = join(radice, "copia");
  mkdirSync(origine);
  git(origine, "init", "--quiet", "--initial-branch=main");
  git(origine, "config", "user.email", "prova@example.com");
  git(origine, "config", "user.name", "prova");
  scriviCantiere(origine, schedeSuMain);
  git(origine, "add", "-A");
  git(origine, "commit", "--quiet", "-m", "main");
  return { radice, origine, copia };
}

function scriviCantiere(dove, numeri, testo) {
  mkdirSync(join(dove, dirname(CANTIERE)), { recursive: true });
  writeFileSync(
    join(dove, CANTIERE),
    testo ?? JSON.stringify({ difetti: numeri.map((n) => ({ id: `AR-${n}`, titolo: `finta ${n}` })) }, null, 2),
  );
}

/** Un ramo aperto sull'origine, con i suoi numeri, NON fuso dentro main. */
function ramoAperto(origine, nome, numeri, testo) {
  git(origine, "checkout", "--quiet", "-b", nome);
  scriviCantiere(origine, numeri, testo);
  git(origine, "add", "-A");
  git(origine, "commit", "--quiet", "-m", nome);
  git(origine, "checkout", "--quiet", "main");
}

/**
 * Un ramo aperto dove il cantiere è DAVVERO assente.
 *
 * Serviva un helper apposta perché il primo tentativo passava per il motivo sbagliato: un ramo
 * tagliato da main EREDITA il cantiere di main. Aggiungere solo un file nuovo non toglie niente, e
 * la prova diceva «verde» misurando un ramo che il file ce l'aveva. Il modo di sbagliare più
 * silenzioso di tutti — una prova che non prova.
 */
function ramoSenzaCantiere(origine, nome) {
  git(origine, "checkout", "--quiet", "-b", nome);
  git(origine, "rm", "--quiet", CANTIERE);
  writeFileSync(join(origine, "altro.txt"), "niente schede qui\n");
  git(origine, "add", "-A");
  git(origine, "commit", "--quiet", "-m", nome);
  git(origine, "checkout", "--quiet", "main");
}

function clona({ origine, copia }) {
  execFileSync("git", ["clone", "--quiet", origine, copia], { encoding: "utf8" });
  return copia;
}

const chiedi = (casa, ...a) =>
  spawnSync(process.execPath, [COMANDO, ...a], {
    encoding: "utf8",
    env: { ...process.env, PROSSIMO_AR_ROOT: casa },
  });

// ── il difetto, ricreato ───────────────────────────────────────────────────

test("un numero già preso su un ramo aperto NON viene proposto una seconda volta", () => {
  const r = repoFinto([100, 101]);
  ramoAperto(r.origine, "claude/un-altra-sessione", [100, 101, 102, 103]);
  const casa = clona(r);
  try {
    const out = chiedi(casa);
    assert.equal(out.status, 0, `atteso 0, ottenuto ${out.status}:\n${out.stderr}`);
    assert.equal(
      out.stdout.trim(),
      "AR-104",
      "AR-102 e AR-103 vivono su un ramo aperto: riproporli è la collisione del 25/8, ricreata",
    );
  } finally {
    rmSync(r.radice, { recursive: true, force: true });
  }
});

test("con più rami aperti prende il massimo di tutti, non del primo che incontra", () => {
  const r = repoFinto([100]);
  ramoAperto(r.origine, "claude/sessione-a", [100, 110]);
  ramoAperto(r.origine, "claude/sessione-b", [100, 105]);
  const casa = clona(r);
  try {
    assert.equal(chiedi(casa).stdout.trim(), "AR-111");
  } finally {
    rmSync(r.radice, { recursive: true, force: true });
  }
});

test("--quanti resta coerente con la fonte in più", () => {
  const r = repoFinto([100]);
  ramoAperto(r.origine, "claude/sessione-a", [100, 120]);
  const casa = clona(r);
  try {
    assert.equal(chiedi(casa, "--quanti", "3").stdout.trim(), "AR-121 AR-122 AR-123");
  } finally {
    rmSync(r.radice, { recursive: true, force: true });
  }
});

// ── i confini: cosa NON deve considerare ───────────────────────────────────

test("un ramo già dentro main non allarga niente: i suoi numeri sono quelli di main", () => {
  const r = repoFinto([100]);
  ramoAperto(r.origine, "claude/gia-fuso", [100, 130]);
  git(r.origine, "merge", "--quiet", "--no-ff", "-m", "fusione", "claude/gia-fuso");
  const casa = clona(r);
  try {
    const out = chiedi(casa);
    assert.equal(out.status, 0, out.stderr);
    assert.equal(out.stdout.trim(), "AR-131", "dopo la fusione quel numero è su main, e main lo leggo comunque");
    assert.match(out.stderr, /su 0 ramo/, "il ramo fuso non va contato come fonte a sé");
  } finally {
    rmSync(r.radice, { recursive: true, force: true });
  }
});

test("un ramo aperto SENZA cantiere non è un errore: non ha numeri da scontrare", () => {
  const r = repoFinto([100]);
  ramoSenzaCantiere(r.origine, "chore/nessun-cantiere");
  const casa = clona(r);
  try {
    const out = chiedi(casa);
    assert.equal(out.status, 0, `un ramo senza il file non è cecità:\n${out.stderr}`);
    assert.equal(out.stdout.trim(), "AR-101");
  } finally {
    rmSync(r.radice, { recursive: true, force: true });
  }
});

// ── ⚪ non è mai un verde ───────────────────────────────────────────────────

test("un cantiere illeggibile su un ramo aperto è ⚪, non un numero dato lo stesso", () => {
  const r = repoFinto([100]);
  ramoAperto(r.origine, "claude/rotto", null, "{ questo non è JSON");
  const casa = clona(r);
  try {
    const out = chiedi(casa);
    assert.equal(out.status, 2, `atteso ⚪ (2), ottenuto ${out.status}:\n${out.stdout}${out.stderr}`);
    assert.equal(out.stdout.trim(), "", "in ⚪ non deve uscire NESSUN numero: è quello il punto");
    assert.match(out.stderr, /claude\/rotto/, "deve dire QUALE ramo non ha letto, o non è un rimedio");
  } finally {
    rmSync(r.radice, { recursive: true, force: true });
  }
});

test("fuori da un repo git non inventa un numero", () => {
  const fuori = mkdtempSync(join(tmpdir(), "ar-non-repo-"));
  try {
    const out = chiedi(fuori);
    assert.equal(out.status, 2, "senza le fonti la risposta giusta è «non rispondo»");
    assert.equal(out.stdout.trim(), "");
  } finally {
    rmSync(fuori, { recursive: true, force: true });
  }
});

// ── i pezzi, presi da soli ─────────────────────────────────────────────────

test("ramiRemoti esclude main e HEAD, e tiene i rami aperti", () => {
  const r = repoFinto([100]);
  ramoAperto(r.origine, "claude/viva", [100, 140]);
  const casa = clona(r);
  try {
    const rami = ramiRemoti(casa);
    assert.ok(
      rami.some((x) => x.endsWith("/claude/viva")),
      `il ramo aperto deve esserci: ${JSON.stringify(rami)}`,
    );
    assert.ok(!rami.some((x) => /\/(main|HEAD)$/.test(x)), `main e HEAD non sono fonti a sé: ${JSON.stringify(rami)}`);
  } finally {
    rmSync(r.radice, { recursive: true, force: true });
  }
});

test("cantiereDiRamo distingue «il file non c'è» da «il file non si legge»", () => {
  const r = repoFinto([100]);
  ramoAperto(r.origine, "claude/rotto", null, "{ non JSON");
  ramoSenzaCantiere(r.origine, "chore/vuoto");
  const casa = clona(r);
  try {
    assert.equal(cantiereDiRamo("origin/chore/vuoto", casa), null, "non c'è → null, niente da confrontare");
    assert.throws(
      () => cantiereDiRamo("origin/claude/rotto", casa),
      "c'è e non si legge → deve propagarsi, o divento cieco senza accorgermene",
    );
  } finally {
    rmSync(r.radice, { recursive: true, force: true });
  }
});

test("prossimiLiberi resta la funzione pura di prima, con una fonte in più", () => {
  assert.deepEqual(prossimiLiberi([[1, 2], [5], [9]], 2), [10, 11]);
  assert.deepEqual(numeriUsati([{ id: "AR-7" }, { id: "L-2026-01" }, {}]), [7]);
});

// ── il comando montato, sulla casa vera ────────────────────────────────────

test("sulla casa vera dà un numero e dichiara tutte e tre le fonti", () => {
  const out = spawnSync(process.execPath, [COMANDO, "--json"], { encoding: "utf8" });
  assert.equal(out.status, 0, `${out.stdout}${out.stderr}`);
  const v = JSON.parse(out.stdout);
  assert.match(v.id[0], /^AR-\d+$/);
  assert.ok(v.suMain > 0 && v.locali > 0);
  assert.ok(typeof v.rami === "number", "il numero di rami consultati va dichiarato: è la fonte che mancava");
});
