#!/usr/bin/env node
// 🧪 Le prove del CANCELLO DELLO STOP (cervello/cancello-stop.mjs).
//
// Perché su stati finti e non sul repo: se questi casi misurassero com'è il cantiere adesso,
// diventerebbero verdi o rossi per motivi che non c'entrano con la regola che difendono — e fra un
// mese nessuno saprebbe se un rosso è un bug o una scheda nuova di qualcun altro.
//
// Il caso che conta più di tutti è il primo, ed è misurato sul vero: il 31/7 ho chiuso NOVE difetti
// (AR-455, AR-462, AR-465..AR-471) e nessuno dei nove portava un comando capace di fallire. Se questo
// file diventa verde su quel caso, il cancello non serve a niente.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  chiusiSenzaProva,
  allarmiSenzaCoda,
  lezioniSenzaGate,
  consegnaSenzaEsito,
  testiIlleggibili,
  messaggioIlleggibile,
  ultimoTestoAssistente,
  verdetto,
  ALLARMI,
} from "../cancello-stop.mjs";

// ── ① difetto chiuso senza prova ──────────────────────────────────────────────

test("IL CASO VERO: un difetto chiuso adesso senza comando di prova viene fermato", () => {
  const prima = [{ id: "AR-455", stato: "aperto" }];
  const dopo = [{ id: "AR-455", stato: "chiuso", titolo: "Il freno in tempo reale non e attaccato" }];
  const t = chiusiSenzaProva(prima, dopo);
  assert.equal(t.length, 1, "chiuso senza prova = archiviato, non riparato");
  assert.equal(t[0].id, "AR-455");
  assert.equal(t[0].debole, false, "qui non c'era proprio niente");
});

test("un difetto chiuso CON un comando passa: il freno non deve punire chi fa la cosa giusta", () => {
  const prima = [{ id: "AR-1", stato: "aperto" }];
  const dopo = [{ id: "AR-1", stato: "chiuso", verifica: { comando: "node cervello/test/x.test.mjs" } }];
  assert.deepEqual(chiusiSenzaProva(prima, dopo), []);
});

test("la forma debole {file,pattern} non basta, e il messaggio lo distingue", () => {
  // Un pattern controlla la FORMA del codice: passerebbe identico su un fix rotto.
  const prima = [{ id: "AR-2", stato: "aperto" }];
  const dopo = [{ id: "AR-2", stato: "chiuso", verifica: { file: "x.mjs", pattern: "abc" } }];
  const t = chiusiSenzaProva(prima, dopo);
  assert.equal(t.length, 1);
  assert.equal(t[0].debole, true, "chi legge deve sapere che c'era una prova, ma della specie sbagliata");
});

test("un difetto chiuso da PRIMA non viene ricontato: il cancello guarda il mio lavoro, non l'archivio", () => {
  // Senza questo, il freno partirebbe rosso su 247 schede storiche e verrebbe spento entro il giorno.
  const gia = [{ id: "AR-3", stato: "chiuso" }];
  assert.deepEqual(chiusiSenzaProva(gia, gia), []);
});

// ── ② allarme scritto e non accodato ──────────────────────────────────────────

test("un allarme scritto mentre la coda resta intatta viene fermato", () => {
  const file = [{ file: "consegne/devops/sito-503.md", contenuto: "# 🔴 CRITICO — il sito e' giu'" }];
  assert.deepEqual(allarmiSenzaCoda(file, false), ["consegne/devops/sito-503.md"]);
});

test("se ho toccato la coda taccio: non so se la riga giusta e' quella, e un guardiano che indovina si spegne", () => {
  const file = [{ file: "consegne/x.md", contenuto: "🔴 bloccante" }];
  assert.deepEqual(allarmiSenzaCoda(file, true), []);
});

test("un file senza marcatori d'allarme non e' un allarme", () => {
  assert.deepEqual(allarmiSenzaCoda([{ file: "note.md", contenuto: "tutto a posto, niente da segnalare" }], false), []);
});

