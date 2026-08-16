// ⏳ UNA GUARDIA NON DEVE MAI RESTARE APPESA AD ASPETTARE — la prova che nasce da un difetto vero.
//
// COSA È SUCCESSO, il 16/8. Per scrivere nel libro mastro QUALE strumento avesse svegliato il
// sorvegliante, gli avevo aggiunto una lettura sincrona del payload dell'evento. Quella guardia non
// aveva mai letto il canale d'ingresso: il suo giudizio nasce dal diff. Con la lettura dentro, un
// chiamante che apre il canale e non lo chiude mai lasciava il processo appeso PER SEMPRE.
//
// PERCHÉ NON L'HO VISTO SUBITO, ed è la parte che vale. Avevo messo un guardia `isTTY`, convinto che
// bastasse: copre il file lanciato da un terminale, non il chiamante che tiene il canale aperto —
// che è il caso normale quando un programma ne esegue un altro. E la prima misura con cui l'ho
// cercato era cieca: `sleep 60 | node …` sotto un tempo massimo misura il `sleep`, non il node.
// Due errori nello stesso quarto d'ora, e nessuno dei due l'avrebbe trovato una prova che non gira.
//
// COSA DIFENDE QUESTA PROVA. Il sorvegliante gira dopo OGNI modifica: se si pianta, si pianta tutto
// ciò che lo esegue — la sessione, il programma delle prove, la CI. È l'unica guardia della casa che
// non ha nessun motivo di leggere il canale d'ingresso, e questa prova la tiene così.
//
// NOTA SULLE ALTRE GUARDIE. `pre-scrittura`, `mano-fermata` e `misura-cieca` il payload lo leggono
// APPOSTA — senza, non saprebbero su cosa stanno decidendo. Per loro l'attesa è il mestiere, e chi
// le esegue chiude il canale. Qui non si prova quello: si prova che chi NON deve leggere, non legga.

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ATTESA_MASSIMA = 15_000;

/**
 * Esegue un comando lasciando il canale d'ingresso APERTO e mai scritto, e dice se è finito da solo.
 * È esattamente la condizione in cui un programma ne esegue un altro senza avere niente da passargli.
 */
function finisceDaSolo(argomenti) {
  return new Promise((risolvi) => {
    const p = spawn(process.execPath, argomenti, { cwd: REPO, stdio: ["pipe", "ignore", "ignore"] });
    const sveglia = setTimeout(() => {
      p.kill("SIGKILL");
      risolvi({ finito: false, codice: null });
    }, ATTESA_MASSIMA);
    p.on("exit", (codice) => {
      clearTimeout(sveglia);
      risolvi({ finito: true, codice });
    });
    // Il canale resta aperto di proposito: NON si chiude. È il caso che ha rotto.
  });
}

test("LA REGOLA CHE CONTA: il sorvegliante in forma hook finisce anche se nessuno chiude il canale", async () => {
  const esito = await finisceDaSolo(["cervello/sorvegliante.mjs", "--hook"]);
  assert.equal(
    esito.finito,
    true,
    "è rimasto appeso ad aspettare un payload che non arriverà: chi lo esegue si pianta con lui",
  );
  assert.equal(esito.codice, 0, "in forma hook esce sempre 0: avvisa, non blocca");
});

test("e finisce anche quando il canale è chiuso e vuoto, senza inventarsi un verdetto", async () => {
  const esito = await new Promise((risolvi) => {
    const p = spawn(process.execPath, ["cervello/sorvegliante.mjs", "--hook"], { cwd: REPO, stdio: ["pipe", "ignore", "ignore"] });
    const sveglia = setTimeout(() => {
      p.kill("SIGKILL");
      risolvi({ finito: false, codice: null });
    }, ATTESA_MASSIMA);
    p.stdin.end();
    p.on("exit", (codice) => {
      clearTimeout(sveglia);
      risolvi({ finito: true, codice });
    });
  });
  assert.equal(esito.finito, true);
  assert.equal(esito.codice, 0);
});
