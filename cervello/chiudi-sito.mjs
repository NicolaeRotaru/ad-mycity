#!/usr/bin/env node
// ✍️ SCRIVE LE CHIUSURE NEL REGISTRO DEL SITO, dai frammenti delle corsie di un lotto.
//
// PERCHÉ ESISTE. `cervello/lotto-a-pacchetti.md`, sezione ⑤, dichiara il buco a lettere chiare:
//
//   «Sul sito quel comando non esiste. Nessuno script scrive `stato` o `chiuso_il` dentro il
//    registro del sito: oggi è una modifica a mano su un file di ottomila righe, con una chiave che
//    si rompe se una squadra ritocca un titolo. Se il passo salta, il lotto successivo ripianifica
//    gli stessi difetti già riparati e nessun rosso lo segnala.»
//
// Sulla macchina il passo ce l'ha (`auto-fix.mjs verifica --applica`). Sul sito no. E il costo non è
// la fatica: è che la chiave è `dimensione|titolo` normalizzati, quindi una chiusura scritta a mano
// somiglia a una chiusura ma non aggancia niente. Al primo collaudo del comando dei pacchetti, 356
// chiavi su 361 non combaciavano proprio per questo — perché il formato era stato copiato invece di
// chiamare `chiaveProblema`. Qui la funzione si CHIAMA, non si imita.
//
// LA REGOLA CHE FA LA DIFFERENZA: si chiude solo ciò che porta una prova che gira. Un frammento con
// `esito: "riparato"` ma senza `verifica_comando` e senza `non_vacuita` NON chiude niente e viene
// contato a parte. È l'asticella di casa applicata al sito: «fatto» vuol dire che un comportamento
// è cambiato, e che qualcuno ha visto la prova diventare rossa.
//
// Uso:
//   node cervello/chiudi-sito.mjs <cartella-dei-frammenti>            # cosa farebbe (a vuoto)
//   node cervello/chiudi-sito.mjs <cartella-dei-frammenti> --applica  # scrive davvero
//   node cervello/chiudi-sito.mjs <cartella> --pr 255 --commit abc1234
//
// Uscita (contratto guardiani, AR-322): 0 = fatto · 1 = c'è una chiave che non aggancia niente
// · 2 = NON HO POTUTO MISURARE (cartella o registro illeggibili). Il 2 non è un verde.
//
// 🟡 Scrive nel registro dei difetti del sito, che è memoria. Non tocca il codice del marketplace.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chiaveProblema } from "./referti-sito.mjs";
import { timbroOra } from "./ora-piacenza.mjs";
import { scriviTestoAtomico } from "./scrivi-json.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..");
export const REGISTRO = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json");

/**
 * Una riparazione si può scrivere SOLO se porta con sé la prova che gira e l'esito della mutazione.
 *
 * È pura, e la prova offline sta qui: se un domani questo controllo si ammorbidisce, il registro si
 * riempie di chiusure che nessuno ha mai visto diventare rosse — che è esattamente il debito che il
 * cantiere della macchina si porta dietro da mesi (98 schede chiuse su una prova mai rotta apposta).
 */
export function chiudibile(d) {
  if (d?.esito !== "riparato") return { si: false, perche: `esito «${d?.esito ?? "assente"}», non «riparato»` };
  if (!d?.verifica_comando) return { si: false, perche: "manca il comando della prova: una chiusura senza prova non è una chiusura" };
  if (!d?.non_vacuita) return { si: false, perche: "manca l'esito della mutazione: nessuno ha visto la prova diventare rossa" };
  return { si: true, perche: "" };
}

/**
 * Il valore che sta dietro un'opzione, o `null` se l'opzione non c'è.
 *
 * Sta qui, esportata, per una ragione precisa: la prima versione viveva dentro `main()` e la prova
 * la RISCRIVEVA invece di chiamarla. Rompendo il codice vero la prova restava verde — cioè non
 * provava niente. È la scorciatoia che questa casa chiama «prova che non può fallire», e l'ha
 * smascherata la mutazione, non la rilettura.
 *
 * Il caso che cura: `indexOf` torna -1 quando l'opzione manca, e `argv[-1 + 1]` è `argv[0]`, cioè il
 * primo argomento — qui la cartella dei frammenti. Senza il controllo, lanciato senza «--pr», il
 * comando scriveva «PR #/tmp/…/lotto» dentro OGNI difetto chiuso del registro, in silenzio.
 */
export function opzione(argv = [], nome) {
  const i = argv.indexOf(nome);
  if (i === -1) return null;
  const v = argv[i + 1];
  return v && !v.startsWith("--") ? v : null;
}

/** Tutti i difetti dichiarati dalle corsie, con la corsia che li ha dichiarati appiccicata. */
export function difettiDeiFrammenti(frammenti = []) {
  const out = [];
  for (const f of frammenti) for (const d of f?.difetti || []) out.push({ ...d, corsia: f.corsia, territorio: f.territorio });
  return out;
}

/**
 * Il piano delle scritture. PURO: prende il registro e i frammenti, torna cosa cambierebbe.
 *
 * `orfani` è il caso che fa uscire 1: una chiave dichiarata da una corsia che nel registro non
 * esiste. Vuol dire che qualcuno ha ritoccato un titolo mentre riparava, e la chiusura non
 * aggancerebbe niente — il difetto risulterebbe di nuovo aperto al referto successivo, in silenzio.
 */
