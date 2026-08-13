#!/usr/bin/env node
// 🩹 B-backfill-date — RIPARAZIONE DATI per AR-575 (corsia B, lotto contabilità).
//
// Cosa fa: alle schede del cantiere con stato "chiuso" ma SENZA data di chiusura (`chiuso_il`)
// mette la data, ricavata così, in ordine di affidabilità:
//   ① il campo `chiuso` (stesso dato, nome sbagliato) se la scheda ce l'ha → rinominato in `chiuso_il`;
//   ② il git log di cantiere-difetti.json: la data del PRIMO commit in cui quella scheda risulta
//      già chiusa (fuso Europe/Rome, formato "AAAA-MM-GG HH:MM" — regola dell'orario);
//   ③ se la storia non basta: una STIMA DICHIARATA (`chiuso_il_fonte` che dice che è una stima e
//      da dove viene) — mai un numero senza fonte.
// Ogni data ricavata da ②/③ porta il campo `chiuso_il_fonte` accanto: chi legge sa quanto fidarsi.
//
// Cosa NON fa, mai: non tocca il campo `stato`, non chiude e non riapre niente, non tocca schede
// che una data ce l'hanno già.
//
// Uso (idempotente: al secondo giro non trova più niente da riparare):
//   node B-backfill-date.mjs                → DRY-RUN: mostra cosa cambierebbe, non scrive
//   node B-backfill-date.mjs --applica      → scrive davvero
//   [--root=/path/ad-mycity] [--file=/path/cantiere.json]   → per test su dati iniettati

import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, relative } from "node:path";

const APPLICA = process.argv.includes("--applica");
const arg = (n, d) => (process.argv.find((x) => x.startsWith(`--${n}=`)) || "").slice(n.length + 3) || d;

const ROOT = arg("root", process.env.AD_ROOT || "/home/user/ad-mycity");
const CANTIERE = arg("file", join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"));
const NO_GIT = process.argv.includes("--no-git"); // per test senza repo

function git(args, opts = {}) {
  return spawnSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, env: { ...process.env, TZ: "Europe/Rome" }, ...opts });
}

// ── 1. leggi il cantiere e trova le schede malate ─────────────────────────────
if (!existsSync(CANTIERE)) {
  console.error(`❌ cantiere non trovato: ${CANTIERE}`);
  process.exit(2);
}
const testoOriginale = readFileSync(CANTIERE, "utf8");
const cantiere = JSON.parse(testoOriginale);
const difetti = cantiere.difetti || [];
const target = difetti.filter((d) => d && d.stato === "chiuso" && !d.chiuso_il);
console.log(`\n🩹 B-backfill-date — ${APPLICA ? "APPLICA" : "DRY-RUN (niente viene scritto)"}\n`);
console.log(`   Schede chiuse senza \`chiuso_il\`: ${target.length} su ${difetti.filter((d) => d && d.stato === "chiuso").length} chiuse totali.\n`);
if (!target.length) {
  console.log("   ✅ Niente da riparare: ogni chiusura ha già la sua data.\n");
  process.exit(0);
}

const riparate = [];

// ── 2. strada ①: il campo `chiuso` col nome sbagliato ────────────────────────
for (const d of target.filter((x) => x.chiuso)) {
  riparate.push({ id: d.id, chiuso_il: d.chiuso, fonte: "campo `chiuso` (nome sbagliato) già sulla scheda, rinominato in `chiuso_il`" });
  d.chiuso_il = d.chiuso;
  d.chiuso_il_fonte = "campo `chiuso` (nome sbagliato) già presente sulla scheda, rinominato";
  delete d.chiuso;
}
const pendenti = new Set(target.filter((x) => !x.chiuso_il).map((x) => x.id));

