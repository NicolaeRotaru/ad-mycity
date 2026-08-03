#!/usr/bin/env node
// 🪝 IL GUARDIANO DEGLI HOOK — chi controlla il file dove vivono i freni?
//
// PERCHÉ ESISTE (1/8, Nicola). Gli ho chiesto di attaccare il cancello dello Stop a mano, perché
// `.claude/settings.json` è nel mio deny-list e non lo posso toccare. Il blocco che ha incollato
// aveva due difetti, e NESSUNO dei due ha fatto rumore:
//
//   ① mancava la graffa finale → il file non era JSON valido. Non moriva solo lo Stop: moriva TUTTO.
//      I permessi, il `deny` su `**/.env` (cioè il freno che mi impedisce di leggere le chiavi), il
//      `SessionStart` che carica i fatti-chiave, e i due `PostToolUse` — sorvegliante e misura-cieca.
//      Aggiungendo il terzo freno si staccavano gli altri due, in silenzio.
//   ② la chiave era `"stop"` minuscola. I nomi degli eventi sono case-sensitive: una chiave che non
//      combacia non è un errore, è una voce sconosciuta che viene scartata senza dire niente.
//
// Il difetto vero non è il refuso: è che **il posto dove vivono i freni non era sorvegliato da
// nessuno**. Dieci guardiani nel cancello del lotto, e zero su questo file — cioè la macchina non
// aveva modo di accorgersi di essere disarmata. È la stessa forma di AR-455: un freno costruito bene
// e lasciato staccato per un giorno intero, con la scheda chiusa perché «la riga in settings.json
// c'è». Chiuso sulla lettera, non sull'effetto.
//
// COSA CONTROLLA — quattro domande meccaniche:
//   ① il file c'è ed è JSON valido? (se no, nessun freno è caricato: è la peggiore, e va per prima)
//   ② ogni chiave sotto `hooks` è un evento vero? (`stop` ≠ `Stop`, e lo dice con il suggerimento)
//   ③ ogni comando `node cervello/*.mjs` punta a un file che esiste? (un hook che lancia un file
//      assente fallisce a ogni giro e nessuno lo vede: gli errori di un hook non arrivano in chat)
//   ④ ogni script del cervello che SA parlare da hook è attaccato da qualche parte?
//
// La ④ è quella che avrebbe preso AR-455. E la regola è generale apposta — non un elenco di nomi da
// tenere aggiornato a mano (sarebbe il perimetro letterale di AR-347): chi sa leggere `--hook` dagli
// argomenti dichiara di voler essere un hook, e allora o è attaccato o è un freno che non frena.
//
// COSA NON CONTROLLA, e va detto: non sa se Claude Code accetti davvero questa configurazione (quello
// si vede solo con `/hooks` in una sessione vera), non giudica i `matcher`, non esegue gli hook.
// Quattro misure sulla forma del file, non sul comportamento del programma che lo legge.
//
// Uso:
//   node cervello/hooks-check.mjs                    # controlla .claude/settings.json
//   node cervello/hooks-check.mjs <percorso.json>    # controlla un altro file (lo usano le prove)
//
// Uscita (contratto guardiani, AR-322): 0 = a posto · 1 = qualcosa non torna · 2 = non ho misurato
//
// 🟢 Sola lettura: non scrive niente, non tocca git, non esegue gli hook.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);
const SETTINGS = ".claude/settings.json";

/**
 * I nomi degli eventi che Claude Code riconosce, nella loro grafia ESATTA.
 *
 * Sono un elenco chiuso perché lo sono davvero: non è un perimetro dedotto da me, è il contratto di
 * chi legge il file. Se domani ne aggiungono uno, questo guardiano lo chiamerà «sconosciuto» — ed è
 * il modo giusto di sbagliare: si aggiunge una riga qui, invece di far passare in silenzio un refuso.
 */
export const EVENTI = [
  "PreToolUse",
  "PostToolUse",
  "Notification",
  "UserPromptSubmit",
  "Stop",
  "SubagentStop",
  "PreCompact",
  "SessionStart",
  "SessionEnd",
];

