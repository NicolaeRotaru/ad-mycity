#!/usr/bin/env node
// 🧪 AR-814 — la coda la scrivono in quattro, e la card ne guardava una.
//
// Il 25/8 Nicola ha dato il via alla card #174. Il passo 2 rende `lavori.negozio_id` obbligatorio,
// e la card poneva UNA condizione: «il Pannello nuovo dev'essere online». Quella condizione era
// vera — deploy f0e747dae, verificato su Vercel. Ma nella coda scrivono in quattro punti, e tre
// sono sul VPS: il ri-accodamento delle cadenze (due corpi), il recupero della sentinella, la
// metabolizzazione del worker. Nessuno dei tre metteva la corsia.
//
// Dare il passo 2 in quel momento avrebbe fatto fallire ogni ri-accodamento, ogni recupero e ogni
// metabolizzazione: «chat, giri, report, sentinelle. La macchina si ferma» — il danno che la card
// diceva di voler evitare, causato dalla card stessa.
//
// La precondizione era scritta guardando il posto da cui era arrivata la scoperta (il Pannello),
// non tutti i posti da cui il danno può arrivare. Stessa forma di AR-807 e AR-813.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { corpoDaJq, filtriJq, puntiCheScrivono, CORSIA } from "../lavori-hanno-la-corsia.mjs";
import { corpoRecupero } from "../sentinella-motore.mjs";

const GUARDIANO = join(import.meta.dirname, "..", "lavori-hanno-la-corsia.mjs");

// ── il guardiano montato, sul repo vero ────────────────────────────────────

test("sul repo vero ogni riga che nasce nella coda porta la corsia", () => {
  const r = spawnSync(process.execPath, [GUARDIANO, "--json"], { encoding: "utf8" });
  assert.equal(r.status, 0, `il guardiano deve uscire 0, invece:\n${r.stdout}${r.stderr}`);
  const v = JSON.parse(r.stdout);
  assert.equal(v.senza_corsia.length, 0);
  assert.deepEqual(v.non_misurati, [], "un punto non misurato è ⚪, e ⚪ non è un verde");
  assert.ok(v.corpiControllati >= 4, `mi aspetto almeno i quattro punti noti, trovati ${v.corpiControllati}`);
});

test("trova davvero i tre file che scrivono nella coda, non una lista vuota", () => {
  const punti = puntiCheScrivono();
  assert.ok(Array.isArray(punti) && punti.length >= 3, `perimetro sospetto: ${JSON.stringify(punti)}`);
  for (const atteso of ["cervello/lib-cadenza.sh", "cervello/worker.sh", "cervello/sentinella-motore.mjs"]) {
    assert.ok(punti.includes(atteso), `manca ${atteso}: un guardiano con un perimetro bucato è peggio di nessun guardiano`);
  }
});

// ── il cuore: costruisce i corpi per davvero ───────────────────────────────

test("corpoDaJq ESEGUE il filtro invece di leggerlo", () => {
  const c = corpoDaJq('{stato:"in_attesa", tipo:$t, richiesta:$r, esperto:$e, negozio_id:"centro"}');
  assert.equal(c.stato, "in_attesa");
  assert.equal(c[CORSIA], "centro");
  assert.equal(c.tipo, "x", "le variabili devono essere riempite, altrimenti jq fallisce e il corpo è null");
});

test("un filtro di creazione senza corsia produce un corpo che non ce l'ha", () => {
  const c = corpoDaJq('{stato:"in_attesa", tipo:$t, richiesta:$r, esperto:$e}');
  assert.ok(c, "il filtro è valido: deve costruirsi");
  assert.equal(c[CORSIA], undefined, "è questo il caso che il guardiano deve chiamare rosso");
});

test("un filtro rotto non diventa un verde: torna null", () => {
  assert.equal(corpoDaJq('{stato:"in_attesa", tipo:$t, richiesta:'), null);
});

// ── la distinzione che al primo giro mi ero perso ──────────────────────────

