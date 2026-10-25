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
import {
  bloccoDaIncollare,
  caricatiIn,
  conCartellaPropria,
  elencoAmmesso,
  lanciatoriIn,
  mancantiNellaConsegna,
  scriptLanciatiIn,
  toltiDallaConsegna,
} from "../permessi-elenco.mjs";

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

// ─────────────────────────── AR-1013: i lanci che passano da una funzione ───────────────────────────
//
// Il difetto, misurato il 25/10: AR-859 ha convertito le righe dei sensori del giro alla forma
// `sensore "taste-file.mjs" 2 --sonda`. Il `node` sta dentro la funzione, in `giro-esito.sh`, e la
// riga che lancia non lo nomina più. Lo strumento cercava solo `node x.mjs`: il 1/9 la consegna
// rigenerata ha perso cinque sensori senza che niente diventasse rosso, e il 25/10 rigenerarla ne
// avrebbe tolti altri due. Più nove script lanciati dai file che il giro e il worker caricano o
// lanciano, dove lo strumento non guardava proprio.

/** Le due funzioni di casa, nella forma che hanno davvero in `cervello/giro-esito.sh`. */
const ESITO = [
  "sensore() {",
  '  local _script="$1" _righe="${2:-3}"; shift 2 || shift',
  '  _out="$(node "${SCRIPT_DIR:-.}/$_script" "$@" 2>&1)"; _rc=$?',
  '  return "$_rc"',
  "}",
  "",
  "guardiano() {",
  '  local _script="$1"; shift',
  '  GUARDIANO_OUT="$(node "${SCRIPT_DIR:-.}/$_script" "$@" 2>&1)"; GUARDIANO_RC=$?',
  '  _marca_out="$(node "${SCRIPT_DIR:-.}/freno-scattato.mjs" "$_script" --rc "$GUARDIANO_RC" 2>&1)"',
  "}",
].join("\n");

test("AR-1013 · un lancio via `sensore` finisce nell'elenco", () => {
  const { leggi, esiste } = finto(
    {
      "cervello/giro.sh": [
        '. "$SCRIPT_DIR/giro-esito.sh"',
        '  sensore "taste-file.mjs" 2 --sonda || true',
        '  sensore "pota-apprendimento.mjs" 3 --se-serve || true',
      ].join("\n"),
      "cervello/giro-esito.sh": ESITO,
    },
    new Set(["cervello/taste-file.mjs", "cervello/pota-apprendimento.mjs"]),
  );
  const e = elencoAmmesso(leggi, esiste);
  for (const s of ["taste-file.mjs", "pota-apprendimento.mjs"]) {
    assert.ok(e.mjs.includes(s), `${s} si lancia via sensore ed è fuori dall'elenco: applicato, quel lancio smetterebbe di partire`);
  }
});

test("AR-1013 · anche `guardiano`, con e senza virgolette, dentro un `if !`, e il freno che lancia lui", () => {
  const { leggi, esiste } = finto(
    {
      "cervello/giro.sh": [
        '. "$SCRIPT_DIR/giro-esito.sh"',
        "  if ! guardiano tasso-lezioni.mjs --json; then",
        '  guardiano "allocazione-check.mjs" || true',
      ].join("\n"),
      "cervello/giro-esito.sh": ESITO,
    },
    new Set(["cervello/tasso-lezioni.mjs", "cervello/allocazione-check.mjs", "cervello/freno-scattato.mjs"]),
  );
  assert.deepEqual(elencoAmmesso(leggi, esiste).mjs, ["allocazione-check.mjs", "freno-scattato.mjs", "tasso-lezioni.mjs"]);
});

