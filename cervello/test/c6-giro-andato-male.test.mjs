#!/usr/bin/env node
// 🧪 AR-367 — IL FILE CHE DICE COM'È ANDATO L'ULTIMO GIRO, E CHE NON APRIVA NESSUNO.
//
// `esito-giro.json` si autodescrive: «questo file dice la verita, e il Pannello la puo leggere».
// Il Pannello non lo leggeva: zero occorrenze di `esito-giro` in tutto `pannello/src`. Per due
// giorni il file ha detto `pulito: false, gate_rossi: 2` e la home ha continuato a mostrare 🟢 Viva,
// perché `macchinaViva` guardava SE un giro fosse avvenuto e mai se fosse andato a buon fine.
//
// La causa di sistema: il difetto era stato chiuso quando l'esito veniva SCRITTO, non quando veniva
// CONSUMATO. La macchina considera un fatto «reso disponibile» equivalente a «usato».
//
// PERCHÉ QUESTO TEST GUIDA IL FILE VERO invece di guardarne il testo: un controllo a pattern
// («battito.ts nomina esito-giro?») passerebbe anche con la lettura scollegata dal verdetto — ed è
// la forma di prova che ha lasciato vivere questo difetto. Qui si importa `battito.ts` davvero, con
// `@/lib/store` e `@/lib/vault` sostituiti da due finti: se qualcuno stacca la lettura, o rimette
// `macchinaViva` a guardare solo l'orologio, questo test diventa rosso.

import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

// I due doppi: rispondono da variabili globali, così ogni prova monta la sua situazione.
const FINTI = new Map([
  ["@/lib/store", "export async function getImpostazione(k){ return globalThis.__c6_imp?.[k] ?? null; }"],
  ["@/lib/vault", "export async function readVaultFile(p){ const v = globalThis.__c6_vault?.[p]; if (v === undefined) throw new Error('manca ' + p); return v; }"],
]);

registerHooks({
  resolve(spec, ctx, next) {
    if (FINTI.has(spec)) return { url: `c6-finto:${spec}`, shortCircuit: true };
    // Gli altri `@/…` sono file veri del Pannello: si risolvono al loro percorso.
    if (spec.startsWith("@/")) return next(pathToFileURL(`${join(REPO, "pannello/src", spec.slice(2))}.ts`).href, ctx);
    return next(spec, ctx);
  },
  load(url, ctx, next) {
    if (url.startsWith("c6-finto:")) return { format: "module", source: FINTI.get(url.slice("c6-finto:".length)), shortCircuit: true };
    return next(url, ctx);
  },
});

const B = await import(join(REPO, "pannello/src/lib/battito.ts"));
const MF = await import(join(REPO, "pannello/src/lib/memoria-ferma.ts"));

/** Monta la situazione che il Pannello troverebbe, e restituisce i segnali VERI. */
async function segnaliCon({ giro = null, esito = undefined, worker = null } = {}) {
  globalThis.__c6_imp = { "worker:ultimo": worker };
  globalThis.__c6_vault = {
    "90-Memoria-AI/ultimo-briefing.json": giro ? JSON.stringify({ data: giro }) : "{}",
    [B.PERCORSO_ESITO_GIRO]: esito === undefined ? null : JSON.stringify(esito),
  };
  return B.raccogliSegnaliBattito();
}

const oreFa = (n) => new Date(Date.now() - n * 3600_000).toISOString();
const quandoVault = (n) => {
  const d = new Date(Date.now() - n * 3600_000);
  return d.toLocaleString("sv-SE", { timeZone: "Europe/Rome" }).slice(0, 16);
};

test("il Pannello ADESSO apre esito-giro.json e ne porta il contenuto nei segnali", async () => {
  const s = await segnaliCon({ giro: quandoVault(1), esito: { data: quandoVault(1), pulito: false, gate_rossi: 2, esito: "vincoli-attivi" } });
  assert.ok(s.esitoGiro, "senza questa lettura il difetto è di nuovo aperto: nessuno apre il file");
  assert.equal(s.esitoGiro.pulito, false);
  assert.equal(s.esitoGiro.gateRossi, 2);
});

test("un giro recente ma con due cancelli rossi NON è una macchina viva", async () => {
  const s = await segnaliCon({ giro: quandoVault(1), esito: { data: quandoVault(1), pulito: false, gate_rossi: 2 } });
  assert.equal(B.macchinaViva(s), false, "è lo stato reale del 27/7-29/7, e la home diceva 🟢 Viva");
  assert.match(B.comeStaLaMacchina(s), /2 cancelli rossi/, "il Pannello deve poter dire COSA è andato storto");
});

test("un giro recente e pulito resta verde: il freno non spegne la macchina sana", async () => {
  const s = await segnaliCon({ giro: quandoVault(1), esito: { data: quandoVault(1), pulito: true, gate_rossi: 0 } });
  assert.equal(B.macchinaViva(s), true);
});

test("se l'esito non si legge, la risposta è ⚪ e non un verde", async () => {
  const senzaFile = await segnaliCon({ giro: quandoVault(1), esito: undefined });
  assert.equal(senzaFile.esitoGiro, null);
  assert.equal(B.macchinaViva(senzaFile), false, "«c'è stato un giro» non vuol dire «è andato bene»");
  assert.equal(MF.verdettoUltimoGiro(1, null).stato, "non_visto");
});

test("il worker che batte adesso resta un fatto misurato: quello sì tiene viva la macchina", async () => {
  const s = await segnaliCon({ giro: quandoVault(1), esito: { data: quandoVault(1), pulito: false, gate_rossi: 3 }, worker: oreFa(0.01) });
  assert.equal(B.macchinaViva(s), true, "il battito del worker è adesso, non è il racconto di com'è andata prima");
});

test("un giro pulito ma di tre giorni fa è vecchio: pulito non vuol dire recente", () => {
  const v = MF.verdettoUltimoGiro(72, { quando: "2026-08-11 09:00", pulito: true, gateRossi: 0, esito: "ok" });
  assert.equal(v.stato, "stantio");
  assert.equal(v.verde, false);
});

test("il file vero del vault passa dal lettore vero senza rompersi", async () => {
  const { readFileSync } = await import("node:fs");
  const testo = readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/esito-giro.json"), "utf8");
  const s = MF.segnaleGiroDaJson(testo);
  assert.ok(s, "il formato vero deve essere leggibile: se cambia, questo test lo dice subito");
  assert.equal(typeof s.pulito, "boolean");
});
