#!/usr/bin/env node
// scan-segreti.mjs — scan-segreti deterministico della PROPRIA repo (cardine di sicurezza).
// 🟢 Sola lettura. Cerca segreti reali nei file che stanno per essere versionati e, se ne trova,
// esce con codice ≠0 così il giro può BLOCCARE il commit/push prima che il segreto entri nella storia.
//
// Risolve AR-021 (causa a monte di AR-004): il perimetro segreti non era difeso da uno scan attivo,
// ma solo da una regola .gitignore fragile. Ora ogni giro passa da qui prima di `git add -A`.
//
// Uso:
//   node cervello/scan-segreti.mjs            -> report leggibile (valori SEMPRE redatti)
//   node cervello/scan-segreti.mjs --json     -> output JSON per giro.sh
//   node cervello/scan-segreti.mjs --staged   -> scansiona solo i file staged (git diff --cached)
//
// Exit: 0 = pulito · 1 = trovato almeno un segreto (BLOCCA) · 2 = errore interno

import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const STAGED_ONLY = process.argv.includes("--staged");

// Pattern di segreti REALI (non placeholder). Ognuno ha un nome e una regex ancorata a prefissi veri.
// I placeholder tipici (xxxx, <...>, your_, REDATTO, INSERISCI, service_role_della_…) NON matchano.
const REGOLE = [
  { nome: "GitHub fine-grained PAT", re: /github_pat_11[A-Za-z0-9]{20,}/g },
  { nome: "GitHub classic/OAuth token", re: /gh[pousr]_[A-Za-z0-9]{36,}/g },
  { nome: "Stripe secret/live key", re: /sk_live_[A-Za-z0-9]{20,}/g },
  { nome: "Stripe restricted key", re: /rk_live_[A-Za-z0-9]{20,}/g },
  { nome: "Supabase/JWT service_role", re: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g },
  { nome: "Google API key", re: /AIza[0-9A-Za-z_-]{35}/g },
  { nome: "OpenAI key", re: /sk-[A-Za-z0-9]{32,}/g },
  { nome: "Slack token", re: /xox[baprs]-[A-Za-z0-9-]{10,}/g },
  { nome: "AWS access key id", re: /AKIA[0-9A-Z]{16}/g },
  { nome: "Chiave privata PEM", re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g },
];

// Estensioni binarie/di rumore da saltare.
const SKIP_EXT = /\.(png|jpe?g|gif|webp|ico|pdf|zip|gz|tar|mp4|mov|woff2?|ttf|otf|lock)$/i;

/** Redige un segreto: mostra solo i primi 7 e gli ultimi 3 caratteri. */
function reda(s) {
  if (s.length <= 12) return s.slice(0, 3) + "…";
  return `${s.slice(0, 7)}…${s.slice(-3)} [${s.length} char]`;
}

/** Elenco dei file da scansionare: quelli che git considera versionabili (tracciati + non-ignorati). */
function fileDaScansionare() {
  try {
    if (STAGED_ONLY) {
      const out = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACM"], {
        cwd: AD_ROOT,
        encoding: "utf8",
      });
      return out.split("\n").map((s) => s.trim()).filter(Boolean);
    }
    // tracciati + non-tracciati-non-ignorati (esclude ciò che .gitignore protegge, es. i .env reali)
    const out = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
      cwd: AD_ROOT,
      encoding: "utf8",
    });
    return out.split("\n").map((s) => s.trim()).filter(Boolean);
  } catch (e) {
    throw new Error(`git non disponibile: ${e.message || e}`);
  }
}

function main() {
  const quando = nowPiacenza();
  let files;
  try {
    files = fileDaScansionare();
  } catch (e) {
    console.error("ERRORE scan-segreti:", e.message || e);
    process.exit(2);
  }

  const trovati = [];
  for (const rel of files) {
    if (SKIP_EXT.test(rel)) continue;
    const abs = join(AD_ROOT, rel);
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue;
    }
    if (!st.isFile() || st.size > 2_000_000) continue; // salta file enormi
    let testo;
    try {
      testo = readFileSync(abs, "utf8");
    } catch {
      continue; // binario/non-utf8
    }
    for (const regola of REGOLE) {
      regola.re.lastIndex = 0;
      const m = testo.match(regola.re);
      if (m && m.length) {
        for (const hit of m) {
          trovati.push({ file: rel, regola: regola.nome, campione: reda(hit) });
        }
      }
    }
  }

  const esito = trovati.length ? "trovato" : "pulito";
  const sintesi = trovati.length
    ? `${trovati.length} possibili segreti in ${new Set(trovati.map((t) => t.file)).size} file`
    : `nessun segreto in ${files.length} file versionabili`;

  stampSegnale("scan-segreti", trovati.length ? "errore" : "ok", `${sintesi} · ${quando}`).catch(() => {});

  if (JSON_MODE) {
    console.log(JSON.stringify({ esito, quando, sintesi, trovati }, null, 2));
  } else {
    console.log(`\n🔒 SCAN SEGRETI — ${quando}\n`);
    if (!trovati.length) {
      console.log(`✅ ${sintesi}`);
    } else {
      console.log(`❌ ${sintesi}. BLOCCA il commit finché non sono rimossi:\n`);
      for (const t of trovati) console.log(`  • ${t.file} — ${t.regola}: ${t.campione}`);
      console.log(`\nRimuovi il valore dal file, ruota il segreto se era reale, e ricontrolla.`);
    }
  }

  process.exit(trovati.length ? 1 : 0);
}

main();
