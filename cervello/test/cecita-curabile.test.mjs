#!/usr/bin/env node
// AR-693 · AR-800 · AR-652 — UNA CECITÀ CHE UN COMANDO CURA NON È IL PREZZO DELL'AMBIENTE.
//
// Tre schede, una malattia sola. Il ⚪ non era il difetto: il difetto era che il ⚪ **si fermava lì**.
//
//  · AR-693 — ventinove prove scritte in bash, che girano solo se `bats` è installato. Non lo
//    installava nessuno: né la CI, né il VPS, né l'avvio di sessione; in tutto il repo l'unica
//    traccia era un PERMESSO. Installarlo il 26/8 è costato 937 millisecondi e ha fatto uscire
//    DIECI file rossi, DICIANNOVE casi caduti, invisibili da mesi.
//  · AR-800 — in ogni sessione cloud il repo arriva come clone superficiale e tre controlli del
//    cancello si dichiarano ciechi. `git fetch --unshallow origin` li cura: misurato il 26/8, la
//    storia è passata da 50 commit a 7.383 in pochi secondi.
//  · AR-652 — una prova in bash che presumeva l'ambiente del VPS senza dichiararlo: senza chiavi
//    usciva rossa su codice sano, e prima ancora usciva VERDE per un exit 0 che non misurava niente.
//
// COSA PROVA QUESTO BANCO, e cosa no. Prova la DECISIONE (`verdettoCecita`, `curaUnaVolta`), il
// riconoscimento dell'esecutore (`esecutoreDichiarato`), la porta che si cura da sola
// (`storiaDelRepoCurata`) e il conto dei casi saltati (`verdettoBats`). Non prova che `npm` funzioni
// su questa macchina — quello è l'ambiente, e infatti la cura si inietta.
//
// 🟢 Sola lettura: funzioni pure e un repo git finto in una cartella temporanea.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { CURE, curaPer, curaUnaVolta, verdettoCecita } from "../cecita-curabile.mjs";
import { esecutoreDichiarato, senzaPermessi, verdettoDebitoBash } from "../debito-prove-bash.mjs";
import { storiaDelRepoCurata } from "../storia-git.mjs";
import { passaDallaPortaDellaStoria, verdettoDueCase } from "../due-case.mjs";
import { verdetto, verdettoBats, leggiTapBats, motivoDelloSkip, dipendenzaDelPannello } from "../test-cervello.mjs";
import { testRossi, testRossiBash, verdettoConTetto } from "../tetto-guardiano.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// ─────────────────────────────────────────────────────────────────────────────
// ① LA DECISIONE — e il terzo esito, che è quello che il difetto cancellava
// ─────────────────────────────────────────────────────────────────────────────

test("AR-800: cieco + una cura esiste + nessuno l'ha data = ⛔, non ⚪", () => {
  const v = verdettoCecita({ chiave: "storia-troncata", cieco: true, tentata: false });
  assert.equal(v.stato, "cieca-curabile", "un comando mai dato non è il prezzo dell'ambiente");
  assert.match(v.riga, /⛔/);
  assert.match(v.riga, /git fetch --unshallow origin/, "il ⚪ deve PORTARE il comando che lo toglie");
});

test("AR-800: cieco + la cura è stata data e non è bastata = ⚪ legittimo, col perché", () => {
  const v = verdettoCecita({ chiave: "storia-troncata", cieco: true, tentata: true, riuscita: false });
  assert.equal(v.stato, "cieca-per-forza");
  assert.match(v.riga, /⚪/);
  assert.match(v.riga, /non dipende da me/);
});

test("una cecità che nessuno sa curare resta ⚪ e lo dice, invece di fingere una cura", () => {
  const v = verdettoCecita({ chiave: "qualcosa-che-non-conosco", cieco: true, motivo: "il disco non risponde" });
  assert.equal(v.stato, "cieca-per-forza");
  assert.equal(v.comando, null);
  assert.match(v.riga, /non conosco un comando che la curi/);
});

