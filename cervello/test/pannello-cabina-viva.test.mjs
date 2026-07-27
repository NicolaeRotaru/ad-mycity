// Lotto A — il CABLAGGIO delle riparazioni allo schermo bianco e alle vie d'uscita (node --test).
//
// ⚠️ Cos'è e cosa NON è. Le REGOLE di questi fix sono provate davvero, eseguendole, negli altri file:
// memoria-json.test.mjs, coda-azioni.test.mjs, overlay-chiusura.test.mjs. Quello che resta fuori è il
// cablaggio dentro i componenti React — `page.tsx` (3.500 righe) e `Azioni.tsx` non sono importabili
// fuori da Next, quindi qui si controlla che il collegamento CI SIA, non che si comporti bene. È una
// prova più debole delle altre, e va chiamata col suo nome: è la rete che impedisce a un fix di
// sparire in un refactoring, non la dimostrazione che funziona.
//
// La differenza conta: il 27/7 novantuno difetti si sono chiusi da soli perché una prova di presenza
// era stata scambiata per una prova di funzionamento.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const leggi = (rel) => readFileSync(join(REPO, rel), "utf8");

// ── AR-251: la rete sotto la Cabina ──────────────────────────────────────────
test("AR-251 · esiste la rete d'errore che Next cerca da sola", () => {
  const rel = "pannello/src/app/error.tsx";
  assert.ok(existsSync(join(REPO, rel)), `${rel} non c'è: un errore in una scheda porta via tutta la Cabina`);
  const src = leggi(rel);
  assert.match(src, /^"use client"/m, "l'error boundary di Next DEVE essere un componente client");
  assert.match(src, /reset/, "senza reset() non c'è il bottone «Riprova»: si resta bloccati");
  assert.match(src, /export default function/, "Next carica il default export di questo file");
});

// ── AR-252 / AR-253: la difesa alla fonte, agganciata ────────────────────────
test("AR-252 · l'asserzione pericolosa non è più nel componente", () => {
  const src = leggi("pannello/src/components/AutoCoscienza.tsx");
  assert.doesNotMatch(src, /a!\.domande_per_nicola!\.map/, "il `.map` su un campo che può essere una stringa");
  assert.match(src, /listaSicura/, "deve passare dal lettore unico");
});

test("AR-252 · la sanificazione è agganciata a ENTRAMBE le route, non a una sola", () => {
  // È il cuore del difetto: la difesa era stata messa su un campo solo, in un posto solo.
  for (const rel of [
    "pannello/src/app/api/memoria/auto-coscienza/route.ts",
    "pannello/src/app/api/memoria/auto-radiografia/route.ts",
  ]) {
    const src = leggi(rel);
    assert.match(src, /sanificaListe/, `${rel} non normalizza le liste alla fonte`);
    assert.match(src, /domande_per_nicola/, `${rel} non copre il campo che ha rotto`);
  }
});

test("AR-253 · TUTTE E QUATTRO le letture del cantiere passano dalla difesa", () => {
  // Il difetto era «quattro implementazioni scritte a mano, due indurite e due nude». Se una sola
  // resta fuori, il bug torna dalla schermata che nessuno ha guardato.
  const nude = [];
  for (const rel of [
    "pannello/src/components/cervello/RadiografiaDiSe.tsx",
    "pannello/src/components/MacchinaHomeCard.tsx",
    "pannello/src/app/api/memoria/auto-radiografia/route.ts",
    "pannello/src/app/api/memoria/salute-onesta/route.ts",
  ]) {
    const src = leggi(rel);
    if (!/listaSicura|Array\.isArray\(\s*cantiere\?\.difetti\s*\)/.test(src)) nude.push(rel);
    assert.doesNotMatch(src, /\(cantiere\?\.difetti \|\| \[\]\)/, `${rel}: «|| []» non difende dai buchi dentro la lista`);
  }
  assert.deepEqual(nude, [], "queste letture del cantiere sono rimaste nude");
});

// ── AR-219: la coda non si apre più tutta ────────────────────────────────────
test("AR-219 · la coda da firmare non stampa più tutte le schede spalancate", () => {
  const src = leggi("pannello/src/components/aree/Azioni.tsx");
  assert.doesNotMatch(src, /\{daFirmare\.map\(\(a\) => cardAzione\(a\)\)\}/, "51 schede montate ed espanse insieme");
  assert.match(src, /azioniVisibili\(daFirmare/, "manca il tetto sulle schede montate");
  assert.match(src, /azioniVisibili\(ferme/, "«In coda» riusa la stessa scheda: va tagliata anche lei");
  assert.match(src, /cardAperta\(/, "manca la regola «aperta solo la prima»");
  assert.match(src, /<summary/, "senza summary non è un accordion");
});

// ── AR-218 / AR-240: le vie d'uscita dal Worker ──────────────────────────────
test("AR-218 · la barra con la X non è più nascosta a schermo intero", () => {
  const src = leggi("pannello/src/app/page.tsx");
  assert.doesNotMatch(
    src,
    /\{!workerFull && \(\s*\n\s*<div\s*\n\s*className="shrink-0 flex items-center justify-end/,
    "la barra con la X era dentro {!workerFull && …}: a schermo intero non veniva renderizzata",
  );
  assert.match(src, /aria-label="Chiudi la chat"/, "il bottone di chiusura deve esistere");
});

test("AR-218 · Esc chiude: il gestore del tasto esiste ed è agganciato alle regole", () => {
  const src = leggi("pannello/src/app/page.tsx");
  assert.match(src, /eTastoChiudi/, "prima in tutto pannello/src non c'era un solo gestore di Escape");
  assert.match(src, /overlayInCima/, "deve chiudere UNA cosa per volta, la più in cima");
  assert.match(src, /addEventListener\("keydown"/, "il gestore va registrato davvero");
});

test("AR-240 · aprire il Worker timbra una voce di cronologia", () => {
  // Senza, per il browser aprire il Worker non è successo niente: il gesto indietro del telefono
  // muoveva l'area sotto e lasciava la chat sopra, oppure buttava fuori dal Pannello.
  const src = leggi("pannello/src/app/page.tsx");
  assert.match(src, /overlay: "worker"/, "manca il marcatore nella voce di cronologia");
  assert.match(src, /pushState\(\{ \.\.\.st, overlay: "worker" \}/, "lo state va FUSO: dentro ci sono gli internals di Next");
  assert.match(src, /deveChiudereOverlay\(st\)/, "il gestore dell'indietro non guarda lo strato aperto");
});

test("AR-240 · c'è una sola porta d'uscita, non una copia per ogni bottone", () => {
  // La radice del difetto: quattro vie d'uscita, quattro implementazioni, e bastava che una fosse
  // rotta o assente perché non ci fosse modo di uscire.
  const src = leggi("pannello/src/app/page.tsx");
  assert.match(src, /function chiudiWorker\(\)/, "manca la chiusura condivisa");
  const copie = src.match(/setChatFluttuante\(false\); setWorkerFull\(false\)/g) || [];
  assert.equal(copie.length, 0, `restano ${copie.length} chiusure copiate a mano invece di chiamare chiudiWorker()`);
});
