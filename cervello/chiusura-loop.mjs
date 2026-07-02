#!/usr/bin/env node
// 🔁 SENTINELLA CHIUSURA-LOOP (AR-009) — rende VIVO il loop di apprendimento dei 42 senior.
// 🟢 Sola lettura + scrittura sui quaderni memoria-squadra/<ruolo>.md (memoria dell'AD).
//
// Problema (AR-009): i vettori/carte-dipendente sono nei prompt, ma i quaderni scorecard su tutti
// i 42 senior restano VUOTI: nessuna forcing-function obbliga a registrare ESITO+scorecard dopo un
// lavoro. Lo strato di metacognizione resta decorativo → il loop non si chiude, l'azienda non impara.
//
// Questo file è la forcing-function, in due parti:
//   A) `registra` — la MANO che chiude il loop: dopo ogni lavoro 🟡/🔴 il senior/AD appende una riga
//      ESITO al quaderno del reparto, con SCORECARD e il numero ATTESO→REALE (la calibrazione).
//   B) `--sonda`  — il CONTROLLO settimanale/di-giro: scansiona tutti i 42 quaderni, trova quelli
//      FERMI (vuoti o senza un ESITO fresco) e li segnala alla Cabina (stampSegnale + stato file),
//      così l'AD è OBBLIGATO a riempirli (non resta decorativo).
//
// Uso:
//   node cervello/chiusura-loop.mjs registra <reparto> "<contesto>" "<scorecard>" "<atteso>" "<reale>" ["#tag..."]
//        es: node cervello/chiusura-loop.mjs registra vendite "pitch Casa Linda" "8/10 chiuso in 20min" "1 negozio LIVE" "1 negozio LIVE" "#onboarding"
//   node cervello/chiusura-loop.mjs --sonda [--json]      -> report quaderni fermi (per giro.sh / Cabina)
//   node cervello/chiusura-loop.mjs --lista               -> stato di tutti i quaderni
//
// Env (per la sonda, opzionale): CHIUSURA_LOOP_GIORNI (default 7) = un quaderno è "fermo" se l'ultimo
//   ESITO è più vecchio di N giorni (o se è ancora vuoto).

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const SQUADRA_DIR = join(AD_ROOT, "memoria-squadra");
const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
const STATE_PATH = join(VAULT, "chiusura-loop.json");
const GIORNI_STALLO = Number(process.env.CHIUSURA_LOOP_GIORNI || 7);

const JSON_MODE = process.argv.includes("--json");

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

function quadernoPath(reparto) {
  const nome = String(reparto || "").replace(/^@/, "").trim();
  return { nome, path: join(SQUADRA_DIR, `${nome}.md`) };
}

// Data (AAAA-MM-GG, con o senza ora) → giorni fa. Infinity se non parsabile.
function giorniFa(dataStr) {
  if (!dataStr) return Infinity;
  const m = String(dataStr).match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return Infinity;
  const [, y, mo, d, h = "12", mi = "00"] = m;
  const t = new Date(`${y}-${mo}-${d}T${h}:${mi}:00+02:00`).getTime();
  return Number.isNaN(t) ? Infinity : (Date.now() - t) / 86400000;
}

// Legge un quaderno e trova la data dell'ultimo ESITO reale (righe "- AAAA-MM-GG …" sotto ## Esiti).
function analizzaQuaderno(path) {
  if (!existsSync(path)) return { esiste: false, righe: 0, ultimo: null, vuoto: true };
  const testo = readFileSync(path, "utf8");
  // Righe-esito: iniziano con "- " e contengono una data AAAA-MM-GG; NON sono il placeholder "(ancora vuoto".
  const date = [];
  for (const riga of testo.split("\n")) {
    const t = riga.trim();
    if (!t.startsWith("- ")) continue;
    if (/ancora vuoto|placeholder/i.test(t)) continue;
    const m = t.match(/(\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2})?)/);
    if (m) date.push(m[1]);
  }
  date.sort();
  const ultimo = date.length ? date[date.length - 1] : null;
  return { esiste: true, righe: date.length, ultimo, vuoto: date.length === 0 };
}

