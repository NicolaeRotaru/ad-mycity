#!/usr/bin/env node
// 🧾 IL CONTO DEL REGISTRO DOPO UN'ONDATA — la prova delle due parti di `cervello/lotto-a-pacchetti.md`
// che si eseguono: il conto di ⑨ e la ricetta di lancio di ⑩ (caso ⑦).
//
// LA MALATTIA: «il conto che guarda nel posto sbagliato e risponde zero». Dopo un'ondata del sito
// l'AD scrive il `registro` del workflow in `problemi[]` di radiografia-marketplace.json (⑩, passo 5).
// Il workflow e il registro chiamano gli stessi campi con nomi diversi — `gravita` contro `severita`,
// `dove` contro `file` — e nessuno stato: una voce scritta coi nomi del workflow non da' errore,
// sparisce. Il 25/10 il collaudo l'ha riprodotto due volte: la ricetta vecchia scriveva voci senza
// `stato`, e il conto di ⑨ stampava 0 mentre crescevano; corretto quello, il conto guardava ancora
// solo le voci «nato dal lotto» e tre campi, e un grave preesistente scritto con `gravita` usciva
// dal piano `--gravi` (129 difetti invece di 130) col conto a zero.
//
// COSA PROVA QUESTO FILE, eseguendo la riga invece di cercarla. La riga NON e' copiata qui: si
// estrae dal foglio a ogni giro, cosi' una modifica del foglio la prova la vede subito.
//   ① il foglio ha UNA riga del conto, e legge il registro del sito
//   ② una voce scritta bene esce 0, e conta il nato in attesa; una voce vecchia chiusa senza fonte
//      (11 su 1396 il 25/10) non e' scritta male
//   ③ senza dimensione, senza stato, con uno stato che il registro non ha: esce 1 e stampa il titolo
//   ④ i due casi del collaudo, su un PREESISTENTE: `gravita` al posto di `severita`, `dove` al posto
//      di `file`: esce 1 e stampa il titolo
//   ⑤ una voce aperta senza fonte e una senza titolo: esce 1
//   ⑥ un registro senza `problemi` non e' mai un verde muto
//   ⑦ la ricetta di ⑩, passo 3, letta dal foglio e data al workflow vero, lo lancia senza fermarlo,
//      e il tipo segue i permessi: squadra e lenti che mutano tech, lente B e riesame qa
//
// NON-VACUITÀ (eseguita il 25/10 sul foglio vero, poi rimesso com'era, md5 uguale). Tolto dalla riga
// il controllo dello stato: rosso ③ (senza stato, stato che non c'e'). Tolto quello della severita, o
// del file: rosso ④. Tolto quello della dimensione: rosso ③. La fonte non pretesa: rosso ⑤. Rimessa
// la riga di prima, che guardava solo i nati e tre campi: rossi ④ e ⑤. Una seconda riga del conto
// nel foglio: rosso ①. Rimesso `tipo: "tech"` nella ricetta, o aggiunto `tipo_controlla: "tech"`, o
// tolta la `base`: rosso ⑦.
//
// Uso: node cervello/test/lotto-a-pacchetti-conto.test.mjs   (0 verde, 1 rosso)

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const FOGLIO = resolve(QUI, "..", "lotto-a-pacchetti.md");
const REGISTRO = "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json";

/** Le righe del foglio che sono il conto di ⑨: un comando `node -e '…'` che legge il registro. */
function righeDelConto(testo) {
  return testo.split("\n").filter((r) => r.startsWith("node -e '") && r.includes(REGISTRO));
}

const CONTO = righeDelConto(readFileSync(FOGLIO, "utf8"))[0];

/** Fa girare la riga come la lancia l'AD — dalla radice, in una shell — su un registro finto. */
function gira(registro) {
  const radice = mkdtempSync(join(tmpdir(), "conto-lotto-"));
  try {
    mkdirSync(join(radice, dirname(REGISTRO)), { recursive: true });
    writeFileSync(join(radice, REGISTRO), JSON.stringify(registro));
    const r = spawnSync("bash", ["-c", CONTO], { cwd: radice, encoding: "utf8", timeout: 30000 });
    if (r.error) throw r.error; // senza shell non e' un verde: la prova cade e lo dice
    return { codice: r.status, uscita: (r.stdout || "") + (r.stderr || "") };
  } finally {
    rmSync(radice, { recursive: true, force: true });
  }
}

