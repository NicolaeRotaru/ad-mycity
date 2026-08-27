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
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { scriviStatoSensore } from "./stato-sensori.mjs";
import { timbraReferto } from "./eta-referto.mjs"; // AR-286: chi ha scritto questa misura, e da dove

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
// Se la fonte ha skip_check: true (es. IP VPS bloccato da CDN), la marca viva e salta il fetch.
async function controlla(url, skipCheck) {
  if (skipCheck) return { viva: true, status: 0, saltata: true };
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
    console.log(JSON_MODE ? JSON.stringify(out) : "⚪ radar-fonti.json non trovato: non ho potuto guardare nessuna fonte");
    writeFileSync(OUT, JSON.stringify(out, null, 2));
    // AR-859 — 2 = NON HO POTUTO MISURARE: senza l'elenco delle fonti non ne ho controllata nessuna,
    // che e' un'altra cosa dall'averle controllate e trovate morte.
    process.exit(2);
  }

  const prima = caricaStoricoPrecedente();
  const risultati = [];
  for (const f of fonti) {
    const r = await controlla(f.url, !!f.skip_check);
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
      ...(f.skip_check ? { skip_check: true, nota_check: f.nota_blocco || "check saltato" } : {}),
      ...(r.errore ? { errore: r.errore } : {}),
    });
  }

  const morteCritiche = risultati.filter((x) => x.morta && x.peso >= PESO_CRITICO);
  const out = {
    ok: morteCritiche.length === 0,
    quando,
    // AR-286 — «fonte morta» detto da una macchina senza rete e detto dal VPS sono due notizie
    // diverse, e fino a oggi il file le scriveva uguali. Il timbro dice da dove viene la misura e
    // per quanto vale; i nomi delle chiavi, mai i valori.
    timbro: timbraReferto({
      quando,
      scadenzaOre: 24,
      scrittoDa: "cervello/sentinella-fonti.mjs",
      env: process.env,
      chiavi: ["SUPABASE_URL", "MARKETPLACE_SUPABASE_URL"],
    }),
    radar: file.replace(AD_ROOT + "/", ""),
    fonti_totali: risultati.length,
    vive: risultati.filter((x) => x.viva).length,
    morte: risultati.filter((x) => x.morta).length,
    allerta_peso_critico: morteCritiche.map((x) => ({ id: x.id, peso: x.peso, status: x.status })),
    fonti: risultati,
  };

  // AR-281 — se NESSUNA fonte ha risposto (status 0 ovunque) non è il web a essere morto: è questa
  // macchina a non avere rete. Persistere quel verdetto azzera i contatori buoni del VPS e fa suonare
  // l'allarme «fonti critiche morte» per un guasto che sta tutto dentro l'ambiente che misura.
  const almenoUnaHaRisposto = risultati.some((r) => r.status > 0 || r.skip_check);
  const esitoScrittura = scriviStatoSensore(OUT, out, {
    ambienteConfigurato: almenoUnaHaRisposto,
    motivo: `nessuna delle ${risultati.length} fonti ha risposto: rete assente in questo ambiente, non fonti morte`,
    // La copertura è quante fonti hanno DAVVERO risposto, non quante ne ho provate: è il numero che
    // il freno confronta, e contare i tentativi lo gonfierebbe proprio dove la rete è più povera.
    copertura: risultati.filter((r) => r.status > 0 || r.skip_check).length,
    scrittoDa: "sentinella-fonti.mjs",
  });
  if (!esitoScrittura.scritto) console.error(esitoScrittura.spiegazione);

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

// Il programma parte SOLO se qualcuno lancia questo file: importarlo per usarne una funzione non
// deve far girare la sentinella intera. Un modulo che si esegue all'import non e provabile.
const lanciatoDaRigaDiComando = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (lanciatoDaRigaDiComando) main();
