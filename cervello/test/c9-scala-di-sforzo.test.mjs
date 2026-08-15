// AR-198 — «Anche riassumere una chat gira sul modello più caro, e la macchina lo sa.»
//
// La radice: la scelta del modello era un INTERRUTTORE (premium / niente) invece di una scala di
// sforzo per compito — mentre l'infrastruttura per la scala (AI_THINKING per-lavoro, --model
// per-corsia) esisteva già ed era usata a metà.
//
// Cosa prova, in ordine:
//   ① la decisione è pura e la si può eseguire: volume → gradino leggero, ragionamento → pieno;
//   ② IL PALETTO: senza `CERVELLO_MODELLO_ECONOMICO` dichiarato non si cambia NIENTE — un ripiego
//      inventato cambierebbe la qualità delle note senza che nessuno l'abbia deciso;
//   ③ IL PUNTO: `ai_build_cmd` in bash mette davvero `--model` leggero sulla corsia di volume, e
//      quello pieno su chat/giro. È il comportamento, non un commento.
//
// NON-VACUITÀ (eseguita): rimettendo `--model "$CERVELLO_MODELLO"` fisso in ai_build_cmd, il caso
// ③ sulla corsia di volume diventa rosso.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { sforzoPerCorsia } from "../conto-motore.mjs";

const CERVELLO = join(dirname(fileURLToPath(import.meta.url)), "..");

// ── ① La scala, eseguita ────────────────────────────────────────────────────────────────────────

test("AR-198 — metabolizzare è volume: gradino leggero e niente budget di pensiero", () => {
  const s = sforzoPerCorsia({ compito: "testi-volume", modelloPremium: "grande", modelloEconomico: "piccolo" });
  assert.equal(s.livello, "volume");
  assert.equal(s.modello, "piccolo");
  assert.equal(s.thinking, 0);
});

test("AR-198 — la chat e il giro restano sul modello pieno: lì si decide", () => {
  const s = sforzoPerCorsia({ corsia: "chat", compito: "ragionamento", modelloPremium: "grande", modelloEconomico: "piccolo" });
  assert.equal(s.livello, "ragionamento");
  assert.equal(s.modello, "grande");
  assert.equal(s.thinking, null, "il pensiero non si tocca dove si ragiona");
});

test("AR-198 — chi ha già spento il pensiero ha già detto «qui non si ragiona»", () => {
  const s = sforzoPerCorsia({ corsia: "worker-analisi", thinking: "0", modelloPremium: "grande", modelloEconomico: "piccolo" });
  assert.equal(s.livello, "volume", "AI_THINKING=0 è una dichiarazione del chiamante, e va ascoltata");
});

// ── ② IL PALETTO ────────────────────────────────────────────────────────────────────────────────

test("AR-198 — senza un modello economico DICHIARATO non si cambia niente, e lo si dice", () => {
  const s = sforzoPerCorsia({ compito: "testi-volume", modelloPremium: "grande", modelloEconomico: "" });
  assert.equal(s.modello, "grande", "inventare un ripiego cambierebbe la qualità senza che nessuno l'abbia deciso");
  assert.equal(s.economico_disponibile, false);
  assert.match(s.perche, /non è dichiarato/, "il «non l'ho fatto e perché» va detto, non taciuto");
});

// ── ③ IL PUNTO: cosa costruisce davvero bash ────────────────────────────────────────────────────

function comandoCostruito(env) {
  const r = spawnSync("bash", ["-c", `. "${join(CERVELLO, "motore-ai.sh")}" && ai_build_cmd && printf '%s\\n' "\${AI_CMD[@]}"`], {
    encoding: "utf8",
    env: { ...process.env, CERVELLO_MOTORE: "claude", CERVELLO_CLAUDE_AUTH_CHECK: "0", ...env },
    timeout: 60_000,
  });
  assert.equal(r.status, 0, `ai_build_cmd è uscito male: ${r.stderr}`);
  return r.stdout.split("\n").filter(Boolean);
}

test("AR-198 — IL PUNTO: sulla corsia di volume il comando porta il modello leggero", () => {
  const cmd = comandoCostruito({ ROUTER_COMPITO_JOB: "testi-volume", CERVELLO_MODELLO: "modello-grande", CERVELLO_MODELLO_ECONOMICO: "modello-piccolo" });
  const i = cmd.indexOf("--model");
  assert.notEqual(i, -1, "nessun --model: la leva non è stata tirata");
  assert.equal(cmd[i + 1], "modello-piccolo", "un riassunto non deve pagare il modello del ragionamento");
});

test("AR-198 — sulla chat il comando resta sul modello pieno", () => {
  const cmd = comandoCostruito({ CERVELLO_MODELLO: "modello-grande", CERVELLO_MODELLO_ECONOMICO: "modello-piccolo" });
  const i = cmd.indexOf("--model");
  assert.equal(cmd[i + 1], "modello-grande", "degradare la chat era la causa delle risposte scarse: non si tocca");
});

test("AR-198 — senza modello economico nel .env il comando è identico a com'era", () => {
  const cmd = comandoCostruito({ ROUTER_COMPITO_JOB: "testi-volume", CERVELLO_MODELLO: "modello-grande" });
  const i = cmd.indexOf("--model");
  assert.equal(cmd[i + 1], "modello-grande");
});

test("AR-198 — AI_MODELLO messo a mano dal chiamante comanda su tutto", () => {
  const cmd = comandoCostruito({ ROUTER_COMPITO_JOB: "testi-volume", AI_MODELLO: "scelto-a-mano", CERVELLO_MODELLO: "grande", CERVELLO_MODELLO_ECONOMICO: "piccolo" });
  const i = cmd.indexOf("--model");
  assert.equal(cmd[i + 1], "scelto-a-mano");
});

test("AR-198 — l'ordine obbligatorio non è cambiato: --allowedTools prima di --permission-mode", () => {
  // Guardia sul bug del 2026-07-09/10: --allowedTools è variadico e si mangia il prompt se resta
  // ultimo. Il --model nuovo va DOPO --permission-mode, che chiude la lista.
  const cmd = comandoCostruito({ CERVELLO_MODELLO: "grande", CERVELLO_MODELLO_ECONOMICO: "piccolo" });
  const a = cmd.indexOf("--allowedTools");
  const p = cmd.indexOf("--permission-mode");
  assert.ok(a === -1 || a < p, "se --allowedTools finisse dopo --permission-mode ogni lavoro morirebbe alla partenza");
});
