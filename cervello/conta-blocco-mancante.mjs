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
//   node cervello/conta-blocco-mancante.mjs --sola-lettura  # stampa e NON scrive niente
//
// Uscita (contratto guardiani, AR-322): 0 = sotto il tetto · 1 = l'abitudine è peggiorata · 2 = cieco
//
// 🟢 Sola lettura sulle trascrizioni. Scrive solo dentro la memoria dell'AI (auto-coscienza/).
//
// ─────────────────────────────────────────────────────────────────────────────
// AR-663 · AR-568 — PERCHÉ INTERROGARE QUESTO CONTATORE NON DEVE PEGGIORARLO
// ─────────────────────────────────────────────────────────────────────────────
// Fino al lotto 42 questo file chiamava `scriviJsonAtomico(REFERTO, …)` SEMPRE — anche con `--json`,
// anche da una prova — e `REFERTO` era un percorso fisso, senza nessun modo di deviarlo. Chi lo
// eseguiva per sapere come stava messo lo PEGGIORAVA: eseguendolo da un test si è sovrascritto il
// referto vero (misurato il 13/8 alle 18:46 → 00:02, trascrizioni 589 → 1, perché nell'ambiente di
// prova le trascrizioni non ci sono) e si è dovuto ripristinare a mano.
//
// Il caso peggiore non è il rosso, che si vede. È questo: la finestra passa da 26 messaggi a 2, la
// quota scende dal 100% al 50%, e il voto MIGLIORA perché si è misurato di meno. Adesso il referto
// porta `origine` e `copertura` (quanti messaggi ha davvero misurato) e la scrittura passa da
// `decidiScrittura`: una misura più povera scritta da un punto d'osservazione diverso non prende il
// posto di una più ricca.
//   · `BLOCCO_MANCANTE_FILE`  → devia il referto (le prove ci puntano una cartella temporanea);
//   · `--sola-lettura` e `--json` → guardano e non toccano.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { scriviJsonAtomico } from "./scrivi-json.mjs";
import {
  BLOCCHI,
  livelloDiStruttura,
  parteDiNicola,
  indiceDellaPrimaRispostaNumerata,
} from "./si-capisce.mjs";
import { testiAssistente } from "./cancello-stop.mjs";
import { timbroOra } from "./ora-piacenza.mjs";
import { decidiScrittura, timbroProvenienza } from "./scrittura-misura.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);
// AR-663: il referto è DEVIABILE. Senza questa riga chiunque esegua il contatore — una prova, una
// diagnosi, una sessione senza trascrizioni — scrive sopra la fotografia vera.
const REFERTO = process.env.BLOCCO_MANCANTE_FILE || join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/blocco-mancante.json");

const JSON_MODE = process.argv.includes("--json");
const AGGIORNA = process.argv.includes("--aggiorna-tetto");
// `--json` è un'INTERROGAZIONE: chi vuole il dato per uno script non sta chiedendo di aggiornare la
// memoria di tutti. `--aggiorna-tetto` resta l'unico modo esplicito di scrivere insieme al giro.
const SOLA_LETTURA = process.argv.includes("--sola-lettura") || (JSON_MODE && !AGGIORNA);
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
 * Stessa condizione del freno (`si-capisce.mjs`): testo lungo OPPURE risposta a domande numerate che
 * non sia cortissima. Se qui contassi anche i messaggi corti, il contatore direbbe che dimentico il
 * blocco nove volte su dieci — vero come numero e falso come accusa, perché su un «fatto, è verde»
 * il blocco non va.
 *
 * La soglia bassa arriva da Nicola il 4/8 (AR-530): su una risposta di poche righe i quattro titoli
 * pesano più del testo. Questa condizione DEVE restare gemella di quella del freno: se il contatore
 * misura messaggi che il freno non pretende, misura una dimenticanza che non è tale.
 */
