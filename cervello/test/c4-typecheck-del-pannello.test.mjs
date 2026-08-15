#!/usr/bin/env node
// LOTTO 43, CORSIA D — AR-705: LA FACCIA DELLA MACCHINA COMPILA TUTTA, NON SOLO LA PAGINA APERTA.
//
// COS'È SUCCESSO. Una sessione interrotta a metà di una sostituzione di stato ha lasciato quattro
// riferimenti a nomi che non esistevano più: tredici errori di compilazione proprio nell'area dove
// Nicola approva le azioni 🔴. Sono rimasti lì e nessuno se n'è accorto, perché il server di
// sviluppo compila SOLO la pagina che gli chiedi — e quell'area, in quella sessione, non era stata
// aperta. Il difetto puntuale è stato riparato (13 errori → 0), ma la causa no: il controllo dei
// tipi del Pannello non girava dentro la suite, quindi la prossima interruzione a metà avrebbe
// lasciato di nuovo la faccia della macchina rotta senza che nessuno lo sapesse.
//
// LA CURA È QUESTO FILE. Il controllo dei tipi entra fra le prove, cioè dentro il cancello, e copre
// l'INTERA superficie invece della pagina che qualcuno si ricorda di aprire.
//
// L'ONESTÀ DEL VERDE. In una sessione appena aperta `pannello/node_modules` non c'è (il clone non lo
// porta) e il controllo sbaglierebbe su ogni import: sarebbe un rosso che non parla del lavoro di
// nessuno, e un rosso così si impara a saltare. Quel caso qui è ⚪ «non ho potuto guardare», detto a
// voce alta e col comando per rimediare — mai un verde silenzioso.
//
// Si lancia con: node cervello/test/c4-typecheck-del-pannello.test.mjs

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PANNELLO = join(REPO, "pannello");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n").slice(0, 12).join("\n      ") });
  }
};

// ── LA DECISIONE, separata dall'esecuzione ──────────────────────────────────
// Sta qui e non dentro il comando perché così la si può esercitare su uscite finte: comprese quelle
// che nessun `tsc` ha ancora prodotto su questa macchina.

/** L'ambiente è pronto per un controllo dei tipi che voglia dire qualcosa? */
export function ambientePronto(ceSta) {
  if (!ceSta("node_modules")) {
    return { pronto: false, motivo: "pannello/node_modules assente: ogni import risulterebbe sconosciuto", rimedio: "npm ci --prefix pannello" };
  }
  if (!ceSta("node_modules/@types/node")) {
    return { pronto: false, motivo: "pannello/node_modules c'è ma senza @types/node: `process` risulterebbe sconosciuto", rimedio: "npm ci --prefix pannello" };
  }
  return { pronto: true };
}

/** Le righe di errore vere dentro l'uscita di `tsc`, con il file e il numero. */
export function erroriDiTipo(uscita) {
  return String(uscita ?? "")
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => /^[^\s].*\(\d+,\d+\): error TS\d+:/.test(r));
}

/** Verde, rosso o cieco — tre esiti, non due. */
export function verdetto({ pronto, codice, uscita }) {
  if (!pronto) return "cieco";
  const errori = erroriDiTipo(uscita);
  if (errori.length > 0) return "rosso";
  return codice === 0 ? "verde" : "rosso";
}

// ── ① il metro sa distinguere, misurato su uscite finte ─────────────────────

prova("AR-705: un errore di tipo nell'uscita è un ROSSO, anche uno solo", () => {
  const finta = "src/components/aree/Azioni.tsx(612,18): error TS2304: Cannot find name 'aperte'.";
  assert.deepEqual(erroriDiTipo(finta).length, 1);
  assert.equal(verdetto({ pronto: true, codice: 2, uscita: finta }), "rosso");
});

prova("AR-705: i tredici errori di quel giorno sarebbero stati tutti visti", () => {
  const tredici = Array.from(
    { length: 13 },
    (_, i) => `src/components/aree/Azioni.tsx(${600 + i},18): error TS2304: Cannot find name 'aperte'.`,
  ).join("\n");
  assert.equal(erroriDiTipo(tredici).length, 13, "il conto deve tornare: 13 errori, non «almeno uno»");
  assert.equal(verdetto({ pronto: true, codice: 2, uscita: tredici }), "rosso");
});

prova("AR-705: un'uscita pulita con uscita 0 è VERDE", () => {
  assert.equal(verdetto({ pronto: true, codice: 0, uscita: "" }), "verde");
});

prova("AR-705: la parola «error» dentro un discorso non basta a fare un rosso", () => {
  // Un rosso inventato costa quanto un verde bugiardo: si impara a saltare il controllo.
  assert.equal(erroriDiTipo("nessun error qui, solo una frase che contiene la parola").length, 0);
  assert.equal(verdetto({ pronto: true, codice: 0, uscita: "nessun error qui" }), "verde");
});

prova("AR-705: ambiente non pronto NON è verde: è cieco, e si dichiara col rimedio", () => {
  const senzaNulla = ambientePronto(() => false);
  assert.equal(senzaNulla.pronto, false);
  assert.equal(senzaNulla.rimedio, "npm ci --prefix pannello");
  assert.equal(verdetto({ pronto: false, codice: 0, uscita: "" }), "cieco", "cieco ≠ verde: è la regola di casa");
  const soloCartella = ambientePronto((f) => f === "node_modules");
  assert.equal(soloCartella.pronto, false, "la cartella senza @types/node non basta");
  assert.equal(ambientePronto(() => true).pronto, true);
});

// ── ② il controllo VERO sul Pannello di adesso ──────────────────────────────

const amb = ambientePronto((f) => existsSync(join(PANNELLO, f)));

prova("AR-705: il Pannello compila tutto — non solo la pagina che qualcuno apre", () => {
  if (!amb.pronto) {
    // ⚪: lo dico e vado avanti. Il verde di questo file, in questo caso, NON copre il Pannello.
    console.log(`  # ⚪ non ho potuto guardare: ${amb.motivo} → rimedio: ${amb.rimedio}`);
    return;
  }
  const r = spawnSync("npx", ["tsc", "--noEmit"], { cwd: PANNELLO, encoding: "utf8", timeout: 600_000 });
  const uscita = `${r.stdout || ""}\n${r.stderr || ""}`;
  const v = verdetto({ pronto: true, codice: r.status, uscita });
  const errori = erroriDiTipo(uscita);
  assert.equal(
    v,
    "verde",
    `il Pannello non compila: ${errori.length} errori di tipo.\n      ${errori.slice(0, 12).join("\n      ")}`,
  );
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
