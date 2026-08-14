#!/usr/bin/env node
// AR-232 — chi decide il rischio e chi lo esegue sono lo stesso soggetto.
//
// Il colore lo scrive il senior che accoda la card; l'autopilota lo legge e agisce. Il fix chiedeva
// quattro condizioni per eseguire da soli, e alla vigilia di questo lotto ne erano soddisfatte tre:
//
//   (a) è 🟢                                   ← lotto 25
//   (b) il canale è auto-eseguibile            ← lotto 25
//   (c) il destinatario è in allowlist         ← già da AR-139 (mani.ts)
//   (d) **il TESTO non contiene indicatori di rischio**   ← mancava, ed è questa
//
// La (d) è l'unica delle quattro che guarda il CONTENUTO: l'unica indipendente da chi ha scritto la
// card. Le altre tre giudicano l'etichetta; questa legge la cosa.
//
// Nota su come ci sono arrivato: AR-232 stava per chiudersi **da solo** un'ora fa. La sua prova
// chiedeva l'ASSENZA della stringa `b.livello === "verde"` in autopilota.ts, e il lotto 25 quella
// riga l'aveva tolta per un altro motivo. Una prova che chiede l'assenza di una stringa si soddisfa
// cambiando la stringa. L'ho ri-puntata sul pezzo mancante, ed è questo.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { indicatoriDiRischio, rischioDalContenuto } = await import(join(REPO, "pannello/src/lib/rischio-contenuto.ts"));
const { selezionaAzioni } = await import(join(REPO, "pannello/src/lib/selezione-autopilota.ts"));

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

prova("il caso che ha rotto: un'azione 🟢 che nomina una cifra non parte da sola", () => {
  const r = rischioDalContenuto("Rimborsa al cliente i 19,05€ dell'ordine annullato");
  assert.equal(r.rischiosa, true);
  assert.ok(r.indicatori.includes("importo"));
  assert.match(r.motivo, /serve la firma/);
});

prova("i sei indicatori che il fix nominava, uno per uno", () => {
  const attesi = {
    importo: "Manda 12€ al fornaio",
    iban: "Bonifico su IT60X0542811101000000123456",
    telefono: "Chiama il negozio allo 0523 388601",
    pubblicazione: "Pubblica il post del sabato",
    pagamento: "Paga la fattura del corriere",
    annullamento: "Annulla l'ordine numero 16",
  };
  for (const [nome, testo] of Object.entries(attesi)) {
    const r = rischioDalContenuto(testo);
    assert.ok(r.indicatori.includes(nome), `«${testo}» doveva far scattare ${nome}, ha dato: ${r.indicatori.join(",") || "niente"}`);
  }
});

prova("un'email dentro il testo è un dato di una persona vera", () => {
  assert.ok(rischioDalContenuto("Scrivi a mario.rossi@example.com").indicatori.includes("dato_personale"));
});

prova("un'azione davvero innocua passa: il cancello non spegne l'autopilota", () => {
  // Se bocciasse tutto, l'autopilota diventerebbe inutile e verrebbe spento — e allora non protegge
  // più niente. Deve lasciar passare il lavoro di casa.
  for (const t of [
    "Aggiorna la nota di analisi del reparto marketing",
    "Rigenera la checklist dal file della coda",
    "Scrivi il briefing di oggi in memoria",
  ]) {
    const r = rischioDalContenuto(t);
    assert.equal(r.rischiosa, false, `«${t}» non doveva essere bloccata: ${r.motivo}`);
  }
});

prova("il simbolo € da solo non basta: si boccia una CIFRA, non un titolo", () => {
  // «Costi in €» è un'intestazione, non un pagamento. Un metro che boccia le intestazioni finisce
  // per bocciare tutto, e un cancello che boccia tutto viene spento.
  assert.equal(rischioDalContenuto("Tabella dei costi in € per reparto").rischiosa, false);
  assert.equal(rischioDalContenuto("Costo: 302 € al mese").rischiosa, true);
});

