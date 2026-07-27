// AR-110 — test del contratto di firma fra Pannello e cervello (node --test).
//
// Il difetto: il click «Approva» del Pannello registrava la decisione in Supabase, ma il cancello
// dell'esecutore (consensoInvio) cercava un marcatore APPROVATA dentro AZIONI-IN-ATTESA.md che
// nessuno scriveva mai. Due verità mai riconciliate → o l'azione firmata da Nicola degradava a
// DRY-RUN, o il worker si scriveva da solo il marcatore che il cancello poi verificava: cioè
// l'esecutore firmava se stesso.
//
// Qui si prova il contratto nuovo SENZA rete vera: un finto Supabase in ascolto su localhost
// risponde come la tabella `impostazioni`, e si verifica che il cancello apra SOLO sulla firma di
// Nicola — mai su quella dell'autopilota, mai senza firma.
//
// Nota di metodo: il cancello legge la coda VERA (nessun override del percorso — non si aggiunge
// una manopola a un modulo di sicurezza per comodità di test). Le prove usano quindi una casella
// reale della coda, presa a runtime: così si verifica anche che l'id calcolato dalla coda sia
// esattamente quello su cui il Pannello scrive la firma.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import {
  consensoInvio,
  blocchiCoda,
  leggiCoda,
  approvata,
  firmaPannello,
} from "../consenso-azione.mjs";

// Il finto Supabase: una mappa chiave→valore che risponde alle sole query che il cancello fa.
const memoria = new Map();
let server;

before(async () => {
  server = createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    const eq = url.searchParams.get("chiave") || "";
    const chiave = decodeURIComponent(eq.replace(/^eq\./, ""));
    const valore = memoria.get(chiave);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(valore === undefined ? [] : [{ valore }]));
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  process.env.SUPABASE_URL = `http://127.0.0.1:${server.address().port}`;
  process.env.SUPABASE_SERVICE_KEY = "finta-per-il-test";
  memoria.set("pausa", "off"); // kill-switch non premuto
});

after(() => server?.close());

// Una casella VERA della coda, non ancora firmata nel file: è il caso di tutti i giorni.
function casellaNonFirmata() {
  const b = blocchiCoda(leggiCoda()).find((x) => !approvata(x.blocco));
  assert.ok(b, "la coda deve contenere almeno una casella in attesa di firma");
  return b;
}

