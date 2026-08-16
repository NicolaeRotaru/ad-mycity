#!/usr/bin/env node
// 🕐 AR-666 — L'ORA SCRITTA A MANO DENTRO IL CERVELLO. Provata ESEGUENDO le funzioni vere.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA, IN DUE FACCE CHE SONO LA STESSA
// ─────────────────────────────────────────────────────────────────────────────
// Tredici punti in dieci script costruivano l'ora invece di chiederla al fuso:
//
//   ① L'OFFSET CABLATO — `new Date(\`${g}T${h}:${m}:00+02:00\`)`. `+02:00` è l'ora legale: vale da
//      fine marzo a fine ottobre. Negli altri cinque mesi l'Italia sta a `+01:00` e il conto sbaglia
//      di un'ora piena, sempre nella stessa direzione.
//   ② IL PARSE NEL FUSO DEL SERVER — `Date.parse("2026-12-01 13:00".replace(" ", "T"))`. Una stringa
//      senza fuso, per lo standard, è ora LOCALE del processo. Sul portatile di casa (Europe/Rome)
//      torna l'istante giusto; sul server in UTC torna spostato di un'ora d'inverno e di due
//      d'estate.
//
// Il tratto che le tiene vive è lo stesso: **sbagliano solo altrove o solo in un'altra stagione.**
// Un test scritto ad agosto su un computer italiano le trova tutte e due verdi. Per questo qui ogni
// caso porta una data d'INVERNO accanto a una d'ESTATE, e il file si rilancia da solo in due fusi
// (TZ=UTC, il server · TZ=Europe/Rome, il portatile) pretendendo la stessa identica risposta.
//
// E non è cosmetica: fra questi punti ce ne sono che DECIDONO. Il battito del giro accende il
// motore AI; la soglia dei ventotto giorni fa morire una lezione; la finestra delle quarantotto ore
// decide se una cadenza persa vale la pena di essere rifatta. Un'ora di scarto sposta ognuna di
// queste decisioni dalla parte sbagliata della soglia.
//
// COME SI LEGGONO I CASI. Dove la funzione accetta «adesso» da fuori, il caso è deterministico e
// fissa la data. Dove guarda l'orologio vero (`oreFa`), il confronto si fa con un istante costruito
// a mano con l'offset ESPLICITO di quella stagione: la differenza fra il conto giusto e quello
// malato resta un'ora tonda, e la tolleranza serve solo ai millisecondi fra le due letture.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { timbroOra } from "../ora-piacenza.mjs";
import { oreFa as oreFaDeltaGate } from "../delta-gate.mjs";
import { giorniFra as giorniFraIntelligence, giudica, SOGLIA_SETTIMANALE } from "../freschezza-intelligence.mjs";
import { giorniDa as giorniDaAgenda } from "../intelligence-agenda.mjs";
import { oreFa as oreFaVolano } from "../sonda-volano.mjs";
import { giorniFra as giorniFraPiani } from "../piani-data.mjs";
import { giorniDa as giorniDaArchivio, istante, passoDovuto } from "../tetti-archivio.mjs";
import { ripresaPubblicazione } from "../esito-scrittura.mjs";
import { cadenzeDaRiprendere } from "../sentinella-motore.mjs";
import { istante as istanteScadenza, quantoManca, livelloScadenza } from "../scadenze-regole.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");
const REPO = join(CERVELLO, "..");
const IO_STESSO = join(QUI, "ora-scritta-a-mano-nel-cervello.test.mjs");
const ORA = 3_600_000;

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── LE DUE FORMULE MALATE, tenute qui come pietra di paragone ────────────────────────────────────
// Sono riprodotte in modo INDIPENDENTE dal fuso di chi esegue, così il danno si misura uguale sul
// portatile e sul server: l'offset cablato lo si scrive, e «il server in UTC» lo si simula con la Z.
const conOffsetCablato = (giornoEOra) => Date.parse(`${String(giornoEOra).replace(" ", "T")}:00+02:00`);
const comeSuUnServerInUtc = (timbro) => Date.parse(`${String(timbro).replace(" ", "T")}:00Z`);

