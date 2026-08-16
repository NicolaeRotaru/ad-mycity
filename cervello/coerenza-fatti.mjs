#!/usr/bin/env node
// coerenza-fatti.mjs — FONTE UNICA DELLA VERITÀ + propagazione a cascata (AR-102).
//
// IL PROBLEMA CHE RISOLVE: un fatto-chiave (la data dell'onboarding, il negozio faro,
// una soglia decisa con Nicola) vive COPIATO in tanti file (coda, STATO, piani,
// intenzioni, consegne). Quando cambia, l'AI aggiorna i file che il prompt le dice —
// ma nessuno GARANTIVA la caccia a TUTTE le copie: il Pannello continuava a mostrare
// il valore vecchio come se fosse vero.
//
// LA REGOLA: ogni fatto-chiave ha UNA casa sola — MyCity-Vault/90-Memoria-AI/registro-fatti.json.
// Quando un fatto cambia, il valore vecchio entra in "caccia": questo guardiano cerca
// le copie vecchie nei file VIVI e FALLISCE (exit 3) finché ne resta una. giro.sh lo
// esegue a ogni giro e, se fallisce, passa un VINCOLO HARD al motore (stesso pattern
// di allocazione-check AR-081 / chiusura-loop PZ-008).
//
// I log STORICI sono esenti di default (la storia non si riscrive): DECISIONI.md,
// Briefing/, SALA-OPERATIVA.md, memoria-squadra/, auto-coscienza/.
//
// ─────────────────────────────────────────────────────────────────────────────
// AR-464 — VERIFICARE NON DEVE COSTARE UN DIFF
// ─────────────────────────────────────────────────────────────────────────────
// Questo guardiano riscriveva il suo file di stato a OGNI esecuzione, anche quando l'unica riga
// diversa era `data`. Chi lo lanciava per controllare il proprio lavoro — cioè esattamente il
// comportamento che si sta cercando di rendere abituale — si ritrovava un file modificato che non
// era lavoro suo. Il 30/7 è successo sei volte in una sessione e due volte quel file è finito in un
// commit, tolto poi con un amend. L'incentivo che ne esce è «non lanciare il guardiano se non devi»,
// cioè il contrario di quello che serve: un controllo che costa un diff si smette di fare, e un
// controllo che si smette di fare è spento.
//   · `--sola-lettura` → calcola, stampa il verdetto vero, non scrive NIENTE (né file né segnale);
//   · senza il flag il worker continua a scrivere come prima, perché lì il timestamp è il dato.
//
// USO:
//   node cervello/coerenza-fatti.mjs                      -> controlla (exit 0 ok · 3 incoerenze)
//   node cervello/coerenza-fatti.mjs --sola-lettura       -> come sopra, senza toccare niente
//   node cervello/coerenza-fatti.mjs --json               -> come sopra, stampa il report JSON
//   node cervello/coerenza-fatti.mjs registra <id> "<valore>" [--caccia "frase1|frase2"]
//        [--nome "..."] [--fonte "..."] [--esenzioni "path1|path2"] [--nuovo] [--dry] [--forza]
//        --nuovo: crea un fatto NUOVO. Senza --nuovo, un id sconosciuto è RIFIUTATO (anti-refuso).
//        --dry:   anteprima di cosa cambierebbe, senza scrivere nulla.
//   node cervello/coerenza-fatti.mjs lista                -> elenca i fatti e lo stato delle cacce
//   node cervello/coerenza-fatti.mjs chiudi-caccia <id> ["pattern"]  -> archivia caccia bonificata
//   node cervello/coerenza-fatti.mjs rimuovi <id>         -> elimina un fatto (errori/test)
//
// SICUREZZA ANTI-FALSI-POSITIVI (il gate deve essere credibile, mai "al lupo al lupo"):
//   - un pattern di caccia corto (<4 caratteri), una data secca (2026-07-06) o un numero
//     secco vengono RIFIUTATI senza --forza: matcherebbero timestamp/valori legittimi ovunque.
//     Usa una frase contestuale: «onboarding: 2026-07-06», non «2026-07-06».
//   - un pattern contenuto nel valore NUOVO viene rifiutato (matcherebbe il valore fresco).

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { nowPiacenza, stampSegnale } from "./git-github.mjs";
import { decidiScrittura, timbroProvenienza } from "./scrittura-misura.mjs";
// AR-464 · AR-446 — la penna passa dal writer condiviso, che consulta il freno della memoria
// (`cervello/casa-memoria.mjs`). Il `--sola-lettura` qui sotto ferma solo CHI LO SA: bastava che una
// prova lanciasse `registra` perché il registro dei fatti VERO — la fonte unica della verità — si
// riscrivesse, e con un `writeFileSync` che non è nemmeno atomico. Il freno sul dato invece lo
// ereditano tutti, anche gli script che questo lancia senza sapere cosa scrivono.
import { scriviJsonAtomico } from "./scrivi-json.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(QUI, "..");
/** AR-464 — «guarda ma non toccare»: chi verifica non lascia impronte nella memoria condivisa. */
const SOLA_LETTURA = process.argv.includes("--sola-lettura");
// Path del registro/report. Override via env (COERENZA_FATTI_REGISTRO/REPORT) SOLO per i test:
// così la suite bats esercita `registra` su un registro-fatti temporaneo senza toccare quello vero.
const REGISTRO = process.env.COERENZA_FATTI_REGISTRO
  ? resolve(process.env.COERENZA_FATTI_REGISTRO)
  : join(ROOT, "MyCity-Vault", "90-Memoria-AI", "registro-fatti.json");
