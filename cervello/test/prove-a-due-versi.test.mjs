// AR-570 — una prova che sa dire solo di no è inutile quanto un grep che sa dire solo di sì.
//
// Nato dal primo lotto di conversione (AR-564, l'asticella). Convertendo le prove dei difetti aperti
// da «cerca una parola» a «esegui qualcosa», il cancello del lotto ha chiesto per ognuna un MUTANTE:
// rompi il fix e pretendi il rosso. Ma su un difetto APERTO la prova è già rossa — quindi qualunque
// mutazione «funziona», e il controllo diventa vuoto. Il motivo sta a monte, ed è la scoperta di
// questo lotto: **nessun difetto aperto aveva mai avuto una prova a comando** (zero su 220). Tutta
// la macchina delle mutazioni è nata per prove che confermano un fix, non per prove che dimostrano
// un guasto.
//
// Qui c'è il controllo che serve a quelle: la PROVA A DUE VERSI. Per ognuna delle cinque si copia il
// pezzo di repo che guarda, ci si simula sopra il fix, e si pretende che il verdetto SI RIBALTI.
// Rosso adesso (il difetto c'è) e verde col fix finto (saprebbe accorgersene). Una prova inchiodata
// su un verso solo non ha mai avuto occasione di sbagliarsi, e non vale niente.
//
// 🟢 Non tocca niente di vivo: `PROVE_DIFETTI_RADICE` punta le prove su una copia usa-e-getta.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const PROVA = join(QUI, "..", "prove-difetti.mjs");

/** Una copia usa-e-getta dei soli file che la prova guarda. */
function copiaParziale(percorsi) {
  const radice = mkdtempSync(join(tmpdir(), "due-versi-"));
  for (const p of percorsi) {
    const sorgente = join(REPO, p);
    if (!existsSync(sorgente)) continue;
    const dest = join(radice, p);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(sorgente, dest);
  }
  return radice;
}

/** Esegue una prova puntata su una radice scelta. Ritorna il codice: 0 riparato · 1 aperto · 2 cieco. */
function eseguiProva(flag, radice) {
  const r = spawnSync("node", [PROVA, flag], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 120_000,
    env: { ...process.env, PROVE_DIFETTI_RADICE: radice },
  });
  return { codice: r.status, detto: `${r.stdout || ""}${r.stderr || ""}`.trim() };
}

/** Applica al file copiato una sostituzione, e verifica che sia davvero avvenuta. */
function simulaFix(radice, file, cerca, sostituisci) {
  const p = join(radice, file);
  const t = readFileSync(p, "utf8");
  assert.ok(t.includes(cerca), `il finto fix non si aggancia: «${cerca.slice(0, 50)}…» non è in ${file}`);
  writeFileSync(p, t.replace(cerca, sostituisci));
}

/** Il metro comune: adesso deve dire NO, col fix finto deve dire SÌ. */
function siRibalta({ flag, file, cerca, sostituisci, extra = [] }) {
  const percorsi = [file, ...extra];

  const senzaFix = copiaParziale(percorsi);
  const prima = eseguiProva(flag, senzaFix);
  assert.equal(prima.codice, 1, `${flag} doveva dire «il difetto c'è» sul codice di oggi, invece: ${prima.detto}`);

  const conFix = copiaParziale(percorsi);
  simulaFix(conFix, file, cerca, sostituisci);
  const dopo = eseguiProva(flag, conFix);
  assert.equal(dopo.codice, 0, `${flag} non si accorge del fix: resta inchiodata sul rosso. Detto: ${dopo.detto}`);
}

// ── Le cinque del primo lotto ────────────────────────────────────────────────

test("AR-366 — il battito: rossa oggi, verde se il timbro arriva solo dopo un lavoro riuscito", () => {
  siRibalta({
    flag: "--ar-366",
    file: "cervello/worker.sh",
    cerca: "battito_worker() {",
    sostituisci:
      'battito_lavoro_riuscito() {\n  [ "${1:-1}" = 0 ] || return 0\n  imposta "worker:ultimo:lavoro-riuscito=$(ts)"\n}\n\nbattito_worker() {',
  });
});

test("AR-388 — le scritture del server: rossa oggi, verde se il ramo le mette da parte prima del checkout", () => {
  siRibalta({
    flag: "--ar-388",
    file: "cervello/vps/aggiorna-cervello.sh",
    cerca: 'git reset HEAD -- . 2>/dev/null || true',
    sostituisci:
      'git reset HEAD -- . 2>/dev/null || true\n      git "${GIT_ID[@]}" stash push -u -m "al sicuro prima del checkout" >/dev/null 2>&1 || true',
  });
});

test("AR-412 — il doppio clic: rossa oggi, verde se la prenotazione esiste ed è presa prima delle mani", () => {
  siRibalta({
    flag: "--ar-412",
    file: "pannello/src/lib/mani.ts",
    cerca: "export",
    sostituisci: "export async function prenotaAzione(id: string) { return true; }\n// prenotaAzione(id) prima di eseguiAzione(id)\nexport",
    extra: ["pannello/src/app/api/azioni-pronte/route.ts"],
  });
});

// ── Le due che qui non si possono ribaltare, e il perché ─────────────────────

test("AR-206 — la prova delega al guardiano dei permessi, che ha già i suoi controlli", () => {
  // Non si ribalta con una copia parziale: `permessi-check.mjs` legge i file di permesso VERI, e
  // puntarlo altrove vorrebbe dire riscrivere il guardiano. Il verso «sì» lo prova la sua batteria
  // (cervello/test/permessi-check.test.mjs). Qui si pretende almeno che il verso «no» sia vivo e
  // motivato: una prova che dice no senza dire perché è un muro, non una diagnosi.
  const r = eseguiProva("--ar-206", REPO);
  assert.equal(r.codice, 1, `AR-206 doveva dire «il difetto c'è»: ${r.detto}`);
  assert.match(r.detto, /jolly/, "il no deve dire QUALE permesso è troppo largo, non solo che qualcosa non va");
});

test("AR-365 — senza le chiavi della memoria la prova esce ⚪, e ⚪ non è né un sì né un no", () => {
  // È il caso che va difeso di più: da una sessione senza `.env` il modulo dell'allerta si spegne
  // prima di rispondere. La prova NON deve inventarsi un verdetto — deve dire che non ha misurato.
  const r = eseguiProva("--ar-365", REPO);
  assert.ok([1, 2].includes(r.codice), `atteso 1 (difetto c'è) o 2 (non misurabile), avuto ${r.codice}: ${r.detto}`);
  if (r.codice === 2) assert.match(r.detto, /non posso esercitarla|non ho potuto/, "un ⚪ deve dire PERCHÉ non ha misurato");
});
