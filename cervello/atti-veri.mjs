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
// ② «QUANTI DIFETTI» — un conto solo, con tutti i rami dichiarati (AR-684 · AR-671)
// ═══════════════════════════════════════════════════════════════════════════

/** L'unico stato che vuol dire «non è più lavoro». Tutto il resto è da fare, anche ciò che non conosco. */
export const STATO_CHIUSO = "chiuso";

/** Gli stati che questo file sa nominare. Quelli che non conosce NON spariscono: finiscono in `altri`. */
export const STATI_NOTI = Object.freeze(["chiuso", "aperto", "in-corso", "da-riverificare"]);

/** Una scheda è chiusa se lo dice il suo stato. Una porta sola, come `eChiuso` lato Pannello. */
export function eChiusa(d) {
  return String(d?.stato ?? "").trim() === STATO_CHIUSO;
}

/** La data di nascita è leggibile? Un `nato` assente o illeggibile è un IGNOTO, non uno zero. */
export function haDataNascita(d) {
  return !Number.isNaN(Date.parse(String(d?.nato ?? "").slice(0, 10)));
}

/**
 * IL CONTO DEL CANTIERE — un metro solo, e la somma dei rami che fa il totale.
 *
 * Perché è una funzione e non un `.filter()`, in tre punti che sono tre difetti pagati:
 *
 *  ① **`da_fare` è tutto ciò che non è chiuso**, non «aperto + in-corso». Il 13/8 c'erano 225
 *     `aperto`, 0 `in-corso` e 56 `da-riverificare`: sommando i due stati previsti, 56 difetti veri
 *     sparivano dal numero che Nicola guarda (AR-684). Uno stato che non conosco non è un difetto
 *     risolto — è un difetto che non so nominare.
 *  ② **La somma dei rami DEVE fare il totale.** `chiusi + aperti + in_corso + da_riverificare +
 *     altri === totale`, e il test lo pretende sul cantiere vero. È la difesa che rende impossibile
 *     il buco di ①: se domani nasce un sesto stato finisce in `altri` e la somma continua a tornare.
 *  ③ **Non letto non è zero.** Se non ti è arrivata una lista, questa funzione non risponde `0`:
 *     risponde `letto: false` con tutti i conti a `null`. Uno zero è un fatto («non ci sono
 *     difetti»); un errore di lettura travestito da zero è la bugia che il 30/7 ha fatto scrivere
 *     alla Cabina «Nessun difetto aperto 👍» con 162 aperti, per dodici ore.
 *
 * `senza_data_nascita` è AR-671 visto dalla parte del dato: i difetti senza `nato` uscivano in
 * silenzio dalla statistica storica invece di essere dichiarati ignoti — e sbagliavano **nella
 * direzione ottimista**, cioè il burn-down migliorava da solo.
 */
export function contaDifetti(difetti) {
  if (!Array.isArray(difetti)) {
    return {
      letto: false,
      motivo: "non mi è arrivata una lista di schede: non ho potuto contare (e un non-contato non è uno zero)",
      totale: null,
      chiusi: null,
      aperti: null,
      in_corso: null,
      da_riverificare: null,
      altri: null,
      da_fare: null,
      senza_data_nascita: null,
      per_stato: null,
    };
  }
  const lista = difetti.filter(Boolean);
  const per_stato = {};
  let chiusi = 0;
  let aperti = 0;
  let in_corso = 0;
  let da_riverificare = 0;
  let altri = 0;
  let senza_data_nascita = 0;
  for (const d of lista) {
    const stato = String(d?.stato ?? "").trim() || "(senza stato)";
    per_stato[stato] = (per_stato[stato] ?? 0) + 1;
    if (stato === "chiuso") chiusi++;
    else if (stato === "aperto") aperti++;
    else if (stato === "in-corso") in_corso++;
    else if (stato === "da-riverificare") da_riverificare++;
    else altri++;
    if (!haDataNascita(d)) senza_data_nascita++;
  }
  return {
    letto: true,
    motivo: null,
    totale: lista.length,
    chiusi,
    aperti,
    in_corso,
    da_riverificare,
    altri,
    // `da_fare` resta il nome con cui il Pannello chiama la stessa cosa: chiuso, oppure da fare.
    da_fare: lista.length - chiusi,
    senza_data_nascita,
    per_stato,
  };
}

/**
 * La somma dei rami torna? Il conto si controlla da solo, così un ramo nuovo non può nascondersi.
 * Torna `null` se il conto non è stato letto: su un cieco non si emette un verdetto.
 */
export function sommaTorna(conto) {
  if (!conto || conto.letto !== true) return null;
  const rami = conto.chiusi + conto.aperti + conto.in_corso + conto.da_riverificare + conto.altri;
  return rami === conto.totale && conto.da_fare === conto.totale - conto.chiusi;
}

/**
 * QUANTI ERANO APERTI A UNA CERTA DATA — e quanti non lo so (AR-671).
 *
 * Prima era `if (nato == null) return false`: una scheda senza data di nascita usciva dal conteggio
 * **in silenzio**, né oggi né una settimana fa. Non è un arrotondamento: è un difetto che sparisce
 * dalla statistica, e sparisce sempre dalla parte comoda — il burn-down migliora da solo.
 *
 * Adesso escono due numeri: quelli che so contare e quelli che **non so collocare nel tempo**.
 * Chi disegna il burn-down deve poter scrivere «più o meno N», non un numero secco che non regge.
 */
export function apertiAllaData(difetti, tMs) {
  const conto = contaDifetti(difetti);
  if (!conto.letto) return { conteggio: null, ignoti: null, letto: false, motivo: conto.motivo };
  if (!Number.isFinite(tMs)) {
    return { conteggio: null, ignoti: null, letto: false, motivo: "non mi è arrivata una data valida: non ho potuto collocare niente nel tempo" };
  }
  const giorno = (iso) => {
    const t = Date.parse(String(iso ?? "").slice(0, 10));
    return Number.isNaN(t) ? null : t;
  };
  let conteggio = 0;
  let ignoti = 0;
  for (const d of difetti.filter(Boolean)) {
    const chiuso = giorno(d?.chiuso_il);
    const giaChiuso = chiuso != null && chiuso <= tMs;
    const nato = giorno(d?.nato);
    if (nato == null) {
      // Non so QUANDO è nato. Se a quella data non risulta ancora chiuso, era del lavoro da fare:
      // lo dichiaro ignoto invece di buttarlo via. Se risultava già chiuso, non è più un dubbio.
      if (!giaChiuso) ignoti++;
      continue;
    }
    if (nato > tMs) continue; // non ancora nato a quella data
    if (!giaChiuso) conteggio++;
  }
  return { conteggio, ignoti, letto: true, motivo: null };
}

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