test("curata: la cecità c'era, il comando è stato dato, adesso si vede", () => {
  const v = verdettoCecita({ chiave: "prove-bash-senza-esecutore", cieco: false, tentata: true, riuscita: true });
  assert.equal(v.stato, "curata");
});

test("`riuscita` è un TERZO valore: mai tentato e tentato-e-fallito non sono la stessa cosa", () => {
  const mai = verdettoCecita({ chiave: "storia-troncata", cieco: true, tentata: false, riuscita: null });
  const fallito = verdettoCecita({ chiave: "storia-troncata", cieco: true, tentata: true, riuscita: false });
  assert.notEqual(mai.stato, fallito.stato, "appiattirli su `false` è il modo in cui la malattia è sopravvissuta");
});

test("le due cecità note portano un comando vero, non una frase", () => {
  for (const chiave of Object.keys(CURE)) {
    const c = curaPer(chiave);
    assert.ok(c.comando && c.comando.length > 3, `${chiave} deve avere un comando`);
    assert.ok(c.perche && c.perche.length > 20, `${chiave} deve dire perché quel ⚪ costa`);
  }
  assert.equal(curaPer("mai-vista"), null);
});

// ─────────────────────────────────────────────────────────────────────────────
// ② LA CURA SI TENTA UNA VOLTA SOLA — otto guardiani, un fetch
// ─────────────────────────────────────────────────────────────────────────────

test("curaUnaVolta: il comando si dà una volta sola, anche se lo chiedono in otto", () => {
  const memoria = new Map();
  let quante = 0;
  const chiama = () =>
    curaUnaVolta({
      chiave: "storia-troncata",
      esegui: () => {
        quante++;
        return true;
      },
      rimisura: () => ({ intera: true }),
      memoria,
    });
  const primo = chiama();
  for (let i = 0; i < 7; i++) chiama();
  assert.equal(quante, 1, "otto guardiani che chiedono la stessa storia non fanno otto fetch");
  assert.equal(primo.gia, false);
  assert.equal(chiama().gia, true, "chi arriva dopo sa che il tentativo c'è già stato");
});

test("curaUnaVolta: un comando che ESPLODE è un comando che non ha curato, non un errore da propagare", () => {
  const esito = curaUnaVolta({
    chiave: "storia-troncata",
    esegui: () => {
      throw new Error("rete chiusa");
    },
    rimisura: () => ({ intera: false, motivo: "ancora troncata" }),
    memoria: new Map(),
  });
  assert.equal(esito.riuscita, false);
  assert.equal(esito.tentata, true);
});

// ─────────────────────────────────────────────────────────────────────────────
// ③ LA PORTA CHE SI CURA — su un repo git vero, costruito qui
// ─────────────────────────────────────────────────────────────────────────────

function repoFinto(shallow) {
  const dir = mkdtempSync(join(tmpdir(), "cecita-"));
  const git = (...a) => execFileSync("git", a, { cwd: dir, encoding: "utf8", stdio: "pipe" });
  git("init", "-q", ".");
  git("config", "user.email", "prova@prova.local");
  git("config", "user.name", "Prova");
  writeFileSync(join(dir, "f.txt"), "x");
  git("add", "f.txt");
  git("commit", "-qm", "uno");
  // Un clone superficiale si dichiara col file `.git/shallow`: costruirlo a mano è più onesto che
  // clonare da un remoto, perché la prova non deve dipendere da una rete.
  if (shallow) writeFileSync(join(dir, ".git", "shallow"), `${git("rev-parse", "HEAD").trim()}\n`);
  return { dir, chiudi: () => rmSync(dir, { recursive: true, force: true }) };
}

test("AR-800: storia intera → nessun comando dato, e non si finge una cura", () => {
  const r = repoFinto(false);
  try {
    let tentativi = 0;
    const s = storiaDelRepoCurata(r.dir, {
      fetch: () => {
        tentativi++;
        return true;
      },
      memoria: new Map(),
    });
    assert.equal(s.intera, true);
    assert.equal(tentativi, 0, "su una storia intera il fetch non si fa nemmeno");
    assert.equal(s.cura.stato, "vedente");
  } finally {
    r.chiudi();
  }
});

