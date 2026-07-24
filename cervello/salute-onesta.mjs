#!/usr/bin/env node
// 📈 SALUTE-ONESTA — «sto migliorando nel tempo?» come RISPOSTA, non come plateau (Mossa 6).
//
// IL PROBLEMA (sonda «metacognizione», 2026-07-24): la macchina ha un motore metacognitivo vero, ma
// il volano è FERMO e non si vede: su 90 snapshot di storico-salute.json il voto ONESTO (voto_pieno)
// è 0 in 84/90 — mentre il voto provvisorio/creditato (voto_salute) si muove, dando una falsa
// sensazione di progresso. E il cantiere CRESCE invece di andare a zero. Questo script mette in chiaro
// la serie ONESTA + il burn-down del cantiere: così «sto migliorando?» ha una risposta numerica.
//
// COSA FA (sola lettura): (1) la serie voto_pieno (onesto) e quante rilevazioni sono ferme a 0;
// (2) il burn-down del cantiere (difetti aperti ORA vs ~7 giorni fa, dalle date nato/chiuso_il).
//
// USO:
//   node cervello/salute-onesta.mjs           -> report umano
//   node cervello/salute-onesta.mjs --json     -> output macchina (serie KPI per il Pannello)
//
// Sola lettura. Non fallisce mai (exit 0).

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AC = join(ROOT, "MyCity-Vault", "90-Memoria-AI", "auto-coscienza");
const STORICO = join(AC, "storico-salute.json");
const CANTIERE = join(AC, "cantiere-difetti.json");

const JSON_OUT = process.argv.includes("--json");

function leggi(p) {
  try {
    return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
  } catch {
    return null;
  }
}
function giorno(iso) {
  const t = Date.parse(String(iso || "").slice(0, 10));
  return Number.isNaN(t) ? null : t;
}

// (1) SERIE ONESTA (voto_pieno)
const sj = leggi(STORICO);
const serie = sj && Array.isArray(sj.serie) ? sj.serie : Array.isArray(sj) ? sj : [];
// solo gli snapshot che HANNO un voto_pieno (le radiografie complete; gli auto-fix non lo scrivono)
const conPieno = serie.filter((s) => s && s.voto_pieno != null);
const ultimoPieno = conPieno.length ? Number(conPieno[conPieno.length - 1].voto_pieno) : null;
const ultimi = conPieno.slice(-10);
const fermiAZero = ultimi.filter((s) => Number(s.voto_pieno) === 0).length;
const primoPieno = conPieno.length ? Number(conPieno[0].voto_pieno) : null;
let trend = "n/d";
if (ultimoPieno != null && primoPieno != null) {
  trend = ultimoPieno > primoPieno ? "in salita" : ultimoPieno < primoPieno ? "in discesa" : "PIATTO";
}

// (2) BURN-DOWN CANTIERE
const cj = leggi(CANTIERE);
const difetti = cj && Array.isArray(cj.difetti) ? cj.difetti : [];
function apertiAllaData(tMs) {
  return difetti.filter((d) => {
    const nato = giorno(d.nato);
    if (nato == null || nato > tMs) return false; // non ancora nato a quella data
    const chiuso = giorno(d.chiuso_il);
    return chiuso == null || chiuso > tMs; // ancora aperto a quella data
  }).length;
}
// "ORA" ancorato all'ultima data del cantiere (niente Date.now non deterministico nel report principale)
const dateNote = difetti.map((d) => giorno(d.chiuso_il) || giorno(d.nato)).filter((x) => x != null);
const oraMs = dateNote.length ? Math.max(...dateNote) : null;
const settimanaFaMs = oraMs != null ? oraMs - 7 * 86400000 : null;
const apertiOra = oraMs != null ? apertiAllaData(oraMs) : (cj?.meta?.aperti ?? null);
const apertiSettimanaFa = settimanaFaMs != null ? apertiAllaData(settimanaFaMs) : null;
const burnDown =
  apertiOra != null && apertiSettimanaFa != null ? apertiSettimanaFa - apertiOra : null; // >0 = migliora

const report = {
  esito: "ok",
  voto_onesto_ultimo: ultimoPieno,
  voto_onesto_trend: trend,
  rilevazioni_con_voto_pieno: conPieno.length,
  su_totale_snapshot: serie.length,
  ultimi10_fermi_a_zero: fermiAZero,
  cantiere_aperti_ora: apertiOra,
  cantiere_aperti_settimana_fa: apertiSettimanaFa,
  burn_down_settimana: burnDown, // positivo = il cantiere cala (bene)
  cantiere_meta: cj?.meta ?? null,
};

if (JSON_OUT) {
  process.stdout.write(JSON.stringify(report, null, 2));
  process.exit(0);
}

console.log("📈 SALUTE ONESTA (sto migliorando nel tempo?)");
console.log(`   voto ONESTO (voto_pieno) ultimo: ${ultimoPieno ?? "n/d"}  ·  trend: ${trend}`);
console.log(`   rilevazioni con voto_pieno: ${conPieno.length}/${serie.length}  ·  ultimi 10 fermi a 0: ${fermiAZero}`);
console.log("");
console.log("🔻 Burn-down cantiere difetti:");
console.log(`   aperti ~7 giorni fa: ${apertiSettimanaFa ?? "n/d"}  →  aperti ora: ${apertiOra ?? "n/d"}`);
if (burnDown != null) {
  if (burnDown > 0) console.log(`   ✅ il cantiere CALA (${burnDown} difetti chiusi netti nella settimana).`);
  else if (burnDown < 0) console.log(`   ⚠️  il cantiere CRESCE (${-burnDown} difetti aperti netti in più): non va a zero.`);
  else console.log("   ⏸️  cantiere fermo (né su né giù).");
}
console.log("");
if (ultimoPieno === 0 || fermiAZero >= 8) {
  console.log("⚠️  Il metro ONESTO è fermo: il voto pieno non si muove (o resta 0). Il progresso");
  console.log("   'creditato' non è progresso reale. Prossimo passo: cablare questa serie come KPI nel");
  console.log("   Pannello e sbloccare l'auto-radiografia completa (oggi la sentinella la chiede ma non parte).");
} else {
  console.log("✅ Il metro onesto si muove.");
}
process.exit(0);
