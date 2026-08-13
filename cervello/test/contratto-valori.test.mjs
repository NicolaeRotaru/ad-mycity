#!/usr/bin/env node
// AR-577 · AR-579 — la prova che il contratto guarda anche i VALORI, non solo i nomi dei campi.
//
// Il caso che ha rotto, e che va tenuto in mente leggendo questo file: il registro della realtà —
// la difesa nata dopo i negozi inventati — aveva 7 entità su 27 con uno stato che il contratto
// vieta per iscritto. Sei erano i ristoranti che Nicola aveva escluso il 18/7 («i ristoranti non
// sono il nostro target»), scritti `escluso`. Il cancello di allocazione conosceva `demo` ma non
// `escluso`: quei sei rientravano nel conteggio dei negozi candidabili a ogni giro.
//
// Nessun cancello protestava, perché `valida-contratti.mjs` controllava che i CAMPI si chiamassero
// come deve, mai che i VALORI fossero fra quelli ammessi. Un nome sbagliato spegne una schermata e
// si vede; un valore sbagliato esce dai filtri e non si vede — ed è per questo che è durato.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const AC = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
const { valoriFuoriContratto, CONTRATTO } = await import(join(REPO, "cervello/valida-contratti.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};
const leggi = (f) => JSON.parse(readFileSync(join(AC, f), "utf8"));
const regoleDi = (f) => {
  const r = CONTRATTO[f]?.valori;
  assert.ok(Array.isArray(r) && r.length, `${f} non ha più un contratto sui valori: il controllo è stato tolto`);
  return r;
};

// ─────────────── ① i file veri della memoria rispettano il contratto ───────────────

prova("AR-577: nel registro della realtà nessuna entità porta uno stato inventato", () => {
  const problemi = valoriFuoriContratto(leggi("registro-realta.json"), regoleDi("registro-realta.json"));
  assert.deepEqual(problemi, [], problemi.join("\n"));
});

prova("AR-577: i sei ristoranti esclusi da Nicola NON tornano nel conteggio dei negozi candidabili", () => {
  // La conseguenza, non la forma: è questo che il difetto costava davvero. `allocazione-check.mjs`
  // filtra per stato; se un giorno tornasse a conoscere solo `["demo","scartato"]` e qualcuno
  // riscrivesse `escluso`, questa riga diventerebbe rossa prima del prossimo giro.
  const registro = leggi("registro-realta.json");
  const ESCLUSI = new Set(["scartato", "demo", "escluso"]);
  const candidabili = registro.entita.filter((e) => e.tipo === "negozio" && !ESCLUSI.has(e.stato));
  const ristoranti = ["Tigellabella", "Trattoria La Forchetta", "Le Tre Ganasce da Andrea",
    "Osteria Carducci", "La Dispensa de i Balocchi", "Trattoria dei Pescatori"];
  for (const nome of ristoranti) {
    const e = registro.entita.find((x) => x.nome === nome);
    assert.ok(e, `${nome} è sparito dal registro: la decisione di Nicola del 18/7 non è più a verbale`);
    assert.equal(e.stato, "scartato", `${nome} è tornato a uno stato che il filtro non conosce`);
    assert.ok(!candidabili.some((c) => c.nome === nome), `${nome} rientra fra i negozi candidabili`);
  }
  assert.ok(!candidabili.some((c) => c.nome === "Casa Linda"), "il negozio demo rientra fra i candidabili");
  // E il perché di ognuno resta leggibile: una migrazione che cancella la motivazione è una perdita.
  for (const nome of ristoranti) {
    assert.match(leggi("registro-realta.json").entita.find((x) => x.nome === nome).note,
      /non sono il nostro target/, `${nome}: la ragione dell'esclusione è andata persa nella migrazione`);
  }
});

prova("AR-579: la serie storica e la radiografia usano solo tipi di visita dichiarati", () => {
  for (const f of ["storico-salute.json", "auto-radiografia.json"]) {
    const problemi = valoriFuoriContratto(leggi(f), regoleDi(f));
    assert.deepEqual(problemi, [], `${f}: ${problemi.join("\n")}`);
  }
});

prova("AR-579: i tipi ammessi sono quelli che i programmi SCRIVONO davvero", () => {
  // Il contratto era più stretto della realtà: ammetteva due valori mentre tre programmi ne
  // scrivevano quattro. Allargarlo senza agganciarlo a chi scrive lo farebbe ri-divergere al
  // prossimo programma; questa prova tiene insieme i due elenchi.
  const scritti = {
    "storico-salute.json": [
      ["cervello/auto-fix.mjs", "auto-fix"],
      ["cervello/sonda-volano.mjs", "sonda"],
      ["cervello/sonda-volano.mjs", "completa"],
    ],
    "auto-radiografia.json": [["cervello/foto-radiografia.mjs", "radiografia-totale"]],
  };
  for (const [file, righe] of Object.entries(scritti)) {
    const ammessi = regoleDi(file)[0].ammessi;
    for (const [sorgente, valore] of righe) {
      const testo = readFileSync(join(REPO, sorgente), "utf8");
      assert.match(testo, new RegExp(`tipo:\\s*["']${valore}["']`),
        `${sorgente} non scrive più tipo "${valore}": il contratto di ${file} è più largo del necessario`);
      assert.ok(ammessi.includes(valore),
        `${sorgente} scrive tipo "${valore}" ma il contratto di ${file} non lo ammette (${ammessi.join(", ")})`);
    }
  }
});

// ─────────────── ② il controllo diventa rosso su un valore inventato ───────────────

prova("un valore inventato dentro una lista viene accusato, con nome e posizione", () => {
  const regole = [{ campo: "entita[].stato", ammessi: ["confermato", "scartato"], perche: "il filtro non lo conosce" }];
  const problemi = valoriFuoriContratto(
    { entita: [{ nome: "Buono", stato: "confermato" }, { nome: "Tigellabella", stato: "escluso" }] }, regole);
  assert.equal(problemi.length, 1);
  assert.match(problemi[0], /Tigellabella/, "il messaggio non dice QUALE entità: inutile per ripararla");
  assert.match(problemi[0], /escluso/);
});

prova("un valore inventato in cima al file viene accusato", () => {
  const regole = [{ campo: "tipo", ammessi: ["completa", "sonda"], perche: "x" }];
  assert.equal(valoriFuoriContratto({ tipo: "radiografia-totale" }, regole).length, 1);
  assert.equal(valoriFuoriContratto({ tipo: "sonda" }, regole).length, 0);
});

prova("un campo assente NON viene accusato: la sua assenza la dice `obbligatori`", () => {
  // Due controlli che accusano lo stesso problema producono due righe per un errore solo, e il
  // secondo si impara a scorrere.
  const regole = [{ campo: "tipo", ammessi: ["completa"], perche: "x" }];
  assert.deepEqual(valoriFuoriContratto({}, regole), []);
  assert.deepEqual(valoriFuoriContratto({ entita: [{ nome: "x" }] },
    [{ campo: "entita[].stato", ammessi: ["confermato"], perche: "x" }]), []);
});

prova("senza regole, o con una lista che non è una lista, non inventa problemi", () => {
  assert.deepEqual(valoriFuoriContratto({ entita: "non una lista" },
    [{ campo: "entita[].stato", ammessi: ["confermato"], perche: "x" }]), []);
  assert.deepEqual(valoriFuoriContratto({ tipo: "x" }, undefined), []);
});

prova("il contratto sui valori è agganciato al validatore, non solo dichiarato", () => {
  // La domanda ④ del secondo giro: il codice che ho aggiunto è USATO? Un contratto dichiarato e mai
  // chiamato somiglia moltissimo a una difesa attiva.
  const testo = readFileSync(join(REPO, "cervello/valida-contratti.mjs"), "utf8");
  assert.match(testo, /problemi\.push\(\.\.\.valoriFuoriContratto\(dati, regola\.valori\)\)/,
    "valoriFuoriContratto non è più chiamato dentro valida(): il contratto sui valori è codice morto");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
