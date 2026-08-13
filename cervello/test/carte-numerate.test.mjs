// 🔢 CARD NUMERATE — la richiesta di Nicola del 13/8: ogni card ha un numero fisso prima del
// titolo, la coda è in ordine (nuove in alto) e ogni card porta la data di nascita.
//
// Tre superfici difese:
//   1) il parser della Cabina (pannello/src/lib/azioni-attesa.ts) legge numero e data;
//   2) l'esecutore (cervello/consenso-azione.mjs) risolve «ok 41» per CAMPO, mai per testo
//      nel titolo (lezione AR-271: un «40» dentro l'orario 23:40 non deve combaciare);
//   3) il file VERO della coda rispetta il formato: numeri unici, date presenti,
//      pendenti in ordine decrescente.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { blocchiCoda, trovaAzione } from "../consenso-azione.mjs";
import { lettoreDellaCabina } from "../coda-cabina.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const CODA_VERA = join(REPO, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md");

const CODA_FINTA = `
## Come approvare
Scrivi «ok 41». (sezione-manuale, non un'azione)

<!-- prova-numerata -->

---

### 🟡 #41 — Chiama il fornaio per confermare l'ordine · ⏳ accodata 2026-08-13 00:15

**Cosa cambia:** una cosa vera. In attesa di firma.
- **Colore:** 🟡

---

### 🔴 #12 — Pubblica il post di stasera alle 23:40 nei gruppi · ⏳ accodata 2026-07-19 12:58

**Cosa cambia:** esce il post. In attesa di firma.
- **Colore:** 🔴

---

### 🟡 Vecchio formato senza numero · 2026-06-20 10:00 · @seo

**Cosa cambia:** card d'epoca. In attesa di firma.
- **Colore:** 🟡

| 7 | 2026-07-30 03:44 | @tech | Merge PR #630 ad-mycity → main | 🔴 | https://x/pull/630 | github | in attesa |
`;

// ── 1) Il parser della Cabina ────────────────────────────────────────────────
test("il parser della Cabina legge numero e data di nascita", async () => {
  const l = await lettoreDellaCabina();
  assert.ok(!l.cieco, `lettore cieco: ${l.cieco}`);
  const az = l.parse(CODA_FINTA);
  const num41 = az.find((a) => a.cartellino === "41");
  assert.ok(num41, "la card #41 non è stata letta");
  assert.equal(num41.data, "2026-08-13 00:15", "la data di nascita va pescata da «⏳ accodata …»");
  assert.match(num41.azione, /fornaio/, "il titolo visibile perde il numero ma tiene le parole");
  const epoca = az.find((a) => /epoca/.test(a.contenuto));
  assert.equal(epoca?.cartellino, "", "una card senza numero resta senza: niente numeri inventati");
});

test("la coda si ordina col numero più alto in alto", async () => {
  const l = await lettoreDellaCabina();
  assert.ok(!l.cieco, `lettore cieco: ${l.cieco}`);
  const mod = await import("../../pannello/src/lib/azioni-attesa.ts");
  const ordinate = mod.ordinaCoda(l.parse(CODA_FINTA).filter((a) => a.inAttesa));
  assert.deepEqual(
    ordinate.map((a) => a.cartellino),
    ["41", "12", "7", ""],
    "prima i numeri in ordine decrescente (righe-tabella comprese), poi le card senza numero"
  );
  assert.equal(mod.numeroCard(ordinate[0]), "#41");
  assert.match(mod.numeroCard(ordinate[3]), /^#[A-Z]\d{2}$/, "senza numero si ripiega sul codice");
});

// ── 2) L'esecutore: «ok 41» per campo, mai per coincidenza ───────────────────
test("trovaAzione risolve il numero come campo dichiarato", () => {
  const b41 = trovaAzione(CODA_FINTA, "41");
  assert.ok(b41, "«41» deve trovare la card #41");
  assert.equal(b41.cartellino, "41");
  assert.ok(trovaAzione(CODA_FINTA, "#41"), "anche con il cancelletto");
});

test("AR-271: un numero che vive solo dentro un orario del titolo NON combacia", () => {
  // «23:40» sta nel titolo della card #12: chiedere «40» non deve agganciarla.
  assert.equal(trovaAzione(CODA_FINTA, "40"), null, "il 40 di «23:40» non è un identificatore");
});

test("anche le card del formato vecchio (righe-tabella) rispondono al loro numero", () => {
  // Sono 22 nella coda vera e sono card VIVE: se «ok 7» non le trovasse, il numero mostrato
  // dal Pannello aprirebbe il vuoto — o peggio, un'altra card.
  const b7 = trovaAzione(CODA_FINTA, "7");
  assert.ok(b7, "«7» deve trovare la riga-tabella numerata 7");
  assert.match(b7.blocco, /Merge PR #630/);
});

test("i vecchi identificatori restano validi (id stabile e codice casella)", () => {
  const blocchi = blocchiCoda(CODA_FINTA).filter((b) => b.heading.startsWith("### "));
  const uno = blocchi[0];
  assert.equal(trovaAzione(CODA_FINTA, uno.id)?.id, uno.id, "l'id S<hash> funziona ancora");
  assert.equal(trovaAzione(CODA_FINTA, uno.code)?.id, uno.id, "il codice #A42 funziona ancora");
});

// ── 3) Il file VERO della coda ───────────────────────────────────────────────
test("nel file vero ogni card ha il suo numero, unico, con la data di nascita", () => {
  const md = readFileSync(CODA_VERA, "utf8");
  const heading = md.split("\n").filter((r) => r.startsWith("### "));
  assert.ok(heading.length >= 50, `attese decine di card, trovate ${heading.length}`);
  const numeri = [];
  for (const h of heading) {
    const m = h.match(/^###\s+\S+\s+#(\d+)\s+[—–-]\s/u);
    assert.ok(m, `card senza numero fisso: ${h.slice(0, 80)}`);
    numeri.push(Number(m[1]));
    assert.match(h, /(?:accodat\w*|refresh)\s+\d{4}-\d{2}-\d{2}/, `card senza data di nascita: ${h.slice(0, 80)}`);
  }
  // Le righe-tabella sono card anche loro e vivono nello STESSO spazio di numeri: se un numero
  // valesse due card, «ok 20» sarebbe una domanda senza risposta unica.
  for (const r of md.split("\n")) {
    const m = r.match(/^\|\s*(\d+)\s*\|/);
    if (m) numeri.push(Number(m[1]));
  }
  assert.equal(new Set(numeri).size, numeri.length, "due card portano lo stesso numero");
});

test("nel file vero le card pendenti sono in ordine: la più nuova in alto", () => {
  const md = readFileSync(CODA_VERA, "utf8");
  const pendenti = md.split(/^## 🛡️|^## 🗄️/m)[0];
  const numeri = pendenti
    .split("\n")
    .filter((r) => r.startsWith("### "))
    .map((r) => Number((r.match(/#(\d+)\s+[—–-]/u) || [])[1]));
  const ordinati = [...numeri].sort((a, b) => b - a);
  assert.deepEqual(numeri, ordinati, "le card pendenti non sono in ordine decrescente");
});
