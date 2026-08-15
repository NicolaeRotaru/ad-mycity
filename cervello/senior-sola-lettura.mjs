#!/usr/bin/env node
// AR-617 — CENTOQUATTORDICI SENIOR PROMETTEVANO SOLA LETTURA, E NESSUN FRENO GLIELO IMPONEVA.
//
// Nei mansionari in `.claude/agents/` 114 file su 120 dichiarano un mandato in SOLA LETTURA: il QA
// sul codice del marketplace, l'analista sui dati, i professionali sui documenti. Ma nessuno dei
// 120 frontmatter aveva il campo `tools:` — l'unico posto in cui il runtime dei sotto-agenti limita
// DAVVERO gli strumenti. Ogni senior ereditava quindi tutto ciò che ha la sessione che lo lancia,
// compresi gli strumenti collegati che scrivono su sistemi esterni: SQL arbitrario sul database del
// sito, unione di una richiesta su GitHub, rilascio in produzione.
// La sola lettura viveva soltanto nella prosa del mansionario — cioè in una promessa scritta.
//
// ── COSA FA QUESTO GUARDIANO ────────────────────────────────────────────────
// Confronta la PROMESSA scritta nel corpo con gli STRUMENTI concessi nel frontmatter, e fallisce
// se la seconda non regge la prima. Tre modi di non reggerla:
//   ① il campo `tools:` non c'è → la promessa non ha nessun attuatore;
//   ② fra gli strumenti ce n'è uno che SCRIVE su un sistema esterno (classificato dal nome, non da
//      una lista nera: `permessi-strumenti.mjs`, AR-273) → la promessa è contraddetta;
//   ③ c'è `Task` → un senior che può lanciare un altro senior esce dai propri limiti dal giro dopo.
//
// ── COSA NON FA, E VA DETTO ─────────────────────────────────────────────────
// Il kit qui sotto tiene `Bash`, `Write` e `Edit`: i senior DEVONO poter consegnare in `consegne/`
// e far girare gli script del cervello (è il «doer mode» del mansionario dell'AD). Il freno che si
// stringe qui è quello sugli strumenti collegati, che è dove sta il danno irreversibile. Sui file
// il perimetro resta quello dei permessi di sessione, che non è di questa corsia.
//
// Uso:
//   node cervello/senior-sola-lettura.mjs           -> report
//   node cervello/senior-sola-lettura.mjs --json    -> JSON
//   node cervello/senior-sola-lettura.mjs --applica -> scrive il campo tools: dove manca
// Exit: 0 = ogni promessa ha il suo freno · 1 = almeno una promessa scoperta

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { classificaStrumento, eStrumentoCollegato } from "./permessi-strumenti.mjs";

const QUI = fileURLToPath(new URL(".", import.meta.url));
export const CARTELLA_AGENTI = process.env.AGENTI_DIR || join(QUI, "..", ".claude", "agents");

/**
 * Il kit di chi lavora in sola lettura sulle FONTI dichiarate.
 * Ogni voce collegata (`mcp__…`) qui dentro deve classificarsi come lettura: il test lo verifica,
 * così questo elenco non può allargarsi in silenzio.
 */
export const KIT_SOLA_LETTURA = [
  "Read",
  "Grep",
  "Glob",
  "Bash",
  "Write",
  "Edit",
  "WebSearch",
  "WebFetch",
  "TodoWrite",
  "mcp__supabase-marketplace__list_tables",
  "mcp__supabase-marketplace__get_logs",
  "mcp__supabase-memoria__list_tables",
  "mcp__github__list_pull_requests",
  "mcp__github__pull_request_read",
  "mcp__github__list_commits",
  "mcp__github__get_commit",
  "mcp__github__actions_list",
];

/** Gli strumenti che un senior non può avere, qualunque sia il suo mandato. */
export const MAI = new Set(["Task"]);

/** Spezza un mansionario in frontmatter e corpo. `fm: null` = nessun frontmatter. */
export function separaFrontmatter(testo) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(String(testo || ""));
  if (!m) return { fm: null, corpo: String(testo || ""), lunghezzaFm: 0 };
  return { fm: m[1], corpo: String(testo).slice(m[0].length), lunghezzaFm: m[0].length };
}

