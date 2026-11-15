// AR-969 — togliere un programma che nessuno lancia non è spegnere un freno.
//
// Il caso vero, l'11/10 e di nuovo il 15/11: cancellare `cervello/round2-applica.mjs`, un programma
// usa-e-getta del 25/7 già applicato, faceva nascere nel sorvegliante del delta cinque voci gravi
// «difesa-rimossa». Le cinque righe NOMINAVANO giro.sh, costo-ai.mjs, motore-ai.sh e
// pagella-intelligenza.mjs (un oggetto `verifica`, un racconto, un suggerimento a video), ma il file
// non lo lanciava nessuno: non poteva tenere acceso niente. La CI era rossa per una menzione.
//
// E il verso opposto della stessa confusione: per assolvere una chiamata vera tolta da un file vivo,
// bastava che nello stesso lotto una nota `.md`, o il racconto di una scheda, scrivesse il nome di quel
// freno. Menzione ≠ chiamata vale nei due versi.
//
// Le prove passano dal cuore puro (`sorveglia`, `chiLoLanciava`) con una BASE finta: ogni caso è un
// ingresso esatto con un'uscita esatta. Le righe della base finta sono copiate dalle forme vere del
// 15/11 (l'esenzione nel registro delle porte, la voce dello scadenzario, la stringa di testo di un
// altro programma usa-e-getta, i commenti di porte-gemelle): è la variante scomoda, non quella comoda.
//
// Il primo giro di correzione (15/11, dopo il collaudo bocciato) aggiunge la sezione ④: dentro una
// prova una stringa che nomina un file non è una chiamata. La prova stessa di AR-969 era la
// dimostrazione: le sue stringhe facevano tacere chi toglie porte-gemelle dal cancello, e le chiavi
// della sua base finta tenevano «in vita» due programmi morti.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  sorveglia,
  gravi,
  leggiDiff,
  leggiRimozioni,
  indiceDifese,
  chiLoLanciava,
  parteCheChiama,
  parteCheRaggiungeInProva,
  eFileDiProva,
  radiceDelNome,
  righeDaGitGrep,
  eCampoDiProsa,
  PUO_ESSERE_MORTO,
} from "../sorvegliante.mjs";

// ─── la base finta ─────────────────────────────────────────────────────────

/** Una base finta: percorso → contenuto. `cerca` fa quello che fa `git grep -F` sulla base. */
function base(file) {
  const chiamate = [];
  const cerca = (nome) => {
    chiamate.push(nome);
    const fuori = [];
    for (const [f, testo] of Object.entries(file)) {
      testo.split("\n").forEach((t, i) => {
        if (t.includes(nome)) fuori.push({ file: f, n: i + 1, testo: t });
      });
    }
    return fuori;
  };
  cerca.chiamate = chiamate;
  return cerca;
}

// Il file da togliere, con le cinque righe vere del 15/11 che nominano un freno, più la riga con
// cui il programma riconosce sé stesso (codice vero, che nomina il PROPRIO nome).
const MORTO = "cervello/round2-applica.mjs";
const RIGHE_MORTO = [
  'const GIRO = join(AD_ROOT, "cervello/giro.sh");',
  'const PROVA_FRENO = { file: "cervello/costo-ai.mjs", pattern: "tokenPerGate", presente: true };',
  '      come: "Fix mergiato in main (PR #519, cervello/costo-ai.mjs): il gate ora usa max(token_totali, token_stimati).",',
  '      verifica: { file: "cervello/motore-ai.sh", pattern: "token_reali|usage", presente: true },',
  '      ? "\\n   Ora rimisura:  node cervello/pagella-intelligenza.mjs --gate\\n"',
  'if (process.argv[1] && process.argv[1].endsWith("round2-applica.mjs")) main();',
];

