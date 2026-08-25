#!/usr/bin/env node
// 🧪 AR-568, il residuo — LA PORTA ERA UNA, LA PENNA ERA FACOLTATIVA.
//
// Il difetto madre, del 10/8: da una sessione cloud senza chiavi un comando di DIAGNOSI ha riscritto
// la memoria dei sensori con la propria cecità. I sensori che il VPS aveva misurato «ok» sono
// diventati «non_configurato», e un contatore è passato da 26 misure a 2 — col voto che MIGLIORAVA,
// perché avevo misurato di meno. Un numero che si abbassa restringendo il campione è una bugia che
// sembra un progresso.
//
// La cura di allora ha fatto la parte grossa: una porta sola (`scriviStatoSensore`) e la regola
// «cieco non sovrascrive vedente». La scheda però dichiarava un residuo, e il residuo era vero —
// verificato sul codice il 23/8, non creduto sulla parola:
//
//   · il freno viveva nella PENNA (`scriviJsonAtomico`), e la penna si passava come parametro;
//   · `verifica-sensori` e `delta-gate` la passavano, `sensore-cassa` e `sentinella-fonti` no —
//     quei due finivano sul `writeFileSync` crudo, senza freno e senza scrittura atomica;
//   · e il freno si accende solo se il documento che c'è già dichiara `origine`. Quei file
//     l'origine non l'hanno mai avuta (`cassa-runway.json` non ce l'ha tuttora), quindi anche con
//     la penna giusta sarebbero passati lo stesso.
//
// Cioè: una porta con un freno a richiesta. Adesso la penna non si sceglie e il timbro lo mette la
// porta, quindi non c'è più niente da ricordare.
//
// I file qui sotto sono tutti finti, in una cartella temporanea: nessuna prova tocca la memoria
// vera. È la lezione di AR-799, pagata oggi stesso — le mie prove avevano sporcato lo storico della
// salute e il conto dei chiusi era crollato da 679 a 1.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync as execFileSyncVero } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SCRITTORI_STATO_SENSORI, scriviStatoSensore, verificaAdozione } from "../stato-sensori.mjs";

const cartella = () => mkdtempSync(join(tmpdir(), "stato-sensori-"));
const leggi = (p) => JSON.parse(readFileSync(p, "utf8"));

