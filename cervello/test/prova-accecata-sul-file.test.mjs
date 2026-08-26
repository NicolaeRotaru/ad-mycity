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
import { accecate, fileSottoMisura, fileSottoMisuraDaCartella, letturaPerAccecate, sorveglia } from "../sorvegliante.mjs";

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
  // AR-837 — dal 26/8 il nome porta il pid di chi lo scrive (due corse in parallelo si
  // sovrascrivevano il segnalibro), quindi il patto fra i due file non è più «stesso nome» ma
  // «stesso INIZIO di nome»: la guardia cerca per prefisso, lo strumento scrive col prefisso più
  // il suo pid. Se un domani uno dei due cambia forma, questo caso diventa rosso — ed è l'unica
  // cosa che tiene insieme due costanti che vivono in due file (il sorvegliante non può importare
  // `non-vacuita.mjs`: quel modulo, all'import, aggancia i gestori di segnale).
  const nome = String(nv.FOGLIETTO).split("/").pop();
  assert.ok(
    nome.startsWith(FOGLIETTO_MISURA),
    `il nome scritto deve cominciare col prefisso cercato, o la guardia cerca un foglietto che nessuno scrive: ${nv.FOGLIETTO} vs ${FOGLIETTO_MISURA}`,
  );
  assert.match(nome, new RegExp(`^${FOGLIETTO_MISURA}-\\d+\\.json$`), "e deve portare il pid, o due corse in parallelo tornano a sovrascriversi");
  assert.equal(nv.PREFISSO_FOGLIETTO, FOGLIETTO_MISURA, "le due costanti dicono la stessa cosa: se divergono, la guardia guarda altrove");
});

// ── AR-837: i foglietti sono tanti quante le corse, e si sommano ─────────────

test("AR-837: la guardia somma TUTTI i foglietti, non ne cerca uno col nome di ieri", () => {
  // Il difetto che questo caso ferma: cercare `_tmp_non-vacuita-in-corso.json` esatto. Da AR-837
  // ogni corsa ci mette il proprio pid nel nome, quindi quel nome non lo scrive più nessuno — e la
  // guardia tornerebbe ad accusare proprio i file che uno strumento sta tenendo rotti apposta.
  const carta = (f) => JSON.stringify({ file: f, originale: "…", quando: "ora", pid: 1 });
  const cartella = ["README.md", "_tmp_non-vacuita-in-corso-11.json", "_tmp_non-vacuita-in-corso-22.json", "_tmp_altro-11.json"];
  const testi = { "_tmp_non-vacuita-in-corso-11.json": carta("cervello/uno.mjs"), "_tmp_non-vacuita-in-corso-22.json": carta("cervello/due.mjs") };
  const r = fileSottoMisuraDaCartella(cartella, (n) => testi[n] ?? null);
  assert.deepEqual([...r.file].sort(), ["cervello/due.mjs", "cervello/uno.mjs"], "due corse in parallelo tengono rotti due file: vanno protetti tutti e due");
  assert.deepEqual(r.motivi, [], "foglietti sani non producono rumore");
});

test("AR-837: un foglietto rotto in mezzo agli altri non zittisce né fa perdere i sani", () => {
  const cartella = ["_tmp_non-vacuita-in-corso-11.json", "_tmp_non-vacuita-in-corso-22.json"];
  const testi = {
    "_tmp_non-vacuita-in-corso-11.json": "{ questo non è json",
    "_tmp_non-vacuita-in-corso-22.json": JSON.stringify({ file: "cervello/due.mjs", originale: "…", quando: "ora", pid: 2 }),
  };
  const r = fileSottoMisuraDaCartella(cartella, (n) => testi[n]);
  assert.deepEqual([...r.file], ["cervello/due.mjs"], "il foglietto illeggibile non deve far perdere quello buono");
  assert.equal(r.motivi.length, 1, "e il dubbio si dichiara, non si ingoia");
});

test("AR-837: una cartella senza foglietti è il caso normale e non dice niente", () => {
  const r = fileSottoMisuraDaCartella(["README.md", "cervello"], () => null);
  assert.equal(r.file.size, 0);
  assert.deepEqual(r.motivi, []);
});
