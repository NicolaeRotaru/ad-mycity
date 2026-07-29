// AR-147 / AR-214 — un countdown è un DATO CALCOLATO, non una frase trascritta.
//
// Il difetto, misurato il 28/7 alle 05:59: due schede della stessa pagina dicono «mancano 3 giorni»
// per il bando PI26. La scadenza è il 30/7 alle 16:00, quindi ne mancano **2,4**. E le due schede non
// divergono fra loro — **concordano, e sbagliano tutte e due**, il che è peggio: due fonti che dicono
// lo stesso numero sembrano una conferma.
//
// La causa non è la distrazione. È che il numero è stato TRASCRITTO invece che calcolato: era vero il
// giorno in cui qualcuno l'ha scritto, e da lì invecchia in silenzio sembrando aggiornato. Nel vault
// si vede la deriva riga per riga — «mancano 4 giorni», «~2,5 giorni residui», «~2,3», «~2,2»,
// «mancano 3 giorni» — ognuna vera al suo istante, nessuna ricalcolata.
//
// AR-147 aggiunge l'altra metà: l'agente `scadenzario` esiste da sempre e non ha mai prodotto un
// artefatto-dati. Le scadenze esterne vivevano come racconto dentro i Report, e un racconto non
// suona quando è ora.
//
// La posta in gioco qui non è architetturale: PI26 sono 10.000€ a fondo perduto, sportello a
// esaurimento, e dopo l'invio non si corregge. Leggere «3 giorni» quando ne restano 2 è la
// differenza fra arrivare e non arrivare.
//
// Nessun import: si esegue in un test senza toccare disco, rete o vault.

/** Millisecondi in un'ora e in un giorno. */
const ORA = 3_600_000;
const GIORNO = 24 * ORA;

/** Parsing tollerante: ISO con fuso, oppure «AAAA-MM-GG HH:MM». `null` se illeggibile. */
export function istante(v) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const t = Date.parse(s.includes("T") ? s : s.replace(" ", "T"));
  return Number.isFinite(t) ? t : null;
}

/**
 * Quanto manca, come DATO. Mai una frase.
 * @returns {{ore: number, giorni: number, scaduta: boolean}|null} `null` se la data non si legge.
 */
export function quantoManca(scadenzaIso, adessoMs = Date.now()) {
  const t = istante(scadenzaIso);
  if (t == null) return null;
  const ms = t - adessoMs;
  return { ore: ms / ORA, giorni: ms / GIORNO, scaduta: ms <= 0 };
}

/**
 * La gravità di una scadenza. Sale a scalini, e ogni scalino ha un nome che si capisce a voce.
 *
 * Gli scalini non sono decorativi: sono il motivo per cui un allarme si nota. Un avviso identico
 * ripetuto a ogni giro per due settimane è indistinguibile dal silenzio (è la lezione di AR-114, già
 * pagata due volte in questa macchina).
 */
export function livelloScadenza(ore) {
  if (!Number.isFinite(ore)) return "sconosciuto";
  if (ore <= 0) return "scaduta";
  if (ore <= 24) return "ultime-ore";
  if (ore <= 72) return "imminente";
  if (ore <= 168) return "questa-settimana";
  return "lontana";
}

/** Il codice d'uscita del guardiano, secondo il contratto AR-322. */
export function codiceUscita(livello) {
  if (livello === "sconosciuto") return 2; // non ho potuto misurare: cieco, non verde
  if (livello === "scaduta" || livello === "ultime-ore" || livello === "imminente") return 1;
  return 0;
}

/**
 * Come si SCRIVE un countdown perché non invecchi: col numero E con l'istante in cui è stato
 * calcolato. Una frase senza «calcolato il …» non si può smentire — ed è per questo che «mancano 3
 * giorni» è sopravvissuto un giorno di troppo.
 */
export function testoCountdown(scadenzaIso, adessoMs = Date.now()) {
  const m = quantoManca(scadenzaIso, adessoMs);
  if (!m) return { testo: "scadenza non leggibile", livello: "sconosciuto" };
  const livello = livelloScadenza(m.ore);
  if (m.scaduta) return { testo: `SCADUTA da ${Math.abs(m.ore).toFixed(0)}h`, livello };
  const testo = m.ore <= 48 ? `mancano ${m.ore.toFixed(0)} ore` : `mancano ${m.giorni.toFixed(1)} giorni`;
  return { testo, livello };
}

/**
 * Una frase che contiene un countdown trascritto a mano. Serve al guardiano per trovare le copie
 * vecchie: se un file dice «mancano N giorni» e il calcolo ne dà un altro, quella frase è una bugia
 * che invecchia — indipendentemente da quanto fosse vera quando è stata scritta.
 */
export function countdownNelTesto(testo) {
  const out = [];
  const re = /man(?:ca|cano)\s+(\d+(?:[.,]\d+)?)\s*(giorn[oi]|ore|h)\b/gi;
  let m;
  while ((m = re.exec(String(testo ?? ""))) != null) {
    const n = Number(String(m[1]).replace(",", "."));
    const unita = /giorn/i.test(m[2]) ? "giorni" : "ore";
    out.push({ frase: m[0], valore: n, unita, giorni: unita === "giorni" ? n : n / 24 });
  }
  return out;
}

/**
 * Un countdown scritto a mano è «stantio» se si discosta dal calcolo di più di una soglia.
 * Mezza giornata è la tolleranza: sotto, è normale arrotondamento; sopra, è un numero che ha smesso
 * di essere vero e continua a essere letto.
 */
export function countdownStantio({ scritto, scadenzaIso, adessoMs = Date.now(), tolleranzaGiorni = 0.5 } = {}) {
  const m = quantoManca(scadenzaIso, adessoMs);
  if (!m || !Number.isFinite(scritto)) return { stantio: false, motivo: "non confrontabile" };
  const scarto = Math.abs(scritto - m.giorni);
  return {
    stantio: scarto > tolleranzaGiorni,
    scarto,
    reale: m.giorni,
    motivo: scarto > tolleranzaGiorni
      ? `dice ${scritto} giorni ma ne mancano ${m.giorni.toFixed(1)}: scarto ${scarto.toFixed(1)}`
      : `coerente (scarto ${scarto.toFixed(1)})`,
  };
}
