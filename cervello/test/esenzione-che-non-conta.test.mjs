#!/usr/bin/env node
// AR-334 — il registro delle malattie prometteva un modo per dichiarare un'istanza legittima, e il
// codice non lo implementava.
//
// `malattie.json` dice, nella sua stessa documentazione: «Se una istanza resta apposta, mettila in
// `esenti` con il PERCHÉ scritto». Ma `spazzata-fratelli.mjs` usava quelle voci **solo** per l'elenco
// dei file noti: non le sottraeva mai dal conteggio confrontato col tetto. Chi seguiva la via scritta
// restava rosso, e l'unica uscita era alzare la baseline — cioè il gesto che quel guardiano esiste
// per impedire («il tetto scende e basta»).
//
// Trovato il 28/7 sera usando lo strumento come dice la sua documentazione. E misurando è venuto
// fuori di peggio: `buco-letto-come-zero` aveva **due esenzioni per una sola istanza**, e una delle
// due scusava `soglia_giornaliera_token // 0`, che in `giro.sh` **non esiste più**. Un'esenzione
// slegata dalla realtà non è un permesso: è un residuo che nasconde il prossimo caso vero.
//
// Perciò le regole sono due, e servono tutte e due: un'esenzione vale solo con un perché scritto, e
// solo se nel suo file c'è ancora almeno un'istanza. L'orfana FALLISCE — toglierla è il lavoro.

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { pesaEsenzioni, verdettoMalattia } from "../spazzata-fratelli.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

const MOTIVO = "qui lo zero è la misura giusta, e il caso pericoloso è già coperto due righe sopra";
const trovati1 = [{ file: "a.sh", istanze: 1 }];

prova("il caso che ha rotto: un'esenzione dichiarata col perché viene SOTTRATTA", () => {
  const v = verdettoMalattia({ totale: 1, baseline: 0, trovati: trovati1, esenti: [{ file: "a.sh", quale: "x", perche: MOTIVO }] });
  assert.equal(v.esenti_valide, 1);
  assert.equal(v.scoperte, 0, "prima restava 1 e il guardiano era rosso pur seguendo la documentazione");
  assert.equal(v.guasta, false);
});

prova("senza l'esenzione lo stesso caso è rosso: la sottrazione non è un colabrodo", () => {
  const v = verdettoMalattia({ totale: 1, baseline: 0, trovati: trovati1, esenti: [] });
  assert.equal(v.scoperte, 1);
  assert.equal(v.cresciuta, true);
  assert.equal(v.guasta, true);
});

prova("un'esenzione ORFANA fallisce: scusa un'istanza che non c'è più", () => {
  // È il caso vero trovato stasera: l'esenzione parlava di `soglia_giornaliera_token // 0` in
  // giro.sh, e quel codice non esiste più. Ignorarla in silenzio la lascerebbe lì a coprire il
  // prossimo caso vero che comparirà in quel file.
  const v = verdettoMalattia({ totale: 1, baseline: 1, trovati: trovati1, esenti: [{ file: "sparito.sh", quale: "x", perche: MOTIVO }] });
  assert.equal(v.esenti_valide, 0, "non si sottrae niente per un file senza istanze");
  assert.equal(v.orfane.length, 1);
  assert.equal(v.guasta, true, "e non basta non contarla: deve far fallire, perché toglierla è il lavoro");
});

prova("due esenzioni per una sola istanza: la seconda è orfana", () => {
  // Lo stato reale del registro stasera. Senza questo controllo il conto sarebbe andato sotto zero.
  const v = verdettoMalattia({
    totale: 1, baseline: 0, trovati: trovati1,
    esenti: [{ file: "a.sh", quale: "x", perche: MOTIVO }, { file: "a.sh", quale: "y", perche: MOTIVO }],
  });
  assert.equal(v.esenti_valide, 1);
  assert.equal(v.scoperte, 0, "mai sotto zero");
  assert.equal(v.orfane.length, 1);
  assert.match(v.orfane[0]._motivo, /più esenzioni che istanze/);
});

prova("un'esenzione senza un perché vero non vale, e lo dice", () => {
  const v = verdettoMalattia({ totale: 1, baseline: 0, trovati: trovati1, esenti: [{ file: "a.sh", quale: "x", perche: "boh" }] });
  assert.equal(v.esenti_valide, 0, "due parole non sono un motivo");
  assert.equal(v.senza_motivo.length, 1);
  assert.equal(v.guasta, true);
});

