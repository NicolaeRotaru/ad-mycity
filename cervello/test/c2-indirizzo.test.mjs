// AR-244 — «il link del messaggio Telegram non può portarti sulle azioni da firmare».
//
// COSA ERA ROTTO. Il Pannello è una pagina sola: l'area («Azioni») e la scheda («Da approvare»)
// vivevano dentro lo stato di React e in `localStorage`, e ogni timbro di cronologia riscriveva
// l'indirizzo come `pathname + search`, cioè lo lasciava esattamente com'era. Risultato: un
// indirizzo non poteva NOMINARE un posto, quindi nessun link poteva portarti lì. Il messaggio
// «approva dal Pannello» apriva l'ultima area visitata, e per arrivare alla coda da firmare ci
// volevano altri tre tocchi — sull'unico imbuto che trasforma il lavoro dei senior in decisioni.
//
// COSA PROVA QUESTO TEST. Che la traduzione (area, scheda) ⇄ indirizzo esiste, è una funzione pura
// e fa il giro completo: scrivo un indirizzo da una destinazione, lo rileggo, ritrovo la stessa
// destinazione. E che i parametri COMANDANO sull'ultima vista salvata e sul vecchio cancelletto.
//
// Non è un test a parole chiave: esegue `pannello/src/lib/pagina-stato.ts`, lo stesso modulo che
// `page.tsx` chiama all'avvio e che `nav.ts` chiama a ogni cambio di scheda.

import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

register("./risolvi-ts.mjs", import.meta.url);

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..", "..");
const { destinazioneDaIndirizzo, indirizzoDestinazione, indirizzoDopoCambioArea, PARAM_AREA, PARAM_SCHEDA } =
  await import(join(RADICE, "pannello/src/lib/pagina-stato.ts"));

test("AR-244 · un indirizzo sa NOMINARE area e scheda", () => {
  assert.equal(indirizzoDestinazione({ vista: "azioni", sub: "approvare" }), "/?a=azioni&s=approvare");
  assert.equal(indirizzoDestinazione({ vista: "azioni" }), "/?a=azioni");
  // Il difetto in una riga: prima l'indirizzo restava quello di prima, qualunque cosa fosse.
  assert.notEqual(indirizzoDestinazione({ vista: "numeri" }), "/");
});

test("AR-244 · il link del messaggio porta sulla coda da firmare", () => {
  // È esattamente l'indirizzo che deve finire nel messaggio Telegram: `<pannello>?a=azioni&s=approvare`.
  const d = destinazioneDaIndirizzo("?a=azioni&s=approvare", "");
  assert.deepEqual(d, { vista: "azioni", sub: "approvare" });
});

test("AR-244 · andata e ritorno: quello che scrivo è quello che rileggo", () => {
  const casi = [
    { vista: "azioni", sub: "approvare" },
    { vista: "numeri" },
    { vista: "memoria", sub: "archivio/github" },
    { vista: "cervello", sub: "cantiere" },
  ];
  for (const atteso of casi) {
    const url = indirizzoDestinazione(atteso);
    const search = url.slice(url.indexOf("?"));
    assert.deepEqual(destinazioneDaIndirizzo(search, ""), atteso, `giro rotto per ${url}`);
  }
});

test("AR-244 · i parametri hanno nomi corti e stabili (finiscono dentro i messaggi)", () => {
  assert.equal(PARAM_AREA, "a");
  assert.equal(PARAM_SCHEDA, "s");
});

test("AR-244 · l'indirizzo COMANDA sul vecchio cancelletto", () => {
  // Se ci sono entrambi vince il parametro: è quello che qualcuno ha scritto adesso.
  assert.deepEqual(destinazioneDaIndirizzo("?a=numeri", "#azioni"), { vista: "numeri" });
  // Il cancelletto storico continua a funzionare (AR-609): le lettere già mandate non si rompono.
  assert.deepEqual(destinazioneDaIndirizzo("", "#azioni/approvare"), { vista: "azioni", sub: "approvare" });
  assert.deepEqual(destinazioneDaIndirizzo("", "#auto-coscienza"), { vista: "auto-coscienza", sub: "analisi" });
});

