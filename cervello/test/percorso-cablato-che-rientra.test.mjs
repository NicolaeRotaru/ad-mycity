#!/usr/bin/env node
// LA CORREZIONE CHIUSA CON UNA FRASE, E RIENTRATA DALLA FINESTRA.
//
// LA STORIA. 1/7, Nicola: «mycity-live non c'entra niente, toglila ovunque». 4/7, dopo la ricaduta,
// più netto: «togli il cablato su Windows una volta per sempre, IMPEDISCI CHE RIACCADA». Il registro
// delle decisioni di quel giorno dà per fatte due cose: la pulizia di `cervello/marketplace-repo.mjs`
// e un guardiano anti-ricaduta «agganciato a giro.sh».
//
// Misurato il 21/8: la riga `C:\Users\InfinitaPossibilita\mycity-live` era di nuovo dentro
// `marketplace-repo.mjs` — proprio il file ripulito — e il guardiano NON ESISTEVA nel repo, né era
// nominato in `giro.sh`. In mezzo, la verifica dell'automazione ripeteva a ogni corsa «clone
// marketplace assente in C:\Users\…», che manda chi indaga a cercare una cartella invece di un
// difetto di configurazione.
//
// La regola del mansionario che questo file fa rispettare: una correzione di Nicola si chiude con un
// FRENO che può fallire, non con una riga di diario. Questa è la prova che il freno esiste, che
// morde, e che è appeso al giro — le tre cose che l'altra volta erano solo dichiarate.
//
// COSA PROVA, eseguendo:
//   ① oggi il repo è pulito: nessun percorso di una macchina sola nel codice versionato;
//   ② il guardiano MORDE: se il percorso rientra, diventa rosso (è la non-vacuità, in prova);
//   ③ e morde anche sulla home di un Mac, non solo su Windows;
//   ④ ma non urla sui COMMENTI, se no non si potrebbe nemmeno documentare il difetto;
//   ⑤ il guardiano è appeso al giro e il suo esito arriva al motore come vincolo: un guardiano
//      scollegato dal giro non è un cancello, è un file (è com'era finita il 4/7).

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const GUARDIANO = join(REPO, "cervello/no-path-cablati-check.mjs");
const { violazioni } = await import(join(REPO, "cervello/no-path-cablati-check.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// Costruito a runtime: scritto per intero qui dentro, questo file diventerebbe la prossima ricaduta.
const cablatoWindows = () => '"' + "C:" + "\\\\Users\\\\Qualcuno\\\\mycity-live" + '"';
const cablatoMac = () => '"' + "/Users/qualcuno/mycity-live/" + '"';

// ── ① Lo stato di oggi ──────────────────────────────────────────────────────

prova("nel codice versionato non c'è nessun percorso di una macchina sola", () => {
  const r = spawnSync("node", [GUARDIANO, "--json"], { cwd: REPO, encoding: "utf8" });
  const j = JSON.parse(r.stdout);
  assert.deepEqual(j.fuori, [], `percorsi cablati rientrati: ${JSON.stringify(j.fuori, null, 2)}`);
  assert.ok(j.letti > 100, `letti solo ${j.letti} file: il guardiano sta guardando troppo poco`);
  assert.equal(r.status, 0);
});

// ── ② e ③ Il freno morde ────────────────────────────────────────────────────

prova("se il percorso Windows rientra nel codice, il guardiano lo vede", () => {
  const v = violazioni("cervello/finto.mjs", `const CASA = ${cablatoWindows()};`);
  assert.equal(v.length, 1, "la ricaduta è passata: allora il freno non frena");
  assert.equal(v[0].regola, "cartella utente di Windows");
});

prova("e lo vede anche se è la home di un Mac", () => {
  const v = violazioni("cervello/finto.mjs", `const CASA = ${cablatoMac()};`);
  assert.equal(v.length, 1, "un percorso vale su una macchina sola anche quando non è Windows");
});

// ── ④ Ma non è un allarme generico ──────────────────────────────────────────

prova("un commento che PARLA del percorso non fa scattare niente", () => {
  const v = violazioni("cervello/finto.mjs", `// qui una volta c'era ${cablatoWindows()}, ed è stato tolto`);
  assert.deepEqual(v, [], "se documentare il difetto fosse vietato, questo stesso guardiano sarebbe rosso");
});

prova("e il codice che chiede la posizione a chi la sa resta verde", () => {
  const v = violazioni("cervello/finto.mjs", 'const CASA = resolveMarketplaceRepo();');
  assert.deepEqual(v, []);
});

// ── ⑤ Appeso al giro, non lasciato in un file che nessuno esegue ───────────

prova("il guardiano è appeso al giro e il suo esito arriva al motore come vincolo", () => {
  const giro = readFileSync(join(REPO, "cervello/giro.sh"), "utf8");
  assert.match(giro, /guardiano no-path-cablati-check\.mjs/, "il giro non esegue il guardiano: è di nuovo solo un file");
  assert.match(giro, /\$CABLATI_VINCOLO/, "l'esito non arriva al motore come vincolo");
  execFileSync("bash", ["-n", join(REPO, "cervello/giro.sh")], { stdio: "pipe" });
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
