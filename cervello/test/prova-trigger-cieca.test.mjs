#!/usr/bin/env node
// 🎯 IL BANCO DEL TRIGGER NON DEVE MAI DIRE «VERDE» QUANDO NON HA MISURATO.
//
// PERCHÉ ESISTE. `prova-trigger.mjs` misura se la skill `cantiere` si accende sulle frasi vere di
// Nicola. Il modo in cui uno strumento così mente non è sbagliare una frase: è **non misurare** e
// far passare il silenzio per una buona notizia. È già successo, ed è la ragione per cui il motore
// è stato riscritto: `run_eval.py` di skill-creator legge una sessione che non parte come «la skill
// non è scattata» — con 5 sessioni in parallelo davano 1 frase giusta su 5, contro 5 su 5 in fila.
// Sedici mancati che non erano mancati.
//
// Qui si prova il contratto dei guardiani (AR-322) dove costa zero: senza `claude` nel PATH, senza
// banco, senza description. Il caso «description sbagliata → exit 1» costa sessioni vere e si prova
// a mano prima di consegnare (`--descrizione`), non a ogni giro.
//
// E si prova la cosa che può far male al repo: la skill VERA viene spostata per la durata della
// misura, e deve tornare al suo posto anche quando lo strumento si arrende.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const STRUMENTO = join(REPO, "cervello/prova-trigger.mjs");
const SKILL = join(REPO, ".claude/skills/cantiere");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/**
 * Lancia lo strumento con un PATH a scelta (per spegnere `claude` senza disinstallarlo).
 * `process.execPath` e non "node": con un PATH finto sparirebbe l'interprete invece della CLI, e il
 * caso misurerebbe «node non esiste» credendo di misurare «claude non risponde» (uscita `null`).
 */
function lancia(args, pathEnv) {
  const r = spawnSync(process.execPath, [STRUMENTO, ...args], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 120_000,
    env: pathEnv === undefined ? process.env : { ...process.env, PATH: pathEnv },
  });
  return { codice: r.status, uscita: `${r.stdout || ""}${r.stderr || ""}` };
}

prova("senza la CLI `claude` esce 2 (cieco), non 0", () => {
  const { codice, uscita } = lancia(["--giri", "1"], "/nonesiste");
  assert.equal(codice, 2, `doveva dichiararsi cieco, invece è uscito ${codice}: ${uscita.slice(0, 300)}`);
  assert.match(uscita, /non posso misurare/, "e deve dirlo con parole sue");
});

prova("col banco assente esce 2, e non inventa un verdetto", () => {
  const { codice, uscita } = lancia(["--frasi", "/nonesiste/banco.json"]);
  assert.equal(codice, 2, `doveva dichiararsi cieco, invece è uscito ${codice}`);
  assert.match(uscita, /banco assente|non posso misurare/);
});

prova("un banco con una frase sola non basta per una misura", () => {
  const dir = mkdtempSync(join(tmpdir(), "banco-"));
  const f = join(dir, "uno.json");
  writeFileSync(f, JSON.stringify([{ query: "risolvi i difetti", should_trigger: true }]));
  assert.equal(lancia(["--frasi", f]).codice, 2, "una frase sola non è un banco");
});

prova("dopo una resa, la skill VERA è ancora al suo posto", () => {
  lancia(["--giri", "1"], "/nonesiste");
  assert.ok(existsSync(join(SKILL, "SKILL.md")), "la skill spostata deve tornare sempre dov'era");
});

prova("il banco versionato ha frasi vere E trappole, e le trappole sono la metà buona", () => {
  const banco = JSON.parse(readFileSync(join(SKILL, "evals/frasi-di-nicola.json"), "utf8")).filter(
    (f) => typeof f?.query === "string",
  );
  const vere = banco.filter((f) => f.should_trigger);
  const trappole = banco.filter((f) => !f.should_trigger);
  assert.ok(vere.length >= 15, `le frasi vere sono ${vere.length}, ne servono almeno 15`);
  assert.ok(trappole.length >= 8, `le trappole sono ${trappole.length}, ne servono almeno 8`);
  // Un banco senza trappole misura solo quanto è «pushy» la description: il numero salirebbe
  // rendendola invadente, che è il modo elegante di rovinare ogni altra sessione.
  assert.ok(trappole.length >= vere.length / 2, "troppe poche trappole: il banco premierebbe l'invadenza");
});

const { descrizioneDi, improntaBanco } = await import(join(REPO, "cervello/prova-trigger.mjs"));

prova("l'ultima misura copre TUTTO il banco versionato e la description di ADESSO", () => {
  const banco = JSON.parse(readFileSync(join(SKILL, "evals/frasi-di-nicola.json"), "utf8")).filter(
    (f) => typeof f?.query === "string" && f.query.trim(),
  );
  const m = JSON.parse(readFileSync(join(SKILL, "evals/ultima-misura.json"), "utf8"));
  const d = descrizioneDi(readFileSync(join(SKILL, "SKILL.md"), "utf8"));
  // Un verde parziale è indistinguibile da un verde vero se nessuno confronta i conti: il 29/7 il
  // file dichiarava 0 mancati su 15 frasi mentre il banco ne aveva 28. Qui quel caso è rosso.
  assert.equal(m.impronta_description, createHash("sha256").update(d).digest("hex").slice(0, 12),
    "la description è cambiata dopo la misura: quel verde parla di un altro testo, rimisura");
  assert.equal(m.impronta_banco, improntaBanco(banco),
    `la misura non copre il banco di adesso (${m.frasi_vere + m.trappole} frasi misurate, ${banco.length} versionate)`);
  assert.deepEqual([m.mancati, m.falsi, m.mai_misurate], [[], [], []], "l'ultima misura non era verde");
});
prova("descrizioneDi: blocco `>-`, riga secca, e frontmatter senza description", () => {
  assert.equal(descrizioneDi("---\nname: x\ndescription: >-\n  prima riga\n  seconda\n---\ncorpo"), "prima riga seconda");
  assert.equal(descrizioneDi('---\nname: x\ndescription: "una riga"\n---\n'), "una riga");
  assert.equal(descrizioneDi("---\nname: x\n---\n"), null, "senza description deve dire null, non stringa vuota");
  assert.equal(descrizioneDi("niente frontmatter"), null);
});

prova("la description installata contiene ciò che la misura ha reso necessario", () => {
  const d = descrizioneDi(readFileSync(join(SKILL, "SKILL.md"), "utf8"));
  // Le due clausole non sono gusto: senza la prima il banco misurava 6 mancati su 16 (la sessione
  // partiva a contare i difetti con Bash invece di aprire il mansionario); senza la seconda le
  // trappole del Pannello e della radiografia entravano.
  assert.match(d, /PRIMA di contare i difetti/, "manca la clausola che precede il conteggio");
  assert.match(d, /NON è per i bug del marketplace/, "manca l'esclusione che tiene fuori le trappole");
});

const rotti = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n   ${c.err}`}`);
console.log(rotti.length ? `\n⛔ ${rotti.length}/${casi.length} rotti` : `\n✅ ${casi.length}/${casi.length}`);
process.exit(rotti.length ? 1 : 0);
