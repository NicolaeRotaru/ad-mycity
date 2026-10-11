#!/usr/bin/env node
// AR-472 — il metro contava il tempo che passa come una regressione di chi passa di lì.
//
// IL CASO CHE HA ROTTO, con le sue date. Il debito dello stampo è dichiarato per NOME e per TIPO:
// dice QUALI difetti aveva un agente, non DA QUANTO. Tredici quaderni avevano tutti l'ultimo esito
// al 2026-07-01; il 28/7, quando il debito fu dichiarato, erano a 27 giorni ed erano «vivi». Il
// 2026-08-01 hanno passato insieme i 30 giorni di `GIORNI_FERMO` e sono diventati «fermi» — senza
// che nessuno toccasse un file. Da quel momento `stampo-check` usciva 1, il test
// `un-quaderno-una-casa` falliva, e i due workflow della CI erano rossi su main PER CHIUNQUE: anche
// per una PR che tocca due file markdown del vault.
//
// Il fratello della stessa malattia sta due funzioni più in là: `kit_sottile` ha una soglia pari al
// 40% della MEDIANA DEL PARCO, quindi un kit può diventare «sottile» perché gli altri sono
// migliorati. Stessa forma: peggiora il metro, non l'agente.
//
// COSA PROVA QUESTO FILE, e perché in quest'ordine:
//   ① il tempo che passa non è una regressione — ma resta contato e visibile (non è un condono);
//   ② una regressione VERA continua a bloccare: righe di esito sparite, kit rimpicciolito. È la metà
//      che conta: un fix che si limitasse a far passare tutto supererebbe solo la ①;
//   ③ quando non si può misurare, l'esito è «regressione»: cieco non è verde;
//   ③bis/③ter (AR-959) un quaderno vuoto alla dichiarazione non è cieco; e chi toglie quel «vuoto»
//      senza scrivere la data lo scopre il giorno stesso, non trenta giorni dopo;
//   ④ sul repo vero, oggi: nessuna regressione, e i tredici invecchiati ci sono ancora tutti.

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { DIFETTO, azioneDelGuarito, baselineCieca, classificaNuovi } from "../stampo-metro.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const GUARDIANO = join(REPO, "cervello/stampo-check.mjs");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

// Il caso vero del 1/8, nella sua forma: tredici nomi, stesso difetto, stessa data di ultimo esito.
const I_TREDICI = [
  "ads-performance", "ai-copywriter", "ai-designer", "ai-video", "contabilita", "cro", "dispatch",
  "dispute", "influencer-partnership", "legale-privacy", "qa", "rider-fleet", "supporto",
];
const nuoviFermi = I_TREDICI.map((nome) => ({ nome, difetto: DIFETTO.QUADERNO_FERMO }));
const alPrimoLuglio = Object.fromEntries(I_TREDICI.map((n) => [n, "2026-07-01"]));

prova("① il calendario che avanza non è una regressione di nessuno", () => {
  const { regressioni, invecchiati } = classificaNuovi(nuoviFermi, {
    ultimoOggi: alPrimoLuglio,
    baseline: { ultimo_esito: alPrimoLuglio },
  });
  assert.equal(regressioni.length, 0, "nessuno ha toccato quei quaderni: non c'è niente da imputare");
  assert.equal(invecchiati.length, 13, "e restano tutti e tredici contati: non è un condono");
  assert.match(invecchiati[0].perche, /calendario/, "il rapporto deve dire PERCHÉ, o è un silenzio");
});

prova("② una regressione vera continua a bloccare: le righe di esito sparite", () => {
  // Stesso quaderno, ma l'ultimo esito è tornato INDIETRO: qualcuno ha tolto delle righe.
  const { regressioni, invecchiati } = classificaNuovi([{ nome: "qa", difetto: DIFETTO.QUADERNO_FERMO }], {
    ultimoOggi: { qa: "2026-06-01" },
    baseline: { ultimo_esito: { qa: "2026-07-01" } },
  });
  assert.equal(regressioni.length, 1, "un esito che sparisce ha un autore, e va fermato");
  assert.equal(invecchiati.length, 0);
  assert.match(regressioni[0].perche, /indietro/);
});

