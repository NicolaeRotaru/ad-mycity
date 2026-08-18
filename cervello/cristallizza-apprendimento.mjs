#!/usr/bin/env node
// 🧬 CRISTALLIZZA-APPRENDIMENTO — l'esecutore che manca: da LEZIONE MATURA a PRINCIPIO, e accende il
// DECADIMENTO. È il passo che il guardiano (apprendimento-guardiano.mjs) misura ma che nessuno faceva.
//
// IL PROBLEMA (sonda «apprendimento», 2026-07-24): 75 lezioni MATURE (conf≥0.8 & evidenze≥3) mai
// promosse a principio, solo 4 principi su 466, 0 decadute. La spec (apprendimento.md) affidava la
// promozione e il decadimento alla prosa del venerdì → non succedeva mai. Questo script li ESEGUE,
// in modo meccanico e limitato (poche promozioni per giro, così converge senza floodare).
//
// COSA FA (scrive apprendimento.json solo con --applica; default = anteprima):
//   1) PROMOZIONE: prende le lezioni mature (conf≥0.8 & evidenze≥3, non già principio/decadute),
//      ne promuove le TOP-N per evidenze a `stato:"principio"` con `promosso_il`. La cristallizzazione
//      "in comportamento" avviene perché contesto-lezioni.mjs inietta i principi in OGNI contesto —
//      cioè `cristallizzato_in:"memoria-persistente"`.
//   2) RICONCILIA il top-level `principi[]` con TUTTE le lezioni-principio (la sonda ha trovato 3≠4).
//   3) DECADIMENTO: le lezioni ATTIVE non riconfermate da > DECAY_DAYS perdono confidenza; sotto 0.3
//      diventano `decaduta` (restano archiviate, non si applicano). Così l'archivio smette di crescere
//      all'infinito (era 0 decadute).
//   4) Aggiorna `meta` (lezioni_attive, promosse_a_principio, decadute, cristallizzazione_ultima).
//
// USO:
//   node cervello/cristallizza-apprendimento.mjs            -> ANTEPRIMA (non scrive), report + exit 0
//   node cervello/cristallizza-apprendimento.mjs --applica   -> scrive apprendimento.json
//   node cervello/cristallizza-apprendimento.mjs --max 5     -> quante promozioni per esecuzione (default 5)
//   node cervello/cristallizza-apprendimento.mjs --json       -> output macchina
//
// Sola scrittura su apprendimento.json (memoria AI, area della macchina). Fail-safe: se il file manca
// o è rotto, non fa nulla ed esce 0 (non deve mai rompere un giro).

import { readFileSync, existsSync, rmSync } from "node:fs";
import { scriviJsonAtomico } from "./scrivi-json.mjs"; // AR-558: l'indentazione la legge il file
import { giorniDa, passoDovuto, tettoDecadutePerGiro } from "./tetti-archivio.mjs"; // AR-182: il tempo si misura in tempo
import { timbroOra } from "./ora-piacenza.mjs"; // AR-666: l'ora di casa da un posto solo
import { lezioniVive } from "./misura-parziale.mjs"; // AR-362: una sola definizione di «lezione viva»
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const APPR = join(ROOT, "MyCity-Vault", "90-Memoria-AI", "auto-coscienza", "apprendimento.json");

const args = process.argv.slice(2);
const APPLICA = args.includes("--applica");
const JSON_OUT = args.includes("--json");
const maxIdx = args.indexOf("--max");
const MAX_PROMOZIONI = maxIdx >= 0 && args[maxIdx + 1] ? Math.max(1, Number(args[maxIdx + 1]) || 5) : 5;

