#!/usr/bin/env node
// 🚧 UN TOTALE CHE SALTA UNO STATO — AR-684 · AR-717 · AR-718 · AR-719 · AR-671 · AR-670 · AR-432.
//
// LA MALATTIA, una sola per sette difetti: il cantiere ha TRE stati vivi (`aperto`, `in-corso`,
// `da-riverificare`) più `chiuso`, e quasi tutti i contatori ne conoscevano due. Le schede del terzo
// stato non cadevano in nessun ramo e **sparivano dai totali** — non perché fossero risolte, ma
// perché la loro etichetta non era prevista. Con lei viaggia la sorella: la stessa parola definita
// in due posti che divergono in silenzio.
//
// IL CONTO CHE L'HA MISURATA, il 15/8/2026 sul cantiere vero: **716 schede** (476 chiuse, 184
// aperte, 56 da riverificare) contro un `cantiere.meta` che diceva `{aperti: 156, in_corso: 0,
// chiusi: 476}` — cioè **632: 84 difetti fuori dal numero scritto dentro il registro stesso**.
//
// COSA PROVA QUESTO FILE, eseguendo le decisioni invece di cercarle:
//   ① la casa unica conta tutti i rami e la somma FA il totale, anche su uno stato mai visto prima
//   ② i tre scrittori del cervello passano dalla casa: il meta del registro, il blocco della
//      radiografia e il debito delle prove deboli — provati chiamando le loro funzioni vere
//   ③ il gemello del Pannello dà gli STESSI numeri, campo per campo, sul cantiere vero e sui limiti
//   ④ chi non ha una data di nascita è un IGNOTO dichiarato, non un difetto sparito
//   ⑤ il guardiano di chi risponde dei difetti FALLISCE davvero su una scheda ad alto impatto senza
//      responsabile, e diventa verde quando ce l'ha
//
// NON-VACUITÀ (eseguita, non dedotta): rimettendo `da_fare: aperti + in_corso` in
// `cervello/stati-cantiere.mjs` diventano rossi ① ② ③; rimettendo `stato === "aperto"` in
// `contaProveDeboli` diventa rosso ②; togliendo il ramo degli ignoti diventa rosso ④; togliendo il
// ramo `if (alto) violazioni.push(voce)` diventa rosso ⑤.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { contaDifetti, contaGoverno, metaCantiere, sommaTorna, statiIgnoti, statoDi } from "../stati-cantiere.mjs";
import { cantiereNelSyncScan } from "../allinea-scan-cantiere.mjs";
import { contaProveDeboli } from "../chiusura-dichiarata.mjs";
import { ricalcolaMeta } from "../auto-fix.mjs";
import { CODICE, ownerSuggerito, senioriSulDisco, verdettoGoverno } from "../cantiere-owner-check.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const leggi = (rel) => readFileSync(join(REPO, rel), "utf8");

// Il gemello TypeScript si importa diretto (Node 22). In cima e non dentro un caso: un `await`
// dentro `prova()` girerebbe dopo il conteggio e un `1 = 2` stamperebbe «pass» (AR-694).
const pannello = await import(join(REPO, "pannello/src/lib/cantiere-snello.ts"));

const VERO = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Un cantiere finto della forma vera, con i quattro stati e uno mai visto prima. */
function finto({ aperti = 0, inCorso = 0, daRiverificare = 0, chiusi = 0, ignoti = 0 } = {}) {
  return [
    ...Array.from({ length: aperti }, (_, i) => ({ id: `A-${i}`, stato: "aperto", nato: "2026-08-01" })),
    ...Array.from({ length: inCorso }, (_, i) => ({ id: `C-${i}`, stato: "in-corso", nato: "2026-08-01" })),
    ...Array.from({ length: daRiverificare }, (_, i) => ({ id: `R-${i}`, stato: "da-riverificare", nato: "2026-08-01" })),
    ...Array.from({ length: chiusi }, (_, i) => ({ id: `Z-${i}`, stato: "chiuso", nato: "2026-07-01", chiuso_il: "2026-08-05" })),
    ...Array.from({ length: ignoti }, (_, i) => ({ id: `X-${i}`, stato: "in-ferie", nato: "2026-08-01" })),
  ];
}

// ═══ ① LA CASA UNICA: nessuno sparisce, e la somma si controlla da sola ══════════════════════════

