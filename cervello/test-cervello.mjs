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

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { cpus } from "node:os";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const SERIALE = process.argv.includes("--seriale");
const SOLO = (() => {
  const i = process.argv.indexOf("--solo");
  return i >= 0 ? process.argv[i + 1] : null;
})();
const CARTELLA = "cervello/test";
// Ogni file gira già nel suo processo: le corsie sono quanti processi tenere accesi insieme.
const CORSIE = SERIALE ? 1 : Math.max(2, Math.min(8, cpus().length));

/** Trova i test del cervello. Pura sulla lettura della cartella: il test la prova con una finta. */
export function trovaTest(elenco = []) {
  return elenco.filter((f) => f.endsWith(".test.mjs")).sort();
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
  return rosse;
}

/**
 * Verdetto da un esito di spawn. Distingue ROTTO (asserzioni rosse: il codice ha un difetto) da
 * INESEGUIBILE (il file non parte affatto): sono due guasti diversi e chiedono due mosse diverse.
 */
export function verdetto(status, out) {
  const { passati, falliti } = leggiTap(out);
  if (status === 0 && passati !== null) return { esito: "ok", motivo: "", passati, falliti };
  // ⚠️ L'ordine di questi due controlli è il difetto che la controprova mi ha trovato addosso il
  // 25/7. `node --test` su un file che non si CARICA lo riporta lo stesso in TAP, come «1 test, 1
  // fallito»: quindi il conteggio c'è, e la prima versione lo classificava «rosso — asserzioni
  // fallite». Ma un file che non parte non ha asserzioni: dire «rosso» manda a cercare un bug che
  // non c'è, mentre il guasto è l'import. È esattamente la distinzione per cui esiste AR-156.
  // Quindi: prima si guarda se il modulo si carica, POI si guarda il TAP.
  const testo = String(out || "");
  const mod = testo.match(/Cannot find module '([^']+)'/);
  if (mod || /ERR_MODULE_NOT_FOUND|ERR_UNSUPPORTED_DIR_IMPORT/.test(testo)) {
    return { esito: "ineseguibile", motivo: `import non risolvibile${mod ? `: ${mod[1]}` : ""}`, passati, falliti };
  }
  if (passati === null) {
    return { esito: "ineseguibile", motivo: "il file non è nemmeno partito", passati, falliti };
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
    const p = spawn(process.execPath, ["--import", join(dir, "hook-ts.mjs"), "--test", "--test-reporter=tap", join(dir, f)], {
      cwd: AD_ROOT,
    });
    let uscita = "";
    p.stdout.on("data", (d) => (uscita += d));
    p.stderr.on("data", (d) => (uscita += d));
    // Un processo che non parte proprio (`error`) non è «zero asserzioni fallite»: è ineseguibile,
    // e `verdetto` lo classifica così solo se gli arriva un'uscita non nulla e nessun TAP.
    p.on("error", (e) => risolvi({ file: `${CARTELLA}/${f}`, ...verdetto(1, `${uscita}\n${e.message}`) }));
    p.on("close", (code) => risolvi({ file: `${CARTELLA}/${f}`, ...verdetto(code, uscita) }));
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
  const quando = nowPiacenza();
  const dir = join(AD_ROOT, CARTELLA);
  if (!existsSync(dir)) {
    console.error(`❌ cartella non trovata: ${CARTELLA}`);
    process.exit(1);
  }
  let file = trovaTest(readdirSync(dir));
  if (SOLO) file = file.filter((f) => f.includes(SOLO));
  if (!file.length) {
    console.error(
      SOLO
        ? `❌ nessun test .test.mjs contiene «${SOLO}»: il filtro non ha misurato niente.`
        : `❌ nessun test .test.mjs in ${CARTELLA}: il cervello non ha rete.`,
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
  const vaInFila = (f) => {
    try {
      return scriveSulDatoVivo(readFileSync(join(dir, f), "utf8"));
    } catch (e) {
      illeggibili.push(`${f}: non ho potuto leggerlo (${e.message}) → in fila per prudenza`);
      return true;
    }
  };
  const inFila = file.filter(vaInFila);
  const liberi = file.filter((f) => !inFila.includes(f));
  const righe = [
    ...(await aCorsie(liberi, CORSIE, (f) => eseguiTest(dir, f))),
    ...(await aCorsie(inFila, 1, (f) => eseguiTest(dir, f))),
  ].sort((a, b) => a.file.localeCompare(b.file));
  const rotti = righe.filter((x) => x.esito !== "ok");
  const totale = righe.reduce((n, x) => n + (x.passati || 0), 0);

  if (JSON_MODE) {
    console.log(
      JSON.stringify(
        { esito: rotti.length ? "rotti" : "ok", quando, asserzioni: totale, corsie: CORSIE, in_fila: inFila, illeggibili, test: righe },
        null,
        2,
      ),
    );
    process.exitCode = rotti.length ? 1 : 0;
    return;
  }

  console.log(`\n🧪 TEST DEL CERVELLO — ${quando}  (${CORSIE} corsie · ${inFila.length} in fila perché scrivono sul dato vivo)\n`);
  for (const m of illeggibili) console.log(`  ⚠️  ${m}`);
  for (const x of righe) {
    const icona = x.esito === "ok" ? "✅" : x.esito === "ineseguibile" ? "🚫" : "❌";
    console.log(`  ${icona} ${x.file}${x.passati != null ? `  (${x.passati} passati)` : ""}`);
    if (x.motivo) console.log(`      ${x.motivo}`);
    // QUALE asserzione, non solo quante (AR-450): è la riga che rende un rosso in CI diagnosticabile
    // senza ripubblicare a tentativi.
    for (const r of x.rosse || []) console.log(`      ✗ ${r}`);
  }
  if (!rotti.length) {
    console.log(`\n✅ ${righe.length} file, ${totale} asserzioni: girano tutti e passano tutti.`);
    process.exitCode = 0;
    return;
  }
  console.log(`\n❌ ${rotti.length} su ${righe.length} non danno garanzie.`);
  console.log(`   Un test che non gira non è una rete: è un file che fa sembrare coperto ciò che non lo è.`);
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) main();
