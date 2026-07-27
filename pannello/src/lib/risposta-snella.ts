// AR-247 / AR-254 — il confine fra «file di memoria della macchina» e «risposta per il telefono».
//
// Vive qui e non dentro la route per la stessa ragione di sempre in questo repo: la logica che DECIDE
// qualcosa deve stare dove un test può eseguirla. Dentro `app/api/**/route.ts` è incastrata insieme a
// `next/server`, e un test finirebbe per controllare la forma del codice invece dell'effetto — che è
// esattamente come AR-247 è sopravvissuto finora (la sua prova era un pattern in un file).
//
// Il difetto: la route rimandava gli oggetti INTERI. `apprendimento.json` pesa 1.034.394 byte, e la
// scheda si ricarica ogni 30 secondi — 1 MB in rete a ogni tick, anche in 4G. Le stesse cifre spiegano
// AR-254: superato il tetto di lettura di 1 MiB (1.048.576) arriva `null` e la scheda Apprendimento
// resta vuota PER SEMPRE.
//
// Misurato il 28/7 sul file vero: 211 chiavi di servizio su 217, e le tre liste crescono senza tetto —
// lezioni 476 (465 KB di soli testi), preferenze_nicola 379 (173 KB), principi 86 (115 KB).

/** Quanto manda la route, per lista. Tetti sul CONTEGGIO, non finestre temporali — vedi sotto. */
export const MAX_LEZIONI = 60;
export const MAX_PRINCIPI = 40;
export const MAX_PREFERENZE = 40;

/** Le ultime N voci, con il conto di quante restano fuori. Il totale si dichiara sempre. */
export function ultime<T>(x: unknown, max: number): { voci: T[]; totali: number; troncate: boolean } {
  const l = Array.isArray(x) ? (x.filter(Boolean) as T[]) : [];
  return { voci: l.slice(-max), totali: l.length, troncate: l.length > max };
}

/**
 * La risposta per il telefono: solo i campi che la scheda dichiara di leggere, con le liste limitate.
 *
 * Perché un tetto sul conteggio e non una finestra temporale — la prima versione tagliava «gli ultimi
 * 30 giorni», e sembrava ragionevole. Misurato: l'archivio ha in tutto ~30 giorni di vita (472 lezioni
 * su 476 «nate» in quella finestra), quindi non tagliava NIENTE. Una finestra su un volume illimitato
 * non è un limite. E prima ancora cercavo il campo `data`/`creata` — nomi plausibili che nel file non
 * esistono, si chiama `nato`: funzionava solo grazie al ripiego, cioè dava un numero giusto per il
 * motivo sbagliato, e sarebbe passata così.
 */
export function apprendimentoSnello(a: any): any {
  if (!a || typeof a !== "object") return a;
  // Si tagliano TUTTE e tre le liste. Limitare solo le lezioni avrebbe spostato il problema invece di
  // risolverlo: è «il fix applicato a una copia sola», in versione dati.
  const lezioni = ultime<any>(a.lezioni, MAX_LEZIONI);
  const principi = ultime<any>(a.principi, MAX_PRINCIPI);
  const preferenze = ultime<any>(a.preferenze_nicola, MAX_PREFERENZE);
  return {
    data: a.data ?? null,
    aggiornato: a.aggiornato ?? null,
    meta: a.meta ?? null,
    lezioni: lezioni.voci,
    principi: principi.voci,
    preferenze_nicola: preferenze.voci,
    // Il troncamento si DICHIARA. Una lista tagliata in silenzio è la stessa bugia di una lista vuota
    // per un errore ingoiato: la schermata direbbe «ecco tutto» mostrandone una parte.
    troncato: {
      lezioni: { mostrate: lezioni.voci.length, totali: lezioni.totali, troncate: lezioni.troncate },
      principi: { mostrate: principi.voci.length, totali: principi.totali, troncate: principi.troncate },
      preferenze_nicola: { mostrate: preferenze.voci.length, totali: preferenze.totali, troncate: preferenze.troncate },
    },
  };
}
