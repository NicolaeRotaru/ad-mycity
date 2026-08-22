#!/usr/bin/env node
// 🧪 AR-703 — LO STRUMENTO CHE RISPONDE A «STO MIGLIORANDO?» NON LO ESEGUIVA NESSUNO.
//
// LA MECCANICA DEL DIFETTO. `cervello/salute-onesta.mjs` conta i difetti aperti adesso e quelli
// aperti una settimana fa: è il numero con cui si risponde a «il cantiere sta calando davvero?».
// Aveva tutto per essere un guardiano — shebang, contratto d'uscita, `process.exit` — e infatti
// `guardia-viva-check.mjs` lo elencava fra i guardiani. Gli mancavano le due cose che rendono un
// guardiano un guardiano:
//   ① la sua uscita non conosceva l'1. Conosceva lo 0 («ho misurato») e il 2 («non ho guardato»):
//      un cantiere che CRESCE usciva **0**, cioè con la faccia del verde;
//   ② non lo lanciava nessun processo. Il verdetto finiva su una console che non leggeva nessuno.
// Due metà dello stesso buco: un metro che non può fallire, e che comunque nessuno interroga.
//
// PERCHÉ QUESTA PROVA È FATTA COSÌ. La tentazione, davanti a un difetto di cablaggio, è cercare la
// parola «salute-onesta» dentro `salute.mjs` e dichiarare riparato. Quella è una parola in un file:
// resta verde anche se il comando viene lanciato dentro una pipe, con `|| true`, o se il suo codice
// d'uscita finisce in una variabile che nessuno legge. Qui invece si ESEGUE: si costruisce un
// cantiere finto che PEGGIORA, ci si fa girare sopra il guardiano vero e il controllo vero della
// visita, e si pretende che il rosso arrivi fino al testo che legge Nicola e al codice d'uscita
// della visita.
//
// NON-VACUITÀ (verificata rompendo il fix apposta): in `cervello/salute-onesta.mjs` la riga
//   const USCITA = GATE ? verdetto.uscita : conto.letto ? 0 : 2;
// riportata a `const USCITA = conto.letto ? 0 : 2;` — cioè il verdetto calcolato e poi ignorato,
// che è esattamente lo stato in cui il difetto è nato — fa diventare ROSSI i casi ②③④⑤. Togliendo
// invece la voce `cervello.burndown` dalla lista `CONTROLLI` di `salute.mjs` diventano rossi ③④⑤.
//
// Uso: node cervello/test/salute-onesta-e-cablata.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SALUTE_ONESTA = join(REPO, "cervello/salute-onesta.mjs");

const { giudicaBurnDown, USCITA } = await import(join(REPO, "cervello/verdetto-burn-down.mjs"));
const { CONTROLLI, codiceUscita, coperturaDi, documentoSalute, quattroRisposte, referto } = await import(
  join(REPO, "cervello/salute.mjs")
);

// ── I cantieri finti ─────────────────────────────────────────────────────────
// «Una settimana fa» è ancorata all'ultima data che compare nel cantiere, quindi bastano le date
// delle schede: niente orologio, niente dipendenza dal giorno in cui gira la prova.

const CANTIERE_CHE_PEGGIORA = {
  difetti: [
    { id: "AR-1", stato: "aperto", nato: "2026-08-01" },
    { id: "AR-2", stato: "aperto", nato: "2026-08-01" },
    // otto difetti nuovi nell'ultima settimana, zero chiusure: il cantiere cresce di 8
    ...Array.from({ length: 8 }, (_, i) => ({ id: `AR-${i + 3}`, stato: "aperto", nato: "2026-08-22" })),
  ],
};

const CANTIERE_CHE_CALA = {
  difetti: [
    ...Array.from({ length: 10 }, (_, i) => ({ id: `AR-${i + 1}`, stato: "chiuso", nato: "2026-08-01", chiuso_il: "2026-08-22" })),
    { id: "AR-99", stato: "aperto", nato: "2026-08-01" },
  ],
};

const TANA = mkdtempSync(join(tmpdir(), "ar703-"));
const scrivi = (nome, dati) => {
  const p = join(TANA, nome);
  writeFileSync(p, typeof dati === "string" ? dati : JSON.stringify(dati));
  return p;
};
const PEGGIORA = scrivi("peggiora.json", CANTIERE_CHE_PEGGIORA);
const CALA = scrivi("cala.json", CANTIERE_CHE_CALA);
const ILLEGGIBILE = scrivi("rotto.json", "{ questo non è un json");
process.on("exit", () => rmSync(TANA, { recursive: true, force: true }));

/** Esegue il guardiano vero su un cantiere finto. Niente scritture: legge e basta. */
const guardiano = (cantiere, argomenti = ["--json", "--gate"]) =>
  spawnSync(process.execPath, [SALUTE_ONESTA, ...argomenti], {
    cwd: REPO,
    encoding: "utf8",
    env: { ...process.env, CANTIERE_FILE: cantiere },
    maxBuffer: 16 * 1024 * 1024,
  });

