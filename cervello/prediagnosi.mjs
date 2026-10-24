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
//   node cervello/prediagnosi.mjs raccogli --cartella DIR JOURNAL... --scrivi --riservato <journal della riservatezza>
//   node cervello/prediagnosi.mjs ondate --ricettario FILE --repo <cartella del sito> [--parziale] [--scrivi]
//
// ⚠️ LA CORSIA RISERVATA. Il deposito della memoria e quello del sito sono PUBBLICI. Le falle di
// sicurezza ancora aperte si descrivono solo fuori di qui: `raccogli` scrive i risultati del modo
// «privata» SOLO dentro --cartella, e --cartella non puo' stare dentro un repository git (nemmeno
// passando da un collegamento simbolico). Nel ricettario pubblico di una falla resta il titolo, mai
// il testo. Il 24/10 tre ricette scritte per difetti PUBBLICI nominavano di passaggio una falla
// riservata: per questo `--scrivi` vuole sempre `--riservato` (il lavoro dei revisori, o la parola
// «nessuno» detta apposta), e in piu' il comando cerca da se' nel testo pubblico le frasi copiate
// dalle falle riservate. Lo prova cervello/test/prediagnosi.test.mjs.
//
// ⚠️ UNA CHIUSURA VUOLE DUE VOCI. Un difetto esce dal lavoro come «gia' risolto» solo se lo dice chi
// ha scritto la ricetta E il revisore che aveva il mandato di smentirlo. Una voce sola lo lascia da
// riparare: chiudere per sbaglio un difetto vero costa piu' che ripararne uno gia' chiuso.
//
// Uscita: 0 = fatto · 2 = non ho potuto misurare (argomento storto, registro illeggibile, cartella
// nel posto sbagliato, journal senza risultati, oscuratura che manca il bersaglio, conti che non
// tornano). Ogni uscita 2 arriva PRIMA di qualunque scrittura. Mai un verde su zero.
// 🟢 legge, scrive solo dove gli dici.
import { readFileSync, mkdirSync, existsSync, realpathSync } from "fs";
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
        opz[a] = ARG[++i];
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

function prepara() {
  const dir = cartella();
  const tutte = leggiRegistro().map((d, i) => ({ ...d, _idx: i, _chiave: chiaveProblema(d) }));
  const aperti = tutte.filter((d) => d.stato === "aperto");
  if (!aperti.length) cieco("il registro non ha difetti aperti: niente da pre-diagnosticare (o il campo «stato» ha cambiato nome)");
  mkdirSync(path.join(dir, "difetti"), { recursive: true });
  for (const d of aperti) scrivi(path.join(dir, "difetti", `${d._idx}.json`), d);
  const privati = aperti.filter((d) => RE_PRIVATA.test(d.titolo));
  const seri = aperti.filter((d) => d.severita !== "minore" && !privati.includes(d));
  const minori = aperti.filter((d) => d.severita === "minore" && !privati.includes(d));
  const territori = {
    seri: dividiPerGruppo(seri, (d) => d.dimensione, MAX_SERI),
    minori: dividiPerGruppo(minori, (d) => d.dimensione, MAX_MINORI),
    privati: privati.map((d) => ({ idx: d._idx, id: (d.titolo.match(/R\d+/) || [""])[0], severita: d.severita, categoria: (d.titolo.match(/\(([^)]+)\)/) || [])[1] || "", si_ripara: (String(d.fonte_radiografia || "").match(/si ripara: ([\w-]+)/) || [])[1] || "" })),
  };
  scrivi(path.join(dir, "territori.json"), territori);
  const conta = (xs) => xs.reduce((s, t) => s + t.indici.length, 0);
  console.log(`🔎 PRE-DIAGNOSI — preparata in ${dir}`);
  console.log(`Aperti: ${aperti.length} · seri ${seri.length} in ${territori.seri.length} territori · minori ${minori.length} in ${territori.minori.length} gruppi · falle riservate ${privati.length}.`);
  if (conta(territori.seri) !== seri.length || conta(territori.minori) !== minori.length) cieco("un difetto si è perso nella divisione in territori");
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