/** Il file com'è adesso, o `null` se non c'è: serve a dire «non si è mosso» senza pretendere che esista. */
function leggiSeCè(p) {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function radiceCervello() {
  return dirname(dirname(fileURLToPath(import.meta.url)));
}

// ─────────────────────────── la guardia d'ambiente (quella che c'era già) ───────────────────────────

test("senza ambiente configurato non si scrive niente, e si dice perché", () => {
  const dir = cartella();
  try {
    const p = join(dir, "sensori.json");
    const esito = scriviStatoSensore(p, { sensori: {} }, {
      ambienteConfigurato: false,
      motivo: "STRIPE_SECRET_KEY assente",
    });
    assert.equal(esito.scritto, false);
    assert.match(esito.spiegazione, /STRIPE_SECRET_KEY assente/);
    assert.throws(() => readFileSync(p, "utf8"), "il file non deve nemmeno nascere");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ─────────────────────────── il timbro, che adesso lo mette la porta ───────────────────────────

test("un documento di stato-sensore non può nascere senza origine", () => {
  const dir = cartella();
  try {
    const p = join(dir, "sensori.json");
    scriviStatoSensore(p, { sensori: { stripe: "ok" } }, { ambienteConfigurato: true });
    const scritto = leggi(p);
    assert.ok(scritto.origine, "senza origine il freno della copertura non si accende nemmeno");
    assert.equal(scritto.sensori.stripe, "ok", "e il contenuto di chi misura resta il suo");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("la copertura dichiarata finisce nel documento: è il numero che il freno confronta", () => {
  const dir = cartella();
  try {
    const p = join(dir, "sensori.json");
    scriviStatoSensore(p, { sensori: {} }, { ambienteConfigurato: true, copertura: 12, scrittoDa: "prova.mjs" });
    const scritto = leggi(p);
    assert.equal(scritto.copertura, 12);
    assert.equal(scritto.scritto_da, "prova.mjs");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("non dichiarare la copertura NON la mette a zero: «ignota» e «zero» sono due cose diverse", () => {
  const dir = cartella();
  try {
    const p = join(dir, "sensori.json");
    scriviStatoSensore(p, { sensori: {} }, { ambienteConfigurato: true });
    assert.equal("copertura" in leggi(p), false, "una copertura a zero direbbe «ho guardato e non c'era niente»");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("un documento che non è un oggetto si scrive lo stesso, senza deformarlo", () => {
  const dir = cartella();
  try {
    const p = join(dir, "elenco.json");
    const esito = scriviStatoSensore(p, [1, 2, 3], { ambienteConfigurato: true });
    assert.equal(esito.scritto, true);
    assert.deepEqual(leggi(p), [1, 2, 3], "un array non ha un posto per il timbro: si scrive intero");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ─────────────────────────── IL CASO CHE HA GENERATO TUTTO ───────────────────────────

test("LA PROVA MADRE: chi ha visto meno non cancella chi ha visto di più, e non dice di averlo fatto", () => {
  const dir = cartella();
  try {
    const p = join(dir, "sensori.json");
    // Il VPS ha misurato 26 cose, con le chiavi in mano.
    writeFileSync(p, JSON.stringify({ origine: "vps", copertura: 26, sensori: { stripe: "ok" } }, null, 2), "utf8");

    // La sessione cloud ne ha viste 2, e sono altre. Senza freno questo file diventava la verità.
    // `MYCITY_ORIGINE` è il nome vero che `origineCorrente` legge: scrivendone uno inventato la
    // prova sarebbe passata lo stesso — l'origine sarebbe caduta su «locale», che è comunque diversa
    // da «vps» — cioè per un motivo vicino ma non quello dichiarato. Trovato rileggendo.
    const esito = scriviStatoSensore(p, { sensori: { stripe: "non_configurato" } }, {
      ambienteConfigurato: true,
      copertura: 2,
      env: { MYCITY_ORIGINE: "cloud" },
    });

    const dopo = leggi(p);
    assert.equal(dopo.copertura, 26, "la misura ricca deve restare");
    assert.equal(dopo.sensori.stripe, "ok", "e Stripe non deve risultare spento su una macchina dove funziona");
    assert.equal(esito.scritto, false, "e chi ha chiamato NON deve sentirsi dire «scritto»: era la bugia di prima");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("chi ha visto di PIÙ scrive, e la misura povera non blocca per sempre il file", () => {
  const dir = cartella();
  try {
    const p = join(dir, "sensori.json");
    writeFileSync(p, JSON.stringify({ origine: "cloud", copertura: 2, sensori: { stripe: "non_configurato" } }, null, 2), "utf8");
    const esito = scriviStatoSensore(p, { sensori: { stripe: "ok" } }, {
      ambienteConfigurato: true,
      copertura: 26,
      env: { MYCITY_ORIGINE: "vps" },
    });
    assert.equal(esito.scritto, true, "un freno che non lascia mai passare nessuno non è un freno, è un muro");
    assert.equal(leggi(p).sensori.stripe, "ok");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ─────────────── la seconda istanza: il diario che si riscriveva anche in sola lettura ───────────────

test("in sola lettura il diario versionato del sorvegliante non si muove, e lo dice come freno non come guasto", () => {
  const cervello = radiceCervello();
  const diario = join(cervello, "..", "MyCity-Vault/90-Memoria-AI/auto-coscienza/sorvegliante-storico.json");
  const prima = leggiSeCè(diario);

  let uscita = "";
  try {
    uscita = execFileSyncVero(process.execPath, [join(cervello, "memoria-guardia.mjs"), "--chiudi"], {
      encoding: "utf8",
      env: { ...process.env, MYCITY_MEMORIA_SOLA_LETTURA: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    // Esce 2 apposta: «non ho archiviato» non è «ho archiviato niente».
    uscita = `${e.stdout || ""}${e.stderr || ""}`;
  }

  assert.equal(leggiSeCè(diario), prima, "la memoria vera non deve muoversi quando la corsa è in sola lettura");
  assert.match(uscita, /freno che ha funzionato/, "e non deve suonare come un guasto: il freno che frena è la cosa giusta");
});

// ─────────────────────────── la classe intera, non un file solo ───────────────────────────

test("tutti gli scrittori della classe passano dalla porta", () => {
  const { ok, fuori } = verificaAdozione();
  assert.ok(ok, `questi scrivono stato di sensore senza passare dalla porta: ${fuori.join(", ")}`);
  assert.equal(SCRITTORI_STATO_SENSORI.length, 4, "se un nome sparisce dall'elenco, quel file esce dal controllo in silenzio");
});

test("nessuno di loro sceglie più la penna: non c'è un parametro da dimenticare", async () => {
  const { readFileSync: leggiFile } = await import("node:fs");
  const { dirname, join: unisci } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const cervello = dirname(dirname(fileURLToPath(import.meta.url)));
  for (const nome of SCRITTORI_STATO_SENSORI) {
    const testo = leggiFile(unisci(cervello, nome), "utf8");
    assert.ok(
      !/\bscrittore\s*:/.test(testo),
      `${nome} passa ancora una penna: il freno tornerebbe a dipendere da chi si ricorda di darla`,
    );
  }
});
