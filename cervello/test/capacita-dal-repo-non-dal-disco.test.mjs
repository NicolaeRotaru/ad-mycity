#!/usr/bin/env node
// 🧪 AR-701 — un guardiano il cui verdetto cambia a seconda di DOVE gira non misura la macchina.
//
// LA STORIA. `guardiano-capacita.mjs` contava le capacità elencando le sottocartelle di
// `.claude/skills` **dal disco**. In una sessione cloud l'ambiente ne deposita decine che nessun
// commit ha mai aggiunto: 72 cartelle sul disco contro le 5 del repo, e il divario è passato da 2 a
// 55 senza che nessuno avesse toccato niente. Su una postazione rosso, sul server verde, e nessuno
// dei due sapeva perché — e siccome quel rosso non appartiene a chi lo vede, si impara a ignorarlo.
// Con lui si ignora anche il giorno in cui ha ragione.
//
// LA CURA: contare le capacità che il REPO DICHIARA, cioè quelle tracciate da git.
//
// LA PROVA, che è quella chiesta dalla scheda: deposito sul disco una cartella-skill che nessun
// commit conosce, e pretendo che il numero delle capacità e il drift NON si muovano di un'unità.
// La cartella la tolgo sempre, anche se il test esplode.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SKILLS = join(REPO, ".claude", "skills");
const INTRUSA = join(SKILLS, "zzz-intrusa-di-un-altro-ambiente");

// Niente chiavi = nessun segnale scritto fuori da qui: la prova non deve sporcare la memoria vera.
const AMBIENTE = { ...process.env };
delete AMBIENTE.SUPABASE_URL;
delete AMBIENTE.SUPABASE_SERVICE_KEY;

/** Il referto del guardiano vero, letto come JSON. */
function guardiano() {
  const r = spawnSync(process.execPath, [join(REPO, "cervello/guardiano-capacita.mjs"), "--json"], {
    cwd: REPO,
    env: AMBIENTE,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  assert.notEqual(r.status, null, `il guardiano non è nemmeno partito: ${r.error?.message}`);
  let dati;
  try {
    dati = JSON.parse(r.stdout);
  } catch (e) {
    assert.fail(`il referto non è JSON (${e.message}). stdout: ${r.stdout.slice(0, 400)} · stderr: ${r.stderr.slice(0, 400)}`);
  }
  return { ...dati, uscita: r.status };
}

/** Quante cartelle-skill il REPO dichiara davvero, chieste a git per conto nostro. */
function skillTracciate() {
  const r = spawnSync("git", ["ls-files", "-z", "--", ".claude/skills"], { cwd: REPO, encoding: "utf8" });
  assert.equal(r.status, 0, `git non risponde: ${r.stderr}`);
  const nomi = new Set();
  for (const p of r.stdout.split("\0")) {
    const m = /^\.claude\/skills\/([^/]+)\//.exec(p);
    if (m) nomi.add(m[1]);
  }
  return nomi;
}

test("⬇️ AR-701 — una cartella-skill che nessun commit conosce NON muove il conto né il drift", () => {
  assert.equal(existsSync(INTRUSA), false, "la cartella di prova esisteva già: qualcuno non ha pulito");
  const prima = guardiano();

  mkdirSync(join(INTRUSA, "riferimenti"), { recursive: true });
  writeFileSync(
    join(INTRUSA, "SKILL.md"),
    "---\nname: zzz-intrusa-di-un-altro-ambiente\ndescription: una capacità che l'ambiente ha depositato e il repo non ha mai avuto\n---\n",
  );
  try {
    assert.equal(existsSync(INTRUSA), true, "la sabbiera non ha creato niente: la prova non starebbe misurando nulla");
    const dopo = guardiano();

    assert.equal(
      dopo.n_skill,
      prima.n_skill,
      "il conto delle capacità è salito per una cartella che nessun commit ha aggiunto: il guardiano sta misurando il disco, non la macchina",
    );
    assert.equal(
      dopo.drift_totale,
      prima.drift_totale,
      "il drift si è mosso da solo: su una postazione sarebbe rosso e sul server verde, e nessuno dei due saprebbe perché",
    );
    assert.deepEqual(
      dopo.skill_orfane,
      prima.skill_orfane,
      "la cartella intrusa è finita fra le capacità orfane: è un rosso che non appartiene a chi lo vede",
    );
    assert.equal(dopo.uscita, prima.uscita, "il codice d'uscita è cambiato per colpa dell'ambiente");
  } finally {
    rmSync(INTRUSA, { recursive: true, force: true });
  }
  assert.equal(existsSync(INTRUSA), false, "la prova ha lasciato in giro la sua cartella");
});

test("⬇️ AR-701 — il conto è quello che dichiara git, non quello che si trova sul disco", () => {
  const r = guardiano();
  const tracciate = skillTracciate();
  assert.ok(tracciate.size > 0, "git non elenca nessuna skill: la prova non starebbe confrontando niente");
  assert.equal(
    r.n_skill,
    tracciate.size,
    `il guardiano conta ${r.n_skill} capacità, il repo ne dichiara ${tracciate.size}: sta guardando un'altra fonte`,
  );
});

test("AR-701 — la cura non ha spento il guardiano: le capacità vere si vedono ancora", () => {
  const r = guardiano();
  assert.ok(r.n_workflow > 0, "zero workflow guardati: un guardiano che non apre niente non è un verde");
  assert.ok(["verde", "rosso", "cieco"].includes(r.verdetto?.stato), "il verdetto non è una delle tre risposte di casa");
});
