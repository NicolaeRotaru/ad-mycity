#!/usr/bin/env node
// 🔧 AUTO-FIX — la pipeline che CHIUDE i difetti del cantiere (upgrade U17).
// 🟢 Sola lettura del codice + aggiornamento della memoria auto-coscienza (cantiere + storico).
//    ⚠️ Governo: MODIFICARE il codice per risolvere un difetto resta 🟡 (firma Nicola, via PR).
//    Questo script NON tocca codice: verifica se un fix è GIÀ presente e, in tal caso, chiude il
//    difetto onestamente (bookkeeping 🟢). Per i difetti ancora aperti stampa la proposta 🟡 da firmare.
//
// Perché esiste: il volano diagnosticava difetti ma ne chiudeva 0 (chiuso-volano). Senza chiusura,
// l'auto-radiografia è un bel cruscotto, non un sistema che si ripara. Questo chiude il ciclo.
//
// Ogni difetto in cantiere-difetti.json può avere una prova oggettiva di risoluzione:
//   "verifica": { "file": "cervello/x.mjs", "pattern": "regex", "presente": true }
//   presente:true  → il difetto è risolto QUANDO il pattern è presente nel file (fix installato)
//   presente:false → il difetto è risolto QUANDO il pattern è ASSENTE (es. path Windows rimosso)
//
// Uso:
//   node cervello/auto-fix.mjs verifica              # report: quali difetti risultano risolti nel codice
//   node cervello/auto-fix.mjs verifica --applica    # chiude nel cantiere quelli verificati + aggiorna storico
//   node cervello/auto-fix.mjs chiudi --id=AR-002 --come="..."   # chiusura manuale con evidenza
//   node cervello/auto-fix.mjs report                # stato del cantiere (aperti/in-corso/chiusi)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
const CANTIERE = join(VAULT, "cantiere-difetti.json");
const STORICO = join(VAULT, "storico-salute.json");
const RAD = join(VAULT, "auto-radiografia.json");

function arg(name, def = undefined) {
  const pref = `--${name}=`;
  const a = process.argv.find((x) => x.startsWith(pref));
  return a ? a.slice(pref.length) : def;
}
function has(flag) {
  return process.argv.includes(`--${flag}`);
}

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}
function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function ricalcolaMeta(cantiere) {
  const d = cantiere.difetti || [];
  cantiere.meta = {
    aperti: d.filter((x) => x.stato === "aperto").length,
    in_corso: d.filter((x) => x.stato === "in-corso").length,
    chiusi: d.filter((x) => x.stato === "chiuso").length,
  };
}

// Verifica oggettiva: il fix è presente nel codice?
function verificaFix(dif) {
  const v = dif.verifica;
  if (!v || !v.file || !v.pattern) return { esito: "manuale", dettaglio: "nessuna prova automatica: verifica umana" };
  const p = join(AD_ROOT, v.file);
  if (!existsSync(p)) return { esito: "aperto", dettaglio: `file assente: ${v.file}` };
  let txt = "";
  try {
    txt = readFileSync(p, "utf8");
  } catch (e) {
    return { esito: "aperto", dettaglio: `illeggibile: ${e.message}` };
  }
  let re;
  try {
    re = new RegExp(v.pattern);
  } catch (e) {
    return { esito: "manuale", dettaglio: `pattern non valido: ${e.message}` };
  }
  const trovato = re.test(txt);
  const vuolePresente = v.presente !== false; // default: presente=true
  const risolto = vuolePresente ? trovato : !trovato;
  return {
    esito: risolto ? "risolto" : "aperto",
    dettaglio: `${v.file} ${vuolePresente ? "contiene" : "NON contiene"} /${v.pattern}/ → ${trovato ? "trovato" : "assente"}`,
  };
}

function bumpSalute(chiusiOra, note) {
  if (chiusiOra <= 0) return;
  // AR-096: il voto NON si auto-gonfia più qui (era +2 fisso a ogni chiusura, solo in salita, scritto
  // dal processo che ha interesse a farlo salire). Il voto_salute_architettura resta un output della
  // radiografia completa (che vede aperti/gravità/nuovi difetti): auto-fix lo LEGGE come-è, non lo tocca,
  // e si limita ad aggiornare il conteggio dei difetti chiusi nello storico.
  const rad = readJson(RAD, {});
  const voto = Number(rad.voto_salute_architettura ?? 72);

  const cantiere = readJson(CANTIERE, { meta: {} });
  const storico = readJson(STORICO, { serie: [] });
  storico.serie = storico.serie || [];
  storico.serie.push({
    data: nowPiacenza().slice(0, 10),
    voto_salute: voto,
    difetti_aperti: cantiere.meta?.aperti ?? 0,
    difetti_chiusi: chiusiOra,
    tipo: "auto-fix",
    nota: note,
  });
  if (storico.serie.length > 90) storico.serie = storico.serie.slice(-90);
  writeJson(STORICO, storico);
  console.log(`📈 ${chiusiOra} difetti chiusi · voto salute (dalla radiografia, non gonfiato): ${voto}.`);
}

