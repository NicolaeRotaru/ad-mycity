// 🤫 IL CANCELLO CHE TACEVA PER SETTANTACINQUE MINUTI — AR-915.
//
// IL CASO CHE HA ROTTO, misurato sul referto della corsa 33773513617 del 3/9: il cancello parte
// alle 15:36:20 e la sua PRIMA riga è alle 16:50:46, che è l'errore con cui l'orologio lo uccide.
// Settantaquattro minuti di silenzio, perché stampa il referto intero in fondo — tutti e trentatré
// i passi insieme. Il danno non è il tempo: è che dopo un kill nessuno sa QUALE passo lo stava
// spendendo, quindi la cura dopo si sceglie a indovinare. È la malattia che questo cancello
// sorveglia — un guardiano che tace, e il silenzio letto come «niente da dire» — fatta da lui.
//
// Queste prove ESEGUONO: lanciano processi figli veri e guardano dove finiscono le righe.
import { test } from "node:test";
import assert from "node:assert/strict";
import { esegui, rigaAvanzamento } from "../cancello-lotto.mjs";

/** Cattura ciò che il codice scrive sui due canali mentre gira `fn`. */
function ascolta(fn) {
  const err = [];
  const out = [];
  const veroErr = process.stderr.write.bind(process.stderr);
  const veroOut = process.stdout.write.bind(process.stdout);
  process.stderr.write = (c, ...r) => (err.push(String(c)), true);
  process.stdout.write = (c, ...r) => (out.push(String(c)), true);
  try {
    return { valore: fn(), err: err.join(""), out: out.join("") };
  } finally {
    process.stderr.write = veroErr;
    process.stdout.write = veroOut;
  }
}

const nodo = (codice) => [process.execPath, ["-e", `process.exit(${codice})`]];

test("i quattro esiti hanno quattro segni diversi: verde, rosso, cieco, ucciso", () => {
  const segni = [
    rigaAvanzamento({ nome: "x", codice: 0, ms: 0 }),
    rigaAvanzamento({ nome: "x", codice: 1, ms: 0 }),
    rigaAvanzamento({ nome: "x", codice: 2, ms: 0 }),
    rigaAvanzamento({ nome: "x", codice: 124, ucciso: true, ms: 0 }),
  ].map((r) => r.split(" ")[0]);
  assert.equal(new Set(segni).size, 4, `quattro esiti, quattro segni: ${segni.join(" ")}`);
});

test("la riga porta il nome del passo e i secondi che è costato", () => {
  const r = rigaAvanzamento({ nome: "test del cervello", codice: 0, ms: 561_300 });
  assert.match(r, /test del cervello/, "senza il nome, sapere che «un passo» è finito non serve a niente");
  assert.match(r, /561\.3 s/, "e il numero è il costo: è l'unica cosa che dice dove va il tempo");
});

test("IL CASO CHE HA ROTTO: un passo che finisce lo dice SUBITO, non alla fine del cancello", () => {
  const [cmd, args] = nodo(0);
  const { valore, err } = ascolta(() => esegui("un passo qualunque", cmd, args));
  assert.equal(valore.codice, 0, "il passo è verde");
  const righe = err.trim().split("\n").filter(Boolean);
  assert.equal(righe.length, 1, `una riga per passo, non zero e non due: ${JSON.stringify(righe)}`);
  assert.match(righe[0], /un passo qualunque/, "e la riga nomina il passo che è appena finito");
});

test("anche il passo ROSSO parla: tacere sul rosso lo consegna al referto, che un kill si porta via", () => {
  const [cmd, args] = nodo(1);
  const { valore, err } = ascolta(() => esegui("un passo che fallisce", cmd, args));
  assert.equal(valore.codice, 1);
  assert.match(err, /un passo che fallisce/, "il rosso si dice quando succede, non solo in fondo");
  assert.match(err.split(" ")[0], /❌/, "e si vede che è un rosso");
});

test("il difetto opposto: la riga NON esce su stdout, o con --json il JSON diventa illeggibile", () => {
  const [cmd, args] = nodo(0);
  const { out } = ascolta(() => esegui("un passo qualunque", cmd, args));
  assert.equal(out, "", `stdout deve restare pulito per il JSON, invece: ${JSON.stringify(out)}`);
});

test("i secondi sono MISURATI, non zero fisso: un passo lento si vede", () => {
  const { err } = ascolta(() => esegui("un passo lento", process.execPath, ["-e", "Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 350)"]));
  const secondi = Number(/([\d.]+) s/.exec(err)?.[1]);
  assert.ok(secondi >= 0.3, `un passo da 350 ms deve risultare ≥ 0,3 s, invece ${secondi}`);
  assert.ok(secondi < 30, `…e non un numero inventato: ${secondi}`);
});
