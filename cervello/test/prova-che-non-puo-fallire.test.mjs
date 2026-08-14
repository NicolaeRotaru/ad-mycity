#!/usr/bin/env node
// 🧪 LA PROVA CHE NON PUÒ FALLIRE — il metro stesso, messo alla prova.
//
// LA MALATTIA. Un difetto dichiarato CHIUSO il cui freno non frena vale meno di un difetto aperto:
// nessuno lo riguarderà più. Nel lotto 42 se n'erano contate cinque forme, tutte dentro il metro:
//
//   · casi di prova asincroni che il banco non aspetta — l'asserzione gira dopo il conteggio, e un
//     `1 = 2` stampa «passato» (AR-694);
//   · una prova che punta a un file inesistente contata come «fix in attesa», cioè auto-chiudibile,
//     e con `presente:false` addirittura come «soddisfatta» perché il file è SPARITO (AR-686);
//   · un difetto APERTO senza mutazione contato come debito NUOVO di chi lo riapre, cosicché la
//     strada comoda diventa lasciare la scheda chiusa (AR-692);
//   · una prova ROSSA sotto una scheda marcata chiusa, che nessuno riguarda (AR-683);
//   · un freno dichiarato senza la mutazione che lo faccia scattare, contato come freno vero perché
//     un'ALTRA mutazione tocca lo stesso file (AR-596/AR-565).
//
// Qui si ESEGUONO le decisioni, non si cerca una parola in un file: è tutto il punto della corsia.
// Le funzioni vivono in `cervello/contratto-prova.mjs`, pure apposta perché una prova le possa
// mettere in ogni stato senza costruire un repo, un cantiere finto o una sessione.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

// I moduli si caricano QUI, non dentro i casi: è esattamente il difetto che questo file misura
// (AR-694). Il banco qui sotto lancia i casi con `fn()` secco, quindi un caso `async` non potrebbe
// fallire — e un file che misura i casi spenti non può averne uno dentro.
const {
  bancoLocale,
  casiSpenti,
  chiusureDaRiverificare,
  classificaProva,
  debitoDiMutazione,
  misuraFreni,
  puoAutoChiudere,
} = await import(join(REPO, "cervello/contratto-prova.mjs"));
const { classifica } = await import(join(REPO, "cervello/cantiere-prove.mjs"));
const { perimetroDichiarato, testDelLotto } = await import(join(REPO, "cervello/tetto-guardiano.mjs"));
const { malatiToccati } = await import(join(REPO, "cervello/import-che-esegue.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n").slice(0, 3).join(" | ") });
  }
};

// ── AR-694 — un caso che non può fallire ─────────────────────────────────────

const BANCO_SECCO = `const prova = (nome, fn) => {\n  try {\n    fn();\n    casi.push({ nome, ok: true });\n  } catch (e) {\n    casi.push({ nome, ok: false });\n  }\n};\n`;
const BANCO_ASPETTA = `const prova = async (nome, fn) => {\n  try {\n    await fn();\n    casi.push({ nome, ok: true });\n  } catch (e) {\n    casi.push({ nome, ok: false });\n  }\n};\n`;
const BANCO_RINVIA = `const prova = (nome, fn) => {\n  daFare.push(async () => {\n    try {\n      await fn();\n      casi.push({ nome, ok: true });\n    } catch (e) {\n      casi.push({ nome, ok: false });\n    }\n  });\n};\n`;
const BANCO_REGISTRA = `const prova = (nome, fn) => casi.push({ nome, fn });\n`;

prova("AR-694: un caso async lanciato da un banco che non lo aspetta è SPENTO", () => {
  const spenti = casiSpenti(`${BANCO_SECCO}\nprova("il caso che ha rotto", async () => {\n  assert.equal(1, 2);\n});\n`);
  assert.equal(spenti.length, 1, "un caso che non può fallire deve essere trovato");
  assert.equal(spenti[0].nome, "il caso che ha rotto");
  assert.match(spenti[0].motivo, /senza aspettarlo/);
});

prova("AR-694: un caso SINCRONO nello stesso banco non è spento — il segnale non è la parola async", () => {
  assert.deepEqual(casiSpenti(`${BANCO_SECCO}\nprova("caso sano", () => {\n  assert.equal(1, 1);\n});\n`), []);
});

