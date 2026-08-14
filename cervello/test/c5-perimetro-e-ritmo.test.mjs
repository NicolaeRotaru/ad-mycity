#!/usr/bin/env node
// Corsia 5 del lotto 41 — la finestra sbagliata quando non è il tempo ma il PERIMETRO e il RITMO.
//
//   · AR-425 — il guardiano del peso pesa solo i quattro file scritti nella sua configurazione, e i
//     più grossi che il giro rilegge a ogni passata non hanno tetto, quindi non vengono nemmeno
//     misurati. Un guardiano non deve poter definire da solo il proprio perimetro.
//   · AR-421 — il cancello dell'allocazione conta un MAGAZZINO (quanti asset esistono) invece di un
//     RITMO (quanti ne nascono): ventisei cartelle vecchie lo tengono muto per sempre.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const CERVELLO = join(REPO, "cervello");

const { percorsiCitati, sforamenti } = await import(join(CERVELLO, "peso-contesto.mjs"));
const { FINESTRA, perimetroScoperto, ritmoVsMagazzino } = await import(join(CERVELLO, "finestra-misura.mjs"));

function esegui(args, env = {}) {
  try {
    const out = execFileSync("node", args, { cwd: REPO, encoding: "utf8", env: { ...process.env, ...env }, timeout: 60000, stdio: ["ignore", "pipe", "pipe"] });
    return { out, code: 0 };
  } catch (e) {
    return { out: String(e.stdout || "") + String(e.stderr || ""), code: e.status ?? 1 };
  }
}

// ── AR-425 ──────────────────────────────────────────────────────────────────

test("AR-425: il perimetro si RICAVA da chi legge i file, non dall'elenco dei tetti", () => {
  const ordine = `
  Aggiorna i 7 numeri in \`MyCity-Vault/90-Memoria-AI/STATO.md\`
  e rileggi \`90-Memoria-AI/AUTO-ANALISI.md\` più MyCity-Vault/90-Memoria-AI/registro-fatti.json.
  `;
  const citati = percorsiCitati(ordine);
  assert.ok(citati.includes("MyCity-Vault/90-Memoria-AI/STATO.md"));
  assert.ok(citati.includes("MyCity-Vault/90-Memoria-AI/AUTO-ANALISI.md"), "anche la forma senza il prefisso del vault è lo stesso file");
  assert.ok(citati.includes("MyCity-Vault/90-Memoria-AI/registro-fatti.json"));
  assert.equal(new Set(citati).size, citati.length, "nessun doppione");
});

test("AR-425: un file dentro il contesto e senza tetto è SCOPERTO, e si vede", () => {
  const copertura = perimetroScoperto(
    ["MyCity-Vault/90-Memoria-AI/STATO.md", "MyCity-Vault/90-Memoria-AI/registro-fatti.json"],
    ["MyCity-Vault/90-Memoria-AI/STATO.md"]
  );
  assert.deepEqual(copertura.scoperti, ["MyCity-Vault/90-Memoria-AI/registro-fatti.json"]);
  assert.equal(copertura.copertura_pct, 50, "la copertura è una MISURA, non la propria configurazione al 100%");

  // E il verdetto lo tratta come una violazione, col motivo scritto.
  const fuori = sforamenti({ "a.md": 100, "b.md": 100 }, { "a.md": 200 });
  const senzaTetto = fuori.find((f) => f.file === "b.md");
  assert.ok(senzaTetto, "un file misurato senza tetto deve finire fra le violazioni");
  assert.match(senzaTetto.motivo, /nessun tetto dichiarato/);
});

test("AR-425 (comando vero): il guardiano pesa più file di quanti tetti ha, e resta CIECO senza fonti", () => {
  const r = esegui([join(CERVELLO, "peso-contesto.mjs"), "--json"]);
  const j = JSON.parse(r.out);
  const conTetto = Object.keys(j.tetti).length;
  const misurati = Object.keys(j.misure).length;
  assert.ok(misurati > conTetto, `misurati ${misurati} file con ${conTetto} tetti: il perimetro non coincide più con la configurazione`);
  assert.ok(j.perimetro.scoperti.length > 0, "i file che entrano nel contesto senza tetto vanno DETTI, non taciuti");
  assert.ok(j.perimetro.fonti.length >= 1, "il perimetro deve dichiarare da dove viene");
  assert.ok(
    j.perimetro.scoperti.includes("MyCity-Vault/90-Memoria-AI/registro-fatti.json"),
    "il caso della scheda: un file grosso che il giro rilegge a ogni passata e che nessuno pesava"
  );

  // Senza le fonti del perimetro il guardiano NON deve tornare verde: sarebbe la malattia rimessa in piedi.
  const vuoto = mkdtempSync(join(tmpdir(), "c5-peso-"));
  try {
    const cieco = esegui([join(CERVELLO, "peso-contesto.mjs")], { PESO_REPO: vuoto });
    assert.notEqual(cieco.code, 0, "senza perimetro il verdetto non può essere «va tutto bene»");
  } finally {
    rmSync(vuoto, { recursive: true, force: true });
  }
});

