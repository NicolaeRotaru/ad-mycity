// ⚪ ≠ ❌ — AR-859. Un guardiano che non ha potuto guardare non deve dire «ho trovato un problema».
//
// Il contratto di casa ha tre risposte (AR-322, scritto in cervello/misura-o-cieco.mjs):
//   0 = passato · 1 = ho guardato e ho trovato una violazione · 2 = NON HO POTUTO MISURARE.
//
// Ventuno programmi lo violano nello stesso modo: il ramo che dichiara «il file che mi serve non
// c'e'» esce 1, cioe' identico a quando hanno guardato davvero e trovato qualcosa. Da fuori i due
// stati non si distinguono, e chi legge va a riparare il problema sbagliato.
//
// Questo file NON li ripara: tiene la linea. Il numero e' un TETTO che scende e non risale.

import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import assert from "node:assert/strict";
import { confondeCiecoEdErrore } from "../misura-o-cieco.mjs";

const QUI = import.meta.dirname;
const CERVELLO = join(QUI, "..");
let passate = 0;
const rossi = [];
function prova(nome, fn) {
  try { fn(); passate++; console.log(`# ok — ${nome}`); }
  catch (e) { rossi.push(nome); console.log(`# NON ok — ${nome}\n#    ${e.message.split("\n")[0]}`); }
}

prova("il ramo del cieco che esce 1, in un programma che usa 1 anche per bocciare, si vede", () => {
  const src = [
    'if (!existsSync(FILE)) {',
    '  console.error("il registro non e\' stato trovato");',
    '  process.exit(1);',
    '}',
    'process.exit(problemi.length ? 1 : 0);',
  ].join("\n");
  const r = confondeCiecoEdErrore(src);
  assert.equal(r.confonde, true, "questo e' esattamente il caso che il file esiste per trovare");
  assert.equal(r.riga, 3, "e deve dire su quale riga");
});

prova("chi il cieco lo fa uscire 2 e' a posto, ed e' la cura", () => {
  const src = [
    'if (!existsSync(FILE)) {',
    '  console.error("il registro non e\' stato trovato");',
    '  process.exit(2);',
    '}',
    'process.exit(problemi.length ? 1 : 0);',
  ].join("\n");
  assert.equal(confondeCiecoEdErrore(src).confonde, false, "il 2 e' proprio la terza risposta del contratto");
});

prova("un programma che esce 1 SOLO quando crepa non conta: crepare non e' essere cieco", () => {
  const src = [
    'main().catch((e) => {',
    '  console.error("ERRORE:", e.message);',
    '  process.exit(1);',
    '});',
  ].join("\n");
  assert.equal(confondeCiecoEdErrore(src).confonde, false, "il ramo di catch e' un'altra cosa");
});

prova("e un cieco che esce 1 in un programma che NON usa 1 per bocciare non e' questa malattia", () => {
  // Qui l'1 vuol dire una cosa sola. E' un difetto piu' piccolo e diverso: non lo conto qui, perche'
  // un metro che conta due malattie insieme non si puo' portare a zero.
  const src = [
    'if (!existsSync(FILE)) {',
    '  console.error("non trovato");',
    '  process.exit(1);',
    '}',
    'process.exit(0);',
  ].join("\n");
  assert.equal(confondeCiecoEdErrore(src).confonde, false);
});

prova("un sorgente vuoto non e' malato, ed e' il ⚪ che non deve diventare un ❌", () => {
  assert.equal(confondeCiecoEdErrore("").confonde, false);
  assert.equal(confondeCiecoEdErrore().confonde, false);
});