// Chi nomina il programma alla base, nelle forme vere: nessuna di queste righe lo lancia.
const NOMINATO_MA_NON_LANCIATO = {
  [MORTO]: [
    "//   node cervello/round2-applica.mjs --dry   -> dice cosa farebbe, non tocca nulla",
    ...RIGHE_MORTO,
  ].join("\n"),
  "cervello/atti-con-porte.json": [
    '   "perche_conta": "AR-796, vivo il 23/8/2026. Le porte: auto-fix.mjs, allinea-scan-cantiere.mjs, round2-applica.mjs.",',
    "   \"esenti\": [",
    "    {",
    '     "file": "cervello/round2-applica.mjs",',
    '     "perche": "Uno-shot del 25/7 già applicato e idempotente.",',
    '     "fino_al": "2026-11-14",',
    '     "si_toglie_quando": "quando `cervello/round2-applica.mjs` viene tolto dal repo (AR-969)."',
    "    }",
  ].join("\n"),
  "cervello/scadenzario.json": [
    '      "id": "esenzione-round2-applica",',
    '        "chiave": "cervello/round2-applica.mjs"',
    '      "conseguenza": "Dal 15/11 è scaduta l\'esenzione del programma cervello/round2-applica.mjs.",',
    '      "fonte": "cervello/atti-con-porte.json → esenzione di cervello/round2-applica.mjs, fino_al «2026-11-14».",',
    '      "chi_la_chiude": "Chi toglie round2-applica sposta questa voce in chiuse.",',
  ].join("\n"),
  // Un altro programma usa-e-getta lo nomina in una stringa di TESTO (codice, non commento). Ma quel
  // programma non lo lancia nessuno: lo nomina solo un commento.
  "cervello/registra-programma-intelligenza.mjs": [
    "//   node cervello/registra-programma-intelligenza.mjs         -> scrive",
    "const DECISIONI = `- 2026-07-25 02:00 · Round 2:",
    "creato `cervello/round2-applica.mjs` (idempotente, applica registro e pagella).",
    "`;",
  ].join("\n"),
  "cervello/programma-intelligenza-memoria.mjs":
    "// permesso di git push (AR-142). Stesso schema di registra-programma-intelligenza.mjs e\n// round2-applica.mjs: lo lancia Nicola sul VPS.",
  "cervello/porte-gemelle.mjs": "// `round2-applica.mjs` (67, 73). **Zero su tre passano dal cancello.**",
  "cervello/test/altra-porta-lasciata-aperta.test.mjs": "// punti — auto-fix.mjs, allinea-scan-cantiere.mjs, round2-applica.mjs — e ZERO passavano",
  // Fuori dal codice: la memoria e la prosa citano gli script per mestiere.
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json":
    '      "sintomo": "Cancellato cervello/round2-applica.mjs — uno-shot del 25/7 già applicato",',
  "MyCity-Vault/90-Memoria-AI/DECISIONI.md": "- node cervello/round2-applica.mjs (applicato il 25/7)",
};

// Le difese che quelle righe nominano: mutazioni vere poggiano su questi file.
const DIFESE = indiceDifese({
  mutanti: [
    { difetto: "AR-379", file: "cervello/giro.sh", test: "cervello/test/giro.test.mjs" },
    { difetto: "AR-442", file: "cervello/costo-ai.mjs", test: "cervello/test/costo.test.mjs" },
    { difetto: "AR-562", file: "cervello/motore-ai.sh", test: "cervello/test/motore.test.mjs" },
    { difetto: "AR-175", file: "cervello/pagella-intelligenza.mjs", test: "cervello/test/pagella.test.mjs" },
    { difetto: "AR-966", file: "cervello/atti-con-porte.json", test: "cervello/test/c9.test.mjs" },
  ],
  guardiani: ["cervello/gate-veri.mjs", "cervello/porte-gemelle.mjs"],
});

/** Il diff della cancellazione per intero di un file, con le sue righe. */
function diffCancellazione(file, righe) {
  return [`--- a/${file}`, "+++ /dev/null", `@@ -1,${righe.length} +0,0 @@`, ...righe.map((r) => `-${r}`)];
}

/** Il diff di un file NUOVO, con le sue righe. */
function diffNuovo(file, righe) {
  return ["--- /dev/null", `+++ b/${file}`, `@@ -0,0 +1,${righe.length} @@`, ...righe.map((r) => `+${r}`)];
}

/** Il giro che fa il comando vero: diff → due letture → cuore. `contenuti` = i file come sono DOPO. */
function daDiff(righe, extra = {}, contenuti = {}) {
  const testo = righe.join("\n");
  const agg = leggiDiff(testo);
  const { rimosse, cancellati } = leggiRimozioni(testo);
  const file = new Set([...agg.keys(), ...rimosse.keys()]);
  return sorveglia({
    toccati: [...file].map((f) => ({
      file: f,
      aggiunte: agg.get(f) || [],
      contenuto: cancellati.includes(f) ? null : (contenuti[f] ?? ""),
    })),
    rimossi: [...rimosse].map(([f, r]) => ({ file: f, rimosse: r, cancellato: cancellati.includes(f) })),
    difese: DIFESE,
    malattie: [],
    mutanti: [],
    esiste: () => true,
    ...extra,
  });
}

const difeseRimosse = (e) => gravi(e.voci).filter((v) => v.classe === "difesa-rimossa");

