#!/usr/bin/env node
// stash-dimenticate.mjs — IL SENSORE CHE NON C'ERA MENTRE IL LAVORO SPARIVA.
//
// LA STORIA. Il 21/8 alle 19:31 il server ha scritto da solo la sua card: «7.849 stash mai riprese
// dall'auto-sync». Settemilaottocentoquarantanove volte l'allineamento aveva messo da parte del
// lavoro per far partire un rebase, e nessuno l'aveva mai ripreso — in tutto il repo non esisteva un
// solo `git stash pop`. Il difetto che le produceva è riparato (vedi
// `cervello/test/stash-che-nessuno-riprende.test.mjs`), ma la parte peggiore non è il difetto: è che
// per giorni NESSUNO SE NE È ACCORTO. La visita di salute non guardava lì, il giro nemmeno.
//
// Una messa da parte è un PRESTITO. Un prestito che nessuno restituisce non è prudenza: è lavoro
// perso che si traveste da cautela — «la stash resta, git stash list la mostra» diceva il commento,
// e nessuno la guardava mai. Da qui in avanti la guarda questo.
//
// COSA MISURA: quante messe da parte ci sono nel repo e da quanto tempo aspetta la più vecchia.
// Poche e recenti sono normali (una in corso durante un rebase). Tante, o vecchie di giorni, vogliono
// dire che il meccanismo che le crea non le riprende — cioè il difetto è tornato.
//
// COSA NON PROVA: che dentro quelle stash ci sia lavoro prezioso. Conta e data, non giudica il
// contenuto: per quello c'è `--dettaglio`, che mostra quali file toccano.
//
// Uso: `node cervello/stash-dimenticate.mjs [--json] [--dettaglio] [--riassunto] [--tetto N] [--repo P]`
// Uscita: 0 sotto soglia · 1 troppe o troppo vecchie · 2 non ho potuto misurare (⚪ non è mai ✅).

import { spawnSync } from "node:child_process";
import { AD_ROOT } from "./git-github.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";

// Quante se ne tollerano. Una in corso durante un rebase è normale; tre già dicono che qualcuna non
// è tornata indietro. Il numero è basso apposta: il guasto che questo sensore cerca non è «tante
// stash», è «le stash non tornano» — e quello si vede prestissimo, se qualcuno guarda.
export const TETTO_PREDEFINITO = 3;
// Una messa da parte che aspetta da più di un giorno non è un rebase in corso: è dimenticata.
export const GIORNI_TROPPI = 1;

