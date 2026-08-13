// AR-575 — contabilità delle chiusure: 74 schede chiuse senza data, invisibili al voto mensile.
//
// Il fatto: il tasso di chiusura conta una chiusura solo se `meseDi(chiuso_il)` cade nel mese.
// Con la data vuota la chiusura non appartiene a nessun mese: ad agosto il voto diceva 0,23
// mentre la verità era ~0,92 — e il freno anti-ricerche ha strozzato la macchina su un contatore
// rotto. Due gambe, entrambe eseguite qui su dati INIETTATI (mai la memoria vera):
//   ① il FRENO: ogni strada che scrive `stato:"chiuso"` passa dal timbro unico `timbraChiusura`
//      (auto-fix.mjs), che pretende la data CON l'ora — la lezione AR-172: il timbro sta vicino
//      al dato, non copiato in ogni comando;
//   ② il CONTO: tasso-chiusura legge anche il campo storto `chiuso` (5 schede d'archivio), dichiara
//      le chiusure senza data invece di ingoiarle, e il `--gate` boccia un voto su registri bucati.
// La RIPARAZIONE DATI (B-backfill-date.mjs) è provata qui col suo dry-run su un cantiere finto.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const { timbraChiusura } = await import(join(QUI, "..", "auto-fix.mjs"));
const { contaMese, dataChiusura, chiusiSenzaData, idDoppi, gateBocciato } = await import(join(QUI, "..", "tasso-chiusura.mjs"));

// ── ① il timbro unico ────────────────────────────────────────────────────────
test("timbraChiusura scrive stato + data DI DEFAULT con l'ora (regola dell'orario)", () => {
  const d = { id: "AR-1", stato: "aperto" };
  timbraChiusura(d, { come: "provato nel test" });
  assert.equal(d.stato, "chiuso");
  assert.match(d.chiuso_il, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/, "la data di chiusura deve portare l'ora, al minuto");
  assert.equal(d.chiuso_come, "provato nel test");
});

test("timbraChiusura RIFIUTA una data senza ora: è esattamente il buco che ha prodotto le 74 orfane", () => {
  assert.throws(() => timbraChiusura({ id: "AR-2" }, { quando: "2026-08-13" }), /senza ora/);
  const d = timbraChiusura({ id: "AR-3" }, { quando: "" }); // stringa vuota → usa l'adesso, non lancia
  assert.match(d.chiuso_il, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/);
});

test("timbraChiusura accetta una data completa iniettata (per backfill e test)", () => {
  const d = { id: "AR-4", stato: "aperto" };
  timbraChiusura(d, { quando: "2026-08-01 09:30", come: "x" });
  assert.equal(d.chiuso_il, "2026-08-01 09:30");
});

// ── ② il conto che non perde chiusure per un nome di campo ───────────────────
test("dataChiusura legge `chiuso_il` e, in mancanza, il campo storto `chiuso`", () => {
  assert.equal(dataChiusura({ chiuso_il: "2026-08-04 06:00" }), "2026-08-04 06:00");
  assert.equal(dataChiusura({ chiuso: "2026-08-04 05:20" }), "2026-08-04 05:20", "5 schede d'archivio hanno solo il nome storto: non si perdono");
  assert.equal(dataChiusura({}), null);
});

test("contaMese accredita anche la chiusura registrata nel campo storto `chiuso`", () => {
  const d = [
    { id: "A", nato: "2026-08-01", stato: "chiuso", chiuso: "2026-08-04 05:20" },
    { id: "B", nato: "2026-08-02", stato: "aperto" },
  ];
  assert.deepEqual(contaMese(d, "2026-08"), { nati: 2, chiusi: 1 });
});

test("le chiusure senza NESSUNA data diventano un elenco dichiarato, non un silenzio", () => {
  const d = [
    { id: "A", stato: "chiuso", chiuso_il: "2026-08-01 10:00" },
    { id: "B", stato: "chiuso" }, // l'orfana
    { id: "C", stato: "chiuso", chiuso: "2026-08-02 10:00" }, // nome storto ≠ orfana
    { id: "D", stato: "aperto" },
  ];
  assert.deepEqual(chiusiSenzaData(d), ["B"]);
});

