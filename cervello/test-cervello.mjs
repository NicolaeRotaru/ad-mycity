#!/usr/bin/env node
// 🧪 GUARDIANO DEI TEST DEL CERVELLO. 🟢 Sola lettura: esegue test, non tocca niente.
//
// IL DIFETTO CHE CHIUDE, e perché è imbarazzante. Il 25/7 ho costruito `test-pannello.mjs` per
// scoprire i test che nessuno lanciava: ne trovò cinque, e uno non partiva nemmeno. Poi ho
// controllato dove gira quel guardiano. **Da nessuna parte.** Né nel giro, né in CI. E con lui
// nemmeno i 79 test di `cervello/test/`: esistono solo quando qualcuno li digita a mano.
//
// Cioè: ho costruito la rete per i test che nessuno esegue, e l'ho lasciata nella stessa
// condizione. Un test che non gira non è una rete, è un file — vale per i test e vale per il
// guardiano dei test.
//
// Questo è il gemello di test-pannello.mjs per `cervello/test/`, e serve a essere AGGANCIATO al
// giro (vedi giro.sh). Li SCOPRE dalla cartella invece di tenerne un elenco: un elenco si
// dimentica di aggiornare e un test nuovo resterebbe fuori senza che nessuno se ne accorga — che
// è esattamente il male che stiamo curando.
//
// Perché questo può essere un VINCOLO HARD nel giro mentre quello del Pannello no: qui sono test
// puri di Node su moduli `.mjs` — niente rete, niente DB, niente compilatore TypeScript. Se
// diventano rossi, sono rossi davvero, e il giro deve fermarsi. I test del Pannello invece
// dipendono dal type-stripping di Node (≥22.18), che da qui non posso verificare sul VPS: lì
// resta informativo finché non lo si è visto passare sulla macchina vera.
//
// Uso:
//   node cervello/test-cervello.mjs           -> report
//   node cervello/test-cervello.mjs --json    -> JSON
// Exit: 0 = tutti girano e passano · 1 = almeno uno rotto o ineseguibile

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const CARTELLA = "cervello/test";

/** Trova i test del cervello. Pura sulla lettura della cartella: il test la prova con una finta. */
export function trovaTest(elenco = []) {
  return elenco.filter((f) => f.endsWith(".test.mjs")).sort();
}

/**
 * Legge il TAP di `node --test` e dice quanti sono passati e quanti falliti.
 *
 * ⚠️ Ci sono DUE conteggi nell'output, e per mesi si è letto quello sbagliato. `node --test` chiude
 * col proprio riassunto — `# pass 1`, dove 1 è **il file**, non le sue asserzioni — mentre i test di
 * questa casa stampano il proprio TAP a mano, che node ri-emette come commento con il cancelletto
 * protetto: `# \# pass 8`. La vecchia regex `^# pass (\d+)$` prendeva solo il primo e riportava 1 per
 * ognuno di questi file.
 *
 * Conseguenza misurata il 28/7: la suite dichiarava «276 asserzioni» con 39 file, cioè contava un
 * punto per file invece delle asserzioni vere. Non era un falso verde (un file rotto restava rosso),
 * ma era un numero che diceva una cosa diversa da quella che misurava — e quel numero finiva nelle
 * PR come prova di copertura.
 */
export function leggiTap(out = "") {
  const testo = String(out);
  const suo = (nome) => testo.match(new RegExp(`^#\\s+\\\\#\\s*${nome} (\\d+)`, "m"));
  const proprio = (nome) => testo.match(new RegExp(`^# ${nome} (\\d+)$`, "m"));
  const pass = suo("pass") || proprio("pass");
  const fail = suo("fail") || proprio("fail");
  return { passati: pass ? Number(pass[1]) : null, falliti: fail ? Number(fail[1]) : null };
}

/**
 * Verdetto da un esito di spawn. Distingue ROTTO (asserzioni rosse: il codice ha un difetto) da
 * INESEGUIBILE (il file non parte affatto): sono due guasti diversi e chiedono due mosse diverse.
 */
