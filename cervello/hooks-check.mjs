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

/** I freni costruiti e non ancora agganciati, ognuno con la data entro cui deve esserlo (AR-526). */
export const IN_ATTESA = "cervello/hook-in-attesa.json";

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

/**
 * LA TERZA STRADA (AR-526) — «costruito» e «agganciato» non succedono nello stesso momento.
 *
 * PERCHÉ SERVE. `.claude/settings.json` è nel deny-list di questa macchina, e deve restarci: è il
 * file che può staccare tutti i freni insieme, compreso il divieto di leggere i `.env`. Quindi io
 * scrivo l'hook e Nicola lo attacca — due momenti diversi, a volte due giorni diversi. In mezzo, il
 * controllo ④ direbbe rosso su un freno appena costruito, cioè sul comportamento giusto. E un
 * guardiano che diventa rosso quando fai la cosa giusta viene aggirato al secondo giro.
 *
 * La forma della cura non me la sono inventata: il sorvegliante ha già lo stesso problema coi gate
 * («il test esiste, ma in una PR non ancora mergiata») e lo risolve con un terzo stato GIALLO che
 * pretende il numero della PR. Qui pretende anche una DATA — perché la differenza fra un'attesa e
 * un'esenzione è tutta lì. Passata la data, rosso.
 *
 * Non tocca `freniNonAttaccati`: quella riga è il `cerca` di una mutazione (AR-455), e riscriverla
 * avrebbe accecato la prova nell'atto stesso di allargare il controllo che protegge.
 *
 * @param {string[]} staccati   l'uscita di `freniNonAttaccati`
 * @param {Array<{file:string,pr?:string,scade?:string,perche?:string}>} registro
 * @param {string} oggi         AAAA-MM-GG
 */
export function smistaStaccati(staccati = [], registro = [], oggi = "") {
  const perFile = new Map((Array.isArray(registro) ? registro : []).map((v) => [v.file, v]));
  const inAttesa = [];
  const scaduti = [];
  const orfani = [];
  for (const s of staccati) {
    const v = perFile.get(s);
    // Senza data non è un'attesa: è un'esenzione scritta male, e vale come se non ci fosse.
    if (!v || !v.scade) {
      orfani.push(s);
      continue;
    }
    if (oggi && v.scade < oggi) scaduti.push({ file: s, ...v });
    else inAttesa.push({ file: s, ...v });
  }
  return { inAttesa, scaduti, orfani };
}

/** Il verdetto: le righe da dire e se si blocca. Tace quando non c'è niente da dire. */
export function verdetto({ rotto = null, sconosciute = [], orfani = [], staccati = [], inAttesa = [], scaduti = [] } = {}) {
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
  for (const s of scaduti) {
    righe.push(
      `❌ ${s.file} doveva essere agganciato entro il ${s.scade} e non lo è` +
        `\n   → l'attesa è scaduta: da adesso è un'esenzione, non un'attesa. O lo attacchi (${s.evento || "?"}), o togli la voce da cervello/hook-in-attesa.json e dichiara il debito.`,
    );
  }
  // Il giallo NON entra nel codice d'uscita: è debito dichiarato, con una data che lo farà diventare
  // rosso da solo. Contarlo come violazione vorrebbe dire tenere la CI rossa per tutto il tempo che
  // passa fra «l'ho costruito» e «Nicola l'ha incollato» — cioè punire il momento giusto.
  const gialle = inAttesa.map(
    (s) =>
      `⏳ ${s.file} è costruito ma non ancora attaccato (${s.evento || "?"}, ${s.pr || "PR non indicata"}) — scade il ${s.scade}` +
      `\n   → fino ad allora conta come debito, non come difesa: il freno NON frena.`,
  );
  return { righe: [...righe, ...gialle], esce: righe.length ? 1 : 0 };
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

  // La terza strada: chi è staccato ma DICHIARATO in attesa, con la sua data (AR-526).
  let registro = [];
  try {
    registro = JSON.parse(readFileSync(join(REPO, IN_ATTESA), "utf8")).in_attesa || [];
  } catch {
    // Registro assente o illeggibile: nessuna attesa dichiarata, quindi tutti gli staccati restano
    // rossi. È il verso giusto in cui sbagliare — un file che non si legge non può assolvere nessuno.
  }
  // `--senza-attese` toglie il periodo di grazia: le attese dichiarate tornano rosse come tutti gli
  // altri staccati. Serve perché un difetto APERTO deve avere un comando che diventa verde solo
  // quando è davvero riparato — e «riparato», per un hook, vuol dire agganciato, non dichiarato.
  // Senza questo flag il comando di verifica di quei difetti sarebbe verde dal primo giorno, cioè
  // esattamente la chiusura sulla lettera di AR-455.
  //
  // È la prova di questi quattro difetti, e li nomino qui perché un comando condiviso che non dice
  // chi chiude li chiuderebbe tutti alla cieca — compresi quelli mai toccati:
  //   · AR-525 — pre-scrittura.mjs su PreToolUse (le scritture che nessuna guardia vede)
  //   · AR-527 — cancello-senior.mjs su SubagentStop (i senior che consegnano senza cancello)
  //   · AR-528 — memoria-guardia.mjs su SessionStart/PreCompact/SessionEnd (la memoria che muore con la copia)
  //   · AR-522 — intento-turno.mjs su UserPromptSubmit (il perimetro del turno che non esiste al primo giro)
  // Ognuno resta rosso finché IL SUO script non compare fra i comandi attaccati.
  const senzaAttese = process.argv.includes("--senza-attese");
  const smistati = senzaAttese
    ? { orfani: staccati, inAttesa: [], scaduti: [] }
    : smistaStaccati(staccati, registro, new Date().toISOString().slice(0, 10));

  const v = verdetto({
    rotto,
    sconosciute: chiaviSconosciute(hooks),
    orfani: comandiOrfani(comandi, (f) => existsSync(join(REPO, f))),
    staccati: smistati.orfani,
    inAttesa: smistati.inAttesa,
    scaduti: smistati.scaduti,
  });

  if (!v.esce) {
    console.log(`🪝 GLI HOOK SONO ATTACCATI — ${comandi.length} comandi su ${Object.keys(hooks).length} eventi, tutti verso file che esistono.`);
    for (const c of comandi) console.log(`   ✅ ${c.evento}${c.matcher ? ` (${c.matcher})` : ""} → ${c.comando}`);
    // Le attese si stampano DOPO il verde e non al posto suo: sono debito dichiarato, e chi legge
    // deve vedere sia che il file è a posto sia che questi freni ancora non frenano.
    for (const r of v.righe) console.log(`  ${r}`);
    process.exit(0);
  }

  console.error("🪝 GUARDIANO DEGLI HOOK — il file dove vivono i freni non è a posto:");
  for (const r of v.righe) console.error(`  ${r}`);
  process.exit(v.esce);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
