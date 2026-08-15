#!/usr/bin/env node
// 🪙 CONTO-MOTORE — quanto costa il motore davvero, e quanto rende.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE QUESTO FILE CURA
// ─────────────────────────────────────────────────────────────────────────────
// «Il costo si stima, il valore non si conta.» Tre sintomi, una radice sola:
//
//   ① AR-203 — la stima del consumo è un PAVIMENTO FISSO. `ai_stima_token` in motore-ai.sh fa
//      max(minuti×5.000, caratteri/4) e poi alza tutto a 50.000: due cadenze diversissime — un
//      riassunto di trenta secondi e un giro di quaranta minuti — finiscono a registrare lo stesso
//      identico numero. Un numero che non distingue due cose diverse non sta misurando: sta
//      riempiendo una casella.
//   ② AR-198 — la scelta del modello è un interruttore (premium / niente) invece che una SCALA di
//      sforzo per compito, mentre la CLI accetta già `--model` e il worker già abbassa il pensiero
//      sui compiti di volume. La leva c'era, mancava il pezzo che la tira.
//   ③ AR-202 — la spesa più grande dell'azienda non ha un KPI di resa: nessun organo può dire «a
//      business fermo, dimezza la cadenza», perché la resa non è un numero.
//
// La radice comune: il costo è stato modellato come vincolo tecnico (token, quota, soglia) e mai
// come voce di conto economico, con un numeratore e un denominatore.
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ LA LOGICA STA QUI E NON DENTRO GLI SCRIPT
// ─────────────────────────────────────────────────────────────────────────────
// Queste decisioni vivevano dentro `motore-ai.sh` (bash) e `metabolismo.mjs` (stampa). Una regola
// dentro uno script di shell non la può ESEGUIRE nessun test: si può solo cercare una parola nel
// file — ed è esattamente il modo in cui AR-203 era già stato chiuso una volta, con un grep che
// faceva centro su un commento. Qui sono funzioni PURE: niente disco, niente rete, niente orologio
// (l'istante arriva da fuori). Il punto malato le chiama.
//
// 🟢 Sola lettura. Nessun effetto all'import.

import { readFileSync } from "node:fs";

// ─────────────────────────────────────────────────────────────────────────────
// ① IL COSTO MISURATO — AR-203
// ─────────────────────────────────────────────────────────────────────────────

/** Il pavimento storico della stima: sotto questo valore `ai_stima_token` non scendeva mai. */
export const PAVIMENTO_STIMA = 50_000;

/**
 * L'usage VERO dallo stream-json della CLI.
 *
 * La CLI Claude, con `--output-format stream-json`, chiude il turno con un evento `result` che
 * porta `usage.input_tokens` / `usage.output_tokens` (più le due voci di cache). Il worker quel
 * file lo scrive già per estrarre il testo: il numero era lì accanto e nessuno l'ha guardato.
 *
 * @param {string} testo Il contenuto del transcript (una riga JSON per evento).
 * @returns {{misurato:boolean, input:number, output:number, totale:number, fonte:string, eventi:number}}
 */
export function usageDaStream(testo) {
  const righe = String(testo ?? "").split("\n");
  let daResult = null;
  let sommaAssistant = { input: 0, output: 0, quanti: 0 };
  let eventi = 0;

  for (const riga of righe) {
    const t = riga.trim();
    if (!t || t[0] !== "{") continue;
    let ev;
    try {
      ev = JSON.parse(t);
    } catch {
      continue; // riga incompleta: lo stream si legge anche mentre scorre
    }
    eventi++;
    const u = ev?.usage || ev?.message?.usage || null;
    if (!u) continue;
    const inp = numero(u.input_tokens) + numero(u.cache_creation_input_tokens) + numero(u.cache_read_input_tokens);
    const out = numero(u.output_tokens);
    if (ev.type === "result") {
      // Il `result` è autorevole: è il conto del turno intero fatto dal server.
      daResult = { input: inp, output: out };
    } else if (ev.type === "assistant") {
      sommaAssistant.input += inp;
      sommaAssistant.output += out;
      sommaAssistant.quanti++;
    }
  }

  if (daResult && daResult.input + daResult.output > 0) {
    return { misurato: true, ...daResult, totale: daResult.input + daResult.output, fonte: "stream-json:result.usage", eventi };
  }
  if (sommaAssistant.quanti > 0 && sommaAssistant.input + sommaAssistant.output > 0) {
    return {
      misurato: true,
      input: sommaAssistant.input,
      output: sommaAssistant.output,
      totale: sommaAssistant.input + sommaAssistant.output,
      fonte: `stream-json:somma di ${sommaAssistant.quanti} messaggi assistant`,
      eventi,
    };
  }
  return { misurato: false, input: 0, output: 0, totale: 0, fonte: "nessun usage nello stream: resta la stima, dichiarata", eventi };
}

