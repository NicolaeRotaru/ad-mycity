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
  statoDiPartenza,
  allarmiSenzaCoda,
  codaToccataNelPerimetro,
  lezioniSenzaGate,
  consegnaSenzaEsito,
  chiusuraLegittima,
  esitiScritti,
  testiIlleggibili,
  testoDaMisurare,
  messaggioIlleggibile,
  ultimoTestoAssistente,
  testiAssistente,
  verdetto,
  scegliPerimetro,
  uscitaFuoriDallHook,
  siPiantaAncora,
  basiPerIlTesto,
  ALLARMI,
} from "../cancello-stop.mjs";

// ── ⓪ il perimetro: questo turno, non tutto il ramo (AR-496) ──────────────────
//
// Il caso vero: il 3/8, in un turno di sole letture con l'albero pulito, il cancello ha contestato un
// allarme scritto il 31/7 su un commit di questo ramo — e col perimetro `origin/main...HEAD` sarebbe
// ricomparso a ogni chiusura fino al merge. Un rosso che si ripete uguale insegna a ignorare il freno.

test("con l'ancora del turno il perimetro è il turno, e non si dichiara niente", () => {
  const p = scegliPerimetro({ ancora: "abc123", ancoraUsabile: true, base: "origin/main" });
  assert.equal(p.da, "abc123");
  assert.equal(p.turno, true);
  assert.equal(p.nota, null, "quando il perimetro è preciso non c'è niente da avvertire");
});

test("senza ancora si guarda il ramo, ma lo si DICE: un perimetro largo taciuto è peggio di uno largo", () => {
  const p = scegliPerimetro({ ancora: null, ancoraUsabile: false, base: "origin/main" });
  assert.equal(p.da, "origin/main");
  assert.equal(p.turno, false);
  assert.match(p.nota, /prima volta/, "e spiega perché, o sembra un difetto");
});

test("un'ancora che non è più antenata di HEAD (rebase) non si usa e si dichiara", () => {
  const p = scegliPerimetro({ ancora: "vecchio", ancoraUsabile: false, base: "main" });
  assert.equal(p.da, "main");
  assert.match(p.nota, /rebase|antenato/, "fingere precisione dopo un rebase darebbe un perimetro inventato");
});

test("l'ancora si sposta solo sui turni puliti: su uno bloccato il freno si scavalcherebbe da solo", () => {
  assert.equal(siPiantaAncora(["🛑 …", "❌ un allarme non accodato"], true), false);
  assert.equal(siPiantaAncora([], true), true);
});

test("…ma senza un perimetro valido si pianta LO STESSO, o il primo giro si morde la coda", () => {
  // Il caso trovato collaudando: debito vecchio sul ramo → ❌ → non pianto → il giro dopo guarda di
  // nuovo tutto il ramo → lo stesso ❌. Per sempre. Cioè il rosso ripetuto che AR-496 deve spegnere.
  assert.equal(siPiantaAncora(["🛑 …", "❌ un allarme di tre giorni fa"], false), true);
});

test("senza nemmeno una base non invento un perimetro", () => {
  const p = scegliPerimetro({ ancora: null, ancoraUsabile: false, base: null });
  assert.equal(p.da, null);
  assert.equal(p.nota, null, "lo dichiara già il cieco del controllo ④: due volte sarebbe rumore");
});

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

const RIGA_VERA =
  "- 2026-08-01 23:26 · Guardiano degli hook · 13 prove · atteso un refuso di maiuscola → reale il JSON invalido scaricava tutti gli hook · #guardiani";

test("IL CASO AR-154: codice committato e nessuna riga di esito viene fermato", () => {
  const r = consegnaSenzaEsito(["cervello/git-pr.mjs", "pannello/src/lib/nav.ts"], []);
  assert.notEqual(r, null, "consegnare codice senza dire com'e' andata e' il difetto");
  assert.equal(r.quanti, 2);
  assert.equal(r.quadernoToccato, false);
});

test("se una riga di esito VERA c'e', passa: il freno chiede l'esito, non un modulo", () => {
  assert.equal(consegnaSenzaEsito(["cervello/git-pr.mjs", "memoria-squadra/tech.md"], [RIGA_VERA]), null);
});