export function piano(problemi = [], frammenti = [], { quando, pr, commit } = {}) {
  const perChiave = new Map(problemi.map((p) => [chiaveProblema(p), p]));
  const chiudo = [];
  const lascio = [];
  const orfani = [];

  for (const d of difettiDeiFrammenti(frammenti)) {
    if (!d?.chiave) {
      orfani.push({ chiave: "(assente)", corsia: d.corsia });
      continue;
    }
    if (!perChiave.has(d.chiave)) {
      orfani.push({ chiave: d.chiave, corsia: d.corsia });
      continue;
    }
    const v = chiudibile(d);
    if (!v.si) {
      lascio.push({ chiave: d.chiave, corsia: d.corsia, perche: d.perche_resta_aperto || v.perche });
      continue;
    }
    chiudo.push({
      chiave: d.chiave,
      corsia: d.corsia,
      campi: {
        stato: "riparato",
        chiuso_il: quando,
        chiuso_da: [pr ? `PR #${pr}` : null, commit || null].filter(Boolean).join(" · ") || "lotto dei gravi del sito",
        nota_riparazione: [d.nota_fix, `prova: ${d.verifica_comando}`, `mutazione: ${d.non_vacuita}`].filter(Boolean).join(" — "),
      },
    });
  }
  return { chiudo, lascio, orfani };
}

function leggiFrammenti(cartella) {
  return readdirSync(cartella)
    .filter((n) => /^esito-\d+\.json$/.test(n))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
    .map((n) => JSON.parse(readFileSync(join(cartella, n), "utf8")));
}

function main() {
  const argv = process.argv.slice(2);
  const cartella = argv.find((a) => !a.startsWith("--"));
  const applica = argv.includes("--applica");
  const pr = opzione(argv, "--pr");
  const commit = opzione(argv, "--commit");

  if (!cartella || !existsSync(cartella)) {
    console.error(`⚪ cartella dei frammenti non leggibile: ${cartella ?? "(non l'hai detta)"}`);
    process.exit(2);
  }
  let registro, frammenti;
  try {
    registro = JSON.parse(readFileSync(REGISTRO, "utf8"));
    frammenti = leggiFrammenti(cartella);
  } catch (e) {
    console.error(`⚪ non ho potuto leggere (${e.message}): senza registro o frammenti qualunque scrittura sarebbe alla cieca.`);
    process.exit(2);
  }

  const quando = timbroOra();
  const { chiudo, lascio, orfani } = piano(registro.problemi, frammenti, { quando, pr, commit });

  console.log(`✍️  CHIUSURE DEL SITO — ${frammenti.length} corsie lette\n`);
  console.log(`   Da chiudere:      ${chiudo.length}`);
  console.log(`   Restano aperti:   ${lascio.length}`);
  console.log(`   Chiavi orfane:    ${orfani.length}\n`);
  for (const c of chiudo) console.log(`   ✅ corsia ${String(c.corsia).padEnd(2)} ${c.chiave.slice(0, 95)}`);
  for (const l of lascio) console.log(`   ⏳ corsia ${String(l.corsia).padEnd(2)} ${l.chiave.slice(0, 70)} — ${l.perche.slice(0, 60)}`);
  for (const o of orfani) console.log(`   ❌ corsia ${String(o.corsia).padEnd(2)} chiave che NON esiste nel registro: ${o.chiave.slice(0, 80)}`);

  if (applica && chiudo.length) {
    const perChiave = new Map(registro.problemi.map((p) => [chiaveProblema(p), p]));
    for (const c of chiudo) Object.assign(perChiave.get(c.chiave), c.campi);
    // ⚠️ LA SCRITTURA PASSA DAL PENNINO ATOMICO, e non è pignoleria.
    //
    // Questo file è il registro dei difetti del sito: ottomila righe, l'unica copia, e l'unica cosa
    // che sa quali riparazioni sono già state fatte. Un `writeFileSync` interrotto a metà — il
    // processo ucciso, il disco pieno — lo lascia troncato, e nessuno se ne accorge finché il lotto
    // dopo non ripianifica tutto da capo su una lista mutilata. `scriviTestoAtomico` scrive di
    // fianco e poi sposta: o c'è il file vecchio intero, o c'è il nuovo intero.
    //
    // NOTA su una difesa che qui NON serve: la prima stesura sfuggiva a mano i surrogati solitari,
    // convinta che `JSON.stringify` li riemettesse crudi. Provato: non è vero. Da ES2019 li scrive
    // già come `\ud800`, e la regex non trovava mai niente. Quell'inciampo era di Python, in una
    // sessione di agosto, ed era stato ricopiato qui senza rifare la prova. Tolta.
    scriviTestoAtomico(REGISTRO, JSON.stringify(registro, null, 2));
    console.log(`\n   📌 scritte ${chiudo.length} chiusure nel registro (${quando}).`);
  } else if (!applica) {
    console.log(`\n   (prova a vuoto: niente è stato scritto. Aggiungi --applica per scrivere.)`);
  }

  if (orfani.length) {
    console.error(`\n❌ ${orfani.length} chiavi non agganciano niente: una corsia ha ritoccato un titolo mentre riparava.`);
    console.error(`   Quelle chiusure sparirebbero in silenzio, e al referto successivo i difetti risulterebbero di nuovo aperti.`);
    process.exit(1);
  }
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
