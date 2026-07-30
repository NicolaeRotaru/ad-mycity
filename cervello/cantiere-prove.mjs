#!/usr/bin/env node
// 🔎 GUARDIANO DELLE PROVE DEL CANTIERE — smaschera i difetti che NON possono chiudersi da soli.
// 🟢 Sola lettura (cantiere + codice); scrive solo il proprio report (auto-coscienza/cantiere-prove.json).
//
// Problema (trovato il 2026-07-25): il fix del freno budget-token è stato mergiato (PR #519,
// cervello/costo-ai.mjs) e PROVATO funzionante, ma il cantiere continuava a contarlo come bloccante
// aperto. La riconciliazione automatica (auto-fix.mjs verifica --applica) era girata pochi minuti dopo
// il merge e non se n'era accorta. Due cause distinte, entrambe invisibili:
//   ① AR-144 ha verifica {tipo:"umano"} → nessuna prova automatica: non è chiudibile da un guardiano,
//      MAI, qualunque fix arrivi. Resta aperto in eterno finché un umano non se ne ricorda.
//   ② AR-117 ha una prova automatica che punta al file SBAGLIATO (cerca token_stimati in giro.sh,
//      mentre il fix è atterrato in costo-ai.mjs) → il verificatore guarda nel posto sbagliato.
//
// Il guaio non è il singolo difetto: è che "pattern assente" e "puntatore rotto" sono INDISTINGUIBILI
// per auto-fix.mjs — entrambi si leggono come "fix non fatto". Così un lavoro davvero consegnato
// sparisce dai numeri, la macchina si dichiara peggio di com'è, e la pagella dell'intelligenza
// (che legge proprio il conteggio dei bloccanti) misura una realtà vecchia.
//
// Questo guardiano classifica la PROVA di ogni difetto non chiuso e fallisce quando un BLOCCANTE
// non è verificabile: un numero che nessuno può abbassare non è un difetto, è un debito silenzioso.
//
// Classi di prova:
//   auto-ok       → file+pattern combaciano ORA: auto-fix lo chiuderà al prossimo giro
//   auto-attesa   → file+pattern non combaciano ma il difetto è giovane: normale, il fix non c'è ancora
//   auto-sospetta → non combaciano e il difetto è vecchio (> GIORNI_SOSPETTO): il puntatore potrebbe
//                   essere sbagliato, o il fix è atterrato altrove (il caso AR-117)
//   umana         → nessuna prova automatica: non auto-chiudibile per costruzione (il caso AR-144)
//
// Uso:
//   node cervello/cantiere-prove.mjs            -> report + scrive cantiere-prove.json
//   node cervello/cantiere-prove.mjs --dry      -> report, NON scrive
//   node cervello/cantiere-prove.mjs --json     -> output JSON
//   node cervello/cantiere-prove.mjs --gate     -> exit 1 se un BLOCCANTE non è verificabile
//
// Env: CANTIERE_PROVE_GIORNI (default 3) = da quanti giorni una prova non soddisfatta diventa sospetta.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";
import { formaProva } from "./chiusura-dichiarata.mjs";
import { comandoAmmesso, MOTIVO_COMANDO_NON_AMMESSO } from "./forma-prova.mjs";
import { fileDelComando } from "./cancello-lotto.mjs";

// ⚠️ Un modulo che ESEGUE il suo CLI al solo essere importato non e' testabile: chi lo importa per
// provarne una funzione si ritrova il guardiano intero girato e un file di memoria riscritto sotto i
// piedi. Successo due volte in due giorni — sonda-volano.mjs (lotto 35) e questo — quindi non e' un
// inciampo, e' una forma. Da qui in giu' gli effetti stanno dietro questa guardia.
const E_CLI = import.meta.url === pathToFileURL(process.argv[1] || "").href;

const DRY = process.argv.includes("--dry");
const JSON_MODE = process.argv.includes("--json");
const GATE = process.argv.includes("--gate");
const GIORNI_SOSPETTO = Number(process.env.CANTIERE_PROVE_GIORNI || 3);

const AC = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
const CANTIERE_PATH = join(AC, "cantiere-difetti.json");
const OUT_PATH = join(AC, "cantiere-prove.json");

function readJson(path, fallback = null) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

