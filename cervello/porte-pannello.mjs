#!/usr/bin/env node
// 🚪 LE PORTE DEL PANNELLO — AR-207 · AR-112 · AR-234.
//
// Esiste già un guardiano delle porte (`porte-check.mjs`), e copre UNA superficie sola: i push da
// shell. Le route HTTP del Pannello — quelle che spengono la pausa, accendono l'autopilota, mandano
// ordini al worker e sparano azioni all'automazione — nascono fuori dal suo sguardo. È la malattia
// che guarda sé stessa: una difesa costruita dove è appena successo un problema, non su tutte le
// porte della stessa classe.
//
// Il fix di AR-207 lo dice esattamente, al punto (b): «aggiungere un controllo automatico che elenca
// tutte le rotte del Pannello che scrivono e fallisce se una non richiama il cancello: LA REGOLA
// VALE SULLA SUPERFICIE, NON SULLA SINGOLA PORTA». AR-112 chiede la stessa cosa con altre parole
// («uno script che elenchi le route POST senza check di autorizzazione e fallisca se ne trova»).
//
// COSA CONTROLLA, e cosa no.
// Il confine HTTP è il middleware (`pannello/src/middleware.ts`, matcher `/api/:path*`), e la
// decisione vive in `src/lib/serratura.ts` — provata a parte. Qui non si ricontrolla la decisione:
// si controlla la COPERTURA, cioè che non esista una route capace di mutare lo stato che stia fuori
// dal matcher o dentro un'esenzione muta. Sono due difetti diversi e servono due prove diverse: una
// serratura perfetta su una porta che nessuno ha censito non protegge niente.
//
// 🟢 Sola lettura. Uso: node cervello/porte-pannello.mjs [--json]
// Exit (AR-322): 0 = ogni porta che muta sta dentro il confine · 1 = porta scoperta · 2 = cieco

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..");

/** I metodi HTTP che cambiano lo stato. GET/HEAD/OPTIONS leggono e non hanno bisogno del confine. */
export const METODI_CHE_MUTANO = ["POST", "PUT", "PATCH", "DELETE"];

/** Gli handler che mutano, dichiarati in un file di route. Pura. */
export function handlerCheMutano(testo = "") {
  const trovati = [];
  for (const m of METODI_CHE_MUTANO) {
    const re = new RegExp(`export\\s+(?:async\\s+)?function\\s+${m}\\b|export\\s+const\\s+${m}\\s*[=:]`);
    if (re.test(testo)) trovati.push(m);
  }
  return trovati;
}

/**
 * Il percorso URL servito da un file di route Next (App Router).
 * `pannello/src/app/api/lavori/[id]/route.ts` → `/api/lavori/[id]`
 */
export function percorsoUrl(fileRelativoAdApp = "") {
  const senzaRoute = fileRelativoAdApp.replace(/\/route\.tsx?$/, "");
  const pezzi = senzaRoute.split("/").filter((p) => p && !/^\(.*\)$/.test(p)); // i gruppi (x) non entrano nell'URL
  return "/" + pezzi.join("/");
}

/**
 * Il matcher del middleware, letto dal file. Ritorna gli schemi grezzi (es. `/api/:path*`).
 * Se non si riesce a leggerlo NON si finge coperto: chi chiama tratta l'assenza come cecità.
 */
