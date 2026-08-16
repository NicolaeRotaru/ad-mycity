#!/usr/bin/env node
// AR-375 — una malattia risultava guarita perché era stato cambiato nome al tubo, non curato il vizio.
//
// LA STORIA. «L'esito di un guardiano finisce in una pipe» risultava a ZERO istanze da fine luglio.
// Non perché fosse stata curata: il consumatore era stato RINOMINATO, il pattern cercava il nome
// vecchio, e da quel giorno non trovava più niente. Chi ha visto il numero scendere l'ha letto come
// conferma del proprio lavoro. Nello stesso registro, in un altro campo, c'era scritto che
// trentacinque istanze erano ancora vive.
//
// LA RADICE, dal quinto perché: il metro descrive la SINTASSI di ieri invece del COMPORTAMENTO da
// vietare, e **un calo non viene mai controprovato**. Un numero che scende va dimostrato: «fai vedere
// che è sceso perché qualcuno ha curato, non perché il metro non guarda più lì».
//
// COSA PROVA QUESTO FILE, eseguendo il giudizio su registri finti (mai su quello vero):
//   ① il registro che si contraddice — «35 istanze restano» e il conteggio dice zero — non passa;
//   ② uno zero spiegato con un rinominamento non passa: è un metro che ha smesso di guardare;
//   ③ …ma passa se la nota NOMINA ciò che regge il contratto al posto suo (un test, un guardiano):
//      un limite dichiarato non è una guarigione inventata, e senza questa strada il guardiano
//      diventerebbe rumore e verrebbe spento;
//   ④ una controprova dichiarata è una promessa: se il pattern non la trova più, è rosso;
//   ⑤ un calo normale — da 22 a 8, con gente che ha curato — non viene punito;
//   ⑥ il guardiano vero, lanciato adesso sul registro vero, accusa «esito-in-una-pipe» ed esce 1.
//
// NON-VACUITÀ (verificata rompendo il fix apposta): in `cervello/spazzata-fratelli.mjs`, facendo
// tornare `null` al giudizio (`const calo = caloNonProvato(m, totaleNetto);` →
// `const calo = null;`), il caso ⑥ diventa ROSSO — è lo stato in cui la malattia risultava guarita.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { caloNonProvato, istanzeDichiarate } from "../spazzata-fratelli.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** La voce vera di malattie.json com'era il giorno in cui AR-375 è nato, ridotta all'osso. */
const IN_UNA_PIPE = {
  id: "esito-in-una-pipe",
  pattern: 'node "\\$SCRIPT_DIR/[^"\\n]+\\.mjs"[^|\\n]*\\|[^|\\n]*tail',
  nota_baseline: "0 dal 2026-07-28 (AR-307): giro.sh non usa piu `| tail`, l'esito passa da esito_righe che tiene la prima riga e la coda.",
  nota_onesta: "35 istanze restano, tutte in giro.sh. NON sono tutte difetti: il triage non è fatto.",
};

prova("⬇️ ① il registro che si contraddice: a parole 35, a numero zero", () => {
  const v = caloNonProvato(IN_UNA_PIPE, 0);
  assert.ok(v, "è il caso vero: per due settimane questo zero è stato letto come una guarigione");
  assert.equal(v.tipo, "registro-si-contraddice");
  assert.match(v.motivo, /35/);
});

prova("⬇️ ② uno zero spiegato con un rinominamento, e basta, non passa", () => {
  const v = caloNonProvato({ ...IN_UNA_PIPE, nota_onesta: "" }, 0);
  assert.ok(v);
  assert.equal(v.tipo, "calo-spiegato-col-metro");
});

prova("③ …ma passa se la nota dice cosa regge il contratto al posto del conteggio", () => {
  const dichiarata = {
    ...IN_UNA_PIPE,
    nota_onesta: "",
    nota_baseline:
      "0 dal 2026-08-13: il pattern non le prende perche il corpo JSON passa da una variabile. Il contratto vero lo tiene cervello/test/recupero-due-porte.test.mjs, che pretende lo stesso verdetto dalle due copie.",
  };
  assert.equal(caloNonProvato(dichiarata, 0), null, "un limite dichiarato, con qualcosa che regge al posto suo, non è una bugia");
});

prova("⬇️ ④ una controprova dichiarata che il pattern non trova più è il caso peggiore", () => {
  const conPromessa = { ...IN_UNA_PIPE, nota_onesta: "", controprova: 'node "$SCRIPT_DIR/sonda.mjs" --json | esito_righe 3 || true' };
  const v = caloNonProvato(conPromessa, 0);
  assert.ok(v, "il registro sembra in regola proprio mentre il metro non guarda più dove aveva promesso");
  assert.equal(v.tipo, "controprova-che-non-scatta");

  // E la promessa mantenuta chiude la domanda: il pattern trova ancora il suo esempio noto.
  const mantenuta = { ...IN_UNA_PIPE, nota_onesta: "", controprova: 'node "$SCRIPT_DIR/sonda.mjs" --json | tail -3' };
  assert.equal(caloNonProvato(mantenuta, 0), null);
});

