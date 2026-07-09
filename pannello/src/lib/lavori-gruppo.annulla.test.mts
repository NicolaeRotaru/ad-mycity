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

test("messaggio di chat annullato → '🚫 Messaggio annullato.'", () => {
  const msgs = messaggiDaLavoro(lav({ stato: "annullato", richiesta: "domanda", risultato: "" }));
  const ultimo = msgs[msgs.length - 1];
  assert.equal(ultimo.role, "assistant");
  assert.equal(ultimo.content, "🚫 Messaggio annullato.");
  // Non deve trapelare un vecchio risultato dopo l'annullo:
  assert.ok(!msgs.some((m) => m.role === "assistant" && m.content !== "🚫 Messaggio annullato."));
});

test("annullato NON mostra un risultato residuo anche se presente", () => {
  const msgs = messaggiDaLavoro(lav({ stato: "annullato", risultato: "RISPOSTA VECCHIA che non deve apparire" }));
  assert.ok(!msgs.some((m) => m.content?.includes("RISPOSTA VECCHIA")));
  assert.equal(msgs[msgs.length - 1].content, "🚫 Messaggio annullato.");
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
