#!/usr/bin/env node
// 🧪 TRE ESITI, NON DUE: verde, rosso, e «non ho potuto misurare».
//
// Il workflow del cancello lo dichiarava da giorni — «0 = si consegna · 1 = violazione vera · 2 =
// NON HO POTUTO MISURARE» — ma il codice ne conosceva due: qualunque uscita diversa da 0 finiva in
// `fallito`, cioè un guardiano cieco veniva raccontato come una violazione.
//
// Il conto vero, misurato il 30/7 su `main` pulito in una sessione cloud: il clone è superficiale
// (lo fa l'agente, non è un errore), quindi `prove-oneste` non può ricostruire i file alla data di
// nascita ed esce 2 SEMPRE. Risultato: «⛔ NON SI CONSEGNA» a ogni corsa, anche col lavoro perfetto.
// Un cancello che non può diventare verde non viene sistemato: viene saltato. E allora smette di
// fermare anche i rossi veri — che è il costo che si paga davvero.
//
// Qui si prova che i tre esiti restano tre e che nessuno dei due estremi è cambiato: il rosso
// blocca ancora, e il cieco continua a uscire ≠ 0 verso la CI.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const CANCELLO = join(REPO, "cervello/cancello-lotto.mjs");

/** Un guardiano finto che esce con il codice chiesto, eseguito dal cancello come gli altri. */
function passoConCodice(codice) {
  const r = spawnSync(process.execPath, ["-e", `process.exit(${codice})`], { encoding: "utf8" });
  return r.status;
}

test("i tre codici arrivano davvero distinti da un processo figlio", () => {
  assert.equal(passoConCodice(0), 0);
  assert.equal(passoConCodice(1), 1);
  assert.equal(passoConCodice(2), 2, "se il 2 non sopravvivesse al processo, tutto il resto sarebbe teoria");
});

test("nel cancello, `fallito` esclude il 2 e SOLO il 2", () => {
  const src = readFileSync(CANCELLO, "utf8");
  const riga = src.match(/fallito:\s*(.+),/);
  assert.ok(riga, "la riga che decide cos'è un fallimento deve esistere");
  assert.match(
    riga[1],
    /codice\s*!==\s*0\s*&&\s*codice\s*!==\s*2/,
    "il cieco (2) non è un fallimento; tutto il resto sì — 1, 124, qualunque cosa",
  );
});

test("un processo ucciso resta ROSSO: non si travestre da cieco", () => {
  const src = readFileSync(CANCELLO, "utf8");
  assert.match(src, /const ucciso = r\.status === null/, "il caso «ucciso» dev'essere distinto");
  assert.match(src, /ucciso \? 124 :/, "un timeout non può diventare il codice del cieco, o il guardiano lento diventa saltabile");
});

test("il cieco continua a uscire ≠ 0: per la CI non cambia niente", () => {
  const src = readFileSync(CANCELLO, "utf8");
  assert.match(src, /if \(ciechi\.length \|\| ciechiProve\.length\) process\.exit\(2\)/, "l'uscita 2 finale deve restare");
  const yml = readFileSync(join(REPO, ".github/workflows/cancello-lotto.yml"), "utf8");
  assert.match(yml, /il 2 blocca come il|2 = NON HO POTUTO MISURARE/, "la CI dichiara ancora che il 2 blocca");
});

test("il verdetto finale distingue i tre casi a parole, non solo nel codice d'uscita", () => {
  const src = readFileSync(CANCELLO, "utf8");
  assert.match(src, /NON SI CONSEGNA/, "il rosso resta un no");
  assert.match(src, /DICHIARANDO I BUCHI/, "il caso «passa ma con parti non misurate» dev'essere detto, non nascosto");
  assert.match(src, /"✅ SI PUÒ CONSEGNARE\."/, "il verde pieno resta distinto dal giallo");
});