/** Il verdetto finale di un difetto, dalle voci che lo hanno guardato. Pura: la prova la esegue. */
export function verdettoFinale({ ricetta, lenteA, chiuso }) {
  if (!ricetta) return "senza_ricetta";
  if (lenteA) {
    // Le due voci devono dire la stessa cosa: se la lente dice «già chiuso» e la ricetta «ancora vero»,
    // nessuna delle due decide da sola (collaudo del 24/10).
    if (lenteA.verdetto === "gia_chiuso_confermato") return ricetta.ancora_vero === "no" ? "gia_risolto" : "da_rivedere";
    if (lenteA.verdetto === "non_reale") return "da_rivedere";
    if (lenteA.ancora_vero_corretto === "no" && ricetta.ancora_vero !== "no") return "da_rivedere";
    return "da_riparare";
  }
  if (ricetta.ancora_vero === "no") return chiuso && chiuso.gia_chiuso_confermato === true ? "gia_risolto" : "da_riparare";
  return "da_riparare";
}

export const OSCURATO = "[riservato: il testo tocca una falla della corsia riservata, e sta fuori dal deposito pubblico]";

/**
 * Oscura nel ricettario PUBBLICO i campi che un revisore della riservatezza ha segnato: una ricetta
 * scritta per un difetto pubblico può nominare di passaggio una falla riservata (il 24/10 è successo
 * con tre). Entra un elenco [{idx | territorio, campi: ["ricetta.raggio", "lente_b.nascite_previste"]}].
 * Un campo segnato che non esiste, o un difetto che non c'è, è un errore: un'oscuratura che non trova
 * il suo bersaglio è un'oscuratura che non è avvenuta. Una voce con `pubblico: true` è il giudizio
 * opposto: il revisore ha guardato il campo e dice che rivela solo cose già pubbliche. Non si oscura,
 * ma il suo percorso torna in `lasciati`, e anche lui deve esistere.
 * Pura: torna { ricettario, oscurati, mancati, lasciati }.
 */
export function oscura(ricettario, elenco) {
  const copia = JSON.parse(JSON.stringify(ricettario));
  let oscurati = 0;
  const mancati = [];
  const lasciati = [];
  if (!Array.isArray(elenco)) return { ricettario: copia, oscurati, mancati: ["l'elenco non è una lista"], lasciati };
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
      mancati.push(String(nome));
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
        if (voce.pubblico === true) {
          lasciati.push(`${voce.territorio != null ? `territorio ${bersaglio.modo}:${bersaglio.territorio}` : `difetto ${bersaglio.idx}`}.${campo}`);
          continue;
        }
        dove[ultimo] = OSCURATO;
        oscurati++;
      }
    }
  }
  return { ricettario: copia, oscurati, mancati, lasciati };
}

/** Le frasi in comune che nessun revisore ha giudicato: né oscurate, né dichiarate pubbliche. Pura. */
export function nonGiudicate(copiate, lasciati) {
  return copiate.filter((c) => !lasciati.some((l) => c === l || c.startsWith(`${l}.`)));
}

/**
 * L'elenco del riservato da un file: una lista di voci, l'uscita di un revisore {da_oscurare}, o il
 * journal del modo «riservatezza». Un campo lasciato vuoto («territorio: ""» accanto a un idx) è un
 * campo non scritto: le risposte strutturate dei revisori li riempiono così. Due bersagli scritti
 * davvero restano un errore, e oscura() lo ferma. I «giudicati_pubblici» di un revisore diventano
 * voci con `pubblico: true`.
 */
