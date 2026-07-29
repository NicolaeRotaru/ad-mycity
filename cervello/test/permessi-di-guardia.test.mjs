// 🔐 AR-376 — IL GUARDIANO DEI PERMESSI ADESSO LO ASCOLTA QUALCUNO.
//
// Il difetto misurato il 29/7: `node cervello/permessi-check.mjs` esce **1** e riporta violazioni
// vere — due permessi col jolly su una cartella che la macchina stessa scrive, il divieto di push
// diretto assente, uno strumento che scrive su Supabase concesso senza chiedere — e **nessun
// processo ricorrente lo esegue**. Nel repo il suo nome compariva solo dentro il proprio test di
// unità (che prova le regole su input finti) e dentro stringhe di altri script. Il perimetro dei
// permessi era sorvegliato da uno strumento che non guardava niente.
//
// PERCHÉ IL FRENO STA QUI E NON NEL GIRO. Il giro è il pezzo che si ferma per primo (AR-377: il
// 29/7 il VPS è stato fermo quaranta ore). La suite di `cervello/test/` invece la eseguono TRE
// processi diversi — la CI su ogni push che tocca il codice, il cancello su ogni PR, e il giro come
// vincolo hard. Una difesa con tre esecutori indipendenti è una difesa; con uno è una speranza.
//
// PERCHÉ NON È UN «ESCE 0, QUINDI VERDE». Le quattro violazioni sono ancora lì e non le può
// riparare la macchina: `.claude/settings.json` è negato in scrittura alla macchina apposta, ed è
// giusto così. Quindi la prova non pretende zero violazioni: pretende che **ogni violazione viva sia
// DICHIARATA** in `cervello/permessi-debito.json` col suo perché, e che quelle dichiarate «chieste a
// Nicola» abbiano la loro card DAVVERO in coda. Una violazione nuova non ha nessuna dichiarazione,
// quindi rende rossa la suite: è il no del guardiano che finalmente arriva a qualcuno.
//
// COSA NON PROVA: non prova che le regole di `permessi-check.mjs` siano quelle giuste (lo prova il
// suo test di unità). Prova che il suo verdetto sul file VERO arrivi a una decisione.

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { analizza } from "../permessi-check.mjs";
import { debitoNonDichiarato } from "../guardia-viva.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const DEBITO = join(REPO, "cervello/permessi-debito.json");
const CODA = join(REPO, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md");
const SETTINGS = [".claude/settings.json", ".claude/settings.local.json"];

/** I permessi VERI, letti adesso dal disco: è il punto — nessuna fixture. */
function settingsVeri() {
  const out = [];
  for (const rel of SETTINGS) {
    const p = join(REPO, rel);
    if (!existsSync(p)) continue;
    const j = JSON.parse(readFileSync(p, "utf8"));
    const perm = j.permissions || {};
    out.push({ file: rel, allow: perm.allow || [], deny: perm.deny || [] });
  }
  return out;
}

/** La chiave stabile di una violazione: la regola più la voce che la causa. */
const chiaveDi = (v) => `${v.regola}|${v.voce}`;

test("i permessi veri sono giudicati adesso, non «giudicabili»", () => {
  const files = settingsVeri();
  assert.ok(files.length > 0, "nessun .claude/settings*.json leggibile: il guardiano sarebbe CIECO, e cieco non è verde");
  const { violazioni } = analizza(files);
  assert.ok(Array.isArray(violazioni), "analizza() deve rendere l'elenco delle violazioni");
  // Non si asserisce «zero»: si asserisce che il giudizio è stato ESEGUITO sul file vero. Il resto
  // lo dice il caso qui sotto.
});

test("ogni violazione viva è dichiarata, col perché e con la domanda che esiste davvero", () => {
  assert.ok(existsSync(DEBITO), `manca ${DEBITO}: senza il registro del debito non so cosa è già stato dichiarato`);
  const registro = JSON.parse(readFileSync(DEBITO, "utf8"));
  const dichiarate = registro.violazioni || {};
  const coda = existsSync(CODA) ? readFileSync(CODA, "utf8") : "";
  const cardInCoda = (marca) => coda.includes(marca);

  const { violazioni } = analizza(settingsVeri());
  const voci = violazioni.map((v) => ({ chiave: chiaveDi(v), regola: v.regola, voce: v.voce }));
  const scoperte = debitoNonDichiarato(voci, dichiarate, cardInCoda);

  assert.deepEqual(
    scoperte.map((s) => `${s.chiave} — ${s.perche_mancante}`),
    [],
    "una violazione dei permessi non dichiarata: o la ripara Nicola, o va scritto in cervello/permessi-debito.json PERCHÉ è ancora lì",
  );
});

test("il debito senza una card resta sotto il suo tetto", () => {
  const registro = JSON.parse(readFileSync(DEBITO, "utf8"));
  const dichiarate = registro.violazioni || {};
  const { violazioni } = analizza(settingsVeri());
  const vive = new Set(violazioni.map(chiaveDi));
  const senzaCard = Object.entries(dichiarate).filter(([k, v]) => vive.has(k) && !v.card);
  const tetto = Number(registro.tetto_senza_card ?? 0);
  assert.ok(
    senzaCard.length <= tetto,
    `${senzaCard.length} violazioni dichiarate senza una domanda in coda contro un tetto di ${tetto}: ` +
      "«dichiarata» non deve diventare il posto dove si parcheggia ciò che non si vuole chiedere",
  );
});

test("il registro del debito non tiene in vita scuse per violazioni sparite", () => {
  const registro = JSON.parse(readFileSync(DEBITO, "utf8"));
  const dichiarate = Object.keys(registro.violazioni || {});
  const { violazioni } = analizza(settingsVeri());
  const vive = new Set(violazioni.map(chiaveDi));
  const morte = dichiarate.filter((k) => !vive.has(k));
  assert.deepEqual(
    morte,
    [],
    "una scusa rimasta in piedi dopo che il buco è stato chiuso insegna che le scuse non scadono mai: toglila",
  );
});
