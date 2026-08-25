// 🩻 LA PROVA DELLA «RADIOGRAFIA MENTRE RIPARI» — il perimetro toccato si riguarda DOPO averlo
// toccato, e una copertura vecchia non vale come copertura.
//
// IL CASO VERO CHE RICOSTRUISCE (R1). Nicola, 25/8/2026: entro il 29 la macchina e il sito devono
// essere senza difetti, e la sua domanda è quella giusta — *«se faccio un'altra radiografia
// separata, saltano fuori altri problemi?»*. Fino a oggi la risposta era sì per costruzione, e la
// macchina lo scriveva da sé in `radiografia-marketplace.json` (`sync_scan.nota`): «per trovare
// difetti NUOVI serve un nuovo audit; i fix sul codice non riaprono da soli la lista». Con
// `nascita-difetti.mjs` che conta 99 schede su 787 nate DAL riparare, il lotto che chiude difetti è
// anche il posto dove ne nascono — e nessuno riguardava ciò che il lotto aveva appena toccato.
//
// COSA PROVANO I CASI. R1 è il difetto vero. N1…N8 sono i modi in cui questo freno può diventare
// verde senza aver protetto niente: sono le scorciatoie del catalogo (cervello/scorciatoie-note.md)
// applicate a lui, e ognuna DEVE restare rossa.
//
// La prova di non-vacuità sta in cervello/mutanti.json: si toglie la riga che lo mette di guardia
// dentro cancello-lotto.mjs, e il caso N8 diventa rosso. Il difetto è AR-818 (nato come AR-813: il numero l'aveva già preso l'altro ramo, e chi unisce per secondo rinumera); i due nati riparandolo
// sono AR-814 e AR-815.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const M = await import(join(QUI, "..", "radiografia-in-corsa.mjs"));

const MAPPA_FINTA = {
  case: {
    macchina: { fonti: ["finto/workflow.js"], dimensioni: ["cadenza-esecuzione", "rischio-sicurezza-se"] },
  },
  fuori_perimetro: [{ repo: "ad", prefisso: "MyCity-Vault/", perche: "memoria" }],
  regole: [
    { repo: "ad", prefisso: "cervello/", suffissi: [".sh"], casa: "macchina", dimensione: "cadenza-esecuzione" },
    { repo: "ad", prefisso: "cervello/", suffissi: [".mjs"], casa: "macchina", dimensione: "rischio-sicurezza-se" },
  ],
};

const scansione = (dimensione, file, quando = "2026-08-25 10:00") => ({
  quando,
  casa: "macchina",
  dimensione,
  modo: "ad",
  trovati: 0,
  schede: [],
  file,
});

test("R1 — un file toccato e mai riguardato è SCOPERTO, e il cancello si ferma", () => {
  const per = M.perimetroDaControllare(MAPPA_FINTA, { repo: "ad", file: ["cervello/uno.mjs"] });
  assert.equal(per.richiesti.length, 1);
  const cop = M.copertura({ richiesti: per.richiesti, scansioni: [], improntaDi: () => "aaaaaaaaaaaa" });
  assert.equal(cop.scoperti.length, 1);
  const v = M.verdetto({ perimetro: per, cop });
  assert.equal(v.codice, 1);
  assert.match(v.righe.join("\n"), /radiografia separata/);
});

test("N1 — guardato PRIMA e ritoccato DOPO non è coperto: è stantio (è il difetto vero, non un dettaglio)", () => {
  const per = M.perimetroDaControllare(MAPPA_FINTA, { repo: "ad", file: ["cervello/uno.mjs"] });
  const vecchia = scansione("rischio-sicurezza-se", { "cervello/uno.mjs": "111111111111" });
  const cop = M.copertura({ richiesti: per.richiesti, scansioni: [vecchia], improntaDi: () => "222222222222" });
  assert.equal(cop.coperti.length, 0);
  assert.equal(cop.stantii.length, 1);
  assert.equal(M.verdetto({ perimetro: per, cop }).codice, 1);

  // …e con l'impronta di ADESSO la stessa scansione copre: senza questo caso il freno potrebbe
  // essere rosso sempre, che è il cancello che si impara ad aggirare.
  const fresca = scansione("rischio-sicurezza-se", { "cervello/uno.mjs": "222222222222" });
  const cop2 = M.copertura({ richiesti: per.richiesti, scansioni: [fresca], improntaDi: () => "222222222222" });
  assert.equal(cop2.coperti.length, 1);
  assert.equal(M.verdetto({ perimetro: per, cop: cop2 }).codice, 0);
});

