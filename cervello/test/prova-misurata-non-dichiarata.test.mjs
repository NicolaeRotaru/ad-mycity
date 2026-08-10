// AR-562 — «il fix è già nel codice» si MISURA. Un campo che dice cosa mi aspetto non è una misura.
//
// Il difetto peggiore trovato nella radiografia della catena di lavoro (2026-08-10), perché sporca
// il numero con cui la macchina decide quanto lavoro le resta.
//
// `sonda-volano.mjs` classificava come (b) CHIUSO-IN-CODICE — cioè «risolto, aspetta solo il merge»
// — ogni difetto con `verifica.presente === true`. Ma in `auto-fix.mjs` quel campo dice tutt'altro:
//
//     const vuolePresente = v.presente !== false;   // default: presente=true
//
// cioè **il verso con cui leggere la prova**, scritto quando il difetto nasce. Siccome quasi ogni
// fix consiste nell'aggiungere qualcosa, quasi ogni difetto nasce con `presente: true`: la sonda li
// accreditava tutti come già risolti, senza aprire un solo file.
//
// Misurato sul cantiere vero: 84 difetti su 220 non chiusi erano accreditati così. Rieseguendo la
// prova sui file di oggi, 84 su 84 erano FALSE (76 pattern assenti, 8 file che non esistono più).
//
// Il primo caso qui sotto è il metro: con la logica vecchia (`verifica.presente === true`) era
// `true`, e questo test non poteva esistere. Qui si esegue la funzione VERA.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const { provaPresenteOra } = await import(join(QUI, "..", "sonda-volano.mjs"));

/** Un finto disco: il percorso non esiste se non è in questa mappa. */
const disco = (mappa) => (percorso) => (percorso in mappa ? mappa[percorso] : null);

// ── Il caso che ha rotto ──────────────────────────────────────────────────────
test("il caso che ha rotto: `presente: true` col pattern ASSENTE non è un fix nel codice", () => {
  // Vecchia logica: `d.verifica.presente === true` → true, accreditato come già risolto.
  // Nuova: si apre il file, il pattern non c'è → resta da lavorare.
  const d = { id: "AR-000", verifica: { file: "cervello/x.mjs", pattern: "lower_bound", presente: true } };
  assert.equal(provaPresenteOra(d, disco({ "cervello/x.mjs": "// niente di quel nome qui\n" })), false);
});

test("gli 8 che puntavano a un file sparito: file assente non si accredita", () => {
  const d = { id: "AR-132", verifica: { file: "cervello/mappa-copertura.mjs", pattern: "copertura", presente: true } };
  assert.equal(provaPresenteOra(d, disco({})), false, "un file che non esiste non può contenere la prova");
});

// ── Quello che invece è giusto accreditare ───────────────────────────────────
test("il pattern c'è davvero → sì, il fix è nel codice e aspetta il merge", () => {
  const d = { id: "AR-001", verifica: { file: "cervello/x.mjs", pattern: "lower_bound", presente: true } };
  assert.equal(provaPresenteOra(d, disco({ "cervello/x.mjs": "const lower_bound = 0.3;\n" })), true);
});

test("il verso negativo si onora: `presente: false` è soddisfatto quando il pattern NON c'è", () => {
  const v = { file: "cervello/x.mjs", pattern: "TODO", presente: false };
  assert.equal(provaPresenteOra({ verifica: v }, disco({ "cervello/x.mjs": "pulito\n" })), true, "sparito → risolto");
  assert.equal(provaPresenteOra({ verifica: v }, disco({ "cervello/x.mjs": "TODO: manca\n" })), false, "c'è ancora → aperto");
});

// ── Cieco non è verde ────────────────────────────────────────────────────────
test("una prova a comando non si accredita: la sonda non esegue comandi, quindi non ha misurato", () => {
  const d = { verifica: { comando: "node cervello/gate-veri.mjs", presente: true } };
  assert.equal(provaPresenteOra(d, disco({})), false);
});

test("una prova umana resta umana: non è un credito automatico", () => {
  const d = { verifica: { tipo: "umano", nota: "lo guarda Nicola", presente: true } };
  assert.equal(provaPresenteOra(d, disco({})), false);
});

test("senza prova, o con una prova a metà, non si accredita niente", () => {
  assert.equal(provaPresenteOra({}, disco({})), false, "nessuna verifica");
  assert.equal(provaPresenteOra({ verifica: { presente: true } }, disco({})), false, "né file né pattern");
  assert.equal(provaPresenteOra({ verifica: { file: "a.mjs", presente: true } }, disco({ "a.mjs": "x" })), false, "manca il pattern");
});

test("un file illeggibile (il lettore torna null) non diventa un verde", () => {
  const d = { verifica: { file: "cervello/x.mjs", pattern: "x", presente: true } };
  assert.equal(provaPresenteOra(d, () => null), false);
});

// ── Lo stesso metro di auto-fix, non una copia ────────────────────────────────
test("usa il metro condiviso: un pattern non compilabile come regex vale come testo letterale", () => {
  // AR-151: `id=eq.$id` compilato come regex non può matchare (il `$` asserisce fine-stringa).
  // provaSoddisfatta lo confronta anche letteralmente. Qui si verifica che la sonda erediti quel metro.
  const d = { verifica: { file: "cervello/x.mjs", pattern: "id=eq.$id&stato=eq.in_attesa", presente: true } };
  assert.equal(provaPresenteOra(d, disco({ "cervello/x.mjs": "url += 'id=eq.$id&stato=eq.in_attesa';\n" })), true);
});
