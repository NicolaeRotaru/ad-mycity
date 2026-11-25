#!/usr/bin/env node
// 🩻 LA RADIOGRAFIA DEL SITO IN SESSIONI — il programma della regista.
//
// PERCHÉ ESISTE. La radiografia del 6/11 in 12 sessioni ha funzionato perché i controlli meccanici li faceva un
// programma (consegne/audit/2026-11-06-radiografia-12-sessioni/controlli.mjs). Ma quel programma era scritto per
// quel giorno: base, ramo, sessioni e cartella stavano in costanti, e la radiografia partiva incollando quattro
// testi a mano. Il conto misurato il 12/11 (costo-6-11.json): 327 $ le 12 sessioni, ogni sessione arrivata a
// 277-422 mila token di storia, il 97% dei token riletture; 175 difetti nuovi, nessun bloccante, mentre il giro di
// prova della palestra il 7/11 ha trovato il bloccante degli indirizzi con 1,3 milioni di token. Questo è quel
// programma reso generale, con le regole del risolutore del 12/11: profili (lancio prima di tutto), lotti piccoli
// per subagenti nuovi, minori nuovi vietati sopra la soglia, verifica solo per gravi e sicurezza, doppioni tolti
// da un programma prima della verifica, e un conto finale che non lascia sparire nessun difetto trovato.
// Il metodo, le fasi e le fermate stanno nella skill `radiografia-sessioni`.
//
// LE ONDE DELLA RIPARAZIONE, PORTATE QUI (24/11, Nicola: «crea lo stesso sistema anche per la radiografia»). Dal 12/11
// la riparazione ha girato nove onde e la settimana dei 700, e ogni regola che ha fallito come testo è diventata un
// programma (regola ㉕). La radiografia era rimasta al 12/11 e ha girato una volta sola, il ricontrollo del 21/11,
// con un primo passaggio scritto a mano nella cartella della campagna. Qui entrano: il prepasso come pezzo del
// programma; il ricontrollo diviso fra voci gravi (ultracode) e minori (senza), perché ultracode raddoppia il costo
// (4-8 $ a chiusa senza, 12-27 $ con, misure.json della riparazione); il preventivo SOLO dalle misure, scelte con la
// stessa configurazione (la riparazione prende ancora l'ultima riga: regola 1 del 21/11, solo testo); la riga delle
// misure scritta da un comando, senza la quale il registro non si scrive (regola 7 del 21/11); la falla scoperta
// durante un ricontrollo (il 21/11 i dettagli di dodici voci aperte sono finiti nei rami pubblici); i gravi visti di
// passaggio, che il ricontrollo non sapeva dove mettere; il costo in dollari nel referto; la sorveglianza muta, che
// sveglia la regia solo quando cambia qualcosa, e la sessione che non parte. Analisi:
// consegne/audit/2026-11-24-radiografia-a-onde/lezioni.md.
//
// Uso (dalla radice di ad-mycity):
//   node cervello/radiografia-sessioni.mjs <comando> [argomenti] --cartella <dir> [opzioni]
//
// Comandi:
//   prepara                   profilo → piano.json, mappa-file.txt, registro-compatto.txt, da-ricontrollare.txt, lotti/
//   schede                    scrive schede/SNN.md dal piano (--ramo, --regista)
//   preventivo                agenti, token e dollari stimati dal piano; dice se serve la firma (regola ⑱)
//   copertura-prima           ogni file e ogni voce in un lotto, ogni lente e angolo con un padrone o dichiarato fuori,
//                             schede uguali al piano, partenza corta
//   segnaposti                nelle schede non resta nessun segnaposto
//   guardia-ramo <ramo> <SNN> il ramo della sessione cambia solo il suo referto
//   valida-referto <file>     formato, asticella, regola dei minori (⑳), verifica proporzionata (⑲), tetto (⑱),
//                             lotti tutti dichiarati, nessun id sparito, riservate in forma fissa
//   sorveglia --onda N        per ogni sessione dell'onda: guardia-ramo e valida-referto sul referto parziale
//   doppioni                  i difetti contro il registro e fra le sessioni, prima della verifica finale
//   grezzo --data AAAA-MM-GG  il grezzo per il digest: i difetti tenuti, senza doppioni né regressioni
//   conti                     nessun difetto trovato è sparito: ogni id è nel grezzo, nei doppioni o negli scartati
//   applica --data … [--scrivi] i ricontrolli e le regressioni sul registro, per chiave (🟡 con --scrivi); con
//                             --scrivi vuole misura.json, e scrive da-riservare.txt (le voci che il ricontrollo
//                             ha scoperto essere falle)
//   copertura-dopo            i file letti o eseguiti dai referti, contro la mappa del perimetro
//   misura [--scrivi]         la riga delle misure dai referti (conto.usd) e da --usd-regia/--usd-cf; con --scrivi
//                             la aggiunge a cervello/radiografia/misure.json (mai due volte la stessa cartella)
//   segnali --onda N          i segnali nuovi per la regia (ramo, finita, ferma, non partita, attesa, spesa, quota)
//   sorveglia --onda N --attendi  la sorveglianza muta: aspetta in silenzio ed esce solo con un segnale nuovo (1) o
//                             al battito (4); --intervallo e --battito in secondi (300 e 7200)
//
// Opzioni di prepara: --ultracode dove-serve|no|tutte (predefinito dove-serve: le sessioni di ricontrollo delle
// voci gravi e le cercatrici dei temi a rischio alto) · --senza-prepasso (tutte le voci vanno agli agenti).
//
// Uscita: 0 verde · 1 rosso · 2 uso sbagliato o non ho potuto misurare · 3 in attesa (mai un verde muto) ·
// 4 battito della sorveglianza muta (niente di nuovo).
//
// Opzioni comuni:
//   --cartella <dir>   la cartella della radiografia (consegne/radiografia/AAAA-MM-GG-<nome>)
//   --radice <dir>     la radice di ad-mycity (predefinita: la cartella sopra questo file)
//   --sito <dir>       la copia del sito ($MARKETPLACE_REPO, <radice>/marketplace, ../mycity)
//   --base <sha>       il commit del sito (solo per `prepara`; gli altri lo leggono da piano.json)
//   --registro <file>  il registro del sito (predefinito: quello del vault)
//   --temi-file <file> il catalogo dei temi (predefinito: cervello/radiografia/temi.json)
//   --git <dir>        il deposito dove stanno i rami delle sessioni (predefinito: la radice)
//   --json             l'esito anche in JSON sull'ultima riga
//
// 🟢 Legge il sito e il registro, scrive solo nella cartella della radiografia. Il registro lo cambiano due passi
// della regista a fine lavoro: `applica --scrivi` (ricontrolli e regressioni, per chiave) e il digest sul grezzo.

import { existsSync, readFileSync, readdirSync, realpathSync, mkdtempSync, rmSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
// L'unico esecutore di git della casa: il tetto di maxBuffer sta lì, una volta sola (malattia «git-letto-senza-tetto»).
import { gitEsegui } from "./git-github.mjs";
import { chiaveProblema } from "./referti-sito.mjs";
import { timbroOra, msDaTimbro } from "./ora-piacenza.mjs";
// Ogni scrittura passa dalla porta della casa: fuori dalla memoria scrive dov'era, dentro rispetta la sola lettura e
// la sabbiera (misura-che-non-sporca, AR-639). Una scrittura fermata non è un verde muto: si dice.
import { scriviJsonAtomico, scriviTestoAtomico } from "./scrivi-json.mjs";
// La forma delle falle riservate è UNA sola per la casa: la stessa del risolutore (regoleNuoviDifetti). Se cambia lì,
// cambia qui: una riservata scritta bene per uno è scritta bene per l'altro.
import { chiaviDoppie, dataVera, TITOLO_RISERVATO, AREE_RISERVATE, PRIVATO, nuoviSegnali } from "./riparazione-sessioni.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const veroPercorso = (p) => { try { return realpathSync(p); } catch { return resolve(p); } };

// ── Le costanti del metodo ───────────────────────────────────────────────────────────────────────
export const SEVERITA = Object.freeze(["bloccante", "grave", "minore"]);
export const GRAVI = new Set(["bloccante", "grave"]);
export const PROVE = Object.freeze(["comando", "lettura-codice", "umano"]);
export const ESITI_RICONTROLLO = Object.freeze(["ancora_vero", "non_piu_vero", "cambiato", "non_verificabile"]);
export const STATI_CHIUSI = new Set(["riparato", "chiuso", "gia_riparato_prima"]);
export const CHI = Object.freeze(["cliente", "negozio", "fattorino", "admin", "estraneo"]);
export const RE_SESSIONE = /^S\d{2}[b-z]?$/;
export const SEP = " · ";
// I campi di una riservata: un elenco chiuso. Un campo in più («nota», «dettagli») porterebbe la falla in chiaro.
export const CAMPI_REFERTO = Object.freeze(["sessione", "base_sito", "aggiornato", "finita", "lotti", "copertura", "difetti", "scartati", "regressioni", "ricontrolli", "prove_per_la_palestra", "domande_per_nicola", "conto"]);
export const CAMPI_RICONTROLLO = Object.freeze(["chiave", "esito", "prova", "prova_tipo", "prova_eseguita", "esito_prova", "verificato", "verificato_da", "nota", "falla"]);
export const CAMPI_RISERVATA_RADIOGRAFIA = Object.freeze(["id", "trovato_da", "riservato", "titolo", "file", "severita", "dimensione", "prova_tipo", "prova_eseguita", "verificato", "verificato_da"]);
export const MODI_ULTRACODE = Object.freeze(["dove-serve", "no", "tutte"]);
const SEGNAPOSTI_REFERTO = ['"…"', '"una delle 24 lenti"', '"come lo diresti a voce"', "AAAA-MM-GG HH:MM"];
const SEGNAPOSTI_SCHEDA = ["<sha>", "<ramo>", "<id>", "<regista>", "<cartella>", "{{", "}}", "AAAA-MM-GG HH:MM"];
const BINARIO = /\.(png|jpe?g|gif|webp|avif|ico|svg|bmp|ttf|otf|woff2?|eot|mp3|mp4|webm|mov|pdf|zip)$/i;

// ── Opzioni ──────────────────────────────────────────────────────────────────────────────────────
const BOOLEANE = new Set(["json", "scrivi", "senza-prepasso", "attendi", "tutti"]);
export function leggiOpzioni(argv) {
  const opz = { posizionali: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const nome = a.slice(2);
      if (BOOLEANE.has(nome)) { opz[nome] = true; continue; }
      const v = argv[i + 1];
      if (v === undefined || v.startsWith("--")) throw new Error(`manca il valore di ${a}`);
      opz[nome] = v;
      i++;
    } else opz.posizionali.push(a);
  }
  opz.radice = resolve(opz.radice ?? join(QUI, ".."));
  if (opz.cartella) opz.cartella = resolve(opz.cartella);
  opz.registro = resolve(opz.registro ?? join(opz.radice, "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json"));
  opz.dimensioni = resolve(opz.dimensioni ?? join(opz.radice, "cervello/dimensioni-radiografia.json"));
  opz["temi-file"] = resolve(opz["temi-file"] ?? join(QUI, "radiografia/temi.json"));
  opz.git = resolve(opz.git ?? opz.radice);
  const candidati = [opz.sito, process.env.MARKETPLACE_REPO, join(opz.radice, "marketplace"), join(opz.radice, "..", "mycity")].filter(Boolean);
  opz.sito = resolve(candidati.find((c) => existsSync(join(c, ".git"))) ?? candidati[0]);
  return opz;
}

// ── Aiutanti ─────────────────────────────────────────────────────────────────────────────────────
// `grezzo`: i byte esatti, senza .trim(), perché il conto delle righe di un file deve restare quello vero
const git = (dir, args) => gitEsegui(["-C", dir, ...args], undefined, {}, { grezzo: true }).toString("utf8");
function gitOk(dir, args) { try { return git(dir, args); } catch { return null; } }
const vuoto = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0);
// Un campo che dice CHI (un verificatore, un permesso) è pieno solo se è un testo: false, 0 o {} non sono nessuno
// (collaudo del 12/11: con vuoto() un «verificato_da: false» valeva come verificatore).
const testo = (v) => typeof v === "string" && v.trim() !== "";
const piatto = (v) => String(v ?? "").replace(/[\t\r\n]+/g, " ").trim();
const leggiJson = (p) => JSON.parse(readFileSync(p, "utf8"));
function scriviTesto(p, t) {
  if (scriviTestoAtomico(p, t) === null) throw new Error(`la scrittura di ${p} è stata fermata dal freno della memoria (sola lettura)`);
}
const scriviJson = (p, d) => scriviTesto(p, JSON.stringify(d, null, 2) + "\n");
const due = (n) => String(n).padStart(2, "0");
const tre = (n) => String(n).padStart(3, "0");
export const eRiservataTitolo = (t) => /^\s*falla di sicurezza/i.test(String(t ?? ""));
const rel = (opz, p) => relative(opz.radice, p).split("\\").join("/");

export function caricaTemi(opz) {
  const t = leggiJson(opz["temi-file"]);
  if (!t?.temi || !t?.profili || !Array.isArray(t?.regole_file) || !t?.misure) throw new Error(`${opz["temi-file"]}: mancano temi, profili, regole_file o misure`);
  return t;
}
export function lentiDelSito(opz) {
  const l = leggiJson(opz.dimensioni)?.case?.marketplace?.dimensioni;
  if (!Array.isArray(l) || l.length === 0) throw new Error(`nessuna lente della casa marketplace in ${opz.dimensioni}`);
  return l;
}
function leggiPiano(opz) {
  if (!opz.cartella) throw new Error("serve --cartella");
  const p = join(opz.cartella, "piano.json");
  if (!existsSync(p)) throw new Error(`manca ${p}: prima «prepara»`);
  return leggiJson(p);
}
function leggiSessioni(opz) {
  const p = join(opz.cartella, "sessioni.json");
  return existsSync(p) ? leggiJson(p) : null;
}

