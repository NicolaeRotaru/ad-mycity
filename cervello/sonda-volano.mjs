#!/usr/bin/env node
// Sonda leggera del volano di auto-coscienza — 4 invarianti deterministici.
// 🟢 Sola lettura sui dati esterni; scrive auto-radiografia.json (blocco sonda) + storico-salute.json.
//
// Risolve chiusura-volano: monitora tasso_applicazione, cadenza giro, sentinelle, loop.
// Se tasso < 0.3 per 3 giri consecutivi → flag serve_radiografia_completa.
//
// Uso:
//   node cervello/sonda-volano.mjs
//   node cervello/sonda-volano.mjs --json

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
const RAD_PATH = join(VAULT, "auto-radiografia.json");
const STORICO_PATH = join(VAULT, "storico-salute.json");
const APP_PATH = join(VAULT, "apprendimento.json");
const CECITA_PATH = join(VAULT, "sensori-cecita.json");
const BRIEF_PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/ultimo-briefing.json");

function readJson(path, fallback = {}) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(path, data) {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

/** @param {string} dataStr "AAAA-MM-DD HH:MM" */
function parsePiacenza(dataStr) {
  if (!dataStr) return null;
  const m = String(dataStr).match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h = "12", mi = "00"] = m;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:00+02:00`);
}

function oreFa(dataStr) {
  const d = parsePiacenza(dataStr);
  if (!d || Number.isNaN(d.getTime())) return Infinity;
  return (Date.now() - d.getTime()) / 3600000;
}

function main() {
  const quando = nowPiacenza();
  const app = readJson(APP_PATH);
  const cecita = readJson(CECITA_PATH);
  const brief = readJson(BRIEF_PATH);
  const rad = readJson(RAD_PATH, {
    data: quando,
    tipo: "completa",
    voto_salute_architettura: 72,
    trend: "=",
    sintesi: "",
    dimensioni: [],
    sonda: {},
  });
  const storico = readJson(STORICO_PATH, { serie: [] });

  const tasso = Number(app.meta?.tasso_applicazione ?? 0);
  const loopChiude = tasso > 0;

  const oreBrief = oreFa(brief.data);
  const oreRad = oreFa(rad.data);
  const giroACadenza = oreBrief <= 6;

  const sensori = cecita.sensori || {};
  const maxCecita = Number(cecita.meta?.max_giri_ciechi ?? 0);
  const sensoriOk = Number(cecita.meta?.sensori_ok ?? 0);
  const sentinelleScattano = maxCecita >= 3 || sensoriOk === 0;

  // Traccia giri consecutivi con tasso basso
  rad.sonda_meta = rad.sonda_meta || {};
  const prevBassi = Number(rad.sonda_meta.giri_tasso_basso || 0);
  const giriTassoBasso = tasso < 0.3 ? prevBassi + 1 : 0;
  const serveRadiografiaCompleta = giriTassoBasso >= 3 || oreRad > 240;

  let verdetto = "ok";
  if (!loopChiude || giriTassoBasso >= 3) verdetto = "serve-completa";
  else if (!giroACadenza || maxCecita >= 3 || tasso < 0.3) verdetto = "attenzione";

  const sonda = {
    data: quando,
    loop_chiude: loopChiude,
    tasso_applicazione: tasso,
    giro_a_cadenza: giroACadenza,
    sentinelle_scattano: sentinelleScattano,
    ore_da_ultima_completa: Math.round(oreRad),
    ore_da_ultimo_briefing: Math.round(oreBrief),
    max_giri_ciechi_sensori: maxCecita,
    giri_tasso_basso: giriTassoBasso,
    serve_radiografia_completa: serveRadiografiaCompleta,
    verdetto,
    nota: [
      loopChiude ? "loop ok" : "tasso_applicazione=0",
      giroACadenza ? `briefing ${Math.round(oreBrief)}h fa` : `briefing STALE (${Math.round(oreBrief)}h)`,
      maxCecita >= 3 ? `cecità sensori ${maxCecita} giri` : `sensori max cecità ${maxCecita}`,
      giriTassoBasso >= 3 ? "tasso basso 3+ giri → radiografia completa" : null,
    ]
      .filter(Boolean)
      .join(" · "),
  };

  rad.sonda = sonda;
  rad.sonda_meta = { giri_tasso_basso: giriTassoBasso, aggiornato: quando };

  writeJson(RAD_PATH, rad);

  const voto = Number(rad.voto_salute_architettura ?? 72);
  const difettiAperti = readJson(join(VAULT, "cantiere-difetti.json")).meta?.aperti ?? 0;
  const ultimoSnap = storico.serie?.[storico.serie.length - 1];
  const oggi = quando.slice(0, 10);
  const nuovoSnap = {
    data: oggi,
    voto_salute: voto,
    difetti_aperti: difettiAperti,
    difetti_chiusi: 0,
    tipo: "sonda",
    nota: sonda.nota,
  };
  if (!ultimoSnap || ultimoSnap.data !== oggi || ultimoSnap.nota !== sonda.nota) {
    storico.serie = storico.serie || [];
    storico.serie.push(nuovoSnap);
    if (storico.serie.length > 90) storico.serie = storico.serie.slice(-90);
    writeJson(STORICO_PATH, storico);
  }

  stampSegnale(
    "sonda-volano",
    verdetto === "ok" ? "ok" : "warn",
    `${verdetto} · tasso ${Math.round(tasso * 100)}% · ${quando}`
  );

  const out = { quando, sonda, serve_radiografia_completa: serveRadiografiaCompleta };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(`\n🩻 SONDA VOLANO — ${quando}\n`);
    console.log(`Loop chiude:        ${loopChiude ? "✅" : "❌"} (tasso ${Math.round(tasso * 100)}%)`);
    console.log(`Giro a cadenza:     ${giroACadenza ? "✅" : "❌"} (briefing ${Math.round(oreBrief)}h fa)`);
    console.log(`Sentinelle:         ${sentinelleScattano ? "⚠️  scattate" : "✅ quiete"}`);
    console.log(`Verdetto:           ${verdetto}`);
    if (serveRadiografiaCompleta) {
      console.log("\n→ Accoda 🟡 radiografia completa di sé (ritmo settimanale o su comando).");
    }
  }

  process.exit(verdetto === "ok" ? 0 : verdetto === "attenzione" ? 0 : 1);
}

main();
