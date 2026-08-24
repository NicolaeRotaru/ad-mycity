#!/usr/bin/env node
// 🧪 AR-798 — IL CODICE SI SPOSTA, IL PUNTATORE RESTA INDIETRO, E IL COMANDO CONTINUA A USCIRE 0.
//
// Il conto vero, misurato il 23/8/2026 sul cantiere: 592 schede con una prova a comando, 546
// ancorate (il file che il comando esegue — o il comando stesso — nomina l'AR della scheda), 46 no.
// Di quei 46 il cancello del lotto oggi ne prende ZERO: `proveCondiviseCieche` gira solo sulle
// schede APERTE e solo se due o più difetti condividono lo stesso comando — e sono 45 chiuse più
// una (AR-780) il cui comando non lo condivide con nessuno.
//
// LA MOSSA CHE RIPRODUCE IL MALE non è una scheda scritta male: è un'ESTRAZIONE. Si prende un albero
// sano, si porta il caso in un file nuovo e si lascia il puntatore dov'era. Il file vecchio esiste
// ancora, gira ancora, esce ancora 0 — e non guarda più niente. È il caso ③ qui sotto, ed è la
// fotografia di quello che è successo ad AR-689, la cui prova
// (`cervello/test/segreto-in-un-nome-con-l-accento.test.mjs`) non contiene «AR-689» da nessuna parte.
//
// Perché `node --test` non aiuta, misurato e non dedotto (node v22.22.2): un file che ESISTE con
// ZERO casi esce 0, e un glob che non prende niente esce 0. Il file che SPARISCE è rumoroso — ma lo
// è solo per una scheda su cinquanta, e i tre casi nuovi qui sotto nascono proprio da lì.
//
// ═══ I CASI NATI DALLE BOCCIATURE (verifiche avversariali del 23/8) ═══
// · IL RINOMINO — la prima versione trattava «file assente» come «zero scollegati». Rinominando UN
//   file di prova condiviso da 23 schede il conto scendeva da 52 a 42, l'uscita restava 0 e il freno
//   invitava ad ABBASSARE il tetto: premiava la mossa che deve punire. Adesso quel caso è ⚪.
// · IL VERDE MUTO — con zero file controllati il freno diceva «ogni prova nomina ancora il suo
//   difetto». Il denominatore c'era nel JSON ma non toccava l'uscita (AR-660, capito per il registro
//   vuoto e non applicato al caso gemello). Adesso `controllati === 0` è ⚪.
// · IL TETTO NATO GIÀ SUPERATO — 52 era misurato su un albero che non conteneva la scheda del lotto
//   in cui questo freno nasce: montandolo il cancello si bloccava per tutti, la malattia
//   AR-506/511/514/526/534 rifatta mentre la si curava. Il caso in fondo monta la scheda e pretende
//   `quanti <= tetto`.
// · IL LIMITE DICHIARATO (terza verifica) — l'estrazione ha DUE forme, e il caso qui sotto ne metteva
//   in scena una sola: quella in cui l'intestazione se ne va insieme al caso. Nella forma normale di
//   questa casa — «in cima al file il commento che racconta il difetto» — l'intestazione RESTA, il
//   file nomina ancora il difetto e il freno esce 0 sopra il difetto in funzione. Non lo si può
//   chiudere senza bocciare il 42% delle schede nuove, quindi è un buco: ma un buco CONTATO
//   (`ancorate_solo_commento`) e sotto un caso che lo asserisce.
// · IL COMANDO CHE PORTA IL PROPRIO ID (terza verifica) — sei accuse su 52 erano false: il comando
//   nominava il difetto e andava a rompergli il fix apposta. Il conto è sceso da 52 a 46.
// · LA PORTA DEL «NIENTE COMANDO» (terza verifica) — convertire le schede a `verifica:{tipo:"umano"}`
//   faceva scendere il conto in silenzio con l'invito ad abbassare il tetto.
//
// Tutto su un albero FINTO in una cartella temporanea: il repo vero lo si tocca solo nei casi di
// calibrazione in fondo, che sono l'unica parte che nessuno può falsificare a tavolino.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, renameSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { scollegati, verdettoPuntatori, ancorata, ancoraSoloCommento, parteDiCodice, mutazioniPerDifetto, doveAncora, fineIntestazione, apreUnCaso, ancoraggioDalComando, idComeOpzione } from "../puntatori-scollegati.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const MOTORE = join(QUI, "..", "puntatori-scollegati.mjs");
const REPO = join(QUI, "..", "..");
const CANTIERE_VERO = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
const TETTI_VERI = join(REPO, "cervello", "tetti-lotto.json");

/**
 * Un albero finto: tre schede, ognuna con la sua prova, ognuna che nomina il suo difetto.
 * È il caso SANO — da qui in poi il male si produce spostando un caso, non scrivendo male una scheda.
 */
function alberoSano({ tetto = 0 } = {}) {
  const tmp = mkdtempSync(join(tmpdir(), "puntatori-"));
  mkdirSync(join(tmp, "cervello", "test"), { recursive: true });
  const difetti = [];
  for (const n of [1, 2, 3]) {
    writeFileSync(
      join(tmp, "cervello", "test", `finta-${n}.test.mjs`),
      `// AR-${n} — il caso che dimostra il difetto ${n}.\ntest("AR-${n}", () => {});\n`,
      "utf8",
    );
    difetti.push({ id: `AR-${n}`, stato: "chiuso", verifica: { comando: `node cervello/test/finta-${n}.test.mjs` } });
  }
  writeFileSync(join(tmp, "cantiere.json"), JSON.stringify({ difetti }), "utf8");
  writeFileSync(join(tmp, "tetti.json"), JSON.stringify({ puntatori_scollegati: tetto }), "utf8");
  return tmp;
}

/**
 * L'ambiente per i casi che misurano il REPO VERO, spogliato delle tre chiavi che pilotano il
 * motore. Senza questa pulizia i casi di calibrazione ereditano CANTIERE_FILE/TETTI_FILE/
 * PUNTATORI_RADICE da chi lancia la suite: una lente della verifica è riuscita a sterzarli da fuori
 * proprio così. Un caso che si può sterzare dall'esterno è un caso che un giorno misura un albero
 * che non è il repo.
 */
function ambiente(extra = {}) {
  const env = { ...process.env };
  delete env.PUNTATORI_RADICE;
  delete env.CANTIERE_FILE;
  delete env.TETTI_FILE;
  delete env.MUTANTI_FILE;
  return { ...env, ...extra };
}

/** Il motore lanciato sull'albero finto, con registro, tetto e radice iniettati. */
function gira(tmp, args = [], extra = {}) {
  return spawnSync("node", [MOTORE, ...args], {
    encoding: "utf8",
    env: ambiente({
      PUNTATORI_RADICE: tmp,
      CANTIERE_FILE: join(tmp, "cantiere.json"),
      TETTI_FILE: join(tmp, "tetti.json"),
      ...extra,
    }),
  });
}

function conTetto(tmp, tetto) {
  writeFileSync(join(tmp, "tetti.json"), JSON.stringify({ puntatori_scollegati: tetto }), "utf8");
}