test("AR-1013 · il lanciatore si riconosce dal CORPO, non dal nome", () => {
  // Un nome nuovo che nessun elenco conosce: deve entrare da solo, o il difetto torna alla prima
  // funzione scritta domani.
  const testo = [
    "ts() { date '+%H:%M'; }",
    "controllo() {",
    '  node "$SCRIPT_DIR/$1" "$@"',
    "}",
    "stampa() {",
    '  node "$SCRIPT_DIR/fisso.mjs" "$1"',
    "}",
    "spento() {",
    '  local _script="$1"',
    '  # node "${SCRIPT_DIR:-.}/$_script" — la vecchia forma, lasciata come nota',
    '  echo "$_script"',
    "}",
  ].join("\n");
  const nomi = lanciatoriIn(testo);
  assert.ok(nomi.has("controllo"), "un lanciatore con un nome nuovo non è stato riconosciuto");
  assert.ok(!nomi.has("stampa"), "una funzione che lancia uno script FISSO non prende lo script dall'argomento");
  assert.ok(!nomi.has("ts"), "la funzione su una riga sola si è presa il corpo di quella dopo");
  assert.ok(!nomi.has("spento"), "un lancio in un commento non fa di una funzione un lanciatore");
});

test("AR-1013 · una funzione non si prende il corpo di quello che viene dopo, e la variabile è l'argomento", () => {
  // Tre casi trovati dalla rilettura indipendente. Ognuno lo ferma una difesa diversa, e
  // ognuno allargherebbe l'elenco: una funzione presa per lanciatore fa entrare ogni sua chiamata.
  //
  // ① la funzione su una riga con una coda dopo la graffa, seguita da codice di primo livello che
  //   lancia il proprio argomento: la riga sola finisce lì anche col commento in coda.
  const coda = ['log() { echo "$*"; }  # stampa', '_script="$1"', 'node "$SCRIPT_DIR/$_script"'].join("\n");
  assert.ok(!lanciatoriIn(coda).has("log"), "la funzione su una riga, con un commento in coda, si è presa le righe dopo");
  // ② una funzione rientrata dentro un `if`: la sua graffa non sta in colonna zero, quindi il corpo
  //   deve fermarsi al più tardi dove comincia la funzione successiva.
  const rientrata = ["if true; then", "  prima() {", "    echo uno", "  }", "fi", "dopo() {", '  node "$SCRIPT_DIR/$1"', "}"].join("\n");
  const nomi = lanciatoriIn(rientrata);
  assert.ok(!nomi.has("prima"), "la funzione rientrata si è presa il corpo di quella dopo");
  assert.ok(nomi.has("dopo"), "il lanciatore vero dopo una funzione rientrata è sparito");
  // ③ la variabile del lancio non è l'argomento: la funzione lancia uno script suo.
  const audit = ["audit() {", "  local f=fisso.mjs", '  node "$SCRIPT_DIR/$f" "$1"', "}"].join("\n");
  assert.ok(!lanciatoriIn(audit).has("audit"), "una funzione che lancia uno script SUO è stata presa per lanciatore");
  assert.ok(lanciatoriIn(['corre() {', '  local _s="$1"; shift', '  node "${SCRIPT_DIR:-.}/$_s" "$@"', "}"].join("\n")).has("corre"));
});

test("AR-1013 · la cartella del file stesso, `$dir/`, si legge come quella del giro", () => {
  // `motore-ai.sh` lancia `conto-motore.mjs` così, e non lo nominava nient'altro: era un lancio vero
  // fuori dall'elenco. Trovato dalla rilettura indipendente.
  const motore = [
    "  local dir out",
    '  dir="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"',
    '  out="$(node "$dir/conto-motore.mjs" --modello 2>/dev/null)" || out=""',
    '  altro="$HOME/attrezzi"',
    '  node "$altro/sconosciuto.mjs"',
  ].join("\n");
  const trovati = scriptLanciatiIn(conCartellaPropria("cervello/motore-ai.sh", motore));
  assert.ok(trovati.has("conto-motore.mjs"), "il lancio dalla cartella del file stesso è sparito");
  // Una variabile che non dice da sé dove punta resta sconosciuta, e resta fuori.
  assert.ok(!trovati.has("sconosciuto.mjs"), "una variabile qualunque è stata presa per la cartella del cervello");
  // Nella sottocartella del server la cartella propria è `vps/`, non la radice del cervello.
  const vps = ['D="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"', 'bash "$D/ripara.sh"'].join("\n");
  assert.ok(scriptLanciatiIn(conCartellaPropria("cervello/vps/giro-ora.sh", vps)).has("vps/ripara.sh"));
});

