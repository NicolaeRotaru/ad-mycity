#!/usr/bin/env node
// AR-399 — «Quando il worker rimanda la pubblicazione della memoria, a riprenderla non c'è nessuno.»
//
// `sync_vault` ha quattro esiti (0 pubblicata · 1 push fallito/cancello rosso · 2 rimandata ·
// 3 token assente) e il chiamante ne leggeva UNO. Con rc=2 e rc=3 il lavoro si chiudeva «fatto»
// sapendo che la memoria non era mai uscita, e il ripescaggio era affidato all'arrivo del lavoro
// SUCCESSIVO: a coda vuota o worker fermo non arrivava mai.
//
// La prova esegue la traduzione vera (`applica_esito_sync`) e guarda il marcatore su disco: c'è?
// sparisce quando la memoria esce? il worker sa quando è ora di riprovare? alza la voce se la
// memoria è ferma da ore? Il difetto è sopravvissuto perché tutto questo viveva in worker.sh, dove
// una prova può solo leggere.
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";
import { esitoSync, ripresaPubblicazione } from "../esito-scrittura.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");
const LIB = join(CERVELLO, "lib-esito-lavoro.sh");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

function repoFinto() {
  const r = mkdtempSync(join(tmpdir(), "sync-pendente-"));
  mkdirSync(join(r, ".git"), { recursive: true });
  return r;
}

