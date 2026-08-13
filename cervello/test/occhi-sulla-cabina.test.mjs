#!/usr/bin/env node
// 👀 GLI OCCHI SULLA CABINA — i due controlli cabina.* non restano più ⚪ per una chiave inutile.
//
// Il difetto, misurato il 12/8 dalla Cabina stessa (badge «cabina: 2 non visti»): ogni sessione
// cloud rispondeva «manca PANNELLO_URL / CABINA_URL in questo ambiente» — ma l'indirizzo del
// Pannello non è un segreto, è la pagina che Nicola apre dal telefono. Ora vive committato in
// cervello/ponte-cabina.json e l'ambiente (PANNELLO_URL/CABINA_URL) vince sempre sul file.
//
// La seconda metà è più insidiosa: negli ambienti cloud l'uscita passa da un proxy con allowlist,
// e un host non ammesso torna come risposta HTTP 403 VERA col corpo «Host not in allowlist» —
// misurato il 13/8. Senza riconoscere la voce del proxy, giudicaCabina direbbe «la Cabina risponde
// 403» ❌: un falso allarme su un servizio sano, che è peggio del ⚪ che stiamo curando.

import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { urlCabina, reteChiusa, giudicaCabina } from "../salute.mjs";

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── urlCabina: da dove arriva l'indirizzo ────────────────────────────────────
prova("l'ambiente vince sempre sul file committato", () => {
  const r = urlCabina({ PANNELLO_URL: "https://altrove.example/" }, "/posto/che/non/esiste");
  assert.equal(r.url, "https://altrove.example", "e la barra finale si toglie");
  assert.equal(r.fonte, "ambiente");
});

prova("senza env si legge il ponte committato", () => {
  const root = mkdtempSync(join(tmpdir(), "ponte-"));
  try {
    mkdirSync(join(root, "cervello"));
    writeFileSync(join(root, "cervello/ponte-cabina.json"), JSON.stringify({ pannello_url: "https://cabina.example/" }));
    const r = urlCabina({}, root);
    assert.equal(r.url, "https://cabina.example");
    assert.equal(r.fonte, "ponte-cabina.json");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

prova("né env né file: null, e il controllo resta ⚪ dichiarato", () => {
  assert.equal(urlCabina({}, "/posto/che/non/esiste"), null);
});

prova("il ponte VERO del repo è leggibile e porta a un https", () => {
  const r = urlCabina({});
  assert.ok(r, "il file cervello/ponte-cabina.json deve esserci nel repo");
  assert.match(r.url, /^https:\/\//, "l'indirizzo della Cabina è pubblico e in https");
});

// ── reteChiusa: la voce del proxy non è la voce della Cabina ─────────────────
prova("il caso misurato il 13/8: HTTP 403 col corpo del proxy = rete chiusa, non Cabina rotta", () => {
  const r = { ok: true, status: 403, ms: 300, testo: "Host not in allowlist: ad-mycity.vercel.app. Add this host to your network egress settings to allow access." };
  assert.equal(reteChiusa(r), true);
});

prova("l'altro caso misurato: CONNECT tunnel 403 come errore di trasporto = rete chiusa", () => {
  assert.equal(reteChiusa({ ok: false, errore: "fetch failed: CONNECT tunnel failed, response 403" }), true);
  assert.equal(reteChiusa({ ok: false, errore: "getaddrinfo ENOTFOUND ad-mycity.vercel.app" }), true);
});

prova("un 403 della Cabina VERA (senza la voce del proxy) resta un guasto da mostrare", () => {
  assert.equal(reteChiusa({ ok: true, status: 403, testo: "Forbidden" }), false);
  const v = giudicaCabina({ ok: true, status: 403, ms: 200, testo: "Forbidden" });
  assert.equal(v.esito, "rotto", "un 403 vero è un rosso, non un ⚪");
});

prova("un 500 o un timeout non sono «rete chiusa»: sono la Cabina che sta male", () => {
  assert.equal(reteChiusa({ ok: true, status: 500, testo: "Internal Server Error" }), false);
  assert.equal(reteChiusa({ ok: false, errore: "nessuna risposta in 8s" }), false);
});

prova("una risposta sana resta sana", () => {
  assert.equal(reteChiusa({ ok: true, status: 200, ms: 120, testo: "<html>" }), false);
  assert.equal(giudicaCabina({ ok: true, status: 200, ms: 120, testo: "" }).esito, "ok");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