function numero(x) {
  const n = Number(x);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * LE STIME GEMELLE — il sintomo di AR-203 reso un numero.
 *
 * Se due corsie DIVERSE registrano lo stesso identico conteggio di token, quel conteggio non sta
 * misurando il lavoro: sta misurando il pavimento. Questa funzione le pesca.
 *
 * @param {Array<{tipo?:string, token?:number, stima_grezza?:boolean}>} voci
 * @returns {Array<{token:number, tipi:string[], quante:number, e_il_pavimento:boolean}>}
 */
export function stimeGemelle(voci, { pavimento = PAVIMENTO_STIMA } = {}) {
  const perValore = new Map();
  for (const v of voci || []) {
    const tok = Number(v?.token);
    if (!Number.isFinite(tok) || tok <= 0) continue;
    if (!perValore.has(tok)) perValore.set(tok, { token: tok, tipi: new Set(), quante: 0 });
    const g = perValore.get(tok);
    g.tipi.add(String(v?.tipo || "?"));
    g.quante++;
  }
  return [...perValore.values()]
    .filter((g) => g.tipi.size >= 2)
    .map((g) => ({ token: g.token, tipi: [...g.tipi].sort(), quante: g.quante, e_il_pavimento: g.token === pavimento }))
    .sort((a, b) => b.quante - a.quante);
}

/**
 * Quanto del conto di oggi è MISURATO e quanto è stimato (e quanto è puro pavimento).
 * È il numero che rende onesta ogni frase che comincia con «oggi abbiamo speso».
 *
 * @param {Array} voci
 * @returns {{run:number, misurati:number, stimati:number, al_pavimento:number, copertura_pct:number|null, gemelle:Array}}
 */
export function coperturaMisura(voci, { pavimento = PAVIMENTO_STIMA } = {}) {
  const tutte = Array.isArray(voci) ? voci : [];
  const conNumero = tutte.filter((v) => Number.isFinite(Number(v?.token)) && Number(v.token) > 0);
  const misurati = conNumero.filter((v) => v?.stima_grezza !== true).length;
  const stimati = conNumero.filter((v) => v?.stima_grezza === true).length;
  const alPavimento = conNumero.filter((v) => Number(v.token) === pavimento).length;
  return {
    run: tutte.length,
    misurati,
    stimati,
    al_pavimento: alPavimento,
    copertura_pct: conNumero.length ? Math.round((misurati / conNumero.length) * 100) : null,
    gemelle: stimeGemelle(tutte, { pavimento }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ② LA SCALA DI SFORZO — AR-198 (e AR-618, per i senior)
// ─────────────────────────────────────────────────────────────────────────────
//
// Non un interruttore (premium / niente) ma tre gradini. Il gradino lo decide il COMPITO, non chi
// chiama. E il modello economico non è un'API a consumo — quella la Decisione #59 la vieta — è un
// modello più leggero DELLO STESSO abbonamento, dichiarato nel .env. Se non è dichiarato, la scala
// non inventa niente: resta esattamente il comportamento di prima.

/** I compiti che sono VOLUME: si riassume, si traduce, si smista. Non si ragiona. */
export const COMPITI_DI_VOLUME = new Set(["testi-volume", "classificazione", "traduzione", "trascrizione"]);

/** Le corsie che sono volume anche quando nessuno dichiara il compito. */
export const CORSIE_DI_VOLUME = new Set(["metabolizza", "diagnosi-errore", "worker-metabolizza", "worker-diagnosi-errore"]);

/**
 * Il gradino di sforzo per una corsia. PURA: le si passa anche il .env, non lo legge.
 *
 * @param {{corsia?:string, compito?:string, thinking?:string|number, modelloPremium?:string, modelloEconomico?:string}} ctx
 * @returns {{livello:"volume"|"ragionamento", modello:string, thinking:number|null, perche:string, economico_disponibile:boolean}}
 */
export function sforzoPerCorsia({ corsia = "", compito = "", thinking = null, modelloPremium = "", modelloEconomico = "" } = {}) {
  const c = String(corsia || "").trim().toLowerCase();
  const k = String(compito || "").trim().toLowerCase();
  const economicoDisponibile = String(modelloEconomico || "").trim().length > 0;

  // Il pensiero già spento da chi chiama è una dichiarazione: «qui non si ragiona».
  const pensieroSpento = thinking !== null && thinking !== undefined && String(thinking).trim() === "0";
  const eVolume = COMPITI_DI_VOLUME.has(k) || CORSIE_DI_VOLUME.has(c) || pensieroSpento;

  if (!eVolume) {
    return {
      livello: "ragionamento",
      modello: String(modelloPremium || "").trim(),
      thinking: null,
      perche: "chat, giro, ritmo e lavori di ragionamento restano sul modello pieno: qui si decide, e decidere male costa più di un token",
      economico_disponibile: economicoDisponibile,
    };
  }
  return {
    livello: "volume",
    // La clausola che conta: senza un modello economico DICHIARATO non si cambia niente. Un
    // ripiego inventato sarebbe peggio del difetto — cambierebbe la qualità senza che nessuno
    // l'abbia deciso.
    modello: economicoDisponibile ? String(modelloEconomico).trim() : String(modelloPremium || "").trim(),
    thinking: 0,
    perche: economicoDisponibile
      ? `${k || c || "compito di volume"}: si riassume, non si ragiona — va sul modello leggero dello stesso abbonamento`
      : `${k || c || "compito di volume"}: sarebbe da modello leggero, ma CERVELLO_MODELLO_ECONOMICO non è dichiarato — resta com'era, e lo dico invece di inventarlo`,
    economico_disponibile: economicoDisponibile,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ③ IL VALORE, CONTATO — AR-202
// ─────────────────────────────────────────────────────────────────────────────
//
// «Nessuno misura quanto rende un giro.» Il risultato di un giro non è un'opinione: è una card che
// Nicola ha firmato e che porta la data della chiusura. Sta scritta nella coda, in chiaro, da mesi
// — mancava solo qualcuno che la contasse.

/**
 * Le card firmate e chiuse, lette dalla coda delle approvazioni.
 * Riconosce la forma vera del file: `### ✅ #75 — … ✅ chiusa 2026-08-13 20:45` oppure
 * `### ✅ #73 — … FATTO 2026-08-11 17:05`.
 *
 * @param {string} testoCoda
 * @returns {Array<{numero:string, titolo:string, chiusa_il:string|null}>}
 */
export function cardFirmate(testoCoda) {
  const out = [];
  for (const riga of String(testoCoda ?? "").split("\n")) {
    if (!/^###\s*✅/.test(riga)) continue;
    const numero = (riga.match(/#(\d+)/) || [])[1] || "";
    const data = (riga.match(/(?:chiusa|FATTO)\s+(\d{4}-\d{2}-\d{2})/i) || [])[1] || null;
    const titolo = riga
      .replace(/^###\s*✅\s*/, "")
      .replace(/^#\d+\s*[—-]\s*/, "")
      .split("·")[0]
      .trim();
    out.push({ numero, titolo, chiusa_il: data });
  }
  return out;
}

/** I giorni fra due date `AAAA-MM-GG`, o null se una delle due non si legge. */
export function giorniFra(daISO, aISO) {
  const a = Date.parse(`${String(daISO).slice(0, 10)}T00:00:00Z`);
  const b = Date.parse(`${String(aISO).slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.round((b - a) / 86_400_000);
}

/**
 * LA RESA — il numero che AR-202 chiede e che non esisteva: euro per risultato.
 *
 * Onestà obbligatoria: se i risultati nella finestra sono ZERO il costo non si divide per zero e
 * non si nasconde. Si dice «0 risultati, X € spesi» — che è precisamente l'informazione per cui il
 * difetto è stato aperto.
 *
 * @param {{risultati:Array<{chiusa_il?:string|null}>, oggi:string, finestraGiorni?:number, burnMensileEur?:number|null, runs?:number}} p
 */
export function resa({ risultati = [], oggi = "", finestraGiorni = 30, burnMensileEur = null, runs = 0 } = {}) {
  const dentro = [];
  let senzaData = 0;
  for (const r of risultati) {
    if (!r?.chiusa_il) {
      senzaData++;
      continue;
    }
    const g = giorniFra(r.chiusa_il, oggi);
    if (g === null) {
      senzaData++;
      continue;
    }
    if (g >= 0 && g <= finestraGiorni) dentro.push(r);
  }
  const burn = Number.isFinite(Number(burnMensileEur)) && Number(burnMensileEur) > 0 ? Number(burnMensileEur) : null;
  const costoFinestra = burn === null ? null : Math.round((burn * (finestraGiorni / 30)) * 100) / 100;
  const eurPerRisultato = costoFinestra === null ? null : dentro.length === 0 ? null : Math.round((costoFinestra / dentro.length) * 100) / 100;

  return {
    finestra_giorni: finestraGiorni,
    risultati: dentro.length,
    risultati_senza_data: senzaData,
    runs,
    costo_finestra_eur: costoFinestra,
    eur_per_risultato: eurPerRisultato,
    // Il verdetto in una parola, per chi legge di fretta. `cieco` non è mai un verde.
    verdetto:
      costoFinestra === null
        ? "cieco"
        : dentro.length === 0
          ? "brucia-a-vuoto"
          : "rende",
    motivo:
      costoFinestra === null
        ? "il costo mensile non è dichiarato (registro-fatti: finanza.burn-mensile / BURN_MENSILE_EUR): senza denominatore la resa non si calcola, e uno zero sarebbe una bugia"
        : dentro.length === 0
          ? `${costoFinestra} € spesi negli ultimi ${finestraGiorni} giorni con 0 card firmate chiuse: la spesa non sta rendendo, ed è il numero che serve per decidere se tagliare la cadenza`
          : `${costoFinestra} € / ${dentro.length} risultati = ${eurPerRisultato} € per risultato negli ultimi ${finestraGiorni} giorni`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LA PORTA DA RIGA DI COMANDO — la usa `cervello/motore-ai.sh`
// ─────────────────────────────────────────────────────────────────────────────
// Due sole domande, perché sono le due che uno script di shell non può rispondere da solo:
//   node cervello/conto-motore.mjs --modello            → il modello per QUESTA corsia (vuoto = com'era)
//   node cervello/conto-motore.mjs --token-da <file>    → i token MISURATI in quel transcript (vuoto = non c'erano)
// L'import resta senza effetti: qui sotto si entra solo da CLI.

function main(argv) {
  if (argv.includes("--modello")) {
    const s = sforzoPerCorsia({
      corsia: process.env.AI_CORSIA || process.env.ROUTER_CORSIA || "",
      compito: process.env.ROUTER_COMPITO_JOB || "",
      thinking: process.env.AI_THINKING ?? null,
      modelloPremium: process.env.CERVELLO_MODELLO || "",
      modelloEconomico: process.env.CERVELLO_MODELLO_ECONOMICO || "",
    });
    process.stdout.write(s.modello || "");
    return 0;
  }
  const i = argv.indexOf("--token-da");
  if (i !== -1 && argv[i + 1]) {
    let testo = "";
    try {
      testo = readFileSync(argv[i + 1], "utf8");
    } catch {
      return 0; // nessun transcript leggibile: si tace, e chi chiama resta sulla stima dichiarata
    }
    const u = usageDaStream(testo);
    if (u.misurato && u.totale > 0) process.stdout.write(String(u.totale));
    return 0;
  }
  process.stderr.write("Uso: node cervello/conto-motore.mjs --modello | --token-da <transcript>\n");
  return 2;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exit(main(process.argv.slice(2)));
