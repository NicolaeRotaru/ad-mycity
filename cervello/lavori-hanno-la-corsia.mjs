#!/usr/bin/env node
// 🏪 OGNI RIGA DELLA CODA DICE DI CHE NEGOZIO È (AR-801 / AR-819)
//
// PERCHÉ ESISTE. Il 25/8 Nicola ha dato il via alla card #174: due comandi sul database, e il
// secondo rende `lavori.negozio_id` obbligatorio. La card poneva UNA condizione — «il Pannello
// nuovo dev'essere online» — e quella condizione era vera. Ma il Pannello non è l'unico che
// scrive nella coda: ci scrivono anche le cadenze, la sentinella e il worker, dal VPS. Nessuno
// dei tre metteva la corsia. Dare il secondo comando in quel momento avrebbe fatto fallire ogni
// ri-accodamento, ogni recupero di cadenza e ogni metabolizzazione: la macchina si ferma, che è
// esattamente il danno che la card diceva di voler evitare.
//
// La precondizione era scritta guardando il posto da cui era arrivata la scoperta, non tutti i
// posti da cui il danno può arrivare. È la stessa forma di AR-807 e AR-813.
//
// COSA CONTROLLA, E PERCHÉ NON È UN GREP. Trova ogni punto che fa POST sulla tabella `lavori`,
// poi COSTRUISCE DAVVERO il corpo che quel punto manderebbe — eseguendo il filtro `jq` per gli
// script, chiamando la funzione esportata per il JavaScript — e guarda se nel risultato c'è la
// corsia. Una parola cercata nel file non può fallire nel modo in cui fallisce un `insert`.
//
// I TRE ESITI. Verde: ogni corpo costruito ha la corsia. Rosso: almeno uno non ce l'ha. ⚪ exit 2:
// ho trovato un punto che scrive nella coda e NON ho saputo costruirne il corpo — che non è un
// verde, è un buco dichiarato, e obbliga chi aggiunge uno scrittore nuovo a cablarlo qui.
//
// 🟢 Sola lettura.
// Uso: node cervello/lavori-hanno-la-corsia.mjs [--json]

import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { AD_ROOT } from "./git-github.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";

const JSON_MODE = process.argv.includes("--json");

// La radice su cui misurare. Di norma e' la casa; un banco di prova la sposta su un repo finto, ed
// e' l'unico modo di vedere questo guardiano DIVENTARE ROSSO invece di crederci sulla parola: sul
// repo vero la corsia c'e' su tutti i corpi, quindi il caso rosso li' non capita mai.
const RADICE = process.env.LAVORI_CORSIA_ROOT || AD_ROOT;
export const CORSIA = "negozio_id";

/** I punti che fanno POST sulla coda, trovati chiedendo a git quali file esistono davvero. */
export function puntiCheScrivono(radice = RADICE) {
  // Gli elenchi a git si chiedono dalla porta di casa, non con uno spawn per conto proprio:
  // `percorsi-git.mjs` e' l'unico posto che sa gestire i nomi con l'accento e i file cancellati.
  // Me l'ha ricordato una prova che esisteva gia', al primo giro del cancello.
  let elenco;
  try {
    elenco = percorsiDaGit(["ls-files"], { cwd: radice });
  } catch {
    return null; // non ho potuto chiedere: ⚪, non verde
  }
  const fuori = [];
  for (const f of elenco) {
    if (!/\.(sh|mjs|js|ts|mts)$/.test(f)) continue;
    if (/(^|\/)(test|node_modules|marketplace)\//.test(f) || /\.test\./.test(f)) continue;
    let testo;
    try { testo = readFileSync(join(radice, f), "utf8"); } catch { continue; }
    if (!/rest\/v1\/lavori/.test(testo)) continue;
    // Solo chi SCRIVE: una lettura non ha un corpo da controllare.
    if (!/-X"?,?\s*"?POST/.test(testo)) continue;
    fuori.push(f);
  }
  return fuori;
}

/**
 * I filtri jq che CREANO una riga della coda dentro uno script.
 *
 * La distinzione che conta, e che al primo giro mi ero perso: sullo stesso endpoint passano sia
 * le creazioni sia le modifiche, e una modifica non deve dichiarare il negozio — la riga il suo
 * negozio ce l'ha gia'. Il segno di una creazione non e' il verbo (non si vede nel filtro): sono
 * le colonne obbligatorie senza valore di default. `tipo` e `richiesta` le puo' mettere solo chi
 * la riga la sta facendo nascere; chi ne cambia lo stato tocca `stato`, `risultato`, `updated_at`.
 *
 * Al primo giro contavo per «inizia con stato:», e sei corpi di UPDATE risultavano difettosi:
 * un guardiano che grida su chi non ha colpa lo si impara a ignorare, e allora tanto vale non averlo.
 */
export function filtriJq(testo = "") {
  return [...String(testo).matchAll(/'(\{stato:[^']*\})'/g)]
    .map((m) => m[1])
    .filter((f) => /\btipo\s*:/.test(f) && /\brichiesta\s*:/.test(f));
}

