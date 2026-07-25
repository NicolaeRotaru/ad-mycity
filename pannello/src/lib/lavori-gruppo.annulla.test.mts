// Test runtime (node --test) delle funzioni PURE toccate dall'annullo lavori.
// Importa la VERA sorgente (Node 24 esegue i .ts con type-stripping). Nessun DB, nessuna rete.
import { test } from "node:test";
import assert from "node:assert/strict";
import { messaggiDaLavoro, raggruppaLavori, type LavoroBase } from "./lavori-gruppo.ts";

function lav(p: Partial<LavoroBase>): LavoroBase {
  return {
    id: p.id ?? "x",
    created_at: p.created_at ?? "2026-07-09T10:00:00Z",
    updated_at: p.updated_at ?? "2026-07-09T10:00:00Z",
    stato: p.stato ?? "in_attesa",
    tipo: p.tipo ?? "chat",
    richiesta: p.richiesta ?? "ciao",
    risultato: p.risultato,
    gruppo_id: p.gruppo_id,
    ...p,
  } as LavoroBase;
}

// ─────────────────────────────────────────────────────────────────────────────
// AGGIORNATO IL 25/7 (AR-156). Queste due prove pretendevano che un lavoro annullato chiudesse
// con «🚫 Messaggio annullato.». Non è più il comportamento voluto, ed è NICOLA ad averlo
// corretto: il 18/7 alle 02:26 ha mostrato due volte lo screenshot in cui quel testo compariva
// AL POSTO della risposta che stava leggendo. Il fix (commit bba5495d) ha tolto la riga, e la
// lezione registrata è «ciò che Nicola ha già letto non si cancella» (DECISIONI.md 18/7 02:26).
//
// Il test era del 9/7 e non è mai stato aggiornato — perché nessuno lo lanciava, e perché non
// PARTIVA nemmeno (import senza estensione, vedi cervello/test/risolvi-ts.mjs). Il codice è
// andato avanti da solo per una settimana con una prova ferma a prima della correzione.
//
// Cosa resta vero e va protetto: dopo un annullo NON deve trapelare nessuna risposta — né una
// vecchia né una nuova. Quello lo verifichiamo ancora, ed è la parte che conta davvero.
//
// Una richiesta come la scrivono davvero page.tsx / ChatCasella / parla-shared: il testo di Nicola
// vive sotto l'intestazione. La fixture vecchia passava "domanda" nudo — una forma che in
// produzione non esiste — e il test finiva per misurare un caso immaginario.
const richiestaVera = (testo: string) => `## Contesto\ncasella X\n\n## Nuovo messaggio di Nicola\n${testo}`;

test("annullato: nessuna risposta appare al posto di quella che Nicola sta leggendo", () => {
  const msgs = messaggiDaLavoro(lav({ stato: "annullato", richiesta: richiestaVera("domanda"), risultato: "" }));
  // Resta solo il turno di Nicola: la macchina non aggiunge niente di suo.
  assert.deepEqual(msgs.map((m) => m.role), ["user"]);
  assert.equal(msgs[0].content, "domanda");
  assert.ok(!msgs.some((m) => m.content?.includes("annullato")), "niente marcatore che copra la vista");
});

test("annullato NON mostra un risultato residuo anche se presente", () => {
  const msgs = messaggiDaLavoro(lav({ stato: "annullato", risultato: "RISPOSTA VECCHIA che non deve apparire" }));
  assert.ok(!msgs.some((m) => m.content?.includes("RISPOSTA VECCHIA")));
  assert.ok(!msgs.some((m) => m.role === "assistant"), "un lavoro annullato non produce risposte");
});

test("gruppo tutto annullato → NON attivo (haAttivo false): lascia la corsia coda", () => {
  const gruppi = raggruppaLavori([
    lav({ id: "a", gruppo_id: "g1", stato: "annullato" }),
    lav({ id: "b", gruppo_id: "g1", stato: "annullato" }),
  ]);
  assert.equal(gruppi.length, 1);
  assert.equal(gruppi[0].haAttivo, false);
});

test("gruppo con un lavoro ancora vivo → resta attivo (haAttivo true)", () => {
  const gruppi = raggruppaLavori([
    lav({ id: "a", gruppo_id: "g2", stato: "annullato" }),
    lav({ id: "b", gruppo_id: "g2", stato: "in_attesa" }),
  ]);
  assert.equal(gruppi[0].haAttivo, true);
});

// Replica dei filtri di Lavori.tsx (inline, non esportati) per fissarne il contratto:
// coda = in_attesa|in_corso|errore ; archivio = fatto|annullato. Nessuna sovrapposizione.
test("filtri corsie: annullato va SOLO in archivio, mai in coda", () => {
  const inCoda = (s: string) => s === "in_attesa" || s === "in_corso" || s === "errore";
  const inArchivio = (s: string) => s === "fatto" || s === "annullato";
  assert.equal(inCoda("annullato"), false);
  assert.equal(inArchivio("annullato"), true);
  for (const s of ["in_attesa", "in_corso", "fatto", "errore", "annullato"]) {
    assert.equal(inCoda(s) && inArchivio(s), false, `stato ${s} non deve stare in due corsie`);
  }
});
