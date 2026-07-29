#!/usr/bin/env node
// AR-173 — una previsione scaduta diventa azzeccata misurandola nove giorni dopo.
//
// Misurato il 28/7 sul registro vero: le CINQUE voci che facevano punteggio erano state chiuse tutte
// il 26/7, in una sola passata di recupero, oltre la loro scadenza. Fra queste l'unico centro
// dell'AD — quello che nel Pannello si legge come 100% — con `entro: 2026-07-17` e
// `chiuso_il: 2026-07-26`. Nove giorni.
//
// Una previsione misurata quando fa comodo non è una previsione: è una cosa che si continua a
// guardare finché non torna.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { ESCLUSA, contaNelPunteggio, fineFinestra, fuoriFinestra, punteggioOnesto } from "../previsione-verificabile.mjs";
import { nonEUnaPrevisione } from "../volano-regole.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

prova("il caso che ha rotto: entro 17/7, chiusa il 26/7 → non conta", () => {
  const voce = { stato: "azzeccata", sensore_stato: "n/d", entro: "2026-07-17", creato: "2026-07-10 04:20", chiuso_il: "2026-07-26 12:00" };
  assert.equal(fuoriFinestra(voce), true);
  assert.ok(contaNelPunteggio(voce).motivi.includes(ESCLUSA.FUORI_FINESTRA));
  assert.equal(contaNelPunteggio(voce).conta, false);
});

prova("la finestra finisce a fine giornata, non a mezzanotte", () => {
  // Il metro sbagliato è un difetto in più, non uno in meno: la prima misura di questo lotto contava
  // 7 voci fuori finestra perché confrontava con le 00:00, e una chiusa alle 10:05 del giorno di
  // scadenza risultava in ritardo. Le vere sono 5.
  const entro = "2026-07-16";
  assert.equal(fuoriFinestra({ entro, chiuso_il: "2026-07-16 10:05" }), false, "lo stesso giorno è DENTRO");
  assert.equal(fuoriFinestra({ entro, chiuso_il: "2026-07-16 23:58" }), false);
  assert.equal(fuoriFinestra({ entro, chiuso_il: "2026-07-17 00:30" }), true);
  assert.equal(fineFinestra("non-una-data"), null, "senza finestra non si inventa un limite");
  assert.equal(fuoriFinestra({ chiuso_il: "2026-07-17" }), false, "senza `entro` non si è in ritardo per definizione");
});

prova("il comando VERO rifiuta di chiudere una previsione scaduta", () => {
  // Eseguito, non ispezionato: si prende una voce vera già scaduta e si prova a darle un esito.
  const j = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json"), "utf8"));
  const scaduta = j.registro.find((e) => fineFinestra(e.entro) && fineFinestra(e.entro) < Date.now());
  assert.ok(scaduta, "serve almeno una voce con finestra passata per provare il rifiuto");
  let rc = 0, out = "";
  try {
    out = execFileSync("node", [join(REPO, "cervello/calibrazione.mjs"), "esito", `--id=${scaduta.id}`, "--reale=1", "--fonte=Supabase MCP"], { cwd: REPO, encoding: "utf8" });
  } catch (e) { rc = e.status ?? 1; out = `${e.stdout || ""}${e.stderr || ""}`; }
  assert.notEqual(rc, 0, "una finestra scaduta non si chiude come se niente fosse");
  assert.match(out, /AR-173|troppo tardi/);
  assert.match(out, /--fuori-finestra/, "deve indicare la via onesta, non solo dire di no");
});

prova("sul registro vero il punteggio smette di poggiare sulle misure tardive", () => {
  const j = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json"), "utf8"));
  const p = punteggioOnesto(j.registro, { nonPrevisione: nonEUnaPrevisione });
  assert.ok((p.escluse[ESCLUSA.FUORI_FINESTRA] || 0) >= 5, `attese ≥5 escluse per finestra, trovate ${p.escluse[ESCLUSA.FUORI_FINESTRA] || 0}`);
  // E il denominatore si vede: «0 su 42, 5 escluse per ritardo» è un'informazione, «0» da solo no.
  assert.equal(p.campione, j.registro.length);
  assert.ok(Object.keys(p.escluse).length > 0, "i motivi dell'esclusione devono essere un dato, non un silenzio");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
