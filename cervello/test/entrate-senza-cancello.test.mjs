#!/usr/bin/env node
// 🧪 AR-825 — il cancello parla, ma non chiude.
//
// Il conto del 26/8: 141 PR unite su main nella finestra misurabile, e DIECI entrate senza un verde
// — nove col cancello rosso sulla testa, una che il cancello non ha mai visto. Il 7%.
//
// Queste prove girano su dati finti apposta: devono poter fallire anche senza rete e senza chiave,
// altrimenti la prova di un difetto sarebbe più fragile del difetto.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { entrateSenzaVerde, testeMisurate, inizioFinestra } from "../entrate-senza-cancello.mjs";

const COMANDO = join(import.meta.dirname, "..", "entrate-senza-cancello.mjs");

const pr = (numero, sha, unita) => ({ number: numero, head: { sha }, merged_at: unita });
const corsa = (sha, conclusion, created_at = "2026-08-04T00:00:00Z") => ({ head_sha: sha, conclusion, created_at });

test("una PR unita col cancello ROSSO sulla testa viene contata, e detta per quello che è", () => {
  const fuori = entrateSenzaVerde([pr(1, "aaa", "2026-08-10T00:00:00Z")], [corsa("aaa", "failure")]);
  assert.equal(fuori.length, 1);
  assert.equal(fuori[0].come, "rossa", "il cancello l'aveva vista e aveva detto no: è il caso più grave");
});

test("una PR che il cancello non ha MAI visto viene contata a parte", () => {
  const fuori = entrateSenzaVerde([pr(2, "bbb", "2026-08-10T00:00:00Z")], [corsa("zzz", "success")]);
  assert.equal(fuori.length, 1);
  assert.equal(fuori[0].come, "mai_misurata", "«non vista» e «vista e scavalcata» sono due guasti diversi");
});

test("una PR col verde NON viene contata — o il guardiano griderebbe sempre", () => {
  assert.deepEqual(entrateSenzaVerde([pr(3, "ccc", "2026-08-10T00:00:00Z")], [corsa("ccc", "success")]), []);
});

test("basta UN verde fra più corse sulla stessa testa: si ritenta, ed è legittimo", () => {
  const corse = [corsa("ddd", "failure"), corsa("ddd", "cancelled"), corsa("ddd", "success")];
  assert.deepEqual(entrateSenzaVerde([pr(4, "ddd", "2026-08-10T00:00:00Z")], corse), []);
});

test("una PR chiusa senza essere unita non è entrata da nessuna parte", () => {
  const chiusa = { number: 5, head: { sha: "eee" }, merged_at: null };
  assert.deepEqual(entrateSenzaVerde([chiusa], []), []);
});

test("fuori dalla finestra non si conta: prima non SO, e non-so non è va-bene", () => {
  const vecchia = pr(6, "fff", "2026-07-01T00:00:00Z");
  assert.deepEqual(entrateSenzaVerde([vecchia], [], "2026-08-04T00:00:00Z"), [],
    "senza storico delle corse quella PR non è misurabile: contarla come colpevole sarebbe inventare");
});

test("l'elenco esce in ordine di quando sono entrate, non a caso", () => {
  const prs = [pr(9, "c", "2026-08-20T00:00:00Z"), pr(7, "a", "2026-08-05T00:00:00Z"), pr(8, "b", "2026-08-12T00:00:00Z")];
  assert.deepEqual(entrateSenzaVerde(prs, []).map((f) => f.numero), [7, 8, 9]);
});

test("la finestra parte dalla corsa più vecchia che esiste, non da una data scelta a mano", () => {
  const corse = [corsa("a", "success", "2026-08-10T00:00:00Z"), corsa("b", "success", "2026-08-04T09:25:11Z")];
  assert.equal(inizioFinestra(corse), "2026-08-04T09:25:11Z");
  assert.equal(inizioFinestra([]), "", "senza corse non c'è finestra: e allora non si dà un numero");
});

test("testeMisurate raggruppa per testa, tenendo TUTTI gli esiti di quella testa", () => {
  const per = testeMisurate([corsa("a", "failure"), corsa("a", "success"), corsa("b", null)]);
  assert.deepEqual(per.get("a"), ["failure", "success"]);
  assert.deepEqual(per.get("b"), [null], "una corsa mai conclusa non è un verde");
});

test("senza chiave lo strumento dice ⚪ e non dà nessun numero", () => {
  const senza = { ...process.env };
  delete senza.GITHUB_TOKEN;
  delete senza.GH_TOKEN;
  const r = spawnSync(process.execPath, [COMANDO], { encoding: "utf8", env: senza });
  assert.equal(r.status, 2, "⚪ non è mai un verde");
  assert.equal(r.stdout.trim(), "", "in ⚪ non deve uscire nessun conto");
  assert.match(r.stderr, /non collegato|nessuna chiave/, "deve dire che è uno strumento non collegato, non che è rotto");
});

// ── AR-826 — la chiave non deve finire dove la legge chiunque ──────────────
//
// Trovato riguardando il file con la lente «cosa succede se», non per caso: la prima stesura
// passava la chiave come argomento di curl, e gli argomenti di un processo li legge chiunque abbia
// un `ps` sulla stessa macchina. Sul VPS è la chiave di GitHub regalata a chi passa.

test("la chiave NON compare fra gli argomenti del processo", async () => {
  const { argomentiCurl } = await import("../entrate-senza-cancello.mjs");
  const args = argomentiCurl("https://api.github.com/repos/x/y/pulls");
  const tutto = args.join(" ");
  assert.ok(!/Bearer/.test(tutto), `nessun «Bearer» sulla riga di comando: ${tutto}`);
  assert.ok(!args.some((a) => a.length > 60 && /^[A-Za-z0-9_-]+$/.test(a)), `niente che somigli a una chiave: ${tutto}`);
  assert.ok(args.includes("-K") && args.includes("-"), "la configurazione deve arrivare dallo standard input");
});

// AR-828 — questo comando lo esegue `giro.sh`, e `guardiano()` in giro-esito.sh non mette nessun
// tetto di tempo: è scritto per guardiani che leggono file. Con GitHub lento una richiesta senza
// tetto non fa fallire il giro — lo lascia fermo lì, che è peggio. Il tetto sta qui, nello strumento
// che porta il rischio, e non nell'esecutore condiviso da una ventina di guardiani.
//
// ⚠️ DICHIARATO: questa prova guarda la FORMA degli argomenti, non il comportamento sotto rete
// lenta. Il caso con GitHub che non risponde non l'ho ricreato.
test("AR-828: ogni chiamata a GitHub porta il suo tetto di tempo", async () => {
  const { argomentiCurl } = await import("../entrate-senza-cancello.mjs");
  const args = argomentiCurl("https://api.github.com/repos/x/y/pulls");
  assert.ok(args.includes("--max-time"), `senza tetto una richiesta può tenere fermo il giro: ${args.join(" ")}`);
  assert.ok(args.includes("--connect-timeout"), "anche la connessione va bloccata, non solo il trasferimento");
  const tetto = Number(args[args.indexOf("--max-time") + 1]);
  assert.ok(tetto > 0 && tetto <= 60, `il tetto dev'essere un numero di secondi sensato, è ${tetto}`);
});

test("la chiave c'è, ma dentro la configurazione che viaggia sullo standard input", async () => {
  const { configCurl } = await import("../entrate-senza-cancello.mjs");
  const c = configCurl("chiave-finta-123");
  assert.match(c, /header = "Authorization: Bearer chiave-finta-123"/, "se non la passa più, il comando non funziona");
  assert.match(c, /Accept: application\/vnd\.github\+json/);
});
