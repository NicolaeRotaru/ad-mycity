// eta-referto.mjs — QUANTO È VECCHIO QUESTO REFERTO, E A CHE ETÀ SMETTE DI VALERE
// (lotto 41, corsia «un referto vecchio passa per un referto verde»).
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE QUESTO FILE CURA
// ─────────────────────────────────────────────────────────────────────────────
// La macchina misura il CONTENUTO di un file e non la sua ETÀ. Un referto fermo da tre giorni, un
// quaderno mai scritto, un battito che dice «sono vivo» mentre non riesce più a fare niente:
// superano tutti il controllo, perché il controllo guarda cosa c'è dentro e non quando ci è finito.
// È la forma più pericolosa di tutte, perché il Pannello la mostra a Nicola come verde.
//
// Le nove facce misurate il 13-14/8, tutte la stessa cosa:
//   · le «Mosse di Nicola» ferme al 23 luglio e nessun guardiano se ne accorge (AR-215);
//   · `esito-giro.json` dice da due giorni che il giro è andato male e non lo apre nessuno (AR-367);
//   · nessuna misura dice DA QUALE COMPUTER è stata scritta (AR-286);
//   · 73 senior su 120 non hanno mai consegnato niente e nessuna soglia se ne accorge (AR-194);
//   · il referto del checkup fermo da 45 ore mentre la memoria accanto si aggiorna (AR-578);
//   · il battito fermo da tre giorni, per la seconda volta in dieci, senza una card in coda (AR-592);
//   · 105 quaderni su 120 senza una riga fresca, 72 mai scritti (AR-595);
//   · la review del venerdì non lascia i compiti da tre venerdì (AR-593);
//   · il quaderno dei pezzi nuovi morto da cinque settimane, zero lettori (AR-581).
//
// ─────────────────────────────────────────────────────────────────────────────
// LE TRE RISPOSTE, E PERCHÉ DEVONO ESSERE TRE
// ─────────────────────────────────────────────────────────────────────────────
//   🟢 FRESCO      — l'ho guardato, porta il suo timbro, ed è dentro la sua scadenza.
//   🔴 STANTIO     — l'ho guardato ed è oltre la scadenza che dichiara: quello che dice è di allora.
//   ⚪ NON VISTO   — il file non c'è, o non porta un timbro, o non dichiara a che età scade.
//
// ⚪ NON È MAI UN VERDE. È la riga per cui esiste questo modulo: chi chiama non può più confondere
// «l'ho guardato e va bene» con «non ho potuto guardare». Con due esiti soli, il secondo cade sempre
// nel primo — ed è così che tutti e nove i difetti qui sopra sono sopravvissuti.
//
// TRE REGOLE CHE NON SI NEGOZIANO
//   ① ogni referto dichiara la propria scadenza ACCANTO AL DATO (`timbro.scade_dopo_ore`), non nel
//      codice di chi lo legge. Il REGISTRO qui sotto è la rete di sicurezza per i file nati prima di
//      questa regola: è una tabella sola e condivisa, non una toppa dentro ogni lettore — che è
//      esattamente la causa di sistema di AR-215 («ogni nuovo file nasce scoperto»).
//   ② l'età si misura sul TIMBRO DENTRO IL DATO, mai sulla data di modifica del file: un
//      `git checkout` riscrive la seconda e farebbe risultare fresco tutto il repo in un colpo.
//   ③ il timbro porta anche DA DOVE viene la misura (AR-286): vps, cloud o locale, e i NOMI delle
//      chiavi presenti — mai i loro valori. Senza, un referto scritto da una sessione cloud cieca e
//      uno scritto dal VPS sono indistinguibili anche a posteriori.
//
// ─────────────────────────────────────────────────────────────────────────────
// I VICINI DI CASA, per non rifare il loro lavoro
// ─────────────────────────────────────────────────────────────────────────────
//   · `fonte-numero.mjs`  — «da DOVE viene il numero su cui decido». È il modello di questo file.
//   · `finestra-misura.mjs` — «di QUANDO è e di QUANTO parla un numero» (secchi, finestre rolling).
//   · `misura-o-cieco.mjs` — «ho guardato tutto quello che c'era da guardare?» (copertura).
//   · QUESTO file — «da quanto sta lì scritto un REFERTO, e da che età non vale più».
//     Non un contatore, non una copertura: un artefatto di memoria che qualcuno legge e crede.
//
// 🟢 Un import solo, verso l'orologio di casa (`ora-piacenza.mjs`, a sua volta puro): l'età di un
// timbro NON si calcola con un offset scritto a mano — `+02:00` è vero d'estate e mente di un'ora
// tutto l'inverno (malattia censita `ora-legale-scolpita`). Nessun disco, nessuna rete, nessun
// process.env implicito: l'istante e l'ambiente arrivano da fuori, così una prova può metterli dove
// vuole.

