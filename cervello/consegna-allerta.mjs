#!/usr/bin/env node
// 📣 UN'ALLERTA EMESSA NON È UN'ALLERTA CONSEGNATA — la cascata dei canali, con la ricevuta.
// 🟢 Il modulo è puro: i canali si passano da fuori, cosi' il test li esegue senza toccare niente.
//
// IL DIFETTO CHE CHIUDE (AR-365, bloccante). La macchina e' rimasta morta 36 ore e nessuno se n'e'
// accorto. L'unico allarme previsto usciva da un canale solo — Telegram — che non e' mai stato
// collegato. E il codice non falliva quando il canale mancava: `pingTelegram` faceva `return` muto
// se il token non c'era, e la riga SUBITO DOPO scriveva nello stato «allerta data», con tanto di ora.
// Da quel momento il dedup la considerava gia' mandata e non ci riprovava piu'.
//
// La causa di sistema, scritta sulla scheda e vera: la macchina non distingue «allerta emessa» da
// «allerta consegnata». Qualunque canale puo' essere assente, e il sistema continua a comportarsi
// come se avesse parlato — e lo mette a verbale nella propria memoria.
//
// LA CURA HA UNA FORMA SOLA: nessuno scrive «data» se non c'e' una RICEVUTA. Un canale che non
// risponde non e' un canale che ha consegnato, e un'allerta non consegnata al giro dopo si riprova.
//
// IL RIPIEGO CHE NON PUO' MANCARE. Telegram e' un canale che puo' non esserci. Il canale che c'e'
// sempre e' una card in `AZIONI-IN-ATTESA.md`: e' un file nella memoria dell'AD, e il Pannello lo
// legge per riempire «Da approvare» — cioe' e' la cosa che Nicola guarda davvero. Un ripiego che
// nessuno guarda sarebbe una cura finta, e sarebbe peggio del difetto perche' sembrerebbe risolto.

/**
 * L'ESITO DELLA CASCATA, in una funzione pura che un test puo' ESEGUIRE.
 *
 * @param risultati array di { canale, riuscito, motivo? }
 * @returns {{consegnata: boolean, riusciti: string[], falliti: Array<{canale,motivo}>}}
 *
 * `consegnata` e' vero se ALMENO UN canale ha dato ricevuta. Zero canali provati non e' consegnata:
 * e' il caso in cui non c'e' nessun canale configurato, ed e' esattamente la situazione del 36 ore.
 */
export function esitoConsegna(risultati = []) {
  const riusciti = [];
  const falliti = [];
  for (const r of risultati) {
    if (r && r.riuscito) riusciti.push(String(r.canale));
    else if (r) falliti.push({ canale: String(r.canale), motivo: String(r.motivo || "non ha detto perche'") });
  }
  return { consegnata: riusciti.length > 0, riusciti, falliti };
}

/**
 * SI PUO' SCRIVERE «DATA» NELLO STATO?
 *
 * E' la riga che il difetto ha reso famosa. Sta qui, da sola, perche' e' la decisione: finche' era
 * dentro il flusso della sentinella nessuno poteva interrogarla, e infatti per mesi nessuno l'ha
 * fatto. Adesso e' una domanda con una risposta che si esegue.
 */
export function vaSegnataComeData(esito) {
  return Boolean(esito && esito.consegnata);
}

/**
 * IL TESTO CHE CHI LEGGE DEVE TROVARE quando un'allerta non e' arrivata a nessuno.
 * Non e' decorazione: un fallimento muto e' come il difetto di partenza.
 */
export function refertoConsegna(ev, esito) {
  if (esito.consegnata) {
    return `📣 allerta «${ev?.chiave || "senza nome"}» consegnata a: ${esito.riusciti.join(", ")}`;
  }
  const perche = esito.falliti.length
    ? esito.falliti.map((f) => `${f.canale} (${f.motivo})`).join(" · ")
    : "nessun canale disponibile";
  return `⛔ allerta «${ev?.chiave || "senza nome"}» NON consegnata a nessuno — ${perche}. Non la segno come data: al giro dopo si riprova.`;
}

