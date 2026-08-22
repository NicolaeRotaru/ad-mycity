#!/usr/bin/env node
// 🧪 IL BATTITO E LE CHIAVI — dodici schede del 3 luglio, verificate sul codice di oggi.
//
// Due famiglie che si somigliano: qualcosa esiste ma nessuno lo accende (le cadenze), e qualcosa è
// aperto più del dovuto (i permessi). Tutte e dodici erano marcate «da riverificare»: la loro prova
// puntava a codice cambiato da allora, quindi nessun guardiano poteva né chiuderle né accorgersi
// se tornavano.
//
//   CADENZE
//   AR-056  nessun guardiano vigilava che il battito da 2 ore fosse vivo
//   AR-057  due timer erano unit ORFANE: nessun installer le abilitava
//   AR-058  i timeout esterni erano più corti del budget dei 3 tentativi interni: retry morti
//   AR-059  l'aggiornamento del server non ripropagava le unit: cadenze nuove inerti
//   AR-060  stato del battito documentato in modo contraddittorio (DISATTIVATO vs RIATTIVATO)
//
//   CHIAVI E PERMESSI
//   AR-089  lo scanner dei segreti non riconosceva il token più potente di tutti
//   AR-090  un solo token di gestione sovra-privilegiato serviva entrambi gli MCP
//   AR-091  l'MCP della memoria era in lettura+scrittura: il cervello poteva cancellarsi la memoria
//   AR-092  worker.sh risolveva i conflitti con `--theirs` cieco: poteva cancellare un «FATTO»
//   AR-093  il kill-switch falliva APERTO: senza credenziali il giro partiva lo stesso
//   AR-094  la documentazione prescriveva ancora il `force-push` che aveva causato la perdita
//   AR-095  permessi stantii legati a un'altra macchina (percorsi Windows)
//
// ⚠️ DUE SCHEDE risultavano «ancora vive» a un controllo per parole e NON lo erano: AR-089 perché
// le regole dei segreti sono state spostate in un file loro, AR-093 perché cercava una frase che
// non è mai stata scritta così. È il motivo per cui in questa casa una ricerca di parole non chiude
// niente: non fallisce nel modo in cui fallisce la realtà.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const leggi = (p) => readFileSync(join(REPO, p), "utf8");

const { REGOLE_SEGRETI, provaRegole } = await import(join(REPO, "cervello/segreti-pattern.mjs"));

// ── AR-056 / AR-057 · i timer sono censiti e qualcuno li accende ─────────────────────────────────

test("AR-056 · il battito da 2 ore è nell'elenco di ciò che viene vigilato", () => {
  const v = leggi("cervello/verifica-automazione.mjs");
  assert.match(v, /mycity-giro\.timer/, "un battito che nessuno guarda può morire in silenzio");
  assert.match(v, /mycity-watch-main\.timer/);
  assert.match(v, /mycity-sentinella-dati\.timer/);
});

test("AR-057 · i due timer che erano orfani vengono ABILITATI dall'installer", () => {
  const inst = leggi("cervello/vps/install-ritmo-timers.sh");
  // Il difetto: verifica-automazione dava per scontato che fossero attivi, e nessuno li accendeva.
  assert.match(inst, /mycity-verifica\.timer/, "censito nel guardiano ma mai abilitato = orfano");
  assert.match(inst, /mycity-watch-main\.timer/);
  assert.match(inst, /AR-057/, "il perché sta accanto alla cura, o il prossimo lo toglie");
});

// ── AR-058 · i tre tentativi stanno DENTRO il tempo che qualcuno concede da fuori ────────────────

test("AR-058 · il budget interno è DERIVATO da quello esterno, non scelto a caso", () => {
  const giro = leggi("cervello/giro.sh");
  const budget = Number(/GIRO_BUDGET_SEC:-(\d+)/.exec(giro)?.[1]);
  const perTentativo = Number(/GIRO_AI_TIMEOUT:-(\d+)/.exec(giro)?.[1]);
  assert.ok(Number.isFinite(budget) && Number.isFinite(perTentativo), "i due numeri devono esistere ed essere numeri");

  // Il conto della scheda, eseguito: 3 tentativi + 2 pause da 30s devono stare nel budget esterno.
  // Se non ci stanno, chi invoca uccide giro.sh prima che i retry finiscano — retry morti.
  assert.ok(3 * perTentativo + 60 <= budget,
    `3×${perTentativo}+60 = ${3 * perTentativo + 60}s deve stare in ${budget}s, o i tentativi muoiono a metà`);

  // E il budget esterno dichiarato deve combaciare con quello che systemd concede davvero.
  const unit = leggi("cervello/vps/mycity-giro.service");
  const systemd = Number(/TimeoutStartSec=(\d+)/.exec(unit)?.[1]);
  assert.ok(systemd >= budget, `systemd concede ${systemd}s e il giro ne pianifica ${budget}: il primo non può essere più stretto`);
});

// ── AR-059 · una cadenza nuova diventa attiva davvero ────────────────────────────────────────────

test("AR-059 · l'aggiornamento del server ripropaga le unit e ricarica systemd", () => {
  const agg = leggi("cervello/vps/aggiorna-cervello.sh");
  assert.match(agg, /daemon-reload/, "senza questo un timer nuovo resta inerte sul server");
});

// ── AR-060 · lo stato del battito è dichiarato una volta sola ────────────────────────────────────

