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
//   conti                     prima e dopo, incrociando le chiavi; rosso se una PR dell'onda è unita e il registro no
//   conti --preventivo [--voci N] [--misure <file>]   stima, tetto e massimo SOLO da misure.json, in preventivo.json
//                             e in REGIA.md; rosso con la spesa (stato-sessioni.json) al 70% e al 100% della stima
//   deposito                  stampa il deposito dei rami della campagna (sito o macchina); 2 se non c'è
//   pronte [--git <dir>]      quattro elenchi di chiavi in <cartella>/pronte/: A da ricollaudare, B serve_file_altrui,
//                             C parziali con file altrui, D per Nicola (dai percorsi e dagli esiti, voce unica)
//   segnali [--onda N]        le novità rispetto a rossi-noti.txt, una per riga (1 se ce n'è almeno una)
//   stato [--onda N]          la campagna in 40 righe al massimo: figlie, esiti, spesa, segnali, prossima azione
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
import { chiaveProblema, REPARTI_MARKETPLACE, REPARTI_DESIGN } from "./referti-sito.mjs";
import { timbroOra } from "./ora-piacenza.mjs";
import { scriviJsonAtomico, scriviTestoAtomico } from "./scrivi-json.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const veroPercorso = (p) => { try { return realpathSync(p); } catch { return resolve(p); } };

// ── Le costanti del metodo ───────────────────────────────────────────────────────────────────────
export const RANGO = Object.freeze({ bloccante: 0, grave: 1, medio: 2, minore: 3 });
export const GRAVI = new Set(["bloccante", "grave"]);
export const ESITI = Object.freeze(["riparato", "parziale", "gia_riparato_prima", "non_codice", "scelta_di_nicola", "serve_file_altrui", "non_fatto", "verificata_dopo_nicola"]);
export const VERDETTI = Object.freeze(["regge", "parziale", "non_regge", "rompe_altro"]);
export const GIUDIZI = Object.freeze(["pieno", "nessuno"]);
export const LENTI = Object.freeze(["chiude_tutta", "nata_rotta"]);
export const PROVE = Object.freeze(["comando", "lettura-codice", "umano"]);
export const MAX_SESSIONI = 12;
// 25 e non più 45 (Nicola, 12/11: «i lavori più lunghi che ci impiegano tante ore suddividilo in altre
// sessioni»): un riparatore finisce in circa metà tempo, e il profilo «tutto» passa da due a tre onde.
export const PER_SESSIONE = 25;
export const TETTO_CUCITURA = 40;
// Dentro un lotto fino a 40 voci il campione non esiste: ogni minore riparato vuole il giudizio pieno. Il campione
// ha lasciato fuori 15 minori nell'onda 2, e il giudizio pieno costa circa 0,32 $ a voce (K08 terzo, 14/11).
export const LOTTO_SENZA_CAMPIONE = 40;

/**
 * Da quale onda la regola dei 40 (sopra) vale anche per `applica` e `pronte`, non solo per `valida-collaudo` (AR-1184,
 * Nicola, carta #256 risposta 5a, 15/11 23:35). Si legge dal piano, sullo stampo di `verifica_testa_dall_onda`.
 * Senza il campo: null, e `decidi` resta com'era (la campagna del 12/11 non riapre niente di già chiuso a campione).
 * Un valore che non è un numero d'onda (un intero da 1 in su) non si tratta come assente: spegnerebbe la regola in
 * silenzio. Si ferma, e chi lo chiama esce cieco.
 */
export function campioneFinoA40DallOnda(piano) {
  const v = piano?.campione_fino_a_40_dall_onda;
  if (v === undefined || v === null) return null;
  if (!Number.isInteger(v) || v < 1) throw new Error(`il piano dice campione_fino_a_40_dall_onda ${JSON.stringify(v)}: serve il numero dell'onda (un intero da 1 in su)`);
  return v;
}
// I tetti dei subagenti di un riparatore: gli stessi del freno (riparazione/freno-subagenti.mjs, che non si importa
// qui per non legare i due programmi; una prova controlla che restino uguali). Officina minima del 15/11, pezzo 6.
export const TETTO_SUBAGENTI = Object.freeze({ "riparatore-minori": 6, "riparatore-gravi": 8 });
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
const BOOLEANE = new Set(["json", "anche-umani", "anche-rimandati", "ultima", "scrivi", "tutti", "preventivo"]);
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

/** L'area di un difetto nato: una che il registro conosce. Le stesse parole in un altro ordine
 *  («legale-privacy» per «privacy-legale») sono la stessa area; una parola che non c'è va nei flussi. */
function areaDelNato(dichiarata, aree) {
  if (!aree.size) return dichiarata ?? "qa-flussi"; // un registro senza elenco delle aree: com'era prima
  if (dichiarata && aree.has(dichiarata)) return dichiarata;
  const parole = (s) => String(s).split("-").sort().join("-");
  if (dichiarata) for (const a of aree) if (parole(a) === parole(dichiarata)) return a;
  return aree.has("qa-flussi") ? "qa-flussi" : [...aree][0];
}
const CONTATORE_DI = Object.freeze({ bloccante: "bloccanti", grave: "gravi", minore: "minori" });

/**
 * I difetti nati entrano nel registro del sito, e il totale dichiarato sale con loro.
 * Il 13/11 l'onda 1 ne ha scritti 58 senza toccare `meta.findings`, il numero che il referto dichiara e
 * che fa da testimone al conto (radiografia-marketplace-conti.mjs): il conto diceva 3090, il testimone
 * 3032, e la CI della macchina è diventata rossa. Uno dei 58 stava anche sotto «legale-privacy», un'area
 * che il registro non ha, e la scheda del Pannello non sapeva come chiamarla.
 * Il testimone non si ricalcola dall'elenco: chi scrive dichiara quanti ne ha aggiunti, e solo quelli.
 */
