#!/usr/bin/env node
// AR-662 — «il guardiano dei sensori dice ROTTO quando la verità è NON HO POTUTO GUARDARE».
//
// Il contratto di casa (AR-322) ha tre codici: 0 = passato · 1 = violazione trovata · 2 = NON HO
// POTUTO MISURARE. `verifica-sensori.mjs` ne conosceva due: `process.exit(esito === "ok" ? 0 : 1)`.
// Da una sessione senza chiavi l'esito è `non_misurato` e usciva 1, cioè «i sensori sono rotti» —
// mentre i sensori stanno benissimo ed è chi guarda a non poterli vedere. Il verso dell'errore era
// quello prudente, ma un allarme che suona quando non c'è niente che non va si impara a zittire, e
// chi lo zittisce zittisce anche il rosso vero.
//
// ⚠️ LA TRAPPOLA, ed è il motivo per cui questo file esiste invece di una riga cambiata. Il codice
// d'uscita di questo comando lo leggono in due, e vogliono cose diverse:
//
//   · `cervello/giro.sh` accende il vincolo «niente numeri nuovi» con `[ "$_sens_rc" -ne 0 ]`,
//     cioè QUALUNQUE codice diverso da zero. Cambiare 1 → 2 alla cieca poteva trasformare un freno
//     che funziona in un freno spento: qui sotto il freno si prova ESEGUENDO le righe vere di
//     giro.sh, non leggendole.
//
//   · `cervello/salute.mjs` giudica questo comando con `rossoSe: (c) => c === 1` e senza `ciecoSe`.
//     Portare a 2 ANCHE l'esito `cieco` — chiavi presenti, nessun sensore che risponde — avrebbe
//     fatto cadere quel controllo nel ramo buono, stampando «almeno un sensore dati vede il
//     marketplace» proprio nel caso in cui non vede niente nessuno. Cioè: curando il nome sbagliato
//     di un rosso ci si comprava un verde falso. Per questo `cieco` RESTA 1 e solo `non_misurato`
//     diventa 2 — al contrario di quello che proponeva la scheda del difetto.
//
// La prova non cerca parole in un file: esegue il comando vero in due ambienti diversi e guarda il
// numero che torna.

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { codiceUscitaSensori } from "../misura-o-cieco.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const VERIFICA = join(REPO, "cervello/verifica-sensori.mjs");
const GIRO = join(REPO, "cervello/giro.sh");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// Le chiavi che questo comando legge. Stringa vuota e non `delete`: `git-github.mjs` carica
// `cervello/vps/.env` all'import e riempie SOLO le chiavi assenti dall'ambiente. Con `delete` il
// figlio se le ritroverebbe dal file un istante dopo, e il test misurerebbe un ambiente CON le
// chiavi credendo di averle spente (la stessa trappola già documentata in cieco-dichiarato-verde).
const CHIAVI = [
  "MARKETPLACE_SUPABASE_URL", "MARKETPLACE_SUPABASE_KEY", "MARKETPLACE_SUPABASE_ANON_KEY",
  "STRIPE_SECRET_KEY", "POSTHOG_API_KEY", "RESEND_API_KEY", "MARKETPLACE_SITE_URL",
  "SUPABASE_URL", "SUPABASE_SERVICE_KEY", "SUPABASE_SERVICE_ROLE_KEY", "PANNELLO_URL",
  "CABINA_URL", "TELEGRAM_BOT_TOKEN", "N8N_WEBHOOK_URL", "N8N_HEALTH_URL",
];