// ── ① IL BATTITO DEL GIRO — delta-gate: il punto che ACCENDE IL MOTORE ───────────────────────────

prova("delta-gate: un timbro d'inverno vale le ore che vale, non una in più", () => {
  // Col `+02:00` cablato l'istante veniva collocato un'ora PRIMA del vero, quindi il timbro
  // risultava più vecchio: sopra questo numero sta il battito che accende il motore AI.
  const vero = (Date.now() - Date.parse("2026-01-15T12:00:00+01:00")) / ORA;
  assert.ok(
    Math.abs(oreFaDeltaGate("2026-01-15 12:00") - vero) < 0.02,
    `d'inverno il conto deve dare ${vero.toFixed(3)} ore, non ${oreFaDeltaGate("2026-01-15 12:00").toFixed(3)}`,
  );
});

prova("delta-gate: d'estate il conto è quello di prima — ecco perché nessuno se n'era accorto", () => {
  const vero = (Date.now() - Date.parse("2026-07-15T12:00:00+02:00")) / ORA;
  assert.ok(Math.abs(oreFaDeltaGate("2026-07-15 12:00") - vero) < 0.02);
  // La formula malata e quella curata coincidono a luglio: il difetto nasce già invisibile.
  assert.equal(conOffsetCablato("2026-07-15 12:00"), Date.parse("2026-07-15T12:00:00+02:00"));
});

prova("IL DANNO VERO: d'inverno il battito delle 12 ore scattava un'ora prima del dovuto", () => {
  // Sopra `oreFa` c'è un `if`: oltre MAX_ORE (12 di default) il giro accende il motore AI comunque.
  // Un ultimo giro pieno di 11 ore e mezza fa è SOTTO la soglia e non deve accendere niente.
  const ultimoPieno = Date.parse("2026-01-15T12:00:00+01:00");
  const adesso = ultimoPieno + 11.5 * ORA;
  const vero = (adesso - ultimoPieno) / ORA;
  const malato = (adesso - conOffsetCablato("2026-01-15 12:00")) / ORA;
  assert.equal(vero, 11.5);
  assert.equal(malato, 12.5, "col fuso cablato diventavano 12,5");
  assert.equal(vero > 12, false, "11 ore e mezza non sono un battito scaduto");
  assert.equal(malato > 12, true, "e invece il motore AI si accendeva, cinque mesi l'anno");
});

prova("delta-gate: una data senza ora vale mezzogiorno, una stringa che non è una data vale Infinity", () => {
  const vero = (Date.now() - Date.parse("2026-01-15T12:00:00+01:00")) / ORA;
  assert.ok(Math.abs(oreFaDeltaGate("2026-01-15") - vero) < 0.02, "senza ora si assume mezzogiorno");
  for (const spazzatura of ["", null, undefined, "mai"]) {
    assert.equal(oreFaDeltaGate(spazzatura), Infinity, `«${String(spazzatura)}» non è una data`);
  }
});

// ── ② LA FRESCHEZZA DELLE SCHEDE — freschezza-intelligence e intelligence-agenda ─────────────────

prova("freschezza: nessun giorno regalato quando l'intervallo scavalca il cambio d'ora", () => {
  // Col `+02:00` su ENTRAMBE le date, l'offset vero di gennaio (+01:00) andava perso e `Math.floor`
  // trasformava l'ora mancante in un giorno intero.
  assert.equal(giorniFraIntelligence("2026-01-15", "2026-07-15"), 180, "inverno→estate: erano 181");
  assert.equal(giorniFraIntelligence("2026-03-01", "2026-03-31"), 29, "dentro il mese del cambio: erano 30");
  // Controprova: dove il cambio NON c'è il conto era già giusto e deve restare identico.
  assert.equal(giorniFraIntelligence("2026-07-01", "2026-07-31"), 30, "tutto dentro l'ora legale: invariato");
  assert.equal(giorniFraIntelligence("2026-11-01", "2026-11-30"), 29, "tutto dentro l'ora solare: invariato");
  assert.equal(giorniFraIntelligence(null, "2026-07-15"), null, "senza data di partenza resta «non lo so»");
});

