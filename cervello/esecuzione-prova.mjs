// 🧭 COME SI ESEGUE UNA PROVA — la decisione, separata dall'esecuzione.
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE (AR-840, la cura alla radice)
// ─────────────────────────────────────────────────────────────────────────────
// `non-vacuita.mjs` rompe apposta un fix e pretende che la sua prova diventi ROSSA. Riconosce il
// rosso da una cosa sola: **il comando è uscito ≠ 0.**
//
// Lanciava la prova così: `spawnSync("node", [m.test])`. Cioè dava per scontato che `m.test` fosse
// sempre un percorso di file .mjs. Due forme molto vive non lo sono:
//
//   · una RIGA DI COMANDO — «node cervello/permessi-check.mjs» — diventava `node "node
//     cervello/permessi-check.mjs"`: un percorso che non esiste, MODULE_NOT_FOUND, uscita 1.
//   · un file .bats — «cervello/test/pausa-fail-closed.bats» — diventava `node <script bash>`:
//     SyntaxError alla seconda riga, uscita 1.
//
// In tutti e due i casi l'uscita è ≠ 0 **qualunque cosa faccia la mutazione**. Cioè: quelle voci
// risultavano verificate senza esserlo. Il metro della copertura si dava buono da solo.
//
// La radice non è «una voce scritta male»: è che **la decisione di come si esegue una prova non
// esisteva**. Era un `spawnSync` cablato, non una regola che qualcuno potesse leggere o provare.
// Qui diventa una funzione pura, senza import e senza disco, che un test può ESEGUIRE sui casi veri.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA SICUREZZA: NESSUNA SHELL, MAI
// ─────────────────────────────────────────────────────────────────────────────
// Una riga di comando si potrebbe eseguire con `shell: true` in una riga sola. Non si fa: sarebbe
// un'iniezione di comandi a un passo (`mutanti.json` è un file, e i file si modificano). Qui la
// riga viene SPEZZATA a mano in argomenti, `&&` diventa una sequenza di passi eseguiti in ordine
// dal chiamante, e qualsiasi altro carattere di shell — pipe, redirezioni, apici, `$`, backtick,
// sottoshell — fa dichiarare la voce NON eseguibile invece di farla girare.
// Il programma da lanciare deve stare in `COMANDI_AMMESSI`: due nomi, non «quello che c'è scritto».
//
// ─────────────────────────────────────────────────────────────────────────────
// IL TERZO ESITO
// ─────────────────────────────────────────────────────────────────────────────
// «La prova è diventata rossa perché la mutazione morde» e «il comando non è nemmeno partito» sono
// due cose diverse che uscivano tutte e due ≠ 0. `avvioFallito` le separa: un errore di avvio non è
// mai un ✅, è un ⚪ — non ho misurato. ⚪ non è mai un verde (regola di casa, AR-322).
//
// Nessun import: si prova senza preparare niente.

/** I soli programmi che una prova può lanciare. Non è una preferenza di stile: è la lista bianca
 *  che tiene fuori l'esecuzione arbitraria adesso che le righe di comando si eseguono davvero. */
export const COMANDI_AMMESSI = ["node", "npx"];

/** Caratteri che hanno un significato SOLO dentro una shell. Se ce n'è uno, la riga non si esegue:
 *  non perché sia per forza cattiva, ma perché eseguirla senza shell darebbe un risultato diverso
 *  da quello che chi l'ha scritta si aspetta — e con la shell aprirebbe un'iniezione. */
