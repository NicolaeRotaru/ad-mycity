#!/usr/bin/env node
// 🚦 GATE VERI — un freno dichiarato che non può scattare è peggio di nessun freno.
//
// PERCHÉ ESISTE. La pagella dell'intelligenza misura da settimane la stessa cosa: «correzioni di
// Nicola legate a un GATE che può fallire: 0 su 269». Zero. Duecentosessantanove volte Nicola ha
// corretto la macchina, e la difesa costruita è sempre stata una frase in un file — un promemoria
// che qualcuno deve ricordarsi di leggere, non un impedimento. L'83% delle correzioni cade su un
// tema già visto: è il conto di quel modo di imparare.
//
// Il 30/7 quel numero comincia a salire. E nel momento esatto in cui comincia a salire nasce il
// modo di barare: `gate: "node cervello/qualcosa.mjs"` scritto accanto a una lezione fa +1 anche se
// quel comando esce 0 qualunque cosa succeda. Avremmo 269 su 269 e nessuna difesa — la malattia che
// questa casa cura da trentacinque lotti, «certifica che una cosa ESISTE, non che FUNZIONA»,
// piantata dentro la misura che dovrebbe dire se stiamo guarendo.
//
// Perciò un gate è vero solo se sono vere tutte e tre:
//   ① il comando cita un file che esiste          → altrimenti è un puntatore rotto
//   ② esiste una MUTAZIONE che rimette l'errore    → altrimenti nessuno l'ha mai visto scattare
//   ③ quella mutazione trova ancora il suo pezzo   → altrimenti prova un codice che non c'è più
//
// La ② è la parte che conta e riusa il motore che c'è già: le mutazioni vivono in
// `cervello/mutanti.json` e le esegue `non-vacuita.mjs`, che rompe il file apposta e pretende il
// rosso. La differenza con le mutazioni dei difetti: lì si rompe il FIX e deve diventare rosso il
// test; qui si rimette l'ERRORE e deve diventare rosso il GATE. Stessa meccanica, stessa domanda —
// «e se tornasse?».
//
// 🟢 Sola lettura: legge lezioni, mutanti e file. Non esegue i gate (li esegue non-vacuita) e non
// tocca niente.
//
// Uso:
//   node cervello/gate-veri.mjs           -> report
//   node cervello/gate-veri.mjs --json    -> JSON
// Exit: 0 = ogni gate dichiarato è vero · 1 = c'è almeno un gate finto · 2 = non ho potuto misurare

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { fileDelComando } from "./cancello-lotto.mjs";

const JSON_MODE = process.argv.includes("--json");
const APPRENDIMENTO = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");
const MUTANTI = join(AD_ROOT, "cervello/mutanti.json");

/**
 * Il verdetto su TUTTI i gate dichiarati. Pura: riceve i dati e due domande sul disco, così la
 * prova può costruire il caso «gate che punta al vuoto» senza cancellare file veri.
 *
 * @param lezioni  le lezioni di apprendimento.json
 * @param mutanti  l'elenco di cervello/mutanti.json
 * @param esiste   (percorso) => boolean
 * @param leggi    (percorso) => string | null
 */
