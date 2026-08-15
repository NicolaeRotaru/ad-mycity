// AR-580 — quattro lezioni portano lo stesso numero di matricola.
//
// Il fatto: in apprendimento.json quattro id (L-2026-0804-02, L-2026-0710-71, L-2026-0710-72,
// L-2026-0701-27) esistono in doppia copia, e le copie sono lezioni DIVERSE. Chi cerca per id
// (`lezioni.find(...)` in tasso-lezioni.mjs) becca sempre la prima: la seconda è irraggiungibile
// e ogni uso registrato le viene rubato.
//
// Il punto di scrittura è FUORI dal codice (gli id L-… si coniano a mano in sessione): il freno è
// quindi un guardiano di LETTURA — `idDoppi` in tasso-chiusura.mjs, che a ogni giro mette i doppi
// nel referto (`registri_bucati.id_doppi_lezioni`) e col `--gate` li rende un rosso.
// La riparazione (B-dedup-lezioni.mjs) è provata qui sul suo dry-run/applica con dati INIETTATI.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const { idDoppi } = await import(join(QUI, "..", "tasso-chiusura.mjs"));

// ── il guardiano di lettura ──────────────────────────────────────────────────
test("idDoppi trova gli id di lezione usati due volte — il caso vero del 13/8", () => {
  const lezioni = [
    { id: "L-2026-0804-02", testo: "prima copia" },
    { id: "L-2026-0804-03", testo: "sana" },
    { id: "L-2026-0804-02", testo: "seconda copia, lezione diversa" },
  ];
  assert.deepEqual(idDoppi(lezioni), ["L-2026-0804-02"]);
});

test("il referto del tasso di chiusura porta i doppi delle lezioni: il guardiano gira a ogni giro", () => {
  // Si esegue il motore VERO e si guarda il suo referto JSON: la chiave deve esserci sempre,
  // così un doppione futuro non ha dove nascondersi.
  const r = spawnSync(process.execPath, [join(QUI, "..", "tasso-chiusura.mjs"), "--json"], { encoding: "utf8", timeout: 60000 });
  const referto = JSON.parse(r.stdout);
  assert.ok(referto.registri_bucati, "il referto deve dichiarare lo stato dei registri");
  assert.ok(Array.isArray(referto.registri_bucati.id_doppi_lezioni), "…compresi gli id doppi delle lezioni");
});

// ── la riparazione dati: B-dedup-lezioni.mjs su un archivio INIETTATO ────────
const SCRIPT = join(process.env.CORSIE_DIR || new URL("../riparazioni/", import.meta.url).pathname, "B-dedup-lezioni.mjs");

function archivioFinto(dove) {
  const file = join(dove, "apprendimento.json");
  writeFileSync(file, `${JSON.stringify({
    aggiornato: "2026-08-13 12:00",
    lezioni: [
      { id: "L-2026-0710-71", testo: "la prima copia, che l'id lo tiene", usi: [{ quando: "2026-07-11", ref: "x" }] },
      { id: "L-2026-0710-99", testo: "il massimo NN di quella data" },
      { id: "L-2026-0710-71", testo: "la seconda copia, lezione diversa" },
      { id: "L-2026-0801-01", testo: "sana" },
    ],
  }, null, 1)}\n`, "utf8");
  return file;
}

test("B-dedup: il dry-run NON scrive e mostra il rinumero", () => {
  const dove = mkdtempSync(join(tmpdir(), "dedup-"));
  const file = archivioFinto(dove);
  const prima = readFileSync(file, "utf8");
  const r = spawnSync(process.execPath, [SCRIPT, `--root=${dove}`, `--file=${file}`], { encoding: "utf8", timeout: 30000 });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /L-2026-0710-71 → L-2026-0710-100/, "il nuovo id è il primo NN libero DOPO il massimo di quella data");
  assert.equal(readFileSync(file, "utf8"), prima, "dry-run: il file resta identico al byte");
});

