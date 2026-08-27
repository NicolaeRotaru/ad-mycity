#!/usr/bin/env node
// AR-838 — «Il tetto di spesa per negozio è collegato, ma non lo alimenta nessun contatore.»
//
// Nato riparando AR-804: collegando il turno, il tetto ha trovato la sua porta — `statoSpesa` sa
// fermare una corsia che ha finito il tetto, e il worker adesso la interroga davvero — e nessuno
// che ci passasse. `speso` arrivava solo se qualcuno lo scriveva a mano nelle impostazioni, e non
// lo scriveva nessuno: la spesa AI per negozio non la contava nessun pezzo della macchina.
// Un tetto che nessuno alimenta non è un freno: è un cartello.
//
// La prova ESEGUE il comando vero (`costo-ai.mjs`) su un registro suo, poi fa girare la presa vera
// (`worker-coda.sh`) con un curl finto, e guarda se il lavoro parte. Non rilegge nessun file.
//
// LA MISURA È IN TOKEN, non in euro, e il motivo è che in casa non esiste nessun listino che li
// converta. Inventarlo sarebbe un numero senza fonte.
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";
import { spesaPerNegozio, spesoDaFrenare, CENTRO } from "../costo-ai.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

/** Il registro dei costi, scritto dal comando VERO. Torna il percorso del file. */
function registro(voci = []) {
  const dir = mkdtempSync(join(tmpdir(), "costo-negozi-"));
  const file = join(dir, "costo-ai.json");
  for (const v of voci) {
    const args = ["costo-ai.mjs", `--tipo=${v.tipo || "worker-analisi"}`, `--durata-sec=${v.durata || 5}`, `--token=${v.token}`];
    if (v.negozio) args.push(`--negozio=${v.negozio}`);
    if (v.stima) args.push("--stima");
    execFileSync("node", args, { cwd: CERVELLO, env: { ...process.env, COSTO_AI_FILE: file }, stdio: "ignore" });
  }
  return file;
}

const spesaLetta = (file) =>
  JSON.parse(execFileSync("node", ["costo-ai.mjs", "--spesa-negozi"], {
    cwd: CERVELLO,
    env: { ...process.env, COSTO_AI_FILE: file },
    encoding: "utf8",
  }));

