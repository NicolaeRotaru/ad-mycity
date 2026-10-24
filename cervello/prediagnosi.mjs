#!/usr/bin/env node
// 🔎 PRE-DIAGNOSI DEL SITO — prima si scrive COME si ripara ogni difetto, poi si ripara.
//
// PERCHE' ESISTE. Nicola, 24/10/2026: «Dobbiamo risolverli nel minor tempo possibile, riesci a
// trovare un modo, magari capendo in anticipo come risolverli». Il conto delle ondate passate dice
// dove va il tempo, e non e' nel riparare:
//   • la prima ondata (16-17/10) ha riparato 21 difetti seri in tre giorni, con piu' di seicento lanci.
//     Sette riesami, ognuno con 15-27 difetti NATI dalla riparazione, quasi tutti nello stesso posto
//     (il rimborso dei contanti). Si e' chiusa semplificando, non con l'ottavo giro;
//   • su 1.256 schede del registro, 150 sono nate riguardando i file appena riparati;
//   • la migrazione 119 ha stretto un permesso e ha acceso un difetto che il permesso largo nascondeva.
// Ogni squadra scopriva DURANTE il lavoro cosa toccava, chi altro chiamava quel codice e se la
// funzione andava spenta invece che riparata. Qui lo si scopre PRIMA, una volta, e la squadra riceve
// la ricetta: se il difetto e' ancora vero, la causa comune, la modifica esatta, la prova che deve
// diventare rossa, cosa rischia di rompere, e la domanda per Nicola gia' scritta.
//
// I PASSI (il lavoro vero lo fa il workflow `.claude/workflows/prediagnosi.js`):
//   node cervello/prediagnosi.mjs prepara --cartella DIR      fascicoli + territori da dare al workflow
//   Workflow prediagnosi, una volta per modo (seri · minori · privata), con gli args stampati qui
//   node cervello/prediagnosi.mjs raccogli --cartella DIR JOURNAL...          il ricettario completo, fuori dal repo
//   node cervello/prediagnosi.mjs riservato --cartella DIR    i materiali per i revisori della riservatezza
//   Workflow prediagnosi, modo «riservatezza»: due revisori segnano i passaggi da oscurare
//   node cervello/prediagnosi.mjs raccogli --cartella DIR JOURNAL... --scrivi --riservato <journal della riservatezza> [--riservato <elenco>]
//   node cervello/prediagnosi.mjs ondate --ricettario FILE --repo <cartella del sito> [--parziale] [--scrivi]
//
// ⚠️ LA CORSIA RISERVATA. Il deposito della memoria e quello del sito sono PUBBLICI. Le falle di
// sicurezza ancora aperte si descrivono solo fuori di qui: `raccogli` scrive i risultati del modo
// «privata» SOLO dentro --cartella, e --cartella non puo' stare dentro un repository git (nemmeno
// passando da un collegamento simbolico). Nel ricettario pubblico di una falla resta il titolo, mai
// il testo. Il 24/10 tre ricette scritte per difetti PUBBLICI nominavano di passaggio una falla
// riservata, e la rilettura di quel pomeriggio ne ha trovate altre. Per questo `--scrivi` pubblica
// solo se: i due revisori della riservatezza sono tornati tutti e due, hanno riletto QUESTO testo
// (l'impronta), ogni campo che ripete una frase lunga o un nome che sta solo nelle falle è stato
// oscurato o giudicato già pubblico, e nessun campo oscurato in un ricettario pubblico di prima torna
// in chiaro senza un giudizio scritto. Lo prova cervello/test/prediagnosi.test.mjs.
//
// ⚠️ UNA CHIUSURA VUOLE DUE VOCI. Un difetto esce dal lavoro come «gia' risolto» solo se lo dice chi
// ha scritto la ricetta E il revisore che aveva il mandato di smentirlo. Una voce sola, o due voci in
// disaccordo, lo mandano da rivedere: chiudere per sbaglio un difetto vero costa piu' che ripararne
// uno gia' chiuso.
//
// Uscita: 0 = fatto · 2 = non ho potuto misurare (argomento storto, registro illeggibile, cartella
// nel posto sbagliato, journal senza risultati, oscuratura che manca il bersaglio, revisione della
// riservatezza incompleta, conti che non tornano). Ogni uscita 2 arriva PRIMA di qualunque scrittura.
// Mai un verde su zero. 🟢 legge, scrive solo dove gli dici.
import { readFileSync, readdirSync, mkdirSync, existsSync, realpathSync, statSync } from "fs";
import { createHash } from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { chiaveProblema } from "./referti-sito.mjs";
import { scriviJsonAtomico } from "./scrivi-json.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRO = "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json";
const RE_PRIVATA = /^Falla di sicurezza R\d+/;
const MAX_SERI = 11;
const MAX_MINORI = 30;
const PER_ONDATA = 5; // .claude/skills/cantiere/SKILL.md: «Tre-cinque corsie e' la misura giusta»
// Le due lenti del modo «riservatezza» del workflow: la pubblicazione le vuole tutte e due.
export const LENTI_RISERVATEZZA = ["riservato:istruzioni", "riservato:nomi"];

function cieco(perche) {
  console.error(`⚪ non ho potuto misurare: ${perche}`);
  process.exit(2);
}

// ── gli argomenti (letti solo quando il file è il comando, non quando la prova lo importa) ──────
const ESEGUITO = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const ARG = ESEGUITO ? process.argv.slice(2) : [];
const COMANDO = ARG[0];
const COMANDI = new Set(["prepara", "raccogli", "riservato", "ondate"]);
const NOTI = new Set(["--cartella", "--scrivi", "--ricettario", "--registro", "--repo", "--riservato", "--parziale"]);
const CON_VALORE = new Set(["--cartella", "--ricettario", "--registro", "--repo", "--riservato"]);
// --riservato si ripete: il journal dei revisori più gli elenchi di prima. Gli altri valgono una
// volta sola: un secondo --cartella che vince in silenzio sul primo è un errore da dire.
const RIPETIBILI = new Set(["--riservato"]);
const posizionali = [];
const opz = {};
function leggiArgomenti() {
  if (!COMANDI.has(COMANDO)) cieco(`il primo argomento è uno fra ${[...COMANDI].join(", ")}, non «${COMANDO ?? ""}»`);
  for (let i = 1; i < ARG.length; i++) {
    const a = ARG[i];
    if (a.startsWith("-")) {
      if (!NOTI.has(a)) cieco(`non conosco l'argomento ${a}`);
      if (CON_VALORE.has(a)) {
        if (!ARG[i + 1] || ARG[i + 1].startsWith("-")) cieco(`${a} vuole un valore dopo`);
        if (RIPETIBILI.has(a)) opz[a] = [...(opz[a] || []), ARG[++i]];
        else if (a in opz) cieco(`${a} si dà una volta sola`);
        else opz[a] = ARG[++i];
      } else opz[a] = true;
    } else posizionali.push(a);
  }
}

/**
 * La cartella di lavoro non deve stare dentro un repository: ci finiscono le falle riservate.
 * Si risale il percorso cercando `.git` (cartella, o file nei worktree), senza lanciare git: la prima
 * versione chiedeva a git e, se git falliva per qualunque motivo, rispondeva «no», cioè lasciava
 * scrivere. Su un controllo di riservatezza il dubbio deve chiudere, non aprire.
 */
export function dentroUnRepo(dir) {
  let d = path.resolve(dir);
  for (;;) {
    if (existsSync(path.join(d, ".git"))) return true;
    const su = path.dirname(d);
    if (su === d) return false;
    d = su;
  }
}
function cartella() {
  const dir = opz["--cartella"];
  if (!dir) cieco("serve --cartella, una cartella FUORI dai repository (per esempio lo scratchpad)");
  const assoluta = path.resolve(dir);
  // Si guarda il primo antenato che esiste, PRIMA di creare: una cartella nuova dentro il repo non
  // deve nascere nemmeno vuota. E si guarda il percorso VERO: un collegamento simbolico che porta
  // dentro un repository è dentro il repository (collaudo del 24/10).
  let esistente = assoluta;
  while (!existsSync(esistente)) esistente = path.dirname(esistente);
  const vera = realpathSync(esistente);
  if (dentroUnRepo(esistente) || dentroUnRepo(vera)) cieco(`${assoluta} sta dentro un repository git: le falle riservate finirebbero in un deposito pubblico`);
  mkdirSync(assoluta, { recursive: true });
  return assoluta;
}

function leggiRegistro() {
  const file = path.resolve(opz["--registro"] || path.join(ROOT, REGISTRO));
  let j;
  try {
    j = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    cieco(`non riesco a leggere ${file}: ${e.message}`);
  }
  if (!Array.isArray(j.problemi)) cieco(`${file} non ha piu' l'elenco «problemi»: il registro ha cambiato forma`);
  return j.problemi;
}

/** Ogni scrittura passa dalla penna condivisa (file mai a metà, freno della memoria): se il freno la ferma, è cieco. */
function scrivi(percorso, dati) {
  if (!scriviJsonAtomico(percorso, dati)) cieco(`la scrittura di ${percorso} è stata fermata dal freno della memoria`);
}

/**
 * Una scheda riservata ha due segni: il titolo «Falla di sicurezza R<n>» e il file «(nel referto
 * privato)». Riconoscerla dal titolo soltanto voleva dire che una squadra che lo ritocca la rende
 * pubblica (collaudo del 24/10). Basta un segno per trattarla da riservata; segni discordi sono un
 * registro da sistemare, e il comando si ferma. La fonte «id R<n>» NON è un segno: la radiografia dà
 * quel numero a ogni difetto, e sul registro vero del 24/10 lo portavano 265 schede pubbliche. Pura.
 */
export function segniRiservati(d) {
  return [RE_PRIVATA.test(String(d?.titolo || "")), /nel referto privato/i.test(String(d?.file || ""))];
}
export function eRiservata(d) {
  return segniRiservati(d).some(Boolean);
}
function fermaSeSegniDiscordi(aperti) {
  const discordi = aperti.filter((d) => eRiservata(d) && !segniRiservati(d).every(Boolean)).map((d) => d._idx);
  if (discordi.length) cieco(`${discordi.length} schede aperte hanno solo uno dei due segni di una falla riservata (titolo «Falla di sicurezza R…», file «(nel referto privato)»): idx ${discordi.slice(0, 12).join(",")} — rimetti i tre segni d'accordo nel registro`);
}

