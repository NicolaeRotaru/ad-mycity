#!/usr/bin/env node
// 🧨 LA PROVA CHE LE PROVE PROVINO — rompe i fix apposta e pretende che i test diventino rossi.
//
// PERCHÉ ESISTE. Il passo ④.2 della skill `cantiere` dice: «rompi il fix riga per riga, e il test
// DEVE diventare rosso; se resta verde, la prova non prova niente». È il passo che ha pescato
// quattro difetti nel metro stesso in due giorni — e finora si faceva **a mano**, con uno script
// usa-e-getta buttato in /tmp e perso alla fine della sessione. Cioè: il controllo più prezioso del
// metodo era l'unico senza memoria.
//
// Qui le mutazioni diventano un file versionato (`cervello/mutanti.json`) e la verifica un comando.
// Chi legge la PR può rilanciarlo; chi arriva fra un mese vede quali fix erano protetti davvero.
//
// 🟡 Modifica temporaneamente i file per rompere il fix, e li RIPRISTINA sempre — anche su
// eccezione, anche su Ctrl-C. Non tocca git, non committa. Lavora sul working tree: non lanciarlo
// con modifiche non salvate che ti dispiacerebbe perdere se la macchina si spegne a metà.
//
// Uso:
//   node cervello/non-vacuita.mjs                       # tutte le mutazioni
//   node cervello/non-vacuita.mjs --lotto 29            # solo quelle di un lotto
//   node cervello/non-vacuita.mjs --difetti AR-1,AR-2   # solo quelle dei difetti indicati
//   node cervello/non-vacuita.mjs --json
//
// `--difetti` esiste per AR-393: il cancello del lotto lo esegue sui difetti che il lotto TOCCA, e
// solo su quelli. Rompere tutte le mutazioni di trenta lotti a ogni consegna costerebbe minuti e
// insegnerebbe ad aggirare il cancello — un controllo che si impara a saltare è già spento.
//
// Uscita (contratto guardiani, AR-322):
//   0 = ogni mutazione rende rosso il suo test: le prove non sono vacue
//   1 = almeno una mutazione lascia il test VERDE → quella prova non dimostra il suo fix
//   2 = non ho potuto misurare (file/mutanti assenti, pattern non trovato)

