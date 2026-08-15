#!/usr/bin/env node
// LOTTO 43, CORSIA D — AR-674: L'ULTIMO TIMBRO CHE FONDEVA TUTTO A OCCHI CHIUSI.
//
// IL DIFETTO. Nel gestore centrale del gesto «indietro» restava un merge cieco:
// `replaceState({ ...(window.history.state || {}), vista })`. Era l'ultimo punto del Pannello fuori
// da `voceDiNavigazione`, cioè l'ultimo che poteva copiare in una voce NUOVA il marcatore di un
// pannello ormai chiuso. E `history.state` sopravvive al ricaricamento della pagina: il fantasma
// tornava anche dopo un F5, e da lì l'indietro andava dove non doveva.
//
// PERCHÉ NON ERA STATO TOLTO PRIMA. Toglierlo e basta romperebbe il contratto opposto (AR-218): se
// il Worker è aperto DAVVERO, la sua voce deve continuare a dire «qui sopra c'è il Worker», o il
// gesto indietro lo lascia piantato sopra la pagina. Le due esigenze sembravano in conflitto — per
// questo il punto era stato registrato e lasciato lì.
//
// LA REGOLA CHE LE TIENE INSIEME. Non «spoglia» e non «eredita»: **la voce dice quello che è aperto
// adesso**. Si toglie tutto, e si rimette solo ciò che è vivo nell'istante in cui si timbra — che è
// l'unica cosa che chi arriva dopo può verificare.
//
// Si lancia con: node cervello/test/c4-voce-senza-vista.test.mjs

import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { register } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

register("./risolvi-ts.mjs", import.meta.url);

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const S = await import(join(REPO, "pannello/src/lib/strati.ts"));
const E = await import(join(REPO, "pannello/src/lib/effetti-in-updater.ts"));
const O = await import(join(REPO, "pannello/src/lib/overlay-chiusura.ts"));

function tuttiIFile(dir) {
  const out = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out.push(...tuttiIFile(p));
    else if (/\.tsx?$/.test(n)) out.push(p);
  }
  return out;
}

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n").slice(0, 6).join("\n      ") });
  }
};

// Com'è fatto davvero `history.state` in questo Pannello: gli internals di Next stanno lì dentro, e
// cancellarli fa ricaricare la pagina al primo indietro. Non sono un dettaglio del finto.
const NEXT = { __NA: 1, __PRIVATE_NEXTJS_INTERNALS_TREE: ["x"] };

prova("AR-674: il marcatore di un pannello GIÀ CHIUSO non entra nella voce nuova", () => {
  // È il difetto: la voce di prima diceva «qui sopra c'è il Worker», il Worker adesso non c'è più,
  // e il merge cieco se lo portava dietro.
  const voce = S.voceSenzaVista({ ...NEXT, overlay: "worker", strato: "menu", vista: "azioni" }, "azioni", {});
  assert.equal(voce.overlay, undefined, "niente Worker aperto: la voce non lo deve dire");
  assert.equal(voce.strato, undefined, "e nemmeno il menù");
  assert.equal(voce.vista, "azioni");
});

prova("AR-674: gli internals di Next restano — cancellarli farebbe ricaricare la pagina", () => {
  const voce = S.voceSenzaVista({ ...NEXT, overlay: "worker" }, "plancia", {});
  assert.equal(voce.__NA, 1);
  assert.deepEqual(voce.__PRIVATE_NEXTJS_INTERNALS_TREE, ["x"]);
});

prova("AR-674: se il Worker è aperto DAVVERO il suo marcatore resta — AR-218 non si rompe", () => {
  const voce = S.voceSenzaVista({ ...NEXT }, "assistente", { overlay: "worker" });
  assert.equal(voce.overlay, "worker");
  assert.equal(
    O.deveChiudereOverlay(voce),
    false,
    "tornando qui l'indietro non deve chiudere un Worker che è aperto",
  );
});

prova("AR-674: e su una voce SENZA il marcatore il gesto indietro chiude, come prima", () => {
  const voce = S.voceSenzaVista({ ...NEXT, overlay: "worker" }, "azioni", {});
  assert.equal(O.deveChiudereOverlay(voce), true, "il Worker non c'è più: tornando qui si chiude");
});

prova("AR-674: lo strato in cima si rimette solo se è in cima ADESSO", () => {
  const conMenu = S.voceSenzaVista({ ...NEXT, strato: "conversazioni" }, "plancia", { strato: "menu" });
  assert.equal(conMenu.strato, "menu", "quello vivo, non quello ereditato");
  assert.equal(S.stratoDaChiudere(conMenu, { nome: "menu", chiudi() {} }), null, "il menù è suo: non si chiude");
  const daChiudere = S.stratoDaChiudere(conMenu, { nome: "conversazioni", chiudi() {} });
  assert.ok(daChiudere, "il cassetto ereditato invece sì: la voce non parla più per lui");
});

prova("AR-674: senza vista si mette almeno «plancia» — il tasto indietro non resta un clic morto", () => {
  assert.equal(S.voceSenzaVista(null, "", {}).vista, "plancia");
  assert.equal(S.voceSenzaVista(undefined, "numeri", {}).vista, "numeri");
});

prova("AR-674: il vecchio merge cieco non esiste più nel gestore dell'indietro", () => {
  // Si guarda il codice senza commenti: qui sopra il difetto è citato per spiegarlo.
  const src = E.senzaCommentiNeStringhe(readFileSync(join(REPO, "pannello/src/app/page.tsx"), "utf8"));
  assert.ok(
    !/replaceState\(\s*\{\s*\.\.\.\(?\s*window\.history\.state/.test(src),
    "è la riga esatta di AR-674: `replaceState({ ...(window.history.state || {}), … })`",
  );
  const quante = src.split(/\bvoceSenzaVista\b/).length - 1;
  assert.ok(quante >= 2, `voceSenzaVista compare ${quante} volte: con una sola c'è l'import e il resto è morto`);
});

prova("AR-674: in TUTTO pannello/src ogni timbro di cronologia passa da una porta dichiarata", () => {
  // La domanda ① del secondo giro: non «il mio punto è a posto» ma «ogni strada passa dal freno».
  // Si cerca l'ATTO — push/replace della cronologia — dovunque sia, e si pretende che l'argomento
  // sia una delle quattro porte, non un oggetto scritto lì per lì. È il freno spostato sul DATO:
  // vale per chi scriverà il quinto timbro, non solo per i quattro che ci sono adesso.
  const PORTE = /^\s*(?:voceDiNavigazione|voceSenzaVista|voceSubDaTimbrare|voceDaTimbrare|voce)\b/;
  const fuori = [];
  let quanti = 0;
  for (const f of tuttiIFile(join(REPO, "pannello/src"))) {
    const src = E.senzaCommentiNeStringhe(readFileSync(f, "utf8"));
    const atto = /window\.history\.(?:push|replace)State\(/g;
    let m;
    while ((m = atto.exec(src))) {
      quanti++;
      const dopo = src.slice(m.index + m[0].length, m.index + m[0].length + 120);
      if (!PORTE.test(dopo)) {
        fuori.push(`${f.replace(REPO + "/", "")}:${src.slice(0, m.index).split("\n").length}`);
      }
    }
  }
  assert.ok(quanti >= 5, `solo ${quanti} timbri trovati: il metro sta guardando troppo poco`);
  assert.deepEqual(fuori, [], "un timbro che non passa da una porta può ereditare un marcatore a occhi chiusi");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