// ── La mappa dei file: chi possiede cosa ─────────────────────────────────────────────────────────
export function segnoDi(p) {
  if (BINARIO.test(p)) return "binario";
  if (/^tests\//.test(p) || /^docs\/mockup\//.test(p) || /(^|\/)__tests__\//.test(p) || /\.(test|spec)\.[cm]?[jt]sx?$/.test(p)) return "strumento";
  if (/\.(md|txt)$/i.test(p) || /^docs\//.test(p)) return "documento";
  return "codice";
}
// I file della radice che non sono codice di pagina: configurazione, README, prompt.
export const radiceConfig = (p) => !p.includes("/") && !/^(middleware|i18n|instrumentation.*|sentry\..*)\.ts$/.test(p) && !["vercel.json", "next.config.js"].includes(p);
export function compilaRegole(temi) {
  return temi.regole_file.map(([re, chi]) => [re === "@radice-config" ? radiceConfig : new RegExp(re), chi]);
}
export function proprietariDi(p, regole) {
  const s = new Set();
  for (const [re, chi] of regole) if (typeof re === "function" ? re(p) : re.test(p)) chi.forEach((x) => s.add(x));
  return [...s].sort();
}
function fileDelSito(opz, base) {
  const out = gitOk(opz.sito, ["ls-tree", "-r", "-l", base]);
  if (out === null) throw new Error(`il commit ${base} non c'è nella copia del sito ${opz.sito}`);
  const elenco = [];
  for (const r of out.split("\n")) {
    const m = r.match(/^\d+\s+blob\s+[0-9a-f]+\s+(\d+|-)\t(.+)$/);
    if (m) elenco.push({ f: m[2], byte: m[1] === "-" ? 0 : Number(m[1]) });
  }
  return elenco;
}
const righeCache = new Map();
function righeDi(opz, base, percorso) {
  const k = `${base}:${percorso}`;
  if (righeCache.has(k)) return righeCache.get(k);
  // solo un file vero (blob): una cartella risponde anche lei a `git show` (collaudo del 6/11)
  const tipo = (gitOk(opz.sito, ["cat-file", "-t", k]) ?? "").trim();
  let n = null;
  if (tipo === "blob") {
    const testo = gitOk(opz.sito, ["show", k]);
    n = testo === null ? null : testo.split("\n").length - (testo.endsWith("\n") ? 1 : 0);
  }
  righeCache.set(k, n);
  return n;
}

// ── Il registro ──────────────────────────────────────────────────────────────────────────────────
export function contaMinoriAperti(problemi) {
  return problemi.filter((p) => p?.stato === "aperto" && String(p?.severita).toLowerCase() === "minore").length;
}
export function primoFile(campo) {
  const m = String(campo ?? "").split(/\s+·\s+|,\s+/)[0]?.trim().match(/^([^\s:()]+\.[A-Za-z0-9]+)(?::\d+(?:-\d+)?)?$/);
  return m ? m[1].replace(/^marketplace\//, "") : null;
}
export function fileCitati(campo) {
  return String(campo ?? "").split(/\s+·\s+|,\s+/).map((x) => x.trim().match(/^([^\s:()]+\.[A-Za-z0-9]+)(?::(\d+)(?:-(\d+))?)?$/)).filter(Boolean)
    .map((m) => ({ f: m[1].replace(/^marketplace\//, ""), da: m[2] ? Number(m[2]) : null, a: m[3] ? Number(m[3]) : m[2] ? Number(m[2]) : null }));
}

// ── il prepasso: quello che un programma sa dire di una voce prima che la guardi un agente ───────────
// Nato il 21/11 come script della campagna (consegne/riparazioni/2026-11-21-settimana-700/prepasso.mjs): delle 674
// voci aperte non riservate, 214 avevano i file fermi, o le righe citate ferme, dall'ultima volta che la voce era stata
// vista vera, e non sono andate agli agenti; le 459 rimaste, in 4 sessioni, hanno chiuso 117 voci con circa 105 $
// (0,23 $ a voce guardata, meno di 1 $ a chiusa, contro 4-8 $ di una chiusura con riparazione). Era il pezzo più
// conveniente del lavoro, e stava fuori dal programma: copertura-prima non lo poteva rifare, e ogni ricontrollo lo
// avrebbe riscritto (regola ⑬). Qui lo usa `prepara`, e `copertura-prima` lo rifà e lo confronta.
// Una voce tenuta dal programma NON si chiude: resta aperta com'era. Il prepasso toglie lavoro, mai difetti.
export const CLASSI_DA_GUARDARE = Object.freeze(["righe_toccate", "senza_data", "senza_file", "file_spariti", "file_ambigui", "chiusura_da_confermare"]);
// il percorso e TUTTE le sue righe: «payout.ts:921-927, 1662, 1869-1889» sono quattro intervalli. Il collaudo A del 24/11
// ha trovato due gravi sui soldi tenuti fuori perché si leggeva solo il primo.
const RE_PERCORSO_PP = /((?:[\w@.\-\[\]()]+\/)*[\w@.\-\[\]]+\.(?:tsx|ts|jsx|json|js|mjs|cjs|sql|css|md|yml|yaml|toml|html|txt|sh))(?![\w])(?::(\d+(?:-\d+)?(?:\s*,\s*\d+(?:-\d+)?)*))?/g;
/** Gli intervalli di riga di una citazione: «10-12, 300» → [[10,12],[300,300]]. Senza righe: [[null,null]]. PURA. */
export function intervalliDi(testo) {
  if (!testo) return [[null, null]];
  return String(testo).split(/\s*,\s*/).map((x) => x.match(/^(\d+)(?:-(\d+))?$/)).filter(Boolean).map((m) => [Number(m[1]), m[2] ? Number(m[2]) : Number(m[1])]);
}
const dataIn = (v) => (String(v ?? "").match(/20\d\d-\d\d-\d\d(?:[ T]\d\d:\d\d)?/) ?? [null])[0];
/** Una voce dichiarata riparata (un campo riparazione_GG_MM con esito riparato o già riparato) ma ancora aperta. PURA. */
export function dichiarataRiparata(p) {
  return Object.entries(p ?? {}).some(([k, v]) => /^riparazione_\d+_\d+$/.test(k) && v && typeof v === "object" && ["riparato", "gia_riparato_prima"].includes(v.esito));
}
/**
 * L'ultima riverifica della voce dice «non più vero», ma la voce è ancora aperta: una chiusura proposta e mai
 * confermata (un grave senza verificatore). Va agli agenti sempre: è la chiusura più economica che ci sia, e il
 * programma stesso scrive questo caso (collaudo A del 24/11). PURA.
 */
export function chiusuraDaConfermare(p) {
  const riv = Object.entries(p ?? {}).filter(([k, v]) => /^riverifica(_\d+_\d+)?$/.test(k) && v && typeof v === "object" && dataIn(v.data))
    .sort((a, b) => String(dataIn(b[1].data)).localeCompare(String(dataIn(a[1].data))));
  return riv.length > 0 && (riv[0][1].esito ?? riv[0][1].verdetto) === "non_piu_vero";
}
/** Le volte che la voce è stata vista vera, dalla più recente: riverifiche, riapertura, nascita. PURA. */
export function confermeDi(p) {
  const out = [];
  for (const [k, v] of Object.entries(p ?? {})) {
    if (!/^riverifica(_\d+_\d+)?$/.test(k) || !v || typeof v !== "object") continue;
    const esito = v.esito ?? v.verdetto;
    // «non più vero» non è una conferma che la voce c'è: è una chiusura che aspetta il suo verificatore
    if (["non_verificabile", "non_era_un_difetto", "non_piu_vero"].includes(esito)) continue;
    if (k === "riverifica_1_11" && esito !== "presente") continue;
    const d = dataIn(v.data);
    if (d) out.push({ d, c: typeof v.codice === "string" ? v.codice : null, da: k });
  }
  if (p?.riaperto_il && dataIn(p.riaperto_il)) out.push({ d: dataIn(p.riaperto_il), c: null, da: "riaperta" });
  const nascita = dataIn(p?.fonte_radiografia) ?? dataIn(p?.fonte);
  if (nascita) out.push({ d: nascita, c: null, da: "nascita" });
  return out.sort((a, b) => String(b.d).localeCompare(String(a.d)));
}
/** La classe di una voce dai fatti del sito. PURA. */
export function classePrepasso({ citati, spariti, commit, cambiati, toccati, righeToccate, ambigui = 0, daConfermare = false }) {
  if (daConfermare) return "chiusura_da_confermare";
  if (ambigui > 0) return "file_ambigui";
  if (citati.length === 0) return "senza_file";
  if (spariti.length) return "file_spariti";
  if (!commit || !cambiati) return "senza_data";
  if (toccati.length) return righeToccate ? "righe_toccate" : "righe_ferme";
  return "fermo";
}
/** Va a un agente: le classi che chiedono uno sguardo, e ogni voce dichiarata riparata ma aperta (chiusura a buon mercato). PURA. */
export const daGuardare = (e) => CLASSI_DA_GUARDARE.includes(e.classe) || e.dichiarata_riparata === true;

/**
 * Il prepasso su un elenco di voci del registro, al commit `base` della copia del sito. Legge solo git.
 * Su una copia senza storia (clone corto) le date non si trovano: le voci diventano «senza_data» e vanno tutte agli
 * agenti. È il verso sicuro: il prepasso può solo togliere lavoro che la storia dice inutile.
 */
export function prepassoVoci(opz, base, problemi) {
  const g = (args) => git(opz.sito, args);
  const allaBase = new Set(fileDelSito(opz, base).map((x) => x.f));
  const perNome = new Map();
  for (const f of allaBase) { const n = f.split("/").pop(); if (!perNome.has(n)) perNome.set(n, []); perNome.get(n).push(f); }
  const memo = (fn) => { const m = new Map(); return (k) => { if (!m.has(k)) m.set(k, fn(k)); return m.get(k); }; };
  // Una data, due versioni possibili del sito: la linea principale (--first-parent) e l'ultimo commit di qualunque ramo
  // (un ramo di riparazione, dove nascono i difetti visti dai controllori). Il collaudo A del 24/11 ha mostrato che
  // l'una o l'altra da sola tiene fuori voci che l'altra manda agli agenti: si guardano tutte e due, e basta una che
  // dica «toccato» per mandare la voce agli agenti.
  const primaDi = (d) => `--before=${d.length === 10 ? `${d} 23:59` : d}`;
  const commitsAllaData = memo((d) => {
    const uno = (extra) => { try { return g(["rev-list", "-1", ...extra, primaDi(d), base]).trim() || null; } catch { return null; } };
    return [...new Set([uno(["--first-parent"]), uno([])].filter(Boolean))];
  });
  const commitVero = memo((c) => { try { return g(["rev-parse", "--verify", "--quiet", `${c}^{commit}`]).trim() || null; } catch { return null; } });
  const cambiatiDa = memo((c) => { try { return new Set(g(["diff", "--name-only", "--no-renames", `${c}..${base}`]).split("\n").filter(Boolean)); } catch { return null; } });
  const pezzi = memo((k) => {
    const [rif, f] = k.split("\u0000");
    try { return [...g(["diff", "-U0", "--no-renames", `${rif}..${base}`, "--", f]).matchAll(/^@@ -(\d+)(?:,(\d+))? /gm)].map((m) => [Number(m[1]), m[2] === undefined ? 1 : Number(m[2])]); } catch { return null; }
  });
  const risolvi = (f) => {
    if (allaBase.has(f)) return f;
    const coda = [...allaBase].filter((x) => x.endsWith("/" + f));
    return coda.length === 1 ? coda[0] : coda.length > 1 ? { ambiguo: f } : null;
  };
  // i percorsi anche dentro le note fra parentesi: «app/x.tsx:12-20 (spiegazione) · lib/y.ts (…)»
  // un nome che porta a più file è un «non lo so»: la voce va agli agenti (collaudo A del 24/11)
  const citatiDi = (campo) => {
    const visti = new Map();
    let ambigui = 0;
    for (const m of String(campo ?? "").matchAll(RE_PERCORSO_PP)) {
      let f = m[1].replace(/^[(`'"«]+/, "").replace(/^.*?\/marketplace\//, "").replace(/^marketplace\//, "").replace(/^\.\//, "");
      if (f.startsWith("http") || f.includes("//") || /(^|\/)(node_modules|\.next)\//.test(f) || f.startsWith("cervello/") || f.includes("*")) continue;
      if (!f.includes("/") && !/\.(sql|sh)$/.test(f) && !allaBase.has(f)) {
        const n = perNome.get(f); // un nome nudo vale solo se nel sito c'è un file solo con quel nome
        if (!n) continue;
        if (n.length !== 1) { ambigui++; continue; }
        f = n[0];
      }
      const r = risolvi(f);
      if (r && typeof r === "object") { ambigui++; continue; }
      const ff = r ?? f;
      for (const [da, a] of intervalliDi(m[2])) if (!visti.has(`${ff}:${da}`)) visti.set(`${ff}:${da}`, { f: ff, da, a });
    }
    return { citati: [...visti.values()], ambigui };
  };
  const esiti = [];
  for (const p of problemi) {
    const conferme = confermeDi(p);
    const ult = conferme[0] ?? null;
    let commits = [];
    if (ult) { const c = ult.c && commitVero(ult.c); commits = c ? [c] : commitsAllaData(ult.d); }
    const commit = commits[0] ?? null;
    const { citati, ambigui } = citatiDi(p.file);
    const daConfermare = chiusuraDaConfermare(p);
    const spariti = citati.filter((x) => !allaBase.has(x.f)).map((x) => x.f);
    // i file cambiati dall'ultima conferma: l'unione delle versioni possibili (null se una non si legge)
    const insiemi = commits.map(cambiatiDa);
    const cam = commits.length && insiemi.every(Boolean) ? new Set(insiemi.flatMap((x) => [...x])) : null;
    const toccati = cam ? [...new Set(citati.filter((x) => cam.has(x.f)).map((x) => x.f))] : [];
    // le righe citate sono di quando la voce è nata: il confronto parte dal commit della nascita. Senza la data di
    // nascita non si sa a quale versione del file appartengono: il file è cambiato, quindi la voce va agli agenti
    let righeToccate = null;
    if (toccati.length) {
      const nascita = conferme.find((c) => c.da === "nascita");
      const rifs = nascita ? commitsAllaData(nascita.d) : [];
      righeToccate = false;
      for (const x of citati) {
        if (!cam.has(x.f)) continue;
        if (!x.da || !rifs.length) { righeToccate = true; break; }
        const tocca = (rif) => { const pz = pezzi(`${rif}\u0000${x.f}`); return pz === null || pz.some(([a, n]) => (n === 0 ? a >= x.da - 1 && a <= x.a : a <= x.a && a + n - 1 >= x.da)); };
        if (rifs.some(tocca)) { righeToccate = true; break; }
      }
    }
    const righeFuori = citati.filter((x) => allaBase.has(x.f) && x.a && (righeDi(opz, base, x.f) ?? Infinity) < x.a).map((x) => `${x.f}:${x.a}`);
    esiti.push({
      chiave: chiaveProblema(p), gravita: String(p.severita ?? "").toLowerCase(),
      // righe citate oltre la fine del file: il file è cambiato sotto la voce, anche se la storia dice «fermo»
      classe: ((c) => (righeFuori.length && !CLASSI_DA_GUARDARE.includes(c) ? "righe_toccate" : c))(classePrepasso({ citati, spariti, commit, cambiati: cam, toccati, righeToccate, ambigui, daConfermare })),
      conferma: ult ? `${ult.d} (${ult.da})` : null, commit: commit ? commit.slice(0, 12) : null,
      spariti, toccati, righe_fuori: righeFuori, dichiarata_riparata: dichiarataRiparata(p),
    });
  }
  return esiti;
}
/** Il riassunto del prepasso per il piano e per la fermata 1. PURA. */
export function sintesiPrepasso(esiti) {
  const per = {};
  for (const e of esiti) per[e.classe] = (per[e.classe] ?? 0) + 1;
  const guardate = esiti.filter(daGuardare).length;
  return { voci: esiti.length, guardate, tenute_dal_programma: esiti.length - guardate, per_classe: per };
}

/**
 * Le voci che il ricontrollo guarda: aperte, non riservate, delle gravità del profilo (e nel perimetro della
 * funzione), poi il prepasso. Una funzione sola per `prepara` e `copertura-prima`: la seconda rifà la scelta della
 * prima, invece di fidarsi di da-ricontrollare.txt.
 */
function vociDaRicontrollare(opz, { problemi, profilo, profiloNome, temiScelti, fileNelPerimetro, base, prepasso }) {
  const candidate = [];
  if (!temiScelti.includes("S01")) return { candidate, daRic: [], esiti: null };
  for (const p of problemi) {
    const g = String(p.severita ?? "").toLowerCase();
    if (p.stato !== "aperto" || eRiservataTitolo(p.titolo) || !profilo.ricontrollo.includes(g)) continue;
    if (profiloNome === "funzione" && !fileCitati(p.file).some((c) => fileNelPerimetro.has(c.f))) continue;
    candidate.push({ p, chiave: chiaveProblema(p), gravita: g, file: piatto(p.file), titolo: piatto(p.titolo), primo: primoFile(p.file) });
  }
  if (!prepasso) return { candidate, daRic: candidate, esiti: null };
  const esiti = prepassoVoci(opz, base, candidate.map((v) => v.p));
  const tieni = new Set(esiti.filter(daGuardare).map((e) => e.chiave));
  return { candidate, daRic: candidate.filter((v) => tieni.has(v.chiave)), esiti };
}

/**
 * Le voci da ricontrollare divise in sessioni: prima le gravi e le bloccanti (delicate: ultracode e verificatore
 * per chiuderle), poi le minori, mai mischiate. Il 21/11 ogni sessione aveva dentro qualche grave, e ultracode è
 * stato acceso su tutte e quattro; nella riparazione ultracode costa il doppio per voce lavorata (4,16 $ contro
 * 2,22 $, onde 1 e 2). Gli id continuano le lettere: S01, S01b, S01c… PURA.
 */
/**
 * Le onde: prima il rischio alto, poi il resto, perOnda al massimo. Con `pilota` (un numero) la prima onda porta tutto
 * il ricontrollo e al massimo `pilota` cercatrici, le prime a rischio alto. PURA.
 */
export function ordinaOnde(sessioni, perOnda, pilota = null) {
  const ids = Object.keys(sessioni);
  const ordinate = [...ids].sort((a, b) => (sessioni[a].rischio === "alto" ? 0 : 1) - (sessioni[b].rischio === "alto" ? 0 : 1) || a.localeCompare(b));
  const onde = [];
  let resto = ordinate;
  if (pilota !== null && ordinate.some((x) => sessioni[x].tema !== "S01")) {
    const ric = ordinate.filter((x) => sessioni[x].tema === "S01");
    const cerca = ordinate.filter((x) => sessioni[x].tema !== "S01").slice(0, Math.max(1, Math.min(pilota, perOnda - Math.min(ric.length, perOnda - 1))));
    const prima = [...ric.slice(0, perOnda - cerca.length), ...cerca];
    onde.push(prima);
    resto = ordinate.filter((x) => !prima.includes(x));
  }
  for (let i = 0; i < resto.length; i += perOnda) onde.push(resto.slice(i, i + perOnda));
  return onde;
}
export function lottiRicontrollo(voci, perLotto, lottiMax) {
  const pezzi = [];
  for (const delicata of [true, false]) {
    const lotti = lottiDiVoci(voci.filter((v) => GRAVI.has(v.gravita) === delicata), perLotto);
    for (let i = 0; i < lotti.length; i += lottiMax) pezzi.push({ lotti: lotti.slice(i, i + lottiMax), delicata });
  }
  return pezzi.map((x, k) => ({ id: k === 0 ? "S01" : `S01${String.fromCharCode(97 + k)}`, ...x }));
}

// ── prepara ──────────────────────────────────────────────────────────────────────────────────────
/**
 * Divide i file di un tema in lotti da ~kb_per_lotto, tenendo insieme le cartelle. PURA.
 * Un file più grosso del lotto sta da solo nel suo lotto.
 */
export function lottiDiFile(file, kbPerLotto) {
  const ordinati = [...file].sort((a, b) => a.f.localeCompare(b.f));
  const lotti = [];
  let cor = null;
  for (const x of ordinati) {
    const kb = x.byte / 1024;
    if (!cor || (cor.kb + kb > kbPerLotto && cor.file.length > 0)) { cor = { file: [], kb: 0 }; lotti.push(cor); }
    cor.file.push(x.f);
    cor.kb += kb;
  }
  return lotti.map((l) => ({ file: l.file, kb: Math.round(l.kb) }));
}
/** Le voci da ricontrollare in lotti da N, raggruppate per primo file. PURA. */
export function lottiDiVoci(voci, perLotto) {
  const ordinate = [...voci].sort((a, b) => String(a.primo ?? "~").localeCompare(String(b.primo ?? "~")) || a.chiave.localeCompare(b.chiave));
  const lotti = [];
  for (let i = 0; i < ordinate.length; i += perLotto) lotti.push({ voci: ordinate.slice(i, i + perLotto) });
  return lotti;
}
/** Un tema con più lotti del massimo si spezza in S06, S06b, S06c… PURA. */
export function spezza(idTema, lotti, lottiMax) {
  const fuori = [];
  for (let i = 0; i < lotti.length; i += lottiMax) {
    const k = i / lottiMax;
    fuori.push({ id: k === 0 ? idTema : `${idTema}${String.fromCharCode(97 + k)}`, lotti: lotti.slice(i, i + lottiMax) });
  }
  return fuori;
}

function prepara(opz) {
  const profiloNome = opz.profilo;
  if (!opz.cartella || !profiloNome || !opz.base) return uso("prepara --profilo <lancio|tutto|funzione|scelta|ricontrollo> --base <sha del sito> --cartella <dir> [--temi S02,S04] [--diff base..testa]");
  if (!/^[0-9a-f]{40}$/.test(opz.base)) return chiudi("prepara", [`--base vuole lo SHA intero (40 caratteri): «${opz.base}»`], [], opz);
  const T = caricaTemi(opz);
  const profilo = T.profili[profiloNome];
  if (!profilo) return chiudi("prepara", [`profilo «${profiloNome}» sconosciuto: ${Object.keys(T.profili).join(", ")}`], [], opz);
  const M = T.misure;
  const regole = compilaRegole(T);
  const tuttiFile = fileDelSito(opz, opz.base);
  const rossi = [];

  // il perimetro dei file: tutto il sito, o solo quelli cambiati da una funzione
  let perimetroFile = tuttiFile;
  if (profiloNome === "funzione") {
    if (!opz.diff || !/^[^.\s]+\.\.[^.\s]+$/.test(opz.diff)) return uso("prepara --profilo funzione --diff <base>..<testa>");
    const cambiati = new Set((gitOk(opz.sito, ["diff", "--name-only", "--no-renames", opz.diff]) ?? "").split("\n").filter(Boolean));
    if (cambiati.size === 0) return chiudi("prepara", [], [`il diff ${opz.diff} non cambia nessun file (o non si legge nella copia del sito)`], opz);
    perimetroFile = tuttiFile.filter((x) => cambiati.has(x.f));
  }

  // i temi del profilo
  let temiScelti;
  if (profiloNome === "scelta") {
    if (!opz.temi) return uso("prepara --profilo scelta --temi S02,S04 …");
    temiScelti = opz.temi.split(",").map((s) => s.trim()).filter(Boolean);
  } else if (profiloNome === "funzione") {
    const s = new Set(["S01"]);
    for (const x of perimetroFile) if (segnoDi(x.f) === "codice") proprietariDi(x.f, regole).forEach((t) => s.add(t));
    temiScelti = [...s].sort();
  } else temiScelti = [...profilo.temi];
  if (opz.temi && profiloNome !== "scelta") temiScelti = [...new Set([...temiScelti, ...opz.temi.split(",").map((s) => s.trim()).filter(Boolean)])].sort();
  for (const t of temiScelti) if (!T.temi[t]) rossi.push(`il tema «${t}» non è in ${basename(opz["temi-file"])}`);
  if (rossi.length) return chiudi("prepara", rossi, [], opz);

  // il registro: compatto (tutte le voci, le riservate ridotte) e da ricontrollare (aperte non riservate del profilo)
  const reg = leggiJson(opz.registro);
  const problemi = Array.isArray(reg?.problemi) ? reg.problemi : null;
  if (!problemi || problemi.length === 0) return chiudi("prepara", [`il registro ${opz.registro} non ha «problemi»`], [], opz);
  const minoriAperti = contaMinoriAperti(problemi);
  const minoriAmmessi = profilo.minori === true && minoriAperti <= M.soglia_minori;
  const gravita = profilo.gravita.filter((g) => g !== "minore" || minoriAmmessi);
  const modoUC = opz.ultracode ?? "dove-serve";
  if (!MODI_ULTRACODE.includes(modoUC)) return uso(`prepara --ultracode <${MODI_ULTRACODE.join("|")}>`);
  const fileNelPerimetro = new Set(perimetroFile.map((x) => x.f));
  const compatto = ["# chiave\tstato\tgravita\tdimensione\tfile\ttitolo  (le riservate: solo chiave, stato, gravità e titolo; si legge con grep, mai con Read)"];
  for (const p of problemi) {
    const chiave = chiaveProblema(p);
    const g = String(p.severita ?? "").toLowerCase();
    if (eRiservataTitolo(p.titolo)) { compatto.push([chiave, p.stato, g, "-", "-", piatto(p.titolo)].join("\t")); continue; }
    compatto.push([chiave, p.stato, g, piatto(p.dimensione), piatto(p.file), piatto(p.titolo)].join("\t"));
  }
  const prepasso = !opz["senza-prepasso"];
  const scelta = vociDaRicontrollare(opz, { problemi, profilo, profiloNome, temiScelti, fileNelPerimetro, base: opz.base, prepasso });
  const daRic = scelta.daRic;
  scriviTesto(join(opz.cartella, "registro-compatto.txt"), compatto.join("\n") + "\n");
  scriviTesto(join(opz.cartella, "da-ricontrollare.txt"), [`# chiave\tgravita\tfile\ttitolo  (le voci aperte NON riservate del profilo, per S01${scelta.esiti ? ", dopo il prepasso" : ""})`, ...daRic.map((v) => [v.chiave, v.gravita, v.file, v.titolo].join("\t"))].join("\n") + "\n");
  let infoPrepasso = null;
  if (scelta.esiti) {
    infoPrepasso = { ...sintesiPrepasso(scelta.esiti), storia_corta: (gitOk(opz.sito, ["rev-parse", "--is-shallow-repository"]) ?? "").trim() === "true" };
    scriviJson(join(opz.cartella, "prepasso.json"), { base: opz.base, sintesi: infoPrepasso, esiti: scelta.esiti });
    scriviTesto(join(opz.cartella, "prepasso.tsv"), ["chiave\tgravita\tclasse\tagli_agenti\tconferma\tcommit\tdichiarata_riparata\tspariti\ttoccati\trighe_fuori",
      ...scelta.esiti.map((e) => [e.chiave, e.gravita, e.classe, daGuardare(e) ? "sì" : "no", e.conferma ?? "-", e.commit ?? "-", e.dichiarata_riparata ? "sì" : "no", e.spariti.join(" "), e.toccati.join(" "), e.righe_fuori.join(" ")].join("\t"))].join("\n") + "\n");
  }

  // la mappa: ogni file del perimetro coi suoi proprietari (tutti) e il segno
  const mappa = [];
  const conti = { codice: 0, documento: 0, strumento: 0, binario: 0 };
  const orfani = [];
  const perTema = Object.fromEntries(temiScelti.map((t) => [t, []]));
  let fuoriTema = 0;
  for (const x of perimetroFile) {
    const chi = proprietariDi(x.f, regole);
    const segno = segnoDi(x.f);
    conti[segno]++;
    if (chi.length === 0) orfani.push(x.f);
    mappa.push(`${x.f}\t${chi.join(",") || "-"}\t${segno}`);
    if (segno !== "codice") continue;
    const miei = chi.filter((t) => perTema[t]);
    if (miei.length === 0 && chi.length) fuoriTema++;
    miei.forEach((t) => perTema[t].push(x));
  }
  scriviTesto(join(opz.cartella, "mappa-file.txt"), [
    `# mappa dei file del sito a ${opz.base}: percorso<TAB>temi<TAB>segno (profilo ${profiloNome}${opz.diff ? `, diff ${opz.diff}` : ""})`,
    `# file: ${perimetroFile.length} · codice ${conti.codice} · documento ${conti.documento} · strumento ${conti.strumento} · binario ${conti.binario}`,
    `# senza proprietario: ${orfani.length} · codice dei soli temi fuori dal profilo: ${fuoriTema}`,
    ...mappa,
  ].join("\n") + "\n");
  if (orfani.length) rossi.push(`${orfani.length} file senza nessun tema: ${orfani.slice(0, 15).join(", ")}${orfani.length > 15 ? "…" : ""} (aggiungi una regola in ${basename(opz["temi-file"])})`);

  // le sessioni: lotti, spezzate oltre lotti_max
  const sessioni = {};
  const righeLotti = {};
  // ultracode solo dove serve (regola 5 del 15/11, firmata): il ricontrollo delle voci gravi, che si chiudono solo con
  // un verificatore, e le cercatrici dei temi a rischio alto quando si cercano gravi; il resto senza
  const cercaGravi = gravita.some((g) => GRAVI.has(g));
  for (const t of temiScelti) {
    const def = T.temi[t];
    // un tema senza file né voci nel perimetro non apre una sessione
    const pezzi = t === "S01"
      ? lottiRicontrollo(daRic, M.voci_per_lotto_ricontrollo, M.lotti_max)
      : spezza(t, lottiDiFile(perTema[t], M.kb_per_lotto), M.lotti_max).map((x) => ({ ...x, delicata: def.rischio === "alto" && cercaGravi }));
    for (const pezzo of pezzi) {
      sessioni[pezzo.id] = {
        tema: t, nome: def.nome, rischio: def.rischio, lenti: def.lenti, angoli: def.angoli, prefissi: def.prefissi ?? [],
        tetto: M.tetto_subagenti,
        ultracode: modoUC === "tutte" || (modoUC === "dove-serve" && pezzo.delicata === true),
        ...(t === "S01" ? { voci_gravi: pezzo.delicata === true } : {}),
        lotti: pezzo.lotti.map((l, i) => t === "S01"
          ? { id: `L${due(i + 1)}`, voci: l.voci.length }
          : { id: `L${due(i + 1)}`, file: l.file.length, kb: l.kb }),
      };
      righeLotti[pezzo.id] = pezzo.lotti.flatMap((l, i) => t === "S01"
        ? l.voci.map((v) => `L${due(i + 1)}\t${v.chiave}\t${v.gravita}\t${v.file}\t${v.titolo}`)
        : l.file.map((f) => `L${due(i + 1)}\t${f}`));
    }
  }
  const ids = Object.keys(sessioni);
  if (ids.length === 0) rossi.push("il profilo non apre nessuna sessione: niente file né voci nel perimetro");
  if (ids.length > M.max_sessioni) rossi.push(`il profilo chiede ${ids.length} sessioni, oltre il massimo di ${M.max_sessioni} (tre onde da ${M.sessioni_per_onda}): restringi i temi (--profilo scelta) o dividi in due radiografie`);
  // le onde: prima il rischio alto (soldi, cassa, accessi), poi il resto; sessioni_per_onda al massimo
  // l'onda pilota: finché la ricerca a lotti non ha una misura, la prima onda porta il ricontrollo e al massimo
  // stima.cerca_pilota cercatrici (regola 10 del 15/11: una novità alla volta). Le misure si leggono qui come nel preventivo.
  const misureFile = resolve(opz.misure ?? join(QUI, "radiografia/misure.json"));
  // un file delle misure che non si legge non vale «nessuna misura» in silenzio: si dice, e si va col pilota
  let cercaMisurata = false;
  try { cercaMisurata = (leggiJson(misureFile).misure ?? []).some((m) => (m.gruppi ?? []).some((g) => g.tipo === "cerca" && g.metodo === "lotti" && Number(g.usd) > 0 && Number(g.lotti) > 0)); }
  catch (e) { console.log(`⚠️ ${rel(opz, misureFile)} non si legge (${e.message}): la ricerca a lotti vale come mai misurata, e la prima onda è un pilota`); }
  const onde = ordinaOnde(sessioni, M.sessioni_per_onda, cercaMisurata ? null : Number(T.stima?.cerca_pilota) || 2);
  onde.forEach((o, i) => o.forEach((s) => { sessioni[s].onda = i + 1; }));

  // lenti e angoli fuori: quelli che nessun tema scelto porta, dichiarati (si dicono alla fermata 1)
  const lentiTutte = lentiDelSito(opz);
  const lentiDentro = new Set(ids.flatMap((s) => sessioni[s].lenti));
  const angoliDentro = new Set(ids.flatMap((s) => sessioni[s].angoli));
  const piano = {
    versione: 1,
    creato: timbroOra(),
    profilo: profiloNome,
    base: opz.base,
    diff: opz.diff ?? null,
    temi_scelti: temiScelti,
    minori_aperti: minoriAperti,
    soglia_minori: M.soglia_minori,
    minori_ammessi: minoriAmmessi,
    gravita_cercate: gravita,
    ricontrollo: profilo.ricontrollo,
    palestra_prima: profilo.palestra_prima === true,
    onda_pilota: !cercaMisurata && ids.some((x) => sessioni[x].tema !== "S01") ? { cercatrici: onde[0].filter((x) => sessioni[x].tema !== "S01"), perche: "la ricerca a lotti non ha ancora una misura: dopo la prima onda si guarda il costo vero, e si va avanti solo col sì di Nicola" } : null,
    voci_da_ricontrollare: daRic.length,
    prepasso: infoPrepasso,
    ultracode_modo: modoUC,
    cerca_nuovi: profilo.cerca_nuovi !== false,
    file_perimetro: perimetroFile.length,
    codice_fuori_profilo: fuoriTema,
    lenti_fuori: lentiTutte.filter((l) => !lentiDentro.has(l)),
    angoli_fuori: T.angoli.filter((a) => !angoliDentro.has(a)),
    sessioni,
    onde,
  };
  scriviJson(join(opz.cartella, "piano.json"), piano);
  for (const s of ids) scriviTesto(join(opz.cartella, "lotti", `${s}.txt`), [`# lotto<TAB>${sessioni[s].tema === "S01" ? "chiave<TAB>gravita<TAB>file<TAB>titolo" : "file"}  (si legge con grep '^L01\\t', mai per intero)`, ...righeLotti[s]].join("\n") + "\n");

  console.log(`profilo ${profiloNome} a ${opz.base.slice(0, 12)}: ${ids.length} sessioni in ${onde.length} onde (${onde.map((o) => o.join(" ")).join(" | ")})`);
  console.log(`file nel perimetro: ${perimetroFile.length} (codice ${conti.codice}) · codice dei soli temi fuori dal profilo: ${fuoriTema} · voci da ricontrollare: ${daRic.length}`);
  if (infoPrepasso) console.log(`prepasso: ${infoPrepasso.voci} voci, ${infoPrepasso.guardate} agli agenti, ${infoPrepasso.tenute_dal_programma} tenute aperte dal programma (file o righe fermi dall'ultima conferma)${infoPrepasso.storia_corta ? " · copia del sito con la storia corta: dove la storia non arriva, la voce va agli agenti (con la storia intera il programma ne terrebbe aperte di più)" : ""}`);
  const conUC = ids.filter((x) => sessioni[x].ultracode);
  console.log(`ultracode (${modoUC}): ${conUC.length ? conUC.join(" ") : "nessuna sessione"} · senza: ${ids.filter((x) => !sessioni[x].ultracode).join(" ") || "nessuna"}`);
  console.log(`minori aperti nel registro: ${minoriAperti} (soglia ${M.soglia_minori}) → minori nuovi ${minoriAmmessi ? "ammessi" : "NON ammessi (regola ⑳)"} · gravità cercate: ${gravita.join(", ") || "nessuna"}`);
  if (piano.lenti_fuori.length) console.log(`lenti fuori dal profilo (da dire alla fermata 1): ${piano.lenti_fuori.join(", ")}`);
  return chiudi("prepara", rossi, [], opz, { sessioni: ids.length, onde: onde.length, minori_ammessi: minoriAmmessi });
}

// ── schede ───────────────────────────────────────────────────────────────────────────────────────
/** Il testo della scheda di una sessione, dal piano e dai temi. PURA e deterministica: copertura-prima la rifà e la confronta. */
export function testoScheda(piano, s, T, { cartellaRel, ramo, regista }) {
  const x = piano.sessioni[s];
  const def = T.temi[x.tema];
  const confini = (T.confini ?? []).filter((c) => c.temi.includes(x.tema)).map((c) => c.riga);
  const altri = Object.keys(piano.sessioni).filter((k) => k !== s && piano.sessioni[k].tema === x.tema);
  const ric = x.tema === "S01";
  const righe = [
    "---",
    "tipo: scheda della radiografia in sessioni",
    `sessione: ${s}`,
    `base_sito: ${piano.base}`,
    `cartella: ${cartellaRel}`,
    `ramo: ${ramo}-${s.toLowerCase()}`,
    `regista: ${regista}`,
    "---",
    "",
    `# ${s} · ${def.nome}`,
    "",
    `**Cosa guardi.** ${def.cosa}${altri.length ? ` Il tema è diviso: ${[s, ...altri].sort().join(", ")}; tu guardi solo i tuoi lotti.` : ""}`,
    "",
    `**Profilo «${piano.profilo}».** ${ric ? `Ricontrolli ${x.lotti.reduce((n, l) => n + l.voci, 0)} voci aperte, ${x.voci_gravi ? "tutte gravi o bloccanti" : "tutte minori"} (gravità del profilo: ${piano.ricontrollo.join(", ")}).${piano.gravita_cercate.length ? ` ${piano.cerca_nuovi === false ? "Non cerchi difetti nuovi, ma un" : "Un"} ${piano.gravita_cercate.join(" o un ")} che vedi strada facendo si scrive in «difetti», con l'asticella e il verificatore di sempre.` : ""}` : `Cerchi solo: ${piano.gravita_cercate.join(", ") || "niente di nuovo"}.`} ${piano.minori_ammessi ? "I minori nuovi sono ammessi." : `I minori nuovi NON si scrivono: nel registro ne restano aperti ${piano.minori_aperti}, sopra la soglia di ${piano.soglia_minori} (regola ⑳). Un minore visto strada facendo non va nel referto.`}`,
    "",
    `**Onda ${x.onda} · tetto ${x.tetto} subagenti**, cercatori e verificatori insieme, lanciati con lo strumento Agent (mai Workflow: un lancio solo ne apre molti, e il freno non li può contare). Oltre, chiedi alla regista con send_message prima di lanciarli (regola ⑱).`,
    "",
    `**Ultracode ${x.ultracode ? "acceso" : "spento"}** (${ric ? (x.voci_gravi ? "voci gravi: si chiudono solo con una prova e un verificatore" : "solo voci minori: senza ultracode una sessione costa circa la metà") : x.rischio === "alto" ? "tema a rischio alto: si cercano gravi su soldi, accessi o dati" : "tema a rischio medio"}; regola «${piano.ultracode_modo ?? "dove-serve"}»).`,
    "",
    "## Lenti",
    ...(x.lenti.length ? x.lenti.map((l) => `- \`${l}\``) : ["- (nessuna: ricontrolli il registro)"]),
    "",
    "## Angoli",
    ...(x.angoli.length ? x.angoli.map((a) => `- \`${a}\``) : ["- (nessuno)"]),
    "",
    "## Domande guida",
    ...def.domande.map((d) => `- ${d}`),
    "",
    "## Cosa NON guardi",
    ...(confini.length ? confini.map((c) => `- ${c}`) : ["- Quello che appartiene a un altro tema: lo scrivi con perimetro_altrui, senza approfondire."]),
    ...(piano.lenti_fuori.length ? [`- Le lenti fuori da questo profilo: ${piano.lenti_fuori.join(", ")}.`] : []),
    "",
    "## Prefissi ammessi nel campo «file»",
    x.prefissi.length ? `${x.prefissi.map((p) => `\`${p}:\``).join(", ")}, sempre con prova a comando eseguita ed esito.` : "Nessuno: solo `percorso:riga` o `percorso:inizio-fine`, e `(nel referto privato)` per le riservate.",
    "",
    "## Lotti",
    "",
    ric ? "| Lotto | Voci |" : "| Lotto | File | KB |",
    ric ? "|---|---|" : "|---|---|---|",
    ...x.lotti.map((l) => (ric ? `| ${l.id} | ${l.voci} |` : `| ${l.id} | ${l.file} | ${l.kb} |`)),
    "",
    `L'elenco di un lotto: \`grep -P '^L01\\t' ${cartellaRel}/lotti/${s}.txt | cut -f2-\`. Ogni lotto va a un subagente nuovo (LEGGIMI, §3).`,
    "",
    "## Il referto",
    "",
    `\`${cartellaRel}/referti/${s}.json\`, nel formato del LEGGIMI (§5). Il controllo, prima di ogni push:`,
    `\`node cervello/radiografia-sessioni.mjs valida-referto ${cartellaRel}/referti/${s}.json --cartella ${cartellaRel}\``,
    "",
  ];
  return righe.join("\n");
}
function schede(opz) {
  if (!opz.cartella || !opz.ramo || !opz.regista) return uso("schede --cartella <dir> --ramo <ramo della regista> --regista <id della sessione regista>");
  const piano = leggiPiano(opz);
  const T = caricaTemi(opz);
  piano.schede = { cartella: rel(opz, opz.cartella), ramo: opz.ramo, regista: opz.regista };
  scriviJson(join(opz.cartella, "piano.json"), piano);
  for (const s of Object.keys(piano.sessioni)) scriviTesto(join(opz.cartella, "schede", `${s}.md`), testoScheda(piano, s, T, { cartellaRel: piano.schede.cartella, ramo: opz.ramo, regista: opz.regista }));
  console.log(`schede scritte: ${Object.keys(piano.sessioni).length} in ${piano.schede.cartella}/schede/`);
  return chiudi("schede", [], [], opz, { schede: Object.keys(piano.sessioni).length });
}

// ── preventivo ───────────────────────────────────────────────────────────────────────────────────
/** Il preventivo dal piano. PURA. Le cifre sono stime (temi.json, «stima»), da rimisurare con cost_usd alla fermata 2. */
export function calcolaPreventivo(piano, stima) {
  const sess = Object.values(piano.sessioni);
  const lotti = sess.reduce((n, s) => n + s.lotti.length, 0);
  const verificatori = sess.length * stima.verificatori_attesi_per_sessione;
  const subagentiMax = Math.max(0, ...sess.map((s) => s.lotti.length + stima.verificatori_attesi_per_sessione));
  const usd = sess.length * stima.usd_capo_sessione + lotti * stima.usd_lotto + verificatori * stima.usd_verificatore + stima.usd_regia + stima.usd_controllore_finale;
  const token = sess.length * stima.token_capo_sessione + lotti * stima.token_lotto + verificatori * stima.token_verificatore + stima.token_regia + stima.token_controllore_finale;
  return {
    sessioni: sess.length, onde: piano.onde.length, lotti, verificatori_attesi: verificatori,
    agenti: lotti + verificatori, subagenti_max_per_sessione: subagentiMax,
    usd: Math.round(usd), token,
    serve_firma: token > stima.soglia_firma_token || subagentiMax > stima.soglia_firma_subagenti,
  };
}
/**
 * Il preventivo in dollari SOLO dalle misure (cervello/radiografia/misure.json), sessione per sessione, con la misura
 * della STESSA configurazione: tipo (ricontrollo o cerca), metodo «lotti» e ultracode. La riparazione prende ancora
 * l'ultima riga qualunque sia (regola 1 del 21/11, solo testo): il preventivo dell'onda 9 ha preso a memoria il 50%
 * dell'onda 7 e il terzo giro, con ultracode su tutto, è finito a 17,76 $ a chiusa. Qui la scelta la fa il programma.
 * Senza una misura uguale si usa quella con l'altro ultracode, e lo si dice; senza nessuna misura si usa la stima di
 * temi.json, segnata «mai misurata»: è un pilota, e serve la firma. PURA.
 * Torna minimo, atteso e massimo (le tre cifre della fermata 1), le chiusure attese del ricontrollo e da dove viene ogni cifra.
 */
export function preventivoDaMisure(piano, misure, stima, { quotaRegia = 0.2, usdPerPunto = null } = {}) {
  const gruppi = (Array.isArray(misure?.misure) ? misure.misure : []).flatMap((m) => (Array.isArray(m?.gruppi) ? m.gruppi : []).map((g) => ({
    ...g, fase: m.fase,
    quota_regia: Number(m.usd_regia_e_cf) >= 0 && Number(m.usd_sessioni) > 0 && m.usd_regia_e_cf !== null ? Number(m.usd_regia_e_cf) / Number(m.usd_sessioni) : null,
  })));
  const perUnita = (g) => {
    const u = g.tipo === "ricontrollo" ? Number(g.voci) : Number(g.lotti), usd = Number(g.usd);
    return g.usd !== null && u > 0 && usd > 0 ? usd / u : null;
  };
  const tonda = (x) => Math.round(x * 100) / 100;
  const righe = [], avvisi = [];
  let quotaUsata = null;
  for (const [id, x] of Object.entries(piano.sessioni)) {
    const tipo = x.tema === "S01" ? "ricontrollo" : "cerca";
    const uc = x.ultracode === true;
    const unita = tipo === "ricontrollo" ? x.lotti.reduce((n, l) => n + (Number(l.voci) || 0), 0) : x.lotti.length;
    const adatti = gruppi.filter((g) => g.tipo === tipo && g.metodo === "lotti" && perUnita(g) !== null);
    const stessi = adatti.filter((g) => (g.ultracode === true) === uc);
    const usati = stessi.length ? stessi : adatti;
    if (usati.length) {
      const ultimo = usati[usati.length - 1], v = usati.map(perUnita), pu = perUnita(ultimo), una = usati.length === 1;
      const r = {
        sessione: id, tipo, ultracode: uc, unita, misurata: true,
        atteso: unita * pu, minimo: unita * (una ? pu * 0.8 : Math.min(...v)), massimo: unita * (una ? pu * 1.3 : Math.max(...v)),
        fonte: `${ultimo.fase}${stessi.length ? "" : `, con ultracode ${ultimo.ultracode ? "acceso" : "spento"}: misura vicina`}${una ? ", una misura sola (forchetta -20% +30%)" : ""}`,
        chiusi_attesi: tipo === "ricontrollo" && Number(ultimo.chiusi) >= 0 && Number(ultimo.voci) > 0 ? (unita * Number(ultimo.chiusi)) / Number(ultimo.voci) : 0,
      };
      if (!stessi.length) avvisi.push(`${id}: nessuna misura di ${tipo} con ultracode ${uc ? "acceso" : "spento"}: uso quella con l'altro (${ultimo.fase})`);
      // la parte di regia la porta ogni sessione con la quota della SUA misura (collaudo A del 24/11: una quota sola,
      // presa dall'ultima sessione del giro, valeva per tutte)
      r.quota = ultimo.quota_regia;
      if (ultimo.quota_regia !== null) quotaUsata = ultimo.quota_regia;
      righe.push(r);
    } else {
      const usd = (stima.usd_capo_sessione + x.lotti.length * stima.usd_lotto + stima.verificatori_attesi_per_sessione * stima.usd_verificatore) * (uc ? Number(stima.fattore_ultracode) || 1 : 1);
      righe.push({ sessione: id, tipo, ultracode: uc, unita, misurata: false, atteso: usd, minimo: usd * 0.8, massimo: usd * 2, fonte: `stima di temi.json, mai misurata${uc ? `, ×${stima.fattore_ultracode} per ultracode` : ""}: il primo giro è un pilota`, chiusi_attesi: 0 });
      avvisi.push(`${id}: ${tipo} a lotti${uc ? " con ultracode" : ""} mai misurato: stima di temi.json, da pilotare con la soglia scritta prima (regola 10 del 15/11)`);
    }
  }
  const quota = quotaUsata ?? quotaRegia;
  const q = (r) => (typeof r.quota === "number" ? r.quota : quota);
  const somma = (k, conRegia = false) => righe.reduce((n, r) => n + r[k] * (conRegia ? 1 + q(r) : 1), 0);
  const sess = { minimo: somma("minimo"), atteso: somma("atteso"), massimo: somma("massimo") };
  const tot = { minimo: tonda(somma("minimo", true)), atteso: tonda(somma("atteso", true)), massimo: tonda(somma("massimo", true)) };
  const chiusi = Math.round(somma("chiusi_attesi"));
  const usdRicontrollo = righe.filter((r) => r.tipo === "ricontrollo").reduce((n, r) => n + r.atteso * (1 + q(r)), 0);
  return {
    sessioni: righe.map(({ quota: _q, ...r }) => ({ ...r, atteso: tonda(r.atteso), minimo: tonda(r.minimo), massimo: tonda(r.massimo), chiusi_attesi: Math.round(r.chiusi_attesi) })),
    quota_regia_e_cf: tonda(quota), fonte_quota: quotaUsata !== null ? "dalla misura usata" : "predefinita (onda 9 della riparazione)",
    usd_sessioni: { minimo: tonda(sess.minimo), atteso: tonda(sess.atteso), massimo: tonda(sess.massimo) },
    usd: tot, chiusi_attesi: chiusi, usd_per_chiusa_attesa: chiusi > 0 ? tonda(usdRicontrollo / chiusi) : null,
    percento_settimana: usdPerPunto > 0 ? Math.round((tot.atteso / usdPerPunto) * 10) / 10 : null,
    per_onda: (piano.onde ?? []).map((o, i) => ({ onda: i + 1, sessioni: o, atteso: tonda(righe.filter((r) => o.includes(r.sessione)).reduce((n, r) => n + r.atteso * (1 + q(r)), 0)) })),
    mai_misurate: righe.filter((r) => !r.misurata).map((r) => r.sessione), avvisi,
  };
}
function preventivo(opz) {
  if (!opz.cartella) return uso("preventivo --cartella <dir> [--misure <file>]");
  const piano = leggiPiano(opz);
  const T = caricaTemi(opz);
  const p = calcolaPreventivo(piano, T.stima);
  const fileMisure = resolve(opz.misure ?? join(QUI, "radiografia/misure.json"));
  if (!existsSync(fileMisure)) return chiudi("preventivo", [`${fileMisure} non c'è: il preventivo si fa dalle misure, mai da un rimedio sperato`], [], opz);
  // la calibrazione del limite settimanale vive in una casa sola: le misure della riparazione
  const calib = (() => { try { return leggiJson(join(QUI, "riparazione/misure.json")).calibrazione_limite ?? null; } catch { return null; } })();
  const d = preventivoDaMisure(piano, leggiJson(fileMisure), T.stima, { quotaRegia: T.misure.quota_regia_predefinita ?? 0.2, usdPerPunto: Number(calib?.usd_per_punto) || null });
  const serveFirma = p.serve_firma || d.mai_misurate.length > 0;
  piano.preventivo = { ...p, usd: d.usd.atteso, dollari: d, serve_firma: serveFirma, calcolato: timbroOra() };
  scriviJson(join(opz.cartella, "piano.json"), piano);
  console.log(`sessioni ${p.sessioni} in ${p.onde} onde · lotti ${p.lotti} · verificatori attesi ${p.verificatori_attesi} · subagenti al massimo per sessione ${p.subagenti_max_per_sessione}`);
  for (const r of d.sessioni) console.log(`  ${r.sessione} ${r.tipo}${r.ultracode ? " (ultracode)" : ""} · ${r.unita} ${r.tipo === "ricontrollo" ? "voci" : "lotti"} · ${r.minimo}-${r.massimo} $, atteso ${r.atteso} $ · ${r.fonte}`);
  console.log(`dollari di listino: minimo ${d.usd.minimo} · atteso ${d.usd.atteso} · massimo ${d.usd.massimo} $ (regia e controllore finale compresi: ogni sessione porta la quota della sua misura, ${d.fonte_quota === "predefinita (onda 9 della riparazione)" ? `qui la predefinita del ${Math.round(d.quota_regia_e_cf * 100)}%` : `l'ultima usata è il ${Math.round(d.quota_regia_e_cf * 100)}%`})`);
  console.log(`per onda: ${d.per_onda.map((o) => `onda ${o.onda} circa ${o.atteso} $`).join(" · ")}${piano.onda_pilota ? ` (la prima è il pilota: ${piano.onda_pilota.cercatrici.join(" ")})` : ""}`);
  if (d.percento_settimana !== null) console.log(`circa il ${d.percento_settimana}% del limite settimanale (stima: ${calib.usd_per_punto} $ a punto, ${calib.fonte}; si sostituisce con la percentuale letta nell'app)`);
  if (d.chiusi_attesi) console.log(`chiusure attese dal ricontrollo: circa ${d.chiusi_attesi}, circa ${d.usd_per_chiusa_attesa} $ l'una (le sessioni di ricontrollo con la loro parte di regia)`);
  console.log(`token: circa ${(p.token / 1e6).toFixed(1)} milioni (regia e controllore finale compresi)`);
  for (const a of d.avvisi) console.log(`⚠️ ${a}`);
  console.log(`serve la firma di Nicola prima del via: ${serveFirma ? `sì (${[p.serve_firma ? "oltre 2 milioni di token o 12 subagenti: regola ⑱" : null, d.mai_misurate.length ? `${d.mai_misurate.length} sessioni mai misurate: pilota` : null].filter(Boolean).join("; ")})` : "no, ma la fermata 1 la chiede comunque"}`);
  return chiudi("preventivo", [], [], opz, { ...p, serve_firma: serveFirma, dollari: d.usd, chiusi_attesi: d.chiusi_attesi });
}

// ── copertura-prima ──────────────────────────────────────────────────────────────────────────────
function leggiLotti(opz, s) {
  const p = join(opz.cartella, "lotti", `${s}.txt`);
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8").split(/\r?\n/).filter((r) => r && !r.startsWith("#")).map((r) => r.split("\t"));
}
function leggiMappa(opz) {
  const p = join(opz.cartella, "mappa-file.txt");
  if (!existsSync(p)) throw new Error("manca mappa-file.txt: prima «prepara»");
  return readFileSync(p, "utf8").split(/\r?\n/).filter((r) => r && !r.startsWith("#")).map((r) => { const [f, chi, segno] = r.split("\t"); return { f, chi: chi === "-" ? [] : chi.split(","), segno }; });
}
function coperturaPrima(opz) {
  if (!opz.cartella) return uso("copertura-prima --cartella <dir>");
  const piano = leggiPiano(opz);
  const T = caricaTemi(opz);
  const M = T.misure;
  const rossi = [], attese = [];
  const ids = Object.keys(piano.sessioni);
  const temiInPiano = new Set(ids.map((s) => piano.sessioni[s].tema));
  // (a) ogni lente e ogni angolo: dentro una sessione o dichiarati fuori; e mai una lente sparita da una sessione
  for (const l of lentiDelSito(opz)) {
    const dentro = ids.some((s) => piano.sessioni[s].lenti.includes(l));
    if (!dentro && !piano.lenti_fuori.includes(l)) rossi.push(`la lente «${l}» non ha una sessione e non è dichiarata fuori`);
    if (dentro && piano.lenti_fuori.includes(l)) rossi.push(`la lente «${l}» è insieme dentro e fuori`);
  }
  for (const a of T.angoli) if (!ids.some((s) => piano.sessioni[s].angoli.includes(a)) && !piano.angoli_fuori.includes(a)) rossi.push(`l'angolo «${a}» non ha una sessione e non è dichiarato fuori`);
  for (const s of ids) {
    const x = piano.sessioni[s];
    const def = T.temi[x.tema];
    if (!def) { rossi.push(`${s}: il tema ${x.tema} non è nel catalogo`); continue; }
    for (const l of def.lenti) if (!x.lenti.includes(l)) rossi.push(`${s}: manca la lente «${l}» del suo tema`);
    for (const a of def.angoli) if (!x.angoli.includes(a)) rossi.push(`${s}: manca l'angolo «${a}» del suo tema`);
    if (!RE_SESSIONE.test(s)) rossi.push(`${s}: nome di sessione fuori forma`);
    if (x.lotti.length > M.lotti_max) rossi.push(`${s}: ${x.lotti.length} lotti, oltre il massimo di ${M.lotti_max}`);
    if (x.lotti.length + 1 > x.tetto) rossi.push(`${s}: ${x.lotti.length} lotti non lasciano posto a un verificatore nel tetto di ${x.tetto}`);
  }
  const nOnde = piano.onde.flat();
  if (new Set(nOnde).size !== nOnde.length || nOnde.length !== ids.length || ids.some((s) => !nOnde.includes(s))) rossi.push("ogni sessione deve stare in un'onda, e in una sola");
  for (const [i, o] of piano.onde.entries()) if (o.length > M.sessioni_per_onda) rossi.push(`l'onda ${i + 1} ha ${o.length} sessioni, oltre ${M.sessioni_per_onda}`);
  if (ids.length > M.max_sessioni) rossi.push(`${ids.length} sessioni, oltre il massimo di ${M.max_sessioni}`);
  // (b) ogni file di codice del perimetro: un proprietario, e dentro un lotto di ogni sessione del suo tema scelto
  const mappa = leggiMappa(opz);
  // La mappa non si prende sulla parola: si rifà dal sito al commit del piano e si confronta. Un segno cambiato o una
  // riga tolta da mappa-file.txt facevano sparire un file da tutti i lotti col verde (collaudo del 12/11, A6).
  const regole = compilaRegole(T);
  let dalSito = fileDelSito(opz, piano.base).map((x) => x.f);
  if (piano.diff) {
    const cambiati = new Set((gitOk(opz.sito, ["diff", "--name-only", "--no-renames", piano.diff]) ?? "").split("\n").filter(Boolean));
    dalSito = dalSito.filter((f) => cambiati.has(f));
  }
  const attesa = new Map(dalSito.map((f) => [f, `${proprietariDi(f, regole).join(",") || "-"}\t${segnoDi(f)}`]));
  const scritta = new Map(mappa.map((m) => [m.f, `${m.chi.join(",") || "-"}\t${m.segno}`]));
  for (const [f, v] of attesa) if (scritta.get(f) !== v) rossi.push(`mappa-file.txt: ${f} ${scritta.has(f) ? `dice «${scritta.get(f).replace("\t", " ")}», dal sito viene «${v.replace("\t", " ")}»` : "manca"}`);
  for (const f of scritta.keys()) if (!attesa.has(f)) rossi.push(`mappa-file.txt: ${f} non è un file del perimetro`);
  const nelLotto = new Map(); // tema → Set(file)
  const vociNelLotto = new Map(); // chiave → n volte
  for (const s of ids) {
    const righe = leggiLotti(opz, s);
    if (!righe) { rossi.push(`${s}: manca lotti/${s}.txt`); continue; }
    const t = piano.sessioni[s].tema;
    const idLotti = new Set(piano.sessioni[s].lotti.map((l) => l.id));
    for (const r of righe) {
      if (!idLotti.has(r[0])) { rossi.push(`${s}: in lotti/${s}.txt c'è il lotto ${r[0]}, che il piano non ha`); continue; }
      if (t === "S01") vociNelLotto.set(r[1], (vociNelLotto.get(r[1]) ?? 0) + 1);
      else {
        if (!nelLotto.has(t)) nelLotto.set(t, new Set());
        if (nelLotto.get(t).has(r[1])) rossi.push(`${r[1]}: sta due volte nei lotti del tema ${t}`);
        nelLotto.get(t).add(r[1]);
      }
    }
    const conti = {};
    for (const r of righe) conti[r[0]] = (conti[r[0]] ?? 0) + 1;
    for (const l of piano.sessioni[s].lotti) {
      const atteso = t === "S01" ? l.voci : l.file;
      if ((conti[l.id] ?? 0) !== atteso) rossi.push(`${s} ${l.id}: il piano dice ${atteso} righe, lotti/${s}.txt ne ha ${conti[l.id] ?? 0}`);
    }
  }
  let senzaPadrone = 0;
  for (const m of mappa) {
    if (m.chi.length === 0) { rossi.push(`${m.f}: nessun tema lo possiede`); senzaPadrone++; continue; }
    if (m.segno !== "codice") continue;
    for (const t of m.chi.filter((c) => temiInPiano.has(c))) if (!nelLotto.get(t)?.has(m.f)) rossi.push(`${m.f}: è del tema ${t}, ma non sta in nessun suo lotto`);
  }
  // (c) ogni voce da ricontrollare in un lotto di S01, una volta sola
  const daRicP = join(opz.cartella, "da-ricontrollare.txt");
  if (temiInPiano.has("S01")) {
    const daRic = existsSync(daRicP) ? readFileSync(daRicP, "utf8").split(/\r?\n/).filter((r) => r && !r.startsWith("#")).map((r) => r.split("\t")[0]) : null;
    if (!daRic) rossi.push("manca da-ricontrollare.txt");
    else {
      for (const k of daRic) { const n = vociNelLotto.get(k) ?? 0; if (n !== 1) rossi.push(`la voce «${k.slice(0, 70)}» sta in ${n} lotti di S01, non in uno`); }
      for (const k of vociNelLotto.keys()) if (!daRic.includes(k)) rossi.push(`la voce «${k.slice(0, 70)}» è in un lotto di S01 ma non in da-ricontrollare.txt`);
      // la scelta delle voci (registro + prepasso) non si prende sulla parola: si rifà e si confronta. Una voce tolta
      // a mano da da-ricontrollare.txt restava fuori dal ricontrollo col verde
      try {
        const reg = leggiJson(opz.registro);
        const rifatta = vociDaRicontrollare(opz, {
          problemi: Array.isArray(reg?.problemi) ? reg.problemi : [], profilo: T.profili[piano.profilo], profiloNome: piano.profilo,
          temiScelti: piano.temi_scelti, fileNelPerimetro: new Set(dalSito), base: piano.base, prepasso: piano.prepasso != null,
        }).daRic.map((v) => v.chiave);
        const scritte = new Set(daRic), attese2 = new Set(rifatta);
        const mancano = rifatta.filter((k) => !scritte.has(k)), inPiu = daRic.filter((k) => !attese2.has(k));
        if (mancano.length) rossi.push(`${mancano.length} voci che il registro${piano.prepasso != null ? " e il prepasso mandano" : " manda"} al ricontrollo mancano da da-ricontrollare.txt (la prima: «${mancano[0].slice(0, 60)}»): rifai «prepara»`);
        if (inPiu.length) rossi.push(`${inPiu.length} voci in da-ricontrollare.txt che la scelta rifatta non manda al ricontrollo (la prima: «${inPiu[0].slice(0, 60)}»): rifai «prepara»`);
      } catch (e) { attese.push(`la scelta delle voci non si è potuta rifare: ${e.message}`); }
    }
  }
  // (c2) ultracode come lo dice la regola, e le sessioni di ricontrollo mai mischiate fra voci gravi e minori
  const cercaGravi = (piano.gravita_cercate ?? []).some((g) => GRAVI.has(g));
  for (const s of ids) {
    const x = piano.sessioni[s];
    const modo = piano.ultracode_modo ?? "dove-serve";
    if (x.tema === "S01") {
      const righe = leggiLotti(opz, s) ?? [];
      const gravi = righe.filter((r) => GRAVI.has(r[2])).length;
      if (gravi && gravi !== righe.length) rossi.push(`${s}: ${gravi} voci gravi e ${righe.length - gravi} minori nella stessa sessione: si dividono, così ultracode resta solo dove serve`);
      if (righe.length && (gravi === righe.length) !== (x.voci_gravi === true)) rossi.push(`${s}: «voci_gravi» non dice quello che c'è nei suoi lotti`);
    }
    const delicata = x.tema === "S01" ? x.voci_gravi === true : x.rischio === "alto" && cercaGravi;
    const atteso = modo === "tutte" || (modo === "dove-serve" && delicata);
    if (x.ultracode !== atteso) rossi.push(`${s}: ultracode ${x.ultracode ? "acceso" : "spento"}, la regola «${modo}» lo vuole ${atteso ? "acceso" : "spento"}`);
  }
  // (d) le schede uguali al piano, e la partenza corta
  if (!piano.schede) attese.push("schede non ancora scritte: lancia «schede»");
  else {
    const leggimi = join(QUI, "radiografia/LEGGIMI-cercatore.md");
    const nLeggimi = existsSync(leggimi) ? readFileSync(leggimi, "utf8").length : 0;
    if (nLeggimi === 0) rossi.push("manca cervello/radiografia/LEGGIMI-cercatore.md");
    for (const s of ids) {
      const p = join(opz.cartella, "schede", `${s}.md`);
      if (!existsSync(p)) { rossi.push(`manca schede/${s}.md`); continue; }
      const scritta = readFileSync(p, "utf8");
      const attesa = testoScheda(piano, s, T, { cartellaRel: piano.schede.cartella, ramo: piano.schede.ramo, regista: piano.schede.regista });
      if (scritta !== attesa) rossi.push(`schede/${s}.md è diversa da quella che il piano scrive: una scheda si rigenera con «schede», non si ritocca a mano`);
      if (scritta.length + nLeggimi > M.caratteri_partenza) rossi.push(`${s}: LEGGIMI più scheda fanno ${scritta.length + nLeggimi} caratteri, oltre ${M.caratteri_partenza}: la sessione li rilegge a ogni passo`);
    }
  }
  return chiudi("copertura-prima", rossi, attese, opz, { sessioni: ids.length, file_mappa: mappa.length, senza_padrone: senzaPadrone });
}

// ── segnaposti ───────────────────────────────────────────────────────────────────────────────────
function segnaposti(opz) {
  if (!opz.cartella) return uso("segnaposti --cartella <dir>");
  const piano = leggiPiano(opz);
  const rossi = [];
  for (const s of Object.keys(piano.sessioni)) {
    const p = join(opz.cartella, "schede", `${s}.md`);
    if (!existsSync(p)) { rossi.push(`manca schede/${s}.md`); continue; }
    const t = readFileSync(p, "utf8");
    for (const sp of SEGNAPOSTI_SCHEDA) if (t.includes(sp)) rossi.push(`schede/${s}.md: resta ${sp}`);
    const base = t.match(/^base_sito:\s*([0-9a-f]+)\s*$/m)?.[1];
    if (base !== piano.base) rossi.push(`schede/${s}.md: base_sito «${base ?? "assente"}» diversa da ${piano.base}`);
  }
  return chiudi("segnaposti", rossi, [], opz, { schede: Object.keys(piano.sessioni).length });
}

// ── guardia-ramo ─────────────────────────────────────────────────────────────────────────────────
function guardiaRamo(opz) {
  let [ramo, s] = opz.posizionali;
  if (!ramo || !RE_SESSIONE.test(s ?? "") || !opz.cartella) return uso("guardia-ramo <ramo> <SNN> --cartella <dir>");
  const piano = leggiPiano(opz);
  if (!piano.sessioni[s]) return chiudi("guardia-ramo", [`${s} non è una sessione del piano`], [], opz);
  ramo = ramo.replace(/^origin\//, "");
  const ref = `origin/${ramo}`;
  if (gitOk(opz.git, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]) === null) return chiudi("guardia-ramo", [], [`${ref} non esiste ancora`], opz);
  const partenza = leggiSessioni(opz)?.sessioni?.[s]?.partenza;
  if (vuoto(partenza)) return chiudi("guardia-ramo", [`${s}: in sessioni.json manca la «partenza»`], [], opz);
  if (gitOk(opz.git, ["merge-base", "--is-ancestor", partenza, ref]) === null) return chiudi("guardia-ramo", [`${s}: ${ref} non parte da ${String(partenza).slice(0, 12)}, la partenza scritta in sessioni.json`], [], opz);
  // del figlio sono i commit dopo la partenza; un'unione conta per quello che cambia rispetto a TUTTI i genitori
  const commit = (gitOk(opz.git, ["rev-list", `${partenza}..${ref}`]) ?? "").split("\n").filter(Boolean);
  const toccati = new Set();
  for (const c of commit) {
    const genitori = (gitOk(opz.git, ["rev-list", "--parents", "-n", "1", c]) ?? "").trim().split(/\s+/).slice(1);
    const args = genitori.length > 1 ? ["diff-tree", "-r", "--cc", "--name-only", "--no-renames", "--no-commit-id", c] : ["diff-tree", "-r", "--root", "--name-only", "--no-renames", "--no-commit-id", c];
    for (const f of (gitOk(opz.git, args) ?? "").split("\n").filter(Boolean)) if (f !== c) toccati.add(f);
  }
  const ammesso = `${rel(opz, opz.cartella)}/referti/${s}.json`;
  const altri = [...toccati].filter((f) => f !== ammesso);
  const rossi = altri.length ? [`${s}: nella storia del ramo ci sono ${altri.length} file oltre al referto: ${altri.slice(0, 10).join(", ")}`] : [];
  // Nessun id sparito, nemmeno nella storia: un difetto già spinto (il ramo è pubblico) che il referto in cima non
  // porta più né fra i difetti né fra gli scartati è un difetto perso. Il controllo del referto da solo guarda solo i
  // numeri fino al più alto di OGGI, e non vede sparire l'ultimo (collaudo del 12/11, A4).
  const idsDi = (testo) => { try { const r = JSON.parse(testo); return new Set([...(r.difetti ?? []), ...(r.scartati ?? [])].map((d) => d?.id).filter(Boolean)); } catch { return null; } };
  const inCima = idsDi(gitOk(opz.git, ["show", `${ref}:${ammesso}`]) ?? "");
  const persi = new Map();
  if (inCima) for (const c of commit) {
    const prima = idsDi(gitOk(opz.git, ["show", `${c}:${ammesso}`]) ?? "");
    for (const id of prima ?? []) if (!inCima.has(id) && !persi.has(id)) persi.set(id, c.slice(0, 7));
  }
  for (const [id, c] of persi) rossi.push(`${s}: ${id} era nel referto al commit ${c} e ora non è né fra i difetti né fra gli scartati`);
  const attese = commit.length === 0 ? [`${s}: il ramo non ha ancora nessun commit suo`] : [];
  return chiudi("guardia-ramo", rossi, attese, opz, { commit: commit.length, file_toccati: toccati.size, id_persi: persi.size });
}

// ── valida-referto ───────────────────────────────────────────────────────────────────────────────
function leggiTabella(p) {
  if (!existsSync(p)) return null;
  const m = new Map();
  for (const r of readFileSync(p, "utf8").split(/\r?\n/)) {
    if (!r || r.startsWith("#")) continue;
    const c = r.split("\t");
    m.set(c[0], { righe: c, stato: c[1], gravita: c[2], titolo: c[c.length - 1] ?? "" });
  }
  return m;
}
const valori = (o, fuori = []) => {
  if (typeof o === "string") fuori.push(o);
  else if (Array.isArray(o)) o.forEach((x) => valori(x, fuori));
  else if (o && typeof o === "object") Object.values(o).forEach((x) => valori(x, fuori));
  return fuori;
};
const chiavi = (o, fuori = []) => {
  if (Array.isArray(o)) o.forEach((x) => chiavi(x, fuori));
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) { fuori.push(k); chiavi(v, fuori); }
  return fuori;
};

/**
 * Le regole del referto di una sessione cercatrice. PURA rispetto al disco: riceve il referto letto e un contesto.
 * ctx: { sessione (la voce del piano), nome, piano, lenti: Set, registro: Map|null, daRicontrollare: Map|null,
 *        righeDi: (percorso) → numero|null }
 * Torna { rossi, attese }.
 */
export function regoleReferto(r, ctx) {
  const rossi = [], attese = [];
  const { piano, nome } = ctx;
  const x = ctx.sessione;
  const ric = x.tema === "S01";
  if (r.sessione !== nome) rossi.push(`«sessione» vale ${r.sessione}, il file è di ${nome}`);
  if (r.base_sito !== piano.base) rossi.push(`base_sito ${r.base_sito} diversa da ${piano.base}`);
  if (!dataVera(r.aggiornato)) rossi.push(`«aggiornato» non è una data vera AAAA-MM-GG HH:MM: ${r.aggiornato}`);
  if (typeof r.finita !== "boolean") rossi.push("«finita» deve essere true o false");
  const finita = r.finita === true;
  for (const c of ["lotti", "difetti", "scartati", "regressioni", "ricontrolli", "prove_per_la_palestra", "domande_per_nicola"]) if (!Array.isArray(r[c])) rossi.push(`«${c}» deve essere un elenco`);
  // un elenco chiuso anche in cima: un campo in più («note», «dettagli») è un posto dove una falla finisce in chiaro
  const extraCima = Object.keys(r ?? {}).filter((k) => !CAMPI_REFERTO.includes(k));
  if (extraCima.length) rossi.push(`campi in più nel referto (${extraCima.join(", ")}): solo ${CAMPI_REFERTO.join(", ")}`);
  for (const c of ["copertura", "conto"]) if (typeof r[c] !== "object" || r[c] === null || Array.isArray(r[c])) rossi.push(`manca «${c}»`);
  const tuttiIValori = valori(r);
  for (const sp of SEGNAPOSTI_REFERTO) {
    const nudo = sp.startsWith('"') ? sp.slice(1, -1) : null;
    if (tuttiIValori.some((v) => (nudo !== null ? v === nudo : v.includes(sp)))) rossi.push(`segnaposto del modello rimasto: ${sp}`);
  }
  const posto = (p, cx) => {
    const m = String(p).trim().match(/^(.+):(\d+)(?:-(\d+))?$/);
    if (!m) return rossi.push(`${cx}: «${p}» non è percorso:riga né percorso:inizio-fine né un prefisso ammesso`);
    const n = ctx.righeDi(m[1]);
    if (n === null) return rossi.push(`${cx}: ${m[1]} non è un file a ${piano.base.slice(0, 12)}`);
    const a = Number(m[2]), b = m[3] === undefined ? a : Number(m[3]);
    if (a < 1 || b < a || b > n) rossi.push(`${cx}: righe ${m[2]}${m[3] ? "-" + m[3] : ""} fuori da ${m[1]} (${n} righe)`);
  };

  // i lotti: a referto finito ognuno è dichiarato, fatto o non fatto col perché (nessun lotto saltato in silenzio)
  const idLotti = new Set(x.lotti.map((l) => l.id));
  const dichiarati = new Map();
  for (const l of Array.isArray(r.lotti) ? r.lotti : []) {
    if (!idLotti.has(l?.id)) { rossi.push(`lotto «${l?.id}»: non è un lotto di ${nome} nel piano`); continue; }
    if (dichiarati.has(l.id)) rossi.push(`lotto ${l.id}: dichiarato due volte`);
    dichiarati.set(l.id, l);
    if (!["fatto", "non_fatto"].includes(l.esito)) rossi.push(`lotto ${l.id}: esito «${l.esito}», vale «fatto» o «non_fatto»`);
    if (l.esito === "non_fatto" && vuoto(l.perche)) rossi.push(`lotto ${l.id}: «non_fatto» vuole il perché`);
  }
  const mancanti = [...idLotti].filter((id) => !dichiarati.has(id));
  if (mancanti.length) (finita ? rossi : attese).push(`lotti non ancora dichiarati: ${mancanti.join(", ")}`);

  // la copertura
  const cop = r.copertura ?? {};
  for (const f of cop.file_letti_interi ?? []) if (ctx.righeDi(f) === null) rossi.push(`copertura.file_letti_interi: ${f} non è un file a ${piano.base.slice(0, 12)}`);
  for (const y of cop.file_letti_in_parte ?? []) {
    if (!/^\d+-\d+$/.test(String(y?.righe ?? ""))) { rossi.push(`copertura.file_letti_in_parte: righe «${y?.righe}» per ${y?.file}`); continue; }
    posto(`${y.file}:${y.righe}`, "copertura.file_letti_in_parte");
  }
  for (const y of cop.file_eseguiti ?? []) {
    if (ctx.righeDi(y?.file ?? "") === null) rossi.push(`copertura.file_eseguiti: ${y?.file} non è un file a ${piano.base.slice(0, 12)}`);
    if (vuoto(y?.comando) || vuoto(y?.esito)) rossi.push(`copertura.file_eseguiti: ${y?.file} senza comando o esito`);
  }
  for (const y of cop.non_guardato ?? []) if (vuoto(y?.cosa) || vuoto(y?.perche)) rossi.push("copertura.non_guardato: ogni voce vuole «cosa» e «perche»");
  const nCoperti = (cop.file_letti_interi ?? []).length + (cop.file_letti_in_parte ?? []).length + (cop.file_eseguiti ?? []).length;
  if (finita && nCoperti === 0 && !ric) rossi.push("referto finito senza nessun file letto o eseguito: una sessione che non ha guardato niente non è finita");

  // i difetti
  const difetti = Array.isArray(r.difetti) ? r.difetti : [];
  const scartati = Array.isArray(r.scartati) ? r.scartati : [];
  const reId = new RegExp(`^${nome}-(\\d{3,})$`);
  const numeri = new Map();
  const segnaId = (id, dove) => {
    const m = String(id ?? "").match(reId);
    if (!m) return rossi.push(`${dove} «${id}»: l'id deve essere ${nome}-NNN`);
    const n = Number(m[1]);
    if (numeri.has(n)) rossi.push(`${dove} ${id}: id ripetuto (anche in ${numeri.get(n)})`);
    numeri.set(n, dove);
  };
  for (const sc of scartati) {
    segnaId(sc?.id, "scartato");
    if (vuoto(sc?.perche) || String(sc.perche).length > 200) rossi.push(`scartato ${sc?.id}: «perche» va scritto, in 200 caratteri al massimo`);
  }
  for (const d of difetti) {
    const cx = `difetto ${d?.id ?? "(senza id)"}`;
    segnaId(d?.id, "difetto");
    const riservato = d?.riservato === true;
    if (!idLotti.has(d?.trovato_da) && d?.trovato_da !== "capo") rossi.push(`${cx}: «trovato_da» vale un lotto della sessione (${[...idLotti].join(", ")}) o «capo»`);
    if (!ctx.lenti.has(d?.dimensione)) rossi.push(`${cx}: dimensione «${d?.dimensione}» non è una delle ${ctx.lenti.size} lenti`);
    if (!SEVERITA.includes(d?.severita)) rossi.push(`${cx}: severita «${d?.severita}»`);
    if (!PROVE.includes(d?.prova_tipo)) rossi.push(`${cx}: prova_tipo «${d?.prova_tipo}»`);
    if (typeof d?.prova_eseguita !== "boolean") rossi.push(`${cx}: prova_eseguita deve essere true o false`);
    if (typeof d?.riservato !== "boolean") rossi.push(`${cx}: «riservato» deve essere true o false`);
    if (typeof d?.verificato !== "boolean") rossi.push(`${cx}: «verificato» deve essere true o false`);
    // ⑳ il valore prima del volume: sopra la soglia nessun minore nuovo, nemmeno visto di passaggio
    // (una falla riservata entra anche se minore: sono poche, e una falla aperta non è volume)
    if (d?.severita === "minore" && !piano.minori_ammessi && !riservato) rossi.push(`${cx}: un minore nuovo, ma questa radiografia non li ammette (${piano.minori_aperti} minori aperti nel registro, soglia ${piano.soglia_minori}: regola ⑳)`);
    if (SEVERITA.includes(d?.severita) && !piano.gravita_cercate.includes(d.severita) && d.severita !== "minore") rossi.push(`${cx}: la gravità «${d.severita}» non è fra quelle che questo profilo cerca (${piano.gravita_cercate.join(", ")})`);
    if (eRiservataTitolo(d?.titolo) && !riservato) rossi.push(`${cx}: un titolo «Falla di sicurezza…» vuole riservato: true`);
    // per una riservata l'esito della prova sta in chat: basta che la prova a comando sia stata eseguita
    const provaAComando = d?.prova_tipo === "comando" && d?.prova_eseguita === true && (riservato || !vuoto(d?.esito_prova));
    if (riservato) {
      const extra = Object.keys(d ?? {}).filter((k) => !CAMPI_RISERVATA_RADIOGRAFIA.includes(k));
      if (extra.length) rossi.push(`${cx}: una riservata porta campi in più (${extra.join(", ")}): solo ${CAMPI_RISERVATA_RADIOGRAFIA.join(", ")}`);
      if (!TITOLO_RISERVATO.test(String(d?.titolo ?? ""))) rossi.push(`${cx}: il titolo di una riservata è «Falla di sicurezza da chiudere (<${AREE_RISERVATE.join("|")}>): i dettagli restano fuori dal deposito pubblico finché non è chiusa», senza numero`);
      if (d?.file !== PRIVATO) rossi.push(`${cx}: una riservata ha file «${PRIVATO}» e nient'altro`);
      // anche su un referto parziale: il ramo è pubblico appena spinto (collaudo del 12/11, caso 5a)
      if (d?.verificato_da != null && d?.verificato_da !== PRIVATO) rossi.push(`${cx}: in una riservata «verificato_da» vale «${PRIVATO}» (o null prima della verifica)`);
    } else {
      for (const c of ["titolo", "file", "descrizione", "impatto", "fix", "causa_radice", "prova"]) if (vuoto(d?.[c])) rossi.push(`${cx}: «${c}» vuoto`);
      for (const p of String(d?.file ?? "").split(SEP).map((y) => y.trim()).filter(Boolean)) {
        if (p === PRIVATO) { rossi.push(`${cx}: «${PRIVATO}» solo con riservato: true`); continue; }
        const pre = p.match(/^(live|vercel|produzione|stripe):(.+)$/);
        if (pre) {
          if (!x.prefissi.includes(pre[1])) rossi.push(`${cx}: «${pre[1]}:» non è ammesso in ${nome} (ammessi: ${x.prefissi.join(", ") || "nessuno"})`);
          if (!provaAComando) rossi.push(`${cx}: «${pre[1]}:» vuole prova_tipo «comando», prova_eseguita true ed esito_prova`);
          continue;
        }
        posto(p, cx);
      }
      if (!vuoto(d?.gia_noto)) {
        const v = ctx.registro?.get(d.gia_noto);
        if (ctx.registro && !v) rossi.push(`${cx}: «gia_noto» non è una chiave del registro`);
        else if (v && eRiservataTitolo(v.titolo)) rossi.push(`${cx}: «gia_noto» punta a una falla riservata: un difetto così si scrive riservato, e i dettagli vanno in chat`);
      }
      if (d?.perimetro_altrui != null && !RE_SESSIONE.test(String(d.perimetro_altrui))) rossi.push(`${cx}: perimetro_altrui «${d.perimetro_altrui}» non è una sessione`);
    }
    // l'asticella
    if (GRAVI.has(d?.severita)) {
      const umano = d?.prova_tipo === "umano" && (riservato || String(d?.perche_umano ?? "").trim().length >= 15);
      if (!provaAComando && !umano) (finita ? rossi : attese).push(`${cx}: un ${d.severita} vuole una prova a comando eseguita con esito, oppure «umano» col perché (almeno una frase)`);
    }
    // ⑲ la verifica proporzionata: un secondo agente per gravi, bloccanti e riservate; un minore entra visto una volta
    const daVerificare = GRAVI.has(d?.severita) || riservato;
    if (daVerificare && finita) {
      if (d?.verificato !== true || !testo(d?.verificato_da)) rossi.push(`${cx}: a referto finito un ${riservato ? "difetto riservato" : d.severita} è verificato da un altro agente (verificato true e verificato_da scritto)`);
      else if (!riservato && (d.verificato_da.trim().toLowerCase().startsWith(String(d.trovato_da ?? "").toLowerCase()) || /^(capo|l\d\d)\b/i.test(d.verificato_da.trim()))) rossi.push(`${cx}: «verificato_da» comincia con un lotto o col capo (${d.verificato_da.trim().slice(0, 20)}…): chi verifica è un agente nuovo, e chi trova non conferma`);
    }
    if (!daVerificare && d?.severita === "minore" && d?.verificato === true) rossi.push(`${cx}: un minore non si verifica con un secondo agente: entra visto una volta, con verificato false (regola ⑲)`);
  }
  // nessun difetto sparito: ogni numero da 1 al più alto è un difetto o uno scartato
  const max = Math.max(0, ...numeri.keys());
  const buchi = [];
  for (let n = 1; n <= max; n++) if (!numeri.has(n)) buchi.push(`${nome}-${tre(n)}`);
  if (buchi.length) rossi.push(`id spariti (né difetti né scartati): ${buchi.slice(0, 10).join(", ")}${buchi.length > 10 ? "…" : ""}`);

  // le regressioni
  for (const g of Array.isArray(r.regressioni) ? r.regressioni : []) {
    const cx = `regressione ${g?.chiave ?? "(senza chiave)"}`;
    if (vuoto(g?.chiave) || vuoto(g?.prova) || vuoto(g?.esito_prova)) { rossi.push(`${cx}: servono chiave, prova ed esito_prova`); continue; }
    const v = ctx.registro?.get(g.chiave);
    if (!ctx.registro) { attese.push("manca registro-compatto.txt: le regressioni non si possono controllare"); continue; }
    if (!v) { rossi.push(`${cx}: la chiave non è nel registro`); continue; }
    if (!STATI_CHIUSI.has(v.stato)) rossi.push(`${cx}: la voce è «${v.stato}», una regressione riguarda solo voci riparate o chiuse`);
    if (eRiservataTitolo(v.titolo) && (g.prova !== PRIVATO || g.esito_prova !== PRIVATO)) rossi.push(`${cx}: è una falla riservata: «prova» ed «esito_prova» valgono «${PRIVATO}», i dettagli vanno in chat`);
  }
  // i ricontrolli: solo S01; chiudere un grave vuole il comando e un verificatore
  const ricontrolli = Array.isArray(r.ricontrolli) ? r.ricontrolli : [];
  if (!ric && ricontrolli.length) rossi.push(`«ricontrolli» lo compila solo il ricontrollo (S01): ${ricontrolli.length} voci in ${nome}`);
  const viste = new Set();
  for (const k of ricontrolli) {
    const cx = `ricontrollo ${String(k?.chiave ?? "(senza chiave)").slice(0, 60)}`;
    if (viste.has(k?.chiave)) rossi.push(`${cx}: la stessa voce ricontrollata due volte`);
    viste.add(k?.chiave);
    if (!ESITI_RICONTROLLO.includes(k?.esito)) rossi.push(`${cx}: esito «${k?.esito}»`);
    // un elenco chiuso anche qui: un campo «dettagli» porterebbe in chiaro quello che «falla» deve tenere in chat
    const extraK = Object.keys(k ?? {}).filter((c) => !CAMPI_RICONTROLLO.includes(c));
    if (extraK.length) rossi.push(`${cx}: campi in più (${extraK.join(", ")}): solo ${CAMPI_RICONTROLLO.join(", ")}`);
    // ⓕ la falla scoperta durante il ricontrollo (21/11: dettagli di dodici voci ancora aperte finiti nei rami
    // pubblici, visti dal controllore finale dopo il push). Una voce che resta aperta dice SEMPRE se è una falla, anche
    // nel referto parziale: il ramo è pubblico appena spinto. Se lo è, prova, esito e nota vanno solo in chat.
    if (k?.prova_tipo != null && !PROVE.includes(k.prova_tipo)) rossi.push(`${cx}: prova_tipo «${String(k.prova_tipo).slice(0, 30)}» (vale ${PROVE.join(", ")} o null)`);
    if (k?.verificato != null && typeof k.verificato !== "boolean") rossi.push(`${cx}: «verificato» è true, false o null`);
    if (k?.esito && k.esito !== "non_piu_vero") {
      if (typeof k?.falla !== "boolean") rossi.push(`${cx}: una voce che resta aperta dice se è una falla (qualcuno può vedere, cambiare o pagare quello che non dovrebbe): «falla» true o false`);
      else if (k.falla === true) {
        for (const c of ["prova", "esito_prova", "nota", "verificato_da"]) if (k[c] != null && k[c] !== PRIVATO) rossi.push(`${cx}: è una falla ancora aperta: «${c}» vale «${PRIVATO}» (o null), i dettagli vanno solo in chat`);
      }
    } else if (k?.falla === true) rossi.push(`${cx}: «falla: true» vale solo per una voce che resta aperta; una falla chiusa si scrive non_piu_vero con la sua prova`);
    if (!ctx.daRicontrollare) { attese.push("manca da-ricontrollare.txt: i ricontrolli non si possono controllare"); continue; }
    const v = ctx.daRicontrollare.get(k?.chiave);
    if (!v) { rossi.push(`${cx}: la chiave non è in da-ricontrollare.txt`); continue; }
    if ((k.esito === "non_piu_vero" || k.esito === "cambiato") && vuoto(k?.prova)) rossi.push(`${cx}: «${k.esito}» vuole la prova`);
    if (k.esito === "non_piu_vero" && GRAVI.has(v.gravita)) {
      const ok = k?.prova_tipo === "comando" && k?.prova_eseguita === true && !vuoto(k?.esito_prova);
      if (!ok) (finita ? rossi : attese).push(`${cx}: chiudere un ${v.gravita} vuole una prova a comando eseguita con esito`);
      if (finita && (k?.verificato !== true || !testo(k?.verificato_da))) rossi.push(`${cx}: chiudere un ${v.gravita} vuole un verificatore (verificato true e verificato_da): nel dubbio resta aperto`);
    }
  }
  if (ric && finita && ctx.daRicontrollare) {
    const mie = new Set((ctx.lottiS01 ?? []).map((riga) => riga[1]));
    const nonViste = [...mie].filter((k) => !viste.has(k));
    if (nonViste.length) {
      const nonFatti = [...dichiarati.values()].filter((l) => l.esito === "non_fatto").map((l) => l.id);
      const scoperte = (ctx.lottiS01 ?? []).filter((riga) => !viste.has(riga[1]) && !nonFatti.includes(riga[0]));
      if (scoperte.length) rossi.push(`${scoperte.length} voci dei lotti fatti senza ricontrollo (la prima: «${String(scoperte[0][1]).slice(0, 60)}»)`);
    }
  }
  // le prove per la palestra
  for (const pv of Array.isArray(r.prove_per_la_palestra) ? r.prove_per_la_palestra : []) {
    const cx = `prova da palestra ${pv?.id ?? "(senza id)"}`;
    for (const c of ["chi", "file", "passi", "atteso"]) if (vuoto(pv?.[c])) rossi.push(`${cx}: «${c}» vuoto`);
    if (!vuoto(pv?.chi) && !CHI.includes(pv.chi)) rossi.push(`${cx}: chi «${pv.chi}»`);
    for (const p of String(pv?.file ?? "").split(SEP).map((y) => y.trim()).filter(Boolean)) {
      if (/:\d+(-\d+)?$/.test(p)) rossi.push(`${cx}: «${p}» porta una riga, qui vanno percorsi senza riga`);
      else if (ctx.righeDi(p) === null) rossi.push(`${cx}: ${p} non è un file a ${piano.base.slice(0, 12)}`);
    }
  }
  // una falla scoperta nel ricontrollo non si racconta altrove: il suo titolo non torna in domande, prove per la
  // palestra, copertura o difetti (collaudo A del 24/11: il «come» passava da domande_per_nicola e da non_guardato).
  // Il programma vede il titolo ripetuto, non una parafrasi: quella resta un giudizio (debito dichiarato).
  // spazi e a capo contano come uno spazio solo, e anche il «perche» di un lotto è un posto dove raccontare (collaudo A, secondo giro)
  const normale = (t) => String(t).toLowerCase().replace(/\s+/g, " ").trim();
  const falleAperte = ricontrolli.filter((k) => k?.falla === true && k?.esito !== "non_piu_vero" && typeof k?.chiave === "string").map((k) => normale(k.chiave.split("|").slice(1).join("|"))).filter((t) => t.length >= 12);
  if (falleAperte.length) {
    const altrove = valori({ lotti: r.lotti, difetti: r.difetti, scartati: r.scartati, regressioni: r.regressioni, prove_per_la_palestra: r.prove_per_la_palestra, domande_per_nicola: r.domande_per_nicola, copertura: r.copertura, conto: r.conto }).map(normale);
    for (const t of falleAperte) if (altrove.some((v) => v.includes(t.slice(0, 60)))) rossi.push(`la falla «${t.slice(0, 50)}…» è nominata fuori dal suo ricontrollo: i dettagli vanno solo in chat`);
  }
  // l'id di una riservata non si nomina in nessun altro campo (collaudo del 6/11)
  const idRiservate = difetti.filter((d) => d?.riservato === true && !vuoto(d?.id)).map((d) => d.id);
  if (idRiservate.length) {
    const fuori = { ...r, difetti: difetti.filter((d) => d?.riservato !== true) };
    for (const v of [...valori(fuori), ...chiavi(fuori)]) for (const id of idRiservate) if (new RegExp(`\\b${id}\\b`, "i").test(v)) rossi.push(`l'id della riservata ${id} compare in un altro campo: i dettagli vanno solo in chat`);
  }
  // ⑱ il tetto: a referto finito il conto degli agenti c'è, e sta nel tetto o porta il permesso della regista
  const agenti = r.conto?.agenti;
  if (finita) {
    if (!Number.isInteger(agenti) || agenti < 0) rossi.push("a referto finito «conto.agenti» è il numero intero di subagenti usati");
    else if (agenti > x.tetto && !testo(r.conto?.permesso_regista)) rossi.push(`${agenti} subagenti, oltre il tetto di ${x.tetto}, senza «conto.permesso_regista» (regola ⑱)`);
    // ⓓ il costo in dollari della sessione: senza, la riga delle misure resta vuota e il preventivo dopo si fa a memoria
    // (il 21/11 nessuno dei quattro referti lo aveva: «ci sono solo i conteggi dei token»)
    const usd = r.conto?.usd;
    // una sessione che ha lavorato costa più di zero: lo 0 del modello lasciato com'è vale come costo che manca
    // (collaudo B del 24/11: con lo 0 il referto passava e misura lo contava come costo noto)
    const usdOk = costoNoto(usd);
    if (!usdOk && String(r.conto?.usd_perche ?? "").trim().length < 15) rossi.push("a referto finito «conto.usd» è il costo della sessione in dollari, più di zero (usage.cost_usd di get_session senza id), oppure «conto.usd_perche» dice in una frase perché non c'è");
  }
  return { rossi, attese: [...new Set(attese)] };
}

function contestoReferto(opz, piano, nome) {
  return {
    piano, nome, sessione: piano.sessioni[nome],
    lenti: new Set(lentiDelSito(opz)),
    registro: leggiTabella(join(opz.cartella, "registro-compatto.txt")),
    daRicontrollare: (() => { const t = leggiTabella(join(opz.cartella, "da-ricontrollare.txt")); if (t) for (const v of t.values()) v.gravita = v.righe[1]; return t; })(),
    lottiS01: piano.sessioni[nome]?.tema === "S01" ? leggiLotti(opz, nome) : null,
    righeDi: (p) => righeDi(opz, piano.base, p),
  };
}
function validaReferto(opz) {
  const [file] = opz.posizionali;
  if (!file || !opz.cartella) return uso("valida-referto <file> --cartella <dir>");
  const piano = leggiPiano(opz);
  let testo, r;
  try { testo = readFileSync(file, "utf8"); r = JSON.parse(testo); } catch (e) { return chiudi("valida-referto", [`${file}: non si legge come JSON (${e.message})`], [], opz); }
  const nome = basename(file).match(/^(S\d{2}[b-z]?)\.json$/)?.[1] ?? r?.sessione;
  if (!piano.sessioni[nome]) return chiudi("valida-referto", [`«${nome}» non è una sessione del piano`], [], opz);
  const doppie = chiaviDoppie(testo);
  const { rossi, attese } = regoleReferto(r, contestoReferto(opz, piano, nome));
  if (doppie.length) rossi.unshift(`chiavi scritte due volte nello stesso oggetto (il ramo pubblico mostra anche la prima): ${[...new Set(doppie)].join(", ")}`);
  return chiudi("valida-referto", rossi, attese, opz, { sessione: nome, difetti: (r.difetti ?? []).length, finita: r.finita === true });
}

// ── sorveglia ────────────────────────────────────────────────────────────────────────────────────
function sorveglia(opz) {
  if (!opz.cartella || !opz.onda) return uso("sorveglia --cartella <dir> --onda N [--attendi]");
  if (opz.attendi) return attendi(opz);
  const piano = leggiPiano(opz);
  const sess = leggiSessioni(opz);
  if (!sess?.sessioni) return chiudi("sorveglia", [], ["sessioni.json non c'è: nessuna sessione da sorvegliare"], opz);
  const onda = piano.onde[Number(opz.onda) - 1];
  // un'onda che non c'è non è un verde: la skill smette di sorvegliare proprio sull'uscita 0 (collaudo del 12/11)
  if (!Array.isArray(onda) || !/^\d+$/.test(String(opz.onda))) return uso(`sorveglia --onda 1..${piano.onde.length} --cartella <dir>`);
  // un nome di ramo che comincia con «-» git lo leggerebbe come un'opzione: si passano solo nomi di ramo veri
  const cieco = scaricaRami(opz, onda.map((s) => sess.sessioni[s]?.ramo));
  if (cieco) console.log(`⚪ ${cieco}: quei rami si guardano al giro dopo`);
  const rossi = [], attese = [], righe = [];
  const tmp = mkdtempSync(join(tmpdir(), "radiografia-"));
  const relCart = rel(opz, opz.cartella);
  try {
    for (const s of onda) {
      const v = sess.sessioni[s];
      if (!v?.ramo) { attese.push(`${s}: non ancora aperta`); righe.push(`${s} · non aperta`); continue; }
      const silenzio = { ...opz, json: false, posizionali: [v.ramo, s] };
      const log = console.log; console.log = () => {};
      let g, rv = 3, finita = false, n = 0;
      try {
        g = guardiaRamo(silenzio);
        const testo = gitOk(opz.git, ["show", `origin/${v.ramo}:${relCart}/referti/${s}.json`]);
        if (testo !== null) {
          const p = join(tmp, `${s}.json`);
          scriviTesto(p, testo);
          rv = validaReferto({ ...silenzio, posizionali: [p] });
          try { const r = JSON.parse(testo); finita = r.finita === true; n = (r.difetti ?? []).length; } catch { /* il rosso lo dice già valida-referto */ }
        }
      } finally { console.log = log; }
      const segno = (e) => (e === 0 ? "✅" : e === 1 ? "🔴" : "⚪");
      if (g === 1) rossi.push(`${s}: guardia-ramo rossa (node cervello/radiografia-sessioni.mjs guardia-ramo ${v.ramo} ${s} --cartella ${relCart})`);
      if (rv === 1) rossi.push(`${s}: referto rosso (valida-referto sul referto del ramo)`);
      if (!(finita && rv === 0 && g === 0) && g !== 1 && rv !== 1) attese.push(`${s}: al lavoro`);
      righe.push(`${s} · guardia ${segno(g)} · referto ${segno(rv)} ${n} difetti${finita ? " · finita" : ""}`);
    }
  } finally { rmSync(tmp, { recursive: true, force: true }); }
  const ora = timbroOra();
  const diario = join(opz.cartella, "diario-della-sorveglianza.txt");
  scriviTesto(diario, (existsSync(diario) ? readFileSync(diario, "utf8") : "") + righe.map((r) => `${ora} · onda ${opz.onda} · ${r}`).join("\n") + "\n");
  console.log("ricorda: list_sessions (limit 20) per le figlie BLOCKED, ogni giro: da qui lo stato delle sessioni non si vede");
  // verde vuol dire: tutte le sessioni dell'onda finite e verdi. Finché una lavora l'esito è «in attesa».
  return chiudi("sorveglia", rossi, attese, opz, { onda: Number(opz.onda), righe });
}

// ── doppioni ─────────────────────────────────────────────────────────────────────────────────────
const parole = (t) => new Set(String(t ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[^a-z0-9]+/).filter((w) => w.length > 3));
export function somiglianza(a, b) {
  const A = parole(a), B = parole(b);
  if (A.size === 0 || B.size === 0) return 0;
  let c = 0;
  for (const w of A) if (B.has(w)) c++;
  return c / (A.size + B.size - c);
}
export function vicini(campoA, campoB, righe) {
  const A = fileCitati(campoA), B = fileCitati(campoB);
  return A.some((a) => B.some((b) => a.f === b.f && (a.da === null || b.da === null || (a.da <= b.a + righe && b.da <= a.a + righe))));
}
// Si tiene il più grave, poi la prova più forte: un bloccante non si sostituisce mai con un grave (collaudo del 12/11, B4).
const forza = (d) => (3 - SEVERITA.indexOf(d.severita)) * 10 + (d.prova_tipo === "comando" && d.prova_eseguita ? 3 : d.prova_tipo === "umano" ? 2 : 1);
/**
 * I doppioni, PURA. Da soli si tolgono solo i difetti con la STESSA chiave dimensione|titolo: contro il registro
 * (voce aperta → nel_registro, voce chiusa → regressioni_candidate) e fra le sessioni (gruppi). Un confronto
 * approssimato (stesso file a meno di N righe e titoli simili) non toglie niente: finisce in «simili» o in
 * «simili_registro», e lo decide il controllore finale. Il collaudo del 12/11 ha fatto unire così un bloccante con un
 * grave diverso, e il bloccante spariva. Le riservate non passano di qui: hanno tutte lo stesso file e titoli quasi uguali.
 * difetti: [{sessione, d}] · registro: [{chiave, stato, titolo, file}]
 */
export function trovaDoppioni(difetti, registro, { righe = 10, soglia = 0.4 } = {}) {
  const nelRegistro = [], regressioni = [], gruppi = [], simili = [], similiRegistro = [];
  const restano = [];
  for (const { sessione, d } of difetti) {
    if (d?.riservato === true) continue;
    const chiave = chiaveProblema(d);
    const uguale = registro.find((v) => v.chiave === chiave);
    if (uguale) { (STATI_CHIUSI.has(uguale.stato) ? regressioni : nelRegistro).push({ id: d.id, sessione, chiave, stato: uguale.stato }); continue; }
    const vicina = registro.find((v) => !eRiservataTitolo(v.titolo) && vicini(d.file, v.file, righe) && somiglianza(d.titolo, v.titolo) >= soglia);
    if (vicina) similiRegistro.push({ id: d.id, sessione, chiave: vicina.chiave, stato: vicina.stato });
    restano.push({ sessione, d });
  }
  const perChiave = new Map();
  for (const x of restano) { const k = chiaveProblema(x.d); if (!perChiave.has(k)) perChiave.set(k, []); perChiave.get(k).push(x); }
  const uniti = new Set();
  for (const g of perChiave.values()) {
    if (g.length < 2) continue;
    const tenuto = [...g].sort((x, y) => forza(y.d) - forza(x.d) || x.d.id.localeCompare(y.d.id))[0];
    const altri = g.filter((x) => x !== tenuto).map((x) => x.d.id);
    altri.forEach((id) => uniti.add(id));
    gruppi.push({ tenuto: tenuto.d.id, uniti: altri, visto_da: [...new Set(g.map((x) => x.sessione))] });
  }
  const tenuti = restano.filter((x) => !uniti.has(x.d.id));
  for (let i = 0; i < tenuti.length; i++) for (let k = i + 1; k < tenuti.length; k++) {
    const a = tenuti[i].d, b = tenuti[k].d;
    if (vicini(a.file, b.file, righe) && somiglianza(a.titolo, b.titolo) >= soglia) simili.push({ a: a.id, b: b.id });
  }
  return { nel_registro: nelRegistro, regressioni_candidate: regressioni, gruppi, simili, simili_registro: similiRegistro };
}
const CAMPI_DOPPIONI = ["nel_registro", "regressioni_candidate", "gruppi", "simili", "simili_registro"];
const stessiDoppioni = (a, b) => CAMPI_DOPPIONI.every((c) => JSON.stringify(a?.[c] ?? null) === JSON.stringify(b?.[c] ?? null));
function leggiReferti(opz) {
  const d = opz.referti ? resolve(opz.referti) : join(opz.cartella, "referti");
  if (!existsSync(d)) return [];
  return readdirSync(d).filter((f) => /^S\d{2}[b-z]?\.json$/.test(f)).sort().map((f) => ({ nome: f.slice(0, -5), r: leggiJson(join(d, f)) }));
}
function leggiRegistroVoci(opz) {
  const reg = leggiJson(opz.registro);
  return (reg.problemi ?? []).map((p) => ({ chiave: chiaveProblema(p), stato: p.stato, titolo: p.titolo, file: p.file }));
}
function calcolaDoppioni(opz, referti) {
  const T = caricaTemi(opz);
  const difetti = referti.flatMap(({ nome, r }) => (r.difetti ?? []).map((d) => ({ sessione: nome, d })));
  return { difetti, esito: trovaDoppioni(difetti, leggiRegistroVoci(opz), { righe: T.misure.righe_vicine, soglia: T.misure.somiglianza_titoli }) };
}
const idFuoriDaiDoppioni = (dop) => new Map([
  ...(dop.nel_registro ?? []).map((v) => [v.id, "nel registro"]),
  ...(dop.regressioni_candidate ?? []).map((v) => [v.id, "regressione"]),
  ...(dop.gruppi ?? []).flatMap((g) => g.uniti.map((id) => [id, `unito a ${g.tenuto}`])),
]);
function doppioni(opz) {
  if (!opz.cartella) return uso("doppioni --cartella <dir> [--uscita <dir>] [--referti <dir>]");
  const piano = leggiPiano(opz);
  const referti = leggiReferti(opz);
  if (referti.length === 0) return chiudi("doppioni", [], ["nessun referto in referti/"], opz);
  const { difetti, esito } = calcolaDoppioni(opz, referti);
  // dentro una sessione si lancia con --uscita <scratchpad>: il ramo della sessione cambia solo il suo referto
  const uscita = opz.uscita ? resolve(opz.uscita) : opz.cartella;
  scriviJson(join(uscita, "doppioni.json"), { calcolato: timbroOra(), base: piano.base, ...esito });
  const fuori = idFuoriDaiDoppioni(esito);
  const righe = difetti.filter((x) => !fuori.has(x.d.id)).map(({ sessione, d }) => d.riservato ? [d.id, sessione, d.severita, PRIVATO, "Falla di sicurezza da chiudere: i dettagli restano fuori dal deposito pubblico"].join("\t") : [d.id, sessione, d.severita, piatto(d.file), piatto(d.titolo)].join("\t"));
  scriviTesto(join(uscita, "trovati.txt"), ["# id\tsessione\tgravita\tfile\ttitolo  (i difetti tenuti dopo i doppioni: la seconda onda li cerca con grep prima di scrivere)", ...righe].join("\n") + "\n");
  console.log(`difetti letti: ${difetti.length} · uguali a voci aperte del registro: ${esito.nel_registro.length} · uguali a voci chiuse (regressioni): ${esito.regressioni_candidate.length} · uguali fra sessioni: ${esito.gruppi.length} gruppi · tenuti: ${righe.length}`);
  if (esito.simili.length || esito.simili_registro.length) console.log(`simili da decidere al controllo finale (restano dentro finché nessuno li toglie): ${esito.simili.length} coppie fra sessioni, ${esito.simili_registro.length} vicini a voci del registro`);
  return chiudi("doppioni", [], [], opz, { letti: difetti.length, tenuti: righe.length, simili: esito.simili.length, simili_registro: esito.simili_registro.length });
}

// ── grezzo ───────────────────────────────────────────────────────────────────────────────────────
const CAMPI_GREZZO = ["dimensione", "titolo", "severita", "file", "descrizione", "impatto", "fix", "causa_radice", "prova", "prova_tipo", "prova_eseguita", "esito_prova", "perche_umano", "verificato", "verificato_da"];
const SEI_PRIVATI = ["descrizione", "impatto", "fix", "causa_radice", "prova", "esito_prova"];
export function prossimoR(problemi) {
  return Math.max(0, ...problemi.map((p) => Number(String(p.titolo ?? "").match(/^Falla di sicurezza R(\d+)/)?.[1] ?? 0))) + 1;
}
/** Una riservata nel grezzo: campi da un elenco CHIUSO, mai copiati dal referto (collaudo del 12/11, B2). PURA. */
export function riservataNelGrezzo(d, numeroR) {
  const f = { dimensione: d.dimensione, titolo: String(d.titolo).replace(/^Falla di sicurezza /, `Falla di sicurezza R${numeroR} `), severita: d.severita, file: PRIVATO };
  for (const c of SEI_PRIVATI) f[c] = "nel referto privato";
  Object.assign(f, { prova_tipo: d.prova_tipo, prova_eseguita: d.prova_eseguita, verificato: d.verificato, verificato_da: PRIVATO });
  return f;
}
function grezzo(opz) {
  if (!opz.cartella || !/^\d{4}-\d\d-\d\d$/.test(opz.data ?? "")) return uso("grezzo --cartella <dir> --data AAAA-MM-GG [--togli S06-001,S02-004]");
  const piano = leggiPiano(opz);
  const dp = join(opz.cartella, "doppioni.json");
  if (!existsSync(dp)) return chiudi("grezzo", ["manca doppioni.json: prima «doppioni»"], [], opz);
  const dop = leggiJson(dp);
  const referti = leggiReferti(opz);
  const rossi = [];
  // un referto rosso non entra: il grezzo diventa pubblico e poi registro (collaudo del 12/11, B2)
  for (const { nome, r } of referti) {
    if (!piano.sessioni[nome]) { rossi.push(`referti/${nome}.json non è una sessione del piano`); continue; }
    const { rossi: rr } = regoleReferto(r, contestoReferto(opz, piano, nome));
    if (r.finita !== true || rr.length) rossi.push(`${nome}: referto ${r.finita !== true ? "non finito" : `rosso (${rr.length} problemi)`}: il grezzo non lo legge`);
  }
  if (!stessiDoppioni(dop, calcolaDoppioni(opz, referti).esito)) rossi.push("doppioni.json non è quello che il programma calcola oggi su referti e registro: rilancia «doppioni»");
  // i simili decisi dal controllore finale: si tolgono solo quelli che doppioni ha segnato come simili
  const ammessiTogli = new Map([...(dop.simili ?? []).flatMap((c) => [[c.a, c.b], [c.b, c.a]]), ...(dop.simili_registro ?? []).map((v) => [v.id, v.chiave])]);
  const togli = String(opz.togli ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  for (const id of togli) if (!ammessiTogli.has(id)) rossi.push(`--togli ${id}: non è fra i simili di doppioni.json, e un difetto non si toglie a mano`);
  const fuori = new Set([...idFuoriDaiDoppioni(dop).keys(), ...togli]);
  const visto = new Map((dop.gruppi ?? []).map((g) => [g.tenuto, g.visto_da]));
  let numeroR = prossimoR(leggiJson(opz.registro).problemi ?? []);
  const perDim = new Map();
  for (const { nome, r: ref } of referti) for (const d of ref.difetti ?? []) {
    if (fuori.has(d.id)) continue;
    let f;
    if (d.riservato === true) f = riservataNelGrezzo(d, numeroR++);
    else { f = {}; for (const c of CAMPI_GREZZO) if (d[c] !== undefined) f[c] = d[c]; }
    const anche = (visto.get(d.id) ?? []).filter((x) => x !== nome);
    f.giro = 1;
    f.fonte_radiografia = `radiografia ${opz.data} · ${nome}${anche.length ? ` (vista anche da ${anche.join(", ")})` : ""}`;
    f.id_sessione = d.id;
    if (!perDim.has(d.dimensione)) perDim.set(d.dimensione, []);
    perDim.get(d.dimensione).push(f);
  }
  const tutti = [...perDim.values()].flat();
  const chiavi = tutti.map((f) => chiaveProblema(f));
  if (new Set(chiavi).size !== chiavi.length) rossi.push("nel grezzo due difetti hanno la stessa chiave dimensione|titolo: il digest ne terrebbe uno solo");
  const nel = new Set(leggiRegistroVoci(opz).map((v) => v.chiave));
  const giaDentro = chiavi.filter((k) => nel.has(k));
  if (giaDentro.length) rossi.push(`${giaDentro.length} difetti del grezzo hanno una chiave già nel registro: rilancia «doppioni»`);
  const out = {
    data: opz.data, tipo: "radiografia-marketplace", fonte: `radiografia in sessioni (${piano.profilo}), ${Object.keys(piano.sessioni).length} sessioni`,
    codice_analizzato: piano.base, totale: tutti.length,
    bloccanti: tutti.filter((f) => f.severita === "bloccante").length, gravi: tutti.filter((f) => f.severita === "grave").length, minori: tutti.filter((f) => f.severita === "minore").length,
    tolti: togli.map((id) => ({ id, simile_a: ammessiTogli.get(id) ?? null })),
    dimensioni: [...perDim.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([dimensione, findings]) => ({ dimensione, findings })),
  };
  if (!rossi.length) scriviJson(join(opz.cartella, "grezzo.json"), out);
  console.log(`grezzo: ${out.totale} difetti (bloccanti ${out.bloccanti}, gravi ${out.gravi}, minori ${out.minori}), tolti come simili: ${togli.length}${rossi.length ? " — NON scritto" : ` in ${rel(opz, join(opz.cartella, "grezzo.json"))}`}`);
  return chiudi("grezzo", rossi, [], opz, { totale: out.totale });
}

// ── conti ────────────────────────────────────────────────────────────────────────────────────────
function conti(opz) {
  if (!opz.cartella) return uso("conti --cartella <dir>");
  const piano = leggiPiano(opz);
  const referti = leggiReferti(opz);
  const rossi = [], attese = [];
  const sessioniAttese = Object.keys(piano.sessioni);
  for (const s of sessioniAttese) if (!referti.some((x) => x.nome === s)) attese.push(`${s}: referto non ancora in referti/`);
  for (const { nome, r } of referti) {
    if (!piano.sessioni[nome]) { rossi.push(`referti/${nome}.json: non è una sessione del piano`); continue; }
    const { rossi: rr } = regoleReferto(r, contestoReferto(opz, piano, nome));
    rr.filter((x) => x.startsWith("id spariti")).forEach((x) => rossi.push(`${nome}: ${x}`));
  }
  const tuttiId = referti.flatMap(({ nome, r }) => (r.difetti ?? []).map((d) => ({ nome, d })));
  const dp = join(opz.cartella, "doppioni.json"), gp = join(opz.cartella, "grezzo.json");
  let fuori = new Map();
  if (existsSync(dp)) {
    const dop = leggiJson(dp);
    // il conto non si fida del file: lo rifà, e un doppioni.json ritoccato a mano è rosso (collaudo del 12/11, A7)
    if (!stessiDoppioni(dop, calcolaDoppioni(opz, referti).esito)) rossi.push("doppioni.json non è quello che il programma calcola su referti e registro: è stato ritoccato, o i referti sono cambiati dopo");
    fuori = idFuoriDaiDoppioni(dop);
  } else attese.push("doppioni.json non c'è ancora");
  const nelGrezzo = new Map();
  if (existsSync(gp)) {
    const g = leggiJson(gp);
    for (const t of g.tolti ?? []) if (!fuori.has(t.id)) fuori.set(t.id, `tolto come simile di ${t.simile_a}`);
    for (const dim of g.dimensioni ?? []) for (const f of dim.findings ?? []) nelGrezzo.set(f.id_sessione, (nelGrezzo.get(f.id_sessione) ?? 0) + 1);
  } else attese.push("grezzo.json non c'è ancora");
  if (existsSync(dp) && existsSync(gp)) {
    for (const { d } of tuttiId) {
      const dentro = nelGrezzo.has(d.id), via = fuori.has(d.id);
      if (!dentro && !via) rossi.push(`${d.id}: trovato, ma non è né nel grezzo né fra doppioni e regressioni — è sparito`);
      if (dentro && via) rossi.push(`${d.id}: è nel grezzo e insieme ${fuori.get(d.id)}`);
    }
    for (const [id, n] of nelGrezzo) {
      if (!tuttiId.some((x) => x.d.id === id)) rossi.push(`${id}: è nel grezzo ma in nessun referto`);
      if (n > 1) rossi.push(`${id}: è nel grezzo ${n} volte`);
    }
  }
  const per = (g) => tuttiId.filter((x) => x.d.severita === g).length;
  const scartati = referti.reduce((n, { r }) => n + (r.scartati ?? []).length, 0);
  console.log(`referti: ${referti.length} di ${sessioniAttese.length} · difetti trovati: ${tuttiId.length} (bloccanti ${per("bloccante")}, gravi ${per("grave")}, minori ${per("minore")}) · scartati dai verificatori: ${scartati}`);
  if (existsSync(gp)) console.log(`nel grezzo: ${nelGrezzo.size} · fuori dal grezzo per doppione, regressione o simile tolto: ${fuori.size}`);
  return chiudi("conti", rossi, attese, opz, { trovati: tuttiId.length, nel_grezzo: nelGrezzo.size, fuori: fuori.size, scartati });
}

// ── applica ──────────────────────────────────────────────────────────────────────────────────────
/**
 * I ricontrolli e le regressioni sul registro, per CHIAVE (mai per posizione: il digest sposta gli indici). PURA:
 * riceve i problemi e i referti, torna { problemi nuovi, conti, rossi }. Solo quello che regge le regole del
 * referto: un grave chiuso senza verificatore resta aperto (lo dice già valida-referto, qui si ricontrolla).
 */
export function applicaAlRegistro(problemi, referti, { data, base, ora, regressioniDoppioni = [] }) {
  const [aa, mm, gg] = data.split("-");
  const campo = `riverifica_${Number(gg)}_${Number(mm)}`;
  const perChiave = new Map();
  problemi.forEach((p, i) => { const k = chiaveProblema(p); if (!perChiave.has(k)) perChiave.set(k, []); perChiave.get(k).push(i); });
  const nuovi = problemi.map((p) => ({ ...p }));
  const rossi = [];
  const conti = { chiusi: 0, riverificati: 0, riaperti: 0 };
  const daRiservare = [];
  const trova = (k, cx) => {
    const ii = perChiave.get(k) ?? [];
    if (ii.length !== 1) { rossi.push(`${cx}: la chiave aggancia ${ii.length} voci, non una`); return null; }
    return ii[0];
  };
  for (const { nome, r } of referti) {
    for (const k of r.ricontrolli ?? []) {
      const i = trova(k.chiave, `${nome} ricontrollo`);
      if (i === null) continue;
      const v = nuovi[i];
      if (v.stato !== "aperto") { rossi.push(`${nome}: «${String(k.chiave).slice(0, 50)}» non è più aperta (${v.stato}): già chiusa da altri`); continue; }
      const grave = GRAVI.has(String(v.severita).toLowerCase());
      const provata = k.prova_tipo === "comando" && k.prova_eseguita === true && !vuoto(k.esito_prova);
      const chiude = k.esito === "non_piu_vero" && (!grave || (provata && k.verificato === true && !vuoto(k.verificato_da)));
      v[campo] = { data: ora, esito: k.esito, prova: k.prova ?? null, codice: base, nota: k.nota ?? null, ...(k.falla === true ? { falla: true } : {}) };
      conti.riverificati++;
      // una voce pubblica che il ricontrollo ha scoperto essere una falla: si dice alla regia, che propone a Nicola di
      // renderla riservata anche nel registro (decide lui, voce per voce: controllo finale del 21/11)
      if (k.falla === true && k.esito !== "non_piu_vero") daRiservare.push({ chiave: k.chiave, sessione: nome });
      if (chiude) {
        v.stato = "gia_riparato_prima";
        v.nota_riparazione = `Già riparato nel codice unito (ricontrollo della radiografia del ${Number(gg)}/${Number(mm)}, ${nome}${grave ? ", confermato dal verificatore" : ""}). ${k.prova ?? ""}`.trim();
        conti.chiusi++;
      }
    }
    for (const g of r.regressioni ?? []) {
      const i = trova(g.chiave, `${nome} regressione`);
      if (i === null) continue;
      const v = nuovi[i];
      if (!STATI_CHIUSI.has(v.stato)) continue;
      v.stato = "aperto";
      v.riaperto_il = ora;
      v.riaperto_da = `radiografia ${data} · ${nome}`;
      v[`nota_${Number(gg)}_${Number(mm)}`] = eRiservataTitolo(v.titolo) ? `riaperta dalla radiografia del ${data}: dettagli nel referto privato` : `riaperta: ${g.prova} → ${g.esito_prova}`;
      conti.riaperti++;
    }
  }
  // le regressioni che ha trovato «doppioni» (stessa chiave di una voce chiusa): fuori dal grezzo, quindi si
  // riaprono qui, o sparirebbero fra il grezzo e il registro
  for (const g of regressioniDoppioni) {
    const i = trova(g.chiave, `regressione di ${g.id}`);
    if (i === null) continue;
    const v = nuovi[i];
    if (!STATI_CHIUSI.has(v.stato)) continue;
    v.stato = "aperto";
    v.riaperto_il = ora;
    v.riaperto_da = `radiografia ${data} · ${g.sessione} (${g.id})`;
    v[`nota_${Number(gg)}_${Number(mm)}`] = eRiservataTitolo(v.titolo) ? `riaperta dalla radiografia del ${data}: dettagli nel referto privato` : `riaperta: la radiografia del ${data} l'ha ritrovata (${g.id}, ${g.sessione})`;
    conti.riaperti++;
  }
  if (nuovi.length !== problemi.length) rossi.push("il numero delle voci è cambiato: applica non toglie e non aggiunge voci");
  conti.da_riservare = daRiservare.length;
  return { problemi: nuovi, conti, rossi, daRiservare };
}
function applica(opz) {
  if (!opz.cartella || !/^\d{4}-\d\d-\d\d$/.test(opz.data ?? "")) return uso("applica --cartella <dir> --data AAAA-MM-GG [--scrivi]");
  const piano = leggiPiano(opz);
  const referti = leggiReferti(opz);
  const rossi = [];
  for (const { nome, r } of referti) {
    const { rossi: rr } = regoleReferto(r, contestoReferto(opz, piano, nome));
    if (rr.length || r.finita !== true) rossi.push(`${nome}: referto ${r.finita !== true ? "non finito" : `rosso (${rr.length} problemi)`}: applica non lo legge`);
  }
  const reg = leggiJson(opz.registro);
  const dp = join(opz.cartella, "doppioni.json");
  const regressioniDoppioni = existsSync(dp) ? leggiJson(dp).regressioni_candidate ?? [] : [];
  if (!existsSync(dp)) rossi.push("manca doppioni.json: le regressioni trovate dai doppioni andrebbero perse (prima «doppioni»)");
  const esito = applicaAlRegistro(reg.problemi ?? [], referti.filter(({ nome, r }) => !rossi.some((x) => x.startsWith(`${nome}:`)) && r.finita === true), { data: opz.data, base: piano.base, ora: timbroOra(), regressioniDoppioni });
  rossi.push(...esito.rossi);
  // ⓜ la riga delle misure prima del registro (regola 7 del 21/11: «a fine giro la regia scrive la sua riga», solo
  // testo; il file della riparazione è rimasto fermo dal 17 al 21/11 mentre giravano quattro onde)
  if (opz.scrivi) {
    // la prova non è un file della cartella ma la riga nel file delle misure, quello da cui nasce il preventivo
    const fm = resolve(opz.misure ?? join(QUI, "radiografia/misure.json"));
    let scritta = false, illeggibile = null;
    try { scritta = (leggiJson(fm).misure ?? []).some((m) => m?.cartella === rel(opz, opz.cartella)); } catch (e) { illeggibile = e.message; }
    if (illeggibile) rossi.push(`${rel(opz, fm)} non si legge (${illeggibile}): senza la riga delle misure il registro non si scrive`);
    else if (!scritta) rossi.push(`la riga delle misure di questa radiografia non è in ${rel(opz, fm)}: prima «misura --cartella … --usd-regia … --usd-cf … --scrivi», poi il registro (regola 7 del 21/11)`);
  }
  console.log(`ricontrolli applicati: ${esito.conti.riverificati} · chiusi come già riparati: ${esito.conti.chiusi} · regressioni riaperte: ${esito.conti.riaperti} · falle scoperte da rendere riservate: ${esito.daRiservare.length}${opz.scrivi ? "" : " (a vuoto: aggiungi --scrivi)"}`);
  scriviTesto(join(opz.cartella, "da-riservare.txt"), ["# chiave<TAB>sessione  (voci pubbliche che il ricontrollo ha trovato essere falle ancora aperte: la regia chiede a Nicola se renderle riservate nel registro; i dettagli sono solo nelle chat delle sessioni)", ...esito.daRiservare.map((d) => `${d.chiave}\t${d.sessione}`)].join("\n") + "\n");
  if (opz.scrivi && !rossi.length) {
    if (scriviJsonAtomico(opz.registro, { ...reg, problemi: esito.problemi }) === null) rossi.push(`la scrittura del registro ${rel(opz, opz.registro)} è stata fermata dal freno della memoria: niente è cambiato`);
    else console.log(`registro scritto: ${rel(opz, opz.registro)}`);
  }
  return chiudi("applica", rossi, [], opz, esito.conti);
}

// ── copertura-dopo ───────────────────────────────────────────────────────────────────────────────
function coperturaDopo(opz) {
  if (!opz.cartella) return uso("copertura-dopo --cartella <dir>");
  const piano = leggiPiano(opz);
  const referti = leggiReferti(opz);
  if (referti.length === 0) return chiudi("copertura-dopo", [], ["nessun referto da leggere"], opz);
  const coperti = new Set();
  for (const { r } of referti) {
    const c = r.copertura ?? {};
    (c.file_letti_interi ?? []).forEach((f) => coperti.add(f));
    (c.file_letti_in_parte ?? []).forEach((y) => coperti.add(y.file));
    (c.file_eseguiti ?? []).forEach((y) => coperti.add(y.file));
  }
  const temi = new Set(Object.values(piano.sessioni).map((s) => s.tema));
  const codice = leggiMappa(opz).filter((m) => m.segno === "codice" && m.chi.some((t) => temi.has(t)));
  const scoperti = codice.filter((m) => !coperti.has(m.f));
  console.log(`file di codice del perimetro: ${codice.length} · coperti: ${codice.length - scoperti.length} · scoperti: ${scoperti.length}`);
  if (scoperti.length) console.log(scoperti.slice(0, 40).map((m) => `${m.f}\t${m.chi.join(",")}`).join("\n") + (scoperti.length > 40 ? `\n… e altri ${scoperti.length - 40}` : ""));
  // verde solo a copertura piena: un buco è lavoro per il controllore finale, non un verde (scorciatoia 10)
  return chiudi("copertura-dopo", [], scoperti.length ? [`${scoperti.length} file di codice su ${codice.length} non li ha coperti nessuno`] : [], opz, { codice: codice.length, scoperti: scoperti.length });
}

// ── misura: la riga delle misure, scritta da un comando ─────────────────────────────────────────────
/** Un costo in dollari è noto solo se è un numero vero sopra zero: lo 0 del modello è un costo che manca. PURA. */
export const costoNoto = (v) => typeof v === "number" && Number.isFinite(v) && v > 0;
/** Chiude la voce? La stessa regola di applica: un grave o un bloccante solo con prova a comando e verificatore. PURA. */
export function chiudeRicontrollo(k, gravita) {
  if (k?.esito !== "non_piu_vero") return false;
  if (!GRAVI.has(gravita)) return true;
  return k.prova_tipo === "comando" && k.prova_eseguita === true && !vuoto(k.esito_prova) && k.verificato === true && !vuoto(k.verificato_da);
}
/**
 * La riga per cervello/radiografia/misure.json, dal piano e dai referti: un gruppo per tipo di sessione e ultracode,
 * così il preventivo dopo trova la misura con la stessa configurazione. Un gruppo con un costo che manca ha usd null
 * (e non entra nei preventivi): una misura a metà non si spaccia per intera. PURA.
 */
export function rigaMisura(piano, referti, { cartella, data, usdRegia = null, usdCf = null, gravitaDi = new Map(), nota = null }) {
  const gruppi = new Map();
  for (const [nome, x] of Object.entries(piano.sessioni)) {
    const tipo = x.tema === "S01" ? "ricontrollo" : "cerca", uc = x.ultracode === true;
    const k = `${tipo}|${uc}`;
    if (!gruppi.has(k)) gruppi.set(k, { tipo, metodo: "lotti", ultracode: uc, sessioni: 0, voci: tipo === "ricontrollo" ? 0 : null, lotti: 0, subagenti: 0, usd: 0, usd_noti: 0, ...(tipo === "ricontrollo" ? { chiusi: 0, esiti: {} } : {}), difetti: { bloccante: 0, grave: 0, minore: 0 } });
    const g = gruppi.get(k);
    g.sessioni++;
    g.lotti += x.lotti.length;
    if (tipo === "ricontrollo") g.voci += x.lotti.reduce((n, l) => n + (Number(l.voci) || 0), 0);
    const r = referti.find((y) => y.nome === nome)?.r;
    if (!r) continue;
    if (Number.isInteger(r.conto?.agenti)) g.subagenti += r.conto.agenti;
    if (costoNoto(r.conto?.usd)) { g.usd += r.conto.usd; g.usd_noti++; }
    for (const d of r.difetti ?? []) if (g.difetti[d?.severita] !== undefined) g.difetti[d.severita]++;
    if (tipo === "ricontrollo") for (const kk of r.ricontrolli ?? []) {
      g.esiti[kk.esito] = (g.esiti[kk.esito] ?? 0) + 1;
      if (chiudeRicontrollo(kk, gravitaDi.get(kk.chiave))) g.chiusi++;
    }
  }
  const tonda = (v) => Math.round(v * 100) / 100;
  const elenco = [...gruppi.values()].map(({ usd_noti, ...g }) => ({ ...g, usd: usd_noti === g.sessioni ? tonda(g.usd) : null, ...(usd_noti === g.sessioni ? {} : { usd_noti: `${usd_noti} su ${g.sessioni}` }) }));
  const usdSess = elenco.every((g) => g.usd !== null) ? tonda(elenco.reduce((n, g) => n + g.usd, 0)) : null;
  const usdRc = usdRegia !== null && usdCf !== null ? tonda(usdRegia + usdCf) : null;
  return {
    fase: `radiografia del ${data.slice(8, 10).replace(/^0/, "")}/${data.slice(5, 7).replace(/^0/, "")} (${piano.profilo})`,
    cartella, data, profilo: piano.profilo, base: piano.base, gruppi: elenco,
    usd_sessioni: usdSess, usd_regia: usdRegia, usd_cf: usdCf, usd_regia_e_cf: usdRc,
    usd: usdSess !== null && usdRc !== null ? tonda(usdSess + usdRc) : null,
    preventivo_atteso: piano.preventivo?.dollari?.usd?.atteso ?? null,
    nota,
  };
}
function misura(opz) {
  if (!opz.cartella) return uso("misura --cartella <dir> [--usd-regia N] [--usd-cf N] [--nota «…»] [--scrivi] [--misure <file>]");
  const numero = (k) => {
    if (opz[k] === undefined) return null;
    const v = Number(String(opz[k]).replace(",", "."));
    if (!Number.isFinite(v) || v < 0) throw new Error(`--${k} vuole un numero di dollari: «${opz[k]}»`);
    return v;
  };
  let usdRegia, usdCf;
  try { usdRegia = numero("usd-regia"); usdCf = numero("usd-cf"); } catch (e) { return uso(e.message); }
  const piano = leggiPiano(opz);
  const referti = leggiReferti(opz);
  const rossi = [], attese = [];
  for (const s of Object.keys(piano.sessioni)) {
    const r = referti.find((y) => y.nome === s)?.r;
    if (!r) attese.push(`${s}: referto non ancora in referti/`);
    else if (r.finita !== true) attese.push(`${s}: referto non finito`);
  }
  const tab = leggiTabella(join(opz.cartella, "da-ricontrollare.txt"));
  const gravitaDi = new Map([...(tab?.values() ?? [])].map((v) => [v.righe[0], v.righe[1]]));
  const riga = rigaMisura(piano, referti, { cartella: rel(opz, opz.cartella), data: timbroOra(), usdRegia, usdCf, gravitaDi, nota: opz.nota ?? null });
  // a vuoto non si scrive niente: misura.json nella cartella vuol dire «la riga è nel file delle misure» (collaudo A
  // del 24/11: con la misura a vuoto applica --scrivi passava e la riga non c'era)
  for (const g of riga.gruppi) console.log(`${g.tipo}${g.ultracode ? " con ultracode" : ""}: ${g.sessioni} sessioni · ${g.tipo === "ricontrollo" ? `${g.voci} voci, ${g.chiusi} chiuse · ` : ""}${g.lotti} lotti · ${g.subagenti} subagenti · ${g.usd === null ? `costo incompleto (${g.usd_noti})` : `${g.usd} $`}`);
  console.log(`totale: ${riga.usd === null ? "non completo" : `${riga.usd} $`} (sessioni ${riga.usd_sessioni ?? "?"} · regia ${usdRegia ?? "?"} · controllore finale ${usdCf ?? "?"})${riga.preventivo_atteso ? ` contro un preventivo atteso di ${riga.preventivo_atteso} $` : ""}`);
  if (riga.usd_sessioni === null) attese.push("il costo di qualche sessione manca (conto.usd nel referto): la riga entra, ma i gruppi incompleti non fanno preventivo");
  if (usdRegia === null || usdCf === null) attese.push("manca il costo della regia o del controllore finale (--usd-regia, --usd-cf, da get_session)");
  if (opz.scrivi) {
    if (attese.some((a) => /referto non/.test(a))) rossi.push("la riga delle misure si scrive a radiografia finita: tutti i referti in referti/ e finiti");
    const f = resolve(opz.misure ?? join(QUI, "radiografia/misure.json"));
    const M = existsSync(f) ? leggiJson(f) : null;
    if (!M || !Array.isArray(M.misure)) rossi.push(`${f}: non si legge, o non ha «misure»`);
    else if (M.misure.some((m) => m?.cartella === riga.cartella)) rossi.push(`la riga di ${riga.cartella} è già in ${rel(opz, f)}: le righe non si riscrivono`);
    if (!rossi.length) {
      if (scriviJsonAtomico(f, { ...M, _aggiornato: riga.data, misure: [...M.misure, riga] }) === null) rossi.push(`la scrittura di ${rel(opz, f)} è stata fermata dal freno della memoria`);
      else { scriviJson(join(opz.cartella, "misura.json"), { ...riga, scritta_in: rel(opz, f) }); console.log(`riga aggiunta a ${rel(opz, f)}`); }
    }
  }
  return chiudi("misura", rossi, attese, opz, { usd: riga.usd, gruppi: riga.gruppi.length });
}

// ── segnali e sorveglianza muta ────────────────────────────────────────────────────────────────────
// Nella riparazione la catena di send_later ogni 30 minuti costava fra 0,4 e 0,7 $ a giro a vuoto (regola 4 del 15/11);
// la sostituisce la sorveglianza muta, che sveglia la regia solo quando cambia qualcosa. La skill della radiografia
// prescriveva ancora la catena. Qui ci sono anche i due buchi della settimana dei 700: la sessione aperta che non parte
// (C02, 52 minuti persi; il primo K02 mai partito) e il costo che passa il preventivo a metà onda.
/**
 * I segnali per la regia, uno per riga e con l'identità dentro: «ferma S02 abc1234» resta noto finché il ramo non si
 * muove. PURA.
 */
export function segnaliRadiografia({ sessioni = [], vive = null, preventivoUsd = null, ora, minutiPartenza = 15, minutiFerma = 70, sogliaSpesa = 0.7, cieco = null }) {
  const out = [];
  if (cieco) out.push(`cieco ${cieco}`);
  for (const s of sessioni) {
    if (!s.sulRemoto) {
      if (!Number.isFinite(s.aperta)) { if (s.ramo) out.push(`senza ora d'apertura ${s.nome}`); }
      else if (ora - s.aperta > minutiPartenza * 60000) out.push(`non partita ${s.nome}`);
    }
    else out.push(`ramo ${s.nome} ${s.ramo}`);
    if (s.finita) out.push(`finita ${s.nome}`);
    else if (s.sulRemoto && s.testa && ora - s.testa.quando > minutiFerma * 60000) out.push(`ferma ${s.nome} ${String(s.testa.sha).slice(0, 7)}`);
    if (/requires_action|blocked/i.test(String(vive?.sessioni?.[s.nome]?.stato ?? ""))) out.push(`attesa ${s.nome}`);
  }
  const stima = Number(preventivoUsd), spesa = Number(vive?.spesa_usd);
  if (stima > 0 && spesa > 0) {
    if (spesa >= stima) out.push("spesa oltre il 100% del preventivo atteso");
    else if (spesa >= sogliaSpesa * stima) out.push(`spesa oltre il ${Math.round(sogliaSpesa * 100)}% del preventivo atteso`);
  }
  if (vive?.quota?.status === "allowed_warning") out.push("quota allowed_warning");
  if (vive?.quota?.isUsingOverage === true) out.push("quota isUsingOverage");
  return out;
}
const RE_RAMO = /^[A-Za-z0-9][\w./-]*$/;
function ondaDi(opz, piano) {
  if (!/^\d+$/.test(String(opz.onda ?? "")) || !Array.isArray(piano.onde[Number(opz.onda) - 1])) return null;
  return piano.onde[Number(opz.onda) - 1];
}
// Scarica i rami dell'onda UNO PER UNO, col refspec esplicito (vale anche in un clone a ramo singolo). Un fetch solo
// per tutti falliva intero se un ramo non era ancora spinto: proprio la sessione che non parte accecava tutta l'onda
// fino al battito (collaudo A del 24/11). Un ramo che non c'è ancora non è un errore; un fetch che fallisce per altro
// sì. Senza un «origin» (il banco delle prove) non c'è niente da scaricare.
function scaricaRami(opz, rami) {
  const buoni = rami.filter((r) => typeof r === "string" && RE_RAMO.test(r));
  if (!buoni.length || !(gitOk(opz.git, ["remote"]) ?? "").split("\n").includes("origin")) return null;
  const falliti = [];
  for (const r of buoni) {
    try { git(opz.git, ["fetch", "-q", "origin", "--", `+refs/heads/${r}:refs/remotes/origin/${r}`]); }
    catch (e) { if (!/couldn't find remote ref|couldn.t find remote ref/i.test(`${e?.message ?? ""} ${e?.stderr ?? ""}`)) falliti.push(r); }
  }
  return falliti.length ? `fetch fallito per ${falliti.join(" ")}` : null;
}
function fattiRadiografia(opz, piano, onda, cieco = null) {
  const sess = leggiSessioni(opz);
  if (!sess?.sessioni) throw new Error("sessioni.json non c'è: nessuna sessione da guardare");
  const M = caricaTemi(opz).misure;
  const relCart = rel(opz, opz.cartella);
  const sessioni = onda.map((nome) => {
    const v = sess.sessioni[nome];
    const s = { nome, ramo: v?.ramo ?? null, aperta: v?.aperta ? msDaTimbro(v.aperta) : NaN, sulRemoto: false, finita: false, testa: null };
    if (!v?.ramo || !RE_RAMO.test(v.ramo) || gitOk(opz.git, ["rev-parse", "--verify", "--quiet", `origin/${v.ramo}`]) === null) return s;
    s.sulRemoto = true;
    const [sha, quando] = String(gitOk(opz.git, ["log", "-1", "--format=%H %ct", `origin/${v.ramo}`]) ?? "").trim().split(" ");
    if (sha) s.testa = { sha, quando: Number(quando) * 1000 };
    const t = gitOk(opz.git, ["show", `origin/${v.ramo}:${relCart}/referti/${nome}.json`]);
    if (t !== null) { try { s.finita = JSON.parse(t).finita === true; } catch { /* illeggibile: non finita */ } }
    return s;
  });
  const leggiSe = (f) => (existsSync(join(opz.cartella, f)) ? leggiJson(join(opz.cartella, f)) : null);
  const noti = existsSync(join(opz.cartella, "rossi-noti.txt")) ? readFileSync(join(opz.cartella, "rossi-noti.txt"), "utf8") : "";
  const tutti = segnaliRadiografia({
    sessioni, vive: leggiSe("stato-sessioni.json"), preventivoUsd: piano.preventivo?.usd ?? null, ora: Date.now(),
    minutiPartenza: M.minuti_partenza ?? 15, minutiFerma: M.minuti_ferma ?? 70, sogliaSpesa: M.soglia_spesa ?? 0.7, cieco,
  });
  return { sessioni, tutti, nuovi: nuoviSegnali(tutti, noti) };
}
function segnali(opz) {
  if (!opz.cartella) return uso("segnali --cartella <dir> --onda N [--tutti]");
  const piano = leggiPiano(opz);
  const onda = ondaDi(opz, piano);
  if (!onda) return uso(`segnali --onda 1..${piano.onde.length} --cartella <dir>`);
  const sess = leggiSessioni(opz);
  const cieco = scaricaRami(opz, onda.map((x) => sess?.sessioni?.[x]?.ramo));
  let f;
  try { f = fattiRadiografia(opz, piano, onda, cieco); } catch (e) { console.error(`⚪ segnali: non ho potuto misurare — ${e.message}`); return 2; }
  for (const x of opz.tutti ? f.tutti : f.nuovi) console.log(x);
  if (opz.json) console.log(JSON.stringify({ controllo: "segnali", nuovi: f.nuovi, tutti: f.tutti }));
  return f.nuovi.length ? 1 : 0;
}
const dormi = (ms) => { if (ms > 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); };
function attendi(opz) {
  const piano = leggiPiano(opz);
  const onda = ondaDi(opz, piano);
  const intervallo = Number(opz.intervallo ?? 300), battito = Number(opz.battito ?? 7200);
  if (!onda || !(intervallo >= 0) || !(battito >= 0)) return uso(`sorveglia --onda 1..${piano.onde.length} --attendi [--intervallo secondi] [--battito secondi] --cartella <dir>`);
  const sess = leggiSessioni(opz);
  const inizio = Date.now();
  for (;;) {
    const cieco = scaricaRami(opz, onda.map((x) => sess?.sessioni?.[x]?.ramo));
    let f;
    try { f = fattiRadiografia(opz, piano, onda, cieco); } catch (e) { console.error(`⚪ sorveglia: non ho potuto misurare — ${e.message}`); return 2; }
    if (f.nuovi.length) {
      for (const n of f.nuovi) console.log(`🔴 ${n}`);
      console.log(`prossimo: guarda i segnali (sorveglia --onda ${opz.onda} senza --attendi per guardia e referti), poi aggiungili a rossi-noti.txt e rilancia l'attesa`);
      return 1;
    }
    if (Date.now() - inizio >= battito * 1000) { console.log(`💓 battito: niente di nuovo da ${Math.round(battito / 60)} minuti; rilancia l'attesa`); return 4; }
    dormi(intervallo * 1000);
  }
}

// ── uscita ───────────────────────────────────────────────────────────────────────────────────────
function chiudi(nome, rossi, attese, opz, extra = {}) {
  const esito = rossi.length ? "rosso" : attese.length ? "in attesa" : "verde";
  for (const r of rossi.slice(0, 60)) console.log(`🔴 ${r}`);
  if (rossi.length > 60) console.log(`🔴 … e altri ${rossi.length - 60}`);
  for (const a of attese) console.log(`⚪ ${a}`);
  console.log(`${{ rosso: "🔴", "in attesa": "⚪", verde: "✅" }[esito]} ${nome}: ${esito}${rossi.length ? ` (${rossi.length} problemi)` : ""}`);
  if (opz.json) console.log(JSON.stringify({ controllo: nome, esito, rossi, attese, ...extra }));
  return rossi.length ? 1 : attese.length ? 3 : 0;
}
function uso(riga) {
  console.error(`uso: node cervello/radiografia-sessioni.mjs ${riga}`);
  return 2;
}

const COMANDI = {
  prepara, schede, preventivo, "copertura-prima": coperturaPrima, segnaposti, "guardia-ramo": guardiaRamo,
  "valida-referto": validaReferto, sorveglia, doppioni, grezzo, conti, applica, "copertura-dopo": coperturaDopo,
  misura, segnali,
};
export function esegui(argv) {
  const [cmd, ...resto] = argv;
  if (!COMANDI[cmd]) return uso(`<${Object.keys(COMANDI).join("|")}> … (vedi la testa del file)`);
  let opz;
  try { opz = leggiOpzioni(resto); } catch (e) { return uso(`${cmd}: ${e.message}`); }
  try { return COMANDI[cmd](opz); } catch (e) {
    console.error(`⚪ ${cmd}: non ho potuto misurare — ${e.message}`);
    return 2;
  }
}
// Il confronto passa dai percorsi VERI: lanciato da un collegamento simbolico il programma uscirebbe 0 senza fare niente.
if (process.argv[1] && veroPercorso(process.argv[1]) === veroPercorso(fileURLToPath(import.meta.url))) {
  process.exitCode = esegui(process.argv.slice(2));
}
