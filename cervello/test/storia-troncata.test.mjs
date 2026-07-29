// AR-419 e AR-429 — quando la storia di git è troncata, chi la interroga deve dirlo.
//
// IL DIFETTO, misurato il 29/7 su questo repo (clone superficiale, come ogni sessione cloud):
// il commit di innesto NON ha genitori, quindi git considera nuovo tutto il suo albero. Un solo
// commit di innesto elencava **1999 file** come «cambiati». Le risposte che ne uscivano avevano la
// stessa forma di quelle vere, e due guardiani le hanno prese alla lettera:
//
//   · AR-429 — `auto-fix.fileCambiatoDa`: la guardia AR-330 (che rifiuta una chiusura dietro cui
//     nessun file è mai cambiato) trovava OGNI file «cambiato», rispondeva sempre «c'è del lavoro
//     dietro questa chiusura» ed era di fatto spenta in ogni sessione cloud — senza dirlo.
//   · AR-419 — `allocazione-check.fileToccatiDaGit`: 4521 percorsi in una finestra di sette giorni,
//     di cui 1999 dal solo innesto. La quota macchina-vs-business descriveva il magazzino.
//
// Perché questo test è comportamentale e non un pattern: la decisione «cieco o no» è una funzione
// che si può ESEGUIRE su una storia finta. Un grep su `is-shallow-repository` avrebbe dimostrato
// che la stringa c'è, non che il verdetto cambi.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cambiatoDallaNascita,
  chiamateSenzaStato,
  ESENTI,
  innestiDaFile,
  misuraSuStoria,
  senzaCommenti,
  statoStoria,
} from "../storia-git.mjs";
import { fileToccatiDaGit, quotaSforzo, zonaCiecaOltreIlTetto } from "../allocazione-check.mjs";
import { chiusuraAmmessa } from "../prove-regole.mjs";

// ── Il cuore: riconoscere una storia troncata ───────────────────────────────

test("statoStoria: un clone superficiale NON ha la storia intera", () => {
  const s = statoStoria({ shallow: true, innesti: ["84bd226781c0f0f17e3fd8eca8ae45b64e2cf3de"] });
  assert.equal(s.intera, false);
  // Il motivo non è decorazione: è ciò che permette a chi legge di capire che non deve fidarsi.
  assert.match(s.motivo, /innesto/);
});

test("statoStoria: un clone intero ha la storia intera", () => {
  assert.equal(statoStoria({ shallow: false, innesti: [] }).intera, true);
});

test("statoStoria: se git NON risponde, la storia si tratta come troncata", () => {
  // Non sapere se la storia è intera è, per chi deve decidere, uguale ad averla troncata.
  // Il verso prudente qui è l'unico onesto: al buio non si emettono numeri.
  const s = statoStoria({ shallow: null });
  assert.equal(s.intera, false);
});

test("statoStoria: il file .git/shallow da solo basta a dichiarare il troncamento", () => {
  // Difesa in profondità: se `rev-parse` rispondesse «false» per un qualunque motivo ma gli innesti
  // ci sono, comandano gli innesti. Un troncamento visibile non si annulla con una risposta comoda.
  const s = statoStoria({ shallow: false, innesti: ["dc0e9ab9c64759d0936ea9d6dbd92a327dd3c36a"] });
  assert.equal(s.intera, false);
});

test("innestiDaFile: legge gli SHA e ignora il resto", () => {
  assert.deepEqual(innestiDaFile("84bd2267\n\n  dc0e9ab9  \nnon-uno-sha\n"), ["84bd2267", "dc0e9ab9"]);
  assert.deepEqual(innestiDaFile(""), []);
  assert.deepEqual(innestiDaFile(null), []);
});

test("misuraSuStoria: su storia troncata il valore NON passa, e il motivo sì", () => {
  const troncata = statoStoria({ shallow: true });
  const m = misuraSuStoria(troncata, 0.78, "la quota di sforzo");
  assert.equal(m.cieco, true);
  assert.equal(m.valore, null); // ⬅️ il punto: nessun numero esce da una fonte troncata
  assert.match(m.motivo, /quota di sforzo/);

  const intera = misuraSuStoria(statoStoria({ shallow: false }), 0.78);
  assert.equal(intera.cieco, false);
  assert.equal(intera.valore, 0.78);
});

// ── AR-429: la guardia delle chiusure del cantiere ──────────────────────────

