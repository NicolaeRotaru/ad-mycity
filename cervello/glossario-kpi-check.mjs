#!/usr/bin/env node
// 📖 glossario-kpi-check.mjs — ogni numero che il codice consegna come KPI ha la sua riga nel glossario?
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE (AR-962, 15/11/2026)
// ─────────────────────────────────────────────────────────────────────────────
// La lista dei documenti di governo (documenti-di-governo.mjs) dava al glossario dei KPI un'ATTESA
// datata invece di un guardiano: «il controllo giusto confronta i KPI scritti nel codice con quelli
// definiti qui, e quel confronto va costruito». L'attesa è scaduta il 30/9, è stata spostata al 15/11,
// ed è scaduta di nuovo: dalle 01:00 del 15/11 la CI era rossa per tutti. Nicola ha scelto di
// costruire il controllo, non di spostare la data.
//
// La malattia sotto è quella di AR-282 sulla cassa: un KPI nato dentro uno script, con la formula che
// vive solo nel codice e non passa mai da una definizione condivisa. Un numero sbagliato per
// definizione, così, è indistinguibile da un numero giusto.
//
// ─────────────────────────────────────────────────────────────────────────────
// COME MISURA — tre pezzi, e nessuno cerca parole nei file del codice
// ─────────────────────────────────────────────────────────────────────────────
//   ① IL REGISTRO (cervello/kpi-registro.json). Ogni KPI con nome, file e funzione che lo calcola,
//      i campi con cui esce, le vetrine da cui esce, e la riga del glossario che lo definisce. Il
//      legame col glossario è il campo `glossario`, confrontato per UGUAGLIANZA con il termine in
//      grassetto della prima colonna di una tabella del glossario (scorciatoia 22: il legame è un
//      campo apposta, non un prefisso o una frase).
//   ② LE VETRINE. I punti dove il codice consegna i numeri a Nicola. Ognuna si ESEGUE: la rotta vera
//      /api/metriche del Pannello contro un database finto, le metriche della demo, il sensore della
//      cassa senza chiavi. I campi che escono davvero sono l'appiglio strutturale: un campo nuovo
//      aggiunto nel codice compare da solo nell'uscita, senza che nessuno lo dichiari (scorciatoia 1:
//      misura, non chiedere).
//   ③ IL CONFRONTO, in una funzione pura (`verificaGlossarioKpi` in cervello/glossario-kpi.mjs) che la
//      prova esegue su dati finti.
//
// Uscita: 0 = ogni KPI del registro ha la sua riga, e nessun numero esce fuori registro · 1 = no ·
// 2 = cieco (una vetrina non si è potuta eseguire, o registro e glossario non si leggono).
//
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️ COSA NON PROVA, detto una volta qui e ripetuto nel registro
// ─────────────────────────────────────────────────────────────────────────────
// · Che la definizione nel glossario sia GIUSTA. Prova che la riga c'è e non è vuota. Se la formula
//   scritta lì e quella del codice divergono, lo vede una persona, non questo controllo.
// · Le vetrine che il registro non nomina. Il Pannello ha altre rotte di numeri (/api/metriche/funnel,
//   /trend, /retention, /negozi, /payout, /cassa, /unit, /acquisizione, le stelle polari) e il cervello
//   altri script: lì un KPI nuovo non lo vede nessuno. Il perimetro è scritto nel registro, col numero.
// · Un ramo nuovo della rotta acceso da una fonte che il database finto non conosce: quel campo non
//   esce nella prova. I rami di oggi sì, e un campo del registro che smette di uscire è rosso
//   («fantasma»), quindi il banco finto non può accecarsi in silenzio sui rami che conosce.
//
// 🟢 Sola lettura. Nessuna rete: ogni chiamata del codice eseguito passa da un fetch finto, che
// rifiuta qualunque indirizzo non suo. Nessuna scrittura: il sensore della cassa gira senza chiavi,
// e senza chiavi non scrive (AR-281). Nessun effetto all'import: parte solo dalla riga di comando.
//
// Uso:  node cervello/glossario-kpi-check.mjs          · rapporto leggibile
//       node cervello/glossario-kpi-check.mjs --json   · lo stesso, in JSON
// Per le prove: KPI_REGISTRO_FILE, GLOSSARIO_KPI_FILE, KPI_PANNELLO_SRC (una copia di pannello/src).

