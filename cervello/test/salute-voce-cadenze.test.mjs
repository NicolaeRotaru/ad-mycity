#!/usr/bin/env node
// AR-594 — sei cadenze rosse e la visita taceva.
//
// LA STORIA, misurata il 13/8. La sveglia delle cadenze era rossa: quattro fuori dalla loro finestra,
// tre uscite saltando dei passi. In `salute.json` — il referto che Nicola apre per chiedere «la
// macchina sta bene?» — la parola «cadenza» non compariva NEMMENO UNA VOLTA. Il verdetto esisteva
// già (`freschezza-cadenze.mjs`), ma il suo unico sbocco era il prompt del giro: cioè finiva
// nell'organo che stava fallendo. Il canale pensato per dire «qualcosa è rotto» rispondeva «tutto
// nella norma» proprio mentre il battito era fermo.
//
// COSA PROVA QUESTO FILE, eseguendo:
//   ① la voce ESISTE nella visita e gira nel modo rapido, cioè sempre — non solo in quella completa;
//   ② con le cadenze ferme il controllo diventa ❌ e dice quante e quali (guardiano iniettato);
//   ③ con le cadenze a posto è ✅, e quando il guardiano è cieco è ⚪ — mai un verde di comodo;
//   ④ il rosso arriva fin dentro il testo che legge Nicola, non solo nei dati.
//
// NON-VACUITÀ (verificata rompendo il fix apposta): togliendo dalla lista di `salute.mjs` la voce
// `id: "worker.cadenze"` (o rinominandola), i casi ① ② ③ ④ diventano ROSSI — è esattamente lo stato
// in cui il difetto è nato.

import assert from "node:assert/strict";
import { CONTROLLI, giudicaCadenze, quattroRisposte, referto } from "../salute.mjs";

const casi = [];
const provaAsync = async (nome, fn) => {
  try {
    await fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Un guardiano finto: risponde quello che gli si dice, senza toccare il disco. */
const guardiano = (code, dati) => () => ({ partito: true, code, out: JSON.stringify(dati), ms: 5 });

/** Il quadro che il guardiano vero stampa quando il ritmo si è fermato (misurato il 13/8). */
const RITMO_FERMO = {
  invecchiate: [
    { tipo: "mattino", ore: 39, oreMax: 26, motivo: "ultima 39 ore fa" },
    { tipo: "sera", ore: 44, oreMax: 26, motivo: "ultima 44 ore fa" },
    { tipo: "settimana", ore: 200, oreMax: 180, motivo: "ultima 200 ore fa" },
    { tipo: "mese", ore: 900, oreMax: 800, motivo: "ultima 900 ore fa" },
  ],
  maiViste: [],
  passiSaltati: [{ tipo: "mattino", quando: "2026-08-11 07:10" }],
  totali: 6,
};

const voce = () => CONTROLLI.find((c) => c.id === "worker.cadenze");

// ── ① La voce esiste, e gira sempre ─────────────────────────────────────────

await provaAsync("la visita ha una voce sul battito delle cadenze", () => {
  const c = voce();
  assert.ok(c, "manca il controllo worker.cadenze: è esattamente il difetto AR-594");
  assert.match(c.titolo.toLowerCase(), /cadenz/, "il titolo deve nominare le cadenze: è la parola che si cerca nel referto");
});

await provaAsync("gira anche nella visita rapida, non solo nella completa", () => {
  const c = voce();
  // `modi` assente = gira in tutti i modi. Se un giorno qualcuno la relega alla visita completa,
  // il difetto torna: sul VPS la visita rapida è quella che gira mattina e sera.
  assert.equal(c.modi, undefined, "una voce che gira solo nella visita completa tace proprio quando serve");
  assert.equal(c.soloSu, undefined, "e deve valere da tutte e due le case, VPS e cloud");
});

// ── ② Il caso vero: il ritmo fermo ──────────────────────────────────────────

await provaAsync("⬇️ con quattro cadenze fuori finestra il controllo è ❌ e dice quali", async () => {
  const e = await voce().prova({ esegui: guardiano(1, RITMO_FERMO) });
  assert.equal(e.esito, "rotto", `atteso ❌, avuto ${e.esito}: «${e.detto}»`);
  assert.match(e.detto, /4 cadenze su 6/, "il numero va detto, non riassunto in «qualcosa non va»");
  assert.match(e.detto, /mattino/, "e i nomi pure: senza, Nicola non sa cosa è saltato");
  assert.match(e.detto, /saltando dei passi/, "i passi saltati sono un guasto diverso e va detto");
});

await provaAsync("il verdetto porta con sé il comando per rifarlo a mano", async () => {
  const e = await voce().prova({ esegui: guardiano(1, RITMO_FERMO) });
  assert.equal(e.prova, "node cervello/freschezza-cadenze.mjs");
});

// ── ③ I due estremi: verde vero e cieco onesto ──────────────────────────────

await provaAsync("tutte dentro la finestra ⇒ ✅", async () => {
  const e = await voce().prova({ esegui: guardiano(0, { invecchiate: [], maiViste: [], passiSaltati: [], totali: 6 }) });
  assert.equal(e.esito, "ok");
  assert.match(e.detto, /6 cadenze/);
});

await provaAsync("una cadenza che non ha mai girato non è una bocciatura", async () => {
  const e = await voce().prova({
    esegui: guardiano(0, { invecchiate: [], maiViste: [{ tipo: "mese", motivo: "mai registrata" }], passiSaltati: [], totali: 6 }),
  });
  assert.equal(e.esito, "ok", "l'installazione in corso non è un guasto");
  assert.match(e.detto, /mai girato/);
});

await provaAsync("guardiano cieco ⇒ ⚪, mai un verde di comodo", async () => {
  const e = await voce().prova({ esegui: () => ({ partito: true, code: 2, out: JSON.stringify({ cieco: true, motivo: "ENOENT" }), ms: 2 }) });
  assert.equal(e.esito, "nonvisto", "un guardiano che non ha potuto misurare non dice «tutto a posto»");
});

await provaAsync("guardiano che non parte ⇒ 🔧, cioè un mio controllo rotto", async () => {
  const e = giudicaCadenze({ partito: false, motivo: "manca cervello/freschezza-cadenze.mjs" });
  assert.equal(e.esito, "guasto");
});

await provaAsync("uscita illeggibile ⇒ ⚪: un guardiano muto non è un guardiano contento", async () => {
  const e = giudicaCadenze({ partito: true, code: 0, out: "buongiorno", ms: 1 });
  assert.equal(e.esito, "nonvisto");
});

// ── ④ E arriva fino agli occhi di Nicola ────────────────────────────────────

await provaAsync("⬇️ il ritmo fermo compare nel testo del referto, non solo nei dati", async () => {
  const rotto = { ...(await voce().prova({ esegui: guardiano(1, RITMO_FERMO) })), id: "worker.cadenze", organo: "worker", titolo: "Le cadenze si alzano davvero", impatto: 2 };
  const visita = {
    risultati: [rotto],
    rotti: [rotto],
    guasti: [],
    nonVisti: [],
    buoni: [],
    copertura: 1,
    mancantiAutotest: [],
  };
  const testo = `${quattroRisposte(visita).join("\n")}\n${referto(visita)}`;
  assert.match(testo, /cadenz/i, "la parola non compariva NEMMENO UNA VOLTA: era questo il difetto");
  assert.match(testo, /4 cadenze su 6/, "e col numero, che è quello che fa alzare il sopracciglio");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