test("AR-244 · un indirizzo che non dice niente NON muove niente", () => {
  // `null` = «resta dove sei»: l'ultima area salvata non va calpestata da un indirizzo vuoto o
  // da un'area che non esiste. Era il comportamento giusto già in casa, e va tenuto.
  assert.equal(destinazioneDaIndirizzo("", ""), null);
  assert.equal(destinazioneDaIndirizzo("?a=", ""), null);
  assert.equal(destinazioneDaIndirizzo("?a=pippo", ""), null);
  assert.equal(destinazioneDaIndirizzo(null, null), null);
});

test("AR-244 · un'area sconosciuta nei parametri non copre il cancelletto buono", () => {
  assert.deepEqual(destinazioneDaIndirizzo("?a=pippo", "#azioni"), { vista: "azioni" });
});

test("AR-244 · nomi con spazi e caratteri strani sopravvivono al giro", () => {
  const url = indirizzoDestinazione({ vista: "memoria", sub: "archivio/github" });
  assert.ok(url.includes("s=archivio%2Fgithub"), `la barra va protetta: ${url}`);
  assert.deepEqual(destinazioneDaIndirizzo(url.slice(url.indexOf("?")), ""), {
    vista: "memoria",
    sub: "archivio/github",
  });
});

test("AR-244 · il link non si cancella da solo un istante dopo essere atterrato", () => {
  // Trovato guidando il Pannello: aprendo `?a=azioni&s=approvare`, il passaggio da «Plancia» ad
  // «Azioni» timbrava una voce di cronologia con la sola area — e l'indirizzo perdeva la scheda
  // subito dopo il caricamento. Regola: se l'indirizzo nomina GIÀ quest'area, la sua scheda resta.
  assert.equal(indirizzoDopoCambioArea("?a=azioni&s=approvare", "azioni"), "/?a=azioni&s=approvare");
  // Andando in un'area DIVERSA la scheda di prima non c'entra più e se ne va.
  assert.equal(indirizzoDopoCambioArea("?a=azioni&s=approvare", "numeri"), "/?a=numeri");
  // Indirizzo senza parametri: si scrive solo l'area.
  assert.equal(indirizzoDopoCambioArea("", "memoria"), "/?a=memoria");
});

test("AR-244 · il percorso resta quello servito (il Pannello è una pagina sola)", () => {
  assert.equal(indirizzoDestinazione({ vista: "azioni" }, "/"), "/?a=azioni");
  assert.equal(indirizzoDestinazione(null, "/"), "/");
});

test("AR-244 · la scheda chiesta da un link ASPETTA che l'area compaia (non scade dopo 3 secondi)", async () => {
  // L'altra metà del difetto, trovata guidando il Pannello: l'area si carica quando serve e può
  // comparire parecchi secondi dopo il caricamento. La scheda veniva parcheggiata con una finestra
  // di freschezza di 3 secondi — giusta per un salto fatto col dito, sbagliata per un link, che è
  // un intento esplicito e non invecchia. Risultato: si atterrava sulla scheda di default.
  const { parcheggiaSubDaIndirizzo, consumaSubPendente, ripristinaSub } = await import(
    join(RADICE, "pannello/src/lib/nav.ts")
  );
  mock.timers.enable({ apis: ["Date"] });
  try {
    parcheggiaSubDaIndirizzo("azioni", "approvare");
    mock.timers.tick(30000); // l'area ci ha messo mezzo minuto a comparire
    assert.equal(consumaSubPendente("azioni"), "approvare", "il link è scaduto prima che l'area arrivasse");
    assert.equal(consumaSubPendente("azioni"), null, "si consuma una volta sola");
    // Un sub parcheggiato NON è di tutti: un'altra area non se lo prende.
    parcheggiaSubDaIndirizzo("azioni", "approvare");
    assert.equal(consumaSubPendente("numeri"), null);
    // `ripristinaSub` senza window non deve rompere nulla (qui giriamo in Node).
    assert.doesNotThrow(() => ripristinaSub("azioni", "approvare"));
  } finally {
    mock.timers.reset();
  }
});
