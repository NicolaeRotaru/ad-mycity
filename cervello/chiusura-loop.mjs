#!/usr/bin/env node
// 🔁 SENTINELLA CHIUSURA-LOOP (AR-009) — rende VIVO il loop di apprendimento di tutti i senior.
// 🟢 Sola lettura + scrittura sui quaderni memoria-squadra/<ruolo>.md (memoria dell'AD).
//
// Problema (AR-009): i vettori/carte-dipendente sono nei prompt, ma i quaderni scorecard su tutti
// i quaderni restano VUOTI se nessuno registra ESITO+scorecard dopo un
// lavoro. Lo strato di metacognizione resta decorativo → il loop non si chiude, l'azienda non impara.
//
// Questo file è la forcing-function, in due parti:
//   A) `registra` — la MANO che chiude il loop: dopo ogni lavoro 🟡/🔴 il senior/AD appende una riga
//      ESITO al quaderno del reparto, con SCORECARD e il numero ATTESO→REALE (la calibrazione).
//   B) `--sonda`  — il CONTROLLO settimanale/di-giro: scansiona tutti i quaderni (da roster 120 agenti), trova quelli
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
const AGENTS_DIR = join(AD_ROOT, ".claude/agents");

/** Elenco reparti dalla fonte di verità (.claude/agents/), non solo i quaderni già creati. */
function rosterReparti() {
  if (!existsSync(AGENTS_DIR)) return [];
  return readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => basename(f, ".md"))
    .sort();
}
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
  mkdirSync(SQUADRA_DIR, { recursive: true });
  const reparti = rosterReparti();
  if (!reparti.length) {
    console.error("Roster agenti vuoto — impossibile sondare i quaderni.");
    process.exit(1);
  }

  const quaderni = reparti.map((reparto) => {
    const path = join(SQUADRA_DIR, `${reparto}.md`);
    const a = analizzaQuaderno(path);
    const mancante = !a.esiste;
    const gg = a.ultimo ? giorniFa(a.ultimo) : Infinity;
    const fermo = mancante || a.vuoto || gg > GIORNI_STALLO;
    return {
      reparto,
      esiste: a.esiste,
      mancante,
      righe_esito: a.righe,
      ultimo_esito: a.ultimo,
      giorni_fa: Number.isFinite(gg) ? Math.round(gg) : null,
      vuoto: a.vuoto,
      fermo,
    };
  });

  const fermi = quaderni.filter((q) => q.fermo);
  const vuoti = quaderni.filter((q) => q.vuoto || q.mancante);
  const mancanti = quaderni.filter((q) => q.mancante);
  const totale = quaderni.length;

  const state = {
    _cosa_e:
      "🔁 CHIUSURA-LOOP (AR-009): stato di copertura e freschezza dei quaderni memoria-squadra (roster da .claude/agents/). La sonda flagga mancanti/fermi/vuoti così il loop di apprendimento non resta decorativo. Scritto da cervello/chiusura-loop.mjs.",
    aggiornato: quando,
    soglia_giorni: GIORNI_STALLO,
    totale,
    mancanti: mancanti.length,
    vuoti: vuoti.length,
    fermi: fermi.length,
    vivi: totale - fermi.length,
    reparti_fermi: fermi.map((q) => q.reparto),
    quaderni,
  };
  writeJson(STATE_PATH, state);

  const sintesi = `${state.vivi}/${totale} quaderni vivi · ${mancanti.length} mancanti · ${vuoti.length} vuoti · ${fermi.length} fermi (>${GIORNI_STALLO}gg)`;
  await stampSegnale("chiusura-loop", fermi.length > totale / 2 ? "warn" : "ok", `${sintesi} · ${quando}`);

  if (JSON_MODE) {
    console.log(JSON.stringify({ quando, sintesi, ...state }, null, 2));
  } else {
    console.log(`\n🔁 CHIUSURA-LOOP — ${quando}`);
    console.log(`   ${sintesi}`);
    if (fermi.length) {
      console.log(`\n   Quaderni FERMI (loop non chiuso — l'AD deve lasciare un ESITO):`);
      for (const q of fermi.slice(0, 45)) {
        const stato = q.mancante ? "MANCANTE" : q.vuoto ? "VUOTO" : `ultimo ${q.giorni_fa}gg fa`;
        console.log(`   • @${q.reparto.padEnd(22)} ${stato}`);
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
  const reparti = rosterReparti();
  console.log(`\n🔁 Quaderni memoria-squadra (${reparti.length} reparti nel roster):\n`);
  for (const reparto of reparti) {
    const a = analizzaQuaderno(join(SQUADRA_DIR, `${reparto}.md`));
    const stato = !a.esiste ? "MANCANTE" : a.vuoto ? "VUOTO" : `${a.righe} esiti · ultimo ${a.ultimo}`;
    console.log(`  @${reparto.padEnd(22)} ${stato}`);
  }
}

// --- C) GATE (PZ-008, piano "chiudi i loop"): FORCING-FUNCTION del giro. ---
// La sonda (B) informa; il gate PRETENDE: incrocia la SALA-OPERATIVA di OGGI con i quaderni.
// Un reparto che oggi ha scritto `FATTO` in Sala DEVE avere un ESITO fresco (oggi/ieri) nel suo
// quaderno — altrimenti il loop atteso→reale resta decorativo (il difetto-radice AR-009).
// Exit 1 + elenco dei reparti inadempienti: giro.sh lo trasforma in VINCOLO HARD per il motore
// ("registra gli ESITI prima di chiudere il giro"), come già fa con sensori e allocazione.
async function gate() {
  const quando = nowPiacenza();
  const oggi = quando.slice(0, 10);
  const salaPath = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/SALA-OPERATIVA.md");
  if (!existsSync(salaPath)) {
    console.log("🔁 gate: SALA-OPERATIVA.md assente — niente da verificare.");
    process.exit(0);
  }
  // Righe canoniche di oggi con FATTO: `- AAAA-MM-GG HH:MM · @reparto · FATTO · msg`
  const attiviOggi = new Set();
  for (const riga of readFileSync(salaPath, "utf8").split("\n")) {
    const m = riga.match(/^-\s*(\d{4}-\d{2}-\d{2})[^·]*·\s*@([a-z0-9-]+)\s*·\s*FATTO\b/i);
    if (m && m[1] === oggi) attiviOggi.add(m[2].toLowerCase());
  }
  const inadempienti = [];
  for (const reparto of [...attiviOggi].sort()) {
    const { path } = quadernoPath(reparto);
    const a = analizzaQuaderno(path);
    // ESITO "fresco" = datato oggi o ieri (il lavoro può chiudersi a cavallo di mezzanotte).
    const fresco = a.ultimo && giorniFa(a.ultimo) <= 1.5;
    if (!fresco) inadempienti.push({ reparto, ultimo_esito: a.ultimo || "mai" });
  }
  const out = { quando, oggi, attivi_oggi: [...attiviOggi].sort(), inadempienti };
  await stampSegnale(
    "chiusura-loop-gate",
    inadempienti.length ? "warn" : "ok",
    `${attiviOggi.size} reparti FATTO oggi · ${inadempienti.length} senza ESITO · ${quando}`
  );
  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else if (inadempienti.length) {
    console.log(`\n🔁 GATE CHIUSURA-LOOP — ${inadempienti.length} reparti con FATTO in Sala OGGI ma SENZA ESITO nel quaderno:`);
    for (const q of inadempienti) console.log(`   • @${q.reparto} (ultimo esito: ${q.ultimo_esito})`);
    console.log(`   → registra ORA: node cervello/chiusura-loop.mjs registra <reparto> "<contesto>" "<scorecard>" "<atteso>" "<reale>"`);
  } else {
    console.log(`✅ gate chiusura-loop: tutti i reparti attivi oggi (${attiviOggi.size}) hanno l'ESITO nel quaderno.`);
  }
  process.exit(inadempienti.length ? 1 : 0);
}

const cmd = process.argv[2];
if (cmd === "registra") {
  registra(process.argv.slice(3));
} else if (process.argv.includes("--sonda")) {
  await sonda();
} else if (process.argv.includes("--gate")) {
  await gate();
} else if (process.argv.includes("--lista")) {
  lista();
} else {
  console.error(
    'Uso:\n  node cervello/chiusura-loop.mjs registra <reparto> "<contesto>" "<scorecard>" "<atteso>" "<reale>" ["#tag"]\n  node cervello/chiusura-loop.mjs --sonda [--json]\n  node cervello/chiusura-loop.mjs --gate [--json]\n  node cervello/chiusura-loop.mjs --lista'
  );
  process.exit(2);
}