import { oreDaTimbro } from "./ora-piacenza.mjs";

/** Le tre risposte. Nomi, non booleani: un booleano ne conosce due e il terzo sparisce nel primo. */
export const FRESCO = "fresco";
export const STANTIO = "stantio";
export const NON_VISTO = "non_visto";

/** Il campo dove vive il timbro dentro un referto. Uno solo, uguale per tutti. */
export const CAMPO_TIMBRO = "timbro";

/**
 * I campi che i referti nati PRIMA di questa regola usano per dire quando sono stati scritti.
 * Si accettano come timbro (l'età si misura lo stesso) ma NON portano una scadenza: quella deve
 * arrivare dal registro, altrimenti il verdetto è ⚪ e non un verde.
 */
export const CAMPI_TIMBRO_STORICI = ["aggiornato", "data", "quando", "ultimo_controllo"];

/**
 * IL REGISTRO UNICO DI FRESCHEZZA (AR-215 ②) — «file → età massima → chi lo rigenera».
 *
 * Prima esisteva un guardiano per-file, aggiunto ogni volta che un file specifico invecchiava
 * abbastanza da farsi notare (freschezza-checklist, freschezza-okr, freschezza-intelligence,
 * freschezza-cadenze). Quattro toppe non fanno una regola: ogni file NUOVO nasceva scoperto e si
 * scopriva stantio solo per incidente. Qui la tabella è una, e chi non è in tabella non dovrebbe
 * poter essere mostrato in Cabina come se fosse di adesso.
 *
 * `percorso` è relativo a `MyCity-Vault/90-Memoria-AI/`.
 * `dentro` (opzionale) dice quale ramo del documento porta il timbro vero: serve ai file il cui
 * `aggiornato` viene ritoccato da un altro programma mentre il contenuto resta di tre settimane fa —
 * è il meccanismo di AR-593, e senza questo campo il registro comprerebbe lui stesso il verde falso.
 */
export const REGISTRO_FRESCHEZZA = [
  {
    id: "mosse-nicola",
    percorso: "intenzioni-nicola.json",
    nome: "Le mosse di Nicola",
    scadenzaOre: 48,
    rigenera: "il giro (cervello/giro.sh) — a stato invariato deve CONFERMARE la data, non lasciarla",
    difetto: "AR-215",
  },
  {
    id: "checkup",
    percorso: "auto-coscienza/salute.json",
    nome: "Il referto del checkup",
    scadenzaOre: 26,
    rigenera: "node cervello/salute.mjs (mattina e sera sul VPS)",
    difetto: "AR-578",
  },
  {
    id: "esito-giro",
    percorso: "auto-coscienza/esito-giro.json",
    nome: "Com'è andato l'ultimo giro",
    scadenzaOre: 26,
    rigenera: "il giro (cervello/giro.sh), a ogni uscita",
    difetto: "AR-367",
  },
  {
    id: "cadenze",
    percorso: "auto-coscienza/esito-cadenze.json",
    nome: "Il battito delle cadenze",
    scadenzaOre: 30,
    rigenera: "ogni cadenza quando esce (cervello/registra-cadenza.mjs)",
    difetto: "AR-592",
  },
  {
    id: "quaderni",
    percorso: "auto-coscienza/chiusura-loop.json",
    nome: "I quaderni dei senior",
    scadenzaOre: 48,
    rigenera: "node cervello/chiusura-loop.mjs --sonda (nel giro)",
    difetto: "AR-595",
  },
  {
    id: "briefing",
    percorso: "ultimo-briefing.json",
    nome: "L'ultimo briefing",
    scadenzaOre: 26,
    rigenera: "il giro, quando scrive il briefing in 90-Memoria-AI/Briefing/",
    difetto: "AR-215",
  },
  {
    id: "pezzi",
    percorso: "auto-coscienza/cantiere-pezzi.json",
    nome: "Il quaderno dei pezzi nuovi",
    scadenzaOre: 24 * 30,
    rigenera: "node cervello/sincronizza-proposte.mjs (nel giro)",
    difetto: "AR-581",
  },
];

