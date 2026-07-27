// AR-218 — dal Worker a schermo intero si deve poter uscire (node --test, nessuna rete).
//
// Il difetto: quattro vie d'uscita, quattro rotte. La X non era renderizzata in modalità piena; il
// velo cliccabile era coperto al 100% dal pannello; il tasto Esc non esisteva in tutto pannello/src;
// e il gesto indietro del telefono non toccava gli overlay, perché aprirli non timbrava alcuna voce
// di cronologia. Sul telefono il gesto indietro È il tasto «chiudi» universale: senza, si resta
// dentro.
//
// La radice: «quale pannello è aperto» non era modellato come stato di NAVIGAZIONE. Qui si eseguono
// le due decisioni vere di pannello/src/lib/overlay-chiusura.ts — quale overlay chiude Esc, e quando
// il gesto indietro sta chiudendo il Worker.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const LIB = join(QUI, "..", "..", "pannello/src/lib/overlay-chiusura.ts");
const { overlayInCima, eTastoChiudi, deveChiudereOverlay } = await import(LIB);

// ── il tasto ─────────────────────────────────────────────────────────────────
test("il caso che ha rotto: Escape deve essere riconosciuto", () => {
  assert.equal(eTastoChiudi("Escape"), true);
  assert.equal(eTastoChiudi("Esc"), true, "il nome che manda ancora qualche browser vecchio");
});

test("gli altri tasti non chiudono niente", () => {
  for (const k of ["Enter", "a", " ", "ArrowLeft", "escape", "", null, undefined]) {
    assert.equal(eTastoChiudi(k), false, `«${k}» non deve chiudere`);
  }
});

// ── quale overlay chiude ─────────────────────────────────────────────────────
test("il caso che ha rotto: col Worker aperto, Esc chiude il Worker", () => {
  assert.equal(overlayInCima({ worker: true }), "worker");
});

test("una cosa per volta, dalla cima: il cassetto prima del Worker", () => {
  // Se Esc chiudesse tutto insieme si perderebbe il posto dov'eri: il primo Esc richiude il
  // cassetto conversazioni, il secondo il Worker. È l'ordine che si aspetta chiunque usi un browser.
  assert.equal(overlayInCima({ workerConv: true, worker: true, menu: true }), "workerConv");
  assert.equal(overlayInCima({ worker: true, menu: true }), "worker");
  assert.equal(overlayInCima({ menu: true }), "menu");
});

test("se non c'è niente aperto, Esc non fa niente", () => {
  assert.equal(overlayInCima({}), null);
  assert.equal(overlayInCima({ worker: false, menu: false, workerConv: false }), null);
  assert.equal(overlayInCima(null), null, "stato non ancora pronto: nessuna esplosione");
});

// ── il gesto indietro ────────────────────────────────────────────────────────
test("il caso che ha rotto: tornare a una voce senza marcatore chiude il Worker", () => {
  // Aprire il Worker timbra `overlay: "worker"`. Tornare a una voce che non ce l'ha significa
  // «sto uscendo»: prima si chiude, poi si applica la vista — altrimenti il Worker resta sopra a
  // coprire la pagina a cui sei appena tornato, che è esattamente il difetto.
  assert.equal(deveChiudereOverlay({ vista: "plancia" }), true);
});

test("tornare a una voce CHE HA il marcatore lascia il Worker aperto", () => {
  assert.equal(deveChiudereOverlay({ vista: "assistente", overlay: "worker" }), false);
});

test("nel dubbio si chiude: restare bloccati è il difetto", () => {
  assert.equal(deveChiudereOverlay(null), true, "voce senza stato");
  assert.equal(deveChiudereOverlay(undefined), true);
  assert.equal(deveChiudereOverlay("stringa"), true, "stato di un'altra pagina");
  assert.equal(deveChiudereOverlay({ overlay: "altro" }), true, "un altro overlay, non il nostro");
});

test("gli internals di Next nello state non confondono la decisione", () => {
  // Next tiene i suoi dati di routing dentro history.state: il marcatore ci convive, non lo sostituisce.
  const st = { __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: {}, vista: "assistente", overlay: "worker" };
  assert.equal(deveChiudereOverlay(st), false);
});
