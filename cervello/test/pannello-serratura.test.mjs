// AR-226 — prova della SERRATURA sulle rotte che mutano stato (node --test, nessuna rete).
//
// Il difetto: 33 handler che modificano lo stato in 30 file di route, e uno solo con un controllo in
// ingresso. Nessun middleware. Un `curl -X POST` da qualunque parte del mondo poteva spegnere la
// PAUSA, accendere l'autopilota e — via /api/lavori — far eseguire istruzioni arbitrarie all'agente
// sul VPS.
//
// Qui si ESEGUE la funzione vera (pannello/src/lib/serratura.ts), non una sua riscrittura: la prima
// versione di questo test rifaceva la logica in JS, cioè provava un modello che poteva scostarsi dal
// codice — la stessa forma di prova debole che il 27/7 ha lasciato passare 91 chiusure false.
//
// ⚠️ Cosa questo NON prova: che uno sconosciuto non possa aprire il Pannello e usare i pulsanti.
// Quella è autenticazione e vive su Vercel (Deployment Protection). Vedi il commento in middleware.ts.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..", "..");
const SERRATURA = join(RADICE, "pannello/src/lib/serratura.ts");

// TypeScript eseguito da node con lo stripping dei tipi: la funzione è pura e non importa nulla,
// quindi gira così com'è. Se un domani qualcuno le mettesse dentro un import di Next, questo test
// smetterebbe di partire — ed è giusto: vorrebbe dire che la logica è tornata non provabile.
const { decidiAccesso, ESENTI } = await import(SERRATURA);

/** Scorciatoia: costruisce la richiesta e restituisce true/false. */
function ammessa({ metodo = "POST", percorso = "/api/lavori", header = {}, token = null }) {
  return decidiAccesso({ metodo, percorso, header, tokenAtteso: token }).ammessa;
}

test("il caso che ha rotto: curl senza header non può più mutare lo stato", () => {
  // È letteralmente `curl -X POST https://…/api/lavori`: nessun Origin, nessun Sec-Fetch-Site.
  assert.equal(ammessa({ percorso: "/api/lavori" }), false, "prima passava e faceva eseguire istruzioni sul VPS");
  assert.equal(ammessa({ percorso: "/api/controllo" }), false, "spegnere la PAUSA");
  assert.equal(ammessa({ percorso: "/api/azioni-pronte/autopilota" }), false, "accendere l'autopilota");
  assert.equal(ammessa({ percorso: "/api/esegui" }), false, "l'hub n8n");
  assert.equal(ammessa({ percorso: "/api/comando-vps" }), false, "i comandi al server");
});

test("il rifiuto spiega cosa fare, non dice solo di no", () => {
  const v = decidiAccesso({ metodo: "POST", percorso: "/api/lavori", header: {}, tokenAtteso: null });
  assert.equal(v.ammessa, false);
  assert.match(v.motivo, /modifica lo stato/);
  assert.match(v.dettaglio, /Authorization: Bearer/);
});

test("le letture VERE non sono toccate: il Pannello continua a mostrare tutto", () => {
  assert.equal(ammessa({ metodo: "GET", percorso: "/api/lavori" }), true);
  assert.equal(ammessa({ metodo: "HEAD", percorso: "/api/stato" }), true);
  assert.equal(ammessa({ metodo: "OPTIONS", percorso: "/api/lavori" }), true);
  assert.equal(ammessa({ metodo: "get", percorso: "/api/lavori" }), true, "il metodo minuscolo vale uguale");
});

test("AR-409 — una GET che SCRIVE non è una lettura: le serve lo stesso permesso di una POST", () => {
  // Questo caso, prima del lotto 33, diceva l'opposto: asseriva «GET sempre ammessa» e quindi
  // CERTIFICAVA il buco come comportamento corretto. Tre rotte usano la GET per innescare lavoro —
  // report accoda un lavoro, azioni-pronte chiude le card mentre le legge — e passavano libere.
  // Una prova che protegge il difetto è il modo più efficace di renderlo permanente.
  assert.equal(ammessa({ metodo: "GET", percorso: "/api/report", header: {} }), false, "?genera= accoda un lavoro vero");
  assert.equal(ammessa({ metodo: "GET", percorso: "/api/azioni-pronte", header: {} }), false, "chiude le card mentre le legge");

  // …e dal Pannello continuano a funzionare, perché la richiesta è same-origin.
  assert.equal(ammessa({ metodo: "GET", percorso: "/api/report", header: { "sec-fetch-site": "same-origin" } }), true);
  assert.equal(ammessa({ metodo: "GET", percorso: "/api/azioni-pronte", header: { "sec-fetch-site": "same-origin" } }), true);

  // Il battito resta ammesso perché è ESENTE con motivo: ha il proprio CRON_SECRET fail-closed.
  assert.equal(ammessa({ metodo: "GET", percorso: "/api/heartbeat", header: {} }), true);
});

