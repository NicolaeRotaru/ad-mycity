#!/usr/bin/env node
// AR-291 — il giro buttava via il verdetto di un guardiano mentre trasformava in vincolo quello del
// guardiano accanto.
//
// Nel preambolo, a due righe di distanza: `agent-registry-check` con l'uscita catturata e promossa a
// vincolo hard, e `stampo-check` in `| tail -6 || true`. Stesso giro, due destini — non una scelta,
// il residuo di come erano stati aggiunti, uno alla volta, in momenti diversi.
//
// La condizione di promozione che il difetto chiedeva («quando il metro legge il contenuto e non la
// sola presenza») è soddisfatta dal lotto 24: stampo-check ora legge quaderni, spessore relativo,
// fotocopie e struttura. Quindi qui diventa un cancello.
//
// E la regola generale: un guardiano resta informativo SOLO con la condizione scritta accanto. Tre
// restano tali oggi, tutti e tre con il perché — compreso quello che non si promuoverà mai, perché
// misura il carico di firme di Nicola e fermare la macchina per una firma umana punisce la parte
// sbagliata.

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { guardianiInformativi, senzaCondizione } from "../verdetti-guardiani.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const GIRO = readFileSync(join(REPO, "cervello/giro.sh"), "utf8");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

prova("il caso che ha rotto: un guardiano in `|| true` senza una riga che dica perché", () => {
  const finto = [
    '  echo "[$(ts)] Guardiano stampo senior..."',
    '  node "$SCRIPT_DIR/stampo-check.mjs" 2>&1 | tail -6 || true',
  ].join("\n");
  const s = senzaCondizione(finto);
  assert.equal(s.length, 1);
  assert.equal(s[0].guardiano, "stampo-check");
});

prova("con la condizione scritta sopra, l'informativo è legittimo", () => {
  const finto = [
    "  # INFORMATIVO — si promuove a cancello quando il drift è 0.",
    '  node "$SCRIPT_DIR/guardiano-capacita.mjs" 2>&1 | tail -4 || true',
  ].join("\n");
  assert.equal(senzaCondizione(finto).length, 0);
  assert.equal(guardianiInformativi(finto)[0].dichiarato, true);
});

prova("vale anche la rinuncia motivata: «NON si promuove» è una condizione dichiarata", () => {
  const finto = [
    "  # INFORMATIVO — NON si promuove: misura il carico di firme di Nicola, e fermare la macchina",
    "  # perché un umano non ha firmato punisce la parte sbagliata.",
    '  node "$SCRIPT_DIR/guardiano-tempo.mjs" 2>&1 | tail -3 || true',
  ].join("\n");
  assert.equal(senzaCondizione(finto).length, 0);
});

prova("un sensore non è un guardiano: non gli si chiede una condizione di promozione", () => {
  // Senza questo, la regola sarebbe rossa su quaranta righe (sensori, aggiornatori, contatori) e
  // verrebbe spenta entro la settimana insieme a tutto il resto.
  const finto = '  node "$SCRIPT_DIR/sensore-cassa.mjs" --json 2>&1 | tail -4 || true';
  assert.equal(guardianiInformativi(finto).length, 0);
});

prova("una seconda chiamata di stampa non è un verdetto buttato", () => {
  // Il caso di onesta-check: l'rc è già preso nell'`if !` sopra, il `|| true` è sulla stampa del
  // dettaglio. Trattarlo come scartato avrebbe fatto scrivere una finta condizione di promozione
  // sopra una riga che è già un cancello.
  const finto = [
    '  if ! node "$SCRIPT_DIR/onesta-check.mjs" "$f" >/dev/null 2>&1; then',
    '    node "$SCRIPT_DIR/onesta-check.mjs" "$f" 2>&1 | tail -12 >&2 || true',
    "  fi",
  ].join("\n");
  assert.equal(guardianiInformativi(finto).length, 0);
});

prova("una riga dentro un commento non è un'invocazione", () => {
  assert.equal(guardianiInformativi('#  node "$SCRIPT_DIR/stampo-check.mjs" | tail -6 || true').length, 0);
});

// ── Il giro VERO ────────────────────────────────────────────────────────────

prova("in giro.sh il verdetto dello stampo arriva al motore", () => {
  assert.match(GIRO, /if ! guardiano stampo-check\.mjs; then/,
    "l'uscita dev'essere catturata dall'helper, non finire in una pipe");
  assert.match(GIRO, /STAMPO_VINCOLO="\$\(vincolo_da_rc "stampo-check"/);
  const iVar = GIRO.indexOf('STAMPO_VINCOLO=""');
  const iUso = GIRO.indexOf('STAMPO_VINCOLO="$(vincolo_da_rc');
  assert.ok(iVar > 0 && iVar < iUso, "la variabile va dichiarata prima di essere riempita (set -u)");
  assert.match(GIRO, /## Vincolo stampo senior \(HARD[^\n]*\n\$STAMPO_VINCOLO/,
    "e il vincolo dev'essere INFILATO nel prompt: riempirlo senza usarlo è il difetto di prima con un nome nuovo");
});

prova("nessun guardiano resta informativo senza dire perché", () => {
  const s = senzaCondizione(GIRO);
  assert.equal(s.length, 0, `senza condizione: ${s.map((g) => `${g.guardiano}:${g.riga}`).join(", ")}`);
  assert.ok(guardianiInformativi(GIRO).length >= 2,
    "e ce ne sono ancora di informativi: se scendessero a zero questa prova non proverebbe più niente");
});

prova("il giro resta eseguibile: un `fi` perso qui lo spegne", () => {
  for (const f of ["giro.sh", "giro-esito.sh"]) {
    const r = spawnSync("bash", ["-n", join(REPO, "cervello", f)], { encoding: "utf8" });
    assert.equal(r.status, 0, `${f}: ${r.stderr}`);
  }
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
