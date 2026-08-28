#!/usr/bin/env node
// 🧨 AR-840 — LA CURA ALLA RADICE: «il banco lanciava le prove nel modo sbagliato, e chiamava
//              quel fallimento "la prova è diventata rossa"».
//
// Il difetto, in una riga: `non-vacuita.mjs` riconosce «la prova morde» da UNA cosa sola — il
// comando è uscito ≠ 0. E lanciava ogni prova con `spawnSync("node", [m.test])`, cioè come se ogni
// `test` fosse un percorso .mjs. Due forme molto vive non lo sono:
//
//   · una riga di comando → `node "node cervello/permessi-check.mjs"` → MODULE_NOT_FOUND → 1
//   · un file .bats       → `node <script bash>`                      → SyntaxError    → 1
//
// Sempre ≠ 0, qualunque cosa faccia la mutazione. Quelle voci risultavano verificate senza esserlo.
//
// Il contatore `mutazioni-senza-esecutore.mjs` (lotto precedente) le CONTAVA soltanto. Qui si cura
// la radice: la decisione di come si esegue una prova diventa una funzione pura in
// `cervello/esecuzione-prova.mjs`, e sia il banco (per lanciare) sia il contatore (per contare) la
// chiamano — un metro solo per le due domande.
//
// COSA PROVA QUESTO FILE, e perché in quest'ordine:
//   ① la decisione pura, sui casi veri presi da mutanti.json
//   ② il terzo esito: «non è nemmeno partito» ≠ «è diventata rossa»
//   ③ il MONTAGGIO: che `non-vacuita` chiami davvero quella decisione, con una spia sullo spawn
//   ④ il danno storico, misurato eseguendo per davvero
//   ⑤ la sicurezza: nessuna riga arriva mai a una shell

import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { comeSiEsegue, spezzaComando, avvioFallito, COMANDI_AMMESSI } from "../esecuzione-prova.mjs";
import { eseguiProva, verdettoCorsa } from "../non-vacuita.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const AD = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

// Una spia al posto di spawnSync: la domanda da verificare è «con quali argomenti parte il
// comando?», e non ha bisogno di far partire processi veri.
function spia(risposte = [{ status: 0, stdout: "", stderr: "" }]) {
  const chiamate = [];
  let i = 0;
  const lancia = (comando, argomenti, opzioni) => {
    chiamate.push({ comando, argomenti, opzioni });
    return risposte[Math.min(i++, risposte.length - 1)];
  };
  return { lancia, chiamate };
}

// ─────────────────────────────────────────────────────────────────────────────
// ① LA DECISIONE PURA — sui `test` veri che stanno in mutanti.json
// ─────────────────────────────────────────────────────────────────────────────
prova("un percorso .mjs si lancia con node, come sempre", () => {
  const p = comeSiEsegue("cervello/test/il-muro-arriva-prima-della-porta.test.mjs");
  assert.equal(p.ok, true, p.perche);
  assert.deepEqual(p.passi, [
    { comando: "node", argomenti: ["cervello/test/il-muro-arriva-prima-della-porta.test.mjs"], percorsi: ["cervello/test/il-muro-arriva-prima-della-porta.test.mjs"] },
  ]);
});

prova("IL CUORE: una riga di comando si spezza in argomenti, non si infila dentro node", () => {
  // Era: `node ["node cervello/permessi-check.mjs"]`. Adesso il programma è `node` e l'argomento è
  // il file, come chi l'ha scritta si aspettava.
  const p = comeSiEsegue("node cervello/permessi-check.mjs");
  assert.equal(p.ok, true, p.perche);
  assert.equal(p.passi.length, 1);
  assert.equal(p.passi[0].comando, "node");
  assert.deepEqual(p.passi[0].argomenti, ["cervello/permessi-check.mjs"]);
});

prova("IL CUORE: un `&&` diventa una sequenza di passi, non una stringa data a una shell", () => {
  // AR-395, parola per parola come sta in mutanti.json.
  const p = comeSiEsegue("node cervello/prove-difetti.mjs --ar-395 && npx bats cervello/test/cancello-nell-istante-giusto.bats && node cervello/test/istante-cancello.test.mjs");
  assert.equal(p.ok, true, p.perche);
  assert.equal(p.passi.length, 3, "i tre passi del && devono restare tre");
  assert.deepEqual(p.passi[0].argomenti, ["cervello/prove-difetti.mjs", "--ar-395"], "l'opzione deve restare un argomento a sé");
  assert.deepEqual(p.passi[1].argomenti, ["bats", "cervello/test/cancello-nell-istante-giusto.bats"]);
  assert.deepEqual(p.passi[2].argomenti, ["cervello/test/istante-cancello.test.mjs"]);
});

