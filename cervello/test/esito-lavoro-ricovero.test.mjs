#!/usr/bin/env node
// AR-397 — «Il risultato di un lavoro si scrive una volta sola: se quella volta va storta, un'azione
// già partita torna in coda.»
//
// Il danno non è il record perso: è che il lavoro resta `in_corso`, la sentinella dopo la soglia lo
// chiude in errore con «potrebbe essere già partita → riapprova dal Pannello», e la regola nata per
// evitare il doppio invio ne diventa la causa — perché l'azione ERA riuscita e non lo sa più nessuno.
//
// Questa prova ESEGUE le mani vere (`cervello/lib-esito-lavoro.sh`) con un `curl` finto che fallisce
// a comando, e guarda il DISCO: c'è il ricovero? sparisce quando il database conferma? viene
// ripubblicato quando il worker ritorna? Un grep su worker.sh non distinguerebbe nulla di tutto ciò.
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, rmSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";
import { attesaRitentativo, decidiRipubblicazione } from "../esito-scrittura.mjs";
import { decidiOrfano } from "../retry-policy.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");
const LIB = join(CERVELLO, "lib-esito-lavoro.sh");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

/**
 * Un banco di prova con: un repo finto (REPO/.git), un `curl` finto in PATH che decide di volta in
 * volta se riuscire o fallire, e un registro delle chiamate — così si vede DAVVERO quante volte
 * l'esito è stato ritentato e con quale corpo.
 */
/**
 * @param falliPrimi   quante PATCH falliscono prima di riuscire (curl esce ≠0: la richiesta non arriva)
 * @param rispostaGet  il JSON con cui rispondono le GET ("" = illeggibile, cioè «non ho potuto guardare»)
 * @param righeToccate AR-631 — quante righe la PATCH dichiara di aver aggiornato quando riesce.
 *        0 = il caso vero del difetto: 2xx con `[]` perché il filtro `stato=eq.in_corso` non trova
 *        più niente (la sentinella ha già chiuso il lavoro mentre l'azione girava). Prima del 13/8
 *        quel caso era indistinguibile da un successo.
 */
function banco({ falliPrimi = 0, rispostaGet = "", righeToccate = 1 } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "esito-lavoro-"));
  mkdirSync(join(dir, "repo/.git"), { recursive: true });
  mkdirSync(join(dir, "bin"), { recursive: true });
  const log = join(dir, "curl.log");
  const contatore = join(dir, "curl.count");
  writeFileSync(contatore, "0");
  // curl finto: registra la chiamata; le prime `falliPrimi` PATCH falliscono; le GET rispondono
  // con il JSON che gli passiamo (vuoto = risposta illeggibile, cioè «non ho potuto guardare»).
  writeFileSync(
    join(dir, "bin/curl"),
    `#!/usr/bin/env bash
echo "$*" >> "${log}"
if printf '%s' "$*" | grep -q -- "-X PATCH"; then
  n=$(( $(cat "${contatore}") + 1 ))
  echo "$n" > "${contatore}"
  if [ "$n" -le ${falliPrimi} ]; then exit 22; fi
  # AR-631: con Prefer return=representation PostgREST risponde con le righe toccate. Il finto
  # deve dire la stessa cosa, o il banco proverebbe un contratto che il vero non ha.
  printf '%s' '${righeToccate > 0 ? JSON.stringify(Array.from({ length: righeToccate }, (_, i) => ({ id: `r${i}` }))) : "[]"}'
  exit 0
fi
printf '%s' '${rispostaGet}'
exit 0
`,
  );
  chmodSync(join(dir, "bin/curl"), 0o755);
  return {
    dir,
    repo: join(dir, "repo"),
    log: () => (existsSync(log) ? readFileSync(log, "utf8") : ""),
    patch: () => ((existsSync(log) ? readFileSync(log, "utf8") : "").match(/-X PATCH/g) || []).length,
    ricoveri: () => {
      const d = join(dir, "repo/.git/mycity-esito-ricovero");
      return existsSync(d) ? readdirSync(d) : [];
    },
    pulisci: () => rmSync(dir, { recursive: true, force: true }),
  };
}

