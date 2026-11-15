// Il referto porta la sua misura (officina minima del 15/11, pezzo 6, regola R-H): valida-referto è rosso se a
// referto finito mancano «conto.subagenti» o «costo_usd», se i subagenti superano il tetto della scheda, o se un grave
// è «riparato» con una rimessa raccontata a mano invece della prova che cade togliendo la correzione.
// R13 non aveva un costo scritto e quello di R14 era stimato a mano: il preventivo dell'onda dopo non aveva base.
import { test } from "node:test";
import assert from "node:assert/strict";
import { regoleReferto, TETTO_SUBAGENTI } from "../riparazione-sessioni.mjs";
import { TETTI_FRENO } from "../riparazione/freno-subagenti.mjs";

const scheda = (gravita) => [{ id: "R20-001", chiave: "k|1", gravita, file: ["lib/a.ts"] }];
const riparata = (comando) => ({ id: "R20-001", chiave: "k|1", esito: "riparato", commit: "abcdef1", file_toccati: ["lib/a.ts"], prova_comando: "npx vitest run x", prova_tipo: "comando", prova_eseguita: true,
  rimessa: { esito: "regge", uscita: 0, comando }, copre_tutta_la_voce: true, verificato_da: "prova-rimessa" });
const referto = (extra = {}, voce = riparata("node cervello/prova-rimessa.mjs --file lib/a.ts")) => JSON.stringify({ sessione: "R20", aggiornato: "2026-11-15 07:00", finita: true, testa: "abcdef1", verifica: { esito: "verde", testa: "abcdef1" }, voci: [voce], ...extra });
const rossi = (testo, gravita = "minore", misura = true) => regoleReferto(testo, { nome: "R20", voci: scheda(gravita), misura }).rossi.join("\n");

test("AR-1180 · senza conto.subagenti o senza costo_usd il referto finito è rosso", () => {
  const t = rossi(referto());
  assert.match(t, /manca «conto\.subagenti»/);
  assert.match(t, /manca «costo_usd», letto con get_session/);
  const ok = rossi(referto({ conto: { subagenti: 5 }, costo_usd: 21.4 }));
  assert.doesNotMatch(ok, /conto\.subagenti|costo_usd|oltre il tetto/);
});

test("AR-1180 · 7 subagenti col tetto di 6 (scheda di soli minori) è rosso; con un grave nella scheda il tetto è 8", () => {
  assert.match(rossi(referto({ conto: { subagenti: 7 }, costo_usd: 30 })), /7 subagenti, oltre il tetto di 6 della scheda/);
  assert.doesNotMatch(rossi(referto({ conto: { subagenti: 7 }, costo_usd: 30 }), "grave"), /oltre il tetto/);
  assert.match(rossi(referto({ conto: { subagenti: 9 }, costo_usd: 30 }), "grave"), /9 subagenti, oltre il tetto di 8/);
});

test("AR-1180 · un grave «riparato» con la rimessa scritta a mano è rosso; con prova-rimessa.mjs no", () => {
  const aMano = referto({ conto: { subagenti: 3 }, costo_usd: 10 }, riparata("rimessa a mano: git checkout HEAD^ -- lib/a.ts -> 2 rosse; ripristino -> verde"));
  assert.match(rossi(aMano, "grave"), /un grave riparato vuole la prova che diventa rossa togliendo la correzione/);
  assert.doesNotMatch(rossi(aMano, "minore"), /vuole la prova che diventa rossa/, "per un minore resta la regola di prima");
  assert.doesNotMatch(rossi(referto({ conto: { subagenti: 3 }, costo_usd: 10 }), "grave"), /vuole la prova che diventa rossa/);
});

test("AR-1180 · applica rilegge i referti di prima senza queste regole (sono di valida-referto)", () => {
  const t = rossi(referto({ conto: { subagenti: 99 } }, riparata("a mano")), "grave", false);
  assert.doesNotMatch(t, /costo_usd|oltre il tetto|vuole la prova che diventa rossa/);
});

test("AR-1180 · i tetti del referto sono gli stessi del freno sugli agenti", () => {
  for (const [ruolo, n] of Object.entries(TETTO_SUBAGENTI)) assert.equal(TETTI_FRENO[ruolo], n, ruolo);
});