export function matcherDelMiddleware(testo = "") {
  const m = /matcher\s*:\s*\[([^\]]*)\]/.exec(testo);
  if (!m) return null;
  return m[1].split(",").map((s) => s.trim().replace(/^["'`]|["'`]$/g, "")).filter(Boolean);
}

/** Il percorso URL ricade sotto uno degli schemi del matcher? Pura. */
export function coperto(percorso, schemi = []) {
  return schemi.some((s) => {
    const base = s.replace(/\/:[^/]*\*?$/, ""); // `/api/:path*` → `/api`
    if (!base || base === "/") return true;
    return percorso === base || percorso.startsWith(base + "/");
  });
}

/**
 * Le porte che mutano lo stato e stanno FUORI dal confine, o dentro un'esenzione senza motivo.
 *
 * @param {{file:string, percorso:string, muta:string[]}[]} route
 * @param {string[]} schemi          il matcher del middleware
 * @param {{path:string, perche:string}[]} esenti  le esenzioni dichiarate nella serratura
 */
export function porteScoperte(route = [], schemi = [], esenti = []) {
  const fuori = [];
  for (const r of route) {
    if (!r.muta.length) continue;
    if (!coperto(r.percorso, schemi)) {
      fuori.push({ ...r, motivo: "fuori dal matcher del middleware: nessun controllo in ingresso" });
      continue;
    }
    const esenzione = esenti.find((e) => r.percorso === e.path || r.percorso.startsWith(e.path + "/"));
    if (esenzione && !String(esenzione.perche || "").trim()) {
      fuori.push({ ...r, motivo: `esente da ${esenzione.path} senza un perché scritto` });
    }
  }
  return fuori;
}

/** Legge le esenzioni dichiarate in serratura.ts, con il loro perché. */
export function esenzioniDichiarate(testo = "") {
  const blocco = /ESENTI[^=]*=\s*\[([\s\S]*?)\n\];/.exec(testo);
  if (!blocco) return [];
  const out = [];
  const re = /\{\s*path:\s*["'`]([^"'`]+)["'`]\s*,\s*perche:\s*["'`]([^"'`]*)["'`]/g;
  let m;
  while ((m = re.exec(blocco[1]))) out.push({ path: m[1], perche: m[2] });
  return out;
}

function elencaRoute(dirApp) {
  const out = [];
  const cammina = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) cammina(p);
      else if (/^route\.tsx?$/.test(e.name)) {
        const rel = relative(dirApp, p);
        out.push({ file: relative(REPO, p), percorso: percorsoUrl(rel), muta: handlerCheMutano(readFileSync(p, "utf8")) });
      }
    }
  };
  cammina(dirApp);
  return out.sort((a, b) => a.percorso.localeCompare(b.percorso));
}

function main() {
  const dirApp = process.env.PANNELLO_APP_DIR || join(REPO, "pannello/src/app");
  const fileMw = join(REPO, "pannello/src/middleware.ts");
  const fileSer = join(REPO, "pannello/src/lib/serratura.ts");
  const jsonMode = process.argv.includes("--json");

  for (const [p, che] of [[dirApp, "le route"], [fileMw, "il middleware"], [fileSer, "la serratura"]]) {
    if (!existsSync(p)) {
      console.error(`⚠️  GUARDIANO CIECO: manca ${che} (${relative(REPO, p)}).`);
      process.exit(2);
    }
  }

  const schemi = matcherDelMiddleware(readFileSync(fileMw, "utf8"));
  if (!schemi || !schemi.length) {
    // Cieco, non verde: senza il matcher non so cosa sia coperto, e dirlo verde sarebbe la bugia
    // peggiore di tutte — un confine che non c'è, dichiarato presente.
    console.error("⚠️  GUARDIANO CIECO: non riesco a leggere il matcher del middleware.");
    process.exit(2);
  }
  const esenti = esenzioniDichiarate(readFileSync(fileSer, "utf8"));
  const route = elencaRoute(dirApp);
  const mutanti = route.filter((r) => r.muta.length);
  const fuori = porteScoperte(route, schemi, esenti);
  const rc = fuori.length ? 1 : 0;

  if (jsonMode) {
    console.log(JSON.stringify({ ok: rc === 0, route: route.length, mutanti: mutanti.length, schemi, esenti, fuori }, null, 2));
    process.exit(rc);
  }

  console.log(`\n🚪 PORTE DEL PANNELLO — ${route.length} route, ${mutanti.length} mutano lo stato`);
  console.log(`   confine: middleware matcher ${schemi.join(", ")} · esenzioni dichiarate: ${esenti.length}\n`);
  if (!fuori.length) {
    console.log("✅ Ogni porta che muta lo stato sta dentro il confine, e ogni esenzione dice perché.\n");
    process.exit(0);
  }
  console.log(`🕳️  ${fuori.length} porta/e che mutano SENZA confine:\n`);
  for (const f of fuori) console.log(`   · ${f.percorso} [${f.muta.join(",")}] — ${f.motivo}\n     ${f.file}`);
  console.log("");
  process.exit(rc);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