// ── prepara ────────────────────────────────────────────────────────────────────────────────────
/** Divide in pezzi da al piu' `max`, e fonde i pezzi piccoli finche' stanno sotto `max`. */
export function dividiPerGruppo(difetti, chiaveGruppo, max) {
  const gruppi = new Map();
  for (const d of difetti) {
    const g = chiaveGruppo(d) || "(senza gruppo)";
    if (!gruppi.has(g)) gruppi.set(g, []);
    gruppi.get(g).push(d);
  }
  const pezzi = [];
  for (const [g, xs] of gruppi) {
    xs.sort((a, b) => String(a.file || "").localeCompare(String(b.file || "")));
    const n = Math.ceil(xs.length / max);
    for (let i = 0; i < n; i++) {
      pezzi.push({ territorio: n > 1 ? `${g}-${i + 1}` : g, indici: xs.slice(i * max, (i + 1) * max).map((d) => d._idx) });
    }
  }
  pezzi.sort((a, b) => b.indici.length - a.indici.length);
  const grandi = pezzi.filter((p) => p.indici.length >= Math.ceil(max / 2));
  const fusi = [];
  for (const p of pezzi.filter((x) => x.indici.length < Math.ceil(max / 2))) {
    const ultimo = fusi[fusi.length - 1];
    if (ultimo && ultimo.indici.length + p.indici.length <= max) {
      ultimo.territorio += `+${p.territorio}`;
      ultimo.indici.push(...p.indici);
    } else fusi.push({ territorio: p.territorio, indici: [...p.indici] });
  }
  return [...grandi, ...fusi];
}

/** I territori di «prepara»: le falle riservate stanno solo fra i privati, mai fra seri e minori. Pura. */
export function territoriDaPreparare(aperti) {
  const privati = aperti.filter(eRiservata);
  const seri = aperti.filter((d) => d.severita !== "minore" && !eRiservata(d));
  const minori = aperti.filter((d) => d.severita === "minore" && !eRiservata(d));
  return {
    seri: dividiPerGruppo(seri, (d) => d.dimensione, MAX_SERI),
    // I minori portano il nome del gruppo con «minori-» davanti: con lo stesso nome dei seri, un
    // giudizio dato a una copia finiva sull'altra (collaudo del 24/10).
    minori: dividiPerGruppo(minori, (d) => `minori-${d.dimensione}`, MAX_MINORI),
    privati: privati.map((d) => ({ idx: d._idx, id: (d.titolo.match(/R\d+/) || [""])[0], severita: d.severita, categoria: (d.titolo.match(/\(([^)]+)\)/) || [])[1] || "", si_ripara: (String(d.fonte_radiografia || "").match(/si ripara: ([\w-]+)/) || [])[1] || "" })),
    conti: { seri: seri.length, minori: minori.length, privati: privati.length },
  };
}

function prepara() {
  const dir = cartella();
  const tutte = leggiRegistro().map((d, i) => ({ ...d, _idx: i, _chiave: chiaveProblema(d) }));
  const aperti = tutte.filter((d) => d.stato === "aperto");
  if (!aperti.length) cieco("il registro non ha difetti aperti: niente da pre-diagnosticare (o il campo «stato» ha cambiato nome)");
  fermaSeSegniDiscordi(aperti);
  const territori = territoriDaPreparare(aperti);
  const conta = (xs) => xs.reduce((s, t) => s + t.indici.length, 0);
  // Il controllo viene PRIMA delle scritture, come promette l'intestazione.
  if (conta(territori.seri) !== territori.conti.seri || conta(territori.minori) !== territori.conti.minori) cieco("un difetto si è perso nella divisione in territori");
  mkdirSync(path.join(dir, "difetti"), { recursive: true });
  for (const d of aperti) scrivi(path.join(dir, "difetti", `${d._idx}.json`), d);
  scrivi(path.join(dir, "territori.json"), territori);
  console.log(`🔎 PRE-DIAGNOSI — preparata in ${dir}`);
  console.log(`Aperti: ${aperti.length} · seri ${territori.conti.seri} in ${territori.seri.length} territori · minori ${territori.conti.minori} in ${territori.minori.length} gruppi · falle riservate ${territori.conti.privati}.`);
  console.log(`Poi: Workflow .claude/workflows/prediagnosi.js con args {cartella: "${dir}", modo: "seri", territori: <territori.json → seri>} — e lo stesso per «minori».`);
  console.log(`Per le falle riservate il modo «privata» vuole le aree scritte a mano: {area, db, schede, cosa} (formato nel passo ⓪ di cervello/lotto-a-pacchetti.md). Le schede sono in territori.json → privati.`);
  console.log(`I territori per dimensione sono il punto di partenza: se il lotto chiede territori per mestiere (soldi, contanti, iscrizioni…), riscrivili in territori.json prima di lanciare.`);
}

// ── raccogli ───────────────────────────────────────────────────────────────────────────────────
/**
 * Ogni risultato d'agente di un journal di workflow: { label, result }. Il journal scrive l'etichetta
 * sulla riga «started» e il risultato su una riga «result» che porta solo agentId e key: le due righe
 * si uniscono per agentId (o per key). Un risultato senza etichetta ritrovabile si scarta e si conta,
 * non si indovina. Pura: la prova la esegue.
 */
export function risultatiDalJournal(testo) {
  const etichette = new Map();
  const partiti = new Map();
  const tornati = new Set();
  const fuori = [];
  let senzaEtichetta = 0;
  let illeggibili = 0;
  for (const riga of testo.split("\n")) {
    if (!riga.trim()) continue;
    let e;
    try {
      e = JSON.parse(riga);
    } catch {
      // Una riga a metà (il workflow scriveva mentre leggo) si conta e si dice, non si ingoia.
      illeggibili++;
      continue;
    }
    if (e.label) {
      if (e.agentId) etichette.set(`a:${e.agentId}`, e.label);
      if (e.key) etichette.set(`k:${e.key}`, e.label);
      if (e.type === "started") partiti.set(e.agentId || e.key, e.label);
    }
    const risultato = e.result;
    if (!risultato || typeof risultato !== "object") continue;
    tornati.add(e.agentId || e.key);
    fuori.push({ label: e.label, agentId: e.agentId, key: e.key, result: risultato });
  }
  // L'etichetta si cerca DOPO aver letto tutto: la riga «result» può arrivare prima della «started».
  const conEtichetta = [];
  for (const r of fuori) {
    const label = r.label || etichette.get(`a:${r.agentId}`) || etichette.get(`k:${r.key}`);
    if (label) conEtichetta.push({ label, result: r.result });
    else senzaEtichetta++;
  }
  conEtichetta.senzaEtichetta = senzaEtichetta;
  conEtichetta.illeggibili = illeggibili;
  // Un revisore partito e mai tornato lascia i suoi difetti senza la sua voce: si dice chi.
  conEtichetta.persi = [...partiti].filter(([id]) => !tornati.has(id)).map(([, l]) => l);
  return conEtichetta;
}

/** Il verdetto di UNA combinazione di voci (una ricetta, una lente A, un revisore dei chiusi). Pura. */
export function verdettoFinale({ ricetta, lenteA, chiuso }) {
  if (!ricetta) return "senza_ricetta";
  const no = ricetta.ancora_vero === "no";
  if (lenteA) {
    // La lente dice «già chiuso»: chiude solo se lo dice anche la ricetta E la lente non si
    // contraddice da sola col suo «ancora vero» (collaudo del 24/10: otto lenti avevano scritto «si»).
    if (lenteA.verdetto === "gia_chiuso_confermato") return no && lenteA.ancora_vero_corretto === "no" ? "gia_risolto" : "da_rivedere";
    if (lenteA.verdetto === "non_reale") return "da_rivedere";
    if (lenteA.ancora_vero_corretto === "no" && !no) return "da_rivedere";
    // La ricetta dice «già chiuso» e la lente no: la ricetta è «niente da fare», e a una squadra
    // serve una ricetta vera.
    if (no) return "da_rivedere";
    return "da_riparare";
  }
  if (no) {
    if (chiuso && chiuso.gia_chiuso_confermato === true) return "gia_risolto";
    // Una voce sola, o il revisore che la smentisce: da rivedere, non da riparare con una ricetta vuota.
    return "da_rivedere";
  }
  return "da_riparare";
}

/**
 * Il verdetto di un difetto dalle sue voci, anche quando sono più d'una per tipo (il modo «lenti»
 * rilancia una lente già tornata, due territori parlano dello stesso difetto). Si guardano tutte le
 * combinazioni: se non danno lo stesso esito, il difetto va rivisto. Prima vinceva l'ultima voce letta,
 * e una chiusura dipendeva dall'ordine dei journal (collaudo del 24/10). Pura.
 */
export function verdettoDelleVoci({ ricette = [], lentiA = [], chiusi = [] }) {
  if (!ricette.length) return { esito: "senza_ricetta", discordi: false };
  const esiti = new Set();
  for (const r of ricette) for (const a of lentiA.length ? lentiA : [undefined]) for (const c of chiusi.length ? chiusi : [undefined]) esiti.add(verdettoFinale({ ricetta: r, lenteA: a, chiuso: c }));
  return esiti.size === 1 ? { esito: [...esiti][0], discordi: false } : { esito: "da_rivedere", discordi: true };
}

export const OSCURATO = "[riservato: il testo tocca una falla della corsia riservata, e sta fuori dal deposito pubblico]";

/** Il nome di un bersaglio, come lo scrivono i controlli: «difetto 7» o «territorio seri:soldi». */
const nomeDifetto = (d) => `difetto ${d.idx}`;
const nomeTerritorio = (t) => `territorio ${t.modo}:${t.territorio}`;