/**
 * Prova i canali in cascata e torna la ricevuta.
 *
 * Li prova TUTTI, non si ferma al primo che riesce: se Telegram funziona ma la card no, chi legge
 * deve saperlo — un canale rotto e' un difetto da vedere, non un dettaglio da nascondere dietro un
 * successo altrui.
 *
 * @param ev      l'evento della sentinella
 * @param canali  array di { nome, manda: async (ev) => void }  — se `manda` lancia, il canale ha fallito
 */
export async function consegnaAllerta(ev, canali = []) {
  const risultati = [];
  for (const c of canali) {
    try {
      await c.manda(ev);
      risultati.push({ canale: c.nome, riuscito: true });
    } catch (e) {
      risultati.push({ canale: c.nome, riuscito: false, motivo: String(e?.message || e).slice(0, 200) });
    }
  }
  return esitoConsegna(risultati);
}

// ─────────────────────────────────────────────────────────────────────────────
// 🫀 VIVO NON VUOL DIRE CHE STA LAVORANDO (AR-366, bloccante)
//
// E' la stessa malattia dell'altra meta' di questo file, detta sull'altro segnale: un battito che
// dichiara una cosa che non e' vera. Il worker timbra `worker:ultimo` in CIMA al ciclo, dove non sa
// ancora cosa succedera'. Quindi un processo su con il motore AI giu' batte lo stesso, e la
// sentinella — che quel battito lo legge come «il cervello sta lavorando» — resta muta.
//
// La causa di sistema, dalla scheda: UN segnale porta DUE significati incompatibili. `battito_worker`
// e' nato per rispondere a systemd («devo riavviarti?»), che e' una domanda sul PROCESSO. Poi lo
// stesso segnale e' stato riusato per rispondere a «il cervello sta producendo?», che e' un'altra
// domanda. Il modo di fallire piu' probabile di questa macchina — processo su, motore giu' — cade
// esattamente nel punto cieco fra le due.
//
// La cura non e' un allarme in piu': e' un SECONDO segnale. `worker:ultimo` resta a systemd; il
// worker timbra `worker:ultimo:lavoro-riuscito` SOLO dopo un lavoro chiuso bene, e la regola qui
// sotto guarda quello.

/**
 * LA DOMANDA, pura ed eseguibile: il worker e' vivo ma non produce?
 *
 * @param battitoMin        minuti dall'ultimo battito (null = non lo so)
 * @param lavoroRiuscitoMin minuti dall'ultimo lavoro chiuso bene (null = non l'ho mai visto)
 * @param inAttesa          quanti lavori aspettano in coda
 * @param sogliaMin         oltre quanti minuti senza un lavoro riuscito si suona
 * @returns {{allerta: boolean, perche: string}}
 *
 * Le condizioni sono tre, e servono tutte e tre:
 *   · il battito e' FRESCO — se e' vecchio suona gia' l'allarme del worker morto, e due allarmi per
 *     lo stesso guasto insegnano a ignorarli entrambi;
 *   · l'ultimo lavoro riuscito e' VECCHIO (o non c'e' mai stato);
 *   · c'e' qualcosa IN CODA — senza lavoro da fare, non produrre non e' un guasto: e' riposo. Questa
 *     e' la condizione che evita l'allarme che grida di notte e che qualcuno spegne il giorno dopo.
 */
export function vivoMaNonProduce({ battitoMin, lavoroRiuscitoMin, inAttesa, sogliaMin }) {
  if (battitoMin === null || battitoMin === undefined) return { allerta: false, perche: "non so quando ha battuto l'ultima volta" };
  if (battitoMin > sogliaMin) return { allerta: false, perche: "il battito e' vecchio: e' l'altro allarme, non questo" };
  if (!inAttesa) return { allerta: false, perche: "non c'e' niente in coda: non produrre non e' un guasto" };
  if (lavoroRiuscitoMin === null || lavoroRiuscitoMin === undefined) {
    return { allerta: true, perche: `batte da ${battitoMin} min ma non ha MAI chiuso un lavoro bene, e ${inAttesa} aspettano in coda` };
  }
  if (lavoroRiuscitoMin > sogliaMin) {
    return { allerta: true, perche: `batte da ${battitoMin} min ma l'ultimo lavoro riuscito e' di ${lavoroRiuscitoMin} min fa, e ${inAttesa} aspettano in coda` };
  }
  return { allerta: false, perche: "ha chiuso un lavoro bene di recente" };
}
