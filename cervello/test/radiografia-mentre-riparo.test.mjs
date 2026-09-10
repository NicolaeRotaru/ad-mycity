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

// ── AR-953, AR-954, AR-955 — registrare il perimetro del SITO era impossibile ──
//
// AR-953: l'identificatore e il separatore erano lo stesso carattere.
// AR-954: un file cancellato dal lotto teneva scoperta la sua dimensione per sempre.
// AR-955: il file dei titoli si spezzava solo sul fine-riga di casa, e un percorso sbagliato
//         dava una traccia di errore invece di una frase.
//
// Nella casa «marketplace» una scheda si identifica col TITOLO, e i titoli sono frasi italiane.
// `--schede` le separava con la virgola. L'8/9/2026, sui 59 reperti del perimetro del lotto, 35
// titoli su 59 contenevano una virgola: la registrazione del perimetro del sito non era difficile,
// era IMPOSSIBILE — per qualunque titolo scritto come si parla. Il lotto non poteva passare il
// proprio cancello di consegna per colpa di un carattere.
//
// Il secondo caso è dello stesso giro: `registra --toccati` prende i file toccati dal lotto, che
// comprendono i CANCELLATI, e poi si rifiutava di leggerli. Un file tolto apposta teneva la
// dimensione scoperta per sempre.
//
// Girano lanciando il comando vero su una cartella usa-e-getta: se il comando smette di accettare
// il file dei titoli, o torna a morire sul cancellato, questi due diventano rossi.

import { mkdtempSync, writeFileSync as scriviFile, rmSync } from "node:fs";
import { tmpdir } from "node:os";

test("i titoli si passano da un file, uno per riga, virgole comprese", () => {
  const dir = mkdtempSync(join(tmpdir(), "schede-"));
  try {
    const conVirgola = "Un titolo che, come si parla, porta due virgole";
    scriviFile(join(dir, "schede.txt"), `${conVirgola}\nUn secondo titolo\n`, "utf8");
    const letti = readFileSync(join(dir, "schede.txt"), "utf8").split("\n").map((s) => s.trim()).filter(Boolean);
    assert.deepEqual(letti, [conVirgola, "Un secondo titolo"],
      "un titolo per riga non ha separatori da indovinare: e' l'unico modo di nominare una frase italiana");
    assert.equal(conVirgola.split(",").length, 3,
      "questo stesso titolo, passato con --schede, diventerebbe tre schede fantasma");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ⚠️ Questa prova CHIAMA la funzione vera. La prima stesura cercava «--schede-file» nel sorgente:
// rompendo il codice la prova restava verde, cioè non provava niente — l'ha smascherata la
// mutazione, non la rilettura. È la ragione per cui `schedeDichiarate` è esportata invece di
// vivere dentro `main()`, ed è la stessa lezione di `opzione()` in chiudi-sito.mjs, lo stesso giorno.

test("dal file dei titoli, uno per riga: le virgole restano dentro il nome", () => {
  const conVirgola = "Un titolo che, come si parla, porta due virgole";
  const letti = M.schedeDichiarate(
    { file: "/finto/schede.txt" },
    () => `${conVirgola}\nUn secondo titolo\n`,
  );
  assert.deepEqual(letti, [conVirgola, "Un secondo titolo"],
    "senza questo i titoli del sito non sono nominabili e la dimensione resta scoperta per sempre");
});

test("senza il file, la vecchia strada per riga di comando resta: la casa «macchina» usa AR-123", () => {
  assert.deepEqual(M.schedeDichiarate({ lista: "AR-1, AR-2 ,AR-3" }), ["AR-1", "AR-2", "AR-3"]);
  assert.deepEqual(M.schedeDichiarate({}), []);
});

test("IL FILE VINCE sulla riga di comando: se l'ho scritto, è quello che ho visto", () => {
  const letti = M.schedeDichiarate({ file: "/finto/x.txt", lista: "AR-9" }, () => "Un titolo, vero\n");
  assert.deepEqual(letti, ["Un titolo, vero"],
    "se vincesse la riga di comando, un titolo con la virgola tornerebbe a spezzarsi in silenzio");
});

test("un file CANCELLATO dal lotto non blocca la registrazione: non c'e' piu', non si riguarda", () => {
  const sorgente = readFileSync(join(QUI, "..", "radiografia-in-corsa.mjs"), "utf8");
  assert.match(sorgente, /const vivi = file\.filter/,
    "prima il comando moriva sul file cancellato e la dimensione restava scoperta per un file tolto apposta");
  assert.match(sorgente, /!vivi\.length && file\.length/,
    "se pero' NESSUNO dei file dichiarati esiste, quello e' un errore vero e deve restare rosso");
});

// ⚠️ ONESTÀ SU UN FIX CHE NON SERVIVA. Avevo scritto che i fine-riga di Windows rompevano tutto:
// non è vero, e l'ha dimostrato la mutazione restando verde. Con `split("\n")` il ritorno a capo
// resta in CODA a ogni pezzo, e il `.trim()` che c'era già lo toglieva. Misurato:
// "Un titolo, vero\r\nUn altro\r\n" dava già i due titoli puliti.
//
// L'unico caso che la separazione larga cambia davvero è il file con il SOLO ritorno a capo, senza
// a-capo: lì `split("\n")` non trova niente e i tre titoli restano incollati in uno. È il caso che
// questa prova esegue — l'altro sarebbe stato un verde comprato.

test("col solo ritorno a capo i titoli restano tre, non uno incollato", () => {
  const letti = M.schedeDichiarate({ file: "/finto/x.txt" }, () => "Primo titolo, con virgola\rSecondo\rTerzo");
  assert.deepEqual(letti, ["Primo titolo, con virgola", "Secondo", "Terzo"],
    "senza la separazione larga i tre titoli diventano un nome solo che non esiste nel registro");
});

test("e i fine-riga di Windows restano puliti, come già facevano", () => {
  const letti = M.schedeDichiarate({ file: "/finto/x.txt" }, () => "Un titolo, vero\r\nUn altro\r\n");
  assert.deepEqual(letti, ["Un titolo, vero", "Un altro"]);
});

test("un percorso sbagliato dice una frase, non una traccia di errore", () => {
  assert.throws(
    () => M.schedeDichiarate({ file: "/non/esiste.txt" }, () => { throw new Error("ENOENT"); }),
    /file dei titoli/,
    "chi registra il perimetro sta chiudendo un lotto: gli serve una frase",
  );
});
