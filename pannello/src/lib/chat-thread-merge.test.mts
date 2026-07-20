import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mergeThreadMsgs,
  normalizzaThread,
  PLACEHOLDER_ALLEGATI,
  userContentDaRichiesta,
  userMessagesEquivalent,
} from "./chat-thread-merge.ts";

test("allegato-only: placeholder e 📎 sono lo stesso turno", () => {
  assert.ok(
    userMessagesEquivalent(PLACEHOLDER_ALLEGATI, "📎 Screenshot_20260720_231836_GitHub.jpg"),
  );
});

test("normalizzaThread: collassa doppio turno allegato + risposta duplicata", () => {
  const risposta = "Nicola ha allegato uno screenshot GitHub senza testo.";
  const sporco = [
    { role: "user" as const, content: PLACEHOLDER_ALLEGATI },
    { role: "assistant" as const, content: risposta },
    { role: "user" as const, content: "📎 Screenshot_20260720_231836_GitHub.jpg" },
    { role: "assistant" as const, content: risposta },
  ];
  const pulito = normalizzaThread(sporco);
  assert.equal(pulito.length, 2);
  assert.equal(pulito[0].role, "user");
  assert.ok(pulito[0].content.includes("📎 Screenshot"));
  assert.equal(pulito[1].content, risposta);
});

test("mergeThreadMsgs: DB + Lavori → un solo scambio", () => {
  const risposta = "Risposta unica dell'AD.";
  const daDb = [
    { role: "user" as const, content: "📎 foto.jpg" },
    { role: "assistant" as const, content: risposta },
  ];
  const daLavori = [
    { role: "user" as const, content: PLACEHOLDER_ALLEGATI },
    { role: "assistant" as const, content: risposta },
  ];
  const fuso = mergeThreadMsgs(daDb, daLavori);
  assert.equal(fuso.length, 2);
  assert.ok(fuso[0].content.includes("📎 foto.jpg"));
  assert.equal(fuso[1].content, risposta);
});

test("userContentDaRichiesta: estrae nomi allegato dal blocco @ALLEGATO", () => {
  const richiesta =
    "## Nuovo messaggio di Nicola\n" +
    PLACEHOLDER_ALLEGATI +
    "\n\n## Allegati di Nicola\n@ALLEGATO nome=\"foto.jpg\" tipo=\"image/jpeg\" percorso=\"x\"";
  const bolla = userContentDaRichiesta(richiesta);
  assert.ok(bolla.includes("📎 foto.jpg"));
  assert.ok(!bolla.includes(PLACEHOLDER_ALLEGATI) || bolla === PLACEHOLDER_ALLEGATI);
});
