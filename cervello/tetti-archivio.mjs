// AR-182 / AR-199 / AR-254 — come invecchia un archivio, e quanto se ne serve.
//
// Una malattia sola, in tre punti: **nessun archivio della macchina ha un tetto, e dove un tetto c'è,
// è nell'unità sbagliata.**
//
//   AR-182 — il decadimento delle lezioni è per ESECUZIONE, non per giorno. Lo script è nato come
//     passo di un ciclo settimanale ed è stato cablato in un giro che gira 9 volte al giorno: «−0,15
//     ogni tanto» è diventato «−1,35 al giorno». Misurato il 28/7: DECAY_DAYS=28 e la lezione più
//     vecchia ha esattamente 28 giorni. Due lezioni superano la soglia OGGI, 17 entro domani, 38 entro
//     tre giorni; con confidenza mediana 0,86 bastano 4 esecuzioni per scendere sotto 0,3, cioè
//     **10,7 ore**. Un'estinzione di massa a blocchi, che nessuno ha deciso.
//
//   AR-199 — STATO.md è a 437 KB e il giro lo riapre intero a ogni passaggio. Nessuno toglie niente,
//     perché la regola «la storia non si riscrive» è stata applicata anche a un file nato come
//     istantanea del presente.
//
//   AR-254 — apprendimento.json ha superato il tetto di LETTURA (1.000.000 caratteri): il testo viene
//     troncato a metà stringa, JSON.parse fallisce, e la scheda resta vuota per sempre.
//
// Le due regole che li uniscono:
//   ① **Il tempo si misura in tempo.** Un contatore legato a quante volte gira un ciclo cambia
//      significato ogni volta che il ciclo cambia frequenza — e nessuno se ne accorge, perché il
//      codice non è cambiato.
//   ② **Un archivio senza tetto non è una memoria, è una perdita.** O si rompe (AR-254), o rallenta
//      (AR-199), o butta via la cosa sbagliata (AR-182).
//
// Un import solo, verso l'orologio di casa — che è puro a sua volta: si esegue in un test senza
// toccare disco, rete o vault.

import { msDaTimbro } from "./ora-piacenza.mjs";

/** Millisecondi in un giorno. */
const GIORNO = 86_400_000;

/**
 * Parsing tollerante delle date della memoria («AAAA-MM-GG HH:MM», «AAAA-MM-GG» o ISO col fuso).
 * `null` se illeggibile — perché «non l'ho potuto leggere» e «vecchissima» non sono la stessa cosa.
 *
 * AR-666 — qui c'era `Date.parse(stringa.replace(" ", "T"))`. Una stringa senza fuso, per lo
 * standard, è ora LOCALE del processo: sul portatile italiano tornava l'istante giusto, sul server
 * in UTC tornava spostato di un'ora d'inverno e di due d'estate. E un giorno nudo («2026-08-14»),
 * sempre per lo standard, veniva letto come mezzanotte di Greenwich — cioè le due del mattino a
 * Piacenza. Sopra questi numeri sta la soglia dei 28 giorni che decide se una lezione decade: un
 * archivio che si svuota prima del tempo perde pezzi, e li perde in silenzio.
 *
 * Le due convenzioni di casa, dichiarate: il timbro porta l'ora di PIACENZA, e un giorno senza ora
 * vale mezzogiorno (lo stesso che fanno il Pannello e il resto del cervello).
 */
