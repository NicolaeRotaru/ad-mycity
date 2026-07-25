#!/usr/bin/env node
// 🔐 GUARDIANO DEI PERMESSI DI SESSIONE (AR-142). 🟢 Sola lettura: legge .claude/settings*.json e basta.
//
// Il difetto: i permessi si erano allargati nel tempo — ogni lavoro sbloccava il suo pezzetto e nessuno
// li restringeva mai. La causa-radice dichiarata in AR-142 non è la singola voce larga, è che
// «nessun guardiano confronta i permessi effettivi con la regola d'oro di CLAUDE.md». Senza un
// controllo, la lista può solo crescere: allargare è un gesto di 10 secondi, restringere non lo fa nessuno.
//
// Questo è quel controllo. Confronta i permessi VERI con le regole d'oro e stampa cosa non torna.
//
// Perché è un guardiano e non una modifica: la macchina NON può toccarsi i permessi da sola —
// `.claude/settings.json` è in deny per Edit e Write, apposta. Restringere resta un gesto di Nicola.
// Il guardiano trasforma «verifica umana» (che nessuno può mai chiudere) in un numero che si vede
// a ogni giro: se la lista si riallarga, salta fuori subito invece che alla prossima radiografia.
//
// Uso:
//   node cervello/permessi-check.mjs           -> report leggibile
//   node cervello/permessi-check.mjs --json    -> JSON (per il giro / la Cabina)
// Exit: 0 = permessi entro le regole · 1 = almeno una violazione

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const FILES = [".claude/settings.json", ".claude/settings.local.json"];

// ─────────────────────────────────────────────────────────────────────────────
// LE REGOLE D'ORO — ognuna cita la fonte, così non sono opinioni di questo script.
// `vieta` matcha la voce di allow; `deve_negare` chiede che una voce sia in deny.
export const REGOLE = [
  {
    id: "no-push-diretto",
    perche: "CLAUDE.md: si lavora in branch e si apre PR — mai push diretto su main. Il merge è di Nicola (🔴).",
    deve_negare: /^Bash\(git push/,
    vieta: /^Bash\(git push(?!\s*--dry-run)/,
  },
  {
    id: "no-merge-generico",
    perche: "Un `git merge:*` generico permette di portare codice su main senza passare dalla PR.",
    vieta: /^Bash\(git merge(:\*)?\)/,
  },
  {
    id: "write-con-path",
    perche: "Write senza path può scrivere ovunque, .env e settings compresi: va sempre ristretto a un percorso.",
    vieta: /^Write$|^Write\(\*\)$|^Edit$|^Edit\(\*\)$/,
  },
  {
    id: "no-esecuzione-da-tmp",
    perche: "Eseguire script da /tmp aggira la revisione del codice: ciò che gira deve stare nel repo.",
    vieta: /\/tmp\//,
  },
  {
    id: "curl-limitato",
    perche: "curl senza dominio è una mano verso QUALSIASI host: esfiltrazione e invii reali fuori dal cancello 🟢🟡🔴.",
    vieta: /^Bash\(curl:\*\)$/,
  },
  {
    id: "segreti-illeggibili",
    perche: "I file .env contengono le chiavi vere: vanno negati in lettura e scrittura, non solo 'evitati'.",
    deve_negare: /\.env/,
  },
  {
    id: "no-auto-permessi",
    perche: "La macchina non deve poter allargare i propri permessi: settings.json va negato in Edit/Write.",
    deve_negare: /\.claude\/settings\.json/,
  },
];

function leggiSettings() {
  const out = [];
  for (const rel of FILES) {
    const p = join(AD_ROOT, rel);
    if (!existsSync(p)) continue;
    try {
      const j = JSON.parse(readFileSync(p, "utf8"));
      const perm = j.permissions || {};
      out.push({ file: rel, allow: perm.allow || [], deny: perm.deny || [] });
    } catch (e) {
      out.push({ file: rel, errore: e.message, allow: [], deny: [] });
    }
  }
  return out;
}

/**
 * Applica le regole a una coppia allow/deny. Pura, così il test la prova senza toccare il disco.
 * Ritorna la lista delle violazioni: { regola, tipo: "allow-troppo-largo" | "deny-mancante", voce, perche }.
 */
export function violazioni(allow = [], deny = [], regole = REGOLE) {
  const out = [];
  for (const r of regole) {
    if (r.vieta) {
      for (const voce of allow) {
        if (r.vieta.test(String(voce))) {
          out.push({ regola: r.id, tipo: "allow-troppo-largo", voce: String(voce), perche: r.perche });
        }
      }
    }
    if (r.deve_negare) {
      const coperto = deny.some((d) => r.deve_negare.test(String(d)));
      if (!coperto) {
        out.push({ regola: r.id, tipo: "deny-mancante", voce: String(r.deve_negare), perche: r.perche });
      }
    }
  }
  return out;
}

function main() {
  const quando = nowPiacenza();
  const files = leggiSettings();
  if (!files.length) {
    const msg = "nessun .claude/settings*.json trovato: permessi non verificabili.";
    if (JSON_MODE) console.log(JSON.stringify({ esito: "cieco", quando, messaggio: msg }, null, 2));
    else console.error(`\n🔐 PERMESSI — ${quando}\n\n❌ ${msg}`);
    process.exit(1);
  }

  const tutte = [];
  for (const f of files) {
    for (const v of violazioni(f.allow, f.deny)) tutte.push({ ...v, file: f.file });
  }

  if (JSON_MODE) {
    console.log(JSON.stringify({ esito: tutte.length ? "violazioni" : "ok", quando, files: files.map((f) => ({ file: f.file, allow: f.allow.length, deny: f.deny.length })), violazioni: tutte }, null, 2));
    process.exit(tutte.length ? 1 : 0);
  }

  console.log(`\n🔐 PERMESSI DI SESSIONE — ${quando}\n`);
  for (const f of files) {
    console.log(`  ${f.file}: ${f.allow.length} allow · ${f.deny.length} deny${f.errore ? ` · ⚠️ ${f.errore}` : ""}`);
  }
  if (!tutte.length) {
    console.log(`\n✅ Permessi entro le regole d'oro (${REGOLE.length} regole controllate).`);
    process.exit(0);
  }
  console.log(`\n❌ ${tutte.length} violazione/i — la macchina può fare più di quanto dovrebbe:\n`);
  for (const v of tutte) {
    const cosa = v.tipo === "allow-troppo-largo" ? `permesso troppo largo: ${v.voce}` : `manca il divieto: ${v.voce}`;
    console.log(`  • [${v.regola}] ${cosa}   (${v.file})`);
    console.log(`      perché: ${v.perche}`);
  }
  console.log(`\n→ Le correzioni le fa NICOLA: .claude/settings.json è negato in Edit/Write alla macchina, apposta.`);
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
