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
  BLOCCHI,
  COPERTURA,
  ideeRipetute,
  ripetizioniInterne,
  livelloDiStruttura,
  quantoSiSomigliano,
  ariaFritta,
  paroleNuove,
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

prova("un testo lungo senza le quattro risposte viene bocciato quattro volte", () => {
  // Dal 3/8 i blocchi sono QUATTRO: il quarto e' «Cosa non ho verificato», cioe' di quanto fidarsi.
  const t = Array.from({ length: 20 }, (_, i) => `Riga ${i} di spiegazione normale e corta.`).join("\n");
  assert.equal(tipi(t).filter((x) => x === "manca-una-risposta").length, 4);
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
  const p = misura(t, { noteAGlossario: glossario }).problemi.filter((x) => x.tipo === "sostanza-nascosta");
  assert.equal(p.length, 1, "dal 3/8 BLOCCA: misurato che oggi costa 0 testi in piu'");
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

// ── AR-483: l'aria fritta, cioe' le parole che sembrano spiegare e non dicono niente ───────────

prova("«piu' robusto» viene preso: non dice cosa non si rompe piu'", () => {
  assert.ok(tipi("Adesso il sistema e' piu' robusto.").includes("aria-fritta"));
});

prova("«dovrebbe funzionare» viene preso: o l'ho provato o non l'ho provato", () => {
  const a = ariaFritta("Dovrebbe funzionare anche sul server.");
  assert.equal(a.length, 1);
  assert.match(a[0].dico, /provato/);
});

prova("«varie cose» e «tutto a posto» vengono presi", () => {
  assert.equal(ariaFritta("Ho sistemato varie cose ed e' tutto a posto.").length, 2);
});

prova("citare una frase vuota per spiegarla non e' usarla", () => {
  // Stesso difetto dei sottintesi, trovato sulla mia risposta a Nicola mentre gliele elencavo.
  const t = 'Le frasi vuote sono queste: «piu robusto», «dovrebbe funzionare», «varie cose».';
  assert.deepEqual(ariaFritta(t), []);
});

prova("un elenco separato da punti non e' una frase lunga", () => {
  // Trovato sul mio messaggio a Nicola: cinque voci lette come un periodo da 30 parole.
  const t = "i numeri con la fonte · il ragionamento · le alternative scartate · i miei errori · i limiti · nomi e date";
  assert.ok(!tipi(t).includes("frase-lunga"), "chi legge un elenco prende una voce per volta");
});

prova("…ma una frase vera con molte virgole resta misurata", () => {
  const t = "Il controllo, che gira da solo, ha bloccato il turno di lavoro, e aveva ragione, perche " +
    "la frase era troppo lunga, come succede sempre, quando scrivo di getto, senza rileggere niente, " +
    "proprio mai, nemmeno una volta.";
  assert.ok(tipi(t).includes("frase-lunga"), "c'e' un verbo: e' un periodo, non un elenco");
});

prova("la colonna di una tabella che ELENCA le frasi vuote non viene accusata", () => {
  const t = "| piu robusto | di' cosa non si rompe piu, e in quale caso |";
  assert.deepEqual(ariaFritta(t), [], "la cella e' l'etichetta del termine, non una frase che lo usa");
});

prova("una frase piena di fatti non viene toccata", () => {
  // Il contrario esatto: nomi, numeri, date. Se questa venisse presa, il controllo sarebbe rumore.
  const t = "Ho spezzato 3 frasi sopra le 30 parole nel file del glossario, il 2 agosto.";
  assert.deepEqual(ariaFritta(t), []);
});

prova("dentro un blocco di codice l'aria fritta non si misura", () => {
  const t = ["Ecco l uscita:", "```", "tutto ok: 12 test passati", "```"].join("\n");
  assert.deepEqual(ariaFritta(t), []);
});

prova("sotto la riga dei dettagli tecnici l'aria fritta non si misura", () => {
  const t = ["Ho spezzato 3 frasi lunghe.", "## Dettagli tecnici", "dovrebbe funzionare anche sul server"].join("\n");
  assert.deepEqual(ariaFritta(t), []);
});

prova("un testo lungo piu' di 4 minuti vuole due righe di riassunto in cima", () => {
  const t = Array.from({ length: 90 }, (_, i) => `Riga ${i} con dieci parole dentro per fare volume, ecco fatto adesso.`).join("\n");
  assert.ok(tipi(t).includes("manca-riassunto"), "oltre i 4 minuti il riassunto serve");
});

prova("lo stesso testo col riassunto non viene piu' bocciato su quello", () => {
  const t = ["In due righe: ho fatto una cosa e funziona."].concat(
    Array.from({ length: 90 }, (_, i) => `Riga ${i} con dieci parole dentro per fare volume, ecco fatto adesso.`),
  ).join("\n");
  assert.ok(!tipi(t).includes("manca-riassunto"));
});

prova("un testo da due minuti NON deve avere il riassunto", () => {
  const t = Array.from({ length: 20 }, (_, i) => `Riga ${i} corta.`).join("\n");
  assert.ok(!tipi(t).includes("manca-riassunto"), "sotto la soglia sarebbe una casella in piu'");
});

// ── AR-486: le parole nuove, trovate senza elenchi scritti a mano ─────────────────────────────

prova("una parola tecnica nuova viene trovata anche se non e' in nessun elenco", () => {
  // Il punto: non serve che io l'abbia prevista. In italiano quasi ogni parola finisce per vocale,
  // quindi una parola di prosa che finisce per consonante e' quasi sempre straniera o tecnica.
  const t = "Ho fatto il rollback e poi ho guardato il monitoring del server.";
  const p = paroleNuove(t, "").map((x) => x.parola);
  assert.ok(p.includes("rollback"), `attesa rollback, trovate: ${p}`);
  assert.ok(p.includes("monitoring"), `atteso monitoring, trovate: ${p}`);
});

prova("una parola che sta nel glossario non viene segnalata", () => {
  const p = paroleNuove("Ho fatto il rollback.", "rollback: tornare alla versione di prima");
  assert.deepEqual(p, []);
});

prova("una parola spiegata sul momento non viene segnalata", () => {
  const p = paroleNuove("Il rollback, cioe' tornare alla versione di prima, e' andato bene.", "");
  assert.deepEqual(p, []);
});

prova("le parole italiane non vengono scambiate per gergo", () => {
  // «citta» finisce per vocale accentata: se l'accento non facesse parte della parola verrebbe
  // troncato in «citt» e sembrerebbe straniero. Trovato sul corpus vero: 81 falsi positivi.
  assert.deepEqual(paroleNuove("La città di Piacenza ha una qualità sua.", ""), []);
});

prova("i nomi propri e le parole ormai italiane sono esenti", () => {
  assert.deepEqual(paroleNuove("Stripe e Vercel per il marketing online.", ""), []);
});

prova("dentro un blocco di codice non si cercano parole nuove", () => {
  const t = ["Ecco:", "```", "const rollback = true; fetch(url);", "```"].join("\n");
  assert.deepEqual(paroleNuove(t, ""), []);
});

// ── AR-489: le idee gia' dette, cioe' la misura che guarda la conversazione ────────────────────

prova("una frase riformulata ma uguale nel senso viene presa", () => {
  // Il confronto parola per parola trovava 1 ripetizione su 6: io riformulo, non ricopio.
  const prima = ["Tutti e tre i controlli sono verdi e il referto dice che si puo consegnare."];
  const r = ideeRipetute("I controlli sono tutti verdi e il referto dice che si puo consegnare adesso.", prima);
  assert.equal(r.length, 1, "stessa idea, parole diverse");
  assert.ok(r[0].quanto >= 60);
});

prova("una frase nuova sullo stesso argomento NON viene presa", () => {
  const prima = ["Tutti e tre i controlli sono verdi e il referto dice che si puo consegnare."];
  const r = ideeRipetute("Ho corretto il rientro del file delle mutazioni con uno spazio solo.", prima);
  assert.deepEqual(r, [], "argomento vicino, contenuto diverso: non e' una ripetizione");
});

prova("la misura EMETTE il problema, non basta che la funzione lo sappia trovare", () => {
  // Senza questa prova, staccare ideeRipetute da misura lasciava tutto verde: la mutazione l ha
  // scoperto. Una funzione giusta e non collegata e' un fix che non difende niente.
  const m = misura("Il referto dice che i controlli automatici sono verdi e la consegna puo partire.", {
    precedenti: ["I controlli automatici sono verdi, quindi il referto dice che la consegna puo partire."],
  });
  assert.ok(
    m.problemi.some((p) => p.tipo === "gia-detto"),
    `attesa una ripetizione, trovati: ${m.problemi.map((p) => p.tipo)}`,
  );
});

prova("senza messaggi precedenti non accusa nessuno", () => {
  assert.deepEqual(ideeRipetute("Una frase qualunque con dentro parecchie parole piene.", []), []);
});

prova("due frasi povere non vengono giudicate", () => {
  // Sotto le 3 parole piene il confronto direbbe 100% per caso.
  assert.equal(quantoSiSomigliano("va bene cosi", "va bene adesso"), 0);
});

// ── AR-490: ogni misura dichiara cosa guarda e cosa non puo' vedere ────────────────────────────

prova("OGNI tipo di problema che posso emettere dichiara unita' e cieco", () => {
  // Il difetto di FORMA trovato 4 volte in un giorno: la misura guarda il pezzo e non l'insieme.
  // Ripararlo caso per caso non chiude niente. Questa prova impedisce a una misura NUOVA di
  // nascere cieca in silenzio: senza le due dichiarazioni, qui diventa rosso.
  const tipiEmessi = new Set();
  const casi = [
    { t: Array.from({ length: 34 }, (_, i) => "parola" + i).join(" ") + ".", o: {} },
    { t: "Il controllo (che gira da solo) ha bloccato il turno — e aveva ragione.", o: {} },
    { t: "Come dicevo, era gia rosso.", o: {} },
    { t: "Adesso il sistema e piu robusto.", o: {} },
    { t: "Il potatore ha fatto la spazzata.", o: { noteAGlossario: new Set() } },
    { t: Array.from({ length: 20 }, (_, i) => `Riga ${i} normale e corta.`).join("\n"), o: {} },
    {
      t: "Il referto dice che i controlli automatici sono verdi e la consegna puo partire.",
      o: { precedenti: ["I controlli automatici sono verdi, quindi il referto dice che la consegna puo partire."] },
    },
    {
      t: ["Ho sistemato una cosa.", "Funziona meglio.", "## Dettagli tecnici", "cancello commit branch deploy", "prove nuove", "tutto qui"].join("\n"),
      o: { noteAGlossario: new Set(["cancello"]) },
    },
    { t: Array.from({ length: 90 }, (_, i) => `Riga ${i} con dieci parole dentro per fare volume, ecco fatto.`).join("\n"), o: {} },
  ];
  for (const c of casi) for (const p of misura(c.t, c.o).problemi) tipiEmessi.add(p.tipo);
  const senza = [...tipiEmessi].filter((t) => !COPERTURA[t]);
  assert.deepEqual(senza, [], `misure che non dichiarano cosa non vedono: ${senza.join(", ")}`);
  assert.ok(tipiEmessi.size >= 8, `attesi almeno 8 tipi provati, provati ${tipiEmessi.size}`);
});

prova("ogni dichiarazione dice sia l'unita' sia il cieco, non una sola", () => {
  for (const [tipo, c] of Object.entries(COPERTURA)) {
    assert.ok(c.unita && c.unita.trim(), `${tipo}: manca cosa guarda`);
    assert.ok(c.cieco && c.cieco.trim(), `${tipo}: manca cosa NON puo vedere`);
  }
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

// ── AR-493: l'accento spegneva il segno di esempio ────────────────────────────────────────────
//
// `\bcioè\b` non ha mai potuto trovare niente: in JavaScript `\b` conta come parola solo le lettere
// ASCII, e dopo la «è» non c'è nessun confine. Il segno di esempio più usato in italiano era spento
// da sempre, e la misura mandava a riscrivere testi che l'esempio ce l'avevano già.

const LUNGO = Array.from({ length: 8 }, (_, i) => `riga di riempimento numero ${i + 1} per arrivare al testo lungo`);

prova("«cioè» conta come esempio: l'accento non deve spegnere il segno", () => {
  const t = [
    "In parole semplici",
    "Ho contato i punti difficili nei miei testi: 263 in tutto.",
    "Di questi solo 11 erano parole, cioè il 4%.",
    "Cosa cambia per te",
    "Gli altri 252 erano forma, e la forma si ripara.",
    "Cosa devi fare",
    "Niente.",
    "Cosa non ho verificato",
    "Se ci metti davvero meno tempo.",
    ...LUNGO,
  ].join("\n");
  const r = misura(t);
  assert.ok(r.testoLungo, "il caso deve essere un testo lungo, altrimenti la regola non gira nemmeno");
  assert.ok(!tipi(t).includes("manca-esempio"), "«cioè» è un esempio: accusare qui manda a riscrivere la cosa giusta");
});

prova("senza nessun segno di esempio l accusa resta: il fix non ha spento la regola", () => {
  const t = [
    "In parole semplici",
    "Ho cambiato il modo in cui scrivo i testi lunghi.",
    "Cosa cambia per te",
    "I testi diventano piu' facili da leggere.",
    "Cosa devi fare",
    "Niente.",
    "Cosa non ho verificato",
    "Quanto tempo risparmi davvero.",
    ...LUNGO,
  ].join("\n");
  assert.ok(tipi(t).includes("manca-esempio"), "un testo senza nessun caso concreto deve restare fermato");
});

// ── AR-518: la ripetizione DENTRO lo stesso messaggio ─────────────────────────────────────────
//
// Il caso non è inventato: è la foto che Nicola ha mandato il 4/8. Un messaggio solo, con i quattro
// blocchi due volte, lo stesso comando due volte e le stesse frasi riscritte. Il controllo contro le
// ripetizioni lo lasciava passare muto, perché confrontava solo con i messaggi PRECEDENTI — e un
// messaggio che ripete sé stesso non ha precedenti da confrontare.

const DOPPIO = [
  "In parole semplici",
  "La richiesta di unione è aperta e la regola nuova è scritta in due posti che non si dimenticano.",
  "Cosa cambia per te",
  "Sul server ci sono diciassette file di dati che la macchina si riscrive da sola ogni giro.",
  "Cosa devi fare",
  "```bash",
  "git branch salvataggio",
  "git fetch origin main",
  "```",
  "Fermati qui e mandami cosa stampa.",
  "Cosa non ho verificato",
  "Cosa succede quando il rebase riparte: può andare liscio o conflittare su ogni file.",
  "In parole semplici",
  "Sul server ci sono diciassette file di dati che la macchina si riscrive da sola ogni giro.",
  "Cosa cambia per te",
  "La richiesta di unione è aperta e la regola nuova è scritta in due posti che non si dimenticano.",
  "Cosa devi fare",
  "```bash",
  "git branch salvataggio",
  "git fetch origin main",
  "```",
  "Fermati qui e mandami cosa stampa.",
  "Cosa non ho verificato",
  "Cosa succede quando il rebase riparte: può andare liscio o conflittare su ogni file.",
].join("\n");

prova("il messaggio della foto di Nicola viene fermato: quattro titoli doppi", () => {
  const r = ripetizioniInterne(DOPPIO);
  const titoli = r.filter((x) => /volte/.test(x.trovato) && BLOCCHI.some((b) => x.frase === b));
  assert.equal(titoli.length, 4, `attesi i quattro blocchi doppi, trovati: ${titoli.map((x) => x.frase)}`);
});

prova("lo stesso blocco di comandi due volte viene fermato", () => {
  const r = ripetizioniInterne(DOPPIO).filter((x) => /stesso comando/.test(x.trovato));
  assert.equal(r.length, 1, "un comando da copiare due volte: chi legge non sa se sono due passi");
});

prova("le stesse frasi ridette lontano vengono fermate", () => {
  const r = ripetizioniInterne(DOPPIO).filter((x) => /stessa idea/.test(x.trovato));
  assert.ok(r.length >= 2, `attese almeno due frasi ridette, trovate ${r.length}`);
});

prova("la misura EMETTE la ripetizione interna, non basta trovarla", () => {
  // Stessa prova di AR-481, stessa ragione: una funzione giusta e non collegata non difende niente.
  assert.ok(misura(DOPPIO).problemi.some((p) => p.tipo === "gia-detto-qui"));
});

prova("il RIPASSO vicino non viene accusato: è la regola, non il difetto", () => {
  // Regola 2, mossa 3 di scrittura-umana.md: la cosa importante detta due volte, la seconda con
  // parole diverse. Se questa prova diventa rossa, il controllo nuovo sta combattendo una regola
  // scritta — ed è il modo in cui un freno giusto rende peggiore il testo.
  const t = [
    "Il controllo guarda soltanto i messaggi precedenti e non guarda mai dentro il messaggio.",
    "Detto in un altro modo: il controllo non guarda mai dentro il messaggio che sta misurando.",
  ].join("\n");
  assert.deepEqual(ripetizioniInterne(t), [], "una riformulazione accanto alla frase è il ripasso chiesto");
});

prova("due voci dello stesso elenco non sono una ripetizione", () => {
  // Il falso allarme misurato sul vault vero: con la soglia bassa uscivano 6.077 accuse su 692
  // testi, e la maggior parte erano elenchi con la stessa intelaiatura — «Costo:» sotto ogni
  // opzione, «Rischio:» sotto ogni altra. Stesse parole, contenuto opposto.
  const t = [
    "Opzione A, quella che consiglio davvero.",
    "Costo: poche ore, perché il motore esiste già e va soltanto agganciato.",
    "Rischio: medio basso, vanno esclusi date e numeri dal confronto.",
    "Opzione B, quella che sconsiglio.",
    "Costo: poche ore, perché il metro esiste già e va soltanto agganciato.",
    "Rischio: medio alto, vanno esclusi date e numeri dal confronto.",
  ].join("\n");
  assert.deepEqual(ripetizioniInterne(t), [], "cambia proprio quello che viene dopo l'etichetta");
});

prova("i quattro titoli sopra una risposta di due righe vengono segnalati", () => {
  const t = ["In parole semplici", "Sì.", "Cosa cambia per te", "Niente.", "Cosa devi fare", "Niente.", "Cosa non ho verificato", "Niente."].join("\n");
  assert.ok(
    misura(t).problemi.some((p) => p.tipo === "blocchi-su-testo-corto"),
    "quattro titoli e quattro parole: l'impalcatura pesa più di quello che regge",
  );
});

prova("i titoli dei blocchi non contano come contenuto", () => {
  // Se contassero, un testo fatto solo di impalcatura si dichiarerebbe «medio» da solo, e la
  // regola dei quattro blocchi si autogiustificherebbe con la propria presenza.
  const soloImpalcatura = ["In parole semplici", "Sì.", "Cosa cambia per te", "No.", "Cosa devi fare", "Niente.", "Cosa non ho verificato", "Niente."].join("\n");
  assert.equal(livelloDiStruttura(soloImpalcatura), "corta", "otto righe piene ma quattro di contenuto");
});

// ── Referto ───────────────────────────────────────────────────────────────────────────────────

const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n     ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} prove passate`);
process.exit(rotte.length ? 1 : 0);