export function daMisurare(testo) {
  const livello = livelloDiStruttura(testo);
  if (livello === "lunga") return true;
  if (livello === "corta") return false;
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

/**
 * Dichiara il ⚪ NEL CANALE IN CUI È STATA FATTA LA DOMANDA, poi esce 2.
 *
 * Prima il cieco usciva sempre in italiano su stderr, anche quando l'interrogazione era `--json`.
 * Chi chiede JSON è una macchina, e una macchina che riceve una frase non sa distinguere «non ho
 * potuto guardare» da «sono morto a metà»: le resta solo il numero d'uscita, ed è esattamente il
 * modo di ragionare che il lotto 42 sta togliendo di mezzo (AR-707).
 *
 * L'ho scoperto dalla CI: su GitHub non esiste nessuna trascrizione da contare, quindi il guardiano
 * usciva cieco in prosa e la prova che lo interroga in JSON si rompeva sul parse — un rosso che
 * parlava dell'ambiente e sembrava parlare del fix.
 */
function dichiaraCieco(motivo) {
  if (JSON_MODE) {
    console.log(JSON.stringify({ _cieco: true, _motivo: motivo, _referto_risolto: REFERTO, _ha_scritto: false }, null, 2));
  } else {
    console.error(`⚪ CIECO: ${motivo}`);
  }
  process.exit(2);
}

function main() {
  const cartelle = cartelleTrascrizioni();
  if (cartelle === null) {
    dichiaraCieco(
      "non ho potuto leggere ~/.claude/projects (permessi o cartella illeggibile). Non è «nessuna trascrizione»: è non aver guardato.",
    );
  }
  const trovate = trascrizioniRecenti(cartelle, GIORNI);
  const file = trovate.presi;
  if (!file.length) {
    const scartati = Object.entries(trovate.scartati)
      .map(([e, n]) => `${n}${e}`)
      .join(", ");
    dichiaraCieco(
      `nessuna trascrizione .jsonl degli ultimi ${GIORNI} giorni sotto ~/.claude/projects` +
        (trovate.visti ? ` (ho visto ${trovate.visti} file e li ho scartati tutti: ${scartati} — se il formato è cambiato, il recinto va allargato)` : "") +
        ". Qui non posso vedere come scrivo. (cieco non è verde: «zero dimenticanze» sarebbe una bugia)",
    );
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
    dichiaraCieco(`${file.length} trascrizioni trovate e nessuna leggibile.`);
  }

  const conto = conta(testi);
  // Il referto precedente serve a DUE cose: il tetto (che scende e non risale) e il confronto di
  // copertura. Un errore di lettura non diventa «non c'era niente prima»: si dichiara e si porta
  // fino alla decisione, così una riparazione non si traveste da confronto vinto.
  let precedente = {};
  let leggibile = true;
  try {
    if (existsSync(REFERTO)) precedente = JSON.parse(readFileSync(REFERTO, "utf8"));
  } catch {
    leggibile = false;
  }
  const tetto = precedente?.tetto?.quota_peggiore ?? null;
  const v = verdetto({ conto, tetto });

  const referto = {
    _cosa_e:
      "📮 Quante volte un messaggio che pretendeva le quattro risposte è uscito senza. Il tetto è una QUOTA e SCENDE: aggiungerne è un errore, portarne via è il lavoro. Nato dalla domanda di Nicola del 3/8 («come fai a non dimenticartene mai?»).",
    misurato: timbroOra(),
    // AR-568 (a) · AR-286 — DA DOVE viene questa misura e QUANTO ha visto. La copertura è il numero
    // di messaggi davvero misurati: è il campione, cioè l'unica cosa che rende confrontabili due
    // quote. Senza, «50% su 2 messaggi» e «50% su 200» sono lo stesso numero.
    ...timbroProvenienza({ env: process.env, copertura: conto.misurati, scrittoDa: "conta-blocco-mancante.mjs" }),
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
  // AR-663 · AR-568 (b) — la scrittura passa dalla decisione condivisa, non da un `if` scritto qui.
  const scelta = decidiScrittura({ solaLettura: SOLA_LETTURA, misuraNuova: referto, misuraVecchia: precedente?.misurato ? precedente : null, vecchiaLeggibile: leggibile });
  if (scelta.scrivi) scriviJsonAtomico(REFERTO, referto);

  if (JSON_MODE) {
    // AR-663 — il referto DICE dove scriverebbe e se ha scritto. Serve a una prova che deve valere
    // ovunque: guardare il disco funziona solo dove il guardiano ha dati da contare, e su una
    // macchina senza trascrizioni (la CI) non scrive comunque — quindi «non ha sporcato il file
    // vero» sarebbe vero anche col fix disfatto. Il percorso RISOLTO invece e la cosa che il fix
    // cambia davvero, e si legge allo stesso modo dappertutto.
    console.log(JSON.stringify({ ...referto, _referto_risolto: REFERTO, _ha_scritto: scelta.scrivi }, null, 2));
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
    console.log(`\n   Referto: ${REFERTO}${scelta.scrivi ? "" : ` — NON riscritto: ${scelta.motivo}`}\n`);
  }

  if (AGGIORNA) process.exit(0);
  process.exit(v.rotto ? 1 : 0);
}

if (process.argv[1] && process.argv[1].endsWith("conta-blocco-mancante.mjs")) main();
