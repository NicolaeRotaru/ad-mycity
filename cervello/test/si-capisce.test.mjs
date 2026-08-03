#!/usr/bin/env node
// AR-478 — le prove del misuratore di spiegazioni.
//
// Il testo di prova non è inventato: è preso dalle PR che Nicola non è riuscito a leggere. Se lo
// strumento non boccia quelle, non misura niente.
//
// La prova più importante di tutte è l'ultima: una parola tecnica che sta nel glossario NON deve
// essere bocciata. È la correzione di Nicola («le voglio imparare, mi va bene che le usi») fatta
// diventare un test che può fallire — se qualcuno rimette il divieto sul vocabolario, qui si spacca.

import assert from "node:assert/strict";
import {
  misura,
  frasi,
  parteDiNicola,
  difficolta,
  quanteVolteHaChiesto,
  messaggiDiNicola,
  PAROLE_MACCHINA,
} from "../si-capisce.mjs";

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

const tipi = (t, o) => misura(t, o).problemi.map((p) => p.tipo);
const glossario = new Set(["cancello", "guardiano", "sensore", "freno", "tetto", "mutazione"]);

// ── La correzione di Nicola: il vocabolario NON è il difetto ──────────────────────────────────

prova("una parola della macchina che sta nel glossario passa: Nicola la sta studiando", () => {
  const t = "Il cancello ha bloccato il lavoro e il guardiano ha segnalato il sensore spento.";
  assert.deepEqual(tipi(t, { noteAGlossario: glossario }), [], "parole studiabili: non si toccano");
});

prova("una parola inventata da me, fuori dal glossario, viene bocciata", () => {
  const t = "Il potatore ha ridotto l archivio e la spazzata non ha trovato fratelli.";
  const p = misura(t, { noteAGlossario: glossario }).problemi.filter((x) => x.tipo === "parola-mia");
  assert.equal(p.length, 2, `attese potatore+spazzata, trovate ${p.map((x) => x.trovato)}`);
});

prova("la stessa parola inventata passa se la spiego dove la uso", () => {
  const t = "Il potatore, cioè la pulizia automatica dei file vecchi, ha liberato spazio.";
  const p = misura(t, { noteAGlossario: glossario }).problemi.filter((x) => x.tipo === "parola-mia");
  assert.equal(p.length, 0, "spiegata sul momento: va bene");
});

// ── Il difetto vero: la forma della spiegazione ───────────────────────────────────────────────

prova("la frase vera della PR 654 viene bocciata per gli incisi", () => {
  const t =
    "Alla prima rilettura comportamentale — provando il cancello dal vivo invece di rileggerne il codice — è saltato fuori questo.";
  assert.ok(tipi(t, { noteAGlossario: glossario }).includes("incisi"), "due incisi in una frase sola");
});

prova("una frase da oltre 30 parole viene bocciata", () => {
  const t = Array.from({ length: 34 }, (_, i) => `parola${i}`).join(" ") + ".";
  assert.ok(tipi(t).includes("frase-lunga"));
});

prova("una frase corta non viene toccata", () => {
  assert.deepEqual(tipi("Ho messo online la nuova versione del sito."), []);
});

prova("un testo lungo senza esempio concreto viene bocciato", () => {
  const t = Array.from({ length: 20 }, (_, i) => `La regola numero ${i} vale sempre e ovunque.`).join("\n");
  assert.ok(tipi(t).includes("manca-esempio"));
});

prova("lo stesso testo con un esempio concreto non viene più bocciato su quello", () => {
  const t = [
    ...Array.from({ length: 18 }, (_, i) => `La regola numero ${i} vale sempre.`),
    "Esempio concreto. Lunedì scrivo la riga, martedì lavoro ancora e non la aggiorno.",
  ].join("\n");
  assert.ok(!tipi(t).includes("manca-esempio"));
});

prova("un testo lungo senza le tre risposte viene bocciato tre volte", () => {
  const t = Array.from({ length: 20 }, (_, i) => `Riga ${i} di spiegazione normale e corta.`).join("\n");
  assert.equal(tipi(t).filter((x) => x === "manca-una-risposta").length, 3);
});

