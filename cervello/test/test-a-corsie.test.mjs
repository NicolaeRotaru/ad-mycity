#!/usr/bin/env node
// 🧪 LA PROVA DEL MOTORE DEI TEST A CORSIE.
//
// Il 30/7 i 103 test del cervello giravano uno alla volta: 62 secondi, pagati a ogni giro del
// cancello di uscita, cioè decine di volte per lotto. Farli girare a corsie li porta a 31 — ma
// «veloce» vale zero se il verdetto cambia, e la prima versione infatti cambiava: due test che
// salvano `auto-coscienza/calibrazione.json` (uno anche `registro-fatti.json`) si sovrascrivevano a
// vicenda e diventavano rossi a caso.
//
// Qui si prova la regola che li tiene separati — e si prova che sia una REGOLA e non un elenco di
// nomi, perché un elenco non copre il test scritto domani.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { scriveSulDatoVivo, aCorsie, trovaTest } = await import(join(REPO, "cervello/test-cervello.mjs"));

test("chi scrive sul dato vivo della macchina viene riconosciuto", () => {
  assert.equal(
    scriveSulDatoVivo(`writeFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json"), x)`),
    true,
    "un test che salva un file di auto-coscienza deve andare in fila",
  );
  assert.equal(
    scriveSulDatoVivo(`writeFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/registro-fatti.json"), x)`),
    true,
    "il registro dei fatti è la fonte unica: chi lo riscrive non può girare insieme ad altri",
  );
  assert.equal(
    scriveSulDatoVivo(`rmSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/salute.json"))`),
    true,
    "cancellare il dato vivo è scriverci sopra",
  );
});

test("chi lavora in una cartella temporanea resta in corsia libera", () => {
  assert.equal(scriveSulDatoVivo(`writeFileSync(join(tmpdir(), "prova.json"), x)`), false);
  assert.equal(
    scriveSulDatoVivo(`const c = readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"))`),
    false,
    "leggere il dato vivo non disturba nessuno: solo scriverlo",
  );
  assert.equal(scriveSulDatoVivo(""), false);
});

test("è una regola sul contenuto, non un elenco di nomi", () => {
  // La prova che conta: un test NUOVO, con un nome mai visto, finisce in fila lo stesso.
  const inventato = `import { writeFileSync } from "node:fs";
    writeFileSync("MyCity-Vault/90-Memoria-AI/auto-coscienza/pagella-intelligenza.json", "{}");`;
  assert.equal(scriveSulDatoVivo(inventato), true);
});

test("la classificazione dei test veri è stabile e non è vuota", () => {
  const file = trovaTest(readdirSync(join(REPO, "cervello/test")));
  assert.ok(file.length > 50, `mi aspetto la suite intera, ne ho trovati ${file.length}`);
  const inFila = file.filter((f) => scriveSulDatoVivo(readFileSync(join(REPO, "cervello/test", f), "utf8")));
  assert.ok(inFila.length > 0, "se nessuno risultasse in fila, la regola non starebbe misurando niente");
  assert.ok(
    inFila.length < file.length / 2,
    `se metà suite finisse in fila il parallelismo non servirebbe: ${inFila.length}/${file.length}`,
  );
  // I due che hanno rotto il primo tentativo devono essere dentro: è il caso da cui nasce la regola.
  for (const atteso of ["previsione-aperta-prima.test.mjs", "previsione-banale-dai-dati.test.mjs"]) {
    assert.ok(inFila.includes(atteso), `${atteso} deve stare in fila: è quello che diventava rosso a caso`);
  }
});

test("le corsie eseguono TUTTO e tengono l'ordine dei risultati", async () => {
  const elementi = Array.from({ length: 23 }, (_, i) => i);
  let insiemeMax = 0;
  let ora = 0;
  const esiti = await aCorsie(elementi, 4, async (n) => {
    insiemeMax = Math.max(insiemeMax, ++ora);
    await new Promise((r) => setTimeout(r, 5));
    ora--;
    return n * 2;
  });
  assert.deepEqual(esiti, elementi.map((n) => n * 2), "il risultato dev'essere per posizione, non per ordine di arrivo");
  assert.ok(insiemeMax > 1, "con 4 corsie almeno due lavori devono sovrapporsi, altrimenti è ancora seriale");
  assert.ok(insiemeMax <= 4, `mai più di 4 processi insieme, ne ho visti ${insiemeMax}`);
});

test("una corsia sola resta seriale (il fallback --seriale è vero)", async () => {
  let insiemeMax = 0;
  let ora = 0;
  await aCorsie([1, 2, 3, 4], 1, async () => {
    insiemeMax = Math.max(insiemeMax, ++ora);
    await new Promise((r) => setTimeout(r, 2));
    ora--;
  });
  assert.equal(insiemeMax, 1, "con una corsia non si sovrappone niente: è la via d'uscita quando un test disturba");
});