prova("agenda: stesso conto e stessi numeri della freschezza — erano due copie della stessa formula", () => {
  assert.equal(giorniDaAgenda("2026-01-15", "2026-07-15"), 180);
  assert.equal(giorniDaAgenda("2026-03-01", "2026-03-31"), 29);
  assert.equal(giorniDaAgenda("2026-07-01", "2026-07-31"), 30);
  assert.equal(giorniDaAgenda(null, "2026-07-15"), 999, "senza data si resta al valore «vecchissima»");
  assert.equal(giorniDaAgenda("non una data", "2026-07-15"), 999);
});

prova("IL DANNO VERO: la card usciva «scaduta» mentre era ancora fresca", () => {
  // Il numero non è un'astrazione: sopra ci sta un `if`. Soglia settimanale, otto giorni. Una scheda
  // scritta il 24 marzo e guardata il 2 aprile ha otto giorni: è ancora buona. Col fuso cablato ne
  // aveva nove, e la Cabina la marcava scaduta — un avviso che parte da solo si impara a ignorare.
  const testo = "# Radar concorrenti\nAggiornato: 2026-03-24 09:00\n";
  const g = giudica({ presente: true, testo, soglia: SOGLIA_SETTIMANALE, oggi: "2026-04-02" });
  assert.equal(g.giorni, 8, "dal 24 marzo al 2 aprile, cambio d'ora in mezzo, sono otto giorni");
  assert.equal(g.scaduta, false, "otto giorni con soglia otto: fresca");
  const malato = Math.floor((conOffsetCablato("2026-04-02 12:00") - conOffsetCablato("2026-03-24 12:00")) / 86_400_000);
  assert.equal(malato, 9, "col fuso cablato erano nove: il giorno regalato dal cambio d'ora");
  assert.equal(malato > SOGLIA_SETTIMANALE, true, "e la card usciva scaduta senza esserlo");
  // Sull'intervallo lungo lo stesso giorno regalato si vede a occhio nudo.
  assert.equal(giorniFraIntelligence("2026-01-15", "2026-07-15"), 180);
  assert.equal(Math.floor((conOffsetCablato("2026-07-15 12:00") - conOffsetCablato("2026-01-15 12:00")) / 86_400_000), 181);
});

// ── ③ LA SONDA DEL VOLANO ────────────────────────────────────────────────────────────────────────

prova("sonda del volano: il timbro d'inverno non invecchia di un'ora in più", () => {
  const vero = (Date.now() - Date.parse("2026-01-15T09:30:00+01:00")) / ORA;
  assert.ok(Math.abs(oreFaVolano("2026-01-15 09:30") - vero) < 0.02);
  const veroEstate = (Date.now() - Date.parse("2026-07-15T09:30:00+02:00")) / ORA;
  assert.ok(Math.abs(oreFaVolano("2026-07-15 09:30") - veroEstate) < 0.02);
  assert.equal(oreFaVolano("mai"), Infinity, "quello che non si legge resta Infinity, non zero");
});

// ── ④ LA RIGA DI DATA DEI PIANI ──────────────────────────────────────────────────────────────────

prova("piani: i giorni fermi non aumentano di uno quando in mezzo c'è il cambio d'ora", () => {
  // Qui il parse era senza fuso: sul portatile italiano tornava giusto, sul server in UTC no.
  assert.equal(giorniFraPiani("2026-01-15 12:00", "2026-07-15 12:00"), 180, "su un VPS in UTC erano 181");
  assert.equal(giorniFraPiani("2026-06-25 12:34", "2026-08-10 11:56"), 45, "senza cambio in mezzo: invariato");
  assert.equal(giorniFraPiani("2026-08-11 00:00", "2026-08-10 12:00"), 0, "una data futura non produce giorni negativi");
  const suUnVps = Math.floor((comeSuUnServerInUtc("2026-07-15 12:00") - comeSuUnServerInUtc("2026-01-15 12:00")) / 86_400_000);
  assert.equal(suUnVps, 181, "ecco il giorno che il server in UTC regalava");
});

// ── ⑤ L'ARCHIVIO CHE INVECCHIA — tetti-archivio, la soglia che fa morire una lezione ─────────────

