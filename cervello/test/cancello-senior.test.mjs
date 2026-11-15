#!/usr/bin/env node
// 🧪 Le prove del CANCELLO DEI SENIOR (cervello/cancello-senior.mjs).
//
// La prova più importante è quella che difende il NON blocco: con più senior in volo il perimetro è
// condiviso, e punire il senior sbagliato è peggio che non punire nessuno — insegna che il verdetto
// non c'entra con quello che hai fatto.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chiudiSenior, perimetroSenior, allarmiDelSenior, verdettoSenior } from "../cancello-senior.mjs";
import { ANCORA_SENIOR } from "../pre-scrittura.mjs";
import { BATTITO } from "../sorvegliante.mjs";

const CANCELLO = join(dirname(fileURLToPath(import.meta.url)), "..", "cancello-senior.mjs");

const grave = { file: "cervello/x.mjs", cosa: "malattia nuova", gravita: "grave" };

// ── il conteggio dei senior in volo ──────────────────────────────────────────

test("l'ultimo senior che chiude toglie l'ancora: il prossimo non eredita il perimetro di chi c'era prima", () => {
  const r = chiudiSenior({ commit: "aaa", aperti: 1 });
  assert.equal(r.ancora, null);
  assert.equal(r.ultimo, true);
  assert.equal(r.condiviso, false);
});

test("con due in volo, chi chiude per primo lascia l'ancora al secondo e dichiara il perimetro condiviso", () => {
  const r = chiudiSenior({ commit: "aaa", aperti: 2 });
  assert.equal(r.ancora.aperti, 1);
  assert.equal(r.ultimo, false);
  assert.equal(r.condiviso, true);
});

test("senza ancora non si va sotto zero: un evento in più non deve inventare un perimetro", () => {
  const r = chiudiSenior(null);
  assert.equal(r.ancora, null);
  assert.equal(r.ultimo, true);
});

// ── gli allarmi non accodati ─────────────────────────────────────────────────

test("un 🔴 in una consegna senza niente nella coda viene preso", () => {
  const a = allarmiDelSenior([{ file: "consegne/x.md", testo: "🔴 il sito è giù" }], false);
  assert.deepEqual(a, ["consegne/x.md"]);
});

test("se la coda È stata toccata non si accusa nessuno: l'allarme ha già il suo lettore", () => {
  assert.deepEqual(allarmiDelSenior([{ file: "consegne/x.md", testo: "🔴 grave" }], true), []);
});

test("una consegna senza marcatori d'allarme non è un allarme", () => {
  assert.deepEqual(allarmiDelSenior([{ file: "consegne/x.md", testo: "tutto liscio" }], false), []);
});

// ── il verdetto ──────────────────────────────────────────────────────────────

test("una voce grave del senior BLOCCA: torna indietro e la sistema prima che si impasti col resto", () => {
  const v = verdettoSenior({ voci: [grave] });
  assert.equal(v.blocca, true);
  assert.match(v.righe.join("\n"), /voce grave/);
});

test("LA REGOLA CHE CONTA: con più senior in volo NON si blocca, perché non so a chi attribuire", () => {
  const v = verdettoSenior({ voci: [grave], condiviso: true });
  assert.equal(v.blocca, false, "punire il senior sbagliato insegna che il verdetto non c'entra col lavoro");
  assert.ok(v.righe.length, "ma si dice lo stesso: non attribuire non vuol dire tacere");
});

test("la valvola anti-cappio: se il senior sta già ripartendo per colpa mia, non lo blocco di nuovo", () => {
  assert.equal(verdettoSenior({ voci: [grave], giaBloccato: true }).blocca, false);
});

test("una voce MEDIA si dice e non blocca: il freno serve sul grave, il resto è un avviso", () => {
  const v = verdettoSenior({ voci: [{ ...grave, gravita: "media" }] });
  assert.equal(v.blocca, false);
  assert.equal(v.righe.length, 1);
});

test("il quadro dei file toccati c'è anche quando è tutto pulito: è l'unica riga che dice cosa ha fatto davvero", () => {
  const v = verdettoSenior({ voci: [], fileToccati: ["a.mjs", "b.md"] });
  assert.equal(v.blocca, false);
  assert.match(v.righe.join("\n"), /a\.mjs/);
});

test("niente di niente: nessuna riga, e il senior chiude senza rumore", () => {
  assert.deepEqual(verdettoSenior({}).righe, []);
});

test("un allarme non accodato blocca quanto una voce grave: un 🔴 senza lettore è un verdetto perso", () => {
  assert.equal(verdettoSenior({ allarmi: ["consegne/x.md"] }).blocca, true);
});

