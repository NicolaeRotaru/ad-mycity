// 🧭 AR-376 / AR-393 — UNO STRUMENTO COSTRUITO E MAI MESSO DI GUARDIA È UN BUCO, NON UNO STATO.
//
// La malattia della corsia A, in una riga: **il verdetto esiste e non frena.** Due strumenti la
// mostravano nella forma più pura — `permessi-check.mjs`, che esce 1 con quattro violazioni vere, e
// `non-vacuita.mjs`, il controllo nato apposta per smascherare le prove verdi-perché-cieche. In
// tutto il repo il secondo compariva solo dentro un messaggio rivolto a chi legge («rompi il fix e
// pretendi il rosso: node cervello/non-vacuita.mjs»). Un cartello, non un freno.
//
// Perché nessuno se n'era accorto: la bacheca dei guardiani elenca chi `giro.sh` esegue, quindi un
// guardiano mai cablato è invisibile per costruzione. Qui si misura lo scarto fra chi ESISTE
// (derivato dal codice) e chi è ESEGUITO (derivato dagli invocatori veri).
//
// Questa prova è anche il cablaggio del guardiano di questa corsia: `guardia-viva-check.mjs` non
// poteva nascere nella condizione che cura.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { eGuardiano, guardiaDi, invocazioniIn, verdettiMorti } from "../guardia-viva.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const CHECK = join(REPO, "cervello/guardia-viva-check.mjs");

test("sul repo VERO ogni guardiano è eseguito da qualcuno, o dice perché no", () => {
  const r = spawnSync("node", [CHECK, "--json"], { cwd: REPO, encoding: "utf8", timeout: 120_000 });
  assert.notEqual(r.status, null, "il guardiano non è nemmeno partito");
  assert.notEqual(r.status, 2, `guardiano CIECO (exit 2): non ha potuto misurare — ${r.stderr.trim()}`);
  const j = JSON.parse(r.stdout);
  assert.deepEqual(
    j.senza_guardia.map((b) => `${b.strumento} — ${b.perche}`),
    [],
    "c'è uno strumento che emette un verdetto e non lo esegue nessuno: cablalo, o dichiara il perché in cervello/guardiani-motivi.json",
  );
  assert.equal(j.tetto.sforato, false, `il debito «da-cablare» si è allargato: ${j.tetto.quanti} contro un tetto di ${j.tetto.tetto}`);
  assert.deepEqual(j.voci_fantasma, [], "il registro dei motivi tiene in vita voci di strumenti che non esistono più, o scuse già scadute");
  assert.equal(r.status, 0, "il guardiano della guardia deve uscire 0 quando non ha trovato buchi");
});

test("i due strumenti del difetto sono adesso di guardia davvero", () => {
  const r = spawnSync("node", [CHECK, "--json"], { cwd: REPO, encoding: "utf8", timeout: 120_000 });
  const j = JSON.parse(r.stdout);
  // `dove` elenca CHI li invoca, misurato sul codice: se qualcuno stacca il cablaggio, sparisce.
  for (const strumento of ["permessi-check.mjs", "non-vacuita.mjs"]) {
    const posti = j.dove[strumento] || [];
    assert.ok(posti.length > 0, `${strumento} è tornato orfano: non lo invoca più nessuno`);
  }
  assert.ok(
    (j.dove["non-vacuita.mjs"] || []).includes("cervello/cancello-lotto.mjs"),
    "AR-393: la prova che le prove provino deve essere ESEGUITA dal cancello del lotto, non nominata in un messaggio",
  );
  assert.ok(
    (j.dove["permessi-check.mjs"] || []).includes("cervello/test/permessi-di-guardia.test.mjs"),
    "AR-376: il verdetto dei permessi sul file vero deve essere una prova della suite",
  );
});

test("un cartello non conta come cablaggio", () => {
  // È la distinzione su cui regge tutto: negli script di casa un'invocazione vera passa da una
  // variabile di percorso o dall'helper `guardiano`; i messaggi scrivono il percorso per esteso.
  const invocazioni = invocazioniIn('  motivo: `rompi il fix — node cervello/non-vacuita.mjs`,');
  assert.equal(invocazioni.size, 0, "un nome dentro un messaggio non è un'esecuzione");
  assert.ok(invocazioniIn('node "$SCRIPT_DIR/porte-check.mjs" --json').has("porte-check.mjs"));
  assert.ok(invocazioniIn('  guardiano "stampo-check.mjs" || true').has("stampo-check.mjs"));
  assert.ok(invocazioniIn('# node "$SCRIPT_DIR/spento.mjs"').size === 0, "un'invocazione commentata non gira");
});

test("una libreria pura non viene accusata di essere un guardiano orfano", () => {
  // Senza questa distinzione `fonte-numero.mjs` e `censimento-guardiani.mjs` — che sono funzioni
  // pure importate da chi decide — finirebbero nell'elenco dei buchi, e un elenco che accusa chi
  // non c'entra si impara a ignorare come uno che tace.
  const pura = readFileSync(join(REPO, "cervello/fonte-numero.mjs"), "utf8");
  assert.equal(eGuardiano(pura), false, "una libreria senza shebang non è un guardiano da riga di comando");
  const vero = readFileSync(join(REPO, "cervello/porte-check.mjs"), "utf8");
  assert.equal(eGuardiano(vero), true, "un guardiano con shebang, contratto d'uscita e process.exit va riconosciuto");
});

