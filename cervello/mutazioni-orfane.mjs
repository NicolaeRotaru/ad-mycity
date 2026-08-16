#!/usr/bin/env node
// 🔗 CHI HAI APPENA SCOLLEGATO? — le mutazioni che puntano ai file che hai toccato e non trovano
// più il loro pezzo. 🟢 Sola lettura: non scrive niente, non tocca git.
//
// IL DIFETTO CHE CHIUDE (AR-699). Misurato su un lotto solo: CINQUE mutazioni sono state orfanate
// riscrivendo il codice che sorvegliavano — due in `sorvegliante.mjs` (AR-503, AR-543), due in
// `cancello-lotto.mjs` (il blocco duro e il tetto), una spostata da `gate-veri.mjs` a
// `contratto-prova.mjs`. In tutti e cinque i casi il comportamento era SPOSTATO, non rimosso:
// nessun difetto era stato disfatto. Ma in nessuno dei cinque se n'era accorto chi stava
// riscrivendo. L'ha detto il guardiano dopo — e per una di esse lo aveva già detto novantanove
// volte senza che nessuno agisse.
//
// La conseguenza è precisa e silenziosa: **il fix resta, la difesa no, e il test continua a
// passare.** Una mutazione orfana non fa diventare rosso niente: fa diventare CIECO il banco che
// dovrebbe misurare se quella prova serve a qualcosa.
//
// PERCHÉ UN COMANDO E NON UN ALTRO CANCELLO. Il cancello del lotto già blocca alla consegna, e il
// sorvegliante già grida a ogni Edit. Il buco non è agli estremi: è NEL MEZZO — fra la riscrittura e
// la consegna — che è l'unico momento in cui riagganciare una mutazione costa trenta secondi invece
// di un giro di richiesta di unione. Chi riscrive deve poterlo CHIEDERE, con una domanda sola e una
// risposta che si legge in due righe.
//
// Uso:
//   node cervello/mutazioni-orfane.mjs                 # i file che ho toccato (git), confronto con main
//   node cervello/mutazioni-orfane.mjs --file a.mjs,b.mjs
//   node cervello/mutazioni-orfane.mjs --tutte         # ogni mutazione del repo, non solo le mie
//   node cervello/mutazioni-orfane.mjs --json
//
// Uscita (contratto guardiani, AR-322):
//   0 = nessuna mutazione orfana fra i file toccati
//   1 = almeno una mutazione non trova più il suo pezzo → va riagganciata PRIMA di consegnare
//   2 = non ho potuto misurare (mutanti.json assente/illeggibile, oppure git non risponde)

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const TUTTE = process.argv.includes("--tutte");
const iFile = process.argv.indexOf("--file");
const FILE_CHIESTI = iFile !== -1 ? String(process.argv[iFile + 1] || "").split(/[,\s]+/).filter(Boolean) : null;

const MUTANTI = process.env.MUTANTI_FILE || join(AD_ROOT, "cervello/mutanti.json");

/** Gli id di difetto (o la lezione) che una mutazione dichiara di sorvegliare. */
export function padroneDellaMutazione(m) {
  const ids = String(m?.difetto || "").match(/AR-\d+/g);
  if (ids && ids.length) return ids.join(", ");
  return m?.lezione ? String(m.lezione) : "(senza padrone)";
}

/**
 * LA DOMANDA, in una funzione pura.
 *
 * @param mutanti  l'elenco di `cervello/mutanti.json`
 * @param toccati  i percorsi (relativi al repo) che chi chiede ha riscritto; `null` = tutti
 * @param leggi    (percorso relativo) => testo, oppure `null` se non si legge
 * @returns {{orfane: Array, controllate: number, ciechi: Array<string>}}
 *
 * Un file che non si legge NON è «nessuna orfana»: è un file di cui non so niente, e finisce nei
 * ciechi. Contarlo verde sarebbe la stessa bugia che questo comando esiste per togliere di mezzo.
 */
