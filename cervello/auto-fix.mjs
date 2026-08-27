#!/usr/bin/env node
// 🔧 AUTO-FIX — la pipeline che CHIUDE i difetti del cantiere (upgrade U17).
// 🟢 Sola lettura del codice + aggiornamento della memoria auto-coscienza (cantiere + storico).
//    ⚠️ Governo: MODIFICARE il codice per risolvere un difetto resta 🟡 (firma Nicola, via PR).
//    Questo script NON tocca codice: verifica se un fix è GIÀ presente e, in tal caso, chiude il
//    difetto onestamente (bookkeeping 🟢). Per i difetti ancora aperti stampa la proposta 🟡 da firmare.
//
// Perché esiste: il volano diagnosticava difetti ma ne chiudeva 0 (chiuso-volano). Senza chiusura,
// l'auto-radiografia è un bel cruscotto, non un sistema che si ripara. Questo chiude il ciclo.
//
// Ogni difetto in cantiere-difetti.json può avere una prova oggettiva di risoluzione:
//   "verifica": { "file": "cervello/x.mjs", "pattern": "regex", "presente": true }
//   presente:true  → il difetto è risolto QUANDO il pattern è presente nel file (fix installato)
//   presente:false → il difetto è risolto QUANDO il pattern è ASSENTE (es. path Windows rimosso)
//   "verifica": { "comando": "node cervello/guardiano.mjs" }
//                  → il difetto è risolto QUANDO quel guardiano esce 0 (condizioni strutturali)
//
// Uso:
//   node cervello/auto-fix.mjs verifica              # report: quali difetti risultano risolti nel codice
//   node cervello/auto-fix.mjs verifica --applica    # chiude nel cantiere quelli verificati + aggiorna storico
//   node cervello/auto-fix.mjs chiudi --id=AR-002 --come="..."   # chiusura manuale con evidenza
//   node cervello/auto-fix.mjs report                # stato del cantiere (aperti/in-corso/chiusi)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { scriviJsonAtomico } from "./scrivi-json.mjs";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";
import { chiusuraAmmessa, istanteNascita, patternTrovato } from "./prove-regole.mjs";
import { chiusuraBloccata, formaProva, verdettoChiusura } from "./chiusura-dichiarata.mjs";
// AR-796 — la porta A MANO consulta il cancello direttamente: `verdettoChiusura` serve la porta
// automatica (che parte da un esito di prova), qui invece la decisione è già presa da una persona
// e la domanda è solo «quella prova sarebbe stata ammessa?». Stessa funzione, due usi diversi.
import { ammissibilitaProva } from "./prova-ammissibile.mjs";
import { FORMA_COMANDO_PROVA, MOTIVO_COMANDO_NON_AMMESSO, comandoAmmesso } from "./forma-prova.mjs";
// 📏 Quanto vale una prova lo dice UN posto solo (contratto-prova.mjs), non un lettore per file.
import { classificaProva } from "./contratto-prova.mjs";
export { FORMA_COMANDO_PROVA, comandoAmmesso };
// 📇 IL CONTRATTO DELLA SCHEDA (contratto-scheda.mjs) — il timbro di chiusura e il verdetto sulla
// prova stanno lì, in una funzione pura che TUTTI possono importare. Vedi il commento su
// `timbraChiusura`: era qui, e il secondo che chiude (l'allineatore delle radiografie) non poteva
// chiamarlo senza trascinarsi dentro una chiamata a git — così se n'era scritta una versione sua.
import { NON_MISURABILE, coperturaChiusi, timbraChiusura, verdettoProva } from "./contratto-scheda.mjs";
// I chiamanti storici (e `contabilita-chiusure.test.mjs`) importano il timbro DA QUI: continuano a
// funzionare. La definizione però è una sola — riesportare è come si sposta una regola senza
// rompere chi la usa; lasciarne una copia sarebbe la malattia che stiamo curando.
export { timbraChiusura };
import { cambiatoDallaNascita, storiaDelRepoCurata } from "./storia-git.mjs";
// 🚧 GLI STATI DEL CANTIERE — «quanti difetti ci sono» ha UNA casa (cervello/stati-cantiere.mjs).
// Qui il conto era scritto a mano su tre stati e le schede `da-riverificare` non entravano in
// nessun ramo: 632 contro 716, dentro il registro stesso (AR-684 · AR-717).
import { metaCantiere } from "./stati-cantiere.mjs";

const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
// AR-796 — il registro si può puntare altrove, con la stessa chiave che usa già `salute-onesta.mjs`
// (`CANTIERE_FILE`). Serve alla prova: il difetto è «chi CHIUDE non passa dal cancello», e l'unico
// modo di provarlo è far girare questo file su una scheda finta e guardare se la chiude. Senza
// questa maniglia la prova potrebbe solo esaminare la funzione pura — cioè provare che il cancello
// funziona, non che il chiuditore ci passi: esattamente la distinzione che ha lasciato aperto il
// difetto per due lotti. Fuori dai test nessuno la usa e il percorso resta quello di sempre.
const CANTIERE = process.env.CANTIERE_FILE || join(VAULT, "cantiere-difetti.json");
// AR-799 — anche lo storico si può puntare altrove, e NON è un dettaglio del test: questo file
// scrive in DUE registri, e finché se ne poteva reindirizzare uno solo ogni prova che faceva girare
// il chiuditore su un cantiere finto scriveva un punto vero nella storia della salute. È successo
// il 23/8 con le prove di AR-796: quattro punti «chiuso AR-FINTO-MANO» nella serie che disegna il
// grafico in Cabina, e il totale dei chiusi che crolla da 679 a 1. L'ha trovato la prova del volano,
// non io. Una maniglia che apre metà porta è peggio di nessuna maniglia: fa credere di essere al
// riparo.
const STORICO = process.env.STORICO_FILE || join(VAULT, "storico-salute.json");
const RAD = join(VAULT, "auto-radiografia.json");