test("AR-429: il CASO REALE — git risponde, la risposta non è vuota, e vale zero", () => {
  // Questo è il cuore del fix, eseguito. In un clone superficiale `git log --since` risponde con
  // righe VERE (misurate: 11, per un file qualsiasi) perché il commit di innesto le porta tutte con
  // sé. Prima quella risposta diventava `true` — «il file è cambiato» — e la guardia firmava.
  const rispostaVera = "6fed456 Il perimetro dei controlli si misura\n63b86d2 Lotto 31\n44588d7 Una porta sola";
  const troncata = statoStoria({ shallow: true, innesti: ["84bd2267"] });
  assert.equal(cambiatoDallaNascita(troncata, rispostaVera), null, "risposta non vuota, ma inutilizzabile");

  // Con la storia intera, la stessa identica risposta vale: il fix non ha spento la misura.
  const intera = statoStoria({ shallow: false });
  assert.equal(cambiatoDallaNascita(intera, rispostaVera), true);
  assert.equal(cambiatoDallaNascita(intera, "   "), false, "nessun commit = davvero mai cambiato");
  assert.equal(cambiatoDallaNascita(intera, null), null, "git muto = non lo so");
});

test("AR-419: il CASO REALE — con storia troncata non si chiede nemmeno a git", () => {
  // Il fix eseguito sul suo ramo vero: `fileToccatiDaGit` con una storia troncata non deve
  // restituire un elenco (che sarebbe quello contaminato dall'innesto: 4521 voci di cui 1999
  // fantasma), ma `null` — che a valle diventa «quota non misurata».
  assert.equal(fileToccatiDaGit(7, { intera: false, motivo: "clone superficiale" }), null);

  // E con la storia intera torna a interrogare git davvero: un elenco (anche vuoto), mai null.
  const veri = fileToccatiDaGit(7, { intera: true });
  assert.ok(Array.isArray(veri), "con la storia intera deve produrre un elenco, non un rifiuto");
});

test("AR-429: con storia troncata la chiusura passa ma NON è corroborata", () => {
  // Questo è il comportamento che mancava. Prima, in ogni sessione cloud, `fileCambiatoDa`
  // rispondeva `true` (per via dell'innesto) e la guardia firmava «c'è del lavoro dietro questa
  // chiusura»: una bugia con la faccia di una verifica.
  const g = chiusuraAmmessa({
    verifica: { file: "cervello/qualsiasi.mjs", pattern: "x" },
    nato: "2026-07-01",
    fileCambiatoDallaNascita: null, // ⬅️ ciò che fileCambiatoDa restituisce ora, su storia troncata
  });
  assert.equal(g.ammessa, true, "bloccare ogni chiusura su un repo senza storia sarebbe peggio");
  assert.match(g.motivo, /non corroborata/, "ma deve DIRE che non l'ha verificata");
});

test("AR-429: con storia intera la guardia torna a mordere davvero", () => {
  // La prova che il fix non ha semplicemente spento la guardia: con la storia intera, un file mai
  // cambiato dalla nascita del difetto fa ancora rifiutare la chiusura.
  const g = chiusuraAmmessa({
    verifica: { file: "cervello/qualsiasi.mjs", pattern: "x" },
    nato: "2026-07-01",
    fileCambiatoDallaNascita: false,
  });
  assert.equal(g.ammessa, false);
  assert.match(g.motivo, /NON è mai cambiato/);
});

// ── AR-419: la quota di sforzo ──────────────────────────────────────────────

test("AR-419: senza i file toccati la quota è CIECA, non zero", () => {
  const q = quotaSforzo(null); // ⬅️ ciò che fileToccatiDaGit restituisce ora, su storia troncata
  assert.equal(q.cieca, true);
  assert.equal(q.quota_macchina, null);
  assert.equal(q.macchina, null, "un conteggio a zero si legge come «non abbiamo lavorato»: falso");
  assert.equal(q.business, null);
});

test("AR-419: un elenco VUOTO non è la stessa cosa di un elenco assente", () => {
  // La distinzione che il difetto cancellava. Entrambi danno quota_macchina null, ma solo uno dei
  // due significa «non ho potuto guardare» — ed è quello che deve fermare il cancello.
  const vuoto = quotaSforzo([]);
  assert.equal(vuoto.cieca, false);
  assert.equal(vuoto.totale, 0);

  const assente = quotaSforzo(null);
  assert.equal(assente.cieca, true);
  assert.equal(assente.totale, null);
});

