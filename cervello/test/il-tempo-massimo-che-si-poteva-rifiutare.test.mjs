#!/usr/bin/env node
// ⏱️ AR-908 · AR-909 — IL TEMPO MASSIMO CHE SI POTEVA RIFIUTARE
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHE QUESTI CASI STANNO IN UN FILE LORO, E NON DENTRO due-case.test.mjs
// ─────────────────────────────────────────────────────────────────────────────
// Li avevo scritti li, ed era il posto sbagliato per una ragione misurabile: il banco delle
// mutazioni da a ogni prova 420 secondi (`TEMPO_MAX` in non-vacuita.mjs) e `due-case.test.mjs` ne
// prende 626. Il banco non arrivava in fondo, usciva ⚪ su tutt e tre le mutazioni e non diceva
// niente su queste difese. Una prova che il banco non puo eseguire non e una rete: e un file che fa
// sembrare coperto cio che non lo e.
//
// Misurato il 2/9: prova intera 626 s · questi casi da soli, 2 s. La difesa e la stessa; la
// differenza e che adesso qualcuno la puo rompere apposta e guardare se diventa rossa.
//
// E la forma generale, che vale oltre questi due difetti: **una prova lenta e una prova che nessuno
// verifica.** Se il freno di un difetto vive dentro un file che il banco non riesce a far girare,
// quel difetto e coperto sulla carta e scoperto nei fatti.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { misuraIlPasso, quantoPosso } from "../due-case.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
//
// Il 2/9 il cancello ha ucciso questo file a 300 secondi (exit 124) e la stessa cosa si e
// riprodotta qui a 400. La causa non era «e lento»: `misuraIlPasso` riceveva una DURATA e la
// dava intera a tutt e due le sue corse — la casa spoglia e, se quella non usciva zero, il repo
// vero — piu la copia del repo, che non contava nessuno. 240 secondi di budget diventavano 480
// piu la copia, su UN passo solo.
//
// La controprova che dice dove NON era: con `DUE_CASE_BUDGET=1` usciva in ZERO secondi con
// quattro ⚪ dichiarati. Il freno davanti al ciclo funzionava; dentro al ciclo non c era.
// ─────────────────────────────────────────────────────────────────────────────

test("AR-908: quantoPosso torna ZERO quando la scadenza e passata, e non un numero negativo", () => {
  // Un numero negativo passato a spawnSync come timeout non ferma niente: e il modo in cui un
  // freno diventa decorativo senza che nessuno tocchi la riga che lo dichiara.
  assert.equal(quantoPosso(1000, 2000), 0, "scaduto da un secondo");
  assert.equal(quantoPosso(1000, 1000), 0, "scaduto adesso");
  assert.equal(quantoPosso(0, 999_999), 0);
  assert.equal(quantoPosso(undefined, 1000), 0, "una scadenza che non si legge vale «non ho tempo», non «ne ho infinito»");
  assert.equal(quantoPosso(NaN, 1000), 0);
});

test("AR-908: sotto il minimo per misurare qualcosa torna ZERO invece di una corsa che non finira", () => {
  // 19 secondi non bastano a nessuno dei passi del cancello: partire vorrebbe dire spendere 19
  // secondi per farsi uccidere e non sapere niente lo stesso.
  assert.equal(quantoPosso(19_000, 0, 300_000, 20_000), 0);
  assert.equal(quantoPosso(20_000, 0, 300_000, 20_000), 20_000, "esattamente il minimo si puo spendere");
});

test("AR-908: quello che resta non supera MAI il tetto del singolo passo, ne il tempo che avanza", () => {
  assert.equal(quantoPosso(10_000_000, 0, 300_000, 20_000), 300_000, "col budget largo comanda il tetto del passo");
  assert.equal(quantoPosso(50_000, 0, 300_000, 20_000), 50_000, "col budget stretto comanda il budget");
});

test("AR-908 · IL CASO CHE HA ROTTO: due corse dello stesso passo non possono spendere il budget due volte", () => {
  // Il difetto in forma pura, senza far girare niente. Prima: la prima corsa riceveva D, la
  // seconda riceveva D — totale 2D. Adesso tutt e due chiedono all orologio, quindi la seconda
  // vede quello che la prima ha gia consumato e la somma non puo superare il budget.
  const scadenza = 240_000;
  const primaCorsa = quantoPosso(scadenza, 0);              // parto a zero: mi da tutto
  const dopoLaPrima = primaCorsa;                            // ipotesi peggiore: la spende tutta
  const secondaCorsa = quantoPosso(scadenza, dopoLaPrima);   // e adesso quanto mi resta?
  assert.ok(
    primaCorsa + secondaCorsa <= scadenza,
    `le due corse insieme possono spendere ${primaCorsa + secondaCorsa} ms contro un budget di ${scadenza}: e il difetto del 2/9, tornato`,
  );
});

