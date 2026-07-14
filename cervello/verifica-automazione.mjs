#!/usr/bin/env node
// Verifica end-to-end dell'automazione PR/merge/VPS — il "checkup del mattino".
// 🟢 Sola lettura: NON apre PR, NON mergea, NON modifica nulla.
//
// Controlla: token GitHub (entrambi i repo), permessi push, clone marketplace,
// ramo VPS, timer watch-main, worker, segnali automazione:* su Supabase, AZIONI_LIVE.
//
// Uso:
//   node cervello/verifica-automazione.mjs            -> report leggibile
//   node cervello/verifica-automazione.mjs --json     -> output JSON (per il worker/sentinelle)
//
// Exit code: 0 = tutto ok · 1 = almeno un controllo FALLITO (rosso).
// Scrive l'esito complessivo in impostazioni (chiave automazione:verifica) se Supabase è configurato.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  AD_ROOT,
  githubRequest,
  nowPiacenza,
  resolveRepoConfig,
  stampSegnale,
} from "./git-github.mjs";
import { resolveMarketplaceRepo } from "./marketplace-repo.mjs";

const JSON_MODE = process.argv.includes("--json");
const LIVE = process.env.AZIONI_LIVE === "1" || process.env.AZIONI_LIVE === "on";
const VPS_TIMERS_DIR = join(AD_ROOT, "cervello/vps");
/** Timer che devono essere attivi sul VPS — se spenti → fail (non solo warn). */
const TIMER_CRITICI = new Set([
  "mycity-watch-main.timer",
  "mycity-giro.timer",
  "mycity-sentinella-dati.timer",
  "mycity-verifica.timer",
  "mycity-monitora.timer",
  "mycity-sentinella.timer",
]);
const BATTITO_OCCHI_MAX_MIN = Number(process.env.VERIFICA_BATTITO_OCCHI_MIN || 10);

/** @type {{nome: string, esito: 'ok'|'warn'|'fail', dettaglio: string}[]} */
const checks = [];

function add(nome, esito, dettaglio) {
  checks.push({ nome, esito, dettaglio });
}

