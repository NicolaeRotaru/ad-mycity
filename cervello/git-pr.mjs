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
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

function usage() {
  console.log(`Apri PR GitHub (senza merge).

Opzioni:
  --repo ad-mycity|mycity   Repo target (obbligatorio)
  --base RAMO               Base PR (default: main — ramo unico, vale anche per il vault)
  --branch RAMO             Head branch (default: branch git corrente nel cwd del repo)
  --title TESTO             Titolo PR (default: messaggio ultimo commit o branch)
  --body TESTO              Corpo PR (markdown)
  --message TESTO           Messaggio commit se ci sono modifiche non committate
  --accoda                  Aggiunge riga 🔴 in AZIONI-IN-ATTESA.md (merge da firmare)
  --no-push                 Non fa push (branch già su GitHub)
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

  if (hasChanges && !dryRun) {
    const msg = String(args.message || args.title || `chore: ${branch}`);
    try {
      git(["add", "-A"], cfg.cwd);
      git(["commit", "-m", msg], cfg.cwd, gitEnv);
      console.log(`✓ Commit: ${msg}`);
    } catch (e) {
      console.error("ERRORE commit:", sanitize(e, cfg.token));
      process.exit(1);
    }
  } else if (hasChanges && dryRun) {
    console.log("[DRY-RUN] Committerebbe modifiche pendenti nel repo.");
  }

  if (!noPush && !dryRun) {
    const url = gitAuthUrl(cfg);
    try {
      git(["push", url, `HEAD:${branch}`], cfg.cwd);
      console.log(`✓ Push ${branch} → origin`);
    } catch (e) {
      console.error("ERRORE push:", sanitize(e, cfg.token));
      process.exit(1);
    }
  } else if (!noPush && dryRun) {
    console.log(`[DRY-RUN] Push HEAD:${branch} su ${cfg.slug}`);
  }

  const title =
    String(args.title || "") ||
    gitOrNull(["log", "-1", "--format=%s"], cfg.cwd) ||
    branch;
  const body =
    String(args.body || "") ||
    `PR aperta dall'AD MyCity (\`cervello/git-pr.mjs\`).\n\nBranch: \`${branch}\` → \`${base}\``;

  let pr;
  if (dryRun) {
    pr = { number: "?", html_url: `https://github.com/${cfg.slug}/pull/?`, title };
    console.log(`[DRY-RUN] Creerebbe PR: ${title}`);
  } else {
    const existing = await findOpenPrForBranch(cfg, branch);
    if (existing) {
      pr = existing;
      console.log(`✓ PR esistente #${pr.number}: ${pr.html_url}`);
    } else {
      pr = await githubRequest(cfg.token, `/repos/${cfg.owner}/${cfg.repo}/pulls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, head: branch, base }),
      });
      console.log(`✓ PR creata #${pr.number}: ${pr.html_url}`);
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
