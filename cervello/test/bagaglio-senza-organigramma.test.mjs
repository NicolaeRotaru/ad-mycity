// AR-1020 — il bagaglio del giro senza l'organigramma (node --test).
//
// Il difetto: se MyCity-Vault/07-Agenti/ORGANIGRAMMA.md sparisce o cambia forma, `turnoDelGiro`
// consegna lo stesso sei senior — ma nessuno dei motori di soldi — e lo scrive solo in
// `copertura.motoriCieco`. `prepara-giro.mjs` non lo metteva fra i ciechi e usciva 0: il giro partiva
// a occuparsi di tutto tranne che di ordini e negozi, con la faccia di un turno sano.
//
// Si prova su una radice finta (i mansionari veri, gli OKR veri, un CLAUDE.md vuoto perche'
// `radiceRepo` la riconosca) in tre varianti: organigramma assente, organigramma con un'altra forma,
// e il controllo con l'organigramma vero, che non deve gridare al cieco.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { bagaglioDelGiro } from "../prepara-giro.mjs";
import { ORGANIGRAMMA } from "../deferral-agenti.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const VERA = join(QUI, "..", "..");
const SCRIPT = join(QUI, "..", "prepara-giro.mjs");

function radiceFinta({ organigramma = null } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "bagaglio-org-"));
  cpSync(join(VERA, ".claude", "agents"), join(dir, ".claude", "agents"), { recursive: true });
  mkdirSync(join(dir, "MyCity-Vault", "05-Soldi-Rischi"), { recursive: true });
  cpSync(join(VERA, "MyCity-Vault", "05-Soldi-Rischi", "OKR-Squadra.md"), join(dir, "MyCity-Vault", "05-Soldi-Rischi", "OKR-Squadra.md"));
  writeFileSync(join(dir, "CLAUDE.md"), "");
  if (organigramma === "vero") {
    mkdirSync(dirname(join(dir, ORGANIGRAMMA)), { recursive: true });
    cpSync(join(VERA, ORGANIGRAMMA), join(dir, ORGANIGRAMMA));
  } else if (organigramma !== null) {
    mkdirSync(dirname(join(dir, ORGANIGRAMMA)), { recursive: true });
    writeFileSync(join(dir, ORGANIGRAMMA), organigramma);
  }
  return dir;
}

const lancia = (dir) => spawnSync(process.execPath, [SCRIPT], { encoding: "utf8", env: { ...process.env, AD_ROOT: dir } });

test("senza l'organigramma il bagaglio e' cieco: lo dice in `cieco` e la riga di comando esce 1", () => {
  const dir = radiceFinta();
  try {
    const b = bagaglioDelGiro({ radice: dir });
    assert.ok(b.turno.length, "il turno esce pieno lo stesso: e' proprio quello che lo fa sembrare sano");
    assert.equal(b.copertura.motoriCieco, true);
    assert.ok(b.cieco.some((c) => /motori di soldi/.test(c) && c.includes(ORGANIGRAMMA)),
      `il bagaglio non dichiara i motori ciechi: ${JSON.stringify(b.cieco)}`);
    const r = lancia(dir);
    assert.equal(r.status, 1, `senza organigramma prepara-giro esce ${r.status}: il giro partirebbe senza i soldi`);
    assert.ok(JSON.parse(r.stdout).cieco.length, "il JSON si stampa lo stesso, e porta il cieco");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("la variante scomoda: l'organigramma c'e' ma ha cambiato forma, e zero motori e' cieco lo stesso", () => {
  const dir = radiceFinta({ organigramma: "# Organigramma\n\n**Squadra:**\n- **vendite** — prospecting\n" });
  try {
    const b = bagaglioDelGiro({ radice: dir });
    assert.equal(b.copertura.fonteMotori, "senza-motori");
    assert.ok(b.cieco.some((c) => /motori di soldi.*senza-motori/.test(c)), JSON.stringify(b.cieco));
    assert.equal(lancia(dir).status, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("il controllo: con l'organigramma vero il bagaglio non grida al cieco ed esce 0", () => {
  const dir = radiceFinta({ organigramma: "vero" });
  try {
    const b = bagaglioDelGiro({ radice: dir });
    assert.equal(b.copertura.motoriCieco, false);
    assert.ok(b.turno.some((v) => v.motore), "con la fonte letta almeno un motore di soldi e' in turno");
    assert.deepEqual(b.cieco, [], "un cieco con la fonte letta accuserebbe un bagaglio sano");
    assert.equal(lancia(dir).status, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
