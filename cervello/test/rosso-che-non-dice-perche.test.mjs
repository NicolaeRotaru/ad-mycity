#!/usr/bin/env node
// 🧪 UN ROSSO DEVE DIRE PERCHÉ (AR-491).
//
// Il 3/8 il cancello del lotto ha bocciato tre giri di fila sul contatore delle consegne mute. Nel
// log comparivano le ultime sei righe del guardiano — e siccome quel guardiano veniva lanciato con
// `--json`, quelle sei righe erano le graffe di chiusura del documento:
//
//     ❌ consegne senza esito (contatore) (exit 1)
//          },
//          "tetti": {
//            "consegne_mute": 13,
//            "cabina_ferma_giorni": 3
//          }
//        }
//
// Cioè: il motivo esisteva, il guardiano lo aveva scritto, e chi leggeva non poteva vederlo. Sono
// state tre indagini alla cieca su un rosso che parlava. La regola di casa dice che un cancello
// sempre rosso viene aggirato al secondo giro; un cancello rosso e MUTO ci arriva prima, perché
// l'unica mossa che resta a chi legge è tirare a indovinare.
//
// La riparazione non è «stampare più righe» (il log diventa illeggibile e il difetto torna): è
// scegliere le righe per CONTENUTO — quelle che portano un marcatore di verdetto — e tornare alla
// coda solo quando non ce n'è nessuna, dichiarando così di non aver trovato il motivo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { righeMotivo } from "../cancello-lotto.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

/** L'uscita vera del contatore in `--json`: il motivo c'è, ma non è in fondo. */
const USCITA_JSON = [
  "{",
  '  "_cosa_e": "quante volte ho consegnato senza dire com\'è andata",',
  '  "verdetto": {',
  '    "righe": [',
  '      "❌ 14 consegne mute contro un tetto di 13: il debito si è allargato, non ridotto."',
  "    ]",
  "  },",
  '  "tetti": {',
  '    "consegne_mute": 13,',
  '    "cabina_ferma_giorni": 3',
  "  }",
  "}",
];

test("il motivo non è in coda: la coda va scelta per contenuto, non per posizione", () => {
  const mostrate = righeMotivo(USCITA_JSON);
  assert.ok(
    mostrate.some((r) => r.includes("il debito si è allargato")),
    "chi legge il log deve vedere la riga che dice PERCHÉ è rosso",
  );
  assert.ok(!mostrate.every((r) => /^[\s}\]]*$/.test(r)), "sei righe di sole graffe non sono un motivo");
});

test("il motivo lo trova anche in italiano, dove il ❌ arriva prima del referto", () => {
  const uscita = [
    "📮 VERDETTI MUTI",
    "   Consegne: 18",
    "   ❌ la Cabina è ferma da 4 giorni rispetto all'ultima consegna (tetto 3).",
    "",
    "   Referto: MyCity-Vault/90-Memoria-AI/auto-coscienza/verdetti-muti.json",
  ];
  const mostrate = righeMotivo(uscita);
  assert.equal(mostrate.length, 1);
  assert.match(mostrate[0], /la Cabina è ferma da 4 giorni/);
});

test("un cieco dichiarato è un motivo: ⚪ non si perde per strada", () => {
  const uscita = ["avvio", "⚪ CIECO: né origin/main né main esistono qui — non posso contare niente.", "fine"];
  assert.deepEqual(righeMotivo(uscita), [
    "⚪ CIECO: né origin/main né main esistono qui — non posso contare niente.",
  ]);
});

// ── AR-656: l'intestazione senza il suo elenco ────────────────────────────────────────────────
//
// Il 13/8 il cancello in CI è uscito cieco due volte di fila e nel log c'erano solo queste due righe:
// «⚪ non ho potuto misurare:» e «⚪ nessuna voce grave, ma la misura è incompleta». Il perché il
// sorvegliante lo aveva scritto — nelle righe puntate SOTTO l'intestazione, che non portano nessun
// marcatore e finivano quindi nel cestino del filtro. Due indagini alla cieca su un guardiano che
// la sua ragione ce l'aveva scritta dentro: la stessa forma di AR-491, mezza riparata.

