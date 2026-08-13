#!/usr/bin/env node
// 🧪 «NON HO MISURATO» NON PUÒ USCIRE VERDE — la prova del modulo condiviso.
//
// Questo file guarda la decisione, non i punti che la usano: i punti hanno la loro prova ciascuno.
// Qui si prova che la decisione è FAIL-CLOSED, cioè che ogni strada che non è «ho guardato tutto e
// andava bene» finisce su `cieco`. È la proprietà che serviva agli otto difetti del lotto, e nessuno
// dei loro autori ce l'aveva in mente: ognuno aveva scritto il ramo buono come default.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const M = await import(join(QUI, "..", "misura-o-cieco.mjs"));
const { verdettoCopertura, codiceUscita, etaMinuti, misuraScaduta, esitoNoto, OK, CIECO, ROTTO, SCONOSCIUTO } = M;

// ── ① la copertura ───────────────────────────────────────────────────────────

test("c'era roba da guardare e non ne ho guardata nessuna → cieco, non verde", () => {
  const v = verdettoCopertura({ misurati: 0, daMisurare: 4 });
  assert.equal(v.esito, CIECO, "è il caso esatto di AR-473: forma-json che esce 0 senza aver confrontato niente");
  assert.equal(v.codice, 2);
});

test("non c'era niente da guardare → verde, e il verde è onesto", () => {
  const v = verdettoCopertura({ misurati: 0, daMisurare: 0 });
  assert.equal(v.esito, OK, "un ramo che davvero non tocca JSON non deve diventare un ⚪ permanente");
  assert.equal(v.codice, 0);
});

test("non so quanto c'era e non ho misurato niente → cieco (il default è la cecità)", () => {
  assert.equal(verdettoCopertura({}).esito, CIECO, "chi chiama male il modulo non deve ottenere un verde in regalo");
  assert.equal(verdettoCopertura({ misurati: 0 }).esito, CIECO);
});

test("basta UNA cosa non misurata perché il verde non si possa più dare", () => {
  const v = verdettoCopertura({ misurati: 12, daMisurare: 13, nonMisurati: ["timer systemd: qui non esiste"] });
  assert.equal(v.esito, CIECO, "12 su 13 non è «tutto a posto»: è copertura parziale, e va detta");
  assert.deepEqual(v.non_misurati, ["timer systemd: qui non esiste"]);
});

test("una violazione trovata vince sul buco: il rosso non si annacqua nel ⚪", () => {
  const v = verdettoCopertura({ misurati: 1, daMisurare: 9, violazioni: 1, nonMisurati: ["otto non le ho viste"] });
  assert.equal(v.esito, ROTTO, "aver visto poco non rende meno vero ciò che si è visto");
  assert.equal(v.codice, 1);
});

test("ho guardato tutto e non c'era niente di storto → verde", () => {
  const v = verdettoCopertura({ misurati: 5, daMisurare: 5 });
  assert.equal(v.esito, OK);
  assert.equal(v.codice, 0);
});

test("il codice d'uscita di un esito che non conosco è 2, mai 0", () => {
  assert.equal(codiceUscita(OK), 0);
  assert.equal(codiceUscita(ROTTO), 1);
  assert.equal(codiceUscita(CIECO), 2);
  assert.equal(codiceUscita("boh"), 2, "passare una stringa nuova sarebbe il modo più comodo di riottenere il verde");
  assert.equal(codiceUscita(undefined), 2);
});

// ── ② la scadenza ────────────────────────────────────────────────────────────

test("una misura senza timbro è stantia: non si può dimostrare fresca", () => {
  const s = misuraScaduta(null, 180);
  assert.equal(s.stantia, true, "è l'ok dell'MCP rimasto vero undici giorni (AR-364)");
  assert.equal(s.eta_min, null);
});

test("un timbro nudo è letto come ora di Piacenza, non come ora del server", () => {
  // Lo stesso istante visto da due server con fusi diversi deve dare la STESSA età: è ciò che
  // impedisce a un VPS in UTC di credere che ogni misura sia più fresca di due ore.
  const adesso = new Date("2026-08-13T20:16:00Z"); // = 22:16 a Piacenza (ora legale)
  assert.equal(etaMinuti("2026-08-13 22:16", adesso), 0);
  assert.equal(etaMinuti("2026-08-13 21:16", adesso), 60);
  assert.equal(etaMinuti("2026-08-12 22:16", adesso), 1440);
});

test("un timbro col fuso scritto è un istante esatto e si sottrae e basta", () => {
  const adesso = new Date("2026-08-13T20:16:00Z");
  assert.equal(etaMinuti("2026-08-13T20:16:00Z", adesso), 0);
  assert.equal(etaMinuti("2026-08-13T19:16:00Z", adesso), 60);
  assert.equal(etaMinuti("2026-08-13T22:16:00+02:00", adesso), 0);
});

test("un timbro illeggibile non diventa «fresco»: diventa un buco", () => {
  assert.equal(etaMinuti("mai"), null);
  assert.equal(etaMinuti(""), null);
  assert.equal(misuraScaduta("mai", 180).stantia, true);
});

test("sotto soglia è fresca, sopra soglia non lo è più per nessun consumatore", () => {
  const adesso = new Date("2026-08-13T20:16:00Z");
  assert.equal(misuraScaduta("2026-08-13 20:16", 180, adesso).stantia, false, "120 min < 180");
  assert.equal(misuraScaduta("2026-08-13 19:00", 180, adesso).stantia, true, "196 min > 180");
});

// ── ③ l'etichetta ────────────────────────────────────────────────────────────

test("un esito che non sta nell'elenco non compra il verde", () => {
  const noti = ["ok", "incoerenze"];
  assert.equal(esitoNoto("ok", noti), "ok");
  assert.equal(esitoNoto("incoerenze", noti), "incoerenze");
  assert.equal(esitoNoto("cieco", noti), SCONOSCIUTO, "è il badge della Cabina (AR-646): «cieco» arrivava a Nicola come verde");
  assert.equal(esitoNoto("non_verificato", noti), SCONOSCIUTO);
  assert.equal(esitoNoto(undefined, noti), SCONOSCIUTO);
  assert.equal(esitoNoto(null, noti), SCONOSCIUTO);
});

// ── il modulo non fa partire niente all'import (AR-445) ──────────────────────

test("importare il modulo non esegue nessun programma", async () => {
  const { readFileSync } = await import("node:fs");
  const src = readFileSync(join(QUI, "..", "misura-o-cieco.mjs"), "utf8");
  assert.ok(!/^\s*(main\(\)|process\.exit|console\.log)/m.test(src), "un modulo puro non stampa e non esce");
});

// ── la mappa esaustiva (AR-661 — il segnale della cassa che diceva ok col runway sotto i sei mesi) ───────

test("una mappa esaustiva non regala il verde a una chiave che non conosce", () => {
  const m = { critico: "errore", attenzione: "warn", sconosciuto: "warn", ok: "ok" };
  assert.equal(M.segnaleDa("critico", m), "errore");
  assert.equal(M.segnaleDa("attenzione", m), "warn", "è il caso vero: runway sotto i sei mesi arrivava al Pannello come «ok»");
  assert.equal(M.segnaleDa("ok", m), "ok");
  assert.equal(M.segnaleDa("stato_nuovo", m), "warn", "una chiave mai vista non cade nel ramo buono");
  assert.equal(M.segnaleDa(undefined, m), "warn");
  assert.equal(M.segnaleDa("toString", m), "warn", "nemmeno una chiave che esiste su ogni oggetto passa per misurata");
});
