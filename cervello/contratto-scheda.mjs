// 📇 IL CONTRATTO DI UNA SCHEDA DEL CANTIERE — da una scheda grezza al suo verdetto normalizzato.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE QUESTO FILE CURA: «la scheda mal formata chiude da sola»
// ─────────────────────────────────────────────────────────────────────────────
// Il cantiere dei difetti è un registro con un contratto: come si chiama la gravità, quali campi
// sono obbligatori, che forma deve avere la prova, come si timbra una chiusura. Quel contratto non
// è mai esistito in un posto solo. Ogni script se lo rileggeva a modo suo, e il registro ha finito
// per non saper leggere sé stesso. Misurato il 13/8/2026 sul cantiere vero (653 schede):
//
//   · 73 schede dichiarano `severita`, 580 dichiarano `gravita`. Stesso concetto, due nomi. Un
//     guardiano che legge un nome solo non dice «non lo so»: dice «va tutto bene» (AR-650).
//   · 48 schede aperte non-minori non dichiarano `impatto_crescita`: la coda per priorità non sa
//     dove metterle (AR-649).
//   · 32 schede non hanno affatto il campo `verifica`, che la prosa di auto-coscienza.md dichiara
//     OBBLIGATORIO da mesi. Una regola scritta in prosa che nessun guardiano verifica è la forma
//     più debole che esiste (AR-023).
//   · 53 schede CHIUSE portano un comando di prova che il motore non sa eseguire — e sono chiuse
//     tutte e 53, passate dalla porta a mano. Un metro che non misura una strada non la dichiara
//     scoperta: dice verde (AR-559).
//   · 24 schede chiuse portano una data senza l'ora, e l'allineatore delle radiografie sapeva
//     ancora scrivere `chiuso_il = ""` (AR-655).
//
// Il tratto comune non è nessuno di questi numeri: è che **il contratto viveva nella testa di ogni
// lettore**. Curare le schede a mano senza curare i lettori le fa tornare storte al primo giro.
// Quindi qui c'è UNA porta sola, e i quattro chiamanti — `cantiere-prove.mjs` (che classifica),
// `auto-fix.mjs` (che chiude), `allinea-scan-cantiere.mjs` (che allinea le radiografie) e i test —
// passano da qui.
//
// ─────────────────────────────────────────────────────────────────────────────
// IL CONTRATTO DI CASA A TRE ESITI (la regola che rende onesto tutto il resto)
// ─────────────────────────────────────────────────────────────────────────────
//   0 = PASSATO · 1 = VIOLAZIONE · 2 = NON HO POTUTO MISURARE
//
// Il terzo esito è il punto. Prima esistevano solo «verde» e «rosso», quindi tutto ciò che il
// motore non sapeva eseguire finiva in un «manuale» indistinguibile da un difetto che non era MAI
// stato pensato per chiudersi da solo. AR-559 e AR-336 sono la stessa lezione da due lati: una
// prova che il motore non sa eseguire e una prova mai più rieseguita sono entrambe «verde che non
// prova niente». La cura non è chiuderle: è che il motore DICHIARI ciò che non sa misurare.
//
// 🟢 Modulo PURO: nessun file, nessuna rete, nessun processo, nessun `process.env`. L'istante
// arriva sempre da fuori (lezione di ora-piacenza.mjs), così una prova può metterlo a gennaio.

import { FORMA_COMANDO_PROVA, MOTIVO_COMANDO_NON_AMMESSO } from "./forma-prova.mjs";
import { timbroOra } from "./ora-piacenza.mjs";

/** I tre esiti di casa. Mai un booleano nudo: «non lo so» deve poter essere detto. */
export const PASSATO = 0;
export const VIOLAZIONE = 1;
export const NON_MISURABILE = 2;

// ─────────────────────────── ① i nomi dei campi ───────────────────────────

/**
 * I nomi di campo fuori contratto e il loro nome canonico.
 *
 * `severita` è entrato con la radiografia totale del 13/8 (il workflow chiede `severita` allo
 * schema dei sotto-agenti, il cantiere storico si chiama `gravita`) e nessuno se n'è accorto
 * perché nessun guardiano leggeva il NOME del campo: leggevano il valore, e trovando `undefined`
 * concludevano «nessuna gravità dichiarata», che è un silenzio, non un errore.
 */