export function verdetto(status, out) {
  const { passati, falliti } = leggiTap(out);
  if (status === 0 && passati !== null) return { esito: "ok", motivo: "", passati, falliti };
  // ⚠️ L'ordine di questi due controlli è il difetto che la controprova mi ha trovato addosso il
  // 25/7. `node --test` su un file che non si CARICA lo riporta lo stesso in TAP, come «1 test, 1
  // fallito»: quindi il conteggio c'è, e la prima versione lo classificava «rosso — asserzioni
  // fallite». Ma un file che non parte non ha asserzioni: dire «rosso» manda a cercare un bug che
  // non c'è, mentre il guasto è l'import. È esattamente la distinzione per cui esiste AR-156.
  // Quindi: prima si guarda se il modulo si carica, POI si guarda il TAP.
  const testo = String(out || "");
  const mod = testo.match(/Cannot find module '([^']+)'/);
  if (mod || /ERR_MODULE_NOT_FOUND|ERR_UNSUPPORTED_DIR_IMPORT/.test(testo)) {
    return { esito: "ineseguibile", motivo: `import non risolvibile${mod ? `: ${mod[1]}` : ""}`, passati, falliti };
  }
  if (passati === null) {
    return { esito: "ineseguibile", motivo: "il file non è nemmeno partito", passati, falliti };
  }
  return { esito: "rosso", motivo: `${falliti ?? "?"} asserzioni fallite`, passati, falliti };
}

function main() {
  const quando = nowPiacenza();
  const dir = join(AD_ROOT, CARTELLA);
  if (!existsSync(dir)) {
    console.error(`❌ cartella non trovata: ${CARTELLA}`);
    process.exit(1);
  }
  const file = trovaTest(readdirSync(dir));
  if (!file.length) {
    console.error(`❌ nessun test .test.mjs in ${CARTELLA}: il cervello non ha rete.`);
    process.exit(1);
  }

  // Uno alla volta: se girassero insieme, il primo che non PARTE porterebbe giù l'intero run e non
  // si saprebbe quali degli altri stanno bene. È la stessa scelta di test-pannello.mjs.
  const righe = [];
  for (const f of file) {
    // `--import hook-ts.mjs` (AR-156): parecchi test di questa cartella importano moduli `.ts` del
    // Pannello, e quei moduli importano fra loro senza estensione — legittimo per il bundler di
    // Next, non per Node. Senza il risolutore il test non FALLISCE: non parte proprio, che è la
    // forma peggiore, perché somiglia a un test che non c'è. Il hook è conservativo: riprova solo
    // gli import relativi non risolti e, se non li trova, rilancia l'errore originale.
    const r = spawnSync(
      process.execPath,
      ["--import", join(dir, "hook-ts.mjs"), "--test", "--test-reporter=tap", join(dir, f)],
      { encoding: "utf8", cwd: AD_ROOT },
    );
    righe.push({ file: `${CARTELLA}/${f}`, ...verdetto(r.status, `${r.stdout || ""}${r.stderr || ""}`) });
  }
  const rotti = righe.filter((x) => x.esito !== "ok");
  const totale = righe.reduce((n, x) => n + (x.passati || 0), 0);

  if (JSON_MODE) {
    console.log(
      JSON.stringify({ esito: rotti.length ? "rotti" : "ok", quando, asserzioni: totale, test: righe }, null, 2),
    );
    process.exitCode = rotti.length ? 1 : 0;
    return;
  }

  console.log(`\n🧪 TEST DEL CERVELLO — ${quando}\n`);
  for (const x of righe) {
    const icona = x.esito === "ok" ? "✅" : x.esito === "ineseguibile" ? "🚫" : "❌";
    console.log(`  ${icona} ${x.file}${x.passati != null ? `  (${x.passati} passati)` : ""}`);
    if (x.motivo) console.log(`      ${x.motivo}`);
  }
  if (!rotti.length) {
    console.log(`\n✅ ${righe.length} file, ${totale} asserzioni: girano tutti e passano tutti.`);
    process.exitCode = 0;
    return;
  }
  console.log(`\n❌ ${rotti.length} su ${righe.length} non danno garanzie.`);
  console.log(`   Un test che non gira non è una rete: è un file che fa sembrare coperto ciò che non lo è.`);
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) main();
