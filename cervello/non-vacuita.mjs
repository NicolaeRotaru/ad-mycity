#!/usr/bin/env node
// 🧨 LA PROVA CHE LE PROVE PROVINO — rompe i fix apposta e pretende che i test diventino rossi.
//
// PERCHÉ ESISTE. Il passo ④.2 della skill `cantiere` dice: «rompi il fix riga per riga, e il test
// DEVE diventare rosso; se resta verde, la prova non prova niente». È il passo che ha pescato
// quattro difetti nel metro stesso in due giorni — e finora si faceva **a mano**, con uno script
// usa-e-getta buttato in /tmp e perso alla fine della sessione. Cioè: il controllo più prezioso del
// metodo era l'unico senza memoria.
//
// Qui le mutazioni diventano un file versionato (`cervello/mutanti.json`) e la verifica un comando.
// Chi legge la PR può rilanciarlo; chi arriva fra un mese vede quali fix erano protetti davvero.
//
// 🟡 Modifica temporaneamente i file per rompere il fix, e li RIPRISTINA sempre — anche su
// eccezione, anche su Ctrl-C. Non tocca git, non committa. Lavora sul working tree: non lanciarlo
// con modifiche non salvate che ti dispiacerebbe perdere se la macchina si spegne a metà.
//
// Uso:
//   node cervello/non-vacuita.mjs              # tutte le mutazioni
//   node cervello/non-vacuita.mjs --lotto 29   # solo quelle di un lotto
//   node cervello/non-vacuita.mjs --json
//
// Uscita (contratto guardiani, AR-322):
//   0 = ogni mutazione rende rosso il suo test: le prove non sono vacue
//   1 = almeno una mutazione lascia il test VERDE → quella prova non dimostra il suo fix
//   2 = non ho potuto misurare (file/mutanti assenti, pattern non trovato)

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const iLotto = process.argv.indexOf("--lotto");
const LOTTO = iLotto !== -1 ? String(process.argv[iLotto + 1] || "") : null;

const MUTANTI = join(AD_ROOT, "cervello/mutanti.json");

/** Applica la mutazione al testo. Torna null se il pattern non c'è (puntatore rotto o fix cambiato). */
export function muta(testo, cerca, sostituisci) {
  if (!testo.includes(cerca)) return null;
  return testo.split(cerca).join(sostituisci);
}

function main() {
  if (!existsSync(MUTANTI)) {
    console.error("non-vacuita: cervello/mutanti.json assente → non posso misurare");
    process.exit(2);
  }
  let elenco;
  try {
    elenco = JSON.parse(readFileSync(MUTANTI, "utf8")).mutanti || [];
  } catch (e) {
    console.error(`non-vacuita: mutanti.json illeggibile (${e.message}) → non posso misurare`);
    process.exit(2);
  }
  if (LOTTO) elenco = elenco.filter((m) => String(m.lotto) === LOTTO);
  if (!elenco.length) {
    console.error(`non-vacuita: nessuna mutazione${LOTTO ? ` per il lotto ${LOTTO}` : ""} → non posso misurare`);
    process.exit(2);
  }

  const esiti = [];
  for (const m of elenco) {
    const file = join(AD_ROOT, m.file);
    if (!existsSync(file)) {
      esiti.push({ ...m, verdetto: "cieco", perche: `file assente: ${m.file}` });
      continue;
    }
    const originale = readFileSync(file, "utf8");
    const rotto = muta(originale, m.cerca, m.sostituisci);
    if (rotto === null) {
      // Il pattern non c'è più: o il fix è stato riscritto, o questa mutazione punta al posto
      // sbagliato. In entrambi i casi non ho misurato niente — e dirlo «verde» sarebbe la bugia
      // esatta che questo strumento esiste per impedire.
      esiti.push({ ...m, verdetto: "cieco", perche: "il pezzo da rompere non esiste più: mutazione da aggiornare" });
      continue;
    }
    try {
      writeFileSync(file, rotto);
      const r = spawnSync("node", [m.test], { cwd: AD_ROOT, encoding: "utf8", timeout: 120_000 });
      const rosso = r.status !== 0;
      esiti.push({ ...m, verdetto: rosso ? "ok" : "vacua", perche: rosso ? "" : "il test resta VERDE col fix rotto" });
    } finally {
      writeFileSync(file, originale); // sempre, anche se il test esplode
    }
  }

  const vacue = esiti.filter((e) => e.verdetto === "vacua");
  const ciechi = esiti.filter((e) => e.verdetto === "cieco");

  if (JSON_MODE) {
    console.log(JSON.stringify({ ok: vacue.length === 0, esiti }, null, 2));
  } else {
    console.log("🧨 LA PROVA CHE LE PROVE PROVINO\n");
    for (const e of esiti) {
      const segno = e.verdetto === "ok" ? "✅" : e.verdetto === "vacua" ? "❌" : "⚠️ ";
      console.log(`  ${segno} ${e.difetto} — ${e.nome}`);
      if (e.perche) console.log(`     ${e.perche}`);
    }
    console.log("");
    console.log(
      vacue.length
        ? `⛔ ${vacue.length} prova/e NON dimostra il suo fix: rompendolo il test resta verde.`
        : `✅ tutte e ${esiti.length - ciechi.length} le mutazioni rendono rosso il loro test.`,
    );
    if (ciechi.length) console.log(`⚠️  ${ciechi.length} mutazione/i non ha potuto misurare (vedi sopra).`);
  }

  if (vacue.length) process.exit(1);
  if (ciechi.length) process.exit(2);
  process.exit(0);
}

if (process.argv[1] && process.argv[1].endsWith("non-vacuita.mjs")) main();