export const CAMPI_ALIAS = { severita: "gravita" };

/**
 * La gravità di una scheda, qualunque nome porti. LA PORTA UNICA: chi conta i bloccanti, chi
 * ordina per priorità e chi decide se il contratto è morbido devono leggere lo stesso valore,
 * o contano tre cose diverse chiamandole con lo stesso nome.
 */
export function gravitaDi(d) {
  return d?.gravita ?? d?.severita ?? null;
}

/** Con quale NOME questa scheda ha dichiarato la gravità: serve a costruire la lista di migrazione. */
export function campoGravita(d) {
  if (d?.gravita !== undefined) return "gravita";
  if (d?.severita !== undefined) return "severita";
  return null;
}

/** Le gravità che contano come «minore»: su queste il contratto dei campi resta morbido. */
export const GRAVITA_MINORI = new Set(["minore", "basso", "bassa"]);

/** Questa scheda è minore? (una gravità assente NON è minore: è un buco, e va vista) */
export function eMinore(d) {
  return GRAVITA_MINORI.has(String(gravitaDi(d)));
}

/**
 * I campi che questa scheda dichiara con un nome fuori contratto.
 * Torna [{campo, canonico, valore}] — la forma esatta che serve a chi scrive la migrazione dati.
 */
export function aliasFuoriContratto(d) {
  const out = [];
  for (const [alias, canonico] of Object.entries(CAMPI_ALIAS)) {
    if (d?.[alias] === undefined) continue;
    // Se porta ENTRAMBI i nomi non è un alias da rinominare: è una scheda con due verità dentro,
    // e va guardata a mano prima di toccarla.
    out.push({ campo: alias, canonico, valore: d[alias], anche_canonico: d[canonico] !== undefined });
  }
  return out;
}

// ─────────────────────────── ② la forma della prova ───────────────────────────

/**
 * Che forma ha questa prova. Una porta sola (era duplicata in `chiusura-dichiarata.mjs` e in due
 * lettori indipendenti: AR-344). Qui si aggiunge la distinzione che mancava — «umana DICHIARATA»
 * contro «nessuna prova»: la prima è una scelta scritta, la seconda è un silenzio.
 */
export function formaProvaScheda(v) {
  if (!v || typeof v !== "object") return "nessuna";
  if (v.comando !== undefined) return "comando";
  if (v.file && v.pattern) return "pattern";
  if (v.tipo === "umano" || v.tipo === "umana") return "umana";
  if (v.tipo === "da-riverificare") return "da-riverificare";
  return "altro";
}

/**
 * IL VERDETTO SU UNA PROVA — il cuore di AR-559.
 *
 * Torna sempre {codice, forma, eseguibile, motivo}, mai un booleano: il codice 2 esiste apposta
 * perché «il motore non sa eseguire questo comando» non deve poter somigliare né a un verde né a
 * una verifica umana. Prima tornavano tutti e due `esito: "manuale"`, ed è esattamente per questo
 * che 53 schede si sono chiuse su una prova che nessuno ha mai eseguito.
 *
 *   codice 0 → la prova si può valutare (un comando eseguibile, un pattern, un'umana DICHIARATA)
 *   codice 1 → il contratto è violato (nessuna prova, o una prova che dichiara una forma che non ha)
 *   codice 2 → la prova c'è ma il motore NON la sa eseguire: non è verde, non è rosso, è cieco
 */