function via(tmp) {
  rmSync(tmp, { recursive: true, force: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// VERSO VERDE — sa dire di sì.

test("VERDE: tre puntatori che nominano ancora il loro difetto passano, e il tetto 0 regge", () => {
  const tmp = alberoSano({ tetto: 0 });
  try {
    const r = gira(tmp, ["--json"]);
    assert.equal(r.status, 0, `atteso verde, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    const j = JSON.parse(r.stdout);
    assert.equal(j.quanti, 0, "nessun puntatore scollegato su un albero sano");
    assert.equal(j.esito, "ok");
  } finally {
    via(tmp);
  }
});

test("il verde NON è comprato dal non guardare: dichiara di aver controllato tutti e 3 i puntatori", () => {
  // AR-660: un elenco vuoto e un elenco non guardato si distinguono solo se il DENOMINATORE è in
  // chiaro. Senza questo caso, un motore che salta ogni scheda passerebbe il caso qui sopra.
  const tmp = alberoSano({ tetto: 0 });
  try {
    const j = JSON.parse(gira(tmp, ["--json"]).stdout);
    assert.equal(j.controllati, 3, "tre schede guardate davvero, non zero schede saltate in silenzio");
    assert.equal(j.saltati, 0);
  } finally {
    via(tmp);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// VERSO ROSSO — sa dire di no, e per il motivo giusto.

/**
 * L'ESTRAZIONE: il caso di AR-2 emigra in un file nuovo e il puntatore resta indietro.
 * Nessuna scheda viene toccata. `finta-2.test.mjs` esiste ancora, gira ancora, esce ancora 0.
 */
function estraiIlCasoDiAr2(tmp) {
  writeFileSync(join(tmp, "cervello", "test", "finta-4.test.mjs"), `// AR-2 — il caso è emigrato qui.\ntest("AR-2", () => {});\n`, "utf8");
  writeFileSync(join(tmp, "cervello", "test", "finta-2.test.mjs"), `// il caso se n'è andato, il file è rimasto.\ntest("altro", () => {});\n`, "utf8");
}

test("ROSSO: il caso emigra in un file nuovo, il puntatore resta indietro → 1 scollegato, uscita 1", () => {
  const tmp = alberoSano({ tetto: 0 });
  try {
    estraiIlCasoDiAr2(tmp);
    const r = gira(tmp);
    assert.equal(r.status, 1, `atteso rosso dopo l'estrazione, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    // Un rosso che non dice CHI manda a cercare a mano: si asserisce il nome, non solo il codice.
    assert.match(r.stdout, /AR-2\b/, "il rosso deve nominare il difetto che ha perso il puntatore");
    assert.match(r.stdout, /finta-2\.test\.mjs/, "…e il file che ha smesso di nominarlo");
  } finally {
    via(tmp);
  }
});

test("il file estratto ESISTE e GIRA: non è il caso di `proveOrfane`, che guarda i file spariti", () => {
  const tmp = alberoSano({ tetto: 0 });
  try {
    estraiIlCasoDiAr2(tmp);
    // Il file di AR-2 c'è ancora ed esce 0 da solo: è precisamente perché è verde che serve un freno.
    const suo = spawnSync("node", ["--test", join(tmp, "cervello", "test", "finta-2.test.mjs")], { encoding: "utf8" });
    assert.notEqual(suo.status, 2, "il file esiste: se fosse sparito lo prenderebbe già proveOrfane");
    const j = JSON.parse(gira(tmp, ["--json"]).stdout);
    assert.equal(j.quanti, 1);
    assert.equal(j.scollegati[0].id, "AR-2");
    assert.equal(j.scollegati[0].file, "cervello/test/finta-2.test.mjs");
    assert.equal(j.saltati, 0, "nessuna scheda saltata: il file c'è, l'ho letto, e non nomina più il suo difetto");
  } finally {
    via(tmp);
  }
});

test("A DECIDERE È IL DELTA, NON IL VALORE ASSOLUTO: stesso albero, tetto 1 verde e tetto 0 rosso", () => {
  const tmp = alberoSano({ tetto: 0 });
  try {
    estraiIlCasoDiAr2(tmp);
    conTetto(tmp, 1);
    assert.equal(gira(tmp).status, 0, "un puntatore scollegato sotto il tetto è debito ereditato: si conta, non blocca");
    conTetto(tmp, 0);
    assert.equal(gira(tmp).status, 1, "lo stesso albero oltre il tetto è una regressione: blocca");
  } finally {
    via(tmp);
  }
});

test("un QUARTO scollegato con tetto 3 è comunque rosso: il debito si è allargato", () => {
  const tmp = alberoSano({ tetto: 3 });
  try {
    // Tutti e tre perdono il puntatore, più un quarto difetto nuovo che nasce già scollegato.
    for (const n of [1, 2, 3]) writeFileSync(join(tmp, "cervello", "test", `finta-${n}.test.mjs`), "// vuoto\n", "utf8");
    writeFileSync(join(tmp, "cervello", "test", "finta-5.test.mjs"), "// vuoto\n", "utf8");
    const c = JSON.parse(readFileSync(join(tmp, "cantiere.json"), "utf8"));
    c.difetti.push({ id: "AR-5", stato: "aperto", verifica: { comando: "node cervello/test/finta-5.test.mjs" } });
    writeFileSync(join(tmp, "cantiere.json"), JSON.stringify(c), "utf8");
    const r = gira(tmp);
    assert.equal(r.status, 1, `4 scollegati contro un tetto di 3 deve bloccare, uscito ${r.status}:\n${r.stdout}`);
  } finally {
    via(tmp);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// VERSO CIECO — ⚪ non è verde. E qui stanno i due casi che hanno bocciato la prima versione.

test("IL RINOMINO: il file si sposta col `mv`, il puntatore resta sul nome vecchio → il conto SCENDE e NON è verde", () => {
  // È IL CASO CHE HA BOCCIATO LA PRIMA VERSIONE, riprodotto in piccolo. Sul repo vero: rinominato
  // `cervello/test/sorvegliante.test.mjs`, che 23 schede puntano, il conto è passato da 52 a 42,
  // l'uscita è rimasta 0 e il freno ha stampato «abbassa il tetto». Abbassandolo in buona fede, 10
  // puntatori rotti veri sparivano dal conto per sempre — il freno premiava la mossa da punire.
  const tmp = alberoSano({ tetto: 1 });
  try {
    estraiIlCasoDiAr2(tmp);
    assert.equal(gira(tmp).status, 0, "punto di partenza: 1 scollegato pari al tetto 1, verde");

    renameSync(join(tmp, "cervello", "test", "finta-2.test.mjs"), join(tmp, "cervello", "test", "finta-2-rinominato.test.mjs"));

    const r = gira(tmp, ["--json"]);
    const j = JSON.parse(r.stdout);
    assert.equal(j.quanti, 0, "il conto SCENDE per davvero: la trappola è misurata, non temuta");
    assert.equal(r.status, 2, `un puntatore che punta a un file che non c'è è ⚪, non un verde col conto in calo (uscito ${r.status}):\n${r.stdout}${r.stderr}`);
    assert.equal(j.esito, "cieco");
    assert.equal(j.saltati, 1, "il file assente si conta…");
    assert.ok(
      j.ciechi.some((c) => c.includes("finta-2.test.mjs")),
      "…e si NOMINA fra i ciechi: chi legge deve sapere quale puntatore è rotto",
    );
    assert.ok(!/abbassa il tetto/.test(j.motivo), "e non si invita ad abbassare il tetto su un conto sceso perché ho smesso di guardare");
  } finally {
    via(tmp);
  }
});

test("VERDE MUTO: zero file controllati non è «nessun puntatore scollegato» — è non aver guardato", () => {
  // L'altra metà della stessa bocciatura, nella forma più pura: nessun cieco da dichiarare, conto 0,
  // tetto 0 — cioè «pari al tetto», il verde perfetto. Qui a salvare può essere SOLO il denominatore.
  // Sul cantiere vero la lente l'ha visto con 592 saltati e 0 controllati: uscita 0 e a video «ogni
  // prova nomina ancora il suo difetto».
  const tmp = alberoSano({ tetto: 0 });
  try {
    writeFileSync(
      join(tmp, "cantiere.json"),
      JSON.stringify({
        difetti: [
          { id: "AR-1", stato: "aperto", verifica: { tipo: "umano" } },
          { id: "AR-2", stato: "chiuso", verifica: { tipo: "umano" } },
          { id: "AR-3", stato: "chiuso", verifica: { tipo: "umano" } },
        ],
      }),
      "utf8",
    );
    const r = gira(tmp, ["--json"]);
    const j = JSON.parse(r.stdout);
    assert.equal(j.controllati, 0, "nessun file di prova letto");
    assert.equal(j.ciechi.length, 0, "e nemmeno un cieco da dichiarare: è il caso in cui solo il denominatore può salvarti");
    assert.equal(r.status, 2, `0 su 0 controllati deve essere ⚪, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.equal(j.esito, "cieco");
    assert.match(j.motivo, /0 controllati/, "e il motivo deve dire perché, non un «ok» generico");
  } finally {
    via(tmp);
  }
});

test("CIECO: il TETTO illeggibile è ⚪ anche lui — è la stessa radice, dall'altra porta", () => {
  // Misurato sulla prima versione: `TETTI_FILE=<una cartella>` → EXIT=0, esito «debito», tetto null.
  // Il ⚪ veniva stampato e non toccava l'uscita: un altro canale di ignoranza fuori dal verdetto,
  // identico a quello che ha bocciato il freno. Senza tetto non si può nemmeno dire se il debito si
  // è allargato: chiamarlo «debito» e uscire 0 è dichiarare una cosa che non si è misurata.
  const tmp = alberoSano({ tetto: 0 });
  try {
    estraiIlCasoDiAr2(tmp);
    rmSync(join(tmp, "tetti.json"));
    mkdirSync(join(tmp, "tetti.json")); // una cartella al posto del file: esiste e non si legge
    const r = gira(tmp, ["--json"]);
    const j = JSON.parse(r.stdout);
    assert.equal(j.tetto, null, "il tetto non l'ho letto");
    assert.equal(r.status, 2, `tetto illeggibile → ⚪, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    assert.equal(j.esito, "cieco");
    assert.ok(j.ciechi.some((c) => c.includes("tetti-lotto.json")), "e va detto quale ⚪");
  } finally {
    via(tmp);
  }
});

test("CIECO: registro assente → uscita 2 esatta, non «diverso da 0»", () => {
  const tmp = alberoSano({ tetto: 0 });
  try {
    rmSync(join(tmp, "cantiere.json"));
    // Si asserisce il 2: se domani scivola a 1 la CI diventa rossa per un motivo inventato, se
    // scivola a 0 il freno si spegne in silenzio. Sono due guasti diversi e vanno distinti.
    assert.equal(gira(tmp).status, 2, "un registro che non c'è non è «nessuno scollegato»");
  } finally {
    via(tmp);
  }
});

test("CIECO: un registro SENZA schede non è un verde — è un verde comprato non guardando", () => {
  const tmp = alberoSano({ tetto: 0 });
  try {
    writeFileSync(join(tmp, "cantiere.json"), JSON.stringify({ difetti: [] }), "utf8");
    assert.equal(gira(tmp).status, 2);
  } finally {
    via(tmp);
  }
});

test("CIECO: un file di prova illeggibile esce 2 e viene NOMINATO fra i ciechi, mai contato verde", () => {
  const tmp = alberoSano({ tetto: 0 });
  try {
    // Una CARTELLA al posto del file: `readFileSync` dà EISDIR anche da root, mentre `chmod 000` no
    // (e questa suite gira da root in CI). Il file «esiste» per `existsSync` e non si legge: è
    // esattamente la condizione «non ho potuto guardare».
    rmSync(join(tmp, "cervello", "test", "finta-2.test.mjs"));
    mkdirSync(join(tmp, "cervello", "test", "finta-2.test.mjs"));
    const r = gira(tmp, ["--json"]);
    assert.equal(r.status, 2, `atteso cieco, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
    const j = JSON.parse(r.stdout);
    assert.equal(j.esito, "cieco");
    assert.ok(
      j.ciechi.some((c) => c.includes("finta-2.test.mjs")),
      "il file che non ho potuto leggere va nominato, non nascosto in un totale",
    );
  } finally {
    via(tmp);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LE FUNZIONI PURE — si ESEGUONO, non si cercano a parole.

test("il confronto NON è sensibile al caso: `--ar-158` ancora AR-158 quanto «AR-158»", () => {
  // Non è teoria: 5 schede vere (AR-158, AR-206, AR-392, AR-730, AR-737) hanno la prova migrata a
  // `node cervello/prove-difetti.mjs --ar-158`, che scrive la bandierina minuscola. Col confronto
  // sensibile al caso risulterebbero scollegate pur essendo ancorate benissimo.
  assert.equal(ancorata("node cervello/prove-difetti.mjs --ar-158", "AR-158"), true);
  assert.equal(ancorata("// AR-158 il caso", "AR-158"), true);
  assert.equal(ancorata("// nessun riferimento qui", "AR-158"), false);
});

test("il file che NON C'È e il comando senza file finiscono fra i CIECHI, non fra i saltati muti", () => {
  // QUESTA RIGA PRIMA DICEVA IL CONTRARIO, e il contrario poggiava su una difesa falsa: «li prende
  // già proveOrfane». Verificata falsa a runtime — `cancello-lotto.mjs` riga 674 chiama
  // `proveOrfane(aperti, esiste)`, solo gli APERTI, e 578 delle 592 prove a comando (98%) stanno su
  // schede CHIUSE. Cioè il 98% della popolazione che dichiaravo sorvegliata non aveva nessun
  // guardiano sull'esistenza del file. Adesso quel caso è mio, e lo dichiaro ⚪.
  const difetti = [
    { id: "AR-1", verifica: { comando: "npm test" } }, // nessun file nel comando
    { id: "AR-2", verifica: { comando: "node cervello/sparito.mjs" } }, // file assente
    { id: "AR-3", verifica: { tipo: "umano" } }, // nessun comando
  ];
  const r = scollegati(difetti, () => "niente", () => false);
  assert.equal(r.scollegati.length, 0, "non li ACCUSO: non so niente di loro, ed è un'altra cosa");
  assert.equal(r.controllati, 0, "e non li conto nemmeno fra i controllati: non ho letto niente");
  assert.equal(r.saltati, 2);
  assert.equal(r.ciechi.length, 2, "stanno tutti e due fra i ciechi: ⚪, non uno zero");
  assert.ok(r.ciechi.some((c) => c.includes("AR-1")), "il comando che non nomina nessun file va detto con la sua scheda");
  assert.ok(r.ciechi.some((c) => c.includes("cervello/sparito.mjs")), "il file che non c'è va NOMINATO");
  // La scheda SENZA comando invece resta fuori dalla popolazione, ed è voluto: se la contassi cieca
  // questo freno nascerebbe ⚪ per sempre, perché 195 schede su 787 non hanno una prova a comando.
  assert.equal(r.ciechi.filter((c) => c.includes("AR-3")).length, 0, "niente comando, niente domanda: non è ignoranza");
});

test("un cieco non diventa verde nemmeno sotto il tetto, e una violazione misurata resta rossa", () => {
  assert.equal(verdettoPuntatori({ quanti: 0, tetto: 52, ciechi: 1, controllati: 10 }).esito, "cieco", "⚪ non è verde");
  assert.equal(verdettoPuntatori({ quanti: 53, tetto: 52, ciechi: 1, controllati: 10 }).esito, "violazione", "un rosso misurato batte un cieco");
  assert.equal(verdettoPuntatori({ quanti: 52, tetto: 52, ciechi: 0, controllati: 592 }).esito, "ok");
  assert.equal(verdettoPuntatori({ quanti: 51, tetto: 52, ciechi: 0, controllati: 592 }).esito, "debito", "sceso: si abbassa il tetto");
  assert.equal(verdettoPuntatori({ quanti: 7, tetto: null, ciechi: 0, controllati: 592 }).esito, "debito", "senza tetto il numero si dichiara, non si tace");
});

test("il DENOMINATORE entra nel verdetto, e il default cade dalla parte del «non so»", () => {
  assert.equal(verdettoPuntatori({ quanti: 0, tetto: 52, ciechi: 0, controllati: 0 }).esito, "cieco", "0 controllati non è mai un «ok»");
  assert.equal(
    verdettoPuntatori({ quanti: 40, tetto: 52, ciechi: 0, controllati: 0 }).esito,
    "cieco",
    "nemmeno un conto SCESO compra un «abbassa il tetto» senza aver guardato niente",
  );
  // Il default 0 è la parte che conta: chi chiama la funzione e si dimentica il denominatore
  // ottiene ⚪, non un verde. Un default deve cadere dalla parte del non so.
  assert.equal(verdettoPuntatori({ quanti: 0, tetto: 52, ciechi: 0 }).esito, "cieco", "denominatore dimenticato → ⚪, mai verde");
});

// ─────────────────────────────────────────────────────────────────────────────
// I TRE CASI NATI DALLA TERZA VERIFICA. Uno per accusa, e il primo asserisce un LIMITE: se domani
// qualcuno lo «ripara» senza accorgersene, questi casi diventano rossi e glielo dicono.

/**
 * L'ESTRAZIONE NELLA FORMA VERA DI QUESTA CASA: il caso di AR-2 emigra in un file nuovo e
 * L'INTESTAZIONE RESTA DOV'ERA. È la forma normale, perché il mandato con cui si consegna un lotto
 * dice «in cima al file il commento che racconta il difetto vero che chiude».
 */
function estraiLasciandoLIntestazione(tmp) {
  writeFileSync(join(tmp, "cervello", "test", "finta-4.test.mjs"), `// AR-2 — il caso è emigrato qui.\ntest("AR-2", () => {});\n`, "utf8");
  // L'intestazione col nome del difetto resta; sotto non c'è più il caso di AR-2.
  writeFileSync(join(tmp, "cervello", "test", "finta-2.test.mjs"), `// AR-2 — il caso che dimostra il difetto 2.\ntest("altro", () => {});\n`, "utf8");
}

test("IL LIMITE DICHIARATO: il caso emigra e l'intestazione resta → NON lo vedo, e lo dico col numero", () => {
  // È L'ACCUSA CHE HA BOCCIATO LA SECONDA CONSEGNA, e questo caso non la ripara: la INCHIODA.
  // Misurato da chi verificava su due schede e due file: EXIT=0 con stampato «✅ ogni prova a comando
  // nomina ancora il difetto che dimostra» sopra il difetto in funzione, mentre il comando usciva 0
  // senza guardare più niente. Renderlo rosso vorrebbe dire non chiamare più «ancoraggio» un
  // commento — e boccerebbe il 42% delle schede nuove di questa casa (25 delle ultime 60, misurato).
  // Quindi resta un buco, ma un buco CONTATO: se domani il verde smettesse di dichiararlo, o il
  // conteggio di `ancorate_solo_commento` sparisse, questo caso diventa rosso.
  const tmp = alberoSano({ tetto: 0 });
  try {
    estraiLasciandoLIntestazione(tmp);
    const r = gira(tmp, ["--json"]);
    const j = JSON.parse(r.stdout);
    assert.equal(r.status, 0, "il limite è questo: su un ancoraggio da sola intestazione l'estrazione mi è invisibile");
    assert.equal(j.quanti, 0, "…e il conto non si muove");
    // ═══ LA PARTE CHE LA QUARTA VERIFICA HA COLTO IN FALLO ═══════════════════════════════════════
    // Qui prima c'era scritto `ancorate_in_codice: 2`, e quel 2 era la bugia comoda: gli altri due
    // file dell'albero sano hanno intestazione col nome E caso col nome, cioè esattamente la forma
    // di AR-131 sul repo vero — se il loro caso emigra, l'intestazione resta e io resto verde.
    // Contarli «coperti» consacrava l'errore invece di scoprirlo. Adesso il caso pretende il numero
    // vero: tutti e tre sono CIECHI all'estrazione, e nessuno è visto.
    assert.equal(j.cieche_all_estrazione, 3, "tutte e tre nominano il difetto in cima: l'estrazione non le muove");
    assert.equal(j.viste_all_estrazione, 0, "nessuna di queste tre l'estrazione me la farebbe vedere");
    assert.equal(j.ancorate_solo_commento, 1, "il grezzo di prima resta misurato, ma non è più «copertura»");
    assert.match(j.motivo, /l'estrazione la vedo su 0 di 3/, "il verde deve dichiarare su cosa NON sta in piedi, col numero");
    assert.match(j.copertura, /0 VISTE .*3 CIECHE/s, "la riga di copertura deve dire quante ne vede DAVVERO");
    // E la prova che il difetto è davvero in funzione: il comando gira, esce 0, e non guarda più AR-2.
    const suo = spawnSync("node", ["--test", join(tmp, "cervello", "test", "finta-2.test.mjs")], { encoding: "utf8" });
    assert.notEqual(suo.status, 2, "il file esiste ancora ed è eseguibile: è precisamente perché è verde che fa male");
  } finally {
    via(tmp);
  }
});

test("IL COMANDO CHE PORTA IL PROPRIO ID non si accusa: sei accuse su 52 erano false", () => {
  // Smontate ESEGUENDOLE, non ragionandoci: AR-550…AR-555 hanno il comando
  // `node --test cervello/test/sorvegliante.test.mjs && node cervello/non-vacuita.mjs --difetti AR-550`,
  // e quella seconda metà nomina il difetto e va a rompergli il fix apposta (eseguito: EXIT=0,
  // «tutte e 2 le mutazioni rendono rosso il loro test»). Dirne «non guarda più niente» era il
  // contrario di quello che fa. Con loro il tetto è sceso da 52 a 46.
  const tmp = alberoSano({ tetto: 0 });
  try {
    // Un file che NON nomina AR-9, ma il comando sì: è ancorato dal comando.
    writeFileSync(join(tmp, "cervello", "test", "finta-9.test.mjs"), "// nessun nome qui dentro\ntest('x', () => {});\n", "utf8");
    const c = JSON.parse(readFileSync(join(tmp, "cantiere.json"), "utf8"));
    c.difetti.push({ id: "AR-9", stato: "chiuso", verifica: { comando: "node --test cervello/test/finta-9.test.mjs && node cervello/non-vacuita.mjs --difetti AR-9" } });
    writeFileSync(join(tmp, "cantiere.json"), JSON.stringify(c), "utf8");
    const r = gira(tmp, ["--json"]);
    const j = JSON.parse(r.stdout);
    assert.equal(r.status, 0, `un puntatore agganciato dal comando non è una violazione:\n${r.stdout}${r.stderr}`);
    assert.equal(j.quanti, 0, "AR-9 NON va accusato: il suo comando lo nomina");
    assert.equal(j.ancorate_dal_comando, 1, "…e va contato per quello che è: ancorato dal comando, non dal file");
    assert.ok(!(j.scollegati || []).some((s) => s.id === "AR-9"), "il nome non deve comparire fra gli accusati");
  } finally {
    via(tmp);
  }
});

test("LA RIGA CHE ERA FALSA: chi è coperto da una mutazione non si sente dire «non guarda niente»", () => {
  // Restano 18 accusati che hanno in mutanti.json una mutazione che lega quella scheda a quel file —
  // fra loro AR-689, il testimone principale di questo freno. Per loro la frase onesta è «nessuno la
  // esegue finché il lotto non tocca il difetto», non «non guarda niente». E la lettura di
  // mutanti.json è SOLO didascalia: il conto e l'uscita non la toccano.
  const tmp = alberoSano({ tetto: 1 });
  try {
    estraiIlCasoDiAr2(tmp); // AR-2 perde il puntatore: intestazione e caso se ne vanno insieme
    const mut = join(tmp, "mutanti.json");
    writeFileSync(mut, JSON.stringify({ mutanti: [{ difetto: "AR-2", test: "cervello/test/finta-2.test.mjs" }] }), "utf8");
    const conMut = gira(tmp, ["--json"], { MUTANTI_FILE: mut });
    const j = JSON.parse(conMut.stdout);
    assert.equal(j.scollegati[0].ancorata_da_mutazione, true, "la mutazione che lega AR-2 a quel file va vista");
    const testo = gira(tmp, [], { MUTANTI_FILE: mut }).stdout;
    assert.match(testo, /nessuno la esegue finché il lotto non tocca AR-2/, "la frase onesta");
    assert.ok(!/non guarda più niente/.test(testo), "e NON la frase falsa, che è quella che la verifica ha smontato eseguendo");

    // IL CONTO NON DIPENDE DA mutanti.json: senza il file l'esito è identico, e il freno lo dichiara.
    const senza = gira(tmp, ["--json"], { MUTANTI_FILE: join(tmp, "non-esiste.json") });
    const js = JSON.parse(senza.stdout);
    assert.equal(senza.status, conMut.status, "un registro di mutazioni illeggibile non cambia l'uscita");
    assert.equal(js.quanti, j.quanti, "…né il conto: è didascalia, non misura");
    assert.equal(js.mutanti_letto, false, "…e il fatto di non averlo letto si dichiara invece di tacerlo");
  } finally {
    via(tmp);
  }
});

test("l'indice delle mutazioni prende il file dal campo `test`, comando o percorso nudo che sia", () => {
  const per = mutazioniPerDifetto([
    { difetto: "AR-1", test: "node --test cervello/test/uno.test.mjs" },
    { difetto: "AR-2", test: "./cervello/test/due.test.mjs" },
    { difetto: "AR-3", test: "" },
  ]);
  assert.ok(per.get("AR-1").has("cervello/test/uno.test.mjs"), "il percorso dentro un comando");
  assert.ok(per.get("AR-2").has("cervello/test/due.test.mjs"), "e il percorso nudo, senza `./` davanti");
  assert.equal(per.get("AR-3").size, 0, "un campo vuoto non inventa file");
});

test("LA PORTA DEL «NIENTE COMANDO»: se la popolazione cala, l'invito ad abbassare il tetto sparisce", () => {
  // MISURATO sul cantiere vero prima della riparazione: convertite a `verifica:{tipo:"umano"}` le 52
  // schede accusate, il freno usciva 0 con «scesi da 53 a 0: abbassa il tetto» — e sei guardiani
  // fratelli non se ne accorgevano. È la stessa forma del `mv` che ha bocciato la prima consegna, da
  // un'altra porta: il conto scende perché la popolazione si assottiglia, e il freno PREMIA la mossa
  // che deve punire. Non lo blocco (ci sono conversioni legittime, e un rosso lì sarebbe falso) ma
  // il tetto non si abbassa più al buio.
  const tmp = alberoSano({ tetto: 1 });
  try {
    estraiIlCasoDiAr2(tmp);
    writeFileSync(join(tmp, "tetti.json"), JSON.stringify({ puntatori_scollegati: 1, puntatori_popolazione: 3 }), "utf8");
    assert.equal(gira(tmp).status, 0, "partenza: 1 scollegato pari al tetto 1, popolazione 3, verde");

    // LA MOSSA: la scheda accusata smette di avere una prova a comando. Il conto scende a 0.
    const c = JSON.parse(readFileSync(join(tmp, "cantiere.json"), "utf8"));
    c.difetti.find((d) => d.id === "AR-2").verifica = { tipo: "umano" };
    writeFileSync(join(tmp, "cantiere.json"), JSON.stringify(c), "utf8");

    const r = gira(tmp, ["--json"]);
    const j = JSON.parse(r.stdout);
    assert.equal(j.quanti, 0, "il conto SCENDE per davvero: la porta è misurata, non temuta");
    assert.equal(j.popolazione, 2, "…perché una scheda è uscita dalla popolazione");
    assert.ok(!/abbassa il tetto/.test(j.motivo), "e NON si invita ad abbassare il tetto su un conto sceso così");
    assert.match(j.motivo, /1 schede hanno smesso di avere una prova a comando/, "il motivo deve dire QUANTE, dove si legge il numero");
  } finally {
    via(tmp);
  }
});

test("senza «puntatori_popolazione» dichiarato, il freno lo CHIEDE invece di far finta di niente", () => {
  // Un riferimento che non c'è è la stessa ignoranza di prima. Non è un ⚪ — il conto l'ho misurato
  // lo stesso — ma l'invito ad abbassare il tetto non si dà senza sapere perché il conto è sceso.
  const tmp = alberoSano({ tetto: 5 });
  try {
    const j = JSON.parse(gira(tmp, ["--json"]).stdout);
    assert.equal(j.popolazione_dichiarata, null);
    assert.match(j.motivo, /puntatori_popolazione/, "il freno deve chiedere il riferimento che gli manca");
  } finally {
    via(tmp);
  }
});

test("l'ancoraggio nel CODICE e quello nella sola PROSA si distinguono, e l'euristica sbaglia verso il «non so»", () => {
  assert.equal(ancoraSoloCommento("// AR-1 — il difetto\ntest('altro', () => {});\n", "AR-1"), true);
  assert.equal(ancoraSoloCommento("// AR-1 — il difetto\ntest('AR-1', () => {});\n", "AR-1"), false, "il nome nel corpo del caso è ancoraggio vero");
  assert.equal(ancoraSoloCommento("test('x', () => {}); // AR-1\n", "AR-1"), true, "un commento in coda a una riga di codice resta un commento");
  assert.equal(ancoraSoloCommento(" * AR-1 — continuazione di un blocco\n", "AR-1"), true);
  assert.equal(ancoraSoloCommento("# AR-1 in uno script di shell\n", "AR-1"), true);
  assert.equal(ancoraSoloCommento("niente qui", "AR-1"), false, "non ancorata affatto è un'ALTRA domanda: la fa `scollegati`");
  // Sbagliare verso il «non so»: un id dentro una stringa con `//` viene tagliato e classificato
  // «solo commento» — mi attribuisco MENO copertura di quella che ho, mai di più.
  assert.equal(parteDiCodice('const u = "https://x/AR-1";').includes("AR-1"), false, "taglia dal primo //, e va bene così");
  assert.equal(parteDiCodice("test('AR-1', () => {}); // nota").includes("AR-1"), true, "ma il codice prima del commento resta codice");
});

// ─────────────────────────────────────────────────────────────────────────────
// I TRE CASI NATI DALLA QUARTA VERIFICA. Uno per cura, e ognuno rigioca la misura che l'ha chiesta.

/**
 * L'albero delle DUE FORME, che è il cuore della quarta bocciatura.
 *   AR-7 → l'intestazione NON nomina il difetto, il nome sta solo sulla riga del caso  → VISTA
 *   AR-8 → l'intestazione LO nomina, come vuole il mandato di casa                     → CIECA
 * Sono la stessa scheda dal punto di vista del vecchio conteggio («ancorata dal codice» tutte e
 * due). Sono opposte dal punto di vista della domanda vera: se il caso emigra, una diventa rossa e
 * l'altra resta verde.
 */
function alberoDueForme({ tetto = 0 } = {}) {
  const tmp = mkdtempSync(join(tmpdir(), "puntatori-forme-"));
  mkdirSync(join(tmp, "cervello", "test"), { recursive: true });
  writeFileSync(
    join(tmp, "cervello", "test", "finta-7.test.mjs"),
    `// la prova del settimo caso — l'intestazione qui non nomina nessun difetto.\ntest("AR-7 · il caso che dimostra", () => {});\n`,
    "utf8",
  );
  writeFileSync(
    join(tmp, "cervello", "test", "finta-8.test.mjs"),
    `// AR-8 — il commento in cima che il mandato di casa pretende su ogni file di prova.\ntest("AR-8 · il caso che dimostra", () => {});\n`,
    "utf8",
  );
  const difetti = [
    { id: "AR-7", stato: "chiuso", verifica: { comando: "node cervello/test/finta-7.test.mjs" } },
    { id: "AR-8", stato: "chiuso", verifica: { comando: "node cervello/test/finta-8.test.mjs" } },
  ];
  writeFileSync(join(tmp, "cantiere.json"), JSON.stringify({ difetti }), "utf8");
  writeFileSync(join(tmp, "tetti.json"), JSON.stringify({ puntatori_scollegati: tetto }), "utf8");
  return tmp;
}

test("LA VARIANTE SCOMODA: il caso emigra, l'intestazione RESTA — e il freno lo dice invece di promettere copertura", () => {
  // ═══ LA CURA ① DELLA QUARTA VERIFICA, RIGIOCATA ═══════════════════════════════════════════════
  // Il freno stampava «221 SOLO da una riga di commento (40%): su queste ultime il caso può emigrare
  // tutto e io resto verde», e quel «su queste ultime» prometteva che sulle ALTRE l'estrazione si
  // vedesse. Misurato da chi verificava sul repo vero: dei 319 contati «dal codice del file», 303
  // portano il nome anche nell'intestazione — e l'intestazione all'estrazione non si muove. La
  // cecità vera era 445 su 546, l'81%, non il 40%.
  // Qui le due forme stanno una accanto all'altra, e il caso pretende che il freno le distingua:
  // quella che vede diventa ROSSA quando il caso emigra, quella che non vede resta verde MA finisce
  // contata fra le cieche. Se domani qualcuno rimette il numero comodo, questo caso diventa rosso.
  const tmp = alberoDueForme({ tetto: 0 });
  try {
    // ① prima dell'estrazione: una vista, una cieca, e il verde lo dichiara.
    const prima = JSON.parse(gira(tmp, ["--json"]).stdout);
    assert.equal(prima.quanti, 0, "nessuno è ancora scollegato");
    assert.equal(prima.viste_all_estrazione, 1, "AR-7 nomina il difetto SOLO sulla riga del caso: quella la vedo");
    assert.equal(prima.cieche_all_estrazione, 1, "AR-8 lo nomina in cima: quella non la vedo, e va contata fra le cieche");
    assert.match(prima.copertura, /1 VISTE .*1 CIECHE/s, "la riga di copertura deve portare i due numeri veri");

    // ② LA FORMA SCOMODA — quella che questa casa produce davvero: il caso emigra, l'intestazione
    //    resta dov'era perché il mandato la pretende. Il file gira ancora, esce 0, non guarda niente.
    writeFileSync(join(tmp, "cervello", "test", "finta-9.test.mjs"), `// AR-8 — il caso è emigrato qui.\ntest("AR-8 · il caso che dimostra", () => {});\n`, "utf8");
    writeFileSync(
      join(tmp, "cervello", "test", "finta-8.test.mjs"),
      `// AR-8 — il commento in cima che il mandato di casa pretende su ogni file di prova.\ntest("un altro caso, che con AR-8 non c'entra", () => {});\n`,
      "utf8",
    );
    const dopo8 = JSON.parse(gira(tmp, ["--json"]).stdout);
    assert.equal(dopo8.quanti, 0, "IL LIMITE: sotto l'intestazione rimasta al posto suo l'estrazione mi è invisibile");
    assert.equal(dopo8.viste_all_estrazione, 1, "…e resta vista solo l'altra, quella che l'intestazione non protegge");
    assert.match(dopo8.motivo, /l'estrazione la vedo su 1 di 2/, "il verde deve portare addosso il numero vero, non il doppio");

    // ③ LA FORMA CHE VEDO — stessa mossa su AR-7, dove l'intestazione non fa da paravento: ROSSA.
    writeFileSync(join(tmp, "cervello", "test", "finta-10.test.mjs"), `// il caso di AR-7 è emigrato qui.\ntest("AR-7 · il caso che dimostra", () => {});\n`, "utf8");
    writeFileSync(
      join(tmp, "cervello", "test", "finta-7.test.mjs"),
      `// la prova del settimo caso — l'intestazione qui non nomina nessun difetto.\ntest("un altro caso", () => {});\n`,
      "utf8",
    );
    const r = gira(tmp, ["--json"]);
    const dopo7 = JSON.parse(r.stdout);
    assert.equal(r.status, 1, `qui il freno DEVE diventare rosso:\n${r.stdout}${r.stderr}`);
    assert.equal(dopo7.quanti, 1, "AR-7 si è scollegato per davvero");
    assert.equal(dopo7.scollegati[0].id, "AR-7", "e va accusato col suo nome");
  } finally {
    via(tmp);
  }
});

test("dove poggia l'ancoraggio: l'intestazione VINCE, perché è quella che l'estrazione non porta via", () => {
  // La classificazione a mano, funzione per funzione, perché è il pezzo su cui il numero sta in
  // piedi. L'ordine non è estetico: un file che nomina il difetto SIA in cima SIA nel caso resta
  // verde quando il caso se ne va, quindi va contato fra i CIECHI e non fra i visti. È la forma di
  // AR-131 su `cervello/test/due-numeri-per-la-stessa-domanda.test.mjs`, che il freno prima
  // dichiarava coperta.
  assert.equal(doveAncora('// AR-5 — il difetto\ntest("AR-5", () => {});\n', "AR-5"), "intestazione", "in cima E nel caso = CIECA: l'intestazione resta");
  assert.equal(doveAncora('// niente nomi qui\ntest("AR-5", () => {});\n', "AR-5"), "presso_i_casi", "solo sulla riga del caso = VISTA");
  assert.equal(doveAncora('// niente nomi\nimport x from "y";\n// ── AR-5: sezione ──\ntest("altro", () => {});\n', "AR-5"), "sparso", "un commento di sezione più in basso: non so se emigra");
  assert.equal(doveAncora("niente di niente", "AR-5"), null, "non ancorata affatto è un'ALTRA domanda");
  // L'intestazione è il blocco contiguo in cima, shebang compreso: si ferma alla prima riga di codice.
  assert.equal(fineIntestazione('#!/usr/bin/env node\n// uno\n//due\n\nimport x from "y";\n// tre\n'), 4, "shebang + commenti + riga vuota, poi il codice chiude l'intestazione");
  assert.equal(fineIntestazione('import x from "y";\n'), 0, "un file che apre col codice non ha intestazione");
  assert.equal(apreUnCaso('test("AR-5 · x", () => {});'), true);
  assert.equal(apreUnCaso('prova("AR-5 · x", () => {});'), true, "`prova(` è l'involucro di casa, non un'invenzione");
  assert.equal(apreUnCaso('const submit = 1;'), false, "`submit(` non è `it(`: il confine delle parole conta");
});

test("LA SCORCIATOIA DEL CAMPO COMANDO: appendere ` --ar-nnn` non compra più il verde", () => {
  // ═══ LA CURA ② DELLA QUARTA VERIFICA, RIGIOCATA ═══════════════════════════════════════════════
  // MISURATO PRIMA DELLA CURA sul repo vero, non temuto: appeso ` --ar-319` al `verifica.comando`
  // della scheda AR-319 — forma che `comandoAmmesso` dichiara valida, e il comando gira identico
  // (`node --test … --ar-319` → 1 pass, EXIT=0) — il conto scendeva da 46 a 45 con la popolazione
  // ferma a 592 e il freno rispondeva «abbassa il tetto a 45». Steso su tutte e 46: il debito andava
  // a zero. Zero righe di codice vero toccate.
  // MISURATO DOPO: stesa la stessa mossa su tutte e 46 le schede accusate, il conto resta 46.
  const tmp = alberoSano({ tetto: 0 });
  try {
    // Il file NON nomina AR-9. Le tre forme, una accanto all'altra.
    writeFileSync(join(tmp, "cervello", "test", "finta-9.test.mjs"), "// nessun nome qui dentro\ntest('x', () => {});\n", "utf8");
    const conComando = (comando) => {
      const c = JSON.parse(readFileSync(join(tmp, "cantiere.json"), "utf8"));
      c.difetti = c.difetti.filter((d) => d.id !== "AR-9");
      c.difetti.push({ id: "AR-9", stato: "chiuso", verifica: { comando } });
      writeFileSync(join(tmp, "cantiere.json"), JSON.stringify(c), "utf8");
      return JSON.parse(gira(tmp, ["--json"]).stdout);
    };
    // ① LA BANDIERINA APPESA al comando che gira il test: non esegue niente che riguardi AR-9.
    const appesa = conComando("node --test cervello/test/finta-9.test.mjs --ar-9");
    assert.equal(appesa.quanti, 1, "una bandierina appesa allo STESSO comando non è un ancoraggio");
    assert.equal(appesa.ancorate_dal_comando, 0, "…e non va contata come tale");
    // ② UN SECONDO COMANDO CHE NON ESEGUE NIENTE: stessa risposta.
    const eco = conComando("node --test cervello/test/finta-9.test.mjs && echo AR-9");
    assert.equal(eco.quanti, 1, "`&& echo AR-9` non esegue nessun file: non può guardare niente");
    // ③ UN TOKEN NUDO appeso a un secondo comando vero: non seleziona nessun difetto.
    const nudo = conComando("node --test cervello/test/finta-9.test.mjs && node cervello/non-vacuita.mjs AR-9");
    assert.equal(nudo.quanti, 1, "un id nudo in coda non è un'opzione: non sceglie niente");
    // ④ LA FORMA VERA, quella delle sei accuse false (AR-550…555): un SECONDO comando, su un file
    //    DIVERSO, con l'id come valore di un'opzione. Questa sì.
    const vera = conComando("node --test cervello/test/finta-9.test.mjs && node cervello/non-vacuita.mjs --difetti AR-9");
    assert.equal(vera.quanti, 0, "il secondo comando intestato al difetto è un ancoraggio vero");
    assert.equal(vera.ancorate_dal_comando, 1, "…e va contato per quello che è");
    // E la funzione, presa da sola, sulle stesse quattro forme.
    assert.equal(ancoraggioDalComando("node --test a.test.mjs --ar-9", "AR-9", "a.test.mjs"), false);
    assert.equal(ancoraggioDalComando("node --test a.test.mjs && echo AR-9", "AR-9", "a.test.mjs"), false);
    assert.equal(ancoraggioDalComando("node --test a.test.mjs && node b.mjs AR-9", "AR-9", "a.test.mjs"), false);
    assert.equal(ancoraggioDalComando("node --test a.test.mjs && node b.mjs --difetti AR-9", "AR-9", "a.test.mjs"), true);
    assert.equal(idComeOpzione("node b.mjs --difetti AR-9", "AR-9"), true);
    assert.equal(idComeOpzione("node b.mjs AR-9", "AR-9"), false);
  } finally {
    via(tmp);
  }
});

test("IL ROSSO NON INSEGNA PIÙ A LAVARSI: il consiglio nomina le due mosse oneste, non la terza", () => {
  // ═══ LA CURA ③ DELLA QUARTA VERIFICA ══════════════════════════════════════════════════════════
  // Il consiglio stampato era «o scrivi `// AR-nnn` accanto al caso che è emigrato». Chi verificava
  // l'ha eseguito: il file dove il caso ERA emigrato nominava AR-131 sette volte e il freno restava
  // rosso — il consiglio letto alla lettera non funziona. L'unica lettura che toglie il rosso è
  // scrivere il nome nel file dove il caso NON c'è più: cioè zittire il freno senza riparare niente.
  // Misurato, ed è la porta che resta aperta: `// AR-319` in fondo a `freni-senza-fonte.test.mjs`
  // portava il conto da 46 a 45. Non la so distinguere da un commento di sezione legittimo (38
  // schede vere ne usano uno), quindi la dichiaro — e almeno smetto di insegnarla.
  const tmp = alberoSano({ tetto: 0 });
  try {
    estraiIlCasoDiAr2(tmp);
    const r = gira(tmp, []);
    assert.equal(r.status, 1, `serve il rosso per leggere il consiglio:\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /riporti il caso in/, "prima mossa onesta: il caso torna dov'era");
    assert.match(r.stdout, /sposti il puntatore della scheda/, "seconda mossa onesta: la scheda punta al file nuovo");
    assert.match(r.stdout, /NON scrivere/, "e la terza va detta per quello che è");
    assert.ok(
      !/o scrivi `\/\/ AR-2` accanto al caso/.test(r.stdout),
      "il consiglio vecchio insegnava la mossa che lava il difetto: non deve tornare",
    );
  } finally {
    via(tmp);
  }
});

test("il contratto d'uscita resta DENTRO l'intestazione, o la casa smette di vedermi come guardiano", async () => {
  // Successo davvero, riparando questo file: allungando l'intestazione il blocco «Uscita (contratto
  // guardiani)» è scivolato a riga 117, `eGuardiano` legge solo le prime 80 (RIGHE_INTESTAZIONE) e
  // `node cervello/guardia-viva-check.mjs` è passato da EXIT=0 a EXIT=1 — il guardiano si era spento
  // in silenzio senza che una riga di logica cambiasse. Qui si ESEGUE la funzione vera di casa, non
  // si cerca una parola: se domani qualcuno allunga il commento, questo caso diventa rosso subito
  // invece di far scoprire il guasto al cancello di qualcun altro.
  const { eGuardiano, RIGHE_INTESTAZIONE } = await import("../guardia-viva.mjs");
  const testo = readFileSync(MOTORE, "utf8");
  assert.equal(
    eGuardiano(testo),
    true,
    `la casa non mi riconosce più come guardiano: il contratto d'uscita deve stare nelle prime ${RIGHE_INTESTAZIONE} righe`,
  );
});

test("importare il motore NON lo esegue (AR-680): la guardia è sulla forma canonica", () => {
  // La metà vera di AR-680 non era la guardia mancante: era la guardia scritta come `file://` +
  // argv[1], che sotto una cartella accentata non combacia e si spegne in silenzio. Questo import,
  // in cima al file, è già la prova: se il modulo partisse da solo, questa suite non arriverebbe qui.
  const r = spawnSync("node", ["-e", `import(${JSON.stringify(MOTORE)}).then(m => console.log(typeof m.scollegati));`], { encoding: "utf8" });
  assert.equal(r.status, 0, `importarlo non deve fallire:\n${r.stdout}${r.stderr}`);
  assert.equal(r.stdout.trim(), "function", "importandolo si ottiene il modulo, non l'esecuzione del guardiano");
  assert.ok(!/PUNTATORI DI PROVA SCOLLEGATI/.test(r.stdout), "importarlo non deve stampare il referto");
});

// ─────────────────────────────────────────────────────────────────────────────
// SUL REPO VERO — e sull'albero CHE IL CANCELLO VEDRÀ, che non è lo stesso.

/**
 * LA SCHEDA CHE QUESTO LOTTO STA PER MONTARE — LA MIA, E SOLO LA MIA.
 *
 * Un lotto si consegna con le sue schede DENTRO il cantiere: finché non ci sono, il numero che il
 * freno misura non è quello che il cancello troverà. Ma «le sue schede» vuol dire LE MIE.
 *
 * PRIMA QUI SI LEGGEVA `mutanti.json` per scoprire le schede in arrivo di TUTTE le corsie del lotto,
 * e da lì venivano montate anche quelle di altri — fra cui AR-797 → `cervello/test/due-case.test.mjs`,
 * che non nomina il suo difetto e valeva +1. Il tetto 53 della consegna precedente conteneva quel +1:
 * cioè il mio tetto era tarato sul lavoro di un'altra corsia, e si rompeva se quella corsia cambiava
 * il suo file, rinominava la sua scheda o spariva dal lotto. Un pareggio esatto costruito sul lavoro
 * di qualcun altro non è un tetto: è una scommessa. Adesso monto la mia scheda a mano, scritta qui,
 * senza leggere nessun registro condiviso — nessun altro può muovere il mio numero.
 *
 * Se una corsia consegna un puntatore non agganciato, il conto sale di uno e il freno la nomina: è
 * il comportamento voluto, con un fix da una riga, non un difetto del tetto.
 * Niente git: in CI il clone è superficiale, e un caso che legge la storia lì non può essere verde.
 */
const MIA_SCHEDA = { id: "AR-798", stato: "chiuso", verifica: { comando: "node cervello/test/puntatori-scollegati.test.mjs" } };

/** Il motore sul repo vero col MIO lotto montato: il cantiere di oggi più la mia scheda. */
function giraSulMontato(tetto = null) {
  const cantiere = JSON.parse(readFileSync(CANTIERE_VERO, "utf8"));
  const gia = new Set(cantiere.difetti.map((d) => String(d.id)));
  if (!gia.has(MIA_SCHEDA.id)) cantiere.difetti.push({ ...MIA_SCHEDA });
  const tmp = mkdtempSync(join(tmpdir(), "puntatori-montato-"));
  const extra = { CANTIERE_FILE: join(tmp, "cantiere.json") };
  writeFileSync(extra.CANTIERE_FILE, JSON.stringify(cantiere), "utf8");
  if (tetto !== null) {
    extra.TETTI_FILE = join(tmp, "tetti.json");
    writeFileSync(extra.TETTI_FILE, JSON.stringify({ puntatori_scollegati: tetto }), "utf8");
  }
  const r = spawnSync("node", [MOTORE, "--json"], { encoding: "utf8", env: ambiente(extra) });
  via(tmp);
  return { r, j: JSON.parse(r.stdout || "{}") };
}

test("IL TETTO NON PUÒ NASCERE GIÀ SUPERATO: col lotto MONTATO il conto sta sotto il tetto dichiarato", () => {
  // LA SECONDA BOCCIATURA, in un caso solo. La prima consegna dichiarava 52 misurato sull'albero di
  // prima del montaggio; montando le due schede del lotto il conto va a 53 e il cancello esce 1 —
  // rosso per tutti, senza che nessuno abbia scritto una riga di codice sbagliata. È la malattia di
  // AR-506/511/514/526/534. Chi consegna un tetto deve misurarlo sull'albero che il cancello vedrà.
  const { r, j } = giraSulMontato();
  assert.ok(j.controllati > 500, `il caso deve guardare le prove a comando VERE, o non misura niente (${j.controllati})`);
  const colpevoli = (j.scollegati || []).filter((s) => s.id === MIA_SCHEDA.id);
  assert.notEqual(
    r.status,
    1,
    `montando la mia scheda (${MIA_SCHEDA.id}) il conto è ${j.quanti} contro un tetto di ${j.tetto}: ` +
      `il freno nascerebbe ROSSO e bloccherebbe il cancello per tutti.\n` +
      `Puntatori del lotto ancora scollegati: ${JSON.stringify(colpevoli)}\n` +
      `Si ripara in due modi: o il file di prova nomina il suo difetto, o il tetto in ` +
      `cervello/tetti-lotto.json è la misura dell'albero MONTATO, non di quello di adesso.`,
  );
  assert.ok(j.quanti <= j.tetto, `${j.quanti} scollegati contro un tetto di ${j.tetto}`);
});

test("AR-798 NON PORTA DEBITO PROPRIO: la scheda di questo freno punta a un file che la nomina", () => {
  // Il tetto vale 46 «anche senza montare niente» solo se la MIA scheda è agganciata. Se un giorno
  // qualcuno rinomina questa prova o le toglie il nome del difetto, il tetto smette di essere quello
  // che ho dichiarato — e va scoperto qui, non dal cancello di qualcun altro.
  const { j } = giraSulMontato();
  assert.ok(
    !(j.scollegati || []).some((s) => s.id === MIA_SCHEDA.id),
    `${MIA_SCHEDA.id} è finito fra i puntatori scollegati: il file che il suo comando esegue ha smesso di nominarlo`,
  );
  const oggi = JSON.parse(spawnSync("node", [MOTORE, "--json"], { encoding: "utf8", env: ambiente() }).stdout);
  assert.equal(j.quanti, oggi.quanti, "montando la mia scheda il conto non deve muoversi: il mio lotto non aggiunge debito");
});

test("CALIBRAZIONE: il tetto è guardato davvero — un solo puntatore in più dell'albero montato è rosso", () => {
  // Se col tetto abbassato di uno restasse verde vorrebbe dire che il numero non lo legge nessuno,
  // cioè che è una cifra scelta per far passare il cancello.
  const misura = giraSulMontato().j.quanti;
  const rosso = giraSulMontato(misura - 1);
  assert.equal(
    rosso.r.status,
    1,
    `col tetto ${misura - 1} sull'albero montato deve bloccare, uscito ${rosso.r.status}:\n${rosso.r.stdout}${rosso.r.stderr}`,
  );
  assert.equal(rosso.j.esito, "violazione");
});

test("SUL REPO DI OGGI, prima del montaggio, è comunque verde: non nasce rosso in nessuno dei due stati", () => {
  const r = spawnSync("node", [MOTORE, "--json"], { encoding: "utf8", env: ambiente() });
  assert.equal(r.status, 0, `sul cantiere di oggi col tetto dichiarato deve essere verde, uscito ${r.status}:\n${r.stdout}${r.stderr}`);
  const j = JSON.parse(r.stdout);
  const tetto = JSON.parse(readFileSync(TETTI_VERI, "utf8")).puntatori_scollegati;
  assert.equal(typeof tetto, "number", "il tetto deve essere dichiarato in cervello/tetti-lotto.json");
  assert.equal(j.tetto, tetto, "e il motore deve leggere QUEL tetto, non un altro");
  assert.equal(j.saltati, 0, "oggi nessun puntatore punta a un file che non c'è: se cambia, è un ⚪ da guardare");
});

test("SUL CAMPO: AR-689 è uno dei puntatori scollegati veri, e il freno lo vede", () => {
  // La sua prova è `node cervello/test/segreto-in-un-nome-con-l-accento.test.mjs`, e quel file non
  // contiene «AR-689» da nessuna parte: cavalca il caso di un'altra scheda. Se un giorno viene
  // riagganciato questo caso diventa rosso — ed è il modo giusto di accorgersene, perché vuol dire
  // che il tetto va abbassato.
  const j = JSON.parse(spawnSync("node", [MOTORE, "--json"], { encoding: "utf8", env: ambiente() }).stdout);
  assert.ok(j.controllati > 500, `il repo deve avere le sue prove a comando, o questo caso non misura niente (${j.controllati})`);
  assert.ok(
    j.scollegati.some((s) => s.id === "AR-689"),
    "AR-689 è il caso storico che questo freno ferma: se non c'è più, abbassa il tetto",
  );
});
