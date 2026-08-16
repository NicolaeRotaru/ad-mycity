// Collega il repo del marketplace (NicolaeRotaru/mycity) a QUESTA macchina/AD/pannello,
// così l'AD può LEGGERE e ANALIZZARE il codice vero del sito (radiografia, audit-design, tech, qa).
//
// 🟢 Azione reversibile e in SOLA LETTURA sul marketplace: scarica/aggiorna una COPIA locale.
//    Non tocca mai il repo del marketplace su GitHub, non fa push, non deploya.
//
// Uso:
//   node cervello/collega-marketplace.mjs            -> clona o aggiorna la copia locale
//   node cervello/collega-marketplace.mjs --status   -> dice solo dov'è collegato (senza scaricare)
//
// Configurazione (env, tutte opzionali):
//   MARKETPLACE_GIT_REPO  owner/repo da clonare         (default NicolaeRotaru/mycity)
//   MARKETPLACE_BRANCH    ramo da seguire               (default main)
//   MARKETPLACE_REPO      percorso locale della copia   (default <ad-repo>/marketplace)
//   MARKETPLACE_GIT_TOKEN PAT GitHub (solo se il repo diventa privato; per ora è pubblico)
//                         in mancanza usa GIT_TOKEN / GIT_PUSH_TOKEN se presenti.
//
// ─────────────────────────────────────────────────────────────────────────────
// AR-143 — IL TOKEN NON TOCCA PIÙ IL DISCO.
//
// Prima questo file costruiva `https://x-access-token:<PAT>@github.com/…` e lo passava sia a
// `git clone` sia a `git remote set-url`: il segreto restava scritto in `marketplace/.git/config`,
// leggibile da chiunque potesse leggere un file di quella cartella — mentre il `.env`, che è il
// posto giusto dove tenerlo, è protetto in lettura. La copia locale era la porta di servizio.
//
// Tre cose sono cambiate, e la terza è quella che conta:
//   ① l'indirizzo salvato è quello PUBBLICO, sempre;
//   ② le credenziali, quando servono, arrivano al singolo comando dall'ambiente (mai dagli
//      argomenti, dove `ps` le mostrerebbe, mai dal file, dove resterebbero);
//   ③ dopo OGNI operazione si guarda il file di configurazione vero: se un segreto è comparso lì
//      dentro — da questa strada o da un'altra, anche futura — si toglie e si avvisa. È il freno
//      messo sul DATO invece che dentro il comando.
// La decisione (quali comandi git lanciare) vive in `cervello/credenziali-git.mjs`, pura, così un
// test la esegue senza rete.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  AD_ROOT,
  DEFAULT_CHECKOUT,
  MARKETPLACE_BRANCH,
  MARKETPLACE_GIT_REPO,
  resolveMarketplaceRepo,
} from "./marketplace-repo.mjs";
import { gitEsegui } from "./git-github.mjs";
import {
  ENV_TOKEN,
  configRipulito,
  credenzialiInConfig,
  pianoDiCollegamento,
  urlPubblico,
} from "./credenziali-git.mjs";

const TARGET = process.env.MARKETPLACE_REPO || DEFAULT_CHECKOUT;
const TOKEN =
  process.env.MARKETPLACE_GIT_TOKEN ||
  process.env.GIT_TOKEN ||
  process.env.GIT_PUSH_TOKEN ||
  "";

