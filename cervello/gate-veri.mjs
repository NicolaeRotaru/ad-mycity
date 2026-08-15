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
// 🚦 Il contratto dei codici d'uscita in un posto solo: qui non si ricopia il 2 a mano (AR-711).
import { CODICE, ciecoPerDatoIllegibile, codiceDiUscita } from "./esito-guardiano.mjs";
import { fileDelComando } from "./cancello-lotto.mjs";
// 📏 UNA DEFINIZIONE SOLA di «freno vero» (contratto-prova.mjs) — AR-565.
//
// Qui c'era una copia della regola, e da qualche parte ce n'era un'altra: due guardiani guardavano
// lo stesso mucchio di lezioni e ne davano verdetti opposti nello stesso giorno. Quando due numeri
// rispondono alla stessa domanda vince quello che finisce nella riga di riassunto, e in questa casa
// il verde vince sempre. La definizione adesso sta nel contratto; qui si CHIAMA.
import { misuraFreni } from "./contratto-prova.mjs";
// ⏳ AR-458 — la terza strada: un gate il cui file non c'è PUÒ essere un freno che aspetta un merge.
import { classificaGateAssente, notaDelGate, nascitaDellaLezione, GIORNI_ATTESA_MAX } from "./gate-in-attesa.mjs";

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
export function analizzaGate(lezioni = [], mutanti = [], esiste = () => false, leggi = () => null, { adesso = Date.now() } = {}) {
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

  // ⏳ AR-458 — LA TERZA STRADA. `misuraFreni` sa dire «il file del gate non esiste» ma non sa
  // perché: un freno mai costruito e un freno che sta in una PR non ancora mergiata escono da lì
  // con la stessa etichetta `gate-orfano`. Qui la si separa, con la nota della lezione alla mano.
  //
  // La voce NON esce dall'elenco delle violazioni — resta lì, visibile, col suo nome e la sua
  // gravità — ma smette di essere BLOCCANTE. Due ragioni per tenerla dentro invece che in un terzo
  // secchio: ① l'invariante «ogni gate dichiarato è o vero o violazione, nessuno sparisce dal
  // conto» continua a valere, ed è la difesa contro il modo più facile di far salire la pagella;
  // ② è la stessa forma del sorvegliante, che mette `gate-in-attesa` e `gate-orfano` nella stessa
  // lista con gravità diverse. Quello che cambia è chi fa uscire 1.
  const perId = new Map(lezioni.filter(Boolean).map((l) => [l?.id, l]));
  const violazioni = m.violazioni.map((v) => {
    if (v.regola !== "gate-orfano") return { ...v, bloccante: true, gravita: "grave" };
    const l = perId.get(v.lezione);
    const c = classificaGateAssente({ gateNota: notaDelGate(l), nato: nascitaDellaLezione(l), adesso });
    return {
      ...v,
      regola: c.classe,
      bloccante: c.bloccante,
      gravita: c.bloccante ? "grave" : "media",
      pr: c.pr,
      giorni_di_attesa: c.giorni,
      motivo: c.motivo,
    };
  });

  return {
    dichiarati: m.dichiarati,
    veri: [...m.veri, ...m.perFile],
    violazioni,
    // Chi fa uscire 1: le violazioni bloccanti. Le attese sono debito dichiarato, non falsi allarmi.
    bloccanti: violazioni.filter((v) => v.bloccante),
    inAttesa: violazioni.filter((v) => v.regola === "gate-in-attesa"),
    propri: m.veri,
    perFile: m.perFile,
  };
}

/**
 * IL CODICE D'USCITA, tirato fuori dal corpo del comando perché una prova lo possa ESEGUIRE (AR-458).
 *
 * Era la metà del difetto che non si vedeva: la distinzione fra «orfano» e «in attesa» non serve a
 * niente se poi il `process.exit(1)` guarda comunque tutto il mucchio. Le due strade del comando —
 * `--json` e il report a video — passano tutte e due di qui, così non se ne può riparare una sola.
 *
 * @param {{bloccanti:object[], perFile:object[]}} esito
 * @param {{soloProprie?:boolean}} opzioni
 * @returns {0|1}
 */
export function codiceUscitaGate(esito, { soloProprie = false } = {}) {
  const bloccanti = esito?.bloccanti?.length || 0;
  const senzaPropria = esito?.perFile?.length || 0;
  return bloccanti || (soloProprie && senzaPropria) ? 1 : 0;
}

/**
 * Il verdetto della misura, nelle tre risposte di casa. Pura.
 *
 * Un `esito` assente non è «zero violazioni»: è «non ho misurato». Passa di qui anche il percorso
 * cieco, così il codice d'uscita del cieco non è più un 2 ricopiato a mano in due punti.
 */
export function verdettoGate(esito, { soloProprie = false } = {}) {
  if (!esito) return ciecoPerDatoIllegibile("non ho potuto leggere i registri", { cosa: "i freni dichiarati" });
  const codice = codiceUscitaGate(esito, { soloProprie });
  if (codice === 1)
    return {
      stato: "rosso",
      motivo: `${esito.bloccanti.length} gate dichiarati che non possono scattare`,
      codice: CODICE.rosso,
    };
  return { stato: "verde", motivo: "ogni gate dichiarato può scattare davvero", codice: CODICE.verde };
}

