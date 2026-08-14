#!/usr/bin/env node
// AR-443 — «se la coda delle azioni non si riesce a leggere, il cancello dice AZIONE NON TROVATA».
//
// `leggiCoda()` aveva un `catch { return "" }`: qualunque motivo per cui AZIONI-IN-ATTESA.md non si
// legge — non c'è, permessi, è una cartella, il disco è pieno — diventava una coda vuota. Da lì il
// cancello concludeva «AZIONE_ID "#A42" non trovato in AZIONI-IN-ATTESA.md → invio bloccato».
//
// La direzione era GIUSTA: niente parte, fail-closed. È la motivazione a essere falsa, ed è per
// questo che il difetto non era nel lotto dei blocchi mancanti. Chi legge quel messaggio va a
// cercare una card che magari c'è, e non va mai a guardare il file che non si apre. Un cancello che
// sbaglia il motivo insegna a diffidare del motivo — e il giorno in cui il motivo è vero, non lo
// crede più nessuno.
//
// Qui la prova non cerca parole: rende la coda ILLEGGIBILE per davvero e guarda cosa risponde il
// cancello vero, con una memoria finta che dice «pausa off» e «firmata da Nicola».

import { createServer } from "node:http";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";

const casi = [];
const prova = async (nome, fn) => {
  try {
    await fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

const dir = mkdtempSync(join(tmpdir(), "ar443-"));

/**
 * Carica una copia fresca del cancello con la coda puntata dove vogliamo. Il percorso della coda è
 * una costante di modulo: la query nell'import serve a ottenerne un'istanza nuova, così due
 * scenari diversi vivono nello stesso processo senza mentirsi a vicenda.
 */
let n = 0;
async function cancelloCon(codaPath) {
  process.env.AZIONI_CODA_FILE = codaPath;
  return import(`../consenso-azione.mjs?scenario=${n++}`);
}

// ── Una memoria finta: pausa off, e la firma di Nicola su qualunque azione ────
const firme = new Map();
const server = createServer((req, res) => {
  res.setHeader("content-type", "application/json");
  if (req.url.includes("chiave=eq.pausa")) return res.end("[]"); // pausa off
  const m = req.url.match(/chiave=eq\.([^&]+)/);
  const chiave = m ? decodeURIComponent(m[1]) : "";
  const valore = firme.get(chiave);
  res.end(JSON.stringify(valore ? [{ valore }] : []));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
process.env.SUPABASE_URL = `http://127.0.0.1:${server.address().port}`;
process.env.SUPABASE_SERVICE_KEY = "finta-di-prova";

// ── La lettura: vuoto e illeggibile devono diventare due cose diverse ─────────
await prova("un file che non si apre torna null; un file davvero vuoto torna la stringa vuota", async () => {
  const mancante = join(dir, "non-esiste.md");
  const vuoto = join(dir, "vuota.md");
  writeFileSync(vuoto, "");

  const a = await cancelloCon(mancante);
  assert.equal(a.leggiCoda(), null, "una coda che non si legge non può travestirsi da coda vuota");
  assert.match(a.leggiCodaConMotivo().perche, /ENOENT/, "e deve dire PERCHÉ non si legge, o chi indaga resta a mani vuote");

  const b = await cancelloCon(vuoto);
  assert.equal(b.leggiCoda(), "", "una coda vuota per davvero resta vuota: non è un guasto");
  assert.equal(b.leggiCodaConMotivo().perche, "");
});

await prova("una cartella al posto del file è illeggibile, non vuota", async () => {
  // Il caso che l'ENOENT da solo non copre: il percorso c'è, ma non è un file.
  const cartella = join(dir, "coda-cartella.md");
  mkdirSync(cartella, { recursive: true });
  const c = await cancelloCon(cartella);
  assert.equal(c.leggiCoda(), null, "EISDIR è un «non ho potuto leggere» come gli altri");
});

// ── La decisione, eseguita da sola ───────────────────────────────────────────
await prova("la ricerca ha tre esiti: trovata · cercata e assente · non cercabile", async () => {
  const { cercaInCoda, idSezione, codiceAzione } = await cancelloCon(join(dir, "vuota.md"));

  const cieca = cercaInCoda(null, "#A42", "EACCES su /coda.md");
  assert.equal(cieca.blocco, null, "resta fail-closed: senza coda non parte niente");
  assert.equal(cieca.leggibile, false);
  assert.match(cieca.motivo, /NON leggibile/i, "il motivo deve dire che il file non si è aperto");
  assert.match(cieca.motivo, /EACCES/, "e deve portarsi dietro il motivo tecnico, per chi va a guardare");
  assert.ok(!/non trovato/i.test(cieca.motivo), "la frase che manda a cercare la card sbagliata non deve più uscire qui");

  const assente = cercaInCoda("", "#A42");
  assert.equal(assente.leggibile, true, "una coda letta e vuota È stata letta");
  assert.match(assente.motivo, /non trovato/i, "e allora «non trovato» è la verità: va detta");

  const id = idSezione("2026-08-13 10:00", "tech", "Prova del cancello");
  const md = "## 2026-08-13 10:00 · @tech · 🟡 Prova del cancello\ncorpo\n";
  const trovata = cercaInCoda(md, codiceAzione(id));
  assert.ok(trovata.blocco, "la card che c'è si deve continuare a trovare");
  assert.equal(trovata.motivo, "");
});

// ── Il cancello vero, end-to-end ─────────────────────────────────────────────
await prova("col file illeggibile il cancello blocca E dice che il problema è il file", async () => {
  const { consensoInvio } = await cancelloCon(join(dir, "sparita.md"));
  const r = await consensoInvio({ azioneId: "#A42", canale: "telegram", destinatario: "123" });
  assert.equal(r.live, false, "fail-closed: questo non è mai cambiato e non deve cambiare");
  assert.match(r.motivo, /NON leggibile/i, `il cancello racconta ancora la storia sbagliata: «${r.motivo}»`);
  assert.match(r.motivo, /guarda il file/i, "deve mandare chi indaga nel posto giusto");
});

await prova("con la coda leggibile e la card assente il motivo torna a essere «non trovato»", async () => {
  const coda = join(dir, "senza-card.md");
  writeFileSync(coda, "# Azioni in attesa\n\n(nessuna)\n");
  const { consensoInvio } = await cancelloCon(coda);
  const r = await consensoInvio({ azioneId: "#A42", canale: "telegram", destinatario: "123" });
  assert.equal(r.live, false);
  assert.match(r.motivo, /non trovato/i, "quando la coda si legge davvero, «non trovato» è il motivo vero");
  assert.ok(!/NON leggibile/i.test(r.motivo), "e non deve accusare il file quando il file sta benissimo");
});

await prova("e la strada buona resta aperta: card in coda + firma di Nicola = invio autorizzato", async () => {
  // È la metà che protegge dal fix troppo zelante: un cancello che blocca sempre non è più sicuro,
  // è solo rotto in un modo che nessuno misura finché non serve mandare qualcosa.
  const coda = join(dir, "con-card.md");
  writeFileSync(coda, "## 2026-08-13 10:00 · @tech · 🟡 Prova del cancello\ncorpo\n");
  const mod = await cancelloCon(coda);
  const id = mod.idSezione("2026-08-13 10:00", "tech", "Prova del cancello");
  firme.set(`azione:${id}:firma`, "nicola 2026-08-13 10:05");
  const r = await mod.consensoInvio({ azioneId: mod.codiceAzione(id), canale: "telegram", destinatario: "123" });
  assert.equal(r.live, true, `il consenso firmato non passa più: «${r.motivo}»`);
});

server.close();
rmSync(dir, { recursive: true, force: true });

let ko = 0;
for (const c of casi) {
  console.log(`  ${c.ok ? "ok" : "NOT ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) ko++;
}
console.log(`# pass ${casi.length - ko}\n# fail ${ko}`);
process.exit(ko ? 1 : 0);
