#!/usr/bin/env node
// 🧪 AR-850 — lo strumento che alleggerisce la coda la appesantiva di un punto a ogni passata.
//
// `housekeeping-azioni.mjs` sposta le card chiuse in archivio: serve a rendere più corta e più
// leggibile la coda che legge Nicola. In fondo al file però ci scriveva la sua riga di riepilogo,
// e quella riga impilava due incisi in una frase sola — il numero fra parentesi e il percorso
// dopo il trattino.
//
// Costo misurato il 26/8: quella riga da sola vale UN punto difficile in `si-capisce.mjs`. Cioè
// chiudere una card e archiviarla — la cosa giusta, quella che un altro guardiano PRETENDE — faceva
// salire di uno il conto dei punti difficili, e il cancello lo contava contro chi aveva archiviato.
// Due guardiani della stessa casa che si davano torto a vicenda, con in mezzo chi lavorava.
//
// L'ho trovato solo perché mi ha bloccato, e solo dopo aver refutato la mia prima spiegazione:
// credevo che il conto salisse perché togliere una card avvicina testi prima lontani. Misurato:
// falso — togliere la card e basta lascia il conto identico. Era la riga dello strumento.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const REPO = join(import.meta.dirname, "..", "..");
const MISURA = join(REPO, "cervello/si-capisce.mjs");
const CODA = join(REPO, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md");

/**
 * I punti difficili di un testo, secondo il metro che il cancello usa davvero.
 *
 * 27/8, AR-845 — QUESTA FUNZIONE NON MISURAVA NIENTE, e il modo in cui falliva è esattamente la
 * malattia che questo file esiste per sorvegliare. Passava il testo su `/dev/stdin` con l'`input:`
 * di `spawnSync`: Node usa una pipe, e `/dev/stdin` non si può riaprire — il misuratore rispondeva
 * «⚪ non ho potuto leggere il testo: ENXIO» e usciva 2. Che è la risposta GIUSTA. Ma qui sotto
 * l'espressione cercava solo `❌ N punti` e su nessuna corrispondenza tornava **0**, cioè
 * «nessun punto difficile»: un ⚪ letto come un ✅. I due casi che la usano misuravano il vuoto da
 * quando sono nati.
 *
 * Adesso: il testo passa da un FILE vero, che è il modo in cui il misuratore è fatto per lavorare, e
 * se non si capisce cosa abbia risposto si LANCIA invece di tornare uno zero. Una misura che non si
 * è potuta fare non è uno zero.
 */
function puntiDifficili(testo) {
  const f = join(mkdtempSync(join(tmpdir(), "si-capisce-")), "testo.md");
  writeFileSync(f, testo);
  const r = spawnSync(process.execPath, [MISURA, f], { encoding: "utf8" });
  const uscita = `${r.stdout || ""}${r.stderr || ""}`;
  rmSync(dirname(f), { recursive: true, force: true });
  return leggiPunti(uscita, r.status);
}

/**
 * Cosa ha risposto il misuratore. Separata apposta, perché è QUI che stava il difetto e qui si prova.
 * Tre risposte, non due: un numero · zero · **non l'ho potuto misurare**, che LANCIA.
 */
export function leggiPunti(uscita, status = null) {
  const t = String(uscita ?? "");
  const m = t.match(/❌ (\d+) punti/);
  if (m) return Number(m[1]);
  if (/✅/.test(t)) return 0;
  throw new Error(`non ho potuto misurare il testo (uscita ${status}): ${t.trim().slice(0, 200) || "(niente)"}`);
}

test("la riga di riepilogo dell'archivio non impila due incisi", () => {
  const riga = readFileSync(CODA, "utf8")
    .split("\n")
    .find((l) => l.includes("Le card chiuse") && l.includes("AZIONI-archivio"));
  assert.ok(riga, "la riga di riepilogo deve esserci: è il rimando all'archivio");
  assert.equal(
    puntiDifficili(riga),
    0,
    `questa riga la scrive housekeeping-azioni.mjs a ogni passata, quindi un punto qui è un punto per sempre:\n  ${riga}`,
  );
});

test("lo strumento che la genera non la ricostruisce nella forma vecchia", () => {
  const src = readFileSync(join(REPO, "cervello/housekeeping-azioni.mjs"), "utf8");
  assert.ok(
    !/Le card chiuse \(\$\{[^}]+\}\) stanno in .* — /.test(src),
    "il numero fra parentesi PIÙ il percorso dopo il trattino è la forma che costava il punto",
  );
  assert.match(src, /Le card chiuse stanno in \[\[AZIONI-archivio\]\]\. Adesso sono \$\{/,
    "il conto va in una frase sua");
});

test("archiviare NON deve far salire il conto della coda", () => {
  const coda = readFileSync(CODA, "utf8");
  const senzaPie = coda.slice(0, coda.lastIndexOf("> 🗄️ Le card chiuse"));
  assert.ok(
    puntiDifficili(coda) <= puntiDifficili(senzaPie),
    "la riga aggiunta dallo strumento non può costare più di non averla: sarebbe un guardiano che punisce chi ubbidisce all'altro",
  );
});

// ── il guasto vero: il rimando si accumulava a ogni passata ────────────────
//
// La cura per l'intestazione dell'archivio era già scritta nello script («tenere la vecchia era il
// meccanismo con cui le copie si accumulavano»), ma solo per l'intestazione. Il rimando in fondo
// sta DOPO l'ultimo separatore, quindi al giro dopo veniva raccolto come se fosse una card e
// riemesso — mentre sotto se ne scriveva uno nuovo.
//
// Su `main` il 26/8 ce n'erano già due, uno che diceva 23 e uno 24; la mia passata ha fatto il
// terzo con 25. La coda diceva a Nicola tre numeri diversi sulla stessa cosa.


const SCRIPT = join(REPO, "cervello/housekeeping-azioni.mjs");

function codaFinta(carte) {
  return [
    "---", "tipo: coda-azioni", "---", "",
    "# ⏳ AZIONI IN ATTESA", "",
    "> 🧹 **Housekeeping 2026-01-01 00:00** — Automatico: **0 aperte · 0 chiuse in archivio**.", "",
    carte.join("\n\n---\n\n"), "",
  ].join("\n");
}

function passata(dir) {
  const r = spawnSync(process.execPath, [SCRIPT], {
    encoding: "utf8",
    env: { ...process.env, CODA_FILE: join(dir, "coda.md"), CODA_ARCHIVIO: join(dir, "archivio.md") },
  });
  return r;
}

test("due passate di seguito NON lasciano due rimandi: si rigenera, non si accumula", () => {
  const dir = mkdtempSync(join(tmpdir(), "coda-"));
  try {
    writeFileSync(
      join(dir, "coda.md"),
      codaFinta([
        "### 🟡 #1 — una card aperta · ⏳ accodata 2026-01-01 00:00\n\nCorpo.",
        "### ✅ #2 — una card chiusa · ⏳ accodata 2026-01-01 00:00 · ✔️ FATTA 2026-01-02 00:00\n\nCorpo.",
      ]),
    );
    passata(dir);
    const dopoUna = readFileSync(join(dir, "coda.md"), "utf8");
    assert.equal(
      dopoUna.split("\n").filter((l) => l.startsWith("> 🗄️ Le card chiuse")).length,
      1,
      "dopo la prima passata il rimando deve essere UNO",
    );

    // la seconda passata non ha niente da spostare: è esattamente il caso in cui il rimando
    // vecchio veniva raccolto come card e riemesso accanto a quello nuovo.
    writeFileSync(
      join(dir, "coda.md"),
      dopoUna.replace("### 🟡 #1", "### ✅ #3 — un'altra chiusa · ⏳ accodata 2026-01-01 00:00 · ✔️ FATTA 2026-01-03 00:00\n\nCorpo.\n\n---\n\n### 🟡 #1"),
    );
    passata(dir);
    const dopoDue = readFileSync(join(dir, "coda.md"), "utf8");
    const rimandi = dopoDue.split("\n").filter((l) => l.startsWith("> 🗄️ Le card chiuse"));
    assert.equal(
      rimandi.length,
      1,
      `due passate hanno lasciato ${rimandi.length} rimandi — è il guasto che diceva a Nicola tre numeri diversi:\n${rimandi.join("\n")}`,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("sul file VERO c'è un rimando solo, non tre", () => {
  const rimandi = readFileSync(CODA, "utf8").split("\n").filter((l) => l.startsWith("> 🗄️ Le card chiuse"));
  assert.equal(rimandi.length, 1, `la coda deve dire UN numero solo, invece dice:\n${rimandi.join("\n")}`);
});

// ── AR-851 — il buco che la prima cura apriva, e che la riguardata ha visto ─
//
// Il primo fix faceva del rimando un CONFINE di blocco. Funzionava sul caso vero e apriva un buco
// peggiore del difetto: quella riga sarebbe diventata un confine anche dentro il corpo di una card,
// e tutto ciò che veniva dopo sarebbe stato classificato come rimando e buttato via in silenzio.
// Non è un caso di scuola: la prima card che cita quella riga è quella che racconta questa
// riparazione. Trovato riguardando il mio lavoro con la lente «cosa succede se», dopo averlo già
// dichiarato finito.

test("una card che CITA il rimando non viene tagliata a metà", () => {
  const dir = mkdtempSync(join(tmpdir(), "coda-cita-"));
  try {
    const corpo = [
      "### 🟡 #9 — la card che parla del rimando · ⏳ accodata 2026-01-01 00:00",
      "",
      "Lo strumento scriveva questa riga:",
      "",
      "> 🗄️ Le card chiuse (23) stanno in [[AZIONI-archivio]] — vecchia forma.",
      "",
      "**QUESTA RIGA DEVE SOPRAVVIVERE.** È il corpo della card, non il rimando in fondo.",
    ].join("\n");
    writeFileSync(
      join(dir, "coda.md"),
      codaFinta([corpo, "### ✅ #10 — chiusa · ⏳ accodata 2026-01-01 00:00 · ✔️ FATTA 2026-01-02 00:00\n\nCorpo."]),
    );
    passata(dir);
    const dopo = readFileSync(join(dir, "coda.md"), "utf8");
    assert.match(dopo, /QUESTA RIGA DEVE SOPRAVVIVERE/,
      "la coda della card è stata buttata: il rimando usato come confine mangia il corpo delle card che lo citano");
    assert.match(dopo, /la card che parla del rimando/, "e la card deve restare aperta");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("senzaRimandoFinale tocca solo la fine, mai il mezzo", async () => {
  const { senzaRimandoFinale } = await import("../housekeeping-azioni.mjs");
  const conCorpo = [
    "### 🟡 #1 — una card",
    "> 🗄️ Le card chiuse (5) stanno in [[AZIONI-archivio]] — citata nel corpo.",
    "testo che segue",
    "",
    "---",
    "",
    "> 🗄️ Le card chiuse stanno in [[AZIONI-archivio]]. Adesso sono 7.",
    "> Il file è `x.md`.",
    "",
  ].join("\n");
  const fuori = senzaRimandoFinale(conCorpo);
  assert.match(fuori, /citata nel corpo/, "quella in mezzo resta");
  assert.match(fuori, /testo che segue/, "e quello che la segue pure");
  assert.ok(!/Adesso sono 7/.test(fuori), "quella in fondo se ne va: è il rimando da rigenerare");
  assert.equal(senzaRimandoFinale("### 🟡 #1 — senza rimando"), "### 🟡 #1 — senza rimando", "senza rimando è un no-op");
});

test("AR-851 — senza rimando il separatore finale NON si tocca", async () => {
  const { senzaRimandoFinale } = await import("../housekeeping-azioni.mjs");
  const conRigaOrizzontale = "### 🟡 #1 — card\ntesto del corpo\n\n---\n";
  assert.match(
    senzaRimandoFinale(conRigaOrizzontale),
    /---\s*$/,
    "il `---` in fondo a una card, senza rimando dopo, è parte del corpo: mangiarlo a ogni passata è erosione silenziosa",
  );
  const conRimando = "### 🟡 #1 — card\ntesto del corpo\n\n---\n\n> 🗄️ Le card chiuse stanno in [[AZIONI-archivio]]. Adesso sono 7.\n> Il file è `x.md`.\n";
  assert.equal(
    senzaRimandoFinale(conRimando),
    "### 🟡 #1 — card\ntesto del corpo",
    "col rimando invece se ne va anche il separatore che lo introduceva, o resterebbe orfano",
  );
  assert.equal(senzaRimandoFinale(""), "", "testo vuoto: nessun giro a vuoto");
});

test("AR-845 · una misura che non si è potuta fare NON è uno zero", () => {
  // È il difetto che ha reso vuoti i due casi qui sopra da quando sono nati. Il misuratore rispondeva
  // «⚪ non ho potuto leggere il testo: ENXIO» e usciva 2 — la risposta giusta — e questa funzione,
  // trovando solo `❌ N punti`, tornava 0: un ⚪ letto come un ✅, dentro lo strumento di una prova.
  assert.equal(leggiPunti("❌ 3 punti che costringono Nicola a rileggere"), 3);
  assert.equal(leggiPunti("✅ si capisce"), 0);
  assert.throws(
    () => leggiPunti("⚪ non ho potuto leggere il testo: ENXIO: no such device or address", 2),
    /non ho potuto misurare/,
    "un ⚪ è tornato come uno zero: è il difetto rimesso",
  );
  assert.throws(() => leggiPunti("", 1), /non ho potuto misurare/, "il silenzio è tornato uno zero");
  assert.throws(() => leggiPunti(null), /non ho potuto misurare/);
});
