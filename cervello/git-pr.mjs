#!/usr/bin/env node
// Apre (o riusa) una Pull Request su GitHub — MAI merge. Accoda opzionalmente in AZIONI-IN-ATTESA.
//
// Uso:
//   node cervello/git-pr.mjs --repo ad-mycity --base main --branch cursor/fix-x --title "Fix X"
//   node cervello/git-pr.mjs --repo mycity --base main --title "Fix carrello" --accoda
//   node cervello/git-pr.mjs --repo ad-mycity --base main --branch cursor/giro-2026-07-01 --dry-run
//
// Env: GIT_PUSH_TOKEN, GIT_REPO (ad-mycity) · MARKETPLACE_GIT_TOKEN, MARKETPLACE_REPO (mycity)
//      GIT_AUTHOR_EMAIL, GIT_AUTHOR_NAME (commit)

import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { prendiLucchettoOEsci } from "./lucchetto-git.mjs";
import {
  AD_ROOT,
  findOpenPrForBranch,
  gitAuthUrl,
  gitEsegui,
  githubRequest,
  nowPiacenza,
  resolveRepoConfig,
  stampSegnale,
} from "./git-github.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";
import {
  RISCRITTI_DAL_WORKER,
  CORPO_PR_CONDIVISO,
  REFERTI_RIGENERATI,
} from "./file-della-macchina.mjs";

const AZIONI_PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md");
const TECH_DIR = join(AD_ROOT, "consegne/tech");
const GENERIC_BODY_RE = /^PR aperta dall'AD MyCity/i;
const MIN_BODY_LEN = 80;

/** Modificati dal worker a ogni giro — non vanno MAI nel commit chore di una PR pannello (conflitti
 * ricorrenti). L'elenco sta in `file-della-macchina.mjs`: dal 30/7 lo legge anche `ramo-pulito.mjs`,
 * e due copie della stessa lista sarebbero divergute al primo aggiornamento. */
const WORKER_AUTO_PATHS = new Set(RISCRITTI_DAL_WORKER);

/** Descrizione PR condivisa: SOLO come output di scrittura (writeConsegna), MAI come input/fallback di lettura.
 * Il file viene corrotto dal rebase: l'auto-risoluzione tiene la versione della base, che per un file
 * condiviso fra tutte le PR è la descrizione della PR PRECEDENTE (L-2026-0718-273). Il corpo vero va
 * su GitHub via API, non da qui. */
const SHARED_PR_BODY = CORPO_PR_CONDIVISO;

/**
 * In rebase, questi file si risolvono da soli tenendo **la versione della base** (il corpo PR vero
 * va su GitHub via API; i referti li rigenera il loro guardiano).
 *
 * AR-449 — QUALE LATO, e perché la riga qui sotto è cambiata. Questo commento ha sempre detto
 * «teniamo la base», e il codice faceva `git checkout --theirs`. Provato su un repo finto: durante un
 * rebase `--theirs` è **la versione del RAMO**, `--ours` è quella della base. Cioè per settimane
 * l'auto-risoluzione ha tenuto esattamente il lato che questo commento promette di scartare: la
 * copia vecchia che il ramo si portava dietro tornava dentro la PR, e al merge riscriveva il referto
 * più nuovo di `main`. È la famiglia delle ventuno correzioni, entrata dalla porta di servizio.
 */
const AUTO_RESOLVE_REBASE_PATHS = new Set([
  SHARED_PR_BODY,
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-miglioramento.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/sentinella-dati.json",
  "cervello/routing.json",
  ...REFERTI_RIGENERATI,
]);

/**
 * I file che la macchina può avere sporchi mentre si apre una PR, e che il rebase non deve
 * scavalcare: sono gli stessi che il commit chore tiene fuori apposta. Vengono messi da parte prima
 * del rebase e rimessi identici dopo (vedi `parcheggiaSporco`).
 */
const PARCHEGGIABILI = new Set([...RISCRITTI_DAL_WORKER, SHARED_PR_BODY]);

function pathFromPorcelainLine(line) {
  let path = line.substring(2).replace(/^\s+/, "").trim();
  if (path.includes(" -> ")) path = path.split(" -> ").pop().trim();
  return path;
}

function pathsToStageFromPorcelain(porcelain) {
  /** @type {string[]} */
  const out = [];
  for (const line of porcelain.split("\n").filter(Boolean)) {
    const path = pathFromPorcelainLine(line);
    if (WORKER_AUTO_PATHS.has(path)) continue;
    if (path === SHARED_PR_BODY) continue;
    out.push(path);
  }
  return out;
}

function usage() {
  console.log(`Apri PR GitHub (senza merge).

Opzioni:
  --repo ad-mycity|mycity   Repo target (obbligatorio)
  --base RAMO               Base PR (default: main — ramo unico, vale anche per il vault)
  --branch RAMO             Head branch (default: branch git corrente nel cwd del repo)
  --title TESTO             Titolo PR (default: messaggio ultimo commit o branch)
  --body TESTO              Corpo PR (markdown, obbligatorio se non c'è file body)
  --body-file PERCORSO      Legge il corpo da file (es. consegne/tech/pr-ad-mycity-body.md)
  --message TESTO           Messaggio commit se ci sono modifiche non committate
  --accoda                  Aggiunge riga 🔴 in AZIONI-IN-ATTESA.md (merge da firmare)
  --no-push                 Non fa push (branch già su GitHub)
  --no-rebase               Non fa rebase su base prima del push (sconsigliato)
  --dry-run                 Mostra cosa farebbe, senza scrivere
  --help                    Questo aiuto`);
}

function parseArgs(argv) {
  /** @type {Record<string, string | boolean>} */
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      o.help = true;
      continue;
    }
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        o[key] = next;
        i++;
      } else {
        o[key] = true;
      }
    }
  }
  return o;
}

// AR-327, seconda porta. Qui c'era una copia dell'esecuzione di git, senza il tetto di `maxBuffer`:
// un rebase o un diff sopra il megabyte faceva morire con ENOBUFS proprio lo strumento che pubblica
// il lavoro, e proprio quando il lavoro è grosso. Non è stato allineato il tetto — è stata tolta la
// copia: adesso esiste UN solo posto in cui il cervello esegue git, e una porta nuova non può
// nascere senza il tetto perché non c'è più niente da ricopiare.
const git = gitEsegui;

