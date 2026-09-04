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
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, symlinkSync } from "node:fs";
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
// Tutte e quattro: con --attese, un conto fatto su una parte del sito non e' un conto.
mkdirSync(join(radice, "messages"), { recursive: true });

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

// ── I tre buchi trovati dalla revisione del 3/9/2026 ────────────────────────

prova("puntata su un posto senza niente da leggere, non dice verde: dice che non ha guardato", () => {
  // Il buco peggiore: con --attese 7 su una cartella vuota stampava la spunta e usciva 0.
  const vuota = mkdtempSync(join(tmpdir(), "spazzata-vuota-"));
  let uscita = 0;
  try {
    execFileSync("node", [COMANDO, "consegna gratis", "--repo", vuota, "--attese", "7"], { encoding: "utf8", stdio: "pipe" });
  } catch (e) { uscita = e.status; }
  rmSync(vuota, { recursive: true, force: true });
  assert.equal(uscita, 3, "zero posti dove non ho guardato non e' un verde: e' un ⚪, e si dichiara");
});

prova("una frase lunga non fa esplodere il tempo", () => {
  // Misurato prima del fix su un file da 1,3 KB: 11 parole 4,33 s, 13 parole appesa oltre 30 s.
  // Un cancello che non torna piu' e' peggio di un cancello rosso.
  const grosso = mkdtempSync(join(tmpdir(), "spazzata-lunga-"));
  mkdirSync(join(grosso, "lib"), { recursive: true });
  writeFileSync(join(grosso, "lib", "tanto.ts"), "pane di grano duro ".repeat(400));
  const partito = Date.now();
  const esito = spazza(grosso, "pane di grano duro lievitato ventiquattro ore con crosta spessa e mollica");
  const durata = Date.now() - partito;
  rmSync(grosso, { recursive: true, force: true });
  assert.equal(esito.posti.length, 0, "la frase lunga non c'e' in quel file");
  assert.ok(durata < 2000, `ci ha messo ${durata} ms: con l'espressione regolare vecchia non tornava piu'`);
});

prova("con --attese, una cartella che non ho potuto leggere ferma il conto", () => {
  // Trovato dalla revisione: bastava che UNA delle quattro cartelle si leggesse per dire verde,
  // anche senza aver guardato il resto del sito. Un conto parziale spacciato per completo e' la
  // stessa bugia dello zero che non e' uno zero.
  const parziale = mkdtempSync(join(tmpdir(), "spazzata-parziale-"));
  mkdirSync(join(parziale, "app"), { recursive: true });
  writeFileSync(join(parziale, "app", "x.ts"), "consegna gratuita sopra i 30 euro");
  let uscita = 0;
  try {
    execFileSync("node", [COMANDO, "consegna gratuita sopra i 30 euro", "--repo", parziale, "--attese", "1"], { encoding: "utf8", stdio: "pipe" });
  } catch (e) { uscita = e.status; }
  rmSync(parziale, { recursive: true, force: true });
  assert.equal(uscita, 3, "tre cartelle su quattro non lette: il conto non vale, e va detto");
});

prova("un commento del JSX non e' una promessa fatta al cliente", () => {
  const conCommento = mkdtempSync(join(tmpdir(), "spazzata-jsx-"));
  for (const c of ["app", "components", "lib", "messages"]) mkdirSync(join(conCommento, c), { recursive: true });
  writeFileSync(join(conCommento, "components", "X.tsx"), "export const X = () => (\n  <div>\n    {/* consegna gratuita sopra i 30 euro: tolta il 3/9 */}\n  </div>\n);\n");
  const esito = spazza(conCommento, "consegna gratuita sopra i 30 euro");
  rmSync(conCommento, { recursive: true, force: true });
  assert.equal(esito.posti.length, 0, "quella riga l'utente non la legge: sta in un commento");
  assert.equal(esito.nei_commenti.length, 1, "ma va detto lo stesso, non nascosto");
});

prova("un --attese che non e' un numero non diventa un verde", () => {
  let uscita = 0;
  try {
    execFileSync("node", [COMANDO, "consegna gratis", "--repo", radice, "--attese", "due"], { encoding: "utf8", stdio: "pipe" });
  } catch (e) { uscita = e.status; }
  assert.equal(uscita, 3, "NaN non e' mai maggiore di niente: il conto non poteva piu' diventare rosso");
});

rmSync(radice, { recursive: true, force: true });

// ── I tre pezzi del contratto che nessuno guardava (AR-896) ────────────────
//
// Il revisore ha rotto il comando in tre modi restando 7 verdi su 7: tolto `.json` dalle
// estensioni, tolta la cartella `messages/`, e trasformato l'uscita 3 in uscita 0. Una prova che
// non vede rompere il contratto misura la compilazione, non la difesa.

