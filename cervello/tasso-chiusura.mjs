#!/usr/bin/env node
// 📉 TASSO DI CHIUSURA — il voto della macchina su sé stessa: quanti difetti chiudo, diviso quanti ne apro.
//
// PERCHÉ ESISTE. Nicola, 10/8: «so già che dopo questo upgrade ti chiederò di rianalizzare e
// troverai un sacco di errori». Ha ragione, e la ragione è un numero, non la bravura di chi cerca:
//
//     luglio 2026   455 nati · 244 chiusi → 0,54
//     agosto 2026    90 nati ·  14 chiusi → 0,16   (nei primi dieci giorni)
//
// La macchina trova i problemi circa tre volte più in fretta di quanto li ripara, e il divario si
// allarga. Finché è così, OGNI radiografia allunga la lista invece di accorciarla — e il lavoro
// sembra peggiorare proprio mentre se ne fa di più. La dimensione con più difetti aperti è
// «guardiani-e-guardrail»: i controlli sono la prima fonte di lavoro dei controlli.
//
// LA REGOLA (card #quanto-chiudo-e-il-mio-voto, approvata da Nicola il 10/8: «ok tasso di chiusura»):
// il tasso è UN numero solo — chiusi ÷ nati nel mese in corso — e l'obiettivo è almeno 1. Sotto 1
// il giro NON apre ricerche nuove: spende il turno a chiudere quello che ha già trovato.
//
// PERCHÉ UN NUMERO SOLO, e perché il mese di calendario. La macchina aveva già due voti di salute
// che si contraddicevano (AR-175): aggiungerne un terzo con una finestra sua sarebbe la stessa
// malattia. Il mese è quello che Nicola ha chiesto, quindi è quello che si misura.
//
// COSA SUCCEDE A INIZIO MESE. Con pochi difetti nati il rapporto è rumore: 1 nato e 0 chiusi darebbe
// 0,00 e fermerebbe la ricerca il primo giorno. Sotto `MINIMO_CAMPIONE` il verdetto è ⚪ — non verde
// e non rosso — e il freno non scatta. Cieco non è verde, ma non è nemmeno rosso.
//
// 🟢 Sola lettura sul cantiere; scrive il suo referto in auto-coscienza/tasso-chiusura.json.
//
// Uso:
//   node cervello/tasso-chiusura.mjs           → il referto a voce (exit 0 sempre)
//   node cervello/tasso-chiusura.mjs --gate    → exit 1 se sotto obiettivo (è il freno del giro)
//   node cervello/tasso-chiusura.mjs --json    → il referto in JSON

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { scriviJsonAtomico } from "./scrivi-json.mjs";

const GATE = process.argv.includes("--gate");
const JSON_MODE = process.argv.includes("--json");

const CANTIERE = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
const REFERTO = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/tasso-chiusura.json");

/** L'obiettivo: chiudere almeno quanto si apre. */
export const OBIETTIVO = 1;
/** Sotto questi difetti nati nel mese il rapporto è rumore, non una misura. */
export const MINIMO_CAMPIONE = 5;