const CONF_PRINCIPIO = 0.8;
const EVIDENZE_PRINCIPIO = 3;
const DECAY_DAYS = 28; // ~4 settimane senza riconferma → inizia a decadere
const DECAY_STEP = 0.15; // quanto scende la confidenza a OGNI PASSO (non a ogni esecuzione — AR-182)
const DECAY_OGNI_GG = 7; // AR-182: un passo al massimo ogni 7 giorni. Il tempo si misura in tempo.
const DECAY_MAX_PER_GIRO = 5; // AR-182: quante lezioni possono morire in un giro solo
const CONF_MORTE = 0.3; // sotto = decaduta

// AR-666 — qui vivevano due copie di roba che esiste già altrove, e la seconda era rotta.
//
//   · `oraRoma()` era l'orologio di casa riscritto a mano: stesso identico formatter di `timbroOra`,
//     in un file che non lo importava. Adesso lo importa.
//   · `giorniDa()` era la gemella di quella di `tetti-archivio.mjs` — che questo file importava già
//     per il decadimento — ma leggeva il timbro col `Date.parse` nudo. Una stringa senza fuso, per
//     lo standard, è ora LOCALE del processo: sul portatile italiano tornava giusta, sul server in
//     UTC tornava spostata di una o due ore, e ogni lezione risultava più giovane del vero. Sopra
//     quel numero sta la soglia dei 28 giorni che decide se una lezione decade: due copie della
//     stessa domanda, e quella sbagliata era proprio quella che girava in produzione.

/** L'ora di Piacenza, «AAAA-MM-GG HH:MM» — dall'orologio di casa, non da una copia locale. */
const oraRoma = () => timbroOra();

function fine(payload, exit = 0) {
  if (JSON_OUT) process.stdout.write(JSON.stringify(payload, null, 2));
  process.exit(exit);
}

// AR-771 — la guardia «sono stato lanciato io?». Prima, importare questo file ne ESEGUIVA il
// programma: bastava che una prova lo aprisse per far partire promozioni e decadimenti sull'archivio
// vero. Il guardiano di casa lo segnalava già, sotto un tetto tollerato; toccando il file in questo
// lotto il debito è diventato mio, ed è giusto così — chi tocca una casa ne eredita le crepe.
// Nessun `export` qui dentro e nessuno lo importa per usarne pezzi: i test lo leggono come testo.
if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
if (!existsSync(APPR)) fine({ esito: "assente" });

let dati;
try {
  dati = JSON.parse(readFileSync(APPR, "utf8"));
} catch {
  fine({ esito: "illeggibile" });
}

const lezioni = Array.isArray(dati.lezioni) ? dati.lezioni : [];
const ora = oraRoma();

// --- 1) PROMOZIONE: le mature (non principio/decadute) → principio, top-N per evidenze ---
const mature = lezioni
  .filter(
    (l) =>
      l &&
      Number(l.confidenza) >= CONF_PRINCIPIO &&
      Number(l.evidenze) >= EVIDENZE_PRINCIPIO &&
      l.stato !== "principio" &&
      l.stato !== "decaduta",
  )
  .sort((a, b) => (Number(b.evidenze) || 0) - (Number(a.evidenze) || 0));

const daPromuovere = mature.slice(0, MAX_PROMOZIONI);
const promosse = [];
for (const l of daPromuovere) {
  l.stato = "principio";
  l.promosso_il = ora;
  l.cristallizzato_in = "memoria-persistente"; // iniettato in ogni contesto da contesto-lezioni.mjs
  promosse.push({ id: l.id, testo: String(l.testo || "").slice(0, 90), evidenze: l.evidenze });
}

// --- 2) RICONCILIA il top-level principi[] con TUTTE le lezioni-principio ---
const tuttiPrincipi = lezioni.filter((l) => l && l.stato === "principio");
dati.principi = tuttiPrincipi.map((l) => ({
  id: l.id,
  testo: l.testo,
  tag: l.tag,
  reparto: l.reparto,
  promosso_il: l.promosso_il || l.ultima_conferma || ora,
}));

