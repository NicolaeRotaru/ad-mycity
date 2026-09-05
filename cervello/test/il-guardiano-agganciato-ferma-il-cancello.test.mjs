#!/usr/bin/env node
// AR-798 — UN GUARDIANO SCOLLEGATO È INDISTINGUIBILE DA UN GUARDIANO ASSENTE, E STAMPA VERDE UGUALE.
//
// `cervello/puntatori-scollegati.mjs` esisteva, girava, usciva 0 — e non frenava niente, perché
// nessuna riga di `cervello/cancello-lotto.mjs` lo eseguiva. Il 28/8/2026 è stato agganciato. Questo
// banco non prova che il MOTORE gira (quello lo fa cervello/test/puntatori-scollegati.test.mjs):
// prova che IL CANCELLO SI FERMA, e lo prova facendo girare il cancello VERO su un repo finto.
//
// Le tre domande, e sono tre perché un freno può fallire in tre modi diversi:
//   ① COL DIFETTO PRESENTE IL CANCELLO SI FERMA. Un puntatore che smette di nominare il suo difetto
//      → il passo esce 1, `fallito: true`, e il verdetto del cancello è `ok: false`.
//   ② SENZA DIFETTO IL CANCELLO PUÒ DIVENTARE VERDE. È la metà che si dimentica sempre: un cancello
//      che non può diventare verde si impara a saltarlo, ed è la malattia peggiore di tutte. Il
//      passo deve uscire 0 — non 2, non 1 — su un albero sano.
//   ③ L'AMBIENTE CIECO NON È UN ROSSO. Cantiere illeggibile → 2 (⚪) e `fallito: false`: «non ho
//      potuto misurare» non si traveste da «il tuo lavoro è rotto».
//
// E una quarta, che è la trappola su cui il collaudo del 23/8 ha bocciato il montaggio (voce 16 del
// catalogo delle scorciatoie, «la voce fantasma»): la nota «questo strumento non è ancora
// collegato» in `cervello/guardiani-motivi.json` diventa una bugia nel minuto esatto in cui lo
// colleghi, e `guardia-viva` la marca — rosso a scoppio ritardato acceso dall'istruzione di
// montaggio stessa. Il caso ④ tiene le due cose insieme: agganciato QUI, e nessuna voce là.
//
// Si lancia con: node --test cervello/test/il-guardiano-agganciato-ferma-il-cancello.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const STRUMENTO = "cervello/puntatori-scollegati.mjs";

const git = (dir, ...a) => spawnSync("git", a, { cwd: dir, encoding: "utf8", timeout: 60_000 });

/**
 * Un repo finto col cervello VERO dentro: ciò che gira è il cancello di produzione, non una copia
 * addomesticata. Il cantiere ha UNA scheda sola e il tetto è ZERO, così il conto è leggibile a
 * occhio: `ancorata` decide da sola se quella scheda è un puntatore scollegato o no.
 */
function repoFinto({ ancorata = true, tetto = 0, conTetto = true, cantiereRotto = false, provaMancante = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "ferma-cancello-"));
  cpSync(join(REPO, "cervello"), join(dir, "cervello"), {
    recursive: true,
    filter: (s) => !s.includes(`${"cervello"}/test`) && !s.includes(`${"cervello"}/vps`),
  });
  mkdirSync(join(dir, "cervello/test"), { recursive: true });
  mkdirSync(join(dir, "MyCity-Vault/90-Memoria-AI/auto-coscienza"), { recursive: true });

  // Il file di prova: con l'ancoraggio nomina il difetto che dimostra, senza no. È la differenza
  // fra «la prova guarda ancora AR-925» e «la prova gira, esce 0 e guarda altro».
  writeFileSync(
    join(dir, "cervello/test/prova-finta.test.mjs"),
    ancorata ? "// AR-925 — il caso che dimostra questo difetto vive qui.\n" : "// il caso è emigrato altrove: qui non si nomina piu' nessun difetto.\n",
    "utf8",
  );
  writeFileSync(join(dir, "cervello/mutanti.json"), `${JSON.stringify({ mutanti: [] }, null, 1)}\n`);
  const tetti = { puntatori_popolazione: 1, prova_con_or: 99, mutazione_mancante: 99, prova_debole: 999 };
  if (conTetto) tetti.puntatori_scollegati = tetto;
  writeFileSync(join(dir, "cervello/tetti-lotto.json"), `${JSON.stringify(tetti, null, 1)}\n`);

  const cantiere = {
    difetti: [
      {
        id: "AR-925",
        stato: "chiuso",
        gravita: "grave",
        titolo: "una scheda con una prova a comando",
        // `provaMancante`: la scheda punta a un file di prova che NON esiste. Il guardiano non può
        // guardare quell'ancoraggio, quindi deve dire ⚪ — che è il caso in prova qui sotto.
        verifica: { tipo: "comando", comando: provaMancante ? "node cervello/test/prova-sparita.test.mjs" : "node cervello/test/prova-finta.test.mjs" },
      },
    ],
  };
  writeFileSync(
    join(dir, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"),
    cantiereRotto ? "{ questo non e' JSON\n" : `${JSON.stringify(cantiere, null, 1)}\n`,
  );

  git(dir, "init", "-q", "-b", "lavoro");
  git(dir, "config", "user.email", "prova@example.com");
  git(dir, "config", "user.name", "Prova");
  git(dir, "add", "-A");
  git(dir, "commit", "-qm", "base");
  git(dir, "update-ref", "refs/remotes/origin/main", git(dir, "rev-parse", "HEAD").stdout.trim());
  return dir;
}