function arg(name, def = undefined) {
  const pref = `--${name}=`;
  const a = process.argv.find((x) => x.startsWith(pref));
  return a ? a.slice(pref.length) : def;
}
function has(flag) {
  return process.argv.includes(`--${flag}`);
}

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}
// AR-296 — la scrittura passa dal writer atomico condiviso: `writeFileSync` non è atomico, e un
// processo che muore a metà (kill del servizio, riavvio del VPS) lascia sul disco un JSON troncato che
// al giro dopo non si parsa più — «memoria bloccata da un file rotto». Questa funzione era
// copiaincollata in cinque file; ora è una sola, in cervello/scrivi-json.mjs.
function writeJson(path, data) {
  scriviJsonAtomico(path, data);
}

/**
 * IL RIASSUNTO CHE IL CANTIERE SCRIVE DI SÉ — AR-684 · AR-717.
 *
 * Questo era il posto peggiore in cui contare male, perché il numero finisce **dentro il registro**
 * e chi lo legge invece di ricontare eredita l'errore senza accorgersene. Contava a mano tre stati
 * (`aperto`, `in-corso`, `chiuso`) e le schede `da-riverificare` non cadevano in nessun ramo:
 * misurato il 15/8/2026, il meta diceva 632 su 716 schede vere — 84 difetti fuori dal proprio conto.
 *
 * Adesso la regola non è qui: la chiede a `cervello/stati-cantiere.mjs`, che la porta anche al
 * Pannello e all'allineatore delle radiografie. E il blocco scritto porta con sé `somma_torna`: se
 * un giorno i rami non facessero il totale, il file lo dichiara di sé invece di lasciarlo scoprire
 * a una radiografia sei settimane dopo.
 */
/**
 * DOVE FINISCE UNA SCHEDA dopo che i verdetti sono stati raccolti.
 *
 * AR-796 diceva: la chiusura la decide `vc.chiude`, non una condizione riscritta qui. Prima questa
 * catena rifaceva il verdetto (`r.esito === "risolto" && g.ammessa`), e il `chiude` che la funzione
 * pura tornava veniva buttato — un verdetto che il chiamante ricalcola non decide niente, e i
 * cancelli aggiunti alla funzione non sarebbero mai arrivati fin qui.
 *
 * 27/8, AR-840 — perché adesso è una funzione. Il fix c'era ed era giusto; la sua mutazione, che
 * rimette il verdetto ricalcolato, lasciava la prova VERDE perché la catena viveva in mezzo a un
 * ciclo dentro un comando, e nessuno poteva interrogarla. Qui si può, con tutte le combinazioni.
 *
 * L'ORDINE È LA REGOLA, non un dettaglio: prima ciò che è dichiarato aperto, poi ciò che il cancello
 * non ammette, poi la chiusura, poi il rifiuto, e per ultimo «non ho potuto misurare».
 */
export function dovePuntaLaScheda({ vc = {}, g = {}, bloccato = false, cieca = false } = {}) {
  if (vc.bloccata) return "dichiarati-aperti";
  if (vc.inammissibile) return "rifiutate-dal-cancello";
  if (vc.chiude && g.ammessa) return "da-chiudere";
  if (bloccato) return "rifiutate";
  if (cieca) return "non-misurate";
  return "aperta";
}

export function ricalcolaMeta(cantiere) {
  cantiere.meta = metaCantiere(cantiere.difetti || [], { oggiMs: Date.parse(nowPiacenza().slice(0, 10)) });
}

/**
 * Prova di tipo COMANDO: il difetto è risolto quando un guardiano esce 0.
 *
 * Perché esiste (round 4, 2026-07-25). AR-142 («permessi di sessione più larghi del dovuto») non è
 * esprimibile come file+pattern: la stessa stringa `git push` compare sia fra i permessi CONCESSI
 * sia fra i DIVIETI, e una regex sul testo grezzo non sa distinguerli — un file configurato BENE
 * matcherebbe come uno configurato male. Provato: la prima versione della prova falliva proprio così.
 * E i divieti MANCANTI non sono esprimibili affatto: non si può cercare l'assenza di una regola in
 * un elenco che non la contiene.
 *
 * Il guardiano invece lo sa fare, perché legge la struttura. Quindi la prova diventa: «gira il
 * guardiano e guarda l'esito». Non è auto-firma — il guardiano legge un file che la macchina non
 * può scrivere (settings.json le è negato in Edit/Write) e non può farsi passare da solo.
 *
 * Vale per tutta la classe di difetti che oggi sono marcati «verifica umana» solo perché la loro
 * condizione è strutturale invece che testuale: era il male che il round 2 aveva smascherato.
 *
 * Sicurezza: si eseguono SOLO comandi `node <script>` dentro cervello/, senza shell, con un timeout.
 * Un difetto non deve poter far girare qualcosa di arbitrario per dichiararsi risolto.
 */