prova("SUL SERIO: i nove curati, senza il loro file sotto, escono 2 e non 1", () => {
  // Questa e' la prova che GIRA, e serve proprio qui. La cura tocca un ramo che in casa non si
  // apre mai — il vault c'e' sempre — cioe' la forma di prova vuota numero ①: scritta bene, sul
  // ramo giusto, e quella riga qui non la esegue nessuno.
  //
  // Il modo per aprirlo davvero: la radice se la calcolano da DOVE STA IL LORO FILE. Copiando
  // l'albero in una cartella senza `MyCity-Vault/` accanto, il file che cercano non c'e' per
  // davvero. Costa 0,16 secondi in tutto — misurato, perche' una prova lenta e' una prova che
  // nessuno lancia.
  const dir = mkdtempSync(join(tmpdir(), "cieco-"));
  try {
    cpSync(CERVELLO, join(dir, "cervello"), { recursive: true });
    // Ogni attrezzo ha il SUO file. Per quasi tutti sta nel vault, che nella copia non c'e'; uno pero'
    // legge un file che vive dentro cervello/, quindi la copia se lo porta dietro e va tolto a mano —
    // se ne accorge questa prova, non io: lanciandolo usciva 0, cioe' il ramo non si era aperto.
    const CURATI = [
      { nome: "bilancio-vivo" },
      { nome: "metabolismo" },
      { nome: "midollo-spinale" },
      { nome: "keyword-owner-check" },
      { nome: "freschezza-okr" },
      { nome: "guardiano-tempo" },
      { nome: "chiusure-audit" },
      { nome: "sentinella-fonti", togli: "cervello/radar-fonti.json" },
      { nome: "permessi-check", togli: ".claude" },
    ];
    for (const { nome, togli } of CURATI) {
      if (togli) rmSync(join(dir, togli), { force: true });
      const r = spawnSync(process.execPath, [join(dir, "cervello", `${nome}.mjs`), "--json"], { encoding: "utf8" });
      assert.equal(r.status, 2, `${nome} senza il suo file deve uscire 2 (non ho potuto misurare), non ${r.status}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("IL TETTO: quanti programmi confondono ancora «non ho misurato» con «ho trovato un problema»", () => {
  // ESENTI — guardati uno per uno, e NON sono questa malattia. Il riconoscitore li pesca perche' nel
  // contesto compare una parola del cieco, ma li' l'assenza del file e' il REPERTO, non una cecita'.
  // Un tetto che conta anche questi non si puo' portare a zero, e un numero che non arriva a zero si
  // impara a ignorarlo: e' esattamente il difetto che AR-375 racconta.
  const ESENTI = {
    "freschezza-checklist.mjs":
      "Se CHECKLIST-NICOLA.md non esiste, l'assenza E' il reperto: il messaggio dice «creala in questo giro». Non e' «non ho potuto guardare», e' «ho guardato e manca».",
    "traccia-decisione.mjs":
      "Ha gia' il suo process.exit(2) per il caso cieco vero (registro dell'autopilota assente). L'uscita 1 e' un'altra cosa: se il registro delle DECISIONI non esiste, allora ogni atto reale e' senza traccia — che e' il reperto che questo strumento esiste per dare.",
    "collega-marketplace.mjs":
      "E' un ramo di catch: il collegamento del repo e' FALLITO (rete, token, repo inesistente). Questo attrezzo non misura, agisce — e un'azione fallita esce 1, giustamente.",
    "programma-correzione-ar114.mjs":
      "«il documento non e' quello che mi aspettavo, non scrivo niente» e' un reperto e una scelta: meglio un file vecchio che un file mezzo corretto. Non e' cecita'.",
    "rivedi-lezione.mjs":
      "«questa lezione non esiste» e' la risposta a una domanda, non l'impossibilita' di rispondere. Come grep che non trova: 1 e' il codice giusto.",
    "coerenza-fatti.mjs":
      "«fatto X non trovato» su un comando `rimuovi <id>`: e' la risposta a quello che gli hai chiesto, non una cecita'.",
    "git-merge.mjs":
      "«--force non esiste piu'» e' un RIFIUTO deliberato, messo li' apposta per non saltare il freno sull'azione piu' irreversibile della macchina. Uscire 1 e' esattamente giusto.",
    "git-pr.mjs":
      "«il branch locale non esiste, crealo prima» dice cosa c'e' che non va nella richiesta. E' un reperto sull'invocazione, non un «non ho potuto guardare».",
    "test-pannello.mjs":
      "«nessun test .test.mts: il Pannello non ha rete» E' il reperto, ed e' grave: non che non abbia potuto contarli, ma che non ce ne siano.",
  };

  // Misurato il 2026-08-27 sul codice vero: 21 lordi. Nove curati nel lotto precedente, nove
  // dichiarati esenti qui sopra col perche'. Gli ultimi TRE — test-cervello, valida-contratti,
  // chiusura-loop --sonda — erano i piu' delicati perche' il loro codice d'uscita lo legge il giro
  // o il cancello: curati il 2026-08-28 (AR-859), e il debito e' ZERO.
  //
  // Lo zero e' un tetto che scende e non risale: da qui in poi ogni ramo di cecita' nuovo che esca 1
  // fa rosso questo caso il giorno stesso in cui nasce. La cura si vede in cervello/posto-o-contenuto.mjs
  // (la decisione ⚪-o-❌, pura) e si prova comportamentalmente in
  // cervello/test/il-posto-che-non-ce-non-e-un-reperto.test.mjs, che esegue i tre strumenti in una
  // copia dell'albero spoglia e pretende 2 — e col posto presente e vuoto pretende 1, cosi' che
  // «curare» facendo uscire 2 tutto quanto (falso allarme → silenzio) non passi.
  const TETTO = 0;
  const malati = readdirSync(CERVELLO)
    .filter((f) => f.endsWith(".mjs"))
    .filter((f) => confondeCiecoEdErrore(readFileSync(join(CERVELLO, f), "utf8")).confonde);

  // Un'esenzione che non copre piu' niente e' un residuo che nasconde il prossimo caso vero.
  const orfane = Object.keys(ESENTI).filter((f) => !malati.includes(f));
  assert.deepEqual(orfane, [], `esenzioni che non corrispondono piu' a niente: toglile — ${orfane.join(", ")}`);

  const debito = malati.filter((f) => !ESENTI[f]);
  assert.ok(
    debito.length <= TETTO,
    `programmi che confondono ⚪ e ❌: ${debito.length} > tetto ${TETTO}. Sono: ${debito.join(", ")}`,
  );
});

console.log(`# ${passate}/${passate + rossi.length} passate`);
if (rossi.length) process.exit(1);
