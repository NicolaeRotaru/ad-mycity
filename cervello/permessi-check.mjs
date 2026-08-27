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
import { strumentiSospetti } from "./permessi-strumenti.mjs";

const JSON_MODE = process.argv.includes("--json");
const FILES = [".claude/settings.json", ".claude/settings.local.json"];

// ─────────────────────────────────────────────────────────────────────────────
// LE REGOLE D'ORO — ognuna cita la fonte, così non sono opinioni di questo script.
// `vieta` matcha la voce di allow; `deve_negare` chiede che una voce sia in deny.
export const REGOLE = [
  {
    id: "no-jolly-su-cartella-scrivibile",
    perche:
      "AR-206: un permesso con il jolly su una cartella che la macchina stessa può SCRIVERE non è un " +
      "permesso su un elenco di programmi — è un permesso su «qualunque programma io decida di " +
      "scrivere lì dentro». I freni vivono dentro i singoli script (consenso, pausa, allowlist): con " +
      "il jolly si arriva al risultato senza passare dallo script che contiene il freno. È lo stesso " +
      "difetto di AR-272 visto dall'altro lato — là il cancello mancava su un'uscita, qui si può " +
      "girargli intorno. Il permesso va scritto come elenco esplicito degli script ammessi.",
    // L'asterisco dev'essere nel PERCORSO, non negli argomenti.
    //   ❌ Bash(node cervello/*.mjs:*)      → «qualunque file .mjs io scriva lì dentro»
    //   ✅ Bash(node cervello/auto-fix.mjs:*) → UN programma preciso, argomenti liberi
    // La prima versione di questa regola non distingueva i due casi e bocciava anche i permessi
    // sicuri. Un cancello che boccia ciò che va bene viene disattivato entro la settimana — e allora
    // non protegge più nemmeno dal caso vero. Il `*` va cercato PRIMA dei due punti che separano il
    // comando dai suoi argomenti.
    vieta: /^Bash\((?:node|bash|sh|python3?)\s+[^):]*\*[^):]*(?::|\))/,
  },
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

// ─────────────────────────────────────────────────────────────────────────────
// STRUMENTI COLLEGATI (MCP) GIUSTIFICATI — AR-273.
// ─────────────────────────────────────────────────────────────────────────────
// Uno strumento che SCRIVE su un sistema esterno non sta fra i permessi automatici, a meno che ci
// sia scritto perché. Il perché è obbligatorio: il cantiere ha già pagato che «un'esenzione senza
// motivo è un silenzio», e il silenzio è precisamente ciò che ha lasciato passare `execute_sql`.
//
// Chi aggiunge una voce qui dichiara cosa può rompere. Chi non la dichiara, la vede in rosso a ogni
// giro finché non decide — che è l'unico modo perché la decisione avvenga.
export const STRUMENTI_GIUSTIFICATI = {
  "mcp__github__create_pull_request":
    "aprire una PR è 🟡 per CLAUDE.md (si prepara, non si mergia): scrive su un ramo, mai su main, e il merge resta di Nicola.",
  "mcp__github__update_pull_request":
    "aggiorna titolo/corpo di una PR già aperta dalla macchina: non tocca il codice né il merge.",
  "mcp__github__add_issue_comment":
    "commentare una PR è il canale con cui la macchina riferisce a Nicola; non modifica codice né stato del repo.",
  "mcp__github__subscribe_pr_activity":
    "iscrive la sessione agli eventi di una PR: cambia solo cosa la macchina ASCOLTA, non cosa il repo contiene.",
  "mcp__github__unsubscribe_pr_activity":
    "disiscrive la sessione dagli eventi di una PR: stesso perimetro dell'iscrizione, in senso inverso.",
};

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

