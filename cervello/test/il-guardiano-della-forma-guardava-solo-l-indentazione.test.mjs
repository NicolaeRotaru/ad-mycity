#!/usr/bin/env node
// 🧪 AR-813 — il guardiano della forma guardava solo l'indentazione.
//
// Il 24/8 Nicola ha guardato la PR #835 e ha detto: «secondo me stai facendo delle cavolate perché il
// diff è +22.000 e -15.000». Aveva ragione. Tre registri risultavano riscritti da cima a fondo senza
// che il contenuto cambiasse: `apprendimento.json` +5.702/-5.359 con 519 voci su 535 identiche a meno
// dell'ordine delle chiavi, `cantiere-difetti.json` +7.500/-7.160 con l'elenco riordinato, e
// `mutanti.json` lo stesso. Circa 12.900 cancellazioni che non cancellavano niente.
//
// `forma-json.mjs` esiste PROPRIO per questa famiglia — la sua intestazione cita gli stessi numeri su
// un caso del 30/7 — ed era verde mentre succedeva, perché misurava solo l'indentazione. E
// l'indentazione non era cambiata.
//
// I modi di riscrivere un file per intero sono tre: l'indentazione, l'ordine delle chiavi dentro una
// voce, l'ordine delle voci dentro l'elenco. Ne guardava uno.
//
// Qui il freno si vede SCATTARE su un repo finto, non solo ragionare sulla funzione pura.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { rimescolati, normalizza } from "../forma-json.mjs";

const GUARDIANO = join(import.meta.dirname, "..", "forma-json.mjs");

const VOCE = (id, extra = {}) => ({ id, testo: `la lezione ${id}`, reparto: "tech", stato: "viva", ...extra });
const REGISTRO = (voci) => JSON.stringify({ aggiornato: "2026-08-24 22:00", lezioni: voci }, null, 2) + "\n";

/** Un repo finto con `origin/main` risolvibile, e il registro nel working tree. */
function repoFinto(prima, dopo) {
  const dir = mkdtempSync(join(tmpdir(), "forma-"));
  const g = (...a) => execFileSync("git", a, { cwd: dir, encoding: "utf8", stdio: "pipe" });
  g("init", "-q", "-b", "main");
  g("config", "user.email", "prova@esempio.it");
  g("config", "user.name", "prova");
  writeFileSync(join(dir, "registro.json"), prima);
  g("add", "-A");
  g("commit", "-q", "-m", "base");
  g("update-ref", "refs/remotes/origin/main", "HEAD");
  writeFileSync(join(dir, "registro.json"), dopo);
  return dir;
}

