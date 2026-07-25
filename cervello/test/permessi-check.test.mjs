// AR-142 — test del guardiano dei permessi di sessione (node --test, nessun I/O).
//
// Il difetto originale elencava 5 permessi troppo larghi. Ricontrollandoli il 25/7 nel repo cloud ne
// restava UNO (curl senza dominio) — ma quella misura era PARZIALE: nella sessione cloud
// `.claude/settings.local.json` non esiste, mentre sul VPS sì, con 33 allow e ZERO deny, e contiene
// tutti i permessi contestati. È il guardiano stesso ad averlo scoperto al primo giro sul VPS.
// Morale registrata qui perché non si ripeta: un permesso non si giudica dal file che si ha sotto
// mano, ma da TUTTI i file che l'ambiente vero carica.

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
  // È anche il caso del settings.local.json del VPS: 33 allow e ZERO deny.
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
// Il file VERO di QUESTO repo. Attenzione: qui `.claude/settings.local.json` non esiste, quindi
// questa prova copre solo metà della realtà del VPS — dove il guardiano trova 11 violazioni.
// La verità completa la dice il guardiano lanciato nell'ambiente vero, ed è per questo che la prova
// di AR-142 nel cantiere è il COMANDO, non un pattern su un file.
test("i permessi reali di questo repo non peggiorano oltre il residuo noto", () => {
  const j = JSON.parse(readFileSync(new URL("../../.claude/settings.json", import.meta.url), "utf8"));
  const p = j.permissions || {};
  const v = violazioni(p.allow || [], p.deny || []);
  const ids = v.map((x) => x.regola).sort();
  assert.deepEqual(ids, ["curl-limitato"], `violazioni inattese: ${JSON.stringify(v, null, 1)}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// Round 4 — la prova a COMANDO: questo guardiano È la prova di AR-142.
// Serviva perché il difetto non è esprimibile come file+pattern: `git push` compare sia fra i
// permessi sia fra i divieti, e una regex sul testo grezzo non li distingue.
import { eseguiProvaComando } from "../auto-fix.mjs";

test("prova a comando: l'esito segue l'exit code del guardiano", () => {
  const finto = (esito) => () => ({ status: esito });
  assert.equal(eseguiProvaComando("node cervello/permessi-check.mjs", finto(0)).esito, "risolto");
  assert.equal(eseguiProvaComando("node cervello/permessi-check.mjs", finto(1)).esito, "aperto");
  assert.equal(eseguiProvaComando("node cervello/x.mjs --gate", finto(0)).esito, "risolto", "i flag sono ammessi");
});

test("prova a comando: si eseguono SOLO i guardiani del repo, mai una shell", () => {
  // Un difetto non deve poter far girare qualcosa di arbitrario per dichiararsi risolto.
  // Il runner finto ESPLODE se invocato: se un comando proibito passasse il filtro, il test rompe.
  const mai = () => { throw new Error("non doveva essere eseguito"); };
  for (const c of ["rm -rf /", 'bash -c "x"', "node /tmp/evil.mjs", "node ../fuori.mjs", "node cervello/x.mjs; rm -rf /", "", null]) {
    assert.equal(eseguiProvaComando(c, mai).esito, "manuale", `doveva rifiutare: ${JSON.stringify(c)}`);
  }
});
