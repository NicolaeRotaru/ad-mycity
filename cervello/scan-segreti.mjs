#!/usr/bin/env node
// scan-segreti.mjs — scan-segreti deterministico della PROPRIA repo (cardine di sicurezza).
// 🟢 Sola lettura. Cerca segreti reali nei file che stanno per essere versionati e, se ne trova,
// esce con codice ≠0 così il giro può BLOCCARE il commit/push prima che il segreto entri nella storia.
//
// Risolve AR-021 (causa a monte di AR-004): il perimetro segreti non era difeso da uno scan attivo,
// ma solo da una regola .gitignore fragile. Ora ogni giro passa da qui prima di `git add -A`.
//
// Uso:
//   node cervello/scan-segreti.mjs            -> report leggibile (valori SEMPRE redatti)
//   node cervello/scan-segreti.mjs --json     -> output JSON per giro.sh
//   node cervello/scan-segreti.mjs --staged   -> scansiona solo i file staged (git diff --cached)
//
// Exit: 0 = pulito · 1 = trovato almeno un segreto (BLOCCA) · 2 = errore interno

import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";
import { cercaNeiBlocchi, pezziDiFile } from "./lettura-a-blocchi.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";
import { REGOLE_SEGRETI, campioneRedatto, provaRegole } from "./segreti-pattern.mjs";

// AR-339 — la difesa si prova su un repo FINTO, non solo su questo.
// Senza questa via una prova non poteva costruire un albero con un nome accentato e un finto
// segreto dentro, e l'unico modo di provare il fix sarebbe stato scrivere un file con la forma di
// una chiave vera dentro il repo VERO — cioè il gesto che il 25/7 ha bloccato la pubblicazione
// della memoria (AR-270). Stessa via che stampo-check apre con STAMPO_AGENTS_DIR, per lo stesso motivo.
const REPO_FINTO = Boolean(process.env.SCAN_SEGRETI_REPO);
const REPO = process.env.SCAN_SEGRETI_REPO || AD_ROOT;

const JSON_MODE = process.argv.includes("--json");
const STAGED_ONLY = process.argv.includes("--staged");
const PROVA = process.argv.includes("--prova");

const REGOLE = REGOLE_SEGRETI;

// Estensioni binarie/di rumore da saltare.
const SKIP_EXT = /\.(png|jpe?g|gif|webp|ico|pdf|zip|gz|tar|mp4|mov|woff2?|ttf|otf|lock)$/i;

/**
 * Oltre questo il file non si legge più tutto in una volta: si legge A BLOCCHI (AR-441).
 *
 * Prima era il tetto oltre il quale il file veniva saltato del tutto — dichiarandolo, dopo AR-427,
 * ma comunque non letto. Adesso è solo il punto in cui cambia il MODO di leggerlo: sopra questa
 * soglia si legge un pezzo per volta tenendo una coda, così la memoria resta piatta e nessun file
 * esce dallo sguardo. La dimensione non è più né un'esenzione né una cecità.
 */
const SOGLIA_TROPPO_GRANDE = 2_000_000;

/**
 * AR-270 — DEROGHE ESPLICITE. Una sola volta, il 25/7, una chiave FINTA scritta dentro un test
 * (aveva il prefisso di un provider vero) ha bloccato la pubblicazione della memoria per due giorni:
 * il giro si fermava prima del push e nessuno se ne accorgeva, perché il blocco era corretto e il
 * motivo no. Questa lista esiste perché una deroga sia VISIBILE e discutibile — versionata, con
 * motivo e data — invece di un silenzioso allargamento del pattern che indebolirebbe lo scanner.
 *
 * Regole d'uso: si deroga a un (file, regola) SPECIFICO, mai a un intero percorso o a una regola
 * intera. Una deroga senza motivo e data non vale. Il primo rimedio resta togliere la forma-di-chiave
 * dal file: la deroga è la rete di sicurezza, non la soluzione.
 */