test("AR-1013 · una chiamata in un commento, o in una frase, non è un lancio", () => {
  const lanciatori = new Set(["sensore", "guardiano"]);
  assert.equal(scriptLanciatiIn("  # il guardiano firma-check.mjs ha detto rosso", lanciatori).size, 0);
  assert.equal(scriptLanciatiIn('# sensore "x.mjs" 2 — la vecchia forma', lanciatori).size, 0);
  // «guardiano» è anche una parola italiana: nei testi che non sono shell i lanciatori non valgono.
  const { leggi, esiste } = finto(
    { "CLAUDE.md": "il guardiano firma-check.mjs lo dice", "cervello/giro.sh": '. "$SCRIPT_DIR/giro-esito.sh"', "cervello/giro-esito.sh": ESITO },
    new Set(["cervello/firma-check.mjs"]),
  );
  assert.deepEqual(elencoAmmesso(leggi, esiste).mjs, []);
});

test("AR-1013 · le librerie CARICATE si leggono, e non entrano nell'elenco come script", () => {
  assert.deepEqual(
    [...caricatiIn(['. "$SCRIPT_DIR/a.sh"', 'source "$REPO/cervello/b.sh"', '  # . "$SCRIPT_DIR/c.sh"', "if x; then . \"$SCRIPT_DIR/d.sh\"; fi"].join("\n"))].sort(),
    ["a.sh", "b.sh", "d.sh"],
  );
  const { leggi, esiste } = finto(
    {
      "cervello/giro.sh": '. "$SCRIPT_DIR/lib-cadenza.sh"',
      "cervello/worker.sh": 'source "$SCRIPT_DIR/lib-esito.sh"',
      "cervello/lib-cadenza.sh": '  node "${SCRIPT_DIR:-cervello}/registra-cadenza.mjs" \\',
      "cervello/lib-esito.sh": '  x="$(PATCH=1 node "${SCRIPT_DIR:-cervello}/esito-scrittura.mjs" sync)"',
    },
    new Set(["cervello/lib-cadenza.sh", "cervello/lib-esito.sh", "cervello/registra-cadenza.mjs", "cervello/esito-scrittura.mjs"]),
  );
  const e = elencoAmmesso(leggi, esiste);
  assert.deepEqual(e.mjs, ["esito-scrittura.mjs", "registra-cadenza.mjs"]);
  // Una libreria caricata gira dentro chi la carica: non ha bisogno di un permesso suo.
  assert.deepEqual(e.sh, []);
});

test("AR-1013 · uno script di shell lanciato è un lanciatore anche lui", () => {
  const { leggi, esiste } = finto(
    {
      "cervello/giro.sh": '_hook_out="$(bash "$SCRIPT_DIR/installa-hooks.sh" 2>&1)"',
      "cervello/installa-hooks.sh": 'VERDETTO="$(node "$SCRIPT_DIR/istante-cancello.mjs" aggancio)"',
    },
    new Set(["cervello/installa-hooks.sh", "cervello/istante-cancello.mjs"]),
  );
  const e = elencoAmmesso(leggi, esiste);
  assert.deepEqual(e.sh, ["installa-hooks.sh"]);
  assert.deepEqual(e.mjs, ["istante-cancello.mjs"]);
});

test("AR-1013 · un permesso già scritto non è un lancio", () => {
  // `motore-ai.sh` porta una lista di permessi, e uno è per `git-github.mjs`: un modulo senza
  // comando. Contarla avrebbe allargato il perimetro proprio mentre lo si stringe.
  assert.equal(scriptLanciatiIn('local _allowed="${AI_ALLOWED_TOOLS:-Bash(node cervello/git-github.mjs:*),Bash(git add:*)}"').size, 0);
  assert.equal(scriptLanciatiIn('"Bash(bash cervello/vps/setup.sh:*)",').size, 0);
  assert.ok(scriptLanciatiIn("Bash(node cervello/a.mjs:*) e poi node cervello/b.mjs").has("b.mjs"), "il lancio vero accanto al permesso è sparito");
});

