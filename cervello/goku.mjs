#!/usr/bin/env node
// 🐉 GOKU — l'orologio e il diario del supervisore delle sessioni.
//
// PERCHÉ ESISTE. Nicola, 24/11/2026 22:12: «crea un qualcosa, che in ogni nuova sessione io ti dico
// "sei: goku", e tu ti metti a controllare/supervisionare/risolvere problemi di tutte le sessioni che
// sono state attive nell'ultima ora e continui a farlo per un'ora e quando stai per scadere mi avvisi».
//
// Il guardare e il riparare li fa la sessione, con la skill `.claude/skills/goku/SKILL.md`: servono gli
// strumenti delle sessioni (list_sessions, get_session, send_message, send_later), che un programma non
// ha. Questo file fa le tre cose meccaniche che una sessione sbaglia facilmente fra un risveglio e
// l'altro (regola ⑬ del manuale: «prima il programma»):
//   ① l'OROLOGIO: quanto manca, quando svegliarsi, quando dare l'avviso, quando chiudere;
//   ② la CATENA dei risvegli: ogni promemoria porta il suo numero di giro, e un promemoria doppio,
//      vecchio o di un turno già fermato si riconosce e non fa niente;
//   ③ il DIARIO: cosa è stato visto e fatto, sessione per sessione, e il resoconto finale.
//
// Lo stato vive in `cervello/_tmp_goku.json` (fuori da git, come tutte le misure di sessione). Se il
// contenitore riparte e il file sparisce, il promemoria porta con sé turno, inizio e scadenza: `giro`
// ricostruisce lo stato da lì e lo dice.
//
// USO
//   node cervello/goku.mjs inizia [--minuti 60] [--ogni 10] [--avviso 10] [--sessione <id>] [--forza]
//   node cervello/goku.mjs giro --turno <T> --giro <N> [--inizio <ISO> --scadenza <ISO> --ogni <M>]
//   node cervello/goku.mjs giro --manuale        (un giro chiesto da Nicola: non tocca la catena)
//   node cervello/goku.mjs segui <id> "<titolo>" [<id> "<titolo>" …]   ·   lascia <id> […]
//   node cervello/goku.mjs nota "<sessione>" "<cosa ho visto>" "<cosa ho fatto>" [risolto|tocca-a-te|in-corso|visto]
//   node cervello/goku.mjs proroga [--minuti 60]
//   node cervello/goku.mjs basta                  (Nicola ferma Goku prima della scadenza)
//   node cervello/goku.mjs fine                   (chiude il turno e scrive il resoconto)
//   node cervello/goku.mjs stato
//
// Per le prove: GOKU_ORA=<ISO> finge l'ora, GOKU_STATO e GOKU_RESOCONTI spostano i file in una
// cartella temporanea (scorciatoia 35: una prova non scrive mai nei file veri).

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
// ✍️ La penna condivisa, non `writeFileSync` crudo (AR-639): il freno della memoria vive lì dentro, e uno
// scrittore crudo del vault è una porta che nessun guardiano attraversa. La CI l'ha detto al primo push.
import { scriviJsonAtomico, scriviTestoAtomico } from "./scrivi-json.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);
const MIN = 60_000;

export const FILE_STATO = process.env.GOKU_STATO || join(QUI, "_tmp_goku.json");
export const CARTELLA_RESOCONTI = process.env.GOKU_RESOCONTI || join(REPO, "MyCity-Vault/90-Memoria-AI/goku");
export const PREDEFINITI = Object.freeze({ minuti: 60, ogni: 10, avviso: 10, finestra: 60 });
export const ESITI = Object.freeze(["risolto", "tocca-a-te", "in-corso", "visto"]);

export const adesso = () => (process.env.GOKU_ORA ? new Date(process.env.GOKU_ORA) : new Date());

const fmt = (d, opt) => new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", ...opt }).format(new Date(d));
/** «23:25», ora di Piacenza. */
export const hhmm = (d) => fmt(d, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
/** «2026-11-24 23:25», ora di Piacenza: il formato delle date in memoria. */
export const dataOra = (d) => new Date(d).toLocaleString("sv-SE", { timeZone: "Europe/Rome" }).slice(0, 16);
/** «20261124-232500»: con i secondi, così un `inizia --forza` nello stesso minuto non riusa l'id. */
export const idTurno = (d) =>
  new Date(d).toLocaleString("sv-SE", { timeZone: "Europe/Rome" }).replace(/[-:]/g, "").replace(" ", "-");

const intero = (v, def, min, max) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
};

