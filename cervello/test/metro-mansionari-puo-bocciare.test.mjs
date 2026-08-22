#!/usr/bin/env node
// AR-436 — il metro dei mansionari doveva poter dire di NO, e non poteva.
//
// IL CASO CHE HA ROTTO: `difettiAgente` cercava quattro parole — «SCHEDA MESTIERE»,
// «RUBRICA-LIVELLI», «scorecard», «RITUALE DI FINE» — cioè i quattro titoli che il template di
// rollout incollava in ogni file per costruzione. Misurato sul parco vero: **120 su 120** passavano,
// e nessuno poteva essere bocciato. Un controllo che non può fallire non è severo né indulgente: non
// è un controllo.
//
// COSA PROVA QUESTO FILE, e perché in quest'ordine:
//   ① il canarino: un mansionario finto e POVERO — i quattro titoli del template e niente sotto —
//      passava il metro vecchio e viene BOCCIATO dal nuovo. È la prova che il metro può dire di no.
//   ② il rovescio: un mansionario finto e RICCO passa. Un metro che boccia tutti è l'altra faccia
//      dello stesso difetto (in questa casa c'è già un caso che si chiama «il metro che boccia tutto»).
//   ③ una misura alla volta: cinque canarini, uno per ingrediente. Ogni controllo nuovo nasce con un
//      caso che DEVE farlo fallire, altrimenti non si considera installato.
//   ④ le fotocopie sui mansionari, con l'esclusione che le rende leggibili: la Carta del Dipendente è
//      identica su tutti e 120 per progetto, e misurarla dichiara fotocopia l'intero parco.
//   ⑤ il parco VERO: quanti ne passano davvero adesso. Se il numero fosse ancora 120 su 120, tutto il
//      resto di questo file proverebbe solo che so scrivere mansionari finti.

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DIFETTO,
  difettiAgente,
  fotocopie,
  fotocopieMansionari,
  misureMansionario,
} from "../stampo-metro.mjs";
import { annotata, numeroVarianti, parteDiMestiere, vociDiElenco } from "../mansionario-misure.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const AGENTI = join(REPO, ".claude/agents");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── I due mansionari finti ──────────────────────────────────────────────────

/** Il POVERO: esattamente ciò che il metro vecchio chiamava «completo». Quattro titoli, zero sostanza. */
const POVERO = [
  "## 🎓 SCHEDA MESTIERE — come ragiona un fuoriclasse di qualcosa",
  "",
  "Sei bravo. Il tuo metro è [[RUBRICA-LIVELLI]].",
  "",
  "**Come pensi (modelli mentali).** Pensa bene.",
  "",
  "**Il tuo loop interno.** Fai il lavoro e consegnalo. Domanda-ghigliottina.",
  "",
  "**Galleria di riferimento.**",
  "- ✅ GOLD: un buon lavoro.",
  "- ❌ SPAZZATURA: un brutto lavoro.",
  "",
  "**Trappole del mestiere.** Sbagliare.",
  "",
  "**Il carburante che chiedi.** Chiedi a Nicola quello che ti serve.",
  "",
  "**Auto-valutazione scorecard.** Dichiara i 6 assi.",
  "",
  "## 🧬 Carta del Dipendente MyCity",
  "✅ RITUALE DI FINE — auto-verifica prima di consegnare.",
].join("\n");

/**
 * Il RICCO: gli stessi quattro titoli, ma con dentro gli ingredienti dello stampo.
 * È una funzione del mestiere perché serve anche alla prova delle fotocopie: due schede di due
 * mestieri diversi devono risultare DIVERSE, e per riuscirci il mestiere deve comparire dentro ogni
 * blocco lungo — come in un mansionario vero, dove ogni ingrediente parla del suo lavoro.
 */