export function eseguiProvaComando(comando, run = spawnSync) {
  const c = String(comando || "").trim();
  const m = FORMA_COMANDO_PROVA.exec(c);
  // AR-559 — QUI STAVA IL BUCO. Un comando fuori forma tornava `esito: "manuale"`, cioè la stessa
  // parola con cui questo motore dice «questo difetto ha una verifica UMANA e non lo chiuderà mai
  // un guardiano». Due cose oppostissime nello stesso cassetto: la prima è un metro rotto, la
  // seconda è una scelta scritta. Risultato misurato il 13/8: 53 schede chiuse su una prova che
  // nessuno ha mai eseguito — quasi tutte per tre caratteri di troppo (`node --test x` invece di
  // `node x`), cioè comandi che FUNZIONEREBBERO. Ora il motore lo dice: `non-misurabile` è il
  // codice 2 del contratto di casa, e non somiglia a un verde.
  //
  // ⚠️ PERCHÉ `esito` RESTA "manuale" E LA VERITÀ STA IN `codice`. La cura pulita sarebbe
  // rinominare l'esito. Non si può da qui: `permessi-check.test.mjs` — il test che difende
  // l'invariante di SICUREZZA «un difetto non può far girare codice arbitrario» — verifica il
  // rifiuto confrontando proprio quella stringa, e quel file non è di questa corsia. Rinominarlo
  // avrebbe fatto diventare rosso un test di sicurezza per una questione di etichetta: il rimedio
  // sarebbe stato peggio del male. Quindi la distinzione diventa un CAMPO, che è anche più solido
  // di una parola: chi decide legge `codice`, non l'etichetta. (La rinomina resta consigliata e
  // sta nell'esito della corsia, con la riga esatta da cambiare.)
  if (!m) {
    return {
      esito: "manuale",
      codice: NON_MISURABILE,
      misurato: false,
      dettaglio: `comando non ammesso: "${c}" (${MOTIVO_COMANDO_NON_AMMESSO}) — NON HO POTUTO MISURARE: questa prova non è stata eseguita, quindi non dice né verde né rosso`,
    };
  }
  const argomenti = m[3] ? m[3].trim().split(/\s+/) : [];
  // `--test` va PRIMA del percorso: si esegue esattamente il comando scritto sulla scheda (AR-559).
  const prefisso = m[1] ? [m[1].trim()] : [];
  const r = run(process.execPath, [...prefisso, join(AD_ROOT, m[2]), ...argomenti], {
    cwd: AD_ROOT,
    encoding: "utf8",
    timeout: 120000,
  });
  if (r.error) return { esito: "aperto", dettaglio: `${c} non eseguibile: ${r.error.message}` };
  return {
    esito: r.status === 0 ? "risolto" : "aperto",
    dettaglio: `${c} → exit ${r.status}${r.status === 0 ? " (guardiano soddisfatto)" : " (il guardiano segnala ancora violazioni)"}`,
  };
}

/**
 * Lo stato della storia di git, chiesto UNA volta per esecuzione (AR-429).
 *
 * Non è un dettaglio di prestazioni: la risposta non cambia dentro un giro, e chiederla una volta
 * sola rende possibile stamparla in fondo al rapporto — una cecità che non si vede è una cecità che
 * non è stata misurata.
 */
const STORIA = storiaDelRepoCurata(AD_ROOT);

/**
 * Il file citato dalla prova è cambiato fra la nascita del difetto e adesso? (AR-330, guardia ②)
 * `null` = non si può sapere → chi decide lascerà passare DICENDOLO, invece di bloccare per sempre
 * ogni chiusura su un repo senza storia.
 *
 * ⚠️ AR-429 — perché il controllo sulla storia viene PRIMA di chiedere a git.
 * In un clone superficiale `git log --since` risponde 0 e stampa qualcosa: la risposta ha la forma
 * di una vera. Ma il commit di innesto non ha genitori, quindi git considera nuovo tutto il suo
 * albero — misurati 1999 file il 29/7 su questo repo. Effetto: QUALUNQUE file risultava «cambiato
 * dalla nascita», la guardia rispondeva sempre «c'è del lavoro dietro questa chiusura», e in ogni
 * sessione cloud (dove il clone è superficiale per costruzione) era di fatto spenta — senza dirlo.
 * Un guardiano spento che firma è peggio di un guardiano assente: l'assente non rassicura nessuno.
 */
function fileCambiatoDa(file, nato) {
  if (!STORIA.intera) return cambiatoDallaNascita(STORIA, null); // non lo so, e lo dico
  // ⚠️ L'istante DEVE essere completo. Con una data secca («2026-07-27») l'approxidate di git riempie
  // l'ora mancante con quella CORRENTE: `--since=2026-07-27` lanciato alle 18:40 significa «dalle
  // 18:40 di oggi», non «da mezzanotte». Effetto: ogni file modificato oggi risultava «mai cambiato»
  // e la guardia bloccava chiusure legittime. Stesso inciampo di prove-oneste, e la seconda copia
  // l'ho scritta io dopo aver corretto la prima — motivo per cui la normalizzazione ora è UNA
  // funzione condivisa (istanteNascita) e non due date passate a mano.
  const istante = istanteNascita(nato);
  if (!file || !istante) return null;
  const r = spawnSync("git", ["log", "--oneline", `--since=${istante}`, "--", file], {
    cwd: AD_ROOT,
    encoding: "utf8",
    timeout: 20000,
    maxBuffer: 64 * 1024 * 1024,
  });
  // Il verdetto lo emette la funzione pura: qui si raccoglie soltanto (regola ③).
  return cambiatoDallaNascita(STORIA, r.error || r.status !== 0 ? null : r.stdout);
}