function guardia(prima, dopo, argomenti = ["--json"]) {
  const dir = repoFinto(prima, dopo);
  try {
    const r = spawnSync(process.execPath, [GUARDIANO, ...argomenti], {
      env: { ...process.env, FORMA_JSON_ROOT: dir },
      encoding: "utf8",
    });
    return { codice: r.status, uscita: r.stdout };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ── il difetto vero, sul guardiano montato ──────────────────────────────────

test("le chiavi rimescolate dentro le voci fanno diventare rosso il guardiano", () => {
  const prima = REGISTRO([VOCE("L-1"), VOCE("L-2")]);
  // stesse voci, stessi valori, chiavi in fila diversa: e' il caso di apprendimento.json
  const rimescolata = { reparto: "tech", stato: "viva", id: "L-1", testo: "la lezione L-1" };
  const dopo = JSON.stringify({ aggiornato: "2026-08-24 22:00", lezioni: [rimescolata, VOCE("L-2")] }, null, 2) + "\n";

  const { codice, uscita } = guardia(prima, dopo);
  assert.equal(codice, 1, "un registro rimescolato deve fermare il cancello");
  assert.match(uscita, /"rimescolati"/, "il verdetto deve nominare il rimescolamento");
  assert.equal(JSON.parse(uscita).rimescolati[0].chiaviRimescolate, 1);
});

test("l'elenco riordinato fa diventare rosso il guardiano", () => {
  const prima = REGISTRO([VOCE("AR-004"), VOCE("AR-001"), VOCE("AR-002")]);
  const dopo = REGISTRO([VOCE("AR-001"), VOCE("AR-002"), VOCE("AR-004")]);

  const { codice, uscita } = guardia(prima, dopo);
  assert.equal(codice, 1, "riordinare l'elenco riscrive il file intero: e' un rosso");
  assert.equal(JSON.parse(uscita).rimescolati[0].elencoRimescolato, true);
});

test("un registro non toccato resta verde", () => {
  const uguale = REGISTRO([VOCE("L-1"), VOCE("L-2")]);
  assert.equal(guardia(uguale, uguale).codice, 0);
});

// La strada che legge un umano e' un'altra uscita dalla stessa funzione, e per un po' questa prova
// non la guardava: in `--json` il codice arriva dal verdetto di copertura e il ramo del verde non
// viene nemmeno percorso. Cioe' si poteva togliere il rimescolamento dal verde stampato e la prova
// restava tutta verde. E' il difetto di questa scheda, in miniatura, dentro la prova che lo ripara.
test("anche il verdetto stampato per un umano diventa rosso, non solo quello in JSON", () => {
  const prima = REGISTRO([VOCE("AR-004"), VOCE("AR-001")]);
  const dopo = REGISTRO([VOCE("AR-001"), VOCE("AR-004")]);

  const { codice, uscita } = guardia(prima, dopo, []);
  assert.equal(codice, 1, "senza --json il rimescolamento deve fermare lo stesso");
  assert.match(uscita, /elenco riordinato/, "e deve dire a voce cos'e' successo");
  assert.doesNotMatch(uscita, /✅/, "non puo' stampare un verde mentre esce rosso");
});

// ── i falsi allarmi che renderebbero il freno inservibile ───────────────────

test("aggiungere voci in coda non e' rimescolare", () => {
  const prima = REGISTRO([VOCE("L-1"), VOCE("L-2")]);
  const dopo = REGISTRO([VOCE("L-1"), VOCE("L-2"), VOCE("L-3")]);
  assert.equal(guardia(prima, dopo).codice, 0, "il lavoro normale aggiunge in coda: dev'essere verde");
});

test("aggiungere un campo a una voce non e' rimescolare", () => {
  const prima = REGISTRO([VOCE("L-1")]);
  const dopo = REGISTRO([VOCE("L-1", { gate: "node cervello/qualcosa.mjs" })]);
  assert.equal(guardia(prima, dopo).codice, 0, "un campo nuovo si accoda: l'ordine di prima resta");
});

test("una voce cambiata davvero non viene contata come rumore", () => {
  const prima = [VOCE("L-1")];
  // contenuto diverso E chiavi in altro ordine: e' una modifica, non un rimescolamento
  const dopo = [{ stato: "morta", reparto: "tech", testo: "tutt'altro", id: "L-1" }];
  assert.equal(rimescolati([{ file: "r.json", prima: JSON.stringify({ l: prima }), dopo: JSON.stringify({ l: dopo }) }]).length, 0);
});

test("senza un'identita' per ogni voce non misura invece di indovinare", () => {
  const prima = JSON.stringify({ l: [{ a: 1, b: 2 }] });
  const dopo = JSON.stringify({ l: [{ b: 2, a: 1 }] });
  assert.equal(rimescolati([{ file: "r.json", prima, dopo }]).length, 0, "⚪ non e' un verde, ma un'accusa senza identita' e' peggio");
});

test("un JSON illeggibile non fa dire niente al guardiano", () => {
  assert.equal(rimescolati([{ file: "r.json", prima: "{rotto", dopo: "{ancora rotto" }]).length, 0);
});

test("normalizza rende confrontabili due voci con le chiavi in ordine diverso", () => {
  const a = { id: "x", dentro: { p: 1, q: [{ m: 1, n: 2 }] } };
  const b = { dentro: { q: [{ n: 2, m: 1 }], p: 1 }, id: "x" };
  assert.equal(JSON.stringify(normalizza(a)), JSON.stringify(normalizza(b)));
});
