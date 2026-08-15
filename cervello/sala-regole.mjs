// 🗣️ SALA-REGOLE — chi ha parlato nel canale di squadra, e chi ha chiesto aiuto senza riceverne.
//
// AR-621 e AR-622 sono lo stesso guasto visto da due lati: **il canale di squadra non ha nessun
// sensore addosso**, quindi tutto quello che lì dentro non succede è invisibile.
//
//   AR-621 — ad agosto la Sala Operativa è il monologo del direttore. Reparti con un ESITO fresco
//     nel loro quaderno (quindi che hanno lavorato oggi) non hanno una sola riga in Sala. Chi lavora
//     senza scrivere nel canale non esiste per gli altri: nessuno può aiutarlo, correggerlo o
//     riusare quello che ha fatto.
//   AR-622 — la revisione fra pari esiste solo sulla carta. Il formato la prevede (`RIVEDI`), e in
//     un mese e mezzo c'è UNA richiesta sola, del 29/7, senza risposta.
//
// Perché un sensore e non una regola scritta: una regola scritta è la forma più debole che esiste,
// vale solo se qualcuno la legge. Un numero in Cabina si vede da solo. Qui ci sono le funzioni pure
// che quel numero lo calcolano; chi legge il disco sta fuori.
//
// Il formato delle righe (dichiarato in testa a SALA-OPERATIVA.md):
//   - AAAA-MM-GG HH:MM · @reparto · TIPO · testo
// con TIPO fra FACCIO · FATTO · SERVE · PASSO-A @reparto · RIVEDI @reparto.

export const TIPI = ["FACCIO", "FATTO", "SERVE", "PASSO-A", "RIVEDI"];

const RE_RIGA = /^-\s*(\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2})?)\s*·\s*@?([A-Za-z0-9_.\-\/]+)\s*·\s*([A-Z\-]+)\s*·?\s*(.*)$/;

/** Le righe vere della Sala, già spacchettate. Le righe che non rispettano il formato si scartano. */
export function righeSala(testo) {
  const out = [];
  for (const riga of String(testo ?? "").split("\n")) {
    const m = RE_RIGA.exec(riga.trim());
    if (!m) continue;
    const [, quando, chi, tipo, resto] = m;
    if (!TIPI.includes(tipo)) continue;
    out.push({ quando, chi: chi.toLowerCase(), tipo, testo: resto, destinatari: destinatariDi(resto) });
  }
  return out;
}

/** I reparti citati con la chiocciola nel corpo di una riga: sono i destinatari di un passaggio. */
export function destinatariDi(testo) {
  return [...String(testo ?? "").matchAll(/@([A-Za-z0-9_\-]+)/g)].map((m) => m[1].toLowerCase());
}

/** Le righe dentro la finestra (in giorni) rispetto a un istante di riferimento. */
export function righeFresche(righe, giorni = 7, adesso = Date.now()) {
  return (righe || []).filter((r) => {
    const m = /(\d{4})-(\d{2})-(\d{2})/.exec(r.quando || "");
    if (!m) return false;
    const t = Date.parse(`${m[1]}-${m[2]}-${m[3]}T12:00:00Z`);
    return Number.isFinite(t) && (adesso - t) / 86400000 <= giorni;
  });
}

/**
 * AR-621 — CHI HA LAVORATO SENZA FARSI VEDERE.
 *
 * `repartiConEsitoFresco` sono i reparti che hanno scritto un ESITO nel loro quaderno dentro la
 * finestra: hanno lavorato, è provato. Se nella stessa finestra non hanno UNA riga in Sala, sono
 * invisibili al resto della squadra.
 *
 * Il direttore (`ad`) è escluso apposta: il suo lavoro in Sala c'è sempre, e tenerlo dentro
 * gonfierebbe il verde nascondendo il problema, che riguarda gli altri centoventi.
 */
export function repartiMuti(righe, repartiConEsitoFresco = [], { escludi = ["ad"] } = {}) {
  const hannoParlato = new Set((righe || []).map((r) => r.chi));
  return repartiConEsitoFresco
    .map((r) => String(r).toLowerCase())
    .filter((r) => !escludi.includes(r) && !hannoParlato.has(r))
    .sort();
}

/** Quanto è concentrato il canale in una sola voce: 1 = monologo perfetto. */
export function concentrazioneVoci(righe) {
  const lista = righe || [];
  if (!lista.length) return { totale: 0, voci: 0, dominante: null, quota: null };
  const per = new Map();
  for (const r of lista) per.set(r.chi, (per.get(r.chi) || 0) + 1);
  const [dominante, quante] = [...per.entries()].sort((a, b) => b[1] - a[1])[0];
  return { totale: lista.length, voci: per.size, dominante, quota: Math.round((quante / lista.length) * 100) / 100 };
}

/**
 * AR-622 — UNA RICHIESTA DI REVISIONE SENZA RISPOSTA È UNA RICHIESTA NON FATTA.
 *
 * Una `RIVEDI @tizio` conta come risposta quando @tizio scrive in Sala DOPO quella richiesta. Non si
 * pretende che la risposta citi la richiesta: il formato non lo prevede, e pretendere ciò che il
 * formato non permette è il modo di costruire un guardiano sempre rosso. Basta che il destinatario
 * si sia fatto vivo dopo essere stato chiamato.
 */
export function revisioniTraPari(righe) {
  const lista = righe || [];
  const richieste = [];
  for (let i = 0; i < lista.length; i++) {
    const r = lista[i];
    if (r.tipo !== "RIVEDI") continue;
    const chiamati = r.destinatari.filter((d) => d !== r.chi);
    const risposte = chiamati.filter((d) => lista.slice(i + 1).some((dopo) => dopo.chi === d));
    richieste.push({
      quando: r.quando,
      da: r.chi,
      a: chiamati,
      risposta: chiamati.length > 0 && risposte.length === chiamati.length,
      hanno_risposto: risposte,
    });
  }
  const senzaRisposta = richieste.filter((r) => !r.risposta);
  return {
    richieste: richieste.length,
    con_risposta: richieste.length - senzaRisposta.length,
    senza_risposta: senzaRisposta.length,
    elenco_senza_risposta: senzaRisposta.map((r) => `${r.quando} ${r.da}→${r.a.join(",") || "(nessuno)"}`),
  };
}
