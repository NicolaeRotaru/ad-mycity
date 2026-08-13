#!/usr/bin/env node
// 🧪 AR-363 · AR-364 — UNA MISURA CHE NON SCADE MAI RACCONTA IERI COME SE FOSSE ADESSO.
//
// Nel modello dati un sensore aveva uno STATO e nessuna data di scadenza. Conseguenza: «non misurato
// da 36 ore» e «misurato adesso e va bene» erano lo stesso identico valore per ogni consumatore.
// Due facce dello stesso difetto, misurate il 29/7:
//
//   AR-363 — nessuno guardava mai da quanto tempo i sensori avevano scritto «tutto a posto». Il
//     registro nasce dentro il giro, dove era sempre appena riscritto; ma la sentinella lo legge da
//     un timer PROPRIO, che gira anche quando il giro è morto. Cioè nel guasto peggiore — la macchina
//     ferma — la sentinella leggeva la fotografia di ieri e non suonava.
//   AR-364 — i due sensori MCP li dichiara l'AD a mano, e il ramo di ripiego era condizionato
//     all'ASSENZA della voce invece che alla sua ETÀ: due sensori risultavano «accesi» da undici
//     giorni senza che nessuno li avesse più provati, e contavano come occhi aperti.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { valutaRegole } = await import(join(REPO, "cervello", "sentinella-dati.mjs"));
const { decadiAutoDichiarato } = await import(join(REPO, "cervello", "lib-sensori-verdetto.mjs"));
const { misuraScaduta } = await import(join(REPO, "cervello", "misura-o-cieco.mjs"));

/** Lo stato letto dalla sentinella, con tutto spento tranne ciò che serve alla regola in prova. */
const statoBase = {
  worker_eta_min: null, lavori_in_corso: 0, sensori_max_ciechi: 0,
  sensori_eta_min: null, sensori_stantii: false,
  salute_voto: null, salute_firma: null, radiografia_ore: null, volano_tasso: null,
  runway_mesi: null, cassa_giri_sconosciuta: 0, pagati_senza_payout: 0,
  ordini_oggi: null, ordini_media: null, recensioni_basse: [], negozi_fermi: [], carrelli: [],
};
const chiavi = (s) => valutaRegole({ ...statoBase, ...s }, { regole: {} }).map((e) => e.chiave);

// ── AR-363 · la sentinella ───────────────────────────────────────────────────

test("registro dei sensori fermo da ore → la sentinella suona", () => {
  const e = valutaRegole({ ...statoBase, sensori_stantii: true, sensori_eta_min: 36 * 60 }, { regole: {} });
  const ev = e.find((x) => x.chiave === "sensori_stantii");
  assert.ok(ev, "prima non c'era nessuna regola per questo caso: il silenzio arrivava nel guasto peggiore");
  assert.equal(ev.colore, "🔴");
  assert.match(ev.titolo, /36 ore/, "il titolo deve dire da quanto, non «c'è un problema»");
});

test("registro fresco → silenzio (una sentinella che suona sempre viene spenta)", () => {
  assert.ok(!chiavi({ sensori_stantii: false, sensori_eta_min: 20 }).includes("sensori_stantii"));
});

test("registro mai scritto → nessuna accusa: è un'altra storia", () => {
  assert.ok(!chiavi({ sensori_stantii: false, sensori_eta_min: null }).includes("sensori_stantii"));
});

test("la firma è la FASCIA d'età, non i minuti: coi minuti il dedup non scatterebbe mai", () => {
  const firma = (min) => valutaRegole({ ...statoBase, sensori_stantii: true, sensori_eta_min: min }, { regole: {} }).find((x) => x.chiave === "sensori_stantii").firma;
  assert.equal(firma(4 * 60), firma(5 * 60), "quattro e cinque ore stanno nella stessa fascia: una sola sveglia");
  assert.notEqual(firma(4 * 60), firma(30 * 60), "un giorno intero è un'altra notizia: quella si ridà");
  // È l'errore già pagato da M2 e da cassa_sconosciuta (AR-114): 39 riaccodamenti in 5 giorni.
  assert.doesNotMatch(String(firma(37 * 60)), /^\d+$/, "una firma numerica cambierebbe a ogni tick");
});

