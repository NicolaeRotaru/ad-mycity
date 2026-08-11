#!/usr/bin/env node
// AR-168 — le previsioni nascono già chiuse: chi le scrive conosce già il risultato.
//
// Il rituale ESITO chiude un lavoro, e per definizione lo si scrive quando il lavoro è finito. Finché
// la previsione nasceva da quella riga — che contiene atteso E reale — nasceva vinta o persa in
// partenza. Misurato il 28/7: **37 voci su 42** avevano `creato` e `chiuso_il` nello stesso giorno.
//
// Il lotto 16 le aveva già tolte dal punteggio. Questo lotto toglie la causa: i due momenti diventano
// DUE comandi. `prevedi` prima del lavoro, con la baseline e la finestra. `registra` dopo, che va a
// chiudere QUELLA previsione col numero vero — e pretende di sapere da dove viene il numero.
//
// Nel ponte c'era anche una bugia scritta in un commento: una riparazione precedente aveva rinominato
// la metrica in `esito_loop_numerico` APPOSTA perché le righe nuove contassero («sono previsioni vere
// e devono contare»), mentre nascono tutte con creato === chiuso_il. Ora vanno in `osservazioni`:
// restano leggibili, non fanno punteggio, e non fingono di essere previsioni.

import { spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { ESCLUSA, contaNelPunteggio, nataChiusa } from "../previsione-verificabile.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const CAL = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json");
const LOOP = join(REPO, "cervello/chiusura-loop.mjs");
const QUADERNO = join(REPO, "memoria-squadra/prova-due-momenti.md");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

// stdout E stderr: gli avvisi che contano qui («manca la fonte», «FUORI FINESTRA») vanno su stderr,
// e la prima versione di questo test leggeva solo stdout — quindi non vedeva proprio le righe che
// doveva verificare, e le dava per assenti. Un test cieco sul canale giusto è un test che assolve.
const run = (args) => {
  const r = spawnSync("node", args, { cwd: REPO, encoding: "utf8" });
  return { rc: r.status ?? 1, out: `${r.stdout || ""}${r.stderr || ""}` };
};
const registro = () => JSON.parse(readFileSync(CAL, "utf8"));

// LA FINESTRA DELLA PREVISIONE DI PROVA: una data che non può scadere.
//
// Qui c'era `2026-08-10` scritto a mano, e l'11/8 alle 00:00 questo test è diventato rosso da solo —
// su main, per tutte le PR, senza che nessuno avesse toccato una riga. Il codice era a posto: la
// finestra si era chiusa il giorno prima, quindi `registra` rifiutava la chiusura per AR-173
// («oggi è troppo tardi per dichiararne l'esito») e la riga «Chiusa la previsione aperta» non
// usciva. Un test con una scadenza dentro è una bomba a orologeria: passa finché passa, poi accusa
// di un guasto chi non l'ha causato — ed è esattamente il rosso che si impara ad aggirare.
//
// La finestra qui non è ciò che si sta provando: si prova che il SECONDO momento chiude la
// previsione del PRIMO. Il caso della chiusura fuori tempo ha già il suo test, più sotto («AR-173,
// ultima clausola»). Quindi la data va spinta dove non può arrivare, come fa già
// `previsione-banale-dai-dati.test.mjs` con `--entro=2099-01-01`.
const ENTRO_CHE_NON_SCADE = "2099-01-01";

prova("il caso che ha rotto: creato e chiuso nello stesso giorno non è una previsione", () => {
  const finta = { stato: "azzeccata", sensore_stato: "ok", atteso: 1, baseline: 0, creato: "2026-07-20 09:00", chiuso_il: "2026-07-20 18:30" };
  assert.equal(nataChiusa(finta), true);
  assert.ok(contaNelPunteggio(finta).motivi.includes(ESCLUSA.NATA_CHIUSA));
  // La regola è sul GIORNO, non sull'istante: la versione vecchia in volano-regole confrontava
  // `creato === chiuso_il` esatto e non prendeva quasi nessuna delle 37. Sbaglia per eccesso, cioè
  // nella direzione sicura — al massimo esclude una previsione onesta di un giorno solo, e
  // l'esclusione si vede nel report invece di sparire.
  assert.equal(nataChiusa({ creato: "2026-07-20 09:00", chiuso_il: "2026-07-21 09:00" }), false);
});

