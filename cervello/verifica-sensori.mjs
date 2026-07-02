#!/usr/bin/env node
// Verifica salute sensori dati — retry REST + contatore giri-ciechi.
// 🟢 Sola lettura: NON scrive sul DB marketplace, aggiorna solo sensori-cecita.json nel vault.
//
// Risolve AR-001 / AR-003: quando Supabase/Stripe MCP cadono (es. "permission stream closed"),
// il giro usa il fallback REST (MARKETPLACE_SUPABASE_*) con retry esplicito e tiene traccia
// da quanti giri ogni sensore è cieco (non più silenzioso).
//
// Uso:
//   node cervello/verifica-sensori.mjs            -> report leggibile
//   node cervello/verifica-sensori.mjs --json     -> output JSON (per giro.sh / sentinelle)
//   node cervello/verifica-sensori.mjs --mcp-supabase=ok|cieco  -> aggiorna contatore MCP da sessione AD
//
// Exit: 0 = almeno un sensore dati ok · 1 = tutti ciechi (lavora su memoria + Gap)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const RETRIES = 3;
const RETRY_MS = 2000;

const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
const CECITA_PATH = join(VAULT, "sensori-cecita.json");

/** @param {number} ms */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * @param {() => Promise<{ok: boolean, dettaglio?: string}>} fn
 * @param {string} nome
 */
async function conRetry(fn, nome) {
  let last = "";
  for (let i = 1; i <= RETRIES; i++) {
    try {
      const r = await fn();
      if (r.ok) return { ok: true, dettaglio: r.dettaglio || "ok", tentativi: i };
      last = r.dettaglio || "fallito";
    } catch (e) {
      last = e.message || String(e);
    }
    if (i < RETRIES) await sleep(RETRY_MS);
  }
  return { ok: false, dettaglio: `${last} (dopo ${RETRIES} tentativi)`, tentativi: RETRIES };
}

function parseMcpFlag(name) {
  const pref = `--mcp-${name}=`;
  const arg = process.argv.find((a) => a.startsWith(pref));
  if (!arg) return null;
  const v = arg.slice(pref.length).trim();
  return v === "ok" || v === "cieco" ? v : null;
}

function leggiCecita() {
  if (!existsSync(CECITA_PATH)) {
    return {
      _cosa_e:
        "Contatore giri-ciechi per ogni sensore dati. Aggiornato da verifica-sensori.mjs a ogni giro. Alimenta la sonda e le sentinelle.",
      aggiornato: nowPiacenza(),
      sensori: {},
      meta: { giri_totali: 0 },
    };
  }
  try {
    return JSON.parse(readFileSync(CECITA_PATH, "utf8"));
  } catch {
    return { aggiornato: nowPiacenza(), sensori: {}, meta: { giri_totali: 0 } };
  }
}

/**
 * @param {Record<string, {stato?: string, giri_ciechi?: number, ultimo_ok?: string, ultimo_errore?: string, canale?: string}>} prev
 * @param {string} key
 * @param {boolean} ok
 * @param {string} dettaglio
 * @param {string} canale
 */
function aggiornaSensore(prev, key, ok, dettaglio, canale) {
  const old = prev[key] || { giri_ciechi: 0 };
  const quando = nowPiacenza();
  if (ok) {
    return {
      ...old,
      stato: "ok",
      giri_ciechi: 0,
      ultimo_ok: quando,
      ultimo_errore: old.ultimo_errore || "",
      canale,
      dettaglio: dettaglio.slice(0, 200),
    };
  }
  return {
    ...old,
    stato: "cieco",
    giri_ciechi: (old.giri_ciechi || 0) + 1,
    ultimo_errore: dettaglio.slice(0, 200),
    canale,
    dettaglio: dettaglio.slice(0, 200),
  };
}

