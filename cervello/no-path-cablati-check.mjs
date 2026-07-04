// Guardiano ANTI-RICADUTA: nessun percorso di macchina cablato nel codice.
//
// Perché esiste: la radiografia/audit-design del sito non girava sul VPS perché il percorso del
// marketplace era CABLATO su una cartella Windows del PC di Nicola
// (`C:\Users\InfinitaPossibilita\mycity-live`). Un path del genere «non c'entra niente» con la
// macchina che gira ora e rompe in silenzio tutto ciò che legge il codice del sito.
//
// Cosa fa: scandaglia i file ESEGUIBILI (.mjs/.js/.cjs/.ts) del cervello e dei workflow e FALLISCE
// (exit 1) se trova un percorso assoluto legato a UNA macchina specifica:
//   • Windows con lettera di unità:  C:\...  D:\...  (anche con / al posto di \)
//   • cartelle utente macOS/Windows: /Users/<nome>/...   \Users\<nome>\...
// La regola è: il codice risolve i percorsi in modo relativo/da env (es. MARKETPLACE_REPO o
// <ad-repo>/marketplace via marketplace-repo.mjs), MAI incollando la cartella di un PC.
//
// SOLA LETTURA: legge i file e stampa. Non modifica niente. Gira a ogni giro (giro.sh).
// Uso:  node cervello/no-path-cablati-check.mjs        → exit 0 pulito, exit 1 se trova un path cablato
//       node cervello/no-path-cablati-check.mjs --json → esito in JSON

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const AD_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const asJson = process.argv.includes("--json");

// Dove cerchiamo il codice eseguibile della macchina.
const SCAN_DIRS = ["cervello", ".claude/workflows", ".claude/agents", "pannello/lib", "pannello/app"];
// Estensioni di codice (i .md/.ps1 sono documentazione/setup Windows legittimi: si escludono).
const CODE_EXT = new Set([".mjs", ".js", ".cjs", ".ts", ".tsx", ".jsx"]);
// Cartelle da non attraversare mai.
const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "marketplace", "dist", "build"]);

// I pattern «cablato su una macchina»: lettera di unità Windows o cartella utente nominale.
// NON floppa su /opt/mycity o /home/mycity (sono la macchina reale, non un PC personale altrui).
// Il guardiano legge il TESTO sorgente: là il path appare come `C:\\Users` (due backslash) o
// `C:/Users`. `[\\/]+` copre entrambi. Lookbehind `(?<![A-Za-z])`: la lettera di unità è SINGOLA,
// così `https://` (dove `s` è preceduta da `p`) NON viene scambiata per un percorso Windows.
const PATTERNS = [
  { re: /(?<![A-Za-z])[A-Za-z]:[\\/]+[^"'`\s]*/g, tipo: "unità Windows (C:\\... o C:/...)" },
  { re: /[/\\]{1,2}Users[/\\]{1,2}[^/\\"'`\s]+/g, tipo: "cartella utente (/Users/<nome>)" },
];

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(full, out);
    else if (CODE_EXT.has(extname(name))) out.push(full);
  }
}

const files = [];
for (const d of SCAN_DIRS) walk(join(AD_ROOT, d), files);

const hits = [];
for (const f of files) {
  let text;
  try {
    text = readFileSync(f, "utf8");
  } catch {
    continue;
  }
  // Il guardiano cita i path incriminati nei propri commenti/regex: non deve segnalare sé stesso.
  if (f.endsWith("no-path-cablati-check.mjs")) continue;
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    // Un path in un COMMENTO è innocuo (documentazione): conta solo se è un valore vivo nel codice.
    const t = line.trim();
    if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*") || t.startsWith("#")) return;
    for (const { re, tipo } of PATTERNS) {
      re.lastIndex = 0;
      const m = re.exec(line);
      if (m) {
        hits.push({
          file: relative(AD_ROOT, f),
          riga: i + 1,
          tipo,
          estratto: line.trim().slice(0, 120),
        });
      }
    }
  });
}

if (asJson) {
  console.log(JSON.stringify({ ok: hits.length === 0, cablati: hits.length, hits }, null, 2));
} else if (hits.length === 0) {
  console.log("✅ Nessun percorso di macchina cablato nel codice. I path si risolvono da env/relativi.");
} else {
  console.log(`❌ ${hits.length} percorso/i CABLATO/I su una macchina specifica (non gira altrove):`);
  for (const h of hits) {
    console.log(`   • ${h.file}:${h.riga} — ${h.tipo}`);
    console.log(`     ${h.estratto}`);
  }
  console.log("\n   → Risolvi il percorso da env (MARKETPLACE_REPO) o relativo (<ad-repo>/marketplace),");
  console.log("     come fa cervello/marketplace-repo.mjs. Mai incollare la cartella di un PC.");
}

process.exit(hits.length === 0 ? 0 : 1);
