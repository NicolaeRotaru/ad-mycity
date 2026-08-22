#!/usr/bin/env node
// 🧪 «LA SCHEDA MAL FORMATA CHIUDE DA SOLA» — il contratto del cantiere, eseguito.
//
// Il cantiere dei difetti è un registro con un contratto: come si chiama la gravità, quali campi
// sono obbligatori, che forma deve avere la prova, come si timbra una chiusura. Quel contratto
// non è mai esistito in un posto solo — ogni script se lo rileggeva a modo suo — e il registro ha
// finito per non saper leggere sé stesso. Le cinque facce misurate sul cantiere vero il 13/8:
//
//   AR-649 · 73 schede dichiarano `severita`, 580 `gravita`. Stesso concetto, due nomi.
//   AR-023 · 32 schede non hanno affatto `verifica`, che la prosa dichiara obbligatorio da mesi.
//   AR-559 · 53 schede CHIUSE hanno un comando di prova che il motore non sa eseguire. Tutte e 53.
//   AR-336 · nessuno riguarda mai un difetto chiuso: 12 prove rieseguibili non le riesegue nessuno.
//   AR-655 · l'allineatore chiudeva i findings con `chiuso_il = ""`.
//
// Questo file ESEGUE la normalizzazione — su schede inventate e sulle schede VERE, comprese le
// malformate che stanno nel registro adesso. Nessun `{file, pattern, presente}`: una ricerca di
// parole non può fallire nel modo in cui fallisce la realtà.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const CANTIERE = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");

const C = await import(join(REPO, "cervello", "contratto-scheda.mjs"));
const { eseguiProvaComando } = await import(join(REPO, "cervello", "auto-fix.mjs"));
// L'import NON deve far girare l'allineatore: prima della guardia E_CLI riscriveva due file di
// memoria al solo essere importato. Se questa riga rimette in moto il CLI, il test lo scopre.
const { chiudiFindingDalCantiere } = await import(join(REPO, "cervello", "allinea-scan-cantiere.mjs"));

const cantiere = JSON.parse(readFileSync(CANTIERE, "utf8"));
const schede = cantiere.difetti;

// ─────────────── AR-649 · la gravità e i nomi di campo fuori contratto ───────────────

test("AR-649 · la gravità si legge da entrambi i nomi, e il NOME storto resta visibile", () => {
  assert.equal(C.gravitaDi({ gravita: "grave" }), "grave");
  assert.equal(C.gravitaDi({ severita: "bloccante" }), "bloccante");
  assert.equal(C.gravitaDi({}), null, "assente resta assente: non si inventa una gravità");

  // Leggere il VALORE non basta: chi deve riparare il registro ha bisogno di sapere con quale
  // NOME è scritto. Era il buco — i guardiani leggevano il valore, trovavano `undefined` e
  // concludevano «nessuna gravità», che è un silenzio, non un errore.
  assert.equal(C.campoGravita({ severita: "grave" }), "severita");
  assert.equal(C.campoGravita({ gravita: "grave" }), "gravita");
  const a = C.aliasFuoriContratto({ severita: "grave" });
  assert.deepEqual(a, [{ campo: "severita", canonico: "gravita", valore: "grave", anche_canonico: false }]);
  assert.deepEqual(C.aliasFuoriContratto({ gravita: "grave" }), [], "il nome canonico non è un alias");
});

test("AR-649 · sul cantiere VERO il conto degli alias è > 0 e sa dire quali sono", () => {
  const conAlias = schede.filter((d) => C.aliasFuoriContratto(d).length);
  assert.ok(conAlias.length > 0, "se qui c'è 0, o il registro è stato bonificato o il rilevatore è cieco: vanno distinti");
  // La migrazione dati la esegue chi ricuce il lotto: qui si pretende solo che il codice la sappia
  // DESCRIVERE per intero, scheda per scheda. Un numero senza gli id non è una lista di lavoro.
  for (const d of conAlias) assert.ok(d.id, "ogni alias deve portare l'id della scheda da migrare");
});

// ─────────────── AR-023 · il campo obbligatorio che nessuno verificava ───────────────

test("AR-023 · una scheda senza `verifica` è una VIOLAZIONE del contratto, non un silenzio", () => {
  const v = C.verdettoProva(undefined);
  assert.equal(v.codice, C.VIOLAZIONE, "obbligatorio per iscritto e mai verificato = non obbligatorio");
  assert.equal(v.causa, "senza-verifica");
  assert.match(v.motivo, /AR-023/);
});

