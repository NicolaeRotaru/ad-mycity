#!/usr/bin/env node
// 🚪 LA PORTA DI BOTTEGA — da una riga di coda al testo che l'AI legge, e non c'è un'altra strada.
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// Il muro fra i negozi dal lato del testo — il contesto isolato e le chiavi mai dentro il discorso —
// sta in `lavoro.mjs` dal 23/8, provato. Fino a ieri non lo chiamava nessuno, e la ragione non era
// che qualcuno se lo saltasse: mancava il consumatore. Tutti i tipi di lavoro che il worker sa fare
// sono del centro, e un lavoro del centro non ha nessun negozio da tenere separato.
//
// Questo file è quel consumatore. È la PORTA che il muro di `guardia-esecuzione.mjs` sorveglia:
// aggiungere un tipo a `TIPI_DI_BOTTEGA` apre il muro, e chi lo apre deve far uscire il testo da
// qui — cioè da `testoPerAI` — o la prova diventa rossa.
//
// ─────────────────────────────────────────────────────────────────────────────
// TRE PORTE CHIUSE, IN QUESTO ORDINE
// ─────────────────────────────────────────────────────────────────────────────
//   ① IL MURO      `puoEseguire` — un lavoro di un negozio di un tipo che non sappiamo trattare non
//                  si compone nemmeno. Prima di tutto il resto: un testo composto e poi buttato via
//                  è già passato dalla memoria del processo.
//   ② LA PORTA STRETTA  `nuovoLavoro` — senza negozio lancia, e il lavoro nasce già col contesto
//                  filtrato. Le righe degli altri negozi non vengono «tolte dopo»: non entrano.
//   ③ L'ULTIMA RIGA  `segretiNelTesto` — se una chiave del negozio è finita nel testo (incollata
//                  da un negoziante in una chat, per dire) il testo NON esce. Non si ripulisce e
//                  non si consegna a metà: chi ripulisce un segreto da un testo lascia in giro la
//                  copia che aveva in mano un istante prima.
//
// Il verso è scelto: fail-closed. Un lavoro di bottega eseguito dal percorso del centro girerebbe
// benissimo, e sarebbe esattamente il modo in cui i dati di due negozi si incontrano la prima volta
// senza che nessuno se ne accorga — perché il risultato sembra normale. Meglio fermo, col perché.
//
// ─────────────────────────────────────────────────────────────────────────────
// COSA **NON** PROTEGGE, detto qui e non scoperto dopo
// ─────────────────────────────────────────────────────────────────────────────
//   · Il muro nel database (AR-802). Qui la separazione la fa il codice, su quello che il database
//     ha già consegnato. Le righe altrui che arrivano fin qui vengono scartate e CONTATE — meglio
//     del silenzio, ma sono uscite dal database.
//   · La tabella `lavori` non ha ancora le colonne `materiale` e `righe` (AR-801 per `negozio_id`,
//     risolto il 26/8). Finché non ci sono, il worker passa due elenchi vuoti: la porta è montata e
//     gira a vuoto, che è voluto — il giorno che le colonne arrivano ci passano dentro senza che
//     nessuno debba ricordarsi di aggiungere un controllo.
//
// 🟢 Modulo puro: nessun disco, nessuna rete, nessun orologio. Il CLI legge da STDIN (mai da argv:
// un mandato con un apice o un a-capo si spezzerebbe nella riga di comando — AR-826).
//
// Prova: node cervello/test/il-testo-di-bottega-non-porta-l-altro-negozio.test.mjs

import { puoEseguire } from "./guardia-esecuzione.mjs";
import { nuovoLavoro, testoPerAI, schedaNegozio, montaSegreti, segretiNelTesto } from "./lavoro.mjs";

/** Uscite del CLI: 0 il testo è pronto · 3 il lavoro è FERMO col perché · 1 l'ingresso è illeggibile. */
export const USCITA_OK = 0;
export const USCITA_ILLEGGIBILE = 1;
export const USCITA_FERMO = 3;

/**
 * IL TESTO DI UN LAVORO DI BOTTEGA, o il motivo per cui non c'è.
 *
 * Torna sempre un oggetto, mai un'eccezione per i casi previsti: chi chiama è uno script di shell,
 * e una traccia di stack in un log alle tre di notte non dice a nessuno cosa fare.
 */
