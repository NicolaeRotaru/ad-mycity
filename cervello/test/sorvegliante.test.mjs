// La guardia che guarda mentre lavoro, provata su diff finti.
//
// Perché su diff finti e non sul repo: se la prova misurasse com'è il repo adesso, diventerebbe verde
// o rossa per motivi che non c'entrano col codice della guardia — e domani, a repo cambiato, non
// saprei più se il rosso è un bug mio o un file nuovo di qualcun altro. Qui ogni caso è un ingresso
// esatto con un'uscita esatta: è l'unica forma che sopravvive a un anno di lotti.
//
// Ogni test risponde a una domanda che il 30/7 ha fatto Nicola: «stai guardando in tempo reale quello
// che stai facendo?». Il caso che conta più di tutti è il terzo — una malattia in una riga RIMOSSA non
// è mia: un guardiano che me la conta insegna a ignorarlo, e un guardiano ignorato è spento.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  sorveglia,
  gravi,
  leggiDiff,
  leggiRimozioni,
  indiceDifese,
  soglieAllentate,
  esenzioniAggiunte,
  bustaPerIlModello,
  righeDiFileNuovo,
  verdettoBattito,
  chiaveVoce,
  aggiornaViste,
  vociInsistenti,
  derivaDelLavoro,
  zonaDi,
  nomiCitati,
  classeRimasta,
  provaIndebolita,
  difesaAncoraChiamata,
  conta,
  fileDifeso,
  raggioDueP1assi,
  aliasDiRotta,
  eCodice,
  VICINANZA_NOTA,
  LETTERALI_MIN,
  motiviPerimetro,
  motiviSalti,
  motiviMarketplace,
  fusioneInCorso,
  esenzioniDichiarate,
  filtraEsentate,
  STATI_FUSIONE,
  statoFusione,
  leggeMarcatori,
} from "../sorvegliante.mjs";

const MALATTIE = [
  {
    id: "errore-ingoiato",
    nome: "Un errore viene ingoiato e la schermata dice che va tutto bene",
    perche_e_grave: "il verde non vuol dire niente",
    pattern: "catch\\(\\(\\) => \\{\\}\\)",
    estensioni: [".mjs", ".ts"],
  },
];

const MUTANTI = [
  {
    difetto: "AR-999",
    nome: "il guardiano torna a dire sì senza guardare",
    file: "cervello/finto.mjs",
    cerca: "if (!ok) return false;",
    test: "cervello/test/finto.test.mjs",
  },
];

const base = { malattie: MALATTIE, mutanti: MUTANTI, esiste: () => true };

// ─── ① malattia nuova ────────────────────────────────────────────────────────

test("una malattia censita in una riga che aggiungo ADESSO è grave", () => {
  const e = sorveglia({
    ...base,
    toccati: [{ file: "cervello/nuovo.mjs", contenuto: "", aggiunte: [{ n: 12, testo: "  await x().catch(() => {})" }] }],
  });
  const v = gravi(e.voci);
  assert.equal(v.length, 1, "una voce grave");
  assert.equal(v[0].classe, "malattia-nuova");
  assert.equal(v[0].riga, 12, "il numero di riga è quello del file NUOVO, non dell'hunk");
  assert.match(v[0].domanda, /curo|esente/, "dice cosa fare, non solo cosa c'è");
});

test("la stessa malattia dentro un COMMENTO non è un'istanza: è la spiegazione della cura", () => {
  const e = sorveglia({
    ...base,
    toccati: [{ file: "cervello/nuovo.mjs", contenuto: "", aggiunte: [{ n: 3, testo: "// prima era catch(() => {}) e per questo AR-x esisteva" }] }],
  });
  assert.equal(gravi(e.voci).length, 0, "punire chi documenta fa salire il numero mentre la malattia cala");
});

test("una malattia in una riga RIMOSSA non è mia: il delta guarda solo ciò che aggiungo", () => {
  // leggiDiff() non mette le righe `-` fra le aggiunte; questo test lo prova dal diff vero, perché è
  // il punto in cui un errore renderebbe il guardiano rosso su ogni pulizia di codice vecchio.
  const diff = [
    "diff --git a/cervello/x.mjs b/cervello/x.mjs",
    "--- a/cervello/x.mjs",
    "+++ b/cervello/x.mjs",
    "@@ -40 +40 @@",
    "-  await x().catch(() => {})",
    "+  await x().catch((e) => segnala(e))",
  ].join("\n");
  const perFile = leggiDiff(diff);
  const e = sorveglia({
    ...base,
    toccati: [{ file: "cervello/x.mjs", contenuto: "", aggiunte: perFile.get("cervello/x.mjs") }],
  });
  assert.equal(gravi(e.voci).length, 0, "ho appena CURATO quella riga: un rosso qui insegna a spegnere la guardia");
});

test("l'estensione dichiarata dalla malattia si rispetta: un .md non è un .mjs", () => {
  const e = sorveglia({
    ...base,
    toccati: [{ file: "note.md", contenuto: "", aggiunte: [{ n: 1, testo: "catch(() => {})" }] }],
  });
  assert.equal(gravi(e.voci).length, 0);
});

// ─── ② prova accecata ────────────────────────────────────────────────────────

test("se tolgo il pezzo su cui poggia una mutazione, la prova di quel fix è appena diventata cieca", () => {
  const e = sorveglia({
    ...base,
    toccati: [{ file: "cervello/finto.mjs", contenuto: "export function f(){ return true; }", aggiunte: [{ n: 2, testo: "  return true;" }] }],
  });
  const v = gravi(e.voci).filter((x) => x.classe === "prova-accecata");
  assert.equal(v.length, 1, "il fix resta, la difesa no — e il test continua a passare");
  assert.match(v[0].cosa, /AR-999/, "dice QUALE fix ha perso la prova");
});

test("se il pezzo è ancora lì, nessun allarme", () => {
  const e = sorveglia({
    ...base,
    toccati: [{ file: "cervello/finto.mjs", contenuto: "function f(){\n  if (!ok) return false;\n}", aggiunte: [{ n: 9, testo: "// nota nuova" }] }],
  });
  assert.equal(gravi(e.voci).length, 0);
});

test("senza il contenuto del file NON dico verde: dico che non ho potuto misurare", () => {
  const e = sorveglia({
    ...base,
    toccati: [{ file: "cervello/finto.mjs", aggiunte: [{ n: 1, testo: "x" }] }],
  });
  assert.equal(gravi(e.voci).length, 0);
  assert.equal(e.cieco, true, "cieco non è verde");
  assert.match(e.motivi.join(" "), /mutazione/, "e dice PERCHÉ è cieco");
});

// ─── ③ gate orfano ───────────────────────────────────────────────────────────

test("un gate che punta a un test inesistente è grave: il conto dei freni salirebbe senza la difesa", () => {
  const e = sorveglia({
    ...base,
    esiste: () => false,
    toccati: [{ file: "app.json", contenuto: "", aggiunte: [{ n: 5, testo: '  "gate": "node cervello/test/mai-scritto.test.mjs",' }] }],
  });
  const v = gravi(e.voci).filter((x) => x.classe === "gate-orfano");
  assert.equal(v.length, 1);
  assert.match(v[0].cosa, /mai-scritto/);
});