/** Un turno nuovo. L'avviso non supera un terzo del turno: su 15 minuti arriva a 5, non a 10. */
export function nuovoTurno({ ora, minuti, ogni, avviso, sessione } = {}) {
  const t = new Date(ora ?? adesso());
  // Almeno 15 minuti: sotto, un risveglio in ritardo fa cadere l'avviso insieme alla fine (collaudo del 24/11).
  // Al massimo un giro ogni 10 minuti: la regola 1 vuole il ricontrollo di un messaggio urgente entro 10.
  const durata = intero(minuti, PREDEFINITI.minuti, 15, 480);
  const passo = intero(ogni, PREDEFINITI.ogni, 3, 10);
  const preavviso = Math.min(intero(avviso, PREDEFINITI.avviso, 1, 60), Math.max(1, Math.floor(durata / 3)));
  return {
    versione: 1,
    turno: idTurno(t),
    sessione: sessione || null,
    inizio: t.toISOString(),
    scadenza: new Date(+t + durata * MIN).toISOString(),
    // La finestra NON scorre: parte da un'ora prima dell'inizio e resta lì. Così una sessione ferma ad
    // aspettare un clic di Nicola — che non si aggiorna più — non esce dalla sorveglianza dopo un'ora.
    finestra_da: new Date(+t - PREDEFINITI.finestra * MIN).toISOString(),
    ogni: passo,
    avviso: preavviso,
    giro_atteso: 1,
    giri: 0,
    avvisato: false,
    fermato: false,
    finito: false,
    proroghe: 0,
    seguite: [],
    note: [],
  };
}

const giornoMese = (d) => fmt(d, { day: "2-digit", month: "2-digit" });
/** Il titolo della sessione. Vive sul server, quindi sopravvive al contenitore: è la memoria di riserva del turno. */
export const titolo = (stato, ora) =>
  stato.finito
    ? `Goku · finito alle ${hhmm(ora ?? stato.finito_alle)} (${giornoMese(ora ?? stato.finito_alle)})`
    : `Goku · fino alle ${hhmm(stato.scadenza)} (${giornoMese(stato.scadenza)})`;

/** Un'ora di Piacenza (anno, mese, giorno, ore, minuti) come istante vero. Due passate per il cambio d'ora. */
function daPiacenza(anno, mese, giorno, ore, minuti) {
  const scarto = (t) => {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Rome", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
      }).formatToParts(new Date(t)).map((x) => [x.type, x.value]),
    );
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - t;
  };
  const finto = Date.UTC(anno, mese - 1, giorno, ore, minuti);
  return new Date(finto - scarto(finto - scarto(finto)));
}

/**
 * Cosa dice il titolo della sessione: `{ finito: true }`, `{ scadenza: Date }`, oppure `null` se non è un
 * titolo di Goku. L'anno viene dalla scadenza del promemoria (il titolo porta solo giorno e mese).
 */
export function leggiTitolo(testo, scadenzaPromemoria) {
  const t = String(testo || "");
  if (!/^Goku\b/i.test(t.trim())) return null;
  if (/\bfinito\b/i.test(t)) return { finito: true };
  const m = t.match(/fino alle (\d{1,2}):(\d{2}) \((\d{1,2})\/(\d{1,2})\)/);
  if (!m) return null;
  const rif = new Date(scadenzaPromemoria || adesso());
  let d = daPiacenza(rif.getUTCFullYear(), +m[4], +m[3], +m[1], +m[2]);
  const SEI_MESI = 182 * 24 * 60 * MIN;
  if (+d - +rif > SEI_MESI) d = daPiacenza(rif.getUTCFullYear() - 1, +m[4], +m[3], +m[1], +m[2]);
  else if (+rif - +d > SEI_MESI) d = daPiacenza(rif.getUTCFullYear() + 1, +m[4], +m[3], +m[1], +m[2]);
  return { scadenza: d };
}

