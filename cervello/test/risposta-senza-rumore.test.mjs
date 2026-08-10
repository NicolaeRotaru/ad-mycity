// 🧼 AR-562 — LA RISPOSTA CHE NICOLA LEGGE NON DEVE CONTENERE IL RUMORE DELLA CLI.
//
// Il difetto misurato il 2026-08-10, segnalato da Nicola con lo schermo del Pannello in mano: molte
// analisi si aprivano con un muro di avvisi di configurazione al posto del lavoro. «Permission allow
// rule … is not matched by file permission checks», «this workspace has not been trusted», «no stdin
// data received», «Shell cwd was reset». Quegli avvisi la CLI li scrive su STDERR; era il `2>&1`
// della corsia LAVORI (`ai_run_con_fallback_ollama`) a impastarli con la risposta e a salvarli in
// `lavori.risultato`, che è esattamente il testo che finisce nella card.
//
// LA CAUSA RADICE NON È IL `2>&1`, È LA LEZIONE APPLICATA A METÀ. L'11/7 la macchina aveva già
// imparato questo («NON mescolare 2>&1 con lo stdout: un solo warning della CLI rompeva il parse») e
// l'aveva applicata a DUE corsie su tre — `rispondi_chat_json` e `_chat_stream_run`. La terza, quella
// dei lavori, è rimasta com'era per un mese. Una lezione che copre solo i punti che bruciavano quel
// giorno è un difetto che rientra dalla porta accanto.
//
// PERCHÉ QUESTA PROVA GIRA IN BASH E NON È UN GREP. Un grep su `2>&1` direbbe solo com'è scritta la
// riga oggi. Qui si ESEGUE la funzione vera con un comando che stampa su tutti e due i flussi, e si
// guarda cosa esce. Regge a una riscrittura della funzione, che è il punto di una prova.
//
// PERCHÉ È UN `.test.mjs` E NON UN `.bats`. I 26 file `.bats` di questa cartella non li lancia nessun
// processo ricorrente: né `test-cervello.mjs` (filtra `.test.mjs`), né la CI, né il giro. Una prova
// che non guarda nessuno è la stessa storia di AR-376. Questa entra nella suite che gira davvero.
//
// COSA NON PROVA: non prova che gli avvisi spariscano — quelli si spengono solo correggendo le regole
// in `.claude/settings*.json`, che sono di Nicola (card #avvisi-permessi-nelle-analisi). Prova che,
// avvisi o no, non finiscano nella risposta.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

/**
 * Esegue la funzione VERA con un comando finto che imita la CLI: `stdout` è quello che la CLI
 * risponde, `stderr` quello che borbotta all'avvio, `uscita` il suo codice di uscita.
 * Rende { risposta, log, codice } — cioè, nell'ordine: ciò che finirebbe nella card di Nicola,
 * ciò che finirebbe nel log del worker, e il codice che il worker legge per decidere fatto/errore.
 */
function eseguiConRumore({ stdout = "", stderr = "", uscita = 0 }) {
  const finto = [
    stdout ? `printf '%s\\n' ${JSON.stringify(stdout)}` : "true",
    stderr ? `printf '%s\\n' ${JSON.stringify(stderr)} >&2` : "true",
    `exit ${uscita}`,
  ].join("; ");
  const script = `
    . "${REPO}/cervello/motore-ai.sh"
    esito=0
    risposta="$(ai_run_con_fallback_ollama 30 "prompt-di-prova" bash -c ${JSON.stringify(finto)})" || esito=$?
    printf '%s' "$risposta"
    exit $esito
  `;
  const r = spawnSync("bash", ["-c", script], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 60_000,
    // CERVELLO_MOTORE forzato: `ai_engine` non deve andare a cercare una CLI installata.
    env: { ...process.env, CERVELLO_MOTORE: "claude" },
  });
  return { risposta: r.stdout ?? "", log: r.stderr ?? "", codice: r.status };
}

test("lavoro riuscito: nella risposta c'è il lavoro, non gli avvisi della CLI", () => {
  const avviso =
    "Permission allow rule (.claude/settings.local.json): Write(MyCity-Vault/90-Memoria-AI/) is not " +
    "matched by file permission checks — only Edit(path) rules are.";
  const { risposta, codice } = eseguiConRumore({ stdout: "Ecco l'analisi che avevi chiesto.", stderr: avviso });
  assert.equal(codice, 0);
  assert.match(risposta, /Ecco l'analisi che avevi chiesto\./);
  assert.doesNotMatch(risposta, /Permission allow rule/, "l'avviso di permessi non deve entrare nella risposta");
  assert.doesNotMatch(risposta, /file permission checks/);
});

test("il rumore non è buttato via: finisce nel log del worker", () => {
  // Distinguere «l'ho tolto dalla risposta» da «l'ho perso» è il punto. Un avviso perso è un guasto
  // che nessuno vedrà più — e sarebbe l'errore opposto, non la cura.
  const { log } = eseguiConRumore({ stdout: "risposta", stderr: "Permission deny rule: Write(**/.env) is not matched" });
  assert.match(log, /Permission deny rule/);
});

test("lavoro fallito: lo stderr resta attaccato alla risposta — lì è la diagnosi", () => {
  // Su un fallimento nascondere lo stderr sarebbe il difetto opposto: la retry-policy ci cerca
  // dentro i suoi pattern e `diagnosi_errore` ci costruisce sopra la spiegazione per Nicola.
  const { risposta, codice } = eseguiConRumore({
    stdout: "output parziale",
    stderr: "Error: qualcosa si è rotto sul serio",
    uscita: 3,
  });
  assert.equal(codice, 3);
  assert.match(risposta, /output parziale/);
  assert.match(risposta, /Error: qualcosa si è rotto sul serio/);
});

test("stdout vuoto: si consegna lo stderr, non il nulla", () => {
  const { risposta, codice } = eseguiConRumore({ stderr: "Invalid API key — please run /login" });
  assert.equal(codice, 0);
  assert.match(risposta, /Invalid API key/, "senza stdout, l'unica notizia che c'è è quella su stderr");
});

test("il limite di quota viene riconosciuto anche quando arriva su stderr", (t) => {
  // È la trappola della separazione dei flussi: il messaggio di quota la CLI lo scrive su stderr.
  // Separare i due flussi senza guardare anche lì avrebbe spento in silenzio il fallback su Ollama —
  // un fix che ne rompe un altro, e in silenzio.
  const c = spawnSync("command", ["-v", "ollama"], { shell: true });
  if (c.status === 0) return t.skip("ollama installato: qui si prova il ramo senza fallback");
  const { log } = eseguiConRumore({ stdout: "risposta", stderr: "Claude AI usage limit reached — try again later" });
  assert.match(log, /in limite quota/, "il limite dev'essere riconosciuto anche se arriva solo su stderr");
});
