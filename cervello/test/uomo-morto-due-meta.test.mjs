#!/usr/bin/env node
// AR-430 — l'uomo-morto ha DUE metà, e si chiude solo con tutt'e due.
//
// PERCHÉ ESISTE QUESTO TEST E NON BASTAVA QUELLO DI AR-371. Consegnando il lotto 32 avevo dato ad
// AR-371 e ad AR-430 lo stesso identico comando di verifica. Ma AR-371 è la metà ESTERNA (un
// guardiano che vive fuori dal VPS) e AR-430 è il difetto intero: la sua scheda dice, testualmente,
// che la metà interna «resta di AR-164: le due vanno chiuse insieme, non una al posto dell'altra».
// Con la prova condivisa, il guardiano avrebbe chiuso AR-430 sulla forza di un test che della metà
// interna non guarda niente — è la malattia `prova-condivisa-cieca` già pagata con AR-254.
//
// Quindi qui si guardano ENTRAMBE le metà:
//   · esterna → un guardiano schedulato che non gira sul VPS (AR-371)
//   · interna → i timer delle cadenze fra i critici, e il controllo del PRODOTTO della cadenza,
//               non solo della sveglia (AR-164, riparato dal lotto 31)
// Se una delle due sparisce, AR-430 deve tornare rosso: metà uomo-morto non è un uomo-morto.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

prova("metà ESTERNA: un guardiano schedulato che non gira sul VPS", () => {
  const yml = readFileSync(join(REPO, ".github/workflows/battito-esterno.yml"), "utf8");
  assert.match(yml, /^\s*schedule:/m, "il guardiano esterno non parte da solo");
  assert.match(yml, /node cervello\/battito-esterno\.mjs/, "il workflow non chiama il controllo");
});

prova("metà INTERNA: i timer delle cadenze sono fra i critici, non semplici avvisi", () => {
  // AR-164 (a): un timer del Piano del mattino spento risultava un «warn», cioè niente.
  const va = readFileSync(join(REPO, "cervello/verifica-automazione.mjs"), "utf8");
  const critici = va.slice(va.indexOf("TIMER_CRITICI"), va.indexOf("]", va.indexOf("TIMER_CRITICI")));
  for (const t of ["mattino", "mezzogiorno", "sera", "settimana"]) {
    assert.match(critici, new RegExp(`mycity-ritmo-${t}\\.timer`), `il timer del ritmo «${t}» non è fra i critici`);
  }
});

prova("metà INTERNA: si guarda il PRODOTTO della cadenza, non solo che la sveglia suoni", () => {
  // AR-164 (b): un timer che scatta non dimostra che qualcuno si sia alzato — è la stessa lezione
  // che ha reso invisibile il blackout di quaranta ore.
  assert.ok(
    existsSync(join(REPO, "cervello/freschezza-cadenze.mjs")),
    "manca il controllo sulla freschezza delle cadenze: resta solo la sveglia"
  );
});

prova("le due metà sono davvero indipendenti: nessuna copre l'altra", () => {
  // Se un giorno il guardiano esterno finisse per girare sul VPS, l'uomo-morto tornerebbe a morire
  // insieme alla macchina — e nessuno se ne accorgerebbe, perché il file esisterebbe ancora.
  const yml = readFileSync(join(REPO, ".github/workflows/battito-esterno.yml"), "utf8");
  assert.match(yml, /runs-on:\s*ubuntu-latest/, "il guardiano esterno deve girare su un runner di GitHub");
  assert.doesNotMatch(yml, /self-hosted/, "un runner self-hosted sarebbe di nuovo dentro la macchina");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
