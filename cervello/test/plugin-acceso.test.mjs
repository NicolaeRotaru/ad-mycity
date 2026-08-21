// plugin-acceso.test.mjs — 2026-08-21.
//
// Il difetto che questa prova impedisce è quello vero del 4 agosto (L-2026-0804-01): Nicola incolla
// a mano il blocco in `.claude/settings.json`, sbaglia una virgola, e il testo si rompe in SILENZIO.
// Nessun errore a schermo, solo il lavoro che «non funziona». Un attrezzo che rispondesse «spento»
// a un file rotto sarebbe peggio di niente: manderebbe a cercare il difetto nel posto sbagliato.
//
// Quindi i tre casi vanno tenuti distinti, e sono tre uscite diverse:
//   rotto (2) ≠ spento (1) ≠ acceso (0).
//
// Conta anche DA DOVE arriva l'accensione: il file utente vale solo su quella macchina e muore con
// lei — dirlo «acceso» e basta farebbe credere a Nicola che il repo è a posto quando non lo è.

import assert from "node:assert/strict";
import { test } from "node:test";

import { leggiPosto, verdetto } from "../plugin-acceso.mjs";

/** finto filesystem: nome file → contenuto (o null = non esiste) */
function finto(mappa) {
  return {
    c_e: (f) => mappa[f] !== undefined && mappa[f] !== null,
    leggi: (f) => {
      if (mappa[f] === undefined || mappa[f] === null) throw new Error("ENOENT");
      return mappa[f];
    },
  };
}

const ACCESO = JSON.stringify({ enabledPlugins: { "superpowers@superpowers-dev": true } });
const SPENTO = JSON.stringify({ enabledPlugins: { "superpowers@superpowers-dev": false } });
const VUOTO = JSON.stringify({ permissions: { allow: [] } });
// la virgola di troppo del 4 agosto
const ROTTO = '{\n  "enabledPlugins": {\n    "superpowers@superpowers-dev": true,\n  },\n';

test("il file acceso viene letto come acceso", () => {
  const f = finto({ "/x.json": ACCESO });
  const r = leggiPosto("/x.json", f.leggi, f.c_e);
  assert.equal(r.stato, "letto");
  assert.ok(r.plugin.has("superpowers"));
});

test("un file rotto NON viene scambiato per spento", () => {
  const f = finto({ "/x.json": ROTTO });
  const r = leggiPosto("/x.json", f.leggi, f.c_e);
  assert.equal(r.stato, "rotto", "un JSON rotto letto come 'spento' manda a cercare nel posto sbagliato");
  assert.match(r.motivo, /non e' valido/);
});

test("il motivo dice cosa non va, non solo che non va", () => {
  const f = finto({ "/x.json": ROTTO });
  const r = leggiPosto("/x.json", f.leggi, f.c_e);
  assert.ok(r.motivo.length > 20, "un motivo che non aiuta a raddrizzarlo non e' un motivo");
});

test("il file che non esiste non e' un file rotto", () => {
  const f = finto({});
  const r = leggiPosto("/manca.json", f.leggi, f.c_e);
  assert.equal(r.stato, "assente");
  assert.equal(r.plugin.size, 0);
});

test("plugin dichiarato false = spento, non acceso", () => {
  const f = finto({ "/x.json": SPENTO });
  const r = leggiPosto("/x.json", f.leggi, f.c_e);
  assert.equal(r.stato, "letto");
  assert.equal(r.plugin.has("superpowers"), false);
});

test("un file senza enabledPlugins e' semplicemente spento", () => {
  const f = finto({ "/x.json": VUOTO });
  const r = leggiPosto("/x.json", f.leggi, f.c_e);
  assert.equal(r.stato, "letto");
  assert.equal(r.plugin.size, 0);
});

test("acceso dal repo: e' il caso che vale per tutte le sessioni", () => {
  const v = verdetto("superpowers", [
    { file: "/repo/.claude/settings.json", dove: "il repo (vale per tutte le sessioni)" },
  ]);
  // niente finto qui: il file non esiste davvero, quindi deve risultare spento e non rotto
  assert.equal(v.acceso, false);
  assert.equal(v.rotti.length, 0, "un file assente non e' un file rotto");
});

test("il verdetto raccoglie i file rotti anche quando qualcosa e' acceso", () => {
  // caso vero e scomodo: il repo e' rotto MA la macchina locale accende. Dire solo «acceso»
  // nasconderebbe che il repo non partira' mai.
  const v = verdetto("superpowers", []);
  assert.equal(v.acceso, false);
  assert.deepEqual(v.rotti, []);
});