export function mutazioniOrfane(mutanti = [], toccati = null, leggi = () => null) {
  const cercati = toccati ? new Set(toccati.map((f) => String(f).replace(/^\.\//, ""))) : null;
  const orfane = [];
  const ciechi = [];
  const cache = new Map();
  let controllate = 0;
  for (const m of mutanti) {
    const file = String(m?.file || "").replace(/^\.\//, "");
    if (!file || (cercati && !cercati.has(file))) continue;
    controllate++;
    if (!cache.has(file)) cache.set(file, leggi(file));
    const testo = cache.get(file);
    if (testo === null || testo === undefined) {
      ciechi.push(`${file}: non ho potuto leggerlo, quindi non so se la sua mutazione regge`);
      continue;
    }
    if (!String(testo).includes(String(m?.cerca ?? ""))) {
      orfane.push({ difetto: padroneDellaMutazione(m), nome: m?.nome || "", file, cerca: String(m?.cerca ?? ""), lotto: m?.lotto ?? null });
    }
  }
  return { orfane, controllate, ciechi };
}

/**
 * I nomi dentro l'uscita di `git status --porcelain -z`.
 *
 * Il formato mette lo stato nei PRIMI TRE caratteri di ogni voce (`XY ` — due lettere e uno spazio,
 * e la prima può essere uno spazio: « M cervello/x.mjs»). Tagliarli dopo un `trim()` è il modo
 * garantito di sbagliare: il `trim` mangia lo spazio iniziale, la voce diventa «M cervello/x.mjs» e
 * qualunque regola che si aspetta tre caratteri di stato ne lascia dentro uno. Misurato addosso a
 * questo file mentre lo scrivevo: zero file trovati con l'albero pieno di modifiche, cioè un verde
 * per non aver guardato — la malattia esatta che questo comando cura.
 *
 * Pura: la prova la esercita sull'uscita vera di git, copiata com'è.
 */
export function nomiDaStatus(grezzo = "") {
  const fuori = [];
  for (const voce of String(grezzo).split("\0")) {
    if (!voce) continue;
    const nome = voce.slice(3).trim();
    if (nome) fuori.push(nome.replace(/^"|"$/g, ""));
  }
  return fuori;
}

/** I file che chi chiede ha toccato: modifiche non ancora consegnate + differenza col ramo di base. */
export function fileToccatiDaGit(esegui) {
  const puliti = new Set();
  const ciechi = [];

  const stato = esegui(["status", "--porcelain=v1", "--no-renames", "-z"]);
  if (!stato || stato.status !== 0) ciechi.push("git status non ha risposto: le modifiche non consegnate non le ho potute guardare");
  else for (const f of nomiDaStatus(stato.stdout)) puliti.add(f);

  const base = esegui(["merge-base", "HEAD", "origin/main"]);
  const sha = base && base.status === 0 ? String(base.stdout || "").trim() : "";
  if (!sha) {
    ciechi.push("nessun `origin/main` da cui contare (clone superficiale?): ho guardato solo l'albero di lavoro");
  } else {
    const d = esegui(["diff", "--name-only", sha, "HEAD"]);
    if (!d || d.status !== 0) {
      ciechi.push("git diff col ramo di base non ha risposto: ho guardato solo l'albero di lavoro");
    } else {
      for (const f of String(d.stdout || "").split("\n")) if (f.trim()) puliti.add(f.trim());
    }
  }
  return { file: [...puliti], ciechi };
}

function main() {
  if (!existsSync(MUTANTI)) {
    console.error("mutazioni-orfane: cervello/mutanti.json assente → non posso misurare");
    process.exit(2);
  }
  let mutanti;
  try {
    mutanti = JSON.parse(readFileSync(MUTANTI, "utf8")).mutanti || [];
  } catch (e) {
    console.error(`mutazioni-orfane: mutanti.json illeggibile (${e.message}) → non posso misurare`);
    process.exit(2);
  }

  let toccati = null;
  let ciechiGit = [];
  if (FILE_CHIESTI) toccati = FILE_CHIESTI;
  else if (!TUTTE) {
    const g = fileToccatiDaGit((args) => spawnSync("git", args, { cwd: AD_ROOT, encoding: "utf8" }));
    toccati = g.file;
    ciechiGit = g.ciechi;
  }

  const leggi = (f) => {
    try {
      return readFileSync(join(AD_ROOT, f), "utf8");
    } catch {
      return null;
    }
  };
  const { orfane, controllate, ciechi } = mutazioniOrfane(mutanti, toccati, leggi);

  if (JSON_MODE) {
    console.log(JSON.stringify({ ok: orfane.length === 0, controllate, orfane, ciechi: [...ciechiGit, ...ciechi], toccati }, null, 2));
  } else {
    console.log("🔗 LE MUTAZIONI DEI FILE CHE HAI TOCCATO\n");
    for (const c of [...ciechiGit, ...ciechi]) console.log(`  ⚪ ${c}`);
    if (!controllate) {
      console.log(
        toccati && !toccati.length
          ? "  ℹ️  non hai toccato nessun file: niente da riagganciare."
          : "  ℹ️  nessuna mutazione punta ai file che hai toccato: niente da riagganciare.",
      );
    }
    for (const o of orfane) {
      console.log(`  ❌ ${o.difetto} — ${o.file}`);
      console.log(`     · non trova più: «${o.cerca.slice(0, 90).replace(/\n/g, "⏎")}»`);
    }
    console.log("");
    console.log(
      orfane.length
        ? `⛔ di ${controllate} mutazioni che puntano ai file che hai toccato, ${orfane.length} NON trovano più il loro pezzo.\n` +
            `   Il comportamento l'hai SPOSTATO o l'hai TOLTO? Se spostato, aggiorna \`cerca\` in cervello/mutanti.json adesso:\n` +
            `   riagganciarla ora costa trenta secondi, alla consegna costa un giro di richiesta di unione.`
        : controllate
          ? `✅ tutte e ${controllate} le mutazioni dei file che hai toccato trovano ancora il loro pezzo.`
          : "⚪ non ho misurato nessuna mutazione: non ho niente da dire.",
    );
  }

  if (orfane.length) process.exit(1);
  if ([...ciechiGit, ...ciechi].length && !controllate) process.exit(2);
  process.exit(0);
}

if (process.argv[1] && process.argv[1].endsWith("mutazioni-orfane.mjs")) main();