// ─────────────────────────────────────────────────────────────────────────────
// REGOLE SCRITTE IN UNA FORMA CHE IL CLI NON APPLICA PIÙ (AR-562).
// ─────────────────────────────────────────────────────────────────────────────
// Il difetto, visto da Nicola il 2026-08-10 sul Pannello: ogni analisi apriva con un muro di avvisi
// «Permission … rule: Write(x) is not matched by file permission checks — only Edit(path) rules are».
// Non era un capriccio del Pannello: i controlli sui permessi dei FILE guardano solo `Edit(path)`,
// e `Edit` copre da solo tutti gli strumenti che modificano file. Una riga `Write(path)` non è più
// una regola: è testo che il CLI legge, non applica, e su cui avvisa a ogni avvio.
//
// PROVATO A MANO, non dedotto (2026-08-10, claude 2.1.226): un settings finto con
// `Write(a/**)`, `MultiEdit(b/**)`, `NotebookEdit(c/**)`, `Edit(d/**)`, `Read(e/**)` produce un
// avviso per le prime TRE e nessuno per `Edit`/`Read`. L'avviso esce su stderr, non su stdout.
//
// PERCHÉ È UN GUARDIANO E NON UN DETTAGLIO ESTETICO: un DIVIETO scritto così non vieta niente.
// `Write(**/.env)` fra i deny sembra murare le chiavi e non le mura — chi legge il file crede di
// essere protetto e non lo è. Qui quel caso diventa una violazione vera, a meno che esista il
// gemello `Edit(stesso percorso)` che la difesa la fa davvero (è il caso di oggi: la protezione
// c'è, le righe `Write` sono solo il rumore che Nicola vedeva).
export const TOOL_FILE_MORTI = new Set(["Write", "MultiEdit", "NotebookEdit"]);

const PERCHE_FORMA_MORTA =
  "AR-562: i controlli sui permessi dei file leggono solo `Edit(percorso)` — e `Edit` copre già " +
  "tutti gli strumenti che modificano file. Una riga `Write(...)`/`MultiEdit(...)`/`NotebookEdit(...)` " +
  "non viene applicata: il CLI la salta e avvisa a ogni avvio, e quell'avviso finisce sotto gli occhi " +
  "di Nicola. Va riscritta come `Edit(stesso percorso)`.";

/** Una voce è in forma morta se nomina uno strumento-file non più applicato E ha un percorso. */
export function formaMorta(voce) {
  const { tool, spec } = scomponi(voce);
  return spec !== "" && TOOL_FILE_MORTI.has(tool);
}

