// AR-191 — «Le cose da firmare invecchiano in coda e nessuno le risollecita: la firma che non
// arriva non fa rumore.»
//
// La radice, al quinto perché: la macchina misura ciò che PRODUCE (card accodate) e non ciò che
// CONCLUDE (card firmate ed eseguite). E l'anti-spam — una notifica sola per card — era diventato
// anti-memoria: la card squillava una volta e poi taceva per sempre, anche dopo due settimane.
//
// Cosa prova:
//   ① l'attesa si misura in ore, per card, e la soglia dipende dal COLORE (48h rosse, 5g gialle);
//   ② IL PUNTO: il risollecito si RIPETE — ma non più spesso della soglia, o l'anti-spam tornerebbe
//      a essere il problema dall'altra parte;
//   ③ oltre i sette giorni la card non si risollecita e basta: sale di grado (escalation);
//   ④ la coda ha un numero di salute: quanto ci mette una firma ad arrivare;
//   ⑤ una card senza data non è «fresca»: è un buco, e si dichiara.
//
// NON-VACUITÀ (eseguita): togliendo da `invecchiamentoCoda` il confronto con `ultimo_sollecito`
// (cioè lasciando `daRisollecitare = oreAttesa >= soglia`), il caso ② diventa rosso.

import { test } from "node:test";
import assert from "node:assert/strict";
import { ORE_ESCALATION, ORE_RISOLLECITO, invecchiamentoCoda } from "../presa-in-carico.mjs";
import { componiMessaggio } from "../notifica-approvazioni.mjs";

const ORA = 3_600_000;
const ADESSO = Date.UTC(2026, 7, 15, 12, 0);
const quandoOreFa = (h) => new Date(ADESSO - h * ORA).toISOString().slice(0, 16).replace("T", " ");

test("AR-191 — una rossa ferma da 60 ore va risollecitata; una gialla dello stesso tempo no", () => {
  const v = invecchiamentoCoda(
    [
      { id: "r", colore: "🔴", data: quandoOreFa(60) },
      { id: "g", colore: "🟡", data: quandoOreFa(60) },
    ],
    ADESSO
  );
  const ids = v.da_risollecitare.map((x) => x.id);
  assert.deepEqual(ids, ["r"], `soglie: rossa ${ORE_RISOLLECITO["🔴"]}h, gialla ${ORE_RISOLLECITO["🟡"]}h`);
});

test("AR-191 — IL PUNTO: il risollecito si RIPETE (prima squillava una volta e taceva per sempre)", () => {
  const v = invecchiamentoCoda(
    [{ id: "r", colore: "🔴", data: quandoOreFa(300), ultimo_sollecito: quandoOreFa(72) }],
    ADESSO
  );
  assert.equal(v.da_risollecitare.length, 1, "72 ore dall'ultimo squillo su una rossa: deve tornare");
});

test("AR-191 — ma non più spesso della soglia: l'anti-spam non deve tornare a essere il problema", () => {
  const v = invecchiamentoCoda(
    [{ id: "r", colore: "🔴", data: quandoOreFa(300), ultimo_sollecito: quandoOreFa(3) }],
    ADESSO
  );
  assert.equal(v.da_risollecitare.length, 0, "sollecitata tre ore fa: risollecitarla adesso sarebbe rumore");
});

test("AR-191 — oltre i sette giorni la card sale di grado", () => {
  const v = invecchiamentoCoda([{ id: "x", colore: "🟡", data: quandoOreFa(ORE_ESCALATION + 1) }], ADESSO);
  assert.equal(v.in_escalation.length, 1);
});

test("AR-191 — il numero di salute della coda: mediana e massimo dell'attesa", () => {
  const v = invecchiamentoCoda(
    [
      { id: "a", colore: "🟡", data: quandoOreFa(10) },
      { id: "b", colore: "🟡", data: quandoOreFa(50) },
      { id: "c", colore: "🟡", data: quandoOreFa(400) },
    ],
    ADESSO
  );
  assert.equal(v.ore_attesa_mediana, 50);
  assert.equal(v.ore_attesa_massima, 400);
  assert.equal(v.in_coda, 3);
});

test("AR-191 — una card senza data non è fresca: è un buco, e si dichiara", () => {
  const v = invecchiamentoCoda([{ id: "z", colore: "🔴" }], ADESSO);
  assert.equal(v.senza_data, 1);
  assert.equal(v.da_risollecitare.length, 0, "non posso risollecitare quello di cui non so l'età: dirlo è meglio che indovinare");
  assert.match(v.righe[0].motivo, /senza data/);
});

test("AR-191 — il messaggio a Nicola porta le ferme, le più vecchie prima, e il tempo medio d'attesa", () => {
  const msg = componiMessaggio(
    [{ colore: "🔴", numero: "1", titolo: "Cosa nuova", reparto: "tech", cosa_cambia: "" }],
    5,
    [
      { id: "b", colore: "🟡", titolo: "Ferma da poco", ore_attesa: 130, escalation: false },
      { id: "a", colore: "🔴", titolo: "Ferma da secoli", ore_attesa: 400, escalation: true },
    ],
    { ore_attesa_mediana: 130, ore_attesa_massima: 400 }
  );
  assert.match(msg, /Ferma da secoli/, "le stantie non compaiono nel messaggio: continuerebbero a non fare rumore");
  assert.match(msg, /‼️/, "quella oltre i sette giorni deve distinguersi");
  assert.match(msg, /in media una card aspetta/, "il numero di salute della coda va detto a Nicola, non solo scritto in un JSON");
});
