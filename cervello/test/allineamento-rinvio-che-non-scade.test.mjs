#!/usr/bin/env node
// IL RINVIO CHE NON SCADEVA MAI — 422 rinvii il 18/8, 1716 il 30/7, e la memoria che non usciva più.
//
// LA STORIA. Sul server, quando HEAD sta su un ramo diverso da main, l'allineamento si rimanda: è
// giusto, perché il `checkout -f` strapperebbe il lavoro a una chat che sta scrivendo ORA. Contro lo
// stallo c'era già una fuga — «un ramo fermo da più di mezz'ora e senza sporco di CODICE è
// abbandonato, allineo lo stesso» — ma bastava UN file di codice non committato per spegnerla del
// tutto, e nessun tetto teneva conto di quanto durava l'attesa. Una sessione uccisa a metà lasciava
// un file avanzato, e da quel momento il rinvio era eterno.
//
// Cosa costa: il server continua a SCRIVERE memoria e non la pubblica più. Ogni singolo rinvio è
// verde, quindi non se ne accorge nessuno. Il 30/7: 1716 rinvii, 31 ore, 1519 commit mai usciti. Il
// 18/8 il referto del server contava 422 rinvii — lo stesso guasto, la seconda volta. Ed è la
// regola della visita: un difetto tornato due volte non si ripara una terza, gli si mette un
// guardiano alla radice. Il guardiano è un TETTO sull'attesa.
//
// COSA PROVA QUESTO FILE, eseguendo (mai cercando parole in un sorgente):
//   ① sotto la mezz'ora si rimanda davvero: chi sta lavorando non si tocca;
//   ② un ramo abbandonato e pulito si allinea (la fuga di prima, che non va persa);
//   ③ IL DIFETTO: ramo fermo da ore CON codice sporco → non è più «rimanda» per sempre, è `libera`;
//   ④ ma appena sotto il tetto si rimanda ancora: il tetto è un tetto, non un interruttore;
//   ⑤ il parcheggio funziona davvero: dopo il commit di salvataggio il checkout su main riesce E il
//      lavoro sporco resta recuperabile sul suo ramo (è la promessa che rende `libera` sicura);
//   ⑥ un'età che non è un numero non compra un allineamento.
//
// NON-VACUITÀ (verificata rompendo il fix apposta):
//   · in `cervello/allineamento-esito.sh`, togliendo la riga del tetto
//     (`[ "$eta" -ge "$max_stallo" ] && { echo libera; return; }`)
//     → il caso ③ torna «rimanda» e la prova diventa ROSSA.
//   · togliendo invece `[ "$sporco" != 1 ] && { echo allinea; return; }`
//     → il caso ② diventa ROSSO: la fuga vecchia è stata persa.

import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const SH = join(QUI, "..", "allineamento-esito.sh");
const REPO = join(QUI, "..", "..");
const sh = (cmd) => execFileSync("bash", ["-c", `. "${SH}"; ${cmd}`], { encoding: "utf8" }).trim();

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// azione_ramo_vivo <ramo_corrente> <bersaglio> <eta_min> <sporco_codice> [min_lavoro] [max_stallo]
const decide = (cur, eta, sporco, extra = "") => sh(`azione_ramo_vivo ${cur} main ${eta} ${sporco} ${extra}`);

// ── ① Chi sta lavorando non si tocca ────────────────────────────────────────

prova("una chat che ha committato due minuti fa non viene disturbata", () => {
  assert.equal(decide("fix/chat-viva", 2, 1), "rimanda");
  assert.equal(decide("fix/chat-viva", 2, 0), "rimanda", "anche pulita: due minuti fa qualcuno stava lavorando");
});

// ── ② La fuga anti-stallo che c'era già, e non va persa ─────────────────────

prova("un ramo abbandonato e pulito si allinea lo stesso", () => {
  assert.equal(decide("fix/abbandonato", 45, 0), "allinea");
});