import { existsSync, readFileSync, realpathSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { DOCUMENTI } from "./documenti-di-governo.mjs";
// La regola sta in un modulo puro: la prova la esegue su dati finti senza far partire questo file.
import { terminiDelGlossario, verificaGlossarioKpi } from "./glossario-kpi.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..");

// ═════════════════════════════════════════════════════════════════════════════
// LE MISURE — quello che tocca il disco e il codice vero. Parte solo dalla riga di comando.
// ═════════════════════════════════════════════════════════════════════════════

const HOST_MARKETPLACE = "https://marketplace.finto.invalid";
const HOST_MEMORIA = "https://memoria.finto.invalid";
const HOST_POSTHOG = "https://posthog.finto.invalid";

/**
 * Il database finto: poche righe, ma una per ogni ramo che la rotta conosce (ordini pagati,
 * consegnati, annullati, rimborsati, con payout; clienti con riordino e con invito; un carrello
 * perso e uno recuperato; un prodotto esaurito e uno mai venduto). Con tutte le fonti collegate,
 * ogni blocco della rotta scrive i suoi campi.
 */
function databaseFinto(adessoMs) {
  const ora = new Date(adessoMs).toISOString();
  const ieri = new Date(adessoMs - 86400000).toISOString();
  const ordine = (id, utente, prezzo, extra) => ({
    id, user_id: utente, seller_id: "n1", total_price: prezzo, payment_status: "PAID", delivery_status: "DELIVERED",
    created_at: ieri, delivered_at: ora, application_fee_cents: prezzo * 12, delivery_fee_cents: 200, payment_method: "card",
    seller_payout_cents: prezzo * 88, payout_status: "paid", payout_at: ora, refunded_amount_cents: 0, cash_collected_cents: 0, ...extra,
  });
  return {
    orders: [
      ordine("o1", "c1", 30),
      ordine("o2", "c1", 20, { created_at: ora, delivery_status: "PENDING", delivered_at: null, payout_status: null, payout_at: null, refunded_amount_cents: 500 }),
      ordine("o3", "c2", 15, { created_at: ora, delivery_status: "CANCELED", delivered_at: null, payout_status: "failed", payout_at: null }),
    ],
    profiles: [
      { id: "c1", role: "buyer", created_at: ora, store_name: null, referred_by: null },
      { id: "c2", role: "buyer", created_at: ora, store_name: null, referred_by: "c1" },
      { id: "n1", role: "seller", created_at: ora, store_name: "Bottega finta", referred_by: null },
    ],
    abandoned_carts: [
      { user_id: "c2", recovered: false, last_activity: ora, recovered_at: null },
      { user_id: "c1", recovered: true, last_activity: ora, recovered_at: ora },
    ],
    store_reviews: [{ store_id: "n1", rating: 5 }],
    products: [
      { id: "p1", name: "Pane", category_id: "k1", status: "active", stock: 0, price: 3 },
      { id: "p2", name: "Focaccia", category_id: "k1", status: "active", stock: 5, price: 4 },
    ],
    order_items: [{ order_id: "o1", product_id: "p1", quantity: 2 }],
    categories: [{ id: "k1", name: "Forno" }],
  };
}

const IMPOSTAZIONI_FINTE = { cassa_attuale: "10000", burn_mensile: "2000", commissione: "12", costo_fisso: "1500", fee_consegna_cliente: "2", costo_consegna: "3" };

