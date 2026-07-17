#!/usr/bin/env node
// 🧠 CONTESTO-LEZIONI — la MEMORIA PERSISTENTE (lezioni imparate + fatti-chiave) pronta da
// iniettare NEL CONTESTO di QUALSIASI sessione, non solo della chat.
//
// IL PROBLEMA CHE RISOLVE (richiesta di Nicola): prima le lezioni tornavano nel cervello SOLO in
// chat (worker.sh iniettava head-8 di LEZIONI-CHAT.md nel blocco CONTESTO MACCHINA). Fuori dalla
// chat — soprattutto nel GIRO e in una sessione nuova — la macchina ripartiva CIECA: rifaceva gli
// stessi errori e non applicava le correzioni di Nicola. Questo script è la fonte UNICA di quel
// blocco, così lo stesso testo lo può iniettare il giro (giro.sh) e un hook SessionStart.
//
// COSA EMETTE: (1) i fatti-chiave dalla FONTE UNICA DELLA VERITÀ (registro-fatti.json), (2) le
// lezioni operative recenti (LEZIONI-CHAT.md), (3) l'esito del guardiano di coerenza. Sola lettura.
//
// USO:
//   node cervello/contesto-lezioni.mjs           -> blocco markdown su stdout (per giro.sh)
//   node cervello/contesto-lezioni.mjs --hook     -> JSON {hookSpecificOutput:{additionalContext}} per SessionStart
//   node cervello/contesto-lezioni.mjs --max 12   -> quante lezioni al massimo (default 12)
//
// Non fallisce MAI: se un file manca, salta quella parte (exit 0). Non deve mai rompere un giro/una sessione.

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MEM = join(ROOT, "MyCity-Vault", "90-Memoria-AI");
const LEZIONI = join(MEM, "LEZIONI-CHAT.md");
const REGISTRO = join(MEM, "registro-fatti.json");
const COERENZA = join(MEM, "auto-coscienza", "coerenza-fatti.json");

const args = process.argv.slice(2);
const HOOK = args.includes("--hook");
const maxIdx = args.indexOf("--max");
const MAX_LEZIONI = maxIdx >= 0 && args[maxIdx + 1] ? Math.max(1, Number(args[maxIdx + 1]) || 12) : 12;
const MAX_VAL = 220; // tronca i valori lunghi per tenere il blocco compatto

function leggi(p) {
  try {
    return existsSync(p) ? readFileSync(p, "utf8") : null;
  } catch {
    return null;
  }
}

function tronca(s, n) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

// (1) FATTI-CHIAVE dalla fonte unica della verità.
function bloccoFatti() {
  const raw = leggi(REGISTRO);
  if (!raw) return null;
  let dati;
  try {
    dati = JSON.parse(raw);
  } catch {
    return null;
  }
  const fatti = Array.isArray(dati?.fatti) ? dati.fatti : [];
  if (!fatti.length) return null;
  const righe = fatti
    .filter((f) => f && f.id && f.valore != null)
    .map((f) => `- ${f.id} = ${tronca(f.valore, MAX_VAL)}`);
  if (!righe.length) return null;
  return `Fatti-chiave (FONTE UNICA della verità — registro-fatti.json; fidati di questi, non dei ricordi di sessione):\n${righe.join("\n")}`;
}

// (2) LEZIONI operative recenti.
function bloccoLezioni() {
  const raw = leggi(LEZIONI);
  if (!raw) return null;
  const righe = raw
    .split("\n")
    .filter((r) => /^\s*-\s+/.test(r))
    .map((r) => r.trim())
    .slice(0, MAX_LEZIONI);
  if (!righe.length) return null;
  return `Lezioni da rispettare (LEZIONI-CHAT.md — errori da non ripetere e correzioni di Nicola):\n${righe.join("\n")}`;
}

// (3) Esito del guardiano di coerenza (se ci sono copie vecchie in giro, dillo).
function bloccoCoerenza() {
  const raw = leggi(COERENZA);
  if (!raw) return null;
  let d;
  try {
    d = JSON.parse(raw);
  } catch {
    return null;
  }
  if (d?.esito === "incoerenze") {
    const n = Array.isArray(d.incoerenze) ? d.incoerenze.length : "alcune";
    return `⚠️ Coerenza-fatti: ${n} copie VECCHIE di un fatto ancora in file vivi — vanno bonificate (node cervello/coerenza-fatti.mjs).`;
  }
  if (d?.esito === "ok") return `✓ Coerenza-fatti: memoria coerente (nessuna copia vecchia nei file vivi).`;
  return null;
}

function componi() {
  const parti = [bloccoFatti(), bloccoLezioni(), bloccoCoerenza()].filter(Boolean);
  if (!parti.length) return "";
  return (
    "## 📌 MEMORIA PERSISTENTE (vale SEMPRE, anche fuori dalla chat: giro, azioni, sessioni nuove)\n" +
    parti.join("\n\n")
  );
}

const blocco = componi();

if (HOOK) {
  // Formato hook Claude Code: additionalContext viene aggiunto al contesto della sessione all'avvio.
  const payload = blocco
    ? { hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: blocco } }
    : {};
  process.stdout.write(JSON.stringify(payload));
} else if (blocco) {
  process.stdout.write(blocco + "\n");
}
process.exit(0);