/**
 * Oscura nel ricettario PUBBLICO i campi che un revisore della riservatezza ha segnato: una ricetta
 * scritta per un difetto pubblico può nominare di passaggio una falla riservata (il 24/10 è successo
 * con tre). Entra un elenco [{idx | territorio, campi: ["ricetta.raggio", "lente_b.nascite_previste"]}].
 * Un campo segnato che non esiste, o un difetto che non c'è, è un errore: un'oscuratura che non trova
 * il suo bersaglio è un'oscuratura che non è avvenuta. Una voce con `pubblico: true` è il giudizio
 * opposto: il revisore ha guardato il campo e dice che rivela solo cose già pubbliche. Non si oscura,
 * ma il suo percorso torna in `lasciati`, e anche lui deve esistere. Un giudizio «pubblico» su un nome
 * di territorio che si ripete vuole il «modo»: largo va bene quando si oscura, non quando si lascia.
 * Una voce su un difetto che nel frattempo il registro ha chiuso (`decaduta`) non è un bersaglio
 * mancato: quel difetto non si pubblica più. Si conta e si dice, e non ferma niente (collaudo del
 * 24/10: un elenco del mattino nominava il 1138, chiuso alle 13:22, e ogni ripubblicazione si fermava).
 * Pura: torna { ricettario, oscurati (campi distinti), mancati, lasciati, contesi, decadute }.
 */
export function oscura(ricettario, elenco, { decaduta = () => false } = {}) {
  const copia = JSON.parse(JSON.stringify(ricettario));
  const oscurati = new Set();
  const mancati = [];
  const lasciati = [];
  const decadute = [];
  if (!Array.isArray(elenco)) return { ricettario: copia, oscurati: 0, mancati: ["l'elenco non è una lista"], lasciati, contesi: [], decadute };
  for (const voce of elenco) {
    const nome = voce && (voce.territorio ?? voce.idx);
    // Una voce scritta male («campo» al singolare, campi vuoto) non oscura niente: è un mancato,
    // non un successo da zero campi (collaudo del 24/10).
    if (!voce || !Array.isArray(voce.campi) || !voce.campi.length || voce.campi.some((c) => typeof c !== "string" || !c)) {
      mancati.push(`${nome ?? "voce senza bersaglio"}: «campi» deve essere una lista non vuota di percorsi`);
      continue;
    }
    if ((voce.territorio == null) === (voce.idx == null)) {
      mancati.push(`${nome ?? "voce"}: serve uno e uno solo fra «idx» e «territorio»`);
      continue;
    }
    // Un nome di territorio può ripetersi fra seri e minori: si oscurano TUTTI quelli con quel nome
    // (o quelli del «modo» indicato). Oscurare in più costa una domanda; in meno, una falla pubblica.
    const bersagli = voce.territorio != null
      ? (copia.territori || []).filter((t) => t.territorio === voce.territorio && (!voce.modo || t.modo === voce.modo))
      : (copia.difetti || []).filter((d) => d.idx === voce.idx);
    if (!bersagli.length) {
      if (voce.idx != null && decaduta(voce.idx)) decadute.push(voce.idx);
      else mancati.push(String(nome));
      continue;
    }
    if (voce.pubblico === true && bersagli.length > 1) {
      mancati.push(`${nome}: «già pubblico» su un nome che hanno ${bersagli.length} territori vuole il «modo»`);
      continue;
    }
    for (const bersaglio of bersagli) {
      for (const campo of voce.campi) {
        const parti = campo.split(".");
        let dove = bersaglio;
        for (const p of parti.slice(0, -1)) dove = dove && typeof dove === "object" ? dove[p] : undefined;
        const ultimo = parti[parti.length - 1];
        if (!dove || typeof dove !== "object" || !(ultimo in dove)) {
          mancati.push(`${nome}:${campo}`);
          continue;
        }
        const percorso = `${voce.territorio != null ? nomeTerritorio(bersaglio) : nomeDifetto(bersaglio)}.${campo}`;
        if (voce.pubblico === true) {
          lasciati.push(percorso);
          continue;
        }
        dove[ultimo] = OSCURATO;
        oscurati.add(percorso);
      }
    }
  }
  // Un revisore oscura, l'altro dice «già pubblico»: vince l'oscuratura, e il disaccordo si conta.
  // Le due lenti possono giudicare lo stesso campo: si contano i campi, non i giudizi.
  const unici = [...new Set(lasciati)];
  return { ricettario: copia, oscurati: oscurati.size, mancati, lasciati: unici, contesi: unici.filter((l) => oscurati.has(l)), decadute: [...new Set(decadute)] };
}

/**
 * I campi segnalati che nessun revisore ha giudicato: né oscurati, né dichiarati pubblici. Un
 * giudizio «già pubblico» vale per il percorso esatto che nomina, non per quello che c'è dentro:
 * esatto quando si apre (collaudo del 24/10: un «pubblico» su «ricetta» riapriva «ricetta.raggio»). Pura.
 */
export function nonGiudicate(copiate, lasciati) {
  return copiate.filter((c) => !lasciati.includes(c));
}

/**
 * L'elenco del riservato da un file: una lista di voci, l'uscita di un revisore {da_oscurare}, o il
 * journal del modo «riservatezza». Un campo lasciato vuoto («territorio: ""» accanto a un idx) è un
 * campo non scritto: le risposte strutturate dei revisori li riempiono così. Due bersagli scritti
 * davvero restano un errore, e oscura() lo ferma. I «giudicati_pubblici» di un revisore diventano
 * voci con `pubblico: true`.
 */
const senzaVuoti = (v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).filter(([, x]) => x !== "" && x !== null)) : v);
const dalRevisore = (r) => [
  ...(Array.isArray(r.da_oscurare) ? r.da_oscurare : []),
  ...(Array.isArray(r.giudicati_pubblici) ? r.giudicati_pubblici.map((v) => ({ ...v, pubblico: true })) : []),
];
const eRevisore = (x) => x && (Array.isArray(x.da_oscurare) || Array.isArray(x.giudicati_pubblici));
export function elencoRiservato(testo, nomeFile = "") {
  if (/\.jsonl$/.test(nomeFile)) {
    const voci = risultatiDalJournal(testo).filter((r) => r.label.startsWith("riservato:"));
    if (!voci.length) return null;
    return voci.flatMap((r) => dalRevisore(r.result)).map(senzaVuoti);
  }
  const j = JSON.parse(testo);
  if (Array.isArray(j)) return j.flatMap((x) => (eRevisore(x) ? dalRevisore(x) : [x])).map(senzaVuoti);
  if (eRevisore(j)) return dalRevisore(j).map(senzaVuoti);
  return j;
}

/**
 * Il lavoro dei revisori della riservatezza, da uno o più journal: quali lenti sono tornate, quali
 * sono partite e mai tornate, quanto hanno riletto e su quale testo (l'impronta). Il 24/10 un giro
 * era «a 1 su 2» mentre lo si poteva già usare per pubblicare. Pura.
 */
export function revisioneRiservatezza(journals, improntaDiOggi = null) {
  const risultati = journals.flatMap((t) => risultatiDalJournal(t).filter((r) => r.label.startsWith("riservato:")));
  const persi = journals.flatMap((t) => risultatiDalJournal(t).persi.filter((l) => l.startsWith("riservato:")));
  const tornate = new Set(risultati.map((r) => r.label));
  // Un giudizio «già pubblico» vale solo da una rilettura fatta su QUESTO testo: una rilettura di
  // prima, su un testo che poi è cambiato, zittiva gli allarmi di oggi (collaudo del 24/10). Le
  // oscurature invece valgono da qualunque rilettura: nascondere in più non apre niente.
  const valeOggi = (r) => improntaDiOggi == null || r.result.impronta === improntaDiOggi;
  return {
    voci: risultati.flatMap((r) => (valeOggi(r) ? dalRevisore(r.result) : (r.result.da_oscurare || []))).map(senzaVuoti),
    pubblici_ignorati: risultati.filter((r) => !valeOggi(r)).reduce((n, r) => n + (r.result.giudicati_pubblici || []).length, 0),
    tornate: [...tornate],
    persi: persi.filter((l) => !tornate.has(l)),
    lenti: risultati.map((r) => ({ label: r.label, controllati: r.result.controllati, impronta: r.result.impronta })),
  };
}

/**
 * Che cosa manca perché la revisione valga per QUESTO testo: tutte e due le lenti tornate, nessuna
 * persa, ognuna ha riletto qualcosa e l'ha fatto sull'impronta di oggi. Torna la lista dei motivi
 * (vuota = vale). Pura.
 */
export function revisioneIncompleta(rev, improntaDiOggi) {
  const motivi = [];
  for (const l of LENTI_RISERVATEZZA) {
    const sue = rev.lenti.filter((x) => x.label === l);
    if (!sue.length) motivi.push(`la lente «${l}» non è tornata`);
    else if (!sue.some((x) => Number(x.controllati) > 0)) motivi.push(`la lente «${l}» dice di aver riletto zero campi`);
    else if (!sue.some((x) => x.impronta === improntaDiOggi && Number(x.controllati) > 0)) motivi.push(`la lente «${l}» ha riletto un testo diverso da questo (impronta ${sue.map((x) => String(x.impronta || "assente")).join(", ")} contro ${improntaDiOggi})`);
  }
  if (rev.persi.length) motivi.push(`revisori partiti e mai tornati: ${rev.persi.join(", ")}`);
  return motivi;
}

// Le frasi copiate. Un revisore può non accorgersi che una ricetta pubblica ha ricopiato un pezzo di
// una falla riservata: il comando confronta le sequenze di otto parole dei testi riservati con il
// testo che sta per pubblicare. È una rete in più, non al posto dei revisori.
const LUNGA = 8;
function normalizza(t) {
  // Il punto, la barra e il trattino restano dentro le parole (lib/a.ts), non ai bordi: «rimborso.» a
  // fine frase è la stessa parola di «rimborso».
  return String(t || "").toLowerCase().replace(/[^\p{L}\p{N}_./-]+/gu, " ").trim().split(/\s+/).map((w) => w.replace(/^[./-]+|[./-]+$/g, "")).filter(Boolean);
}
export function sequenze(testo, n = LUNGA) {
  const p = normalizza(testo);
  const fuori = new Set();
  for (let i = 0; i + n <= p.length; i++) fuori.add(p.slice(i, i + n).join(" "));
  return fuori;
}