prova("e sul ramo giusto o con HEAD staccato non c'è niente da proteggere", () => {
  assert.equal(decide("main", 0, 1), "allinea");
  assert.equal(decide("HEAD", 0, 1), "allinea");
});

// ── ③ IL DIFETTO: il rinvio adesso ha un tetto ──────────────────────────────

prova("un ramo piantato da ore CON codice sporco non rimanda più all'infinito", () => {
  const esito = decide("fix/piantato", 600, 1); // dieci ore: il caso vero del 18/8
  assert.equal(
    esito,
    "libera",
    `atteso «libera», avuto «${esito}»: senza tetto la memoria smette di uscire e ogni rinvio resta verde`,
  );
});

prova("ma appena sotto il tetto si rimanda ancora: è un tetto, non un interruttore", () => {
  assert.equal(decide("fix/piantato", 239, 1, "30 240"), "rimanda");
  assert.equal(decide("fix/piantato", 240, 1, "30 240"), "libera");
});

// ── ⑤ La promessa che rende «libera» sicura: nessun lavoro perso ────────────

prova("il parcheggio salva il lavoro sporco, e solo dopo il checkout riesce", () => {
  const dir = mkdtempSync(join(tmpdir(), "mycity-parcheggio-"));
  const git = (...a) => spawnSync("git", a, { cwd: dir, encoding: "utf8" });
  try {
    git("init", "-q", "-b", "main", ".");
    git("config", "user.email", "prova@mycity.local");
    git("config", "user.name", "prova");
    writeFileSync(join(dir, "codice.mjs"), "originale\n");
    git("add", "-A");
    git("commit", "-qm", "base");

    // Una sessione uccisa a metà: ramo suo, un file di CODICE modificato e mai committato.
    git("checkout", "-q", "-b", "fix/uccisa-a-meta");
    writeFileSync(join(dir, "codice.mjs"), "lavoro a meta, mai committato\n");
    writeFileSync(join(dir, "nuovo-file.mjs"), "anche questo e nuovo\n");

    // Il parcheggio, esattamente com'è scritto nel copione.
    git("add", "-A");
    const commit = git("commit", "-qm", "parcheggio automatico");
    assert.equal(commit.status, 0, "il commit di parcheggio deve riuscire, se no non si allinea");

    // …e solo ORA l'allineamento può passare.
    const co = git("checkout", "-q", "-f", "main");
    assert.equal(co.status, 0, `il checkout su main deve riuscire dopo il parcheggio: ${co.stderr}`);
    assert.equal(readFileSync(join(dir, "codice.mjs"), "utf8"), "originale\n", "su main deve esserci il codice di main");
    assert.ok(!existsSync(join(dir, "nuovo-file.mjs")), "il file nuovo non deve restare in giro su main");

    // La promessa: il lavoro non è perso, si riprende con un checkout di quel ramo.
    const back = git("checkout", "-q", "fix/uccisa-a-meta");
    assert.equal(back.status, 0);
    assert.equal(
      readFileSync(join(dir, "codice.mjs"), "utf8"),
      "lavoro a meta, mai committato\n",
      "il lavoro parcheggiato è andato perso: allora «libera» non è sicura e non si può usare",
    );
    assert.equal(readFileSync(join(dir, "nuovo-file.mjs"), "utf8"), "anche questo e nuovo\n");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── ⑥ Un dubbio non compra un allineamento ─────────────────────────────────

prova("un'età che non è un numero fa rimandare, non allineare", () => {
  assert.equal(decide("fix/strano", '"?"', 0), "rimanda");
});

prova("i copioni toccati restano sintatticamente sani", () => {
  for (const f of ["cervello/vps/aggiorna-cervello.sh", "cervello/allineamento-esito.sh"]) {
    execFileSync("bash", ["-n", join(REPO, f)], { stdio: "pipe" });
  }
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
