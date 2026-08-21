#!/usr/bin/env node
// UNA PROVA CHE NON FINISCE NON È UNA PROVA PASSATA.
//
// LA STORIA (21/8). Il banco del cervello lanciava ogni file con `spawn` e nessun tetto di tempo.
// Finché tutte finiscono non si vede niente; il giorno in cui una si pianta, si pianta la SUITE
// INTERA — e la visita della salute non può nemmeno dire quale, perché non riceve niente: scrive
// «il controllo non è partito: oltre 300s», che è un 🔧 guasto e non manda da nessuna parte.
// Misurata quel giorno, la suite ci metteva 822 secondi contro un tetto di 300: la macchina aveva
// smesso di potersi provare, ed è la rete di sicurezza sotto ogni altra riparazione.
//
// COSA PROVA QUESTO FILE:
//   ① il verdetto di una prova piantata è ROSSO — non «non eseguita», non un verde silenzioso;
//   ② nomina il file e il tempo, perché «qualcosa si è piantato» non è una diagnosi;
//   ③ il banco dichiara un tetto per prova, e sta sotto il tetto della suite (600s) anche se due
//      prove si piantano insieme: un freno che sfonda il freno più grande non è un freno.
//
// LA PARTE E2E, misurata e non deducibile da qui: messo un file che aspetta per sempre dentro
// `cervello/test/` e lanciata la suite vera con `MYCITY_TEST_TETTO_MS=8000`, la corsa è FINITA
// (273s) invece di restare appesa, e ogni file oltre il tetto è comparso nel referto per nome —
// «✗ … si è piantata: nessun esito entro 8s». Non è automatizzata qui apposta: per riprodurla
// servirebbe piantare la suite dentro la suite.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { verdettoPiantato } = await import(join(REPO, "cervello/test-cervello.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

prova("una prova piantata è rossa, non «non eseguita» e non verde", () => {
  const v = verdettoPiantato("cervello/test/finta.test.mjs", 180_000);
  assert.equal(v.esito, "rosso", "se non è rossa, una prova che si pianta passa per buona");
  assert.equal(v.falliti, 1);
  assert.equal(v.passati, null, "non ha passato niente: dichiarare zero passati sarebbe già una misura");
});

prova("e dice QUALE file e per quanto: «qualcosa si è piantato» non è una diagnosi", () => {
  const v = verdettoPiantato("cervello/test/finta.test.mjs", 180_000);
  assert.match(v.rosse[0], /finta\.test\.mjs/, "il file va nominato");
  assert.match(v.rosse[0], /180s/, "il tempo va detto: distingue «lenta» da «piantata»");
});

prova("il tetto per prova sta sotto il tetto della suite anche con due prove piantate insieme", () => {
  const perProva = Number(process.env.MYCITY_TEST_TETTO_MS || 180_000);
  const tettoSuite = 600_000; // quello che la visita concede a test-cervello.mjs
  assert.ok(perProva > 66_000, `${perProva}ms è sotto la prova più lenta che serve davvero (66s): falsi rossi`);
  assert.ok(perProva * 2 < tettoSuite, `due prove piantate (${perProva * 2}ms) sfondano il tetto della suite`);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
