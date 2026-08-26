#!/usr/bin/env node
// ⏱️ AR-295 — «Il freno che distanzia i ritentativi si spegne da solo se una singola domanda al
// database va storta.»
//
// IL FATTO. All'avvio il worker chiede una volta sola se la tabella dei lavori ha i campi
// `tentativi`/`riprova_dopo`. Se quella domanda non riceve un 200 — anche per un intoppo di rete di
// un secondo — `HAS_RETRY_COLS` resta 0 per tutta la vita del processo, cioè per giorni. E quella
// variabile governava DUE comportamenti diversi:
//   · PROGRAMMARE le attese (scrivere `riprova_dopo`): ha davvero bisogno dei campi;
//   · RISPETTARE le attese già scritte (filtrarle nella coda): non ne ha bisogno affatto.
// Spegnendoli insieme, il worker ignorava in SILENZIO ogni `riprova_dopo` — comprese quelle scritte
// dalla sentinella, che è un secondo componente e continua a programmarle — e rilanciava i lavori
// falliti a raffica contro lo stesso muro.
//
// LA CURA, tre pezzi come chiedeva la scheda:
//   (a) il filtro sull'ora di ritentativo si applica SEMPRE; se il database lo rifiuta si ripiega,
//       ma dicendolo — un ripiego silenzioso è indistinguibile da un freno che funziona;
//   (b) il sondaggio iniziale si ripete tre volte, invece di accontentarsi del primo esito;
//   (c) e si rifà ogni tanto nel ciclo, così un blip all'avvio non condanna il processo per giorni.
//
// COSA PROVA, eseguendo le righe VERE di worker.sh:
//   ① IL CASO CHE HA ROTTO: con l'auto-recovery spento la coda chiede COMUNQUE il filtro sull'ora;
//   ② se il database rifiuta il filtro si ripiega, e la riga di avviso arriva nel log;
//   ③ il sondaggio sopravvive a due errori di fila e trova il 200 al terzo.
//
// NON-VACUITÀ (verificata rompendo il fix apposta): rimettendo in worker.sh il vecchio
// `if [ "$HAS_RETRY_COLS" = 1 ]; … else _rtry=""; fi`, il caso ① diventa ROSSO — la coda torna a
// chiedere i lavori senza filtro e nessuno se ne accorge.

import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WORKER = join(REPO, "cervello", "worker.sh");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

const righeWorker = () => readFileSync(WORKER, "utf8").split("\n");

/** Il tratto vero che costruisce la richiesta della coda, ritagliato dal file. */
function trattoDellaCoda() {
  const righe = righeWorker();
  // Si parte dalla FINE (la riga che legge l'id del lavoro) e si torna indietro fino all'inizio del
  // blocco: `HAS_RETRY_COLS` compare anche più in su, e ancorarsi alla prima occorrenza ritagliava
  // mezzo file. La domanda giusta è «dove comincia il blocco che precede questa riga».
  const a = righe.findIndex((r) => r.trimStart().startsWith(`id="$(printf '%s' "$riga"`));
  assert.ok(a > 0, "non trovo più il punto in cui il worker legge l'id del lavoro preso dalla coda");
  let da = -1;
  for (let i = a - 1; i >= 0; i--) {
    const t = righe[i].trimStart();
    if (t.startsWith("now_z=") || t.startsWith('if [ "$HAS_RETRY_COLS" = 1 ]')) {
      da = i;
      break;
    }
  }
  assert.ok(da >= 0, "il tratto che costruisce la richiesta della coda non si trova più in worker.sh");
  // Se il `now_z=` è annidato dentro un `if`, il ritaglio deve partire dall'`if`, o non compila —
  // e un frammento che non compila è ⚪, non rosso: direbbe «difetto» guardando il proprio errore.
  for (let i = da - 1; i >= Math.max(0, da - 3); i--) {
    if (righe[i].trimStart().startsWith('if [ "$HAS_RETRY_COLS"')) {
      da = i;
      break;
    }
  }
  return righe.slice(da, a).join("\n");
}

