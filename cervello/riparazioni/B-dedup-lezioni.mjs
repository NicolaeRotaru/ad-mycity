#!/usr/bin/env node
// 🩹 B-dedup-lezioni — RIPARAZIONE DATI per AR-580 (corsia B, lotto contabilità).
//
// Cosa fa: in apprendimento.json quattro id di lezione esistono in doppia copia (L-2026-0804-02,
// L-2026-0710-71, L-2026-0710-72, L-2026-0701-27 — le due copie sono lezioni DIVERSE). Chi cerca
// per id (`lezioni.find(l => l.id === id)`, es. cervello/tasso-lezioni.mjs) becca sempre la PRIMA:
// la seconda è irraggiungibile e ogni uso registrato le viene rubato. Questo script rinumera la
// SECONDA copia di ogni doppione a un id libero della stessa forma L-AAAA-MMGG-NN (stessa data,
// primo NN libero), SENZA perdere contenuto: la lezione tiene tutto e riceve `id_precedente` +
// `nota_rinumero` che raccontano il rinumero.
//
// Riferimenti altrove: verificato col grep prima di scrivere lo script — gli id doppi compaiono
// solo in file di STORIA (DECISIONI.md, memoria-squadra/*.md, auto-radiografia.json che DESCRIVE
// il difetto). La storia non si riscrive, e comunque quei riferimenti puntano alla prima copia,
// che l'id lo TIENE: nessun riferimento va aggiornato. Lo script ricontrolla comunque i file vivi
// (mutanti.json, esperimenti) e avvisa se trova un aggancio.
//
// Cosa NON fa: non cancella lezioni, non tocca testi/stati/usi, non tocca `stato` di niente.
//
// Uso (idempotente):
//   node B-dedup-lezioni.mjs                → DRY-RUN
//   node B-dedup-lezioni.mjs --applica      → scrive
//   [--root=…] [--file=…]                   → per test su dati iniettati

import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { join } from "node:path";

const APPLICA = process.argv.includes("--applica");
const arg = (n, d) => (process.argv.find((x) => x.startsWith(`--${n}=`)) || "").slice(n.length + 3) || d;
const ROOT = arg("root", process.env.AD_ROOT || "/home/user/ad-mycity");
const FILE = arg("file", join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"));

if (!existsSync(FILE)) {
  console.error(`❌ apprendimento non trovato: ${FILE}`);
  process.exit(2);
}
const testoOriginale = readFileSync(FILE, "utf8");
const dati = JSON.parse(testoOriginale);
const lezioni = dati.lezioni || [];

console.log(`\n🩹 B-dedup-lezioni — ${APPLICA ? "APPLICA" : "DRY-RUN (niente viene scritto)"}\n`);
console.log(`   Lezioni totali: ${lezioni.length}`);

// ── 1. trova i doppioni (prima copia tiene l'id, dalla seconda in poi si rinumera) ──
const visti = new Map();
const daRinumerare = [];
for (const l of lezioni) {
  if (!l || !l.id) continue;
  if (visti.has(l.id)) daRinumerare.push(l);
  else visti.set(l.id, l);
}
console.log(`   Copie con id già preso: ${daRinumerare.length}\n`);
if (!daRinumerare.length) {
  console.log("   ✅ Nessun id doppio: niente da riparare.\n");
  process.exit(0);
}

// ── 2. assegna id liberi della stessa forma L-AAAA-MMGG-NN, stessa data ──────────
const tuttiId = new Set(lezioni.filter((l) => l && l.id).map((l) => l.id));
function idLibero(vecchio) {
  const m = vecchio.match(/^(L-\d{4}-\d{4})-(\d+)$/);
  if (!m) return null;
  const prefisso = m[1];
  // primo NN libero DOPO il massimo già usato per quella data: niente collisioni future
  let maxNN = 0;
  for (const id of tuttiId) {
    const x = id.match(/^(L-\d{4}-\d{4})-(\d+)$/);
    if (x && x[1] === prefisso) maxNN = Math.max(maxNN, Number(x[2]));
  }
  const larghezza = Math.max(2, String(m[2]).length);
  const nuovo = `${prefisso}-${String(maxNN + 1).padStart(larghezza, "0")}`;
  return tuttiId.has(nuovo) ? null : nuovo;
}

const cambi = [];
for (const l of daRinumerare) {
  const nuovo = idLibero(l.id);
  if (!nuovo) {
    console.error(`   ❌ ${l.id}: forma dell'id non riconosciuta o spazio esaurito — lo salto (va guardato a mano).`);
    continue;
  }
  cambi.push({ vecchio: l.id, nuovo, testo: String(l.testo || "").slice(0, 70) });
  l.id_precedente = l.id;
  l.nota_rinumero = `rinumerata da ${l.id} il 2026-08-13 (AR-580: id doppio, la prima copia tiene l'id; contenuto intatto)`;
  l.id = nuovo;
  tuttiId.add(nuovo);
}

// ── 3. riferimenti nei file VIVI (la storia è esente e comunque punta alla prima copia) ──
const FILE_VIVI = [
  "cervello/mutanti.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/esperimenti.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json",
];
const agganci = [];
for (const rel of FILE_VIVI) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) continue;
  const t = readFileSync(p, "utf8");
  for (const c of cambi) if (t.includes(c.vecchio)) agganci.push({ file: rel, id: c.vecchio });
}

// ── 4. report + scrittura ────────────────────────────────────────────────────
console.log("   Cosa cambia (solo l'id della SECONDA copia; contenuto, usi e stato restano intatti):\n");
for (const c of cambi) console.log(`   · ${c.vecchio} → ${c.nuovo}   «${c.testo}…»`);
if (agganci.length) {
  console.log(`\n   ⚠️  Riferimenti agli id vecchi trovati in file vivi (puntano alla PRIMA copia, che l'id lo tiene — nessuna rottura, ma l'AD li guardi):`);
  for (const a of agganci) console.log(`      · ${a.file} cita ${a.id}`);
} else {
  console.log("\n   Nessun riferimento agli id vecchi nei file vivi controllati: la prima copia tiene l'id, niente da aggiornare.");
}

if (!APPLICA) {
  console.log("\n   DRY-RUN: niente scritto. Per applicare: node B-dedup-lezioni.mjs --applica\n");
  process.exit(0);
}
const indent = (testoOriginale.split("\n")[1]?.match(/^\s*/) || [" "])[0].length || 1;
const tmp = `${FILE}.tmp-dedup`;
writeFileSync(tmp, `${JSON.stringify(dati, null, indent)}\n`, "utf8");
renameSync(tmp, FILE);
console.log(`\n   ✅ Scritto ${FILE} (${cambi.length} lezioni rinumerate).`);
console.log("   Controprova: node cervello/tasso-chiusura.mjs → la voce «id doppi nelle lezioni» deve sparire.\n");
