#!/usr/bin/env node
// 🛡️ IL CONTROLLO DI SICUREZZA DI SUPABASE, SALVATO IN MEMORIA — per la casella «Sicurezza & accessi».
//
// Perché esiste (Nicola, 2026-11-05 09:44, «Fai le due cose»): la casella aspettava «una chiave di
// gestione di Supabase che solo tu puoi creare». Non serve: la sessione dell'AD legge già il
// controllo di sicurezza di Supabase («advisors») con lo strumento MCP `get_advisors`. Questo
// script prende quell'uscita grezza e la salva in `MyCity-Vault/90-Memoria-AI/sicurezza-supabase.json`,
// con l'ora. Il Pannello la legge e mostra di quando è: un controllo vecchio si vede vecchio.
// Niente chiave nuova nel Pannello, quindi niente segreto in più da proteggere.
//
// Uso (dalla sessione dell'AD, o nel giro quando il MCP di Supabase risponde):
//   1. get_advisors(project_id="clmpyfvpvfjgeviworth", type="security") → salva l'uscita in un file
//      FUORI dal repository (per esempio in /tmp): l'uscita grezza ha i nomi delle funzioni e delle
//      viste segnalate, e il giro pubblica con «git add -A» le cartelle del vault.
//      (È il database del SITO; l'altro progetto, xjljcsorpbqwttrejqte, è la memoria della macchina.)
//   2. node cervello/sicurezza-supabase.mjs scrivi <file-grezzo.json> --progetto clmpyfvpvfjgeviworth [--letto "AAAA-MM-GG HH:MM"]
//      --progetto è obbligatorio e deve essere il database del sito: un controllo dell'altro
//      database mostrato come «del sito» sarebbe un dato falso (collaudo del 5/11).
//      «aggiornato» è l'ora in cui Supabase è stato LETTO: --letto, oppure l'observed_at più recente
//      dei ritrovamenti, oppure l'ora del file grezzo. Un'ora nel futuro si rifiuta.
//      Mai l'ora in cui si salva: un file vecchio salvato oggi sembrerebbe di oggi (collaudo del 5/11).
//
// 🟢 Scrive solo nella memoria della macchina. Non tocca il database.

import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { AD_ROOT } from "./git-github.mjs";
import { scriviJsonAtomico } from "./scrivi-json.mjs";

export const DESTINAZIONE = "MyCity-Vault/90-Memoria-AI/sicurezza-supabase.json";
export const PROGETTO_SITO = "clmpyfvpvfjgeviworth";
/** I nomi degli oggetti si salvano SOLO per le «informazioni» (INFO), per ammissione: qualunque
 *  altro livello — errori, avvisi, un livello nuovo o vuoto — tiene solo tipo e conto. Questo
 *  repository è pubblico, e i dettagli delle falle aperte stanno fuori (regola della corsia
 *  riservata, cervello/prediagnosi.mjs). */
const LIVELLI_CON_NOMI = new Set(["INFO"]);
const ESEMPI = 4;

/**
 * Dall'uscita di get_advisors (`{result:{lints:[…]}}`, oppure `{lints:[…]}`, oppure la lista)
 * alla forma che legge il Pannello: un avviso per tipo, col conto e qualche esempio.
 * Lancia un errore se non trova la lista: un file vuoto salvato come «nessun avviso» sarebbe
 * esattamente lo zero falso che la casella combatte.
 */
export function daAdvisors(grezzo, quando, progetto = null) {
  const lints = Array.isArray(grezzo) ? grezzo : Array.isArray(grezzo?.lints) ? grezzo.lints : Array.isArray(grezzo?.result?.lints) ? grezzo.result.lints : null;
  if (!lints) throw new Error("non trovo la lista «lints» nell'uscita di get_advisors: non salvo niente");
  // Solo i controlli di SICUREZZA: un'uscita di type=performance non va salvata come sicurezza.
  const diSicurezza = lints.filter((l) => l && (l.name || l.title) && (!Array.isArray(l.categories) || l.categories.includes("SECURITY")));
  if (lints.length && !diSicurezza.length) throw new Error("nell'uscita non c'è nessun controllo di sicurezza (forse è type=performance): non salvo niente");
  // Due forme possibili: raggruppata (un tipo con «count» e «findings») o una voce per oggetto
  // (stesso «name» ripetuto, senza count né findings). La seconda si raggruppa per nome: ogni voce
  // vale 1, mai 0 — un avviso presente salvato come zero è lo zero falso che la casella combatte.
  const perNome = new Map();
  for (const l of diSicurezza) {
    const chiave = l.name ?? l.title;
    const trovati = Array.isArray(l.findings) ? l.findings : [];
    const quanti = Number.isFinite(Number(l.count)) && Number(l.count) > 0 ? Number(l.count) : trovati.length || 1;
    const nomi = [...trovati.map((f) => f?.metadata?.name), l?.metadata?.name].filter(Boolean);
    const g = perNome.get(chiave);
    if (g) {
      g.quanti += quanti;
      g.nomi.push(...nomi);
    } else {
      perNome.set(chiave, {
        nome: l.name ?? null,
        titolo: l.title ?? l.name,
        livello: String(l.level ?? "").toUpperCase() || null,
        quanti,
        nomi,
        link: typeof l.remediation === "string" ? l.remediation : null,
      });
    }
  }
  const avvisi = [...perNome.values()].map(({ nomi, ...a }) => ({ ...a, esempi: LIVELLI_CON_NOMI.has(a.livello) ? [...new Set(nomi)].slice(0, ESEMPI) : [] }));
  // Gli oggetti DIVERSI fra errori e avvisi: la stessa funzione può stare in due controlli (chiamabile
  // da chi non ha l'accesso E da chi ce l'ha). Si conta solo se l'uscita elenca tutti i ritrovamenti;
  // altrimenti null, e il Pannello dice che il totale può contare due volte lo stesso oggetto.
  const nonInfo = [...perNome.values()].filter((a) => !LIVELLI_CON_NOMI.has(a.livello));
  const completo = nonInfo.every((a) => new Set(a.nomi).size >= a.quanti && a.nomi.length >= a.quanti);
  const oggetti_distinti = nonInfo.length && completo ? new Set(nonInfo.flatMap((a) => a.nomi)).size : nonInfo.length ? null : 0;
  return {
    _cosa_e:
      "Il controllo di sicurezza di Supabase sul database del sito, salvato dalla macchina (cervello/sicurezza-supabase.mjs dall'uscita di get_advisors). Lo legge la casella «Sicurezza & accessi» del Pannello, che mostra di quando è. Si rifà dalla sessione dell'AD o nel giro.",
    aggiornato: quando,
    progetto,
    oggetti_distinti,
    avvisi,
  };
}