/**
 * I compiti che la review del venerdì DEVE lasciare (AR-593), con la loro età massima.
 *
 * Perché non basta guardare i file: `auto-miglioramento.json` porta `aggiornato: oggi` perché un
 * altro programma glielo riscrive a ogni giro, mentre l'ultimo progresso del benchmark è del 24
 * luglio. Misurare la freschezza sul file invece che sul COMPITO è la stessa malattia già curata una
 * volta un piano più giù — «si controlla che la sveglia sia carica, mai che qualcuno si sia alzato» —
 * tornata su: adesso si controlla che si sia alzato, non che abbia fatto i compiti.
 *
 * 9 giorni e non 7: un venerdì saltato per un ponte non è un guasto, due di fila sì.
 */
export const COMPITI_DELLA_REVIEW = [
  { id: "benchmark", nome: "Il confronto coi migliori", file: "auto-coscienza/auto-miglioramento.json", dentro: "benchmark", scadenzaOre: 24 * 9 },
  { id: "peer-review", nome: "La peer review fra senior", file: "auto-coscienza/auto-miglioramento.json", dentro: "peer_review", scadenzaOre: 24 * 9 },
  { id: "calibrazione", nome: "La calibrazione previsto-vs-reale", file: "auto-coscienza/calibrazione.json", dentro: "registro", scadenzaOre: 24 * 9 },
  { id: "lettera", nome: "La lettera a Nicola", file: "auto-coscienza/LETTERA-A-NICOLA.md", dentro: null, scadenzaOre: 24 * 9 },
];

// ─────────────────────────────────────────────────────────────────────────────
// ① IL TIMBRO — chi, quando, da dove, e fino a quando vale
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Da dove è stata presa una misura (AR-286). Si deduce dall'ambiente, non si indovina:
 *   · `vps`    — la casa del server, dove ci sono le chiavi e si vede tutto;
 *   · `cloud`  — una sessione dell'agente: da lì il VPS si vede solo di riflesso;
 *   · `locale` — il computer di casa.
 * L'ambiente arriva da fuori apposta: una funzione che legge `process.env` da sé non si può provare
 * in tutte e tre le case.
 */
export function ambienteDi(env = {}) {
  if (env.MYCITY_ORIGINE) return String(env.MYCITY_ORIGINE);
  if (env.SALUTE_CASA === "vps" || env.VPS === "1" || env.MYCITY_VPS === "1") return "vps";
  if (env.CLAUDE_CODE_REMOTE || env.CODESPACES || env.CI) return "cloud";
  return "locale";
}

/**
 * I NOMI delle chiavi presenti, mai i valori.
 *
 * Serve a rispondere alla domanda che oggi nessun referto sa reggere: «questa misura l'ha scritta
 * uno che poteva vedere?». Un elenco di nomi lo dice; un elenco di valori sarebbe un segreto
 * committato — quindi il valore non entra qui nemmeno per sbaglio, e la prova lo verifica.
 */
export function chiaviPresenti(nomi = [], env = {}) {
  return nomi.filter((n) => String(env[n] ?? "").trim() !== "");
}

/**
 * Il timbro da mettere ACCANTO AL DATO. Chi scrive un referto dichiara qui la sua scadenza: chi lo
 * legge non deve più saperla, e un file nuovo non nasce più scoperto.
 */
export function timbraReferto({ quando, scadenzaOre, scrittoDa, env = {}, chiavi = [] } = {}) {
  return {
    quando: String(quando ?? ""),
    scade_dopo_ore: Number(scadenzaOre),
    ambiente: ambienteDi(env),
    scritto_da: String(scrittoDa ?? ""),
    chiavi_presenti: chiaviPresenti(chiavi, env),
  };
}