/** Il fetch finto: risponde solo ai tre indirizzi finti, e solo in lettura dove si legge. */
function fetchFinto(db, impostazioni) {
  return async (input, init = {}) => {
    const u = new URL(typeof input === "string" ? input : input?.url ?? String(input));
    const metodo = String(init.method || input?.method || "GET").toUpperCase();
    const json = (corpo, status = 200) => new Response(JSON.stringify(corpo), { status, headers: { "content-type": "application/json" } });
    if (u.origin === HOST_MARKETPLACE || u.origin === HOST_MEMORIA) {
      if (metodo !== "GET") return json({ message: "il guardiano legge soltanto" }, 405);
      const tabella = u.pathname.split("/").pop();
      if (u.origin === HOST_MEMORIA) {
        if (tabella !== "impostazioni") return json([]);
        const chiave = String(u.searchParams.get("chiave") || "").replace(/^eq\./, "");
        return json(Object.hasOwn(impostazioni, chiave) ? [{ valore: impostazioni[chiave] }] : []);
      }
      const colonne = String(u.searchParams.get("select") || "").split(",").filter(Boolean);
      return json((db[tabella] || []).map((r) => Object.fromEntries(colonne.map((c) => [c, r[c] ?? null]))));
    }
    if (u.origin === HOST_POSTHOG) return json({ results: [[42]] });
    throw new Error(`rete vietata nel guardiano del glossario: ${u.origin}`);
  };
}

/** Come le prove del Pannello: `@/` porta in pannello/src, e i due moduli di Next si sostituiscono. */
async function montaPannello(src) {
  const { registerHooks } = await import("node:module");
  if (typeof registerHooks !== "function") {
    throw new Error("questo node non ha module.registerHooks (serve il 22.15 o più nuovo): le vetrine del Pannello non si possono eseguire");
  }
  registerHooks({
    resolve(spec, ctx, next) {
      if (spec === "next/server") return { url: "data:text/javascript,export const NextResponse = { json: (o) => o };", shortCircuit: true };
      if (spec === "next/headers") return { url: "data:text/javascript,export const cookies = async () => ({ get: () => undefined });", shortCircuit: true };
      if (spec.startsWith("@/")) {
        const base = join(src, spec.slice(2));
        for (const e of [".ts", ".tsx", "/index.ts", ""]) if (existsSync(base + e)) return { url: pathToFileURL(base + e).href, shortCircuit: true };
      }
      try {
        return next(spec, ctx);
      } catch (e) {
        if (e?.code !== "ERR_MODULE_NOT_FOUND" && e?.code !== "ERR_UNSUPPORTED_DIR_IMPORT") throw e;
        for (const x of spec.startsWith(".") ? [".ts", ".tsx", "/index.ts"] : [".js", ".mjs"]) {
          try {
            return next(spec + x, ctx);
          } catch {}
        }
        throw e;
      }
    },
  });
  // Le env si leggono all'import dei moduli: vanno messe PRIMA. Indirizzi `.invalid`, che non
  // esistono per costruzione, e un fetch che li serve lui.
  process.env.MARKETPLACE_SUPABASE_URL = HOST_MARKETPLACE;
  process.env.MARKETPLACE_SUPABASE_KEY = "chiave-finta";
  process.env.SUPABASE_URL = HOST_MEMORIA;
  process.env.SUPABASE_SERVICE_KEY = "chiave-finta";
  process.env.POSTHOG_HOST = HOST_POSTHOG;
  process.env.POSTHOG_PROJECT_ID = "1";
  process.env.POSTHOG_API_KEY = "chiave-finta";
  delete process.env.PANNELLO_DEMO;
  globalThis.fetch = fetchFinto(databaseFinto(Date.now()), IMPOSTAZIONI_FINTE);
}

/** Quello che arriverebbe a chi chiede: la risposta passa dal JSON, come quella vera. */
const comeJson = (o) => JSON.parse(JSON.stringify(o ?? null));

/**
 * Come si esegue ogni vetrina. La chiave è l'id della vetrina nel registro: una vetrina del registro
 * senza esecutore è cieca, non verde.
 */
