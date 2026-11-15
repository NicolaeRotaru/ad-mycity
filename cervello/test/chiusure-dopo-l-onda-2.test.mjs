// Le chiusure riviste dopo l'onda 2 (officina minima del 15/11, pezzo 3), in decidi() e valida-collaudo:
//  (a) un minore a uscita 3 di prova-rimessa chiude con la rimessa a mano, il giudizio pieno e la deroga firmata
//      «rimessa_a_mano». K02: 5 minori (R04-012, R04-015, R04-021, R07-021, R07-022) fermi a «parziale» con giudizio
//      pieno solo perché il programma chiudeva solo a uscita 0. Gravi e bloccanti non cambiano;
//  (b) in un lotto fino a 40 voci il campione non esiste: ogni minore riparato vuole il giudizio pieno;
//  (c) l'esito nuovo «verificata_dopo_nicola» per le voci non di codice sistemate da Nicola.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { decidi, regoleCollaudo } from "../riparazione-sessioni.mjs";

const PROGRAMMA = join(dirname(fileURLToPath(import.meta.url)), "..", "riparazione-sessioni.mjs");
const FIRMA = [{ onda: 1, regole: ["rimessa_a_mano"], firma: "Nicola, card 239 «Allarga la a» (13/11 05:20)" }];
const A_MANO = { comando: "git checkout HEAD^ -- app/api/x/route.ts && npx vitest run tests/unit/x.test.ts", uscita_senza_correzione: 1, uscita_con_correzione: 0 };

const una = (gravita) => ({ id: "R04-012", chiave: "ai|foto", gravita, file: ["app/api/x/route.ts"] });
const pianoCon = (gravita, eccezioni = FIRMA) => ({ eccezioni_firmate: eccezioni, onde: [{ onda: 1, sessioni: { R04: { voci: [una(gravita)] } } }] });
const referti = { R04: { finita: true, voci: [{ id: "R04-012", chiave: "ai|foto", esito: "riparato", prova_comando: "npx vitest run tests/unit/x.test.ts", rimessa: { esito: "regge", uscita: 0, comando: "rimessa a mano" } }] } };
const collaudo = (extra = {}) => ({ collaudatore: "K02", riparatori: ["R04"], voci: [{ id: "R04-012", chiave: "ai|foto", verdetto: "regge", giudizio: "pieno", lenti: ["chiude_tutta", "nata_rotta"], rimessa: { uscita: 3, comando: "node cervello/prova-rimessa.mjs --file app/api/x/route.ts", a_mano: A_MANO }, ...extra }] });
const decisione = (piano, c = collaudo()) => decidi({ piano, referti, collaudi: [c], hub: new Set() })[0];

test("(a) un minore a uscita 3, con la deroga firmata, la rimessa a mano e il giudizio pieno si chiude", () => {
  const d = decisione(pianoCon("minore"));
  assert.equal(d.decisione, "si_chiude", d.perche);
  assert.match(d.come, /rimessa a mano/);
  assert.match(d.non_vacuita, /uscita 1 senza la correzione, 0 con \(K02, a mano\)/);
});

test("(a) la stessa voce come grave resta aperta: la deroga non vale per gravi e bloccanti", () => {
  for (const g of ["grave", "bloccante"]) {
    const d = decisione(pianoCon(g));
    assert.equal(d.decisione, "resta_aperta", g);
    assert.match(d.perche, /non è uscita 0/);
  }
});

test("(a) senza rimessa.a_mano, senza firma o senza giudizio pieno il minore resta aperto", () => {
  const senzaAMano = collaudo({ rimessa: { uscita: 3, comando: "node cervello/prova-rimessa.mjs" } });
  assert.equal(decisione(pianoCon("minore"), senzaAMano).decisione, "resta_aperta");
  const aManoVuota = collaudo({ rimessa: { uscita: 3, comando: "node cervello/prova-rimessa.mjs", a_mano: { ...A_MANO, uscita_senza_correzione: 0 } } });
  assert.equal(decisione(pianoCon("minore"), aManoVuota).decisione, "resta_aperta", "una rimessa a mano che non cade senza la correzione non prova niente");
  assert.equal(decisione(pianoCon("minore", [])).decisione, "resta_aperta", "senza la firma di Nicola");
  assert.equal(decisione(pianoCon("minore", [{ onda: 2, regole: ["rimessa_a_mano"], firma: "Nicola" }])).decisione, "resta_aperta", "la firma vale per la sua onda");
  assert.equal(decisione(pianoCon("minore"), collaudo({ giudizio: "nessuno" })).decisione, "resta_aperta");
});