// --- 3) DECADIMENTO: attive non riconfermate da > DECAY_DAYS ---
//
// AR-182 — lo sconto era applicato A OGNI ESECUZIONE. Lo script è nato come passo di un ciclo
// SETTIMANALE ed è finito dentro un giro che gira 9 volte al giorno: «−0,15 ogni tanto» è diventato
// «−1,35 al giorno», e nessuno se n'è accorto perché il codice non era cambiato — era cambiata la
// frequenza sotto i piedi.
//
// Misurato il 28/7, il giorno in cui la cosa sarebbe partita: DECAY_DAYS=28 e la lezione più vecchia
// aveva esattamente 28 giorni. 2 lezioni superavano la soglia quel giorno, 17 entro il giorno dopo,
// 38 entro tre giorni; con confidenza mediana 0,86 bastavano 4 esecuzioni per scendere sotto 0,3,
// cioè **10,7 ore**. Un'estinzione di massa a blocchi che nessuno aveva deciso.
//
// Ora il passo è legato al TEMPO (al massimo uno ogni DECAY_OGNI_GG giorni) e c'è un tetto per giro:
// una memoria che si svuota a blocchi non sta invecchiando, sta perdendo pezzi — e va vista mentre
// succede, non dopo.
/**
 * Il freno di una lezione monta ancora la guardia? (AR-771)
 * Vero solo se lo script citato nel campo `gate` esiste sul disco. Una stringa non è un guardiano:
 * se il file è stato tolto, la regola non è più in vigore e la lezione riprende a invecchiare.
 */
function frenoVivoDi(l) {
  const g = typeof l?.gate === "string" ? l.gate : "";
  const m = g.match(/([\w./-]*\/)?([\w.-]+\.(?:m?js|cjs|sh))\b/);
  if (!m) return false;
  const rel = (m[1] || "") + m[2];
  return existsSync(join(ROOT, rel));
}

/** La data dell'uso più recente, o null. È la traccia che lascia `freno-scattato.mjs` (AR-770). */
function ultimoUsoDi(l) {
  const usi = Array.isArray(l?.usi) ? l.usi : Array.isArray(l?.applicata_in) ? l.applicata_in : [];
  const date = usi.map((u) => (typeof u === "string" ? u : u?.quando)).filter(Boolean).sort();
  return date.length ? date[date.length - 1] : null;
}

const decadute = [];
const rimandate = [];
for (const l of lezioni) {
  if (!l || l.stato !== "attiva") continue;
  const { decade } = passoDovuto({
    ultimaConferma: l.ultima_conferma || l.nato,
    ultimoPasso: l.decaduto_step_il,
    giorniSoglia: DECAY_DAYS,
    giorniFraPassi: DECAY_OGNI_GG,
    // AR-771 — le due cose che valgono quanto una riconferma. Il freno conta solo se il file del
    // guardiano ESISTE davvero: una stringa scritta in una scheda non monta la guardia, e se qualcuno
    // toglie il guardiano la lezione deve tornare a invecchiare come tutte le altre.
    frenoVivo: frenoVivoDi(l),
    ultimoUso: ultimoUsoDi(l),
  });
  if (!decade) continue;
  const { ammesse } = tettoDecadutePerGiro(decadute.length + 1, DECAY_MAX_PER_GIRO);
  if (ammesse <= decadute.length) {
    rimandate.push(l.id); // il tetto per giro è pieno: ci riprova il prossimo giro
    continue;
  }
  l.confidenza = Math.max(0, Number(l.confidenza || 0) - DECAY_STEP);
  l.decaduto_step_il = ora; // ← senza questa riga il passo tornerebbe a essere per esecuzione
  if (l.confidenza < CONF_MORTE) {
    l.stato = "decaduta";
    l.decaduta_il = ora;
    decadute.push({ id: l.id, testo: String(l.testo || "").slice(0, 70) });
  }
}
if (rimandate.length) {
  console.log(`   ⏳ ${rimandate.length} lezioni oltre soglia rimandate al prossimo giro (tetto ${DECAY_MAX_PER_GIRO}/giro, AR-182).`);
}