const REPORT = process.env.COERENZA_FATTI_REPORT
  ? resolve(process.env.COERENZA_FATTI_REPORT)
  : join(ROOT, "MyCity-Vault", "90-Memoria-AI", "auto-coscienza", "coerenza-fatti.json");

// Dove si cercano le copie vecchie: i posti dove vive la memoria VIVA e gli artefatti.
//
// `pannello/src` aggiunto il 30/7, ed è il buco che questo guardiano aveva addosso da quando
// esiste. Il 20/7 Nicola ha corretto la macchina due volte sullo stesso punto (L-2026-0720-391 e
// L-2026-0720-413): la casella del pitch diceva «12%, zero fissi» mentre il registro diceva 10% +
// 50 €/mese — «non hai aggiornato la memoria centrale o le caselle non sono collegate». La memoria
// era giusta; era la SUPERFICIE a mentire. E questo guardiano, che esiste per garantire che nessuna
// copia vecchia sopravviva, guardava soltanto la memoria: sul codice del Pannello — cioè sull'unica
// cosa che Nicola vede davvero — rispondeva verde per costruzione.
//
// `cervello` resta FUORI apposta, e non per pigrizia: gli script di questa casa raccontano nei
// commenti quando e perché un valore è cambiato («al 25/7 vale 0 su 277»). È storia, la storia non
// si riscrive, ed è già esente per regola. Includerla darebbe falsi positivi su ogni fatto corretto,
// e un guardiano che grida sempre è un guardiano spento.
const RADICI_SCANSIONE = ["MyCity-Vault", "consegne", "creativi", "memoria-squadra", "pannello/src"];
const FILE_EXTRA = ["cervello/calendario-editoriale.json"]; // file vivi fuori dalle radici

// Esenzioni di DEFAULT: log storici/append-only (la storia non si riscrive) + file della
// macchina che citano legittimamente i valori vecchi (registro stesso, report, lezioni).
const ESENZIONI_DEFAULT = [
  "MyCity-Vault/90-Memoria-AI/DECISIONI.md",
  "MyCity-Vault/90-Memoria-AI/SALA-OPERATIVA.md",
  "MyCity-Vault/90-Memoria-AI/Briefing/",
  "MyCity-Vault/90-Memoria-AI/Report/",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/",
  "MyCity-Vault/90-Memoria-AI/registro-fatti.json",
  "memoria-squadra/",
];

const DIR_SALTATE = new Set([".git", "node_modules", ".obsidian", ".next", "marketplace"]);
// `.tsx`/`.ts` servono per `pannello/src`: senza, aggiungere la radice non cambierebbe niente —
// il guardiano camminerebbe dentro le cartelle del Pannello per poi scartare ogni file che trova.
const ESTENSIONI = new Set([".md", ".json", ".txt", ".csv", ".html", ".yml", ".yaml", ".ts", ".tsx"]);
const MAX_FILE_BYTES = 1_500_000;

