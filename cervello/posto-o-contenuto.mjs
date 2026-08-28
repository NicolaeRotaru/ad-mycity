// AR-859 — «il posto dove dovevo guardare non c'è» NON è «ho guardato e non c'è niente».
//
// LA MALATTIA, in una riga: ventuno programmi di questa casa dichiaravano di aver trovato un
// problema (uscita 1) in un ramo dove non avevano guardato niente. Da fuori quei due stati sono
// indistinguibili, e chi legge va a riparare la cosa sbagliata — misurato su `giro.sh`, che a
// `test-cervello.mjs rc=1` risponde «TEST DEL CERVELLO ROSSI: uno o più file di test non passano»
// anche quando la cartella delle prove non esiste proprio: si va a leggere i test invece di
// riparare lo strumento (è la stessa cosa che dice il commento di AR-843 sopra quel blocco).
//
// IL CONTRATTO DI CASA (AR-322, scritto in `misura-o-cieco.mjs`, da cui qui si importano i nomi
// invece di ricopiarli — due contratti con gli stessi tre numeri sono due contratti che si
// allontanano):
//   0 = ho guardato, è a posto · 1 = ho guardato e ho TROVATO · 2 = NON HO POTUTO GUARDARE.
//
// LA REGOLA CHE SEPARA I DUE CASI, ed è tutta qui:
//
//   · **il posto non c'è** → ⚪ 2. La cartella, il registro, l'elenco su cui dovevo lavorare non
//     esiste: non ho esaminato una sola cosa, quindi non ho nessun reperto da consegnare.
//   · **il posto c'è ed è vuoto** → ❌ 1. Ho aperto e ho contato: zero. Lo zero È il reperto, e
//     spesso è il reperto grave («il cervello non ha rete», «non c'è nessun reparto»).
//   · **il posto c'è e non ho potuto contarlo** (permessi, lettura fallita) → ⚪ 2. Sono di nuovo
//     senza misura, e un buco non è uno zero.
//
// PERCHÉ UNA FUNZIONE E NON TRE `if`. La stessa decisione, scritta a mano in tre programmi, si è
// già sbagliata in tre modi diversi; e scritta dentro un `main` nessuna prova la può eseguire senza
// far partire tutto il programma — che è precisamente il motivo per cui la malattia è rimasta viva.
// Qui la decisione è una, pura, e i punti malati la CHIAMANO.
//
// 🟢 Nessun I/O, nessuna rete, nessun programma che parte all'import: si esegue in un test senza
// preparare niente.

import { CIECO, OK, PAROLE_DEL_CIECO, ROTTO, codiceUscita } from "./misura-o-cieco.mjs";

/**
 * Che verdetto dare quando quello che cercavo non c'è: mancava il POSTO o mancava il CONTENUTO?
 *
 * @param {object} p
 * @param {boolean} p.postoCe il posto dove dovevo guardare esiste? (la cartella, il file, l'elenco)
 * @param {number|null} [p.trovati] quante cose ci ho trovato dentro. `null` = non ho potuto contarle.
 * @param {string} [p.dove] come si chiama il posto, per il messaggio (es. "cervello/test").
 * @param {string} [p.cerco] cosa ci cercavo, per il messaggio (es. "le prove del cervello").
 * @param {string} [p.reperto] la frase da usare quando lo zero è il reperto: è la notizia grave che
 *   il chiamante vuole dare («il cervello non ha rete»). Se manca, se ne compone una neutra.
 * @returns {{esito: "ok"|"cieco"|"rotto", codice: 0|1|2, perche: string, posto_ce: boolean, trovati: number|null}}
 */
