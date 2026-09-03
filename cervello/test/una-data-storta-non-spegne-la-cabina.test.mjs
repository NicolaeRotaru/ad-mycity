#!/usr/bin/env node
// AR-897 — UNA RIGA STORTA NON SPEGNE LA CABINA.
//
// `Intl.DateTimeFormat.format` lancia su una data che non si legge, e quella chiamata gira dentro
// l'unico try/catch del cruscotto. Bastava un `created_at` illeggibile — o `null` — perche' la
// Cabina rispondesse «database non collegato»: a Nicola diceva la causa sbagliata, e lui andava a
// cercare il guasto dove non era.
//
// COSA PROVA, eseguendo `getMetriche` vero contro un finto database:
//   ① con dentro una riga con la data illeggibile e una con la data a null, la Cabina resta
//      collegata e i numeri escono;
//   ② le righe buone si contano lo stesso: una data storta toglie quella riga, non tutte.
//
// NON-VACUITA' (eseguita il 3/9/2026): rimettendo `romeFmt.format(new Date(iso)) === oggi` senza
// il controllo, tutti e due i casi diventano rossi con «connected: false — Invalid time value».

import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import { join, dirname } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SRC = join(REPO, "pannello/src");
registerHooks({
  resolve(spec, ctx, next) {
    if (spec === "next/server") return { url: "data:text/javascript,export const NextResponse = { json: (o) => o };", shortCircuit: true };
    if (spec === "next/headers") return { url: "data:text/javascript,export const cookies = async () => ({ get: () => undefined });", shortCircuit: true };
    if (spec.startsWith("@/")) {
      const base = join(SRC, spec.slice(2));
      for (const e of [".ts", ".tsx", "/index.ts", ""]) if (existsSync(base + e)) return { url: pathToFileURL(base + e).href, shortCircuit: true };
    }
    try { return next(spec, ctx); } catch (e) {
      if (e?.code !== "ERR_MODULE_NOT_FOUND" && e?.code !== "ERR_UNSUPPORTED_DIR_IMPORT") throw e;
      for (const x of spec.startsWith(".") ? [".ts", ".tsx", "/index.ts"] : [".js", ".mjs"]) { try { return next(spec + x, ctx); } catch {} }
      throw e;
    }
  },
});
process.env.MARKETPLACE_SUPABASE_URL = "https://finto.supabase.test";
process.env.MARKETPLACE_SUPABASE_KEY = "chiave-finta";
delete process.env.PANNELLO_DEMO;

const { getMetriche } = await import(pathToFileURL(join(SRC, "lib/marketplace-db.ts")).href);

const OGGI = new Date().toISOString();
const COLONNE = {
  orders: ["total_price", "payment_status", "delivery_status", "created_at", "delivered_at", "user_id"],
  profiles: ["role", "created_at"],
  store_reviews: ["rating"],
  abandoned_carts: ["user_id", "cart_data", "cart_total", "last_activity", "recovery_email_sent_at", "recovered", "recovered_at"],
};

function fintoDatabase(dati) {
  globalThis.fetch = async (url) => {
    const u = new URL(String(url));
    const tab = u.pathname.split("/").pop();
    const select = (u.searchParams.get("select") || "").split(",").filter(Boolean);
    const colonne = COLONNE[tab] || [];
    const manca = select.find((c) => !colonne.includes(c));
    if (manca) return new Response(JSON.stringify({ message: `column ${tab}.${manca} does not exist` }), { status: 400, headers: { "content-type": "application/json" } });
    const righe = dati[tab] || [];
    return new Response(JSON.stringify(righe.map((x) => Object.fromEntries(select.map((c) => [c, x[c]])))), { status: 200, headers: { "content-type": "application/json" } });
  };
}

const casi = [];
const prova = async (nome, fn) => {
  try { await fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

await prova("una data illeggibile non fa dire «database non collegato»", async () => {
  fintoDatabase({
    orders: [
      { total_price: 10, payment_status: "PAID", delivery_status: "DELIVERED", created_at: OGGI, delivered_at: OGGI, user_id: "a" },
      { total_price: 20, payment_status: "PAID", delivery_status: "DELIVERED", created_at: "ieri sera", delivered_at: null, user_id: "b" },
      { total_price: 30, payment_status: "PAID", delivery_status: "DELIVERED", created_at: null, delivered_at: null, user_id: "c" },
    ],
    profiles: [{ role: "buyer", created_at: "quando capita" }],
    store_reviews: [], abandoned_carts: [],
  });
  const m = await getMetriche();
  assert.equal(m.connected, true, `la Cabina si e' spenta per una data storta: error = ${m.error}`);
  assert.equal(m.error, undefined);
});

await prova("una data storta non tira a zero il tempo medio di consegna", async () => {
  // Il revisore l'ha trovato dentro la funzione appena riparata: `t()` su una data illeggibile
  // torna NaN e `Math.max(0, NaN)` fa 0, cioe' una consegna «istantanea» che abbassa la media che
  // Nicola legge. Qui la riga storta ha tutt'e due le date, come quella vera.
  const unOraFa = new Date(Date.now() - 60 * 60000).toISOString();
  fintoDatabase({
    orders: [
      { total_price: 10, payment_status: "PAID", delivery_status: "DELIVERED", created_at: unOraFa, delivered_at: OGGI, user_id: "a" },
      { total_price: 20, payment_status: "PAID", delivery_status: "DELIVERED", created_at: "ieri sera", delivered_at: "stanotte", user_id: "b" },
    ],
    profiles: [], store_reviews: [], abandoned_carts: [],
  });
  const m = await getMetriche();
  assert.equal(m.tempo_consegna_min, 60, `la media deve essere quella dell'unica consegna misurabile, non tirata a zero da una riga storta (uscito ${m.tempo_consegna_min})`);
});

await prova("anche le altre due schermate reggono una data storta", async () => {
  const { getRetention, getPatternOrari } = await import(pathToFileURL(join(SRC, "lib/marketplace-db.ts")).href);
  const storte = {
    orders: [
      { total_price: 10, payment_status: "PAID", delivery_status: "DELIVERED", created_at: "ieri sera", delivered_at: null, user_id: "a" },
      { total_price: 10, payment_status: "PAID", delivery_status: "DELIVERED", created_at: OGGI, delivered_at: OGGI, user_id: "b" },
    ],
    profiles: [], store_reviews: [], abandoned_carts: [],
  };
  fintoDatabase(storte);
  const r = await getRetention();
  assert.notEqual(r.error, "Invalid time value", "la schermata del ritorno dei clienti non deve cadere per una riga storta");
  fintoDatabase(storte);
  const po = await getPatternOrari();
  assert.notEqual(po.error, "Invalid time value", "la schermata delle fasce orarie nemmeno");
});

await prova("le righe buone si contano lo stesso", async () => {
  fintoDatabase({
    orders: [
      { total_price: 10, payment_status: "PAID", delivery_status: "DELIVERED", created_at: OGGI, delivered_at: OGGI, user_id: "a" },
      { total_price: 20, payment_status: "PAID", delivery_status: "DELIVERED", created_at: "ieri sera", delivered_at: null, user_id: "b" },
    ],
    profiles: [], store_reviews: [], abandoned_carts: [],
  });
  const m = await getMetriche();
  assert.equal(m.ordini_oggi, 1, "una data storta toglie quella riga, non tutte");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
