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

import { existsSync, readFileSync, writeFileSync, rmSync, readdirSync, realpathSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { AD_ROOT } from "./git-github.mjs";
import { leggiSalto } from "./ambiente-prova.mjs";
import { muta } from "./mutazione-vagante.mjs";
import { comeSiEsegue, avvioFallito } from "./esecuzione-prova.mjs";
// La regola del «quanto tempo mi resta» ha UNA casa sola: quella dove è nata (AR-908) e dove una
// prova la interroga. Riscriverla qui sarebbe la malattia delle due case, dentro il file che
// esiste per scoprirla.
import { quantoPosso } from "./due-case.mjs";

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

// ⚠️ UN FOGLIETTO PER CORSA, NON UNO PER REPO — AR-837, misurato il 26/8/2026.
//
// Il foglietto era UNO SOLO, a nome fisso, e da lì nasceva un guasto che ha fatto accusare una
// prova innocente. `cervello/test/mutazioni-provate-dal-cancello.test.mjs` lancia QUESTO strumento
// come sottoprocesso per provarlo su un banco finto. Il figlio parte, legge il foglietto che il
// padre ha appena lasciato — «cancello-lotto.mjs era così» — crede che sia il resto di una corsa
// morta a metà, e RIMETTE A POSTO il file mentre il padre lo sta tenendo rotto apposta. Il padre
// misura un fix che in quel momento non è più rotto, vede il test verde e scrive «⛔ la prova non
// dimostra il suo fix». Falso, e a carico di una prova che funziona benissimo: provata a mano,
// col fix rotto diventa rossa. Cronometrato: il file cambiava di mano in 124 millisecondi in
// mezzo alla corsa.
//
// La cura è in due pezzi che servono tutt'e due:
//   ① il nome del foglietto porta il pid di chi l'ha scritto, così due corse non si sovrascrivono;
//   ② all'avvio si guarda ogni foglietto trovato, e quello di un processo ANCORA VIVO non si tocca:
//      non è il resto di una corsa morta, è il lavoro di qualcuno che sta ancora misurando.
// Senza ②, il ① non basta: si troverebbe comunque il foglietto del padre e lo si «riprenderebbe».
export const PREFISSO_FOGLIETTO = "_tmp_non-vacuita-in-corso";
export const FOGLIETTO = process.env.NON_VACUITA_FOGLIETTO || join(AD_ROOT, `${PREFISSO_FOGLIETTO}-${process.pid}.json`);

/**
 * Quel processo è ancora vivo? `kill(pid, 0)` non ammazza niente: chiede soltanto.
 * `EPERM` vuol dire «esiste, ma non è mio»: esiste, ed è l'unica cosa che qui conta.
 */
export function processoVivo(pid, uccidi = (p, s) => process.kill(p, s)) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    uccidi(pid, 0);
    return true;
  } catch (e) {
    return e?.code === "EPERM";
  }
}

/** I foglietti presenti in una cartella, in ordine: quelli di tutte le corse, non solo la mia. */
export function foglietti(nomi = [], cartella = AD_ROOT) {
  return nomi.filter((n) => String(n).startsWith(PREFISSO_FOGLIETTO) && String(n).endsWith(".json")).sort().map((n) => join(cartella, n));
}

