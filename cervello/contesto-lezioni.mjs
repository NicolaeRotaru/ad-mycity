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
import { caricaEAnalizza } from "./apprendimento-guardiano.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MEM = join(ROOT, "MyCity-Vault", "90-Memoria-AI");
const LEZIONI = join(MEM, "LEZIONI-CHAT.md");
const REGISTRO = join(MEM, "registro-fatti.json");
const COERENZA = join(MEM, "auto-coscienza", "coerenza-fatti.json");
const APPR = join(MEM, "auto-coscienza", "apprendimento.json");

const args = process.argv.slice(2);
const HOOK = args.includes("--hook");
const RIGHE = args.includes("--righe"); // solo le righe-regola nette (per l'iniezione in chat del worker)
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

// Estrae la REGOLA OPERATIVA netta da una riga-lezione (che spesso è un paragrafo da 150+ parole).
// Priorità: (1) la frase dopo «Regola:» — è la parte imperativa; (2) il testo in **grassetto** —
// è il titolo-regola; (3) troncamento. Così nel contesto arriva una regola scannabile, non un diario.
function nucleoRegola(riga) {
  let s = String(riga || "").replace(/^\s*-\s+/, ""); // via il bullet
  s = s.replace(/^\[\d{4}-\d{2}-\d{2}[^\]]*\]\s*/, ""); // via la data iniziale [AAAA-MM-GG]
  const mRegola = s.match(/Regola(?:\s+\w+)?\s*[:：]\s*(.+?)(?:\s*(?:\([^)]*\)\s*)?$)/is);
  if (mRegola && mRegola[1].trim().length > 15) return tronca(mRegola[1], MAX_VAL);
  const mBold = s.match(/\*\*(.+?)\*\*/s);
  if (mBold && mBold[1].trim().length > 15) return tronca(mBold[1], MAX_VAL);
  return tronca(s, MAX_VAL);
}

// (2) LEZIONI operative recenti — solo il NUCLEO-REGOLA di ognuna.
function bloccoLezioni() {
  const raw = leggi(LEZIONI);
  if (!raw) return null;
  const righe = raw
    .split("\n")
    .filter((r) => /^\s*-\s+/.test(r))
    .slice(0, MAX_LEZIONI)
    .map((r) => `- ${nucleoRegola(r)}`);
  if (!righe.length) return null;
  return `Lezioni da rispettare (LEZIONI-CHAT.md — errori da non ripetere e correzioni di Nicola):\n${righe.join("\n")}`;
}

// (2-bis) ERRORI CHE SI RIPETONO — dal guardiano dell'apprendimento. È il segnale più importante per
// la richiesta di Nicola («errori che devo continuare a ripeterti»): mette in cima le aree dove lo
// stesso tipo di errore è tornato molte volte e non è mai diventato un gate. Non fallisce mai.
function bloccoErroriRicorrenti() {
  let r;
  try {
    r = caricaEAnalizza();
  } catch {
    return null;
  }
  if (!r || !Array.isArray(r.clusters) || !r.clusters.length) return null;
  const top = r.clusters.slice(0, 4).filter((c) => c.evidenze >= 6 || c.daNicola >= 4);
  if (!top.length) return null;
  const righe = top.map(
    (c) => `- ${c.tag}: ripetuto ${c.evidenze}× in ${c.lezioni} lezioni${c.daNicola ? ` (${c.daNicola} da correzioni di Nicola)` : ""} e mai reso un gate — se rientra nel lavoro di adesso, applica la regola, non rifarlo.`,
  );
  return `⛔ Errori che si RIPETONO (falli diventare comportamento, non riloggarli):\n${righe.join("\n")}`;
}

function leggiAppr() {
  const raw = leggi(APPR);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// (0-bis) PRINCIPI cristallizzati — le regole stabili promosse dall'apprendimento (da cristallizza-
// apprendimento.mjs). Devono raggiungere OGNI contesto: è il vero «cristallizzato_in: memoria-persistente».
// Un principio che non arriva alla mossa è inutile — questo è il pezzo che lo fa arrivare.
function bloccoPrincipi() {
  const d = leggiAppr();
  if (!d) return null;
  let pr = [];
  if (Array.isArray(d.principi))
    pr = d.principi.map((p) => (typeof p === "string" ? p : p?.testo)).filter(Boolean);
  if (!pr.length && Array.isArray(d.lezioni))
    pr = d.lezioni.filter((l) => l?.stato === "principio").map((l) => l.testo).filter(Boolean);
  const righe = pr.slice(0, 8).map((p) => `- ${nucleoRegola(String(p))}`);
  if (!righe.length) return null;
  return `Principi (regole STABILI — valgono sempre, non solo se te le ricordi):\n${righe.join("\n")}`;
}

// (0-ter) PREFERENZE DI NICOLA — «il segnale più prezioso» (il suo gusto/priorità). Finora vivevano SOLO
// nel Pannello (campo morto per le decisioni): qui entrano nel contesto così le mosse ci si allineano.
function bloccoPreferenze() {
  const d = leggiAppr();
  if (!d || !Array.isArray(d.preferenze_nicola) || !d.preferenze_nicola.length) return null;
  const righe = d.preferenze_nicola.slice(0, 5).map((p) => `- ${nucleoRegola(String(p))}`);
  if (!righe.length) return null;
  return `Preferenze di Nicola (il suo gusto — allinea le mosse a questo):\n${righe.join("\n")}`;
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
  const parti = [
    bloccoFatti(),
    bloccoPrincipi(),
    bloccoErroriRicorrenti(),
    bloccoPreferenze(),
    bloccoLezioni(),
    bloccoCoerenza(),
  ].filter(Boolean);
  if (!parti.length) return "";
  return (
    "## 📌 MEMORIA PERSISTENTE (vale SEMPRE, anche fuori dalla chat: giro, azioni, sessioni nuove)\n" +
    parti.join("\n\n")
  );
}

// --righe: solo le righe-regola nette (senza intestazione), per sostituire l'head-8 grezzo nel worker.
if (RIGHE) {
  const raw = leggi(LEZIONI);
  const righe = raw
    ? raw
        .split("\n")
        .filter((r) => /^\s*-\s+/.test(r))
        .slice(0, MAX_LEZIONI)
        .map((r) => `- ${nucleoRegola(r)}`)
    : [];
  if (righe.length) process.stdout.write(righe.join("\n") + "\n");
  process.exit(0);
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
