#!/usr/bin/env node
// 🧭 Le prove di `piani-verita.mjs` — le frasi dei piani che il registro-fatti smentisce.
//
// Il difetto che queste prove tengono chiuso non è «non trova le bugie»: è il suo opposto, ed è più
// letale. Un guardiano che accusa una frase giusta viene spento entro la settimana, e un controllo
// spento è peggio di un controllo mai scritto, perché il verde continua a comparire nei report.
// Alla PRIMA esecuzione su testo vero questa è stata proprio la sua malattia: la regola del Bando
// Commercio ER pescava tre note meteo dell'AD («Martedì 21/7 pioggia»), perché il piano scrive la
// scadenza `21/07` e il meteo `21/7`. Tre falsi su venti.
//
// L'altra faccia, altrettanto silenziosa: la frase che nomina il fatto morto PER DIRE che è morto
// («il bando è chiuso dal 23/6») deve poter stare nel piano. Senza quella valvola l'unico modo di
// riportare il verde sarebbe cancellare la storia invece di correggerla — lo stesso inciampo per
// cui `piani-data.mjs` deve togliersi di mezzo la propria riga prima di misurare.
//
// Provate sul testo, non sui file veri: un metro tarato solo sul repo di oggi non dimostra di saper
// mordere domani. Le ultime due prove, invece, guardano apposta il repo vero — servono a legare le
// regole al registro, che è la casa unica dei fatti (AR-102).

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT } from "../git-github.mjs";
import { corpoDelPiano } from "../piani-data.mjs";
import { REGOLE, accorcia, fattoDalRegistro, fonteBreve, pianoConAvviso, smentiteNelTesto, zonePerRiga } from "../piani-verita.mjs";

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

const colpiDi = (testo, chiave) => smentiteNelTesto(testo).filter((s) => s.regola === chiave);

// ── ① Il falso allarme che ha davvero avuto ─────────────────────────────────

prova("il meteo del 21/7 non è il bando del 21/07", () => {
  const meteo = [
    "- **Martedì 21/7 pioggia** — tema «fresco a casa»; gate: ordine test PQ fatto.",
    "- **21/7 pioggia/temporali** → push delivery indoor solo dopo ordine test.",
    "- **Meteo 21/7 pioggia** → push clienti (gate: ordine test fatto).",
  ].join("\n");
  assert.equal(colpiDi(meteo, "bando-er-aperto").length, 0, "tre note meteo, zero accuse");
});

prova("la stessa data, con dentro il bando, viene invece accusata", () => {
  const riga = "> **Bando Commercio ER 40% — sportello APERTO fino al 21/07/2026** (restano ~26 giorni).";
  assert.equal(colpiDi(riga, "bando-er-aperto").length, 1);
});

prova("il bando scritto senza zero (21/7) resta preso, se la riga parla di bandi", () => {
  const riga = "> Nuova leva: **Bando Commercio ER** (40% fondo perduto, scade **21/7 — 22 giorni**).";
  assert.equal(colpiDi(riga, "bando-er-aperto").length, 1, "il falso allarme non deve costare la presa vera");
});

// ── ② La valvola che rende scrivibile la riparazione ────────────────────────

prova("dire che il bando è chiuso non conta come dire che è aperto", () => {
  const riga = "> ⛔ **Bando Commercio ER: CHIUSO dal 23/6/2026** — la scadenza del 21/07/2026 non è mai stata raggiungibile.";
  assert.equal(colpiDi(riga, "bando-er-aperto").length, 0, "senza questa valvola il piano non è correggibile");
});

prova("dire che la commissione ERA il 12% non conta come dire che è il 12%", () => {
  const riga = "- commissione **10%** sul venduto (era 12% nella prima stesura di giugno).";
  assert.equal(colpiDi(riga, "commissione-12").length, 0);
});

prova("il 12% scritto come valore corrente viene preso", () => {
  const riga = "**Assunzioni 🟡:** AOV **€50** · commissione **12% (€6)** · fee consegna **€3,50**.";
  assert.equal(colpiDi(riga, "commissione-12").length, 1);
});

// ── ③ Le zone: chi ha scritto la frase cambia il rimedio ────────────────────

const BLOCCO_AD = [
  "<!-- 🤖 AD-AGGIORNAMENTO:START · non scrivere qui dentro: lo rigenera l'AD a ogni giro -->",
  "## 🤖 Aggiornamento dell'AD — 2026-07-20 20:22",
  "- **PI26 sportello APERTO fino 30/7 ore 16:00** — se non inviata, priorità alta.",
  "<!-- 🤖 AD-AGGIORNAMENTO:END -->",
].join("\n");

