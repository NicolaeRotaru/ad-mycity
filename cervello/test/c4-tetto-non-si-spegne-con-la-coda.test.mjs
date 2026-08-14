#!/usr/bin/env node
// AR-423 — «L'interruttore che serve a saltare la coda spegne anche il tetto di spesa».
//
// IL CASO CHE HA ROTTO. In giro.sh il cancello sul costo era protetto da questa condizione:
//     [ "${RUN_AI:-1}" = 1 ] && [ "${DELTA_GATE_FORCE:-0}" != 1 ] && [ "${BUDGET_FORCE:-0}" != 1 ]
// e due righe sopra il commento diceva l'opposto: «GATE-BUDGET non bypassa GIRO_FORCE: il delta-gate
// sì (throttle), la sicurezza-quota no». DELTA_GATE_FORCE è documentato come l'interruttore dei giri
// a mano e di quelli chiesti dal Pannello — cioè il caso NORMALE quando Nicola clicca «fai un giro».
// Chi lanciava così saltava anche il tetto sui token, in silenzio: non c'era nemmeno una riga di log,
// perché al `case` che avrebbe potuto scriverla non ci si arrivava.
//
// Questa prova esegue il TRATTO VERO di giro.sh con un freno finto che dichiara lo sforo, e guarda
// UNA cosa sola: il freno è stato interrogato, sì o no? Il sigillo lo lascia il freno stesso quando
// parte — se non c'è, nessuno gliel'ha chiesto.

import { existsSync } from "node:fs";
import { ok, titolo, finisci, sandbox, tratto, guardianoFinto, copiaVera, eseguiBash } from "./c4-banco.mjs";

const BLOCCO = tratto("cervello/giro.sh", "AR-087: GATE-BUDGET", 'PROMPT="Sei l\'AD digitale di MyCity');

// banco(env, verdettoFreno) → { frenoInterrogato, runAi, costoVincolo, log }
function banco(env, { rcFreno = 1, stampaFreno = "frena\til tetto giornaliero di token è stato superato (2.400.000 su 2.000.000)" } = {}) {
  const dove = sandbox("tetto");
  copiaVera(dove, "cervello/c4-cancelli.mjs");
  const sigillo = guardianoFinto(dove, "freno-costi.mjs", { stampa: stampaFreno, rc: rcFreno });
  guardianoFinto(dove, "costo-ai.mjs", { rc: 0 });
  const r = eseguiBash({
    dove,
    preludio: `SCRIPT_DIR=${JSON.stringify(dove)}\nRUN_AI=1\nCOSTO_VINCOLO=""\n`,
    blocco: BLOCCO,
    leggi: ["RUN_AI", "COSTO_VINCOLO"],
    env,
  });
  if (r.cieco) return { cieco: r.cieco };
  return {
    frenoInterrogato: existsSync(sigillo),
    runAi: (r.vars.RUN_AI || "").trim(),
    costoVincolo: r.vars.COSTO_VINCOLO || "",
    log: r.log,
  };
}

titolo("AR-423 · il tetto di spesa si salta SOLO con l'interruttore dichiarato per l'emergenza");

const coda = banco({ DELTA_GATE_FORCE: "1", BUDGET_FORCE: "0", GIRO_FORCE: "0" });
if (coda.cieco) ok(false, "AR-423: ho potuto eseguire il tratto del GATE-BUDGET", coda.cieco);
else {
  ok(
    coda.frenoInterrogato,
    "AR-423 · IL CASO CHE HA ROTTO: con DELTA_GATE_FORCE=1 (giro a mano / dal Pannello) il freno sul costo viene interrogato lo stesso",
    `il freno non è mai partito: il giro forzato salta il tetto sui token in silenzio.\n${coda.log}`,
  );
  ok(
    coda.runAi === "0",
    "AR-423: e se il freno dice che si è sforato, il motore premium NON si accende",
    `RUN_AI è rimasto «${coda.runAi}» invece di 0.\n${coda.log}`,
  );
}

const forzaGiro = banco({ GIRO_FORCE: "1", DELTA_GATE_FORCE: "0", BUDGET_FORCE: "0" });
ok(
  !forzaGiro.cieco && forzaGiro.frenoInterrogato,
  "AR-423: anche GIRO_FORCE=1 salta solo il risparmio, non la sicurezza sulla spesa",
  forzaGiro.cieco || `il freno non è partito.\n${forzaGiro.log}`,
);

const emergenza = banco({ BUDGET_FORCE: "1", DELTA_GATE_FORCE: "0" });
ok(
  !emergenza.cieco && !emergenza.frenoInterrogato,
  "AR-423: BUDGET_FORCE=1 — l'unico interruttore dichiarato per l'emergenza — spegne davvero il tetto",
  emergenza.cieco || "il freno è partito lo stesso: allora l'interruttore d'emergenza non serve a niente",
);
ok(
  !emergenza.cieco && /BUDGET_FORCE/.test(emergenza.log) && /spent/i.test(emergenza.log),
  "AR-423: un freno spento a mano lascia una riga esplicita nel log (prima spariva senza dire niente)",
  emergenza.cieco || emergenza.log,
);

const cieco = banco({}, { rcFreno: 2, stampaFreno: "cieco\tnon so quanti token sono stati spesi oggi" });
ok(
  !cieco.cieco && cieco.frenoInterrogato && /FRENO COSTI CIECO/.test(cieco.costoVincolo),
  "AR-423/AR-196: se il freno non sa quanto si è speso, il giro NON lo tratta come «sotto soglia» — lo dichiara al motore",
  cieco.cieco || `COSTO_VINCOLO = «${cieco.costoVincolo.slice(0, 120)}»`,
);

// La decisione non è più una stringa di bash che nessun test può eseguire: è una funzione pura, e
// si può interrogare con casi finti — che è tutta la differenza fra un cancello e un cartello.
titolo("AR-423 · la decisione, interrogata da sola");
const { tettoBudget } = await import(new URL("../c4-cancelli.mjs", import.meta.url).href);
ok(tettoBudget({ DELTA_GATE_FORCE: "1" }).consulta === true, "con DELTA_GATE_FORCE il freno si consulta");
ok(tettoBudget({ GIRO_FORCE: "1" }).consulta === true, "con GIRO_FORCE il freno si consulta");
ok(tettoBudget({ BUDGET_FORCE: "1" }).consulta === false, "con BUDGET_FORCE il freno si salta");
ok(
  tettoBudget({ BUDGET_FORCE: "1" }).avviso.length > 20,
  "e saltandolo si porta dietro l'avviso che lo rende visibile",
);

finisci("AR-423 — il tetto di spesa non si spegne con l'interruttore della coda");
