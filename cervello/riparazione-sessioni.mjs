#!/usr/bin/env node
// 🔧 LA RIPARAZIONE IN SESSIONI — il programma della regista.
//
// PERCHÉ ESISTE. Tre campagne di riparazione in parallelo in otto giorni (31/10, 1/11, 5/11): tre volte le
// regole riscritte da capo, tre volte più riparazioni dichiarate che vere. Il 5/11 ne erano state dichiarate
// 844, ne reggono circa 690. Il replay dei dieci rami del 5/11 trova 99 file di codice fuori territorio, 62
// file toccati da due rami e 6 file temporanei: li aveva visti a mano chi guardava i rami ogni tre minuti.
// La radiografia in 12 sessioni del 6/11 ha funzionato meglio perché i controlli meccanici li faceva un
// programma (controlli.mjs), non un agente. Questo è quel programma, per RIPARARE: salvato una volta, per il
// sito e per la macchina. Il metodo, le fasi e le fermate stanno nella skill `riparazione`.
//
// LA REGOLA CHE TIENE TUTTO. Nella stessa onda un file ha un padrone solo. Le zone fisse non reggono: sui
// 688 aperti del sito del 7/11, 254 (37%) citano file di zone diverse, e 536 voci su 590 sono legate in un
// gruppo solo da pochi file (`lib/stripe/payout.ts`, la cassa, il checkout). Quindi il padrone si decide
// onda per onda, dalla lista dei file di ogni voce: chi si scontra passa all'onda dopo, che parte dal lavoro
// già unito. Le migrazioni vecchie e le prove citate non bloccano: una migrazione applicata non si modifica
// mai (se ne aggiunge una nuova), e una prova esistente la può toccare chi possiede il sorgente che importa.
//
// Uso (dalla radice di ad-mycity):
//   node cervello/riparazione-sessioni.mjs <comando> [argomenti] --cartella <dir> [opzioni]
//
// Comandi:
//   perimetro                 sceglie le voci (profilo e filtri) e le divide in lavorabili e «fuori»
//   dividi                    mette le voci di un'onda nelle sessioni, un padrone per file
//   schede                    scrive schede/RNN.md dell'onda e registro-compatto.txt
//   copertura-prima           ogni voce dell'onda sta in un posto solo, ogni file ha un padrone solo
//   segnaposti                nelle schede non resta nessun segnaposto
//   guardia-ramo <ramo> <ID>  il RISULTATO del ramo (diff netto) tocca solo quello che la sessione può
//   valida-referto <file>     il referto di un riparatore rispetta formato e regole
//   valida-collaudo <file>    il referto di un collaudatore rispetta formato e regola del campione
//   prova-unione              i rami dell'onda non si pestano: nessun file in due rami, l'unione non litiga
//   applica [--scrivi]        da referti e collaudi: chi si chiude, chi resta aperto, i difetti nati
//   conti                     prima e dopo, incrociando le chiavi
//
// Uscita: 0 verde · 1 rosso · 2 uso sbagliato o non ho potuto misurare · 3 in attesa (mai un verde muto).
//
// Opzioni comuni:
//   --cartella <dir>   la cartella della campagna (consegne/riparazioni/AAAA-MM-GG-<nome>)
//   --radice <dir>     la radice di ad-mycity (predefinita: la cartella sopra questo file)
//   --casa sito|macchina   solo per `perimetro`; gli altri comandi la leggono da perimetro.json
//   --repo <dir>       il deposito del codice (sito: $MARKETPLACE_REPO, <radice>/marketplace, ../mycity;
//                      macchina: la radice)
//   --git <dir>        il deposito dove stanno i rami (predefinito: --repo)
//   --registro <file>  il registro (predefinito: quello del vault della casa)
//   --json             l'esito anche in JSON sull'ultima riga
//
// 🟢 Legge e scrive solo nella cartella della campagna. `applica --scrivi` scrive nei registri (🟡): lo
// lancia la regista, una volta, a fine campagna.

import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { basename, dirname, join, posix, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
// L'unico esecutore di git della casa: il tetto di maxBuffer sta lì, una volta sola. Il 6/11 la CI della
// radiografia era rossa proprio perché i suoi controlli chiamavano git per conto loro.
import { gitEsegui } from "./git-github.mjs";
import { chiaveProblema, REPARTI_MARKETPLACE } from "./referti-sito.mjs";
import { timbroOra } from "./ora-piacenza.mjs";
import { scriviJsonAtomico, scriviTestoAtomico } from "./scrivi-json.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const veroPercorso = (p) => { try { return realpathSync(p); } catch { return resolve(p); } };

// ── Le costanti del metodo ───────────────────────────────────────────────────────────────────────
export const RANGO = Object.freeze({ bloccante: 0, grave: 1, medio: 2, minore: 3 });
export const GRAVI = new Set(["bloccante", "grave"]);
export const ESITI = Object.freeze(["riparato", "parziale", "gia_riparato_prima", "non_codice", "scelta_di_nicola", "serve_file_altrui", "non_fatto"]);
export const VERDETTI = Object.freeze(["regge", "parziale", "non_regge", "rompe_altro"]);
export const GIUDIZI = Object.freeze(["pieno", "nessuno"]);
export const LENTI = Object.freeze(["chiude_tutta", "nata_rotta"]);
export const PROVE = Object.freeze(["comando", "lettura-codice", "umano"]);
export const MAX_SESSIONI = 12;
// 25 e non più 45 (Nicola, 12/11: «i lavori più lunghi che ci impiegano tante ore suddividilo in altre
// sessioni»): un riparatore finisce in circa metà tempo, e il profilo «tutto» passa da due a tre onde.
export const PER_SESSIONE = 25;
export const TETTO_CUCITURA = 40;
export const SOGLIA_CAMPIONE = 0.9;
export const QUOTA_CAMPIONE = 0.3;
export const MINIMO_CAMPIONE = 5;
export const SOGLIA_HUB = 3; // un file citato da almeno tre voci del perimetro è un file che lega
export const FASCIA_MIGRAZIONI = 10;
export const TETTO_RIGHE = 40;
export const PRIVATO = "(nel referto privato)";
export const REFERTO_DIR = ".riparazione";
// I file della macchina che nessuna sessione tocca mai: i registri condivisi li scrive solo la regista
// (lezione del 29/7: risolvere un conflitto «a favore del proprio lato» ha disfatto 30 chiusure altrui),
// e i manuali li riletta ogni agente a ogni passo.
export const CONDIVISI_MACCHINA = Object.freeze([
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json",
  "cervello/mutanti.json",
  "cervello/malattie.json",
  "cervello/tetti-lotto.json",
  "cervello/MANUALE-AD.md",
  "COMANDI.md",
  "CLAUDE.md",
  ".claude/settings.json",
]);
export const CAMPI_RISERVATA = Object.freeze(["riservato", "titolo", "file", "severita", "dimensione"]);
// L'area è presa da un elenco CHIUSO: un'area libera racconta la falla anche in poche parole («webhook Stripe
// senza firma», secondo collaudo del 7/11). Stesso motivo per la gravità.
export const AREE_RISERVATE = Object.freeze(["pagamenti", "accessi", "dati", "permessi", "API", "rilascio", "privacy", "altro"]);
export const TITOLO_RISERVATO = new RegExp(`^Falla di sicurezza da chiudere \\((${AREE_RISERVATE.join("|")})\\): i dettagli restano fuori dal deposito pubblico finché non è chiusa\\.?$`);
const PREFISSI_NON_DEPOSITO = /^(live|vercel|produzione|stripe|supabase|github|posthog|resend|dns):/i;
const SHA = /^[0-9a-f]{7,40}$/;
const SEGNAPOSTI = ["{{", "}}", "<sha>", "<ramo>", "<id>", "<regista>", "AAAA-MM-GG HH:MM", "<data>"];
const TEMPORANEI = [
  /(^|\/)\.(?!riparazione\/|github\/workflows\/[^/]+\.ya?ml$|gitignore$|eslintrc|prettierrc|editorconfig|nvmrc|env\.example$)[^/]+(\/|$)/,
  /\.(tmp|bak|orig|rej|swp)$/i,
  /~$/,
  /(^|\/)(node_modules|coverage|\.next|dist|out)\//,
  /(^|\/)\.DS_Store$/,
];

// ── Opzioni ──────────────────────────────────────────────────────────────────────────────────────
const BOOLEANE = new Set(["json", "anche-umani", "anche-rimandati", "ultima", "scrivi"]);
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
  return opz;
}
function repoSito(opz) {
  if (opz.repo) return resolve(opz.repo);
  const candidati = [process.env.MARKETPLACE_REPO, join(opz.radice, "marketplace"), join(opz.radice, "..", "mycity")].filter(Boolean);
  return candidati.find((c) => existsSync(join(c, ".git"))) ?? candidati[0];
}
export function repoDi(casa, opz) {
  return casa === "macchina" ? resolve(opz.repo ?? opz.radice) : repoSito(opz);
}
export function registroDi(casa, opz) {
  if (opz.registro) return resolve(opz.registro);
  const nome = casa === "macchina" ? "cantiere-difetti.json" : "radiografia-marketplace.json";
  return join(opz.radice, "MyCity-Vault/90-Memoria-AI/auto-coscienza", nome);
}

// ── Aiutanti ─────────────────────────────────────────────────────────────────────────────────────
const git = (dir, args, env = {}) => gitEsegui(["-C", dir, ...args], undefined, env, { grezzo: true }).toString("utf8");
function gitOk(dir, args, env = {}) {
  try { return git(dir, args, env); } catch { return null; }
}
const vuoto = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0);
const leggiJson = (p) => JSON.parse(readFileSync(p, "utf8"));
// Ogni file passa dalla porta di scrittura della casa: fuori dalla memoria scrive dov'era, dentro rispetta la
// sola lettura e la sabbiera (misura-che-non-sporca, AR-639). Una scrittura fermata non è un verde muto: si dice.
function scriviTesto(p, testo) {
  if (scriviTestoAtomico(p, testo) === null) throw new Error(`la scrittura di ${p} è stata fermata dal freno della memoria (sola lettura)`);
}
const scriviJson = (p, dati) => scriviTesto(p, JSON.stringify(dati, null, 2) + "\n");
const tre = (n) => String(n).padStart(3, "0");
const due = (n) => String(n).padStart(2, "0");
export const nomeSessione = (n) => `R${due(n)}`;
const numeroSessione = (s) => Number(String(s).slice(1));

function chiudi(nome, rossi, attese, opz, extra = {}) {
  const esito = rossi.length ? "rosso" : attese.length ? "in attesa" : "verde";
  const segno = { rosso: "🔴", "in attesa": "⚪", verde: "✅" }[esito];
  // Il tetto di stampa: la sorveglianza legge le prime righe, il JSON le porta tutte.
  for (const r of rossi.slice(0, TETTO_RIGHE)) console.log(`🔴 ${r}`);
  if (rossi.length > TETTO_RIGHE) console.log(`🔴 … e altri ${rossi.length - TETTO_RIGHE} (tutti in --json)`);
  for (const a of attese.slice(0, TETTO_RIGHE)) console.log(`⚪ ${a}`);
  if (attese.length > TETTO_RIGHE) console.log(`⚪ … e altre ${attese.length - TETTO_RIGHE} attese`);
  console.log(`${segno} ${nome}: ${esito}${rossi.length ? ` (${rossi.length} problemi)` : ""}`);
  if (opz.json) console.log(JSON.stringify({ controllo: nome, esito, rossi, attese, ...extra }));
  return rossi.length ? 1 : attese.length ? 3 : 0;
}
function uso(riga) {
  console.error(`uso: node cervello/riparazione-sessioni.mjs ${riga}`);
  return 2;
}
function cieco(nome, perche, opz) {
  console.log(`⚪ ${nome}: non ho potuto misurare — ${perche}`);
  if (opz.json) console.log(JSON.stringify({ controllo: nome, esito: "cieco", perche }));
  return 2;
}
function serveCartella(opz) {
  if (!opz.cartella) throw new Error("manca --cartella <dir>: la cartella della campagna");
  return opz.cartella;
}
function leggiPerimetro(opz) {
  const p = join(serveCartella(opz), "perimetro.json");
  if (!existsSync(p)) throw new Error(`${p} non c'è: prima \`perimetro\``);
  return leggiJson(p);
}
function leggiPiano(opz, { serve = true } = {}) {
  const p = join(serveCartella(opz), "piano.json");
  if (!existsSync(p)) {
    if (serve) throw new Error(`${p} non c'è: prima \`dividi\``);
    return null;
  }
  return leggiJson(p);
}
function leggiSessioni(opz) {
  const p = join(serveCartella(opz), "sessioni.json");
  return existsSync(p) ? leggiJson(p) : null;
}

// Una chiave scritta due volte nello stesso oggetto: JSON.parse tiene l'ultima, ma il ramo pubblico mostra
// il testo intero (terzo collaudo della radiografia, 6/11). Un lettore minimo, solo per contare le chiavi.
export function chiaviDoppie(testo) {
  const doppie = [];
  const pila = [];
  let i = 0, attesaChiave = false;
  const leggiStringa = () => {
    let j = i + 1, fuori = "";
    while (j < testo.length && testo[j] !== '"') { if (testo[j] === "\\") { fuori += testo[j] + testo[j + 1]; j += 2; } else fuori += testo[j++]; }
    i = j + 1;
    return fuori;
  };
  while (i < testo.length) {
    const ch = testo[i];
    if (ch === "{") { pila.push(new Set()); attesaChiave = true; i++; }
    else if (ch === "[") { pila.push(null); attesaChiave = false; i++; }
    else if (ch === "}" || ch === "]") { pila.pop(); attesaChiave = false; i++; }
    else if (ch === ",") { attesaChiave = pila.at(-1) instanceof Set; i++; }
    else if (ch === '"') {
      const grezza = leggiStringa();
      let s = grezza;
      try { s = JSON.parse(`"${grezza}"`); } catch { /* resta com'è scritta */ }
      if (attesaChiave && pila.at(-1) instanceof Set) {
        if (pila.at(-1).has(s)) doppie.push(s);
        pila.at(-1).add(s);
        attesaChiave = false;
      }
    } else i++;
  }
  return doppie;
}
function valori(o, fuori = []) {
  if (typeof o === "string") fuori.push(o);
  else if (Array.isArray(o)) o.forEach((x) => valori(x, fuori));
  else if (o && typeof o === "object") Object.values(o).forEach((x) => valori(x, fuori));
  return fuori;
}
export function dataVera(t) {
  const m = String(t ?? "").match(/^(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d)$/);
  if (!m) return false;
  const [, aa, mm, gg, hh, mi] = m.map(Number);
  const d = new Date(Date.UTC(aa, mm - 1, gg, hh, mi));
  return d.getUTCFullYear() === aa && d.getUTCMonth() === mm - 1 && d.getUTCDate() === gg && hh <= 23 && mi <= 59;
}

// ── I file di una voce ───────────────────────────────────────────────────────────────────────────
/**
 * I percorsi del deposito citati nel campo `file` di una voce del sito («percorso:riga · percorso:a-b»).
 * PURA. I pezzi che non sono il deposito (live:, vercel:, il referto privato, la prosa) restano fuori, ma
 * si contano: un campo da cui non esce niente rende la voce «senza percorso», mai un insieme vuoto muto.
 */
