#!/usr/bin/env node
// 🏷️ LE PAROLE CHE NON AVEVANO UN PADRONE — «atto vero» e «quanti difetti ci sono».
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE QUESTO FILE CURA: «una parola senza padrone»
// ─────────────────────────────────────────────────────────────────────────────
// Non è un totale che invecchia (quella è AR-456, ed è un'altra cosa): è che **la parola non ha un
// proprietario**, quindi ogni pezzo di codice che ha avuto bisogno della risposta se l'è riscritta.
// Due misure dello stesso lotto:
//
//   · «quanti difetti aperti» — la rotta contava `stato === "aperto"`, il componente disegnava
//     `stato !== "chiuso"`, e la STESSA pagina mostrava **225 in una frase e 281 in un badge**,
//     a due riquadri di distanza (AR-670). In mezzo, 56 schede in un terzo stato — `da-riverificare`
//     — che non entravano in nessuno dei due totali (AR-684): un buco dove le cose spariscono.
//   · «quali lavori sono azioni vere» — la lista sta in **cinque posti con quattro nomi diversi**,
//     e due file portano lo stesso nome con contenuti diversi (AR-659). È la domanda da cui dipende
//     la difesa contro il doppio invio: un tipo fuori lista torna riaccodabile da ogni porta.
//
// Finché restano due definizioni, il prossimo chiamante sbaglierà di nuovo in buona fede. Qui c'è
// UNA casa per ognuna delle due parole, e la copia per la shell si **genera** da questa (`--bash`):
// una copia scritta a mano sarebbe la malattia che stiamo curando, spostata di un file.
//
// 🟢 Modulo PURO: nessun file, nessuna rete, nessun `process.env`, nessun orologio. L'unico pezzo che
// tocca il mondo è la riga di comando in fondo, che stampa e basta.
//
// Prova comportamentale: node cervello/test/parola-senza-padrone.test.mjs

// ═══════════════════════════════════════════════════════════════════════════
// ① «ATTO VERO» — quali lavori toccano il mondo fuori (AR-659)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * I tipi di lavoro che toccano il mondo reale: soldi, email, invii. **Mai riaccodabili da soli.**
 *
 * Una volta sola, qui. Oggi la stessa lista vive anche in `sentinella-lavori.mjs` (TIPI_AZIONE),
 * `pulisci-coda.mjs` (TIPI_PROTETTI), `pannello/src/lib/recupero-lavoro.ts` (TIPI_AZIONE_REALE) e
 * in due `case` di bash (`worker.sh`, `lib-recupero.sh`): quelle cinque copie non possono più
 * divergere in silenzio perché `cervello/test/parola-senza-padrone.test.mjs` le confronta TUTTE con
 * questa. Il giorno che una lista cambia senza cambiare questa, il test diventa rosso.
 */
export const ATTI_VERI = Object.freeze(["esegui-azione", "proposta"]);

/**
 * ⚠️ NON è la stessa domanda, e il nome uguale è ciò che rendeva la differenza invisibile.
 *
 * `retry-policy.mjs` chiama `TIPI_AZIONE_REALE` una lista di UN elemento solo, perché lì si chiede
 * «quale tipo AZIONA davvero le mani», non «quale tipo non si può riaccodare». Due domande diverse
 * con lo stesso nome sono peggio di due liste diverse: chi legge crede di aver capito.
 */
export const TIPI_CON_LE_MANI = Object.freeze(["esegui-azione"]);

/** Il tipo dichiarato da un lavoro, comunque arrivi: una stringa nuda o l'oggetto intero. */
function tipoDi(lavoro) {
  if (typeof lavoro === "string") return lavoro.trim();
  return String(lavoro?.tipo ?? "").trim();
}

/** Questo lavoro tocca il mondo fuori? La porta unica: chi protegge, chi pulisce e chi recupera. */
export function eUnAttoVero(lavoro) {
  return ATTI_VERI.includes(tipoDi(lavoro));
}

/** Questo tipo aziona davvero le mani? (domanda di `retry-policy`, tenuta separata apposta) */
export function haLeMani(lavoro) {
  return TIPI_CON_LE_MANI.includes(tipoDi(lavoro));
}

