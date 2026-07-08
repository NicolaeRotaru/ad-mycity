#!/usr/bin/env node
// 🩺 VAULT-SANITÀ (AR-104) — check di SANITÀ pre-push della memoria che sta per finire su `main`.
//
// PERCHÉ: il gate coerenza-fatti (AR-102) verifica che i FATTI siano coerenti, ma non che i FILE siano
// sani. Un file con un marcatore di conflitto git ("<<<<<<<"), un file a 0 byte, un frontmatter
// mai chiuso o un .json corrotto verrebbero pubblicati su `main` e il Pannello (che legge quel ramo)
// li mostrerebbe rotti a Nicola. Questo controllo BLOCCA il push se il vault è "sporco".
//
// COSA CONTROLLA (sotto la cartella passata, di default MyCity-Vault/90-Memoria-AI):
//   1) marcatori di conflitto git ("<<<<<<<", "=======", ">>>>>>>") in QUALSIASI file → sporco
//   2) file .md / .json a 0 byte → sporco
//   3) .md che iniziano con "---": il frontmatter DEVE avere il "---" di chiusura → altrimenti sporco
//   4) .json: devono essere JSON parsabili (JSON.parse) → altrimenti sporco
//
// FAIL-CLOSED: se non riesce a leggere/verificare (dir mancante, errore imprevisto) → exit ≠ 0
// (= "non pubblicare"). Meglio un giro non pubblicato che memoria rotta spacciata per verità.
//
// USO:
//   node cervello/vault-sanita.mjs                       -> controlla MyCity-Vault/90-Memoria-AI
//   node cervello/vault-sanita.mjs <cartella>            -> controlla la cartella indicata
//   node cervello/vault-sanita.mjs --json <cartella>     -> output JSON (per diagnosi)
// EXIT: 0 = vault sano · 1 = vault sporco (o non verificabile) — vedi lo stderr per i motivi.
//
// Zero dipendenze (solo node:fs / node:path): resta testabile in isolamento su una fixture,
// come gli altri guardiani della macchina. Cablato in giro.sh nel blocco pre-push.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, relative, resolve } from "node:path";

const args = process.argv.slice(2);
const JSON_MODE = args.includes("--json");
const dirArg = args.find((a) => !a.startsWith("--"));
const ROOT = resolve(dirArg || "MyCity-Vault/90-Memoria-AI");

// Marcatori di conflitto git a inizio riga (il pattern che git lascia in un merge non risolto).
const CONFLITTO = /^(<{7}|={7}|>{7})/m;

function elencaFile(dir) {
  const out = [];
  let voci;
  try {
    voci = readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    // FAIL-CLOSED: se non riesco nemmeno a leggere la cartella, è un problema → propaga.
    throw new Error(`impossibile leggere la cartella ${dir}: ${e.message}`);
  }
  for (const v of voci) {
    const p = join(dir, v.name);
    if (v.isDirectory()) {
      out.push(...elencaFile(p));
    } else if (v.isFile()) {
      out.push(p);
    }
  }
  return out;
}

function controlla(root) {
  const problemi = [];
  const file = elencaFile(root);
  for (const f of file) {
    const rel = relative(root, f) || f;
    const ext = extname(f).toLowerCase();
    let size;
    try {
      size = statSync(f).size;
    } catch (e) {
      problemi.push(`${rel}: impossibile leggere la dimensione (${e.message})`);
      continue;
    }
    // 2) file .md/.json a 0 byte
    if ((ext === ".md" || ext === ".json") && size === 0) {
      problemi.push(`${rel}: file a 0 byte`);
      continue; // niente altro da controllare su un file vuoto
    }
    let testo;
    try {
      testo = readFileSync(f, "utf8");
    } catch (e) {
      problemi.push(`${rel}: impossibile leggere il contenuto (${e.message})`);
      continue;
    }
    // 1) marcatori di conflitto git (qualsiasi file)
    if (CONFLITTO.test(testo)) {
      problemi.push(`${rel}: marcatore di conflitto git non risolto (<<<<<<< / ======= / >>>>>>>)`);
    }
    // 3) frontmatter .md che apre "---" ma non lo chiude
    if (ext === ".md" && /^---\r?\n/.test(testo)) {
      // deve esserci una SECONDA riga "---" dopo la prima (chiusura del frontmatter)
      const dopoApertura = testo.replace(/^---\r?\n/, "");
      if (!/^[\s\S]*?\r?\n---\s*(\r?\n|$)/.test(dopoApertura) && !/^---\s*(\r?\n|$)/.test(dopoApertura)) {
        problemi.push(`${rel}: frontmatter aperto con "---" ma mai chiuso`);
      }
    }
    // 4) .json parsabile
    if (ext === ".json") {
      try {
        JSON.parse(testo);
      } catch (e) {
        problemi.push(`${rel}: JSON non parsabile (${e.message})`);
      }
    }
  }
  return { file: file.length, problemi };
}

let esito;
try {
  esito = controlla(ROOT);
} catch (e) {
  // FAIL-CLOSED
  if (JSON_MODE) console.log(JSON.stringify({ ok: false, errore: e.message, root: ROOT }, null, 2));
  else console.error(`⛔ vault-sanità: verifica NON riuscita (fail-closed): ${e.message}`);
  process.exit(1);
}

const ok = esito.problemi.length === 0;
if (JSON_MODE) {
  console.log(JSON.stringify({ ok, root: ROOT, file: esito.file, problemi: esito.problemi }, null, 2));
} else if (ok) {
  console.log(`✅ vault-sanità: ${esito.file} file OK sotto ${ROOT}`);
} else {
  console.error(`⛔ vault-sanità: ${esito.problemi.length} problema/i sotto ${ROOT}:`);
  for (const p of esito.problemi) console.error(`   - ${p}`);
}
process.exit(ok ? 0 : 1);