function mansionarioRicco(mestiere = "forno") {
  return [
    `## 🎓 SCHEDA MESTIERE — come ragiona un fuoriclasse del ${mestiere}`,
    "",
    "Hai 12 anni dietro un bancone. Il tuo metro è [[RUBRICA-LIVELLI]], bersaglio L7.",
    "",
    "**Come pensi (modelli mentali).**",
    `- **Il prodotto fresco vende sé stesso**: nel ${mestiere} di via Roma, se è pronto alle sette la fila si forma da sola.`,
    "- **Densità prima di varietà**: dieci pezzi di tre tipi battono tre pezzi di dieci tipi, sempre.",
    "- **Il cliente delle sette non è quello delle undici**: due mestieri diversi nello stesso negozio.",
    "",
    "**Il tuo loop interno (NON consegni la prima bozza).**",
    "1. Genera **almeno 3 angoli diversi** per l'offerta del giorno.",
    `2. Criticali contro il [[TASTE-FILE-NICOLA]] e la memoria del ${mestiere}, non contro il tuo gusto.`,
    "3. Tieni 1, butta gli altri 2. Domanda-ghigliottina: **«Lo comprerebbe un piacentino di 60 anni",
    "   di fretta, alle sette del mattino, senza farsi spiegare niente?»** → se no, riscrivi.",
    "",
    "**Galleria di riferimento (il bersaglio del 10/10).**",
    "- ✅ GOLD: «Focaccia calda dalle 7, tre pezzi a 5 euro, finita alle 9» — perché funziona: dice",
    "  l'ora, il prezzo e la scarsità vera, e chi passa capisce in tre secondi se gli conviene correre.",
    `- ❌ SPAZZATURA: «Vieni a scoprire le specialità artigianali del nostro ${mestiere}» — perché muore:`,
    "  nessun orario, nessun prezzo, nessuna ragione per muoversi adesso invece che domani o mai.",
    "",
    "**Trappole del mestiere (evitale a riflesso).** Promettere il caldo quando il forno è spento ·",
    `annunciare quantità che nel ${mestiere} non hai · sconti a pioggia che bruciano il margine ·`,
    "scrivere «artigianale» senza dire cosa cambia per chi mangia.",
    "",
    "**Il carburante che chiedi (alza il tetto).** Ti servono: le **quantità reali sfornate per fascia",
    `oraria**, le **foto del banco delle sette** nel ${mestiere}, il **prezzo di costo della farina** e`,
    "l'orario vero di chiusura. Se mancano, chiedili a Nicola come carburante invece di stimarli.",
    "",
    "**Auto-valutazione scorecard.** Prima di consegnare, 1-5 sui 6 assi della [[RUBRICA-LIVELLI]].",
    "",
    "## 🧬 Carta del Dipendente MyCity",
    "✅ RITUALE DI FINE — auto-verifica prima di consegnare.",
  ].join("\n");
}

const RICCO = mansionarioRicco();

// ── ① Il canarino ───────────────────────────────────────────────────────────

prova("① il caso che ha rotto: il mansionario POVERO passava il metro vecchio", () => {
  // I quattro controlli di prima, riprodotti qui: è il metro che diceva 120/120.
  const vecchi = [
    /##\s*🎓\s*SCHEDA MESTIERE/i,
    /RUBRICA-LIVELLI/i,
    /scorecard/i,
    /RITUALE DI FINE/i,
  ];
  assert.ok(vecchi.every((re) => re.test(POVERO)), "il povero ha tutti e quattro i titoli del template");
  assert.ok(vecchi.every((re) => re.test(RICCO)), "e il ricco pure: su questi quattro sono indistinguibili");
});

prova("① e adesso il metro lo BOCCIA — con tutte e cinque le misure di sostanza", () => {
  const d = difettiAgente(POVERO);
  for (const atteso of [
    DIFETTO.MODELLI_POVERI,
    DIFETTO.LOOP_SENZA_VARIANTI,
    DIFETTO.GALLERIA_SENZA_PERCHE,
    DIFETTO.TRAPPOLE_SCARSE,
    DIFETTO.CARBURANTE_GENERICO,
  ]) {
    assert.ok(d.includes(atteso), `atteso «${atteso}» fra i difetti del povero, trovati: ${d.join(", ")}`);
  }
});

// ── ② Il rovescio: non è un giro di vite generico ───────────────────────────

prova("② il mansionario RICCO passa: un metro che boccia tutti non distingue niente", () => {
  assert.deepEqual(difettiAgente(RICCO), [], `il ricco non deve avere difetti: ${JSON.stringify(misureMansionario(RICCO))}`);
});

// ── ③ Un canarino per ogni misura ───────────────────────────────────────────
// Ogni controllo si guasta da solo: si toglie UN ingrediente al ricco e deve uscire QUEL difetto e
// (quasi) solo quello. Senza questi cinque casi, un controllo potrebbe non essere mai eseguito e
// nessuno se ne accorgerebbe — è come è nato AR-436.

const senza = (blocco, sostituto = "") => RICCO.replace(blocco, sostituto);

prova("③a modelli mentali: due voci invece di tre e il metro dice no", () => {
  const testo = senza("- **Il cliente delle sette non è quello delle undici**: due mestieri diversi nello stesso negozio.");
  const m = misureMansionario(testo);
  assert.equal(m.modelli.voci, 2);
  assert.ok(!m.modelli.ok, "due modelli non sono un repertorio");
  assert.ok(difettiAgente(testo).includes(DIFETTO.MODELLI_POVERI));
  assert.match(m.modelli.perche, /2 voci contate su 3/, "e il rapporto deve dire QUANTE, non solo che sono poche");
});