export function verdettoProva(v) {
  const forma = formaProvaScheda(v);
  if (forma === "comando") {
    const c = String(v.comando || "").trim();
    if (!c) {
      return {
        codice: VIOLAZIONE,
        causa: "comando-vuoto",
        forma,
        eseguibile: false,
        debole: false,
        motivo: "la prova dichiara un comando e il comando è vuoto",
      };
    }
    if (!FORMA_COMANDO_PROVA.test(c)) {
      return {
        codice: NON_MISURABILE,
        causa: "comando-non-eseguibile",
        forma,
        eseguibile: false,
        debole: false,
        motivo: `il motore non sa eseguire "${c}" (${MOTIVO_COMANDO_NON_AMMESSO})`,
      };
    }
    return { codice: PASSATO, causa: null, forma, eseguibile: true, debole: false, motivo: `prova eseguibile: ${c}` };
  }
  if (forma === "pattern") {
    // Una prova a pattern si valuta, quindi non è cieca — ma non ESEGUE niente: cerca del testo e
    // ne deduce un verdetto. Resta ammessa (vietarla congelerebbe l'84% del cantiere, AR-444) e
    // resta marcata debole, perché il suo numero sta sotto un tetto che scende e non risale.
    return { codice: PASSATO, causa: null, forma, eseguibile: true, debole: true, motivo: `prova a pattern: ${v.file} ~ /${v.pattern}/` };
  }
  if (forma === "umana") {
    return { codice: PASSATO, causa: null, forma, eseguibile: false, debole: false, motivo: "verifica umana DICHIARATA: nessun guardiano la chiuderà, ed è scritto" };
  }
  if (forma === "da-riverificare") {
    return { codice: NON_MISURABILE, causa: "da-riverificare", forma, eseguibile: false, debole: false, motivo: "dichiarata da riverificare: nessuno l'ha ancora misurata" };
  }
  if (forma === "nessuna") {
    return { codice: VIOLAZIONE, causa: "senza-verifica", forma, eseguibile: false, debole: false, motivo: "nessun campo `verifica`: obbligatorio dal contratto (AR-023)" };
  }
  return {
    codice: VIOLAZIONE,
    causa: "forma-mentita",
    forma,
    eseguibile: false,
    debole: false,
    // Il caso AR-592: `{tipo:"comando", esito:"riprodotto"}` — dichiara di essere un comando e il
    // comando non c'è. È peggio di una prova assente: mente sulla propria forma.
    motivo: `prova di forma non riconosciuta (${JSON.stringify(Object.keys(v || {}))}): dichiara una forma che non ha`,
  };
}

// ─────────────────────────── ③ i campi obbligatori ───────────────────────────

/**
 * I campi che una scheda NON minore deve dichiarare per stare nel contratto.
 * `verifica` è qui per AR-023: era obbligatorio nella prosa di auto-coscienza.md e in nessun
 * guardiano — cioè non era obbligatorio.
 */
export const CAMPI_OBBLIGATORI = ["impatto_crescita", "nato", "verifica"];

/** Quali dei campi obbligatori mancano a questa scheda. Puro elenco, nessun giudizio. */
export function campiMancanti(d, campi = CAMPI_OBBLIGATORI) {
  return campi.filter((c) => !d?.[c]);
}

/**
 * AR-582/AR-649 — le schede NON minori aperte a cui manca `impatto_crescita` o `nato`.
 * (Il campo `verifica` ha il suo elenco separato, `schedeSenzaProva`: due malattie, due numeri,
 * due tetti che scendono. Mescolarle renderebbe illeggibile quale delle due sta migliorando.)
 */
export function schedeIncomplete(difetti = []) {
  const out = [];
  for (const d of difetti) {
    if (!d || d.stato === "chiuso") continue;
    if (eMinore(d)) continue;
    const manca = campiMancanti(d, ["impatto_crescita", "nato"]);
    if (manca.length) out.push({ id: d.id, gravita: gravitaDi(d), manca });
  }
  return out;
}

/**
 * AR-023 — LE SCHEDE SENZA PROVA. Il campo che permette a un difetto di chiudersi da solo era
 * obbligatorio per iscritto e non era un difetto di nessuno: nessun guardiano lo verificava.
 * Qui diventa un numero. Vale su TUTTE le schede non chiuse, minori comprese: una scheda senza
 * prova non può chiudersi da sola qualunque sia la sua gravità.
 */
export function schedeSenzaProva(difetti = []) {
  return (difetti || [])
    .filter((d) => d && d.stato !== "chiuso" && formaProvaScheda(d.verifica) === "nessuna")
    .map((d) => ({ id: d.id, gravita: gravitaDi(d), stato: d.stato }));
}

