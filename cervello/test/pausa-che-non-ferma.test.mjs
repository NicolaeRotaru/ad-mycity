#!/usr/bin/env node
// 🛑 AR-390 — «Se la rete fa i capricci, la pausa di Nicola non ferma le cadenze del mattino e
// della sera.»
//
// IL FATTO. Nel Pannello c'è un interruttore: `impostazioni.pausa = on` ferma l'AD. Lo leggevano in
// quattro, ognuno con la sua `curl`, e due la chiudevano con `|| true`: l'errore di rete spariva, la
// risposta vuota non conteneva `"valore":"on"`, e la cadenza PARTIVA mentre Nicola credeva di
// averla messa in pausa. Un interruttore che non risponde non è un interruttore spento.
//
// PERCHÉ QUESTO FILE ESISTE, visto che il fix c'è già dal lotto 40. Il fix era provato da
// `cervello/test/pausa-fail-closed.bats`, e quella prova il motore delle chiusure non sa
// rilanciarla: sa eseguire solo `node cervello/<script>.mjs`. Un difetto chiuso da una prova che il
// motore non sa rieseguire è un difetto che nessuno ricontrollerà mai — per questo era rimasto
// aperto. Qui le stesse domande le fa node, e la risposta la dà bash eseguito davvero.
//
// COSA PROVA:
//   ① il contratto a tre stati, ESEGUITO: 0 via libera · 1 in pausa · 2 non verificabile.
//      Il 2 è il motivo per cui la funzione esiste: prima «non ho potuto leggere» finiva dentro
//      «via libera».
//   ② IL CASO CHE HA ROTTO, con una rete che fallisce sul serio (un indirizzo che rifiuta la
//      connessione, non uno stub che ne imita l'idea): non si parte, e il messaggio dice PERCHÉ.
//   ③ senza le chiavi il kill-switch non è collegato affatto → si parte (clone locale, CI): una
//      difesa sproporzionata verrebbe tolta al primo fastidio.
//   ④ le TRE cadenze si fermano davvero: la riga vera di giro.sh, ritmo.sh e monitora.sh viene
//      eseguita con un kill-switch che dice «in pausa», e si guarda se il lavoro dopo è partito.
//      È la parte che il banco bats dichiarava scoperta (⚪) e qui diventa misurata.
//
// NON-VACUITÀ (verificata rompendo il fix apposta): in `cervello/kill-switch.sh`, sostituendo il
// `return 2` di `pausa_verdetto` con `return 0` — cioè rimettendo «non ho potuto leggere = via
// libera» — i casi ① e ② diventano ROSSI. Togliendo la riga `pausa_consenti_partenza … || exit 0`
// da una delle tre cadenze, diventa rosso ④ per quella cadenza.

import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const KILL = join(REPO, "cervello", "kill-switch.sh");
// Un indirizzo su cui nessuno ascolta: la curl fallisce sul serio (connection refused).
const RETE_MORTA = "http://127.0.0.1:1";

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Esegue un frammento di bash col kill-switch VERO caricato, e torna esito + testo. */
function inBash(copione, env = {}) {
  const r = spawnSync("bash", ["-c", `. '${KILL}'\n${copione}`], {
    encoding: "utf8",
    timeout: 60_000,
    env: { ...process.env, ...env },
  });
  return { status: r.status, testo: `${r.stdout || ""}${r.stderr || ""}` };
}

// ═══ ① il contratto a tre stati, eseguito ════════════════════════════════════════════════════════

prova("① 0 via libera · 1 in pausa · 2 non verificabile — i tre stati esistono davvero", () => {
  assert.equal(inBash(`pausa_verdetto 0 '[{"valore":"off"}]'`).status, 0);
  assert.equal(inBash(`pausa_verdetto 0 '[{"valore":"on"}]'`).status, 1);
  assert.equal(inBash("pausa_verdetto 7 ''").status, 2, "la curl è fallita: «non ho letto» non è «via libera»");
  assert.equal(inBash(`pausa_verdetto boh '[{"valore":"off"}]'`).status, 2, "un rc che non è un numero è a maggior ragione cieco");
});

// ═══ ② il caso che ha rotto: la rete non risponde ════════════════════════════════════════════════

prova("② IL CASO CHE HA ROTTO: la rete non risponde → NON si parte, e si dice perché", () => {
  const r = inBash(`pausa_consenti_partenza 'ritmo mattino'`, {
    SUPABASE_URL: RETE_MORTA,
    SUPABASE_SERVICE_KEY: "finta",
  });
  assert.equal(r.status, 1, "con la rete morta la cadenza è partita lo stesso");
  assert.match(r.testo, /PAUSA_FAIL_CLOSED/, "chi legge il log alle sei del mattino deve capire in una riga cos'è successo");
  assert.match(r.testo, /non verificabile/, "il messaggio deve distinguere il guasto dalla pausa");
});