/** Esegue il controllo VERO della visita — preso dalla sua lista, non riscritto qui. */
async function controlloDellaVisita(cantiere) {
  const c = CONTROLLI.find((x) => x.id === "cervello.burndown");
  assert.ok(c, "la visita non ha più il controllo «cervello.burndown»: il guardiano è tornato senza nessuno che lo esegue");
  const prima = process.env.CANTIERE_FILE;
  process.env.CANTIERE_FILE = cantiere;
  try {
    return { controllo: c, esito: { ...(await c.prova({})), id: c.id, organo: c.organo, titolo: c.titolo, impatto: c.impatto } };
  } finally {
    if (prima === undefined) delete process.env.CANTIERE_FILE;
    else process.env.CANTIERE_FILE = prima;
  }
}

// ═══ ① LA DECISIONE, ESEGUITA ═══════════════════════════════════════════════
// Pura apposta: senza questo file la domanda «e se il cantiere peggiorasse?» si poteva rispondere
// solo peggiorando il cantiere vero.

test("① un cantiere che PEGGIORA è rosso, e lo dice col codice d'uscita", () => {
  const v = giudicaBurnDown({ letto: true, apertiOra: 220, apertiSettimanaFa: 200, margine: 0 });
  assert.equal(v.stato, "cresce");
  assert.equal(v.peggiora, true);
  assert.equal(v.uscita, USCITA.cresce, "un cantiere che cresce deve uscire 1: è l'unico modo che ha per fermare qualcuno");
  assert.match(v.detto, /20/, "il numero va detto: «peggiora» senza quantità non fa alzare il sopracciglio a nessuno");
});

test("① un cantiere che cala esce 0 — il freno non è rosso per costruzione", () => {
  const v = giudicaBurnDown({ letto: true, apertiOra: 180, apertiSettimanaFa: 200, margine: 3 });
  assert.equal(v.stato, "cala");
  assert.equal(v.uscita, USCITA.cala);
});

test("① il cantiere illeggibile è CIECO, mai un verde: un errore di lettura non è «zero difetti»", () => {
  assert.equal(giudicaBurnDown({ letto: false }).uscita, USCITA.cieco);
  assert.equal(giudicaBurnDown({ letto: true, apertiOra: null, apertiSettimanaFa: 200, margine: 0 }).uscita, USCITA.cieco);
  assert.equal(giudicaBurnDown({ letto: true, apertiOra: 10, apertiSettimanaFa: null, margine: 0 }).uscita, USCITA.cieco);
});

test("① IL CASO CHE SI COMPRA PIÙ FACILMENTE: un margine ignoto non vale zero", () => {
  // Senza margine non so di quanto può sbagliare il confronto. Trattarlo come 0 vorrebbe dire
  // dichiarare esatta una misura di cui non conosco l'errore — ed è sempre dalla parte comoda.
  const v = giudicaBurnDown({ letto: true, apertiOra: 100, apertiSettimanaFa: 200, margine: null });
  assert.equal(v.uscita, USCITA.cieco, "un margine che non conosco non può diventare un verde");
});

test("① una differenza dentro il margine non è né verde né rossa: è «non lo so» (AR-671)", () => {
  const v = giudicaBurnDown({ letto: true, apertiOra: 197, apertiSettimanaFa: 200, margine: 15 });
  assert.equal(v.stato, "incerto");
  assert.equal(v.uscita, USCITA.cieco, "tre in meno con quindici schede che non so collocare non è un miglioramento provato");
  assert.match(v.detto, /15/, "il margine va detto, altrimenti «non lo so» sembra un capriccio");
});

test("① fermo e senza incertezza NON è un peggioramento: il freno scatta su chi peggiora", () => {
  const v = giudicaBurnDown({ letto: true, apertiOra: 50, apertiSettimanaFa: 50, margine: 0 });
  assert.equal(v.stato, "fermo");
  assert.equal(v.uscita, USCITA.cala);
});

// ═══ ② IL GUARDIANO VERO ESCE 1 ═════════════════════════════════════════════

test("② ⬇️ il comando vero, su un cantiere che peggiora, ESCE 1", () => {
  const r = guardiano(PEGGIORA);
  assert.equal(r.status, 1, `atteso 1 su un cantiere che cresce, avuto ${r.status}: ${String(r.stdout).slice(0, 200)}`);
  const d = JSON.parse(r.stdout);
  assert.equal(d.verdetto_burn_down, "cresce");
  assert.equal(d.cantiere_peggiora, true);
  assert.match(d.sintesi, /CRESCE/, "il perché deve viaggiare col verdetto: chi lo legge deve sapere cosa è successo");
});

test("② lo stesso comando su un cantiere che cala esce 0, e su uno illeggibile esce 2", () => {
  // Il controllo positivo: senza, un guardiano che esce 1 SEMPRE passerebbe la prova qui sopra.
  assert.equal(guardiano(CALA).status, 0, "un cantiere che cala non deve far scattare il freno");
  assert.equal(guardiano(ILLEGGIBILE).status, 2, "un cantiere che non si legge è cieco (2), non rosso e non verde");
});

