#!/usr/bin/env node
// ⏳ ATTESA-SENZA-FINE — una chiamata di rete senza tempo massimo, dentro un cancello, è un cancello
// che si può bloccare tenendo aperta una connessione.
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE (AR-439)
// ─────────────────────────────────────────────────────────────────────────────
// Il battito che i guardiani mandano alla memoria (`stampSegnale`, in git-github.mjs) partiva senza
// `AbortSignal.timeout`. Se la memoria risponde lenta, il processo resta appeso lì e il giro non
// finisce più. La cosa che l'ha tenuto nascosto: **l'errore che produce non è un rosso, è
// un'ATTESA** — e un processo fermo somiglia moltissimo a un processo che lavora.
//
// Il timeout su quella riga adesso c'è. Ma la radice non è quella riga: la stessa protezione
// esisteva già in `freschezza-segnali.mjs` e non era mai stata portata nelle copie accanto. «La
// regola vive in N posti e N-1 restano indietro.» Curare il punto e lasciare in piedi il modo in
// cui si è rotto vuol dire rifare il lavoro fra un mese.
//
// Quindi qui non c'è solo lo scanner: c'è un CRICCHETTO. Il numero di chiamate senza tetto può solo
// SCENDERE. Chi ne aggiunge una trova rosso; il debito ereditato non blocca il lavoro di oggi ma non
// può nemmeno crescere in silenzio.
//
// ⚠️ IL PERIMETRO SI MISURA, NON SI SCRIVE (lezione del lotto 33): l'elenco dei file arriva da
// `cervello/perimetro.mjs`, che lo deriva dal disco. Ciò che resta fuori è dichiarato per nome con
// il perché, qui sotto — un'esenzione si discute, un'omissione no perché nessuno la vede.
//
// 🟢 Sola lettura (tranne `--aggiorna`, che abbassa il tetto).
// Uso: node cervello/attesa-senza-fine.mjs [--json] [--aggiorna]
// Exit (AR-322): 0 = sotto il tetto · 1 = il debito è cresciuto · 2 = non ho potuto misurare.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { elencaFile } from "./perimetro.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const TETTO_FILE = process.env.ATTESA_TETTO || join(QUI, "attese-senza-fine.json");

/**
 * Cosa resta FUORI dal conto, e perché. Ogni voce è una decisione, non una dimenticanza.
 */
export const FUORI_PERIMETRO = [
  { cartella: "test", perche: "le prove finte non fanno rete vera: un fetch appeso lì blocca un test, non un giro" },
  { cartella: "vps", perche: "script di installazione lanciati a mano da Nicola, non dentro un cancello automatico" },
  { cartella: "node_modules", perche: "codice di terzi: il tetto non lo può abbassare nessuno di qui" },
];

/**
 * Il testo senza le righe di commento, ma con le RIGHE al loro posto (svuotate, non tolte) così i
 * numeri restano quelli veri.
 *
 * ⚠️ Perché questo passaggio esiste: la prima versione di questo scanner guardava il testo grezzo,
 * e il commento che spiega il fix di AR-439 nomina `AbortSignal.timeout` — quindi il guardiano
 * vedeva il nome della protezione dentro la SPIEGAZIONE e dichiarava protetta una chiamata che non
 * lo era. L'ho scoperto solo perché ho tolto il timeout apposta e il test è rimasto verde: un
 * controllo che legge i commenti misura le buone intenzioni, non il codice.
 */