/** La definizione vera del sondaggio, ritagliata dal file. */
function funzioneSonda() {
  const righe = righeWorker();
  const da = righe.findIndex((r) => r.startsWith("_sonda_retry()"));
  assert.ok(da >= 0, "il sondaggio dei campi di ritentativo non esiste più in worker.sh");
  const a = righe.findIndex((r, i) => i > da && r === "}");
  assert.ok(a > da, "non trovo la fine del sondaggio");
  return righe.slice(da, a + 1).join("\n");
}

/** Esegue il tratto della coda con una curl finta che scrive gli indirizzi chiesti su un foglio. */
function indirizziChiesti({ hasRetryCols = 0, filtroRifiutato = false } = {}) {
  const tmp = mkdtempSync(join(tmpdir(), "ar295-"));
  const chiamate = join(tmp, "chiamate.log");
  writeFileSync(chiamate, "");
  const copione = join(tmp, "prova.sh");
  writeFileSync(
    copione,
    [
      "set -u",
      "ts() { echo 00:00; }",
      "SUPABASE_URL=https://finto.invalido",
      "AUTH=(-H 'apikey: x')",
      "WORKER_LANE=tutti",
      "INTERVALLO=1",
      `HAS_RETRY_COLS=${hasRetryCols}`,
      "curl() {",
      `  for _a in "$@"; do case "$_a" in http*) echo "$_a" >> '${chiamate}' ;; esac; done`,
      filtroRifiutato
        ? `  case "$*" in *riprova_dopo*) return 22 ;; esac`
        : "  :",
      "  printf '[]'",
      "}",
      "jq() { printf ''; }",
      "sleep() { :; }",
      // AR-804 — la presa dei lavori e' uscita da worker.sh e vive in `worker-coda.sh`, che il
      // worker sorgente. Il tratto ritagliato la CHIAMA, quindi il banco deve sorgentarla come fa
      // il worker vero: senza, il frammento non compila e un frammento che non compila e' ⚪, non
      // rosso. La proprieta' di AR-295 non cambia — il filtro sull'ora e il ripiego dichiarato ora
      // stanno li' dentro, ed e' li' che questo caso li va a guardare.
      `SCRIPT_DIR='${join(REPO, "cervello")}'`,
      `. '${join(REPO, "cervello", "worker-coda.sh")}'`,
      "for _giro in 1; do",
      trattoDellaCoda(),
      "done",
      "",
    ].join("\n"),
  );
  chmodSync(copione, 0o755);
  const r = spawnSync("bash", [copione], { encoding: "utf8", timeout: 30_000 });
  return { chiamate: readFileSync(chiamate, "utf8").split("\n").filter(Boolean), testo: `${r.stdout || ""}${r.stderr || ""}` };
}

/**
 * Le richieste che LEGGONO LA CODA DI CHI ASPETTA — le uniche a cui la regola di AR-295 si applica.
 *
 * Da quando la presa va a turno fra i negozi (AR-804) il blocco fa anche altre richieste: quanti
 * lavori sono IN CORSO per negozio, e le impostazioni delle corsie. Su quelle il filtro sull'ora di
 * ritentativo non vuol dire niente — non sono lavori in attesa — e pretenderlo lì trasformerebbe
 * questo caso in un allarme che suona per il motivo sbagliato.
 *
 * Il filtro resta obbligatorio, con la stessa durezza, esattamente dove conta.
 */
