#!/usr/bin/env node
// 🔭 IL PERIMETRO DI UN CONTROLLO — lotto 33.
//
// LA MALATTIA (dieci bloccanti, una frase sola): **il perimetro di un controllo è una dichiarazione
// scritta a mano, o un confine implicito di implementazione, invece di una misura derivata dal
// codice vero.** Non «il guardiano è sbagliato»: il guardiano fa benissimo il suo lavoro dentro un
// recinto che qualcuno ha disegnato una volta e nessuno ha più confrontato con la realtà.
//
// Le sei forme che ha preso, tutte con la stessa radice:
//   AR-373  l'elenco dei battiti attesi è scritto a mano → chiede un battito che nessuno manda
//   AR-379  i vincoli del giro si contano da una seconda lista → sei allarmi rossi non contati
//   AR-387  … e il giro si chiude «pulito» lo stesso
//   AR-380  il guardiano della firma cerca sintassi JavaScript → gli script shell scrivono liberi
//   AR-381  il guardiano delle uscite legge una cartella sola → otto mani mai contate come mani
//   AR-382  il guardiano delle porte legge un livello solo → tre push su main fuori dal cancello
//   AR-206  il permesso è un jolly su una cartella scrivibile → più largo del cancello che protegge
//   AR-409  la serratura classifica per VERBO invece che per effetto → tre GET che scrivono passano
//
// Ogni volta la dinamica è identica, ed è la parte che conta: **il guardiano nasce verde e resta
// verde**, perché non trova niente fuori dal suo recinto — e un verde non fa domande. Un perimetro
// dedotto dagli esempi disponibili al momento della nascita non è un errore che si nota: è un errore
// che si eredita.
//
// LA CURA: smettere di scrivere il perimetro e cominciare a MISURARLO. Chi vuole tenere qualcosa
// fuori lo dichiara per nome con il perché — un'esenzione si discute, un'omissione no perché nessuno
// la vede. È lo stesso principio già scelto per le esenzioni delle uscite e per i tetti che scendono.
//
// 🟢 Nessun I/O nelle decisioni: `ammesso`, `derivaNomi`, `confronta` e `codiceUscita` sono funzioni
// pure. `elencaFile` tocca il disco ma prende il lettore da fuori, così un test lo esegue su un
// albero finto senza scrivere niente. È il punto ③ del mansionario: la logica che decide deve stare
// dove un test la può ESEGUIRE, non dove si può solo cercare una parola.
//
// Prova comportamentale: node cervello/test/perimetro-derivato.test.mjs

import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

/** Cartelle che non sono codice della macchina: entrarci non aggiunge copertura, aggiunge rumore. */
export const ESCLUSI_SEMPRE = ["node_modules", ".git", ".next", "dist", "build", "coverage"];

/**
 * Questo file è dentro il perimetro?
 *
 * `escludi` sono prefissi di percorso RELATIVO alla radice, confrontati per segmento: "test"
 * esclude `test/x.mjs` e non `testimoni.mjs`. Il confronto per segmento è la parte che conta —
 * un `startsWith` sul testo nudo è il modo classico di escludere per sbaglio un fratello sano.
 */