function gitOrNull(args, cwd) {
  try {
    return git(args, cwd);
  } catch {
    return null;
  }
}

function sanitize(err, token) {
  const msg = (err?.stderr || err?.message || String(err)).toString();
  return token ? msg.split(token).join("***") : msg;
}

function nextAzioneNumber(content) {
  let max = 0;
  for (const line of content.split("\n")) {
    const m = line.match(/^\|\s*(\d+)\s*\|/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

function accodaAzione({ prUrl, prNumber, cfg, base, branch, title, dryRun }) {
  if (!existsAzioni()) {
    console.warn("⚠️  AZIONI-IN-ATTESA.md non trovato — salto accoda.");
    return;
  }
  const content = readFileSync(AZIONI_PATH, "utf8");
  const num = nextAzioneNumber(content);
  const when = nowPiacenza();
  const repoLabel = cfg.key === "mycity" ? "mycity" : "ad-mycity";
  const row =
    `| ${num} | ${when} | @tech | Merge PR #${prNumber} ${repoLabel} → ${base} | 🔴 | ${prUrl} | github | in attesa | ` +
    `Il codice in anteprima va online su ${repoLabel === "mycity" ? "Render (sito)" : "Vercel (Pannello)"} dopo il merge. | ` +
    `Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |\n`;

  if (dryRun) {
    console.log("[DRY-RUN] Riga AZIONI-IN-ATTESA:\n" + row);
    return;
  }

  const marker = "<!-- I senior aggiungono righe qui sotto.";
  const idx = content.indexOf(marker);
  if (idx >= 0) {
    writeFileSync(AZIONI_PATH, content.slice(0, idx) + row + content.slice(idx), "utf8");
  } else {
    appendFileSync(AZIONI_PATH, row, "utf8");
  }
  console.log(`✓ Accodata azione #${num} in AZIONI-IN-ATTESA.md (merge 🔴)`);
}

function existsAzioni() {
  try {
    readFileSync(AZIONI_PATH, "utf8");
    return true;
  } catch {
    return false;
  }
}

function branchSlug(branch) {
  return branch.replace(/[/\\]+/g, "-");
}

function isGenericBody(body) {
  const t = String(body || "").trim();
  return !t || t.length < MIN_BODY_LEN || GENERIC_BODY_RE.test(t);
}

/** Genera un body automatico dai commit del branch (formato standard ## Cosa cambia / ## Come provare).
 * Non cerca mai il file condiviso pr-ad-mycity-body.md: viene corrotto dal rebase. */
function buildAutoBody(cfg, branch) {
  const commits = gitOrNull(
    ["log", "--oneline", "--no-merges", `origin/main..refs/heads/${branch}`],
    cfg.cwd
  ) || gitOrNull(
    ["log", "--oneline", "--no-merges", "-10", `refs/heads/${branch}`],
    cfg.cwd
  ) || "";
  const righe = commits.split("\n").filter(Boolean).map((l) => `- ${l.replace(/^[0-9a-f]+ /, "")}`);
  const lista = righe.length ? righe.join("\n") : `- ${branch}`;
  return `## Cosa cambia\n${lista}\n\n## Come provare\nVerifica su Vercel Preview dopo il merge.`;
}

/** @param {Record<string, string | boolean>} args @param {{ key: string }} cfg @param {string} branch */
function resolveBody(args, cfg, branch) {
  if (args["body-file"]) {
    const p = String(args["body-file"]);
    const abs = p.startsWith("/") ? p : join(AD_ROOT, p);
    return readFileSync(abs, "utf8").trim();
  }
  if (args.body) return String(args.body).trim();

  // Cerca SOLO file per-branch (non il file condiviso pr-ad-mycity-body.md —
  // viene sovrascritto dal rebase con --theirs e prende la descrizione della PR precedente).
  const slug = branchSlug(branch);
  const candidates = [
    join(TECH_DIR, `pr-${cfg.key}-${slug}-body.md`),
    join(TECH_DIR, `pr-body-${slug}.md`),
  ];
  for (const file of candidates) {
    if (existsSync(file)) return readFileSync(file, "utf8").trim();
  }
  return "";
}

function requireBody(body, cfg, branch) {
  if (!isGenericBody(body)) return body;
  // Nessun body esplicito: genera automaticamente dai commit.
  const auto = buildAutoBody(cfg, branch);
  console.log(`ℹ️  Nessun body esplicito — generato automaticamente dai commit del branch.`);
  return auto;
}

/** @param {import('./git-github.mjs').RepoConfig} cfg @param {string} base */
function fetchBase(cfg, base) {
  const url = gitAuthUrl(cfg);
  git(["fetch", url, base], cfg.cwd);
  return git(["rev-parse", "FETCH_HEAD"], cfg.cwd);
}

/** @param {import('./git-github.mjs').RepoConfig} cfg @param {string} baseRef @param {string} branch */
function countCommitsAhead(cfg, baseRef, branch) {
  return gitOrNull(["rev-list", "--count", `${baseRef}..refs/heads/${branch}`], cfg.cwd) || "0";
}

/** @param {import('./git-github.mjs').RepoConfig} cfg @param {string} baseRef @param {string} branch */
function mergeTreeConflictPaths(cfg, baseRef, branch) {
  const mb = git(["merge-base", baseRef, branch], cfg.cwd);
  const out = git(["merge-tree", mb, baseRef, branch], cfg.cwd);
  /** @type {string[]} */
  const paths = [];
  const lines = out.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] !== "changed in both") continue;
    for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
      const pm = lines[j].match(/^\s+(?:base|our|their)\s+\d+\s+[0-9a-f]+\s+(.+)$/);
      if (pm) {
        paths.push(pm[1].trim());
        break;
      }
    }
  }
  return [...new Set(paths)];
}

/**
 * I file in conflitto durante un rebase.
 *
 * AR-341 — passa dalla porta di `percorsi-git.mjs`. Prima chiedeva l'elenco senza `-z`: un file in
 * conflitto con l'accento nel nome tornava citato e in ottali, quindi non corrispondeva a nessuno
 * dei percorsi auto-risolvibili. Il comportamento era prudente (l'auto-risoluzione rinunciava invece
 * di toccare il file sbagliato) e nessuno dei cinque percorsi auto-risolvibili ha un accento: il
 * difetto era latente. Chiuso lo stesso, perché è la stessa porta di AR-339 e AR-340 — e una porta
 * vale solo se ci passano tutti.
 */
