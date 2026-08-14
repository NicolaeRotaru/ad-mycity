// ora-piacenza.mjs — L'OROLOGIO DI CASA, IN UN POSTO SOLO (AR-647 · AR-648 · AR-442).
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE QUESTO FILE CURA: «l'ora scritta a mano»
// ─────────────────────────────────────────────────────────────────────────────
// La regola di casa (CLAUDE.md) è una sola: ogni data che finisce in memoria porta l'ora di
// Piacenza, formato «AAAA-MM-GG HH:MM». Nel cervello quella regola era applicata in tre modi
// sbagliati, tutti nati dalla stessa scorciatoia — costruire un'ora invece di chiederla al fuso:
//
//   ① l'offset CABLATO — `new Date(\`${g}T${h}:${m}:00+02:00\`)`. Vero da fine marzo a fine
//      ottobre, falso di un'ora tutto l'inverno. Chi l'ha scritto stava lavorando d'estate, e
//      d'estate non poteva sbagliare: il difetto nasce già invisibile.
//   ② l'UTC NUDO — `new Date().toISOString().slice(0,16).replace("T"," ")`. Ha la FORMA giusta e
//      il valore sbagliato: sono le 22:20 a Piacenza e il registro scrive 20:20. Il Pannello lo
//      mostra come «ora di Piacenza» perché è indistinguibile da un timbro vero.
//   ③ il FUSO DEL SERVER — `Date.parse("2026-12-01 13:00".replace(" ","T"))`. Una stringa senza
//      fuso, per lo standard, è ora LOCALE del processo. Sul portatile (Europe/Rome) torna
//      l'istante giusto; sul VPS (UTC) torna un istante spostato di un'ora d'inverno e di due
//      d'estate — e ogni misura di freschezza fatta con quel numero dice che la cadenza è più
//      fresca di quanto sia.
//
// Le tre facce hanno un tratto in comune, ed è il motivo per cui sono vissute tanto: **sbagliano
// solo altrove o solo in un'altra stagione**. Un test scritto a luglio su un portatile italiano
// le trova tutte e tre verdi. Per questo qui l'istante NON viene mai dall'orologio di sistema
// dentro la funzione: arriva come parametro, così una prova può metterlo a gennaio.
//
// 🟢 Modulo PURO: nessun file, nessuna rete, nessun `process.env`, nessuna variabile globale.
// L'unico attrezzo è `Intl` con `timeZone: "Europe/Rome"`, che sa da solo quando scatta il cambio
// d'ora — cioè l'unica cosa che un offset scritto a mano non saprà mai.

/** Il fuso di casa. Un posto solo: se un giorno l'azienda si sposta, si cambia qui. */
export const FUSO = "Europe/Rome";

