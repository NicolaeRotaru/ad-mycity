#!/usr/bin/env node
// 🧪 AR-504 — ogni visita produceva debito nuovo: il referto nasceva bocciato dal misuratore.
//
// LA STORIA. Il controllo della leggibilità (AR-478, chiesto da Nicola) misura i testi che lui
// legge, e `consegne/salute/` è una delle sue cartelle. Ogni referto usciva con una decina di punti
// difficili; essendo un file nuovo la soglia è zero, quindi ogni visita faceva scattare il freno. Il
// difetto non era nei singoli referti — quelli li sputa una macchina — ma nel GENERATORE.
//
// LA CAUSA VERA, misurata. Nove punti su dieci erano `gia-detto-qui`: la stessa cosa scritta due o
// tre volte. Non per come erano scritte le frasi, ma per come era fatta la STRUTTURA — lo stesso
// controllo rotto compariva in cima, in «Cosa devi fare», fra i peggiorati e nell'elenco per
// gravità; i non-visti stavano sia nel blocco che Nicola legge sia in una sezione tecnica gemella.
//
// LA CURA: la decisione «questo va detto qui e non altrove» è uscita dalla stampa ed è diventata un
// dato — `pianoDelReferto` — con il suo metro, `raccontiDoppi`. Così la prova la ESEGUE invece di
// cercare parole nel testo.
//
// ⚠️ COSA QUESTA PROVA NON PUÒ DIRE: il referto contiene anche le frasi che ogni singolo controllo
// scrive di suo (`detto`). Quelle non sono del generatore, e se domani un controllo scrive una frase
// da quaranta parole il referto la porterà. Qui si misura ciò di cui il generatore risponde: la sua
// struttura e le sue frasi fisse.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { referto, quattroRisposte, pianoDelReferto, raccontiDoppi } = await import(join(REPO, "cervello/salute.mjs"));
const { misura } = await import(join(REPO, "cervello/si-capisce.mjs"));

const voce = (o) => ({ prova: null, regressione: false, rossoDa: 0, cronico: false, ...o });

/** Una visita realistica: due rossi (uno cronico e peggiorato), due buchi, un verde. */
function visitaPiena() {
  const rotti = [
    voce({
      id: "worker.push",
      organo: "worker",
      esito: "rotto",
      impatto: 1,
      titolo: "Il server scrive e non pubblica",
      detto: "Da 23 giri di fila il server salva il lavoro in casa e non lo manda su GitHub.",
      prova: "node cervello/salute.mjs",
      daQuanto: "acceso in 23 visite di fila e nessuno l'ha risolto",
      rossoDa: 23,
      cronico: true,
      regressione: true,
    }),
    voce({
      id: "cabina.viva",
      organo: "cabina",
      esito: "rotto",
      impatto: 3,
      titolo: "La Cabina risponde alla chiamata",
      detto: "La pagina torna un errore invece della schermata.",
      prova: "node cervello/occhi-cabina.mjs",
    }),
  ];
  const nonVisti = [
    voce({ id: "worker.servizi", organo: "worker", esito: "nonvisto", titolo: "I servizi del server", detto: "Da qui il server non si raggiunge." }),
    voce({ id: "cabina.aperta", organo: "cabina", esito: "nonvisto", titolo: "La Cabina aperta al pubblico", detto: "Manca la chiave per entrare." }),
  ];
  const buoni = [voce({ id: "cervello.test", organo: "cervello", esito: "ok", titolo: "Le prove del cervello", detto: "Passano tutte.", prova: "node cervello/test-cervello.mjs" })];
  return { risultati: [...rotti, ...nonVisti, ...buoni], rotti, nonVisti, buoni, guasti: [], copertura: 0.6, mancantiAutotest: [] };
}

const visitaSenzaRossi = () => {
  const v = visitaPiena();
  return { ...v, rotti: [], risultati: [...v.nonVisti, ...v.buoni] };
};

const visitaTuttaVerde = () => ({ risultati: [voce({ id: "a", organo: "cervello", esito: "ok", titolo: "Le prove del cervello", detto: "Passano tutte." })], rotti: [], nonVisti: [], buoni: [voce({ id: "a", organo: "cervello", esito: "ok", titolo: "Le prove del cervello", detto: "Passano tutte." })], guasti: [], copertura: 1, mancantiAutotest: [] });

test("⬇️ AR-504 — nessun controllo si racconta per intero in due posti", () => {
  for (const [nome, v] of [
    ["visita piena", visitaPiena()],
    ["senza rossi", visitaSenzaRossi()],
    ["tutta verde", visitaTuttaVerde()],
  ]) {
    const doppi = raccontiDoppi(pianoDelReferto(v));
    assert.deepEqual(
      doppi.map((d) => `${d.chi} → ${d.sezioni.join(" + ")}`),
      [],
      `«${nome}»: il referto racconta due volte la stessa cosa`,
    );
  }
});

test("⬇️ AR-504 — il referto vero non contiene NESSUNA ripetizione interna", () => {
  const testo = referto(visitaPiena());
  const ripetizioni = misura(testo).problemi.filter((p) => p.tipo === "gia-detto-qui");
  assert.deepEqual(
    ripetizioni.map((p) => `${p.trovato}: ${p.frase}`),
    [],
    "il generatore ridice le stesse cose: ogni visita aggiunge debito al guardiano della leggibilità",
  );
});

test("⬇️ AR-504 — e il misuratore non boccia più il referto", () => {
  const testo = referto(visitaPiena());
  const m = misura(testo);
  assert.deepEqual(
    m.problemi.map((p) => `${p.tipo}: ${p.trovato}`),
    [],
    `il referto nasce con dei punti difficili, cioè ogni visita fa scattare il freno dello Stop`,
  );
});

test("AR-504 — la cura non ha svuotato il referto: la notizia c'è ancora", () => {
  // Senza questo caso, il modo più facile di far passare le prove qui sopra sarebbe stampare meno.
  const v = visitaPiena();
  const testo = referto(v);
  const sopra = quattroRisposte(v).join("\n");

  assert.match(sopra, /Il server scrive e non pubblica/i, "il peggiore non è più nominato in cima");
  assert.match(sopra, /non lo manda su GitHub/, "il caso concreto del peggiore è sparito: resta il titolo e basta");
  assert.match(sopra, /23 visite di fila/, "l'età dell'allarme non si legge più");
  for (const r of v.nonVisti) assert.ok(sopra.includes(r.titolo), `il buco «${r.titolo}» non è dichiarato`);
  assert.match(testo, /La Cabina risponde alla chiamata/, "il secondo rosso è sparito dall'elenco per gravità");
  assert.match(testo, /node cervello\/salute\.mjs/, "il comando che ripara il peggiore non è più nel referto");

  // E ognuno compare una volta sola: il conto è la prova che non si è ripetuto.
  // Il titolo in cima è minuscolo perché entra dentro una frase: si conta senza guardare le maiuscole.
  const volte = (ago) => testo.toLowerCase().split(ago.toLowerCase()).length - 1;
  assert.equal(volte("Il server scrive e non pubblica"), 1, "il titolo del peggiore compare più di una volta");
  assert.equal(volte("Da 23 giri di fila"), 1, "il perché del peggiore compare più di una volta");
  for (const r of v.nonVisti) assert.equal(volte(r.detto), 1, `«${r.titolo}» è raccontato due volte`);
});
