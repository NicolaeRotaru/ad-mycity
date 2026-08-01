#!/usr/bin/env node
// 🧪 Le prove del GUARDIANO DEGLI HOOK (cervello/hooks-check.mjs).
//
// Su stati finti e non sul repo: se questi casi misurassero com'è `.claude/settings.json` adesso,
// diventerebbero verdi o rossi per motivi che non c'entrano con la regola che difendono — e il file
// vero lo controlla già il guardiano quando gira.
//
// I due casi che contano di più sono i primi, e sono misurati sul vero: sono i due difetti che il
// blocco Stop incollato a mano l'1/8 aveva davvero, e che nessuno ha visto.

import { test } from "node:test";
import assert from "node:assert/strict";
import { chiaviSconosciute, comandiDichiarati, comandiOrfani, freniNonAttaccati, verdetto, EVENTI } from "../hooks-check.mjs";

// ── ① il file rotto: il caso che spegneva TUTTO ───────────────────────────────

test("IL CASO VERO ①: JSON non valido si dice per primo, e dice che cade anche il deny", () => {
  const v = verdetto({ rotto: "Expected ',' or '}' after property value" });
  assert.equal(v.esce, 1);
  assert.equal(v.righe.length, 1, "quando il file non si legge, tutto il resto è rumore: una riga sola");
  assert.match(v.righe[0], /deny/, "chi legge deve sapere che non muoiono solo gli hook: cade anche il divieto sui .env");
});

test("un file rotto zittisce le altre domande: non ho misurato quelle, non le posso dire", () => {
  const v = verdetto({ rotto: "il file non c'è", sconosciute: [{ chiave: "stop", forse: "Stop" }], staccati: ["cervello/x.mjs"] });
  assert.equal(v.righe.length, 1);
});

// ── ② la chiave con la lettera sbagliata ──────────────────────────────────────

test("IL CASO VERO ②: «stop» minuscolo viene preso, e il messaggio dice qual è la grafia giusta", () => {
  const t = chiaviSconosciute({ SessionStart: [], PostToolUse: [], stop: [] });
  assert.equal(t.length, 1, "una chiave che non combacia non è un evento: viene scartata in silenzio");
  assert.equal(t[0].chiave, "stop");
  assert.equal(t[0].forse, "Stop");
  const v = verdetto({ sconosciute: t });
  assert.equal(v.esce, 1);
  assert.match(v.righe.join("\n"), /case-sensitive/, "il perché deve stare nel messaggio, non nella testa di chi l'ha scritto");
});

test("le chiavi scritte giuste passano: il guardiano non punisce chi fa la cosa giusta", () => {
  assert.deepEqual(chiaviSconosciute({ SessionStart: [], PostToolUse: [], Stop: [] }), []);
  assert.deepEqual(chiaviSconosciute({}), []);
});

test("una chiave inventata viene presa senza suggerire una grafia che non esiste", () => {
  const t = chiaviSconosciute({ QuandoMiVa: [] });
  assert.equal(t[0].forse, null, "inventare un suggerimento sarebbe indovinare");
  assert.match(verdetto({ sconosciute: t }).righe[0], /Eventi validi/, "…allora si elencano quelli veri");
});

test("gli eventi dichiarati sono quelli veri, nella grafia esatta", () => {
  for (const e of ["PreToolUse", "PostToolUse", "Stop", "SessionStart"]) assert.ok(EVENTI.includes(e), `${e} deve essere riconosciuto`);
  assert.ok(!EVENTI.includes("stop"), "la grafia minuscola NON è valida, ed è tutto il punto");
});

// ── ③ il comando che punta a un file che non c'è ──────────────────────────────

test("i comandi si leggono da tutti gli eventi, matcher compreso", () => {
  const c = comandiDichiarati({
    PostToolUse: [{ matcher: "Bash", hooks: [{ type: "command", command: "node cervello/a.mjs --hook" }] }],
    Stop: [{ hooks: [{ type: "command", command: "node cervello/b.mjs --hook" }] }],
  });
  assert.equal(c.length, 2);
  assert.equal(c[0].matcher, "Bash");
  assert.equal(c[1].matcher, null);
});

test("un hook che lancia un file inesistente viene fermato", () => {
  const c = comandiDichiarati({ Stop: [{ hooks: [{ type: "command", command: "node cervello/mai-esistito.mjs --hook" }] }] });
  const o = comandiOrfani(c, () => false);
  assert.equal(o.length, 1);
  assert.equal(o[0].file, "cervello/mai-esistito.mjs");
  assert.match(verdetto({ orfani: o }).righe[0], /non arrivano in chat/, "il danno è che fallisce zitto: va detto");
});

test("un comando che punta a un file vero passa, e uno composto si legge tutto", () => {
  const c = comandiDichiarati({
    SessionStart: [{ hooks: [{ type: "command", command: "bash cervello/installa-hooks.sh >/dev/null 2>&1; node cervello/contesto-lezioni.mjs --hook" }] }],
  });
  assert.deepEqual(comandiOrfani(c, () => true), []);
  assert.equal(comandiOrfani(c, () => false).length, 1, "anche il secondo pezzo di un comando incatenato conta");
});

// ── ④ il freno costruito e mai attaccato (AR-455) ─────────────────────────────

test("IL CASO AR-455: uno script che sa fare l'hook e non è agganciato a niente viene fermato", () => {
  const comandi = comandiDichiarati({ PostToolUse: [{ hooks: [{ command: "node cervello/misura-cieca.mjs --hook" }] }] });
  const s = freniNonAttaccati(["cervello/misura-cieca.mjs", "cervello/sorvegliante.mjs"], comandi);
  assert.deepEqual(s, ["cervello/sorvegliante.mjs"], "costruito, provato, e collegato a niente per un giorno intero");
  assert.match(verdetto({ staccati: s }).righe[0], /AR-455/, "la lezione va nominata: un guardiano senza la sua storia viene tolto");
});

test("se sono tutti attaccati non dice niente", () => {
  const comandi = comandiDichiarati({
    Stop: [{ hooks: [{ command: "node cervello/cancello-stop.mjs --hook" }] }],
    PostToolUse: [{ hooks: [{ command: "node cervello/sorvegliante.mjs --hook" }] }],
  });
  assert.deepEqual(freniNonAttaccati(["cervello/cancello-stop.mjs", "cervello/sorvegliante.mjs"], comandi), []);
});

// ── Il verdetto ───────────────────────────────────────────────────────────────

test("niente da dire = esce 0 e tace", () => {
  const v = verdetto({});
  assert.equal(v.esce, 0);
  assert.equal(v.righe.length, 0, "un guardiano che parla anche quando va tutto bene si impara a ignorare");
});

test("tre problemi diversi si dicono tutti e tre", () => {
  const v = verdetto({
    sconosciute: [{ chiave: "stop", forse: "Stop" }],
    orfani: [{ evento: "Stop", file: "cervello/x.mjs" }],
    staccati: ["cervello/y.mjs"],
  });
  const t = v.righe.join("\n");
  assert.match(t, /"stop"/);
  assert.match(t, /cervello\/x\.mjs/);
  assert.match(t, /cervello\/y\.mjs/);
  assert.equal(v.esce, 1);
});