/**
 * LA COPIA PER LA SHELL, GENERATA DA QUI.
 *
 * `worker.sh` e `lib-recupero.sh` girano in bash e non possono importare un modulo. La strada già
 * battuta in casa (`lib-recupero.sh`) è stata **ricopiare a mano** la regola e tenerla allineata con
 * un test: funziona, ma resta una seconda scrittura della stessa cosa. Qui il file bash non si
 * scrive: si stampa da questa lista, e il test pretende che quello su disco sia identico a quello
 * che questa funzione produce **oggi**. Cambiare `ATTI_VERI` e non rigenerare = rosso.
 *
 * Rigenerare: `node cervello/atti-veri.mjs --bash > cervello/atti-veri.sh`
 */
export function shAttiVeri(lista = ATTI_VERI) {
  const elenco = lista.join(" ");
  return `#!/usr/bin/env bash
# 🏷️ GENERATO DA cervello/atti-veri.mjs — NON modificare a mano.
# Rigenera con:  node cervello/atti-veri.mjs --bash > cervello/atti-veri.sh
#
# Quali lavori toccano il mondo reale (soldi, email, invii): non si riaccodano MAI da soli.
# La casa della lista è il modulo; questo file è la sua faccia per la shell.
ATTI_VERI="${elenco}"

# Uso:  if _e_un_atto_vero "$tipo"; then ... ; fi     (0 = sì, 1 = no)
_e_un_atto_vero() {
  case " $ATTI_VERI " in
    *" \${1:-} "*) return 0 ;;
  esac
  return 1
}
`;
}

// ═══════════════════════════════════════════════════════════════════════════
// ② «QUANTI DIFETTI» — la casa si è spostata, e non ne è rimasta una copia
// ═══════════════════════════════════════════════════════════════════════════
//
// Il conto del cantiere è nato qui (lotto 42, AR-684 · AR-671) perché qui c'era già la prova che lo
// eseguiva. Ma questa è la casa di un'ALTRA parola — «quali lavori toccano il mondo» — e due parole
// sotto lo stesso tetto sono la stessa malattia vista da lontano: chi cerca la regola degli stati
// non pensa di aprire il file degli atti.
//
// Adesso vive in `cervello/stati-cantiere.mjs`, con i suoi fratelli nuovi (`statoDi`, `eDaFare`,
// `statiIgnoti`, `contaGoverno`, `metaCantiere`). Qui resta la RIESPORTAZIONE, che è come si sposta
// una regola senza rompere chi la usa: `salute-onesta.mjs`, le prove del lotto 42 e chiunque
// importasse da questo file continuano a funzionare, e **la definizione resta una sola**. Lasciarne
// una copia qui sarebbe precisamente la malattia che questo file dichiara di curare.

export {
  STATO_CHIUSO,
  STATI_NOTI,
  eChiusa,
  haDataNascita,
  contaDifetti,
  sommaTorna,
  apertiAllaData,
} from "./stati-cantiere.mjs";

import { STATI_NOTI } from "./stati-cantiere.mjs";

// ═══════════════════════════════════════════════════════════════════════════
// LA RIGA DI COMANDO — stampa e basta, nessuna scrittura
// ═══════════════════════════════════════════════════════════════════════════

if (process.argv[1] && process.argv[1].endsWith("atti-veri.mjs")) {
  if (process.argv.includes("--bash")) process.stdout.write(shAttiVeri());
  else if (process.argv.includes("--json")) process.stdout.write(JSON.stringify({ ATTI_VERI, TIPI_CON_LE_MANI, STATI_NOTI }, null, 2) + "\n");
  else {
    console.log("🏷️  Le parole con un padrone solo");
    console.log(`   atti veri (mai riaccodabili): ${ATTI_VERI.join(", ")}`);
    console.log(`   tipi con le mani (retry-policy): ${TIPI_CON_LE_MANI.join(", ")}`);
    console.log(`   stati del cantiere che so nominare: ${STATI_NOTI.join(", ")}`);
    console.log("   --bash  → la copia sourceabile per la shell   ·   --json → l'elenco per le macchine");
  }
}