// ─── ① le tre strade del fix_proposto ──────────────────────────────────────

test("① file MORTO con nomi di difese: cancellarlo non fa nascere nessuna voce (il caso del 15/11)", () => {
  const e = daDiff(diffCancellazione(MORTO, RIGHE_MORTO), { cercaAllaBase: base(NOMINATO_MA_NON_LANCIATO) });
  assert.deepEqual(
    difeseRimosse(e).map((v) => `${v.file}:${v.riga}`),
    [],
    "nessuno lo lanciava: le sue righe nominavano dei freni, non li chiamavano",
  );
});

test("…senza la base, la risposta prudente: le voci restano (il contratto di prima, cieco non è verde)", () => {
  const e = daDiff(diffCancellazione(MORTO, RIGHE_MORTO));
  assert.equal(difeseRimosse(e).length, 5, "giro.sh, costo-ai due volte, motore-ai, pagella: cinque righe");
});

test("① file LANCIATO dal giro: cancellarlo fa nascere le voci, e la voce dice chi lo lanciava", () => {
  const vivo = {
    ...NOMINATO_MA_NON_LANCIATO,
    "cervello/giro.sh": 'node "$DIR/cervello/round2-applica.mjs" --gate || true',
    // giro.sh lo lancia il server: l'unità di systemd lo nomina.
    "cervello/vps/mycity-giro.service": "ExecStart=/bin/bash /opt/mycity/ad-mycity/cervello/giro.sh",
  };
  const e = daDiff(diffCancellazione(MORTO, RIGHE_MORTO), { cercaAllaBase: base(vivo) });
  const v = difeseRimosse(e);
  // La riga 1 nomina giro.sh dentro il file che giro.sh lancia: anche quella è una chiamata tolta.
  assert.deepEqual(v.map((x) => x.riga), [1, 2, 3, 4, 5]);
  assert.ok(
    v.every((x) => x.lanciato_da?.includes("cervello/giro.sh")),
    "chi legge l'allarme deve sapere da dove partiva il file tolto",
  );
});

test("① il LANCIATORE tolto nella stessa modifica: le voci restano, perché la domanda si fa alla base", () => {
  // Il gesto che non deve passare in silenzio: tolgo da giro.sh la riga che lanciava il file, e il
  // file insieme. Dopo la modifica nessuno lo nomina più; alla base sì.
  const allaBase = {
    ...NOMINATO_MA_NON_LANCIATO,
    "cervello/giro.sh": 'echo inizio\nnode "$DIR/cervello/round2-applica.mjs" --gate || true',
    "cervello/vps/mycity-giro.service": "ExecStart=/bin/bash /opt/mycity/ad-mycity/cervello/giro.sh",
  };
  const e = daDiff(
    [
      "--- a/cervello/giro.sh",
      "+++ b/cervello/giro.sh",
      "@@ -2,1 +1,0 @@",
      '-node "$DIR/cervello/round2-applica.mjs" --gate || true',
      ...diffCancellazione(MORTO, RIGHE_MORTO),
    ],
    { cercaAllaBase: base(allaBase) },
  );
  assert.equal(
    difeseRimosse(e).filter((v) => v.file === MORTO).length,
    5,
    "staccare il lanciatore e cancellare il file insieme è spegnere cinque freni, non pulire",
  );
});

test("① un file lanciato da un flusso della CI resta vivo anche se il flusso non lo nomina nessuno", () => {
  // I flussi, gli hook, le prove partono da soli: nessuno li nomina, e non per questo sono morti.
  const e = daDiff(diffCancellazione(MORTO, RIGHE_MORTO), {
    cercaAllaBase: base({ ...NOMINATO_MA_NON_LANCIATO, ".github/workflows/notte.yml": "      - run: node cervello/round2-applica.mjs" }),
  });
  assert.equal(difeseRimosse(e).length, 5);
});

test("① ⑥a resta: un file morto che è esso stesso una difesa dichiarata dà ancora la sua voce", () => {
  const difese = new Map(DIFESE);
  difese.set(MORTO, "è il codice su cui poggia la mutazione di AR-000");
  const e = daDiff(diffCancellazione(MORTO, RIGHE_MORTO), {
    difese,
    cercaAllaBase: base(NOMINATO_MA_NON_LANCIATO),
  });
  const v = difeseRimosse(e);
  assert.equal(v.length, 1, "le righe non chiamavano niente, ma il file era un freno");
  assert.equal(v[0].riga, null, "è la voce del file cancellato (⑥a), non di una riga");
});

// ─── ① chiLoLanciava, la funzione pura ─────────────────────────────────────

