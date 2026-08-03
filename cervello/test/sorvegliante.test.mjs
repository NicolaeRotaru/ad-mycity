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
  fileDifeso,
  raggioDueP1assi,
  eCodice,
  VICINANZA_NOTA,
  LETTERALI_MIN,
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
