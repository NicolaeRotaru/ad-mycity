#!/usr/bin/env node
// AR-667 e AR-664 — «il cieco venduto per verde»: un guardiano che non ha potuto guardare stampa la
// frase rassicurante invece di dichiararsi cieco.
//
// LA RADICE, la stessa per tutti e due. Nel contratto di casa (AR-322) l'uscita 2 vuol dire NON HO
// POTUTO MISURARE, e non è mai un verde. Ma chi leggeva quell'esito lo interpretava con una regola
// scritta a mano — «è rosso se il codice è 1» — e ogni altro codice, il 2 compreso, cadeva nel ramo
// «ok». La forma generale: *un metro che non misura una strada non la dichiara scoperta, dice verde*.
// Da lì il verde vale zero e nessuno se ne accorge.
//
// COSA PROVA QUESTO FILE, eseguendo la decisione invece di cercarla scritta in un file:
//   ① il 2 è cieco anche quando chi chiama ha dichiarato rosso solo l'1 — cioè il caso esposto;
//   ② un chiamante può STRINGERE (aggiungere codici al rosso e al cieco) ma non far sparire il cieco;
//   ③ un codice sconosciuto (3, 7) non compra il verde: verde è solo lo 0;
//   ④ un guardiano che non è partito, o che non ha restituito un codice, è cieco — non rosso: «non
//      ha risposto» e «ha risposto male» sono due cose diverse, e la prima non l'ho misurata;
//   ⑤ dentro la visita vera (`daGuardiano` di salute.mjs) l'uscita 2 diventa ⚪, non ✅;
//   ⑥ AR-664 — il guardiano delle pause con un registro di forma inattesa esce 2 e dice cosa non ha
//      letto, invece di morire con «TypeError: fatti.map is not a function» e uno stack trace.
//
// NON-VACUITÀ (verificata rompendo il fix apposta):
//   · in `cervello/esito-guardiano.mjs`, spegnendo la riga del cieco di casa
//     (`if (code === CODICE.cieco) return cieco(…)` → `if (false) …`), i casi ① ② ⑤ diventano ROSSI;
//   · in `cervello/pausa-check.mjs`, togliendo il controllo di forma (`if (!Array.isArray(fatti))` →
//     `if (false)`), il caso ⑥ diventa ROSSO — torna lo stack trace e l'uscita 1.

import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CODICE, ciecoPerDatoIllegibile, ciecoSeNienteMisurato, codiceDiUscita, leggiEsito } from "../esito-guardiano.mjs";
import { daGuardiano } from "../salute.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── ① Il caso esposto: rossoSe stretto, e il 2 che passava per verde ─────────

prova("⬇️ il 2 resta cieco anche se chi chiama ha dichiarato rosso solo l'1", () => {
  const v = leggiEsito(2, { rossoSe: (c) => c === 1 });
  assert.equal(v.stato, "cieco", "è il caso di sensori.vista: rossoSe stretto, e ogni altro codice comprava il verde");
  assert.equal(v.codice, CODICE.cieco);
});

prova("il verde si dà solo allo zero, e lo dice", () => {
  const v = leggiEsito(0);
  assert.equal(v.stato, "verde");
  assert.match(v.motivo, /uscito 0/);
});

// ── ② Si può stringere, non si può far sparire il cieco ─────────────────────

prova("⬇️ chi chiama può aggiungere codici al cieco…", () => {
  assert.equal(leggiEsito(7, { ciecoSe: (c) => c === 7 }).stato, "cieco");
});

prova("⬇️ …ma non può togliere il 2 dal cieco dichiarandolo rosso", () => {
  const v = leggiEsito(2, { rossoSe: () => true });
  assert.equal(v.stato, "cieco", "se bastasse una regola del chiamante a coprirlo, il cieco non esisterebbe");
});

prova("una regola del chiamante che esplode non assolve nessuno", () => {
  const v = leggiEsito(0, {
    rossoSe: () => {
      throw new Error("regola rotta");
    },
  });
  assert.equal(v.stato, "verde", "il codice 0 resta verde: quello che non deve succedere è che la regola rotta lo renda tale per caso");
  assert.equal(
    leggiEsito(3, {
      ciecoSe: () => {
        throw new Error("regola rotta");
      },
    }).stato,
    "rosso",
    "una regola che non so applicare non l'ho applicata: il 3 resta rosso di casa",
  );
});

// ── ③ Un codice sconosciuto non compra il verde ─────────────────────────────

prova("⬇️ i codici che nessuno ha previsto sono rossi, non verdi", () => {
  for (const c of [1, 3, 7, 42, 127]) assert.equal(leggiEsito(c).stato, "rosso", `l'uscita ${c} non può valere «tutto a posto»`);
});

// ── ④ Non partito, o senza codice ────────────────────────────────────────────

prova("un guardiano che non è partito è cieco, non rosso", () => {
  const v = leggiEsito(null, { partito: false, motivoNonPartito: "oltre 60s" });
  assert.equal(v.stato, "cieco");
  assert.match(v.motivo, /oltre 60s/, "un cieco senza il perché non si può riparare");
});

