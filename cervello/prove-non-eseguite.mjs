#!/usr/bin/env node
// 📐 LE PROVE CHE NESSUNO ESEGUE — il guardiano di AR-660.
//
// 🟢 Sola lettura: elenca una cartella e chiede al runner cosa dice di eseguire. Non scrive niente.
//
// IL DIFETTO CHE CHIUDE. In `cervello/test/` vivevano 26 file `.bats` — prove vere, scritte apposta
// per il worker, `watch-main`, il motore AI — e non li lanciava nessuno: né `test-cervello.mjs`
// (raccoglieva per estensione `.test.mjs`), né la CI, né il giro. Due di quei file lo dicevano per
// iscritto in cima a sé stessi. La casa lo sapeva, e nessun numero lo misurava.
//
// La causa non è «ci siamo dimenticati di agganciare bats»: è che nessuno confrontava mai le prove
// SCRITTE con le prove ESEGUITE, quindi la differenza poteva crescere in silenzio. Agganciare bats
// chiude i 26 di oggi; questo guardiano chiude la classe — la prossima famiglia di prove che nasce
// senza esecutore si vede subito, non fra sei mesi.
//
// COME LO FA, e perché non è un elenco. La domanda «quali famiglie sai eseguire?» non la tiene
// questo file: la fa a `test-cervello.mjs`, che risponde con `SUFFISSI_ESEGUITI`. Due elenchi in due
// file si allontanano sempre — è la stessa malattia, spostata di un piano. Qui ce n'è uno solo, e
// sta dove il lavoro si fa davvero.
//
// Uso:
//   node cervello/prove-non-eseguite.mjs          # verdetto + elenco delle prove orfane
//   node cervello/prove-non-eseguite.mjs --json   # per gli script
//
// Uscita (contratto guardiani, AR-322):
//   0 = ogni prova scritta ha chi la esegue
//   1 = una famiglia di prove non ha esecutore → violazione
//   2 = non ho potuto misurare (cartella illeggibile) → cieco, non «verde»

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { AD_ROOT } from "./git-github.mjs";
import { SUFFISSI_ESEGUITI } from "./test-cervello.mjs";

const CARTELLA = "cervello/test";
const JSON_MODE = process.argv.includes("--json");

/**
 * Il suffisso di famiglia di un file di prova, o `null` se quel file non è una prova.
 *
 * Il riconoscimento è STRETTO apposta: `nome.test.mjs`, `nome.spec.ts`, `nome.prova.js`, `nome.bats`.
 * Un `aiuto-test-comuni.mjs` non è una prova, è un aiuto — e un guardiano che accusa gli aiuti
 * diventa rumore, cioè si spegne da solo. Il prefisso `_` resta roba di servizio, com'è già scritto
 * in `trovaTest`: la convenzione di casa vale in un posto solo.
 *
 * Pura: riceve un nome e non guarda il disco, così la prova la esercita anche sui casi che in questa
 * cartella non sono ancora nati.
 */
export function famigliaDi(nome = "") {
  if (!nome || nome.startsWith("_")) return null;
  const m = /(\.(?:test|spec|prova)\.[a-z0-9]+|\.bats)$/i.exec(nome);
  return m ? m[1].toLowerCase() : null;
}

/**
 * Le famiglie di prove presenti nella cartella che NESSUN esecutore raccoglie.
 *
 * @param {string[]} nomi i file della cartella
 * @param {string[]} eseguite i suffissi che i runner dichiarano di eseguire
 * @returns {{famiglia:string, quante:number, file:string[]}[]} ordinate dalla più grossa
 */
export function famiglieOrfane(nomi = [], eseguite = []) {
  const coperte = new Set(eseguite.map((s) => String(s).toLowerCase()));
  const per = new Map();
  for (const n of nomi) {
    const f = famigliaDi(n);
    if (!f || coperte.has(f)) continue;
    if (!per.has(f)) per.set(f, []);
    per.get(f).push(n);
  }
  return [...per.entries()]
    .map(([famiglia, file]) => ({ famiglia, quante: file.length, file: file.sort() }))
    .sort((a, b) => b.quante - a.quante || a.famiglia.localeCompare(b.famiglia));
}

/** Prove scritte contro prove con un esecutore — il numero che AR-660 chiedeva e non esisteva. */
export function conta(nomi = [], eseguite = []) {
  const coperte = new Set(eseguite.map((s) => String(s).toLowerCase()));
  const prove = nomi.map(famigliaDi).filter(Boolean);
  const conEsecutore = prove.filter((f) => coperte.has(f)).length;
  return { scritte: prove.length, con_esecutore: conEsecutore, orfane: prove.length - conEsecutore };
}

function main() {
  let nomi;
  try {
    nomi = readdirSync(join(AD_ROOT, CARTELLA));
  } catch (e) {
    const motivo = `non ho potuto elencare ${CARTELLA}: ${e.message}`;
    if (JSON_MODE) console.log(JSON.stringify({ ok: false, cieco: true, motivo }));
    else console.error(`⚪ ${motivo} → cieco, non verde`);
    process.exit(2);
  }

  const orfane = famiglieOrfane(nomi, SUFFISSI_ESEGUITI);
  const numeri = conta(nomi, SUFFISSI_ESEGUITI);

  if (JSON_MODE) {
    console.log(JSON.stringify({ ok: orfane.length === 0, ...numeri, eseguite: SUFFISSI_ESEGUITI, orfane }, null, 2));
    process.exit(orfane.length ? 1 : 0);
  }

  console.log(`📐 PROVE SCRITTE CONTRO PROVE ESEGUITE — ${CARTELLA}\n`);
  console.log(`  scritte: ${numeri.scritte} · con un esecutore: ${numeri.con_esecutore} · senza nessuno: ${numeri.orfane}`);
  console.log(`  famiglie che qualcuno esegue: ${SUFFISSI_ESEGUITI.join(", ")}\n`);
  if (!orfane.length) {
    console.log("✅ ogni prova scritta in questa cartella ha chi la fa girare.");
    process.exit(0);
  }
  for (const o of orfane) {
    console.log(`❌ ${o.quante} prove «${o.famiglia}» non le esegue nessuno:`);
    for (const f of o.file.slice(0, 10)) console.log(`   · ${f}`);
    if (o.file.length > 10) console.log(`   · …e altre ${o.file.length - 10}`);
  }
  console.log("");
  console.log("   Una prova che non gira non protegge niente: fa sembrare coperto ciò che non lo è.");
  console.log(`   Rimedio: aggancia un esecutore e dichiaralo in SUFFISSI_ESEGUITI (cervello/test-cervello.mjs),`);
  console.log("   oppure porta quei file alla forma che gira già (un .test.mjs che esegue i blocchi veri).");
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
