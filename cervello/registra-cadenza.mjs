#!/usr/bin/env node
// registra-cadenza.mjs — LA PENNA DEL REGISTRO DELLE CADENZE (AR-629 · AR-632 · AR-634).
//
// Scrive la riga di esito di una cadenza in `esito-cadenze.json`. Prima questa penna era uno
// script inline `node -e` dentro lib-cadenza.sh: nessun test poteva eseguirla da sola, e infatti
// portava due difetti che nessun test aveva mai visto:
//
//   · AR-629/AR-634 — l'ora era `Date.now()+2*3600*1000`: l'ora legale (CEST, +2) scolpita nel
//     codice. A dicembre Piacenza è CET (+1): ogni timbro invernale sbagliava di un'ora, e i
//     guardiani di freschezza contavano un'ora di ritardo che non esisteva (o ne perdonavano una
//     vera). Qui l'ora la dà il fuso VERO — `Intl.DateTimeFormat` con `timeZone:"Europe/Rome"`,
//     lo stesso attrezzo di `oraPiacenza()` in coerenza-fatti.mjs — che sa da solo quando scatta
//     il cambio d'ora.
//
//   · AR-632 — il registro si azzerava da solo: `let s={}; try{ s=JSON.parse(...) }catch{}`
//     significa «file illeggibile = ricomincio da zero», e la riscrittura successiva cancellava
//     la storia di TUTTE le cadenze. E la scrittura era `writeFileSync` diretto: un crash a metà
//     produceva proprio il file mezzo scritto che al giro dopo causava l'azzeramento. Qui:
//     (a) la scrittura è ATOMICA (file temporaneo nella stessa cartella + rename): o c'è il
//         registro vecchio intero o c'è quello nuovo intero, mai un mezzo file;
//     (b) un file corrotto NON azzera niente: se ne salva una copia `.broken-<timestamp>`, si
//         riparte dal backup `.bak` (l'ultima scrittura riuscita) se esiste, e l'accaduto si
//         DICHIARA su stderr. File assente = ok partire da zero; file corrotto = evento da dire.
//
// Le decisioni vivono in funzioni PURE esportate (timbroOra, fondiEsito, interpretaRegistro),
// provate da `cervello/test/cadenza-registro.test.mjs` con istanti passati come parametro — non
// con Date.now(), che d'estate non può fallire nel modo in cui fallisce a dicembre.
//
// Uso da CLI (è come lo chiama cadenza_registra in lib-cadenza.sh):
//   CADENZA_TIPO=giro CADENZA_ESITO=pulito CADENZA_CODICE=0 … node cervello/registra-cadenza.mjs
// Percorso del registro: env CADENZA_REGISTRO (i test iniettano un percorso temporaneo qui),
// altrimenti il default relativo alla cwd, identico a prima.
// Su stdout NON esce niente: il chiamante (`cadenza_esito`) usa stdout per il solo codice.

import { readFileSync, writeFileSync, renameSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, basename } from "node:path";

export const REGISTRO_DEFAULT = "MyCity-Vault/90-Memoria-AI/auto-coscienza/esito-cadenze.json";

// Testo identico a quello che scriveva lo script inline: il Pannello lo mostra così com'è.
export const COSA_E =
  "Esito REALE dell ultima uscita di OGNI cadenza (AR-163/164/166/302/313). Prima ogni copione decideva da se se e come dire di essere andato male, e chi taceva risultava sano: monitora.sh usciva 0 anche col push fallito. Qui la cadenza che non esce si vede, perche la sua riga invecchia.";

/**
 * L'ora di Piacenza, formato "AAAA-MM-GG HH:MM" — PURA: l'istante arriva da fuori.
 * `sv-SE` produce già "2026-12-01 13:00"; `Europe/Rome` decide da solo se è CET o CEST.
 * (AR-629/AR-634: la formula vecchia sommava +2h fisse e d'inverno timbrava un'ora avanti.)
 */
export function timbroOra(quando = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(quando);
}

/**
 * Che cosa c'è scritto nel registro? PURA: prende il testo grezzo (o null se il file non c'è).
 *   → { stato: "assente" | "ok" | "corrotto", dati }
 * «assente» e «corrotto» NON sono la stessa cosa: partire da zero senza file è normale, partire
 * da zero con un file illeggibile è perdere la storia (AR-632).
 */
export function interpretaRegistro(raw) {
  if (raw === null || raw === undefined) return { stato: "assente", dati: {} };
  try {
    const d = JSON.parse(raw);
    if (d && typeof d === "object" && !Array.isArray(d)) return { stato: "ok", dati: d };
  } catch {
    /* cade sotto: corrotto */
  }
  return { stato: "corrotto", dati: null };
}

/**
 * Fonde una voce nel registro esistente — PURA, nessun disco.
 * Il formato della voce è IDENTICO a quello dello script inline storico (il test di parità
 * `esito-cadenza.test.mjs` e il Pannello leggono questi campi, in quest'ordine):
 *   quando · esito · codice · ai_rc · push_ok · passi_ok · vincoli_attivi · vincoli
 */
export function fondiEsito(registroEsistente, voce) {
  const base =
    registroEsistente && typeof registroEsistente === "object" && !Array.isArray(registroEsistente)
      ? registroEsistente
      : {};
  const s = { ...base };
  s._cosa_e = COSA_E;
  s.cadenze = { ...(s.cadenze || {}) };
  s.cadenze[voce.tipo] = {
    quando: voce.quando,
    esito: voce.esito,
    codice: voce.codice,
    ai_rc: voce.ai_rc,
    push_ok: voce.push_ok,
    passi_ok: voce.passi_ok,
    vincoli_attivi: voce.vincoli_attivi,
    vincoli: voce.vincoli,
  };
  s.aggiornato = s.cadenze[voce.tipo].quando;
  return s;
}

