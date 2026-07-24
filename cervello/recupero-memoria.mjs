#!/usr/bin/env node
// 🔎 RECUPERO-MEMORIA — la lezione GIUSTA al momento giusto, per TEMA e non per posizione (Mossa 4).
//
// IL PROBLEMA (sonda «memoria», 2026-07-24): il richiamo della memoria è 100% posizionale — worker.sh
// inietta `head -8` di LEZIONI-CHAT.md, contesto-lezioni prende gli ultimi-N. Una lezione pertinente
// ma non tra le prime 8 non torna MAI: la memoria è un buffer LIFO, non un indice. Zero ricerca per
// similarità (grep embedding|cosine|bm25 in cervello/ = 0). Così un errore già imparato ma «vecchio»
// si ripete perché la sua lezione non affiora.
//
// COSA FA: dato il COMPITO in corso (una query — es. il messaggio di Nicola in chat), classifica le
// lezioni per RILEVANZA con BM25 (zero dipendenze) e restituisce le top-K. Corpus = LEZIONI-CHAT.md +
// le lezioni di apprendimento.json (principi in testa, poi per confidenza). È il pezzo che, cablato nel
// worker al posto di head-8, fa affiorare la lezione giusta anche se non è la più recente.
//
// USO:
//   node cervello/recupero-memoria.mjs "come faccio il push su un branch"      -> top-K lezioni rilevanti
//   node cervello/recupero-memoria.mjs "…" --k 6                                 -> quante (default 8)
//   node cervello/recupero-memoria.mjs "…" --json                                -> output macchina
//
// Sola lettura. Non fallisce mai (exit 0). Senza query stampa l'uso.

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MEM = join(ROOT, "MyCity-Vault", "90-Memoria-AI");
const LEZIONI = join(MEM, "LEZIONI-CHAT.md");
const APPR = join(MEM, "auto-coscienza", "apprendimento.json");

const args = process.argv.slice(2);
const JSON_OUT = args.includes("--json");
const RIGHE = args.includes("--righe"); // righe-regola nette (- testo), per iniezione diretta nel worker/chat
const kIdx = args.indexOf("--k");
const K = kIdx >= 0 && args[kIdx + 1] ? Math.max(1, Number(args[kIdx + 1]) || 8) : 8;
const query = args.filter((a, i) => !a.startsWith("--") && !(kIdx >= 0 && i === kIdx + 1)).join(" ").trim();

// stopword italiane + inglesi frequenti (per non far pesare le parole-vuote nel match)
const STOP = new Set(
  ("a ad al allo ai agli alla alle allI anche c che chi ci co coi col come con contro cui da dai dal dall dalla dalle degli dei del dell della delle dello di do dov dove e ed ed egli ella era ci con e gli ha hai hanno ho i il in io la le lei li lo ma me mi ne negli nei nel nell nella nelle nello no noi non o od per però più po poco qua qual quale quanto quel quella quelle quelli quello questa queste questi questo se senza si sia siamo sono su sui sul sull sulla sulle sullo suo suoi te ti tra tu tua tue tuo tuoi tutto un una uno vi voi the of to and in is it for on with as at by an be or if").split(
    /\s+/,
  ),
);

function tokens(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-zà-ù0-9]+/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function leggi(p) {
  try {
    return existsSync(p) ? readFileSync(p, "utf8") : null;
  } catch {
    return null;
  }
}

// --- costruzione corpus (ogni lezione = un documento) ---
const docs = [];
const rawLez = leggi(LEZIONI);
if (rawLez) {
  for (const r of rawLez.split("\n").filter((r) => /^\s*-\s+/.test(r))) {
    docs.push({ fonte: "LEZIONI-CHAT", testo: r.replace(/^\s*-\s+/, "").trim() });
  }
}
try {
  const raw = leggi(APPR);
  if (raw) {
    const j = JSON.parse(raw);
    for (const l of Array.isArray(j.lezioni) ? j.lezioni : []) {
      if (l && l.testo && l.stato !== "decaduta")
        docs.push({ fonte: l.stato === "principio" ? "principio" : "lezione", testo: String(l.testo), tag: l.tag, conf: l.confidenza });
    }
  }
} catch {
  /* apprendimento assente/rotto: resta solo LEZIONI-CHAT */
}

if (!query) {
  if (JSON_OUT) process.stdout.write(JSON.stringify({ esito: "no-query" }));
  else console.log('Uso: node cervello/recupero-memoria.mjs "<compito in corso>" [--k 8]');
  process.exit(0);
}
if (!docs.length) {
  if (JSON_OUT) process.stdout.write(JSON.stringify({ esito: "corpus-vuoto", risultati: [] }));
  process.exit(0);
}

// --- BM25 ---
const K1 = 1.5;
const B = 0.75;
const docTok = docs.map((d) => tokens(d.testo).concat(tokens((d.tag || []).join(" "))));
const N = docs.length;
const avgLen = docTok.reduce((a, t) => a + t.length, 0) / (N || 1);
const df = new Map(); // document frequency per termine
for (const t of docTok) for (const term of new Set(t)) df.set(term, (df.get(term) || 0) + 1);
const idf = (term) => Math.log(1 + (N - (df.get(term) || 0) + 0.5) / ((df.get(term) || 0) + 0.5));

const qTok = [...new Set(tokens(query))];
const punteggi = docs.map((d, i) => {
  const tks = docTok[i];
  const len = tks.length || 1;
  const tf = new Map();
  for (const t of tks) tf.set(t, (tf.get(t) || 0) + 1);
  let score = 0;
  for (const term of qTok) {
    const f = tf.get(term) || 0;
    if (!f) continue;
    score += idf(term) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * len) / avgLen)));
  }
  // piccolo bonus ai principi (regole stabili) e alla confidenza, a parità di rilevanza
  if (d.fonte === "principio") score *= 1.15;
  else if (d.conf) score *= 1 + 0.1 * Number(d.conf);
  return { i, score };
});

const top = punteggi
  .filter((p) => p.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, K)
  .map((p) => ({ fonte: docs[p.i].fonte, score: Number(p.score.toFixed(2)), testo: nucleo(docs[p.i].testo) }));

function nucleo(t) {
  const s = String(t || "");
  const m = s.match(/\*\*(.+?)\*\*/s); // il grassetto è il titolo-regola
  const core = m && m[1].trim().length > 15 ? m[1] : s;
  return core.replace(/\s+/g, " ").replace(/\*\*/g, "").trim().slice(0, 240);
}

if (JSON_OUT) {
  process.stdout.write(JSON.stringify({ esito: "ok", query, risultati: top }, null, 2));
  process.exit(0);
}

if (RIGHE) {
  // Solo le righe-regola nette (- testo), senza header né [fonte · score]: rimpiazzano l'head-8 grezzo
  // nel worker. Nessun output se niente è rilevante → chi chiama torna al fallback (head-8), mai vuoto.
  for (const t of top) process.stdout.write(`- ${t.testo}\n`);
  process.exit(0);
}

if (!top.length) {
  console.log(`🔎 Nessuna lezione rilevante per: «${query}»`);
  process.exit(0);
}
console.log(`🔎 Lezioni rilevanti per «${query}» (per TEMA, non per data):`);
for (const t of top) console.log(`- [${t.fonte} · ${t.score}] ${t.testo}`);
process.exit(0);