prova("i due momenti ESISTONO come due comandi", () => {
  const uso = run([LOOP]).out;
  assert.match(uso, /prevedi .*PRIMA del lavoro/, "il primo momento dev'essere un comando, non una buona intenzione");
  assert.match(uso, /registra .*DOPO/);
});

prova("il ciclo completo, ESEGUITO: apre prima, chiude dopo, e la voce conta", () => {
  const prima = readFileSync(CAL, "utf8");
  try {
    run([LOOP, "prevedi", "@prova-due-momenti", "fare la cosa", "ordini", "2", "0", ENTRO_CHE_NON_SCADE]);
    const aperta = registro().registro.find((e) => e.stato === "aperta" && e.reparto === "@prova-due-momenti");
    assert.ok(aperta, "il primo momento deve aprire una previsione vera");
    assert.equal(aperta.baseline, 0, "con la baseline del momento in cui si apre");
    assert.equal(aperta.atteso, 2);
    assert.equal(aperta.reale, null, "il reale NON esiste ancora: è tutto il punto");

    const con = run([LOOP, "registra", "@prova-due-momenti", "ctx", "sc", "2", "2", "--fonte=Supabase MCP"]);
    assert.match(con.out, /Chiusa la previsione aperta/, "il secondo momento deve chiudere QUELLA previsione");
    const chiusa = registro().registro.find((e) => e.id === aperta.id);
    assert.equal(chiusa.stato, "azzeccata");
    assert.equal(chiusa.reale, 2);
    assert.equal(chiusa.sensore_stato, "ok", "chiusa con una fonte che vedeva");
  } finally {
    writeFileSync(CAL, prima);
    rmSync(QUADERNO, { force: true });
  }
});

prova("senza la fonte del numero la previsione resta APERTA, non si chiude a vuoto", () => {
  // AR-062/AR-171: «chiusura-loop ESITO» non è più una fonte ammessa, ed è giusto — leggere il
  // proprio quaderno non è misurare la realtà. Chiudere lo stesso sarebbe la macchina che si dà
  // ragione da sola; lasciarla aperta è la risposta scomoda e vera.
  const prima = readFileSync(CAL, "utf8");
  try {
    run([LOOP, "prevedi", "@prova-due-momenti", "fare la cosa", "ordini", "2", "0", ENTRO_CHE_NON_SCADE]);
    const aperta = registro().registro.find((e) => e.stato === "aperta" && e.reparto === "@prova-due-momenti");
    const senza = run([LOOP, "registra", "@prova-due-momenti", "ctx", "sc", "2", "2"]);
    assert.match(senza.out, /manca la fonte del numero/);
    assert.equal(registro().registro.find((e) => e.id === aperta.id).stato, "aperta", "resta aperta");
    assert.match(senza.out, /🔁 ESITO registrato/, "…ma la riga nel quaderno si scrive lo stesso: il lavoro è stato fatto");
  } finally {
    writeFileSync(CAL, prima);
    rmSync(QUADERNO, { force: true });
  }
});

prova("il ponte non fabbrica più previsioni: scrive OSSERVAZIONI", () => {
  const prima = readFileSync(CAL, "utf8");
  try {
    const n0 = registro().registro.length;
    // Nessuna previsione aperta per questo reparto → si scende al ponte.
    const r = run([LOOP, "registra", "@prova-due-momenti", "ctx", "sc", "3", "3"]);
    const dopo = registro();
    assert.equal(dopo.registro.length, n0, "il registro che fa punteggio non deve crescere");
    const oss = (dopo.osservazioni || []).find((e) => e.reparto === "@prova-due-momenti");
    assert.ok(oss, "l'osservazione dev'esserci: non si butta via, non si finge");
    assert.match(oss.nota, /NON è una previsione/, "e deve dire di sé stessa cosa non è");
    assert.match(r.out, /OSSERVAZIONE, non fa punteggio/);
    assert.match(r.out, /aprila PRIMA del lavoro/, "e indicare la strada giusta");
  } finally {
    writeFileSync(CAL, prima);
    rmSync(QUADERNO, { force: true });
  }
});

