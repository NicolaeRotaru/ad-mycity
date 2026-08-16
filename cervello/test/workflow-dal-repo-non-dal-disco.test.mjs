#!/usr/bin/env node
// 🧪 AR-710 — l'altra metà di AR-701: il guardiano contava anche i WORKFLOW leggendo il disco.
//
// LA STORIA. AR-701 ha portato l'elenco delle SKILL su git, e ha lasciato `elencaWorkflow` a fare
// `readdirSync(.claude/workflows)`. Stessa malattia — il verdetto dipende da cosa c'è sul disco
// della macchina su cui gira, invece che da cosa il repo dichiara — e stessa riga di riassunto
// (`drift_totale`). È il modo classico in cui un difetto torna da solo: si ripara la porta a mano e
// si lascia aperta quella automatica.
//
// LA PROVA. Deposito sul disco un workflow che nessun commit conosce e pretendo che il conto, il
// drift e il codice d'uscita non si muovano di un'unità. Il file lo tolgo sempre, anche se il test
// esplode.
//
// E la guardia contro la vacuità: se il guardiano contasse ZERO workflow, questo test passerebbe
// senza aver misurato niente. Perciò pretende anche che il numero sia quello che git dichiara,
// contato qui per conto nostro.

import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const WORKFLOWS = join(REPO, ".claude", "workflows");
const INTRUSO = join(WORKFLOWS, "zzz-intruso-di-un-altro-ambiente.js");

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

/** Quanti workflow il REPO dichiara davvero, chiesti a git per conto nostro. */
function workflowTracciati() {
  const r = spawnSync("git", ["ls-files", "-z", "--", ".claude/workflows"], { cwd: REPO, encoding: "utf8" });
  assert.equal(r.status, 0, `git non risponde: ${r.stderr}`);
  const nomi = new Set();
  for (const p of r.stdout.split("\0")) {
    const m = /^\.claude\/workflows\/([^/]+)\.(js|mjs)$/.exec(p);
    if (m) nomi.add(m[1]);
  }
  return nomi;
}

test("⬇️ AR-710 — un workflow che nessun commit conosce NON muove il conto né il drift", () => {
  assert.equal(existsSync(INTRUSO), false, "il file di prova esisteva già: qualcuno non ha pulito");
  const prima = guardiano();

  writeFileSync(INTRUSO, "// workflow depositato dall'ambiente, mai aggiunto da nessun commit\nexport default {};\n");
  try {
    assert.equal(existsSync(INTRUSO), true, "la sabbiera non ha creato niente: la prova non starebbe misurando nulla");
    const dopo = guardiano();

    assert.equal(
      dopo.n_workflow,
      prima.n_workflow,
      "il conto dei workflow è salito per un file che nessun commit ha aggiunto: il guardiano sta misurando il disco, non la macchina",
    );
    assert.deepEqual(
      dopo.workflow_orfani,
      prima.workflow_orfani,
      "il file intruso è finito fra i workflow orfani: è un rosso che non appartiene a chi lo vede",
    );
    assert.equal(
      dopo.drift_totale,
      prima.drift_totale,
      "il drift si è mosso da solo: su una postazione sarebbe rosso e sul server verde, e nessuno dei due saprebbe perché",
    );
    assert.equal(dopo.uscita, prima.uscita, "il codice d'uscita è cambiato per colpa dell'ambiente");
  } finally {
    rmSync(INTRUSO, { force: true });
  }
  assert.equal(existsSync(INTRUSO), false, "la prova ha lasciato in giro il suo file");
});

test("⬇️ AR-710 — il conto dei workflow è quello che dichiara git, non quello che si trova sul disco", () => {
  const r = guardiano();
  const tracciati = workflowTracciati();
  assert.ok(tracciati.size > 0, "git non elenca nessun workflow: la prova non starebbe confrontando niente");
  assert.equal(
    r.n_workflow,
    tracciati.size,
    `il guardiano conta ${r.n_workflow} workflow, il repo ne dichiara ${tracciati.size}: sta guardando un'altra fonte`,
  );
});

test("AR-710 — le due metà hanno UNA fonte sola: chi elenca le capacità non apre il disco", async () => {
  // Non è un pattern al posto della prova: le due prove sopra misurano il comportamento. Questa
  // dice che la cura sta nella CLASSE e non nei due punti — se domani qualcuno conta una terza
  // capacità leggendo la cartella, il difetto rinasce e nessuna delle due sabbiere lo vede.
  //
  // Il disco si può ancora guardare in UN posto solo: `tracciatiDaGit`, e solo per dichiararsi
  // cieco quando git risponde «niente» su una cartella che di file ne ha. Lì il disco non entra
  // nel conto: decide se il conto vale.
  const { readFileSync } = await import("node:fs");
  const src = readFileSync(join(REPO, "cervello/guardiano-capacita.mjs"), "utf8");
  const corpo = (nome) => {
    const da = src.indexOf(`function ${nome}(`);
    assert.notEqual(da, -1, `la funzione ${nome} non esiste più: la prova sta guardando un altro codice`);
    const dopo = src.slice(da + 1);
    const fine = dopo.indexOf("\nfunction ") === -1 ? dopo.length : dopo.indexOf("\nfunction ");
    return dopo.slice(0, fine);
  };
  for (const nome of ["elencaWorkflow", "elencaSkill"]) {
    const righe = corpo(nome)
      .split("\n")
      .filter((r) => /readdirSync\s*\(/.test(r) && !r.trim().startsWith("*") && !r.trim().startsWith("//"));
    assert.deepEqual(righe, [], `${nome} legge ancora la cartella invece di chiedere al repo:\n${righe.join("\n")}`);
    assert.match(corpo(nome), /tracciatiDaGit\(/, `${nome} non passa dalla fonte unica: la cura è nei punti, non nella classe`);
  }
});

test("AR-710 — la cura non ha spento il guardiano: le capacità vere si vedono ancora", () => {
  const r = guardiano();
  assert.ok(r.n_workflow > 0, "zero workflow guardati: un guardiano che non apre niente non è un verde");
  assert.ok(r.n_skill > 0, "zero skill guardate: la metà curata da AR-701 si è spenta");
  assert.equal(r.misurato, true, "il guardiano dice di non aver misurato mentre gira sul repo sano");
});