export function elencoRiservato(testo, nomeFile = "") {
  const senzaVuoti = (v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).filter(([, x]) => x !== "" && x !== null)) : v);
  const dalRevisore = (r) => [
    ...(Array.isArray(r.da_oscurare) ? r.da_oscurare : []),
    ...(Array.isArray(r.giudicati_pubblici) ? r.giudicati_pubblici.map((v) => ({ ...v, pubblico: true })) : []),
  ];
  const eRevisore = (x) => x && (Array.isArray(x.da_oscurare) || Array.isArray(x.giudicati_pubblici));
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
 * I campi del ricettario pubblico che contengono una sequenza di otto parole di un testo riservato.
 * Le sequenze che stanno GIÀ in un testo pubblico (il registro dei difetti, il contesto dato a tutti
 * i revisori) non contano: lì non c'è niente da nascondere, e sui dati veri del 24/10 erano tutti e
 * otto i campi segnati — «usa la chiave di servizio che manca», la funzione che un difetto pubblico
 * nomina già. Un controllo che suona a vuoto a ogni giro insegna a oscurare alla cieca. Pura.
 */
export function frasiCopiate(pubblico, testiRiservati, giaPubblici = []) {
  const note = new Set();
  for (const t of giaPubblici) for (const q of sequenze(t)) note.add(q);
  const vietate = new Set();
  for (const t of testiRiservati) for (const q of sequenze(t)) if (!note.has(q)) vietate.add(q);
  if (!vietate.size) return [];
  const trovati = [];
  const visita = (o, dove) => {
    if (typeof o === "string") {
      for (const q of sequenze(o)) if (vietate.has(q)) return void trovati.push(dove);
    } else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) visita(v, dove ? `${dove}.${k}` : k);
  };
  (pubblico.difetti || []).forEach((d) => visita({ ricetta: d.ricetta, lente_a: d.lente_a, lente_b: d.lente_b, chiuso: d.chiuso }, `difetto ${d.idx}`));
  (pubblico.territori || []).forEach((t) => visita(t, `territorio ${t.modo}:${t.territorio}`));
  return trovati;
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
  const testi = stringheDi(problemi);
  for (const f of CONTESTO_PUBBLICO) if (existsSync(path.join(ROOT, f))) testi.push(readFileSync(path.join(ROOT, f), "utf8"));
  return testi;
}
function testiDellaCorsiaRiservata(privata) {
  const testi = [];
  for (const { result } of privata) {
    for (const f of result.falle || []) testi.push(f.titolo, f.dove, f.come_si_sfrutta, f.ricetta, f.prova_rossa);
    for (const v of result.verdetti || []) testi.push(v.motivo);
    if (result.mancate) testi.push(result.mancate);
  }
  return testi.filter(Boolean);
}