const chiamateDellaCoda = (chiamate) => chiamate.filter((u) => /lavori\?[^"]*stato=eq\.in_attesa/.test(u));

prova("① IL CASO CHE HA ROTTO: auto-recovery spento, e la coda chiede COMUNQUE il filtro sull'ora", () => {
  const r = indirizziChiesti({ hasRetryCols: 0 });
  assert.ok(r.chiamate.length > 0, `nessuna richiesta partita: il ritaglio non ha funzionato — ${r.testo.slice(-300)}`);
  const dellaCoda = chiamateDellaCoda(r.chiamate);
  // Il guardrail del restringimento: se un giorno nessuna richiesta legge più la coda di chi
  // aspetta, questo caso non deve diventare verde a vuoto — deve dirlo.
  assert.ok(dellaCoda.length > 0, `nessuna richiesta legge la coda dei lavori in attesa: il caso sarebbe verde per niente\n      ${r.chiamate.join("\n      ")}`);
  for (const url of dellaCoda) {
    assert.match(url, /riprova_dopo\.lte/, `una richiesta alla coda senza il filtro: le scadenze già scritte vengono ignorate\n      ${url}`);
  }
});

prova("① con l'auto-recovery acceso non cambia niente (il filtro c'era già)", () => {
  const r = indirizziChiesti({ hasRetryCols: 1 });
  const dellaCoda = chiamateDellaCoda(r.chiamate);
  assert.ok(dellaCoda.length > 0, "nessuna richiesta legge la coda dei lavori in attesa");
  for (const url of dellaCoda) assert.match(url, /riprova_dopo\.lte/);
});

prova("② se il database rifiuta il filtro si ripiega — ma lo DICE, non in silenzio", () => {
  const r = indirizziChiesti({ hasRetryCols: 1, filtroRifiutato: true });
  const senzaFiltro = r.chiamate.filter((u) => !/riprova_dopo/.test(u));
  assert.ok(senzaFiltro.length > 0, "senza ripiego il worker resterebbe a coda vuota per sempre");
  assert.match(r.testo, /AR-295/, "un ripiego silenzioso è indistinguibile da un freno che funziona");
  assert.match(r.testo, /ora di ritentativo/, "la riga deve dire COSA si è perso, non solo che qualcosa è andato storto");
});

prova("③ il sondaggio sopravvive a due errori di fila e trova il 200 al terzo", () => {
  const tmp = mkdtempSync(join(tmpdir(), "ar295-sonda-"));
  const conta = join(tmp, "quante-volte");
  const copione = [
    "set -u",
    "SUPABASE_URL=https://finto.invalido",
    "AUTH=(-H 'apikey: x')",
    "sleep() { :; }",
    "curl() {",
    `  n=$(cat '${conta}' 2>/dev/null || echo 0); n=$((n + 1)); echo "$n" > '${conta}'`,
    '  if [ "$n" -lt 3 ]; then echo 000; else echo 200; fi',
    "}",
    funzioneSonda(),
    "_sonda_retry",
    "",
  ].join("\n");
  const r = spawnSync("bash", ["-c", copione], { encoding: "utf8", timeout: 30_000 });
  assert.equal((r.stdout || "").trim(), "1", `un intoppo di un secondo non deve spegnere l'auto-recovery per giorni: ${r.stderr}`);
  assert.equal(readFileSync(conta, "utf8").trim(), "3", "ha chiesto una volta sola: è un sorteggio, non una rilevazione");
});

prova("③bis e se il database dice davvero di no tre volte, il sondaggio risponde no", () => {
  const copione = ["set -u", "SUPABASE_URL=x", "AUTH=()", "sleep() { :; }", "curl() { echo 404; }", funzioneSonda(), "_sonda_retry", ""].join("\n");
  const r = spawnSync("bash", ["-c", copione], { encoding: "utf8", timeout: 30_000 });
  assert.equal((r.stdout || "").trim(), "0", "se rispondesse sempre sì non starebbe misurando niente");
});

// La cintura del punto (c): il risondaggio periodico esiste ed è agganciato al ciclo.
prova("③ter il sondaggio si rifà nel ciclo, non solo all'avvio", () => {
  const testo = readFileSync(WORKER, "utf8");
  const dentroIlCiclo = testo.slice(testo.indexOf("while true; do"));
  assert.ok(dentroIlCiclo.includes("_sonda_retry"), "il risondaggio sta fuori dal ciclo: un blip all'avvio condanna il processo per giorni");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
