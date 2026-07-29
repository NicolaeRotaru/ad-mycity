#!/usr/bin/env node
// 🗺️ GUARDIANO DELLA MAPPA — tiene in bacheca la spiegazione di com'è fatta la macchina, aggiornata.
//
// Nicola (29/7): «aggiungi la descrizione delle 9 parti dentro la bacheca … e vorrei che questa
// sezione venga aggiornata ogni volta che c'è una cosa nuova dentro la macchina».
//
// «Aggiornata» qui vuol dire due cose diverse, e servono tutte e due:
//   ① **i numeri si rifanno da soli** a ogni giro (li conta `censimento-macchina.mjs` leggendo il
//      repo): 120 senior che diventano 121 si aggiornano senza che nessuno se lo ricordi;
//   ② **i pezzi nuovi pretendono una spiegazione**. Un conteggio che sale non dice cosa sa fare in
//      più la macchina. Se nasce una skill, un sensore, una mano, un servizio o un'area del
//      Pannello e nessuno ha scritto cosa fa, questo guardiano esce 1 e il giro porta il vincolo:
//      la riga si scrive in QUEL giro, non «poi». È la stessa scelta di `guardiani-check.mjs`, per
//      lo stesso motivo — se non si scrive adesso non si scrive più.
//
// Con l'elenco incompleto la bacheca NON viene riscritta: meglio la mappa di ieri, completa, che una
// con un buco al posto di un pezzo.
//
// 🟢 Sola lettura sul codice. Scrive solo dentro la memoria dell'AD:
//    · MyCity-Vault/90-Memoria-AI/BACHECA.md            (la sezione, per la home del Pannello)
//    · MyCity-Vault/90-Memoria-AI/MAPPA-MACCHINA.md     (lo stesso contenuto come documento)
//    · .../auto-coscienza/mappa-macchina.json           (la struttura + quando è cambiata)
//
// Uso: node cervello/mappa-macchina.mjs [--bacheca] [--json]
// Exit: 0 = mappa allineata · 1 = pezzo nuovo senza spiegazione (o spiegazione orfana) · 2 = cieco

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  COSA_NON_DICE,
  NOMI_INVENTARIO,
  PARTI,
  TITOLO_BACHECA,
  bloccoBacheca,
  censimento,
  codiceUscita,
  documento,
  firmaStruttura,
  motiviDiCecita,
} from "./censimento-macchina.mjs";
import { aggiornaBacheca } from "./guardiani-check.mjs";
import { nowPiacenza } from "./git-github.mjs";
import { scriviTestoAtomico } from "./scrivi-json.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = process.env.AD_REPO || join(QUI, "..");
const BACHECA = join(REPO, "MyCity-Vault/90-Memoria-AI/BACHECA.md");
const DOCUMENTO = join(REPO, "MyCity-Vault/90-Memoria-AI/MAPPA-MACCHINA.md");
const STRUTTURA = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/mappa-macchina.json");

const JSON_MODE = process.argv.includes("--json");
const SCRIVI = process.argv.includes("--bacheca");

/** Cosa questo guardiano NON prova. */
const COSA_NON_PROVA =
  "Non prova che i pezzi FUNZIONINO, e nemmeno che la spiegazione sia giusta: prova che ogni pezzo " +
  "misurabile della macchina (aree del Pannello, sensori, mani, servizi, skill, workflow) abbia una " +
  "riga che dice cosa fa, e che non resti scritta una riga per un pezzo che non c'è più. Una " +
  "descrizione sbagliata ma presente, qui, risulta sana.";

/**
 * Quando datare il blocco.
 *
 * La bacheca ordina per data: se questo blocco si ridatasse a ogni ritocco (basta una riga in più in
 * un file per muovere un conteggio) starebbe sempre in cima, sopra il registro dei fatti, e
 * produrrebbe un commit a ogni giro che non dice niente. Quindi la data risponde a «è comparso
 * qualcosa di NUOVO?», non a «qualcuno ha toccato un file»: si muove solo se cambia la struttura,
 * oppure se il blocco in bacheca non c'è ancora.
 */
export function quandoDatare(struttura, precedente, dataInBacheca, adesso) {
  if (!dataInBacheca) return adesso;
  if (!stessaStruttura(struttura, precedente)) return adesso;
  return dataInBacheca;
}

/**
 * La data che il blocco porta ADESSO in bacheca — cioè quella che Nicola vede.
 *
 * Si legge da lì e non dal file di struttura per un motivo preciso: quando il corpo non cambia, il
 * blocco resta com'è e la sua data non si muove. Se la data «buona» vivesse solo nel JSON accanto,
 * i due numeri comincerebbero a divergere in silenzio, e il giorno in cui il corpo cambia davvero la
 * bacheca si ritroverebbe timbrata con una data che non è mai stata sua. La data visibile è la data
 * vera; il JSON la ricopia, non la decide.
 */
export function dataDelBlocco(bacheca, titolo) {
  const riga = String(bacheca).split("\n").find((r) => r.startsWith(`## ${titolo} ·`));
  const m = riga?.match(/·\s*(\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2})?)\s*$/);
  return m ? m[1] : null;
}