function unmergedPaths(cfg) {
  try {
    return percorsiDaGit(["diff", "--name-only", "--diff-filter=U"], { cwd: cfg.cwd });
  } catch {
    return [];
  }
}

function isRebaseInProgress(cfg) {
  return existsSync(join(cfg.cwd, ".git", "rebase-merge")) || existsSync(join(cfg.cwd, ".git", "rebase-apply"));
}

/**
 * Risolve i conflitti dei file che la macchina rigenera tenendo la versione della BASE
 * (`--ours`, provato: in rebase `--ours` è la base e `--theirs` è il ramo).
 *
 * E LO DICE, riga per riga. Un'auto-risoluzione muta è comoda e sbagliata: il giorno che scarta una
 * copia che serviva, nessuno lo sa. Qui la scelta si legge nel log del comando che l'ha fatta.
 *
 * @returns {boolean} true se ha risolto tutto
 */
function tryAutoResolveRebaseConflicts(cfg) {
  const pending = unmergedPaths(cfg);
  if (!pending.length) return false;
  if (!pending.every((p) => AUTO_RESOLVE_REBASE_PATHS.has(p))) return false;
  for (const p of pending) {
    git(["checkout", "--ours", "--", p], cfg.cwd);
    git(["add", "--", p], cfg.cwd);
    console.log(`   ↩︎ ${p}: tengo la versione della base — la copia del ramo è il referto di quando il ramo è nato, lo rigenera il suo guardiano.`);
  }
  return true;
}

/**
 * Un rebase dentro uno script non ha un editor, e non deve volerne uno (AR-450). Senza questo, un
 * `rebase --continue` che chiede di confermare il messaggio si apre in `vi`, con lo stdin chiuso:
 * fallisce, e prima il ripiego era `--skip`, cioè buttare via il commit del ramo per un editor
 * mancante. `GIT_TERMINAL_PROMPT=0` chiude l'altra porta della stessa famiglia: mai restare appesi
 * a una domanda che nessuno leggerà.
 */
const SENZA_EDITOR = { GIT_EDITOR: "true", GIT_SEQUENCE_EDITOR: "true", GIT_TERMINAL_PROMPT: "0" };

/** Il motivo che git ha dato, senza il token e senza il muro di hint. */
function motivoGit(err, token) {
  const righe = sanitize(err, token)
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => r && !r.startsWith("hint:"));
  return righe.slice(0, 2).join(" · ") || "(git non ha detto perché)";
}

/**
 * Le righe di `git status --porcelain` che FERMANO un rebase, divise in due: quelle che possiamo
 * mettere da parte da soli e quelle su cui decide chi lavora.
 *
 * Un file mai tracciato (`??`) non ferma niente: git lo lascia dov'è. Ciò che ferma è il tracciato
 * modificato — nell'indice o nell'albero, git rifiuta in entrambi i casi.
 *
 * Pura: la prova la esegue su ingressi finti, compresi quelli che nel repo non esistono.
 */
export function sporcoCheFermaIlRebase(porcelain, parcheggiabili = PARCHEGGIABILI) {
  /** @type {string[]} */ const parcheggia = [];
  /** @type {string[]} */ const altri = [];
  for (const line of String(porcelain || "").split("\n").filter(Boolean)) {
    const stato = line.slice(0, 2);
    if (stato === "??" || stato === "!!") continue;
    const path = pathFromPorcelainLine(line);
    (parcheggiabili.has(path) ? parcheggia : altri).push(path);
  }
  return { parcheggia, altri };
}

/**
 * Mette da parte il contenuto sporco dei file dichiarati (byte per byte) e riporta il tracciato a
 * HEAD, così il rebase può partire. Restituisce la funzione che li rimette come stavano.
 *
 * Perché a mano e non con `git stash`: lo stash va rimesso con un `pop` che, dopo un rebase che ha
 * toccato gli stessi file, conflitta — e ci ritroveremmo a risolvere un conflitto nato dal rimedio.
 * Questi file appartengono a `main` e il worker li riscrive al giro dopo: rimetterli identici è
 * l'unica cosa che si può promettere, ed è quella che serve.
 */
function parcheggiaSporco(cfg, percorsi) {
  const parcheggio = [];
  for (const p of percorsi) {
    // Solo ciò che esiste in HEAD: per un file che in HEAD non c'è, `checkout HEAD --` non ha niente
    // da ripristinare, e inventarsi un ripiego qui vorrebbe dire indovinare. Resta sporco, e se
    // ferma il rebase lo dirà il messaggio di git — che è la verità, non una supposizione.
    if (gitOrNull(["cat-file", "-e", `HEAD:${p}`], cfg.cwd) === null) continue;
    const abs = join(cfg.cwd, p);
    parcheggio.push({ p, abs, contenuto: existsSync(abs) ? readFileSync(abs) : null });
    git(["checkout", "HEAD", "--", p], cfg.cwd);
  }
  return () => {
    for (const { abs, contenuto } of parcheggio) {
      if (contenuto === null) continue;
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, contenuto);
    }
    return parcheggio.map((x) => x.p);
  };
}

/**
 * Rebase del branch feature su base aggiornata; auto-risolve i referti della macchina.
 * @param {import('./git-github.mjs').RepoConfig} cfg @param {string} base @param {string} branch
 */
function rebaseBranchOntoBase(cfg, base, branch) {
  return rebasaSuRiferimento(cfg, fetchBase(cfg, base), branch, base);
}

/**
 * Il remoto è solo la nostra stessa pubblicazione precedente (sicuro da sovrascrivere col lease), o
 * porta lavoro che non abbiamo (ci si ferma)?
 *
 * AR-451 — perché servono PIÙ candidati, non solo l'HEAD locale di adesso. Un ramo già pubblicato
 * come `shaRemoto` e poi ribasato di nuovo non ha più `shaRemoto` tra i suoi antenati: il rebase
 * riscrive l'hash di ogni commit che sposta, a contenuto invariato. Guardare solo l'HEAD locale
 * dopo il rebase di questa corsa scambia «l'ho pubblicato io stessa la volta scorsa» per «qualcun
 * altro ci ha lavorato». `candidati` porta anche l'HEAD di PRIMA del rebase (quello con cui questo
 * ramo esisteva un attimo fa): se il remoto è antenato di quello, è la nostra storia, non altrui.
 *
 * Pura sulla decisione: la lettura del remoto resta a chi chiama, qui c'è solo il confronto.
 */
