// Risolve DOVE si trova il codice del marketplace MyCity (repo NicolaeRotaru/mycity)
// sulla macchina che sta girando ora. Un solo punto di verità, usato sia dal connettore
// (collega-marketplace.mjs) sia dai workflow di analisi (radiografia, audit-design).
//
// Ordine di risoluzione del PERCORSO locale del codice:
//   1) MARKETPLACE_REPO       → percorso esplicito (VPS/CI), vince su tutto
//   2) <ad-repo>/marketplace  → checkout locale creato da `node cervello/collega-marketplace.mjs`
//
// NIENTE percorsi cablati per una macchina specifica (né Windows né altro): il fallback è
// SEMPRE il checkout standard <ad-repo>/marketplace, cross-platform. Se non c'è, i chiamanti
// controllano `existsSync(<path>/.git)` e mostrano «NON collegato → collega-marketplace.mjs».
// (Un guardiano — no-path-cablati-check.mjs — impedisce che un path assoluto rientri nel codice.)
//
// SOLA LETTURA: l'AD analizza il marketplace, non lo modifica da qui.

import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Radice del repo dell'AD (questo file vive in <ad-repo>/cervello/).
export const AD_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Repo GitHub del marketplace (sorgente da clonare). Override con MARKETPLACE_GIT_REPO.
export const MARKETPLACE_GIT_REPO = process.env.MARKETPLACE_GIT_REPO || "NicolaeRotaru/mycity";
export const MARKETPLACE_BRANCH = process.env.MARKETPLACE_BRANCH || "main";

// Percorso di default del checkout locale, accanto al codice dell'AD.
export const DEFAULT_CHECKOUT = join(AD_ROOT, "marketplace");

// Restituisce il percorso del codice del marketplace su QUESTA macchina.
// Ritorna SEMPRE un percorso cross-platform: la env esplicita o il checkout standard.
// Mai un percorso legato a una macchina specifica.
export function resolveMarketplaceRepo() {
  if (process.env.MARKETPLACE_REPO) return process.env.MARKETPLACE_REPO;
  return DEFAULT_CHECKOUT;
}

// true se nel percorso risolto c'è davvero un repo git con dentro il codice.
export function isMarketplaceLinked() {
  const p = resolveMarketplaceRepo();
  return existsSync(join(p, ".git")) || existsSync(join(p, "package.json"));
}
