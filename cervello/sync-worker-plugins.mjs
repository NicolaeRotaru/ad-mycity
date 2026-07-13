#!/usr/bin/env node
// Scarica i plugin approvati da GitHub (raw) e li scrive nei path del manifest.
// Uso: node cervello/sync-worker-plugins.mjs [--dry-run] [--id grilling]

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AD_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(AD_ROOT, "cervello/worker-plugins.json");

function parseArgs(argv) {
  const o = { dryRun: false, id: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dry-run") o.dryRun = true;
    else if (argv[i] === "--id" && argv[i + 1]) o.id = argv[++i];
    else if (argv[i] === "--help" || argv[i] === "-h") {
      console.log("Sync plugin worker — vedi cervello/worker-plugins.json");
      process.exit(0);
    }
  }
  return o;
}

async function fetchRaw(repo, ref, path) {
  const url = `https://raw.githubusercontent.com/${repo}/${ref}/${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} per ${url}`);
  return res.text();
}

function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex").slice(0, 12);
}

function patchPonytailForMyCity(content) {
  return content
    .replace(/^alwaysApply: true$/m, "alwaysApply: false")
    .replace(
      /^globs:\s*$/m,
      "globs:\n  - pannello/**\n  - cervello/**\n  - creativi/**"
    )
    .replace(
      /^description:.*$/m,
      "description: Ponytail — codice minimo (solo file pannello/cervello/creativi). Non in chat Nicola."
    );
}

function patchCavemanForInternal(content) {
  const header = `<!-- Vendored da JuliusBrussee/caveman — scope INTERNO MyCity only.
     Il worker inietta questo frammento SOLO su giro/lavori/metabolizza, MAI in chat Nicola. -->

`;
  const scoped = content.replace(
    /Use when user says[\s\S]*?or invokes \/caveman\. Also auto-triggers when token efficiency is requested\./,
    "Use ONLY on internal worker tasks (giro, lavori, metabolizza, ritmo) — NEVER when tipo=chat with Nicola in Pannello."
  );
  return header + scoped;
}

async function main() {
  const { dryRun, id } = parseArgs(process.argv.slice(2));
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  let plugins = manifest.plugin || [];
  if (id) plugins = plugins.filter((p) => p.id === id);
  if (!plugins.length) {
    console.error(id ? `Plugin non trovato: ${id}` : "Manifest vuoto");
    process.exit(1);
  }
  const report = [];
  for (const p of plugins) {
    const dest = join(AD_ROOT, p.target);
    let body = await fetchRaw(p.repo, p.ref, p.path_sorgente);
    if (p.id === "ponytail") body = patchPonytailForMyCity(body);
    if (p.id === "caveman-internal") body = patchCavemanForInternal(body);
    const hash = sha256(body);
    if (dryRun) {
      console.log(`[dry-run] ${p.id} → ${p.target} (${body.length} byte, sha ${hash})`);
      continue;
    }
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, body, "utf8");
    report.push({ id: p.id, target: p.target, sha: hash });
    console.log(`✓ ${p.id} → ${p.target} (sha ${hash})`);
  }
  if (!dryRun && report.length) {
    manifest.ultimo_sync = report;
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
