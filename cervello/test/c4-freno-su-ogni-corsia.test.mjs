#!/usr/bin/env node
// AR-391 + AR-422 + AR-197 — «Il freno sulla spesa è montato su un giro solo» e «chat, riassunti,
// lavori e radiografie non lasciano nessuna traccia nel registro dei costi».
//
// IL CASO CHE HA ROTTO. `freno-costi.mjs` era chiamato in UN punto di tutta la macchina: dentro
// giro.sh. Il worker — chat e lavori, la corsia che consuma di più (modello premium, memoria di
// sessione, lavori fino a 45 minuti) — non lo nominava da nessuna parte. Il tetto giornaliero
// copriva quindi una frazione della spesa, e non la parte che cresce con l'uso.
// Gemello: `costo-ai.mjs` non compariva in worker.sh, quindi la stessa corsia non lasciava nemmeno
// una traccia nel registro dei costi. Il «quanto consumo?» del Pannello era parziale proprio sul
// candidato numero uno.
//
// LA CURA. Le due decisioni escono dai chiamanti e diventano due funzioni in motore-ai.sh —
// `ai_freno_verdetto` (si può spendere?) e `ai_registra_costo` (quanto è costato) — e il worker le
// chiama in UN punto solo: subito dopo aver preso in carico un lavoro. È l'unico punto da cui
// passano tutte le sue corsie: chat in streaming, chat senza streaming, lavori, giro, ritmo,
// metabolizzazione, azioni.
//
// Questa prova esegue le funzioni vere di motore-ai.sh e i tratti veri di worker.sh.

import { existsSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { join } from "node:path";
import { ok, titolo, finisci, sandbox, tratto, guardianoFinto, copiaVera, eseguiBash } from "./c4-banco.mjs";

// ── ① la testa che decide: ai_freno_verdetto ────────────────────────────────────────────────────
// motore-ai.sh cerca i suoi vicini accanto a sé, quindi lo si esegue in una sandbox con i guardiani
// finti di fianco. È il file vero, byte per byte: `copiaVera` non lo riscrive.
function bancoFreno({ rcFreno, stampaFreno, env = {} }) {
  const dove = sandbox("freno");
  copiaVera(dove, "cervello/motore-ai.sh");
  copiaVera(dove, "cervello/c4-cancelli.mjs");
  const sigillo = guardianoFinto(dove, "freno-costi.mjs", { stampa: stampaFreno, rc: rcFreno });
  guardianoFinto(dove, "costo-ai.mjs", { rc: 0 });
  const r = eseguiBash({
    dove,
    preludio: `. ${JSON.stringify(join(dove, "motore-ai.sh"))}\nai_engine() { echo claude; }\n`,
    blocco: `VERDETTO="$(ai_freno_verdetto)"; RC=$?\n`,
    leggi: ["VERDETTO", "RC"],
    env: { BUDGET_FORCE: "0", DELTA_GATE_FORCE: "0", ...env },
  });
  if (r.cieco) return { cieco: r.cieco };
  return { interrogato: existsSync(sigillo), verdetto: r.vars.VERDETTO || "", rc: (r.vars.RC || "").trim(), log: r.log };
}

titolo("AR-391 / AR-422 · la decisione «si può spendere?» esiste fuori dal giro, e chiunque può chiederla");

const frena = bancoFreno({ rcFreno: 1, stampaFreno: "frena\ttetto giornaliero superato: 2.400.000 token su 2.000.000" });
if (frena.cieco) ok(false, "ho potuto eseguire ai_freno_verdetto", frena.cieco);
else {
  ok(frena.interrogato, "AR-422: il freno vero viene interrogato (non è una copia della sua logica)", frena.log);
  ok(frena.rc === "1", "AR-422: e quando dice di frenare, il verdetto esce con un codice che si può leggere", `rc = ${frena.rc}`);
  ok(/2\.400\.000/.test(frena.verdetto), "AR-422: portandosi dietro il motivo del freno, non solo il no", frena.verdetto);
}

const sottoSoglia = bancoFreno({ rcFreno: 0, stampaFreno: "lascia\tsotto soglia" });
ok(!sottoSoglia.cieco && sottoSoglia.rc === "0", "AR-422: sotto soglia dice via libera (non è un blocco a caso)", sottoSoglia.cieco || sottoSoglia.log);

const cieco = bancoFreno({ rcFreno: 2, stampaFreno: "cieco\tnon so quanto è stato speso oggi" });
ok(
  !cieco.cieco && cieco.rc === "2",
  "AR-422: se non sa misurare risponde «cieco» — un terzo stato, che non si traveste da verde",
  cieco.cieco || `rc = ${cieco.rc}`,
);

const emergenza = bancoFreno({ rcFreno: 1, stampaFreno: "frena\tsforato", env: { BUDGET_FORCE: "1" } });
ok(
  !emergenza.cieco && emergenza.rc === "0" && !emergenza.interrogato,
  "AR-423/AR-422: con l'interruttore d'emergenza dichiarato il freno si salta — e SOLO con quello",
  emergenza.cieco || `rc = ${emergenza.rc}, freno interrogato = ${emergenza.interrogato}`,
);

// ── ② la misura: ai_registra_costo ──────────────────────────────────────────────────────────────
titolo("AR-197 · e la misura «quanto è costato» vive nello stesso posto");

const doveCosto = sandbox("costo");
copiaVera(doveCosto, "cervello/motore-ai.sh");
const sigilloCosto = guardianoFinto(doveCosto, "costo-ai.mjs", { rc: 0 });
const rc2 = eseguiBash({
  dove: doveCosto,
  preludio: `. ${JSON.stringify(join(doveCosto, "motore-ai.sh"))}\nai_engine() { echo claude; }\n`,
  blocco: `ai_registra_costo "worker-chat" "$(( $(date +%s) - 30 ))" "un prompt" "una risposta"\n`,
  leggi: [],
});
const argomentiCosto = existsSync(sigilloCosto) ? readFileSync(sigilloCosto, "utf8") : "";
ok(!rc2.cieco && argomentiCosto.length > 0, "AR-197: la registrazione chiama davvero il registro dei costi", rc2.cieco || rc2.log);
ok(
  /--tipo=worker-chat/.test(argomentiCosto) && /--durata-sec=/.test(argomentiCosto) && /--modello=/.test(argomentiCosto),
  "AR-197: e scrive QUALE corsia, per quanto tempo e con che motore (senza, il conto non serve a decidere cosa affamare)",
  `argomenti: ${argomentiCosto}`,
);

// ── ③ il worker ci passa davvero: è qui che stava il difetto ────────────────────────────────────
titolo("AR-391 · il worker chiede il permesso PRIMA di eseguire (il tratto vero)");

const BLOCCO_FRENO = tratto("cervello/worker.sh", "💸 AR-391 / AR-422", "📸 IMPRONTA-VERITÀ");

function bancoWorkerFreno(rcFreno) {
  const dove = sandbox("workerfreno");
  const chiuso = join(dove, "chiuso-in-errore.txt");
  const proseguito = join(dove, "proseguito.txt");
  const r = eseguiBash({
    dove,
    preludio:
      `id=42\ntipo=chat\n` +
      `ai_freno_verdetto() { echo "frena\tho speso troppo oggi"; return ${rcFreno}; }\n` +
      `_dead_letter() { printf '%s' "$2" > ${JSON.stringify(chiuso)}; }\n`,
    // `continue` vive dentro il ciclo del worker: qui il ciclo è un giro solo, così il tratto resta quello vero.
    blocco: `for _un_giro in 1; do\n${BLOCCO_FRENO}\ntouch ${JSON.stringify(proseguito)}\ndone\n`,
    leggi: [],
  });
  if (r.cieco) return { cieco: r.cieco };
  return {
    chiuso: existsSync(chiuso),
    nota: existsSync(chiuso) ? readFileSync(chiuso, "utf8") : "",
    proseguito: existsSync(proseguito),
    log: r.log,
  };
}

const stop = bancoWorkerFreno(1);
if (stop.cieco) ok(false, "ho potuto eseguire il tratto del freno nel worker", stop.cieco);
else {
  ok(
    !stop.proseguito,
    "AR-391 · IL CASO CHE HA ROTTO: col tetto superato il worker NON esegue il lavoro (prima non chiedeva nemmeno)",
    `il worker è andato avanti lo stesso.\n${stop.log}`,
  );
  ok(
    stop.chiuso && /tetto di spesa/i.test(stop.nota) && /Cosa devi fare/.test(stop.nota),
    "AR-391: e a Nicola arriva una spiegazione con cosa fare, non un errore tecnico",
    stop.nota.slice(0, 300),
  );
}
const via = bancoWorkerFreno(0);
ok(!via.cieco && via.proseguito && !via.chiuso, "AR-391: sotto soglia il lavoro parte normalmente", via.cieco || via.log);

titolo("AR-197 · e il worker registra il costo del lavoro (il tratto vero)");

const BLOCCO_COSTO = tratto("cervello/worker.sh", "🪙 AR-197", "# 3a-bis)");

function bancoWorkerCosto(skipSync) {
  const dove = sandbox("workercosto");
  const registrato = join(dove, "registrato.txt");
  const r = eseguiBash({
    dove,
    preludio:
      `tipo=chat\nskip_sync=${skipSync}\n_lav_start=$(( $(date +%s) - 12 ))\nprompt="ciao"\nout="risposta"\n` +
      `ai_registra_costo() { printf '%s\\n' "$*" > ${JSON.stringify(registrato)}; }\n`,
    blocco: BLOCCO_COSTO,
    leggi: [],
  });
  if (r.cieco) return { cieco: r.cieco };
  return { registrato: existsSync(registrato), riga: existsSync(registrato) ? readFileSync(registrato, "utf8") : "", log: r.log };
}

const chat = bancoWorkerCosto(0);
if (chat.cieco) ok(false, "ho potuto eseguire il tratto della registrazione nel worker", chat.cieco);
else {
  ok(
    chat.registrato,
    "AR-197 · IL CASO CHE HA ROTTO: una chat lascia la sua riga nel registro dei costi (worker.sh non nominava costo-ai.mjs da nessuna parte)",
    `nessuna registrazione.\n${chat.log}`,
  );
  ok(
    /worker-chat/.test(chat.riga),
    "AR-197: e la riga dice che è stata la chat — la corsia che consuma di più, quella che mancava",
    chat.riga,
  );
}

const giro = bancoWorkerCosto(1);
ok(
  !giro.cieco && !giro.registrato,
  "AR-197: giro e ritmo NON si registrano qui (hanno una pipeline propria che scrive già la sua riga: due volte gonfierebbe il conto)",
  giro.cieco || giro.riga,
);

void writeFileSync;
void chmodSync;

finisci("AR-391 / AR-422 / AR-197 — il freno e il registro dei costi valgono per ogni corsia");