prova("un codice che non è un numero è cieco: nessuna risposta è arrivata", () => {
  for (const c of [null, undefined, "0", NaN, 1.5]) assert.equal(leggiEsito(c).stato, "cieco", `${String(c)} non è un codice d'uscita`);
});

prova("il verdetto torna al suo codice d'uscita senza ricopiare il 2 a mano", () => {
  assert.equal(codiceDiUscita(leggiEsito(0)), 0);
  assert.equal(codiceDiUscita(leggiEsito(1)), 1);
  assert.equal(codiceDiUscita(leggiEsito(2)), 2);
  assert.equal(codiceDiUscita("boh"), 2, "non sapere che verdetto dare è già una cecità");
});

prova("un dato d'ingresso illeggibile è un verdetto, non un'eccezione", () => {
  const v = ciecoPerDatoIllegibile(new Error("Unexpected token }\n  at JSON.parse"), { cosa: "registro dei fatti" });
  assert.equal(v.stato, "cieco");
  assert.match(v.motivo, /registro dei fatti/);
  assert.doesNotMatch(v.motivo, /\n/, "lo stack trace non è una spiegazione: è rumore");
});

prova("zero cose guardate non è zero problemi", () => {
  assert.equal(ciecoSeNienteMisurato(0, "workflow")?.stato, "cieco");
  assert.equal(ciecoSeNienteMisurato(3, "workflow"), null, "se qualcosa l'ho guardato, il verdetto lo do io");
});

// ── ⑤ Dentro la visita vera ─────────────────────────────────────────────────

prova("⬇️ nella visita, l'uscita 2 di un guardiano diventa ⚪ e non ✅", () => {
  const r = { partito: true, code: 2, out: "⚠️ non ho potuto leggere il registro", ms: 12 };
  const e = daGuardiano(r, { comando: "node cervello/x.mjs", dettoOk: "tutto a posto", dettoRotto: "trovato un problema" });
  assert.equal(e.esito, "nonvisto", "era questo il punto: la frase rassicurante al posto della cecità");
  assert.notEqual(e.detto, "tutto a posto");
});

prova("e l'uscita 0 resta il verde di sempre, con la sua frase", () => {
  const e = daGuardiano({ partito: true, code: 0, out: "", ms: 3 }, { comando: "node cervello/x.mjs", dettoOk: "tutto a posto", dettoRotto: "male" });
  assert.equal(e.esito, "ok");
  assert.equal(e.detto, "tutto a posto");
});

prova("un guardiano che non parte resta un guasto del controllo, non un rosso della macchina", () => {
  const e = daGuardiano({ partito: false, motivo: "oltre 60s", code: null, out: "" }, { comando: "node cervello/x.mjs", dettoOk: "ok", dettoRotto: "male" });
  assert.equal(e.esito, "guasto");
});

// ── ⑥ AR-664 — il registro di forma inattesa ────────────────────────────────

function pausaCheckSu(registro) {
  const finto = mkdtempSync(join(tmpdir(), "pausa-forma-"));
  mkdirSync(join(finto, "memoria"), { recursive: true });
  const coda = join(finto, "memoria", "AZIONI-IN-ATTESA.md");
  const reg = join(finto, "memoria", "registro-fatti.json");
  writeFileSync(coda, "# coda finta\n\nNessuna card.\n");
  writeFileSync(reg, registro);
  return spawnSync(process.execPath, [join(REPO, "cervello/pausa-check.mjs")], {
    encoding: "utf8",
    env: { ...process.env, PAUSA_CODA_FILE: coda, PAUSA_REGISTRO_FILE: reg },
  });
}

prova("⬇️ un registro con «fatti» che non è un elenco: uscita 2, e nessuno stack trace", () => {
  const r = pausaCheckSu(JSON.stringify({ fatti: { "negozio.faro": "Pane Quotidiano" } }));
  assert.equal(r.status, 2, `atteso ⚪ cieco (2), ottenuto ${r.status}: prima qui usciva 1 con «TypeError: fatti.map is not a function»`);
  const tutto = `${r.stdout}${r.stderr}`;
  assert.doesNotMatch(tutto, /TypeError|at Object|at Module/, "uno stack trace non è un verdetto: è un guardiano che è morto");
  assert.match(tutto, /CIECO/i, "un cieco che non si dichiara è indistinguibile da un verde");
});

prova("un registro che non è nemmeno JSON: stessa risposta, e dice cosa non ha letto", () => {
  const r = pausaCheckSu("{ questo non è json");
  assert.equal(r.status, 2);
  assert.match(`${r.stdout}${r.stderr}`, /registro dei fatti/i);
});

prova("un registro sano resta misurabile: la cecità non è diventata la risposta comoda", () => {
  const r = pausaCheckSu(JSON.stringify({ fatti: [{ id: "negozio.faro", valore: "Pane Quotidiano" }] }));
  assert.equal(r.status, 0, "con una coda senza pause e un registro leggibile il verdetto è verde, non cieco");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
