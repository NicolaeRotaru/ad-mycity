#!/usr/bin/env node
// 🧪 LE MUTAZIONI CHE NESSUNO PUÒ ESEGUIRE — il verde comprato di `non-vacuita.mjs`.
//
// ─────────────────────────────────────────────────────────────────────────────
// IL DIFETTO (AR-840)
// ─────────────────────────────────────────────────────────────────────────────
// `non-vacuita.mjs` rompe apposta un fix e pretende che la sua prova diventi rossa. È il guardiano
// che tiene in piedi tutti gli altri: senza, «difetto chiuso» vuol dire solo «qualcuno l'ha scritto».
//
// Lanciava la prova così: `spawnSync("node", [m.test])`. Cioè dava per scontato che `m.test` fosse
// sempre un percorso .mjs. Dove c'era una riga di comando — `"node cervello/permessi-check.mjs"` —
// girava `node "node cervello/permessi-check.mjs"`: nessun file, MODULE_NOT_FOUND, uscita 1. Dove
// c'era un `.bats`, girava `node <script bash>`: SyntaxError, uscita 1.
//
// **Un'uscita ≠ 0 è come `non-vacuita` riconosce «la prova è diventata rossa».** Quindi quelle voci
// risultavano SEMPRE verificate, qualunque cosa facesse la mutazione — anche se il fix non era
// coperto da niente. Non era una svista di forma: era il metro della copertura che si dava buono
// da solo.
//
// LA CURA (28/8) sta a monte, in `esecuzione-prova.mjs`: la decisione di COME si esegue un `test`
// è diventata una funzione pura che sa leggere anche una riga di comando e sa lanciare un `.bats`
// col programma giusto. `non-vacuita.mjs` la usa per eseguire; questo file la usa per contare. Un
// metro solo per le due domande, altrimenti il debito misurato non è quello che il banco patisce.
//
// ─────────────────────────────────────────────────────────────────────────────
// IL VERSO DEL FRENO
// ─────────────────────────────────────────────────────────────────────────────
// Il debito ereditato si CONTA, quello nuovo si BLOCCA: stesso patto di `debito-prove-bash.mjs`.
// Il tetto scende e non risale. Chi aggiunge una mutazione con un `test` che il banco non sa
// lanciare — un programma fuori dalla lista bianca, una riga che vuole una shell, un file che non
// c'è — non sta aggiungendo copertura: sta aggiungendo un verde.
//
// Uscite (AR-322): 0 sotto il tetto · 1 cresciuto · 2 non ho potuto misurare.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";
import { comeSiEsegue } from "./esecuzione-prova.mjs";

const MUTANTI = join(AD_ROOT, "cervello/mutanti.json");
const TETTI = join(AD_ROOT, "cervello/tetti-lotto.json");
const JSON_MODE = process.argv.includes("--json");

/**
 * Un `test` è eseguibile così com'è?
 *
 * ⚠️ IL METRO È UNO SOLO (AR-840). La domanda vera non è «assomiglia a un percorso?»: è **«il banco
 * delle mutazioni riuscirebbe davvero a lanciarlo?»**. Quella decisione vive in
 * `esecuzione-prova.mjs` ed è la STESSA che `non-vacuita.mjs` usa per lanciare. Qui si aggiunge solo
 * ciò che la funzione pura non può sapere: i file esistono su questo disco?
 *
 * Finché le due regole erano separate — qui «uno spazio = non eseguibile», là `spawnSync("node",
 * [test])` — il contatore misurava un debito diverso da quello che il banco pativa. Due elenchi e
 * due metri: è il modo più sicuro di avere un numero che non descrive niente.
 *
 * `esiste` è iniettato perché il giudizio si possa provare senza toccare il disco.
 */
export function testEseguibile(test, esiste = () => false) {
  if (typeof test !== "string" || !test.trim()) {
    return { ok: false, perche: "nessun test dichiarato" };
  }
  const piano = comeSiEsegue(test);
  if (!piano.ok) return { ok: false, perche: piano.perche };
  const mancante = piano.percorsi.find((p) => !esiste(p));
  if (mancante) return { ok: false, perche: `il file non esiste: «${mancante}»` };
  return { ok: true, perche: "" };
}