test("B-dedup --applica: la seconda copia cambia id SENZA perdere contenuto; la prima resta; idempotente", () => {
  const dove = mkdtempSync(join(tmpdir(), "dedup-"));
  const file = archivioFinto(dove);
  const r = spawnSync(process.execPath, [SCRIPT, `--root=${dove}`, `--file=${file}`, "--applica"], { encoding: "utf8", timeout: 30000 });
  assert.equal(r.status, 0, r.stderr);
  const dopo = JSON.parse(readFileSync(file, "utf8")).lezioni;
  assert.equal(dopo[0].id, "L-2026-0710-71", "la PRIMA copia tiene l'id: i riferimenti storici restano validi");
  assert.deepEqual(dopo[0].usi, [{ quando: "2026-07-11", ref: "x" }], "gli usi della prima non si toccano");
  assert.equal(dopo[2].id, "L-2026-0710-100", "la seconda copia riceve un id libero della stessa forma e data");
  assert.equal(dopo[2].testo, "la seconda copia, lezione diversa", "il contenuto non si perde");
  assert.equal(dopo[2].id_precedente, "L-2026-0710-71", "e il rinumero resta scritto sulla lezione");
  assert.deepEqual(idDoppi(dopo), [], "dopo la riparazione il guardiano non vede più doppi");
  const r2 = spawnSync(process.execPath, [SCRIPT, `--root=${dove}`, `--file=${file}`, "--applica"], { encoding: "utf8", timeout: 30000 });
  assert.match(r2.stdout, /Nessun id doppio/, "idempotente: al secondo giro niente da riparare");
});

// ── 14/8: una mutazione che cita una lezione mai scritta ─────────────────────
// TROVATO NEL COLLAUDO, non da un guardiano. Registrando la mutazione di AR-697 le ho messo
// accanto `"lezione": "L-2026-0814-002"` — una lezione che in quel momento non esisteva ancora, e
// che avrei potuto non scrivere mai. Nessun controllo se ne sarebbe accorto: `gate-veri.mjs`
// cammina nel verso opposto (lezione → mutazione) e una mutazione orfana gli passa sotto il naso.
//
// Perché conta: il campo `lezione` è ciò che lega un freno alla ragione per cui esiste. Se punta
// al vuoto, il freno resta (il test gira) ma la memoria del perché è persa — e fra un mese quella
// mutazione sembrerà arbitraria a chiunque la legga, io compresa. È la stessa malattia degli id
// doppi qui sopra, vista dall'altro capo del filo: lì due lezioni per un numero, qui un numero per
// nessuna lezione.
test("nessuna mutazione cita una lezione che non esiste", () => {
  const REPO = join(QUI, "..", "..");
  const mut = JSON.parse(readFileSync(join(REPO, "cervello/mutanti.json"), "utf8"));
  const app = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"), "utf8"));
  const ids = new Set((app.lezioni || app).map((l) => l.id));
  const orfane = (mut.mutanti || []).filter((m) => m.lezione && !ids.has(m.lezione)).map((m) => `${m.difetto} → ${m.lezione}`);
  assert.deepEqual(orfane, [], `mutazioni che puntano a una lezione inesistente: ${orfane.join(" · ")}`);
});

test("…e il rilevatore non è cieco: su dati finti la trova", () => {
  // Senza questa, la prova sopra resterebbe verde anche se il confronto fosse rotto.
  const ids = new Set(["L-1", "L-2"]);
  const mutanti = [{ difetto: "AR-1", lezione: "L-1" }, { difetto: "AR-2", lezione: "L-99" }, { difetto: "AR-3" }];
  const orfane = mutanti.filter((m) => m.lezione && !ids.has(m.lezione)).map((m) => m.difetto);
  assert.deepEqual(orfane, ["AR-2"], "una mutazione senza campo `lezione` è legittima e non va segnalata");
});