async function cmdVerifica(cantiere) {
  const applica = has("applica");
  const aperti = (cantiere.difetti || []).filter((d) => d.stato !== "chiuso");
  console.log(`\n🔧 AUTO-FIX — verifica cantiere (${aperti.length} non chiusi) — ${nowPiacenza()}\n`);
  const daChiudere = [];
  for (const d of aperti) {
    const r = verificaFix(d);
    const icona = r.esito === "risolto" ? "✅ risolto" : r.esito === "manuale" ? "🖐️  manuale" : "⏳ aperto";
    console.log(`${icona}  ${d.id} — ${d.titolo}`);
    console.log(`        ${r.dettaglio}`);
    if (r.esito === "risolto") daChiudere.push({ d, come: r.dettaglio });
  }
  if (!applica) {
    if (daChiudere.length) {
      console.log(`\n→ ${daChiudere.length} difetto/i risultano risolti nel codice. Chiudili: node cervello/auto-fix.mjs verifica --applica`);
    } else {
      console.log("\nNessun difetto auto-verificabile risulta risolto ora.");
    }
    // Difetti ancora aperti = proposte 🟡 da firmare
    const ancora = aperti.filter((d) => !daChiudere.some((x) => x.d.id === d.id));
    if (ancora.length) {
      console.log(`\n🟡 Ancora da risolvere (proposta di fix da firmare):`);
      for (const d of ancora) console.log(`  · ${d.id} [${d.impatto_crescita}] ${d.titolo} → ${d.fix_proposto}`);
    }
    return;
  }
  for (const { d, come } of daChiudere) {
    d.stato = "chiuso";
    d.chiuso_il = nowPiacenza();
    d.chiuso_come = come;
  }
  ricalcolaMeta(cantiere);
  cantiere.aggiornato = nowPiacenza();
  writeJson(CANTIERE, cantiere);
  bumpSalute(daChiudere.length, `Auto-fix: chiusi ${daChiudere.map((x) => x.d.id).join(", ")} (verificati nel codice).`);
  console.log(`\n✅ Chiusi ${daChiudere.length}. Cantiere ora: ${cantiere.meta.aperti} aperti · ${cantiere.meta.in_corso} in-corso · ${cantiere.meta.chiusi} chiusi.`);
}

function cmdChiudi(cantiere) {
  const id = arg("id");
  const come = arg("come", "chiusura manuale");
  if (!id) {
    console.error("❌ Serve --id. Es: node cervello/auto-fix.mjs chiudi --id=AR-002 --come=\"...\"");
    process.exit(2);
  }
  const d = (cantiere.difetti || []).find((x) => x.id === id);
  if (!d) {
    console.error(`❌ Difetto non trovato: ${id}`);
    process.exit(2);
  }
  d.stato = "chiuso";
  d.chiuso_il = nowPiacenza();
  d.chiuso_come = come;
  ricalcolaMeta(cantiere);
  cantiere.aggiornato = nowPiacenza();
  writeJson(CANTIERE, cantiere);
  bumpSalute(1, `Auto-fix: chiuso ${id} — ${come}`);
  console.log(`✅ Chiuso ${id}. Cantiere: ${cantiere.meta.aperti} aperti · ${cantiere.meta.chiusi} chiusi.`);
}

function cmdReport(cantiere) {
  ricalcolaMeta(cantiere);
  console.log(`\n🚧 CANTIERE DIFETTI — ${cantiere.aggiornato || nowPiacenza()}`);
  console.log(`   ${cantiere.meta.aperti} aperti · ${cantiere.meta.in_corso} in-corso · ${cantiere.meta.chiusi} chiusi\n`);
  for (const d of cantiere.difetti || []) {
    const ic = d.stato === "chiuso" ? "✅" : d.stato === "in-corso" ? "🔧" : "⏳";
    console.log(`${ic} ${d.id} [${d.impatto_crescita || "?"}] ${d.titolo}`);
    if (d.stato === "chiuso" && d.chiuso_come) console.log(`      chiuso ${d.chiuso_il}: ${d.chiuso_come}`);
  }
}

async function main() {
  const cmd = process.argv[2] || "report";
  const cantiere = readJson(CANTIERE, { aggiornato: nowPiacenza(), difetti: [], meta: {} });
  switch (cmd) {
    case "verifica":
      await cmdVerifica(cantiere);
      break;
    case "chiudi":
      cmdChiudi(cantiere);
      break;
    case "report":
      cmdReport(cantiere);
      break;
    default:
      console.error(`Comando sconosciuto: ${cmd}. Usa: verifica [--applica] | chiudi --id= | report`);
      process.exit(2);
  }
  await stampSegnale("auto-fix", "ok", `${cantiere.meta?.chiusi ?? 0} chiusi · ${cantiere.meta?.aperti ?? 0} aperti · ${nowPiacenza()}`);
}

main().catch(async (e) => {
  console.error("ERRORE auto-fix:", e.message || e);
  await stampSegnale("auto-fix", "errore", `crash: ${(e.message || e).toString().slice(0, 180)}`);
  process.exit(1);
});
