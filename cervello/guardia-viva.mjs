// 🧭 GUARDIA VIVA — un verdetto che non arriva a nessuna decisione non è una protezione.
//
// LA MALATTIA (corsia A del lotto 34, misurata il 29/7 su AR-376, AR-393, AR-394, AR-321):
// il verdetto ESISTE e non frena. Si presenta in tre forme che sembrano diverse e sono la stessa:
//
//   ① lo strumento è costruito e non lo LANCIA nessuno   → `permessi-check.mjs` esce 1 con quattro
//      violazioni vere da giorni, e nessun processo ricorrente lo esegue (AR-376). Idem
//      `non-vacuita.mjs`, il controllo che dovrebbe smascherare le prove cieche (AR-393).
//   ② il codice d'uscita finisce in una variabile che nessuno RIEMPIE → nel cancello di
//      pubblicazione `rc_one` è inizializzato a 0, passato al verdetto come se fosse una misura, e
//      mai assegnato: quattro guardiani promessi, tre eseguiti (AR-394).
//   ③ il vincolo è un CARTELLO rivolto al motore AI invece di un freno sul dato (AR-321).
//
// LA RADICE, comune a tutte e tre: **costruire uno strumento e metterlo di guardia sono due gesti
// separati, e solo il primo lascia una traccia.** Il secondo si dimentica senza rumore, perché
// nessun elenco misura lo scarto fra i guardiani che ESISTONO e quelli che sono CABLATI: la bacheca
// censisce solo i secondi (`censimento-guardiani.mjs` legge giro.sh), quindi un guardiano mai
// cablato è invisibile per costruzione.
//
// LA CURA, e perché è di forma diversa dalle due metà:
//   · l'insieme dei guardiani si DERIVA dal codice vero (chi ha lo shebang, dichiara il contratto
//     d'uscita e chiude con process.exit) — così un guardiano nuovo entra da solo e non c'è un
//     secondo posto che possa restare indietro (la lezione del perimetro derivato, AR-379/AR-387);
//   · la GUARDIA si dichiara in `cervello/guardiani-motivi.json`, e la dichiarazione si VERIFICA:
//     chi dice «cablato in giro.sh» deve essere davvero invocato da giro.sh, o è una dichiarazione
//     che mente — peggio del silenzio (la lezione di `sensore-spento.mjs`: uno spento senza un
//     perché dichiarato è un buco, non uno stato).
//
// COSA NON PROVA. Non prova che i guardiani MISURINO la cosa giusta: prova che qualcuno li esegua e
// che il loro verdetto arrivi a una decisione. Un guardiano cablato benissimo che guarda il campo
// sbagliato, qui risulta sano.
//
// Nessuna dipendenza e nessun I/O: si esegue su testo passato da fuori, così un test la può
// interrogare con casi finti invece di rileggerla. Il lato che tocca i file è `guardia-viva-check.mjs`.

// ─────────────────────────────────────────────────────────────────────────────
// ① CHI È UN GUARDIANO (derivato dal codice, non elencato a mano)
// ─────────────────────────────────────────────────────────────────────────────

