#!/usr/bin/env node
// 📮 IL CONTATORE DEL BLOCCO CHE SPARISCE — l'abitudine, non l'istanza singola.
//
// PERCHÉ ESISTE. Nicola, 3/8: «come fai in modo che non ti dimentichi mai di quel blocco? cosa ti
// serve, un misuratore, un cancello, o cosa?». La domanda è giusta e la risposta onesta è: né l'uno
// né l'altro da soli. Il cancello dello Stop ferma IL MESSAGGIO di adesso — ma non sa dire se sto
// migliorando o se sto solo imparando a passare il controllo. Questo contatore guarda la serie:
// quanti dei miei messaggi lunghi, negli ultimi giorni, sono usciti senza ognuna delle quattro
// risposte. È lo stesso attrezzo di `conta-verdetti-muti.mjs`, puntato su un'altra abitudine.
//
// IL METRO È UNA QUOTA, NON UN CONTO. Un numero secco cresce col numero di messaggi: dieci
// dimenticanze su cento è meglio di cinque su dieci, e un tetto sul conto secco premierebbe il
// silenzio. Quindi il tetto sta sulla PERCENTUALE, e scende senza risalire (cricchetto).
//
// COSA NON MISURA — dichiarato, non scoperto dopo:
//   · le sessioni di cui non ho la trascrizione sotto mano: se non c'è nessun file leggibile esco 2
//     (cieco), mai 0. Un contatore che non trova le trascrizioni e dice «zero dimenticanze» è la
//     bugia peggiore che potrebbe raccontare.
//   · la QUALITÀ del blocco: un «Cosa cambia per te» presente e vuoto qui risulta a posto. Quello lo
//     prende `si-capisce.mjs` con le sue misure di forma, non questo.
//   · i messaggi corti: la regola dei quattro blocchi vale sui testi lunghi, e qui si conta la stessa
//     soglia (`RIGHE_TESTO_LUNGO`) per non misurare una cosa diversa da quella che il freno pretende.
//
// Uso:
//   node cervello/conta-blocco-mancante.mjs                 # verdetto leggibile
//   node cervello/conta-blocco-mancante.mjs --json          # per gli script
//   node cervello/conta-blocco-mancante.mjs --giorni 14     # finestra diversa (default 7)
//   node cervello/conta-blocco-mancante.mjs --aggiorna-tetto  # abbassa il tetto al valore di adesso
//
// Uscita (contratto guardiani, AR-322): 0 = sotto il tetto · 1 = l'abitudine è peggiorata · 2 = cieco
//
// 🟢 Sola lettura sulle trascrizioni. Scrive solo dentro la memoria dell'AI (auto-coscienza/).

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { scriviJsonAtomico } from "./scrivi-json.mjs";
import { BLOCCHI, RIGHE_TESTO_LUNGO, parteDiNicola, indiceDellaPrimaRispostaNumerata } from "./si-capisce.mjs";
import { testiAssistente } from "./cancello-stop.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);
const REFERTO = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/blocco-mancante.json");

const JSON_MODE = process.argv.includes("--json");
const AGGIORNA = process.argv.includes("--aggiorna-tetto");
const GIORNI = Number(process.argv[process.argv.indexOf("--giorni") + 1]) || 7;

/**
 * Le cartelle dove Claude Code tiene le trascrizioni di questo progetto.
 *
 * Torna `[]` quando davvero non ce ne sono e `null` quando NON HO POTUTO GUARDARE (permessi, cartella
 * illeggibile). Sono due cose diverse e vanno dette diverse: un `catch { return [] }` le appiattisce
 * su «nessuna trascrizione», e da lì il contatore direbbe «zero dimenticanze» per un errore di
 * lettura. È la malattia `fonte-troncata-letta-per-intera`: il verdetto esce calcolato su ciò che si
 * è riusciti a guardare e ha la stessa faccia di uno completo.
 */
export function cartelleTrascrizioni(casa = homedir()) {
  const base = join(casa, ".claude", "projects");
  if (!existsSync(base)) return [];
  try {
    return readdirSync(base)
      .filter((n) => n.includes("ad-mycity"))
      .map((n) => join(base, n));
  } catch {
    return null; // «non ho potuto guardare» — diverso da «non c'è niente»
  }
}

