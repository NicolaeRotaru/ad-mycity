#!/usr/bin/env node
// 🧬 LE MALATTIE CHE MANCANO (AR-499) — chi fa crescere il registro?
//
// PERCHÉ ESISTE. Il registro delle malattie (`cervello/malattie.json`) è nato il 30/7 con 7 forme e
// il 3/8 ne aveva ancora 7 — mentre il cantiere passava da 400 a 419 difetti e le lezioni da 475 a
// 491. Nessuno script lo scriveva: verificato cercando chi lo apre in scrittura, zero. Cioè il
// sorvegliante, che sul registro poggia il suo controllo ①, poteva riconoscere solo le forme del
// giorno in cui è nato, e sarebbe invecchiato da fermo mentre la macchina continuava a imparare.
//
// IL SEGNALE, e non l'ho inventato io: `nato_come: "regressione"` esiste dal 30/7 (AR-459) e vuol
// dire esattamente «questa forma è TORNATA» — un mio fix che ha rifatto un difetto già visto. È la
// definizione operativa di «malattia»: non una brutta cosa capitata una volta, ma una forma che si
// ripete. Quindi la regola è meccanica e non richiede giudizio: ogni regressione deve dire QUALE
// forma è tornata.
//
// TRE RISPOSTE AMMESSE, e la terza è quella che tiene onesto il registro:
//   ① il nome di una malattia in `cervello/malattie.json` → il sorvegliante la riconosce su ogni
//      riga nuova che scrivo;
//   ② il nome di un controllo del sorvegliante (`difesa-rimossa`, `soglia-allentata`, …) → la forma
//      non è un pattern di testo ma un fatto sul delta, e c'è già chi la vede;
//   ③ `non-pattern-izzabile` + il PERCHÉ scritto → e allora è debito dichiarato, non silenzio. È la
//      risposta giusta per le forme che vivono nel diff intero (un JSON riscritto tutto), nella
//      storia del ramo (codice committato dopo l'ultimo esito) o nell'effetto (un canale muto): lì
//      un pattern per riga sarebbe una finzione, e la difesa vera è un guardiano dedicato — che va
//      NOMINATO, così la copertura resta verificabile.
//
// COSA NON FA. Non decide se una forma sia pattern-izzabile (quello è giudizio, e mio), non scrive
// il registro al posto mio, non giudica la qualità di un pattern. Chiede una cosa sola: che a ogni
// forma tornata corrisponda una risposta scritta.
//
// COME È TARATO. Le classi del sorvegliante si LEGGONO dal suo codice, non si elencano qui: un
// elenco a mano invecchierebbe al primo controllo nuovo, ed è la malattia
// `perimetro-dedotto-non-misurato` scritta dentro il guardiano che dovrebbe scoprirla.
//
// Uso:
//   node cervello/malattie-mancanti.mjs
//   node cervello/malattie-mancanti.mjs --json
//
// Uscita (contratto guardiani, AR-322): 0 = ogni forma tornata ha una risposta · 1 = ne manca almeno
// una · 2 = non ho potuto misurare (registri illeggibili) — cieco non è verde.
//
// 🟢 Sola lettura: non scrive niente, non tocca git.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);
const CANTIERE = "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json";

/** Quanti caratteri deve avere un perché per essere un perché. Stessa soglia di `spazzata-fratelli`
 *  e `porte-check`: sotto, è una scrollata di spalle scritta. */
export const PERCHE_MIN = 30;

export const NON_PATTERN = "non-pattern-izzabile";

/**
 * Il cuore. Pura: prende i tre registri già letti e torna cosa manca.
 *
 * @param {Array<object>} difetti      le schede del cantiere
 * @param {Array<object>} malattie     il registro delle malattie
 * @param {string[]} classi            i controlli che il sorvegliante sa emettere
 * @returns {{scoperte:Array<object>, orfane:string[]}}
 */
