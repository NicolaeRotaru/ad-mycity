#!/usr/bin/env node
// AR-406 — «Quattro degli otto organi della macchina sono verdi per costante, anche a macchina spenta»
//
// La casella «Stato della macchina — gli 8 organi» calcolava quattro organi così:
//
//     { e: "💡", n: "Cervello", ok: true, nota: "40 senior pronti" }
//     { e: "🛡️", n: "Freni",    ok: true, nota: "attivi"  }
//     { e: "🎛️", n: "Cabina",   ok: true, nota: "attiva"  }
//     { e: "🔁", n: "Apprendimento", ok: true, nota: "lezioni attive" }
//
// Nessuno dei quattro leggeva un dato: erano dichiarazioni, verdi anche a macchina ferma. E gli
// altri quattro, quando la fetch falliva (`.catch(() => {})`, `r.ok` mai guardato), mostravano
// «da collegare» — cioè un problema di configurazione — mentre la verità era «non lo so».
//
// La causa di sistema, scritta nella scheda: nel Pannello un indicatore può nascere senza dichiarare
// la sua fonte. La cura è strutturale: `organo()` in pannello/src/lib/verdetto-dato.ts pretende
// FONTE + LETTURA RIUSCITA + MISURA. Qui la si esegue sui casi veri, compreso quello che il difetto
// descrive: macchina spenta, nessuna risposta → nessun organo può essere verde.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const leggi = (f) => readFileSync(join(REPO, f), "utf8");
const soloCodice = (f) =>
  leggi(f)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((r) => !/^\s*(\/\/|\{?\/\*)/.test(r))
    .join("\n");

const casi = [];
const prova = (nome, fn) => casi.push({ nome, fn });

const M = await import(join(REPO, "pannello/src/lib/verdetto-dato.ts"));

const fintaFetch = (come) => async () => {
  if (come.lancia) throw new Error(come.lancia);
  return { ok: (come.status || 200) < 400, status: come.status || 200, json: async () => come.corpo };
};

// ── il caso che ha rotto ─────────────────────────────────────────────────────
prova("il caso che ha rotto: a macchina spenta NESSUN organo può essere verde", async () => {
  // Macchina ferma = le rotte non rispondono. Prima: quattro ✅ per costante e quattro «da collegare».
  const morta = await M.leggiDato("/api/cuore", { estrai: (b) => b, eVuoto: () => false }, fintaFetch({ lancia: "ECONNREFUSED" }));
  const organi = [
    M.organo({ fonte: "/api/cuore · collegato", lettura: morta.verdetto, misura: morta.dato ? true : null }),
    M.organo({ fonte: "/api/cuore · vivo", lettura: morta.verdetto, misura: morta.dato ? true : null }),
    M.organo({ fonte: "", lettura: morta.verdetto }), // Freni: nessun sensore
    M.organo({ fonte: "risposta delle API del Pannello", lettura: morta.verdetto, misura: morta.verdetto.misurato }),
  ];
  for (const o of organi) {
    assert.notEqual(o.stato, "acceso", "verde su una macchina che non risponde è la bugia del difetto");
    assert.equal(o.icona, "⚪");
    assert.equal(o.semaforo, "grigio");
  }
});

prova("una lettura cieca NON diventa «da collegare»: quello è un problema di configurazione", async () => {
  const r = await M.leggiDato("/api/metriche", { estrai: (b) => b, eVuoto: () => false }, fintaFetch({ status: 502, corpo: {} }));
  const o = M.organo({ fonte: "/api/metriche · marketplace_collegato", lettura: r.verdetto, misura: null, notaSpento: "da collegare" });
  assert.equal(o.stato, "non-misurato");
  assert.doesNotMatch(o.nota, /da collegare/, "«da collegare» dice che SO che manca: qui non so niente");
  assert.match(o.nota, /non lo so/i);
});

prova("un organo senza fonte dichiarata non può essere verde, nemmeno con una lettura riuscita", () => {
  const letta = M.verdettoLettura({ esito: { tipo: "risposta", ok: true, status: 200 }, corpo: { x: 1 }, estrai: (c) => c }).verdetto;
  const o = M.organo({ fonte: "", lettura: letta, misura: true, notaAcceso: "attivi" });
  assert.equal(o.stato, "non-misurato", "è il buco di sistema: un pallino nato senza dichiarare da dove viene");
  assert.equal(o.icona, "⚪");
});

prova("lettura riuscita ma sensore assente → grigio, non verde", () => {
  const letta = M.verdettoLettura({ esito: { tipo: "risposta", ok: true, status: 200 }, corpo: { x: 1 }, estrai: (c) => c }).verdetto;
  const o = M.organo({ fonte: "/api/cuore · qualcosa", lettura: letta, misura: null });
  assert.equal(o.stato, "non-misurato");
  assert.match(o.nota, /non misurato/);
});

prova("e quando il dato c'è per davvero: verde se acceso, giallo se spento", () => {
  const letta = M.verdettoLettura({ esito: { tipo: "risposta", ok: true, status: 200 }, corpo: { vivo: true }, estrai: (c) => c }).verdetto;
  const acceso = M.organo({ fonte: "/api/cuore · vivo", lettura: letta, misura: true, notaAcceso: "batte" });
  assert.equal(acceso.stato, "acceso");
  assert.equal(acceso.icona, "✅");
  assert.equal(acceso.nota, "batte");
  const spento = M.organo({ fonte: "/api/cuore · vivo", lettura: letta, misura: false, notaSpento: "non ancora battuto" });
  assert.equal(spento.stato, "spento");
  assert.equal(spento.icona, "🟡");
});

prova("`migliore`: basta una lettura riuscita perché la Cabina risulti misurata", () => {
  const cieco = M.verdettoLettura({ esito: { tipo: "rete", messaggio: "giù" }, estrai: (c) => c }).verdetto;
  const ok = M.verdettoLettura({ esito: { tipo: "risposta", ok: true, status: 200 }, corpo: { a: 1 }, estrai: (c) => c }).verdetto;
  assert.equal(M.migliore(cieco, ok).misurato, true);
  assert.equal(M.migliore(cieco, cieco).misurato, false);
  assert.equal(M.migliore().misurato, false, "senza letture non si è verdi per default");
});

// ── il cablaggio: la costante non può più rientrare ──────────────────────────
prova("nel componente non è rimasto nessun `ok: true` scritto a mano", () => {
  const src = soloCodice("pannello/src/components/StatoMacchina.tsx");
  assert.doesNotMatch(src, /\bok:\s*true\b/, "era esattamente la forma del difetto");
  assert.doesNotMatch(src, /\.catch\(\(\) => \{\}\)/, "e le due fetch non ingoiano più l'errore");
  assert.doesNotMatch(src, /fetch\("\/api\//, "le letture passano dal confine unico");
});

prova("tutti e otto gli organi passano da `organo()` e dichiarano una fonte", () => {
  const src = soloCodice("pannello/src/components/StatoMacchina.tsx");
  const nomi = ["Sensi", "Memoria", "Cervello", "Battito", "Mani", "Freni", "Cabina", "Apprendimento"];
  for (const n of nomi) assert.ok(src.includes(`n: "${n}"`), `manca l'organo ${n}`);
  assert.equal((src.match(/o: organo\(\{/g) || []).length, 8, "ogni organo dev'essere costruito dalla funzione con le regole");
  assert.equal((src.match(/fonte: /g) || []).length, 8, "ogni pallino dichiara la sua fonte (anche quando è vuota = non misurato)");
  // Il Cervello aveva «40 senior pronti» stampato a prescindere: adesso viene da un sensore vero.
  assert.match(src, /utilizzo-senior/, "il Cervello deve leggere gli esiti reali dei senior");
});

prova("la decisione sta nel modulo, non nel componente", () => {
  const src = leggi("pannello/src/components/StatoMacchina.tsx");
  assert.match(src, /from "@\/lib\/verdetto-dato"/);
  assert.doesNotMatch(src, /export function organo/, "la regola non si riscrive dentro la schermata");
});

let falliti = 0;
for (const c of casi) {
  try {
    await c.fn();
    console.log(`  ok - ${c.nome}`);
  } catch (e) {
    falliti++;
    console.log(`not ok - ${c.nome}\n      ${(e.message || String(e)).split("\n")[0]}`);
  }
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