const BLOCCO_DATA = [
  "<!-- 🗓️ AD-DATA:START · riga di servizio -->",
  "> 🗓️ **Ultimo aggiornamento: 2026-06-25 12:34** — il giorno in cui questo piano è stato scritto.",
  '<!-- 🗓️ AD-DATA {"corpo":"2026-06-25 12:34","nato":"2026-06-25 12:34","nota":null} -->',
  "<!-- 🗓️ AD-DATA:END -->",
].join("\n");

prova("una frase del blocco dell'AD è marcata come sua, non di Nicola", () => {
  const colpi = colpiDi(`# Piano\n\n${BLOCCO_AD}\n`, "pi26-aperto");
  assert.equal(colpi.length, 1);
  assert.equal(colpi[0].zona, "ad", "il rimedio è diverso: quella sparisce da sola, se il giro gira");
});

prova("la riga di servizio della data non viene mai guardata", () => {
  // Cita per forza le date che le regole cercano: guardarla sarebbe un guardiano che accusa
  // l'unica riga che ha scritto lui stesso.
  assert.equal(smentiteNelTesto(`# Piano\n\n${BLOCCO_DATA}\n`).length, 0);
});

prova("un blocco dell'AD aperto e mai chiuso non torna di nascosto a «corpo»", () => {
  const rotto = "# Piano\n\n<!-- 🤖 AD-AGGIORNAMENTO:START -->\n- **PI26 sportello aperto** — invia ORA.\n";
  const zone = zonePerRiga(rotto);
  assert.equal(zone[zone.length - 1].zona, "ad", "un file malformato non deve cambiare il mittente della frase");
});

prova("il testo di Nicola resta «corpo» anche dopo che un blocco dell'AD si è chiuso", () => {
  const testo = `# Piano\n\n${BLOCCO_AD}\n\n> **Negozio-faro = Garetti** (P.za Duomo 44).\n`;
  const colpi = colpiDi(testo, "faro-garetti");
  assert.equal(colpi.length, 1);
  assert.equal(colpi[0].zona, "corpo");
});

// ── ④ Il numero di riga deve portare a quella riga ──────────────────────────

prova("il numero di riga è quello vero del file", () => {
  const testo = ["# Piano", "", "riga tre innocente", "> **Negozio-faro = Garetti**."].join("\n");
  const colpi = colpiDi(testo, "faro-garetti");
  assert.equal(colpi[0].riga, 4, "un numero di riga sbagliato manda chi ripara sulla frase sbagliata");
});

// ── ⑤ Il taglio non deve far credere che la frase finisse lì ────────────────

prova("una frase accorciata lo dichiara", () => {
  const lunga = "a".repeat(200);
  const t = accorcia(lunga, 20);
  assert.equal(t.length, 20);
  assert.ok(t.endsWith("…"), "senza il segno, un troncamento diventa una citazione falsa");
});

prova("una frase corta non viene toccata", () => {
  assert.equal(accorcia("frase breve", 96), "frase breve");
});

// ── ⑥ Le regole devono restare agganciate al registro ───────────────────────

