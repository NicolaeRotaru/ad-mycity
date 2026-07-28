#!/usr/bin/env node
// Merge di una Pull Request — SOLO dopo approvazione Nicola (worker / AZIONI_LIVE=1).
// Mai chiamare in autonomia dall'AD su azioni non approvate.
//
// Uso:
//   node cervello/git-merge.mjs --repo mycity --pr 42
//   node cervello/git-merge.mjs --repo ad-mycity --pr 15 --method merge
//   node cervello/git-merge.mjs --repo mycity --pr 42 --dry-run
//
// Default: SQUASH con titolo commit = "Titolo della PR (#N)" — così il deploy
// Vercel porta il nome della PR mergiata, non "Merge pull request #N from …".
//
// LIVE: AZIONI_LIVE=1 (o "on") — altrimenti dry-run come esegui-azione.mjs.

import {
  getPullRequest,
  githubRequest,
  nowPiacenza,
  resolveRepoConfig,
  stampSegnale,
} from "./git-github.mjs";
import { consensoInvio } from "./consenso-azione.mjs"; // AR-272: il merge è una mano, e passa dal cancello

const LIVE = process.env.AZIONI_LIVE === "1" || process.env.AZIONI_LIVE === "on";

function usage() {
  console.log(`Merge PR GitHub (🔴 — solo dopo Approva nel Pannello).

Opzioni:
  --repo ad-mycity|mycity   Repo (obbligatorio)
  --pr NUMERO               Numero PR (obbligatorio)
  --method squash|merge|rebase   Metodo merge (default: squash → titolo "Titolo PR (#N)")
  --dry-run                 Simula senza mergeare
  --azione-id ID            Casella firmata da Nicola che autorizza questo merge (AR-272)
  --help                    Aiuto

Sicurezza (AR-272): oltre ad AZIONI_LIVE=1 servono PAUSA spenta, la firma di Nicola sulla
casella in AZIONI-IN-ATTESA e il canale github sbloccato in mani-allowlist.json.
Senza, stampa [DRY-RUN] e non mergea. L'opzione --force non esiste più.`);
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
  // AR-272 (b) — `--force` è stato TOLTO. Era un'opzione documentata che saltava il freno: un
  // cancello con accanto l'interruttore per spegnerlo non è un cancello. Se serve provare il flusso
  // senza mergiare davvero c'è già `--dry-run`, che va nella direzione sicura.
  if (args.force) {
    console.error(
      "ERRORE: --force non esiste più (AR-272). Saltava il freno sull'azione più irreversibile della macchina.\n" +
        "  Per provare senza mergiare: --dry-run. Per mergiare davvero: la card firmata da Nicola nel Pannello.",
    );
    process.exit(1);
  }
  const argAzioneId = String(args["azione-id"] || "").trim();
  const method = String(args.method || "squash");
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

  // AR-272 — IL MERGE È UNA MANO, e finora era l'unica che non passava dal cancello.
  //
  // Mandare codice in produzione è l'azione più irreversibile che questa macchina possa compiere: sul
  // Pannello un merge su `main` fa partire il Deploy Hook. Eppure era l'unica uscita che non chiedeva
  // né la PAUSA né la firma di Nicola — mentre un'email a un cliente le chiede entrambe. La causa non
  // è una svista: il cancello è stato aggiunto agli «esecutori delle mani» (email, notifiche, DB) e il
  // merge non è stato riconosciuto come una mano, perché è nato prima, come strumento del worker.
  // Il canale `github` esisteva GIÀ dentro consenso-azione.mjs, pronto e mai chiamato.
  const consenso = await consensoInvio({
    azioneId: process.env.AZIONE_ID || argAzioneId,
    canale: "github",
    destinatario: `${cfg.slug}#${prNum}`,
  });
  const canMerge = LIVE && consenso.live && !dryRun;
  if (!canMerge) {
    const perche = !LIVE ? "AZIONI_LIVE non attivo" : !consenso.live ? consenso.motivo : "richiesto --dry-run";
    console.log(`[DRY-RUN] MERGE PR #${prNum} su ${cfg.slug} (metodo: ${method}). Motivo: ${perche}`);
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
        // Titolo del commit di merge = "Titolo della PR (#N)": è ciò che Vercel
        // mostra come nome del deploy. Con merge_method=merge questo sostituisce
        // il default "Merge pull request #N from …".
        commit_title: `${pr.title} (#${prNum})`,
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
