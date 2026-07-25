#!/usr/bin/env node
// 🧪 GUARDIANO DEI TEST DEL PANNELLO (AR-156). 🟢 Sola lettura: esegue test, non tocca niente.
//
// Il difetto: `pannello/src/lib/*.test.mts` esisteva da settimane e NESSUNO li lanciava — nessuno
// script, nessuna CI, nessun giro. Un test che non gira non è una rete, è un file. Sotto ci si è
// nascosto un secondo difetto: `lavori-gruppo.annulla.test.mts` non partiva affatto, perché
// `lavori-gruppo.ts` importa `./chat-thread-merge` senza estensione (il bundler la indovina, Node
// ESM no) — e sbloccandolo saltarono fuori 2 asserzioni rosse, che erano un test rimasto indietro
// rispetto a una correzione di Nicola. Entrambe le cose sistemate il 25/7.
//
// Questo è il guardiano che dice la verità su tutti quanti. Li SCOPRE dalla cartella invece di
// tenerne un elenco: un elenco si dimentica di aggiornare, e un test nuovo resterebbe fuori senza
// che nessuno se ne accorga — che è esattamente il male che stiamo curando.
//
// Perché un guardiano e non un elenco in round3-verifica: la prova di AR-156 nel cantiere si
// chiude DA SOLA quando tutti i test girano e passano. Una prova a pattern su un file dipenderebbe
// da come qualcuno formatta una riga (è la trappola di AR-037: un pattern che non può mai
// scattare). Qui la condizione è quella vera: girano tutti e passano tutti.
//
// Uso:
//   node cervello/test-pannello.mjs           -> report
//   node cervello/test-pannello.mjs --json    -> JSON
// Exit: 0 = tutti i test del Pannello girano e passano · 1 = almeno uno rotto o ineseguibile

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const CARTELLA = "pannello/src/lib";

/** Trova i test del Pannello. Pura sulla lettura della cartella: il test la prova con una finta. */
export function trovaTest(elenco = []) {
  return elenco.filter((f) => f.endsWith(".test.mts")).sort();
}

/** Verdetto leggibile da un esito di spawn. Separata perché il test la prova senza eseguire nulla. */
export function verdetto(status, out) {
  if (status === 0) return { esito: "ok", motivo: "" };
  const testo = String(out || "");
  if (/ERR_MODULE_NOT_FOUND/.test(testo)) {
    const m = testo.match(/Cannot find module '([^']+)'/);
    return { esito: "ineseguibile", motivo: `import non risolvibile da Node${m ? `: ${m[1]}` : ""} — manca l'estensione` };
  }
  if (!process.features.typescript) return { esito: "ineseguibile", motivo: `questo Node (${process.version}) non esegue i .ts` };
  return { esito: "rosso", motivo: "asserzioni fallite" };
}

function main() {
  const quando = nowPiacenza();
  const dir = join(AD_ROOT, CARTELLA);
  if (!existsSync(dir)) {
    console.error(`❌ cartella non trovata: ${CARTELLA}`);
    process.exit(1);
  }
  const file = trovaTest(readdirSync(dir)).map((f) => `${CARTELLA}/${f}`);
  if (!file.length) {
    console.error(`❌ nessun test .test.mts in ${CARTELLA}: il Pannello non ha rete.`);
    process.exit(1);
  }

  // Uno alla volta: se girassero insieme, il primo che non PARTE porterebbe giù l'intero run e
  // non si saprebbe quali degli altri stanno bene.
  const righe = [];
  for (const f of file) {
    // `--import hook-ts.mjs`: insegna a Node la risoluzione che il bundler già applica (import
    // relativi senza estensione). Senza, `lavori-gruppo.annulla.test.mts` non parte nemmeno.
    // Vedi cervello/test/risolvi-ts.mjs per il perché sta qui e non nel codice del Pannello.
    const r = spawnSync(process.execPath, ["--import", join(AD_ROOT, "cervello/test/hook-ts.mjs"), "--test", "--test-reporter=tap", join(AD_ROOT, f)], { encoding: "utf8", cwd: AD_ROOT });
    const out = `${r.stdout || ""}${r.stderr || ""}`;
    const passati = out.match(/^# pass (\d+)$/m);
    righe.push({ file: f, ...verdetto(r.status, out), passati: passati ? Number(passati[1]) : null });
  }
  const rotti = righe.filter((x) => x.esito !== "ok");

  if (JSON_MODE) {
    console.log(JSON.stringify({ esito: rotti.length ? "rotti" : "ok", quando, test: righe }, null, 2));
    process.exit(rotti.length ? 1 : 0);
  }

  console.log(`\n🧪 TEST DEL PANNELLO — ${quando}\n`);
  for (const x of righe) {
    const icona = x.esito === "ok" ? "✅" : x.esito === "ineseguibile" ? "🚫" : "❌";
    console.log(`  ${icona} ${x.file}${x.passati != null ? `  (${x.passati} passati)` : ""}`);
    if (x.motivo) console.log(`      ${x.motivo}`);
  }
  if (!rotti.length) {
    console.log(`\n✅ Tutti i ${righe.length} file di test del Pannello girano e passano.`);
    process.exit(0);
  }
  console.log(`\n❌ ${rotti.length} su ${righe.length} non danno garanzie.`);
  console.log(`   Un test che non gira non è una rete: è un file che fa sembrare coperto ciò che non lo è.`);
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
