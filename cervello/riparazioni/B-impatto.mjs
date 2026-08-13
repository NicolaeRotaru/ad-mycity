#!/usr/bin/env node
// 🩹 B-impatto — RIPARAZIONE DATI per AR-582 (corsia B, lotto contabilità).
//
// Cosa fa: le quattro schede aperte AR-437, AR-438, AR-439, AR-440 non hanno `impatto_crescita`
// (la coda per priorità non sa dove metterle) e due (AR-439, AR-440) non hanno nemmeno `nato`
// (fuori dal conto mensile del tasso di chiusura). Questo script:
//   · mette `impatto_crescita` (tassonomia reale del cantiere: alto|medio|basso — contati sul
//     JSON: alto 274 · medio 217 · basso 70) come SCELTA RAGIONATA dal titolo/causa della scheda,
//     col perché scritto nel campo `impatto_crescita_nota` — non un numero orfano;
//   · mette `nato` per AR-439/AR-440 dal git log di cantiere-difetti.json (data del primo commit
//     in cui la scheda compare, fuso Europe/Rome, "AAAA-MM-GG HH:MM"), con `nato_fonte` accanto.
//
// Cosa NON fa: non tocca `stato`, non tocca altre schede, non inventa date senza dichiararlo.
//
// Uso (idempotente):
//   node B-impatto.mjs                → DRY-RUN
//   node B-impatto.mjs --applica      → scrive
//   [--root=…] [--file=…] [--no-git]  → per test su dati iniettati

import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, relative } from "node:path";

const APPLICA = process.argv.includes("--applica");
const NO_GIT = process.argv.includes("--no-git");
const arg = (n, d) => (process.argv.find((x) => x.startsWith(`--${n}=`)) || "").slice(n.length + 3) || d;
const ROOT = arg("root", process.env.AD_ROOT || "/home/user/ad-mycity");
const FILE = arg("file", join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"));

// La scelta ragionata, scheda per scheda (motivata dal titolo/causa; tassonomia alto|medio|basso):
const PROPOSTE = {
  "AR-437": {
    impatto: "medio",
    perche:
      "Il cancello-lotto rosso per costruzione ferma la CONSEGNA di ogni lotto di riparazione: non tocca ordini o negozi oggi, ma rallenta tutta la velocità con cui la macchina si ripara — la stessa leva del tasso di chiusura. Non 'alto' perché non tocca direttamente ricavi/clienti; non 'basso' perché blocca un processo intero.",
  },
  "AR-438": {
    impatto: "basso",
    perche:
      "La visita si dichiara cieca sulla Cabina per un indirizzo già noto: danno solo diagnostico (un ⚪ evitabile nel referto di salute), nessun effetto su ordini, negozi o velocità di riparazione.",
  },
  "AR-439": {
    impatto: "medio",
    perche:
      "Un `stampSegnale` senza timeout può fermare l'INTERO giro se la memoria risponde lenta: quando scatta, quel turno di lavoro della macchina non produce niente (niente briefing, niente code, niente proposte). Non 'alto' perché è un rischio intermittente, non una perdita continua misurata.",
  },
  "AR-440": {
    impatto: "medio",
    perche:
      "Un allarme cronico indistinguibile da uno nuovo fa diventare sfondo i rossi veri: è il meccanismo con cui i guasti che COSTANO (sensori ciechi, pagamenti non misurati) restano invisibili per settimane. Non 'alto' perché il danno è indiretto: passa da un guasto vero non visto.",
  },
};

if (!existsSync(FILE)) {
  console.error(`❌ cantiere non trovato: ${FILE}`);
  process.exit(2);
}
const testoOriginale = readFileSync(FILE, "utf8");
const cantiere = JSON.parse(testoOriginale);
const difetti = cantiere.difetti || [];

console.log(`\n🩹 B-impatto — ${APPLICA ? "APPLICA" : "DRY-RUN (niente viene scritto)"}\n`);

// ── 1. nato per chi non ce l'ha: primo commit in cui la scheda COMPARE ────────
function natoDaGit(id) {
  const rel = relative(ROOT, FILE);
  const git = (a) => spawnSync("git", a, { cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, env: { ...process.env, TZ: "Europe/Rome" } });
  if (git(["rev-parse", "--is-shallow-repository"]).stdout?.trim() === "true") {
    git(["fetch", "--unshallow", "origin"]);
  }
  const log = git(["log", "--reverse", "--format=%H|%cd", "--date=format-local:%Y-%m-%d %H:%M", "--", rel]);
  for (const riga of (log.stdout || "").trim().split("\n")) {
    const [sha, data] = riga.split("|");
    if (!sha) continue;
    const mostra = git(["show", `${sha}:${rel}`]);
    if (mostra.status === 0 && mostra.stdout.includes(`"${id}"`)) {
      return { data, sha: sha.slice(0, 7) };
    }
  }
  return null;
}

const cambi = [];
for (const [id, p] of Object.entries(PROPOSTE)) {
  const d = difetti.find((x) => x && x.id === id);
  if (!d) {
    console.log(`   · ${id}: non trovato nel cantiere — salto.`);
    continue;
  }
  if (d.stato === "chiuso") {
    console.log(`   · ${id}: risulta chiuso — la coda per priorità non lo ordina più, salto.`);
    continue;
  }
  const cosa = [];
  if (!d.impatto_crescita) {
    d.impatto_crescita = p.impatto;
    d.impatto_crescita_nota = `scelta ragionata (B-impatto, AR-582): ${p.perche}`;
    cosa.push(`impatto_crescita="${p.impatto}"`);
  }
  if (!d.nato) {
    if (NO_GIT) {
      cosa.push("nato: SALTATO (--no-git)");
    } else {
      const n = natoDaGit(id);
      if (n) {
        d.nato = n.data;
        d.nato_fonte = `git log: primo commit in cui la scheda compare (${n.sha}, ${n.data})`;
        cosa.push(`nato="${n.data}" (commit ${n.sha})`);
      } else {
        cosa.push("nato: NON ricavabile dalla storia git — lasciato vuoto e DETTO (meglio un buco dichiarato di una data inventata)");
      }
    }
  }
  if (cosa.length) cambi.push({ id, cosa, perche: p.perche });
}

if (!cambi.length) {
  console.log("   ✅ Le quattro schede hanno già impatto_crescita e nato: niente da riparare.\n");
  process.exit(0);
}
console.log("   Cosa cambia (mai `stato`; il perché resta scritto nella scheda):\n");
for (const c of cambi) {
  console.log(`   · ${c.id}: ${c.cosa.join(" · ")}`);
  console.log(`     perché: ${c.perche.slice(0, 140)}…`);
}

if (!APPLICA) {
  console.log("\n   DRY-RUN: niente scritto. Per applicare: node B-impatto.mjs --applica\n");
  process.exit(0);
}
const indent = (testoOriginale.split("\n")[1]?.match(/^\s*/) || ["  "])[0].length || 2;
const tmp = `${FILE}.tmp-impatto`;
writeFileSync(tmp, `${JSON.stringify(cantiere, null, indent)}\n`, "utf8");
renameSync(tmp, FILE);
console.log(`\n   ✅ Scritto ${FILE} (${cambi.length} schede completate).`);
console.log("   Controprova: node cervello/cantiere-prove.mjs --dry → AR-437..440 spariscono dalle «schede senza campi».\n");
