#!/usr/bin/env node
// AR-172 — l'unico centro dell'AD è aver previsto che un numero fermo restasse fermo.
//
// Il filtro anti-banalità leggeva le PAROLE: cercava «invariati», «status quo», «numeri fermi» nel
// testo dell'azione. Su 42 voci ne ha riconosciute 3. Il resto passava, perché una previsione può
// essere banale senza dirlo: basta che l'atteso sia il numero che c'era già.
//
// Il campo che mancava è uno solo — `baseline`, il valore della metrica QUANDO si apre la previsione.
// Misurato il 28/7: **42 voci su 42 non ce l'hanno.** Senza, «prevedo 0 ordini» e «prevedo che gli
// zero ordini restino zero» sono la stessa riga.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { ESCLUSA, banale, contaNelPunteggio } from "../previsione-verificabile.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

prova("il caso che ha rotto: atteso uguale alla baseline è banale, comunque sia scritto", () => {
  // Nessuna delle parole-spia compare: solo i numeri lo dicono.
  const voce = { azione: "spinta commerciale sui negozi", atteso: 0, baseline: 0, stato: "azzeccata", sensore_stato: "ok" };
  assert.equal(banale(voce), true);
  assert.ok(contaNelPunteggio(voce).motivi.includes(ESCLUSA.BANALE));
});

prova("una previsione vera resta vera: atteso diverso dalla baseline conta", () => {
  const voce = { atteso: 1, baseline: 0, stato: "azzeccata", sensore_stato: "ok", entro: "2099-01-01", creato: "2026-07-01", chiuso_il: "2026-07-05" };
  assert.equal(banale(voce), false);
  assert.equal(contaNelPunteggio(voce).conta, true, JSON.stringify(contaNelPunteggio(voce).motivi));
});

prova("la marcatura vecchia a mano non si butta via", () => {
  // `banale: true` è informazione vera, scritta da chi guardava. Sostituirla con «ora decido io dai
  // dati» perderebbe il giudizio umano sulle 3 voci che ce l'hanno.
  assert.equal(banale({ banale: true, atteso: 5, baseline: 0 }), true);
});

prova("senza baseline NON si indovina la banalità", () => {
  // Al buio non si dà la risposta comoda: dichiarare banale una voce che non lo è la toglierebbe dal
  // punteggio senza motivo, e dichiararla non-banale la farebbe contare senza prova. Si dice «non lo so»
  // restando fuori dal giudizio, e ci pensa l'invariante a pretendere il campo sulle voci nuove.
  assert.equal(banale({ atteso: 0 }), false, "senza baseline il giudizio di banalità non si esprime");
  assert.equal(banale({ atteso: 0, baseline: null }), false);
});

prova("il comando VERO accetta e conserva la baseline, ed avverte se è uguale all'atteso", () => {
  // `calibrazione.mjs` scrive su un percorso fisso, quindi la prova salva il file prima e lo rimette
  // identico dopo — byte per byte. Un test che lascia spazzatura nel registro vero sporcherebbe
  // proprio il dato che questo lotto sta cercando di rendere onesto.
  const P = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json");
  const prima = readFileSync(P, "utf8");
  try {
    const bin = join(REPO, "cervello/calibrazione.mjs");
    let out = "";
    try {
      out = execFileSync("node", [bin, "prevedi", "--reparto=@prova-baseline", "--azione=prova", "--metrica=ordini", "--atteso=0", "--baseline=0", "--entro=2099-01-01", "--id=CAL-PROVA-BANALE"], { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    } catch (e) { out = `${e.stdout || ""}${e.stderr || ""}`; }
    assert.match(out, /fermo resti fermo|baseline/i, "deve avvisare che sta prevedendo lo status quo");
    const scritta = JSON.parse(readFileSync(P, "utf8")).registro.find((e) => e.id === "CAL-PROVA-BANALE");
    assert.ok(scritta, "la previsione dev'essere stata scritta");
    assert.equal(scritta.baseline, 0, "la baseline dev'essere finita nella voce, non solo nell'avviso");
  } finally {
    writeFileSync(P, prima);
  }
});

prova("il registro vero non ha baseline: è la misura che ha aperto il difetto", () => {
  const j = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json"), "utf8"));
  const storiche = j.registro.filter((e) => e.creato && String(e.creato).slice(0, 10) < "2026-07-28");
  const senza = storiche.filter((e) => e.baseline == null).length;
  assert.equal(senza, storiche.length, "lo storico non si riscrive: resta senza baseline, dichiarato");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