prova("AR-694: le tre forme SANE non vengono accusate (banco che aspetta, che rinvia, che registra)", () => {
  // ① il banco aspetta il caso e chi chiama aspetta il banco
  assert.deepEqual(casiSpenti(`${BANCO_ASPETTA}\nawait prova("uno", async () => {});\n`), [], "banco che aspetta + chiamata attesa");
  // ② il banco mette il caso in coda e il file la svuota in fondo con await
  assert.deepEqual(casiSpenti(`${BANCO_RINVIA}\nprova("due", async () => {});\n`), [], "banco che rinvia in coda");
  // ③ il banco registra il caso come dato e un ciclo lo esegue dopo
  assert.deepEqual(casiSpenti(`${BANCO_REGISTRA}\nprova("tre", async () => {});\n`), [], "banco che registra");
});

prova("AR-694: un banco che aspetta il caso ma NON viene atteso è comunque spento", () => {
  // La forma più insidiosa: dentro il banco c'è `await fn()`, quindi a occhio sembra a posto. Ma il
  // banco è `async` e chi lo chiama butta via la sua promessa: il conteggio esce prima lo stesso.
  const spenti = casiSpenti(`${BANCO_ASPETTA}\nprova("quattro", async () => {});\n`);
  assert.equal(spenti.length, 1);
  assert.match(spenti[0].motivo, /non aspetta/);
});

prova("AR-694: un banco che non è definito in questo file non lo giudico (misura per DIFETTO)", () => {
  // `test` di node:test i casi asincroni li aspetta di suo. Accusarlo sarebbe inventare un rosso;
  // tacerlo sarebbe fingere di aver guardato. Qui si sceglie di non accusare, ed è dichiarato.
  assert.equal(bancoLocale(`import { test } from "node:test";\n`, "test"), null);
  assert.deepEqual(casiSpenti(`import { test } from "node:test";\ntest("x", async () => {});\n`), []);
});

prova("AR-694: i tre file riparati dal lotto 42 non hanno più nessun caso spento", () => {
  for (const f of ["lib-cadenza.test.mjs", "mutazione-mancante.test.mjs", "perimetro-main.test.mjs"]) {
    const spenti = casiSpenti(readFileSync(join(QUI, f), "utf8"));
    assert.deepEqual(spenti, [], `${f} ha ancora ${spenti.length} casi che non possono fallire`);
  }
});

// ── AR-686 — un puntatore rotto non è un fix in attesa ───────────────────────

prova("AR-686: una prova che punta a un file inesistente NON è auto-chiudibile", () => {
  const c = classificaProva({ file: "cervello/mai-esistito.mjs", pattern: "x", presente: true }, { fileEsiste: () => false });
  assert.equal(c.tipo, "orfana");
  assert.equal(c.auto_chiudibile, false, "un puntatore rotto non è un fix in arrivo: è un puntatore rotto");
});

prova("AR-686: con `presente:false` il file sparito COMBACIAVA — cioè chiudeva il difetto", () => {
  const c = classificaProva({ file: "cervello/sparito.mjs", pattern: "x", presente: false }, { fileEsiste: () => false });
  assert.equal(c.auto_chiudibile, false, "il difetto si sarebbe chiuso perché il file non c'è più");
  assert.match(c.motivo, /si chiuderebbe da solo/);
});

prova("AR-686: le prove sane restano sane (comando, pattern su file vero, verifica umana)", () => {
  assert.equal(classificaProva({ comando: "node cervello/x.mjs" }, {}).auto_chiudibile, true);
  assert.equal(classificaProva({ file: "c/x.mjs", pattern: "y" }, { fileEsiste: () => true }).tipo, "pattern");
  assert.equal(classificaProva({ tipo: "umano" }, {}).tipo, "umana");
  assert.equal(classificaProva(null, {}).auto_chiudibile, false, "nessuna prova non è una prova");
});

prova("AR-686: il guardiano del cantiere lo classifica «prova-orfana», non «fix in attesa»", () => {
  // La funzione vera, non una sua copia: `classifica` è ciò che il report del cantiere usa davvero.
  const v = classifica({ id: "AR-000", gravita: "grave", nato: "2026-01-01", verifica: { file: "cervello/mai-esistito-42.mjs", pattern: "x", presente: false } });
  assert.equal(v.auto_chiudibile, false, "prima era `auto-ok`: il difetto si chiudeva perché il file non esiste");
  assert.equal(v.classe, "prova-orfana");
});

