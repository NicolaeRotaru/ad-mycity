#!/usr/bin/env node
// 🧪 UN AMBIENTE CHE MANCA NON È UN CODICE ROTTO.
//
// Misurato il 30/7 su `main` pulito, in una sessione appena aperta: `node cervello/cancello-lotto.mjs`
// impiegava 65 secondi e usciva 1 — «⛔ NON SI CONSEGNA» — per due errori che non riguardavano il
// lavoro di nessuno: `Cannot find name 'process'` e `Cannot find module 'tailwindcss'`. Causa:
// `pannello/node_modules` non esiste finché qualcuno non lancia `npm ci`, e il clone non lo porta.
//
// Perché è un difetto e non un fastidio: un cancello che parte rosso senza colpa si impara a
// ignorare, e da quel momento non ferma più nemmeno i rossi veri. La cura non è installare di
// nascosto — è dire la verità in tre colori: verde (ho misurato, passa), rosso (ho misurato, non
// passa), ⚪ (non ho potuto misurare, ecco il comando).

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { ambientePannello } = await import(join(REPO, "cervello/cancello-lotto.mjs"));

// ⚠️ Questi due casi si distinguono per `caso`, non per il testo del motivo. La prima versione di
// questa prova cercava /node_modules/ nel motivo del primo caso — e «senza @types/node» contiene
// quella parola, quindi rompendo apposta il primo controllo la prova restava VERDE. Trovato con la
// mutazione, non rileggendo: la stessa malattia che il cantiere cura, dentro la prova che la cura.
test("sessione appena aperta: niente node_modules → non pronto, con il comando per rimediare", () => {
  const v = ambientePannello(() => false);
  assert.equal(v.pronto, false);
  assert.equal(v.caso, "assente", "dev'essere IL caso della cartella che manca, non un altro qualsiasi");
  assert.equal(v.comando, "npm ci --prefix pannello", "il rimedio dev'essere eseguibile così com'è scritto");
});

test("node_modules a metà (senza @types/node) è la trappola peggiore: sembra pronto e non lo è", () => {
  const v = ambientePannello((f) => f === "node_modules");
  assert.equal(v.pronto, false, "è il caso che produceva «Cannot find name process»");
  assert.equal(v.caso, "incompleto");
  assert.match(v.motivo, /@types\/node/);
});

test("ambiente completo → pronto, e il typecheck vale davvero", () => {
  assert.deepEqual(ambientePannello(() => true), { pronto: true });
});

test("la domanda è fatta al disco vero, non a un elenco di nomi scritto a mano", () => {
  // Se un giorno il Pannello cambiasse cartella, questa prova cade e qualcuno se ne accorge:
  // meglio di un controllo che continua a rispondere «pronto» guardando un posto che non c'è più.
  assert.ok(existsSync(join(REPO, "pannello/package.json")), "il Pannello sta ancora in pannello/");
  const reale = ambientePannello((f) => existsSync(join(REPO, "pannello", f)));
  assert.equal(
    reale.pronto,
    existsSync(join(REPO, "pannello/node_modules/@types/node")),
    "il verdetto deve seguire lo stato vero del disco, qualunque esso sia adesso",
  );
});
