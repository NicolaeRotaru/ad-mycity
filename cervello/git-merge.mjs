#!/usr/bin/env node
// Merge di una Pull Request — SOLO dopo approvazione Nicola (worker / AZIONI_LIVE=1).
// Mai chiamare in autonomia dall'AD su azioni non approvate.
//
// Uso:
//   node cervello/git-merge.mjs --repo mycity --pr 42
//   node cervello/git-merge.mjs --repo ad-mycity --pr 15 --method squash
//   node cervello/git-merge.mjs --repo mycity --pr 42 --dry-run
//
// LIVE: AZIONI_LIVE=1 (o "on") — altrimenti dry-run come esegui-azione.mjs.

import {
  getPullRequest,
  githubRequest,
  nowPiacenza,
  resolveRepoConfig,
  stampSegnale,
} from "./git-github.mjs";

const LIVE = process.env.AZIONI_LIVE === "1" || process.env.AZIONI_LIVE === "on";

function usage() {
  console.log(`Merge PR GitHub (🔴 — solo dopo Approva nel Pannello).

Opzioni:
  --repo ad-mycity|mycity   Repo (obbligatorio)
  --pr NUMERO               Numero PR (obbligatorio)
  --method merge|squash|rebase   Metodo merge (default: merge)
  --dry-run                 Simula senza mergeare
  --force                   Merge anche se AZIONI_LIVE=0 (solo test/dev)
  --help                    Aiuto

Sicurezza: senza AZIONI_LIVE=1 stampa [DRY-RUN] e non mergea.`);
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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const repoKey = String(args.repo || "");
  const prNum = Number(args.pr);
  if (repoKey !== "ad-mycity" && repoKey !== "mycity") {
    console.error("ERRORE: --repo ad-mycity|mycity obbligatorio.");
    process.exit(1);
  }
  if (!Number.isFinite(prNum) || prNum < 1) {
    console.error("ERRORE: --pr NUMERO obbligatorio.");
    process.exit(1);
  }

  const dryRun = Boolean(args["dry-run"]);
  const force = Boolean(args.force);
  const method = String(args.method || "merge");
  if (!["merge", "squash", "rebase"].includes(method)) {
    console.error("ERRORE: --method deve essere merge, squash o rebase.");
    process.exit(1);
  }

  const cfg = resolveRepoConfig(/** @type {'ad-mycity' | 'mycity'} */ (repoKey));
  const pr = await getPullRequest(cfg, prNum);

  console.log(`PR #${pr.number}: ${pr.title}`);
  console.log(`  ${pr.head.ref} → ${pr.base.ref}`);
  console.log(`  Stato: ${pr.state} · mergeable: ${pr.mergeable} · ${pr.html_url}`);

  if (pr.state !== "open") {
    console.error(`ERRORE: PR #${prNum} non è aperta (stato: ${pr.state}).`);
    process.exit(1);
  }
  if (pr.mergeable === false) {
    console.error("ERRORE: PR non mergeable (conflitti o check in corso). Risolvi su GitHub.");
    process.exit(1);
  }

  const canMerge = (LIVE || force) && !dryRun;
  if (!canMerge) {
    console.log(
      `[DRY-RUN] MERGE PR #${prNum} su ${cfg.slug} (metodo: ${method}). ` +
        `Per merge reale: AZIONI_LIVE=1 oppure --force (solo dev).`
    );
    console.log(
      JSON.stringify({ ok: true, dryRun: true, repo: cfg.slug, pr: prNum, url: pr.html_url }, null, 2)
    );
    return;
  }

  const result = await githubRequest(
    cfg.token,
    `/repos/${cfg.owner}/${cfg.repo}/pulls/${prNum}/merge`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merge_method: method,
        commit_title: pr.title,
      }),
    }
  );

  console.log(`✓ Merge completato: ${result.sha}`);
  console.log(`  ${pr.html_url}`);

  if (cfg.key === "ad-mycity") {
    console.log("→ Pannello: se il merge tocca pannello/, l'action deploy-pannello chiama il Deploy Hook Vercel (i deploy git sono spenti per non bruciare la quota).");
    console.log("→ VPS: watch-main.sh allineerà il codice entro pochi minuti.");
  } else {
    console.log("→ Render deployerà il sito al merge su main.");
  }

  await stampSegnale("merge", "ok", `PR #${prNum} ${cfg.slug} → ${pr.base.ref} (${result.sha.slice(0, 7)}) · ${nowPiacenza()}`);

  console.log(
    JSON.stringify(
      {
        ok: true,
        merged: true,
        repo: cfg.slug,
        pr: prNum,
        sha: result.sha,
        url: pr.html_url,
      },
      null,
      2
    )
  );
}

main().catch(async (e) => {
  console.error("ERRORE:", e.message || e);
  await stampSegnale("merge", "errore", `${(e.message || e).toString().slice(0, 200)} · ${nowPiacenza()}`);
  process.exit(1);
});