test("AR-800: storia troncata → il comando si dà, e se cura la storia diventa intera", () => {
  const r = repoFinto(true);
  try {
    const prima = storiaDelRepoCurata(r.dir, { fetch: () => false, memoria: new Map() });
    assert.equal(prima.intera, false, "senza cura resta troncata");
    // La cura vera qui è togliere il file `.git/shallow`, che è quello che fa `--unshallow`.
    const s = storiaDelRepoCurata(r.dir, {
      fetch: () => {
        rmSync(join(r.dir, ".git", "shallow"));
        return true;
      },
      memoria: new Map(),
    });
    assert.equal(s.intera, true, "dopo il comando la storia si vede");
    assert.equal(s.cura.stato, "curata");
    assert.equal(s.cura.tentata, true);
  } finally {
    r.chiudi();
  }
});

test("AR-800: il comando fallisce → cieco DICHIARATO col perché, mai un verde di ripiego", () => {
  const r = repoFinto(true);
  try {
    const s = storiaDelRepoCurata(r.dir, { fetch: () => false, memoria: new Map() });
    assert.equal(s.intera, false);
    assert.equal(s.cura.stato, "cieca-per-forza", "una cecità che non si può curare va detta lo stesso");
    assert.match(s.cura.riga, /git fetch --unshallow/, "e porta comunque il comando, per chi legge");
  } finally {
    r.chiudi();
  }
});

test("AR-800: senza `origin` non si tenta NEMMENO — un repo staccato non paga niente", () => {
  const r = repoFinto(true);
  try {
    // Nessun `fetch` iniettato: qui gira il tentativo VERO, e deve capire da solo che non c'è niente
    // da chiedere. Il repo finto non ha remoti.
    const s = storiaDelRepoCurata(r.dir, { memoria: new Map() });
    assert.equal(s.intera, false);
    assert.equal(s.cura.stato, "cieca-per-forza", "tentato e non riuscito, dichiarato");
    // Il segno lo lascia SOLO un tentativo di rete fallito. Se compare qui vuol dire che il fetch è
    // partito su un repo senza remoto: il freno «niente remoto, niente tentativo» non c'è più.
    // (Misurare il TEMPO non basta: git rifiuta un remoto inesistente in pochi millisecondi, quindi
    // un cronometro resterebbe verde col freno tolto — provato con la mutazione.)
    assert.equal(
      existsSync(join(r.dir, ".git", "mycity-cura-storia-tentata")),
      false,
      "senza remoto non si tenta, quindi non c'è niente da segnare",
    );
  } finally {
    r.chiudi();
  }
});

test("AR-693: l'installatore RITORNA anche se npm si blocca — provato con un npm finto che dorme", () => {
  const finto = mkdtempSync(join(tmpdir(), "npm-finto-"));
  try {
    writeFileSync(join(finto, "npm"), "#!/bin/sh\nsleep 300\n", { mode: 0o755 });
    const t0 = Date.now();
    const r = spawnSync("bash", [join(REPO, "cervello/installa-bats.sh")], {
      encoding: "utf8",
      timeout: 40_000,
      // `env -i`-style: solo il PATH col finto davanti, così `command -v bats` non trova quello vero
      // e `npm` è quello che dorme. Senza il timeout dentro lo script, qui si resterebbe appesi.
      env: { PATH: `${finto}:/usr/bin:/bin`, INSTALLA_BATS_TIMEOUT: "3" },
    });
    const durata = Date.now() - t0;
    assert.equal(r.status, 0, "un gancio di sessione che esce ≠0 si impara a togliere");
    assert.ok(durata < 20_000, `deve tornare in pochi secondi, non restare appeso: ci ha messo ${durata}ms`);
    assert.match(r.stderr || "", /non sono riuscito a installare bats/, "e dice perché, invece di tacere");
  } finally {
    rmSync(finto, { recursive: true, force: true });
  }
});

