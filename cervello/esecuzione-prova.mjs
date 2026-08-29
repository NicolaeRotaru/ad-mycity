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

// ─────────────────────────────────────────────────────────────────────────────
// 🔒 LE TRE FALLE TROVATE DALLA RADIOGRAFIA DI SICUREZZA DEL 28/8 — e perché la
//    difesa di prima parava un colpo che nessuno tirava
// ─────────────────────────────────────────────────────────────────────────────
// Il filtro dei metacaratteri qui sotto è fatto bene, ma difende dalla SHELL — e la shell non viene
// mai usata. Chi esegue è `node`, e di `node` non filtrava nessuno gli argomenti. Misurato: queste
// righe passavano tutte, e le prime due passavano perfino col controllo severo.
//   node --require=/tmp/pwn.cjs cervello/x.mjs   ← esegue un file qualunque, zero metacaratteri
//   node --import=file:///tmp/pwn.mjs …          ← idem
//   node -e <codice>                             ← codice arbitrario
//   npx --yes @chiunque/pacchetto                ← scarica ed esegue dalla rete
// «@scope/pacchetto» passava perché ha una barra dentro, cioè ha la stessa FORMA di un percorso
// relativo del repo: la regola «devi nominare un file di casa» non sa distinguere le due cose.
//
// La cura è girare il verso della lista: non elencare ciò che è vietato (le opzioni di node che
// eseguono codice cambiano a ogni rilascio, una lista nera nasce già vecchia) ma ciò che è ammesso.

/** Le sole opzioni che una prova di questa casa usa davvero. Tutto il resto non si esegue.
 *  Lista BIANCA di proposito: `--require`, `--import`, `-e`, `--eval` e i loro fratelli futuri non
 *  vanno elencati uno per uno — non essendo qui dentro, sono già fuori. */
export const OPZIONI_AMMESSE = [
  /^--test$/,
  /^--tap$/,
  /^--test-reporter(=.+)?$/,
  /^--test-name-pattern=.+$/,
  /^--test-concurrency=\d+$/,
  /^--experimental-[a-z-]+$/,
  /^--no-warnings$/,
  /^--json$/,
  /^--no-install$/,
  /^--yes$/,
  /^--ar-\d+$/,
  /^--difetti$/,
  /^--lotto$/,
  /^--solo$/,
  /^--veloce$/,
];

/** I soli pacchetti che `npx` può lanciare. Senza questa lista, `npx` È esecuzione di codice preso
 *  da internet, e la lista bianca dei programmi diventa nominale: dice due nomi e ne ammette tutti. */
export const PACCHETTI_NPX_AMMESSI = ["bats", "tsx", "vitest", "playwright"];

/** Un nome di pacchetto con scope (`@qualcosa/pacchetto`) NON è un percorso, anche se gli somiglia. */
function sembraPacchettoConScope(t) {
  return t.startsWith("@");
}

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

/** 🔒 Un percorso assoluto è ammesso solo se sta sotto una radice DICHIARATA dal chiamante.
 *
 * Sostituisce il vecchio `soloDentroIlRepo: false`, che era un interruttore unico e spegneva TRE
 * controlli insieme — non solo «puoi uscire dal repo» ma anche «devi nominare un file di casa», ed è
 * da lì che passavano `node -e <codice>` e `npx --yes <pacchetto>`. Il motivo dichiarato (le prove
 * del banco si costruiscono una fixture in /tmp) giustificava il primo controllo, non gli altri due.
 * Con le radici, la fixture in /tmp continua a funzionare e il resto resta chiuso.
 * `..` non è mai ammesso: una radice si dichiara, non si raggiunge risalendo. */
function radiceAmmessa(t, radici) {
  if (t.includes("..")) return false;
  return radici.some((r) => r && t.startsWith(r.endsWith("/") ? r : `${r}/`));
}

/** I token di un passo che sono percorsi di file (non opzioni, non il programma). */
function percorsiDi(argomenti) {
  return argomenti.filter((a) => !a.startsWith("-") && a.includes("/"));
}

