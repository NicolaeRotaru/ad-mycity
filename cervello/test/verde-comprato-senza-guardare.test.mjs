#!/usr/bin/env node
// AR-681 — la porta dei senior stampava la spunta verde prima di accorgersi di non aver misurato.
//
// LA RADICE. Il guardiano scriveva «✅ porta dei senior: N file-pilota, tutti passano di qui» e SOLO
// DOPO, su una riga sotto, «⚪ la regola sui valori superati NON è stata misurata». Chi legge un log
// si ferma alla spunta. E c'era un secondo buco più grosso, che nessuno aveva visto: `leggiPiloti()`
// torna un elenco vuoto anche quando la cartella dei file-pilota non c'è — zero file guardati
// producevano la stessa spunta verde, con uscita 0. Un guardiano che non ha aperto niente si
// dichiarava pulito. È la stessa forma di AR-395 sullo stage vuoto: *un metro che non ha niente
// sotto non sta dando un verde, sta dicendo che non ha guardato.*
//
// COSA PROVA QUESTO FILE, eseguendo il verdetto invece di cercarne la forma:
//   ① zero file-pilota guardati non è verde: è ⚪, uscita 2;
//   ② un registro dei fatti illeggibile non è verde: una delle quattro regole non si è applicata;
//   ③ un passaggio fuori porta trovato resta rosso — una cosa vista vale più di una non misurata;
//   ④ con tutto misurato e niente da dire, il verde resta verde: la cecità non è la risposta comoda;
//   ⑤ il guardiano vero, lanciato adesso su una cartella senza file-pilota, esce 2 e NON stampa ✅.
//
// NON-VACUITÀ (verificata rompendo il fix apposta): in `cervello/prompt-senior.mjs`, togliendo il
// controllo «zero cose guardate» (`const nienteDaGuardare = ciecoSeNienteMisurato(piloti, …)` →
// `const nienteDaGuardare = null;`), i casi ① e ⑤ diventano ROSSI.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { verdettoPorta } from "../prompt-senior.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

prova("⬇️ zero file-pilota guardati: ⚪, non ✅", () => {
  const v = verdettoPorta({ piloti: 0, violazioni: 0, registroLetto: true });
  assert.equal(v.stato, "cieco", "prima usciva «✅ 0 file-pilota, tutti passano di qui» con uscita 0");
  assert.match(v.motivo, /file-pilota/);
});

prova("⬇️ registro dei fatti illeggibile: ⚪, e dice quale regola non ha applicato", () => {
  const v = verdettoPorta({ piloti: 6, violazioni: 0, registroLetto: false, motivoRegistro: "registro dei fatti illeggibile: Unexpected token" });
  assert.equal(v.stato, "cieco");
  assert.match(v.motivo, /NON è stata misurata/);
});

prova("un passaggio fuori porta resta rosso: una cosa vista vale più di una non misurata", () => {
  const v = verdettoPorta({ piloti: 6, violazioni: 2, registroLetto: false });
  assert.equal(v.stato, "rosso");
  assert.match(v.motivo, /2 passaggi fuori porta su 6 file/);
});

prova("con tutto misurato e niente da dire, il verde resta verde", () => {
  const v = verdettoPorta({ piloti: 6, violazioni: 0, registroLetto: true });
  assert.equal(v.stato, "verde", "un guardiano che si dichiara cieco sempre è spento quanto uno che dice sempre ok");
});

prova("⬇️ il guardiano vero, su una casa senza file-pilota, esce 2 e non stampa la spunta", () => {
  const finto = mkdtempSync(join(tmpdir(), "porta-senza-piloti-"));
  mkdirSync(join(finto, ".claude/agents"), { recursive: true });
  mkdirSync(join(finto, "MyCity-Vault/90-Memoria-AI"), { recursive: true });
  writeFileSync(join(finto, "CLAUDE.md"), "# finto");
  writeFileSync(join(finto, ".claude/agents/x.md"), "---\nname: x\n---\nIo.");
  writeFileSync(join(finto, "MyCity-Vault/90-Memoria-AI/registro-fatti.json"), JSON.stringify({ fatti: [] }));
  // Nessuna cartella .claude/workflows: il guardiano non ha niente da aprire.
  const r = spawnSync(process.execPath, [join(REPO, "cervello/prompt-senior.mjs"), "--guardiano"], {
    env: { ...process.env, AD_ROOT: finto },
    encoding: "utf8",
  });
  assert.equal(r.status, 2, `atteso ⚪ cieco (2), ottenuto ${r.status}: zero file guardati non è zero problemi`);
  assert.doesNotMatch(r.stdout, /✅/, "la spunta verde su un controllo che non ha aperto niente è la bugia che questo difetto è");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