function sh(b, corpo, extraEnv = "") {
  const script = `set -uo pipefail
exec 2>&1   # qui i due canali si possono unire: la prova guarda il DISCO e le chiamate, non il canale
export PATH="${join(b.dir, "bin")}:$PATH"
REPO="${b.repo}"; SCRIPT_DIR="${CERVELLO}"
SUPABASE_URL="http://finto"; AUTH=(-s)
ESITO_TENTATIVI=2
${extraEnv}
ts() { echo "ORA"; }
cd "$REPO"
. "${LIB}"
${corpo}`;
  try {
    return { rc: 0, out: execFileSync("bash", ["-c", script], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (e) {
    return { rc: e.status, out: (e.stdout || "") + (e.stderr || "") };
  }
}

// ── la testa ─────────────────────────────────────────────────────────────────
prova("AR-397: l'attesa fra i tentativi cresce e ha un tetto", () => {
  assert.equal(attesaRitentativo({ tentativo: 1 }), 2);
  assert.equal(attesaRitentativo({ tentativo: 2 }), 4);
  assert.equal(attesaRitentativo({ tentativo: 3 }), 8);
  assert.ok(attesaRitentativo({ tentativo: 12 }) <= 30, "senza tetto un ritentativo diventa un blocco");
});

prova("AR-397: un lavoro chiuso in errore dalla sentinella si RISCRIVE (è il caso del doppio invio)", () => {
  assert.equal(decidiRipubblicazione({ statoAttuale: "errore", statoRicoverato: "fatto" }).azione, "scrivi");
});

prova("AR-397: se non riesco a leggere lo stato, il ricovero NON si butta", () => {
  assert.equal(decidiRipubblicazione({ statoAttuale: "" }).azione, "attendi");
  assert.equal(decidiRipubblicazione({ statoAttuale: "boh" }).azione, "attendi");
});

prova("AR-397: se il lavoro ha già un esito buono, il ricovero si scarta", () => {
  assert.equal(decidiRipubblicazione({ statoAttuale: "fatto" }).azione, "scarta");
});

// ── le mani, eseguite ────────────────────────────────────────────────────────
prova("AR-397 (runtime): la PATCH che fallisce viene RITENTATA", () => {
  const b = banco({ falliPrimi: 1 });
  try {
    const r = sh(b, `scrivi_esito_lavoro "abc-1" '{"stato":"fatto","risultato":"ok"}' "esito (fatto)"`);
    assert.equal(r.rc, 0, `doveva riuscire al secondo tentativo:\n${r.out}`);
    assert.equal(b.patch(), 2, "un solo tentativo = il difetto di partenza");
    assert.deepEqual(b.ricoveri(), [], "riuscito: niente da ricoverare");
  } finally {
    b.pulisci();
  }
});

prova("AR-397 (runtime): se il database resta irraggiungibile l'esito NON si perde: si ricovera", () => {
  const b = banco({ falliPrimi: 99 });
  try {
    const r = sh(b, `scrivi_esito_lavoro "abc-2" '{"stato":"fatto","risultato":"azione inviata"}' "esito (fatto)"`);
    assert.equal(r.rc, 1, "deve dire al chiamante che non ha scritto");
    assert.deepEqual(b.ricoveri(), ["abc-2.json"], `nessun ricovero su disco:\n${r.out}`);
    const ric = JSON.parse(readFileSync(join(b.repo, ".git/mycity-esito-ricovero/abc-2.json"), "utf8"));
    assert.equal(ric.stato, "fatto");
    assert.equal(ric.body.risultato, "azione inviata", "il ricovero deve contenere l'esito VERO, non un riassunto");
  } finally {
    b.pulisci();
  }
});

prova("AR-397 (runtime): al ciclo dopo il worker ripubblica il ricovero su un lavoro chiuso in errore", () => {
  const b = banco({ falliPrimi: 0, rispostaGet: '[{"stato":"errore"}]' });
  try {
    mkdirSync(join(b.repo, ".git/mycity-esito-ricovero"), { recursive: true });
    writeFileSync(
      join(b.repo, ".git/mycity-esito-ricovero/abc-3.json"),
      JSON.stringify({ id: "abc-3", stato: "fatto", body: { stato: "fatto", risultato: "azione inviata" } }),
    );
    const r = sh(b, `ripubblica_esiti_ricoverati`);
    assert.match(r.out, /ripubblicato/, `il ricovero non è stato ripubblicato:\n${r.out}`);
    assert.equal(b.patch(), 1, "doveva riscrivere l'esito sul database");
    assert.deepEqual(b.ricoveri(), [], "confermato dal database: il ricovero si può togliere");
    // la PATCH di recupero NON deve filtrare su stato=in_corso, altrimenti non ripara il caso vero
    assert.doesNotMatch(b.log(), /stato=eq\.in_corso/);
  } finally {
    b.pulisci();
  }
});

prova("AR-397 (runtime): se lo stato del lavoro non è leggibile, il ricovero RESTA", () => {
  const b = banco({ falliPrimi: 0, rispostaGet: "" });
  try {
    mkdirSync(join(b.repo, ".git/mycity-esito-ricovero"), { recursive: true });
    writeFileSync(
      join(b.repo, ".git/mycity-esito-ricovero/abc-4.json"),
      JSON.stringify({ id: "abc-4", stato: "fatto", body: { stato: "fatto", risultato: "x" } }),
    );
    const r = sh(b, `ripubblica_esiti_ricoverati`);
    assert.deepEqual(b.ricoveri(), ["abc-4.json"], `ricovero buttato senza sapere niente:\n${r.out}`);
    assert.equal(b.patch(), 0, "non si riscrive niente al buio");
  } finally {
    b.pulisci();
  }
});

prova("AR-397 (runtime): se il lavoro è già «fatto», il ricovero si toglie senza riscrivere", () => {
  const b = banco({ falliPrimi: 0, rispostaGet: '[{"stato":"fatto"}]' });
  try {
    mkdirSync(join(b.repo, ".git/mycity-esito-ricovero"), { recursive: true });
    writeFileSync(
      join(b.repo, ".git/mycity-esito-ricovero/abc-5.json"),
      JSON.stringify({ id: "abc-5", stato: "fatto", body: { stato: "fatto", risultato: "x" } }),
    );
    sh(b, `ripubblica_esiti_ricoverati`);
    assert.deepEqual(b.ricoveri(), []);
    assert.equal(b.patch(), 0);
  } finally {
    b.pulisci();
  }
});

// ── l'ULTIMA clausola: la sentinella distingue «esito assente» da «esito ricoverato» ────────────
prova("AR-397: un orfano con esito RICOVERATO non si chiude in errore", () => {
  const conRicovero = decidiOrfano({ sicuro: false, tentativi: 0, esitoRicoverato: true });
  assert.equal(conRicovero.azione, "attendi", "chiuderlo in errore è ciò che causa il doppio invio");
  const senza = decidiOrfano({ sicuro: false, tentativi: 0 });
  assert.equal(senza.azione, "ferma", "senza esito il comportamento non cambia: torna a Nicola");
});

prova("AR-397 (runtime): il worker riconosce il ricovero prima di dead-letterare", () => {
  const b = banco({});
  try {
    mkdirSync(join(b.repo, ".git/mycity-esito-ricovero"), { recursive: true });
    writeFileSync(join(b.repo, ".git/mycity-esito-ricovero/abc-9.json"), "{}");
    const r = sh(b, `esito_ricoverato_esiste "abc-9"; echo "CI=$?"; esito_ricoverato_esiste "abc-x"; echo "NO=$?"`);
    assert.match(r.out, /CI=0/);
    assert.match(r.out, /NO=1/);
  } finally {
    b.pulisci();
  }
});

prova("AR-397: entrambi i canali che chiudono gli orfani guardano lo stesso dato", () => {
  const w = readFileSync(join(CERVELLO, "worker.sh"), "utf8");
  assert.match(w, /esito_ricoverato_esiste "\$id"/, "il worker deve controllare il ricovero prima del dead-letter");
  const s = readFileSync(join(CERVELLO, "sentinella-lavori.mjs"), "utf8");
  assert.match(s, /esitoRicoverato: ricoverati\.has/, "anche la sentinella, o il freno vale su una strada sola");
});

prova("AR-397: worker.sh non scrive più l'esito con una curl nuda", () => {
  const src = readFileSync(join(CERVELLO, "worker.sh"), "utf8");
  const nude = src
    .split("\n")
    .filter((r) => /-X PATCH .*lavori\?id=eq\.\$id&stato=eq\.in_corso/.test(r) && !/scrivi_esito_lavoro/.test(r));
  // Le corsie della chat aggiornano il testo in streaming: quelle non sono l'ESITO del lavoro.
  const esiti = nude.filter((r) => /\$body|"\$out"/.test(r) && !/stream|parziale/i.test(r));
  assert.deepEqual(esiti, [], `l'esito esce ancora da una porta senza rete:\n${esiti.join("\n")}`);
});

// ── esito ────────────────────────────────────────────────────────────────────
const rotti = casi.filter((c) => !c.ok);
for (const c of casi) process.stdout.write(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n     ${c.err}`}\n`);
process.stdout.write(`\n${casi.length - rotti.length}/${casi.length} passati\n`);
process.exit(rotti.length ? 1 : 0);