prova("ogni regola cita un fatto che esiste davvero nel registro", () => {
  const registro = JSON.parse(readFileSync(join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/registro-fatti.json"), "utf8"));
  const orfane = REGOLE.filter((r) => !fattoDalRegistro(registro, r.fatto)).map((r) => r.chiave);
  assert.deepEqual(orfane, [], "una regola che cita un fatto sparito controlla il nulla stampando verde");
});

prova("un fatto che non c'è dà null, non un valore inventato", () => {
  assert.equal(fattoDalRegistro({ fatti: [] }, "bando.commercio-er.scadenza"), null);
  assert.equal(fattoDalRegistro(null, "qualsiasi"), null);
});

// ── ⑦ L'avviso in cima: deve avvisare senza sporcare la misura del gemello ──

const REGISTRO_FINTO = {
  fatti: [
    { id: "bando.commercio-er.scadenza", valore: "CHIUSO il 23/6/2026 ore 10:00:37", fonte: "fesr.regione.emilia-romagna.it — verificato 2026-07-11" },
    { id: "bando.pi26.idoneita", valore: "Non idoneo", fonte: "Nicola 29/7" },
    { id: "pricing.commissione", valore: "10% sul venduto", fonte: "Nicola 20/7" },
    { id: "negozio.faro", valore: "Pane Quotidiano", fonte: "database marketplace 2026-08-10 09:58" },
  ],
};

const PIANO_BUGIARDO = [
  "# 🏛️ PIANO ISTITUZIONALE",
  "",
  "<!-- 🗓️ AD-DATA:START · riga di servizio -->",
  "> 🗓️ **Ultimo aggiornamento: 2026-06-25 12:34**",
  '<!-- 🗓️ AD-DATA {"corpo":"2026-06-25 12:34","nato":"2026-06-25 12:34","nota":null} -->',
  "<!-- 🗓️ AD-DATA:END -->",
  "",
  "> Base dati: qualcosa.",
  "> ⚠️ **Bando Commercio ER 40% — sportello APERTO fino al 21/07/2026**.",
  "",
  "## 1. Obiettivo",
  "Il testo del piano, con la commissione al **12%**.",
  "",
].join("\n");

prova("l'avviso cita le righe dove le frasi sono DAVVERO finite", () => {
  // La trappola: l'avviso sposta in giù tutto ciò che cita. Un numero calcolato prima
  // dell'inserimento manda chi ripara otto righe sopra la frase sbagliata.
  const scritto = pianoConAvviso(PIANO_BUGIARDO, REGISTRO_FINTO, "2026-08-10 16:00");
  const righe = scritto.split("\n");
  const citate = [...scritto.matchAll(/\((?:riga|righe) ([\d, ]+)\)/g)].flatMap((m) => m[1].split(",").map((n) => Number(n.trim())));
  assert.ok(citate.length >= 2, "l'avviso deve citare almeno le due bugie del piano finto");
  for (const n of citate) {
    const riga = righe[n - 1];
    assert.ok(/21\/07\/2026|12\s?%/.test(riga), `la riga ${n} citata dall'avviso non contiene la frase smentita: «${riga}»`);
  }
});

prova("riscrivere l'avviso due volte lascia lo stesso file", () => {
  const uno = pianoConAvviso(PIANO_BUGIARDO, REGISTRO_FINTO, "2026-08-10 16:00");
  const due = pianoConAvviso(uno, REGISTRO_FINTO, "2026-08-10 16:00");
  assert.equal(uno, due, "senza idempotenza l'avviso non si può rilanciare a ogni giro");
});

prova("l'avviso NON conta come revisione del piano — il gemello lo toglie prima di misurare", () => {
  // È la prova che protegge l'allarme: senza, segnalare che un piano dice cose false lo farebbe
  // risultare rivisto oggi, e i nove piani fermi da 46 giorni tornerebbero verdi in cruscotto.
  const scritto = pianoConAvviso(PIANO_BUGIARDO, REGISTRO_FINTO, "2026-08-10 16:00");
  assert.equal(corpoDelPiano(PIANO_BUGIARDO), corpoDelPiano(scritto));
});

prova("l'avviso non accusa se stesso", () => {
  const scritto = pianoConAvviso(PIANO_BUGIARDO, REGISTRO_FINTO, "2026-08-10 16:00");
  const dentro = smentiteNelTesto(scritto).filter((s) => s.zona === "avviso");
  assert.deepEqual(dentro, [], "l'avviso cita per forza i valori vecchi: guardarlo è un rosso inspegnibile");
});

prova("quando il piano torna d'accordo col registro, l'avviso sparisce", () => {
  const scritto = pianoConAvviso(PIANO_BUGIARDO, REGISTRO_FINTO, "2026-08-10 16:00");
  const corretto = scritto.replace("sportello APERTO fino al 21/07/2026", "sportello CHIUSO dal 23/6/2026").replace("**12%**", "**10%**");
  const ripulito = pianoConAvviso(corretto, REGISTRO_FINTO, "2026-08-10 16:00");
  assert.ok(!ripulito.includes("AD-SMENTITE"), "un avviso che resta dopo la riparazione è un falso allarme permanente");
});

prova("una fonte lunga non finisce con una parentesi aperta", () => {
  const f = fonteBreve("letto dal vivo sul database del marketplace il 2026-08-10 09:58 (campi stripe_details_submitted, stripe_charges_enabled)");
  const aperte = (f.match(/\(/g) || []).length;
  const chiuse = (f.match(/\)/g) || []).length;
  assert.equal(aperte, chiuse, `parentesi scompagnate in «${f}»`);
});

// ── Esito ───────────────────────────────────────────────────────────────────

const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : ` — ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} prove verdi`);
process.exit(rotte.length ? 1 : 0);
