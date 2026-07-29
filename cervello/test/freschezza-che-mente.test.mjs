#!/usr/bin/env node
// AR-237 — «Il Pannello scrive "aggiornato adesso" anche su dati di tre giorni fa»
//
// La targhetta mostrava `Date.now()` del browser, preso alla fine della chiamata:
//
//     setAggAt(Date.now());            // Plancia
//     setDatiAggiornatiAt(Date.now()); // page.tsx, anche su una /api/stato che ha risposto 500
//
// Quello è l'orario in cui HO CHIESTO, non l'età del dato. Su una fonte ferma da tre giorni la
// Cabina scriveva «aggiornato · adesso»: Nicola legge una lista bloccata come se fosse appena
// arrivata. È la stessa malattia del lotto — un dato che non si è potuto vedere (o che non si muove)
// letto come verde — spostata sull'orologio.
//
// DIFFERENZA SCHEDA/CODICE, verificata: il fix proposto diceva di prendere il `committer.date` «che
// la Contents API già restituisce in lib/obsidian.ts::contentsGet». NON è vero: `contentsGet` fa
// GET /repos/{o}/{r}/contents/{path}, che torna name/size/sha/content e nessuna data di commit —
// servirebbe una seconda chiamata a /commits?path=… per ogni file, a ogni tick. La data vera si
// prende dal CONTENUTO, che la porta già: la data della card in coda, la data dell'avviso in
// bacheca, il prefisso AAAA-MM-GG del nome file in consegne. Dove non c'è (CHECKLIST-NICOLA.md non
// ha date) il campo resta `null` e la targhetta dice «non so di quando sono questi dati» — il terzo
// stato, che è il punto di tutta la corsia.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const leggi = (f) => readFileSync(join(REPO, f), "utf8");

const casi = [];
const prova = (nome, fn) => casi.push({ nome, fn });

const M = await import(join(REPO, "pannello/src/lib/verdetto-dato.ts"));

const ORA = Date.parse("2026-07-29T12:00:00+02:00");
const ore = (n) => ORA - n * 3_600_000;

// ── il caso che ha rotto ─────────────────────────────────────────────────────
prova("il caso che ha rotto: dati di tre giorni fa NON possono risultare freschi", () => {
  const f = M.freschezza({ dataDato: "2026-07-26 09:40", adesso: ORA });
  assert.equal(f.stato, "vecchio");
  assert.equal(f.ambra, true, "una lista bloccata si deve vedere a colpo d'occhio");
  assert.equal(f.prefisso, "dati del", "la targhetta parla del DATO, non dell'ora in cui ho chiesto");
  assert.ok(f.oreFa > 70 && f.oreFa < 80, `tre giorni sono ~74 ore, non ${f.oreFa}`);
});

prova("l'ora del browser non entra: a parità di lettura, il verdetto cambia solo col DATO", () => {
  const vecchio = M.freschezza({ dataDato: "2026-07-26 09:40", adesso: ORA });
  const fresco = M.freschezza({ dataDato: "2026-07-29 09:40", adesso: ORA });
  assert.equal(fresco.ambra, false);
  assert.equal(vecchio.ambra, true);
  assert.notEqual(fresco.stato, vecchio.stato, "due dati di età diversa devono dare due targhette diverse");
});

prova("fonte senza data → «non so di quando», MAI «adesso»", () => {
  for (const nulla of [null, undefined, "", "boh", {}]) {
    const f = M.freschezza({ dataDato: nulla, adesso: ORA });
    assert.equal(f.stato, "ignota");
    assert.match(f.prefisso, /non so di quando/);
    assert.doesNotMatch(f.prefisso, /aggiornato/);
    assert.equal(f.mostra, true, "il silenzio è il difetto: la targhetta deve comparire e dirlo");
    assert.equal(f.ambra, true, "«non lo so» non è una buona notizia");
  }
});

prova("il confine delle 24 ore è un confine, non un'opinione", () => {
  assert.equal(M.freschezza({ dataDato: ore(23), adesso: ORA }).ambra, false);
  assert.equal(M.freschezza({ dataDato: ore(25), adesso: ORA }).ambra, true);
  assert.equal(M.freschezza({ dataDato: ore(25), adesso: ORA, tettoOre: 48 }).ambra, false, "il tetto si può allargare dove ha senso");
});