prova("② pausa accesa → non si parte, e NON si racconta come un guasto", () => {
  const r = inBash(`pausa_stato() { printf '[{"valore":"on"}]'; }; pausa_consenti_partenza 'giro'`, {
    SUPABASE_URL: "x",
    SUPABASE_SERVICE_KEY: "y",
  });
  assert.equal(r.status, 1);
  assert.match(r.testo, /PAUSA/);
  assert.doesNotMatch(r.testo, /FAIL_CLOSED/, "una pausa voluta non è un guasto: due cose diverse, due messaggi diversi");
});

prova("② pausa spenta e letta DAVVERO → si parte", () => {
  const r = inBash(`pausa_stato() { printf '[{"valore":"off"}]'; }; pausa_consenti_partenza 'giro'`, {
    SUPABASE_URL: "x",
    SUPABASE_SERVICE_KEY: "y",
  });
  assert.equal(r.status, 0);
});

// ═══ ③ la difesa resta proporzionata ═════════════════════════════════════════════════════════════

prova("③ senza chiavi il kill-switch non è collegato → si parte (clone locale, CI)", () => {
  const r = spawnSync("bash", ["-c", `. '${KILL}'; unset SUPABASE_URL SUPABASE_SERVICE_KEY; pausa_consenti_partenza 'giro'`], {
    encoding: "utf8",
    env: { ...process.env, SUPABASE_URL: "", SUPABASE_SERVICE_KEY: "" },
  });
  assert.equal(r.status, 0, "il difetto è la rete che fallisce CON le chiavi, non l'assenza di chiavi");
});

// ═══ ④ le tre cadenze si fermano DAVVERO — la parte che il banco bats dichiarava scoperta ════════

/** La riga vera con cui una cadenza chiede il permesso, presa dal suo file e non ricopiata. */
function rigaDelPermesso(rel) {
  const riga = readFileSync(join(REPO, rel), "utf8")
    .split("\n")
    .find((r) => r.trimStart().startsWith("pausa_consenti_partenza"));
  assert.ok(riga, `${rel}: non chiede più il permesso al kill-switch — la cadenza parte in pausa`);
  return riga;
}

/** Esegue quella riga con un kill-switch che dice «in pausa» e guarda se il lavoro dopo è partito. */
function laCadenzaSiFerma(rel) {
  const tmp = mkdtempSync(join(tmpdir(), "ar390-"));
  const spia = join(tmp, "e-partita");
  const copione = join(tmp, "prova.sh");
  writeFileSync(
    copione,
    [
      "set -u",
      "RITMO_TIPO=mattino",
      "pausa_consenti_partenza() { return 1; }", // l'interruttore dice: fermati
      rigaDelPermesso(rel),
      `printf 1 > '${spia}'`, // se si arriva qui, la cadenza è partita in pausa
      "",
    ].join("\n"),
  );
  chmodSync(copione, 0o755);
  const r = spawnSync("bash", [copione], { encoding: "utf8", timeout: 30_000 });
  // La spia esiste solo se l'esecuzione ha superato la riga del permesso.
  return { partita: existsSync(spia), status: r.status };
}

for (const rel of ["cervello/giro.sh", "cervello/ritmo.sh", "cervello/monitora.sh"]) {
  prova(`④ ${rel}: il kill-switch dice fermati e la cadenza si ferma sul serio`, () => {
    assert.equal(laCadenzaSiFerma(rel).partita, false, `${rel} è partita nonostante la pausa`);
  });
}

prova("④bis la spia funziona: senza pausa il lavoro dopo la riga PARTE (la prova non è vacua)", () => {
  // Se la spia non si accendesse mai, i tre casi qui sopra sarebbero verdi anche con la riga tolta.
  const tmp = mkdtempSync(join(tmpdir(), "ar390-spia-"));
  const spia = join(tmp, "e-partita");
  const copione = join(tmp, "prova.sh");
  writeFileSync(
    copione,
    ["set -u", "RITMO_TIPO=mattino", "pausa_consenti_partenza() { return 0; }", rigaDelPermesso("cervello/ritmo.sh"), `printf 1 > '${spia}'`, ""].join("\n"),
  );
  chmodSync(copione, 0o755);
  spawnSync("bash", [copione], { encoding: "utf8", timeout: 30_000 });
  assert.equal(existsSync(spia), true, "la spia non si accende nemmeno a via libera: non stava misurando niente");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
