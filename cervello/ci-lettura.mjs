// 🚦 LEGGERE LA CI — il cuore puro: riceve i controlli già scaricati e decide cosa significano.
//
// PERCHÉ ESISTE (Nicola, 4/8 sera: «vorrei che potesse leggere la CI… ma in modo intelligente,
// senza fare cavolate»). La macchina apre PR da sola — è la regola `flusso.pr-sempre` — e fin qui
// non ha mai guardato l'esito dei controlli che partono su quelle PR. Misurato quella sera: sulle
// sei PR aperte, CINQUE erano rosse e nessuno lo sapeva; la sesta non aveva nemmeno un controllo
// partito, che è la condizione più pericolosa di tutte perché a occhio somiglia al verde.
//
// LA CAVOLATA DA NON FARE, ed è il motivo per cui questo file è separato dal comando: leggere
// «rosso» e mettersi a riparare. Quella sera i cinque rossi erano lo STESSO rosso, e non lo aveva
// causato nessuna di quelle PR: era già rosso su `main`. Una macchina che vede rosso e corregge
// avrebbe aperto cinque PR di riparazione su un guasto che non era loro. Perciò qui dentro il
// giudizio non è mai «rosso/verde»: è **rosso di chi**.
//
// I QUATTRO STATI, e il terzo è quello che costa (⚪ non l'ho potuto misurare — la stessa regola
// della visita `salute.mjs`: un controllo che non ho potuto vedere non è un verde):
//   · verde         — tutti i controlli finiti bene
//   · rosso         — almeno un controllo finito male
//   · in-corso      — qualcuno sta ancora girando: non è né sì né no, si aspetta
//   · non-misurato  — zero controlli. Se la base ne ha, vuol dire che qui non sono partiti.
//
// Nessun I/O e nessuna rete: così le prove possono interrogarlo con casi finti invece di rileggerlo.
// Il lato che parla con GitHub è `ci-stato.mjs`.

/** I quattro stati possibili di una PR davanti ai suoi controlli. */
export const STATO = {
  VERDE: "verde",
  ROSSO: "rosso",
  IN_CORSO: "in-corso",
  NON_MISURATO: "non-misurato",
};

/** Come si chiama la colpa di un rosso. `ignota` è onesta: non ho letto i log, non lo so. */
export const COLPA = {
  MIA: "mia", // il guasto compare qui e non sulla base: l'ha portato questo ramo
  EREDITATA: "ereditata", // lo stesso guasto è già sulla base: ripararlo qui è lavoro sbagliato
  MISTA: "mista", // un pezzo è mio, un pezzo era già lì
  IGNOTA: "ignota", // non ho potuto confrontare (log non letti, base non misurata)
};

/** Le conclusioni di GitHub che contano come «finito bene». `skipped`/`neutral` non sono guasti. */
const BUONE = new Set(["success", "neutral", "skipped"]);

/** Le conclusioni che contano come guasto. `stale` non c'è: è un esito vecchio, non un rosso. */
const CATTIVE = new Set(["failure", "timed_out", "cancelled", "action_required", "startup_failure"]);

/**
 * Lo stesso controllo può comparire più volte sullo stesso commit: ri-esecuzioni, o due workflow che
 * dichiarano lo stesso nome di job. Contarli tutti darebbe «3 rossi» dove il rosso è uno, e — peggio
 * — un rosso vecchio ri-eseguito e diventato verde resterebbe a fare numero.
 *
 * Vince il più recente per nome. `started_at` mancante finisce in fondo: senza data non posso dire
 * che sia il più nuovo, e promuoverlo sarebbe indovinare.
 */
export function ultimiPerNome(controlli = []) {
  const perNome = new Map();
  for (const c of controlli) {
    const nome = String(c?.name || "").trim() || "(senza nome)";
    const quando = Date.parse(c?.started_at || c?.completed_at || "") || 0;
    const prima = perNome.get(nome);
    if (!prima || quando >= prima.quando) perNome.set(nome, { quando, controllo: c });
  }
  return [...perNome.values()].map((v) => v.controllo);
}

