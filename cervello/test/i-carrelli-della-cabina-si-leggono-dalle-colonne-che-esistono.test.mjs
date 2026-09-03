#!/usr/bin/env node
// 🛒 LA MALATTIA: la Cabina chiedeva al sito una colonna che nel sito non esiste,
// e mostrava a Nicola lo zero che ne usciva.
//
// `pannello/src/lib/marketplace-db.ts` leggeva `abandoned_carts` chiedendo
// `created_at`. Quella colonna non c'e' mai stata: la tabella nasce (migrazione 027 del
// sito) con user_id, cart_data, cart_total, last_activity, recovery_email_sent_at,
// recovered — e la 148 aggiunge recovered_at. PostgREST, quando una colonna non esiste,
// rifiuta la richiesta INTERA: non ne toglie una, rifiuta tutto. Nei registri di
// produzione delle ultime 24 ore: 1.792 errori «column abandoned_carts.created_at does
// not exist».
//
// Il pezzo grave non e' l'errore: e' cosa arrivava agli occhi. La lista vuota diventava
// «0 carrelli abbandonati», un numero, in una Cabina dove i numeri si guardano per
// decidere. «Nessuno lascia il carrello» e «non l'ho misurato» sono due notizie opposte.
//
// COME SI PROVA. Non si cerca una parola nel codice: si mette davanti alla funzione VERA
// un finto PostgREST che si comporta come quello di produzione — conosce le colonne che
// esistono e rifiuta con 400 chi ne chiede una che non c'e'. Poi si guarda cosa esce da
// `getMetriche()`. Se il codice torna a chiedere una colonna inventata, il finto server
// la rifiuta e il caso cade da solo.
//
// Copre: dati-analytics | il pannello dell'ad interroga colonne che nel sito non esistono.
//
// Si esegue con: node cervello/test/i-carrelli-della-cabina-si-leggono-dalle-colonne-che-esistono.test.mjs

import { registerHooks } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SRC = join(REPO, "pannello/src");

// Il Pannello e' un'applicazione Next e qui Next non e' installato (in questo repo non
// c'e' `node_modules`). L'unica cosa che serve davvero e' `cookies()`, che il Pannello usa
// per sapere se la modalita' dimostrativa e' accesa: un barattolo vuoto risponde «spenta»,
// che e' proprio la condizione che vogliamo provare — i numeri veri, non quelli di esempio.
const NEXT_HEADERS_FINTO =
  "data:text/javascript,export const cookies = async () => ({ get: () => undefined });";

registerHooks({
  resolve(spec, ctx, next) {
    if (spec === "next/headers") return { url: NEXT_HEADERS_FINTO, shortCircuit: true };
    if (spec.startsWith("@/")) {
      const base = join(SRC, spec.slice(2));
      for (const e of [".ts", ".tsx", "/index.ts", ""]) {
        if (existsSync(base + e)) return { url: pathToFileURL(base + e).href, shortCircuit: true };
      }
    }
    try {
      return next(spec, ctx);
    } catch (errore) {
      if (errore?.code !== "ERR_MODULE_NOT_FOUND" && errore?.code !== "ERR_UNSUPPORTED_DIR_IMPORT") throw errore;
      for (const x of spec.startsWith(".") ? [".ts", ".tsx", "/index.ts"] : [".js", ".mjs"]) {
        try {
          return next(spec + x, ctx);
        } catch {
          /* provo il prossimo */
        }
      }
      throw errore;
    }
  },
});

// Il Pannello si considera collegato solo con queste due: gliele diamo finte, perche' la
// rete non esce da qui — la intercettiamo tutta qui sotto.
process.env.MARKETPLACE_SUPABASE_URL = "https://finto.supabase.test";
process.env.MARKETPLACE_SUPABASE_KEY = "chiave-finta-di-sola-lettura";

const { getMetriche } = await import(join(REPO, "pannello/src/lib/marketplace-db.ts"));

// ── LO SCHEMA VERO DEL SITO ───────────────────────────────────────────────────────────
// Colonne prese dalle migrazioni del marketplace, non inventate:
//   027_growth_engagement_foundations.sql:184-191 → la tabella `abandoned_carts`
//   148_carrelli_recuperati.sql:32-33            → `recovered_at`, che si applica a mano
const COLONNE_027 = ["user_id", "cart_data", "cart_total", "last_activity", "recovery_email_sent_at", "recovered"];
const COLONNE_148 = [...COLONNE_027, "recovered_at"];

const OGGI = new Date().toISOString();
const VENTI_GIORNI_FA = new Date(Date.now() - 20 * 86400000).toISOString();

/**
 * Il finto PostgREST. Sa quali colonne esistono e si comporta come quello vero:
 * una colonna che non c'e' fa cadere la richiesta INTERA con 400.
 */