// --- A) REGISTRA: appende una riga ESITO al quaderno del reparto (chiude il loop di un lavoro). ---
function registra(args) {
  const [reparto, contesto, scorecard, atteso, reale, ...tags] = args;
  if (!reparto || !contesto) {
    console.error(
      'Uso: node cervello/chiusura-loop.mjs registra <reparto> "<contesto>" "<scorecard>" "<atteso>" "<reale>" ["#tag"]'
    );
    process.exit(2);
  }
  const { nome, path } = quadernoPath(reparto);
  const quando = nowPiacenza();

  // Riga canonica (formato memoria-squadra/README): data · contesto · scorecard · atteso→reale · #tag
  const scoreTxt = scorecard ? ` · ${scorecard}` : "";
  const num = atteso || reale ? ` · atteso ${atteso || "?"} → reale ${reale || "?"}` : "";
  const tagTxt = tags.length ? ` · ${tags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")}` : "";
  const riga = `- ${quando} · ${contesto}${scoreTxt}${num}${tagTxt}`;

  let testo;
  if (existsSync(path)) {
    testo = readFileSync(path, "utf8");
    // Rimuovi il placeholder "(ancora vuoto…)" se presente (prima riga-esito vera).
    testo = testo.replace(/^- \(ancora vuoto[^\n]*\n?/m, "");
    if (/^##\s*Esiti/m.test(testo)) {
      testo = testo.replace(/(^##\s*Esiti[^\n]*\n)/m, `$1${riga}\n`);
    } else {
      testo = testo.trimEnd() + `\n\n## Esiti\n${riga}\n`;
    }
  } else {
    // Quaderno nuovo: crea lo scheletro standard.
    testo = `---
tipo: quaderno-memoria
reparto: ${nome}
---

# 🧠 Quaderno di ${nome}
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.
> Formato: AAAA-MM-GG · contesto · cosa ha funzionato o no · numero · lezione · #tag

## Esiti
${riga}
`;
  }
  mkdirSync(SQUADRA_DIR, { recursive: true });
  writeFileSync(path, testo, "utf8");
  console.log(`🔁 ESITO registrato nel quaderno di @${nome}:`);
  console.log(`   ${riga}`);
  console.log(`   → ${path}`);
}

// --- B) SONDA: trova i quaderni fermi (vuoti o senza ESITO fresco) e li segnala. ---
async function sonda() {
  const quando = nowPiacenza();
  if (!existsSync(SQUADRA_DIR)) {
    console.error(`Cartella non trovata: ${SQUADRA_DIR}`);
    process.exit(1);
  }
  const files = readdirSync(SQUADRA_DIR)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort();

  const quaderni = files.map((f) => {
    const path = join(SQUADRA_DIR, f);
    const a = analizzaQuaderno(path);
    const gg = a.ultimo ? giorniFa(a.ultimo) : Infinity;
    const fermo = a.vuoto || gg > GIORNI_STALLO;
    return {
      reparto: basename(f, ".md"),
      righe_esito: a.righe,
      ultimo_esito: a.ultimo,
      giorni_fa: Number.isFinite(gg) ? Math.round(gg) : null,
      vuoto: a.vuoto,
      fermo,
    };
  });

  const fermi = quaderni.filter((q) => q.fermo);
  const vuoti = quaderni.filter((q) => q.vuoto);
  const totale = quaderni.length;

  const state = {
    _cosa_e:
      "🔁 CHIUSURA-LOOP (AR-009): stato di freschezza dei 42 quaderni memoria-squadra. La sonda flagga i fermi/vuoti così il loop di apprendimento non resta decorativo. Scritto da cervello/chiusura-loop.mjs.",
    aggiornato: quando,
    soglia_giorni: GIORNI_STALLO,
    totale,
    vuoti: vuoti.length,
    fermi: fermi.length,
    vivi: totale - fermi.length,
    reparti_fermi: fermi.map((q) => q.reparto),
    quaderni,
  };
  writeJson(STATE_PATH, state);

  const sintesi = `${state.vivi}/${totale} quaderni vivi · ${vuoti.length} vuoti · ${fermi.length} fermi (>${GIORNI_STALLO}gg)`;
  await stampSegnale("chiusura-loop", fermi.length > totale / 2 ? "warn" : "ok", `${sintesi} · ${quando}`);

  if (JSON_MODE) {
    console.log(JSON.stringify({ quando, sintesi, ...state }, null, 2));
  } else {
    console.log(`\n🔁 CHIUSURA-LOOP — ${quando}`);
    console.log(`   ${sintesi}`);
    if (fermi.length) {
      console.log(`\n   Quaderni FERMI (loop non chiuso — l'AD deve lasciare un ESITO):`);
      for (const q of fermi.slice(0, 45)) {
        console.log(`   • @${q.reparto.padEnd(22)} ${q.vuoto ? "VUOTO" : `ultimo ${q.giorni_fa}gg fa`}`);
      }
      console.log(
        `\n   → Dopo ogni lavoro 🟡/🔴: node cervello/chiusura-loop.mjs registra <reparto> "<contesto>" "<scorecard>" "<atteso>" "<reale>"`
      );
    } else {
      console.log("   ✅ Tutti i quaderni sono vivi.");
    }
  }
  // Exit 0 sempre (la sonda informa, non blocca il giro).
  process.exit(0);
}

function lista() {
  const files = existsSync(SQUADRA_DIR)
    ? readdirSync(SQUADRA_DIR).filter((f) => f.endsWith(".md") && f !== "README.md").sort()
    : [];
  console.log(`\n🔁 Quaderni memoria-squadra (${files.length}):\n`);
  for (const f of files) {
    const a = analizzaQuaderno(join(SQUADRA_DIR, f));
    const stato = a.vuoto ? "VUOTO" : `${a.righe} esiti · ultimo ${a.ultimo}`;
    console.log(`  @${basename(f, ".md").padEnd(22)} ${stato}`);
  }
}

const cmd = process.argv[2];
if (cmd === "registra") {
  registra(process.argv.slice(3));
} else if (process.argv.includes("--sonda")) {
  await sonda();
} else if (process.argv.includes("--lista")) {
  lista();
} else {
  console.error(
    'Uso:\n  node cervello/chiusura-loop.mjs registra <reparto> "<contesto>" "<scorecard>" "<atteso>" "<reale>" ["#tag"]\n  node cervello/chiusura-loop.mjs --sonda [--json]\n  node cervello/chiusura-loop.mjs --lista'
  );
  process.exit(2);
}
