#!/usr/bin/env node
// La spazzata delle cartelle temporanee: che tolga quelle giuste, e che qualcuno la faccia girare.
//
// Il 20/8 /tmp sul server è arrivato al 100% e ha fermato la macchina per quasi tre giorni. A
// riempirlo erano state le prove di questa stessa cartella: trentadue creano una cartella con
// `mkdtempSync` e non la cancellano mai.
//
// Esisteva già una prova che pretendeva una spazzata, ed era rossa da mesi mentre il disco si
// riempiva. Cercava due parole dentro worker.sh. Qui invece si misura il COMPORTAMENTO su una
// sabbiera vera: cartelle vecchie via, cartelle fresche salve, cartelle di altri mai toccate.
//
// L'ultimo caso è il più importante dei quattro: prova che il banco la spazzata la CHIAMA davvero.
// Una spazzata che nessuno lancia non è una difesa, è un file — ed è esattamente com'era la prova
// di prima.

import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, utimesSync, rmSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { spazza, pesaCompleto, PREFISSI, MAI_TOCCARE, ORE_DEFAULT } = await import(join(QUI, "..", "spazza-temporanei.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Una cartella dentro `base`, con l'orario di ultima modifica spostato indietro di `oreFa`. */
function cartella(base, nome, oreFa) {
  const p = join(base, nome);
  mkdirSync(p, { recursive: true });
  writeFileSync(join(p, "roba.txt"), "x");
  const quando = new Date(Date.now() - oreFa * 3600_000);
  utimesSync(join(p, "roba.txt"), quando, quando);
  utimesSync(p, quando, quando);
  return p;
}

prova("toglie le cartelle nostre ferme da più di un giorno", () => {
  const base = mkdtempSync(join(tmpdir(), "sabbiera-spazza-"));
  try {
    const vecchia = cartella(base, "mycity-campo-abc123", ORE_DEFAULT + 5);
    const r = spazza({ dir: base, oreMin: ORE_DEFAULT });
    assert.ok(r.tolte.includes("mycity-campo-abc123"), `non l'ha tolta: ${JSON.stringify(r.tolte)}`);
    assert.equal(existsSync(vecchia), false, "la cartella è ancora sul disco");
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

prova("NON tocca le cartelle nostre ancora fresche", () => {
  const base = mkdtempSync(join(tmpdir(), "sabbiera-spazza-"));
  try {
    // È il caso che protegge un banco che sta girando adesso: le sue cartelle hanno pochi minuti.
    const fresca = cartella(base, "mycity-campo-fresca", 0.1);
    const r = spazza({ dir: base, oreMin: ORE_DEFAULT });
    assert.equal(existsSync(fresca), true, "ha cancellato la cartella di un banco vivo");
    assert.ok(r.tenute.includes("mycity-campo-fresca"));
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

prova("NON tocca le cartelle che non sono nostre, per quanto vecchie", () => {
  const base = mkdtempSync(join(tmpdir(), "sabbiera-spazza-"));
  try {
    const altrui = cartella(base, "systemd-private-qualcosa", ORE_DEFAULT * 30);
    const r = spazza({ dir: base, oreMin: ORE_DEFAULT });
    assert.equal(existsSync(altrui), true, "ha cancellato roba di qualcun altro: è il danno peggiore");
    assert.equal(r.tolte.length, 0);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

prova("ogni prefisso dichiarato viene davvero spazzato", () => {
  // Se qualcuno aggiunge un prefisso all'elenco e la selezione non lo prende, il buco resta aperto
  // mentre l'elenco dice il contrario.
  const base = mkdtempSync(join(tmpdir(), "sabbiera-spazza-"));
  try {
    for (const p of PREFISSI) cartella(base, `${p}esempio`, ORE_DEFAULT + 5);
    const r = spazza({ dir: base, oreMin: ORE_DEFAULT });
    assert.equal(r.tolte.length, PREFISSI.length, `tolte ${r.tolte.length} su ${PREFISSI.length} famiglie`);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

prova("NON tocca MAI la roba viva, per quanto vecchia", () => {
  // La prima versione di questa spazzata aveva per prefisso il generico `mycity-`, e avrebbe portato
  // via `mycity-auth.*` — cioè la chiave della memoria di un worker in esecuzione — e la casa degli
  // allegati. Sarebbe stato rifare il guasto del 20/8 con le mie mani. Questi tre nomi restano.
  const base = mkdtempSync(join(tmpdir(), "sabbiera-spazza-"));
  try {
    const vivi = MAI_TOCCARE.map((p) => cartella(base, `${p}xyz`, ORE_DEFAULT * 10));
    const r = spazza({ dir: base, oreMin: ORE_DEFAULT });
    for (const v of vivi) assert.equal(existsSync(v), true, `ha cancellato roba viva: ${v}`);
    assert.equal(r.tolte.length, 0, `tolte ${JSON.stringify(r.tolte)}`);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

prova("il banco delle prove la lancia davvero all\'avvio", () => {
  // Il caso che vale per tutti: qui non guardo il codice del banco, lo FACCIO GIRARE con la cartella
  // temporanea puntata su una sabbiera, e misuro se l'orfana è sparita. Se domani qualcuno toglie la
  // chiamata dal banco, questa riga diventa rossa — la prova di prima no.
  const base = mkdtempSync(join(tmpdir(), "sabbiera-banco-"));
  const finte = mkdtempSync(join(tmpdir(), "sabbiera-prove-"));
  try {
    const orfana = cartella(base, "mycity-campo-orfana", ORE_DEFAULT + 5);
    writeFileSync(
      join(finte, "briciola.test.mjs"),
      'import { test } from "node:test";\nimport assert from "node:assert/strict";\ntest("ok", () => assert.ok(true));\n',
    );

    const r = spawnSync("node", ["cervello/test-cervello.mjs", "--solo", "briciola"], {
      cwd: REPO,
      encoding: "utf8",
      env: { ...process.env, TMPDIR: base, TEST_CERVELLO_DIR: finte },
      timeout: 120_000,
    });

    assert.equal(
      existsSync(orfana),
      false,
      `il banco è partito ma l'orfana è ancora lì: la spazzata non viene chiamata.\n${r.stdout}${r.stderr}`,
    );
  } finally {
    rmSync(base, { recursive: true, force: true });
    rmSync(finte, { recursive: true, force: true });
  }
});

// ── La cura alla radice: una prova che perde NON deve lasciare niente in giro ─────────────────────
//
// La prima versione della spazzata sembrava sufficiente e non lo era. Misurata sul server il 21/8
// alle 12:00: /tmp di nuovo al 100%, otto ore dopo essere stato svuotato a mano. Il motivo è che la
// spazzata toglie ciò che è fermo da oltre un giorno, mentre il banco crea trenta cartelle nuove a
// ogni giro — la spazzatura nasceva più in fretta di quanto invecchiava, e la soglia non la toccava
// mai. Rincorrere non funziona: bisogna togliere il posto dove si accumula.
//
// Questa prova misura la proprietà che sul server era falsa: dopo un giro del banco, nella cartella
// temporanea VERA non resta niente — nemmeno se la prova dentro perde apposta.

prova("una prova che perde non lascia niente nella cartella temporanea", () => {
  const fuori = mkdtempSync(join(tmpdir(), "sabbiera-fuori-"));
  const finte = mkdtempSync(join(tmpdir(), "sabbiera-prove-"));
  try {
    // una prova che fa ESATTAMENTE quello che fanno i 32 file veri: crea e non cancella
    writeFileSync(
      join(finte, "perde.test.mjs"),
      [
        'import { test } from "node:test";',
        'import assert from "node:assert/strict";',
        'import { mkdtempSync, writeFileSync } from "node:fs";',
        'import { tmpdir } from "node:os";',
        'import { join } from "node:path";',
        'test("perde apposta", () => {',
        '  const d = mkdtempSync(join(tmpdir(), "mycity-campo-"));',
        '  writeFileSync(join(d, "roba.txt"), "x");',
        "  assert.ok(true); // e non la cancella mai, come i 32 veri",
        "});",
      ].join("\n"),
    );

    const r = spawnSync("node", ["cervello/test-cervello.mjs", "--solo", "perde"], {
      cwd: REPO,
      encoding: "utf8",
      env: { ...process.env, TMPDIR: fuori, TEST_CERVELLO_DIR: finte },
      timeout: 120_000,
    });

    const rimasti = readdirSync(fuori);
    assert.deepEqual(
      rimasti,
      [],
      `il banco ha lasciato ${rimasti.length} cartelle nella temporanea vera: ${rimasti.join(", ")}\n` +
        `è il difetto che il 21/8 ha riempito /tmp sul server.\n${r.stdout}${r.stderr}`,
    );
  } finally {
    rmSync(fuori, { recursive: true, force: true });
    rmSync(finte, { recursive: true, force: true });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// IL VERDE SOPRA IL DISCO PIENO — 21/8, ore 12:25
//
// Le riparazioni erano tutte sul server e /tmp segnava ancora 100%, 4,6 MB liberi. Ho riletto cosa
// avrebbe detto questo attrezzo lanciato lì in quel momento: «✅ niente da spazzare». Vero e
// inutile — vero perché di suo non c'era più niente da togliere, inutile perché il disco era pieno
// lo stesso e la riga non lo diceva.
//
// È lo stesso difetto che Nicola mi aveva già fatto chiudere sull'attrezzo della memoria («chiudi
// il problema sul quale sei cieco»): uno strumento che salta quello che non riconosce e poi
// riferisce solo su quello che riconosce. Il salto è giusto — non tocco roba d'altri — ma il
// silenzio no: quello che non riconosco occupa il posto comunque.
//
// Le due prove qui sotto misurano il comportamento nuovo: chi resta viene NOMINATO, e il verde da
// solo non esiste più su una cartella occupata.
// ─────────────────────────────────────────────────────────────────────────────

prova("dice chi occupa il posto e non è nostro, il piu' grosso per primo", () => {
  const base = mkdtempSync(join(tmpdir(), "sabbiera-spazza-"));
  try {
    mkdirSync(join(base, "roba-piccola"), { recursive: true });
    writeFileSync(join(base, "roba-piccola", "a.bin"), Buffer.alloc(10_000));
    mkdirSync(join(base, "roba-grossa"), { recursive: true });
    writeFileSync(join(base, "roba-grossa", "b.bin"), Buffer.alloc(400_000));

    const r = spazza({ dir: base, esegui: false });
    const nomi = r.sconosciute.map((v) => v.nome);
    assert.deepEqual(nomi, ["roba-grossa", "roba-piccola"], `ordine per peso sbagliato: ${nomi.join(", ")}`);
    assert.ok(
      r.sconosciute[0].byte > 300_000,
      `il peso della cartella grossa e' ${r.sconosciute[0].byte}: sta contando la voce di cartella, non il contenuto`,
    );
    assert.ok(r.byteSconosciuti > 400_000, `totale non nostro ${r.byteSconosciuti}, troppo poco`);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

prova("con niente di nostro da togliere non si ferma al verde: nomina chi resta", () => {
  const base = mkdtempSync(join(tmpdir(), "sabbiera-spazza-"));
  try {
    mkdirSync(join(base, "occupante-sconosciuto"), { recursive: true });
    writeFileSync(join(base, "occupante-sconosciuto", "g.bin"), Buffer.alloc(2_000_000));

    const r = spawnSync("node", ["cervello/spazza-temporanei.mjs"], {
      cwd: REPO,
      encoding: "utf8",
      env: { ...process.env, TMPDIR: base },
      timeout: 60_000,
    });
    const detto = `${r.stdout}${r.stderr}`;
    assert.ok(
      detto.includes("occupante-sconosciuto"),
      `l'attrezzo non ha nominato chi occupa il posto — e' il verde sopra il disco pieno:\n${detto}`,
    );
    assert.ok(detto.includes("MB"), `non ha detto quanto pesa quello che resta:\n${detto}`);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

prova("il conto di quello che ha liberato e' spazio vero, non voci di cartella", () => {
  const base = mkdtempSync(join(tmpdir(), "sabbiera-spazza-"));
  try {
    const vecchia = cartella(base, "mycity-campo-pesante", ORE_DEFAULT + 5);
    writeFileSync(join(vecchia, "grosso.bin"), Buffer.alloc(500_000));
    const quando = new Date(Date.now() - (ORE_DEFAULT + 5) * 3600_000);
    utimesSync(vecchia, quando, quando);

    const r = spazza({ dir: base, esegui: false });
    assert.deepEqual(r.tolte, ["mycity-campo-pesante"]);
    assert.ok(
      r.byte > 400_000,
      `dice di liberare ${r.byte} byte per mezzo mega di roba: sta sommando la voce di cartella (4096 fissi), non il contenuto`,
    );
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

prova("quando smetto di contare lo dico: una misura a meta' non passa per intera", () => {
  const base = mkdtempSync(join(tmpdir(), "sabbiera-spazza-"));
  try {
    mkdirSync(join(base, "tanta-roba"), { recursive: true });
    for (let i = 0; i < 6; i++) writeFileSync(join(base, "tanta-roba", `f${i}.bin`), Buffer.alloc(20_000));

    const intera = pesaCompleto(join(base, "tanta-roba"));
    assert.equal(intera.troncata, false, "contata tutta, non dovrebbe dirsi troncata");
    assert.ok(intera.byte > 100_000, `peso intero sbagliato: ${intera.byte}`);

    const meta = pesaCompleto(join(base, "tanta-roba"), 2);
    assert.equal(meta.troncata, true, "col tetto a 2 file DEVE dire che ha smesso di contare");
    assert.ok(meta.byte < intera.byte, "una misura troncata non può pesare quanto quella intera");
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

prova("il troncamento risale fino al referto, non resta nel conto", () => {
  const base = mkdtempSync(join(tmpdir(), "sabbiera-spazza-"));
  try {
    mkdirSync(join(base, "roba-di-altri"), { recursive: true });
    for (let i = 0; i < 6; i++) writeFileSync(join(base, "roba-di-altri", `f${i}.bin`), Buffer.alloc(20_000));
    assert.equal(spazza({ dir: base, esegui: false, tetto: 40_000 }).troncato, false, "contata tutta");
    assert.equal(spazza({ dir: base, esegui: false, tetto: 2 }).troncato, true, "il referto deve portarselo su");
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