prova("archivio: un timbro di Piacenza è letto col fuso di quella data, non con quello del server", () => {
  assert.equal(istante("2026-01-15 08:30"), Date.parse("2026-01-15T08:30:00+01:00"), "gennaio è +01:00");
  assert.equal(istante("2026-07-15 08:30"), Date.parse("2026-07-15T08:30:00+02:00"), "luglio è +02:00");
  assert.equal(istante("2026-01-15"), Date.parse("2026-01-15T12:00:00+01:00"), "un giorno nudo vale mezzogiorno di casa");
  assert.equal(istante("2026-01-15T08:30:00Z"), Date.parse("2026-01-15T08:30:00Z"), "chi porta già il suo fuso si rispetta");
  assert.equal(istante("non una data"), null, "«non l'ho potuto leggere» non è «vecchissima»");
  assert.equal(giorniDaArchivio("2026-01-15 12:00", Date.parse("2026-01-25T12:00:00+01:00")), 10);
});

prova("IL DANNO VERO: la soglia dei 28 giorni, e la lezione che non moriva quando doveva", () => {
  // Il timbro è ora di PIACENZA. Letto nel fuso di un server in UTC finisce un'ora più avanti,
  // quindi la lezione risulta un'ora più GIOVANE — e resta viva un giro in più di quanto deciso.
  const conferma = "2026-12-01 23:30";
  const adesso = Date.parse("2026-12-30T00:00:00+01:00"); // 28 giorni e mezz'ora dopo, per davvero
  const eta = giorniDaArchivio(conferma, adesso);
  assert.ok(eta > 28, `28,02 giorni: la lezione ha superato la soglia (misurati ${eta.toFixed(3)})`);
  const etaSuVps = (adesso - comeSuUnServerInUtc(conferma)) / 86_400_000;
  assert.ok(etaSuVps < 28, `col parse del server erano ${etaSuVps.toFixed(3)} giorni: sotto soglia`);
  assert.equal(passoDovuto({ ultimaConferma: conferma, adessoMs: adesso }).decade, true, "adesso decade quando deve");
});

prova("archivio: il passo di decadimento resta uno ogni sette giorni, misurato in tempo vero", () => {
  const conferma = "2026-11-01 12:00";
  const adesso = Date.parse("2026-12-30T12:00:00+01:00");
  assert.equal(passoDovuto({ ultimaConferma: conferma, ultimoPasso: "2026-12-28 12:00", adessoMs: adesso }).decade, false, "due giorni dall'ultimo passo: si aspetta");
  assert.equal(passoDovuto({ ultimaConferma: conferma, ultimoPasso: "2026-12-20 12:00", adessoMs: adesso }).decade, true, "dieci giorni dall'ultimo passo: si scende di un gradino");
});

// ── ⑥ LA MEMORIA CHE NON ESCE — esito-scrittura ──────────────────────────────────────────────────

prova("IL DANNO VERO: l'allarme «la memoria non esce da troppo» si svegliava un'ora tardi", () => {
  // Il marcatore dice da quando la pubblicazione è rimandata. Soglia d'allarme: 6 ore.
  const marcatore = { quando: "2026-12-01 13:00", rc: 2 };
  const adesso = Date.parse("2026-12-01T19:06:00+01:00"); // 6,1 ore dopo, in ora solare
  const r = ripresaPubblicazione({ marcatore, adessoMs: adesso, cooldownSec: 300, allarmeOre: 6 });
  assert.equal(r.riprova, true);
  assert.equal(r.allarme, true, "6,1 ore sono oltre la soglia: l'allarme deve suonare");
  const oreSuVps = (adesso - comeSuUnServerInUtc(marcatore.quando)) / ORA;
  assert.ok(oreSuVps < 6, `sul server in UTC erano ${oreSuVps.toFixed(1)} ore: l'allarme restava zitto`);
  // Un marcatore che è già un numero di millisecondi non passa dal timbro: resta com'è.
  const conNumero = ripresaPubblicazione({ marcatore: { quando: adesso - 7 * ORA, rc: 2 }, adessoMs: adesso, allarmeOre: 6 });
  assert.equal(conNumero.allarme, true);
  // Un marcatore illeggibile fa riprovare: meglio una volta di troppo che la memoria chiusa in casa.
  assert.equal(ripresaPubblicazione({ marcatore: { quando: "boh", rc: 2 }, adessoMs: adesso }).riprova, true);
});