/** I caratteri che un percorso di questa casa usa davvero — lista BIANCA, misurata: tutte e 939 le
 *  voci di `mutanti.json` ci stanno dentro (28/8). Serve al ramo «è un percorso», che è l'unico che
 *  NON passa dal filtro dei metacaratteri: `spezzaComando` lo applica solo alle righe con uno spazio,
 *  quindi una stringa senza spazi come `cervello/x.mjs;curl` entrava intatta. */
const PERCORSO_PULITO = /^[A-Za-z0-9._/-]+$/;

/** Le estensioni che `node` da solo non sa eseguire allo stesso modo su ogni versione. Vedi il
 *  blocco «L'ESECUTORE VA DICHIARATO» sotto.
 *
 *  sorvegliante: ok perimetro-letterale fino al 2026-11-30 — un elenco scritto a mano dentro un
 *  guardiano di solito è un perimetro DEDOTTO DAGLI ESEMPI, e allora è giusto accusarlo: domani
 *  arriva il caso che nessuno aveva in mente e il guardiano è cieco proprio lì. Qui no, ed è la
 *  differenza che vale la dichiarazione: queste quattro NON sono le estensioni che abbiamo
 *  incontrato, sono TUTTE le estensioni che TypeScript definisce — l'insieme è chiuso e lo chiude
 *  qualcun altro, non i nostri esempi. Non esiste un registro da cui derivarle: derivarle dai file
 *  presenti sarebbe il perimetro dedotto vero, ed è il contrario di quello che serve. La data non è
 *  un debito: è il promemoria per ricontrollare se TypeScript ne ha aggiunta una. */
const TIPI_TYPESCRIPT = [".ts", ".mts", ".cts", ".tsx"];

/**
 * Spezza una riga di comando in passi (`&&`) e argomenti, SENZA shell.
 *
 * `&&` è l'unico operatore riconosciuto, e non viene passato a nessuno: diventa «esegui in ordine,
 * fermati al primo che fallisce», che è la sua semantica, eseguita dal chiamante in JavaScript.
 */
