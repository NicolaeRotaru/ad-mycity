#!/usr/bin/env node
// costo-ai.mjs — registra il CONSUMO della macchina (token/durata per run) e tiene un totale giornaliero.
// 🟢 Sola lettura verso l'esterno. Scrive solo costo-ai.json nel vault.
//
// Risolve AR-020: la macchina era cieca sul proprio costo. Invocato a fine giro/ritmo, accumula il consumo
// e lascia un battito + segnale così una sentinella allerta al superamento della soglia giornaliera.
//
// Uso:
//   node cervello/costo-ai.mjs --tipo=giro --durata-sec=123 [--token=45000] [--modello=claude-opus]
//   node cervello/costo-ai.mjs --json     -> stato attuale senza aggiungere nulla
//
// Exit: 0 sempre (1 solo su errore interno).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";
import { tokenPerGate } from "./fonte-numero.mjs";
import { msDaTimbro } from "./ora-piacenza.mjs";

const JSON_MODE = process.argv.includes("--json");
const OUT_PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/costo-ai.json");
const SOGLIA_DEFAULT = 2_000_000;
// Finestra rolling sessione Max/Cursor (~5h) — allineata a retry-policy.mjs MAX_ATTESA_QUOTA_MIN.
export const SESSIONE_ROLLING_MIN = Number(process.env.COSTO_SESSIONE_ROLLING_MIN || 360);

// ─────────────────────────────────────────────────────────────────────────────
// AR-442 — LA FINESTRA SCORREVOLE NON È IL GIORNO SOLARE
// ─────────────────────────────────────────────────────────────────────────────
// Il muro vero della quota è una finestra di ~6 ore che scorre, non la mezzanotte. Ma le voci su
// cui la finestra si calcolava vivevano dentro `oggi.voci`, e a mezzanotte `oggi` viene azzerato:
// alle 00:10 la macchina poteva aver bruciato l'intera quota fra le 18 e le 24 e il conto della
// finestra ripartiva da zero. Non è un errore di misura, è un errore di CONTENITORE — il numero
// giusto stava in un cassetto che si svuota da solo ogni notte.
//
// La cura è una coda CONTINUA (`voci_recenti`), potata dalla finestra e non dal calendario. Non
// sostituisce `oggi.voci` (che serve al conto giornaliero e al Pannello): le sta accanto e
// attraversa la mezzanotte.
//
// Le due funzioni sotto sono PURE ed esportate: l'istante arriva da fuori, così un test può
// metterlo alle 00:10 senza spostare l'orologio del computer. Era l'altra metà del difetto —
// una regola che si può eseguire solo facendo passare la mezzanotte non la prova nessuno.

/**
 * Le voci che cadono ancora dentro la finestra, da qualunque giorno vengano.
 * Una voce col timbro illeggibile ESCE dal conto — ma il chiamante lo viene a sapere
 * (`tokenSessioneRolling` la conta fra le `illeggibili`): un buco che abbassa la spesa in silenzio
 * è esattamente il modo in cui un freno smette di frenare.
 */
export function finestraContinua(voci, oraMs, minuti = SESSIONE_ROLLING_MIN) {
  const ora = Number(oraMs);
  const durata = Math.max(1, Number(minuti) || SESSIONE_ROLLING_MIN);
  if (!Number.isFinite(ora)) return [];
  const cutoff = ora - durata * 60 * 1000;
  return (voci || []).filter((v) => {
    const t = msDaTimbro(v?.quando);
    return Number.isFinite(t) && t >= cutoff;
  });
}

/** Token (misurati + stimati) nella finestra rolling: il vero muro è la sessione, non il giorno. */
export function tokenSessioneRolling(voci, oraMs, minuti = SESSIONE_ROLLING_MIN) {
  const tutte = voci || [];
  const dentro = finestraContinua(tutte, oraMs, minuti);
  // Le stime contano quanto le misure: sulla quota-sessione un numero approssimato dichiarato è
  // più onesto di uno zero (AR-144).
  const tot = dentro.reduce((s, v) => (typeof v.token === "number" && Number.isFinite(v.token) ? s + v.token : s), 0);
  const illeggibili = tutte.filter((v) => !Number.isFinite(msDaTimbro(v?.quando))).length;
  return {
    token_sessione_rolling: tot,
    runs_sessione: dentro.length,
    finestra_min: Math.max(1, Number(minuti) || SESSIONE_ROLLING_MIN),
    voci_illeggibili: illeggibili,
  };
}

