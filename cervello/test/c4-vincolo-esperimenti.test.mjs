#!/usr/bin/env node
// AR-323 — «Il vincolo sugli esperimenti ordina di aprirne uno nuovo anche quando il problema è che
// nessuno ha misurato quelli scaduti».
//
// IL CASO CHE HA ROTTO. `esperimenti-check.mjs` esce 1 per DUE motivi opposti — «non c'è nessun
// esperimento aperto» e «ce ne sono di scaduti che nessuno ha misurato» — e sa distinguerli: lo
// scrive nel suo output. Il giro lo buttava via e passava al motore una frase fissa scritta a mano
// («aprine uno nuovo»), la stessa in tutti e due i casi. Così il volano accumulava esperimenti
// aperti senza chiuderne nessuno, restando formalmente in regola: la calibrazione — il modo in cui
// l'azienda impara — restava ferma proprio mentre i controlli dicevano che girava.
//
// La prova esegue il tratto vero DUE volte con due uscite diverse del guardiano. È il punto: una
// frase scritta a mano nel giro esce identica tutte e due le volte, qualunque cosa abbia detto il
// guardiano; un testo che viene dal guardiano cambia con lui. Non è «contiene la parola giusta» —
// è «dipende da quello che ha detto», che è la cosa vera.

import { ok, titolo, finisci, sandbox, tratto, guardianoFinto, eseguiBash } from "./c4-banco.mjs";

const BLOCCO = tratto("cervello/giro.sh", "🧪 AR-323", "# AR-102: GATE COERENZA-FATTI");

function banco(stampa) {
  const dove = sandbox("esperimenti");
  guardianoFinto(dove, "esperimenti-check.mjs", { stampa, rc: 1 });
  const r = eseguiBash({
    dove,
    preludio: `SCRIPT_DIR=${JSON.stringify(dove)}\nESP_VINCOLO=""\n`,
    blocco: BLOCCO,
    leggi: ["ESP_VINCOLO"],
  });
  return r.cieco ? { cieco: r.cieco } : { vincolo: r.vars.ESP_VINCOLO || "", log: r.log };
}

titolo("AR-323 · il testo del vincolo lo produce il guardiano, non il giro");

const daMisurare = banco("⛔ 2 ESPERIMENTI SCADUTI DA MISURARE: chiusi senza esito, prima misura quelli");
const nessunoAperto = banco("⛔ NESSUN ESPERIMENTO APERTO: il volano non misura niente, aprine uno");

if (daMisurare.cieco || nessunoAperto.cieco) {
  ok(false, "AR-323: ho potuto eseguire il tratto dello sweep esperimenti", daMisurare.cieco || nessunoAperto.cieco);
} else {
  ok(daMisurare.vincolo.length > 0, "AR-323: il guardiano dice no e un vincolo arriva al motore", daMisurare.log);
  ok(
    daMisurare.vincolo !== nessunoAperto.vincolo,
    "AR-323 · IL CASO CHE HA ROTTO: a due uscite diverse del guardiano corrispondono due vincoli DIVERSI",
    `sono identici: al motore arriva sempre la frase fissa scritta a mano nel giro.\n«${daMisurare.vincolo.slice(0, 200)}»`,
  );
  ok(
    daMisurare.vincolo.includes("SCADUTI DA MISURARE"),
    "AR-323: quando il problema è «misura quelli vecchi», il motore legge proprio quello",
    daMisurare.vincolo.slice(0, 300),
  );
  ok(
    nessunoAperto.vincolo.includes("NESSUN ESPERIMENTO APERTO"),
    "AR-323: e quando il problema è «non ce n'è nessuno», legge quello",
    nessunoAperto.vincolo.slice(0, 300),
  );
  ok(
    !daMisurare.vincolo.includes("NESSUN ESPERIMENTO APERTO"),
    "AR-323: e soprattutto NON riceve l'ordine sbagliato — aprirne uno nuovo quando servirebbe misurare i vecchi",
    daMisurare.vincolo.slice(0, 300),
  );
}

finisci("AR-323 — il vincolo sugli esperimenti dice la causa vera");