test("chiLoLanciava: commenti, prosa, racconti, riferimenti e memoria non lanciano niente", () => {
  const cerca = base(NOMINATO_MA_NON_LANCIATO);
  const r = chiLoLanciava(MORTO, cerca);
  assert.deepEqual(r, { lanciato: false, cieco: false, da: [] });
  assert.equal(cerca.chiamate[0], "round2-applica", "si cerca il nome senza estensione, come il git grep del fix");
});

test("chiLoLanciava: un programma lanciato solo da un programma morto è morto — a zero passi sembrerebbe vivo", () => {
  const cerca = base(NOMINATO_MA_NON_LANCIATO);
  assert.equal(chiLoLanciava(MORTO, cerca, 1).lanciato, false);
  const zero = chiLoLanciava(MORTO, cerca, 0);
  assert.equal(zero.lanciato, true, "la stringa di testo di registra-programma-intelligenza è codice, non commento");
  assert.deepEqual(zero.da.map((d) => d.file), ["cervello/registra-programma-intelligenza.mjs"]);
});

test("chiLoLanciava: …e se quel programma lo lancia qualcuno, tiene in vita anche il file", () => {
  const cerca = base({
    ...NOMINATO_MA_NON_LANCIATO,
    "cervello/cancello-lotto.mjs": 'passi.push(esegui("registra", "node", ["cervello/registra-programma-intelligenza.mjs"]));',
  });
  const r = chiLoLanciava(MORTO, cerca);
  assert.equal(r.lanciato, true);
  assert.deepEqual(r.da.map((d) => d.file), ["cervello/registra-programma-intelligenza.mjs"]);
});

test("chiLoLanciava: una prova che lo importa lo tiene in vita", () => {
  const cerca = base({ ...NOMINATO_MA_NON_LANCIATO, "cervello/test/round2.test.mjs": 'import { main } from "../round2-applica.mjs";' });
  assert.deepEqual(chiLoLanciava(MORTO, cerca).da.map((d) => d.file), ["cervello/test/round2.test.mjs"]);
});

test("chiLoLanciava: cieco non è verde — senza base, o con la base che non risponde, il file è lanciato", () => {
  assert.deepEqual(chiLoLanciava(MORTO, null), { lanciato: true, cieco: true, da: [] });
  assert.deepEqual(chiLoLanciava(MORTO, () => null), { lanciato: true, cieco: true, da: [] });
  // Il programma che lo nomina va interrogato a sua volta, e lì la base non risponde: resta vivo.
  let n = 0;
  const cieca = (nome) => (n++ === 0 ? base(NOMINATO_MA_NON_LANCIATO)(nome) : null);
  const r = chiLoLanciava(MORTO, cieca);
  assert.equal(r.lanciato, true);
  assert.equal(r.cieco, true);
});

test("PUO_ESSERE_MORTO: solo i programmi lanciati per nome, direttamente in cervello/", () => {
  for (const f of ["cervello/round2-applica.mjs", "cervello/giro.sh", "cervello/x.py"]) assert.ok(PUO_ESSERE_MORTO.test(f), f);
  for (const f of [
    ".github/workflows/notte.yml",
    "cervello/test/x.test.mjs",
    "cervello/vps/mycity-giro.service",
    "cervello/publishers/telegram.mjs",
    "pannello/src/app/page.tsx",
    ".claude/settings.json",
  ]) {
    assert.ok(!PUO_ESSERE_MORTO.test(f), f);
  }
});

test("radiceDelNome e righeDaGitGrep: il nome senza estensione, e le righe di git grep -z lette intere", () => {
  assert.equal(radiceDelNome("cervello/round2-applica.mjs"), "round2-applica");
  assert.equal(radiceDelNome("cervello/giro.sh"), "giro");
  const uscita =
    "origin/main:cervello/giro.sh\u000012\u0000node cervello/x.mjs\n" +
    "origin/main:cervello/città/è.mjs\u00003\u0000import \"../x.mjs\"\n";
  assert.deepEqual(righeDaGitGrep(uscita, "origin/main"), [
    { file: "cervello/giro.sh", n: 12, testo: "node cervello/x.mjs" },
    { file: "cervello/città/è.mjs", n: 3, testo: 'import "../x.mjs"' },
  ]);
});

// ─── ② «l'ho rimesso altrove?» conta solo le righe aggiunte che chiamano ────

const TOLTA_DAL_CANCELLO = [
  "--- a/cervello/cancello-lotto.mjs",
  "+++ b/cervello/cancello-lotto.mjs",
  "@@ -5,1 +5,0 @@",
  '-    passi.push(esegui("gate", "node", ["cervello/gate-veri.mjs"]));',
];