/**
 * Ogni testo che sta per diventare pubblico, col suo percorso («difetto 7.lente_b.nascite_previste»,
 * «territorio seri:soldi.cause_comuni.0.perche»). Tutti i campi del difetto, comprese le voci doppie:
 * la prima versione guardava solo ricetta e lenti, e una voce in più passava senza controllo. Pura.
 */
const CAMPI_DEL_REGISTRO = new Set(["idx", "chiave", "titolo", "severita", "dimensione", "esito", "riservato"]);
export function testiPubblici(ricettario) {
  const fuori = [];
  const visita = (o, dove) => {
    if (typeof o === "string") fuori.push([dove, o]);
    else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) visita(v, `${dove}.${k}`);
  };
  for (const d of ricettario.difetti || []) {
    if (d.riservato) continue;
    for (const [k, v] of Object.entries(d)) if (!CAMPI_DEL_REGISTRO.has(k)) visita(v, `${nomeDifetto(d)}.${k}`);
  }
  for (const t of ricettario.territori || []) for (const [k, v] of Object.entries(t)) if (k !== "territorio" && k !== "modo") visita(v, `${nomeTerritorio(t)}.${k}`);
  return fuori;
}

/**
 * I campi del ricettario pubblico che contengono una sequenza di otto parole di un testo riservato.
 * Le sequenze che stanno GIÀ in un testo pubblico (il registro dei difetti, il contesto dato a tutti
 * i revisori) non contano: lì non c'è niente da nascondere. Le altre si mandano ai revisori, che le
 * oscurano o le giudicano già pubbliche. Pura.
 */
export function frasiCopiate(pubblico, testiRiservati, giaPubblici = []) {
  const note = new Set();
  for (const t of giaPubblici) for (const q of sequenze(t)) note.add(q);
  const vietate = new Set();
  for (const t of testiRiservati) for (const q of sequenze(t)) if (!note.has(q)) vietate.add(q);
  if (!vietate.size) return [];
  return testiPubblici(pubblico).filter(([, t]) => [...sequenze(t)].some((q) => vietate.has(q))).map(([dove]) => dove);
}

// I nomi propri delle falle: funzioni, regole, tabelle (con un trattino basso) e file.
const RE_NOME = /[A-Za-z_][A-Za-z0-9_]*_[A-Za-z0-9_]+|[\w./[\]-]+\.(?:tsx?|sql|ya?ml|mjs|js|sh)\b/g;
/** I nomi che compaiono nelle falle riservate e in NESSUN testo già pubblico. Pura. */
export function nomiSoloRiservati(testiRiservati, giaPubblici = []) {
  const pubblico = giaPubblici.join("\n");
  const nomi = new Set();
  for (const t of testiRiservati) for (const m of String(t).matchAll(RE_NOME)) if (m[0].length > 5 && !pubblico.includes(m[0])) nomi.add(m[0]);
  return [...nomi];
}
/** I campi pubblici che nominano uno di quei nomi. Pura. */
export function campiConNomi(pubblico, nomi) {
  if (!nomi.length) return [];
  return testiPubblici(pubblico).filter(([, t]) => nomi.some((n) => t.includes(n))).map(([dove]) => dove);
}

/** Ogni testo dentro un valore JSON, uno per stringa: le frasi non si spezzano sulle virgolette. */
function stringheDi(o, fuori = []) {
  if (typeof o === "string") fuori.push(o);
  else if (o && typeof o === "object") for (const v of Object.values(o)) stringheDi(v, fuori);
  return fuori;
}
// Il contesto che tutti i revisori leggono, pubblico e dentro il repo: le sue frasi tornano uguali
// nelle due corsie senza che nessuna abbia copiato dall'altra.
const CONTESTO_PUBBLICO = [".claude/workflows/prediagnosi.js", "MyCity-Vault/90-Memoria-AI/STATO.md", "MyCity-Vault/90-Memoria-AI/registro-fatti.json", "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md"];
function testiGiaPubblici(problemi) {
  // I titoli e i testi delle schede riservate sono pubblici anche loro (il registro sta nel repo),
  // ma una frase o un nome che sta SOLO lì non va contato come già pubblico: si tolgono.
  const testi = stringheDi(problemi.filter((p) => !eRiservata(p)));
  for (const f of CONTESTO_PUBBLICO) if (existsSync(path.join(ROOT, f))) testi.push(readFileSync(path.join(ROOT, f), "utf8"));
  return testi;
}
/** Ogni testo della corsia riservata: falle intere, verifiche, mancate e note. */
export function testiDellaCorsiaRiservata(privata) {
  const testi = [];
  for (const { result } of privata) {
    for (const f of result.falle || []) testi.push(...stringheDi(f));
    for (const v of result.verdetti || []) testi.push(...stringheDi(v));
    if (result.mancate) testi.push(result.mancate);
    if (result.note) testi.push(result.note);
  }
  return testi.filter((t) => typeof t === "string" && t.length > 3);
}

/**
 * L'impronta del testo che si pubblica: i revisori la ricopiano dai loro materiali, e la
 * pubblicazione la ricalcola. Se il testo è cambiato dopo la rilettura (un territorio rifatto, un
 * journal in più), le impronte non tornano. Non dipende dall'ordine dei journal. Pura.
 */
export function impronta(ricettario, privata = ricettario.privata || []) {
  const ordina = (xs) => xs.map((x) => JSON.stringify(x)).sort();
  const difetti = (ricettario.difetti || []).filter((d) => !d.riservato).map((d) => {
    const voci = {};
    for (const k of ["ricetta", "lente_a", "lente_b", "chiuso"]) voci[k] = ordina([d[k], ...(d[`${k}_altre`] || [])].filter(Boolean));
    return [d.idx, d.chiave, voci];
  }).sort((a, b) => a[0] - b[0]);
  const territori = ordina(ricettario.territori || []);
  // Anche la corsia riservata: una falla trovata DOPO la rilettura è un testo che i revisori non
  // hanno visto, e la rilettura di prima non vale più (collaudo del 24/10).
  const corsia = testiDellaCorsiaRiservata(privata).slice().sort();
  return createHash("sha256").update(JSON.stringify({ difetti, territori, corsia })).digest("hex");
}

/**
 * La memoria delle oscurature: i campi che un ricettario pubblico di prima aveva oscurato. Un secondo
 * giro della riservatezza che non li rivede li rimetterebbe in chiaro in silenzio (collaudo del 24/10:
 * con i passi naturali le 34 oscurature del mattino sparivano). Si legge per CHIAVE del difetto. Pura.
 */
export function oscuratiPrima(ricettariPrima) {
  const fuori = [];
  for (const r of ricettariPrima) {
    for (const d of r.difetti || []) {
      if (d.riservato) continue;
      for (const [dove, t] of testiPubblici({ difetti: [d] })) if (t === OSCURATO) fuori.push({ chiave: d.chiave, campo: dove.slice(nomeDifetto(d).length + 1) });
    }
    for (const t of r.territori || []) for (const [dove, x] of testiPubblici({ territori: [t] })) if (x === OSCURATO) fuori.push({ territorio: t.territorio, modo: t.modo, campo: dove.slice(nomeTerritorio(t).length + 1) });
  }
  return fuori;
}
/**
 * Le oscurature di prima da rimettere sul testo di oggi: i campi oscurati in un ricettario pubblico
 * di prima che oggi sarebbero in chiaro, senza un giudizio «già pubblico» scritto. Il comando le
 * riapplica da sé, per chiave del difetto: la prima versione chiedeva all'operatore di ripassare gli
 * elenchi di prima, che in una sessione nuova non esistono più (collaudo del 24/10). Un territorio si
 * riconosce per nome e modo, anche col prefisso «minori-» che «prepara» oggi dà ai minori. Pura.
 */
const RE_VOCE = /^(ricetta|lente_a|lente_b|chiuso)(?:_altre\.\d+)?\.(.+)$/;
export function daRiapplicare(pubblico, prima, lasciati) {
  const prendi = (o, campo) => campo.split(".").reduce((x, k) => (x && typeof x === "object" ? x[k] : undefined), o);
  const fuori = new Map();
  for (const p of prima) {
    const bersaglio = p.chiave
      ? (pubblico.difetti || []).find((d) => d.chiave === p.chiave && !d.riservato)
      : (pubblico.territori || []).find((t) => t.modo === p.modo && (t.territorio === p.territorio || t.territorio === `minori-${p.territorio}` || `minori-${t.territorio}` === p.territorio));
    if (!bersaglio) continue;
    // Un campo di una voce («lente_a.motivo», «lente_a_altre.0.motivo») si cerca in TUTTE le voci
    // dello stesso tipo: quante sono e in che ordine stanno può cambiare fra due pubblicazioni, e
    // un percorso per posizione indicava la voce sbagliata (collaudo del 24/10, difetto 54).
    const m = p.chiave ? p.campo.match(RE_VOCE) : null;
    const campi = m ? [bersaglio[m[1]], ...(bersaglio[`${m[1]}_altre`] || [])].map((v, i) => (v ? (i === 0 ? `${m[1]}.${m[2]}` : `${m[1]}_altre.${i - 1}.${m[2]}`) : null)).filter(Boolean) : [p.campo];
    for (const campo of campi) {
      const v = prendi(bersaglio, campo);
      // Anche una lista o un oggetto oscurati per intero: qualunque valore non oscurato è in chiaro.
      if (v === undefined || v === OSCURATO) continue;
      const percorso = `${p.chiave ? nomeDifetto(bersaglio) : nomeTerritorio(bersaglio)}.${campo}`;
      if (lasciati.includes(percorso)) continue;
      fuori.set(percorso, p.chiave ? { idx: bersaglio.idx, campi: [campo] } : { territorio: bersaglio.territorio, modo: bersaglio.modo, campi: [campo] });
    }
  }
  return [...fuori].map(([percorso, voce]) => ({ percorso, voce }));
}
/** I percorsi dei campi oscurati prima che tornerebbero in chiaro. Pura. */
export function tornatiInChiaro(pubblico, prima, lasciati) {
  return daRiapplicare(pubblico, prima, lasciati).map((x) => x.percorso);
}
function ricettariPubbliciDiPrima() {
  const audit = path.join(ROOT, "consegne/audit");
  if (!existsSync(audit)) return [];
  const fuori = [];
  for (const f of readdirSync(audit).filter((x) => x.endsWith("ricettario-sito.json"))) {
    try {
      fuori.push(JSON.parse(readFileSync(path.join(audit, f), "utf8")));
    } catch (e) {
      cieco(`il ricettario pubblico di prima ${f} è illeggibile (${e.name}): senza, non so quali campi erano oscurati`);
    }
  }
  return fuori;
}