/** Giorni interi trascorsi da una data "AAAA-MM-GG [HH:MM]". null se illeggibile. */
function giorniDa(s) {
  const m = typeof s === "string" ? s.match(/(\d{4})-(\d{2})-(\d{2})/) : null;
  if (!m) return null;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
  if (isNaN(d.getTime())) return null;
  const oggi = nowPiacenza().match(/(\d{4})-(\d{2})-(\d{2})/);
  const base = oggi ? new Date(`${oggi[1]}-${oggi[2]}-${oggi[3]}T00:00:00`) : new Date();
  return Math.max(0, Math.round((base - d) / 86400000));
}

/**
 * La stessa lettura che fa auto-fix.mjs, ma senza chiudere nulla: serve solo a sapere
 * se la prova COMBACIA oggi. presente:false = il difetto è risolto quando il pattern è ASSENTE.
 */
function provaCombacia(v) {
  const vuolePresente = v.presente !== false;
  const abs = join(AD_ROOT, v.file);
  if (!existsSync(abs)) {
    // File assente: se il fix consiste nel CREARE il file, "assente" significa fix non ancora fatto.
    // Non è un puntatore rotto — è un fix legittimamente in attesa (es. AR-112 middleware.ts).
    return { combacia: !vuolePresente, fileAssente: true };
  }
  let testo = "";
  try {
    testo = readFileSync(abs, "utf8");
  } catch {
    return { combacia: false, fileAssente: false, illeggibile: true };
  }
  let trovato = false;
  try {
    trovato = new RegExp(v.pattern).test(testo);
  } catch {
    return { combacia: false, fileAssente: false, patternRotto: true };
  }
  return { combacia: trovato === vuolePresente, fileAssente: false };
}

export function classifica(d) {
  const v = d.verifica;
  const eta = giorniDa(d.nato);
  const base = { id: d.id, gravita: d.gravita, eta_giorni: eta, titolo: (d.titolo || "").slice(0, 110) };

  // AR-344 — la forma di una prova la legge UN solo modulo (chiusura-dichiarata.mjs), non due lettori
  // indipendenti. Prima qui c'era `if (!v || !v.file || !v.pattern)`: tutto ciò che non fosse
  // file+pattern cadeva in «umana». Quando lo standard è passato a {comando}, chi CHIUDE ha imparato
  // la forma nuova e chi CLASSIFICA no — così ogni prova migrata alla forma MIGLIORE si contava come
  // «nessun guardiano potrà mai chiuderlo». Effetto perverso: più si riparava secondo lo standard,
  // più la macchina dichiarava di non potersi chiudere da sola. La cura non è insegnare la forma
  // anche al secondo lettore: è che il lettore sia uno solo.
  const forma = formaProva(v);
  if (forma === "comando") {
    if (!comandoAmmesso(v.comando)) {
      return {
        ...base,
        classe: "auto-sospetta",
        perche: `comando di prova non ammesso: ${v.comando} — ${MOTIVO_COMANDO_NON_AMMESSO}`,
        auto_chiudibile: false,
      };
    }
    // Un comando che punta a un file inesistente non è una prova: è «non fatto» travestito da
    // «puntatore rotto», e i due si distinguono solo guardando.
    const file = fileDelComando(v.comando);
    if (file && !existsSync(join(AD_ROOT, file))) {
      return {
        ...base,
        classe: "auto-sospetta",
        perche: `la prova punta a un file che non esiste: ${file}`,
        auto_chiudibile: false,
      };
    }
    return { ...base, classe: "auto-comando", perche: `prova eseguibile: ${v.comando}`, auto_chiudibile: true };
  }
  if (forma !== "pattern") {
    return {
      ...base,
      classe: "umana",
      perche: "nessuna prova automatica (verifica umana): nessun guardiano potrà mai chiuderlo",
      auto_chiudibile: false,
    };
  }

  const r = provaCombacia(v);
  const dove = `${v.file} ~ /${v.pattern}/`;

  if (r.patternRotto) {
    return { ...base, classe: "auto-sospetta", perche: `regex non valida in verifica: ${dove}`, auto_chiudibile: false };
  }
  if (r.illeggibile) {
    return { ...base, classe: "auto-sospetta", perche: `file illeggibile: ${v.file}`, auto_chiudibile: false };
  }
  if (r.combacia) {
    return { ...base, classe: "auto-ok", perche: `prova soddisfatta ora (${dove}): auto-fix lo chiuderà`, auto_chiudibile: true };
  }
  if (r.fileAssente) {
    return {
      ...base,
      classe: "auto-attesa",
      perche: `il fix consiste nel creare ${v.file}, non ancora presente`,
      auto_chiudibile: true,
    };
  }
  if (eta !== null && eta > GIORNI_SOSPETTO) {
    return {
      ...base,
      classe: "auto-sospetta",
      perche: `prova mai soddisfatta da ${eta} giorni (${dove}): il puntatore potrebbe indicare il file sbagliato, o il fix è atterrato altrove`,
      auto_chiudibile: false,
    };
  }
  return { ...base, classe: "auto-attesa", perche: `prova non ancora soddisfatta (${dove})`, auto_chiudibile: true };
}