prova("il commento che diceva l'opposto del codice non c'è più", () => {
  // «sono previsioni vere e devono contare», scritto sopra righe che nascono tutte con
  // creato === chiuso_il. Un commento falso è peggio di nessun commento: il prossimo che legge si fida.
  const src = readFileSync(join(REPO, "cervello/calibrazione.mjs"), "utf8");
  // La frase c'è ancora, ma CITATA: serve a spiegare cosa si era creduto. La prima versione di
  // questa prova cercava la sua assenza e bocciava il commento che la smentiva — assurdo.
  const i = src.indexOf("sono previsioni vere e devono contare");
  assert.ok(i > 0, "la frase resta come citazione: cancellarla perderebbe il perché");
  assert.match(src.slice(i, i + 260), /Ma queste righe nascono/, "dev'essere smentita subito dopo, non lasciata come regola");
  assert.match(src, /data\.osservazioni\.push/, "il ponte deve scrivere fra le osservazioni");
  assert.doesNotMatch(src.slice(src.indexOf("function cmdDaLoop"), src.indexOf("function cmdAutoprevedi")), /data\.registro\.push/, "il ponte non deve più scrivere nel registro che fa punteggio");
});

prova("AR-173, ultima clausola: la chiusura tardiva chiede la riga di lezione", () => {
  const prima = readFileSync(CAL, "utf8");
  const j = registro();
  const scaduta = j.registro.find((e) => /^\d{4}-\d{2}-\d{2}/.test(String(e.entro)) && new Date(e.entro).getTime() < Date.now());
  assert.ok(scaduta, "serve una voce con finestra passata");
  const r = run([join(REPO, "cervello/calibrazione.mjs"), "esito", `--id=${scaduta.id}`, "--reale=1", "--fonte=Supabase MCP", "--fuori-finestra"]);
  assert.match(r.out, /FUORI FINESTRA/);
  assert.match(r.out, /perché è stata misurata\s+in ritardo|in ritardo/, "deve CHIEDERE la lezione, non solo perdonare il ritardo");
  writeFileSync(CAL, prima); // byte per byte: l'esito ha riscritto il file
});

prova("AR-168, ultima clausola: la card della promozione dice COSA sta contando", () => {
  // Il meccanismo era già a posto — dal lotto 16 una voce nata chiusa non fa punteggio, quindi non può
  // gonfiare una promozione. Ma la card non lo DICEVA, e la card è quello che Nicola firma:
  // «8/8 previsioni azzeccate» e «8 previsioni aperte prima di sapere come andava, su 42 righe a
  // registro» sono due frasi che chiedono due firme diverse.
  //
  // Questa clausola era la TERZA di AR-168, ed è saltata come sempre l'ultima — pur avendo scritto la
  // regola un'ora prima. Per questo si prova, invece di ricordarsela.
  const src = readFileSync(join(REPO, "cervello/calibrazione.mjs"), "utf8");
  const i = src.indexOf("Prova (calibrazione)");
  assert.ok(i > 0, "la riga della prova dev'esserci nella card");
  const blocco = src.slice(i - 200, i + 900);
  assert.match(blocco, /dichiarate prima di conoscere l'esito/, "deve dire QUANDO sono state dichiarate");
  assert.match(blocco, /r\.escluse/, "e quante voci del reparto non contano");
  assert.match(blocco, /nate già chiuse|fuori finestra/, "dicendo anche perché non contano");
});

// La proprietà, eseguita: il campo che la card usa dev'essere calcolato davvero.
prova("il conteggio delle escluse per reparto è un DATO, non una frase nella card", () => {
  const cal = JSON.parse(readFileSync(CAL, "utf8"));
  const conEscluse = (cal.per_reparto || []).filter((r) => typeof r.escluse === "number");
  assert.equal(conEscluse.length, (cal.per_reparto || []).length, "ogni reparto deve portare il proprio conteggio");
  const sommaEscluse = conEscluse.reduce((n, r) => n + r.escluse, 0);
  assert.ok(sommaEscluse > 0, "sul registro vero ci sono voci escluse: se fosse 0 la card mentirebbe per omissione");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