function oraPiacenza() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Rome",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date());
}

// AR-597 — LA DECISIONE, pura ed esportata perché una prova la ESEGUA invece di rileggerla.
// Il buco: `leggiRegistro()` su registro ASSENTE tornava il default vuoto — zero fatti, zero cacce,
// zero incoerenze, exit 0 — e chi consuma questo guardiano come metro di verità (giro.sh,
// gate-pubblicazione.sh) leggeva un VERDE mentre la fonte della verità era sparita. La regola di
// casa: un metro che non può misurare dev'essere CIECO (e dirlo), non verde.
// La distinzione che conta: chi SCRIVE (`registra`) può legittimamente creare il registro la prima
// volta — il default vuoto è suo. Chi VERIFICA (`check`) su un registro assente non ha misurato
// niente: exit 2 («non ho potuto misurare», contratto AR-322), mai 0.
export function verdettoRegistroAssente({ esiste = false, scopo = "controllo" } = {}) {
  if (esiste || scopo === "scrittura") return { cieco: false, exit: 0, messaggio: null };
  return {
    cieco: true,
    exit: 2,
    messaggio:
      "⛔ CIECO: registro-fatti.json ASSENTE — il guardiano della verità non ha la sua fonte, quindi non ha misurato NIENTE. Questo non è un verde (AR-597).\n" +
      "   • Se il registro è stato spostato/cancellato: ripristinalo (MyCity-Vault/90-Memoria-AI/registro-fatti.json).\n" +
      '   • Se è davvero la prima volta: crealo con `node cervello/coerenza-fatti.mjs registra <id> "<valore>" --nuovo`.',
  };
}

/**
 * L'UNICA porta di scrittura del report (AR-464 · AR-568).
 *
 * Prima ce n'erano due — il ramo «cieco» e il ramo normale — ognuna con il suo `writeFileSync`
 * scritto a mano. Due porte vogliono dire due freni da ricordarsi, e quello che si dimentica è
 * sempre il secondo. Adesso la decisione è una sola e sta in `scrittura-misura.mjs`, dove un test la
 * esegue senza far girare il guardiano intero.
 *
 * @returns {{scrivi: boolean, motivo: string}} perché ha scritto o perché no — si stampa, non si ingoia.
 */
function scriviReport(report) {
  let precedente = null;
  let leggibile = true;
  // Un errore di lettura NON diventa «non c'era niente prima»: si dichiara, e la decisione lo tratta
  // come una riparazione dichiarata invece che come un confronto vinto.
  try {
    if (existsSync(REPORT)) precedente = JSON.parse(readFileSync(REPORT, "utf8"));
  } catch {
    leggibile = false;
  }
  const scelta = decidiScrittura({ solaLettura: SOLA_LETTURA, misuraNuova: report, misuraVecchia: precedente, vecchiaLeggibile: leggibile });
  if (scelta.scrivi) scriviJsonAtomico(REPORT, report);
  return scelta;
}

function leggiRegistro() {
  if (!existsSync(REGISTRO)) return { versione: 1, aggiornato: null, fatti: [] };
  const raw = readFileSync(REGISTRO, "utf8");
  const dati = JSON.parse(raw); // se è corrotto DEVE esplodere (fail-closed, mai passare in silenzio)
  if (!Array.isArray(dati.fatti)) dati.fatti = [];
  return dati;
}

function scriviRegistro(dati) {
  dati.aggiornato = oraPiacenza();
  // La fonte unica della verità (AR-102) è anche il file che due prove riscrivevano davvero, e a
  // metà di un crash sarebbe rimasta monca: qui la penna è atomica e passa dal freno della memoria.
  scriviJsonAtomico(REGISTRO, dati);
}

// Un pattern è "generico" se matcherebbe testo legittimo ovunque (timestamp, contatori).
function motivoPatternGenerico(pattern) {
  const p = pattern.trim();
  if (p.length < 4) return "troppo corto (<4 caratteri)";
  if (/^\d{4}-\d{2}-\d{2}$/.test(p)) return "data secca: matcherebbe ogni timestamp di quel giorno (usa una frase: «onboarding: " + p + "»)";
  if (/^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(p)) return "data secca (g/m): troppi falsi positivi (usa una frase contestuale)";
  if (/^[\d.,€%\s]+$/.test(p)) return "solo numeri/simboli: matcherebbe valori legittimi ovunque";
  return null;
}

