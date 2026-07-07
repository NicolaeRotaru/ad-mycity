// AR-031 — attribuzione ESCLUSIVA in allocazione-check: un file conta per UNA sola entità.
// Prima un post di Pane Quotidiano che citava "Garetti" in una nota veniva contato ANCHE come asset
// di Garetti (conteggio gonfiato, falso allarme-silo). Test d'unità sulla funzione reale entitaPrimaria.
import { entitaPrimaria } from "../allocazione-check.mjs";
import assert from "node:assert";

const NEGOZI = [
  { nome: "Pane Quotidiano", stato: "confermato", tipo: "negozio" },
  { nome: "Antica Salumeria Garetti", stato: "scelta_ragionata", tipo: "negozio" },
];

let ok = 0;
function t(nome, fn) { fn(); console.log("ok -", nome); ok++; }

// ① Un post PQ (frontmatter negozio: Pane Quotidiano) che cita Garetti in una nota → attribuito a PQ.
t("post PQ che cita Garetti in nota → Pane Quotidiano", () => {
  const blob = [
    "consegne/content/2026-07-04-post-santantonino-pq.md",
    "negozio: pane quotidiano (via calzolai 25) — stato confermato",
    "post per pane quotidiano.",
    "> garetti è scelta_ragionata (prospect non firmato) → pubblicazioni pesanti congelate.",
  ].join("\n").toLowerCase();
  assert.strictEqual(entitaPrimaria(blob, NEGOZI), "Pane Quotidiano");
});

// ② Un kit intestato a Garetti (frontmatter) → attribuito a Garetti.
t("kit con frontmatter negozio: Garetti → Antica Salumeria Garetti", () => {
  const blob = "consegne/content/garetti-kit.md\nnegozio: antica salumeria garetti\ncontenuto per garetti.".toLowerCase();
  assert.strictEqual(entitaPrimaria(blob, NEGOZI), "Antica Salumeria Garetti");
});

// ③ Senza frontmatter: vince chi è più citato (Garetti nominato 3 volte, PQ 0) → Garetti.
t("senza frontmatter, più citato vince", () => {
  const blob = "consegne/content/generico.md\ngaretti garetti garetti offre salumi.".toLowerCase();
  assert.strictEqual(entitaPrimaria(blob, NEGOZI), "Antica Salumeria Garetti");
});

// ④ File che non nomina nessun negozio → null (non conta per nessuno).
t("nessun negozio nominato → null", () => {
  const blob = "consegne/content/template-neutro.md\nbozza template riusabile senza intestazione.".toLowerCase();
  assert.strictEqual(entitaPrimaria(blob, NEGOZI), null);
});

console.log(`\n${ok}/4 asserzioni OK (AR-031 attribuzione esclusiva)`);