test("un'intestazione che finisce in due punti si porta dietro il suo elenco", () => {
  const uscita = [
    "👁️ SORVEGLIANTE — 0 file toccati nel delta",
    "⚪ non ho potuto misurare:",
    "   · confronto con «HEAD» a mani vuote: nessun file nel perimetro, quindi non ho misurato niente",
    "   · registro mutanti vuoto: non posso sapere se ho accecato una prova",
    "",
    "⚪ nessuna voce grave, ma la misura è incompleta: cieco non è verde.",
  ];
  const mostrate = righeMotivo(uscita);
  assert.ok(
    mostrate.some((r) => r.includes("a mani vuote")),
    "senza le righe puntate il log dice CHE è cieco e non DI COSA: è l'indagine alla cieca che AR-491 doveva chiudere",
  );
  assert.ok(mostrate.some((r) => r.includes("registro mutanti vuoto")), "l'elenco va preso intero, non solo la prima voce");
});

test("le righe puntate lontane dall'intestazione non vengono raccolte", () => {
  const uscita = [
    "❌ un rosso qualsiasi, senza elenco",
    "   testo normale",
    "   · questa voce non appartiene a nessuna intestazione",
  ];
  assert.deepEqual(righeMotivo(uscita), ["❌ un rosso qualsiasi, senza elenco"], "solo un'intestazione con i due punti apre un elenco");
});

test("quando il motivo non c'è si torna alla coda, non a un elenco vuoto", () => {
  const uscita = ["riga 1", "riga 2", "riga 3"];
  assert.deepEqual(righeMotivo(uscita), ["riga 1", "riga 2", "riga 3"]);
  assert.equal(righeMotivo([]).length, 0, "nessuna riga in entrata, nessuna inventata in uscita");
});

test("più motivi: si mostrano gli ultimi sei, non tutti e non uno", () => {
  const uscita = Array.from({ length: 20 }, (_, i) => `❌ problema numero ${i + 1}`);
  const mostrate = righeMotivo(uscita);
  assert.equal(mostrate.length, 6);
  assert.equal(mostrate.at(-1), "❌ problema numero 20");
});

test("il contatore non viene più lanciato in --json dentro il cancello", () => {
  const sorgente = readFileSync(join(REPO, "cervello/cancello-lotto.mjs"), "utf8");
  const riga = sorgente.split("\n").find((r) => r.includes("conta-verdetti-muti.mjs") && r.includes("esegui("));
  assert.ok(riga, "il cancello deve continuare a lanciare il contatore");
  assert.ok(!riga.includes("--json"), "in JSON il verdetto finisce in mezzo al documento e il log ne vede solo le graffe");
});

// ── AR-531: l'esenzione già dichiarata vale anche sul delta ────────────────────────────────────
//
// `malattie.json` porta per ogni forma un elenco `esenti` con file e PERCHÉ, e la spazzata dei
// fratelli lo rispetta. Il controllo sulle righe aggiunte no: cercava il pattern senza mai guardare
// se quel file fosse già stato dichiarato. Il 4/8 ha accusato quattordici volte di fila
// `pre-scrittura.mjs` — il guardiano che INTERCETTA il bypass, che per riconoscerlo deve nominarlo,
// esente con un motivo scritto da un'altra sessione poche ore prima. Quattordici allarmi su una riga
// dichiarata sono il rumore che spegne i freni.

import { sorveglia as sorveglia531 } from "../sorvegliante.mjs";

const MALATTIA = {
  id: "bypass-del-cancello",
  nome: "Un comando che salta il cancello",
  pattern: "--no-verify",
  esenti: [{ file: "cervello/pre-scrittura.mjs", perche: "è il guardiano che quel bypass lo intercetta: per riconoscerlo deve nominarlo" }],
};
const RIGA = { n: 120, testo: '  if (/\\bgit\\s+commit\\b[^\\n]*(--no-verify)/.test(c)) {' };

test("un file dichiarato esente, col suo perché, non viene accusato sulle righe aggiunte", () => {
  const r = sorveglia531({
    toccati: [{ file: "cervello/pre-scrittura.mjs", aggiunte: [RIGA], contenuto: null }],
    malattie: [MALATTIA],
    mutanti: [{ file: "x.mjs", test: "y.mjs" }],
  });
  assert.deepEqual(
    r.voci.filter((v) => v.classe === "malattia-nuova"),
    [],
    "l'esenzione è scritta col motivo: accusare lo stesso è il rumore che spegne i freni",
  );
});

