#!/usr/bin/env node
// AR-597 — il guardiano della verità dei numeri dava VIA LIBERA quando il suo registro spariva.
//
// Riprodotto dalla radiografia spostando registro-fatti.json: `leggiRegistro()` tornava il default
// vuoto — zero fatti, zero cacce, zero incoerenze — e il check usciva 0 con «✅ Memoria coerente».
// Consumatori di quel verde: giro.sh (vincolo hard al motore) e gate-pubblicazione.sh (cancello del
// push della memoria). La regola di casa: un metro che non può misurare dev'essere CIECO (e dirlo),
// non verde.
//
// Qui si ESEGUE sia la decisione pura (`verdettoRegistroAssente`) sia il programma vero, spawnato
// con un registro temporaneo (env COERENZA_FATTI_REGISTRO/REPORT): la memoria vera non si tocca.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";
import { verdettoRegistroAssente } from "../coerenza-fatti.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const GUARDIANO = join(REPO, "cervello", "coerenza-fatti.mjs");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

/** Spawna il guardiano vero su un registro/report temporanei. Niente rete: Supabase spento. */
function lancia(args, { registro, report }) {
  try {
    const out = execFileSync("node", [GUARDIANO, ...args], {
      cwd: REPO,
      encoding: "utf8",
      stdio: "pipe",
      env: { ...process.env, COERENZA_FATTI_REGISTRO: registro, COERENZA_FATTI_REPORT: report, SUPABASE_URL: "", SUPABASE_SERVICE_KEY: "" },
      timeout: 120_000,
    });
    return { rc: 0, out };
  } catch (e) {
    return { rc: e.status ?? 1, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
}

// ── la decisione, eseguita (non riletta) ─────────────────────────────────────
prova("chi VERIFICA su un registro assente è CIECO: exit 2, mai 0", () => {
  const v = verdettoRegistroAssente({ esiste: false, scopo: "controllo" });
  assert.equal(v.cieco, true);
  assert.equal(v.exit, 2, "2 = «non ho potuto misurare» (contratto AR-322), non un verde");
  assert.match(v.messaggio, /CIECO/i);
  assert.match(v.messaggio, /assente/i);
});

prova("registro presente: il check misura normalmente", () => {
  const v = verdettoRegistroAssente({ esiste: true, scopo: "controllo" });
  assert.equal(v.cieco, false);
  assert.equal(v.exit, 0);
});

prova("chi SCRIVE (`registra`) può creare il registro la prima volta: il default vuoto è suo", () => {
  const v = verdettoRegistroAssente({ esiste: false, scopo: "scrittura" });
  assert.equal(v.cieco, false, "la prima registrazione è legittima, non un buco");
});

// ── il programma vero, spawnato su un registro temporaneo ────────────────────
prova("il caso che ha rotto: check con registro SPARITO → rc≠0 e si dichiara cieco", () => {
  const dir = mkdtempSync(join(tmpdir(), "coerenza-cieco-"));
  const r = lancia([], { registro: join(dir, "non-esiste.json"), report: join(dir, "report.json") });
  assert.equal(r.rc, 2, `doveva uscire 2 (cieco), è uscito ${r.rc}:\n${r.out}`);
  assert.match(r.out, /CIECO/i, "deve DIRLO, non solo fallire");
  assert.doesNotMatch(r.out, /✅ Memoria coerente/, "il verde comprato a credito è il difetto stesso");
  rmSync(dir, { recursive: true, force: true });
});

prova("check con registro presente (anche vuoto di fatti): niente falso rosso", () => {
  const dir = mkdtempSync(join(tmpdir(), "coerenza-verde-"));
  const registro = join(dir, "registro.json");
  writeFileSync(registro, JSON.stringify({ versione: 1, aggiornato: null, fatti: [] }) + "\n");
  const r = lancia([], { registro, report: join(dir, "report.json") });
  assert.equal(r.rc, 0, `un registro vuoto ma PRESENTE non è un guasto:\n${r.out}`);
  rmSync(dir, { recursive: true, force: true });
});

prova("`registra --nuovo` su registro assente lo CREA ancora: il fix non ha rotto chi scrive", () => {
  const dir = mkdtempSync(join(tmpdir(), "coerenza-registra-"));
  const registro = join(dir, "registro.json");
  const r = lancia(["registra", "prova.fatto", "valore di prova", "--nuovo"], { registro, report: join(dir, "report.json") });
  assert.equal(r.rc, 0, `la prima registrazione doveva riuscire:\n${r.out}`);
  assert.equal(existsSync(registro), true, "il registro dev'essere nato");
  rmSync(dir, { recursive: true, force: true });
});

// ── esito ────────────────────────────────────────────────────────────────────
let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
