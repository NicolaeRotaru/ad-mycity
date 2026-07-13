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

import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  AD_ROOT,
  findOpenPrForBranch,
  gitAuthUrl,
  githubRequest,
  nowPiacenza,
  resolveRepoConfig,
  stampSegnale,
} from "./git-github.mjs";

const AZIONI_PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md");
const TECH_DIR = join(AD_ROOT, "consegne/tech");
const GENERIC_BODY_RE = /^PR aperta dall'AD MyCity/i;
const MIN_BODY_LEN = 80;

/** Modificati dal worker a ogni giro — non vanno MAI nel commit chore di una PR pannello (conflitti ricorrenti). */
const WORKER_AUTO_PATHS = new Set([
  "cervello/routing.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/sentinella-dati.json",
]);

/** Descrizione PR condivisa: ogni branch la riscrive → conflitto certo se main avanza. Non committarla sul branch. */
const SHARED_PR_BODY = "consegne/tech/pr-ad-mycity-body.md";

/** In rebase, questi file si risolvono da soli (teniamo la base; il body vero va su GitHub via API). */
const AUTO_RESOLVE_REBASE_PATHS = new Set([SHARED_PR_BODY]);

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

function git(args, cwd, env = {}) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, ...env },
  }).trim();
}

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

/** @param {Record<string, string | boolean>} args @param {{ key: string }} cfg @param {string} branch */
function resolveBody(args, cfg, branch) {
  if (args["body-file"]) {
    const p = String(args["body-file"]);
    const abs = p.startsWith("/") ? p : join(AD_ROOT, p);
    return readFileSync(abs, "utf8").trim();
  }
  if (args.body) return String(args.body).trim();

  const slug = branchSlug(branch);
  const candidates = [
    join(TECH_DIR, `pr-${cfg.key}-body.md`),
    join(TECH_DIR, `pr-${cfg.key}-${slug}-body.md`),
    join(TECH_DIR, `pr-body-${slug}.md`),
  ];
  for (const file of candidates) {
    if (existsSync(file)) return readFileSync(file, "utf8").trim();
  }
  return "";
}

function requireBody(body) {
  if (isGenericBody(body)) {
    console.error("ERRORE: ogni PR deve avere una descrizione comprensibile su GitHub.");
    console.error("Scrivi cosa cambia, perché e come verificare (2-3 passi), poi passa:");
    console.error("  --body \"…\"  oppure  --body-file consegne/tech/pr-ad-mycity-body.md");
    console.error("Oppure salva il testo in uno di questi file prima di aprire la PR:");
    console.error("  consegne/tech/pr-<repo>-body.md");
    console.error("  consegne/tech/pr-<repo>-<branch>-body.md");
    process.exit(1);
  }
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

function unmergedPaths(cfg) {
  const raw = gitOrNull(["diff", "--name-only", "--diff-filter=U"], cfg.cwd);
  return raw ? raw.split("\n").map((p) => p.trim()).filter(Boolean) : [];
}

function isRebaseInProgress(cfg) {
  return existsSync(join(cfg.cwd, ".git", "rebase-merge")) || existsSync(join(cfg.cwd, ".git", "rebase-apply"));
}

/** Risolve conflitti noti durante rebase (--theirs = base). @returns {boolean} true se risolto */
function tryAutoResolveRebaseConflicts(cfg) {
  const pending = unmergedPaths(cfg);
  if (!pending.length) return false;
  if (!pending.every((p) => AUTO_RESOLVE_REBASE_PATHS.has(p))) return false;
  for (const p of pending) {
    git(["checkout", "--theirs", "--", p], cfg.cwd);
    git(["add", "--", p], cfg.cwd);
  }
  return true;
}

/**
 * Rebase del branch feature su base aggiornata; auto-risolve il body PR condiviso.
 * @param {import('./git-github.mjs').RepoConfig} cfg @param {string} base @param {string} branch
 */
function rebaseBranchOntoBase(cfg, base, branch) {
  const prev = gitOrNull(["rev-parse", "--abbrev-ref", "HEAD"], cfg.cwd) || "main";
  const baseRef = fetchBase(cfg, base);
  if (prev !== branch) git(["checkout", branch], cfg.cwd);
  try {
    try {
      git(["rebase", baseRef], cfg.cwd);
    } catch {
      /* conflitto: prova auto-risoluzione fino a 8 step (commit multipli) */
      for (let step = 0; step < 8; step++) {
        if (!isRebaseInProgress(cfg)) break;
        if (!tryAutoResolveRebaseConflicts(cfg)) {
          const pending = unmergedPaths(cfg).join(", ") || "(sconosciuto)";
          git(["rebase", "--abort"], cfg.cwd);
          throw new Error(`Rebase bloccato su file non auto-risolvibili: ${pending}`);
        }
        try {
          git(["rebase", "--continue"], cfg.cwd);
        } catch {
          if (isRebaseInProgress(cfg)) {
            try {
              git(["rebase", "--skip"], cfg.cwd);
            } catch (skipErr) {
              git(["rebase", "--abort"], cfg.cwd);
              throw skipErr;
            }
          }
        }
      }
      if (isRebaseInProgress(cfg)) {
        git(["rebase", "--abort"], cfg.cwd);
        throw new Error("Rebase non completato dopo auto-risoluzione conflitti.");
      }
    }
    const ahead = countCommitsAhead(cfg, baseRef, branch);
    const conflicts = mergeTreeConflictPaths(cfg, baseRef, branch);
    if (conflicts.length) {
      throw new Error(`Conflitti residui dopo rebase: ${conflicts.join(", ")}`);
    }
    console.log(`✓ Rebase ${branch} su ${base} (${ahead} commit oltre la base)`);
    return { baseRef, ahead };
  } finally {
    if (prev !== branch && gitOrNull(["rev-parse", "--abbrev-ref", "HEAD"], cfg.cwd) === branch) {
      git(["checkout", prev], cfg.cwd);
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
      if (rebaseInfo.baseRef) {
        try {
          git(["push", "--force", url, ref], cfg.cwd);
          console.log(`✓ Push ${branch} → origin (force post-rebase)`);
        } catch (e2) {
          console.error("ERRORE push:", sanitize(e2, cfg.token));
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
  const body = resolveBody(args, cfg, branch);
  requireBody(body);

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

main().catch(async (e) => {
  console.error("ERRORE:", e.message || e);
  await stampSegnale("pr", "errore", `${(e.message || e).toString().slice(0, 200)} · ${nowPiacenza()}`);
  process.exit(1);
});
