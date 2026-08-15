#!/usr/bin/env node
// 🚦 ESITO-GUARDIANO — da un codice d'uscita a un verdetto, e il cieco non si può perdere per strada.
//
// LA MALATTIA CHE CURA. Un guardiano che non ha potuto guardare stampa la frase rassicurante invece
// di dichiararsi cieco. Non perché sbagli lui: perché chi legge il suo esito lo interpreta con una
// regola scritta a mano — «è rosso se il codice è 1» — e ogni altro codice, il 2 compreso, cade nel
// ramo «ok». Nel contratto di casa (AR-322) il 2 vuol dire **NON HO POTUTO MISURARE**, e non è mai
// un verde. La forma generale: *un metro che non misura una strada non la dichiara scoperta, dice
// verde*. Da lì il verde vale zero e nessuno se ne accorge.
//
// PERCHÉ UN FILE A PARTE. La traduzione codice → verdetto viveva dentro `daGuardiano()` in
// salute.mjs, cioè dentro una funzione che lancia processi: una prova poteva solo cercarne la forma
// in un file, non ESEGUIRLA. Qui non si legge niente e non si chiama niente: entrano un numero e due
// regole facoltative, esce un giudizio. Così la prova si può rompere apposta e vedere il rosso.
//
// IL PATTO CON CHI CHIAMA: **si può stringere, non si può far sparire il cieco.**
//   · `rossoSe` e `ciecoSe` AGGIUNGONO codici al rosso e al cieco. Non ne tolgono.
//   · verde è solo lo 0, e solo se nessuno lo ha dichiarato rosso.
//   · il 2 è cieco sempre. Un guardiano che usa il 2 per dire altro va riparato lui, non letto
//     diversamente: è il contratto di casa, e un contratto che ogni lettore reinterpreta non esiste.
//   · un codice che non è un numero intero è cieco, non rosso: «il guardiano non ha risposto» e «il
//     guardiano ha risposto male» sono due cose diverse, e la prima non l'ho misurata.
//
// 🟢 Sola lettura pura: niente I/O, niente rete, niente processi.

/** Il contratto dei codici d'uscita dei guardiani (AR-322). */
export const CODICE = { verde: 0, rosso: 1, cieco: 2 };

/** Il codice d'uscita di un verdetto. L'inverso di `leggiEsito`, per chi deve uscire da un CLI. */
export function codiceDiUscita(esito) {
  const stato = typeof esito === "string" ? esito : esito?.stato;
  if (stato === "verde") return CODICE.verde;
  if (stato === "rosso") return CODICE.rosso;
  return CODICE.cieco; // compreso l'ignoto: non sapere che verdetto dare è già una cecità
}

/**
 * Il verdetto di un guardiano dal suo codice d'uscita.
 *
 * @param {number|null|undefined} code il codice d'uscita del processo
 * @param {{rossoSe?:(c:number)=>boolean, ciecoSe?:(c:number)=>boolean, partito?:boolean, motivoNonPartito?:string}} regole
 * @returns {{stato:"verde"|"rosso"|"cieco", motivo:string, codice:number}}
 */
export function leggiEsito(code, { rossoSe, ciecoSe, partito = true, motivoNonPartito = "" } = {}) {
  // ① Il guardiano non è nemmeno partito. Un comando che non esiste, un timeout, un errore di spawn:
  //    di quella strada non so niente. È la cecità più facile da vendere per verde, perché il codice
  //    d'uscita in quel caso spesso è `null` — e `null !== 0` finirebbe nel rosso, che è una bugia
  //    opposta ma sempre una bugia: accuserei un guardiano di aver trovato qualcosa che non ha visto.
  if (partito === false) {
    return cieco(`il controllo non è partito${motivoNonPartito ? `: ${motivoNonPartito}` : ""}`);
  }

  // ② Il codice non è un numero intero: nessuna risposta è arrivata, o è arrivata illeggibile.
  if (!Number.isInteger(code)) {
    return cieco(`il controllo non ha restituito un codice d'uscita leggibile (${descrivi(code)})`);
  }

  // ③ Il cieco di casa, più quello che il chiamante aggiunge. Sta PRIMA del rosso apposta: se
  //    qualcuno dichiarasse rosso anche il 2, il cieco sparirebbe — ed è esattamente ciò che questo
  //    file esiste per impedire.
  if (code === CODICE.cieco) return cieco("il controllo si è dichiarato cieco (uscita 2): non ha potuto misurare");
  const cSe = chiama(ciecoSe, code);
  if (cSe.rotta) return cieco(`la regola «cieco se» di chi ha chiamato è esplosa (${cSe.rotta}): non l'ho potuta applicare`);
  if (cSe.vale) return cieco(`chi ha chiamato il controllo dichiara cieca l'uscita ${code}`);

  // ④ Il rosso di casa (tutto ciò che non è 0), più quello che il chiamante aggiunge. `rossoSe` può
  //    solo ALLARGARE il rosso: una regola stretta — «rosso solo se è 1» — non promuove più a verde
  //    il 3 e il 7, che è il buco da cui questa malattia entrava.
  if (code !== CODICE.verde) return { stato: "rosso", motivo: `il controllo è uscito ${code}`, codice: CODICE.rosso };
  const rSe = chiama(rossoSe, code);
  if (rSe.rotta) return cieco(`la regola «rosso se» di chi ha chiamato è esplosa (${rSe.rotta}): non l'ho potuta applicare`);
  if (rSe.vale) return { stato: "rosso", motivo: `chi ha chiamato il controllo dichiara rossa l'uscita ${code}`, codice: CODICE.rosso };

  return { stato: "verde", motivo: "il controllo è uscito 0: non ha trovato niente da riparare", codice: CODICE.verde };
}