async function checkSupabaseMarketplace() {
  const url = process.env.MARKETPLACE_SUPABASE_URL?.trim();
  const key = process.env.MARKETPLACE_SUPABASE_KEY?.trim();
  if (!url || !key) {
    return { ok: false, dettaglio: "MARKETPLACE_SUPABASE_URL/KEY assenti nel .env" };
  }
  return conRetry(async () => {
    const res = await fetch(`${url}/rest/v1/orders?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, dettaglio: `HTTP ${res.status}: ${t.slice(0, 120)}` };
    }
    return { ok: true, dettaglio: "orders leggibili via REST" };
  }, "supabase_rest");
}

async function checkStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    return { ok: false, dettaglio: "STRIPE_SECRET_KEY assente — Stripe non verificabile" };
  }
  return conRetry(async () => {
    const res = await fetch("https://api.stripe.com/v1/balance", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, dettaglio: `HTTP ${res.status}: ${t.slice(0, 120)}` };
    }
    return { ok: true, dettaglio: "balance API ok" };
  }, "stripe_api");
}

async function main() {
  const quando = nowPiacenza();
  const cecita = leggiCecita();
  cecita.meta = cecita.meta || {};
  cecita.meta.giri_totali = (cecita.meta.giri_totali || 0) + 1;

  const checks = [];

  const sb = await checkSupabaseMarketplace();
  checks.push({ nome: "supabase_rest", ...sb, canale: "MARKETPLACE_SUPABASE_*" });
  cecita.sensori = cecita.sensori || {};
  cecita.sensori.supabase_rest = aggiornaSensore(
    cecita.sensori,
    "supabase_rest",
    sb.ok,
    sb.dettaglio,
    "REST marketplace"
  );

  const st = await checkStripe();
  checks.push({ nome: "stripe_api", ...st, canale: "STRIPE_SECRET_KEY" });
  cecita.sensori.stripe_api = aggiornaSensore(
    cecita.sensori,
    "stripe_api",
    st.ok,
    st.dettaglio,
    "Stripe API"
  );

  const mcpSb = parseMcpFlag("supabase");
  if (mcpSb) {
    const ok = mcpSb === "ok";
    cecita.sensori.mcp_supabase = aggiornaSensore(
      cecita.sensori,
      "mcp_supabase",
      ok,
      ok ? "MCP Supabase raggiungibile in sessione" : "MCP Supabase cieco (permission stream closed / needsAuth)",
      "MCP Cursor/Claude"
    );
    checks.push({
      nome: "mcp_supabase",
      ok,
      dettaglio: cecita.sensori.mcp_supabase.dettaglio,
      canale: "MCP",
    });
  } else if (!cecita.sensori.mcp_supabase) {
    cecita.sensori.mcp_supabase = {
      stato: "non_verificato",
      giri_ciechi: 0,
      canale: "MCP Cursor/Claude",
      dettaglio: "Non testabile da script: l'AD aggiorna con --mcp-supabase=ok|cieco in auto-analisi",
    };
  }

  const mcpStripe = parseMcpFlag("stripe");
  if (mcpStripe) {
    const ok = mcpStripe === "ok";
    cecita.sensori.mcp_stripe = aggiornaSensore(
      cecita.sensori,
      "mcp_stripe",
      ok,
      ok ? "MCP Stripe raggiungibile" : "MCP Stripe cieco",
      "MCP Cursor/Claude"
    );
  }

  const datiOk = checks.filter((c) => c.ok);
  const tuttiCiechi = datiOk.length === 0;
  const maxCecita = Math.max(
    0,
    ...Object.values(cecita.sensori).map((s) => s.giri_ciechi || 0)
  );

  cecita.aggiornato = quando;
  cecita.istruzioni_giro = tuttiCiechi
    ? "Tutti i sensori REST ciechi: NON inventare numeri. Usa baseline STATO + sezione Gap. Passaggio minimo se nulla è cambiato fuori."
    : sb.ok
      ? "Supabase REST ok: usa questi dati per i 7 numeri anche se MCP Supabase è cieco. Segnala nei Gap solo ciò che REST non copre."
      : "Stripe ok ma Supabase REST cieco: limita analisi ordini; verifica MARKETPLACE_SUPABASE_* sul VPS.";

  cecita.meta.sensori_ok = datiOk.length;
  cecita.meta.sensori_totali = checks.length;
  cecita.meta.max_giri_ciechi = maxCecita;
  cecita.meta.almeno_un_dato = !tuttiCiechi;

  mkdirSync(dirname(CECITA_PATH), { recursive: true });
  writeFileSync(CECITA_PATH, JSON.stringify(cecita, null, 2) + "\n", "utf8");

  const sintesi = tuttiCiechi
    ? `TUTTI CIECHI · max ${maxCecita} giri consecutivi`
    : `${datiOk.length}/${checks.length} ok · max cecità ${maxCecita} giri`;

  await stampSegnale("sensori", tuttiCiechi ? "errore" : "ok", `${sintesi} · ${quando}`);

  const out = {
    esito: tuttiCiechi ? "cieco" : "ok",
    quando,
    sintesi,
    checks,
    istruzioni_giro: cecita.istruzioni_giro,
    sensori: cecita.sensori,
    max_giri_ciechi: maxCecita,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(`\n📡 VERIFICA SENSORI — ${quando}\n`);
    for (const c of checks) {
      console.log(`${c.ok ? "✅" : "❌"} ${c.nome.padEnd(18)} ${c.dettaglio}`);
    }
    console.log(`\n${cecita.istruzioni_giro}`);
    console.log(`\nScritto: ${CECITA_PATH}`);
    if (maxCecita >= 3) {
      console.log(`\n⚠️  Sentinella: almeno un sensore cieco da ${maxCecita} giri consecutivi.`);
    }
  }

  process.exit(tuttiCiechi ? 1 : 0);
}

main().catch(async (e) => {
  console.error("ERRORE verifica-sensori:", e.message || e);
  await stampSegnale("sensori", "errore", `crash: ${(e.message || e).toString().slice(0, 200)}`);
  process.exit(1);
});
