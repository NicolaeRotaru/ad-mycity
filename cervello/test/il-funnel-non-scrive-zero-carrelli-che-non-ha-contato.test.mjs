#!/usr/bin/env node
// AR-903 — LO ZERO CHE NON E' UNO ZERO, e la prova che se ne accorge davvero.
//
// Il 3/9/2026 abbiamo tolto dalla Cabina un numero falso: la lettura dei carrelli abbandonati
// chiedeva `created_at`, colonna che nel sito non esiste, e PostgREST rifiutava la richiesta
// intera. La lista vuota diventava «0 carrelli abbandonati» in grassetto, e Nicola su quel numero
// decideva. Riparata una schermata, la revisione ha trovato la stessa malattia viva nell'altra
// (`/api/metriche/funnel`) e, dopo la seconda riparazione, ANCHE sui numeri degli ordini.
//
// ⚠️ LA PRIMA VERSIONE DI QUESTA PROVA ERA VACUA, e non l'ho scoperto rileggendola. Cercava le
// parole del fix dentro il sorgente della rotta: un revisore ha cambiato UNA riga — `: null`
// diventato `: 0` sul numero dei soldi — e la prova ha risposto 8 verdi su 8, compreso il caso
// che si chiama «anche gli ordini dicono non lo so invece di zero». Adesso la rotta si ESEGUE
// contro un finto database, come fa la prova sorella dei carrelli.
//
// COSA PROVA, eseguendo `GET` della rotta vera:
//   ① lettura riuscita: i carrelli si contano sui sette giorni veri, e un carrello RECUPERATO non
//      conta come abbandonato (l'altra schermata lo scarta gia': due schermate che contano la
//      stessa cosa in due modi sono peggio di una sola);
//   ② una data assente o illeggibile non fa cadere la rotta;
//   ③ lettura dei carrelli fallita: il numero e' `null`, non 0, e `carrelli_misurati` e' falso;
//   ④ lettura degli ordini fallita: i passi del funnel non entrano come zero, e `ordini_misurati`
//      e' falso.
//
// NON-VACUITA' (eseguita il 3/9/2026): rimettendo `: 0` al posto di `: null` sugli ordini, il caso
// ④ diventa rosso; togliendo `recovered === true` dal filtro, il caso ① diventa rosso.

import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import { join, dirname } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SRC = join(REPO, "pannello/src");
const NEXT_SERVER = "data:text/javascript,export const NextResponse = { json: (o) => o };";
const NEXT_HEADERS = "data:text/javascript,export const cookies = async () => ({ get: () => undefined });";

