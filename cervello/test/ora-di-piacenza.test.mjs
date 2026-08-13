#!/usr/bin/env node
// Prova L'OROLOGIO DI CASA eseguendolo (AR-647 · AR-648 · AR-442) — mai cercando pattern nel codice.
//
// LA REGOLA DI QUESTO FILE, ed è tutto il motivo per cui esiste:
// **ogni caso gira due volte, con TZ=UTC e con TZ=Europe/Rome, e deve rispondere identico.**
// Il test si rilancia da solo nei due fusi (sotto, in fondo) e confronta le due uscite riga per
// riga. È l'unica forma di prova che il difetto non poteva superare: la malattia era proprio che
// il risultato dipendeva dal fuso del computer che eseguiva, quindi passava su un portatile
// italiano e sbagliava sul VPS in UTC. Un test che gira in un fuso solo non l'avrebbe mai vista.
//
// Seconda regola: **gennaio E luglio**, sempre. Piacenza d'estate è +2 e d'inverno +1; il vecchio
// codice cablava +2. A luglio era giusto per caso — un test scritto d'estate non poteva bocciarlo.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  FUSO,
  giornoPiacenza,
  mesePiacenza,
  msDaTimbro,
  offsetPiacenzaMs,
  oreDaTimbro,
  timbroOra,
} from "../ora-piacenza.mjs";
import { CADENZE, cadenzeStantie, giaFattaDiRecente } from "../esito-cadenza.mjs";
import { timbroOra as timbroDallaPenna } from "../registra-cadenza.mjs";
import { finestraContinua, tokenSessioneRolling } from "../costo-ai.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const IO_STESSO = join(QUI, "ora-di-piacenza.test.mjs");
const ORA = 3_600_000;

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

// Le due formule MALATE, tenute qui come pietra di paragone. Se un giorno tornassero nel codice,
// questi confronti direbbero che sono di nuovo uguali a quelle buone — e diventerebbero rossi.
const utcNudo = (d) => d.toISOString().slice(0, 16).replace("T", " ");
const parseNelFusoDelServer = (s) => Date.parse(String(s).replace(" ", "T"));
const parseConOffsetCablato = (s) => {
  const m = String(s).match(/^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2})/);
  return m ? new Date(`${m[1]}T${m[2]}:${m[3]}:00+02:00`).getTime() : null;
};

// ── ① IL TIMBRO — l'ora che finisce in memoria ───────────────────────────────
prova("gennaio: mezzogiorno UTC a Piacenza è l'una (CET, +1)", () => {
  assert.equal(timbroOra(new Date("2026-01-15T12:00:00Z")), "2026-01-15 13:00");
});

prova("luglio: mezzogiorno UTC a Piacenza sono le due (CEST, +2)", () => {
  assert.equal(timbroOra(new Date("2026-07-15T12:00:00Z")), "2026-07-15 14:00");
});

prova("AR-648: l'UTC nudo NON è l'ora di Piacenza — né a gennaio né a luglio", () => {
  const gennaio = new Date("2026-01-15T12:00:00Z");
  const luglio = new Date("2026-07-15T12:00:00Z");
  assert.equal(utcNudo(gennaio), "2026-01-15 12:00", "la formula vecchia scriveva l'ora di Greenwich");
  assert.notEqual(utcNudo(gennaio), timbroOra(gennaio), "un'ora indietro tutto l'inverno");
  assert.notEqual(utcNudo(luglio), timbroOra(luglio), "due ore indietro tutta l'estate");
  // E non è mai «quasi giusto»: lo scarto è di ore intere, non di minuti. Il verso conta:
  // un registro timbrato in UTC, riletto come ora di Piacenza, colloca il fatto un'ora PRIMA di
  // quando è successo — cioè lo fa sembrare più VECCHIO. AR-647 spingeva nel verso opposto (più
  // fresco). Ecco perché la coppia è vissuta tanto: chi scriveva sbagliato e chi leggeva sbagliato
  // si compensavano quasi, e il totale sembrava plausibile senza esserlo mai.
  assert.equal(msDaTimbro(timbroOra(gennaio)) - msDaTimbro(utcNudo(gennaio)), ORA);
  assert.equal(msDaTimbro(timbroOra(luglio)) - msDaTimbro(utcNudo(luglio)), 2 * ORA);
});

prova("il giorno e il mese sono quelli di Piacenza, non quelli di Greenwich", () => {
  // 31 dicembre 23:30 UTC = 1º gennaio 00:30 a Piacenza: capodanno è già passato qui.
  const capodanno = new Date("2026-12-31T23:30:00Z");
  assert.equal(giornoPiacenza(capodanno), "2027-01-01", "con toISOString sarebbe rimasto il 31/12");
  assert.equal(mesePiacenza(capodanno), "2027-01", "e l'archivio sarebbe finito nel mese sbagliato");
  assert.equal(capodanno.toISOString().slice(0, 10), "2026-12-31", "la pietra di paragone: la formula vecchia");
});

