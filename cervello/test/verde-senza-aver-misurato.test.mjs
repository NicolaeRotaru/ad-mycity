// AR-353 — «il guardiano delle prove stampa il bollino verde dopo non aver misurato niente».
//
// Misurato il 29/7 in questa stessa sessione, lanciando `node cervello/prove-oneste.mjs`:
//
//     ✅ Prove oneste: 145 prove controllate, nessuna era già soddisfatta alla nascita.
//     👁️ 145 non misurabili: impossibile ricostruire il file alla data di nascita
//
// Controllate 145, misurate ZERO — e il processo usciva 0. Il verdetto guardava solo
// `sospette.length`, quindi «non ho trovato niente» e «non ho potuto guardare» producevano la stessa
// frase e lo stesso codice. Il vincolo di cecità già scritto in giro.sh scatta su rc≥2: non si
// alzava mai, e il giro riceveva un verde per una misura mai fatta.
//
// La causa di sistema è il contratto mancante degli exit code dei guardiani. Ora la decisione è una
// funzione pura sola — `verdettoCopertura` — e i tre esiti sono espliciti: 0 misurato e pulito ·
// 1 violazione · 2 cieco (AR-322).
//
//   node cervello/test/verde-senza-aver-misurato.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { verdettoCopertura, COPERTURA_MINIMA } from "../misura-parziale.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("⬇️ IL CASO CHE RIVELA LA MALATTIA: 145 controllate, 0 misurate ⇒ cieco (2), MAI verde", () => {
  const v = verdettoCopertura({ controllate: 145, misurate: 0, violazioni: 0 });
  assert.equal(v.esito, "cieco");
  assert.equal(v.codice, 2, "il giro alza il vincolo di cecità solo su rc≥2");
  assert.notEqual(v.codice, 0, "un bollino verde stampato senza aver misurato è la malattia stessa");
  assert.match(v.motivo, /ZERO misurate/);
});

test("misurato e pulito ⇒ 0 · violazione ⇒ 1 · niente da controllare ⇒ 2", () => {
  assert.equal(verdettoCopertura({ controllate: 100, misurate: 100, violazioni: 0 }).codice, 0);
  assert.equal(verdettoCopertura({ controllate: 100, misurate: 100, violazioni: 3 }).codice, 1);
  // Zero controlli non è un verde: è non aver guardato niente.
  assert.equal(verdettoCopertura({ controllate: 0, misurate: 0, violazioni: 0 }).codice, 2);
});

test("una violazione vera VINCE sulla cecità: è un fatto misurato", () => {
  const v = verdettoCopertura({ controllate: 145, misurate: 2, violazioni: 1 });
  assert.equal(v.codice, 1, "ho visto poco, ma quello che ho visto è rotto: si dice");
  assert.equal(v.esito, "violazione");
});

test("copertura sotto la soglia dichiarata ⇒ cieco, non un verde di minoranza", () => {
  const sotto = verdettoCopertura({ controllate: 100, misurate: 10, violazioni: 0 });
  assert.equal(sotto.codice, 2, `10% è sotto il minimo del ${Math.round(COPERTURA_MINIMA * 100)}%`);
  assert.match(sotto.motivo, /minoranza/);

  const sopra = verdettoCopertura({ controllate: 100, misurate: 80, violazioni: 0 });
  assert.equal(sopra.codice, 0);
  assert.equal(sopra.copertura, 0.8, "la copertura viaggia sempre col verdetto");
});

test("il guardiano VERO non stampa più ✅ quando non ha misurato niente", () => {
  const r = spawnSync("node", [join(ROOT, "cervello/prove-oneste.mjs")], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 120_000,
  });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const prima = out.trim().split("\n")[0] || "";

  // Il repo può essere intero (VPS) o superficiale (sessione cloud): il test copre entrambi, perché
  // l'invariante non è «esce 2», è «il bollino corrisponde a quello che ha misurato».
  const nonMisurate = /NESSUNA prova è ricostruibile|non misurabili/.test(out);
  if (nonMisurate && /ZERO misurate|NON MISURATE/.test(prima)) {
    assert.equal(r.status, 2, "cieco ⇒ exit 2");
    assert.doesNotMatch(prima, /^✅/, `prima riga verde su una misura mai fatta: «${prima}»`);
  } else {
    assert.ok([0, 1, 2].includes(r.status), `codice d'uscita fuori contratto: ${r.status}`);
    if (r.status === 0) {
      assert.match(prima, /prove misurate su/, "un verde deve dichiarare QUANTE ne ha misurate");
    }
  }
});

test("prove-oneste DELEGA il verdetto invece di guardare solo sospette.length", () => {
  const src = readFileSync(join(ROOT, "cervello/prove-oneste.mjs"), "utf8");
  assert.match(src, /verdettoCopertura\s*\(/, "la decisione sta nella funzione pura condivisa");
  assert.doesNotMatch(src, /process\.exit\(sospette\.length \? 1 : 0\)/, "il vecchio verdetto a due esiti non deve tornare");
  assert.match(src, /process\.exit\(verdetto\.codice\)/, "esce col codice del contratto 0/1/2");
});
