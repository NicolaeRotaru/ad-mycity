#!/usr/bin/env node
// ⏳ AR-630 — «Quando la quota si libera tra ore, la cadenza riprova comunque dopo trenta secondi.»
//
// IL FATTO. AR-201 aveva già insegnato al ciclo delle cadenze a CHIEDERE invece di ritentare a
// memoria: `retry-policy.mjs` risponde «si ritenta» e, insieme, `quandoISO` — l'istante in cui il
// motore tornerà disponibile. Per il limite settimanale sono ore, a volte giorni.
// Il ciclo leggeva il sì e buttava via il quando: `sleep 30`, tentativo bruciato contro lo stesso
// muro, e ognuno paga prima il suo timeout. Tre tentativi per farsi dire di no tre volte.
//
// LA CURA sta dove un test la può eseguire — `attesaRitentativo()` in cervello/esito-cadenza.mjs —
// e la regola è una: se l'attesa entra nella pausa che la cadenza si può permettere, si aspetta e
// si riprova; se la supera, non si riprova affatto. Il lavoro non si perde, perché il recupero
// (`cadenza_recupero`) ri-accoda la cadenza con `riprova_dopo` all'ora del reset e il worker la
// riprende da sola. Fermarsi qui non è arrendersi: è smettere di pagare per un no annunciato.
//
// COSA PROVA:
//   ① IL CASO CHE HA ROTTO: reset fra sei ore → non si riprova, e il motivo dice l'ora vera;
//   ② un reset vicino si aspetta davvero (non si spreca un tentativo trenta secondi prima);
//   ③ senza orario dalla policy niente cambia: pausa di sempre — la cura non blocca i casi normali;
//   ④ il ciclo VERO di lib-cadenza.sh legge `attesaSec` e ci dorme sopra, invece della pausa fissa.
//
// NON-VACUITÀ (verificata rompendo il fix apposta): in `cervello/esito-cadenza.mjs`, facendo
// tornare sempre `{ ritenta: true, attesaSec: pausa }` da `attesaRitentativo` — cioè rimettendo la
// pausa fissa — i casi ① e ② diventano ROSSI.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { ATTESA_MAX_IN_CADENZA_SEC, attesaRitentativo } from "../esito-cadenza.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ORA = Date.parse("2026-08-15T10:00:00Z");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

prova("① IL CASO CHE HA ROTTO: il motore torna fra sei ore → NON si riprova fra trenta secondi", () => {
  const r = attesaRitentativo({ quandoISO: "2026-08-15T16:00:00Z", adessoMs: ORA, pausaSec: 30 });
  assert.equal(r.ritenta, false, "tre tentativi bruciati contro lo stesso muro nel giro di un minuto");
  assert.match(r.motivo, /6h/, "il motivo deve dire QUANDO torna, o chi legge il log non sa se aspettare");
});

prova("① lo stesso vale per un reset fra giorni (limite settimanale)", () => {
  const r = attesaRitentativo({ quandoISO: "2026-08-18T10:00:00Z", adessoMs: ORA, pausaSec: 30 });
  assert.equal(r.ritenta, false);
  assert.equal(r.attesaSec, 0);
});

prova("② un reset VICINO si aspetta davvero, invece di riprovare troppo presto", () => {
  const r = attesaRitentativo({ quandoISO: "2026-08-15T10:02:00Z", adessoMs: ORA, pausaSec: 30 });
  assert.equal(r.ritenta, true);
  assert.equal(r.attesaSec, 120, "trenta secondi prima del reset il tentativo è sprecato: si aspetta fin lì");
});

prova("② il confine è dichiarato, non a occhio", () => {
  const dentro = attesaRitentativo({ quandoISO: new Date(ORA + ATTESA_MAX_IN_CADENZA_SEC * 1000).toISOString(), adessoMs: ORA, pausaSec: 30 });
  assert.equal(dentro.ritenta, true);
  const fuori = attesaRitentativo({ quandoISO: new Date(ORA + (ATTESA_MAX_IN_CADENZA_SEC + 60) * 1000).toISOString(), adessoMs: ORA, pausaSec: 30 });
  assert.equal(fuori.ritenta, false);
});

