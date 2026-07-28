// AR-233 · AR-256 · AR-262 — «non c'è niente» e «non sono riuscito a leggere» non sono la stessa cosa.
//
// È la gemella lato Pannello di `cervello/fonte-numero.mjs`. Là un buco si travestiva da zero in un
// freno; qui si traveste da buona notizia in una schermata — che è peggio, perché la schermata la
// legge Nicola e ci decide sopra.
//
//   AR-233 — la home dice «Niente da firmare. 👍» anche quando la coda non è stata letta. La catena:
//     `readVaultFile` torna `string | null`, e quel `null` significa insieme «il file non esiste» e
//     «GitHub è giù / il token è morto»; `tutteLeAzioni` lo trasforma in `[]`; la Plancia ha un
//     `.catch(() => {})` sulla fetch. Tre appiattimenti in fila, e alla fine un pollice in su.
//     Nella coda ci sono card 🔴 con scadenza: dire «niente da firmare» quando non lo sai è la bugia
//     più cara che questo Pannello possa raccontare.
//
//   AR-256 — se il cantiere arriva malformato, `.filter()` lancia DENTRO un `.then()`, `setLinks` non
//     viene mai chiamato e dalla home spariscono in silenzio i tre collegamenti alla salute. Non un
//     errore: proprio il vuoto, come se non ci fosse niente da vedere.
//
//   AR-262 — l'interruttore delle Stelle Polari torna indietro da solo: la POST ha un
//     `.catch(() => {})`, `res.ok` non viene mai controllato (una 500 non fa scattare il catch) e poi
//     si ricarica dal server, che riallinea allo stato vero. Nicola vede il gesto annullarsi e non sa
//     se ha sbagliato lui.
//
// La regola, la stessa del cervello: **al buio non dare la risposta comoda.** Qui la risposta comoda
// è «tutto a posto, non c'è niente da fare».
//
// Nessuna dipendenza: si esegue in un test senza React, senza rete, senza disco.

/** L'esito di una lettura che può non essere avvenuta. Tre stati, non due. */
export type Lettura<T> =
  | { stato: "letto"; dato: T }
  | { stato: "assente" } // ho guardato e non c'era: è un'informazione vera
  | { stato: "cieco"; motivo: string }; // non ho potuto guardare: NON è un'informazione

export const letto = <T,>(dato: T): Lettura<T> => ({ stato: "letto", dato });
export const assente = <T,>(): Lettura<T> => ({ stato: "assente" });
export const cieco = <T,>(motivo: string): Lettura<T> => ({ stato: "cieco", motivo });

/** Vero solo se la lettura è avvenuta davvero. */
export function haDato<T>(l: Lettura<T>): l is { stato: "letto"; dato: T } {
  return l.stato === "letto";
}

/** Il dato, o un ripiego. Da usare SOLO dove il ripiego non viene mostrato come un fatto. */
export function oppure<T>(l: Lettura<T>, ripiego: T): T {
  return l.stato === "letto" ? l.dato : ripiego;
}

/**
 * Il messaggio da mostrare quando non c'è niente da mostrare. È la decisione che questo file esiste
 * per rendere provabile: «vuoto» e «cieco» devono produrre due frasi DIVERSE.
 *
 * Un pollice in su su una lista che non è stata letta non è un dettaglio di stile: è la differenza fra
 * «ho controllato, sei a posto» e «non ho potuto controllare».
 */
export function testoQuandoVuoto(
  l: Lettura<unknown>,
  testi: { vuoto: string; cieco: string },
): { testo: string; rassicurante: boolean } {
  if (l.stato === "cieco") return { testo: testi.cieco, rassicurante: false };
  return { testo: testi.vuoto, rassicurante: true };
}

/**
 * Legge un corpo JSON da una fetch distinguendo i tre casi. `res.ok` va controllato: una risposta 500
 * arriva col suo bel corpo e non fa scattare nessun `catch` — è il difetto AR-262.
 */
export async function daRisposta<T>(res: Response | null, estrai: (corpo: unknown) => T | null): Promise<Lettura<T>> {
  if (!res) return cieco("nessuna risposta dal server");
  if (!res.ok) return cieco(`il server ha risposto ${res.status}`);
  let corpo: unknown;
  try {
    corpo = await res.json();
  } catch {
    return cieco("risposta non leggibile (JSON non valido)");
  }
  const d = estrai(corpo);
  return d == null ? assente<T>() : letto(d);
}

/**
 * Un elenco che potrebbe non essere un elenco. Serve dove un `.filter()` su dati malformati farebbe
 * saltare tutta la schermata (AR-256): meglio una lista vuota dichiarata che una pagina che sparisce.
 * Toglie anche le righe nulle, che sono la seconda causa di eccezione dentro un `.then()`.
 */
export function listaSicura<T>(x: unknown): T[] {
  return Array.isArray(x) ? (x.filter(Boolean) as T[]) : [];
}

/**
 * Il semaforo di una scheda quando il dato non è arrivato. Non «verde» (sarebbe una bugia) e non
 * «rosso» (allarmerebbe su un guasto che non sappiamo esistere): grigio, cioè «non lo so».
 * È il contratto del guardiano cieco (AR-322) portato a video.
 */
export function semaforoDaLettura(
  l: Lettura<unknown>,
  quandoLetto: "verde" | "giallo" | "rosso",
): "verde" | "giallo" | "rosso" | "grigio" {
  return l.stato === "letto" ? quandoLetto : "grigio";
}