prova("① le schede del terzo stato NON spariscono: «da fare» non è «aperto + in corso»", () => {
  const c = contaDifetti(finto({ aperti: 184, inCorso: 0, daRiverificare: 56, chiusi: 476 }));
  assert.equal(c.da_fare, 240, "184 + 56: il difetto era esattamente questo, 56 schede fuori dal numero");
  assert.notEqual(c.da_fare, c.aperti + c.in_corso, "sommare i due stati previsti è il buco che stiamo curando");
  assert.equal(c.totale, 716);
  assert.equal(c.da_riverificare, 56, "il terzo stato ha un numero suo, non è fuso in un totale");
});

prova("① uno stato mai visto prima finisce in `altri` e la somma torna lo stesso", () => {
  const c = contaDifetti(finto({ aperti: 2, chiusi: 1, ignoti: 3 }));
  assert.equal(c.altri, 3, "un'etichetta che non conosco non è un difetto risolto");
  assert.equal(sommaTorna(c), true, "se un ramo si perde per strada questa difesa deve dirlo");
  assert.equal(c.da_fare, 5, "chiuso è uno solo: tutto il resto è lavoro");
  const ign = statiIgnoti(finto({ ignoti: 3 }));
  assert.deepEqual(ign.map((x) => x.stato), ["in-ferie"], "gli stati ignoti si dicono per nome, non solo per numero");
  assert.equal(ign[0].quante, 3);
});

prova("① sul cantiere VERO la somma dei rami fa il totale, e i da-riverificare ci sono davvero", () => {
  const c = contaDifetti(VERO.difetti);
  assert.equal(c.letto, true);
  assert.equal(sommaTorna(c), true, "un ramo si è perso per strada sul cantiere vero");
  assert.equal(c.da_fare, c.aperti + c.in_corso + c.da_riverificare + c.altri);
  assert.ok(c.da_riverificare > 0, "se un giorno saranno zero questa riga va tolta, non commentata");
});

prova("① non letto NON è zero: senza lista i conti restano `null` e il motivo viaggia col dato", () => {
  for (const cieco of [null, undefined, "boh", 42, { difetti: [] }]) {
    const c = contaDifetti(cieco);
    assert.equal(c.letto, false, `${JSON.stringify(cieco)} non è una lista: non si conta`);
    assert.equal(c.da_fare, null);
    assert.equal(sommaTorna(c), null, "su un cieco non si emette un verdetto");
  }
  assert.equal(statoDi({ stato: " chiuso " }), "chiuso", "uno spazio in un JSON è un refuso, non un sesto stato");
  assert.equal(statoDi({}), "(senza stato)", "anche il vuoto ha un nome, così non passa inosservato");
});

// ═══ ② I TRE SCRITTORI DEL CERVELLO passano dalla casa ═══════════════════════════════════════════

prova("② il riassunto scritto DENTRO il registro conta tutte le schede, non 632 su 716", () => {
  // AR-717. `ricalcolaMeta` è la funzione vera di auto-fix, chiamata su un oggetto in memoria: qui
  // non si scrive niente sul disco, si esegue la decisione.
  const cantiere = { difetti: finto({ aperti: 184, daRiverificare: 56, chiusi: 476 }) };
  ricalcolaMeta(cantiere);
  const m = cantiere.meta;
  assert.equal(m.totale, 716, "il meta deve dichiarare quante schede ci sono davvero");
  assert.equal(m.aperti + m.in_corso + m.da_riverificare + m.chiusi + m.altri, m.totale, "632 contro 716: era questo");
  assert.equal(m.da_fare, 240, "il numero onesto di «quanto lavoro resta» deve stare nel meta");
  assert.equal(m.somma_torna, true, "il registro deve poter dire di sé che il suo conto torna");
});

prova("② il blocco che il Pannello legge nella radiografia porta il terzo stato", () => {
  // AR-718.
  const b = cantiereNelSyncScan(finto({ aperti: 10, daRiverificare: 4, chiusi: 6 }));
  assert.equal(b.cantiere_da_riverificare, 4, "le schede del terzo stato uscivano da questo blocco");
  assert.equal(b.cantiere_da_fare, 14, "«quanto resta» è tutto ciò che non è chiuso");
  assert.equal(b.cantiere_totale, 20);
  assert.equal(b.cantiere_somma_torna, true);
});