/**
 * AR-559 — LE PROVE CHE IL MOTORE NON SA ESEGUIRE, su TUTTO il registro (chiuse comprese).
 *
 * Il controllo `prova-orfana` del cancello guarda solo le schede toccate dal lotto in corso:
 * fuori da lì nessuno conta. E il conto che conta è proprio quello sulle CHIUSE, perché una
 * scheda chiusa su una prova che nessuno ha mai eseguito è un verde che non prova niente.
 */
export function proveNonMisurabili(difetti = []) {
  const out = [];
  for (const d of difetti || []) {
    if (!d) continue;
    const v = verdettoProva(d.verifica);
    if (v.codice !== NON_MISURABILE) continue;
    out.push({ id: d.id, stato: d.stato, gravita: gravitaDi(d), causa: v.causa ?? null, comando: d.verifica?.comando ?? null, motivo: v.motivo });
  }
  return out;
}

// ─────────────────────────── ④ il timbro di chiusura ───────────────────────────

/** La forma che una data di memoria deve avere: «AAAA-MM-GG HH:MM», fuso di Piacenza. */
export const RE_TIMBRO = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/;

/** Questo timbro è valido? (con l'ora, al minuto — la regola dell'orario di CLAUDE.md) */
export function timbroValido(q) {
  return RE_TIMBRO.test(String(q ?? ""));
}

/**
 * IL TIMBRO UNICO DI CHIUSURA (AR-575, allargato ad AR-655).
 *
 * Ogni strada che scrive `stato: "chiuso"` DEVE passare da qui: 74 schede sono finite in archivio
 * chiuse ma senza data, e il voto mensile (tasso-chiusura) non le contava — il freno anti-ricerche
 * ha strozzato la macchina su un contatore rotto (0,23 dichiarato, ~0,92 vero).
 *
 * Viveva in `auto-fix.mjs`, che lo esporta ancora. È sceso qui perché il SECONDO che chiude non
 * poteva chiamarlo: `allinea-scan-cantiere.mjs` chiude i findings delle radiografie, e importare
 * `auto-fix.mjs` gli avrebbe trascinato dentro una chiamata a git al solo caricamento del modulo.
 * Così ha fatto la cosa che fanno tutti quando la funzione giusta è irraggiungibile: se n'è
 * scritta una versione sua, `f.chiuso_il || d.chiuso_il || ""` — cioè la stringa vuota, la
 * malattia esatta di AR-575 su un altro registro. La lezione AR-172 è questa: il timbro sta
 * vicino al DATO, in un file che TUTTI possono importare.
 */
export function timbraChiusura(d, { come, quando, adesso = new Date() } = {}) {
  if (!d) throw new Error("timbraChiusura: nessuna scheda");
  const q = quando || timbroOra(adesso);
  if (!timbroValido(q)) {
    throw new Error(`timbraChiusura: data di chiusura senza ora ("${q}") — serve "AAAA-MM-GG HH:MM"`);
  }
  d.stato = "chiuso";
  d.chiuso_il = q;
  if (come !== undefined) d.chiuso_come = come;
  return d;
}

/**
 * Le schede CHIUSE con un timbro storto (assente, o senza l'ora). Il conto che AR-655 rende
 * possibile: 0 chiusure senza data oggi, ma 24 con la data secca — cioè il buco non è chiuso,
 * si è solo spostato di un campo.
 */
export function timbriStorti(difetti = []) {
  return (difetti || [])
    .filter((d) => d && d.stato === "chiuso" && !timbroValido(d.chiuso_il ?? d.chiuso))
    .map((d) => ({ id: d.id, chiuso_il: d.chiuso_il ?? d.chiuso ?? null }));
}

// ─────────────────────────── ⑤ le prove delle schede chiuse ───────────────────────────

/** Il file che un comando di prova esegue (`node cervello/x.mjs --flag` → `cervello/x.mjs`). */
export function fileDellaProva(comando) {
  const m = FORMA_COMANDO_PROVA.exec(String(comando || "").trim());
  return m ? m[2] : null;
}