test("② una chiamata vera tolta da un file vivo resta grave anche se una nota .md nomina quel freno", () => {
  const e = daDiff([
    ...TOLTA_DAL_CANCELLO,
    "--- a/memoria-squadra/tech.md",
    "+++ b/memoria-squadra/tech.md",
    "@@ -3,0 +4,1 @@",
    "+- 2026-11-15 · ho spostato `node cervello/gate-veri.mjs` nella visita",
  ]);
  assert.equal(difeseRimosse(e).length, 1, "scrivere il nome di un freno in un quaderno non lo rilancia");
});

test("② …e anche se lo nomina il racconto di una scheda o il riferimento di un registro", () => {
  const e = daDiff([
    ...TOLTA_DAL_CANCELLO,
    "--- a/cervello/atti-con-porte.json",
    "+++ b/cervello/atti-con-porte.json",
    "@@ -3,0 +4,3 @@",
    '+   "nota": "il gate cervello/gate-veri.mjs ora lo lancia la visita",',
    '+   "fonte": "cervello/gate-veri.mjs",',
    '+     "file": "cervello/gate-veri.mjs",',
    "--- a/MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json",
    "+++ b/MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json",
    "@@ -3,0 +4,1 @@",
    '+      "sintomo": "spostato node cervello/gate-veri.mjs",',
  ]);
  assert.equal(difeseRimosse(e).length, 1, "menzione ≠ chiamata, anche nel verso dello spostamento");
});

test("② lo spostamento VERO in un altro file di codice resta riconosciuto (AR-516)", () => {
  const e = daDiff([
    ...TOLTA_DAL_CANCELLO,
    "--- a/cervello/visita.mjs",
    "+++ b/cervello/visita.mjs",
    "@@ -9,0 +10,1 @@",
    '+  passi.push(esegui("gate", "node", ["cervello/gate-veri.mjs"]));',
  ]);
  assert.equal(difeseRimosse(e).length, 0, "punire un riordino insegna a non riordinare mai più niente");
});

test("parteCheChiama: chiama solo il codice, fuori da commenti, racconti e riferimenti", () => {
  assert.equal(parteCheChiama('node cervello/x.mjs', "cervello/giro.sh"), "node cervello/x.mjs");
  assert.equal(parteCheChiama('  "gate": "node cervello/x.mjs",', "cervello/y.json"), '  "gate": "node cervello/x.mjs",');
  assert.equal(parteCheChiama("// node cervello/x.mjs", "cervello/y.mjs"), "");
  assert.equal(parteCheChiama("node cervello/x.mjs", "consegne/nota.md"), "");
  assert.equal(parteCheChiama('  "file": "cervello/x.mjs",', "cervello/mutanti.json"), "");
  assert.equal(parteCheChiama('  "id": "esenzione-x",', "cervello/scadenzario.json"), "");
  assert.equal(parteCheChiama('  "gate": "node cervello/x.mjs",', "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"), "");
});

// ─── ③ i campi che raccontano nello scadenzario e nel registro delle porte ──

test("③ una voce dello scadenzario chiusa in forma corta, senza la sua fonte, non fa nascere difesa-rimossa", () => {
  // La riga della fonte nomina il registro delle porte, su cui poggiano mutazioni: è un racconto.
  const e = daDiff([
    "--- a/cervello/scadenzario.json",
    "+++ b/cervello/scadenzario.json",
    "@@ -40,4 +40,0 @@",
    '-      "conseguenza": "Dal 15/11 porte-gemelle diventa rosso: lo dice cervello/atti-con-porte.json.",',
    '-      "fonte": "cervello/atti-con-porte.json → esenzione di cervello/round2-applica.mjs, fino_al «2026-11-14».",',
    '-      "chi_la_chiude": "Chi toglie il programma aggiorna cervello/atti-con-porte.json nello stesso lavoro.",',
    '-   "si_toglie_quando": "quando cervello/atti-con-porte.json non ha più questa esenzione."',
  ]);
  assert.deepEqual(difeseRimosse(e).map((v) => v.riga), []);
  for (const k of ["fonte", "chi_la_chiude", "si_toglie_quando", "conseguenza", "perche_conta"]) {
    assert.equal(eCampoDiProsa(`  "${k}": "cervello/x.mjs",`, "cervello/scadenzario.json"), true, k);
  }
});

// ─── ④ dentro una prova, una stringa che nomina un file non è una chiamata ──
// Primo giro di correzione (15/11). Il collaudo l'ha misurato sul ramo vero, nei due versi.