// Verifica oggettiva: il fix è presente nel codice?
function verificaFix(dif) {
  const v = dif.verifica;
  // AR-344 — la forma della prova la decide UN lettore solo (formaProva), non una copia per lettore.
  // Qui c'era `if (!v || !v.file || !v.pattern)`: la stessa riga che in cantiere-prove.mjs faceva
  // contare come «umana» ogni prova migrata a {comando}. Ripararla di là e lasciarla di qua è
  // l'errore già pagato (AR-172): la porta a mano riparata e quella automatica lasciata aperta.
  const forma = formaProva(v);
  if (forma === "comando") return eseguiProvaComando(v.comando);
  if (forma !== "pattern") return { esito: "manuale", dettaglio: "nessuna prova automatica: verifica umana" };
  const p = join(AD_ROOT, v.file);
  // AR-686 — il puntatore rotto lo riconosce IL CONTRATTO, non una riga scritta qui.
  //
  // Questo motore la cosa giusta la faceva già (file assente → «aperto», mai chiuso), ma la faceva
  // per conto suo — e `cantiere-prove` sullo stesso caso rispondeva «auto-fix lo chiuderà». Due
  // metri sullo stesso difetto: uno prometteva una chiusura che l'altro non faceva, e un numero che
  // promette e non mantiene è come si costruisce una misura di cui nessuno si fida. La risposta
  // adesso è una sola, e il motivo che arriva a chi legge è lo stesso in tutt'e due i posti.
  const orfana = classificaProva(v, { fileEsiste: (f) => existsSync(join(AD_ROOT, f)) });
  if (orfana.tipo === "orfana") return { esito: "aperto", dettaglio: orfana.motivo };
  if (!existsSync(p)) return { esito: "aperto", dettaglio: `file assente: ${v.file}` };
  let txt = "";
  try {
    txt = readFileSync(p, "utf8");
  } catch (e) {
    return { esito: "aperto", dettaglio: `illeggibile: ${e.message}` };
  }
  // Il confronto (regex OPPURE letterale, per il caso AR-151) vive in prove-regole.mjs: da AR-330 lo
  // usano in due — questo, per chiudere, e prove-oneste, per controllare com'era la prova alla
  // nascita. Due copie divergerebbero, e una prova valutata con due metri diversi non è un metro.
  const trovato = patternTrovato(v.pattern, txt);
  const vuolePresente = v.presente !== false; // default: presente=true
  const risolto = vuolePresente ? trovato : !trovato;
  return {
    esito: risolto ? "risolto" : "aperto",
    dettaglio: `${v.file} ${vuolePresente ? "contiene" : "NON contiene"} /${v.pattern}/ → ${trovato ? "trovato" : "assente"}`,
  };
}

/**
 * Quale voto salute va scritto nello storico quando si chiude un difetto.
 * Pura (nessun I/O) apposta: è la regola che ha fatto danno, e va potuta provare da sola.
 *   · la radiografia offre una misura vera (numero > 0) → si usa quella;
 *   · altrimenti → si RIPORTA l'ultimo voto noto dello storico, marcandolo come non ri-misurato.
 * Non ritorna mai 0 per "non lo so": chiudere un difetto non deve poter abbassare il voto.
 */
export function votoSaluteDaRegistrare(rad = {}, serie = []) {
  const votoRad = Number(rad?.voto_salute_architettura);
  if (Number.isFinite(votoRad) && votoRad > 0) return { voto: votoRad, misurato: true };
  const ultimoNoto = [...(serie || [])].reverse().find((v) => Number(v?.voto_salute) > 0);
  return { voto: Number(ultimoNoto?.voto_salute) || 0, misurato: false };
}

function bumpSalute(chiusiOra, note) {
  if (chiusiOra <= 0) return;
  // AR-096: il voto NON si auto-gonfia più qui (era +2 fisso a ogni chiusura, solo in salita, scritto
  // dal processo che ha interesse a farlo salire). Il voto_salute_architettura resta un output della
  // radiografia completa (che vede aperti/gravità/nuovi difetti): auto-fix lo LEGGE come-è, non lo tocca,
  // e si limita ad aggiornare il conteggio dei difetti chiusi nello storico.
  //
  // Round 3 (2026-07-25) — AR-096 aveva chiuso solo la salita. Restava aperta la DISCESA, che è peggio:
  // auto-fix leggeva `voto_salute_architettura` da auto-radiografia.json e oggi quel campo vale 0
  // (è la salute "pending-merge", con floor 0, non il voto architettura che lo storico traccia a 43).
  // Risultato: OGNI chiusura di difetto appendeva allo storico un voto 0, e la pagella —  che legge
  // l'ultima riga — vedeva il voto salute crollare da 43 a 0. Cioè: chiudere un freno di sicurezza
  // FACEVA PEGGIORARE il voto della macchina, punendo esattamente il comportamento che vogliamo.
  // Ora: se la radiografia non offre una misura utilizzabile (assente, non numerica o 0), il voto NON
  // si inventa e non si azzera — si RIPORTA l'ultimo noto, dicendo che non è stato ri-misurato.
  // Il voto si muove solo quando qualcuno lo misura davvero.
  const rad = readJson(RAD, {});
  const cantiere = readJson(CANTIERE, { meta: {} });
  const storico = readJson(STORICO, { serie: [] });
  storico.serie = storico.serie || [];

  const { voto, misurato } = votoSaluteDaRegistrare(rad, storico.serie);

  storico.serie.push({
    data: nowPiacenza().slice(0, 10),
    voto_salute: voto,
    voto_riportato: !misurato, // true = non ri-misurato qui, ereditato dall'ultima misura vera
    // AR-684 — «quanti ne restano» è tutto ciò che non è chiuso, non le sole schede etichettate
    // `aperto`: questa serie disegna il grafico dell'andamento nella Cabina, e per mesi ha lasciato
    // fuori le 56 `da-riverificare`, cioè ha fatto sembrare il cantiere più corto di quanto fosse.
    difetti_aperti: cantiere.meta?.da_fare ?? 0,
    // AR-784 — LO STESSO CAMPO NON PUÒ VOLER DIRE DUE COSE.
    //
    // Qui c'era `difetti_chiusi: chiusiOra`, cioè quanti ne ha chiusi QUESTA passata. Ma la sonda
    // scrive nello stesso campo della stessa serie il TOTALE dei chiusi nel cantiere. Misurato il
    // 22/8 sugli ultimi punti: 600, 606, 608 dalla sonda, poi 50 da qui. Chi legge la serie come un
    // andamento vede un crollo di 558 chiusure che non è mai avvenuto — e quella serie disegna il
    // grafico che Nicola guarda.
    //
    // Era incoerente perfino con il suo vicino di riga: `difetti_aperti` è un totale, preso da
    // `meta.da_fare`. Sulla stessa riga, uno stock e un flusso con nomi che non lo dicono.
    //
    // Adesso il campo porta lo STOCK, come chiunque altro lo scriva, e il flusso ha un nome suo.
    difetti_chiusi: cantiere.difetti?.filter?.((d) => d.stato === "chiuso").length ?? 0,
    chiusi_in_questa_passata: chiusiOra,
    tipo: "auto-fix",
    nota: misurato
      ? note
      : `${note} · voto salute NON ri-misurato (la radiografia non offre un voto utilizzabile): riportato ${voto} dall'ultima misura vera.`,
  });
  if (storico.serie.length > 90) storico.serie = storico.serie.slice(-90);
  writeJson(STORICO, storico);
  console.log(
    misurato
      ? `📈 ${chiusiOra} difetti chiusi · voto salute (dalla radiografia, non gonfiato): ${voto}.`
      : `📈 ${chiusiOra} difetti chiusi · voto salute non ri-misurato qui: riportato ${voto} (chiudere un difetto non abbassa il voto).`
  );
}

