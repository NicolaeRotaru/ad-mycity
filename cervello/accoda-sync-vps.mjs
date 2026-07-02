#!/usr/bin/env node
/**
 * accoda-sync-vps.mjs — Accoda un lavoro sync-vps sul worker VPS (post-merge su main).
 * Uso: node cervello/accoda-sync-vps.mjs [motivo opzionale]
 * Richiede SUPABASE_URL + SUPABASE_SERVICE_KEY (progetto memoria) nel .env VPS o env.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, "vps/.env");

function loadEnv() {
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i);
    const v = t.slice(i + 1);
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
const motivo = process.argv.slice(2).join(" ") || "post-merge main";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Mancano SUPABASE_URL e SUPABASE_SERVICE_KEY (progetto memoria).");
  process.exit(1);
}

const body = {
  stato: "in_attesa",
  tipo: "sync-vps",
  richiesta: `Allinea codice VPS da origin/main e riavvia mycity-worker. Motivo: ${motivo}`,
  esperto: "devops",
};

const res = await fetch(`${SUPABASE_URL}/rest/v1/lavori`, {
  method: "POST",
  headers: {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify(body),
});

if (!res.ok) {
  console.error("Accodamento fallito:", res.status, await res.text());
  process.exit(1);
}

const row = (await res.json())[0];
console.log(`✓ Sync VPS accodato (lavoro ${row?.id ?? "?"}). Il worker lo esegue entro ~${process.env.WORKER_INTERVALLO || 5}s.`);