test("un gate in attesa di una PR dichiarata è GIALLO, non verde e non rosso", () => {
  // Lo stato vero trovato il 30/7 su L-2026-0730-530: il test esiste, ma nella PR #635 non mergiata.
  // Chiamarlo «orfano» era un falso rosso — e un guardiano che grida al lupo si impara a ignorare.
  const e = sorveglia({
    ...base,
    esiste: () => false,
    toccati: [
      {
        file: "app.json",
        contenuto: "",
        aggiunte: [
          { n: 5, testo: '  "gate": "node cervello/test/lease.test.mjs",' },
          { n: 6, testo: '  "gate_nota": "fix su branch, PR #635, non ancora su main"' },
        ],
      },
    ],
  });
  assert.equal(gravi(e.voci).length, 0, "non è un rosso");
  const g = e.voci.filter((x) => x.classe === "gate-in-attesa");
  assert.equal(g.length, 1, "ma resta contato come debito");
  assert.match(g[0].cosa, /#635/, "col numero della PR, così l'attesa ha una fine verificabile");
});

test("un'attesa SENZA numero di PR resta orfana: senza riferimento è un'esenzione travestita (AR-338)", () => {
  const e = sorveglia({
    ...base,
    esiste: () => false,
    toccati: [
      {
        file: "app.json",
        contenuto: "",
        aggiunte: [
          { n: 5, testo: '  "gate": "node cervello/test/lease.test.mjs",' },
          { n: 6, testo: '  "gate_nota": "arriva presto, promesso"' },
        ],
      },
    ],
  });
  assert.equal(gravi(e.voci).filter((x) => x.classe === "gate-orfano").length, 1);
});

test("la nota vale solo se è VICINA al gate: quella di un'altra lezione non lo scusa", () => {
  const e = sorveglia({
    ...base,
    esiste: () => false,
    toccati: [
      {
        file: "app.json",
        contenuto: "",
        aggiunte: [
          { n: 5, testo: '  "gate": "node cervello/test/lease.test.mjs",' },
          { n: 5 + VICINANZA_NOTA + 1, testo: '  "gate_nota": "PR #999 di un\'altra lezione"' },
        ],
      },
    ],
  });
  assert.equal(gravi(e.voci).filter((x) => x.classe === "gate-orfano").length, 1, "fuori dall'intorno non scusa");
});

// ─── ④ perimetro letterale ───────────────────────────────────────────────────

test("un elenco di file scritto a mano in un guardiano è la malattia di AR-347", () => {
  const e = sorveglia({
    ...base,
    toccati: [
      {
        file: "cervello/guardiano-x.mjs",
        contenuto: "",
        aggiunte: [
          { n: 10, testo: "const FILE_PILOTA = [" },
          { n: 11, testo: '  "CLAUDE.md",' },
          { n: 12, testo: '  "cervello/giro.md",' },
          { n: 13, testo: "];" },
        ],
      },
    ],
  });
  const v = e.voci.filter((x) => x.classe === "perimetro-letterale");
  assert.equal(v.length, 1, `${LETTERALI_MIN} letterali bastano: a due AR-347 è nato`);
  assert.match(v[0].domanda, /MISURATO|dedotto/, "la domanda è misurato-o-dedotto, non 'va bene?'");
});

test("un elenco di file dentro un test o un .md non è un perimetro di guardiano", () => {
  const e = sorveglia({
    ...base,
    toccati: [
      {
        file: "pannello/src/lib/x.ts",
        contenuto: "",
        aggiunte: [
          { n: 1, testo: "const ESEMPI = [" },
          { n: 2, testo: '  "a.md",' },
          { n: 3, testo: '  "b.md",' },
        ],
      },
    ],
  });
  assert.equal(e.voci.filter((x) => x.classe === "perimetro-letterale").length, 0);
});

// ─── ⑤ raggio ────────────────────────────────────────────────────────────────

test("il raggio elenca chi altro poggia su ciò che ho toccato, e non è un errore", () => {
  const e = sorveglia({
    ...base,
    toccati: [{ file: "cervello/condiviso.mjs", contenuto: "", aggiunte: [{ n: 1, testo: "export const X = 2;" }] }],
    importatori: new Map([["cervello/condiviso.mjs", ["cervello/a.mjs", "cervello/b.mjs", "cervello/c.mjs"]]]),
  });
  const r = e.voci.filter((x) => x.classe === "raggio");
  assert.equal(r.length, 1);
  assert.equal(r[0].gravita, "informativa", "il quadro ampio non è una bocciatura");
  assert.match(r[0].cosa, /^3 altri file/, "il conteggio apre la riga: la forma corta dell'hook lo legge da lì");
  assert.equal(gravi(e.voci).length, 0);
});

// ─── la guardia non si accusa da sola ────────────────────────────────────────

test("i file che NOMINANO le malattie per mestiere sono esclusi: menzione non è chiamata", () => {
  for (const f of ["cervello/malattie.json", "cervello/sorvegliante.mjs", "cervello/test/qualcosa.test.mjs"]) {
    const e = sorveglia({ ...base, toccati: [{ file: f, contenuto: "", aggiunte: [{ n: 1, testo: "catch(() => {})" }] }] });
    assert.equal(gravi(e.voci).length, 0, `${f} deve poter citare la malattia che vieta`);
  }
});

test("…ma quell'esenzione vale SOLO per i pattern: sui file dei guardiani gli altri quattro controlli restano accesi", () => {
  // Trovato provando la guardia sul lavoro che la costruiva: l'esenzione era applicata al file intero
  // e il verdetto è stato «0 file toccati» su tre file appena scritti. Un'esenzione presa per una
  // classe e allargata a tutte è AR-338 in miniatura — e cieca proprio sui file che, cambiando,
  // rompono di più.
  const e = sorveglia({
    ...base,
    mutanti: [{ difetto: "AR-998", nome: "x", file: "cervello/spazzata-fratelli.mjs", cerca: "PEZZO CHE NON C'È", test: "t" }],
    toccati: [{ file: "cervello/spazzata-fratelli.mjs", contenuto: "codice senza quel pezzo", aggiunte: [{ n: 1, testo: "catch(() => {})" }] }],
    importatori: new Map([["cervello/spazzata-fratelli.mjs", ["cervello/sorvegliante.mjs"]]]),
  });
  const classi = e.voci.map((v) => v.classe);
  assert.ok(!classi.includes("malattia-nuova"), "il pattern citato resta esente");
  assert.ok(classi.includes("prova-accecata"), "ma se accieco una prova lo devo sapere anche qui");
  assert.ok(classi.includes("raggio"), "e il raggio va mostrato: chi importa un guardiano si rompe con lui");
});

test("le finte dichiarazioni dentro un file di PROVA non sono dichiarazioni: sono le sue fixture", () => {
  // Trovato dalla guardia su sé stessa: girata sul commit che la costruiva, si è accusata di due gate
  // orfani — che sono i casi di prova qui sotto. Un guardiano che si accusa delle proprie fixture
  // produce due rossi finti a ogni lavoro sui test, e due rossi finti spengono un guardiano.
  const dichiarazioni = [
    { n: 1, testo: '  "gate": "node cervello/test/mai-scritto.test.mjs",' },
    { n: 2, testo: "const FILE_PILOTA = [" },
    { n: 3, testo: '  "CLAUDE.md",' },
    { n: 4, testo: '  "cervello/giro.md",' },
  ];
  const dentroLaProva = sorveglia({ ...base, esiste: () => false, toccati: [{ file: "cervello/test/x.test.mjs", contenuto: "", aggiunte: dichiarazioni }] });
  assert.equal(dentroLaProva.voci.length, 0, "nel libro degli esempi non c'è niente da denunciare");

  // …e la controprova, che è il vero valore del caso: le stesse righe in un file VERO restano rosse.
  const dentroUnGuardiano = sorveglia({ ...base, esiste: () => false, toccati: [{ file: "cervello/guardiano-y.mjs", contenuto: "", aggiunte: dichiarazioni }] });
  const classi = dentroUnGuardiano.voci.map((v) => v.classe);
  assert.ok(classi.includes("gate-orfano"), "fuori dalle prove, un gate senza test è un gate senza test");
  assert.ok(classi.includes("perimetro-letterale"), "e un elenco a mano resta un perimetro dedotto");
});

test("un registro vuoto è cieco, non verde: una guardia che non cerca niente non passa", () => {
  const e = sorveglia({ toccati: [{ file: "cervello/x.mjs", contenuto: "", aggiunte: [] }], malattie: [], mutanti: [] });
  assert.equal(e.cieco, true);
  assert.equal(e.motivi.length, 2, "dice quale dei due registri manca");
});

// ─── il lettore del diff ─────────────────────────────────────────────────────

test("leggiDiff(): i numeri di riga sono quelli del file nuovo, su più hunk", () => {
  const diff = [
    "diff --git a/f.mjs b/f.mjs",
    "--- a/f.mjs",
    "+++ b/f.mjs",
    "@@ -1,0 +2,2 @@",
    "+alfa",
    "+beta",
    "@@ -30,0 +99,1 @@",
    "+gamma",
  ].join("\n");
  assert.deepEqual(leggiDiff(diff).get("f.mjs"), [
    { n: 2, testo: "alfa" },
    { n: 3, testo: "beta" },
    { n: 99, testo: "gamma" },
  ]);
});

test("leggiDiff(): un file cancellato non produce righe aggiunte", () => {
  const diff = ["diff --git a/f.mjs b/f.mjs", "--- a/f.mjs", "+++ /dev/null", "@@ -1 +0,0 @@", "-via"].join("\n");
  assert.equal(leggiDiff(diff).size, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// IL LATO SOTTRAZIONE (AR-495). Il caso che apre questa sezione è quello vero: prima di scrivere il
// codice ho dato alla guardia un diff che cancellava un `gate:` E il test a cui puntava, e la risposta
// è stata «voci: 0, exit 0». Verde pieno su una difesa appena morta. Qui quel diff torna identico.
// ─────────────────────────────────────────────────────────────────────────────

const DIFESE = indiceDifese({
  lezioni: [{ id: "L-2026-0730-531", gate: "node cervello/test/y.test.mjs" }],
  mutanti: [{ difetto: "AR-999", file: "cervello/finto.mjs", test: "cervello/test/finto.test.mjs" }],
  guardiani: ["cervello/gate-veri.mjs"],
});

/** Il giro completo che fa il comando vero: diff → due letture → cuore. Passa dal diff e non da
 *  ingressi già pronti perché il buco stava PROPRIO nel lettore, non nel giudizio. */
function daDiff(righe, extra = {}) {
  const testo = righe.join("\n");
  const agg = leggiDiff(testo);
  const { rimosse, cancellati } = leggiRimozioni(testo);
  const file = new Set([...agg.keys(), ...rimosse.keys()]);
  return sorveglia({
    toccati: [...file].map((f) => ({ file: f, aggiunte: agg.get(f) || [], contenuto: "" })),
    rimossi: [...rimosse].map(([f, r]) => ({ file: f, rimosse: r, cancellato: cancellati.includes(f) })),
    difese: DIFESE,
    malattie: MALATTIE,
    mutanti: [],
    esiste: () => true,
    ...extra,
  });
}

test("il caso del 3/8: tolgo un gate e cancello il suo test — prima era verde, adesso è rosso due volte", () => {
  const e = daDiff([
    "--- a/cervello/x.json",
    "+++ b/cervello/x.json",
    "@@ -10,3 +10,1 @@",
    '-  "gate": "node cervello/test/y.test.mjs"',
    "   ok",
    "--- a/cervello/test/y.test.mjs",
    "+++ /dev/null",
    "@@ -1,2 +0,0 @@",
    '-import test from "node:test";',
  ]);
  const v = gravi(e.voci).filter((x) => x.classe === "difesa-rimossa");
  assert.equal(v.length, 2, "la riga che lo lanciava E il file che lo conteneva: due modi di morire");
  assert.ok(
    v.some((x) => x.file === "cervello/test/y.test.mjs"),
    "il file cancellato deve comparire: prima non entrava nemmeno nell'elenco dei guardati",
  );
});

test("spostare non è togliere: se il nome ricompare fra le righe aggiunte, la guardia tace", () => {
  const e = daDiff([
    "--- a/cervello/cancello-lotto.mjs",
    "+++ b/cervello/cancello-lotto.mjs",
    "@@ -5,1 +5,1 @@",
    '-    passi.push(esegui("gate", "node", ["cervello/gate-veri.mjs"]));',
    '+    if (pieno) passi.push(esegui("gate", "node", ["cervello/gate-veri.mjs"]));',
  ]);
  assert.equal(gravi(e.voci).length, 0, "punire un riordino insegna a non riordinare mai più niente");
});

test("cancellare codice che nessuno dichiara difesa non è una colpa", () => {
  const e = daDiff(["--- a/cervello/vecchio.mjs", "+++ /dev/null", "@@ -1,1 +0,0 @@", "-export const morto = 1;"]);
  assert.equal(gravi(e.voci).length, 0, "il repo deve poter dimagrire senza chiedere permesso");
});

test("togliere un COMMENTO che cita un guardiano non spegne il guardiano", () => {
  const e = daDiff([
    "--- a/cervello/note.mjs",
    "+++ b/cervello/note.mjs",
    "@@ -3,1 +3,0 @@",
    "-// vedi cervello/gate-veri.mjs per il dettaglio",
  ]);
  assert.equal(gravi(e.voci).length, 0, "menzione ≠ chiamata: la terza volta che questo repo la impara");
});

test("in un .md ogni riga è una menzione: togliere una riga di ISTRUZIONI non spegne un guardiano (AR-503)", () => {
  // Il caso vero, colto dalla guardia su sé stessa durante il merge del 3/8: main aveva tolto da un
  // quaderno la riga «- (ancora vuoto — il primo ESITO si registra con: node cervello/chiusura-loop.mjs …)»
  // perché quel quaderno non era più vuoto, e la guardia l'ha chiamata «hai spento un guardiano».
  // In un file di codice il filtro dei commenti basta; in un file di prosa il commento è TUTTO il file.
  const e = daDiff([
    "--- a/memoria-squadra/people-talent.md",
    "+++ b/memoria-squadra/people-talent.md",
    "@@ -14,1 +14,0 @@",
    "-- (ancora vuoto — il primo ESITO si registra con: node cervello/gate-veri.mjs registra …)",
  ]);
  assert.equal(gravi(e.voci).length, 0, "quarta volta in questo repo che «menzione ≠ chiamata» presenta il conto");
});

test("…ma nel CODICE la stessa riga resta grave: la prosa è l'eccezione, non la regola", () => {
  const e = daDiff([
    "--- a/cervello/cancello-lotto.mjs",
    "+++ b/cervello/cancello-lotto.mjs",
    "@@ -5,1 +5,0 @@",
    '-    passi.push(esegui("gate", "node", ["cervello/gate-veri.mjs"]));',
  ]);
  assert.equal(gravi(e.voci).filter((v) => v.classe === "difesa-rimossa").length, 1);
});

// ─── ⑥b guarda il RISULTATO, non solo il gesto (AR-536) ─────────────────────

test("il caso del 4/8: tolgo un DOPPIONE da un registro che nomina lo stesso gate altre volte → tace", () => {
  // Unendo main, quattro accuse su quattro erano false: la fusione dei registri aveva cancellato una
  // scheda duplicata, e «cervello/test/sorvegliante.test.mjs» restava scritto 13 e 15 volte nei due
  // file. Le tre condizioni che c'erano guardavano tutte il GESTO (tolto/messo qui/messo altrove) e
  // nessuna il file com'era rimasto. Un cancello che non può diventare verde si impara ad aggirare.
  const e = daDiff(
    [
      "--- a/cervello/x.json",
      "+++ b/cervello/x.json",
      "@@ -10,1 +10,0 @@",
      '-  "gate": "node cervello/gate-veri.mjs"',
    ],
    { toccati: [{ file: "cervello/x.json", aggiunte: [], contenuto: '{ "gate": "node cervello/gate-veri.mjs" }' }] },
  );
  assert.equal(gravi(e.voci).length, 0, "undici righe lo chiamano ancora: il freno non è spento");
});

test("…ma se l'unica menzione rimasta è un COMMENTO, resta grave: il rimedio non apre il buco gemello", () => {
  const e = daDiff(
    [
      "--- a/cervello/cancello-lotto.mjs",
      "+++ b/cervello/cancello-lotto.mjs",
      "@@ -5,1 +5,0 @@",
      '-    passi.push(esegui("gate", "node", ["cervello/gate-veri.mjs"]));',
    ],
    { toccati: [{ file: "cervello/cancello-lotto.mjs", aggiunte: [], contenuto: "// cervello/gate-veri.mjs: vedi sotto" }] },
  );
  assert.equal(
    gravi(e.voci).filter((v) => v.classe === "difesa-rimossa").length,
    1,
    "«menzione ≠ chiamata» vale anche per l'assoluzione, non solo per l'accusa",
  );
});

test("tolgo l'ULTIMA riga che lo nomina: lì la guardia deve gridare", () => {
  const e = daDiff(
    [
      "--- a/cervello/cancello-lotto.mjs",
      "+++ b/cervello/cancello-lotto.mjs",
      "@@ -5,1 +5,0 @@",
      '-    passi.push(esegui("gate", "node", ["cervello/gate-veri.mjs"]));',
    ],
    { toccati: [{ file: "cervello/cancello-lotto.mjs", aggiunte: [], contenuto: "const x = 1;" }] },
  );
  assert.equal(gravi(e.voci).filter((v) => v.classe === "difesa-rimossa").length, 1);
});

test("difesaAncoraChiamata(): senza il contenuto torna false — cieco non è verde", () => {
  assert.equal(difesaAncoraChiamata(null, "cervello/gate-veri.mjs", "x.mjs"), false);
  assert.equal(difesaAncoraChiamata("node cervello/gate-veri.mjs", "cervello/gate-veri.mjs", "x.mjs"), true);
  assert.equal(difesaAncoraChiamata("// node cervello/gate-veri.mjs", "cervello/gate-veri.mjs", "x.mjs"), false);
});

test("un test cancellato resta grave anche dentro cervello/test/: è la difesa che muore, non una fixture", () => {
  const e = daDiff(["--- a/cervello/test/finto.test.mjs", "+++ /dev/null", "@@ -1,1 +0,0 @@", "-assert.ok(true);"]);
  assert.equal(gravi(e.voci).filter((x) => x.classe === "difesa-rimossa").length, 1);
});

// ─── ⑦ soglia allentata ──────────────────────────────────────────────────────

test("un tetto che SALE è grave: il metro si è spostato, non il codice", () => {
  const f = soglieAllentate([{ n: 1, testo: '  "tetto_righe": 400,' }], [{ n: 1, testo: '  "tetto_righe": 900,' }], "cervello/tetti-lotto.json");
  assert.deepEqual(f, [{ chiave: "tetto_righe", da: 400, a: 900 }]);
});

test("un tetto che SCENDE non è un allentamento: è il lavoro fatto", () => {
  assert.equal(soglieAllentate([{ n: 1, testo: '  "tetto_righe": 900,' }], [{ n: 1, testo: '  "tetto_righe": 400,' }], "x.json").length, 0);
});

test("un MINIMO si allenta al contrario, e va distinto o metà dei casi passa", () => {
  assert.equal(soglieAllentate([{ n: 1, testo: "const COPERTURA_MIN = 80;" }], [{ n: 1, testo: "const COPERTURA_MIN = 20;" }], "g.mjs").length, 1);
  assert.equal(soglieAllentate([{ n: 1, testo: "const COPERTURA_MIN = 20;" }], [{ n: 1, testo: "const COPERTURA_MIN = 80;" }], "g.mjs").length, 0);
});

test("un numero qualsiasi non è una soglia: senza la parola nel nome, non tocca a me", () => {
  assert.equal(soglieAllentate([{ n: 1, testo: '  "ordini": 3,' }], [{ n: 1, testo: '  "ordini": 90,' }], "dati.json").length, 0);
});

// ─── ⑧ esenzione aggiunta ────────────────────────────────────────────────────

test("un file che entra in una baseline è un'esenzione, e il nome del file basta a dirlo", () => {
  const e = esenzioniAggiunte([{ n: 4, testo: '  "cervello/rotto.mjs",' }], "cervello/nascita-baseline.json");
  assert.deepEqual(e, ['"cervello/rotto.mjs"']);
});

test("un array che si CHIAMA esenzione la dichiara anche fuori da una baseline", () => {
  const e = esenzioniAggiunte(
    [
      { n: 1, testo: "const SALTA_CONTROLLO = [" },
      { n: 2, testo: '  "cervello/a.mjs",' },
      { n: 3, testo: '  "cervello/b.mjs",' },
      { n: 4, testo: "];" },
    ],
    "cervello/guardiano.mjs",
  );
  assert.equal(e.length, 2);
});

test("un array con un nome normale non è un'esenzione: la parola è il segnale, non la forma", () => {
  const e = esenzioniAggiunte(
    [
      { n: 1, testo: "const CARTELLE_MEMORIA = [" },
      { n: 2, testo: '  "consegne/x.md",' },
      { n: 3, testo: '  "consegne/y.md",' },
    ],
    "cervello/guardiano.mjs",
  );
  assert.equal(e.length, 0);
});

// ─── i due lettori e l'indice ────────────────────────────────────────────────

test("leggiRimozioni(): i numeri sono quelli del file VECCHIO — è l'unico posto dove quella riga esisteva", () => {
  const { rimosse, cancellati } = leggiRimozioni(
    ["--- a/f.mjs", "+++ b/f.mjs", "@@ -40,2 +40,0 @@", "-alfa", "-beta"].join("\n"),
  );
  assert.deepEqual(rimosse.get("f.mjs"), [
    { n: 40, testo: "alfa" },
    { n: 41, testo: "beta" },
  ]);
  assert.deepEqual(cancellati, []);
});

test("leggiRimozioni(): un file cancellato viene NOMINATO — è il buco esatto del 3/8", () => {
  const { cancellati } = leggiRimozioni(["--- a/f.mjs", "+++ /dev/null", "@@ -1,1 +0,0 @@", "-via"].join("\n"));
  assert.deepEqual(cancellati, ["f.mjs"], "prima il file spariva dal diff e quindi dalla guardia");
});

test("il contratto di leggiDiff resta intatto: `aggiunte` sono SOLO i +, o accieco la mutazione di AR-452", () => {
  const testo = ["--- a/f.mjs", "+++ b/f.mjs", "@@ -1,1 +1,1 @@", "-  await x().catch(() => {})", "+  ok()"].join("\n");
  assert.deepEqual(leggiDiff(testo).get("f.mjs"), [{ n: 1, testo: "  ok()" }]);
});

test("indiceDifese(): le difese si MISURANO dai registri, non si elencano a mano", () => {
  const idx = indiceDifese({
    lezioni: [{ id: "L-1", gate: "node cervello/test/uno.test.mjs" }],
    mutanti: [{ difetto: "AR-9", file: "cervello/due.mjs", test: "cervello/test/tre.test.mjs" }],
    guardiani: ["cervello/quattro.mjs"],
  });
  assert.deepEqual([...idx.keys()].sort(), [
    "cervello/due.mjs",
    "cervello/quattro.mjs",
    "cervello/test/tre.test.mjs",
    "cervello/test/uno.test.mjs",
  ]);
  assert.match(idx.get("cervello/test/uno.test.mjs"), /L-1/, "e dicono PERCHÉ sono una difesa, o il verdetto non si può capire");
});

test("senza registri non dico verde: se non censisco difese, non posso accorgermi di cancellarne una", () => {
  const e = sorveglia({ toccati: [], rimossi: [], malattie: MALATTIE, mutanti: MUTANTI, difese: new Map() });
  assert.equal(e.cieco, false, "qui il cieco lo dichiara il comando, che sa se i registri li ha letti");
});

// ─────────────────────────────────────────────────────────────────────────────
// IL CANALE (AR-465). Per un giorno la guardia ha girato a ogni modifica parlando a nessuno: stampava
// testo semplice, e un hook PostToolUse che esce con 0 e stampa testo finisce nel log di debug. Il
// codice «sembrava giusto» — è per questo che qui si ESEGUE la busta invece di guardarne la forma.
// ─────────────────────────────────────────────────────────────────────────────

const ROSSA = { classe: "gate-orfano", gravita: "grave", file: "a.md", riga: 3, cosa: "gate senza file", domanda: "quale comando fallisce?" };

test("la busta è JSON: se torna testo semplice il verdetto sparisce nel log e nessuno se ne accorge", () => {
  const busta = bustaPerIlModello([ROSSA], 1);
  assert.doesNotThrow(() => JSON.parse(busta), "l'uscita hook DEVE essere JSON parsabile, o non arriva al modello");
});

test("la busta si dichiara PostToolUse: la busta giusta col nome sbagliato viene buttata via lo stesso", () => {
  const b = JSON.parse(bustaPerIlModello([ROSSA], 1));
  assert.equal(b.hookSpecificOutput.hookEventName, "PostToolUse");
});

test("la busta porta DENTRO il verdetto, non solo l'involucro", () => {
  const b = JSON.parse(bustaPerIlModello([ROSSA], 1));
  const ctx = b.hookSpecificOutput.additionalContext;
  assert.match(ctx, /gate-orfano/);
  assert.match(ctx, /a\.md:3/);
  assert.match(ctx, /quale comando fallisce\?/);
  assert.ok(ctx.trim().length > 0, "un additionalContext vuoto è un canale aperto che non porta niente");
});

test("quando è pulito la busta è nulla: un avvisatore che parla a ogni modifica viene spento entro la settimana", () => {
  assert.equal(bustaPerIlModello([], 3), null);
  assert.equal(bustaPerIlModello([{ classe: "x", gravita: "informativa", file: "f", cosa: "c" }], 1), null);
});

test("oltre quattro voci gravi la busta dice quante ne restano invece di troncare in silenzio", () => {
  const sei = Array.from({ length: 6 }, (_, i) => ({ ...ROSSA, file: `f${i}.md` }));
  const ctx = JSON.parse(bustaPerIlModello(sei, 6)).hookSpecificOutput.additionalContext;
  assert.match(ctx, /e altre 2 voci gravi/);
});

test("un file appena creato conta per intero: è la riga che scrivo adesso, e il diff non la conosce", () => {
  const righe = righeDiFileNuovo('uno\n\n  \nlezione: "gate": "controlla tutto"\n');
  assert.deepEqual(righe, [
    { n: 1, testo: "uno" },
    { n: 4, testo: 'lezione: "gate": "controlla tutto"' },
  ]);
});

test("un file binario non ha righe che ho scritto: leggerlo come testo è solo rumore", () => {
  assert.equal(righeDiFileNuovo("PK\0\0qualcosa"), null);
});

test("il file nuovo arriva davvero al cuore: un freno finto dentro un file mai committato viene visto", () => {
  const esito = sorveglia({
    toccati: [{ file: "consegne/nuovo.md", aggiunte: righeDiFileNuovo('lezione: "gate": "controlla tutto"\n'), contenuto: "x" }],
    malattie: MALATTIE,
    mutanti: [],
    importatori: new Map(),
    esiste: () => false,
  });
  assert.equal(gravi(esito.voci).length, 1);
  assert.equal(gravi(esito.voci)[0].classe, "gate-orfano");
});

// ─── ⑥ le regole di CASA: una malattia che vale solo in un file preciso (AR-500) ──────────────

test("una malattia con `percorsi` vale solo lì: fuori sarebbe un falso rosso, e un falso rosso spegne", () => {
  const casa = [{ id: "titolo-in-codice", nome: "titolo in sigle", pattern: "^## .*AR-\\d+", estensioni: [".md"], percorsi: ["MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md"] }];
  const riga = [{ n: 3, testo: "## Sistemare AR-495 prima di lunedì" }];

  const nellaCoda = sorveglia({ malattie: casa, mutanti: [], toccati: [{ file: "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md", contenuto: "", aggiunte: riga }] });
  assert.equal(gravi(nellaCoda.voci).length, 1, "nella coda che legge Nicola, un titolo in sigle è un difetto");

  const inUnaScheda = sorveglia({ malattie: casa, mutanti: [], toccati: [{ file: "consegne/audit/referto.md", contenuto: "", aggiunte: riga }] });
  assert.equal(gravi(inUnaScheda.voci).length, 0, "in un referto, nominare un AR-xxx è una cosa normalissima");
});

test("senza `percorsi` la malattia vale ovunque: il campo è facoltativo, non un restringimento silenzioso", () => {
  const ovunque = [{ id: "x", pattern: "vietato", estensioni: [".md"] }];
  const e = sorveglia({ malattie: ovunque, mutanti: [], toccati: [{ file: "consegne/qualsiasi.md", contenuto: "", aggiunte: [{ n: 1, testo: "questo è vietato" }] }] });
  assert.equal(gravi(e.voci).length, 1);
});

// ─── ⑨ la deriva del lavoro (AR-501) ─────────────────────────────────────────

test("un lavoro dentro una zona sola non fa domande", () => {
  assert.equal(derivaDelLavoro(["cervello/a.mjs", "cervello/test/a.test.mjs"]), null);
});

test("i contenitori si contano al secondo livello, o tutto il vault sarebbe «una zona»", () => {
  assert.equal(zonaDi("MyCity-Vault/07-Agenti/AGENTI.md"), "MyCity-Vault/07-Agenti");
  assert.equal(zonaDi("cervello/test/x.test.mjs"), "cervello", "il cervello è un mestiere solo: lì il primo livello basta");
});

test("oltre la soglia la deriva è una DOMANDA, non un'accusa: un lotto largo può essere giusto", () => {
  const zone = derivaDelLavoro([
    "cervello/a.mjs",
    "pannello/src/x.tsx",
    "MyCity-Vault/90-Memoria-AI/STATO.md",
    "consegne/audit/r.md",
    "creativi/output/x.png",
    "memoria-squadra/tech.md",
  ]);
  assert.equal(zone.length, 6);
  const e = sorveglia({
    malattie: [],
    mutanti: [],
    toccati: ["cervello/a.mjs", "pannello/src/x.tsx", "MyCity-Vault/90-Memoria-AI/STATO.md", "consegne/audit/r.md", "creativi/output/x.png", "memoria-squadra/tech.md"].map((f) => ({ file: f, contenuto: "", aggiunte: [] })),
  });
  const d = e.voci.find((v) => v.classe === "deriva");
  assert.equal(d.gravita, "informativa", "una domanda sul lavoro non è una bocciatura del codice");
  assert.equal(gravi(e.voci).length, 0);
});

test("la deriva arriva nella busta: una domanda che non esce non me la sono mai fatta", () => {
  const voci = [{ classe: "deriva", gravita: "informativa", file: null, cosa: "questo lavoro tocca 6 zone diverse: a, b", domanda: "è ancora UN lavoro solo?" }];
  const ctx = JSON.parse(bustaPerIlModello(voci, 6)).hookSpecificOutput.additionalContext;
  assert.match(ctx, /6 zone diverse/);
  assert.match(ctx, /UN lavoro solo/);
});

// ─── l'esito del verdetto (AR-497) ───────────────────────────────────────────

test("la chiave di una voce sopravvive al numero di riga, o il contatore riparte da uno a ogni edit", () => {
  const a = { classe: "difesa-rimossa", file: "cervello/x.mjs", riga: 12, cosa: "ho tolto la riga 12 che chiamava y" };
  const b = { classe: "difesa-rimossa", file: "cervello/x.mjs", riga: 88, cosa: "ho tolto la riga 88 che chiamava y" };
  assert.equal(chiaveVoce(a), chiaveVoce(b), "stessa voce, riga diversa: se la chiave cambia non conto mai niente");
});

test("il registro conta grave e media, e lascia fuori il raggio: un quadro non è un compito", () => {
  const viste = aggiornaViste(
    {},
    [
      { classe: "difesa-rimossa", gravita: "grave", file: "a.mjs", cosa: "x" },
      { classe: "esenzione-aggiunta", gravita: "media", file: "b.json", cosa: "y" },
      { classe: "raggio", gravita: "informativa", file: "c.mjs", cosa: "3 altri file" },
    ],
    1,
  );
  assert.equal(Object.keys(viste).length, 2, "un debito che non si può estinguere si impara a ignorare in blocco");
});

test("la stessa voce ripetuta sale a tre, e allora il cancello la deve sapere", () => {
  const v = { classe: "difesa-rimossa", gravita: "grave", file: "a.mjs", cosa: "ho tolto il gate" };
  let viste = {};
  for (const s of [1, 2, 3]) viste = aggiornaViste(viste, [v], s);
  const ins = vociInsistenti(viste, 3);
  assert.equal(ins.length, 1);
  assert.equal(ins[0].n, 3);
});

test("due volte non basta: la seconda può essere lo stesso lavoro ancora in corso", () => {
  const v = { classe: "difesa-rimossa", gravita: "grave", file: "a.mjs", cosa: "x" };
  const viste = aggiornaViste(aggiornaViste({}, [v], 1), [v], 2);
  assert.equal(vociInsistenti(viste, 2).length, 0);
});

test("una voce CURATA smette di contare: rinfacciarla sarebbe non accorgersi di essere stati ascoltati", () => {
  const v = { classe: "difesa-rimossa", gravita: "grave", file: "a.mjs", cosa: "x" };
  let viste = {};
  for (const s of [1, 2, 3]) viste = aggiornaViste(viste, [v], s);
  // Scatto 4: la voce non c'è più (l'ho riparata). Il conteggio resta 3, ma l'ultimo scatto no.
  viste = aggiornaViste(viste, [], 4);
  assert.equal(vociInsistenti(viste, 4).length, 0);
});

test("una media insistente non blocca: il blocco è per le gravi", () => {
  const v = { classe: "esenzione-aggiunta", gravita: "media", file: "b.json", cosa: "y" };
  let viste = {};
  for (const s of [1, 2, 3, 4]) viste = aggiornaViste(viste, [v], s);
  assert.equal(vociInsistenti(viste, 4).length, 0);
});

test("la busta dice quante volte l'ha già detto: senza, la ventesima è identica alla prima", () => {
  const v = { classe: "gate-orfano", gravita: "grave", file: "a.md", riga: 3, cosa: "gate senza file", domanda: "quale?" };
  const viste = { [chiaveVoce(v)]: { n: 4, scatto: 4, gravita: "grave", file: "a.md", cosa: v.cosa } };
  const ctx = JSON.parse(bustaPerIlModello([v], 1, viste)).hookSpecificOutput.additionalContext;
  assert.match(ctx, /già detto 4 volte/);
});

test("la prima volta non si dice niente: «già detto 1 volte» sarebbe rumore da subito", () => {
  const v = { classe: "gate-orfano", gravita: "grave", file: "a.md", riga: 3, cosa: "gate senza file", domanda: "quale?" };
  const viste = { [chiaveVoce(v)]: { n: 1, scatto: 1, gravita: "grave", file: "a.md", cosa: v.cosa } };
  const ctx = JSON.parse(bustaPerIlModello([v], 1, viste)).hookSpecificOutput.additionalContext;
  assert.ok(!/già detto/.test(ctx));
});

test("battito mai scattato = uscita 2: «non so se il canale è vivo» non è un verde", () => {
  const v = verdettoBattito(null, Date.now());
  assert.equal(v.vivo, false);
  assert.equal(v.uscita, 2);
});

test("battito con data illeggibile vale quanto nessun battito (un file corrotto non è una prova di vita)", () => {
  assert.equal(verdettoBattito({ quando: "ieri pomeriggio" }, Date.now()).uscita, 2);
});

test("battito vero: dice quando ha scattato e con che esito", () => {
  const adesso = Date.parse("2026-07-30T18:00:00Z");
  const v = verdettoBattito({ quando: "2026-07-30T17:30:00Z", file_toccati: 2, voci: 1, gravi: 0 }, adesso);
  assert.equal(v.vivo, true);
  assert.equal(v.uscita, 0);
  assert.match(v.testo, /30 min fa/);
});

// ── AR-508: il raggio a due passi e i legami che un import non dichiara ────────
//
// Nicola, 3/8: «fai sapere al sorvegliante chi poggia su un file in modo indiretto». Prima il raggio
// vedeva una cosa sola — `import "…/x.mjs"` o il percorso completo scritto in un .sh/.json — e i tre
// modi in cui questo repo lega davvero i pezzi gli erano invisibili: il percorso composto con
// `join()`, il lancio da systemd o dalla CI, e la catena a due passi.

test("il nome composto con join() è una dipendenza, e prima non lo era", () => {
  const c = nomiCitati(`const p = join(QUI, "sorvegliante.mjs");`);
  assert.ok(c.has("sorvegliante.mjs"), "è il modo in cui questo repo compone i percorsi");
});

test("systemd e i workflow contano: il worker parte da lì, non da un import", () => {
  // Il .service scrive il percorso ASSOLUTO del VPS (`/opt/ad/…`), che nel repo non esiste: il
  // legame regge sul nome del file, ed è per questo che il grafo confronta anche il basename.
  assert.ok(nomiCitati("ExecStart=/opt/ad/cervello/worker.sh --loop").has("worker.sh"));
  assert.ok(nomiCitati("      run: node cervello/gate-veri.mjs --json").has("cervello/gate-veri.mjs"));
  // …e la prova che conta: il legame arriva davvero fino al raggio.
  const citazioni = new Map([["ops/worker.service", nomiCitati("ExecStart=/opt/ad/cervello/worker.sh --loop")]]);
  assert.deepEqual(raggioDueP1assi(["cervello/worker.sh"], citazioni).get("cervello/worker.sh").diretti, ["ops/worker.service"]);
});

test("una MENZIONE non è una chiamata: il nome nudo in prosa non conta", () => {
  // Senza questo filtro il raggio di cancello-stop.mjs passava da 10 a 86 file: le schede del
  // cantiere e le lezioni nominano gli script per mestiere.
  const c = nomiCitati(`"titolo": "il cancello-stop.mjs non parlava a nessuno"`);
  assert.ok(!c.has("cancello-stop.mjs"), "una scheda che ti nomina non poggia su di te");
});

test("il raggio risale di un passo: chi poggia su chi poggia su di me", () => {
  const citazioni = new Map([
    ["cervello/chi-usa.mjs", new Set(["cervello/tocco.mjs"])],
    ["cervello/chi-usa-chi-usa.mjs", new Set(["cervello/chi-usa.mjs"])],
    ["cervello/estraneo.mjs", new Set(["cervello/altro.mjs"])],
  ]);
  const r = raggioDueP1assi(["cervello/tocco.mjs"], citazioni).get("cervello/tocco.mjs");
  assert.deepEqual(r.diretti, ["cervello/chi-usa.mjs"]);
  assert.deepEqual(r.indiretti, ["cervello/chi-usa-chi-usa.mjs"], "il secondo passo è il quadro ampio che mancava");
});

test("un file non è dipendente di sé stesso, e un diretto non si conta due volte", () => {
  const citazioni = new Map([
    ["cervello/a.mjs", new Set(["cervello/tocco.mjs"])],
    ["cervello/tocco.mjs", new Set(["cervello/a.mjs"])], // ciclo: a↔tocco
  ]);
  const r = raggioDueP1assi(["cervello/tocco.mjs"], citazioni).get("cervello/tocco.mjs");
  assert.deepEqual(r.diretti, ["cervello/a.mjs"]);
  assert.deepEqual(r.indiretti, [], "il ciclo non deve rimbalzare su di me né duplicare il diretto");
});

test("i registri di memoria restano fuori dal grafo: lì citare non è dipendere", () => {
  assert.equal(eCodice("cervello/x.mjs"), true);
  assert.equal(eCodice(".claude/settings.json"), true, "gli hook sono un legame vero: lanciano il file");
  assert.equal(eCodice("MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), false);
  assert.equal(eCodice("consegne/devops/nota.md"), false);
});

test("il verdetto separa i due numeri: quanti diretti e quanto lontano arriva", () => {
  const e = sorveglia({
    malattie: [],
    mutanti: [],
    toccati: [{ file: "cervello/tocco.mjs", contenuto: "", aggiunte: [] }],
    importatori: new Map([["cervello/tocco.mjs", { diretti: ["cervello/a.mjs"], indiretti: ["cervello/b.mjs"] }]]),
  });
  const r = e.voci.find((v) => v.classe === "raggio");
  assert.equal(r.diretti, 1);
  assert.equal(r.indiretti, 1);
  assert.match(r.cosa, /a due passi/, "l'elenco dice quali sono i lontani, non li mescola");
});

test("la vecchia forma (un elenco piatto) continua a funzionare", () => {
  // Il raggio è l'unico ingresso che qualcun altro potrebbe passare come array: non deve rompersi.
  const e = sorveglia({
    malattie: [],
    mutanti: [],
    toccati: [{ file: "cervello/tocco.mjs", contenuto: "", aggiunte: [] }],
    importatori: new Map([["cervello/tocco.mjs", ["cervello/a.mjs"]]]),
  });
  assert.equal(e.voci.find((v) => v.classe === "raggio").diretti, 1);
});

// ── AR-509: il giudizio sulla riparazione ─────────────────────────────────────
//
// Nicola, 3/8: «fallo giudicare se la riparazione è giusta». Non il merito del fix — quello lo dicono
// le prove — ma i due modi di riparare che si vedono nel diff e che in questa casa sono già costati
// due difetti: curare l'istanza lasciando la classe (AR-347), e far tornare verde la prova invece del
// codice.

const MAL_PIPE = { id: "esito-in-una-pipe", pattern: "node [^|]*\\| *tail", estensioni: [".sh"] };

test("⑩ curo una riga malata e nel file ne restano altre: me lo dice adesso", () => {
  const dopo = "node a.mjs | tail -1\nnode b.mjs | tail -1\necho fine";
  const r = classeRimasta([{ n: 1, testo: "node vecchio.mjs | tail -3" }], dopo, [MAL_PIPE], "cervello/x.sh");
  assert.equal(r.length, 1);
  assert.equal(r[0].quante, 2, "due sorelle vive nello stesso file");
  assert.equal(r[0].esempio, 1);
});

test("⑩ NON accusa chi passa di lì senza riparare niente", () => {
  // Con la sola metà «il file contiene la malattia» sarebbe rosso su quasi ogni file del repo.
  const dopo = "node a.mjs | tail -1";
  assert.deepEqual(classeRimasta([{ n: 4, testo: "# un commento qualsiasi" }], dopo, [MAL_PIPE], "cervello/x.sh"), []);
});

test("⑩ se ho curato TUTTE le sorelle, tace", () => {
  assert.deepEqual(classeRimasta([{ n: 1, testo: "node v.mjs | tail -3" }], "echo pulito", [MAL_PIPE], "cervello/x.sh"), []);
});

test("⑪ tolgo un caso dal test e non tocco il codice che difende", () => {
  const r = provaIndebolita({
    file: "cervello/test/salute.test.mjs",
    rimosse: [{ n: 12, testo: '  assert.equal(organi().length, 5);' }],
    toccati: ["cervello/test/salute.test.mjs"],
    esiste: () => true,
  });
  assert.equal(r.difeso, "cervello/salute.mjs");
  assert.equal(r.quante, 1);
});

test("⑪ se ho toccato ANCHE il codice, è una riparazione normale e tace", () => {
  const r = provaIndebolita({
    file: "cervello/test/salute.test.mjs",
    rimosse: [{ n: 12, testo: "  assert.equal(x, 5);" }],
    toccati: ["cervello/test/salute.test.mjs", "cervello/salute.mjs"],
    esiste: () => true,
  });
  assert.equal(r, null, "cambiare la prova insieme al codice è il lavoro, non il difetto");
});

test("⑪ aggiungere prove non è mai indebolire: guarda solo ciò che TOLGO", () => {
  assert.equal(provaIndebolita({ file: "cervello/test/x.test.mjs", rimosse: [], toccati: [], esiste: () => true }), null);
  // …e togliere una riga che non è un caso (un commento, una variabile) nemmeno.
  assert.equal(
    provaIndebolita({ file: "cervello/test/x.test.mjs", rimosse: [{ n: 3, testo: "  // vecchia nota" }], toccati: [], esiste: () => true }),
    null,
  );
});

test("⑪ un nome fuori convenzione non si indovina: taccio", () => {
  assert.equal(fileDifeso("cervello/test/allegati-chat.bats"), null);
  assert.equal(fileDifeso("cervello/test/salute.test.mjs"), "cervello/salute.mjs");
  assert.equal(provaIndebolita({ file: "cervello/prove-varie.mjs", rimosse: [{ n: 1, testo: "assert.ok(x)" }] }), null);
});

test("⑪ e se il file difeso non esiste più, non accuso: l'ha cancellato il controllo ⑥", () => {
  assert.equal(
    provaIndebolita({ file: "cervello/test/x.test.mjs", rimosse: [{ n: 1, testo: "assert.ok(x)" }], toccati: [], esiste: () => false }),
    null,
  );
});

test("i due giudizi arrivano al verdetto, con il colore giusto", () => {
  const e = sorveglia({
    malattie: [MAL_PIPE],
    mutanti: [],
    toccati: [{ file: "cervello/x.sh", contenuto: "node a.mjs | tail -1", aggiunte: [] }],
    rimossi: [{ file: "cervello/x.sh", rimosse: [{ n: 1, testo: "node v.mjs | tail -3" }] }],
  });
  const v = e.voci.find((x) => x.classe === "riparazione-parziale");
  assert.ok(v, "⑩ deve comparire");
  assert.equal(v.gravita, "media", "è una domanda seria, non un blocco: il debito è preesistente");

  const p = sorveglia({
    malattie: [],
    mutanti: [],
    toccati: [{ file: "cervello/test/salute.test.mjs", contenuto: "", aggiunte: [] }],
    rimossi: [{ file: "cervello/test/salute.test.mjs", rimosse: [{ n: 9, testo: "  assert.equal(a, b);" }] }],
    esiste: () => true,
  });
  const pv = p.voci.find((x) => x.classe === "prova-indebolita");
  assert.ok(pv, "⑪ deve comparire");
  assert.equal(pv.gravita, "grave", "spegnere una prova senza toccare il codice ferma il commit");
  assert.equal(gravi(p.voci).length, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// LE CINQUE RIPARAZIONI DEL 4/8 — Ⓐ perimetro in CI · Ⓑ salti dichiarati · Ⓒ fusione in corso
// Ⓓ l'altro repo · Ⓔ esenzione tracciata.
//
// Hanno tutte la stessa forma di difetto, e quindi la stessa forma di prova: NON si controlla che la
// guardia trovi qualcosa in più, si controlla che smetta di dire verde su ciò che non ha guardato.
// Per questo quasi ogni caso qui sotto ha il suo gemello negativo — «e quando invece è tutto a
// posto, tace»: una guardia che parla sempre viene spenta entro la settimana, e allora le cinque
// riparazioni sarebbero costate un guardiano invece di ripararlo.
// ─────────────────────────────────────────────────────────────────────────────

// ── Ⓐ IL PERIMETRO ───────────────────────────────────────────────────────────

test("Ⓐ un perimetro vuoto con un --base esplicito è cieco, non pulito (era il verde della CI)", () => {
  const m = motiviPerimetro({ base: "abc123", nToccati: 0, nRimossi: 0 });
  assert.equal(m.length, 1, "il caso che in CI stampava verde senza aver misurato niente");
  assert.match(m[0], /abc123/, "dice CON COSA ha provato a confrontarsi, o non è diagnosticabile");
});

test("Ⓐ senza --base un albero pulito resta una risposta legittima, non un allarme", () => {
  assert.deepEqual(motiviPerimetro({ base: null, nToccati: 0, nRimossi: 0 }), []);
});

test("Ⓐ con --base e dei file dentro non dice niente: il confronto ha funzionato", () => {
  assert.deepEqual(motiviPerimetro({ base: "abc123", nToccati: 3, nRimossi: 0 }), []);
  assert.deepEqual(motiviPerimetro({ base: "abc123", nToccati: 0, nRimossi: 2 }), [], "anche le sole rimozioni sono delta");
});

// ── Ⓑ I SALTI ────────────────────────────────────────────────────────────────

test("Ⓑ un file saltato per i byte entra fra i «non ho guardato» invece di sparire", () => {
  const m = motiviSalti({ grossi: ["dump.json"], illeggibili: [] });
  assert.equal(m.length, 1);
  assert.match(m[0], /dump\.json/, "il nome serve: «un file» non si può andare a controllare");
});

test("Ⓑ illeggibile e troppo grosso sono due motivi diversi, non uno solo", () => {
  const m = motiviSalti({ grossi: ["a.json"], illeggibili: ["b.bin"] });
  assert.equal(m.length, 2, "«non l'ho aperto per scelta» e «non ci sono riuscito» non sono la stessa cosa");
});

test("Ⓑ e quando non salto niente, taccio", () => {
  assert.deepEqual(motiviSalti({ grossi: [], illeggibili: [] }), []);
});

// ── Ⓒ LA FUSIONE ─────────────────────────────────────────────────────────────

test("Ⓒ durante un merge lo dichiaro: quelle righe non sono tutte mie (AR-503)", () => {
  assert.match(fusioneInCorso((n) => n === "MERGE_HEAD"), /merge/i);
});

test("Ⓒ vale per ogni stato che git lascia a metà, non solo per il merge che mi è capitato", () => {
  for (const [nome] of STATI_FUSIONE) {
    assert.ok(fusioneInCorso((n) => n === nome), `${nome} deve essere riconosciuto`);
  }
});

test("Ⓒ i nomi restano NUDI: un `.git/…` scritto a mano non trova niente dentro un worktree", () => {
  for (const [nome] of STATI_FUSIONE) {
    assert.ok(!nome.includes("/"), `${nome} deve essere un nome, non un percorso: dove sta lo sa git`);
  }
});

test("Ⓒ «git non risponde» è un terzo stato, non «nessuna fusione» (spazzata-fratelli, 4/8)", () => {
  // La prima stesura faceva `catch { return false }`: una domanda senza risposta diventava un «no».
  // L'ha bocciata la spazzata come istanza nuova di `fonte-troncata-letta-per-intera`, ed era nel
  // giusto — è la stessa malattia che queste cinque riparazioni esistono per togliere.
  const s = statoFusione();
  assert.ok("leggibile" in s, "l'ignoranza deve avere un valore suo, o sparisce dentro un `false`");
  assert.ok(s.leggibile || s.errore, "e se non è leggibile deve dire PERCHÉ, o non è diagnosticabile");
});

test("Ⓒ e ad albero fermo non dico niente", () => {
  assert.equal(fusioneInCorso(() => false), null);
});

// ── Ⓓ L'ALTRO REPO ───────────────────────────────────────────────────────────

test("Ⓓ se nel repo del sito c'è del lavoro non committato, dico che lì non arrivo", () => {
  const m = motiviMarketplace({ presente: true, sporchi: 7, leggibile: true });
  assert.equal(m.length, 1);
  assert.match(m[0], /7/, "il numero è la differenza fra un avviso e una scusa");
});

test("Ⓓ copia assente o pulita: silenzio, o sarebbe rumore a ogni modifica", () => {
  assert.deepEqual(motiviMarketplace({ presente: false }), []);
  assert.deepEqual(motiviMarketplace({ presente: true, sporchi: 0, leggibile: true }), []);
});

test("Ⓓ «c'è ma non risponde» è una cecità, e non si confonde con «pulita»", () => {
  const m = motiviMarketplace({ presente: true, sporchi: 0, leggibile: false });
  assert.equal(m.length, 1, "un errore ingoiato qui darebbe verde su un repo mai guardato");
});

// ── Ⓔ L'ESENZIONE ────────────────────────────────────────────────────────────

const CON_ESENZIONE = (classe = "malattia-nuova", quando = "2099-01-01") =>
  `const x = 1;\n// sorvegliante: ok ${classe} fino al ${quando} — è un esempio dentro una fixture, non codice vivo\n`;

test("Ⓔ una dichiarazione ben scritta viene letta con classe, scadenza e perché", () => {
  const { valide, rotte } = esenzioniDichiarate(CON_ESENZIONE());
  assert.equal(rotte.length, 0);
  assert.equal(valide.length, 1);
  assert.equal(valide[0].classe, "malattia-nuova");
  assert.equal(valide[0].scadenza, "2099-01-01");
  assert.match(valide[0].perche, /fixture/);
});

test("Ⓔ senza data non zittisce niente: è la porta di AR-338, e infatti si accusa da sola", () => {
  const { valide, rotte } = esenzioniDichiarate("// sorvegliante: ok malattia-nuova — falso positivo, fidatevi\n");
  assert.equal(valide.length, 0, "un'esenzione perpetua non deve poter nascere per distrazione");
  assert.equal(rotte.length, 1);
});

test("Ⓔ un perché di due parole non è un perché", () => {
  const { valide, rotte } = esenzioniDichiarate("// sorvegliante: ok * fino al 2099-01-01 — boh\n");
  assert.equal(valide.length, 0);
  assert.equal(rotte.length, 1);
});

test("Ⓔ nessuna dichiarazione = nessuna voce: non invento un problema dove non c'è scritto niente", () => {
  const { valide, rotte } = esenzioniDichiarate("const x = 1;\n// un commento qualunque\n");
  assert.equal(valide.length + rotte.length, 0);
});

const VOCE = (over = {}) => ({ classe: "malattia-nuova", gravita: "grave", file: "cervello/x.mjs", cosa: "riga malata", ...over });

test("Ⓔ l'esenzione viva toglie la voce E la conta: sparire in silenzio sarebbe la stessa bugia", () => {
  const r = filtraEsentate([VOCE()], new Map([["cervello/x.mjs", CON_ESENZIONE()]]), "2026-08-04");
  assert.equal(r.voci.length, 0, "la voce esce dall'elenco");
  assert.equal(r.esentate.length, 1, "ma resta contata, con la sua dichiarazione");
  assert.equal(r.esentate[0].esenzione.scadenza, "2099-01-01");
});

test("Ⓔ scaduta, la voce TORNA e si porta dietro la data — è il promemoria che nessuno scriverà", () => {
  const r = filtraEsentate([VOCE()], new Map([["cervello/x.mjs", CON_ESENZIONE("malattia-nuova", "2026-01-01")]]), "2026-08-04");
  assert.equal(r.esentate.length, 0);
  assert.equal(r.voci.length, 1);
  assert.match(r.voci[0].cosa, /scaduta il 2026-01-01/);
});

test("Ⓔ un'esenzione su un'altra classe non copre questa: non è un interruttore generale", () => {
  const r = filtraEsentate([VOCE()], new Map([["cervello/x.mjs", CON_ESENZIONE("gate-orfano")]]), "2026-08-04");
  assert.equal(r.voci.length, 1);
  assert.equal(r.esentate.length, 0);
});

test("Ⓔ `*` copre tutto, ma va scritto apposta", () => {
  const r = filtraEsentate([VOCE()], new Map([["cervello/x.mjs", CON_ESENZIONE("*")]]), "2026-08-04");
  assert.equal(r.esentate.length, 1);
});

test("Ⓔ un'esenzione in un ALTRO file non tocca questa voce", () => {
  const r = filtraEsentate([VOCE()], new Map([["cervello/altro.mjs", CON_ESENZIONE("*")]]), "2026-08-04");
  assert.equal(r.voci.length, 1);
});

test("Ⓔ le informative non si esentano: un quadro non è un compito", () => {
  const r = filtraEsentate([VOCE({ classe: "raggio", gravita: "informativa" })], new Map([["cervello/x.mjs", CON_ESENZIONE("*")]]), "2026-08-04");
  assert.equal(r.voci.length, 1);
  assert.equal(r.esentate.length, 0);
});

test("Ⓔ una scritta rotta diventa una voce anche dove non c'era nient'altro da dire", () => {
  const r = filtraEsentate([], new Map([["cervello/x.mjs", "// sorvegliante: ok tutto\n"]]), "2026-08-04");
  assert.equal(r.voci.length, 1, "chi l'ha scritta CREDE di aver risposto: il silenzio qui è peggio del rosso");
  assert.equal(r.voci[0].classe, "esenzione-malfatta");
});

test("Ⓔ le esenzioni arrivano fino al verdetto, e il file della guardia non si legge da sé", () => {
  const conMarcatore = "catch(() => {})\n// sorvegliante: ok malattia-nuova fino al 2099-01-01 — provato a mano, è un esempio\n";
  const dentro = sorveglia({
    ...base,
    oggi: "2026-08-04",
    toccati: [{ file: "cervello/x.mjs", contenuto: conMarcatore, aggiunte: [{ n: 1, testo: "catch(() => {})" }] }],
  });
  assert.equal(gravi(dentro.voci).length, 0, "la dichiarazione vale come risposta");
  assert.equal(dentro.esentate.length, 1);

  // «Menzione ≠ chiamata», la quinta volta in questo repo: qui sopra, nel file della guardia, la
  // forma è SCRITTA per spiegarla. Un lettore ingenuo l'avrebbe presa per una dichiarazione vera.
  const suSeStessa = sorveglia({
    ...base,
    oggi: "2026-08-04",
    toccati: [{ file: "cervello/sorvegliante.mjs", contenuto: "// sorvegliante: ok tutto quanto\n", aggiunte: [] }],
  });
  assert.equal(suSeStessa.voci.filter((v) => v.classe === "esenzione-malfatta").length, 0);
});

// ── LA BUSTA: è lì che queste cinque riparazioni o arrivano, o non esistono ───

test("i «non ho guardato» arrivano nella BUSTA, non solo nel terminale che nessuno legge (AR-465)", () => {
  const b = bustaPerIlModello([], 2, {}, { motivi: ["c'è un merge in corso: righe non mie"] });
  assert.ok(b, "una cecità dichiarata a chi non la legge è una cecità taciuta");
  assert.match(JSON.parse(b).hookSpecificOutput.additionalContext, /non ho guardato.*merge/s);
});

test("la busta mostra anche le esentate, con la scadenza", () => {
  const b = bustaPerIlModello([], 1, {}, { esentate: [{ classe: "malattia-nuova", file: "cervello/x.mjs", esenzione: { scadenza: "2099-01-01" } }] });
  assert.match(JSON.parse(b).hookSpecificOutput.additionalContext, /2099-01-01/);
});

test("e a mani pulite la busta resta NULLA: chi parla sempre viene spento entro la settimana", () => {
  assert.equal(bustaPerIlModello([], 0, {}, { motivi: [], esentate: [] }), null);
  assert.equal(bustaPerIlModello([], 0, {}), null, "la vecchia forma a tre argomenti non deve rompersi");
});

test("Ⓔ nella PROSA e nel vault un marcatore è una MENZIONE, non una dichiarazione", () => {
  // Preso dal vivo: scrivendo la scheda di cantiere che documenta questa forma, la guardia me l'ha
  // contestata come «esenzione malfatta». Aveva letto una spiegazione come una dichiarazione — la
  // quinta comparsa in questo repo di «menzione ≠ chiamata», dentro il commento che dice di
  // averla evitata. La regola era già in casa, nel controllo ⑥b.
  assert.equal(leggeMarcatori("MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), false);
  assert.equal(leggeMarcatori("cervello/come-riparo.md"), false, "in un .md ogni riga è una menzione");
  assert.equal(leggeMarcatori("cervello/sorvegliante.mjs"), false, "qui la forma è scritta per insegnarla");
  assert.equal(leggeMarcatori("cervello/x.mjs"), true, "e nel codice vivo invece vale");
});

test("Ⓔ una scheda del vault che cita la forma non produce nessuna voce", () => {
  const scheda = 'la forma e "sorvegliante: ok <classe> fino al AAAA-MM-GG — <perche>"';
  const e = sorveglia({
    ...base,
    oggi: "2026-08-04",
    toccati: [{ file: "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json", contenuto: scheda, aggiunte: [] }],
  });
  assert.equal(e.voci.filter((v) => v.classe === "esenzione-malfatta").length, 0);
});

// ── AR-530: le due tarature sbagliate del 3/8, trovate attaccando il mio stesso lavoro ─────────
//
// Nicola, 4/8: «risolvi i 3 difetti». Questi sono i primi due — e non li ha trovati una rilettura,
// li ha trovati un attacco: chiamare le mie funzioni con i gesti che una persona fa davvero.

test("⑪ IL SALDO, NON IL GESTO: rinominare una variabile in un test non e' indebolire", () => {
  // Sostituire una riga, per un diff, e' toglierne una e aggiungerne un'altra. Con la regola vecchia
  // questi quattro casi uscivano GRAVI e bloccavano il commit.
  const casi = [
    ["rinomino una variabile", [{ n: 5, testo: "  assert.equal(atteso, 2);" }], [{ n: 5, testo: "  assert.equal(risultato, 2);" }]],
    ["riscrivo il messaggio dell'asserzione", [{ n: 9, testo: '  assert.equal(a, b, "vecchio");' }], [{ n: 9, testo: '  assert.equal(a, b, "piu chiaro");' }]],
    ["sposto un caso piu in alto nel file", [{ n: 3, testo: "  assert.ok(x);" }], [{ n: 1, testo: "  assert.ok(x);" }]],
  ];
  for (const [nome, rimosse, aggiunte] of casi) {
    const r = provaIndebolita({ file: "cervello/test/salute.test.mjs", rimosse, aggiunte, toccati: ["cervello/test/salute.test.mjs"], esiste: () => true });
    assert.equal(r, null, `${nome}: il saldo e' zero, qui non si e' indebolito niente`);
  }
});

test("⑪ ma se il file prova DAVVERO di meno, parla e dice di quanto", () => {
  const r = provaIndebolita({
    file: "cervello/test/salute.test.mjs",
    rimosse: [{ n: 5, testo: "  assert.equal(a, 1);" }, { n: 6, testo: "  assert.equal(b, 2);" }],
    aggiunte: [{ n: 5, testo: "  assert.equal(a, 1);" }],
    toccati: ["cervello/test/salute.test.mjs"],
    esiste: () => true,
  });
  assert.equal(r.quante, 1, "due tolti, uno rimesso: il saldo e' uno");
  assert.equal(r.tolte, 2);
  assert.equal(r.messe, 1);
});

test("⑪ commentare un'asserzione invece di toglierla NON la salva (il buco gemello)", () => {
  const r = provaIndebolita({
    file: "cervello/test/salute.test.mjs",
    rimosse: [{ n: 5, testo: "  assert.equal(a, 1);" }],
    aggiunte: [{ n: 5, testo: "  // assert.equal(a, 1);" }],
    toccati: ["cervello/test/salute.test.mjs"],
    esiste: () => true,
  });
  assert.ok(r, "una riga commentata non regge nessuna prova: il saldo resta negativo");
  assert.equal(r.messe, 0);
});

test("⑤ un nome di file che ce l'hanno in settanta non identifica nessuno", () => {
  // Misurato sul repo il 3/8: 76 file chiamati route.ts, e toccarne uno dava «22 dipendenti».
  const citazioni = new Map([
    ["pannello/src/app/api/a/route.ts", new Set(["route.ts"])],
    ["pannello/src/app/api/b/route.ts", new Set(["route.ts"])],
    ["cervello/guardiano.mjs", new Set(["route.ts"])], // lo nomina come pattern, non lo usa
    ["cervello/vero-utente.mjs", new Set(["pannello/src/app/api/a/route.ts"])], // questo si', col percorso
  ]);
  const r = raggioDueP1assi(["pannello/src/app/api/a/route.ts"], citazioni).get("pannello/src/app/api/a/route.ts");
  assert.deepEqual(r.diretti, ["cervello/vero-utente.mjs"], "solo chi lo nomina per intero");
});

test("⑤ …e il nome corto continua a valere quando e' unico: e' il legame che AR-508 doveva vedere", () => {
  const citazioni = new Map([
    ["cervello/sorvegliante.mjs", new Set(["spazzata-fratelli.mjs"])],
    ["cervello/spazzata-fratelli.mjs", new Set()],
  ]);
  const r = raggioDueP1assi(["cervello/spazzata-fratelli.mjs"], citazioni).get("cervello/spazzata-fratelli.mjs");
  assert.deepEqual(r.diretti, ["cervello/sorvegliante.mjs"], "un nome unico resta un legame");
});

// ── AR-531: la pagina API la chiama il browser, non un file ────────────────────
//
// Nicola, 4/8: «quel tipo di legame il raggio non lo vede, né prima né adesso». Nel Pannello ci sono
// 84 indirizzi chiamati con fetch, e per il grafo erano zero legami: cambiare la risposta di una
// rotta sembrava non toccare niente, mentre rompe una schermata che Nicola guarda.

test("⑤ chi chiama una rotta con fetch è un dipendente vero", () => {
  const citazioni = new Map([
    ["pannello/src/components/NumeriReport.tsx", nomiCitati('const r = await fetch("/api/anomalie?giorni=7");')],
    ["pannello/src/app/api/anomalie/route.ts", new Set()],
  ]);
  const r = raggioDueP1assi(["pannello/src/app/api/anomalie/route.ts"], citazioni).get("pannello/src/app/api/anomalie/route.ts");
  assert.deepEqual(r.diretti, ["pannello/src/components/NumeriReport.tsx"], "la query dopo il ? non cambia quale file risponde");
});

test("⑤ …ma nominare una rotta in un COMMENTO non è chiamarla", () => {
  // Alla prima prova sul repo vero, questo file risultava chiamante di due rotte del Pannello:
  // le nomina in un commento per spiegare la regola. Quarta comparsa di «menzione ≠ chiamata».
  const citazioni = new Map([
    ["cervello/sorvegliante.mjs", nomiCitati('// esempio: fetch("/api/anomalie") è un legame vero')],
    ["pannello/src/app/api/anomalie/route.ts", new Set()],
  ]);
  const r = raggioDueP1assi(["pannello/src/app/api/anomalie/route.ts"], citazioni).get("pannello/src/app/api/anomalie/route.ts");
  assert.deepEqual(r.diretti, [], "un commento che spiega non è codice che chiama");
});

test("⑤ l'indirizzo di una rotta si deduce dalla convenzione, non si indovina", () => {
  assert.equal(aliasDiRotta("pannello/src/app/api/metriche/cassa/route.ts"), "/api/metriche/cassa");
  assert.equal(aliasDiRotta("pannello/src/app/page.tsx"), null, "una pagina normale non è una rotta API");
  assert.equal(aliasDiRotta("cervello/sorvegliante.mjs"), null);
});

test("⑤ una rotta col parametro la si chiama con una variabile: vale anche il suo prefisso (AR-534)", () => {
  // Trovato attaccando la cura di AR-531: `api/lavori/[id]/route.ts` risponde a `/api/lavori/<x>`, e
  // chi la chiama scrive fetch(`/api/lavori/${id}`) — nel testo resta solo `/api/lavori`. Confrontando
  // la sola forma piena, quella rotta risultava di nuovo senza chiamanti: il falso negativo che
  // AR-531 doveva chiudere, sopravvissuto dentro la sua stessa cura.
  assert.deepEqual(aliasDiRotta("pannello/src/app/api/lavori/[id]/route.ts"), ["/api/lavori/[id]", "/api/lavori"]);
  assert.equal(aliasDiRotta("pannello/src/app/api/anomalie/route.ts"), "/api/anomalie", "una rotta fissa resta una stringa sola");
  const citazioni = new Map([
    ["pannello/src/components/Lavori.tsx", nomiCitati("await fetch(`/api/lavori/${encodeURIComponent(id)}`)")],
    ["pannello/src/app/api/lavori/[id]/route.ts", new Set()],
  ]);
  const r = raggioDueP1assi(["pannello/src/app/api/lavori/[id]/route.ts"], citazioni).get("pannello/src/app/api/lavori/[id]/route.ts");
  assert.deepEqual(r.diretti, ["pannello/src/components/Lavori.tsx"]);
});

// ── I referti: il diario di chi accusa non è una dichiarazione (AR-543) ──────

test("il diario del sorvegliante non dichiara difese: lì un nome è la cronaca di un allarme", () => {
  // Successo il 4/8 05:55: prendendo da main il proprio storico (referto rigenerabile, si prende un
  // lato e si va avanti) la guardia ha accusato SÉ STESSA quattro volte, sul proprio diario.
  const e = daDiff([
    "--- a/MyCity-Vault/90-Memoria-AI/auto-coscienza/sorvegliante-storico.json",
    "+++ b/MyCity-Vault/90-Memoria-AI/auto-coscienza/sorvegliante-storico.json",
    "@@ -27,1 +27,0 @@",
    '-      "cosa": "ho tolto la riga che chiamava «cervello/gate-veri.mjs»"',
  ]);
  assert.equal(gravi(e.voci).length, 0, "terza forma di «menzione ≠ chiamata», e la più imbarazzante");
});

test("…ma il cantiere e le lezioni restano guardati: lì le difese ci vivono davvero", () => {
  const e = daDiff([
    "--- a/MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json",
    "+++ b/MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json",
    "@@ -10,1 +10,0 @@",
    '-  "gate": "node cervello/gate-veri.mjs"',
  ]);
  assert.equal(
    gravi(e.voci).filter((v) => v.classe === "difesa-rimossa").length,
    1,
    "l'esenzione è per UN file preciso, non per tutti i JSON della memoria",
  );
});