test("i marcatori sono le forme VERE con cui questa macchina scrive «e' grave»", () => {
  for (const testo of ["🔴 sito giu'", "CRITICO: nessun payout", "difetto bloccante trovato"]) {
    assert.ok(ALLARMI.some((r) => r.test(testo)), `«${testo}» deve contare come allarme`);
  }
  assert.ok(!ALLARMI.some((r) => r.test("verde, nessun problema")), "e un testo tranquillo no");
});

// ── ③ lezione senza freno ─────────────────────────────────────────────────────

test("una lezione nuova senza gate viene fermata: senza freno e' una frase", () => {
  assert.deepEqual(lezioniSenzaGate([{ id: "L-1" }], [{ id: "L-1" }, { id: "L-2", gate: "" }]), ["L-2"]);
});

test("una lezione nuova con un gate passa, e le vecchie senza gate non si ricontano", () => {
  assert.deepEqual(lezioniSenzaGate([{ id: "L-1" }], [{ id: "L-1" }, { id: "L-2", gate: "node x.test.mjs" }]), []);
  assert.deepEqual(lezioniSenzaGate([{ id: "L-9" }], [{ id: "L-9" }]), [], "il debito storico non e' il mio delta");
});

// ── Il verdetto ───────────────────────────────────────────────────────────────

test("niente da dire = non blocca, e non stampa niente", () => {
  const v = verdetto({});
  assert.equal(v.blocca, false);
  assert.equal(v.righe.length, 0, "un avvisatore che parla sempre viene spento entro la settimana");
});

test("il verdetto dice COSA FARE, non solo cosa manca", () => {
  const v = verdetto({ chiusi: [{ id: "AR-9", titolo: "x", debole: false }] });
  assert.equal(v.blocca, true);
  const testo = v.righe.join("\n");
  assert.match(testo, /verifica/, "deve nominare il campo da riempire");
  assert.match(testo, /riaprilo/, "…e l'alternativa onesta: riaprire");
});

