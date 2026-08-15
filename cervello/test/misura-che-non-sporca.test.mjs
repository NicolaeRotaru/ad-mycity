#!/usr/bin/env node
// AR-464 · AR-639 · AR-663 — uno strumento che dice di sola leggere, e invece scrive.
//
// LA RADICE, comune a tutti e tre: chi interroga la macchina per sapere come sta, la PEGGIORA.
// Il guardiano riscrive il proprio file di stato a ogni esecuzione anche quando l'unica riga diversa
// è l'ora, e chi lo lancia per controllare il proprio lavoro si ritrova due file modificati che non
// sono lavoro suo. L'incentivo che nasce è «non lanciare il guardiano se non devi», cioè il
// contrario di quello che serve: un controllo che costa un diff si smette di fare, e un controllo
// che si smette di fare è spento.
//
// I TRE DIFETTI SONO TRE, e questo file li prova SEPARATI apposta — un caso solo che li copre tutti
// e tre insieme, se salta, non dice quale è tornato:
//   · AR-663 — il referto è deviabile con una variabile d'ambiente, e con `--json` non si scrive;
//   · AR-639 — si riscrive solo se è cambiato qualcosa OLTRE l'ora;
//   · AR-464 — `--sola-lettura` lascia l'albero di git pulito, che è la prova chiesta dalla scheda.
//
// NON-VACUITÀ (verificata rompendo il fix davvero, non deducendola): in `cervello/scrittura-misura.mjs`,
// facendo tornare `decidiScrittura` sempre `si(...)` — cioè togliendo la decisione e riscrivendo
// sempre — diventano rossi i casi ②③④⑤⑥⑦⑧⑨. È esattamente lo stato in cui i tre difetti erano nati.
//
// PERCHÉ QUESTO FILE NON SPORCA LA MEMORIA VERA (AR-446): i due script che tocca li punta su una
// cartella temporanea con le loro variabili d'ambiente. Un test che sporca il vault è un test che si
// smette di lanciare.

import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CAMPI_TIMBRO,
  contenutoSostanziale,
  decidiScrittura,
  origineCorrente,
  stessoContenuto,
  timbroProvenienza,
} from "../scrittura-misura.mjs";
import { percorsiDaGit } from "../percorsi-git.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

const sabbiera = mkdtempSync(join(tmpdir(), "misura-"));

/**
 * Lancia uno script e torna cosa ha detto, SENZA alzare un'eccezione se esce diverso da zero.
 *
 * ⚠️ QUESTA RIGA È COSTATA UN ROSSO IN CI, ed è la malattia che questo lotto cura, capitata dentro
 * la sua stessa prova. La prima versione usava la scorciatoia che ALZA su uscita non-zero. Qui ho la
 * fortuna di avere le chiavi, quindi i guardiani escono 0 e passava tutto; sulla macchina della CI
 * non ci sono, gli stessi guardiani escono 2 — che in questa casa vuol dire «NON HO POTUTO
 * MISURARE» — e la prova diventava rossa dove non c'era niente di rotto.
 *
 * Cioè stavo trattando un CIECO come un GUASTO: 13 passati e 2 falliti, e i 2 non erano difetti.
 *
 * La cura è la stessa che applico ai guardiani veri: si giudica l'EFFETTO, non il codice d'uscita.
 * Questi casi chiedono «ha scritto o no?», e la risposta si legge sul disco — un guardiano che non
 * ha potuto misurare non ha scritto niente, che è esattamente ciò che devono dimostrare.
 */
const node = (args, env = {}) => {
  const r = spawnSync(process.execPath, args, {
    cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, ...env },
  });
  return { uscita: r.status, testo: `${r.stdout || ""}`, errore: `${r.stderr || ""}` };
};

// ── ① La decisione, sul modulo puro ─────────────────────────────────────────

prova("① AR-464 · --sola-lettura vince su tutto: si guarda e non si scrive", () => {
  const d = decidiScrittura({ solaLettura: true, misuraNuova: { a: 1 }, misuraVecchia: null });
  assert.equal(d.scrivi, false, "chi diagnostica da fuori non deve lasciare impronte");
  assert.match(d.motivo, /sola.lettura/i, "il motivo deve dire PERCHÉ non ha scritto");
});

prova("② AR-639 · se cambia solo l'ora, non si riscrive", () => {
  const vecchia = { misurato: "2026-08-14 09:00", quota: 50, finestra: 26 };
  const nuova = { misurato: "2026-08-14 21:00", quota: 50, finestra: 26 };
  const d = decidiScrittura({ misuraNuova: nuova, misuraVecchia: vecchia });
  assert.equal(d.scrivi, false, "senza questo, verificare costa un diff e il controllo si spegne");
});

prova("③ AR-639 · se cambia il contenuto vero, si riscrive", () => {
  const vecchia = { misurato: "2026-08-14 09:00", quota: 50 };
  const nuova = { misurato: "2026-08-14 21:00", quota: 12 };
  assert.equal(decidiScrittura({ misuraNuova: nuova, misuraVecchia: vecchia }).scrivi, true,
    "il rimedio non deve impedire a una notizia vera di entrare nel file");
});

