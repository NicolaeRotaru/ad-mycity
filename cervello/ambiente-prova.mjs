// 🧭 POSSO GUARDARE DA QUI? — la domanda che decide fra ROSSO e ⚪, in una casa sola.
//
// IL DIFETTO CHE QUESTO MODULO CHIUDE (AR-437, misurato il 22/8 su `main` pulito).
// `node cervello/cancello-lotto.mjs` usciva «⛔ NON SI CONSEGNA» con due prove rosse —
// `c2-schermo` e `c4-schermo-coda` — contro un tetto di zero. Nessuna delle due era rotta: bastava
// `npm install --prefix pannello` e passavano entrambe, sei casi su sei. Erano CIECHE, non rosse.
//
// Perché la cecità usciva rossa da una porta e bianca dall'altra:
//
//   · il typecheck del cancello chiedeva già `ambientePannello()` e sapeva dire ⚪;
//   · il banco delle prove sapeva dire ⚪ quando a mancare era un `import` (`Cannot find module`);
//   · ma le prove che guidano il Pannello vero non importano niente: fanno partire `npm run dev` in
//     un PROCESSO FIGLIO. Lì `next: not found` non è un import mancante — è testo dentro un log, e
//     nessuno dei due freni lo vedeva. Il terzo canale non ereditava nessuno dei cancelli degli
//     altri due, perché i cancelli stavano dentro il comando invece che sul dato.
//
// La cura è quella della regola ⑥ del cantiere: il freno si sposta SUL DATO. Qui c'è una risposta
// sola — «posso guardare il Pannello da questa macchina?» — e la usano tutti e tre i canali: il
// cancello, il banco e le prove a runtime. Un canale nuovo che nasce domani la eredita per
// costruzione, invece di doversi ricordare di aggiungerla.
//
// E il motivo per cui vale la pena: un cancello che nasce rosso senza colpa di nessuno si impara ad
// aggirare, e da quel momento non ferma più nemmeno i rossi veri. ⚪ non è un verde — resta nel
// conto di «non dà garanzie» — ma non è nemmeno un rosso, perché manda a cercare un difetto che non
// c'è. Sono tre colori, e vanno detti tutti e tre.

/**
 * L'ambiente del Pannello è pronto per un typecheck che voglia dire qualcosa?
 *
 * Pura: riceve la domanda «questo file esiste?» e non tocca il disco da sé, così la prova può
 * simulare una sessione appena aperta senza svuotare `node_modules` per davvero.
 *
 * Vive qui e non più in `cancello-lotto.mjs`: era l'unica risposta a una domanda che si fanno in
 * tre, e una parola con due padroni diverge in silenzio (è una malattia censita).
 */
export function ambientePannello(esiste) {
  if (!esiste("node_modules")) {
    return {
      pronto: false,
      caso: "assente",
      motivo: "pannello/node_modules assente: `tsc` sbaglierebbe su ogni import, e non è il tuo lavoro",
      comando: "npm ci --prefix pannello",
    };
  }
  if (!esiste("node_modules/@types/node")) {
    return {
      pronto: false,
      caso: "incompleto",
      motivo: "pannello/node_modules c'è ma senza @types/node: `process` e i moduli Node risulterebbero sconosciuti",
      comando: "npm ci --prefix pannello",
    };
  }
  return { pronto: true };
}

/**
 * Posso GUIDARE il Pannello con un browser, da questa macchina?
 *
 * Due strumenti servono insieme e mancano per lo stesso motivo — non sono installati qui:
 *   · Playwright, per guidare il browser;
 *   · `pannello/node_modules`, senza cui `npm run dev` esce subito con `next: not found`.
 *
 * Prima c'era una sola domanda, su Playwright: chi non aveva il browser saltava in un secondo e
 * dichiarava ⚪; chi ce l'aveva ma non aveva il Pannello installabile aspettava che `npm run dev`
 * morisse e usciva ROSSO. Stessa cecità, due esiti diversi — e il secondo bloccava il cancello di
 * tutti. Adesso la domanda è una e le risposte sono due colori, non tre porte.
 *
 * @param {object} q
 * @param {(f:string)=>boolean} q.esisteInPannello  «esiste `pannello/<f>`?»
 * @param {boolean} q.playwright                    Playwright si è risolto?
 */
export function possoGuidareIlPannello({ esisteInPannello, playwright }) {
  if (!playwright) {
    return {
      puoi: false,
      caso: "senza-browser",
      motivo: "nessun Playwright su questa macchina",
      comando: "npm i -D playwright && npx playwright install chromium",
    };
  }
  const amb = ambientePannello(esisteInPannello);
  if (!amb.pronto) {
    return {
      puoi: false,
      // Si tiene il caso dell'ambiente (`assente` / `incompleto`): serve a distinguere «non ho il
      // browser» da «non posso accendere il Pannello», che si rimediano con due comandi diversi.
      caso: amb.caso,
      motivo: `non posso accendere il Pannello: ${amb.motivo}`,
      comando: amb.comando,
    };
  }
  return { puoi: true };
}

