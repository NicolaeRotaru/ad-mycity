#!/usr/bin/env node
// 🖥️ LE PROVE CHE GUIDANO UNA SUPERFICIE VIVA, E NESSUNO HA MAI ROTTO. 🟢 Sola lettura.
//
// IL DIFETTO CHE CHIUDE (AR-706). Una prova guidava il Pannello vero per dire se il tema scuro era
// rispettato, e misurava il bordo della «prima card». Ma quel bordo usa una variabile che **si
// ribalta da sola col tema**: la misura cambiava fra chiaro e scuro anche con la cura TOLTA. La
// prova stava misurando il TEMA, non il fix, e sarebbe rimasta verde col fix disfatto. È stata
// scoperta solo perché la mutazione è stata applicata davvero.
//
// È la sorella a runtime di AR-698 (la prova che osserva dal canale sbagliato), e dicono la stessa
// cosa: **una prova che non è stata rotta apposta non è ancora una prova.** Su una superficie viva
// vale il doppio, perché lì la misura può cambiare da sola — le variabili di stile si ribaltano col
// tema, un layout si ridispone, un'animazione sposta un pixel — e chi legge non ha modo di
// distinguere «è cambiato perché ho tolto il fix» da «è cambiato comunque».
//
// COSA MISURA QUESTO GUARDIANO. Non la qualità della prova (nessuno sa scriverla in una regola):
// misura **quali prove guidano un browser vero senza che nessuno le abbia mai rotte apposta**. È il
// numero che mancava. Le prove a runtime coperte da una mutazione sono state per forza guardate col
// fix disfatto: è il gesto che ha trovato AR-706 e AR-698.
//
// Tetto in `cervello/tetti-lotto.json` → `prove_runtime_senza_mutazione`. Scende e non risale: una
// prova a runtime NUOVA senza mutazione è una violazione, anche a tetto largo.
//
// Uso:
//   node cervello/prove-runtime-senza-mutazione.mjs
//   node cervello/prove-runtime-senza-mutazione.mjs --json
//
// Uscita (contratto guardiani, AR-322):
//   0 = nessuna prova a runtime scoperta oltre il tetto
//   1 = il debito si è allargato: una prova che guida una superficie viva non è mai stata rotta
//   2 = non ho potuto misurare (cartella o mutanti.json assenti/illeggibili)

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";
import { fileDelComando } from "./cancello-lotto.mjs";

const JSON_MODE = process.argv.includes("--json");
const CARTELLA = process.env.PROVE_RUNTIME_DIR || join(AD_ROOT, "cervello/test");
const MUTANTI = process.env.MUTANTI_FILE || join(AD_ROOT, "cervello/mutanti.json");
const TETTI = process.env.TETTI_FILE || join(AD_ROOT, "cervello/tetti-lotto.json");

/**
 * Questa prova GUIDA una superficie viva?
 *
 * Il confine è stretto apposta, e non è «cita un indirizzo»: decine di prove sane accendono un
 * finto server (`listen(0, "127.0.0.1")`) e gli parlano — quello è un finto che si controlla, e
 * misurarlo non può ribaltarsi da solo. Il caso di AR-706 è un altro: un BROWSER vero, che apre una
 * pagina vera e la misura com'è. Lì la misura ha una vita propria.
 *
 * Pura: la prova la esercita su sorgenti finti, e sui file veri di questa casa.
 */