// ── senza ancora ─────────────────────────────────────────────────────────────
// L'ancora manca quando nessuno l'ha piantata. Fino al 25/10 succedeva a OGNI delega: pre-scrittura
// riconosceva solo «Task» e lo strumento oggi si chiama «Agent» (AR-1009, verificato). Per gli agenti
// dei workflow succede anche dopo, perché partono da `Workflow` (dedotto, non osservato). Il
// perimetro allora è TUTTO il lavoro non committato: bloccare lì vuol dire far rifare un turno
// (50-150 mila token di contesto riletto) a un agente per una voce che può aver lasciato un altro.

test("senza ancora il perimetro non è attribuibile: si racconta, e la nota dice perché non blocco", () => {
  const p = perimetroSenior(null);
  assert.equal(p.attribuibile, false);
  assert.match(p.nota, /nessuna ancora/);
  assert.match(p.nota, /non blocco/);
});

test("con l'ancora e un senior solo il perimetro è suo: attribuibile, nessuna nota", () => {
  const p = perimetroSenior({ commit: "aaa", scatto: 3, aperti: 1 });
  assert.equal(p.attribuibile, true);
  assert.equal(p.nota, null);
  assert.equal(p.rimasta, null, "l'ultimo che chiude toglie l'ancora");
});

test("con l'ancora e due senior in volo resta il perimetro condiviso di prima", () => {
  const p = perimetroSenior({ commit: "aaa", scatto: 3, aperti: 2 });
  assert.equal(p.attribuibile, false);
  assert.match(p.nota, /condiviso/);
});

/** Un repo finto con una voce GRAVE viva nel battito del sorvegliante, e l'ancora solo se richiesta.
 *  Fa girare il cancello vero come lo lancia l'hook SubagentStop e torna l'exit. */
function giraIlCancello({ conAncora, evento = "{}" }) {
  const dir = mkdtempSync(join(tmpdir(), "cancello-senior-"));
  try {
    execFileSync("git", ["init", "-q", "."], { cwd: dir });
    execFileSync("git", ["-c", "user.email=prova@prova", "-c", "user.name=prova", "commit", "-q", "--allow-empty", "-m", "zero"], { cwd: dir });
    const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: dir, encoding: "utf8" }).trim();
    mkdirSync(join(dir, "cervello"), { recursive: true });
    writeFileSync(
      join(dir, BATTITO),
      JSON.stringify({ scatto: 4, viste: { k: { n: 1, scatto: 4, file: "cervello/x.mjs", cosa: "malattia nuova", gravita: "grave" } } }),
    );
    if (conAncora) writeFileSync(join(dir, ANCORA_SENIOR), JSON.stringify({ commit: head, scatto: 3, quando: "", aperti: 1 }));
    const r = spawnSync(process.execPath, [CANCELLO, "--hook"], {
      input: evento,
      encoding: "utf8",
      env: { ...process.env, CANCELLO_SENIOR_REPO: dir },
    });
    return { exit: r.status, detto: `${r.stdout}${r.stderr}`, ancoraRimasta: existsSync(join(dir, ANCORA_SENIOR)) };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("IL CASO DEI WORKFLOW: senza ancora e con una voce grave il senior chiude (exit 0), ma la voce si dice", () => {
  const r = giraIlCancello({ conAncora: false });
  assert.equal(r.exit, 0, "senza ancora non so di chi è la voce: bloccare punisce l'agente sbagliato");
  assert.match(r.detto, /voce grave/, "non attribuire non vuol dire tacere");
  assert.match(r.detto, /nessuna ancora/);
});

test("con l'ancora e un senior solo la voce grave BLOCCA come prima (exit 2), e l'ancora resta per il giro di ritorno", () => {
  const r = giraIlCancello({ conAncora: true });
  assert.equal(r.exit, 2);
  assert.match(r.detto, /voce grave/);
  assert.equal(r.ancoraRimasta, true, "il senior che torna indietro lavora ancora nello stesso perimetro");
});

test("LA VALVOLA ANTI-CAPPIO: al giro di ritorno (stop_hook_active) il senior chiude anche con la voce grave, e l'ancora si toglie", () => {
  // Senza questa valvola un senior che non riesce a sistemare la voce gira all'infinito, e ogni giro
  // rilegge 50-150 mila token: è proprio il costo che il cancello vuole togliere.
  const r = giraIlCancello({ conAncora: true, evento: JSON.stringify({ stop_hook_active: true }) });
  assert.equal(r.exit, 0, "il senior sta già ripartendo per colpa mia: bloccarlo di nuovo è un cappio");
  assert.match(r.detto, /voce grave/, "lasciarlo chiudere non vuol dire tacere");
  assert.equal(r.ancoraRimasta, false, "il senior ha finito: l'ancora non deve passare al prossimo");
});