/**
 * La riga TAP con cui una prova dichiara di NON aver potuto guardare.
 *
 * `1..0 # SKIP <perché>` è la forma che il banco (`cervello/test-cervello.mjs`) già riconosce e
 * conta a parte — non fra i verdi. Va stampata PRIMA che `node:test` registri un caso, altrimenti
 * il TAP contiene già dei test e il salto non si legge più.
 *
 * I difetti si nominano tutti: una prova saltata che non dice QUALI difetti restano non verificati
 * è indistinguibile da una prova che non serviva a niente.
 */
export function rigaSalto({ motivo, comando = "", difetti = [] }) {
  const quali = difetti.length
    ? `: ${difetti.join(", ")} NON ${difetti.length === 1 ? "è stato verificato" : "sono stati verificati"} qui`
    : "";
  const rimedio = comando ? ` — rimedio: ${comando}` : "";
  return `1..0 # SKIP ${motivo}${quali}${rimedio}`;
}

/**
 * Questo testo di fallimento è una CECITÀ d'ambiente travestita da rosso?
 *
 * La usa il banco delle prove come ultima rete: un processo figlio che muore perché lo strumento
 * non è installato lascia una firma riconoscibile nel log, e quella firma non è un difetto del
 * codice. Le impronte sono strette apposta — devono nominare uno strumento assente, non un errore
 * qualsiasi — perché una rete larga qui comprerebbe il verde su rossi veri.
 */
const IMPRONTE_CECITA = [
  { re: /\bnext:\s*not found\b/i, motivo: "il Pannello non è installato su questa macchina (`next` non esiste)", comando: "npm ci --prefix pannello" },
  { re: /\bbats:\s*not found\b/i, motivo: "bats non è installato su questa macchina", comando: "npm i -g bats" },
  { re: /\bplaywright\b[^\n]*\bnot found\b/i, motivo: "Playwright non è installato su questa macchina", comando: "npx playwright install chromium" },
  { re: /Executable doesn'?t exist at .*(chromium|firefox|webkit)/i, motivo: "il browser di Playwright non è scaricato su questa macchina", comando: "npx playwright install chromium" },
  // ⚪ AGGIUNTA IL 1/9, dopo averci sbattuto la testa. `cervello/test/aiuto-pannello.mjs` lega il
  // server del Pannello a chi l'ha acceso, così muore col suo padrone — e dichiara nel suo stesso
  // commento l'unico caso che quel guinzaglio non può coprire: «SIGKILL sul processo padre». È
  // successo davvero: il contenitore è stato riavviato, tre `next dev` sono rimasti orfani sulla
  // porta 3939 senza rispondere, e due prove dello schermo sono diventate ROSSE.
  //
  // Ma un indirizzo occupato non è mai un difetto della pagina che si stava provando: è
  // «qualcun altro ha la porta, io non sono nemmeno arrivato a guardare». Il messaggio che la prova
  // stampava lo diceva già a parole — «non posso guardare, quindi non posso dire che è a posto» — e
  // poi tornava rosso lo stesso. Qui la parola diventa il verdetto giusto: ⚪.
  //
  // Il rischio dell'altro verso, dichiarato: se un server morto resta lì per sempre, quelle prove
  // restano ⚪ per sempre. Non sparisce però — il banco conta i ⚪ e scrive «N non misurati: non
  // danno garanzie», che è esattamente il punto di avere un terzo esito invece di due.
  { re: /EADDRINUSE[^\n]*(:39\d\d|address already in use)/i, motivo: "la porta del Pannello è tenuta da un altro processo (di solito un server rimasto orfano da una corsa uccisa): non sono arrivata ad accendere il Pannello", comando: "ps aux | grep '[n]ext dev'  →  kill dei pid trovati, poi rilancia" },
];

export function cecitaDaAmbiente(testo = "") {
  const t = String(testo || "");
  for (const i of IMPRONTE_CECITA) {
    if (i.re.test(t)) return { cieco: true, motivo: i.motivo, comando: i.comando };
  }
  return { cieco: false };
}

/**
 * Questa corsa ha DICHIARATO di non aver potuto guardare?
 *
 * Sta qui — e non in chi legge — perché i lettori sono due (`test-cervello.mjs` per il verdetto di
 * una prova, `non-vacuita.mjs` per il verdetto di una mutazione) e fino al 22/8 avevano due copie
 * della stessa regola, tutte e due mezze cieche. Una parola con due padroni diverge in silenzio:
 * è una malattia censita, e questa ne era un'istanza dentro il metro stesso.
 *
 * DUE FORME, e la seconda è quella che comprava il verde:
 *   · cruda      — `1..0 # SKIP <perché>`      (la prova letta da sola)
 *   · mascherata — `# 1..0 \# SKIP <perché>`   (la stessa prova letta dal banco)
 *
 * La maschera la mette `node --test --test-reporter=tap`: la riga è stdout del figlio, quindi il
 * reporter la ripubblica commentata e col cancelletto protetto, poi chiude con `ok 1 - <file>` e
 * esce ZERO. Chi cercava solo la forma cruda leggeva «passato» su una prova che aveva appena detto
 * di non aver guardato niente.
 */
export function leggiSalto(uscita = "") {
  const m = /^\s*(?:#\s+)?1\.\.0(?:\s+\\?#\s*SKIP\b(.*))?\s*$/im.exec(String(uscita || ""));
  if (!m) return { salto: false, motivo: "" };
  return { salto: true, motivo: (m[1] || "").trim() };
}
