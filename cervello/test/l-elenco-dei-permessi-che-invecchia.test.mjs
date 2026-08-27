#!/usr/bin/env node
// 🧪 AR-206 — l'elenco che sostituisce il jolly, e che invecchiava in silenzio.
//
// Il difetto: nel foglio dei permessi ci sono due righe col jolly — `node cervello/*.mjs` e
// `bash cervello/*.sh`. Non dicono «può lanciare questi programmi»: dicono «può lanciare qualunque
// programma finisca in quella cartella», e quella cartella la scrive la macchina stessa. I freni
// veri vivono DENTRO i singoli script: col jolly si arriva al risultato senza passare dal freno.
//
// La cura — un elenco esplicito — è pronta dal 29/7 in `consegne/sicurezza/`, e la applica Nicola:
// `.claude/settings.json` è negato in scrittura alla macchina apposta, e scavalcare quel confine
// per chiudere un difetto sul confine sarebbe assurdo.
//
// IL DIFETTO NUOVO, misurato il 23/8: quell'elenco è tenuto a MANO. È già stato ritoccato una volta
// (il 13/8, cinque script nati dopo il 29/7), e oggi è indietro di **51**. Non è un dettaglio di
// manutenzione: il giorno che Nicola lo applica, quei 51 script smettono di partire. Cioè la cura
// rompe il giro, e la volta dopo nessuno la applica più. Un elenco che invecchia in silenzio è
// peggio di nessun elenco, perché sembra pronto.
//
// I casi sono costruiti: mordono anche col repo di oggi a posto.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { bloccoDaIncollare, elencoAmmesso, mancantiNellaConsegna, scriptLanciatiIn } from "../permessi-elenco.mjs";

// ─────────────────────────── chi lancia, e chi no ───────────────────────────

test("le cinque forme di lancio finiscono tutte nello stesso nome", () => {
  const testo = [
    "node cervello/giro-uno.mjs --flag",
    'node "$SCRIPT_DIR/giro-due.mjs"',
    "node $REPO/cervello/giro-tre.mjs",
    "node ./giro-quattro.mjs",
    "bash /opt/mycity/ad-mycity/cervello/vps/giro-cinque.sh",
  ].join("\n");
  const trovati = scriptLanciatiIn(testo);
  for (const atteso of ["giro-uno.mjs", "giro-due.mjs", "giro-tre.mjs", "giro-quattro.mjs", "vps/giro-cinque.sh"]) {
    assert.ok(trovati.has(atteso), `manca ${atteso}: le forme di lancio devono normalizzarsi tutte`);
  }
});

test("il percorso assoluto del VPS non perde la sua sottocartella", () => {
  assert.ok(scriptLanciatiIn("bash /opt/mycity/ad-mycity/cervello/vps/setup.sh").has("vps/setup.sh"));
});

test("AR-846 · un «..» in MEZZO al percorso esce come uno in testa", () => {
  // Trovato dalla lente della sicurezza sul perimetro di questo lotto, eseguendo invece di
  // rileggere. Il controllo guardava solo l'INIZIO: `startsWith("..")` fermava `../fuori.mjs` e
  // lasciava passare `cervello/a/../../../etc/passwd.mjs`, che dopo il taglio diventa
  // `a/../../../etc/passwd.mjs` — un nome che esce dal repo dentro l'ELENCO DEI PERMESSI.
  for (const fuori of [
    "node cervello/a/../../../etc/passwd.mjs",
    "node cervello/test/../../fuori.mjs",
    "bash cervello/vps/../../fuori.sh",
    "node cervello/../../fuori.mjs",
    "node ../fuori.mjs",
    "node /assoluto/x.mjs",
  ]) {
    assert.equal(scriptLanciatiIn(fuori).size, 0, `è passato: ${fuori}`);
  }
  // E il verso opposto, o sarebbe un controllo che blocca tutto: i percorsi normali restano.
  assert.ok(scriptLanciatiIn("node cervello/test/x.mjs").has("test/x.mjs"), "un percorso onesto è stato bloccato");
  assert.ok(scriptLanciatiIn("bash cervello/vps/setup.sh").has("vps/setup.sh"));
});

test("si taglia dalla PRIMA «cervello/», non dall'ultima", () => {
  // 27/8 — QUESTO CASO NON C'ERA, e il commento che c'era al posto suo diceva una cosa falsa:
  // sosteneva che con `lastIndexOf` il percorso del VPS qui sopra perdesse il segmento `vps/`.
  // Non è vero — lì «cervello/» compare una volta sola, e le due funzioni danno lo stesso indice.
  // Misurato sui lanci veri: ZERO ne contengono due. Ecco perché la mutazione che mette
  // `lastIndexOf` non faceva diventare rosso niente.
  //
  // La scelta resta giusta, e questo è il caso che la distingue davvero. È COSTRUITO, non pescato
  // dai dati di oggi: un percorso annidato. Con `lastIndexOf` il nome diventerebbe `x.mjs` e il
  // file risulterebbe «nominato ma non esiste» mentre esiste.
  const trovati = scriptLanciatiIn("node $REPO/cervello/test/cervello/x.mjs");
  assert.ok(trovati.has("test/cervello/x.mjs"), `tagliato dall'ultima occorrenza: ${[...trovati].join(", ")}`);
  assert.ok(!trovati.has("x.mjs"), "il segmento in mezzo è sparito");
});

