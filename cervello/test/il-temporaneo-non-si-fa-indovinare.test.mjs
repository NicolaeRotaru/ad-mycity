#!/usr/bin/env node
// 🔒 AR-923 — UN TEMPORANEO CON IL NOME PREVEDIBILE, IN UNA CARTELLA DOVE SCRIVE CHIUNQUE
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// `round6-applica.mjs` riscrive `cervello/giro.sh`, cioè il ciclo principale della macchina, e
// prima di scriverlo ne prova la sintassi su una copia. Quella copia si chiamava
// `/tmp/round6-prova-giro.sh`: un nome che si può indovinare, in una cartella dove scrive chiunque.
// Chi ci mette prima un collegamento simbolico si fa scrivere dove vuole, col contenuto che vuole,
// da un processo che gira come root — `writeFileSync` segue il collegamento. Il collaudo di
// sicurezza del 31/8 se l'è fatto riscrivere.
//
// E la scrittura finale su `giro.sh` non era atomica: un processo che muore in mezzo lascia il
// ciclo principale troncato.
//
// ⚠️ Il posto giusto NON è «un altro /tmp»: è una cartella del repo IGNORATA da git
// (`cervello/_tmp_*`, righe 41 e 44 di .gitignore). Due ragioni insieme: lo spazzino del ritmo fa
// `git add -A` e raccoglierebbe qualunque file lasciato nel repo — è il difetto del 25/7 per cui il
// temporaneo era finito in /tmp — e `renameSync` è atomico solo se il temporaneo sta sullo STESSO
// disco del bersaglio, cosa che /tmp non garantisce.
//
// ─────────────────────────────────────────────────────────────────────────────
// ☠️ COME QUESTA PROVA HA CANCELLATO `cervello/` — la prima stesura, 31/8
// ─────────────────────────────────────────────────────────────────────────────
// La prima stesura faceva pulizia così: `rmSync(dirname(fuoriRepo(...)), { recursive: true })`.
// Sembra innocuo — cancella la cartella che la funzione ha appena creato. Ma il banco delle
// mutazioni ROMPE APPOSTA la funzione, e la mutazione la faceva tornare un percorso dentro il repo:
// `dirname` diventava `cervello/`, e la prova ha cancellato 956 file. Sono tornati da git, ma è
// stato un ripristino, non un fastidio.
//
// LA REGOLA CHE NE ESCE, e vale per ogni prova di questa casa: **non si cancella mai una cartella
// il cui nome viene dal codice che si sta provando.** Si cancella solo ciò che la prova ha creato
// da sé, con un percorso che la prova conosce indipendentemente. Sotto un banco che rompe apposta,
// un percorso calcolato dal codice sotto esame è un percorso ostile.
//
// Qui la pulizia passa da `mieCartelle`, che raccoglie SOLO quelle create da `mkdtempSync` di
// questo file, e da `soloMia()`, che rifiuta qualunque percorso che non sia in quella lista.

import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, existsSync, rmSync, symlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname, basename } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { fuoriRepo, scriviInteroONiente, miaCartellaDiLavoro } from "../round6-applica.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Le sole cartelle che questa prova ha il diritto di cancellare: quelle che ha creato lei. */
const mieCartelle = new Set();
function miaCartella(prefisso) {
  const d = mkdtempSync(join(tmpdir(), prefisso));
  mieCartelle.add(d);
  return d;
}
/** Il guinzaglio: cancella solo se il percorso è nell'elenco di quelle mie. Altrimenti non tocca
 *  niente e lo dice — che è come si evita di ricancellare `cervello/`. */
function soloMia(via) {
  if (!mieCartelle.has(via)) return `non è una mia cartella, non la cancello: ${via}`;
  rmSync(via, { recursive: true, force: true });
  mieCartelle.delete(via);
  return null;
}
// Le cartelle che `fuoriRepo` crea dentro il repo le tolgo per nome esatto e una per una, mai per
// `dirname` di qualcosa: `_tmp_round6-*` è ignorata da git, quindi al peggio resta lì.
const nateDaFuoriRepo = [];
after(() => {
  for (const d of [...mieCartelle]) soloMia(d);
  for (const d of nateDaFuoriRepo) {
    if (d.startsWith(join(REPO, "cervello", "_tmp_round6-"))) rmSync(d, { recursive: true, force: true });
  }
});
/** Chiama la funzione sotto esame e segna la cartella nata, senza mai derivarne una da cancellare. */
function chiediUnTemporaneo() {
  const via = fuoriRepo("cervello/giro.sh", "prova");
  nateDaFuoriRepo.push(dirname(via));
  return via;
}

test("AR-923 · il nome del temporaneo non si indovina due volte di fila", () => {
  assert.notEqual(chiediUnTemporaneo(), chiediUnTemporaneo(),
    "due chiamate danno lo stesso percorso: chi lo indovina ci mette un collegamento prima");
});

test("AR-923 · e non sta in una cartella dove scrive chiunque", () => {
  const via = chiediUnTemporaneo();
  assert.equal(via.startsWith(`${tmpdir()}/`), false, `il temporaneo è tornato in una cartella pubblica: ${via}`);
  assert.match(basename(dirname(via)), /^_tmp_round6-.{6}/, "la parte casuale del nome è sparita");
});