prova("IL CUORE: un .bats si lancia con bats, non con node", () => {
  // `node <script bash>` esce 1 per SyntaxError: sempre, e non c'entra niente con la mutazione.
  const p = comeSiEsegue("cervello/test/pausa-fail-closed.bats");
  assert.equal(p.ok, true, p.perche);
  assert.equal(p.passi[0].comando, "npx");
  assert.deepEqual(p.passi[0].argomenti, ["bats", "cervello/test/pausa-fail-closed.bats"]);
});

prova("un test assente non è «va bene»", () => {
  for (const t of [undefined, null, "", "   ", 42]) {
    assert.equal(comeSiEsegue(t).ok, false, `${JSON.stringify(t)} è passato`);
  }
});

prova("i percorsi da controllare vengono dichiarati, opzioni escluse", () => {
  const p = comeSiEsegue("node cervello/prove-difetti.mjs --ar-395");
  assert.deepEqual(p.percorsi, ["cervello/prove-difetti.mjs"], "l'opzione non è un file da cercare sul disco");
});

// ─────────────────────────────────────────────────────────────────────────────
// ② IL TERZO ESITO — «non è partito» non è «è diventata rossa»
// ─────────────────────────────────────────────────────────────────────────────
prova("IL CUORE: il file della prova che non esiste è un avvio fallito, non un rosso", () => {
  const motivo = avvioFallito({
    uscita: "Error: Cannot find module '/home/user/ad-mycity/node cervello/permessi-check.mjs'\ncode: 'MODULE_NOT_FOUND'",
    entrata: "node cervello/permessi-check.mjs",
  });
  assert.ok(motivo, "l'errore storico di AR-840 deve essere riconosciuto come avvio fallito");
  assert.match(motivo, /non è partito/i);
});

prova("un programma che non esiste su questa macchina è un avvio fallito", () => {
  assert.ok(avvioFallito({ errore: { code: "ENOENT" } }));
  assert.ok(avvioFallito({ uscita: "npm error could not determine executable to run" }));
});

prova("IL CONTRARIO: un modulo rotto DALLA MUTAZIONE resta un rosso vero, non diventa ⚪", () => {
  // Se ogni «Cannot find module» diventasse cieco, il banco smetterebbe di misurare i fix che
  // toccano un import — cioè si comprerebbe il verde dal lato opposto.
  const motivo = avvioFallito({
    uscita: "Error: Cannot find module './pezzo-che-la-mutazione-ha-rotto.mjs'",
    entrata: "cervello/test/x.test.mjs",
  });
  assert.equal(motivo, null, "il modulo mancante non è il file che avevamo chiesto di eseguire");
});

prova("un'uscita pulita non inventa avvii falliti", () => {
  assert.equal(avvioFallito({ status: 1, uscita: "not ok 1 - il fix rotto fa fallire il caso" }), null);
});

prova("IL CUORE: verdettoCorsa mette l'avvio fallito PRIMA del numero d'uscita", () => {
  // status 1 = «diventata rossa» per il vecchio banco. Con l'avvio fallito dichiarato è ⚪.
  const v = verdettoCorsa({ status: 1, uscita: "", avvio: "il file della prova non esiste: «x»" });
  assert.equal(v.verdetto, "cieco", "un avvio fallito venduto per ✅ è esattamente AR-840");
  assert.match(v.perche, /non esiste/);
});

prova("senza avvio fallito il verdetto resta quello di sempre", () => {
  assert.equal(verdettoCorsa({ status: 1, uscita: "not ok 1" }).verdetto, "ok");
  assert.equal(verdettoCorsa({ status: 0, uscita: "ok 1" }).verdetto, "vacua");
});

// ─────────────────────────────────────────────────────────────────────────────
// ③ IL MONTAGGIO — che `non-vacuita` usi davvero quella decisione
// ─────────────────────────────────────────────────────────────────────────────
prova("IL MONTAGGIO: eseguiProva lancia `node <file>`, non `node \"node <file>\"`", () => {
  const s = spia();
  eseguiProva("node cervello/permessi-check.mjs", { lancia: s.lancia });
  assert.equal(s.chiamate.length, 1);
  assert.equal(s.chiamate[0].comando, "node");
  assert.deepEqual(
    s.chiamate[0].argomenti,
    ["cervello/permessi-check.mjs"],
    "è ESATTAMENTE il bug: se qui ricompare la riga intera come unico argomento, AR-840 è tornato",
  );
});