const TOLTE_PORTE = [
  "--- a/cervello/cancello-lotto.mjs",
  "+++ b/cervello/cancello-lotto.mjs",
  "@@ -1133,1 +1132,0 @@",
  '-    passi.push(esegui("le porte gemelle di ogni atto", "node", ["cervello/porte-gemelle.mjs"]));',
];

// Le forme vere con cui una prova nomina un freno: la chiave di una base finta, una riga di un diff
// finto, una costante. E una che lo lancia davvero, ma su una copia finta.
const PROVA_CHE_NOMINA_PORTE = diffNuovo("cervello/test/porte-nuove.test.mjs", [
  '  "cervello/porte-gemelle.mjs": "// `round2-applica.mjs` (67, 73). **Zero su tre passano dal cancello.**",',
  `  '-    passi.push(esegui("le porte gemelle di ogni atto", "node", ["cervello/porte-gemelle.mjs"]));',`,
  'const GUARDIANO = "cervello/porte-gemelle.mjs";',
  '  const r = spawnSync(process.execPath, [join(dir, "cervello/porte-gemelle.mjs"), "--json"], { cwd: dir });',
]);

test("④ togliere dal cancello l'unica chiamata a porte-gemelle resta grave anche se una prova dello stesso lotto la nomina o la lancia", () => {
  const e = daDiff([...TOLTE_PORTE, ...PROVA_CHE_NOMINA_PORTE]);
  assert.deepEqual(
    difeseRimosse(e).map((v) => `${v.file}:${v.riga}`),
    ["cervello/cancello-lotto.mjs:1133"],
    "una prova esercita un freno su un caso finto: non lo rimette a girare nel cancello",
  );
});

test("④ …e lo stesso per gate-veri, il freno della lezione L-2026-0813-02", () => {
  const e = daDiff([
    ...TOLTA_DAL_CANCELLO,
    ...diffNuovo("cervello/test/gate-nuovo.test.mjs", [
      `    "cervello/cancello-lotto.mjs": 'passi.push(esegui("gate delle lezioni", "node", ["cervello/gate-veri.mjs"]));',`,
      '  const r = execFileSync("node", [join(REPO, "cervello/gate-veri.mjs")], { encoding: "utf8" });',
    ]),
  ]);
  assert.equal(difeseRimosse(e).length, 1);
});

test("④ il file morto tace per merito di ①, non delle stringhe di una prova: se lo lanciava qualcuno, le cinque voci restano", () => {
  // La forma del ramo vero: la prova del lotto scrive in stringhe le stesse righe del file cancellato,
  // e ne importa uno dei freni. Prima del primo giro di correzione questo bastava a farle tacere tutte,
  // anche con il pezzo ① spento: la prova sul ramo vero non dimostrava niente.
  const vivo = {
    ...NOMINATO_MA_NON_LANCIATO,
    "cervello/giro.sh": 'node "$DIR/cervello/round2-applica.mjs" --gate || true',
    "cervello/vps/mycity-giro.service": "ExecStart=/bin/bash /opt/mycity/ad-mycity/cervello/giro.sh",
  };
  const e = daDiff(
    [
      ...diffCancellazione(MORTO, RIGHE_MORTO),
      ...diffNuovo("cervello/test/togliere.test.mjs", [
        'import { tokenPerGate } from "../costo-ai.mjs";',
        ...RIGHE_MORTO.map((r) => `  ${JSON.stringify(r)},`),
      ]),
    ],
    { cercaAllaBase: base(vivo) },
  );
  assert.deepEqual(difeseRimosse(e).map((v) => v.riga), [1, 2, 3, 4, 5]);
});

// Il gemello usa-e-getta di round2-applica, con due delle sue righe vere che nominano un freno.
const GEMELLO = "cervello/registra-programma-intelligenza.mjs";
const RIGHE_GEMELLO = [
  '    join(AD_ROOT, "cervello/chiusura-loop.mjs"), "registra", "tech",',
  '    ? "\\n   Poi rimisura:  node cervello/pagella-intelligenza.mjs --gate\\n"',
];
// La base dopo l'unione: la prova di AR-969 nomina il gemello come chiave della sua base finta, in
// una riga di un diff finto e in una costante. Nessuna di queste righe lo lancia.
const GEMELLO_NELLA_PROVA = {
  [GEMELLO]: "//   node cervello/registra-programma-intelligenza.mjs         -> scrive",
  "cervello/test/togliere-codice-morto.test.mjs": [
    '  "cervello/registra-programma-intelligenza.mjs": [',
    '    "//   node cervello/registra-programma-intelligenza.mjs         -> scrive",',
    `    "cervello/cancello-lotto.mjs": 'passi.push(esegui("registra", "node", ["cervello/registra-programma-intelligenza.mjs"]));',`,
    'const GEMELLO = "cervello/registra-programma-intelligenza.mjs";',
  ].join("\n"),
  "cervello/programma-intelligenza-memoria.mjs":
    "// permesso di git push (AR-142). Stesso schema di registra-programma-intelligenza.mjs e",
};
const DIFESE_GEMELLO = new Map([...DIFESE, ["cervello/chiusura-loop.mjs", "è il codice su cui poggia la mutazione di AR-209"]]);

