#!/usr/bin/env node
// 🧪 LE MUTAZIONI CHE NESSUNO PUÒ ESEGUIRE — il verde comprato di `non-vacuita.mjs`.
//
// ─────────────────────────────────────────────────────────────────────────────
// IL DIFETTO (AR-840)
// ─────────────────────────────────────────────────────────────────────────────
// `non-vacuita.mjs` rompe apposta un fix e pretende che la sua prova diventi rossa. È il guardiano
// che tiene in piedi tutti gli altri: senza, «difetto chiuso» vuol dire solo «qualcuno l'ha scritto».
//
// Lanciava la prova così: `spawnSync("node", [m.test])`. Cioè dava per scontato che `m.test` fosse
// sempre un percorso .mjs. Dove c'era una riga di comando — `"node cervello/permessi-check.mjs"` —
// girava `node "node cervello/permessi-check.mjs"`: nessun file, MODULE_NOT_FOUND, uscita 1. Dove
// c'era un `.bats`, girava `node <script bash>`: SyntaxError, uscita 1.
//
// **Un'uscita ≠ 0 è come `non-vacuita` riconosce «la prova è diventata rossa».** Quindi quelle voci
// risultavano SEMPRE verificate, qualunque cosa facesse la mutazione — anche se il fix non era
// coperto da niente. Non era una svista di forma: era il metro della copertura che si dava buono
// da solo.
//
// LA CURA (28/8) sta a monte, in `esecuzione-prova.mjs`: la decisione di COME si esegue un `test`
// è diventata una funzione pura che sa leggere anche una riga di comando e sa lanciare un `.bats`
// col programma giusto. `non-vacuita.mjs` la usa per eseguire; questo file la usa per contare. Un
// metro solo per le due domande, altrimenti il debito misurato non è quello che il banco patisce.
//
// ─────────────────────────────────────────────────────────────────────────────
// IL VERSO DEL FRENO
// ─────────────────────────────────────────────────────────────────────────────
// Il debito ereditato si CONTA, quello nuovo si BLOCCA: stesso patto di `debito-prove-bash.mjs`.
// Il tetto scende e non risale. Chi aggiunge una mutazione con un `test` che il banco non sa
// lanciare — un programma fuori dalla lista bianca, una riga che vuole una shell, un file che non
// c'è — non sta aggiungendo copertura: sta aggiungendo un verde.
//
// Uscite (AR-322): 0 sotto il tetto · 1 cresciuto · 2 non ho potuto misurare.

import { existsSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { AD_ROOT } from "./git-github.mjs";
import { comeSiEsegue } from "./esecuzione-prova.mjs";

// Puntabili altrove per il test — stessa forma di `non-vacuita.mjs`. Senza, l'unico modo di provare
// questo strumento sarebbe rompere una mutazione vera del registro, e una prova che guarda com'e' il
// mondo adesso resta verde anche a strumento rimosso.
const MUTANTI = process.env.MUTANTI_FILE || join(AD_ROOT, "cervello/mutanti.json");
const TETTI = process.env.TETTI_FILE || join(AD_ROOT, "cervello/tetti-lotto.json");
const JSON_MODE = process.argv.includes("--json");

/**
 * Un `test` è eseguibile così com'è?
 *
 * ⚠️ IL METRO È UNO SOLO (AR-840). La domanda vera non è «assomiglia a un percorso?»: è **«il banco
 * delle mutazioni riuscirebbe davvero a lanciarlo?»**. Quella decisione vive in
 * `esecuzione-prova.mjs` ed è la STESSA che `non-vacuita.mjs` usa per lanciare. Qui si aggiunge solo
 * ciò che la funzione pura non può sapere: i file esistono su questo disco?
 *
 * Finché le due regole erano separate — qui «uno spazio = non eseguibile», là `spawnSync("node",
 * [test])` — il contatore misurava un debito diverso da quello che il banco pativa. Due elenchi e
 * due metri: è il modo più sicuro di avere un numero che non descrive niente.
 *
 * `esiste` è iniettato perché il giudizio si possa provare senza toccare il disco.
 */
export function testEseguibile(test, esiste = () => false) {
  if (typeof test !== "string" || !test.trim()) {
    return { ok: false, perche: "nessun test dichiarato" };
  }
  const piano = comeSiEsegue(test);
  if (!piano.ok) return { ok: false, perche: piano.perche };
  const mancante = piano.percorsi.find((p) => !esiste(p));
  if (mancante) return { ok: false, perche: `il file non esiste: «${mancante}»` };
  return { ok: true, perche: "" };
}

/** Le voci il cui test nessuno può eseguire, col perché di ognuna. */
export function mutazioniCieche(mutanti = [], esiste = () => false) {
  const fuori = [];
  for (const m of Array.isArray(mutanti) ? mutanti : []) {
    const v = testEseguibile(m?.test, esiste);
    if (!v.ok) fuori.push({ difetto: m?.difetto ?? "", nome: m?.nome ?? "", test: m?.test ?? "", perche: v.perche });
  }
  return fuori;
}

/** Il verdetto col tetto. Ereditato si conta, nuovo si blocca. */
export function verdettoMutazioniCieche({ quante = 0, totale = 0, tetto = null } = {}) {
  if (tetto === null || tetto === undefined || !Number.isFinite(Number(tetto))) {
    return { esito: "cieco", motivo: `${quante} mutazioni su ${totale} non si possono eseguire (nessun tetto fissato)` };
  }
  const t = Number(tetto);
  if (quante > t) {
    return {
      esito: "violazione",
      motivo:
        `mutazioni non eseguibili salite da ${t} a ${quante}: una mutazione che il banco non sa lanciare non è ` +
        `copertura, è un verde comprato. Il campo «test» vuole qualcosa che «comeSiEsegue» sappia avviare: un ` +
        `PERCORSO dentro il repo (cervello/test/x.test.mjs, x.bats) o una riga di node/npx senza shell.`,
    };
  }
  if (quante < t) {
    return { esito: "debito", motivo: `mutazioni non eseguibili scese da ${t} a ${quante}: abbassa il tetto in cervello/tetti-lotto.json` };
  }
  return { esito: "debito", motivo: `${quante} mutazioni su ${totale} risultano verificate senza esserlo (tetto ${t}) — AR-840` };
}

// ═════════════════════════════════════════════════════════════════════════════════════════════
// 🦷 IL SECONDO METRO: NON «SI PUO' LANCIARE» MA «MORDE» — AR-883
// ═════════════════════════════════════════════════════════════════════════════════════════════
// Il conto qui sopra dice 0 su 939, ed e' vero. Dice anche molto meno di quanto sembra: una voce puo'
// essere perfettamente lanciabile e difendere NIENTE — la mutazione gira, il fix e' rotto, e la prova
// resta verde lo stesso. Quello e' il debito vero, e non aveva nessun sensore.
//
// PERCHE' STA FUORI DAL CANCELLO. Misurarlo vuol dire ESEGUIRE le mutazioni: applicare la rottura,
// far girare la prova, rimettere a posto. Per 939 voci sono decine di minuti. Un cancello lento si
// impara a saltarlo — quindi questo si lancia a mano, a lotti, e il cancello non lo aspetta.
//
// PERCHE' NON RIFA' IL BANCO. Il banco esiste gia' ed e' `non-vacuita.mjs`, con dentro il foglietto
// che rimette a posto i file se la corsa muore, i gestori di segnale e il terzo esito. Rifarne una
// seconda copia per contare sarebbe la malattia di AR-840 daccapo: due metri per la stessa domanda.
// Qui si prepara il campione, si chiama il banco e si tiene il conto.
//
// 🔒 IL RISPETTO PER CHI STA LAVORANDO. Il banco SCRIVE nei file veri del repo (rompe, prova,
// rimette a posto). Se qualcun altro sta modificando lo stesso file in quel secondo, il «rimette a
// posto» gli cancella il lavoro. Percio' una mutazione che punta a un file con modifiche non
// committate viene SALTATA, e la saltata non e' un verde: e' un ⚪ che tiene il censimento incompleto.

/** Il campione da provare in questa corsa. Funzione PURA. */
export function scegliCampione(mutanti = [], { da = 0, quante = 20, difetti = null, tutte = false } = {}) {
  const elenco = Array.isArray(mutanti) ? mutanti : [];
  if (difetti && difetti.length) {
    const cercati = new Set(difetti.map(String));
    return elenco.filter((m) => cercati.has(String(m?.difetto ?? "")) || cercati.has(String(m?.lezione ?? "")));
  }
  if (tutte) return elenco;
  const inizio = Math.max(0, Number(da) || 0);
  return elenco.slice(inizio, inizio + Math.max(1, Number(quante) || 20));
}

/**
 * Il verdetto sul morso. Funzione PURA.
 *
 * Tre uscite, quelle di casa (AR-322), e la piu' importante e' la terza: **un campione senza
 * scoperte NON e' un verde.** Se ho provato 25 voci su 939 e mordono tutte e 25, delle altre 914 non
 * so niente — e uno strumento che stampasse ✅ dopo aver guardato il 2,7% sarebbe esattamente il
 * «verde muto» del catalogo delle scorciatoie. Il verde si merita solo un censimento COMPLETO.
 */
export function verdettoMorso({ provate = 0, nonMordono = 0, nonMisurate = 0, saltate = 0, totale = 0, tetto = null } = {}) {
  if (!provate) {
    return { esito: "cieco", motivo: `nessuna mutazione provata su ${totale}: non ho misurato niente` };
  }
  const completo = provate === totale && nonMisurate === 0 && saltate === 0;
  const t = tetto === null || tetto === undefined || !Number.isFinite(Number(tetto)) ? null : Number(tetto);

  if (t !== null && nonMordono > t) {
    return {
      esito: "violazione",
      motivo:
        `mutazioni che non mordono salite da ${t} a ${nonMordono}: una mutazione che gira e lascia la prova ` +
        `verde non e' copertura, e' una promessa. «Difetto chiuso» in questa casa vuol dire «la prova diventa ` +
        `rossa se il fix si rompe».`,
    };
  }
  // Senza tetto, ogni voce che non morde e' una scoperta: non c'e' nessun debito ereditato a cui
  // appoggiarsi per dire «lo sapevo gia'». Un censimento completo con delle voci che non mordono e
  // nessun tetto NON deve uscire verde — sarebbe il numero che mente del catalogo delle scorciatoie.
  if (t === null && nonMordono > 0) {
    return {
      esito: "scoperta",
      motivo: `${nonMordono} mutazioni su ${provate} provate NON mordono, e non c'e' nessun tetto fissato: sono scoperte nuove`,
    };
  }
  if (nonMordono > 0 && !completo) {
    return {
      esito: "scoperta",
      motivo: `${nonMordono} mutazioni su ${provate} provate NON mordono: il fix che dicono di difendere non e' coperto da nessuno (campione di ${provate} su ${totale})`,
    };
  }
  if (!completo) {
    return {
      esito: "campione",
      motivo:
        `⚪ campione senza scoperte: ${provate} provate su ${totale}` +
        `${saltate ? `, ${saltate} saltate perche' il file e' in lavorazione` : ""}` +
        `${nonMisurate ? `, ${nonMisurate} non misurate` : ""}. Delle altre ${totale - provate} non so niente: non e' un verde.`,
    };
  }
  if (t !== null && nonMordono < t) {
    return { esito: "debito", motivo: `mutazioni che non mordono scese da ${t} a ${nonMordono}: abbassa il tetto in cervello/tetti-lotto.json` };
  }
  if (nonMordono > 0) {
    return { esito: "debito", motivo: `${nonMordono} mutazioni su ${totale} girano senza difendere niente (tetto ${t}) — AR-883` };
  }
  return { esito: "pulito", motivo: `censimento completo: tutte e ${provate} le mutazioni mordono` };
}

/** I file con modifiche non committate: quelli non si toccano mentre qualcun altro ci scrive.
 *
 * Puntabile altrove con `MORDONO_IN_LAVORAZIONE` (un elenco separato da virgole) — stessa ragione di
 * `MUTANTI_FILE`: senza, l'unico modo di provare che il salto avviene davvero sarebbe sporcare un
 * file vero del repo mentre la prova gira, e una prova che dipende da com'e' il disco in quel minuto
 * non e' una prova. */
function fileInLavorazione(esegui = spawnSync) {
  if (process.env.MORDONO_IN_LAVORAZIONE !== undefined) {
    return new Set(String(process.env.MORDONO_IN_LAVORAZIONE).split(",").map((x) => x.trim()).filter(Boolean));
  }
  const r = esegui("git", ["status", "--porcelain"], { cwd: AD_ROOT, encoding: "utf8" });
  if (r.error || r.status !== 0) return null; // ⚪ non lo so — e chi non lo sa non tocca niente
  const dentro = new Set();
  for (const riga of String(r.stdout || "").split("\n")) {
    const via = riga.slice(3).trim().split(" -> ").pop();
    if (via) dentro.add(via);
  }
  return dentro;
}

function argomento(nome, difetto = null) {
  const i = process.argv.indexOf(nome);
  return i === -1 ? difetto : process.argv[i + 1];
}

function mainMordono() {
  let mutanti = [];
  try {
    mutanti = JSON.parse(readFileSync(MUTANTI, "utf8")).mutanti || [];
  } catch (e) {
    console.log(`⚪ mutanti.json illeggibile: non ho potuto misurare niente (${e.message})`);
    process.exit(2);
  }

  const inLavorazione = fileInLavorazione();
  const forza = process.argv.includes("--anche-i-file-in-lavorazione");
  if (inLavorazione === null && !forza) {
    console.log("⚪ git non risponde: non so quali file sono in lavorazione, e il banco SCRIVE nei file veri.");
    console.log("   Non tocco niente. Se sei sicuro che nessuno stia lavorando: --anche-i-file-in-lavorazione");
    process.exit(2);
  }

  const difetti = argomento("--difetti") ? String(argomento("--difetti")).split(/[,\s]+/).filter(Boolean) : null;
  const scelti = scegliCampione(mutanti, {
    da: Number(argomento("--da", 0)),
    quante: Number(argomento("--quante", 20)),
    difetti,
    tutte: process.argv.includes("--tutte"),
  });

  const saltate = [];
  const campione = [];
  for (const m of scelti) {
    if (!forza && inLavorazione && inLavorazione.has(String(m?.file ?? ""))) {
      saltate.push({ difetto: m?.difetto ?? m?.lezione ?? "", file: m?.file ?? "", perche: "il file e' in lavorazione: non lo tocco mentre qualcun altro ci scrive" });
      continue;
    }
    campione.push(m);
  }

  let tetto = null;
  try {
    const t = JSON.parse(readFileSync(TETTI, "utf8"));
    tetto = Object.hasOwn(t, "mutazioni_che_non_mordono") ? Number(t.mutazioni_che_non_mordono) : null;
  } catch {
    // nessun tetto leggibile: `verdettoMorso` lo sa gestire e non finge un confronto
  }

  let esiti = [];
  if (campione.length) {
    const cartella = mkdtempSync(join(tmpdir(), "morde-"));
    // ⚠️ NON si chiama «mutanti.json», e il perché non è estetico. Il guardiano delle porte
    // automatiche (`porta-automatica-indentazione`) riconosce i file di memoria dal NOME, non dal
    // percorso: un file di passaggio chiamato come il registro vero gli risulta indistinguibile dal
    // registro vero, e accusava questa riga di «riscrivere il file intero e bloccare la
    // pubblicazione». Era un falso rosso — qui si scrive in una cartella temporanea — ma il nome
    // costava un'accusa a ogni giro, e un metro che accusa chi il lavoro l'ha fatto si impara a
    // scorrerlo. Il nome non serviva comunque a niente: il banco riceve il percorso dalla variabile
    // MUTANTI_FILE qui sotto, non cercandolo per nome.
    const via = join(cartella, "campione-da-mordere.json");
    writeFileSync(via, JSON.stringify({ mutanti: campione }, null, 2));
    const tempo = String(argomento("--tempo", "120000"));
    const r = spawnSync(process.execPath, [join(AD_ROOT, "cervello/non-vacuita.mjs"), "--json"], {
      cwd: AD_ROOT,
      encoding: "utf8",
      // Nessun tetto di tempo sul BANCO: ammazzarlo a meta' lascerebbe un file rotto sul disco.
      // Il tetto sta sulla singola prova, dove il banco sa rimettere a posto.
      // ⚠️ La riga qui sotto copia il registro in UN'ALTRA cartella temporanea, e da lì il banco
      // non sa più dove viveva l'originale. Conta perché il banco ammette una prova che sta accanto
      // al registro che la nomina: spostato il registro, quelle prove diventano irraggiungibili e
      // il banco le dichiara ⚪ — successo il 31/8, e l'ha detto la verifica automatica.
      // Quindi la cartella di partenza gliela si DICHIARA. In produzione il registro sta nel repo e
      // questa riga non aggiunge niente: `radiceDelRegistro` scarta tutto ciò che è già in casa.
      env: { ...process.env, MUTANTI_FILE: via, NON_VACUITA_RADICE: dirname(MUTANTI), NON_VACUITA_TIMEOUT_MS: tempo },
      maxBuffer: 64 * 1024 * 1024,
    });
    const testo = String(r.stdout || "");
    const inizio = testo.indexOf("{");
    try {
      esiti = JSON.parse(testo.slice(inizio)).esiti || [];
    } catch (e) {
      console.log(`⚪ il banco non ha risposto in modo leggibile (${e.message}): non ho misurato niente`);
      console.log(String(r.stderr || "").slice(0, 2000));
      process.exit(2);
    }
  }

  const nonMordono = esiti.filter((e) => e.verdetto === "vacua");
  const nonMisurate = esiti.filter((e) => e.verdetto === "cieco");
  const mordono = esiti.filter((e) => e.verdetto === "ok");
  const v = verdettoMorso({
    provate: mordono.length + nonMordono.length,
    nonMordono: nonMordono.length,
    nonMisurate: nonMisurate.length,
    saltate: saltate.length,
    totale: mutanti.length,
    tetto,
  });

  if (JSON_MODE) {
    console.log(JSON.stringify({
      ok: v.esito !== "violazione" && v.esito !== "scoperta",
      esito: v.esito, motivo: v.motivo, tetto,
      totale: mutanti.length, provate: mordono.length + nonMordono.length,
      mordono: mordono.length, non_mordono: nonMordono.length,
      non_misurate: nonMisurate.length, saltate: saltate.length,
      elenco_non_mordono: nonMordono.map((e) => ({ difetto: e.difetto ?? e.lezione, nome: e.nome, test: e.test })),
      elenco_saltate: saltate,
    }, null, 2));
  } else {
    console.log("🦷 LE MUTAZIONI CHE NON MORDONO\n");
    console.log(`  · mutazioni nel registro: ${mutanti.length}`);
    console.log(`  · provate in questa corsa: ${mordono.length + nonMordono.length}`);
    console.log(`  · MORDONO (la prova diventa rossa): ${mordono.length}`);
    console.log(`  · NON mordono (il fix e' rotto e la prova resta verde): ${nonMordono.length}`);
    for (const e of nonMordono) console.log(`     ❌ ${e.difetto || e.lezione} — ${e.nome}`);
    if (nonMisurate.length) {
      console.log(`  · ⚪ non misurate: ${nonMisurate.length}`);
      for (const e of nonMisurate.slice(0, 5)) console.log(`     ⚪ ${e.difetto || e.lezione} — ${e.perche}`);
    }
    if (saltate.length) {
      console.log(`  · ⚪ saltate (file in lavorazione): ${saltate.length}`);
      for (const e of saltate.slice(0, 5)) console.log(`     ⚪ ${e.difetto} — ${e.file}`);
    }
    console.log(`\n${v.esito === "violazione" || v.esito === "scoperta" ? "⛔" : v.esito === "debito" ? "⚠️ " : v.esito === "pulito" ? "✅" : "⚪"} ${v.motivo}`);
  }
  process.exit(v.esito === "violazione" || v.esito === "scoperta" ? 1 : v.esito === "campione" || v.esito === "cieco" ? 2 : 0);
}

function main() {
  const ciechi = [];
  let mutanti = [];
  try {
    mutanti = JSON.parse(readFileSync(MUTANTI, "utf8")).mutanti || [];
  } catch (e) {
    console.log(`⚪ mutanti.json illeggibile: non ho potuto misurare niente (${e.message})`);
    process.exit(2);
  }
  let tetto = null;
  try {
    const t = JSON.parse(readFileSync(TETTI, "utf8"));
    tetto = Object.hasOwn(t, "mutazioni_senza_esecutore") ? Number(t.mutazioni_senza_esecutore) : null;
  } catch {
    ciechi.push("tetti-lotto.json illeggibile: il numero c'è, il confronto col tetto no");
  }

  const fuori = mutazioniCieche(mutanti, (p) => existsSync(join(AD_ROOT, p)));
  const v = verdettoMutazioniCieche({ quante: fuori.length, totale: mutanti.length, tetto });

  if (JSON_MODE) {
    console.log(JSON.stringify({ ok: v.esito !== "violazione", esito: v.esito, motivo: v.motivo, quante: fuori.length, totale: mutanti.length, tetto, ciechi, fuori: fuori.slice(0, 40) }, null, 2));
  } else {
    console.log("🧪 LE MUTAZIONI CHE NESSUNO PUÒ ESEGUIRE\n");
    for (const c of ciechi) console.log(`  ⚪ ${c}`);
    console.log(`  · mutazioni dichiarate: ${mutanti.length}`);
    console.log(`  · con un test che nessuno può eseguire: ${fuori.length}`);
    for (const f of fuori.slice(0, 5)) console.log(`     · ${f.difetto} — ${f.perche}`);
    if (fuori.length > 5) console.log(`     · …e altre ${fuori.length - 5}`);
    console.log(`\n${v.esito === "violazione" ? "⛔" : v.esito === "debito" ? "⚠️ " : "⚪"} ${v.motivo}`);
  }
  process.exit(v.esito === "violazione" ? 1 : v.esito === "cieco" ? 2 : 0);
}

if (process.argv[1] && process.argv[1].endsWith("mutazioni-senza-esecutore.mjs")) {
  // `--mordono` e' il secondo metro (AR-883) e sta FUORI dal cancello: costa minuti. Senza il flag
  // resta il conto veloce di sempre, quello che il cancello del lotto esegue a ogni giro.
  if (process.argv.includes("--mordono")) mainMordono();
  else main();
}