/** Lancia la verifica vera puntandola a un file di stato usa-e-getta, con l'ambiente su misura. */
function lancia(env = {}) {
  const dir = mkdtempSync(join(tmpdir(), "ar662-"));
  try {
    const spento = Object.fromEntries(CHIAVI.map((k) => [k, ""]));
    const r = spawnSync(process.execPath, [VERIFICA, "--json"], {
      cwd: REPO,
      encoding: "utf8",
      timeout: 120_000,
      env: { ...process.env, ...spento, ...env, SENSORI_CECITA_FILE: join(dir, "cecita.json") },
    });
    let json = {};
    try {
      json = JSON.parse(r.stdout || "{}");
    } catch {
      /* il codice d'uscita resta la cosa che si misura */
    }
    return { rc: r.status, json, out: `${r.stdout || ""}${r.stderr || ""}` };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ── La decisione, eseguita da sola ───────────────────────────────────────────
prova("la mappa dei tre codici è una funzione pura, e non regala lo zero a nessuno", () => {
  assert.equal(codiceUscitaSensori("ok"), 0);
  assert.equal(codiceUscitaSensori("cieco"), 1, "chiavi presenti e nessuno risponde = guasto misurato, non buco");
  assert.equal(codiceUscitaSensori("non_misurato"), 2, "niente da misurare da qui = 2, il codice del cieco");
  // Fail-closed: l'etichetta che non conosco è la strada più comoda per comprarsi il verde.
  for (const strano of ["", null, undefined, "verde", "OK", "boh"]) {
    assert.equal(codiceUscitaSensori(strano), 2, `«${strano}» non deve poter uscire 0`);
  }
});

// ── Il comando vero, nei due ambienti che contano ────────────────────────────
prova("senza chiavi il comando esce 2 (non ho potuto guardare), non 1 (è rotto)", () => {
  const { rc, json, out } = lancia();
  assert.equal(json.esito, "non_misurato", `premessa della riproduzione: senza chiavi l'esito è non_misurato (era «${json.esito}»)`);
  assert.equal(json.sensori_ambiente_misurati, 0, "premessa: nessun sensore d'ambiente misurato da qui");
  assert.equal(rc, 2, `un guardiano che non ha potuto misurare esce 2, invece è uscito ${rc}:\n${out.slice(0, 400)}`);
});

prova("con le chiavi e nessun sensore che risponde resta 1: il 2 non è la nuova scusa", () => {
  // È la metà che protegge `salute.mjs` (rossoSe: c === 1). Se questo diventasse 2, «tutti i sensori
  // sono ciechi pur avendo le chiavi» — un guasto vero — verrebbe raccontato lassù come un verde.
  const { rc, json } = lancia({ MARKETPLACE_SUPABASE_URL: "http://127.0.0.1:1", MARKETPLACE_SUPABASE_KEY: "finta" });
  assert.equal(json.esito, "cieco", `premessa: con una chiave presente e l'endpoint morto l'esito è cieco (era «${json.esito}»)`);
  assert.equal(rc, 1, `un guasto misurato resta una violazione (1), invece è uscito ${rc}`);
});

// ── Il freno del giro: le righe VERE di giro.sh, eseguite col codice nuovo ────
/**
 * Ritaglia da giro.sh il blocco che decide il vincolo dei sensori e lo esegue in bash con un rc
 * scelto da noi. Il blocco NON viene ricopiato qui: si legge dal file vivo, così il giorno in cui
 * qualcuno lo cambiasse in `-eq 1` questa prova diventerebbe rossa invece di restare vera per finta.
 */
function frenoDelGiro(rc, out = '{"datiOrdiniCiechi": false}') {
  const righe = readFileSync(GIRO, "utf8").split("\n");
  const inizio = righe.findIndex((r) => r.includes('if [ "$_sens_rc" -ne 0 ]'));
  assert.notEqual(inizio, -1, "in giro.sh non c'è più il blocco che legge il codice dei sensori: la prova non sa più cosa provare");
  const fine = righe.findIndex((r, i) => i > inizio && r === "  fi");
  assert.notEqual(fine, -1, "il blocco dei sensori non si chiude: ritaglio impossibile");
  const blocco = righe.slice(inizio, fine + 1).join("\n");
  const script = [
    "set -u",
    "ts() { echo T; }",
    `_sens_rc=${rc}`,
    `_sens_out=${JSON.stringify(out)}`,
    "SENSORI_CIECHI=0",
    'SENSORI_VINCOLO=""',
    blocco,
    'echo "CIECHI=$SENSORI_CIECHI"',
    'echo "VINCOLO_LUNGO=${#SENSORI_VINCOLO}"',
  ].join("\n");
  const r = spawnSync("bash", ["-c", script], { encoding: "utf8" });
  const testo = r.stdout || "";
  return {
    ciechi: /CIECHI=1/.test(testo),
    vincolo: Number((testo.match(/VINCOLO_LUNGO=(\d+)/) || [0, 0])[1]),
  };
}

prova("il vincolo «niente numeri nuovi» si accende col 2 esattamente come col 1", () => {
  // È la trappola scritta nella scheda di AR-662: se giro.sh avesse letto solo l'1, cambiare il
  // codice qui avrebbe spento un freno che funziona, e il giro avrebbe ripreso a scrivere numeri
  // nuovi proprio nelle sessioni che non possono misurarli.
  const due = frenoDelGiro(2);
  assert.equal(due.ciechi, true, "con rc=2 il giro NON si mette in modalità baseline: il freno è spento");
  assert.ok(due.vincolo > 50, "con rc=2 il motore non riceve il testo del vincolo");
});

prova("e non si è spento nemmeno per l'1 e lo 0: i tre casi restano tre", () => {
  const uno = frenoDelGiro(1);
  assert.equal(uno.ciechi, true, "il guasto misurato deve continuare ad accendere il vincolo");
  const zero = frenoDelGiro(0);
  assert.equal(zero.ciechi, false, "con i sensori vivi il vincolo non deve accendersi, o il giro non scriverebbe mai un numero");
  // E la seconda strada di giro.sh (supabase_rest cieco mentre altri sensori reggono) resta viva.
  const zeroMaCieco = frenoDelGiro(0, '{"datiOrdiniCiechi": true}');
  assert.equal(zeroMaCieco.ciechi, true, "la fonte-di-verità cieca deve accendere il vincolo anche con rc=0");
});

// ── Tripwire sull'altro lettore del codice (non è la prova del fix, è la sua ragione) ──
prova("salute.mjs giudica ancora questo comando con «rosso se 1»: se cambia, va ripensato il 2", () => {
  const src = readFileSync(join(REPO, "cervello/salute.mjs"), "utf8");
  const blocco = src.slice(src.indexOf('id: "sensori.vista"'), src.indexOf('id: "sensori.spenti"'));
  assert.ok(blocco.length > 100, "il controllo sensori.vista non si trova più in salute.mjs");
  assert.match(blocco, /rossoSe:\s*\(c\)\s*=>\s*c === 1/, "sensori.vista non guarda più l'1: il perché di lasciare `cieco` a 1 è decaduto");
  assert.ok(!/ciecoSe/.test(blocco), "sensori.vista ha imparato a leggere il 2: allora `cieco` può diventare 2 e questa prova va riscritta");
});

let ko = 0;
for (const c of casi) {
  console.log(`  ${c.ok ? "ok" : "NOT ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) ko++;
}
console.log(`# pass ${casi.length - ko}\n# fail ${ko}`);
process.exit(ko ? 1 : 0);