test("④ un programma morto nominato solo dalla base finta di una prova resta morto: cancellarlo non fa rossa la CI", () => {
  const e = daDiff(diffCancellazione(GEMELLO, RIGHE_GEMELLO), {
    difese: DIFESE_GEMELLO,
    cercaAllaBase: base(GEMELLO_NELLA_PROVA),
  });
  assert.deepEqual(difeseRimosse(e).map((v) => `${v.file}:${v.riga}`), [], "nominare in un esempio non è lanciare");
  assert.equal(chiLoLanciava(GEMELLO, base(GEMELLO_NELLA_PROVA)).lanciato, false);
});

test("④ …ma una prova che lo importa, lo lancia o ne costruisce il percorso lo raggiunge davvero, e lo tiene in vita", () => {
  for (const riga of [
    'import { main } from "../registra-programma-intelligenza.mjs";',
    'const m = await import("../registra-programma-intelligenza.mjs");',
    'const r = spawnSync(process.execPath, ["cervello/registra-programma-intelligenza.mjs", "--dry"], { cwd: REPO });',
    'const SCRIPT = join(REPO, "cervello", "registra-programma-intelligenza.mjs");',
  ]) {
    const cerca = base({ ...GEMELLO_NELLA_PROVA, "cervello/test/registra.test.mjs": riga });
    assert.deepEqual(chiLoLanciava(GEMELLO, cerca).da.map((d) => d.file), ["cervello/test/registra.test.mjs"], riga);
    const e = daDiff(diffCancellazione(GEMELLO, RIGHE_GEMELLO), { difese: DIFESE_GEMELLO, cercaAllaBase: cerca });
    assert.equal(difeseRimosse(e).length, 2, riga);
  }
});

test("parteCheRaggiungeInProva: raggiunge chi importa, lancia o costruisce il percorso; non chi scrive un esempio", () => {
  for (const [riga, atteso] of [
    ['import { x } from "../a.mjs";', "../a.mjs"],
    ['import "../a.mjs";', "../a.mjs"],
    ['const m = await import("../a.mjs");', "../a.mjs"],
    ['const m = require("../a.cjs");', "../a.cjs"],
    ['const r = spawnSync("node", ["cervello/a.mjs", "--json"], { cwd: REPO });', "cervello/a.mjs"],
    ['const G = join(REPO, "cervello/a.mjs");', "cervello/a.mjs"],
    ['const u = new URL("../a.mjs", import.meta.url);', "../a.mjs"],
    ['execFileSync("bash", [join(REPO, "cervello/a.sh")]);', "cervello/a.sh"],
  ]) {
    assert.ok(parteCheRaggiungeInProva(riga).split("\n").includes(atteso), riga);
  }
  for (const riga of [
    '  "cervello/a.mjs": [',
    '    "//   node cervello/a.mjs   -> scrive",',
    `    "cervello/cancello-lotto.mjs": 'passi.push(esegui("x", "node", ["cervello/a.mjs"]));',`,
    'const MORTO = "cervello/a.mjs";',
    '  { difetto: "AR-1", file: "cervello/a.mjs", test: "cervello/test/a.test.mjs" },',
    'test("cancellare cervello/a.mjs non fa nascere voci", () => {',
    '  assert.equal(v.file, "cervello/a.mjs");',
  ]) {
    assert.ok(!parteCheRaggiungeInProva(riga).includes("cervello/a.mjs"), riga);
  }
  // E parteCheChiama la applica alle sole prove in JS o TS: in una prova in shell la riga lancia.
  assert.equal(parteCheChiama('  "cervello/a.mjs": [', "cervello/test/x.test.mjs"), "");
  assert.equal(parteCheChiama('  "cervello/a.mjs": [', "pannello/src/lib/x.test.mts"), "");
  assert.equal(parteCheChiama("  run node cervello/a.mjs --json", "cervello/test/x.bats"), "  run node cervello/a.mjs --json");
  for (const f of ["cervello/test/x.test.mjs", "cervello/test/x.bats", "pannello/src/lib/a.test.mts", "pannello/src/a.spec.ts"]) {
    assert.ok(eFileDiProva(f), f);
  }
  for (const f of ["cervello/giro.sh", "pannello/src/app/page.tsx", "cervello/testimoni.mjs"]) assert.ok(!eFileDiProva(f), f);
});

