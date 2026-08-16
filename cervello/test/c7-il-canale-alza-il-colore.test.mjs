#!/usr/bin/env node
// LOTTO 44, CORSIA 7 — «roba di casa» non vuol dire «innocua», e un interruttore solo non è una lista.
//
//   ① AR-599 — per la regola dei canali, unire una richiesta su GitHub e scrivere sul catalogo del
//      sito erano roba interna: non alzavano mai il colore. Misurato prima del fix,
//      `autoEseguibile("verde","github")` e `autoEseguibile("verde","marketplace")` rispondevano
//      tutti e due VERO. Sull'atto più irreversibile della macchina restava un solo strato di
//      difesa — il confronto di stringa sulla firma — mentre la regola dei canali, nata apposta per
//      essere il secondo strato, lo dichiarava innocuo.
//   ② AR-600 — il ponte verso WhatsApp, i social e Google si apriva con UN booleano: acceso quello,
//      il controllo del destinatario diceva sì a qualunque numero. Per l'email, che ha un raggio
//      molto più corto, serviva invece l'indirizzo scritto uno per uno.
//
// Si lancia con: node cervello/test/c7-il-canale-alza-il-colore.test.mjs

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const L = await import(join(REPO, "pannello/src/lib/livello-effettivo.ts"));
const R = await import(join(REPO, "pannello/src/lib/rischio-contenuto.ts"));
const C = await import(join(REPO, "cervello/consenso-azione.mjs"));

const casi = [];
const prova = async (nome, fn) => {
  try {
    await fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── ① AR-599 ────────────────────────────────────────────────────────────────

await prova("AR-599: un verde su github o marketplace NON è più auto-eseguibile", () => {
  assert.equal(L.autoEseguibile("verde", "github"), false, "unire una richiesta è l'atto più irreversibile: non può partire da solo");
  assert.equal(L.autoEseguibile("verde", "marketplace"), false, "sul catalogo del sito niente si scrive senza il via di Nicola");
  assert.equal(L.autoEseguibile("verde", "merge PR mycity"), false);
  assert.equal(L.autoEseguibile("verde", "deploy"), false);
});

await prova("AR-599: l'unione di una richiesta vale ROSSO, la scrittura sul sito GIALLO", () => {
  assert.equal(L.minimoDalCanale("github"), "rosso");
  assert.equal(L.minimoDalCanale("marketplace"), "giallo");
  assert.equal(L.livelloEffettivo("verde", "github"), "rosso");
  assert.equal(L.livelloEffettivo("verde", "marketplace"), "giallo");
  // Il verso non è cambiato: si alza soltanto. Un rosso resta rosso anche su un canale di casa.
  assert.equal(L.livelloEffettivo("rosso", "memoria"), "rosso");
});

await prova("AR-599: la memoria e i file restano di casa, o l'autopilota non farebbe più niente", () => {
  assert.equal(L.autoEseguibile("verde", "memoria"), true);
  assert.equal(L.autoEseguibile("verde", "file"), true);
  assert.equal(L.autoEseguibile("verde", "nota"), true);
  assert.equal(L.minimoDalCanale("git"), "verde", "un commit sul ramo di lavoro è roba di casa davvero");
});

await prova("AR-599: un canale mai visto prima non si dà per innocuo", () => {
  assert.equal(L.autoEseguibile("verde", "stripe"), false, "prima cadeva fra i due elenchi e restava verde");
  assert.equal(L.autoEseguibile("verde", ""), false);
});

await prova("AR-599: il filtro sul contenuto adesso vede «unisci» e «in produzione»", () => {
  const a = R.rischioDalContenuto("Fai il merge della PR #12 su mycity");
  assert.equal(a.rischiosa, true);
  assert.ok(a.indicatori.includes("irreversibile"), `indicatori: ${a.indicatori.join(",")}`);
  assert.equal(R.rischioDalContenuto("Manda in produzione la nuova home").rischiosa, true);
  assert.equal(R.rischioDalContenuto("Unisci la richiesta di unione del lotto").rischiosa, true);
  // e non spara addosso a tutto: una nota qualunque resta pulita.
  assert.equal(R.rischioDalContenuto("Aggiorna la nota di analisi del fornaio").rischiosa, false);
});

// ── ② AR-600 ────────────────────────────────────────────────────────────────

await prova("AR-600: il ponte acceso non basta — serve il destinatario scritto per intero", () => {
  const acceso = { n8n: true, n8n_destinatari: ["+390523000001"] };
  assert.equal(C.ammessoPonteN8n(acceso, "+390523000001").ok, true, "quello autorizzato passa");
  assert.equal(C.ammessoPonteN8n(acceso, "+393330000000").ok, false, "prima passava QUALUNQUE numero col ponte acceso");
  assert.equal(C.ammessoPonteN8n(acceso, "").ok, false);
  assert.match(C.ammessoPonteN8n(acceso, "+393330000000").motivo, /n8n_destinatari/);
});

await prova("AR-600: col ponte spento non passa nessuno, nemmeno chi è in lista", () => {
  const spento = { n8n: false, n8n_destinatari: ["+390523000001"] };
  assert.equal(C.ammessoPonteN8n(spento, "+390523000001").ok, false);
  assert.match(C.ammessoPonteN8n(spento, "+390523000001").motivo, /non sbloccato/);
});

await prova("AR-600: la lista è per valore intero — niente prefissi, niente jolly", () => {
  const al = { n8n: true, n8n_destinatari: ["+390523000001"] };
  assert.equal(C.ammessoPonteN8n(al, "+39052300000").ok, false, "un prefisso non è il numero");
  assert.equal(C.ammessoPonteN8n(al, "*").ok, false);
  assert.equal(C.ammessoPonteN8n({ n8n: true, n8n_destinatari: "*" }, "chiunque").ok, false, "una stringa non è una lista");
});

await prova("AR-600: il cancello vero passa di lì — non solo la funzione, la strada", async () => {
  // Il difetto stava nel `case "n8n"` del cancello, non in una funzione a parte: se la funzione
  // fosse giusta e il cancello continuasse a guardare il booleano, il buco resterebbe intero.
  const { mkdtempSync, writeFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(join(tmpdir(), "c7-allow-"));
  const f = join(dir, "mani-allowlist.json");
  writeFileSync(f, JSON.stringify({ n8n: true, n8n_destinatari: ["+390523000001"] }));
  process.env.MANI_ALLOWLIST_FILE = f;
  const M = await import(join(REPO, "cervello/consenso-azione.mjs") + "?ponte-acceso");
  assert.equal(M.destinatarioAmmesso("n8n", "+390523000001").ok, true);
  assert.equal(M.destinatarioAmmesso("n8n", "+393339999999").ok, false, "col ponte acceso passava chiunque");
  delete process.env.MANI_ALLOWLIST_FILE;
});

await prova("AR-600: e n8n non è più fra i canali aperti da un interruttore solo", () => {
  const vero = JSON.parse(readFileSync(join(REPO, "cervello/mani-allowlist.json"), "utf8"));
  assert.ok(!C.interruttoriUnici(vero).includes("n8n"), "n8n ha la sua lista, quindi non conta più come interruttore unico");
  // Il metro non è vuoto: su una allowlist vecchia, n8n acceso e senza lista, deve dire di sì.
  assert.ok(C.interruttoriUnici({ n8n: true }).includes("n8n"));
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