function raccogli() {
  const dir = cartella();
  if (!posizionali.length) cieco("dimmi i journal dei workflow: raccogli --cartella DIR <journal.jsonl> ...");
  if (opz["--scrivi"] && !opz["--riservato"]) {
    cieco("--scrivi vuole --riservato: il journal del modo «riservatezza» o il suo elenco, oppure «--riservato nessuno» detto apposta. Il 24/10 tre ricette pubbliche nominavano una falla riservata.");
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
  const registro = leggiRegistro();
  const tutte = registro.map((d, i) => ({ ...d, _idx: i, _chiave: chiaveProblema(d) }));
  const perIdx = new Map(tutte.map((d) => [d._idx, d]));
  // L'idx è la POSIZIONE nel registro al momento di «prepara». Se fra la preparazione e la raccolta
  // un'altra sessione sposta le schede, una ricetta finirebbe sul difetto accanto. Il fascicolo porta
  // la chiave del difetto: si riaggancia per chiave, e quello che non si ritrova si conta e si dice.
  const perChiave = new Map(tutte.map((d) => [d._chiave, d._idx]));
  const spostati = [];
  const persi = [];
  const dove = (idx) => {
    const f = path.join(dir, "difetti", `${idx}.json`);
    if (!existsSync(f)) return idx;
    let chiave;
    try {
      chiave = JSON.parse(readFileSync(f, "utf8"))._chiave;
    } catch (e) {
      cieco(`il fascicolo ${f} è illeggibile: ${e.message}`);
    }
    if (!chiave || perIdx.get(idx)?._chiave === chiave) return idx;
    if (perChiave.has(chiave)) {
      spostati.push(idx);
      return perChiave.get(chiave);
    }
    persi.push(idx);
    return null;
  };
  const metti = (mappa, idx, valore, territorio) => {
    const qui = dove(idx);
    if (qui == null) return;
    mappa.set(qui, valore);
    if (perIdx.get(qui) && RE_PRIVATA.test(perIdx.get(qui).titolo)) suRiservati.add(territorio || "(senza territorio)");
  };
  const suRiservati = new Set();
  const ricette = new Map(), lentiA = new Map(), lentiB = new Map(), chiusi = new Map();
  const territori = [];
  const privata = [];
  for (const { label, result } of voci) {
    const [tipo, ...resto] = label.split(":");
    const nome = resto.join(":") || result.territorio;
    if (tipo === "ricette" || tipo === "minori") {
      territori.push({ territorio: nome, descrizione: result.territorio, modo: tipo === "ricette" ? "seri" : "minori", cause_comuni: result.cause_comuni, ordine: result.ordine ?? "", conflitti: result.conflitti ?? "", semplificazioni: result.semplificazioni ?? "" });
      for (const r of result.ricette || []) metti(ricette, r.idx, { ...r, territorio: nome }, nome);
    } else if (tipo === "lente-A") for (const v of result.verdetti || []) metti(lentiA, v.idx, v, nome);
    else if (tipo === "lente-B") for (const v of result.rischi || []) metti(lentiB, v.idx, v, nome);
    else if (tipo === "chiusi") for (const v of result.verdetti || []) metti(chiusi, v.idx, v, nome);
    else if (tipo === "privata" || tipo === "privata-v") privata.push({ label, result });
  }
  // Un territorio pubblico che ha lavorato su una falla riservata porta il suo testo (cause comuni,
  // ordine) nel pubblico: si rifà quel territorio senza la falla. Si dice solo il nome.
  if (suRiservati.size) cieco(`ricette pubbliche su una falla riservata, nei territori: ${[...suRiservati].join(", ")} — rifalli senza le schede riservate`);
  const aperti = tutte.filter((d) => d.stato === "aperto");
  if (!aperti.length) cieco("il registro non ha difetti aperti (o il campo «stato» ha cambiato nome)");
  const voce = [];
  for (const d of aperti) {
    if (RE_PRIVATA.test(d.titolo)) {
      voce.push({ idx: d._idx, chiave: d._chiave, titolo: d.titolo, severita: d.severita, riservato: true });
      continue;
    }
    const r = ricette.get(d._idx);
    const esito = verdettoFinale({ ricetta: r, lenteA: lentiA.get(d._idx), chiuso: chiusi.get(d._idx) });
    voce.push({ idx: d._idx, chiave: d._chiave, titolo: d.titolo, severita: d.severita, dimensione: d.dimensione, esito, ricetta: r || null, lente_a: lentiA.get(d._idx) || null, lente_b: lentiB.get(d._idx) || null, chiuso: chiusi.get(d._idx) || null });
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
    seri_senza_lente_a: conta((v) => v.ricetta && v.severita !== "minore" && !v.lente_a),
    seri_senza_lente_b: conta((v) => v.ricetta && v.severita !== "minore" && !v.lente_b),
    minori_gia_risolti_senza_verifica: conta((v) => v.ricetta && v.severita === "minore" && v.ricetta.ancora_vero === "no" && !v.chiuso),
    revisori_partiti_e_mai_tornati: revisoriPersi.length,
    ricette_su_difetti_non_aperti: estranei.length,
    ricette_riagganciate_per_chiave: new Set(spostati).size,
    ricette_senza_difetto: new Set(persi).size,
  };
  // Tutti i controlli che fermano vengono PRIMA di qualunque scrittura (collaudo del 24/10).
  if (!sintesi.con_ricetta) cieco("nessun difetto aperto ha una ricetta: i journal non corrispondono a questo registro");
  const ricettario = { _cosa_e: "Il ricettario della pre-diagnosi del sito: per ogni difetto aperto, se è ancora vero e come si ripara. Lo scrive cervello/prediagnosi.mjs raccogli. Le falle di sicurezza riservate qui compaiono solo col titolo pubblico.", data: new Date().toISOString(), registro: REGISTRO, sintesi, territori, difetti: voce };
  let pubblico = null;
  let lasciati = [];
  if (opz["--scrivi"]) {
    pubblico = ricettario;
    if (opz["--riservato"] !== "nessuno") {
      let elenco;
      try {
        elenco = elencoRiservato(readFileSync(opz["--riservato"], "utf8"), opz["--riservato"]);
      } catch (e) {
        cieco(`non riesco a leggere l'elenco del riservato ${opz["--riservato"]}: ${e.message}`);
      }
      if (elenco == null) cieco(`${opz["--riservato"]} non porta il lavoro dei revisori della riservatezza (etichette «riservato:…»)`);
      const esito = oscura(ricettario, elenco);
      if (esito.mancati.length) cieco(`l'elenco del riservato non colpisce il bersaglio: ${esito.mancati.slice(0, 8).join(" · ")} — un'oscuratura che manca il bersaglio non è avvenuta`);
      pubblico = esito.ricettario;
      lasciati = esito.lasciati;
      console.log(`🔒 oscurati ${esito.oscurati} campi segnati dai revisori della riservatezza${lasciati.length ? `; ${lasciati.length} giudicati pubblici` : ""}`);
    } else console.log("🔓 --riservato nessuno: dichiarato da chi ha riletto, nessun passaggio da oscurare");
    const testi = testiDellaCorsiaRiservata(privata);
    if (testi.length) {
      const copiate = frasiCopiate(pubblico, testi, testiGiaPubblici(registro));
      const restano = nonGiudicate(copiate, lasciati);
      if (restano.length) cieco(`il testo pubblico ripete frasi della corsia riservata in ${restano.length} campi che nessun revisore ha giudicato: ${restano.slice(0, 12).join(" · ")} — mandali ai revisori della riservatezza («riservato» li mette nei loro materiali): li oscurano, o li dichiarano già pubblici col perché`);
      console.log(`🔎 frasi della corsia riservata nel testo pubblico: ${copiate.length} campi, tutti giudicati dai revisori (${testi.length} testi riservati confrontati)`);
    } else console.log("⚪ fra i journal non c'è la corsia riservata: il confronto automatico delle frasi non è stato fatto");
  }
  scrivi(path.join(dir, "ricettario-completo.json"), { ...ricettario, privata });
  console.log(`🔎 PRE-DIAGNOSI — raccolta da ${posizionali.length} journal, ${voci.length} risultati d'agente`);
  console.log(JSON.stringify(sintesi));
  if (estranei.length) console.log(`⚠️  ${estranei.length} ricette parlano di difetti non più aperti (registro cambiato sotto le mani?): ${estranei.slice(0, 10).join(", ")}`);
  if (spostati.length) console.log(`↪️  ${new Set(spostati).size} difetti avevano cambiato posizione nel registro: riagganciati per chiave`);
  if (persi.length) console.log(`⚠️  ${new Set(persi).size} ricette non ritrovano il loro difetto nel registro (titolo cambiato?), scartate: ${[...new Set(persi)].slice(0, 10).join(", ")}`);
  if (revisoriPersi.length) console.log(`⚠️  ${revisoriPersi.length} revisori partiti e mai tornati: ${revisoriPersi.slice(0, 10).join(", ")} — i loro difetti non hanno quella voce`);
  if (sintesi.seri_senza_lente_a || sintesi.seri_senza_lente_b) console.log(`⚠️  difetti seri senza una delle due verifiche: lente A mancante ${sintesi.seri_senza_lente_a}, lente B mancante ${sintesi.seri_senza_lente_b}`);
  if (pubblico) {
    const ora = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Rome" }).replace(/[-: ]/g, "").slice(0, 12);
    const fuori = path.join(ROOT, "consegne/audit", `${ora.slice(0, 4)}-${ora.slice(4, 6)}-${ora.slice(6, 8)}-${ora.slice(8, 12)}-ricettario-sito.json`);
    scrivi(fuori, pubblico);
    console.log(`📝 ricettario pubblico: ${path.relative(ROOT, fuori)} (senza i risultati riservati)`);
  }
}

// ── riservato ──────────────────────────────────────────────────────────────────────────────────
/**
 * I materiali per i revisori della riservatezza: dal ricettario completo (che porta la corsia
 * riservata) i nomi propri delle falle — funzioni, regole, file — e i difetti pubblici i cui testi li
 * nominano. Un nome che compare in tanti difetti pubblici è un nome comune (order_id, middleware.ts)
 * e non segnala niente: si tiene solo chi compare al più in `RARO` difetti. Pura nella parte che decide.
 */
const RARO = 8;
export function candidatiRiservati(ricettario) {
  const testi = testiDellaCorsiaRiservata(ricettario.privata || []);
  const nomi = new Set();
  for (const t of testi) {
    for (const m of String(t).matchAll(/[A-Za-z_][A-Za-z0-9_]*_[A-Za-z0-9_]+|[\w./[\]-]+\.(?:tsx?|sql|ya?ml|mjs|js|sh)\b/g)) if (m[0].length > 5) nomi.add(m[0]);
  }
  const pubblici = (ricettario.difetti || []).filter((d) => !d.riservato && d.ricetta);
  const testoDi = (d) => JSON.stringify({ r: d.ricetta, a: d.lente_a, b: d.lente_b, c: d.chiuso });
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
  const r = JSON.parse(readFileSync(f, "utf8"));
  if (!(r.privata || []).length) cieco("il ricettario completo non porta la corsia riservata: passa a «raccogli» anche il suo journal");
  const c = candidatiRiservati(r);
  // Le frasi in comune con la corsia riservata: il comando che pubblica si ferma su ognuna che i
  // revisori non hanno giudicato, quindi vanno nei loro materiali, campo per campo.
  const frasi = frasiCopiate(r, testiDellaCorsiaRiservata(r.privata), testiGiaPubblici(leggiRegistro()));
  const idxFrasi = new Set(frasi.filter((f) => f.startsWith("difetto ")).map((f) => Number(f.split(/[ .]/)[1])));
  const perIdx = new Map(r.difetti.map((d) => [d.idx, d]));
  const segnalati = [...new Set([...c.difetti, ...idxFrasi])].filter((i) => perIdx.has(i)).sort((a, b) => a - b);
  scrivi(path.join(dir, "da-controllare-riservato.json"), {
    frasi_in_comune: frasi,
    difetti: segnalati.map((i) => ({ idx: i, perche_segnalato: [c.difetti.includes(i) ? "nome raro" : "", idxFrasi.has(i) ? "frase in comune" : ""].filter(Boolean).join(" + "), testi_da_pubblicare: { ricetta: perIdx.get(i).ricetta, lente_a: perIdx.get(i).lente_a, lente_b: perIdx.get(i).lente_b, chiuso: perIdx.get(i).chiuso } })),
    territori: r.territori.filter((t) => c.territori.some((x) => x.territorio === t.territorio && x.modo === t.modo) || frasi.some((f) => f.startsWith(`territorio ${t.modo}:${t.territorio}.`))),
  });
  scrivi(path.join(dir, "PRIVATO-elenco.json"), r.privata.flatMap(({ result }) => (result.falle || []).map((x) => ({ titolo: x.titolo, dove: x.dove, come_si_sfrutta: x.come_si_sfrutta }))));
  console.log(`🔒 RISERVATEZZA — ${c.difetti.length} difetti pubblici e ${c.territori.length} territori nominano un nome raro della corsia riservata (${c.nomi_rari.length} nomi, da ${c.testi} testi riservati); ${frasi.length} campi ripetono una frase lunga di una falla. In tutto ${segnalati.length} difetti da rileggere.`);
  console.log(`Poi: Workflow .claude/workflows/prediagnosi.js con args {cartella: "${dir}", modo: "riservatezza"}; il suo journal va a «raccogli --scrivi --riservato <journal>».`);
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
  let nome = (m ? m[0] : testo).replace(/^\.\//, "");
  // Un revisore può scrivere il percorso intero della sua macchina: si toglie la radice del sito, se
  // la si conosce, o la parte fino alla cartella del sito («…/mycity/» o «…/marketplace/»).
  if (radice && nome.startsWith(radice.replace(/\/?$/, "/"))) nome = nome.slice(radice.replace(/\/?$/, "/").length);
  else nome = nome.replace(/^\/.*?\/(?:mycity|marketplace)\//, "");
  return nome;
}

/**
 * Il territorio di una ricetta per le ondate: i file che ESISTONO già nel sito e non sono prove.
 * Una prova nuova, o una migrazione nuova che due ricette chiamano «164_…», non è un conflitto vero:
 * il 24/10 contarle ha fuso 356 difetti in un blocco solo da 315 ore. Senza --repo non si sa cosa
 * esiste, e restano fuori solo le prove.
 */
export function territorio(ricetta, esiste = () => true, radice = "") {
  return [...new Set((ricetta.file_toccati || []).map((f) => nomeDelFile(f, radice)).filter((f) => f && !/^tests?\//.test(f) && !/(^|\/)__tests__\//.test(f) && esiste(f)))];
}

/**
 * Pacchetti e ondate, come in pacchetti-lotto.mjs: un pacchetto per file «caldo» (il file del
 * territorio che più ricette toccano), una squadra per pacchetto, e due pacchetti che condividono
 * anche un solo file non stanno mai nella stessa ondata. Pura: la prova la esegue.
 */
export function pianoDelleOndate(difetti, { esiste = () => true, perOndata = PER_ONDATA, radice = "" } = {}) {
  const conti = new Map();
  const conTerr = difetti.map((d) => ({ d, file: territorio(d.ricetta, esiste, radice) }));
  for (const { file } of conTerr) for (const f of file) conti.set(f, (conti.get(f) || 0) + 1);
  const pacchi = new Map();
  const liberi = [];
  for (const { d, file } of conTerr) {
    if (!file.length) {
      liberi.push(d.idx);
      continue;
    }
    const caldo = [...file].sort((a, b) => (conti.get(b) - conti.get(a)) || a.localeCompare(b))[0];
    if (!pacchi.has(caldo)) pacchi.set(caldo, { chiave: caldo, difetti: [], file: new Set(), ore: 0, peggiore: 2, rischio_alto: 0 });
    const p = pacchi.get(caldo);
    p.difetti.push(d.idx);
    for (const f of file) p.file.add(f);
    p.ore += ORE[d.ricetta.stima] ?? ORE.M;
    p.peggiore = Math.min(p.peggiore, PESO[d.severita] ?? 2);
    if ((d.lente_b?.rischio_rivisto || d.ricetta.rischio_nascita) === "alto") p.rischio_alto++;
  }
  const ordinati = [...pacchi.values()].sort((a, b) => a.peggiore - b.peggiore || b.ore - a.ore || a.chiave.localeCompare(b.chiave));
  const ondate = [];
  for (const p of ordinati) {
    let o = ondate.find((w) => w.length < perOndata && w.every((q) => ![...p.file].some((f) => q.file.has(f))));
    if (!o) ondate.push((o = []));
    o.push(p);
  }
  const ore = ondate.map((w) => Math.max(...w.map((p) => p.ore)));
  return {
    ondate: ondate.map((w) => w.map((p) => ({ ...p, file: [...p.file] }))),
    liberi,
    ore_per_ondata: ore,
    ore_in_fila: ore.reduce((s, x) => s + x, 0),
    ore_di_squadra: ordinati.reduce((s, p) => s + p.ore, 0),
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
  const repo = opz["--repo"] ? path.resolve(opz["--repo"]) : null;
  if (repo && !existsSync(path.join(repo, "package.json"))) cieco(`${repo} non sembra il repository del sito: manca package.json`);
  const esiste = repo ? (f) => existsSync(path.join(repo, f)) : () => true;
  const daRiparare = r.difetti.filter((d) => d.esito === "da_riparare" && d.ricetta);
  const squadra = daRiparare.filter((d) => LAVORO_DI_SQUADRA.has(d.ricetta.chi_ripara));
  const corsie = {};
  for (const d of daRiparare.filter((x) => !LAVORO_DI_SQUADRA.has(x.ricetta.chi_ripara))) (corsie[d.ricetta.chi_ripara] ||= []).push(d.idx);
  if (!squadra.length && !Object.keys(corsie).length) cieco("il ricettario non ha niente da riparare: zero non è un verde");
  // Una cartella qualunque con un package.json farebbe sparire quasi tutti i file e accorcerebbe il
  // piano fino a farlo sembrare finito (collaudo del 24/10): almeno metà dei file citati che non sono
  // prove deve esistere davvero.
  if (repo) {
    const citati = [...new Set(squadra.flatMap((d) => (d.ricetta.file_toccati || []).map((f) => nomeDelFile(f, repo)).filter((f) => f && !/^tests?\//.test(f) && !/^migrations\//.test(f))))];
    const trovati = citati.filter(esiste).length;
    if (citati.length && trovati * 2 < citati.length) cieco(`in ${repo} esistono solo ${trovati} dei ${citati.length} file citati dalle ricette: è la cartella giusta?`);
  }
  const conto = contoDelPiano(r.difetti, squadra, corsie);
  if (!conto.torna) cieco(`il conto non torna: ${conto.somma} difetti nel piano contro ${conto.totale} nel ricettario`);
  const piano = pianoDelleOndate(squadra, { esiste: (f) => esiste(f), radice: repo || "" });
  const pacchetti = piano.ondate.reduce((s, w) => s + w.length, 0);
  console.log(`🌊 ONDATE — ${squadra.length} difetti di codice in ${pacchetti} pacchetti, ${piano.ondate.length} ondate da al più ${PER_ONDATA} squadre${repo ? "" : " (senza --repo: conto come territorio anche i file che non esistono ancora)"}`);
  console.log(`Fuori dalle squadre: ${Object.entries(corsie).map(([k, v]) => `${k} ${v.length}`).join(" · ") || "nessuno"}`);
  console.log(`Fuori dal piano: già risolti ${conto.fuori.gia_risolti.length} · riservati ${conto.fuori.riservati.length} (la loro corsia) · senza ricetta ${conto.fuori.senza_ricetta.length} · da rivedere ${conto.fuori.da_rivedere.length}. Il conto torna: ${conto.somma} su ${conto.totale}.`);
  console.log(`Ore di squadra in tutto: ${piano.ore_di_squadra} · in fila, ondata dopo ondata: ${piano.ore_in_fila} (stima dei revisori: S mezz'ora, M un'ora e mezza, L quattro ore).`);
  console.log(`I file più caldi: ${piano.caldi.map(([f, n]) => `${f} (${n})`).join(", ")}`);
  piano.ondate.forEach((o, i) => {
    console.log(`── ONDATA ${i + 1} · ${piano.ore_per_ondata[i]} h`);
    for (const b of o) console.log(`  📦 ${b.chiave} · ${b.difetti.length} difetti · ${b.ore} h · idx ${b.difetti.join(",")}${b.rischio_alto ? ` · ⚠️ ${b.rischio_alto} a rischio alto di nascite` : ""}`);
  });
  if (piano.liberi.length) console.log(`── SENZA UN FILE ESISTENTE (solo prove o migrazioni nuove): ${piano.liberi.length} difetti, a una squadra a parte · idx ${piano.liberi.join(",")}`);
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
