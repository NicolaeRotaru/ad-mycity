#!/usr/bin/env node
// 🧪 IL RAMO CHE SI PORTA DIETRO IL DIARIO DELLA MACCHINA.
//
// Ventuno correzioni di Nicola su questa cosa sola — la famiglia più costosa del registro, undici
// in un pomeriggio, e tre volte con la voce alzata: «ormai è 20 volte che ricapita».
//
// La difesa che c'era era un elenco chiuso di quattro percorsi in `git-pr.mjs`. Il 23/7 il
// conflitto è arrivato da un file che nell'elenco non c'era — e non poteva esserci, perché i file
// che la macchina riscrive da sola sono decine e ne nascono a ogni guardiano nuovo.
//
// Quello che si prova qui non è «il guardiano gira»: è che la regola distingua i tre casi che
// contano. Il worker che pubblica solo memoria deve passare (è il suo mestiere). Un ramo di solo
// codice deve passare. Un ramo che li mischia no. E un file conteso — che la macchina riscrive ma
// che anche una persona ha toccato apposta — NON è diario: bloccarlo darebbe un guardiano che
// grida sempre, e un guardiano che grida sempre viene spento.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { eAutomatico, fileDiario, eCodice, verdetto, separaCommits } = await import(join(REPO, "cervello/ramo-pulito.mjs"));

test("legge la storia dalla porta di git, dove i pezzi arrivano separati da NUL", () => {
  // Come esce davvero `git log -z --name-only --format=%x01%s`: il messaggio marcato con \x01,
  // poi i suoi file, poi il commit successivo.
  const c = separaCommits([
    "\x01recupero: scritture pendenti",
    "MyCity-Vault/90-Memoria-AI/Briefing/2026-07-29.md",
    "\x01Lotto 35 — quattro malattie",
    "cervello/cancello-lotto.mjs",
    "cervello/mutanti.json",
  ]);
  assert.equal(c.length, 2);
  assert.equal(c[0].messaggio, "recupero: scritture pendenti");
  assert.deepEqual(c[1].file, ["cervello/cancello-lotto.mjs", "cervello/mutanti.json"]);
});

test("un nome di file con uno spazio resta un nome solo", () => {
  // È il motivo per cui la porta esiste (AR-339..342): senza `-z`, git cita i nomi strani e il
  // confronto per uguaglianza non li trova più.
  const c = separaCommits(["\x01worker: giro", "consegne/report della sera.md"]);
  assert.deepEqual(c[0].file, ["consegne/report della sera.md"]);
});

test("riconosce i messaggi con cui la macchina committa da sola", () => {
  for (const m of [
    "recupero: scritture pendenti (2026-07-28 04:22)",
    "worker: Sentinella macchina 🧠 — SALUTE BASSA",
    "memoria: VPS fermo, dodicesimo tick mancato",
    "allineo la memoria del VPS con main",
  ]) {
    assert.equal(eAutomatico(m), true, `«${m}» è un commit automatico`);
  }
});

test("e non scambia per automatico il lavoro di una persona", () => {
  for (const m of [
    "Lotto 35 — quattro malattie curate in parallelo",
    "Il ciclo di verifica costava 65 secondi",
    "fix: la memoria del carrello",
  ]) {
    assert.equal(eAutomatico(m), false, `«${m}» è lavoro, non diario`);
  }
});

test("i SEMI dichiarati ci sono sempre, anche se la storia non li mostra", () => {
  // Il buco trovato rileggendo il lavoro il 30/7: la sola deduzione non copriva `apprendimento.json`
  // né il corpo PR condiviso — cioè i file delle lezioni da cui questo freno è nato — perché quel
  // giorno li avevo toccati anche io a mano, e la regola «solo automatici» li escludeva.
  const d = fileDiario([{ messaggio: "Lotto 40: un lavoro qualsiasi", file: ["cervello/x.mjs"] }]);
  for (const atteso of [
    "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json",
    "cervello/routing.json",
    "consegne/tech/pr-ad-mycity-body.md",
  ]) {
    assert.ok(d.has(atteso), `${atteso} è dichiarato in file-della-macchina.mjs: dev'esserci sempre`);
  }
});

