// ⏳ IL BANCO CHE NON DICEVA CHI RESTAVA FUORI — AR-917.
//
// IL CASO CHE HA ROTTO, corsa 33807469256 del 3/9: il cancello dà al banco delle mutazioni 900
// secondi; il banco li spende TUTTI e viene ucciso — `exit 124`, cioè rosso. Un rosso lì dice «una
// difesa non regge», mentre la verità era «non ho fatto in tempo a provarle tutte». Due cose
// diverse, lette come una sola. E nella corsa prima, senza un orologio che mordesse, aveva girato
// sessantaquattro minuti senza finire lo stesso: più tempo non è la cura.
//
// La cura è quella già costruita per la prova delle due case: un budget che si guarda PRIMA di
// spendere, e chi resta fuori viene DICHIARATO uno per uno — ⚪, non rosso e non verde.
//
// ⚠️ 4/9 — PERCHÉ QUESTA PROVA ADESSO LAVORA SU UNA FINTA E NON SUL REPO VERO (AR-919).
// Nata ieri, chiedeva al banco di misurare le mutazioni VERE di AR-915 e AR-916: e per misurarle il
// banco ROMPE i file veri del repo, uno alla volta, rimettendoli a posto dopo. Ma la suite lancia i
// file su corsie parallele, e nella corsia accanto `mutazioni-orfane` legge quegli stessi file: se
// li guarda nell'istante rotto, vede una mutazione scollegata e diventa rossa. Misurato oggi
// lanciandole insieme due volte: un giro verde, il giro dopo rosso, senza toccare una riga in
// mezzo. Un rosso che va e viene è peggio di un rosso fermo, perché insegna a non fidarsi del
// verde. La finta prova la stessa identica cosa — il banco gira davvero, il budget morde davvero —
// senza mettere le mani su file che qualcun altro sta leggendo.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fuoriDalBudget } from "../non-vacuita.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Una casa finta con due mutazioni che mordono davvero: il bersaglio rotto fa fallire la prova. */
function finta() {
  const casa = mkdtempSync(join(tmpdir(), "banco-chi-resta-fuori-"));
  const bersaglio = join(casa, "bersaglio.mjs");
  writeFileSync(bersaglio, "export const VERO = 1;\n");
  const prova = join(casa, "prova.mjs");
  writeFileSync(prova, `import { VERO } from ${JSON.stringify(bersaglio)};\nif (VERO !== 1) { console.error("rotto"); process.exit(1); }\n`);
  writeFileSync(join(casa, "mutanti.json"), JSON.stringify({
    mutanti: [
      { difetto: "AR-915", nome: "la prima", file: bersaglio, cerca: "= 1", sostituisci: "= 2", test: prova },
      { difetto: "AR-916", nome: "la seconda", file: bersaglio, cerca: "= 1", sostituisci: "= 3", test: prova },
    ],
  }));
  return casa;
}

const banco = (casa, args) => {
  const r = spawnSync(process.execPath, [join(REPO, "cervello/non-vacuita.mjs"), ...args], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 300_000,
    killSignal: "SIGKILL",
    env: { ...process.env, MUTANTI_FILE: join(casa, "mutanti.json"), NON_VACUITA_RADICE: casa },
  });
  return { codice: r.status, testo: `${r.stdout || ""}${r.stderr || ""}` };
};

test("chi resta fuori è un ELENCO, non un numero: ogni mutazione dice di sé", () => {
  const restanti = [{ difetto: "AR-1", nome: "una" }, { difetto: "AR-2", nome: "due" }];
  const fuori = fuoriDalBudget(restanti, { budget: 840_000, speso: 830_000 });
  assert.equal(fuori.length, 2, "una voce per mutazione: «alcune» è il silenzio con una parola davanti");
  assert.ok(fuori.every((x) => x.verdetto === "cieco"), "e sono ⚪: non provate non vuol dire rotte");
  assert.match(fuori[0].perche, /AR-1/, "e ognuna dice come rilanciarla da sola");
  assert.match(fuori[0].perche, /840 s/, "col budget che l'ha lasciata fuori");
});

test("senza budget non si dichiara niente: chi lancia a mano non ha orologi esterni", () => {
  assert.deepEqual(fuoriDalBudget([{ difetto: "AR-1" }], { budget: 0, speso: 999 }), []);
});

test("IL CASO CHE HA ROTTO: il banco a corto di tempo esce ⚪ e NOMINA chi ha saltato", () => {
  const casa = finta();
  try {
    const r = banco(casa, ["--difetti", "AR-915,AR-916", "--budget", "1000"]);
    assert.equal(r.codice, 2, `⚪ è 2: non ho misurato. Rosso (1) direbbe «la difesa non regge», ucciso (124) non direbbe niente.\n${r.testo.slice(-400)}`);
    assert.match(r.testo, /budget di 1 s è finito/, "e deve dire che è stato il tempo");
    assert.match(r.testo, /AR-915/, "nominando le mutazioni rimaste fuori, una per una");
    assert.match(r.testo, /AR-916/);
  } finally {
    rmSync(casa, { recursive: true, force: true });
  }
});

test("il difetto opposto: col tempo che basta il banco MISURA, e il verde resta un verde", () => {
  const casa = finta();
  try {
    const r = banco(casa, ["--difetti", "AR-916", "--budget", "300000"]);
    assert.equal(r.codice, 0, `con tempo a sufficienza nessun ⚪ inventato:\n${r.testo.slice(-400)}`);
    assert.match(r.testo, /rendono rosso il loro test/);
  } finally {
    rmSync(casa, { recursive: true, force: true });
  }
});
