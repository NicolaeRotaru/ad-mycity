#!/usr/bin/env node
// 🫀 CHI DEVE BATTERE A OGNI GIRO — derivato, non dichiarato (AR-373, lotto 33).
//
// Il difetto: `freschezza-segnali.mjs` teneva l'elenco degli attesi scritto a mano. Dentro c'era
// `coerenza-fatti`, che il battito non l'ha mai mandato — quindi il meta-guardiano falliva a OGNI
// giro, da sempre, e nessun giro poteva più uscire pulito. Non è stato notato perché un allarme
// sempre acceso si legge come sfondo: nessuno distingue «rosso nuovo» da «rosso cronico».
//
// La radice non è il nome sbagliato: è che la lista era una DICHIARAZIONE invece che una MISURA.
// Una lista scritta a mano si scollega dal codice al primo rinomino, e da quel momento chiede un
// battito che nessuno manda — oppure, peggio, smette di chiedere quello che serve.
//
// Qui l'elenco si deriva in due passi, entrambi dal codice vero:
//   ① quali script `.mjs` il giro invoca davvero (`node "$SCRIPT_DIR/x.mjs"` o `guardiano x.mjs`);
//   ② quali nomi quegli script passano a `stampSegnale("…")`.
// Un nome nuovo entra da solo; un nome tolto sparisce da solo. L'allarme fantasma non è più
// possibile per costruzione, non per attenzione di chi scrive.
//
// 🟢 Funzioni pure: nessun I/O qui dentro: il lettore dei file arriva da fuori, così un test
// esegue la derivazione su un giro finto senza dipendere da com'è il repo adesso.

import { derivaNomi } from "./perimetro.mjs";

/** Le due forme con cui giro.sh lancia uno script del cervello. */
const RE_INVOCATI = [
  /node\s+"?\$\{?SCRIPT_DIR\}?\/([a-zA-Z0-9._-]+\.mjs)/,
  /\bguardiano\s+"?([a-zA-Z0-9._-]+\.mjs)/,
];

/** Il nome che uno script timbra: `stampSegnale("sensori", …)`. */
const RE_STAMP = /stampSegnale\(\s*["'`]([^"'`]+)["'`]/;

/** Gli script che il giro invoca davvero, letti dal suo testo. */
export function scriptInvocati(testoGiro) {
  const fuori = new Set();
  for (const re of RE_INVOCATI) for (const n of derivaNomi(testoGiro, re)) fuori.add(n);
  return [...fuori].sort();
}

/**
 * I segnali che ci si DEVE aspettare a ogni giro.
 *
 * `leggiScript(nome)` torna il testo dello script, oppure `null` se non si riesce a leggerlo — e i
 * non letti tornano indietro in `nonLetti`: un file che non ho potuto aprire non è un file senza
 * battiti, ed è esattamente la differenza che questi guardiani continuavano a perdere.
 *
 * Un nome timbrato solo dentro un `catch` di crash resta un attesa legittima: se lo script gira,
 * qualcosa timbra comunque.
 */
export function attesiDaGiro(testoGiro, leggiScript) {
  const attesi = new Set();
  const nonLetti = [];
  for (const nome of scriptInvocati(testoGiro)) {
    let testo = null;
    try {
      testo = leggiScript(nome);
    } catch {
      testo = null;
    }
    if (testo == null) {
      nonLetti.push(nome);
      continue;
    }
    for (const s of derivaNomi(testo, RE_STAMP)) attesi.add(s);
  }
  return { attesi: [...attesi].sort(), nonLetti: nonLetti.sort() };
}
