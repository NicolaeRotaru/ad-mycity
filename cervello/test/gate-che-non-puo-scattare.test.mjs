#!/usr/bin/env node
// 🧪 UN FRENO DICHIARATO CHE NON PUÒ SCATTARE.
//
// La pagella misura «correzioni di Nicola legate a un gate che può fallire». Al 29/7: 0 su 269.
// Nel momento in cui quel numero comincia a salire nasce il modo di barare — scrivere accanto a una
// lezione `gate: "node cervello/qualcosa.mjs"` fa +1 anche se quel comando esce 0 comunque vada.
//
// Il rischio non è teorico: è esattamente la malattia più diffusa di questo cantiere (81 difetti
// aperti su 170), «il controllo certifica che una cosa ESISTE, non che FUNZIONA». Qui la si
// impedisce nella misura stessa che dovrebbe dire se stiamo guarendo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { analizzaGate } = await import(join(REPO, "cervello/gate-veri.mjs"));

// Un mondo finto: quali file esistono, e cosa c'è scritto dentro.
const MONDO = {
  "cervello/freno-vero.mjs": "if (soglia > MAX) process.exit(1);",
  "cervello/altro-freno.mjs": "const guardia = true;",
};
const esiste = (f) => Object.prototype.hasOwnProperty.call(MONDO, f);
const leggi = (f) => (esiste(f) ? MONDO[f] : null);

const LEZIONE = (id, gate) => ({ id, testo: "…", caso_studio_nicola: "Nicola 30/7", gate });
const MUTA = (lezione, file, cerca) => ({ lezione, file, cerca, sostituisci: "", nome: "rimetto l'errore" });

test("il caso buono: comando reale + mutazione che rimette l'errore + pezzo ancora lì", () => {
  const v = analizzaGate(
    [LEZIONE("L-1", "node cervello/freno-vero.mjs")],
    [MUTA("L-1", "cervello/freno-vero.mjs", "if (soglia > MAX) process.exit(1);")],
    esiste,
    leggi,
  );
  assert.equal(v.violazioni.length, 0, `mi aspettavo zero violazioni, ho ${JSON.stringify(v.violazioni)}`);
  assert.equal(v.veri.length, 1);
  assert.equal(v.veri[0].mutazioni, 1);
});

test("gate dichiarato senza nessuna mutazione: nessuno l'ha mai visto scattare", () => {
  const v = analizzaGate([LEZIONE("L-2", "node cervello/freno-vero.mjs")], [], esiste, leggi);
  assert.equal(v.veri.length, 0, "non può contare come difesa qualcosa che non è mai stato provato");
  assert.equal(v.violazioni[0].regola, "gate-mai-rotto");
});

test("gate che punta a un file inesistente: puntatore rotto, non difesa", () => {
  const v = analizzaGate(
    [LEZIONE("L-3", "node cervello/freno-che-non-ce.mjs")],
    [MUTA("L-3", "cervello/freno-che-non-ce.mjs", "x")],
    esiste,
    leggi,
  );
  assert.equal(v.violazioni[0].regola, "gate-orfano");
});

test("mutazione che cerca un pezzo sparito: prova un passato che non c'è più", () => {
  const v = analizzaGate(
    [LEZIONE("L-4", "node cervello/freno-vero.mjs")],
    [MUTA("L-4", "cervello/freno-vero.mjs", "una riga cancellata tre versioni fa")],
    esiste,
    leggi,
  );
  assert.equal(v.violazioni[0].regola, "mutazione-cieca", "cieco non è verde: va detto, non passato sopra");
});

test("una frase non è un comando", () => {
  const v = analizzaGate([LEZIONE("L-5", "ricordarsi di controllare le soglie")], [], esiste, leggi);
  assert.equal(v.violazioni[0].regola, "gate-senza-comando");
});

test("le lezioni senza gate non entrano nel conto: il denominatore resta onesto", () => {
  const v = analizzaGate(
    [{ id: "L-6", testo: "una lezione qualsiasi" }, { id: "L-7", gate: "   " }],
    [],
    esiste,
    leggi,
  );
  assert.equal(v.dichiarati, 0, "un gate vuoto o assente non è un gate dichiarato");
  assert.equal(v.violazioni.length, 0);
});

test("più gate insieme: i veri passano e i finti vengono nominati uno per uno", () => {
  const v = analizzaGate(
    [
      LEZIONE("L-8", "node cervello/freno-vero.mjs"),
      LEZIONE("L-9", "node cervello/altro-freno.mjs"),
      LEZIONE("L-10", "node cervello/sparito.mjs"),
    ],
    [MUTA("L-8", "cervello/freno-vero.mjs", "if (soglia > MAX) process.exit(1);")],
    esiste,
    leggi,
  );
  assert.equal(v.dichiarati, 3);
  assert.deepEqual(v.veri.map((x) => x.lezione), ["L-8"]);
  assert.deepEqual(v.violazioni.map((x) => x.lezione).sort(), ["L-10", "L-9"]);
});

test("sul repo VERO il comando gira e il suo verdetto segue i dati, non un'opinione", async () => {
  const { readFileSync } = await import("node:fs");
  const { existsSync } = await import("node:fs");
  const lezioni = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"), "utf8")).lezioni;
  const mutanti = JSON.parse(readFileSync(join(REPO, "cervello/mutanti.json"), "utf8")).mutanti;
  const v = analizzaGate(
    lezioni,
    mutanti,
    (f) => existsSync(join(REPO, f)),
    (f) => {
      try {
        return readFileSync(join(REPO, f), "utf8");
      } catch {
        return null;
      }
    },
  );
  assert.equal(
    v.dichiarati,
    v.veri.length + v.violazioni.length,
    "ogni gate dichiarato dev'essere o vero o violazione: nessuno può sparire dal conto",
  );
});
