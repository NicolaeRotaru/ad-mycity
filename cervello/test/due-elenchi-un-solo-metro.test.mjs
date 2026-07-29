#!/usr/bin/env node
// AR-186 — l'organigramma dei 120 vive in due posti che potevano divergere in silenzio.
//
// La riga-roster di `CLAUDE.md` è la mappa che legge Nicola; il campo `description` del mansionario
// è il contratto che legge il router. Un rimando presente in uno solo dei due manda il lavoro a un
// senior che non lo rivendica — o lo tiene a uno che l'aveva ceduto.
//
// **La parte che conta non è «allinea due liste», è che il numero diventa ricalcolabile.** La scheda
// diceva «oggi: 14 agenti», e quel numero non era riproducibile: nel repo non c'era niente che lo
// producesse. Il primo metro che ho scritto ne trovava 2 — e sbagliava due volte:
//   · cercava `→ **nome**`, mentre la forma vera è quasi sempre `(→ motivo = **nome**)`;
//   · contava come rimando anche `lo **script** → **ai-video** monta`, che è prosa dentro la frase.
// Corretto il metro: **13**, e il tredicesimo (`qa`) usciva solo abbassando il minimo del nome a due
// lettere. Un numero su una scheda non è un fatto: è l'uscita di un metro, e se il metro non sta nel
// repo nessuno può accorgersi che la realtà si è mossa.
//
// Non-vacuità, verificata a mano su due rotture indipendenti:
//   ① logica — facendo guardare a `rimandiDi` tutta la riga invece che i soli blocchi con la freccia:
//      la prosa torna a contare come rimando e la prova fallisce.
//   ② innesto — togliendo la lettura della baseline dal guardiano (verdetto sul totale invece che
//      per nome): un agente allineato che ne rimpiazza uno nuovo non si vede più, e la prova fallisce.

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import {
  debitoRiparato,
  driftDeferral,
  nuoviRispettoAlDebito,
  rimandiDi,
  rosterDaClaudeMd,
} from "../deferral-agenti.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const GUARDIANO = join(REPO, "cervello/deferral-agenti.mjs");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

// ── Il metro: le due forme vere, e la prosa che non è un rimando ────────────

prova("riconosce la forma con l'uguale, che è quella che il repo usa di più", () => {
  assert.deepEqual([...rimandiDi("- 🛡️ **trust-safety** — moderazione (→ contestazione Stripe = **dispute**).")], ["dispute"]);
});

prova("riconosce più rimandi nello stesso blocco", () => {
  const r = rimandiDi("(→ produzione grafica = **ai-designer**; QA tecnico brand = **qa-designer**)");
  assert.deepEqual([...r].sort(), ["ai-designer", "qa-designer"]);
});

prova("una freccia FUORI dalle parentesi è prosa, non una cessione di mandato", () => {
  // Il caso vero: «content-social scrive lo script → ai-video monta il video». Contarlo faceva
  // risultare ai-video come agente che rimanda a se stesso — un difetto inventato dal metro.
  assert.deepEqual([...rimandiDi("content-social scrive lo **script** → **ai-video** monta il video")], []);
});

prova("i nomi di due lettere esistono: qa non è un caso limite, è un senior", () => {
  const roster = rosterDaClaudeMd("- ✅ **qa** — verifica end-to-end (→ automazione = **sdet**).");
  assert.ok(roster.has("qa"), "qa deve entrare nel roster");
  assert.deepEqual([...roster.get("qa")], ["sdet"]);
});

prova("un agente non rimanda a se stesso", () => {
  const roster = rosterDaClaudeMd("- 🎬 **ai-video** — lo **script** → **ai-video** monta (→ calendario = **content-social**).");
  assert.deepEqual([...roster.get("ai-video")].sort(), ["content-social"]);
});

// ── Il confronto, in tutte e due le direzioni ───────────────────────────────

prova("dice CHI diverge e da che parte, non solo quanti", () => {
  const roster = new Map([["a", new Set(["x"])], ["b", new Set()]]);
  const schede = new Map([["a", new Set()], ["b", new Set(["y"])]]);
  assert.deepEqual(driftDeferral(roster, schede), [
    { nome: "a", solo_roster: ["x"], solo_scheda: [] },
    { nome: "b", solo_roster: [], solo_scheda: ["y"] },
  ]);
});