/**
 * Due strutture sono la stessa se combaciano in tutto tranne che nella data.
 * Il confronto è sull'oggetto vero e non su una sua copia stringata tenuta accanto: una foto della
 * struttura scritta due volte nello stesso file è una copia che un giorno può smentire l'originale,
 * ed è la classe di difetto che questa macchina si è impegnata a non produrre.
 */
export function stessaStruttura(a, b) {
  if (!a || !b) return false;
  const senzaData = ({ quando, ...resto }) => JSON.stringify(resto);
  return senzaData(a) === senzaData(b);
}

function leggiPrecedente() {
  try { return JSON.parse(readFileSync(STRUTTURA, "utf8")); } catch { return null; }
}

/** La struttura da tenere su disco: cambia SOLO quando cambia un pezzo, mai per un conteggio. */
export function fotoStruttura(cens, quando) {
  return { quando, ...firmaStruttura(cens) };
}

function main() {
  if (!existsSync(join(REPO, ".claude/agents")) || !existsSync(join(REPO, "pannello/src/lib/nav.ts"))) {
    console.error("⚠️  GUARDIANO CIECO: manca il repo da misurare (.claude/agents o pannello/src/lib/nav.ts).");
    process.exit(2);
  }

  const cens = censimento(REPO);
  const m = cens.misure;

  // Se non riesco a MISURARE non sono rosso, sono cieco: rosso vorrebbe dire «ho guardato e manca»,
  // e sarebbe una bugia diversa ma sempre una bugia (AR-322). Vale sia per i guasti di lettura sia
  // per un inventario tornato vuoto: «0 mani» non si scrive in bacheca se non sono sicuro che sia vero.
  const cieco = motiviDiCecita(cens);
  if (cieco.length) {
    console.error("⚠️  GUARDIANO CIECO: non riesco a misurare la macchina — non riscrivo niente.");
    for (const motivo of cieco.slice(0, 8)) console.error(`   · ${motivo}`);
    process.exit(2);
  }

  const rc = codiceUscita(cens);
  const struttura = firmaStruttura(cens);
  let scritto = null;

  if (SCRIVI && rc === 0 && existsSync(BACHECA)) {
    const bacheca = readFileSync(BACHECA, "utf8");
    const quando = quandoDatare(struttura, leggiPrecedente(), dataDelBlocco(bacheca, TITOLO_BACHECA), nowPiacenza());

    const esito = aggiornaBacheca(bacheca, bloccoBacheca(cens, quando), { titolo: TITOLO_BACHECA });
    if (esito.cambiato) scriviTestoAtomico(BACHECA, esito.testo);
    scritto = esito.cambiato;

    const doc = documento(cens, quando);
    let vecchio = "";
    try { vecchio = readFileSync(DOCUMENTO, "utf8"); } catch { /* prima volta */ }
    if (vecchio !== doc) scriviTestoAtomico(DOCUMENTO, doc);

    const foto = fotoStruttura(cens, quando);
    const primaFoto = leggiPrecedente();
    if (JSON.stringify(primaFoto) !== JSON.stringify(foto)) {
      scriviTestoAtomico(STRUTTURA, `${JSON.stringify(foto, null, 2)}\n`);
    }
  }

  if (JSON_MODE) {
    console.log(JSON.stringify({
      ok: rc === 0,
      _cosa_NON_prova: COSA_NON_PROVA,
      aggiornato: nowPiacenza(),
      bacheca_riscritta: scritto,
      parti: PARTI.length,
      mancanti: cens.mancanti,
      fantasmi: cens.fantasmi,
      misure: m,
    }, null, 2));
    process.exit(rc);
  }

  console.log(`🗺️  Mappa della macchina — ${PARTI.length} parti, misurate adesso\n`);
  for (const p of PARTI) {
    console.log(`   ${p.emoji} ${String(p.n).padEnd(2)} ${p.titolo.padEnd(42)} ${p.taglia(m)}`);
  }
  console.log("");
  for (const [chiave, nomi] of Object.entries(cens.inventari)) {
    console.log(`   · ${String(NOMI_INVENTARIO[chiave] || chiave).padEnd(20)} ${nomi.length}`);
  }
  if (cens.mancanti.length) {
    console.log(`\n   ❓ ${cens.mancanti.length} pezzi nuovi SENZA spiegazione: ${cens.mancanti.join(", ")}`);
    console.log("      Scrivi cosa fanno in cervello/censimento-macchina.mjs (DESCRIZIONI) — in questo giro, non dopo.");
  }
  if (cens.fantasmi.length) {
    console.log(`\n   👻 ${cens.fantasmi.length} spiegazioni per pezzi che non esistono più: ${cens.fantasmi.join(", ")}`);
    console.log("      Togli la riga: la mappa non deve promettere un pezzo che non c'è.");
  }
  if (scritto === true) console.log(`\n   📌 Bacheca e documento aggiornati: ${BACHECA}`);
  else if (scritto === false) console.log("\n   📌 Bacheca già allineata — nessuna riscrittura (la data si muove solo se cambia la struttura).");
  if (rc === 0) console.log("\n   ✅ Ogni pezzo misurabile della macchina è spiegato.");
  console.log(`\n   ⚠️  ${COSA_NON_DICE.replace(/\*\*/g, "")}`);
  process.exit(rc);
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) main();