prova("fail-closed: un testo che non si riesce a leggere è rischioso", () => {
  for (const cattivo of [null, undefined, 42, {}, []]) {
    const r = rischioDalContenuto(cattivo);
    assert.equal(r.rischiosa, true, `${JSON.stringify(cattivo)} doveva essere trattato come rischioso`);
    assert.match(r.motivo, /fail-closed/);
  }
});

prova("il motivo è scritto in parole, non in codici", () => {
  // Finisce in una nota che Nicola legge nella card: «serve la firma: il testo nomina una cifra di
  // denaro» dice qualcosa; «RISK_INDICATOR_3» no.
  const r = rischioDalContenuto("Paga 50€ a mario@example.com");
  assert.match(r.motivo, /nomina una cifra di denaro/);
  assert.doesNotMatch(r.motivo, /[A-Z_]{6,}/, "niente sigle nel testo che legge Nicola");
});

prova("indicatoriDiRischio dice anche il PERCHÉ, non solo il nome", () => {
  const ind = indicatoriDiRischio("Annulla l'ordine e rimborsa 19,05€");
  assert.ok(ind.length >= 2);
  assert.ok(ind.every((i) => typeof i.perche === "string" && i.perche.length > 8));
});

// ── L'innesto VERO ──────────────────────────────────────────────────────────

prova("la DECISIONE si esegue, non si guarda: la selezione scarta la rischiosa e tiene l'innocua", () => {
  // La prima stesura di questa prova era VACUA proprio sulla rottura più importante: spegnendo il
  // cancello nell'esecutore (`if (r.rischiosa)` → `if (false)`) restava verde, perché guardava la
  // posizione delle chiamate e la presenza delle stringhe. Adesso la decisione è una funzione pura e
  // qui la si ESEGUE.
  const az = [
    { id: "ok", titolo: "Aggiorna la nota di analisi", testo: "riscrivi il paragrafo", canale: "memoria", livello: "verde" },
    { id: "soldi", titolo: "Rimborsa 19,05€ al cliente", testo: "ordine annullato", canale: "memoria", livello: "verde" },
    { id: "fuori", titolo: "Aggiorna la nota", testo: "niente di che", canale: "email", livello: "verde" },
    { id: "rosso", titolo: "Aggiorna la nota", testo: "niente di che", canale: "memoria", livello: "rosso" },
  ];
  const s = selezionaAzioni(az);
  assert.deepEqual(s.esegui.map((a) => a.id), ["ok"], "solo il lavoro di casa, innocuo e verde");
  assert.deepEqual(s.degradate.map((d) => d.azione.id).sort(), ["fuori", "rosso", "soldi"]);
  const perSoldi = s.degradate.find((d) => d.azione.id === "soldi");
  assert.ok(perSoldi.indicatori.includes("importo"));
  assert.match(perSoldi.motivo, /cifra di denaro/);
});

prova("ogni degradata porta un motivo leggibile: nessuna sparisce in silenzio", () => {
  const s = selezionaAzioni([
    { id: "a", titolo: "Paga il corriere", testo: "", canale: "memoria", livello: "verde" },
    { id: "b", titolo: "x", testo: null, canale: "whatsapp", livello: "verde" },
  ]);
  assert.equal(s.esegui.length, 0);
  for (const d of s.degradate) {
    assert.ok(d.motivo && d.motivo.length > 10, `${d.azione.id}: motivo vuoto`);
    assert.ok(d.indicatori.length > 0, `${d.azione.id}: nessun indicatore`);
  }
});

prova("una lista vuota non esplode, e non inventa esecuzioni", () => {
  assert.deepEqual(selezionaAzioni([]), { esegui: [], degradate: [] });
  assert.deepEqual(selezionaAzioni(undefined), { esegui: [], degradate: [] });
});