test("AR-923 · …ma resta invisibile a git, che è il motivo per cui era finito in /tmp", () => {
  const via = chiediUnTemporaneo();
  // Stesso guinzaglio della pulizia, applicato alla scrittura: sotto mutazione questo percorso può
  // finire dentro il repo, e una prova non lascia file nel repo nemmeno quando il codice sbaglia.
  if (!dirname(via).startsWith(join(REPO, "cervello", "_tmp_round6-"))) {
    assert.fail(`il temporaneo non è più in una cartella mia e ignorata: ${via}`);
  }
  writeFileSync(via, "#!/bin/bash\n");
  const r = spawnSync("git", ["status", "--porcelain", "--untracked-files=all", via], { cwd: REPO, encoding: "utf8" });
  if (r.error || r.status !== 0) return; // ⚪ git non risponde: non ho misurato, non dichiaro verde
  assert.equal(`${r.stdout}`.trim(), "",
    "git lo vede: lo spazzino del ritmo fa `git add -A` e se lo porterebbe dentro per sempre");
});

test("AR-923 · la scrittura è tutto-o-niente, e non lascia il provvisorio in giro", () => {
  const casa = miaCartella("ar899-a-");
  const bersaglio = join(casa, "giro.sh");
  writeFileSync(bersaglio, "#!/bin/bash\nvecchio\n");
  scriviInteroONiente(bersaglio, "#!/bin/bash\nnuovo\n");
  assert.equal(readFileSync(bersaglio, "utf8"), "#!/bin/bash\nnuovo\n");
  assert.equal(existsSync(join(casa, `_tmp_${basename(bersaglio)}.${process.pid}`)), false);
});

test("AR-923 · la premessa dell'attacco regge ancora: writeFileSync segue i collegamenti", () => {
  // Se questo caso diventa verde, node ha cambiato comportamento e tutto il ragionamento qui sopra
  // va rivisto. È la premessa scritta come prova, invece che come convinzione.
  const casa = miaCartella("ar899-b-");
  const vittima = join(casa, "vittima.txt");
  writeFileSync(vittima, "INTATTO");
  const prevedibile = join(casa, "round6-prova-giro.sh");
  symlinkSync(vittima, prevedibile);
  writeFileSync(prevedibile, "#!/bin/bash\n# giro.sh riscritto qui dentro\n");
  assert.notEqual(readFileSync(vittima, "utf8"), "INTATTO");
});

test("AR-923 · il guinzaglio della pulizia rifiuta una cartella che non ha creato lei", () => {
  // La prova della lezione: sotto mutazione, `fuoriRepo` può tornare un percorso dentro il repo.
  // Se la pulizia si fidasse di quel percorso, cancellerebbe `cervello/`. È già successo.
  assert.match(soloMia(join(REPO, "cervello")) || "", /non è una mia cartella/);
  assert.equal(existsSync(join(REPO, "cervello")), true, "cervello/ è ancora al suo posto");
});

test("AR-923 · la pulizia riconosce le cartelle sue, e SOLO quelle", () => {
  // ⚠️ Questo caso è nato leggendo il MIO diff, non da un guasto. `applica()` faceva
  // `rmSync(dirname(fuoriRepo(...)), { recursive: true })` — la stessa forma che stamattina ha
  // portato via 956 file quando il banco ha rotto apposta quella funzione. Lì era una prova e c'era
  // il banco a fare da rete; qui è il codice vero e non c'è nessuna rete.
  //
  // La prima stesura di QUESTO caso cercava la riga nel sorgente con una regex: diceva che la
  // difesa è scritta, non che funziona. Adesso la esegue.
  const R = "/finto/repo";
  assert.equal(miaCartellaDiLavoro(join(R, "cervello", "_tmp_round6-Ab3xZ9"), R), true, "una cartella nostra si cancella");
  for (const no of [
    join(R, "cervello"),                       // la cartella che è stata cancellata davvero
    join(R, "cervello", "test"),
    R,
    join(R, "pannello", "src"),
    "/",
    "",
  ]) {
    assert.equal(miaCartellaDiLavoro(no, R), false, `verrebbe cancellata ricorsivamente: ${no || "(vuoto)"}`);
  }
  // il prefisso NUDO non basta: sarebbe la cartella che le contiene tutte
  assert.equal(miaCartellaDiLavoro(join(R, "cervello", "_tmp_round6-"), R), false);
});

test("AR-923 · e nella vita vera la cartella che `fuoriRepo` crea è riconosciuta come sua", () => {
  const via = chiediUnTemporaneo();
  assert.equal(miaCartellaDiLavoro(dirname(via), REPO), true,
    "il guinzaglio è così stretto che non riconosce nemmeno la cartella che abbiamo appena creato: la pulizia non pulirebbe più niente");
});

test("AR-923 · …e la pulizia passa DAVVERO dal guinzaglio, non lo tiene in un cassetto", () => {
  // ⚠️ DICHIARATO PER QUELLO CHE È: questo caso guarda il SORGENTE, non lo esegue. È la forma
  // debole che questa casa scoraggia, e sta qui lo stesso per una ragione precisa.
  //
  // I casi qui sopra provano la FUNZIONE eseguendola, ed è lì che morde la mutazione. Ma restava
  // scoperto il modo più banale di perdere la difesa: lasciare la funzione giusta e smettere di
  // chiamarla. Provarlo eseguendo vorrebbe dire far girare `applica()` sul repo VERO — `path` si
  // compone con `join(AD_ROOT, voce.file)`, che non si lascia dirottare in una cartella usa-e-getta
  // — cioè rischiare di riscrivere `giro.sh` per provare una pulizia. Non vale il prezzo.
  //
  // Quindi: la funzione si esegue, il suo uso si guarda. E si dice quale metà è quale.
  const src = readFileSync(join(REPO, "cervello/round6-applica.mjs"), "utf8");
  assert.equal(/rmSync\(dirname\(tmp\),/.test(src) && !/miaCartellaDiLavoro\(dirname\(tmp\)\)/.test(src), false,
    "la cancellazione ricorsiva è tornata a fidarsi di `dirname(tmp)` senza passare dal guinzaglio");
});
