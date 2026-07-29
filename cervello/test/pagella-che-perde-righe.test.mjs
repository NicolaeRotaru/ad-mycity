// AR-358 — «la pagella dei reparti dice zero previsioni per tutti e tredici mentre a registro ce ne
// sono quarantadue».
//
// Il meccanismo: `ricalcolaReparti` aveva un `continue` A MONTE dei contatori. Le 36 righe
// `esito_loop` (su 42) non incrementavano né `previsioni` né `escluse`: sparivano da entrambi. Il
// report mostrava «0 previsioni, 0 escluse» per tutti e 13 i reparti e nessuno poteva accorgersi
// della perdita, perché niente pretendeva che la somma tornasse.
//
// L'invariante che questo test rende obbligatoria:
//     previsioni + escluse + non_previsioni = righe del registro, per OGNI reparto.
//
//   node cervello/test/pagella-che-perde-righe.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { conteggioReparto } from "../previsione-verificabile.mjs";
import { nonEUnaPrevisione } from "../volano-regole.mjs";
import { ripartisci } from "../misura-parziale.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CAL = join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json");

/** Lo stesso raggruppamento di calibrazione.ricalcolaReparti (normalizza `@AD` e `ad` sullo stesso reparto). */
function perReparto(registro) {
  const m = new Map();
  for (const e of registro) {
    if (!e?.reparto) continue;
    const r = `@${String(e.reparto).trim().toLowerCase().replace(/^@/, "")}`;
    if (!m.has(r)) m.set(r, []);
    m.get(r).push(e);
  }
  return m;
}

test("⬇️ IL CASO CHE RIVELA LA MALATTIA: 42 righe di cui 36 esito_loop, e la somma deve tornare", () => {
  const voci = [
    ...Array.from({ length: 36 }, (_, i) => ({ reparto: "@ad", metrica: "esito_loop", stato: "mancata", id: `L${i}` })),
    { reparto: "@ad", metrica: "ordini", stato: "azzeccata", sensore_stato: "ok", creato: "2026-07-01", chiuso_il: "2026-07-05", entro: "2026-07-10", baseline: 0 },
    ...Array.from({ length: 5 }, (_, i) => ({ reparto: "@ad", metrica: "ordini", stato: "aperta", id: `A${i}` })),
  ];

  const c = conteggioReparto(voci, { nonPrevisione: nonEUnaPrevisione });

  assert.equal(c.righe, 42, "tutte le righe del reparto sono contate");
  assert.equal(c.non_previsioni, 36, "le esito_loop NON spariscono: hanno un contatore loro");
  assert.equal(
    c.previsioni + c.escluse + c.non_previsioni,
    c.righe,
    `la somma deve tornare: ${c.previsioni} + ${c.escluse} + ${c.non_previsioni} ≠ ${c.righe}`,
  );
  assert.ok(c.quadra, "il conteggio si dichiara quadrato solo se lo è");
});

test("«0 previsioni» non è più indistinguibile da «non ha mai provato»", () => {
  const soloRumore = Array.from({ length: 7 }, () => ({ reparto: "@finanza", metrica: "esito_loop", stato: "mancata" }));
  const c = conteggioReparto(soloRumore, { nonPrevisione: nonEUnaPrevisione });
  assert.equal(c.previsioni, 0);
  assert.equal(c.non_previsioni, 7, "il reparto ha 7 righe: non è inattivo, è non misurabile");
  assert.equal(c.righe, 7);
});

test("`ripartisci` non può perdere una voce, nemmeno se il classificatore sbaglia", () => {
  const r = ripartisci([1, 2, 3, 4], (n) => (n % 2 ? "dispari" : null), ["dispari"]);
  assert.equal(r.totale, 4);
  assert.equal(r.somma, 4, "una classe nulla finisce in `non_classificate`, non nel nulla");
  assert.equal(r.conteggi.non_classificate, 2);
  assert.ok(r.quadra);

  // Anche un classificatore che ESPLODE non fa sparire la voce.
  const boom = ripartisci([1, 2], () => {
    throw new Error("classificatore rotto");
  });
  assert.equal(boom.somma, 2);
  assert.ok(boom.quadra);
});

test("sui DATI VERI di calibrazione.json la somma torna per OGNI reparto", () => {
  const cal = JSON.parse(readFileSync(CAL, "utf8"));
  const registro = Array.isArray(cal.registro) ? cal.registro : [];
  assert.ok(registro.length > 0, "il registro reale non è vuoto");

  let coperte = 0;
  let nonPrevisioniTotali = 0;
  for (const [reparto, voci] of perReparto(registro)) {
    const c = conteggioReparto(voci, { nonPrevisione: nonEUnaPrevisione });
    assert.ok(
      c.quadra,
      `${reparto}: ${c.previsioni} previsioni + ${c.escluse} escluse + ${c.non_previsioni} non-previsioni ≠ ${c.righe} righe`,
    );
    coperte += c.righe;
    nonPrevisioniTotali += c.non_previsioni;
  }

  const conReparto = registro.filter((e) => e?.reparto).length;
  assert.equal(coperte, conReparto, "nessuna riga del registro reale resta fuori da tutti i contatori");
  assert.ok(
    nonPrevisioniTotali > 0,
    "sui dati veri le righe esito_loop esistono: se qui fosse 0 il test non starebbe misurando niente",
  );
});

test("calibrazione.mjs DELEGA il conteggio invece di rifarlo con dei `continue`", () => {
  const src = readFileSync(join(ROOT, "cervello/calibrazione.mjs"), "utf8");
  assert.match(src, /conteggioReparto\s*\(/, "il ricalcolo dei reparti passa dalla funzione unica");
  const ricalcolo = src.slice(src.indexOf("function ricalcolaReparti"), src.indexOf("function nuovoId"));
  assert.doesNotMatch(
    ricalcolo,
    /nonEUnaPrevisione\(e\)\s*\)\s*\{[\s\S]{0,120}continue/,
    "nessun `continue` che salti i contatori: è esattamente il gesto che faceva sparire 36 righe",
  );
  assert.match(ricalcolo, /non_previsioni/, "il terzo contatore arriva fino al report");
});
