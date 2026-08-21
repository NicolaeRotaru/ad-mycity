// 🗺️ LE PROVE DELLA MAPPA DI COPERTURA — su file dei freni finti, mai su quello vero.
//
// Se questi casi misurassero `.claude/settings.json` com'è adesso, diventerebbero rossi il giorno in
// cui Nicola aggancia un freno nuovo — cioè proprio quando la macchina migliora. Qui si prova la
// REGOLA, non lo stato di oggi.
//
// LA PROVA CHE CONTA è quella sull'ancoraggio del matcher. Senza ancora, `Edit|Write|MultiEdit`
// risulterebbe coprire anche `NotebookEdit`, perché «Edit» ci sta dentro come pezzo di parola: la
// mappa dichiarerebbe sorvegliato uno strumento che nessuno guarda prima di scrivere. Un falso ✅ su
// una mappa della sorveglianza è peggio di nessuna mappa, perché ci si smette di guardare.

import assert from "node:assert/strict";
import test from "node:test";
import { agganci, copre, coperturaDi, guardieIgnote, mappa, righeSorveglianza, strumentiDaTrascrizione } from "../mappa-copertura.mjs";

const POTERI = {
  "blocca.mjs": { blocca: true, come: "ferma la mossa" },
  "avvisa.mjs": { blocca: false, come: "parla e basta" },
};
const OPZ = { poteri: POTERI, esenzioni: { Read: "legge e basta" } };

const freni = (pre = [], post = []) => ({
  PreToolUse: pre.map(([matcher, ...cmd]) => ({ matcher, hooks: cmd.map((c) => ({ command: c })) })),
  PostToolUse: post.map(([matcher, ...cmd]) => ({ matcher, hooks: cmd.map((c) => ({ command: c })) })),
});

test("un matcher assente copre tutti gli strumenti", () => {
  assert.equal(copre("", "QualsiasiCosa"), true);
});

test("LA REGOLA CHE CONTA: il confronto è ancorato — Edit|Write NON copre NotebookEdit", () => {
  assert.equal(copre("Edit|Write|MultiEdit", "Edit"), true);
  assert.equal(
    copre("Edit|Write|MultiEdit", "NotebookEdit"),
    false,
    "senza ancoraggio la mappa dichiarerebbe sorvegliato uno strumento scoperto",
  );
});

test("un matcher con jolly copre la famiglia giusta e non le altre", () => {
  assert.equal(copre("Bash|Task|mcp__.*", "mcp__github__create_pull_request"), true);
  assert.equal(copre("Bash|Task|mcp__.*", "WebFetch"), false);
});

test("un matcher che non compila non copre niente: mai un verde per un'espressione rotta", () => {
  assert.equal(copre("Bash|(", "Bash"), false);
});

test("uno strumento con una guardia che può bloccare risulta sorvegliato", () => {
  const r = coperturaDi("Edit", freni([["Edit", "node cervello/blocca.mjs --hook"]]), OPZ);
  assert.equal(r.stato, "sorvegliato");
  assert.equal(r.problema, false);
});

test("una guardia che parla ma non ferma vale solo-avviso, non sorvegliato", () => {
  const r = coperturaDi("Bash", freni([], [["Bash", "node cervello/avvisa.mjs --hook"]]), OPZ);
  assert.equal(r.stato, "solo-avviso", "è il caso vero delle modifiche fatte da un comando di shell");
  assert.equal(r.problema, false, "guardato male è un rischio da mostrare, non un buco da bloccare");
});

test("uno strumento che nessuno guarda è scoperto, e fa uscire rosso la mappa", () => {
  const m = mappa(["WebFetch"], freni([["Edit", "node cervello/blocca.mjs --hook"]]), OPZ);
  assert.deepEqual(m.scoperti, ["WebFetch"]);
  assert.equal(m.ok, false);
});