/** La presa VERA, con un curl finto e il registro dei costi che gli passiamo. */
function prendi({ coda = [], impostazioni = [], inCorso = [], costi = "" } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "tetto-worker-"));
  mkdirSync(join(dir, "bin"), { recursive: true });
  const codaFile = join(dir, "coda.json");
  writeFileSync(codaFile, JSON.stringify(coda));
  const j = (x) => JSON.stringify(x).replace(/'/g, "'\\''");
  writeFileSync(
    join(dir, "bin/curl"),
    `#!/usr/bin/env bash
url=""
for a in "$@"; do case "$a" in http*) url="$a";; esac; done
case "$url" in
  *tipo=eq.chat*)      printf '%s' '[]';;
  *stato=eq.in_corso*) printf '%s' '${j(inCorso)}';;
  *impostazioni*)      printf '%s' '${j(impostazioni)}';;
  *negozio_id=eq.*)
    n="\${url##*negozio_id=eq.}"; n="\${n%%&*}"
    jq -c --arg n "$n" '[.[]|select(.negozio_id==$n)][0:1]' '${codaFile}';;
  *select=negozio_id*) jq -c '[.[]|{negozio_id}]' '${codaFile}';;
  *stato=eq.in_attesa*) jq -c '.[0:1]' '${codaFile}';;
  *)                   printf '%s' '[]';;
esac
exit 0
`,
    { mode: 0o755 },
  );
  chmodSync(join(dir, "bin/curl"), 0o755);
  const copione = `
set -uo pipefail
SCRIPT_DIR='${CERVELLO}'
SUPABASE_URL='https://finto.invalid'
AUTH=(-H 'apikey: finta')
WORKER_LANE=''
_rtry=''
ts() { echo '00:00'; }
. "$SCRIPT_DIR/worker-coda.sh"
coda_prossima_riga
echo "SCELTO:$(printf '%s' "$CODA_RIGA" | jq -r '.[0].id // ""')"
echo "MOTIVO:$MOTIVO_CODA"
`;
  const fuori = execFileSync("bash", ["-c", copione], {
    encoding: "utf8",
    env: { ...process.env, PATH: `${join(dir, "bin")}:${process.env.PATH}`, ...(costi ? { COSTO_AI_FILE: costi } : {}) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  return {
    id: (fuori.match(/^SCELTO:(.*)$/m) || [])[1] ?? "",
    motivo: (fuori.match(/^MOTIVO:(.*)$/m) || [])[1] ?? "",
  };
}

const conTetto = (id, tetto) => ({ chiave: `bottega:negozio:${id}`, valore: JSON.stringify({ tetto }) });

// ─────────────────────────────────────────────────────────────────────────────
// ① IL DIFETTO: il tetto adesso ha chi lo alimenta
// ─────────────────────────────────────────────────────────────────────────────
prova("due lavori che superano il tetto e il terzo non parte", () => {
  const costi = registro([
    { negozio: "forno-a", token: 600 },
    { negozio: "forno-a", token: 500 },
  ]);
  assert.deepEqual(spesaLetta(costi), { "forno-a": 1100 }, "il contatore non ha sommato i due lavori");
  const r = prendi({
    coda: [{ id: "a1", negozio_id: "forno-a" }],
    impostazioni: [conTetto("forno-a", 1000)],
    costi,
  });
  assert.equal(r.id, "", "il negozio ha finito il tetto e ha lavorato lo stesso");
  assert.match(r.motivo, /tetto finito/, `il motivo deve dire che è il tetto, non altro: «${r.motivo}»`);
  assert.doesNotMatch(r.motivo, /quota piena/, "motivo sbagliato: manda a cercare nel posto sbagliato");
});

prova("sotto il tetto si lavora, e il conto è quello contato", () => {
  const costi = registro([{ negozio: "forno-a", token: 100 }]);
  const r = prendi({
    coda: [{ id: "a1", negozio_id: "forno-a" }],
    impostazioni: [conTetto("forno-a", 1000)],
    costi,
  });
  assert.equal(r.id, "a1", `doveva lavorare: «${r.motivo}»`);
});

prova("la spesa CONTATA batte quella dichiarata a mano nelle impostazioni", () => {
  // Nelle impostazioni c'è scritto «ho speso 0». Il contatore dice 1.100. Vince la misura.
  const costi = registro([{ negozio: "forno-a", token: 1100 }]);
  const r = prendi({
    coda: [{ id: "a1", negozio_id: "forno-a" }],
    impostazioni: [{ chiave: "bottega:negozio:forno-a", valore: JSON.stringify({ tetto: 1000, speso: 0 }) }],
    costi,
  });
  assert.equal(r.id, "", "una dichiarazione a mano ha scavalcato il contatore");
  assert.match(r.motivo, /tetto finito/);
});

// ─────────────────────────────────────────────────────────────────────────────
// ② UNA STIMA NON È UNA MISURA
// ─────────────────────────────────────────────────────────────────────────────
prova("una stima non fa scattare il tetto: un freno su un pavimento non è un freno", () => {
  const costi = registro([{ negozio: "forno-a", token: 5000, stima: true }]);
  assert.deepEqual(spesaLetta(costi), {}, "una stima è finita nel numero su cui si frena");
  const r = prendi({
    coda: [{ id: "a1", negozio_id: "forno-a" }],
    impostazioni: [conTetto("forno-a", 1000)],
    costi,
  });
  assert.equal(r.id, "a1", "un negozio è stato fermato da un numero che nessuno ha misurato");
});

prova("la stima resta visibile accanto alla misura, non sparisce", () => {
  const spesa = spesaPerNegozio(
    [
      { quando: "2026-08-26 12:00", negozio: "forno-a", token: 100 },
      { quando: "2026-08-26 12:01", negozio: "forno-a", token: 900, stima_grezza: true },
    ],
    Date.parse("2026-08-26T12:02:00"),
  );
  assert.deepEqual(spesa["forno-a"], { misurato: 100, stimato: 900 });
  assert.deepEqual(spesoDaFrenare(spesa), { "forno-a": 100 });
});

prova("uno «zero misurato» non copre la spesa dichiarata a mano", () => {
  // Un negozio con sole stime ha misurato zero: vero, e non dice niente. Se quello zero uscisse dal
  // contatore andrebbe a coprire un `speso` scritto nelle impostazioni — una conoscenza che il
  // registro non ha, per esempio la spesa di prima della finestra. È la differenza fra una misura e
  // un pavimento (AR-746).
  const costi = registro([{ negozio: "forno-a", token: 5000, stima: true }]);
  assert.deepEqual(spesaLetta(costi), {}, "uno zero misurato è uscito dal contatore");
  const r = prendi({
    coda: [{ id: "a1", negozio_id: "forno-a" }],
    impostazioni: [{ chiave: "bottega:negozio:forno-a", valore: JSON.stringify({ tetto: 1000, speso: 1000 }) }],
    costi,
  });
  assert.equal(r.id, "", "la dichiarazione a mano è stata cancellata da uno zero che non è una misura");
  assert.match(r.motivo, /tetto finito/);
});

// ─────────────────────────────────────────────────────────────────────────────
// ③ NESSUNA VOCE SENZA PADRONE
// ─────────────────────────────────────────────────────────────────────────────
prova("una voce che non dice il negozio è del centro, non di nessuno", () => {
  const costi = registro([{ token: 700 }]);
  assert.deepEqual(spesaLetta(costi), { [CENTRO]: 700 }, "una spesa è rimasta senza padrone");
});

prova("il negozio di un lavoro non eredita quello del lavoro prima", () => {
  // Se `AI_NEGOZIO` sopravvivesse al lavoro, la spesa del prossimo verrebbe addebitata al negozio
  // di quello di prima — e un tetto che ferma la corsia sbagliata è peggio di un tetto che non c'è.
  const igiene = execFileSync("node", ["c4-cancelli.mjs", "igiene-lavoro"], { cwd: CERVELLO, encoding: "utf8" });
  assert.match(igiene, /\bAI_NEGOZIO\b/, "AI_NEGOZIO non è fra le variabili che si spengono a ogni lavoro");
});

// ─────────────────────────────────────────────────────────────────────────────
prova("un registro illeggibile non diventa «ha speso zero»", () => {
  const dir = mkdtempSync(join(tmpdir(), "costo-rotto-"));
  const file = join(dir, "costo-ai.json");
  writeFileSync(file, "{rotto");
  // Il comando non deve esplodere, e non deve nemmeno inventare un conto: torna vuoto, e con il
  // registro vuoto il tetto non scatta — ma nemmeno si dichiara rispettato.
  assert.deepEqual(spesaLetta(file), {});
});

const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "ok" : "NON ok"} — ${c.nome}${c.ok ? "" : `\n   ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} passate`);
if (rotte.length) process.exit(1);