const DEROGHE = [
  // { file: "percorso/esatto.mjs", regola: "Nome regola", motivo: "…", data: "AAAA-MM-GG" },
];

function inDeroga(rel, nomeRegola) {
  return DEROGHE.some((d) => d.file === rel && d.regola === nomeRegola && d.motivo && d.data);
}

/** Redige un segreto: mostra solo i primi 7 e gli ultimi 3 caratteri. */
function reda(s) {
  return campioneRedatto(s);
}

/**
 * Elenco dei file da scansionare: quelli che git considera versionabili (tracciati + non-ignorati).
 *
 * AR-339 — passa dalla porta di `percorsi-git.mjs`. Prima chiedeva l'elenco a git senza `-z` e i 26
 * file del vault con l'accento nel percorso tornavano citati e in ottali: `statSync` falliva e il
 * ciclo li saltava in silenzio, contandoli però nel totale dichiarato. Lo scanner diceva «nessun
 * segreto in 2040 file» avendone aperti 2014.
 */
function fileDaScansionare() {
  try {
    if (STAGED_ONLY) {
      return percorsiDaGit(["diff", "--cached", "--name-only", "--diff-filter=ACM"], { cwd: REPO });
    }
    // tracciati + non-tracciati-non-ignorati (esclude ciò che .gitignore protegge, es. i .env reali)
    return percorsiDaGit(["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: REPO });
  } catch (e) {
    throw new Error(`git non disponibile: ${e.message || e}`);
  }
}

/**
 * AR-275 — `--prova`: la difesa si prova, non si dichiara. Passa un campione FINTO di ogni famiglia
 * di chiave che il cervello usa davvero (elenco in segreti-pattern.mjs) e pretende che la regola
 * corrispondente scatti. Esce ≠0 se una famiglia non ha regola o se la regola non morde: è così che
 * ci si accorge di una chiave nuova entrata nell'ambiente senza difesa, invece di scoprirlo dopo.
 */
function provaEEsci() {
  const quando = nowPiacenza();
  const esito = provaRegole();
  if (JSON_MODE) {
    console.log(JSON.stringify({ esito: esito.ok ? "ok" : "buchi", quando, ...esito }, null, 2));
  } else {
    console.log(`\n🧪 PROVA REGOLE SEGRETI — ${quando}\n`);
    if (esito.ok) {
      console.log(`✅ ${esito.provate}/${esito.provate} famiglie di chiave in uso hanno una regola che scatta.`);
    } else {
      console.log(`❌ ${esito.falliti.length} famiglie SCOPERTE su ${esito.provate}:\n`);
      for (const f of esito.falliti) console.log(`  • ${f.env} → "${f.regola}": ${f.motivo}`);
      console.log(`\nAggiungi/correggi la regola in cervello/segreti-pattern.mjs.`);
    }
  }
  // Il segnale non si ingoia in silenzio: se non riesco a scriverlo lo dico (malattia «errore-ingoiato»).
  stampSegnale("scan-segreti", esito.ok ? "ok" : "errore", `prova regole: ${esito.ok ? "tutte scattano" : `${esito.falliti.length} scoperte`} · ${quando}`)
    .catch((e) => console.error(`⚠️  segnale scan-segreti non scritto: ${e.message || e}`));
  process.exit(esito.ok ? 0 : 1);
}

/**
 * AR-339 — il verdetto in una funzione pura, così una prova lo esegue su casi che nel repo non
 * esistono (per fortuna) ancora.
 *
 * Tre esiti, non due. Il terzo è quello che mancava: **cieco**. Un percorso che git ci ha dato e che
 * non riusciamo ad aprire non è un file pulito, è un file che non abbiamo guardato — e uno scanner
 * che li conta fra i controllati mente sulla propria copertura mentre suona il verde. Vince sul
 * pulito e cede al trovato: se un segreto c'è, quello resta il problema più urgente.
 *
 * Il numero dichiarato è sempre quello dei file DAVVERO letti, mai la lunghezza dell'elenco.
 *
 * @returns {{esito: "pulito"|"cieco"|"trovato", sintesi: string, codice: 0|1|2}}
 */
/**
 * AR-427 → AR-441 — cosa farsene di un file, decidendolo su due numeri invece che dentro il ciclo.
 *
 * Il difetto di partenza era una riga: `if (!st.isFile() || st.size > 2_000_000) continue;`. Due
 * casi diversi incollati in un `continue` solo, e uno dei due è un difetto NOSTRO — un file che non
 * abbiamo aperto non è un file pulito, ma lo scanner continuava a dire «nessun segreto in N file».
 *
 * AR-427 ha tolto la bugia (il file grosso finiva fra i non raggiunti, verdetto «cieco»). AR-441
 * toglie anche la cecità: il file grosso adesso si LEGGE, a blocchi. Il conto che l'ha imposto,
 * misurato il 13/8: `cantiere-difetti.json` è a 1,70 MB — l'85% del tetto — e cresce a ogni giro.
 * Con la sola cecità, entro poche settimane il guardiano sarebbe diventato rosso fisso proprio sul
 * file più pieno di roba, e un cancello che suona sempre lo si impara a saltare.
 *
 * PURA (regola ③): prende `{isFile, size}`, non uno `statSync`. Così la prova la esegue su un file
 * da 3 MB che non esiste, invece di doverne creare uno per scoprire cosa succede.
 */
export function classificaPerDimensione(st, soglia = SOGLIA_TROPPO_GRANDE) {
  if (!st) return { azione: "ignora" };
  // Accetta sia un vero `statSync` (isFile è una funzione) sia l'oggetto semplice che usano le prove.
  const eUnFile = typeof st.isFile === "function" ? st.isFile() : Boolean(st.isFile);
  if (!eUnFile) return { azione: "ignora" };
  const size = Number(st.size);
  if (Number.isFinite(size) && size > soglia) {
    return { azione: "leggi-a-blocchi", motivo: `${Math.round(size / 1000)} kB: si legge un pezzo per volta` };
  }
  return { azione: "leggi" };
}

/**
 * Le regole passate su un testo già in mano. Una porta sola per tutti e due i modi di leggere —
 * intero e a blocchi — così il file grosso non finisce su un percorso di codice meno provato di
 * quello normale: è la stessa funzione, cambia solo da dove arrivano i pezzi.
 */
function trovaInPezzi(rel, pezzi) {
  const esito = [];
  for (const t of cercaNeiBlocchi(pezzi, REGOLE)) {
    if (inDeroga(rel, t.regola)) continue; // AR-270: deroga esplicita, versionata e motivata
    esito.push({ file: rel, regola: t.regola, campione: reda(t.valore) });
  }
  return esito;
}

export function verdetto({ letti = 0, nonRaggiunti = [], trovati = [] } = {}) {
  if (trovati.length) {
    const file = new Set(trovati.map((t) => t.file)).size;
    return { esito: "trovato", codice: 1, sintesi: `${trovati.length} possibili segreti in ${file} file` };
  }
  if (nonRaggiunti.length) {
    return {
      esito: "cieco",
      codice: 2,
      // AR-441: qui resta SOLO il file che non si è riusciti ad aprire davvero. Il file grosso non
      // passa più di qui — si legge a blocchi — e per questo la frase non parla più di un tetto:
      // dire «cieco» per una dimensione era il modo di suonare per sempre su un file che cresce.
      sintesi: `${nonRaggiunti.length} file elencati da git che NON sono riuscito ad aprire: su ${letti} letti non posso dire «pulito»`,
    };
  }
  return { esito: "pulito", codice: 0, sintesi: `nessun segreto in ${letti} file versionabili` };
}

function main() {
  if (PROVA) return provaEEsci();
  const quando = nowPiacenza();
  let files;
  try {
    files = fileDaScansionare();
  } catch (e) {
    console.error("ERRORE scan-segreti:", e.message || e);
    process.exit(2);
  }

  const trovati = [];
  // AR-339 — tre silenzi diversi che prima erano lo stesso `continue`. Solo il primo è un difetto
  // NOSTRO: un percorso che git ci ha dato e che non riusciamo ad aprire significa che abbiamo letto
  // male l'elenco, non che il file è pulito.
  const nonRaggiunti = [];
  // AR-441 — i file letti a blocchi si dichiarano. Non è un buco (sono letti eccome): è la
  // trasparenza su COME li ho guardati, e il posto dove si vede crescere il problema vero, cioè i
  // JSON generati che si gonfiano a ogni giro.
  const aBlocchi = [];
  let letti = 0;
  for (const rel of files) {
    if (SKIP_EXT.test(rel)) continue;
    const abs = join(REPO, rel);
    let st;
    try {
      st = statSync(abs);
    } catch {
      nonRaggiunti.push(rel);
      continue;
    }
    const c = classificaPerDimensione(st);
    if (c.azione === "ignora") continue; // una cartella non è un file saltato: niente da leggere
    try {
      if (c.azione === "leggi-a-blocchi") {
        trovati.push(...trovaInPezzi(rel, pezziDiFile(abs)));
        aBlocchi.push(`${rel} (${c.motivo})`);
      } else {
        trovati.push(...trovaInPezzi(rel, [readFileSync(abs, "utf8")]));
      }
    } catch {
      continue; // binario/non-utf8: saltarlo è corretto, e non lo contiamo fra i letti
    }
    letti++;
  }

  const { esito, sintesi, codice } = verdetto({ letti, nonRaggiunti, trovati });

  if (!REPO_FINTO) stampSegnale("scan-segreti", codice === 0 ? "ok" : "errore", `${sintesi} · ${quando}`).catch(() => {});

  if (JSON_MODE) {
    console.log(
      JSON.stringify({ esito, quando, sintesi, trovati, letti, non_raggiunti: nonRaggiunti, letti_a_blocchi: aBlocchi }, null, 2),
    );
  } else {
    console.log(`\n🔒 SCAN SEGRETI — ${quando}\n`);
    if (aBlocchi.length) console.log(`   ${aBlocchi.length} file grossi letti a blocchi: ${aBlocchi.join(", ")}\n`);
    if (esito === "pulito") {
      console.log(`✅ ${sintesi}`);
    } else if (esito === "cieco") {
      console.log(`❌ ${sintesi}\n`);
      for (const p of nonRaggiunti.slice(0, 10)) console.log(`  • ${p}`);
      if (nonRaggiunti.length > 10) console.log(`  … e altri ${nonRaggiunti.length - 10}`);
      console.log(`\nNon posso dire che sono puliti: non li ho aperti. Chiedi l'elenco dalla porta`);
      console.log(`di cervello/percorsi-git.mjs, che restituisce i percorsi come stanno sul disco.`);
    } else {
      console.log(`❌ ${sintesi}. BLOCCA il commit finché non sono rimossi:\n`);
      for (const t of trovati) console.log(`  • ${t.file} — ${t.regola}: ${t.campione}`);
      console.log(`\nRimuovi il valore dal file, ruota il segreto se era reale, e ricontrolla.`);
    }
  }

  process.exit(codice);
}

// Importare questo file NON deve far partire la scansione: la prova di AR-339 importa `verdetto`
// per eseguire la decisione su ingressi finti, e senza questa guardia `main()` partirebbe (e
// chiamerebbe process.exit) dentro il test. Stessa guardia di spazzata-fratelli, per lo stesso motivo.
if (import.meta.url === `file://${process.argv[1]}`) main();