/** Il mese `AAAA-MM` di una data del cantiere («2026-08-10 23:20» o «2026-08-10»). */
export function meseDi(data) {
  const m = String(data ?? "").match(/^(\d{4})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}` : null;
}

/**
 * Il conto del mese, come funzione pura: è la regola che decide se il giro si ferma, e va potuta
 * eseguire in un test senza toccare il disco.
 *
 * `nati` conta le schede nate nel mese. `chiusi` conta le chiusure AVVENUTE nel mese, comprese
 * quelle di difetti nati prima — è il punto: chiudere l'arretrato è esattamente il lavoro che
 * questo numero deve premiare. Un difetto nato e chiuso nello stesso mese conta da entrambe le parti.
 */
export function contaMese(difetti = [], mese) {
  let nati = 0;
  let chiusi = 0;
  for (const d of difetti) {
    if (!d) continue;
    if (meseDi(d.nato) === mese) nati++;
    if (d.stato === "chiuso" && meseDi(d.chiuso_il) === mese) chiusi++;
  }
  return { nati, chiusi };
}

/**
 * Il verdetto. Tre esiti, mai due:
 *   · `ok`      → si chiude almeno quanto si apre: il giro può cercare
 *   · `sotto`   → si apre più di quanto si chiude: il giro chiude e non cerca
 *   · `piccolo` → campione troppo magro per dire qualcosa (⚪): il freno non scatta
 */
export function verdetto({ nati, chiusi }) {
  if (nati < MINIMO_CAMPIONE) {
    return { esito: "piccolo", tasso: null, detto: `solo ${nati} difetti nati questo mese: sotto ${MINIMO_CAMPIONE} il rapporto è rumore, non una misura` };
  }
  const tasso = +(chiusi / nati).toFixed(2);
  if (tasso >= OBIETTIVO) {
    return { esito: "ok", tasso, detto: `chiudo ${chiusi} e ne apro ${nati}: sto pari o meglio (${tasso})` };
  }
  return { esito: "sotto", tasso, detto: `chiudo ${chiusi} e ne apro ${nati}: ne apro più di quanti ne chiudo (${tasso}, obiettivo ${OBIETTIVO})` };
}

/** Lo storico per mese, dal più vecchio: serve a vedere se il divario si allarga o si chiude. */
export function perMese(difetti = []) {
  const mesi = new Map();
  const tocca = (m) => {
    if (!m) return null;
    if (!mesi.has(m)) mesi.set(m, { mese: m, nati: 0, chiusi: 0 });
    return mesi.get(m);
  };
  for (const d of difetti) {
    if (!d) continue;
    const n = tocca(meseDi(d.nato));
    if (n) n.nati++;
    if (d.stato === "chiuso") {
      const c = tocca(meseDi(d.chiuso_il));
      if (c) c.chiusi++;
    }
  }
  return [...mesi.values()]
    .sort((a, b) => a.mese.localeCompare(b.mese))
    .map((x) => ({ ...x, tasso: x.nati ? +(x.chiusi / x.nati).toFixed(2) : null }));
}

function main() {
  const quando = nowPiacenza();
  const mese = quando.slice(0, 7);

  if (!existsSync(CANTIERE)) {
    // Cieco non è verde e non è rosso: esco 2, e il giro sa che questo controllo non ha misurato.
    const msg = "cantiere-difetti.json assente: non ho potuto contare né i nati né i chiusi";
    if (JSON_MODE) console.log(JSON.stringify({ ok: false, cieco: true, motivo: msg }));
    else console.error(`⚪ TASSO DI CHIUSURA — ${msg}`);
    process.exit(2);
  }
  let difetti;
  try {
    difetti = JSON.parse(readFileSync(CANTIERE, "utf8")).difetti || [];
  } catch (e) {
    const msg = `cantiere illeggibile (${e.message}): non ho potuto contare`;
    if (JSON_MODE) console.log(JSON.stringify({ ok: false, cieco: true, motivo: msg }));
    else console.error(`⚪ TASSO DI CHIUSURA — ${msg}`);
    process.exit(2);
  }

  const conto = contaMese(difetti, mese);
  const v = verdetto(conto);
  const storico = perMese(difetti);
  const referto = { _cosa_e: "Quanti difetti la macchina chiude, diviso quanti ne apre. Obiettivo: almeno 1. Sotto 1 il giro chiude invece di cercare.", misurato: quando, mese, ...conto, tasso: v.tasso, esito: v.esito, detto: v.detto, obiettivo: OBIETTIVO, minimo_campione: MINIMO_CAMPIONE, per_mese: storico };
  scriviJsonAtomico(REFERTO, referto);

  if (JSON_MODE) {
    console.log(JSON.stringify(referto, null, 1));
  } else {
    const faccia = { ok: "✅", sotto: "❌", piccolo: "⚪" }[v.esito];
    console.log(`\n📉 TASSO DI CHIUSURA — ${quando}\n`);
    console.log(`   Mese ${mese}: ${conto.nati} difetti aperti · ${conto.chiusi} chiusi${v.tasso == null ? "" : ` → ${v.tasso}`}`);
    console.log(`   ${faccia} ${v.detto}\n`);
    if (storico.length > 1) {
      console.log("   Come va nel tempo (aperti → chiusi → rapporto):");
      for (const m of storico.slice(-6)) console.log(`     ${m.mese}   ${String(m.nati).padStart(4)} → ${String(m.chiusi).padStart(4)}   ${m.tasso == null ? "—" : m.tasso}`);
      console.log("");
    }
    if (v.esito === "sotto") {
      console.log("   → Questo giro NON apre ricerche nuove: chiude quello che ha già trovato.");
      console.log("     Ogni radiografia in più, adesso, allunga la lista invece di accorciarla.\n");
    }
  }
  // `--gate`: solo `sotto` ferma la ricerca. `piccolo` no — un campione magro non è una bocciatura.
  process.exit(GATE && v.esito === "sotto" ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