function estensioneDi(nome) {
  const i = nome.lastIndexOf(".");
  return i >= 0 ? nome.slice(i).toLowerCase() : "";
}

// Distanza di edit (Levenshtein) per suggerire l'id giusto quando `registra` riceve un id inesistente.
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[n];
}

// Un id esistente è "simile" a quello digitato se condivide il prefisso prima del primo punto,
// se uno contiene l'altro, o se è a ≤2 correzioni di distanza (refusi tipo negozio.far→negozio.faro).
function idSimile(esistente, cercato) {
  const a = String(esistente).toLowerCase();
  const b = String(cercato).toLowerCase();
  if (a === b || a.includes(b) || b.includes(a)) return true;
  const pa = a.split(".")[0];
  const pb = b.split(".")[0];
  if (pa && pa === pb) return true;
  return levenshtein(a, b) <= 2;
}

// Cammina le radici e ritorna i path (relativi a ROOT, separatore "/") dei file testuali vivi.
function fileDaScansionare() {
  const out = [];
  const walk = (abs) => {
    let voci;
    try { voci = readdirSync(abs, { withFileTypes: true }); } catch { return; }
    for (const v of voci) {
      if (v.name.startsWith(".") && v.name !== ".") continue;
      const pieno = join(abs, v.name);
      if (v.isDirectory()) {
        if (DIR_SALTATE.has(v.name)) continue;
        walk(pieno);
      } else if (v.isFile() && ESTENSIONI.has(estensioneDi(v.name))) {
        try { if (statSync(pieno).size > MAX_FILE_BYTES) continue; } catch { continue; }
        out.push(relative(ROOT, pieno).split(sep).join("/"));
      }
    }
  };
  for (const r of RADICI_SCANSIONE) walk(join(ROOT, r));
  for (const f of FILE_EXTRA) if (existsSync(join(ROOT, f))) out.push(f);
  return out;
}

function esente(relPath, esenzioniFatto) {
  const tutte = [...ESENZIONI_DEFAULT, ...(esenzioniFatto || [])];
  return tutte.some((e) => relPath === e || relPath.startsWith(e));
}