test("LA VALVOLA ANTI-CAPPIO: se ha gia' bloccato una volta non blocca di nuovo", () => {
  // Un freno che incastra il turno viene spento entro il giorno, che e' il peggiore degli esiti:
  // meglio un avviso che passa che un cancello disattivato.
  const v = verdetto({ chiusi: [{ id: "AR-9", titolo: "x" }], giaBloccato: true });
  assert.equal(v.blocca, false, "la seconda volta avvisa e lascia passare");
  assert.ok(v.righe.length > 1, "ma lo dice lo stesso: silenzio no");
  assert.match(v.righe[0], /gia' fermato|già fermato/, "e spiega perche' non blocca");
});

test("tre problemi diversi si dicono tutti e tre, non solo il primo", () => {
  const v = verdetto({
    chiusi: [{ id: "AR-9", titolo: "x" }],
    allarmi: ["consegne/y.md"],
    lezioni: ["L-3"],
  });
  const testo = v.righe.join("\n");
  assert.match(testo, /AR-9/);
  assert.match(testo, /consegne\/y\.md/);
  assert.match(testo, /L-3/);
});

// ── ④ lavoro consegnato senza esito (AR-154) ──────────────────────────────────
//
// Il rituale ESITO dipende da un passo manuale, e fallisce quando serve di piu': nello sprint del
// 21-24/7 il quaderno di @tech e' rimasto fermo al 20/7 per 47 righe mentre decine di PR venivano
// mergiate. Non e' pigrizia: sotto pressione si chiude il bug dopo, non si registra quello prima.

test("IL CASO AR-154: codice committato e nessun quaderno toccato viene fermato", () => {
  const r = consegnaSenzaEsito(["cervello/git-pr.mjs", "pannello/src/lib/nav.ts"]);
  assert.notEqual(r, null, "consegnare codice senza dire com'e' andata e' il difetto");
  assert.equal(r.quanti, 2);
});

test("se una riga di quaderno c'e', passa: il freno chiede l'esito, non un modulo", () => {
  assert.equal(consegnaSenzaEsito(["cervello/git-pr.mjs", "memoria-squadra/tech.md"]), null);
});

test("un lavoro di sola memoria non deve un esito di reparto", () => {
  // Aggiornare STATO o una scheda non e' un lavoro di reparto: chiedere l'esito qui sarebbe rumore.
  assert.equal(consegnaSenzaEsito(["MyCity-Vault/90-Memoria-AI/STATO.md", "consegne/x.md"]), null);
  assert.equal(consegnaSenzaEsito([]), null, "niente committato, niente da chiedere");
});

test("il verdetto dice QUALE comando lancio e perche' serve", () => {
  const v = verdetto({ senzaEsito: { quanti: 2, esempio: ["cervello/x.mjs", "cervello/y.mjs"] } });
  assert.equal(v.blocca, true);
  const t = v.righe.join("\n");
  assert.match(t, /chiusura-loop\.mjs registra/, "deve dare il comando, non solo il rimprovero");
  assert.match(t, /atteso.*reale|calibrazione/i, "e dire perche' quella riga vale qualcosa");
});

// ── ⑤ AR-478: il testo che Nicola leggera' e non si capisce ─────────────────────────────────────
//
// Nicola, 2/8: «attacca il misuratore cosi' viene chiamato in automatico, cosi' non lo salti mai
// quando c'e' pressione». Prima di questo, si-capisce.mjs non lo chiamava nessuno.

const NOTE = new Set(["cancello", "guardiano", "freno"]);
const lungoDifficile = [
  "# Titolo",
  ...Array.from({ length: 20 }, (_, i) => `Riga ${i} di spiegazione che non dice niente di concreto.`),
].join("\n");

test("un testo NUOVO per Nicola che non si capisce viene fermato", () => {
  const r = testiIlleggibili([{ file: "consegne/tech/nota.md", contenuto: lungoDifficile, contenutoPrima: null }], NOTE);
  assert.equal(r.length, 1, "un file nuovo entra da zero: ogni suo problema e' nuovo");
  assert.ok(r[0].quanti > 0);
});

test("SI MISURA IL PEGGIORAMENTO, non il totale: un file vecchio gia' difficile passa se non peggiora", () => {
  // Il caso vero che ha generato la regola: il GLOSSARIO, 500 righe scritte a luglio, sfiorato per
  // aggiungerci una parte. Sul totale sarebbe stato un blocco a ogni ritocco, e un cancello che non
  // puo' diventare verde viene aggirato al secondo giro.
  const r = testiIlleggibili(
    [{ file: "consegne/tech/nota.md", contenuto: lungoDifficile, contenutoPrima: lungoDifficile }],
    NOTE,
  );
  assert.deepEqual(r, [], "stesso testo, stessi problemi: non e' debito nuovo");
});

test("…ma se lo stesso file peggiora, si ferma e dice DI QUANTO", () => {
  const peggiorato = lungoDifficile + "\nCome dicevo, la cosa era gia' evidente a tutti.";
  const r = testiIlleggibili(
    [{ file: "consegne/tech/nota.md", contenuto: peggiorato, contenutoPrima: lungoDifficile }],
    NOTE,
  );
  assert.equal(r.length, 1);
  assert.ok(r[0].nuovi >= 1, "deve dire quanti punti ho aggiunto io");
  assert.ok(r[0].prima > 0, "e da quanti partiva");
});

test("la storia non si riscrive: briefing, decisioni e sala operativa sono esenti", () => {
  const testi = [
    { file: "MyCity-Vault/90-Memoria-AI/Briefing/2026-07-01.md", contenuto: lungoDifficile, contenutoPrima: null },
    { file: "MyCity-Vault/90-Memoria-AI/DECISIONI.md", contenuto: lungoDifficile, contenutoPrima: null },
    { file: "MyCity-Vault/90-Memoria-AI/SALA-OPERATIVA.md", contenuto: lungoDifficile, contenutoPrima: null },
  ];
  assert.deepEqual(testiIlleggibili(testi, NOTE), [], "riscrivere il passato non e' spiegarsi meglio");
});

test("il codice non viene misurato come prosa: solo dove legge Nicola", () => {
  const testi = [{ file: "cervello/README.md", contenuto: lungoDifficile, contenutoPrima: null }];
  assert.deepEqual(testiIlleggibili(testi, NOTE), []);
});

test("il verdetto dice il comando per vedere tutto e vieta di togliere la sostanza", () => {
  const v = verdetto({ illeggibili: [{ file: "consegne/x.md", quanti: 9, prima: 2, nuovi: 7, primi: [{ riga: 3, dico: "spezzala" }] }] });
  assert.equal(v.blocca, true);
  const t = v.righe.join("\n");
  assert.match(t, /si-capisce\.mjs consegne\/x\.md/, "deve dare il comando per vederli tutti");
  assert.match(t, /sostanza NON si toglie/, "AR-478: i termini tecnici restano, si spiegano");
});

// ── ⑥ AR-481: il messaggio in chat, che si diceva non misurabile ────────────────────────────────
//
// AR-478 dichiarava un buco: «la chat non e' un file, nessun controllo puo' girarci sopra».
// Era falso. L'hook Stop riceve `transcript_path`, cioe' il file dove Claude Code scrive tutta la
// conversazione. La chat E' un file: non era il file che stavo guardando.

const rigaAssistente = (testo) =>
  JSON.stringify({ type: "assistant", message: { content: [{ type: "text", text: testo }] } });
const rigaStrumento = JSON.stringify({
  type: "assistant",
  message: { content: [{ type: "tool_use", name: "Bash", input: {} }] },
});

test("prende l'ultimo messaggio che ho scritto, non il primo", () => {
  const righe = [rigaAssistente("il primo"), rigaAssistente("l'ultimo")];
  assert.equal(ultimoTestoAssistente(righe), "l'ultimo");
});

test("salta le chiamate agli strumenti: quelle non le legge Nicola", () => {
  const righe = [rigaAssistente("il mio messaggio"), rigaStrumento, rigaStrumento];
  assert.equal(ultimoTestoAssistente(righe), "il mio messaggio");
});

test("una riga spezzata a meta' non fa cadere la misura", () => {
  // Si legge solo la CODA del file, quindi la prima riga e' quasi sempre tagliata.
  const righe = ['{"type":"assist', rigaAssistente("questo si legge")];
  assert.equal(ultimoTestoAssistente(righe), "questo si legge");
});

test("nessun messaggio nella coda letta: cieco, non accusa nessuno", () => {
  assert.equal(ultimoTestoAssistente([rigaStrumento]), null);
  assert.equal(ultimoTestoAssistente([]), null);
});

test("un messaggio breve in chat non deve avere tre blocchi e un esempio", () => {
  // Chiederlo su «fatto, il sito e' tornato online» sarebbe rumore a ogni turno.
  assert.equal(messaggioIlleggibile("Fatto, il sito e' di nuovo online.", NOTE), null);
});

test("IL CASO AR-481: un messaggio lungo e scritto male viene fermato prima di partire", () => {
  const m = messaggioIlleggibile(lungoDifficile, NOTE);
  assert.notEqual(m, null, "la chat e' il posto dove Nicola legge di piu'");
  assert.ok(m.quanti > 0);
  assert.ok(m.minuti >= 1, "deve dire anche quanto tempo gli costa");
});

test("il verdetto sul messaggio dice di riscriverlo SENZA togliere la sostanza", () => {
  const v = verdetto({ messaggio: { quanti: 5, minuti: 3, primi: [{ dico: "manca l esempio" }] } });
  assert.equal(v.blocca, true);
  const t = v.righe.join("\n");
  assert.match(t, /PRIMA di chiudere il turno/, "il punto e' fermarlo prima che parta");
  assert.match(t, /non si toglie il contenuto/, "AR-480: la sostanza resta");
});