// ── ⑦ LA VEGLIA SUL MOTORE — sentinella-motore ───────────────────────────────────────────────────

prova("IL DANNO VERO: una cadenza scaduta rientrava nella finestra e faceva ripartire il motore", () => {
  // Il monitoraggio si recupera solo entro 48 ore: dopo, rifarlo è lavoro doppio, non recupero.
  const esiti = { cadenze: { monitora: { esito: "fallita", quando: "2026-12-01 13:00" } } };
  const adesso = Date.parse("2026-12-03T13:30:00+01:00"); // 48 ore e mezza dopo
  assert.deepEqual(cadenzeDaRiprendere(esiti, adesso).map((c) => c.tipo), [], "48,5 ore: la finestra è chiusa");
  const etaSuVps = (adesso - comeSuUnServerInUtc("2026-12-01 13:00")) / ORA;
  assert.ok(etaSuVps <= 48, `sul server in UTC erano ${etaSuVps.toFixed(1)} ore: rientrava e il motore ripartiva`);
  // Controprova: dentro la finestra il recupero deve esserci ancora.
  const dentro = Date.parse("2026-12-03T12:30:00+01:00"); // 47,5 ore
  assert.deepEqual(cadenzeDaRiprendere(esiti, dentro).map((c) => c.tipo), ["monitora"]);
  // Una cadenza andata bene non si recupera mai.
  const buona = { cadenze: { monitora: { esito: "ok", quando: "2026-12-01 13:00" } } };
  assert.deepEqual(cadenzeDaRiprendere(buona, dentro), []);
});

// ── ⑦bis SCADENZE: il countdown di un bando, letto col fuso giusto ───────────────────────────────
//
// `scadenze-regole.mjs` calcola quanto manca a una scadenza. La scadenza è un timbro di Piacenza
// («2026-07-30 16:00»), e `Date.parse` su una stringa senza fuso legge l'ora del PROCESSO: sul
// portatile di casa è Piacenza e torna, sul VPS è UTC e la stessa scadenza slitta di due ore.
//
// La posta in gioco non è teorica ed è scritta in cima a quel file: PI26, 10.000€ a fondo perduto,
// sportello a esaurimento, e dopo l'invio non si corregge.

prova("scadenze: la stessa scadenza vale lo stesso da Piacenza e dal server in UTC", () => {
  // D'estate (offset +02:00) e d'inverno (+01:00), scritte col fuso ESPLICITO: è l'istante vero
  // contro cui misurare, e non cambia con la macchina che gira.
  const estate = { timbro: "2026-07-30 16:00", esatto: Date.parse("2026-07-30T16:00:00+02:00") };
  const inverno = { timbro: "2026-12-01 09:00", esatto: Date.parse("2026-12-01T09:00:00+01:00") };
  for (const c of [estate, inverno]) {
    assert.equal(istanteScadenza(c.timbro), c.esatto,
      `«${c.timbro}» letto col fuso sbagliato: sul VPS in UTC il countdown del bando slitta di ore`);
  }
  assert.equal(istanteScadenza("non è una data"), null, "un campo illeggibile resta «non lo so», non una data inventata");
});

prova("IL DANNO VERO: due ore di scarto spostavano un bando da «ultime ore» a domani", () => {
  // Scadenza alle 16:00 di Piacenza, e adesso sono le 17:30 del giorno prima: mancano 22,5 ore, cioè
  // «ultime-ore» — il livello che fa suonare l'allarme. Col timbro letto in UTC la scadenza sembra
  // due ore più in là: 24,5 ore, cioè «imminente», e l'avviso di oggi non parte.
  const adesso = Date.parse("2026-07-29T17:30:00+02:00");
  const m = quantoManca("2026-07-30 16:00", adesso);
  assert.ok(Math.abs(m.ore - 22.5) < 0.001, `ore residue ${m.ore}, attese 22,5`);
  assert.equal(livelloScadenza(m.ore), "ultime-ore",
    "col fuso del server la stessa scadenza superava le 24 ore e l'allarme slittava di un giorno");
  assert.equal(livelloScadenza(quantoManca("2026-07-30 16:00", adesso - 2 * ORA).ore), "imminente",
    "il caso di controllo: due ore prima è davvero un livello diverso, quindi lo scarto contava sul serio");
});