prova("AR-686: una prova che NON è stata eseguita non chiude niente, per quanto sia ben formata", () => {
  const d = { id: "AR-1", verifica: { comando: "node cervello/x.mjs" } };
  assert.equal(puoAutoChiudere(d, { esito: "risolto", misurato: false }).ok, false, "«non ho potuto misurare» non è un verde");
  assert.equal(puoAutoChiudere(d, { esito: "risolto" }).ok, true);
  assert.equal(puoAutoChiudere(d, { esito: "aperto" }).ok, false);
});

// ── AR-692 — riaprire onestamente non è aggiungere debito ────────────────────

prova("AR-692: i tre debiti si separano — riparato, riaperto, aperto da sempre", () => {
  const difetti = [
    { id: "AR-1", stato: "chiuso", verifica: { comando: "node a.mjs" } },
    { id: "AR-2", stato: "aperto", verifica: { comando: "node b.mjs" } },
    { id: "AR-3", stato: "aperto", verifica: { comando: "node c.mjs" } },
    { id: "AR-4", stato: "aperto", verifica: { file: "x", pattern: "y" } },
  ];
  const d = debitoDiMutazione(difetti, () => false, (id) => id === "AR-2");
  assert.deepEqual(d.riparati.map((x) => x.id), ["AR-1"], "una scheda chiusa senza mutazione è il debito VERO");
  assert.deepEqual(d.riaperti.map((x) => x.id), ["AR-2"], "chi riapre non ha aggiunto niente: l'ha reso visibile");
  assert.deepEqual(d.aperti.map((x) => x.id), ["AR-3"], "aperto da sempre: debito ereditato, si conta e si vede");
  assert.equal(d.senzaProvaAComando, 1, "le prove a pattern qui non entrano: le governa un'altra regola");
});

prova("AR-692: chi ha la sua mutazione non compare in nessuno dei tre conti", () => {
  const difetti = [{ id: "AR-9", stato: "chiuso", verifica: { comando: "node a.mjs" } }];
  const d = debitoDiMutazione(difetti, () => true, () => false);
  assert.deepEqual([d.riparati.length, d.aperti.length, d.riaperti.length], [0, 0, 0]);
});

// ── AR-683 — una scheda chiusa con la prova rossa adesso ─────────────────────

const fileDelComandoFinto = (c) => (String(c).match(/\S+\.(?:mjs|bats)/) || [null])[0];

prova("AR-683: una scheda CHIUSA la cui prova è rossa adesso viene trovata", () => {
  const difetti = [
    { id: "AR-1", stato: "chiuso", verifica: { comando: "node cervello/test/rosso.test.mjs" } },
    { id: "AR-2", stato: "chiuso", verifica: { comando: "node cervello/test/verde.test.mjs" } },
    { id: "AR-3", stato: "aperto", verifica: { comando: "node cervello/test/rosso.test.mjs" } },
  ];
  const verdetti = new Map([
    ["cervello/test/rosso.test.mjs", "rosso"],
    ["cervello/test/verde.test.mjs", "ok"],
  ]);
  const fuori = chiusureDaRiverificare(difetti, verdetti, fileDelComandoFinto);
  assert.deepEqual(fuori.map((x) => x.id), ["AR-1"], "solo le CHIUSE: su una aperta un rosso è normale");
  assert.equal(fuori[0].stato, "regredita");
});

prova("AR-683: una prova NON ESEGUITA è ⚪, non un fix regredito", () => {
  const difetti = [{ id: "AR-1", stato: "chiuso", verifica: { comando: "bats cervello/test/x.bats" } }];
  const fuori = chiusureDaRiverificare(difetti, new Map([["cervello/test/x.bats", "non-eseguito"]]), fileDelComandoFinto);
  assert.equal(fuori[0].stato, "non-misurata", "manca lo strumento: non è il fix che è tornato indietro");
});