// Un percorso dentro un testo libero: almeno una barra e un'estensione. Le parentesi dei gruppi di Next.js
// («app/(shop)/…») stanno dentro un segmento; quelle della prosa («(onAuthStateChange: …)») no, perché non
// arrivano mai a una barra seguita da un nome con estensione.
const RE_PERCORSO = /(?:^|[\s`'"«(,;])((?:[\w@[\]()+.-]+\/)+[\w@[\]+.-]+\.[A-Za-z0-9]{1,5})(?=$|[\s`'"»),;:])/g;
// I file della radice del sito (middleware.ts, package.json, .eslintrc.json…): niente barra, quindi solo
// estensioni di codice e configurazione. Un nome che non esiste alla base lo toglie poi il controllo dei file.
const RE_FILE_RADICE = /(?:^|[\s`'"«(,;])(\.?[\w-]+(?:\.[\w-]+)*\.(?:ts|tsx|js|mjs|cjs|json|ya?ml|sql|css|md))(?=$|[\s`'"»),;:])/g;
export function fileDaCampoSito(campo) {
  const fuori = new Set();
  let privato = false, scartati = 0;
  // Il 7/11 su 688 aperti: 183 campi su 184 «senza percorso» avevano il percorso giusto seguito da prosa
  // («…route.ts:15-21 e :36-38 (schema con …)»). Il campo si legge a pezzi, ma i percorsi si CERCANO.
  for (const pezzo of String(campo ?? "").split(/\s*[·;]\s*/)) {
    const p = pezzo.trim();
    if (!p) continue;
    if (p.includes(PRIVATO) || p.includes("nel referto privato")) { privato = true; continue; }
    if (PREFISSI_NON_DEPOSITO.test(p) || /^vercel\s*→/i.test(p)) { scartati++; continue; }
    let trovati = 0;
    const testo = p.replace(/\/home\/user\/(?:ad-mycity\/marketplace|mycity)\//g, " ");
    for (const m of [...testo.matchAll(RE_PERCORSO), ...testo.matchAll(RE_FILE_RADICE)]) {
      let perc = m[1].replace(/^\.\//, "").replace(/^marketplace\//, "");
      // «(app/page.tsx …)»: la parentesi è della prosa se il primo segmento non la chiude
      if (perc.startsWith("(") && !perc.split("/")[0].includes(")")) perc = perc.slice(1);
      if (/^https?:|:\/\//.test(perc) || /^[\w-]+\.(com|it|app|dev|io|net|org)\//.test(perc)) continue;
      fuori.add(perc);
      trovati++;
    }
    if (!trovati) scartati++;
  }
  return { file: [...fuori], privato, scartati };
}
// Le estensioni dalla più lunga, chiuse da un confine: con «jsx?» prima di «json» il collaudo del 7/11 ha visto
// «cervello/mutanti.json» diventare «cervello/mutanti.js», e un registro condiviso finire a una sessione.
const RE_FILE_MACCHINA = /[\w./@[\]-]+\.(?:tsx|ts|jsx|json|mjs|cjs|js|sql|css|sh|md|yaml|yml|svg|bats)(?![\w])/g;
/** I percorsi citati da una scheda della macchina. PURA. I nomi nudi («page.tsx») non indirizzano: fuori. */
export function fileDaSchedaMacchina(d, radice = "", radiceNoti = null) {
  const testo = [d?.dove, d?.causa_radice, d?.fix_proposto, d?.verifica?.comando, d?.verifica?.file]
    .filter(Boolean).join(" ").slice(0, 20_000);
  const fuori = new Set();
  for (const f of testo.match(RE_FILE_MACCHINA) || []) {
    const n = f.replace(radice ? radice.replace(/\/?$/, "/") : "\u0000", "").replace(/^\.?\//, "");
    // Un nome nudo («page.tsx») indirizza a decine di file, quindi non vale; ma un file che esiste nella RADICE
    // alla base sì: senza, CLAUDE.md e COMANDI.md (file condivisi) finivano ai riparatori (collaudo B del 7/11).
    if (!n.includes("/") && !(radiceNoti && radiceNoti.has(n))) continue;
    fuori.add(n);
  }
  return [...fuori];
}
export const eProva = (p) => /(^|\/)(tests?|__tests__)\//.test(p) || /\.(test|spec)\.[cm]?[jt]sx?$/.test(p) || p.endsWith(".bats");
export const eMigrazione = (p) => /^(supabase\/)?migrations\/\d+_[^/]+\.sql$/.test(p);
export const numeroMigrazione = (p) => Number((p.match(/migrations\/(\d+)_/) || [])[1] ?? NaN);
/** Una forma sola per un percorso: «./lib/a.ts», «marketplace/lib/a.ts» e «lib/x/../a.ts» sono lo stesso file. PURA. */
export const normPerc = (p) => posix.normalize(String(p)).replace(/^(\.\/)+/, "").replace(/^marketplace\//, "");
/** I file di una voce che decidono di chi è il lavoro: le migrazioni vecchie e le prove non decidono. PURA. */
export const fileCheDecidono = (file) => file.map(normPerc).filter((f) => !eMigrazione(f) && !eProva(f));

// ── I registri ───────────────────────────────────────────────────────────────────────────────────
function leggiRegistro(casa, opz) {
  const percorso = registroDi(casa, opz);
  if (!existsSync(percorso)) throw new Error(`il registro ${percorso} non c'è`);
  const j = leggiJson(percorso);
  const elenco = casa === "macchina" ? j.difetti : j.problemi;
  if (!Array.isArray(elenco)) throw new Error(`${percorso} non ha più l'elenco «${casa === "macchina" ? "difetti" : "problemi"}»: il registro ha cambiato forma`);
  return { percorso, grezzo: j, elenco };
}
export function chiaveDi(casa, d) {
  return casa === "macchina" ? String(d?.id ?? "") : chiaveProblema(d);
}
export const gravitaDi = (casa, d) => String((casa === "macchina" ? d?.gravita || d?.severita : d?.severita) || "(senza gravità)").trim().toLowerCase();
const statoDi = (d) => String(d?.stato ?? "").trim();
function dataDi(casa, d) {
  const testo = casa === "macchina" ? [d?.nato, d?.nato_il].join(" ") : [d?.nato_il, d?.nato, d?.fonte_radiografia, d?.fonte].join(" ");
  return (testo.match(/\d{4}-\d{2}-\d{2}/) || [])[0] ?? null;
}

// ── perimetro ────────────────────────────────────────────────────────────────────────────────────
/**
 * Divide le voci aperte in lavorabili e «fuori». PURA (riceve tutto quello che legge).
 * L'ordine dei «fuori» conta: una riservata resta riservata anche se ha una domanda per Nicola.
 */
export function classifica(casa, elenco, { filtri = {}, fileDelDeposito = null, risposte = new Set(), radice = "" } = {}) {
  const fuori = { riservate: [], domande: [], rimandati: [], umani: [], sospese: [], senza_percorso: [] };
  const lavorabili = [];
  const spariti = [];
  let nelFiltro = 0, aperti = 0;
  for (const d of elenco) {
    const stato = statoDi(d);
    const chiave = chiaveDi(casa, d);
    const sospesa = casa === "macchina" && ["da-riverificare", "in-corso"].includes(stato);
    if (stato !== "aperto" && !sospesa) continue;
    aperti++;
    if (!passaIFiltri(casa, d, filtri, chiave)) continue;
    nelFiltro++;
    if (sospesa) { fuori.sospese.push(chiave); continue; }
    const estratti = casa === "macchina" ? { file: fileDaSchedaMacchina(d, radice, fileDelDeposito), privato: false } : fileDaCampoSito(d.file);
    // Riservata anche quando il rimando al referto privato sta in una riverifica o in una nota: 5 voci del 7/11
    // toccavano una falla ancora aperta e sarebbero andate nel deposito pubblico come lavoro normale (collaudo B).
    // Largo quando si chiude: nel dubbio, la voce resta fuori dal lavoro pubblico.
    const riservata = casa === "sito" && (estratti.privato || /^falla di sicurezza/i.test(String(d.titolo ?? "")) || valori(d).some((v) => /referto privato|fuori dal deposito pubblico|falla riservata/i.test(v)));
    if (riservata) { fuori.riservate.push(chiave); continue; }
    if (casa === "sito" && !vuoto(d.domanda_per_nicola) && !risposte.has(chiave)) { fuori.domande.push(chiave); continue; }
    if (casa === "macchina" && !vuoto(d.ripresa) && !filtri.ancheRimandati) { fuori.rimandati.push(chiave); continue; }
    if (casa === "macchina" && d.verifica?.tipo === "umano" && !filtri.ancheUmani) { fuori.umani.push(chiave); continue; }
    let file = [...new Set(estratti.file.map(normPerc))];
    if (fileDelDeposito) {
      const via = file.filter((f) => !fileDelDeposito.has(f));
      if (via.length) spariti.push({ chiave, file: via });
      file = file.filter((f) => fileDelDeposito.has(f));
    }
    if (file.length === 0) { fuori.senza_percorso.push(chiave); continue; }
    lavorabili.push({ chiave, titolo: String(d.titolo ?? ""), gravita: gravitaDi(casa, d), dimensione: String(d.dimensione ?? "(senza dimensione)"), file: [...new Set(file.map(normPerc))] });
  }
  return { aperti, nel_filtro: nelFiltro, lavorabili, fuori, spariti };
}
function passaIFiltri(casa, d, f, chiave) {
  if (f.chiavi && !f.chiavi.has(chiave)) return false;
  if (f.gravita && !f.gravita.has(gravitaDi(casa, d))) return false;
  if (f.dimensioni && !f.dimensioni.has(String(d.dimensione ?? ""))) return false;
  if (f.natiDal) {
    const data = dataDi(casa, d);
    if (!data || data < f.natiDal) return false;
  }
  if (f.diff) {
    const file = casa === "macchina" ? fileDaSchedaMacchina(d) : fileDaCampoSito(d.file).file;
    if (!file.some((x) => f.diff.has(x))) return false;
  }
  return true;
}
const PROFILI = ["tutto", "urgente", "funzione", "scelta"];
function perimetro(opz) {
  const casa = opz.casa;
  if (!["sito", "macchina"].includes(casa)) return uso("perimetro --casa sito|macchina --cartella <dir> [--profilo tutto|urgente|funzione|scelta] [filtri]");
  const profilo = opz.profilo ?? "tutto";
  if (!PROFILI.includes(profilo)) return uso(`perimetro --profilo ${PROFILI.join("|")}`);
  const cartella = serveCartella(opz);
  const repo = repoDi(casa, opz);
  const filtri = {};
  const elenco = (v) => new Set(String(v).split(",").map((x) => x.trim().toLowerCase()).filter(Boolean));
  if (opz.gravita) filtri.gravita = elenco(opz.gravita);
  if (opz.dimensione) filtri.dimensioni = new Set(String(opz.dimensione).split(",").map((x) => x.trim()).filter(Boolean));
  if (opz.chiavi || opz["file-chiavi"]) {
    filtri.chiavi = new Set();
    if (opz.chiavi) for (const k of String(opz.chiavi).split(",")) if (k.trim()) filtri.chiavi.add(k.trim());
    if (opz["file-chiavi"]) for (const r of readFileSync(resolve(opz["file-chiavi"]), "utf8").split(/\r?\n/)) if (r.trim() && !r.startsWith("#")) filtri.chiavi.add(r.trim());
  }
  if (opz["nati-dal"]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(opz["nati-dal"])) return uso("perimetro --nati-dal AAAA-MM-GG");
    filtri.natiDal = opz["nati-dal"];
  }
  if (opz.diff) {
    const [a, b] = String(opz.diff).split("..");
    if (!a || !b) return uso("perimetro --diff <base>..<testa>");
    const out = gitOk(repo, ["diff", "--name-only", "--no-renames", a, b]);
    if (out === null) return cieco("perimetro", `git diff ${opz.diff} non riesce in ${repo}`, opz);
    filtri.diff = new Set(out.split("\n").filter(Boolean));
  }
  filtri.ancheUmani = !!opz["anche-umani"];
  filtri.ancheRimandati = !!opz["anche-rimandati"];
  if (profilo === "urgente" && !filtri.chiavi && !filtri.gravita) filtri.gravita = new Set(["bloccante"]);
  if (profilo === "funzione" && !filtri.diff && !filtri.natiDal) return uso("perimetro --profilo funzione vuole --diff <base>..<testa> oppure --nati-dal AAAA-MM-GG");
  if (profilo === "scelta" && !filtri.chiavi && !filtri.gravita && !filtri.dimensioni && !filtri.natiDal && !filtri.diff) return uso("perimetro --profilo scelta vuole almeno un filtro");
  const risposte = new Set();
  if (opz.risposte) for (const r of readFileSync(resolve(opz.risposte), "utf8").split(/\r?\n/)) if (r.trim() && !r.startsWith("#")) risposte.add(r.split("\t")[0].trim());
  let reg;
  try { reg = leggiRegistro(casa, opz); } catch (e) { return cieco("perimetro", e.message, opz); }
  let fileDelDeposito = null;
  const base = (gitOk(repo, ["rev-parse", "--verify", "--quiet", `${opz.base ?? "HEAD"}^{commit}`]) ?? "").trim();
  if (base) {
    const out = gitOk(repo, ["ls-tree", "-r", "--name-only", base]);
    if (out === null) return cieco("perimetro", `il commit ${base} non c'è in ${repo}`, opz);
    fileDelDeposito = new Set(out.split("\n").filter(Boolean));
  }
  const r = classifica(casa, reg.elenco, { filtri, fileDelDeposito, risposte, radice: repo });
  const dati = {
    casa, profilo, creato: opz.quando ?? timbroOra(), registro: reg.percorso.replace(opz.radice + "/", ""),
    deposito: casa === "macchina" ? "NicolaeRotaru/ad-mycity" : "NicolaeRotaru/mycity", base: base || null,
    filtri: {
      gravita: filtri.gravita ? [...filtri.gravita] : null, dimensioni: filtri.dimensioni ? [...filtri.dimensioni] : null,
      chiavi: filtri.chiavi ? filtri.chiavi.size : null, nati_dal: filtri.natiDal ?? null, diff: opz.diff ?? null,
      anche_umani: filtri.ancheUmani, anche_rimandati: filtri.ancheRimandati,
    },
    conti: {
      aperti: r.aperti, nel_filtro: r.nel_filtro, lavorabili: r.lavorabili.length,
      ...Object.fromEntries(Object.entries(r.fuori).map(([k, v]) => [k, v.length])),
    },
    lavorabili: r.lavorabili, fuori: r.fuori, percorsi_spariti: r.spariti,
  };
  scriviJson(join(cartella, "perimetro.json"), dati);
  const g = {};
  for (const v of r.lavorabili) g[v.gravita] = (g[v.gravita] ?? 0) + 1;
  console.log(`📋 ${casa} · profilo ${profilo}: ${r.aperti} aperti, ${r.nel_filtro} nel filtro, ${r.lavorabili.length} lavorabili (${Object.entries(g).sort((a, b) => (RANGO[a[0]] ?? 9) - (RANGO[b[0]] ?? 9)).map(([k, v]) => `${v} ${k}`).join(", ") || "nessuno"})`);
  for (const [k, v] of Object.entries(r.fuori)) if (v.length) console.log(`   fuori · ${k}: ${v.length}`);
  if (r.spariti.length) console.log(`   ${r.spariti.length} voci citano percorsi che alla base non esistono (file spariti, o testo che sembra un percorso): restano con i file veri`);
  if (r.nel_filtro === 0) return chiudi("perimetro", [], ["nessuna voce aperta nel filtro: niente da riparare"], opz, { conti: dati.conti });
  if (r.lavorabili.length === 0) return chiudi("perimetro", [], ["nessuna voce lavorabile: restano solo voci «fuori» (lista per Nicola)"], opz, { conti: dati.conti });
  return chiudi("perimetro", [], [], opz, { conti: dati.conti });
}

// ── dividi ───────────────────────────────────────────────────────────────────────────────────────
/**
 * Mette le voci di un'onda nelle sessioni. PURA.
 *
 * Le voci arrivano in ordine di gravità; una voce entra in una sessione solo se TUTTI i suoi file sono
 * liberi o già di quella sessione. A parità sceglie la sessione del suo tema (la dimensione), poi una
 * sessione ancora vuota, poi la meno carica. Chi si scontra con due sessioni, o trova piena la sua, passa
 * all'onda dopo. Chi tocca un file che nessuna sessione può toccare va alla regia.
 */
export function assegnaOnda(voci, { sessioni: k, perSessione = PER_SESSIONE, primoNumero = 1, vietati = new Set() } = {}) {
  const ordinate = [...voci].sort((a, b) =>
    (RANGO[a.gravita] ?? 9) - (RANGO[b.gravita] ?? 9)
    || String(a.dimensione).localeCompare(String(b.dimensione))
    || String(fileCheDecidono(a.file)[0] ?? a.file[0] ?? "").localeCompare(String(fileCheDecidono(b.file)[0] ?? b.file[0] ?? ""))
    || String(a.chiave).localeCompare(String(b.chiave)));
  const quante = Math.max(1, Math.min(MAX_SESSIONI, k ?? Math.ceil(ordinate.length / perSessione)));
  const sess = Array.from({ length: quante }, (_, i) => ({ nome: nomeSessione(primoNumero + i), tema: null, voci: [], file: new Set() }));
  const padrone = new Map();
  const rimandate = [], regia = [];
  for (const v of ordinate) {
    if (v.file.some((f) => vietati.has(normPerc(f)))) { regia.push(v.chiave); continue; }
    const decidono = fileCheDecidono(v.file);
    const loro = new Set(decidono.filter((f) => padrone.has(f)).map((f) => padrone.get(f)));
    let i;
    if (loro.size > 1) { rimandate.push(v.chiave); continue; }
    if (loro.size === 1) {
      i = [...loro][0];
      if (sess[i].voci.length >= perSessione) { rimandate.push(v.chiave); continue; }
    } else {
      const libere = sess.map((s, j) => j).filter((j) => sess[j].voci.length < perSessione);
      if (!libere.length) { rimandate.push(v.chiave); continue; }
      const carico = (j) => sess[j].voci.length;
      const stessoTema = libere.filter((j) => sess[j].tema === v.dimensione).sort((a, b) => carico(a) - carico(b));
      const vuote = libere.filter((j) => sess[j].tema === null);
      i = stessoTema[0] ?? vuote[0] ?? libere.sort((a, b) => carico(a) - carico(b))[0];
    }
    const s = sess[i];
    if (s.tema === null) s.tema = v.dimensione;
    s.voci.push({ id: `${s.nome}-${tre(s.voci.length + 1)}`, chiave: v.chiave, gravita: v.gravita, titolo: v.titolo, file: [...new Set(v.file.map(normPerc))] });
    for (const f of decidono) { padrone.set(f, i); s.file.add(f); }
  }
  const usate = sess.filter((s) => s.voci.length > 0);
  return {
    sessioni: Object.fromEntries(usate.map((s) => [s.nome, { tema: s.tema, voci: s.voci, file: [...s.file].sort() }])),
    rimandate, regia,
  };
}
function massimaMigrazione(repo, base) {
  const out = gitOk(repo, ["ls-tree", "-r", "--name-only", base]);
  if (out === null) return null;
  let max = 0;
  for (const p of out.split("\n")) if (eMigrazione(p)) max = Math.max(max, numeroMigrazione(p));
  return max;
}
function dividi(opz) {
  let per, piano;
  try { per = leggiPerimetro(opz); piano = leggiPiano(opz, { serve: false }); } catch (e) { return cieco("dividi", e.message, opz); }
  const casa = per.casa;
  piano ??= { casa, profilo: per.profilo, creato: opz.quando ?? timbroOra(), onde: [], cucitura: [], eccedenza: [] };
  const onda = Number(opz.onda ?? piano.onde.length + 1);
  if (!Number.isInteger(onda) || onda < 1 || onda > piano.onde.length + 1) return uso(`dividi --onda <1..${piano.onde.length + 1}>`);
  if (onda <= piano.onde.length) return chiudi("dividi", [`l'onda ${onda} è già divisa: le schede sono partite da lì, non si riscrive (le voci si trovano per id)`], [], opz);
  if (!opz.base) return uso("dividi --base <sha>: all'onda 1 il commit di base, dall'onda 2 lo SHA del ramo di integrazione già unito");
  const repo = repoDi(casa, opz);
  // «--base HEAD» o un nome di ramo si risolvono subito nello SHA completo: una base che si sposta non è una base.
  const base = (gitOk(repo, ["rev-parse", "--verify", "--quiet", `${opz.base}^{commit}`]) ?? "").trim();
  if (!base) return cieco("dividi", `il commit ${opz.base} non c'è in ${repo}`, opz);
  const perChiave = new Map(per.lavorabili.map((v) => [v.chiave, v]));
  let candidate;
  if (onda === 1) candidate = per.lavorabili;
  else {
    const chiavi = new Set(piano.onde[onda - 2].rimandate);
    if (opz["file-chiavi"]) for (const r of readFileSync(resolve(opz["file-chiavi"]), "utf8").split(/\r?\n/)) if (r.trim() && !r.startsWith("#")) chiavi.add(r.trim());
    const ignote = [...chiavi].filter((c) => !perChiave.has(c));
    if (ignote.length) return chiudi("dividi", [`${ignote.length} chiavi non sono nel perimetro: ${ignote.slice(0, 3).join(" ; ")}`], [], opz);
    candidate = [...chiavi].map((c) => perChiave.get(c));
  }
  const perSessione = Number(opz["per-sessione"] ?? PER_SESSIONE);
  let k = opz.sessioni !== undefined ? Number(opz.sessioni) : undefined;
  if ((k !== undefined && (!Number.isInteger(k) || k < 1 || k > MAX_SESSIONI)) || !Number.isInteger(perSessione) || perSessione < 1) return uso(`dividi --sessioni <1..${MAX_SESSIONI}> --per-sessione <n>`);
  if (per.profilo === "urgente") k = Math.min(k ?? 3, 3);
  const giaUsati = piano.onde.flatMap((o) => Object.keys(o.sessioni)).map(numeroSessione);
  const primo = (giaUsati.length ? Math.max(...giaUsati) : 0) + 1;
  const vietati = new Set(casa === "macchina" ? CONDIVISI_MACCHINA : []);
  const r = assegnaOnda(candidate, { sessioni: k, perSessione, primoNumero: primo, vietati });
  if (casa === "sito") {
    const max = massimaMigrazione(repo, base);
    if (max === null) return cieco("dividi", `non leggo le migrazioni a ${base}`, opz);
    const finePrima = Math.max(0, ...piano.onde.flatMap((o) => Object.values(o.sessioni).map((s) => s.migrazioni?.[1] ?? 0)));
    let da = Math.ceil((Math.max(max, finePrima) + 1) / FASCIA_MIGRAZIONI) * FASCIA_MIGRAZIONI;
    for (const s of Object.values(r.sessioni)) { s.migrazioni = [da, da + FASCIA_MIGRAZIONI - 1]; da += FASCIA_MIGRAZIONI; }
  }
  piano.onde.push({ onda, base, creata: opz.quando ?? timbroOra(), per_sessione: perSessione, candidate: candidate.map((v) => v.chiave), sessioni: r.sessioni, rimandate: r.rimandate, regia: r.regia });
  if (opz.ultima) {
    piano.cucitura = r.rimandate.slice(0, TETTO_CUCITURA);
    piano.eccedenza = r.rimandate.slice(TETTO_CUCITURA);
  }
  scriviJson(join(serveCartella(opz), "piano.json"), piano);
  const ns = Object.entries(r.sessioni);
  console.log(`🧩 onda ${onda}: ${ns.length} sessioni, ${ns.reduce((a, [, s]) => a + s.voci.length, 0)} voci assegnate, ${r.rimandate.length} all'onda dopo${r.regia.length ? `, ${r.regia.length} alla regia` : ""}`);
  for (const [n, s] of ns) console.log(`   ${n} · ${s.tema} · ${s.voci.length} voci (${s.voci.filter((v) => GRAVI.has(v.gravita)).length} gravi) · ${s.file.length} file${s.migrazioni ? ` · migrazioni ${s.migrazioni.join("-")}` : ""}`);
  if (opz.ultima) console.log(`   cucitura: ${piano.cucitura.length} · eccedenza per la prossima campagna: ${piano.eccedenza.length}`);
  return chiudi("dividi", [], ns.length ? [] : ["nessuna voce assegnata"], opz, { onda, sessioni: ns.length, rimandate: r.rimandate.length });
}

// ── schede ───────────────────────────────────────────────────────────────────────────────────────
function rigaCompatta(casa, d) {
  const piatto = (v) => String(v ?? "").replace(/[\t\r\n]+/g, " ").trim();
  return [chiaveDi(casa, d), gravitaDi(casa, d), statoDi(d), piatto(casa === "macchina" ? d.dove : d.file).slice(0, 300), piatto(d.titolo)].join("\t");
}
export function testoScheda({ nome, onda, casa, deposito, base, ramo, regista, cartella, sessione }) {
  const prima = sessione.voci[0];
  const gravi = sessione.voci.filter((v) => GRAVI.has(v.gravita)).length;
  const righe = [
    "---", "tipo: scheda", `sessione: ${nome}`, `onda: ${onda}`, `casa: ${casa}`, "---", "",
    `# La scheda di ${nome}: ${sessione.voci.length} difetti da riparare, ${gravi} gravi`, "",
    "## In parole semplici", "",
    `Questa è la lista dei difetti che la sessione ${nome} ripara nell'onda ${onda}, e dei file che in quest'onda solo lei può toccare.`,
    `Per esempio la prima voce è «${String(prima?.titolo ?? "").slice(0, 160)}», ${prima?.gravita ?? ""}.`, "",
    "## Cosa cambia per te", "", `Niente da fare: la scheda la legge la sessione ${nome}.`, "",
    "## Cosa devi fare", "", "Niente: le scelte le hai già fatte alla prima fermata.", "",
    "## Cosa non ho verificato", "",
    "Che ogni difetto ci sia ancora sul codice di oggi: la sessione lo controlla prima di ripararlo.", "",
    "---", "", "## Dettagli tecnici", "",
    "### Dove lavori", "",
    `- casa: ${casa}`, `- deposito: ${deposito}`, `- base: ${base}`, `- ramo: ${ramo}`,
    `- cartella della campagna: ${cartella}`, `- regista: ${regista}`, `- referto: ${REFERTO_DIR}/referto-${nome}.json`, "",
    "### Le mie voci", "",
    ...sessione.voci.map((v) => `- \`${v.id}\` · ${v.gravita} · ${v.chiave} · ${v.file.join(" , ")}`), "",
    "### I miei file", "",
    ...sessione.file.map((f) => `- \`${f}\``), "",
    "### Le mie migrazioni", "",
    sessione.migrazioni ? `- da ${sessione.migrazioni[0]} a ${sessione.migrazioni[1]}` : "- nessuna (questa casa non ha migrazioni)", "",
    "### Cosa NON tocco", "",
    "- tutti gli altri file del deposito: per un file che non è mio scrivo `serve_file_altrui` con la modifica esatta;",
    "- le migrazioni già esistenti: se serve, ne scrivo una nuova nella mia fascia;",
    "- una prova esistente che non importa nessuno dei miei file.", "",
  ];
  return righe.join("\n");
}
function schede(opz) {
  let per, piano;
  try { per = leggiPerimetro(opz); piano = leggiPiano(opz); } catch (e) { return cieco("schede", e.message, opz); }
  const onda = Number(opz.onda ?? piano.onde.length);
  const o = piano.onde[onda - 1];
  if (!o) return uso("schede --onda <n>: un'onda già divisa");
  const cartella = serveCartella(opz);
  const relCartella = cartella.startsWith(opz.radice + "/") ? cartella.slice(opz.radice.length + 1) : basename(cartella);
  let reg;
  try { reg = leggiRegistro(per.casa, opz); } catch (e) { return cieco("schede", e.message, opz); }
  scriviTesto(join(cartella, "registro-compatto.txt"), reg.elenco.map((d) => rigaCompatta(per.casa, d)).join("\n") + "\n");
  mkdirSync(join(cartella, "schede"), { recursive: true });
  const ramoRegista = opz.ramo ?? "<ramo>";
  for (const [nome, s] of Object.entries(o.sessioni)) {
    const testo = testoScheda({
      nome, onda, casa: per.casa, deposito: per.deposito, base: o.base,
      ramo: `${ramoRegista}-m${due(numeroSessione(nome))}`, regista: opz.regista ?? "<regista>", cartella: relCartella, sessione: s,
    });
    scriviTesto(join(cartella, "schede", `${nome}.md`), testo);
  }
  console.log(`📝 onda ${onda}: ${Object.keys(o.sessioni).length} schede e il registro compatto (${reg.elenco.length} righe)`);
  return chiudi("schede", [], [], opz);
}
/** Le voci di una scheda, lette dal suo testo: il riparatore lavora dalla scheda, non dal piano. */
export function vociDellaScheda(testo) {
  const fuori = [];
  const righe = testo.replace(/<!--[\s\S]*?-->/g, "").split("\n");
  const i = righe.findIndex((r) => r.trim() === "### Le mie voci");
  if (i < 0) return fuori;
  for (let j = i + 1; j < righe.length && !/^\s*#{1,6}\s/.test(righe[j]); j++) {
    const m = righe[j].match(/^- `([A-Z]\d{2}-\d{3})`/);
    if (m) fuori.push(m[1]);
  }
  return fuori;
}

// ── copertura-prima ──────────────────────────────────────────────────────────────────────────────
export function controllaOnda(o, { candidate, casa, maxMigrazione = null, vietati = new Set(), apertiNelRegistro = null }) {
  const rossi = [];
  const dove = new Map();
  const segna = (c, posto) => { if (!dove.has(c)) dove.set(c, []); dove.get(c).push(posto); };
  const padrone = new Map();
  const ids = new Set();
  const nomi = Object.keys(o.sessioni ?? {});
  if (!nomi.length) rossi.push(`onda ${o.onda}: nessuna sessione`);
  if (nomi.length > MAX_SESSIONI) rossi.push(`onda ${o.onda}: ${nomi.length} sessioni, oltre il tetto di ${MAX_SESSIONI}`);
  for (const [nome, s] of Object.entries(o.sessioni ?? {})) {
    if (!s.voci?.length) rossi.push(`${nome}: nessuna voce`);
    const suoi = new Set((s.file ?? []).map(normPerc));
    for (const f of [...suoi]) {
      if (padrone.has(f)) rossi.push(`il file ${f} ha due padroni nella stessa onda: ${padrone.get(f)} e ${nome}`);
      else padrone.set(f, nome);
      if (vietati.has(f)) rossi.push(`${nome} possiede ${f}, che nessuna sessione può toccare`);
    }
    for (const v of s.voci ?? []) {
      if (ids.has(v.id)) rossi.push(`l'id ${v.id} compare due volte`);
      ids.add(v.id);
      segna(v.chiave, nome);
      for (const f of fileCheDecidono(v.file ?? [])) if (!suoi.has(f)) rossi.push(`${v.id}: il file ${f} della voce non è fra i file di ${nome}`);
      if (apertiNelRegistro && !apertiNelRegistro.has(v.chiave)) rossi.push(`${v.id}: la chiave «${v.chiave}» non è più aperta nel registro`);
      if (/^\d+$/.test(String(v.chiave))) rossi.push(`${v.id}: «${v.chiave}» è un indice, non una chiave`);
    }
  }
  for (const c of o.rimandate ?? []) segna(c, "onda dopo");
  for (const c of o.regia ?? []) segna(c, "regia");
  for (const [c, posti] of dove) if (posti.length > 1) rossi.push(`la voce «${c}» sta in ${posti.length} posti: ${posti.join(", ")}`);
  const attese = new Set(candidate);
  for (const c of attese) if (!dove.has(c)) rossi.push(`la voce «${c}» dell'onda non è assegnata a nessuno`);
  for (const c of dove.keys()) if (!attese.has(c)) rossi.push(`la voce «${c}» non era fra le candidate dell'onda`);
  if (casa === "sito") {
    const fasce = Object.entries(o.sessioni ?? {}).map(([n, s]) => [n, s.migrazioni]).filter(([, f]) => f);
    if (fasce.length !== nomi.length) rossi.push("sul sito ogni sessione deve avere la sua fascia di migrazioni");
    fasce.sort((a, b) => a[1][0] - b[1][0]);
    for (let i = 0; i < fasce.length; i++) {
      const [n, [a, b]] = fasce[i];
      if (!(a <= b)) rossi.push(`${n}: fascia di migrazioni rovesciata ${a}-${b}`);
      if (maxMigrazione !== null && a <= maxMigrazione) rossi.push(`${n}: la fascia ${a}-${b} non parte sopra l'ultima migrazione esistente (${maxMigrazione})`);
      if (i > 0 && a <= fasce[i - 1][1][1]) rossi.push(`${n}: la fascia ${a}-${b} si sovrappone a quella di ${fasce[i - 1][0]}`);
    }
  }
  return rossi;
}
function coperturaPrima(opz) {
  let per, piano;
  try { per = leggiPerimetro(opz); piano = leggiPiano(opz); } catch (e) { return cieco("copertura-prima", e.message, opz); }
  const onda = Number(opz.onda ?? piano.onde.length);
  const o = piano.onde[onda - 1];
  if (!o) return uso("copertura-prima --onda <n>");
  // Le candidate le ha scritte `dividi` nel piano. All'onda 1 devono essere ancora i lavorabili del
  // perimetro: un perimetro riscritto dopo la divisione lascerebbe fuori voci senza che nessuno lo veda.
  const candidate = Array.isArray(o.candidate) ? o.candidate : [];
  const rossiPerimetro = [];
  if (!Array.isArray(o.candidate)) rossiPerimetro.push(`onda ${onda}: il piano non dice quali erano le voci candidate`);
  if (onda === 1) {
    const lav = new Set(per.lavorabili.map((v) => v.chiave));
    const cand = new Set(candidate);
    const via = [...lav].filter((c) => !cand.has(c)).length, piu = [...cand].filter((c) => !lav.has(c)).length;
    if (via || piu) rossiPerimetro.push(`onda 1: il perimetro non è più quello diviso (${via} voci nuove nel perimetro, ${piu} sparite): si rifà \`dividi\` su una cartella nuova`);
  }
  const repo = repoDi(per.casa, opz);
  const maxMig = per.casa === "sito" ? massimaMigrazione(repo, o.base) : null;
  let aperti = null;
  try {
    const reg = leggiRegistro(per.casa, opz);
    aperti = new Set(reg.elenco.filter((d) => statoDi(d) === "aperto").map((d) => chiaveDi(per.casa, d)));
  } catch { /* senza registro il controllo della freschezza resta fuori: lo si dice */ }
  const rossi = [...rossiPerimetro, ...controllaOnda(o, { candidate, casa: per.casa, maxMigrazione: maxMig, vietati: new Set(per.casa === "macchina" ? CONDIVISI_MACCHINA : []), apertiNelRegistro: aperti })];
  const attese = [];
  if (aperti === null) attese.push("il registro non si legge: non ho controllato che le voci siano ancora aperte");
  if (per.casa === "sito" && maxMig === null) attese.push(`non leggo le migrazioni a ${o.base}`);
  for (const nome of Object.keys(o.sessioni)) {
    const p = join(serveCartella(opz), "schede", `${nome}.md`);
    if (!existsSync(p)) { attese.push(`manca la scheda ${nome}: prima \`schede\``); continue; }
    const nellaScheda = vociDellaScheda(readFileSync(p, "utf8"));
    const nelPiano = o.sessioni[nome].voci.map((v) => v.id);
    if (nellaScheda.join(",") !== nelPiano.join(",")) rossi.push(`${nome}: la scheda elenca ${nellaScheda.length} voci, il piano ${nelPiano.length}: non sono le stesse`);
  }
  return chiudi("copertura-prima", rossi, attese, opz, { onda, sessioni: Object.keys(o.sessioni).length });
}

// ── segnaposti ───────────────────────────────────────────────────────────────────────────────────
function segnaposti(opz) {
  const cartella = serveCartella(opz);
  const dir = join(cartella, "schede");
  // Il recinto non si deduce dall'estensione (malattia «perimetro-dedotto-non-misurato»): le schede
  // ATTESE sono quelle delle sessioni del piano, e si legge OGNI file della cartella, qualunque nome abbia.
  const piano = leggiPiano(opz, { serve: false });
  const attese = new Set((piano?.onde ?? []).flatMap((o) => Object.keys(o.sessioni ?? {})).map((n) => `${n}.md`));
  const presenti = existsSync(dir) ? readdirSync(dir).sort() : [];
  if (!presenti.length && !attese.size) return chiudi("segnaposti", [], ["nessuna scheda da guardare"], opz);
  const rossi = [], mancano = [];
  for (const n of attese) if (!presenti.includes(n)) mancano.push(`manca la scheda ${n}: prima \`schede\``);
  for (const n of presenti) {
    const t = readFileSync(join(dir, n), "utf8");
    for (const s of SEGNAPOSTI) if (t.includes(s)) rossi.push(`${n}: resta il segnaposto «${s}»`);
    if (!attese.has(n)) rossi.push(`${n}: non è la scheda di nessuna sessione del piano`);
  }
  return chiudi("segnaposti", rossi, mancano, opz, { schede: presenti.length, schede_attese: attese.size });
}

// ── guardia-ramo ─────────────────────────────────────────────────────────────────────────────────
// Le forme in cui una prova si spegne, tutte quelle che esistono nel sito e nel cervello (secondo collaudo del
// 7/11: 21 `.skipIf(` nei test del sito, 31 `{ skip:` / `t.skip(` in cervello/test).
export const RE_SPENTA = /\b(?:it|test|describe)(?:\.\w+)*\.(?:skip|only|todo|fails|skipIf|runIf)\s*\(|\bx(?:it|test|describe)\s*\(|\{\s*(?:skip|todo)\s*:|\bt\.(?:skip|todo)\s*\(/;
/** Quante asserzioni porta il testo di una prova (vitest, node:test, assert). PURA. */
export const contaAsserzioni = (testo) => (String(testo).match(/\bexpect\s*\(|\bassert(?:\.\w+)?\s*\(|\bt\.(?:assert|equal|deepEqual|ok|throws)\b/g) || []).length;
/**
 * Il giudizio su UN percorso toccato dalla storia di un ramo riparatore. PURA.
 * `ctx`: { nome, suoi:Set, esisteAllaBase(p), importaDaSuoi(p), fascia:[a,b]|null, casa }
 * Torna null se il percorso è ammesso, altrimenti il perché.
 */
export function giudicaPercorso(p, ctx) {
  const referto = `${REFERTO_DIR}/referto-${ctx.nome}.json`;
  if (p === referto) return null;
  if (p.startsWith(`${REFERTO_DIR}/`)) return `${p}: nella cartella ${REFERTO_DIR}/ va solo il proprio referto`;
  if (ctx.casa === "macchina" && CONDIVISI_MACCHINA.includes(p)) return `${p}: è un file condiviso che scrive solo la regista`;
  const allaBase = ctx.esisteAllaBase(p);
  // Solo un file NUOVO può essere un temporaneo: un file col punto che c'era già (`.husky/…`, `.github/…`)
  // segue le regole di chi lo possiede. Le cartelle col punto del 5/11 (`.montati/`) erano tutte nuove.
  if (!allaBase && TEMPORANEI.some((re) => re.test(p))) return `${p}: sembra un file temporaneo o di lavoro, non va nel ramo`;
  if (eMigrazione(p)) {
    if (allaBase) return `${p}: una migrazione già esistente non si modifica, se ne scrive una nuova`;
    const n = numeroMigrazione(p);
    if (!ctx.fascia) return `${p}: questa sessione non ha una fascia di migrazioni`;
    if (!(n >= ctx.fascia[0] && n <= ctx.fascia[1])) return `${p}: il numero ${n} è fuori dalla fascia ${ctx.fascia[0]}-${ctx.fascia[1]}`;
    return null;
  }
  if (ctx.suoi.has(p)) return null;
  if (eProva(p)) {
    if (!allaBase) return basename(p).toLowerCase().includes(`riparazione-${ctx.nome.toLowerCase()}`) ? null : `${p}: una prova nuova porta il nome della sessione (riparazione-${ctx.nome.toLowerCase()}-…)`;
    const di = ctx.importaDaSuoi(p);
    if (di === "condivisa") return `${p}: è una prova esistente che usa anche file di altre sessioni dell'onda: non è di nessuno, la tocca solo la regista`;
    return di ? null : `${p}: è una prova esistente che non importa e non nomina nessuno dei file di ${ctx.nome}`;
  }
  if (!allaBase) return null; // un file nuovo: lo controlla prova-unione, che vede se un altro ramo lo crea
  return `${p}: è un file di un'altra sessione o di nessuno in quest'onda`;
}
const RE_IMPORT = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)|vi\.mock\(\s*['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g;
/** I percorsi del deposito che un file importa (relativi e con l'alias «@/»). PURA. */
export function importDi(percorso, testo) {
  const fuori = new Set();
  // Un import scritto in un commento («// prima era: import { a } from …») non importa niente: il collaudo
  // del 7/11 l'ha usato per far passare una prova altrui. I commenti si tolgono prima di cercare.
  const senzaCommenti = String(testo).replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\])\/\/.*$/gm, "$1");
  for (const m of senzaCommenti.matchAll(RE_IMPORT)) {
    const spec = m.slice(1).find(Boolean);
    if (!spec) continue;
    let radice;
    if (spec.startsWith("@/")) radice = spec.slice(2);
    else if (spec.startsWith(".")) radice = posix.normalize(posix.join(posix.dirname(percorso), spec));
    else continue;
    for (const coda of ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", "/index.ts", "/index.tsx", "/index.js", "/index.jsx", "/index.mjs"]) fuori.add(radice + coda);
  }
  return fuori;
}
/**
 * I percorsi del deposito che un file NOMINA in una stringa (12/11 sera, regola firmata da Nicola): molte prove
 * del sito non importano la pagina, la leggono per nome (`readFileSync("app/x/page.tsx")`, `join(ROOT, "app",
 * "x", "page.tsx")`, `resolve(__dirname, "../../lib/x.ts")`). Nell'onda del 12/11 tre riparatori (R04, R08,
 * R11) sono finiti rossi per prove così, pur avendo riparato bene. I commenti si tolgono prima, come per gli
 * import: un percorso scritto in un commento non lega la prova a nessun file. PURA.
 */
export function percorsiNominati(percorso, testo) {
  const fuori = new Set();
  const senzaCommenti = String(testo).replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\])\/\/.*$/gm, "$1");
  const candidati = [];
  // Le stringhe una per una, e i pezzi di join/resolve uniti con «/».
  const RE_STR = /(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/g;
  for (const m of senzaCommenti.matchAll(RE_STR)) if (!m[2].includes("${")) candidati.push(m[2]);
  for (const m of senzaCommenti.matchAll(/\b(?:join|resolve)\s*\(((?:[^()]|\([^()]*\))*)\)/g)) {
    const pezzi = [...m[1].matchAll(RE_STR)].map((x) => x[2]).filter((x) => !x.includes("${"));
    if (pezzi.length > 1) candidati.push(pezzi.join("/"));
  }
  for (const c of candidati) {
    if (!c || c.length > 300 || !/[\w)]\.[a-z]{1,5}$|\//i.test(c)) continue;
    const radici = new Set();
    if (c.startsWith("@/")) radici.add(c.slice(2));
    else {
      radici.add(posix.normalize(c).replace(/^(?:\.\/)+/, "").replace(/^\/+/, ""));
      if (c.startsWith(".")) radici.add(posix.normalize(posix.join(posix.dirname(percorso), c)));
    }
    for (const r of radici) {
      if (!r || r.startsWith("..")) continue;
      for (const coda of ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".sql", "/page.tsx", "/route.ts", "/index.ts", "/index.tsx"]) fuori.add(r + coda);
    }
  }
  return fuori;
}
/** L'uscita di git con -z: coppie [stato, percorso] (o [null, percorso] senza stato). PURA. */
export function voci0(testo, conStato) {
  const pezzi = String(testo).split("\0").filter((x) => x !== "");
  const fuori = [];
  if (!conStato) { for (const f of pezzi) fuori.push([null, f]); return fuori; }
  for (let i = 0; i + 1 < pezzi.length; i += 2) fuori.push([pezzi[i].trim().charAt(0), pezzi[i + 1]]);
  return fuori;
}
function storiaDelRamo(dir, partenza, ref) {
  const commit = (gitOk(dir, ["rev-list", "--reverse", `${partenza}..${ref}`]) ?? "").split("\n").filter(Boolean);
  const toccati = new Set();
  const cancellati = new Set();
  const unioni = [];
  const perCommit = [];
  for (const c of commit) {
    const genitori = (gitOk(dir, ["rev-list", "--parents", "-n", "1", c]) ?? "").trim().split(/\s+/).slice(1);
    if (genitori.length > 1) unioni.push(c);
    // -z: senza, git mette tra virgolette i nomi con accenti, «"» o «\\», e la guardia li crederebbe file nuovi
    // (collaudo del 12/11 sera).
    const args = genitori.length > 1
      ? ["diff-tree", "-z", "-r", "--cc", "--name-only", "--no-renames", "--no-commit-id", c]
      : ["diff-tree", "-z", "-r", "--root", "--name-status", "--no-renames", "--no-commit-id", c];
    const file = [];
    for (const [st, f] of voci0(gitOk(dir, args) ?? "", genitori.length <= 1)) {
      if (f === c) continue;
      if (st === "D") cancellati.add(f);
      file.push(f);
      toccati.add(f);
    }
    const messaggio = (gitOk(dir, ["log", "-1", "--format=%B", c]) ?? "").trim();
    perCommit.push({ commit: c, file, messaggio });
  }
  return { commit, toccati, cancellati, unioni, perCommit };
}
function risolviRef(dir, ramo) {
  const pulito = String(ramo).replace(/^origin\//, "");
  // «HEAD» è il ramo su cui sta la sessione: `origin/HEAD` invece punta a main, che è un altro ramo.
  const prove = pulito === "HEAD" ? ["HEAD"] : [`origin/${pulito}`, pulito];
  for (const r of prove) if (gitOk(dir, ["rev-parse", "--verify", "--quiet", `${r}^{commit}`]) !== null) return r;
  return null;
}
/**
 * Quello che la storia vera del ramo dice di un referto: i commit (con il messaggio) e la testa che vale.
 * La «testa» scritta vale se è un antenato della punta e OGNI commit dopo di lei tocca solo `.riparazione/`
 * (commit per commit, non il diff netto: un codice cambiato e poi rimesso dopo la testa resta un commit di
 * codice, secondo collaudo del 7/11). Torna null se il ramo non esiste.
 */
function controlliDelRamo(dir, base, ramo, testoReferto) {
  const ref = risolviRef(dir, ramo);
  if (!ref) return null;
  const storia = storiaDelRamo(dir, base, ref);
  const commitDelRamo = new Map(storia.perCommit.map((c) => [c.commit, c.messaggio]));
  let testaDelRamo = (gitOk(dir, ["rev-parse", ref]) ?? "").trim();
  let dichiarata = null;
  let soloRefertoDopo = [];
  try { dichiarata = String(JSON.parse(testoReferto).testa ?? ""); } catch { /* lo dice regoleReferto */ }
  if (dichiarata && SHA.test(dichiarata)) {
    const piena = (gitOk(dir, ["rev-parse", "--verify", "--quiet", `${dichiarata}^{commit}`]) ?? "").trim();
    if (piena && piena !== testaDelRamo && gitOk(dir, ["merge-base", "--is-ancestor", piena, ref]) !== null) {
      const dopo = storia.perCommit.slice(storia.perCommit.findIndex((c) => c.commit === piena) + 1);
      const soloReferto = storia.perCommit.some((c) => c.commit === piena) && dopo.every((c) => c.file.every((f) => f.startsWith(`${REFERTO_DIR}/`)));
      if (soloReferto) { testaDelRamo = piena; soloRefertoDopo = dopo.map((c) => c.commit); }
    }
  }
  return { ref, commitDelRamo, testaDelRamo, soloRefertoDopo };
}
function sessioneNelPiano(piano, nome) {
  for (const o of piano.onde) if (o.sessioni[nome]) return { onda: o, sessione: o.sessioni[nome] };
  return null;
}
function guardiaRamo(opz) {
  const [ramo, nome] = opz.posizionali;
  if (!ramo || !/^[RK]\d{2}$/.test(nome ?? "")) return uso("guardia-ramo <ramo> <RNN|KNN> --cartella <dir> [--git <dir>]");
  let per, piano;
  try { per = leggiPerimetro(opz); piano = leggiPiano(opz); } catch (e) { return cieco("guardia-ramo", e.message, opz); }
  if (nome.startsWith("K")) return guardiaCollaudatore(opz, ramo, nome);
  const dove = sessioneNelPiano(piano, nome);
  if (!dove) return chiudi("guardia-ramo", [`${nome} non è nel piano`], [], opz);
  const dir = resolve(opz.git ?? repoDi(per.casa, opz));
  const ref = risolviRef(dir, ramo);
  if (!ref) return chiudi("guardia-ramo", [], [`il ramo ${ramo} non esiste ancora in ${dir}`], opz);
  const partenza = dove.onda.base;
  if (gitOk(dir, ["merge-base", "--is-ancestor", partenza, ref]) === null) return chiudi("guardia-ramo", [`${nome}: ${ref} non parte dalla base dell'onda ${dove.onda.onda} (${partenza.slice(0, 12)})`], [], opz);
  const storia = storiaDelRamo(dir, partenza, ref);
  // Un ramo che ha unito main porta dentro la storia di tutti: giudicarne i file darebbe migliaia di rossi
  // non suoi (collaudo B del 7/11: 3.445 righe, 25 secondi). Le unioni sono già il rosso: si tolgono prima.
  if (storia.unioni.length) return chiudi("guardia-ramo", [`${nome}: il ramo ha ${storia.unioni.length} unioni (${storia.unioni.slice(0, 3).map((u) => u.slice(0, 12)).join(", ")}): il ramo riparatore parte dalla base e non unisce niente. Si giudica di nuovo quando le unioni sono tolte`], [], opz, { commit: storia.commit.length });
  const suoi = new Set(dove.sessione.file.map(normPerc));
  const allaBase = new Map();
  const esisteAllaBase = (p) => {
    if (!allaBase.has(p)) allaBase.set(p, gitOk(dir, ["cat-file", "-e", `${partenza}:${p}`]) !== null);
    return allaBase.get(p);
  };
  // I file delle ALTRE sessioni dell'onda: una prova che li usa insieme ai propri è comune, e chi la tocca
  // potrebbe togliere i controlli sugli altri senza cambiare il numero di asserzioni (collaudo del 12/11 sera).
  const altrui = new Set(Object.entries(dove.onda.sessioni).filter(([n]) => n !== nome).flatMap(([, x]) => (x.file ?? []).map(normPerc)));
  const importaDaSuoi = (p) => {
    const testo = gitOk(dir, ["show", `${partenza}:${p}`]);
    if (testo === null) return false;
    const importa = importDi(p, testo), nomina = percorsiNominati(p, testo);
    const usati = new Set([...importa, ...nomina]);
    if (![...usati].some((x) => suoi.has(x))) return false;
    // Condivisa: importa un file d'un'altra sessione, o NOMINA un file che esiste e non è suo (una prova che
    // gira su una lista di file: chi la tocca può togliere dal giro quelli degli altri, secondo collaudo del
    // 12/11). Un aiutante comune solo importato e di nessuno (lib/supabase.ts) non la rende condivisa.
    if ([...importa].some((x) => altrui.has(x))) return "condivisa";
    return [...nomina].some((x) => x !== p && !suoi.has(x) && esisteAllaBase(x)) ? "condivisa" : true;
  };
  const ctx = { nome, suoi, esisteAllaBase, importaDaSuoi, fascia: dove.sessione.migrazioni ?? null, casa: per.casa };
  // Si giudica il RISULTATO del ramo, non ogni passo della storia (12/11 sera, regola firmata da Nicola): è il
  // diff netto quello che entra nell'unione. Nell'onda del 12/11 R01 e R07 sono rimasti rossi per sempre su file
  // toccati per sbaglio e rimessi com'erano. Un file toccato e rimesso si elenca, ma non è un rosso.
  const netto = new Map();
  for (const [st, f] of voci0(gitOk(dir, ["diff", "-z", "--name-status", "--no-renames", partenza, ref]) ?? "", true)) netto.set(f, st);
  const daGiudicare = [...netto.keys()];
  const rimessi = [...storia.toccati].filter((f) => !netto.has(f)).sort();
  const cancellati = new Set([...netto].filter(([, st]) => st === "D").map(([f]) => f));
  const rossi = [];
  for (const p of daGiudicare.sort()) {
    const perche = giudicaPercorso(p, ctx);
    if (perche) rossi.push(perche);
  }
  for (const u of storia.unioni) rossi.push(`${u.slice(0, 12)}: un'unione nel ramo riparatore (il ramo parte dalla base e non unisce niente)`);
  // Una prova che c'era non si cancella e non si spegne: è il modo più corto per far tornare verde una
  // riparazione sbagliata, e il collaudo del 7/11 l'ha fatto passare finché la guardia guardava solo i nomi.
  for (const p of [...cancellati].sort()) if (eProva(p) && esisteAllaBase(p)) rossi.push(`${p}: una prova esistente non si cancella`);
  for (const p of daGiudicare.filter((f) => eProva(f) && !cancellati.has(f)).sort()) {
    const diff = gitOk(dir, ["diff", partenza, ref, "--", p]) ?? "";
    if (diff.split("\n").some((r) => r.startsWith("+") && !r.startsWith("+++") && RE_SPENTA.test(r))) rossi.push(`${p}: aggiunge una prova spenta (.skip, .only, .todo, .fails, .skipIf, { skip: }, xit): una prova non si spegne per farla passare`);
    // Una prova svuotata non porta nessun «.skip»: le si tolgono le asserzioni. Si contano alla base e alla punta.
    if (esisteAllaBase(p)) {
      const prima = contaAsserzioni(gitOk(dir, ["show", `${partenza}:${p}`]) ?? "");
      const dopo = contaAsserzioni(gitOk(dir, ["show", `${ref}:${p}`]) ?? "");
      if (dopo < prima) rossi.push(`${p}: ha ${prima - dopo} asserzioni in meno di prima (${prima} → ${dopo}): una prova esistente non si svuota`);
    }
  }
  const ids = new Set(dove.sessione.voci.map((v) => v.id));
  // L'id sta sul PRIMO rigo e deve essere di questa sessione: un «Z99-varie» in fondo al corpo, o il «varie»
  // di un'altra sessione, non attribuisce il commit a nessuno (collaudo del 7/11).
  const primoRigoGiusto = new RegExp(`^${nome}-(?:\\d{3}|varie)\\b`);
  const senzaVoce = storia.perCommit.filter((c) => c.file.some((f) => !f.startsWith(`${REFERTO_DIR}/`)) && !primoRigoGiusto.test(c.messaggio.split("\n")[0].trim()));
  for (const c of senzaVoce) rossi.push(`${c.commit.slice(0, 12)}: un commit di codice che non comincia con l'id di una voce di ${nome} («${nome}-NNN …», oppure «${nome}-varie …»)`);
  for (const c of storia.perCommit) for (const id of c.messaggio.match(/\b[A-Z]\d{2}-\d{3}\b/g) || []) if (!ids.has(id)) rossi.push(`${c.commit.slice(0, 12)}: il messaggio cita ${id}, che non è una voce di ${nome}`);
  const attese = !storia.commit.length ? [`${nome}: il ramo non ha ancora nessun commit suo`]
    : !netto.size ? [`${nome}: il ramo ha ${storia.commit.length} commit ma alla fine non cambia nessun file: non c'è niente da giudicare, non è un verde`] : [];
  if (rimessi.length) console.log(`ℹ️ toccati nella storia e rimessi com'erano (non entrano nell'unione, non sono un rosso): ${rimessi.slice(0, TETTO_RIGHE).join(", ")}`);
  return chiudi("guardia-ramo", rossi, attese, opz, { commit: storia.commit.length, file_toccati: netto.size, ...(rimessi.length ? { toccati_e_rimessi_com_erano: rimessi } : {}) });
}
function guardiaCollaudatore(opz, ramo, nome) {
  const dir = resolve(opz.git ?? opz.radice);
  const ref = risolviRef(dir, ramo);
  if (!ref) return chiudi("guardia-ramo", [], [`il ramo ${ramo} non esiste ancora in ${dir}`], opz);
  const sess = leggiSessioni(opz);
  const partenza = opz.partenza ?? sess?.collaudatori?.[nome]?.partenza;
  if (vuoto(partenza)) return chiudi("guardia-ramo", [`${nome}: manca la partenza (--partenza, o collaudatori.${nome}.partenza in sessioni.json)`], [], opz);
  if (gitOk(dir, ["merge-base", "--is-ancestor", partenza, ref]) === null) return chiudi("guardia-ramo", [`${nome}: ${ref} non parte da ${String(partenza).slice(0, 12)}`], [], opz);
  const rel = serveCartella(opz).startsWith(opz.radice + "/") ? serveCartella(opz).slice(opz.radice.length + 1) : basename(serveCartella(opz));
  const ammesso = `${rel}/collaudi/${nome}.json`;
  const storia = storiaDelRamo(dir, partenza, ref);
  const altri = [...storia.toccati].filter((f) => f !== ammesso);
  const rossi = altri.length ? [`${nome}: nella storia del ramo ci sono ${altri.length} file oltre al referto di collaudo: ${altri.slice(0, 8).join(", ")}`] : [];
  return chiudi("guardia-ramo", rossi, storia.commit.length ? [] : [`${nome}: il ramo non ha ancora nessun commit suo`], opz, { commit: storia.commit.length });
}

// ── valida-referto ───────────────────────────────────────────────────────────────────────────────
/**
 * I difetti nuovi visti da un riparatore o da un controllore. PURA: torna i rossi. Una regola sola per tutti e
 * due: il 12/11 il controllore ne aveva una copia più corta, e una falla riservata con la «descrizione» in
 * chiaro passava nel deposito pubblico (collaudo del 12/11).
 */
export function regoleNuoviDifetti(lista) {
  const rossi = [];
  for (const n of lista ?? []) {
    // Il deposito è pubblico: una riservata si scrive in UNA forma sola. Il collaudo del 7/11 ha fatto passare
    // il dettaglio nel titolo («Falla di sicurezza: …route.ts:42…»), nel NOME di una chiave e in una parola sola.
    if (n && "riservato" in n && typeof n.riservato !== "boolean") rossi.push(`«riservato» deve essere true o false, non ${JSON.stringify(n.riservato)}: un valore ambiguo fa sparire un difetto o pubblica una falla`);
    if (n?.riservato === true) {
      if (!["bloccante", "grave", "minore"].includes(n.severita)) rossi.push("un difetto nuovo riservato ha la gravità fuori elenco (bloccante, grave o minore)");
      const chiaviIn = Object.keys(n ?? {}).filter((k) => !CAMPI_RISERVATA.includes(k));
      if (chiaviIn.length) rossi.push(`un difetto nuovo riservato porta campi in più (${chiaviIn.join(", ")}): solo ${CAMPI_RISERVATA.join(", ")}`);
      if (n.file !== PRIVATO) rossi.push(`un difetto nuovo riservato ha il file in chiaro: va «${PRIVATO}»`);
      if (!TITOLO_RISERVATO.test(String(n.titolo ?? ""))) rossi.push(`un difetto nuovo riservato ha il titolo fuori forma: «Falla di sicurezza da chiudere (<${AREE_RISERVATE.join("|")}>): i dettagli restano fuori dal deposito pubblico finché non è chiusa»`);
      if (n.dimensione !== undefined && !/^[a-z-]{1,40}$/.test(String(n.dimensione))) rossi.push("un difetto nuovo riservato ha una dimensione fuori forma");
    } else if (/falla di sicurezza/i.test(String(n?.titolo ?? ""))) rossi.push(`«${String(n?.titolo).slice(0, 60)}…»: una falla di sicurezza si scrive con «riservato: true», mai in chiaro`);
    else if (vuoto(n?.titolo) || vuoto(n?.file) || !["bloccante", "grave", "minore"].includes(n?.severita)) rossi.push(`un difetto nuovo senza titolo, file o gravità valida: «${n?.titolo ?? ""}»`);
  }
  return rossi;
}

/**
 * Le regole del referto di un riparatore. PURA: riceve il testo e il contesto, torna {rossi, attese}.
 * ctx: { nome, voci: [{id, chiave, gravita}], chiaviDelRegistro: Set|null, commitDelRamo: Map(sha→messaggio)|null, testaDelRamo }
 */
/**
 * La verifica finale è girata sull'ultimo codice? PURA. Va bene la testa, o un commit dopo di lei che tocca solo
 * il referto (il referto parziale si committa ogni 10 voci: collaudo del 12/11 notte). Con la storia del ramo
 * il confronto si fa sugli SHA pieni; senza, a prefisso con la testa dichiarata.
 */
export function verificaSullaTesta(verificata, testa, ctx = {}) {
  const v = String(verificata);
  const pieni = [ctx.testaDelRamo, ...(ctx.soloRefertoDopo ?? [])].filter((x) => typeof x === "string" && x.length >= 7);
  if (pieni.length) return pieni.some((c) => c.startsWith(v));
  const t = String(testa ?? "");
  return t.length >= 7 && (t.startsWith(v) || v.startsWith(t));
}
export function regoleReferto(testo, ctx) {
  const rossi = [], attese = [];
  let r;
  try { r = JSON.parse(testo); } catch (e) { return { rossi: [`il referto non è JSON: ${e.message}`], attese }; }
  for (const k of chiaviDoppie(testo)) rossi.push(`la chiave «${k}» è scritta due volte nello stesso oggetto`);
  for (const v of valori(r)) for (const s of ["<sha>", "AAAA-MM-GG HH:MM", "{{"]) if (v.includes(s)) rossi.push(`resta il segnaposto «${s}»`);
  if (r.sessione !== ctx.nome) rossi.push(`sessione «${r.sessione}», attesa «${ctx.nome}»`);
  if (!dataVera(r.aggiornato)) rossi.push(`«aggiornato» non è una data AAAA-MM-GG HH:MM vera: «${r.aggiornato}»`);
  if (typeof r.finita !== "boolean") rossi.push("«finita» deve essere true o false");
  if (!Array.isArray(r.voci)) { rossi.push("manca l'elenco «voci»"); return { rossi, attese }; }
  const perId = new Map(ctx.voci.map((v) => [v.id, v]));
  const viste = new Set();
  const perCommit = new Map();
  for (const v of r.voci) {
    const dove = `${v?.id ?? "(senza id)"}`;
    const attesa = perId.get(v?.id);
    if (!attesa) { rossi.push(`${dove}: non è una voce della scheda di ${ctx.nome}`); continue; }
    if (viste.has(v.id)) rossi.push(`${dove}: compare due volte`);
    viste.add(v.id);
    if (v.chiave !== attesa.chiave) rossi.push(`${dove}: la chiave «${v.chiave}» non è quella della scheda («${attesa.chiave}»)`);
    if (/^\d+$/.test(String(v.chiave))) rossi.push(`${dove}: «${v.chiave}» è un indice, non una chiave`);
    if (ctx.chiaviDelRegistro && !ctx.chiaviDelRegistro.has(attesa.chiave)) rossi.push(`${dove}: la chiave non è nel registro`);
    if (!ESITI.includes(v.esito)) { rossi.push(`${dove}: esito «${v.esito}» non è uno di ${ESITI.join("|")}`); continue; }
    const grave = GRAVI.has(attesa.gravita);
    if (v.esito === "riparato") {
      if (vuoto(v.commit)) rossi.push(`${dove}: riparato senza il commit`);
      else if (!SHA.test(String(v.commit))) rossi.push(`${dove}: «${v.commit}» non è un commit (da 7 a 40 cifre esadecimali)`);
      if (vuoto(v.file_toccati)) rossi.push(`${dove}: riparato senza i file toccati`);
      if (vuoto(v.prova_comando)) rossi.push(`${dove}: riparato senza il comando della prova`);
      if (!PROVE.includes(v.prova_tipo)) rossi.push(`${dove}: prova_tipo «${v.prova_tipo}» non è uno di ${PROVE.join("|")}`);
      if (grave && !(v.prova_tipo === "comando" && v.prova_eseguita === true)) rossi.push(`${dove}: un ${attesa.gravita} si chiude solo con una prova «comando» eseguita (l'asticella)`);
      if (v.rimessa?.esito !== "regge" || v.rimessa?.uscita !== 0 || vuoto(v.rimessa?.comando)) rossi.push(`${dove}: riparato senza la prova rimessa che regge (uscita 0 di cervello/prova-rimessa.mjs, col comando)`);
      if (v.copre_tutta_la_voce !== true) rossi.push(`${dove}: se non chiude tutta la voce l'esito è «parziale»`);
      if (r.finita === true && vuoto(v.verificato_da)) rossi.push(`${dove}: a referto finito ogni riparazione dice chi l'ha smentita (verificato_da)`);
      if (!vuoto(v.commit)) {
        if (!perCommit.has(v.commit)) perCommit.set(v.commit, []);
        perCommit.get(v.commit).push(v);
      }
      if (ctx.commitDelRamo && !vuoto(v.commit)) {
        const tutti = [...ctx.commitDelRamo.keys()].filter((c) => c.startsWith(String(v.commit)));
        const pieno = tutti.length === 1 ? tutti[0] : null;
        if (tutti.length > 1) rossi.push(`${dove}: il commit ${v.commit} è ambiguo nella storia del ramo`);
        else if (!pieno) rossi.push(`${dove}: il commit ${v.commit} non è nella storia del ramo`);
        else if (!ctx.commitDelRamo.get(pieno).includes(v.id)) rossi.push(`${dove}: il messaggio del commit ${String(v.commit).slice(0, 12)} non cita ${v.id}`);
      }
    }
    if (v.esito === "parziale" && vuoto(v.cosa_resta)) rossi.push(`${dove}: parziale senza «cosa_resta»`);
    if (v.esito === "gia_riparato_prima" && vuoto(v.prova)) rossi.push(`${dove}: già riparato senza la riga o il comando che lo dimostra («prova»)`);
    if (v.esito === "serve_file_altrui" && (!Array.isArray(v.serve_file_altrui) || !v.serve_file_altrui.length || v.serve_file_altrui.some((x) => vuoto(x?.file) || vuoto(x?.modifica)))) rossi.push(`${dove}: serve_file_altrui senza l'elenco {file, modifica}`);
    if (v.esito === "scelta_di_nicola" && vuoto(v.domanda)) rossi.push(`${dove}: scelta di Nicola senza la domanda in una riga`);
    if (["non_codice", "non_fatto"].includes(v.esito) && vuoto(v.nota)) rossi.push(`${dove}: ${v.esito} senza la nota (cosa deve fare Nicola, o perché)`);
  }
  for (const [c, insieme] of perCommit) {
    if (insieme.length < 2) continue;
    const ids = insieme.map((v) => v.id);
    const dichiarati = insieme.every((v) => Array.isArray(v.insieme_a) && ids.filter((x) => x !== v.id).every((x) => v.insieme_a.includes(x)));
    if (!dichiarati) rossi.push(`il commit ${String(c).slice(0, 12)} porta ${ids.join(", ")}: una voce per commit, oppure «insieme_a» dichiarato su ognuna`);
  }
  rossi.push(...regoleNuoviDifetti(r.nuovi_difetti_visti));
  if (r.finita === true) {
    for (const v of ctx.voci) if (!viste.has(v.id)) rossi.push(`${v.id}: a referto finito ogni voce della scheda deve comparire, anche quelle non fatte`);
    if (r.verifica?.esito !== "verde") rossi.push("a referto finito la verifica (npm run verify, o il cancello della macchina) deve essere verde");
    // La verifica si lega allo SHA su cui è girata (12/11 notte): nell'onda 1 R07 ha spinto 8 commit con un verify
    // lanciato e mai aspettato. Senza lo SHA è un'attesa (il referto non passa al collaudo); con uno SHA diverso
    // dalla testa è un rosso: la verifica va rifatta sull'ultimo codice. I referti vecchi senza il campo restano
    // leggibili da `applica`, che guarda solo i rossi.
    else if (vuoto(r.verifica?.testa)) attese.push("la verifica non dice su quale commit è girata: scrivi «verifica.testa» = lo SHA su cui hai lanciato npm run verify (deve essere la testa)");
    else if (typeof r.verifica.testa !== "string" || !SHA.test(r.verifica.testa)) rossi.push(`«verifica.testa» ${JSON.stringify(r.verifica.testa)} non è un commit (da 7 a 40 cifre esadecimali)`);
    else if (!verificaSullaTesta(r.verifica.testa, r.testa, ctx)) rossi.push(`la verifica è girata su ${r.verifica.testa.slice(0, 12)}, non sulla testa ${String(r.testa ?? "").slice(0, 12)}: va rifatta sull'ultimo codice`);
    if (vuoto(r.testa)) rossi.push("a referto finito manca «testa», l'ultimo commit del ramo");
    else if (!SHA.test(String(r.testa))) rossi.push(`«testa» «${r.testa}» non è un commit (da 7 a 40 cifre esadecimali)`);
    else if (ctx.testaDelRamo && !String(ctx.testaDelRamo).startsWith(String(r.testa)) && !String(r.testa).startsWith(String(ctx.testaDelRamo))) rossi.push(`«testa» ${String(r.testa).slice(0, 12)} non è la testa del ramo (${String(ctx.testaDelRamo).slice(0, 12)})`);
  } else attese.push(`${ctx.nome}: referto non ancora finito (${viste.size} voci su ${ctx.voci.length})`);
  return { rossi, attese };
}
function validaReferto(opz) {
  const [file] = opz.posizionali;
  if (!file) return uso("valida-referto <file> --cartella <dir> [--git <dir> --ramo <ramo>]");
  if (!existsSync(file)) return chiudi("valida-referto", [], [`${file} non c'è ancora`], opz);
  let per, piano;
  try { per = leggiPerimetro(opz); piano = leggiPiano(opz); } catch (e) { return cieco("valida-referto", e.message, opz); }
  const testo = readFileSync(file, "utf8");
  let nome;
  try { nome = JSON.parse(testo).sessione; } catch { nome = (basename(file).match(/R\d{2}/) || [])[0]; }
  const dove = nome ? sessioneNelPiano(piano, nome) : null;
  if (!dove) return chiudi("valida-referto", [`la sessione «${nome}» del referto non è nel piano`], [], opz);
  // Il nome del file e la sessione scritta dentro devono dire la stessa cosa: un referto che si dichiara R02
  // non si controlla al posto di quello di R01 (collaudo del 7/11).
  if (![`referto-${nome}.json`, `${nome}.json`].includes(basename(file))) return chiudi("valida-referto", [`il file ${basename(file)} dice una sessione, il referto un'altra («${nome}»)`], [], opz);
  let chiaviDelRegistro = null;
  try { chiaviDelRegistro = new Set(leggiRegistro(per.casa, opz).elenco.map((d) => chiaveDi(per.casa, d))); } catch { /* detto sotto */ }
  let commitDelRamo = null, testaDelRamo = null, soloRefertoDopo = [];
  if (opz.ramo) {
    const dir = resolve(opz.git ?? repoDi(per.casa, opz));
    const visti = controlliDelRamo(dir, dove.onda.base, opz.ramo, testo);
    if (!visti) return chiudi("valida-referto", [], [`il ramo ${opz.ramo} non esiste ancora`], opz);
    ({ commitDelRamo, testaDelRamo, soloRefertoDopo } = visti);
  }
  const { rossi, attese } = regoleReferto(testo, { nome, voci: dove.sessione.voci, chiaviDelRegistro, commitDelRamo, testaDelRamo, soloRefertoDopo });
  if (!chiaviDelRegistro) attese.push("il registro non si legge: non ho controllato che le chiavi ci siano");
  if (!opz.ramo) attese.push("senza --ramo non ho controllato i commit nella storia del ramo");
  return chiudi("valida-referto", rossi, attese, opz, { sessione: nome });
}

// ── valida-collaudo ──────────────────────────────────────────────────────────────────────────────
/** I file che legano: citati da almeno SOGLIA_HUB voci lavorabili del perimetro. PURA. */
export function fileHub(lavorabili) {
  const conto = new Map();
  for (const v of lavorabili) for (const f of new Set(fileCheDecidono(v.file))) conto.set(f, (conto.get(f) ?? 0) + 1);
  return new Set([...conto].filter(([, n]) => n >= SOGLIA_HUB).map(([f]) => f));
}
/**
 * La regola del campione, ricalcolata dal programma e mai letta dalla dichiarazione del collaudatore.
 * Per UN riparatore: i minori riparati, quanti ne servono nel campione, quanti ce ne sono e quanti reggono.
 */
export function campioneDi(minori, perId, hub) {
  const tot = minori.length;
  const servono = tot <= MINIMO_CAMPIONE ? tot : Math.max(MINIMO_CAMPIONE, Math.ceil(QUOTA_CAMPIONE * tot));
  // Guardata = giudicata con giudizio pieno, OPPURE caduta (un «non regge» è un esito anche senza giudizio):
  // il collaudo del 7/11 ha tolto dal conto due cadute scrivendole «giudizio: nessuno», e il 71% è diventato 100%.
  const guardata = (v) => { const c = perId.get(v.id); return !!c && (c.giudizio === "pieno" || c.verdetto !== "regge"); };
  const pieni = minori.filter(guardata);
  const hubMancanti = minori.filter((v) => v.file.some((f) => hub.has(normPerc(f))) && !guardata(v)).map((v) => v.id);
  const reggono = pieni.filter((v) => perId.get(v.id)?.verdetto === "regge").length;
  const accettato = pieni.length >= servono && hubMancanti.length === 0 && (pieni.length === 0 || reggono / pieni.length >= SOGLIA_CAMPIONE);
  return { minori: tot, servono, nel_campione: pieni.length, reggono, hub_mancanti: hubMancanti, accettato };
}
/** ctx: { nome, riparatori: {RNN: {voci:[{id,chiave,gravita,file}], referto|null}}, hub:Set } */
export function regoleCollaudo(testo, ctx) {
  const rossi = [], attese = [];
  let c;
  try { c = JSON.parse(testo); } catch (e) { return { rossi: [`il collaudo non è JSON: ${e.message}`], attese, campioni: {} }; }
  for (const k of chiaviDoppie(testo)) rossi.push(`la chiave «${k}» è scritta due volte nello stesso oggetto`);
  if (c.collaudatore !== ctx.nome) rossi.push(`collaudatore «${c.collaudatore}», atteso «${ctx.nome}»`);
  if (!dataVera(c.aggiornato)) rossi.push(`«aggiornato» non è una data AAAA-MM-GG HH:MM vera: «${c.aggiornato}»`);
  if (!Array.isArray(c.voci)) { rossi.push("manca l'elenco «voci»"); return { rossi, attese, campioni: {} }; }
  const perId = new Map();
  const elencati = new Set(Object.keys(ctx.riparatori));
  for (const v of c.voci) {
    if (perId.has(v?.id)) rossi.push(`${v?.id}: compare due volte`);
    if (!elencati.has(String(v?.id ?? "").slice(0, 3))) rossi.push(`${v?.id}: è una voce di un riparatore che questo collaudo non elenca`);
    perId.set(v?.id, v);
  }
  const campioni = {};
  for (const [r, info] of Object.entries(ctx.riparatori)) {
    if (!info.referto) { attese.push(`${r}: il referto del riparatore non c'è ancora`); continue; }
    // Un referto non finito è una fotografia di metà lavoro: collaudarlo dà un verde su voci che cambieranno
    // (secondo collaudo del 7/11: letto alla «testa», il referto era quello intermedio, 1 voce su 2).
    if (info.referto.finita !== true) { rossi.push(`${r}: il referto del riparatore non è finito; si collauda il referto finito, letto alla PUNTA del suo ramo`); continue; }
    const scheda = new Map(info.voci.map((v) => [v.id, v]));
    const daCollaudare = info.referto.voci.filter((v) => ["riparato", "parziale", "gia_riparato_prima"].includes(v.esito));
    const minori = [];
    for (const rv of daCollaudare) {
      const s = scheda.get(rv.id);
      const cv = perId.get(rv.id);
      if (!s) continue;
      if (!cv) { (c.finita === true ? rossi : attese).push(`${rv.id}: ${rv.esito} nel referto di ${r}, manca nel collaudo`); continue; }
      if (cv.chiave !== s.chiave) rossi.push(`${rv.id}: la chiave del collaudo non è quella della scheda`);
      if (!VERDETTI.includes(cv.verdetto)) { rossi.push(`${rv.id}: verdetto «${cv.verdetto}» non è uno di ${VERDETTI.join("|")}`); continue; }
      if (!GIUDIZI.includes(cv.giudizio)) rossi.push(`${rv.id}: giudizio «${cv.giudizio}» non è uno di ${GIUDIZI.join("|")}`);
      const lentiTutte = Array.isArray(cv.lenti) && LENTI.every((l) => cv.lenti.includes(l));
      if (rv.esito !== "gia_riparato_prima") {
        if (!Number.isInteger(cv.rimessa?.uscita) || vuoto(cv.rimessa?.comando)) rossi.push(`${rv.id}: manca la prova rimessa lanciata dal collaudatore (uscita e comando)`);
        if (cv.verdetto === "regge" && cv.rimessa?.uscita !== 0) rossi.push(`${rv.id}: «regge» con la prova rimessa uscita ${cv.rimessa?.uscita}, non 0`);
      }
      if (cv.verdetto === "regge" && cv.giudizio === "pieno" && !lentiTutte) rossi.push(`${rv.id}: un giudizio pieno porta tutte e due le lenti (${LENTI.join(", ")})`);
      if ((GRAVI.has(s.gravita) || rv.esito === "gia_riparato_prima") && cv.verdetto === "regge" && cv.giudizio !== "pieno") rossi.push(`${rv.id}: un ${rv.esito === "gia_riparato_prima" ? "«già riparato»" : s.gravita} regge solo con un giudizio pieno`);
      if (!GRAVI.has(s.gravita) && rv.esito === "riparato") minori.push({ id: rv.id, file: s.file });
    }
    const camp = campioneDi(minori, perId, ctx.hub);
    campioni[r] = camp;
    const dichiarato = c.campione?.[r]?.accettato;
    if (dichiarato === true && !camp.accettato) rossi.push(`${r}: il campione è dichiarato accettato ma non lo è (${camp.reggono} reggono su ${camp.nel_campione} guardati, ne servivano ${camp.servono}${camp.hub_mancanti.length ? `, ${camp.hub_mancanti.length} sui file che legano non guardati` : ""})`);
    if (c.finita === true && camp.nel_campione < camp.servono) rossi.push(`${r}: campione troppo piccolo: ${camp.nel_campione} minori guardati con giudizio, ne servono ${camp.servono}`);
  }
  if (c.finita !== true) attese.push(`${ctx.nome}: collaudo non ancora finito`);
  return { rossi, attese, campioni };
}
function riparatoriDi(opz, piano, elenco) {
  // Dove sta il referto di un riparatore, in quest'ordine: la cartella data con --referti (il collaudatore se
  // li copia), <cartella>/referti/ (la regista all'unione), il ramo scritto in sessioni.json (con --git).
  // Prima c'era solo il secondo, che si riempie all'unione: durante il collaudo il campione restava muto.
  const fuori = {};
  const sess = leggiSessioni(opz);
  for (const r of elenco) {
    const dove = sessioneNelPiano(piano, r);
    const candidati = [opz.referti && join(resolve(opz.referti), `${r}.json`), opz.referti && join(resolve(opz.referti), `referto-${r}.json`), join(serveCartella(opz), "referti", `${r}.json`)].filter(Boolean);
    let referto = null;
    const p = candidati.find((x) => existsSync(x));
    if (p) referto = leggiJson(p);
    else if (opz.git && sess?.sessioni?.[r]?.ramo) {
      const ref = risolviRef(resolve(opz.git), sess.sessioni[r].ramo);
      const t = ref ? gitOk(resolve(opz.git), ["show", `${ref}:${REFERTO_DIR}/referto-${r}.json`]) : null;
      try { referto = t ? JSON.parse(t) : null; } catch { referto = null; }
    }
    fuori[r] = { voci: dove?.sessione.voci ?? [], referto, inPiano: !!dove };
  }
  return fuori;
}
function validaCollaudo(opz) {
  const [file] = opz.posizionali;
  if (!file) return uso("valida-collaudo <file> --cartella <dir>");
  if (!existsSync(file)) return chiudi("valida-collaudo", [], [`${file} non c'è ancora`], opz);
  let per, piano;
  try { per = leggiPerimetro(opz); piano = leggiPiano(opz); } catch (e) { return cieco("valida-collaudo", e.message, opz); }
  const testo = readFileSync(file, "utf8");
  let c;
  try { c = JSON.parse(testo); } catch (e) { return chiudi("valida-collaudo", [`il collaudo non è JSON: ${e.message}`], [], opz); }
  const elenco = Array.isArray(c.riparatori) ? c.riparatori : [];
  if (!elenco.length) return chiudi("valida-collaudo", ["il collaudo non dice quali riparatori guarda («riparatori»)"], [], opz);
  const riparatori = riparatoriDi(opz, piano, elenco);
  const fuoriPiano = Object.entries(riparatori).filter(([, x]) => !x.inPiano).map(([r]) => r);
  const { rossi, attese, campioni } = regoleCollaudo(testo, { nome: c.collaudatore, riparatori, hub: fileHub(per.lavorabili) });
  for (const r of fuoriPiano) rossi.push(`${r} non è nel piano`);
  const sess = leggiSessioni(opz);
  for (const r of elenco) {
    const idR = sess?.sessioni?.[r]?.id, idK = sess?.collaudatori?.[c.collaudatore]?.id;
    if (idR && idK && idR === idK) rossi.push(`${c.collaudatore} e ${r} sono la stessa sessione: chi ripara non collauda`);
  }
  return chiudi("valida-collaudo", rossi, attese, opz, { campioni });
}

// ── prova-unione ─────────────────────────────────────────────────────────────────────────────────
function provaUnione(opz) {
  let per, piano;
  try { per = leggiPerimetro(opz); piano = leggiPiano(opz); } catch (e) { return cieco("prova-unione", e.message, opz); }
  const onda = Number(opz.onda ?? piano.onde.length);
  const o = piano.onde[onda - 1];
  if (!o) return uso("prova-unione --onda <n> --cartella <dir> [--refs RNN=ramo,…]");
  const dir = resolve(opz.git ?? repoDi(per.casa, opz));
  const rami = {};
  if (opz.refs) for (const coppia of String(opz.refs).split(",")) { const [n, r] = coppia.split("="); if (n && r) rami[n.trim()] = r.trim(); }
  else {
    const sess = leggiSessioni(opz);
    for (const n of Object.keys(o.sessioni)) if (sess?.sessioni?.[n]?.ramo) rami[n] = sess.sessioni[n].ramo;
  }
  const attese = [], rossi = [];
  const presenti = [];
  for (const n of Object.keys(o.sessioni)) {
    const ref = rami[n] ? risolviRef(dir, rami[n]) : null;
    if (!ref) { attese.push(`${n}: ramo ${rami[n] ?? "(non scritto in sessioni.json)"} non ancora presente`); continue; }
    presenti.push({ n, ref });
  }
  if (!presenti.length) return chiudi("prova-unione", [], attese.length ? attese : ["nessun ramo da unire"], opz);
  const chiTocca = new Map();
  const conUnioni = new Set();
  for (const { n, ref } of presenti) {
    const st = storiaDelRamo(dir, o.base, ref);
    // Un ramo che ha unito altro porta i file di tutti: un rosso solo, e fuori dalla prova (secondo collaudo).
    if (st.unioni.length) { conUnioni.add(n); rossi.push(`${n}: il ramo ha ${st.unioni.length} unioni; prima si tolgono, poi si prova l'unione`); continue; }
    for (const f of st.toccati) {
      if (f.startsWith(`${REFERTO_DIR}/`)) continue;
      if (!chiTocca.has(f)) chiTocca.set(f, []);
      chiTocca.get(f).push(n);
    }
  }
  if (chiTocca.size === 0) attese.push("i rami presenti non toccano ancora nessun file: niente da unire, non è un verde");
  for (const [f, chi] of [...chiTocca].sort()) if (chi.length > 1) rossi.push(`${f}: toccato da ${chi.length} rami della stessa onda (${chi.join(", ")})`);
  // L'unione di prova non tocca nessun albero di lavoro: merge-tree scrive solo oggetti, che restano sciolti.
  const env = { GIT_AUTHOR_NAME: "prova-unione", GIT_AUTHOR_EMAIL: "prova@unione.invalid", GIT_COMMITTER_NAME: "prova-unione", GIT_COMMITTER_EMAIL: "prova@unione.invalid" };
  let corrente = (gitOk(dir, ["rev-parse", o.base]) ?? "").trim();
  for (const { n, ref } of presenti.filter((x) => !conUnioni.has(x.n))) {
    let uscita;
    try {
      uscita = git(dir, ["merge-tree", "--write-tree", "--name-only", "--no-messages", corrente, ref], env);
    } catch (e) {
      const testo = String(e.stdout ?? e.message ?? "");
      const conflitti = testo.split("\n").slice(1).filter(Boolean);
      rossi.push(`${n}: l'unione litiga${conflitti.length ? ` su ${conflitti.slice(0, 6).join(", ")}` : ""}`);
      continue;
    }
    const albero = uscita.split("\n")[0].trim();
    const nuovo = gitOk(dir, ["commit-tree", albero, "-p", corrente, "-p", ref, "-m", `prova-unione ${n}`], env);
    if (nuovo === null) { rossi.push(`${n}: non riesco a scrivere il commit di prova`); continue; }
    corrente = nuovo.trim();
  }
  return chiudi("prova-unione", rossi, attese, opz, { rami: presenti.length, file: chiTocca.size, unione_di_prova: corrente });
}

// ── applica ──────────────────────────────────────────────────────────────────────────────────────
/**
 * La decisione su ogni voce, dai referti e dai collaudi. PURA. La regola del campione si ricalcola qui
 * (scorciatoia #1: misura, non chiedere): la parola «accettato» scritta dal collaudatore non conta.
 */
export function decidi({ piano, referti, collaudi, hub }) {
  const decisioni = [];
  const verdetti = new Map();
  // Un collaudatore giudica solo i riparatori che elenca: il collaudo del 7/11 ha fatto chiudere un grave di R01
  // con il «regge» di K02, che guardava R02, sopra il «non regge» di K01. Fra due verdetti vince il più severo.
  const SEVERITA_VERDETTO = { rompe_altro: 3, non_regge: 2, parziale: 1, regge: 0 };
  for (const c of collaudi) for (const v of c.voci ?? []) {
    const suo = String(v?.id ?? "").slice(0, 3);
    if (!Array.isArray(c.riparatori) || !c.riparatori.includes(suo)) continue;
    const prima = verdetti.get(v.id);
    const peso = SEVERITA_VERDETTO[v.verdetto] ?? 3;
    const pesoPrima = prima ? (SEVERITA_VERDETTO[prima.verdetto] ?? 3) : -1;
    if (!prima || peso > pesoPrima || (peso === pesoPrima && prima.giudizio !== "pieno" && v.giudizio === "pieno")) verdetti.set(v.id, { ...v, collaudatore: c.collaudatore });
  }
  for (const o of piano.onde) {
    for (const [nome, s] of Object.entries(o.sessioni)) {
      const ref = referti[nome];
      const perIdC = new Map([...verdetti].filter(([id]) => id.startsWith(`${nome}-`)));
      const minori = (ref?.voci ?? []).filter((v) => v.esito === "riparato" && !GRAVI.has(s.voci.find((x) => x.id === v.id)?.gravita)).map((v) => ({ id: v.id, file: s.voci.find((x) => x.id === v.id)?.file ?? [] }));
      const camp = campioneDi(minori, perIdC, hub);
      for (const sv of s.voci) {
        const rv = ref?.voci?.find((v) => v.id === sv.id);
        const cv = verdetti.get(sv.id);
        const d = { id: sv.id, sessione: nome, chiave: sv.chiave, gravita: sv.gravita, esito: rv?.esito ?? "senza_referto", verdetto: cv?.verdetto ?? null, collaudatore: cv?.collaudatore ?? null, decisione: "resta_aperta", perche: "" };
        if (!rv) d.perche = "il riparatore non l'ha scritta nel referto";
        else if (rv.esito === "riparato") {
          if (rv.rimessa?.uscita !== 0) d.perche = "la prova rimessa del riparatore non regge";
          else if (!cv) d.perche = "nessun collaudo";
          else if (cv.verdetto !== "regge") d.perche = `collaudo: ${cv.verdetto}`;
          else if (cv.rimessa?.uscita !== 0) d.perche = "la prova rimessa del collaudatore non è uscita 0";
          else if (GRAVI.has(sv.gravita) && cv.giudizio !== "pieno") d.perche = "un grave senza giudizio pieno";
          else if (!GRAVI.has(sv.gravita) && cv.giudizio !== "pieno" && !camp.accettato) d.perche = `minore fuori campione, e il campione di ${nome} non è accettato`;
          else {
            d.decisione = "si_chiude";
            d.come = cv.giudizio === "pieno" ? "collaudo pieno" : "campione";
            d.verifica_comando = rv.prova_comando;
            d.non_vacuita = `${rv.rimessa.comando} → uscita 0 (riparatore); ${cv.rimessa.comando} → uscita 0 (${cv.collaudatore})`;
            d.nota_fix = rv.cosa_ho_fatto ?? "";
          }
        } else if (rv.esito === "gia_riparato_prima") {
          if (cv?.verdetto === "regge" && cv.giudizio === "pieno") { d.decisione = "gia_riparato_prima"; d.prova = rv.prova; }
          else d.perche = cv ? `collaudo: ${cv.verdetto}${cv.giudizio !== "pieno" ? " senza giudizio pieno" : ""}` : "nessun collaudo";
        } else d.perche = rv.esito === "parziale" ? `parziale: ${rv.cosa_resta ?? ""}` : `${rv.esito}${rv.nota ? `: ${rv.nota}` : rv.domanda ? `: ${rv.domanda}` : ""}`;
        decisioni.push(d);
      }
    }
  }
  return decisioni;
}
function leggiCartellaJson(dir, re) {
  return leggiCartellaTesti(dir, re).map((x) => x.dati).filter(Boolean);
}
/** I file della cartella col loro testo: chi giudica un referto guarda il testo (chiavi doppie), non solo il JSON. */
function leggiCartellaTesti(dir, re) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((n) => re.test(n)).sort().map((nome) => {
    const testo = readFileSync(join(dir, nome), "utf8");
    let dati = null;
    try { dati = JSON.parse(testo); } catch { /* lo dice chi chiama */ }
    return { nome, testo, dati };
  });
}
// ── i controllori (Nicola, 12/11: «ci deve essere un controllore… non voglio che con la prossima radiografia
// trovo errori che c'erano già») ─────────────────────────────────────────────────────────────────────
// Un controllore d'onda (C01, C02…) o finale (CF) guarda il ramo GIÀ unito: rilancia le prove sull'albero
// intero e riguarda i file toccati. Scrive controlli/<nome>.json. Una voce che trova rossa non si chiude,
// anche se riparatore e collaudatore dicevano «regge»; i difetti nuovi che vede entrano nel registro come nati.
export const RE_CONTROLLO = /^C(\d{2}|F)\.json$/;
/** Le regole di un referto di controllo. PURA: torna i rossi. */
export function regoleControllo(dati, { nome, chiaviDelRegistro = null, testo = null } = {}) {
  const rossi = [];
  // Una chiave scritta due volte: JSON.parse tiene l'ultima, e un «voci_rosse» pieno spariva sotto uno vuoto.
  if (testo) for (const k of chiaviDoppie(testo)) rossi.push(`la chiave «${k}» è scritta due volte nello stesso oggetto`);
  if (dati?.controllore !== nome) rossi.push(`dice di essere «${dati?.controllore}», il file è ${nome}`);
  if (dati?.finita !== true) rossi.push("il controllo non è finito");
  if (!SHA.test(String(dati?.testa ?? ""))) rossi.push("manca «testa»: lo SHA del ramo unito che il controllore ha guardato");
  const listaRosse = Array.isArray(dati?.voci_rosse);
  if (!listaRosse) rossi.push("manca «voci_rosse» (anche vuota: [] vuol dire che ha guardato e reggono tutte)");
  if (vuoto(dati?.verify?.comando) || !["verde", "rosso"].includes(dati?.verify?.esito)) rossi.push("manca la prova sull'albero unito («verify»: comando ed esito verde o rosso)");
  // Un albero unito rosso che il controllore non attribuisce a nessuna voce non chiude niente in silenzio:
  // nel dubbio si capisce prima di chiudere (collaudo del 12/11).
  else if (dati.verify.esito === "rosso" && listaRosse && dati.voci_rosse.length === 0) rossi.push("«verify» è rosso ma nessuna voce è rossa: di chi è il rosso? Si capisce prima di chiudere");
  for (const v of listaRosse ? dati.voci_rosse : []) {
    if (vuoto(v?.chiave) || vuoto(v?.perche)) rossi.push(`una voce rossa senza chiave o senza perché: «${v?.chiave ?? ""}»`);
    else if (chiaviDelRegistro && !chiaviDelRegistro.has(v.chiave)) rossi.push(`la voce rossa «${v.chiave}» non è nel registro`);
  }
  if (dati?.nuovi_difetti_visti !== undefined && !Array.isArray(dati.nuovi_difetti_visti)) rossi.push("«nuovi_difetti_visti» deve essere un elenco");
  else rossi.push(...regoleNuoviDifetti(dati?.nuovi_difetti_visti));
  return rossi;
}
/** Le voci che un controllore ha trovato rosse non si chiudono. PURA: torna le decisioni nuove. */
export function conIControlli(decisioni, controlli = []) {
  const rosse = new Map();
  for (const c of controlli) for (const v of c?.voci_rosse ?? []) if (!rosse.has(v.chiave)) rosse.set(v.chiave, `${c.controllore}: ${v.perche}`);
  // Anche un «già riparato prima» si riapre: se sul ramo unito il difetto c'è, non era riparato.
  return decisioni.map((d) => (["si_chiude", "gia_riparato_prima"].includes(d.decisione) && rosse.has(d.chiave)
    ? { ...d, decisione: "resta_aperta", verdetto: "rossa_al_controllo", perche: `rossa al controllo sul ramo unito (${rosse.get(d.chiave)})`, controllo: rosse.get(d.chiave) }
    : d));
}
/** Le voci rosse di un controllore che non sono di questa campagna: non si ignorano in silenzio. PURA. */
export const rosseFuoriCampagna = (decisioni, controlli = []) => {
  const nostre = new Set(decisioni.map((d) => d.chiave));
  return [...new Set(controlli.flatMap((c) => (c?.voci_rosse ?? []).map((v) => v.chiave)).filter((k) => !nostre.has(k)))];
};

function applica(opz) {
  let per, piano;
  try { per = leggiPerimetro(opz); piano = leggiPiano(opz); } catch (e) { return cieco("applica", e.message, opz); }
  const cartella = serveCartella(opz);
  // Il registro si scrive solo dove vive (il vault) o in una cartella temporanea di prova: un --registro
  // sbagliato non riscrive un file qualunque (revisione «rischio-sicurezza» del 7/11).
  if (opz.scrivi && opz.registro) {
    const r = resolve(opz.registro);
    const ammessi = [join(opz.radice, "MyCity-Vault/90-Memoria-AI/auto-coscienza"), realpathSync(tmpdir())];
    if (!ammessi.some((a) => veroPercorso(dirname(r)).startsWith(veroPercorso(a)))) return chiudi("applica", [`--registro ${r}: con --scrivi il registro deve stare in MyCity-Vault/90-Memoria-AI/auto-coscienza/ o in una cartella temporanea`], [], opz);
  }
  // IL CONTROLLO STA DENTRO CHI SCRIVE. Il collaudo del 7/11 ha fatto chiudere un grave da un referto non finito,
  // con una prova a lettura del codice: `applica` si fidava che `valida-referto` e `valida-collaudo` fossero
  // già stati lanciati. Qui si rilanciano tutti, sui file che stanno per decidere, e un rosso ferma tutto.
  const lettiR = leggiCartellaTesti(join(cartella, "referti"), /^R\d{2}\.json$/);
  const lettiK = leggiCartellaTesti(join(cartella, "collaudi"), /^K\d{2}\.json$/);
  if (!lettiR.length) return chiudi("applica", [], ["nessun referto in referti/: niente da applicare"], opz);
  let chiaviDelRegistro;
  try { chiaviDelRegistro = new Set(leggiRegistro(per.casa, opz).elenco.map((d) => chiaveDi(per.casa, d))); } catch (e) { return cieco("applica", e.message, opz); }
  const ferma = [];
  // Un file con un nome che non è di nessuna sessione non si ignora in silenzio: è un referto che nessuno legge.
  for (const [sotto, re, forma] of [["referti", /^R\d{2}\.json$/, "RNN"], ["collaudi", /^K\d{2}\.json$/, "KNN"], ["controlli", RE_CONTROLLO, "CNN o CF"]]) {
    const d = join(cartella, sotto);
    if (existsSync(d)) for (const n of readdirSync(d)) if (!re.test(n)) ferma.push(`${sotto}/${n}: il nome non è quello di una sessione (${forma}.json)`);
  }
  const controlli = [];
  for (const { nome: file, testo, dati } of leggiCartellaTesti(join(cartella, "controlli"), RE_CONTROLLO)) {
    const nome = file.replace(/\.json$/, "");
    if (!dati) { ferma.push(`controlli/${file}: non è JSON`); continue; }
    for (const r of regoleControllo(dati, { nome, chiaviDelRegistro, testo })) ferma.push(`controlli/${file}: ${r}`);
    controlli.push(dati);
  }
  const referti = {};
  const sess = leggiSessioni(opz);
  const senzaStoria = [];
  for (const { nome: file, testo, dati } of lettiR) {
    const nome = file.replace(/\.json$/, "");
    if (!dati) { ferma.push(`referti/${file}: non è JSON`); continue; }
    if (dati.sessione !== nome) { ferma.push(`referti/${file}: dice di essere «${dati.sessione}»`); continue; }
    const dove = sessioneNelPiano(piano, nome);
    if (!dove) { ferma.push(`referti/${file}: ${nome} non è nel piano`); continue; }
    // I commit e la testa si guardano sulla storia vera del ramo: senza, un commit inventato si chiudeva
    // (secondo collaudo del 7/11). Con --scrivi è obbligatorio; a vuoto, se manca, lo si dice.
    let visti = null;
    const ramo = sess?.sessioni?.[nome]?.ramo;
    if (opz.git && ramo) visti = controlliDelRamo(resolve(opz.git), dove.onda.base, ramo, testo);
    if (!visti && opz.scrivi) ferma.push(`referti/${file}: con --scrivi servono --git e il ramo di ${nome} in sessioni.json, per controllare commit e testa sulla storia vera`);
    if (!visti && !opz.scrivi) senzaStoria.push(nome);
    const { rossi } = regoleReferto(testo, { nome, voci: dove.sessione.voci, chiaviDelRegistro, commitDelRamo: visti?.commitDelRamo ?? null, testaDelRamo: visti?.testaDelRamo ?? null, soloRefertoDopo: visti?.soloRefertoDopo ?? [] });
    for (const r of rossi) ferma.push(`referti/${file}: ${r}`);
    // Dall'onda 2 la verifica legata allo SHA è obbligatoria anche qui: l'attesa di valida-referto da sola non
    // fermava niente (collaudo del 12/11 notte). I referti dell'onda 1, scritti prima della regola, restano validi.
    if (dove.onda.onda >= 2 && dati.finita === true && vuoto(dati.verifica?.testa)) ferma.push(`referti/${file}: dall'onda 2 un referto finito dice su quale commit è girata la verifica («verifica.testa»)`);
    if (dati.finita !== true) ferma.push(`referti/${file}: il referto non è finito`);
    referti[nome] = dati;
  }
  const hub = fileHub(per.lavorabili);
  const collaudi = [];
  for (const { nome: file, testo, dati } of lettiK) {
    if (!dati) { ferma.push(`collaudi/${file}: non è JSON`); continue; }
    if (dati.collaudatore !== file.replace(/\.json$/, "")) { ferma.push(`collaudi/${file}: dice di essere «${dati.collaudatore}»`); continue; }
    const elenco = Array.isArray(dati.riparatori) ? dati.riparatori : [];
    if (!elenco.length) ferma.push(`collaudi/${file}: non dice quali riparatori guarda`);
    const riparatori = Object.fromEntries(elenco.map((r) => [r, { voci: sessioneNelPiano(piano, r)?.sessione.voci ?? [], referto: referti[r] ?? null }]));
    const { rossi } = regoleCollaudo(testo, { nome: dati.collaudatore, riparatori, hub });
    for (const r of rossi) ferma.push(`collaudi/${file}: ${r}`);
    if (dati.finita !== true) ferma.push(`collaudi/${file}: il collaudo non è finito`);
    collaudi.push(dati);
  }
  if (ferma.length) return chiudi("applica", ferma, [], opz);
  const decisioni = conIControlli(decidi({ piano, referti, collaudi, hub }), controlli);
  const fuoriCampagna = rosseFuoriCampagna(decisioni, controlli);
  if (fuoriCampagna.length) console.log(`⚠️  ${fuoriCampagna.length} voci rosse dei controllori non sono di questa campagna (restano come sono nel registro, vanno dette a Nicola): ${fuoriCampagna.slice(0, 5).join(" ; ")}`);
  const quando = opz.quando ?? timbroOra();
  const [g, m] = [quando.slice(8, 10), quando.slice(5, 7)];
  const campo = `riparazione_${g}_${m}`;
  const nomeCampagna = basename(cartella);
  const chiude = decisioni.filter((d) => d.decisione === "si_chiude");
  const gia = decisioni.filter((d) => d.decisione === "gia_riparato_prima");
  const restano = decisioni.filter((d) => d.decisione === "resta_aperta");
  const nati = [...Object.values(referti), ...controlli.map((c) => ({ ...c, sessione: c.controllore }))]
    .flatMap((r) => (r.nuovi_difetti_visti ?? []).map((n) => ({ ...n, sessione: r.sessione })));
  console.log(`🧾 ${decisioni.length} voci: ${chiude.length} si chiudono (dopo l'unione), ${gia.length} erano già riparate, ${restano.length} restano aperte · ${nati.length} difetti nati`);
  // i frammenti per chiudi-sito.mjs (sito) o la lista per auto-fix (macchina): si applicano DOPO l'unione
  const perSessione = new Map();
  for (const d of chiude) { if (!perSessione.has(d.sessione)) perSessione.set(d.sessione, []); perSessione.get(d.sessione).push(d); }
  const frammenti = [...perSessione].map(([s, ds]) => ({
    corsia: numeroSessione(s), territorio: s,
    difetti: ds.map((d) => ({ chiave: d.chiave, esito: "riparato", verifica_comando: d.verifica_comando, non_vacuita: d.non_vacuita, nota_fix: d.nota_fix })),
  }));
  scriviJson(join(cartella, "decisioni.json"), { campagna: nomeCampagna, quando, decisioni, ...(fuoriCampagna.length ? { rosse_fuori_campagna: fuoriCampagna } : {}) });
  if (!opz.scrivi) {
    console.log("   (a vuoto: ho scritto solo decisioni.json. Con --scrivi scrivo i frammenti e il registro.)");
    const attese = senzaStoria.length ? [`commit e testa non controllati sulla storia del ramo per ${senzaStoria.join(", ")} (servono --git e sessioni.json)`] : [];
    if (fuoriCampagna.length) attese.push(`${fuoriCampagna.length} voci rosse dei controllori non sono di questa campagna: vanno dette a Nicola (in decisioni.json, rosse_fuori_campagna)`);
    return chiudi("applica", [], attese, opz, { si_chiudono: chiude.length, gia: gia.length, restano: restano.length, nati: nati.length });
  }
  for (const f of frammenti) scriviJson(join(cartella, "frammenti", `esito-${f.corsia}.json`), f);
  let reg;
  try { reg = leggiRegistro(per.casa, opz); } catch (e) { return cieco("applica", e.message, opz); }
  const perChiave = new Map(reg.elenco.map((d) => [chiaveDi(per.casa, d), d]));
  const rossi = [];
  for (const d of [...gia, ...restano, ...chiude]) if (!perChiave.has(d.chiave)) rossi.push(`la chiave «${d.chiave}» non aggancia niente nel registro`);
  if (rossi.length) return chiudi("applica", rossi, [], opz);
  for (const d of gia) {
    const x = perChiave.get(d.chiave);
    if (per.casa === "sito") Object.assign(x, { stato: "gia_riparato_prima", chiuso_il: quando, chiuso_da: `riparazione ${nomeCampagna} · ${d.sessione} · collaudo ${d.collaudatore}` });
    x[campo] = { esito: "gia_riparato_prima", sessione: d.sessione, collaudo: d.collaudatore, prova: d.prova };
  }
  for (const d of restano) perChiave.get(d.chiave)[campo] = { esito: d.esito, sessione: d.sessione, collaudo: d.verdetto, perche: d.perche };
  for (const d of chiude) perChiave.get(d.chiave)[campo] = { esito: "riparato", sessione: d.sessione, collaudo: `${d.collaudatore} · ${d.come}`, nota: "si chiude dopo l'unione della PR" };
  let tolte = 0;
  if (per.casa === "macchina") {
    for (const d of restano) {
      const x = perChiave.get(d.chiave);
      // AR-444: una vecchia prova a pattern rimasta sulla scheda la richiude da sola al primo `auto-fix`.
      if (x.verifica && x.verifica.file && x.verifica.pattern && !x.verifica.tipo) {
        x.verifica_a_pattern_tolta = { quando, verifica: x.verifica, perche: `la riparazione ${nomeCampagna} non regge: la prova a pattern la richiuderebbe da sola (AR-444)` };
        x.verifica = { tipo: "umano", nota: `riparazione ${nomeCampagna}: non regge al collaudo (${d.perche}). Serve una prova che diventi rossa.` };
        tolte++;
      }
    }
    for (const d of chiude) {
      const x = perChiave.get(d.chiave);
      x.nota_fix = [x.nota_fix, `${quando} · ${nomeCampagna} · ${d.sessione}: ${d.nota_fix}`].filter(Boolean).join(" — ");
      x.verifica = { tipo: "comando", comando: d.verifica_comando };
    }
  }
  const scritti = [], gianoti = [], riservati = [];
  for (const n of nati) {
    if (n.riservato === true) { riservati.push(n); continue; }
    if (per.casa === "macchina") continue; // gli id AR nuovi li dà prossimo-ar.mjs: la regista li registra a mano
    const voce = { dimensione: n.dimensione ?? "qa-flussi", reparto: REPARTI_MARKETPLACE[n.dimensione] ?? undefined, titolo: n.titolo, severita: n.severita, file: n.file, descrizione: n.descrizione ?? "", impatto: n.impatto ?? "", fix: n.fix ?? "", fonte: `nato dalla riparazione ${nomeCampagna} · ${n.sessione}`, stato: "aperto" };
    if (perChiave.has(chiaveProblema(voce))) { gianoti.push(n); continue; }
    reg.elenco.push(voce);
    perChiave.set(chiaveProblema(voce), voce);
    scritti.push(n);
  }
  if (per.casa === "macchina" && nati.length) scriviJson(join(cartella, "nati-macchina.json"), nati.filter((n) => n.riservato !== true));
  scriviJsonAtomico(reg.percorso, reg.grezzo);
  console.log(`   frammenti: ${frammenti.length} · nati scritti: ${scritti.length} (già noti ${gianoti.length}, riservati fuori ${riservati.length})${per.casa === "macchina" ? ` · prove a pattern tolte: ${tolte}` : ""}`);
  console.log(per.casa === "sito"
    ? `   dopo l'unione: node cervello/chiudi-sito.mjs ${join(cartella, "frammenti")} --applica --pr <N> --commit <sha>`
    : "   dopo l'unione: node cervello/auto-fix.mjs verifica --applica");
  return chiudi("applica", [], [], opz, { si_chiudono: chiude.length, gia: gia.length, restano: restano.length, nati_scritti: scritti.length });
}

// ── conti ────────────────────────────────────────────────────────────────────────────────────────
function conti(opz) {
  let per, piano;
  try { per = leggiPerimetro(opz); piano = leggiPiano(opz); } catch (e) { return cieco("conti", e.message, opz); }
  const cartella = serveCartella(opz);
  const referti = leggiCartellaJson(join(cartella, "referti"), /^R\d{2}\.json$/);
  const nelPerimetro = new Set(per.lavorabili.map((v) => v.chiave));
  const rossi = [];
  const esiti = {};
  for (const r of referti) for (const v of r.voci ?? []) {
    esiti[v.esito] = (esiti[v.esito] ?? 0) + 1;
    if (!nelPerimetro.has(v.chiave)) rossi.push(`${v.id}: la chiave «${v.chiave}» non è nel perimetro`);
  }
  const assegnate = piano.onde.reduce((a, o) => a + Object.values(o.sessioni).reduce((b, s) => b + s.voci.length, 0), 0);
  let statoOra = {};
  try {
    const reg = leggiRegistro(per.casa, opz);
    for (const d of reg.elenco) if (nelPerimetro.has(chiaveDi(per.casa, d))) statoOra[statoDi(d)] = (statoOra[statoDi(d)] ?? 0) + 1;
  } catch { statoOra = null; }
  const dec = existsSync(join(cartella, "decisioni.json")) ? leggiJson(join(cartella, "decisioni.json")).decisioni : [];
  const perDec = {};
  for (const d of dec) perDec[d.decisione] = (perDec[d.decisione] ?? 0) + 1;
  // Il controllo finale non dimentica nessuna voce (Nicola, 12/11: «che non si dimentichi nulla»): ogni voce data a
  // una sessione ha la sua decisione in decisioni.json, e ogni decisione dice perché resta aperta.
  if (dec.length) {
    const conDecisione = new Set(dec.map((d) => d.chiave));
    for (const o of piano.onde) for (const [n, sess] of Object.entries(o.sessioni)) for (const v of sess.voci) {
      if (!conDecisione.has(v.chiave)) rossi.push(`${v.id} (${n}, onda ${o.onda}): nessuna decisione in decisioni.json`);
    }
    for (const d of dec) if (d.decisione === "resta_aperta" && vuoto(d.perche) && d.esito !== "senza_referto") rossi.push(`${d.id}: resta aperta senza il perché`);
  }
  console.log(`📊 perimetro ${per.lavorabili.length} lavorabili · assegnate ${assegnate} in ${piano.onde.length} onde · cucitura ${piano.cucitura?.length ?? 0} · eccedenza ${piano.eccedenza?.length ?? 0}`);
  console.log(`   esiti dei riparatori: ${Object.entries(esiti).map(([k, v]) => `${v} ${k}`).join(", ") || "nessun referto"}`);
  if (dec.length) console.log(`   decisioni: ${Object.entries(perDec).map(([k, v]) => `${v} ${k}`).join(", ")}`);
  if (statoOra) console.log(`   nel registro adesso, per le chiavi del perimetro: ${Object.entries(statoOra).map(([k, v]) => `${v} ${k}`).join(", ")}`);
  return chiudi("conti", rossi, statoOra ? [] : ["il registro non si legge"], opz, { lavorabili: per.lavorabili.length, assegnate, esiti, decisioni: perDec, registro: statoOra });
}

// ── avvio ────────────────────────────────────────────────────────────────────────────────────────
const COMANDI = {
  perimetro, dividi, schede, "copertura-prima": coperturaPrima, segnaposti, "guardia-ramo": guardiaRamo,
  "valida-referto": validaReferto, "valida-collaudo": validaCollaudo, "prova-unione": provaUnione, applica, conti,
};
export function esegui(argv) {
  const [comando, ...resto] = argv;
  if (!COMANDI[comando]) return uso(`<${Object.keys(COMANDI).join("|")}> …`);
  let opz;
  try { opz = leggiOpzioni(resto); } catch (e) { return uso(`${comando}: ${e.message}`); }
  try { return COMANDI[comando](opz); } catch (e) { return cieco(comando, e.message, opz); }
}
// Il confronto passa dai percorsi VERI: lanciato da un collegamento simbolico (../ad-mycity → la copia) il
// programma usciva 0 senza fare niente (collaudo B del 7/11).
if (process.argv[1] && veroPercorso(process.argv[1]) === veroPercorso(fileURLToPath(import.meta.url))) {
  process.exitCode = esegui(process.argv.slice(2));
}
