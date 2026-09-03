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
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fuoriDalBudget } from "../non-vacuita.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const banco = (args) => {
  const r = spawnSync(process.execPath, [join(REPO, "cervello/non-vacuita.mjs"), ...args], { cwd: REPO, encoding: "utf8", timeout: 300_000, killSignal: "SIGKILL" });
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
  const r = banco(["--difetti", "AR-915,AR-916", "--budget", "1000"]);
  assert.equal(r.codice, 2, `⚪ è 2: non ho misurato. Rosso (1) direbbe «la difesa non regge», ucciso (124) non direbbe niente.\n${r.testo.slice(-400)}`);
  assert.match(r.testo, /budget di 1 s è finito/, "e deve dire che è stato il tempo");
  assert.match(r.testo, /AR-915/, "nominando le mutazioni rimaste fuori, una per una");
  assert.match(r.testo, /AR-916/);
});

test("il difetto opposto: col tempo che basta il banco MISURA, e il verde resta un verde", () => {
  const r = banco(["--difetti", "AR-916", "--budget", "300000"]);
  assert.equal(r.codice, 0, `con tempo a sufficienza nessun ⚪ inventato:\n${r.testo.slice(-400)}`);
  assert.match(r.testo, /rendono rosso il loro test/);
});