/** C'è già `Edit(stesso percorso)`? Allora la difesa esiste davvero e la riga morta è solo rumore. */
export function haGemelloEdit(voce, regole = []) {
  const a = scomponi(voce);
  return regole.some((d) => {
    const b = scomponi(d);
    return b.tool === "Edit" && b.spec === a.spec;
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
export function analizza(files = [], regole = REGOLE, giustificati = STRUMENTI_GIUSTIFICATI) {
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

  // AR-562 — le righe scritte in una forma che il CLI non applica più. Un DIVIETO in forma morta
  // senza il gemello `Edit(...)` è una difesa che non difende: violazione. Con il gemello è solo
  // rumore da ripulire — ma va comunque detto, perché è l'avviso che Nicola si vede a ogni analisi.
  for (const f of files) {
    for (const [dove, voci] of [["deny", f.deny || []], ["allow", f.allow || []]]) {
      for (const voce of voci) {
        if (!formaMorta(voce)) continue;
        const { spec } = scomponi(voce);
        const riga = { regola: "forma-file-non-applicata", voce: String(voce), file: f.file, perche: PERCHE_FORMA_MORTA };
        if (dove === "deny" && !haGemelloEdit(voce, denyUnione)) {
          violaz.push({ ...riga, tipo: "deny-che-non-difende", perche: `${PERCHE_FORMA_MORTA} Qui manca anche il gemello \`Edit(${spec})\`: questo divieto oggi non ferma niente.` });
        } else {
          inerti.push({ ...riga, tipo: dove === "deny" ? "deny-in-forma-morta" : "allow-in-forma-morta" });
        }
      }
    }
  }

  // AR-273 — gli STRUMENTI COLLEGATI. Non passano dalle regex qui sopra apposta: quelle sono un
  // elenco scritto a mano che cresce solo dopo un incidente, ed è la causa radice del difetto. Qui
  // la voce si classifica da sé (permessi-strumenti.mjs) e ciò che non si sa classificare è una
  // violazione — così uno strumento di forma nuova non entra in silenzio.
  for (const f of files) {
    for (const s of strumentiSospetti(f.allow || [], giustificati)) {
      if (neutralizzato(s.voce, denyUnione)) {
        inerti.push({ regola: "strumenti-di-scrittura-non-automatici", voce: s.voce, perche: s.motivo, file: f.file, tipo: "allow-inerte" });
        continue;
      }
      violaz.push({
        regola: "strumenti-di-scrittura-non-automatici",
        tipo: s.tipo === "sconosciuto" ? "strumento-non-classificato" : "strumento-di-scrittura",
        voce: s.voce,
        perche:
          `AR-273: ${s.motivo}. Uno strumento che scrive su un sistema esterno non sta fra i permessi ` +
          `concessi senza chiedere. Se serve davvero, va giustificato per iscritto in ` +
          `STRUMENTI_GIUSTIFICATI (permessi-check.mjs) — o tolto da .claude/settings.json, che è di Nicola.`,
        file: f.file,
      });
    }
  }
  return { violazioni: violaz, inerti };
}

/** Scorciatoia su un solo file — la usano i test per provare una regola alla volta. */
export function violazioni(allow = [], deny = [], regole = REGOLE, giustificati = STRUMENTI_GIUSTIFICATI) {
  return analizza([{ file: ".claude/settings.json", allow, deny }], regole, giustificati).violazioni;
}

function main() {
  const quando = nowPiacenza();
  const files = leggiSettings();
  if (!files.length) {
    const msg = "nessun .claude/settings*.json trovato: permessi non verificabili.";
    if (JSON_MODE) console.log(JSON.stringify({ esito: "cieco", quando, messaggio: msg }, null, 2));
    else console.error(`\n🔐 PERMESSI — ${quando}\n\n⚪ ${msg}`);
    // AR-859 — il caso piu' netto di tutti: il JSON qui sopra dichiara esito "cieco" e il codice
    // d'uscita diceva 1, cioe' «ho guardato e ho trovato violazioni». Si contraddiceva da solo, in
    // due righe. 2 = NON HO POTUTO MISURARE.
    process.exit(2);
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
      const ETICHETTA = {
        "allow-troppo-largo": "permesso troppo largo",
        "deny-mancante": "manca il divieto",
        "strumento-di-scrittura": "strumento che SCRIVE, concesso senza chiedere e senza un perché",
        "strumento-non-classificato": "strumento di forma nuova, mai dichiarato",
        "deny-che-non-difende": "divieto scritto in una forma che il CLI non applica (non protegge nulla)",
      };
      const cosa = `${ETICHETTA[v.tipo] || v.tipo}: ${v.voce}`;
      console.log(`  • [${v.regola}] ${cosa}   (${v.file})`);
      console.log(`      perché: ${v.perche}`);
    }
  }

  if (inerti.length) {
    // Non sono violazioni: un divieto le copre già. Le mostro perché una riga che sembra concedere
    // e non concede è una bugia nel file — ma toglierle non cambia cosa la macchina può fare.
    console.log(`\n🪦 ${inerti.length} riga/righe scritta/e ma senza effetto (da ripulire, non pericolose):`);
    for (const v of inerti) {
      const { spec } = scomponi(v.voce);
      const motivo =
        v.tipo === "deny-in-forma-morta" || v.tipo === "allow-in-forma-morta"
          ? `forma non più applicata dal CLI → riscrivila \`Edit(${spec})\`. È questa riga che stampa l'avviso a ogni avvio.`
          : "coperto da un deny: non concede nulla";
      console.log(`  • ${v.voce}   (${v.file}) — ${motivo}`);
    }
  }

  if (!tutte.length) {
    console.log(`\n✅ Permessi entro le regole d'oro (${REGOLE.length} regole controllate).`);
    process.exit(0);
  }
  console.log(`\n→ Le correzioni le fa NICOLA: .claude/settings.json è negato in Edit/Write alla macchina, apposta.`);
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