test("un guardiano che nessuno esegue e nessuno dichiara è un BUCO", () => {
  // Il controllo positivo, e serve: le altre prove asseriscono che l'elenco dei buchi sia VUOTO,
  // quindi resterebbero verdi anche con un rilevatore che non trova mai niente. Qui si pretende il
  // contrario — che davanti a un orfano il verdetto sia «no».
  const orfano = guardiaDi("mai-cablato.mjs", {}, new Set(), new Map());
  assert.equal(orfano.ok, false, "un guardiano orfano e non dichiarato deve risultare un buco");
  assert.match(orfano.perche, /mai messo di guardia/);
  const eseguito = guardiaDi("mai-cablato.mjs", {}, new Set(["mai-cablato.mjs"]), new Map());
  assert.equal(eseguito.ok, true, "chi è eseguito da un processo vero non deve dichiarare niente");
});

test("dichiarare «cablato» senza che quel file lo invochi non salva nessuno", () => {
  const invocati = new Set();
  const dove = new Map([["x.mjs", ["cervello/giro.sh"]]]);
  const bugia = guardiaDi("x.mjs", { "x.mjs": { motivo: "cablato", dove: "cervello/ritmo.sh" } }, invocati, dove);
  assert.equal(bugia.ok, false, "una dichiarazione che nomina il posto sbagliato deve fallire");
  const vera = guardiaDi("x.mjs", { "x.mjs": { motivo: "cablato", dove: "cervello/giro.sh" } }, invocati, dove);
  assert.equal(vera.ok, true);
  const etichetta = guardiaDi("y.mjs", { "y.mjs": { motivo: "decisione", perche: "boh" } }, invocati, dove);
  assert.equal(etichetta.ok, false, "un motivo senza un perché scritto è un'etichetta, non una decisione");
});

test("AR-394 — il verdetto morto del cancello di pubblicazione è misurato, non dedotto", () => {
  const gate = join(REPO, "cervello/gate-pubblicazione.sh");
  assert.ok(existsSync(gate), "manca il cancello di pubblicazione: non posso misurare");
  const morti = verdettiMorti(readFileSync(gate, "utf8"));
  // Non si pretende che rc_one sia sparito (toglierlo richiede di modificare quel file .sh): si
  // pretende che il rilevatore lo VEDA, perché è quello a rendere impossibile un secondo caso.
  assert.ok(
    morti.some((m) => m.variabile === "rc_one"),
    "il rilevatore non vede più rc_one: se il difetto è stato riparato togli anche la sua voce da guardiani-motivi.json, se no il metro è cieco",
  );
  const finto = [
    "gate_verdetto() {",
    '  local a="${1:-0}" b="${2:-0}"',
    "}",
    "  local rc_uno=0 rc_due=0",
    '  node "$dir/x.mjs" || rc_uno=$?',
    '  if ! gate_verdetto "$rc_uno" "$rc_due"; then',
    "    return 1",
    "  fi",
  ].join("\n");
  const trovati = verdettiMorti(finto);
  assert.deepEqual(
    trovati.map((m) => m.variabile),
    ["rc_due"],
    "morta è la variabile che il verdetto legge e nessuno riempie con una misura; quella assegnata da un'esecuzione è viva",
  );
});

// ── AR-519 — «in attesa di aggancio»: il terzo stato per gli hook ─────────────
//
// Un hook non lo mette di guardia un processo del repo: lo mette una riga in `.claude/settings.json`,
// file che la macchina non può scrivere apposta. Fra «l'ho costruito» e «Nicola l'ha incollato»
// passa del tempo vero, e in quel tempo chiamarlo buco è dare rosso al comportamento giusto.
// Quello che rende questo stato una cosa diversa da un'esenzione è UNA data, e queste prove
// difendono la data.

const inAttesa = (extra = {}) => ({
  "nuovo-hook.mjs": { motivo: "in-attesa-di-aggancio", scade: "2026-08-11", perche: "va agganciato a PreToolUse a mano, il file dei freni è nel deny-list", ...extra },
});

test("un hook dichiarato in attesa, con data futura e perché scritto, è a posto", () => {
  const g = guardiaDi("nuovo-hook.mjs", inAttesa(), new Set(), new Map(), "2026-08-04");
  assert.equal(g.ok, true);
  assert.equal(g.debito, false, "non conta contro il tetto dei da-cablare: quel tetto governa i buchi SENZA data");
  assert.equal(g.attesa, true, "ma resta visibile come attesa: non sparisce nel verde");
});

test("LA REGOLA CHE CONTA: passata la data torna un buco — un'attesa senza fine è un'esenzione", () => {
  const g = guardiaDi("nuovo-hook.mjs", inAttesa(), new Set(), new Map(), "2026-08-12");
  assert.equal(g.ok, false);
  assert.match(g.perche, /2026-08-11/, "chi legge deve sapere entro quando doveva essere agganciato");
});

test("senza data non è un'attesa: è un'esenzione scritta male, e vale come se non ci fosse", () => {
  const senzaData = { "nuovo-hook.mjs": { motivo: "in-attesa-di-aggancio", perche: "prima o poi lo aggancio, quando mi ricordo" } };
  const g = guardiaDi("nuovo-hook.mjs", senzaData, new Set(), new Map(), "2026-08-04");
  assert.equal(g.ok, false);
  assert.match(g.perche, /senza una data/);
});

test("un'etichetta non basta: senza il perché scritto resta un buco", () => {
  const g = guardiaDi("nuovo-hook.mjs", inAttesa({ perche: "hook" }), new Set(), new Map(), "2026-08-04");
  assert.equal(g.ok, false);
});

test("se poi qualcuno lo esegue davvero, l'attesa non serve più: misurato batte dichiarato", () => {
  const g = guardiaDi("nuovo-hook.mjs", inAttesa(), new Set(["nuovo-hook.mjs"]), new Map(), "2026-08-12");
  assert.equal(g.ok, true, "anche con la data scaduta: essere di guardia si MISURA, non si dichiara");
  assert.equal(g.motivo, "cablato");
});