test("la regola nuova non ha spento quelle vecchie", () => {
  assert.ok(chiavi({ worker_eta_min: 99, lavori_in_corso: 0 }).includes("worker_morto"));
  assert.ok(chiavi({ sensori_max_ciechi: 5 }).includes("sensori_ciechi"));
});

// ── AR-364 · il sensore auto-dichiarato ──────────────────────────────────────

const scaduta12h = (q) => misuraScaduta(q, 720, new Date("2026-08-13T20:00:00Z"));

test("un «ok» dichiarato ore fa resta valido", () => {
  const d = decadiAutoDichiarato({ stato: "ok", ultimo_ok: "2026-08-13 18:00" }, scaduta12h, "--mcp-supabase=ok");
  assert.equal(d.decaduto, false);
  assert.equal(d.voce.stato, "ok");
});

test("un «ok» dichiarato undici giorni fa NON è più un occhio aperto", () => {
  const d = decadiAutoDichiarato({ stato: "ok", ultimo_ok: "2026-08-02 22:00" }, scaduta12h, "--mcp-supabase=ok");
  assert.equal(d.decaduto, true, "è il caso misurato: due sensori accesi da undici giorni, mai più provati");
  assert.equal(d.voce.stato, "non_verificato");
  assert.match(d.voce.dettaglio, /ridichiaralo con --mcp-supabase=ok/, "chi legge deve sapere come riaccenderlo");
});

test("un «ok» SENZA timbro non si può dimostrare fresco: decade", () => {
  const d = decadiAutoDichiarato({ stato: "ok" }, scaduta12h, "--mcp-supabase=ok");
  assert.equal(d.decaduto, true, "fail-closed: senza data l'ok resterebbe vero per sempre");
});

test("una voce che non c'è nasce «non verificato», non «ok»", () => {
  const d = decadiAutoDichiarato(null, scaduta12h, "--mcp-stripe=ok|cieco");
  assert.equal(d.voce.stato, "non_verificato");
  assert.match(d.voce.dettaglio, /--mcp-stripe=ok\|cieco/);
});

test("uno stato già cieco non viene toccato: la decadenza riguarda solo l'ok auto-dichiarato", () => {
  const cieco = { stato: "cieco", giri_ciechi: 4, ultimo_ok: "2026-01-01 00:00" };
  assert.deepEqual(decadiAutoDichiarato(cieco, scaduta12h, "x").voce, cieco);
});

test("il punto che chiama: entrambi i sensori MCP passano dalla decadenza", async () => {
  const { readFileSync } = await import("node:fs");
  const src = readFileSync(join(REPO, "cervello", "verifica-sensori.mjs"), "utf8");
  for (const s of ["mcp_supabase", "mcp_stripe"]) {
    assert.match(
      src,
      new RegExp(`decadiAutoDichiarato\\(cecita\\.sensori\\.${s}`),
      `${s} deve passare dalla decadenza: senza, il suo ok resta vero per sempre`,
    );
  }
  // Il ramo di ripiego non deve tornare a guardare l'ASSENZA della voce invece della sua ETÀ.
  // Si guarda il CODICE, non i commenti: il commento che racconta il difetto contiene la riga malata,
  // e cercarla nel file intero renderebbe questa prova rossa per il motivo sbagliato.
  const codice = src
    .split("\n")
    .filter((r) => !/^\s*(\/\/|\*|\/\*)/.test(r))
    .join("\n");
  assert.doesNotMatch(codice, /else if \(!cecita\.sensori\.mcp_supabase\)/, "il ramo condizionato all'ASSENZA non deve tornare");
});