/** Il prossimo risveglio: il primo fra «fra un passo», l'ora dell'avviso (se non ancora dato) e la scadenza. */
export function prossimoRisveglio(stato, ora = adesso()) {
  const t = +new Date(ora);
  const scad = +new Date(stato.scadenza);
  const avvisoAlle = scad - stato.avviso * MIN;
  let bersaglio = t + stato.ogni * MIN;
  if (!stato.avvisato && avvisoAlle > t) bersaglio = Math.min(bersaglio, avvisoAlle);
  bersaglio = Math.min(bersaglio, scad);
  // Per difetto, non per eccesso: `send_later` arrotonda al minuto intero DOPO (misurato il 24/11: chiamato
  // alle 22:35:01 con 3 minuti, è partito alle 22:39:00), e fra il comando e la chiamata passa anche il tempo
  // di chi legge. Arrotondando per eccesso anche qui, l'avviso di un turno corto scivolava oltre la fine.
  const minuti = Math.max(1, Math.floor((bersaglio - t) / MIN));
  return { minuti, alle: new Date(t + minuti * MIN) };
}

/** Il testo del promemoria: porta tutto quello che serve per ripartire anche se lo stato è perso. */
export function messaggioRisveglio(stato, giro) {
  return (
    `GOKU · giro ${giro} del turno ${stato.turno}. Esegui: node cervello/goku.mjs giro --turno ${stato.turno} ` +
    `--giro ${giro} --inizio ${stato.inizio} --scadenza ${stato.scadenza} --ogni ${stato.ogni} ` +
    `--avviso ${stato.avviso}${stato.avvisato ? " --avvisato 1" : ""} — poi segui la skill goku (il giro).`
  );
}

/** Pura: dato lo stato e il promemoria arrivato, che fase è. */
export function decidiGiro(stato, { turno, giro, ora = adesso(), manuale = false } = {}) {
  if (!stato) return { fase: "ignora", motivo: "non c'è nessun turno di Goku in corso" };
  if (turno && turno !== stato.turno)
    return { fase: "ignora", motivo: `promemoria del turno ${turno}, ma il turno vivo è ${stato.turno}` };
  if (stato.fermato) return { fase: "ignora", motivo: `Nicola ha fermato Goku alle ${hhmm(stato.fermato_alle)}` };
  if (stato.titolo_finito) return { fase: "ignora", motivo: "il titolo della sessione dice che il turno è finito" };
  if (stato.finito) return { fase: "ignora", motivo: `il turno è già chiuso (alle ${hhmm(stato.finito_alle)})` };
  if (!manuale && giro != null && Number(giro) !== stato.giro_atteso)
    return {
      fase: "ignora",
      motivo: `promemoria doppio o vecchio: aspettavo il giro ${stato.giro_atteso}, è arrivato il ${giro}`,
    };
  const rimasti = (+new Date(stato.scadenza) - +new Date(ora)) / MIN;
  if (rimasti <= 1) return { fase: "fine", rimasti };
  // Un minuto e mezzo di tolleranza: il risveglio è chiesto per difetto e arriva al minuto intero dopo,
  // quindi può cadere fino a un minuto prima dell'ora esatta dell'avviso.
  if (!stato.avvisato && rimasti <= stato.avviso + 1.5) return { fase: "avviso", rimasti };
  return { fase: "giro", rimasti };
}