// ── AR-421 ──────────────────────────────────────────────────────────────────

test("AR-421: ventisei asset vecchi e zero nuovi non sono «va tutto bene»", () => {
  const muto = ritmoVsMagazzino({ magazzino: 26, recenti: 0, giorni: 7 });
  assert.equal(muto.esito, FINESTRA.VUOTA, "il magazzino pieno non deve poter zittire il cancello");
  assert.match(muto.motivo, /nessun asset nuovo/);

  const vivo = ritmoVsMagazzino({ magazzino: 26, recenti: 3, giorni: 7 });
  assert.equal(vivo.esito, FINESTRA.VIVA);

  // Se la finestra non è misurabile (storia git troncata) la risposta è «non lo so», mai zero:
  // dire «non stai producendo» quando non si è potuto guardare è la stessa bugia al contrario.
  const cieco = ritmoVsMagazzino({ magazzino: 26, recenti: null, giorni: 7 });
  assert.equal(cieco.esito, FINESTRA.ASSENTE);
  assert.notEqual(cieco.esito, FINESTRA.VUOTA);
});

test("AR-421 (comando vero): il guardiano misura il ritmo per negozio e ha il suo interruttore", () => {
  const r = esegui([join(CERVELLO, "allocazione-check.mjs"), "--json"]);
  const j = JSON.parse(r.out);
  assert.ok(j.produzione, "il blocco «produzione» deve esistere: è la dimensione che mancava");
  assert.equal(typeof j.produzione.giorni, "number", "la finestra degli asset è una costante dichiarata (GIORNI_FINESTRA_ASSET)");
  assert.ok(Array.isArray(j.produzione.per_negozio) && j.produzione.per_negozio.length > 0);
  for (const n of j.produzione.per_negozio) {
    assert.ok("recenti" in n && "magazzino" in n, `${n.nome}: servono DUE numeri, il magazzino e il ritmo`);
    assert.ok(Object.values(FINESTRA).includes(n.esito));
  }
  // Il conteggio per entità porta il ritmo accanto al magazzino.
  for (const c of Object.values(j.conteggio)) {
    assert.ok("n_recenti" in c, "ogni negozio deve avere anche il numero di asset NUOVI nella finestra");
  }
  assert.equal(j.produzione.gate_acceso, false, "durante la fase tecnica il cancello resta spento: si misura e si dichiara");
});

test("AR-421: col cancello ACCESO il silenzio produttivo diventa una violazione vera", () => {
  // Spento, il guardiano misura e dichiara; acceso, accusa. È la differenza fra un allarme e un
  // rumore — e la scheda chiede esattamente questo finché dura la fase tecnica.
  // ⚠️ In un clone superficiale la finestra di git non esiste, quindi il ritmo esce ASSENTE per
  // tutti: in quel caso la violazione NON deve scattare (accusare qualcuno di non produrre senza
  // aver potuto guardare sarebbe la stessa bugia al contrario). Il test copre entrambi gli stati.
  const acceso = esegui([join(CERVELLO, "allocazione-check.mjs"), "--json"], { ALLOCAZIONE_GATE_PRODUZIONE: "1" });
  const j = JSON.parse(acceso.out);
  assert.equal(j.produzione.gate_acceso, true, "l'interruttore deve arrivare al verdetto, non restare decorativo");
  assert.equal(
    j.produzione.violazione,
    j.produzione.muti.length > 0,
    "col cancello acceso la violazione è ESATTAMENTE «esiste un confermato muto», né più né meno"
  );
  if (j.produzione.ritmo_cieco) {
    assert.equal(j.produzione.muti.length, 0, "un ritmo non misurabile non produce accuse");
    assert.ok(j.produzione.per_negozio.every((n) => n.esito === FINESTRA.ASSENTE));
  }
});
