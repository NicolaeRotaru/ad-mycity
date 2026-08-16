#!/usr/bin/env node
// 🧪 AR-702 — «non c'è niente da inseguire» e «non ho potuto leggere il registro» sono DUE valori.
//
// LA STORIA. `cacciaAperta()` in cervello/prompt-senior.mjs tornava un elenco vuoto in tutti e due i
// casi. Non faceva danni oggi, perché il suo unico chiamante — il guardiano della porta dei senior —
// leggeva il registro anche per conto suo e dichiarava lui la cecità. Cioè: la malattia era curata
// NEL CHIAMANTE e viva NELLA FUNZIONE. Il prossimo che l'avesse usata avrebbe ricevuto un vuoto
// rassicurante al posto di un «non ho guardato», e non avrebbe avuto modo di accorgersene.
//
// LA CURA, provata qui: `null` = cieco · `[]` = letto e non c'è niente. E chi prova a far scivolare
// il `null` dentro il metro come se fosse un elenco vuoto viene fermato, invece di ottenere un
// «nessun valore superato» che nessuno ha misurato.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { cacciaAperta, violazioniPorta, leggiRegistroFatti } = await import(join(REPO, "cervello/prompt-senior.mjs"));

/** Una casa finta con un registro dei fatti scritto da noi. `registro === null` = file assente. */
function casa(registro) {
  const dir = mkdtempSync(join(tmpdir(), "caccia-cieca-"));
  mkdirSync(join(dir, ".claude/agents"), { recursive: true });
  mkdirSync(join(dir, ".claude/workflows"), { recursive: true });
  mkdirSync(join(dir, "MyCity-Vault/90-Memoria-AI"), { recursive: true });
  writeFileSync(join(dir, "CLAUDE.md"), "# finto");
  writeFileSync(join(dir, ".claude/agents/vendite.md"), "---\nname: vendite\n---\nIo.");
  if (registro !== null) writeFileSync(join(dir, "MyCity-Vault/90-Memoria-AI/registro-fatti.json"), registro);
  return dir;
}

const usa = (registro, fn) => {
  const dir = casa(registro);
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

test("⬇️ AR-702 — un registro illeggibile torna `null`, non un elenco vuoto", () => {
  usa("{ questo non è json", (dir) => {
    assert.equal(leggiRegistroFatti(dir).ok, false, "la sabbiera non sta simulando un registro rotto");
    assert.equal(
      cacciaAperta(dir),
      null,
      "un registro che non si è letto è tornato come «nessuna caccia aperta»: è la cecità venduta per misura",
    );
  });
});

test("⬇️ AR-702 — un registro assente è cieco anche lui: il file che manca non è una buona notizia", () => {
  usa(null, (dir) => {
    assert.equal(cacciaAperta(dir), null);
  });
});

test("AR-702 — un registro sano SENZA cacce aperte torna `[]`: il vuoto vero resta distinguibile", () => {
  usa(JSON.stringify({ fatti: [{ id: "negozio.faro", nome: "n", valore: "v", caccia: [{ pattern: "vecchio", chiusa: true }] }] }), (dir) => {
    const c = cacciaAperta(dir);
    assert.ok(Array.isArray(c), "con il registro letto ci si aspetta un elenco");
    assert.deepEqual(c, [], "una caccia già chiusa non deve accusare nessuno");
  });
});

test("AR-702 — un registro sano CON una caccia aperta la restituisce: la funzione legge davvero", () => {
  usa(JSON.stringify({ fatti: [{ id: "negozio.faro", caccia: [{ pattern: "Casa Linda payout-ready" }] }] }), (dir) => {
    assert.deepEqual(cacciaAperta(dir), [{ id: "negozio.faro", pattern: "Casa Linda payout-ready" }]);
  });
});

test("⬇️ AR-702 — il `null` non si può far scivolare nel metro come se fosse «niente da inseguire»", () => {
  const piloti = [{ nome: "finto.js", testo: "const F = 'Casa Linda payout-ready'\nawait agent(F)" }];
  assert.throws(
    () => violazioniPorta(piloti, { senior: ["vendite"], caccia: null }),
    /registro dei fatti non letto/,
    "una caccia cieca passata al metro è diventata «nessun valore superato»: nessuno l'ha misurata",
  );
  // E il caso normale continua a funzionare: la guardia non ha spento il controllo.
  const preso = violazioniPorta(piloti, { senior: ["vendite"], caccia: [{ id: "negozio.faro", pattern: "Casa Linda payout-ready" }] });
  assert.equal(preso.filter((v) => v.regola === "valore-superato").length, 1);
});

test("⬇️ AR-702 — il guardiano VERO, su una casa col registro rotto, esce 2 e non stampa la spunta", () => {
  usa("{ questo non è json", (dir) => {
    writeFileSync(join(dir, ".claude/workflows/pilota.js"), "// un pilota qualsiasi\n");
    const r = spawnSync(process.execPath, [join(REPO, "cervello/prompt-senior.mjs"), "--guardiano"], {
      env: { ...process.env, AD_ROOT: dir },
      encoding: "utf8",
    });
    assert.equal(r.status, 2, `atteso ⚪ (uscita 2), ottenuto ${r.status}. stderr: ${r.stderr}`);
    assert.doesNotMatch(r.stdout, /^✅/m, "ha stampato la spunta verde su una regola che non ha potuto applicare");
  });
});