async function cmdVerifica(cantiere) {
  const applica = has("applica");
  const aperti = (cantiere.difetti || []).filter((d) => d.stato !== "chiuso");
  console.log(`\n🔧 AUTO-FIX — verifica cantiere (${aperti.length} non chiusi) — ${nowPiacenza()}\n`);
  if (!STORIA.intera) {
    console.log(`⚠️  GUARDIA ② NON CORROBORABILE — ${STORIA.motivo}.`);
    console.log(`   Le chiusure di questa esecuzione passeranno, ma marcate "corroborata": false.`);
    console.log(`   Per una verifica piena serve la storia intera: git fetch --unshallow.\n`);
  }
  // AR-429, clausola (b) — le chiusure vecchie diventano RIESAMINABILI solo se qualcuno le conta.
  // Non le riscriviamo (sarebbe riscrivere la storia per 183 righe): l'ASSENZA del campo è già il
  // segnale — «di questa chiusura non è mai stato registrato se fosse corroborata». Ma un segnale
  // che nessuno stampa non è riesaminabile: è solo assente. Quindi si stampa.
  const senzaCorroborazione = (cantiere.difetti || []).filter((d) => d.stato === "chiuso" && d.corroborata === undefined);
  if (senzaCorroborazione.length) {
    console.log(
      `📎 ${senzaCorroborazione.length} chiusure in archivio senza corroborazione registrata (chiuse prima di AR-429): non sono accusate, sono da riesaminare quando servirà.\n`,
    );
  }
  const daChiudere = [];
  const rifiutate = [];
  // AR-796 — le chiusure fermate dal cancello delle prove, tenute SEPARATE da quelle fermate dalla
  // guardia AR-330 (file mai cambiato). Sono due rifiuti diversi e chi legge deve poterli
  // distinguere: uno dice «questa prova non descrive una riparazione», l'altro «questa prova non
  // basta per un difetto di questo peso». Un unico mucchio nasconde quale delle due cure serve.
  const rifiutateDalCancello = [];
  const dichiaratiAperti = [];
  // AR-559 — le prove che il motore NON HA POTUTO ESEGUIRE. Prima finivano fra le «manuali» e
  // sparivano: un metro che non misura una strada non la dichiara scoperta, dice verde.
  const nonMisurate = [];
  for (const d of aperti) {
    const r = verificaFix(d);
    // ② LA GUARDIA DELLA CHIUSURA (AR-330): una prova soddisfatta non basta. Se fra la nascita del
    // difetto e adesso il file che la prova cita non è MAI cambiato, non c'è niente che possa averlo
    // risolto — e quella è la firma esatta delle 91 chiusure false del 27/7, dove fra le 09:40 e le
    // 12:15 su main non era atterrato un solo fix. Regola in prove-regole.mjs, fatti raccolti qui.
    const g = r.esito === "risolto"
      ? chiusuraAmmessa({ verifica: d.verifica, nato: d.nato, fileCambiatoDallaNascita: fileCambiatoDa(d.verifica?.file, d.nato) })
      : { ammessa: true };
    // ③ LA DICHIARAZIONE UMANA BATTE LA PROVA (AR-444). Sta PRIMA di tutto il resto: se qualcuno ha
    // guardato questo difetto e ha deciso che resta aperto, nessuna prova soddisfatta lo chiude. Il
    // caso che ha rotto: AR-396, dichiarato aperto in tre punti della PR #621 e richiuso lo stesso
    // dalla prova a pattern rimasta sulla scheda. Verdetto in chiusura-dichiarata.mjs, dove un test
    // lo può ESEGUIRE.
    // ④ IL CANCELLO DELLE PROVE (AR-796). Il verdetto adesso lo dà `verdettoChiusura`, che consulta
    // `ammissibilitaProva`: una prova soddisfatta ma non ammessa (orfana, oppure a pattern su un
    // difetto bloccante o ad alto impatto) NON chiude. Prima quei due cancelli li leggeva solo il
    // referto, che guarda e racconta — questo file, che chiude davvero, non li chiamava affatto.
    // Il mondo (l'unica domanda al disco) glielo passa il chiamante: la regola resta pura.
    const vc = verdettoChiusura(d, r.esito, { fileEsiste: (f) => existsSync(join(AD_ROOT, f)) });
    const bloccato = r.esito === "risolto" && !g.ammessa;
    // AR-559 — la distinzione la fa il CODICE del contratto, non la parola `esito`: «manuale»
    // significava tanto «l'ho lasciato a un umano» quanto «non l'ho saputo eseguire», ed è la
    // confusione che ha lasciato chiudere 53 schede su una prova mai eseguita.
    const cieca = r.codice === NON_MISURABILE;
    const icona = vc.bloccata
      ? "🔒 dichiarato aperto"
      : bloccato ? "🛑 rifiutata" : vc.inammissibile ? "⛔ prova non ammessa" : r.esito === "risolto" ? (vc.debole ? "✅ risolto (prova debole)" : "✅ risolto") : cieca ? "⚠️  NON MISURATO" : r.esito === "manuale" ? "🖐️  manuale" : "⏳ aperto";
    console.log(`${icona}  ${d.id} — ${d.titolo}`);
    console.log(`        ${vc.bloccata ? vc.motivo : bloccato ? g.motivo : vc.inammissibile ? vc.motivo : r.dettaglio}`);
    // AR-796 — la chiusura la decide `vc.chiude`, non una condizione riscritta qui. Prima questa
    // riga rifaceva il verdetto (`r.esito === "risolto" && g.ammessa`) e il `chiude` che la funzione
    // pura tornava veniva buttato: un verdetto che il chiamante ricalcola non decide niente, e i
    // cancelli aggiunti alla funzione non sarebbero mai arrivati fin qui.
    const dove = dovePuntaLaScheda({ vc, g, bloccato, cieca });
    if (dove === "dichiarati-aperti") dichiaratiAperti.push({ d, motivo: vc.motivo });
    else if (dove === "rifiutate-dal-cancello") rifiutateDalCancello.push({ d, motivo: vc.motivo, marca: vc.marca });
    else if (dove === "da-chiudere") daChiudere.push({ d, come: r.dettaglio, debole: vc.debole });
    else if (dove === "rifiutate") rifiutate.push({ d, motivo: g.motivo });
    else if (dove === "non-misurate") nonMisurate.push({ d, motivo: r.dettaglio });
  }
  if (nonMisurate.length) {
    // Il terzo esito del contratto di casa, stampato come tale: 0 = passato · 1 = violazione ·
    // 2 = NON HO POTUTO MISURARE. Senza questa riga il numero resta dentro le «manuali», dove
    // somiglia a una scelta invece che a un metro rotto.
    console.log(
      `\n⚠️  ${nonMisurate.length} prova/e NON MISURATE (codice 2): il comando c'è ma il motore non lo sa eseguire. Non è un verde e non è un rosso — è una prova che non ha detto niente. Riscrivila nella forma \`node cervello/<script>.mjs [--flag]\`.`,
    );
  }
  if (dichiaratiAperti.length) {
    console.log(
      `\n🔒 ${dichiaratiAperti.length} difetto/i NON chiusi perché dichiarati aperti da un umano: la prova risulta soddisfatta ma qualcuno ha guardato e deciso. Si sbloccano solo togliendo \`chiusura: "bloccata"\` dalla scheda — cioè con un'altra decisione umana.`,
    );
  }
  if (rifiutateDalCancello.length) {
    console.log(
      `\n⛔ ${rifiutateDalCancello.length} chiusura/e FERMATE dal cancello delle prove (AR-796): la prova risulta soddisfatta ma non è ammessa a chiudere un difetto di questo peso. Non è un difetto in più — è una chiusura che prima passava senza che nessuno guardasse. Si sbloccano dando alla scheda \`{"comando":"node cervello/test/<nome>.test.mjs"}\`, cioè una prova che diventa rossa se il difetto torna.`,
    );
    for (const x of rifiutateDalCancello) console.log(`   · ${x.d.id} — ${x.motivo}`);
  }
  if (rifiutate.length) {
    console.log(
      `\n🛑 ${rifiutate.length} chiusura/e RIFIUTATE dalla guardia AR-330: la prova risulta soddisfatta ma il file citato non è mai cambiato dalla nascita del difetto. Non è una riparazione — è una prova che descrive il bug. Riscrivila (meglio: {"comando":"node cervello/test/<nome>.test.mjs"}).`,
    );
  }
  if (!applica) {
    if (daChiudere.length) {
      console.log(`\n→ ${daChiudere.length} difetto/i risultano risolti nel codice. Chiudili: node cervello/auto-fix.mjs verifica --applica`);
    } else {
      console.log("\nNessun difetto auto-verificabile risulta risolto ora.");
    }
    // Difetti ancora aperti = proposte 🟡 da firmare
    const ancora = aperti.filter((d) => !daChiudere.some((x) => x.d.id === d.id));
    if (ancora.length) {
      console.log(`\n🟡 Ancora da risolvere (proposta di fix da firmare):`);
      for (const d of ancora) console.log(`  · ${d.id} [${d.impatto_crescita}] ${d.titolo} → ${d.fix_proposto}`);
    }
    return;
  }
  for (const { d, come } of daChiudere) {
    // AR-575 — la chiusura passa dal timbro unico: stato+data(con l'ora)+come in un punto solo.
    timbraChiusura(d, { come });
    // AR-429, clausola (b) — la chiusura porta scritto se la guardia ② l'ha davvero corroborata.
    // Senza questo campo una chiusura firmata al buio è indistinguibile da una controllata, e le
    // 183 già in archivio resterebbero «buone» per il solo fatto di essere lì. Marcarle è ciò che
    // le rende RIESAMINABILI: `corroborata: false` è una domanda aperta, non un'accusa.
    d.corroborata = STORIA.intera;
    if (!STORIA.intera) d.corroborata_nota = `storia troncata al momento della chiusura — ${STORIA.motivo}`;
  }
  ricalcolaMeta(cantiere);
  cantiere.aggiornato = nowPiacenza();
  writeJson(CANTIERE, cantiere);
  bumpSalute(daChiudere.length, `Auto-fix: chiusi ${daChiudere.map((x) => x.d.id).join(", ")} (verificati nel codice).`);
  console.log(`\n✅ Chiusi ${daChiudere.length}. Cantiere ora: ${cantiere.meta.da_fare} da fare (${cantiere.meta.aperti} aperti · ${cantiere.meta.in_corso} in corso · ${cantiere.meta.da_riverificare} da riverificare) · ${cantiere.meta.chiusi} chiusi su ${cantiere.meta.totale}.`);
}