/** Riconosce uno script che sa presentarsi come hook: legge `--hook` dai propri argomenti. */
const SA_FARE_L_HOOK = /includes\(\s*["']--hook["']\s*\)/;

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — funzioni pure. Ricevono stati finti nelle prove, così un rosso parla della regola e non
// di com'è configurato il repo oggi.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ② Le chiavi sotto `hooks` che non sono eventi veri.
 *
 * Il confronto è ESATTO, e il `forse` serve solo a spiegare: `stop` e `Stop` sono due chiavi diverse
 * per chi legge il file, e chiamarle uguali qui vorrebbe dire ripetere il difetto dentro il guardiano
 * che lo deve trovare.
 */
export function chiaviSconosciute(hooks = {}) {
  return Object.keys(hooks || {})
    .filter((k) => !EVENTI.includes(k))
    .map((k) => ({ chiave: k, forse: EVENTI.find((e) => e.toLowerCase() === k.toLowerCase()) || null }));
}

/** Tutti i comandi dichiarati, appiattiti: `{evento, matcher, comando}`. */
export function comandiDichiarati(hooks = {}) {
  const fuori = [];
  for (const [evento, gruppi] of Object.entries(hooks || {})) {
    for (const g of Array.isArray(gruppi) ? gruppi : []) {
      for (const h of Array.isArray(g?.hooks) ? g.hooks : []) {
        if (typeof h?.command === "string") fuori.push({ evento, matcher: g.matcher || null, comando: h.command });
      }
    }
  }
  return fuori;
}

/**
 * ③ I comandi che lanciano uno script del cervello che non esiste.
 *
 * Perché fa più danno di quanto sembri: quando un hook fallisce, l'errore NON arriva in chat — finisce
 * nel log di debug. Un percorso sbagliato è quindi un freno che risulta configurato e non gira mai,
 * cioè esattamente la bugia che questo guardiano deve rendere impossibile.
 */
export function comandiOrfani(comandi = [], esiste = () => true) {
  const fuori = [];
  for (const c of comandi) {
    for (const m of String(c.comando).matchAll(/\bnode\s+(cervello\/[\w./-]+\.mjs)/g)) {
      if (!esiste(m[1])) fuori.push({ evento: c.evento, file: m[1] });
    }
  }
  return fuori;
}

/**
 * ④ Gli script che sanno fare l'hook e non sono attaccati a nessun evento.
 *
 * È la domanda che AR-455 non aveva nessuno a farla: il sorvegliante era scritto, provato e capace di
 * parlare da hook — e per un giorno intero non era agganciato a niente.
 */
export function freniNonAttaccati(scriptDisponibili = [], comandi = []) {
  const testo = comandi.map((c) => c.comando).join(" ");
  return scriptDisponibili.filter((s) => !testo.includes(s));
}

/** Il verdetto: le righe da dire e se si blocca. Tace quando non c'è niente da dire. */
export function verdetto({ rotto = null, sconosciute = [], orfani = [], staccati = [] } = {}) {
  const righe = [];
  if (rotto) {
    righe.push(
      `❌ ${SETTINGS} non è utilizzabile: ${rotto}` +
        `\n   → nessun hook viene caricato, e con lui cade anche il "deny" (i .env tornano leggibili).` +
        `\n   → controlla le graffe: node -e 'JSON.parse(require("fs").readFileSync(".claude/settings.json","utf8"))'`,
    );
    return { righe, esce: 1 };
  }
  for (const s of sconosciute) {
    righe.push(
      `❌ "${s.chiave}" non è un evento hook` +
        (s.forse
          ? `: è "${s.forse}" con la lettera sbagliata. I nomi sono case-sensitive, e una chiave che non combacia viene scartata in silenzio.`
          : `. Eventi validi: ${EVENTI.join(", ")}.`),
    );
  }
  for (const o of orfani) {
    righe.push(`❌ l'hook ${o.evento} lancia ${o.file}, che non esiste\n   → gli errori di un hook non arrivano in chat: girerebbe a vuoto per sempre.`);
  }
  for (const s of staccati) {
    righe.push(
      `❌ ${s} sa parlare da hook ma non è attaccato a nessun evento` +
        `\n   → o lo agganci in ${SETTINGS}, o è un freno costruito e mai collegato (AR-455).`,
    );
  }
  return { righe, esce: righe.length ? 1 : 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O — sottile per scelta: tutto ciò che decide sta sopra.
// ─────────────────────────────────────────────────────────────────────────────

/** Gli script di `cervello/` che sanno presentarsi come hook. */
export function scriptCheSannoFareLHook(cartella) {
  const fuori = [];
  for (const nome of readdirSync(cartella)) {
    if (!nome.endsWith(".mjs")) continue;
    try {
      if (SA_FARE_L_HOOK.test(readFileSync(join(cartella, nome), "utf8"))) fuori.push(`cervello/${nome}`);
    } catch {
      // Illeggibile: non lo accuso di niente. Un file che non posso guardare non è un file colpevole.
    }
  }
  return fuori.sort();
}

function main() {
  const arg = process.argv.slice(2).find((a) => !a.startsWith("--"));
  const percorso = arg ? (arg.startsWith("/") ? arg : join(REPO, arg)) : join(REPO, SETTINGS);

  let dati = null;
  let rotto = null;
  if (!existsSync(percorso)) {
    rotto = "il file non c'è";
  } else {
    try {
      dati = JSON.parse(readFileSync(percorso, "utf8"));
    } catch (e) {
      rotto = e.message;
    }
  }

  const hooks = dati?.hooks || {};
  const comandi = comandiDichiarati(hooks);
  let staccati = [];
  try {
    staccati = freniNonAttaccati(scriptCheSannoFareLHook(join(REPO, "cervello")), comandi);
  } catch (e) {
    // Non poter LEGGERE la cartella è cieco, non verde: lo dico e esco 2 invece di dichiarare che
    // tutti i freni sono attaccati (è il rovescio esatto della malattia che questo file cura).
    console.error(`⚪ non ho potuto elencare gli script del cervello (${e.message}): il controllo ④ non ha misurato.`);
    process.exit(2);
  }

  const v = verdetto({
    rotto,
    sconosciute: chiaviSconosciute(hooks),
    orfani: comandiOrfani(comandi, (f) => existsSync(join(REPO, f))),
    staccati,
  });

  if (!v.righe.length) {
    console.log(`🪝 GLI HOOK SONO ATTACCATI — ${comandi.length} comandi su ${Object.keys(hooks).length} eventi, tutti verso file che esistono.`);
    for (const c of comandi) console.log(`   ✅ ${c.evento}${c.matcher ? ` (${c.matcher})` : ""} → ${c.comando}`);
    process.exit(0);
  }

  console.error("🪝 GUARDIANO DEGLI HOOK — il file dove vivono i freni non è a posto:");
  for (const r of v.righe) console.error(`  ${r}`);
  process.exit(v.esce);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
