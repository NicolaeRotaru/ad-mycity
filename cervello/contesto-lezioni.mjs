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
//   node cervello/contesto-lezioni.mjs --richiesta -> per l'hook UserPromptSubmit: legge {prompt} da
//       stdin e inietta SOLO le lezioni sul tema di QUELLA richiesta (vedi «LA SCHEDA PRIMA DI
//       COMINCIARE» più sotto). Senza cablaggio in settings.json non scatta: l'aggancio è 🟡.
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
const RICHIESTA = args.includes("--richiesta"); // la scheda su misura per UNA richiesta (UserPromptSubmit)
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
    pr = d.principi.map((p) => (typeof p === "string" ? { testo: p } : p?.testo ? p : null)).filter(Boolean);
  if (!pr.length && Array.isArray(d.lezioni))
    pr = d.lezioni.filter((l) => l?.stato === "principio" && l.testo);
  // AR-762: anche qui il freno viaggia col principio. Una regola stabile senza il comando che la
  // fa rispettare è la stessa prosa di prima, solo promossa di grado.
  const righe = pr.slice(0, 8).map((p) => {
    const freno = frenoDi(p);
    return `- ${nucleoRegola(String(p.testo))}${freno ? ` · freno: \`${freno}\`` : ""}`;
  });
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

// ─────────────────────────────────────────────────────────────────────────────
// ① LA SCHEDA PRIMA DI COMINCIARE (AR-533, Nicola 4/8: «voglio qualcos'altro che ti permetta di
// far bene il lavoro, che impedisca di fare errori e porti il risultato migliore»).
//
// IL DIFETTO CHE CURA. La memoria ha 500+ lezioni, ma al contesto arrivavano sempre LE STESSE: le
// ultime 12 in ordine di tempo, qualunque cosa stessi per fare. Le correzioni di Nicola su un tema
// tornavano utili solo per caso — se erano recenti. Qui la selezione si fa SULLA RICHIESTA: appena
// arriva il prompt, si pescano dal magazzino solo le lezioni che parlano di QUEL lavoro.
//
// TARATURA. Sotto la soglia si tace: una scheda che allega lezioni fuori tema a ogni richiesta è
// rumore, e il rumore spegne i freni (regola di casa). Le correzioni di Nicola a parità di tema
// vengono prima. Il punteggio è dichiarato semplice: i tag valgono più del testo, perché sono la
// classificazione scritta a mano — il testo è lungo e pesca somiglianze per caso.
// ─────────────────────────────────────────────────────────────────────────────

/** Parole vuote dell'italiano: legano le frasi, non dicono il tema. */
export const PAROLE_VUOTE = new Set([
  "come", "cosa", "fare", "fatto", "fatta", "sono", "della", "delle", "degli", "dello", "dalla",
  "nella", "nelle", "questa", "questo", "quella", "quello", "anche", "cosi", "dopo", "prima",
  "tutto", "tutti", "tutte", "sempre", "quando", "perche", "voglio", "devi", "deve", "dimmi",
  "dire", "volta", "volte", "ogni", "altro", "altra", "altre", "altri", "stato", "stata", "essere",
  "hanno", "abbiamo", "adesso", "ancora", "molto", "tanto", "bene", "male", "puoi", "posso",
  "serve", "senza", "cioe", "oppure", "invece", "quindi", "pero", "loro", "vorrei",
]);

/** Le parole-tema di un testo: minuscole, senza accenti, senza parole vuote, almeno 4 lettere. */
export function paroleChiave(testo = "") {
  return [
    ...new Set(
      String(testo)
        .toLowerCase()
        .normalize("NFD")
        // La classe scritta con gli escape, non coi segni combinanti «invisibili»: un editor o un
        // formatter che normalizza il file la romperebbe senza che nessun diff lo mostri.
        .replace(/[\u0300-\u036f]/g, "")
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length >= 4 && !PAROLE_VUOTE.has(w)),
    ),
  ];
}

/** Sotto questi punti una lezione NON entra nella scheda: un tag centrato (3) o tre parole di
 *  testo. Più basso = allegare lezioni per caso, e una scheda che sbaglia si impara a scorrere. */
export const PUNTI_MINIMI = 3;

/**
 * IL FRENO DI UNA LEZIONE — il comando che diventa rosso se quell'errore torna (AR-762).
 *
 * IL DIFETTO CHE CURA. Questa era l'unica riga di tutto il repo che leggeva `gate_attivo`: il
 * sorvegliante, cancello-stop, contratto-prova e tasso-regole leggono tutti `l.gate`. E la porta
 * ufficiale di scrittura — `lezione-nuova.mjs` — scrive `gate` e basta, `gate_attivo` non lo scrive
 * mai. Quindi ogni lezione nata dalla porta arrivava al lavoro SENZA il suo freno, per un nome di
 * campo. Misurato il 16/8 su 8 richieste tipiche: 52 righe di scheda servite, 11 appartenevano a
 * lezioni con un freno vero, ne veniva mostrato 1. Le altre 10 erano prosa da leggere.
 *
 * `gate_attivo: false` invece è un segnale VERO e resta rispettato: vuol dire «il freno esiste ma
 * non è ancora su main» (L-2026-0730-530) — mostrarlo manderebbe a lanciare un comando che non c'è.
 * L'assenza del campo non è un no: è la forma normale di una lezione scritta dalla porta.
 */
export function frenoDi(lezione) {
  if (!lezione || lezione.gate_attivo === false) return null;
  const g = typeof lezione.gate === "string" ? lezione.gate.trim() : "";
  return g || null;
}

/**
 * Le lezioni che parlano di QUESTA richiesta, in ordine di pertinenza.
 *
 * Punteggio: tag centrato = 3 (è la classificazione scritta a mano) · parola del prompt nel testo
 * = 1, con tetto a 4 (un testo lungo pesca somiglianze per caso) · correzione di Nicola già in
 * tema = +1 (le sue correzioni sono i casi-studio prioritari della casa, CLAUDE.md passo 6) ·
 * lezione già in tema che porta un FRENO = +2 (AR-762).
 *
 * Perché il freno vale il doppio della correzione: fra due lezioni ugualmente in tema, quella con
 * un comando che può fallire cambia il lavoro, l'altra si legge e si dimentica. E perché il bonus
 * si dà SOLO dopo la soglia, come quello di Nicola: darlo prima farebbe entrare nella scheda
 * lezioni fuori tema per il solo fatto di avere un freno — cioè rumore, che è quello che spegne i
 * freni veri.
 */
export function lezioniSuMisura(richiesta = "", lezioni = [], max = 8) {
  const tema = new Set(paroleChiave(richiesta));
  if (!tema.size) return [];
  const fuori = [];
  for (const l of lezioni) {
    if (!l || l.stato === "decaduta") continue;
    let punti = 0;
    for (const t of l.tag || []) {
      const pezzi = paroleChiave(String(t).replace(/-/g, " "));
      if (pezzi.some((w) => tema.has(w))) punti += 3;
    }
    const nelTesto = paroleChiave(l.testo).filter((w) => tema.has(w)).length;
    punti += Math.min(nelTesto, 4);
    const freno = frenoDi(l);
    if (punti >= PUNTI_MINIMI && l.caso_studio_nicola) punti += 1;
    if (punti >= PUNTI_MINIMI && freno) punti += 2;
    if (punti >= PUNTI_MINIMI) fuori.push({ id: l.id, punti, nicola: Boolean(l.caso_studio_nicola), gate: freno, testo: l.testo });
  }
  return fuori
    .sort((a, b) => b.punti - a.punti || Number(b.nicola) - Number(a.nicola) || String(b.id).localeCompare(String(a.id)))
    .slice(0, max);
}

/** Il blocco per l'hook UserPromptSubmit: la scheda su misura, o niente (il silenzio è la taratura). */
function bloccoSuMisura(richiesta) {
  const d = leggiAppr();
  if (!d || !Array.isArray(d.lezioni)) return null;
  const scelte = lezioniSuMisura(richiesta, d.lezioni);
  if (!scelte.length) return null;
  const righe = scelte.map(
    (s) => `- [${s.id}]${s.nicola ? " (correzione di Nicola)" : ""} ${nucleoRegola(s.testo)}${s.gate ? ` · freno: \`${s.gate}\`` : ""}`,
  );
  return (
    `🎯 LA SCHEDA PRIMA DI COMINCIARE — ${scelte.length} lezioni SUL TEMA di questa richiesta (pescate da ${d.lezioni.length} in memoria):\n` +
    righe.join("\n") +
    `\n(applicale nel lavoro che parte adesso: sono gli errori già pagati su questo tema.)`
  );
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

async function leggiStdin() {
  const pezzi = [];
  for await (const p of process.stdin) pezzi.push(p);
  return Buffer.concat(pezzi).toString("utf8");
}

async function main() {
  // --richiesta: la scheda su misura per l'hook UserPromptSubmit. JSON o niente, mai un errore:
  // un hook che rompe l'arrivo di un prompt è peggio di nessuna scheda.
  if (RICHIESTA) {
    let prompt = "";
    try {
      prompt = String(JSON.parse(await leggiStdin())?.prompt || "");
    } catch {
      // stdin vuoto o non-JSON: nessuna richiesta da leggere, quindi nessuna scheda.
    }
    const su = prompt.trim().length >= 15 ? bloccoSuMisura(prompt) : null;
    if (su) {
      process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: su } }));
    }
    process.exit(0);
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
}

// Custodito (AR-533): prima il blocco CLI girava all'IMPORT, e un test che importa `lezioniSuMisura`
// sarebbe morto sulla sua process.exit prima di eseguire una sola prova.
if (import.meta.url === `file://${process.argv[1]}`) main();