/** Il contratto d'uscita dichiarato in testa al file: «Exit: 0 = … 1 = … 2 = …», o la sua variante. */
const RE_CONTRATTO = /^\/\/.*\b(?:Exit|EXIT|Uscita|USCITA)\b\s*[:(]/m;

/** Quante righe di intestazione si leggono per trovare il contratto. Oltre, è codice. */
export const RIGHE_INTESTAZIONE = 80;

/**
 * Questo file è uno strumento che emette un VERDETTO da riga di comando?
 *
 * Tre condizioni insieme, e servono tutte e tre:
 *   · lo shebang → si può eseguire (una libreria pura come `fonte-numero.mjs` non ce l'ha);
 *   · il contratto d'uscita dichiarato, o `codiceUscita` esportato → dice sì/no, non stampa e basta;
 *   · un `process.exit` → quel giudizio esce davvero dal processo.
 *
 * Senza la terza, `censimento-guardiani.mjs` — che dichiara il contratto nell'intestazione ma è una
 * libreria di funzioni pure — entrerebbe nell'elenco come guardiano orfano, e un elenco che accusa
 * chi non c'entra si impara a ignorare come uno che tace.
 */
export function eGuardiano(testo = "") {
  const t = String(testo || "");
  if (!/^#!.*node/.test(t)) return false;
  if (!/process\.exit\(/.test(t)) return false;
  const testa = t.split("\n").slice(0, RIGHE_INTESTAZIONE).join("\n");
  return RE_CONTRATTO.test(testa) || /export function codiceUscita/.test(t);
}

// ─────────────────────────────────────────────────────────────────────────────
// ② CHI LO ESEGUE DAVVERO (e perché nominarlo non basta)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Le forme in cui un processo ESEGUE un guardiano. Sono strette apposta.
 *
 * La distinzione che tiene in piedi tutto: negli script di questa casa un'invocazione vera passa
 * SEMPRE da una variabile di percorso (`$SCRIPT_DIR/`, `$dir/`) o dall'helper `guardiano`, mentre i
 * messaggi rivolti a chi legge scrivono il percorso per esteso («Dettaglio: node
 * cervello/porte-check.mjs»). Confondere le due cose è esattamente il difetto AR-393: in
 * `cancello-lotto.mjs` la stringa «node cervello/non-vacuita.mjs» compariva dentro un messaggio, e
 * un rilevatore ingenuo l'avrebbe letta come «qualcuno lo esegue» — cioè avrebbe dichiarato di
 * guardia il guardiano più orfano di tutti, sulla base di un cartello.
 */
const RE_INVOCAZIONE = [
  // shell: node "$SCRIPT_DIR/x.mjs" · node "$dir/x.mjs" · node "${SCRIPT_DIR:-cervello}/x.mjs"
  // Il `:-default` non è un dettaglio: `lib-cadenza.sh` e `lib-esito-lavoro.sh` chiamano tutti così,
  // e senza quel pezzo di regex il rilevatore avrebbe dichiarato orfano un guardiano invocato da due
  // copioni — cioè avrebbe accusato chi il lavoro l'aveva fatto. Un metro che sbaglia in questa
  // direzione si spegne da solo: si impara a scorrere l'elenco perché «tanto sbaglia».
  /node\s+"?\$\{?(?:SCRIPT_DIR|dir|QUI|REPO|AD_REPO|CERVELLO)(?::-[^}\s"]*)?\}?\/([a-z0-9._-]+)\.mjs/g,
  // shell: l'helper del giro — guardiano "x.mjs" (AR-165)
  /\bguardiano\s+"?([a-z0-9._-]+)\.mjs/g,
  // node: spawnSync/esegui con l'argomento in un array — ["cervello/x.mjs"] o ["node","cervello/x.mjs"]
  /\[[^\]\n]*"cervello\/([a-z0-9._-]+)\.mjs"/g,
  // GitHub Actions: run: node cervello/x.mjs
  /run:\s*node\s+cervello\/([a-z0-9._-]+)\.mjs/g,
  // systemd: ExecStart=/usr/bin/node /opt/…/cervello/x.mjs
  /ExecStart=.*cervello\/([a-z0-9._-]+)\.mjs/g,
];

/** I guardiani che questo testo ESEGUE (non quelli che nomina). Restituisce nomi con estensione. */
export function invocazioniIn(testo = "") {
  return raccogli(testo, RE_INVOCAZIONE);
}

/**
 * Le forme in più che valgono SOLO dentro un file nominato come posto di guardia.
 *
 * Un test mette di guardia un guardiano in due modi ugualmente veri: eseguendone il processo, o
 * importandone la funzione di decisione e facendola girare sui dati veri. Il secondo modo non si
 * può però ammettere ovunque: `git-pr.mjs` importa `lucchetto-git.mjs`, e contarlo come «di
 * guardia» direbbe che il lucchetto sorveglia qualcosa mentre è solo una libreria usata da chi
 * decide. Per questo l'import conta solo dove qualcuno ha DICHIARATO il posto — e la dichiarazione,
 * essendo scritta a mano, è auditabile da un umano.
 */
const RE_USO = [
  ...RE_INVOCAZIONE,
  /from\s+"(?:\.\.?\/)+([a-z0-9._-]+)\.mjs"/g, // import { … } from "../permessi-check.mjs"
  /join\([^)\n]*"cervello\/([a-z0-9._-]+)\.mjs"/g, // spawnSync("node", [join(REPO, "cervello/x.mjs")])
];

/** Tutti i modi in cui questo testo si serve di un guardiano: esecuzione o import della decisione. */
export function usiIn(testo = "") {
  return raccogli(testo, RE_USO);
}