/** L'observed_at più recente dei ritrovamenti, se c'è: è l'ora in cui Supabase ha guardato. */
export function osservatoIl(grezzo) {
  const lints = Array.isArray(grezzo) ? grezzo : grezzo?.lints ?? grezzo?.result?.lints ?? [];
  const ore = (Array.isArray(lints) ? lints : [])
    .flatMap((l) => (Array.isArray(l?.findings) ? l.findings : [l]))
    .map((f) => Date.parse(f?.observed_at ?? ""))
    .filter((n) => Number.isFinite(n));
  return ore.length ? new Date(Math.max(...ore)) : null;
}

/** Una data in «AAAA-MM-GG HH:MM» a Piacenza. */
export function oraDiPiacenza(d) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
}

function principale(argv) {
  const [comando, file] = argv;
  if (comando !== "scrivi" || !file) {
    console.error(`Uso: node cervello/sicurezza-supabase.mjs scrivi <uscita-get_advisors.json> --progetto ${PROGETTO_SITO} [--letto "AAAA-MM-GG HH:MM"]`);
    process.exit(2);
  }
  const i = argv.indexOf("--progetto");
  const progetto = i > 0 ? argv[i + 1] ?? null : null;
  if (progetto !== PROGETTO_SITO) {
    console.error(`--progetto deve essere il database del sito (${PROGETTO_SITO}), non «${progetto ?? "mancante"}»: non salvo niente.`);
    process.exit(2);
  }
  const j = argv.indexOf("--letto");
  const letto = j > 0 ? argv[j + 1] ?? null : null;
  if (letto && !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(letto)) {
    console.error(`--letto vuole «AAAA-MM-GG HH:MM», non «${letto}»`);
    process.exit(2);
  }
  const grezzo = JSON.parse(readFileSync(file, "utf8"));
  const visto = osservatoIl(grezzo);
  const quando = letto ?? (visto ? oraDiPiacenza(visto) : oraDiPiacenza(statSync(file).mtime));
  if (quando > oraDiPiacenza(new Date(Date.now() + 10 * 60_000))) {
    console.error(`l'ora della lettura (${quando}) è nel futuro: non salvo niente.`);
    process.exit(2);
  }
  const snap = daAdvisors(grezzo, quando, `${progetto} (il database del sito)`);
  // La penna condivisa: rispetta il freno della memoria (chi misura non sporca) e non lascia mai il
  // file a metà. Il controllo nuovo SOSTITUISCE il vecchio: un tipo di avviso che sparisce è chiuso.
  const scritto = scriviJsonAtomico(join(AD_ROOT, DESTINAZIONE), snap, process.env, { dichiaraRimozioni: true });
  if (!scritto) {
    console.log(`⏭️  non ho scritto ${DESTINAZIONE}: la memoria è in sola lettura (o la scrittura è stata fermata).`);
    return;
  }
  const somma = (f) => snap.avvisi.filter(f).reduce((t, a) => t + a.quanti, 0);
  const gravi = somma((a) => a.livello !== "INFO");
  const info = somma((a) => a.livello === "INFO");
  const tipi = `${snap.avvisi.length} ${snap.avvisi.length === 1 ? "tipo" : "tipi"}`;
  const distinti = snap.oggetti_distinti != null ? ` (${snap.oggetti_distinti} oggetti diversi)` : "";
  console.log(`✅ salvato ${DESTINAZIONE}: ${tipi}, ${gravi} fra errori e avvisi${distinti}, ${info} informazioni (letto ${snap.aggiornato}).`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) principale(process.argv.slice(2));