prova("② bis — e il kit che si rimpicciolisce, che è il fratello della stessa malattia", () => {
  const ristretto = classificaNuovi([{ nome: "cro", difetto: DIFETTO.KIT_SOTTILE }], {
    kitBytesOggi: { cro: 4000 },
    baseline: { kit_bytes: { cro: 9000 } },
  });
  assert.equal(ristretto.regressioni.length, 1, "il kit si è ristretto: è opera di qualcuno");

  // Stesso kit, identico: a essersi alzata è la mediana del parco perché gli ALTRI sono migliorati.
  const mediana = classificaNuovi([{ nome: "cro", difetto: DIFETTO.KIT_SOTTILE }], {
    kitBytesOggi: { cro: 9000 },
    baseline: { kit_bytes: { cro: 9000 } },
  });
  assert.equal(mediana.regressioni.length, 0);
  assert.equal(mediana.invecchiati.length, 1, "peggiora il confronto, non il kit");
});

prova("② ter — OGNI difetto che non matura da solo resta una regressione, anche quelli aggiunti domani", () => {
  // Esaustivo di proposito, su tutte le chiavi di DIFETTO invece che su quattro scelte a mano: è il
  // punto in cui questo fix smette di essere «riparato un caso» e diventa «questa forma non si
  // allarga più». Se qualcuno aggiunge un tipo nuovo, o è dichiarato in MATURANO_DA_SOLE con la sua
  // ragione, oppure cade qui dentro e blocca — che è il verso sicuro.
  const maturano = [DIFETTO.QUADERNO_FERMO, DIFETTO.KIT_SOTTILE];
  const altri = Object.values(DIFETTO).filter((d) => !maturano.includes(d));
  assert.ok(altri.length >= 11, `attesi almeno 11 tipi non-maturanti, trovati ${altri.length}`);
  for (const d of altri) {
    const { regressioni, invecchiati } = classificaNuovi([{ nome: "supporto", difetto: d }], {
      ultimoOggi: alPrimoLuglio,
      baseline: { ultimo_esito: alPrimoLuglio, kit_bytes: { supporto: 9000 } },
    });
    assert.equal(regressioni.length, 1, `${d} non matura da solo: se è nuovo, qualcuno l'ha introdotto`);
    assert.equal(invecchiati.length, 0, `${d} non deve mai passare per invecchiamento`);
  }
});

prova("③ senza il valore nella baseline non si indovina: si blocca", () => {
  // È il verso sicuro dell'incertezza. Se qui uscisse «invecchiato», basterebbe togliere un nome
  // dalla baseline per far passare qualunque cosa — e il buco sarebbe invisibile.
  const { regressioni, invecchiati } = classificaNuovi(nuoviFermi, {
    ultimoOggi: alPrimoLuglio,
    baseline: {},
  });
  assert.equal(invecchiati.length, 0, "cieco non è verde");
  assert.equal(regressioni.length, 13);
  assert.match(regressioni[0].perche, /cieco non è verde/);
});

prova("③ bis — AR-959: un quaderno che alla dichiarazione era VUOTO non è cieco, e il calendario non è una sua colpa", () => {
  // Il caso del 10/10: @dpo aveva nel debito `quaderno_vuoto`, poi ha scritto il suo primo esito, poi
  // non ne ha scritto un secondo e i 30 giorni sono passati. Alla baseline non c'era nessun esito da
  // ricordare: niente poteva sparire. Prima usciva «non so da quando era fermo» → regressione.
  const baseline = { debito: { dpo: ["quaderno_vuoto", "loop_senza_varianti"] }, ultimo_esito: {} };
  const { regressioni, invecchiati } = classificaNuovi([{ nome: "dpo", difetto: DIFETTO.QUADERNO_FERMO }], {
    ultimoOggi: { dpo: "2026-09-06" },
    baseline,
  });
  assert.equal(regressioni.length, 0, `un quaderno vuoto alla dichiarazione non può aver perso righe: ${JSON.stringify(regressioni)}`);
  assert.equal(invecchiati.length, 1);
  assert.match(invecchiati[0].perche, /era vuoto/);

  // Il confine resta dov'era: senza la parola `quaderno_vuoto` nel debito, lo stesso caso è cieco.
  const cieco = classificaNuovi([{ nome: "dpo", difetto: DIFETTO.QUADERNO_FERMO }], {
    ultimoOggi: { dpo: "2026-09-06" },
    baseline: { debito: { dpo: ["loop_senza_varianti"] }, ultimo_esito: {} },
  });
  assert.equal(cieco.regressioni.length, 1, "senza sapere che era vuoto non si indovina: si blocca");
  assert.match(cieco.regressioni[0].perche, /cieco non è verde/);

  // E un quaderno ancora senza esiti oggi non diventa «invecchiato» per via del debito: niente da giudicare.
  const senzaEsiti = classificaNuovi([{ nome: "dpo", difetto: DIFETTO.QUADERNO_FERMO }], { ultimoOggi: {}, baseline });
  assert.equal(senzaEsiti.invecchiati.length, 0, "senza un esito oggi la regola del vuoto non si applica");
});