function raccogli(testo, regole) {
  const fuori = new Set();
  for (const riga of String(testo || "").split("\n")) {
    if (/^\s*(#|\/\/)/.test(riga)) continue; // un'invocazione dentro un commento non gira
    for (const re of regole) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(riga)) !== null) fuori.add(`${m[1]}.mjs`);
    }
  }
  return fuori;
}

// ─────────────────────────────────────────────────────────────────────────────
// ③ LA GUARDIA DICHIARATA, E LA DICHIARAZIONE CHE MENTE
// ─────────────────────────────────────────────────────────────────────────────

/** Perché uno strumento non è cablato. Il quarto non è un motivo: è l'assenza di un motivo. */
export const MOTIVO = {
  CABLATO: "cablato", // lo esegue un processo ricorrente: va verificato che sia vero
  LIBRERIA: "libreria", // esiste come CLI di diagnosi, ma il suo giudizio vive dentro chi lo importa
  DECISIONE: "decisione", // si lancia a mano di proposito, e il perché è scritto
  DA_CABLARE: "da-cablare", // riconosciuto come buco e messo sotto un TETTO che scende: debito, non stato
  INERZIA: "inerzia", // nessuno l'ha mai messo di guardia e nessuno lo sta chiedendo: è il buco
};

/** I motivi che ammettono di essere un buco: contano contro il tetto invece di sparire. */
export const MOTIVI_DEBITO = new Set([MOTIVO.DA_CABLARE]);

/** Quanto deve essere lungo un «perché» per essere una decisione e non un'etichetta. */
export const PERCHE_MINIMO = 20;

/**
 * **La decisione**, per un guardiano solo.
 *
 * L'ordine conta, e il primo caso è il motivo per cui questo registro non marcisce: **essere di
 * guardia si MISURA, non si dichiara.** Chi è eseguito da un processo vero è a posto e non deve
 * scrivere niente da nessuna parte — se dovesse, avremmo costruito il secondo elenco scritto a mano
 * che si stacca dal codice al primo lotto, cioè la malattia curata da AR-379/AR-387 spostata di un
 * file. Si dichiara **solo la differenza**: chi non lo esegue nessuno.
 *
 *   · eseguito da qualcuno                              → ok, misurato
 *   · dichiarato «libreria»/«decisione» col perché       → ok, è una scelta scritta
 *   · dichiarato «cablato» e NESSUNO lo invoca           → **buco**: la dichiarazione mente
 *   · non dichiarato per niente                          → **buco**: costruito e mai messo di guardia
 */
export function guardiaDi(nome, registro = {}, invocati = new Set(), invocatoDa = new Map()) {
  const voce = registro?.[String(nome)];
  const motivo = voce && typeof voce === "object" ? String(voce.motivo || "") : String(voce || "");
  const eseguito = invocati.has ? invocati.has(String(nome)) : false;

  if (eseguito) return { ok: true, motivo: MOTIVO.CABLATO, perche: "lo esegue un processo vero (misurato dal codice)" };

  // `cablato` con un posto NOMINATO: è la strada per chi mette di guardia un guardiano dentro un
  // test della suite. Un test non è un processo qualunque — è la rete che gira su ogni push (CI) e
  // a ogni giro — ma «lo esegue un test» da solo non basta: un test può eseguire uno strumento per
  // verificare che sia in sola lettura, e quello non è metterlo di guardia su niente. Perciò il
  // posto va nominato, e qui si controlla che quel file lo invochi davvero.
  if (motivo === MOTIVO.CABLATO) {
    const dove = voce?.dove ? String(voce.dove) : "";
    const posti = invocatoDa.get ? invocatoDa.get(String(nome)) || [] : [];
    if (dove && posti.includes(dove)) {
      return { ok: true, motivo, perche: `messo di guardia da ${dove} (verificato: quel file lo invoca)` };
    }
    return {
      ok: false,
      motivo,
      perche: dove
        ? `dichiarato cablato in ${dove}, ma quel file non lo invoca: una dichiarazione che mente è peggio del silenzio`
        : "dichiarato cablato senza dire dove: un cablaggio senza indirizzo non si può verificare",
    };
  }
  if (motivo !== MOTIVO.LIBRERIA && motivo !== MOTIVO.DECISIONE && motivo !== MOTIVO.DA_CABLARE) {
    return {
      ok: false,
      motivo: MOTIVO.INERZIA,
      perche: "costruito e mai messo di guardia: nessun processo lo esegue e nessuno ha dichiarato perché",
    };
  }
  // libreria / decisione / da-cablare: valgono solo col perché scritto. Un motivo di due parole è
  // un'etichetta, ed è così che una rinuncia si traveste da scelta.
  const perche = String(voce?.perche || "").trim();
  if (perche.length < PERCHE_MINIMO) {
    return { ok: false, motivo, perche: `dichiarato «${motivo}» senza un perché scritto: un'etichetta non è una decisione` };
  }
  // `da-cablare` NON è a posto: è un buco ammesso. Non fa fallire da solo — lo fa il tetto, che è
  // assoluto e scende. Senza tetto questa casella sarebbe il parcheggio dove i buchi vanno a morire
  // di vecchiaia, cioè il silenzio di prima con un'etichetta sopra.
  return { ok: true, motivo, perche, debito: MOTIVI_DEBITO.has(motivo) };
}

