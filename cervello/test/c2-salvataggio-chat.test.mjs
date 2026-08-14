// AR-400 — «la chat principale dice salvata anche quando il server non ha ricevuto niente».
//
// COSA ERA ROTTO. `persistConversazione` (dentro page.tsx) restituiva un id anche quando non aveva
// salvato niente: il ripiego locale `loc_…` — nato giusto, «meglio che perdere tutto» — tornava con
// lo STESSO tipo del successo. Nessuno dei dieci chiamanti poteva distinguerli, quindi la chat
// diceva «salvata» e cambiando dispositivo non c'era. Peggio: la rotta risponde `{ok:false, id:null}`
// con HTTP 200, quindi nemmeno guardare `res.ok` sarebbe bastato.
//
// La medicina era già in casa da lotti — `lib/esito-scrittura.ts`, `scritturaConfermata`, che
// pretende trasporto E corpo — ma era stata applicata a due punti piccoli e mai al più caro.
//
// COSA PROVA QUESTO TEST. Che la decisione «è davvero sul server?» adesso è una funzione pura
// (`esitoSalvataggioConversazione`) che passa da quel cancello, e che risponde `suServer:false`
// in ognuno dei modi reali in cui una scrittura non atterra.

import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

register("./risolvi-ts.mjs", import.meta.url);

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..", "..");
const { esitoSalvataggioConversazione } = await import(join(RADICE, "pannello/src/lib/pagina-stato.ts"));

const RIPIEGO = "loc_test1";

test("AR-400 · il server conferma e restituisce l'id ⇒ è sul server", () => {
  const e = esitoSalvataggioConversazione({
    idCorrente: null,
    memoriaCollegata: true,
    risposta: { ok: true, status: 200 },
    corpo: { ok: true, id: "srv_9" },
    idDiRipiego: RIPIEGO,
  });
  assert.deepEqual(e, { id: "srv_9", suServer: true });
});

test("AR-400 · IL DIFETTO: {ok:false} con HTTP 200 NON è una conferma", () => {
  // È la risposta vera della rotta quando la memoria non è collegata o il POST è fallito:
  // HTTP 200 con `{ok:false, id:null}`. Prima passava per un successo e la chat diceva «salvata».
  const e = esitoSalvataggioConversazione({
    idCorrente: null,
    memoriaCollegata: true,
    risposta: { ok: true, status: 200 },
    corpo: { ok: false, id: null },
    idDiRipiego: RIPIEGO,
  });
  assert.equal(e.suServer, false, "una scrittura non confermata non può dirsi salvata");
  assert.equal(e.id, RIPIEGO, "l'id di ripiego serve comunque: non si butta via la conversazione");
});

test("AR-400 · rete caduta ⇒ non è sul server, ma la chat non si perde", () => {
  const e = esitoSalvataggioConversazione({
    idCorrente: null,
    memoriaCollegata: true,
    risposta: null,
    corpo: undefined,
    idDiRipiego: RIPIEGO,
  });
  assert.deepEqual(e, { id: RIPIEGO, suServer: false });
});

test("AR-400 · errore del server (503) ⇒ non è sul server", () => {
  const e = esitoSalvataggioConversazione({
    idCorrente: "srv_1",
    memoriaCollegata: true,
    risposta: { ok: false, status: 503 },
    corpo: { ok: false },
    idDiRipiego: RIPIEGO,
  });
  assert.equal(e.suServer, false);
  assert.equal(e.id, "srv_1", "un aggiornamento fallito non deve cambiare l'id della conversazione");
});

test("AR-400 · memoria non collegata ⇒ lo si dice, non lo si nasconde", () => {
  // Il buco gemello segnalato nella scheda: con `convServer === false` l'id era locale e a schermo
  // non compariva nessun avviso.
  const e = esitoSalvataggioConversazione({
    idCorrente: null,
    memoriaCollegata: false,
    idDiRipiego: RIPIEGO,
  });
  assert.deepEqual(e, { id: RIPIEGO, suServer: false });
});

test("AR-400 · aggiornamento confermato senza id nel corpo ⇒ resta l'id di prima, sul server", () => {
  const e = esitoSalvataggioConversazione({
    idCorrente: "srv_1",
    memoriaCollegata: true,
    risposta: { ok: true, status: 200 },
    corpo: { ok: true },
    idDiRipiego: RIPIEGO,
  });
  assert.deepEqual(e, { id: "srv_1", suServer: true });
});

test("AR-400 · corpo vuoto o illeggibile non è una conferma", () => {
  for (const corpo of [{}, null, "", 42]) {
    const e = esitoSalvataggioConversazione({
      idCorrente: null,
      memoriaCollegata: true,
      risposta: { ok: true, status: 200 },
      corpo,
      idDiRipiego: RIPIEGO,
    });
    assert.equal(e.suServer, false, `corpo ${JSON.stringify(corpo)} non può valere come conferma`);
  }
});

test("AR-400 · il punto malato chiama davvero il cancello, e lo dice a schermo", () => {
  // La causa DI SISTEMA della scheda: la medicina esisteva e non era arrivata al punto più caro.
  // Qui si controlla che ci sia arrivata — e che l'esito finisca sotto gli occhi di Nicola invece
  // di restare una variabile.
  const pagina = readFileSync(join(RADICE, "pannello/src/app/page.tsx"), "utf8");
  assert.ok(
    pagina.includes("esitoSalvataggioConversazione("),
    "persistConversazione deve passare dalla funzione pura",
  );
  assert.ok(
    pagina.includes("setChatSoloLocale("),
    "l'esito deve accendere l'avviso a schermo, non restare dentro una variabile",
  );
  assert.ok(
    !/persistConversazione\([^)]*\): Promise<string \| null>/.test(pagina),
    "la firma deve restituire {id, suServer}: con string|null i chiamanti non possono distinguere",
  );
});
