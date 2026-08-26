#!/usr/bin/env node
// 🧪 GUARDIANO DEI TEST DEL CERVELLO. 🟢 Sola lettura: esegue test, non tocca niente.
//
// IL DIFETTO CHE CHIUDE, e perché è imbarazzante. Il 25/7 ho costruito `test-pannello.mjs` per
// scoprire i test che nessuno lanciava: ne trovò cinque, e uno non partiva nemmeno. Poi ho
// controllato dove gira quel guardiano. **Da nessuna parte.** Né nel giro, né in CI. E con lui
// nemmeno i 79 test di `cervello/test/`: esistono solo quando qualcuno li digita a mano.
//
// Cioè: ho costruito la rete per i test che nessuno esegue, e l'ho lasciata nella stessa
// condizione. Un test che non gira non è una rete, è un file — vale per i test e vale per il
// guardiano dei test.
//
// Questo è il gemello di test-pannello.mjs per `cervello/test/`, e serve a essere AGGANCIATO al
// giro (vedi giro.sh). Li SCOPRE dalla cartella invece di tenerne un elenco: un elenco si
// dimentica di aggiornare e un test nuovo resterebbe fuori senza che nessuno se ne accorga — che
// è esattamente il male che stiamo curando.
//
// Perché questo può essere un VINCOLO HARD nel giro mentre quello del Pannello no: qui sono test
// puri di Node su moduli `.mjs` — niente rete, niente DB, niente compilatore TypeScript. Se
// diventano rossi, sono rossi davvero, e il giro deve fermarsi. I test del Pannello invece
// dipendono dal type-stripping di Node (≥22.18), che da qui non posso verificare sul VPS: lì
// resta informativo finché non lo si è visto passare sulla macchina vera.
//
// Uso:
//   node cervello/test-cervello.mjs           -> report
//   node cervello/test-cervello.mjs --json    -> JSON
//   node cervello/test-cervello.mjs --seriale -> uno alla volta (per isolare un test che disturba)
//   node cervello/test-cervello.mjs --solo x  -> solo i file il cui nome contiene «x»
// Exit: 0 = tutti girano e passano · 1 = almeno uno rotto o ineseguibile
//
// AR-660 — E LE PROVE SCRITTE IN BATS, CHE NON ESEGUIVA NESSUNO. Ventisei file `.bats` vivevano in
// questa cartella senza che una riga di codice li lanciasse: non questo runner (raccoglieva per
// estensione `.test.mjs`), non la CI, non il giro. Erano nati da lotti che avevano bisogno di
// provare la shell — worker, watch-main, motore-ai — e il collegamento fra «ho scritto la prova» e
// «qualcuno la fa girare» è rimasto implicito. Due file di questa cartella lo dicono a chiare
// lettere in cima a sé stessi («i .bats non li lancia nessun processo ricorrente»): la casa lo
// SAPEVA e nessun numero lo misurava, che è la definizione di un buco che cresce.
//
// Da qui in poi i `.bats` li esegue questo runner, se sul computer c'è `bats`. Se non c'è, escono
// come ⚪ NON ESEGUITI — dichiarati uno per uno, mai contati come verdi — e l'uscita del comando NON
// cambia: `bats` assente è un ambiente incompleto, non un test rotto, e far diventare rossa la CI
// (o il vincolo hard del giro) su una dipendenza mancante è il modo in cui un cancello si impara a
// saltare. Il numero delle prove senza esecutore lo sorveglia `cervello/prove-non-eseguite.mjs`,
// che chiede a QUESTO file quali famiglie dice di eseguire: così il guardiano e il runner non
// possono divergere in silenzio.