prova("② il debito delle prove deboli parte da TUTTE le schede da fare, non dalle sole aperte", () => {
  // AR-719 — il tetto «scende e non risale» poteva scendere solo perché una scheda cambiava
  // etichetta: cioè il debito migliorava da solo, che è come un debito si nasconde.
  const debole = { file: "x.mjs", pattern: "y" };
  const lista = [
    { id: "A", stato: "aperto", verifica: debole },
    { id: "R", stato: "da-riverificare", verifica: debole },
    { id: "C", stato: "in-corso", verifica: debole },
    { id: "Z", stato: "chiuso", verifica: debole },
  ];
  const d = contaProveDeboli(lista);
  assert.equal(d.deboli, 3, "la scheda da riverificare con una prova a grep resta un debito, non sparisce");
  assert.equal(d.da_fare, 3, "la base del conto è «da fare», non «aperto»");
  assert.ok(!d.ids.includes("Z"), "una scheda chiusa non è un debito aperto");
  // E sul cantiere vero il numero non cala per magia: deve restare almeno quello delle sole aperte.
  const soloAperte = VERO.difetti.filter(Boolean).filter((x) => x.stato === "aperto" && x.verifica?.file && x.verifica?.pattern).length;
  assert.ok(contaProveDeboli(VERO.difetti).deboli >= soloAperte, "allargare la base non può far scendere il debito");
});

// ═══ ③ IL GEMELLO DEL PANNELLO dà gli stessi numeri ══════════════════════════════════════════════

prova("③ cervello e Pannello contano IDENTICO sul cantiere vero, campo per campo", () => {
  const mio = contaDifetti(VERO.difetti);
  const suo = pannello.contoCantiere(VERO.difetti);
  for (const k of ["totale", "chiusi", "aperti", "in_corso", "da_riverificare", "altri", "da_fare", "senza_data_nascita"]) {
    assert.equal(suo[k], mio[k], `le due case non dicono lo stesso numero su «${k}»`);
  }
  assert.equal(pannello.sommaTorna(suo), true);
  // E il conto vecchio — solo `stato === "aperto"` — è DAVVERO diverso: è il difetto, misurato.
  const alVecchioModo = VERO.difetti.filter((d) => d && d.stato === "aperto").length;
  assert.notEqual(alVecchioModo, mio.da_fare, `contando solo «aperto» ne restavano fuori ${mio.da_fare - alVecchioModo}`);
});

prova("③ cervello e Pannello concordano anche sui casi limite, uno stato nuovo compreso", () => {
  for (const lista of [finto({ ignoti: 2, aperti: 1 }), finto({ daRiverificare: 3, chiusi: 2 }), [], [null, { stato: "aperto" }]]) {
    const mio = contaDifetti(lista);
    const suo = pannello.contoCantiere(lista);
    for (const k of ["totale", "chiusi", "aperti", "in_corso", "da_riverificare", "altri", "da_fare"]) {
      assert.equal(suo[k], mio[k], `disaccordo su «${k}» per ${JSON.stringify(lista).slice(0, 60)}`);
    }
  }
  assert.equal(pannello.contoCantiere(null).letto, false, "anche di là un non-letto non è uno zero");
});

prova("③ l'UNICA differenza fra le due case è lo spazio, ed è dichiarata — e oggi non costa niente", () => {
  // Il verso giusto è togliere gli spazi. Le due risposte opposte sono però pinzate una per parte da
  // `cervello/test/parola-senza-padrone.test.mjs`, che non è di questa corsia: allinearle lascerebbe
  // rosso il test di qualcun altro. Quindi la differenza resta MISURATA, e la trappola è qui sotto.
  const conSpazi = [{ id: "S", stato: " chiuso " }];
  assert.equal(contaDifetti(conSpazi).chiusi, 1, "per il cervello uno spazio non cambia lo stato");
  assert.equal(pannello.contoCantiere(conSpazi).chiusi, 0, "se il Pannello è stato allineato, togli questa esenzione");
  // LA TRAPPOLA: finché nessuna scheda vera ha spazi attorno allo stato, i due totali coincidono.
  // Il giorno che ne comparisse una, questo diventa rosso invece di far divergere due numeri.
  const conSpaziVeri = VERO.difetti.filter(Boolean).filter((d) => typeof d.stato === "string" && d.stato !== d.stato.trim());
  assert.deepEqual(conSpaziVeri.map((d) => d.id), [], "una scheda con lo stato scritto male: adesso i due conti divergono davvero");
});

// ═══ ④ CHI NON HA UNA DATA DI NASCITA è un ignoto dichiarato ═════════════════════════════════════

