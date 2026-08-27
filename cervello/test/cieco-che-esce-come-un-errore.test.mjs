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

prova("SUL SERIO: i tre curati, senza il vault sotto, escono 2 e non 1", () => {
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
    for (const t of ["bilancio-vivo", "metabolismo", "midollo-spinale"]) {
      const r = spawnSync(process.execPath, [join(dir, "cervello", `${t}.mjs`), "--json"], { encoding: "utf8" });
      assert.equal(r.status, 2, `${t} senza il suo file deve uscire 2 (non ho potuto misurare), non ${r.status}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("IL TETTO: quanti programmi confondono ancora «non ho misurato» con «ho trovato un problema»", () => {
  // Misurato il 2026-08-27 sul codice vero: erano 21, tre curati in questo lotto (bilancio-vivo,
  // metabolismo, midollo-spinale) e il tetto scende con loro. Scende quando qualcuno converte il ramo
  // a `process.exit(2)`, e non risale. Se diventa rosso in su, qualcuno ne ha aggiunto uno nuovo.
  const TETTO = 18;
  const malati = readdirSync(CERVELLO)
    .filter((f) => f.endsWith(".mjs"))
    .filter((f) => confondeCiecoEdErrore(readFileSync(join(CERVELLO, f), "utf8")).confonde);
  assert.ok(
    malati.length <= TETTO,
    `programmi che confondono ⚪ e ❌: ${malati.length} > tetto ${TETTO}. Sono: ${malati.join(", ")}`,
  );
});

console.log(`# ${passate}/${passate + rossi.length} passate`);
if (rossi.length) process.exit(1);
