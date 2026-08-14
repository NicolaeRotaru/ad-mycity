#!/usr/bin/env node
// AR-306 — «Il worker per Windows è rimasto indietro di tutta la sicurezza costruita dopo».
//
// IL CASO CHE HA ROTTO. `cervello/worker.ps1` è un SECONDO consumatore della stessa coda di
// produzione del worker vero. È stato scritto una volta e mai più aggiornato: ogni difesa costruita
// dopo è finita solo nel `.sh`, perché la parità fra i due non era di nessuno e nessun controllo la
// misurava. Se il `.ps1` gira anche una sola volta mentre il worker del VPS è vivo — ed è lo
// scenario per cui esiste — un'azione approvata da Nicola può partire DUE volte, e può partire
// mentre l'AD è in pausa. Tocca soldi ed email a persone vere.
//
// LA CURA SCELTA, e perché non è ricopiare i fix. Ricopiarli lo rimetterebbe in pari oggi e indietro
// alla prossima difesa: la causa è che nessuno misura la distanza. Qui si fanno due cose insieme:
//   ① il file si dichiara IN PENSIONE e non parte senza uno sblocco esplicito — così il secondo
//      consumatore, che è il rischio vero, non esiste più per default;
//   ② la distanza diventa un NUMERO: `node cervello/c4-cancelli.mjs parita-worker` elenca le difese
//      che il .sh ha e il .ps1 no, e diventa rosso se qualcuno toglie la dichiarazione di pensione
//      lasciando il file indietro.
//
// ⚠️ COSA QUESTA PROVA NON COPRE, detto chiaro: che il `.ps1` si rifiuti DAVVERO di partire. Serve
// PowerShell per eseguirlo e qui non c'è. Quello che si esegue è il guardiano, che diventa rosso se
// la dichiarazione sparisce — cioè la difesa che protegge la difesa.

import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ok, titolo, finisci, sandbox, RADICE } from "./c4-banco.mjs";

function guardiano(radice) {
  const g = spawnSync("node", [join(RADICE, "cervello/c4-cancelli.mjs"), "parita-worker", `--radice=${radice}`], {
    encoding: "utf8",
  });
  return { rc: g.status, out: `${g.stdout}${g.stderr}` };
}

titolo("AR-306 · la distanza fra il worker vivo e quello Windows è un numero, non un'impressione");

const vero = guardiano(RADICE);
ok(vero.rc === 0, "AR-306: sul repo vero il guardiano passa (il .ps1 è dichiarato in pensione)", vero.out);
ok(
  /manca al \.ps1/.test(vero.out),
  "AR-306 · IL PUNTO: e ELENCA cosa gli manca — prima non lo sapeva nessuno, e chi lo riaccendeva credeva fosse equivalente",
  vero.out,
);
ok(
  /claim atomico/.test(vero.out) && /pausa fail-closed/.test(vero.out),
  "AR-306: fra le difese mancanti ci sono le due che causano il danno vero (doppio invio e partenza in pausa)",
  vero.out,
);

// LA PROVA CHE SERVE DAVVERO: qualcuno toglie la dichiarazione di pensione e lascia il file indietro.
// È lo stato in cui il difetto viveva — un secondo consumatore che può partire senza le difese.
titolo("AR-306 · se qualcuno lo rimette in servizio così com'è, il guardiano diventa rosso");
const finto = sandbox("parita");
mkdirSync(join(finto, "cervello"), { recursive: true });
writeFileSync(join(finto, "cervello/worker.sh"), readFileSync(join(RADICE, "cervello/worker.sh")));
const ps1SenzaPensione = readFileSync(join(RADICE, "cervello/worker.ps1"), "utf8").replace("if (-not $env:MYCITY_WORKER_PS1) {", "if ($false) {");
writeFileSync(join(finto, "cervello/worker.ps1"), ps1SenzaPensione);
const rimesso = guardiano(finto);
ok(
  rimesso.rc === 1,
  "AR-306: un worker Windows che può partire e non ha le difese del worker vero FA FALLIRE il controllo",
  rimesso.out,
);
ok(
  /doppio-invio/.test(rimesso.out),
  "AR-306: e il motivo dice il danno, non la regola («un consumatore senza queste difese è un doppio-invio in attesa»)",
  rimesso.out,
);

// E se un giorno il .ps1 tornasse davvero in pari, il guardiano deve saper dire di sì: un controllo
// che non può mai diventare verde è inutile quanto uno che non può diventare rosso.
titolo("AR-306 · e se un giorno tornasse in pari, il guardiano lo riconosce");
const { paritaWorker } = await import(new URL("../c4-cancelli.mjs", import.meta.url).href);
const inPari = paritaWorker({
  sh: 'id=eq.$id&stato=eq.in_attesa pausa_verdetto giro.sh worker_owner stato=eq.in_corso',
  ps1: 'id=eq.1&stato=eq.in_attesa pausa_verdetto giro.sh worker_owner stato=eq.in_corso',
});
ok(inPari.rc === 0 && inPari.mancanti.length === 0, "due worker con le stesse difese → nessuna distanza da colmare");
const indietro = paritaWorker({ sh: "id=eq.$id&stato=eq.in_attesa", ps1: "niente" });
ok(indietro.rc === 1 && indietro.mancanti.length === 1, "uno indietro e avviabile → rosso, con l'elenco di cosa manca");

finisci("AR-306 — la parità del worker Windows è misurabile");