prova("③ senza orario dalla policy non cambia niente: pausa di sempre", () => {
  for (const q of ["", null, "boh", undefined]) {
    const r = attesaRitentativo({ quandoISO: q, adessoMs: ORA, pausaSec: 30 });
    assert.equal(r.ritenta, true, `quandoISO=${JSON.stringify(q)}`);
    assert.equal(r.attesaSec, 30);
  }
  // Un reset già passato è «torna subito»: pausa standard, non attesa negativa.
  const passato = attesaRitentativo({ quandoISO: "2026-08-15T09:00:00Z", adessoMs: ORA, pausaSec: 30 });
  assert.equal(passato.ritenta, true);
  assert.equal(passato.attesaSec, 30);
});

// ═══ ④ il ciclo VERO legge l'attesa, non la pausa fissa ══════════════════════════════════════════

/** Il tratto vero di `cadenza_ai_run` che decide se e quanto aspettare, preso dal file. */
function trattoDelRitentativo() {
  const righe = readFileSync(join(REPO, "cervello", "lib-cadenza.sh"), "utf8").split("\n");
  const da = righe.findIndex((r) => r.trimStart().startsWith('_ver="$(node'));
  assert.ok(da >= 0, "il tratto del ritentativo non si trova più in lib-cadenza.sh");
  const a = righe.findIndex((r, i) => i > da && r.trimStart().startsWith("sleep "));
  assert.ok(a > da, "non trovo più il punto in cui il ciclo dorme");
  return righe.slice(da, a + 1).join("\n");
}

/** Esegue quel tratto con una testa finta che risponde `risposta`, e dice quanto ha dormito. */
function quantoDorme(risposta) {
  const copione = [
    "set -u",
    "ts() { echo 00:00; }",
    "tipo=monitora; n=1; tentativi=3; pausa=30; CADENZA_AI_RC=1; _dec='{}'",
    // `node` finto: al posto della testa vera risponde quello che ci serve per il caso.
    `node() { printf '%s' ${JSON.stringify(risposta)}; }`,
    "sleep() { echo \"DORMITO $1\"; }",
    // `break` fuori da un ciclo è un no-op: il tratto vero vive dentro il `for` dei tentativi, e
    // senza il ciclo l'uscita anticipata non si vedrebbe (si arriverebbe al sleep lo stesso).
    "for _t in 1; do",
    trattoDelRitentativo(),
    "done",
    "",
  ].join("\n");
  const r = spawnSync("bash", ["-c", copione], { encoding: "utf8", timeout: 30_000 });
  const testo = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /DORMITO (\d+)/.exec(testo);
  return { dormito: m ? Number(m[1]) : null, testo };
}

prova("④ il ciclo vero dorme l'attesa che la testa ha calcolato, non la pausa fissa", () => {
  const r = quantoDorme('{"chiedi":true,"ritenta":true,"attesaSec":120,"motivo":"il motore torna fra 120s"}');
  assert.equal(r.dormito, 120, `il ciclo ha dormito ${r.dormito}s invece dei 120 chiesti: ${r.testo.slice(-200)}`);
});

prova("④ e se la testa dice di NON ritentare, il ciclo non dorme affatto: esce", () => {
  const r = quantoDorme('{"chiedi":true,"ritenta":false,"attesaSec":0,"motivo":"il motore torna fra ~6h"}');
  assert.equal(r.dormito, null, "ha aspettato per poi uscire lo stesso: trenta secondi buttati a ogni tentativo");
  assert.match(r.testo, /NON si ritenta adesso/);
  assert.match(r.testo, /6h/, "il motivo della policy deve arrivare nel log, non una frase fissa");
});

prova("④bis se la testa non risponde si torna alla pausa di sempre (cintura)", () => {
  const r = quantoDorme('{"chiedi":true,"ritenta":true,"motivo":"senza attesaSec"}');
  assert.equal(r.dormito, 30, "senza il campo, il ciclo deve ripiegare sulla pausa, non su zero");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