prova("l'esecutore esegue SOLO quello che la selezione gli passa", () => {
  // L'unica assertion strutturale che resta, e serve: la funzione pura può essere giustissima e
  // l'esecutore ignorarla. `eseguiAzione` dev'essere chiamata una volta sola, dentro il ciclo sulla
  // lista selezionata.
  //
  // ⚠️ IL METRO ERA TARATO SU UNA FORMA VECCHIA (lotto 41). Cercava alla lettera
  // `await eseguiAzione(`, e col fix di AR-385 quella forma non esiste più: la chiamata è diventata
  // il campo `atto:` di `attoUnaVoltaSola`, che prenota il posto PRIMA di toccare il mondo. Il
  // codice era migliorato e la prova diventata rossa — cioè il metro misurava la forma della riga,
  // non la cosa che doveva restare vera. Qui la cosa vera è «una sola strada verso l'invio», e si
  // misura sulla chiamata, non sulla parola `await` che le sta davanti.
  //
  // La copertura non cala, sale: si continua a pretendere una sola chiamata dentro il ciclo, e in
  // più che passi dal cancello dell'atto unico. Se qualcuno rimettesse un invio diretto fuori dal
  // cancello, il conteggio andrebbe a due e questo caso tornerebbe rosso.
  const a = readFileSync(join(REPO, "pannello/src/lib/autopilota.ts"), "utf8");
  assert.equal((a.match(/eseguiAzione\(/g) || []).length, 1, "una sola strada verso l'invio");
  const iCiclo = a.indexOf("for (const a of selezione.esegui)");
  const iCancello = a.indexOf("await attoUnaVoltaSola(");
  const iEsegui = a.indexOf("eseguiAzione(");
  assert.ok(iCiclo > 0 && iCiclo < iEsegui, "e passa dal ciclo sulla lista selezionata");
  assert.ok(iCancello > iCiclo && iCancello < iEsegui, "e l'invio sta dentro il cancello dell'atto unico, non prima");
  assert.match(a, /atto: \(\) => eseguiAzione\(/, "la mano è l'atto del cancello: la prenotazione viene prima");
  assert.doesNotMatch(a, /blocchi\.filter\(\(b\) => b\.livello/, "nessun filtro sul colore rimasto qui dentro");
});

prova("la degradazione si vede: nota in coda + riga di log + conteggio", () => {
  // «Registrare a log ogni degradazione, così si misura quanto spesso il colore auto-dichiarato
  // sbaglia» — degradare in silenzio sarebbe un altro modo di non farsi vedere.
  const a = readFileSync(join(REPO, "pannello/src/lib/autopilota.ts"), "utf8");
  assert.match(a, /non eseguita da sola/, "la nota che Nicola legge nella card");
  assert.match(a, /degradata \(AR-232\)/, "la riga di log con gli indicatori");
  assert.match(a, /const degradate = selezione\.degradate\.length/, "e il conteggio, altrimenti non si misura niente");
  assert.match(a, /return \{ attivo: true, eseguite, degradate \}/, "il numero deve uscire dalla funzione");
});

prova("le due metà usano lo STESSO metro, non due copie", () => {
  // Il fix lo chiede per nome: «il posto giusto per la funzione di rischio è un modulo condiviso col
  // cervello, così le due metà usano lo stesso metro». Qui il cervello lo esegue davvero — questa
  // prova gira nel cervello e importa il file del Pannello. Se qualcuno ne facesse una copia, le due
  // diverrebbero diverse senza che nessuno se ne accorga: non deve esistere un secondo file.
  const copie = readFileSync(join(REPO, "pannello/src/lib/rischio-contenuto.ts"), "utf8");
  assert.ok(copie.includes("export function rischioDalContenuto"));
  assert.equal(rischioDalContenuto("Paga 10€").rischiosa, true, "e il cervello lo esegue, non lo rilegge");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
