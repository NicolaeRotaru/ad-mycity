#!/usr/bin/env node
// AR-129 — la soglia dei kit era tarata al verde: 5.200 byte, cioè 82 SOTTO il kit più piccolo.
//
// Misurato il 28/7 sul parco vero: 120 kit, il più piccolo 5.282 byte, la mediana 17.649. Con un
// pavimento a 5.200 nessun kit poteva fallire il controllo «non-stub» — non perché i kit fossero
// profondi, ma perché il numero era stato scelto dopo aver guardato i file, per farli passare tutti.
// Una metrica-proxy calibrata sul risultato desiderato non misura: certifica.
//
// La cura non è alzare il numero (invecchierebbe allo stesso modo, solo un anno dopo): è renderlo
// RELATIVO alla mediana del parco. Se i kit migliorano, la soglia sale da sola; se qualcuno ne aggiunge
// uno scheletrico, sporge subito.
//
// Qui si esegue la decisione su parchi finti: com'è il parco adesso non prova niente sulla soglia.

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { FRAZIONE_MEDIANA, mediana, sogliaSottile } from "../stampo-metro.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

prova("il caso che ha rotto: un pavimento sotto il file più piccolo non boccia MAI nessuno", () => {
  // Il parco vero del 28/7, nella sua forma: i dieci del cluster banche/legale in fondo (5.282-6.706
  // byte) e centodieci attorno alla mediana di 17.649. La forma conta — la prima stesura di questa
  // prova metteva dieci piccoli e tre grandi, e con quel campione la mediana crollava a 5.860: la
  // soglia relativa non bocciava nessuno e la prova accusava il fix invece del difetto.
  const cluster = [5282, 5557, 5625, 5693, 5726, 5819, 5860, 6031, 6163, 6706];
  const parco = [...cluster, ...Array.from({ length: 110 }, (_, i) => 14000 + i * 100)];
  const PAVIMENTO_VECCHIO = 5200;
  assert.equal(parco.filter((b) => b < PAVIMENTO_VECCHIO).length, 0, "il vecchio metro non poteva dire di no");
  assert.equal(parco.filter((b) => b < sogliaSottile(parco)).length, cluster.length,
    "quello nuovo boccia esattamente il cluster, senza toccare gli altri centodieci");
});

prova("la soglia è relativa: se il parco migliora, sale da sola", () => {
  const magro = [1000, 2000, 3000, 4000, 5000];
  const grasso = magro.map((x) => x * 10);
  assert.ok(sogliaSottile(grasso) > sogliaSottile(magro),
    "un pavimento fisso resterebbe uguale mentre il parco cresce: è così che smette di misurare");
  assert.equal(sogliaSottile(grasso), sogliaSottile(magro) * 10, "scala esattamente col parco");
});

prova("la mediana regge sia i parchi pari sia quelli dispari", () => {
  assert.equal(mediana([1, 2, 3]), 2);
  assert.equal(mediana([1, 2, 3, 4]), 3, "pari: media dei due centrali, arrotondata");
  assert.equal(mediana([]), 0, "parco vuoto non fa esplodere: torna 0 e la soglia si spegne");
  assert.equal(sogliaSottile([]), 0, "soglia 0 = nessuno bocciato per spessore, non tutti");
});

prova("un kit esattamente alla soglia passa: si boccia SOTTO, non uguale", () => {
  const parco = [1000, 1000, 1000];        // mediana 1000 → soglia 400
  assert.equal(sogliaSottile(parco), 400);
  assert.equal([400].filter((b) => b < sogliaSottile(parco)).length, 0);
  assert.equal([399].filter((b) => b < sogliaSottile(parco)).length, 1);
});

prova("la frazione è dichiarata e non nascosta in un numero magico", () => {
  assert.ok(FRAZIONE_MEDIANA > 0 && FRAZIONE_MEDIANA < 1);
  assert.equal(sogliaSottile([100, 100, 100]), Math.round(100 * FRAZIONE_MEDIANA));
});

// ── Il guardiano VERO ───────────────────────────────────────────────────────

prova("sul parco vero la soglia non è più il vecchio pavimento", () => {
  // Non si asserisce il verde globale (lo fa un'altra prova per un altro difetto): si legge il
  // numero che questo difetto contestava.
  const r = spawnSync("node", [join(REPO, "cervello/stampo-check.mjs"), "--json"], { cwd: REPO, encoding: "utf8" });
  const j = JSON.parse(r.stdout);
  assert.ok(j.soglia_sottile_byte > 5200,
    `la soglia dev'essere risalita sopra il vecchio pavimento tarato al verde, è ${j.soglia_sottile_byte}`);
  assert.ok(j.per_tipo.kit_sottile > 0,
    "e deve avere qualcuno da indicare: una soglia che non boccia nessuno è quella di prima con un altro nome");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