export function leggiStato(file = FILE_STATO) {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function scriviStato(stato, file = FILE_STATO) {
  scriviJsonAtomico(file, stato);
}

/**
 * Lo stato rifatto dal promemoria, quando il file è sparito (contenitore ripartito). Pretende il titolo della
 * sessione, che sta sul server: senza, un promemoria vecchio resusciterebbe un turno fermato con «basta», o
 * perderebbe una proroga (collaudo del 24/11, difetto 1). Il titolo vince sulla scadenza del promemoria.
 */
export function ricostruisci({ turno, giro, inizio, scadenza, ogni, avviso, avvisato, titolo: t }) {
  if (!turno || !inizio || !scadenza) return null;
  const letto = leggiTitolo(t, scadenza);
  const base = nuovoTurno({ ora: inizio, ogni, avviso: avviso ?? PREDEFINITI.avviso, minuti: 480 });
  const stato = {
    ...base,
    turno,
    avviso: intero(avviso, base.avviso, 1, 60),
    scadenza: new Date(letto?.scadenza ?? scadenza).toISOString(),
    giro_atteso: Number(giro) || 1,
    avvisato: Boolean(avvisato) && !(letto?.scadenza && +letto.scadenza > +new Date(scadenza)),
    ricostruito: true,
    titolo_letto: t || null,
  };
  if (letto?.finito) Object.assign(stato, { finito: true, finito_alle: adesso().toISOString(), titolo_finito: true });
  return stato;
}

/** Una voce nel diario. La stessa cosa sulla stessa sessione non si ripete: si aggiorna. */
export function aggiungiNota(stato, { sessione, cosa, fatto, esito = "visto" }, ora = adesso()) {
  if (!ESITI.includes(esito)) throw new Error(`esito «${esito}» sconosciuto: usa ${ESITI.join(", ")}`);
  const chiave = (s) => String(s || "").trim().toLowerCase();
  const quando = new Date(ora).toISOString();
  const gia = stato.note.find((n) => chiave(n.sessione) === chiave(sessione) && chiave(n.cosa) === chiave(cosa));
  if (gia) {
    Object.assign(gia, { fatto: fatto || gia.fatto, esito, ultima: quando, volte: gia.volte + 1 });
    return gia;
  }
  const nota = { sessione, cosa, fatto: fatto || "", esito, prima: quando, ultima: quando, volte: 1 };
  stato.note.push(nota);
  return nota;
}

export function conti(stato) {
  const c = { risolto: 0, "tocca-a-te": 0, "in-corso": 0, visto: 0 };
  for (const n of stato.note) c[n.esito] = (c[n.esito] || 0) + 1;
  return c;
}

const cella = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");

const plurale = (n, uno, tanti) => `${n} ${n === 1 ? uno : tanti}`;
/** «Ora del Gusto 2.0: ferma dal… Ho fatto: detto a Nicola.» — ogni voce compare una volta sola nel testo. */
const voce = (n, conFatto = true) =>
  `- **${n.sessione}**: ${n.cosa.replace(/[.\s]+$/, "")}.` + (conFatto && n.fatto ? ` Ho fatto: ${n.fatto.replace(/[.\s]+$/, "")}.` : "");

/**
 * Il resoconto del turno, coi quattro blocchi. Ogni voce del diario compare UNA volta nel testo (il
 * controllo di leggibilità boccia la stessa idea ripetuta), e le targhe stanno sotto «Dettagli tecnici».
 */
export function resoconto(stato, ora = adesso()) {
  const c = conti(stato);
  const problemi = c.risolto + c["tocca-a-te"] + c["in-corso"];
  const gruppo = (esito) => stato.note.filter((n) => n.esito === esito);
  const daTe = gruppo("tocca-a-te");
  const dalle = hhmm(stato.inizio);
  const alle = hhmm(ora);
  const pezzi = [
    c.risolto && `${plurale(c.risolto, "sistemato", "sistemati")} da me`,
    c["tocca-a-te"] && `${c["tocca-a-te"]} ${c["tocca-a-te"] === 1 ? "aspetta" : "aspettano"} te`,
    c["in-corso"] && `${c["in-corso"]} ancora in corso`,
  ].filter(Boolean);
  const esempio = stato.note[0]?.sessione;
  const elenco = (titolo, note) => (note.length ? ["", titolo, ...note.map((n) => voce(n))] : []);
  const righe = [
    "---",
    "tipo: resoconto-goku",
    `data: ${dataOra(ora)}`,
    `turno: ${stato.turno}`,
    `sessione: ${stato.sessione || "non indicata"}`,
    `dalle: ${dataOra(stato.inizio)}`,
    `alle: ${dataOra(ora)}`,
    `giri: ${stato.giri}`,
    "---",
    "",
    `# Goku, il turno dalle ${dalle} alle ${alle}`,
    "",
    "## In parole semplici",
    "Questo è il resoconto di Goku, la sessione che sorveglia le altre. Serve a sapere cosa è successo mentre non guardavi.",
    `Dalle ${dalle} alle ${alle} ho fatto ${plurale(stato.giri, "giro", "giri")}.` +
      (problemi ? ` Ho trovato ${plurale(problemi, "problema", "problemi")}: ${pezzi.join(", ")}.` : " Non ho trovato problemi."),
    esempio
      ? `Ogni cosa porta il titolo della sessione, così la ritrovi subito nell'elenco dell'app: per esempio «${esempio}».`
      : "",
    ...elenco("Sistemati da me:", gruppo("risolto")),
    ...elenco("Ancora aperti alla chiusura, da riguardare:", gruppo("in-corso")),
    ...elenco("Solo da tenere d'occhio:", gruppo("visto")),
    "",
    "## Cosa cambia per te",
    daTe.length
      ? `Ti ${daTe.length === 1 ? "resta una cosa" : `restano ${daTe.length} cose`} da fare, scritte qui sotto.`
      : "Niente: quello che ho visto è sistemato, oppure era solo da guardare.",
    "",
    "## Cosa devi fare",
    ...(daTe.length ? daTe.map((n) => voce(n)) : ["Niente."]),
    "",
    "## Cosa non ho verificato",
    "Ho guardato quello che gli strumenti dicono di ogni sessione: lo stato, il riassunto dell'ultimo turno, la storia usata, la quota e il costo.",
    "Il lavoro dentro una sessione l'ho riletto solo dove c'era un problema.",
    "Le richieste di unione le ho guardate solo quando una sessione le nominava.",
    "",
    "---",
    "**Dettagli tecnici**",
    "",
    `Turno \`${stato.turno}\`, sessione \`${stato.sessione || "?"}\`, un giro ogni ${stato.ogni} minuti, proroghe ${stato.proroghe}.` +
      (stato.ricostruito ? " Lo stato è stato ricostruito da un promemoria: il diario di prima è perso." : ""),
    "",
  ];
  if (stato.note.length) {
    righe.push("| Sessione | Esito | Prima volta | Ultima volta | Volte |", "|---|---|---|---|---|");
    for (const n of stato.note)
      righe.push(`| ${cella(n.sessione)} | ${n.esito} | ${hhmm(n.prima)} | ${hhmm(n.ultima)} | ${n.volte} |`);
  } else righe.push("Diario vuoto.");
  return righe.filter((r, i, a) => r !== false && !(r === "" && a[i - 1] === "")).join("\n") + "\n";
}

// ─────────────────────────────────────────────────────────────────────────────
// Le uscite: testo corto, una cosa per riga, pronto da copiare negli strumenti.
// ─────────────────────────────────────────────────────────────────────────────

/** I passi del giro. Al primo giro (e a un «guarda adesso») si scorre tutto l'elenco; dopo, la prima pagina e le seguite. */
export function passi(completo) {
  return [
    "passi del giro (skill goku):",
    completo
      ? "  1. list_sessions(mine:true, limit:30) pagina dopo pagina finché c'è has_more: l'elenco è per data di CREAZIONE, non di attività"
      : "  1. list_sessions(mine:true, limit:30) solo la prima pagina (le sessioni nuove), più get_session sulle seguite che lì non ci sono",
    "     tieni updated_at ≥ finestra; fuori te stesso e le archiviate; le nuove → node cervello/goku.mjs segui <id> \"<titolo>\"",
    "  2. per ognuna: status_bucket, needs_action, post_turn_summary; get_session su chi lavora, è bloccata o fallita (storia, quota, costo)",
    "  3. agisci secondo la tabella della skill; ogni cosa notata → node cervello/goku.mjs nota …",
    "  4. a Nicola: una riga se è tutto tranquillo, «Il punto adesso» se c'è da fare",
  ];
}

function stampaGiro(stato, giro, decisione, ora) {
  const scad = new Date(stato.scadenza);
  const out = [`🐉 GOKU · giro ${giro} · turno ${stato.turno}`, `fase: ${decisione.fase}`];
  if (decisione.fase === "ignora") {
    out.push(`motivo: ${decisione.motivo}`, "Non fare niente e non programmare altri risvegli: rispondi con una riga.");
    return out.join("\n");
  }
  const rimasti = Math.max(0, Math.round((+scad - +ora) / MIN));
  out.push(
    `adesso: ${hhmm(ora)} · scade: ${hhmm(scad)} (tra ${rimasti} min) · avviso: ${stato.avvisato ? "già dato" : `alle ${hhmm(+scad - stato.avviso * MIN)}`}`,
    `finestra: sessioni con updated_at ≥ ${stato.finestra_da} (cioè dalle ${hhmm(stato.finestra_da)})`,
  );
  const seguite = stato.seguite || [];
  const appenaRifatto = stato.ricostruito === true;
  if (appenaRifatto) out.push("⚠️ stato ricostruito dal promemoria e dal titolo: il diario e le seguite di prima sono persi, scorri tutto l'elenco.");
  if (seguite.length) out.push(`seguite (${seguite.length}): ${seguite.map((x) => `${x.titolo} = ${x.id}`).join(" · ")}`);
  out.push(...passi(giro <= 1 || decisione.manuale || appenaRifatto || !seguite.length));
  if (decisione.fase === "avviso")
    out.push(
      `push: Goku scade alle ${hhmm(scad)}, tra ${rimasti} minuti. Scrivi «goku ancora» per un'altra ora.`,
      "di' lo stesso in chat, con quello che resta aperto.",
    );
  if (decisione.fase === "fine") {
    out.push(
      "ultimo giro: fai i passi 1-4, poi `node cervello/goku.mjs fine`. Nessun promemoria nuovo.",
    );
  } else if (decisione.manuale) {
    out.push("giro chiesto a mano: la catena dei promemoria resta com'è, non programmare niente.");
  } else {
    const p = prossimoRisveglio(stato, ora);
    out.push(
      "  5. programma il prossimo risveglio SUBITO, prima di guardare le sessioni: UNO solo, con questi due valori",
      `prossimo risveglio → send_later delay_minutes=${p.minuti} (verso le ${hhmm(p.alle)})`,
      `messaggio: ${messaggioRisveglio(stato, giro + 1)}`,
    );
  }
  return out.join("\n");
}

/** Il cuore di `giro` e del primo giro di `inizia`: decide, aggiorna lo stato, stampa. */
export function eseguiGiro(stato, { turno, giro, manuale = false, ora = adesso() } = {}) {
  const numero = manuale ? stato?.giro_atteso ?? 0 : Number(giro ?? stato?.giro_atteso);
  const decisione = decidiGiro(stato, { turno, giro: numero, ora, manuale });
  decisione.manuale = manuale;
  if (decisione.fase !== "ignora") {
    stato.giri += 1;
    if (!manuale) stato.giro_atteso = numero + 1;
    if (decisione.fase === "avviso") stato.avvisato = true;
    stato.ultima_fase = decisione.fase;
  }
  const testo = stampaGiro(stato ?? { turno: turno ?? "?" }, numero, decisione, ora);
  // L'avviso «ricostruito» e la scansione intera valgono per il giro della ricostruzione, non per sempre.
  if (stato?.ricostruito === true && decisione.fase !== "ignora") stato.ricostruito = "dal giro " + numero;
  return { stato, testo, decisione };
}

function chiudi(stato, ora, { fermato = false } = {}) {
  if (fermato) Object.assign(stato, { fermato: true, fermato_alle: new Date(ora).toISOString() });
  Object.assign(stato, { finito: true, finito_alle: new Date(ora).toISOString() });
  const c = conti(stato);
  const out = [`🐉 GOKU · turno ${stato.turno} chiuso alle ${hhmm(ora)}${fermato ? " (fermato da Nicola)" : ""}`];
  if (stato.note.length) {
    const file = join(CARTELLA_RESOCONTI, `${dataOra(stato.inizio).replace(" ", "-").replace(":", "")}.md`);
    const scritto = scriviTestoAtomico(file, resoconto(stato, ora));
    out.push(
      scritto
        ? `resoconto: ${relative(REPO, scritto).startsWith("..") ? scritto : relative(REPO, scritto)}`
        : "resoconto: NON scritto, la memoria è in sola lettura: copialo in chat da `node cervello/goku.mjs stato`.",
    );
  } else out.push("resoconto: nessuno, il diario è vuoto (turno tranquillo: niente da scrivere, niente PR).");
  const problemi = c.risolto + c["tocca-a-te"] + c["in-corso"];
  out.push(
    `push: Goku ha finito (${hhmm(stato.inizio)}-${hhmm(ora)}): ${stato.giri} giri, ${problemi} problemi, ` +
      `${c.risolto} sistemati, ${c["tocca-a-te"]} aspettano te. Scrivi «goku ancora» per ripartire.`,
    `titolo: ${titolo(stato, ora)}`,
  );
  return out.join("\n");
}

function argomenti(argv) {
  const pos = [];
  const opz = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const k = a.slice(2);
      const v = argv[i + 1];
      if (v === undefined || v.startsWith("--")) opz[k] = true;
      else {
        opz[k] = v;
        i++;
      }
    } else pos.push(a);
  }
  return { pos, opz };
}

