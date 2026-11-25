// L'archivio per mese di DECISIONI.md (25/11, approvato da Nicola).
// Rossa se: una riga si perde o cambia nello spostamento, una voce finisce nel mese sbagliato,
// il secondo giro sposta ancora, o chi legge la storia smette di vedere i mesi chiusi.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { dividiPerMese, archivia, leggiDecisioniTutte, meseInCorso, FILE_VIVO, CARTELLA_ARCHIVIO } from "../archivio-decisioni.mjs";
import { esente } from "../coerenza-fatti.mjs";

const ESEMPIO = [
  "---", "tipo: log-decisioni", "---", "",
  "2026-10-30 10:00 · 🟡 · [AD] · **voce di ottobre** con riga sotto", "  dettaglio di ottobre", "",
  "# 🧾 DECISIONI — Registro (append-only)", "", "> spiegazione", "",
  "- 2026-09-02 09:00 · 🟢 · [AD] · voce di settembre", "",
  "## 2026-11-03 12:00 — 🟡 Blocco di novembre", "", "- un punto del blocco", "**Colore:** 🟡", "",
  "- **2026-10-31 23:59** · 🟡 · voce di ottobre scritta tardi", "",
].join("\n");

test("dividiPerMese: il mese in corso e l'intestazione restano, gli altri vanno nel loro mese, righe identiche", () => {
  const { vivo, archivi } = dividiPerMese(ESEMPIO, "2026-11");
  assert.match(vivo, /tipo: log-decisioni/);
  assert.match(vivo, /# 🧾 DECISIONI — Registro/);
  assert.match(vivo, /## 2026-11-03 12:00 — 🟡 Blocco di novembre\n\n- un punto del blocco\n\*\*Colore:\*\* 🟡/);
  assert.doesNotMatch(vivo, /ottobre|settembre/);
  assert.deepEqual([...archivi.keys()].sort(), ["2026-09", "2026-10"]);
  assert.match(archivi.get("2026-10").join("\n"), /voce di ottobre\*\* con riga sotto\n  dettaglio di ottobre[\s\S]*voce di ottobre scritta tardi/);
  const tutte = (s) => s.split("\n").filter(Boolean).sort();
  const dopo = [...vivo.split("\n"), ...[...archivi.values()].flat()].join("\n");
  assert.deepEqual(tutte(dopo), tutte(ESEMPIO), "nessuna riga persa né cambiata");
});

test("archivia: scrive l'archivio, accorcia il vivo, il secondo giro non sposta niente, leggiDecisioniTutte vede tutto", () => {
  const radice = mkdtempSync(join(tmpdir(), "mycity-archivio-"));
  const pVivo = join(radice, FILE_VIVO);
  mkdirSync(join(pVivo, ".."), { recursive: true });
  writeFileSync(pVivo, ESEMPIO);
  const r = archivia({ radice, mese: "2026-11" });
  assert.deepEqual(r.mesi, ["2026-09", "2026-10"]);
  assert.deepEqual(readdirSync(join(radice, CARTELLA_ARCHIVIO)).sort(), ["2026-09.md", "2026-10.md"]);
  assert.doesNotMatch(readFileSync(pVivo, "utf8"), /ottobre/);
  assert.equal(archivia({ radice, mese: "2026-11" }).spostate, 0, "idempotente");
  const storia = leggiDecisioniTutte(pVivo);
  for (const parola of ["settembre", "ottobre scritta tardi", "Blocco di novembre"]) assert.match(storia, new RegExp(parola));
  assert.ok(storia.indexOf("settembre") < storia.indexOf("Blocco di novembre"), "archivio prima, vivo dopo");
  assert.doesNotMatch(leggiDecisioniTutte(pVivo, { mesi: 1 }), /settembre/, "mesi:1 legge solo l'ultimo mese chiuso");
  // Il mese dopo, novembre va in archivio e si aggiunge in coda al file del mese se c'è già.
  writeFileSync(pVivo, readFileSync(pVivo, "utf8") + "\n- 2026-10-31 08:00 · 🟢 · ritardataria\n");
  archivia({ radice, mese: "2026-12" });
  assert.match(readFileSync(join(radice, CARTELLA_ARCHIVIO, "2026-10.md"), "utf8"), /scritta tardi[\s\S]*ritardataria/);
  assert.ok(existsSync(join(radice, CARTELLA_ARCHIVIO, "2026-11.md")));
});

test("il file vivo vero tiene solo il mese in corso, e l'archivio è storia esente per coerenza-fatti", () => {
  const vero = readFileSync(new URL("../../" + FILE_VIVO, import.meta.url), "utf8");
  const { archivi } = dividiPerMese(vero, meseInCorso());
  // Tollera il mese appena chiuso (la rotazione la fa il primo giro del mese), non di più.
  assert.ok(archivi.size <= 1, `DECISIONI.md tiene ${archivi.size} mesi chiusi: lancia node cervello/archivio-decisioni.mjs`);
  assert.equal(esente(`${CARTELLA_ARCHIVIO}/2026-10.md`, []), true);
});
