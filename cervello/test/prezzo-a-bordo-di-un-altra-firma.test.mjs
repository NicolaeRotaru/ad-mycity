#!/usr/bin/env node
// AR-141 — l'approvazione sblocca una TABELLA, e sulla tabella viaggia anche il prezzo.
//
// Il cancello AR-103 verifica «c'è un AZIONE_ID firmato da Nicola + la tabella è in
// mani-allowlist.json». Non verifica che i CAMPI scritti siano quelli della casella approvata. Su
// `products` convivono la descrizione — che la supervisione negozi riempie in automatico — e il
// **prezzo**, che la regola d'oro tiene in 🔴 dedicato.
//
// Misurato il 28/7: `mani-allowlist.json` ha `marketplace_tables: ["products"]`, cioè la tabella col
// prezzo è l'unica sbloccata; e `marketplace.mjs aggiorna <tabella> <id> '<json>'` fa il PATCH di
// qualunque JSON gli passi. Quindi la strada è aperta oggi, non in teoria: Nicola approva «completa
// le descrizioni», e nello stesso PATCH può viaggiare `price`. Nessuno ha mentito — il permesso era
// semplicemente più largo della frase che l'ha ottenuto.
//
// Qui si esegue la decisione su oggetti finti: il cancello non deve dipendere da com'è il DB adesso.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { CAMPI_RISERVATI, FLAG_CAMPO, campiVietati, riservatiDi, sbloccatiDaFlag, scritturaAmmessa } from "../campi-permessi.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

prova("il caso che ha rotto: il prezzo a bordo di un'approvazione per la descrizione", () => {
  const c = scritturaAmmessa("products", { description: "Coppa piacentina DOP, 200g", price: 4.9 });
  assert.equal(c.ammessa, false);
  assert.deepEqual(c.vietati, ["price"]);
  assert.match(c.motivo, /un'approvazione per altro non li sblocca/);
});

prova("la stessa scrittura senza il campo riservato passa", () => {
  const c = scritturaAmmessa("products", { description: "Coppa piacentina DOP, 200g", image_url: "…" });
  assert.equal(c.ammessa, true);
});

prova("si sblocca UN campo alla volta, e va nominato", () => {
  const dati = { price: 4.9, stock: 10 };
  assert.deepEqual(campiVietati("products", dati, { sbloccati: ["price"] }), ["stock"],
    "sbloccare il prezzo non sblocca anche la giacenza");
  assert.deepEqual(campiVietati("products", dati, { sbloccati: ["price", "stock"] }), []);
});

prova("i campi universali valgono su qualunque tabella", () => {
  assert.ok(riservatiDi("coupons").includes("id"));
  assert.deepEqual(campiVietati("coupons", { codice: "X", owner_id: 7 }), ["owner_id"]);
});

prova("i soldi dei negozi sono riservati anche fuori da products", () => {
  assert.deepEqual(campiVietati("vendors", { nome: "Pane Quotidiano", payout_iban: "IT…" }), ["payout_iban"]);
  assert.deepEqual(campiVietati("orders", { note: "citofono rotto", total: 0 }), ["total"]);
  assert.deepEqual(campiVietati("site_settings", { titolo: "MyCity", commission_rate: 0 }), ["commission_rate"]);
});

prova("fail-closed: un corpo che non si riesce a leggere NON passa", () => {
  // «Non ho capito cosa scrivi» non è «puoi scrivere».
  for (const cattivo of [null, undefined, "price=0", 42, [1, 2]]) {
    assert.equal(scritturaAmmessa("products", cattivo).ammessa, false, `${JSON.stringify(cattivo)} doveva essere bloccato`);
  }
});

prova("il messaggio dice cosa fare, non solo che è bloccato", () => {
  const c = scritturaAmmessa("products", { price: 1 });
  assert.match(c.motivo, new RegExp(FLAG_CAMPO), "chi legge deve sapere come sbloccarlo apposta");
  assert.match(c.motivo, /serve comunque la firma di Nicola/, "e che il flag non sostituisce la firma");
});

prova("lo sblocco arriva dall'ambiente del comando, non da un file della macchina", () => {
  // Se arrivasse da un file che la macchina aggiorna, sarebbe di nuovo un permesso che si autoconcede
  // — la malattia di AR-119, spostata di un metro.
  assert.deepEqual(sbloccatiDaFlag({ [FLAG_CAMPO]: "price, stock" }), ["price", "stock"]);
  assert.deepEqual(sbloccatiDaFlag({}), []);
});

// ── L'innesto VERO ──────────────────────────────────────────────────────────

prova("marketplace.mjs passa dal cancello PRIMA di scrivere, sia in inserisci sia in aggiorna", () => {
  const m = readFileSync(join(REPO, "cervello/marketplace.mjs"), "utf8");
  const occorrenze = (m.match(/scritturaAmmessa\(tabella, val/g) || []).length;
  assert.equal(occorrenze, 2, "servono entrambe: `aggiorna` è la pericolosa, ma `inserisci` scrive gli stessi campi");
  for (const fn of ["async function inserisci", "async function aggiorna"]) {
    const i = m.indexOf(fn);
    const corpo = m.slice(i, m.indexOf("\n}", i));
    const iCancello = corpo.indexOf("scritturaAmmessa");
    const iPatch = corpo.search(/method: "(?:PATCH|POST)"/);
    assert.ok(iCancello > 0 && iCancello < iPatch, `${fn}: il cancello dev'essere PRIMA della scrittura`);
  }
});

prova("la tabella col prezzo è davvero quella sbloccata: il rischio non è teorico", () => {
  const al = JSON.parse(readFileSync(join(REPO, "cervello/mani-allowlist.json"), "utf8"));
  assert.ok(Array.isArray(al.marketplace_tables) && al.marketplace_tables.includes("products"),
    "se un giorno products uscisse dall'allowlist, questa prova va aggiornata — non tolta");
  assert.ok(CAMPI_RISERVATI.products.includes("price"), "ed è proprio il prezzo il campo che ci vive accanto");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