// ── ⑧ IL CANCELLO: il fuso si calcola, non si scrive ─────────────────────────────────────────────
//
// I casi qui sopra provano l'EFFETTO nei punti curati. Questo vieta la copia numero quattordici:
// senza un guardiano che possa fallire, la regola resta un commento — e un commento non ha mai
// fermato nessuno. Il conto può solo CALARE: un file nuovo che compare fa fallire la prova.

// Gli unici due posti dove un offset può comparire sono quelli che lo CALCOLANO o lo VALIDANO.
const CASE_DELL_OFFSET = [
  "cervello/ora-piacenza.mjs", // l'orologio di casa: un timbro col fuso scritto è un istante esatto
  "cervello/salute.mjs", // prova i due offset e li valida rileggendoli da Europe/Rome
];

// Debito ereditato, dichiarato per nome. Sono i punti della stessa malattia che stanno in file di
// un'altra squadra di riparazione: si dichiarano invece di toccarli, e la lista può solo accorciarsi.
//
// 15/8 — LA LISTA È VUOTA. Erano tre nomi, e ricontando sul codice due erano già curati: in
// `chiusura-loop` e nel `tick` l'offset era rimasto solo nel commento che racconta la cura, e il
// filtro dei commenti li scagionava già. Il terzo, `scadenze-regole`, leggeva davvero le scadenze
// col fuso del server ed è stato curato qui (`istante` chiede l'ora all'orologio di casa).
//
// Una lista di debito più lunga del debito vero è il modo in cui un tetto smette di frenare: tre
// posti liberi vuol dire che i prossimi tre punti malati entrano senza far rumore. Adesso zero
// significa zero, e il primo che ricompare rende rossa questa prova.
const DEBITO_DICHIARATO = [];

function sorgenti(dir) {
  const out = [];
  for (const voce of readdirSync(dir)) {
    if (voce === "node_modules" || voce === "test") continue; // i test tengono apposta le formule malate
    const p = join(dir, voce);
    if (statSync(p).isDirectory()) out.push(...sorgenti(p));
    else if (/\.mjs$/.test(voce)) out.push(p);
  }
  return out;
}

/** Toglie commenti e righe di documentazione: un offset NOMINATO in un commento non è un bug. */
function soloCodice(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .split("\n")
    .filter((r) => !/^\s*(\/\/|\*)/.test(r))
    .join("\n");
}

