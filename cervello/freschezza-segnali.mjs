#!/usr/bin/env node
// freschezza-segnali.mjs — meta-guardiano: i guardiani del preambolo hanno lasciato un battito?
// Se un guardiano crasha ma giro.sh ingoia l'errore con || true, questo script segnala l'assenza.
//
// Uso: node cervello/freschezza-segnali.mjs [--max-min=60]
// Exit: 0 = tutti i segnali attesi freschi · 1 = almeno uno mancante/stantio

import { nowPiacenza, stampSegnale } from "./git-github.mjs";

const MAX_MIN = Number(process.argv.find((a) => a.startsWith("--max-min="))?.slice(10) || 60);

const ATTESI = [
  "sensori",
  "allinea-scan-cantiere",
  "chiusura-loop",
  "coerenza-fatti",
  "allocazione",
  "delta-gate",
  "auto-fix",
];

function etaMinutiIso(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.round((Date.now() - t) / 60000);
}

async function leggiSegnali() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_KEY?.trim();
  if (!url || !key) return { ok: false, motivo: "Supabase non configurato", segnali: {} };

  const res = await fetch(
    `${url}/rest/v1/impostazioni?select=chiave,valore,updated_at&chiave=like.automazione.*`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    }
  );
  if (!res.ok) return { ok: false, motivo: `HTTP ${res.status}`, segnali: {} };
  const rows = await res.json();
  const segnali = {};
  for (const r of rows) {
    const nome = String(r.chiave || "").replace(/^automazione:/, "");
    if (nome) segnali[nome] = { valore: r.valore, updated_at: r.updated_at };
  }
  return { ok: true, segnali };
}

async function main() {
  const quando = nowPiacenza();
  const { ok, motivo, segnali } = await leggiSegnali();
  if (!ok) {
    console.log(`⚠️  freschezza-segnali: ${motivo} — skip (normale senza Supabase).`);
    await stampSegnale("freschezza-segnali", "warn", `non verificabile: ${motivo} · ${quando}`);
    process.exit(0);
  }

  const mancanti = [];
  const stantii = [];
  for (const nome of ATTESI) {
    const s = segnali[nome];
    if (!s) {
      mancanti.push(nome);
      continue;
    }
    const eta = etaMinutiIso(s.updated_at);
    if (eta == null || eta > MAX_MIN) stantii.push(`${nome} (${eta ?? "?"}min)`);
  }

  const problemi = [...mancanti.map((n) => `manca:${n}`), ...stantii.map((n) => `stale:${n}`)];
  if (problemi.length) {
    const sintesi = `${problemi.length} guardiani senza battito fresco (max ${MAX_MIN}min): ${problemi.slice(0, 5).join(", ")}`;
    console.log(`⚠️  ${sintesi}`);
    await stampSegnale("freschezza-segnali", "warn", `${sintesi} · ${quando}`);
    process.exit(1);
  }

  console.log(`✅ freschezza-segnali: ${ATTESI.length} guardiani con battito fresco (≤${MAX_MIN}min).`);
  await stampSegnale("freschezza-segnali", "ok", `${ATTESI.length} ok · ${quando}`);
  process.exit(0);
}

main().catch(async (e) => {
  await stampSegnale("freschezza-segnali", "errore", `crash: ${(e.message || e).toString().slice(0, 160)}`);
  console.error("ERRORE freschezza-segnali:", e.message || e);
  process.exit(1);
});