/** Gli strumenti dichiarati nel frontmatter. `null` = il campo non c'è (che è il difetto). */
export function strumentiDichiarati(fm) {
  if (fm == null) return null;
  const m = /^tools:\s*(.*)$/m.exec(fm);
  if (!m) return null;
  return m[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Il mansionario promette di lavorare in sola lettura da qualche parte? */
export function prometteSolaLettura(testo) {
  return /SOLA LETTURA/i.test(String(testo || ""));
}

/**
 * Il verdetto su UN mansionario. Pura: riceve il testo, non apre niente.
 * @returns {{nome:string, promette:boolean, tools:string[]|null, ok:boolean, guai:string[]}}
 */
export function verdettoAgente(nome, testo) {
  const { fm } = separaFrontmatter(testo);
  const tools = strumentiDichiarati(fm);
  const promette = prometteSolaLettura(testo);
  const guai = [];
  if (!promette) return { nome, promette, tools, ok: true, guai };
  if (tools == null) {
    guai.push("dichiara SOLA LETTURA ma non ha il campo `tools:`: la promessa non ha nessun freno tecnico");
    return { nome, promette, tools, ok: false, guai };
  }
  for (const t of tools) {
    if (MAI.has(t)) {
      guai.push(`ha «${t}»: può lanciare un altro senior, e da lì i suoi limiti non valgono più`);
      continue;
    }
    if (!eStrumentoCollegato(t)) continue;
    const c = classificaStrumento(t);
    if (c.tipo === "scrittura" || c.tipo === "sconosciuto") {
      guai.push(`ha «${t}» (${c.motivo}): contraddice la sola lettura che promette nel corpo`);
    }
  }
  return { nome, promette, tools, ok: guai.length === 0, guai };
}

/** Il testo del mansionario con il campo `tools:` scritto (o riscritto) nel frontmatter. */
export function conStrumenti(testo, tools = KIT_SOLA_LETTURA) {
  const { fm, corpo } = separaFrontmatter(testo);
  const riga = `tools: ${tools.join(", ")}`;
  if (fm == null) return `---\n${riga}\n---\n${testo}`;
  const nuovoFm = /^tools:\s*.*$/m.test(fm) ? fm.replace(/^tools:\s*.*$/m, riga) : `${fm}\n${riga}`;
  return `---\n${nuovoFm}\n---\n${corpo}`;
}

function leggiAgenti(dir = CARTELLA_AGENTI) {
  if (!existsSync(dir)) return null;
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ nome: f, percorso: join(dir, f), testo: readFileSync(join(dir, f), "utf8") }));
}

function main() {
  const agenti = leggiAgenti();
  if (agenti == null) {
    console.error(`⚪ cartella dei mansionari non trovata (${CARTELLA_AGENTI}): non ho potuto misurare.`);
    process.exit(2);
  }
  if (process.argv.includes("--applica")) {
    let scritti = 0;
    for (const a of agenti) {
      const v = verdettoAgente(a.nome, a.testo);
      if (v.ok) continue;
      writeFileSync(a.percorso, conStrumenti(a.testo));
      scritti++;
    }
    console.log(`✍️  scritto il campo tools: in ${scritti} mansionari.`);
  }

  const rifatti = leggiAgenti();
  const verdetti = rifatti.map((a) => verdettoAgente(a.nome, a.testo));
  const promettono = verdetti.filter((v) => v.promette);
  const scoperti = verdetti.filter((v) => !v.ok);

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ totale: verdetti.length, promettono: promettono.length, scoperti: scoperti.map((v) => ({ nome: v.nome, guai: v.guai })) }, null, 2));
    process.exit(scoperti.length ? 1 : 0);
  }

  console.log(`\n🔒 SENIOR IN SOLA LETTURA — ${verdetti.length} mansionari, ${promettono.length} promettono sola lettura`);
  if (!scoperti.length) {
    console.log(`✅ ogni promessa ha il suo freno: il campo tools: c'è e non contiene strumenti che scrivono fuori.`);
    process.exit(0);
  }
  console.log(`\n❌ ${scoperti.length} promessa/e senza freno:`);
  for (const v of scoperti) for (const g of v.guai) console.log(`  • ${v.nome} — ${g}`);
  console.log(`\n→ Si rimedia con: node cervello/senior-sola-lettura.mjs --applica`);
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