test("un file citato in una frase non è un lancio", () => {
  // Contare le citazioni metterebbe nell'elenco file che nessuno avvia — cioè allargherebbe il
  // perimetro proprio mentre si dice di restringerlo.
  assert.equal(scriptLanciatiIn("il modulo cervello/una-libreria.mjs esporta due funzioni").size, 0);
  assert.equal(scriptLanciatiIn("vedi `cervello/altro.mjs` per i dettagli").size, 0);
});

test("un percorso che esce dalla cartella del cervello non entra nell'elenco", () => {
  assert.equal(scriptLanciatiIn("node ../fuori.mjs").size, 0);
  assert.equal(scriptLanciatiIn("node /usr/local/bin/qualcosa.mjs").size, 0);
});

// ─────────────────────────── l'elenco ───────────────────────────

const finto = (lanci, presenti) => ({
  leggi: (f) => (f in lanci ? lanci[f] : (() => { throw new Error("assente"); })()),
  esiste: (f) => presenti.has(f),
});

test("uno script lanciato ma NON presente sul disco resta fuori", () => {
  // Un permesso per un file che non esiste è un permesso che aspetta qualcuno che lo crei: è il
  // jolly, scritto una riga alla volta.
  const { leggi, esiste } = finto({ "cervello/giro.sh": "node cervello/mai-nato.mjs" }, new Set());
  const e = elencoAmmesso(leggi, esiste);
  assert.deepEqual(e.mjs, []);
  assert.deepEqual(e.nominati_ma_assenti, ["mai-nato.mjs"]);
});

test("uno script lanciato e presente entra, e il blocco è pronto da incollare", () => {
  const { leggi, esiste } = finto(
    { "cervello/giro.sh": "node cervello/vero.mjs\nbash cervello/vps/altro.sh" },
    new Set(["cervello/vero.mjs", "cervello/vps/altro.sh"]),
  );
  const e = elencoAmmesso(leggi, esiste);
  assert.deepEqual(e.mjs, ["vero.mjs"]);
  assert.deepEqual(e.sh, ["vps/altro.sh"]);
  const blocco = bloccoDaIncollare(e);
  assert.match(blocco, /"Bash\(node cervello\/vero\.mjs:\*\)"/);
  assert.match(blocco, /"Bash\(bash cervello\/vps\/altro\.sh:\*\)"/);
  assert.ok(!blocco.includes("*.mjs"), "il blocco non deve contenere nessun jolly: è quello che sostituisce");
});

test("una fonte illeggibile lascia l'elenco più STRETTO, non più largo", () => {
  // Se un lanciatore non si legge, la risposta prudente è «non aggiungo permessi», mai «li aggiungo
  // tutti». Un errore di lettura non deve poter allargare il perimetro.
  const { esiste } = finto({}, new Set(["cervello/x.mjs"]));
  const e = elencoAmmesso(() => { throw new Error("illeggibile"); }, esiste);
  assert.deepEqual(e.mjs, []);
});

// ─────────────────────────── IL DIFETTO NUOVO: la consegna che invecchia ───────────────────────────

test("IL CASO CHE HA GENERATO TUTTO: la consegna indietro si vede, script per script", () => {
  const elenco = { mjs: ["nuovo.mjs", "vecchio.mjs"], sh: ["vps/nuovo.sh"] };
  const consegna = '"Bash(node cervello/vecchio.mjs:*)",';
  assert.deepEqual(mancantiNellaConsegna(elenco, consegna), ["nuovo.mjs", "vps/nuovo.sh"]);
});

test("una consegna al passo non ha mancanti", () => {
  const elenco = { mjs: ["a.mjs"], sh: ["b.sh"] };
  const consegna = '"Bash(node cervello/a.mjs:*)",\n"Bash(bash cervello/b.sh:*)",';
  assert.deepEqual(mancantiNellaConsegna(elenco, consegna), []);
});

test("una consegna vuota li dichiara TUTTI mancanti, non zero", () => {
  // Un confronto contro il nulla che tornasse «nessun mancante» sarebbe il verde peggiore: direbbe
  // «pronta da applicare» su una consegna che non contiene niente.
  const elenco = { mjs: ["a.mjs"], sh: [] };
  assert.deepEqual(mancantiNellaConsegna(elenco, ""), ["a.mjs"]);
});

test("SUL REPO VERO: la consegna che Nicola ha in mano copre tutto quello che si lancia", () => {
  // È la prova che tiene la cura viva. Diventa rossa il giorno che qualcuno aggiunge uno script al
  // giro senza aggiornare l'elenco — cioè prima che Nicola applichi una lista che spegnerebbe il
  // programma appena nato.
  const radice = join(import.meta.dirname, "..", "..");
  const elenco = elencoAmmesso();
  const consegna = readFileSync(join(radice, "consegne/sicurezza/2026-07-29-permessi-senza-jolly.md"), "utf8");
  const mancanti = mancantiNellaConsegna(elenco, consegna);
  assert.deepEqual(
    mancanti,
    [],
    `la consegna è indietro di ${mancanti.length} script: applicarla così li spegnerebbe. Rigenera con \`node cervello/permessi-elenco.mjs\``,
  );
});
