// Collega il repo del marketplace (NicolaeRotaru/mycity) a QUESTA macchina/AD/pannello,
// così l'AD può LEGGERE e ANALIZZARE il codice vero del sito (radiografia, audit-design, tech, qa).
//
// 🟢 Azione reversibile e in SOLA LETTURA sul marketplace: scarica/aggiorna una COPIA locale.
//    Non tocca mai il repo del marketplace su GitHub, non fa push, non deploya.
//
// Uso:
//   node cervello/collega-marketplace.mjs            -> clona o aggiorna la copia locale
//   node cervello/collega-marketplace.mjs --status   -> dice solo dov'è collegato (senza scaricare)
//
// Configurazione (env, tutte opzionali):
//   MARKETPLACE_GIT_REPO  owner/repo da clonare         (default NicolaeRotaru/mycity)
//   MARKETPLACE_BRANCH    ramo da seguire               (default main)
//   MARKETPLACE_REPO      percorso locale della copia   (default <ad-repo>/marketplace)
//   MARKETPLACE_GIT_TOKEN PAT GitHub (solo se il repo diventa privato; per ora è pubblico)
//                         in mancanza usa GIT_TOKEN / GIT_PUSH_TOKEN se presenti.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  AD_ROOT,
  DEFAULT_CHECKOUT,
  MARKETPLACE_BRANCH,
  MARKETPLACE_GIT_REPO,
  resolveMarketplaceRepo,
} from "./marketplace-repo.mjs";

const TARGET = process.env.MARKETPLACE_REPO || DEFAULT_CHECKOUT;
const TOKEN =
  process.env.MARKETPLACE_GIT_TOKEN ||
  process.env.GIT_TOKEN ||
  process.env.GIT_PUSH_TOKEN ||
  "";

// URL pubblico di default; col token diventa autenticato (per repo privati). Il token NON viene mai stampato.
const CLONE_URL = TOKEN
  ? `https://x-access-token:${TOKEN}@github.com/${MARKETPLACE_GIT_REPO}.git`
  : `https://github.com/${MARKETPLACE_GIT_REPO}.git`;

function git(args, cwd) {
  return execFileSync("git", args, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  }).trim();
}

function status() {
  const p = resolveMarketplaceRepo();
  const linked = existsSync(join(p, ".git")) || existsSync(join(p, "package.json"));
  console.log("Collegamento al marketplace (NicolaeRotaru/mycity):");
  console.log(`  repo sorgente:   ${MARKETPLACE_GIT_REPO} (ramo ${MARKETPLACE_BRANCH})`);
  console.log(`  copia locale:    ${p}`);
  console.log(`  stato:           ${linked ? "COLLEGATO ✅" : "NON collegato ❌"}`);
  if (linked) {
    try {
      const head = git(["rev-parse", "--short", "HEAD"], p);
      const last = git(["log", "-1", "--format=%cd · %s", "--date=short"], p);
      console.log(`  ultimo commit:   ${head} — ${last}`);
    } catch {
      /* copia presente ma non interrogabile: ignoriamo */
    }
  } else {
    console.log("\n  → per collegarlo:  node cervello/collega-marketplace.mjs");
  }
  console.log(
    `\n  Suggerimento: esporta  MARKETPLACE_REPO="${p}"  così i workflow lo trovano sempre.`
  );
}

function link() {
  console.log(`Collego ${MARKETPLACE_GIT_REPO} (ramo ${MARKETPLACE_BRANCH}) → ${TARGET}`);
  try {
    git(["--version"]);
  } catch {
    console.error("ERRORE: git non è installato su questa macchina.");
    process.exit(1);
  }

  if (existsSync(join(TARGET, ".git"))) {
    console.log("  copia già presente: aggiorno alla versione più recente…");
    try {
      git(["remote", "set-url", "origin", CLONE_URL], TARGET);
      git(["fetch", "--depth", "1", "origin", MARKETPLACE_BRANCH], TARGET);
      git(["checkout", "-f", MARKETPLACE_BRANCH], TARGET);
      git(["reset", "--hard", `origin/${MARKETPLACE_BRANCH}`], TARGET);
      git(["clean", "-fd"], TARGET);
      console.log("  aggiornata ✅");
    } catch (e) {
      console.error(`  ERRORE durante l'aggiornamento: ${sanitize(e)}`);
      process.exit(1);
    }
  } else {
    mkdirSync(dirname(TARGET), { recursive: true });
    try {
      git(["clone", "--depth", "1", "--branch", MARKETPLACE_BRANCH, CLONE_URL, TARGET]);
      console.log("  clonata ✅");
    } catch (e) {
      console.error(`  ERRORE durante il clone: ${sanitize(e)}`);
      console.error("  (repo inesistente, rete assente o token mancante per repo privato?)");
      process.exit(1);
    }
  }
  console.log("");
  status();
}

// Non lasciar trapelare il token in eventuali messaggi d'errore di git.
function sanitize(err) {
  const msg = (err && (err.stderr || err.message)) || String(err);
  return TOKEN ? msg.split(TOKEN).join("***") : msg;
}

const arg = process.argv[2];
if (arg === "--status" || arg === "status") status();
else link();

// Evita warning lint su import non usato in alcuni percorsi.
void AD_ROOT;