// ---------- CHECK ----------
async function check({ json = false } = {}) {
  // AR-597: chi VERIFICA su un registro assente è CIECO, non verde. Prima di questo blocco il check
  // passava dal default vuoto di `leggiRegistro()` e usciva 0 con «✅ Memoria coerente» a registro
  // sparito — riprodotto dalla radiografia spostando il file. Il report resta scritto (esito
  // «cieco») così il Pannello vede la stessa verità del terminale.
  const assente = verdettoRegistroAssente({ esiste: existsSync(REGISTRO), scopo: "controllo" });
  if (assente.cieco) {
    const report = {
      data: oraPiacenza(),
      esito: "cieco",
      copertura: 0,
      ...timbroProvenienza({ env: process.env, scrittoDa: "coerenza-fatti.mjs" }),
      fatti_totali: null,
      cacce_aperte: null,
      file_scansionati: 0,
      incoerenze: [],
      cacce: [],
      istruzioni: assente.messaggio,
    };
    scriviReport(report);
    if (json) console.log(JSON.stringify(report, null, 2));
    console.error(assente.messaggio);
    if (!SOLA_LETTURA) await stampSegnale("coerenza-fatti", "warn", `CIECO: registro-fatti.json assente · ${nowPiacenza()}`);
    process.exit(assente.exit);
  }

  let registro;
  try {
    registro = leggiRegistro();
  } catch (e) {
    console.error(`⛔ registro-fatti.json ILLEGGIBILE (${e.message}) — il registro è la fonte di verità: sistemalo prima di fidarti della memoria.`);
    process.exit(1);
  }

  const cacce = [];
  for (const f of registro.fatti) {
    for (const c of f.caccia || []) {
      if (c.chiusa) continue;
      cacce.push({ fatto: f.id, valore_nuovo: f.valore, pattern: c.pattern, dal: c.dal || null, esenzioni: f.esenzioni || [] });
    }
  }

  const incoerenze = [];
  let fileScansionati = 0;
  if (cacce.length) {
    for (const rel of fileDaScansionare()) {
      const cacceQui = cacce.filter((c) => !esente(rel, c.esenzioni));
      if (!cacceQui.length) continue;
      let testo;
      try { testo = readFileSync(join(ROOT, rel), "utf8"); } catch { continue; }
      fileScansionati++;
      const testoLower = testo.toLowerCase();
      const daCercare = cacceQui.filter((c) => testoLower.includes(c.pattern.toLowerCase()));
      if (!daCercare.length) continue;
      const righe = testo.split("\n");
      for (let i = 0; i < righe.length; i++) {
        const rigaLower = righe[i].toLowerCase();
        for (const c of daCercare) {
          if (rigaLower.includes(c.pattern.toLowerCase())) {
            incoerenze.push({
              fatto: c.fatto,
              pattern: c.pattern,
              valore_nuovo: c.valore_nuovo,
              file: rel,
              riga: i + 1,
              testo: righe[i].trim().slice(0, 200),
            });
          }
        }
      }
    }
  }

  // Stato di bonifica per caccia: 0 match = bonificata (chiudibile), >0 = da propagare.
  const perCaccia = cacce.map((c) => ({
    fatto: c.fatto,
    pattern: c.pattern,
    dal: c.dal,
    copie_trovate: incoerenze.filter((x) => x.fatto === c.fatto && x.pattern === c.pattern).length,
  }));

  const report = {
    data: oraPiacenza(),
    // AR-211 — un verde si può dare solo dopo aver LETTO qualcosa. Il guardiano scansiona i file
    // solo quando c'è una «caccia» aperta (un fatto appena cambiato da propagare); a cacce zero
    // leggeva zero file e scriveva lo stesso `ok`, cioè «memoria coerente» senza aver aperto niente.
    // È nato per un caso preciso — propagare un valore CAMBIATO — ed è stato letto come se misurasse
    // la coerenza dello stato corrente. Ora dice quello che ha fatto: `non_verificato`, che nel
    // Pannello e nei gate non è un rosso ma nemmeno un verde comprato a credito.
    esito: incoerenze.length ? "incoerenze" : fileScansionati > 0 ? "ok" : "non_verificato",
    copertura: fileScansionati,
    // AR-568 (a) · AR-286 — DA DOVE viene questo verdetto. `copertura` c'era già ed è il numero
    // giusto (quanti file vivi ho davvero aperto); mancava il punto d'osservazione, senza il quale
    // «cieco non sovrascrive vedente» non è nemmeno scrivibile: due coperture non si confrontano se
    // non si sa chi le ha prese.
    ...timbroProvenienza({ env: process.env, scrittoDa: "coerenza-fatti.mjs" }),
    fatti_totali: registro.fatti.length,
    cacce_aperte: cacce.length,
    file_scansionati: fileScansionati,
    incoerenze,
    cacce: perCaccia,
    esenzioni_default: ESENZIONI_DEFAULT,
    istruzioni: incoerenze.length
      ? "Riscrivi ogni file elencato col valore nuovo del fatto, poi riesegui `node cervello/coerenza-fatti.mjs` finché passa. Le cacce con 0 copie sono bonificate: chiudile con `chiudi-caccia <id>`."
      : fileScansionati > 0
        ? "Memoria coerente: nessuna copia vecchia nei file vivi."
        : "NON VERIFICATO: nessuna caccia aperta, quindi non è stato letto alcun file. Non è un verde — è l'assenza di una misura (AR-211).",
  };
  const scelta = scriviReport(report);

  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`🧭 Coerenza-fatti — fatti: ${report.fatti_totali} · cacce aperte: ${report.cacce_aperte} · file vivi scansionati: ${fileScansionati}${fileScansionati === 0 ? " → NON VERIFICATO (AR-211: nessun file letto, nessun verde)" : ""}`);
    if (!registro.fatti.length) {
      console.log("   Registro vuoto: nessun fatto-chiave ancora registrato (si popola al prossimo giro / alla prossima decisione).");
    }
    if (incoerenze.length) {
      console.log(`⛔ ${incoerenze.length} copie VECCHIE ancora in file vivi:`);
      for (const x of incoerenze.slice(0, 20)) {
        console.log(`   - [${x.fatto}] ${x.file}:${x.riga} → «${x.testo.slice(0, 90)}» (vecchio: «${x.pattern}» · nuovo: «${x.valore_nuovo}»)`);
      }
      if (incoerenze.length > 20) console.log(`   … e altre ${incoerenze.length - 20} (vedi ${relative(ROOT, REPORT)})`);
      console.log("   → Riscrivi quei file col valore nuovo e riesegui il check.");
    } else {
      const bonificate = perCaccia.filter((c) => c.copie_trovate === 0);
      if (bonificate.length) {
        console.log(`✅ Coerente. Cacce bonificate (chiudibili con chiudi-caccia): ${bonificate.map((c) => `${c.fatto}«${c.pattern}»`).join(" · ")}`);
      } else {
        console.log("✅ Memoria coerente.");
      }
    }
    console.log(`   report: ${relative(ROOT, REPORT)}${scelta.scrivi ? "" : ` — NON riscritto: ${scelta.motivo}`}`);
  }
  // AR-373 (lotto 33): il battito. `freschezza-segnali.mjs` aspettava un segnale «coerenza-fatti»
  // che questo script non ha mai mandato — perché l'elenco degli attesi era scritto a mano e non è
  // mai stato confrontato con chi il battito lo emette davvero. Risultato: un vincolo acceso a ogni
  // giro, da sempre, che si legge come sfondo. Un guardiano perennemente rosso costa quanto uno
  // spento. Adesso l'attesa è vera; e dall'altra parte l'elenco non si scrive più a mano.
  // Il segnale è una scrittura come le altre: in sola lettura non parte, o il «guardo e non tocco»
  // sarebbe vero per il file e falso per la memoria.
  if (!SOLA_LETTURA) {
    await stampSegnale("coerenza-fatti", incoerenze.length ? "warn" : "ok", `${incoerenze.length} copie vecchie in file vivi · ${nowPiacenza()}`);
  }
  process.exit(incoerenze.length ? 3 : 0);
}

