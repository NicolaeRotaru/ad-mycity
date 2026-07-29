// 🫀 LO STATO VIVO NON SI SOVRASCRIVE — un ripasso periodico non è più aggiornato di te.
//
// LA MALATTIA (lotto 29). Cinque difetti, una forma sola: un aggiornamento che arriva da fuori
// (poller, evento di un'altra superficie, snapshot congelato) SOSTITUISCE lo stato che sta vivendo
// sotto gli occhi di Nicola, invece di fondersi con lui.
//   · AR-266 — apri «Parla con questa casella» e la chat che avevi aperto sparisce: chi ascolta il
//              bus accetta qualsiasi payload, anche di un thread che non c'entra.
//   · AR-267 — mentre l'AD scrive, la risposta in arrivo si cancella ogni 8s: il merge del poller
//              passa lo stato vivo dentro `pulisci()`, che scarta proprio le bolle pending.
//   · AR-268 — la casella risalva uno snapshot congelato all'invio e accorcia il thread.
//   · AR-269 — l'Archivio semina la chat una volta sola e resta alla foto di quando l'hai aperta.
//   · AR-238 — le risposte alle domande dell'AD: `setRisposte(x.risposte)` sostituisce l'intera
//              mappa, quindi una risposta appena data sparisce al primo ripasso.
//
// LA RADICE COMUNE: manca la distinzione fra **dato a riposo** (quello del server, che si può
// rileggere) e **stato transitorio** (la bolla in streaming, la risposta appena inviata, la chat
// aperta adesso) — che esiste solo qui e che nessuna rilettura può ricostruire. Le funzioni scritte
// per il primo venivano usate anche sul secondo.
//
// 🟢 Modulo puro: nessun import, nessun window, nessun React. Prova: cervello/test/stato-vivo-calpestato.test.mjs

/** Il minimo che serve per riconoscere una bolla transitoria. */
export type MsgTransitorio = { pending?: boolean; prompt?: boolean };

/** Una bolla è VIVA se esiste solo qui: la risposta in streaming o la scheda del prompt generato. */
export function eVivo(m: MsgTransitorio): boolean {
  return Boolean(m?.pending) || Boolean(m?.prompt);
}

/** Separa ciò che il server può conoscere da ciò che vive solo a schermo. */
export function separaVivi<T extends MsgTransitorio>(list: T[]): { stabili: T[]; vivi: T[] } {
  const stabili: T[] = [];
  const vivi: T[] = [];
  for (const m of list || []) (eVivo(m) ? vivi : stabili).push(m);
  return { stabili, vivi };
}

/**
 * Fonde il thread del server con quello a schermo SENZA perdere le bolle vive (AR-267).
 *
 * `fondi` è la fusione dei soli dati a riposo (oggi `mergeThreadMsgs`): riceve la parte stabile,
 * mai i transitori. Le bolle vive tornano in coda, nell'ordine in cui stavano.
 *
 * Il caso che ha rotto: `mergeThreadMsgs` comincia con `pulisci()` — `filter(m => !m.pending &&
 * !m.prompt)` — perché è nata per fondere due thread SALVATI, dove pending/prompt sono rumore.
 * Passandole lo stato vivo, il risultato non conteneva mai la bolla in corso: la guardia
 * `JSON.stringify` vedeva una differenza e `setMessages` la cancellava. A catena, «Annulla invio»
 * non trovava più nessuna bolla pending e diventava inerte proprio mentre serviva.
 */
export function fondiConservandoVivi<T extends MsgTransitorio>(
  correnti: T[],
  dalServer: T[],
  fondi: (a: T[], b: T[]) => T[],
): T[] {
  const { stabili, vivi } = separaVivi(correnti || []);
  const fusi = fondi(stabili, dalServer || []);
  return vivi.length ? [...fusi, ...vivi] : fusi;
}

/**
 * Questo aggiornamento riguarda la conversazione che sto mostrando? (AR-266)
 *
 * Il bus `chat-unificata` serve ad allineare superfici che mostrano LA STESSA chat. Il lato che
 * pubblica è filtrato; il lato che ascolta non lo era: bastava aprire una casella con uno storico
 * suo perché l'Assistente adottasse quel thread e buttasse via quello aperto.
 *
 *   · nessuna chat aperta qui           → accetto (non ho niente da perdere)
 *   · stesso id                         → accetto (è proprio la mia, allineiamoci)
 *   · id diverso, o evento senza id     → RIFIUTO (è un'altra conversazione)
 */
export function aggiornamentoPertinente(
  convIdCorrente: string | null | undefined,
  convIdEvento: string | null | undefined,
): boolean {
  const mio = convIdCorrente || "";
  const suo = convIdEvento || "";
  if (!mio) return true;
  if (!suo) return false;
  return mio === suo;
}

/**
 * Fonde una mappa locale (quello che Nicola ha appena fatto) con quella del server (AR-238, AR-239).
 *
 * Le voci locali VINCONO finché il server non concorda: è la stessa difesa che l'area Azioni ha già
 * (`decisiLocaliRef`, «bug #7: merge, non overwrite») e che alle risposte dell'auto-analisi non era
 * mai stata portata.
 *
 * `uguali` confronta due valori: quando il server riporta lo stesso valore, la voce locale ha finito
 * il suo lavoro e va dimenticata — altrimenti un errore di scrittura resterebbe nascosto per sempre
 * dietro la sua stessa copia ottimistica.
 */
export function fondiLocaliSuServer<V>(
  dalServer: Record<string, V>,
  locali: Map<string, V>,
  uguali: (a: V, b: V) => boolean = (a, b) => JSON.stringify(a) === JSON.stringify(b),
): { fusa: Record<string, V>; daDimenticare: string[] } {
  const fusa: Record<string, V> = { ...(dalServer || {}) };
  const daDimenticare: string[] = [];
  for (const [k, v] of locali || new Map<string, V>()) {
    const suo = fusa[k];
    if (suo !== undefined && uguali(suo, v)) {
      daDimenticare.push(k);
      continue;
    }
    fusa[k] = v;
  }
  return { fusa, daDimenticare };
}
