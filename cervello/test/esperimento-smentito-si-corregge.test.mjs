#!/usr/bin/env node
// AR-744 — la macchina sapeva che il dato era sbagliato e lo lasciava sbagliato.
//
// Dal 15/8 `statoEffettivo` sa riconoscere un esperimento che si dichiara «misurato» mentre la sua
// stessa nota dice che il gate non è mai partito. Ma sapeva e basta: il registro sul disco continuava
// a dire `stato: "misurato"`, e chi lo leggeva senza passare dal modulo — il Pannello, un giro
// futuro, una radiografia — leggeva nove esperimenti misurati. Il rilevatore era un LETTORE.
//
// E c'era un difetto dentro il difetto, trovato riparando: `prove-difetti.mjs` non chiamava la casa
// unica, si era scritto la sua copia privata della regola. Le due divergevano — la copia vedeva SEI
// esperimenti bugiardi, la casa unica NOVE: EXP-006, EXP-013 ed EXP-015 erano invisibili proprio al
// metro incaricato di contarli. Il metro sotto-contava del 33% e stampava un numero preciso.
//
// Qui si eseguono le funzioni vere sul registro vero, e si pretende che il correttore chiuda la
// contraddizione invece di descriverla.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");
const REPO = join(CERVELLO, "..");

const E = await import(join(CERVELLO, "esperimenti-regole.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

const registro = JSON.parse(
  readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-miglioramento.json"), "utf8"),
);

// ───────────────── il dato vero sul disco non si contraddice più ─────────────────

prova("AR-744: nel registro VERO nessuna etichetta è smentita dal proprio racconto", () => {
  const smentiti = E.esperimentiSmentiti(registro.esperimenti || []);
  assert.equal(
    smentiti.length,
    0,
    `il disco dichiara ancora finiti ${smentiti.length} esperimenti che la loro stessa nota smentisce: ${smentiti.map((e) => e.id).join(", ")}`,
  );
});

prova("AR-744: la correzione ha lasciato la storia intatta e la parola di prima visibile", () => {
  const corretti = (registro.esperimenti || []).filter((e) => e.stato_dichiarato);
  assert.ok(corretti.length >= 9, `attesi almeno 9 esperimenti corretti, trovati ${corretti.length}`);
  for (const e of corretti) {
    assert.equal(e.stato, "non-testato", `${e.id}: lo stato corretto deve essere non-testato`);
    assert.equal(e.stato_dichiarato, "misurato", `${e.id}: la parola di prima deve restare leggibile`);
    assert.ok(String(e.nota || "").length > 0, `${e.id}: la nota è il racconto, non si cancella`);
  }
});

// ───────────────── il correttore chiude la contraddizione, e regge il secondo giro ─────────────────

prova("AR-744: il correttore riscrive l'etichetta smentita e non tocca le altre", () => {
  const bugiardo = { id: "EXP-FINTO", stato: "misurato", nota: "MANCATA (non testata): il gate non è mai stato pubblicato" };
  const onesto = { id: "EXP-VERO", stato: "misurato", nota: "gate partito il 3/8, misurato: 12 aperture su 40 invii" };
  const promessa = { id: "EXP-PIANO", stato: "pianificato", nota: "si apre dopo i primi 10 ordini" };
  const { esperimenti, corretti } = E.correggiStati([bugiardo, onesto, promessa]);
  assert.equal(corretti.length, 1, "solo il bugiardo va corretto");
  assert.equal(corretti[0].id, "EXP-FINTO");
  assert.equal(esperimenti[0].stato, "non-testato");
  assert.equal(esperimenti[0].nota, bugiardo.nota, "la storia non si riscrive");
  assert.equal(esperimenti[1].stato, "misurato", "un esperimento davvero corso resta misurato");
  assert.equal(esperimenti[2].stato, "pianificato", "una promessa non scaduta non si tocca");
});

prova("AR-744: correggere due volte non cambia niente (il correttore è stabile)", () => {
  const lista = [{ id: "EXP-A", stato: "misurato", nota: "il post non è mai stato pubblicato" }];
  const primo = E.correggiStati(lista);
  const secondo = E.correggiStati(primo.esperimenti);
  assert.equal(secondo.corretti.length, 0, "la seconda passata non deve trovare più niente da correggere");
  assert.deepEqual(secondo.esperimenti, primo.esperimenti);
});

prova("AR-744: se la bugia rientra dalla porta, il rilevatore la vede", () => {
  // Il freno serve a questo: non a guarire i nove di oggi, ma a impedire al decimo di passare.
  const rientrata = [...(registro.esperimenti || []), { id: "EXP-NUOVO", stato: "chiuso", nota: "l'email non è mai partita" }];
  const smentiti = E.esperimentiSmentiti(rientrata);
  assert.equal(smentiti.length, 1, "un esperimento nuovo che si dichiara chiuso senza essere partito deve essere visto");
  assert.equal(smentiti[0].id, "EXP-NUOVO");
});

// ───────────────── la porta AUTOMATICA, non solo quella a mano ─────────────────

prova("AR-744: il guardiano che gira da solo CHIAMA il correttore, non solo il contatore", () => {
  // Il secondo giro del lotto 49 ha trovato qui il buco vero: i nove di oggi erano stati corretti a
  // mano, e `correggiStati` non lo chiamava nessuno nella macchina viva. È AR-172 — riparare la porta
  // a mano e lasciare aperta quella automatica è il modo più sicuro di far tornare il difetto da solo.
  const guardiano = readFileSync(join(CERVELLO, "esperimenti-check.mjs"), "utf8");
  assert.match(guardiano, /correggiStati/, "il guardiano deve correggere, non solo contare");
  const chiamate = (guardiano.match(/correggiStati/g) || []).length;
  assert.ok(chiamate >= 2, "una sola occorrenza è solo l'import: la difesa sarebbe morta");
  assert.match(
    guardiano,
    /etichette_corrette/,
    "una correzione silenziosa è una perdita: il guardiano deve dichiarare cosa ha corretto",
  );
});

// ───────────────── una casa sola per la regola ─────────────────

prova("AR-744: il rilevatore importa la regola invece di rifarsela in casa", () => {
  const rilevatore = readFileSync(join(CERVELLO, "prove-difetti.mjs"), "utf8");
  assert.match(rilevatore, /esperimentiSmentiti/, "prove-difetti deve chiamare la casa unica");
  const chiamate = (rilevatore.match(/esperimentiSmentiti/g) || []).length;
  assert.ok(chiamate >= 2, "una sola occorrenza è solo l'import: la difesa sarebbe morta");
  assert.doesNotMatch(
    rilevatore,
    /const maiPartito = \//,
    "la copia privata della regola è tornata: due case per la stessa decisione divergono sempre",
  );
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
