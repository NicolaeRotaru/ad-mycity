#!/usr/bin/env node
// LA SPAZZATA — la prova che non si fida dell'elenco.
//
// PERCHE'. Il 23/8/2026, riparando le promesse del sito, le schede nominavano DUE posti per «carta
// o contanti alla consegna» e i posti veri erano SETTE: le schede coprivano il 29%. Chi ripara
// fidandosi della scheda ripara un terzo e dichiara chiuso il resto. Il grep semplice non basta,
// perche' nelle pagine la frase e' spezzata su piu' righe dentro il JSX.
//
// COSA PROVA QUESTO FILE, su un finto sito costruito qui dentro:
//   ① una frase spezzata su tre righe viene TROVATA (il grep di riga la manca);
//   ② lo stesso posto si conta UNA volta, non una per riga della finestra;
//   ③ la frase dentro un commento non finisce fra i posti che l'utente legge;
//   ④ maiuscole, apostrofi curvi e spazi doppi non fanno perdere il posto;
//   ⑤ con --attese l'uscita e' 2 quando i posti veri sono piu' di quelli nominati dalla scheda,
//      e 0 quando il conto torna (un guardiano che suona sempre viene aggirato al secondo giro).
//
// NON-VACUITA' (eseguita il 3/9/2026): in `cervello/spazzata-frase.mjs`, sostituendo in `comeRegola` il
// separatore a spazi liberi con uno spazio secco, i casi ① ② ⑤ diventano ROSSI (3 su 7) — che e' esattamente
// lo stato in cui la macchina cercava le frasi riga per riga e ne trovava un terzo.

import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spazza, appiattisci, comeRegola } from "../spazzata-frase.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const COMANDO = join(QUI, "..", "spazzata-frase.mjs");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

// Un finto sito con la stessa forma di quello vero: app/, components/, lib/.
const radice = mkdtempSync(join(tmpdir(), "spazzata-"));
mkdirSync(join(radice, "app", "checkout"), { recursive: true });
mkdirSync(join(radice, "components"), { recursive: true });
mkdirSync(join(radice, "lib"), { recursive: true });

// ① la frase spezzata su tre righe, come succede davvero nel JSX
writeFileSync(join(radice, "app", "checkout", "page.tsx"), `export default function Cassa() {
  return (
    <p className="testo">
      Consegna
      gratuita
      sopra i 30 euro
    </p>
  );
}
`);
// ③ la stessa frase, ma dentro un commento
writeFileSync(join(radice, "components", "Nota.tsx"), `// Consegna gratuita sopra i 30 euro: qui c'era la vecchia promessa.
export const Nota = () => null;
`);
// ④ maiuscole diverse, apostrofo curvo, spazi doppi
writeFileSync(join(radice, "lib", "promesse.ts"), `export const PROMESSA = "CONSEGNA  Gratuita sopra i 30 euro";
export const ALTRA = "L’ordine arriva domani";
`);

prova("una frase spezzata su tre righe viene trovata lo stesso", () => {
  const esito = spazza(radice, "consegna gratuita sopra i 30 euro");
  const files = esito.posti.map((p) => p.file);
  assert.ok(files.some((f) => f.includes("page.tsx")), "il grep riga per riga qui non trova niente");
});

prova("lo stesso posto si conta una volta sola", () => {
  const esito = spazza(radice, "consegna gratuita sopra i 30 euro");
  const nella_cassa = esito.posti.filter((p) => p.file.includes("page.tsx"));
  assert.equal(nella_cassa.length, 1, `contati ${nella_cassa.length} posti dove ce n'e' uno: il conto gonfiato fa sembrare finito un lavoro che non lo e'`);
});

prova("la frase nel commento sta a parte: l'utente non la legge", () => {
  const esito = spazza(radice, "consegna gratuita sopra i 30 euro");
  assert.ok(!esito.posti.some((p) => p.file.includes("Nota.tsx")), "un commento non e' una promessa fatta al cliente");
  assert.ok(esito.nei_commenti.some((p) => p.file.includes("Nota.tsx")), "ma va detto lo stesso, non nascosto");
});

prova("maiuscole, apostrofi curvi e spazi doppi non fanno perdere il posto", () => {
  const esito = spazza(radice, "consegna gratuita sopra i 30 euro");
  assert.ok(esito.posti.some((p) => p.file.includes("promesse.ts")), "«CONSEGNA  Gratuita» e «consegna gratuita» sono la stessa promessa");
  assert.equal(appiattisci("L’ordine  ARRIVA\ndomani"), "l'ordine arriva domani");
});

prova("una scheda che ne nomina uno meno del vero fa uscita rossa", () => {
  const veri = spazza(radice, "consegna gratuita sopra i 30 euro").posti.length;
  assert.ok(veri >= 2, "il finto sito deve avere almeno due posti, altrimenti la prova non prova niente");
  let uscita = 0;
  try {
    execFileSync("node", [COMANDO, "consegna gratuita sopra i 30 euro", "--repo", radice, "--attese", String(veri - 1)], { encoding: "utf8" });
  } catch (e) { uscita = e.status; }
  assert.equal(uscita, 2, "una scheda che ne nomina meno del vero deve far fallire il conto, non passare in silenzio");
});

prova("quando la scheda li nomina tutti, l'uscita e' verde", () => {
  const esito = spazza(radice, "consegna gratuita sopra i 30 euro");
  let uscita = 0;
  try {
    execFileSync("node", [COMANDO, "consegna gratuita sopra i 30 euro", "--repo", radice, "--attese", String(esito.posti.length)], { encoding: "utf8" });
  } catch (e) { uscita = e.status; }
  assert.equal(uscita, 0, "un guardiano che suona anche quando il conto torna viene aggirato al secondo giro");
});

prova("una frase vuota non passa per «nessun posto trovato»", () => {
  assert.equal(comeRegola("   "), null, "una ricerca senza frase deve dirlo, non rispondere zero");
});

rmSync(radice, { recursive: true, force: true });

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
