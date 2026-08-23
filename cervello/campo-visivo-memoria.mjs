#!/usr/bin/env node
// 👁️ QUANTA MEMORIA VIVA NON GUARDA NESSUNO — il punto cieco detto come NUMERO. 🟢 Sola lettura.
//
// IL DIFETTO CHE CHIUDE (AR-807, clausola b). Il controllo che cerca i testi peggiorati
// (`cancello-stop.mjs`) legge ogni file fino a `TETTO_TESTO` caratteri e poi taglia. Sul tagliato non
// accusa — dice ⚪, ed è giusto: un giudizio su una parte non è un giudizio sul tutto. Ma quel ⚪
// esce solo quando qualcuno tocca quel file, in fondo a un elenco lungo, a lotto già finito. Il
// 23/8 è uscito come `exit 2` sulla coda delle azioni, e nessuno lo aveva visto arrivare.
//
// Un punto cieco che si scopre di rimbalzo non è un punto cieco dichiarato. Qui diventa un numero
// che si legge a ogni lotto, con un tetto che scende e non risale.
//
// COSA MISURA. La somma dei caratteri che stanno OLTRE il campo visivo, su tutti i testi vivi della
// memoria. Non «quanti file sfondano» — quello lascerebbe un file crescere da 210.000 a 500.000
// senza che cambi niente. I caratteri sono la misura di quanto testo, materialmente, nessuno guarda.
//
// IL PERIMETRO SI DEDUCE DALLA FORMA, NON DA UN ELENCO. I testi vivi sono i `.md` del primo livello
// di `90-Memoria-AI/`: quelli che un lotto riscrive e che Nicola legge per decidere. Le sottocartelle
// (`Storico/`, `Archivio/`, `Briefing/`) sono storia e non si riscrivono, quindi restano fuori. Un
// file vivo che nasce domani entra nel perimetro da solo — un elenco scritto a mano no, e sarebbe la
// malattia `perimetro-dedotto-non-misurato`.
//
// L'UNICA ESENZIONE, e perché è dichiarata qui e non nascosta. `DECISIONI.md` è append-only per
// regola di Nicola («log append-only … Non riscrivere mai le righe vecchie», CLAUDE.md): può solo
// crescere. Metterlo sotto un tetto che scende sarebbe un rosso che nessuno può far diventare verde,
// cioè il rosso che si impara ad aggirare. Fa 823.056 caratteri e sfonda di 623.056: il numero resta
// in chiaro nell'uscita, fuori dal totale, perché tacerlo sarebbe barare.
//
// Uso:
//   node cervello/campo-visivo-memoria.mjs
//   node cervello/campo-visivo-memoria.mjs --json
//   node cervello/campo-visivo-memoria.mjs --zero    → rosso finché UN carattere resta fuori campo
//
// Uscita (contratto guardiani, AR-322):
//   0 = il punto cieco non si è allargato (sotto o pari al tetto, o non c'è punto cieco)
//   1 = si è allargato: un testo vivo è cresciuto oltre quello che il controllo riesce a leggere
//   2 = non ho potuto misurare (cartella assente) — ⚪, mai un verde
//
// `--zero` è un metro diverso e serve a una cosa sola: fare da PROVA a un difetto ancora aperto
// (AR-808). Il metro normale chiede «il buco si è allargato?» e oggi risponde no, giustamente — c'è
// un tetto e siamo sotto. `--zero` chiede «il buco c'è?», che è la domanda a cui una scheda deve
// saper rispondere rosso finché è aperta e verde quando è curata. Senza, la prova di AR-808 sarebbe
// un comando che esce 0 su un difetto che c'è: cioè una scheda che si chiude da sola.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";
// Il campo visivo si CHIEDE a chi taglia, non si riscrive qui. Due dichiarazioni dello stesso numero
// sono due numeri che si allontanano: è già successo in questa casa, e il commento che sta accanto a
// `TETTO_TESTO` lo racconta.
import { TETTO_TESTO } from "./cancello-stop.mjs";

const JSON_MODE = process.argv.includes("--json");
const ZERO_MODE = process.argv.includes("--zero");
const CARTELLA = process.env.MEMORIA_VIVA_DIR || join(AD_ROOT, "MyCity-Vault/90-Memoria-AI");
const TETTI = process.env.TETTI_FILE || join(AD_ROOT, "cervello/tetti-lotto.json");

/** Append-only per regola di Nicola: cresce e basta, quindi non entra nel totale. Vedi la testa del file. */
export const ESENTI = ["DECISIONI.md"];

/**
 * I testi vivi: i `.md` del primo livello, in ordine. Le sottocartelle sono storia e restano fuori.
 *
 * Pura sui lettori, così la regola si prova senza toccare il disco vero.
 */
export function testiVivi(dir, { elenca = readdirSync, tipo = statSync } = {}) {
  let voci = [];
  try {
    voci = elenca(dir);
  } catch {
    return null; // «non ho potuto guardare» non diventa «non c'è niente»
  }
  const fuori = [];
  for (const v of voci) {
    if (!v.endsWith(".md")) continue;
    try {
      if (!tipo(join(dir, v)).isFile()) continue;
    } catch {
      continue;
    }
    fuori.push(v);
  }
  return fuori.sort();
}

