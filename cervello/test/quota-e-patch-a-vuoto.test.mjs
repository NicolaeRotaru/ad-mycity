#!/usr/bin/env node
// AR-627 · AR-631 — «finito» detto da chi non ha guardato se era finito.
//
// È la malattia che `cervello/malattie.json` chiama «esito-di-scrittura-buttato», presa nei due punti
// dove costa di più:
//
//   AR-627  la quota del motore premium finisce, risponde un modello locale da 3 miliardi di
//           parametri SENZA MANI (non scrive file, non apre PR, non tocca il database), e il suo
//           rc=0 fa chiudere il lavoro «fatto». Il caso peggiore è il recupero delle cadenze: una
//           cadenza saltata per quota viene riaccodata, ripresa mentre la quota è ancora finita,
//           chiusa «fatto» con una chiacchierata — e l'idempotenza non la riaccoda mai più. Il
//           paracadute si brucia da solo.
//   AR-631  la PATCH che chiude il lavoro filtra su `stato=eq.in_corso` e giudicava il successo dal
//           solo codice d'uscita di curl. PostgREST risponde 2xx anche con ZERO righe toccate: se la
//           sentinella ha già chiuso il lavoro credendolo fermo, l'esito dell'azione VERA sparisce,
//           il ricovero viene scartato, la card resta «riapprova» e Nicola la fa partire due volte.
//
// Le due prove girano davvero: la prima esegue `ai_run_con_fallback_ollama` con una CLI finta in
// quota e un `ollama` finto che risponde; la seconda esegue `scrivi_esito_lavoro` con un `curl`
// finto che risponde 2xx con una lista vuota. Nessuna delle due guarda una parola dentro un file.