/** Gli strumenti costruiti e mai messi di guardia: il difetto vero e proprio. */
export function senzaGuardia(guardiani = [], invocati = new Set(), registro = {}, invocatoDa = new Map()) {
  const fuori = [];
  for (const nome of guardiani) {
    const g = guardiaDi(nome, registro, invocati, invocatoDa);
    if (!g.ok) fuori.push({ strumento: nome, motivo: g.motivo, perche: g.perche });
  }
  return fuori;
}

/** Chi è dichiarato «da-cablare»: buchi ammessi, che vivono solo sotto il tetto. */
export function debitoDiGuardia(guardiani = [], invocati = new Set(), registro = {}, invocatoDa = new Map()) {
  return guardiani.filter((nome) => guardiaDi(nome, registro, invocati, invocatoDa).debito === true);
}

/**
 * Il tetto del debito: assoluto, e scende. Un buco in più del dichiarato non si consegna, anche se
 * ha il suo perché scritto — altrimenti «da-cablare» diventa il posto dove si mette tutto.
 */
export function tettoSforato(debito = [], tetto = 0) {
  const t = Number.isFinite(Number(tetto)) ? Number(tetto) : 0;
  return debito.length > t ? { sforato: true, quanti: debito.length, tetto: t } : { sforato: false, quanti: debito.length, tetto: t };
}

/**
 * Voci del registro che non servono più: o parlano di uno strumento che non esiste, o scusano uno
 * che nel frattempo è stato cablato davvero.
 *
 * La seconda metà è la più importante e la meno ovvia: una scusa rimasta in piedi dopo che il buco
 * è stato chiuso insegna che le scuse non scadono mai — e la prossima si scriverà con meno cura.
 */
export function fantasmi(guardiani = [], registro = {}, invocati = new Set()) {
  const vivi = new Set(guardiani);
  return Object.keys(registro || {})
    .filter((k) => !k.startsWith("_"))
    .filter((k) => !vivi.has(k) || (invocati.has ? invocati.has(k) : false));
}

// ─────────────────────────────────────────────────────────────────────────────
// ④ ASCOLTARE UN GUARDIANO CHE DICE NO DA GIORNI (senza spegnerlo)
// ─────────────────────────────────────────────────────────────────────────────
//
// Il momento in cui si mette di guardia un guardiano che è rosso è il momento in cui si è tentati
// di abbassarlo a informativo: «altrimenti blocca tutto». È il gesto che ha creato AR-394 (rc_one
// degradato a parametro morto) e AR-321 (il vincolo degradato a testo nel prompt). La terza via,
// già in casa fra i sensori spenti: **ciò che non si può riparare adesso diventa debito
// DICHIARATO, con il suo perché e la domanda vera in coda a Nicola** — e sotto un tetto, così non
// diventa il posto dove si mette tutto.
//
// La verifica che rende onesta la dichiarazione: se la voce dice «l'ho chiesto a Nicola», quella
// domanda deve esistere DAVVERO nella coda. Altrimenti è il silenzio di prima con un'etichetta.

/**
 * Le violazioni vere che nessuno ha dichiarato — o che dichiarano una domanda che non esiste.
 *
 * @param voci        le violazioni misurate adesso, ognuna con una chiave stabile
 * @param dichiarati  il registro { chiave: { perche, card? } }
 * @param cardInCoda  (marca) => la domanda a Nicola esiste davvero nella coda
 */
