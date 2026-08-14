#!/usr/bin/env node
// 🪟 AR-402 — «chiuso» non può voler dire «scritto».
//
// AR-243 risultava CHIUSO con `strati.test.mjs` verde. Il suo fix nominava cinque strati da
// convertire; ne erano stati convertiti tre in page.tsx e due nell'Archivio, e i due nominati per
// nome — la fotocamera dentro la chat e la lettera dell'AD — no. Col dito indietro quei due riquadri
// non si chiudevano: il gestore centrale cambiava l'AREA sotto e il riquadro restava sopra (la
// fotocamera con lo stream ancora acceso).
//
// La prova vecchia cercava l'ESISTENZA della libreria; questa cerca l'INSTALLAZIONE del
// comportamento, con un censimento che fallisce ELENCANDO i riquadri fuori contratto. È la regola
// generale che ne esce: quando un difetto nomina N punti da convertire, la prova deve contare N.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, readdirSync, statSync } from "node:fs";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SRC = join(REPO, "pannello/src");
const { stratiFuoriContratto, Z_DI_STRATO } = await import(join(SRC, "lib/strati.ts"));

function tuttiIFile(dir) {
  const fuori = [];
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) fuori.push(...tuttiIFile(p));
    else if (/\.tsx$/.test(nome)) fuori.push(p);
  }
  return fuori;
}

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

prova("AR-402: nessun riquadro a schermo intero resta fuori dalla pila degli strati", () => {
  const files = tuttiIFile(SRC).map((p) => ({
    percorso: p.slice(SRC.length + 1),
    sorgente: readFileSync(p, "utf8"),
  }));
  const fuori = stratiFuoriContratto(files);
  assert.deepEqual(
    fuori,
    [],
    `riquadri a schermo intero che il gesto indietro non chiude: ${fuori.join(" · ")}`,
  );
});

prova("AR-402: i due punti nominati dal difetto sono registrati per nome", () => {
  const foto = readFileSync(join(SRC, "components/BottoneFotoChat.tsx"), "utf8");
  const lettera = readFileSync(join(SRC, "components/LetteraAdCard.tsx"), "utf8");
  assert.ok(/useStrato\("foto-visore"/.test(foto), "la fotocamera si chiude col dito indietro");
  assert.ok(/useStrato\("lettera-ad"/.test(lettera), "e la lettera dell'AD anche");
});

prova("AR-402: il censimento sa dire di no (un riquadro scoperto viene trovato)", () => {
  const finto = [
    { percorso: "finto.tsx", sorgente: `<div className="fixed inset-0 z-[100] bg-black/85">` },
    { percorso: "sano.tsx", sorgente: `useStrato("x", aperto, chiudi);\n<div className="fixed inset-0 z-50">` },
    { percorso: "velo.tsx", sorgente: `<div className="fixed inset-0 z-20 bg-black/25">` },
  ];
  assert.deepEqual(
    stratiFuoriContratto(finto),
    ["finto.tsx"],
    "altrimenti il censimento sarebbe verde per costruzione — l'errore che ha tenuto vivo AR-243",
  );
  assert.equal(Z_DI_STRATO, 40, "la soglia è dichiarata, non nascosta in un'espressione");
});

const rossi = casi.filter((c) => !c.ok);
console.log(`TAP version 13\n1..${casi.length}`);
casi.forEach((c, i) => console.log(`${c.ok ? "ok" : "not ok"} ${i + 1} - ${c.nome}${c.ok ? "" : `\n  # ${c.err}`}`));
console.log(`# pass ${casi.length - rossi.length}`);
console.log(`# fail ${rossi.length}`);
process.exit(rossi.length ? 1 : 0);