test("N2 — una scansione registrata sotto un'ALTRA lente non compra il verde", () => {
  const per = M.perimetroDaControllare(MAPPA_FINTA, { repo: "ad", file: ["cervello/uno.mjs"] });
  const altra = scansione("cadenza-esecuzione", { "cervello/uno.mjs": "222222222222" });
  const cop = M.copertura({ richiesti: per.richiesti, scansioni: [altra], improntaDi: () => "222222222222" });
  assert.equal(cop.scoperti.length, 1);
});

test("N3 — «niente da riguardare» non si scrive come ✅: è un ⚪ dichiarato", () => {
  const per = M.perimetroDaControllare(MAPPA_FINTA, { repo: "ad", file: ["MyCity-Vault/90-Memoria-AI/STATO.md"] });
  assert.equal(per.richiesti.length, 0);
  assert.equal(per.fuori.length, 1);
  const v = M.verdetto({ perimetro: per, cop: M.copertura({ richiesti: [], scansioni: [], improntaDi: () => null }) });
  assert.equal(v.codice, 0);
  const testo = v.righe.join("\n");
  assert.match(testo, /non applicabile/);
  assert.ok(!testo.includes("✅"), "un perimetro vuoto non deve stampare una spunta verde");
});

test("N4 — la mappa che diverge dai workflow è una violazione, non un avviso", () => {
  const fonti = { "finto/workflow.js": "const D=[{ key: 'cadenza-esecuzione' },{ key: 'rischio-sicurezza-se' },{ key: 'dimensione-nuova' }]" };
  const vm = M.verificaMappa(MAPPA_FINTA, fonti);
  assert.equal(vm.ok, false);
  assert.match(vm.problemi.join("\n"), /dimensione-nuova/);

  const allineata = { "finto/workflow.js": "const D=[{ key: 'cadenza-esecuzione' },{ key: 'rischio-sicurezza-se' }]" };
  assert.equal(M.verificaMappa(MAPPA_FINTA, allineata).ok, true);
});

test("N5 — un workflow illeggibile è ⚪, mai un verde: non ho confrontato niente", () => {
  const vm = M.verificaMappa(MAPPA_FINTA, { "finto/workflow.js": null });
  assert.equal(vm.ok, false);
  assert.equal(vm.cieco, true);
});

test("N6 — un file che non si legge non conta come coperto, e il verdetto lo dichiara", () => {
  const per = M.perimetroDaControllare(MAPPA_FINTA, { repo: "ad", file: ["cervello/uno.mjs"] });
  const cop = M.copertura({ richiesti: per.richiesti, scansioni: [], improntaDi: () => null });
  assert.equal(cop.illeggibili.length, 1);
  assert.equal(cop.scoperti.length, 0);
  const v = M.verdetto({ perimetro: per, cop });
  assert.equal(v.codice, 2);
});

test("N7 — l'ordine delle regole decide, e il fuori-perimetro vince su tutte", () => {
  assert.deepEqual(M.regolaPerFile(MAPPA_FINTA, { repo: "ad", percorso: "cervello/giro.sh" }), { casa: "macchina", dimensione: "cadenza-esecuzione" });
  assert.deepEqual(M.regolaPerFile(MAPPA_FINTA, { repo: "ad", percorso: "cervello/uno.mjs" }), { casa: "macchina", dimensione: "rischio-sicurezza-se" });
  assert.equal(M.regolaPerFile(MAPPA_FINTA, { repo: "ad", percorso: "cervello/dati.json" }), null);
  assert.equal(M.regolaPerFile(MAPPA_FINTA, { repo: "ad", percorso: "MyCity-Vault/x.md" }), null);
  // le regole di un repo non si applicano all'altro: un `app/` del sito non è un `app/` di casa
  assert.equal(M.regolaPerFile(MAPPA_FINTA, { repo: "marketplace", percorso: "cervello/uno.mjs" }), null);
});

test("N8 — il freno è CABLATO nel cancello del lotto, non è uno strumento sullo scaffale", () => {
  const cancello = readFileSync(join(REPO, "cervello", "cancello-lotto.mjs"), "utf8");
  const righe = cancello.split("\n").filter((r) => !r.trim().startsWith("//"));
  const cablato = righe.some((r) => r.includes("esegui(") && r.includes("radiografia-in-corsa.mjs"));
  assert.ok(cablato, "cancello-lotto.mjs deve ESEGUIRE cervello/radiografia-in-corsa.mjs: nominarlo in un commento non ferma niente");
});