export function remotoEDavveroVecchio(cfg, shaRemoto, candidati) {
  return candidati.some((sha) => sha && gitOrNull(["merge-base", "--is-ancestor", shaRemoto, sha], cfg.cwd) !== null);
}

/**
 * IL PUNTO CHE DECIDE quando il lease viene rifiutato: il remoto è nostro (si ripubblica) o è di un
 * altro (ci si ferma)?
 *
 * AR-461 — PERCHÉ QUESTO BLOCCO È USCITO DA `main()`. Il fix di AR-451 sta in una riga sola: fra i
 * candidati passati a `remotoEDavveroVecchio` ci va anche `rebaseInfo.preRebaseSha`, il ramo com'era
 * un attimo prima che questa corsa lo ribasasse. La prova di AR-451 esercitava benissimo
 * `remotoEDavveroVecchio` e `rebasaSuRiferimento` — ma non il punto che le chiama: togliendo
 * `rebaseInfo.preRebaseSha` da quella riga, la prova restava VERDE (misurato con non-vacuita.mjs).
 * Cioè il bug che è costato quattro PR ricreate in una notte poteva tornare senza che nessun rosso
 * lo dicesse.
 *
 * Finché la riga viveva dentro `main()` — 200 righe che parlano di argomenti, token e API di GitHub —
 * l'unico modo di provarla era cercarne il testo in un file, che in questa casa non è una prova.
 * Estratta qui, il cablaggio si guida su due repo veri in una cartella temporanea: `url` accetta un
 * percorso locale, quindi `ls-remote` e `fetch` funzionano davvero senza rete né token.
 *
 * NON decide il push: risponde alla domanda e basta. Chi chiama fa la mossa.
 *
 * @returns {{shaRemoto: string|null, shaLocale: string|null, remotoAntenato: boolean}}
 */
export function esitoLeaseRifiutato(cfg, url, branch, rebaseInfo = {}) {
  const remoto = gitOrNull(["ls-remote", url, `refs/heads/${branch}`], cfg.cwd);
  const shaRemoto = remoto ? remoto.split(/\s+/)[0] : null;
  const shaLocale = gitOrNull(["rev-parse", `refs/heads/${branch}`], cfg.cwd);
  let remotoAntenato = false;
  if (shaRemoto && shaLocale) {
    gitOrNull(["fetch", url, `refs/heads/${branch}`], cfg.cwd);
    remotoAntenato = remotoEDavveroVecchio(cfg, shaRemoto, [shaLocale, rebaseInfo.preRebaseSha]);
  }
  return { shaRemoto, shaLocale, remotoAntenato };
}

/**
 * Il rebase vero, su un riferimento già risolto.
 *
 * AR-449 · AR-445 — PERCHÉ È SEPARATO DA `rebaseBranchOntoBase`: quella chiama `fetchBase`, che vuole rete e
 * token, e un pezzo che si può provare solo con la rete accesa è un pezzo che nessuno prova. Questa
 * funzione si guida su due repo finti in una cartella temporanea, che è l'unico modo di vedere
 * davvero cosa fa git invece di ragionarci sopra.
 *
 * IL DIFETTO CHE CHIUDE, e come si presentava. Il 30/7 questo cancello ha fermato OGNI PR con
 * «Conflitti residui dopo rebase: AZIONI-IN-ATTESA.md, BACHECA.md, DECISIONI.md, salute.json…».
 * Due bugie in una riga: nessun rebase era avvenuto, e quelli non erano conflitti residui.
 *
 *   ① Sul VPS il worker tiene sporchi i suoi file (`routing.json`, i JSON di auto-coscienza), e il
 *      commit chore qui sopra li ESCLUDE apposta. Restano sporchi, e `git rebase` si rifiuta di
 *      partire: «cannot rebase: You have unstaged changes». Non è un conflitto, è un albero sporco.
 *   ② Il ripiego trattava quel rifiuto come un conflitto: entrava nel giro di auto-risoluzione,
 *      trovava che nessun rebase era in corso, **uscìva dal giro senza dire niente** e proseguiva
 *      come se il rebase fosse andato a buon fine.
 *   ③ A quel punto il controllo di cortesia con `merge-tree` confrontava il ramo con `main` dal
 *      vecchio antenato comune — cioè misurava la normale divergenza che il rebase avrebbe
 *      risolto — e la chiamava «conflitti residui».
 *
 * Il risultato era un cancello chiuso a chiave che dava la colpa a un conflitto inesistente: nessuna
 * PR pubblicabile dal VPS, e il vero motivo (un file sporco) mai nominato. Perciò adesso: lo sporco
 * dichiarato si mette da parte (①), un rebase che non parte è un errore col motivo di git (②), e
 * prima di credere a `merge-tree` si controlla che il ramo sia davvero finito sopra la base (③).
 */