prova("il tetto si confronta con le SCOPERTE, non col totale grezzo", () => {
  // Altrimenti dichiarare un'esenzione legittima renderebbe il tetto «gonfiato» per sempre: il
  // guardiano chiederebbe di abbassarlo a un numero che non può raggiungere.
  const v = verdettoMalattia({ totale: 5, baseline: 4, trovati: [{ file: "a.sh", istanze: 5 }], esenti: [{ file: "a.sh", quale: "x", perche: MOTIVO }] });
  assert.equal(v.scoperte, 4);
  assert.equal(v.cresciuta, false);
  assert.equal(v.tetto_gonfiato, false);
});

prova("un file NUOVO che si ammala fallisce comunque, esenzioni o no", () => {
  const v = verdettoMalattia({ totale: 2, baseline: 2, trovati: [{ file: "a.sh", istanze: 1 }, { file: "nuovo.sh", istanze: 1 }], esenti: [], fileNoti: ["a.sh"] });
  assert.equal(v.file_nuovi.length, 1);
  assert.equal(v.guasta, true);
});

prova("pesaEsenzioni separa le tre categorie senza confonderle", () => {
  const r = pesaEsenzioni(
    [{ file: "a.sh", perche: MOTIVO }, { file: "b.sh", perche: MOTIVO }, { file: "a.sh", perche: "no" }],
    [{ file: "a.sh", istanze: 2 }],
  );
  assert.equal(r.valide, 1);
  assert.equal(r.orfane.length, 1, "b.sh non ha istanze");
  assert.equal(r.senzaMotivo.length, 1);
});

// ── Il guardiano VERO ───────────────────────────────────────────────────────

prova("sul repo vero il guardiano è verde, e senza esenzioni orfane", () => {
  const r = spawnSync("node", [join(REPO, "cervello/spazzata-fratelli.mjs"), "--json"], { cwd: REPO, encoding: "utf8" });
  assert.equal(r.status, 0, `atteso verde:\n${r.stdout}${r.stderr}`);
  const j = JSON.parse(r.stdout);
  for (const m of j.malattie) {
    assert.equal((m.orfane || []).length, 0, `${m.id}: esenzioni orfane rimaste`);
    assert.equal((m.senza_motivo || []).length, 0, `${m.id}: esenzioni senza motivo`);
  }
});

prova("l'esenzione morta è stata TOLTA, non ignorata", () => {
  // `soglia_giornaliera_token` non esiste più in giro.sh: l'esenzione che lo scusava è un residuo, e
  // il lavoro era toglierla dal registro — non insegnare al guardiano a saltarla.
  const reg = readFileSync(join(REPO, "cervello/malattie.json"), "utf8");
  assert.doesNotMatch(reg, /soglia_giornaliera_token/, "l'esenzione morta è ancora nel registro");
  const giro = readFileSync(join(REPO, "cervello/giro.sh"), "utf8");
  assert.doesNotMatch(giro, /soglia_giornaliera_token/, "se il codice tornasse, l'esenzione andrebbe rivalutata, non ripristinata");
});

prova("il rapporto NON contraddice il verdetto", () => {
  // Con le esenzioni sottratte, il riepilogo diceva «+1 📈 PEGGIORATA» mentre il guardiano usciva 0.
  // Chi legge crede al rapporto, non al codice d'uscita.
  const r = spawnSync("node", [join(REPO, "cervello/spazzata-fratelli.mjs")], { cwd: REPO, encoding: "utf8" });
  assert.equal(r.status, 0);
  for (const bugia of [/PEGGIORATA/, /CRESCIUTA/, /TETTO GONFIATO/, /ESENZIONE ORFANA/]) {
    assert.doesNotMatch(r.stdout, bugia, `il guardiano esce 0 e il testo dice ${bugia}: chi legge crede al testo`);
  }
  assert.match(r.stdout, /esenti dichiarate → 0 scoperte/, "e deve mostrare il conto vero, non solo il totale grezzo");
});

prova("la documentazione del registro dice quello che il codice fa", () => {
  // Il difetto nasceva proprio da qui: la frase c'era, il comportamento no.
  const reg = JSON.parse(readFileSync(join(REPO, "cervello/malattie.json"), "utf8"));
  assert.match(reg._come_si_usa, /SOTTRAGGONO/, "va scritto che adesso si sottraggono davvero");
  assert.match(reg._come_si_usa, /orfana/, "e che un'esenzione orfana fa fallire");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
