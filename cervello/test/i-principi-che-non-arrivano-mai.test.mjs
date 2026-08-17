#!/usr/bin/env node
// AR-765 — ottantotto regole promosse, otto consegnate, scelte per posizione nel file.
//
// LA RADICE. Un principio è una lezione promossa: il grado più alto che questa casa dà a una regola,
// e l'unica cosa che dovrebbe valere SEMPRE e non solo se il sorteggio della scheda la pesca. Il
// blocco però faceva `slice(0, 8)` sull'elenco così com'è scritto sul disco. Non per importanza, non
// per data, non per forza: per **posizione**. Misurato il 17/8 sull'archivio vero: 88 principi
// cristallizzati, 8 consegnati, e gli 8 erano tutti del 24-26 luglio — quelli promossi dopo non li
// vedeva nessuno, per quanto fossero validi.
//
// IL NUMERO ONESTO, perché la prima misura era sbagliata e va detto: dei quattro principi che
// portano un freno, col vecchio ordinamento ne arrivavano **due**, non zero. (La misura a zero era
// stata fatta sull'altra delle due liste dell'archivio, quella senza testo.) Il difetto resta:
// ottanta regole promosse non arrivavano mai, e le quattro più forti arrivavano a metà, per caso.
//
// COSA PROVA QUESTO FILE:
//   ① chi porta un FRENO entra sempre, anche se sta in fondo al file — è la parte che cambia il
//      comportamento invece di suggerirlo, e sono pochissimi;
//   ② a pari forza vince chi parla del lavoro di ADESSO, non chi è stato scritto prima;
//   ③ a pari tutto vince il più recente: una regola promossa ieri descrive la macchina di oggi;
//   ④ il taglio non è silenzioso: l'intestazione dice quanti ne mostra su quanti ce ne sono. Un
//      taglio muto si legge come «ci sono tutti», ed è la bugia più comoda di un blocco di contesto;
//   ⑤ i principi in tema arrivano anche nella scheda della singola richiesta, e PRIMA delle lezioni:
//      un principio è una regola, una lezione è un episodio;
//   ⑥ ma un principio fuori tema NON entra nella scheda solo perché ha un freno — sarebbe rumore;
//   ⑦ sull'archivio VERO tutti e quattro i principi col freno adesso arrivano (erano due).
//
// NON-VACUITÀ (verificata il 17/8 rompendo il fix apposta): rimettendo in `principiOrdinati` la
// scelta per posizione (`.sort(...)` → `.sort(() => 0)`), i casi ① ② ③ ⑦ diventano ROSSI.
//
// ⚠️ Nessun caso scrive: l'archivio vero si legge in sola lettura, il resto sono principi finti.

import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MAX_PRINCIPI,
  frenoDi,
  intestazionePrincipi,
  principiDi,
  principiOrdinati,
  principiSulTema,
  punteggioTema,
  righeDeiPrincipi,
} from "../contesto-lezioni.mjs";

const REPO = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const ARCHIVIO = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");

/** Un principio come lo scrive la cristallizzazione. */
const pr = (id, testo, extra = {}) => ({ id, testo, tag: [], promosso_il: "2026-07-01 10:00", ...extra });

/** Venti principi banali, per spingere in fondo quello che ci interessa. */
const riempimento = (n) => Array.from({ length: n }, (_, i) => pr(`L-RIEMPI-${i}`, `regola di riempimento numero ${i}`));

// ── ① Il freno entra sempre, anche dall'ultimo posto ─────────────────────────────────────────────

test("① un principio col freno arriva anche se è l'ultimo di ottanta", () => {
  const ultimo = pr("L-FRENO", "prima di pubblicare, guarda il ramo", {
    gate: "node cervello/ramo-pulito.mjs",
    promosso_il: "2026-01-01 08:00", // il più VECCHIO: col vecchio ordine sarebbe comunque fuori
  });
  const dati = { principi: [...riempimento(80), ultimo] };

  const righe = righeDeiPrincipi(dati);
  assert.equal(righe.length, MAX_PRINCIPI, "il blocco resta corto");
  assert.ok(
    righe.some((r) => r.includes("node cervello/ramo-pulito.mjs")),
    "col taglio per posizione questo principio non arrivava mai: è l'ottantunesimo",
  );
  assert.match(righe[0], /freno: `node cervello\/ramo-pulito\.mjs`$/, "e ci arriva in cima, non in fondo");
});

