// AR-151 — test dell'audit delle chiusure passate (node --test, nessun I/O).
//
// Il difetto: una chiusura, una volta fatta, non veniva mai più guardata. AR-008 fu chiuso
// verificandolo contro CLAUDE.md — un file che DESCRIVE — invece che contro il file dell'agente,
// che è il contratto vero; e lo stesso errore è poi riemerso come AR-130.

import { test } from "node:test";
import assert from "node:assert/strict";
import { riverifica, provaDebole } from "../chiusure-audit.mjs";

const file = (mappa) => (rel) => (rel in mappa ? mappa[rel] : null);

test("riverifica(): la prova che scatta ancora è ok, quella che non scatta è regredita", () => {
  const leggi = file({ "cervello/x.mjs": "function fixApplicato() {}" });
  assert.equal(riverifica({ verifica: { file: "cervello/x.mjs", pattern: "fixApplicato" } }, leggi), "ok");
  assert.equal(riverifica({ verifica: { file: "cervello/x.mjs", pattern: "maiScritto" } }, leggi), "regredito");
});

test("riverifica(): presente:false si chiude quando il pattern SPARISCE", () => {
  const leggi = file({ "a.sh": "C:\\Users\\path\\windows" });
  // Il fix qui è la RIMOZIONE: finché il path c'è, il difetto è aperto.
  assert.equal(riverifica({ verifica: { file: "a.sh", pattern: "C:\\\\Users", presente: false } }, leggi), "regredito");
  assert.equal(riverifica({ verifica: { file: "a.sh", pattern: "roba-rimossa", presente: false } }, leggi), "ok");
});

// ⬇️ Il caso AR-037: la prova che NON POTEVA MAI scattare.
test("riverifica(): un pattern letterale vale anche se come regex è impossibile", () => {
  // `$` in mezzo a una regex asserisce fine-stringa: come regex non matcha mai. Ma il fix nel
  // codice c'è, e l'intento della prova era «nel file ci dev'essere questo testo».
  const testo = 'curl -X PATCH "$URL/rest/v1/lavori?id=eq.$id&stato=eq.in_attesa"';
  const leggi = file({ "cervello/worker.sh": testo });
  const dif = { verifica: { file: "cervello/worker.sh", pattern: "id=eq.$id&stato=eq.in_attesa" } };
  assert.equal(new RegExp(dif.verifica.pattern).test(testo), false, "come regex, davvero non matcha");
  assert.equal(riverifica(dif, leggi), "ok", "ma letteralmente c'è: la chiusura è valida");
});

test("riverifica(): senza prova o con file sparito lo dice, non inventa", () => {
  const leggi = file({});
  assert.equal(riverifica({ verifica: { tipo: "umano" } }, leggi), "senza-prova");
  assert.equal(riverifica({}, leggi), "senza-prova");
  assert.equal(riverifica({ verifica: { file: "sparito.mjs", pattern: "x" } }, leggi), "file-assente");
});

test("provaDebole(): riconosce le prove puntate a un file che DESCRIVE", () => {
  // È l'errore di AR-008: verificato contro la prosa invece che contro l'artefatto che fa la cosa.
  assert.equal(provaDebole("CLAUDE.md"), true);
  assert.equal(provaDebole("COMANDI.md"), true);
  assert.equal(provaDebole("MyCity-Vault/90-Memoria-AI/STATO.md"), true);
  assert.equal(provaDebole("consegne/audit/2026-07-16-radiografia.md"), true);
  // Il codice che esegue, invece, è una prova forte.
  assert.equal(provaDebole("cervello/autopilot.mjs"), false);
  assert.equal(provaDebole(".claude/agents/operations.md"), false, "il file dell'agente è il contratto, non prosa");
  assert.equal(provaDebole(""), false);
});

// Round 4 — le prove a COMANDO non vanno scambiate per "senza prova": sono verificabili, solo non qui.
test("riverifica(): una prova a comando è riconosciuta come tale", () => {
  const leggi = () => null;
  assert.equal(riverifica({ verifica: { comando: "node cervello/permessi-check.mjs" } }, leggi), "comando");
});
