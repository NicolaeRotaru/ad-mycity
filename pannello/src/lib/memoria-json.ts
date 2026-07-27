/**
 * AR-252 / AR-253 — il lettore unico dei JSON di memoria.
 *
 * Il difetto vero non è «un `.map` su una stringa» né «un elemento vuoto nella lista»: è che ogni
 * schermata che legge la memoria si riscrive il parsing a mano. Lo stesso `cantiere-difetti.json`
 * viene letto in QUATTRO punti con quattro implementazioni diverse — due lato server indurite, due
 * lato browser nude. Chi ha corretto il server non sapeva delle altre copie, quindi il bug «torna»
 * a ogni schermata nuova. Stessa storia per `domande_per_nicola`: una riga sopra `errori` è protetto
 * con `Array.isArray`, lui no. Il fix era stato applicato a un campo solo.
 *
 * Qui la difesa si scrive UNA volta e la usano tutti. Nessun import: solo ragionamento sui dati, così
 * un test la può eseguire davvero invece di rileggerla (è lo stesso motivo per cui esistono
 * cervello/giro-esito.sh, pannello/src/lib/serratura.ts e pannello/src/lib/panel-sync-regole.ts).
 *
 * Regola di condotta: queste funzioni NON inventano niente. Non riempiono buchi, non indovinano
 * valori: prendono ciò che c'è e lo riportano alla forma che il Pannello sa disegnare. Se non c'è
 * niente di utilizzabile, tornano una lista vuota — che è la verità, e la Cabina resta in piedi.
 */

/**
 * Una lista di cui ci si può fidare: `[]` se non è un array, e senza i buchi dentro.
 *
 * Serve contro DUE guasti diversi che si presentano uguali (schermo bianco):
 *  - il campo non è un array (assente, `null`, un oggetto, una stringa) → `.filter`/`.map` esplode;
 *  - il campo è un array ma contiene `null` → `x.stato` esplode sul primo elemento vuoto.
 * `|| []` difende solo dal primo. Qui si difende da entrambi.
 */
export function listaSicura<T>(v: unknown): T[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => x != null && x !== false && x !== "") as T[];
}

/**
 * Riporta a lista un campo che il giro a volte scrive come frase singola.
 *
 * Il contratto (cervello/auto-coscienza.md) dice che `domande_per_nicola` è un array di oggetti
 * `{domanda, perche_serve, …}`. Quando il giro devia e ci scrive una frase, il Pannello faceva
 * `a.domande_per_nicola.length` — vero anche per le stringhe, perché le stringhe hanno `.length` —
 * e poi `.map`, che sulle stringhe non esiste. Il guardiano lasciava passare esattamente ciò da cui
 * doveva difendere.
 *
 * `chiaveTesto` è il campo su cui appoggiare la frase quando arriva sciolta (`"domanda"`, `"cosa"`,
 * `"titolo"`…), così il resto del componente non deve sapere da dove viene il dato.
 */
export function listaDaTestoOLista<T = Record<string, unknown>>(v: unknown, chiaveTesto: string): T[] {
  if (typeof v === "string") {
    const t = v.trim();
    return t ? ([{ [chiaveTesto]: t } as unknown as T]) : [];
  }
  return listaSicura<T>(v);
}

/** Le liste di sole frasi (`punti_ciechi`, `principi`, `preferenze_nicola`): frase sciolta → lista di una. */
export function listaDiTesti(v: unknown): string[] {
  if (typeof v === "string") {
    const t = v.trim();
    return t ? [t] : [];
  }
  return listaSicura<unknown>(v).map((x) => (typeof x === "string" ? x : String((x as any)?.testo ?? x)));
}

/**
 * Normalizza in blocco i campi-lista di un oggetto di memoria, sul posto.
 *
 * Le route sanificano già voto e trend alla fonte; qui si aggiungono le liste, così ogni consumatore
 * — quelli di oggi e quelli che verranno — riceve la forma giusta senza doverselo ricordare.
 * `mappa` = { nomeCampo: chiaveSuCuiAppoggiareLaFrase }.
 */
export function sanificaListe(o: any, mappa: Record<string, string>): void {
  if (!o || typeof o !== "object") return;
  for (const [campo, chiave] of Object.entries(mappa)) {
    if (!(campo in o)) continue;
    o[campo] = chiave ? listaDaTestoOLista(o[campo], chiave) : listaDiTesti(o[campo]);
  }
}