/** Una prova che vive nella suite viene rilanciata da `test-cervello` a ogni lotto. */
export function nellaSuite(file) {
  return /^cervello\/test\/.+\.test\.mjs$/.test(String(file || ""));
}

/**
 * AR-336 — CHI RIGUARDA UN DIFETTO CHIUSO?
 *
 * `auto-fix.mjs` filtra `d.stato !== "chiuso"`: un difetto chiuso non viene MAI più verificato.
 * La scheda del 28/7 diceva «74 chiusi hanno una prova rieseguibile, ma 70 stanno nella suite,
 * quindi il buco vero è di QUATTRO». Rimisurato il 13/8 su 372 chiusi: 215 nella suite, **12**
 * fuori, 53 non eseguibili affatto, 69 a pattern, 23 senza prova. Il buco è triplicato mentre la
 * scheda diceva che era stretto — ed è il motivo per cui un numero va rimisurato, non ricordato.
 *
 * Torna i quattro gruppi separati, perché sono quattro rischi diversi:
 *   · `suite`        → la rete c'è: test-cervello li rilancia tutti a ogni lotto
 *   · `fuori_suite`  → rieseguibili ma nessuno li riesegue: il buco vero, ed è piccolo abbastanza
 *                      da poterlo chiudere davvero (una passata mirata, non 372 comandi)
 *   · `non_misurabili` → chiusi su una prova che il motore non sa eseguire (AR-559)
 *   · `senza_prova`  → chiusi e basta: niente da rieseguire, mai (AR-023 sul lato archivio)
 */
export function coperturaChiusi(difetti = []) {
  const g = { suite: [], fuori_suite: [], non_misurabili: [], deboli: [], senza_prova: [] };
  for (const d of difetti || []) {
    if (!d || d.stato !== "chiuso") continue;
    const v = verdettoProva(d.verifica);
    if (v.codice === NON_MISURABILE) {
      g.non_misurabili.push({ id: d.id, comando: d.verifica?.comando ?? null });
      continue;
    }
    if (v.forma === "comando" && v.eseguibile) {
      const file = fileDellaProva(d.verifica.comando);
      const voce = { id: d.id, comando: d.verifica.comando, file };
      (nellaSuite(file) ? g.suite : g.fuori_suite).push(voce);
      continue;
    }
    if (v.debole) g.deboli.push({ id: d.id, file: d.verifica?.file ?? null });
    else g.senza_prova.push({ id: d.id, forma: v.forma });
  }
  return g;
}

// ─────────────────────────── ⑥ i findings delle radiografie ───────────────────────────

/**
 * AR-360 — l'etichetta che dice al volano cosa fare di un finding.
 *
 * L'elenco è quello che lo schema dei sotto-agenti impone in `.claude/workflows/auto-radiografia.js`
 * (`genera: {type:'string', enum:[…]}`). Copiato qui perché il workflow è uno SCHEMA D'INGRESSO —
 * dichiarato a chi scrive, mai riverificato su ciò che è stato scritto — e la causa di sistema di
 * AR-360 è precisamente quella: «i contratti della macchina sono dichiarati all'ingresso e mai
 * riverificati all'uscita». Se un giorno l'enum del workflow cambia, il test lo dice.
 */
export const GENERA_AMMESSI = ["lezione", "auto-riscrittura", "sentinella", "nuovo-pezzo", "domanda-nicola", "solo-report"];

/**
 * Il verdetto su UN finding di radiografia: la sua etichetta `genera` è instradabile?
 * Chi non ce l'ha non è un errore di scrittura da bocciare e basta — è un finding che il volano
 * lascia cadere in silenzio, ed è il 57% di loro (163 su 286, misurato il 13/8; la scheda diceva
 * 45%, quindi il numero è peggiorato mentre nessuno lo guardava).
 */