function raccogli() {
  const dir = cartella();
  if (!posizionali.length) cieco("dimmi i journal dei workflow: raccogli --cartella DIR <journal.jsonl> ...");
  if (opz["--scrivi"] && !opz["--riservato"]) {
    cieco("--scrivi vuole --riservato: il journal del modo «riservatezza» (più, se ci sono, gli elenchi delle riletture di prima). Il 24/10 tre ricette pubbliche nominavano una falla riservata.");
  }
  const voci = [];
  const revisoriPersi = [];
  for (const f of posizionali) {
    if (!existsSync(f)) cieco(`il journal ${f} non esiste`);
    const r = risultatiDalJournal(readFileSync(f, "utf8"));
    if (r.senzaEtichetta) console.log(`⚠️  ${f}: ${r.senzaEtichetta} risultati senza etichetta, scartati`);
    if (r.illeggibili) console.log(`⚠️  ${f}: ${r.illeggibili} righe illeggibili, scartate (journal scritto mentre lo leggevo?)`);
    revisoriPersi.push(...r.persi);
    voci.push(...r);
  }
  if (!voci.length) cieco("nessun risultato d'agente nei journal: workflow ancora in corso, o journal di un altro formato");
  // Un revisore perso in un giro ma tornato in un altro (il modo «lenti» rilancia apposta) non è perso.
  const tornate = new Set(voci.map((v) => v.label));
  const persiDavvero = [...new Set(revisoriPersi.filter((l) => !tornate.has(l)))];
  const registro = leggiRegistro();
  const tutte = registro.map((d, i) => ({ ...d, _idx: i, _chiave: chiaveProblema(d) }));
  const perIdx = new Map(tutte.map((d) => [d._idx, d]));
  fermaSeSegniDiscordi(tutte.filter((d) => d.stato === "aperto"));
  // L'idx è la POSIZIONE nel registro al momento di «prepara». Se fra la preparazione e la raccolta
  // un'altra sessione sposta le schede, una ricetta finirebbe sul difetto accanto. Il fascicolo dice
  // di quale difetto parlava: si riaggancia per chiave, e quello che non si ritrova si conta e si dice.
  // Senza il fascicolo non si può sapere: ci si ferma (collaudo del 24/10).
  const perChiave = new Map();
  for (const d of tutte) perChiave.set(d._chiave, perChiave.has(d._chiave) ? null : d._idx);
  const spostati = new Set();
  const persi = new Set();
  const senzaFascicolo = new Set();
  const dove = (idx) => {
    const f = path.join(dir, "difetti", `${idx}.json`);
    if (!existsSync(f)) {
      senzaFascicolo.add(idx);
      return idx;
    }
    let fascicolo;
    try {
      fascicolo = JSON.parse(readFileSync(f, "utf8"));
    } catch (e) {
      cieco(`il fascicolo ${f} è illeggibile: ${e.message}`);
    }
    const chiave = fascicolo._chiave || chiaveProblema(fascicolo);
    if (perIdx.get(idx)?._chiave === chiave) return idx;
    if (perChiave.get(chiave) != null) {
      spostati.add(idx);
      return perChiave.get(chiave);
    }
    persi.add(idx);
    return null;
  };
  const suRiservati = new Set();
  const doppie = { ricette: 0, lenti_a: 0, lenti_b: 0, chiusi: 0 };
  const metti = (mappa, tipo, idx, valore, territorio) => {
    const qui = dove(idx);
    if (qui == null) return;
    if (perIdx.get(qui) && eRiservata(perIdx.get(qui))) suRiservati.add(territorio || "(senza territorio)");
    const gia = mappa.get(qui) || [];
    // La stessa voce letta due volte (lo stesso journal passato due volte) non è una seconda voce.
    if (gia.some((x) => JSON.stringify(x) === JSON.stringify(valore))) return;
    if (gia.length) doppie[tipo]++;
    mappa.set(qui, [...gia, valore]);
  };
  const ricette = new Map(), lentiA = new Map(), lentiB = new Map(), chiusi = new Map();
  const territori = [];
  const privata = [];
  const interazioni = new Map();
  for (const { label, result } of voci) {
    const [tipo, ...resto] = label.split(":");
    const nome = resto.join(":") || result.territorio;
    if (tipo === "ricette" || tipo === "minori") {
      territori.push({ territorio: nome, descrizione: result.territorio, modo: tipo === "ricette" ? "seri" : "minori", cause_comuni: result.cause_comuni, ordine: result.ordine ?? "", conflitti: result.conflitti ?? "", semplificazioni: result.semplificazioni ?? "" });
      for (const r of result.ricette || []) metti(ricette, "ricette", r.idx, { ...r, territorio: nome }, nome);
    } else if (tipo === "lente-A") for (const v of result.verdetti || []) metti(lentiA, "lenti_a", v.idx, v, nome);
    else if (tipo === "lente-B") {
      for (const v of result.rischi || []) metti(lentiB, "lenti_b", v.idx, v, nome);
      // Lo schema la chiede, e prima si buttava via: i file toccati anche da altri territori.
      if (result.interazioni_fra_territori) interazioni.set(nome, [...new Set([...(interazioni.get(nome) || []), result.interazioni_fra_territori])]);
    } else if (tipo === "chiusi") for (const v of result.verdetti || []) metti(chiusi, "chiusi", v.idx, v, nome);
    else if (tipo === "privata" || tipo === "privata-v") privata.push({ label, result });
  }
  for (const [nome, testi] of interazioni) {
    const t = territori.find((x) => x.territorio === nome && x.modo === "seri");
    if (t) t.interazioni_fra_territori = testi.join("\n---\n");
    else territori.push({ territorio: nome, modo: "seri", interazioni_fra_territori: testi.join("\n---\n") });
  }
  // Un territorio pubblico che ha lavorato su una falla riservata porta il suo testo (cause comuni,
  // ordine) nel pubblico: si rifà quel territorio senza la falla. Si dice solo il nome.
  if (suRiservati.size) cieco(`ricette pubbliche su una falla riservata, nei territori: ${[...suRiservati].join(", ")} — rifalli senza le schede riservate`);
  if (senzaFascicolo.size) cieco(`${senzaFascicolo.size} difetti citati dai journal non hanno il fascicolo in ${path.join(dir, "difetti")} (idx ${[...senzaFascicolo].slice(0, 10).join(",")}): senza, una ricetta può finire sul difetto accanto. È la cartella di «prepara»?`);
  const aperti = tutte.filter((d) => d.stato === "aperto");
  if (!aperti.length) cieco("il registro non ha difetti aperti (o il campo «stato» ha cambiato nome)");
  const voce = [];
  let discordi = 0;
  const conAltre = (nome, xs) => (xs && xs.length > 1 ? { [`${nome}_altre`]: xs.slice(1) } : {});
  for (const d of aperti) {
    if (eRiservata(d)) {
      voce.push({ idx: d._idx, chiave: d._chiave, titolo: d.titolo, severita: d.severita, riservato: true });
      continue;
    }
    // Le voci doppie in un ordine che non dipende dall'ordine dei journal: chi oscura un campo di
    // una voce lo deve ritrovare nello stesso posto alla pubblicazione (collaudo del 24/10).
    const canonico = (xs) => [...(xs || [])].sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y)));
    const r = canonico(ricette.get(d._idx));
    const a = canonico(lentiA.get(d._idx));
    const b = canonico(lentiB.get(d._idx));
    const c = canonico(chiusi.get(d._idx));
    const v = verdettoDelleVoci({ ricette: r, lentiA: a, chiusi: c });
    if (v.discordi) discordi++;
    voce.push({ idx: d._idx, chiave: d._chiave, titolo: d.titolo, severita: d.severita, dimensione: d.dimensione, esito: v.esito, ricetta: r[0] || null, lente_a: a[0] || null, lente_b: b[0] || null, chiuso: c[0] || null, ...conAltre("ricetta", r), ...conAltre("lente_a", a), ...conAltre("lente_b", b), ...conAltre("chiuso", c) });
  }
  const estranei = [...ricette.keys()].filter((i) => !perIdx.has(i) || perIdx.get(i).stato !== "aperto");
  const conta = (f) => voce.filter(f).length;
  const sintesi = {
    aperti: aperti.length,
    riservati: conta((v) => v.riservato),
    con_ricetta: conta((v) => v.ricetta),
    senza_ricetta: conta((v) => v.esito === "senza_ricetta"),
    gia_risolti: conta((v) => v.esito === "gia_risolto"),
    da_rivedere: conta((v) => v.esito === "da_rivedere"),
    da_riparare: conta((v) => v.esito === "da_riparare"),
    voci_in_disaccordo_sull_esito: discordi,
    voci_doppie: doppie,
    seri_senza_lente_a: conta((v) => v.ricetta && v.severita !== "minore" && !v.lente_a),
    seri_senza_lente_b: conta((v) => v.ricetta && v.severita !== "minore" && !v.lente_b),
    minori_gia_risolti_senza_verifica: conta((v) => v.ricetta && v.severita === "minore" && v.ricetta.ancora_vero === "no" && !v.chiuso),
    revisori_partiti_e_mai_tornati: persiDavvero.length,
    ricette_su_difetti_non_aperti: estranei.length,
    ricette_riagganciate_per_chiave: spostati.size,
    ricette_senza_difetto: persi.size,
  };
  // Tutti i controlli che fermano vengono PRIMA di qualunque scrittura (collaudo del 24/10).
  if (!sintesi.con_ricetta) cieco("nessun difetto aperto ha una ricetta: i journal non corrispondono a questo registro");
  const ricettario = { _cosa_e: "Il ricettario della pre-diagnosi del sito: per ogni difetto aperto, se è ancora vero e come si ripara. Lo scrive cervello/prediagnosi.mjs raccogli. Le falle di sicurezza riservate qui compaiono solo col titolo pubblico.", data: new Date().toISOString(), registro: REGISTRO, sintesi, territori, difetti: voce };
  // La corsia riservata. Se fra i journal non c'è, si riprende quella già raccolta nella cartella: chi
  // pubblica tende a tenere il materiale privato lontano dal comando che pubblica, e così la rete delle
  // frasi si spegneva e il ricettario completo perdeva la corsia (collaudo del 24/10).
  const fileCompleto = path.join(dir, "ricettario-completo.json");
  // E se fra i journal ce n'è solo una parte (due giri «privata» con le aree divise), le aree che
  // mancano si riprendono dalla cartella: a parità di etichetta vince il journal (collaudo del 24/10).
  let privataUsata = privata;
  if (existsSync(fileCompleto)) {
    let prima;
    try {
      prima = JSON.parse(readFileSync(fileCompleto, "utf8"));
    } catch (e) {
      cieco(`il ricettario completo di prima (${fileCompleto}) è illeggibile: ${e.name}`);
    }
    const etichette = new Set(privata.map((x) => x.label));
    const mancanti = (Array.isArray(prima.privata) ? prima.privata : []).filter((x) => !etichette.has(x.label));
    if (mancanti.length) {
      privataUsata = [...privata, ...mancanti];
      console.log(`↪️  ${privata.length ? "fra i journal manca una parte della corsia riservata" : "fra i journal non c'è la corsia riservata"}: ${mancanti.length} risultati ripresi dal ricettario completo della cartella (${[...new Set(mancanti.map((x) => x.label.split(":")[0]))].join(", ")})`);
    }
  }
  let pubblico = null;
  if (opz["--scrivi"]) pubblico = pubblica(ricettario, privataUsata, registro);
  scrivi(fileCompleto, { ...ricettario, privata: privataUsata });
  console.log(`🔎 PRE-DIAGNOSI — raccolta da ${posizionali.length} journal, ${voci.length} risultati d'agente`);
  console.log(JSON.stringify(sintesi));
  if (estranei.length) console.log(`⚠️  ${estranei.length} ricette parlano di difetti non più aperti (registro cambiato sotto le mani?): ${estranei.slice(0, 10).join(", ")}`);
  if (spostati.size) console.log(`↪️  ${spostati.size} difetti avevano cambiato posizione nel registro: riagganciati per chiave`);
  if (persi.size) console.log(`⚠️  ${persi.size} ricette non ritrovano il loro difetto nel registro (titolo cambiato?), scartate: ${[...persi].slice(0, 10).join(", ")}`);
  if (persiDavvero.length) console.log(`⚠️  ${persiDavvero.length} revisori partiti e mai tornati: ${persiDavvero.slice(0, 10).join(", ")} — i loro difetti non hanno quella voce`);
  const quanteDoppie = Object.values(doppie).reduce((s, x) => s + x, 0);
  if (quanteDoppie) console.log(`⚠️  ${quanteDoppie} voci doppie (${Object.entries(doppie).filter(([, x]) => x).map(([k, x]) => `${k} ${x}`).join(" · ")}): stanno tutte nel ricettario; ${discordi} difetti danno esiti diversi a seconda della voce, e vanno rivisti`);
  if (sintesi.seri_senza_lente_a || sintesi.seri_senza_lente_b) console.log(`⚠️  difetti seri senza una delle due verifiche: lente A mancante ${sintesi.seri_senza_lente_a}, lente B mancante ${sintesi.seri_senza_lente_b}`);
  if (pubblico) {
    const ora = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Rome" }).replace(/[-: ]/g, "").slice(0, 12);
    const fuori = path.join(ROOT, "consegne/audit", `${ora.slice(0, 4)}-${ora.slice(4, 6)}-${ora.slice(6, 8)}-${ora.slice(8, 12)}-ricettario-sito.json`);
    scrivi(fuori, pubblico);
    console.log(`📝 ricettario pubblico: ${path.relative(ROOT, fuori)} (senza i risultati riservati)`);
  }
}