// --- 4) meta ---
// AR-362 — `meta.lezioni_attive` lo scrivono DUE script: qui valeva `stato === "attiva"` (381),
// in tasso-lezioni `stato !== "decaduta"` (476). Stesso campo, due significati, e la Cabina mostrava
// quello di chi aveva girato per ultimo. Ora la definizione è una sola (`lezioniVive`) e accanto al
// numero viaggia la partizione completa, così «attive» e «vive» smettono di essere sinonimi a caso.
const partizione = lezioniVive(dati);
const nAttive = partizione.vive;
const nPrincipi = partizione.per_stato.principio;
const nDecadute = partizione.per_stato.decaduta;
dati.meta = dati.meta || {};
dati.meta.lezioni_attive = nAttive;
dati.meta.lezioni_totali = partizione.totale;
dati.meta.lezioni_per_stato = partizione.per_stato;
dati.meta.lezioni_conteggio_quadra = partizione.quadra;
dati.meta.promosse_a_principio = nPrincipi;
dati.meta.decadute = nDecadute;
dati.meta.cristallizzazione_ultima = ora;

const report = {
  esito: "ok",
  applicato: APPLICA,
  promosse_ora: promosse.length,
  promosse,
  arretrato_restante: Math.max(0, mature.length - promosse.length),
  decadute_ora: decadute.length,
  // AR-362: `vive` INCLUDE i principi (sono lezioni applicabili). Tenerli anche come voce a sé
  // sommandoli a `attive` li conterebbe due volte: la partizione per stato è l'unica somma che torna.
  totali: { vive: nAttive, per_stato: partizione.per_stato, totale: partizione.totale, quadra: partizione.quadra },
};

if (APPLICA) {
  try {
    // Reversibilità = storia git dell'archivio (committato ogni giro). NIENTE .bak nel perimetro-
    // memoria: il giro (git add -A MyCity-Vault) lo ricommitterebbe come ~1MB di churn a ogni giro.
    // Se un vecchio .bak è rimasto tracciato, rimuovilo: il git add -A del giro lo toglie da main.
    try {
      if (existsSync(APPR + ".bak")) rmSync(APPR + ".bak");
    } catch {
      /* best-effort */
    }
    // AR-558: terza porta sullo stesso file di AR-522. Il file ha UN spazio; scriverlo a due lo
    // riscrive tutto, il guardiano della forma blocca il commit e da lì non si pubblica più niente.
    scriviJsonAtomico(APPR, dati);
    report.scritto = true;
  } catch (e) {
    report.esito = "errore-scrittura";
    report.errore = String(e.message || e);
    fine(report, 0);
  }
}

if (JSON_OUT) fine(report);

// report umano
console.log("🧬 CRISTALLIZZAZIONE APPRENDIMENTO" + (APPLICA ? " (APPLICATA)" : " (anteprima — usa --applica per scrivere)"));
console.log(`   promosse a principio ORA: ${promosse.length} (arretrato restante: ${report.arretrato_restante})`);
for (const p of promosse) console.log(`     ⬆︎ [${p.evidenze} ev] ${p.testo}…`);
console.log(`   decadute ORA: ${decadute.length}`);
// AR-362: si stampa la partizione INTERA (somma = totale), non tre numeri scelti a mano che non
// tornano — «381 attive» accanto a «476 lezioni» era già una misura parziale letta come intera.
console.log(
  `   lezioni → ${nAttive} vive su ${partizione.totale} (` +
    Object.entries(partizione.per_stato)
      .map(([s, n]) => `${s}: ${n}`)
      .join(" · ") +
    `)${partizione.quadra ? "" : " ⚠️ la somma NON torna"}`,
);
if (!APPLICA) console.log("   (nulla scritto: anteprima)");
process.exit(0);
}