export function verdettoPostoVuoto({ postoCe, trovati = null, dove = "", cerco = "", reperto = "" } = {}) {
  const nome = String(dove || "").trim();
  const cosa = String(cerco || "").trim() || "quello che cercavo";
  const suffisso = nome ? ` (${nome})` : "";

  // ⚪ ① il posto non c'è. Non ho aperto niente: qualunque cosa dicessi sul contenuto me la
  // starei inventando. È il ramo che tutta questa malattia sbagliava.
  if (!postoCe) {
    return esito(
      CIECO,
      `il posto dove dovevo cercare ${cosa}${suffisso} non c'è: non ho guardato niente, quindi non ho trovato niente`,
      { postoCe: false, trovati: null },
    );
  }

  // ⚪ ② il posto c'è ma non ho potuto contarlo. Un buco non è uno zero (è la stessa riga di
  // `fonte-numero.mjs`: un campo assente non è «zero token spesi»).
  const n = trovati === null || trovati === undefined ? null : Number(trovati);
  if (n === null || !Number.isFinite(n)) {
    return esito(CIECO, `${nome || "il posto"} c'è ma non sono riuscita a contare ${cosa}: non ho una misura`, {
      postoCe: true,
      trovati: null,
    });
  }

  // ❌ ③ il posto c'è ed è vuoto. Ho aperto, ho contato, il conto è zero: QUESTO è un reperto, e
  // travestirlo da ⚪ sarebbe la malattia opposta — un guardiano che fa sparire un'accusa vera
  // dicendo «non ho potuto guardare».
  if (n === 0) {
    return esito(ROTTO, reperto ? String(reperto) : `ho guardato in ${nome || "quel posto"}: ${cosa} non c'è. Lo zero è il reperto.`, {
      postoCe: true,
      trovati: 0,
    });
  }

  return esito(OK, `${n} ${cosa} in ${nome || "quel posto"}`, { postoCe: true, trovati: n });
}

function esito(nome, perche, { postoCe, trovati }) {
  return { esito: nome, codice: codiceUscita(nome), perche, posto_ce: postoCe, trovati };
}

/**
 * La riga che un programma stampa uscendo, perché tutti e tre dicano la stessa cosa con le stesse
 * parole: un referto ⚪ che ogni strumento scrive a modo suo è un referto che nessuno impara a
 * riconoscere.
 */
export function rigaReferto(v) {
  const segno = v.codice === 2 ? "⚪" : v.codice === 1 ? "❌" : "✅";
  const targa = v.codice === 2 ? " (AR-859: 2 = non ho potuto misurare, NON è un verde e NON è un rosso)" : "";
  return `${segno} ${v.perche}${targa}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-866 — IL METRO CHE CERCAVA LA MALATTIA NELLA VESTE IN CUI L'ABBIAMO VISTA LA PRIMA VOLTA
// ─────────────────────────────────────────────────────────────────────────────
//
// `confondeCiecoEdErrore` (in `misura-o-cieco.mjs`) è nato da un caso: dodici strumenti il cui ramo
// del cieco usciva col letterale **1**. Un guardiano nato da un caso misura il caso, non il
// problema — e infatti NON vede due vesti:
//
//   · il cieco che esce **0** (AR-861), che è la veste peggiore: silenziosa, chi legge conclude
//     che va tutto bene;
//   · il ramo in cui l'uscita non è un numero scritto ma una variabile — `process.exit(v.codice)` —
//     che è proprio la forma in cui la cura di questo giro è stata scritta.
//
// E il suo tetto è appena sceso a zero. Uno zero letto senza sapere cosa il metro NON guarda si
// legge come «finito», ed è per questo che qui il verdetto non è un numero nudo: porta con sé
// `non_copre`, l'elenco esplicito di ciò che questo metro non sa vedere. Un numero senza la sua
// copertura è un verde più largo di quello che ha guardato.
//
// 🟢 Pura: entra il testo di un programma, esce il giudizio. Nessun I/O.

/**
 * Le espressioni con cui, in questa casa, un'uscita CALCOLATA porta il contratto 0/1/2.
 *
 * Non è indovinare: `codiceUscita`, `codiceUscitaSensori` e il `.codice` di `verdettoPostoVuoto` /
 * `verdettoCopertura` restituiscono per costruzione uno dei tre codici, e `.exit` è la forma che
 * usa `verdettoRegistroAssente`. Un'uscita che passa di lì SA uscire 2. Tutto il resto resta
 * ignoto e finisce in `non_copre`, dichiarato — non dato per innocuo.
 */
export const USCITE_DAL_CONTRATTO = /\bcodiceUscita\b|\bcodiceUscitaSensori\b|\.codice\b|\.exit\b/;

/**
 * Il sorgente con i COMMENTI spenti, righe e colonne intatte.
 *
 * Perché serve, e l'ho misurato addosso a me stessa: il commento che ho scritto sopra la cura di
 * AR-861 CITA il codice malato («qui c'era `process.exit(0)`»). Senza questo passaggio il metro
 * accusava la spiegazione della cura come se fosse la malattia — la scorciatoia numero 12 del
 * catalogo, «la parola invece della chiamata», commessa dal metro nato per non commetterla.
 *
 * Sostituisce il testo dei commenti con spazi, così i numeri di riga restano quelli veri.
 */
export function codiceSenzaCommenti(sorgente = "") {
  const t = String(sorgente);
  let out = "";
  let stato = "codice"; // codice | riga | blocco | "  | '  | `
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    const d = t[i + 1];
    if (stato === "codice") {
      if (c === "/" && d === "/") { stato = "riga"; out += "  "; i++; continue; }
      if (c === "/" && d === "*") { stato = "blocco"; out += "  "; i++; continue; }
      if (c === '"' || c === "'" || c === "`") stato = c;
      out += c;
      continue;
    }
    if (stato === "riga") {
      if (c === "\n") { stato = "codice"; out += c; } else out += " ";
      continue;
    }
    if (stato === "blocco") {
      if (c === "*" && d === "/") { stato = "codice"; out += "  "; i++; } else out += c === "\n" ? c : " ";
      continue;
    }
    // dentro una stringa: la lascio com'è, ma non mi faccio ingannare dalle fughe
    out += c;
    if (c === "\\") { out += t[i + 1] ?? ""; i++; continue; }
    if (c === stato) stato = "codice";
  }
  return out;
}