test("AR-908 · SUL CODICE VERO: con la scadenza gia passata misuraIlPasso non copia il repo, dichiara e basta", () => {
  // La meta che nessuna funzione pura puo provare: che il controllo stia DAVANTI alla copia.
  // Se ci fosse dietro, questo caso ci metterebbe i secondi della copia invece dei millisecondi.
  const voce = { passo: { nome: "un passo qualunque", script: "cervello/forma-json.mjs", comando: "node", argomenti: ["cervello/forma-json.mjs"] }, stato: "nato" };
  const prima = process.hrtime.bigint();
  const r = misuraIlPasso(REPO, voce, "HEAD", Date.now() - 1);
  const ms = Number(process.hrtime.bigint() - prima) / 1e6;
  assert.equal(r.esito, "non-misurato", "budget finito vuol dire ⚪ dichiarato, mai un verde");
  assert.match(r.motivo, /budget/, `il motivo deve dire che e stato il budget, non un guasto: «${r.motivo}»`);
  // Il tetto e ASSOLUTO e larghissimo: la copia del repo di questa casa prende secondi, non
  // millisecondi, quindi 2000 ms distinguono «non ha copiato» da «ha copiato» su qualunque
  // macchina, senza diventare la prova fragile di AR-787 che misura la velocita del computer.
  assert.ok(ms < 2000, `ci ha messo ${Math.round(ms)} ms: sta copiando il repo prima di guardare l orologio`);
});


test("AR-909 · IL CASO CHE HA ROTTO: un figlio SORDO al segnale educato viene fermato lo stesso", () => {
  // Il difetto in forma eseguibile. `spawnSync` allo scadere del timeout manda `killSignal`, che
  // per difetto e SIGTERM — e SIGTERM si puo ignorare. Questo finto figlio lo ignora apposta, come
  // fa la suite del cervello: senza `killSignal: "SIGKILL"` la chiamata resta appesa oltre il
  // timeout e chi la fa si fa uccidere da un orologio piu grande, con un 124 che non spiega niente.
  //
  // MISURATO il 2/9 sul passo vero: senza SIGKILL 30.000 ms chiesti e oltre 500.000 senza
  // risposta; con SIGKILL, 30.041.
  const sordo = join(tmpdir(), "due-case-sordo.mjs");
  writeFileSync(sordo, 'process.on("SIGTERM",()=>{});process.on("SIGINT",()=>{});setInterval(()=>{},1000);\n');
  try {
    const t = Date.now();
    const r = spawnSync(process.execPath, [sordo], { timeout: 2000, killSignal: "SIGKILL", encoding: "utf8" });
    const ms = Date.now() - t;
    assert.equal(r.signal, "SIGKILL", `doveva essere fermato col segnale che non si rifiuta, invece: ${r.signal}`);
    // Tetto ASSOLUTO e larghissimo — 15 volte il timeout chiesto. Non misura la velocita della
    // macchina (sarebbe AR-787): distingue «fermato» da «non fermato», che sul caso vero era la
    // differenza fra 30 secondi e oltre 500.
    assert.ok(ms < 30_000, `chiesti 2000 ms, tornato dopo ${ms}: il timeout non sta fermando un figlio sordo`);
  } finally {
    try { rmSync(sordo, { force: true }); } catch { /* un file in piu non vale un verdetto in meno */ }
  }
});

test("AR-909 · e il freno di due-case lo dichiara: chi lancia i passi non usa il segnale educato", () => {
  // ⚠️ DICHIARATO PER QUELLO CHE E: questo caso guarda il SORGENTE. Il caso qui sopra prova il
  // COMPORTAMENTO su un figlio finto; questo pinza che la stessa scelta sia scritta dove serve.
  // Provarlo eseguendo vorrebbe dire far rilanciare a due-case la suite intera dentro una casa
  // spoglia: quattro minuti per una riga.
  const src = readFileSync(join(REPO, "cervello/due-case.mjs"), "utf8");
  const chiamata = src.match(/spawnSync\(passo\.comando[\s\S]{0,220}?\}\);/);
  assert.ok(chiamata, "non trovo piu la chiamata che rilancia i passi: il caso va riscritto, non tolto");
  assert.match(chiamata[0], /killSignal:\s*"SIGKILL"/, "chi rilancia i passi e tornato al segnale che il figlio puo ignorare");
});