export function verdettoFinding(f) {
  const g = f?.genera;
  if (g === undefined || g === null || String(g).trim() === "") {
    return { codice: VIOLAZIONE, genera: null, normalizzato: "solo-report", motivo: "`genera` mancante: il volano non sa dove instradarlo" };
  }
  const s = String(g).trim();
  if (!GENERA_AMMESSI.includes(s)) {
    return { codice: VIOLAZIONE, genera: s, normalizzato: "solo-report", motivo: `\`genera\` fuori dall'elenco ammesso: "${s}"` };
  }
  return { codice: PASSATO, genera: s, normalizzato: s, motivo: "instradabile" };
}

/** Tutti i findings di una radiografia che il volano non sa instradare. */
export function findingsFuoriContratto(rad) {
  const out = [];
  for (const dim of rad?.dimensioni || []) {
    for (const f of dim.findings || []) {
      const v = verdettoFinding(f);
      if (v.codice !== PASSATO) out.push({ dimensione: dim.key ?? null, titolo: String(f?.titolo || "").slice(0, 90), ...v });
    }
  }
  return out;
}

// ─────────────────────────── ⑦ il verdetto d'insieme ───────────────────────────

/**
 * DA UNA SCHEDA GREZZA AL SUO VERDETTO NORMALIZZATO — la funzione che i chiamanti chiamano.
 *
 * Un oggetto solo con tutto ciò che serve a decidere: gravità (da qualunque nome), se è minore,
 * che forma ha la prova e se il motore la sa eseguire, quali campi del contratto mancano, se il
 * timbro di chiusura regge. `codice` è il peggiore dei verdetti raccolti, con la regola di casa:
 * una VIOLAZIONE (1) batte un NON MISURABILE (2), perché un contratto rotto è un fatto accertato
 * mentre un cieco è una domanda aperta — e il fatto accertato va riparato per primo.
 */
export function normalizzaScheda(d) {
  const prova = verdettoProva(d?.verifica);
  const minore = eMinore(d);
  const chiusa = d?.stato === "chiuso";
  const manca = minore || chiusa ? [] : campiMancanti(d, ["impatto_crescita", "nato"]);
  const alias = aliasFuoriContratto(d);
  const timbroRotto = chiusa && !timbroValido(d?.chiuso_il ?? d?.chiuso);

  const violazioni = [];
  if (manca.length) violazioni.push(`campi mancanti: ${manca.join(", ")}`);
  if (alias.length) violazioni.push(`nomi di campo fuori contratto: ${alias.map((a) => `${a.campo}→${a.canonico}`).join(", ")}`);
  if (timbroRotto) violazioni.push(`chiusa con un timbro storto: ${JSON.stringify(d?.chiuso_il ?? d?.chiuso ?? null)}`);
  if (prova.codice === VIOLAZIONE) violazioni.push(prova.motivo);

  const codice = violazioni.length ? VIOLAZIONE : prova.codice === NON_MISURABILE ? NON_MISURABILE : PASSATO;

  return {
    id: d?.id ?? null,
    stato: d?.stato ?? null,
    gravita: gravitaDi(d),
    campo_gravita: campoGravita(d),
    minore,
    prova,
    campi_mancanti: manca,
    alias_fuori_contratto: alias,
    timbro_rotto: timbroRotto,
    codice,
    motivo: violazioni.length ? violazioni.join(" · ") : prova.motivo,
  };
}

/**
 * Il tetto che scende e non risale, per i numeri di questo contratto (prove non misurabili,
 * schede senza prova, alias). Stessa forma dei guardiani di casa: 0/1/2, mai un booleano.
 */
export function verdettoTettoDiscendente(conteggio, tetto) {
  if (typeof tetto !== "number" || !Number.isFinite(tetto)) {
    return { codice: NON_MISURABILE, motivo: "tetto non dichiarato: non ho potuto misurare", tettoNuovo: null };
  }
  if (conteggio > tetto) {
    return { codice: VIOLAZIONE, motivo: `cresciuto: ${conteggio} contro un tetto di ${tetto}`, tettoNuovo: null };
  }
  return {
    codice: PASSATO,
    motivo: conteggio < tetto ? `sceso: ${conteggio} (era ${tetto})` : `stabile a ${conteggio}`,
    tettoNuovo: conteggio < tetto ? conteggio : tetto,
  };
}