prova("④ AR-568 · cieco non sovrascrive vedente: copertura più bassa da un altro posto si rifiuta", () => {
  const vps = { origine: "vps", copertura: 18, misurato: "2026-08-14 09:00" };
  const cloud = { origine: "cloud", copertura: 2, misurato: "2026-08-14 21:00" };
  const d = decidiScrittura({ misuraNuova: cloud, misuraVecchia: vps });
  assert.equal(d.scrivi, false, "una misura più povera non deve vincere solo perché è più recente");
  assert.equal(d.affianca, true, "la misura nuova non si butta: si mette accanto");
});

prova("⑤ AR-568 · copertura IGNOTA è ignota, non zero e non «va bene»", () => {
  const vecchia = { origine: "vps", copertura: 18 };
  const anonima = { origine: "cloud" }; // non dichiara quanto ha visto
  assert.equal(decidiScrittura({ misuraNuova: anonima, misuraVecchia: vecchia }).scrivi, false,
    "trattare «non lo so» come «zero» ricostruirebbe il difetto dentro la cura");
});

prova("⑥ AR-568 · un calo dallo STESSO posto è una notizia, e deve poter entrare", () => {
  const prima = { origine: "vps", copertura: 18 };
  const dopo = { origine: "vps", copertura: 4 }; // un sensore è caduto davvero
  assert.equal(decidiScrittura({ misuraNuova: dopo, misuraVecchia: prima }).scrivi, true,
    "senza questa riga un guasto vero non entrerebbe più, e la memoria resterebbe all'ultimo giorno buono");
});

prova("⑦ AR-568 · una vecchia illeggibile non passa per «non c'era niente»", () => {
  const d = decidiScrittura({ misuraNuova: { copertura: 3 }, misuraVecchia: null, vecchiaLeggibile: false });
  assert.equal(d.scrivi, true, "si ripara");
  assert.match(d.motivo, /legg|ripar|rott/i, "il motivo deve dire che è una riparazione, non un confronto vinto");
});

prova("⑧ AR-286 · l'origine si deduce dall'ambiente, e senza indizi non si millanta il vps", () => {
  assert.equal(origineCorrente({ SALUTE_CASA: "vps" }), "vps");
  assert.equal(origineCorrente({ CLAUDE_CODE_REMOTE: "1" }), "cloud");
  assert.equal(origineCorrente({}), "locale", "senza indizi si dice locale, MAI vps");
  assert.equal(typeof timbroProvenienza({ env: {}, copertura: 3 }).origine, "string",
    "ogni misura deve poter dire da quale computer è stata scritta");
});

prova("⑨ i campi-timbro non contano nel confronto, il resto sì", () => {
  const a = { data: "x", aggiornato: "y", vero: 1 };
  const b = { data: "z", aggiornato: "w", vero: 1 };
  assert.equal(stessoContenuto(a, b), true, "cambiare solo l'ora non è cambiare");
  assert.equal(stessoContenuto(a, { ...b, vero: 2 }), false, "cambiare il dato è cambiare");
  assert.ok(CAMPI_TIMBRO.includes("data"), "il registro dei campi-timbro deve contenere `data`");
  assert.equal(contenutoSostanziale(a).data, undefined, "il timbro esce dal contenuto sostanziale");
});

// ── ② Gli script veri, guidati su una cartella temporanea ───────────────────

prova("⑩ AR-663 · il referto è deviabile, e la memoria vera non si tocca", () => {
  const finto = join(sabbiera, "blocco-mancante.json");
  node(["cervello/conta-blocco-mancante.mjs", "--aggiorna-tetto"], { BLOCCO_MANCANTE_FILE: finto });
  assert.ok(existsSync(finto), "senza la variabile d'ambiente la prova sporcherebbe il referto VERO");
});

prova("⑪ AR-663 · con --json si guarda e non si scrive", () => {
  const finto = join(sabbiera, "solo-json.json");
  node(["cervello/conta-blocco-mancante.mjs", "--json"], { BLOCCO_MANCANTE_FILE: finto });
  assert.equal(existsSync(finto), false, "interrogare per sapere lo stato non deve cambiarlo");
});

prova("⑫ AR-639 · due esecuzioni identiche lasciano il file uguale BYTE PER BYTE", () => {
  const finto = join(sabbiera, "tasso.json");
  const env = { TASSO_CHIUSURA_FILE: finto };
  node(["cervello/tasso-chiusura.mjs"], env);
  assert.ok(existsSync(finto), "la prima esecuzione deve scrivere: non c'era niente prima");
  const primo = readFileSync(finto, "utf8");
  node(["cervello/tasso-chiusura.mjs"], env);
  assert.equal(readFileSync(finto, "utf8"), primo,
    "la seconda non ha niente di nuovo da dire: se riscrive, verificare costa un diff (AR-464)");
});

// ── ③ La prova che chiede la scheda di AR-464, testualmente ─────────────────

