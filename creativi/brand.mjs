// Token di marca MyCity, riusati dal designer.
// Fonte: design-system del marketplace + Vault/01-Strategia/Brand & Posizionamento.md.
//
// 2026-08-21 — i tre percorsi dei loghi erano cablati sulla cartella del vecchio PC Windows di
// Nicola. Su qualunque altra macchina puntavano al nulla, in silenzio. Ora si chiedono all'unico
// posto che sa dove sta il codice del marketplace su QUESTA macchina.

import { join } from "node:path";
import { resolveMarketplaceRepo } from "../cervello/marketplace-repo.mjs";

const ASSETS = join(resolveMarketplaceRepo(), "design-system", "assets");
export const BRAND = {
  colori: {
    terracotta: "#C0492C", // primary (cotto)
    senape: "#E8A33D",     // accent (CTA, badge)
    oliva: "#5A7C42",      // success / fresco
    bordeaux: "#B82A28",   // urgenza / sconti
    inchiostro: "#2C2A28", // testo
    panna: "#FBF7F0",      // sfondo editoriale
    bianco: "#FFFFFF",
  },
  font: { display: "Fraunces", testo: "Inter" }, // per la stampa finale; gli script usano Helvetica di base
  tagline: "La spesa che tiene viva la città.",
  logo: {
    light: join(ASSETS, "wordmark-light.svg"),
    onDark: join(ASSETS, "wordmark-ondark.svg"),
    icon: join(ASSETS, "logo-icon.svg"),
  },
};
