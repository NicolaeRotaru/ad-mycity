import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAzioniAttesa } from "./azioni-attesa.ts";

// IL DIFETTO, misurato il 10/8 sulla coda vera: ogni card a sezione arrivava in Cabina col titolo
// «▯ — Dimmi quali piani riscrivo», cioè mezza emoji e un trattino appeso al nulla.
//
// La causa non era il titolo: era una classe di caratteri senza il flag `u` in `parseHeading`.
// Senza `u`, `[🟢🟡🔴]` non è «una di queste tre emoji» ma «una di queste sei unità UTF-16», perché
// ognuna è una coppia. Le tre emoji condividono la prima metà, quindi la classe toglieva quella e
// lasciava la seconda orfana. La riga gemella in `pulisciTitolo` il flag ce l'ha da sempre: lo
// stesso testo, passato di là, usciva pulito — ed è per questo che il difetto è sopravvissuto.
//
// Si prova sul PARSER intero, non su `parseHeading` (che non è esportata): è anche il modo giusto,
// perché il difetto viveva nel passaggio fra le due funzioni, non dentro una delle due.

const card = (semaforo: string, titolo: string) =>
  [
    `### ${semaforo} #slug-di-prova — ${titolo} · ⏳ accodata 2026-08-10 16:15`,
    "",
    `**Cosa cambia:** qualcosa di concreto.`,
    `**Se va bene:** il passo dopo.`,
    `- **Colore:** ${semaforo}`,
    "",
  ].join("\n");

test("nessun titolo di card contiene un pezzo di emoji orfano", () => {
  const md = ["# Coda", "", card("🟡", "Dimmi quali piani riscrivo"), card("🔴", "Manda la mail al fornaio"), card("🟢", "Prepara la bozza")].join("\n");
  for (const a of parseAzioniAttesa(md)) {
    const t = String(a.azione ?? "");
    // Un surrogato spaiato è invisibile a occhio e sopravvive a ogni `trim`: si cerca per codice.
    for (const ch of t) {
      const c = ch.codePointAt(0)!;
      assert.ok(c < 0xd800 || c > 0xdfff, `surrogato spaiato in «${t}» (U+${c.toString(16).toUpperCase()})`);
    }
    assert.ok(!/^\s*[—–-]/.test(t), `il titolo comincia con un trattino appeso: «${t}»`);
  }
});

test("il titolo che resta è quello umano, senza semaforo e senza slug", () => {
  const md = ["# Coda", "", card("🟡", "Dimmi quali piani riscrivo")].join("\n");
  const a = parseAzioniAttesa(md).find((x) => String(x.azione).includes("Dimmi quali piani"));
  assert.ok(a, "la card deve essere letta");
  assert.equal(a!.azione, "Dimmi quali piani riscrivo");
});

test("il semaforo resta nel colore, non si perde insieme al carattere", () => {
  const md = ["# Coda", "", card("🔴", "Manda la mail al fornaio")].join("\n");
  const a = parseAzioniAttesa(md).find((x) => String(x.azione).includes("fornaio"));
  assert.equal(a!.colore, "🔴");
  assert.equal(a!.livello, "rosso");
});