test("② senza --gate resta un METRO: chi vuole solo i numeri non si prende un rosso in faccia", () => {
  const r = guardiano(PEGGIORA, ["--json"]);
  assert.equal(r.status, 0, "senza la bandierina il comando misura e basta: è così che lo chiamano il Pannello e le prove");
  assert.equal(JSON.parse(r.stdout).verdetto_burn_down, "cresce", "ma il verdetto lo dice lo stesso, nel referto");
});

// ═══ ③ IL VERDETTO ARRIVA A QUALCUNO ════════════════════════════════════════
// È la clausola che salta più facilmente: cablare l'esecuzione non basta se l'esito finisce in una
// pipe, in un `|| true` o in una variabile che nessuno legge. Qui si esegue il controllo della
// visita e si segue il rosso fino in fondo.

test("③ ⬇️ la visita esegue il guardiano e il cantiere che cresce diventa ❌ nel suo esito", async () => {
  const { esito } = await controlloDellaVisita(PEGGIORA);
  assert.equal(esito.esito, "rotto", `atteso ❌, avuto ${esito.esito}: «${esito.detto}»`);
  assert.match(esito.detto, /CRESCE/, "il verdetto è arrivato senza il suo perché: nel referto resterebbe una frase generica");
  assert.match(esito.detto, /8/, "e senza il numero non si capisce se sono otto difetti o ottanta");
  assert.equal(esito.prova, "node cervello/salute-onesta.mjs --gate", "il rosso deve portare il comando per rifarlo a mano");
});

test("③ e un cantiere che cala resta ✅: il controllo misura, non accusa a prescindere", async () => {
  const { esito } = await controlloDellaVisita(CALA);
  assert.equal(esito.esito, "ok", `atteso ✅, avuto ${esito.esito}: «${esito.detto}»`);
});

test("③ il cantiere illeggibile è ⚪ nella visita, non ✅", async () => {
  const { esito } = await controlloDellaVisita(ILLEGGIBILE);
  assert.equal(esito.esito, "nonvisto", "un controllo che non ha potuto misurare non dice «tutto a posto»");
});

test("③ gira nella visita RAPIDA, cioè quella che sul VPS parte mattina e sera", async () => {
  const { controllo } = await controlloDellaVisita(CALA);
  assert.equal(controllo.modi, undefined, "relegato alla visita completa, il verdetto tacerebbe proprio nei giorni normali");
  assert.equal(controllo.soloSu, undefined, "e deve valere da tutte e due le case, VPS e sessione cloud");
});

// ═══ ④ IL ROSSO CONTA: non finisce in un `|| true` ══════════════════════════

test("④ ⬇️ quel ❌ fa uscire la visita con 1: il verdetto non viene ingoiato", async () => {
  const { esito } = await controlloDellaVisita(PEGGIORA);
  const risultati = [esito];
  const rotti = risultati.filter((r) => r.esito === "rotto");
  assert.equal(rotti.length, 1, "il controllo non è finito fra i rossi della visita");
  const uscita = codiceUscita({ rotti: rotti.length, guasti: 0, copertura: coperturaDi(risultati) });
  assert.equal(uscita, 1, "la visita esce 0 pur avendo un rosso: il verdetto è arrivato e non ha fermato nessuno");
});

// ═══ ⑤ E ARRIVA FINO AGLI OCCHI DI NICOLA ═══════════════════════════════════

test("⑤ ⬇️ il cantiere che cresce compare nel referto che legge Nicola e in salute.json", async () => {
  const { esito } = await controlloDellaVisita(PEGGIORA);
  const visita = {
    risultati: [esito],
    rotti: [esito],
    guasti: [],
    nonVisti: [],
    buoni: [],
    copertura: 1,
    mancantiAutotest: [],
    cronicita: { conto: {} },
    precedente: { ultime: {}, storico: [] },
  };

  // (a) la lettera che Nicola apre
  const testo = `${quattroRisposte(visita).join("\n")}\n${referto(visita)}`;
  assert.match(testo, /cantiere/i, "la parola non compare nel referto: il verdetto è di nuovo in un file che nessuno apre");
  assert.match(testo, /CRESCE/, "e deve dire cosa sta succedendo, non solo che qualcosa non va");

  // (b) il file che la Cabina e la visita successiva rileggono
  const doc = documentoSalute(visita, { casa: "claude", modo: "rapido", quando: "2026-08-22 10:00", istante: "2026-08-22T08:00:00Z", env: {} });
  const voce = (doc.ultime.claude.controlli || []).find((c) => c.id === "cervello.burndown");
  assert.ok(voce, "il controllo non finisce in salute.json: il suo verdetto morirebbe con la sessione");
  assert.equal(voce.esito, "rotto");
  assert.match(voce.detto, /CRESCE/);
  assert.equal(doc.ultime.claude.rotti, 1, "il riassunto in cima al referto non conta questo rosso");
});