export function debitoNonDichiarato(voci = [], dichiarati = {}, cardInCoda = () => true) {
  const fuori = [];
  for (const v of voci) {
    const chiave = String(v?.chiave ?? v);
    const voce = dichiarati?.[chiave];
    const perche = String(voce?.perche || "").trim();
    if (!voce || perche.length < PERCHE_MINIMO) {
      fuori.push({ ...(typeof v === "object" ? v : { chiave }), perche_mancante: "violazione mai dichiarata: nessuno ha scritto perché è ancora lì" });
      continue;
    }
    if (voce.card && !cardInCoda(String(voce.card))) {
      fuori.push({
        ...(typeof v === "object" ? v : { chiave }),
        perche_mancante: `dichiarata «chiesta a Nicola» con la card ${voce.card}, ma quella card non è in coda: la domanda non esiste`,
      });
    }
  }
  return fuori;
}

// ─────────────────────────────────────────────────────────────────────────────
// ⑤ IL VERDETTO CHE NESSUNO RIEMPIE (AR-394)
// ─────────────────────────────────────────────────────────────────────────────

/** Una funzione che emette il verdetto finale di un cancello: il nome contiene «verdetto». */
const RE_CHIAMATA_VERDETTO = /\b([a-z_]*verdetto[a-z_]*)\s+((?:"\$\{?[a-z_][a-z0-9_]*\}?"\s*)+)/;

/** I nomi di variabile passati a quella chiamata. */
function argomentiDi(coda = "") {
  return [...String(coda).matchAll(/"\$\{?([a-z_][a-z0-9_]*)\}?"/g)].map((m) => m[1]);
}

/** Tutti i valori assegnati a una variabile in questo testo (`x=0`, `x=$?`, `x="$(…)"`). */
export function assegnazioniDi(testo = "", variabile = "") {
  const v = String(variabile).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...String(testo).matchAll(new RegExp(`\\b${v}=(\\S*)`, "g"))].map((m) => m[1]);
}

/** Un valore assegnato è una MISURA (viene da un'esecuzione) o una costante scritta a mano? */
const eMisura = (valore) => /\$\?|\$\(|\$\{|\$[A-Za-z_]/.test(String(valore));

/**
 * Le variabili che un cancello passa al proprio verdetto **senza mai riempirle**.
 *
 * È la forma ② della malattia: `local rc_seg=0 rc_fat=0 rc_one=0 rc_san=0` e poi
 * `gate_verdetto "$rc_seg" "$rc_fat" "$rc_one" "$rc_san"`, dove `rc_one` non riceve mai un valore
 * perché quel guardiano non viene eseguito. Il verdetto legge uno zero e lo conta come «passato»:
 * quattro controlli promessi, tre fatti, e chi legge la firma della funzione li conta quattro.
 *
 * Il criterio non è «esiste un'assegnazione» ma «esiste un'assegnazione che sia una MISURA»: una
 * variabile inizializzata a 0 e mai più toccata è indistinguibile, per il verdetto, da un guardiano
 * che è passato — ed è precisamente la bugia da smascherare.
 */
export function verdettiMorti(testoShell = "") {
  const t = String(testoShell || "");
  const righe = t.split("\n");
  const morti = [];
  righe.forEach((riga, i) => {
    if (/^\s*#/.test(riga)) return;
    const m = riga.match(RE_CHIAMATA_VERDETTO);
    if (!m) return;
    // La definizione della funzione (`gate_verdetto() {`) non è una chiamata.
    if (/\)\s*\{/.test(riga)) return;
    for (const v of argomentiDi(m[2])) {
      const valori = assegnazioniDi(t, v);
      if (!valori.length) continue; // variabile che arriva da fuori: non è questo difetto
      if (valori.some(eMisura)) continue;
      morti.push({ funzione: m[1], variabile: v, riga: i + 1 });
    }
  });
  return morti;
}

/** I verdetti morti che nessuno ha dichiarato come debito, col suo perché. */
export function mortiNonDichiarati(morti = [], dichiarati = {}) {
  return morti.filter((x) => {
    const voce = dichiarati?.[x.variabile];
    const perche = typeof voce === "object" ? String(voce?.perche || "") : String(voce || "");
    return perche.trim().length < 20;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Contratto dei guardiani (AR-322): 0 = tutto di guardia · 1 = c'è un buco · 2 = non ho misurato.
// ─────────────────────────────────────────────────────────────────────────────
export function codiceUscita({ cieco = 0, buchi = 0, fantasmi: f = 0, morti = 0, sforato = false } = {}) {
  if (cieco > 0) return 2;
  return buchi + f + morti > 0 || sforato ? 1 : 0;
}