prova("AR-683: il banco dei test lo dice da solo, senza che nessuno glielo chieda", () => {
  // Non la funzione: il BANCO vero, con la sua uscita in JSON. Se questa chiave sparisce, nessuno
  // incrocia più i rossi con le schede chiuse — che è com'era prima, e per questo non se n'è accorto
  // nessuno per settimane.
  const r = spawnSync("node", [join(REPO, "cervello/test-cervello.mjs"), "--json", "--solo", "prova-che-non-puo-fallire"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 300_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  const j = JSON.parse(r.stdout);
  assert.ok(Array.isArray(j.chiusure_da_riverificare), "il banco deve consegnare l'incrocio, anche a zero");
  assert.ok(Array.isArray(j.casi_spenti), "e il conto dei casi che non possono fallire");
  assert.ok(Array.isArray(j.non_misurati), "e quelli che non ha potuto far girare: ⚪ non è un verde");
});

// ── AR-693 — le prove che nessuno esegue non escono dal denominatore ─────────

prova("AR-693: una prova non eseguita resta NEL totale come ⚪, non sparisce dal denominatore", () => {
  // Il caso vero: 29 prove in bash che girano solo se `bats` è installato, e non lo installa né la
  // CI né il VPS né una sessione nuova. Il banco le toglieva dal conto e diceva «girano tutti e
  // passano tutti»: un metro che restringe il campione fa salire il voto misurando di meno.
  // `due-worker` esiste solo in bash: senza bats è il caso peggiore, un file su un file.
  const r = spawnSync("node", [join(REPO, "cervello/test-cervello.mjs"), "--solo", "due-worker"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 300_000,
    env: { ...process.env, BATS_BIN: "/percorso/che/non/esiste" },
  });
  const uscita = `${r.stdout || ""}${r.stderr || ""}`;
  assert.match(uscita, /su 1/, "il denominatore dev'essere quello vero: 1 prova, non 0");
  assert.match(uscita, /⚪ 1 NON le ho potute far girare qui/, "e il buco va detto accanto al verde, non solo in mezzo all'elenco");
});

// ── AR-596 / AR-565 — un freno vero, una definizione sola ────────────────────

const LEZIONE = (id, gate) => ({ id, gate });
const MUTA = (lezione, file, cerca) => ({ lezione, file, cerca, sostituisci: "" });
const MONDO = { "cervello/freno.mjs": "if (soglia > MAX) process.exit(1);" };
const esiste = (f) => Object.prototype.hasOwnProperty.call(MONDO, f);
const leggi = (f) => (esiste(f) ? MONDO[f] : null);
const fileDelGate = (g) => (String(g).match(/\S+\.mjs/) || [null])[0];

prova("AR-596: un freno coperto solo dalla mutazione di un ALTRO non conta come freno suo", () => {
  const m = misuraFreni(
    [LEZIONE("L-1", "node cervello/freno.mjs"), LEZIONE("L-2", "node cervello/freno.mjs")],
    [MUTA("L-1", "cervello/freno.mjs", "if (soglia > MAX) process.exit(1);")],
    esiste,
    leggi,
    fileDelGate,
  );
  assert.deepEqual(m.veri.map((x) => x.lezione), ["L-1"], "L-1 ha la SUA mutazione");
  assert.deepEqual(m.perFile.map((x) => x.lezione), ["L-2"], "L-2 è coperta da quella di un'altra: è un grado diverso");
  assert.equal(m.violazioni.length, 0, "e non è una violazione: 21 correzioni sullo stesso guardiano non vogliono 21 copie");
  assert.equal(m.dichiarati, 2, "nessun gate sparisce dal conto");
});

prova("AR-596: il guardiano dei gate dice il numero, non solo il verde", () => {
  const r = spawnSync("node", [join(REPO, "cervello/gate-veri.mjs")], { cwd: REPO, encoding: "utf8", timeout: 120_000 });
  const uscita = `${r.stdout || ""}${r.stderr || ""}`;
  assert.match(uscita, /con la PROPRIA mutazione/, "il verde va scomposto: senza, il buco resta dentro il numero buono");
  assert.match(uscita, /coperti solo dalla mutazione di un altro/);
});

prova("AR-565: la definizione di «freno vero» è UNA, e la usa il guardiano dei gate", () => {
  const src = readFileSync(join(REPO, "cervello/gate-veri.mjs"), "utf8");
  assert.match(src, /import \{ misuraFreni \} from "\.\/contratto-prova\.mjs"/, "la regola si importa, non si ricopia");
  // E la prova che l'import non sia decorativo: la funzione vera cambia il verdetto vero.
  const m = misuraFreni([LEZIONE("L-1", "node cervello/sparito.mjs")], [], esiste, leggi, fileDelGate);
  assert.equal(m.violazioni[0].regola, "gate-orfano");
});

// ── AR-685 — il referto che si troncava a 64 KB su una pipe ──────────────────

prova("AR-685: il referto del guardiano delle prove arriva INTERO anche da una PIPE DI SHELL, ed è rosso", () => {
  // Il guasto, riprodotto: con stdout su pipe le scritture di node sono asincrone — il sistema ne
  // accetta 65.536 byte e il resto aspetta — e `process.exit()` non aspetta: butta via la coda. Il
  // JSON tagliato non si parsa, quindi chi legge riceve un errore invece di un verdetto.
  //
  // ⚠️ LA PIPE DEV'ESSERE QUELLA DI UNA SHELL. Con `spawnSync` diretto il taglio non si vede (node
  // legge dall'altro capo abbastanza in fretta) e una prova scritta così resta verde anche col fix
  // disfatto: misurato in questo lotto, ed è la trappola esatta che la corsia cura. Il modo in cui
  // questo referto viene letto davvero è `$(...)` e `| esito_righe` dentro giro.sh: la prova usa
  // quello. Col fix rotto qui arrivano 65.536 byte esatti, tagliati a metà stringa.
  const r = spawnSync("bash", ["-c", "node cervello/cantiere-prove.mjs --dry --json --gate 2>/dev/null | cat"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 300_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  assert.ok(r.stdout.length > 65_536, `il referto dev'essere più grosso del buffer della pipe per provare qualcosa: ${r.stdout.length} byte`);
  const j = JSON.parse(r.stdout); // se si tronca, questa riga esplode
  assert.ok(Array.isArray(j.voci) && j.voci.length > 0, "e dev'essere il referto vero, non un troncone che si parsa per caso");
  // E il verdetto non si perde per strada: il codice d'uscita di `node` dentro la pipe.
  const codice = spawnSync("bash", ["-c", "node cervello/cantiere-prove.mjs --dry --json --gate >/dev/null 2>&1; echo $?"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 300_000,
  }).stdout.trim();
  assert.equal(codice, "1", "il referto arriva intero E il gate resta rosso: le due cose insieme");
});

// ── AR-678 — «cosa ho toccato io» su un tronco condiviso ─────────────────────

prova("AR-678: senza dichiarazione git attribuisce a me anche il lavoro delle altre corsie", () => {
  const albero = ["cervello/test/mio.test.mjs", "cervello/test/di-un-altra-corsia.test.mjs"];
  assert.deepEqual(testDelLotto(albero, []), albero.sort(), "è la sovrastima di git: blocca troppo, non troppo poco");
});

prova("AR-678: con il perimetro dichiarato resta soltanto ciò che è mio", () => {
  const albero = ["cervello/test/mio.test.mjs", "cervello/test/di-un-altra-corsia.test.mjs"];
  const mio = perimetroDichiarato("cervello/test/mio.test.mjs");
  assert.deepEqual(testDelLotto(albero, [], "cervello/test/", mio), ["cervello/test/mio.test.mjs"]);
  // e lo stesso per i moduli che eseguono al caricamento
  const malati = [{ nome: "mio.mjs", righe: ["main();"] }, { nome: "altrui.mjs", righe: ["main();"] }];
  const misurati = ["mio.mjs", "altrui.mjs"];
  const cambiati = ["cervello/mio.mjs", "cervello/altrui.mjs"];
  assert.deepEqual(malatiToccati(malati, cambiati, misurati, perimetroDichiarato("cervello/mio.mjs")), ["mio.mjs"]);
  assert.deepEqual(malatiToccati(malati, cambiati, misurati).sort(), ["altrui.mjs", "mio.mjs"], "senza dichiarazione restano tutti");
});

prova("AR-678: una dichiarazione vuota non è una dichiarazione (e non assolve nessuno)", () => {
  assert.equal(perimetroDichiarato(""), null);
  assert.equal(perimetroDichiarato("   ,  \n "), null);
  assert.deepEqual(perimetroDichiarato("a.mjs,b.mjs\nc.mjs"), ["a.mjs", "b.mjs", "c.mjs"]);
  assert.equal(malatiToccati([], null, []), null, "git muto resta muto: non attribuisco e non assolvo");
});

// ── esito ────────────────────────────────────────────────────────────────────
let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