function sh(cmd, args, cwd) {
  try {
    return execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
}

/** Minuti trascorsi da un timestamp Piacenza "AAAA-MM-GG HH:MM". */
function etaMinutiPiacenza(valore) {
  const m = String(valore ?? "").match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
  if (!m) return null;
  const t = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00+02:00`).getTime();
  if (Number.isNaN(t)) return null;
  return Math.round((Date.now() - t) / 60000);
}

async function checkRepoToken(key) {
  let cfg;
  try {
    cfg = resolveRepoConfig(key);
  } catch (e) {
    // Il clone assente è già coperto dal check dedicato: qui non è un problema di token.
    const cloneAssente = /Clone marketplace assente/i.test(e.message || "");
    add(`token ${key}`, cloneAssente ? "warn" : "fail", cloneAssente ? "non verificabile senza clone locale" : e.message);
    return null;
  }
  if (!cfg.token) {
    add(`token ${key}`, key === "mycity" ? "warn" : "fail", "token assente nel .env");
    return cfg;
  }
  try {
    const repo = await githubRequest(cfg.token, `/repos/${cfg.owner}/${cfg.repo}`);
    const push = repo.permissions?.push === true;
    const prCount = await githubRequest(
      cfg.token,
      `/repos/${cfg.owner}/${cfg.repo}/pulls?state=open&per_page=1`
    );
    add(
      `token ${key}`,
      push ? "ok" : "fail",
      push
        ? `accesso ok, permesso push ✓, PR leggibili (${Array.isArray(prCount) ? "✓" : "?"})`
        : "il token NON ha permesso di push — serve Contents + Pull requests: Read and write"
    );
  } catch (e) {
    add(`token ${key}`, "fail", `GitHub: ${e.message}`);
  }
  return cfg;
}

async function main() {
  // 1) Token + permessi sui due repo
  const adCfg = await checkRepoToken("ad-mycity");
  await checkRepoToken("mycity");

  // 2) Clone marketplace presente
  const mktPath = resolveMarketplaceRepo();
  if (existsSync(join(mktPath, ".git"))) {
    const head = sh("git", ["log", "-1", "--format=%h %cd", "--date=short"], mktPath);
    add("clone marketplace", "ok", `${mktPath} (${head || "?"})`);
  } else {
    add("clone marketplace", "warn", `assente in ${mktPath} — node cervello/collega-marketplace.mjs`);
  }

  // 3) Ramo del repo AD (RAMO UNICO Fase 2: sul VPS deve essere main; altrove è informativo)
  const branch = sh("git", ["rev-parse", "--abbrev-ref", "HEAD"], AD_ROOT);
  const onVps = existsSync("/opt/mycity/ad-mycity");
  if (branch === "main") {
    add("ramo repo AD", "ok", "main (ramo unico) ✓");
  } else if (branch === "memoria-ad") {
    add("ramo repo AD", "fail", "sei sul VECCHIO ramo 'memoria-ad' — Fase 2 = ramo unico 'main': metti GIT_BRANCH=main nel .env e rilancia aggiorna-cervello.sh (deriva ramo!)");
  } else if (onVps && AD_ROOT.startsWith("/opt/mycity")) {
    add("ramo repo AD", "fail", `sei su '${branch}' — sul VPS deve essere main (deriva ramo!)`);
  } else {
    add("ramo repo AD", "warn", `'${branch}' (non-VPS: ok se sei in sviluppo)`);
  }

  // 4) Timer watch-main + worker (solo dove c'è systemd)
  const hasSystemd = sh("sh", ["-c", "command -v systemctl"]) !== null;
  if (hasSystemd) {
    const timer = sh("systemctl", ["is-active", "mycity-watch-main.timer"]);
    add(
      "timer watch-main",
      timer === "active" ? "ok" : "fail",
      timer === "active" ? "attivo ✓" : `stato: ${timer || "assente"} — systemctl enable --now mycity-watch-main.timer`
    );
    const worker = sh("systemctl", ["is-active", "mycity-worker"]);
    add(
      "worker",
      worker === "active" ? "ok" : "fail",
      worker === "active" ? "attivo ✓" : `stato: ${worker || "assente"}`
    );
    // AR-056: il battito 2h (giro) è la cadenza più critica — vigila che il timer sia vivo.
    const giroTimer = sh("systemctl", ["is-active", "mycity-giro.timer"]);
    add(
      "timer giro (battito 2h)",
      giroTimer === "active" ? "ok" : "fail",
      giroTimer === "active" ? "attivo ✓" : `stato: ${giroTimer || "assente"} — systemctl enable --now mycity-giro.timer`
    );
    // Timer attesi da cervello/vps/*.timer (AR salute-sensori: vigila anche occhi/monitora/sentinella).
    if (existsSync(VPS_TIMERS_DIR)) {
      const timers = readdirSync(VPS_TIMERS_DIR)
        .filter((f) => f.startsWith("mycity-") && f.endsWith(".timer"))
        .sort();
      for (const unit of timers) {
        if (["mycity-watch-main.timer", "mycity-giro.timer"].includes(unit)) continue;
        const stato = sh("systemctl", ["is-active", unit]);
        const critico = TIMER_CRITICI.has(unit);
        add(
          `timer ${unit.replace(".timer", "")}`,
          stato === "active" ? "ok" : critico ? "fail" : "warn",
          stato === "active" ? "attivo ✓" : `stato: ${stato || "assente"}`
        );
      }
    }
  } else {
    // AR-056
    add("timer watch-main", "warn", "systemd assente (non-VPS): verifica sul server");
    add("timer giro (battito 2h)", "warn", "systemd assente (non-VPS): verifica mycity-giro.timer sul server");
  }

  // 5) Segnali recenti su Supabase (battiti dell'automazione)
  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  if (sbUrl && sbKey) {
    const sbHeaders = { apikey: sbKey, Authorization: `Bearer ${sbKey}` };
    try {
      const battitoRes = await fetch(
        `${sbUrl}/rest/v1/impostazioni?chiave=eq.sentinella-dati:ultimo&select=valore&limit=1`,
        { headers: sbHeaders }
      );
      const battitoRows = battitoRes.ok ? await battitoRes.json() : [];
      const battitoVal = battitoRows?.[0]?.valore;
      const etaMin = etaMinutiPiacenza(battitoVal);
      if (etaMin == null) {
        add("battito occhi (sentinella-dati:ultimo)", "warn", "nessun battito registrato ancora");
      } else if (etaMin > BATTITO_OCCHI_MAX_MIN) {
        add(
          "battito occhi (sentinella-dati:ultimo)",
          "fail",
          `fermo da ${etaMin} min (ultimo: ${battitoVal}) — mycity-sentinella-dati.timer spento?`
        );
      } else {
        add("battito occhi (sentinella-dati:ultimo)", "ok", `fresco (${etaMin} min fa · ${battitoVal})`);
      }
    } catch (e) {
      add("battito occhi (sentinella-dati:ultimo)", "warn", `non leggibile: ${e.message}`);
    }

    try {
      const res = await fetch(
        `${sbUrl}/rest/v1/impostazioni?chiave=like.automazione:*&select=chiave,valore,updated_at`,
        { headers: sbHeaders }
      );
      const rows = res.ok ? await res.json() : [];
      if (!Array.isArray(rows) || rows.length === 0) {
        add("segnali automazione", "warn", "nessun segnale ancora (normale al primo avvio)");
      } else {
        for (const r of rows) {
          const nome = r.chiave.replace("automazione:", "");
          // Non leggere il proprio segnale precedente: evita loop «errore → errore» (AR salute-sensori).
          if (nome === "verifica") continue;
          const errore = String(r.valore || "").startsWith("errore");
          add(
            `segnale ${nome}`,
            errore ? "fail" : "ok",
            `${r.valore} (${(r.updated_at || "").slice(0, 16).replace("T", " ")})`
          );
        }
      }
    } catch (e) {
      add("segnali automazione", "warn", `Supabase non raggiungibile: ${e.message}`);
    }
  } else {
    add("segnali automazione", "warn", "SUPABASE_URL/SERVICE_KEY assenti — i segnali non arrivano al Pannello");
  }

  // 6) Gate di sicurezza
  add(
    "gate AZIONI_LIVE",
    "ok",
    LIVE
      ? "LIVE (1) — i merge approvati partono davvero"
      : "dry-run (0) — merge simulati finché non metti AZIONI_LIVE=1"
  );

  // Esito complessivo
  const fails = checks.filter((c) => c.esito === "fail");
  const warns = checks.filter((c) => c.esito === "warn");
  const esito = fails.length > 0 ? "errore" : warns.length > 0 ? "warn" : "ok";
  const sintesi =
    fails.length > 0
      ? `${fails.length} FALLITI: ${fails.map((f) => f.nome).join(", ")}`
      : warns.length > 0
        ? `ok con ${warns.length} avvisi`
        : "tutto verde";

  await stampSegnale("verifica", esito === "errore" ? "errore" : "ok", `${sintesi} · ${nowPiacenza()}`);

  if (JSON_MODE) {
    console.log(JSON.stringify({ esito, sintesi, quando: nowPiacenza(), checks }, null, 2));
  } else {
    console.log(`\n🔎 VERIFICA AUTOMAZIONE — ${nowPiacenza()} (Europe/Rome)\n`);
    const ICO = { ok: "✅", warn: "⚠️ ", fail: "❌" };
    for (const c of checks) {
      console.log(`${ICO[c.esito]} ${c.nome.padEnd(22)} ${c.dettaglio}`);
    }
    console.log(`\nESITO: ${esito === "ok" ? "✅ tutto verde" : esito === "warn" ? "⚠️  " + sintesi : "❌ " + sintesi}`);
    if (fails.length > 0) {
      console.log("\nLa macchina NON è pienamente operativa: correggi i ❌ sopra.");
    }
  }

  process.exit(fails.length > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error("ERRORE verifica:", e.message || e);
  await stampSegnale("verifica", "errore", `crash: ${(e.message || e).toString().slice(0, 200)}`);
  process.exit(1);
});
