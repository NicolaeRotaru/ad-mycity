// AR-222 / AR-242 / AR-243 — dal gesto indietro si esce da ciò che si è aperto (node --test).
//
// Tre difetti con tre titoli diversi — il menù laterale, il documento nell'Archivio, i pannelli
// sovrapposti — e una sola radice: ogni strato è un booleano in `useState` e nient'altro. Aprirlo non
// timbra nessuna voce di cronologia, quindi per il browser non è successo niente; il gestore
// `popstate` non lo conosce; e il gesto indietro invece di richiudere lo strato cambia l'AREA sotto.
// Ti ritrovi altrove col pannello ancora aperto sopra. Sul telefono l'indietro È il tasto «chiudi».
//
// Qui si eseguono le funzioni VERE di pannello/src/lib/strati.ts — la pila condivisa che sostituisce
// cinque toppe scritte a mano. Il caso che conta di più è quello di due strati impilati: un solo
// indietro deve chiuderne UNO, non tutti e non nessuno.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const { cimaDellaPila, senzaStrato, conStrato, stratoDaChiudere, voceDaTimbrare } = await import(
  join(QUI, "..", "..", "pannello/src/lib/strati.ts")
);

const s = (nome) => ({ nome, chiudi: () => {} });

// ── la pila ──────────────────────────────────────────────────────────────────
test("l'ultimo aperto è il primo a chiudersi", () => {
  const pila = conStrato(conStrato([], s("menu")), s("conversazioni"));
  assert.equal(cimaDellaPila(pila).nome, "conversazioni");
});

test("pila vuota: nessuna cima, nessuna esplosione", () => {
  assert.equal(cimaDellaPila([]), null);
  assert.equal(cimaDellaPila(null), null);
  assert.equal(cimaDellaPila(undefined), null);
});

test("chiudere uno strato in mezzo non disturba gli altri", () => {
  const pila = [s("menu"), s("archivio-cartella"), s("archivio-documento")];
  const dopo = senzaStrato(pila, "archivio-cartella");
  assert.deepEqual(dopo.map((x) => x.nome), ["menu", "archivio-documento"]);
});

test("lo stesso strato aperto due volte non lascia un fantasma in pila", () => {
  // Riapri il cassetto conversazioni in fretta: togliendo la PRIMA occorrenza resterebbe in pila
  // una voce morta che intercetta un indietro senza chiudere niente.
  const pila = [s("conversazioni"), s("menu"), s("conversazioni")];
  const dopo = senzaStrato(pila, "conversazioni");
  assert.deepEqual(dopo.map((x) => x.nome), ["conversazioni", "menu"], "esce la più recente");
});

test("riaprire lo stesso strato che è già in cima non lo duplica", () => {
  const pila = conStrato(conStrato([], s("menu")), s("menu"));
  assert.equal(pila.length, 1);
});

test("togliere uno strato che non c'è non cambia niente", () => {
  const pila = [s("menu")];
  assert.deepEqual(senzaStrato(pila, "mai-aperto").map((x) => x.nome), ["menu"]);
});

// ── il gesto indietro ────────────────────────────────────────────────────────
test("il caso che ha rotto: indietro con uno strato aperto chiude LUI, non cambia area", () => {
  const cima = s("menu");
  const daChiudere = stratoDaChiudere({ vista: "plancia" }, cima);
  assert.equal(daChiudere?.nome, "menu", "senza questo l'area sotto cambiava e il menù restava aperto");
});

test("due strati impilati: un indietro ne chiude UNO", () => {
  // Il menù aperto sopra il Worker. Tornando alla voce che porta ancora `strato: "worker"` si chiude
  // il menù e il Worker resta: il secondo indietro chiuderà lui. Un controllo generico
  // («c'è un marcatore qualsiasi?») non saprebbe distinguerli e li chiuderebbe insieme.
  const menu = s("menu");
  assert.equal(stratoDaChiudere({ strato: "worker" }, menu)?.nome, "menu");
});

test("tornare alla voce dello strato in cima NON lo chiude", () => {
  const menu = s("menu");
  assert.equal(stratoDaChiudere({ strato: "menu" }, menu), null, "siamo ancora dentro: non si chiude");
});

test("niente aperto: l'indietro fa il suo mestiere normale", () => {
  assert.equal(stratoDaChiudere({ vista: "plancia" }, null), null);
});

test("voce senza stato o stato storto: nel dubbio si chiude", () => {
  // Restare bloccati sotto un pannello è il difetto. La direzione sicura è uscire.
  for (const st of [null, undefined, "stringa", 42]) {
    assert.equal(stratoDaChiudere(st, s("menu"))?.nome, "menu", `stato: ${JSON.stringify(st)}`);
  }
});

// ── la voce di cronologia ────────────────────────────────────────────────────
test("gli internals di Next si fondono, non si sostituiscono", () => {
  // Cancellarli fa sì che al primo indietro il router non riconosca la voce e RICARICHI la pagina.
  // È il bug già documentato in lib/nav.ts: qui la cautela si ripete invece di reimpararla.
  const st = { __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: { a: 1 }, vista: "memoria" };
  const voce = voceDaTimbrare(st, "archivio-documento");
  assert.equal(voce.__NA, true);
  assert.deepEqual(voce.__PRIVATE_NEXTJS_INTERNALS_TREE, { a: 1 });
  assert.equal(voce.vista, "memoria", "la vista sotto non si perde");
  assert.equal(voce.strato, "archivio-documento");
});

test("non si timbra due volte lo stesso strato", () => {
  // Servirebbero due indietro per chiudere una cosa sola: sembra che il primo non abbia funzionato.
  assert.equal(voceDaTimbrare({ strato: "menu" }, "menu"), null);
  assert.notEqual(voceDaTimbrare({ strato: "worker" }, "menu"), null, "strato diverso: si timbra");
});

test("si timbra anche partendo da una cronologia vuota", () => {
  assert.deepEqual(voceDaTimbrare(null, "menu"), { strato: "menu" });
  assert.deepEqual(voceDaTimbrare(undefined, "menu"), { strato: "menu" });
});

// ── il cablaggio: nessuno strato dev'essere rimasto fuori ────────────────────
test("tutti gli strati noti sono registrati, non solo quelli che qualcuno ha visto rompersi", async () => {
  // È il difetto che si ripete: il fix applicato a una copia sola. AR-243 elenca gli strati per nome —
  // se uno resta fuori, il bug «torna» dalla schermata che nessuno ha guardato.
  const { readFileSync } = await import("node:fs");
  const REPO = join(QUI, "..", "..");
  const page = readFileSync(join(REPO, "pannello/src/app/page.tsx"), "utf8");
  const doc = readFileSync(join(REPO, "pannello/src/components/aree/Documenti.tsx"), "utf8");
  for (const nome of ["menu", "conversazioni", "worker-conversazioni"]) {
    assert.match(page, new RegExp(`useStrato\\("${nome}"`), `page.tsx: lo strato «${nome}» non è navigabile`);
  }
  for (const nome of ["archivio-cartella", "archivio-documento"]) {
    assert.match(doc, new RegExp(`useStrato\\("${nome}"`), `Documenti.tsx: il gradino «${nome}» non è navigabile`);
  }
  assert.match(page, /sottoLg/, "il menù dev'essere uno strato solo sotto lg, dove copre davvero la pagina");
});