prova("③b loop: senza il numero di varianti non c'è niente da scegliere", () => {
  const testo = senza("1. Genera **almeno 3 angoli diversi** per l'offerta del giorno.", "1. Fai l'offerta del giorno.");
  const m = misureMansionario(testo);
  assert.ok(!m.loop.ok);
  assert.ok(m.loop.ghigliottina, "la ghigliottina c'è ancora: il difetto è solo il numero mancante");
  assert.ok(difettiAgente(testo).includes(DIFETTO.LOOP_SENZA_VARIANTI));
});

prova("③b bis loop: la parola «ghigliottina» senza un punto interrogativo non taglia niente", () => {
  const testo = RICCO.replace(/Domanda-ghigliottina:[\s\S]*?→ se no, riscrivi\./, "Domanda-ghigliottina: fai del tuo meglio.");
  const m = misureMansionario(testo);
  assert.ok(!m.loop.ghigliottina, "la parola c'è in 120 file su 120: da sola non prova niente");
  assert.ok(difettiAgente(testo).includes(DIFETTO.LOOP_SENZA_VARIANTI));
});

prova("③c galleria: l'esempio senza il perché è un aneddoto, non un insegnamento", () => {
  const testo = RICCO.replace(
    /- ✅ GOLD:[\s\S]*?correre\./,
    '- ✅ GOLD: «Focaccia calda dalle 7, tre pezzi a 5 euro, finita alle 9, tutti i giorni feriali».',
  );
  const m = misureMansionario(testo);
  assert.equal(m.galleria.gold, 1, "l'esempio c'è ancora");
  assert.ok(!m.galleria.ok, "ma nessuno spiega perché è oro");
  assert.match(m.galleria.perche, /perché è oro/);
  assert.ok(difettiAgente(testo).includes(DIFETTO.GALLERIA_SENZA_PERCHE));
});

prova("③d trappole: due anti-pattern non sono un elenco", () => {
  const testo = RICCO.replace(
    /\*\*Trappole del mestiere \(evitale a riflesso\).\*\*[\s\S]*?per chi mangia\./,
    "**Trappole del mestiere (evitale a riflesso).** Promettere il caldo quando il forno è spento ·\nannunciare quantità che non hai davvero in banco stamattina.",
  );
  const m = misureMansionario(testo);
  assert.equal(m.trappole.voci, 2);
  assert.ok(difettiAgente(testo).includes(DIFETTO.TRAPPOLE_SCARSE));
});

prova("③e carburante: una frase di cortesia non è un elenco di dati/foto/chiavi", () => {
  const testo = RICCO.replace(
    /\*\*Il carburante che chiedi \(alza il tetto\).\*\*[\s\S]*?invece di stimarli\./,
    "**Il carburante che chiedi (alza il tetto).** Chiedi a Nicola quello che ti serve.",
  );
  const m = misureMansionario(testo);
  assert.ok(!m.carburante.ok, `atteso un carburante generico, contate ${m.carburante.voci} voci`);
  assert.match(m.carburante.perche, /è una frase, non un elenco/);
  assert.ok(difettiAgente(testo).includes(DIFETTO.CARBURANTE_GENERICO));
});

// ── ④ Le fotocopie, con l'esclusione della Carta condivisa ──────────────────

prova("④ tre schede mestiere identiche sono uno stampo incollato", () => {
  const copiati = fotocopieMansionari({ a: RICCO, b: RICCO, c: RICCO });
  assert.deepEqual(Object.keys(copiati).sort(), ["a", "b", "c"]);
  assert.ok(difettiAgente(RICCO, { blocchiCopiati: copiati.a }).includes(DIFETTO.MANSIONARIO_FOTOCOPIA));
});

prova("④ bis ma la Carta del Dipendente condivisa NON fa fotocopia nessuno", () => {
  // È l'errore che rende inutile la misura: la Carta è identica su tutti e 120 per progetto, e sul
  // file intero il rilevatore dichiara fotocopia l'intero parco. Qui tre schede DIVERSE con la stessa
  // Carta lunga sotto: zero fotocopie.
  const carta = `\n## 🧬 Carta del Dipendente MyCity\n${"Le sette regole valgono per tutti e non cambiano mai da un senior all'altro. ".repeat(8)}\n✅ RITUALE DI FINE\n`;
  const conCartaSotto = (mestiere) => mansionarioRicco(mestiere) + carta;
  assert.deepEqual(fotocopieMansionari({ a: conCartaSotto("fiorista"), b: conCartaSotto("ferramenta"), c: conCartaSotto("ottica") }), {});
  // E la prova che il caso non è vacuo: gli STESSI tre file, misurati interi come si fa coi kit,
  // risultano tutti e tre fotocopie — per via della sola Carta condivisa. È la differenza fra la
  // misura giusta e una che accusa 120 mansionari su 120.
  const interi = { a: conCartaSotto("fiorista"), b: conCartaSotto("ferramenta"), c: conCartaSotto("ottica") };
  assert.equal(Object.keys(fotocopie(interi)).length, 3,
    "senza l'esclusione della Carta il rilevatore dichiara fotocopia chiunque: è il caso che rende utile l'esclusione");
});

