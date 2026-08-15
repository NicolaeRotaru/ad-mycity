#!/usr/bin/env node
// 🔁 Riaprire un difetto è lavorarci: il cancello deve accorgersene.
//
// LA RADICE. `difettiToccati` in `cervello/cancello-lotto.mjs` guardava un campo solo — `verifica` —
// perché per molti lotti un lotto si riconosceva dalle prove che scriveva. Poi il lotto 44 ha fatto
// la cosa più onesta che si potesse fare: ha RIAPERTO due difetti che dopo il merge si erano chiusi
// da soli (AR-693 e AR-684), mettendoci sopra `chiusura: "bloccata"` col motivo scritto. Le loro
// prove andavano bene e non sono state toccate.
//
// Risultato: «zero difetti toccati» mentre il cantiere era cambiato → il cancello si dichiarava
// cieco sul passo delle mutazioni → exit 2 → in CI il 2 blocca. Cioè il lavoro più onesto del lotto
// era esattamente quello che non riusciva a passare, e il messaggio dava la colpa a un «clone
// superficiale» che non c'entrava niente (`fetch-depth: 0` era già impostato da mesi).
//
// LA CURA: l'impronta di una scheda sono i tre campi che un lotto può cambiare — `verifica`,
// `stato`, `chiusura`. Non è un elenco più lungo per sicurezza: sono le tre cose che significano
// «ho lavorato su questa scheda», e ognuna ha il suo caso qui sotto.
//
// NON-VACUITÀ (eseguita): riportando `CAMPI_DEL_LOTTO` a `["verifica"]`, i casi ② e ③ diventano
// ROSSI — che è precisamente il buco per cui la CI della PR #738 era rossa.

import assert from "node:assert/strict";

import { difettiToccati } from "../cancello-lotto.mjs";

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

const prima = {
  difetti: [
    { id: "AR-1", stato: "chiuso", verifica: { tipo: "comando", comando: "node x.mjs" } },
    { id: "AR-2", stato: "aperto", verifica: { tipo: "umano" } },
    { id: "AR-3", stato: "chiuso", verifica: { tipo: "comando", comando: "node y.mjs" } },
  ],
};
const conModifica = (id, campi) => ({
  difetti: prima.difetti.map((d) => (d.id === id ? { ...d, ...campi } : { ...d })),
});

prova("① una prova cambiata è ancora un difetto toccato (quello che il metro già vedeva)", () => {
  const t = difettiToccati(conModifica("AR-1", { verifica: { tipo: "comando", comando: "node z.mjs" } }), prima);
  assert.deepEqual(t, ["AR-1"]);
});

prova("② RIAPRIRE un difetto è lavorarci, anche se la prova resta quella", () => {
  const t = difettiToccati(conModifica("AR-1", { stato: "aperto" }), prima);
  assert.deepEqual(t, ["AR-1"], "e' il caso di AR-693 e AR-684: prova intatta, difetto riaperto");
});

prova("③ BLOCCARE la chiusura è lavorarci: è una decisione, non un dettaglio", () => {
  const t = difettiToccati(conModifica("AR-2", { chiusura: "bloccata" }), prima);
  assert.deepEqual(t, ["AR-2"]);
});

prova("④ una scheda NUOVA risulta toccata", () => {
  const dopo = { difetti: [...prima.difetti.map((d) => ({ ...d })), { id: "AR-9", stato: "aperto" }] };
  assert.deepEqual(difettiToccati(dopo, prima), ["AR-9"]);
});

prova("⑤ se non è cambiato niente, non è toccato niente: il metro non grida a vuoto", () => {
  assert.deepEqual(difettiToccati({ difetti: prima.difetti.map((d) => ({ ...d })) }, prima), []);
});

prova("⑥ un campo che NON è del lotto non fa scattare niente (la nota, il titolo)", () => {
  const t = difettiToccati(conModifica("AR-3", { nota_fix: "riscritta", titolo: "altro titolo" }), prima);
  assert.deepEqual(t, [], "altrimenti ogni ritocco di prosa entrerebbe nel banco delle mutazioni");
});

prova("⑦ senza un termine di paragone il metro dice «non lo so», non «niente»", () => {
  assert.equal(difettiToccati(prima, null), null, "un vuoto qui verrebbe letto come «nessun difetto toccato»");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
