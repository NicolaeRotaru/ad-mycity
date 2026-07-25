// AR-142 — test del guardiano dei permessi di sessione (node --test, nessun I/O).
//
// Il difetto originale elencava 5 permessi troppo larghi. Ricontrollandoli il 25/7 ne restava UNO
// (curl senza dominio): gli altri erano già stati chiusi e nessuno l'aveva registrato, perché la
// verifica era marcata «umana» e quindi nessun guardiano poteva mai ricontrollarla.
// Queste prove pinzano le regole d'oro così che, se la lista si riallarga, si rompa un test invece
// di aspettare la prossima radiografia.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { violazioni, REGOLE } from "../permessi-check.mjs";

// Il set "sano" minimo: nessun allow proibito, tutti i deny richiesti presenti.
const DENY_OK = [
  "Bash(git push:*)",
  "Read(**/.env)",
  "Edit(./.claude/settings.json)",
];

test("un set pulito non produce violazioni", () => {
  const allow = ["Bash(git status:*)", "Bash(node cervello/*.mjs:*)", "Write(consegne/**)"];
  assert.deepEqual(violazioni(allow, DENY_OK), []);
});

test("becca i permessi troppo larghi, uno per uno", () => {
  const casi = [
    ["Bash(git push origin main)", "no-push-diretto"],
    ["Bash(git merge:*)", "no-merge-generico"],
    ["Write", "write-con-path"],
    ["Write(*)", "write-con-path"],
    ["Bash(node /tmp/x.mjs:*)", "no-esecuzione-da-tmp"],
    ["Bash(curl:*)", "curl-limitato"],
  ];
  for (const [voce, regola] of casi) {
    const v = violazioni([voce], DENY_OK);
    assert.equal(v.length, 1, `"${voce}" doveva produrre 1 violazione, ne ha prodotte ${v.length}`);
    assert.equal(v[0].regola, regola);
    assert.equal(v[0].tipo, "allow-troppo-largo");
    assert.ok(v[0].perche.length > 20, "ogni violazione deve dire PERCHÉ, non solo che");
  }
});

test("un curl ristretto a un dominio è ammesso", () => {
  // La regola vieta il jolly, non curl in sé: bloccare tutto renderebbe il guardiano inutilizzabile.
  assert.deepEqual(violazioni(["Bash(curl https://api.resend.com:*)"], DENY_OK), []);
});

test("segnala i DIVIETI mancanti, non solo i permessi di troppo", () => {
  // Un deny assente è pericoloso quanto un allow largo: senza Read(**/.env) le chiavi sono leggibili.
  const v = violazioni([], []);
  const regole = v.map((x) => x.regola).sort();
  assert.deepEqual(regole, ["no-auto-permessi", "no-push-diretto", "segreti-illeggibili"]);
  assert.ok(v.every((x) => x.tipo === "deny-mancante"));
});

test("ogni regola dichiara la fonte del proprio perché", () => {
  for (const r of REGOLE) {
    assert.ok(r.id && r.perche, `regola senza id/perché: ${JSON.stringify(r)}`);
    assert.ok(r.vieta || r.deve_negare, `regola ${r.id} non controlla nulla`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Il file VERO: questa prova è la sentinella. Oggi resta una sola violazione nota
// (curl senza dominio, che solo Nicola può stringere perché settings.json è in deny alla macchina).
// Se domani ne compaiono altre, questo test lo dice subito.
test("i permessi reali non peggiorano oltre il residuo noto", () => {
  const j = JSON.parse(readFileSync(new URL("../../.claude/settings.json", import.meta.url), "utf8"));
  const p = j.permissions || {};
  const v = violazioni(p.allow || [], p.deny || []);
  const ids = v.map((x) => x.regola).sort();
  assert.deepEqual(ids, ["curl-limitato"], `violazioni inattese: ${JSON.stringify(v, null, 1)}`);
});
