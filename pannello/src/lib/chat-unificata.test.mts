// AR-123 — aprire «Parla con questa casella» non deve cancellare la chat aperta nell'Assistente.
//
// Il bug, riprodotto nel browser il 25/7 prima del fix: chat del Worker con 2 messaggi → click su
// «💬 Parla con questa casella» di una casella mai usata → riapro il Worker → vuota.
// La causa è nel protocollo, non nel componente: al primo istante quella casella ha msgs=[] e
// convId=null, e pubblicarlo significa dire «la chat attiva adesso è questa (vuota)». Chi ascolta
// si allinea e si svuota.
//
// Qui si prova la funzione VERA (Node esegue i .ts con type-stripping). Serve un `window`: gliene
// diamo uno finto, così il test gira senza browser. La riproduzione end-to-end col Pannello vivo
// resta il driver Playwright — questo test è la rete che impedisce il ritorno del bug.

import { test } from "node:test";
import assert from "node:assert/strict";

(globalThis as unknown as { window: EventTarget }).window = new EventTarget();

const { pubblicaChatUnificata, ascoltaChatUnificata } = await import("./chat-unificata.ts");

type Det = { convId: string | null; titolo: string; messaggi: Array<{ role: "user" | "assistant"; content: string }> };

/** Raccoglie ciò che l'Assistente riceve mentre gira `azione`. */
function ascoltaComeAssistente(azione: () => void): Det[] {
  const ricevuti: Det[] = [];
  const stop = ascoltaChatUnificata("assistente", (d) => ricevuti.push(d as Det));
  try {
    azione();
  } finally {
    stop();
  }
  return ricevuti;
}

test("AR-123: aprire una casella MAI usata non tocca la chat dell'Assistente", () => {
  // È il gesto esatto del bug: al primo istante la casella non ha né messaggi né conversazione.
  const ricevuti = ascoltaComeAssistente(() =>
    pubblicaChatUnificata({ convId: null, titolo: "💬 Bacheca: burn mensile", messaggi: [] }, "casella"),
  );
  assert.deepEqual(ricevuti, [], "una casella vuota non ha una conversazione da imporre all'Assistente");
});

test("una casella con una conversazione VERA la condivide ancora (il fix non spegne la funzione)", () => {
  const ricevuti = ascoltaComeAssistente(() =>
    pubblicaChatUnificata(
      { convId: "77", titolo: "💬 Azione: chiudere il blocco", messaggi: [{ role: "user", content: "ciao" }] },
      "casella",
    ),
  );
  assert.equal(ricevuti.length, 1, "il thread pieno deve arrivare all'Assistente");
  assert.equal(ricevuti[0].titolo, "💬 Azione: chiudere il blocco");
});

test("una conversazione che ESISTE ma è ancora senza messaggi passa: il rifiuto è «niente da dire», non «zero messaggi»", () => {
  const ricevuti = ascoltaComeAssistente(() =>
    pubblicaChatUnificata({ convId: "88", titolo: "💬 Nuova", messaggi: [] }, "casella"),
  );
  assert.equal(ricevuti.length, 1, "con un convId il thread esiste, anche se non ha ancora righe");
});

test("nessuno riceve i propri eventi (altrimenti le due superfici si rincorrono)", () => {
  const ricevuti: Det[] = [];
  const stop = ascoltaChatUnificata("casella", (d) => ricevuti.push(d as Det));
  pubblicaChatUnificata({ convId: "99", titolo: "💬 Eco", messaggi: [{ role: "user", content: "x" }] }, "casella");
  stop();
  assert.deepEqual(ricevuti, []);
});