// Una voce come la scrive il passo 5 di ⑩, tutta: e' il punto di partenza di ogni caso storto.
const BUONA = Object.freeze({
  titolo: "Il riepilogo della cassa mostra il totale prima dello sconto",
  severita: "minore",
  file: "app/checkout/page.tsx:212",
  stato: "aperto",
  dimensione: "checkout-carrello",
  fonte: "nato dal lotto #999",
  descrizione: "npx vitest run tests/unit/riepilogo.test.ts",
});
// Una voce vecchia del registro vero: chiusa, senza fonte. Il conto non deve chiamarla scritta male.
const VECCHIA = Object.freeze({ titolo: "La bacheca del venditore resta uno scheletro", severita: "grave", file: "app/venditore/page.tsx", stato: "chiuso", dimensione: "stati-ui" });

const senza = (campo, extra) => {
  const v = { ...BUONA, ...extra };
  delete v[campo];
  return v;
};

test("① il foglio ha una riga sola del conto, e legge il registro del sito", () => {
  const righe = righeDelConto(readFileSync(FOGLIO, "utf8"));
  assert.equal(righe.length, 1, "il conto di ⑨ deve essere una riga sola `node -e '…'` che legge " + REGISTRO + ": ne ho trovate " + righe.length);
  assert.ok(righe[0].endsWith("'") && !righe[0].slice("node -e '".length, -1).includes("'"), "un apice singolo dentro la riga la spezzerebbe nella shell");
});

test("② una voce scritta bene esce 0 e conta il nato in attesa; una vecchia chiusa senza fonte non e' scritta male", () => {
  const r = gira({ problemi: [BUONA, VECCHIA] });
  assert.equal(r.codice, 0, r.uscita);
  assert.match(r.uscita, /nati dal lotto in attesa: 1\b/);
  assert.match(r.uscita, /scritti male: 0\b/);
});

for (const [nome, voce] of [
  ["senza dimensione", senza("dimensione", { titolo: "Voce senza dimensione" })],
  ["senza stato", senza("stato", { titolo: "Voce senza stato" })],
  ["con uno stato che il registro non ha", { ...BUONA, titolo: "Voce con lo stato del workflow", stato: "fermo" }],
]) {
  test("③ una voce " + nome + " esce 1 e ne stampa il titolo", () => {
    const r = gira({ problemi: [BUONA, VECCHIA, voce] });
    assert.equal(r.codice, 1, r.uscita);
    assert.match(r.uscita, /scritti male: 1\b/);
    assert.ok(r.uscita.includes("scritto male: " + voce.titolo), "il titolo della voce storta deve uscire: " + r.uscita);
    assert.ok(!r.uscita.includes("scritto male: " + BUONA.titolo), "la voce buona non e' scritta male");
  });
}

test("④ un grave PREESISTENTE coi nomi del workflow — gravita, poi dove — esce 1 col suo titolo", () => {
  const pre = { ...BUONA, severita: "grave", fonte: "riesame ondata 2", file: "lib/stripe/payout.ts:40", dimensione: "pagamenti-stripe" };
  const conGravita = senza("severita", { ...pre, titolo: "Il fattorino non viene pagato", gravita: "grave" });
  const conDove = senza("file", { ...pre, titolo: "Il payout parte due volte", dove: "lib/stripe/payout.ts:40" });
  for (const voce of [conGravita, conDove]) {
    const r = gira({ problemi: [BUONA, voce] });
    assert.equal(r.codice, 1, voce.titolo + ": " + r.uscita);
    assert.ok(r.uscita.includes("scritto male: " + voce.titolo), r.uscita);
  }
});

test("⑤ una voce aperta senza fonte, o senza titolo, esce 1", () => {
  const r = gira({ problemi: [BUONA, senza("fonte", { titolo: "Voce aperta senza fonte" })] });
  assert.equal(r.codice, 1, r.uscita);
  assert.ok(r.uscita.includes("scritto male: Voce aperta senza fonte"), r.uscita);
  const s = gira({ problemi: [BUONA, { ...BUONA, titolo: "  " }] });
  assert.equal(s.codice, 1, s.uscita);
  assert.match(s.uscita, /scritto male: \(senza titolo\)/);
});

test("⑥ un registro senza problemi[] non e' mai un verde muto", () => {
  for (const registro of [{}, { problemi: null }, { dimensioni: [] }]) {
    const r = gira(registro);
    assert.notEqual(r.codice, 0, JSON.stringify(registro) + " ha dato verde: " + r.uscita);
  }
});