test("AR-023 · schedeSenzaProva le elenca, e sul cantiere vero il numero non è inventato", () => {
  const finte = [
    { id: "X1", stato: "aperto" }, // niente verifica
    { id: "X2", stato: "aperto", verifica: { comando: "node cervello/x.mjs" } },
    { id: "X3", stato: "chiuso" }, // chiusa: fuori dal conto degli aperti
    { id: "X4", stato: "da-riverificare" }, // il terzo stato conta come non chiusa
  ];
  assert.deepEqual(C.schedeSenzaProva(finte).map((s) => s.id), ["X1", "X4"]);

  const veri = C.schedeSenzaProva(schede);
  const attesi = schede.filter((d) => d.stato !== "chiuso" && !d.verifica).map((d) => d.id);
  assert.deepEqual(veri.map((s) => s.id).sort(), attesi.sort(), "il guardiano deve contare esattamente ciò che c'è nel file");
});

// ─────────────── AR-559 · la prova che il motore non sa eseguire ───────────────

test("AR-559 · «non so eseguirlo» ha un codice suo (2), diverso da «verifica umana» (0)", () => {
  // È IL CUORE. Prima erano la stessa parola — `esito: "manuale"` — e per questo 53 schede si sono
  // chiuse su una prova che nessuno ha eseguito: un metro rotto e una scelta scritta finivano nello
  // stesso cassetto. Se questi due codici tornano uguali, il difetto è tornato.
  // ⚠️ L'ESEMPIO È CAMBIATO NEL LOTTO 45, e il motivo va scritto o il prossimo lo rimette com'era.
  // Qui c'era `node --test cervello/test/cancello-stop.test.mjs`, che nel frattempo è diventato
  // ESEGUIBILE: era la clausola che restava di AR-559 — 57 schede chiuse su una prova che nessuno
  // poteva far girare, quasi tutte per cinque caratteri. Ammettere `--test` non allarga il buco
  // che questa forma difende: il pericolo sono i CARICATORI, con cui chi scrive una scheda fa
  // eseguire codice suo. Quindi l'esempio del «non so eseguirlo» adesso è un caricatore vero.
  const rotta = C.verdettoProva({ comando: "node --import ./mio.mjs cervello/test/cancello-stop.test.mjs" });
  const umana = C.verdettoProva({ tipo: "umano", nota: "la guarda Nicola" });
  assert.equal(rotta.codice, C.NON_MISURABILE, "un comando fuori forma NON è misurato: è cieco");
  assert.equal(umana.codice, C.PASSATO, "una verifica umana DICHIARATA è una scelta, non un metro rotto");
  assert.notEqual(rotta.codice, umana.codice, "se questi due tornano uguali, AR-559 è tornato");
  assert.equal(rotta.causa, "comando-non-eseguibile");
});

test("AR-559 · una prova eseguibile passa, una che dichiara una forma che non ha è violazione", () => {
  assert.equal(C.verdettoProva({ comando: "node cervello/test/x.test.mjs" }).codice, C.PASSATO);
  assert.equal(C.verdettoProva({ comando: "node cervello/salute.mjs --completo" }).codice, C.PASSATO);
  // AR-559, la clausola chiusa nel lotto 45: la forma con cui è scritta quasi tutta la suite.
  assert.equal(C.verdettoProva({ comando: "node --test cervello/test/x.test.mjs" }).codice, C.PASSATO,
    "57 schede chiuse poggiavano su questa forma: se torna rifiutata, tornano tutte non misurate");
  // …e il confine resta dov'era: un caricatore fa eseguire codice scelto da chi scrive la scheda.
  assert.equal(C.verdettoProva({ comando: "node --import ./mio.mjs cervello/a.mjs" }).codice, C.NON_MISURABILE);
  assert.equal(C.verdettoProva({ comando: "node --require x --test cervello/a.mjs" }).codice, C.NON_MISURABILE);
  // Il caso AR-592: dichiara `tipo:"comando"` e il comando non c'è. Mente sulla propria forma.
  const bugiarda = C.verdettoProva({ tipo: "comando", esito: "riprodotto" });
  assert.equal(bugiarda.codice, C.VIOLAZIONE);
  assert.equal(bugiarda.causa, "forma-mentita");
});