export function senzaCommenti(testo) {
  let dentroBlocco = false;
  return String(testo ?? "")
    .split("\n")
    .map((l) => {
      const t = l.trim();
      if (dentroBlocco) {
        if (t.includes("*/")) dentroBlocco = false;
        return "";
      }
      if (t.startsWith("/*")) {
        if (!t.includes("*/")) dentroBlocco = true;
        return "";
      }
      if (t.startsWith("//") || t.startsWith("*")) return "";
      // commento a fine riga: si taglia solo se non c'è una virgoletta prima (evita gli URL http://)
      const i = l.indexOf("//");
      if (i > 0 && !/["'`]/.test(l.slice(0, i))) return l.slice(0, i);
      return l;
    })
    .join("\n");
}

/**
 * Il testo degli argomenti di una chiamata, dalla parentesi aperta alla sua CHIUSA.
 * Meglio di una finestra di N righe fisse: un oggetto di opzioni lungo non sfugge, e uno corto non
 * si porta dentro la chiamata dopo.
 */
function argomentiDa(testo, aperta) {
  let livello = 0;
  for (let i = aperta; i < testo.length; i++) {
    const c = testo[i];
    if (c === "(") livello++;
    else if (c === ")") {
      livello--;
      if (livello === 0) return testo.slice(aperta, i + 1);
    }
  }
  return testo.slice(aperta, aperta + 2000); // parentesi non chiusa: si guarda un pezzo e basta
}

/**
 * I `fetch(` di un testo che NON hanno un tempo massimo. PURA: le si passa il testo.
 *
 * Cosa conta come «ha un tetto»: un `AbortSignal.timeout(...)`, oppure un `signal:` qualunque —
 * in quel caso il tetto lo mette il chiamante, ed è una scelta dichiarata invece che un vuoto.
 *
 * @param {string} testo
 * @returns {Array<{riga:number, codice:string}>}
 */
export function fetchSenzaTetto(testo) {
  const pulito = senzaCommenti(testo);
  const originale = String(testo ?? "").split("\n");
  const fuori = [];
  const rx = /\bfetch\s*\(/g;
  let m;
  while ((m = rx.exec(pulito)) !== null) {
    const aperta = m.index + m[0].length - 1;
    const argomenti = argomentiDa(pulito, aperta);
    if (/AbortSignal\.timeout|(^|[\s,{(])signal\s*:/m.test(argomenti)) continue;
    const riga = pulito.slice(0, m.index).split("\n").length;
    fuori.push({ riga, codice: (originale[riga - 1] || "").trim().slice(0, 120) });
  }
  return fuori;
}

/** Il verdetto del cricchetto. PURO. */
export function verdettoTetto({ totale, tetto }) {
  if (!Number.isFinite(tetto)) return { ok: false, motivo: "nessun tetto dichiarato: un debito senza massimo è la curva silenziosa che stiamo curando" };
  if (totale > tetto) return { ok: false, motivo: `${totale} attese senza tetto contro un massimo di ${tetto}: qualcuno ne ha appena aggiunta una` };
  return { ok: true, motivo: totale < tetto ? `${totale} contro un tetto di ${tetto}: è sceso — abbassalo con --aggiorna` : `${totale}, esattamente al tetto` };
}

/** Il censimento sul perimetro derivato. Torna `cieco:true` se il perimetro non si è potuto leggere. */
export function censimento(radice = QUI, leggi = (p) => readFileSync(p, "utf8")) {
  const file = elencaFile(radice, {
    estensioni: [".mjs"],
    escludi: FUORI_PERIMETRO.map((x) => x.cartella),
  });
  if (file === null) return { cieco: true, per_file: {}, totale: 0, file_letti: 0, motivo: `perimetro non derivabile da ${radice}` };

  const perFile = {};
  let totale = 0;
  let letti = 0;
  for (const rel of file) {
    let testo;
    try {
      testo = leggi(join(radice, rel));
    } catch {
      continue;
    }
    letti++;
    const f = fetchSenzaTetto(testo);
    if (f.length) {
      perFile[rel] = f;
      totale += f.length;
    }
  }
  return { cieco: false, per_file: perFile, totale, file_letti: letti, motivo: `${letti} file letti sul perimetro derivato` };
}

function main() {
  let conf;
  try {
    conf = JSON.parse(readFileSync(TETTO_FILE, "utf8"));
  } catch (e) {
    console.error(`⛔ ATTESA-SENZA-FINE CIECO: non ho potuto leggere il tetto (${TETTO_FILE}: ${e?.message || e}) — non è un verde.`);
    process.exit(2);
  }
  const c = censimento(QUI);
  if (c.cieco) {
    console.error(`⛔ ATTESA-SENZA-FINE CIECO: ${c.motivo}`);
    process.exit(2);
  }

  if (process.argv.includes("--aggiorna")) {
    if (c.totale < conf.tetto) {
      writeFileSync(TETTO_FILE, JSON.stringify({ ...conf, tetto: c.totale, aggiornato: new Date().toISOString().slice(0, 10) }, null, 2) + "\n");
      console.log(`📉 Tetto sceso da ${conf.tetto} a ${c.totale}. (Scende e non risale: è un cricchetto, non un termostato.)`);
    } else {
      console.log(`Il tetto resta ${conf.tetto}: oggi sono ${c.totale}, e un tetto non si alza mai.`);
    }
    process.exit(0);
  }

  const v = verdettoTetto({ totale: c.totale, tetto: conf.tetto });
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ ...c, tetto: conf.tetto, ok: v.ok, verdetto: v.motivo, fuori_perimetro: FUORI_PERIMETRO }, null, 2));
  } else {
    console.log(`\n⏳ ATTESE SENZA FINE — ${c.totale} chiamate di rete senza un tempo massimo (tetto ${conf.tetto}, ${c.file_letti} file letti)`);
    for (const [f, righe] of Object.entries(c.per_file)) console.log(`   • ${f}: righe ${righe.map((r) => r.riga).join(", ")}`);
    console.log(`\n   ${v.ok ? "✅" : "⛔"} ${v.motivo}`);
    if (!v.ok) console.log(`   Cura: 'signal: AbortSignal.timeout(8000)' nell'oggetto opzioni, come fa freschezza-segnali.mjs.`);
  }
  process.exit(v.ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