function cmdChiudi(cantiere) {
  const id = arg("id");
  const come = arg("come", "chiusura manuale");
  if (!id) {
    console.error("❌ Serve --id. Es: node cervello/auto-fix.mjs chiudi --id=AR-002 --come=\"...\"");
    process.exit(2);
  }
  const d = (cantiere.difetti || []).find((x) => x.id === id);
  if (!d) {
    console.error(`❌ Difetto non trovato: ${id}`);
    process.exit(2);
  }
  // AR-444 — anche la porta A MANO passa dalla dichiarazione. Il freno va al CONFINE DELL'ATTO, non
  // su una sola delle strade che ci arrivano: guardare solo `verifica --applica` avrebbe lasciato
  // aperta proprio la porta che un umano usa quando ha fretta. Provato il 30/7: prima di questa
  // riga, `chiudi --id=AR-396` chiudeva un difetto dichiarato aperto senza dire niente.
  const blocco = chiusuraBloccata(d);
  if (blocco.bloccata && !has("forza")) {
    console.error(`🔒 ${id} è dichiarato aperto da un umano e non si chiude: ${blocco.motivo}`);
    console.error(`   Se la decisione è cambiata, togli \`chiusura: "bloccata"\` dalla scheda (o --forza, che resta scritto).`);
    process.exit(1);
  }
  // AR-559 — LA PORTA A MANO È QUELLA DA CUI SONO PASSATE TUTTE E 53. Misurato il 13/8: ogni
  // scheda del cantiere con un comando di prova che il motore non sa eseguire è CHIUSA, e nessuna
  // è passata dalla porta automatica — che quel comando lo rifiuta. Cioè: questa porta chiudeva in
  // silenzio esattamente ciò che l'altra si rifiutava di chiudere.
  //
  // Non la sbarro: un cancello sempre rosso viene aggirato al secondo giro, ed è la malattia che
  // stiamo curando, non la cura. La chiusura resta possibile e diventa DICHIARATA — sulla scheda,
  // dove un guardiano la ritrova, non in prosa dentro `chiuso_come` dove nessuno la cerca.
  const vp = verdettoProva(d.verifica);
  if (vp.codice === NON_MISURABILE) {
    d.prova_non_misurata = vp.motivo;
    console.error(`⚠️  ${id}: chiusa a mano su una prova che il motore NON sa eseguire — ${vp.motivo}`);
    // 23/8 (AR-796) — questa frase prometteva «e nel conto di cantiere-prove» dal 13/8 e quel conto
    // non esisteva: due sole occorrenze di `prova_non_misurata` in tutto il repo, tutt'e due qui.
    // Adesso il conto c'è per davvero (`chiuse_su_prova_non_misurata`), quindi la frase è vera.
    console.error(`   Resta scritto sulla scheda (\`prova_non_misurata\`) e nel conto \`chiuse_su_prova_non_misurata\` del referto di cantiere-prove: questa chiusura non è corroborata da nessuna esecuzione.`);
  }
  // ⛔ AR-796, LA PORTA A MANO. Trovata al secondo giro del lotto 51, ed è la malattia del lotto
  // stesso ripetuta un centimetro più in là: avevo montato il cancello sulla porta automatica e
  // stavo per consegnare lasciando aperta questa. È letteralmente AR-172 — «la porta a mano
  // riparata e quella automatica lasciata aperta», qui col verso invertito.
  //
  // NON LA SBARRO, e il motivo è scritto quindici righe più su per AR-559: un cancello sempre rosso
  // viene aggirato al secondo giro. Di là non c'è nessuno che guarda, quindi di là si RIFIUTA; qui
  // c'è una persona che ha scritto l'id a mano, quindi qui si DICHIARA. La differenza fra le due
  // porte non è la severità della regola: è chi c'è davanti.
  const amm = ammissibilitaProva(d, { fileEsiste: (f) => existsSync(join(AD_ROOT, f)) });
  if (!amm.ammessa) {
    d.chiusa_su_prova_non_ammessa = amm.motivo;
    console.error(`⛔ ${id}: chiusa a mano su una prova che il cancello NON ammette — ${amm.motivo}`);
    console.error(`   Dalla porta automatica questa chiusura sarebbe stata rifiutata. Resta scritto sulla scheda (\`chiusa_su_prova_non_ammessa\`) e nel conto \`chiuse_su_prova_non_ammessa\` del referto di cantiere-prove: è un numero che si può guardare scendere, non un silenzio.`);
  }
  // AR-575 — anche la porta A MANO passa dal timbro unico (lezione AR-172: mai due copie del timbro).
  timbraChiusura(d, { come: blocco.bloccata ? `${come} [FORZATA su una dichiarazione umana: ${blocco.motivo}]` : come });
  ricalcolaMeta(cantiere);
  cantiere.aggiornato = nowPiacenza();
  writeJson(CANTIERE, cantiere);
  bumpSalute(1, `Auto-fix: chiuso ${id} — ${come}`);
  console.log(`✅ Chiuso ${id}. Cantiere: ${cantiere.meta.da_fare} da fare · ${cantiere.meta.chiusi} chiusi su ${cantiere.meta.totale}.`);
}