prova("la penna del registro e l'orologio sono LO STESSO orologio", () => {
  // registra-cadenza.mjs riesporta timbroOra: se un giorno tornassero due copie, qui si vede.
  const q = new Date("2026-01-15T12:00:00Z");
  assert.equal(timbroDallaPenna(q), timbroOra(q));
  assert.equal(timbroDallaPenna, timbroOra, "non due funzioni uguali: la stessa funzione");
});

// ── ② IL RITORNO — dal timbro all'istante (AR-647) ───────────────────────────
prova("andata e ritorno: qualunque istante, timbrato e riletto, torna se stesso", () => {
  for (const iso of ["2026-01-15T07:23:00Z", "2026-07-15T07:23:00Z", "2026-11-02T23:00:00Z"]) {
    const q = new Date(iso);
    assert.equal(msDaTimbro(timbroOra(q)), q.getTime(), `andata e ritorno rotta su ${iso}`);
  }
});

prova("AR-647: il parse nel fuso del server sbaglia di 1h a gennaio e 2h a luglio (su un VPS in UTC)", () => {
  // Questa è la misura del difetto, non una parafrasi: quanto valeva l'errore, in ore.
  // Il fuso si chiede a Intl, non a process.env.TZ: quando TZ non è impostata la variabile è
  // vuota ma il processo un fuso ce l'ha lo stesso — ed è quello che decide il risultato.
  const scarto = (timbro) => (parseNelFusoDelServer(timbro) - msDaTimbro(timbro)) / ORA;
  const fusoDelProcesso = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (fusoDelProcesso === "UTC") {
    assert.equal(scarto("2026-01-15 09:00"), 1, "d'inverno la cadenza sembrava 1h più fresca");
    assert.equal(scarto("2026-07-15 09:00"), 2, "d'estate 2h più fresca");
  } else if (fusoDelProcesso === "Europe/Rome") {
    // Sul portatile italiano il difetto è invisibile: è per questo che è vissuto tanto.
    assert.equal(scarto("2026-01-15 09:00"), 0);
    assert.equal(scarto("2026-07-15 09:00"), 0);
  }
  // Ma la funzione buona dà lo stesso identico istante in tutti e due i casi: è l'invariante.
  assert.equal(msDaTimbro("2026-01-15 09:00"), Date.parse("2026-01-15T08:00:00Z"));
  assert.equal(msDaTimbro("2026-07-15 09:00"), Date.parse("2026-07-15T07:00:00Z"));
});

prova("AR-442: l'offset +02:00 cablato sbaglia di un'ora tutto l'inverno", () => {
  assert.equal(parseConOffsetCablato("2026-07-15 09:00"), msDaTimbro("2026-07-15 09:00"), "d'estate coincidono");
  assert.equal(
    (msDaTimbro("2026-01-15 09:00") - parseConOffsetCablato("2026-01-15 09:00")) / ORA,
    1,
    "d'inverno il cablato anticipa di un'ora: la finestra della spesa si sposta",
  );
});

prova("un campo illeggibile resta illeggibile — non diventa una data del secolo scorso", () => {
  for (const brutto of ["", "boh", "2026-13-45 99:99", null, undefined, {}, "ieri sera"]) {
    assert.ok(!Number.isFinite(msDaTimbro(brutto)), `«${String(brutto)}» non doveva produrre un istante`);
  }
  assert.equal(oreDaTimbro("boh", Date.now()), null, "e chi misura le ore riceve «non lo so», non uno zero");
});

prova("un timbro che porta già il suo fuso non viene reinterpretato", () => {
  assert.equal(msDaTimbro("2026-01-15T08:00:00Z"), Date.parse("2026-01-15T08:00:00Z"));
  assert.equal(msDaTimbro("2026-01-15 09:00+01:00"), Date.parse("2026-01-15T09:00:00+01:00"));
});

prova("il cambio d'ora: l'offset lo decide il calendario, non una costante", () => {
  assert.equal(offsetPiacenzaMs(Date.parse("2026-01-15T12:00:00Z")), ORA, "gennaio: +1");
  assert.equal(offsetPiacenzaMs(Date.parse("2026-07-15T12:00:00Z")), 2 * ORA, "luglio: +2");
  // 25/10/2026 alle 01:00 UTC l'Italia torna all'ora solare: un minuto prima +2, un minuto dopo +1.
  assert.equal(offsetPiacenzaMs(Date.parse("2026-10-25T00:59:00Z")), 2 * ORA);
  assert.equal(offsetPiacenzaMs(Date.parse("2026-10-25T01:01:00Z")), ORA);
  assert.equal(FUSO, "Europe/Rome");
});