prova("CANCELLO — nessuna ora scritta a mano nel cervello", () => {
  const colpevoli = [];
  for (const p of sorgenti(CERVELLO)) {
    const rel = relative(REPO, p).split("\\").join("/");
    if (CASE_DELL_OFFSET.includes(rel)) continue;
    const codice = soloCodice(readFileSync(p, "utf8"));
    // ① l'offset cablato · ② il parse nel fuso del server (`replace(" ", "T")` serve solo a questo).
    if (/[+-]0[12]:00/.test(codice) || /\.replace\(\s*["']\s["']\s*,\s*["']T["']\s*\)/.test(codice)) colpevoli.push(rel);
  }
  const nuovi = colpevoli.filter((f) => !DEBITO_DICHIARATO.includes(f));
  assert.deepEqual(
    nuovi,
    [],
    `ora scritta a mano in ${nuovi.join(", ")}: usa msDaTimbro/oreDaTimbro/timbroOra di cervello/ora-piacenza.mjs. ` +
      "Il fuso si chiede per la data che si sta leggendo — scriverlo funziona solo nella stagione in cui lo scrivi.",
  );
  assert.ok(
    colpevoli.length <= DEBITO_DICHIARATO.length,
    `il debito dichiarato può solo calare: dichiarati ${DEBITO_DICHIARATO.length}, trovati ${colpevoli.length} (${colpevoli.join(", ")})`,
  );
});

// ── ⑨ I PUNTI SONO CABLATI DAVVERO ───────────────────────────────────────────────────────────────
//
// Un fix che c'è ma che nessuno chiama è la trappola classica: l'import in cima e il calcolo a mano
// più sotto. Qui si conta: il nome dell'orologio deve comparire più di una volta per file.

const CURATI = [
  "cervello/scadenze-regole.mjs",
  "cervello/delta-gate.mjs",
  "cervello/freschezza-intelligence.mjs",
  "cervello/intelligence-agenda.mjs",
  "cervello/sonda-volano.mjs",
  "cervello/cristallizza-apprendimento.mjs",
  "cervello/esito-scrittura.mjs",
  "cervello/piani-data.mjs",
  "cervello/sentinella-motore.mjs",
  "cervello/tetti-archivio.mjs",
  "cervello/peso-file-cabina.mjs",
];

prova("ogni punto curato CHIAMA l'orologio di casa, non si limita a importarlo", () => {
  const morti = [];
  for (const rel of CURATI) {
    const codice = soloCodice(readFileSync(join(REPO, rel), "utf8"));
    assert.match(codice, /from "\.\/ora-piacenza\.mjs"/, `${rel} non importa l'orologio di casa`);
    const usi = (codice.match(/\b(msDaTimbro|oreDaTimbro|timbroOra|giornoPiacenza|mesePiacenza)\b/g) || []).length;
    if (usi < 2) morti.push(`${rel} (${usi} occorrenze: c'è solo l'import)`);
  }
  assert.deepEqual(morti, [], `import senza uso — il calcolo a mano è rimasto sotto: ${morti.join(", ")}`);
});

prova("cristallizza-apprendimento non ha più la sua copia locale dell'orologio né del conta-giorni", () => {
  // Erano due copie di roba che esiste già: il formatter di `timbroOra` e la `giorniDa` che il file
  // importava GIÀ da tetti-archivio. La copia che girava in produzione era quella rotta.
  const codice = soloCodice(readFileSync(join(REPO, "cervello/cristallizza-apprendimento.mjs"), "utf8"));
  assert.doesNotMatch(codice, /new Intl\.DateTimeFormat/, "il formatter dell'ora se n'è andato");
  assert.doesNotMatch(codice, /function giorniDa/, "il conta-giorni arriva da tetti-archivio, non è riscritto qui");
  assert.match(codice, /giorniDa[,\s].*tetti-archivio|tetti-archivio[\s\S]{0,200}giorniDa/, "e viene importato da lì");
});

prova("il guardiano del peso della Cabina ha la sua prova, e la sua prova lo esegue", () => {
  // AR-665: era l'unico punto che non si poteva curare, perché la sua sabbiera copiava un file solo.
  const uscita = execFileSync("node", [join(QUI, "peso-file-cabina.test.mjs")], { encoding: "utf8" });
  assert.match(uscita, /# fail 0/, uscita);
  assert.match(uscita, /ora di Piacenza anche su un server in UTC/, "il caso sul timbro deve esserci");
});

// ── esito ────────────────────────────────────────────────────────────────────────────────────────
const rotti = casi.filter((c) => !c.ok);
for (const c of casi) process.stdout.write(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n     ${c.err}`}\n`);
process.stdout.write(`\n${casi.length - rotti.length}/${casi.length} passati (TZ=${process.env.TZ})\n`);

// ── IL DOPPIO GIRO — la parte che rende questo test capace di vedere la malattia ──────────────────
// Senza ORA_TEST_FUSO il file si rilancia in UTC e in Europe/Rome e pretende DUE cose: che entrambe
// le uscite siano verdi, e che siano IDENTICHE. La malattia curata qui era esattamente una risposta
// che cambia col fuso della macchina: se torna, le due uscite divergono.
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
  process.stdout.write("✅ stessa risposta con TZ=UTC (il server) e TZ=Europe/Rome (il portatile)\n");
}

process.exit(rotti.length ? 1 : 0);