// ── 3. strada ②: il git log del file ─────────────────────────────────────────
if (pendenti.size && !NO_GIT) {
  // Il clone può essere superficiale: senza storia intera il "primo commit in cui è chiuso" mente.
  const shallow = git(["rev-parse", "--is-shallow-repository"]).stdout?.trim() === "true";
  if (shallow) {
    console.log("   Clone superficiale: provo `git fetch --unshallow origin` …");
    const r = git(["fetch", "--unshallow", "origin"], { timeout: 300000 });
    if (r.status !== 0) {
      // A tappe: meglio una storia parziale DICHIARATA che nessuna.
      for (let i = 0; i < 5 && git(["rev-parse", "--is-shallow-repository"]).stdout?.trim() === "true"; i++) {
        git(["fetch", `--deepen=500`, "origin"], { timeout: 300000 });
      }
    }
  }
  const ancoraShallow = git(["rev-parse", "--is-shallow-repository"]).stdout?.trim() === "true";

  const rel = relative(ROOT, CANTIERE);
  const log = git(["log", "--reverse", "--format=%H|%cd", "--date=format-local:%Y-%m-%d %H:%M", "--", rel]);
  const commits = (log.stdout || "").trim().split("\n").filter(Boolean).map((r) => {
    const [sha, data] = r.split("|");
    return { sha, data };
  });
  // Una scheda non può chiudersi prima di nascere: si parte dal primo `nato` fra le pendenti.
  const nati = [...pendenti].map((id) => difetti.find((d) => d.id === id)?.nato).filter(Boolean).sort();
  const dalGiorno = (nati[0] || "").slice(0, 10);
  let primoCommitLetto = null;
  for (const c of commits) {
    if (!pendenti.size) break;
    if (dalGiorno && c.data.slice(0, 10) < dalGiorno) continue;
    const mostra = git(["show", `${c.sha}:${rel}`]);
    if (mostra.status !== 0) continue;
    let vecchi;
    try {
      vecchi = JSON.parse(mostra.stdout).difetti || [];
    } catch {
      continue; // un commit col JSON rotto non è una fonte
    }
    if (!primoCommitLetto) primoCommitLetto = c;
    for (const v of vecchi) {
      if (v && v.id && pendenti.has(v.id) && v.stato === "chiuso") {
        const d = difetti.find((x) => x.id === v.id);
        d.chiuso_il = c.data;
        d.chiuso_il_fonte = `git log: primo commit in cui la scheda risulta chiusa (${c.sha.slice(0, 7)}, ${c.data})${ancoraShallow ? " — ⚠️ storia ancora troncata: potrebbe esserci un commit più vecchio non visibile" : ""}`;
        riparate.push({ id: v.id, chiuso_il: c.data, fonte: d.chiuso_il_fonte });
        pendenti.delete(v.id);
      }
    }
  }
}

// ── 4. strada ③: la stima dichiarata per chi resta ───────────────────────────
for (const id of pendenti) {
  const d = difetti.find((x) => x.id === id);
  // Mai vista chiusa in nessun commit: la chiusura è avvenuta fuori dalla storia disponibile
  // (albero di lavoro, o storia troncata). La data meno bugiarda è `aggiornato` del cantiere
  // stesso — e la fonte lo DICE, così nessuno la scambia per una misura.
  const stima = cantiere.aggiornato || new Date().toISOString().slice(0, 16).replace("T", " ");
  d.chiuso_il = stima;
  d.chiuso_il_fonte = `stima: mai vista chiusa nella storia git disponibile — usata la data \`aggiornato\` del cantiere (${stima})`;
  riparate.push({ id, chiuso_il: stima, fonte: d.chiuso_il_fonte });
}

// ── 5. report + scrittura ────────────────────────────────────────────────────
console.log("   Cosa cambia (solo `chiuso_il` + `chiuso_il_fonte`; `stato` MAI toccato):\n");
for (const r of riparate) console.log(`   · ${r.id} → chiuso_il "${r.chiuso_il}"  [${r.fonte.slice(0, 90)}${r.fonte.length > 90 ? "…" : ""}]`);
const perFonte = riparate.reduce((a, r) => ((a[r.fonte.split(":")[0]] = (a[r.fonte.split(":")[0]] || 0) + 1), a), {});
console.log(`\n   Totale: ${riparate.length} schede — per fonte: ${JSON.stringify(perFonte)}`);

// Paranoia dichiarata: nessuno `stato` deve essere cambiato da questo script.
const dopoStati = JSON.stringify(difetti.map((d) => [d?.id, d?.stato]));
const primaStati = JSON.stringify((JSON.parse(testoOriginale).difetti || []).map((d) => [d?.id, d?.stato]));
if (dopoStati !== primaStati) {
  console.error("\n❌ BUG DELLO SCRIPT: uno `stato` è cambiato. Non scrivo niente.");
  process.exit(1);
}

if (!APPLICA) {
  console.log("\n   DRY-RUN: niente scritto. Per applicare: node B-backfill-date.mjs --applica\n");
  process.exit(0);
}
// Indentazione del file conservata (il cantiere usa 2 spazi), scrittura atomica via file temporaneo.
const indent = (testoOriginale.split("\n")[1]?.match(/^\s*/) || ["  "])[0].length || 2;
const tmp = `${CANTIERE}.tmp-backfill`;
writeFileSync(tmp, `${JSON.stringify(cantiere, null, indent)}\n`, "utf8");
renameSync(tmp, CANTIERE);
console.log(`\n   ✅ Scritto ${CANTIERE} (${riparate.length} date di chiusura aggiunte).`);
console.log("   Controprova: node cervello/tasso-chiusura.mjs → la voce «chiusure senza data» deve sparire.\n");
