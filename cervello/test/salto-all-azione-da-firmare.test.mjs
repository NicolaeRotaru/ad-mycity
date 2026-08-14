// AR-612 — «Vai all'azione da firmare» deve portare Nicola davanti all'azione, aperta.
//
// Il difetto: dalle schede «Mosse di Nicola» e «Sentinelle» quel bottone cercava l'azione collegata e
// provava a scorrerci sopra, ma non era stato aggiornato quando la coda è diventata una lista di
// tendine chiuse con un tetto di dieci. Risultato:
//   · se l'azione stava oltre la decima non era nemmeno montata: `getElementById` tornava vuoto e non
//     succedeva NIENTE — si restava fermi in cima, come se il bottone fosse rotto;
//   · se stava tra le prime dieci si atterrava su una riga chiusa e muta, perché veniva aperto lo
//     stato sbagliato (quello del «testo esatto», non quello della card);
//   · e se nessuna azione corrispondeva, nessuno lo diceva.
// Il percorso gemello — l'arrivo da un'altra area — faceva già le cose giuste: il fix era stato
// applicato a un chiamante solo dei due. Qui la decisione è una sola e si esegue.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { saltoAllAzione, azioneCollegata, parolePiene } = await import(join(REPO, "pannello/src/lib/salto-azione.ts"));
const { TETTO_CODA, azioniVisibili } = await import(join(REPO, "pannello/src/lib/coda-azioni.ts"));

/** Una coda finta ma realistica: `quante` azioni da firmare, con una riconoscibile in fondo. */
function coda(quante, speciale = null, posizioneSpeciale = quante - 1) {
  const lista = [];
  for (let i = 0; i < quante; i++) {
    lista.push(
      i === posizioneSpeciale && speciale
        ? { id: `az-${i}`, stato: "", titolo: speciale, perche: "" }
        : { id: `az-${i}`, stato: "", titolo: `Pratica ordinaria numero ${i}`, perche: "niente di collegato" },
    );
  }
  return lista;
}

test("il caso che sembrava un bottone rotto: l'azione è la trentesima e va srotolata la coda", () => {
  const azioni = coda(30, "Chiama il fornaio per confermare il volantino");
  const salto = saltoAllAzione("Volantino dal fornaio: confermare", azioni, false);
  assert.equal(salto.id, "az-29", "deve trovarla anche se sta in fondo");
  assert.equal(salto.srotola, true, "senza srotolare non è nemmeno nel DOM: non c'è niente su cui scorrere");
  assert.equal(salto.apri, true, "e la tendina va aperta, altrimenti si atterra su una riga muta");
  assert.equal(salto.tab, "approvare");
  assert.equal(salto.avviso, null);
  // La prova che il tetto morde davvero: prima dello srotolamento quell'azione non è montata.
  const montate = azioniVisibili(azioni, false).map((a) => a.id);
  assert.ok(!montate.includes("az-29"), "il tetto la tiene fuori dal DOM finché non si srotola");
  assert.ok(azioniVisibili(azioni, true).map((a) => a.id).includes("az-29"), "srotolata, c'è");
});

test("azione tra le prime dieci: si apre la tendina, la lista resta corta", () => {
  const azioni = coda(12, "Ordina i sacchetti nuovi per Pane Quotidiano", 2);
  const salto = saltoAllAzione("Sacchetti nuovi per Pane Quotidiano", azioni, false);
  assert.equal(salto.id, "az-2");
  assert.equal(salto.apri, true);
  assert.equal(salto.srotola, false, "è già montata: srotolare tutto sarebbe rumore inutile");
});

test("nessuna azione collegata: lo dice, invece di lasciarti lì a chiederti perché", () => {
  const salto = saltoAllAzione("Comprare una barca a vela", coda(3), false);
  assert.equal(salto.id, null);
  assert.equal(salto.apri, false);
  assert.ok(salto.avviso && salto.avviso.length > 10, "serve una frase, non il silenzio");
  assert.match(salto.avviso, /barca a vela/, "e deve dire COSA non ha trovato");
  assert.equal(salto.tab, "approvare", "si resta comunque sulla scheda dove si firma");
});

test("coda lunga e niente da collegare: si srotola, così la si può cercare a mano", () => {
  const salto = saltoAllAzione("Argomento mai visto", coda(25), false);
  assert.equal(salto.id, null);
  assert.equal(salto.srotola, true);
});

test("le azioni già decise non contano: si firma solo ciò che aspetta la firma", () => {
  const azioni = [
    { id: "vecchia", stato: "approvata", titolo: "Volantino dal fornaio", perche: "" },
    { id: "viva", stato: "", titolo: "Volantino dal fornaio", perche: "" },
  ];
  assert.equal(saltoAllAzione("Volantino dal fornaio", azioni, false).id, "viva");
});

test("a pari punteggio vince la prima della coda, quella che Nicola vede in alto", () => {
  const azioni = [
    { id: "prima", stato: "", titolo: "Fiori per il mercato", perche: "" },
    { id: "seconda", stato: "", titolo: "Fiori per il mercato", perche: "" },
  ];
  assert.equal(azioneCollegata("Fiori per il mercato", azioni), "prima");
});

test("le parole generiche non collegano niente per sbaglio", () => {
  // «azione», «prima», «subito» stanno in metà dei titoli: se contassero, il bottone porterebbe
  // sempre alla prima azione della coda, che è il modo peggiore di sembrare funzionante.
  assert.deepEqual(parolePiene("Prepara subito questa azione"), []);
  assert.equal(azioneCollegata("Prepara subito questa azione", coda(5)), null);
});

test("titolo vuoto o coda vuota: nessuna scelta a caso", () => {
  assert.equal(azioneCollegata("", coda(5)), null);
  assert.equal(azioneCollegata("Volantino", []), null);
  assert.equal(saltoAllAzione("", [], false).id, null);
});

test("il tetto viene da coda-azioni, non è ricopiato qui", () => {
  // Due tetti diversi vorrebbero dire «srotola» calcolato su un numero e lista mostrata su un altro.
  const azioni = coda(TETTO_CODA + 1, "Ordine speciale del panettiere");
  assert.equal(saltoAllAzione("Ordine speciale del panettiere", azioni, false).srotola, true);
  const corte = coda(TETTO_CODA, "Ordine speciale del panettiere");
  assert.equal(saltoAllAzione("Ordine speciale del panettiere", corte, false).srotola, false);
});

test("la decisione è collegata al bottone, e apre lo stato GIUSTO", () => {
  const az = readFileSync(join(REPO, "pannello/src/components/aree/Azioni.tsx"), "utf8");
  const corpo = az.slice(az.indexOf("function vaiAllAzione("), az.indexOf("// «Da approvare» ="));
  assert.match(corpo, /saltoAllAzione\(/, "il bottone deve usare la decisione provata");
  assert.match(corpo, /setScelteCard\(/, "è `scelteCard` ad aprire la card della coda, non `aperte`");
  assert.match(corpo, /setMostraTuttaCoda\(true\)/, "e la coda va srotolata quando serve");
  assert.match(az, /avvisoSalto/, "l'avviso «non l'ho trovata» dev'essere mostrato a schermo");
});