prova("④ ter la parte di mestiere si ferma dove comincia il sistema operativo condiviso", () => {
  const m = parteDiMestiere(RICCO);
  assert.ok(m.includes("SCHEDA MESTIERE"), "comincia dalla scheda");
  assert.ok(!m.includes("Carta del Dipendente"), "e finisce prima della Carta");
});

// ── ⑤ Il parco VERO ─────────────────────────────────────────────────────────

function parcoVero() {
  const nomi = readdirSync(AGENTI)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -3))
    .sort();
  const testi = Object.fromEntries(nomi.map((n) => [n, readFileSync(join(AGENTI, `${n}.md`), "utf8")]));
  const copiati = fotocopieMansionari(testi);
  const quadro = {};
  for (const n of nomi) {
    const d = difettiAgente(testi[n], { blocchiCopiati: copiati[n] || 0 });
    if (d.length) quadro[n] = d;
  }
  return { nomi, quadro };
}

prova("⑤ sul parco vero il metro NON dice più 120 su 120", () => {
  const { nomi, quadro } = parcoVero();
  assert.equal(nomi.length, 120, `atteso il parco vero da 120, letti ${nomi.length}`);
  const bocciati = Object.keys(quadro).length;
  assert.ok(bocciati > 0,
    "se nessun mansionario vero fosse in difetto, il metro sarebbe di nuovo quello di AR-436 con altre parole");
  console.log(`# parco vero: ${nomi.length - bocciati} passano su ${nomi.length} · ${bocciati} bocciati`);
});

prova("⑤ bis e non li boccia nemmeno tutti: la misura discrimina", () => {
  const { nomi, quadro } = parcoVero();
  const passano = nomi.length - Object.keys(quadro).length;
  assert.ok(passano > 0,
    `un metro che boccia tutti e 120 è l'altra faccia di uno che li promuove tutti: ne passano ${passano}`);
});

prova("⑤ ter i quattro controlli vecchi, da soli, continuano a promuovere tutti", () => {
  // La riga che tiene onesto il racconto: la differenza NON viene da un parco peggiorato, viene dalle
  // misure nuove. Se un giorno questa diventasse rossa, qualcuno avrebbe toccato i mansionari.
  const { nomi } = parcoVero();
  const vecchi = [/##\s*🎓\s*SCHEDA MESTIERE/i, /RUBRICA-LIVELLI/i, /scorecard/i, /RITUALE DI FINE/i];
  const passanoIVecchi = nomi.filter((n) => {
    const t = readFileSync(join(AGENTI, `${n}.md`), "utf8");
    return vecchi.every((re) => re.test(t));
  }).length;
  assert.equal(passanoIVecchi, nomi.length,
    "i quattro titoli del template li ha ancora il 100% del parco: da soli non potevano bocciare nessuno");
});

// ── I mattoni puri, provati uno per uno ─────────────────────────────────────

prova("i mattoni: numero di varianti, annotazione, voci di elenco", () => {
  assert.equal(numeroVarianti("Genera **almeno 3 angoli** diversi")?.n, 3);
  assert.equal(numeroVarianti("Genera **2-3 approcci** al fix")?.n, 2);
  assert.equal(numeroVarianti("1. Scrivi la query e guarda i dati grezzi (10 righe a campione)"), null,
    "un numero qualunque dentro una frase non è una dichiarazione di varianti");
  assert.equal(numeroVarianti("Riconcilia a tre vie e fai tornare i totali"), null);

  assert.ok(annotata("✅ GOLD: pagina fatta bene → conquista il rich result e il local pack di Google"));
  assert.ok(annotata('✅ GOLD: *"un esempio citato"* — perché funziona: dice il prezzo e l\'ora'));
  assert.ok(!annotata('✅ GOLD: *"un esempio citato lungo abbastanza da sembrare completo, ma nudo"*'),
    "l'esempio dentro le virgolette non spiega sé stesso");

  assert.equal(vociDiElenco("- una voce lunga a sufficienza per contare\n- e una seconda voce lunga uguale").voci.length, 2);
  assert.equal(vociDiElenco("- a\n- b\n- c").voci.length, 0, "tre segnaposti non sono tre voci");
  assert.equal(
    vociDiElenco("prima cosa lunga da elencare, seconda cosa lunga, terza cosa lunga", { minChar: 12, forme: ["elenco", "puntini", "virgole"] }).voci.length,
    3,
    "dove serve, un elenco scritto a virgole resta un elenco",
  );
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