import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { isAbsolute, join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";
import { leggiSalto } from "./ambiente-prova.mjs";

const JSON_MODE = process.argv.includes("--json");
const iLotto = process.argv.indexOf("--lotto");
const LOTTO = iLotto !== -1 ? String(process.argv[iLotto + 1] || "") : null;
const iDif = process.argv.indexOf("--difetti");
const DIFETTI = iDif !== -1 ? String(process.argv[iDif + 1] || "").split(/[,\s]+/).filter(Boolean) : null;

/** Gli id di difetto nominati da una mutazione: il campo `difetto` può accorparne più d'uno. */
export function difettiDellaMutazione(m) {
  return String(m?.difetto || "").match(/AR-\d+/g) || [];
}

// ─────────────────────────────────────────────────────────────────────────────
// IL RIPRISTINO D'EMERGENZA (AR-523) — `finally` non gira su un processo UCCISO.
//
// PERCHÉ ESISTE. Il 4/8 un mio comando è andato in timeout mentre questo strumento teneva applicata
// una mutazione: il SIGTERM ha saltato il `finally` qui sotto e `cervello/git-pr.mjs` è rimasto su
// disco col fix di AR-451 disfatto (`const preRebaseSha = null`). Per git era una modifica come
// un'altra, indistinguibile da una scelta; l'ha preso il sorvegliante al primo Edit successivo, con
// una voce `prova-accecata`. Senza di lui finiva dritto in un commit.
//
// La radice: uno strumento di misura che scrive nell'oggetto misurato deve saper rimettere le cose
// a posto ANCHE quando viene ammazzato. Un `finally` copre l'eccezione, non il segnale.
// ─────────────────────────────────────────────────────────────────────────────

/** Il file che sto tenendo rotto adesso, e com'era prima. Un oggetto e non una variabile nuda così
 *  il gestore del segnale legge sempre l'ultimo valore, senza catturarne una copia vecchia. */
export const IN_CORSO = { stato: null };

/**
 * Rimette a posto il file lasciato rotto. `scrivi` è iniettato: senza, questa funzione si potrebbe
 * provare solo ammazzando un processo vero — cioè non si proverebbe, ed è esattamente com'è nato il
 * difetto che cura.
 *
 * @returns {string|null} il file rimesso a posto, o `null` se non c'era niente da rimettere
 */
export function ripristina(stato, scrivi) {
  if (!stato || !stato.file) return null;
  try {
    scrivi(stato.file, stato.originale);
    return stato.file;
  } catch {
    // Non riesco nemmeno a ripristinare: non posso fare altro che dirlo (lo fa il chiamante).
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IL FOGLIETTO SU DISCO (AR-708) — perché il gestore del segnale non basta.
//
// AR-523 ha agganciato il ripristino a SIGINT/SIGTERM/SIGHUP. Ma il gestore di un segnale è una
// callback JS, e una callback gira solo quando il ciclo degli eventi è LIBERO. Qui il ciclo non è
// mai libero nel momento che conta: si applica la mutazione, si chiama `spawnSync` — che blocca il
// processo per tutta la durata del test — e si rimette a posto subito dopo. La finestra in cui il
// file resta rotto è esattamente la finestra in cui nessun gestore può partire. La cura copriva
// ogni momento tranne quello che doveva coprire.
//
// Visto succedere il 15/8: fermato il cancello a metà, `cervello/test-cervello.mjs` è rimasto su
// disco con la mutazione di AR-676 applicata (`const i = -1;` al posto del filtro `--solo`). L'ho
// rimesso a posto a mano. Senza il sorvegliante finiva in un commit — parola per parola il racconto
// di AR-523.
//
// La cura non può essere una callback: deve essere una TRACCIA. Prima di rompere si scrive un
// foglietto su disco (quale file, e com'era prima); dopo il ripristino lo si cancella. All'avvio, se
// il foglietto c'è, vuol dire che la corsa precedente non è arrivata in fondo: si rimette a posto e
// LO SI DICE. Così il ripristino non dipende più dal fatto che il processo sia ancora vivo — che è
// l'unica ipotesi che un SIGKILL, un `kill -9` o una macchina che si spegne non concedono.
//
// Il nome comincia con `_tmp_` perché `.gitignore` ignora già quella forma: un foglietto lasciato
// da una corsa morta non deve poter finire in un commit insieme al file che stava proteggendo.
// ─────────────────────────────────────────────────────────────────────────────

export const FOGLIETTO = process.env.NON_VACUITA_FOGLIETTO || join(AD_ROOT, "_tmp_non-vacuita-in-corso.json");

/** Lascia la traccia PRIMA di rompere. `scrivi` iniettato: il test la esercita senza toccare il repo. */
export function lasciaTraccia(stato, scrivi, via = FOGLIETTO) {
  if (!stato || !stato.file) return null;
  scrivi(via, `${JSON.stringify({ file: stato.file, originale: stato.originale, quando: new Date().toISOString() }, null, 1)}\n`);
  return via;
}

/**
 * Toglie la traccia dopo un ripristino riuscito. Un fallimento qui non deve fermare la corsa —
 * ma non deve nemmeno sparire.
 *
 * Prima tornava `false` e basta, e tutti e quattro i chiamanti lo buttavano via: un errore che
 * diventa niente (la malattia censita `fonte-troncata-letta-per-intera`). E qui il costo è
 * concreto, non teorico: se il foglietto NON si riesce a cancellare, la corsa dopo lo trova e
 * crede che questa sia morta a metà — quindi «ripristina» un file che era già a posto. Cioè
 * proprio il guasto silenzioso che AR-708 stava curando, riaperto dalla porta accanto.
 *
 * @returns {{tolta: boolean, motivo: string|null}} il motivo viaggia col dato, non si perde.
 */
export function togliTraccia(cancella, via = FOGLIETTO) {
  try {
    cancella(via);
    return { tolta: true, motivo: null };
  } catch (e) {
    return { tolta: false, motivo: `non sono riuscito a togliere il foglietto ${via}: ${e.message || e}` };
  }
}

/** Toglie la traccia e, se non ci riesce, lo DICE. Il posto da cui i chiamanti passano. */
function togliTracciaDicendolo(cancella, via = FOGLIETTO) {
  const esito = togliTraccia(cancella, via);
  if (!esito.tolta) {
    console.error(`⚠️  ${esito.motivo}`);
    console.error("   La corsa dopo lo troverà e crederà che questa sia morta a metà: toglilo a mano.");
  }
  return esito;
}

/**
 * All'avvio: c'è un foglietto di una corsa che non è arrivata in fondo?
 *
 * Quattro risposte, e nessuna è il silenzio — un ripristino che non si dichiara è indistinguibile
 * da un file che nessuno ha mai rotto:
 *   · `null`            → nessun foglietto: la corsa precedente è finita bene
 *   · `rimesso`         → il file era ancora rotto, l'ho riscritto com'era
 *   · `gia-a-posto`     → il file era già a posto (qualcuno l'ha rimesso, o il `finally` ce l'ha fatta)
 *   · `illeggibile`/`fallito` → il foglietto c'è ma non posso usarlo: lo dico e lo LASCIO lì, perché
 *     cancellarlo qui sarebbe far sparire l'unica traccia del file che è rimasto rotto.
 */
export function riprendiDaTraccia({ ceE, leggi, scrivi, cancella }, via = FOGLIETTO) {
  if (!ceE(via)) return null;
  let nota;
  try {
    nota = JSON.parse(leggi(via));
  } catch (e) {
    return { esito: "illeggibile", file: null, motivo: `foglietto di ripristino illeggibile (${e.message}): non so quale file rimettere a posto` };
  }
  if (!nota || typeof nota.file !== "string" || typeof nota.originale !== "string") {
    return { esito: "illeggibile", file: null, motivo: "foglietto di ripristino senza `file`/`originale`: non so quale file rimettere a posto" };
  }
  let adesso = null;
  try {
    adesso = ceE(nota.file) ? leggi(nota.file) : null;
  } catch {
    adesso = null;
  }
  if (adesso === nota.originale) {
    togliTracciaDicendolo(cancella, via);
    return { esito: "gia-a-posto", file: nota.file, motivo: `${nota.file} era già com'era: la corsa precedente ha fatto in tempo a rimetterlo` };
  }
  try {
    scrivi(nota.file, nota.originale);
  } catch (e) {
    return { esito: "fallito", file: nota.file, motivo: `non sono riuscito a rimettere a posto ${nota.file} (${e.message}): il file è ANCORA rotto` };
  }
  togliTracciaDicendolo(cancella, via);
  return { esito: "rimesso", file: nota.file, motivo: `${nota.file} era rimasto rotto da una corsa precedente ammazzata: l'ho rimesso com'era (AR-708)` };
}

/** L'IO vero, in un posto solo: il test inietta il suo e non tocca niente di questo repo. */
const IO_VERO = {
  ceE: (f) => existsSync(f),
  leggi: (f) => readFileSync(f, "utf8"),
  scrivi: (f, t) => writeFileSync(f, t),
  cancella: (f) => rmSync(f, { force: true }),
};

for (const segnale of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(segnale, () => {
    const rimesso = ripristina(IN_CORSO.stato, (f, t) => writeFileSync(f, t));
    IN_CORSO.stato = null;
    if (rimesso) togliTracciaDicendolo(IO_VERO.cancella);
    if (rimesso) console.error(`\n⚠️  interrotto da ${segnale}: ho rimesso a posto ${rimesso} prima di uscire (AR-523).`);
    process.exit(130);
  });
}

/** Le mutazioni che riguardano almeno uno dei difetti chiesti. Pura: il test la interroga da sola. */
export function filtraPerDifetti(elenco = [], ids = null) {
  if (!ids || !ids.length) return elenco;
  const cercati = new Set(ids.map(String));
  return elenco.filter((m) => difettiDellaMutazione(m).some((d) => cercati.has(d)));
}

// Puntabile altrove per il test (stessa forma di sensori-spenti-check): senza, l'unico modo di
// provare questo strumento sarebbe rompere un fix vero del repo — e una prova che guarda com'è il
// mondo adesso resta verde anche a strumento rimosso.
const MUTANTI = process.env.MUTANTI_FILE || join(AD_ROOT, "cervello/mutanti.json");

// Quanto tempo do a UNA prova prima di considerarla non finita.
//
// Erano due minuti, e due minuti bastano a ogni prova che legge dei file. Non bastano a quelle che
// devono aprire il Pannello: prima che il primo caso parta, `c4-schermo-coda.test.mjs` aspetta fino
// a tre minuti che il server di sviluppo risponda. Con il tetto a due, quella prova veniva ammazzata
// a metà attesa — e da oggi un ammazzato è un ⚪, cioè un cancello rosso per un motivo che col fix
// non c'entra niente. Il tetto deve stare sopra l'attesa più lunga che una prova di casa dichiara.
const TEMPO_MAX = Number(process.env.NON_VACUITA_TIMEOUT_MS || 420_000);

/** Il file da rompere. Assoluto se la mutazione lo dà assoluto (è così che il test usa una fixture). */
const viaDi = (f) => (isAbsolute(String(f)) ? String(f) : join(AD_ROOT, String(f)));

/** Applica la mutazione al testo. Torna null se il pattern non c'è (puntatore rotto o fix cambiato). */
export function muta(testo, cerca, sostituisci) {
  if (!testo.includes(cerca)) return null;
  return testo.split(cerca).join(sostituisci);
}

/**
 * ⚪ LA CORSA SI È TIRATA INDIETRO? — AR-707.
 *
 * Un file di prova di questa casa, quando gli manca lo strumento per guardare (il browser, un
 * servizio in ascolto), NON dice «a posto»: stampa un piano vuoto dichiarato come salto e se ne va
 * con zero. Ma zero è anche il numero di chi ha guardato e non ha trovato niente da ridire. Da fuori
 * i due casi hanno lo stesso numero di uscita e vogliono dire il contrario.
 *
 * Si distinguono solo leggendo cosa la corsa ha DETTO. Due forme, quelle che `node:test` produce:
 *   · `1..0 # SKIP <perché>`                        → si è tirato indietro prima di registrare un caso
 *   · `# pass 0` + `# fail 0` + `# skipped N` (N>0)  → i casi c'erano e sono stati saltati tutti
 */
export function haDichiaratoDiNonGuardare(uscita = "") {
  // La lettura del salto vive in `cervello/ambiente-prova.mjs`, in una casa sola: qui c'era una
  // seconda copia della stessa regola, e come l'altra non riconosceva la forma mascherata dal
  // reporter (`# 1..0 \# SKIP`). Due copie di un freno non sono un freno.
  if (leggiSalto(uscita).salto) return true;
  const quanti = (chiave) => {
    const m = String(uscita).match(new RegExp(`^#\\s*${chiave}\\s+(\\d+)\\s*$`, "im"));
    return m ? Number(m[1]) : null;
  };
  const saltati = quanti("skipped") ?? quanti("skip");
  return quanti("pass") === 0 && quanti("fail") === 0 && saltati !== null && saltati > 0;
}

/**
 * Il verdetto su UNA mutazione: rompendo il fix, la prova se n'è accorta?
 *
 * Tre risposte, quelle di casa (AR-322) — e fino al 15/8 erano due, con le altre due travestite:
 *   ✅ ok    · il test è diventato rosso → la prova difende il suo fix
 *   ❌ vacua · il test è rimasto verde col fix rotto → quella prova non prova niente
 *   ⚪ cieco · non ho misurato: la corsa non è mai finita, oppure ha dichiarato di non poter guardare
 *
 * PERCHÉ ESISTE (il conto, misurato il 15/8). Il giudizio era `r.status !== 0`, cioè il solo numero
 * di uscita — e il numero di uscita di una corsa che non è avvenuta non significa niente. Due bugie
 * opposte uscivano dalla stessa riga:
 *
 *  ① **Un ⚪ raccontato come ❌.** In CI non c'è nessun browser, quindi `c4-schermo-coda.test.mjs`
 *     dichiara il salto ed esce 0. Il banco leggeva «zero» e scriveva «AR-613 — la prova NON
 *     dimostra il suo fix: rompendolo il test resta verde». Non era vero: quella prova diventa rossa
 *     eccome, su una macchina che il Pannello lo sa aprire. L'accusa era all'innocente, e mandava a
 *     indagare sul fix invece che sull'ambiente.
 *  ② **Un ⚪ raccontato come ✅**, che è il verso pericoloso. Un test AMMAZZATO (timeout, segnale)
 *     torna `status === null`, e `null !== 0` è vero: il banco lo contava come «è diventato rosso,
 *     la prova morde». Cioè la mutazione più lenta comprava il verde smettendo di rispondere.
 *
 * La radice è una sola e vale oltre questo file: **il codice d'uscita descrive una corsa avvenuta.
 * Prima di leggerlo bisogna sapere se la corsa c'è stata.**
 */
export function verdettoCorsa({ status, signal = null, uscita = "" } = {}) {
  if (status === null || status === undefined) {
    return {
      verdetto: "cieco",
      perche: `il test non è arrivato in fondo (${signal || "ammazzato, o mai partito"}): non ha misurato niente`,
    };
  }
  if (haDichiaratoDiNonGuardare(uscita)) {
    return {
      verdetto: "cieco",
      perche: "il test ha dichiarato di non poter guardare (gli manca lo strumento): esce zero perché si è tirato indietro, non perché col fix rotto va tutto bene",
    };
  }
  if (status !== 0) return { verdetto: "ok", perche: "" };
  return { verdetto: "vacua", perche: "il test resta VERDE col fix rotto" };
}

function main() {
  // PRIMA di tutto: la corsa precedente è arrivata in fondo? (AR-708) — e prima anche del controllo
  // sui mutanti, perché un file lasciato rotto va rimesso a posto anche quando questa corsa non ha
  // niente da misurare: il debito di ieri non aspetta che oggi ci sia lavoro.
  const ripresa = riprendiDaTraccia(IO_VERO);
  if (ripresa) {
    const segno = ripresa.esito === "rimesso" ? "⚠️ " : ripresa.esito === "gia-a-posto" ? "ℹ️ " : "⛔";
    console.error(`${segno} ${ripresa.motivo}`);
  }

  if (!existsSync(MUTANTI)) {
    console.error("non-vacuita: cervello/mutanti.json assente → non posso misurare");
    process.exit(2);
  }
  let elenco;
  try {
    elenco = JSON.parse(readFileSync(MUTANTI, "utf8")).mutanti || [];
  } catch (e) {
    console.error(`non-vacuita: mutanti.json illeggibile (${e.message}) → non posso misurare`);
    process.exit(2);
  }
  if (LOTTO) elenco = elenco.filter((m) => String(m.lotto) === LOTTO);
  elenco = filtraPerDifetti(elenco, DIFETTI);
  if (!elenco.length) {
    const quale = LOTTO ? ` per il lotto ${LOTTO}` : DIFETTI ? ` per ${DIFETTI.join(", ")}` : "";
    console.error(`non-vacuita: nessuna mutazione${quale} → non posso misurare`);
    process.exit(2);
  }

  const esiti = [];
  for (const m of elenco) {
    const file = viaDi(m.file);
    if (!existsSync(file)) {
      esiti.push({ ...m, verdetto: "cieco", perche: `file assente: ${m.file}` });
      continue;
    }
    const originale = readFileSync(file, "utf8");
    const rotto = muta(originale, m.cerca, m.sostituisci);
    if (rotto === null) {
      // Il pattern non c'è più: o il fix è stato riscritto, o questa mutazione punta al posto
      // sbagliato. In entrambi i casi non ho misurato niente — e dirlo «verde» sarebbe la bugia
      // esatta che questo strumento esiste per impedire.
      esiti.push({
        ...m,
        verdetto: "cieco",
        // AR-699 — chi legge questa riga ha già consegnato. Il momento in cui riagganciare costa
        // trenta secondi è subito dopo la riscrittura, e la domanda si fa con un comando:
        perche: "il pezzo da rompere non esiste più: mutazione da aggiornare (chiedilo prima con `node cervello/mutazioni-orfane.mjs`)",
      });
      continue;
    }
    try {
      IN_CORSO.stato = { file, originale };
      // Il foglietto va scritto PRIMA della mutazione, non dopo: fra le due righe c'è la finestra in
      // cui il file è rotto e nessuno sa che lo è. Scriverlo dopo lascerebbe scoperta esattamente la
      // porzione di tempo che questa difesa esiste per coprire.
      lasciaTraccia(IN_CORSO.stato, IO_VERO.scrivi);
      writeFileSync(file, rotto);
      const r = spawnSync("node", [m.test], { cwd: AD_ROOT, encoding: "utf8", timeout: TEMPO_MAX });
      esiti.push({
        ...m,
        ...verdettoCorsa({ status: r.status, signal: r.signal, uscita: `${r.stdout || ""}${r.stderr || ""}` }),
      });
    } finally {
      writeFileSync(file, originale); // sempre, anche se il test esplode
      togliTracciaDicendolo(IO_VERO.cancella); // il file è a posto: la traccia non serve più
      IN_CORSO.stato = null;
    }
  }

  const vacue = esiti.filter((e) => e.verdetto === "vacua");
  const ciechi = esiti.filter((e) => e.verdetto === "cieco");

  if (JSON_MODE) {
    console.log(JSON.stringify({ ok: vacue.length === 0, esiti }, null, 2));
  } else {
    console.log("🧨 LA PROVA CHE LE PROVE PROVINO\n");
    for (const e of esiti) {
      // ⚪ e non ⚠️, e non è cosmetica: il cancello del lotto sceglie quali righe mostrare cercando
      // i simboli di casa (`righeMotivo`), e ⚠️ non è uno di quelli. Risultato misurato in CI il
      // 15/8: il cancello ha stampato due mutazioni RIUSCITE — passate solo perché il loro titolo
      // cita il carattere ⚪ — e ha nascosto l'unica che non aveva misurato, lasciando in fondo un
      // «1 controllo non ha potuto misurare» senza dire quale. Un ⚪ che non si può nominare non è
      // dichiarato: è sparito con una nota a piè di pagina.
      const segno = e.verdetto === "ok" ? "✅" : e.verdetto === "vacua" ? "❌" : "⚪";
      // Dal 30/7 una mutazione può appartenere a un DIFETTO (rompi il fix, il test deve diventare
      // rosso) oppure a una LEZIONE (rimetti l'errore, il gate deve scattare). Senza questa riga la
      // seconda specie si stampava «undefined —», che è il modo più veloce per far sembrare rotto
      // un pezzo che funziona.
      // I due punti in fondo e il puntino davanti al motivo NON sono decorazione: sono la regola con
      // cui `righeMotivo` del cancello capisce che la riga sotto appartiene a quella sopra. Senza,
      // in CI arriva il nome del problema e non il perché — e chi legge deve rilanciare tutto per
      // sapere cosa è successo.
      console.log(`  ${segno} ${e.difetto || e.lezione || "(senza padrone)"} — ${e.nome}${e.perche ? ":" : ""}`);
      if (e.perche) console.log(`     · ${e.perche}`);
    }
    console.log("");
    const misurate = esiti.length - ciechi.length;
    console.log(
      vacue.length
        ? `⛔ ${vacue.length} prova/e NON dimostra il suo fix: rompendolo il test resta verde.`
        : // «tutte e 0 le mutazioni rendono rosso il loro test» è la stessa bugia in piccolo: un ✅
          // per un conto vuoto. Se non ho misurato niente, la riga verde non ci va.
          misurate
          ? `✅ tutte e ${misurate} le mutazioni rendono rosso il loro test.`
          : `⚪ nessuna mutazione è stata misurata: non ho niente da dire su queste prove.`,
    );
    if (ciechi.length) console.log(`⚪ ${ciechi.length} mutazione/i non ha potuto misurare (vedi sopra).`);
  }

  if (vacue.length) process.exit(1);
  if (ciechi.length) process.exit(2);
  process.exit(0);
}

if (process.argv[1] && process.argv[1].endsWith("non-vacuita.mjs")) main();