test("AR-559 · il MOTORE dichiara di non aver misurato, invece di dire «manuale»", () => {
  // Il punto che chiama, non solo la funzione: `eseguiProvaComando` è ciò che auto-fix usa per
  // decidere se un difetto si chiude. Non gli si passa `run`, quindi non esegue niente.
  const cieco = eseguiProvaComando("node --import ./mio.mjs cervello/test/cancello-stop.test.mjs");
  assert.equal(cieco.codice, C.NON_MISURABILE, "il verdetto sta nel CODICE: è il campo su cui il programma decide");
  assert.equal(cieco.misurato, false);
  assert.match(cieco.dettaglio, /NON HO POTUTO MISURARE/);

  // E la scheda con verifica DAVVERO umana non deve portare quel codice, o siamo daccapo.
  // (`esito` resta "manuale" in entrambi i casi apposta: lo pretende il test di sicurezza
  // `permessi-check.test.mjs`, che su quella stringa verifica il rifiuto dei comandi arbitrari.
  // Per questo la distinzione è un campo e non una parola — vedi il commento nel codice.)
  assert.equal(C.verdettoProva({ tipo: "umano" }).codice, C.PASSATO);
  assert.notEqual(C.verdettoProva({ tipo: "umano" }).codice, cieco.codice);
});

test("AR-559 · la difesa di sicurezza resta intatta: un comando arbitrario NON viene eseguito", () => {
  // Il fix tocca l'ETICHETTA di un rifiuto, non il rifiuto. Il runner finto esplode se invocato:
  // se una di queste forme passasse il filtro, questo test rompe. È l'invariante che conta più di
  // tutto il resto di questa corsia — un difetto non deve poter far girare codice per chiudersi.
  const mai = () => { throw new Error("non doveva essere eseguito"); };
  for (const c of ["rm -rf /", 'bash -c "x"', "node /tmp/evil.mjs", "node ../fuori.mjs", "node cervello/x.mjs; rm -rf /", "", null]) {
    const r = eseguiProvaComando(c, mai);
    assert.equal(r.codice, C.NON_MISURABILE, `doveva rifiutare senza eseguire: ${JSON.stringify(c)}`);
    assert.equal(r.esito, "manuale", "l'etichetta storica resta: la difende permessi-check.test.mjs");
  }
});

test("AR-559 · sul cantiere VERO le prove cieche sono contate, e sono quasi tutte su schede CHIUSE", () => {
  const cieche = C.proveNonMisurabili(schede).filter((v) => v.causa === "comando-non-eseguibile");
  assert.ok(cieche.length > 0, "erano 53 il 13/8: uno zero qui va spiegato, non festeggiato");
  const chiuse = cieche.filter((v) => v.stato === "chiuso");
  // Il fatto che fa male: la porta automatica quei comandi li RIFIUTA, quindi ogni scheda chiusa
  // così è passata dalla porta a mano — che chiudeva in silenzio ciò che l'altra si rifiutava di
  // chiudere. Finché il numero non scende, questa riga tiene il conto sotto gli occhi.
  assert.ok(chiuse.length > 0, "se nessuna è chiusa il debito è stato saldato: allora si abbassa il tetto");
  for (const v of cieche) assert.ok(v.comando && v.motivo, "ogni voce deve dire QUALE comando e PERCHÉ non si esegue");
});

test("AR-559 · il tetto scende e non risale, e «non lo so» non è un verde", () => {
  assert.equal(C.verdettoTettoDiscendente(50, 53).codice, C.PASSATO);
  assert.equal(C.verdettoTettoDiscendente(50, 53).tettoNuovo, 50, "sceso: il tetto nuovo è oggi");
  assert.equal(C.verdettoTettoDiscendente(54, 53).codice, C.VIOLAZIONE, "cresciuto = rosso");
  assert.equal(C.verdettoTettoDiscendente(50, undefined).codice, C.NON_MISURABILE, "tetto non dichiarato ≠ tutto bene");
});

// ─────────────── AR-336 · chi riguarda un difetto chiuso ───────────────