export function analizzaGate(lezioni = [], mutanti = [], esiste = () => false, leggi = () => null) {
  const conGate = lezioni.filter((l) => typeof l?.gate === "string" && l.gate.trim());
  const veri = [];
  const violazioni = [];

  for (const l of conGate) {
    const file = fileDelComando(l.gate);
    if (!file) {
      violazioni.push({
        regola: "gate-senza-comando",
        lezione: l.id,
        motivo: `«${l.gate}» non nomina nessun file eseguibile: non è un comando, è una frase`,
      });
      continue;
    }
    if (!esiste(file)) {
      violazioni.push({
        regola: "gate-orfano",
        lezione: l.id,
        motivo: `il gate punta a ${file}, che non esiste — «non fatto» è indistinguibile da «puntatore rotto»`,
      });
      continue;
    }
    const sue = mutanti.filter((m) => m?.lezione === l.id);
    if (!sue.length) {
      violazioni.push({
        regola: "gate-mai-rotto",
        lezione: l.id,
        motivo: `nessuna mutazione con lezione: "${l.id}" in mutanti.json — nessuno ha mai rimesso l'errore per vedere se ${file} scatta`,
      });
      continue;
    }
    // La mutazione deve ancora agganciarsi al codice vero, altrimenti prova un passato che non c'è.
    const cieche = sue.filter((m) => {
      const src = leggi(m.file);
      return src === null || !src.includes(m.cerca);
    });
    if (cieche.length) {
      violazioni.push({
        regola: "mutazione-cieca",
        lezione: l.id,
        motivo: `la mutazione di ${l.id} cerca in ${cieche[0].file} un pezzo che non c'è più: non prova niente, e lo dice «cieco», non «verde»`,
      });
      continue;
    }
    veri.push({ lezione: l.id, gate: l.gate, file, mutazioni: sue.length });
  }

  return { dichiarati: conGate.length, veri, violazioni };
}

function main() {
  let lezioni;
  let mutanti;
  try {
    lezioni = JSON.parse(readFileSync(APPRENDIMENTO, "utf8")).lezioni || [];
  } catch (e) {
    return esci(2, `apprendimento.json non leggibile (${e.message}): non posso misurare i gate`);
  }
  try {
    mutanti = JSON.parse(readFileSync(MUTANTI, "utf8")).mutanti || [];
  } catch (e) {
    // Nessuna mutazione leggibile non è «nessun gate finto»: è non aver guardato.
    return esci(2, `mutanti.json non leggibile (${e.message}): non posso sapere se i gate sono mai scattati`);
  }

  const esito = analizzaGate(
    lezioni,
    mutanti,
    (f) => existsSync(join(AD_ROOT, f)),
    (f) => {
      try {
        return readFileSync(join(AD_ROOT, f), "utf8");
      } catch {
        return null; // il chiamante lo tratta come «cieca», che è la lettura prudente
      }
    },
  );

  if (JSON_MODE) {
    console.log(JSON.stringify({ quando: nowPiacenza(), ...esito }, null, 2));
    process.exit(esito.violazioni.length ? 1 : 0);
  }

  console.log(`\n🚦 GATE VERI — ${nowPiacenza()}\n`);
  console.log(`  Lezioni che dichiarano un gate: ${esito.dichiarati}`);
  console.log(`  Gate veri (comando + mutazione che lo fa scattare): ${esito.veri.length}\n`);
  for (const v of esito.veri) {
    console.log(`  ✅ ${v.lezione} → ${v.gate}  (${v.mutazioni} mutazione/i)`);
  }
  if (esito.violazioni.length) {
    console.log("");
    for (const v of esito.violazioni) console.log(`  ❌ ${v.regola} — ${v.lezione}\n     ${v.motivo}`);
    console.log(`\n❌ ${esito.violazioni.length} gate dichiarati che non possono scattare.`);
    console.log(`   Un freno che non frena conta come freno solo nella pagella: è il modo di far salire`);
    console.log(`   il numero senza costruire la difesa. Aggiungi la mutazione, o togli il campo gate.`);
    process.exit(1);
  }
  if (!esito.dichiarati) {
    console.log("  ⚪ nessuna lezione dichiara un gate: qui non c'è niente da misurare (ed è il problema).");
  } else {
    console.log(`✅ ogni gate dichiarato può scattare davvero.`);
  }
  process.exit(0);
}

function esci(codice, messaggio) {
  if (JSON_MODE) console.log(JSON.stringify({ ok: false, cieco: codice === 2, motivo: messaggio }));
  else console.error(`gate-veri: ${messaggio}`);
  process.exit(codice);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