/** Il primo `process.exit(` di una riga, con l'argomento preso bilanciando le parentesi. */
function argomentoDiExit(riga) {
  const i = riga.indexOf("process.exit(");
  if (i === -1) return null;
  let livello = 0;
  let inizio = i + "process.exit(".length;
  for (let k = inizio - 1; k < riga.length; k++) {
    if (riga[k] === "(") livello++;
    else if (riga[k] === ")") {
      livello--;
      if (livello === 0) return riga.slice(inizio, k).trim();
    }
  }
  return null; // parentesi non chiuse su questa riga: non so leggerla → lo dirò in `non_copre`
}

/**
 * Che codici d'uscita sa produrre un programma, e da quali rami.
 *
 * @param {string} sorgente il testo del programma.
 * @returns {{uscite: object[], puo_uscire_2: boolean, ciechi_travestiti: object[], non_copre: string[]}}
 *   · `uscite` — una voce per `process.exit(...)`: riga, forma, codici (o `null` se ignoti), se il
 *     ramo dichiara di non aver potuto guardare;
 *   · `puo_uscire_2` — il programma sa dire «non ho potuto misurare»;
 *   · `ciechi_travestiti` — rami che dichiarano di non aver guardato e NON escono 2 (0 = AR-861,
 *     1 = AR-859);
 *   · `non_copre` — cosa questo metro non sa vedere. Non è mai vuoto: è la clausola di AR-866.
 */