test("AR-336 · la copertura delle prove dei CHIUSI è divisa per rischio, non in un numero solo", () => {
  const cop = C.coperturaChiusi([
    { id: "S1", stato: "chiuso", verifica: { comando: "node cervello/test/a.test.mjs" } }, // suite
    { id: "S2", stato: "chiuso", verifica: { comando: "node cervello/peso-contesto.mjs" } }, // fuori suite
    { id: "S3", stato: "chiuso", verifica: { comando: "node --import ./x.mjs cervello/test/b.test.mjs" } }, // cieca (caricatore)
    { id: "S4", stato: "chiuso", verifica: { file: "a.mjs", pattern: "x" } }, // debole
    { id: "S5", stato: "chiuso" }, // niente
    { id: "S6", stato: "aperto", verifica: { comando: "node cervello/x.mjs" } }, // non chiusa: fuori
  ]);
  assert.deepEqual(cop.suite.map((x) => x.id), ["S1"]);
  assert.deepEqual(cop.fuori_suite.map((x) => x.id), ["S2"], "è il buco vero: rieseguibile e nessuno la riesegue");
  assert.deepEqual(cop.non_misurabili.map((x) => x.id), ["S3"]);
  assert.deepEqual(cop.deboli.map((x) => x.id), ["S4"]);
  assert.deepEqual(cop.senza_prova.map((x) => x.id), ["S5"]);
});

test("AR-336 · sul cantiere VERO il buco è misurato, non ricordato", () => {
  const cop = C.coperturaChiusi(schede);
  const chiusi = schede.filter((d) => d.stato === "chiuso").length;
  assert.equal(
    cop.suite.length + cop.fuori_suite.length + cop.non_misurabili.length + cop.deboli.length + cop.senza_prova.length,
    chiusi,
    "ogni difetto chiuso deve finire in UNO dei cinque gruppi: se il conto non torna, qualcuno sparisce",
  );
  // La scheda del 28/7 diceva «il buco fuori dalla suite è di QUATTRO». Rimisurato il 13/8: 12.
  // Un numero si rimisura, non si ricorda — e questa riga è ciò che impedisce di ricordarlo.
  assert.ok(cop.fuori_suite.length > 0, "zero qui significherebbe che nessuna prova di un chiuso è rieseguibile fuori dalla suite");
});

