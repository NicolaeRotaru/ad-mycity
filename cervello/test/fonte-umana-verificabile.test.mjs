#!/usr/bin/env node
// AR-170 — il messaggio d'errore insegna come aggirare il freno.
//
// Quando il sensore è cieco, `cmdEsito` rifiuta di chiudere una previsione come azzeccata — è il
// freno di AR-061 contro l'over-confidence al buio. Ma il messaggio con cui rifiuta dice:
//
//     «Usa --fonte="conferma di Nicola" se c'è verifica umana»
//
// cioè indica la strada per passare comunque. E `"conferma di Nicola"` è una stringa libera: non
// chiede DOVE. Chiunque — compresa la macchina che scrive da sé — può chiudere qualunque voce
// scrivendola.
//
// Misurato il 28/7: **zero voci la usano.** La porta è aperta e nessuno ci è ancora passato. Questo
// non è un motivo per lasciarla aperta: è l'unico momento in cui chiuderla non costa niente, perché
// non c'è storico da sanare. Un difetto senza vittime è quello che conviene riparare per primo.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { INVARIANTE, fonteVerificabile, invarianteRotta } from "../previsione-verificabile.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const TAGLIO = "2026-07-28";

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

prova("il caso che ha rotto: «conferma di Nicola» da sola non è una misura", () => {
  assert.equal(fonteVerificabile({ fonte: "conferma di Nicola" }), false);
  assert.deepEqual(
    invarianteRotta({ stato: "azzeccata", fonte: "conferma di Nicola", creato: "2026-08-01" }, TAGLIO),
    [INVARIANTE.FONTE_NON_VERIFICABILE],
  );
});

prova("con il DOVE va bene: l'id di una card, o una riga di DECISIONI con data e ora", () => {
  assert.equal(fonteVerificabile({ fonte: "conferma di Nicola (#ordine-test-pq)" }), true);
  assert.equal(fonteVerificabile({ fonte: "conferma di Nicola, DECISIONI 2026-07-23 21:10" }), true);
  assert.deepEqual(invarianteRotta({ stato: "azzeccata", fonte: "conferma di Nicola (#zona-orario-consegna)", creato: "2026-08-01" }, TAGLIO), []);
});

prova("le fonti strumentali non passano di qui: le giudica il sensore", () => {
  // Pretendere un riferimento anche da «Supabase MCP» sarebbe un cancello che chiede la cosa
  // sbagliata alla porta giusta — e verrebbe aggirato, non rispettato.
  assert.equal(fonteVerificabile({ fonte: "Supabase MCP" }), true);
  assert.equal(fonteVerificabile({ fonte: "PostHog (nessun evento click_lista_attesa registrato)" }), true);
});

prova("oggi nessuna voce usa quella porta: si chiude a costo zero", () => {
  const j = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json"), "utf8"));
  const umane = j.registro.filter((e) => /nicola|conferma umana/i.test(String(e.fonte || "")));
  assert.equal(umane.length, 0, `attese 0 voci con fonte umana, trovate ${umane.length}: andrebbero sanate prima di legare l'invariante`);
});

prova("il messaggio d'errore non insegna più la scorciatoia", () => {
  // Un freno che, mentre ti ferma, ti dice come passare, non è un freno: è un cartello.
  //
  // ⚠️ La prima versione di questa prova cercava la stringa ESATTA `Usa --fonte="conferma di Nicola" se`
  // e restava verde rimettendo la scorciatoia scritta con le virgolette protette (`\"`) — cioè con la
  // stessa frase, scritta come la scriverebbe chiunque dentro una stringa JS. Una prova che riconosce
  // una sola formulazione del difetto non prova la proprietà: prova il ricordo di com'era scritto.
  // Qui si normalizza il testo e si verifica la REGOLA: se il messaggio nomina la fonte umana, deve
  // dire nella stessa frase che senza un riferimento non vale.
  const src = readFileSync(join(REPO, "cervello/calibrazione.mjs"), "utf8");
  const i = src.indexOf("AR-061: sensore-fonte cieco");
  assert.ok(i > 0, "il freno di AR-061 dev'esserci ancora");
  const blocco = src.slice(i, i + 900).replace(/\\+/g, "").replace(/\s+/g, " ");

  const nominaFonteUmana = /conferma di Nicola/i.test(blocco);
  assert.ok(nominaFonteUmana, "la fonte umana resta una strada legittima: non va cancellata, va vincolata");

  const spiegaIlDove = /(deve dire DOVE|riferimento|#card|DECISIONI)/i.test(blocco);
  assert.ok(spiegaIlDove, "se il messaggio nomina la fonte umana, deve dire che senza il DOVE non è una misura");

  // E non deve presentarla come la via d'uscita: «usala se hai verifica umana» è l'istruzione per aggirare.
  assert.doesNotMatch(blocco, /Usa --fonte=.{0,30}conferma di Nicola.{0,4} se c/i, "non deve suggerire di aggirare il freno");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
