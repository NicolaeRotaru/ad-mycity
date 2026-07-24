#!/usr/bin/env node
// 🥊 VERIFICA-AVVERSARIALE — il gate che smaschera l'auto-verifica FINTA.
//
// IL PROBLEMA (sonda «auto-verifica», 2026-07-24): la "verifica avversariale a 3 livelli" vive solo
// come prosa; nessuno script lancia un revisore ostile e la stessa istanza si auto-promuove. Prova:
// l'ultima auto-analisi.json ha voto_fiducia 90, `refutazione:"Nessuna entità nuova inventata…"`
// (boilerplate) e ~0 errori sostanziali catturati, contro 376 correzioni di Nicola. Un'auto-analisi
// che trova SEMPRE "tutto ok" non è una verifica: è un timbro.
//
// COSA FA (sola lettura di auto-analisi.json): giudica se l'ULTIMA auto-analisi è una REFUTAZIONE VERA
// o un timbro vuoto. Se è vuota, esce rc≠0 e giro.sh passa un VINCOLO HARD al motore che gli impone di
// fare, in QUESTO giro, una refutazione con le unghie (mettere in dubbio i propri numeri/entità, citarne
// la fonte o declassarli). Non è ancora un SECONDO agente indipendente (quello richiede la coda-lavori
// del worker) — è il gradino intermedio: da "verifica di esistenza" a "verifica di sostanza".
//
// USO:
//   node cervello/verifica-avversariale.mjs           -> report umano + exit (0 vera, 1 vuota)
//   node cervello/verifica-avversariale.mjs --gate     -> per il giro: se vuota stampa il VINCOLO su stdout, rc 1
//   node cervello/verifica-avversariale.mjs --json      -> output macchina
//
// Fail-safe: se auto-analisi.json manca/è illeggibile → exit 0 (l'esistenza la copre il gate AR-014,
// non tocca a questo bloccare). Non scrive nulla.

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AA = join(ROOT, "MyCity-Vault", "90-Memoria-AI", "auto-coscienza", "auto-analisi.json");

const args = process.argv.slice(2);
const GATE = args.includes("--gate");
const JSON_OUT = args.includes("--json");

// boilerplate = una refutazione che dichiara "niente da vedere" senza mostrare un dubbio vero
const BOILERPLATE = /^\s*(nessun|nessuna|tutto\s+ok|niente\s+da|non\s+ho\s+trovato|zero\s+error|nulla\s+da)/i;
// marcatori che una refutazione ha DAVVERO messo in dubbio qualcosa e riportato l'esito
const SFIDA = /(ho\s+messo\s+in\s+(dubbio|discussione)|ho\s+ricalcolat|ho\s+corrett|si\s+è\s+rivelat|era\s+sbagliat|ho\s+declassat|contraddi|non\s+torna|ho\s+trovato\s+un|fonte\s+manca|senza\s+fonte|ho\s+rimosso|ho\s+ridotto|smentit)/i;
// un "errore" che parla del PROCESSO del giro (loop/ripetizione/invocazione), non del LAVORO/DATI
const PROCESSO = /(giro|passaggi|loop|invocazion|ripetut|a\s+vuoto|identico|cadenza|sessione)/i;

function fine(payload, rc = 0) {
  if (JSON_OUT) process.stdout.write(JSON.stringify(payload, null, 2));
  process.exit(rc);
}

if (!existsSync(AA)) fine({ esito: "assente" }, 0);

let j;
try {
  j = JSON.parse(readFileSync(AA, "utf8"));
} catch {
  fine({ esito: "illeggibile" }, 0);
}

const refut = String(j.refutazione || "").trim();
const voto = Number(j.voto_fiducia);
const errori = Array.isArray(j.errori_giro) ? j.errori_giro : Array.isArray(j.errori) ? j.errori : [];

// (1) la refutazione è vuota/boilerplate?
const refutVuota = !refut || refut.length < 60 || (BOILERPLATE.test(refut) && !SFIDA.test(refut));

// (2) gli errori catturati sono sostanziali o solo note di processo?
const testoErrori = errori.map((e) => (typeof e === "string" ? e : JSON.stringify(e))).join(" ");
const erroriSostanziali = errori.length > 0 && !(PROCESSO.test(testoErrori) && !SFIDA.test(testoErrori));

// (3) confidenza alta + zero sostanza = il timbro "sempre tutto ok"
const timbroCieco = Number.isFinite(voto) && voto >= 80 && refutVuota && !erroriSostanziali;

const vuota = refutVuota && !erroriSostanziali;

const report = {
  esito: vuota ? "vuota" : "vera",
  data_auto_analisi: j.data || null,
  voto_fiducia: Number.isFinite(voto) ? voto : null,
  refutazione_vuota: refutVuota,
  errori_sostanziali: erroriSostanziali,
  timbro_cieco: timbroCieco,
};

if (JSON_OUT) fine(report, vuota ? 1 : 0);

if (!vuota) {
  console.log(`🥊 Auto-verifica: VERA (refutazione con sostanza${erroriSostanziali ? " + errori reali catturati" : ""}). ✅`);
  process.exit(0);
}

// VUOTA → messaggio-vincolo (in --gate va su stdout perché giro.sh lo cattura come VERIFICA_VINCOLO)
const vincolo =
  `⛔ AUTO-VERIFICA VUOTA (verifica-avversariale.mjs): l'ultima auto-analisi (${j.data || "?"}) non ha messo davvero in discussione nulla — ` +
  `refutazione ${refutVuota ? "boilerplate/assente" : "ok"}, errori sostanziali catturati: ${erroriSostanziali ? "sì" : "0"}, voto_fiducia ${Number.isFinite(voto) ? voto : "?"}. ` +
  `Un'auto-analisi che trova SEMPRE «tutto ok» è un timbro, non una verifica. QUESTO giro fai una REFUTAZIONE VERA: prendi i 3 numeri/entità/decisioni più importanti e prova a DEMOLIRLI — ` +
  `per ognuno o citi la FONTE verificabile o lo declassi a ipotesi; scrivi nel campo \`refutazione\` di auto-analisi.json COSA hai messo in dubbio e cosa è sopravvissuto, e in \`errori_giro\` gli errori VERI del lavoro (non note sul giro stesso).`;

if (GATE) {
  process.stdout.write(vincolo + "\n");
} else {
  console.log("🥊 Auto-verifica: VUOTA (timbro «tutto ok»). ❌");
  console.log(vincolo);
}
process.exit(1);