prova("④ il Pannello dichiara gli IGNOTI del confronto storico invece di scartarli in silenzio", () => {
  // AR-671 — la rotta della salute onesta si era riscritta `apertiAllaData` con dentro il difetto
  // originale (`if (nato == null) return false`). Adesso la decisione è una sola, anche di là.
  const t = Date.parse("2026-08-01");
  const lista = [
    { id: "a", nato: "2026-07-01" },
    { id: "b", nato: "2026-09-01" },
    { id: "c", nato: "2026-07-01", chiuso_il: "2026-07-15" },
    { id: "d" },
    { id: "e", nato: "boh" },
    { id: "f", chiuso_il: "2026-07-02" },
  ];
  const r = pannello.apertiAllaData(lista, t);
  assert.equal(r.conteggio, 1, "solo «a» era aperto e collocabile a quella data");
  assert.equal(r.ignoti, 2, "«d» ed «e» non si sanno collocare: vanno detti, non scartati");
  assert.equal(pannello.apertiAllaData(lista, Number.NaN).letto, false, "senza una data valida non si inventa un conto");
  assert.equal(pannello.apertiAllaData(null, t).conteggio, null, "e senza una lista non si risponde zero");
});

// ═══ ⑤ CHI RISPONDE DI UN DIFETTO — il guardiano FRENA ═══════════════════════════════════════════

prova("⑤ una scheda ad ALTO impatto senza responsabile fa fallire il guardiano", () => {
  // AR-432 — «il file che esiste ma non fallisce mai è un cartello, non un cancello».
  const senior = ["security", "qa", "devops-sre"];
  const oggi = Date.parse("2026-08-15");
  const scoperto = [{ id: "AR-1", stato: "aperto", impatto_crescita: "alto", dimensione: "rischio-sicurezza-se" }];
  const v = verdettoGoverno(scoperto, { agentiNoti: senior, oggiMs: oggi });
  assert.equal(v.codice, CODICE.rosso, "un difetto grave che non è di nessuno deve fermare il guardiano");
  assert.equal(v.violazioni[0].proposta, "security", "e il guardiano propone chi metterci, così la scusa non regge");
});

prova("⑤ con un responsabile vivo e una data ancora buona il guardiano diventa verde", () => {
  const senior = ["security", "qa"];
  const oggi = Date.parse("2026-08-15");
  const ok = [{ id: "AR-1", stato: "aperto", impatto_crescita: "alto", owner: "security", scadenza: "2026-08-31" }];
  assert.equal(verdettoGoverno(ok, { agentiNoti: senior, oggiMs: oggi }).codice, CODICE.verde);
  // Un nome che non è uno dei senior non vale: sembra assegnato e non lo è.
  const finto1 = [{ id: "AR-1", stato: "aperto", impatto_crescita: "alto", owner: "reparto-x", scadenza: "2026-08-31" }];
  assert.equal(verdettoGoverno(finto1, { agentiNoti: senior, oggiMs: oggi }).codice, CODICE.rosso);
  // Una data già passata è un impegno scaduto, non un impegno.
  const tardi = [{ id: "AR-1", stato: "aperto", impatto_crescita: "alto", owner: "security", scadenza: "2026-08-01" }];
  assert.equal(verdettoGoverno(tardi, { agentiNoti: senior, oggiMs: oggi }).codice, CODICE.rosso);
});

prova("⑤ senza l'elenco dei senior il guardiano si dichiara CIECO, non verde", () => {
  const oggi = Date.parse("2026-08-15");
  assert.equal(verdettoGoverno([{ id: "AR-1", stato: "aperto" }], { agentiNoti: [], oggiMs: oggi }).codice, CODICE.cieco);
  assert.equal(verdettoGoverno(null, { agentiNoti: ["qa"], oggiMs: oggi }).codice, CODICE.cieco);
  // I 120 senior esistono davvero sul disco: se un giorno la cartella sparisse, il cieco sarebbe vero.
  assert.ok(senioriSulDisco(REPO).length >= 100, "non trovo più i mansionari dei senior");
  assert.ok(senioriSulDisco(REPO).includes("security"));
});

prova("⑤ il conto del governo entra nel meta del registro: senza owner e scaduti sono numeri", () => {
  const g = contaGoverno(VERO.difetti, Date.parse("2026-08-15"));
  assert.equal(g.letto, true);
  assert.equal(g.da_fare, contaDifetti(VERO.difetti).da_fare, "il governo conta sulla stessa base del resto");
  assert.ok(g.senza_owner >= 0);
  const cantiere = { difetti: [{ id: "A", stato: "aperto" }] };
  ricalcolaMeta(cantiere);
  assert.equal(cantiere.meta.senza_owner, 1, "quanti difetti non sono di nessuno deve stare scritto nel registro");
  assert.equal(contaGoverno([{ stato: "aperto" }], Number.NaN).scaduti, null, "senza una data non si dichiara «zero scaduti»");
  assert.equal(ownerSuggerito({ dimensione: "una-che-non-esiste" }), null, "un padrone inventato è peggio di nessun padrone");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
