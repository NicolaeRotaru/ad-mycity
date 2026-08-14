// cronicita-allarmi.mjs — da quanto suona questo allarme? Nato per AR-440.
//
// IL DIFETTO, in una riga: un allarme acceso da settimane e uno acceso da un minuto si leggono
// uguale, quindi il primo diventa sfondo e nessuno lo vede più.
//
// I cinque perché, dalla scheda: ① nessun controllo distingue «rosso nuovo» da «rosso cronico»;
// ② perché ogni vincolo è una stringa vuota o piena, senza storia; ③ perché niente tiene stato fra
// un giro e l'altro; ④ perché finché un allarme suona ogni tanto la cosa non si vede — si vede solo
// quando ne suona uno per settimane, e a quel punto è già diventato sfondo; ⑤ RADICE: un guardiano
// perennemente rosso costa quanto uno spento, e la macchina non aveva NESSUN modo di misurare la
// cronicità. Questo file è quel modo.
//
// PERCHÉ CONTA PIÙ DI QUANTO SEMBRI. Un cancello che suona sempre viene aggirato al secondo giro, e
// da lì in poi smette di fermare anche i rossi veri: il costo non è il rumore, è la difesa che si
// spegne da sola senza che nessuno l'abbia decisa.
//
// TUTTO PURO: entrano il conto di prima e i nomi accesi adesso, esce il conto nuovo. Nessun disco,
// nessun orologio interno, nessuna rete — così una prova può far scorrere venti giri in un
// millisecondo invece di aspettare venti giorni per vedere cosa succede.

/** Oltre questi giri di fila lo stesso allarme non è più una notizia: è una condizione. */
export const GIRI_PER_CRONICO = 3;

/**
 * Aggiorna il conto dei giri consecutivi per ogni allarme acceso.
 *
 * @param {Record<string, number>} prima  quante volte di fila era acceso ognuno, al giro scorso
 * @param {string[]} accesiOra            chi è acceso adesso (id del controllo o del vincolo)
 * @returns {Record<string, number>}      il conto nuovo. Chi si è spento SPARISCE: un allarme
 *                                        risolto e poi riacceso è nuovo di nuovo, e va riguardato.
 */
export function aggiornaConto(prima = {}, accesiOra = []) {
  const dopo = {};
  for (const id of accesiOra) {
    const n = Number(prima?.[id]);
    dopo[id] = (Number.isFinite(n) && n > 0 ? n : 0) + 1;
  }
  return dopo;
}

/**
 * Il giudizio su un singolo allarme, dato il numero di giri consecutivi in cui è acceso.
 *
 * Tre stati e non due, perché sono tre cose diverse da fare: il NUOVO si guarda adesso, il RIPETUTO
 * si sta guardando, il CRONICO non lo sta guardando nessuno — e quello va tolto dal rumore di fondo
 * e messo davanti a Nicola come una domanda, non ripetuto una quarta volta uguale.
 */
export function statoAllarme(giri, soglia = GIRI_PER_CRONICO) {
  const n = Number(giri) || 0;
  if (n <= 0) return { stato: "spento", cronico: false, giri: 0 };
  if (n === 1) return { stato: "nuovo", cronico: false, giri: n };
  if (n < soglia) return { stato: "ripetuto", cronico: false, giri: n };
  return { stato: "cronico", cronico: true, giri: n };
}

/**
 * La frase che va davanti agli occhi. Un numero secco («3») non dice niente a chi legge di fretta:
 * quello che cambia il comportamento è «dice no da 3 giri e nessuno l'ha risolto».
 *
 * L'unità si passa da fuori — «giri» per il giro, «visite» per la visita di salute — perché ogni
 * numero deve arrivare col suo metro: «12» da solo non dice se sono ore, giorni o controlli.
 */
export function dilloAVoce(giri, soglia = GIRI_PER_CRONICO, unita = "giri") {
  const s = statoAllarme(giri, soglia);
  if (s.stato === "spento") return "";
  if (s.stato === "nuovo") return `acceso adesso, non c'era ${unita === "visite" ? "alla visita scorsa" : "al giro scorso"}`;
  if (s.stato === "ripetuto") return `acceso in ${s.giri} ${unita} di fila`;
  return `acceso in ${s.giri} ${unita} di fila e nessuno l'ha risolto`;
}

/**
 * Il quadro completo, per chi deve decidere cosa mostrare e cosa smettere di ripetere.
 *
 * `daPortareANicola` è la parte che vale: sono gli allarmi appena diventati cronici — quelli che
 * hanno appena tagliato la soglia. Si segnalano UNA volta, quando cambiano stato, perché una card
 * ripetuta a ogni giro è esattamente la malattia che questo file cura, spostata di un piano.
 */
export function quadroCronicita(prima = {}, accesiOra = [], soglia = GIRI_PER_CRONICO) {
  const dopo = aggiornaConto(prima, accesiOra);
  const nuovi = [];
  const cronici = [];
  const daPortareANicola = [];
  for (const [id, giri] of Object.entries(dopo)) {
    const s = statoAllarme(giri, soglia);
    if (s.stato === "nuovo") nuovi.push(id);
    if (s.cronico) {
      cronici.push({ id, giri, detto: dilloAVoce(giri, soglia) });
      if (!statoAllarme(prima?.[id], soglia).cronico) daPortareANicola.push({ id, giri });
    }
  }
  const spenti = Object.keys(prima || {}).filter((id) => !(id in dopo));
  return { conto: dopo, nuovi, cronici, spenti, daPortareANicola };
}
