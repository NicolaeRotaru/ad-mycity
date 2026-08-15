#!/usr/bin/env node
// 🧪 AR-711 — quando il guardiano dei gate è cieco, il suo referto cambiava forma.
//
// LA STORIA. In `--json` la strada normale stampava `{quando, dichiarati, veri, violazioni,
// bloccanti, inAttesa, …}`. La strada cieca stampava `{ok, cieco, motivo}`: nessun campo in comune.
// Chi legge fa `dati.violazioni.length` e si becca un errore invece di leggere una cecità
// dichiarata. La cecità c'era, ma detta in una lingua che il lettore non parla — e chi si becca un
// errore quasi sempre lo ingoia e tira dritto, cioè esattamente come se avesse letto un verde.
//
// LA CURA: un involucro solo con il verdetto dentro, la forma che `verdettoCapacita` usa già in
// casa. Le chiavi sono le stesse in tutti e tre gli esiti, e chi legge un conto guarda prima
// `verdetto.stato` — quando è `cieco`, gli elenchi sono vuoti perché non è stato guardato niente, e
// `misurato: false` lo dice a chiare lettere.
//
// LA PROVA gira su tre livelli:
//   ① la funzione pura: le chiavi del referto cieco e di quello misurato sono le STESSE;
//   ② il comando VERO sul repo vero: le sue chiavi sono quelle della funzione (cioè ci passa);
//   ③ il comando VERO reso CIECO in una sabbiera: stesse chiavi, uscita 2, `ok` falso.
// Senza il ③ questa prova misurerebbe solo la strada che funziona già.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, copyFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { refertoGate, verdettoGate, analizzaGate } = await import(join(REPO, "cervello/gate-veri.mjs"));

const AMBIENTE = { ...process.env };
delete AMBIENTE.SUPABASE_URL;
delete AMBIENTE.SUPABASE_SERVICE_KEY;

const chiavi = (o) => Object.keys(o).sort();

test("⬇️ AR-711 — il referto del cieco ha le STESSE chiavi di quello che ha misurato", () => {
  const esito = analizzaGate([], [], () => true, () => "");
  const misurato = refertoGate({ quando: "2026-08-15 00:00", esito, verdetto: verdettoGate(esito) });
  const cieco = refertoGate({
    quando: "2026-08-15 00:00",
    esito: null,
    verdetto: verdettoGate(null),
  });

  assert.deepEqual(
    chiavi(cieco),
    chiavi(misurato),
    "il referto cambia forma quando è cieco: chi lo legge trova un oggetto che non conosce",
  );
  // Il campo che il lettore usa per contare esiste in tutti e due i casi: non esplode più.
  assert.equal(Array.isArray(cieco.violazioni), true, "`violazioni` sparisce quando siamo ciechi: il lettore esplode");
  assert.equal(cieco.violazioni.length, 0, "un elenco che non è stato guardato deve essere vuoto, non inventato");
});

test("⬇️ AR-711 — quel vuoto NON si può scambiare per un verde", () => {
  const cieco = refertoGate({ quando: "x", esito: null, verdetto: verdettoGate(null) });
  assert.equal(cieco.verdetto.stato, "cieco", "il verdetto di chi non ha misurato non dice «cieco»");
  assert.equal(cieco.verdetto.codice, 2, "la cecità non esce 2: nel contratto di casa 1 vuol dire «ho trovato qualcosa»");
  assert.equal(cieco.ok, false, "il referto del cieco si dichiara ok");
  assert.equal(cieco.cieco, true, "manca la bandierina che dice al lettore vecchio di fermarsi");
  assert.equal(cieco.misurato, false, "il referto dice di aver misurato mentre non ha letto niente");
  assert.match(cieco.motivo, /\S/, "una cecità senza il perché non si può riparare");
});

test("AR-711 — il verdetto verde non si può dare senza aver misurato", () => {
  const sano = analizzaGate([], [], () => true, () => "");
  assert.equal(verdettoGate(sano).stato, "verde", "un registro leggibile e senza gate finti non è verde: la prova misura il caso sbagliato");
  assert.notEqual(verdettoGate(null).stato, "verde", "senza esito il guardiano si dichiara verde");
});

test("⬇️ AR-711 — il comando VERO, sano e cieco, parla la stessa lingua", (t) => {
  // ② il comando vero sul repo vero.
  const r = spawnSync(process.execPath, [join(REPO, "cervello/gate-veri.mjs"), "--json"], {
    cwd: REPO,
    env: AMBIENTE,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  assert.notEqual(r.status, null, `il guardiano non è nemmeno partito: ${r.error?.message}`);
  let sano;
  try {
    sano = JSON.parse(r.stdout);
  } catch (e) {
    assert.fail(`il referto sano non è JSON (${e.message}): ${r.stdout.slice(0, 300)}`);
  }

  // ③ lo stesso comando in una sabbiera dove il registro delle lezioni non si lascia leggere.
  // La sabbiera è una copia dei soli script: `AD_ROOT` è la cartella che sta sopra `cervello/`,
  // quindi i registri li cerca là dentro — e là dentro ce n'è uno rotto apposta.
  const sb = mkdtempSync(join(tmpdir(), "gate-veri-cieco-"));
  try {
    mkdirSync(join(sb, "cervello"), { recursive: true });
    mkdirSync(join(sb, "MyCity-Vault/90-Memoria-AI/auto-coscienza"), { recursive: true });
    for (const f of readdirSync(join(REPO, "cervello"))) {
      if (f.endsWith(".mjs")) copyFileSync(join(REPO, "cervello", f), join(sb, "cervello", f));
    }
    writeFileSync(join(sb, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"), "{ questo non è JSON");

    const c = spawnSync(process.execPath, [join(sb, "cervello/gate-veri.mjs"), "--json"], {
      cwd: sb,
      env: AMBIENTE,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    assert.notEqual(c.status, null, `il guardiano cieco non è partito: ${c.error?.message}`);
    let cieco;
    try {
      cieco = JSON.parse(c.stdout);
    } catch (e) {
      assert.fail(`in --json il cieco non stampa JSON (${e.message}): ${c.stdout.slice(0, 300)} · ${c.stderr.slice(0, 300)}`);
    }

    assert.deepEqual(
      chiavi(cieco),
      chiavi(sano),
      "il comando vero cambia forma quando è cieco: la funzione è a posto ma il comando non ci passa",
    );
    assert.equal(c.status, 2, `la cecità è uscita ${c.status}: nel contratto di casa 1 vuol dire «ho misurato e ho trovato qualcosa»`);
    assert.equal(cieco.verdetto?.stato, "cieco", "il referto del comando cieco non dichiara la cecità nel verdetto");
    assert.equal(cieco.misurato, false, "il comando cieco dice di aver misurato");
    assert.equal(sano.misurato, true, "il comando sano dice di NON aver misurato: la sabbiera sta misurando la cosa sbagliata");
  } finally {
    rmSync(sb, { recursive: true, force: true });
  }
});