test("IL LIMITE ①: toccare il quaderno senza scrivere la calibrazione non basta piu'", () => {
  // La prima stesura si accontentava che il file comparisse fra i committati: bastava una virgola.
  // Un freno che si puo' soddisfare senza fare la cosa che difende insegna a soddisfarlo.
  const r = consegnaSenzaEsito(["cervello/x.mjs", "memoria-squadra/tech.md"], ["  ", "## Esiti", "- una nota qualsiasi"]);
  assert.notEqual(r, null, "il file c'e' ma la riga no");
  assert.equal(r.quadernoToccato, true, "chi legge deve sapere che il quaderno l'ho toccato: cambia cosa deve fare");
});

test("IL LIMITE ①b: una riga senza «atteso → reale» e' una ricevuta, non un esito", () => {
  const senzaCalibrazione = "- 2026-08-01 23:26 · Guardiano degli hook · 13 prove · #guardiani";
  assert.notEqual(consegnaSenzaEsito(["cervello/x.mjs"], [senzaCalibrazione]), null);
  assert.equal(esitiScritti([senzaCalibrazione]).length, 0);
  assert.equal(esitiScritti([RIGA_VERA]).length, 1);
});

test("IL LIMITE ②: solo le righe AGGIUNTE contano, quindi un quaderno toccato per altro non vale", () => {
  // Una potatura o un riordino modificano il file senza aggiungere un esito: prima passavano.
  assert.notEqual(consegnaSenzaEsito(["cervello/x.mjs", "memoria-squadra/tech.md"], ["- 2026-07-02 · vecchia nota riformattata"]), null);
});

// ── AR-477: il buco che la rilettura ha trovato ───────────────────────────────
//
// Provato dal vivo il 2/8 su un ramo che aveva GIA' una riga di esito: ho committato un file di
// codice nuovo e il cancello ha risposto «niente da lasciare indietro». La prima riga comprava il
// lasciapassare per tutto il resto del ramo — e piu' il ramo e' lungo, piu' lavoro passa muto.