/**
 * AR-336 — CHI RIGUARDA UN DIFETTO CHIUSO? (comando `rivedi-chiusi`)
 *
 * `cmdVerifica` filtra `d.stato !== "chiuso"`: una volta chiuso, un difetto non viene MAI più
 * verificato. Se la sua prova diventa rossa — qualcuno ha disfatto il fix senza accorgersene —
 * nessuno lo scopre, perché nessuno guarda.
 *
 * PERCHÉ NON RIESEGUE TUTTO. I chiusi sono 372: rilanciarne le prove a ogni giro costerebbe minuti
 * e nessuno lo terrebbe acceso. Ma non serve, e la misura lo dice: 215 di quelle prove sono file
 * della suite, che `test-cervello` rilancia interi a ogni lotto — lì la rete c'è già. Il buco vero
 * sono le prove ESEGUIBILI FUORI dalla suite, che oggi sono 12: quelle si rieseguono davvero.
 * (La scheda del 28/7 ne contava 4. Rimisurate il 13/8: 12. Un numero si rimisura, non si ricorda.)
 *
 * PERCHÉ NON RIAPRE DA SOLO. Riaprire su una prova diventata rossa per altri motivi sarebbe
 * peggio del buco: una prova può essere diventata vacua, o l'ambiente può mancare. Qui si SEGNALA
 * — «chiuso, e la sua prova adesso è rossa» — e la decisione resta di chi guarda.
 */
