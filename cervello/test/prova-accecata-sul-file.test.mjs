// AR-713 — «prova accecata» si giudica sul FILE, e non mentre uno strumento lo tiene rotto apposta.
//
// LA STORIA. Il 15/8 il sorvegliante ha ripetuto UNDICI volte che la mutazione di AR-530 su
// `cervello/scrivi-json.mjs` non trovava più il suo pezzo. Il pezzo c'era: `grep -c` lo trovava, e
// `mutazioni-orfane --tutte` diceva 472 su 472 agganciate. Un allarme grave e falso, ripetuto, su un
// lavoro sano — cioè il modo esatto in cui si impara a scorrere anche gli allarmi veri (AR-699).
//
// COSA PROVA QUESTO FILE, eseguendo la decisione vera:
//   ① il giudizio poggia sul file letto da DISCO, non sul pezzo che il chiamante ha in mano: un
//      frammento parziale non deve poter far risultare orfana una mutazione che è ancora agganciata;
//   ② un file che uno strumento di misura sta tenendo rotto in questo momento (il foglietto di
//      AR-708) non si accusa: si dichiara, e l'accusa torna appena la corsa finisce;
//   ③ una mutazione DAVVERO staccata resta un'accusa — la cura non deve zittire i rossi veri;
//   ④ un file che non riesco a leggere non è «nessuna mutazione accecata»: è un ⚪ dichiarato.

import { test } from "node:test";
import assert from "node:assert/strict";
import { accecate, fileSottoMisura, letturaPerAccecate, sorveglia } from "../sorvegliante.mjs";

const MU = { file: "cervello/x.mjs", difetto: "AR-1", nome: "il cuore del fix", cerca: "const cuore = vero;" };

// Il file intero su disco: il pezzo della mutazione sta in fondo, LONTANO dalla riga modificata.
const FILE_INTERO = ["riga uno", "riga due — questa l'ho appena cambiata io", "…", MU.cerca, "riga finale"].join("\n");
// Quello che un chiamante distratto potrebbe passare: solo il pezzo toccato.
const FRAMMENTO = "riga due — questa l'ho appena cambiata io";

// ── ① Il disco comanda sul frammento ────────────────────────────────────────

test("un frammento parziale non fa risultare orfana una mutazione ancora agganciata", () => {
  const su = { voci: [], motivi: [] };
  const lettura = letturaPerAccecate("cervello/x.mjs", { contenuto: FRAMMENTO }, () => FILE_INTERO, new Set());
  const r = accecate("cervello/x.mjs", [MU], lettura);
  assert.deepEqual(r.voci, su.voci, `il pezzo è nel file su disco: accusarlo è un falso allarme (${JSON.stringify(r.voci)})`);
  assert.deepEqual(r.motivi, [], "e non è nemmeno un ⚪: il file l'ho letto");
});

test("il giro intero legge da disco: `sorveglia` non accusa quando il pezzo è fuori dal diff", () => {
  const esito = sorveglia({
    toccati: [{ file: "cervello/x.mjs", aggiunte: [{ n: 2, testo: FRAMMENTO }], contenuto: FRAMMENTO }],
    mutanti: [MU],
    malattie: [{ id: "finta", pattern: "non-combacia-mai", estensioni: [".mjs"] }],
    leggi: () => FILE_INTERO,
  });
  const accuse = esito.voci.filter((v) => v.classe === "prova-accecata");
  assert.equal(accuse.length, 0, `nessuna accusa attesa, arrivate: ${accuse.map((v) => v.cosa).join(" · ")}`);
});

// ── ② Chi è sotto misura non si accusa ──────────────────────────────────────

test("il foglietto di una misura in corso dice quale file è rotto apposta", () => {
  const f = fileSottoMisura(JSON.stringify({ file: "cervello/x.mjs", originale: "…", quando: "ora" }));
  assert.deepEqual([...f.file], ["cervello/x.mjs"]);
  assert.equal(f.motivo, null);
});

test("un file tenuto rotto da chi misura non viene accusato, ma la cosa si dichiara", () => {
  const lettura = letturaPerAccecate("cervello/x.mjs", {}, () => "il file adesso è mutato", new Set(["cervello/x.mjs"]));
  const r = accecate("cervello/x.mjs", [MU], lettura);
  assert.equal(r.voci.length, 0, "accusare chi sta misurando è il falso allarme che AR-713 cura");
  assert.equal(r.motivi.length, 1, "e il silenzio non basta: va detto che lì non ho guardato");
  assert.match(r.motivi[0], /sta tenendo rotto apposta/);
});