prova("⑤ un calo normale non viene punito: da 22 a 8 è gente che ha curato", () => {
  const inCura = { id: "x", pattern: "mai", nota_onesta: "22 istanze restano, sparse in cinque file." };
  assert.equal(caloNonProvato(inCura, 8), null, "un guardiano che grida a ogni cura si impara a ignorare");
});

prova("il numero si legge dalle parole del registro, non si indovina", () => {
  assert.equal(istanzeDichiarate("35 istanze restano, tutte in giro.sh"), 35);
  assert.equal(istanzeDichiarate("ne rimangono parecchie"), null, "senza un numero non c'è contraddizione da misurare");
});

// ⑥ IL GUARDIANO VERO — su un registro SUO, non su quello vivo.
//
// La prima versione di questo caso puntava al registro vivo e pretendeva che `esito-in-una-pipe`
// fosse ANCORA accusata. Funzionava, perché quel giorno la malattia era davvero rotta: la sua
// partenza diceva zero e la nota spiegava il calo con un rinominamento.
//
// Poi il difetto è stato riparato — con la patch che questa stessa corsia aveva proposto — e il caso
// è diventato rosso. Non perché il guardiano avesse smesso di funzionare: perché **pretendeva che il
// bug fosse ancora lì**. Una prova scritta contro lo stato malato del momento non prova il guardiano:
// inchioda il difetto, e diventa rossa esattamente quando qualcuno lo cura. È l'incentivo rovesciato
// (chi ripara rompe la prova), lo stesso di AR-692 visto da un'altra faccia.
//
// La cura è la regola di casa: **la prova si porta la sua fixture**. Qui il registro è deviabile con
// `SPAZZATA_REGISTRO`, quindi il guardiano gira su un caso costruito apposta — e resta vero anche
// quando il repo è sano.
prova("⬇️ ⑥ il guardiano vero accusa un calo non provato, e il suo «no» cambia il codice d'uscita", () => {
  const registro = join(mkdtempSync(join(tmpdir(), "spazzata-")), "malattie.json");
  writeFileSync(registro, JSON.stringify({
    malattie: [{
      id: "finta-guarita",
      nome: "Una malattia che dichiara zero spiegandolo con un rinominamento",
      perche_e_grave: "fixture del caso ⑥",
      pattern: "questa-stringa-non-esiste-da-nessuna-parte",
      dove: ["cervello"], estensioni: [".sh"], baseline: 0, file_noti: [], esenti: [],
      nota_onesta: "35 istanze restano, tutte in giro.sh.",
      nota_baseline: "0 da quando lo script non usa piu `| tail`: l'esito passa da esito_righe.",
    }],
  }));

  const r = spawnSync(process.execPath, [join(REPO, "cervello/spazzata-fratelli.mjs"), "--json"],
    { encoding: "utf8", cwd: REPO, env: { ...process.env, SPAZZATA_REGISTRO: registro } });
  const finta = JSON.parse(r.stdout).malattie.find((m) => m.id === "finta-guarita");

  assert.ok(finta, "il guardiano non ha nemmeno letto il registro che gli ho dato");
  assert.ok(finta.calo_non_provato, "uno zero contraddetto dalle sue stesse parole deve essere accusato");
  assert.notEqual(r.status, 0, "un'accusa che non cambia il codice d'uscita è un rapporto, non un cancello");
});

// ⑦ E il contrario, che è la metà che si dimentica: sul registro VIVO, la malattia che è stata
// riparata in questo lotto NON deve più essere accusata. Senza questo caso, il guardiano potrebbe
// accusare tutto e i due casi insieme non distinguerebbero un metro da un allarme perenne.
prova("⑦ sul registro vivo, la malattia riparata in questo lotto non è più accusata", () => {
  const r = spawnSync(process.execPath, [join(REPO, "cervello/spazzata-fratelli.mjs"), "--json"], { encoding: "utf8", cwd: REPO });
  const pipe = JSON.parse(r.stdout).malattie.find((m) => m.id === "esito-in-una-pipe");
  assert.ok(pipe, "la malattia è sparita dal registro: la prova passerebbe a vuoto");
  assert.equal(pipe.calo_non_provato, null,
    "la partenza dice il numero vero (50) e la nota spiega il perché: non c'è più nessun calo da provare");
  // ⚠️ Non si inchioda al numero. La partenza DEVE poter scendere — è il cricchetto: chi cura
  // abbassa il tetto. La prima versione pretendeva esattamente 50 ed è diventata rossa nel lotto 44
  // quando una istanza è stata curata davvero (50 → 49): la prova puniva la cura. Quello che va
  // impedito è lo ZERO, cioè il tetto che sparisce e si vende come guarigione.
  assert.ok(pipe.baseline > 0, "se la partenza torna a zero, lo zero è di nuovo venduto per una guarigione");
  assert.ok(pipe.baseline <= 50, "e non può risalire: il cricchetto scende e non torna su");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
