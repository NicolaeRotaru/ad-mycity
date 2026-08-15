#!/usr/bin/env node
// AR-449 — la prova del guardiano che misura il peso dei file che la Cabina rilegge.
//
// Non basta che il guardiano esista: deve DIRE IL VERO nei tre casi che contano, e soprattutto non
// deve uscire verde quando non ha potuto misurare. È la malattia n.1 del referto del 30/7 — «un
// verde non distingue ho-controllato da non-ho-potuto-controllare» — e un guardiano nato per
// curarla sarebbe ridicolo se la ripetesse.
//
// Si ESEGUE il guardiano vero, su alberi finti, con lo stesso contratto degli altri: 0 passato ·
// 1 bocciato · 2 cieco.

import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, cpSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { timbroOra } from "../ora-piacenza.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const GUARDIANO = join(REPO, "cervello/peso-file-cabina.mjs");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

/**
 * AR-665 — LA SABBIERA PORTA CON SÉ I MODULI DI CASA, SEGUENDO LA CATENA DEGLI IMPORT.
 *
 * Qui prima c'era un `cpSync` solo: nell'albero finto finiva il guardiano e nient'altro. Sembra un
 * dettaglio del test e invece era la regola che teneva viva una malattia del codice: **finché uno
 * script deve bastare a sé stesso per poter essere provato, l'orologio di casa non si può importare
 * e va ricopiato dentro ogni file.** La prova imponeva la duplicazione che il difetto lamentava —
 * al punto che il guardiano portava scritto in un commento «AR-648 non riparato qui, e il motivo è
 * questo test». Un solo `import` e sei casi diventavano «cannot find module».
 *
 * Il modo di copiare è quello già in casa in `cervello/test/mutazione-mancante.test.mjs`: si legge
 * il sorgente, si seguono gli import relativi e si copiano anche le loro dipendenze. Così ciò che
 * gira nella sabbiera è il codice di produzione com'è, non una sua versione mutilata.
 */