test("il gate boccia il voto contato su registri bucati, anche se il tasso sarebbe verde", () => {
  assert.equal(gateBocciato("ok", { chiusi_senza_data: [], id_doppi_lezioni: [] }), false, "libri puliti e tasso ok → passa");
  assert.equal(gateBocciato("sotto", { chiusi_senza_data: [] }), true, "sotto obiettivo → bocciato come prima");
  assert.equal(gateBocciato("ok", { chiusi_senza_data: ["AR-465"] }), true, "un chiuso senza data → il voto non è affidabile");
  assert.equal(gateBocciato("piccolo", { id_doppi_lezioni: ["L-1"] }), true, "anche col campione magro, i buchi nei registri restano un rosso");
  assert.equal(gateBocciato("piccolo", {}), false, "campione magro e libri puliti → non è una bocciatura");
});

test("idDoppi vede un id usato due volte, e ignora le voci senza id", () => {
  assert.deepEqual(idDoppi([{ id: "X" }, { id: "Y" }, { id: "X" }, {}]), ["X"]);
  assert.deepEqual(idDoppi([]), []);
});

// ── la riparazione dati: B-backfill-date.mjs su un cantiere INIETTATO ────────
const SCRIPT = join(process.env.CORSIE_DIR || new URL("../riparazioni/", import.meta.url).pathname, "B-backfill-date.mjs");

function cantiereFinto(dove) {
  const file = join(dove, "cantiere.json");
  writeFileSync(file, `${JSON.stringify({
    aggiornato: "2026-08-13 12:00",
    difetti: [
      { id: "AR-10", stato: "chiuso", nato: "2026-08-01 09:00", chiuso: "2026-08-04 05:20" }, // nome storto
      { id: "AR-11", stato: "chiuso", nato: "2026-08-02 09:00" }, // orfana vera → stima dichiarata (niente git qui)
      { id: "AR-12", stato: "chiuso", nato: "2026-08-03 09:00", chiuso_il: "2026-08-05 10:00" }, // sana: non si tocca
      { id: "AR-13", stato: "aperto", nato: "2026-08-03 09:00" },
    ],
  }, null, 2)}\n`, "utf8");
  return file;
}

test("B-backfill: il dry-run NON scrive e racconta cosa cambierebbe", () => {
  const dove = mkdtempSync(join(tmpdir(), "backfill-"));
  const file = cantiereFinto(dove);
  const prima = readFileSync(file, "utf8");
  const r = spawnSync(process.execPath, [SCRIPT, `--root=${dove}`, `--file=${file}`], { encoding: "utf8", timeout: 60000 });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /AR-10/, "deve elencare la scheda col nome storto");
  assert.match(r.stdout, /AR-11/, "deve elencare l'orfana");
  assert.doesNotMatch(r.stdout, /AR-12 →/, "una scheda con la data non si tocca");
  assert.equal(readFileSync(file, "utf8"), prima, "dry-run: il file resta identico al byte");
});

test("B-backfill --applica: date valorizzate con la fonte accanto, `stato` MAI toccato, idempotente", () => {
  const dove = mkdtempSync(join(tmpdir(), "backfill-"));
  const file = cantiereFinto(dove);
  const r = spawnSync(process.execPath, [SCRIPT, `--root=${dove}`, `--file=${file}`, "--applica"], { encoding: "utf8", timeout: 60000 });
  assert.equal(r.status, 0, r.stderr);
  const dopo = JSON.parse(readFileSync(file, "utf8"));
  const [a10, a11, a12, a13] = dopo.difetti;
  assert.equal(a10.chiuso_il, "2026-08-04 05:20", "il nome storto diventa chiuso_il");
  assert.equal(a10.chiuso, undefined, "il campo doppio sparisce");
  assert.match(a10.chiuso_il_fonte, /nome sbagliato/);
  assert.ok(a11.chiuso_il, "l'orfana riceve una data");
  assert.match(a11.chiuso_il_fonte, /stima/, "e la fonte DICE che è una stima: mai un numero senza fonte");
  assert.equal(a12.chiuso_il, "2026-08-05 10:00", "la scheda sana resta com'era");
  assert.equal(a13.stato, "aperto", "nessuno `stato` cambia: lo script ripara date, non chiude difetti");
  assert.deepEqual(chiusiSenzaData(dopo.difetti), [], "dopo la riparazione il conto non ha più orfane");
  // idempotenza: il secondo giro non trova niente
  const r2 = spawnSync(process.execPath, [SCRIPT, `--root=${dove}`, `--file=${file}`, "--applica"], { encoding: "utf8", timeout: 60000 });
  assert.equal(r2.status, 0);
  assert.match(r2.stdout, /Niente da riparare/);
});