/**
 * IL REFERTO IN JSON, CON LE STESSE CHIAVI QUALUNQUE SIA IL VERDETTO — AR-711.
 *
 * Il difetto: in `--json` la strada normale stampava `{quando, dichiarati, veri, violazioni, …}` e
 * la strada cieca `{ok, cieco, motivo}`. Nessun campo in comune. Chi legge fa `dati.violazioni.length`
 * e si becca un errore invece di una cecità dichiarata: la cecità c'era, ma detta in una lingua che
 * il lettore non parla — ed è la stessa malattia di un verde finto, perché chi si becca l'errore
 * quasi sempre lo ingoia e va avanti.
 *
 * La cura è un involucro solo, con il verdetto dentro (la forma di `verdettoCapacita`). Chi legge un
 * conto DEVE guardare prima `verdetto.stato`: quando è `cieco`, gli elenchi sono vuoti perché non è
 * stato guardato niente, e `misurato` lo dice a chiare lettere.
 *
 * Pura: entrano i dati, esce l'oggetto. Nessuna I/O, così una prova può confrontare le due forme.
 */
export function refertoGate({ quando, esito = null, verdetto }) {
  return {
    quando,
    // Le tre chiavi storiche della strada cieca: restano, così chi le leggeva continua a leggerle.
    ok: verdetto.stato === "verde",
    cieco: verdetto.stato === "cieco",
    motivo: verdetto.motivo,
    // La chiave che distingue «ho guardato e non c'era niente» da «non ho guardato».
    misurato: esito !== null,
    verdetto,
    dichiarati: esito?.dichiarati ?? 0,
    veri: esito?.veri ?? [],
    violazioni: esito?.violazioni ?? [],
    bloccanti: esito?.bloccanti ?? [],
    inAttesa: esito?.inAttesa ?? [],
    propri: esito?.propri ?? [],
    perFile: esito?.perFile ?? [],
    senza_mutazione_propria: esito?.perFile?.length ?? 0,
    in_attesa: esito?.inAttesa?.length ?? 0,
  };
}

function main() {
  let lezioni;
  let mutanti;
  try {
    lezioni = JSON.parse(readFileSync(APPRENDIMENTO, "utf8")).lezioni || [];
  } catch (e) {
    return esci(ciecoPerDatoIllegibile(e, { cosa: "apprendimento.json non leggibile: non posso misurare i gate" }));
  }
  try {
    mutanti = JSON.parse(readFileSync(MUTANTI, "utf8")).mutanti || [];
  } catch (e) {
    // Nessuna mutazione leggibile non è «nessun gate finto»: è non aver guardato.
    return esci(ciecoPerDatoIllegibile(e, { cosa: "mutanti.json non leggibile: non posso sapere se i gate sono mai scattati" }));
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
    const v = verdettoGate(esito, { soloProprie: SOLO_PROPRIE });
    console.log(JSON.stringify(refertoGate({ quando: nowPiacenza(), esito, verdetto: v }), null, 2));
    process.exit(codiceDiUscita(v));
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
    process.exit(codiceDiUscita(verdettoGate(esito, { soloProprie: SOLO_PROPRIE })));
  }
  // ⏳ AR-458 — le attese si mostrano, ma in giallo e senza far uscire 1. Prima finivano nel mucchio
  // dei rossi: un falso allarme a ogni lezione il cui freno stava in una PR non ancora mergiata, e
  // un guardiano che grida al lupo si impara a ignorare — compreso il giorno in cui ha ragione.
  if (esito.inAttesa.length) {
    console.log("");
    for (const v of esito.inAttesa) console.log(`  🟡 in attesa — ${v.lezione}\n     ${v.motivo}`);
    console.log(
      `\n🟡 ${esito.inAttesa.length} freni esistono in una PR non ancora mergiata: sono debito dichiarato, non difesa.` +
        `\n   Non è un rosso — ma l'attesa scade: dopo ${GIORNI_ATTESA_MAX} giorni torna un gate orfano, perché` +
        `\n   un'attesa senza fine è un'esenzione detta più lentamente.`,
    );
  }
  if (esito.bloccanti.length) {
    console.log("");
    for (const v of esito.bloccanti) console.log(`  ❌ ${v.regola} — ${v.lezione}\n     ${v.motivo}`);
    console.log(`\n❌ ${esito.bloccanti.length} gate dichiarati che non possono scattare.`);
    console.log(`   Un freno che non frena conta come freno solo nella pagella: è il modo di far salire`);
    console.log(`   il numero senza costruire la difesa. Aggiungi la mutazione, o togli il campo gate.`);
    process.exit(codiceDiUscita(verdettoGate(esito, { soloProprie: SOLO_PROPRIE })));
  }
  if (!esito.dichiarati) {
    console.log("  ⚪ nessuna lezione dichiara un gate: qui non c'è niente da misurare (ed è il problema).");
  } else if (esito.inAttesa.length) {
    console.log(`\n✅ nessun gate orfano — ${esito.inAttesa.length} però sono ancora in una PR: quelli non frenano finché non si mergia.`);
  } else {
    console.log(`✅ ogni gate dichiarato può scattare davvero.`);
  }
  process.exit(codiceDiUscita(verdettoGate(esito, { soloProprie: SOLO_PROPRIE })));
}

/**
 * L'uscita anticipata: qui ci si arriva solo quando NON si è potuto misurare.
 *
 * AR-711 — il referto passa dallo stesso involucro della strada normale. Prima cambiava forma, e un
 * lettore che cercava `violazioni` trovava un oggetto che non conosceva.
 */
function esci(verdetto) {
  if (JSON_MODE) console.log(JSON.stringify(refertoGate({ quando: nowPiacenza(), esito: null, verdetto }), null, 2));
  else console.error(`gate-veri: ${verdetto.motivo}`);
  process.exit(codiceDiUscita(verdetto));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