/** Legge le stash con data. Torna null se git non risponde: ⚪, non ✅. */
export function leggiStash(radice = AD_ROOT) {
  const r = spawnSync("git", ["stash", "list", "--format=%ct%x09%gd%x09%gs"], {
    cwd: radice,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0 || typeof r.stdout !== "string") return null;
  return r.stdout
    .split("\n")
    .filter((riga) => riga.trim())
    .map((riga) => {
      const [ct, rif, ...resto] = riga.split("\t");
      return { epoch: Number(ct) || 0, rif: rif || "", messaggio: resto.join("\t") };
    });
}

/**
 * Il verdetto, puro e provabile senza git.
 * Due strade per diventare rosso, perché il guasto si presenta in due modi: tante tutte insieme
 * (l'auto-sync che ne fa una al minuto) oppure poche ma vecchie (una rimasta indietro mesi fa).
 */
export function verdetto(stash, adessoEpoch, tetto = TETTO_PREDEFINITO, giorniTroppi = GIORNI_TROPPI) {
  if (stash === null) return { esito: "cieco", motivo: "git non ha risposto: non posso dire che non ce ne sono" };
  const quante = stash.length;
  const piuVecchia = stash.reduce((min, s) => (s.epoch && s.epoch < min ? s.epoch : min), Infinity);
  const giorni = Number.isFinite(piuVecchia) ? Math.floor((adessoEpoch - piuVecchia) / 86400) : 0;
  const troppe = quante > tetto;
  const vecchie = quante > 0 && giorni >= giorniTroppi;
  if (troppe || vecchie) {
    const perche = [];
    if (troppe) perche.push(`${quante} messe da parte, il tetto è ${tetto}`);
    if (vecchie) perche.push(`la più vecchia aspetta da ${giorni} giorn${giorni === 1 ? "o" : "i"}`);
    return { esito: "dimenticate", quante, giorni, motivo: perche.join(" · ") };
  }
  return { esito: "pulito", quante, giorni };
}

/**
 * I file dentro una messa da parte.
 * Passa dalla PORTA (`percorsiDaGit`) e non da un `spawnSync` proprio: la prima versione chiedeva a
 * git `--name-only` per conto suo, e la prova dei segreti l'ha respinta a ragione. Senza `-z` git
 * cita i nomi con l'accento — proprio i file che qui vanno contati per capire se dentro c'è memoria
 * vera. Una regola che vale per il repository non si aggira perché fa comodo a un file solo.
 */
function fileNellaStash(radice, rif) {
  // NON `git stash show`: la porta infila `-z` subito dopo la PRIMA parola, e `git stash -z show`
  // non è un comando. Misurato: rispondeva «4 non leggibili» su quattro messe da parte sane.
  // Una messa da parte è un commit con due o tre genitori: ^1 è da dove si è partiti (il tracciato),
  // ^3 c'è solo se erano stati messi da parte anche file non tracciati — ed è proprio il caso che
  // questa riparazione ha introdotto, quindi va guardato o il conto salta.
  let file = null;
  try {
    file = percorsiDaGit(["diff", "--name-only", `${rif}^1`, rif], { cwd: radice });
  } catch {
    return null; // non leggibile: si dichiara, non si finge vuota
  }
  try {
    const nonTracciati = percorsiDaGit(["diff", "--name-only", `${rif}^3`], { cwd: radice });
    file = [...new Set([...file, ...nonTracciati])];
  } catch {
    /* nessun terzo genitore: la messa da parte non conteneva file non tracciati */
  }
  return file;
}

function dettaglio(radice, stash) {
  const righe = [];
  for (const s of stash.slice(0, 10)) {
    const file = fileNellaStash(radice, s.rif);
    righe.push({
      rif: s.rif,
      quandoEpoch: s.epoch,
      file: (file || ["(non leggibile)"]).slice(0, 8),
      quanti: file ? file.length : 0,
    });
  }
  return righe;
}

/**
 * Dove guardare. Il primo tentativo misurava SEMPRE il repo dell'AD, anche lanciato dentro un altro:
 * su un repo con quattro messe da parte rispondeva «zero, tutto a posto». Un sensore che risponde di
 * un posto diverso da quello in cui sta è peggio di nessun sensore — e l'ha trovato la sua prova.
 */
export function radiceDaGuardare(cwd = process.cwd(), fallback = AD_ROOT) {
  const r = spawnSync("git", ["rev-parse", "--show-toplevel"], { cwd, encoding: "utf8" });
  if (r.status === 0 && typeof r.stdout === "string" && r.stdout.trim()) return r.stdout.trim();
  return fallback;
}

/**
 * Il riassunto, per quando sono migliaia.
 * Sul server ce n'erano 7.849: `--dettaglio` ne mostra dieci, e dieci su settemila non dicono se lì
 * dentro c'è memoria vera o solo file di dati riscritti. Qui si aggrega: quali cartelle toccano, in
 * che arco di tempo, e quante contengono roba del vault (cioè lavoro, non dati rigenerabili).
 * Serve a decidere COSA farne — che è una decisione di Nicola, non mia: qui non si butta niente.
 */
export function riassumi(radice, stash, quanteAlMassimo = 400) {
  const campione = stash.slice(0, quanteAlMassimo);
  const cartelle = new Map();
  let conMemoria = 0;
  let illeggibili = 0;
  for (const s of campione) {
    const file = fileNellaStash(radice, s.rif);
    if (file === null) { illeggibili++; continue; }
    let memoria = false;
    for (const f of file) {
      const testa = f.split("/")[0];
      cartelle.set(testa, (cartelle.get(testa) || 0) + 1);
      if (/^(MyCity-Vault|consegne|creativi|memoria-squadra)$/.test(testa)) memoria = true;
    }
    if (memoria) conMemoria++;
  }
  const date = campione.map((s) => s.epoch).filter(Boolean).sort((a, b) => a - b);
  return {
    totale: stash.length,
    guardate: campione.length,
    illeggibili,
    con_memoria: conMemoria,
    solo_dati: campione.length - conMemoria - illeggibili,
    dalla: date[0] || null,
    alla: date[date.length - 1] || null,
    cartelle: [...cartelle.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
  };
}

function main() {
  const argv = process.argv.slice(2);
  const JSON_MODE = argv.includes("--json");
  const DETTAGLIO = argv.includes("--dettaglio");
  const RIASSUNTO = argv.includes("--riassunto");
  const iTetto = argv.indexOf("--tetto");
  const tetto = iTetto >= 0 && argv[iTetto + 1] ? Number(argv[iTetto + 1]) : TETTO_PREDEFINITO;
  const iRepo = argv.indexOf("--repo");
  const radice = iRepo >= 0 && argv[iRepo + 1] ? argv[iRepo + 1] : radiceDaGuardare();

  const stash = leggiStash(radice);
  const v = verdetto(stash, Math.floor(Date.now() / 1000), tetto);

  if (v.esito === "cieco") {
    if (JSON_MODE) console.log(JSON.stringify(v, null, 2));
    else console.error(`⚪ ${v.motivo}`);
    process.exit(2);
  }

  const extra = {
    ...(DETTAGLIO && stash.length ? { dettaglio: dettaglio(radice, stash) } : {}),
    ...(RIASSUNTO && stash.length ? { riassunto: riassumi(radice, stash) } : {}),
  };

  if (JSON_MODE) {
    console.log(JSON.stringify({ ...v, tetto, radice, ...extra }, null, 2));
  } else if (v.esito === "dimenticate") {
    console.log(`\n📦 MESSE DA PARTE E MAI RIPRESE — ${v.motivo}\n`);
    console.log(`Una messa da parte è un prestito: chi la crea deve restituirla. Se si accumulano,`);
    console.log(`il meccanismo che le crea non le riprende — ed è lavoro che sparisce in silenzio.\n`);
    for (const s of (stash || []).slice(0, 5)) console.log(`  • ${s.rif} — ${s.messaggio}`);
    if ((stash || []).length > 5) console.log(`  … e altre ${stash.length - 5}`);
    console.log(`\nCosa c'è dentro: node cervello/stash-dimenticate.mjs --dettaglio`);
  } else {
    console.log(`✅ ${v.quante} messe da parte (tetto ${tetto}): nessuna dimenticata`);
  }
  if (RIASSUNTO && !JSON_MODE && stash?.length) {
    const r = riassumi(radice, stash);
    const g = (e) => (e ? new Date(e * 1000).toISOString().slice(0, 16).replace("T", " ") : "?");
    console.log(`\n— riassunto di ${r.totale} messe da parte (guardate le prime ${r.guardate}) —`);
    console.log(`  dal ${g(r.dalla)} al ${g(r.alla)}`);
    console.log(`  con memoria vera dentro: ${r.con_memoria} · solo file di dati: ${r.solo_dati} · non leggibili: ${r.illeggibili}`);
    console.log(`  cartelle toccate: ${r.cartelle.map(([c, n]) => `${c} (${n})`).join(", ")}`);
    console.log(`\n  Quelle con memoria dentro NON si buttano: contengono lavoro che il server ha scritto.`);
  }
  if (DETTAGLIO && !JSON_MODE && stash?.length) {
    console.log(`\n— cosa toccano le prime ${Math.min(10, stash.length)} —`);
    for (const d of dettaglio(radice, stash)) console.log(`  ${d.rif}: ${d.quanti} file — ${d.file.join(", ")}`);
  }
  process.exit(v.esito === "dimenticate" ? 1 : 0);
}

if (process.argv[1] && process.argv[1].endsWith("stash-dimenticate.mjs")) main();