const METACARATTERI_SHELL = /[|;<>`$()\\'"*?~\n\r&{}[\]!#]/;

/** Un percorso che non è di questo repo: `../../qualcosa`, `/etc/x`.
 *
 * ⚠️ È una regola di CONTABILITÀ, non di esecuzione, e i due mestieri la vogliono diversa:
 *   · il CONTATORE (`mutazioni-senza-esecutore.mjs`) la pretende — un `test` che punta fuori dal
 *     repo non è una prova di casa, e contarlo «coperto» è un altro verde comprato;
 *   · il BANCO (`non-vacuita.mjs`) NON può pretenderla: le prove del banco stesso si costruiscono
 *     una fixture in /tmp e le passano un percorso assoluto. Vietarlo qui vorrebbe dire che il
 *     banco non riesce più a essere provato — misurato il 28/8: tre prove vicine diventate rosse.
 * Perciò è un interruttore dichiarato (`soloDentroIlRepo`), non una regola nascosta nel parser. */
function fuoriDalRepo(t) {
  return t.includes("..") || t.startsWith("/");
}

/** I token di un passo che sono percorsi di file (non opzioni, non il programma). */
function percorsiDi(argomenti) {
  return argomenti.filter((a) => !a.startsWith("-") && a.includes("/"));
}

/**
 * Spezza una riga di comando in passi (`&&`) e argomenti, SENZA shell.
 *
 * `&&` è l'unico operatore riconosciuto, e non viene passato a nessuno: diventa «esegui in ordine,
 * fermati al primo che fallisce», che è la sua semantica, eseguita dal chiamante in JavaScript.
 */
export function spezzaComando(riga, { soloDentroIlRepo = true } = {}) {
  const testo = String(riga ?? "").trim();
  if (!testo) return { ok: false, passi: [], perche: "riga di comando vuota" };

  const pezzi = testo.split("&&").map((p) => p.trim());
  if (pezzi.some((p) => !p)) {
    return { ok: false, passi: [], perche: `«&&» senza un comando da una delle due parti: «${testo}»` };
  }

  const passi = [];
  for (const pezzo of pezzi) {
    if (METACARATTERI_SHELL.test(pezzo)) {
      const male = pezzo.match(METACARATTERI_SHELL)[0];
      return { ok: false, passi: [], perche: `serve una shell per «${male}» in «${pezzo}»: non la uso, non è eseguibile così` };
    }
    const token = pezzo.split(/\s+/).filter(Boolean);
    const [comando, ...argomenti] = token;
    if (!COMANDI_AMMESSI.includes(comando)) {
      return { ok: false, passi: [], perche: `programma non ammesso: «${comando}» (ammessi: ${COMANDI_AMMESSI.join(", ")})` };
    }
    const fuori = soloDentroIlRepo && argomenti.find((a) => !a.startsWith("-") && fuoriDalRepo(a));
    if (fuori) return { ok: false, passi: [], perche: `esce dal repo: «${fuori}»` };
    const percorsi = percorsiDi(argomenti);
    // Un passo che non nomina NESSUN file di questo repo non si può controllare: chi lo conta come
    // eseguibile sta comprando un verde con un controllo vuoto — «npx vitest run x» passerebbe
    // qualunque cosa ci sia (o non ci sia) su questo disco. È la stessa malattia di AR-840, in
    // piccolo: un metro che non ha niente da misurare non deve dire «a posto».
    if (soloDentroIlRepo && !percorsi.length) {
      return { ok: false, passi: [], perche: `«${pezzo}» non nomina nessun file del repo: non c'è niente da controllare` };
    }
    passi.push({ comando, argomenti, percorsi });
  }
  return { ok: true, passi, perche: "" };
}

/**
 * LA DECISIONE. Dato il campo `test` di una mutazione, come lo si esegue?
 *
 * Torna sempre la stessa forma:
 *   { ok, forma, passi: [{comando, argomenti, percorsi}], percorsi, perche }
 * `percorsi` sono i file che devono esistere perché la corsa abbia senso: chi ha il disco li
 * controlla, questa funzione no (resta pura, e così si può provare senza preparare niente).
 */