export function scriviNatiSito(reg, nati, { campagna, perChiave }) {
  const aree = new Set((reg.grezzo.dimensioni ?? []).map((d) => d?.chiave).filter(Boolean));
  const scritti = [], gianoti = [], riservati = [], aggiunte = [];
  for (const n of nati) {
    if (n.riservato === true) { riservati.push(n); continue; }
    const dimensione = areaDelNato(n.dimensione, aree);
    const voce = {
      dimensione,
      ...(n.dimensione && n.dimensione !== dimensione ? { dimensione_dichiarata: n.dimensione } : {}),
      reparto: REPARTI_MARKETPLACE[dimensione] ?? REPARTI_DESIGN[dimensione] ?? undefined,
      titolo: n.titolo, severita: n.severita, file: n.file, descrizione: n.descrizione ?? "", impatto: n.impatto ?? "", fix: n.fix ?? "",
      fonte: `nato dalla riparazione ${campagna} · ${n.sessione}`, stato: "aperto",
    };
    if (perChiave.has(chiaveProblema(voce))) { gianoti.push(n); continue; }
    reg.elenco.push(voce);
    perChiave.set(chiaveProblema(voce), voce);
    scritti.push(n);
    aggiunte.push(voce);
  }
  const meta = reg.grezzo.meta;
  if (meta && Number.isInteger(meta.findings) && aggiunte.length) {
    meta.findings += aggiunte.length;
    for (const v of aggiunte) {
      const k = CONTATORE_DI[v.severita];
      if (k && Number.isInteger(meta[k])) meta[k] += 1;
    }
  }
  return { scritti, gianoti, riservati };
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
/** Le prove citate da due voci o più: hanno un padrone solo nell'onda. PURA. */
export function proveComuni(voci) {
  const conto = new Map();
  for (const v of voci) for (const f of new Set((v.file ?? []).map(normPerc).filter((x) => eProva(x) && !eMigrazione(x)))) conto.set(f, (conto.get(f) ?? 0) + 1);
  return new Set([...conto].filter(([, n]) => n >= 2).map(([f]) => f));
}
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
  const comuni = proveComuni(ordinate);
  for (const v of ordinate) {
    if (v.file.some((f) => vietati.has(normPerc(f)))) { regia.push(v.chiave); continue; }
    // Una prova COMUNE (citata da due voci o più) ha un padrone solo, come un sorgente (officina minima del 15/11):
    // il 13/11 alle 07:16 cinque voci sono state tolte con un revert perché due sessioni toccavano la stessa prova.
    const decidono = [...new Set([...fileCheDecidono(v.file), ...v.file.map(normPerc).filter((f) => comuni.has(f))])];
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
    candidate = conFileCheServono([...chiavi].map((c) => perChiave.get(c)), fileCheServono(opz));
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
export function testoScheda({ nome, onda, casa, deposito, base, ramo, regista, cartella, sessione, precedenti = {} }) {
  const prima = sessione.voci[0];
  const gravi = sessione.voci.filter((v) => GRAVI.has(v.gravita)).length;
  const righe = [
    // La riga del ruolo la legge il freno sugli agenti (riparazione/freno-subagenti.mjs) nel prompt d'apertura:
    // la regista la copia come prima riga del prompt con cui apre la sessione.
    "---", "tipo: scheda", `sessione: ${nome}`, `onda: ${onda}`, `casa: ${casa}`, `ruolo-freno: ${gravi ? "riparatore-gravi" : "riparatore-minori"}`, "---", "",
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
    ...sessione.voci.flatMap((v) => {
      const pr = precedenti[v.chiave];
      const prima = pr ? [`  - prima: ${pr.esito} (${pr.id})${pr.cosa_resta ? ` · resta: ${pr.cosa_resta}` : ""}`, ...(pr.modifiche ?? []).map((m) => `  - modifica scritta per ${m.file}: ${m.modifica}`)] : [];
      return [`- \`${v.id}\` · ${v.gravita} · ${v.chiave} · ${v.file.join(" , ")}`, ...prima];
    }), "",
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
  // Le voci che tornano dal giro prima portano nella scheda esito, cosa resta e la modifica scritta (pronte.json).
  const filePronte = join(cartella, "pronte", "pronte.json");
  const precedenti = existsSync(filePronte) ? (leggiJson(filePronte).precedenti ?? {}) : {};
  for (const [nome, s] of Object.entries(o.sessioni)) {
    const testo = testoScheda({
      nome, onda, casa: per.casa, deposito: per.deposito, base: o.base,
      ramo: `${ramoRegista}-m${due(numeroSessione(nome))}`, regista: opz.regista ?? "<regista>", cartella: relCartella, sessione: s, precedenti,
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
  // Una prova comune (citata da due voci o più) vuole un padrone nell'onda, ed è della sessione di ogni voce che la cita.
  const comuni = proveComuni(Object.values(o.sessioni ?? {}).flatMap((s) => s.voci ?? []));
  for (const [nome, s] of Object.entries(o.sessioni ?? {})) for (const v of s.voci ?? []) for (const f of (v.file ?? []).map(normPerc).filter((x) => comuni.has(x))) {
    if (!padrone.has(f)) rossi.push(`${v.id}: tocca ${f}, che in quest'onda non ha un padrone`);
    else if (padrone.get(f) !== nome) rossi.push(`${v.id}: tocca ${f}, che in quest'onda è di ${padrone.get(f)}`);
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
/** Le chiamate che passano al setaccio una cartella intera. */
export const RE_SETACCIO = /\b(?:readdirSync|readdir|opendirSync|opendir|globSync|glob|fg|fastGlob|walk\w*)\s*\(/;
const senzaCommentiJs = (t) => String(t).replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\])\/\/.*$/gm, "$1");
// Radiografia del 12/11 notte: anche `.skip.each(…)`, `.skip.each\`…\``, `describe.skip.each` e `ctx.skip()` / `context.skip()`.
export const RE_SPENTA = /\b(?:it|test|describe)(?:\.\w+)*\.(?:skip|only|todo|fails|skipIf|runIf)(?:\.\w+)*\s*[(`]|\bx(?:it|test|describe)\s*\(|\{\s*(?:skip|todo)\s*:|\b(?:t|ctx|context)\.(?:skip|todo)\s*\(/;
/**
 * Vero se la riga aggiunta STRINGE il salto della riga tolta: la stessa riga, con `.skipIf(VECCHIA)` diventato
 * `.skipIf(VECCHIA && X)`. Una prova che si salta solo con una condizione in più si salta meno spesso, non di più. PURA.
 * Perché esiste: nell'onda 9, giro 5m (21/11), R01-007 ha portato `it.skipIf(CATALOGO === null)` a
 * `it.skipIf(CATALOGO === null && !carattere.locale)` nella prova del corsivo. La guardia l'ha letta come «prova spenta»
 * e ha fermato tutto il giro nel registro, dopo l'unione di mycity#300. Correzione autorizzata da Nicola (21/11 verso
 * le 13:10, «Prova del corsivo»). X non può uscire dalla congiunzione: fuori da stringhe e parentesi non porta `||`,
 * `??`, `?`, `,`, `=` né `=>`. Ogni altro cambio di una riga spenta resta rosso.
 */
export function restringeIlSalto(tolta, aggiunta) {
  const pezzi = (riga) => {
    const t = String(riga).trim();
    const m = /\.skipIf\s*\(/.exec(t);
    if (!m) return null;
    const apre = m.index + m[0].length - 1;
    for (let i = apre, prof = 0; i < t.length; i++) {
      if (t[i] === "(") prof++;
      else if (t[i] === ")" && --prof === 0) return { prima: t.slice(0, apre + 1), cond: t.slice(apre + 1, i).trim(), dopo: t.slice(i) };
    }
    return null;
  };
  const a = pezzi(tolta), b = pezzi(aggiunta);
  if (!a || !b || !a.cond || a.prima !== b.prima || a.dopo !== b.dopo || !b.cond.startsWith(a.cond)) return false;
  const resto = /^&&([\s\S]+)$/.exec(b.cond.slice(a.cond.length).trim());
  if (!resto) return false;
  let x = resto[1].replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g, "S");
  for (let prima = ""; prima !== x; ) { prima = x; x = x.replace(/\([^()]*\)|\[[^[\]]*\]|\{[^{}]*\}/g, "G"); }
  return x.trim() !== "" && !/[()[\]{}]|\|\||\?|,|=>|(?:^|[^=!<>])=(?!=)/.test(x);
}
/** Quante asserzioni porta il testo di una prova (vitest, node:test, assert). PURA. */
// I commenti si tolgono prima di contare: un'asserzione COMMENTATA non controlla niente (radiografia del 12/11 notte).
export const contaAsserzioni = (testo) => (String(testo).replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\])\/\/.*$/gm, "$1").match(/\bexpect\s*\(|\bassert(?:\.\w+)?\s*\(|\bt\.(?:assert|equal|deepEqual|ok|throws)\b/g) || []).length;
/** Le regole che un'eccezione firmata può sospendere in un'onda, e solo queste. */
export const REGOLE_DEROGABILI = Object.freeze(["prove_comuni", "prova_nuova_senza_nome", "prova_esistente_altrui", "rimessa_a_mano", "id_nel_commit"]);
/**
 * Le regole che una firma sospende solo su UN commit, scritto per intero (40 cifre), mai per un'onda intera.
 * Perché esiste: nell'onda 2 il ramo di R17 porta bb53b6be, il revert di R17-005 col messaggio standard di git
 * («Revert "R17-005 …"»), che non comincia con l'id della voce. Nicola ha firmato la deroga su quel commit solo
 * (15/11 verso le 06:05, decisione 2 del piano del 15/11). Nel piano:
 * `eccezioni_firmate: [{ onda: 2, commit: "<40 cifre>", regole: ["id_nel_commit"], firma: "…" }]`.
 */
export const REGOLE_PER_COMMIT = Object.freeze(["id_nel_commit"]);
const SHA_INTERO = /^[0-9a-f]{40}$/;
/**
 * L'eccezione firmata da Nicola su una regola, per un'onda sola. PURA. Torna la firma, o null.
 * Perché esiste: la campagna del 12/11 ha lavorato la sua onda 1 prima che le regole di AR-1172 ci fossero, e i
 * collaudatori avevano già guardato quelle modifiche. Con le regole di oggi `applica --git` dava 63 rossi su 300 voci,
 * e i 115 difetti riparati non si potevano chiudere. Nicola ha scelto: la regola resta stretta, e per la sola onda 1
 * vale un'eccezione firmata (card 239, «a», 13/11 03:27; «Allarga la a», 13/11 05:20, per i sei rossi che non erano
 * prove comuni). Nel piano: `eccezioni_firmate: [{ onda: 1, regole: [...], firma: "…" }]`. Senza firma non vale; una
 * regola fuori da REGOLE_DEROGABILI non vale; dall'onda dopo la regola è stretta.
 */
export function eccezioneFirmata(piano, onda, regola, commit = null) {
  if (!REGOLE_DEROGABILI.includes(regola)) return null;
  const perCommit = REGOLE_PER_COMMIT.includes(regola);
  for (const e of Array.isArray(piano?.eccezioni_firmate) ? piano.eccezioni_firmate : []) {
    // L'onda è un numero intero, scritto così: «1», true o [1] non valgono come onda 1 (collaudo del 13/11).
    if (!Number.isInteger(e?.onda) || e.onda !== Number(onda) || !Array.isArray(e?.regole) || !e.regole.includes(regola)) continue;
    // Una regola per commit vale solo sul commit giudicato, scritto per intero: un prefisso, o nessun commit, la
    // sospenderebbe per tutta l'onda. E un'eccezione che nomina un commit non sospende nient'altro per l'onda intera.
    if (perCommit ? !(typeof e.commit === "string" && SHA_INTERO.test(e.commit) && e.commit === String(commit ?? "")) : e.commit !== undefined) continue;
    // Una firma vera porta lettere o cifre: una fatta di soli caratteri invisibili non è una firma (collaudo del 13/11).
    if (typeof e.firma === "string" && /[\p{L}\p{N}]/u.test(e.firma)) return e.firma.trim();
  }
  return null;
}
/**
 * La rimessa fatta a mano, quando prova-rimessa esce 3 (rossa per la struttura, non per il comportamento): il
 * comando, l'uscita senza la correzione (diversa da 0) e quella con la correzione (0). PURA.
 */
export function aManoValida(a) {
  return !!a && typeof a === "object" && !vuoto(a.comando) && Number.isInteger(a.uscita_senza_correzione) && a.uscita_senza_correzione !== 0 && a.uscita_con_correzione === 0;
}
/**
 * Il giudizio su UN percorso toccato dalla storia di un ramo riparatore. PURA.
 * `ctx`: { nome, suoi:Set, esisteAllaBase(p), importaDaSuoi(p), fascia:[a,b]|null, casa, deroga?(regola, perché) }
 * `deroga` dice se un'eccezione firmata sospende quella regola in quest'onda (e la annota): allora non è un rosso.
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
    // run.sh e la CI leggono solo tests/sql/rls/*.test.sql: una prova SQL con un altro nome non la rilancia
    // nessuno dopo l'unione (radiografia del 12/11 notte).
    if (!allaBase && /(^|\/)tests\/sql\/rls\/[^/]+$/.test(p) && !p.endsWith(".test.sql")) return `${p}: una prova SQL nuova finisce in .test.sql, se no run.sh e la CI non la lanciano`;
    const derogata = (regola, perche) => (typeof ctx.deroga === "function" && ctx.deroga(regola, perche) ? null : perche);
    if (!allaBase) return basename(p).toLowerCase().includes(`riparazione-${ctx.nome.toLowerCase()}`) ? null : derogata("prova_nuova_senza_nome", `${p}: una prova nuova porta il nome della sessione (riparazione-${ctx.nome.toLowerCase()}-…)`);
    const di = ctx.importaDaSuoi(p);
    if (di === "condivisa") return derogata("prove_comuni", `${p}: è una prova esistente che usa anche file di altre sessioni dell'onda: non è di nessuno, la tocca solo la regista`);
    return di ? null : derogata("prova_esistente_altrui", `${p}: è una prova esistente che non importa e non nomina nessuno dei file di ${ctx.nome}`);
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
function stampaEccezioni(elenco) {
  if (!elenco?.length) return;
  console.log(`ℹ️ ${elenco.length} rossi sospesi da un'eccezione firmata (non fermano, si elencano):`);
  for (const e of elenco.slice(0, TETTO_RIGHE)) console.log(`   ℹ️ ${e}`);
  if (elenco.length > TETTO_RIGHE) console.log(`   ℹ️ … e altri ${elenco.length - TETTO_RIGHE} (tutti in --json)`);
}
/** La deroga per un collaudo: l'onda è quella del riparatore della voce. */
function derogaCollaudo(piano, annotati) {
  return (regola, perche, riparatore) => {
    const dove = sessioneNelPiano(piano, riparatore);
    const firma = dove ? eccezioneFirmata(piano, dove.onda.onda, regola) : null;
    if (!firma) return false;
    annotati.push(`${perche} [eccezione firmata, onda ${dove.onda.onda}: ${firma}]`);
    return true;
  };
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
  const g = giudicaRamo(opz, per, piano, ramo, nome);
  if (g.rimessi?.length) console.log(`ℹ️ toccati nella storia e rimessi com'erano (non entrano nell'unione, non sono un rosso): ${g.rimessi.slice(0, TETTO_RIGHE).join(", ")}`);
  stampaEccezioni(g.extra?.eccezioni_firmate);
  return chiudi("guardia-ramo", g.rossi, g.attese, opz, g.extra);
}
/**
 * Il giudizio su un ramo riparatore, senza stampare: lo usano `guardia-ramo` e `applica` (radiografia del 12/11 notte:
 * la skill diceva che applica rilancia la guardia, e non era vero). Torna { rossi, attese, extra, rimessi }.
 */
export function giudicaRamo(opz, per, piano, ramo, nome) {
  const esito = (rossi, attese = [], extra = {}, rimessi = []) => ({ rossi, attese, extra, rimessi });
  const dove = sessioneNelPiano(piano, nome);
  if (!dove) return esito([`${nome} non è nel piano`]);
  const dir = resolve(opz.git ?? repoDi(per.casa, opz));
  const ref = risolviRef(dir, ramo);
  if (!ref) return esito([], [`il ramo ${ramo} non esiste ancora in ${dir}`]);
  const partenza = dove.onda.base;
  if (gitOk(dir, ["merge-base", "--is-ancestor", partenza, ref]) === null) return esito([`${nome}: ${ref} non parte dalla base dell'onda ${dove.onda.onda} (${partenza.slice(0, 12)})`]);
  const storia = storiaDelRamo(dir, partenza, ref);
  // Un ramo che ha unito main porta dentro la storia di tutti: giudicarne i file darebbe migliaia di rossi
  // non suoi (collaudo B del 7/11: 3.445 righe, 25 secondi). Le unioni sono già il rosso: si tolgono prima.
  if (storia.unioni.length) return esito([`${nome}: il ramo ha ${storia.unioni.length} unioni (${storia.unioni.slice(0, 3).map((u) => u.slice(0, 12)).join(", ")}): il ramo riparatore parte dalla base e non unisce niente. Si giudica di nuovo quando le unioni sono tolte`], [], { commit: storia.commit.length });
  const suoi = new Set(dove.sessione.file.map(normPerc));
  const allaBase = new Map();
  const esisteAllaBase = (p) => {
    if (!allaBase.has(p)) allaBase.set(p, gitOk(dir, ["cat-file", "-e", `${partenza}:${p}`]) !== null);
    return allaBase.get(p);
  };
  // I file delle ALTRE sessioni dell'onda: una prova che li usa insieme ai propri è comune, e chi la tocca
  // potrebbe togliere i controlli sugli altri senza cambiare il numero di asserzioni (collaudo del 12/11 sera).
  const altrui = new Set(Object.entries(dove.onda.sessioni).filter(([n]) => n !== nome).flatMap(([, x]) => (x.file ?? []).map(normPerc)));
  // Le cartelle alla base e i file che contengono: una prova che passa al setaccio una cartella intera non è di
  // chi possiede UN file di quella cartella (radiografia del 12/11 notte).
  const sottoCartella = new Map();
  const fileSotto = (x) => {
    if (!sottoCartella.has(x)) {
      const tipo = (gitOk(dir, ["cat-file", "-t", `${partenza}:${x}`]) ?? "").trim();
      sottoCartella.set(x, tipo === "tree" ? voci0(gitOk(dir, ["ls-tree", "-r", "-z", "--name-only", partenza, "--", x]) ?? "", false).map(([, f]) => f) : null);
    }
    return sottoCartella.get(x);
  };
  // Chi importa una prova (un aiutante delle prove usato da altre prove): se qualcun altro la importa è comune,
  // e chi la possiede «per nome» potrebbe svuotarla e indebolire le prove degli altri (radiografia del 12/11 notte).
  const importataDaAltre = (p) => {
    const stelo = basename(p).replace(/\.[^.]+$/, "");
    if (!stelo) return false;
    const trovati = (gitOk(dir, ["grep", "-l", "-z", "-F", "-e", stelo, partenza, "--"]) ?? "").split("\0").filter(Boolean).map((r) => r.slice(r.indexOf(":") + 1));
    for (const f of trovati) {
      if (f === p || !eProva(f)) continue;
      const t = gitOk(dir, ["show", `${partenza}:${f}`]);
      if (t !== null && importDi(f, t).has(p)) return true;
    }
    return false;
  };
  const importaDaSuoi = (p) => {
    const testo = gitOk(dir, ["show", `${partenza}:${p}`]);
    if (testo === null) return false;
    const importa = importDi(p, testo), nomina = percorsiNominati(p, testo);
    const usati = new Set([...importa, ...nomina]);
    if (![...usati].some((x) => suoi.has(x))) return false;
    // Condivisa: importa un file d'un'altra sessione, o NOMINA un file che esiste e non è suo (una prova che
    // gira su una lista di file: chi la tocca può togliere dal giro quelli degli altri, secondo collaudo del
    // 12/11), o nomina una CARTELLA con dentro file non suoi, o è importata da altre prove. Un aiutante comune
    // solo importato e di nessuno (lib/supabase.ts) non la rende condivisa.
    if ([...importa].some((x) => altrui.has(x))) return "condivisa";
    // Una prova che passa al setaccio cartelle intere (readdirSync, glob…) guarda anche i file degli altri, che
    // non nomina uno per uno: è comune (radiografia del 12/11 notte, 10 prove così nel sito).
    if (RE_SETACCIO.test(senzaCommentiJs(testo))) return "condivisa";
    if ([...nomina].some((x) => x !== p && !suoi.has(x) && esisteAllaBase(x) && fileSotto(x) === null)) return "condivisa";
    if ([...nomina].some((x) => { const dentro = fileSotto(x); return dentro !== null && dentro.some((f) => f !== p && !suoi.has(f)); })) return "condivisa";
    return importataDaAltre(p) ? "condivisa" : true;
  };
  const ctx = { nome, suoi, esisteAllaBase, importaDaSuoi, fascia: dove.sessione.migrazioni ?? null, casa: per.casa };
  // Un'eccezione firmata per quest'onda non ferma il rosso in silenzio: lo elenca uno per uno, con la firma.
  const derogati = [];
  ctx.deroga = (regola, perche, commit = null) => {
    const firma = eccezioneFirmata(piano, dove.onda.onda, regola, commit);
    if (!firma) return false;
    derogati.push(`${perche} [eccezione firmata, onda ${dove.onda.onda}: ${firma}]`);
    return true;
  };
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
    // Una riga spenta che c'era e si stringe soltanto (restringeIlSalto) non è una prova spenta nuova: ogni riga tolta
    // vale per una sola riga aggiunta.
    const righeDiff = diff.split("\n");
    const tolteSpente = righeDiff.filter((r) => r.startsWith("-") && !r.startsWith("---") && RE_SPENTA.test(r)).map((r) => r.slice(1));
    const spenteNuove = righeDiff.filter((r) => r.startsWith("+") && !r.startsWith("+++") && RE_SPENTA.test(r)).filter((r) => {
      const i = tolteSpente.findIndex((t) => restringeIlSalto(t, r.slice(1)));
      if (i < 0) return true;
      tolteSpente.splice(i, 1);
      return false;
    });
    if (spenteNuove.length) rossi.push(`${p}: aggiunge una prova spenta (.skip, .only, .todo, .fails, .skipIf, { skip: }, xit): una prova non si spegne per farla passare`);
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
  for (const c of senzaVoce) {
    const perche = `${c.commit.slice(0, 12)}: un commit di codice che non comincia con l'id di una voce di ${nome} («${nome}-NNN …», oppure «${nome}-varie …»)`;
    // Si sospende solo con la firma su QUESTO commit (REGOLE_PER_COMMIT), e la deroga lo elenca.
    if (!ctx.deroga("id_nel_commit", perche, c.commit)) rossi.push(perche);
  }
  // Anche la voce altrui citata nel messaggio si sospende solo con la firma su QUESTO commit: Nicola ha firmato
  // «id_nel_commit» su sei commit di R02, R03, R06 il 18/11 alle 12:52, ma senza questa riga la firma non contava
  // e le chiusure di mycity#297 restavano ferme (regia 5.0 dell'onda 9, firma di Nicola del 20/11).
  // ⚠️ Un nome solo, «id_nel_commit», copre i due controlli sull'id dello stesso commit: la firma su un commit
  // sospende sia «non comincia con l'id» sia «cita una voce altrui». Così si riattivano anche le 4 firme di R29
  // dell'onda 4 (4fd7d59d, 038ddd6a, f734e255, 2c9f8412): è quello che Nicola aveva firmato (DECISIONI 17/11 14:15).
  for (const c of storia.perCommit) for (const id of c.messaggio.match(/\b[A-Z]\d{2}-\d{3}\b/g) || []) {
    if (ids.has(id)) continue;
    const perche = `${c.commit.slice(0, 12)}: il messaggio cita ${id}, che non è una voce di ${nome}`;
    if (!ctx.deroga("id_nel_commit", perche, c.commit)) rossi.push(perche);
  }
  const attese = !storia.commit.length ? [`${nome}: il ramo non ha ancora nessun commit suo`]
    : !netto.size ? [`${nome}: il ramo ha ${storia.commit.length} commit ma alla fine non cambia nessun file: non c'è niente da giudicare, non è un verde`] : [];
  return esito(rossi, attese, { commit: storia.commit.length, file_toccati: netto.size, ...(rimessi.length ? { toccati_e_rimessi_com_erano: rimessi } : {}), ...(derogati.length ? { eccezioni_firmate: derogati } : {}) }, rimessi);
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
      // Un grave riparato si dimostra col programma che toglie la correzione e vede la prova cadere: una rimessa
      // raccontata a mano («git checkout HEAD^ … → 2 rosse») non la rifà nessuno (officina minima del 15/11).
      else if (ctx.misura === true && grave && !/prova-rimessa\.mjs/.test(String(v.rimessa.comando))) rossi.push(`${dove}: un ${attesa.gravita} riparato vuole la prova che diventa rossa togliendo la correzione (cervello/prova-rimessa.mjs), non una rimessa scritta a mano`);
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
    if (v.esito === "verificata_dopo_nicola" && (vuoto(v.prova_comando) || !aManoValida(v.rimessa))) rossi.push(`${dove}: verificata dopo Nicola senza «prova_comando» e «rimessa» {comando, uscita_senza_correzione ≠ 0 prima della sua mossa, uscita_con_correzione 0 dopo}`);
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
  // Le tre regole del 15/11 (misura, tetto, rimessa del grave) le applica valida-referto (ctx.misura): `applica`
  // rilegge anche i referti delle campagne di prima, scritti quando quei campi non esistevano.
  if (r.finita === true && ctx.misura === true) {
    // La misura della sessione sta nel referto (regola R-H): senza, il preventivo dell'onda dopo non ha base e il
    // freno sugli agenti non si controlla dopo. R13 non aveva un costo, quello di R14 era stimato a mano.
    const tetto = TETTO_SUBAGENTI[ctx.voci.some((v) => GRAVI.has(v.gravita)) ? "riparatore-gravi" : "riparatore-minori"];
    const sub = r.conto?.subagenti, costo = r.costo_usd ?? r.conto?.costo_usd;
    if (!Number.isInteger(sub) || sub < 0) rossi.push("a referto finito manca «conto.subagenti», il numero di subagenti aperti (contali tutti, anche quelli fermati)");
    else if (sub > tetto) rossi.push(`${sub} subagenti, oltre il tetto di ${tetto} della scheda`);
    if (!(typeof costo === "number" && costo > 0)) rossi.push("a referto finito manca «costo_usd», letto con get_session (senza id) prima della consegna");
  }
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
  const { rossi, attese } = regoleReferto(testo, { nome, voci: dove.sessione.voci, chiaviDelRegistro, commitDelRamo, testaDelRamo, soloRefertoDopo, misura: true });
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
/**
 * I giudizi pieni degli ALTRI collaudi finiti, voce per voce (fra due pieni vince il peggiore). PURA.
 * Servono a valida-collaudo e ad applica per guardare il giudizio pieno sull'unione dei collaudi, non dentro ognuno.
 */
export function pieniAltrove(collaudi, tranne) {
  const peso = { rompe_altro: 3, non_regge: 2, parziale: 1, regge: 0 };
  const fuori = new Map();
  for (const c of collaudi ?? []) {
    if (!c || c.collaudatore === tranne || c.finita !== true) continue;
    for (const v of c.voci ?? []) {
      if (v?.giudizio !== "pieno" || !(c.riparatori ?? []).includes(String(v.id ?? "").slice(0, 3))) continue;
      const prima = fuori.get(v.id);
      if (!prima || (peso[v.verdetto] ?? 3) > (peso[prima.verdetto] ?? 3)) fuori.set(v.id, { ...v, collaudatore: c.collaudatore });
    }
  }
  return fuori;
}
/** ctx: { nome, riparatori: {RNN: {voci:[{id,chiave,gravita,file}], referto|null}}, hub:Set, deroga?(regola, perché, RNN), altrui?: Map } */
export function regoleCollaudo(testo, ctx) {
  const rossi = [], attese = [];
  // Un rosso che un'eccezione firmata sospende nell'onda del riparatore non entra fra i rossi (la deroga lo annota).
  const nonDerogato = (regola, perche, r) => (typeof ctx.deroga === "function" && ctx.deroga(regola, perche, r) ? [] : [perche]);
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
  // Un collaudo parziale («parziale: true») guarda solo le voci che elenca: le altre restano senza collaudo.
  const parziale = c.parziale === true;
  if (parziale && Object.values(c.campione ?? {}).some((x) => x?.accettato === true)) rossi.push("un collaudo parziale non dichiara un campione accettato: il campione si conta sull'unione dei collaudi");
  const altrui = ctx.altrui instanceof Map ? ctx.altrui : new Map();
  for (const [r, info] of Object.entries(ctx.riparatori)) {
    if (!info.referto) { attese.push(`${r}: il referto del riparatore non c'è ancora`); continue; }
    // Un referto non finito è una fotografia di metà lavoro: collaudarlo dà un verde su voci che cambieranno
    // (secondo collaudo del 7/11: letto alla «testa», il referto era quello intermedio, 1 voce su 2).
    if (info.referto.finita !== true) { rossi.push(`${r}: il referto del riparatore non è finito; si collauda il referto finito, letto alla PUNTA del suo ramo`); continue; }
    const scheda = new Map(info.voci.map((v) => [v.id, v]));
    const daCollaudare = info.referto.voci.filter((v) => ["riparato", "parziale", "gia_riparato_prima", "verificata_dopo_nicola"].includes(v.esito));
    // La regola «niente campione fino a 40 voci» (15/11) vale solo per i collaudi nuovi, cioè dietro ctx.misura come le
    // regole nuove del referto: valida-collaudo la applica, applica no. Su un collaudo scritto prima, quando il campione
    // era ammesso, riapriva voci già chiuse a campione accettato (collaudo dell'officina minima, 15/11: 7 voci della
    // campagna del 12/11, R08-010 … R16-016, e applica rosso con 18 problemi). In applica la regola non ferma: tiene
    // aperte le voci, dentro decidi, dall'onda scritta in `campione_fino_a_40_dall_onda` del piano (AR-1184).
    const senzaCampione = ctx.misura === true && info.voci.length <= LOTTO_SENZA_CAMPIONE;
    const minori = [];
    for (const rv of daCollaudare) {
      const s = scheda.get(rv.id);
      const cv = perId.get(rv.id);
      if (!s) continue;
      if (!cv) { if (!parziale) (c.finita === true ? rossi : attese).push(`${rv.id}: ${rv.esito} nel referto di ${r}, manca nel collaudo`); continue; }
      if (cv.chiave !== s.chiave) rossi.push(`${rv.id}: la chiave del collaudo non è quella della scheda`);
      if (!VERDETTI.includes(cv.verdetto)) { rossi.push(`${rv.id}: verdetto «${cv.verdetto}» non è uno di ${VERDETTI.join("|")}`); continue; }
      if (!GIUDIZI.includes(cv.giudizio)) rossi.push(`${rv.id}: giudizio «${cv.giudizio}» non è uno di ${GIUDIZI.join("|")}`);
      const lentiTutte = Array.isArray(cv.lenti) && LENTI.every((l) => cv.lenti.includes(l));
      const senzaRimessa = ["gia_riparato_prima", "verificata_dopo_nicola"].includes(rv.esito);
      if (!senzaRimessa) {
        if (!Number.isInteger(cv.rimessa?.uscita) || vuoto(cv.rimessa?.comando)) rossi.push(`${rv.id}: manca la prova rimessa lanciata dal collaudatore (uscita e comando)`);
        // Un minore a uscita 3 regge con la rimessa a mano e il giudizio pieno, ma solo dove Nicola ha firmato la
        // deroga «rimessa_a_mano» per l'onda (officina minima del 15/11). Per gravi e bloccanti niente cambia.
        const aMano = !GRAVI.has(s.gravita) && cv.rimessa?.uscita === 3 && cv.giudizio === "pieno" && aManoValida(cv.rimessa?.a_mano);
        if (cv.verdetto === "regge" && cv.rimessa?.uscita !== 0) rossi.push(...(aMano ? nonDerogato("rimessa_a_mano", `${rv.id}: «regge» con la prova rimessa uscita 3 e la rimessa a mano: vale solo con l'eccezione firmata «rimessa_a_mano» nell'onda`, r) : [`${rv.id}: «regge» con la prova rimessa uscita ${cv.rimessa?.uscita}, non 0`]));
        // La prova rimessa del collaudo toglie davvero la correzione: apply.sh + run.sh, o un comando qualunque,
        // sono verdi qualunque cosa faccia la correzione (radiografia del 12/11 notte).
        if (cv.verdetto === "regge" && !vuoto(cv.rimessa?.comando) && !/prova-rimessa\.mjs/.test(String(cv.rimessa.comando))) rossi.push(...nonDerogato("rimessa_a_mano", `${rv.id}: «regge» con una prova rimessa che non è prova-rimessa.mjs: un comando che non toglie la correzione non prova niente`, r));
        if (cv.verdetto === "regge" && /--sql\b/.test(String(rv.rimessa?.comando ?? "")) && !/--sql\b/.test(String(cv.rimessa?.comando ?? ""))) rossi.push(`${rv.id}: il riparatore l'ha provata con --sql e il collaudo no: una migrazione si prova ricostruendo il database con e senza`);
      }
      if (cv.verdetto === "regge" && cv.giudizio === "pieno" && !lentiTutte) rossi.push(`${rv.id}: un giudizio pieno porta tutte e due le lenti (${LENTI.join(", ")})`);
      if ((GRAVI.has(s.gravita) || senzaRimessa) && cv.verdetto === "regge" && cv.giudizio !== "pieno") rossi.push(`${rv.id}: un ${rv.esito === "gia_riparato_prima" ? "«già riparato»" : rv.esito === "verificata_dopo_nicola" ? "«verificata dopo Nicola»" : s.gravita} regge solo con un giudizio pieno`);
      if (!GRAVI.has(s.gravita) && rv.esito === "riparato") {
        minori.push({ id: rv.id, file: s.file });
        if (senzaCampione && cv.verdetto === "regge" && cv.giudizio !== "pieno" && altrui.get(rv.id)?.giudizio !== "pieno") (c.finita === true ? rossi : attese).push(`${rv.id}: minore riparato senza giudizio pieno: in un lotto di ${info.voci.length} voci (fino a ${LOTTO_SENZA_CAMPIONE}) il campione non esiste`);
      }
    }
    // Il campione si conta sull'unione: un pieno di un altro collaudo vale come voce guardata.
    const perIdUnione = new Map(perId);
    for (const [id, v] of altrui) if (perIdUnione.get(id)?.giudizio !== "pieno") perIdUnione.set(id, v);
    const camp = campioneDi(minori, perIdUnione, ctx.hub);
    campioni[r] = camp;
    const dichiarato = c.campione?.[r]?.accettato;
    if (!senzaCampione && dichiarato === true && !camp.accettato) rossi.push(`${r}: il campione è dichiarato accettato ma non lo è (${camp.reggono} reggono su ${camp.nel_campione} guardati, ne servivano ${camp.servono}${camp.hub_mancanti.length ? `, ${camp.hub_mancanti.length} sui file che legano non guardati` : ""})`);
    if (!senzaCampione && !parziale && c.finita === true && camp.nel_campione < camp.servono) rossi.push(`${r}: campione troppo piccolo: ${camp.nel_campione} minori guardati con giudizio, ne servono ${camp.servono}`);
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
  const derogatiK = [];
  const altriK = leggiCartellaJson(join(serveCartella(opz), "collaudi"), /^K\d{2}\.json$/);
  const { rossi, attese, campioni } = regoleCollaudo(testo, { nome: c.collaudatore, riparatori, hub: fileHub(per.lavorabili), deroga: derogaCollaudo(piano, derogatiK), altrui: pieniAltrove(altriK, c.collaudatore), misura: true });
  stampaEccezioni(derogatiK);
  for (const r of fuoriPiano) rossi.push(`${r} non è nel piano`);
  const sess = leggiSessioni(opz);
  for (const r of elenco) {
    const idR = sess?.sessioni?.[r]?.id, idK = sess?.collaudatori?.[c.collaudatore]?.id;
    if (idR && idK && idR === idK) rossi.push(`${c.collaudatore} e ${r} sono la stessa sessione: chi ripara non collauda`);
  }
  return chiudi("valida-collaudo", rossi, attese, opz, { campioni, ...(derogatiK.length ? { eccezioni_firmate: derogatiK } : {}) });
}

// ── prova-unione ─────────────────────────────────────────────────────────────────────────────────
/** Il deposito dove vivono i rami dei riparatori di questa campagna: lo usa sorveglia.sh, che prima lo indovinava. */
function deposito(opz) {
  let per;
  try { per = leggiPerimetro(opz); } catch (e) { return cieco("deposito", e.message, opz); }
  const dir = resolve(opz.git ?? repoDi(per.casa, opz));
  if (gitOk(dir, ["rev-parse", "--git-dir"]) === null) { console.error(`🔴 deposito: ${dir} non è un deposito git (casa ${per.casa}): non posso sorvegliare`); return 2; }
  console.log(dir);
  return 0;
}
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
    // Il diff netto, come la guardia (radiografia del 12/11 notte): un file toccato e rimesso non entra nell'unione.
    for (const [, f] of voci0(gitOk(dir, ["diff", "-z", "--name-only", "--no-renames", o.base, ref]) ?? "", false)) {
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
export function decidi({ piano, referti, collaudi, hub, misura = false, misuraDallOnda = null }) {
  const decisioni = [];
  const verdetti = new Map();
  // Il verdetto più severo fra quelli SENZA giudizio pieno, voce per voce: se un pieno lo batte, la decisione lo dice
  // in «avviso» invece di farlo sparire (collaudo dell'officina minima, 15/11, minore 4: un «rompe_altro» di K07
  // spariva sotto il «regge» pieno di K10 senza lasciare traccia).
  const scartati = new Map();
  // Un collaudatore giudica solo i riparatori che elenca: il collaudo del 7/11 ha fatto chiudere un grave di R01
  // con il «regge» di K02, che guardava R02, sopra il «non regge» di K01. Fra due verdetti vince il più severo.
  const SEVERITA_VERDETTO = { rompe_altro: 3, non_regge: 2, parziale: 1, regge: 0 };
  for (const c of collaudi) for (const v of c.voci ?? []) {
    const suo = String(v?.id ?? "").slice(0, 3);
    if (!Array.isArray(c.riparatori) || !c.riparatori.includes(suo)) continue;
    const prima = verdetti.get(v.id);
    const peso = SEVERITA_VERDETTO[v.verdetto] ?? 3;
    const pesoPrima = prima ? (SEVERITA_VERDETTO[prima.verdetto] ?? 3) : -1;
    // Un giudizio pieno batte sempre uno che non lo è; fra due dello stesso tipo vince il peggiore (officina minima
    // del 15/11: K07 senza giudizio su R18, K10 col pieno sulle stesse voci; applica le teneva aperte).
    // Un collaudo non finito non presta il giudizio pieno: le sue voci contano come giudicate senza pieno (minore 5
    // dello stesso collaudo: pronte chiudeva voci col pieno di un collaudo non ancora consegnato).
    const pieno = v.giudizio === "pieno" && c.finita === true, pienoPrima = prima?.giudizio === "pieno";
    const voce = { ...v, giudizio: pieno ? "pieno" : v.giudizio === "pieno" ? "nessuno" : v.giudizio, collaudatore: c.collaudatore };
    if (!pieno && peso > (SEVERITA_VERDETTO[scartati.get(v.id)?.verdetto] ?? -1)) scartati.set(v.id, voce);
    if (!prima || (pieno && !pienoPrima) || (pieno === pienoPrima && peso > pesoPrima)) verdetti.set(v.id, voce);
  }
  for (const o of piano.onde) {
    // La regola dei 40: sempre con misura (valida-collaudo, le prove), e per applica e pronte dall'onda del piano.
    const misuraQui = misura === true || (Number.isInteger(misuraDallOnda) && o.onda >= misuraDallOnda);
    for (const [nome, s] of Object.entries(o.sessioni)) {
      const ref = referti[nome];
      const perIdC = new Map([...verdetti].filter(([id]) => id.startsWith(`${nome}-`)));
      const minori = (ref?.voci ?? []).filter((v) => v.esito === "riparato" && !GRAVI.has(s.voci.find((x) => x.id === v.id)?.gravita)).map((v) => ({ id: v.id, file: s.voci.find((x) => x.id === v.id)?.file ?? [] }));
      const camp = campioneDi(minori, perIdC, hub);
      for (const sv of s.voci) {
        const rv = ref?.voci?.find((v) => v.id === sv.id);
        const cv = verdetti.get(sv.id);
        const d = { id: sv.id, sessione: nome, chiave: sv.chiave, gravita: sv.gravita, esito: rv?.esito ?? "senza_referto", verdetto: cv?.verdetto ?? null, collaudatore: cv?.collaudatore ?? null, decisione: "resta_aperta", perche: "" };
        const sc = scartati.get(sv.id);
        if (cv?.giudizio === "pieno" && sc && (SEVERITA_VERDETTO[sc.verdetto] ?? 3) > (SEVERITA_VERDETTO[cv.verdetto] ?? 3)) d.avviso = `${sc.collaudatore} dice «${sc.verdetto}» senza giudizio pieno; vince il «${cv.verdetto}» pieno di ${cv.collaudatore}`;
        if (!rv) d.perche = "il riparatore non l'ha scritta nel referto";
        else if (rv.esito === "riparato") {
          const minore = !GRAVI.has(sv.gravita);
          // Officina minima del 15/11: un minore la cui prova rimessa esce 3 (rossa per la struttura) si chiude con la
          // rimessa a mano del collaudatore e il giudizio pieno, solo dove Nicola ha firmato «rimessa_a_mano» per
          // l'onda. K02: 5 minori fermi a «parziale» con giudizio pieno solo per questa regola. Gravi invariati.
          const usc = [rv.rimessa?.uscita, cv?.rimessa?.uscita];
          const aMano = minore && usc.includes(3) && usc.every((u) => u === 0 || u === 3) && cv?.verdetto === "regge" && cv.giudizio === "pieno" && aManoValida(cv.rimessa?.a_mano) && !!eccezioneFirmata(piano, o.onda, "rimessa_a_mano");
          if (rv.rimessa?.uscita !== 0 && !aMano) d.perche = "la prova rimessa del riparatore non regge";
          else if (!cv) d.perche = "nessun collaudo";
          else if (cv.verdetto !== "regge") d.perche = `collaudo: ${cv.verdetto}`;
          else if (cv.rimessa?.uscita !== 0 && !aMano) d.perche = minore && usc.includes(3) ? "prova rimessa a uscita 3: un minore chiude solo con la deroga firmata «rimessa_a_mano», il giudizio pieno e rimessa.a_mano" : "la prova rimessa del collaudatore non è uscita 0";
          else if (GRAVI.has(sv.gravita) && cv.giudizio !== "pieno") d.perche = "un grave senza giudizio pieno";
          else if (misuraQui && minore && cv.giudizio !== "pieno" && s.voci.length <= LOTTO_SENZA_CAMPIONE) d.perche = `minore senza giudizio pieno: in un lotto di ${s.voci.length} voci il campione non esiste`;
          else if (minore && cv.giudizio !== "pieno" && !camp.accettato) d.perche = `minore fuori campione, e il campione di ${nome} non è accettato`;
          else {
            d.decisione = "si_chiude";
            d.come = aMano ? "collaudo pieno, rimessa a mano (deroga firmata)" : cv.giudizio === "pieno" ? "collaudo pieno" : "campione";
            d.verifica_comando = rv.prova_comando;
            d.non_vacuita = aMano
              ? `${cv.rimessa.a_mano.comando} → uscita ${cv.rimessa.a_mano.uscita_senza_correzione} senza la correzione, 0 con (${cv.collaudatore}, a mano)`
              : `${rv.rimessa.comando} → uscita 0 (riparatore); ${cv.rimessa.comando} → uscita 0 (${cv.collaudatore})`;
            d.nota_fix = rv.cosa_ho_fatto ?? "";
          }
        } else if (rv.esito === "verificata_dopo_nicola") {
          // Una voce non di codice sistemata da Nicola (una chiave, un'impostazione): chiude solo con la prova che oggi
          // passa, la rimessa che prima della sua mossa falliva, e il giudizio pieno di un'altra sessione.
          if (vuoto(rv.prova_comando) || !aManoValida(rv.rimessa)) d.perche = "verificata dopo Nicola senza la prova e la rimessa (rossa prima della sua mossa, verde dopo)";
          else if (!cv) d.perche = "nessun collaudo";
          else if (cv.verdetto !== "regge" || cv.giudizio !== "pieno") d.perche = `collaudo: ${cv.verdetto}${cv.giudizio !== "pieno" ? " senza giudizio pieno" : ""}`;
          else if (vuoto(cv.collaudatore) || cv.collaudatore === nome) d.perche = "va collaudata da un'altra sessione";
          else {
            d.decisione = "si_chiude";
            d.come = "verificata dopo Nicola, collaudo pieno";
            d.verifica_comando = rv.prova_comando;
            d.non_vacuita = `${rv.rimessa.comando} → uscita ${rv.rimessa.uscita_senza_correzione} prima, 0 dopo (${cv.collaudatore})`;
            d.nota_fix = rv.nota ?? rv.cosa_ho_fatto ?? "";
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
  let per, piano, dallOndaCampione;
  try { per = leggiPerimetro(opz); piano = leggiPiano(opz); dallOndaCampione = campioneFinoA40DallOnda(piano); } catch (e) { return cieco("applica", e.message, opz); }
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
  const collaudiPerNome = Object.fromEntries(lettiK.filter((x) => x.dati).map((x) => [x.nome.replace(/\.json$/, ""), x.dati]));
  for (const k of kFinitiMaAperti(sess, collaudiPerNome)) ferma.push(`collaudi/${k}.json: sessioni.json dice che ${k} ha finito, ma il collaudo ha ancora finita:false (le sue voci risultano senza collaudo): copia qui il collaudo finito dal suo ramo`);
  const senzaStoria = [];
  const eccezioni = [];
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
    // La guardia del ramo si rilancia qui: la skill lo prometteva e non succedeva, e il 12/11 tre rami con la guardia
    // rossa si sono uniti e chiusi (radiografia del 12/11 notte). Con --scrivi --git è obbligatoria.
    if (opz.git && ramo) {
      const g = giudicaRamo(opz, per, piano, ramo, nome);
      for (const r of g.rossi) ferma.push(`referti/${file}: guardia-ramo: ${r}`);
      for (const e of g.extra?.eccezioni_firmate ?? []) eccezioni.push(`referti/${file}: guardia-ramo: ${e}`);
    }
    // La verifica legata allo SHA è obbligatoria anche qui: l'attesa di valida-referto da sola non fermava niente
    // (collaudo del 12/11 notte). Vale da `verifica_testa_dall_onda` del piano (predefinito 1): la campagna del
    // 12/11 la mette a 2, perché i referti della sua onda 1 sono nati prima della regola. Prima era «dall'onda 2»
    // per tutte, e nell'onda 1 di ogni campagna futura non valeva mai (radiografia del 12/11 notte).
    const dallOnda = Number(piano.verifica_testa_dall_onda) || 1;
    if (dove.onda.onda >= dallOnda && dati.finita === true && vuoto(dati.verifica?.testa)) ferma.push(`referti/${file}: un referto finito dice su quale commit è girata la verifica («verifica.testa»)`);
    if (dati.finita !== true) ferma.push(`referti/${file}: il referto non è finito`);
    referti[nome] = dati;
  }
  const hub = fileHub(per.lavorabili);
  const collaudi = [];
  const tuttiK = lettiK.map((x) => x.dati).filter(Boolean);
  for (const { nome: file, testo, dati } of lettiK) {
    if (!dati) { ferma.push(`collaudi/${file}: non è JSON`); continue; }
    if (dati.collaudatore !== file.replace(/\.json$/, "")) { ferma.push(`collaudi/${file}: dice di essere «${dati.collaudatore}»`); continue; }
    const elenco = Array.isArray(dati.riparatori) ? dati.riparatori : [];
    if (!elenco.length) ferma.push(`collaudi/${file}: non dice quali riparatori guarda`);
    const riparatori = Object.fromEntries(elenco.map((r) => [r, { voci: sessioneNelPiano(piano, r)?.sessione.voci ?? [], referto: referti[r] ?? null }]));
    const derogatiK = [];
    const { rossi } = regoleCollaudo(testo, { nome: dati.collaudatore, riparatori, hub, deroga: derogaCollaudo(piano, derogatiK), altrui: pieniAltrove(tuttiK, dati.collaudatore) });
    for (const r of rossi) ferma.push(`collaudi/${file}: ${r}`);
    for (const e of derogatiK) eccezioni.push(`collaudi/${file}: ${e}`);
    if (dati.finita !== true) ferma.push(`collaudi/${file}: il collaudo non è finito`);
    collaudi.push(dati);
  }
  stampaEccezioni(eccezioni);
  // I sospesi viaggiano nel JSON anche quando applica si ferma: a schermo se ne stampano 40 (collaudo del 13/11).
  const conEccezioni = (extra = {}) => (eccezioni.length ? { ...extra, eccezioni_firmate: eccezioni } : extra);
  if (ferma.length) return chiudi("applica", ferma, [], opz, conEccezioni());
  // La regola dei 40 dall'onda del piano (AR-1184): prima applica chiamava decidi senza, e chiudeva R16-014, -015 e
  // -016 col campione di K08 su un lotto di 21 voci, mentre valida-collaudo dava 6 rossi.
  const decisioni = conIControlli(decidi({ piano, referti, collaudi, hub, misuraDallOnda: dallOndaCampione }), controlli);
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
  const avvisi = decisioni.filter((d) => d.avviso).map((d) => `${d.id}: ${d.avviso}`);
  for (const a of avvisi) console.log(`⚠️  ${a}`);
  console.log(`🧾 ${decisioni.length} voci: ${chiude.length} si chiudono (dopo l'unione), ${gia.length} erano già riparate, ${restano.length} restano aperte · ${nati.length} difetti nati`);
  // i frammenti per chiudi-sito.mjs (sito) o la lista per auto-fix (macchina): si applicano DOPO l'unione
  const perSessione = new Map();
  for (const d of chiude) { if (!perSessione.has(d.sessione)) perSessione.set(d.sessione, []); perSessione.get(d.sessione).push(d); }
  const frammenti = [...perSessione].map(([s, ds]) => ({
    corsia: numeroSessione(s), territorio: s,
    difetti: ds.map((d) => ({ chiave: d.chiave, esito: "riparato", verifica_comando: d.verifica_comando, non_vacuita: d.non_vacuita, nota_fix: d.nota_fix })),
  }));
  scriviJson(join(cartella, "decisioni.json"), { campagna: nomeCampagna, quando, decisioni, ...(fuoriCampagna.length ? { rosse_fuori_campagna: fuoriCampagna } : {}), ...(avvisi.length ? { avvisi } : {}), ...(eccezioni.length ? { eccezioni_firmate: eccezioni } : {}) });
  if (!opz.scrivi) {
    console.log("   (a vuoto: ho scritto solo decisioni.json. Con --scrivi scrivo i frammenti e il registro.)");
    const attese = senzaStoria.length ? [`commit e testa non controllati sulla storia del ramo per ${senzaStoria.join(", ")} (servono --git e sessioni.json)`] : [];
    if (fuoriCampagna.length) attese.push(`${fuoriCampagna.length} voci rosse dei controllori non sono di questa campagna: vanno dette a Nicola (in decisioni.json, rosse_fuori_campagna)`);
    return chiudi("applica", [], attese, opz, conEccezioni({ si_chiudono: chiude.length, gia: gia.length, restano: restano.length, nati: nati.length }));
  }
  for (const f of frammenti) scriviJson(join(cartella, "frammenti", `esito-${f.corsia}.json`), f);
  let reg;
  try { reg = leggiRegistro(per.casa, opz); } catch (e) { return cieco("applica", e.message, opz); }
  const perChiave = new Map(reg.elenco.map((d) => [chiaveDi(per.casa, d), d]));
  const rossi = [];
  for (const d of [...gia, ...restano, ...chiude]) if (!perChiave.has(d.chiave)) rossi.push(`la chiave «${d.chiave}» non aggancia niente nel registro`);
  if (rossi.length) return chiudi("applica", rossi, [], opz, conEccezioni());
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
  // Gli id AR nuovi della macchina li dà prossimo-ar.mjs: lì la regista li registra a mano.
  const { scritti, gianoti, riservati } = per.casa === "sito"
    ? scriviNatiSito(reg, nati, { campagna: nomeCampagna, perChiave })
    : { scritti: [], gianoti: [], riservati: nati.filter((n) => n.riservato === true) };
  if (per.casa === "macchina" && nati.length) scriviJson(join(cartella, "nati-macchina.json"), nati.filter((n) => n.riservato !== true));
  scriviJsonAtomico(reg.percorso, reg.grezzo);
  console.log(`   frammenti: ${frammenti.length} · nati scritti: ${scritti.length} (già noti ${gianoti.length}, riservati fuori ${riservati.length})${per.casa === "macchina" ? ` · prove a pattern tolte: ${tolte}` : ""}`);
  console.log(per.casa === "sito"
    ? `   dopo l'unione: node cervello/chiudi-sito.mjs ${join(cartella, "frammenti")} --applica --pr <N> --commit <sha>`
    : "   dopo l'unione: node cervello/auto-fix.mjs verifica --applica");
  return chiudi("applica", [], [], opz, conEccezioni({ si_chiudono: chiude.length, gia: gia.length, restano: restano.length, nati_scritti: scritti.length }));
}

// ── conti ────────────────────────────────────────────────────────────────────────────────────────
function conti(opz) {
  let per, piano;
  try { per = leggiPerimetro(opz); piano = leggiPiano(opz); } catch (e) { return cieco("conti", e.message, opz); }
  if (opz.preventivo) return contiPreventivo(opz, piano);
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
  let statoOra = {}, elencoReg = null;
  try {
    const reg = leggiRegistro(per.casa, opz);
    elencoReg = reg.elenco;
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
  // Senza decisioni.json il controllo qui sopra non si fa: lo si dice, invece di uscire verdi (radiografia del 12/11 notte).
  const senzaDecisioni = !dec.length && assegnate > 0 ? [`decisioni.json non c'è o è vuoto: il controllo «nessuna voce dimenticata» non è fatto (si scrive con applica)`] : [];
  // Una PR dell'onda unita col registro non scritto: le voci chiuse restano aperte per tutti gli altri (la #290).
  const repo = resolve(opz.git ?? repoDi(per.casa, opz));
  const unita = (testa) => {
    if (gitOk(repo, ["rev-parse", "--verify", "--quiet", `${testa}^{commit}`]) === null || gitOk(repo, ["rev-parse", "--verify", "--quiet", "origin/main"]) === null) return null;
    return gitOk(repo, ["merge-base", "--is-ancestor", testa, "origin/main"]) !== null;
  };
  const pr = elencoReg ? prUniteSenzaRegistro({ sess: leggiSessioni(opz), piano, elenco: elencoReg, unita }) : { rossi: [], attese: [] };
  rossi.push(...pr.rossi);
  console.log(`📊 perimetro ${per.lavorabili.length} lavorabili · assegnate ${assegnate} in ${piano.onde.length} onde · cucitura ${piano.cucitura?.length ?? 0} · eccedenza ${piano.eccedenza?.length ?? 0}`);
  console.log(`   esiti dei riparatori: ${Object.entries(esiti).map(([k, v]) => `${v} ${k}`).join(", ") || "nessun referto"}`);
  if (dec.length) console.log(`   decisioni: ${Object.entries(perDec).map(([k, v]) => `${v} ${k}`).join(", ")}`);
  if (statoOra) console.log(`   nel registro adesso, per le chiavi del perimetro: ${Object.entries(statoOra).map(([k, v]) => `${v} ${k}`).join(", ")}`);
  return chiudi("conti", rossi, [...senzaDecisioni, ...pr.attese, ...(statoOra ? [] : ["il registro non si legge"])], opz, { lavorabili: per.lavorabili.length, assegnate, esiti, decisioni: perDec, registro: statoOra });
}

// ── avvio ────────────────────────────────────────────────────────────────────────────────────────
// ── segnali e stato: la sorveglianza muta (officina minima del 15/11, pezzo 2) ───────────────────
// Regia dell'onda 2: 407,68 $ con 12 registe, e il 14/11 alle 12:32 e alle 13:34 giri di sorveglianza con nessuna
// figlia viva. Un giro a vuoto costa circa 0,73 $. Qui la regista dorme finché non succede una cosa NUOVA:
// `segnali` dice cosa è cambiato rispetto a <C>/rossi-noti.txt, `sorveglia.sh --attendi` lo chiede in un ciclo
// in sottofondo, e `stato` riassume la campagna in 40 righe al massimo.
// Quello che da qui non si vede (figlia in attesa di un clic, spesa, quota) arriva da <C>/stato-sessioni.json, che
// scrive chi vede get_session: { aggiornato, spesa_usd, quota: {status, isUsingOverage}, sessioni: {R07: {stato}} }.
export const MINUTI_FERMA = 20;
export const SOGLIA_SPESA = 0.7;
export const RIGHE_STATO = 40;

/**
 * I segnali che svegliano la regista, uno per riga e con l'identità dentro: «ferma R07 abc1234» resta noto finché
 * il ramo non si muove, e torna nuovo se si ferma di nuovo su un'altra testa. PURA.
 * @param {{ sessioni: Array<{nome, ramo, sulRemoto, finita, testa: {sha, quando}|null}>, vive?: object|null,
 *           preventivo?: {stima_usd:number}|null, ora: number }} f
 */
export function segnaliDa({ sessioni = [], vive = null, preventivo = null, ora }) {
  const out = [];
  for (const s of sessioni) {
    if (s.sulRemoto) out.push(`ramo ${s.nome} ${s.ramo}`);
    if (s.finita) out.push(`finita ${s.nome}`);
    else if (s.testa && ora - s.testa.quando > MINUTI_FERMA * 60000) out.push(`ferma ${s.nome} ${String(s.testa.sha).slice(0, 7)}`);
    if (/requires_action|blocked/i.test(String(vive?.sessioni?.[s.nome]?.stato ?? ""))) out.push(`attesa ${s.nome}`);
  }
  const stima = Number(preventivo?.stima_usd), spesa = Number(vive?.spesa_usd);
  if (stima > 0 && spesa > 0) {
    if (spesa >= stima) out.push("spesa oltre il 100% del preventivo");
    else if (spesa >= SOGLIA_SPESA * stima) out.push("spesa oltre il 70% del preventivo");
  }
  if (vive?.quota?.status === "allowed_warning") out.push("quota allowed_warning");
  if (vive?.quota?.isUsingOverage === true) out.push("quota isUsingOverage");
  return out;
}

/** I segnali che la regista non ha ancora visto: una riga di rossi-noti.txt per segnale, # per i commenti. PURA. */
export function nuoviSegnali(segnali, testoNoti) {
  const noti = new Set(String(testoNoti ?? "").split("\n").map((r) => r.trim()).filter((r) => r && !r.startsWith("#")));
  return segnali.filter((s) => !noti.has(s));
}

/** Il riassunto della campagna, mai più di RIGHE_STATO righe (si taglia dal fondo e si dice quante). PURA. */
export function testoStato({ campagna, ora, sessioni = [], nuovi = [], vive = null, preventivo = null, esiti = {} }) {
  const r = [`📋 ${campagna} · ${ora}`];
  for (const [tipo, nomeTipo] of [["R", "riparatori"], ["K", "collaudatori"], ["C", "controllori"]]) {
    const mie = sessioni.filter((s) => s.tipo === tipo);
    if (!mie.length) continue;
    const fin = mie.filter((s) => s.finita), vivi = mie.filter((s) => !s.finita);
    r.push(`${nomeTipo}: ${vivi.length} in lavoro${vivi.length ? ` (${vivi.map((s) => s.nome).join(" ")})` : ""}, ${fin.length} finiti`);
  }
  const conti = Object.entries(esiti).filter(([, n]) => n > 0).map(([e, n]) => `${e} ${n}`).join(", ");
  r.push(`esiti nei referti: ${conti || "nessun referto letto"}`);
  const stima = Number(preventivo?.stima_usd), spesa = Number(vive?.spesa_usd);
  r.push(spesa > 0 ? `spesa: ${spesa.toFixed(2)} ${stima > 0 ? ` su ${stima.toFixed(2)} $ di preventivo (${Math.round((100 * spesa) / stima)}%)` : " (preventivo non scritto: conti --preventivo)"}`
    : "spesa: non nota (stato-sessioni.json non c'è o non ha spesa_usd)");
  r.push(nuovi.length ? `segnali nuovi: ${nuovi.length}` : "segnali nuovi: nessuno");
  for (const n of nuovi) r.push(`  🔴 ${n}`);
  const tutteFinite = sessioni.length > 0 && sessioni.every((s) => s.finita);
  r.push(`prossima azione: ${nuovi.length ? "guarda i segnali nuovi, poi aggiungili a rossi-noti.txt" : tutteFinite ? "tutte finite: applica" : "bash cervello/riparazione/sorveglia.sh --attendi <C> <onda> in sottofondo"}`);
  if (r.length <= RIGHE_STATO) return r;
  const tagliate = r.length - (RIGHE_STATO - 1);
  return [...r.slice(0, RIGHE_STATO - 2), `  … e altre ${tagliate} righe (tutto in segnali --tutti)`, r[r.length - 1]];
}

// I fatti dai rami già scaricati (il fetch lo fa sorveglia.sh) e dai file della campagna.
function fattiDellaCampagna(opz) {
  const dir = serveCartella(opz);
  const sess = leggiSessioni(opz);
  if (!sess) throw new Error(`${join(dir, "sessioni.json")} non c'è: nessuna sessione da guardare`);
  const per = leggiPerimetro(opz);
  const sito = resolve(opz.git ?? repoDi(per.casa, opz));
  const onda = opz.onda === undefined ? null : Number(opz.onda);
  const rel = posix.normalize(dir.slice(opz.radice.length + 1).split("\\").join("/"));
  const mieR = Object.entries(sess.sessioni ?? {}).filter(([, v]) => onda === null || Number(v.onda) === onda);
  const nomiR = new Set(mieR.map(([n]) => n));
  const mieK = Object.entries(sess.collaudatori ?? {}).filter(([, v]) => onda === null || (v.riparatori ?? []).some((x) => nomiR.has(x)));
  const mieC = Object.entries(sess.controllori ?? {}).filter(([, v]) => onda === null || v.onda === undefined || Number(v.onda) === onda);
  const esiti = {};
  const una = (tipo, nome, v, depo, percorso) => {
    const s = { nome, tipo, ramo: v.ramo, sulRemoto: false, finita: false, testa: null };
    if (!v.ramo || gitOk(depo, ["rev-parse", "--verify", "--quiet", `origin/${v.ramo}`]) === null) return s;
    s.sulRemoto = true;
    const [sha, quando] = String(gitOk(depo, ["log", "-1", "--format=%H %ct", `origin/${v.ramo}`]) ?? "").trim().split(" ");
    if (sha) s.testa = { sha, quando: Number(quando) * 1000 };
    const testo = gitOk(depo, ["show", `origin/${v.ramo}:${percorso}`]);
    if (testo !== null) {
      try {
        const j = JSON.parse(testo);
        s.finita = j.finita === true;
        for (const x of j.voci ?? []) if (x?.esito) esiti[x.esito] = (esiti[x.esito] ?? 0) + 1;
      } catch { /* referto illeggibile: non finito */ }
    }
    return s;
  };
  const sessioni = [
    ...mieR.map(([n, v]) => una("R", n, v, sito, `${REFERTO_DIR}/referto-${n}.json`)),
    ...mieK.map(([n, v]) => una("K", n, v, opz.radice, `${rel}/collaudi/${n}.json`)),
    ...mieC.map(([n, v]) => una("C", n, v, opz.radice, `${rel}/controlli/${n}.json`)),
  ];
  const leggiSeC = (f) => (existsSync(join(dir, f)) ? leggiJson(join(dir, f)) : null);
  const vive = leggiSeC("stato-sessioni.json"), preventivo = leggiSeC("preventivo.json");
  const noti = existsSync(join(dir, "rossi-noti.txt")) ? readFileSync(join(dir, "rossi-noti.txt"), "utf8") : "";
  const tutti = segnaliDa({ sessioni, vive, preventivo, ora: Date.now() });
  return { dir, sessioni, vive, preventivo, esiti, tutti, nuovi: nuoviSegnali(tutti, noti) };
}

function segnali(opz) {
  let f;
  try { f = fattiDellaCampagna(opz); } catch (e) { return cieco("segnali", e.message, opz); }
  for (const s of opz.tutti ? f.tutti : f.nuovi) console.log(s);
  if (opz.json) console.log(JSON.stringify({ controllo: "segnali", nuovi: f.nuovi, tutti: f.tutti }));
  return f.nuovi.length ? 1 : 0;
}

function stato(opz) {
  let f;
  try { f = fattiDellaCampagna(opz); } catch (e) { return cieco("stato", e.message, opz); }
  for (const riga of testoStato({ campagna: basename(f.dir), ora: timbroOra(), ...f })) console.log(riga);
  return f.nuovi.length ? 1 : 0;
}

// ── pronte: le voci che tornano in lavoro, in quattro elenchi (officina minima del 15/11, pezzo 4) ──
// Le liste del giro di correzione le faceva la regista a mano: le serve_file_altrui sono passate da 14 a 29, e il
// 14/11 su 20 voci rimandate allo stesso padrone del file 11 sono tornate serve_file_altrui. Qui gli elenchi
// nascono dai PERCORSI dei file e dagli ESITI, mai dalle parole, dopo aver fuso voce per voce i referti e i
// collaudi dei giri successivi (i rami «secondo», K05 secondo, K08 terzo). Si conta per voce unica (la chiave).
export const ELENCHI_PRONTE = Object.freeze({ A: "A-da-ricollaudare.txt", B: "B-serve-file-altrui.txt", C: "C-parziali-file-altrui.txt", D: "D-per-nicola.txt" });
const SEGRETO = /\b[A-Z][A-Z0-9_]*_(?:KEY|SECRET|TOKEN|PASSWORD)\b/;
const PERCORSO_NEL_TESTO = /[\w@.-]+(?:\/[\w@.[\]-]+)+\.[a-z]{1,5}\b/gi;

/** Due versioni dello stesso referto o collaudo, voce per voce: la più nuova vince sulle voci che porta. PURA. */
export function fondiVoci(vecchio, nuovo) {
  if (!nuovo) return vecchio ?? null;
  if (!vecchio) return nuovo;
  const perId = new Map((vecchio.voci ?? []).map((v) => [v?.id, v]));
  for (const v of nuovo.voci ?? []) if (v?.id) perId.set(v.id, v);
  return { ...vecchio, ...nuovo, voci: [...perId.values()] };
}

/**
 * I quattro elenchi. PURA. Una voce sta in un elenco solo, in quest'ordine: D (per Nicola), B, C, A.
 *  A riparate minori ancora aperte senza collaudo, senza giudizio pieno o con la prova rimessa a uscita 3;
 *  B serve_file_altrui con ogni modifica scritta; C parziali che nominano un file di un altro padrone nel piano;
 *  D non_codice, scelta_di_nicola, o una migrazione o un segreto nominati.
 * Torna anche `precedenti` (per chiave: esito, cosa_resta, modifiche e file che servono), per `dividi` e `schede`.
 */
export function elenchiPronte({ piano, referti, collaudi, decisioni }) {
  const dec = new Map(decisioni.map((d) => [d.id, d]));
  const cvDi = (d) => (collaudi.find((c) => c.collaudatore === d?.collaudatore)?.voci ?? []).find((v) => v?.id === d?.id) ?? null;
  const fuori = { A: new Map(), B: new Map(), C: new Map(), D: new Map() };
  const precedenti = {};
  let righeB = 0;
  for (const o of piano.onde ?? []) {
    const padrone = new Map();
    for (const [n, s] of Object.entries(o.sessioni ?? {})) for (const f of [...(s.file ?? []), ...(s.voci ?? []).flatMap((v) => v.file ?? [])]) if (!padrone.has(normPerc(f))) padrone.set(normPerc(f), n);
    for (const [nome, s] of Object.entries(o.sessioni ?? {})) {
      for (const sv of s.voci ?? []) {
        const rv = (referti[nome]?.voci ?? []).find((v) => v?.id === sv.id);
        const d = dec.get(sv.id);
        if (!rv || d?.decisione !== "resta_aperta") continue;
        const altrui = Array.isArray(rv.serve_file_altrui) ? rv.serve_file_altrui : [];
        const testo = [rv.cosa_resta, rv.nota, rv.domanda, ...altrui.map((x) => x?.modifica)].filter(Boolean).join("\n");
        const nominati = [...new Set([...(sv.file ?? []), ...(rv.file_toccati ?? []), ...altrui.map((x) => x?.file), ...(String(rv.cosa_resta ?? "").match(PERCORSO_NEL_TESTO) ?? [])].filter(Boolean).map(normPerc))];
        const cv = cvDi(d);
        let el = null;
        if (["non_codice", "scelta_di_nicola"].includes(rv.esito) || nominati.some(eMigrazione) || SEGRETO.test(testo)) el = "D";
        else if (rv.esito === "serve_file_altrui" && altrui.length && altrui.every((x) => !vuoto(x?.file) && !vuoto(x?.modifica))) { el = "B"; righeB += 1; }
        else if (rv.esito === "parziale" && nominati.some((f) => padrone.has(f) && padrone.get(f) !== nome)) el = "C";
        else if (rv.esito === "riparato" && !GRAVI.has(sv.gravita) && !["non_regge", "rompe_altro"].includes(cv?.verdetto)
          && (!cv || cv.giudizio !== "pieno" || [rv.rimessa?.uscita, cv.rimessa?.uscita].includes(3))) el = "A";
        if (!el) continue;
        // Voce unica: la stessa chiave in due onde conta una volta, e vale l'onda più nuova.
        for (const m of Object.values(fuori)) m.delete(sv.chiave);
        fuori[el].set(sv.chiave, sv.id);
        precedenti[sv.chiave] = { id: sv.id, elenco: el, esito: rv.esito, cosa_resta: rv.cosa_resta ?? null, modifiche: altrui.map((x) => ({ file: normPerc(x.file), modifica: x.modifica })), file_che_servono: [...new Set(altrui.map((x) => normPerc(x.file)))] };
      }
    }
  }
  const elenchi = Object.fromEntries(Object.entries(fuori).map(([k, m]) => [k, [...m.keys()]]));
  return { elenchi, precedenti, righeB };
}

function pronte(opz) {
  let per, piano, dallOndaCampione;
  try { per = leggiPerimetro(opz); piano = leggiPiano(opz); dallOndaCampione = campioneFinoA40DallOnda(piano); } catch (e) { return cieco("pronte", e.message, opz); }
  const dir = serveCartella(opz);
  const sess = leggiSessioni(opz) ?? {};
  const rel = posix.normalize(dir.slice(opz.radice.length + 1).split("\\").join("/"));
  const dalRamo = (depo, ramo, percorso) => {
    if (!depo || !ramo) return null;
    const ref = risolviRef(depo, ramo);
    const t = ref ? gitOk(depo, ["show", `${ref}:${percorso}`]) : null;
    try { return t ? JSON.parse(t) : null; } catch { return null; }
  };
  const sito = opz.git ? resolve(opz.git) : null;
  const locali = (sotto) => Object.fromEntries(leggiCartellaTesti(join(dir, sotto), /^[RK]\d+\.json$/).filter((x) => x.dati).map((x) => [basename(x.nome, ".json"), x.dati]));
  const refLoc = locali("referti"), colLoc = locali("collaudi");
  const referti = {};
  for (const n of new Set([...piano.onde.flatMap((o) => Object.keys(o.sessioni)), ...Object.keys(refLoc)])) {
    referti[n] = fondiVoci(refLoc[n], dalRamo(sito, sess.sessioni?.[n]?.ramo, `${REFERTO_DIR}/referto-${n}.json`));
  }
  const collaudi = [];
  for (const n of new Set([...Object.keys(colLoc), ...Object.keys(sess.collaudatori ?? {})])) {
    const c = fondiVoci(colLoc[n], dalRamo(opz.radice, sess.collaudatori?.[n]?.ramo, `${rel}/collaudi/${n}.json`));
    if (c) collaudi.push(c);
  }
  const decisioni = decidi({ piano, referti, collaudi, hub: fileHub(per.lavorabili ?? []), misuraDallOnda: dallOndaCampione });
  const { elenchi, precedenti, righeB } = elenchiPronte({ piano, referti, collaudi, decisioni });
  const fuoriDir = join(dir, "pronte");
  mkdirSync(fuoriDir, { recursive: true });
  for (const [k, file] of Object.entries(ELENCHI_PRONTE)) scriviTesto(join(fuoriDir, file), [`# elenco ${k} di pronte (${timbroOra()}): ${elenchi[k].length} voci uniche, una chiave per riga`, ...elenchi[k]].join("\n") + "\n");
  scriviJson(join(fuoriDir, "pronte.json"), { creato: timbroOra(), conti: Object.fromEntries(Object.entries(elenchi).map(([k, v]) => [k, v.length])), righe_B: righeB, precedenti });
  console.log(`🧺 pronte: A ${elenchi.A.length} da ricollaudare · B ${elenchi.B.length} serve_file_altrui (${righeB} righe nei referti) · C ${elenchi.C.length} parziali con file altrui · D ${elenchi.D.length} per Nicola`);
  return chiudi("pronte", [], sito ? [] : ["senza --git i referti dei rami (i giri «secondo») non sono fusi: solo le copie in referti/"], opz, { conti: Object.fromEntries(Object.entries(elenchi).map(([k, v]) => [k, v.length])), righe_B: righeB });
}

/** Le chiavi B del file dato a `dividi --file-chiavi`, con i file che servono (da pronte.json accanto). */
function fileCheServono(opz) {
  const f = opz["file-chiavi"] && join(dirname(resolve(opz["file-chiavi"])), "pronte.json");
  if (!f || !existsSync(f)) return new Map();
  const p = leggiJson(f).precedenti ?? {};
  return new Map(Object.entries(p).filter(([, x]) => x.elenco === "B" && x.file_che_servono?.length).map(([k, x]) => [k, x.file_che_servono]));
}

/** Una serve_file_altrui va da chi ha il file che le serve: i file che servono entrano fra i file della voce. PURA. */
export function conFileCheServono(candidate, mappa) {
  return candidate.map((v) => (mappa.has(v.chiave) ? { ...v, file: [...new Set([...v.file, ...mappa.get(v.chiave)])] } : v));
}

// ── i conti che arrivavano tardi (officina minima del 15/11, pezzo 5) ────────────────────────────
// K08.json era fermo a finita:false dal 13/11 alle 16:50 mentre K08 terzo aveva finito il 14/11 alle 09:38: 18 voci
// risultavano senza collaudo. La mycity#290 era unita dal 15/11 alle 03:07 e il registro non era scritto. La stima
// dell'onda 2 era 376 $ contro circa 1.627 reali (4,3 volte), fatta con 1,45 $ a voce: un rimedio sperato.
const FINITA_VERA = (f) => f === true || (typeof f === "string" && /^\d{4}-\d{2}-\d{2}/.test(f));

/** I collaudatori che sessioni.json dà per finiti (anche i giri dopo, «K08 terzo») col collaudo ancora finita:false. PURA. */
export function kFinitiMaAperti(sess, collaudiPerNome) {
  const finiti = new Set();
  for (const [n, v] of Object.entries(sess?.collaudatori ?? {})) if (/^K\d{2}$/.test(n) && FINITA_VERA(v?.finita)) finiti.add(n);
  const visita = (o, prof) => {
    if (!o || typeof o !== "object" || prof > 3) return;
    const m = typeof o.titolo === "string" ? o.titolo.match(/^(K\d{2})\b/) : null;
    if (m && FINITA_VERA(o.finita)) finiti.add(m[1]);
    for (const x of Object.values(o)) visita(x, prof + 1);
  };
  visita(sess, 0);
  return [...finiti].filter((k) => collaudiPerNome[k] && collaudiPerNome[k].finita !== true).sort();
}

/** Il registro porta le voci di quell'onda: almeno una scheda con un campo riparazione_* di una sua sessione. PURA. */
export function registroScrittoPerOnda(elenco, sessioniOnda) {
  const mie = new Set(sessioniOnda);
  return elenco.some((d) => Object.entries(d ?? {}).some(([k, v]) => k.startsWith("riparazione_") && mie.has(v?.sessione)));
}

/**
 * Le PR delle onde (in sessioni.json «pr_…ondaN»: {numero, testa}) unite senza il registro scritto. PURA.
 * `unita(testa)` dice true, false o null (non lo so: il commit o main non ci sono nel deposito).
 */
export function prUniteSenzaRegistro({ sess, piano, elenco, unita }) {
  const rossi = [], attese = [];
  for (const [chiave, pr] of Object.entries(sess ?? {})) {
    const m = chiave.match(/^pr_\w*?onda(\d+)$/);
    if (!m || !pr || typeof pr !== "object" || vuoto(pr.testa)) continue;
    const onda = Number(m[1]);
    const u = FINITA_VERA(pr.unita) ? true : unita(String(pr.testa));
    const nomi = Object.keys(piano?.onde?.[onda - 1]?.sessioni ?? {});
    if (u === null) attese.push(`#${pr.numero ?? "?"} (onda ${onda}): non so se è unita (il commit ${String(pr.testa).slice(0, 8)} o main non sono nel deposito)`);
    else if (u && !registroScrittoPerOnda(elenco, nomi)) rossi.push(`#${pr.numero ?? "?"} unita, onda ${onda} non scritta nel registro: applica --scrivi`);
    // Una PR unita con squash, o con la testa riscritta, ha la testa fuori da main: senza il campo «unita» il «no»
    // non ha guardato davvero. Si dice come attesa (collaudo dell'officina minima, 15/11, minore 3).
    else if (!u && pr.unita === undefined && !registroScrittoPerOnda(elenco, nomi)) attese.push(`#${pr.numero ?? "?"} (onda ${onda}): la testa ${String(pr.testa).slice(0, 8)} non è in main e manca il campo «unita»: se la PR è unita con squash scrivi «unita: true» in sessioni.json`);
  }
  return { rossi, attese };
}

/**
 * Il preventivo di un'onda, SOLO dalle misure (lezione 3 del 15/11). PURA. Torna null senza misure leggibili.
 * stima = voci × $ per voce lavorata dell'ultima onda misurata (collaudo e regia sono già dentro: il 15% e il
 * 10% sono la loro parte); tetto = stima + 30% (lo scarto ammesso fra stima e reale); massimo = voci × la
 * misura peggiore.
 */
export function preventivoDa(misure, voci) {
  const righe = (Array.isArray(misure?.misure) ? misure.misure : [])
    .filter((m) => /^onda\b/i.test(String(m?.fase ?? "")) && Number(m.usd) > 0 && Number(m.voci_lavorate) > 0)
    .map((m) => ({ fase: m.fase, per_voce: Number(m.usd) / Number(m.voci_lavorate) }));
  if (!righe.length || !(Number(voci) > 0)) return null;
  const ultima = righe[righe.length - 1];
  const tonda = (x) => Math.round(x * 100) / 100;
  const stima = tonda(voci * ultima.per_voce);
  const q = misure.casi_base_per_il_preventivo ?? {};
  const collaudo = Number(q.collaudo_quota) || 0.15, regia = Number(q.regia_quota) || 0.1;
  return {
    voci: Number(voci), per_voce_usd: tonda(ultima.per_voce), fonte: `misure.json, fase «${ultima.fase}»`,
    stima_usd: stima, tetto_usd: tonda(stima * 1.3), massimo_usd: tonda(voci * Math.max(...righe.map((r) => r.per_voce))),
    quote_usd: { collaudo: tonda(stima * collaudo), regia: tonda(stima * regia), riparatori: tonda(stima * (1 - collaudo - regia)) },
  };
}

function contiPreventivo(opz, piano) {
  const cartella = serveCartella(opz);
  const fileMisure = resolve(opz.misure ?? join(opz.radice, "cervello/riparazione/misure.json"));
  if (!existsSync(fileMisure)) return cieco("conti", `${fileMisure} non c'è: il preventivo si fa solo dalle misure, mai da un rimedio sperato`, opz);
  const ultima = piano.onde[piano.onde.length - 1];
  const voci = Number(opz.voci ?? ultima?.candidate?.length ?? 0);
  const p = preventivoDa(leggiJson(fileMisure), voci);
  if (!p) return cieco("conti", `nessuna misura d'onda leggibile in ${fileMisure}, o nessuna voce (--voci)`, opz);
  scriviJson(join(cartella, "preventivo.json"), { creato: timbroOra(), ...p });
  const riga = `- ${timbroOra()} · preventivo (conti --preventivo): ${p.voci} voci × ${p.per_voce_usd} $ = stima ${p.stima_usd} $ · tetto ${p.tetto_usd} $ · massimo ${p.massimo_usd} $ (collaudo ${p.quote_usd.collaudo} $, regia ${p.quote_usd.regia} $ dentro; ${p.fonte})`;
  const regia = join(cartella, "REGIA.md");
  scriviTesto(regia, (existsSync(regia) ? readFileSync(regia, "utf8").replace(/\n*$/, "\n") : "") + riga + "\n");
  console.log(`💶 ${riga.slice(2)}`);
  const vive = existsSync(join(cartella, "stato-sessioni.json")) ? leggiJson(join(cartella, "stato-sessioni.json")) : null;
  const spesa = Number(vive?.spesa_usd);
  const rossi = [];
  if (spesa >= p.stima_usd) rossi.push(`spesa ${spesa} $: oltre il 100% della stima (${p.stima_usd} $)`);
  else if (spesa >= SOGLIA_SPESA * p.stima_usd) rossi.push(`spesa ${spesa} $: oltre il 70% della stima (${p.stima_usd} $)`);
  return chiudi("conti", rossi, spesa > 0 ? [] : ["la spesa non è nota (stato-sessioni.json senza spesa_usd): il 70% e il 100% non sono guardati"], opz, { preventivo: p, spesa_usd: spesa || null });
}

const COMANDI = {
  perimetro, dividi, schede, "copertura-prima": coperturaPrima, segnaposti, "guardia-ramo": guardiaRamo,
  "valida-referto": validaReferto, "valida-collaudo": validaCollaudo, "prova-unione": provaUnione, applica, conti, deposito,
  segnali, stato, pronte,
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
