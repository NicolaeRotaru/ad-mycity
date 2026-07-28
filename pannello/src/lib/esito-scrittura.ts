// 🧾 ESITO DI UNA SCRITTURA — «fatto» si dice solo quando qualcuno l'ha confermato.
//
// LA MALATTIA (lotto 29). Cinque difetti diversi, una forma sola: si esegue una scrittura, non si
// guarda com'è andata, e si risponde/disegna come se fosse andata bene.
//   · AR-230 — rifiuti un'azione: la route fa `setImpostazione` + `revocaFirma` e risponde SEMPRE
//              `ok:true`. Se Supabase è giù, la card dice «rifiutata» e al refresh torna da decidere,
//              con la firma ancora addosso.
//   · AR-231 — decidi sull'ordine da 19,05 €: si salva la decisione, si accoda il lavoro e non si
//              guarda se il lavoro è nato. Decisione registrata, cervello mai partito, e il dedup
//              impedisce di riprovare.
//   · AR-238 — rispondi a una domanda dell'AD: `await setImpostazione(...)` senza leggere il
//              booleano, `ok:true` comunque; trenta secondi dopo il ripasso ti richiede la domanda.
//   · AR-239 — spunti la checklist: `await fetch(...)` e il corpo non si legge. La route serve
//              `{ok:false}` con HTTP 200, quindi nemmeno il `catch` scatta.
//   · AR-264 — esci dalla demo: `await fetch(...)` poi `window.location.reload()` senza guardare
//              `res.ok`. Un 500 passa per successo e l'etichetta della fonte dei numeri mente.
//
// LA RADICE COMUNE: `await` sembra una conferma. Non lo è — è solo la fine dell'attesa. La conferma
// è il valore che torna, e nessuno lo guardava. Curarlo dentro i cinque punti avrebbe lasciato viva
// la malattia per il sesto: qui la regola diventa una funzione, e chi la salta si vede nel diff.
//
// 🟢 Modulo puro: nessun import, nessun window, nessun fetch. Prova: cervello/test/scrittura-non-confermata.test.mjs

/** Una scrittura tentata: il nome serve a dire a Nicola QUALE pezzo non è passato. */
export type Salvataggio = { nome: string; ok: boolean };

export type EsitoScritture = {
  /** true solo se TUTTE le scritture hanno confermato. */
  ok: boolean;
  /** I nomi delle scritture fallite, in ordine. */
  fallite: string[];
  /** Messaggio pronto per Nicola (vuoto se ok). */
  errore: string;
};

/**
 * Riassume l'esito di più scritture che devono riuscire INSIEME.
 *
 * Perché "insieme": in `azioni-pronte` il rifiuto è tre scritture (stato, nota, revoca della firma).
 * Se ne passa una sola, lo stato sul server è a metà — e mezza verità mostrata come intera è
 * esattamente il difetto. Una sola fallita ⇒ l'intera operazione è da riprovare.
 *
 * ⚠️ Va chiamata con scritture GIÀ eseguite (array di booleani raccolti), non con promesse: il
 * cortocircuito di `&&` altrimenti salta la seconda scrittura e il difetto si sposta.
 */
export function esitoScritture(salvataggi: Salvataggio[]): EsitoScritture {
  const fallite = salvataggi.filter((s) => !s.ok).map((s) => s.nome);
  if (fallite.length === 0) return { ok: true, fallite: [], errore: "" };
  return {
    ok: false,
    fallite,
    errore: `Non salvato (${fallite.join(", ")}) — riprova.`,
  };
}

/** Lo status HTTP da usare quando una scrittura non ha confermato: 503, non 200. */
export const STATUS_SCRITTURA_FALLITA = 503;

/**
 * Il corpo di una risposta conferma la scrittura?
 *
 * Regola: `ok:false` è un NO anche con HTTP 200 (è il caso AR-239: `/api/memoria/todo` risponde
 * `{ok:false}` con 200 quando la memoria non è collegata). Un corpo assente o illeggibile NON è una
 * conferma: chi scrive deve dire di aver scritto.
 */
export function corpoConferma(corpo: unknown): boolean {
  if (corpo === null || corpo === undefined) return false;
  if (typeof corpo !== "object") return false;
  const o = corpo as Record<string, unknown>;
  if (o.ok === false) return false;
  if (o.ok === true) return true;
  // Nessun campo `ok`: si accetta solo se la risposta porta comunque un contenuto (le route
  // storiche che rispondono {stato: "..."}). Un oggetto vuoto resta un non-detto.
  return Object.keys(o).length > 0;
}

/**
 * La scrittura è confermata? Vuole ENTRAMBI: il trasporto (`res.ok`) e il contenuto (`ok !== false`).
 *
 * `res` accetta qualsiasi cosa abbia `ok`/`status` — la `Response` di fetch, o un finto nei test.
 * `res` nullo (rete caduta prima della risposta) = non confermata.
 */
export function scritturaConfermata(
  res: { ok?: boolean; status?: number } | null | undefined,
  corpo?: unknown,
): boolean {
  if (!res) return false;
  if (res.ok === false) return false;
  if (typeof res.status === "number" && (res.status < 200 || res.status >= 300)) return false;
  // Il corpo si guarda solo se è stato passato: chi non lo legge lo dichiara omettendolo.
  if (corpo !== undefined) return corpoConferma(corpo);
  return true;
}