function copiaConModuli(sorgente, radiceDest, visti = new Set()) {
  const abs = resolve(sorgente);
  if (visti.has(abs) || !existsSync(abs)) return visti;
  visti.add(abs);
  const dest = join(radiceDest, relative(REPO, abs).split("\\").join("/"));
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(abs, dest);
  // Solo i moduli di casa (`./x.mjs`): `node:fs` e i pacchetti li risolve Node da sé.
  const src = readFileSync(abs, "utf8");
  for (const m of src.matchAll(/^\s*(?:import|export)\b[^"';]*from\s*["'](\.[^"']+)["']/gm)) {
    copiaConModuli(resolve(dirname(abs), m[1]), radiceDest, visti);
  }
  return visti;
}

/** Un albero finto con gli stessi percorsi del vero, e il guardiano (coi suoi moduli) copiato dentro. */
function mondo({ pesi = {}, maxLettura = "8 * 1_048_576", conObsidian = true }) {
  const dir = mkdtempSync(join(tmpdir(), "mycity-peso-"));
  mkdirSync(join(dir, "cervello"), { recursive: true });
  mkdirSync(join(dir, "pannello/src/lib"), { recursive: true });
  mkdirSync(join(dir, "MyCity-Vault/90-Memoria-AI/auto-coscienza"), { recursive: true });
  copiaConModuli(GUARDIANO, dir);
  if (conObsidian) {
    writeFileSync(join(dir, "pannello/src/lib/obsidian.ts"), `const MAX_LETTURA = ${maxLettura};\n`);
  }
  // Tutti i sorvegliati esistono, così l'unico motivo di cecità è quello che vogliamo provare.
  const tutti = {
    "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json": 100,
    "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-radiografia.json": 100,
    "MyCity-Vault/90-Memoria-AI/auto-coscienza/storico-salute.json": 100,
    "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json": 100,
    "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-miglioramento.json": 100,
    "MyCity-Vault/90-Memoria-AI/auto-coscienza/registro-realta.json": 100,
    "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md": 100,
    "MyCity-Vault/90-Memoria-AI/STATO.md": 100,
    ...pesi,
  };
  for (const [rel, byte] of Object.entries(tutti)) {
    if (byte == null) continue; // null = il file NON esiste (caso cieco)
    writeFileSync(join(dir, rel), "x".repeat(byte));
  }
  return {
    dir,
    gira: (args = [], env = {}) => {
      const r = spawnSync("node", [join(dir, "cervello/peso-file-cabina.mjs"), ...args], {
        encoding: "utf8",
        env: { ...process.env, ...env },
      });
      return { rc: r.status, out: `${r.stdout || ""}${r.stderr || ""}` };
    },
    pulisci: () => rmSync(dir, { recursive: true, force: true }),
  };
}

prova("tutti sotto il tetto inline → verde (0)", () => {
  const m = mondo({});
  try {
    const r = m.gira();
    assert.equal(r.rc, 0, r.out);
    assert.match(r.out, /sotto il tetto inline/);
  } finally { m.pulisci(); }
});

prova("IL CASO DEL 30/7: un file oltre il MiB è segnalato, ma non è ancora un muro (0 con avviso)", () => {
  const m = mondo({ pesi: { "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json": 1_081_370 } });
  try {
    const r = m.gira();
    assert.equal(r.rc, 0, "oltre l'inline la seconda strada regge: bocciare qui farebbe nascere il guardiano rosso");
    assert.match(r.out, /oltre il tetto inline/, "ma va DETTO, altrimenti la crescita resta invisibile");
    assert.match(r.out, /cantiere-difetti\.json/);
  } finally { m.pulisci(); }
});

prova("oltre il muro di casa → bocciato (1): lì la Cabina non lo mostra davvero", () => {
  const m = mondo({ pesi: { "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json": 2_000_000 }, maxLettura: "1_048_576" });
  try {
    const r = m.gira();
    assert.equal(r.rc, 1, r.out);
    assert.match(r.out, /oltre il muro/);
  } finally { m.pulisci(); }
});

prova("un file sorvegliato che manca = CIECO (2), non «pesa zero»", () => {
  const m = mondo({ pesi: { "MyCity-Vault/90-Memoria-AI/STATO.md": null } });
  try {
    const r = m.gira();
    assert.equal(r.rc, 2, "un file che non trovo non pesa zero: è una misura che manca");
    assert.match(r.out, /non misurati|non trovato/);
  } finally { m.pulisci(); }
});

prova("senza obsidian.ts il muro non è misurabile = CIECO (2), non verde", () => {
  const m = mondo({ conObsidian: false });
  try {
    const r = m.gira();
    assert.equal(r.rc, 2, "senza il numero vero non si può dire che siamo sotto: è cecità, non salute");
    assert.match(r.out, /muro non misurabile|non trovato/);
  } finally { m.pulisci(); }
});

prova("il muro si LEGGE da obsidian.ts, non è una copia scritta qui", () => {
  // Due copie dello stesso numero divergono, e la copia sbagliata è quella che ti fa dormire.
  const src = readFileSync(GUARDIANO, "utf-8");
  assert.match(src, /MAX_LETTURA/, "deve pescare il valore dal codice del Pannello");
  const m = mondo({ maxLettura: "512", pesi: { "MyCity-Vault/90-Memoria-AI/STATO.md": 1000 } });
  try {
    assert.equal(m.gira().rc, 1, "abbassando MAX_LETTURA nel Pannello il guardiano deve bocciare di conseguenza");
  } finally { m.pulisci(); }
});

prova("--json produce un report leggibile da una macchina", () => {
  const m = mondo({});
  try {
    const r = m.gira(["--json"]);
    const j = JSON.parse(r.out);
    assert.equal(j.esito, "ok");
    assert.equal(j.tetto_inline, 1_048_576);
    assert.ok(Array.isArray(j.misure) && j.misure.length >= 8);
  } finally { m.pulisci(); }
});

// ── AR-665 · AR-666 — la sabbiera non costringe più il guardiano a bastare a sé stesso ──────────

prova("AR-665 — nella sabbiera arrivano anche i moduli di casa che il guardiano importa", () => {
  const m = mondo({});
  try {
    // Non si guarda il sorgente: si guarda l'albero finto. Se la copia seguisse un import solo per
    // volta, questo file non ci sarebbe e il guardiano morirebbe prima di stampare qualsiasi cosa.
    assert.ok(
      existsSync(join(m.dir, "cervello/ora-piacenza.mjs")),
      "l'orologio di casa deve essere copiato nella sabbiera insieme al guardiano",
    );
    const r = m.gira(["--json"]);
    assert.equal(r.rc, 0, `il guardiano deve girare nella sabbiera, non morire su un import: ${r.out}`);
    assert.doesNotMatch(r.out, /Cannot find (module|package)/i, r.out);
  } finally {
    m.pulisci();
  }
});

prova("AR-666 — il referto è timbrato con l'ora di Piacenza anche su un server in UTC", () => {
  // Il guardiano scriveva `new Date().toISOString()`: la FORMA giusta col valore di Greenwich. Alle
  // 23:40 di Piacenza il referto diceva 21:40, e nessuno poteva accorgersene guardando il file.
  // Roma non è MAI su UTC (d'inverno +1, d'estate +2), quindi il confronto discrimina sempre.
  const m = mondo({});
  try {
    const prima = timbroOra();
    const r = m.gira(["--json"], { TZ: "UTC" });
    const dopo = timbroOra();
    assert.equal(r.rc, 0, r.out);
    const { data } = JSON.parse(r.out);
    assert.ok(
      data === prima || data === dopo,
      `col server in UTC il referto dice «${data}», ma a Piacenza sono le ${prima}: è l'ora di Greenwich travestita`,
    );
    // Stessa domanda dall'altro fuso: la risposta non può dipendere dalla macchina che esegue.
    const roma = JSON.parse(m.gira(["--json"], { TZ: "Europe/Rome" }).out);
    assert.equal(
      roma.data.slice(0, 13),
      data.slice(0, 13),
      `TZ=UTC dice «${data}» e TZ=Europe/Rome dice «${roma.data}»: il timbro dipende dal fuso del server`,
    );
  } finally {
    m.pulisci();
  }
});

prova("il giro lo esegue davvero (un guardiano che nessuno lancia non è una rete)", () => {
  const giro = readFileSync(join(REPO, "cervello/giro.sh"), "utf-8");
  assert.match(giro, /peso-file-cabina\.mjs/, "va chiamato dal giro, altrimenti è un file e basta");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
