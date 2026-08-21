#!/usr/bin/env node
// plugin-acceso.mjs — «il plugin è acceso davvero?», in una riga sola.
//
// PERCHÉ ESISTE (4/8, L-2026-0804-01). `.claude/settings.json` è vietato in scrittura all'AD by
// design: è il file che accende e spegne tutti i freni insieme, e il divieto impedisce che io mi
// allarghi i permessi da sola. Quindi quel file lo incolla Nicola a mano — e a mano, l'ultima
// volta, il testo si è rotto in silenzio: una virgola nel posto sbagliato, nessun errore a schermo,
// solo il lavoro che «non funzionava». Un JSON rotto non urla: sembra un difetto del fix.
//
// Questo attrezzo è la riga che manca fra «ho incollato» e «funziona». Distingue i tre casi che a
// occhio si somigliano tutti:
//   · il file è rotto            → si dice DOVE, e non si dice «spento» (sarebbe una diagnosi falsa)
//   · il file è sano ma spento   → mancano le righe, si dice quali
//   · acceso                     → e da quale dei tre file arriva, che non è dettaglio: il file
//                                  utente vale solo su questa macchina e muore con lei.
//
// Uso: node cervello/plugin-acceso.mjs [nome-plugin]   (default: superpowers)
// Uscita: 0 acceso · 1 spento · 2 file illeggibile (rotto ≠ spento)

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AD_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** I tre posti dove Claude Code legge gli enabledPlugins, dal piu' condiviso al piu' locale. */
export function posti(root = AD_ROOT, casa = homedir()) {
  return [
    { file: join(root, ".claude/settings.json"), dove: "il repo (vale per tutte le sessioni)" },
    { file: join(root, ".claude/settings.local.json"), dove: "solo questa copia del repo" },
    { file: join(casa, ".claude/settings.json"), dove: "solo questa macchina, muore con lei" },
  ];
}

/**
 * Legge un file di impostazioni. Torna sempre un verdetto, mai un'eccezione:
 * { stato: "assente" | "rotto" | "letto", plugin: Set, motivo? }
 */
export function leggiPosto(file, leggi = readFileSync, c_e = existsSync) {
  if (!c_e(file)) return { stato: "assente", plugin: new Set() };
  let testo;
  try {
    testo = leggi(file, "utf8");
  } catch (e) {
    return { stato: "rotto", plugin: new Set(), motivo: `non riesco ad aprirlo: ${e.message}` };
  }
  let cfg;
  try {
    cfg = JSON.parse(testo);
  } catch (e) {
    // il caso del 4/8: virgola o parentesi sbagliata. Il messaggio di JSON.parse dice la posizione,
    // e la posizione e' l'unica cosa che serve a chi deve raddrizzarlo.
    return { stato: "rotto", plugin: new Set(), motivo: `il testo non e' valido — ${e.message}` };
  }
  const attivi = new Set();
  for (const [chiave, on] of Object.entries(cfg?.enabledPlugins || {})) {
    if (on) attivi.add(String(chiave).split("@")[0]);
  }
  return { stato: "letto", plugin: attivi };
}

/** Il verdetto d'insieme: { acceso, dove, rotti: [{file, motivo}] } */
export function verdetto(nome, elenco = posti()) {
  const rotti = [];
  let dove = null;
  for (const p of elenco) {
    const r = leggiPosto(p.file);
    if (r.stato === "rotto") rotti.push({ file: p.file, motivo: r.motivo });
    else if (r.plugin.has(nome) && !dove) dove = p;
  }
  return { acceso: Boolean(dove), dove, rotti };
}

function main() {
  const nome = process.argv[2] || "superpowers";
  const v = verdetto(nome);

  // Un file rotto viene PRIMA del verdetto acceso/spento: se non l'ho potuto leggere non so cosa
  // c'e' dentro, e «spento» sarebbe una risposta che non ho misurato.
  if (v.rotti.length && !v.acceso) {
    for (const r of v.rotti) {
      console.error(`❌ FILE ROTTO — ${r.file}`);
      console.error(`   ${r.motivo}`);
    }
    console.error(`   Non e' «spento»: e' che non ho potuto leggerlo. Mandami questa riga e lo raddrizzo.`);
    process.exit(2);
  }
  if (v.acceso) {
    console.log(`✅ ${nome}: ACCESO — da ${v.dove.dove}`);
    if (v.rotti.length) {
      console.log(`   ⚠️  ma un altro file e' rotto: ${v.rotti.map((r) => r.file).join(", ")}`);
    }
    console.log(`   Se hai appena incollato: riavvia la sessione, i plugin si leggono all'avvio.`);
    process.exit(0);
  }
  console.error(`❌ ${nome}: SPENTO — nessuno dei tre file lo accende.`);
  console.error(`   Servono "extraKnownMarketplaces" e "enabledPlugins" in .claude/settings.json.`);
  console.error(`   Il blocco intero da sostituire sta nella card #142 di AZIONI-IN-ATTESA.`);
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
