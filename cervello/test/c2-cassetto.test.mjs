// AR-248 + AR-249 — il cassetto delle conversazioni: quello che non si vede non si disegna, e
// cercare non deve costare una pagina intera per ogni lettera.
//
// COSA ERA ROTTO.
//  · AR-248 — il cassetto era nascosto in CSS (spinto fuori schermo con `-translate-x-full` più
//    `aria-hidden`), non smontato. Per React restava lì: ogni ridisegno della pagina attraversava
//    tutte le righe invisibili, e ogni riga ricuciva tre volte il suo thread di messaggi.
//  · AR-249 — la stringa di ricerca viveva nel componente-pagina (3.800 righe) e la casella la
//    aggiornava a ogni battuta: scrivere «garetti» = sette ridisegni dell'intera Cabina, e ogni
//    ridisegno rifaceva la minuscola su ogni messaggio di ogni conversazione. Lo stesso filtro
//    era copiato tal quale in un secondo cassetto.
//
// COSA PROVA QUESTO TEST. La decisione — QUALI righe esistono — adesso è una funzione pura
// (`righeCassetto`) che i due cassetti chiamano tutti e due: cassetto chiuso ⇒ nessuna riga,
// qualunque cosa ci sia dentro; e il filtro passa da un indice già in minuscolo, calcolato una
// volta per elenco invece che una volta per battuta.

import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

register("./risolvi-ts.mjs", import.meta.url);

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..", "..");
const { righeCassetto, filtraConversazioni, indiceRicercaConversazioni, RITARDO_RICERCA_MS } = await import(
  join(RADICE, "pannello/src/lib/pagina-stato.ts")
);

const CONV = [
  { id: "c1", titolo: "Garetti — vetrina", messaggi: [{ content: "Il fornaio ha detto sì" }, { content: "ok" }] },
  { id: "c2", titolo: "Pane Quotidiano", messaggi: [{ content: "payout pronto" }] },
  { id: "c3", titolo: "Numeri di luglio", messaggi: [{ content: "GARETTI in maiuscolo" }] },
];

test("AR-248 · cassetto CHIUSO ⇒ nessuna riga da disegnare", () => {
  assert.deepEqual(righeCassetto({ aperto: false, conversazioni: CONV }), []);
  // Anche con la ricerca scritta: chiuso vuol dire chiuso.
  assert.deepEqual(righeCassetto({ aperto: false, conversazioni: CONV, ricerca: "garetti" }), []);
});

test("AR-248 · cassetto APERTO ⇒ ci sono tutte", () => {
  const righe = righeCassetto({ aperto: true, conversazioni: CONV });
  assert.equal(righe.length, 3);
  assert.deepEqual(righe.map((c) => c.id), ["c1", "c2", "c3"]);
});

test("AR-248 · un cassetto chiuso non è mai più caro di un cassetto vuoto", () => {
  // La prova del motivo per cui il difetto costava: cento conversazioni con cento messaggi ognuna.
  // Chiuso, il lavoro deve essere zero righe — non «zero righe visibili».
  const tante = Array.from({ length: 100 }, (_, i) => ({
    id: `x${i}`,
    titolo: `Conversazione ${i}`,
    messaggi: Array.from({ length: 100 }, (_, j) => ({ content: `messaggio ${j} garetti` })),
  }));
  assert.equal(righeCassetto({ aperto: false, conversazioni: tante, ricerca: "garetti" }).length, 0);
  assert.equal(righeCassetto({ aperto: true, conversazioni: tante, ricerca: "garetti" }).length, 100);
});

test("AR-249 · la ricerca filtra per titolo E per testo dei messaggi, senza badare alle maiuscole", () => {
  const perTitolo = filtraConversazioni(CONV, "pane");
  assert.deepEqual(perTitolo.map((c) => c.id), ["c2"]);
  const perTesto = filtraConversazioni(CONV, "fornaio");
  assert.deepEqual(perTesto.map((c) => c.id), ["c1"]);
  const maiuscole = filtraConversazioni(CONV, "GaReTtI");
  assert.deepEqual(maiuscole.map((c) => c.id), ["c1", "c3"]);
});

test("AR-249 · ricerca vuota o di soli spazi = nessun filtro", () => {
  assert.equal(filtraConversazioni(CONV, "").length, 3);
  assert.equal(filtraConversazioni(CONV, "   ").length, 3);
  assert.equal(filtraConversazioni(CONV, null).length, 3);
});

test("AR-249 · l'indice è già in minuscolo e si calcola UNA volta per elenco", () => {
  const idx = indiceRicercaConversazioni(CONV);
  assert.equal(idx.size, 3);
  const testo = idx.get("c3");
  assert.ok(testo.includes("garetti"), "il testo indicizzato deve essere già minuscolo");
  assert.ok(!/[A-Z]/.test(testo), "nessuna maiuscola può restare nell'indice");
  // Con l'indice il risultato è identico a senza: l'indice è una scorciatoia, non un'altra regola.
  assert.deepEqual(
    filtraConversazioni(CONV, "garetti", idx).map((c) => c.id),
    filtraConversazioni(CONV, "garetti").map((c) => c.id),
  );
});

test("AR-249 · l'indice non viene mai riletto dal testo grezzo (se mento, il filtro mi crede)", () => {
  // Prova che il filtro USA davvero l'indice invece di riscandire i messaggi: un indice finto che
  // non contiene «garetti» deve far sparire i risultati. Se il filtro tornasse a scandire il testo
  // a ogni battuta, questo test resterebbe verde — ed è il costo che AR-249 pagava.
  const finto = new Map([["c1", "niente"], ["c2", "niente"], ["c3", "niente"]]);
  assert.equal(filtraConversazioni(CONV, "garetti", finto).length, 0);
});

test("AR-249 · si aspetta una pausa di battuta prima di filtrare", () => {
  assert.equal(typeof RITARDO_RICERCA_MS, "number");
  assert.ok(RITARDO_RICERCA_MS >= 120 && RITARDO_RICERCA_MS <= 500, `ritardo fuori scala: ${RITARDO_RICERCA_MS}`);
});

test("AR-248/AR-249 · i due cassetti chiedono alla STESSA funzione", async () => {
  // Il filtro era copiato in due posti: il fix a una copia sola è la forma di errore che questo
  // progetto ha già pagato. Qui si controlla che nel componente non sia rimasta una seconda copia
  // scritta a mano — cioè che `page.tsx` non filtri più da sé.
  const { readFileSync } = await import("node:fs");
  const pagina = readFileSync(join(RADICE, "pannello/src/app/page.tsx"), "utf8");
  const chiamate = pagina.match(/righeCassetto\(\{/g) || [];
  assert.equal(chiamate.length, 2, "i due cassetti devono chiamare entrambi righeCassetto");
  assert.ok(
    !pagina.includes("m.content.toLowerCase().includes(q)"),
    "è tornata una copia del filtro dentro il componente",
  );
});
