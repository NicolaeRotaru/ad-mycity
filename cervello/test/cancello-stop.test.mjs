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
import { chiusiSenzaProva, allarmiSenzaCoda, lezioniSenzaGate, consegnaSenzaEsito, verdetto, ALLARMI } from "../cancello-stop.mjs";

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