// ─── ⑤ nello STESSO file: un commento o un racconto non rimettono la chiamata tolta ─

test("⑤ chiamata tolta + commento nello STESSO file che nomina il freno: resta grave", () => {
  // Il gesto di tutti i giorni: tolgo il passo e lascio la riga che spiega perché.
  const commento = "    // cervello/gate-veri.mjs adesso lo lancia la visita, non il cancello";
  const e = daDiff(
    ["--- a/cervello/cancello-lotto.mjs", "+++ b/cervello/cancello-lotto.mjs", "@@ -5,1 +5,1 @@", TOLTA_DAL_CANCELLO[3], `+${commento}`],
    {},
    { "cervello/cancello-lotto.mjs": `${commento}\n` },
  );
  assert.equal(difeseRimosse(e).length, 1, "un commento non chiama niente, nemmeno nel file da cui ho tolto la chiamata");
});

const APPRENDIMENTO = "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json";
const DIFESE_LEZIONE = indiceDifese({ lezioni: [{ id: "L-1", gate: "node cervello/test/x.test.mjs" }] });
const GATE_TOLTO = [`--- a/${APPRENDIMENTO}`, `+++ b/${APPRENDIMENTO}`, "@@ -9,1 +9,1 @@", '-      "gate": "node cervello/test/x.test.mjs",'];

test("⑤ gate tolto da una lezione + una «nota» nello STESSO registro che lo nomina: resta grave", () => {
  const nota = '      "nota": "tolto il gate node cervello/test/x.test.mjs: era lento",';
  const e = daDiff([...GATE_TOLTO, `+${nota}`], { difese: DIFESE_LEZIONE }, { [APPRENDIMENTO]: `${nota}\n` });
  assert.equal(difeseRimosse(e).length, 1, "un racconto non è un gate");
});

test("⑤ …e lo spostamento VERO dentro lo stesso registro resta riconosciuto (il gate passa a un'altra riga)", () => {
  const gate = '      "gate": "node cervello/test/x.test.mjs",';
  const e = daDiff([...GATE_TOLTO, `+${gate}`], { difese: DIFESE_LEZIONE }, { [APPRENDIMENTO]: `${gate}\n` });
  assert.equal(difeseRimosse(e).length, 0);
});

// ─── ⑥ chi parte da solo è vivo anche quando è LUI a essere cancellato ─────

test("⑥ un flusso della CI, un hook o una prova del Pannello cancellati: le loro righe restano voci anche se nessuno li nomina", () => {
  for (const [file, riga] of [
    [".github/workflows/notte.yml", "      - run: node cervello/gate-veri.mjs"],
    [".githooks/pre-push", "node cervello/gate-veri.mjs || exit 1"],
    ["pannello/src/lib/carrello.test.mts", 'const r = spawnSync("node", [join(REPO, "cervello/gate-veri.mjs")]);'],
  ]) {
    const e = daDiff(diffCancellazione(file, [riga]), { cercaAllaBase: base({}) });
    assert.equal(difeseRimosse(e).length, 1, `${file}: nessuno lo nomina perché parte da solo, non perché è morto`);
  }
});

// ─── ⑦ lanciato_da dice da dove partiva, non chi lo prova ──────────────────

test("⑦ lanciato_da nomina prima chi lo lancia davvero (il giro), poi la prova che lo importa", () => {
  const vivo = {
    ...NOMINATO_MA_NON_LANCIATO,
    "cervello/test/round2.test.mjs": 'import { main } from "../round2-applica.mjs";',
    "cervello/giro.sh": 'node "$DIR/cervello/round2-applica.mjs" --gate || true',
    "cervello/vps/mycity-giro.service": "ExecStart=/bin/bash /opt/mycity/ad-mycity/cervello/giro.sh",
  };
  const v = difeseRimosse(daDiff(diffCancellazione(MORTO, RIGHE_MORTO), { cercaAllaBase: base(vivo) }));
  assert.equal(v.length, 5);
  for (const x of v) assert.deepEqual(x.lanciato_da, ["cervello/giro.sh", "cervello/test/round2.test.mjs"], `riga ${x.riga}`);
});
