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
// 📏 UNA DEFINIZIONE SOLA di «freno vero» (contratto-prova.mjs) — AR-565.
//
// Qui c'era una copia della regola, e da qualche parte ce n'era un'altra: due guardiani guardavano
// lo stesso mucchio di lezioni e ne davano verdetti opposti nello stesso giorno. Quando due numeri
// rispondono alla stessa domanda vince quello che finisce nella riga di riassunto, e in questa casa
// il verde vince sempre. La definizione adesso sta nel contratto; qui si CHIAMA.
import { misuraFreni } from "./contratto-prova.mjs";

const JSON_MODE = process.argv.includes("--json");
// AR-596 — il freno stretto, quello che pretende la mutazione DELLA LEZIONE. Non è acceso di
// default e la ragione è la solita: 24 lezioni su 65 non ce l'hanno, e un cancello che non può
// diventare verde viene aggirato al secondo giro. Con questo flag il numero diventa un'uscita 1,
// per chi vuole vedere il debito bloccare invece che solo comparire.
const SOLO_PROPRIE = process.argv.includes("--proprie");
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
  // LA MUTAZIONE È DEL FRENO, NON DELLA FRASE — e resta vero. Ventuno correzioni sulla stessa
  // famiglia puntano tutte allo stesso guardiano: pretendere ventuno mutazioni identiche sarebbe
  // copiatura travestita da rigore. Perciò un freno rotto da chiunque conta come freno provato.
  //
  // AR-596 — MA LE DUE COSE NON SONO LA STESSA, e prima finivano in un mucchio solo. «Questa lezione
  // ha la SUA mutazione» e «qualcun altro ha rotto lo stesso file» sono due gradi diversi, e il
  // secondo nascondeva il primo: il guardiano diceva «ogni gate può scattare davvero» mentre 24
  // lezioni su 65 non avevano nessuno che avesse mai rimesso il LORO errore. Adesso i due gradi si
  // vedono separati, e il totale non cambia: `veri` continua a contenerli tutti (nessun gate sparisce
  // dal conto), `propri` e `per_file` dicono di che pasta è fatto quel numero.
  const m = misuraFreni(lezioni, mutanti, esiste, leggi, fileDelComando);
  return {
    dichiarati: m.dichiarati,
    veri: [...m.veri, ...m.perFile],
    violazioni: m.violazioni,
    propri: m.veri,
    perFile: m.perFile,
  };
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
    console.log(JSON.stringify({ quando: nowPiacenza(), ...esito, senza_mutazione_propria: esito.perFile.length }, null, 2));
    process.exit(esito.violazioni.length || (SOLO_PROPRIE && esito.perFile.length) ? 1 : 0);
  }

  console.log(`\n🚦 GATE VERI — ${nowPiacenza()}\n`);
  console.log(`  Lezioni che dichiarano un gate: ${esito.dichiarati}`);
  console.log(`  Gate veri (comando + mutazione che lo fa scattare): ${esito.veri.length}`);
  // AR-596 — LA RIGA CHE MANCAVA. Il verde qui sopra è composto da due cose diverse, e senza questa
  // riga la seconda spariva dentro la prima: un freno «vero» perché qualcun ALTRO ha rotto lo stesso
  // file non è un freno che qualcuno ha visto scattare per QUESTA lezione. Un freno mai visto
  // scattare è una promessa, non un impedimento — ed è il conto che deve scendere.
  console.log(
    `  · di cui con la PROPRIA mutazione: ${esito.propri.length} · coperti solo dalla mutazione di un altro sullo stesso file: ${esito.perFile.length}\n`,
  );
  for (const v of esito.veri) {
    const suo = esito.propri.includes(v);
    console.log(`  ${suo ? "✅" : "🟡"} ${v.lezione} → ${v.gate}  (${v.mutazioni} mutazione/i${suo ? "" : " di un'altra lezione sullo stesso file"})`);
  }
  if (esito.perFile.length && !SOLO_PROPRIE) {
    console.log(
      `\n🟡 ${esito.perFile.length} freni su ${esito.dichiarati} non hanno la LORO mutazione: nessuno ha mai rimesso QUELL'errore.` +
        `\n   Non è un rosso qui — 21 correzioni sulla stessa famiglia puntano allo stesso guardiano, e pretendere 21 mutazioni` +
        `\n   identiche sarebbe copiatura travestita da rigore. Ma è il numero da far scendere: \`--proprie\` lo rende un'uscita 1.`,
    );
  }
  if (SOLO_PROPRIE && esito.perFile.length) {
    console.log(`\n❌ --proprie: ${esito.perFile.length} lezioni frenate senza la propria mutazione (${esito.perFile.map((x) => x.lezione).join(", ")}).`);
    process.exit(1);
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