export function usciteDelProgramma(sorgente = "") {
  // I commenti si spengono PRIMA di guardare: vedi `codiceSenzaCommenti`.
  const righe = codiceSenzaCommenti(sorgente).split("\n");
  const uscite = [];
  let ignote = 0;
  let illeggibili = 0;
  righe.forEach((riga, i) => {
    if (!riga.includes("process.exit(")) return;
    const arg = argomentoDiExit(riga);
    if (arg === null) {
      illeggibili++;
      return;
    }
    const contesto = contestoDelRamo(righe, i);
    const cieco = PAROLE_DEL_CIECO.test(contesto);
    // Un programma che crepa esce 1 ed è giusto così: un `catch` non è un cieco.
    const dentroUnCatch = /catch\s*\(|\.catch\(/.test(contesto);
    let forma = "ignota";
    let codici = null;
    if (/^\d+$/.test(arg)) {
      forma = "letterale";
      codici = [Number(arg)];
    } else if (soloNumeri(arg)) {
      // `problemi.length ? 1 : 0` — i codici sono scritti, decide solo QUALE dei due.
      forma = "scelta-fra-letterali";
      codici = numeriDi(arg);
    } else if (USCITE_DAL_CONTRATTO.test(arg)) {
      forma = "contratto";
      codici = [0, 1, 2];
    } else {
      ignote++;
    }
    uscite.push({ riga: i + 1, forma, codici, cieco: cieco && !dentroUnCatch, testo: arg.slice(0, 60) });
  });

  const puo2 = uscite.some((u) => (u.codici || []).includes(2));
  const ciechi = uscite.filter((u) => u.cieco && u.codici && !u.codici.includes(2));

  const nonCopre = [
    "i rami che finiscono senza `process.exit` — `throw`, `process.exitCode = …`, un `return` dal main",
    "l'uscita decisa dentro un altro file: guardo solo questo sorgente, non le funzioni che importa",
    "i programmi di shell: qui leggo solo JavaScript",
    "il RAMO in cui l'uscita si apre davvero: leggo il testo, non lo eseguo",
  ];
  if (ignote) nonCopre.push(`${ignote} uscite calcolate fuori dal contratto di casa: non so quali codici producano`);
  if (illeggibili) nonCopre.push(`${illeggibili} \`process.exit(\` con le parentesi aperte su più righe: non le so leggere`);
  const conExitCode = (righe.join("\n").match(/process\.exitCode\s*=/g) || []).length;
  if (conExitCode) nonCopre.push(`${conExitCode} \`process.exitCode = …\`: escono dal fondo del programma, e da qui non li seguo`);

  return { uscite, puo_uscire_2: puo2, ciechi_travestiti: ciechi, non_copre: nonCopre };
}

/**
 * Le righe che appartengono AL RAMO di questa uscita, per capire se dichiara di non aver guardato.
 *
 * Sei righe all'indietro come fa `confondeCiecoEdErrore`, ma fermandosi alla graffa che chiude:
 * quello che sta prima è di un altro ramo. Senza questo, in
 *
 *   if (!existsSync(SALA)) { console.log("assente"); process.exit(0); }
 *   process.exit(inadempienti.length ? 1 : 0);
 *
 * anche la SECONDA uscita risultava «cieca», perché la parola «assente» era ancora nella finestra —
 * e un metro che accusa il ramo sano accanto a quello malato non si può portare a zero.
 */
function contestoDelRamo(righe, i) {
  const pezzi = [righe[i]];
  for (let k = i - 1; k >= 0 && k >= i - 6; k--) {
    const t = righe[k].trim();
    if (t.startsWith("}")) break;
    pezzi.unshift(righe[k]);
  }
  return pezzi.join(" ");
}

/** Tutti i numeri scritti in un'espressione. */
function numeriDi(espressione) {
  return [...new Set((String(espressione).match(/\b\d+\b/g) || []).map(Number))].sort();
}

/** L'espressione decide solo FRA numeri scritti (`x ? 1 : 0`)? Allora i codici li conosco. */
function soloNumeri(espressione) {
  return /[?:]/.test(espressione) && numeriDi(espressione).length > 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-862 — CHI LEGGE IL VERDETTO, E COME
// ─────────────────────────────────────────────────────────────────────────────
//
// Uno strumento può emettere il 2 perfettamente e non servire a niente, se chi lo legge lo confronta
// a mano. In `giro.sh` il verdetto di `valida-contratti` era letto con `if [ rc -ne 0 ]` invece che
// con la funzione di casa `vincolo_da_rc`: col 2 il giro un vincolo lo dava comunque — quindi niente
// silenzio — ma col TESTO DI DOMINIO di un reperto («CONTRATTI JSON FUORI-CONTRATTO… Rinomina ai
// nomi canonici»), che con la cartella mancante è una bugia sul contenuto e manda a cercare un campo
// rinominato che non esiste.
//
// Un confronto a mano su un guardiano che sa uscire 2 è la FORMA GENERALE, non il caso singolo:
// questa funzione la trova, e come sopra dichiara cosa non sa vedere.
//
// 🟢 Pura: entra il testo di uno script di shell, esce l'elenco dei lettori.

/**
 * Lo script di shell con i COMMENTI spenti, righe e colonne intatte.
 *
 * Trovato rompendo il fix apposta, ed è la scorciatoia numero 12 del catalogo — «la parola invece
 * della chiamata» — commessa dal metro nato per non commetterla: rimesso il confronto a mano in
 * `giro.sh` MA lasciato il commento che spiega la cura, il metro leggeva `vincolo_da_rc` dentro il
 * commento e dichiarava il blocco curato. Un metro che si accontenta della parola scritta lì vicino
 * assolve proprio il caso peggiore: cura rimossa, spiegazione rimasta.
 *
 * Un `#` apre un commento solo FUORI dalle virgolette e a inizio parola (così `${VAR#pattern}` e i
 * cancelletti dentro le stringhe restano dove sono).
 */
export function shellSenzaCommenti(testo = "") {
  const t = String(testo);
  let out = "";
  let virgolette = null; // null | '"' | "'"
  let inCommento = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "\n") { inCommento = false; out += c; continue; }
    if (inCommento) { out += " "; continue; }
    if (virgolette) {
      out += c;
      if (c === "\\" && virgolette === '"') { out += t[i + 1] ?? ""; i++; continue; }
      if (c === virgolette) virgolette = null;
      continue;
    }
    if (c === '"' || c === "'") { virgolette = c; out += c; continue; }
    if (c === "#" && (i === 0 || /\s/.test(t[i - 1]))) { inCommento = true; out += " "; continue; }
    out += c;
  }
  return out;
}

/** La riga con cui `giro.sh` cattura il verdetto di un guardiano. */
const CATTURA_RC = /(_[a-z0-9_]+)_out="\$\(node "\$SCRIPT_DIR\/([a-z0-9._-]+\.mjs)"[^\n]*\)";\s*\1_rc=\$\?/i;

/**
 * Chi legge il codice d'uscita di un guardiano dentro uno script di shell, e in che modo.
 *
 * @param {string} testoShell
 * @param {{finestra?: number}} opzioni quante righe sotto la cattura si considerano «il lettore».
 * @returns {{lettori: object[], non_copre: string[]}} per ogni lettore: `script`, `riga`, `come`
 *   (`vincolo_da_rc` | `ramo-2` | `uno-poi-il-resto` | `a-mano`), `tratta_il_cieco`, `compone_vincolo`.
 */
export function letturaDeiVerdetti(testoShell = "", { finestra = 20 } = {}) {
  // I commenti si spengono PRIMA di guardare: vedi `shellSenzaCommenti`.
  const righe = shellSenzaCommenti(testoShell).split("\n");
  const lettori = [];
  righe.forEach((riga, i) => {
    const m = riga.match(CATTURA_RC);
    if (!m) return;
    const prefisso = m[1];
    const blocco = righe.slice(i + 1, i + 1 + finestra).join("\n");
    const rc = `${prefisso}_rc`;
    // La chiamata dev'essere legata A QUESTO rc: `vincolo_da_rc "nome" "$_contr_rc" "…"`. Il
    // semplice «da qualche parte qui sotto c'è scritto vincolo_da_rc» assolveva il blocco accanto.
    const viaCasa = new RegExp(`vincolo_da_rc[^\\n]*\\$${rc}\\b`).test(blocco);
    // Un ramo che nomina il 2 per nome: `-eq 2`, `= 2`, oppure l'etichetta `2)` di un `case`.
    const ramoDue = new RegExp(`\\$${rc}" -eq 2|\\$${rc}" = 2|\\$${rc}" = "2"`).test(blocco) || /^\s*2\)\s*$/m.test(blocco);
    // `if rc -eq 1 … elif rc -ne 0` separa il reperto da tutto il resto: il cieco ha un ramo suo.
    const unoPoiIlResto =
      new RegExp(`\\$${rc}" -eq 1`).test(blocco) && new RegExp(`elif[^\\n]*\\$${rc}" -ne 0`).test(blocco);
    const componeVincolo = /[A-Z][A-Z0-9_]*_VINCOLO=|_gate_motivi=|MEMORIA_INCOERENTE=1/.test(blocco);
    const come = viaCasa ? "vincolo_da_rc" : ramoDue ? "ramo-2" : unoPoiIlResto ? "uno-poi-il-resto" : "a-mano";
    lettori.push({
      script: m[2],
      prefisso,
      riga: i + 1,
      come,
      tratta_il_cieco: come !== "a-mano",
      compone_vincolo: componeVincolo,
    });
  });

  return {
    lettori,
    non_copre: [
      'vedo solo la forma `_x_out="$(node "$SCRIPT_DIR/nome.mjs" …)"; _x_rc=$?`: chi lancia un guardiano dentro una pipe, con la funzione `guardiano`, o con un comando messo in una variabile, non lo vedo',
      `guardo ${finestra} righe sotto la cattura: un lettore più lontano mi sfugge`,
      "non apro il file del guardiano: se sappia uscire 2 lo decide chi mi chiama",
      "i blocchi che con quell'rc scrivono solo una riga di log non li giudico: non arrivano al motore",
    ],
  };
}
