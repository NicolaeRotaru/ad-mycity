// AR-207 · AR-112 · AR-234 — le porte del Pannello devono stare tutte dentro il confine.
//
// Il guardiano delle porte esisteva già (`porte-check.mjs`) e copriva UNA superficie sola: i push da
// shell. Le 29 route HTTP che mutano lo stato — spegnere la pausa, accendere l'autopilota, dare
// ordini al worker — nascevano fuori dal suo sguardo. AR-207 chiede letteralmente «un controllo che
// elenca tutte le rotte che scrivono e fallisce se una non richiama il cancello: la regola vale
// sulla superficie, non sulla singola porta».
//
// Questi test ESEGUONO il censimento su superfici finte, comprese quelle che nel repo non esistono
// (ancora): è l'unico modo di provare che il guardiano SUONA, invece di constatare che oggi è verde.
// Un guardiano provato solo sullo stato attuale del repo è verde per fortuna, non per costruzione.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  coperto,
  esenzioniDichiarate,
  handlerCheMutano,
  matcherDelMiddleware,
  percorsoUrl,
  porteScoperte,
} from "../porte-pannello.mjs";

test("riconosce quali handler mutano lo stato e quali leggono", () => {
  assert.deepEqual(handlerCheMutano("export async function GET() {}"), []);
  assert.deepEqual(handlerCheMutano("export async function POST(req) {}"), ["POST"]);
  assert.deepEqual(
    handlerCheMutano("export async function POST(r) {}\nexport async function DELETE(r) {}"),
    ["POST", "DELETE"]
  );
  // La forma con `const` esiste in Next e conta uguale: una porta è una porta.
  assert.deepEqual(handlerCheMutano("export const PUT = handler;"), ["PUT"]);
});

test("calcola il percorso URL servito da un file di route", () => {
  assert.equal(percorsoUrl("api/controllo/route.ts"), "/api/controllo");
  assert.equal(percorsoUrl("api/lavori/[id]/route.ts"), "/api/lavori/[id]");
  // I gruppi fra parentesi non compaiono nell'URL: contarli sposterebbe la porta fuori dal matcher
  // e produrrebbe un allarme falso — e un guardiano che grida al lupo viene spento.
  assert.equal(percorsoUrl("(dashboard)/api/x/route.ts"), "/api/x");
});

test("legge il matcher dal middleware, e l'assenza NON vale come copertura", () => {
  assert.deepEqual(matcherDelMiddleware('export const config = { matcher: ["/api/:path*"] };'), ["/api/:path*"]);
  assert.equal(matcherDelMiddleware("export const config = {};"), null);
});

test("sa dire cosa ricade sotto il matcher", () => {
  const schemi = ["/api/:path*"];
  assert.equal(coperto("/api/controllo", schemi), true);
  assert.equal(coperto("/api/lavori/annulla", schemi), true);
  assert.equal(coperto("/api", schemi), true);
  // Una route fuori da /api non è coperta dal middleware: è il buco che il censimento deve vedere.
  assert.equal(coperto("/webhook", schemi), false);
});

test("SUONA per una porta che muta fuori dal confine", () => {
  // È il caso di AR-112/AR-234 riprodotto: una route capace di POST che nessun middleware guarda.
  const route = [
    { file: "x/route.ts", percorso: "/api/controllo", muta: ["POST"] },
    { file: "y/route.ts", percorso: "/webhook-esterno", muta: ["POST"] },
    { file: "z/route.ts", percorso: "/api/metriche", muta: [] },
  ];
  const fuori = porteScoperte(route, ["/api/:path*"], []);
  assert.equal(fuori.length, 1, "doveva vedere esattamente la porta fuori da /api");
  assert.equal(fuori[0].percorso, "/webhook-esterno");
  assert.match(fuori[0].motivo, /fuori dal matcher/);
});

test("una porta che legge e basta non è mai un problema", () => {
  const route = [{ file: "r/route.ts", percorso: "/qualunque/cosa", muta: [] }];
  assert.deepEqual(porteScoperte(route, ["/api/:path*"], []), []);
});

test("un'esenzione senza il perché scritto è essa stessa una porta scoperta", () => {
  // «Un'esenzione senza motivo è un silenzio» — ed è la forma di difetto che questo lotto cura.
  const route = [{ file: "h/route.ts", percorso: "/api/heartbeat", muta: ["POST"] }];
  const conMotivo = [{ path: "/api/heartbeat", perche: "già coperta da CRON_SECRET" }];
  const senzaMotivo = [{ path: "/api/heartbeat", perche: "" }];

  assert.deepEqual(porteScoperte(route, ["/api/:path*"], conMotivo), []);
  assert.equal(porteScoperte(route, ["/api/:path*"], senzaMotivo).length, 1);
});

test("legge le esenzioni vere della serratura, col loro perché", () => {
  const testo = `
export const ESENTI: { path: string; perche: string }[] = [
  { path: "/api/heartbeat", perche: "protetta da CRON_SECRET" },
];
`;
  const e = esenzioniDichiarate(testo);
  assert.equal(e.length, 1);
  assert.equal(e[0].path, "/api/heartbeat");
  assert.ok(e[0].perche.length > 0);
});

test("AR-234 — la porta morta verso l'automazione non esiste più", async () => {
  // «È rimasta viva una porta che spara un'azione all'automazione senza lasciare traccia.»
  // Verificato prima di cancellare: la UI non la chiamava più (Azioni.tsx la dice «binario morto»)
  // e `lib/azioni.ts` non aveva altri utilizzatori. In produzione «non chiamata dalla UI» non
  // significa «non raggiungibile», ed è tutto il punto del difetto.
  const { existsSync } = await import("node:fs");
  const { join, dirname } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");
  assert.equal(existsSync(join(REPO, "pannello/src/app/api/esegui/route.ts")), false, "la route è tornata");
  assert.equal(existsSync(join(REPO, "pannello/src/lib/azioni.ts")), false, "il modulo dietro la route è tornato");
});
