#!/usr/bin/env node
// AR-169 — trentaquattro previsioni sbagliate e nessuna dice perché.
//
// Il cancello c'era già: `cmdEsito` pretende la causa su ogni mancata da PZ-011, fra tre ammesse
// (`modello` · `dato` · `mondo`). Eppure misurato il 28/7 sul registro vero: **nel registro non
// esiste UNA SOLA causa, su 42 voci.**
//
// Il motivo è che `cmdEsito` non è l'unica porta. Il ponte `da-loop` scrive diretto — 30 delle 34
// mancate senza causa vengono da lì — e il 26/7 una passata di recupero ne ha chiuse altre cinque in
// blocco. Finché il controllo vive nella PORTA, ne basta una nuova per aggirarlo, e una porta nuova
// si aggiunge sempre.
//
// Per questo l'obbligo si sposta sul DATO: chiunque abbia scritto la voce, la regola è la stessa.
// È AR-272 (il cancello al confine invece che dentro ogni esecutore) applicato al registro.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { CAUSE_AMMESSE, INVARIANTE, invarianteRotta } from "../previsione-verificabile.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const TAGLIO = "2026-07-28";

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

prova("il caso che ha rotto: una mancata nuova senza causa viola l'invariante", () => {
  const voce = { id: "X", stato: "mancata", creato: "2026-08-01 09:00" };
  assert.deepEqual(invarianteRotta(voce, TAGLIO), [INVARIANTE.SENZA_CAUSA]);
});

prova("vale da qualunque porta sia entrata — anche dal ponte", () => {
  // La voce del ponte ha `metrica: esito_loop` e non passa da cmdEsito: prima era fuori da ogni
  // controllo. L'invariante non guarda da dove viene.
  const dalPonte = { id: "Y", stato: "mancata", metrica: "esito_loop", creato: "2026-08-01 09:00" };
  assert.deepEqual(invarianteRotta(dalPonte, TAGLIO), [INVARIANTE.SENZA_CAUSA]);
});

prova("le cause sono le TRE che il comando già chiede, non altre inventate qui", () => {
  // Se questo file ne inventasse di nuove, il cancello boccerebbe le voci scritte correttamente
  // dalla porta principale — un guardiano che punisce chi fa bene viene spento subito.
  assert.deepEqual(CAUSE_AMMESSE, ["modello", "dato", "mondo"]);
  const sorgente = readFileSync(join(REPO, "cervello/calibrazione.mjs"), "utf8");
  assert.match(sorgente, /const CAUSE = \["modello", "dato", "mondo"\]/, "le tre devono restare allineate al comando");
  for (const c of CAUSE_AMMESSE) {
    assert.deepEqual(invarianteRotta({ stato: "mancata", causa: c, creato: "2026-08-01" }, TAGLIO), []);
  }
  assert.deepEqual(invarianteRotta({ stato: "mancata", causa: "boh", creato: "2026-08-01" }, TAGLIO), [INVARIANTE.SENZA_CAUSA]);
});

prova("lo storico è esente, e l'esenzione è DICHIARATA — non un silenzio", () => {
  // Senza taglio il cancello nascerebbe rosso su 34 voci e verrebbe spento entro la settimana. Ma
  // un'esenzione taciuta è la stessa bugia che stiamo curando: `valida` deve dire quante ne esenta.
  const vecchia = { stato: "mancata", creato: "2026-07-14 00:47" };
  assert.deepEqual(invarianteRotta(vecchia, TAGLIO), [], "prima del taglio non si riscrive lo storico");
  assert.deepEqual(invarianteRotta(vecchia), [INVARIANTE.SENZA_CAUSA], "ma senza taglio la violazione resta visibile");

  const out = execFileSync("node", [join(REPO, "cervello/calibrazione.mjs"), "valida"], { cwd: REPO, encoding: "utf8" });
  assert.match(out, /esenti dall'invariante/, "il numero delle esenzioni dev'essere stampato, non sottinteso");
  assert.match(out, /\d+ voci precedenti/, "quante, non «alcune»");
});

prova("il cancello nasce VERDE sul registro vero", () => {
  // La regola di disegno pagata più volte: un cancello che parte rosso su decine di casi viene
  // disattivato, e allora non prende nemmeno il primo caso nuovo.
  let rc = 0;
  try { execFileSync("node", [join(REPO, "cervello/calibrazione.mjs"), "valida"], { cwd: REPO, encoding: "utf8" }); }
  catch (e) { rc = e.status ?? 1; }
  assert.equal(rc, 0, "valida dev'essere verde oggi, e rosso alla prima voce nuova senza causa");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