test("finita la misura, lo stesso file torna giudicabile: la cura non è un'esenzione permanente", () => {
  const lettura = letturaPerAccecate("cervello/x.mjs", {}, () => "il file adesso è mutato", new Set());
  const r = accecate("cervello/x.mjs", [MU], lettura);
  assert.equal(r.voci.length, 1, "fuori dalla finestra della misura l'accusa deve tornare");
});

test("un foglietto illeggibile non zittisce nessuno, e lo dice", () => {
  const f = fileSottoMisura("{ questo non è json");
  assert.equal(f.file.size, 0, "se non so chi è sotto misura giudico tutti: il dubbio non assolve");
  assert.match(f.motivo, /non è JSON/);
});

test("nessun foglietto è il caso normale, e non produce nessun motivo", () => {
  const f = fileSottoMisura(null);
  assert.equal(f.file.size, 0);
  assert.equal(f.motivo, null, "un ⚪ stampato a ogni modifica sarebbe rumore, non trasparenza");
});

// ── ③ I rossi veri restano rossi ────────────────────────────────────────────

test("una mutazione davvero staccata resta un'accusa grave", () => {
  const lettura = letturaPerAccecate("cervello/x.mjs", { contenuto: FILE_INTERO }, () => "il pezzo qui non c'è più", new Set());
  const r = accecate("cervello/x.mjs", [MU], lettura);
  assert.equal(r.voci.length, 1);
  assert.equal(r.voci[0].classe, "prova-accecata");
  assert.equal(r.voci[0].gravita, "grave");
  assert.match(r.voci[0].cosa, /AR-1/);
});

test("il contenuto passato dal chiamante NON assolve un file il cui disco ha perso il pezzo", () => {
  // È il verso opposto di ①, e conta uguale: se qualcuno passasse il vecchio contenuto, il disco
  // deve comandare lo stesso — altrimenti il freno si disinnesca passandogli il testo giusto.
  const esito = sorveglia({
    toccati: [{ file: "cervello/x.mjs", aggiunte: [], contenuto: FILE_INTERO }],
    mutanti: [MU],
    leggi: () => "su disco il pezzo non c'è più",
  });
  assert.equal(esito.voci.filter((v) => v.classe === "prova-accecata").length, 1);
});

// ── ④ Quello che non ho potuto leggere si dichiara ──────────────────────────

test("un file illeggibile è un ⚪ dichiarato, non un verde", () => {
  const lettura = letturaPerAccecate("cervello/x.mjs", {}, () => {
    throw new Error("permesso negato");
  }, new Set());
  const r = accecate("cervello/x.mjs", [MU], lettura);
  assert.equal(r.voci.length, 0);
  assert.match(r.motivi[0], /permesso negato/);
  assert.match(r.motivi[0], /non ho potuto controllare/);
});

test("un file sparito da disco è un ⚪ dichiarato con il suo motivo", () => {
  const lettura = letturaPerAccecate("cervello/x.mjs", {}, () => null, new Set());
  assert.equal(lettura.testo, null);
  assert.match(accecate("cervello/x.mjs", [MU], lettura).motivi[0], /non c'è più su disco/);
});

test("senza un modo di leggere non si inventa un verdetto", () => {
  const r = accecate("cervello/x.mjs", [MU], letturaPerAccecate("cervello/x.mjs", { contenuto: FILE_INTERO }, null, new Set()));
  assert.equal(r.voci.length, 0);
  assert.match(r.motivi[0], /un modo di leggere/);
});

// ── Il repo VERO: il foglietto ha il nome che non-vacuita scrive davvero ────

test("il nome del foglietto è lo stesso che scrive lo strumento di misura", async () => {
  const nv = await import("../non-vacuita.mjs");
  const { FOGLIETTO_MISURA } = await import("../sorvegliante.mjs");
  assert.ok(
    String(nv.FOGLIETTO).endsWith(FOGLIETTO_MISURA),
    `i due nomi devono combaciare, altrimenti la guardia cerca un foglietto che nessuno scrive: ${nv.FOGLIETTO} vs ${FOGLIETTO_MISURA}`,
  );
});
