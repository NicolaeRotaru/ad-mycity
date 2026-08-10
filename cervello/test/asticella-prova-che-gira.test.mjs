// AR-564 — l'asticella: un difetto grave che NASCE adesso porta una prova che gira, non una parola.
//
// Approvata da Nicola il 10/8 («ok asticella»), dopo il conto della radiografia della catena di
// lavoro: 193 difetti su 552 avevano per prova un file+pattern. Il caso vero è AR-128, «non esiste
// nessun sensore per le contestazioni carta», la cui prova era che la parola «chargeback»
// comparisse in un documento. Scriverla bastava a chiudere il difetto, e il sensore non c'era.
//
// Il primo caso qui sotto è il metro: prima di questo cancello quella scheda entrava senza che
// nessuno dicesse niente. Qui si esegue la funzione VERA.
//
// La regola ha tre uscite oneste, e sono tutte provate: un comando che gira · `tipo: "umano"`
// dichiarato · gravità `minore`. E una regola in più che vale ovunque in questa macchina: se non so
// quali schede sono nate adesso, non accuso nessuno — cieco non è rosso, come non è verde.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const { proveDeboliNate, difettiNati } = await import(join(QUI, "..", "cancello-lotto.mjs"));

const pattern = (id, gravita) => ({ id, gravita, verifica: { file: "cervello/x.mjs", pattern: "parola", presente: true } });
const comando = (id, gravita) => ({ id, gravita, verifica: { comando: "node cervello/gate-veri.mjs" } });

// ── Il caso che ha rotto ─────────────────────────────────────────────────────
test("il caso che ha rotto: AR-128 nasce grave con «cerca chargeback in un file» → non entra", () => {
  const d = {
    id: "AR-128",
    gravita: "grave",
    verifica: { file: "cervello/sentinelle.md", pattern: "dispute|chargeback|contestazione carta", presente: true },
  };
  const fermati = proveDeboliNate([d], ["AR-128"]);
  assert.equal(fermati.length, 1, "una scheda grave nata con una prova a pattern va fermata");
  assert.equal(fermati[0].id, "AR-128");
  assert.match(fermati[0].forma, /sentinelle\.md/);
});

test("vale su bloccante come su grave, e sui sinonimi di gravità usati nel cantiere", () => {
  for (const g of ["grave", "bloccante", "critica", "alta", "alto"]) {
    assert.equal(proveDeboliNate([pattern("AR-900", g)], ["AR-900"]).length, 1, `gravità «${g}» deve passare dal cancello`);
  }
});

test("una scheda grave che nasce SENZA nessuna prova è la forma più debole di tutte", () => {
  assert.equal(proveDeboliNate([{ id: "AR-901", gravita: "grave" }], ["AR-901"]).length, 1);
  assert.equal(proveDeboliNate([{ id: "AR-902", gravita: "grave", verifica: null }], ["AR-902"]).length, 1);
});

// ── Le tre uscite oneste ─────────────────────────────────────────────────────
test("uscita 1: una prova che GIRA entra", () => {
  assert.equal(proveDeboliNate([comando("AR-903", "bloccante")], ["AR-903"]).length, 0);
});

test("uscita 2: `tipo: umano` dichiarato entra — è onesto, e si vede", () => {
  const d = { id: "AR-904", gravita: "grave", verifica: { tipo: "umano", nota: "lo decide Nicola" } };
  assert.equal(proveDeboliNate([d], ["AR-904"]).length, 0);
});

test("uscita 3: sui `minore` la prova a pattern resta ammessa", () => {
  assert.equal(proveDeboliNate([pattern("AR-905", "minore")], ["AR-905"]).length, 0);
  assert.equal(proveDeboliNate([pattern("AR-906", "medio")], ["AR-906"]).length, 0);
});

// ── Il debito vecchio non viene toccato ──────────────────────────────────────
test("una scheda VECCHIA con prova a pattern non viene fermata: quella ha il suo tetto che scende", () => {
  const vecchia = pattern("AR-128", "grave");
  const nuova = pattern("AR-999", "grave");
  const fermati = proveDeboliNate([vecchia, nuova], ["AR-999"]); // solo AR-999 è nata adesso
  assert.deepEqual(
    fermati.map((x) => x.id),
    ["AR-999"],
    "il cancello guarda la porta d'ingresso, non l'archivio",
  );
});

// ── Cieco non è rosso ────────────────────────────────────────────────────────
test("se non so chi è nato adesso non accuso nessuno", () => {
  assert.deepEqual(proveDeboliNate([pattern("AR-907", "grave")], null), [], "senza confronto non c'è imputato");
  assert.deepEqual(proveDeboliNate([pattern("AR-908", "grave")], undefined), []);
});

// ── Chi è «nato» ─────────────────────────────────────────────────────────────
test("nato = c'è adesso e non c'era prima; una prova cambiata su una scheda vecchia non è una nascita", () => {
  const prima = { difetti: [{ id: "AR-1", verifica: { file: "a", pattern: "x" } }] };
  const ora = {
    difetti: [
      { id: "AR-1", verifica: { file: "a", pattern: "CAMBIATO" } }, // toccata, non nata
      { id: "AR-2", verifica: { comando: "node cervello/x.mjs" } }, // nata
    ],
  };
  assert.deepEqual(difettiNati(ora, prima), ["AR-2"]);
});

test("senza il cantiere di prima, `difettiNati` dice «non lo so» (null), non «nessuno» ([])", () => {
  // La differenza conta: [] farebbe passare il cancello dichiarando di aver misurato.
  assert.equal(difettiNati({ difetti: [{ id: "AR-3" }] }, null), null);
});

// ── Sul cantiere VERO ────────────────────────────────────────────────────────
test("sul cantiere vero: nessuna scheda grave aperta oggi nascerebbe con una prova debole", async () => {
  const { readFileSync } = await import("node:fs");
  const c = JSON.parse(readFileSync(join(QUI, "..", "..", "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), "utf8"));
  const grave = new Set(["grave", "bloccante", "critica", "alta", "alto"]);
  // Le schede nate nell'ultimo lotto (AR-571…): sono quelle a cui la regola si applica per prima.
  const ultime = c.difetti.filter((d) => /^AR-5(6[2-9]|[7-9]\d)$/.test(d.id || ""));
  assert.ok(ultime.length >= 6, `attese almeno 6 schede recenti, trovate ${ultime.length}`);
  const fermate = proveDeboliNate(ultime, ultime.map((d) => d.id));
  assert.deepEqual(
    fermate.map((x) => `${x.id} (${x.forma})`),
    [],
    `queste schede non rispettano l'asticella che questo lotto introduce: ${JSON.stringify(fermate)}`,
  );
  assert.ok(
    ultime.some((d) => grave.has(String(d.gravita).toLowerCase())),
    "il campione deve contenere almeno una scheda grave, altrimenti non ho provato niente",
  );
});