test("IL CASO AR-477: codice committato DOPO l'ultima riga di esito viene fermato", () => {
  const r = consegnaSenzaEsito(["cervello/x.mjs"], [RIGA_VERA], 1);
  assert.notEqual(r, null, "la riga c'e', ma parla del lavoro di prima");
  assert.equal(r.dopo, 1);
  assert.match(verdetto({ senzaEsito: r }).righe.join("\n"), /DOPO l'ultima riga di esito/);
});

test("se l'esito e' l'ultima cosa che ho scritto, passa: il freno non punisce chi fa bene", () => {
  assert.equal(consegnaSenzaEsito(["cervello/x.mjs"], [RIGA_VERA], 0), null);
});

test("non aver potuto contare NON accusa: cieco non e' colpevole", () => {
  // `null` = non ho potuto misurare. Bloccare li' vorrebbe dire accusare per un dato che non ho.
  assert.equal(consegnaSenzaEsito(["cervello/x.mjs"], [RIGA_VERA], null), null);
});

test("i due casi si distinguono nel messaggio: si rimediano in modi diversi", () => {
  const mai = verdetto({ senzaEsito: consegnaSenzaEsito(["cervello/x.mjs"], [], 0) }).righe.join("\n");
  const dopo = verdetto({ senzaEsito: consegnaSenzaEsito(["cervello/x.mjs"], [RIGA_VERA], 2) }).righe.join("\n");
  assert.match(mai, /AR-154/);
  assert.match(dopo, /AR-477/);
  assert.ok(!/AR-477/.test(mai), "chi non ha scritto niente non va mandato a cercare il difetto sbagliato");
});

test("un lavoro di sola memoria non deve un esito di reparto", () => {
  // Aggiornare STATO o una scheda non e' un lavoro di reparto: chiedere l'esito qui sarebbe rumore.
  assert.equal(consegnaSenzaEsito(["MyCity-Vault/90-Memoria-AI/STATO.md", "consegne/x.md"], []), null);
  assert.equal(consegnaSenzaEsito([], []), null, "niente committato, niente da chiedere");
});

test("il verdetto distingue «non hai scritto niente» da «hai toccato il quaderno senza la calibrazione»", () => {
  const senza = verdetto({ senzaEsito: { quanti: 1, esempio: ["cervello/x.mjs"], quadernoToccato: false } }).righe.join("\n");
  const toccato = verdetto({ senzaEsito: { quanti: 1, esempio: ["cervello/x.mjs"], quadernoToccato: true } }).righe.join("\n");
  assert.ok(!/quaderno l'ho toccato/.test(senza));
  assert.match(toccato, /quaderno l'ho toccato/, "sono due errori diversi e si rimediano in due modi diversi");
});

// ── ⑤ il canale della coda: l'allarme aggiunto a una consegna che esisteva gia' ─

test("IL CANALE ①: un allarme AGGIUNTO a una consegna esistente adesso viene visto", () => {
  // Prima contavano solo i file NUOVI: un 🔴 appeso in fondo a un rapporto gia' consegnato passava.
  // Ed e' il caso piu' probabile dei due — le consegne si aggiornano piu' spesso di quanto nascano.
  const modificate = [{ file: "consegne/devops/stato-sito.md", righe: ["## 2 agosto", "🔴 il sito e' giu' da 36 ore"] }];
  assert.deepEqual(allarmiSenzaCoda([], false, modificate), ["consegne/devops/stato-sito.md"]);
});

test("una consegna aggiornata senza allarmi non dice niente", () => {
  const modificate = [{ file: "consegne/marketing/piano.md", righe: ["aggiunta una riga tranquilla"] }];
  assert.deepEqual(allarmiSenzaCoda([], false, modificate), []);
});

test("se la coda e' stata toccata tace su entrambe le sorgenti", () => {
  const modificate = [{ file: "consegne/x.md", righe: ["🔴 grave"] }];
  assert.deepEqual(allarmiSenzaCoda([{ file: "n.md", contenuto: "🔴" }], true, modificate), []);
});

test("lo stesso file trovato da entrambe le sorgenti si dice una volta sola", () => {
  const r = allarmiSenzaCoda([{ file: "consegne/x.md", contenuto: "🔴 grave" }], false, [{ file: "consegne/x.md", righe: ["🔴 grave"] }]);
  assert.deepEqual(r, ["consegne/x.md"]);
});

// ── ⑤bis: la coda toccata in un commit del perimetro, non solo sul disco di oggi (AR-538) ──────
//
// Il caso vero del 4/8: un allarme (`consegne/tech/pr-ad-mycity-675.md`) e la sua riga in
// AZIONI-IN-ATTESA.md erano stati committati ENTRAMBI dentro lo stesso perimetro — ma
// `codaToccata` guardava solo `git status --porcelain` (il disco di oggi), che non li vedeva più
// perché già committati. Il cancello continuava ad accusare un allarme già in coda.

test("la coda toccata in un commit del perimetro conta come toccata", () => {
  assert.equal(codaToccataNelPerimetro([{ file: "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md", righe: ["### nuova card"] }]), true);
});

test("un file diverso dalla coda, anche nella stessa cartella, non basta", () => {
  assert.equal(codaToccataNelPerimetro([{ file: "MyCity-Vault/90-Memoria-AI/STATO.md", righe: ["riga nuova"] }]), false);
});

test("nessuna modifica nel perimetro (o perimetro cieco) resta falso, non un errore", () => {
  assert.equal(codaToccataNelPerimetro(null), false);
  assert.equal(codaToccataNelPerimetro([]), false);
});

// ── ⑥ cieco non e' verde ──────────────────────────────────────────────────────

test("IL LIMITE ③: quando non ho potuto misurare lo DICO, invece di tacere", () => {
  const v = verdetto({ ciechi: ["non ho trovato un ramo con cui confrontarmi"] });
  assert.equal(v.blocca, false, "non accuso nessuno: non ho misurato");
  assert.equal(v.cieco, true);
  assert.match(v.righe[0], /^⚪/, "un silenzio e' indistinguibile da un «va tutto bene»");
});

// ── ⚪ non è un cestino: «non ho misurato» ≠ «ho misurato diversamente» (AR-506) ──
//
// Il caso vero, trovato dalla CI il 3/8: l'ancora del turno e il registro del sorvegliante vivono
// fuori da git APPOSTA, quindi in CI non possono esistere. Mettendoli fra i ciechi, il cancello
// usciva 2 a ogni giro — CI rossa per costruzione, e un cancello che non può diventare verde viene
// aggirato al secondo giro. È scritto in questa stessa casa, ed è successo davvero al typecheck.

test("una NOTA si legge ma non fa uscire 2: ho misurato, solo in modo più largo", () => {
  const v = verdetto({ note: ["è la prima volta che mi fermo qui: guardo tutto il ramo"] });
  assert.equal(v.cieco, false, "un perimetro più largo è un sovrainsieme, non una misura mancata");
  assert.equal(v.blocca, false);
  assert.equal(v.righe.length, 1, "ma si dice: il silenzio resta indistinguibile da un verde");
  assert.match(v.righe[0], /^ℹ️/);
});

test("un CIECO vero continua a far uscire 2: la distinzione non è una scusa per tacere", () => {
  const v = verdetto({ ciechi: ["non ho trovato un ramo con cui confrontarmi"] });
  assert.equal(v.cieco, true);
  assert.match(v.righe[0], /^⚪/);
});

test("nota e cieco insieme: due canali, due significati, tutti e due stampati", () => {
  const v = verdetto({ ciechi: ["base assente"], note: ["perimetro largo"] });
  assert.equal(v.cieco, true, "basta un cieco vero perché il verde non copra tutto");
  assert.equal(v.righe.length, 2);
});

test("il codice d'uscita: solo note = 0, o la CI resta rossa a vita", () => {
  // Il caso vero: in CI l'ancora del turno NON PUÒ esistere (vive fuori da git), quindi la nota c'è
  // sempre. Finiva nel ramo «1» e teneva la pipeline rossa per costruzione.
  assert.equal(uscitaFuoriDallHook({ cieco: false, righe: ["ℹ️  perimetro largo"] }), 0);
  assert.equal(uscitaFuoriDallHook({ cieco: false, righe: [] }), 0);
});

test("il codice d'uscita: un cieco vero resta 2, un problema vero resta 1", () => {
  assert.equal(uscitaFuoriDallHook({ cieco: true, righe: ["⚪ base assente"] }), 2);
  assert.equal(uscitaFuoriDallHook({ cieco: false, righe: ["❌ un allarme non accodato"] }), 1);
});

test("una nota accanto a un problema non lo declassa: si guarda la sostanza", () => {
  assert.equal(uscitaFuoriDallHook({ cieco: false, righe: ["ℹ️  perimetro largo", "❌ grave"] }), 1);
  assert.equal(uscitaFuoriDallHook({ cieco: true, righe: ["ℹ️  perimetro largo", "⚪ base assente"] }), 2);
});

test("il cieco si dice ANCHE quando c'e' gia' un problema: sono due informazioni diverse", () => {
  const v = verdetto({ chiusi: [{ id: "AR-9", titolo: "x" }], ciechi: ["base assente"] });
  assert.equal(v.blocca, true);
  assert.ok(v.righe.some((r) => r.startsWith("⚪")));
});

// ── ⑤ l'avviso ignorato (AR-497) ──────────────────────────────────────────────

test("una voce che il sorvegliante ha ripetuto tre volte ferma la chiusura", () => {
  const v = verdetto({ insistenti: [{ chiave: "k", n: 3, file: "cervello/x.mjs", cosa: "ho tolto il gate di L-1" }] });
  assert.equal(v.blocca, true, "tre volte non è piu' un avviso: e' una decisione presa senza dirlo");
  const t = v.righe.join("\n");
  assert.match(t, /3 volte/);
  assert.match(t, /esente/, "la seconda strada — dichiararla — deve essere scritta, o resta solo il rimprovero");
});

test("nessuna voce insistente, nessuna riga: il freno parla solo quando serve", () => {
  assert.equal(verdetto({ insistenti: [] }).righe.length, 0);
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

// ── AR-487: le decisioni di Nicola non sono difetti chiusi senza prova ─────────────────────────
//
// Trovato da Nicola usandolo, il 3/8. Il caso vero: AR-479 (le quattro ore di lettura) si e' chiuso
// perche' lui ha deciso «non voglio riscrivere niente». Nessun comando puo' dimostrare quella frase.

test("un difetto chiuso con un comando che puo' fallire passa", () => {
  assert.equal(chiusuraLegittima({ comando: "node cervello/test/x.test.mjs" }), true);
});

test("IL CASO AR-479: una decisione di Nicola messa a verbale passa", () => {
  assert.equal(chiusuraLegittima({ tipo: "umano", esito: "Nicola 3/8: il passato non si riscrive." }), true);
});

test("«umano» senza il verbale NON passa: sarebbe la scappatoia", () => {
  // Senza l'esito scritto, la macchina potrebbe chiudersi i difetti da sola scrivendo «umano».
  assert.equal(chiusuraLegittima({ tipo: "umano" }), false);
  assert.equal(chiusuraLegittima({ tipo: "umano", esito: "   " }), false);
});

test("una prova a pattern resta debole e non basta", () => {
  assert.equal(chiusuraLegittima({ file: "cervello/x.mjs", pattern: "qualcosa" }), false);
});

test("nessuna verifica: non passa", () => {
  assert.equal(chiusuraLegittima(null), false);
  assert.equal(chiusuraLegittima(undefined), false);
});

test("il difetto chiuso con la decisione di Nicola non viene piu' segnalato", () => {
  const prima = [{ id: "AR-479", stato: "aperto" }];
  const dopo = [{ id: "AR-479", stato: "chiuso", titolo: "le 4 ore", verifica: { tipo: "umano", esito: "Nicola 3/8" } }];
  assert.deepEqual(chiusiSenzaProva(prima, dopo), []);
});

// ── AR-507: «non so cosa è tuo» ───────────────────────────────────────────────
//
// Il caso vero, 3/8: prima chiusura di una sessione cloud, nessuna ancora (vive fuori da git, il
// container parte da un clone fresco), perimetro = tutto il ramo. Il cancello ha scritto sette ❌ in
// prima persona su 194 file e 10 commit di sessioni precedenti, mentre in quel turno l'albero di
// lavoro era pulito: zero file scritti. Un cancello che accusa di cose non tue è il rosso che si
// impara ad aggirare.

test("senza ancora l'allarme non accusa: esce ⚪ «non so cosa è tuo» e NON blocca", () => {
  const v = verdetto({ allarmi: ["consegne/devops/2026-07-31-sito-503.md"], attribuzione: { certa: false, nota: "prima volta qui" } });
  assert.equal(v.blocca, false, "il turno non si ferma per lavoro che non è di questo turno");
  const testo = v.righe.join("\n");
  assert.match(testo, /non so cosa è tuo/, "lo dice, non lo tace: il silenzio sarebbe l'altro difetto");
  assert.doesNotMatch(testo, /^❌/m, "e non resta nessuna accusa in prima persona");
  assert.match(testo, /consegne\/devops\/2026-07-31-sito-503\.md/, "il file si nomina lo stesso: declassare non è nascondere");
});

test("senza ancora anche il testo peggiorato si declassa", () => {
  const t = { file: "MyCity-Vault/90-Memoria-AI/BACHECA.md", quanti: 138, prima: 109, nuovi: 29, primi: [] };
  const v = verdetto({ illeggibili: [t], attribuzione: { certa: false, nota: "prima volta qui" } });
  assert.equal(v.blocca, false);
  assert.match(v.righe.join("\n"), /non so cosa è tuo.*BACHECA/s);
});

test("il ⚪ dell'attribuzione NON è un cieco: ho guardato, non so di chi sia", () => {
  const v = verdetto({ allarmi: ["consegne/x.md"], attribuzione: { certa: false, nota: "prima volta qui" } });
  assert.equal(v.cieco, false, "«non ho misurato» e «non so di chi è» sono due cose diverse");
  assert.match(v.righe.join("\n"), /prima volta qui/, "e il ⚪ non resta senza il suo perché");
});

test("la nota non si dice due volte se chi chiama l'ha già messa fra le note", () => {
  const nota = "è la prima volta che mi fermo qui";
  const v = verdetto({ allarmi: ["consegne/x.md"], note: [nota], attribuzione: { certa: false, nota } });
  const quante = v.righe.join("\n").split(nota).length - 1;
  assert.equal(quante, 1, "una riga ripetuta è rumore, e il rumore spegne i freni");
});

test("senza ancora restano ❌ i controlli che dall'ancora non dipendono", () => {
  // ① e ③ confrontano HEAD col disco: sono modifiche non committate, cioè mie per definizione.
  // ⑤ vive nella sessione (il battito del sorvegliante). ④ è per-RAMO per scelta (AR-477).
  const incerta = { certa: false, nota: "prima volta qui" };
  for (const [nome, ingresso] of [
    ["difetto chiuso senza prova", { chiusi: [{ id: "AR-9", titolo: "x" }] }],
    ["lezione senza freno", { lezioni: ["L-3"] }],
    ["avviso ignorato del sorvegliante", { insistenti: [{ n: 3, file: "cervello/x.mjs", cosa: "y" }] }],
    ["lavoro consegnato senza esito", { senzaEsito: { quanti: 1, esempio: ["cervello/x.mjs"], dopo: 0 } }],
  ]) {
    const v = verdetto({ ...ingresso, attribuzione: incerta });
    assert.equal(v.blocca, true, `${nome}: senza ancora deve bloccare lo stesso`);
  }
});

test("con l'ancora l'allarme torna un'accusa: il declassamento non è permanente", () => {
  const v = verdetto({ allarmi: ["consegne/x.md"], attribuzione: { certa: true, nota: null } });
  assert.equal(v.blocca, true, "dal secondo turno in poi il freno è pieno");
  assert.match(v.righe.join("\n"), /^🛑|❌ ho scritto un allarme/m);
});

test("l'ancora del turno viene PRIMA delle basi del ramo", () => {
  // Se scivola dopo, il confronto torna a tutto il ramo e il fix sparisce senza diventare rosso.
  assert.deepEqual(basiPerIlTesto("abc123"), ["abc123", "origin/main", "main"]);
  assert.deepEqual(basiPerIlTesto(null), ["origin/main", "main"], "senza ancora si torna al ramo, non si tace");
});

// ── Dentro una fusione, «prima» ha due genitori (AR-540) ─────────────────────
//
// Il 4/8 il worker ha chiuso AR-361 col suo commit «riconcilia»; la fusione l'ha portato nel mio
// ramo e il cancello me l'ha contestato come una chiusura mia senza prova. Terza comparsa in due
// giorni della stessa forma — accusare in prima persona di lavoro che non è mio.

test("un difetto chiuso dall'ALTRO ramo non è una mia chiusura senza prova", () => {
  const mio = [{ id: "AR-361", stato: "aperto" }];
  const altroRamo = [{ id: "AR-361", stato: "chiuso", verifica: { file: "x.mjs", pattern: "y", presente: true } }];
  const suDisco = [{ id: "AR-361", stato: "chiuso", verifica: { file: "x.mjs", pattern: "y", presente: true } }];
  assert.deepEqual(
    chiusiSenzaProva(statoDiPartenza(mio, altroRamo), suDisco),
    [],
    "il cancello deve dire «non è mio», non accusare",
  );
});

test("…ma se lo chiudo IO un difetto aperto su tutt'e due i lati, il cancello parla ancora", () => {
  const mio = [{ id: "AR-900", stato: "aperto" }];
  const altroRamo = [{ id: "AR-900", stato: "aperto" }];
  const suDisco = [{ id: "AR-900", stato: "chiuso", titolo: "chiuso da me senza prova", verifica: { file: "x", pattern: "y" } }];
  const v = chiusiSenzaProva(statoDiPartenza(mio, altroRamo), suDisco);
  assert.equal(v.length, 1, "l'unione non deve assolvere il mio lavoro, solo distinguerlo");
  assert.equal(v[0].id, "AR-900");
});

test("fuori da una fusione non cambia niente: il secondo genitore non c'è", () => {
  const mio = [{ id: "AR-1", stato: "aperto" }];
  const suDisco = [{ id: "AR-1", stato: "chiuso", titolo: "t", verifica: null }];
  assert.equal(chiusiSenzaProva(statoDiPartenza(mio, null), suDisco).length, 1);
  assert.deepEqual(statoDiPartenza(mio, null), mio, "senza merge, «prima» resta esattamente HEAD");
  assert.deepEqual(statoDiPartenza(null, null), [], "e senza niente da leggere resta vuoto, non esplode");
});

// ── ⑥ il merge non mi fa il conto di ciò che ha scritto il worker (13/8) ──────
//
// Il caso vero: fusa `main` nel ramo per risolvere un conflitto sulla coda, il cancello ha
// contestato STATO.md e RITMO.md — 13 e 5 punti «aggiunti da questo lavoro» — su due file che il
// merge aveva portato dentro identici alla copia pubblicata. Il perimetro `ancora...HEAD` non
// distingue «l'ho scritto io» da «l'ho fuso»; la copia su `origin/main` sì.

test("un file identico alla copia pubblicata non è lavoro di questo lotto", () => {
  const t = testoDaMisurare("MyCity-Vault/90-Memoria-AI/STATO.md", {
    ora: () => "testo del worker",
    pubblicato: () => "testo del worker",
    prima: () => "versione vecchia, molto diversa",
  });
  assert.equal(t, null, "il merge non deve farmi il conto di un testo già pubblicato da altri");
});

test("un file che questo lotto ha davvero cambiato resta misurato", () => {
  const t = testoDaMisurare("consegne/mia.md", {
    ora: () => "testo mio, nuovo",
    pubblicato: () => "testo del worker",
    prima: () => "com'era prima",
  });
  assert.ok(t, "se il mio testo diverge dalla copia pubblicata, è mio e va misurato");
  assert.equal(t.contenuto, "testo mio, nuovo");
  assert.equal(t.contenutoPrima, "com'era prima");
});

test("un file che su main non esiste è tutto mio", () => {
  const t = testoDaMisurare("consegne/nato-adesso.md", {
    ora: () => "tutto nuovo",
    pubblicato: () => null, // testoDiBase torna null quando il file non c'è nella base
    prima: () => null,
  });
  assert.ok(t, "un file che la copia pubblicata non ha è nato in questo lotto");
  assert.equal(t.contenutoPrima, null, "e parte da zero: ogni suo problema è nuovo");
});

// Le due difese qui sotto (AR-657, per FILE) e qui sopra (per CONTENUTO) sono complementari e
// stanno insieme apposta: una toglie dal perimetro i file che la fusione ha portato sul ramo,
// l'altra i file che nel mio albero sono identici alla copia pubblicata. Un file può sfuggire
// alla prima (l'ho toccato e poi riportato uguale) e non alla seconda.

// ── AR-657: la fusione del ramo di base non è lavoro mio ───────────────────────────────────────
//
// Il 13/8, PR #713: `main` si era mosso, ho fuso il ramo di base nel mio e da quel momento il
// perimetro del turno (`ancora...HEAD`) conteneva anche i suoi file — i piani, la bacheca, lo STATO
// riscritto dal giro delle 19:20. Il cancello mi ha accusato di aver «aggiunto 10 punti difficili»
// a un file che non avevo toccato, e ha fermato la consegna. È AR-507 (accusare di cose non tue)
// per la strada che quel fix non guardava: non l'ancora mancante, ma l'ancora che c'è e il ramo di
// base che le è entrato dentro.

import { testiMiei } from "../cancello-stop.mjs";

test("un testo che arriva dalla fusione del ramo di base non è mio", () => {
  const miei = testiMiei({
    disco: [],
    nelTurno: ["MyCity-Vault/90-Memoria-AI/STATO.md", "memoria-squadra/tech.md"],
    sulRamo: ["memoria-squadra/tech.md"],
  });
  assert.deepEqual(miei, ["memoria-squadra/tech.md"], "STATO.md è entrato con la fusione: accusarmene ferma la consegna per il lavoro di un altro");
});

test("ciò che sto scrivendo adesso resta mio anche se non è ancora sul ramo", () => {
  const miei = testiMiei({ disco: ["consegne/bozza.md"], nelTurno: [], sulRamo: [] });
  assert.deepEqual(miei, ["consegne/bozza.md"], "l'albero di lavoro è mio per definizione: lì non c'è nessun altro");
});

test("se non so cosa c'è sul ramo non assolvo in silenzio", () => {
  const miei = testiMiei({ disco: [], nelTurno: ["a.md", "b.md"], sulRamo: null });
  assert.deepEqual(miei, ["a.md", "b.md"], "senza la misura del ramo si accusa troppo, non si tace: il cieco lo dichiara chi chiama");
});