/** Lascia la traccia PRIMA di rompere. `scrivi` iniettato: il test la esercita senza toccare il repo. */
export function lasciaTraccia(stato, scrivi, via = FOGLIETTO) {
  if (!stato || !stato.file) return null;
  scrivi(via, `${JSON.stringify({ file: stato.file, originale: stato.originale, quando: new Date().toISOString(), pid: process.pid }, null, 1)}\n`);
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
export function riprendiDaTraccia({ ceE, leggi, scrivi, cancella, vivo = processoVivo }, via = FOGLIETTO) {
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
  // AR-837 — il foglietto di una corsa ANCORA VIVA non è il resto di un incidente: è il segnalibro
  // di chi sta misurando adesso. Rimettere «a posto» quel file gli toglie di sotto la mutazione a
  // metà misura, e il suo referto accusa una prova sana. Si lascia stare, e lo si dice.
  if (nota.pid !== process.pid && vivo(nota.pid)) {
    return {
      esito: "in-corso-altrove",
      file: nota.file,
      motivo: `${nota.file} è in mano alla corsa ${nota.pid}, che è ancora viva: non lo tocco (AR-837)`,
    };
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

/**
 * IL BUDGET DI TUTTA LA CORSA — AR-917, e lo schema è quello che regge già in `due-case.mjs`.
 *
 * IL CASO CHE HA ROTTO, corsa 33807469256 del 3/9: il cancello dà a questo banco 900 secondi e il
 * banco li ha spesi tutti senza finire — 900,4 s, ucciso dall'orologio, `exit 124`, cioè rosso.
 * Nella corsa prima, senza un orologio che mordesse, aveva girato 64 minuti e non era finito
 * comunque. Un rosso così non dice «una difesa non regge»: dice «non ho fatto in tempo», e sono
 * due cose diverse che il cancello leggeva come una sola.
 *
 * Col budget il banco si ferma DA SOLO un attimo prima e dichiara, una per una, le mutazioni che
 * non ha fatto in tempo a provare: diventano ⚪ (uscita 2, «non ho misurato»), che il cancello
 * distingue dal rosso. Il debito si legge invece di uccidere la corsa.
 *
 * Zero di default: chi lo lancia a mano non ha nessun orologio esterno da cui difendersi, solo la
 * propria pazienza. Lo passa il cancello, che il suo orologio ce l'ha.
 */
/**
 * Sotto questo tempo non vale la pena cominciarne un'altra: applicare e rilanciare costa.
 * Si può abbassare dall'ambiente per una ragione sola: una prova che vuole vedere il troncamento
 * (AR-918) senza restare ferma venti secondi ad aspettarlo.
 */
const MINIMO_PER_UNA = Number(process.env.NON_VACUITA_MINIMO_MS || 20_000);

const iBudget = process.argv.indexOf("--budget");
const BUDGET = Number(iBudget !== -1 ? process.argv[iBudget + 1] : process.env.NON_VACUITA_BUDGET_MS || 0);
const AVVIATO = Date.now();

/**
 * Le mutazioni che il budget non mi lascia provare, dichiarate una per una.
 *
 * Pura, così la prova la interroga da sola invece di dedurla da una corsa vera. `restanti` è ciò
 * che resta da fare quando il tempo è finito: non un numero, l'elenco — un ⚪ che dice «alcune» è
 * lo stesso silenzio con una parola davanti.
 */
export function fuoriDalBudget(restanti = [], { budget = 0, speso = 0 } = {}) {
  if (!budget || !restanti.length) return [];
  return restanti.map((m) => ({
    ...m,
    verdetto: "cieco",
    perche: `il budget di ${Math.round(budget / 1000)} s è finito dopo ${Math.round(speso / 1000)} s: questa mutazione non l'ho provata. Rilanciala da sola con \`node cervello/non-vacuita.mjs --difetti ${(m.difetto || "AR-?")}\`, o dammi più tempo con --budget.`,
  }));
}

/**
 * ⏱️ E LA MUTAZIONE CHE STAVA GIRANDO QUANDO IL BUDGET È FINITO — AR-918.
 *
 * IL BUCO CHE HA LASCIATO APERTO LA CURA DI IERI, corsa 33811579021: il budget guardava solo se una
 * mutazione poteva COMINCIARE, mai quanto poteva DURARE. Così l'ultima partiva legittimamente con
 * 30 secondi di budget residuo e poi si prendeva il suo tetto pieno da 420 — e il cancello, che di
 * secondi ne aveva 900 in tutto, la ammazzava a metà: `exit 124`, rosso, esattamente il rosso che
 * il budget esisteva per NON far succedere. Un budget che non entra nel tetto del singolo passo non
 * è un budget: è una speranza.
 *
 * La cura è una riga di aritmetica — a ogni mutazione si concede ciò che RESTA, non il tetto pieno
 * — più questa funzione, che serve a non barare sul referto. Una prova ammazzata dall'orologio esce
 * già ⚪ da `verdettoCorsa` (status null), ma con la frase sbagliata: «non è arrivata in fondo»
 * suona come un guaio della prova, mentre il guaio è stato il mio orologio. Chi legge deve poter
 * distinguere «questa prova è malata» da «a questa non ho dato abbastanza tempo», perché la prima
 * si ripara e la seconda si rilancia.
 *
 * Pura: prende il verdetto già formato e lo riscrive solo nel caso suo.
 *
 * 🔎 GUARDATA COL SUO STESSO SOSPETTO, il 4/9: può questa riga ammorbidire una scoperta? No, e si
 * legge nella prima condizione — tocca SOLO i `cieco`. Un rosso è `ok` («la mutazione l'hanno
 * beccata») e una prova vacua è `vacua`: nessuno dei due passa di qui, e comunque cambia solo la
 * frase, mai il verdetto. E la porta nuova dall'ambiente (`NON_VACUITA_MINIMO_MS`) può al massimo
 * spingere delle mutazioni nel ⚪, cioè nell'uscita 2, che in questa casa non è mai un verde.
 *
 * ⚠️ LA PROPRIETÀ CHE IL BUDGET SI PORTA DIETRO, e va detta invece di lasciarla scoprire: con un
 * budget addosso, se una mutazione viene misurata dipende anche da DOVE sta nell'elenco. Due corse
 * uguali possono coprire mutazioni diverse. È accettabile solo perché ciascuna non misurata viene
 * NOMINATA: un verde qui non vuol dire «tutte reggono», vuol dire «queste reggono e queste non le
 * ho guardate». Chi legge il referto deve leggere anche l'elenco dei ⚪.
 */
export function troncataDalBudget(esito = {}, { status, concesso = 0, tetto = TEMPO_MAX, difetto = "" } = {}) {
  const ammazzata = status === null || status === undefined;
  if (esito.verdetto !== "cieco" || !ammazzata || !concesso || concesso >= tetto) return esito;
  return {
    ...esito,
    perche: `il budget della corsa lasciava solo ${Math.round(concesso / 1000)} s a questa mutazione (il suo tetto è ${Math.round(tetto / 1000)} s) e non le sono bastati: NON l'ho misurata, non è la prova a essere rotta. Rilanciala da sola con \`node cervello/non-vacuita.mjs --difetti ${difetto || "AR-?"}\`.`,
  };
}

/** Il file da rompere. Assoluto se la mutazione lo dà assoluto (è così che il test usa una fixture). */
const viaDi = (f) => (isAbsolute(String(f)) ? String(f) : join(AD_ROOT, String(f)));

/**
 * 🔒 IL FILE DA ROMPERE STA DENTRO UNA RADICE AMMESSA? — AR-896.
 *
 * ⚠️ TROVATO DAL COLLAUDO DI SICUREZZA DEL 31/8, ed è la stessa porta di AR-889 un metro più in là.
 * Lì la difesa era stata messa sul campo `test`, quello che il banco ESEGUE. Ma il banco apre e
 * RISCRIVE anche il campo `file` — `writeFileSync(file, rotto)`, da root — e su quello non c'era
 * nessun controllo di radice: `viaDi` accettava qualunque percorso assoluto. Il collaudo ha lasciato
 * un testimone in un file fuori dal repo, di proprietà di qualcun altro, senza toccare il repo.
 *
 * La lezione, e vale oltre a questo file: quando si mette una guardia su un modo di raggiungere una
 * risorsa, si cercano TUTTI i modi. Eseguire e scrivere sono due porte sullo stesso cortile, e ne
 * avevo chiusa una sola dichiarando chiuso il cortile.
 *
 * La regola è la stessa di `eseguiProva`, di proposito: le radici ammesse sono il repo più la
 * cartella del registro che dichiara la mutazione — col registro vero è il repo e basta. Il
 * percorso si risolve con `realpathSync` perché un collegamento simbolico dentro il repo farebbe
 * lo stesso lavoro di un percorso assoluto; se non esiste ancora, si guarda la cartella che lo
 * conterrà, che è il posto dove il collegamento vivrebbe.
 *
 * Chi resta fuori NON è un errore da lanciare: è un ⚪. Non ho misurato quella mutazione, e ⚪ non è
 * mai un verde (AR-322).
 */
export function dentroLeRadici(via, radici, vero = realpathSync) {
  let reale;
  try {
    reale = vero(via);
  } catch {
    // Il file non c'è ancora: la domanda diventa «dove finirebbe?», cioè la sua cartella.
    try {
      reale = join(vero(dirname(via)), basename(via));
    } catch {
      return { dentro: false, perche: `non riesco a risolvere il percorso «${via}»: non lo tocco` };
    }
  }
  for (const r of radici) {
    let radiceReale = r;
    try {
      radiceReale = vero(r);
    } catch {
      /* una radice che non esiste non ammette niente */
    }
    if (reale === radiceReale || reale.startsWith(`${radiceReale}/`)) return { dentro: true, perche: "" };
  }
  return {
    dentro: false,
    perche: `il file da rompere sta fuori da ogni radice ammessa (${reale}): il banco non scrive fuori dal repo e fuori dalla cartella del registro`,
  };
}

// `muta` vive in ./mutazione-vagante.mjs (AR-757): il gancio del commit deve poterla usare senza
// importare QUESTO file, che all'import accende i gestori di segnale. Qui si ri-esporta, cosi' chi
// la cercava dove e' sempre stata la trova ancora — ma la casa e' una sola.
export { muta };

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
export function verdettoCorsa({ status, signal = null, uscita = "", avvio = null } = {}) {
  // AR-840 — PRIMA di leggere il numero d'uscita: la corsa è mai partita? Un file di prova che non
  // esiste, un programma non installato, un pacchetto mancante escono ≠ 0 — cioè esattamente il
  // segnale con cui qui si riconosce «la prova è diventata rossa». Erano indistinguibili, e per
  // questo metà delle mutazioni risultavano verificate senza esserlo. Un avvio fallito è ⚪.
  if (avvio) return { verdetto: "cieco", perche: avvio };
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

/**
 * 🏃 ESEGUI LA PROVA DI UNA MUTAZIONE — AR-840.
 *
 * Prima era una riga sola, `spawnSync("node", [m.test])`, che dava per scontato che ogni `test`
 * fosse un percorso .mjs. Adesso il COME lo decide `comeSiEsegue` (funzione pura, provabile), e qui
 * resta solo il mestiere di lanciare: nessuna shell, i passi di un `&&` in ordine, ci si ferma al
 * primo che fallisce.
 *
 * `lancia` è iniettato perché questa funzione si possa provare senza far partire processi veri: la
 * domanda da verificare è «con quali argomenti parte il comando?», e la risposta non ha bisogno del
 * disco. Torna la stessa forma che `verdettoCorsa` si aspetta, più `avvio`: il motivo per cui la
 * corsa non è mai partita, oppure null.
 */
/**
 * 🔒 L'ambiente che si dà a una prova: quello di adesso MENO tutto ciò che somiglia a una chiave.
 *
 * Trovato dalla radiografia di sicurezza del 28/8, ed è il moltiplicatore di ogni altra falla: qui
 * si esegue un comando che arriva da un FILE DI DATI (`cervello/mutanti.json`, 934 voci che nessuno
 * rilegge riga per riga, e il campo `test` lo compone un programma, non una persona). Finché il
 * figlio ereditava `process.env` intero, sul VPS ereditava anche Stripe, Supabase in scrittura,
 * Resend, Telegram e il token di git. Una prova non ha bisogno di nessuna di quelle chiavi: se un
 * giorno un comando ostile arriva fin qui, deve trovare le tasche vuote.
 */
/** Un nome che dichiara di contenere una credenziale. */
const NOME_DI_CHIAVE = /SECRET|KEY|TOKEN|PASSWORD|PASSWD|CREDENTIAL|_PWD|AUTH|DSN/i;

/** Una credenziale scritta DENTRO un valore: `postgres://utente:password@host/db`, `redis://:pw@…`.
 *  Non si vede dal nome — `DATABASE_URL` non contiene nessuna delle parole qui sopra.
 *
 * ⚠️ LA PRIMA STESURA CI METTEVA QUATTRO SECONDI SU UN VALORE DA 80 KB, e il tempo QUADRUPLICAVA
 * ogni volta che l'ingresso raddoppiava. MISURATO il 31/8, non ragionato: 4,9 ms a 2 KB · 257 ms a
 * 20 KB · 1,0 s a 40 KB · 4,2 s a 80 KB.
 *
 * Il motivo: `[^/@\s]*:` e `[^/@\s]+@` si SOVRAPPONGONO — i due punti li può mangiare tutti e due,
 * quindi su un valore pieno di due punti e senza chiocciola il motore prova ogni punto di taglio.
 * Ed è la peggiore delle amplificazioni: `ambientePulito()` è un parametro di default di
 * `eseguiProva`, quindi si rivaluta a OGNI mutazione — 970 volte per corsa. Il banco non finirebbe
 * più, e un banco che non finisce lascia il cancello cieco.
 *
 * Due cure, tutte e due necessarie:
 *   ① i due punti escono dalla prima classe (`[^/@\s:]`): niente sovrapposizione, niente
 *      backtracking. Resta corretta — nella parte «utente» di un URL i due punti SONO il
 *      separatore, quindi non ce ne possono stare; `redis://:pw@…` ha l'utente vuoto, ed è per
 *      questo che è `*` e non `+`;
 * LA SECONDA CURA CHE HO SCARTATO, e perché — un tetto alla lunghezza guardata (i primi 4 KB).
 * L'avevo scritta, poi il banco delle mutazioni mi ha fatto notare che non si poteva provare: col
 * tetto in piedi, rimettere l'espressione sbagliata non produce nessun rallentamento misurabile,
 * perché nessun valore arriva mai abbastanza lungo. Due difese di cui una copre l'altra si
 * mutano a vicenda in cose che nessuna prova può distinguere.
 *
 * E guardandola meglio non era gratis: un tetto vuol dire che una credenziale scritta OLTRE il
 * quattromilanovantaseiesimo carattere passerebbe al figlio. Cioè comprava un rischio teorico di
 * lentezza al prezzo di un buco vero, per giunta silenzioso. Con l'espressione sistemata un valore
 * da 400 KB costa un millisecondo e mezzo: il tetto non serviva a niente.
 *
 * Una difesa che si può provare batte due di cui una è indistinguibile.
 */
export const CHIAVE_DENTRO_UN_URL = /^[a-z][a-z0-9+.-]*:\/\/[^/@\s:]*:[^/@\s]+@/i;


/**
 * Nomi che nessuna parola-chiave prende, e che comandano comunque il processo figlio. AR-897.
 *
 * `NODE_OPTIONS` non contiene nessuna delle parole di `NOME_DI_CHIAVE`, e node le opzioni le legge
 * ANCHE dall'ambiente: `NODE_OPTIONS=--require /tmp/mio.cjs` esegue quel file PRIMA della prova
 * ammessa, scavalcando in un colpo tutta la lista bianca di `esecuzione-prova.mjs`. Misurato.
 *
 * Onestà sul peso, perché conta per capire quanto è grave: chi può scrivere `NODE_OPTIONS` nel
 * processo PADRE ha già l'esecuzione, quindi non è un varco nuovo. È difesa in profondità che
 * mancava — e il commento qui sopra promette «se un comando ostile arriva fin qui, deve trovare le
 * tasche vuote». Le tasche non lo erano.
 */
const COMANDA_IL_FIGLIO = /^(NODE_OPTIONS|NODE_REPL_EXTERNAL_MODULE|NODE_EXTRA_CA_CERTS|BASH_ENV|ENV|LD_PRELOAD|LD_LIBRARY_PATH|PYTHONSTARTUP|npm_config_registry|npm_config_.*script.*|BASH_FUNC_.*)$/i;

/**
 * Le variabili che arrivano in GRUPPO, dove togliere un pezzo rompe tutto il resto.
 *
 * ⚠️ TROVATA IL 31/8 DAL COLLAUDO DI SICUREZZA, e riprodotta a mano prima di toccare niente.
 * `GIT_CONFIG_KEY_0` contiene la parola «KEY», quindi la lista nera qui sotto lo toglieva — e
 * lasciava `GIT_CONFIG_COUNT=3` e i tre `GIT_CONFIG_VALUE_n`. Git riceve una terna incoerente e
 * MUORE prima di fare qualsiasi cosa: `error: missing config key GIT_CONFIG_KEY_0`, uscita 128.
 *
 * Perché non è un fastidio ma la malattia peggiore della casa: `verdettoCorsa` legge ogni uscita
 * diversa da zero come «la prova è diventata rossa per colpa della mutazione», cioè ✅ verificata.
 * Una prova che non è mai partita comprava un verde. È AR-840 rinato DENTRO la cura di AR-840, e
 * 395 delle 970 mutazioni hanno una prova che tocca git: quasi due su cinque.
 *
 * La lezione, che vale oltre a git: una lista nera di NOMI sa cosa un nome dichiara, non sa che
 * certe variabili si tengono per mano. Il rimedio non è un'eccezione per git — sarebbe la stessa
 * distrazione al prossimo gruppo — ma la regola: se cade un membro, cade tutto il gruppo. Il figlio
 * parte senza quella configurazione, che è pulito; non parte a metà, che è una bugia.
 *
 * NON tengo i membri superstiti: `GIT_CONFIG_VALUE_n` può portare una credenziale nel valore (qui
 * no — sono riscritture di URL — ma sul VPS non l'ho guardato, e questa funzione esiste proprio
 * perché il figlio trovi le tasche vuote).
 */
const GRUPPI_INSCINDIBILI = [/^GIT_CONFIG_(KEY|VALUE)_\d+$|^GIT_CONFIG_COUNT$/];

/** I nomi che cadono insieme a `caduti`, perché stanno nello stesso gruppo inscindibile. */
export function trascinatiDalGruppo(caduti, tutti) {
  const trascinati = new Set();
  for (const gruppo of GRUPPI_INSCINDIBILI) {
    if (!caduti.some((k) => gruppo.test(k))) continue;
    for (const k of tutti) if (gruppo.test(k)) trascinati.add(k);
  }
  return trascinati;
}

export function ambientePulito(env = process.env) {
  const pulito = {};
  const caduti = [];
  const nomi = Object.keys(env);
  for (const [k, v] of Object.entries(env)) {
    // ① per NOME — la difesa del 28/8.
    if (NOME_DI_CHIAVE.test(k)) { caduti.push(k); continue; }
    // ② per VALORE — il buco che il collaudo di sicurezza ha misurato il 30/8: la difesa ① è una
    // lista nera di NOMI, e una lista nera di nomi non vede il segreto che sta nel valore. Sul VPS
    // passavano al figlio `DATABASE_URL`, `SUPABASE_DB_URL` e `REDIS_URI`, che portano la password
    // dentro l'URL. Questo secondo controllo guarda la FORMA del valore, quindi lascia passare gli
    // URL pubblici (`MARKETPLACE_SUPABASE_URL` non ha nessuna credenziale dentro) e toglie solo
    // quelli che una credenziale ce l'hanno davvero. Una prova non ha bisogno di nessuna delle due.
    if (typeof v === "string" && CHIAVE_DENTRO_UN_URL.test(v)) { caduti.push(k); continue; }
    // ③ per POTERE — vedi COMANDA_IL_FIGLIO: non è una chiave, ma comanda chi la riceve.
    if (COMANDA_IL_FIGLIO.test(k)) { caduti.push(k); continue; }
    pulito[k] = v;
  }
  // ③ per GRUPPO — vedi sopra: chi resta di un gruppo mutilato se ne va con gli altri.
  for (const k of trascinatiDalGruppo(caduti, nomi)) delete pulito[k];
  return pulito;
}

/**
 * La radice in piu che il banco puo ammettere, e da dove viene.
 *
 * ⚠️ NON è «/tmp». È **la cartella del registro che dichiara quella prova**, e la differenza è
 * tutta la sicurezza di questo file. Col registro vero (`cervello/mutanti.json`) la radice è il
 * repo e basta: un percorso in /tmp non si esegue, ed è la falla del 31/8 che resta chiusa. Con un
 * registro FINTO — le prove di questo banco se ne costruiscono uno in una cartella temporanea e ci
 * mettono accanto le finte — la radice è quella cartella lì, e solo quella.
 *
 * La regola in una riga: una prova può vivere accanto al registro che la nomina. Non «ovunque sotto
 * /tmp», che era il difetto: bastava saper scrivere UN file in /tmp per farlo eseguire come root.
 *
 * Chi potrebbe abusarne dovrebbe poter scrivere `MUTANTI_FILE` nell'ambiente del processo — cioè
 * avere già i permessi che vorrebbe rubare.
 *
 * LE DUE ALTRE STRADE, considerate e scartate — perché una scelta senza le alternative accanto non
 * si può giudicare, e queste due sembravano più semplici:
 *
 *   ① «ogni prova che ha bisogno di /tmp lo DICHIARI, una per una». È stata la prima cura, ed è
 *      durata mezza giornata: ha rotto quattro prove del banco e me l'ha detto il server, non io.
 *      Il motivo per cui non regge è strutturale, non una svista: `mutazioni-senza-esecutore` COPIA
 *      il registro in un'altra cartella prima di passarlo al banco, quindi la prova che dovrebbe
 *      dichiarare la radice non sa nemmeno quale sarà. Una regola che chiede a ciascuno di
 *      dichiarare una cosa che nessuno di loro conosce non è una regola, è un rimando.
 *
 *   ② «la radice è `cwd`». Elegante — chi lancia ha già scelto dove — ma sbagliata proprio nel caso
 *      che conta: quelle quattro prove passano `cwd: AD_ROOT` e tengono le finte altrove. Avrebbe
 *      lasciato il buco chiuso e le prove rotte, cioè la peggiore delle tre.
 *
 * Questa strada le batte tutt'e due perché lega la radice a un FATTO che il banco ha già in mano —
 * dove vive il registro che sta leggendo — invece che a una dichiarazione o a una convenzione.
 */
function radiceDelRegistro(viaRegistro) {
  const fuori = [];
  for (const c of [viaRegistro, process.env.NON_VACUITA_RADICE].filter(Boolean)) {
    // `NON_VACUITA_RADICE` è una cartella, il registro è un file: `dirname` su una cartella
    // risalirebbe di un livello, quindi la si prende com'è.
    const cartella = c === process.env.NON_VACUITA_RADICE ? resolve(c) : dirname(resolve(c));
    if (cartella === AD_ROOT || cartella.startsWith(`${AD_ROOT}/`)) continue;
    if (!fuori.includes(cartella)) fuori.push(cartella);
  }
  return fuori;
}

export function eseguiProva(test, { lancia = spawnSync, cwd = AD_ROOT, timeout = TEMPO_MAX, env = ambientePulito(), radiciAmmesse = [AD_ROOT, ...radiceDelRegistro(MUTANTI)] } = {}) {
  // 🔒 RADICI DICHIARATE, non un interruttore che spegne tutto. Prima qui c'era
  // `soloDentroIlRepo: false`, che serviva per una ragione buona — le prove di questo stesso banco
  // si costruiscono una fixture in /tmp — ma spegneva anche «devi nominare un file di casa», ed è
  // da quella porta che passavano `node -e <codice>` e `npx --yes <pacchetto qualunque>`.
  // Con le radici la fixture continua a funzionare e le altre due strade restano chiuse.
  // ⚠️ 31/8 — LA RADICE `/tmp` NON STA PIÙ QUI DENTRO, e il perché è la cosa da leggere.
  //
  // Un collaudo indipendente ha eseguito codice suo COME ROOT con questa riga, che è la più corta
  // che esista — niente opzioni, niente trucchi:
  //     eseguiProva("/tmp/pwn.mjs")
  // Bastava che `tmpdir()` fosse fra le radici ammesse. Il 30/8 avevo chiuso otto strade e scritto
  // «otto su otto»: le otto erano quelle a cui avevo pensato io, e la più corta non era fra quelle.
  // È la forma di errore per cui il collaudo esiste — chi costruisce prova le strade che conosce.
  //
  // MISURATO prima di togliere: delle 962 voci di `mutanti.json`, **zero** usano un percorso
  // assoluto. Quella radice non difendeva nessun uso vero; c'era perché le prove del banco STESSO
  // si costruiscono una fixture in una cartella temporanea. Quelle continuano a funzionare: il
  // parametro `radiciAmmesse` esiste apposta, e adesso chi ne ha bisogno la DICHIARA invece di
  // ereditarla. Una radice ereditata la usa anche chi non sapeva di averla.
  const piano = comeSiEsegue(test, { soloDentroIlRepo: false, radiciAmmesse });
  if (!piano.ok) {
    // Non è «la prova è diventata rossa»: è che non so nemmeno come lanciarla. ⚪, mai ✅.
    return { status: 1, signal: null, uscita: "", avvio: `non so come eseguire questo test: ${piano.perche}` };
  }
  let ultimo = { status: 0, signal: null, uscita: "" };
  for (const passo of piano.passi) {
    const r = lancia(passo.comando, passo.argomenti, { cwd, encoding: "utf8", timeout, env });
    const uscita = `${r.stdout || ""}${r.stderr || ""}`;
    ultimo = { status: r.status, signal: r.signal ?? null, uscita };
    const avvio = avvioFallito({ errore: r.error || null, uscita, entrata: passo.percorsi[0] || passo.argomenti[0] || "" });
    if (avvio) return { ...ultimo, avvio: `${avvio} [${passo.comando} ${passo.argomenti.join(" ")}]` };
    // `&&`: il primo passo che fallisce è il verdetto, gli altri non si eseguono.
    if (r.status !== 0) return { ...ultimo, avvio: null };
  }
  return { ...ultimo, avvio: null };
}

/**
 * 🩹 QUANTI FILE TRACCIATI MANCANO DALL'ALBERO DI LAVORO, adesso. AR-900.
 *
 * ⚠️ PERCHÉ ESISTE, e non è un'ipotesi: il 31/8 una corsa di questo banco ha cancellato 956 file —
 * tutta la cartella `cervello/`. Non per un difetto del banco: per una PROVA. La prova di AR-899
 * faceva pulizia con `rmSync(dirname(fuoriRepo(...)), { recursive: true })`, cioè cancellava una
 * cartella il cui nome veniva dalla funzione sotto esame. È esattamente ciò che il banco fa di
 * mestiere: ROMPE quella funzione. Rotta, tornava un percorso dentro il repo, e la pulizia ha
 * portato via il repo.
 *
 * Quello che ho visto io in quel momento è stato un `ENOENT` con lo stack: nessuna riga diceva che
 * mancavano novecentocinquantasei file. Questo censimento esiste perché la prossima volta la
 * PRIMA riga lo dica.
 *
 * LA REGOLA CHE NE ESCE, e vale per ogni prova di questa casa: **non si cancella mai una cartella
 * il cui nome viene dal codice che si sta provando.** Sotto un banco che rompe apposta, un percorso
 * calcolato dal codice sotto esame è un percorso ostile. Misurato sulle 441 prove di oggi: nessuna
 * lo fa più. Questo guardiano non cerca quel pezzo di codice — cerca il DANNO, che è la sola cosa
 * che si vede anche quando la forma è nuova.
 *
 * Torna `null` se non ho potuto contare (niente git, niente repo): ⚪, non un via libera.
 */
export function fileCancellati(lancia = spawnSync, cwd = AD_ROOT) {
  const r = lancia("git", ["status", "--porcelain", "--"], { cwd, encoding: "utf8", timeout: 30_000 });
  if (r.error || r.status !== 0) return null;
  return `${r.stdout || ""}`
    .split("\n")
    .filter((riga) => /^ ?D /.test(riga))
    .map((riga) => riga.slice(3).trim());
}

function main() {
  // PRIMA di tutto: la corsa precedente è arrivata in fondo? (AR-708) — e prima anche del controllo
  // sui mutanti, perché un file lasciato rotto va rimesso a posto anche quando questa corsa non ha
  // niente da misurare: il debito di ieri non aspetta che oggi ci sia lavoro.
  // AR-837 — si guardano TUTTI i foglietti, non solo quello col mio nome: il resto di una corsa
  // morta porta il pid di QUELLA corsa, non il mio, e cercandone uno solo non lo si troverebbe mai.
  let vie = [FOGLIETTO];
  try {
    vie = [...new Set([...foglietti(readdirSync(AD_ROOT)), FOGLIETTO])];
  } catch {
    // La cartella non si legge: resta il mio, che è meglio di niente e non finge di essere tutto.
  }
  for (const via of vie) {
    const ripresa = riprendiDaTraccia(IO_VERO, via);
    if (!ripresa) continue;
    const segno = ripresa.esito === "rimesso" ? "⚠️ " : ripresa.esito === "gia-a-posto" || ripresa.esito === "in-corso-altrove" ? "ℹ️ " : "⛔";
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

  // AR-900: com'era l'albero PRIMA. Se dopo mancano dei file che prima c'erano, l'ha fatto una
  // prova mentre girava — e va detto in chiaro, non lasciato scoprire da uno stack trace.
  const cancellatiPrima = fileCancellati();

  const esiti = [];
  for (const [i, m] of elenco.entries()) {
    // AR-917 — il tempo si guarda PRIMA di spendere, non dopo: un controllo dietro la spesa
    // arriva quando la spesa è già fatta. Chi resta fuori viene dichiarato, non lasciato al buio.
    // AR-918 — e `quantoPosso` non torna un sì/no: torna QUANTO. Quel numero è il tetto di QUESTA
    // mutazione, altrimenti l'ultima sfonda il budget di tutta la corsa e la fa ammazzare rossa.
    const concesso = BUDGET ? quantoPosso(AVVIATO + BUDGET, Date.now(), TEMPO_MAX, MINIMO_PER_UNA) : TEMPO_MAX;
    if (!concesso) {
      esiti.push(...fuoriDalBudget(elenco.slice(i), { budget: BUDGET, speso: Date.now() - AVVIATO }));
      break;
    }
    const file = viaDi(m.file);
    // AR-896 — prima di aprire e riscrivere: sta dentro una radice ammessa? Fuori è ⚪, mai ✅.
    const radice = dentroLeRadici(file, [AD_ROOT, ...radiceDelRegistro(MUTANTI)]);
    if (!radice.dentro) {
      esiti.push({ ...m, verdetto: "cieco", perche: radice.perche });
      continue;
    }
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
      const r = eseguiProva(m.test, { timeout: concesso });
      esiti.push({ ...m, ...troncataDalBudget(verdettoCorsa(r), { status: r.status, concesso, difetto: m.difetto }) });
    } finally {
      writeFileSync(file, originale); // sempre, anche se il test esplode
      togliTracciaDicendolo(IO_VERO.cancella); // il file è a posto: la traccia non serve più
      IN_CORSO.stato = null;
    }
  }

  // AR-900 — il danno collaterale, prima di qualunque verdetto: un banco che ha portato via dei
  // file non ha «misurato con qualche effetto collaterale», ha rotto la casa in cui misurava.
  const cancellatiDopo = fileCancellati();
  const nuoviCancellati =
    cancellatiPrima === null || cancellatiDopo === null
      ? null
      : cancellatiDopo.filter((f) => !cancellatiPrima.includes(f));
  if (nuoviCancellati === null) {
    console.error("⚪ non ho potuto contare i file dell'albero di lavoro (git non risponde): se una prova ne ha cancellati, questa corsa non se n'è accorta.");
  } else if (nuoviCancellati.length) {
    console.error(`\n⛔ QUESTA CORSA HA CANCELLATO ${nuoviCancellati.length} FILE CHE PRIMA C'ERANO.`);
    console.error("   Non è stato il banco: è stata una PROVA, mentre girava col fix rotto. Una prova non");
    console.error("   deve mai cancellare una cartella il cui nome viene dal codice che sta provando.");
    for (const f of nuoviCancellati.slice(0, 10)) console.error(`   · ${f}`);
    if (nuoviCancellati.length > 10) console.error(`   · …e altri ${nuoviCancellati.length - 10}`);
    console.error(`\n   Per rimetterli: git restore ${[...new Set(nuoviCancellati.map((f) => f.split("/")[0]))].join(" ")}\n`);
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