/**
 * Il verdetto su una PR sola.
 *
 * `ciSullaBase` è la domanda che rende onesto il caso «zero controlli»: se il ramo di partenza ha i
 * suoi controlli e questa PR no, i workflow non sono partiti (succede quando la PR nasce da un token
 * applicativo) — ed è un buco, non una promozione. Se invece nemmeno la base ne ha, in questo repo
 * la CI non c'è: lo dico, e non lo spaccio per verde.
 */
export function verdetto(controlli = [], ciSullaBase = null) {
  const ultimi = ultimiPerNome(controlli);

  if (ultimi.length === 0) {
    return {
      stato: STATO.NON_MISURATO,
      motivo:
        ciSullaBase === true
          ? "nessun controllo partito su questa PR, mentre sul ramo di partenza ce ne sono: i workflow non sono scattati"
          : "in questo repo non risulta nessun controllo automatico: non c'è niente da leggere",
      rossi: [],
      inCorso: [],
      quanti: 0,
    };
  }

  const inCorso = ultimi.filter((c) => String(c?.status) !== "completed");
  const rossi = ultimi.filter((c) => String(c?.status) === "completed" && CATTIVE.has(String(c?.conclusion)));
  const ignoti = ultimi.filter(
    (c) => String(c?.status) === "completed" && !BUONE.has(String(c?.conclusion)) && !CATTIVE.has(String(c?.conclusion)),
  );

  // L'ordine è una scelta: il rosso vince sull'in-corso. Se un controllo è già fallito, aspettare gli
  // altri non cambia la risposta alla domanda «si può unire?», e dire «in corso» inviterebbe ad
  // aspettare un verde che non arriverà.
  if (rossi.length) {
    return {
      stato: STATO.ROSSO,
      motivo: `${rossi.length} controllo/i finiti male su ${ultimi.length}`,
      rossi: rossi.map((c) => nomeDi(c)),
      inCorso: inCorso.map((c) => nomeDi(c)),
      quanti: ultimi.length,
    };
  }
  if (inCorso.length) {
    return {
      stato: STATO.IN_CORSO,
      motivo: `${inCorso.length} controllo/i stanno ancora girando`,
      rossi: [],
      inCorso: inCorso.map((c) => nomeDi(c)),
      quanti: ultimi.length,
    };
  }
  if (ignoti.length) {
    return {
      stato: STATO.NON_MISURATO,
      motivo: `${ignoti.length} controllo/i sono finiti con un esito che non so leggere (${ignoti
        .map((c) => String(c?.conclusion || "vuoto"))
        .join(", ")})`,
      rossi: [],
      inCorso: [],
      quanti: ultimi.length,
    };
  }
  return { stato: STATO.VERDE, motivo: `${ultimi.length} controllo/i finiti bene`, rossi: [], inCorso: [], quanti: ultimi.length };
}

function nomeDi(c) {
  return String(c?.name || "(senza nome)");
}

// ─────────────────────────────────────────────────────────────────────────────
// DAL LOG AL GUASTO — poche righe, quelle che dicono il perché
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Le righe di un log che portano un verdetto.
 *
 * Stessa scelta di `righeMotivo` nel cancello del lotto, e per lo stesso motivo già pagato (AR-491):
 * prendere la CODA di un log è comodo finché il comando parla per ultimo, e quando non lo fa
 * restituisce le graffe di chiusura — tre giri di indagine alla cieca su un guasto che aveva la sua
 * ragione scritta dentro. Qui si sceglie per CONTENUTO.
 *
 * Il taglio del timestamp non è cosmetico: ogni riga di GitHub Actions comincia con l'ora, e senza
 * toglierla due esecuzioni dello stesso identico guasto risulterebbero due guasti diversi — cioè il
 * confronto con la base, che è il senso di tutto questo file, non funzionerebbe mai.
 */