/**
 * Il verdetto quando il DATO D'INGRESSO non è leggibile: JSON rotto, forma inattesa, file troncato.
 *
 * Serve a non morire con lo stack trace. Un ingresso illeggibile non è un guasto del guardiano ed è
 * ancora meno un «niente da segnalare»: è una cecità da dichiarare, cioè uscita 2. Il testo dice
 * SEMPRE cosa non si è potuto leggere, perché «cieco» senza il perché non si può riparare.
 *
 * @param {unknown} err l'errore, o una frase che spiega la forma trovata
 * @param {{cosa?:string}} ctx `cosa` = la fonte che non si è letta (file, campo, tabella)
 */
export function ciecoPerDatoIllegibile(err, { cosa = "" } = {}) {
  const perche = err instanceof Error ? err.message : String(err ?? "").trim() || "motivo non riportato";
  return cieco(`${cosa ? `${cosa}: ` : ""}${perche.split("\n")[0]}`);
}

/**
 * Il verdetto sulla LETTURA DI UNA FONTE, dai fatti grezzi. Pura: l'I/O lo fa chi chiama e passa
 * qui cosa ha trovato.
 *
 * LA MALATTIA CHE CHIUDE (AR-709). Il modo più comune di perdere una cecità è un lettore che torna
 * `null` sia quando il file non c'è, sia quando il JSON è rotto, sia quando la forma è un'altra —
 * e un chiamante che da quel `null` conclude «ho misurato e ho trovato un problema», cioè uscita 1.
 * Ma 1 nel contratto di casa (AR-322) vuol dire «ho guardato»: chi legge il codice d'uscita — il
 * giro, il cancello, la CI — non può più distinguere un registro pieno di guai da un registro che
 * non si è lasciato aprire, e il secondo arriva con la faccia del primo.
 *
 * Le quattro strade sono quattro, e tre su quattro sono cieche:
 *   · la fonte non c'è          → cieco (non è «vuota»: non l'ho vista)
 *   · leggerla è esplosa        → cieco
 *   · la forma non è quella     → cieco (è AR-664: meglio dirlo che morire con lo stack trace)
 *   · tutto a posto             → verde, e da qui in poi decide chi ha chiamato
 *
 * @param {{trovata?:boolean, errore?:unknown, formaValida?:boolean, formaAttesa?:string}} fatti
 * @param {{cosa?:string}} ctx `cosa` = il nome della fonte, per poterlo dire a chi legge
 */
export function esitoDellaFonte({ trovata = true, errore = null, formaValida = true, formaAttesa = "" } = {}, { cosa = "la fonte" } = {}) {
  if (trovata === false) return ciecoPerDatoIllegibile("non esiste", { cosa });
  if (errore) return ciecoPerDatoIllegibile(errore, { cosa });
  if (formaValida === false)
    return ciecoPerDatoIllegibile(`la forma non è quella attesa${formaAttesa ? ` (${formaAttesa})` : ""}`, { cosa });
  return { stato: "verde", motivo: `${cosa}: letta`, codice: CODICE.verde };
}

/**
 * Il verdetto quando non c'è stato NIENTE da misurare mentre del lavoro c'era.
 *
 * Zero misurazioni non è zero problemi. È la stessa forma di AR-395 sullo stage vuoto: un metro che
 * non ha niente sotto non sta dando un verde, sta dicendo che non ha guardato.
 *
 * @param {number} quanti quante cose ha davvero guardato
 * @param {string} cosa il nome di ciò che avrebbe dovuto guardare
 */
export function ciecoSeNienteMisurato(quanti, cosa) {
  if (Number.isInteger(quanti) && quanti > 0) return null;
  return cieco(`nessun ${cosa} è stato guardato: un controllo senza niente da misurare non è un verde`);
}

const cieco = (motivo) => ({ stato: "cieco", motivo, codice: CODICE.cieco });
const descrivi = (v) => (v === null ? "null" : v === undefined ? "assente" : `${typeof v} ${String(v)}`);
/**
 * Applica una regola del chiamante e dice ANCHE se non ci è riuscita.
 *
 * Il `catch` NON torna `false`: una regola che esplode non è una regola che ha detto no. Ingoiarla
 * darebbe un verdetto calcolato su una misura in meno, con la faccia di uno completo — è la malattia
 * «una fonte letta a metà produce un verdetto intero», e su questo file sarebbe la beffa perfetta.
 */
const chiama = (fn, code) => {
  if (typeof fn !== "function") return { vale: false };
  try {
    return { vale: fn(code) === true };
  } catch (e) {
    return { rotta: (e?.message || String(e)).split("\n")[0] };
  }
};