export function spezzaComando(riga, { soloDentroIlRepo = true, radiciAmmesse = [] } = {}) {
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
    // 🔒 Le opzioni passano dalla lista BIANCA, sempre — anche quando si esegue. Prima ogni token
    // che cominciava con «-» era esente dai controlli, e `--require=/tmp/pwn.js` entrava da lì.
    const opzioneVietata = argomenti.find((a) => a.startsWith("-") && !OPZIONI_AMMESSE.some((re) => re.test(a)));
    if (opzioneVietata) {
      return { ok: false, passi: [], perche: `opzione non ammessa: «${opzioneVietata}» (la lista è bianca: ciò che non è ammesso è vietato)` };
    }
    // 🔒 `npx` senza questa riga è «esegui un pacchetto qualunque preso da internet».
    if (comando === "npx") {
      const pacchetto = argomenti.find((a) => !a.startsWith("-"));
      if (!pacchetto || !PACCHETTI_NPX_AMMESSI.includes(pacchetto)) {
        return { ok: false, passi: [], perche: `npx può lanciare solo ${PACCHETTI_NPX_AMMESSI.join(", ")}, non «${pacchetto ?? "(niente)"}»` };
      }
    }
    // 🔒 Un nome con scope (@a/b) somiglia a un percorso ma non lo è: non deve poter soddisfare
    // «nomina un file del repo», o la regola qui sotto si compra da sola.
    const conScope = argomenti.find((a) => sembraPacchettoConScope(a));
    if (conScope) return { ok: false, passi: [], perche: `sembra un pacchetto, non un file di casa: «${conScope}»` };
    const fuori = argomenti.find((a) => !a.startsWith("-") && fuoriDalRepo(a) && !radiceAmmessa(a, radiciAmmesse));
    if (fuori) return { ok: false, passi: [], perche: `esce dal repo e non è sotto una radice ammessa: «${fuori}»` };
    const percorsi = percorsiDi(argomenti);
    // Un passo che non nomina NESSUN file di questo repo non si può controllare: chi lo conta come
    // eseguibile sta comprando un verde con un controllo vuoto — «npx vitest run x» passerebbe
    // qualunque cosa ci sia (o non ci sia) su questo disco. È la stessa malattia di AR-840, in
    // piccolo: un metro che non ha niente da misurare non deve dire «a posto».
    // 🔒 Vale SEMPRE, non solo quando si conta: un passo che non nomina nessun file e' un passo
    // di cui non si puo' controllare niente, ed e' la porta da cui entrava `node -e <codice>`.
    if (!percorsi.length) {
      return { ok: false, passi: [], perche: `«${pezzo}» non nomina nessun file: non c'è niente da controllare` };
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
export function comeSiEsegue(test, { soloDentroIlRepo = true, radiciAmmesse = [] } = {}) {
  if (typeof test !== "string" || !test.trim()) {
    return { ok: false, forma: "assente", passi: [], percorsi: [], perche: "nessun test dichiarato" };
  }
  const t = test.trim();

  // ① UNA RIGA DI COMANDO — c'è uno spazio. Prima si spezzava male e usciva ≠ 0 sempre.
  if (/\s/.test(t)) {
    const s = spezzaComando(t, { soloDentroIlRepo, radiciAmmesse });
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
  if (fuoriDalRepo(t) && !radiceAmmessa(t, radiciAmmesse)) {
    return { ok: false, forma: "percorso", passi: [], percorsi: [], perche: `esce dal repo e non è sotto una radice ammessa: «${t}»` };
  }
  // …e dev'essere un percorso e basta. Questo ramo non passa da `spezzaComando`, quindi il filtro dei
  // metacaratteri non lo vede mai: `cervello/x.mjs;curl` non ha spazi, arrivava qui intatto e usciva
  // «eseguibile». Non è una falla di esecuzione (si lancia senza shell) ma è una stringa che nessuno
  // ha guardato scritta in un registro di dati — cioè il primo passo di AR-877.
  if (!PERCORSO_PULITO.test(t)) {
    return { ok: false, forma: "percorso", passi: [], percorsi: [], perche: `non è un percorso: «${t}» contiene caratteri che un file di casa non ha` };
  }
  // …e va lanciato col programma GIUSTO PER LA SUA SPECIE. `node file.bats` è uno script bash dato
  // in pasto al parser JavaScript: SyntaxError, uscita 1, e non-vacuita legge «prova diventata
  // rossa». Due voci vere (AR-390, AR-396) risultavano verificate proprio così.
  if (t.endsWith(".bats")) {
    return { ok: true, forma: "percorso-bats", passi: [{ comando: "npx", argomenti: ["bats", t], percorsi: [t] }], percorsi: [t], perche: "" };
  }
  // ─────────────────────────────────────────────────────────────────────────
  // L'ESECUTORE VA DICHIARATO, NON DEDOTTO DALLA VERSIONE DI CHI PASSA (AR-865)
  // ─────────────────────────────────────────────────────────────────────────
  // Sette voci di `mutanti.json` puntano a prove `.mts`. Con `node file.mts` reggono soltanto perché
  // QUESTO node è il 22.22, che i tipi li toglie da solo. MISURATO qui il 28/8, spegnendo proprio
  // quella capacità — cioè mettendosi nei panni di un node più vecchio:
  //     node --no-experimental-strip-types pannello/src/lib/lavoro-negozio.test.mts
  //     → ERR_UNKNOWN_FILE_EXTENSION, uscita 1
  // Uscita 1 è ESATTAMENTE il segnale con cui il banco riconosce «la prova è diventata rossa»: su una
  // macchina con un node più vecchio quelle sette voci comprerebbero il verde qualunque cosa faccia
  // la mutazione. È AR-840 in un'altra veste, sulla stessa strada.
  // La cura è la stessa dei `.bats`: il programma lo decide la SPECIE del file, non la fortuna della
  // versione. `--no-install` perché un esecutore che manca dev'essere un ⚪ subito (lo riconosce
  // `avvioFallito`), non un pacchetto scaricato dalla rete ed eseguito.
  if (TIPI_TYPESCRIPT.some((e) => t.endsWith(e))) {
    return {
      ok: true,
      forma: "percorso-typescript",
      passi: [{ comando: "npx", argomenti: ["--no-install", "tsx", "--test", t], percorsi: [t] }],
      percorsi: [t],
      perche: "",
    };
  }
  return { ok: true, forma: "percorso-node", passi: [{ comando: "node", argomenti: [t], percorsi: [t] }], percorsi: [t], perche: "" };
}

/** Le impronte inequivocabili di un processo che non è mai arrivato a eseguire una prova. */
const IMPRONTE_DI_AVVIO = [
  { re: /could not determine executable to run/i, dillo: "il programma da lanciare non è installato (npx non l'ha trovato)" },
  { re: /^(?:.*: )?(\S+): command not found/m, dillo: "il programma da lanciare non esiste su questa macchina" },
  { re: /Cannot find package '([^']+)'/, dillo: "manca un pacchetto: la prova non è partita" },
  // ⚪ TROVATO IL 29/8 SUL RUNNER, e non da un ragionamento: dalla verifica automatica, che contava
  // un rosso in più di questa macchina. In un ambiente pulito — HOME vuota, niente pacchetti in
  // cache, nessuna risposta possibile a una domanda — `npx` non scarica e stampa «canceled due to
  // missing packages and no YES option», uscendo ≠ 0. Nessuna delle impronte qui sopra la
  // riconosceva, quindi il banco leggeva quell'uscita come «la prova è diventata rossa»: cioè
  // AR-840 di nuovo, in un ambiente dove nessuno lo stava guardando.
  //
  // Perché è proprio la forma peggiore: succede SOLO sul runner e MAI sulla macchina di chi scrive
  // (qui i pacchetti sono in cache), che è la definizione di AR-797 — «verde sul computer di chi lo
  // scrive, rosso per sempre sul server». Un difetto così non lo trova chi costruisce: lo trova la
  // prima macchina pulita, ed è la ragione per cui la casa spoglia esiste.
  { re: /npx canceled due to missing packages/i, dillo: "npx non ha potuto procurarsi il programma (nessun pacchetto in cache e nessuna conferma possibile)" },
  { re: /npm error .*(?:ENOTFOUND|ETIMEDOUT|ECONNREFUSED|network)/i, dillo: "il programma andava scaricato e la rete non c'è" },
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
  // ⚪ AR-865, seconda difesa. `node prova.mts` su un interprete che non toglie i tipi non fallisce
  // per colpa della mutazione: fallisce perché non sa nemmeno aprire il file — ERR_UNKNOWN_FILE_EXTENSION,
  // uscita 1, cioè un avvio mai avvenuto travestito da «prova diventata rossa». MISURATO il 28/8 su
  // questa macchina spegnendo la levatura dei tipi (`--no-experimental-strip-types`): prima di questa
  // riga `avvioFallito` tornava null, cioè il banco ci credeva.
  // Stretta come quella dei moduli: vale solo se l'estensione ignota è quella del file CHE ABBIAMO
  // CHIESTO DI ESEGUIRE. Una mutazione che rompe un import verso un file di altra specie deve restare
  // una prova diventata rossa, non diventare un ⚪ regalato.
  if (/ERR_UNKNOWN_FILE_EXTENSION/.test(testo) && entrata && testo.includes(String(entrata))) {
    return `questo interprete non sa eseguire «${entrata}» (estensione non riconosciuta): serve l'esecutore giusto, non è una prova diventata rossa`;
  }
  for (const { re, dillo } of IMPRONTE_DI_AVVIO) {
    if (re.test(testo)) return `${dillo}: la prova non è partita`;
  }
  return null;
}