export function ammesso(rel, { estensioni = [], escludi = [] } = {}) {
  const p = String(rel || "").split(sep).join("/");
  if (!p) return false;
  if (estensioni.length && !estensioni.some((e) => p.endsWith(e))) return false;
  const segmenti = p.split("/");
  for (const x of [...ESCLUSI_SEMPRE, ...escludi]) {
    const q = String(x).replace(/^\.\//, "").replace(/\/+$/, "").split("/").filter(Boolean);
    if (!q.length) continue;
    // un nome solo (`test`, `node_modules`) esclude quella cartella o quel file OVUNQUE si trovi;
    // un percorso (`vps/tmp`) esclude solo quel ramo, a partire dalla radice.
    if (q.length === 1) {
      if (segmenti.includes(q[0])) return false;
      continue;
    }
    if (q.every((s, i) => segmenti[i] === s)) return false;
  }
  return true;
}

/**
 * Tutti i file del perimetro, RICORSIVAMENTE, in ordine stabile.
 *
 * `io.leggiCartella` si può iniettare: senza, legge il disco. Torna `null` — non `[]` — se la
 * radice non si può leggere, perché «non ho potuto guardare» e «non c'è niente» sono due risposte
 * diverse e confonderle è esattamente come nascono i guardiani ciechi che si dichiarano verdi.
 */
export function elencaFile(radice, opzioni = {}, io = {}) {
  const leggiCartella = io.leggiCartella || ((d) => readdirSync(d, { withFileTypes: true }));
  const fuori = [];
  let toccataAlmenoUna = false;

  const scendi = (dir) => {
    let voci;
    try {
      voci = leggiCartella(dir);
    } catch {
      return; // una sottocartella illeggibile non azzera il resto: si annota sotto
    }
    toccataAlmenoUna = true;
    for (const v of [...voci].sort((a, b) => String(a.name).localeCompare(String(b.name)))) {
      const pieno = join(dir, v.name);
      const rel = relative(radice, pieno).split(sep).join("/");
      const isDir = typeof v.isDirectory === "function" ? v.isDirectory() : Boolean(v.directory);
      if (isDir) {
        if (ammesso(rel + "/_", { escludi: opzioni.escludi })) scendi(pieno);
        continue;
      }
      if (ammesso(rel, opzioni)) fuori.push(rel);
    }
  };

  scendi(radice);
  if (!toccataAlmenoUna) return null;
  return fuori.sort();
}

/**
 * I nomi che il CODICE VERO dichiara, estratti col primo gruppo di cattura.
 * È l'opposto di una lista scritta a mano: se il codice cambia, questo cambia con lui.
 */
export function derivaNomi(testo, re) {
  const fuori = new Set();
  const rx = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  for (const m of String(testo || "").matchAll(rx)) {
    const n = (m[1] ?? m[0] ?? "").trim();
    if (n) fuori.add(n);
  }
  return fuori;
}

/**
 * Il confronto fra ciò che è dichiarato e ciò che il codice fa davvero.
 *   · `mancanti` — il codice lo fa, nessuno l'ha dichiarato  → il buco che questa malattia produce
 *   · `orfani`   — dichiarato, il codice non lo fa più       → l'allarme fantasma di AR-373
 * Le esenzioni sono per nome e con il perché: senza motivo NON valgono, e finiscono in `senzaMotivo`.
 */
export function confronta(dichiarati, derivati, esenzioni = {}) {
  const D = new Set([...(dichiarati || [])].map(String));
  const R = new Set([...(derivati || [])].map(String));
  const conMotivo = new Set(Object.entries(esenzioni).filter(([, m]) => String(m || "").trim().length >= 20).map(([k]) => k));
  const senzaMotivo = Object.entries(esenzioni).filter(([, m]) => String(m || "").trim().length < 20).map(([k]) => k);

  const mancanti = [...R].filter((n) => !D.has(n) && !conMotivo.has(n)).sort();
  const orfani = [...D].filter((n) => !R.has(n) && !conMotivo.has(n)).sort();
  return { mancanti, orfani, senzaMotivo: senzaMotivo.sort(), ok: !mancanti.length && !orfani.length && !senzaMotivo.length };
}

/** Contratto dei guardiani (AR-322): 0 = perimetro pieno · 1 = buco · 2 = non ho potuto misurare. */
export function codiceUscita({ cieco = 0, violazioni = 0 } = {}) {
  if (cieco > 0) return 2;
  return violazioni > 0 ? 1 : 0;
}

/** Comodità per i guardiani: legge i file del perimetro e li dà già come [{file, testo}]. */
export function leggiPerimetro(radice, opzioni = {}, io = {}) {
  const elenco = elencaFile(radice, opzioni, io);
  if (elenco == null) return null;
  const leggi = io.leggiFile || ((p) => readFileSync(p, "utf8"));
  const fuori = [];
  for (const rel of elenco) {
    try {
      fuori.push({ file: rel, testo: leggi(join(radice, rel)) });
    } catch {
      /* un file illeggibile non è un file assente: lo si salta e il chiamante conta i letti */
    }
  }
  return fuori;
}