// ── ② A pari forza, vince chi parla del lavoro di adesso ─────────────────────────────────────────

test("② fra due principi senza freno, viene prima quello sul tema della richiesta", () => {
  const dati = {
    principi: [
      pr("L-ALTRO", "le locandine si stampano in formato A3", { tag: ["stampa"] }),
      pr("L-TEMA", "il payout dei negozi si verifica prima di dirlo fatto", { tag: ["payout"] }),
    ],
  };
  const ordinati = principiOrdinati(dati, "controlla il payout dei negozi");
  assert.equal(ordinati[0].id, "L-TEMA");

  // e senza richiesta l'ordine non lo decide il tema
  assert.equal(punteggioTema(dati.principi[1], ""), 0, "senza richiesta non c'è tema da misurare");
});

// ── ③ A pari tutto, vince il più recente ─────────────────────────────────────────────────────────

test("③ a pari punti arriva prima la regola promossa più di recente", () => {
  const dati = {
    principi: [
      pr("L-VECCHIO", "una regola qualsiasi", { promosso_il: "2026-01-01 08:00" }),
      pr("L-NUOVO", "una regola qualsiasi", { promosso_il: "2026-08-01 08:00" }),
    ],
  };
  assert.equal(principiOrdinati(dati, "")[0].id, "L-NUOVO");
});

// ── ④ Il taglio si dichiara ──────────────────────────────────────────────────────────────────────

test("④ l'intestazione dice quanti ne mostra su quanti ce ne sono", () => {
  assert.match(intestazionePrincipi(88, 12), /12 dei 88/);
  assert.doesNotMatch(intestazionePrincipi(5, 5), /dei/, "se ci sono tutti non si annuncia nessun taglio");
});

// ── ⑤ ⑥ I principi in tema entrano nella scheda della richiesta, i fuori tema no ─────────────────

test("⑤ un principio sul tema entra nella scheda della richiesta", () => {
  const dati = {
    principi: [pr("L-TEMA", "il payout dei negozi si verifica prima di dirlo fatto", { tag: ["payout"] })],
  };
  const scelti = principiSulTema(dati, "controlla il payout dei negozi");
  assert.equal(scelti.length, 1);
  assert.equal(scelti[0].id, "L-TEMA");
});

test("⑥ un principio fuori tema non entra nella scheda, nemmeno se ha un freno", () => {
  const dati = {
    principi: [pr("L-FUORI", "le locandine si stampano in A3", { tag: ["stampa"], gate: "node x.mjs" })],
  };
  assert.deepEqual(
    principiSulTema(dati, "controlla il payout dei negozi"),
    [],
    "qui il freno non deve comprare l'ingresso: sarebbe rumore a ogni richiesta",
  );
  assert.deepEqual(principiSulTema(dati, ""), [], "senza richiesta non c'è niente da mettere in tema");
});

// ── ⑦ Sull'archivio VERO: tutti i freni arrivano ─────────────────────────────────────────────────

test("⑦ sull'archivio vero arrivano tutti i principi che portano un freno", () => {
  const dati = JSON.parse(readFileSync(ARCHIVIO, "utf8"));
  const tutti = principiDi(dati);
  const conFreno = tutti.filter((p) => frenoDi(p));
  assert.ok(conFreno.length > 0, "prerequisito: l'archivio ha almeno un principio col freno");

  const primi = principiOrdinati(dati, "").slice(0, MAX_PRINCIPI);
  assert.equal(
    primi.filter((p) => frenoDi(p)).length,
    conFreno.length,
    `col taglio per posizione ne arrivavano ${tutti.slice(0, 8).filter((p) => frenoDi(p)).length} su ${conFreno.length}`,
  );
});