test("AR-419: su quota cieca la zona cieca non accusa nessuno", () => {
  // Senza questo, «0 non classificati» passerebbe per un ottimo risultato proprio quando non
  // abbiamo classificato niente.
  const z = zonaCiecaOltreIlTetto(quotaSforzo(null));
  assert.equal(z.cieca, true);
  assert.equal(z.oltre, false);
  assert.equal(z.quanti, null);
});

test("AR-419: con i file veri la quota si calcola ancora", () => {
  // Il fix non deve aver reso il guardiano cieco sempre: con una storia intera misura come prima.
  const q = quotaSforzo(["cervello/giro.sh", "cervello/worker.sh", "consegne/content/post.md"]);
  assert.equal(q.cieca, false);
  assert.equal(q.macchina, 2);
  assert.equal(q.business, 1);
  assert.ok(Math.abs(q.quota_macchina - 2 / 3) < 1e-9);
});

// ── Il metro: la malattia non si allarga ────────────────────────────────────

test("il metro trova una domanda sulla finestra fatta senza controllo della storia", () => {
  const fuori = chiamateSenzaStato([
    { file: "cervello/finto.mjs", testo: `spawnSync("git", ["log", "--since=7 days ago", "--name-only"]);` },
  ]);
  assert.equal(fuori.length, 1);
  assert.equal(fuori[0].domanda, "--since");
});

test("il metro assolve chi consulta la porta", () => {
  const fuori = chiamateSenzaStato([
    {
      file: "cervello/finto.mjs",
      testo: `import { storiaDelRepo } from "./storia-git.mjs";\nconst s = storiaDelRepo(".");\nif (!s.intera) return null;\nspawnSync("git", ["log", "--since=7 days ago"]);`,
    },
  ]);
  assert.deepEqual(fuori, []);
});

test("il metro NON si sveglia sulle domande sulla PUNTA", () => {
  // Il perimetro è misurato, non dedotto: la punta è reale anche in un clone superficiale, quindi
  // `log -1 --format` non si ammala. Se accusasse anche quelle il guardiano sarebbe rosso ovunque —
  // e un cancello sempre rosso viene aggirato al secondo giro.
  const fuori = chiamateSenzaStato([
    { file: "cervello/finto.sh", testo: `tag="$(git log -1 --format=%h -- "$SCRIPT" 2>/dev/null)"` },
  ]);
  assert.deepEqual(fuori, []);
});

test("il metro vede anche gli script di shell, non solo i .mjs", () => {
  // AR-380/381/382: legare il metro al LINGUAGGIO invece che al bene è l'errore già pagato tre
  // volte. Una domanda sulla finestra fatta da uno .sh è la stessa domanda.
  const fuori = chiamateSenzaStato([
    { file: "cervello/finto.sh", testo: `_ts="$(git log -1 --since='2 days ago' --format=%ct)"` },
  ]);
  assert.equal(fuori.length, 1);
});

test("il metro NON accusa la prosa che lo descrive", () => {
  // Nato dal primo giro del guardiano: accusava `prove-regole.mjs` per una frase in un JSDoc.
  // Un cancello che suona sulla documentazione viene spento, e si spegne con lui la difesa.
  const fuori = chiamateSenzaStato([
    {
      file: "cervello/finto.mjs",
      testo: `/**\n * raccolto da chi chiama (\`git log -- <file> --since <nato>\`)\n */\nexport function x() { return 1; }`,
    },
    { file: "cervello/finto2.mjs", testo: `// vedi git log --since=7 days ago\nconst a = 1;` },
  ]);
  assert.deepEqual(fuori, []);
});

test("senzaCommenti non nasconde una chiamata vera che ha un commento in coda", () => {
  // Il verso in cui è pericoloso sbagliare: togliere troppo significherebbe far sparire una
  // violazione reale, cioè spegnere la difesa proprio col pezzo nato per renderla precisa.
  const src = senzaCommenti(`spawnSync("git", ["log", "--since=1 day"]); // commento in coda`);
  assert.match(src, /--since/);
});

test("le esenzioni esistono, e ognuna ha il suo perché scritto", () => {
  // Un'esenzione senza motivo è un silenzio, ed è la cosa che questi lotti curano.
  assert.ok(ESENTI.length > 0);
  for (const e of ESENTI) {
    assert.ok(e.file, "ogni esenzione nomina il file");
    assert.ok(String(e.perche || "").length > 40, `l'esenzione di ${e.file} deve spiegare PERCHÉ`);
  }
});