/**
 * Il timbro dentro un referto già scritto. Tre strade, in ordine:
 *   ① `timbro` — la forma nuova, che porta anche la scadenza e la provenienza;
 *   ② un campo storico (`aggiornato`, `data`…) — l'età si misura, la scadenza no;
 *   ③ niente — e allora non c'è nessun modo onesto di dire che il referto è fresco.
 * `dentro` (opzionale) fa cercare il timbro in un ramo del documento invece che in cima: serve
 * quando la cima la riscrive un altro programma (AR-593).
 */
export function leggiTimbro(dato, { dentro = null } = {}) {
  if (dato == null || typeof dato !== "object") return null;
  if (dentro) {
    const quando = ultimaDataDentro(dato[dentro]);
    return quando ? { quando, scadenzaOre: null, ambiente: null, scrittoDa: null, campo: `${dentro} (data più recente)` } : null;
  }
  const t = dato[CAMPO_TIMBRO];
  if (t && typeof t === "object" && String(t.quando ?? "").trim()) {
    const s = Number(t.scade_dopo_ore);
    return {
      quando: String(t.quando),
      scadenzaOre: Number.isFinite(s) && s > 0 ? s : null,
      ambiente: t.ambiente ?? null,
      scrittoDa: t.scritto_da ?? null,
      campo: CAMPO_TIMBRO,
    };
  }
  for (const c of CAMPI_TIMBRO_STORICI) {
    if (String(dato[c] ?? "").trim()) {
      return { quando: String(dato[c]), scadenzaOre: null, ambiente: null, scrittoDa: null, campo: c };
    }
  }
  return null;
}

/** La data più recente che si trova in un ramo del documento, scavando in tutti i suoi rami. */
export function ultimaDataDentro(nodo, campi = ["data", "quando", "aggiornato", "entro"]) {
  let migliore = null;
  let migliorMs = -Infinity;
  const scava = (x, profondita) => {
    if (profondita > 8 || x == null) return;
    if (Array.isArray(x)) {
      for (const y of x) scava(y, profondita + 1);
      return;
    }
    if (typeof x !== "object") return;
    for (const c of campi) {
      const v = x[c];
      if (typeof v !== "string") continue;
      const ms = Date.parse(v.slice(0, 10));
      if (Number.isFinite(ms) && ms > migliorMs) {
        migliorMs = ms;
        migliore = v;
      }
    }
    for (const y of Object.values(x)) scava(y, profondita + 1);
  };
  scava(nodo, 0);
  return migliore;
}