// ---------- REGISTRA ----------
function parseFlags(argv) {
  const pos = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const k = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) { flags[k] = next; i++; }
      else flags[k] = true;
    } else pos.push(a);
  }
  return { pos, flags };
}

function registra(argv) {
  const { pos, flags } = parseFlags(argv);
  const [id, valore] = pos;
  if (!id || valore === undefined) {
    console.error('Uso: registra <id> "<valore>" [--caccia "frase1|frase2"] [--nome "..."] [--fonte "..."] [--esenzioni "p1|p2"] [--nuovo] [--dry] [--forza]');
    process.exit(1);
  }
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(id)) {
    console.error(`⛔ id non valido: «${id}» (usa lettere/numeri/punti, es. onboarding.data)`);
    process.exit(1);
  }
  const forza = Boolean(flags.forza);
  const dry = Boolean(flags.dry || flags["dry-run"]);
  const ora = oraPiacenza();
  const registro = leggiRegistro();
  let fatto = registro.fatti.find((f) => f.id === id);
  const nuovo = !fatto;
  const valoreVecchio = fatto?.valore;

  // 🛡️ ANTI-CASINO (richiesta di Nicola): `registra` su un id INESISTENTE non crea un fatto in
  // silenzio — un refuso come «negozio.far» duplicherebbe «negozio.faro» e il Pannello mostrerebbe
  // DUE verità. Su id sconosciuto ci si ferma e si suggerisce l'id giusto; per creare DAVVERO un
  // fatto nuovo serve --nuovo esplicito. Così «scrivere in chat» colpisce sempre PROPRIO quel dato.
  if (nuovo && !flags.nuovo && !forza) {
    const simili = registro.fatti.map((f) => f.id).filter((fid) => idSimile(fid, id)).slice(0, 5);
    console.error(`⛔ Fatto «${id}» NON esiste nel registro: non lo creo per sbaglio.`);
    if (simili.length) console.error(`   Forse intendevi un id esistente: ${simili.join(" · ")}`);
    console.error(`   • CORREGGERE un fatto esistente → usa l'id giusto (\`node cervello/coerenza-fatti.mjs lista\`).`);
    console.error(`   • CREARE davvero un fatto nuovo → aggiungi --nuovo.`);
    process.exit(1);
  }

  if (nuovo) {
    fatto = { id, nome: flags.nome || id, valore, fonte: flags.fonte || "", aggiornato: ora, storia: [], caccia: [], esenzioni: [] };
    registro.fatti.push(fatto);
    registro.fatti.sort((a, b) => a.id.localeCompare(b.id));
  } else if (valoreVecchio !== valore) {
    fatto.storia = fatto.storia || [];
    fatto.storia.push({ valore: valoreVecchio, fino_a: ora });
    fatto.valore = valore;
    fatto.aggiornato = ora;
    if (flags.fonte) fatto.fonte = flags.fonte;
    if (flags.nome) fatto.nome = flags.nome;
  } else {
    console.log(`= Fatto «${id}» già a «${valore}»: nessun cambio.`);
  }
  if (flags.esenzioni) {
    fatto.esenzioni = String(flags.esenzioni).split("|").map((s) => s.trim()).filter(Boolean);
  }

  // Costruisci le cacce: quelle passate con --caccia + (se distintivo) il valore vecchio stesso.
  const candidate = [];
  if (flags.caccia) candidate.push(...String(flags.caccia).split("|").map((s) => s.trim()).filter(Boolean));
  if (!nuovo && valoreVecchio && valoreVecchio !== valore && !candidate.includes(valoreVecchio)) {
    if (!motivoPatternGenerico(valoreVecchio) && !valore.toLowerCase().includes(valoreVecchio.toLowerCase())) {
      candidate.push(valoreVecchio); // il vecchio valore è distintivo → caccialo direttamente
    } else if (!candidate.length) {
      console.log(`⚠️  Il valore vecchio «${valoreVecchio}» è troppo generico per la caccia automatica: passa una frase contestuale con --caccia "…${valoreVecchio}…" (la propagazione senza caccia NON è verificabile).`);
    }
  }

  fatto.caccia = fatto.caccia || [];
  for (const p of candidate) {
    if (fatto.caccia.some((c) => !c.chiusa && c.pattern.toLowerCase() === p.toLowerCase())) continue;
    const motivo = motivoPatternGenerico(p);
    if (motivo && !forza) {
      console.error(`⛔ Pattern di caccia RIFIUTATO «${p}»: ${motivo}. (--forza per forzare, ma i falsi positivi rendono il gate inaffidabile.)`);
      continue;
    }
    if (valore.toLowerCase().includes(p.toLowerCase()) && !forza) {
      console.error(`⛔ Pattern RIFIUTATO «${p}»: è contenuto nel valore NUOVO «${valore}» → matcherebbe per sempre anche il dato fresco.`);
      continue;
    }
    fatto.caccia.push({ pattern: p, dal: ora });
    console.log(`${dry ? "[DRY] aprirei caccia su" : "🎯 Caccia aperta su"} «${p}» (fatto ${id}).`);
  }

  if (dry) {
    const azione = nuovo ? "creerei" : valoreVecchio !== valore ? "aggiornerei" : "lascerei invariato";
    console.log(`[DRY] ${azione} «${id}» = «${valore}»${valoreVecchio && valoreVecchio !== valore ? ` (era «${valoreVecchio}»)` : ""} — nessuna scrittura eseguita.`);
    return;
  }
  scriviRegistro(registro);
  console.log(`${nuovo ? "✚ Registrato" : "✓ Aggiornato"} fatto «${id}» = «${valore}»${valoreVecchio && valoreVecchio !== valore ? ` (era: «${valoreVecchio}»)` : ""} · ${ora}`);
  if (fatto.caccia.some((c) => !c.chiusa)) {
    console.log("→ Ora PROPAGA: riscrivi i file vivi che citano il valore vecchio, poi verifica con `node cervello/coerenza-fatti.mjs` finché passa.");
  }
}

