#!/usr/bin/env node
// AR-844 — «Una scheda riparata resta contata aperta per sempre, perché il suo stato è scritto nel
// vocabolario dell'altro registro.»
//
// Due registri, due vocabolari, due cartelle di distanza: nel cantiere della MACCHINA l'unico stato
// chiuso è `chiuso`, nel registro del SITO valgono anche `riparato` e `gia_riparato_prima`. Il 27/8
// ne ho trovate 18 nel posto sbagliato — riparate davvero, con la prova che gira e passa, e contate
// aperte da ogni misuratore. Il guardiano delle prove le VEDEVA e usciva 0 lo stesso.
//
// Qui si prova il FRENO che mancava, su ingressi finti: è l'unico modo di verificare che sappia dire
// sia sì sia no. Un contatore che non può dire di no non è un contatore.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { verdettoStati } from "../stati-che-nessuno-capisce.mjs";
import { contaDifetti } from "../stati-cantiere.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: e.message }); }
};

prova("il caso che ha rotto: una scheda in stato «riparato» nel cantiere della macchina è un rosso", () => {
  const conto = contaDifetti([
    { id: "AR-1", stato: "chiuso" },
    { id: "AR-2", stato: "riparato" },
  ]);
  const v = verdettoStati({ conto, tetto: 0 });
  assert.equal(v.rc, 1, "la parola dell'altro registro è passata come se qui volesse dire qualcosa");
  assert.equal(v.quanti, 1);
  assert.match(v.detto, /riparato/, "il motivo deve NOMINARE la parola trovata, o non si sa cosa correggere");
});

prova("il motivo dice il DANNO, non la regola", () => {
  const conto = contaDifetti([{ id: "AR-1", stato: "gia_riparato_prima" }]);
  const v = verdettoStati({ conto, tetto: 0 });
  assert.match(v.detto, /contatore le legge APERTE|legge APERTE/, "«stato non valido» non fa capire perché conta");
});

prova("i quattro stati di casa passano: il freno non dà fastidio a chi scrive giusto", () => {
  const conto = contaDifetti([
    { id: "AR-1", stato: "chiuso" },
    { id: "AR-2", stato: "aperto" },
    { id: "AR-3", stato: "in-corso" },
    { id: "AR-4", stato: "da-riverificare" },
  ]);
  assert.equal(verdettoStati({ conto, tetto: 0 }).rc, 0);
});

prova("«non ho potuto contare» è un ⚪, non un verde — la regola vale anche qui dentro", () => {
  assert.equal(verdettoStati({ conto: contaDifetti("non è una lista"), tetto: 0 }).rc, 2);
  assert.equal(verdettoStati({ conto: null, tetto: 0 }).rc, 2);
  // e senza tetto: il numero c'è, il confronto no
  const conto = contaDifetti([{ id: "AR-1", stato: "riparato" }]);
  const v = verdettoStati({ conto, tetto: null });
  assert.equal(v.rc, 2, "senza tetto ha dato un verdetto che non poteva dare");
  assert.equal(v.quanti, 1, "e il numero lo dice lo stesso: non sapere il tetto non vuol dire non saper contare");
});

prova("il tetto governa: sopra blocca, sotto è debito dichiarato", () => {
  const conto = contaDifetti([{ id: "AR-1", stato: "riparato" }, { id: "AR-2", stato: "riparato" }]);
  assert.equal(verdettoStati({ conto, tetto: 0 }).rc, 1);
  assert.equal(verdettoStati({ conto, tetto: 2 }).rc, 0);
  assert.equal(verdettoStati({ conto, tetto: 1 }).rc, 1, "due sopra un tetto di uno deve bloccare");
});

prova("il freno è MONTATO nel cancello del lotto, non solo scritto", () => {
  // La malattia di casa. E qui c'era già un rilevatore che VEDEVA le 18 schede e usciva 0: quello che
  // mancava non era l'occhio, era la porta. Le righe commentate si scartano prima di cercare — una
  // riga commentata contiene ancora, lettera per lettera, tutto quello che una ricerca cerca.
  const gate = readFileSync(join(QUI, "..", "cancello-lotto.mjs"), "utf8");
  const viva = gate.split("\n").filter((r) => !r.trimStart().startsWith("//")).join("\n");
  assert.match(
    viva,
    /passi\.push\(esegui\((?:(?!\)\);)[\s\S])*stati-che-nessuno-capisce\.mjs/,
    "il cancello non esegue il freno: il tetto non ferma nessuno",
  );
});

prova("SUL CANTIERE VERO: nessuna scheda parla il vocabolario dell'altro registro", () => {
  const c = JSON.parse(readFileSync(join(QUI, "..", "..", "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), "utf8"));
  const conto = contaDifetti(c?.difetti ?? c);
  assert.equal(conto.letto !== false, true, "il cantiere vero non si è potuto contare");
  assert.deepEqual(conto.stati_ignoti, [], `il cantiere vero ha stati che nessun misuratore capisce: ${JSON.stringify(conto.stati_ignoti)}`);
});

const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "ok" : "NON ok"} — ${c.nome}${c.ok ? "" : `\n   ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} passate`);
if (rotte.length) process.exit(1);