prova("cerca anche dentro i file di testo delle traduzioni", () => {
  const conJson = mkdtempSync(join(tmpdir(), "spazzata-json-"));
  for (const c of ["app", "components", "lib", "messages"]) mkdirSync(join(conJson, c), { recursive: true });
  writeFileSync(join(conJson, "messages", "it.json"), '{"promessa":"consegna gratuita sopra i 30 euro"}');
  const esito = spazza(conJson, "consegna gratuita sopra i 30 euro");
  rmSync(conJson, { recursive: true, force: true });
  assert.equal(esito.posti.length, 1, "le frasi promesse vivono anche nei file delle traduzioni: se non li leggo, ne trovo meno del vero");
});

prova("la cartella delle traduzioni e' fra quelle da spazzare", () => {
  const testo = readFileSync(COMANDO, "utf8");
  const elenco = /const CARTELLE = \[([^\]]*)\]/.exec(testo)?.[1] ?? "";
  for (const attesa of ["app", "components", "lib", "messages"]) {
    assert.match(elenco, new RegExp(`['"]${attesa}['"]`), `senza ${attesa} la spazzata guarda meno sito di quanto dichiara`);
  }
});

prova("una cartella che c'e' ma non si apre non firma il verde", () => {
  // Trovato dal secondo giro di revisione: `cartelle_lette` cresceva PRIMA di provare ad aprire,
  // quindi il conto diceva «letti 3 file in 4 cartelle su 4» avendone guardate tre.
  // Il caso si costruisce con qualcosa che c'e' e non e' una cartella: i permessi non servono
  // (qui si gira da amministratore, e a lui non li nega nessuno).
  const chiusa = mkdtempSync(join(tmpdir(), "spazzata-chiusa-"));
  for (const c of ["app", "components", "lib"]) mkdirSync(join(chiusa, c), { recursive: true });
  writeFileSync(join(chiusa, "messages"), "non sono una cartella");
  writeFileSync(join(chiusa, "app", "x.ts"), "consegna gratuita sopra i 30 euro");
  const esito = spazza(chiusa, "consegna gratuita sopra i 30 euro");
  rmSync(chiusa, { recursive: true, force: true });
  assert.equal(esito.cartelle_lette, 3, `dice di aver letto ${esito.cartelle_lette} cartelle: quella chiusa non l'ha aperta`);
  assert.ok(esito.mancanti.some((m) => m.startsWith("messages")), "e deve dire quale non ha potuto aprire");
});

prova("un collegamento non fa contare due volte lo stesso posto", () => {
  // Le due difese sui collegamenti simbolici non avevano un solo caso di prova: la parola
  // «symlink» non compariva nel banco. Senza un freno, la prossima riscrittura le porta via.
  const conLink = mkdtempSync(join(tmpdir(), "spazzata-link-"));
  for (const c of ["app", "components", "lib", "messages"]) mkdirSync(join(conLink, c), { recursive: true });
  const fuori = mkdtempSync(join(tmpdir(), "spazzata-fuori-"));
  writeFileSync(join(fuori, "segreto.ts"), "consegna gratuita sopra i 30 euro");
  writeFileSync(join(conLink, "app", "vero.ts"), "consegna gratuita sopra i 30 euro");
  symlinkSync(fuori, join(conLink, "components", "scorciatoia"));
  const esito = spazza(conLink, "consegna gratuita sopra i 30 euro");
  const daFuori = esito.posti.filter((p) => p.file.includes("scorciatoia"));
  rmSync(conLink, { recursive: true, force: true });
  rmSync(fuori, { recursive: true, force: true });
  assert.equal(daFuori.length, 0, "un collegamento fa leggere file fuori dal repo con un percorso che sembra interno");
  assert.equal(esito.posti.length, 1, `il posto vero e' uno: contati ${esito.posti.length}`);
});

prova("un repo che non esiste non e' «zero posti»", () => {
  let uscita = 0;
  try {
    execFileSync("node", [COMANDO, "consegna gratis", "--repo", join(tmpdir(), "questo-repo-non-esiste-" + Date.now())], { encoding: "utf8", stdio: "pipe" });
  } catch (e) { uscita = e.status; }
  assert.equal(uscita, 3, "puntare a un posto che non c'e' e uscire 0 vuol dire dire «non c'e' la frase» senza aver aperto niente");
});

prova("«non ho potuto misurare» ha un'uscita sua, diversa dal verde", () => {
  const testo = readFileSync(COMANDO, "utf8");
  assert.match(testo, /process\.exit\(3\)/, "l'uscita 3 e' quella che dice «non ho potuto guardare»: se sparisce, un ⚪ diventa un verde");
  assert.match(testo, /process\.exit\(rosso \? 2 : 0\)/, "l'uscita 2 e' quella del conto che non torna");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
