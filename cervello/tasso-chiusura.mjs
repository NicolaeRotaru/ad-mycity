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
 * La data di chiusura di una scheda, qualunque nome porti (AR-575).
 * Il campo giusto è `chiuso_il`; 5 schede d'archivio la portavano nel campo sbagliato `chiuso`.
 * Il conto non deve perdere una chiusura per un nome di campo: legge entrambi, preferendo il giusto.
 */
export function dataChiusura(d) {
  return d?.chiuso_il || d?.chiuso || null;
}

/**
 * Le chiusure SENZA data (AR-575): schede con stato "chiuso" ma nessuna data di chiusura.
 * Non appartengono a nessun mese, quindi il voto mensile non le vede — 74 il 13/8, e il freno
 * anti-ricerche ha strozzato la macchina su un contatore rotto. Un conteggio che le ignora in
 * silenzio è una bugia: questa funzione le fa diventare un numero dichiarato.
 */
export function chiusiSenzaData(difetti = []) {
  return difetti.filter((d) => d && d.stato === "chiuso" && !dataChiusura(d)).map((d) => d.id || "(senza id)");
}

/** Gli id usati più di una volta in un registro (cantiere o lezioni): ogni doppione falsa i conteggi. */
export function idDoppi(voci = []) {
  const visti = new Map();
  for (const v of voci) {
    if (!v || !v.id) continue;
    visti.set(v.id, (visti.get(v.id) || 0) + 1);
  }
  return [...visti.entries()].filter(([, n]) => n > 1).map(([id]) => id);
}

/**
 * Il verdetto del `--gate`, come funzione pura (AR-575): il freno scatta se il tasso è sotto
 * obiettivo, MA ANCHE se i registri su cui il tasso è calcolato sono bucati — un voto contato su
 * libri con buchi (chiusure senza data, id doppi) non è un voto: è il numero che ad agosto diceva
 * 0,23 mentre la verità era ~0,92.
 */
export function gateBocciato(esito, registriBucati = {}) {
  const buchi = Object.values(registriBucati).some((v) => Array.isArray(v) && v.length > 0);
  return esito === "sotto" || buchi;
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
    if (d.stato === "chiuso" && meseDi(dataChiusura(d)) === mese) chiusi++;
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
      const c = tocca(meseDi(dataChiusura(d)));
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

  // AR-575 — i buchi nei registri con cui questo voto è calcolato, dichiarati invece che ingoiati:
  // chiusure senza data (invisibili a ogni mese) e id doppi (contati due volte). Le lezioni entrano
  // nello stesso controllo (AR-580): il guardiano d'unicità copriva solo il cantiere, e i doppioni
  // nell'archivio da cui la macchina impara si accumulavano senza che nessuno li vedesse.
  // ⚠️ Il punto di scrittura delle lezioni è fuori da ogni script (gli id L-… si coniano a mano in
  // sessione): finché è così, questo è il guardiano di lettura che se ne accorge.
  const APPRENDIMENTO = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");
  let lezioni = [];
  try {
    if (existsSync(APPRENDIMENTO)) lezioni = JSON.parse(readFileSync(APPRENDIMENTO, "utf8")).lezioni || [];
  } catch { /* apprendimento illeggibile: i suoi buchi non si possono misurare qui, il cantiere sì */ }
  const registriBucati = {
    chiusi_senza_data: chiusiSenzaData(difetti),
    id_doppi_cantiere: idDoppi(difetti),
    id_doppi_lezioni: idDoppi(lezioni),
  };
  const nBuchi = Object.values(registriBucati).reduce((a, x) => a + x.length, 0);

  const referto = { _cosa_e: "Quanti difetti la macchina chiude, diviso quanti ne apre. Obiettivo: almeno 1. Sotto 1 il giro chiude invece di cercare.", misurato: quando, mese, ...conto, tasso: v.tasso, esito: v.esito, detto: v.detto, obiettivo: OBIETTIVO, minimo_campione: MINIMO_CAMPIONE, registri_bucati: registriBucati, per_mese: storico };
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
  if (nBuchi > 0 && !JSON_MODE) {
    console.log(`   ⚠️  REGISTRI BUCATI (${nBuchi}): questo voto è contato su libri con buchi.`);
    if (registriBucati.chiusi_senza_data.length) console.log(`      · ${registriBucati.chiusi_senza_data.length} chiusure senza data (non appartengono a nessun mese): ${registriBucati.chiusi_senza_data.slice(0, 8).join(", ")}${registriBucati.chiusi_senza_data.length > 8 ? ", …" : ""}`);
    if (registriBucati.id_doppi_cantiere.length) console.log(`      · id doppi nel cantiere: ${registriBucati.id_doppi_cantiere.join(", ")}`);
    if (registriBucati.id_doppi_lezioni.length) console.log(`      · id doppi nelle lezioni: ${registriBucati.id_doppi_lezioni.join(", ")}`);
    console.log("      Ripara i dati (backfill/dedup) prima di fidarti del tasso.\n");
  }
  // `--gate`: `sotto` ferma la ricerca, e la fermano anche i registri bucati — un voto contato su
  // libri con buchi non decide niente (AR-575: 0,23 dichiarato, ~0,92 vero). `piccolo` no — un
  // campione magro non è una bocciatura.
  process.exit(GATE && gateBocciato(v.esito, registriBucati) ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