prova("un messaggio breve non deve avere né struttura né esempio", () => {
  const m = misura("Fatto, il sito è di nuovo online.");
  assert.equal(m.problemi.length, 0);
  assert.equal(m.testoLungo, false);
});

prova("un sottinteso viene bocciato: Nicola non era presente", () => {
  assert.ok(tipi("Come dicevo, il controllo era già rosso.").includes("sottinteso"));
});

// ── Le trappole: un misuratore che accusa a torto viene spento entro il giorno ─────────────────

prova("sotto la riga dei dettagli tecnici non si misura niente", () => {
  const t = [
    "Ho aggiunto un controllo che ti avvisa quando ti consegno lavoro senza dirti com'è andato.",
    "",
    "## Dettagli tecnici",
    "Il potatore gira sul cricchetto, exit 2 dentro l'hook, con 13 mutazioni.",
  ].join("\n");
  assert.deepEqual(misura(t, { noteAGlossario: glossario }).problemi, []);
  assert.equal(parteDiNicola(t).length, 2);
});

prova("dentro un blocco di codice il gergo resta al suo posto", () => {
  const t = ["Ecco cosa stampa:", "```", "potatore: spazzata su 12 fratelli, exit 1", "```"].join("\n");
  assert.deepEqual(misura(t, { noteAGlossario: glossario }).problemi, []);
});

prova("un numero con la sua unità non viene segnalato", () => {
  const m = misura("Abbiamo incassato 19 euro e consegnato 12 ordini in 3 giorni.");
  assert.deepEqual(m.avvisi, [], JSON.stringify(m.avvisi));
});

prova("un anno non è un numero senza metro", () => {
  assert.deepEqual(misura("È successo nel 2026, a Piacenza.").avvisi, []);
});

prova("senza glossario lo strumento non inventa né un verde né un rosso", () => {
  // noteAGlossario null = cieco: nessuna parola viene accusata di essere fuori dal glossario.
  const p = misura("Il potatore ha fatto la spazzata.", { noteAGlossario: null }).problemi;
  assert.equal(p.filter((x) => x.tipo === "parola-mia").length, 2, "senza glossario tutto è da spiegare");
});

prova("il voto di difficoltà confronta testi di lunghezza diversa", () => {
  const corto = misura("Come dicevo, va tutto bene.");
  const lungo = misura(["Come dicevo, va tutto bene.", ...Array(40).fill("Frase normale e corta.")].join(" "));
  assert.ok(difficolta(corto) > difficolta(lungo), "lo stesso errore pesa di più in un testo corto");
});

prova("le parole che spezzano le frasi non spezzano le sigle", () => {
  assert.equal(frasi("Il sig. Rossi ha ordinato il pane. Poi è uscito subito dal negozio.").length, 2);
});

prova("una riga di tabella non e' una frase da 34 parole", () => {
  // Il primo giro dal vivo sul GLOSSARIO: 7 accuse su 9 erano righe di tabella lette come una frase
  // sola. Chi legge una tabella non legge le celle di fila.
  const t = "| **commit** | Un salvataggio del lavoro, con scritto cosa hai cambiato e perche | Ogni volta che finisco un pezzo faccio un commit e resta la traccia di chi ha cambiato cosa |";
  assert.ok(!tipi(t, { noteAGlossario: glossario }).includes("frase-lunga"), "tre celle corte, non una frase lunga");
});

prova("dentro una cella lunga davvero, la frase lunga si vede ancora", () => {
  const cella = Array.from({ length: 34 }, (_, i) => `parola${i}`).join(" ");
  assert.ok(tipi(`| titolo | ${cella} |`).includes("frase-lunga"), "la correzione non deve accecare la misura");
});

prova("un testo che nasconde tutta la sostanza sotto la riga viene avvisato", () => {
  // La settima regola (Nicola, 2/8): «non tralasciare mai i termini tecnici, mi aiutano a capire
  // come ragiona e agisce la macchina». La riga dei dettagli non deve diventare la discarica.
  const t = [
    "Ho sistemato una cosa che non andava.",
    "Adesso funziona meglio di prima.",
    "## Dettagli tecnici",
    "Il cancello legge il commit, il guardiano misura il branch,",
    "il freno blocca il deploy e la sentinella avvisa.",
    "Tutto provato con 12 prove nuove.",
  ].join("\n");
  const a = misura(t, { noteAGlossario: glossario }).avvisi.map((x) => x.dico).join(" ");
  assert.match(a, /sostanza tecnica/, "deve dire che ho nascosto tutto in fondo");
});