function fintoDatabase({ colonneCarrelli, carrelliRotti = false }) {
  const tabelle = {
    orders: [],
    profiles: [],
    store_reviews: [],
    abandoned_carts: [
      { user_id: "a", recovered: false, last_activity: OGGI, recovered_at: null },
      { user_id: "b", recovered: false, last_activity: VENTI_GIORNI_FA, recovered_at: null },
      { user_id: "c", recovered: true, last_activity: VENTI_GIORNI_FA, recovered_at: OGGI },
    ],
  };
  const colonne = {
    orders: ["total_price", "payment_status", "delivery_status", "created_at", "delivered_at", "user_id"],
    profiles: ["role", "created_at", "id", "store_name", "referred_by"],
    store_reviews: ["rating"],
    abandoned_carts: colonneCarrelli,
  };
  const chieste = [];

  globalThis.fetch = async (url) => {
    const u = new URL(String(url));
    const tabella = u.pathname.split("/").pop();
    const select = (u.searchParams.get("select") || "").split(",").filter(Boolean);
    chieste.push({ tabella, select });

    if (tabella === "abandoned_carts" && carrelliRotti) {
      return risposta400("permission denied for table abandoned_carts");
    }
    const mancante = select.find((c) => !(colonne[tabella] || []).includes(c));
    if (mancante) return risposta400(`column ${tabella}.${mancante} does not exist`);

    const righe = (tabelle[tabella] || []).map((r) => Object.fromEntries(select.map((c) => [c, r[c]])));
    return new Response(JSON.stringify(righe), { status: 200, headers: { "content-type": "application/json" } });
  };
  return chieste;
}

function risposta400(messaggio) {
  return new Response(JSON.stringify({ message: messaggio }), {
    status: 400,
    headers: { "content-type": "application/json" },
  });
}

const casi = [];
const prova = async (nome, fn) => {
  try {
    await fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── ① Il difetto, dal lato che lo vede Nicola ─────────────────────────────────────────
await prova("la Cabina conta i carrelli abbandonati invece di mostrare zero", async () => {
  const chieste = fintoDatabase({ colonneCarrelli: COLONNE_148 });
  const m = await getMetriche();
  // Due carrelli non recuperati: uno di oggi, uno di venti giorni fa.
  assert.equal(m.carrelli_oggi, 1, "il carrello lasciato oggi non e stato contato");
  assert.equal(m.carrelli_7g, 1, "sette giorni: solo quello di oggi");
  assert.equal(m.carrelli_30g, 2, "trenta giorni: tutti e due");
  assert.equal(m.carrelli, 2, "il totale dei carrelli ancora aperti");
  // …e la domanda non nomina piu' una colonna inventata.
  const domanda = chieste.find((c) => c.tabella === "abandoned_carts");
  assert.ok(
    !domanda.select.includes("created_at"),
    "la Cabina chiede ancora `created_at`, che in `abandoned_carts` non esiste"
  );
});

await prova("il quando del recupero si legge da recovered_at, non dall ultimo tocco", async () => {
  fintoDatabase({ colonneCarrelli: COLONNE_148 });
  const m = await getMetriche();
  // Il carrello «c» e' stato lasciato venti giorni fa ed e' tornato oggi: conta OGGI.
  assert.equal(m.carrelli_recuperati_oggi, 1, "il recupero di oggi non e stato visto");
  assert.equal(m.carrelli_recuperati_30g, 1);
});

// ── ② La malattia vera: una lettura che non riesce non e' uno zero ────────────────────
await prova("se i carrelli non si riescono a leggere, la Cabina NON dice zero", async () => {
  fintoDatabase({ colonneCarrelli: COLONNE_148, carrelliRotti: true });
  const m = await getMetriche();
  assert.equal(
    m.carrelli_oggi,
    undefined,
    "uno zero qui e una bugia: chi legge decide credendo che nessuno lasci il carrello"
  );
  assert.equal(m.carrelli_7g, undefined);
  assert.equal(m.carrelli_30g, undefined);
  assert.equal(m.carrelli, undefined);
  assert.equal(m.carrelli_recuperati_oggi, undefined);
  // La Cabina disegna "—" quando la casella non c'e': e' il segnale giusto.
  assert.ok(!("carrelli_oggi" in m) || m.carrelli_oggi === undefined);
  // E il resto del cruscotto continua a funzionare: un carrello cieco non spegne gli ordini.
  assert.equal(m.connected, true);
  assert.equal(m.ordini_oggi, 0, "gli ordini si leggono lo stesso");
});

// ── ③ Il database indietro di una migrazione: si perde il quando, non il fatto ────────
await prova("senza la migrazione 148 i carrelli si contano lo stesso", async () => {
  fintoDatabase({ colonneCarrelli: COLONNE_027 });
  const m = await getMetriche();
  assert.equal(m.carrelli_oggi, 1, "la colonna nuova manca, ma i carrelli abbandonati si sanno contare");
  assert.equal(m.carrelli_30g, 2);
  assert.equal(
    m.carrelli_recuperati_oggi,
    undefined,
    "senza recovered_at non si sa QUANDO sono tornati: meglio una casella vuota di un numero preso da un altro campo"
  );
});

await prova("e non si inventa il quando usando l ultimo tocco del carrello", async () => {
  fintoDatabase({ colonneCarrelli: COLONNE_027 });
  const m = await getMetriche();
  // Il carrello «c» ha last_activity di venti giorni fa: se lo si usasse come data di
  // recupero, «recuperati 30g» direbbe 1 e Nicola leggerebbe un numero sbagliato.
  assert.equal(m.carrelli_recuperati_30g, undefined);
});

const rossi = casi.filter((c) => !c.ok);
console.log(`TAP version 13\n1..${casi.length}`);
casi.forEach((c, i) => console.log(`${c.ok ? "ok" : "not ok"} ${i + 1} - ${c.nome}${c.ok ? "" : `\n  # ${c.err}`}`));
console.log(`# pass ${casi.length - rossi.length}`);
console.log(`# fail ${rossi.length}`);
process.exit(rossi.length ? 1 : 0);
