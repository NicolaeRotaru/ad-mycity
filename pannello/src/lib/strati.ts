/**
 * AR-222 / AR-242 / AR-243 — gli strati che si aprono SOPRA la Cabina, dentro il contratto di
 * navigazione invece che fuori.
 *
 * I tre difetti hanno titoli diversi (il menù laterale, il documento nell'Archivio, i pannelli
 * sovrapposti) ma sono lo stesso: ogni strato è un booleano in `useState` e nient'altro. Aprirlo non
 * timbra nessuna voce di cronologia, quindi per il browser non è successo niente; il gestore
 * `popstate` non lo conosce e non lo chiude; e il gesto indietro — che sul telefono È il tasto
 * «chiudi» universale — invece di richiudere lo strato cambia l'AREA sotto, di nascosto. Ti ritrovi
 * altrove con il pannello ancora aperto sopra.
 *
 * La radice, già scritta in AR-240 e valida per tutti: «quale strato è aperto» è uno stato di
 * NAVIGAZIONE (occupa lo schermo, l'utente si aspetta di tornare indietro da lì) ma è stato modellato
 * come stato di componente. Il contratto di navigazione del Pannello copre aree e sotto-schede e si è
 * fermato lì.
 *
 * Perché una pila condivisa e non cinque toppe. Il 27/7 la stessa forma di errore — «il fix applicato
 * a una copia sola» — è comparsa quattro volte in una sola sessione: due su `page.tsx`, una sulle
 * quattro letture del cantiere, una nel guardiano che dovevo consegnare. Cinque strati riparati a mano
 * sono cinque posti dove il sesto nascerà scoperto. Qui la regola si scrive una volta e ogni strato
 * nuovo la eredita registrandosi.
 *
 * Nessun import: solo ragionamento sui dati, così i test la eseguono davvero.
 */

export type Strato = { nome: string; chiudi: () => void };

/** L'ordine è quello di apertura: l'ultimo entrato è quello in cima, ed è il primo a uscire. */
export function cimaDellaPila(pila: Strato[]): Strato | null {
  const p = Array.isArray(pila) ? pila.filter(Boolean) : [];
  return p.length ? p[p.length - 1] : null;
}

/**
 * Toglie UN'occorrenza di `nome`, la più recente.
 *
 * «La più recente» non è un dettaglio: lo stesso strato può essere aperto due volte (riapri il
 * cassetto conversazioni dopo averlo chiuso e riaperto in fretta) e togliendo la prima si lascerebbe
 * in pila un fantasma che intercetta un indietro senza chiudere niente.
 */
export function senzaStrato(pila: Strato[], nome: string): Strato[] {
  const p = Array.isArray(pila) ? pila.filter(Boolean) : [];
  for (let i = p.length - 1; i >= 0; i--) {
    if (p[i].nome === nome) return [...p.slice(0, i), ...p.slice(i + 1)];
  }
  return p;
}

/** Aggiunge uno strato in cima, senza duplicarlo se è già lui a essere in cima. */
export function conStrato(pila: Strato[], strato: Strato): Strato[] {
  const p = Array.isArray(pila) ? pila.filter(Boolean) : [];
  if (!strato?.nome) return p;
  const cima = cimaDellaPila(p);
  if (cima && cima.nome === strato.nome) return [...p.slice(0, -1), strato]; // stesso strato: aggiorna il `chiudi`
  return [...p, strato];
}

/**
 * Il gesto indietro ha lasciato uno strato aperto che va chiuso?
 *
 * Aprire uno strato timbra una voce con `strato: <nome>`. Tornando a una voce che non porta più QUEL
 * nome, significa che si sta uscendo da lui. `null`/voce senza stato = «nessuno strato»: si chiude,
 * che è la direzione sicura — restare bloccati sotto un pannello è il difetto.
 *
 * Nota: non si confronta «c'è un marcatore qualsiasi» ma «c'è ANCORA il marcatore di chi è in cima».
 * Con due strati impilati (menù sopra il Worker) un solo indietro deve chiudere il menù e lasciare il
 * Worker, e il controllo generico non basterebbe a distinguerli.
 */
export function stratoDaChiudere(statoStoria: unknown, cima: Strato | null): Strato | null {
  if (!cima) return null;
  const st = statoStoria && typeof statoStoria === "object" ? (statoStoria as { strato?: unknown }) : null;
  return st?.strato === cima.nome ? null : cima;
}

/**
 * La voce di cronologia da timbrare quando uno strato si apre.
 *
 * Si FONDE con lo stato esistente e non lo sostituisce: Next tiene i suoi internals di routing dentro
 * `history.state` (`__NA`, `__PRIVATE_NEXTJS_INTERNALS_TREE`) e cancellarli fa sì che al primo
 * indietro il router non riconosca la voce e ricarichi la pagina. È il bug già documentato in
 * `lib/nav.ts`: qui si ripete la cautela invece di reimparare a spese di Nicola.
 *
 * Torna `null` se la voce corrente porta già questo strato: timbrare due volte impilerebbe cronologia
 * e servirebbero due indietro per chiudere una cosa sola.
 */
export function voceDaTimbrare(statoCorrente: unknown, nome: string): Record<string, unknown> | null {
  const st = statoCorrente && typeof statoCorrente === "object" ? (statoCorrente as Record<string, unknown>) : {};
  if (st.strato === nome) return null;
  return { ...st, strato: nome };
}
