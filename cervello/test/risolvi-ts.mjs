// 🔗 RISOLUTORE per i test del Pannello (AR-156). Hook di risoluzione moduli per `node --test`.
//
// Il problema. Il Pannello è compilato da un bundler, e il suo tsconfig usa
// `moduleResolution: "bundler"`: lì `import { x } from "./chat-thread-merge"` è legittimo, il
// bundler l'estensione la indovina. Node ESM no: pretende il percorso esatto. Risultato:
// `lavori-gruppo.annulla.test.mts` non PARTIVA — falliva all'import, prima di eseguire una sola
// asserzione. Non è mai partito dal giorno in cui è stato scritto.
//
// Perché un hook e non l'estensione nel codice. Aggiungere `.ts` agli import di produzione
// funziona per Node ma rompe `tsc` (vuole `allowImportingTsExtensions`), obbliga a cambiare il
// tsconfig, mette a rischio la build di Next e va rifatto per OGNI import della catena — oggi
// `chat-thread-merge`, domani `obsidian`, `format`, e via così. Il codice del Pannello finirebbe
// piegato alla comodità dei test.
//
// Questo hook fa il contrario: insegna a NODE la regola che il bundler già applica. Un file solo,
// zero righe di produzione toccate, e vale per ogni test presente e futuro.
//
// Cosa fa, e solo quello: se un import RELATIVO non si risolve, riprova con .ts / .tsx / .mts e
// con /index.ts. Se non lo trova comunque, rilancia l'errore ORIGINALE — non inventa moduli e non
// maschera un import davvero sbagliato.
//
// Uso (lo fa già cervello/test-pannello.mjs):
//   node --import ./cervello/test/hook-ts.mjs --test pannello/src/lib/*.test.mts

const ESTENSIONI = [".ts", ".tsx", ".mts", "/index.ts", "/index.tsx"];

export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (errore) {
    // Solo il caso preciso: import relativo che Node non trova. Tutto il resto passa oltre.
    const suo = errore && (errore.code === "ERR_MODULE_NOT_FOUND" || errore.code === "ERR_UNSUPPORTED_DIR_IMPORT");
    if (!suo || !specifier.startsWith(".")) throw errore;
    // Se l'estensione c'è già, non è questo il problema: non insistere.
    if (/\.(m?[jt]sx?|json|node)$/.test(specifier)) throw errore;
    for (const ext of ESTENSIONI) {
      try {
        return await next(specifier + ext, context);
      } catch {
        /* provo la prossima */
      }
    }
    throw errore; // l'errore VERO, non uno mio: se l'import è sbagliato deve dirlo com'è
  }
}