prova("③ ter — AR-959 (collaudo): chi toglie il «vuoto» senza scrivere la data lo scopre OGGI, non fra trenta giorni", () => {
  // La variante scomoda, quella che capita da sola: il guardiano stampa «Guariti — da togliere», qualcuno
  // toglie `quaderno_vuoto` e non scrive `ultimo_esito`. Il collaudo l'ha rifatta con un orologio
  // finto: quel giorno tutto verde, trenta giorni dopo stampo-check rosso. Adesso il rosso è subito.
  const guaritoSenzaData = { debito: { dpo: ["loop_senza_varianti"] }, ultimo_esito: {} };
  assert.deepEqual(
    baselineCieca({ ultimoOggi: { dpo: "2026-09-06" }, baseline: guaritoSenzaData }),
    [{ nome: "dpo", ultimo_oggi: "2026-09-06" }],
    "il quaderno scrive ma la baseline non ha né la data né il «vuoto»: va detto oggi, con la data da scrivere",
  );
  // Con la data scritta, o col «vuoto» ancora nel debito, la baseline sa giudicarlo: niente da dire.
  assert.deepEqual(baselineCieca({ ultimoOggi: { dpo: "2026-09-06" }, baseline: { ...guaritoSenzaData, ultimo_esito: { dpo: "2026-09-06" } } }), []);
  assert.deepEqual(baselineCieca({ ultimoOggi: { dpo: "2026-09-06" }, baseline: { debito: { dpo: ["quaderno_vuoto"] }, ultimo_esito: {} } }), []);
  // Un quaderno che non ha ancora scritto niente non ha niente da far giudicare.
  assert.deepEqual(baselineCieca({ ultimoOggi: {}, baseline: guaritoSenzaData }), []);
  // E un senior nuovo, mai entrato nella baseline, che scrive il suo primo esito: stesso buco, stesso rosso.
  assert.equal(baselineCieca({ ultimoOggi: { "senior-nuovo": "2026-10-11" }, baseline: { debito: {}, ultimo_esito: {} } }).length, 1);
});

prova("③ quater — AR-959 (terzo collaudo): un senior nuovo, dichiarato col quaderno assente, scrive il primo esito dal giro — e nessuno diventa rosso", () => {
  // Il percorso che il terzo collaudo ha rifatto sul repo vero: la richiesta che aggiunge il senior lo
  // dichiara con `quaderno_assente`; poi il giro esegue `chiusura-loop registra`, che crea il quaderno
  // col primo esito, e lo pubblica su main. Nessuna richiesta di unione ha toccato niente: se qui
  // uscisse un rosso, la CI sarebbe rossa per tutti e il giro non potrebbe ripararla.
  const baseline = { debito: { "senior-nuovo": ["quaderno_assente"] }, ultimo_esito: {} };
  assert.deepEqual(baselineCieca({ ultimoOggi: { "senior-nuovo": "2026-10-12" }, baseline }), [],
    "assente alla dichiarazione vuol dire «niente da ricordare», come vuoto: la baseline sa giudicarlo");
  // E trenta giorni dopo, fermo, è il calendario: niente di quello che c'era allora può essere sparito.
  const { regressioni, invecchiati } = classificaNuovi([{ nome: "senior-nuovo", difetto: DIFETTO.QUADERNO_FERMO }], {
    ultimoOggi: { "senior-nuovo": "2026-10-12" },
    baseline,
  });
  assert.equal(regressioni.length, 0, `un quaderno nato dopo la dichiarazione non può aver perso righe: ${JSON.stringify(regressioni)}`);
  assert.equal(invecchiati.length, 1);
});