prova("un agente presente in un solo elenco è divergente a sua volta", () => {
  const soloRoster = driftDeferral(new Map([["a", new Set()]]), new Map());
  const soloScheda = driftDeferral(new Map(), new Map([["a", new Set()]]));
  assert.match(soloRoster[0].motivo, /senza mansionario/);
  assert.match(soloScheda[0].motivo, /roster di CLAUDE\.md non lo nomina/);
});

prova("due elenchi identici non producono nessun rumore", () => {
  const m = () => new Map([["a", new Set(["x"])], ["b", new Set(["y", "z"])]]);
  assert.deepEqual(driftDeferral(m(), m()), []);
});

// ── Il debito si giudica per NOME, mai per conteggio ────────────────────────

prova("uno allineato e uno nuovo è un PEGGIORAMENTO, anche se il totale non cambia", () => {
  // Il caso che il conteggio non vede: erano [a, b], adesso sono [a, c]. Totale identico, ma `c` è
  // un disallineamento che nessuno ha dichiarato.
  const baseline = { agenti: { a: {}, b: {} } };
  const ora = [{ nome: "a" }, { nome: "c" }];
  assert.deepEqual(nuoviRispettoAlDebito(ora, baseline).map((d) => d.nome), ["c"]);
  assert.deepEqual(debitoRiparato(ora, baseline), ["b"]);
});

prova("il debito noto non fa rumore, e quello riparato si vede", () => {
  const baseline = { agenti: { a: {}, b: {} } };
  assert.deepEqual(nuoviRispettoAlDebito([{ nome: "a" }, { nome: "b" }], baseline), []);
  assert.deepEqual(debitoRiparato([], baseline), ["a", "b"]);
});

// ── L'innesto: il guardiano vero su un parco finto ──────────────────────────

/**
 * Un organigramma finto: CLAUDE.md, i mansionari, e il debito dichiarato.
 * Prende una LISTA di agenti perché il caso più insidioso — «uno allineato e uno nuovo, totale
 * identico» — non si può esprimere con un agente solo, e senza quel caso la prova resta verde anche
 * se il guardiano torna a giudicare sul conteggio. (Verificato: la prima versione di questo file
 * aveva esattamente quel buco.)
 */
