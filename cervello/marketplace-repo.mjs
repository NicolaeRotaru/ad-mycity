// Risolve DOVE si trova il codice del marketplace MyCity (repo NicolaeRotaru/mycity)
// sulla macchina che sta girando ora. Un solo punto di verità, usato sia dal connettore
// (collega-marketplace.mjs) sia dai workflow di analisi (radiografia, audit-design).
//
// Ordine di risoluzione del PERCORSO locale del codice:
//   1) MARKETPLACE_REPO       → percorso esplicito (VPS/CI), vince su tutto
//   2) <ad-repo>/marketplace  → checkout locale creato da `node cervello/collega-marketplace.mjs`
//   3) …e basta. NON esiste un terzo posto: vedi la nota su WINDOWS_FALLBACK qui sotto.
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

// 2026-08-21 — QUI C'ERA `WINDOWS_FALLBACK`, LA CARTELLA DEL VECCHIO PC DI NICOLA.
//
// Nicola l'aveva già fatto togliere il 4/7: «togli il cablato su Windows una volta per sempre,
// impedisci che riaccada». Il registro delle decisioni lo dà per fatto, con tanto di guardiano
// anti-ricaduta agganciato al giro. Il 21/8 la riga era di nuovo qui, e il guardiano non esisteva
// nel repo: la correzione era stata chiusa con una FRASE invece che con un FRENO, e senza freno è
// rientrata da sola.
//
// Cosa costava tenerla: su qualunque macchina che non fosse quel Windows, `resolveMarketplaceRepo`
// restituiva un percorso che non esiste, e la verifica dell'automazione lo diceva ogni volta —
// «clone marketplace assente in C:\Users\InfinitaPossibilita\mycity-live». Chi legge quella riga
// va a cercare una cartella, non un difetto di configurazione: un messaggio che manda dalla parte
// sbagliata è peggio di nessun messaggio.
//
// Il freno adesso c'è davvero: `cervello/no-path-cablati-check.mjs`, che gira nel giro e diventa
// rosso se un percorso di macchina rientra nel codice.

// Restituisce il percorso del codice del marketplace su QUESTA macchina.
export function resolveMarketplaceRepo() {
  if (process.env.MARKETPLACE_REPO) return process.env.MARKETPLACE_REPO;
  if (existsSync(join(DEFAULT_CHECKOUT, ".git"))) return DEFAULT_CHECKOUT;
  return DEFAULT_CHECKOUT; // cross-platform: se non è collegato, `isMarketplaceLinked()` dice di no
}

// true se nel percorso risolto c'è davvero un repo git con dentro il codice.
export function isMarketplaceLinked() {
  const p = resolveMarketplaceRepo();
  return existsSync(join(p, ".git")) || existsSync(join(p, "package.json"));
}