/** Le voci il cui test nessuno può eseguire, col perché di ognuna. */
export function mutazioniCieche(mutanti = [], esiste = () => false) {
  const fuori = [];
  for (const m of Array.isArray(mutanti) ? mutanti : []) {
    const v = testEseguibile(m?.test, esiste);
    if (!v.ok) fuori.push({ difetto: m?.difetto ?? "", nome: m?.nome ?? "", test: m?.test ?? "", perche: v.perche });
  }
  return fuori;
}

/** Il verdetto col tetto. Ereditato si conta, nuovo si blocca. */
export function verdettoMutazioniCieche({ quante = 0, totale = 0, tetto = null } = {}) {
  if (tetto === null || tetto === undefined || !Number.isFinite(Number(tetto))) {
    return { esito: "cieco", motivo: `${quante} mutazioni su ${totale} non si possono eseguire (nessun tetto fissato)` };
  }
  const t = Number(tetto);
  if (quante > t) {
    return {
      esito: "violazione",
      motivo:
        `mutazioni non eseguibili salite da ${t} a ${quante}: una mutazione che il banco non sa lanciare non è ` +
        `copertura, è un verde comprato. Il campo «test» vuole qualcosa che «comeSiEsegue» sappia avviare: un ` +
        `PERCORSO dentro il repo (cervello/test/x.test.mjs, x.bats) o una riga di node/npx senza shell.`,
    };
  }
  if (quante < t) {
    return { esito: "debito", motivo: `mutazioni non eseguibili scese da ${t} a ${quante}: abbassa il tetto in cervello/tetti-lotto.json` };
  }
  return { esito: "debito", motivo: `${quante} mutazioni su ${totale} risultano verificate senza esserlo (tetto ${t}) — AR-840` };
}

function main() {
  const ciechi = [];
  let mutanti = [];
  try {
    mutanti = JSON.parse(readFileSync(MUTANTI, "utf8")).mutanti || [];
  } catch (e) {
    console.log(`⚪ mutanti.json illeggibile: non ho potuto misurare niente (${e.message})`);
    process.exit(2);
  }
  let tetto = null;
  try {
    const t = JSON.parse(readFileSync(TETTI, "utf8"));
    tetto = Object.hasOwn(t, "mutazioni_senza_esecutore") ? Number(t.mutazioni_senza_esecutore) : null;
  } catch {
    ciechi.push("tetti-lotto.json illeggibile: il numero c'è, il confronto col tetto no");
  }

  const fuori = mutazioniCieche(mutanti, (p) => existsSync(join(AD_ROOT, p)));
  const v = verdettoMutazioniCieche({ quante: fuori.length, totale: mutanti.length, tetto });

  if (JSON_MODE) {
    console.log(JSON.stringify({ ok: v.esito !== "violazione", esito: v.esito, motivo: v.motivo, quante: fuori.length, totale: mutanti.length, tetto, ciechi, fuori: fuori.slice(0, 40) }, null, 2));
  } else {
    console.log("🧪 LE MUTAZIONI CHE NESSUNO PUÒ ESEGUIRE\n");
    for (const c of ciechi) console.log(`  ⚪ ${c}`);
    console.log(`  · mutazioni dichiarate: ${mutanti.length}`);
    console.log(`  · con un test che nessuno può eseguire: ${fuori.length}`);
    for (const f of fuori.slice(0, 5)) console.log(`     · ${f.difetto} — ${f.perche}`);
    if (fuori.length > 5) console.log(`     · …e altre ${fuori.length - 5}`);
    console.log(`\n${v.esito === "violazione" ? "⛔" : v.esito === "debito" ? "⚠️ " : "⚪"} ${v.motivo}`);
  }
  process.exit(v.esito === "violazione" ? 1 : v.esito === "cieco" ? 2 : 0);
}

if (process.argv[1] && process.argv[1].endsWith("mutazioni-senza-esecutore.mjs")) main();
