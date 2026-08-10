// AR-566 — il voto della macchina su sé stessa: chiudo almeno quanto apro?
//
// Approvato da Nicola il 10/8 («ok tasso di chiusura»), dopo il conto della radiografia della catena
// di lavoro: luglio 455 nati e 244 chiusi (0,54); agosto, in dieci giorni, 90 nati e 14 chiusi (0,16).
// La macchina trova circa tre volte più in fretta di quanto ripara, e il divario si allarga.
//
// Nicola lo aveva detto prima di me: «so già che dopo questo upgrade ti chiederò di rianalizzare e
// troverai un sacco di errori». Aveva ragione, e la causa è questo rapporto — non la bravura di chi
// cerca. Finché è sotto 1, ogni radiografia allunga la lista invece di accorciarla.
//
// Qui si esegue la funzione VERA, quella che decide se il giro si ferma.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const { contaMese, verdetto, perMese, meseDi, OBIETTIVO, MINIMO_CAMPIONE } = await import(join(QUI, "..", "tasso-chiusura.mjs"));

/** n difetti nati nel mese, di cui `chiusi` chiusi nello stesso mese. */
const cantiere = (mese, nati, chiusi) =>
  Array.from({ length: nati }, (_, i) => ({
    id: `AR-${i}`,
    nato: `${mese}-0${(i % 9) + 1} 10:00`,
    stato: i < chiusi ? "chiuso" : "aperto",
    ...(i < chiusi ? { chiuso_il: `${mese}-0${(i % 9) + 1} 18:00` } : {}),
  }));

// ── Il caso che ha rotto ─────────────────────────────────────────────────────
test("il caso che ha rotto: agosto 2026 — 90 aperti e 14 chiusi è sotto obiettivo, e il giro si ferma", () => {
  const v = verdetto({ nati: 90, chiusi: 14 });
  assert.equal(v.esito, "sotto");
  assert.equal(v.tasso, 0.16);
  assert.match(v.detto, /ne apro più di quanti ne chiudo/);
});

test("nemmeno luglio passava: 455 aperti e 244 chiusi è 0,54, non 1", () => {
  const v = verdetto({ nati: 455, chiusi: 244 });
  assert.equal(v.esito, "sotto");
  assert.equal(v.tasso, 0.54);
});

// ── Quando invece va bene ────────────────────────────────────────────────────
test("chiudere quanto si apre basta: il pareggio è l'obiettivo, non il superamento", () => {
  const v = verdetto({ nati: 20, chiusi: 20 });
  assert.equal(v.esito, "ok");
  assert.equal(v.tasso, 1);
  assert.equal(OBIETTIVO, 1, "l'obiettivo dichiarato è 1: se cambia, questo test lo deve dire");
});

test("smaltire l'arretrato viene premiato: si può chiudere più di quanto si apre", () => {
  const v = verdetto({ nati: 10, chiusi: 25 });
  assert.equal(v.esito, "ok");
  assert.equal(v.tasso, 2.5);
});

// ── Il campione magro non è una bocciatura ───────────────────────────────────
test("a inizio mese con pochi difetti il verdetto è ⚪, non rosso: 1 nato e 0 chiusi non ferma niente", () => {
  const v = verdetto({ nati: 1, chiusi: 0 });
  assert.equal(v.esito, "piccolo", "senza questa regola il freno scatterebbe ogni primo del mese");
  assert.equal(v.tasso, null, "un rapporto su un campione di 1 non è un numero da mostrare");
});

test("appena il campione basta, il verdetto torna a poter essere rosso", () => {
  assert.equal(verdetto({ nati: MINIMO_CAMPIONE - 1, chiusi: 0 }).esito, "piccolo");
  assert.equal(verdetto({ nati: MINIMO_CAMPIONE, chiusi: 0 }).esito, "sotto");
});

// ── Il conto sul cantiere ────────────────────────────────────────────────────
test("conta i nati nel mese e le chiusure AVVENUTE nel mese", () => {
  assert.deepEqual(contaMese(cantiere("2026-08", 9, 3), "2026-08"), { nati: 9, chiusi: 3 });
});

test("chiudere un difetto VECCHIO conta nel mese in cui lo chiudi: è il lavoro che il voto deve premiare", () => {
  const d = [
    { id: "A", nato: "2026-07-01", stato: "chiuso", chiuso_il: "2026-08-05 09:00" }, // arretrato smaltito
    { id: "B", nato: "2026-08-02", stato: "aperto" },
  ];
  assert.deepEqual(contaMese(d, "2026-08"), { nati: 1, chiusi: 1 }, "il chiuso di luglio conta come chiusura di agosto");
  assert.deepEqual(contaMese(d, "2026-07"), { nati: 1, chiusi: 0 }, "e NON come chiusura di luglio");
});

test("un difetto senza data di nascita non viene contato al posto sbagliato", () => {
  const d = [{ id: "A", stato: "aperto" }, { id: "B", nato: "", stato: "aperto" }, { id: "C", nato: "2026-08-01", stato: "aperto" }];
  assert.deepEqual(contaMese(d, "2026-08"), { nati: 1, chiusi: 0 });
});

test("un difetto marcato chiuso ma senza data di chiusura non gonfia il numeratore", () => {
  const d = [{ id: "A", nato: "2026-08-01", stato: "chiuso" }];
  assert.deepEqual(contaMese(d, "2026-08"), { nati: 1, chiusi: 0 }, "senza `chiuso_il` non so QUANDO: non lo accredito");
});

test("il mese si legge sia da «AAAA-MM-GG HH:MM» sia da «AAAA-MM-GG», e da nient'altro", () => {
  assert.equal(meseDi("2026-08-10 23:20"), "2026-08");
  assert.equal(meseDi("2026-08-10"), "2026-08");
  assert.equal(meseDi("10/08/2026"), null, "un formato che non conosco è null, non un mese inventato");
  assert.equal(meseDi(undefined), null);
});

// ── Lo storico ───────────────────────────────────────────────────────────────
test("lo storico mette i mesi in ordine e calcola il rapporto di ognuno", () => {
  const d = [...cantiere("2026-07", 9, 6), ...cantiere("2026-08", 9, 1)];
  const s = perMese(d);
  assert.deepEqual(s.map((x) => x.mese), ["2026-07", "2026-08"]);
  assert.equal(s[0].tasso, +(6 / 9).toFixed(2));
  assert.equal(s[1].tasso, +(1 / 9).toFixed(2));
});

// ── Sul cantiere VERO ────────────────────────────────────────────────────────
test("sul cantiere vero: il mese in corso è misurabile e il verdetto è uno dei tre previsti", async () => {
  const { readFileSync } = await import("node:fs");
  const c = JSON.parse(readFileSync(join(QUI, "..", "..", "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), "utf8"));
  const s = perMese(c.difetti);
  assert.ok(s.length >= 2, "servono almeno due mesi di storia, altrimenti non ho misurato una tendenza");
  const luglio = s.find((x) => x.mese === "2026-07");
  assert.ok(luglio && luglio.nati > 100, `luglio deve avere i suoi difetti veri, trovati ${luglio?.nati}`);
  assert.ok(luglio.tasso < 1, `anche il mese migliore era sotto 1 (${luglio.tasso}): è il fatto che ha motivato questa regola`);
  for (const m of s) {
    const v = verdetto(m);
    assert.ok(["ok", "sotto", "piccolo"].includes(v.esito), `verdetto inatteso per ${m.mese}: ${v.esito}`);
  }
});
