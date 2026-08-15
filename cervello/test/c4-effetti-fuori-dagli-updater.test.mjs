#!/usr/bin/env node
// LOTTO 43, CORSIA D — AR-605: GLI ATTI NON PARTONO DA DENTRO UN AGGIORNAMENTO DI STATO.
//
// IL DIFETTO. Salvataggi su Supabase, scritture nella memoria del browser, letture di dettagli e
// annunci agli altri riquadri partivano da DENTRO la funzione di aggiornamento di un `setState`.
// React può richiamare quella funzione più di una volta (StrictMode in sviluppo, disegno
// concorrente): la stessa scrittura parte doppia.
//
// LA RADICE. La regola in casa c'era già — scritta nel commento della cura AR-268 in ParlaCasella,
// «un updater può essere richiamato più volte da React» — ma era un CARTELLO, non un freno. Un
// cartello vale finché qualcuno lo legge; e infatti la scheda del difetto ne nominava cinque punti,
// mentre nel Pannello ce n'erano tredici.
//
// LA CURA DI SISTEMA. Non i tredici punti: il guardiano che li conta. Il lettore sta in
// `pannello/src/lib/effetti-in-updater.ts`, gira su tutta la cartella `pannello/src`, e il tetto è
// ZERO — così chi scriverà il prossimo componente non deve essersi letto un commento del 2026.
//
// Si lancia con: node cervello/test/c4-effetti-fuori-dagli-updater.test.mjs

import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { register } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

register("./risolvi-ts.mjs", import.meta.url);

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SRC = join(REPO, "pannello/src");
const E = await import(join(SRC, "lib/effetti-in-updater.ts"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n").slice(0, 8).join("\n      ") });
  }
};

function tuttiIFile(dir) {
  const out = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out.push(...tuttiIFile(p));
    else if (/\.tsx?$/.test(n)) out.push(p);
  }
  return out;
}

// ── ① IL METRO SA DIRE ROSSO — misurato su sorgenti finte ───────────────────
// Un guardiano che non è mai stato visto bocciare è indistinguibile da un guardiano scollegato.

prova("AR-605: un salvataggio dentro l'updater viene VISTO", () => {
  const malato = `
    function instrada(id, testo) {
      setMessages((m) => {
        const nuovi = rispondi(m, testo);
        void persistConversazione(id, nuovi);
        return nuovi;
      });
    }`;
  const t = E.attiDentroGliUpdater("finto.tsx", malato);
  assert.equal(t.length, 1, "questo è esattamente il punto che il difetto descrive");
  assert.equal(t[0].setter, "setMessages");
});

prova("AR-605: la CURA — stesso lavoro, atto fuori — NON viene segnalata", () => {
  const sano = `
    function instrada(id, testo) {
      const nuovi = rispondi(messagesRef.current, testo);
      setMessages(nuovi);
      void persistConversazione(id, nuovi);
    }`;
  assert.deepEqual(E.attiDentroGliUpdater("finto.tsx", sano), []);
});

prova("AR-605: un updater che si limita a CALCOLARE resta lecito", () => {
  // Non si vieta l'updater: si vieta l'atto dentro. Confonderli farebbe riscrivere mezzo Pannello.
  const sano = `setAperti((s) => ({ ...s, [id]: !s[id] }));`;
  assert.deepEqual(E.attiDentroGliUpdater("finto.tsx", sano), []);
});

prova("AR-605: le quattro forme d'atto sono tutte riconosciute", () => {
  const forme = [
    `setX((p) => { fetch("/api/x"); return p; });`,
    `setX((p) => { localStorage.setItem("k", "v"); return p; });`,
    `setX((p) => { emitSync("lavori"); return p; });`,
    `setX(async (p) => { await salvaTutto(); return p; });`,
  ];
  for (const f of forme) {
    assert.equal(E.attiDentroGliUpdater("finto.tsx", f).length, 1, `non visto: ${f}`);
  }
});

prova("AR-605: `setTimeout` e `setInterval` non sono stati — non si contano", () => {
  const sano = `setTimeout(() => { fetch("/api/x"); }, 100); setInterval(() => { void carica(); }, 500);`;
  assert.deepEqual(E.attiDentroGliUpdater("finto.tsx", sano), []);
});

prova("AR-605: un atto NOMINATO in un commento non è un atto", () => {
  // È il difetto che aveva la prima versione di questo lettore: bocciava un punto sano perché nel
  // commento sopra c'era scritto «dopo l'`await fetch`». Un rosso inventato si impara a saltare.
  const sano = `
    setConversazioni((list) => {
      // ANTI-RACE: dopo l'await fetch, list è lo stato più fresco. Niente localStorage.setItem qui.
      return list.map(f);
    });`;
  assert.deepEqual(E.attiDentroGliUpdater("finto.tsx", sano), []);
  // …e nemmeno dentro una stringa: il testo di un messaggio non è un'esecuzione.
  assert.deepEqual(E.attiDentroGliUpdater("finto.tsx", `setX((p) => ({ ...p, msg: "ora faccio fetch(" }));`), []);
});

prova("AR-605: togliere commenti e stringhe non sposta i numeri di riga", () => {
  const src = "riga1\n// commento\nriga3\n";
  assert.equal(E.senzaCommentiNeStringhe(src).split("\n").length, src.split("\n").length);
});

// ── ② IL PANNELLO DI ADESSO: il tetto è ZERO ────────────────────────────────

prova("AR-605: in tutto pannello/src nessun atto parte da dentro un aggiornamento di stato", () => {
  const trovati = [];
  for (const f of tuttiIFile(SRC)) {
    trovati.push(...E.attiDentroGliUpdater(f.replace(SRC, "pannello/src"), readFileSync(f, "utf8")));
  }
  assert.deepEqual(
    trovati.map((t) => `${t.file}:${t.riga} ${t.setter} → ${t.atto}`),
    [],
    "il tetto è zero: chi ne aggiunge uno lo vede subito",
  );
});

prova("AR-605: il guardiano guarda davvero tutto — non una cartella sola", () => {
  const quanti = tuttiIFile(SRC).length;
  assert.ok(quanti > 100, `solo ${quanti} file letti: un metro che guarda poco dice verde per finta`);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