export function guidaUnaSuperficieViva(sorgente = "") {
  const t = String(sorgente);
  // L'unica esenzione, e non è un nome in un elenco: una prova che IMPORTA questo modulo è una prova
  // SUL rilevatore, e per esercitarlo deve per forza contenere i pezzi di codice che il rilevatore
  // cerca. Accusarla vorrebbe dire che il guardiano si trova addosso il proprio bersaglio ogni volta
  // — un rosso che nessuna riparazione può togliere, cioè quello che si impara a ignorare. Il fatto
  // che la esenta è un IMPORT, che sta nel codice e si vede, non una riga in una lista.
  if (/from\s+["'][^"']*prove-runtime-senza-mutazione\.mjs["']/.test(t)) return { runtime: false, come: "" };
  // Non basta NOMINARE playwright: bisogna guidarci qualcosa. `chromium.launch(` e `newPage(` sono
  // il gesto — aprire un browser e una pagina vera — ed è lì che la misura comincia ad avere una
  // vita propria (una variabile di stile che si ribalta col tema, un layout che si ridispone).
  if (/\b(chromium|firefox|webkit)\.launch\s*\(/.test(t)) return { runtime: true, come: "apre un browser vero (chromium/firefox/webkit)" };
  if (/\.newPage\s*\(/.test(t)) return { runtime: true, come: "guida una pagina vera (newPage)" };
  return { runtime: false, come: "" };
}

/** Il file di prova che una mutazione dichiara di rompere, senza il rumore del comando. */
export function provaDellaMutazione(m) {
  const f = fileDelComando(m?.test) || String(m?.test || "");
  return f ? basename(f) : null;
}

/**
 * Le prove a runtime che nessuna mutazione rompe.
 *
 * @param proveRuntime [{file, come}]  quelle che guidano una superficie viva
 * @param mutanti      l'elenco di mutanti.json
 */
export function runtimeSenzaMutazione(proveRuntime = [], mutanti = []) {
  const coperte = new Set(mutanti.map(provaDellaMutazione).filter(Boolean));
  return proveRuntime.filter((p) => !coperte.has(basename(p.file)));
}

/**
 * Il verdetto col tetto — la stessa grammatica del cancello: il debito ereditato si CONTA, la
 * regressione si BLOCCA. Pura, così il caso «il debito si allarga» si prova senza aggiungere una
 * prova a runtime vera al repo.
 */
export function verdettoTetto(quante, tetto) {
  if (tetto === null || tetto === undefined) return { esito: "debito", motivo: `${quante} prove a runtime senza mutazione (nessun tetto ancora fissato)` };
  if (quante > tetto) {
    return {
      esito: "violazione",
      motivo: `prove a runtime senza mutazione salite da ${tetto} a ${quante}: una prova che guida una superficie viva e che nessuno ha mai rotto apposta non è ancora una prova (AR-706)`,
    };
  }
  if (quante < tetto) return { esito: "debito", motivo: `prove a runtime senza mutazione scese da ${tetto} a ${quante}: abbassa il tetto in cervello/tetti-lotto.json` };
  return { esito: "ok", motivo: quante ? `${quante} prove a runtime senza mutazione, sotto il tetto: debito dichiarato, non allargato` : "ogni prova a runtime è stata rotta apposta almeno una volta" };
}

function main() {
  if (!existsSync(CARTELLA)) {
    console.error(`prove-runtime-senza-mutazione: ${CARTELLA} assente → non posso misurare`);
    process.exit(2);
  }
  let mutanti;
  try {
    mutanti = JSON.parse(readFileSync(MUTANTI, "utf8")).mutanti || [];
  } catch (e) {
    console.error(`prove-runtime-senza-mutazione: mutanti.json illeggibile (${e.message}) → non posso misurare`);
    process.exit(2);
  }

  const runtime = [];
  const ciechi = [];
  for (const f of readdirSync(CARTELLA).sort()) {
    if (!f.endsWith(".test.mjs") || f.startsWith("_")) continue;
    let src;
    try {
      src = readFileSync(join(CARTELLA, f), "utf8");
    } catch (e) {
      ciechi.push(`${f}: non ho potuto leggerlo (${e.message}) → non so se guida una superficie viva`);
      continue;
    }
    const g = guidaUnaSuperficieViva(src);
    if (g.runtime) runtime.push({ file: `cervello/test/${f}`, come: g.come });
  }

  const scoperte = runtimeSenzaMutazione(runtime, mutanti);
  let tetto = null;
  try {
    const t = JSON.parse(readFileSync(TETTI, "utf8"));
    tetto = Object.hasOwn(t, "prove_runtime_senza_mutazione") ? Number(t.prove_runtime_senza_mutazione) : null;
  } catch {
    ciechi.push("tetti-lotto.json illeggibile: il numero c'è, il confronto col tetto no");
  }
  const v = verdettoTetto(scoperte.length, tetto);

  if (JSON_MODE) {
    console.log(JSON.stringify({ ok: v.esito !== "violazione", esito: v.esito, motivo: v.motivo, tetto, runtime, scoperte, ciechi }, null, 2));
  } else {
    console.log("🖥️  PROVE CHE GUIDANO UNA SUPERFICIE VIVA\n");
    for (const c of ciechi) console.log(`  ⚪ ${c}`);
    for (const p of runtime) {
      const scoperta = scoperte.some((s) => s.file === p.file);
      console.log(`  ${scoperta ? "❌" : "✅"} ${p.file} — ${p.come}`);
      if (scoperta) console.log("     · nessuna mutazione la rompe: nessuno l'ha mai vista diventare rossa col fix disfatto");
    }
    if (!runtime.length) console.log("  ℹ️  nessuna prova guida una superficie viva in questa cartella.");
    console.log(`\n${v.esito === "violazione" ? "⛔" : v.esito === "debito" ? "⚠️ " : "✅"} ${v.motivo}`);
  }

  process.exit(v.esito === "violazione" ? 1 : 0);
}

if (process.argv[1] && process.argv[1].endsWith("prove-runtime-senza-mutazione.mjs")) main();