test("il finto Supabase risponde come la tabella impostazioni", async () => {
  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/impostazioni?select=valore&chiave=eq.pausa&limit=1`);
  assert.deepEqual(await r.json(), [{ valore: "off" }]);
  const vuoto = await fetch(`${process.env.SUPABASE_URL}/rest/v1/impostazioni?select=valore&chiave=eq.mai-scritta&limit=1`);
  assert.deepEqual(await vuoto.json(), [], "chiave assente → lista vuota, non un errore");
});

test("firmaPannello(): apre SOLO sulla firma di Nicola", async () => {
  memoria.set("azione:Stest:firma", "nicola 2026-07-25 09:12");
  let f = await firmaPannello("Stest");
  assert.equal(f.firmata, true, "la firma umana apre il cancello");
  assert.match(f.motivo, /firmata dal Pannello/);

  // ⬇️ Il punto che evita di aprire un buco invece di chiuderlo: l'autopilota del Pannello decide
  // da solo sulle 🟢 e scrive la stessa riga. NON deve valere come consenso di Nicola, altrimenti
  // bastava accendere l'autopilota per autorizzare un invio reale lanciato dalla CLI.
  memoria.set("azione:Stest:firma", "auto 2026-07-25 09:12");
  f = await firmaPannello("Stest");
  assert.equal(f.firmata, false, "la decisione dell'autopilota non è la firma di Nicola");
  assert.match(f.motivo, /non è di Nicola/);

  // Rifiutata/annullata dal Pannello → la firma viene svuotata.
  memoria.set("azione:Stest:firma", "");
  f = await firmaPannello("Stest");
  assert.equal(f.firmata, false, "firma revocata → niente consenso");
  assert.match(f.motivo, /nessuna firma/);

  // Chiave mai scritta.
  memoria.delete("azione:Stest:firma");
  f = await firmaPannello("Stest");
  assert.equal(f.firmata, false);
});

test("firmaPannello(): fail-closed se la memoria non è collegata", async () => {
  const url = process.env.SUPABASE_URL;
  process.env.SUPABASE_URL = "";
  const f = await firmaPannello("Squalunque");
  process.env.SUPABASE_URL = url;
  assert.equal(f.firmata, false, "senza memoria non si concede nulla");
  assert.match(f.motivo, /memoria non collegata/);
});

test("consensoInvio(): senza firma non parte niente, e il motivo dice perché", async () => {
  const blk = casellaNonFirmata();
  memoria.delete(`azione:${blk.id}:firma`);
  const r = await consensoInvio({ azioneId: blk.id, canale: "telegram", destinatario: "12345" });
  assert.equal(r.live, false);
  assert.match(r.motivo, /NON firmata da Nicola/);
  assert.match(r.motivo, /nessuna firma dal Pannello/, "il motivo deve nominare entrambe le strade mancanti");
});

test("consensoInvio(): la firma dal Pannello CHIUDE il percorso firma→esecuzione", async () => {
  const blk = casellaNonFirmata();
  // È esattamente ciò che scrive /api/azioni-pronte quando Nicola preme Approva.
  memoria.set(`azione:${blk.id}:firma`, "nicola 2026-07-25 09:12");
  const r = await consensoInvio({ azioneId: blk.id, canale: "telegram", destinatario: "12345" });
  assert.equal(r.live, true, "l'azione firmata da Nicola ora passa: prima degradava a DRY-RUN");
  assert.match(r.motivo, /firmata dal Pannello/);
  assert.match(r.motivo, new RegExp(blk.code.replace("#", "#")), "il motivo cita la casella giusta");
});

test("consensoInvio(): il codice casella #Axx funziona come l'id stabile", async () => {
  const blk = casellaNonFirmata();
  memoria.set(`azione:${blk.id}:firma`, "nicola 2026-07-25 09:12");
  // Nicola e l'AD parlano della casella col codice corto: la firma dev'essere trovata lo stesso,
  // perché la chiave si costruisce sull'id STABILE ricavato dal blocco, non sulla stringa passata.
  const r = await consensoInvio({ azioneId: blk.code, canale: "telegram", destinatario: "12345" });
  assert.equal(r.live, true);
});

test("consensoInvio(): l'autopilota non può firmare al posto di Nicola", async () => {
  const blk = casellaNonFirmata();
  memoria.set(`azione:${blk.id}:firma`, "auto 2026-07-25 09:12");
  const r = await consensoInvio({ azioneId: blk.id, canale: "telegram", destinatario: "12345" });
  assert.equal(r.live, false);
  assert.match(r.motivo, /non è di Nicola/);
});

test("consensoInvio(): la PAUSA batte la firma", async () => {
  const blk = casellaNonFirmata();
  memoria.set(`azione:${blk.id}:firma`, "nicola 2026-07-25 09:12");
  memoria.set("pausa", "on");
  const r = await consensoInvio({ azioneId: blk.id, canale: "telegram", destinatario: "12345" });
  memoria.set("pausa", "off");
  assert.equal(r.live, false, "il kill-switch ferma anche le azioni firmate");
  assert.match(r.motivo, /PAUSA/);
});

test("consensoInvio(): la firma non scavalca l'allowlist dei destinatari", async () => {
  const blk = casellaNonFirmata();
  memoria.set(`azione:${blk.id}:firma`, "nicola 2026-07-25 09:12");
  // mani-allowlist.json ha "email": [] → nessun indirizzo sbloccato.
  const r = await consensoInvio({ azioneId: blk.id, canale: "email", destinatario: "cliente@reale.it" });
  assert.equal(r.live, false, "firmata sì, ma il destinatario resta bloccato");
  assert.match(r.motivo, /allowlist/);
});

// ─────────────────────────────────────────────────────────────────────────────
// AR-205 — CHI ESEGUE NON PUÒ SCRIVERSI IL PERMESSO DI ESEGUIRE.
//
// Fino al 27/7 il cancello guardava PRIMA il marcatore dentro AZIONI-IN-ATTESA.md: se c'era, la firma
// vera del Pannello non veniva nemmeno letta. Ma quel marcatore lo scrive la macchina durante il
// lavoro normale dei senior — la parola «APPROVATA» in un titolo, una riga «Stato: approvato», una
// casella «[x] 🟡». Misurato sulla coda reale: 7 blocchi già «APPROVATA» e 14 caselle spuntate.
// Quindi l'esecutore poteva autorizzare se stesso.
/** Una casella che nel FILE risulta già marcata come approvata (senza che Nicola abbia cliccato). */
function casellaMarcataNelFile() {
  return blocchiCoda(leggiCoda()).find((x) => approvata(x.blocco));
}

test("il marcatore nel file NON vale più come firma (AR-205)", async (t) => {
  const blk = casellaMarcataNelFile();
  if (!blk) return t.skip("nessuna casella marcata in coda in questo momento: niente da provare");

  assert.equal(approvata(blk.blocco), true, "premessa: il file la dà per approvata");
  memoria.delete(`azione:${blk.id}:firma`); // ma Nicola non ha mai cliccato

  const r = await consensoInvio({ azioneId: blk.id, canale: "telegram", destinatario: "12345" });
  assert.equal(r.live, false, "con la logica vecchia questo passava: il testo nel file apriva il cancello");
  assert.match(r.motivo, /NON firmata da Nicola/);
  assert.match(r.motivo, /NON vale come firma/, "il motivo deve spiegare che il marcatore è documentazione, non permesso");
});

test("la stessa casella passa SE Nicola firma davvero dal Pannello", async (t) => {
  const blk = casellaMarcataNelFile();
  if (!blk) return t.skip("nessuna casella marcata in coda in questo momento");
  memoria.set(`azione:${blk.id}:firma`, "nicola 2026-07-27 13:30");
  const r = await consensoInvio({ azioneId: blk.id, canale: "telegram", destinatario: "12345" });
  assert.equal(r.live, true, "il fix non blocca il percorso legittimo: chiude solo l'autofirma");
});