test("(a) valida-collaudo: il «regge» a uscita 3 con la rimessa a mano è rosso, se non c'è la deroga dell'onda", () => {
  const ctx = (deroga) => ({ nome: "K02", riparatori: { R04: { voci: [una("minore")], referto: referti.R04 } }, hub: new Set(), deroga });
  const testo = JSON.stringify({ ...collaudo(), aggiornato: "2026-11-15 07:00", finita: true });
  assert.match(regoleCollaudo(testo, ctx(() => false)).rossi.join("\n"), /uscita 3 e la rimessa a mano: vale solo con l'eccezione firmata/);
  assert.deepEqual(regoleCollaudo(testo, ctx((regola) => regola === "rimessa_a_mano")).rossi, []);
});

function campagna(voci, refertoVoci, collaudoVoci) {
  const t = mkdtempSync(join(tmpdir(), "chiusure-"));
  const C = join(t, "consegne/riparazioni/2026-11-15-prova");
  const scrivi = (p, x) => { mkdirSync(dirname(join(C, p)), { recursive: true }); writeFileSync(join(C, p), JSON.stringify(x)); };
  scrivi("perimetro.json", { casa: "macchina", profilo: "tutto", lavorabili: [] });
  scrivi("piano.json", { casa: "macchina", onde: [{ onda: 1, sessioni: { R05: { voci, file: [] } } }], cucitura: [], eccedenza: [] });
  scrivi("referti/R05.json", { sessione: "R05", finita: true, voci: refertoVoci });
  scrivi("collaudi/K09.json", { collaudatore: "K09", riparatori: ["R05"], aggiornato: "2026-11-15 07:00", finita: true, voci: collaudoVoci });
  const r = spawnSync(process.execPath, [PROGRAMMA, "valida-collaudo", join(C, "collaudi/K09.json"), "--cartella", C, "--radice", t], { encoding: "utf8" });
  rmSync(t, { recursive: true, force: true });
  return r;
}

test("(b) lotto di 30 voci: due minori riparati senza giudizio pieno fanno uscire valida-collaudo con 1, e dice quali", () => {
  const voci = Array.from({ length: 30 }, (_, i) => ({ id: `R05-${String(i + 1).padStart(3, "0")}`, chiave: `m|${i}`, gravita: "minore", file: [`lib/m${i}.ts`] }));
  const refertoVoci = voci.map((v) => ({ id: v.id, chiave: v.chiave, esito: "riparato", rimessa: { esito: "regge", uscita: 0, comando: "x" } }));
  const pieno = { giudizio: "pieno", lenti: ["chiude_tutta", "nata_rotta"] };
  const collaudoVoci = voci.map((v, i) => ({ id: v.id, chiave: v.chiave, verdetto: "regge", rimessa: { uscita: 0, comando: "node cervello/prova-rimessa.mjs x" }, ...(i === 7 || i === 21 ? { giudizio: "nessuno" } : pieno) }));
  const r = campagna(voci, refertoVoci, collaudoVoci);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /R05-008: minore riparato senza giudizio pieno: in un lotto di 30 voci/);
  assert.match(r.stdout, /R05-022: minore riparato senza giudizio pieno/);
  assert.doesNotMatch(r.stdout, /campione troppo piccolo/);
  // Con il giudizio pieno su tutti il collaudo è verde.
  const tutti = campagna(voci, refertoVoci, collaudoVoci.map((v) => ({ ...v, ...pieno })));
  assert.equal(tutti.status, 0, tutti.stdout + tutti.stderr);
});

test("(c) «verificata_dopo_nicola» chiude solo con prova, rimessa e il giudizio pieno di un'altra sessione", () => {
  const piano = { onde: [{ onda: 1, sessioni: { R06: { voci: [{ id: "R06-003", chiave: "env|chiave", gravita: "grave", file: [] }] } } }] };
  const voce = { id: "R06-003", chiave: "env|chiave", esito: "verificata_dopo_nicola", prova_comando: "node cervello/verifica-sensori.mjs --solo stripe", rimessa: { comando: "node cervello/verifica-sensori.mjs --solo stripe", uscita_senza_correzione: 2, uscita_con_correzione: 0 } };
  const k = (extra = {}) => ({ collaudatore: "K10", riparatori: ["R06"], voci: [{ id: "R06-003", chiave: "env|chiave", verdetto: "regge", giudizio: "pieno", ...extra }] });
  const d = (v, c = k()) => decidi({ piano, referti: { R06: { voci: [v] } }, collaudi: [c], hub: new Set() })[0];
  assert.equal(d(voce).decisione, "si_chiude");
  assert.match(d(voce).come, /verificata dopo Nicola/);
  assert.equal(d({ ...voce, prova_comando: "" }).decisione, "resta_aperta", "senza prova");
  assert.equal(d({ ...voce, rimessa: { ...voce.rimessa, uscita_senza_correzione: 0 } }).decisione, "resta_aperta", "senza non-vacuità: la prova passava anche prima");
  assert.equal(d(voce, k({ giudizio: "nessuno" })).decisione, "resta_aperta", "senza giudizio pieno");
  assert.equal(d(voce, { ...k(), collaudatore: "R06" }).decisione, "resta_aperta", "collaudata dalla stessa sessione");
  assert.equal(decidi({ piano, referti: { R06: { voci: [voce] } }, collaudi: [], hub: new Set() })[0].decisione, "resta_aperta", "senza collaudo");
});