test("AR-060 · il battito è dichiarato ATTIVO, senza la contraddizione di prima", () => {
  const giro = leggi("cervello/giro.sh");
  assert.match(giro, /il battito è ATTIVO/, "prima diceva DISATTIVATO in un punto e RIATTIVATO in un altro");
  assert.doesNotMatch(giro, /timer automatico \(mycity-giro\.timer\) è DISATTIVATO/, "la riga contraddittoria non deve tornare");
});

// ── AR-089 · lo scanner riconosce il token più potente ───────────────────────────────────────────

test("AR-089 · un token di gestione Supabase viene RICONOSCIUTO e redatto", () => {
  const finto = "sbp_" + "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0";
  const trovato = REGOLE_SEGRETI.some((r) => {
    const re = new RegExp(r.re.source, r.re.flags.replace("g", ""));
    return re.test(finto);
  });
  assert.equal(trovato, true, "era l'ultima difesa prima di committare il vault, e non vedeva sbp_");

  // …e le regole si provano da sole: un metro che nessuno prova è un metro che non frena.
  assert.equal(typeof provaRegole, "function", "le regole devono avere una loro autoprova");
});

test("AR-089 · e lo scanner USA quelle regole, invece di avere la sua copia", () => {
  const scan = leggi("cervello/scan-segreti.mjs");
  assert.match(scan, /segreti-pattern\.mjs/, "una parola con due padroni diverge in silenzio");
  assert.match(scan, /REGOLE_SEGRETI/);
});

// ── AR-090 / AR-091 · i due MCP sono in sola lettura e ristretti al loro progetto ────────────────

test("AR-091 · l'MCP della memoria NON può scrivere: era il cervello che poteva cancellarsi", () => {
  const mcp = JSON.parse(leggi(".mcp.json"));
  const server = mcp.mcpServers || mcp;
  for (const [nome, conf] of Object.entries(server)) {
    assert.ok((conf.args || []).includes("--read-only"), `${nome} deve essere in sola lettura`);
  }
});

test("AR-090 · ogni MCP è ristretto al SUO progetto, così un token solo non apre tutta l'organizzazione", () => {
  const mcp = JSON.parse(leggi(".mcp.json"));
  const server = mcp.mcpServers || mcp;
  const ref = [];
  for (const [nome, conf] of Object.entries(server)) {
    const p = (conf.args || []).find((a) => String(a).startsWith("--project-ref="));
    assert.ok(p, `${nome} deve dichiarare a quale progetto è legato`);
    ref.push(p);
  }
  assert.equal(new Set(ref).size, ref.length, "due MCP sullo stesso progetto sarebbero un permesso doppio inutile");
  // ⚠️ QUELLO CHE RESTA, e va detto: il token è ancora UNO. La restrizione qui è il perimetro
  // (sola lettura + progetto), non la separazione delle credenziali — quella è un'azione sul conto
  // Supabase, cioè 🔴 di Nicola, e non si può fare da qui.
});

// ── AR-092 · un conflitto non si risolve cancellando il lavoro dell'altro ────────────────────────

test("AR-092 · il worker non risolve più i conflitti con `--theirs` cieco", () => {
  const w = leggi("cervello/worker.sh");
  assert.doesNotMatch(w, /checkout --theirs/, "poteva cancellare il «FATTO» e causare un DOPPIO invio");
});

// ── AR-093 · il kill-switch fallisce CHIUSO, e si fa sentire ─────────────────────────────────────

test("AR-093 · se non riesco a leggere l'interruttore, NON parto", () => {
  const ks = leggi("cervello/kill-switch.sh");
  assert.match(ks, /pausa_consenti_partenza/, "la decisione dev'essere una funzione sola");
  // Il cuore: il caso «non verificabile» torna 1 (non parto), non 0.
  assert.match(ks, /\*\)\s*printf[\s\S]{0,200}return 1 ;;/, "il ramo del non-verificabile deve FERMARE");
  // E la parte aggiunta dopo, che è quella che rende il freno utile: il fail-closed ESCE dalla
  // macchina. Fermarsi in silenzio e «Nicola ha messo in pausa» erano indistinguibili in Cabina.
  assert.match(ks, /pausa_segnala_cieco/, "un freno che scatta senza dirlo è un guasto invisibile");

  // …e il caso opposto, senza il quale il freno bloccherebbe ogni clone locale: senza credenziali
  // il kill-switch non è collegato affatto, e lì si parte.
  assert.match(ks, /rete che fallisce CON le chiavi presenti/, "il confine fra «niente chiavi» e «rete rotta» dev'essere scritto");
});

// ── AR-094 / AR-095 · la documentazione e i permessi non insegnano più il gesto sbagliato ────────

test("AR-094 · nessun file prescrive più il force-push che causò la perdita di memoria", () => {
  const env = join(REPO, "cervello/vps/.env.example");
  if (!existsSync(env)) return; // il file può non esserci in un clone parziale: si dice, non si finge
  assert.doesNotMatch(readFileSync(env, "utf8"), /force-push|force_push|push --force/,
    "la documentazione insegnava esattamente il gesto che aveva cancellato la memoria");
});

test("AR-095 · i permessi non sono più legati a un'altra macchina", () => {
  const s = leggi(".claude/settings.json");
  assert.doesNotMatch(s, /InfinitaPossibilita/, "percorsi di un'altra macchina = permessi che nessuno rilegge");
  assert.doesNotMatch(s, /[A-Z]:\\\\/, "nessun percorso Windows assoluto");
});