// ─────────────────────────── esecuzione ───────────────────────────

const cantiere = readJson(CANTIERE_PATH);
if (!cantiere || !Array.isArray(cantiere.difetti)) {
  console.error("❌ cantiere-difetti.json illeggibile o senza difetti — niente da controllare.");
  process.exit(1);
}

const aperti = cantiere.difetti.filter((d) => d.stato !== "chiuso");
const voci = aperti.map(classifica);

const perClasse = voci.reduce((a, v) => ((a[v.classe] = (a[v.classe] || 0) + 1), a), {});
const bloccantiCiechi = voci.filter((v) => v.gravita === "bloccante" && !v.auto_chiudibile);
const nonChiudibili = voci.filter((v) => !v.auto_chiudibile);

const report = {
  _cosa_e:
    "🔎 GUARDIANO DELLE PROVE — classifica la prova di ogni difetto non chiuso del cantiere e smaschera quelli che nessun guardiano potrà mai chiudere (prova umana, o puntatore che indica il file sbagliato). Nasce dal caso AR-144/AR-117 del 2026-07-25: fix mergiato e provato, ma il cantiere continuava a contarlo aperto. Scritto da cervello/cantiere-prove.mjs.",
  // AR-287 — un verde va letto per quello che vale, non per quello che sembra.
  _cosa_NON_prova:
    "Non prova che le prove siano BUONE: classifica la loro FORMA (comando eseguibile / pattern nel codice / verifica umana) e se il puntatore esiste. Una prova comportamentale che passa anche col fix rotto — una prova vacua — qui risulta sana: quello lo scopre solo chi rompe il fix apposta e guarda se diventa rossa.",
  aggiornato: nowPiacenza(),
  giorni_sospetto: GIORNI_SOSPETTO,
  difetti_aperti: aperti.length,
  per_classe: perClasse,
  non_auto_chiudibili: nonChiudibili.length,
  bloccanti_ciechi: bloccantiCiechi.map((v) => v.id),
  voci,
};

if (!DRY && E_CLI) writeFileSync(OUT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (JSON_MODE) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`\n🔎 PROVE DEL CANTIERE — ${report.aggiornato}\n`);
  console.log(`   Difetti non chiusi: ${aperti.length}`);
  for (const [k, n] of Object.entries(perClasse).sort()) console.log(`   · ${k}: ${n}`);
  console.log("");
  const problemi = voci.filter((v) => !v.auto_chiudibile);
  if (problemi.length) {
    console.log(`   ⚠️  ${problemi.length} difetti che NESSUN guardiano può chiudere da solo:\n`);
    for (const v of problemi) {
      const bang = v.gravita === "bloccante" ? "🔴" : "· ";
      console.log(`   ${bang} ${v.id} [${v.gravita}] — ${v.classe}`);
      console.log(`      ${v.perche}`);
    }
    console.log("");
  }
  console.log(
    bloccantiCiechi.length
      ? `❌ ${bloccantiCiechi.length} BLOCCANTI non verificabili (${bloccantiCiechi.map((v) => v.id).join(", ")}): gonfiano il conteggio senza che nessuno possa abbassarlo.`
      : "✅ Ogni bloccante ha una prova che un guardiano può verificare.",
  );
  if (!DRY) console.log(`   report: ${OUT_PATH.replace(`${AD_ROOT}/`, "")}\n`);
}

if (E_CLI) await stampSegnale(
  "cantiere-prove",
  bloccantiCiechi.length ? "attenzione" : "ok",
  `${nonChiudibili.length}/${aperti.length} non auto-chiudibili · ${bloccantiCiechi.length} bloccanti ciechi`,
).catch(() => {});

if (E_CLI) {
  if (GATE && bloccantiCiechi.length) process.exit(1);
  process.exit(0);
}
