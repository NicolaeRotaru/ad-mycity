// index.mjs — Registro dei publisher: mappa "canale" → funzione pubblica().
// Lo scheduler (autopilot.mjs) sceglie il publisher giusto leggendo il campo `canale` della voce.
//
// AR-074/AR-109 — oltre a pubblica(), ogni publisher dichiara due cose che lo scheduler DEVE
// sapere prima di far partire un invio, e che la voce del calendario NON può auto-dichiarare:
//   · coloreMinimo(voce) → il rischio REALE del canale (post pubblico = 🟡, email a un cliente = 🔴)
//   · destinatario(voce) → a chi arriva davvero, per il controllo allowlist prima del LIVE
// Un publisher che non le esporta è trattato come 🔴 senza destinatario noto: fail-closed, così
// aggiungere un canale nuovo non apre per distrazione una porta di invio automatico.

import { pubblica as telegram, coloreMinimo as cmTelegram, destinatario as dTelegram } from "./telegram.mjs";
import { pubblica as email, coloreMinimo as cmEmail, destinatario as dEmail } from "./email.mjs";
import { pubblica as gbp, coloreMinimo as cmGbp, destinatario as dGbp } from "./gbp.mjs";
import { pubblica as facebook, coloreMinimo as cmFacebook, destinatario as dFacebook } from "./facebook.mjs";
import { pubblica as instagram, coloreMinimo as cmInstagram, destinatario as dInstagram } from "./instagram.mjs";

export const PUBLISHERS = {
  telegram,
  email,
  gbp,
  "google-business": gbp, // alias comodo
  facebook,
  instagram,
};

// Colore minimo e destinatario per canale. Le chiavi seguono PUBLISHERS (alias inclusi).
const COLORE_MINIMO = {
  telegram: cmTelegram,
  email: cmEmail,
  gbp: cmGbp,
  "google-business": cmGbp,
  facebook: cmFacebook,
  instagram: cmInstagram,
};

const DESTINATARIO = {
  telegram: dTelegram,
  email: dEmail,
  gbp: dGbp,
  "google-business": dGbp,
  facebook: dFacebook,
  instagram: dInstagram,
};

function chiave(canale) {
  return String(canale || "").toLowerCase();
}

export function publisherPer(canale) {
  return PUBLISHERS[chiave(canale)];
}

// Colore minimo del canale. Canale sconosciuto o publisher che non lo dichiara → 🔴 (fail-closed).
export function coloreMinimoPer(canale, voce = {}) {
  const f = COLORE_MINIMO[chiave(canale)];
  if (typeof f !== "function") return "🔴";
  const c = f(voce);
  return c === "🟢" || c === "🟡" || c === "🔴" ? c : "🔴";
}

// Destinatario reale del canale. Sconosciuto → "" (l'allowlist lo rifiuterà: fail-closed).
export function destinatarioPer(canale, voce = {}) {
  const f = DESTINATARIO[chiave(canale)];
  if (typeof f !== "function") return "";
  return String(f(voce) || "");
}

export const CANALI_DISPONIBILI = Object.keys(PUBLISHERS);
