#!/usr/bin/env node
// 💊 ADOZIONE-MEDICINE (AR-407) — una cura scritta non è una cura somministrata.
//
// PERCHÉ ESISTE. Gli stessi difetti tornano perché la cura viene installata in due punti su venti, e
// nessuno conta gli altri diciotto. Il difetto chiuso nominava quei due punti; convertire gli altri è
// lavoro senza un difetto che lo chieda, e il cantiere si lavora per difetti.
//
// Il punto cieco è nel criterio di chiusura: la prova guarda il MODULO NUOVO (test verde sul file
// puro) e non quanti chiamanti lo usano. È la lezione di AR-211 applicata al pezzo invece che al
// comportamento — e così «malattia curata» viene dichiarato su una scrittura di codice, non su una
// copertura.
//
// COSA FA. Per ogni medicina censita conta due numeri sul repo vero:
//   · **chiamanti**  — quanti file la usano davvero (non l'import: l'uso).
//   · **malati**     — quanti punti portano ancora il sintomo grezzo che la medicina cura.
// La copertura è chiamanti / (chiamanti + malati). Ogni medicina ha una `soglia` DICHIARATA, che è la
// copertura del giorno in cui la voce è stata scritta: quella soglia **sale quando si cura e non
// scende mai**. Scendere sotto = un punto nuovo è nato malato, e il comando esce ≠0.
//
// PERCHÉ UNA SOGLIA CHE SALE E NON UN «DEVE ESSERE 100%». Un cancello che parte rosso su diciotto
// punti viene disattivato entro la settimana, e allora non protegge più niente. Così invece il
// numero è in Cabina, non può peggiorare, e l'elenco dei punti scoperti È il lotto successivo.
//
// Uso:
//   node cervello/adozione-medicine.mjs            -> il referto leggibile
//   node cervello/adozione-medicine.mjs --json     -> per il giro e la Cabina
//   node cervello/adozione-medicine.mjs --scoperti -> solo l'elenco dei punti da convertire
//
// Exit: 0 = nessuna medicina sotto la sua soglia · 1 = una copertura è PEGGIORATA
//
// 🟢 Sola lettura sul repo: non scrive niente, nemmeno in memoria.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { AD_ROOT } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const SOLO_SCOPERTI = process.argv.includes("--scoperti");

/**
 * IL REGISTRO DELLE MEDICINE.
 *
 * Ogni voce dice tre cose e nient'altro:
 *   `cura`     — cosa impedisce, in una frase che si capisce senza aprire il codice.
 *   `usata`    — come si riconosce un punto GUARITO (la medicina è chiamata lì).
 *   `sintomo`  — come si riconosce un punto ANCORA MALATO.
 *   `dove`     — le cartelle in cui ha senso cercare.
 *   `soglia`   — la copertura misurata quando la voce è nata. Sale, non scende.
 *
 * Le soglie qui sotto sono state MISURATE con questo stesso comando il 2026-08-15, non stimate.
 */
