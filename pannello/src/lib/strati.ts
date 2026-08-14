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
 * AR-403 / AR-606 — il verso mancante del contratto: «chiudi → indietro».
 *
 * `stratoDaChiudere` copre solo il verso «indietro → chiudi». Chiudendo col dito (X, velo, Esc) lo
 * strato usciva dalla pila e basta: la voce timbrata all'apertura restava lì, senza corrispondere più
 * a niente di visibile. Da lì i due sintomi che Nicola vedeva: il primo indietro era un colpo a vuoto
 * (consumava la voce fantasma senza cambiare nulla a video) e, peggio, il marcatore stantio veniva
 * copiato in ogni voce successiva — a quel punto riaprire lo strato non timbrava più niente
 * (`voceDaTimbrare` lo vedeva già presente) e l'indietro non lo chiudeva più (`stratoDaChiudere` lo
 * vedeva ancora combaciante): tornava esattamente il difetto che il contratto dichiara risolto, cioè
 * l'area che cambia sotto un pannello rimasto aperto sopra.
 *
 * Vero solo quando la voce corrente porta ANCORA il marcatore di questo strato, e lo strato non è
 * tornato in pila nel frattempo. Le tre volte in cui deve dire di no valgono quanto la volta in cui
 * dice di sì:
 *  · chiuso DAL gesto indietro → la voce corrente non porta più il marcatore → un altro `back()`
 *    salterebbe due passi invece di uno;
 *  · la cronologia è già andata avanti (dal menù si tocca un'altra area: la voce nuova è di
 *    navigazione e non porta marcatori) → il `back()` riporterebbe all'area di prima, cioè il
 *    contrario di quello che è stato appena chiesto;
 *  · riaperto nello stesso istante (chiudi e riapri di scatto) → non c'è niente da ritirare.
 */
export function deveTornareIndietro(statoStoria: unknown, nome: string, pila: Strato[] = []): boolean {
  if (!nome) return false;
  const p = Array.isArray(pila) ? pila.filter(Boolean) : [];
  if (p.some((s) => s?.nome === nome)) return false; // riaperto nel frattempo: la voce serve ancora
  const st = statoStoria && typeof statoStoria === "object" ? (statoStoria as { strato?: unknown }) : null;
  return st?.strato === nome;
}

/**
 * I campi di `history.state` che dicono «c'è qualcosa aperto SOPRA la Cabina»: il marcatore degli
 * strati (`strato`, questo file) e quello del Worker (`overlay`, lib/overlay-chiusura.ts).
 */
export const MARCATORI_DI_STRATO = ["strato", "overlay"] as const;

/**
 * AR-606 — la voce di cronologia da timbrare per una NAVIGAZIONE (cambio area, cambio scheda, voce
 * iniziale al caricamento).
 *
 * Fonde con lo stato esistente per non cancellare gli internals di Next (`__NA`,
 * `__PRIVATE_NEXTJS_INTERNALS_TREE`: cancellarli fa ricaricare la pagina al primo indietro), ma
 * SPOGLIA i marcatori di strato. Il merge cieco `{...history.state, vista}` era la seconda metà del
 * difetto: portava il marcatore di un pannello ormai chiuso dentro voci nuove che con quel pannello
 * non c'entrano niente — e `history.state` sopravvive anche al ricaricamento della pagina, quindi il
 * fantasma tornava pure dopo un F5.
 *
 * `campi` viene applicato DOPO lo spoglio: chi vuole timbrare davvero un marcatore (l'apertura del
 * Worker) lo passa lì ed è servito.
 */
export function voceDiNavigazione(statoCorrente: unknown, campi: Record<string, unknown> = {}): Record<string, unknown> {
  const st = statoCorrente && typeof statoCorrente === "object" ? { ...(statoCorrente as Record<string, unknown>) } : {};
  for (const m of MARCATORI_DI_STRATO) delete st[m];
  return { ...st, ...(campi || {}) };
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-402 — IL CENSIMENTO: «chiuso» non può voler dire «scritto»
// ─────────────────────────────────────────────────────────────────────────────
//
// AR-243 risultava chiuso con `strati.test.mjs` verde, e nel frattempo due riquadri a schermo intero
// — la fotocamera dentro la chat e la lettera dell'AD — restavano governati da un booleano solo,
// fuori da questa pila: col dito indietro cambiavano l'AREA sotto invece di chiudersi. La prova
// cercava l'ESISTENZA della libreria, non l'INSTALLAZIONE del comportamento, e su un pattern
// condiviso quelle due cose non coincidono mai da sole.
//
// La regola che ne esce, valida per ogni pattern condiviso: quando un difetto nomina N punti da
// convertire, la prova di chiusura deve contare N — non 1. Questa funzione conta.

/** Sopra questo livello un riquadro copre la Cabina: è uno strato, e deve stare nella pila. */
export const Z_DI_STRATO = 40;

/**
 * I riquadri a schermo intero che NON sono registrati nella pila degli strati.
 *
 * Cerca ogni `fixed inset-0` con uno `z-` alto e guarda se nel suo file compare `useStrato`. Il
 * controllo è per file e non per riga perché un file può governare più strati con un hook per
 * ciascuno (è il caso dell'Archivio): quello che non deve MAI succedere è un riquadro a schermo
 * intero in un file che la pila non la conosce affatto.
 */
export function stratiFuoriContratto(files: { percorso: string; sorgente: string }[]): string[] {
  const fuori: string[] = [];
  for (const f of files || []) {
    const src = String(f?.sorgente || "");
    if (/useStrato\s*\(/.test(src)) continue;
    const righe = src.split("\n");
    const scoperto = righe.some((r) => {
      if (!/fixed\s+inset-0/.test(r)) return false;
      // Niente `\b` in coda: dopo `z-[100]` c'è una parentesi quadra, che un confine di parola non
      // vede — ed è così che un riquadro `z-[100]` sfuggiva proprio al censimento scritto per lui.
      const z = r.match(/\bz-(?:\[(\d+)\]|(\d+))(?!\d)/);
      if (!z) return false;
      return Number(z[1] ?? z[2]) >= Z_DI_STRATO;
    });
    if (scoperto) fuori.push(f.percorso);
  }
  return fuori;
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