/**
 * I file di trascrizione toccati negli ultimi `giorni`, dal più recente — e quello che ho SCARTATO.
 *
 * Il recinto è l'estensione `.jsonl`, che è il formato con cui Claude Code scrive le trascrizioni
 * oggi. Un recinto dedotto dagli esempi è la malattia `perimetro-dedotto-non-misurato`: nasce verde e
 * resta verde, perché fuori dal recinto non guarda e un verde non fa domande. Quindi non lo do per
 * buono — lo MISURO: torno anche quanti file ho visto e quanti ne ho lasciati fuori, così se un
 * giorno il formato cambia il referto dice «ho scartato 40 file su 40» invece di «zero dimenticanze».
 */
export function trascrizioniRecenti(cartelle, giorni, adesso = Date.now()) {
  const limite = adesso - giorni * 86_400_000;
  const fuori = [];
  let visti = 0;
  const scartati = new Map();
  for (const c of cartelle) {
    let nomi = [];
    try {
      nomi = readdirSync(c);
    } catch {
      continue;
    }
    for (const n of nomi) {
      const p = join(c, n);
      let s;
      try {
        s = statSync(p);
      } catch {
        continue; // file sparito mentre leggevo: non è un dato, si salta
      }
      if (!s.isFile() || s.mtimeMs < limite) continue;
      visti++;
      if (!n.endsWith(".jsonl")) {
        const est = (n.match(/\.[^.]+$/) || ["(senza estensione)"])[0];
        scartati.set(est, (scartati.get(est) || 0) + 1);
        continue;
      }
      fuori.push({ percorso: p, quando: s.mtimeMs });
    }
  }
  fuori.sort((a, b) => b.quando - a.quando);
  return { presi: fuori, visti, scartati: Object.fromEntries(scartati) };
}

/**
 * Un messaggio va misurato? Solo se la regola dei quattro blocchi lo riguarda.
 *
 * Stessa condizione del freno (`si-capisce.mjs`): testo lungo OPPURE risposta a domande numerate.
 * Se qui contassi anche i messaggi corti, il contatore direbbe che dimentico il blocco nove volte su
 * dieci — vero come numero e falso come accusa, perché su un «fatto, è verde» il blocco non va.
 */
export function daMisurare(testo) {
  const righe = parteDiNicola(testo).filter((r) => r.trim());
  if (righe.length >= RIGHE_TESTO_LUNGO) return true;
  return indiceDellaPrimaRispostaNumerata(parteDiNicola(testo)) !== -1;
}

/** Quante volte ogni blocco è mancato, sui messaggi che lo pretendevano. */
export function conta(testi = []) {
  const miei = testi.filter(daMisurare);
  const mancanze = Object.fromEntries(BLOCCHI.map((b) => [b, 0]));
  const esempi = Object.fromEntries(BLOCCHI.map((b) => [b, []]));
  for (const t of miei) {
    const corpo = parteDiNicola(t).join("\n");
    for (const b of BLOCCHI) {
      if (!new RegExp(b.replace(/\s+/g, "\\s+"), "i").test(corpo)) {
        mancanze[b]++;
        if (esempi[b].length < 3) esempi[b].push(t.slice(0, 70).replace(/\s+/g, " "));
      }
    }
  }
  const peggiore = BLOCCHI.reduce((a, b) => (mancanze[b] > mancanze[a] ? b : a), BLOCCHI[0]);
  return {
    misurati: miei.length,
    mancanze,
    esempi,
    peggiore,
    quota: miei.length ? Math.round((mancanze[peggiore] / miei.length) * 100) : null,
  };
}

/** Il verdetto: l'abitudine sta sparendo o sto solo imparando a passare il controllo? */
export function verdetto({ conto, tetto }) {
  const righe = [];
  let rotto = false;
  if (conto.quota === null) return { righe, rotto };
  const t = tetto ?? conto.quota;
  if (conto.quota > t) {
    rotto = true;
    righe.push(
      `❌ «${conto.peggiore}» manca nel ${conto.quota}% dei messaggi che lo pretendevano (tetto ${t}%): l'abitudine non sta sparendo.`,
    );
  } else if (conto.quota < t) {
    righe.push(`⬇️  scesa dal ${t}% al ${conto.quota}%: abbassa il tetto con --aggiorna-tetto.`);
  }
  return { righe, rotto };
}

