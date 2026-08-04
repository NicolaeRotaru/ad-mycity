#!/usr/bin/env node
// 🧪 UNO SPAZIO HA FERMATO LA MACCHINA PER QUATTRO GIORNI (AR-522).
//
// La catena, letta dal journal del server il 4/8 alle 04:02:
//   ① `tasso-lezioni` riscrive `apprendimento.json` con DUE spazi. Quel file ne ha UNO.
//   ② Per git non è un campo cambiato: è il file intero riscritto, 1.400 righe.
//   ③ Il guardiano della forma blocca il commit — giustamente, esiste per questo.
//   ④ Il commit bloccato lascia l'albero sporco.
//   ⑤ `git rebase` si rifiuta di partire su un albero sporco: «cannot rebase: You have unstaged changes».
//   ⑥ Niente rebase, niente push: «MEMORIA NON PUBBLICATA».
// Il giro lavorava dieci minuti a ogni corsa e non ne usciva niente. Quattro giorni e diciassette ore.
//
// La cura non è «scrivi con un solo spazio» — sarebbe il perimetro dedotto di AR-347, e domani un
// nono file con un'altra indentazione rifarebbe tutto. La cura è che l'indentazione la decide il FILE
// CHE ESISTE, non chi scrive.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { indentazioneDi, testoJson, scriviJsonAtomico } from "../scrivi-json.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("l'indentazione si legge dal file, non si sceglie", () => {
  const dove = mkdtempSync(join(tmpdir(), "indent-"));
  try {
    const uno = join(dove, "uno.json");
    writeFileSync(uno, '{\n "a": 1,\n "b": 2\n}\n');
    assert.equal(indentazioneDi(uno), 1);

    const due = join(dove, "due.json");
    writeFileSync(due, '{\n  "a": 1\n}\n');
    assert.equal(indentazioneDi(due), 2);

    const quattro = join(dove, "quattro.json");
    writeFileSync(quattro, '{\n    "a": 1\n}\n');
    assert.equal(indentazioneDi(quattro), 4, "non si conoscono solo 1 e 2: si legge quello che c'è");

    assert.equal(indentazioneDi(join(dove, "mai-esistito.json")), 2, "su un file nuovo non c'è niente da conservare");
  } finally {
    rmSync(dove, { recursive: true, force: true });
  }
});

test("dal vivo: riscrivere un file a un spazio non lo trasforma in un file a due", () => {
  const dove = mkdtempSync(join(tmpdir(), "riscrivi-"));
  try {
    const p = join(dove, "registro.json");
    writeFileSync(p, '{\n "aggiornato": "ieri",\n "voci": [\n  {\n   "id": "A"\n  }\n ]\n}\n');
    const dati = JSON.parse(readFileSync(p, "utf8"));
    dati.aggiornato = "oggi";
    scriviJsonAtomico(p, dati);

    const dopo = readFileSync(p, "utf8").split("\n");
    assert.equal(dopo[1], ' "aggiornato": "oggi",', "un solo spazio, e solo il campo cambiato è cambiato");
    assert.ok(!dopo.some((r) => /^ {2}"/.test(r)), "nessuna riga è passata a due spazi: sarebbe l'intero file riscritto");
  } finally {
    rmSync(dove, { recursive: true, force: true });
  }
});

test("testoJson accetta l'indentazione invece di imporla", () => {
  assert.equal(testoJson({ a: 1 }, 1), '{\n "a": 1\n}\n');
  assert.equal(testoJson({ a: 1 }), '{\n  "a": 1\n}\n', "senza indicazioni resta due, come prima");
});

test("chi scriveva a mano adesso passa dall'aiutante", () => {
  // La regressione da cui nasce tutto: due `JSON.stringify(appr, null, 2)` dentro tasso-lezioni.
  // Se qualcuno le rimette, il server torna a bloccarsi al primo giro e nessuno lo collega a questo.
  const sorgente = readFileSync(join(REPO, "cervello/tasso-lezioni.mjs"), "utf8");
  assert.ok(!/JSON\.stringify\(appr,\s*null,\s*2\)/.test(sorgente), "l'indentazione non si sceglie qui: la conserva scriviJsonAtomico");
  assert.match(sorgente, /scriviJsonAtomico\(APPR_PATH, appr\)/, "e le scritture passano davvero dall'aiutante");
});

test("il file vero del repo ha ancora un solo spazio", () => {
  // Non un caso costruito: il file che ha fermato la macchina, misurato dov'è.
  const p = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");
  assert.equal(indentazioneDi(p), 1, "se diventa 2 vuol dire che qualcuno l'ha riscritto tutto, ed è il guasto");
});