function parco({ agenti: lista, debito = {} }) {
  const dir = mkdtempSync(join(tmpdir(), "mycity-deferral-"));
  try {
    const agenti = join(dir, "agents");
    mkdirSync(agenti, { recursive: true });
    const righe = [];
    for (const a of lista) {
      righe.push(`- 🔧 **${a.nome}** — mandato${a.roster ? ` (→ roba = **${a.roster}**)` : ""}.`);
      writeFileSync(
        join(agenti, `${a.nome}.md`),
        `---\nname: ${a.nome}\ndescription: Usa per roba${a.scheda ? ` (→ roba = **${a.scheda}**)` : ""}\ntools: All tools\n---\n`,
      );
    }
    writeFileSync(join(dir, "CLAUDE.md"), `${righe.join("\n")}\n`);
    const bl = join(dir, "baseline.json");
    writeFileSync(bl, JSON.stringify({ dichiarato_il: "2026-07-29", agenti: debito }));
    const r = spawnSync("node", [GUARDIANO, "--json"], {
      encoding: "utf8",
      env: { ...process.env, DEFERRAL_CLAUDE_MD: join(dir, "CLAUDE.md"), DEFERRAL_AGENTS_DIR: agenti, DEFERRAL_BASELINE: bl },
    });
    let json = null;
    try { json = JSON.parse(r.stdout); } catch { /* lo guarda il caso */ }
    return { rc: r.status, out: `${r.stdout}${r.stderr}`, json };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

prova("il guardiano BOCCIA un disallineamento che non era dichiarato", () => {
  const r = parco({ agenti: [{ nome: "alfa", roster: "seo" }] });
  assert.equal(r.rc, 1, `atteso rosso:\n${r.out}`);
  assert.deepEqual(r.json.nuovi_rispetto_al_debito.map((d) => d.nome), ["alfa"]);
});

prova("e resta VERDE sullo stesso disallineamento se è dichiarato con la data", () => {
  const r = parco({ agenti: [{ nome: "alfa", roster: "seo" }], debito: { alfa: { solo_roster: ["seo"] } } });
  assert.equal(r.rc, 0, `atteso verde:\n${r.out}`);
  assert.equal(r.json.divergenti, 1, "il disallineamento c'è ancora: è dichiarato, non sparito");
});

prova("un debito che si è allineato viene detto, così la lista si accorcia", () => {
  const r = parco({ agenti: [{ nome: "alfa", roster: "seo", scheda: "seo" }], debito: { alfa: {} } });
  assert.equal(r.rc, 0);
  assert.deepEqual(r.json.debito_riparato_da_togliere, ["alfa"]);
});

prova("IL CASO CHE IL CONTEGGIO NON VEDE: uno allineato, uno nuovo, totale identico", () => {
  // Il debito dichiara alfa e beta. Adesso alfa è a posto e diverge gamma: i divergenti restano
  // due, ma uno non l'ha dichiarato nessuno. Un guardiano che confronta i totali passa liscio —
  // ed è la rottura che questa prova esiste per pescare, perché la prima versione la lasciava
  // passare (il caso c'era solo sulla funzione pura, non sul guardiano vero).
  // I nomi dei bersagli sono di due lettere e non di una: il metro pretende almeno due caratteri
  // perché `qa` esiste e `x` no. Scriverli di una lettera rendeva il fixture irreale e il caso muto.
  const r = parco({
    agenti: [
      { nome: "alfa", roster: "qa", scheda: "qa" },
      { nome: "beta", roster: "seo" },
      { nome: "gamma", roster: "cro" },
    ],
    debito: { alfa: {}, beta: {} },
  });
  assert.equal(r.json.divergenti, 2, "il totale è identico al debito: è proprio questo il tranello");
  assert.deepEqual(r.json.nuovi_rispetto_al_debito.map((d) => d.nome), ["gamma"]);
  assert.deepEqual(r.json.debito_riparato_da_togliere, ["alfa"]);
  assert.equal(r.rc, 1, `atteso rosso: gamma non è dichiarato\n${r.out}`);
});

prova("senza il debito dichiarato il guardiano è CIECO, non verde", () => {
  const dir = mkdtempSync(join(tmpdir(), "mycity-deferral-"));
  try {
    const agenti = join(dir, "agents");
    mkdirSync(agenti, { recursive: true });
    writeFileSync(join(dir, "CLAUDE.md"), "- 🔧 **alfa** — mandato.\n");
    writeFileSync(join(agenti, "alfa.md"), "---\nname: alfa\ndescription: Usa per roba\ntools: All tools\n---\n");
    const r = spawnSync("node", [GUARDIANO], {
      encoding: "utf8",
      env: { ...process.env, DEFERRAL_CLAUDE_MD: join(dir, "CLAUDE.md"), DEFERRAL_AGENTS_DIR: agenti, DEFERRAL_BASELINE: join(dir, "non-esiste.json") },
    });
    assert.equal(r.status, 2, `atteso cieco (rc=2), avuto ${r.status}`);
    assert.match(`${r.stdout}${r.stderr}`, /CIECO/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── Il repo VERO ────────────────────────────────────────────────────────────

prova("sul repo vero: 120 nel roster, 120 mansionari, e nessuna divergenza non dichiarata", () => {
  const r = spawnSync("node", [GUARDIANO, "--json"], { cwd: REPO, encoding: "utf8" });
  const j = JSON.parse(r.stdout);
  assert.equal(j.roster, 120, `roster ${j.roster}: se scende, una riga ha cambiato forma e il metro non la vede più`);
  assert.equal(j.schede, 120);
  assert.deepEqual(j.nuovi_rispetto_al_debito, [], "disallineamenti nuovi, non dichiarati");
  assert.equal(r.status, 0, `atteso verde:\n${r.stdout}${r.stderr}`);
});

prova("il guardiano è appeso al giro, non lasciato in un file che nessuno esegue", () => {
  // La malattia che questo cantiere cura da trenta lotti: una regola giusta che nessuno invoca.
  const giro = readFileSync(join(REPO, "cervello/giro.sh"), "utf8");
  assert.match(giro, /guardiano deferral-agenti\.mjs/, "il giro non esegue il guardiano");
  assert.match(giro, /\$DEFERRAL_VINCOLO/, "l'esito non arriva al motore come vincolo");
});

prova("e il numero è ricalcolabile con UN comando: è questo che mancava", () => {
  const r = spawnSync("node", [GUARDIANO, "--conta"], { cwd: REPO, encoding: "utf8" });
  const n = Number(r.stdout.trim());
  assert.ok(Number.isInteger(n), `--conta deve stampare un numero, ha stampato: ${JSON.stringify(r.stdout)}`);
  assert.ok(n >= 0 && n <= 120);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