prova("⑬ AR-464 · due guardiani lanciati con --sola-lettura non toccano il loro file di stato", () => {
  // ⚠️ La prima versione chiedeva «git status VUOTO» su TUTTO l'albero, ed è la prova chiesta dalla
  // scheda alla lettera. Ma in CI la suite gira a quattro processi insieme: qualunque altra prova
  // che scrive un file rende rosso questo caso, e la colpa finisce sui due guardiani che non
  // c'entrano niente. Un rosso che non appartiene a chi lo vede è il modo più veloce per imparare a
  // ignorarlo — la stessa cosa che questo lotto ha curato altrove.
  //
  // Quindi si guarda l'impronta dei DUE FILE che questi guardiani scrivono, non l'intero albero:
  // l'affermazione vera è «questi due non lasciano impronte», non «nessuno nel repo ha scritto».
  const sorvegliati = [
    "MyCity-Vault/90-Memoria-AI/auto-coscienza/stampo-check.json",
    "MyCity-Vault/90-Memoria-AI/auto-coscienza/coerenza-fatti.json",
  ];
  const impronta = () => sorvegliati.map((f) => {
    try { return `${f}:${readFileSync(join(REPO, f), "utf8").length}`; }
    catch { return `${f}:assente`; }
  }).join("|");

  const prima = impronta();
  node(["cervello/coerenza-fatti.mjs", "--sola-lettura"]);
  node(["cervello/stampo-check.mjs", "--sola-lettura"]);
  assert.equal(impronta(), prima,
    "verificare non deve costare un diff: con --sola-lettura il file di stato non si tocca");

  // E il controllo che rende il caso non-vacuo: il percorso sorvegliato deve essere quello VERO,
  // altrimenti sopra si confronterebbero due «assente» e passerebbe qualunque cosa.
  assert.ok(sorvegliati.some((f) => existsSync(join(REPO, f))),
    "nessuno dei file sorvegliati esiste: questo caso non sta guardando niente");
});

// ── AR-653 · AR-654 — una decisione che vive solo in un file d'ambiente non esiste ──
//
// Nicola aveva spento PostHog il 5/7. La decisione però viveva SOLO in `POSTHOG_OFF=1` dentro il
// `.env`, che non è versionato — e sul VPS quella riga non c'era. Lì la chiave era presente, il
// check partiva davvero, e il sensore risultava VERDE mentre la decisione diceva l'opposto.
//
// La stessa macchina dava due risposte diverse a seconda di dove la si interrogava, e nessuna delle
// due era sbagliata nel suo ambiente: era la decisione a non essere da nessuna parte. La cura non è
// mettere la riga anche sul VPS (sarebbe la stessa fragilità, spostata) — è spostare la decisione
// nel registro versionato, dove viaggia col repo ed è uguale ovunque.

prova("⑭ AR-654 · la decisione di spegnere un sensore sta nel registro versionato, non in un .env", () => {
  const motivi = JSON.parse(readFileSync(join(REPO, "cervello/sensori-motivi.json"), "utf8"));
  const p = motivi?.motivi?.posthog_api;
  assert.ok(p, "senza questa riga la decisione esiste solo nella testa di chi ha scritto il .env");
  assert.equal(p.motivo, "decisione", "«decisione» è lo stato finale sano: Nicola ha scelto");
  assert.ok(String(p.perche || "").length > 40, "un motivo senza il perché è un numero senza fonte");
});

prova("⑮ AR-653 · senza la variabile d'ambiente il sensore è SPENTO lo stesso", () => {
  // È il caso del VPS: la chiave c'è e `POSTHOG_OFF` no. Prima qui usciva «verde».
  //
  // ⚠️ Si legge con `spawnSync` e NON con la scorciatoia che alza l'eccezione: da una sessione senza
  // chiavi il comando esce 2, che in questa casa vuol dire «non ho potuto misurare» e non «errore».
  // Trattare il cieco come un guasto renderebbe questa prova rossa dove non c'è niente di rotto —
  // che è la malattia curata dalla corsia accanto, riprodotta dentro la sua stessa prova.
  const r = node(["cervello/verifica-sensori.mjs", "--json", "--sola-lettura"], { POSTHOG_OFF: "" });
  // Da una macchina senza chiavi il comando esce 2 (cieco) ma il verdetto sui sensori lo stampa
  // lo stesso: è il testo che conta, non il codice d'uscita.
  const posthog = (JSON.parse(r.testo).checks || []).find((c) => c.nome === "posthog_api");
  assert.ok(posthog, "il sensore non compare fra i controlli");
  assert.equal(posthog.spento, true,
    "senza POSTHOG_OFF il check torna a partire e il sensore risulta acceso: la decisione di Nicola sparisce");
  assert.match(posthog.dettaglio || "", /decision/i, "il dettaglio deve dire CHI ha deciso e dove sta scritto");
});

// ── il conto ────────────────────────────────────────────────────────────────
rmSync(sabbiera, { recursive: true, force: true });
for (const c of casi) console.log(`  ${c.ok ? "✓" : "✗"} ${c.nome}${c.ok ? "" : ` → ${c.err}`}`);
const rossi = casi.filter((c) => !c.ok).length;
console.log(`\n# pass ${casi.length - rossi}\n# fail ${rossi}`);
process.exit(rossi ? 1 : 0);
