// index.mjs — Registro dei publisher: mappa "canale" → funzione pubblica().
// Lo scheduler (autopilot.mjs) sceglie il publisher giusto leggendo il campo `canale` della voce.

import { pubblica as telegram } from "./telegram.mjs";
import { pubblica as email } from "./email.mjs";
import { pubblica as gbp } from "./gbp.mjs";
import { pubblica as facebook } from "./facebook.mjs";
import { pubblica as instagram } from "./instagram.mjs";

export const PUBLISHERS = {
  telegram,
  email,
  gbp,
  "google-business": gbp, // alias comodo
  facebook,
  instagram,
};

export function publisherPer(canale) {
  return PUBLISHERS[String(canale || "").toLowerCase()];
}

export const CANALI_DISPONIBILI = Object.keys(PUBLISHERS);