// ── ③ CHI USA L'OROLOGIO — le cadenze (AR-647) ───────────────────────────────
const registro = (quando, codice = 0) => ({ cadenze: { "ritmo-mattino": { quando, codice, esito: "pulito" } } });
// Si guarda UNA cadenza sola, ma con la sua soglia VERA (30h): le altre cinque direbbero tutte
// «mai registrata» e coprirebbero di rumore il caso che stiamo misurando.
const SOLO_MATTINO = { "ritmo-mattino": CADENZE["ritmo-mattino"] };

prova("AR-647: una cadenza ferma da 31 ore si vede — a gennaio come a luglio", () => {
  for (const [stagione, timbro] of [["gennaio", "2026-01-14 06:00"], ["luglio", "2026-07-14 06:00"]]) {
    const adesso = msDaTimbro(timbro) + 31 * ORA;
    const stantie = cadenzeStantie({ stato: registro(timbro), adessoMs: adesso, cadenze: SOLO_MATTINO });
    const mia = stantie.find((s) => s.tipo === "ritmo-mattino");
    assert.ok(mia, `${stagione}: 31 ore di silenzio con soglia 30 devono comparire`);
    assert.equal(mia.ore, 31, `${stagione}: l'età dev'essere 31 ore esatte, non 29 né 30`);
  }
});

prova("AR-647: il caso che il difetto lasciava passare — 31 ore lette come 29", () => {
  // Il numero che conta: con la formula vecchia, su un VPS in UTC d'estate, una cadenza ferma da
  // 31 ore ne dichiarava 29 — sotto la soglia di 30. Il guardiano nato per accorgersi di chi non
  // si alza più taceva. Qui l'invariante: l'età non dipende dal fuso di chi esegue.
  const timbro = "2026-07-14 06:00";
  const adesso = msDaTimbro(timbro) + 31 * ORA;
  const etaVera = (adesso - msDaTimbro(timbro)) / ORA;
  const etaVecchia = (adesso - parseNelFusoDelServer(timbro)) / ORA;
  assert.equal(etaVera, 31);
  if (process.env.TZ === "UTC") {
    assert.equal(etaVecchia, 29, "la pietra di paragone: 31 ore diventavano 29");
    assert.ok(etaVecchia < 30, "…cioè sotto la soglia: nessun allarme");
  }
  assert.equal(cadenzeStantie({ stato: registro(timbro), adessoMs: adesso, cadenze: SOLO_MATTINO }).length, 1);
});

prova("AR-647: una cadenza fresca resta fresca (il fix non trasforma la cura in falsi allarmi)", () => {
  const timbro = "2026-01-15 06:00";
  const adesso = msDaTimbro(timbro) + 2 * ORA;
  assert.deepEqual(cadenzeStantie({ stato: registro(timbro), adessoMs: adesso, cadenze: SOLO_MATTINO }), []);
});

prova("AR-647: la distanza minima fra due lanci si misura con l'orologio giusto", () => {
  // gapMin del ritmo = 10h. A 9 ore e mezza si rifiuta, a 10 e mezza si fa. Il difetto spostava il
  // confine di un'ora o due — cioè lasciava rilanciare una cadenza appena fatta.
  const timbro = "2026-07-15 06:00";
  const a9h30 = giaFattaDiRecente({ stato: registro(timbro), tipo: "ritmo-mattino", adessoMs: msDaTimbro(timbro) + 9.5 * ORA });
  const a10h30 = giaFattaDiRecente({ stato: registro(timbro), tipo: "ritmo-mattino", adessoMs: msDaTimbro(timbro) + 10.5 * ORA });
  assert.equal(a9h30.gia, true, "9 ore e mezza dopo è un rilancio a vuoto");
  assert.equal(a9h30.ore, 9.5);
  assert.equal(a10h30.gia, false, "10 ore e mezza dopo si può rifare");
});

prova("un timbro illeggibile non diventa «fresca»: si dichiara", () => {
  const stantie = cadenzeStantie({ stato: registro("boh"), adessoMs: Date.now(), cadenze: SOLO_MATTINO });
  assert.ok(stantie.some((s) => /illeggibile/.test(s.motivo)), "un campo rotto va detto, non ingoiato");
});

// ── ④ CHI USA L'OROLOGIO — la spesa (AR-442) ─────────────────────────────────
const voce = (quando, token) => ({ quando, tipo: "giro", token, stima_grezza: true });