prova("il formato del vault («AAAA-MM-GG HH:MM», fuso di Piacenza) è letto come tale", () => {
  const t = M.quandoMs("2026-07-29 09:40");
  assert.equal(t, Date.parse("2026-07-29T09:40:00+02:00"));
  assert.equal(M.quandoMs("2026-07-29"), Date.parse("2026-07-29T12:00:00+02:00"), "data secca: mezzogiorno, non mezzanotte UTC");
  assert.equal(M.quandoMs("2026-07-29T07:40:00.000Z"), Date.parse("2026-07-29T07:40:00Z"));
  assert.equal(M.quandoMs("niente"), null);
  assert.equal(M.quandoMs(0), null, "l'epoch 1970 non è una data: è un buco");
});

prova("`piuRecente` sceglie la fonte più fresca e ignora i buchi", () => {
  assert.equal(M.piuRecente(["2026-07-20", null, "2026-07-28 18:00", "boh"]), "2026-07-28 18:00");
  assert.equal(M.piuRecente([null, undefined]), null, "nessuna data leggibile → non si inventa niente");
  assert.equal(M.piuRecente([]), null);
});

// ── sul dato VERO del vault, non su un finto ────────────────────────────────
prova("sul file vero: l'età della Bacheca è quella del suo avviso più recente", () => {
  const md = leggi("MyCity-Vault/90-Memoria-AI/BACHECA.md");
  // Stessa forma che parsifica la route: `## <titolo> · AAAA-MM-GG[ HH:MM]`.
  const date = [...md.matchAll(/^##\s+.+?\s+·\s+(\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2})?)\s*$/gm)].map((m) => m[1]);
  assert.ok(date.length > 0, "la Bacheca vera deve avere almeno un avviso datato, altrimenti non provo niente");
  const piu = M.piuRecente(date);
  assert.ok(piu, "dalle date vere si deve poter ricavare l'età della fonte");
  // La prova che conta: fra un anno quella stessa bacheca DEVE risultare vecchia, non «adesso».
  const fraUnAnno = M.quandoMs(piu) + 365 * 24 * 3_600_000;
  assert.equal(M.freschezza({ dataDato: piu, adesso: fraUnAnno }).ambra, true);
  assert.equal(M.freschezza({ dataDato: piu, adesso: M.quandoMs(piu) + 3_600_000 }).ambra, false);
});

// ── il cablaggio: le route dichiarano l'età, la chip la mostra ───────────────
prova("le route servono `dato_al`: l'età viaggia col dato, non si deduce dall'ora della lettura", () => {
  const attese = {
    "pannello/src/app/api/azioni-pronte/route.ts": /dato_al: codaLeggibile \? piuRecente/,
    "pannello/src/app/api/bacheca/route.ts": /dato_al: avvisi\[0\]\?\.data \|\| null/,
    "pannello/src/app/api/consegne/route.ts": /dato_al: recenti\[0\]\?\.data \|\| null/,
    "pannello/src/app/api/memoria/todo/route.ts": /dato_al: null/,
  };
  for (const [f, re] of Object.entries(attese)) assert.match(leggi(f), re, `${f} non dichiara l'età del dato`);
});

prova("la chip non stampa più l'ora del browser come se fosse l'età del dato", () => {
  const chip = leggi("pannello/src/components/Aggiornato.tsx");
  assert.match(chip, /freschezza\(/, "la decisione dev'essere quella provata qui sopra");
  assert.match(chip, /dataDato !== undefined/, "«non so di quando» è un caso da mostrare, non da nascondere");

  const plancia = leggi("pannello/src/components/aree/Plancia.tsx");
  assert.doesNotMatch(plancia, /setAggAt\(Date\.now\(\)\)/, "era l'orologio del browser spacciato per freschezza");
  assert.match(plancia, /<Aggiornato dataDato=\{datoAl\}/);

  const page = leggi("pannello/src/app/page.tsx");
  assert.doesNotMatch(page, /<Aggiornato at=\{datiAggiornatiAt\} prefisso="dati"/, "la targhetta in testa mostrava l'ora della fetch");
  assert.match(page, /<Aggiornato dataDato=\{datiAl\}/);
  assert.match(page, /if \(!r\.verdetto\.misurato\) return;/, "e non si timbra un aggiornamento su una lettura fallita");
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