test("AR-336 · `rivedi-chiusi` gira davvero, non riapre niente e DICHIARA la copertura", () => {
  const prima = readFileSync(CANTIERE, "utf8");
  const r = spawnSync(process.execPath, [join(REPO, "cervello", "auto-fix.mjs"), "rivedi-chiusi"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 300_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /COPERTURA DICHIARATA/, "un verde che non dice cosa NON ha guardato è il difetto, non la cura");
  assert.equal(readFileSync(CANTIERE, "utf8"), prima, "rivedere i chiusi NON deve riaprire né riscrivere niente");
});

// ─────────────── AR-655 · la chiusura con la data vuota ───────────────

test("AR-655 · l'allineatore NON può più chiudere un finding con la data vuota", () => {
  // La riga che c'era: `f.chiuso_il = f.chiuso_il || d.chiuso_il || ""`. Il caso che la rompeva è
  // questo: il difetto del cantiere non ha data, quindi il finding si chiudeva con `""`.
  const f = { titolo: "un finding qualunque", stato: "aperto" };
  chiudiFindingDalCantiere(f, { id: "AR-1", stato: "chiuso" }, "2026-08-13 22:10");
  assert.equal(f.stato, "chiuso");
  assert.match(f.chiuso_il, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/, "prima qui restava la stringa vuota");
  assert.equal(f.cantiere_id, "AR-1");
});

test("AR-655 · una data SENZA ORA del cantiere non si propaga: si prende l'adesso", () => {
  // 24 schede chiuse portano «2026-08-04» senza ora. Ereditarla qui rifarebbe il buco con un
  // campo pieno invece che vuoto — che è peggio, perché sembra a posto.
  const f = { titolo: "x", stato: "aperto" };
  chiudiFindingDalCantiere(f, { id: "AR-2", stato: "chiuso", chiuso_il: "2026-08-04" }, "2026-08-13 22:10");
  assert.equal(f.chiuso_il, "2026-08-13 22:10", "la data secca non entra: entra un timbro con l'ora");
});

test("AR-655 · un timbro GIÀ valido non si sovrascrive (la storia non si riscrive)", () => {
  const f = { titolo: "x", stato: "chiuso", chiuso_il: "2026-07-01 09:00" };
  chiudiFindingDalCantiere(f, { id: "AR-3", stato: "chiuso", chiuso_il: "2026-08-01 10:00" }, "2026-08-13 22:10");
  assert.equal(f.chiuso_il, "2026-07-01 09:00");
});

test("AR-655 · il timbro unico RIFIUTA una data senza ora, da qualunque strada arrivi", () => {
  assert.throws(() => C.timbraChiusura({ id: "AR-9" }, { quando: "2026-08-13" }), /senza ora/);
  assert.equal(C.timbroValido("2026-08-13 22:10"), true);
  assert.equal(C.timbroValido("2026-08-13"), false);
  assert.equal(C.timbroValido(""), false);
  assert.equal(C.timbroValido(undefined), false, "il buco che ha prodotto le 74 orfane era esattamente questo");
});

test("AR-655 · sul cantiere VERO i timbri storti sono contati (0 senza data, ma 24 senza ora)", () => {
  const storti = C.timbriStorti(schede);
  const attesi = schede.filter((d) => d.stato === "chiuso" && !C.timbroValido(d.chiuso_il ?? d.chiuso)).map((d) => d.id);
  assert.deepEqual(storti.map((s) => s.id).sort(), attesi.sort());
});

// ─────────────── AR-360 · l'etichetta che il volano non sa instradare ───────────────

test("AR-360 · un finding senza `genera` è una violazione, e si normalizza su solo-report", () => {
  assert.equal(C.verdettoFinding({ genera: "lezione" }).codice, C.PASSATO);
  const senza = C.verdettoFinding({ titolo: "x" });
  assert.equal(senza.codice, C.VIOLAZIONE);
  assert.equal(senza.normalizzato, "solo-report", "non si lascia cadere: si instrada nel posto più innocuo, dichiarandolo");
  const fuori = C.verdettoFinding({ genera: "scrivi-il-fix" });
  assert.equal(fuori.codice, C.VIOLAZIONE, "un valore inventato non è un valore");
  assert.equal(fuori.normalizzato, "solo-report");
});

test("AR-360 · l'elenco ammesso qui è LO STESSO dello schema che lo impone a chi scrive", () => {
  // La causa di sistema: «i contratti sono dichiarati all'ingresso e mai riverificati all'uscita».
  // Se le due liste divergono, il guardiano diventa più permissivo dello schema senza che nessuno
  // se ne accorga — e questa riga è ciò che lo impedisce.
  const wf = readFileSync(join(REPO, ".claude/workflows/auto-radiografia.js"), "utf8");
  const m = wf.match(/genera:\s*\{\s*type:\s*'string',\s*enum:\s*\[([^\]]+)\]/);
  assert.ok(m, "se lo schema del workflow cambia forma, questo test lo deve dire invece di passare");
  const dalloSchema = m[1].split(",").map((s) => s.trim().replace(/^'|'$/g, ""));
  assert.deepEqual([...C.GENERA_AMMESSI].sort(), dalloSchema.sort());
});

test("AR-360 · sulla radiografia VERA i findings non instradabili sono contati", () => {
  const rad = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-radiografia.json"), "utf8"));
  const fuori = C.findingsFuoriContratto(rad);
  const tot = (rad.dimensioni || []).reduce((n, d) => n + (d.findings || []).length, 0);
  assert.ok(tot > 0, "una radiografia senza findings renderebbe questa prova vacua");
  assert.ok(fuori.length > 0, "erano 163 su 286 il 13/8: uno zero qui va spiegato");
  for (const f of fuori) assert.ok(f.motivo && f.normalizzato, "ogni voce deve dire perché e dove finirebbe");
});

// ─────────────── il referto che si tronca da solo ───────────────

test("il guardiano consegna il referto INTERO su una pipe, e i suoi codici d'uscita non cambiano", () => {
  // Trovato allargando il report, il 13/8. Quando stdout è una pipe le scritture di node sono
  // asincrone: il sistema ne accetta 64 KB e il resto aspetta. `process.exit()` non aspettava —
  // buttava via la coda. Il referto `--json` è 166 KB e ne arrivavano 65.536 esatti, tagliato a
  // metà stringa: chi lo legge riceve un errore di parsing invece di un verdetto.
  //
  // Non era colpa dell'ultima riga aggiunta: già senza le colonne nuove il referto pesava 114 KB,
  // cioè stava sopra la soglia da un pezzo e il taglio dipendeva dal caso. Un guardiano che a
  // volte consegna e a volte no è peggio di uno rotto, perché il verde sembra un verde.
  const r = spawnSync(process.execPath, [join(REPO, "cervello", "cantiere-prove.mjs"), "--dry", "--json"], {
    cwd: REPO, encoding: "utf8", timeout: 120_000, maxBuffer: 128 * 1024 * 1024,
  });
  assert.equal(r.status, 0, "senza gate il guardiano esce 0");
  assert.ok(r.stdout.length > 65_536, `il referto arriva intero (${r.stdout.length} byte): 65536 esatti = tagliato dal buffer della pipe`);
  const j = JSON.parse(r.stdout); // se è troncato, questa riga lancia: è la prova
  for (const k of ["schede_incomplete", "schede_senza_prova", "prove_non_misurabili", "alias_fuori_contratto", "timbri_storti"]) {
    assert.ok(Array.isArray(j[k]), `senza \`${k}\` nel referto quel debito torna invisibile`);
  }

  // I codici d'uscita devono essere quelli di prima: `exitCode` invece di `exit()` cambia QUANDO
  // si esce, non CON QUALE numero. Se un gate smette di essere rosso, il freno è spento.
  const gate = spawnSync(process.execPath, [join(REPO, "cervello", "cantiere-prove.mjs"), "--dry", "--gate-prove"], {
    cwd: REPO, encoding: "utf8", timeout: 120_000, maxBuffer: 128 * 1024 * 1024,
  });
  assert.equal(gate.status, 1, "finché esistono prove che il motore non sa eseguire, --gate-prove è ROSSO");
});

// ─────────────── il verdetto d'insieme ───────────────

test("normalizzaScheda dà UN verdetto solo, e la violazione batte il cieco", () => {
  // Una scheda perfetta.
  const sana = C.normalizzaScheda({
    id: "AR-1", stato: "aperto", gravita: "grave", impatto_crescita: "alto",
    nato: "2026-08-01 09:00", verifica: { comando: "node cervello/test/x.test.mjs" },
  });
  assert.equal(sana.codice, C.PASSATO);

  // Una scheda solo CIECA: il contratto regge, il metro no.
  const cieca = C.normalizzaScheda({
    id: "AR-2", stato: "aperto", gravita: "grave", impatto_crescita: "alto",
    // Caricatore: è ciò che resta giustamente non eseguibile dopo il lotto 45 (vedi AR-559 sopra).
    nato: "2026-08-01 09:00", verifica: { comando: "node --import ./x.mjs cervello/test/x.test.mjs" },
  });
  assert.equal(cieca.codice, C.NON_MISURABILE);

  // Una scheda che rompe il contratto E è cieca: comanda la violazione, perché è un fatto
  // accertato mentre un cieco è una domanda aperta — e il fatto accertato si ripara per primo.
  const rotta = C.normalizzaScheda({
    id: "AR-3", stato: "aperto", severita: "grave",
    verifica: { comando: "node --test cervello/test/x.test.mjs" },
  });
  assert.equal(rotta.codice, C.VIOLAZIONE);
  assert.deepEqual(rotta.campi_mancanti, ["impatto_crescita", "nato"]);
  assert.equal(rotta.alias_fuori_contratto.length, 1);
  assert.equal(rotta.gravita, "grave", "il valore si legge lo stesso: il nome storto non deve renderla invisibile");

  // Una minore incompleta: il contratto resta morbido dove non si decide la priorità.
  assert.deepEqual(C.normalizzaScheda({ id: "AR-4", stato: "aperto", gravita: "minore", verifica: { tipo: "umano" } }).campi_mancanti, []);
});

test("il contratto lo legge UNA porta sola: i chiamanti riesportano, non ricopiano", async () => {
  // LA RADICE. Se qualcuno riscrive `gravitaDi` a mano dentro un chiamante, i due lettori tornano
  // a divergere ed è esattamente la malattia. Qui si pretende che siano LA STESSA funzione.
  const cp = await import(join(REPO, "cervello", "cantiere-prove.mjs"));
  const af = await import(join(REPO, "cervello", "auto-fix.mjs"));
  assert.equal(cp.gravitaDi, C.gravitaDi, "cantiere-prove deve riesportare la funzione del contratto, non una copia");
  assert.equal(cp.schedeIncomplete, C.schedeIncomplete);
  assert.equal(af.timbraChiusura, C.timbraChiusura, "auto-fix deve riesportare il timbro, non tenersene uno suo");
});