function getFlag(name) {
  const pref = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(pref));
  return arg ? arg.slice(pref.length).trim() : null;
}

function vuoto() {
  return {
    _cosa_e:
      "🪙 COSTO AI — consumo della macchina (token/durata per run) e totale giornaliero (AR-020). Lo aggiorna cervello/costo-ai.mjs a fine giro/ritmo; una sentinella allerta oltre la soglia. Non misura soldi veri, misura lo sforzo. La soglia giornaliera è indicativa: il vero muro è la quota-sessione rolling (~5h, vedi sessione_rolling).",
    modello_quota: "sessione-rolling",
    sessione_rolling_min: SESSIONE_ROLLING_MIN,
    aggiornato: nowPiacenza(),
    soglia_giornaliera_token: Number(process.env.COSTO_SOGLIA_TOKEN_GIORNO || SOGLIA_DEFAULT),
    oggi: { data: "", runs: 0, token_totali: 0, durata_sec_totale: 0, voci: [] },
    storico_giorni: [],
  };
}

function leggi() {
  if (!existsSync(OUT_PATH)) return vuoto();
  try {
    const j = JSON.parse(readFileSync(OUT_PATH, "utf8"));
    j.oggi = j.oggi || { data: "", runs: 0, token_totali: 0, durata_sec_totale: 0, voci: [] };
    j.storico_giorni = j.storico_giorni || [];
    return j;
  } catch {
    return vuoto();
  }
}