export function istante(d) {
  const s = String(d ?? "").trim();
  const t = msDaTimbro(/^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s} 12:00` : s);
  return Number.isFinite(t) ? t : null;
}

/** Giorni interi fra una data e adesso. `Infinity` se la data non si legge (= vecchissima). */
export function giorniDa(d, adessoMs = Date.now()) {
  const t = istante(d);
  if (t == null) return Infinity;
  return (adessoMs - t) / GIORNO;
}

/**
 * AR-182 — una lezione perde confidenza AL MASSIMO una volta ogni `giorniFraPassi` giorni.
 *
 * Il difetto non era la soglia (28 giorni va benissimo): era che dopo la soglia lo sconto si applicava
 * a ogni esecuzione. Legare il passo al tempo rende il decadimento indipendente da quanto spesso gira
 * il giro — che è la cosa che è cambiata sotto i piedi allo script senza che nessuno lo toccasse.
 *
 * @returns {{decade: boolean, motivo: string}}
 */
export function passoDovuto({
  ultimaConferma = null,
  ultimoPasso = null,
  adessoMs = Date.now(),
  giorniSoglia = 28,
  giorniFraPassi = 7,
  frenoVivo = false,
  ultimoUso = null,
} = {}) {
  // AR-771 — due cose che valgono quanto una riconferma, e che fino al 18/8 il decadimento non
  // guardava affatto. Misurato quel giorno: 63 delle 75 lezioni con un freno sarebbero morte entro
  // 35 giorni, e le 6 con un uso registrato pure — cioè la macchina segnava «questa regola mi ha
  // appena fermato» e un mese dopo la buttava via lo stesso. Due lavori sullo stesso archivio che
  // tiravano in direzioni opposte.
  //
  // ① IL FRENO VIVO. Se la lezione ha prodotto un guardiano e quel guardiano esiste ancora, la regola
  // è in vigore per definizione: non è memoria vecchia, è memoria eseguita. Quando qualcuno toglie il
  // guardiano, `frenoVivo` torna falso e la lezione riprende a invecchiare da sola — l'immortalità
  // dura quanto la guardia, non un minuto di più. Chi chiama deve verificare che il file ESISTA, non
  // che la lezione porti scritta una stringa: una stringa non monta la guardia.
  if (frenoVivo) return { decade: false, motivo: "ha un freno che monta ancora la guardia: finché quel guardiano esiste, la regola è in vigore" };
  // ② L'USO È UNA CONFERMA. Non un'eccezione a parte: la data più recente fra riconferma e uso è
  // quella che conta. «Nessuno l'ha confermata da 28 giorni» e «mi ha fermato tre giorni fa» non
  // possono essere veri insieme.
  const quandoConta = [ultimaConferma, ultimoUso].map((d) => istante(d)).filter((t) => t != null);
  const eta = quandoConta.length ? (adessoMs - Math.max(...quandoConta)) / GIORNO : Infinity;
  if (eta <= giorniSoglia) return { decade: false, motivo: `riconfermata o usata ${eta.toFixed(1)} giorni fa (soglia ${giorniSoglia})` };
  // Mai decaduta prima: il primo passo si può dare subito.
  if (ultimoPasso == null || istante(ultimoPasso) == null) {
    return { decade: true, motivo: `${eta.toFixed(1)} giorni senza riconferma, primo passo` };
  }
  const daUltimo = giorniDa(ultimoPasso, adessoMs);
  if (daUltimo < giorniFraPassi) {
    return { decade: false, motivo: `ultimo passo ${daUltimo.toFixed(1)} giorni fa (minimo ${giorniFraPassi})` };
  }
  return { decade: true, motivo: `${daUltimo.toFixed(1)} giorni dall'ultimo passo` };
}

/**
 * Quante lezioni possono morire in UN giro. Un'estinzione a blocchi non è un invecchiamento: è una
 * perdita di memoria, e va vista mentre succede invece che dopo. Le eccedenti restano attive: il
 * prossimo giro riproverà, e intanto il numero si può guardare.
 */
export function tettoDecadutePerGiro(candidate = 0, tetto = 5) {
  const c = Math.max(0, Number(candidate) || 0);
  const t = Math.max(1, Number(tetto) || 1);
  return { ammesse: Math.min(c, t), rimandate: Math.max(0, c - t), tetto: t };
}

// AR-254 vive nel Pannello, non qui: la regola «un .json non si tronca mai» la applica chi SERVE i
// file (pannello/src/lib/esito-lettura.ts::comeServire). Tenerne una copia anche qui significherebbe
// due metri per la stessa cosa in due runtime diversi — cioè il difetto che questo lotto sta curando.

/**
 * AR-199 — quanto di un archivio va servito a chi legge. Le voci più recenti, con il totale
 * DICHIARATO: una lista tagliata in silenzio dice «ecco tutto» mostrandone una parte.
 */
export function ultime(lista, max) {
  const l = Array.isArray(lista) ? lista.filter(Boolean) : [];
  const t = Math.max(0, Number(max) || 0);
  return { voci: l.slice(-t), totali: l.length, troncate: l.length > t };
}