// ⑦ La ricetta di ⑩, passo 3, si lancia davvero. Il collaudo del 25/10 l'ha seguita alla lettera: il
// foglio diceva di passare `tipo: "tech"`, e il workflow faceva girare come `qa` la lente che muta.
// Qui gli args si leggono dal foglio e si danno al workflow vero, con un motore finto in cui tutto
// regge: la ricetta non deve fermarlo, e chi scrive o muta deve essere tech, chi legge e basta qa.
const WORKFLOW = readFileSync(resolve(QUI, "..", "..", ".claude", "workflows", "ondata-sito.js"), "utf8");
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

/** Gli args del passo 3 di ⑩: le chiavi del blocco commentato, coi valori letterali fra virgolette. */
function argsDellaRicetta(testo) {
  const righe = testo.split("\n");
  const da = righe.findIndex((r) => /^# 3\. il workflow ondata-sito/.test(r));
  const a = righe.findIndex((r, i) => i > da && /^# 4\./.test(r));
  if (da < 0 || a < 0) return null;
  const blocco = righe.slice(da + 1, a).join("\n");
  const chiavi = [...blocco.matchAll(/[{,]\s*#?\s*(\w+):/g)].map((m) => m[1]);
  const letterali = Object.fromEntries([...blocco.matchAll(/(\w+):\s*"([^"]*)"/g)].map((m) => [m[1], m[2]]));
  return { chiavi, letterali };
}

test("⑦ la ricetta di ⑩ lancia il workflow, e il tipo segue i permessi: tech scrive o muta, qa legge", async () => {
  const ricetta = argsDellaRicetta(readFileSync(FOGLIO, "utf8"));
  assert.ok(ricetta && ricetta.chiavi.length, "il passo 3 di ⑩ non si trova piu': la ricetta non e' provabile");
  const SCHEDE = { piano: "finto.json", ondata: 2, lenti_per_file: {}, pacchetti: [
    { chiave: "lib/stripe/payout.ts", file: ["lib/stripe/payout.ts"], rischio: "soldi", lente: "pagamenti-stripe", difetti: [{ chiave: "pagamenti-stripe|rimborso doppio", titolo: "Rimborso doppio", gravita: "grave" }] },
    { chiave: "components/cart/Pay.tsx", file: ["components/cart/Pay.tsx"], rischio: "nessuno", lente: "frontend-ux", difetti: [{ chiave: "frontend-ux|pulsante sparito", titolo: "Pulsante sparito", gravita: "grave" }] },
  ] };
  const finti = { schede: SCHEDE, repo: "sito", radice_ad: "ad", base: "b0" };
  const args = Object.fromEntries(ricetta.chiavi.map((k) => [k, k in ricetta.letterali ? ricetta.letterali[k] : k in finti ? finti[k] : "x"]));
  const chiamate = [];
  const agent = async (prompt, opts) => {
    chiamate.push({ ruolo: opts.label.split(":")[0], tipo: opts.agentType });
    if (/^squadra/.test(opts.label)) {
      const p = SCHEDE.pacchetti.find((x) => opts.label.includes(x.chiave.includes("payout") ? "payout" : "pay-tsx"));
      return { ramo: "fix/x", worktree: "wt-" + opts.label, commit: "c1", chiusi: p.difetti.map((d) => d.chiave), file_toccati: p.file };
    }
    return { regge: true, difetti: [] };
  };
  const corpo = new AsyncFunction("args", "agent", "parallel", "pipeline", "phase", "log", "budget", "workflow", WORKFLOW.replace("export const meta", "const meta"));
  const esito = await corpo(args, agent, (t) => Promise.all(t.map((f) => f())), (xs, uno, due) => Promise.all(xs.map(async (x) => due(await uno(x), x))), () => {}, () => {}, undefined, { runId: "finto" });
  assert.equal(esito.chiedi_a_nicola, false, "con tutto che regge la ricetta non deve fermarsi: " + esito.motivo);
  const atteso = { squadra: "tech", collaudoA: "tech", collaudoAB: "tech", collaudoB: "qa", riesame: "qa" };
  const visti = new Map(chiamate.map((c) => [c.ruolo, c.tipo]));
  for (const [ruolo, tipo] of Object.entries(atteso)) assert.equal(visti.get(ruolo), tipo, ruolo + " gira come " + visti.get(ruolo) + ", il foglio dice " + tipo);
});