function sh(repo, corpo) {
  const script = `set -uo pipefail
exec 2>&1
REPO="${repo}"; SCRIPT_DIR="${CERVELLO}"
SUPABASE_URL="http://finto"; AUTH=(-s)
ts() { echo "ORA"; }
cd "$REPO"
. "${LIB}"
${corpo}`;
  try {
    return { rc: 0, out: execFileSync("bash", ["-c", script], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (e) {
    return { rc: e.status, out: (e.stdout || "") + (e.stderr || "") };
  }
}
const marcatore = (repo) => join(repo, ".git/mycity-sync-pendente");

// ── la testa ─────────────────────────────────────────────────────────────────
prova("AR-399: rc=2 (rimandata) NON è un successo silenzioso", () => {
  const r = esitoSync({ rcSync: 2, tipo: "chat" });
  assert.equal(r.pendente, true, "una pubblicazione rimandata deve restare da riprendere");
  assert.match(r.nota, /RIMANDATA/i, "Nicola deve leggere che la memoria non è uscita");
});

prova("AR-399: rc=3 (manca la chiave git) lo dice, e resta pendente", () => {
  const r = esitoSync({ rcSync: 3, tipo: "esegui-azione" });
  assert.equal(r.pendente, true);
  assert.match(r.nota, /chiave git/i);
  assert.equal(r.stato, "", "NON si flippa in errore: sarebbe l'invito a riapprovare un'azione già partita");
});

prova("AR-399: rc=1 su un'azione reale resta «errore» (il comportamento buono non si tocca)", () => {
  const r = esitoSync({ rcSync: 1, tipo: "esegui-azione" });
  assert.equal(r.stato, "errore");
  assert.equal(r.pendente, true);
});

prova("AR-399: rc=0 non lascia niente in sospeso", () => {
  const r = esitoSync({ rcSync: 0, tipo: "chat" });
  assert.equal(r.pendente, false);
  assert.equal(r.nota, "");
});

prova("AR-399: un rc mai visto si tratta come NON pubblicata (fail-closed)", () => {
  assert.equal(esitoSync({ rcSync: 7, tipo: "chat" }).pendente, true);
});

prova("AR-399: la ripresa aspetta il cooldown, poi scatta, e a ore di silenzio alza la voce", () => {
  const ora = Date.now();
  assert.equal(ripresaPubblicazione({ marcatore: { quando: ora - 10_000, rc: 2 }, adessoMs: ora }).riprova, false);
  const dopo = ripresaPubblicazione({ marcatore: { quando: ora - 400_000, rc: 2 }, adessoMs: ora });
  assert.equal(dopo.riprova, true);
  const vecchio = ripresaPubblicazione({ marcatore: { quando: ora - 8 * 3600_000, rc: 2 }, adessoMs: ora });
  assert.equal(vecchio.allarme, true, "commit locali non pubblicati da ore = un Pannello che mostra dati vecchi");
  assert.equal(ripresaPubblicazione({ marcatore: null, adessoMs: ora }).riprova, false);
});

// ── le mani, eseguite ────────────────────────────────────────────────────────
prova("AR-399 (runtime): rc=2 alza il marcatore, rc=0 lo toglie", () => {
  const repo = repoFinto();
  try {
    const r = sh(repo, `applica_esito_sync 2 chat`);
    assert.ok(existsSync(marcatore(repo)), `nessun marcatore: la ripresa non arriverebbe mai\n${r.out}`);
    assert.match(r.out, /"pendente":true/);
    sh(repo, `applica_esito_sync 0 chat`);
    assert.ok(!existsSync(marcatore(repo)), "memoria pubblicata: il marcatore deve sparire");
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

prova("AR-399 (runtime): rc=3 lascia il marcatore e la nota (prima era un «fatto» pulito)", () => {
  const repo = repoFinto();
  try {
    const r = sh(repo, `applica_esito_sync 3 esegui-azione`);
    assert.ok(existsSync(marcatore(repo)));
    assert.match(r.out, /chiave git/i);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

prova("AR-399 (runtime): se la testa non risponde, la pubblicazione resta PENDENTE", () => {
  const repo = repoFinto();
  try {
    const script = `set -uo pipefail
exec 2>&1
REPO="${repo}"; SCRIPT_DIR="/nonesiste-$$"
SUPABASE_URL="http://finto"; AUTH=(-s)
ts() { echo "ORA"; }
cd "$REPO"
. "${LIB}"
applica_esito_sync 2 chat`;
    const out = execFileSync("bash", ["-c", script], { encoding: "utf8" });
    assert.match(out, /"pendente":true/, "un dubbio non diventa un successo");
    assert.ok(existsSync(marcatore(repo)));
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

prova("AR-399 (runtime): il worker sa quando è ora di riprendere, e non prima", () => {
  const repo = repoFinto();
  try {
    // marcatore appena messo → non è ancora ora
    writeFileSync(marcatore(repo), `2 ${Math.floor(Date.now() / 1000)}\n`);
    let r = sh(repo, `sync_va_ripresa; echo "RC=$?"`);
    assert.match(r.out, /RC=1/, `ha riprovato subito (martellerebbe GitHub):\n${r.out}`);
    // marcatore di otto ore fa → si riprova E si alza la voce
    writeFileSync(marcatore(repo), `2 ${Math.floor(Date.now() / 1000) - 8 * 3600}\n`);
    r = sh(repo, `sync_va_ripresa; echo "RC=$?"`);
    assert.match(r.out, /RC=0/, `la ripresa non scatta mai:\n${r.out}`);
    assert.match(r.out, /MEMORIA NON PUBBLICATA/, "otto ore di silenzio devono farsi sentire");
    // L'allarme deve tentare il canale che il Pannello legge; se non ci riesce, deve DIRLO
    // (un avviso non recapitato che passa per avviso dato sarebbe la malattia di questo lotto).
    assert.match(r.out, /NON recapitato al Pannello/, "qui il DB finto non risponde: il fallimento va detto");
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

prova("AR-399 (runtime): senza marcatore non si fa niente", () => {
  const repo = repoFinto();
  try {
    const r = sh(repo, `sync_va_ripresa; echo "RC=$?"`);
    assert.match(r.out, /RC=1/);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

// ── il ripescaggio deve esistere nel ciclo, non solo nella libreria ──────────
prova("AR-399: il ciclo del worker riprende la pubblicazione anche a coda vuota", () => {
  const src = readFileSync(join(CERVELLO, "worker.sh"), "utf8");
  const dopoPausa = src.slice(src.indexOf("while true; do"));
  assert.match(dopoPausa, /sync_va_ripresa/, "il ripescaggio deve stare nel ciclo, prima del claim");
  const primaDelClaim = dopoPausa.slice(0, dopoPausa.indexOf("Prendi il prossimo lavoro"));
  assert.match(primaDelClaim, /sync_va_ripresa/, "se sta dopo il claim, a coda vuota non gira mai");
  assert.match(primaDelClaim, /ripubblica_esiti_ricoverati/);
});

// ── esito ────────────────────────────────────────────────────────────────────
const rotti = casi.filter((c) => !c.ok);
for (const c of casi) process.stdout.write(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n     ${c.err}`}\n`);
process.stdout.write(`\n${casi.length - rotti.length}/${casi.length} passati\n`);
process.exit(rotti.length ? 1 : 0);
