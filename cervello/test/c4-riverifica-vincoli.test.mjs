#!/usr/bin/env node
// AR-321 — «Quattordici cancelli su quindici sono cartelli: parlano al motore e nessuno controlla
// se ha obbedito».
//
// IL CASO CHE HA ROTTO. Il giro alza fino a una quarantina di vincoli, li scrive nel prompt e non li
// guarda più. Uno solo veniva rimisurato dopo il motore (la coerenza dei fatti, AR-104) e infatti è
// l'unico che blocca davvero la pubblicazione. Per tutti gli altri il motore poteva ignorarli e il
// giro chiudeva lo stesso: un vincolo NON rispettato era indistinguibile — per Nicola e per il log —
// da un vincolo rispettato.
//
// Questa prova esegue il TRATTO VERO della riverifica in giro.sh, con i guardiani sostituiti da
// finti che possono dire sì o no a comando. Non guarda il sorgente: guarda se la memoria viene
// pubblicata o no, e quanti cancelli il giro conta DOPO il motore.

import { ok, titolo, finisci, sandbox, tratto, guardianoFinto, copiaVera, eseguiBash } from "./c4-banco.mjs";

const BLOCCO = tratto("cervello/giro.sh", 'if [ "${RUN_AI:-1}" = 1 ] && [ "${GATE_ROSSI:-0}" -gt 0 ]', "# Avviso a Nicola SUBITO");

/**
 * banco(vincoliPrima, verdettiDopo) esegue la riverifica.
 * `verdettiDopo` = { "coerenza-fatti.mjs": 0|1, … }  — 0 = il guardiano ora è contento.
 */
function banco(vincoliPrima, verdettiDopo) {
  const dove = sandbox("riverifica");
  copiaVera(dove, "cervello/c4-cancelli.mjs");
  for (const [file, rc] of Object.entries(verdettiDopo)) guardianoFinto(dove, file, { rc });
  const r = eseguiBash({
    dove,
    preludio:
      `SCRIPT_DIR=${JSON.stringify(dove)}\n` +
      `RUN_AI=1\nMEMORIA_INCOERENTE=0\n_gate_motivi=""\n` +
      `VINCOLI_ATTIVI=(${vincoliPrima.map((v) => JSON.stringify(v)).join(" ")})\n` +
      `GATE_ROSSI=${vincoliPrima.length}\n`,
    blocco: BLOCCO,
    coda: `VINCOLI_FINALI="${"${VINCOLI_ATTIVI[*]:-}"}"\n`,
    leggi: ["MEMORIA_INCOERENTE", "GATE_ROSSI", "VINCOLI_FINALI", "_gate_motivi"],
  });
  if (r.cieco) return { cieco: r.cieco };
  return {
    bloccata: (r.vars.MEMORIA_INCOERENTE || "").trim() === "1",
    gateRossi: (r.vars.GATE_ROSSI || "").trim(),
    finali: (r.vars.VINCOLI_FINALI || "").trim(),
    motivi: r.vars._gate_motivi || "",
    log: r.log,
  };
}

titolo("AR-321 · il vincolo si rimisura DOPO il motore, e se è ancora rosso qualcosa succede");

// ① IL CASO CHE HA ROTTO: il motore riceve il vincolo sulla coerenza dei fatti e non lo soddisfa.
//    Prima: il giro pubblicava lo stesso. Adesso: la memoria non esce.
const ignorato = banco(["FATTI"], { "coerenza-fatti.mjs": 1 });
if (ignorato.cieco) ok(false, "AR-321: ho potuto eseguire il tratto della riverifica", ignorato.cieco);
else {
  ok(
    ignorato.bloccata,
    "AR-321 · IL CASO CHE HA ROTTO: vincolo consegnato al motore, guardiano ancora rosso dopo → la memoria NON si pubblica",
    `MEMORIA_INCOERENTE è rimasta a 0: il vincolo ha chiuso il giro in verde restando attivo.\n${ignorato.log}`,
  );
  ok(
    /FATTI/.test(ignorato.motivi),
    "AR-321: e il motivo dice QUALE vincolo non è stato soddisfatto (non «qualcosa non va»)",
    ignorato.motivi,
  );
}

// ② Il motore ha obbedito: il guardiano adesso è verde. Il giro deve poter tornare pulito — prima
//    restava marcato «non pulito» comunque, perché il conto era quello di PRIMA del motore.
const obbedito = banco(["FATTI", "ESP"], { "coerenza-fatti.mjs": 0, "esperimenti-check.mjs": 0 });
ok(
  !obbedito.cieco && !obbedito.bloccata && obbedito.gateRossi === "0",
  "AR-321: se il motore ha risolto i vincoli, il conto dei cancelli rossi torna a zero (prima restava quello di prima)",
  obbedito.cieco || `gate rossi = «${obbedito.gateRossi}», bloccata = ${obbedito.bloccata}\n${obbedito.log}`,
);

// ③ Un vincolo di classe «rimedio» resta rosso: la memoria si pubblica, ma il giro non è pulito.
const rimedio = banco(["ESP"], { "esperimenti-check.mjs": 1 });
ok(
  !rimedio.cieco && !rimedio.bloccata && rimedio.gateRossi === "1" && /ESP/.test(rimedio.finali),
  "AR-321: un vincolo che non tocca ciò che il Pannello mostra non blocca il push, ma resta contato",
  rimedio.cieco || `gate rossi = «${rimedio.gateRossi}», finali = «${rimedio.finali}», bloccata = ${rimedio.bloccata}`,
);

// ④ Quello che NON si può rimisurare non diventa verde per silenzio: resta contato e dichiarato.
const nonMisurabile = banco(["SENSORI"], {});
ok(
  !nonMisurabile.cieco && nonMisurabile.gateRossi === "1" && /SENSORI/.test(nonMisurabile.finali),
  "AR-321: un vincolo che da qui non si può rimisurare resta ROSSO — ⚪ non è mai un verde",
  nonMisurabile.cieco || `gate rossi = «${nonMisurabile.gateRossi}», finali = «${nonMisurabile.finali}»`,
);

titolo("AR-321 · il verdetto, interrogato da solo (funzione pura, casi finti)");
const { esitoRiverifica, daRiverificare } = await import(new URL("../c4-cancelli.mjs", import.meta.url).href);
ok(esitoRiverifica({ rimasti: ["FATTI"] }).rc === 2, "un vincolo di pubblicazione ancora rosso → non si pubblica (rc 2)");
ok(esitoRiverifica({ rimasti: ["ESP"] }).rc === 3, "un vincolo di rimedio ancora rosso → giro non pulito (rc 3)");
ok(esitoRiverifica({ rimasti: [], risolti: ["ESP"] }).rc === 0, "tutti risolti → giro pulito (rc 0)");
ok(
  daRiverificare(["INVENTATO"]).nonRimisurabili.length === 1,
  "un vincolo nuovo che nessuno ha messo in tabella viene DICHIARATO, non dato per verde",
);

finisci("AR-321 — i vincoli si rimisurano dopo il motore");
