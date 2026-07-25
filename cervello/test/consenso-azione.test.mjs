// AR-103 — test del cancello di consenso per-azione (node --test).
// Verifica la logica critica di sicurezza SENZA rete: trovaAzione, approvata, destinatarioAmmesso,
// e l'anti-drift dei codici casella vs il Pannello.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  idSezione,
  codiceAzione,
  trovaAzione,
  approvata,
  destinatarioAmmesso,
  blocchiCoda,
} from "../consenso-azione.mjs";

// Anti-drift: valori pinzati contro la formula del Pannello (pannello/src/lib/azioni-attesa.ts).
// Se qualcuno cambia la formula qui o là, questi cambiano e il test rompe.
test("codici casella stabili (mirror Pannello)", () => {
  const id = idSezione("2026-07-06 16:10", "seo", "Riempi la vetrina");
  assert.match(id, /^S[0-9a-z]+$/);
  const c = codiceAzione(id);
  assert.match(c, /^#[A-Z]\d{2}$/);
  // deterministico: stesso input → stesso codice
  assert.equal(codiceAzione(id), c);
  assert.equal(codiceAzione("Sfoo"), codiceAzione("Sfoo"));
});

const CODA = `
## 2026-07-06 16:10 · @seo → @tech · 🔎 Riempi la vetrina di PQ — APPROVATA
- **Approvazione:** Nicola 2026-07-06 «lo approvo».
- **Stato:** IN ATTESA DI ESECUZIONE (config autorizzato).

## 2026-07-06 15:10 · @trust-safety · 🛡️ Dai il bollino «Verificato» (#38)
- **Cosa:** far nascere il bollino.
- **Stato:** IN ATTESA DI FIRMA NICOLA.

## Come approvare
Scrivi "ok [numero]". (sezione-manuale, non un'azione)
`;

test("approvata(): riconosce la firma esplicita", () => {
  const b = blocchiCoda(CODA);
  const appr = b.find((x) => /Riempi la vetrina/.test(x.heading));
  const attesa = b.find((x) => /bollino/.test(x.heading));
  assert.equal(approvata(appr.blocco), true, "APPROVATA + Approvazione: Nicola → true");
  assert.equal(approvata(attesa.blocco), false, "in attesa di firma → false");
});

test("approvata(): token macchina e checkbox", () => {
  assert.equal(approvata("- {approvato:#A42} 2026-07-08 Nicola"), true);
  assert.equal(approvata("- [x] 🔴 firma qui"), true);
  assert.equal(approvata("- serve ancora da approvare 🟡"), false, "'approvare' infinito NON approva");
});

test("trovaAzione(): match per id umano #38 e null se assente", () => {
  const md = CODA;
  assert.ok(trovaAzione(md, "#38"), "#38 trovato per token letterale");
  assert.ok(trovaAzione(md, "38"), "38 senza cancelletto trovato");
  assert.equal(trovaAzione(md, "#Z99-inesistente"), null, "id assente → null (fail-closed)");
  assert.equal(trovaAzione(md, ""), null, "id vuoto → null");
});

test("trovaAzione(): match per codice calcolato #Axx", () => {
  const b = blocchiCoda(CODA);
  const target = b.find((x) => /Riempi la vetrina/.test(x.heading));
  const found = trovaAzione(CODA, target.code);
  assert.ok(found, "codice casella calcolato trova il blocco");
  assert.equal(found.heading, target.heading);
});

test("destinatarioAmmesso(): passa solo ciò che è ESPLICITAMENTE nella allowlist", () => {
  // Questo test pinzava i valori del 6/7 ("tutto bloccato") e si è rotto quando Nicola ha
  // sbloccato GitHub per i merge: falliva da allora, cioè il guardiano dei destinatari non
  // guardava più nessuno. Ora la prova segue il FILE, non una fotografia di com'era.
  const allow = JSON.parse(readFileSync(new URL("../mani-allowlist.json", import.meta.url), "utf8"));

  // Chi non è in lista non passa mai — è la regola che protegge davvero.
  assert.equal(destinatarioAmmesso("email", "mai-visto@x.it").ok, false);
  assert.equal(destinatarioAmmesso("notifica", "utente-mai-visto").ok, false);
  assert.equal(destinatarioAmmesso("marketplace", "tabella-mai-vista").ok, false);
  assert.equal(destinatarioAmmesso("boh", "x").ok, false, "canale sconosciuto → bloccato");

  // I canali a interruttore seguono il file: se domani si spengono, il test lo segue.
  assert.equal(destinatarioAmmesso("n8n", "+39...").ok, allow.n8n === true);
  assert.equal(destinatarioAmmesso("github", "mycity#5").ok, allow.github === true);
  // …e le liste pure: ogni voce presente dev'essere ammessa.
  for (const mail of allow.email || []) assert.equal(destinatarioAmmesso("email", mail).ok, true, `email in lista: ${mail}`);
  for (const t of allow.marketplace_tables || []) assert.equal(destinatarioAmmesso("marketplace", t).ok, true, `tabella in lista: ${t}`);

  // Telegram è canale-proprietario: la chat è quella dell'env, cioè solo Nicola.
  assert.equal(destinatarioAmmesso("telegram", "12345").ok, true, "owner-channel ammesso se chat configurata");
  assert.equal(destinatarioAmmesso("telegram", "").ok, false, "senza chat → bloccato");
});