export const MEDICINE = [
  {
    id: "esito-lettura",
    cura: "una lettura fallita mostrata come se fosse un dato vero (zero letto come «nessuno»)",
    usata: /esito-lettura|esitoLettura|letturaRiuscita/,
    sintomo: /await\s+(?:readFile|fs\.readFile)\([^)]*\)\s*(?:\.catch\(\s*\(\)\s*=>|\s*\|\|)/,
    dove: ["pannello/src/app/api", "pannello/src/lib"],
    soglia: 1,
  },
  {
    id: "scrittura-confermata",
    cura: "una scrittura data per fatta senza guardare il valore che torna",
    usata: /scritturaConfermata/,
    sintomo: /await\s+(?:writeFile|scriviJson)[^;]*;\s*(?:\/\/[^\n]*)?\n\s*return\s+(?:true|\{\s*ok:\s*true)/,
    dove: ["pannello/src/app/api", "pannello/src/lib"],
    soglia: 1,
  },
  {
    id: "panel-sync",
    cura: "una schermata che carica dati e non si accorge quando cambiano",
    usata: /usePanelSync/,
    sintomo: /useEffect\([^)]*\)\s*=>\s*\{[^}]*fetch\(/,
    dove: ["pannello/src/components", "pannello/src/app"],
    soglia: 0.8,
  },
  {
    id: "strato",
    cura: "due finestre sovrapposte che si coprono a vicenda perché ognuna sceglie il suo z-index",
    usata: /useStrato/,
    sintomo: /fixed\s+inset-0/,
    dove: ["pannello/src/components", "pannello/src/app"],
    soglia: 1,
  },
  {
    id: "aggiornamento-pertinente",
    cura: "un ascoltatore del bus che si sveglia per ogni evento, anche quelli che non lo riguardano",
    usata: /aggiornamentoPertinente/,
    sintomo: /addEventListener\(\s*["'`]mycity:/,
    dove: ["pannello/src/components", "pannello/src/lib", "pannello/src/app"],
    soglia: 0.8,
  },
];

const ESTENSIONI = new Set([".ts", ".tsx", ".mjs", ".js"]);

/** Tutti i file di codice sotto una cartella. Niente node_modules, niente build. */
export function fileDiCodice(radice, dentro = []) {
  const out = [];
  for (const cartella of dentro) {
    const base = join(radice, cartella);
    if (!existsSync(base)) continue;
    const pila = [base];
    while (pila.length) {
      const dir = pila.pop();
      let voci;
      try {
        voci = readdirSync(dir, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const v of voci) {
        const pieno = join(dir, v.name);
        if (v.isDirectory()) {
          if (v.name === "node_modules" || v.name === ".next" || v.name.startsWith(".")) continue;
          pila.push(pieno);
          continue;
        }
        if (!ESTENSIONI.has(extname(v.name))) continue;
        try {
          if (statSync(pieno).size > 2_000_000) continue;
        } catch {
          continue;
        }
        out.push(pieno);
      }
    }
  }
  return out.sort();
}

/**
 * IL CUORE, puro: dati i file già letti, quanti sono guariti e quanti ancora malati.
 *
 * Un file conta come guarito se USA la medicina, anche se porta ancora il sintomo: la conversione a
 * metà è comunque una conversione iniziata, e contarla due volte falserebbe il denominatore.
 */
export function coperturaMedicina(medicina, file = []) {
  const guariti = [];
  const malati = [];
  for (const f of file) {
    const usa = medicina.usata.test(f.testo);
    const malato = medicina.sintomo.test(f.testo);
    if (usa) guariti.push(f.nome);
    else if (malato) malati.push(f.nome);
  }
  const totale = guariti.length + malati.length;
  const copertura = totale ? Math.round((guariti.length / totale) * 100) / 100 : null;
  return {
    id: medicina.id,
    cura: medicina.cura,
    chiamanti: guariti.length,
    scoperti: malati.length,
    totale,
    copertura,
    soglia: medicina.soglia,
    // `null` = nessun punto né guarito né malato: la medicina non ha pazienti qui, e dirlo «100%»
    // sarebbe la bugia peggiore — un verde che nasce dal non aver guardato niente.
    peggiorata: copertura !== null && copertura < medicina.soglia,
    guariti,
    punti_scoperti: malati,
  };
}

/** Il referto intero: una riga per medicina, più il verdetto. */
export function referto(medicine = MEDICINE, leggi = leggiDalRepo) {
  const voci = medicine.map((m) => coperturaMedicina(m, leggi(m)));
  const peggiorate = voci.filter((v) => v.peggiorata);
  const senzaPazienti = voci.filter((v) => v.copertura === null);
  const scopertiTotali = voci.reduce((s, v) => s + v.scoperti, 0);
  return {
    medicine: voci,
    peggiorate: peggiorate.map((v) => v.id),
    senza_pazienti: senzaPazienti.map((v) => v.id),
    punti_scoperti_totali: scopertiTotali,
    ok: peggiorate.length === 0,
  };
}

function leggiDalRepo(medicina) {
  return fileDiCodice(AD_ROOT, medicina.dove).map((p) => {
    let testo = "";
    try {
      testo = readFileSync(p, "utf8");
    } catch {
      testo = "";
    }
    return { nome: relative(AD_ROOT, p), testo };
  });
}

function main() {
  const r = referto();

  if (JSON_MODE) {
    console.log(JSON.stringify(r, null, 2));
  } else if (SOLO_SCOPERTI) {
    for (const m of r.medicine) {
      for (const p of m.punti_scoperti) console.log(`${m.id}\t${p}`);
    }
  } else {
    console.log("\n💊 ADOZIONE DELLE MEDICINE — quante volte una cura scritta è stata davvero somministrata\n");
    for (const m of r.medicine) {
      const quota = m.copertura === null ? "nessun paziente" : `${Math.round(m.copertura * 100)}%`;
      const stato = m.peggiorata ? "❌ PEGGIORATA" : m.copertura === null ? "⚪" : "✅";
      console.log(`${stato} ${m.id.padEnd(26)} ${String(m.chiamanti).padStart(3)} usano · ${String(m.scoperti).padStart(3)} ancora scoperti · copertura ${quota} (soglia ${Math.round(m.soglia * 100)}%)`);
      console.log(`     cura: ${m.cura}`);
      if (m.punti_scoperti.length) {
        console.log(`     da convertire: ${m.punti_scoperti.slice(0, 4).join(", ")}${m.punti_scoperti.length > 4 ? ` (+${m.punti_scoperti.length - 4})` : ""}`);
      }
    }
    console.log(`\n   ${r.punti_scoperti_totali} punti scoperti in tutto: è l'elenco del lotto dopo, non un numero da guardare.`);
    if (r.senza_pazienti.length) {
      console.log(`   ⚪ ${r.senza_pazienti.join(", ")}: nessun punto né guarito né malato. Il sintomo non trova nessuno — o la medicina non serve più, o la ricerca è sbagliata: va guardato, non contato come verde.`);
    }
    if (!r.ok) {
      console.log(`\n❌ copertura PEGGIORATA su: ${r.peggiorate.join(", ")}. È nato un punto nuovo già malato: la medicina esiste e non è stata usata.`);
    }
  }
  process.exit(r.ok ? 0 : 1);
}

// Il programma parte solo se qualcuno LANCIA questo file, non se qualcuno lo importa (AR-680).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
