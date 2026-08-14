#!/usr/bin/env node
// AR-304 — «Il giro ragiona o non ragiona a seconda di che lavoro c'era prima in coda».
//
// IL CASO CHE HA ROTTO. `worker.sh` è un ciclo unico con stato globale: quello che un lavoro
// esporta sopravvive al lavoro che l'ha creato. Una metabolizzazione mette `AI_THINKING=0` (giusto:
// riassumere è volume, non ragionamento). Il reset esisteva — `unset AI_THINKING` — ma stava dentro
// il ramo «costruisci il prompt», più in basso, e giro e ritmo lanciano il loro script PRIMA di
// arrivarci, poi si escludono da quel ramo con skip_sync=1. Quindi: metabolizza → giro faceva girare
// il giro SENZA budget di pensiero, e non c'era una riga da nessuna parte che lo dicesse. Un briefing
// povero si legge come «poco da dire», non come «ha girato senza pensare».
//
// La prova esegue il tratto vero del reset per-lavoro con l'ambiente sporco del lavoro precedente e
// guarda se resta sporco. Poi controlla che il reset stia PRIMA della biforcazione per tipo: è tutta
// la differenza fra il difetto e il fix, e una prova che non la vede non prova niente.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ok, titolo, finisci, sandbox, tratto, copiaVera, eseguiBash, RADICE } from "./c4-banco.mjs";

const BLOCCO = tratto("cervello/worker.sh", "skip_sync=0", "# 1) CLAIM ATOMICO");

function banco(sporco) {
  const dove = sandbox("igiene");
  copiaVera(dove, "cervello/c4-cancelli.mjs");
  return eseguiBash({
    dove,
    preludio: `SCRIPT_DIR=${JSON.stringify(dove)}\n`,
    blocco: BLOCCO,
    coda:
      `VISTO_THINKING="${"${AI_THINKING-(non impostata)}"}"\n` +
      `VISTO_AZIONI="${"${AI_ALLOW_ACTIONS-(non impostata)}"}"\n`,
    leggi: ["VISTO_THINKING", "VISTO_AZIONI"],
    env: sporco,
  });
}

titolo("AR-304 · ogni lavoro parte pulito, qualunque fosse quello prima in coda");

const dopoMetabolizza = banco({ AI_THINKING: "0", AI_ALLOW_ACTIONS: "0" });
if (dopoMetabolizza.cieco) ok(false, "AR-304: ho potuto eseguire il tratto del reset per-lavoro", dopoMetabolizza.cieco);
else {
  ok(
    dopoMetabolizza.vars.VISTO_THINKING === "(non impostata)",
    "AR-304 · IL CASO CHE HA ROTTO: dopo una metabolizzazione (AI_THINKING=0) il lavoro successivo NON eredita il pensiero spento",
    `AI_THINKING è rimasta «${dopoMetabolizza.vars.VISTO_THINKING}»: il giro dopo gira senza ragionare, e nessuno lo dice.`,
  );
  ok(
    dopoMetabolizza.vars.VISTO_AZIONI === "(non impostata)",
    "AR-304: e nemmeno le mani armate della chat (AI_ALLOW_ACTIONS=0) restano addosso al lavoro dopo",
    `AI_ALLOW_ACTIONS è rimasta «${dopoMetabolizza.vars.VISTO_AZIONI}»`,
  );
}

// La POSIZIONE è il fix. Il vecchio reset esisteva già: stava solo nel posto sbagliato, dopo il
// punto in cui giro e ritmo se ne vanno per la loro strada. Se qualcuno lo rimettesse là, questa
// verifica lo vede — e senza di lei la prova sopra resterebbe verde con il difetto ancora vivo.
const testo = readFileSync(join(RADICE, "cervello/worker.sh"), "utf8").split("\n");
const rigaReset = testo.findIndex((r) => /^\s*unset \$_igiene/.test(r));
const rigaBiforcazione = testo.findIndex((r) => /elif \[ "\$tipo" = "giro" \]/.test(r));
const rigaGiroSh = testo.findIndex((r) => /esegui_con_battito .*giro\.sh/.test(r));
ok(
  rigaReset > 0 && rigaBiforcazione > 0 && rigaReset < rigaBiforcazione,
  "AR-304: il reset sta PRIMA della biforcazione per tipo — cioè su ogni strada, non solo su quella dei lavori normali",
  `reset alla riga ${rigaReset + 1}, biforcazione alla ${rigaBiforcazione + 1}: il ramo giro/ritmo salta il reset, com'era prima.`,
);
ok(
  rigaReset > 0 && rigaGiroSh > 0 && rigaReset < rigaGiroSh,
  "AR-304: e prima del lancio di giro.sh — che è il lavoro che il difetto lasciava senza pensiero",
  `reset alla riga ${rigaReset + 1}, lancio del giro alla ${rigaGiroSh + 1}`,
);

titolo("AR-304 · l'elenco delle variabili «di questo lavoro», interrogato da solo");
const { VARIABILI_PER_LAVORO, variabiliSporche } = await import(new URL("../c4-cancelli.mjs", import.meta.url).href);
ok(VARIABILI_PER_LAVORO.includes("AI_THINKING"), "il budget di pensiero è dichiarato come stato per-lavoro");
ok(VARIABILI_PER_LAVORO.includes("AI_ALLOW_ACTIONS"), "e anche le mani armate");
ok(variabiliSporche({ AI_THINKING: "0" }).length === 1, "e si può chiedere quali sono ancora sporche");
ok(variabiliSporche({}).length === 0, "su un ambiente pulito non ne trova nessuna");

finisci("AR-304 — il giro non eredita l'ambiente del lavoro precedente");
