#!/usr/bin/env node
// AR-324 — «Le soglie dei cancelli si spengono da un file di ambiente e il registro del giro non le
// scrive da nessuna parte».
//
// IL CASO CHE HA ROTTO. Ogni guardiano legge la sua soglia da `cervello/vps/.env` al momento
// dell'uso, e nessuno la scriveva da nessuna parte. Il verde di un guardiano restava quindi ambiguo:
// può voler dire «ho verificato e va bene» oppure «mi hanno alzato la soglia sopra il caso peggiore».
// Un controllo che non si può ricostruire a posteriori non è un controllo, è una dichiarazione — e
// questo sta su un percorso che finisce con la memoria che Nicola legge sul Pannello.
//
// Questa prova esegue il tratto vero di giro.sh con l'ambiente truccato e guarda due cose: la riga
// esce sempre, e quando una manopola allenta un cancello il motore riceve un vincolo che glielo dice.

import { ok, titolo, finisci, sandbox, tratto, copiaVera, eseguiBash } from "./c4-banco.mjs";

const BLOCCO = tratto("cervello/giro.sh", "🎚️ AR-324", "# ────────────────────────────────");

function banco(env) {
  const dove = sandbox("soglie");
  copiaVera(dove, "cervello/c4-cancelli.mjs");
  const r = eseguiBash({
    dove,
    preludio: `SCRIPT_DIR=${JSON.stringify(dove)}\n`,
    blocco: BLOCCO,
    leggi: ["SOGLIE_VINCOLO"],
    env,
  });
  if (r.cieco) return { cieco: r.cieco };
  return { vincolo: r.vars.SOGLIE_VINCOLO || "", log: r.log };
}

titolo("AR-324 · con quali soglie ha girato questo giro? adesso si può rispondere");

const fabbrica = banco({
  CHECKLIST_MAX_GIORNI: "",
  OKR_MAX_GIORNI: "",
  NORTH_STAR_GIORNI_GATE: "",
  BUDGET_FORCE: "",
  CERVELLO_THINKING_TOKENS: "",
});
if (fabbrica.cieco) ok(false, "AR-324: ho potuto eseguire il tratto delle soglie", fabbrica.cieco);
else {
  ok(
    /SOGLIE IN VIGORE/.test(fabbrica.log),
    "AR-324: la riga con le soglie effettive esce SEMPRE nel log del giro (prima non esisteva)",
    fabbrica.log,
  );
  ok(
    /CHECKLIST_MAX_GIORNI=2/.test(fabbrica.log) && /NORTH_STAR_GIORNI_GATE=3/.test(fabbrica.log),
    "AR-324: e porta i valori, non i nomi — si può ricostruire com'era tarato ogni cancello",
    fabbrica.log,
  );
  ok(
    fabbrica.vincolo === "",
    "AR-324: con le soglie di fabbrica il motore non riceve nessun vincolo (niente rumore inutile)",
    `vincolo = «${fabbrica.vincolo.slice(0, 200)}»`,
  );
}

// IL CASO CHE HA ROTTO: qualcuno alza la soglia della freschezza a 99 giorni. Il guardiano diventa
// verde — ma è un verde comprato, e prima nessuno poteva accorgersene.
const allentata = banco({ CHECKLIST_MAX_GIORNI: "99" });
ok(
  !allentata.cieco && /CHECKLIST_MAX_GIORNI=99/.test(allentata.log),
  "AR-324 · IL CASO CHE HA ROTTO: una soglia alzata a mano compare nel log del giro",
  allentata.cieco || allentata.log,
);
ok(
  !allentata.cieco && allentata.vincolo.includes("99") && /di fabbrica 2/.test(allentata.vincolo),
  "AR-324: e diventa un vincolo per il motore, col valore, quello di fabbrica e la richiesta di dichiararla in coda",
  allentata.cieco || `vincolo = «${allentata.vincolo.slice(0, 300)}»`,
);

const emergenza = banco({ BUDGET_FORCE: "1" });
ok(
  !emergenza.cieco && emergenza.vincolo.includes("BUDGET_FORCE"),
  "AR-324: il tetto di spesa spento a mano è la manopola più pericolosa — e infatti finisce nel vincolo",
  emergenza.cieco || `vincolo = «${emergenza.vincolo.slice(0, 200)}»`,
);

titolo("AR-324 · la fotografia, interrogata da sola");
const { soglieInVigore, soglieDaDichiarare } = await import(new URL("../c4-cancelli.mjs", import.meta.url).href);
const foto = soglieInVigore({ OKR_MAX_GIORNI: "30" });
ok(foto.discostate.some((r) => r.env === "OKR_MAX_GIORNI"), "una soglia diversa dal default risulta «discostata»");
ok(/OKR_MAX_GIORNI=30\*/.test(foto.riga), "e nella riga è marcata con l'asterisco, così si vede a colpo d'occhio");
ok(
  soglieDaDichiarare(soglieInVigore({})).length === 0,
  "con tutto di fabbrica non c'è niente da dichiarare",
);
ok(
  soglieDaDichiarare(soglieInVigore({}, ["cervello/vps/.giro-force"])).includes(".giro-force"),
  "e una forzatura che vive su DISCO (non nell'ambiente) viene dichiarata lo stesso",
);

finisci("AR-324 — le soglie in vigore si scrivono");