function main() {
  const quando = nowPiacenza();
  const oggiData = quando.slice(0, 10);
  const stato = leggi();
  stato.soglia_giornaliera_token = Number(process.env.COSTO_SOGLIA_TOKEN_GIORNO || stato.soglia_giornaliera_token || SOGLIA_DEFAULT);
  if (!stato.modello_quota) stato.modello_quota = "sessione-rolling";
  if (!stato.sessione_rolling_min) stato.sessione_rolling_min = SESSIONE_ROLLING_MIN;

  // AR-442 — la coda continua nasce, la prima volta, dalle voci di oggi: nel passaggio non si
  // perde nessuna misura. Va fatto QUI, prima del cambio giorno, che azzera `oggi.voci`.
  if (!Array.isArray(stato.voci_recenti)) stato.voci_recenti = [...(stato.oggi.voci || [])];

  // Cambio giorno: archivia il vecchio "oggi" e resetta.
  // NOTA AR-442: qui si azzera il conto del GIORNO. `voci_recenti` non si tocca — è l'unico posto
  // dove la spesa delle ultime ore sopravvive alla mezzanotte, ed è quello che il freno deve
  // guardare per non dare via libera alle 00:10 su una quota bruciata alle 23:50.
  if (stato.oggi.data && stato.oggi.data !== oggiData) {
    // AR-196 — trovato applicando il fix: l'archivio di fine giornata copiava SOLO `token_totali`,
    // cioè lo zero, e buttava via `token_stimati` — l'unico numero che esiste davvero. Per questo lo
    // storico a 60 giorni mostrava «0 token» ogni singolo giorno: non era una macchina che non spende,
    // era la memoria del costo che si cancellava da sola ogni notte a mezzanotte.
    const perGateIeri = tokenPerGate(stato.oggi);
    stato.storico_giorni.unshift({
      data: stato.oggi.data,
      runs: stato.oggi.runs,
      token_totali: stato.oggi.token_totali,
      token_stimati: stato.oggi.token_stimati || 0,
      token_per_gate: perGateIeri.valore ?? 0,
      durata_sec_totale: stato.oggi.durata_sec_totale,
    });
    if (stato.storico_giorni.length > 60) stato.storico_giorni = stato.storico_giorni.slice(0, 60);
    stato.oggi = { data: oggiData, runs: 0, token_totali: 0, durata_sec_totale: 0, voci: [] };
  }
  if (!stato.oggi.data) stato.oggi.data = oggiData;

  const tipo = getFlag("tipo");
  if (tipo && !JSON_MODE) {
    const durata = Number(getFlag("durata-sec") || 0) || 0;
    const tokRaw = getFlag("token");
    const token = tokRaw != null && !Number.isNaN(Number(tokRaw)) ? Number(tokRaw) : null;
    const modello = getFlag("modello");
    // AR-043: --stima = il conteggio token è una stima (non una misura reale dalla CLI).
    // Le stime finiscono in un contatore separato e NON alzano token_totali usato dai gate.
    const isStima = process.argv.includes("--stima");
    const voce = { quando, tipo, durata_sec: durata, token, modello: modello || null };
    if (isStima) voce.stima_grezza = true;
    stato.oggi.voci.push(voce);
    stato.voci_recenti.push(voce); // AR-442: la stessa voce entra anche nella coda che scorre
    stato.oggi.runs += 1;
    stato.oggi.durata_sec_totale += durata;
    if (token != null && !isStima) stato.oggi.token_totali += token;
    if (isStima && token != null) {
      stato.oggi.token_stimati = (stato.oggi.token_stimati || 0) + token;
    }
  }

  stato.aggiornato = quando;
  // AR-144: nessuna chiamata da giro.sh/ritmo.sh passa MAI un token reale (sempre --stima),
  // quindi token_totali restava a 0 per costruzione e il gate non scattava mai, anche a
  // milioni di token stimati/giorno. Il gate ora guarda il PIÙ ALTO fra i due contatori:
  // se un giorno arriva un conteggio reale, non si diluisce con le stime; finché arrivano
  // solo stime (oggi sempre), sono loro a far scattare l'allarme — meglio un margine di
  // errore che un freno che non frena mai.
  //
  // AR-196: quel massimo restava una VARIABILE LOCALE, buona solo per stamparla. Chi frena davvero
  // (giro.sh) legge il file, e nel file c'era solo `token_totali` — cioè 0 per sei giorni di fila.
  // Il fix di AR-144 era atterrato nel produttore e non attraversava mai il contratto JSON fra i due.
  // Ora il numero-su-cui-si-frena è un CAMPO SCRITTO, con la sua provenienza accanto: un consumatore
  // che non lo trova sa di essere cieco, invece di leggere uno zero e credersi sotto soglia.
  const perGate = tokenPerGate(stato.oggi);
  stato.oggi.token_per_gate = perGate.valore ?? 0;
  stato.oggi.token_fonte = perGate.fonte;
  const superata = perGate.valore != null && perGate.valore > stato.soglia_giornaliera_token;
  // AR-442 — l'istante di adesso letto dal timbro di Piacenza (prima l'offset era +02:00 scritto a
  // mano: d'inverno la finestra si spostava di un'ora, sempre nel verso che perdona la spesa).
  const daTimbro = msDaTimbro(quando);
  const oraMs = Number.isFinite(daTimbro) ? daTimbro : Date.now();
  // La finestra si pota sulla coda CONTINUA, non su `oggi.voci`: è la riga che fa attraversare la
  // mezzanotte al conto delle ultime sei ore.
  stato.voci_recenti = finestraContinua(stato.voci_recenti, oraMs, SESSIONE_ROLLING_MIN);
  const sessione = tokenSessioneRolling(stato.voci_recenti, oraMs, SESSIONE_ROLLING_MIN);
  stato.sessione_rolling = { ...sessione, aggiornato: quando };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(stato, null, 2) + "\n", "utf8");

  stampSegnale(
    "costo-ai",
    superata ? "warn" : "ok",
    `token oggi ${stato.oggi.token_totali} reali + ${stato.oggi.token_stimati || 0} stimati (gate su ${stato.oggi.token_per_gate}) / soglia ${stato.soglia_giornaliera_token} · ${quando}`
  ).catch(() => {});

  if (JSON_MODE) {
    console.log(JSON.stringify(stato, null, 2));
  } else {
    console.log(`\n🪙 COSTO AI — ${oggiData}\n`);
    console.log(`Runs oggi:    ${stato.oggi.runs}`);
    console.log(`Token oggi:   ${stato.oggi.token_totali} reali + ${stato.oggi.token_stimati || 0} stimati (gate su ${stato.oggi.token_per_gate}) / soglia ${stato.soglia_giornaliera_token}${superata ? "  ⚠️  SOGLIA SUPERATA" : ""}`);
    console.log(`Durata oggi:  ${stato.oggi.durata_sec_totale}s`);
    console.log(`\nScritto: ${OUT_PATH}`);
  }

  process.exit(0);
}

// AR-442 — `main()` gira solo da CLI. Prima partiva anche al semplice `import`, e un file che
// SCRIVE il contatore della spesa appena qualcuno lo importa non è testabile: l'unico modo di
// provare la finestra sarebbe stato aspettare la mezzanotte vera. Ora le funzioni pure sopra si
// importano senza effetti, e il comportamento da CLI non cambia di una riga.
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  try {
    main();
  } catch (e) {
    console.error("ERRORE costo-ai:", e.message || e);
    process.exit(1);
  }
}
