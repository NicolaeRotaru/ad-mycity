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
// COME FUNZIONANO DAVVERO I PERMESSI (verificato il 2026-07-25, ed è il perno di questo script):
//   ① allow e deny di TUTTI i file di configurazione si SOMMANO — non sono due mondi separati;
//   ② il DENY VINCE SEMPRE sull'allow, da qualunque file arrivi.
// Da qui due conseguenze che la prima versione di questo guardiano sbagliava entrambe:
//   · un divieto scritto in `settings.json` copre anche `settings.local.json` → cercare i divieti
//     file per file produceva violazioni FANTASMA (il file locale non ha deny propri: ha i suoi);
//   · un permesso largo già coperto da un divieto NON è una violazione: è configurazione MORTA.
//     Va segnalata (confonde chi legge) ma non conta come «la macchina può fare troppo».
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
    perche: "CLAUDE.md: da agente cloud si lavora in branch e si apre PR — mai push diretto su main.",
    deve_negare: /^Bash\(git push/,
    vieta: /^Bash\(git push(?!\s*--dry-run)/,
    // NOTA (2026-07-25). Qui era nato l'allarme sbagliato: sul VPS il guardiano segnalava come
    // violazione un `git push origin main` che CLAUDE.md riga 355 sembra prescrivere
    // («dal VPS commit+push diretto su main»). Ho controllato chi pubblica davvero la memoria:
    //   · i push su main li fanno gli SCRIPT bash (aggiorna-cervello.sh, giro.sh, worker.sh,
    //     monitora.sh, ritmo.sh) lanciati da cron/systemd — non passano da questi permessi;
    //   · quando è Claude a girare sul VPS, `motore-ai.sh` gli costruisce una --allowedTools che
    //     il push NON lo contiene, apposta: «il push autenticato lo fa solo git-pr.mjs, su un
    //     branch di PR, mai su main».
    // Quindi la regola è giusta anche sul VPS, e togliere quel permesso non ferma niente.
    // Il difetto era nel guardiano: vedi `neutralizzato()` — quel permesso è già coperto dal
    // divieto `Bash(git push:*)` di settings.json, quindi è inerte, non pericoloso.
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

/** Spezza `Bash(git push:*)` in { tool:"Bash", spec:"git push:*" }. Una voce nuda (`Write`) resta tool. */
function scomponi(voce) {
  const s = String(voce || "").trim();
  const m = /^([A-Za-z_][\w-]*)\((.*)\)$/.exec(s);
  return m ? { tool: m[1], spec: m[2] } : { tool: s, spec: "" };
}

/** Toglie il suffisso `:*` (che nei permessi significa «e tutto ciò che comincia così»). */
function radice(spec) {
  return spec.endsWith(":*") ? spec.slice(0, -2) : spec;
}

/**
 * Un permesso è NEUTRALIZZATO se un divieto lo copre già: il deny vince sempre, quindi quel permesso
 * non concede nulla. Serve per non gridare al lupo su configurazione morta — e per non far togliere
 * a Nicola una riga credendo che stia aprendo una porta che in realtà è già murata.
 * Confronto per prefisso, che è la semantica vera di `:*`, con il confine a fine parola: `git push`
 * copre `git push origin main` ma non deve coprire un ipotetico `git pushx`.
 */
export function neutralizzato(voce, deny = []) {
  const a = scomponi(voce);
  const suo = radice(a.spec);
  return deny.some((d) => {
    const b = scomponi(d);
    if (b.tool !== a.tool) return false;
    const pref = radice(b.spec);
    if (!pref || pref === "*") return true; // il divieto copre l'intero strumento
    if (suo === pref) return true;
    return suo.startsWith(pref) && /[\s:]/.test(suo.charAt(pref.length));
  });
}

/**
 * Applica le regole a TUTTI i file insieme. È l'unica forma corretta: allow e deny si sommano fra
 * file e il deny vince, quindi né i permessi né i divieti si possono giudicare un file per volta.
 * Pura (riceve i file già letti), così il test la prova senza toccare il disco.
 *
 * Ritorna { violazioni, inerti }:
 *   · violazioni = la macchina PUÒ fare più di quanto dovrebbe (allow scoperto, o divieto assente);
 *   · inerti     = permesso largo scritto ma già murato da un divieto: da ripulire, non pericoloso.
 */
export function analizza(files = [], regole = REGOLE) {
  const denyUnione = files.flatMap((f) => f.deny || []).map(String);
  const violaz = [], inerti = [];
  for (const f of files) {
    for (const voce of f.allow || []) {
      for (const r of regole) {
        if (!r.vieta || !r.vieta.test(String(voce))) continue;
        const riga = { regola: r.id, voce: String(voce), perche: r.perche, file: f.file };
        if (neutralizzato(voce, denyUnione)) inerti.push({ ...riga, tipo: "allow-inerte" });
        else violaz.push({ ...riga, tipo: "allow-troppo-largo" });
      }
    }
  }
  for (const r of regole) {
    if (!r.deve_negare) continue;
    if (denyUnione.some((d) => r.deve_negare.test(d))) continue;
    violaz.push({ regola: r.id, tipo: "deny-mancante", voce: String(r.deve_negare), perche: r.perche, file: "(tutti)" });
  }
  return { violazioni: violaz, inerti };
}

/** Scorciatoia su un solo file — la usano i test per provare una regola alla volta. */
export function violazioni(allow = [], deny = [], regole = REGOLE) {
  return analizza([{ file: ".claude/settings.json", allow, deny }], regole).violazioni;
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

  const { violazioni: tutte, inerti } = analizza(files);

  if (JSON_MODE) {
    console.log(JSON.stringify({ esito: tutte.length ? "violazioni" : "ok", quando, files: files.map((f) => ({ file: f.file, allow: f.allow.length, deny: f.deny.length })), violazioni: tutte, inerti }, null, 2));
    process.exit(tutte.length ? 1 : 0);
  }

  console.log(`\n🔐 PERMESSI DI SESSIONE — ${quando}\n`);
  for (const f of files) {
    console.log(`  ${f.file}: ${f.allow.length} allow · ${f.deny.length} deny${f.errore ? ` · ⚠️ ${f.errore}` : ""}`);
  }
  console.log(`  (allow e deny dei due file si sommano, e il deny vince: il controllo li guarda insieme)`);

  if (tutte.length) {
    console.log(`\n❌ ${tutte.length} violazione/i — la macchina può fare più di quanto dovrebbe:\n`);
    for (const v of tutte) {
      const cosa = v.tipo === "allow-troppo-largo" ? `permesso troppo largo: ${v.voce}` : `manca il divieto: ${v.voce}`;
      console.log(`  • [${v.regola}] ${cosa}   (${v.file})`);
      console.log(`      perché: ${v.perche}`);
    }
  }

  if (inerti.length) {
    // Non sono violazioni: un divieto le copre già. Le mostro perché una riga che sembra concedere
    // e non concede è una bugia nel file — ma toglierle non cambia cosa la macchina può fare.
    console.log(`\n🪦 ${inerti.length} permesso/i largo/i ma GIÀ MURATO da un divieto (da ripulire, non pericolosi):`);
    for (const v of inerti) console.log(`  • ${v.voce}   (${v.file}) — coperto da un deny: non concede nulla`);
  }

  if (!tutte.length) {
    console.log(`\n✅ Permessi entro le regole d'oro (${REGOLE.length} regole controllate).`);
    process.exit(0);
  }
  console.log(`\n→ Le correzioni le fa NICOLA: .claude/settings.json è negato in Edit/Write alla macchina, apposta.`);
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
