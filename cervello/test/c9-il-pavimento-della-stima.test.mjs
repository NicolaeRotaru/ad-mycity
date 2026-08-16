// AR-203 — «La stima del consumo è un pavimento fisso: due cadenze diversissime registrano lo
// stesso identico numero.»
//
// Questo difetto era GIÀ STATO CHIUSO una volta, e la prova che lo chiuse cercava le parole
// «usage/token_reali» dentro motore-ai.sh: faceva centro su un COMMENTO. Il comportamento non era
// mai cambiato. Perciò qui non si cerca niente in nessun file: si ESEGUE.
//
// Cosa prova, in ordine:
//   ① dallo stream-json della CLI si tira fuori l'usage vero (result.usage, e in ripiego la somma
//      dei messaggi assistant);
//   ② due corsie diverse con lo stesso identico numero vengono NOMINATE — è il sintomo del
//      pavimento, e adesso è un numero invece che un sospetto;
//   ③ IL PUNTO: `ai_registra_costo` in bash, con un transcript che porta l'usage, registra il
//      numero vero SENZA `--stima`; senza transcript ricade sulla stima e la dichiara.
//
// NON-VACUITÀ (eseguita): togliendo il ramo misurato da `ai_registra_costo` (cioè rimettendo
// sempre `--stima`), il caso ③ diventa rosso.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { coperturaMisura, stimeGemelle, usageDaStream } from "../conto-motore.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");

// ── ① Il numero vero c'era, nello stream, e nessuno l'aveva guardato ─────────────────────────────

test("AR-203 — dall'evento result dello stream-json esce l'usage misurato, non una stima", () => {
  const stream = [
    '{"type":"system","subtype":"init"}',
    '{"type":"assistant","message":{"usage":{"input_tokens":10,"output_tokens":3}}}',
    '{"type":"result","usage":{"input_tokens":1200,"output_tokens":345,"cache_read_input_tokens":55}}',
  ].join("\n");
  const u = usageDaStream(stream);
  assert.equal(u.misurato, true, "l'usage c'era e non è stato letto");
  assert.equal(u.totale, 1200 + 55 + 345, "il totale deve contare anche la cache: è input che si paga");
  assert.match(u.fonte, /result\.usage/);
});

test("AR-203 — se manca il result si sommano i messaggi assistant, e resta una MISURA", () => {
  const stream = [
    '{"type":"assistant","message":{"usage":{"input_tokens":100,"output_tokens":20}}}',
    '{"type":"assistant","message":{"usage":{"input_tokens":50,"output_tokens":8}}}',
  ].join("\n");
  const u = usageDaStream(stream);
  assert.equal(u.misurato, true);
  assert.equal(u.totale, 178);
});

test("AR-203 — righe incomplete e senza usage: non si inventa un numero, si dice che non c'è", () => {
  const u = usageDaStream('{"type":"system"}\n{"type":"assist');
  assert.equal(u.misurato, false);
  assert.equal(u.totale, 0);
  assert.match(u.fonte, /nessun usage/);
});

// ── ② Il sintomo, reso un numero ────────────────────────────────────────────────────────────────

test("AR-203 — due CORSIE diverse con lo stesso identico numero vengono pescate e nominate", () => {
  const voci = [
    { tipo: "giro", token: 50000, stima_grezza: true },
    { tipo: "ritmo-mattino", token: 50000, stima_grezza: true },
    { tipo: "worker-analisi", token: 137421 },
  ];
  const g = stimeGemelle(voci);
  assert.equal(g.length, 1, "la coppia giro/ritmo con lo stesso numero doveva saltare fuori");
  assert.deepEqual(g[0].tipi, ["giro", "ritmo-mattino"]);
  assert.equal(g[0].e_il_pavimento, true, "50.000 è esattamente il pavimento di ai_stima_token");
});

test("AR-203 — due run della STESSA corsia con lo stesso numero non sono un sintomo", () => {
  const g = stimeGemelle([
    { tipo: "giro", token: 50000 },
    { tipo: "giro", token: 50000 },
  ]);
  assert.deepEqual(g, [], "lo stesso lavoro fatto due volte può costare uguale: non è il pavimento");
});

test("AR-203 — la copertura distingue MISURATO da stimato (prima diceva 100% contando i numeri)", () => {
  const c = coperturaMisura([
    { tipo: "giro", token: 50000, stima_grezza: true },
    { tipo: "chat", token: 12345 },
    { tipo: "vuoto" },
  ]);
  assert.equal(c.run, 3);
  assert.equal(c.misurati, 1);
  assert.equal(c.stimati, 1);
  assert.equal(c.al_pavimento, 1);
  assert.equal(c.copertura_pct, 50, "1 misurato su 2 run con un numero = 50%, non 100%");
});

// ── ③ IL PUNTO: cosa registra davvero la macchina ───────────────────────────────────────────────

/**
 * Lancia `ai_registra_costo` di motore-ai.sh con un `node` finto sul PATH, che scrive gli argomenti
 * di ogni chiamata in un file-spia. Le chiamate a `conto-motore.mjs` le passa al node vero: quello
 * è il pezzo che stiamo provando, non un finto.
 */
function registraCosto({ conStream }) {
  const dir = mkdtempSync(join(tmpdir(), "c9-costo-"));
  const spia = join(dir, "spia.txt");
  const nodeVero = process.execPath;

  const finto = join(dir, "node");
  writeFileSync(
    finto,
    `#!/bin/sh
case "$1" in
  *conto-motore.mjs) exec "${nodeVero}" "$@" ;;
esac
printf '%s\\n' "$*" >> "${spia}"
exit 0
`
  );
  chmodSync(finto, 0o755);

  let stream = "";
  if (conStream) {
    stream = join(dir, "transcript.jsonl");
    writeFileSync(stream, '{"type":"result","usage":{"input_tokens":7000,"output_tokens":1500}}\n');
  }

  const r = spawnSync(
    "bash",
    ["-c", `. "${join(CERVELLO, "motore-ai.sh")}" && ai_registra_costo "prova-corsia" "$(date +%s)" "prompt" "output" "${stream}"`],
    { encoding: "utf8", env: { ...process.env, PATH: `${dir}:${process.env.PATH}` }, timeout: 60_000 }
  );
  assert.equal(r.status, 0, `ai_registra_costo è uscito male: ${r.stderr}`);
  return spawnSync("cat", [spia], { encoding: "utf8" }).stdout || "";
}

test("AR-203 — IL PUNTO: con l'usage nel transcript si registra il numero VERO, senza --stima", () => {
  const chiamata = registraCosto({ conStream: true });
  assert.match(chiamata, /costo-ai\.mjs/, "costo-ai non è stato nemmeno chiamato");
  assert.match(chiamata, /--token=8500\b/, "doveva registrare 7000+1500 misurati, non un pavimento");
  assert.doesNotMatch(chiamata, /--stima/, "una MISURA registrata come stima resta fuori da token_totali: vale zero per i gate");
});

test("AR-203 — senza transcript la stima resta, e resta DICHIARATA come tale", () => {
  const chiamata = registraCosto({ conStream: false });
  assert.match(chiamata, /--stima/, "una stima spacciata per misura sarebbe la bugia opposta");
  assert.match(chiamata, /--token=50000\b/, "senza misura ricade sul pavimento di ai_stima_token, com'era");
});