test("AR-409/AR-226 — l'elenco delle rotte che scrivono non è scritto a mano: è misurato sul codice", async () => {
  const { scriveInLettura, SCRIVONO_IN_GET } = await import(join(QUI, "..", "..", "pannello/src/lib/rotte-scriventi.ts"));

  // La misura VERA su un file finto: la scrittura passa da una funzione locale, come nel codice
  // reale (`/api/report` chiama `accoda()`, che chiama `creaLavoro`). Fermarsi al corpo dell'handler
  // faceva vedere una rotta scrivente su tre.
  const finto = `
    import { creaLavoro } from "@/lib/store";
    async function accoda(t) { return creaLavoro(t, "report"); }
    export async function GET(req) { const g = q(req); if (g) { await accoda(g); } return ok(); }
  `;
  assert.deepEqual(scriveInLettura(finto), ["creaLavoro"], "la scrittura indiretta va vista");

  // Una GET che legge davvero non deve finire nell'elenco: un guardiano che accusa gli innocenti
  // viene spento entro la settimana, e allora non prende più nemmeno il caso vero.
  assert.deepEqual(scriveInLettura(`export async function GET() { return leggi(); }`), []);

  // Una scrittura NOMINATA in un commento non è una scrittura.
  assert.deepEqual(scriveInLettura(`export async function GET() { /* qui NON si fa creaLavoro( */ return x(); }`), []);

  // Ogni voce dichiarata porta il suo perché: un'esenzione senza motivo è il silenzio che curiamo.
  for (const r of SCRIVONO_IN_GET) assert.ok(r.perche.length > 30, `${r.path} senza un perché di sostanza`);
});

test("l'interfaccia del Pannello continua a funzionare (same-origin)", () => {
  // Quello che manda il browser quando la pagina chiama la propria API.
  assert.equal(ammessa({ header: { "sec-fetch-site": "same-origin" } }), true);
  assert.equal(ammessa({ header: { "sec-fetch-site": "none" } }), true, "navigazione diretta dell'utente");
  // Browser vecchi senza Sec-Fetch-*: ripiego su Origin che combacia con Host.
  assert.equal(ammessa({ header: { origin: "https://pannello.test", host: "pannello.test" } }), true);
});

test("una pagina di un altro sito non può far partire una POST (CSRF)", () => {
  assert.equal(ammessa({ percorso: "/api/controllo", header: { "sec-fetch-site": "cross-site" } }), false);
  assert.equal(ammessa({ percorso: "/api/controllo", header: { "sec-fetch-site": "same-site" } }), false);
  assert.equal(
    ammessa({ percorso: "/api/controllo", header: { origin: "https://sito-cattivo.example", host: "pannello.test" } }),
    false,
  );
  assert.equal(ammessa({ header: { origin: "non-un-url", host: "pannello.test" } }), false, "Origin malformato non passa");
});

test("le chiamate macchina passano SOLO col token, e solo se è configurato", () => {
  assert.equal(ammessa({ header: { authorization: "Bearer giusto" }, token: "giusto" }), true);
  assert.equal(ammessa({ header: { "x-pannello-token": "giusto" }, token: "giusto" }), true, "anche l'header dedicato");
  assert.equal(ammessa({ header: { authorization: "Bearer SBAGLIATO" }, token: "giusto" }), false);
  assert.equal(ammessa({ header: { authorization: "Bearer gius" }, token: "giusto" }), false, "prefisso corretto non basta");
  // Token non configurato ⇒ nessuna chiamata macchina è ammessa: fail-closed, non fail-open.
  assert.equal(ammessa({ header: { authorization: "Bearer qualunque" }, token: null }), false);
  assert.equal(ammessa({ header: { authorization: "Bearer qualunque" }, token: "" }), false);
});

test("l'esenzione dell'heartbeat è una sola, dichiarata e motivata", () => {
  assert.equal(ammessa({ percorso: "/api/heartbeat" }), true, "cron esterno, ha il suo CRON_SECRET");
  assert.deepEqual(
    ESENTI.map((e) => e.path),
    ["/api/heartbeat"],
    "se qualcuno aggiunge un'esenzione, questo test lo dice",
  );
  for (const e of ESENTI) assert.ok(e.perche && e.perche.length > 20, `l'esenzione ${e.path} deve portare il motivo scritto`);
});

// AR-227 — la porta che firmava al posto di Nicola non esiste più.
// /api/approva scriveva `azione:<id>:firma = "nicola …"`, cioè esattamente il valore che il cancello
// di consenso accetta come consenso umano per l'invio LIVE — e non aveva un solo chiamante nel
// Pannello: esisteva solo come porta. La firma legittima passa da /api/azioni-pronte, al clic.
test("la porta che firmava al posto di Nicola è stata rimossa (AR-227)", () => {
  assert.equal(
    existsSync(join(RADICE, "pannello/src/app/api/approva/route.ts")),
    false,
    "/api/approva scriveva la firma di Nicola senza che Nicola toccasse nulla",
  );
  // E la strada legittima è ancora al suo posto: il fix non ha rotto l'approvazione dal Pannello.
  const pronte = readFileSync(join(RADICE, "pannello/src/app/api/azioni-pronte/route.ts"), "utf8");
  assert.match(pronte, /registraFirma\(/, "l'approvazione vera dal Pannello continua a firmare");
});

test("non esiste una variabile che spenga la serratura", () => {
  // Un cancello che si può spegnere è il difetto che la radiografia ha trovato dappertutto.
  const sorgente = readFileSync(SERRATURA, "utf8") + readFileSync(join(RADICE, "pannello/src/middleware.ts"), "utf8");
  assert.doesNotMatch(sorgente, /PANNELLO_APERTO|DISABLE_AUTH|SKIP_MIDDLEWARE|MIDDLEWARE_OFF|AUTH_DISABILITATA/i);
});