/** Le regole della pubblicazione: torna il ricettario pubblico, o si ferma. Non scrive niente. */
function pubblica(ricettario, privata, registro) {
  const fonti = opz["--riservato"];
  const testiRiservati = testiDellaCorsiaRiservata(privata);
  const ciSonoFalle = ricettario.sintesi.riservati > 0;
  if (ciSonoFalle && !testiRiservati.length) cieco(`il registro ha ${ricettario.sintesi.riservati} falle riservate aperte e fra i journal, e nella cartella, non c'è la loro corsia: senza, il confronto con il testo pubblico non si può fare. Passa anche il journal del modo «privata».`);
  if (fonti.includes("nessuno")) {
    // «nessuno» vale solo dove non c'è niente da nascondere: era la scorciatoia che il messaggio
    // stesso suggeriva, e pubblicava anche con falle aperte (collaudo del 24/10).
    if (fonti.length > 1 || ciSonoFalle || testiRiservati.length) cieco(`«--riservato nessuno» vale solo per un registro senza falle riservate e senza corsia riservata: qui le falle aperte sono ${ricettario.sintesi.riservati} e i testi riservati ${testiRiservati.length}. Serve il journal del modo «riservatezza».`);
    console.log("🔓 nessuna falla riservata aperta e nessuna corsia riservata: niente da rileggere");
    return ricettario;
  }
  const journals = [];
  let elenco = [];
  let pubbliciDaElenchi = 0;
  for (const f of fonti) {
    if (!existsSync(f)) cieco(`l'elenco del riservato ${f} non esiste`);
    const testo = readFileSync(f, "utf8");
    if (/\.jsonl$/.test(f)) {
      if (!revisioneRiservatezza([testo]).lenti.length) cieco(`${f} non porta il lavoro dei revisori della riservatezza (etichette «riservato:…»)`);
      journals.push(testo);
      continue;
    }
    let voci;
    try {
      voci = elencoRiservato(testo, f);
    } catch (e) {
      // Il messaggio di JSON.parse riporta un pezzo del testo: qui si dice solo dove guardare.
      cieco(`l'elenco del riservato ${f} non è JSON valido (${e.name})`);
    }
    if (!Array.isArray(voci)) cieco(`l'elenco del riservato ${f} non è una lista di voci, né l'uscita di un revisore`);
    // Da un elenco senza impronta si prende solo quello che nasconde: un «già pubblico» scritto per
    // un altro testo non può aprire questo.
    pubbliciDaElenchi += voci.filter((v) => v && v.pubblico === true).length;
    elenco.push(...voci.filter((v) => !(v && v.pubblico === true)));
  }
  const improntaDiOggi = impronta(ricettario, privata);
  const rev = revisioneRiservatezza(journals, improntaDiOggi);
  elenco = [...elenco, ...rev.voci];
  if (pubbliciDaElenchi || rev.pubblici_ignorati) console.log(`⚠️  ${pubbliciDaElenchi + rev.pubblici_ignorati} giudizi «già pubblico» vengono da elenchi o riletture su un altro testo: ignorati (le loro oscurature invece valgono)`);
  if (ciSonoFalle || testiRiservati.length) {
    const motivi = revisioneIncompleta(rev, improntaDiOggi);
    if (motivi.length) cieco(`la revisione della riservatezza non vale per questo testo: ${motivi.join(" · ")}. Rifai «riservato --cartella …» e il workflow in modo «riservatezza», poi passa qui il suo journal (e gli elenchi delle riletture di prima).`);
  }
  const chiusi = new Set(registro.map((p, i) => [p, i]).filter(([p]) => p.stato !== "aperto").map(([, i]) => i));
  const esito = oscura(ricettario, elenco, { decaduta: (idx) => chiusi.has(idx) });
  if (esito.mancati.length) cieco(`l'elenco del riservato non colpisce il bersaglio: ${esito.mancati.slice(0, 8).join(" · ")} — un'oscuratura che manca il bersaglio non è avvenuta`);
  console.log(`🔒 oscurati ${esito.oscurati} campi segnati dai revisori della riservatezza${esito.lasciati.length ? `; ${esito.lasciati.length} giudicati pubblici` : ""}${esito.contesi.length ? `; su ${esito.contesi.length} i revisori non erano d'accordo, e vince l'oscuratura` : ""}`);
  if (esito.decadute.length) console.log(`🗂️  ${esito.decadute.length} voci degli elenchi parlano di difetti che il registro ha chiuso nel frattempo, e non si pubblicano più: ignorate (idx ${esito.decadute.slice(0, 12).join(",")})`);
  // La memoria: quello che un ricettario pubblico di prima aveva oscurato si rioscura da solo,
  // salvo un «già pubblico» scritto. Così ripubblicare non dipende dagli elenchi di ieri.
  const riapplicare = daRiapplicare(esito.ricettario, oscuratiPrima(ricettariPubbliciDiPrima()), esito.lasciati);
  const pubblico = oscura(esito.ricettario, riapplicare.map((x) => x.voce)).ricettario;
  if (riapplicare.length) console.log(`↩️  ${riapplicare.length} campi oscurati in un ricettario pubblico di prima restano oscurati: chi li vuole liberare scrive un «già pubblico» col perché`);
  // Le reti che non dipendono dai revisori: frasi lunghe e nomi che stanno solo nelle falle. Ogni
  // campo che pescano va oscurato o giudicato, e il giudizio sta scritto nel journal.
  const gia = testiGiaPubblici(registro);
  const frasi = nonGiudicate(frasiCopiate(pubblico, testiRiservati, gia), esito.lasciati);
  if (frasi.length) cieco(`il testo pubblico ripete frasi della corsia riservata in ${frasi.length} campi che nessun revisore ha giudicato: ${frasi.join(" · ")} — «riservato --cartella …» li mette nei materiali dei revisori: li oscurano, o li dichiarano già pubblici col perché`);
  const nomi = nomiSoloRiservati(testiRiservati, gia);
  const conNomi = nonGiudicate(campiConNomi(pubblico, nomi), esito.lasciati);
  if (conNomi.length) cieco(`${conNomi.length} campi pubblici nominano una funzione, una regola o un file che sta solo nelle falle riservate, e nessun revisore li ha giudicati: ${conNomi.join(" · ")}`);
  console.log(`🔎 controllati ${testiRiservati.length} testi riservati: nessuna frase lunga e nessun nome solo riservato senza giudizio · le lenti dicono di aver riletto ${rev.lenti.filter((x) => x.impronta === improntaDiOggi).map((x) => `${x.label} ${x.controllati}`).join(", ")}`);
  return pubblico;
}

