#!/usr/bin/env node
// AR-344 — migrare una prova alla forma MIGLIORE la faceva contare come assente.
//
// I cinque perché, dalla scheda: il conteggio dei non-auto-chiudibili era salito da 24 a 38 senza
// che nessuno peggiorasse niente. Erano 13 difetti del lotto 29 la cui `verifica` era stata migrata
// da {file,pattern} a {comando} — la forma che lo standard ORA impone. `classifica()` decideva con
// `if (!v || !v.file || !v.pattern)`, quindi tutto ciò che non era file+pattern cadeva in «umana».
//
// Radice: la forma della prova era conoscenza DUPLICATA in due lettori indipendenti — chi chiude
// (auto-fix) aveva imparato {comando}, chi classifica no. Effetto perverso: più si riparava secondo
// lo standard, più la macchina dichiarava di non potersi chiudere da sola.
//
// La cura non è insegnare la forma anche al secondo lettore: è che il lettore sia UNO.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { readFileSync } from "node:fs";

const REPO = join(import.meta.dirname, "..", "..");
const { classifica } = await import(join(REPO, "cervello/cantiere-prove.mjs"));
const { formaProva } = await import(join(REPO, "cervello/chiusura-dichiarata.mjs"));

const conComando = {
  id: "AR-000",
  gravita: "grave",
  nato: "2026-07-01",
  titolo: "finto",
  verifica: { comando: "node cervello/test/prova-migliore-contata-come-assente.test.mjs" },
};

test("il caso che ha rotto: una prova {comando} NON è «umana»", () => {
  const c = classifica(conComando);
  assert.notEqual(c.classe, "umana", "una prova che si esegue non può contare come «nessun guardiano potrà mai chiuderlo»");
  assert.equal(c.classe, "auto-comando");
  assert.equal(c.auto_chiudibile, true, "un guardiano PUÒ chiuderlo: è esattamente ciò che il conteggio negava");
});

test("una prova a pattern resta classificata come prima: il fix non è un giro di vite generico", () => {
  const c = classifica({
    id: "AR-001",
    gravita: "medio",
    nato: "2026-07-01",
    titolo: "finto",
    verifica: { file: "cervello/cantiere-prove.mjs", pattern: "classifica", presente: true },
  });
  assert.equal(c.classe, "auto-ok", "file+pattern che combaciano ora: comportamento invariato");
});

test("senza verifica resta «umana»: quello è il caso vero", () => {
  // 27/8 · AR-848 — la gravità di prova era `grave`, e da oggi la grave obbliga alla prova che
  // esegue: una scheda grave SENZA verifica esce «prova-debole-su-grave», ed è giusto — «non ho
  // dichiarato niente» non è «ho dichiarato che serve un umano», che è la confusione curata
  // nell'altro verso nello stesso lotto. Il caso che questo test vuole misurare — la forma
  // dell'assenza — si misura su una gravità che non obbliga.
  assert.equal(classifica({ id: "AR-002", gravita: "minore", nato: "2026-07-01", titolo: "x" }).classe, "umana");
  const grave = classifica({ id: "AR-002b", gravita: "grave", nato: "2026-07-01", titolo: "x" });
  assert.equal(grave.classe, "prova-debole-su-grave", "su una grave l'assenza di prova è debolezza, non una dichiarazione");
  assert.equal(grave.auto_chiudibile, false);
});

test("un comando che punta a un file inesistente non passa per prova buona", () => {
  const c = classifica({
    id: "AR-003",
    gravita: "grave",
    nato: "2026-07-01",
    titolo: "finto",
    verifica: { comando: "node cervello/test/questo-file-non-esiste-mai.test.mjs" },
  });
  assert.equal(c.auto_chiudibile, false, "«non fatto» e «puntatore rotto» si distinguono solo guardando");
  assert.match(c.perche, /non esiste/);
});

test("un comando fuori dalle forme ammesse è sospetto, non auto-chiudibile", () => {
  // 27/8 · AR-848 — su una gravità che OBBLIGA vince la marca più pesante («prova debole su
  // grave»), come già succedeva ai bloccanti prima di oggi: non è un'incoerenza nuova, è quella di
  // sempre applicata a più schede. La diagnosi precisa non si perde — il motivo nomina il comando
  // per esteso — ma il caso qui sotto misura la CLASSE, quindi va su una gravità che non obbliga.
  const c = classifica({
    id: "AR-004",
    gravita: "minore",
    nato: "2026-07-01",
    titolo: "finto",
    verifica: { comando: "rm -rf /" },
  });
  assert.equal(c.auto_chiudibile, false);
  assert.equal(c.classe, "auto-sospetta");
});

// LA RADICE: un lettore solo. Se qualcuno riscrive la decisione a mano qui dentro, questa cade.
test("la forma della prova la legge UN modulo solo, non due lettori indipendenti", () => {
  const src = readFileSync(join(REPO, "cervello/cantiere-prove.mjs"), "utf8");
  assert.match(src, /import \{[^}]*formaProva[^}]*\} from "\.\/chiusura-dichiarata\.mjs"/);
  // Solo il CODICE: il commento che SPIEGA il difetto contiene la riga incriminata per forza, e un
  // test che non distingue i due misura la prosa invece di ciò che gira. (Sbagliato una volta qui.)
  const codice = src
    .split("\n")
    .filter((r) => !r.trim().startsWith("//") && !r.trim().startsWith("*"))
    .join("\n");
  assert.doesNotMatch(
    codice,
    /if \(!v \|\| !v\.file \|\| !v\.pattern\)/,
    "la decisione duplicata a mano è tornata: è la radice del difetto, non un dettaglio",
  );
  // ...e l'ALTRO lettore, auto-fix, non deve tenersi la sua copia: era la radice del difetto —
  // «la forma della prova e' conoscenza duplicata in due lettori indipendenti». Ripararne uno solo
  // significa lasciare la seconda copia libera di divergere al prossimo cambio di forma.
  const autofix = readFileSync(join(REPO, "cervello/auto-fix.mjs"), "utf8");
  const codiceAF = autofix
    .split("\n")
    .filter((r) => !r.trim().startsWith("//") && !r.trim().startsWith("*"))
    .join("\n");
  assert.match(codiceAF, /import \{[^}]*formaProva[^}]*\} from "\.\/chiusura-dichiarata\.mjs"/);
  assert.doesNotMatch(
    codiceAF,
    /if \(!v \|\| !v\.file \|\| !v\.pattern\)/,
    "auto-fix si e' ripreso la sua copia della decisione: i lettori sono tornati due",
  );

  // e i due lettori devono concordare su ogni forma
  for (const v of [{ comando: "node x.mjs" }, { file: "a", pattern: "b" }, undefined]) {
    assert.equal(typeof formaProva(v), "string");
  }
});

// Sui DATI VERI: nessuna scheda con prova eseguibile deve risultare non-auto-chiudibile.
test("sui dati veri: nessuna prova {comando} del cantiere è contata come «umana»", () => {
  const cantiere = JSON.parse(
    readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), "utf8"),
  );
  const conCmd = cantiere.difetti.filter((d) => d.stato === "aperto" && d.verifica && d.verifica.comando);
  for (const d of conCmd) {
    assert.notEqual(classifica(d).classe, "umana", `${d.id} ha una prova eseguibile e viene contato come non chiudibile`);
  }
});