/** Il cancello VERO, e si legge quello che legge la CI: il verdetto e il passo, non la stampa. */
function cancello(dir) {
  const r = spawnSync(process.execPath, [join(dir, "cervello", "cancello-lotto.mjs"), "--veloce", "--json"], {
    cwd: dir,
    encoding: "utf8",
    timeout: 600_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  let j;
  try {
    j = JSON.parse(r.stdout);
  } catch {
    throw new Error(`il cancello non ha prodotto JSON leggibile:\n${(r.stdout || "").slice(0, 800)}\n${(r.stderr || "").slice(0, 800)}`);
  }
  const passo = (j.passi || []).find((p) => String(p.comando).includes("puntatori-scollegati.mjs"));
  return { verdetto: j, passo };
}

const conRepo = (opzioni, fn) => {
  const dir = repoFinto(opzioni);
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

// ── ① IL DIFETTO C'È → IL CANCELLO SI FERMA ─────────────────────────────────────────────────────

test("① col puntatore staccato il cancello VERO si ferma: il passo esce 1 e il verdetto è ok:false", () => {
  conRepo({ ancorata: false, tetto: 0 }, (dir) => {
    const { verdetto, passo } = cancello(dir);
    assert.ok(passo, `il cancello non esegue nemmeno ${STRUMENTO}: agganciato vuol dire che compare fra i suoi passi`);
    assert.equal(passo.codice, 1, `col puntatore staccato il passo deve uscire 1, uscito ${passo.codice}. Uscita:\n${(passo.uscita || "").slice(0, 600)}`);
    assert.equal(passo.fallito, true, "uscita 1 deve valere `fallito` per il cancello, altrimenti il freno non frena");
    assert.equal(verdetto.ok, false, "un passo fallito deve far uscire il cancello dal verde: è la riga che ferma la consegna");
  });
});

// ── ② SENZA DIFETTO IL CANCELLO PUÒ DIVENTARE VERDE ─────────────────────────────────────────────

test("② su un albero sano il passo esce 0: un cancello che non può diventare verde si impara a saltarlo", () => {
  conRepo({ ancorata: true, tetto: 0 }, (dir) => {
    const { passo } = cancello(dir);
    assert.ok(passo, `${STRUMENTO} deve essere fra i passi del cancello`);
    assert.equal(passo.codice, 0, `su un albero sano il passo deve uscire 0 (non 2, non 1), uscito ${passo.codice}. Uscita:\n${(passo.uscita || "").slice(0, 600)}`);
    assert.equal(passo.fallito, false, "un albero sano non è un rosso");
    assert.equal(passo.cieco, false, "un albero sano non è nemmeno un ⚪: il verde qui ha guardato davvero");
  });
});

// ── ③ IL CIECO NON SI TRAVESTE DA ROSSO ─────────────────────────────────────────────────────────

test("③ quando il guardiano non può guardare, il passo esce 2 e NON è `fallito`: ⚪ non si traveste da ❌", () => {
  // ⚠️ RISCRITTO DOPO IL COLLAUDO DEL 28/8, e la ragione è la malattia che questo lotto cura.
  // Prima il caso rompeva il CANTIERE (`cantiereRotto: true`) e poi faceva `if (!passo) return`.
  // Misurato dal collaudo: col cantiere illeggibile il cancello esce alla prima lettura, PRIMA di
  // eseguire qualunque passo — quindi `passo` era SEMPRE undefined e il caso non asseriva mai
  // niente. Verde, veloce (540 ms contro 3900), e completamente vuoto: il verde muto, dentro il
  // banco che dovrebbe curarlo.
  // La cura è accecare il PASSO, non il cancello: il cantiere resta leggibile e una scheda punta a
  // un file di prova che non esiste. Così il cancello ci arriva davvero.
  conRepo({ provaMancante: true }, (dir) => {
    const { passo } = cancello(dir);
    assert.ok(passo, `${STRUMENTO} deve essere fra i passi del cancello: se non c'è, questo caso non sta misurando niente (ed è com'era scritto prima)`);
    assert.equal(passo.codice, 2, `un ancoraggio che non si può guardare deve dare 2 (non ho potuto misurare), dato ${passo.codice}. Uscita:\n${(passo.uscita || "").slice(0, 600)}`);
    assert.equal(passo.fallito, false, "il 2 non deve contare come violazione: «non ho misurato» non è «il tuo lavoro è rotto»");
    assert.equal(passo.cieco, true, "e deve essere riconosciuto come ⚪, non come un verde");
  });
});

// ── ④ IL TETTO ASSENTE NON COMPRA IL VERDE ──────────────────────────────────────────────────────

test("④ tolta la riga del tetto da tetti-lotto.json il cancello NON diventa verde", () => {
  conRepo({ ancorata: false, conTetto: false }, (dir) => {
    const { verdetto, passo } = cancello(dir);
    assert.ok(passo, `${STRUMENTO} deve essere fra i passi del cancello`);
    assert.equal(
      passo.codice,
      1,
      `senza tetto il passo non ha un numero con cui confrontare: deve bloccare, non uscire 0. Uscito ${passo.codice}. Uscita:\n${(passo.uscita || "").slice(0, 600)}`,
    );
    assert.equal(verdetto.ok, false, "una riga di JSON tolta non può comprare il verde del cancello");
  });
});

// ── ⑤ LA VOCE FANTASMA — la trappola su cui il montaggio del 23/8 è stato bocciato ───────────────

test("⑤ agganciato nel cancello e NESSUNA voce che dica il contrario: le due cose partono insieme", () => {
  const r = spawnSync(process.execPath, [join(REPO, "cervello/guardia-viva-check.mjs"), "--json"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 32 * 1024 * 1024,
  });
  const j = JSON.parse(r.stdout);
  assert.equal(
    (j.dove?.["puntatori-scollegati.mjs"] || []).includes("cervello/cancello-lotto.mjs"),
    true,
    `chi mette di guardia uno strumento lo dice il CODICE, non una dichiarazione. Oggi lo eseguono: ${JSON.stringify(j.dove?.["puntatori-scollegati.mjs"] || [])}`,
  );
  assert.equal(
    (j.voci_fantasma || []).includes("puntatori-scollegati.mjs"),
    false,
    "la nota «non è ancora cablato» va tolta nello stesso lavoro che lo cabla, o diventa un rosso a scoppio ritardato per tutti",
  );
  assert.equal(r.status, 0, `guardia-viva deve restare verde con l'aggancio montato, uscito ${r.status}:\n${(r.stdout || "").slice(0, 600)}`);
});

// ── ⑥ NEL CANCELLO NON ENTRA UN PASSO CHE NON PUÒ DIVENTARE VERDE ───────────────────────────────
//
// La regola generale che questa corsia ha imparato, scritta come freno invece che come frase.
// `cervello/due-case.mjs` è stato COSTRUITO e non agganciato apposta: montato oggi esce 2 in ogni
// ambiente raggiungibile (il censimento non sa leggere il passo «prove del Pannello») e 1 se quel
// buco si chiude (quel passo diventa il quinto «mai provabile» contro un tetto di 4). Se domani
// qualcuno aggiunge la riga senza fare prima i due gesti, questo caso diventa rosso e glieli dice.

test("⑥ due-case NON è nel cancello finché non può uscire 0, e il perché è scritto dove si aggancia", async () => {
  const { passiDelCancello } = await import(join(REPO, "cervello/due-case.mjs"));
  const passi = passiDelCancello(readFileSync(join(REPO, "cervello/cancello-lotto.mjs"), "utf8"));
  const montato = passi.some((p) => String(p.script || "").includes("due-case.mjs"));
  if (!montato) {
    // Lo stato dichiarato: non agganciato, ma nemmeno orfano — la sua voce sta nel registro dei motivi.
    const r = spawnSync(process.execPath, [join(REPO, "cervello/guardia-viva-check.mjs"), "--json"], { cwd: REPO, encoding: "utf8", timeout: 120_000, maxBuffer: 32 * 1024 * 1024 });
    const j = JSON.parse(r.stdout);
    assert.equal(
      (j.senza_guardia || []).includes("due-case.mjs"),
      false,
      "non agganciato è una scelta solo se è DICHIARATA: senza la sua voce in cervello/guardiani-motivi.json è solo un freno dimenticato",
    );
    return;
  }
  // Montato: allora deve poter uscire 0 su un albero sano, o è un cancello che non diventa verde mai.
  const dir = repoFinto({ ancorata: true, tetto: 0 });
  try {
    const r = spawnSync(process.execPath, [join(dir, "cervello/due-case.mjs")], { cwd: dir, encoding: "utf8", timeout: 600_000, maxBuffer: 32 * 1024 * 1024 });
    assert.equal(
      r.status,
      0,
      "due-case è stato agganciato al cancello ma su un albero sano non esce 0: prima servono i due gesti scritti " +
        "accanto alla riga in cervello/cancello-lotto.mjs — ① riscrivere il passo «prove del Pannello» in forma " +
        `leggibile, ② alzare a mano tetto_mai_provabili in cervello/due-case.json. Uscito ${r.status}:\n${((r.stdout || "") + (r.stderr || "")).slice(0, 900)}`,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