export function rebasaSuRiferimento(cfg, baseRef, branch, base = baseRef) {
  const prev = gitOrNull(["rev-parse", "--abbrev-ref", "HEAD"], cfg.cwd) || "main";

  // ① LO SPORCO PRIMA DI TUTTO — anche prima del checkout del ramo, che con l'albero sporco può
  // fallire da solo. I file dichiarati vanno da parte; su tutto il resto decide chi lavora.
  const { parcheggia, altri } = sporcoCheFermaIlRebase(gitOrNull(["status", "--porcelain"], cfg.cwd));
  if (altri.length) {
    throw new Error(
      `il rebase non può partire con l'albero sporco: ${altri.join(", ")}. ` +
        `Committa quei file (o mettili da parte) e rilancia — non li tocco io.`
    );
  }
  let rimetti = null;
  if (parcheggia.length) {
    rimetti = parcheggiaSporco(cfg, parcheggia);
    console.log(
      `⏸️  Messi da parte ${parcheggia.length} file che la macchina stava riscrivendo (${parcheggia.join(", ")}): ` +
        `con l'albero sporco git rifiuta di iniziare il rebase. Li rimetto identici appena finito.`
    );
  }

  if (prev !== branch) git(["checkout", branch], cfg.cwd);
  // AR-451 — l'hash del ramo PRIMA di riscriverlo. Il rebase cambia l'identità di OGNI commit che
  // sposta (anche a contenuto invariato: l'hash include il genitore), quindi un ramo già pubblicato
  // e poi ribasato non ha più, nella sua storia nuova, l'hash con cui l'avevamo pubblicato — il lease
  // di default lo legge come "qualcun altro ci ha lavorato" anche quando l'unica cosa successa è
  // che NOI l'abbiamo ribasato di nuovo. Portare con sé questo hash è l'unico modo di riconoscere
  // dopo «quel commit remoto era già nostro» senza doverlo indovinare dal contenuto.
  const preRebaseSha = gitOrNull(["rev-parse", branch], cfg.cwd);
  try {
    try {
      git(["rebase", baseRef], cfg.cwd, SENZA_EDITOR);
    } catch (errRebase) {
      // ② UN REBASE CHE NON PARTE NON È UN CONFLITTO, e non si attraversa in silenzio.
      //
      // AR-450 — LA DOMANDA GIUSTA. La prima versione chiedeva «git ha lasciato una cartella di
      // rebase?». È la domanda sbagliata, e il 30/7 l'ha dimostrato un rosso che si vedeva solo in
      // CI: la cartella di stato è un dettaglio interno che cambia fra versioni di git (2.43 qui,
      // 2.54 sul runner), mentre la cosa che decide se c'è un conflitto è UNA SOLA — ci sono file
      // in conflitto da risolvere, sì o no? Se non ce ne sono, qualunque cosa dica la cartella,
      // questo non è un conflitto: è un comando che ha rifiutato, e si riporta il suo motivo.
      const daRisolvere = unmergedPaths(cfg);
      if (!daRisolvere.length) {
        const partito = isRebaseInProgress(cfg);
        if (partito) gitOrNull(["rebase", "--abort"], cfg.cwd);
        throw new Error(
          `${partito ? "il rebase si è fermato e non c'è niente da risolvere" : "il rebase non è nemmeno partito (niente da risolvere)"}: ` +
            motivoGit(errRebase, cfg.token)
        );
      }
      /* conflitto vero: prova auto-risoluzione fino a 8 step (commit multipli) */
      for (let step = 0; step < 8; step++) {
        if (!isRebaseInProgress(cfg)) break;
        if (!tryAutoResolveRebaseConflicts(cfg)) {
          const pending = unmergedPaths(cfg);
          git(["rebase", "--abort"], cfg.cwd, SENZA_EDITOR);
          throw new Error(
            `il rebase si è fermato su file che non decido io: ${pending.join(", ") || "(sconosciuto)"}. ` +
              `Portano contenuto vero (azioni in coda, decisioni): scegliere un lato da solo vorrebbe dire ` +
              `cancellare in silenzio il lavoro dell'altro. Committali su '${base}' da soli, oppure togli ` +
              `quei tocchi dal ramo, poi rilancia.`
          );
        }
        try {
          git(["rebase", "--continue"], cfg.cwd, SENZA_EDITOR);
        } catch (errContinua) {
          // NESSUN RIPIEGO CIECO (AR-276/AR-318, e qui la lezione si ripeteva). Il ripiego era
          // `--skip` a ogni fallimento: butta via il commit del ramo — cioè il lavoro — senza
          // guardare cosa ci fosse dentro e senza dirlo. Con una risoluzione automatica davanti,
          // `--skip` è giusto in UN caso solo: dopo aver tenuto la versione della base, quel commit
          // non ha più niente da portare. Quel caso lo si RICONOSCE, non si indovina — l'indice è
          // vuoto rispetto a HEAD — e negli altri si ferma tutto e si dice perché.
          //
          // ⚪ DEBITO DICHIARATO, non lavoro finito. Questo blocco è una cintura: con git 2.43
          // (quello di questo container) `rebase --continue` non fallisce MAI qui — provato su repo
          // finti sia con l'indice vuoto sia con un `pre-commit` che esce 1: git completa da solo e
          // il `catch` non viene toccato. Quindi le due strade qui dentro NON hanno una prova
          // comportamentale, e non ne ho aggiunta una finta: per coprirle serve una versione di git
          // che si fermi qui (il runner di CI ha la 2.54) o un doppio iniettabile al posto di `git()`.
          if (!isRebaseInProgress(cfg)) {
            throw new Error(`il rebase si è interrotto dopo la risoluzione automatica: ${motivoGit(errContinua, cfg.token)}`);
          }
          const nienteDaPortare = gitOrNull(["diff", "--cached", "--quiet"], cfg.cwd) !== null;
          if (!nienteDaPortare) {
            git(["rebase", "--abort"], cfg.cwd, SENZA_EDITOR);
            throw new Error(
              `il rebase non è andato avanti e quel commit ha ancora contenuto suo: ${motivoGit(errContinua, cfg.token)}. ` +
                `Non uso --skip: butterebbe via il lavoro del ramo.`
            );
          }
          console.log("   ⏭️  Dopo la risoluzione quel commit non portava più niente di suo: lo salto (era tutto referto della macchina).");
          git(["rebase", "--skip"], cfg.cwd, SENZA_EDITOR);
        }
      }
      if (isRebaseInProgress(cfg)) {
        git(["rebase", "--abort"], cfg.cwd, SENZA_EDITOR);
        throw new Error("rebase non completato dopo auto-risoluzione conflitti.");
      }
    }

    // ③ LA GARANZIA STRUTTURALE, prima di fidarsi di qualunque misura sopra. `merge-tree` confronta
    // dall'antenato comune: se il ramo non è finito sopra la base, la sua risposta parla di un'altra
    // domanda. Questo controllo è ciò che rende impossibile ripetere la bugia di stasera.
    if (gitOrNull(["merge-base", "--is-ancestor", baseRef, `refs/heads/${branch}`], cfg.cwd) === null) {
      throw new Error(
        `'${branch}' non è finito sopra la base dopo il rebase: non pubblico un ramo che non so dove sta.`
      );
    }
    const ahead = countCommitsAhead(cfg, baseRef, branch);
    const conflicts = mergeTreeConflictPaths(cfg, baseRef, branch);
    if (conflicts.length) {
      throw new Error(`conflitti residui dopo rebase: ${conflicts.join(", ")}`);
    }
    console.log(`✓ Rebase ${branch} su ${base} (${ahead} commit oltre la base)`);
    return { baseRef, ahead, preRebaseSha };
  } finally {
    // L'ordine conta: prima si torna dov'eravamo (con l'albero pulito il checkout non può fallire),
    // poi si rimette lo sporco. Così la copia di lavoro resta come l'abbiamo trovata.
    if (prev !== branch && gitOrNull(["rev-parse", "--abbrev-ref", "HEAD"], cfg.cwd) === branch) {
      git(["checkout", prev], cfg.cwd);
    }
    if (rimetti) {
      const rimessi = rimetti();
      if (rimessi.length) console.log(`▶️  Rimessi come stavano ${rimessi.length} file della macchina.`);
    }
  }
}

