// AR-723 — chi ha promesso una controprova non può ritirarla in silenzio.
//
// LA STORIA. `caloNonProvato` controlla la controprova SOLO se la voce ne dichiara una. Cambiarne il
// testo fa scattare il rosso: è già provato da una mutazione. TOGLIERE il campo, invece, lasciava la
// spazzata VERDE — il codice cadeva nel ramo successivo e nessuno notava che una promessa era stata
// ritirata. Cioè la difesa più forte del registro era quella che si disinstallava nel modo più facile.
//
// COSA PROVA QUESTO FILE, eseguendo:
//   ① il giudizio puro: promessa tolta = rosso · promessa mantenuta = silenzio · voce sparita = rosso;
//   ② l'unica via d'uscita, che è dichiarata e costa: la partenza deve SALIRE;
//   ③ lo strumento VERO su un albero finto: togliere il campo lo fa uscire 1 e dirlo a parole;
//   ④ un confronto che non si è potuto fare è un ⚪ (uscita 2), non un verde.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promesseRitirate } from "../spazzata-fratelli.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SPAZZATA = join(REPO, "cervello/spazzata-fratelli.mjs");

const voce = (extra = {}) => ({
  id: "finta",
  nome: "una malattia finta",
  pattern: "PAROLA_CHE_NON_ESISTE_DA_NESSUNA_PARTE",
  estensioni: [".mjs"],
  baseline: 0,
  controprova: "PAROLA_CHE_NON_ESISTE_DA_NESSUNA_PARTE",
  ...extra,
});

// ── ① Il giudizio puro ──────────────────────────────────────────────────────

test("togliere la controprova è rosso: la promessa non si ritira in silenzio", () => {
  const fuori = promesseRitirate([voce()], [voce({ controprova: undefined })]);
  assert.equal(fuori.length, 1);
  assert.equal(fuori[0].tipo, "controprova-ritirata");
  assert.match(fuori[0].motivo, /finta/);
});

test("una controprova svuotata conta come tolta: la stringa vuota non è una promessa", () => {
  assert.equal(promesseRitirate([voce()], [voce({ controprova: "   " })]).length, 1);
});

test("la promessa mantenuta non dice niente", () => {
  assert.deepEqual(promesseRitirate([voce()], [voce()]), []);
});

test("cambiare il TESTO della controprova non è ritirarla: quel caso lo giudica già il conteggio", () => {
  assert.deepEqual(promesseRitirate([voce()], [voce({ controprova: "un altro esempio noto" })]), []);
});

test("una malattia che non aveva promesso niente resta libera di non promettere", () => {
  const senza = voce({ controprova: undefined });
  assert.deepEqual(promesseRitirate([senza], [senza]), []);
});

test("far sparire la voce intera è peggio, e si vede", () => {
  const fuori = promesseRitirate([voce()], []);
  assert.equal(fuori.length, 1);
  assert.equal(fuori[0].tipo, "malattia-sparita");
});

test("aggiungere una malattia nuova non è un'accusa", () => {
  assert.deepEqual(promesseRitirate([], [voce()]), []);
});

// ── ② L'unica via d'uscita, dichiarata e cara ───────────────────────────────

test("ritirare la promessa è lecito solo se la partenza SALE: chi non sa controprovare non vanta", () => {
  assert.deepEqual(promesseRitirate([voce({ baseline: 5 })], [voce({ baseline: 9, controprova: undefined })]), []);
});

test("…ma con la partenza ferma o in calo resta rosso: è lì che il ritiro compra un verde", () => {
  assert.equal(promesseRitirate([voce({ baseline: 5 })], [voce({ baseline: 5, controprova: undefined })]).length, 1);
  assert.equal(promesseRitirate([voce({ baseline: 5 })], [voce({ baseline: 2, controprova: undefined })]).length, 1);
});

// ── ③ Lo strumento vero, su un albero finto ─────────────────────────────────

/** Lancia la spazzata su un albero finto, con un registro di «ieri» dichiarato. */
function spazzata({ ieri, oggi }) {
  const dir = mkdtempSync(join(tmpdir(), "mycity-promessa-"));
  try {
    mkdirSync(join(dir, "albero"));
    writeFileSync(join(dir, "albero", "vuoto.mjs"), "// niente qui dentro\n");
    const via = { ieri: join(dir, "ieri.json"), oggi: join(dir, "oggi.json") };
    if (ieri) writeFileSync(via.ieri, JSON.stringify({ malattie: ieri }, null, 1));
    writeFileSync(via.oggi, JSON.stringify({ malattie: oggi }, null, 1));
    const r = spawnSync("node", [SPAZZATA], {
      encoding: "utf8",
      env: {
        ...process.env,
        SPAZZATA_REPO: join(dir, "albero"),
        SPAZZATA_REGISTRO: via.oggi,
        ...(ieri ? { SPAZZATA_PRIMA: via.ieri } : { SPAZZATA_PRIMA: "" }),
      },
    });
    return { rc: r.status, out: `${r.stdout}${r.stderr}` };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("lo strumento vero: tolta la controprova, esce 1 e lo dice a parole", () => {
  const r = spazzata({ ieri: [voce()], oggi: [voce({ controprova: undefined })] });
  assert.equal(r.rc, 1, `atteso rosso, avuto ${r.rc}:\n${r.out.slice(0, 800)}`);
  assert.match(r.out, /PROMESSA\/E RITIRATA\/E IN SILENZIO/);
  assert.match(r.out, /finta/);
});

test("lo strumento vero: promessa mantenuta, nessuna accusa e uscita pulita", () => {
  const r = spazzata({ ieri: [voce()], oggi: [voce()] });
  assert.equal(r.rc, 0, `atteso verde, avuto ${r.rc}:\n${r.out.slice(0, 800)}`);
  assert.ok(!/RITIRATA/.test(r.out), "un'accusa a chi ha mantenuto la promessa spegne la guardia");
});

// ── ④ Cieco non è verde ─────────────────────────────────────────────────────

test("senza il registro di ieri il confronto non si è fatto: uscita 2 e ⚪ dichiarato, non 0", () => {
  const r = spazzata({ ieri: null, oggi: [voce()] });
  assert.equal(r.rc, 2, `un confronto mancato non è un verde:\n${r.out.slice(0, 800)}`);
  assert.match(r.out, /non ho guardato/);
});

// ── Il registro VERO: oggi nessuna promessa è stata ritirata ────────────────

test("sul registro vero di casa nessuna promessa risulta ritirata dall'ultimo commit", () => {
  const r = spawnSync("node", [SPAZZATA, "--json"], { cwd: REPO, encoding: "utf8" });
  const j = JSON.parse(r.stdout);
  assert.deepEqual(j.promesse_ritirate, [], `promesse ritirate: ${JSON.stringify(j.promesse_ritirate)}`);
  assert.deepEqual(j.non_ho_guardato, [], "e il confronto col commit di ieri l'ho potuto fare davvero");
});
