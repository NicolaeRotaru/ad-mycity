#!/usr/bin/env node
// AR-255 — «Lo storico della salute è letto in due modi diversi: il grafico dell'andamento può
//           restare vuoto mentre i dati ci sono»
//
// Un file solo — 90-Memoria-AI/auto-coscienza/storico-salute.json — e due lettori con due tolleranze:
//
//   · /api/memoria/salute-onesta:  `Array.isArray(sj.serie) ? sj.serie : Array.isArray(sj) ? sj : []`
//        (accetta anche l'elenco NUDO in cima al file: quella riga è la cicatrice di un guasto vero)
//   · /api/memoria/auto-radiografia: inoltrava `storico` tale e quale, e il componente faceva
//        `d?.storico?.serie || []` → con l'elenco nudo trova `undefined` e disegna il vuoto.
//
// Due riquadri della STESSA pagina si contraddicono, e il vuoto si legge come «non c'è storia»:
// è la malattia della corsia (un dato che non si è potuto leggere mostrato come informazione
// tranquilla), qui in versione «forma inattesa». Peggio: `for (const s of serie)` su un oggetto
// LANCIA in pieno render e porta via la pagina del Cervello.
//
// Cura: una funzione sola, `serieSicura`, chiamata dal server (il confine) e dal browser (paracadute).

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const leggi = (f) => readFileSync(join(REPO, f), "utf8");

const casi = [];
const prova = (nome, fn) => casi.push({ nome, fn });

const M = await import(join(REPO, "pannello/src/lib/verdetto-dato.ts"));

/** Quello che fa il componente sulla serie: se non è iterabile, esplode in pieno render. */
function disegnaAndamento(serie) {
  const perGiorno = new Map();
  for (const s of serie) {
    const g = String(s?.data || "").slice(0, 10);
    if (g) perGiorno.set(g, { ...s, data: g });
  }
  return [...perGiorno.values()];
}

// ── il caso che ha rotto ─────────────────────────────────────────────────────
prova("il caso che ha rotto: l'elenco NUDO non può dare due risultati diversi ai due lettori", () => {
  const nudo = [
    { data: "2026-07-27", voto_salute: 70, voto_pieno: 61 },
    { data: "2026-07-28", voto_salute: 72, voto_pieno: 64 },
  ];
  // Strada 1 — salute-onesta (già tollerante). Strada 2 — auto-radiografia (prima inoltrava e basta).
  const stradaSaluteOnesta = M.serieSicura(nudo);
  const stradaRadiografia = M.serieSicura({ serie: M.serieSicura(nudo) }); // la route ora normalizza
  assert.equal(stradaSaluteOnesta.length, 2);
  assert.equal(stradaRadiografia.length, 2, "il grafico restava vuoto mentre l'altro riquadro mostrava la storia");
  assert.deepEqual(stradaRadiografia, stradaSaluteOnesta, "due lettori dello stesso file non possono contraddirsi");
});

prova("la forma di oggi ({serie:[…]}) continua a funzionare", () => {
  const oggi = { serie: [{ data: "2026-07-28", voto_salute: 72 }] };
  assert.equal(M.serieSicura(oggi).length, 1);
});

prova("una forma impossibile non fa saltare la pagina: torna vuoto, non lancia", () => {
  for (const brutto of [null, undefined, 42, "stringa", { serie: { 0: "x" } }, { serie: null }, {}]) {
    const serie = M.serieSicura(brutto);
    assert.ok(Array.isArray(serie), `serieSicura ha restituito qualcosa di non iterabile per ${JSON.stringify(brutto)}`);
    assert.doesNotThrow(() => disegnaAndamento(serie), "il `for…of` del componente deve poter girare sempre");
  }
});

prova("il caso che portava via il Cervello: `serie` come OGGETTO", () => {
  const rotto = { serie: { "2026-07-28": { voto_salute: 72 } } };
  assert.throws(() => disegnaAndamento(rotto.serie), TypeError, "premessa: senza difesa il render lancia davvero");
  assert.doesNotThrow(() => disegnaAndamento(M.serieSicura(rotto)));
});

prova("i buchi DENTRO la lista non arrivano al grafico", () => {
  const conBuchi = { serie: [{ data: "2026-07-28" }, null, undefined, { data: "2026-07-29" }] };
  const serie = M.serieSicura(conBuchi);
  assert.equal(serie.length, 2, "un null fra le voci è la seconda causa di eccezione dentro un .then()");
  assert.equal(disegnaAndamento(serie).length, 2);
});

// ── sul file VERO, non su un finto ──────────────────────────────────────────
prova("sul file vero del vault: la storia c'è e passa intera da entrambe le strade", () => {
  const f = "MyCity-Vault/90-Memoria-AI/auto-coscienza/storico-salute.json";
  assert.ok(existsSync(join(REPO, f)), "senza il file vero questa prova non prova niente");
  const vero = JSON.parse(leggi(f));
  const serie = M.serieSicura(vero);
  assert.ok(serie.length > 0, "lo storico vero deve avere delle voci, altrimenti il vuoto non distinguerebbe niente");
  // La stessa serie, riscritta nella forma «elenco nudo»: deve restare identica.
  assert.equal(M.serieSicura(serie).length, serie.length);
  assert.equal(disegnaAndamento(serie).length > 0, true, "il grafico deve avere almeno un giorno da disegnare");
});

// ── il cablaggio: un file, un lettore ───────────────────────────────────────
prova("tutte e tre le letture dello storico passano dalla stessa funzione", () => {
  const letture = [
    "pannello/src/app/api/memoria/auto-radiografia/route.ts",
    "pannello/src/app/api/memoria/salute-onesta/route.ts",
    "pannello/src/components/cervello/RadiografiaDiSe.tsx",
  ];
  for (const f of letture) assert.match(leggi(f), /serieSicura[<(]/, `${f} legge lo storico con regole sue`);
  // La normalizzazione a mano non deve tornare: era la copia divergente.
  assert.doesNotMatch(
    leggi("pannello/src/app/api/memoria/salute-onesta/route.ts"),
    /Array\.isArray\(sj\.serie\) \? sj\.serie : Array\.isArray\(sj\)/,
    "la tolleranza scritta a mano in un lettore solo è la causa radice",
  );
  assert.doesNotMatch(
    leggi("pannello/src/components/cervello/RadiografiaDiSe.tsx"),
    /d\?\.storico\?\.serie \|\| \[\]/,
    "«|| []» non difende dalla FORMA",
  );
  // Il confine: la route normalizza PRIMA di servire, così ogni schermata futura nasce sana.
  assert.match(
    leggi("pannello/src/app/api/memoria/auto-radiografia/route.ts"),
    /storico: \{ serie: serieSicura\(storico\) \}/,
    "la route deve servire la forma normalizzata, non il file grezzo",
  );
});

let falliti = 0;
for (const c of casi) {
  try {
    await c.fn();
    console.log(`  ok - ${c.nome}`);
  } catch (e) {
    falliti++;
    console.log(`not ok - ${c.nome}\n      ${(e.message || String(e)).split("\n")[0]}`);
  }
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
