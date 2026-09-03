#!/usr/bin/env node
// 🏪 LA PROVA ATTRAVERSA LA PORTA DELLA CASA — le schede del sito portano la prova, non solo il titolo.
//
// LA MALATTIA: fino al 3/9/2026 `problemiDaRaw` faceva passare sei campi (titolo, gravita', descrizione,
// dove, impatto, fix). La prova che il cercatore aveva eseguito, la causa radice, chi aveva verificato
// il difetto e la riverifica di un problema noto cadevano a terra fra il referto e la casa: il
// pacchettatore del sito scriveva «le schede del sito non portano il campo della prova», e
// l'asticella («un grave nasce con una prova che gira») non era misurabile sul sito.
//
// COSA PROVA: ① i campi dichiarati in CAMPI_EXTRA_DEL_REFERTO attraversano la porta; ② un campo non
// dichiarato resta fuori (la porta non si allarga a caso); ③ i campi vuoti non sporcano la scheda;
// ④ la fusione con la casa conserva lo stato di una riparazione anche quando il referto porta la prova.
import { test } from "node:test";
import assert from "node:assert/strict";
import { problemiDaRaw, fondiConLaCasa, CAMPI_EXTRA_DEL_REFERTO, FONTI_SITO } from "../referti-sito.mjs";

const fonte = FONTI_SITO.find((f) => f.id === "marketplace");
const raw = {
  result: [{
    dimensione: "pagamenti-stripe",
    findings: [{
      titolo: "Il rimborso parte due volte",
      severita: "grave",
      descrizione: "…",
      dove: "lib/stripe/payout.ts:10",
      impatto: "soldi",
      fix: "idempotenza",
      prova: "npx vitest run tests/unit/x.test.ts",
      prova_tipo: "comando",
      prova_eseguita: true,
      causa_radice: "manca la chiave di idempotenza",
      impatto_crescita: "alto",
      giro: 1,
      verificato: "collega",
      riverifica: { verdetto: "ancora_presente", prova: "…", data: "2026-09-03 03:00" },
      gia_noto: true,
      fonte_radiografia: "totale 2026-09-03",
      campo_a_caso: "non deve passare",
      prova_vuota: "",
    }],
  }],
};

test("① la prova, la verifica e la riverifica attraversano la porta della casa", () => {
  const [p] = problemiDaRaw(raw, fonte);
  for (const k of CAMPI_EXTRA_DEL_REFERTO) assert.ok(k in p, `manca «${k}» sulla scheda`);
  assert.equal(p.prova, "npx vitest run tests/unit/x.test.ts");
  assert.equal(p.prova_eseguita, true);
  assert.equal(p.verificato, "collega");
  assert.equal(p.riverifica.verdetto, "ancora_presente");
  assert.equal(p.file, "lib/stripe/payout.ts:10");
});

test("② un campo non dichiarato resta fuori: la porta non si allarga a caso", () => {
  const [p] = problemiDaRaw(raw, fonte);
  assert.ok(!("campo_a_caso" in p));
});

test("③ un campo vuoto non entra", () => {
  const [p] = problemiDaRaw(raw, fonte);
  assert.ok(!("prova_vuota" in p));
  const [q] = problemiDaRaw({ result: [{ dimensione: "x", findings: [{ titolo: "t", severita: "minore", descrizione: "d", fix: "f" }] }] }, fonte);
  for (const k of CAMPI_EXTRA_DEL_REFERTO) assert.ok(!(k in q), `«${k}» non doveva comparire su una scheda senza prova`);
});

// ⑤ 3/9/2026 — riguardata con la lente «rischio sicurezza» durante la radiografia totale del sito.
// La porta ora fa passare la prova; e una prova puo' fabbricare una credenziale finta per dimostrare
// che il guardiano dei segreti la intercetta. Se entrasse tale e quale, il guardiano leggerebbe la
// memoria dell'AD come se contenesse una chiave vera e bloccherebbe la memoria stessa. Questa prova
// diventa rossa se il disarmo sparisce.
test("⑤ una credenziale finta dentro la prova entra disarmata, e il comando resta eseguibile", () => {
  const finta = ["sk", "live"].join("_") + "_51ABCdefGHI";
  const [p] = problemiDaRaw(
    { result: [{ dimensione: "pagamenti-stripe", findings: [{
      titolo: "il guardiano dei segreti lascia passare una chiave scritta sulla riga di comando",
      severita: "grave", descrizione: "d", fix: "f",
      prova: `node cervello/segreti.mjs --chiave ${finta} deve diventare rosso`,
      prova_tipo: "comando", prova_eseguita: true,
    }] }] },
    fonte,
  );
  assert.ok(!p.prova.includes(finta), "la credenziale finta e' entrata in casa tale e quale");
  assert.ok(p.prova.includes("node cervello/segreti.mjs"), "il comando non deve sparire");
  assert.ok(p.prova.includes("echo live"), "il prefisso deve ricomporsi da solo quando il comando gira");
});

test("④ la fusione conserva la riparazione anche col referto che porta la prova", () => {
  const nuovi = problemiDaRaw(raw, fonte);
  const vecchi = [{ ...nuovi[0], stato: "chiuso", chiuso_il: "2026-09-01 10:00", chiuso_da: "lotto 3" }];
  const { problemi } = fondiConLaCasa(nuovi, vecchi);
  assert.equal(problemi.length, 1);
  assert.equal(problemi[0].stato, "chiuso");
  assert.equal(problemi[0].prova, "npx vitest run tests/unit/x.test.ts");
});