prova("③ quinquies — AR-959 (quarto collaudo): un quaderno dichiarato assente che nasce vuoto non è una regressione", () => {
  // Il giro crea il quaderno del senior nuovo, ma senza una riga di esito valida: oggi esce «vuoto», un
  // difetto che nella baseline non c'era. Da un quaderno che non esisteva non può sparire niente.
  const baseline = { debito: { "senior-nuovo": ["quaderno_assente"] }, ultimo_esito: {} };
  const { regressioni, invecchiati } = classificaNuovi([{ nome: "senior-nuovo", difetto: DIFETTO.QUADERNO_VUOTO }], { ultimoOggi: {}, baseline });
  assert.equal(regressioni.length, 0, `assente → vuoto non ha tolto niente a nessuno: ${JSON.stringify(regressioni)}`);
  assert.match(invecchiati[0]?.perche || "", /non c'era/);
  // Il confine: un quaderno che alla dichiarazione aveva esiti e oggi è vuoto ha perso righe, e resta
  // rosso — anche quando nel debito ha altro, come quasi tutti (il quinto collaudo: 21 quaderni veri).
  const perso = classificaNuovi([{ nome: "dpo", difetto: DIFETTO.QUADERNO_VUOTO }], {
    ultimoOggi: {},
    baseline: { debito: { dpo: ["loop_senza_varianti"] }, ultimo_esito: { dpo: "2026-09-06" } },
  });
  assert.equal(perso.regressioni.length, 1, "un quaderno svuotato resta una regressione");
  // E «assente» scusa solo il quaderno vuoto: un difetto nuovo di altro genere resta di chi l'ha portato.
  const kit = classificaNuovi([{ nome: "senior-nuovo", difetto: DIFETTO.KIT_SENZA_SEZIONE_E }], { ultimoOggi: {}, baseline });
  assert.equal(kit.regressioni.length, 1, "un kit rotto non è scusato dal quaderno assente");
});

prova("③ sexies — AR-959 (quinto collaudo): il guardiano dice cosa fare di ogni voce guarita, e «toglila» non basta sempre", () => {
  const conEsiti = { ultimoOggi: { a: "2026-10-12" }, baseline: { debito: {}, ultimo_esito: {} }, quadro: {} };
  assert.equal(azioneDelGuarito({ nome: "a", difetto: DIFETTO.QUADERNO_VUOTO }, conEsiti).azione, "togli-e-scrivi-data");
  assert.equal(azioneDelGuarito({ nome: "a", difetto: DIFETTO.QUADERNO_ASSENTE }, conEsiti).azione, "togli-e-scrivi-data");
  // Il caso del collaudo: dichiarato assente, il quaderno nasce vuoto. Togliere la riga lo farebbe rosso.
  const nato = azioneDelGuarito({ nome: "b", difetto: DIFETTO.QUADERNO_ASSENTE }, { ultimoOggi: {}, baseline: { debito: {} }, quadro: { b: [DIFETTO.QUADERNO_VUOTO] } });
  assert.equal(nato.azione, "sostituisci-con-vuoto");
  assert.match(nato.testo, /quaderno_vuoto/);
  assert.equal(azioneDelGuarito({ nome: "c", difetto: DIFETTO.KIT_SOTTILE }, conEsiti).azione, "togli", "gli altri difetti guariti si tolgono e basta");
});

prova("④ sul repo vero: nessuna regressione, e ogni fermo resta contato nel rapporto", () => {
  const r = spawnSync("node", [GUARDIANO, "--json"], { cwd: REPO, encoding: "utf8" });
  const j = JSON.parse(r.stdout);
  assert.equal(j.baseline_letta, true, "senza baseline il guardiano è cieco e questa prova non prova niente");
  assert.deepEqual(j.regressioni, [], `regressioni sul parco vero: ${JSON.stringify(j.regressioni)}`);
  assert.deepEqual(j.baseline_cieca, [], `quaderni che la baseline non sa più giudicare: ${JSON.stringify(j.baseline_cieca)}`);
  assert.equal(r.status, 0, `atteso verde, uscito ${r.status}`);
  // La metà che impedisce il condono: se un giorno qualcuno «sistemasse» il rosso togliendo le voci
  // dal rapporto invece di far chiudere il loop ai reparti, questa riga diventa rossa.
  //
  // Il conto si chiude contro la BASELINE, che è un altro file: un totale ricavato dallo stesso
  // rapporto che sto controllando proverebbe solo che il rapporto è coerente con sé stesso. E non
  // pretende un numero fisso — se domani quei reparti chiudono il loop il numero cala, ed è il
  // risultato che vogliamo: una prova che diventa rossa quando le cose migliorano è una prova che
  // qualcuno cancellerà.
  const baseline = JSON.parse(readFileSync(join(REPO, "cervello/stampo-baseline.json"), "utf8"));
  const giaNelDebito = Object.values(baseline.debito).filter((d) => d.includes("quaderno_fermo")).length;
  const fermiNelRapporto = j.invecchiati.filter((x) => x.difetto === "quaderno_fermo").length;
  assert.equal(fermiNelRapporto, j.quaderni.fermi - giaNelDebito,
    `ogni quaderno fermo non ancora dichiarato nel debito deve comparire fra gli invecchiati: ` +
      `il parco ne conta ${j.quaderni.fermi}, il debito ne dichiarava ${giaNelDebito}, il rapporto ne mostra ${fermiNelRapporto}`);
  for (const x of j.invecchiati) assert.ok(x.perche, `«${x.nome}» compare senza una ragione scritta: sarebbe un silenzio`);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
