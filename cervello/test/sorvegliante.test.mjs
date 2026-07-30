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
  bustaPerIlModello,
  righeDiFileNuovo,
  verdettoBattito,
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
