// 🔌 CLASSIFICAZIONE DEGLI STRUMENTI COLLEGATI (MCP) — AR-273. Modulo PURO: nessun I/O, nessun import.
//
// Il difetto: «il guardiano dei permessi non guarda gli strumenti collegati, e fra quelli concessi
// senza chiedere c'è l'esecuzione di comandi liberi sul database». Verificato il 29/7 sul file vero:
// `permessi-check.mjs` contiene ZERO occorrenze di `mcp__`. Non è che la regola fosse sbagliata —
// quel tipo di voce non veniva proprio guardato, e `mcp__Supabase__execute_sql` (SQL arbitrario sul
// database) passava senza che nulla lo nominasse.
//
// LA CURA NON È UNA REGEX IN PIÙ. La causa radice dichiarata da AR-273 è: «le regole d'oro sono
// elencate a mano nel codice del guardiano e nessuno le rivede quando entra un tipo nuovo di
// strumento — il controllo insegue, non copre». Aggiungere `mcp__Supabase__execute_sql` a una lista
// nera curerebbe il punto e lascerebbe in piedi il modo in cui si è rotto: il prossimo strumento di
// scrittura collegato nascerebbe di nuovo invisibile.
//
// Quindi il sapere si sposta SUL DATO: ogni voce concessa si classifica da sé, dal proprio nome, in
// lettura / scrittura / sconosciuto. E `sconosciuto` è una VIOLAZIONE, non un'assoluzione — è il
// fail-closed che rende il controllo una copertura invece di un inseguimento. Uno strumento di forma
// nuova non passa perché nessuno l'ha previsto: non passa PROPRIO perché nessuno l'ha previsto.
//
// Perché sta in un file suo (regola ③ del cantiere): la decisione dev'essere eseguibile da un test.
// Dentro `permessi-check.mjs`, in mezzo a `readFileSync` e `process.exit`, una prova potrebbe solo
// rileggere la forma della regola — la stessa prova debole che ha lasciato passare questi difetti.

/**
 * I verbi che SCRIVONO. Se una di queste parole compare nel nome dello strumento, la voce è di
 * scrittura — anche se ce n'è un'altra di lettura accanto (`create_or_update_file`): fra i due vince
 * sempre il più pericoloso. Un classificatore che in caso di dubbio assolve non è un cancello.
 */
export const VERBI_SCRITTURA = new Set([
  "execute", "create", "update", "delete", "deploy", "apply", "merge", "write", "push", "publish",
  "pause", "restore", "rebase", "reset", "confirm", "buy", "send", "add", "remove", "set", "edit",
  "upload", "trigger", "run", "enable", "disable", "fork", "resolve", "unresolve", "subscribe",
  "unsubscribe", "change", "reply", "import", "migration", "branch", "revert", "cancel", "approve",
]);

/** I verbi che LEGGONO e basta. Valgono solo se nel nome non compare nessun verbo di scrittura. */
export const VERBI_LETTURA = new Set([
  "list", "get", "search", "read", "find", "check", "view", "fetch", "describe", "count", "show",
]);

/** Una voce di permesso è uno strumento collegato se ha la forma `mcp__<server>__<strumento>`. */
export function eStrumentoCollegato(voce) {
  return /^mcp__[^_]+.*__.+$/.test(String(voce || "").trim());
}

/** Estrae il nome dello strumento: `mcp__github__create_pull_request` → `create_pull_request`. */
export function nomeStrumento(voce) {
  const parti = String(voce || "").trim().split("__");
  return parti.length >= 3 ? parti.slice(2).join("__") : "";
}

/**
 * Classifica UNA voce di permesso.
 *
 * Il verbo non sta sempre in testa: `pull_request_read` è di lettura e ha il verbo in coda, mentre
 * `execute_sql` ce l'ha davanti. Guardare solo la prima parola sbagliava metà delle voci vere del
 * repo — per questo si guardano TUTTE le parole del nome.
 *
 * @returns {{tipo: "lettura"|"scrittura"|"sconosciuto", parola: string|null, motivo: string}}
 */
export function classificaStrumento(voce) {
  if (!eStrumentoCollegato(voce)) {
    return { tipo: "non-applicabile", parola: null, motivo: "non è uno strumento collegato (mcp__)" };
  }
  const nome = nomeStrumento(voce);
  const parole = nome.toLowerCase().split(/[_\-.]+/).filter(Boolean);

  const scrive = parole.find((p) => VERBI_SCRITTURA.has(p));
  if (scrive) {
    return { tipo: "scrittura", parola: scrive, motivo: `«${scrive}» modifica lo stato di un sistema esterno` };
  }
  const legge = parole.find((p) => VERBI_LETTURA.has(p));
  if (legge) {
    return { tipo: "lettura", parola: legge, motivo: `«${legge}» è di sola lettura` };
  }
  return {
    tipo: "sconosciuto",
    parola: null,
    motivo: `nessun verbo riconosciuto in «${nome}»: forma nuova, va dichiarata prima di concederla`,
  };
}

/**
 * Le voci di scrittura concesse senza una giustificazione scritta, più quelle di forma sconosciuta.
 *
 * `giustificate` è una mappa `voce → perché`. Il perché è obbligatorio e non è burocrazia: il
 * cantiere ha già pagato che «un'esenzione senza motivo è un silenzio», ed è esattamente la cosa che
 * questo difetto cura. Una giustificazione vuota vale come assente.
 *
 * @param {string[]} allow  le voci di permesso concesse
 * @param {Record<string,string>} giustificate  voce → motivo scritto
 */
export function strumentiSospetti(allow = [], giustificate = {}) {
  const fuori = [];
  for (const voce of allow) {
    const v = String(voce);
    const c = classificaStrumento(v);
    if (c.tipo !== "scrittura" && c.tipo !== "sconosciuto") continue;
    const motivo = String(giustificate[v] || "").trim();
    if (motivo) continue;
    fuori.push({ voce: v, tipo: c.tipo, parola: c.parola, motivo: c.motivo });
  }
  return fuori;
}