import { existsSync, readdirSync, readFileSync, mkdtempSync, rmSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { cpus, tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { verdettoCecita } from "./cecita-curabile.mjs";

/** La chiave con cui «manca un pacchetto del Pannello» è registrata fra le cecità curabili. */
export const CHIAVE_PANNELLO = "dipendenze-del-pannello";

/**
 * Quel pacchetto è una dipendenza dichiarata del Pannello? Si legge dal suo package.json, non da un
 * elenco scritto qui: un elenco a mano resterebbe indietro alla prima dipendenza nuova.
 */
export function dipendenzaDelPannello(nome, leggi = null) {
  const radice = String(nome || "").split("/").slice(0, String(nome).startsWith("@") ? 2 : 1).join("/");
  if (!radice) return false;
  let p;
  try {
    p = JSON.parse(leggi ? leggi() : readFileSync(join(AD_ROOT, "pannello/package.json"), "utf8"));
  } catch {
    // ⚪ TRE VALORI, NON DUE — malattia `fonte-troncata-letta-per-intera`.
    // Un `return false` qui direbbe «non è del Pannello» a partire da una fonte che non ho letto:
    // stessa faccia di un verdetto vero, e chi legge non saprebbe che la domanda è rimasta senza
    // risposta. `null` = non lo so, e chi chiama lo dice invece di dedurre.
    return null;
  }
  return Boolean(p?.dependencies?.[radice] || p?.devDependencies?.[radice]);
}

/** La chiave con cui «manca bats» è registrata fra le cecità curabili. */
export const CHIAVE_BATS = "prove-bash-senza-esecutore";
// 📏 Il contratto della prova, in un posto solo (contratto-prova.mjs). Qui si CHIAMA, non si
// riscrive: le due domande che questo banco è l'unico a poter fare — «questo caso può fallire?» e
// «questo rosso è la prova di una scheda dichiarata chiusa?» — hanno una risposta sola per tutti.
import { canaleAllargato, casiSpenti, chiusureDaRiverificare } from "./contratto-prova.mjs";
import { fileDelComando } from "./cancello-lotto.mjs";
import { spazza } from "./spazza-temporanei.mjs";
import { cecitaDaAmbiente, leggiSalto } from "./ambiente-prova.mjs";

const JSON_MODE = process.argv.includes("--json");
const SERIALE = process.argv.includes("--seriale");
const SOLO = (() => {
  const i = process.argv.indexOf("--solo");
  return i >= 0 ? process.argv[i + 1] : null;
})();
// La cartella delle prove si può PUNTARE ALTROVE, e non è una comodità: è l'unico modo di provare
// questo banco senza aggiungere al repo una prova rotta apposta. Un banco che si può misurare solo
// sul contenuto vero di casa è un banco che nessuno misura — la forma di difetto che questa cartella
// passa il tempo a curare. Il risolutore di TypeScript resta ancorato alla cartella vera: è roba
// del repo, non della fixture.
const CARTELLA = process.env.TEST_CERVELLO_DIR || "cervello/test";
/** Quante volte questo banco è già stato lanciato da dentro sé stesso. Zero = lancio in cima. */
// Il tetto di tempo per UNA prova (vedi `verdettoPiantato`). Regolabile perché una macchina lenta
// non deve diventare un falso rosso, ma un valore c'è sempre: senza, una prova piantata si porta via
// la suite intera e nessuno sa quale sia stata.
//
// Il numero non è a caso, e nemmeno preso alla larga.
//
// LA MISURA CHE HO: il 21/8, cronometrate una per una su questa macchina, la prova più lenta che
// serve davvero è `c2-schermo` (il Pannello guidato dal browser) con 66s, la seconda
// `misura-firmata` con 34s.
//
// LA MISURA CHE NON HO, e per cui il numero è largo: quei 66s sono con il Pannello già compilato.
// A freddo — su un runner di CI, o sul VPS dopo un allineamento — Next ricompila la pagina al primo
// caricamento, e quanto ci metta lì non l'ho misurato: sulla PR #801 il flusso col browser non è
// partito, quindi il tetto non è mai stato provato a freddo. Un tetto tarato su una misura calda
// ucciderebbe una prova che sta solo lavorando, e un falso rosso nel banco si impara a ignorare —
// che è il modo in cui si perde la rete di sicurezza intera.
//
// Il numero non si sceglie a occhio: sta fra due limiti che si toccano quasi.
//   · da sotto — almeno quattro volte la più lenta misurata (66s), cioè ≥ 264s, o è una fabbrica
//     di falsi rossi il giorno che il Pannello parte a freddo;
//   · da sopra — una prova piantata PIÙ la suite tipica (307s) deve stare sotto il tetto che la
//     visita concede al banco (600s), cioè ≤ 293s. Se scatta prima il tetto di fuori, si torna al
//     «oltre 300s» che non dice QUALE prova: esattamente il difetto che questo tetto chiude.
// Fra 264s e 293s la scelta è 280s: 4,24 volte la più lenta, e 587s in tutto nel caso peggiore.
// Chi ha una macchina più lenta lo alza da fuori senza toccare il codice.
const TETTO_PROVA_MS = Number(process.env.MYCITY_TEST_TETTO_MS || 280_000);
// Quanto si aspetta fra il «per favore chiudi» e il colpo di grazia: il tempo che serve a una prova
// per spegnere quello che ha acceso (un browser, un server del Pannello). Vedi il commento nel kill.
const RESPIRO_MS = Number(process.env.MYCITY_TEST_RESPIRO_MS || 5_000);
const PROFONDITA = Number(process.env.MYCITY_BANCO_PROFONDITA || 0);
/** Un livello di annidamento serve (una prova che misura il banco). Due non serve a nessuno. */
const PROFONDITA_MASSIMA = 1;
const HOOK_TS = join(AD_ROOT, "cervello/test", "hook-ts.mjs");

/**
 * 🏖️ LA SABBIERA DI QUESTA CORSA — ogni prova scrive i suoi temporanei QUI DENTRO, e questa cartella
 * muore alla fine del giro.
 *
 * Perché non basta spazzare. Trentadue prove creano una cartella con `mkdtempSync` e non la
 * cancellano mai. La prima cura (una spazzata all'avvio, roba ferma da oltre un giorno) sembrava
 * sufficiente e NON lo era: misurata sul server il 21/8 alle 12:00, /tmp era di nuovo al 100% otto
 * ore dopo essere stato svuotato. Il motivo, col senno del comando: **la spazzatura nasce più in
 * fretta di quanto invecchia.** Ogni giro lascia una trentina di cartelle nuove; la soglia di un
 * giorno non le tocca mai, e nel frattempo il disco si riempie. Rincorrere non funziona.
 *
 * Questa è la cura alla radice, e non chiede niente alle prove: cambiando `TMPDIR` per i processi
 * figli, `os.tmpdir()` dentro OGNI prova punta qui. Che il test pulisca o no diventa irrilevante —
 * quando il giro finisce sparisce tutto insieme. Vale anche per le prove che verranno scritte
 * domani, che è la parte che una correzione a mano dei trentadue file non avrebbe dato.
 */
const SABBIERA = mkdtempSync(join(tmpdir(), "mycity-banco-"));

/** Butta la sabbiera. Idempotente: la chiamo alla fine e su ogni via d'uscita del processo. */
function sgomberaSabbiera() {
  try {
    rmSync(SABBIERA, { recursive: true, force: true });
  } catch {
    /* se non ci riesco resta lì: la spazzata all'avvio la prende come orfana, ed è il suo mestiere */
  }
}
for (const segnale of ["exit", "SIGINT", "SIGTERM"]) {
  process.on(segnale, sgomberaSabbiera);
}
// Ogni file gira già nel suo processo: le corsie sono quanti processi tenere accesi insieme.
const CORSIE = SERIALE ? 1 : Math.max(2, Math.min(8, cpus().length));

/**
 * Trova i test del cervello. Pura sulla lettura della cartella: il test la prova con una finta.
 *
 * I file che iniziano con `_` NON sono test: sono roba di servizio, e la convenzione esiste già
 * nel repo (`.gitignore` ha `_tmp_*`). Il caso vero è del 13/8 sera: sul VPS era rimasto un
 * `_debug_ghost.test.mjs` — mai esistito in questo repo, lasciato lì da una sessione di debug —
 * e il runner lo raccoglieva come test. Risultato: «0 passati», la suite del cervello rossa sul
 * server, la visita della macchina rossa di conseguenza, e il Pannello che mostrava a Nicola un
 * guasto del cervello che il cervello non aveva. Un file che nessuno ha scritto per essere una
 * prova non deve poter bocciare tutte le prove.
 */
export function trovaTest(elenco = []) {
  return elenco.filter((f) => f.endsWith(".test.mjs") && !f.startsWith("_")).sort();
}

/**
 * Le famiglie di prove che QUESTO runner dichiara di eseguire (AR-660).
 *
 * Non è documentazione: è la risposta che `prove-non-eseguite.mjs` viene a chiedere qui per sapere
 * quali file della cartella hanno un esecutore e quali no. Tenuta in un posto solo, perché la
 * malattia da cui nasce è esattamente due elenchi che si allontanano — uno di prove scritte, uno di
 * prove eseguite — senza che nessuno misuri la distanza.
 *
 * Togliere `.bats` da qui non è un ritocco cosmetico: rimette i ventisei file fuori da ogni corsa e
 * il guardiano lo dice subito (exit 1). È la mutazione con cui questa difesa si prova.
 */
export const SUFFISSI_ESEGUITI = [".test.mjs", ".bats"];

/** Le prove in bash. Stessa convenzione dei `.test.mjs`: il prefisso `_` è roba di servizio. */
export function trovaBats(elenco = []) {
  return elenco.filter((f) => f.endsWith(".bats") && !f.startsWith("_")).sort();
}

/**
 * Il binario `bats` da usare, o `null` se su questa macchina non c'è.
 *
 * `BATS_BIN` è la porta d'ingresso: la CI ci mette il percorso di quello che ha installato, e la
 * prova di questo runner ci mette un finto che stampa TAP — l'unico modo di dimostrare che il
 * cablaggio (scoperta → esecuzione → verdetto → uscita) funziona su una macchina dove `bats` non
 * è installato, che è il caso di quasi ogni sessione.
 *
 * Il PATH si scorre a mano invece di chiedere a una shell: `command -v` dentro `bash -lc` carica il
 * profilo dell'utente, cioè fa dipendere un guardiano da com'è configurato il computer di chi lo
 * lancia. Qui la risposta dipende solo dal PATH che il processo ha davvero.
 */
export function binarioBats(env = process.env, ceE = existsSync) {
  if (env.BATS_BIN) return ceE(env.BATS_BIN) ? env.BATS_BIN : null;
  const locale = join(AD_ROOT, "node_modules/.bin/bats");
  if (ceE(locale)) return locale;
  for (const d of String(env.PATH || "").split(":")) {
    if (!d) continue;
    const p = join(d, "bats");
    try {
      if (ceE(p)) return p;
    } catch {
      /* una voce di PATH illeggibile non è un bats trovato */
    }
  }
  return null;
}

/**
 * Il TAP di `bats --tap`, che NON è quello di `node --test`.
 *
 * bats non stampa nessun `# pass N`: stampa il piano (`1..12`) e una riga per caso (`ok 3 nome`,
 * `not ok 4 nome`, senza il trattino che node ci mette). Passare la sua uscita a `leggiTap` darebbe
 * `{passati: null}` su ogni file, cioè «ineseguibile» su ventisei prove sane — un rosso inventato,
 * che è il modo peggiore di agganciare una famiglia nuova.
 *
 * Pura: la prova la esercita su uscite finte, comprese quelle che nessun bats ha ancora prodotto.
 */
export function leggiTapBats(out = "") {
  let passati = 0;
  let falliti = 0;
  let piano = false;
  let saltati = 0;
  for (const r of String(out).split("\n")) {
    const t = r.trimEnd();
    if (/^\d+\.\.\d+\s*$/.test(t.trim())) {
      piano = true;
      continue;
    }
    if (/^not ok\b/.test(t)) falliti++;
    // ⏭️ UN CASO SALTATO NON È UN CASO PASSATO — AR-652.
    //
    // bats stampa `ok 3 nome # skip <perché>` quando una prova dichiara di non poter girare (le
    // chiavi non ci sono, il servizio non risponde). Contarlo fra i `passati` fa uscire ✅ da un file
    // dove non è stato provato NIENTE: è la forma di verde bugiardo che questa casa passa il tempo a
    // togliere, e qui la produceva il metro stesso. Si contano a parte, e se sono TUTTI il file esce
    // ⚪, non verde.
    else if (/^ok\b.*#\s*skip\b/i.test(t)) saltati++;
    else if (/^ok\b/.test(t)) passati++;
  }
  if (!piano && !passati && !falliti && !saltati) return { passati: null, falliti: null, saltati: 0 };
  return { passati, falliti, saltati };
}

/** QUALE caso bats è caduto, col suo perché — l'equivalente di `righeRosse` per il TAP di bats. */
export function righeRosseBats(out = "", max = 8) {
  const righe = String(out).split("\n");
  const rosse = [];
  for (let i = 0; i < righe.length; i++) {
    const m = /^not ok\s+\d+\s+(.*)$/.exec(righe[i].trimEnd());
    if (!m) continue;
    let riga = m[1].trim();
    // bats mette il perché nelle righe di commento subito sotto (`# (in test file ...)`, `# ...`).
    for (let k = i + 1; k < righe.length && k <= i + 6; k++) {
      if (/^(not )?ok\b/.test(righe[k]) || /^\d+\.\.\d+/.test(righe[k])) break;
      const c = righe[k].replace(/^#\s?/, "").trim();
      if (c) {
        riga += ` → ${c}`;
        break;
      }
    }
    rosse.push(riga);
    if (rosse.length >= max) break;
  }
  return rosse;
}

/** Verdetto su un file `.bats`, con la stessa grammatica usata per i `.test.mjs`. */
export function verdettoBats(status, out) {
  const { passati, falliti, saltati = 0 } = leggiTapBats(out);
  if (passati === null) {
    return { esito: "ineseguibile", motivo: "nessun TAP da bats: il file non è nemmeno partito", passati, falliti, saltati };
  }
  // Tutti saltati e nessun fallito: la prova ha dichiarato di non poter girare qui. È un ⚪ — sta
  // fra le non misurate, con il perché — e non un ✅: nessuno l'ha fatta.
  if (!falliti && !passati && saltati) {
    return { esito: "non-eseguito", motivo: `${saltati} casi saltati: ${motivoDelloSkip(out) || "la prova ha dichiarato di non poter girare qui"}`, passati, falliti, saltati };
  }
  if (status === 0 && !falliti) return { esito: "ok", motivo: saltati ? `${saltati} casi saltati` : "", passati, falliti, saltati };
  return { esito: "rosso", motivo: `${falliti || "?"} casi falliti`, passati, falliti, saltati, rosse: righeRosseBats(out) };
}

/** Il perché del primo `# skip`, così il ⚪ non è muto. */
export function motivoDelloSkip(out = "") {
  for (const r of String(out).split("\n")) {
    const m = /^ok\b.*#\s*skip\s*(.*)$/i.exec(r.trimEnd());
    if (m) return m[1].trim();
  }
  return "";
}

/**
 * Legge il TAP di `node --test` e dice quanti sono passati e quanti falliti.
 *
 * ⚠️ Ci sono DUE conteggi nell'output, e per mesi si è letto quello sbagliato. `node --test` chiude
 * col proprio riassunto — `# pass 1`, dove 1 è **il file**, non le sue asserzioni — mentre i test di
 * questa casa stampano il proprio TAP a mano, che node ri-emette come commento con il cancelletto
 * protetto: `# \# pass 8`. La vecchia regex `^# pass (\d+)$` prendeva solo il primo e riportava 1 per
 * ognuno di questi file.
 *
 * Conseguenza misurata il 28/7: la suite dichiarava «276 asserzioni» con 39 file, cioè contava un
 * punto per file invece delle asserzioni vere. Non era un falso verde (un file rotto restava rosso),
 * ma era un numero che diceva una cosa diversa da quella che misurava — e quel numero finiva nelle
 * PR come prova di copertura.
 */
export function leggiTap(out = "") {
  const testo = String(out);
  const suo = (nome) => testo.match(new RegExp(`^#\\s+\\\\#\\s*${nome} (\\d+)`, "m"));
  const proprio = (nome) => testo.match(new RegExp(`^# ${nome} (\\d+)$`, "m"));
  const pass = suo("pass") || proprio("pass");
  const fail = suo("fail") || proprio("fail");
  return { passati: pass ? Number(pass[1]) : null, falliti: fail ? Number(fail[1]) : null };
}

/**
 * Le asserzioni rosse dentro l'uscita di un file — QUALE caso è caduto, non quanti.
 *
 * AR-450 — perché esiste. Il 30/7 un test è passato 11 su 11 in locale ed è caduto 10 su 11 in CI
 * (git 2.43 qui, 2.54 sul runner). Dal log di GitHub era impossibile sapere quale asserzione fosse:
 * il riassunto diceva «1 asserzioni fallite» e l'uscita del figlio — che quella riga la contiene —
 * veniva buttata. Per diagnosticarlo restava una sola strada: cambiare il test alla cieca e
 * ripubblicare, che è il modo di lavorare che questa casa chiama tirare a indovinare.
 *
 * Un rosso che non dice cosa è rosso non è una difesa: è un vicolo cieco con una spunta rossa.
 *
 * Pura: la prova la esegue su uscite finte, comprese quelle che nessun test ha ancora prodotto.
 */
export function righeRosse(out = "", max = 8) {
  const righe = String(out).split("\n").map((r) => r.replace(/^#\s?/, "").trimEnd());
  const rosse = [];
  for (let i = 0; i < righe.length; i++) {
    const t = righe[i];
    // AR-563 — QUI LA DIFESA DI AR-450 ERA CIECA, ed è per questo che è tornata a servire.
    // La regex pretendeva `not ok - nome`, senza numero. Ma quando la suite esegue UN file — che è
    // sempre, `eseguiTest` lancia un file per processo — il reporter TAP di node numera ogni caso:
    // `not ok 2 - SUL CAMPO: …`. Nessuna riga ha mai fatto match, quindi `rosse` tornava vuota e il
    // rosso arrivava lo stesso senza spiegazione. La difesa c'era, il suo verdetto no: esattamente
    // il difetto che diceva di curare. Misurato il 10/8 su TAP vero: 0 righe trovate su un file con
    // un'asserzione caduta.
    // Il numero adesso si accetta, e il caso che il commento vecchio voleva scartare — il riassunto
    // PER FILE, dove al posto del nome c'è il percorso — si riconosce dal nome, non dalla numerazione.
    const m = /^not ok\s+(?:\d+\s+)?-\s+(.*)$/.exec(t);
    if (!m) continue;
    const nome = m[1].trim();
    if (/\.(test|spec)\.[mc]?js\b/.test(nome)) continue; // è il riassunto del file, non un caso
    let riga = nome;
    // Il perché sta nel blocco YAML che segue, alla riga `error:` — non nella riga subito dopo, che
    // nel TAP vero è `---`. Cercarla lì era l'altra metà della cecità.
    for (let k = i + 1; k < righe.length && k <= i + 12; k++) {
      const d = righe[k].trim();
      if (/^(not )?ok\b/.test(d) || /^\d+\.\.\d+$/.test(d)) break; // siamo già al caso successivo
      if (d === "---" || d === "..." || d === "") continue;
      const err = /^error:\s*(.*)$/.exec(d);
      if (err) { riga += ` → ${err[1].replace(/^['"]|['"]$/g, "").trim()}`; break; }
      if (k === i + 1) { riga += ` → ${d}`; break; } // forma senza blocco YAML: il messaggio è lì
    }
    rosse.push(riga);
    if (rosse.length >= max) break;
  }

  // ── Lo STAMPO DI CASA, che non parla TAP ────────────────────────────────────
  //
  // Le prove scritte col `prova(nome, fn)` di casa non stampano `not ok`: stampano `✗ nome → perché`
  // e chiudono con `# fail N`. Per tutte quelle l'estrattore qui sopra non trovava niente e `rosse`
  // tornava vuota — quindi in CI arrivava «1 asserzioni fallite» e basta, senza dire QUALE.
  //
  // È la stessa cecità che AR-563 ha già curato sul TAP numerato, ricomparsa su un altro formato.
  // Il costo, misurato stanotte: un rosso in CI che non si riproduce in locale e di cui il log non
  // dice niente si ripubblica a tentativi, e ogni tentativo costa un giro intero.
  //
  // Un rosso che non dice quale caso è caduto non è una diagnosi: è un invito a indovinare.
  if (!rosse.length) {
    for (const t of righe) {
      const m = /^\s*✗\s+(.*)$/.exec(t);
      if (!m) continue;
      rosse.push(m[1].trim());
      if (rosse.length >= max) break;
    }
  }
  return rosse;
}

/**
 * Verdetto da un esito di spawn. Distingue ROTTO (asserzioni rosse: il codice ha un difetto) da
 * INESEGUIBILE (il file non parte affatto): sono due guasti diversi e chiedono due mosse diverse.
 */
/**
 * 2026-08-21 — LA PROVA CHE NON FINISCE, E SI PORTA VIA TUTTA LA RETE.
 *
 * Il banco lanciava ogni file con `spawn` e nessun tetto di tempo. Finché una prova finisce sempre,
 * non si vede; il giorno in cui una si pianta, si pianta la SUITE INTERA — e il controllo della
 * salute non può dire quale, perché non riceve niente: dice solo «il controllo non è partito: oltre
 * 300s», che è un 🔧 guasto e manda a indagare da nessuna parte.
 *
 * È successo: `c2-schermo` e `c4-schermo-coda` avviavano il Pannello e lo aspettavano per tre
 * minuti a testa anche quando il processo era già morto. Misurata il 21/8, la suite ci metteva 822
 * secondi contro un tetto di 300 e la macchina aveva smesso di potersi provare.
 *
 * Una prova che non finisce NON è una prova passata. Qui prende un tetto suo, viene uccisa, e il suo
 * nome finisce nel referto: da «la suite non parte» a «questo file si è piantato dopo Xs».
 */
export function verdettoPiantato(file, ms) {
  return {
    esito: "rosso",
    motivo: `non è finita entro ${Math.round(ms / 1000)}s: uccisa. Una prova che non finisce non è una prova passata.`,
    passati: null,
    falliti: 1,
    rosse: [`${file} si è piantata: nessun esito entro ${Math.round(ms / 1000)}s`],
  };
}

export function verdetto(status, out) {
  const { passati, falliti } = leggiTap(out);

  // ⚪ «NON HO POTUTO GUARDARE» — il terzo esito, che qui mancava. Le prove in bash lo sapevano già
  // dire (manca `bats` → ⚪, dichiarato uno per uno); quelle in Node no, e uno `# SKIP` usciva ✅.
  // Misurato il 14/8 con un file finto che dichiarava solo `1..0 # SKIP`: il banco stampava
  // «✅ 1 passati». Una prova che dichiara di non aver potuto guardare non è un verde — è la stessa
  // bugia che questo repo cura, con l'aggravante di stare nel metro.
  //
  // Serve per le prove che guidano un browser vero: in CI non c'è né Playwright né il Pannello
  // acceso, e lì la risposta onesta non è «rotto» (manda a cercare un bug che non c'è) né «a posto»
  // (dichiara provato ciò che nessuno ha visto). È «non l'ho potuto vedere», e va contata a parte.
  const testoTap = String(out || "");
  // ⚠️ LA FORMA MASCHERATA, e il difetto che ci ha vissuto dentro dal 14/8 al 22/8.
  //
  // Una prova dichiara «non ho potuto guardare» stampando `1..0 # SKIP <perché>` PRIMA che
  // `node:test` registri un caso. Ma quando il banco la lancia — `node --test
  // --test-reporter=tap` — quella riga è stdout del figlio, e il reporter di Node la ripubblica
  // COMMENTATA e con il cancelletto protetto: `# 1..0 \# SKIP <perché>`. Poi, non avendo trovato
  // nessun caso da fallire, chiude con `ok 1 - <file>` e esce ZERO.
  //
  // Risultato misurato il 22/8, con `pannello/node_modules` tolto di mezzo: il banco stampava
  // «✅ 2 file su 2 girano e passano» per due prove che avevano appena dichiarato di NON aver
  // guardato niente. Peggio del rosso da cui si partiva: un rosso è rumoroso, questo è muto.
  // Il salto comprava il verde — esattamente la bugia che questo banco esiste per non dire.
  //
  // Quindi si accettano tutte e due le forme: quella cruda (la prova letta da sola) e quella
  // mascherata (la prova letta dal banco). Il `\\?#` è il cancelletto protetto dal reporter.
  const salto = leggiSalto(testoTap);
  if (salto.salto) {
    return {
      esito: "non-eseguito",
      motivo: salto.motivo || "la prova ha dichiarato di non aver potuto girare qui",
      passati,
      falliti,
    };
  }

  if (status === 0 && passati !== null) return { esito: "ok", motivo: "", passati, falliti };
  // ⚠️ L'ordine di questi due controlli è il difetto che la controprova mi ha trovato addosso il
  // 25/7. `node --test` su un file che non si CARICA lo riporta lo stesso in TAP, come «1 test, 1
  // fallito»: quindi il conteggio c'è, e la prima versione lo classificava «rosso — asserzioni
  // fallite». Ma un file che non parte non ha asserzioni: dire «rosso» manda a cercare un bug che
  // non c'è, mentre il guasto è l'import. È esattamente la distinzione per cui esiste AR-156.
  // Quindi: prima si guarda se il modulo si carica, POI si guarda il TAP.
  const testo = String(out || "");
  // Node dice «module» per un percorso e «package» per un pacchetto: sono due messaggi diversi per
  // la stessa cosa, e guardarne uno solo faceva cadere il caso dei pacchetti nel ramo generico —
  // cioè proprio quello che AR-696 deve distinguere.
  const mod = testo.match(/Cannot find (?:module|package) '([^']+)'/);
  if (mod || /ERR_MODULE_NOT_FOUND|ERR_UNSUPPORTED_DIR_IMPORT/.test(testo)) {
    // AR-696 — «non parte» sono DUE cose diverse, e chiamarle entrambe rosso manda a cercare un bug
    // che non c'è. La riga di confine è quale modulo manca:
    //
    //   · un percorso NOSTRO (`./x.mjs`, `../lib/y.ts`) non si risolve → il repo è rotto: ROSSO.
    //   · un PACCHETTO (`next`, `playwright`) non si risolve → qui non è installato: ⚪ NON MISURATO.
    //
    // Il secondo caso è lo stesso di `bats` che manca (AR-693): la prova esiste, è sana, e questa
    // macchina non ha lo strumento per farla girare. Contarlo come rosso significa portarsi dietro
    // per sempre un rosso che nessuna riparazione può togliere — e un rosso che non appartiene a
    // chi lo vede è il modo più veloce per imparare a ignorare tutti gli altri.
    //
    // Misurato: nel lavoro del cervello `pannello/node_modules` non c'è, e tre schede CHIUSE
    // risultavano «prova rossa» per questo — cioè il difetto sembrava tornato e non era mai andato
    // via nessuno. ⚪ non è un verde: resta nel totale di «non danno garanzie», dove deve stare.
    const nome = mod?.[1] || "";
    const eNostro = nome.startsWith(".") || nome.startsWith("/");
    if (nome && !eNostro) {
      // Anche questo ⚪ porta il comando che lo toglie, quando esiste (AR-800, stessa casa del clone
      // superficiale e di bats). Un pacchetto del Pannello si cura con `npm ci --prefix pannello`;
      // per uno che non è del Pannello non conosco una cura, e allora il ⚪ resta e lo dice — è la
      // differenza fra «non si può» e «nessuno l'ha fatto», che sulla pagina hanno lo stesso aspetto.
      const curabile = dipendenzaDelPannello(nome);
      const detto = `manca il pacchetto «${nome}» su questa macchina: la prova esiste e nessuno l'ha fatta girare`;
      const motivo =
        curabile === true
          ? verdettoCecita({ chiave: CHIAVE_PANNELLO, cieco: true, motivo: detto }).riga
          : curabile === null
            ? `${detto} — e non ho potuto leggere pannello/package.json per sapere se si cura con \`npm ci --prefix pannello\``
            : detto;
      return { esito: "non-eseguito", motivo, passati, falliti };
    }
    return { esito: "ineseguibile", motivo: `import non risolvibile${nome ? `: ${nome}` : ""}`, passati, falliti };
  }
  if (passati === null) {
    return { esito: "ineseguibile", motivo: "il file non è nemmeno partito", passati, falliti };
  }

  // ⚪ ULTIMA RETE — la cecità che arriva da un PROCESSO FIGLIO (AR-437).
  //
  // Il ramo qui sopra riconosce lo strumento mancante quando rompe un `import`. Ma una prova che
  // guida il Pannello vero non importa niente: fa partire `npm run dev` in un processo figlio, e lì
  // `next: not found` è testo dentro un log — nessun `Cannot find module`, nessuna cecità
  // riconosciuta. Misurato il 22/8 su `main` pulito: `c2-schermo` e `c4-schermo-coda` uscivano
  // ROSSE contro un tetto di zero, e bastava `npm install --prefix pannello` per averle verdi, sei
  // casi su sei. Non erano rotte: erano cieche, e un cancello che nasce rosso senza colpa di
  // nessuno si impara ad aggirare.
  //
  // Le impronte stanno in `cervello/ambiente-prova.mjs` e sono strette apposta: devono nominare uno
  // strumento assente. Una rete larga qui comprerebbe il verde su rossi veri, che è il difetto
  // opposto e costa di più.
  const cecita = cecitaDaAmbiente(testo);
  if (cecita.cieco) {
    return {
      esito: "non-eseguito",
      motivo: `${cecita.motivo}: la prova esiste e nessuno l'ha fatta girare (rimedio: ${cecita.comando})`,
      passati,
      falliti,
    };
  }

  return { esito: "rosso", motivo: `${falliti ?? "?"} asserzioni fallite`, passati, falliti, rosse: righeRosse(testo) };
}

/**
 * Lancia UN file di test nel suo processo e ne restituisce il verdetto.
 *
 * `--import hook-ts.mjs` (AR-156): parecchi test di questa cartella importano moduli `.ts` del
 * Pannello, e quei moduli importano fra loro senza estensione — legittimo per il bundler di Next,
 * non per Node. Senza il risolutore il test non FALLISCE: non parte proprio, che è la forma
 * peggiore, perché somiglia a un test che non c'è. Il hook è conservativo: riprova solo gli import
 * relativi non risolti e, se non li trova, rilancia l'errore originale.
 */
function eseguiTest(dir, f) {
  return new Promise((risolvi) => {
    // ⚠️ `NODE_TEST_CONTEXT` NON SI EREDITA. Quando il banco gira dentro `node --test` (cioè quando
    // una prova lancia il banco per misurarlo — è il caso di AR-725), Node ha già messo
    // `NODE_TEST_CONTEXT=child-v8` nell'ambiente, e i NIPOTI la ereditano: si mettono a parlare il
    // protocollo binario del runner padre invece del TAP che questo banco sa leggere, e il verdetto
    // che ne esce è «ineseguibile» per tutti. Cioè: il banco misurato da una prova dichiarava rotto
    // tutto quello che toccava, e sembrava un difetto del codice sotto misura.
    // Si toglie QUI e non nella singola prova, perché vale per chiunque lanci il banco da dentro un
    // test — la stessa lezione di sempre: il freno va sul dato, non dentro il comando che ha bruciato.
    const ambiente = { ...process.env };
    delete ambiente.NODE_TEST_CONTEXT;
    // 🔒 E IL FRENO CHE VA CON LA CURA, perché senza è una bomba. Togliere `NODE_TEST_CONTEXT` era
    // giusto (i nipoti tornano a parlare TAP), ma quella variabile faceva anche da freno per caso:
    // il banco lancia i test, alcuni test lanciano il cancello, il cancello rilancia il banco. Con i
    // nipoti rotti la catena moriva da sola; con i nipoti sani è diventata infinita — 373 processi in
    // pochi minuti, la macchina in ginocchio. Un rimedio che toglie un freno senza rimetterne uno è
    // peggio del difetto. Qui la profondità si CONTA: un livello di annidamento è quello che serve a
    // una prova per misurare il banco, due non servono a nessuno.
    ambiente.MYCITY_BANCO_PROFONDITA = String(PROFONDITA + 1);
    // Ogni temporaneo di questa prova nasce nella sabbiera del giro, e muore con lei.
    ambiente.TMPDIR = SABBIERA;
    const p = spawn(process.execPath, ["--import", HOOK_TS, "--test", "--test-reporter=tap", join(dir, f)], {
      cwd: AD_ROOT,
      env: ambiente,
    });
    let uscita = "";
    p.stdout.on("data", (d) => (uscita += d));
    p.stderr.on("data", (d) => (uscita += d));
    // Il tetto per UNA prova. La più lenta che serve davvero (il Pannello guidato dal browser) sta
    // sotto il minuto e mezzo: due minuti lasciano margine e restano lontani dal tetto della suite.
    const scadenza = setTimeout(() => {
      // Prima si BUSSA, poi si sfonda. SIGKILL secco è quello che ha lasciato in giro un server del
      // Pannello acceso e muto sulla porta 3939, che poi ha fatto fallire tre corse di seguito per un
      // motivo che non c'entrava niente: una prova uccisa di netto non arriva mai al suo `after`, e
      // quello che ha acceso resta acceso. Con SIGTERM la prova può sganciare quello che ha avviato;
      // se dopo il respiro è ancora lì, allora SIGKILL.
      try {
        p.kill("SIGTERM");
      } catch {
        /* già morto */
      }
      const colpoDiGrazia = setTimeout(() => {
        try {
          p.kill("SIGKILL");
        } catch {
          /* già morto */
        }
      }, RESPIRO_MS);
      colpoDiGrazia.unref?.();
      risolvi({ file: `${CARTELLA}/${f}`, ...verdettoPiantato(`${CARTELLA}/${f}`, TETTO_PROVA_MS) });
    }, TETTO_PROVA_MS);
    scadenza.unref?.();
    const fine = () => clearTimeout(scadenza);
    // Un processo che non parte proprio (`error`) non è «zero asserzioni fallite»: è ineseguibile,
    // e `verdetto` lo classifica così solo se gli arriva un'uscita non nulla e nessun TAP.
    p.on("error", (e) => {
      fine();
      risolvi({ file: `${CARTELLA}/${f}`, ...verdetto(1, `${uscita}\n${e.message}`) });
    });
    p.on("close", (code) => {
      fine();
      risolvi({ file: `${CARTELLA}/${f}`, ...verdetto(code, uscita) });
    });
  });
}

/**
 * 🔁 LA CONFERMA — un rosso solo non basta per crederci.
 *
 * IL CASO VERO, 14 agosto 2026. La suite intera segna 3 rossi; uno di quei tre
 * (`registri-ora-di-piacenza.test.mjs`) non era mai stato rosso prima. Rilanciato da solo: verde,
 * 5 su 5. Rilanciata la suite intera una seconda volta: verde anche lì. Non era una regressione —
 * era una CORSA. Quel test legge timbri che altri file della stessa suite riscrivono nello stesso
 * istante, e le corsie parallele glieli cambiavano sotto.
 *
 * PERCHÉ È CODICE E NON UN PROMEMORIA. La lezione registrata quel giorno diceva a chi legge:
 * «rilancia prima di aprire un cantiere». Ma una regola che vive in un file di lezioni è un
 * promemoria — e questa casa ha il conto di quanto valgono: 269 correzioni, zero freni. Il rilancio
 * lo fa la macchina, sempre, senza che nessuno debba ricordarsene.
 *
 * COME. I rossi si rilanciano UNA volta sola e IN FILA, uno per volta: da soli la corsa non si
 * riproduce, ed è esattamente questa la domanda. Chi fallisce di nuovo è rosso davvero e resta
 * rosso. Chi passa diventa `instabile`: NON verde (un test che dipende dall'ordine è un difetto,
 * e va detto per nome), NON rosso (bloccare la CI su un fantasma insegna a saltare la CI).
 *
 * Non si rilancia un `ineseguibile`: quello non è nemmeno partito, e un file che non parte non
 * parte anche la seconda volta — rilanciarlo sarebbe solo tempo speso per confermare l'ovvio.
 *
 * @param righe     i verdetti della prima passata
 * @param rilancia  (riga) => Promise<verdetto>, la seconda corsa dello stesso file
 */
export async function confermaIRossi(righe = [], rilancia) {
  const daRilanciare = righe.filter((x) => x.esito === "rosso");
  if (!daRilanciare.length) return righe;

  const seconda = new Map();
  for (const x of daRilanciare) seconda.set(x.file, await rilancia(x)); // in fila: da soli, non in corsia

  return righe.map((x) => {
    const due = seconda.get(x.file);
    if (!due) return x;
    if (due.esito !== "ok") return { ...x, ...due, file: x.file, confermato: true };
    return {
      ...x,
      esito: "instabile",
      passati: due.passati,
      falliti: 0,
      rosse: [],
      motivo: `rosso nella suite, verde da solo al rilancio: è una corsa fra prove parallele, non una regressione (prima passata: ${x.motivo || "rosso"})`,
    };
  });
}

/**
 * Lancia UN file `.bats` col binario trovato.
 *
 * IN FILA, non a corsie, e la ragione è la stessa di AR-446 un piano più sotto: queste prove
 * guidano il worker, `watch-main`, il motore AI — cose che usano lock, flag e cartelle condivise.
 * Non ho potuto verificare da qui che reggano il parallelo, e mettere ventisei prove mai eseguite
 * direttamente in corsia significherebbe consegnare insieme il primo rosso e il primo dubbio su
 * quanto sia vero. Se un giorno si misura che sono isolate, si alza il numero di corsie.
 */
function eseguiBats(bin, dir, f) {
  return new Promise((risolvi) => {
    const p = spawn(bin, ["--tap", join(dir, f)], { cwd: AD_ROOT, env: { ...process.env, TMPDIR: SABBIERA } });
    let uscita = "";
    p.stdout.on("data", (d) => (uscita += d));
    p.stderr.on("data", (d) => (uscita += d));
    p.on("error", (e) => risolvi({ file: `${CARTELLA}/${f}`, ...verdettoBats(1, `${uscita}\n${e.message}`) }));
    p.on("close", (code) => risolvi({ file: `${CARTELLA}/${f}`, ...verdettoBats(code, uscita) }));
  });
}

/**
 * Dice se un test SCRIVE sul dato vivo della macchina (memoria del vault o JSON del cervello).
 *
 * Non è un elenco di nomi: un elenco si dimentica al primo test nuovo, ed è la malattia che questo
 * cantiere cura. È una domanda fatta al FILE — scrive, e il bersaglio è un percorso vivo? — così un
 * test scritto domani finisce nella corsia giusta senza che nessuno se lo ricordi.
 *
 * Perché serve: `previsione-aperta-prima` e `previsione-banale-dai-dati` salvano
 * `auto-coscienza/calibrazione.json` (uno anche `registro-fatti.json`), lo riscrivono per la prova e
 * poi lo rimettono com'era. In serie funziona; insieme si sovrascrivono a vicenda e diventano rossi
 * a caso. Il rosso intermittente è la forma peggiore di verde: si impara a rilanciare.
 *
 * ⚠️ Questa funzione fa girare quei test in fila, NON li guarisce: finché un test lavora sul file
 * vero, un crasho a metà lascia la memoria vera con dentro i dati della prova. Registrato come
 * difetto a parte (i test vogliono il percorso iniettato, non quello di casa).
 */
export function scriveSulDatoVivo(sorgente = "") {
  if (!/\bwriteFileSync\s*\(|\bwriteFile\s*\(|\brmSync\s*\(/.test(sorgente)) return false;
  return /MyCity-Vault\/90-Memoria-AI|auto-coscienza\/[\w-]+\.json|registro-fatti\.json/.test(sorgente);
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-725 — IN FILA ANCHE PER IL COSTO, NON SOLO PER L'EFFETTO COLLATERALE.
//
// Il banco sapeva già mettere in fila chi SCRIVE sul dato vivo: due prove che si riscrivono lo
// stesso file si disturbano, e in corsia diventano rosse a caso. Ma esiste un secondo modo di
// disturbarsi che non passa da nessun file: il COSTO. Una prova che avvia il Pannello vero e lo
// guida con un browser, o che lancia il compilatore su tutta la superficie, mangia processori e
// memoria — e sotto quel carico, insieme, escono rosse; rilanciate da sole escono verdi.
//
// Misurato al collaudo del lotto 43: `c4-schermo-coda` e `c4-typecheck-del-pannello` dichiarate
// «2 prove INSTABILI». Nessuno mentiva — il banco lo diceva — ma una prova il cui verdetto dipende
// da chi le gira accanto non è una rete: la prossima volta che diventa rossa nessuno saprà dire se
// è il codice o il vicino. Prima del lotto la suite ne aveva una sola così; dopo, tre.
//
// Riconosciute dal GESTO, mai da un elenco di nomi: un elenco si dimentica alla prossima prova
// pesante, ed è la malattia che questo cantiere cura. Nominare playwright non basta — un aiutante
// che lo importa senza guidarlo non costa niente; quello che costa è `launch(`, `newPage(` e il
// compilatore fatto partire davvero.
// ─────────────────────────────────────────────────────────────────────────────

/** Avvia un browser vero: `chromium.launch(`, `firefox.launch(`, `webkit.launch(`, `.newPage(`. */
const APRE_UN_BROWSER = /\b(?:chromium|firefox|webkit)\s*\.\s*launch\s*\(|\.\s*newPage\s*\(/;
/** Fa partire il compilatore TypeScript: `tsc` come comando, o lo script `typecheck` di npm. */
const LANCIA_IL_COMPILATORE = /["'`]\s*(?:npx\s+)?tsc\s*(?:--[\w-]+)?["'`]|["'`]tsc["'`]\s*,|\btypecheck\b\s*["'`]|["'`]typecheck["'`]/;

/**
 * Perché questa prova non può girare in corsia con le altre, oppure `null` se può.
 * Pura: entra il sorgente, esce il motivo — così il banco e la sua prova non divergono.
 */
export function costaTroppoPerLaCorsia(sorgente = "") {
  const testo = String(sorgente);
  if (APRE_UN_BROWSER.test(testo)) return "avvia un browser vero";
  if (LANCIA_IL_COMPILATORE.test(testo)) return "lancia il compilatore";
  return null;
}

/**
 * Va in fila da sola? Torna il motivo (o `null`). Due ragioni diverse, una domanda sola: qui si
 * decide, e il banco esegue — se le due domande stessero in due posti, la prossima prova pesante
 * finirebbe nella corsia sbagliata per una svista.
 */
export function perchePartireDaSola(sorgente = "") {
  if (scriveSulDatoVivo(sorgente)) return "scrive sul dato vivo";
  return costaTroppoPerLaCorsia(sorgente);
}

/** «3 scrivono sul dato vivo · 2 avviano un browser» — i motivi contati, per l'intestazione. */
export function riassuntoFila(perche = new Map()) {
  const conti = new Map();
  for (const m of perche.values()) conti.set(m, (conti.get(m) || 0) + 1);
  if (!conti.size) return "nessuna";
  return [...conti.entries()].sort((a, b) => b[1] - a[1]).map(([m, n]) => `${n} ${m}`).join(" · ");
}

/** Esegue `lavoro` su tutti gli elementi tenendo al massimo `corsie` processi accesi. */
export async function aCorsie(elementi, corsie, lavoro) {
  const esiti = new Array(elementi.length);
  let prossimo = 0;
  const corsia = async () => {
    while (prossimo < elementi.length) {
      const i = prossimo++;
      esiti[i] = await lavoro(elementi[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(corsie, elementi.length) }, corsia));
  return esiti;
}

async function main() {
  // 🔒 IL FRENO DELLA RICORSIONE. Il banco lancia i test · alcuni test lanciano il cancello del
  // lotto · il cancello rilancia il banco. Il cerchio esisteva da sempre e si spezzava per un
  // incidente — i nipoti nascevano rotti perché ereditavano `NODE_TEST_CONTEXT`. Curato l'incidente
  // (giusto: senza, i nipoti non parlano TAP e il banco li dichiara ineseguibili), il cerchio è
  // diventato infinito: centinaia di processi, la macchina in ginocchio e il runner della CI ucciso.
  // Qui si esce CIECHI e non verdi: «non ho misurato» è la verità, e un verde a questa profondità
  // sarebbe un banco che si autoapprova.
  //
  // Il freno distingue due annidamenti diversi, e la differenza è tutta:
  //   · su una SABBIERA (`TEST_CERVELLO_DIR`) o su UNA PROVA SOLA (`--solo`) è legittimo e costa
  //     niente — è così che sei prove di casa misurano il banco stesso, e vietarlo toglierebbe
  //     l'unico modo di provarlo. La prima versione di questo freno le ha fatte diventare rosse
  //     tutte e tre insieme: la regola era giusta e il confine sbagliato.
  //   · sulla SUITE INTERA è il cerchio: 347 file che rilanciano 347 file, e ogni giro ne apre altri.
  const suiteIntera = !process.env.TEST_CERVELLO_DIR && !SOLO;
  if (PROFONDITA > PROFONDITA_MASSIMA || (PROFONDITA >= 1 && suiteIntera)) {
    const messaggio = `⚪ BANCO ANNIDATO (profondità ${PROFONDITA}${suiteIntera ? ", sulla suite intera" : ""}): mi fermo invece di rilanciarmi. Un banco che chiama sé stesso senza fine non misura niente e occupa la macchina.`;
    if (JSON_MODE) console.log(JSON.stringify({ esito: "cieco", profondita: PROFONDITA, motivo: messaggio, test: [], bats: [] }, null, 2));
    else console.error(messaggio);
    process.exit(2);
  }
  // 🧹 LA SPAZZATA, PRIMA DI TUTTO. Trentadue prove di questa cartella creano una cartella
  // temporanea con `mkdtempSync` e non la cancellano mai. Il banco gira a ogni giro, quindi ogni
  // giro ne lascia indietro una trentina da qualche mega: in mesi hanno riempito /tmp sul server
  // fino al 100% e fermato la macchina per quasi tre giorni (20/8). La spazzata sta QUI e non nei
  // singoli test perché questo è l'unico punto da cui passano tutte le prove — comprese quelle che
  // muoiono a metà senza arrivare al proprio `finally`, che sono esattamente quelle che perdono.
  // Tocca solo cartelle coi nostri prefissi e ferme da oltre un giorno: mai quelle di un banco che
  // sta girando adesso, mai quelle di qualcun altro.
  const spazzata = spazza();
  if (spazzata.tolte.length && !JSON_MODE) {
    console.log(`🧹 tolte ${spazzata.tolte.length} cartelle temporanee orfane da ${spazzata.dir}`);
  }

  const quando = nowPiacenza();
  // `resolve` e non `join`: con TEST_CERVELLO_DIR assoluto, `join` incollerebbe il percorso in coda
  // alla radice e la cartella non esisterebbe — un banco che non trova le prove dice «0 passati».
  const dir = resolve(AD_ROOT, CARTELLA);
  if (!existsSync(dir)) {
    console.error(`❌ cartella non trovata: ${CARTELLA}`);
    process.exit(1);
  }
  const nella = readdirSync(dir);
  let file = trovaTest(nella);
  // I `.bats` si scelgono QUI, insieme ai `.test.mjs`, e non più giù: il filtro `--solo` può
  // benissimo indicare una prova che esiste solo in bash (`--solo due-worker`), e uscire con
  // «nessun test .test.mjs» significherebbe dire «non c'è niente» avendo guardato una famiglia sola.
  let bats = trovaBats(nella);
  if (SOLO) {
    file = file.filter((f) => f.includes(SOLO));
    bats = bats.filter((f) => f.includes(SOLO));
  }
  if (!file.length && !bats.length) {
    console.error(
      SOLO
        ? `❌ nessuna prova contiene «${SOLO}» (né .test.mjs né .bats): il filtro non ha misurato niente.`
        : `❌ nessuna prova in ${CARTELLA}: il cervello non ha rete.`,
    );
    process.exit(1);
  }

  // A CORSIE, non uno alla volta. Ogni file gira già nel suo processo separato: farne partire N
  // insieme non li mescola — un file che non parte resta un file che non parte, e gli altri
  // continuano a dare il loro verdetto. Il vecchio commento diceva il contrario («il primo che non
  // parte porterebbe giù l'intero run»), ma quello vale per `node --test` su una lista sola, non
  // per processi separati. Il conto: 103 file in serie = 62 s, ed è il costo che si paga a OGNI
  // giro del cancello, cioè decine di volte per lotto. `--seriale` resta per isolare un test che
  // dà fastidio agli altri (se ne comparisse uno che scrive nei file di un altro, si vedrebbe come
  // rosso intermittente: quella è la sua diagnosi, non un motivo per tenere tutto lento).
  //
  // Chi scrive sul dato vivo va in fila da solo, DOPO gli altri: non perché sia lento, perché non è
  // isolato. La riga sotto è la differenza fra «veloce» e «veloce e vero».
  // Un test che non riesco a LEGGERE non è «un test che non scrive»: è un test di cui non so
  // niente, e il default silenzioso lo manderebbe in corsia libera — cioè la scelta rischiosa presa
  // dal ramo dell'errore. Va in fila per prudenza, e l'impossibilità di leggerlo si dice.
  const illeggibili = [];
  // AR-694 — mentre leggo il sorgente per sapere se scrive sul dato vivo, gli faccio anche l'altra
  // domanda: questi casi possono fallire? Stessa lettura, due risposte: un file letto due volte è
  // il modo in cui due misure della stessa cosa si allontanano.
  const spentiPerFile = new Map();
  const canaliPerFile = new Map();
  // AR-725 — e il motivo per cui una prova va in fila si dichiara: «scrive sul dato vivo» e «costa
  // troppo» sono due cose diverse, e chi legge il referto deve poterle distinguere.
  const perche = new Map();
  const vaInFila = (f) => {
    try {
      const src = readFileSync(join(dir, f), "utf8");
      const spenti = casiSpenti(src);
      if (spenti.length) spentiPerFile.set(`${CARTELLA}/${f}`, spenti);
      // AR-714 — terza domanda alla stessa lettura: questa prova si allarga il canale senza dirlo?
      const larghi = canaleAllargato(src);
      if (larghi.length) canaliPerFile.set(`${CARTELLA}/${f}`, larghi);
      const motivo = perchePartireDaSola(src);
      if (motivo) perche.set(f, motivo);
      return Boolean(motivo);
    } catch (e) {
      illeggibili.push(`${f}: non ho potuto leggerlo (${e.message}) → in fila per prudenza`);
      perche.set(f, "non l'ho potuto leggere");
      return true;
    }
  };
  const inFila = file.filter(vaInFila);
  const liberi = file.filter((f) => !inFila.includes(f));
  const primaPassata = [
    ...(await aCorsie(liberi, CORSIE, (f) => eseguiTest(dir, f))),
    ...(await aCorsie(inFila, 1, (f) => eseguiTest(dir, f))),
  ].sort((a, b) => a.file.localeCompare(b.file));
  // Ogni rosso si rilancia una volta, da solo, prima di essere creduto (L-2026-0814-001).
  const righe = await confermaIRossi(primaPassata, (x) => eseguiTest(dir, basename(x.file)));
  const instabili = righe.filter((x) => x.esito === "instabile");

  // AR-660 — le prove in bash, che fino a oggi non lanciava nessuno.
  const bin = bats.length ? binarioBats() : null;
  const righeBats = bats.length
    ? bin
      ? await aCorsie(bats, 1, (f) => eseguiBats(bin, dir, f))
      : bats.map((f) => ({
          file: `${CARTELLA}/${f}`,
          esito: "non-eseguito",
          // AR-800/AR-693 — IL ⚪ PORTA IL COMANDO CHE LO TOGLIE. Un cerchio bianco che nessuno può
          // togliere è il prezzo dell'ambiente; uno che si toglie in novecento millisecondi è lavoro
          // non fatto travestito da prezzo dell'ambiente, e sulla pagina i due hanno lo stesso
          // aspetto. La frase la costruisce cervello/cecita-curabile.mjs, la stessa casa che risponde
          // per il clone superficiale: due copie della stessa decisione si allontanano.
          motivo: verdettoCecita({
            chiave: CHIAVE_BATS,
            cieco: true,
            motivo: "bats non è installato su questa macchina: la prova esiste e nessuno l'ha fatta girare",
          }).riga,
          passati: null,
          falliti: null,
        }))
    : [];
  const nonEseguiti = righeBats.filter((x) => x.esito === "non-eseguito");

  // «Non eseguito» NON entra fra i rotti, e la riga qui sotto è tutta la differenza. Un ambiente
  // senza `bats` è un ambiente incompleto, non un test che fallisce: contarlo come rosso renderebbe
  // rossa la CI, il vincolo hard del giro e la visita della macchina su una dipendenza mancante — e
  // un cancello che non può diventare verde si impara a saltare (è la lezione in cima a
  // cancello-lotto.mjs, e vale identica qui). Resta ⚪, dichiarato uno per uno, mai spacciato per ✅.
  // `instabile` sta accanto a `non-eseguito` per la stessa ragione: non è un test che fallisce, ed è
  // già stato guardato due volte. Contarlo rosso renderebbe rossa la CI su una corsa fra processi —
  // e un cancello che diventa rosso per motivi che non c'entrano col codice si impara a saltare.
  // Resta ⚠️, dichiarato per nome in fondo, mai spacciato per ✅.
  const tutte = [...righe, ...righeBats];
  const eRotto = (x) => x.esito !== "ok" && x.esito !== "non-eseguito" && x.esito !== "instabile";
  const rotti = tutte.filter(eRotto);
  // AR-693 ③ — I ROSSI IN BASH SI CONTANO A PARTE DA QUELLI IN NODE.
  //
  // Non è cosmetica del report: sono due debiti diversi e chiedono due mosse diverse. I rossi in
  // Node parlano del lavoro di adesso — chi li ha fatti diventare rossi è chi ha appena scritto. I
  // rossi in bash sono DEBITO EREDITATO: nove file rossi per diciannove casi caduti, invisibili da
  // mesi perché su questa macchina `bats` non c'è, e i fallimenti stanno negli script del worker e
  // del giro (worker.sh, giro.sh, watch-main.sh, i permessi), non nel cervello.
  //
  // Sommarli in un numero solo produce la riga che ha tenuto nascosto il buco per mesi: «12 rossi»
  // fa sembrare che qualcuno abbia appena rotto dodici cose, e chi legge non sa quali sono sue. Un
  // rosso che non appartiene a chi lo vede è il modo più veloce per imparare a ignorare tutti gli altri.
  const rottiNode = righe.filter(eRotto);
  const rottiBash = righeBats.filter(eRotto);
  const totale = tutte.reduce((n, x) => n + (x.passati || 0), 0);
  // ⚪ IN TUTTE E DUE LE FAMIGLIE. Anche una prova in Node può dichiarare di non aver potuto girare
  // (`1..0 # SKIP`): contare i ⚪ solo fra i `.bats` lascerebbe sparire gli altri dal denominatore,
  // che è la forma esatta del difetto che questo conto cura.
  const nonMisurati = tutte.filter((x) => x.esito === "non-eseguito");

  // AR-683 — IL ROSSO DI UNA SCHEDA GIÀ CHIUSA. Questo banco sa quali file sono rossi; il cantiere sa
  // quali schede si appoggiano a quei file per dirsi riparate. Nessuno dei due sapeva l'altra metà, e
  // così tre difetti CHIUSI avevano la prova rossa senza che nessuno se ne accorgesse. Il conto si fa
  // qui perché è l'unico posto dove le due metà esistono insieme, e costa una lettura di file.
  const verdettoPerFile = new Map(tutte.map((x) => [x.file, x.esito]));
  const chiusure = chiusureConProvaRossa(verdettoPerFile);

  if (JSON_MODE) {
    console.log(
      JSON.stringify(
        {
          esito: rotti.length ? "rotti" : "ok",
          quando,
          asserzioni: totale,
          corsie: CORSIE,
          in_fila: inFila,
          in_fila_perche: Object.fromEntries(perche),
          illeggibili,
          test: righe,
          bats: righeBats,
          bats_non_eseguiti: nonEseguiti.length,
          // AR-693 ③ — due debiti, due numeri: quello di adesso (Node) e quello ereditato (bash).
          rossi_node: rottiNode.map((x) => x.file),
          rossi_bash: rottiBash.map((x) => x.file),
          non_misurati: nonMisurati.map((x) => x.file),
          bats_binario: bin,
          // I due conti stanno nel JSON SEMPRE, anche a zero: un numero che compare solo quando è
          // brutto non si può guardare scendere — sparisce, e la sparizione somiglia a una guarigione.
          casi_spenti: [...spentiPerFile].map(([file, casi]) => ({ file, casi })),
          canali_allargati: [...canaliPerFile].map(([file, righe]) => ({ file, righe })),
          chiusure_da_riverificare: chiusure.voci,
          chiusure_non_lette: chiusure.cieco,
        },
        null,
        2,
      ),
    );
    process.exitCode = rotti.length ? 1 : 0;
    return;
  }

  console.log(`\n🧪 TEST DEL CERVELLO — ${quando}  (${CORSIE} corsie · ${inFila.length} in fila da sole: ${riassuntoFila(perche)})\n`);
  for (const m of illeggibili) console.log(`  ⚠️  ${m}`);
  for (const x of [...righe, ...righeBats]) {
    const icona =
      x.esito === "ok" ? "✅" : x.esito === "non-eseguito" ? "⚪" : x.esito === "instabile" ? "⚠️" : x.esito === "ineseguibile" ? "🚫" : "❌";
    console.log(`  ${icona} ${x.file}${x.passati != null ? `  (${x.passati} passati)` : ""}`);
    if (x.motivo) console.log(`      ${x.motivo}`);
    // QUALE asserzione, non solo quante (AR-450): è la riga che rende un rosso in CI diagnosticabile
    // senza ripubblicare a tentativi.
    for (const r of x.rosse || []) console.log(`      ✗ ${r}`);
  }
  // Il ⚪ va detto anche in fondo, dove si legge il verdetto: un elenco lungo si scorre, la riga
  // finale no. «Passano tutti» senza questa riga sarebbe vero sui file eseguiti e falso su ciò che
  // il lettore capisce — cioè la forma esatta di verde bugiardo che AR-660 racconta.
  if (nonEseguiti.length) {
    // ⚠️ DUE MOTIVI DIVERSI, DUE FRASI DIVERSE — trovato in CI il 26/8.
    //
    // Prima questa riga diceva sempre «manca `bats` su questa macchina». Da quando l'esecutore c'è
    // (AR-693 ①) la frase è diventata falsa nel caso più comune: sul runner `bats` è installato, e
    // i file non eseguiti sono quelli che hanno DICHIARATO di non poter girare lì (AR-652, lo skip
    // senza le chiavi del server). Un rimedio che punta alla cosa sbagliata manda chi legge a
    // cercare nel posto sbagliato — ed è lo stesso vizio che questo lotto cura altrove.
    if (bin) {
      console.log(`\n⚪ ${nonEseguiti.length} prove in bash NON eseguite: \`bats\` c'è, sono le prove che hanno dichiarato di non poter girare qui.`);
      for (const x of nonEseguiti.slice(0, 5)) console.log(`   · ${x.file} — ${x.motivo}`);
    } else {
      console.log(
        `\n⚪ ${nonEseguiti.length} prove in bash NON eseguite: manca \`bats\` su questa macchina.` +
          `\n   Installalo (\`bash cervello/installa-bats.sh\`, oppure \`npm i -g bats\` e poi BATS_BIN=$(command -v bats)) e rilancia: sono prove vere, oggi nessuno le fa.` +
          `\n   Il conto misurato il 14/8: senza bats 1 rosso su 243, con bats 12 — dieci fallimenti veri erano invisibili (AR-693).`,
      );
    }
  }
  // AR-694 — i casi che non possono fallire. Vanno detti PRIMA del verdetto: un file può essere
  // verde e avere dentro tre casi spenti, e quel verde copre meno di quanto sembra.
  if (spentiPerFile.size) {
    const quanti = [...spentiPerFile.values()].reduce((n, c) => n + c.length, 0);
    console.log(`\n⚠️  ${quanti} casi di prova NON POSSONO FALLIRE (asincroni, e il banco del file non li aspetta):`);
    for (const [file, casi] of spentiPerFile) {
      console.log(`   · ${file} — ${casi.length}: ${casi.map((c) => `riga ${c.riga}`).join(", ")}`);
      console.log(`     ${casi[0].motivo}`);
    }
  }
  // AR-683 — e le schede che si dicono chiuse appoggiandosi a un file che oggi è rosso.
  if (chiusure.voci.length) {
    const regredite = chiusure.voci.filter((v) => v.stato === "regredita");
    const mute = chiusure.voci.filter((v) => v.stato === "non-misurata");
    if (regredite.length) {
      console.log(`\n❗ ${regredite.length} schede CHIUSE hanno la prova rossa adesso: il fix c'era e non c'è più, oppure non c'è mai stato.`);
      for (const v of regredite.slice(0, 10)) console.log(`   · ${v.id} → ${v.file} (${v.esito})`);
    }
    if (mute.length) console.log(`\n⚪ ${mute.length} schede chiuse la cui prova non ho potuto eseguire qui: chiuse su una misura che oggi nessuno rifà.`);
  }
  for (const m of chiusure.cieco) console.log(`\n⚪ ${m}`);

  // IL DENOMINATORE NON SI RESTRINGE. Prima il verde contava «i file che ho potuto eseguire»,
  // cioè toglieva le prove non misurate dal totale: un metro che restringe il campione fa salire il
  // voto misurando di meno. Adesso i ⚪ restano nel conto e si vedono accanto al verde.
  const quantiFile = righe.length + righeBats.length;

  // Un instabile è un difetto vero (una prova che dipende dall'ordine non è una rete), solo non di
  // quelli che si riparano rilanciando. Va a finire qui, dove si legge il verdetto, con il nome.
  if (instabili.length) {
    console.log(`\n⚠️  ${instabili.length} prove INSTABILI: rosse nella suite, verdi rilanciate da sole.`);
    for (const x of instabili) console.log(`   · ${x.file}`);
    console.log(`   Non è una regressione (il codice passa), ma è una prova che dipende da chi gira insieme: va isolata.`);
  }
  if (!rotti.length) {
    const copertura = nonMisurati.length ? ` · ⚪ ${nonMisurati.length} NON le ho potute far girare qui (il verde non le copre)` : "";
    console.log(`\n✅ ${quantiFile - nonMisurati.length} file su ${quantiFile} girano e passano, ${totale} asserzioni${copertura}.`);
    process.exitCode = 0;
    return;
  }
  // AR-693 ③ — il numero dice anche DI CHI è: «12 rossi» e «3 rossi in Node + 9 in bash ereditati»
  // mandano chi legge in due posti diversi, e solo il secondo è quello giusto.
  const daChi = rottiBash.length ? ` (${rottiNode.length} in Node · ${rottiBash.length} in bash, debito ereditato AR-693)` : "";
  console.log(
    `\n❌ ${rotti.length} rossi${daChi}${nonMisurati.length ? ` · ⚪ ${nonMisurati.length} non misurati` : ""} su ${quantiFile} file: ${rotti.length + nonMisurati.length} non danno garanzie.`,
  );
  console.log(`   Un test che non gira non è una rete: è un file che fa sembrare coperto ciò che non lo è.`);

  // 🐚 IL DEBITO EREDITATO IN BASH NON RENDE ROSSO CHI PASSA DI QUI — e il perché è misurato.
  //
  // TROVATO IN CI IL 26/8, DA QUESTO STESSO LOTTO. Dichiarato l'esecutore (AR-693 ①), le ventinove
  // prove in bash girano davvero e ne escono SETTE rosse: tutte in codice che nessun lotto di oggi
  // ha toccato — worker.sh, giro.sh, verifica-sensori, i permessi — e tutte ancorate alla sintassi
  // di ieri (AR-831). Fin qui è giusto e va detto. Ma l'uscita secca 1 le faceva pesare su DUE
  // strade che non c'entrano niente: il workflow `test-cervello.yml`, che diventava rosso a ogni
  // push su main per tutti, e `giro.sh` riga 474, che alza un vincolo hard e avrebbe fermato ogni
  // giro del server finché quelle sette non erano curate.
  //
  // Il risultato sarebbe stato un cancello che NON PUÒ diventare verde — e questa casa ha il conto
  // di cosa succede allora: si impara ad aggirarlo al secondo giro, e da lì non dice più niente
  // nemmeno quando ha ragione. Cioè: togliere la benda avrebbe spento la difesa.
  //
  // La regola è la stessa che il cancello del lotto applica da sempre, e il tetto è lo STESSO file:
  // debito ereditato = si conta sotto un numero che scende e non risale · regressione = blocca
  // subito. Qui non c'è una seconda copia della decisione, c'è una lettura sola di `test_bash`.
  //
  // TRE CONDIZIONI INSIEME, e la terza è quella che impedisce l'assoluzione comoda:
  //   · nessun rosso in Node (quelli restano blocco duro, tetto zero e nessuna eccezione);
  //   · i rossi in bash ≤ il tetto dichiarato;
  //   · il tetto l'ho LETTO davvero. Un file assente o illeggibile non assolve nessuno: senza il
  //     numero non sto misurando, e «non ho misurato» non è «va bene» (contratto AR-322).
  const t = tettoBash();
  if (!rottiNode.length && rottiBash.length && t.letto && rottiBash.length <= t.tetto) {
    console.log(
      `\n🐚 I ${rottiBash.length} rossi sono TUTTI in bash, debito ereditato sotto il tetto dichiarato (${t.tetto}, cervello/tetti-lotto.json → test_bash).` +
        `\n   Non fermo chi passa di qui: nessuno di questi è di questo lavoro, e sono la scheda AR-831. Il tetto scende e non risale — chi ne cura uno lo abbassi.` +
        `\n   Un rosso in Node, o un ottavo in bash, e questa riga non compare: quello blocca.`,
    );
    process.exitCode = 0;
    return;
  }
  if (!rottiNode.length && rottiBash.length && !t.letto) {
    console.log(`\n⚠️  ${t.motivo}: senza un numero fermo non distinguo il debito di ieri da una regressione di oggi, e non assolvo ciò che non ho potuto distinguere.`);
  }
  process.exitCode = 1;
}

/**
 * Il tetto del debito ereditato in bash, letto dalla casa unica dei tetti del cancello.
 *
 * Tre valori e non due: `letto` dice se il numero l'ho visto davvero. Un `0` di ripiego su un file
 * illeggibile sarebbe un verdetto intero costruito su una fonte mai aperta — la malattia
 * `fonte-troncata-letta-per-intera`, e qui produrrebbe il danno peggiore dei due (assolvere).
 */
export function tettoBash(leggi = null) {
  const dove = process.env.TETTI_FILE || join(AD_ROOT, "cervello/tetti-lotto.json");
  let testo;
  try {
    testo = leggi ? leggi() : readFileSync(dove, "utf8");
  } catch {
    return { letto: false, tetto: null, motivo: "cervello/tetti-lotto.json non l'ho potuto leggere" };
  }
  let t;
  try {
    t = JSON.parse(testo);
  } catch {
    return { letto: false, tetto: null, motivo: "cervello/tetti-lotto.json non è leggibile come JSON" };
  }
  const n = t?.test_bash;
  if (!Number.isInteger(n) || n < 0) return { letto: false, tetto: null, motivo: "cervello/tetti-lotto.json non dichiara `test_bash`" };
  return { letto: true, tetto: n, motivo: `tetto dichiarato: ${n}` };
}

/**
 * AR-683 — le schede CHIUSE la cui prova, adesso, non è verde.
 *
 * Legge il cantiere in sola lettura e chiede al contratto della prova di incrociarlo coi verdetti
 * appena misurati. Se il cantiere non si legge NON torna un elenco vuoto — quello somiglia a «non ce
 * n'è» — ma dichiara di non aver guardato: `cieco` arriva fino alla stampa e al JSON.
 */
function chiusureConProvaRossa(verdettoPerFile) {
  const path = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
  if (!existsSync(path)) return { voci: [], cieco: ["cantiere-difetti.json assente: non so quali schede chiuse poggino su questi file"] };
  let cantiere;
  try {
    cantiere = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    return { voci: [], cieco: [`cantiere-difetti.json non leggibile (${e.message}): non ho potuto controllare le chiusure`] };
  }
  const difetti = Array.isArray(cantiere?.difetti) ? cantiere.difetti : null;
  if (!difetti) return { voci: [], cieco: ["cantiere-difetti.json senza elenco `difetti`: non ho potuto controllare le chiusure"] };
  return { voci: chiusureDaRiverificare(difetti, verdettoPerFile, fileDelComando), cieco: [] };
}

// AR-445 — la guardia dell'entrypoint nella forma che regge anche i percorsi strani. Il confronto
// con `file://${process.argv[1]}` sbaglia appena il percorso contiene uno spazio o un accento (la
// forma giusta li codifica: `file:///home/a%20b/...`), e sbagliando esegue `main()` DENTRO chi ha
// solo importato una funzione. `pathToFileURL` è la stessa domanda, fatta bene.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