// Il Pannello e' un'app Next: qui si sostituiscono le due porte che non esistono fuori da Next,
// e si risolvono gli alias `@/`. Il resto della rotta gira per davvero.
registerHooks({
  resolve(spec, ctx, next) {
    if (spec === "next/server") return { url: NEXT_SERVER, shortCircuit: true };
    if (spec === "next/headers") return { url: NEXT_HEADERS, shortCircuit: true };
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
delete process.env.POSTHOG_HOST; delete process.env.POSTHOG_PROJECT_ID; delete process.env.POSTHOG_API_KEY;

const { GET } = await import(pathToFileURL(join(SRC, "app/api/metriche/funnel/route.ts")).href);

const OGGI = new Date().toISOString();
const VENTI = new Date(Date.now() - 20 * 86400000).toISOString();
const COL_CARRELLI = ["user_id", "cart_data", "cart_total", "last_activity", "recovery_email_sent_at", "recovered", "recovered_at"];
const COL_ORDINI = ["total_price", "payment_status", "delivery_status", "created_at", "delivered_at", "user_id"];
const r400 = (m) => new Response(JSON.stringify({ message: m }), { status: 400, headers: { "content-type": "application/json" } });

function fintoDatabase({ carrelli = [], ordini = [], carrelliRotti = false, ordiniRotti = false }) {
  globalThis.fetch = async (url) => {
    const u = new URL(String(url));
    const tab = u.pathname.split("/").pop();
    const select = (u.searchParams.get("select") || "").split(",").filter(Boolean);
    if (tab === "abandoned_carts" && carrelliRotti) return r400("permission denied");
    if (tab === "orders" && ordiniRotti) return r400("permission denied");
    // Come il PostgREST vero: se UNA colonna non esiste, rifiuta tutta la richiesta.
    const colonne = { orders: COL_ORDINI, abandoned_carts: COL_CARRELLI }[tab] || [];
    const manca = select.find((c) => !colonne.includes(c));
    if (manca) return r400(`column ${tab}.${manca} does not exist`);
    const dati = { orders: ordini, abandoned_carts: carrelli }[tab] || [];
    return new Response(JSON.stringify(dati.map((x) => Object.fromEntries(select.map((c) => [c, x[c]])))), { status: 200, headers: { "content-type": "application/json" } });
  };
}

const CARRELLI = [
  { user_id: "a", recovered: false, last_activity: OGGI },        // abbandonato, dentro i sette giorni
  { user_id: "b", recovered: false, last_activity: VENTI },       // abbandonato, ma fuori dalla finestra
  { user_id: "c", recovered: true, last_activity: OGGI },         // RECUPERATO: e' tornato e ha comprato
  { user_id: "d", recovered: false, last_activity: null },        // data assente
  { user_id: "e", recovered: false, last_activity: "ieri sera" }, // data illeggibile
];
const ORDINI = [
  { payment_status: "PAID", created_at: OGGI },
  { payment_status: "PENDING", created_at: OGGI },
  { payment_status: "FAILED", created_at: OGGI },
];

const casi = [];
const prova = async (nome, fn) => {
  try { await fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

await prova("un carrello recuperato non conta come abbandonato, e la finestra e' di sette giorni", async () => {
  fintoDatabase({ carrelli: CARRELLI, ordini: ORDINI });
  const f = await GET();
  assert.equal(f.carrelli_abbandonati_7g, 1, "dentro i sette giorni e non recuperato ce n'e' UNO: il recuperato e' tornato a comprare");
  assert.equal(f.carrelli_misurati, true);
});

await prova("una data assente o illeggibile non fa cadere la rotta", async () => {
  fintoDatabase({ carrelli: [{ user_id: "x", recovered: false, last_activity: "ieri sera" }], ordini: ORDINI });
  const f = await GET();
  assert.equal(f.collegato, true, "una riga storta non deve spegnere la schermata");
  assert.equal(f.carrelli_abbandonati_7g, 0);
});

await prova("carrelli non letti: il numero e' «non lo so», non zero", async () => {
  fintoDatabase({ carrelli: CARRELLI, ordini: ORDINI, carrelliRotti: true });
  const f = await GET();
  assert.equal(f.carrelli_abbandonati_7g, null, "«nessuno lascia il carrello» e «non l'ho misurato» sono due notizie opposte");
  assert.equal(f.carrelli_misurati, false);
});

await prova("ordini non letti: i passi non entrano come zero", async () => {
  fintoDatabase({ carrelli: CARRELLI, ordini: ORDINI, ordiniRotti: true });
  const f = await GET();
  assert.equal(f.ordini_misurati, false, "la rotta deve dichiarare che non ha misurato gli ordini");
  const passi = (f.steps || []).map((s) => s.nome);
  assert.ok(!passi.includes("Ordini pagati"), `«Ordini pagati 0 · 0%» sarebbe un numero falso sui soldi: passi trovati ${JSON.stringify(passi)}`);
  assert.ok(!passi.includes("Ordini avviati"));
});

await prova("con gli ordini letti i passi ci sono, e il conto e' quello vero", async () => {
  fintoDatabase({ carrelli: CARRELLI, ordini: ORDINI });
  const f = await GET();
  const pagati = (f.steps || []).find((s) => s.nome === "Ordini pagati");
  const avviati = (f.steps || []).find((s) => s.nome === "Ordini avviati");
  assert.equal(avviati?.valore, 2, "due ordini non falliti");
  assert.equal(pagati?.valore, 1, "uno pagato");
  assert.equal(f.ordini_misurati, true);
});

await prova("la Cabina non scrive un numero che non ha", async () => {
  const { readFileSync } = await import("node:fs");
  const cabina = readFileSync(join(REPO, "pannello/src/components/NumeriReport.tsx"), "utf8");
  assert.match(cabina, /carrelli_abbandonati_7g \?\? "—"/, "sull'assenza di numero si disegna un trattino");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
