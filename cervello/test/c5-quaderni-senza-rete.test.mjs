#!/usr/bin/env node
// LOTTO 44, CORSIA 5 — I QUADERNI DEI SENIOR QUANDO LA RETE CADE (AR-608).
//
// La scheda del 13/8 accusava tre cose. Due erano già state curate da AR-263 (le letture hanno il
// loro `catch`, e il terzo stato «non ho potuto leggere» esiste). La terza no, e ne sono venute
// fuori altre due che nessuna scheda diceva — trovate leggendo il codice, non la scheda:
//
//   ① IL RIPASSO SILENZIOSO CANCELLA L'ELENCO. Ogni due minuti la casella si rilegge da sola. Se
//      quella rilettura fallisce — un tunnel, un ascensore — i quaderni già a schermo SPARISCONO e
//      al loro posto compare l'avviso di errore. Il dato c'era ed era buono.
//   ② IL TASTO «RIPROVA» CHIUDEVA IL QUADERNO. Faceva `setAperto(null)` e poi richiamava l'apertura
//      nello stesso istante: lo stato di React si aggiorna dopo, quindi la seconda chiamata trovava
//      ancora lo stesso nome aperto e credeva di doverlo chiudere. L'unica via d'uscita da un errore
//      di rete faceva sparire l'errore insieme al quaderno.
//   ③ LA COLPA SBAGLIATA. Le istruzioni da operatore («servono le variabili OBSIDIAN_* su Vercel»)
//      erano legate a «la lista è vuota», non a «il server ha detto che non è collegato».
//
// LA RADICE: quale schermata mostrare era una catena di `? :` dentro il JSX, e cosa fa un clic era
// dedotto da uno stato che nel frattempo era cambiato. Nessuna delle due un test la poteva
// eseguire. Adesso stanno in `pannello/src/lib/quaderni-vista.ts` e qui sotto girano davvero.
//
// Si lancia con: node cervello/test/c5-quaderni-senza-rete.test.mjs

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { register } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

register("./risolvi-ts.mjs", import.meta.url);

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const Q = await import(join(REPO, "pannello/src/lib/quaderni-vista.ts"));
const C = await import(join(REPO, "pannello/src/lib/casella-ricarica.ts"));

const leggi = (p) => readFileSync(join(REPO, p), "utf8");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// La catena è quella VERA del componente: prima il verdetto di AR-263 (`cosaMostrare`), poi la
// scelta della schermata. Si prova la catena intera, non solo il pezzo nuovo.
function vista({ caricando = false, errore = null, visibili = 0, collegato = true, inMano = 0, filtro = false }) {
  const base = C.cosaMostrare({
    caricando,
    letto: errore == null,
    vuoto: visibili === 0,
    motivo: errore,
    testoVuoto: filtro ? "Nessun quaderno corrisponde alla ricerca." : "Nessun quaderno ancora.",
  });
  return Q.vistaQuaderni(base, { collegato, quantiInMano: inMano, motivo: errore });
}

// ── ① Il ripasso silenzioso non cancella quello che si vede ─────────────────

prova("AR-608 LA CURA: il ripasso fallito NON butta via i quaderni già a schermo", () => {
  const v = vista({ errore: "rete non disponibile", inMano: 120, visibili: 120 });
  assert.equal(v.schermata, "elenco", "i 120 quaderni erano buoni: una rilettura andata storta non li cancella");
  assert.ok(v.avviso.includes("rilettura"), "…e lo si dice, con una striscia sopra l'elenco");
  assert.ok(v.avviso.includes("rete non disponibile"), "il motivo vero, non un errore generico");
  assert.equal(v.rassicurante, false, "c'è qualcosa che non si è potuto leggere: vietato rassicurare");
});

prova("AR-608: se non c'è niente di buono da tenere, il fallimento si dice e basta", () => {
  const v = vista({ errore: "il server ha risposto 500" });
  assert.equal(v.schermata, "non-letto");
  assert.ok(v.messaggio.includes("il server ha risposto 500"), "il motivo arriva a schermo");
  assert.equal(v.avviso, "", "non è una striscia sopra un elenco: l'elenco non c'è");
});

prova("AR-608: la prima lettura mostra la rotellina, non un elenco vuoto", () => {
  assert.equal(vista({ caricando: true }).schermata, "carico");
});

prova("AR-608: un ripasso in corso non nasconde i quaderni che si stanno già leggendo", () => {
  const v = vista({ caricando: true, inMano: 8, visibili: 8 });
  assert.equal(v.schermata, "elenco", "il ripasso a due minuti gira in silenzio: la pagina non sfarfalla");
});

// ── ③ La colpa va a chi c'entra ─────────────────────────────────────────────

prova("AR-608: le istruzioni da operatore solo quando il server dice «non sono collegato»", () => {
  assert.equal(vista({ collegato: false }).schermata, "non-collegato");
});