test("N9 — la mappa vera di casa regge il suo stesso metro: allineata ai workflow, e nessuna lente cieca", () => {
  const mappa = JSON.parse(readFileSync(join(REPO, "cervello", "dimensioni-radiografia.json"), "utf8"));
  const fonti = {};
  for (const casa of Object.values(mappa.case)) {
    for (const f of casa.fonti) fonti[f] = readFileSync(join(REPO, f), "utf8");
  }
  assert.deepEqual(M.verificaMappa(mappa, fonti).problemi, []);
});

test("N10 — una lente senza file e senza motivo è una violazione (il perimetro invisibile per costruzione)", () => {
  const zoppa = {
    case: { macchina: { fonti: ["finto/w.js"], dimensioni: ["cadenza-esecuzione", "lente-muta"] } },
    fuori_perimetro: [],
    senza_perimetro: {},
    regole: [{ repo: "ad", prefisso: "cervello/", casa: "macchina", dimensione: "cadenza-esecuzione" }],
  };
  const fonti = { "finto/w.js": "[{ key: 'cadenza-esecuzione' },{ key: 'lente-muta' }]" };
  const vm = M.verificaMappa(zoppa, fonti);
  assert.equal(vm.ok, false);
  assert.match(vm.problemi.join("\n"), /lente-muta/);

  // …e dichiararla col perché la rende legittima: un buco DICHIARATO non è un buco nascosto.
  zoppa.senza_perimetro = { "macchina/lente-muta": "giudica i registri, non i file" };
  assert.equal(M.verificaMappa(zoppa, fonti).ok, true);

  // ma una dichiarazione vuota non compra il verde
  zoppa.senza_perimetro = { "macchina/lente-muta": "   " };
  assert.equal(M.verificaMappa(zoppa, fonti).ok, false);
});

// ── I DUE CASI NATI DALLA PRIMA ESECUZIONE VERA DI QUESTO FRENO (AR-814, AR-815). Riguardando il
// proprio perimetro con la lente `rischio-sicurezza-se`, prima di consegnare, il freno ha trovato
// due difetti dentro sé stesso. Sono qui perché non tornino.
//
// Tutti e due si fermano PRIMA di scrivere in memoria: il comando esce con un rifiuto, quindi il
// banco non tocca il registro vero.

function girRegistra(...argomenti) {
  return spawnSync("node", ["cervello/radiografia-in-corsa.mjs", ...argomenti], { cwd: REPO, encoding: "utf8" });
}

test("N11 — «registra» si riconosce anche con un flag davanti (senza, la scansione non veniva scritta e nessuno lo diceva)", () => {
  const r = girRegistra("--json", "registra", "--trovati", "0");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /serve --dimensione/, "col flag davanti il comando deve entrare nel ramo REGISTRA, non in quello del controllo");
});

test("N12 — un percorso che esce dal repo non entra nel registro, nemmeno se comincia con un prefisso ammesso", () => {
  const r = girRegistra("registra", "--dimensione", "rischio-sicurezza-se", "--file", "cervello/../../etc/hosts", "--trovati", "0");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /percorsi non ammessi/);
});

test("N13 — «ho trovato 2 cose» senza dire quali non si registra: quello che hai visto si scrive", () => {
  const r = girRegistra("registra", "--dimensione", "rischio-sicurezza-se", "--file", "cervello/radiografia-in-corsa.mjs", "--trovati", "2");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /2 cose trovate e 0 schede/);
});

test("N14 — una scansione di ZERO file è un ⚪, non un verde: il verde muto non passa nemmeno qui", () => {
  const r = girRegistra("registra", "--dimensione", "rischio-sicurezza-se", "--file", "", "--trovati", "0");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /zero file/);
});

test("N15 — un file CANCELLATO dal lotto non si radiografa: non si chiede di riguardare ciò che non c'è (AR-816)", () => {
  const { vivi, spariti } = M.dividiSpariti(["cervello/uno.mjs", "cervello/sparito.mjs"], (f) => (f.includes("sparito") ? null : "aaaaaaaaaaaa"));
  assert.deepEqual(spariti, ["cervello/sparito.mjs"]);
  assert.deepEqual(vivi, ["cervello/uno.mjs"]);
});
