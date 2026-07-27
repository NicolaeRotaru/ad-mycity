// AR-258 / AR-265 — le due regole della chat, eseguite davvero (node --test, nessuna rete).
//
// Sono in pannello/src/lib/chat-pending.ts come funzioni PURE e non dentro page.tsx (2.100+ righe di
// componente React) per un motivo pratico: lì dentro si potrebbero solo rileggere, mai eseguire in un
// test — la forma di prova debole che il 27/7 ha lasciato passare 91 chiusure false.
//
// Ogni caso qui sotto FALLISCE con la logica vecchia: è il metro che distingue il prima dal dopo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const LIB = join(QUI, "..", "..", "pannello/src/lib/chat-pending.ts");
const { pendingScaduto, separaPending, SOGLIA_PENDING_MS, messaggioAttesaScaduta, deveSpostareLaVista } =
  await import(LIB);

const ORA = 1_800_000_000_000; // istante finto, stabile
const p = (creatoIl, id = "L1", targetConvId = "convA") => ({ id, tipo: "chat", targetConvId, creatoIl });

// ── AR-258: «sto elaborando» non può girare per sempre ───────────────────────
test("un'attesa appena nata è viva", () => {
  assert.equal(pendingScaduto(p(ORA), ORA), false);
  assert.equal(pendingScaduto(p(ORA - 60_000), ORA), false, "un minuto fa: ancora in corso");
});

test("oltre la soglia l'attesa è dichiarata morta", () => {
  assert.equal(pendingScaduto(p(ORA - SOGLIA_PENDING_MS), ORA), true, "esattamente alla soglia");
  assert.equal(pendingScaduto(p(ORA - SOGLIA_PENDING_MS - 1), ORA), true);
  assert.equal(pendingScaduto(p(ORA - 24 * 60 * 60 * 1000), ORA), true, "di ieri");
});

test("il caso che ha rotto: le bolle SENZA data sono quelle eterne, e vanno chiuse", () => {
  // Prima del fix PendingChat non aveva alcun timestamp: sono esattamente le voci rimaste in
  // localStorage a far girare lo spinner all'infinito, anche dopo il riavvio del browser.
  assert.equal(pendingScaduto({ id: "vecchia", tipo: "chat", targetConvId: "convA" }, ORA), true);
  assert.equal(pendingScaduto(p(undefined), ORA), true);
  assert.equal(pendingScaduto(p(NaN), ORA), true, "una data non valida non tiene viva l'attesa");
});

test("un orologio spostato indietro non inventa una scadenza", () => {
  assert.equal(pendingScaduto(p(ORA + 60_000), ORA), false, "nata «nel futuro»: non la si dichiara morta");
});

test("separaPending divide senza perdere né duplicare nulla", () => {
  const lista = [p(ORA, "viva1"), p(ORA - SOGLIA_PENDING_MS - 1, "morta1"), p(undefined, "senzaData"), p(ORA - 1000, "viva2")];
  const { vive, scadute } = separaPending(lista, ORA);
  assert.deepEqual(vive.map((x) => x.id), ["viva1", "viva2"]);
  assert.deepEqual(scadute.map((x) => x.id), ["morta1", "senzaData"]);
  assert.equal(vive.length + scadute.length, lista.length, "nessuna voce persa");
  assert.equal(lista.length, 4, "l'ingresso non viene mutato");
});

test("la bolla scaduta lascia un messaggio che spiega, non sparisce in silenzio", () => {
  const m = messaggioAttesaScaduta(45);
  assert.match(m, /45 minuti/);
  assert.match(m, /Riprova/, "deve dire a Nicola cosa può fare");
});

// ── AR-265: la vista non torna indietro da sola ──────────────────────────────
test("se sei rimasto sulla stessa chat, la vista segue il salvataggio", () => {
  assert.equal(deveSpostareLaVista("convA", "convA"), true);
});

test("il caso che ha rotto: hai cambiato chat mentre aspettavi", () => {
  // Prima `setConvId(savedConv)` girava comunque: la vista tornava a convA mentre a schermo c'erano
  // i messaggi di convB, e la risposta finiva salvata sotto la conversazione sbagliata.
  assert.equal(deveSpostareLaVista("convB", "convA"), false, "sei su convB: non riportarti su convA");
  assert.equal(deveSpostareLaVista(null, "convA"), false, "nessuna chat aperta: non aprirne una da solo");
  assert.equal(deveSpostareLaVista(undefined, "convA"), false);
});

test("senza una chat di partenza non si sposta niente", () => {
  assert.equal(deveSpostareLaVista("convA", ""), false);
});