/** Esegue un filtro jq davvero, con un valore finto per ogni variabile che nomina. */
export function corpoDaJq(filtro) {
  const args = [...new Set([...filtro.matchAll(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g)].map((m) => m[1]))];
  const a = args.flatMap((n) => ["--arg", n, "x"]);
  const r = spawnSync("jq", ["-n", ...a, filtro], { encoding: "utf8" });
  if (r.status !== 0) return null;
  try { return JSON.parse(r.stdout); } catch { return null; }
}

/** I costruttori in JavaScript che questo guardiano sa chiamare. Chi ne aggiunge uno lo cabla qui. */
const COSTRUTTORI_JS = {
  "cervello/sentinella-motore.mjs": async () => {
    const m = await import("./sentinella-motore.mjs");
    return typeof m.corpoRecupero === "function" ? [m.corpoRecupero({ tipo: "giro", descrizione: "prova" })] : null;
  },
};

async function main() {
  const punti = puntiCheScrivono();
  if (punti === null) return esci(2, "non ho potuto chiedere a git l'elenco dei file: non ho misurato niente");

  const senzaCorsia = [];
  const nonMisurati = [];
  let corpiControllati = 0;

  for (const f of punti) {
    const testo = readFileSync(join(RADICE, f), "utf8");
    let corpi = null;

    if (f.endsWith(".sh")) {
      const filtri = filtriJq(testo);
      corpi = filtri.length ? filtri.map(corpoDaJq) : null;
    } else if (COSTRUTTORI_JS[f]) {
      corpi = await COSTRUTTORI_JS[f]();
    }

    if (!corpi || corpi.some((c) => c === null)) {
      nonMisurati.push(`${f}: scrive nella coda ma non ho saputo costruirne il corpo`);
      continue;
    }
    for (const c of corpi) {
      corpiControllati++;
      if (!c[CORSIA]) senzaCorsia.push({ file: f, corpo: Object.keys(c).join(", ") });
    }
  }

  if (JSON_MODE) {
    console.log(JSON.stringify({ punti, corpiControllati, senza_corsia: senzaCorsia, non_misurati: nonMisurati }, null, 2));
    process.exit(senzaCorsia.length ? 1 : nonMisurati.length ? 2 : 0);
  }

  console.log(`\n🏪 LA CORSIA DEL NEGOZIO SU OGNI RIGA DELLA CODA\n`);
  console.log(`  punti che scrivono nella coda: ${punti.length} · corpi costruiti davvero: ${corpiControllati}`);
  for (const r of nonMisurati) console.log(`  ⚪ ${r}`);
  for (const s of senzaCorsia) console.log(`  ❌ ${s.file}: costruisce una riga senza «${CORSIA}» (campi: ${s.corpo})`);

  if (senzaCorsia.length) {
    console.log(`\n❌ ${senzaCorsia.length} righe nascerebbero senza corsia.`);
    console.log(`   Col campo obbligatorio nel database quell'insert FALLISCE, e con lui la cadenza`);
    console.log(`   o il recupero che lo faceva. Aggiungi \`${CORSIA}:"centro"\` per i lavori che la`);
    console.log(`   macchina fa per sé.`);
    process.exit(1);
  }
  if (nonMisurati.length) {
    console.log(`\n⚪ NON HO MISURATO TUTTO: ${nonMisurati.length} punto/i scrivono nella coda e non so costruirne il corpo.`);
    console.log(`   Il verde qui non li coprirebbe. Cablali in COSTRUTTORI_JS.`);
    process.exit(2);
  }
  console.log(`\n✅ tutti i ${corpiControllati} corpi costruiti portano la corsia: il campo può diventare obbligatorio.`);
  process.exit(0);
}

function esci(codice, messaggio) {
  if (JSON_MODE) console.log(JSON.stringify({ ok: false, cieco: codice === 2, motivo: messaggio }));
  else console.error(`lavori-hanno-la-corsia: ${messaggio}`);
  process.exit(codice);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