test("AR-1013 · il verso che nessuno guardava: chi esce dalla consegna si vede", () => {
  const consegna = '"Bash(node cervello/resta.mjs:*)",\n"Bash(node cervello/sparito.mjs:*)",\n"Bash(bash cervello/vps/via.sh:*)",';
  assert.deepEqual(toltiDallaConsegna({ mjs: ["resta.mjs"], sh: [] }, consegna), ["sparito.mjs", "vps/via.sh"]);
  assert.deepEqual(toltiDallaConsegna({ mjs: ["resta.mjs"], sh: [] }, '"Bash(node cervello/resta.mjs:*)",'), []);
});

test("AR-1013 · SUL REPO VERO: ogni `sensore` e `guardiano` del giro finisce nell'elenco", () => {
  // L'oracolo è scritto a mano APPOSTA: i due nomi e la forma della chiamata, cercati con una regola
  // che non è quella dello strumento. Se lo strumento smette di riconoscere uno dei due, o una riga
  // nuova del giro chiama uno script in una forma che non legge, questa prova diventa rossa.
  const radice = join(import.meta.dirname, "..", "..");
  const chiamati = new Set();
  for (const riga of readFileSync(join(radice, "cervello/giro.sh"), "utf8").split("\n")) {
    if (/^\s*#/.test(riga)) continue;
    const m = riga.match(/\b(?:sensore|guardiano)\s+["']?([\w./-]+\.mjs)/);
    if (m) chiamati.add(m[1]);
  }
  assert.ok(chiamati.size >= 2, `trovati solo ${chiamati.size} lanci via funzione nel giro: l'oracolo non sta guardando`);
  const elenco = elencoAmmesso();
  const fuori = [...chiamati].filter((s) => !elenco.mjs.includes(s));
  assert.deepEqual(fuori, [], `lanciati via sensore/guardiano ma fuori dall'elenco: ${fuori.join(", ")}`);
  const esito = readFileSync(join(radice, "cervello/giro-esito.sh"), "utf8");
  for (const n of ["sensore", "guardiano"]) assert.ok(lanciatoriIn(esito).has(n), `${n} non è riconosciuto come lanciatore in giro-esito.sh`);
});

test("AR-1013 · SUL REPO VERO: la consegna non porta script che lo strumento non vede più lanciare", () => {
  // È la prova che il 1/9 mancava. Quando una riga del giro cambia forma e lo strumento non la
  // legge, l'elenco perde lo script e la consegna lo porta ancora: qui diventa rosso PRIMA che una
  // rigenerazione lo tolga in silenzio.
  const radice = join(import.meta.dirname, "..", "..");
  const consegna = readFileSync(join(radice, "consegne/sicurezza/2026-07-29-permessi-senza-jolly.md"), "utf8");
  const tolti = toltiDallaConsegna(elencoAmmesso(), consegna);
  assert.deepEqual(
    tolti,
    [],
    `la consegna porta ${tolti.length} script che lo strumento non vede più lanciare: ${tolti.join(", ")}. ` +
      "O non li lancia più nessuno (rigenera con `node cervello/permessi-elenco.mjs --consegna`), o li lancia una forma che lo strumento non legge (insegnagliela).",
  );
});

test("AR-1013 · SUL REPO VERO: la card #42 che Nicola applica copre tutto quello che si lancia", (t) => {
  // La card porta il materiale DENTRO (AR-524), quindi è una seconda copia dell'elenco. Il 25/10 era
  // indietro di 19, perché nessuno la confrontava con niente: `materiale-in-mano.mjs` sa che il
  // blocco c'è, non se è giusto, e lo dice lui stesso.
  const radice = join(import.meta.dirname, "..", "..");
  const coda = readFileSync(join(radice, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md"), "utf8");
  const inizio = coda.search(/^### .*#42 —/m);
  if (inizio === -1) return t.skip("la card #42 non è più in coda: non c'è niente da confrontare");
  const fine = coda.indexOf("\n### ", inizio + 1);
  const card = coda.slice(inizio, fine === -1 ? undefined : fine);
  if (/✅ FATTO/.test(card)) return t.skip("la card #42 è fatta: il gesto è già passato");
  const mancanti = mancantiNellaConsegna(elencoAmmesso(), card);
  assert.deepEqual(
    mancanti,
    [],
    `la card #42 è indietro di ${mancanti.length} script: applicata così li spegnerebbe. Rifai i due blocchi da \`node cervello/permessi-elenco.mjs\`.`,
  );
});
