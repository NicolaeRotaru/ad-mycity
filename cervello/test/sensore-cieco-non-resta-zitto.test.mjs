#!/usr/bin/env node
// ⚪ AR-859 — la funzione `sensore` di cervello/giro-esito.sh, ESEGUITA per davvero.
//
// PERCHÉ ESISTE. In questo lotto nove attrezzi hanno imparato a dire «non ho potuto misurare»
// uscendo 2. Cinque di loro il giro li lanciava dentro una pipe: `node X.mjs | esito_righe 3 ||
// true`. In una pipe l'esito che arriva è quello dell'ULTIMO comando, che va sempre bene — quindi
// gli avevamo appena dato una voce e poi gliela tappavamo.
//
// `guardiano()` non andava bene per loro: marca un «freno scattato» a ogni uscita non-zero, e questi
// escono 1 tutti i giorni per ragioni legittime (il Bilancio Vivo dice 1 finché il margine
// realizzato è zero, che oggi è la verità dell'azienda). Serviva una porta più stretta: grida solo
// sul 2, e non ferma il giro.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";

const QUI = import.meta.dirname;
const SH = join(QUI, "..", "giro-esito.sh");

let passate = 0;
const rossi = [];
function prova(nome, fn) {
  try { fn(); passate++; console.log(`# ok — ${nome}`); }
  catch (e) { rossi.push(nome); console.log(`# NON ok — ${nome}\n#    ${e.message.split("\n")[0]}`); }
}

/** Lancia `sensore` VERA su un finto attrezzo che esce col codice che dico io. */
function lancia(codice, righe = 2) {
  const dir = mkdtempSync(join(tmpdir(), "sensore-"));
  try {
    writeFileSync(join(dir, "finto.mjs"), `console.log("riga uno");console.log("riga due");process.exit(${codice});`);
    const r = execFileSync("bash", ["-c", `. "${SH}"; sensore "finto.mjs" ${righe}; echo "RC=$?"`], {
      env: { ...process.env, SCRIPT_DIR: dir },
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { out: r, rc: Number(/RC=(\d+)/.exec(r)?.[1]) };
  } catch (e) {
    // execFileSync lancia se bash esce non-zero: qui bash esce 0 grazie all'echo finale.
    throw new Error(`bash è uscito male: ${e.stderr || e.message}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Come sopra ma tenendo separato lo stderr, che è dove va il grido del ⚪. */
function lanciaConErr(codice) {
  const dir = mkdtempSync(join(tmpdir(), "sensore-"));
  try {
    writeFileSync(join(dir, "finto.mjs"), `console.log("riga");process.exit(${codice});`);
    const r = execFileSync("bash", ["-c", `. "${SH}"; sensore "finto.mjs" 2 2>/tmp/_sens_err; echo "RC=$?"; cat /tmp/_sens_err`], {
      env: { ...process.env, SCRIPT_DIR: dir },
      encoding: "utf8",
    });
    return r;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

prova("IL CUORE: l'esito NON si perde, nemmeno se le righe si stampano lo stesso", () => {
  // È tutta la differenza con `| esito_righe N`: lì l'esito che arriva è quello di `tail`.
  assert.equal(lancia(2).rc, 2, "il 2 del cieco non arriva a chi ha chiamato");
  assert.equal(lancia(1).rc, 1, "l'1 del verdetto non arriva a chi ha chiamato");
  assert.equal(lancia(0).rc, 0);
});

prova("sul ⚪ grida, e lo dice in parole, non con un codice", () => {
  const r = lanciaConErr(2);
  assert.match(r, /non ha potuto misurare/, "il ⚪ passa in silenzio: è il difetto, non la cura");
  assert.match(r, /non vale un verde/, "deve dire perché conta, o è solo rumore");
  assert.match(r, /finto\.mjs/, "e QUALE strumento, o non si sa cosa riparare");
});

prova("ma su un verdetto vero (1) NON grida: quello è un attrezzo che ha fatto il suo mestiere", () => {
  // Questi sensori escono 1 tutti i giorni per ragioni legittime. Gridare anche lì vorrebbe dire
  // insegnare a chi legge il giro che quella riga si salta.
  assert.doesNotMatch(lanciaConErr(1), /non ha potuto misurare/, "un ❌ vero non è un ⚪");
});

prova("e su verde tace del tutto", () => {
  assert.doesNotMatch(lanciaConErr(0), /non ha potuto misurare/);
});

prova("le righe dell'attrezzo si vedono comunque: non è un imbavagliatore", () => {
  assert.match(lancia(2).out, /riga due/, "chi legge il giro deve vedere cosa ha detto l'attrezzo");
});

prova("e usa il filtro di casa, non un tail: la riga d'errore in cima non deve sparire", () => {
  // Ci sono cascato scrivendo questa funzione, e l'ha trovato il riguardo del perimetro. Avevo messo
  // `tail -N`, cioe' esattamente la versione ingenua che AR-307 aveva gia' curato: un attrezzo che
  // esplode alla PRIMA riga e poi stampa coda decorativa perde l'errore vero dal log, e chi legge
  // vede un guardiano «passato» che in realta' era morto subito.
  const dir = mkdtempSync(join(tmpdir(), "sensore-"));
  try {
    writeFileSync(join(dir, "finto.mjs"), [
      'console.error("ERRORE: esploso alla prima riga");',
      'for (let i = 0; i < 8; i++) console.log("riga decorativa " + i);',
      "process.exit(2);",
    ].join("\n"));
    // `|| true` perche' sensore RITORNA 2 (ed e' il punto): senza, bash esce 2 ed execFileSync lancia.
    const r = execFileSync("bash", ["-c", `. "${SH}"; sensore "finto.mjs" 3 || true`], {
      env: { ...process.env, SCRIPT_DIR: dir }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    });
    assert.match(r, /ERRORE: esploso alla prima riga/, "l'errore vero e' sparito dal log: e' il difetto di AR-307 rifatto");
    assert.match(r, /riga decorativa 7/, "e la coda deve restare, o non si vede come e' finita");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("SUL GIRO VERO: i cinque attrezzi curati non stanno più dentro una pipe", () => {
  // La regola ha i suoi casi, ma se nessuno la chiama non serve a niente: è la forma ② del catalogo.
  // Le righe commentate si scartano prima di cercare — una riga commentata contiene ancora, lettera
  // per lettera, ciò che si cerca.
  const viva = readFileSync(join(QUI, "..", "giro.sh"), "utf8")
    .split("\n").filter((r) => !r.trimStart().startsWith("#")).join("\n");
  for (const t of ["sentinella-fonti", "guardiano-tempo", "metabolismo", "bilancio-vivo", "midollo-spinale"]) {
    assert.match(viva, new RegExp(`sensore "${t}\\.mjs"`), `${t} non passa da sensore()`);
    assert.doesNotMatch(viva, new RegExp(`\\$SCRIPT_DIR/${t}\\.mjs"[^|\\n]*\\| esito_righe`), `${t} è ancora dentro una pipe`);
  }
});

console.log(`# ${passate}/${passate + rossi.length} passate`);
if (rossi.length) process.exit(1);