test("un'esenzione col motivo scritto toglie il rosso, ma non finge che qualcuno guardi", () => {
  const r = coperturaDi("Read", freni(), OPZ);
  assert.equal(r.stato, "scoperto", "nessuno lo guarda davvero, e la mappa non lo nasconde");
  assert.equal(r.esente, true);
  assert.equal(r.problema, false);
});

test("un'esenzione senza motivo vale come se non ci fosse", () => {
  const r = coperturaDi("WebFetch", freni(), { poteri: POTERI, esenzioni: { WebFetch: "   " } });
  assert.equal(r.problema, true, "un buco con l'etichetta resta un buco");
});

test("REGOLA ①: una guardia agganciata e mai censita nei poteri fa uscire rosso", () => {
  const m = mappa(["Edit"], freni([["Edit", "node cervello/misteriosa.mjs --hook"]]), OPZ);
  assert.deepEqual(m.guardie_ignote, ["node cervello/misteriosa.mjs"]);
  assert.equal(m.ok, false, "finché non dichiara se blocca, la mappa non sa cosa promette");
});

test("gli agganci si leggono per evento, con matcher e comandi", () => {
  const a = agganci(freni([["Bash", "node cervello/avvisa.mjs --hook", "node cervello/blocca.mjs --hook"]]), "PreToolUse");
  assert.equal(a.length, 1);
  assert.equal(a[0].matcher, "Bash");
  assert.equal(a[0].comandi.length, 2);
});

test("nessuna guardia ignota quando tutte sono censite", () => {
  assert.deepEqual(guardieIgnote(freni([["Bash", "node cervello/avvisa.mjs --hook"]]), POTERI), []);
});

test("tutto coperto o esente con motivo: la mappa esce verde", () => {
  const m = mappa(["Edit", "Read"], freni([["Edit", "node cervello/blocca.mjs --hook"]]), OPZ);
  assert.equal(m.ok, true);
});

// ── La trascrizione: l'unica lista che può contenere uno strumento senza guardia ──────────────
//
// Senza questa parte la mappa si morde la coda: cercherebbe gli scoperti guardando solo le mosse che
// una guardia ha annotato, cioè proprio quelle NON scoperte. Il difetto era nella prima stesura di
// questo file, trovato provandola sul turno vero.

test("LA REGOLA CHE CONTA: dalla trascrizione escono anche gli strumenti che nessuno ha guardato", () => {
  const righe = [
    JSON.stringify({ message: { content: [{ type: "tool_use", name: "WebFetch" }] } }),
    JSON.stringify({ message: { content: [{ type: "text", text: "niente strumenti qui" }] } }),
    JSON.stringify({ message: { content: [{ type: "tool_use", name: "Read" }, { type: "tool_use", name: "WebFetch" }] } }),
  ];
  assert.deepEqual(strumentiDaTrascrizione(righe), ["Read", "WebFetch"], "unici e in ordine");
});

test("una riga di trascrizione tagliata a metà si salta senza portarsi via le altre", () => {
  const righe = ['{"message": {"content": [{"type":"tool_u', JSON.stringify({ message: { content: [{ type: "tool_use", name: "Bash" }] } })];
  assert.deepEqual(strumentiDaTrascrizione(righe), ["Bash"]);
});

test("una trascrizione senza chiamate a strumenti torna vuota, non inventa", () => {
  assert.deepEqual(strumentiDaTrascrizione([JSON.stringify({ message: { content: [] } })]), []);
});

// ── Le righe che arrivano davanti a Nicola nel cancello dello Stop ────────────────────────────

test("una guardia che non ha chiuso diventa un ❌ che dice che NON era un ok", () => {
  const r = righeSorveglianza({ buchi: [{ guardia: "sorvegliante", strumento: "Edit", bersaglio: "cervello/x.mjs" }], mosse: 9 });
  assert.equal(r.length, 1);
  assert.match(r[0], /1 mosse su 9/);
  assert.match(r[0], /NON sta dicendo ok/);
});

