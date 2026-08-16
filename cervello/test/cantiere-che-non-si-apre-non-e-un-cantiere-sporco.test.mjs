#!/usr/bin/env node
// 🧪 AR-709 — «non sono riuscito ad aprire il cantiere» usciva 1, cioè «ho guardato e ho trovato».
//
// LA STORIA. `cantiere-prove.mjs` leggeva il registro con un lettore che tornava `null` per tre
// motivi diversi — il file non c'è, il JSON è rotto, l'ho letto ed era davvero null — e subito
// sotto faceva `process.exit(1)`. Ma 1, nel contratto di casa (AR-322), vuol dire «ho misurato e ho
// trovato qualcosa da riparare». Qui non si era misurato niente: è un 2. Chi legge il codice
// d'uscita — giro.sh, il cancello, la CI — non poteva distinguere un cantiere pieno di guai da un
// cantiere che non si è lasciato aprire, e il secondo arrivava con la faccia del primo.
//
// LA CURA sta in un modulo puro: `esitoDellaFonte` in cervello/esito-guardiano.mjs decide, il
// guardiano fa solo l'I/O e le racconta cosa ha trovato.
//
// LA PROVA gira su due piani: la funzione pura sui quattro casi, e il COMANDO VERO in una sabbiera
// dove il cantiere è rotto per davvero — perché la regola giusta scritta in un modulo che nessuno
// chiama è la forma più elegante di non avere una difesa.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, copyFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { esitoDellaFonte, codiceDiUscita } = await import(join(REPO, "cervello/esito-guardiano.mjs"));

const AMBIENTE = { ...process.env };
delete AMBIENTE.SUPABASE_URL;
delete AMBIENTE.SUPABASE_SERVICE_KEY;

test("⬇️ AR-709 — le tre strade che non hanno letto niente sono tutte e tre cieche", () => {
  const casi = [
    ["il file non c'è", esitoDellaFonte({ trovata: false }, { cosa: "il cantiere" })],
    ["il JSON è rotto", esitoDellaFonte({ errore: new SyntaxError("Unexpected token") }, { cosa: "il cantiere" })],
    ["la forma è un'altra", esitoDellaFonte({ formaValida: false, formaAttesa: "un elenco" }, { cosa: "il cantiere" })],
  ];
  for (const [nome, esito] of casi) {
    assert.equal(esito.stato, "cieco", `«${nome}» non è dichiarato cieco`);
    assert.equal(codiceDiUscita(esito), 2, `«${nome}» non esce 2: 1 vuol dire «ho misurato», e qui non si è misurato`);
    assert.match(esito.motivo, /cantiere/, `«${nome}» non dice quale fonte non si è letta: una cecità senza il perché non si ripara`);
  }
  const sana = esitoDellaFonte({}, { cosa: "il cantiere" });
  assert.equal(sana.stato, "verde", "una fonte letta bene non è verde: la prova misura il caso sbagliato");
  assert.equal(codiceDiUscita(sana), 0, "una fonte letta bene non esce 0");
});

/** Una sabbiera con dentro solo gli script e un cantiere scritto da noi. */
function sabbiera(contenutoCantiere) {
  const sb = mkdtempSync(join(tmpdir(), "cantiere-cieco-"));
  mkdirSync(join(sb, "cervello"), { recursive: true });
  mkdirSync(join(sb, "MyCity-Vault/90-Memoria-AI/auto-coscienza"), { recursive: true });
  for (const f of readdirSync(join(REPO, "cervello"))) {
    if (f.endsWith(".mjs") || f.endsWith(".json")) copyFileSync(join(REPO, "cervello", f), join(sb, "cervello", f));
  }
  if (contenutoCantiere !== null) {
    writeFileSync(join(sb, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), contenutoCantiere);
  }
  return sb;
}

function lancia(sb, args = []) {
  const r = spawnSync(process.execPath, [join(sb, "cervello/cantiere-prove.mjs"), ...args], {
    cwd: sb,
    env: AMBIENTE,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  assert.notEqual(r.status, null, `il guardiano non è partito: ${r.error?.message}`);
  return r;
}

test("⬇️ AR-709 — il comando VERO su un cantiere rotto esce 2, non 1", () => {
  for (const [nome, contenuto] of [
    ["JSON rotto", "{ questo non è JSON"],
    ["forma inattesa", '{"difetti": "non un elenco"}'],
    ["file assente", null],
  ]) {
    const sb = sabbiera(contenuto);
    try {
      const r = lancia(sb);
      assert.equal(
        r.status,
        2,
        `con «${nome}» il guardiano esce ${r.status}: 1 vuol dire «ho misurato e ho trovato dei guai», e qui non ha guardato niente`,
      );
      assert.match(
        `${r.stderr}${r.stdout}`,
        /cantiere/i,
        `con «${nome}» non dice cosa non è riuscito a leggere: una cecità muta non si ripara`,
      );
    } finally {
      rmSync(sb, { recursive: true, force: true });
    }
  }
});

test("⬇️ AR-709 — su un cantiere SANO il guardiano misura ancora, e il rosso resta un rosso", () => {
  // Senza questo caso la prova sarebbe soddisfatta anche da un guardiano che esce sempre 2.
  const sb = sabbiera(
    JSON.stringify({
      difetti: [
        {
          id: "AR-000",
          titolo: "un difetto finto con una prova che gira",
          stato: "aperto",
          gravita: "minore",
          nato: "2026-08-15 00:00",
          impatto_crescita: "basso",
          verifica: { tipo: "comando", comando: "node cervello/esito-guardiano.mjs" },
        },
      ],
    }),
  );
  try {
    const r = lancia(sb, ["--dry"]);
    assert.equal(r.status, 0, `su un cantiere sano il guardiano esce ${r.status}: ${r.stderr.slice(0, 300)}`);
    assert.match(r.stdout, /Difetti non chiusi: 1/, "il guardiano non ha nemmeno contato il difetto che gli ho messo davanti");
  } finally {
    rmSync(sb, { recursive: true, force: true });
  }
});