prova("IL MONTAGGIO: eseguiProva non passa mai `shell: true` a chi lancia", () => {
  const s = spia();
  eseguiProva("node cervello/permessi-check.mjs", { lancia: s.lancia });
  assert.notEqual(s.chiamate[0].opzioni?.shell, true, "una shell qui è un'iniezione di comandi a un passo");
});

prova("IL MONTAGGIO: i passi di un && si eseguono in ordine e ci si ferma al primo rosso", () => {
  const s = spia([
    { status: 0, stdout: "", stderr: "" },
    { status: 1, stdout: "not ok 1", stderr: "" },
    { status: 0, stdout: "", stderr: "" },
  ]);
  const r = eseguiProva("node cervello/a.mjs && node cervello/b.mjs && node cervello/c.mjs", { lancia: s.lancia });
  assert.equal(s.chiamate.length, 2, "il terzo passo non doveva partire dopo un rosso");
  assert.equal(r.status, 1);
  assert.equal(r.avvio, null, "un rosso vero non è un avvio fallito");
});

prova("IL MONTAGGIO: un .bats parte con bats", () => {
  const s = spia();
  eseguiProva("cervello/test/pausa-fail-closed.bats", { lancia: s.lancia });
  assert.equal(s.chiamate[0].comando, "npx");
  assert.equal(s.chiamate[0].argomenti[0], "bats");
});

prova("IL MONTAGGIO: un test che non si sa lanciare torna un avvio fallito, non un rosso", () => {
  const s = spia();
  const r = eseguiProva("bash cervello/test/x.sh", { lancia: s.lancia });
  assert.equal(s.chiamate.length, 0, "non doveva partire niente");
  assert.ok(r.avvio, "senza avvio dichiarato, status 1 verrebbe letto come «la prova morde»");
});

prova("IL MONTAGGIO: MODULE_NOT_FOUND sul file chiesto diventa ⚪ passando dal banco", () => {
  const s = spia([{ status: 1, stdout: "", stderr: "Error: Cannot find module '/x/cervello/mai-esistito.mjs'" }]);
  const r = eseguiProva("node cervello/mai-esistito.mjs", { lancia: s.lancia });
  assert.ok(r.avvio, "il file chiesto non c'è: non è partito niente");
  assert.equal(verdettoCorsa(r).verdetto, "cieco");
});