/** L'esecutore unico di git: ha già il tetto sull'uscita (AR-327) e sa ricevere l'ambiente. */
function git(args, cwd, extraEnv = {}) {
  return gitEsegui(args, cwd, extraEnv);
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-143 (③) — il controllo sul dato: il file di configurazione non deve contenere segreti.
// Il ripristino della copia locale è nostro (🟢); la ROTAZIONE del token è 🔴 e resta di Nicola.
export function bonificaConfig(target) {
  const p = join(target, ".git", "config");
  if (!existsSync(p)) return { pulito: true, trovate: [] };
  let testo;
  try {
    testo = readFileSync(p, "utf8");
  } catch {
    return { pulito: false, trovate: [{ riga: 0, chiave: "(config non leggibile)", motivo: "non ho potuto controllare" }] };
  }
  const trovate = credenzialiInConfig(testo);
  if (!trovate.length) return { pulito: true, trovate: [] };
  try {
    writeFileSync(p, configRipulito(testo));
  } catch {
    /* se non riesco a riscriverlo lo dico comunque qui sotto */
  }
  return { pulito: false, trovate };
}

function avvisaSeSporco(target) {
  const { pulito, trovate } = bonificaConfig(target);
  if (pulito) return;
  console.error("");
  console.error("🔴 UN SEGRETO ERA SCRITTO IN CHIARO nella configurazione della copia locale (AR-143).");
  for (const t of trovate) console.error(`   riga ${t.riga} · ${t.chiave} — ${t.motivo}`);
  console.error("   L'ho tolto dal file. Il valore NON viene stampato qui, apposta.");
  console.error("   → Va comunque RUOTATO su GitHub: un segreto finito su disco si considera visto. Quello lo fai tu.");
}

function status() {
  const p = resolveMarketplaceRepo();
  const linked = existsSync(join(p, ".git")) || existsSync(join(p, "package.json"));
  console.log("Collegamento al marketplace (NicolaeRotaru/mycity):");
  console.log(`  repo sorgente:   ${MARKETPLACE_GIT_REPO} (ramo ${MARKETPLACE_BRANCH})`);
  console.log(`  copia locale:    ${p}`);
  console.log(`  stato:           ${linked ? "COLLEGATO ✅" : "NON collegato ❌"}`);
  if (linked) {
    try {
      const head = git(["rev-parse", "--short", "HEAD"], p);
      const last = git(["log", "-1", "--format=%cd · %s", "--date=short"], p);
      console.log(`  ultimo commit:   ${head} — ${last}`);
    } catch {
      /* copia presente ma non interrogabile: ignoriamo */
    }
    avvisaSeSporco(p); // anche il solo --status controlla: il segreto può essere arrivato da altrove
  } else {
    console.log("\n  → per collegarlo:  node cervello/collega-marketplace.mjs");
  }
  console.log(
    `\n  Suggerimento: esporta  MARKETPLACE_REPO="${p}"  così i workflow lo trovano sempre.`
  );
}

function link() {
  console.log(`Collego ${MARKETPLACE_GIT_REPO} (ramo ${MARKETPLACE_BRANCH}) → ${TARGET}`);
  try {
    git(["--version"]);
  } catch {
    console.error("ERRORE: git non è installato su questa macchina.");
    process.exit(1);
  }

  const esiste = existsSync(join(TARGET, ".git"));
  if (!esiste) mkdirSync(TARGET, { recursive: true });
  else console.log("  copia già presente: aggiorno alla versione più recente…");
  void dirname; // il percorso lo crea per intero mkdirSync: niente cartella padre a metà

  // AR-143 — la sequenza NON contiene il segreto: `git init` + remote pulito + fetch autenticato
  // con `-c` (che su un comando normale non viene salvato) invece di `git clone <url col token>`.
  const passi = pianoDiCollegamento({
    repo: MARKETPLACE_GIT_REPO,
    branch: MARKETPLACE_BRANCH,
    esiste,
    conToken: Boolean(TOKEN),
  });
  // Il primo `remote set-url` fallisce se il remote non esiste ancora: si aggiunge e si riprova.
  try {
    for (const passo of passi) {
      const env = passo.autenticato && TOKEN ? { [ENV_TOKEN]: TOKEN } : {};
      try {
        git(passo.argv, TARGET, env);
      } catch (e) {
        if (passo.argv[0] === "remote") git(["remote", "add", "origin", urlPubblico(MARKETPLACE_GIT_REPO)], TARGET);
        else throw e;
      }
    }
    console.log(esiste ? "  aggiornata ✅" : "  clonata ✅");
  } catch (e) {
    console.error(`  ERRORE durante il collegamento: ${sanitize(e)}`);
    console.error("  (repo inesistente, rete assente o token mancante per repo privato?)");
    avvisaSeSporco(TARGET); // anche una corsa fallita a metà non deve lasciare segreti sul disco
    process.exit(1);
  }
  avvisaSeSporco(TARGET);
  console.log("");
  status();
}

// Non lasciar trapelare il token in eventuali messaggi d'errore di git.
function sanitize(err) {
  const msg = (err && (err.stderr || err.message)) || String(err);
  return TOKEN ? msg.split(TOKEN).join("***") : msg;
}

const arg = process.argv[2];
if (import.meta.url === `file://${process.argv[1]}`) {
  if (arg === "--status" || arg === "status") status();
  else link();
}

// Evita warning lint su import non usato in alcuni percorsi.
void AD_ROOT;
