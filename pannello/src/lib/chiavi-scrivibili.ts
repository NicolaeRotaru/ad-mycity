// AR-333 — la porta generica che scavalca il confine della firma.
//
// Trovata il 28/7 costruendo il lotto 26, tirando il filo del lotto 25. `POST /api/controllo` nasce
// per due interruttori — la PAUSA e il tetto di spesa — e il commento in cima lo dice: «Chiavi usate:
// "pausa" (on/off), "tetto_spesa" (€), "spesa_attuale" (€)». Ma il codice legge `{chiave, valore}`
// dal corpo della richiesta e li passa a `setImpostazione` **senza guardare la chiave**.
//
// Quindi quella rotta può scrivere QUALUNQUE riga della tabella `impostazioni` — compresa
// `azione:<id>:firma`, cioè la firma con cui Nicola autorizza un invio reale.
//
// È lo stesso confine che il lotto 25 ha appena sorvegliato dall'altro lato: lì il guardiano
// `firma-check.mjs` impedisce agli script del cervello di scriversi la firma; qui c'era una porta di
// servizio che faceva la stessa cosa passando dal Pannello. Un confine con una porta sola è un
// confine; con due, di cui una senza controllo, è un corridoio.
//
// La forma è quella del lotto: **il permesso è più largo della frase che l'ha ottenuto.** La rotta si
// chiama «controllo» e serve a due flag; il permesso che porta è «scrivi qualsiasi cosa».
//
// La firma continua ad avere la sua strada: `lib/firma-azione.ts::registraFirma`, che il clic
// «Approva» usa. Quella resta, ed è l'unica.
//
// Nessuna dipendenza: si esegue sulla chiave passata, così una prova la misura senza rete.

/**
 * Le chiavi che `/api/controllo` può scrivere. Corte, nominate, e questa lista È il permesso.
 *
 * Sono le quattro che esistono davvero: `pausa` e `tetto_spesa` le manda il Pannello da GovernoAD,
 * `spesa_attuale` la legge la stessa rotta, `autopilota` è l'interruttore letto dall'autopilota.
 * (Alla prima stesura ne avevo messa una quinta, `modello_ai`, che non esiste da nessuna parte:
 * l'ho scritta io e me la sono ritrovata come unica occorrenza nel repo. Una chiave inventata in una
 * lista di permessi è un permesso inventato.)
 */
export const CHIAVI_CONTROLLO = ["pausa", "autopilota", "tetto_spesa", "spesa_attuale"] as const;

/**
 * Le chiavi che NESSUNA rotta generica può scrivere, mai — nemmeno se un giorno qualcuno le
 * aggiungesse alla lista qui sopra per sbaglio. Doppio fondo apposta: la lista si può allargare per
 * distrazione, questa no.
 */
export const MAI_DA_ROTTA_GENERICA = [/^azione:[^:]+:firma$/i, /^firma:/i];

export function riservata(chiave: unknown): boolean {
  const c = String(chiave ?? "").trim();
  return MAI_DA_ROTTA_GENERICA.some((re) => re.test(c));
}

/**
 * Può `/api/controllo` scrivere questa chiave?
 * Fail-closed su tutto ciò che non è nella lista: una chiave sconosciuta non è una chiave innocua,
 * ed è esattamente così che questa rotta è diventata una porta di servizio.
 */
export function scrivibileDaControllo(chiave: unknown): { ok: boolean; motivo: string } {
  const c = String(chiave ?? "").trim();
  if (!c) return { ok: false, motivo: "manca la chiave" };
  if (riservata(c)) {
    return {
      ok: false,
      motivo: `"${c}" è la firma di Nicola: non si scrive da qui. La firma la registra il clic «Approva» (lib/firma-azione.ts), ed è l'unica strada.`,
    };
  }
  if (!(CHIAVI_CONTROLLO as readonly string[]).includes(c)) {
    return {
      ok: false,
      motivo: `"${c}" non è una chiave di controllo. Da qui si scrivono solo: ${CHIAVI_CONTROLLO.join(", ")}.`,
    };
  }
  return { ok: true, motivo: "chiave di controllo ammessa" };
}