test("i semi vengono da UNA casa sola, quella che legge anche git-pr", async () => {
  const { SEMI_DIARIO, RISCRITTI_DAL_WORKER } = await import(join(REPO, "cervello/file-della-macchina.mjs"));
  const gitPr = readFileSync(join(REPO, "cervello/git-pr.mjs"), "utf8");
  assert.match(gitPr, /from "\.\/file-della-macchina\.mjs"/, "git-pr deve leggere di lì, non tenere una sua copia");
  assert.doesNotMatch(
    gitPr,
    /const WORKER_AUTO_PATHS = new Set\(\[\s*"cervello\/routing\.json"/,
    "se git-pr riavesse la sua lista, le due copie divergerebbero al primo aggiornamento",
  );
  assert.ok(SEMI_DIARIO.length > RISCRITTI_DAL_WORKER.length, "i semi includono anche il corpo PR condiviso");
});

test("diario = scritto SOLO da commit automatici", () => {
  const d = fileDiario([
    { messaggio: "recupero: scritture pendenti", file: ["MyCity-Vault/90-Memoria-AI/Briefing/2026-07-29.md"] },
    { messaggio: "worker: sentinella", file: ["MyCity-Vault/90-Memoria-AI/Briefing/2026-07-29.md", "consegne/supervisione/x.md"] },
    { messaggio: "Lotto 35 — quattro malattie", file: ["cervello/cancello-lotto.mjs"] },
  ]);
  assert.ok(d.has("MyCity-Vault/90-Memoria-AI/Briefing/2026-07-29.md"));
  assert.ok(d.has("consegne/supervisione/x.md"));
  assert.equal(d.has("cervello/cancello-lotto.mjs"), false, "un file di lavoro non è diario");
});

test("un file CONTESO non è diario: lo tocca la macchina, ma anche una persona apposta", () => {
  const d = fileDiario([
    { messaggio: "recupero: scritture pendenti", file: ["MyCity-Vault/90-Memoria-AI/STATO.md"] },
    { messaggio: "recupero: scritture pendenti", file: ["MyCity-Vault/90-Memoria-AI/STATO.md"] },
    { messaggio: "Lotto 34: aggiorno lo stato dopo le chiusure", file: ["MyCity-Vault/90-Memoria-AI/STATO.md"] },
  ]);
  assert.equal(
    d.has("MyCity-Vault/90-Memoria-AI/STATO.md"),
    false,
    "se bloccasse anche i file contesi griderebbe a ogni PR, e un guardiano che grida sempre viene spento",
  );
});

test("il caso dannoso è UNO: codice e diario insieme", () => {
  const diario = new Set(["MyCity-Vault/90-Memoria-AI/Briefing/2026-07-29.md"]);
  const v = verdetto(["cervello/fix.mjs", "MyCity-Vault/90-Memoria-AI/Briefing/2026-07-29.md"], diario);
  assert.equal(v.misto, true);
  assert.deepEqual(v.codice, ["cervello/fix.mjs"]);
  assert.match(v.motivo, /conflitto/);
});

test("il worker che pubblica SOLO memoria deve passare: è il suo mestiere", () => {
  const diario = new Set(["MyCity-Vault/90-Memoria-AI/Briefing/2026-07-29.md", "consegne/supervisione/x.md"]);
  const v = verdetto(["MyCity-Vault/90-Memoria-AI/Briefing/2026-07-29.md", "consegne/supervisione/x.md"], diario);
  assert.equal(v.misto, false, "bloccare la pubblicazione della memoria fermerebbe la macchina ogni notte");
});

test("un ramo di solo codice passa", () => {
  const v = verdetto(["cervello/fix.mjs", "pannello/src/app/page.tsx"], new Set(["MyCity-Vault/x.md"]));
  assert.equal(v.misto, false);
});

test("cosa conta come codice", () => {
  for (const f of ["cervello/x.mjs", "pannello/src/a.tsx", "cervello/giro.sh", ".github/workflows/ci.yml"]) {
    assert.equal(eCodice(f), true, f);
  }
  for (const f of ["MyCity-Vault/STATO.md", "consegne/x.md", "cervello/routing.json"]) {
    assert.equal(eCodice(f), false, f);
  }
});

test("sul repo vero il comando gira e dà un verdetto, non un'eccezione", () => {
  const r = spawnSync("node", [join(REPO, "cervello/ramo-pulito.mjs"), "--json"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 120_000,
  });
  assert.ok([0, 1, 2].includes(r.status), `exit inatteso ${r.status}: ${r.stderr}`);
  if (r.status !== 2) {
    const j = JSON.parse(r.stdout);
    assert.ok(Array.isArray(j.diario), "deve dire QUALI file considera diario, non solo quanti");
    assert.equal(typeof j.ok, "boolean");
  }
});