test("AR-800: un tentativo FALLITO lascia un segno CONDIVISO, così il cancello non sbatte dieci volte sullo stesso muro", () => {
  const r = repoFinto(true);
  try {
    // Un `origin` che c'è ma non porta da nessuna parte: il fetch parte davvero e fallisce, che è la
    // condizione in cui il segno serve (rete chiusa, permessi). Senza remoto invece non si tenta
    // nemmeno, e il segno non ha ragione di esistere.
    execFileSync("git", ["remote", "add", "origin", join(r.dir, "remoto-che-non-ce")], { cwd: r.dir, stdio: "pipe" });
    storiaDelRepoCurata(r.dir, { memoria: new Map() });
    const segno = join(r.dir, ".git", "mycity-cura-storia-tentata");
    assert.ok(
      readFileSync(segno, "utf8").length > 0,
      "il segno sta in .git perché `curaUnaVolta` limita il PROCESSO, e il cancello ne lancia una decina",
    );
    // Un secondo processo (memoria nuova) trova il segno e non riprova.
    const t0 = Date.now();
    const s = storiaDelRepoCurata(r.dir, { memoria: new Map() });
    assert.equal(s.intera, false);
    assert.ok(Date.now() - t0 < 15_000);
  } finally {
    r.chiudi();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ④ CHI ESEGUE LE PROVE IN BASH — un permesso non è un esecutore, e nemmeno l'attrezzo
// ─────────────────────────────────────────────────────────────────────────────

test("AR-693: un PERMESSO non è un esecutore (era l'unica traccia di bats in tutto il repo)", () => {
  const solo = JSON.stringify({ permissions: { allow: ["Bash(npx bats:*)"] } });
  assert.equal(esecutoreDichiarato([{ nome: ".claude/settings.json", testo: solo }]).installato, false);
});

test("AR-693: un GANCIO che lo chiama sì — e le impostazioni non si saltano più per intero", () => {
  const con = JSON.stringify({
    permissions: { allow: ["Bash(npx bats:*)"] },
    hooks: { SessionStart: [{ hooks: [{ command: "bash cervello/installa-bats.sh; node x.mjs" }] }] },
  });
  const r = esecutoreDichiarato([{ nome: ".claude/settings.json", testo: con }]);
  assert.equal(r.installato, true);
  assert.match(r.dove[0], /installa-bats/);
});

test("AR-693: l'ATTREZZO non è il suo proprio esecutore (o nascerebbe scollegato da chiunque)", () => {
  const r = esecutoreDichiarato([{ nome: "cervello/installa-bats.sh", testo: "npm i -g bats" }]);
  assert.equal(r.installato, false, "il file che installa non conta come qualcuno che lo chiama");
});

test("senzaPermessi: taglia il blocco annidato per intero, non si ferma alla prima graffa", () => {
  const testo = JSON.stringify({ permissions: { allow: ["a"], deny: ["b"] }, hooks: { X: "bats qui" } });
  const fuori = senzaPermessi(testo);
  assert.ok(!fuori.includes('"allow"'), "i permessi spariscono");
  assert.ok(fuori.includes("bats qui"), "il resto resta");
});

test("AR-693: con un esecutore il numero smette di essere un debito", () => {
  const con = verdettoDebitoBash({ quante: 29, esecutore: { installato: true, dove: ["ci: installa bats"] }, tetto: 29 });
  assert.equal(con.esito, "ok");
  const senza = verdettoDebitoBash({ quante: 30, esecutore: { installato: false, dove: [] }, tetto: 29 });
  assert.equal(senza.esito, "violazione", "una prova in più mentre nessuno fa girare le altre non è copertura");
});

test("il repo VERO dichiara qualcuno che esegue le prove in bash, e non è l'attrezzo stesso", () => {
  const j = JSON.parse(
    execFileSync("node", ["cervello/debito-prove-bash.mjs", "--json"], { cwd: REPO, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }),
  );
  assert.equal(j.esecutore.installato, true, "AR-693 ①: CI, VPS e avvio di sessione lo chiamano");
  assert.ok(
    j.esecutore.dove.some((d) => d.startsWith(".github/workflows/")),
    `la CI deve essere fra gli esecutori, trovati: ${j.esecutore.dove.join(" · ")}`,
  );
  assert.ok(
    !j.esecutore.dove.some((d) => d.startsWith("cervello/installa-bats")),
    "l'attrezzo non può essere il proprio esecutore",
  );
});

test("i quattro esecutori chiamano la STESSA casa: nessuna riga di installazione copiata", () => {
  const chiamanti = [
    ".github/workflows/test-cervello.yml",
    ".github/workflows/cancello-lotto.yml",
    ".claude/settings.json",
    "cervello/vps/setup.sh",
  ];
  for (const f of chiamanti) {
    const t = readFileSync(join(REPO, f), "utf8");
    assert.match(t, /installa-bats\.sh/, `${f} deve chiamare la casa unica`);
    assert.ok(!/npm\s+i(nstall)?\s+-g\s+bats/.test(t), `${f} non deve avere la sua copia del comando (cadenza-copiata-a-mano)`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ④bis DUE DEBITI, DUE NUMERI — il rosso in bash non entra nel tetto dei test in Node
// ─────────────────────────────────────────────────────────────────────────────

test("AR-693: i rossi in bash si contano a parte da quelli in Node", () => {
  const j = JSON.stringify({
    test: [
      { file: "cervello/test/a.test.mjs", esito: "ok" },
      { file: "cervello/test/b.test.mjs", esito: "rosso" },
    ],
    bats: [
      { file: "cervello/test/c.bats", esito: "rosso" },
      { file: "cervello/test/d.bats", esito: "ok" },
    ],
  });
  assert.deepEqual(testRossi(j), ["cervello/test/b.test.mjs"], "il default è la famiglia Node: blocco duro, tetto zero");
  assert.deepEqual(testRossiBash(j), ["cervello/test/c.bats"], "il debito ereditato ha il suo numero");
  assert.deepEqual(testRossi(j, "tutte").length, 2);
});

test("AR-693: prima della cura i .bats erano tutti ⚪, ed è per questo che sommarli non si notava", () => {
  const comeEraPrima = JSON.stringify({
    test: [{ file: "cervello/test/a.test.mjs", esito: "rosso" }],
    bats: [{ file: "cervello/test/c.bats", esito: "non-eseguito" }],
  });
  assert.deepEqual(testRossi(comeEraPrima, "tutte"), ["cervello/test/a.test.mjs"], "un ⚪ non è mai stato un rosso");
  assert.deepEqual(testRossiBash(comeEraPrima), [], "e quindi il conto in bash era zero: la somma funzionava per cecità");
});

test("il tetto separato è ciò che impedisce al cancello di diventare rosso per sempre appena si vede", () => {
  // Sette rossi ereditati in bash, nessuno di questo lotto, tetto dichiarato a sette: si consegna.
  assert.equal(verdettoConTetto({ codice: 1, quanti: 7, tetto: 7, delLotto: [] }).esito, "debito");
  // Ma uno in più è una regressione, e blocca.
  assert.equal(verdettoConTetto({ codice: 1, quanti: 8, tetto: 7, delLotto: [] }).esito, "violazione");
  // E ciò che il lotto TOCCA resta blocco duro anche sotto il tetto.
  assert.equal(
    verdettoConTetto({ codice: 1, quanti: 3, tetto: 7, delLotto: ["cervello/test/mio.bats"] }).esito,
    "violazione",
  );
});

test("il tetto test_bash è dichiarato, e vale il numero misurato oggi", () => {
  const t = JSON.parse(readFileSync(join(REPO, "cervello/tetti-lotto.json"), "utf8"));
  assert.equal(typeof t.test_bash, "number", "senza un numero fermo non c'è tetto che tenga");
  assert.equal(t.test_cervello, 0, "i rossi in Node restano blocco duro a zero: il tetto nuovo non li ammorbidisce");
  assert.ok(t._perche_test_bash?.length > 200, "un numero senza il perché è un numero orfano");
});

// ─────────────────────────────────────────────────────────────────────────────
// ④ter OGNI STRADA, NON SOLO QUELLA RIPARATA — il ⚪ del pacchetto mancante
// ─────────────────────────────────────────────────────────────────────────────

test("anche il ⚪ del pacchetto mancante porta il comando, quando una cura esiste", () => {
  const v = verdettoCecita({ chiave: "dipendenze-del-pannello", cieco: true, motivo: "manca il pacchetto «next»" });
  assert.match(v.riga, /npm ci --prefix pannello/);
  assert.equal(v.stato, "cieca-curabile");
});

test("SULLA STRADA VERA: una prova che non trova `next` esce ⚪ COL comando che lo installa", () => {
  // Non basta che la decisione sappia rispondere: deve essere il banco a chiamarla, sul verdetto di
  // una corsa vera. Questa è la stessa uscita che Node stampa quando `pannello/node_modules` non c'è.
  const uscita = "Error: Cannot find module 'next/server'\n    at Function._resolveFilename";
  const v = verdetto(1, uscita);
  assert.equal(v.esito, "non-eseguito", "un pacchetto assente è una prova non fatta, non una prova che fallisce");
  assert.match(v.motivo, /next/);
  assert.match(v.motivo, /npm ci --prefix pannello/, "il ⚪ deve portare il comando: è tutta la differenza fra «non si può» e «nessuno l'ha fatto»");
});

test("SULLA STRADA VERA: per un pacchetto che il Pannello non dichiara, il ⚪ resta e non inventa una cura", () => {
  const v = verdetto(1, "Error: Cannot find module 'pacchetto-che-non-esiste'\n");
  assert.equal(v.esito, "non-eseguito");
  assert.ok(!/npm ci --prefix pannello/.test(v.motivo), "una cura inventata è peggio di nessuna cura");
});

test("la cura del Pannello si DERIVA dal suo package.json, non da un elenco scritto a mano", () => {
  assert.equal(dipendenzaDelPannello("next"), true);
  assert.equal(dipendenzaDelPannello("next/server"), true, "una sotto-rotta appartiene al suo pacchetto");
  assert.equal(dipendenzaDelPannello("@types/node"), true, "un pacchetto con lo scope si legge intero");
  assert.equal(dipendenzaDelPannello("pacchetto-che-non-esiste"), false, "per questo non conosco una cura, e lo dico");
  assert.equal(
    dipendenzaDelPannello("next", () => "{ non è json"),
    null,
    "una fonte che non ho letto torna «non lo so», mai «no»: sarebbe un verdetto intero su una fonte a metà",
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ④quater AR-832 — LA CASA NATA IERI NON PUÒ ACCUSARE CHI CHIEDE DEL MESE SCORSO
// ─────────────────────────────────────────────────────────────────────────────

test("AR-832: un passo che chiede del passato e si dichiara CIECO nella casa spoglia è ⚪, non «nasce rotto»", () => {
  const v = verdettoDueCase({ casa: 0, spoglia: 2, chiedeIlPassato: true });
  assert.equal(v.esito, "non-misurato", "quella casa è un `git init` con due commit: il 2 racconta lei, non il runner");
  assert.match(v.motivo, /AR-832/);
});

test("AR-832: la porta resta STRETTA — un ROSSO nella casa spoglia resta rosso anche per quei passi", () => {
  const v = verdettoDueCase({ casa: 0, spoglia: 1, chiedeIlPassato: true });
  assert.equal(v.esito, "nasce-rotto", "1 è una violazione, non una cecità: AR-506 e AR-514 non si toccano");
});

test("AR-832: e un passo che NON chiede del passato resta giudicato com'era", () => {
  const v = verdettoDueCase({ casa: 0, spoglia: 2, chiedeIlPassato: false });
  assert.equal(v.esito, "nasce-rotto", "il ⚪ per-sempre sul runner è il difetto che questo freno esiste per trovare");
});

test("AR-832: «chiede del passato» si DERIVA dal codice, non da un elenco di nomi", () => {
  assert.equal(passaDallaPortaDellaStoria("/", "x.mjs", () => "const s = storiaDelRepoCurata(ROOT);"), true);
  assert.equal(passaDallaPortaDellaStoria("/", "x.mjs", () => "const s = statoStoria({ shallow });"), true);
  assert.equal(passaDallaPortaDellaStoria("/", "x.mjs", () => "console.log('niente storia qui');"), false);
  assert.equal(passaDallaPortaDellaStoria("/", "", () => "storiaDelRepo()"), false, "senza uno script non c'è niente da leggere");
  assert.equal(
    passaDallaPortaDellaStoria("/", "x.mjs", () => {
      throw new Error("illeggibile");
    }),
    null,
    "una fonte che non ho aperto torna «non lo so»: un `false` sarebbe un verdetto intero su una fonte mai letta",
  );
  assert.equal(passaDallaPortaDellaStoria("/", "../fuori.mjs", () => "storiaDelRepo()"), false, "niente `..`: non si legge fuori dal repo");
});

test("AR-832: se non ho potuto leggere lo script, tengo l'accusa e lo DICO", () => {
  const v = verdettoDueCase({ casa: 0, spoglia: 2, chiedeIlPassato: null });
  assert.equal(v.esito, "nasce-rotto", "il lato prudente è tenere l'accusa, non lasciarla cadere");
  assert.match(v.motivo, /Non ho potuto leggere lo script/, "ma un dubbio taciuto è un verdetto inventato");
});

// ─────────────────────────────────────────────────────────────────────────────
// ⑤ AR-652 — UN CASO SALTATO NON È UN CASO PASSATO
// ─────────────────────────────────────────────────────────────────────────────

test("AR-652: tutti i casi saltati → ⚪ col perché, mai ✅", () => {
  const tap = "1..2\nok 1 uno # skip niente chiavi qui\nok 2 due # skip niente chiavi qui\n";
  const v = verdettoBats(0, tap);
  assert.equal(v.esito, "non-eseguito", "un file dove non è stato provato niente non è verde");
  assert.match(v.motivo, /niente chiavi qui/, "e il ⚪ non è muto");
  assert.equal(v.saltati, 2);
  assert.equal(v.passati, 0, "i saltati non entrano fra i passati");
});

test("AR-652: qualcuno saltato e qualcuno passato → verde, ma i saltati restano contati", () => {
  const v = verdettoBats(0, "1..2\nok 1 uno\nok 2 due # skip serve il VPS\n");
  assert.equal(v.esito, "ok");
  assert.equal(v.saltati, 1);
  assert.equal(v.passati, 1);
});

test("AR-652: un rosso resta rosso anche in mezzo ai saltati", () => {
  const v = verdettoBats(1, "1..3\nok 1 a # skip x\nok 2 b\nnot ok 3 c\n");
  assert.equal(v.esito, "rosso");
  assert.equal(v.falliti, 1);
});

test("leggiTapBats: un file che non parte resta `null`, e null non è zero", () => {
  assert.equal(leggiTapBats("").passati, null, "nessun TAP = non è nemmeno partito");
  assert.equal(motivoDelloSkip("1..1\nok 1 a # skip perché sì\n"), "perché sì");
});

// ─────────────────────────────────────────────────────────────────────────────
// ⑥ IL PONTE — la prova in bash di n8n dichiara davvero il suo ambiente
// ─────────────────────────────────────────────────────────────────────────────

test("AR-652: n8n-placeholder.bats dichiara di saltare senza le chiavi, invece di uscire rosso", () => {
  const t = readFileSync(join(REPO, "cervello/test/n8n-placeholder.bats"), "utf8");
  assert.match(t, /skip /, "deve dichiarare lo skip");
  assert.match(t, /MARKETPLACE_SUPABASE_URL/, "e dire QUALE ambiente presume");
});