export function componiTestoBottega({ negozio = "", tipo = "", mandato = "", materiale = [], righe = [], cassaforte = {} } = {}) {
  // ① il muro, prima di comporre qualsiasi cosa
  const muro = puoEseguire({ negozio, tipo });
  if (!muro.si) return { ok: false, motivo: muro.motivo, testo: "", scartate: 0 };

  // ② la porta stretta. `nuovoLavoro` lancia su un ingresso storto: qui diventa un motivo leggibile.
  let lavoro;
  try {
    lavoro = nuovoLavoro({ negozioId: negozio, tipo, mandato, materiale, righe });
  } catch (e) {
    return { ok: false, motivo: `il lavoro non si costruisce: ${e.message}`, testo: "", scartate: 0 };
  }

  const testo = testoPerAI(lavoro);

  // ③ l'ultima riga: le chiavi del negozio non escono nel discorso. `montaSegreti` rifiuta da solo
  //    la cassaforte di un negozio diverso — quindi la scheda si costruisce col negozio del lavoro,
  //    non con quello dichiarato dall'ingresso, e i due non possono divergere.
  const scheda = schedaNegozio({ negozioId: lavoro.negozioId, cassaforte });
  const trovati = segretiNelTesto(testo, montaSegreti(scheda, lavoro.negozioId));
  if (trovati.length) {
    return {
      ok: false,
      // I NOMI delle chiavi, mai i valori: un guardiano che stampa il segreto per dire che il
      // segreto è esposto ha appena fatto il danno che denunciava.
      motivo: `nel testo del lavoro compaiono le chiavi del negozio (${trovati.join(", ")}): non lo mando all'AI`,
      testo: "",
      scartate: lavoro.scartate.length,
    };
  }

  return { ok: true, motivo: "", testo, scartate: lavoro.scartate.length };
}

// ─────────────────────────── il CLI ───────────────────────────

/**
 * La bocca: JSON da stdin, il testo su stdout.
 *
 * Da stdin e non dagli argomenti perché un mandato con un apice o un a-capo si spezzerebbe nella
 * riga di comando, e il materiale può essere lungo quanto una conversazione intera (AR-826).
 */
async function main() {
  let grezzo = "";
  for await (const pezzo of process.stdin) grezzo += pezzo;

  let ingresso = null;
  try {
    ingresso = JSON.parse(grezzo || "null");
  } catch (e) {
    process.stderr.write(`ingresso illeggibile (non è JSON): ${e.message}\n`);
    process.exit(USCITA_ILLEGGIBILE);
  }
  if (!ingresso || typeof ingresso !== "object" || Array.isArray(ingresso)) {
    process.stderr.write("ingresso illeggibile: mi aspetto un oggetto JSON su stdin\n");
    process.exit(USCITA_ILLEGGIBILE);
  }

  if (process.argv.includes("--controlla")) {
    // Il muro da solo, senza comporre niente: è quello che il worker chiede su OGNI lavoro, anche
    // su quelli del centro, che qui un testo da costruire non ce l'hanno.
    const v = puoEseguire({ negozio: ingresso.negozio, tipo: ingresso.tipo });
    if (v.si) process.exit(USCITA_OK);
    process.stderr.write(`${v.motivo}\n`);
    process.exit(USCITA_FERMO);
  }

  const esito = componiTestoBottega(ingresso);
  if (esito.scartate > 0) {
    // Non ferma il lavoro — il testo è pulito — ma non passa in silenzio: righe di un altro negozio
    // arrivate fin qui vogliono dire che una query a monte sbaglia, e il filtro le copre.
    process.stderr.write(`⚠️  ${esito.scartate} righe di ALTRI negozi sono arrivate fin qui e sono state scartate: la query a monte sbaglia (AR-802).\n`);
  }
  if (!esito.ok) {
    process.stderr.write(`${esito.motivo}\n`);
    process.exit(USCITA_FERMO);
  }
  process.stdout.write(esito.testo);
  process.exit(USCITA_OK);
}

if (process.argv[1] && process.argv[1].endsWith("testo-lavoro.mjs")) main();