/**
 * Quanto testo sta oltre il campo visivo, file per file.
 *
 * @param misure [{nome, caratteri}]
 * @returns {{fuoriCampo: number, sopra: [], esenti: []}}
 */
export function puntoCieco(misure = [], { campo = TETTO_TESTO, esenti = ESENTI } = {}) {
  const sopra = [];
  const esentati = [];
  let fuoriCampo = 0;
  for (const m of misure || []) {
    const nome = String(m?.nome || "");
    const caratteri = Number(m?.caratteri);
    if (!Number.isFinite(caratteri)) continue;
    const eccesso = Math.max(0, caratteri - campo);
    if (eccesso === 0) continue;
    if (esenti.includes(nome)) {
      esentati.push({ nome, caratteri, eccesso });
      continue;
    }
    sopra.push({ nome, caratteri, eccesso });
    fuoriCampo += eccesso;
  }
  sopra.sort((a, b) => b.eccesso - a.eccesso);
  return { fuoriCampo, sopra, esenti: esentati };
}

/**
 * Il verdetto col tetto. Debito ereditato = si CONTA; debito nuovo = si BLOCCA.
 *
 * Zero fuori campo è la cura, non un tetto rispettato: quando il controllo vede tutto, il tetto
 * smette di servire e il verdetto è verde senza condizioni.
 */
export function verdettoCampoVisivo({ fuoriCampo = 0, sopra = [], tetto = null, campo = TETTO_TESTO } = {}) {
  if (fuoriCampo === 0) {
    return { esito: "ok", motivo: `nessun testo vivo supera i ${campo} caratteri: il controllo dei testi peggiorati li legge tutti interi` };
  }
  const quali = sopra.map((s) => `${s.nome} (+${s.eccesso})`).join(" · ");
  if (tetto === null || tetto === undefined) {
    return { esito: "debito", motivo: `${fuoriCampo} caratteri di memoria viva fuori dal campo visivo — ${quali} (nessun tetto ancora fissato)` };
  }
  if (fuoriCampo > tetto) {
    return {
      esito: "violazione",
      motivo:
        `il punto cieco è cresciuto da ${tetto} a ${fuoriCampo} caratteri — ${quali}. ` +
        `Ogni carattere oltre i ${campo} è testo che consegni a Nicola e che nessun controllo legge: ` +
        `accorcia il file (archivia il chiuso) prima di allungarlo ancora.`,
    };
  }
  if (fuoriCampo < tetto) {
    return { esito: "debito", motivo: `punto cieco sceso da ${tetto} a ${fuoriCampo} caratteri — abbassa il tetto con node cervello/cancello-lotto.mjs --aggiorna-tetti` };
  }
  return { esito: "debito", motivo: `${fuoriCampo} caratteri di memoria viva non li legge nessun controllo (tetto ${fuoriCampo}) — ${quali}` };
}

function main() {
  const nomi = testiVivi(CARTELLA);
  if (nomi === null) {
    console.error(`campo-visivo-memoria: ${CARTELLA} non si legge → non misuro`);
    process.exit(2);
  }
  const misure = [];
  const ciechi = [];
  for (const n of nomi) {
    try {
      misure.push({ nome: n, caratteri: readFileSync(join(CARTELLA, n), "utf8").length });
    } catch {
      // Un file che non si legge non è un file corto: si dichiara, non si conta come zero.
      ciechi.push(`${n} non si legge: il suo eccesso non è nel totale`);
    }
  }
  const c = puntoCieco(misure);
  let tetto = null;
  try {
    const t = JSON.parse(readFileSync(TETTI, "utf8"));
    tetto = Object.hasOwn(t, "memoria_fuori_campo") ? Number(t.memoria_fuori_campo) : null;
  } catch {
    ciechi.push("tetti-lotto.json illeggibile: il numero c'è, il confronto col tetto no");
  }
  const v = verdettoCampoVisivo({ fuoriCampo: c.fuoriCampo, sopra: c.sopra, tetto });

  if (JSON_MODE) {
    console.log(JSON.stringify({ ok: v.esito !== "violazione", esito: v.esito, motivo: v.motivo, campo: TETTO_TESTO, fuori_campo: c.fuoriCampo, tetto, sopra: c.sopra, esenti: c.esenti, guardati: misure.length, ciechi }, null, 2));
  } else {
    console.log("👁️  QUANTA MEMORIA VIVA NON GUARDA NESSUNO\n");
    for (const x of ciechi) console.log(`  ⚪ ${x}`);
    console.log(`  · campo visivo del controllo: ${TETTO_TESTO} caratteri`);
    console.log(`  · testi vivi guardati: ${misure.length}`);
    for (const s of c.sopra) console.log(`  · ${s.nome}: ${s.caratteri} caratteri, ne restano fuori ${s.eccesso}`);
    for (const e of c.esenti) console.log(`  · ${e.nome}: ${e.caratteri} caratteri (+${e.eccesso}) — append-only per regola di Nicola, fuori dal totale`);
    console.log(`\n${v.esito === "violazione" ? "⛔" : v.esito === "debito" ? "⚠️ " : "✅"} ${v.motivo}`);
  }
  // `--zero`: il metro della scheda aperta. Non guarda il tetto — guarda se resta fuori campo anche
  // un solo carattere.
  if (ZERO_MODE) process.exit(c.fuoriCampo === 0 ? 0 : 1);
  process.exit(v.esito === "violazione" ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