// ── riservato ──────────────────────────────────────────────────────────────────────────────────
/**
 * I materiali per i revisori della riservatezza. Dal ricettario completo (che porta la corsia
 * riservata): i campi che il comando che pubblica pretenderà giudicati (frasi lunghe e nomi che
 * stanno solo nelle falle), e come guida di lettura i difetti che nominano un nome raro delle falle.
 * Un nome che compare in tanti difetti pubblici è un nome comune (order_id, middleware.ts) e non
 * segnala niente: si tiene solo chi compare al più in `RARO` difetti. Pura nella parte che decide.
 */
const RARO = 8;
export function candidatiRiservati(ricettario) {
  const testi = testiDellaCorsiaRiservata(ricettario.privata || []);
  const nomi = new Set();
  for (const t of testi) for (const m of String(t).matchAll(RE_NOME)) if (m[0].length > 5) nomi.add(m[0]);
  const pubblici = (ricettario.difetti || []).filter((d) => !d.riservato && d.ricetta);
  const testoDi = (d) => JSON.stringify(d);
  const quanti = new Map();
  for (const n of nomi) quanti.set(n, pubblici.filter((d) => testoDi(d).includes(n)).length);
  const rari = [...nomi].filter((n) => quanti.get(n) > 0 && quanti.get(n) <= RARO);
  const difetti = pubblici.filter((d) => rari.some((n) => testoDi(d).includes(n))).map((d) => d.idx);
  const territori = (ricettario.territori || []).filter((t) => rari.some((n) => JSON.stringify(t).includes(n))).map((t) => ({ territorio: t.territorio, modo: t.modo }));
  return { nomi_rari: rari, difetti, territori, testi: testi.length };
}

function riservato() {
  const dir = cartella();
  const f = path.join(dir, "ricettario-completo.json");
  if (!existsSync(f)) cieco(`manca ${f}: prima «raccogli», con fra i journal anche quello della corsia riservata`);
  let r;
  try {
    r = JSON.parse(readFileSync(f, "utf8"));
  } catch (e) {
    // Il messaggio di JSON.parse ripeterebbe un pezzo del testo, che qui è riservato.
    cieco(`${f} è illeggibile (${e.name}): rifai «raccogli»`);
  }
  if (!(r.privata || []).length) cieco("il ricettario completo non porta la corsia riservata: passa a «raccogli» anche il suo journal");
  const c = candidatiRiservati(r);
  const testi = testiDellaCorsiaRiservata(r.privata);
  const gia = testiGiaPubblici(leggiRegistro());
  const frasi = frasiCopiate(r, testi, gia);
  const conNomi = campiConNomi(r, nomiSoloRiservati(testi, gia));
  const daGiudicare = [...new Set([...frasi, ...conNomi])].sort();
  const giaOscurati = tornatiInChiaro(r, oscuratiPrima(ricettariPubbliciDiPrima()), []);
  scrivi(path.join(dir, "da-controllare-riservato.json"), {
    _come_si_usa: "Ogni percorso di «da_giudicare» va oscurato (da_oscurare) o dichiarato già pubblico (giudicati_pubblici), sennò il comando non pubblica. «impronta» va ricopiata nella risposta: dice su quale testo hai lavorato. I testi stanno in ricettario-completo.json, alla voce del difetto o del territorio.",
    impronta: impronta(r),
    da_giudicare: daGiudicare.map((p) => ({ percorso: p, perche_segnalato: [frasi.includes(p) ? "frase lunga in comune con una falla" : "", conNomi.includes(p) ? "nome che sta solo nelle falle" : ""].filter(Boolean).join(" + ") })),
    oscurati_prima: giaOscurati,
    _oscurati_prima: "Campi oscurati in un ricettario pubblico di prima: il comando li rioscura da solo. Se uno dice solo cose già pubbliche, mettilo in giudicati_pubblici col perché.",
    difetti_con_nomi_rari: c.difetti,
    territori_con_nomi_rari: c.territori,
  });
  // Tutto il testo riservato, non solo le falle degli auditori: le «mancate» dei verificatori sono
  // falle nuove, e il 24/10 restavano fuori dai materiali dei revisori.
  scrivi(path.join(dir, "PRIVATO-elenco.json"), r.privata.map(({ label, result }) => ({ label, falle: result.falle || [], verdetti: result.verdetti || [], mancate: result.mancate || "", note: result.note || "" })));
  console.log(`🔒 RISERVATEZZA — ${daGiudicare.length} campi da giudicare (${frasi.length} con una frase lunga di una falla, ${conNomi.length} con un nome che sta solo nelle falle); ${giaOscurati.length} campi oscurati in un ricettario pubblico di prima, che si rioscurano da soli; da leggere anche ${c.difetti.length} difetti e ${c.territori.length} territori che nominano un nome raro delle falle.`);
  console.log(`Poi: Workflow .claude/workflows/prediagnosi.js con args {cartella: "${dir}", modo: "riservatezza"}; il suo journal va a «raccogli --scrivi --riservato <journal>», insieme agli elenchi delle riletture di prima.`);
}

// ── ondate ─────────────────────────────────────────────────────────────────────────────────────
const PESO = { bloccante: 0, grave: 1, minore: 2 };
const ORE = { S: 0.5, M: 1.5, L: 4 }; // le soglie che il workflow dà ai revisori: S < 30 min, M 1-2 ore, L mezza giornata
const LAVORO_DI_SQUADRA = new Set(["codice", "migrazione"]);