export function comeSiEsegue(test, { soloDentroIlRepo = true } = {}) {
  if (typeof test !== "string" || !test.trim()) {
    return { ok: false, forma: "assente", passi: [], percorsi: [], perche: "nessun test dichiarato" };
  }
  const t = test.trim();

  // ① UNA RIGA DI COMANDO — c'è uno spazio. Prima si spezzava male e usciva ≠ 0 sempre.
  if (/\s/.test(t)) {
    const s = spezzaComando(t, { soloDentroIlRepo });
    if (!s.ok) return { ok: false, forma: "riga-di-comando", passi: [], percorsi: [], perche: s.perche };
    return {
      ok: true,
      forma: "riga-di-comando",
      passi: s.passi,
      percorsi: s.passi.flatMap((p) => p.percorsi),
      perche: "",
    };
  }

  // ② UN PERCORSO. Deve restare in casa…
  if (soloDentroIlRepo && fuoriDalRepo(t)) {
    return { ok: false, forma: "percorso", passi: [], percorsi: [], perche: `esce dal repo: «${t}»` };
  }
  // …e va lanciato col programma GIUSTO PER LA SUA SPECIE. `node file.bats` è uno script bash dato
  // in pasto al parser JavaScript: SyntaxError, uscita 1, e non-vacuita legge «prova diventata
  // rossa». Due voci vere (AR-390, AR-396) risultavano verificate proprio così.
  if (t.endsWith(".bats")) {
    return { ok: true, forma: "percorso-bats", passi: [{ comando: "npx", argomenti: ["bats", t], percorsi: [t] }], percorsi: [t], perche: "" };
  }
  return { ok: true, forma: "percorso-node", passi: [{ comando: "node", argomenti: [t], percorsi: [t] }], percorsi: [t], perche: "" };
}

/** Le impronte inequivocabili di un processo che non è mai arrivato a eseguire una prova. */
const IMPRONTE_DI_AVVIO = [
  { re: /could not determine executable to run/i, dillo: "il programma da lanciare non è installato (npx non l'ha trovato)" },
  { re: /^(?:.*: )?(\S+): command not found/m, dillo: "il programma da lanciare non esiste su questa macchina" },
  { re: /Cannot find package '([^']+)'/, dillo: "manca un pacchetto: la prova non è partita" },
];

/**
 * LA CORSA C'È STATA? — il terzo esito.
 *
 * Torna il motivo se il processo NON è mai arrivato a misurare qualcosa, altrimenti null.
 * `entrata` è il file che avevamo chiesto di eseguire: serve per non confondere «non trovo IL FILE
 * DELLA PROVA» (avvio fallito, ⚪) con «non trovo un modulo che la mutazione ha appena rotto»
 * (la prova è diventata rossa per colpa della mutazione, ✅). Senza quel confronto si finirebbe per
 * dichiarare cieco ogni fix che tocca un import — cioè per non misurare più niente.
 */
export function avvioFallito({ errore = null, uscita = "", entrata = "" } = {}) {
  if (errore && (errore.code === "ENOENT" || /ENOENT/.test(String(errore.message || "")))) {
    return `il programma non esiste su questa macchina (${errore.code || "ENOENT"}): la prova non è partita`;
  }
  const testo = String(uscita || "");
  const mancante = testo.match(/Cannot find module '([^']+)'/);
  if (mancante && entrata) {
    const chiesto = String(entrata);
    // Il modulo mancante È il file che abbiamo chiesto di eseguire → non è mai partito niente.
    // Il confronto è sul percorso INTERO, non sul solo nome del file: bastare il nome vorrebbe dire
    // dichiarare cieca una prova che è diventata rossa perché la mutazione le ha rotto un import
    // verso un file che si chiama uguale. Meglio stretto: un ⚪ dato a torto nasconde una misura.
    if (mancante[1] === chiesto || mancante[1].endsWith(`/${chiesto}`)) {
      return `il file della prova non esiste: «${chiesto}» — non è partito niente, non è una prova diventata rossa`;
    }
  }
  for (const { re, dillo } of IMPRONTE_DI_AVVIO) {
    if (re.test(testo)) return `${dillo}: la prova non è partita`;
  }
  return null;
}
