#!/usr/bin/env node
// Tick leggero auto-coscienza — aggiorna apprendimento e miglioramento senza token AI.
// 🟢 Scrive solo meta/aggiornato nei JSON del vault (memoria AD).
//
// Cosa fa (ogni ~10 min, invocato da sentinella-dati):
//   1. tasso-lezioni.mjs → ricalcola meta.tasso_applicazione + aggiornato su apprendimento.json
//   2. esperimenti-check.mjs --solo-bookkeeping → meta_esperimenti + aggiornato su auto-miglioramento.json
//
// Uso:
//   node cervello/tick-auto-coscienza-leggero.mjs
//   node cervello/tick-auto-coscienza-leggero.mjs --forza   # ignora throttle 10 min
//   node cervello/tick-auto-coscienza-leggero.mjs --json

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const FORZA = process.argv.includes("--forza");
const JSON_MODE = process.argv.includes("--json");
const SCRIPT_DIR = join(AD_ROOT, "cervello");
const MINUTI = Number(process.env.TICK_COSCIENZA_MIN || 10);
const APPR_PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");

function parsePiacenza(dataStr) {
  if (!dataStr) return null;
  const m = String(dataStr).match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h = "12", mi = "00"] = m;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:00+02:00`);
}

function minutiDa(dataStr) {
  const d = parsePiacenza(dataStr);
  if (!d || Number.isNaN(d.getTime())) return Infinity;
  return (Date.now() - d.getTime()) / 60000;
}

function ultimoTick() {
  if (!existsSync(APPR_PATH)) return null;
  try {
    const appr = JSON.parse(readFileSync(APPR_PATH, "utf8"));
    return appr.meta?.tick_leggero_il || appr.aggiornato || null;
  } catch {
    return null;
  }
}

function runScript(name, extraArgs = []) {
  try {
    execFileSync("node", [join(SCRIPT_DIR, name), ...extraArgs], {
      cwd: AD_ROOT,
      stdio: "pipe",
      encoding: "utf8",
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, stderr: (e.stderr || e.message || "").toString().slice(0, 200) };
  }
}

async function main() {
  const quando = nowPiacenza();
  const ultimo = ultimoTick();
  const eta = minutiDa(ultimo);

  if (!FORZA && ultimo && eta < MINUTI) {
    const out = { ok: true, saltato: true, motivo: `ultimo tick ${Math.round(eta)} min fa (< ${MINUTI})`, quando };
    if (JSON_MODE) console.log(JSON.stringify(out));
    process.exit(0);
  }

  const tasso = runScript("tasso-lezioni.mjs");
  const esperimenti = runScript("esperimenti-check.mjs", ["--solo-bookkeeping"]);

  // Segna il tick (tasso-lezioni ha già toccato aggiornato; qui mettiamo il marcatore throttle)
  if (existsSync(APPR_PATH)) {
    try {
      const appr = JSON.parse(readFileSync(APPR_PATH, "utf8"));
      appr.meta = { ...(appr.meta || {}), tick_leggero_il: quando };
      mkdirSync(join(APPR_PATH, ".."), { recursive: true });
      writeFileSync(APPR_PATH, JSON.stringify(appr, null, 2) + "\n", "utf8");
    } catch {
      /* non bloccare il tick */
    }
  }

  const sintesi = `tasso ${tasso.ok ? "ok" : "warn"} · esperimenti ${esperimenti.ok ? "ok" : "warn"}`;
  await stampSegnale("tick-coscienza-leggero", tasso.ok && esperimenti.ok ? "ok" : "warn", `${sintesi} · ${quando}`);

  const out = { ok: true, quando, ultimo_tick: ultimo, tasso, esperimenti, sintesi };
  if (JSON_MODE) console.log(JSON.stringify(out, null, 2));
  else console.log(`🔄 tick auto-coscienza leggero — ${sintesi}`);
  process.exit(0);
}

main().catch(async (e) => {
  await stampSegnale("tick-coscienza-leggero", "errore", `crash: ${(e.message || e).toString().slice(0, 160)}`);
  console.error("ERRORE tick-auto-coscienza-leggero:", e.message || e);
  process.exit(1);
});