prova("AR-442: la finestra scorrevole attraversa la MEZZANOTTE", () => {
  // Il caso della scheda, alla lettera: quota bruciata fra le 22 e le 23:30, adesso sono le 00:10.
  // Il giorno solare è cambiato; la finestra di 6 ore no.
  const sera = [voce("2026-01-14 22:00", 400_000), voce("2026-01-14 23:30", 500_000)];
  const adesso = msDaTimbro("2026-01-15 00:10");
  const r = tokenSessioneRolling(sera, adesso, 360);
  assert.equal(r.token_sessione_rolling, 900_000, "alle 00:10 la spesa delle ultime ore NON è zero");
  assert.equal(r.runs_sessione, 2);
  // E il contenitore vecchio, quello che il difetto usava: a mezzanotte `oggi.voci` è [].
  assert.equal(tokenSessioneRolling([], adesso, 360).token_sessione_rolling, 0, "la pietra di paragone");
});

prova("AR-442: la stessa scena a luglio (l'offset cablato non c'è più a mentire d'inverno)", () => {
  const sera = [voce("2026-07-14 22:00", 400_000), voce("2026-07-14 23:30", 500_000)];
  const r = tokenSessioneRolling(sera, msDaTimbro("2026-07-15 00:10"), 360);
  assert.equal(r.token_sessione_rolling, 900_000);
});

prova("AR-442: quello che è uscito dalla finestra esce davvero (non è un contatore che non scende)", () => {
  const vecchie = [voce("2026-01-14 10:00", 999_999), voce("2026-01-14 22:00", 400_000)];
  const adesso = msDaTimbro("2026-01-15 00:10");
  assert.equal(finestraContinua(vecchie, adesso, 360).length, 1, "le 10:00 sono a 14 ore: fuori");
  assert.equal(tokenSessioneRolling(vecchie, adesso, 360).token_sessione_rolling, 400_000);
});

prova("AR-442: una voce col timbro rotto non abbassa la spesa in silenzio", () => {
  const miste = [voce("2026-01-14 23:30", 500_000), voce("boh", 999_999)];
  const r = tokenSessioneRolling(miste, msDaTimbro("2026-01-15 00:10"), 360);
  assert.equal(r.token_sessione_rolling, 500_000);
  assert.equal(r.voci_illeggibili, 1, "il buco si dichiara: un freno che perde voci in silenzio smette di frenare");
});

prova("AR-442: importare il contatore non scrive niente e non uccide il processo", () => {
  // Se `main()` ripartisse all'import, questo test non sarebbe potuto nemmeno arrivare qui: il
  // modulo avrebbe scritto costo-ai.json nel vault e chiamato process.exit(0) a metà file.
  assert.equal(typeof finestraContinua, "function");
  assert.equal(typeof tokenSessioneRolling, "function");
});

// ── esito ────────────────────────────────────────────────────────────────────
const rotti = casi.filter((c) => !c.ok);
for (const c of casi) process.stdout.write(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n     ${c.err}`}\n`);
process.stdout.write(`\n${casi.length - rotti.length}/${casi.length} passati (TZ=${process.env.TZ})\n`);

// ── IL DOPPIO GIRO — la parte che rende questo test capace di vedere la malattia ──
// Senza ORA_TEST_FUSO il file si rilancia in UTC e in Europe/Rome e pretende DUE cose: che
// entrambe le uscite siano verdi, e che siano IDENTICHE. Il difetto curato qui era esattamente
// una risposta che cambiava col fuso della macchina: se torna, le due uscite divergono.
if (!process.env.ORA_TEST_FUSO) {
  const giro = (tz) => {
    try {
      return { rc: 0, out: execFileSync("node", [IO_STESSO], { encoding: "utf8", env: { ...process.env, TZ: tz, ORA_TEST_FUSO: tz } }) };
    } catch (e) {
      return { rc: e.status ?? 1, out: (e.stdout || "") + (e.stderr || "") };
    }
  };
  const utc = giro("UTC");
  const roma = giro("Europe/Rome");
  const senzaEtichetta = (s) => s.replace(/\(TZ=[^)]*\)/g, "");
  const problemi = [];
  if (utc.rc !== 0) problemi.push(`❌ con TZ=UTC il test fallisce:\n${utc.out}`);
  if (roma.rc !== 0) problemi.push(`❌ con TZ=Europe/Rome il test fallisce:\n${roma.out}`);
  if (senzaEtichetta(utc.out) !== senzaEtichetta(roma.out)) {
    problemi.push(
      "❌ le due uscite NON coincidono: la risposta dipende dal fuso del computer, che è la malattia stessa.\n" +
        `── TZ=UTC ──\n${utc.out}\n── TZ=Europe/Rome ──\n${roma.out}`,
    );
  }
  if (problemi.length) {
    process.stdout.write(`\n${problemi.join("\n")}\n`);
    process.exit(1);
  }
  process.stdout.write("✅ stessa risposta con TZ=UTC (il VPS) e TZ=Europe/Rome (il portatile)\n");
}

process.exit(rotti.length ? 1 : 0);