export function main(argv = process.argv.slice(2)) {
  const { pos, opz } = argomenti(argv);
  const comando = pos.shift();
  const ora = adesso();
  let stato = leggiStato();
  const vivo = stato && !stato.finito && !stato.fermato && +new Date(stato.scadenza) > +ora;

  switch (comando) {
    case "inizia": {
      if (vivo && !opz.forza) {
        console.log(
          `C'è già un turno vivo (turno ${stato.turno}) fino alle ${hhmm(stato.scadenza)}.\n` +
            "Per allungarlo: node cervello/goku.mjs proroga · per rifarlo da capo: inizia --forza",
        );
        return 2;
      }
      stato = nuovoTurno({ ora, minuti: opz.minuti, ogni: opz.ogni, avviso: opz.avviso, sessione: opz.sessione });
      const g = eseguiGiro(stato, { turno: stato.turno, giro: 1, ora });
      scriviStato(stato);
      console.log(`titolo: ${titolo(stato)}\n${g.testo}`);
      return 0;
    }
    case "giro": {
      // Si ricostruisce solo quando il file manca: un turno chiuso, fermato o diverso resta com'è,
      // e il promemoria che non gli appartiene esce «ignora».
      if (!stato && opz.turno && !opz.manuale) {
        if (typeof opz.titolo !== "string") {
          console.log(
            [
              `🐉 GOKU · giro ${opz.giro} · turno ${opz.turno}`,
              "fase: titolo",
              "Il file di stato non c'è (il contenitore è ripartito?). Prima di ricostruire serve il titolo di questa sessione,",
              "che sta sul server: get_session senza id, campo «title». Poi rilancia lo stesso comando aggiungendo in fondo",
              '--titolo "<il titolo, tale e quale>". Non programmare niente finché non l\'hai fatto.',
            ].join("\n"),
          );
          return 0;
        }
        stato = ricostruisci({
          turno: opz.turno, giro: opz.giro, inizio: opz.inizio, scadenza: opz.scadenza,
          ogni: opz.ogni, avviso: opz.avviso, avvisato: opz.avvisato, titolo: opz.titolo,
        });
        if (stato?.titolo_finito) {
          scriviStato(stato);
          console.log(`🐉 GOKU · giro ${opz.giro} · turno ${opz.turno}\nfase: ignora\nmotivo: il titolo della sessione dice che il turno è finito.\nNon fare niente e non programmare altri risvegli: rispondi con una riga.`);
          return 0;
        }
      }
      const g = eseguiGiro(stato, { turno: opz.turno, giro: opz.giro, manuale: Boolean(opz.manuale), ora });
      if (g.decisione.fase !== "ignora") scriviStato(stato);
      console.log(g.testo);
      return 0;
    }
    case "nota": {
      if (!stato) return console.log("Non c'è nessun turno di Goku: prima `inizia`."), 1;
      const [sessione, cosa, fatto, esito] = pos;
      if (!sessione || !cosa) return console.log('Uso: nota "<sessione>" "<cosa ho visto>" "<cosa ho fatto>" [esito]'), 1;
      let n;
      try {
        n = aggiungiNota(stato, { sessione, cosa, fatto, esito: esito || "visto" }, ora);
      } catch (e) {
        return console.log(e.message), 1;
      }
      scriviStato(stato);
      console.log(`nota ${n.volte > 1 ? `aggiornata (vista ${n.volte} volte)` : "aggiunta"}: ${n.sessione} · ${n.esito}`);
      return 0;
    }
    case "segui":
    case "lascia": {
      if (!stato) return console.log("Non c'è nessun turno di Goku: prima `inizia`."), 1;
      stato.seguite ||= [];
      if (comando === "lascia") {
        const via = new Set(pos);
        stato.seguite = stato.seguite.filter((x) => !via.has(x.id));
      } else {
        if (!pos.length || pos.length % 2) return console.log('Uso: segui <id> "<titolo>" [<id> "<titolo>" …]'), 1;
        for (let i = 0; i < pos.length; i += 2) {
          const [id, titolo] = [pos[i], pos[i + 1]];
          const gia = stato.seguite.find((x) => x.id === id);
          if (gia) gia.titolo = titolo;
          else stato.seguite.push({ id, titolo });
        }
      }
      scriviStato(stato);
      console.log(`seguite (${stato.seguite.length}): ${stato.seguite.map((x) => x.titolo).join(" · ") || "nessuna"}`);
      return 0;
    }
    case "proroga": {
      if (!stato) return console.log("Non trovo il turno (forse il contenitore è ripartito): riparti con `inizia`."), 1;
      if (stato.fermato) return console.log("Goku è stato fermato: per ripartire usa `inizia`."), 1;
      const minuti = intero(opz.minuti, PREDEFINITI.minuti, 15, 480);
      // Riapre anche dopo un giro in fase «fine»: lì nessun promemoria è più in volo (collaudo, difetto 4).
      const riapre = stato.finito || stato.ultima_fase === "fine" || +new Date(stato.scadenza) <= +ora;
      const base = riapre ? +ora : +new Date(stato.scadenza);
      Object.assign(stato, {
        scadenza: new Date(base + minuti * MIN).toISOString(),
        avvisato: false,
        finito: false,
        ultima_fase: riapre ? "proroga" : stato.ultima_fase,
        proroghe: stato.proroghe + 1,
      });
      scriviStato(stato);
      const out = [`titolo: ${titolo(stato)}`, `scadenza nuova: ${hhmm(stato.scadenza)} (+${minuti} min)`];
      if (riapre) {
        const p = prossimoRisveglio(stato, ora);
        out.push(
          "il turno era chiuso: la catena riparte da qui.",
          `prossimo risveglio → send_later delay_minutes=${p.minuti} (verso le ${hhmm(p.alle)})`,
          `messaggio: ${messaggioRisveglio(stato, stato.giro_atteso)}`,
        );
      } else out.push("il promemoria già programmato resta valido: non programmarne un altro.");
      console.log(out.join("\n"));
      return 0;
    }
    case "basta":
    case "fine": {
      if (!stato) return console.log("Non c'è nessun turno di Goku da chiudere."), 1;
      if (stato.finito) return console.log(`Il turno ${stato.turno} è già chiuso (alle ${hhmm(stato.finito_alle)}).`), 0;
      const testo = chiudi(stato, ora, { fermato: comando === "basta" });
      scriviStato(stato);
      console.log(
        testo +
          (comando === "basta" ? "\nil promemoria già programmato arriverà e non farà niente: lascialo stare." : ""),
      );
      return 0;
    }
    case "stato": {
      if (!stato) return console.log("Nessun turno di Goku."), 0;
      const c = conti(stato);
      console.log(
        [
          `🐉 GOKU · turno ${stato.turno} · ${stato.finito ? "chiuso" : vivo ? "vivo" : "scaduto"}`,
          `dalle ${hhmm(stato.inizio)} alle ${hhmm(stato.scadenza)} · giri fatti ${stato.giri} · prossimo giro atteso ${stato.giro_atteso}`,
          `seguite: ${(stato.seguite || []).length} · diario: ${stato.note.length} voci · ${c.risolto} risolte · ${c["tocca-a-te"]} a Nicola · ${c["in-corso"]} in corso · ${c.visto} viste`,
          ...stato.note.map((n) => `  - ${n.sessione}: ${n.cosa} → ${n.esito}`),
        ].join("\n"),
      );
      return 0;
    }
    default:
      console.log("Comandi: inizia · giro · segui · lascia · nota · proroga · basta · fine · stato (dettagli in testa al file).");
      return comando ? 1 : 0;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = main();