/** Il formato che tutta la memoria usa. `sv-SE` produce già «2026-12-01 13:00». */
const FMT_MINUTI = new Intl.DateTimeFormat("sv-SE", {
  timeZone: FUSO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Come sopra ma coi secondi: serve a misurare l'offset senza perdere precisione. */
const FMT_SECONDI = new Intl.DateTimeFormat("sv-SE", {
  timeZone: FUSO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/** «AAAA-MM-GG HH:MM» oppure «AAAA-MM-GGTHH:MM(:SS)», con o senza secondi. */
const FORMA = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/;

/** Un timbro che porta già il suo fuso scritto (`Z`, `+02:00`, `-0500`) è un istante esatto. */
const HA_FUSO = /(?:Z|[+-]\d{2}:?\d{2})$/;

/**
 * L'ora di Piacenza, formato «AAAA-MM-GG HH:MM» — PURA: l'istante arriva da fuori.
 * (Era in registra-cadenza.mjs, che ora la riesporta: i chiamanti storici non cambiano.)
 */
export function timbroOra(quando = new Date()) {
  return FMT_MINUTI.format(quando);
}

/** Solo il giorno di Piacenza, «AAAA-MM-GG» — quello che `toISOString().slice(0,10)` sbaglia
 *  ogni notte fra mezzanotte e le due, quando a Piacenza è già domani e per UTC è ancora ieri. */
export function giornoPiacenza(quando = new Date()) {
  return FMT_MINUTI.format(quando).slice(0, 10);
}

/** Il mese di Piacenza, «AAAA-MM» — stessa storia, sul confine fra due mesi. */
export function mesePiacenza(quando = new Date()) {
  return FMT_MINUTI.format(quando).slice(0, 7);
}

/**
 * Di quanto Piacenza è avanti rispetto a UTC IN QUEL PRECISO ISTANTE, in millisecondi.
 * D'inverno +1h (CET), d'estate +2h (CEST) — e il giorno del cambio la risposta cambia a metà
 * giornata. È l'unico numero che un offset cablato non può conoscere.
 */
export function offsetPiacenzaMs(istanteMs) {
  const t = Number(istanteMs);
  if (!Number.isFinite(t)) return NaN;
  const m = FORMA.exec(FMT_SECONDI.format(new Date(t)));
  if (!m) return NaN;
  const comeSeFosseUTC = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0));
  // I secondi bastano: il formatter tronca i millisecondi, quindi si confronta con l'istante
  // troncato allo stesso modo (`Math.floor` regge anche le date prima del 1970).
  return comeSeFosseUTC - Math.floor(t / 1000) * 1000;
}

/**
 * IL CUORE. Da un timbro scritto in ORA DI PIACENZA all'istante vero (millisecondi epoch).
 * `NaN` se la stringa non è un timbro — mai un numero inventato: un campo illeggibile deve poter
 * diventare «non l'ho potuto leggere», non una data del secolo scorso.
 *
 * Perché due passate: l'offset dipende dall'istante, e l'istante è proprio quello che stiamo
 * cercando. Si parte dall'ipotesi «il timbro fosse UTC», si toglie l'offset di lì, e si rifà il
 * conto sull'istante appena trovato. La seconda passata conta solo nelle due notti del cambio
 * d'ora, ed è lì che il primo tentativo sbaglierebbe di un'ora.
 *
 * I due casi limite del cambio d'ora, dichiarati perché non siano una sorpresa:
 *   · notte d'autunno, l'ora che esiste DUE volte (02:30 del 25/10/2026) → si sceglie la seconda,
 *     quella già in ora solare;
 *   · notte di primavera, l'ora che NON esiste (02:30 del 29/3/2026) → si scala in avanti (03:30).
 * In entrambi i casi la risposta è deterministica e sbaglia al massimo di un'ora, una notte
 * all'anno: il difetto curato qui sbagliava di un'ora TUTTI i giorni per sei mesi.
 */
export function msDaTimbro(timbro) {
  const s = String(timbro ?? "").trim();
  if (!s) return NaN;
  // Un timbro che dichiara già il suo fuso è un istante esatto: non va reinterpretato.
  if (HA_FUSO.test(s)) return Date.parse(s.replace(" ", "T"));

  const m = FORMA.exec(s);
  if (!m) return NaN;
  const [, anno, mese, giorno, ore, minuti, secondi] = m.map(Number);
  // La forma da sola non basta: «2026-13-45 99:99» la passa. Un campo fuori scala è illeggibile,
  // non una data lontana — è la differenza fra «non lo so» e un allarme da 9710 giorni.
  if (mese < 1 || mese > 12 || giorno < 1 || giorno > 31 || ore > 23 || minuti > 59 || (secondi || 0) > 59) return NaN;

  const comeSeFosseUTC = Date.UTC(anno, mese - 1, giorno, ore, minuti, secondi || 0);
  const primaIpotesi = comeSeFosseUTC - offsetPiacenzaMs(comeSeFosseUTC);
  const offsetVero = offsetPiacenzaMs(primaIpotesi);
  if (!Number.isFinite(offsetVero)) return NaN;
  return comeSeFosseUTC - offsetVero;
}

/**
 * Quante ore sono passate da un timbro di Piacenza a un certo istante. `null` se il timbro non si
 * legge — perché «non l'ho potuto leggere» e «zero ore fa» sono due cose opposte, e confonderle è
 * come un guardiano si dichiara verde senza aver guardato.
 */
export function oreDaTimbro(timbro, adessoMs) {
  const t = msDaTimbro(timbro);
  const ora = Number(adessoMs);
  if (!Number.isFinite(t) || !Number.isFinite(ora)) return null;
  return (ora - t) / 3_600_000;
}