function cmdRivediChiusi(cantiere) {
  const cop = coperturaChiusi(cantiere.difetti || []);
  console.log(`\n🔁 RIVEDO I DIFETTI CHIUSI — ${nowPiacenza()}\n`);
  console.log(`   ${cop.suite.length} con la prova nella suite (test-cervello le rilancia a ogni lotto: la rete c'è)`);
  console.log(`   ${cop.fuori_suite.length} con la prova ESEGUIBILE fuori dalla suite → le rieseguo ORA (è il buco vero)`);
  console.log(`   ${cop.non_misurabili.length} chiuse su una prova che il motore NON sa eseguire (AR-559: niente da rieseguire)`);
  console.log(`   ${cop.deboli.length} chiuse da una prova a pattern · ${cop.senza_prova.length} chiuse senza nessuna prova\n`);

  const rosse = [];
  for (const v of cop.fuori_suite) {
    const r = eseguiProvaComando(v.comando);
    const ic = r.esito === "risolto" ? "✅" : r.codice === NON_MISURABILE ? "⚠️ " : "❌";
    console.log(`${ic} ${v.id} — ${v.comando}`);
    console.log(`      ${r.dettaglio}`);
    if (r.esito === "aperto") rosse.push({ id: v.id, comando: v.comando, dettaglio: r.dettaglio });
  }
  if (rosse.length) {
    console.log(
      `\n❌ ${rosse.length} difetto/i CHIUSI la cui prova adesso è ROSSA: ${rosse.map((x) => x.id).join(", ")}.`,
    );
    console.log(`   NON li riapro da solo (una prova può essere diventata vacua per conto suo): guardali e decidi.`);
  } else if (cop.fuori_suite.length) {
    console.log(`\n✅ Le ${cop.fuori_suite.length} prove rieseguibili fuori dalla suite reggono ancora.`);
  }
  // Ciò che NON ho potuto guardare, detto: è il codice 2 del contratto di casa, e senza questa
  // riga un «✅ reggono ancora» sopra 12 prove sembrerebbe un verde su tutte e 372.
  const cieche = cop.non_misurabili.length + cop.senza_prova.length;
  console.log(
    `\n⚠️  COPERTURA DICHIARATA: ho rieseguito ${cop.fuori_suite.length} prove su ${(cantiere.difetti || []).filter((d) => d.stato === "chiuso").length} difetti chiusi. Di ${cieche} non ho potuto misurare niente (nessuna prova eseguibile), e ${cop.suite.length} le copre la suite. Questo verde vale per ciò che ho eseguito, non per l'archivio.`,
  );
  return rosse;
}

function cmdReport(cantiere) {
  ricalcolaMeta(cantiere);
  console.log(`\n🚧 CANTIERE DIFETTI — ${cantiere.aggiornato || nowPiacenza()}`);
  console.log(`   ${cantiere.meta.da_fare} da fare · ${cantiere.meta.chiusi} chiusi · ${cantiere.meta.totale} schede in tutto`);
  // AR-684 — i tre stati vivi si dicono per nome. Il terzo era quello che spariva dai totali.
  console.log(`   di cui: ${cantiere.meta.aperti} aperti · ${cantiere.meta.in_corso} in corso · ${cantiere.meta.da_riverificare} da riverificare${cantiere.meta.altri ? ` · ${cantiere.meta.altri} in stati che non so nominare` : ""}\n`);
  for (const d of cantiere.difetti || []) {
    const ic = d.stato === "chiuso" ? "✅" : d.stato === "in-corso" ? "🔧" : "⏳";
    console.log(`${ic} ${d.id} [${d.impatto_crescita || "?"}] ${d.titolo}`);
    if (d.stato === "chiuso" && d.chiuso_come) console.log(`      chiuso ${d.chiuso_il}: ${d.chiuso_come}`);
  }
}

async function main() {
  const cmd = process.argv[2] || "report";
  const cantiere = readJson(CANTIERE, { aggiornato: nowPiacenza(), difetti: [], meta: {} });
  switch (cmd) {
    case "verifica":
      await cmdVerifica(cantiere);
      break;
    case "chiudi":
      cmdChiudi(cantiere);
      break;
    case "report":
      cmdReport(cantiere);
      break;
    case "rivedi-chiusi":
      cmdRivediChiusi(cantiere);
      break;
    default:
      console.error(`Comando sconosciuto: ${cmd}. Usa: verifica [--applica] | chiudi --id= | report | rivedi-chiusi`);
      process.exit(2);
  }
  await stampSegnale("auto-fix", "ok", `${cantiere.meta?.chiusi ?? 0} chiusi · ${cantiere.meta?.da_fare ?? 0} da fare · ${nowPiacenza()}`);
}

// Il CLI parte solo se questo file è LANCIATO, non quando un test ne importa
// votoSaluteDaRegistrare (importarlo non deve far girare una verifica del cantiere né scrivere segnali).
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(async (e) => {
    console.error("ERRORE auto-fix:", e.message || e);
    await stampSegnale("auto-fix", "errore", `crash: ${(e.message || e).toString().slice(0, 180)}`);
    process.exit(1);
  });
}