/**
 * Scrittura ATOMICA: file temporaneo nella STESSA cartella (il rename tra filesystem diversi non
 * è atomico) + rename. Un crash a metà lascia al massimo un `.tmp-*` orfano, mai un registro
 * mezzo scritto — che era esattamente il file corrotto da cui partiva l'azzeramento di AR-632.
 * `impl` è iniettabile solo per i test (simulano il crash a metà scrittura).
 */
export function scriviAtomico(percorso, dati, impl = { writeFileSync, renameSync }) {
  const testo = JSON.stringify(dati, null, 2) + "\n";
  mkdirSync(dirname(percorso), { recursive: true });
  const tmp = join(dirname(percorso), `.${basename(percorso)}.tmp-${process.pid}-${Date.now()}`);
  impl.writeFileSync(tmp, testo);
  impl.renameSync(tmp, percorso);
}

/**
 * Legge il registro dal disco applicando la regola AR-632:
 *   · file assente → si parte da zero, nessun avviso (è il primo giorno, non un guasto);
 *   · file valido → si usa;
 *   · file corrotto → copia in `.broken-<timestamp>` (la prova resta sul disco), si riparte dal
 *     backup `.bak` se è valido, e OGNI passo finisce negli `avvisi` che il chiamante dichiara.
 * Non decide niente in silenzio: ritorna { dati, avvisi }.
 */
export function leggiRegistroDaDisco(percorso, adesso = new Date()) {
  const avvisi = [];
  if (!existsSync(percorso)) return { stato: "assente", dati: {}, avvisi };

  let raw = null;
  try {
    raw = readFileSync(percorso, "utf8");
  } catch (e) {
    avvisi.push(`registro illeggibile (${e.message})`);
  }
  const letto = interpretaRegistro(raw);
  if (letto.stato === "ok") return { stato: "ok", dati: letto.dati, avvisi };

  // File corrotto: PRIMA si mette in salvo la prova, POI si cerca la storia più recente valida.
  const copia = `${percorso}.broken-${timbroOra(adesso).replace(/[ :]/g, "-")}`;
  try {
    copyFileSync(percorso, copia);
    avvisi.push(`registro CORROTTO: copia salvata in ${copia}`);
  } catch (e) {
    avvisi.push(`registro CORROTTO e copia .broken NON riuscita (${e.message})`);
  }

  const bak = `${percorso}.bak`;
  if (existsSync(bak)) {
    let rawBak = null;
    try {
      rawBak = readFileSync(bak, "utf8");
    } catch {
      /* bak illeggibile: si tratta come corrotto */
    }
    const lettoBak = interpretaRegistro(rawBak);
    if (lettoBak.stato === "ok") {
      avvisi.push(`riparto dall'ultima scrittura riuscita (${bak}): la storia NON è persa`);
      return { stato: "recuperato", dati: lettoBak.dati, avvisi };
    }
    avvisi.push(`anche il backup ${bak} è illeggibile`);
  }
  avvisi.push("nessun backup valido: riparto da zero — la storia precedente resta solo nella copia .broken");
  return { stato: "corrotto", dati: {}, avvisi };
}

// ── CLI ──────────────────────────────────────────────────────────────────────
// Legge gli stessi env CADENZA_* che lo script inline leggeva ieri: lib-cadenza.sh non deve
// cambiare interfaccia, solo smettere di portarsi in pancia la logica.
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const percorso = process.env.CADENZA_REGISTRO || REGISTRO_DEFAULT;
  const tipo = process.env.CADENZA_TIPO || "";
  if (!tipo) {
    process.stderr.write("registra-cadenza: manca CADENZA_TIPO — niente da registrare.\n");
    process.exit(64);
  }
  const voce = {
    tipo,
    quando: timbroOra(),
    esito: process.env.CADENZA_ESITO,
    codice: +process.env.CADENZA_CODICE,
    ai_rc: +process.env.CADENZA_AI_RC || 0,
    push_ok: process.env.CADENZA_PUSH_OK === "1",
    passi_ok: process.env.CADENZA_PASSI_OK === "1",
    vincoli_attivi: +process.env.CADENZA_VINCOLI || 0,
    vincoli: (process.env.CADENZA_ELENCO || "").split(" ").filter(Boolean),
  };

  const lettura = leggiRegistroDaDisco(percorso);
  for (const a of lettura.avvisi) process.stderr.write(`registra-cadenza: ${a}\n`);

  try {
    scriviAtomico(percorso, fondiEsito(lettura.dati, voce));
  } catch (e) {
    process.stderr.write(`registra-cadenza: scrittura fallita (${e.message}) — la riga di «${tipo}» NON è su disco.\n`);
    process.exit(1);
  }
  // Il backup dell'ultima scrittura riuscita: è da qui che AR-632 riparte se il registro
  // principale viene trovato corrotto. Se il backup fallisce non è un errore della registrazione
  // (la riga è già al sicuro), ma si dichiara: un .bak vecchio è una rete più corta.
  try {
    copyFileSync(percorso, `${percorso}.bak`);
  } catch (e) {
    process.stderr.write(`registra-cadenza: backup .bak non aggiornato (${e.message}).\n`);
  }
}
