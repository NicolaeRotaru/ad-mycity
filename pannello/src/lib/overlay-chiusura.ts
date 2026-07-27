/**
 * AR-218 — le regole per chiudere ciò che è aperto sopra la Cabina.
 *
 * Il difetto: il Worker a schermo intero non si chiudeva più. Nessuna delle quattro vie d'uscita
 * funzionava — la X non era renderizzata in modalità piena, il velo cliccabile era coperto al 100%
 * dal pannello, il tasto Esc non esisteva in tutto `pannello/src`, e il gesto «indietro» del telefono
 * non toccava gli overlay perché aprirli non timbrava alcuna voce di cronologia.
 *
 * La radice non è nessuno di quei quattro: è che «quale pannello è aperto» non era modellato come
 * stato di NAVIGAZIONE. Le aree hanno un contratto di cronologia curato (pushState/popstate, con i
 * commenti di tre bug già risolti); gli overlay a schermo intero sono nati dopo e sono rimasti fuori
 * da quel contratto. Sul telefono il gesto indietro È il tasto «chiudi» universale.
 *
 * Qui stanno le due decisioni, come funzioni pure — fuori da page.tsx, che con 3.500 righe e React
 * dentro non è eseguibile da un test.
 */

/** Cosa può stare aperto sopra la Cabina, dal più «in cima» al più in fondo. */
export type StatoOverlay = {
  workerConv?: boolean; // il cassetto conversazioni, dentro il Worker
  worker?: boolean; // il Worker (finestra o schermo intero)
  menu?: boolean; // il menù laterale, su mobile
};

export type DaChiudere = "workerConv" | "worker" | "menu" | null;

/**
 * Cosa chiude Esc: UNA cosa sola, quella più in cima.
 *
 * Chiudere tutto insieme sarebbe sbagliato quanto non chiudere niente: se il cassetto conversazioni
 * è aperto dentro il Worker, Esc deve richiudere il cassetto e lasciare il Worker — altrimenti si
 * perde il posto dov'era. Il secondo Esc chiude il Worker. È l'ordine che si aspetta chiunque abbia
 * usato un browser.
 */
export function overlayInCima(s: StatoOverlay): DaChiudere {
  if (!s) return null;
  if (s.workerConv) return "workerConv";
  if (s.worker) return "worker";
  if (s.menu) return "menu";
  return null;
}

/** Solo Escape chiude. (`Esc` è il nome che manda ancora qualche browser vecchio e qualche tastiera.) */
export function eTastoChiudi(key: unknown): boolean {
  return key === "Escape" || key === "Esc";
}

/**
 * Il gesto «indietro» ha riportato indietro l'overlay?
 *
 * Aprire il Worker timbra una voce con `overlay: "worker"`. Quando il gesto indietro riporta a una
 * voce che NON ha quel marcatore, significa che si sta uscendo dal Worker: va chiuso PRIMA di
 * applicare la vista, altrimenti resta lì sopra a coprire la pagina a cui si è appena tornati.
 *
 * `null`/`undefined` (voce senza stato, o cronologia di un'altra pagina) contano come «niente
 * overlay»: nel dubbio si chiude, che è la direzione sicura — restare bloccati è il difetto.
 */
export function deveChiudereOverlay(st: unknown): boolean {
  if (!st || typeof st !== "object") return true;
  return (st as { overlay?: unknown }).overlay !== "worker";
}
