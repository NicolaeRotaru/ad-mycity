#!/usr/bin/env node
// 🧪 IL LUCCHETTO CHE HA SPENTO IL WORKER PRINCIPALE PER DUE GIORNI.
//
// Il 18/8/2026 alle 04:34 il commit add07ee ha messo un flock di istanza singola in cima a
// `cervello/worker.sh` per impedire a due copie dello stesso script di girare insieme (il giorno
// prima ne erano partite due e avevano prodotto 2.160 commit vuoti in due ore). Il lucchetto però
// è UNO SOLO per tutto il file — `.worker.lock` — mentre lo stesso script lo eseguono DUE servizi
// diversi, che si distinguono solo per la variabile WORKER_LANE:
//   mycity-worker.service       → WORKER_LANE=all   (giro, ritmo, analisi, azioni)
//   mycity-worker-chat.service  → WORKER_LANE=chat  (solo le chat del Pannello)
// Alle 04:46 la corsia `all` ha battuto per l'ultima volta e non è più ripartita: la corsia `chat`
// teneva il lucchetto, e ogni riavvio di `all` moriva sulla riga del flock.
//
// Perché nessuno se n'è accorto: il ramo che perde esce con `exit 0` — di proposito, «per non far
// sembrare questo un guasto del servizio». Il risultato è che il guasto NON sembrava un guasto. La
// coda ha accumulato sedici lavori mai presi in carico (tentativi=0, worker_owner=null), la memoria
// non si pubblica dal 18/8 alle 08:36, e il Pannello ha mostrato gli stessi numeri per due giorni.
//
// Questa prova gira due processi VERI sullo stesso lucchetto: fallisce se le due corsie tornano a
// escludersi a vicenda, e non può passare per finta perché guarda chi si avvia davvero, non il testo
// dello script.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const WORKER = join(QUI, "..", "worker.sh");
const HA_FLOCK = spawnSync("sh", ["-c", "command -v flock"], { encoding: "utf8" }).status === 0;

/** Ritaglia dal worker vero il blocco del lucchetto: dal commento marcatore alla sua `fi`. */
function bloccoLucchetto() {
  const righe = readFileSync(WORKER, "utf8").split("\n");
  const da = righe.findIndex((r) => r.includes("ISTANZA SINGOLA"));
  assert.notEqual(da, -1, "il blocco «ISTANZA SINGOLA» non esiste più in worker.sh: la prova va riscritta, non cancellata");
  const a = righe.findIndex((r, i) => i > da && r.trim() === "fi");
  assert.notEqual(a, -1, "blocco del lucchetto senza `fi`: non riesco a ritagliarlo");
  return righe.slice(da, a + 1).join("\n");
}

/** Un finto worker: SOLO il lucchetto vero, poi dice di essersi avviato e resta vivo. */
function scriviFintoWorker(dir) {
  const f = join(dir, "finto-worker.sh");
  writeFileSync(
    f,
    [
      "#!/usr/bin/env bash",
      "set -uo pipefail",
      `SCRIPT_DIR="${dir}"`,
      bloccoLucchetto(),
      "echo AVVIATO",
      "exec 1>&- 2>&-", // chiude i tubi: chi legge sa già tutto, e il runner non resta appeso al sleep
      `sleep "\${VIVO_SEC:-5}"`,
      "",
    ].join("\n"),
  );
  return f;
}

/** Avvia una corsia e aspetta l'esito: `avviato` (ha preso il lucchetto) o `escluso` (è uscito subito). */
function avviaCorsia(script, lane, { attesaMs = 8000 } = {}) {
  const p = spawn("bash", [script], { env: { ...process.env, WORKER_LANE: lane }, stdio: ["ignore", "pipe", "pipe"] });
  return new Promise((risolvi) => {
    let out = "";
    const finito = (esito) => risolvi({ esito, processo: p, out });
    const scadenza = setTimeout(() => finito("appeso"), attesaMs);
    p.stdout.on("data", (d) => {
      out += d;
      if (out.includes("AVVIATO")) {
        clearTimeout(scadenza);
        finito("avviato");
      }
    });
    p.on("exit", (code) => {
      clearTimeout(scadenza);
      if (!out.includes("AVVIATO")) finito(code === 0 ? "escluso" : `morto(${code})`);
    });
  });
}

test("le due corsie (all e chat) si avviano INSIEME: il lucchetto è per corsia, non per file", { skip: HA_FLOCK ? false : "flock non installato su questa macchina" }, async () => {
  const dir = mkdtempSync(join(tmpdir(), "lucchetto-"));
  const script = scriviFintoWorker(dir);
  const vivi = [];
  try {
    const chat = await avviaCorsia(script, "chat");
    vivi.push(chat.processo);
    assert.equal(chat.esito, "avviato", "la prima corsia deve partire: se non parte questa, la prova non sta misurando niente");

    const all = await avviaCorsia(script, "all");
    vivi.push(all.processo);
    assert.equal(
      all.esito,
      "avviato",
      "la corsia `all` è rimasta fuori mentre `chat` era viva — è il guasto del 18/8: il worker principale non riparte più e la memoria smette di pubblicarsi",
    );
  } finally {
    for (const p of vivi) p.kill("SIGKILL");
    rmSync(dir, { recursive: true, force: true });
  }
});

test("due copie della STESSA corsia restano escluse: il lucchetto continua a fare il suo mestiere", { skip: HA_FLOCK ? false : "flock non installato su questa macchina" }, async () => {
  // Il motivo per cui il lucchetto esiste non deve sparire con la cura: due `all` insieme sono
  // quelle che il 17/8 hanno scritto 2.160 commit vuoti accavallandosi sugli stessi file.
  const dir = mkdtempSync(join(tmpdir(), "lucchetto-"));
  const script = scriviFintoWorker(dir);
  const vivi = [];
  try {
    const primo = await avviaCorsia(script, "all");
    vivi.push(primo.processo);
    assert.equal(primo.esito, "avviato");

    const secondo = await avviaCorsia(script, "all");
    vivi.push(secondo.processo);
    assert.equal(secondo.esito, "escluso", "una seconda copia della stessa corsia NON deve avviarsi");
  } finally {
    for (const p of vivi) p.kill("SIGKILL");
    rmSync(dir, { recursive: true, force: true });
  }
});

test("il lucchetto porta il nome della corsia: due corsie, due file diversi", () => {
  // Prova strutturale a supporto delle due comportamentali: dice DOVE guardare quando una di quelle
  // diventa rossa. Da sola non basterebbe — infatti non è da sola.
  const blocco = bloccoLucchetto();
  assert.match(blocco, /WORKER_LANE/, "il percorso del lucchetto deve dipendere dalla corsia");
  assert.doesNotMatch(
    blocco,
    /\.worker\.lock"/,
    "un lucchetto chiamato `.worker.lock` è lo stesso file per tutte e due le corsie: è il difetto del 18/8",
  );
});
