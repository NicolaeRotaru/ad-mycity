#!/usr/bin/env node
// 🧪 «La card mostrava il 20 luglio come se fosse oggi» (Nicola, 2026-08-10).
//
// La cosa che questo test protegge non è il calcolo dei giorni — è che la SOGLIA resti derivata
// dalle fonti e non scritta a mano in due posti. Due copie di una soglia divergono sempre: cambia
// la cadenza di una fonte, il cervello lo sa e il Pannello no, e la card torna a mentire per omissione.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SOGLIA_GIORNALIERA,
  SOGLIA_SETTIMANALE,
  dataDaIntestazione,
  giorniFra,
  giudica,
  soglieDaFonti,
} from "../freschezza-intelligence.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "../..");
const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

const OGGI = "2026-08-10";

prova("legge la data dall'intestazione, nelle due forme che l'AD scrive davvero", () => {
  // Le intestazioni vere dei file al 10/8, copiate tali e quali.
  assert.equal(dataDaIntestazione("# 🕳️ Buchi di Mercato — 2026-07-20\n\n> Aggiornato: 20 luglio 2026 20:22"), "2026-07-20");
  assert.equal(dataDaIntestazione("# ⭐ Reputazione\n\n> Aggiornato: **18 luglio 2026 10:00**"), "2026-07-18");
  assert.equal(dataDaIntestazione("# Senza nessuna data qui dentro"), null);
});

prova("conta i giorni come li conta una persona", () => {
  assert.equal(giorniFra("2026-08-10", OGGI), 0);
  assert.equal(giorniFra("2026-08-09", OGGI), 1);
  assert.equal(giorniFra("2026-07-20", OGGI), 21);
});

prova("LA REGOLA: la soglia si deriva dalle cadenze delle fonti", () => {
  const s = soglieDaFonti([
    { scrive_in: "eventi-picchi", cadenza: "giornaliera" },
    { scrive_in: "eventi-picchi", cadenza: "settimanale" },
    { scrive_in: "radar-concorrenti", cadenza: "settimanale" },
  ]);
  assert.equal(s["eventi-picchi"].soglia, SOGLIA_GIORNALIERA, "una sola fonte giornaliera basta a renderla quotidiana");
  assert.equal(s["radar-concorrenti"].soglia, SOGLIA_SETTIMANALE, "solo settimanali → soglia larga");
});

prova("la soglia segue il radar vero, non un numero copiato", () => {
  const radar = JSON.parse(readFileSync(join(REPO, "cervello/radar-fonti.json"), "utf8"));
  const s = soglieDaFonti(radar.fonti);
  assert.ok(s["radar-concorrenti"], "radar-concorrenti deve avere fonti dichiarate");
  assert.equal(
    s["radar-concorrenti"].soglia,
    SOGLIA_SETTIMANALE,
    "oggi i concorrenti hanno solo fonti settimanali: se domani ne aggiungi una giornaliera, questa soglia deve stringersi DA SOLA"
  );
});

prova("IL DIFETTO: un'analisi di 21 giorni è scaduta, e lo dice", () => {
  const g = giudica({ presente: true, testo: "# Buchi — 2026-07-20", soglia: 2, oggi: OGGI });
  assert.equal(g.stato, "scaduta");
  assert.equal(g.scaduta, true);
  assert.equal(g.giorni, 21);
  assert.match(g.frase, /21 giorni fa/);
});

prova("un'analisi dentro la soglia resta fresca", () => {
  const g = giudica({ presente: true, testo: "# X — 2026-08-09", soglia: 2, oggi: OGGI });
  assert.equal(g.stato, "fresca");
  assert.equal(g.frase, "aggiornata ieri");
});

prova("⚪ senza data NON è verde e NON è rosso: è «non l'ho potuto misurare»", () => {
  const g = giudica({ presente: true, testo: "# Analisi senza data in cima", soglia: 2, oggi: OGGI });
  assert.equal(g.stato, "senza-data");
  assert.equal(g.scaduta, false, "chiamarla scaduta sarebbe inventare");
  assert.equal(g.giorni, null, "e inventare un numero di giorni sarebbe peggio");
  assert.match(g.frase, /non posso dire/i, "il limite va detto, non nascosto");
});

prova("mai scritta = da trattare come scaduta", () => {
  const g = giudica({ presente: false, testo: "", soglia: 2, oggi: OGGI });
  assert.equal(g.stato, "mai-scritta");
  assert.equal(g.scaduta, true);
});

// La copia lato Pannello esiste (due runtime diversi). Le due possono divergere sul CODICE, mai
// sui NUMERI: questo controllo è ciò che tiene onesta la duplicazione.
prova("le soglie del Pannello sono le stesse del cervello", () => {
  const ts = readFileSync(join(REPO, "pannello/src/lib/freschezza-intelligence.ts"), "utf8");
  const g = ts.match(/SOGLIA_GIORNALIERA\s*=\s*(\d+)/);
  const s = ts.match(/SOGLIA_SETTIMANALE\s*=\s*(\d+)/);
  assert.ok(g && s, "le due soglie devono essere dichiarate anche lato Pannello");
  assert.equal(+g[1], SOGLIA_GIORNALIERA, "soglia giornaliera divergente fra Pannello e cervello");
  assert.equal(+s[1], SOGLIA_SETTIMANALE, "soglia settimanale divergente fra Pannello e cervello");
  assert.ok(
    /radar-fonti\.json/.test(readFileSync(join(REPO, "pannello/src/app/api/intelligence/route.ts"), "utf8")),
    "l'API deve leggere il radar: se si mettesse a decidere la soglia da sola, tornerebbero due verità"
  );
});

prova("la card mostra l'età: la riga non può sparire senza far fallire questo test", () => {
  const tsx = readFileSync(join(REPO, "pannello/src/components/Intelligence.tsx"), "utf8");
  assert.ok(/freschezza/.test(tsx), "il componente deve ricevere la freschezza dall'API");
  assert.ok(/questa analisi è vecchia/i.test(tsx), "e deve dirlo in chiaro quando è scaduta");
});

prova("l'invecchiamento arriva anche a chi non sta guardando quella scheda", () => {
  const alert = readFileSync(join(REPO, "pannello/src/app/api/alert/route.ts"), "utf8");
  assert.ok(/S-intel-vecchia/.test(alert), "senza un alert, la data la vede solo chi apre la scheda giusta");
  const giro = readFileSync(join(REPO, "cervello/giro.sh"), "utf8");
  assert.ok(/freschezza-intelligence\.mjs/.test(giro), "e la macchina deve accorgersene da sola a ogni giro");
});

const rotti = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n   ↳ ${c.err}`}`);
console.log(`\n${casi.length - rotti.length}/${casi.length} prove passate.`);
process.exit(rotti.length ? 1 : 0);