// ---------- LISTA / CHIUDI-CACCIA / RIMUOVI ----------
function lista() {
  const registro = leggiRegistro();
  if (!registro.fatti.length) { console.log("Registro vuoto: nessun fatto-chiave registrato."); return; }
  console.log(`📒 Registro dei fatti (${registro.fatti.length}) — aggiornato ${registro.aggiornato || "?"}`);
  for (const f of registro.fatti) {
    const aperte = (f.caccia || []).filter((c) => !c.chiusa);
    console.log(`  • ${f.id} = «${f.valore}» (${f.nome || ""}) · agg. ${f.aggiornato}${f.fonte ? ` · fonte: ${f.fonte}` : ""}`);
    for (const c of aperte) console.log(`      🎯 caccia aperta: «${c.pattern}» (dal ${c.dal})`);
    for (const s of f.storia || []) console.log(`      ↺ era «${s.valore}» fino a ${s.fino_a}`);
  }
}

function chiudiCaccia(argv) {
  const [id, pattern] = argv;
  if (!id) { console.error('Uso: chiudi-caccia <id> ["pattern"] (senza pattern: chiude tutte le cacce del fatto)'); process.exit(1); }
  const registro = leggiRegistro();
  const fatto = registro.fatti.find((f) => f.id === id);
  if (!fatto) { console.error(`⛔ Fatto «${id}» non trovato.`); process.exit(1); }
  const ora = oraPiacenza();
  let chiuse = 0;
  for (const c of fatto.caccia || []) {
    if (c.chiusa) continue;
    if (pattern && c.pattern.toLowerCase() !== pattern.toLowerCase()) continue;
    c.chiusa = ora;
    chiuse++;
  }
  scriviRegistro(registro);
  console.log(chiuse ? `✓ Chiuse ${chiuse} cacce su «${id}».` : `Nessuna caccia aperta corrispondente su «${id}».`);
}

