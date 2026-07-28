#!/usr/bin/env node
// AR-284 — il sensore degli ordini deve distinguere «non c'è niente» da «non vedo niente».
//
// PostgREST con una chiave che le policy RLS non autorizzano risponde 200 con una lista vuota. Il
// vecchio controllo si fermava all'HTTP 200 e dichiarava «orders leggibili via REST»: il giro leggeva
// zero ordini e scriveva zero come se fosse un fatto del mondo. Uno zero rassicura, e nessuno andava
// a controllare la chiave.
//
// Qui si fa accadere davvero: un finto PostgREST locale che risponde 200 con `Content-Range: 0-0/0`,
// e uno stato precedente che diceva 12 righe. Il sensore deve dichiararsi CIECO, non sano.

import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const SENSORE = join(QUI, "..", "verifica-sensori.mjs");

/**
 * Finto PostgREST, in un PROCESSO A PARTE: il sensore si lancia con execFileSync, che blocca il
 * ciclo di eventi di chi lo chiama — un server nello stesso processo non risponderebbe mai (ci sono
 * cascato scrivendo questo test: tre casi rossi con «operation aborted due to timeout»).
 */
function fintoPostgrest(totale) {
  const src = `
    import { createServer } from "node:http";
    const srv = createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "application/json", "Content-Range": "0-0/${totale}" });
      res.end(${totale} > 0 ? JSON.stringify([{ id: "x" }]) : "[]");
    });
    srv.listen(0, "127.0.0.1", () => console.log(srv.address().port));
  `;
  const srv = spawn("node", ["--input-type=module", "-e", src], { stdio: ["ignore", "pipe", "inherit"] });
  return new Promise((ok, ko) => {
    const t = setTimeout(() => ko(new Error("il finto PostgREST non è partito")), 10000);
    srv.stdout.once("data", (b) => {
      clearTimeout(t);
      ok({ srv, porta: Number(String(b).trim()) });
    });
  });
}

function eseguiSensore({ porta, statoPrecedente }) {
  const base = mkdtempSync(join(tmpdir(), "sensore-ordini-"));
  const statoFile = join(base, "sensori-cecita.json");
  writeFileSync(statoFile, JSON.stringify(statoPrecedente));
  try {
    const out = execFileSync("node", [SENSORE, "--json"], {
      encoding: "utf8",
      stdio: "pipe",
      env: {
        ...process.env,
        SENSORI_CECITA_FILE: statoFile,
        MARKETPLACE_SUPABASE_URL: `http://127.0.0.1:${porta}`,
        MARKETPLACE_SUPABASE_KEY: "chiave-finta-di-prova",
      },
    });
    return { json: JSON.parse(out), stato: JSON.parse(readFileSync(statoFile, "utf8")) };
  } catch (e) {
    // exit 1 = tutti ciechi: qui è un esito legittimo, il JSON è comunque su stdout
    return { json: JSON.parse(String(e.stdout || "{}")), stato: JSON.parse(readFileSync(statoFile, "utf8")) };
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
}

const casi = [];
const prova = async (nome, fn) => {
  try {
    await fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

await prova("il caso che ha rotto: 200 con zero righe dopo un conteggio non-zero = CECITÀ SOSPETTA", async () => {
  const { srv, porta } = await fintoPostgrest(0);
  try {
    const { json } = eseguiSensore({
      porta,
      statoPrecedente: { sensori: { supabase_rest: { stato: "ok", ultimo_conteggio: 12 } }, meta: {} },
    });
    const sb = json.checks.find((c) => c.nome === "supabase_rest");
    assert.equal(sb.ok, false, "il sensore doveva dichiararsi cieco, non sano");
    assert.match(sb.dettaglio, /CECIT/i);
    assert.equal(json.datiOrdiniCiechi, true, "il giro deve ricevere il vincolo «niente numeri nuovi»");
  } finally {
    srv.kill();
  }
});

await prova("conta davvero, e il conteggio resta per il giro dopo", async () => {
  const { srv, porta } = await fintoPostgrest(37);
  try {
    const { json, stato } = eseguiSensore({ porta, statoPrecedente: { sensori: {}, meta: {} } });
    const sb = json.checks.find((c) => c.nome === "supabase_rest");
    assert.equal(sb.ok, true);
    assert.match(sb.dettaglio, /37 righe/);
    assert.equal(stato.sensori.supabase_rest.ultimo_conteggio, 37, "il metro del prossimo giro va salvato");
  } finally {
    srv.kill();
  }
});

await prova("zero righe SENZA un passato non-zero resta un fatto, non un allarme", async () => {
  // Un marketplace appena nato ha davvero zero ordini: gridare al lupo qui renderebbe il sensore
  // inutile proprio nella fase in cui MyCity si trova.
  const { srv, porta } = await fintoPostgrest(0);
  try {
    const { json } = eseguiSensore({ porta, statoPrecedente: { sensori: {}, meta: {} } });
    const sb = json.checks.find((c) => c.nome === "supabase_rest");
    assert.equal(sb.ok, true, "senza un conteggio precedente non c'è nessun crollo da segnalare");
  } finally {
    srv.kill();
  }
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