import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { patchConfermata } = await import(join(REPO, "cervello/esito-scrittura.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};
const bash = (script, env = {}) => {
  try {
    return { rc: 0, out: execFileSync("bash", ["-c", script], { encoding: "utf8", env: { ...process.env, ...env } }) };
  } catch (e) {
    return { rc: e.status ?? 1, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
};

// ─────────────────── AR-627: la quota finita non è un lavoro riuscito ───────────────────

/** Un PATH finto con una CLI che va in quota e (facoltativo) un ollama che risponde. */
function bancoQuota({ conOllama = true } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "quota-"));
  writeFileSync(join(dir, "cli-finta"), '#!/bin/bash\necho "usage limit reached" >&2\nexit 1\n');
  chmodSync(join(dir, "cli-finta"), 0o755);
  if (conOllama) {
    writeFileSync(join(dir, "ollama"), '#!/bin/bash\necho "ecco la mia risposta, ma non ho mani"\nexit 0\n');
    chmodSync(join(dir, "ollama"), 0o755);
  }
  return dir;
}

prova("AR-627: col fallback locale che risponde, l'esito NON è successo", () => {
  const bin = bancoQuota();
  const r = bash(
    `cd ${REPO} && . cervello/motore-ai.sh && ai_run_con_fallback_ollama 20 "metabolizza e scrivi memoria" cli-finta`,
    { PATH: `${bin}:${process.env.PATH}` },
  );
  assert.notEqual(r.rc, 0, "quota finita ma rc=0: il worker chiuderebbe il lavoro «fatto» senza esecuzione");
  assert.equal(r.rc, 75, `atteso il codice del «riprova più tardi» (75), arrivato ${r.rc}`);
  assert.match(r.out, /Ollama/, "la risposta del modello locale si consegna comunque: è meglio di niente per chi legge");
});

prova("AR-627: SENZA ollama, una CLI che esce 0 col messaggio di quota non passa per riuscita", () => {
  // Il fratello nello stesso `if`: la CLI può uscire con rc=0 e la quota scritta nello stdout.
  const dir = mkdtempSync(join(tmpdir(), "quota-zero-"));
  writeFileSync(join(dir, "cli-finta"), '#!/bin/bash\necho "usage limit reached, try again later"\nexit 0\n');
  chmodSync(join(dir, "cli-finta"), 0o755);
  // PATH senza ollama, ma con i binari di sistema: la funzione usa grep/timeout/mktemp.
  const r = bash(
    `cd ${REPO} && . cervello/motore-ai.sh && PATH="${dir}:/usr/bin:/bin" ai_run_con_fallback_ollama 20 "x" cli-finta`,
  );
  assert.equal(r.rc, 75, `una CLI in quota uscita con 0 è passata per riuscita (rc=${r.rc})`);
});

prova("AR-627: un lavoro NORMALE resta riuscito (niente falsi allarmi)", () => {
  // Il contrario, che conta quanto il resto: se ogni lavoro diventasse «errore» il difetto sarebbe
  // solo spostato, e la coda si riempirebbe di rossi finti.
  const dir = mkdtempSync(join(tmpdir(), "ok-"));
  writeFileSync(join(dir, "cli-ok"), '#!/bin/bash\necho "lavoro fatto per davvero"\nexit 0\n');
  chmodSync(join(dir, "cli-ok"), 0o755);
  const r = bash(`cd ${REPO} && . cervello/motore-ai.sh && PATH="${dir}:/usr/bin:/bin" ai_run_con_fallback_ollama 20 "x" cli-ok`);
  assert.equal(r.rc, 0, "un lavoro riuscito è diventato un errore");
  assert.match(r.out, /lavoro fatto per davvero/);
});

prova("AR-627: il worker traduce quel codice in un messaggio che si capisce, non in «rc=75»", () => {
  const w = readFileSync(join(REPO, "cervello/worker.sh"), "utf8");
  assert.match(w, /rc" -eq "\$\{AI_RC_QUOTA_FALLBACK:-75\}/, "il worker non riconosce il codice della quota");
  const ramo = w.slice(w.indexOf("AI_RC_QUOTA_FALLBACK:-75"), w.indexOf("AI_RC_QUOTA_FALLBACK:-75") + 900);
  assert.match(ramo, /stato="errore"/, "il lavoro in quota si chiude ancora «fatto»");
  assert.match(ramo, /non ha le mani|NON è stato eseguito/,
    "il messaggio non dice a Nicola cosa è successo davvero");
});

// ─────────────────── AR-631: 2xx con zero righe non è una scrittura ───────────────────

prova("AR-631: la decisione distingue «scritto», «nessuna riga» e «non arrivato»", () => {
  const scritto = patchConfermata({ rcCurl: 0, corpo: '[{"id":"abc"}]' });
  assert.equal(scritto.confermata, true);
  assert.equal(scritto.righe, 1);

  const aVuoto = patchConfermata({ rcCurl: 0, corpo: "[]" });
  assert.equal(aVuoto.confermata, false, "2xx con zero righe è passato per una scrittura");
  assert.equal(aVuoto.riprovabile, false, "ritentare una PATCH a vuoto è tempo buttato: lo stato non torna indietro");
  assert.match(aVuoto.motivo, /nessuna riga/);

  const nonArrivata = patchConfermata({ rcCurl: 22, corpo: "" });
  assert.equal(nonArrivata.confermata, false);
  assert.equal(nonArrivata.riprovabile, true, "una richiesta non arrivata può arrivare al tentativo dopo");

  const muta = patchConfermata({ rcCurl: 0, corpo: "" });
  assert.equal(muta.confermata, false, "senza corpo non si può dire di aver scritto — cieco non è verde");
  const rotta = patchConfermata({ rcCurl: 0, corpo: "<html>502</html>" });
  assert.equal(rotta.confermata, false, "una risposta illeggibile non è una conferma");
});

prova("AR-631 (runtime): la PATCH che tocca ZERO righe ricovera l'esito invece di buttarlo", () => {
  // Il caso vero della scheda, eseguito: la sentinella ha già chiuso il lavoro, il filtro
  // `stato=eq.in_corso` non trova più niente, PostgREST risponde 2xx con `[]`. Prima del 13/8 la
  // funzione tornava 0, scartava il ricovero e stampava «esito scritto»: l'esito di un'azione
  // GIÀ ESEGUITA spariva, e il doppio invio lo causava la difesa nata per impedirlo.
  const dir = mkdtempSync(join(tmpdir(), "patch-vuota-"));
  mkdirSync(join(dir, "repo/.git"), { recursive: true });
  mkdirSync(join(dir, "bin"), { recursive: true });
  writeFileSync(join(dir, "bin/curl"), '#!/usr/bin/env bash\nprintf "%s" "[]"\nexit 0\n');
  chmodSync(join(dir, "bin/curl"), 0o755);

  const r = bash(
    `set -uo pipefail
     export PATH="${join(dir, "bin")}:$PATH"
     ts(){ echo ORA; }
     REPO="${join(dir, "repo")}"; SCRIPT_DIR="${join(REPO, "cervello")}"
     SUPABASE_URL=http://finto; AUTH=(-H "apikey: x"); ESITO_TENTATIVI=3
     . "${join(REPO, "cervello/lib-esito-lavoro.sh")}"
     scrivi_esito_lavoro 999 '{"stato":"fatto","risultato":"azione VERA gia partita"}' esito
     echo "RITORNO=$?"`,
  );
  assert.match(r.out, /RITORNO=1/, "la funzione ha dichiarato scritto un esito che il database non ha mai preso");

  const ricoveri = readdirSync(join(dir, "repo/.git/mycity-esito-ricovero"));
  assert.deepEqual(ricoveri, ["999.json"], "l'esito non è stato ricoverato: è andato perso");
  const salvato = JSON.parse(readFileSync(join(dir, "repo/.git/mycity-esito-ricovero/999.json"), "utf8"));
  assert.match(salvato.body.risultato, /azione VERA gia partita/, "il ricovero non contiene l'esito vero");

  // E non deve aver bruciato i tre tentativi: una PATCH a vuoto è definitiva, non transitoria.
  const patch = (r.out.match(/tentativo \d+\/3/g) || []).length;
  assert.equal(patch, 0, `ha ritentato ${patch} volte una PATCH che non può riuscire: 14 secondi buttati`);
});

prova("AR-631: la chiamata chiede la rappresentazione, o la decisione sarebbe cieca per contratto", () => {
  const lib = readFileSync(join(REPO, "cervello/lib-esito-lavoro.sh"), "utf8");
  assert.match(lib, /Prefer: return=representation/,
    "senza questa intestazione il corpo è vuoto per contratto e «zero righe» torna indistinguibile da «scritto»");
  assert.match(lib, /patch-confermata/, "la scrittura non passa più dalla decisione");
  assert.doesNotMatch(lib, /if curl -fsS -X PATCH .*stato=eq\.in_corso.*; then/,
    "è tornato il ramo che giudica dal solo codice d'uscita di curl");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
