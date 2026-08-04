#!/usr/bin/env node
// 🧪 AR-523 — LO STRUMENTO CHE ROMPE I FILE VERI DEVE RIMETTERLI A POSTO ANCHE SE LO AMMAZZANO.
//
// Il caso vero, del 4/8: un comando andato in timeout ha ucciso `non-vacuita.mjs` mentre teneva una
// mutazione applicata. Il `finally` che ripristina non gira su un SIGTERM, e `cervello/git-pr.mjs`
// è rimasto su disco col fix di AR-451 disfatto — per git una modifica come un'altra. L'ha trovato
// il sorvegliante al primo Edit successivo; senza di lui finiva in un commit.
//
// Qui si prova il pezzo che decide, con lo scrittore INIETTATO. Senza iniezione l'unico modo di
// provarlo sarebbe ammazzare un processo vero, cioè non provarlo — ed è così che il difetto è nato.

import { test } from "node:test";
import assert from "node:assert/strict";
import { ripristina, IN_CORSO } from "../non-vacuita.mjs";

test("LA REGOLA CHE CONTA: il file rotto torna com'era, col suo contenuto originale", () => {
  const scritti = [];
  const fatto = ripristina({ file: "cervello/git-pr.mjs", originale: "const preRebaseSha = gitOrNull(...)" }, (f, t) => scritti.push([f, t]));
  assert.equal(fatto, "cervello/git-pr.mjs");
  assert.deepEqual(scritti, [["cervello/git-pr.mjs", "const preRebaseSha = gitOrNull(...)"]], "deve riscrivere l'ORIGINALE, non svuotare il file");
});

test("niente in corso, niente da rimettere: non si inventa una scrittura", () => {
  const scritti = [];
  assert.equal(ripristina(null, (f, t) => scritti.push([f, t])), null);
  assert.equal(ripristina({}, (f, t) => scritti.push([f, t])), null);
  assert.equal(scritti.length, 0);
});

test("se nemmeno il ripristino riesce, lo dice invece di far finta: torna null", () => {
  const esito = ripristina({ file: "x.mjs", originale: "a" }, () => {
    throw new Error("EACCES");
  });
  assert.equal(esito, null, "un ripristino fallito non deve sembrare riuscito: il chiamante deve poterlo dire");
});

test("lo stato in corso è un oggetto condiviso: il gestore del segnale legge sempre l'ultimo valore", () => {
  // Se fosse una variabile catturata per copia, il gestore rimetterebbe a posto il file di due
  // mutazioni fa — cioè romperebbe un file diverso da quello che stava rompendo.
  assert.equal(typeof IN_CORSO, "object");
  assert.ok("stato" in IN_CORSO);
});