prova("IL MONTAGGIO: la decisione è CHIAMATA dal banco, non solo importata", () => {
  // La malattia di casa: un pezzo scritto bene e mai montato. Un import senza chiamata lascerebbe
  // il vecchio spawnSync cablato al suo posto.
  const banco = readFileSync(join(AD, "cervello/non-vacuita.mjs"), "utf8")
    .split("\n")
    // Via i commenti — di riga E di blocco: una riga commentata contiene ancora, lettera per
    // lettera, tutto quello che una ricerca cerca (la forma di AR-077).
    .filter((r) => !/^(\/\/|\*|\/\*)/.test(r.trimStart()))
    .join("\n");
  assert.match(banco, /comeSiEsegue\(/, "non-vacuita non chiama la decisione: la sceglie ancora da sé");
  assert.match(banco, /avvioFallito\(/, "non-vacuita non chiede se la corsa è partita");
  assert.doesNotMatch(banco, /spawnSync\("node",\s*\[m\.test\]/, "il lancio cablato di AR-840 è ancora lì");
});

// ─────────────────────────────────────────────────────────────────────────────
// ④ IL DANNO STORICO, misurato eseguendo per davvero
// ─────────────────────────────────────────────────────────────────────────────
prova("IL DANNO VERO ①: `node \"node x.mjs\"` esce ≠ 0, cioè finge un rosso", () => {
  const r = spawnSync("node", ["node cervello/permessi-check.mjs"], { cwd: AD, encoding: "utf8" });
  assert.notEqual(r.status, 0, "se questo passasse, il difetto non sarebbe mai esistito");
  assert.match(`${r.stderr}`, /MODULE_NOT_FOUND|Cannot find module/);
});

prova("IL DANNO VERO ②: `node <file .bats>` esce ≠ 0 per SyntaxError, cioè finge un rosso", () => {
  const r = spawnSync("node", ["cervello/test/pausa-fail-closed.bats"], { cwd: AD, encoding: "utf8" });
  assert.notEqual(r.status, 0, "due voci vere (AR-390, AR-396) risultavano verificate proprio così");
  assert.match(`${r.stderr}`, /SyntaxError/);
});

prova("LA CURA, eseguita per davvero: la riga di comando di AR-199 adesso gira", () => {
  // Nessuna spia: si lancia sul serio, con lo stesso codice del banco.
  const r = eseguiProva("node cervello/peso-contesto.mjs");
  assert.equal(r.avvio, null, `la corsa non è partita: ${r.avvio}`);
  assert.notEqual(r.status, null, "ammazzata o mai partita");
  assert.equal(verdettoCorsa(r).verdetto === "cieco", false, `col fix curato questa corsa deve dire qualcosa: ${verdettoCorsa(r).perche}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// ⑤ LA SICUREZZA — adesso che le righe di comando si eseguono davvero
// ─────────────────────────────────────────────────────────────────────────────
prova("SICUREZZA: nessuna riga che vuole una shell viene eseguita", () => {
  for (const riga of [
    "node cervello/a.mjs; rm -rf /tmp/x",
    "node cervello/a.mjs | tee /tmp/x",
    "node cervello/$(whoami).mjs",
    "node cervello/`whoami`.mjs",
    "node cervello/a.mjs > /tmp/x",
    "node cervello/a.mjs & node cervello/b.mjs",
    "node 'cervello/a b.mjs'",
  ]) {
    const p = comeSiEsegue(riga);
    assert.equal(p.ok, false, `«${riga}» è stata accettata: una shell qui è un'iniezione`);
  }
});

prova("SICUREZZA: solo i programmi della lista bianca", () => {
  assert.deepEqual(COMANDI_AMMESSI, ["node", "npx"]);
  for (const riga of ["bash x.sh", "sh -c pwd", "curl https://esempio", "python3 x.py"]) {
    assert.equal(comeSiEsegue(riga).ok, false, `«${riga}» è passata`);
  }
});

prova("SICUREZZA: non si esce dal repo, né da percorso né da argomento", () => {
  for (const t of ["../../etc/passwd", "/tmp/x.test.mjs", "node ../../fuori.mjs", "node /etc/x.mjs"]) {
    assert.equal(comeSiEsegue(t).ok, false, `«${t}» è passato`);
  }
});

prova("CONTARE ≠ ESEGUIRE: il banco esegue una fixture assoluta, il contatore non la conta", () => {
  // Le prove di questo stesso banco si costruiscono una fixture in /tmp e le passano un percorso
  // assoluto. Se la regola «solo dentro il repo» vivesse dentro il parser, il banco non si potrebbe
  // più provare (misurato il 28/8: tre prove vicine diventate rosse). Ma il contatore quella regola
  // la vuole eccome: un `test` fuori dal repo non è copertura di casa.
  // ⚠️ AGGIORNATO IL 28/8 DOPO LA RADIOGRAFIA DI SICUREZZA (AR-867). Prima qui bastava
  // `soloDentroIlRepo: false`, che era un interruttore unico e spegneva tre controlli insieme: da
  // quella porta passavano `node -e <codice>` e `npx --yes <pacchetto qualunque>`. Adesso il banco
  // dichiara le RADICI in cui ha diritto di entrare, e questo caso deve dichiararle come le
  // dichiara l'esecutore vero — se un domani `eseguiProva` cambia riga e questa no, il caso torna a
  // misurare un percorso che nessuno percorre, ed è esattamente com'è nato il buco.
  const fixture = `${tmpdir()}/non-vacuita-esempio/prova.mjs`;
  assert.equal(comeSiEsegue(fixture, { soloDentroIlRepo: false, radiciAmmesse: [tmpdir()] }).ok, true, "il banco deve poterla eseguire");
  assert.equal(comeSiEsegue(fixture).ok, false, "il contatore, di suo, non deve contarla");
  // E fuori dalle radici dichiarate non si entra nemmeno col banco: «assoluto» non vuol dire «ovunque».
  assert.equal(comeSiEsegue("/etc/passwd", { soloDentroIlRepo: false, radiciAmmesse: [tmpdir()] }).ok, false, "una radice non dichiarata resta chiusa anche per il banco");
  const s = spia();
  eseguiProva(fixture, { lancia: s.lancia });
  assert.deepEqual(s.chiamate[0]?.argomenti, [fixture], "il banco non ha nemmeno provato a lanciarla");
});

prova("SICUREZZA: un && monco non diventa un comando vuoto", () => {
  for (const t of ["node cervello/a.mjs &&", "&& node cervello/a.mjs", "node cervello/a.mjs && && node cervello/b.mjs"]) {
    assert.equal(spezzaComando(t).ok, false, `«${t}» è passato`);
  }
});

const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "ok" : "NON ok"} — ${c.nome}${c.ok ? "" : `\n   ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} passate`);
if (rotte.length) process.exit(1);