function rimuovi(argv) {
  const [id] = argv;
  if (!id) { console.error("Uso: rimuovi <id>"); process.exit(1); }
  const registro = leggiRegistro();
  const prima = registro.fatti.length;
  registro.fatti = registro.fatti.filter((f) => f.id !== id);
  if (registro.fatti.length === prima) { console.error(`⛔ Fatto «${id}» non trovato.`); process.exit(1); }
  scriviRegistro(registro);
  console.log(`✓ Rimosso fatto «${id}».`);
}

// ---------- MAIN ----------
// Main-guard (AR-597): senza, il modulo PARTIVA importandolo e nessun test poteva eseguire la
// decisione pura qui sopra — lo stesso pattern di cancello-stop.mjs.
if (import.meta.url === `file://${process.argv[1]}`) {
const argv = process.argv.slice(2);
const cmd = argv[0];
if (!cmd || cmd === "check" || cmd === "--json" || cmd === "--gate" || cmd === "--sola-lettura") {
  await check({ json: argv.includes("--json") });
} else if (cmd === "registra") {
  registra(argv.slice(1));
} else if (cmd === "lista") {
  lista();
} else if (cmd === "chiudi-caccia") {
  chiudiCaccia(argv.slice(1));
} else if (cmd === "rimuovi") {
  rimuovi(argv.slice(1));
} else if (cmd === "--aiuto" || cmd === "--help" || cmd === "-h") {
  console.log(`coerenza-fatti.mjs — fonte unica della verità + propagazione a cascata (AR-102)

Comandi:
  (niente) | check [--json]      controlla la coerenza (exit 0 ok · 3 incoerenze)
  registra <id> "<valore>" [--caccia "f1|f2"] [--nome ...] [--fonte ...] [--esenzioni "p1|p2"] [--nuovo] [--dry] [--forza]
                                 (--nuovo: crea un fatto NUOVO · senza --nuovo un id sconosciuto è RIFIUTATO · --dry: anteprima, non scrive)
  lista                          elenca fatti, cacce aperte e storia
  chiudi-caccia <id> [pattern]   archivia una caccia bonificata (0 copie trovate)
  rimuovi <id>                   elimina un fatto (errori/test)

Registro:  MyCity-Vault/90-Memoria-AI/registro-fatti.json
Report:    MyCity-Vault/90-Memoria-AI/auto-coscienza/coerenza-fatti.json`);
} else {
  console.error(`Comando sconosciuto: ${cmd} (usa --aiuto)`);
  process.exit(1);
}
}