test("uno strumento scoperto diventa un ❌ che dice cosa fare", () => {
  const r = righeSorveglianza({ scoperti: ["WebFetch", "Artifact"] });
  assert.match(r[0], /WebFetch, Artifact/);
  assert.match(r[0], /settings\.json/);
});

test("turno pulito: nessuna riga, il cancello non parla per parlare", () => {
  assert.deepEqual(righeSorveglianza({ buchi: [], scoperti: [], mosse: 30 }), []);
});

// ── 21/8: il terzo stato — «il freno è a una riga di distanza» — non aveva prove ────────────────
//
// La regola è arrivata su main con la sua ragione scritta per esteso e nessun caso che la esegua.
// È il punto in cui una distinzione onesta diventa una frase: quello che tiene in piedi `IN_ATTESA`
// è la DATA, e una data che nessuno prova a superare non ferma niente. Queste prove tengono le due
// direzioni — l'attesa perdona PRIMA della scadenza, e smette di perdonare DOPO, da sola.

import { attesaValida, IN_ATTESA } from "../mappa-copertura.mjs";

const ATTESE = { Monitor: { scade: "2026-09-04", perche: "esegue una shell come Bash, quindi NON è esente: gli serve lo stesso freno" } };
const soloBash = freni([["Bash", "node blocca.mjs"]]);

test("uno strumento in attesa non fa rosso finché la data non è passata", () => {
  const r = coperturaDi("Monitor", soloBash, { ...OPZ, attese: ATTESE, oggi: "2026-08-21" });
  assert.equal(r.stato, "scoperto", "resta scoperto nei fatti: nessuno lo guarda");
  assert.equal(r.problema, false, "un cancello rosso per costruzione viene aggirato al secondo giro");
  assert.equal(r.in_attesa, true);
  assert.equal(r.scade, "2026-09-04");
});

test("il giorno dopo la scadenza torna rosso da solo", () => {
  const r = coperturaDi("Monitor", soloBash, { ...OPZ, attese: ATTESE, oggi: "2026-09-05" });
  assert.equal(r.problema, true, "se non scatta qui, l'attesa è un'esenzione eterna con una data finta sopra");
  assert.equal(r.in_attesa, false);
});

test("il giorno DELLA scadenza vale ancora: la data è l'ultimo giorno buono", () => {
  assert.equal(attesaValida("Monitor", "2026-09-04", ATTESE), true);
});

test("senza data non è un'attesa, e senza perché nemmeno", () => {
  assert.equal(attesaValida("X", "2026-08-21", { X: { perche: "esegue una shell come Bash e va frenato" } }), false, "un debito senza scadenza è un buco con una scusa più lunga");
  assert.equal(attesaValida("X", "2026-08-21", { X: { scade: "2026-12-31", perche: "boh" } }), false, "un'etichetta non è un perché");
  assert.equal(attesaValida("X", "2026-08-21", { X: { scade: "fra un po'", perche: "esegue una shell come Bash e va frenato" } }), false);
  assert.equal(attesaValida("Mai", "2026-08-21", ATTESE), false);
});

// 21/8 20:20 — Monitor è uscito dall'elenco perché il debito è stato pagato: la riga che lo copre è
// su `main`. Il MECCANISMO del terzo stato resta provato qui sopra su ingressi finti; questa prova
// adesso sorveglia la cosa che conta — che l'elenco non si riempia di deroghe senza scadenza.
// Un'attesa è una promessa con una data: se qualcuna resta senza, l'elenco torna a essere un posto
// dove i buchi si nascondono.
test("ogni attesa dichiarata ha una data vera e un perché che dice cosa manca", () => {
  for (const [strumento, a] of Object.entries(IN_ATTESA)) {
    assert.match(a.scade || "", /^\d{4}-\d{2}-\d{2}$/, `${strumento}: un'attesa senza data non è un'attesa`);
    assert.ok((a.perche || "").length > 40, `${strumento}: chi legge deve sapere COSA manca, non solo che manca`);
  }
});