test("lo stesso pattern in un file NON esente viene ancora preso", () => {
  const r = sorveglia531({
    toccati: [{ file: "cervello/qualcun-altro.mjs", aggiunte: [RIGA], contenuto: null }],
    malattie: [MALATTIA],
    mutanti: [{ file: "x.mjs", test: "y.mjs" }],
  });
  assert.equal(
    r.voci.filter((v) => v.classe === "malattia-nuova").length,
    1,
    "il fix non deve spegnere il controllo insieme al rumore",
  );
});

test("un'esenzione senza perché non zittisce niente", () => {
  const muta = { ...MALATTIA, esenti: [{ file: "cervello/pre-scrittura.mjs" }] };
  const r = sorveglia531({
    toccati: [{ file: "cervello/pre-scrittura.mjs", aggiunte: [RIGA], contenuto: null }],
    malattie: [muta],
    mutanti: [{ file: "x.mjs", test: "y.mjs" }],
  });
  assert.equal(
    r.voci.filter((v) => v.classe === "malattia-nuova").length,
    1,
    "«esente» senza spiegazione è il modo educato di zittire: resta un'accusa viva (AR-338)",
  );
});

// ── AR-707 · il ⚪ del banco delle mutazioni deve arrivare fin qui ────────────
//
// Il caso vero, misurato in CI il 15/8. Il banco stampava il «non ho misurato» con ⚠️, che in
// questo filtro non è un marcatore. Il cancello ha mostrato due mutazioni RIUSCITE — passate solo
// perché il loro titolo CITA il carattere ⚪ — e ha nascosto l'unica che non aveva misurato,
// lasciando in fondo «1 controllo non ha potuto misurare» senza dire quale.
//
// Cioè: il buco era dichiarato e illeggibile insieme. Questo caso tiene agganciate le due metà —
// il simbolo che il banco usa e i simboli che questo filtro cerca — così se una delle due cambia
// da sola, si vede qui invece che in produzione.

const USCITA_BANCO = [
  "🧨 LA PROVA CHE LE PROVE PROVINO",
  "",
  "  ✅ AR-683 — invertendo il filtro «una prova NON ESEGUITA è ⚪» diventa rosso",
  "  ⚪ AR-613 — rimettendo un bottone dentro la linguetta il caso diventa rosso:",
  "     · il test ha dichiarato di non poter guardare (gli manca lo strumento)",
  "",
  "⚪ 1 mutazione/i non ha potuto misurare (vedi sopra).",
];

test("AR-707 · la mutazione che NON ha misurato arriva col suo nome, non solo col conto", () => {
  const mostrate = righeMotivo(USCITA_BANCO);
  assert.ok(
    mostrate.some((r) => r.includes("AR-613") && r.includes("⚪")),
    `chi legge la CI deve sapere QUALE non ha misurato; ha visto invece:\n${mostrate.join("\n")}`,
  );
});

test("AR-707 · e col suo perché: il motivo viaggia attaccato al nome", () => {
  const mostrate = righeMotivo(USCITA_BANCO);
  assert.ok(
    mostrate.some((r) => r.includes("gli manca lo strumento")),
    "senza il motivo resta «non ho misurato» e basta, che manda a indagare sul fix invece che sull'ambiente",
  );
});

test("AR-707 · un ✅ che NOMINA il ⚪ non deve travestirsi da problema", () => {
  // È il tranello che ha nascosto il vero cieco: due righe verdi selezionate perché il loro testo
  // contiene il carattere. Il filtro non le può distinguere da sole — le distingue il posto del
  // simbolo, in testa alla riga.
  const mostrate = righeMotivo(USCITA_BANCO);
  const verdiMostrate = mostrate.filter((r) => r.trimStart().startsWith("✅"));
  assert.deepEqual(verdiMostrate, [], `una mutazione riuscita non è un motivo: mostrate ${verdiMostrate.length}`);
});