export function malattieMancanti(difetti = [], malattie = [], classi = []) {
  const nomi = new Set([...malattie.map((m) => m.id), ...classi]);
  const scoperte = [];
  for (const d of difetti) {
    if (d.nato_come !== "regressione") continue;
    const risposta = String(d.malattia || "").trim();
    if (!risposta) {
      scoperte.push({ id: d.id, titolo: String(d.titolo || "").slice(0, 90), motivo: "non dice quale forma è tornata" });
      continue;
    }
    if (risposta === NON_PATTERN) {
      // La terza strada è legittima, ma è la porta di AR-338 se basta la parola: senza un perché
      // scritto, `non-pattern-izzabile` diventa il modo educato di non rispondere.
      const perche = String(d.malattia_perche || "").trim();
      if (perche.length < PERCHE_MIN) {
        scoperte.push({
          id: d.id,
          titolo: String(d.titolo || "").slice(0, 90),
          motivo: `dichiarata «${NON_PATTERN}» ma il perché è ${perche.length} caratteri (ne servono ${PERCHE_MIN}): senza, è un'esenzione travestita`,
        });
      }
      continue;
    }
    if (!nomi.has(risposta)) {
      scoperte.push({
        id: d.id,
        titolo: String(d.titolo || "").slice(0, 90),
        motivo: `nomina «${risposta}», che non è né una malattia censita né un controllo del sorvegliante`,
      });
    }
  }

  // Il segnale opposto, informativo: una malattia che nessuna scheda nomina. Non è un errore — può
  // essere una forma censita per prevenzione — ma se nessun difetto reale la richiama, vale la pena
  // chiedersi se stiamo cercando una cosa che non ci succede.
  const nominate = new Set(difetti.map((d) => String(d.malattia || "").trim()).filter(Boolean));
  const orfane = malattie.map((m) => m.id).filter((id) => !nominate.has(id));

  return { scoperte, orfane };
}

/** Le classi che il sorvegliante sa emettere, lette dal suo codice: misurate, non elencate. */
export function classiDelSorvegliante(sorgente = "") {
  return [...new Set([...sorgente.matchAll(/classe:\s*"([a-z-]+)"/g)].map((m) => m[1]))].sort();
}

function leggi(percorso, campo) {
  try {
    return JSON.parse(readFileSync(join(REPO, percorso), "utf8"))[campo] || null;
  } catch {
    return null;
  }
}

function main() {
  const json = process.argv.includes("--json");
  const difetti = leggi(CANTIERE, "difetti");
  const malattie = leggi("cervello/malattie.json", "malattie");
  let sorgente = "";
  try {
    sorgente = readFileSync(join(QUI, "sorvegliante.mjs"), "utf8");
  } catch {
    sorgente = "";
  }

  if (!difetti || !malattie || !sorgente) {
    const manca = [!difetti && CANTIERE, !malattie && "cervello/malattie.json", !sorgente && "cervello/sorvegliante.mjs"].filter(Boolean);
    console.error(`⚪ MALATTIE MANCANTI — non ho potuto misurare: illeggibile ${manca.join(", ")}. Cieco non è verde.`);
    process.exit(2);
  }

  const classi = classiDelSorvegliante(sorgente);
  const { scoperte, orfane } = malattieMancanti(difetti, malattie, classi);
  const regressioni = difetti.filter((d) => d.nato_come === "regressione").length;

  if (json) {
    console.log(JSON.stringify({ regressioni, malattie: malattie.length, classi, scoperte, orfane }, null, 2));
    process.exit(scoperte.length ? 1 : 0);
  }

  console.log(`\n🧬 LE MALATTIE CHE MANCANO — ${regressioni} forme tornate, ${malattie.length} censite, ${classi.length} controlli sul delta\n`);
  for (const s of scoperte) {
    console.log(`❌ ${s.id} — ${s.motivo}`);
    console.log(`   ${s.titolo}`);
    console.log(`   → una regressione è la PROVA che una forma si ripete: o le dai un nome in cervello/malattie.json,`);
    console.log(`     o dichiari "malattia": "${NON_PATTERN}" con "malattia_perche" che nomina chi la copre.\n`);
  }
  if (orfane.length) {
    console.log(`🔭 ${orfane.length} malattia/e che nessun difetto reale nomina: ${orfane.join(", ")}`);
    console.log(`   (non è un errore: può essere prevenzione. Ma se non ci succede mai, il registro sta cercando una cosa che non abbiamo.)\n`);
  }
  if (scoperte.length) {
    console.log(`❌ ${scoperte.length} forma/e tornata/e senza una risposta scritta.`);
    process.exit(1);
  }
  console.log("✅ ogni forma tornata ha un nome o un debito dichiarato.");
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