function main() {
  const cartelle = cartelleTrascrizioni();
  if (cartelle === null) {
    console.error(
      "⚪ CIECO: non ho potuto leggere ~/.claude/projects (permessi o cartella illeggibile). Non è «nessuna trascrizione»: è non aver guardato.",
    );
    process.exit(2);
  }
  const trovate = trascrizioniRecenti(cartelle, GIORNI);
  const file = trovate.presi;
  if (!file.length) {
    const scartati = Object.entries(trovate.scartati)
      .map(([e, n]) => `${n}${e}`)
      .join(", ");
    console.error(
      `⚪ CIECO: nessuna trascrizione .jsonl degli ultimi ${GIORNI} giorni sotto ~/.claude/projects` +
        (trovate.visti ? ` (ho visto ${trovate.visti} file e li ho scartati tutti: ${scartati} — se il formato è cambiato, il recinto va allargato)` : "") +
        ". Qui non posso vedere come scrivo. (cieco non è verde: «zero dimenticanze» sarebbe una bugia)",
    );
    process.exit(2);
  }

  const testi = [];
  let letti = 0;
  for (const f of file) {
    try {
      testi.push(...testiAssistente(readFileSync(f.percorso, "utf8").split("\n").filter(Boolean)));
      letti++;
    } catch {
      /* trascrizione illeggibile: conta come non letta, e si vede nel referto */
    }
  }
  if (!letti) {
    console.error(`⚪ CIECO: ${file.length} trascrizioni trovate e nessuna leggibile.`);
    process.exit(2);
  }

  const conto = conta(testi);
  const precedente = existsSync(REFERTO) ? JSON.parse(readFileSync(REFERTO, "utf8")) : {};
  const tetto = precedente?.tetto?.quota_peggiore ?? null;
  const v = verdetto({ conto, tetto });

  const referto = {
    _cosa_e:
      "📮 Quante volte un messaggio che pretendeva le quattro risposte è uscito senza. Il tetto è una QUOTA e SCENDE: aggiungerne è un errore, portarne via è il lavoro. Nato dalla domanda di Nicola del 3/8 («come fai a non dimenticartene mai?»).",
    misurato: new Date().toISOString().slice(0, 16).replace("T", " "),
    finestra_giorni: GIORNI,
    trascrizioni: { trovate: file.length, lette: letti, file_visti: trovate.visti, scartati_per_estensione: trovate.scartati },
    messaggi_misurati: conto.misurati,
    mancanze: conto.mancanze,
    blocco_peggiore: conto.peggiore,
    quota_peggiore: conto.quota,
    esempi: conto.esempi[conto.peggiore],
    tetto:
      AGGIORNA && conto.quota !== null
        ? { quota_peggiore: Math.min(conto.quota, tetto ?? conto.quota) }
        : precedente.tetto || { quota_peggiore: conto.quota },
    verdetto: v,
  };
  scriviJsonAtomico(REFERTO, referto);

  if (JSON_MODE) {
    console.log(JSON.stringify(referto, null, 2));
  } else {
    console.log("\n📮 IL BLOCCO CHE SPARISCE — quante volte ho scritto senza rispondere\n");
    console.log(`   Finestra:      ultimi ${GIORNI} giorni · ${letti} trascrizioni su ${file.length}`);
    console.log(`   Messaggi che pretendevano le quattro risposte: ${conto.misurati}`);
    for (const b of BLOCCHI) {
      const n = conto.mancanze[b];
      const q = conto.misurati ? Math.round((n / conto.misurati) * 100) : 0;
      console.log(`   ${n ? "·" : " "} ${b.padEnd(22)} mancato ${String(n).padStart(3)} volte (${q}%)`);
    }
    console.log(`\n   Il peggiore: «${conto.peggiore}» al ${conto.quota}% · tetto ${referto.tetto.quota_peggiore}%`);
    for (const r of v.righe) console.log(`   ${r}`);
    if (!v.righe.length) console.log("   ✅ sotto il tetto.");
    console.log(`\n   Referto: ${REFERTO}\n`);
  }

  if (AGGIORNA) process.exit(0);
  process.exit(v.rotto ? 1 : 0);
}

if (process.argv[1] && process.argv[1].endsWith("conta-blocco-mancante.mjs")) main();
