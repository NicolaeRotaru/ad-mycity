#!/usr/bin/env node
// 🧪 LE MUTAZIONI CHE NESSUNO PUÒ ESEGUIRE — il verde comprato di `non-vacuita.mjs`.
//
// ─────────────────────────────────────────────────────────────────────────────
// IL DIFETTO (AR-840)
// ─────────────────────────────────────────────────────────────────────────────
// `non-vacuita.mjs` rompe apposta un fix e pretende che la sua prova diventi rossa. È il guardiano
// che tiene in piedi tutti gli altri: senza, «difetto chiuso» vuol dire solo «qualcuno l'ha scritto».
//
// Lancia la prova così: `spawnSync("node", [m.test])`. Cioè `m.test` dev'essere un PERCORSO.
// Metà delle voci ci mettono una riga di comando — `"node cervello/test/x.test.mjs"` — e allora
// gira `node "node cervello/test/x.test.mjs"`, che non trova nessun file ed esce ≠ 0.
//
// **Un'uscita ≠ 0 è come `non-vacuita` riconosce «la prova è diventata rossa».** Quindi quelle voci
// risultano SEMPRE verificate, qualunque cosa faccia la mutazione — anche se il fix non è coperto
// da niente. Misurato il 26/8: 435 voci su 872.
//
// Non è una svista di forma: è il metro della copertura che si misura da solo e si dà buono. Le
// prove di questo lotto ne hanno beccate cinque, mie, che non mordevano affatto — e risultavano
// verificate.
//
// ─────────────────────────────────────────────────────────────────────────────
// IL VERSO DEL FRENO
// ─────────────────────────────────────────────────────────────────────────────
// Il debito ereditato si CONTA, quello nuovo si BLOCCA: stesso patto di `debito-prove-bash.mjs`.
// Il tetto scende e non risale. Chi aggiunge una mutazione con un `test` che nessuno può eseguire
// non sta aggiungendo copertura: sta aggiungendo un verde.
//
// Uscite (AR-322): 0 sotto il tetto · 1 cresciuto · 2 non ho potuto misurare.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";

const MUTANTI = join(AD_ROOT, "cervello/mutanti.json");
const TETTI = join(AD_ROOT, "cervello/tetti-lotto.json");
const JSON_MODE = process.argv.includes("--json");

/**
 * Un `test` è eseguibile così com'è?
 *
 * `esiste` è iniettato perché il giudizio si possa provare senza toccare il disco: la domanda vera
 * è «`spawnSync("node", [test])` troverebbe un file?», e la risposta dipende solo da quello.
 */
export function testEseguibile(test, esiste = () => false) {
  if (typeof test !== "string" || !test.trim()) {
    return { ok: false, perche: "nessun test dichiarato" };
  }
  const t = test.trim();
  // Uno spazio vuol dire che è una riga di comando, non un percorso: `node "node x.mjs"` non trova
  // niente ed esce ≠ 0, cioè esattamente il segnale che `non-vacuita` legge come «rossa».
  if (/\s/.test(t)) {
    return { ok: false, perche: `è una riga di comando, non un percorso: «${t}»` };
  }
  // Il percorso deve restare DENTRO il repo. Senza questo, un `test` come `../../qualcosa` verrebbe
  // unito alla radice e — se quel file esiste — conterebbe come eseguibile: il metro direbbe
  // «coperta» per una prova che non e' di questo repo. Non e' un buco di sicurezza (mutanti.json e'
  // contenuto del repo, non ingresso di qualcuno): e' il metro che si lascia ingannare, ed e'
  // esattamente il difetto che questo file esiste per togliere.
  //
  // La regola NON dice «solo cervello/test/»: l'ho provata cosi' ed era troppo stretta. Tre voci
  // vere puntano a un guardiano lanciabile (`spazzata-fratelli.mjs`, `prove-difetti.mjs`) o a una
  // prova del Pannello, e sono prove legittime. Il metro deve contare i percorsi che NON si possono
  // eseguire, non quelli che stanno fuori da una cartella che ho scelto io.
  if (t.includes("..") || t.startsWith("/")) {
    return { ok: false, perche: `esce dal repo: «${t}»` };
  }
  if (!esiste(t)) return { ok: false, perche: `il file non esiste: «${t}»` };
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
        `mutazioni non eseguibili salite da ${t} a ${quante}: una mutazione col test sbagliato non è copertura, ` +
        `è un verde comprato. Il campo «test» vuole un PERCORSO (cervello/test/x.test.mjs), non una riga di comando.`,
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