prova("il verdetto dice QUALE frase, non solo che c'e' una frase lunga", () => {
  // Scoperto usandolo: il cancello mi ha detto «spezzala» quattro volte senza dire quale frase, e il
  // numero di riga era sbagliato perche' una frase che va a capo non sta in nessuna riga singola.
  // Un verdetto che non si puo' eseguire e' un verdetto che si impara a ignorare.
  const t = "Questa " + Array.from({ length: 33 }, (_, i) => `parola${i}`).join(" ") + ".";
  const p = misura(t).problemi.find((x) => x.tipo === "frase-lunga");
  assert.ok(p, "la frase lunga deve essere trovata");
  assert.ok(p.frase && p.frase.startsWith("Questa"), `deve citare la frase, trovato: ${p.frase}`);
});

prova("anche gli incisi citano la frase colpevole", () => {
  const t = "Il controllo (che gira da solo) ha bloccato il turno — e aveva ragione a farlo.";
  const p = misura(t).problemi.find((x) => x.tipo === "incisi");
  assert.ok(p?.frase?.startsWith("Il controllo"), `deve citare la frase, trovato: ${p?.frase}`);
});

prova("l'elenco delle parole della macchina contiene sia le mie sia quelle vere del mestiere", () => {
  for (const p of ["potatore", "spazzata", "cricchetto"]) assert.ok(PAROLE_MACCHINA.includes(p), p);
  for (const p of ["commit", "branch", "deploy", "webhook"]) assert.ok(PAROLE_MACCHINA.includes(p), p);
});

prova("citare un sottinteso per spiegarlo non e' usarlo", () => {
  // Il secondo blocco dal vivo: la riga di tabella che SPIEGA la regola veniva accusata di violarla.
  const t = 'La regola dice: niente «come dicevo», niente «la terza volta oggi».';
  assert.ok(!tipi(t).includes("sottinteso"), "dentro le virgolette e' una citazione");
});

prova("…ma usarlo davvero viene ancora preso", () => {
  assert.ok(tipi("Come dicevo, il controllo era gia rosso.").includes("sottinteso"));
});

// ── AR-482: la misura che guarda LUI, non me ──────────────────────────────────────────────────

const rigaNicola = (t) => JSON.stringify({ type: "user", message: { content: t } });
const rigaMia = JSON.stringify({ type: "assistant", message: { content: [{ type: "text", text: "ok" }] } });

prova("conta quante volte Nicola ha dovuto chiedere spiegazioni", () => {
  const righe = [
    rigaNicola("fai un giro"),
    rigaMia,
    rigaNicola("non ho capito cosa vuol dire"),
    rigaNicola("spiegami meglio questa cosa"),
  ];
  const r = quanteVolteHaChiesto(righe);
  assert.equal(r.messaggi, 3, "tre messaggi suoi, il mio non conta");
  assert.equal(r.chieste, 2);
  assert.equal(r.quota, 67);
});

prova("i risultati degli strumenti non sono messaggi di Nicola", () => {
  // Arrivano marcati come "user" ma non li scrive lui: contarli falserebbe la quota verso il basso.
  const righe = [rigaNicola("<tool_result>output del comando</tool_result>"), rigaNicola("va bene cosi")];
  assert.equal(messaggiDiNicola(righe).length, 1);
});

prova("una conversazione senza domande di chiarimento da zero", () => {
  const r = quanteVolteHaChiesto([rigaNicola("porta Pane Quotidiano live"), rigaMia]);
  assert.equal(r.chieste, 0);
  assert.equal(r.quota, 0);
});

prova("nessun messaggio: quota nulla, non zero (cieco non e' un verde)", () => {
  assert.equal(quanteVolteHaChiesto([]).quota, null);
});

// ── Referto ───────────────────────────────────────────────────────────────────────────────────

const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n     ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} prove passate`);
process.exit(rotte.length ? 1 : 0);