/** @param {import('./git-github.mjs').RepoConfig} cfg @param {number} prNumber */
async function waitForMergeable(cfg, prNumber, maxWaitMs = 12000) {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    const pr = await githubRequest(cfg.token, `/repos/${cfg.owner}/${cfg.repo}/pulls/${prNumber}`);
    if (pr.mergeable !== null) return pr;
    await new Promise((r) => setTimeout(r, 2000));
  }
  return githubRequest(cfg.token, `/repos/${cfg.owner}/${cfg.repo}/pulls/${prNumber}`);
}

/** @param {import('./git-github.mjs').RepoConfig} cfg @param {number} prNumber @param {string} body */
async function patchPullRequestBody(cfg, prNumber, body) {
  return githubRequest(cfg.token, `/repos/${cfg.owner}/${cfg.repo}/pulls/${prNumber}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
}

function writeConsegna(meta, dryRun) {
  const dir = join(AD_ROOT, "consegne/tech");
  const file = join(dir, `pr-${meta.cfg.key}-${meta.prNumber}.md`);
  const body = `# PR #${meta.prNumber} — ${meta.cfg.slug}

## 🔧 Dettagli tecnici
- **Repo:** ${meta.cfg.slug}
- **Branch:** \`${meta.branch}\` → \`${meta.base}\`
- **URL:** ${meta.prUrl}
- **Titolo:** ${meta.title}
- **Creato:** ${nowPiacenza()} (Europe/Rome)

## Merge
🔴 **Non mergeare da solo.** Nicola approva dal Pannello → \`node cervello/git-merge.mjs --repo ${meta.cfg.key} --pr ${meta.prNumber}\`

## Anteprima
${meta.cfg.key === "mycity" ? "Render genera l'anteprima automaticamente al push del branch (controlla i check GitHub)." : "Vercel Preview se configurato sul repo ad-mycity."}
`;
  if (dryRun) {
    console.log("[DRY-RUN] Consegna:\n" + body);
    return file;
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, body, "utf8");
  console.log(`✓ Consegna: ${file}`);
  return file;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  // AR-277 · AR-298 — IL LUCCHETTO SUL WORKTREE.
  // Da qui in giù si fa checkout, rebase, commit e push sulla stessa copia di lavoro che usano il
  // giro, il ritmo, il monitoraggio e il worker. Quei quattro prendono `flock` su
  // `.git/mycity-sync.lock`; questo strumento no, perché il lucchetto era una convenzione degli
  // script in shell e chi scrive in Node nasceva fuori dal protocollo. Il rilancio sotto flock lo
  // porta dentro, con lo stesso file e la stessa primitiva — due meccanismi diversi sullo stesso
  // lucchetto non si escluderebbero a vicenda.
  //
  // Sta DOPO --help apposta: chiedere l'uso non deve mettersi in coda dietro un giro da 45 minuti.
  prendiLucchettoOEsci({ repoDir: AD_ROOT });

  const repoKey = String(args.repo || "");
  if (repoKey !== "ad-mycity" && repoKey !== "mycity") {
    console.error("ERRORE: --repo ad-mycity|mycity obbligatorio.");
    usage();
    process.exit(1);
  }

  const dryRun = Boolean(args["dry-run"]);
  const accoda = Boolean(args.accoda);
  const noPush = Boolean(args["no-push"]);
  const noRebase = Boolean(args["no-rebase"]);

  const cfg = resolveRepoConfig(/** @type {'ad-mycity' | 'mycity'} */ (repoKey));
  const base = String(args.base || cfg.defaultBranch);
  let branch = args.branch ? String(args.branch) : gitOrNull(["rev-parse", "--abbrev-ref", "HEAD"], cfg.cwd);

  if (!branch || branch === "HEAD") {
    console.error("ERRORE: specifica --branch o checkout un branch nel repo.");
    process.exit(1);
  }
  if (branch === base) {
    console.error(`ERRORE: head e base sono lo stesso ramo (${base}). Crea un branch feature/fix.`);
    process.exit(1);
  }
  // AR-276: il ramo principale non si pubblica MAI come head, qualunque base sia dichiarata.
  // Il controllo sopra guarda solo head==base: con `--base altro --branch main` il ramo che il
  // Pannello legge sarebbe finito sotto force-with-lease. Il perimetro è del RAMO, non della coppia.
  if (branch === cfg.defaultBranch) {
    console.error(
      `ERRORE: '${cfg.defaultBranch}' è il ramo principale: non può essere l'head di una PR (ci si pubblica solo per merge). Crea un branch di lavoro.`
    );
    process.exit(1);
  }

  // Il branch da pubblicare deve ESISTERE in locale. Prima si pushava `HEAD:<branch>`: con
  // --branch X lanciato mentre HEAD era su main, su X finiva il CONTENUTO DI MAIN (10/7 sera:
  // branch-fantasma identici a main, PR vuote, Nicola in loop a rilanciare comandi). Ora si
  // pubblica sempre refs/heads/<branch>, e se manca → errore chiaro subito.
  const branchCorrente = gitOrNull(["rev-parse", "--abbrev-ref", "HEAD"], cfg.cwd) || "";
  const sulBranch = branchCorrente === branch;
  if (!gitOrNull(["rev-parse", "--verify", "--quiet", `refs/heads/${branch}`], cfg.cwd)) {
    console.error(`ERRORE: il branch locale '${branch}' non esiste. Crealo prima (git checkout -b ${branch}) o indica quello giusto con --branch.`);
    process.exit(1);
  }

  const authorEmail = process.env.GIT_AUTHOR_EMAIL || "98592323+NicolaeRotaru@users.noreply.github.com";
  const authorName = process.env.GIT_AUTHOR_NAME || "AD MyCity";
  const gitEnv = {
    GIT_AUTHOR_EMAIL: authorEmail,
    GIT_AUTHOR_NAME: authorName,
    GIT_COMMITTER_EMAIL: authorEmail,
    GIT_COMMITTER_NAME: authorName,
  };

  const dirty = gitOrNull(["status", "--porcelain"], cfg.cwd);
  const hasChanges = Boolean(dirty?.trim());

  // IL FRENO DELLA FAMIGLIA PIÙ COSTOSA (21 correzioni di Nicola), e sta QUI — fuori da ogni
  // condizione sul working tree — per un motivo pagato in questa stessa sessione: la prima versione
  // era dentro `if (hasChanges …)`, cioè girava solo col lavoro non ancora committato. Ma il caso
  // normale è l'opposto: committo, poi apro la PR. Con l'albero pulito il freno non partiva, e un
  // ramo che si era già portato dietro il diario in un commit precedente passava liscio. È AR-172
  // in persona: riparare la porta a mano e lasciare aperta quella automatica.
  //
  // Cosa guarda: il lavoro sporco (che il commit chore qui sotto porterebbe dentro) E i file già
  // committati sul ramo. Blocca un caso solo — codice e diario insieme. `--anche-il-diario` è la
  // via d'uscita dichiarata, per quando quei file li stai cambiando apposta.
  if (!dryRun && sulBranch && !process.argv.includes("--anche-il-diario")) {
    const controllo = spawnSync("node", [join(AD_ROOT, "cervello/ramo-pulito.mjs")], {
      cwd: cfg.cwd,
      encoding: "utf8",
      timeout: 120_000,
    });
    if (controllo.status === 1) {
      console.error(controllo.stdout || "");
      console.error("⛔ Non apro la PR: il ramo si porta dietro il diario della macchina.");
      console.error("   Committa quei file su main da soli, o rilancia con --anche-il-diario se è voluto.");
      process.exit(1);
    }
    if (controllo.status === 2) {
      console.warn(`⚠️  ramo-pulito non ha potuto misurare (${(controllo.stderr || "").trim()}): proseguo, ma il verde non copre questa parte.`);
    }
  }

  if (hasChanges && !dryRun && sulBranch) {
    const msg = String(args.message || args.title || `chore: ${branch}`);
    const toStage = pathsToStageFromPorcelain(dirty || "");
    if (toStage.length === 0) {
      console.warn(
        "⚠️  Solo file auto-worker (routing/sentinella) modificati — skip commit chore per evitare conflitti PR."
      );
    } else {
      try {
        git(["add", "--", ...toStage], cfg.cwd);
        git(["commit", "-m", msg], cfg.cwd, gitEnv);
        console.log(`✓ Commit: ${msg} (${toStage.length} file)`);
      } catch (e) {
        console.error("ERRORE commit:", sanitize(e, cfg.token));
        process.exit(1);
      }
    }
  } else if (hasChanges && dryRun) {
    console.log("[DRY-RUN] Committerebbe modifiche pendenti nel repo.");
  } else if (hasChanges && !sulBranch) {
    // HEAD è su un ALTRO ramo (es. main): mai committare lì il pendente — si pubblicherebbe
    // sporco sulla base o si mischierebbero lavori. Il pendente resta dov'è, intatto.
    console.warn(`⚠️  Modifiche non committate su '${branchCorrente}' lasciate intatte: pubblico solo refs/heads/${branch}.`);
  }

  /** @type {{ baseRef?: string, ahead?: string }} */
  let rebaseInfo = {};
  if (!noRebase && !dryRun) {
    try {
      rebaseInfo = rebaseBranchOntoBase(cfg, base, branch);
      if (rebaseInfo.ahead === "0") {
        console.log(
          `✓ '${branch}' è già dentro '${base}' dopo rebase — niente da mergiare. Chiudi la PR su GitHub se ancora aperta.`
        );
        await stampSegnale("pr", "ok", `branch ${branch} già in ${base} · ${nowPiacenza()}`);
        console.log(JSON.stringify({ ok: true, repo: cfg.slug, branch, base, pr: null, giaDentro: true }, null, 2));
        return;
      }
    } catch (e) {
      console.error("ERRORE rebase pre-PR:", sanitize(e, cfg.token));
      process.exit(1);
    }
  } else if (!noRebase && dryRun) {
    console.log(`[DRY-RUN] Rebase ${branch} su ${base} + controllo conflitti merge-tree.`);
  }

  if (!noPush && !dryRun) {
    const url = gitAuthUrl(cfg);
    const ref = `refs/heads/${branch}:refs/heads/${branch}`;
    const pushArgs = rebaseInfo.baseRef ? ["push", "--force-with-lease", url, ref] : ["push", url, ref];
    try {
      git(pushArgs, cfg.cwd);
      console.log(`✓ Push ${branch} → origin${rebaseInfo.baseRef ? " (force-with-lease post-rebase)" : ""}`);
    } catch (e) {
      // AR-276/AR-318 — NESSUN RIPIEGO CIECO. Il push forzato senza lease qui dentro non esiste più:
      // era il ripiego automatico al primo rifiuto del lease, e sovrascriveva il lavoro di un'altra
      // sessione (o del worker) senza nemmeno guardare cosa c'era sul remoto.
      //
      // Un lease rifiutato ha DUE cause, e vanno distinte leggendo il remoto, non indovinando:
      //   ① il ref remoto è solo vecchio in locale (non abbiamo fatto fetch) e il remoto è un
      //      ANTENATO di ciò che stiamo pubblicando → nessuno ha lavorato: si ripete il lease
      //      ancorato allo SHA appena letto, che resta una difesa (se cambia nel frattempo, fallisce).
      //   ② il remoto ha commit che noi non abbiamo → qualcuno ci ha lavorato: ci si FERMA.
      // Il `--force` nudo resta una scelta umana, da digitare a mano dopo aver guardato il diff.
      //
      // AR-451 — «antenato di COSA» era la domanda sbagliata quando il ramo era già stato ribasato.
      // Il rebase fatto qui sopra riscrive l'hash di ogni commit che sposta: un ramo pubblicato ieri
      // come X e poi ribasato oggi non ha più X tra i suoi antenati, anche se il contenuto è lo
      // stesso. Il vecchio controllo guardava solo `shaLocale` (il ramo DOPO il rebase di questa
      // corsa) e quindi scambiava «l'ho pubblicato io stessa la corsa precedente» per «qualcun altro
      // ci ha lavorato». La prova giusta guarda anche `preRebaseSha` — il ramo COM'ERA un attimo
      // prima che questa corsa lo ribasasse: se il remoto è antenato di quello, è la nostra stessa
      // pubblicazione precedente, non il lavoro di qualcun altro.
      if (rebaseInfo.baseRef) {
        // AR-461 — la decisione sta in `esitoLeaseRifiutato`, qui sopra, e non più in queste righe.
        // Non è ordine: è che dentro `main()` quella riga non la poteva provare nessuno, e infatti
        // per mesi non l'ha provata nessuno. Fuori, si guida su due repo veri.
        const { shaRemoto, remotoAntenato } = esitoLeaseRifiutato(cfg, url, branch, rebaseInfo);
        if (shaRemoto && remotoAntenato) {
          try {
            git(["push", `--force-with-lease=refs/heads/${branch}:${shaRemoto}`, url, ref], cfg.cwd);
            console.log(`✓ Push ${branch} → origin (lease ri-ancorato a ${shaRemoto.slice(0, 8)}: il remoto era solo vecchio in locale)`);
          } catch (e2) {
            console.error("ERRORE push:", sanitize(e2, cfg.token));
            process.exit(1);
          }
        } else {
          console.error("ERRORE push:", sanitize(e, cfg.token));
          console.error("");
          console.error(`⛔ Il ramo '${branch}' su GitHub è AVANTI rispetto al tuo: qualcun altro (altra sessione, worker) ci ha lavorato.`);
          console.error("   Non sovrascrivo: il suo lavoro andrebbe perso. Riallinea e ripubblica:");
          console.error(`   git fetch origin ${branch} && git rebase origin/${branch}   → poi rilancia questo comando.`);
          console.error("   Se davvero vuoi buttare via il remoto, il push forzato lo digiti tu a mano, dopo aver guardato il diff.");
          process.exit(1);
        }
      } else {
        console.error("ERRORE push:", sanitize(e, cfg.token));
        process.exit(1);
      }
    }
  } else if (!noPush && dryRun) {
    console.log(`[DRY-RUN] Push refs/heads/${branch} su ${cfg.slug}`);
  }

  const title =
    String(args.title || "") ||
    gitOrNull(["log", "-1", "--format=%s", `refs/heads/${branch}`], cfg.cwd) ||
    branch;
  const body = requireBody(resolveBody(args, cfg, branch), cfg, branch);

  let pr;
  if (dryRun) {
    pr = { number: "?", html_url: `https://github.com/${cfg.slug}/pull/?`, title };
    console.log(`[DRY-RUN] Creerebbe PR: ${title}`);
    console.log(`[DRY-RUN] Body (${body.length} caratteri): ${body.slice(0, 120)}…`);
  } else {
    const existing = await findOpenPrForBranch(cfg, branch);
    if (existing) {
      pr = existing;
      console.log(`✓ PR esistente #${pr.number}: ${pr.html_url}`);
      const current = String(existing.body || "").trim();
      if (current !== body) {
        pr = await patchPullRequestBody(cfg, existing.number, body);
        console.log(`✓ Descrizione PR #${pr.number} aggiornata su GitHub (${body.length} caratteri)`);
      }
    } else {
      // Prima di creare la PR: il branch ha davvero commit oltre la base? Un branch già
      // mergiato (o identico alla base) darebbe una PR vuota (GitHub 422 «No commits
      // between…»): meglio dirlo in chiaro che rilanciare comandi a vuoto.
      let avanti = null;
      try {
        git(["fetch", gitAuthUrl(cfg), base], cfg.cwd);
        avanti = gitOrNull(["rev-list", "--count", `FETCH_HEAD..refs/heads/${branch}`], cfg.cwd);
      } catch {
        /* fetch base fallito: si tenta comunque la creazione, GitHub farà da giudice */
      }
      if (avanti === "0") {
        console.log(`✓ Niente da pubblicare: '${branch}' non ha commit oltre '${base}' — probabilmente è GIÀ stato mergiato. Nessuna PR creata.`);
        await stampSegnale("pr", "ok", `niente da pubblicare: ${branch} già dentro ${base} · ${nowPiacenza()}`);
        console.log(JSON.stringify({ ok: true, repo: cfg.slug, branch, base, pr: null, giaDentro: true }, null, 2));
        return;
      }
      pr = await githubRequest(cfg.token, `/repos/${cfg.owner}/${cfg.repo}/pulls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, head: branch, base }),
      });
      console.log(`✓ PR creata #${pr.number}: ${pr.html_url}`);
    }
    if (!dryRun && pr?.number) {
      const checked = await waitForMergeable(cfg, pr.number);
      if (checked.mergeable === false) {
        console.error(`ERRORE: PR #${pr.number} ha ancora conflitti con ${base}. Risolvi e rilancia git-pr.`);
        process.exit(1);
      }
      if (checked.mergeable === true) {
        console.log(`✓ PR #${pr.number} mergeable (nessun conflitto con ${base})`);
      }
    }
  }

  writeConsegna(
    { cfg, branch, base, title, prNumber: pr.number, prUrl: pr.html_url },
    dryRun
  );

  if (accoda) {
    accodaAzione({
      prUrl: pr.html_url,
      prNumber: pr.number,
      cfg,
      base,
      branch,
      title,
      dryRun,
    });
  }

  if (!dryRun) {
    await stampSegnale("pr", "ok", `PR #${pr.number} ${cfg.slug} (${branch} → ${base}) · ${nowPiacenza()}`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        repo: cfg.slug,
        branch,
        base,
        pr: pr.number,
        url: pr.html_url,
        accoda,
        dryRun,
      },
      null,
      2
    )
  );
}

// LA GUARDIA DELL'INGRESSO (AR-445). Senza, un `import` di questo file per provarne una funzione farebbe
// partire una PR vera: prenderebbe il lucchetto del worktree, farebbe checkout e push, e chiuderebbe
// il processo del test con `process.exit`. Un pezzo che non si può importare è un pezzo che nessuno
// prova — ed è per questo che il rebase è arrivato al 30/7 senza una sola prova comportamentale.
const E_CLI = import.meta.url === pathToFileURL(process.argv[1] || "").href;

if (E_CLI) {
  main().catch(async (e) => {
    console.error("ERRORE:", e.message || e);
    await stampSegnale("pr", "errore", `${(e.message || e).toString().slice(0, 200)} · ${nowPiacenza()}`);
    process.exit(1);
  });
}
