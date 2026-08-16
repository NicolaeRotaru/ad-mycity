// AR-202 — «Nessuno misura quanto rende un giro: si stima quanto costa, il valore non si conta.»
//
// La radice: la spesa più grande dell'azienda era modellata come vincolo tecnico (token, quota,
// soglia) e mai come voce di conto economico — cioè con un numeratore E un denominatore. Per questo
// nessun organo ha mai potuto formulare la mossa più ovvia: «a business fermo, dimezza la cadenza».
// Non la sapeva formulare perché non aveva il numero.
//
// Cosa prova:
//   ① i risultati si CONTANO davvero, dalla coda: una card firmata porta la sua data di chiusura;
//   ② €/risultato esce, e con zero risultati non si divide per zero — si dice «brucia a vuoto»,
//      che è esattamente l'informazione per cui il difetto è nato;
//   ③ senza un costo dichiarato la resa è CIECA, non zero: uno zero sarebbe una bugia;
//   ④ IL PUNTO: `metabolismo.mjs`, sui dati veri, stampa la resa e non solo il consumo.
//
// NON-VACUITÀ (eseguita): togliendo il blocco `resa` da metabolismo.mjs il caso ④ diventa rosso.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { cardFirmate, resa } from "../conto-motore.mjs";

const CERVELLO = join(dirname(fileURLToPath(import.meta.url)), "..");

// ── ① I risultati esistono, scritti in chiaro, e nessuno li contava ─────────────────────────────

test("AR-202 — le card firmate si leggono dalla coda, con la data della chiusura", () => {
  const coda = [
    "### ✅ #75 — La visita del server era viva · ⏳ accodata 2026-08-13 00:15 · ✅ chiusa 2026-08-13 20:45",
    "### ✅ #73 — Chiusa la falla dei sensori. FATTO 2026-08-11 17:05, col tuo ok in chat",
    "### 🔴 #62 — Questa aspetta ancora la firma",
    "un paragrafo qualunque",
  ].join("\n");
  const c = cardFirmate(coda);
  assert.equal(c.length, 2, "le card ancora aperte non sono risultati");
  assert.equal(c[0].numero, "75");
  assert.equal(c[0].chiusa_il, "2026-08-13");
  assert.equal(c[1].chiusa_il, "2026-08-11", "riconosce anche la forma «FATTO <data>»");
});

// ── ② e ③ Il numero, e la sua onestà ────────────────────────────────────────────────────────────

test("AR-202 — euro per risultato: il numero che non esisteva", () => {
  const r = resa({
    risultati: [{ chiusa_il: "2026-08-10" }, { chiusa_il: "2026-08-12" }, { chiusa_il: "2026-05-01" }],
    oggi: "2026-08-15",
    finestraGiorni: 30,
    burnMensileEur: 200,
  });
  assert.equal(r.risultati, 2, "quella di maggio è fuori finestra");
  assert.equal(r.costo_finestra_eur, 200);
  assert.equal(r.eur_per_risultato, 100);
  assert.equal(r.verdetto, "rende");
});

test("AR-202 — zero risultati non è una divisione per zero: è «brucia a vuoto», ed è il punto", () => {
  const r = resa({ risultati: [], oggi: "2026-08-15", finestraGiorni: 30, burnMensileEur: 200 });
  assert.equal(r.verdetto, "brucia-a-vuoto");
  assert.equal(r.eur_per_risultato, null);
  assert.match(r.motivo, /200 € spesi/, "il costo bruciato va detto in euro, non nascosto");
});

test("AR-202 — senza costo dichiarato la resa è CIECA, mai zero", () => {
  const r = resa({ risultati: [{ chiusa_il: "2026-08-14" }], oggi: "2026-08-15", burnMensileEur: null });
  assert.equal(r.verdetto, "cieco");
  assert.equal(r.costo_finestra_eur, null);
  assert.match(r.motivo, /uno zero sarebbe una bugia/);
});

test("AR-202 — una card chiusa senza data non si conta e non sparisce: si dichiara", () => {
  const r = resa({ risultati: [{ chiusa_il: null }, { chiusa_il: "2026-08-14" }], oggi: "2026-08-15", burnMensileEur: 200 });
  assert.equal(r.risultati, 1);
  assert.equal(r.risultati_senza_data, 1);
});

// ── ④ IL PUNTO: il metabolismo dice quanto rende, non solo quanto consuma ───────────────────────

test("AR-202 — IL PUNTO: metabolismo.mjs sui dati veri stampa la resa con la sua fonte", () => {
  const r = spawnSync(process.execPath, [join(CERVELLO, "metabolismo.mjs"), "--json"], { encoding: "utf8", timeout: 60_000 });
  assert.ok(r.stdout, `metabolismo non ha prodotto niente: ${r.stderr}`);
  const j = JSON.parse(r.stdout);
  assert.ok(j.resa, "il blocco resa non c'è: il metabolismo sa ancora dire solo quanto brucia");
  assert.ok(["rende", "brucia-a-vuoto", "cieco"].includes(j.resa.verdetto), `verdetto inatteso: ${j.resa.verdetto}`);
  assert.ok(typeof j.resa.risultati === "number", "i risultati devono essere un NUMERO contato, non un'opinione");
  if (j.resa.verdetto !== "cieco") assert.ok(j.resa.fonte_costo, "nessun numero senza fonte");
  // AR-203 viaggia con lui: la qualità della misura sta accanto al numero che ci poggia sopra.
  assert.ok(j.qualita_misura, "senza la qualità della misura, la resa poggia su un pavimento e non si vede");
});