// I revisori scrivono i file come vengono: «./lib/a.ts», «lib/a.ts:40-52», «middleware.ts (riga 582)».
// Sono lo stesso file, e due squadre su quel file sono il conflitto che le ondate devono evitare.
const RE_PERCORSO = /[\w./@[\]()-]+\.(?:tsx?|jsx?|mjs|cjs|sql|json|css|sh|md|ya?ml|toml|svg)\b/;
export function nomeDelFile(f, radice = "") {
  const testo = String(f || "").trim();
  const m = testo.match(RE_PERCORSO);
  let nome = (m && !testo.includes("*") ? m[0] : testo).replace(/^\.\//, "");
  // Un revisore può scrivere il percorso intero della sua macchina: si toglie la radice del sito, se
  // la si conosce, o la parte fino alla cartella del sito («…/mycity/» o «…/marketplace/»).
  if (radice && nome.startsWith(radice.replace(/\/?$/, "/"))) nome = nome.slice(radice.replace(/\/?$/, "/").length);
  else nome = nome.replace(/^\/.*?\/(?:mycity|marketplace)\//, "");
  return nome;
}
const fileDiProva = (f) => /^tests?\//.test(f) || /(^|\/)__tests__\//.test(f) || /\.(test|spec)\.[jt]sx?$/.test(f);
const fileDiMigrazione = (f) => /^(supabase\/)?migrations\//.test(f);
/** Una citazione larga: una cartella o un modello con l'asterisco. Tocca file che non si contano. */
export const citazioneLarga = (f, eCartella = () => false) => f.includes("*") || f.endsWith("/") || eCartella(f);

/**
 * Il territorio di una ricetta per le ondate: i file che la squadra scriverà, tolte le prove e le
 * migrazioni. Una prova nuova, o una migrazione che due ricette chiamano «164_…», non è un conflitto
 * di squadra: il 24/10 contarle ha fuso 356 difetti in un blocco solo da 315 ore (i numeri delle
 * migrazioni si ricuciono a parte). Un file NUOVO che non è una prova invece conta: due squadre che lo
 * creano entrambe si pestano i piedi (collaudo del 24/10, lib/rider/idoneita.ts in tre ricette).
 * Un campo oscurato (una stringa al posto della lista) vale come nessun file.
 */
/** I file citati da una ricetta: una lista oscurata, o una voce oscurata dentro la lista, non sono file. */
export function listaFile(ricetta) {
  return Array.isArray(ricetta?.file_toccati) ? ricetta.file_toccati.filter((f) => typeof f === "string" && f !== OSCURATO) : [];
}
export function territorio(ricetta, esiste = () => true, radice = "") {
  const lista = listaFile(ricetta);
  return [...new Set(lista.map((f) => nomeDelFile(f, radice)).filter((f) => f && !fileDiProva(f) && !fileDiMigrazione(f) && (esiste(f) || !citazioneLarga(f))))];
}
/** Perché una ricetta resta senza territorio: solo prove, solo migrazioni, niente citato, o il campo oscurato. */
function perchéLibero(ricetta, radice) {
  if (!Array.isArray(ricetta?.file_toccati)) return "file oscurati";
  const nomi = listaFile(ricetta).map((f) => nomeDelFile(f, radice)).filter(Boolean);
  if (!nomi.length) return "nessun file citato";
  if (nomi.every(fileDiMigrazione)) return "solo migrazioni";
  if (nomi.every(fileDiProva)) return "solo prove";
  return "solo prove e migrazioni";
}

/**
 * Pacchetti e ondate, come in pacchetti-lotto.mjs: un pacchetto per file «caldo» (il file del
 * territorio che più ricette toccano), una squadra per pacchetto, e due pacchetti che condividono
 * anche un solo file non stanno mai nella stessa ondata. Una ricetta che cita una cartella o un
 * modello con l'asterisco tocca file che non si possono contare: va da sola, in un'ondata sua
 * (collaudo del 24/10: una sostituzione su «app/» stava accanto a due pacchetti dentro «app/»).
 * Pura: la prova la esegue.
 */
export function pianoDelleOndate(difetti, { esiste = () => true, eCartella = () => false, perOndata = PER_ONDATA, radice = "" } = {}) {
  const conti = new Map();
  const conTerr = difetti.map((d) => {
    const lista = listaFile(d.ricetta);
    const larghe = lista.map((f) => nomeDelFile(f, radice)).filter((f) => f && !fileDiProva(f) && !fileDiMigrazione(f) && citazioneLarga(f, eCartella));
    return { d, file: territorio(d.ricetta, esiste, radice).filter((f) => !citazioneLarga(f, eCartella)), larghe };
  });
  for (const { file } of conTerr) for (const f of file) conti.set(f, (conti.get(f) || 0) + 1);
  const pacchi = new Map();
  const liberi = [];
  const perché = {};
  const larghi = [];
  const ore = (d) => ORE[d.ricetta?.stima] ?? ORE.M;
  for (const { d, file, larghe } of conTerr) {
    if (larghe.length) {
      larghi.push({ chiave: `${larghe[0]} (largo)`, difetti: [d.idx], file: [...file, ...larghe], ore: ore(d), peggiore: PESO[d.severita] ?? 2, rischio_alto: (d.lente_b?.rischio_rivisto || d.ricetta?.rischio_nascita) === "alto" ? 1 : 0 });
      continue;
    }
    if (!file.length) {
      liberi.push(d.idx);
      const p = perchéLibero(d.ricetta, radice);
      perché[p] = (perché[p] || 0) + 1;
      continue;
    }
    const caldo = [...file].sort((a, b) => (conti.get(b) - conti.get(a)) || a.localeCompare(b))[0];
    if (!pacchi.has(caldo)) pacchi.set(caldo, { chiave: caldo, difetti: [], file: new Set(), ore: 0, peggiore: 2, rischio_alto: 0 });
    const p = pacchi.get(caldo);
    p.difetti.push(d.idx);
    for (const f of file) p.file.add(f);
    p.ore += ore(d);
    p.peggiore = Math.min(p.peggiore, PESO[d.severita] ?? 2);
    if ((d.lente_b?.rischio_rivisto || d.ricetta?.rischio_nascita) === "alto") p.rischio_alto++;
  }
  const ordinati = [...pacchi.values()].sort((a, b) => a.peggiore - b.peggiore || b.ore - a.ore || a.chiave.localeCompare(b.chiave));
  const ondate = [];
  for (const p of ordinati) {
    let o = ondate.find((w) => w.length < perOndata && w.every((q) => ![...p.file].some((f) => q.file.has(f))));
    if (!o) ondate.push((o = []));
    o.push(p);
  }
  for (const p of larghi.sort((a, b) => a.peggiore - b.peggiore)) ondate.push([{ ...p, file: new Set(p.file) }]);
  const orePerOndata = ondate.map((w) => Math.max(...w.map((p) => p.ore)));
  const oreLiberi = conTerr.filter(({ d }) => liberi.includes(d.idx)).reduce((s, { d }) => s + ore(d), 0);
  return {
    ondate: ondate.map((w) => w.map((p) => ({ ...p, file: [...p.file] }))),
    liberi,
    liberi_perche: perché,
    ore_per_ondata: orePerOndata,
    ore_in_fila: orePerOndata.reduce((s, x) => s + x, 0),
    ore_dei_liberi: oreLiberi,
    // Tutto il lavoro, compreso quello senza un file: prima i liberi restavano fuori dal totale.
    ore_di_squadra: ordinati.reduce((s, p) => s + p.ore, 0) + larghi.reduce((s, p) => s + p.ore, 0) + oreLiberi,
    caldi: [...conti].sort((a, b) => b[1] - a[1]).slice(0, 10),
  };
}

/** Il conto che deve tornare: ogni difetto del ricettario sta in un posto solo del piano. Pura. */
export function contoDelPiano(difetti, squadra, corsie) {
  const fuori = {
    riservati: difetti.filter((d) => d.riservato).map((d) => d.idx),
    gia_risolti: difetti.filter((d) => d.esito === "gia_risolto").map((d) => d.idx),
    senza_ricetta: difetti.filter((d) => !d.riservato && (d.esito === "senza_ricetta" || (d.esito === "da_riparare" && !d.ricetta))).map((d) => d.idx),
    da_rivedere: difetti.filter((d) => d.esito === "da_rivedere").map((d) => d.idx),
  };
  const nelleCorsie = Object.values(corsie).reduce((s, v) => s + v.length, 0);
  const somma = squadra.length + nelleCorsie + Object.values(fuori).reduce((s, v) => s + v.length, 0);
  const seriScoperti = difetti.filter((d) => d.severita !== "minore" && (fuori.senza_ricetta.includes(d.idx) || fuori.da_rivedere.includes(d.idx))).map((d) => d.idx);
  return { fuori, torna: somma === difetti.length, somma, totale: difetti.length, seriScoperti };
}

function ondate() {
  const file = opz["--ricettario"];
  if (!file) cieco("serve --ricettario FILE");
  let r;
  try {
    r = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    cieco(`non riesco a leggere ${file}: ${e.message}`);
  }
  if (!Array.isArray(r.difetti)) cieco(`${file} non è un ricettario: manca «difetti»`);
  // Il piano finisce nel deposito: si fa dal ricettario pubblico, mai da quello con la corsia riservata.
  if ("privata" in r) cieco(`${file} è il ricettario completo, con la corsia riservata: il piano si fa dal ricettario pubblico di consegne/audit`);
  const repo = opz["--repo"] ? path.resolve(opz["--repo"]) : null;
  if (repo && !existsSync(path.join(repo, "package.json"))) cieco(`${repo} non sembra il repository del sito: manca package.json`);
  const esiste = repo ? (f) => existsSync(path.join(repo, f)) && !statSync(path.join(repo, f)).isDirectory() : () => true;
  const eCartella = repo ? (f) => existsSync(path.join(repo, f)) && statSync(path.join(repo, f)).isDirectory() : () => false;
  const daRiparare = r.difetti.filter((d) => d.esito === "da_riparare" && d.ricetta);
  const squadra = daRiparare.filter((d) => LAVORO_DI_SQUADRA.has(d.ricetta.chi_ripara));
  const corsie = {};
  for (const d of daRiparare.filter((x) => !LAVORO_DI_SQUADRA.has(x.ricetta.chi_ripara))) (corsie[d.ricetta.chi_ripara] ||= []).push(d.idx);
  if (!squadra.length && !Object.keys(corsie).length) cieco("il ricettario non ha niente da riparare: zero non è un verde");
  // Una cartella qualunque con un package.json farebbe sparire quasi tutti i file e accorcerebbe il
  // piano fino a farlo sembrare finito (collaudo del 24/10): almeno metà dei file citati che non sono
  // prove deve esistere davvero.
  if (repo) {
    const citati = [...new Set(squadra.flatMap((d) => listaFile(d.ricetta).map((f) => nomeDelFile(f, repo)).filter((f) => f && !fileDiProva(f) && !fileDiMigrazione(f) && !citazioneLarga(f))))];
    const trovati = citati.filter(esiste).length;
    if (citati.length && trovati * 2 < citati.length) cieco(`in ${repo} esistono solo ${trovati} dei ${citati.length} file citati dalle ricette: è la cartella giusta?`);
  }
  const conto = contoDelPiano(r.difetti, squadra, corsie);
  if (!conto.torna) cieco(`il conto non torna: ${conto.somma} difetti nel piano contro ${conto.totale} nel ricettario`);
  const piano = pianoDelleOndate(squadra, { esiste, eCartella, radice: repo || "" });
  const pacchetti = piano.ondate.reduce((s, w) => s + w.length, 0);
  const nelPiano = squadra.length - piano.liberi.length;
  console.log(`🌊 ONDATE — ${squadra.length} difetti di codice: ${nelPiano} in ${pacchetti} pacchetti e ${piano.ondate.length} ondate da al più ${PER_ONDATA} squadre, ${piano.liberi.length} senza un file da contare${repo ? "" : " (senza --repo: conto come territorio anche i file che non esistono ancora)"}`);
  console.log(`Fuori dalle squadre: ${Object.entries(corsie).map(([k, v]) => `${k} ${v.length}`).join(" · ") || "nessuno"}`);
  console.log(`Fuori dal piano: già risolti ${conto.fuori.gia_risolti.length} · riservati ${conto.fuori.riservati.length} (la loro corsia) · senza ricetta ${conto.fuori.senza_ricetta.length} · da rivedere ${conto.fuori.da_rivedere.length}. Il conto torna: ${conto.somma} su ${conto.totale}.`);
  console.log(`Ore di squadra in tutto: ${piano.ore_di_squadra} (di cui ${piano.ore_dei_liberi} dei difetti senza un file) · in fila, ondata dopo ondata: ${piano.ore_in_fila} (stima dei revisori: S mezz'ora, M un'ora e mezza, L quattro ore).`);
  console.log(`I file più caldi: ${piano.caldi.map(([f, n]) => `${f} (${n})`).join(", ")}`);
  piano.ondate.forEach((o, i) => {
    console.log(`── ONDATA ${i + 1} · ${piano.ore_per_ondata[i]} h`);
    for (const b of o) console.log(`  📦 ${b.chiave} · ${b.difetti.length} difetti · ${b.ore} h · idx ${b.difetti.join(",")}${b.rischio_alto ? ` · ⚠️ ${b.rischio_alto} a rischio alto di nascite` : ""}`);
  });
  if (piano.liberi.length) console.log(`── SENZA UN FILE DA CONTARE (${Object.entries(piano.liberi_perche).map(([k, v]) => `${k} ${v}`).join(" · ")}): ${piano.liberi.length} difetti, a una squadra a parte · idx ${piano.liberi.join(",")}`);
  if (conto.seriScoperti.length && !opz["--parziale"]) {
    cieco(`${conto.seriScoperti.length} difetti seri sono senza ricetta o da rivedere (idx ${conto.seriScoperti.slice(0, 12).join(",")}): rifai quei territori, o lancia con --parziale sapendo che il piano non li copre`);
  }
  if (opz["--scrivi"]) {
    const fuori = file.replace(/\.json$/, "") + "-ondate.json";
    scrivi(fuori, { ...piano, corsie, fuori_dal_piano: conto.fuori });
    console.log(`📝 ${fuori}`);
  }
}

if (ESEGUITO) {
  leggiArgomenti();
  if (COMANDO === "prepara") prepara();
  else if (COMANDO === "raccogli") raccogli();
  else if (COMANDO === "riservato") riservato();
  else ondate();
}
