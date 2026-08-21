#!/usr/bin/env node
// Scarica i plugin approvati da GitHub (raw) e li scrive nei path del manifest.
// Uso: node cervello/sync-worker-plugins.mjs [--dry-run] [--id grilling] [--specchia]
// Richiede rete (tranne --specchia). I file vendored nel repo funzionano anche senza sync.
//
// 🔌 PARITY MOTORE (fix 2026-07-16): i target del manifest stanno in .cursor/skills/ (li carica il
// motore Cursor), ma Claude Code carica le skill SOLO da .claude/skills/. Lo SPECCHIO le copia
// lì, in locale e senza rete (fonte unica = i file vendored .cursor/*): gira a ogni avvio di
// worker/giro/ritmo (best-effort) e a fine sync. La rule ponytail (.mdc, formato Cursor) viene
// convertita in SKILL.md. I file specchiati sono GENERATI e ignorati da git (.gitignore).

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AD_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(AD_ROOT, "cervello/worker-plugins.json");

function parseArgs(argv) {
  const o = { dryRun: false, id: null, specchia: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dry-run") o.dryRun = true;
    else if (argv[i] === "--specchia") o.specchia = true;
    else if (argv[i] === "--id" && argv[i + 1]) {
      o.id = argv[++i];
    } else if (argv[i] === "--help" || argv[i] === "-h") {
      console.log(`Sync plugin worker da GitHub (manifest: cervello/worker-plugins.json)

Opzioni:
  --dry-run   Mostra cosa scaricherebbe
  --id ID     Solo un plugin (vedi cervello/worker-plugins.json)
  --specchia  SOLO lo specchio locale .cursor/skills → .claude/skills (niente rete)
  --help      Questo aiuto`);
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
     Il worker inietta questo frammento SOLO su giro/lavori/metabolizza, MAI in chat Nicola.
     Il contratto di chiarezza (prima riga semplice, max 5 punti) vince sempre con Nicola. -->

`;
  const scoped = content.replace(
    /Use when user says[\s\S]*?or invokes \/caveman\. Also auto-triggers when token efficiency is requested\./,
    "Use ONLY on internal worker tasks (giro, lavori, metabolizza, ritmo) — NEVER when tipo=chat with Nicola in Pannello."
  );
  return header + scoped;
}

const MYCITY_MARKETING_MARKER = "## MYCITY — contesto obbligatorio";
let _mycityMarketingOverlay = null;

function mycityMarketingOverlay() {
  if (_mycityMarketingOverlay) return _mycityMarketingOverlay;
  const path = join(AD_ROOT, "cervello/prompt-fragments/mycity-marketing-overlay.md");
  _mycityMarketingOverlay = readFileSync(path, "utf8").trim();
  return _mycityMarketingOverlay;
}

/** Adatta le skill community (coreyhaines31/marketingskills) a MyCity — idempotente. */
export function patchMarketingSkillForMyCity(content) {
  if (content.includes(MYCITY_MARKETING_MARKER)) return content;
  const overlay = mycityMarketingOverlay();
  const adapted = content
    .replace(
      /If `\.agents\/product-marketing\.md` exists[\s\S]*?specific to this task\./,
      "Leggi PRIMA il blocco MYCITY sotto e, se serve, `MyCity-Vault/90-Memoria-AI/STATO.md` + `consegne/marketing/PIATTAFORMA-CREATIVA.md`. Chiedi solo ciò che manca ancora."
    )
    .replace(
      /If `\.claude\/product-marketing\.md` exists[\s\S]*?specific to this task\./,
      "Leggi PRIMA il blocco MYCITY sotto e, se serve, `MyCity-Vault/90-Memoria-AI/STATO.md` + `consegne/marketing/PIATTAFORMA-CREATIVA.md`. Chiedi solo ciò che manca ancora."
    );
  const m = adapted.match(/^---\n[\s\S]*?\n---\n/);
  if (m) {
    return `${m[0]}\n${overlay}\n\n---\n\n${adapted.slice(m[0].length).replace(/^---\n\n/, "")}`;
  }
  return `${overlay}\n\n---\n\n${adapted}`;
}

// 🔌 ANTI-DOPPIONE (2026-08-21): alcune skill vendored qui arrivano dallo stesso repo di un
// plugin Claude Code ufficiale (es. obra/superpowers). Se quel plugin è ATTIVO, Claude Code carica
// già la sua copia — specchiare la nostra ne creerebbe una seconda con lo stesso `name` (doppione
// che costa token e rende ambigua l'attivazione). Il vendored resta per il motore Cursor, che i
// plugin Claude non li vede. Lettura da .claude/settings.json (progetto) + ~/.claude/settings.json
// (utente): se il plugin non è installato su questa macchina, lo specchio riparte da solo.
function leggiEnabledPlugins() {
  const files = [
    join(AD_ROOT, ".claude/settings.json"),
    join(AD_ROOT, ".claude/settings.local.json"),
    join(homedir(), ".claude/settings.json"),
  ];
  const attivi = new Set();
  for (const f of files) {
    if (!existsSync(f)) continue;
    try {
      const cfg = JSON.parse(readFileSync(f, "utf8"));
      for (const [chiave, on] of Object.entries(cfg.enabledPlugins || {})) {
        if (on) attivi.add(String(chiave).split("@")[0]);
      }
    } catch {
      // settings illeggibile: non è un motivo per saltare lo specchio
    }
  }
  return attivi;
}

export function pluginClaudeAttivo(nome) {
  if (!nome) return false;
  // seme per i test: SYNC_PLUGIN_ATTIVI="superpowers,altro" (stringa vuota = nessuno attivo)
  const forzato = process.env.SYNC_PLUGIN_ATTIVI;
  if (forzato !== undefined) {
    return forzato.split(",").map((x) => x.trim()).filter(Boolean).includes(nome);
  }
  return leggiEnabledPlugins().has(nome);
}

// Path dello specchio Claude per un plugin del manifest (null = non si specchia).
// .cursor/skills/<id>/SKILL.md → .claude/skills/<id>/SKILL.md; la rule ponytail (.mdc) diventa
// una skill; caveman-internal resta un frammento prompt del worker (già engine-agnostico).
function claudeTargetFor(p) {
  if (/^\.cursor\/skills\/.+\/SKILL\.md$/.test(p.target)) {
    return p.target.replace(/^\.cursor\/skills\//, ".claude/skills/");
  }
  if (p.id === "ponytail") return ".claude/skills/ponytail/SKILL.md";
  return null;
}

// Converte una rule Cursor .mdc (frontmatter description/globs/alwaysApply) in una SKILL.md
// per Claude Code (frontmatter name+description; il corpo resta identico). I globs non esistono
// nelle skill: lo scope finisce nella description, che è ciò che guida l'attivazione.
function mdcToSkill(id, content, quando) {
  const corpo = content.replace(/^---\n[\s\S]*?\n---\n/, "");
  const descr = (quando || "Regola di stile codice.").replace(/\n/g, " ").trim();
  return `---\nname: ${id}\ndescription: ${descr}\n---\n${corpo}`;
}

// Specchia i plugin vendored in .claude/skills/ (locale, senza rete). Ritorna il n. di file scritti.
export function specchiaClaude({ dryRun = false } = {}) {
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  let scritti = 0;
  for (const p of manifest.plugin || []) {
    const claudeTarget = claudeTargetFor(p);
    if (!claudeTarget) continue;
    // il plugin Claude fornisce già questa skill: niente specchio, e via la copia vecchia
    // (una macchina che aveva specchiato PRIMA di installare il plugin resterebbe col doppione)
    if (pluginClaudeAttivo(p.fornito_da_plugin)) {
      const vecchia = join(AD_ROOT, claudeTarget);
      if (existsSync(vecchia)) {
        if (dryRun) {
          console.log(`[dry-run] doppione ${p.id}: rimuoverei ${claudeTarget} (lo dà il plugin ${p.fornito_da_plugin})`);
        } else {
          // solo il file, poi la cartella SE resta vuota. Un rmSync ricorsivo sulla cartella
          // spazzerebbe via anche le skill di progetto versionate (verify, cantiere, salute,
          // worker, senior) se una voce del manifest venisse marcata per sbaglio.
          rmSync(vecchia, { force: true });
          try {
            rmdirSync(dirname(vecchia));
          } catch {
            // cartella non vuota: c'è dell'altro dentro, non è roba mia — la lascio stare
          }
          console.log(`✓ doppione rimosso ${p.id} → ${claudeTarget} (lo dà il plugin ${p.fornito_da_plugin})`);
          scritti++;
        }
      }
      continue;
    }
    const sorgente = join(AD_ROOT, p.target);
    if (!existsSync(sorgente)) {
      console.error(`⚠ specchio: sorgente mancante per ${p.id} (${p.target}) — salto`);
      continue;
    }
    let body = readFileSync(sorgente, "utf8");
    if (p.id === "ponytail") body = mdcToSkill("ponytail", body, p.quando);
    const dest = join(AD_ROOT, claudeTarget);
    if (dryRun) {
      console.log(`[dry-run] specchio ${p.id} → ${claudeTarget} (${body.length} byte)`);
      continue;
    }
    // scrittura solo se cambiato: niente mtime che balla a ogni avvio del worker
    if (existsSync(dest) && readFileSync(dest, "utf8") === body) continue;
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, body, "utf8");
    scritti++;
    console.log(`✓ specchio ${p.id} → ${claudeTarget}`);
  }
  return scritti;
}

async function main() {
  const { dryRun, id, specchia } = parseArgs(process.argv.slice(2));
  if (specchia) {
    const n = specchiaClaude({ dryRun });
    console.log(`Specchio .claude/skills: ${n} file aggiornati.`);
    return;
  }
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
    if (p.repo === "coreyhaines31/marketingskills") body = patchMarketingSkillForMyCity(body);
    const hash = sha256(body);
    if (dryRun) {
      console.log(`[dry-run] ${p.id} → ${p.target} (${body.length} byte, sha ${hash})`);
      continue;
    }
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, body, "utf8");
    report.push({ id: p.id, target: p.target, sha: hash, byte: body.length });
    console.log(`✓ ${p.id} → ${p.target} (sha ${hash})`);
  }

  if (!dryRun && report.length) {
    manifest.aggiornato = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Rome" }).replace("T", " ").slice(0, 16);
    manifest.ultimo_sync = report;
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n", "utf8");
    // dopo ogni sync vero, riallinea anche lo specchio Claude (stessa fonte, zero drift)
    specchiaClaude({ dryRun: false });
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