prova("AR-608 LA COLPA SBAGLIATA: senza rete NON si parla di variabili su Vercel", () => {
  // Lettura fallita: `collegato` è rimasto a falso perché la risposta non è mai arrivata. Prima
  // bastava questo a far comparire le istruzioni da operatore sul telefono di Nicola.
  const v = vista({ collegato: false, errore: "rete non disponibile" });
  assert.equal(v.schermata, "non-letto", "la colpa è della rete, non della configurazione");
});

prova("AR-608: collegato, letto e davvero senza quaderni → si può rassicurare", () => {
  const v = vista({ collegato: true });
  assert.equal(v.schermata, "vuoto");
  assert.equal(v.rassicurante, true);
  assert.ok(v.messaggio.includes("Nessun quaderno ancora"));
});

prova("AR-608: con una ricerca scritta, «non c'è niente» diventa «niente corrisponde»", () => {
  const v = vista({ inMano: 120, visibili: 0, filtro: true });
  assert.equal(v.schermata, "vuoto");
  assert.ok(v.messaggio.includes("ricerca"), "un filtro che non pesca non è un archivio vuoto");
});

// ── ② Il tasto «Riprova» riprova ────────────────────────────────────────────

prova("AR-608 IL DIFETTO: la riprova arrivava con lo stesso quaderno ancora segnato aperto", () => {
  // È la fotografia dell'istante in cui sbagliava: `setAperto(null)` non era ancora arrivato.
  const p = Q.aperturaQuaderno("vendite", "vendite", "riprova");
  assert.equal(p.leggi, true, "una riprova deve leggere: era l'unica via d'uscita dall'errore");
  assert.equal(p.aperto, "vendite", "…e il quaderno deve restare aperto, non chiudersi");
});

prova("AR-608: il clic su un quaderno già aperto lo chiude ancora — la cura non rompe il resto", () => {
  const p = Q.aperturaQuaderno("vendite", "vendite", "clic");
  assert.equal(p.aperto, null);
  assert.equal(p.leggi, false, "chiudere non è una buona ragione per andare a leggere");
});

prova("AR-608: il clic su un quaderno nuovo lo apre e lo legge", () => {
  const p = Q.aperturaQuaderno("vendite", "finanza", "clic");
  assert.equal(p.aperto, "finanza");
  assert.equal(p.leggi, true);
});

prova("AR-608: un nome vuoto non apre e non legge niente", () => {
  const p = Q.aperturaQuaderno("vendite", "   ", "clic");
  assert.equal(p.aperto, "vendite");
  assert.equal(p.leggi, false);
});

// ── Il dettaglio: resta la regola di AR-263, e non è cambiata ───────────────
// Rileggo la clausola invece di fidarmi: il dettaglio la sua cura ce l'ha già, e il mio modulo NON
// la sostituisce. Lo verifico eseguendola, così se qualcuno la toglie il rosso arriva da qui.

prova("AR-608: quaderno aperto senza rete → il motivo, non «Quaderno non trovato»", () => {
  const v = C.cosaMostrare({ caricando: false, letto: false, vuoto: true, motivo: "rete non disponibile", testoVuoto: "Quaderno non trovato." });
  assert.equal(v.stato, "non-letto");
  assert.ok(!v.messaggio.includes("non trovato"), "dire «non esiste» quando è caduta la rete è una diagnosi falsa");
});

prova("AR-608: quaderno letto e davvero assente → «Quaderno non trovato»", () => {
  const v = C.cosaMostrare({ caricando: false, letto: true, vuoto: true, testoVuoto: "Quaderno non trovato." });
  assert.equal(v.stato, "vuoto");
  assert.ok(v.messaggio.includes("non trovato"));
});

// ── IL CABLAGGIO: il componente CHIAMA il modulo ────────────────────────────

const CABLAGGI = [
  ["pannello/src/components/QuaderniSenior.tsx", "vistaQuaderni", 2],
  ["pannello/src/components/QuaderniSenior.tsx", "aperturaQuaderno", 2],
  ["pannello/src/components/QuaderniSenior.tsx", "cosaMostrare", 3],
];

for (const [file, simbolo, minimo] of CABLAGGI) {
  prova(`cablaggio: ${simbolo} è chiamato davvero nei Quaderni senior`, () => {
    const quante = leggi(file).split(new RegExp(`\\b${simbolo}\\b`)).length - 1;
    assert.ok(quante >= minimo, `«${simbolo}» compare ${quante} volte: con una sola c'è l'import e il resto è morto`);
  });
}

prova("cablaggio AR-608: la vecchia riprova che chiudeva il quaderno non esiste più", () => {
  const src = leggi("pannello/src/components/QuaderniSenior.tsx");
  assert.ok(
    !/setAperto\(null\);\s*void apriQuaderno\(/.test(src),
    "era la riga esatta del difetto: chiudi-e-riapri nello stesso istante chiude e basta",
  );
});

prova("cablaggio AR-608: il messaggio delle variabili non è più appeso a «la lista è vuota»", () => {
  const src = leggi("pannello/src/components/QuaderniSenior.tsx");
  assert.ok(
    !/!collegato && quaderni\.length === 0 \?/.test(src),
    "era la condizione che dava la colpa alla configurazione anche quando era caduta la rete",
  );
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
