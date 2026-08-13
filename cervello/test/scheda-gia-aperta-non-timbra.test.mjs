// AR-245 — ritoccare la scheda su cui sei già non deve costare un gradino di cronologia.
//
// Il difetto: ogni tocco su una scheda chiamava `vaiSub`, che timbrava sempre. Toccare due volte la
// stessa scheda — col pollice succede di continuo — lasciava una voce identica alla precedente, e poi
// l'indietro la consumava senza cambiare niente a video: sembra che il tasto sia rotto.
//
// La guardia esisteva già per il cambio di AREA, ma viveva dentro page.tsx invece che nell'atto:
// le schede sono entrate in cronologia dopo e non potevano ereditarla. Adesso sta dentro `vaiSub`,
// cioè al confine, e vale per tutti i chiamanti — Azioni, Lavori, Memoria, Storico, Macchina —
// senza doverli toccare uno per uno. Questa prova esegue la funzione vera, non cerca una riga.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { voceSubDaTimbrare } = await import(join(REPO, "pannello/src/lib/nav.ts"));

// La cronologia com'è davvero: l'indietro sposta l'indice, non cancella.
function cronologia(primo = { vista: "azioni", sub: "mosse" }) {
  const voci = [primo];
  let i = 0;
  return {
    get stato() {
      return voci[i];
    },
    get posizione() {
      return i;
    },
    tocca(vista, sub) {
      const voce = voceSubDaTimbrare(voci[i], vista, sub); // è ciò che fa vaiSub
      if (voce) {
        voci.splice(i + 1);
        voci.push(voce);
        i = voci.length - 1;
      }
    },
    back() {
      if (i > 0) i--;
      return voci[i];
    },
  };
}

test("il caso di Nicola: tocchi tre volte la scheda su cui sei già, e l'indietro funziona al primo colpo", () => {
  const h = cronologia({ vista: "azioni", sub: "mosse" });
  h.tocca("azioni", "approvare"); // cambio vero: un gradino
  h.tocca("azioni", "approvare"); // ritocco
  h.tocca("azioni", "approvare"); // e un altro
  assert.equal(h.posizione, 1, "tre tocchi sulla stessa scheda = un solo gradino");
  const dopo = h.back();
  assert.equal(dopo.sub, "mosse", "il primo indietro torna alla scheda di prima, non a se stessa");
});

test("niente da timbrare quando non cambia niente", () => {
  assert.equal(voceSubDaTimbrare({ vista: "azioni", sub: "approvare" }, "azioni", "approvare"), null);
});

test("una scheda diversa si timbra sempre", () => {
  const v = voceSubDaTimbrare({ vista: "azioni", sub: "mosse" }, "azioni", "approvare");
  assert.equal(v?.sub, "approvare");
  assert.equal(v?.vista, "azioni");
});

test("stessa scheda ma altra area: si timbra (è un salto vero)", () => {
  // «approvare» esiste in Azioni; arrivarci da un'altra area è un movimento, non un ritocco.
  const v = voceSubDaTimbrare({ vista: "plancia", sub: "approvare" }, "azioni", "approvare");
  assert.notEqual(v, null);
  assert.equal(v?.vista, "azioni");
});

test("prima voce senza stato: si timbra, altrimenti l'indietro non conosce la scheda", () => {
  for (const st of [null, undefined, "stringa", 7]) {
    const v = voceSubDaTimbrare(st, "memoria", "archivio");
    assert.equal(v?.sub, "archivio", `stato: ${JSON.stringify(st)}`);
  }
});

test("gli internals di Next non si perdono nel timbro della scheda", () => {
  const st = { __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: { a: 1 }, vista: "azioni", sub: "mosse" };
  const v = voceSubDaTimbrare(st, "azioni", "approvare");
  assert.equal(v.__NA, true, "cancellarli fa ricaricare la pagina al primo indietro");
  assert.deepEqual(v.__PRIVATE_NEXTJS_INTERNALS_TREE, { a: 1 });
});

test("la guardia sta nell'atto, non nei sei chiamanti", () => {
  // Il punto del fix: chi aggiungerà la settima scheda eredita la regola senza saperlo.
  const nav = readFileSync(join(REPO, "pannello/src/lib/nav.ts"), "utf8");
  const corpo = nav.slice(nav.indexOf("export function vaiSub("), nav.indexOf("export function voceSubDaTimbrare("));
  assert.match(corpo, /voceSubDaTimbrare\(/, "vaiSub deve chiedere il permesso prima di timbrare");
  assert.doesNotMatch(corpo, /pushState\(\s*\{/, "e non deve più timbrare a occhi chiusi");
});