test("le MODIFICHE non vengono contate come creazioni", () => {
  const testo = `
    a="$(jq -n --arg r "$out" '{stato:"fatto", risultato:$r}')"
    b="$(jq -n '{stato:"in_corso", worker_owner:$w, updated_at:$u}')"
  `;
  assert.deepEqual(filtriJq(testo), [], "cambiare lo stato di una riga non deve chiedere il negozio: la riga ce l'ha già");
});

test("le CREAZIONI vengono riconosciute", () => {
  const testo = `x="$(jq -n --arg t "$tipo" '{stato:"in_attesa", tipo:$t, richiesta:$r, esperto:$e}')"`;
  assert.equal(filtriJq(testo).length, 1, "chi mette tipo e richiesta sta facendo nascere una riga");
});

// ── il costruttore JavaScript, chiamato davvero ────────────────────────────

test("il recupero della sentinella nasce con la corsia del centro", () => {
  const c = corpoRecupero({ tipo: "giro", descrizione: "il giro delle 8" });
  assert.equal(c[CORSIA], "centro");
  assert.equal(c.stato, "in_attesa");
  assert.match(c.richiesta, /il giro delle 8/, "la descrizione deve finire nella richiesta, o il recupero è muto");
});

// ── il guardiano deve saper diventare ROSSO, non solo restare verde ─────────
//
// Questa prova esiste perché senza di lei una mutazione NON mordeva: togliendo il controllo della
// corsia dal guardiano, tutto restava verde. Il motivo è che sul repo vero la corsia c'è su ogni
// corpo, quindi il caso rosso lì non capita mai. Un guardiano che non si è mai visto bocciare
// nessuno è indistinguibile da uno che non guarda.

test("su un repo dove una riga nasce senza corsia, il guardiano diventa rosso", () => {
  const dir = mkdtempSync(join(tmpdir(), "corsia-"));
  try {
    const g = (...a) => execFileSync("git", a, { cwd: dir, encoding: "utf8", stdio: "pipe" });
    g("init", "-q", "-b", "main");
    writeFileSync(
      join(dir, "cattivo.sh"),
      `body="$(jq -n --arg t "$tipo" --arg r "$ric" --arg e "$esp" '{stato:"in_attesa", tipo:$t, richiesta:$r, esperto:$e}')"\n` +
        `curl -fsS -X POST "$SUPABASE_URL/rest/v1/lavori" -d "$body"\n`,
    );
    g("add", "-A");

    const r = spawnSync(process.execPath, [GUARDIANO, "--json"], {
      env: { ...process.env, LAVORI_CORSIA_ROOT: dir },
      encoding: "utf8",
    });
    assert.equal(r.status, 1, `una riga senza corsia deve essere un rosso, invece:\n${r.stdout}${r.stderr}`);
    const v = JSON.parse(r.stdout);
    assert.equal(v.senza_corsia.length, 1);
    assert.equal(v.senza_corsia[0].file, "cattivo.sh");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("un punto che scrive nella coda e non so costruire è ⚪, non verde", () => {
  const dir = mkdtempSync(join(tmpdir(), "corsia-"));
  try {
    const g = (...a) => execFileSync("git", a, { cwd: dir, encoding: "utf8", stdio: "pipe" });
    g("init", "-q", "-b", "main");
    // JavaScript non cablato in COSTRUTTORI_JS: il corpo non so costruirlo.
    writeFileSync(join(dir, "ignoto.mjs"), `fetch(url + "/rest/v1/lavori", { method: "POST" });\n// -X POST\n`);
    g("add", "-A");

    const r = spawnSync(process.execPath, [GUARDIANO, "--json"], {
      env: { ...process.env, LAVORI_CORSIA_ROOT: dir },
      encoding: "utf8",
    });
    assert.equal(r.status, 2, "⚪ non è mai un verde: chi aggiunge uno scrittore deve cablarlo");
    assert.equal(JSON.parse(r.stdout).non_misurati.length, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