const ESECUTORI = {
  async cruscotto({ src }) {
    const rotta = await import(pathToFileURL(join(src, "app/api/metriche/route.ts")).href);
    return comeJson(await rotta.GET());
  },
  async "cruscotto-demo"({ src }) {
    const demo = await import(pathToFileURL(join(src, "lib/demo.ts")).href);
    return comeJson(demo.metricheDemo());
  },
  async "cassa-runway"() {
    // Senza STRIPE_SECRET_KEY il sensore non va in rete e non scrive (AR-281): stampa il documento
    // che scriverebbe. Le tre componenti finte servono a far uscire numeri, non null.
    const r = spawnSync(process.execPath, [join(QUI, "sensore-cassa.mjs"), "--json"], {
      encoding: "utf8",
      env: { PATH: process.env.PATH || "", CASSA_BANCA_EUR: "1000", BURN_MENSILE_EUR: "500", PAYOUT_DOVUTI_EUR: "100" },
      timeout: 60_000,
    });
    if (r.status !== 0 && r.status !== 1) throw new Error(`sensore-cassa uscito ${r.status}: ${(r.stderr || "").split("\n")[0]}`);
    return JSON.parse(r.stdout);
  },
};

const rel = (p) => relative(REPO, p).split(sep).join("/");

/** Il percorso di un modulo del registro: quelli del Pannello seguono la copia, se c'è. */
function percorsoModulo(file, src) {
  const f = String(file).replace(/^\.\//, "");
  return f.startsWith("pannello/src/") ? join(src, f.slice("pannello/src/".length)) : join(REPO, f);
}

async function misura({ registro, src }) {
  const esposti = {};
  let pannelloPronto = null;
  const pannello = async () => {
    if (pannelloPronto === null) {
      try {
        await montaPannello(src);
        pannelloPronto = { ok: true };
      } catch (e) {
        pannelloPronto = { ok: false, perche: e?.message || String(e) };
      }
    }
    return pannelloPronto;
  };
  await pannello(); // prima di ogni import: le env si leggono al caricamento dei moduli

  for (const e of registro.esposizioni || []) {
    const esegui = ESECUTORI[e?.id];
    if (!esegui) {
      esposti[e?.id] = { ok: false, perche: "il guardiano non sa come eseguire questa vetrina: aggiungi il suo esecutore" };
      continue;
    }
    const p = await pannello();
    if (!p.ok && e.id !== "cassa-runway") {
      esposti[e.id] = { ok: false, perche: p.perche };
      continue;
    }
    try {
      const uscita = await esegui({ src });
      esposti[e.id] = uscita && typeof uscita === "object" && !Array.isArray(uscita) ? { ok: true, campi: uscita } : { ok: false, perche: "l'uscita non è un oggetto" };
    } catch (err) {
      esposti[e.id] = { ok: false, perche: `eseguita, ma è andata in errore: ${err?.message || err}` };
    }
  }

  const puntatori = {};
  const moduli = new Map();
  for (const k of registro.kpi || []) {
    if (!k?.file || !k?.funzione) continue;
    const chiave = `${k.file}#${k.funzione}`;
    if (puntatori[chiave]) continue;
    const percorso = percorsoModulo(k.file, src);
    if (!existsSync(percorso)) {
      puntatori[chiave] = { ok: true, esiste: false };
      continue;
    }
    if (/\.tsx?$/.test(percorso) && !(await pannello()).ok) {
      puntatori[chiave] = { ok: false, perche: (await pannello()).perche };
      continue;
    }
    try {
      if (!moduli.has(percorso)) moduli.set(percorso, await import(pathToFileURL(percorso).href));
      puntatori[chiave] = { ok: true, esiste: typeof moduli.get(percorso)[k.funzione] === "function" };
    } catch (err) {
      puntatori[chiave] = { ok: false, perche: `${k.file} non si importa: ${err?.message || err}` };
    }
  }
  return { esposti, puntatori };
}

function stampa(r, file) {
  const testa =
    r.esito === 0 ? "✅ GLOSSARIO DEI KPI: ogni KPI del registro ha la sua riga, e nessun numero esce fuori registro"
    : r.esito === 1 ? `🔴 GLOSSARIO DEI KPI: ${r.problemi.length} problem${r.problemi.length === 1 ? "a" : "i"}`
    : "⚪ GLOSSARIO DEI KPI: cieco — non ho potuto misurare tutto, e questo NON è un verde";
  console.log(testa);
  console.log(`   registro ${file.registro} · glossario ${file.glossario} · ${r.conti.kpi} KPI · ${r.conti.vetrine_misurate} vetrine su ${r.conti.vetrine} · ${r.conti.campi_esposti} campi consegnati · ${r.conti.termini_glossario} righe nel glossario`);
  for (const p of r.problemi) console.log(`   🔴 [${p.tipo}] ${p.messaggio}`);
  for (const c of r.ciechi) console.log(`   ⚪ ${c.dove}: ${c.perche}`);
  if (r.esito === 1) {
    console.log("   Cosa fare: ogni numero che esce va nel registro (cervello/kpi-registro.json) con la sua riga nel glossario;");
    console.log("   la riga nuova del glossario la conferma Nicola. Un campo che non è un numero va fra i non_kpi, col perché.");
  }
}

async function main() {
  const JSON_MODE = process.argv.includes("--json");
  const fileRegistro = process.env.KPI_REGISTRO_FILE || join(QUI, "kpi-registro.json");
  const voce = DOCUMENTI.find((d) => d.id === "glossario-kpi");
  const fileGlossario = process.env.GLOSSARIO_KPI_FILE || join(REPO, voce?.documento || "MyCity-Vault/07-Agenti/GLOSSARIO-KPI.md");
  const src = process.env.KPI_PANNELLO_SRC || join(REPO, "pannello/src");
  const file = { registro: rel(fileRegistro), glossario: rel(fileGlossario), pannello: rel(src) };

  const cieco = (perche) => {
    const r = { esito: 2, problemi: [], ciechi: [{ dove: "ingresso", perche }], conti: { kpi: 0, vetrine: 0, vetrine_misurate: 0, campi_esposti: 0, termini_glossario: 0 } };
    if (JSON_MODE) console.log(JSON.stringify({ ...r, ...file }, null, 2));
    else stampa(r, file);
    process.exit(2);
  };

  let registro;
  try {
    registro = JSON.parse(readFileSync(fileRegistro, "utf8"));
  } catch (e) {
    return cieco(`il registro dei KPI non si legge (${file.registro}): ${e?.message || e}`);
  }
  let testoGlossario;
  try {
    testoGlossario = readFileSync(fileGlossario, "utf8");
  } catch (e) {
    return cieco(`il glossario non si legge (${file.glossario}): ${e?.message || e}`);
  }

  const { esposti, puntatori } = await misura({ registro, src });
  const r = verificaGlossarioKpi({ registro, termini: terminiDelGlossario(testoGlossario), esposti, puntatori, vetrineNote: Object.keys(ESECUTORI) });

  if (JSON_MODE) {
    const campi = Object.fromEntries(Object.entries(esposti).map(([id, m]) => [id, m.ok ? Object.keys(m.campi) : null]));
    console.log(JSON.stringify({ ...r, ...file, campi_consegnati: campi }, null, 2));
  } else {
    stampa(r, file);
  }
  process.exit(r.esito);
}

// Importarlo non deve farlo girare (AR-445), anche lanciato da un collegamento simbolico (AR-965).
function lanciatoDallaRigaDiComando() {
  const arg = process.argv[1];
  if (!arg) return false;
  try {
    return realpathSync(arg) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return import.meta.url === pathToFileURL(arg).href;
  }
}
if (lanciatoDallaRigaDiComando()) {
  // Un errore che nessuno ha previsto è uno strumento rotto, non un KPI senza definizione: esce 2
  // (cieco), non l'1 che node darebbe da solo. Il giro sul 2 dice «ripara lo strumento» (AR-322);
  // sull'1 direbbe al motore una cosa falsa sul contenuto.
  const cieco = (e) => {
    console.error(`⚪ GLOSSARIO DEI KPI: errore imprevisto, quindi cieco e non rosso (AR-322): ${e?.message || e}`);
    process.exit(2);
  };
  process.on("unhandledRejection", cieco);
  main().catch(cieco);
}