// ─────────────────────────────────────────────────────────────────────────────
// ② IL VERDETTO — fresco, stantio, o non l'ho potuto vedere
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Quanto è vecchio questo referto, e a che età smette di valere.
 *
 * @param {object} p
 * @param {object|null} p.dato          il referto già letto (null = il file non c'è / non si parsa).
 * @param {number|null} p.scadenzaOre   la scadenza del registro, usata SOLO se il dato non ne dichiara una.
 * @param {number} p.adessoMs           l'istante, da fuori: una decisione che legge l'orologio da sé non si prova.
 * @param {string} p.nome               come si chiama questo referto quando lo si racconta a Nicola.
 * @param {string|null} p.dentro        il ramo che porta il timbro vero (AR-593).
 * @returns {{stato: "fresco"|"stantio"|"non_visto", verde: boolean, eta_ore: number|null,
 *            scadenza_ore: number|null, quando: string|null, ambiente: string|null, nome: string,
 *            perche: string}}
 */
export function etaReferto({ dato, scadenzaOre = null, adessoMs, nome = "questo referto", dentro = null } = {}) {
  const esito = (stato, perche, extra = {}) => ({
    stato,
    // Il solo posto dove si decide cosa è verde. Un `stato !== "stantio"` sparso nei chiamanti
    // rimetterebbe ⚪ dalla parte del verde al primo che lo scrive di fretta.
    verde: stato === FRESCO,
    eta_ore: null,
    scadenza_ore: null,
    quando: null,
    ambiente: null,
    nome,
    perche,
    ...extra,
  });

  if (dato == null) return esito(NON_VISTO, `${nome}: il file non c'è o non si legge — non l'ho potuto vedere`);

  const timbro = leggiTimbro(dato, { dentro });
  if (!timbro) {
    return esito(
      NON_VISTO,
      `${nome}: non porta nessun timbro dentro il dato, e la data del file non vale (un git checkout la riscrive tutta) — non posso dire di quando è`,
    );
  }

  const ore = oreDaTimbroDiReferto(timbro.quando, adessoMs);
  if (ore === null) return esito(NON_VISTO, `${nome}: il timbro «${timbro.quando}» non si legge — non posso misurarne l'età`, { quando: timbro.quando });

  // Un timbro nel futuro non è freschissimo: è un orologio sbagliato da qualche parte, e vale
  // ⚪ come tutto ciò che non so leggere. Un'ora di tolleranza copre lo scarto fra due macchine.
  if (ore < -1) {
    return esito(NON_VISTO, `${nome}: il timbro «${timbro.quando}» è nel futuro di ${Math.round(-ore)} ore — c'è un orologio sbagliato, non mi fido`, {
      quando: timbro.quando,
      eta_ore: Number(ore.toFixed(2)),
    });
  }

  const scadenza = Number.isFinite(timbro.scadenzaOre) && timbro.scadenzaOre > 0 ? timbro.scadenzaOre : Number(scadenzaOre);
  if (!Number.isFinite(scadenza) || scadenza <= 0) {
    return esito(NON_VISTO, `${nome}: non dichiara a che età smette di valere e non è nel registro — «vecchio di ${eta(ore)}» da solo non è un verdetto`, {
      quando: timbro.quando,
      eta_ore: Number(ore.toFixed(2)),
      ambiente: timbro.ambiente,
    });
  }

  const comune = {
    eta_ore: Number(ore.toFixed(2)),
    scadenza_ore: scadenza,
    quando: timbro.quando,
    ambiente: timbro.ambiente,
  };
  if (ore > scadenza) {
    return esito(STANTIO, `${nome}: scritto ${eta(ore)} fa e vale ${eta(scadenza)} — quello che dice è di allora`, comune);
  }
  return esito(FRESCO, `${nome}: scritto ${eta(Math.max(ore, 0))} fa, dentro la scadenza di ${eta(scadenza)} che dichiara`, comune);
}

/**
 * L'età di un timbro di referto, in ore. `null` quando non si legge.
 *
 * L'unica cosa in più rispetto all'orologio di casa: un timbro di SOLO GIORNO («2026-07-24», come
 * lo scrivono i compiti della review) si legge come mezzogiorno di quel giorno. Senza questa riga
 * `msDaTimbro` lo rifiuta e il compito diventa ⚪ «timbro illeggibile» — cioè un difetto vero
 * (vent'anni di ritardo sul benchmark) verrebbe raccontato come un buco di misura. Mezzogiorno e
 * non mezzanotte: sbaglia al massimo di dodici ore su soglie da nove giorni, e non fa scattare un
 * allarme mezzo giorno prima del dovuto.
 */
export function oreDaTimbroDiReferto(quando, adessoMs) {
  const s = String(quando ?? "").trim();
  const soloGiorno = /^\d{4}-\d{2}-\d{2}$/.test(s);
  return oreDaTimbro(soloGiorno ? `${s} 12:00` : s, adessoMs);
}

/** «45» → «1 giorno e 21 ore»: l'età si legge a voce, non si calcola a mente. */
export function eta(ore) {
  const o = Number(ore);
  if (!Number.isFinite(o)) return "un tempo che non so";
  if (o < 1) return `${Math.max(0, Math.round(o * 60))} minuti`;
  if (o < 48) return `${Math.round(o)} ore`;
  const giorni = Math.floor(o / 24);
  const resto = Math.round(o - giorni * 24);
  return resto > 0 ? `${giorni} giorni e ${resto} ore` : `${giorni} giorni`;
}

/**
 * Il verdetto su un gruppo di referti — quello che un guardiano stampa alla fine.
 *
 * L'ordine conta ed è fail-closed: uno stantio è un rosso anche se tutti gli altri sono freschi
 * (un file vecchio mostrato al presente è già una bugia in Cabina); se non ci sono stantii ma
 * qualcosa non l'ho potuto vedere, il gruppo NON è verde — è ⚪, cioè copertura dichiarata.
 * Un gruppo vuoto è ⚪ e non verde: «non ho guardato niente» non è «va tutto bene».
 */
export function verdettoReferti(referti = []) {
  const lista = Array.isArray(referti) ? referti : [];
  const stantii = lista.filter((r) => r.stato === STANTIO);
  const nonVisti = lista.filter((r) => r.stato === NON_VISTO);
  const freschi = lista.filter((r) => r.stato === FRESCO);
  if (stantii.length) {
    return {
      stato: STANTIO,
      verde: false,
      stantii,
      nonVisti,
      freschi,
      perche: `${stantii.length} referti sono più vecchi della loro scadenza: ${stantii.map((r) => r.nome).join(", ")}`,
    };
  }
  if (nonVisti.length || !lista.length) {
    return {
      stato: NON_VISTO,
      verde: false,
      stantii,
      nonVisti,
      freschi,
      perche: lista.length
        ? `${nonVisti.length} referti non li ho potuti vedere: ${nonVisti.map((r) => r.nome).join(", ")}`
        : "non ho guardato nessun referto: non è un verde, è un buco",
    };
  }
  return { stato: FRESCO, verde: true, stantii, nonVisti, freschi, perche: `${freschi.length} referti tutti dentro la loro scadenza` };
}

// ─────────────────────────────────────────────────────────────────────────────
// ③ LA RICADUTA — perché un allarme già visto deve poter risuonare
// ─────────────────────────────────────────────────────────────────────────────
//
// AR-592 è tornato dopo essere stato chiuso il 4/8 con la frase «il server è tornato a pubblicare».
// Alla ricaduta non è comparsa nessuna card: e il motivo non è solo che mancava il freno. È che
// l'anti-spam di casa (dedup su firma, AR-114) è fatto per NON ripetersi su uno stato invariato —
// e un guasto che va via e torna produce, mesi dopo, la STESSA firma di prima. Cioè: la difesa che
// serve contro l'alert-fatigue è anche il modo in cui una ricaduta resta muta.
//
// La cura è che la firma porti dentro l'EPISODIO: da quando dura questo guasto. Stesso guasto, ma
// cominciato in un altro momento = firma diversa = l'allarme suona di nuovo. Non è un dettaglio di
// implementazione: è la differenza fra «ve l'ho già detto» e «sta succedendo un'altra volta».

/** La firma di un guasto: la sua gravità E l'istante in cui è cominciato. */
export function firmaEpisodio(scalino, inizio) {
  return `${String(scalino)}@${String(inizio ?? "inizio-sconosciuto")}`;
}

/**
 * Un contatore di giri consecutivi in cui una condizione è vera. Serve alle soglie che non devono
 * scattare al primo colpo («sotto il 50% per tre giri», AR-194): un solo giro storto può essere un
 * file scritto a metà, tre di fila sono una tendenza.
 */
export function giriConsecutivi(precedente, condizioneVera) {
  const n = Number(precedente);
  const base = Number.isFinite(n) && n > 0 ? n : 0;
  return condizioneVera ? base + 1 : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// ④ I CASI CHE USANO TUTTO IL RESTO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Il battito delle cadenze (AR-592): non «la sveglia è carica» ma «qualcuno si è alzato, e com'è
 * andata». Guarda l'ultima uscita di ogni cadenza registrata e risponde con l'episodio.
 *
 * @param {object} cadenze  la mappa `{nome: {quando, esito, codice}}` di esito-cadenze.json.
 * @param {object} p        `adessoMs` e la finestra oltre cui una cadenza «non si alza più».
 */
export function verdettoBattito(cadenze, { adessoMs, finestraOre = 30 } = {}) {
  const righe = Object.entries(cadenze || {}).map(([nome, c]) => {
    const ore = oreDaTimbroDiReferto(c?.quando, adessoMs);
    const riuscita = String(c?.esito ?? "") === "ok" || Number(c?.codice) === 0;
    return { nome, ore, riuscita, quando: c?.quando ?? null };
  });

  if (!righe.length) return { stato: NON_VISTO, verde: false, ferme: [], fallite: [], perche: "nessuna cadenza registrata: non posso dire se il ritmo gira", firma: null };
  const illeggibili = righe.filter((r) => r.ore === null);
  if (illeggibili.length === righe.length)
    return { stato: NON_VISTO, verde: false, ferme: [], fallite: [], perche: "nessuna cadenza porta un orario leggibile", firma: null };

  const ferme = righe.filter((r) => r.ore !== null && r.ore > finestraOre);
  const fallite = righe.filter((r) => !r.riuscita);
  // L'inizio dell'episodio: l'uscita RIUSCITA più recente. È il momento da cui il battito è fermo,
  // e cambia a ogni nuova ricaduta — che è tutto il punto della firma (vedi ③).
  const buone = righe.filter((r) => r.riuscita && r.quando).sort((a, b) => (a.ore ?? 0) - (b.ore ?? 0));
  const inizio = buone[0]?.quando ?? "mai";
  const oreFermo = ferme.length ? Math.max(...ferme.map((r) => r.ore)) : 0;

  if (!ferme.length && !fallite.length)
    return { stato: FRESCO, verde: true, ferme: [], fallite: [], perche: `tutte le ${righe.length} cadenze si sono alzate dentro le ${eta(finestraOre)}`, firma: null };

  const scalino = ferme.length ? `ferme-${Math.floor(oreFermo / 24)}gg` : `fallite-${fallite.length}`;
  return {
    stato: STANTIO,
    verde: false,
    ferme,
    fallite,
    ore_fermo: oreFermo,
    inizio,
    firma: firmaEpisodio(scalino, inizio),
    perche: ferme.length
      ? `${ferme.length} cadenze su ${righe.length} non escono da ${eta(oreFermo)} (${ferme.map((r) => r.nome).join(", ")})`
      : `${fallite.length} cadenze su ${righe.length} sono uscite male l'ultima volta (${fallite.map((r) => r.nome).join(", ")})`,
  };
}

/**
 * La squadra come numero (AR-194 e AR-595) — due domande diverse sullo stesso file:
 *   · quanti senior hanno MAI consegnato qualcosa (utilizzo reale);
 *   · quanti quaderni hanno una riga fresca (il loop che si chiude davvero).
 * E prima di tutte e due: quel file, di quando è? Una sonda che parla a un ascoltatore spento
 * continua a scrivere numeri veri di un mondo di ieri.
 */
export function verdettoSquadra({ totale, vuoti, fermi, sottoDaGiri = 0, sogliaUtilizzo = 0.5, sogliaFermi = 0.5 } = {}) {
  const tot = Number(totale);
  if (!Number.isFinite(tot) || tot <= 0)
    return { stato: NON_VISTO, verde: false, utilizzo: null, quotaFermi: null, perche: "la sonda dei quaderni non dice quanti senior ci sono: non posso misurare niente" };
  const conEsito = tot - (Number(vuoti) || 0);
  const utilizzo = conEsito / tot;
  const quotaFermi = (Number(fermi) || 0) / tot;
  const sotto = utilizzo < sogliaUtilizzo;
  return {
    stato: sotto || quotaFermi > sogliaFermi ? STANTIO : FRESCO,
    verde: !sotto && quotaFermi <= sogliaFermi,
    utilizzo: Number(utilizzo.toFixed(3)),
    quotaFermi: Number(quotaFermi.toFixed(3)),
    maiUsati: Number(vuoti) || 0,
    fermi: Number(fermi) || 0,
    totale: tot,
    // La soglia non scatta al primo giro storto: tre di fila sono una tendenza, uno è rumore.
    scattaUtilizzo: sotto && Number(sottoDaGiri) >= 3,
    perche: sotto
      ? `${vuoti} senior su ${tot} non hanno mai consegnato niente: utilizzo reale ${Math.round(utilizzo * 100)}% (soglia ${Math.round(sogliaUtilizzo * 100)}%)`
      : `utilizzo reale ${Math.round(utilizzo * 100)}%, ${fermi} quaderni fermi su ${tot}`,
  };
}