export function righeSignificative(log = "", max = 12) {
  const MARCATORE = /(❌|⛔|##\[error\]|AssertionError|\bnot ok\b|\bError:|\bErrore:)/;
  const RUMORE = /(Node\.js 20 is deprecated|Node 20 is being deprecated|npm audit|Post job cleanup|##\[warning\])/;
  const righe = String(log || "")
    .split("\n")
    .map((r) => r.replace(/^\S*\d{4}-\d{2}-\d{2}T[\d:.]+Z\s?/, "").replace(/\[[0-9;]*m/g, "").trimEnd())
    .filter((r) => r.trim() && MARCATORE.test(r) && !RUMORE.test(r));
  // Le ultime, non le prime: in una suite il riepilogo dei guasti sta in fondo, e le prime righe
  // rosse sono spesso il dettaglio di un guasto che poi viene riassunto meglio.
  return righe.slice(-max).map((r) => r.trim());
}

/**
 * L'impronta di un guasto: quello che resta uguale fra due esecuzioni dello stesso problema.
 *
 * I numeri diventano `#` apposta. «240 consegne mute contro un tetto di 238» e «241 … 238» sono lo
 * STESSO guasto con un contatore che si è mosso: se il numero contasse, ogni commit farebbe sembrare
 * nuovo un debito vecchio — e la macchina si metterebbe a riparare a ogni giro la stessa cosa che
 * non ha rotto lei. È il difetto che questo file esiste per evitare, e nasconde qui.
 */
export function impronta(righe = []) {
  const fuori = new Set();
  for (const r of righe) {
    const chiave = String(r)
      .replace(/\b\d+\b/g, "#")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);
    if (chiave) fuori.add(chiave);
  }
  return fuori;
}

/**
 * Di chi è il rosso: mio, o era già lì.
 *
 * `baseMisurata = false` non significa «non era lì»: significa che non l'ho guardata. In quel caso la
 * colpa resta `ignota` — e chiamarla `mia` sarebbe la bugia che manda a riparare il guasto di
 * qualcun altro, cioè esattamente la cavolata che Nicola ha chiesto di non fare.
 */
export function colpaDi(mie = new Set(), base = new Set(), baseMisurata = true) {
  const M = [...mie];
  if (!baseMisurata) return { classe: COLPA.IGNOTA, nuove: M, gia: [], perche: "non ho letto i controlli del ramo di partenza: non posso dire di chi sia" };
  if (M.length === 0) return { classe: COLPA.IGNOTA, nuove: [], gia: [], perche: "non ho letto nessuna riga di guasto: il log non me lo ha dato" };

  const nuove = M.filter((k) => !base.has(k));
  const gia = M.filter((k) => base.has(k));
  if (nuove.length === 0) {
    return { classe: COLPA.EREDITATA, nuove: [], gia, perche: "ogni guasto di questa PR è già presente sul ramo di partenza" };
  }
  if (gia.length === 0) {
    return { classe: COLPA.MIA, nuove, gia: [], perche: "questi guasti non ci sono sul ramo di partenza: li ha portati questo ramo" };
  }
  return { classe: COLPA.MISTA, nuove, gia, perche: "una parte dei guasti è nuova, il resto era già sul ramo di partenza" };
}

// ─────────────────────────────────────────────────────────────────────────────
// COSA SI FA DOPO — la parte che deve restare noiosa
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Il freno sul merge.
 *
 * Il merge è l'azione più irreversibile di questa macchina (AR-272: su `main` fa partire il deploy) e
 * finora chiedeva la firma di Nicola ma non guardava se il codice passava le prove. Firmare una card
 * non è leggere la CI: Nicola firma il LAVORO, non il colore dei controlli — quello è il mestiere
 * della macchina, ed è questo.
 *
 * Non esiste un'opzione per saltarlo, di proposito: `--force` è stato tolto da `git-merge.mjs` in
 * AR-272 e non torna da questa porta. Se Nicola vuole unire lo stesso, il bottone su GitHub è suo e
 * questo freno non glielo tocca — quello che non deve succedere è che a unire un rosso sia la macchina.
 */
export function puoMergiare(v = {}) {
  const stato = String(v?.stato || "");
  if (stato === STATO.VERDE) return { ok: true, misurato: true, motivo: "tutti i controlli sono finiti bene" };
  if (stato === STATO.ROSSO) {
    return { ok: false, misurato: true, motivo: `controlli rossi: ${(v.rossi || []).join(", ") || v.motivo}` };
  }
  if (stato === STATO.IN_CORSO) {
    return { ok: false, misurato: true, motivo: `i controlli non hanno ancora finito: ${(v.inCorso || []).join(", ") || v.motivo}` };
  }
  // NON_MISURATO — e qui si separano due cose che sembrano uguali. Se i controlli mancano MENTRE la
  // base ce li ha, questa PR non è stata provata da nessuno: si ferma. Se invece la CI non esiste
  // proprio, fermare vorrebbe dire bloccare per sempre ogni merge di quel repo: passa, ma dichiarato.
  if (/non sono scattati|non so leggere/.test(String(v?.motivo || ""))) {
    return { ok: false, misurato: false, motivo: `⚪ ${v.motivo} — un controllo che non ho potuto vedere non è un verde` };
  }
  return { ok: true, misurato: false, motivo: `⚪ ${v.motivo}` };
}

/** Cosa deve fare la macchina davanti a questa PR. Una frase, in parole semplici. */
export function prossimaMossa(pr = {}) {
  const stato = String(pr?.verdetto?.stato || "");
  if (stato === STATO.VERDE) return "niente: è pronta per la firma di Nicola";
  if (stato === STATO.IN_CORSO) return "aspetta: i controlli stanno ancora girando, si rilegge fra qualche minuto";
  if (stato === STATO.NON_MISURATO) return "controlla perché i controlli non sono partiti: senza, questa PR non l'ha provata nessuno";
  const classe = String(pr?.colpa?.classe || COLPA.IGNOTA);
  if (classe === COLPA.EREDITATA) return "NON toccare questa PR: lo stesso guasto è già sul ramo di partenza, si ripara là una volta sola";
  if (classe === COLPA.MIA) return "correggi qui, sullo stesso ramo: il guasto l'ha portato questo lavoro";
  if (classe === COLPA.MISTA) return "correggi qui solo i guasti nuovi, il resto viene dal ramo di partenza";
  return "leggi il log a mano: non ho potuto capire di chi sia il guasto";
}

/**
 * Il rosso che vale la pena raccontare: quello che qualcuno ha causato qui.
 *
 * I rossi ereditati non entrano nel conto — non perché non contino, ma perché sono UN guasto solo
 * moltiplicato per il numero di PR aperte. Contarli tutti farebbe un allarme da cinque quando il
 * lavoro da fare è uno, e un allarme gonfiato si impara a scorrere.
 */
export function daRiparare(prs = []) {
  return prs.filter((p) => p?.verdetto?.stato === STATO.ROSSO && [COLPA.MIA, COLPA.MISTA].includes(String(p?.colpa?.classe)));
}

/** I guasti ereditati, raggruppati: uno solo, con l'elenco delle PR che se lo trascinano. */
export function guastiEreditati(prs = []) {
  const perGuasto = new Map();
  for (const p of prs) {
    if (p?.verdetto?.stato !== STATO.ROSSO) continue;
    if (![COLPA.EREDITATA, COLPA.MISTA].includes(String(p?.colpa?.classe))) continue;
    for (const g of p?.colpa?.gia || []) {
      if (!perGuasto.has(g)) perGuasto.set(g, []);
      perGuasto.get(g).push(p.numero);
    }
  }
  return [...perGuasto.entries()].map(([guasto, pr]) => ({ guasto, pr })).sort((a, b) => b.pr.length - a.pr.length);
}

/**
 * Il codice d'uscita, col contratto di casa (AR-322): 0 = si va avanti · 1 = c'è da riparare ·
 * 2 = NON HO POTUTO MISURARE.
 *
 * Il 2 non è un verde più morbido, ed è la ragione per cui esiste: senza token, o con GitHub che non
 * risponde, uscire 0 direbbe «tutto a posto» a chi lo legge da uno script. Un cieco che si maschera
 * da sano è il difetto che questa casa paga da più tempo.
 */
export function codiceUscita({ cieco = 0, daRiparare: quante = 0, nonMisurate = 0 } = {}) {
  if (cieco) return 2;
  if (quante > 0) return 1;
  if (nonMisurate > 0) return 1; // una PR che nessun controllo ha provato è lavoro da fare, non uno stato
  return 0;
}
