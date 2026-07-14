#!/usr/bin/env node
// AR-036 — Sentinella deterministica delle FONTI WEB (radar-fonti.json).
// 🟢 Sola lettura verso l'esterno (solo HEAD/GET, nessuna scrittura sul mondo). Verifica che ogni
// fonte del radar sia VIVA o MORTA/STALE e scrive lo stato in cervello/fonti-salute.json.
//
// Perché (AR-036): i sensori sui dati interni hanno già un guardiano deterministico a costo zero
// (verifica-sensori/sentinella-dati); le fonti web NO. Così una fonte peso≥4 poteva morire (404/DNS)
// senza che nessun canale se ne accorgesse. Questa sentinella porta le due classi di sensori allo
// stesso standard di verificabilità e alza un evento 🟡 se una fonte pesante è morta da N controlli.
//
// Uso:
//   node cervello/sentinella-fonti.mjs           -> controlla e scrive fonti-salute.json
//   node cervello/sentinella-fonti.mjs --json     -> stampa il risultato in JSON
//
// Exit: 0 = nessuna fonte pesante morta · 1 = almeno una fonte peso≥4 morta (gate 🟡 nel giro)

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");

// Fonte di verità: solo radar-fonti.json (il file «fattori» ha schema diverso, non va usato qui).
const RADAR_FONTI = join(AD_ROOT, "cervello/radar-fonti.json");
const OUT = join(AD_ROOT, "cervello/fonti-salute.json");
const SOGLIA_MORTA = 3; // dopo N controlli falliti consecutivi la fonte è "morta"
const PESO_CRITICO = 4;

function caricaRadar() {
  if (!existsSync(RADAR_FONTI)) return { file: null, fonti: [], errore: "radar-fonti.json assente" };
  try {
    const j = JSON.parse(readFileSync(RADAR_FONTI, "utf8"));
    if (!Array.isArray(j.fonti) || j.fonti.length === 0) {
      return { file: RADAR_FONTI, fonti: [], errore: "radar-fonti.json senza array fonti valido" };
    }
    return { file: RADAR_FONTI, fonti: j.fonti };
  } catch {
    return { file: RADAR_FONTI, fonti: [], errore: "radar-fonti.json illeggibile" };
  }
}

function caricaStoricoPrecedente() {
  if (!existsSync(OUT)) return {};
  try {
    const j = JSON.parse(readFileSync(OUT, "utf8"));
    const idx = {};
    for (const f of j.fonti || []) idx[f.id] = f;
    return idx;
  } catch {
    return {};
  }
}

// Un controllo HTTP a basso costo: prima HEAD, fallback GET se HEAD non è supportato.
async function controlla(url) {
  const opt = (method) => ({
    method,
    redirect: "follow",
    signal: AbortSignal.timeout(12000),
    headers: { "user-agent": "MyCity-sentinella-fonti/1.0" },
  });
  try {
    let r = await fetch(url, opt("HEAD"));
    if (r.status === 405 || r.status === 501) r = await fetch(url, opt("GET"));
    return { viva: r.ok || (r.status >= 200 && r.status < 400), status: r.status };
  } catch (e) {
    return { viva: false, status: 0, errore: String(e && e.name ? e.name : e) };
  }
}

async function main() {
  const quando = nowPiacenza();
  const { file, fonti, errore } = caricaRadar();
  if (!file || !fonti.length) {
    const out = { ok: false, quando, errore: errore || "radar-fonti.json non trovato o vuoto" };
    console.log(JSON_MODE ? JSON.stringify(out) : "❌ radar-fonti.json non trovato");
    writeFileSync(OUT, JSON.stringify(out, null, 2));
    process.exit(1);
  }

  const prima = caricaStoricoPrecedente();
  const risultati = [];
  for (const f of fonti) {
    const r = await controlla(f.url);
    const precFalliti = (prima[f.id] && prima[f.id].falliti_consecutivi) || 0;
    const falliti = r.viva ? 0 : precFalliti + 1;
    risultati.push({
      id: f.id,
      nome: f.nome,
      url: f.url,
      peso: f.peso || 0,
      viva: r.viva,
      status: r.status,
      falliti_consecutivi: falliti,
      morta: falliti >= SOGLIA_MORTA,
      ultimo_controllo: quando,
      ...(r.errore ? { errore: r.errore } : {}),
    });
  }

  const morteCritiche = risultati.filter((x) => x.morta && x.peso >= PESO_CRITICO);
  const out = {
    ok: morteCritiche.length === 0,
    quando,
    radar: file.replace(AD_ROOT + "/", ""),
    fonti_totali: risultati.length,
    vive: risultati.filter((x) => x.viva).length,
    morte: risultati.filter((x) => x.morta).length,
    allerta_peso_critico: morteCritiche.map((x) => ({ id: x.id, peso: x.peso, status: x.status })),
    fonti: risultati,
  };

  writeFileSync(OUT, JSON.stringify(out, null, 2));

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else if (out.ok) {
    console.log(`✅ fonti: ${out.vive}/${out.fonti_totali} vive, nessuna peso≥${PESO_CRITICO} morta — ${quando}`);
  } else {
    console.log(`🟡 fonti: ${morteCritiche.length} fonte/i peso≥${PESO_CRITICO} morte da ≥${SOGLIA_MORTA} controlli — ${quando}`);
    for (const m of morteCritiche) console.log(`  · ${m.id} (peso ${m.peso}, status ${m.status})`);
  }
  process.exit(out.ok ? 0 : 1);
}

main();
