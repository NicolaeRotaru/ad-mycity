#!/usr/bin/env node
// 🩻 LA RADIOGRAFIA MENTRE RIPARI — il perimetro che il lotto ha toccato si riguarda PRIMA di
// consegnare, non alla prossima radiografia separata.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE CURA: «riparo la lista, e la lista non sa cosa ho rotto intanto»
// ─────────────────────────────────────────────────────────────────────────────
// Nicola, 25/8/2026: *«entro il 29 agosto la macchina e il marketplace devono essere pronti, non
// avere nessun difetto… aggiungi anche l'opzione di fare la radiografia mentre risolve i problemi,
// per assicurarsi che non ci sono altri problemi che usciranno fuori se faccio un'altra
// radiografia separata.»*
//
// Il conto che gli dà ragione, e non è una sensazione:
//   · `radiografia-marketplace.json` lo dichiara da sé nel campo `sync_scan`: **«per trovare difetti
//     NUOVI serve un nuovo audit; i fix sul codice non riaprono da soli la lista»**. Cioè: chiudere
//     tutti i reperti aperti NON vuol dire che una radiografia rifatta domani esca a zero.
//   · `nascita-difetti.mjs`, misurato il 23/8: su 787 schede della macchina **99 le ha create il
//     riparare** — 25 regressioni dichiarate più 74 trovate mentre si riparava lì accanto.
// Due numeri, una sola conclusione: il lotto che ripara è anche il posto dove nascono difetti nuovi,
// e finché l'unico occhio che li vede è una radiografia lanciata giorni dopo, il conto «zero aperti»
// è vero sulla lista e falso sul codice.
//
// ─────────────────────────────────────────────────────────────────────────────
// COSA CONTROLLA (e cosa NON prova: leggilo, è la parte che rende onesto il verde)
// ─────────────────────────────────────────────────────────────────────────────
// Prende i file che il lotto ha toccato, li manda alla DIMENSIONE di radiografia che li copre
// (`cervello/dimensioni-radiografia.json`) e pretende che per ognuno esista una scansione registrata
// **con l'impronta del file com'è ADESSO**. Un'occhiata data prima dell'ultima modifica non conta:
// il file è cambiato dopo, e l'impronta lo dice.
//
// ⚠️ Questo freno prova che **hai riguardato dopo aver toccato**, non che hai guardato BENE: quello
// è il collaudo (skill `collaudo`, ⑦bis del cantiere), che ha mani diverse e mandato opposto. Un
// controllo che promettesse la qualità dello sguardo mentirebbe: qui si misura solo ciò che si può
// misurare — la freschezza della copertura — e il resto si dichiara.
//
// 🟢 Sola lettura sul codice. Scrive solo nel registro delle scansioni (memoria della macchina).
//
// Uso:
//   node cervello/radiografia-in-corsa.mjs                      → il perimetro del lotto è coperto?
//   node cervello/radiografia-in-corsa.mjs --repo ../mycity     → lo stesso, sul repo del sito
//   node cervello/radiografia-in-corsa.mjs --da-fare            → solo cosa resta da riguardare
//   node cervello/radiografia-in-corsa.mjs --mappa              → la mappa è allineata ai workflow?
//   node cervello/radiografia-in-corsa.mjs registra --dimensione <chiave> --toccati --trovati 0
//   node cervello/radiografia-in-corsa.mjs registra --dimensione <chiave> --file a,b --trovati 2 --schede AR-xxx,AR-yyy
//
// Exit: 0 = coperto (o niente da coprire) · 1 = perimetro scoperto/stantio, o mappa disallineata ·
//       2 = non ho potuto misurare (git muto, mappa illeggibile).

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";
import { scriviJsonAtomico } from "./scrivi-json.mjs";

export const MAPPA = join(AD_ROOT, "cervello/dimensioni-radiografia.json");
export const REGISTRO = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-in-corsa.json");
export const CANTIERE = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
export const REPERTI_SITO = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json");

/** Quante scansioni tiene il registro: le più vecchie escono. Un registro che cresce all'infinito
 *  diventa il file che nessuno riesce più ad aprire — la malattia di AR-807, un piano sopra. */
export const TETTO_SCANSIONI = 400;

// ───────────────────────────── funzioni pure (un test le può ESEGUIRE) ─────────────────────────────

/**
 * Le chiavi delle dimensioni dichiarate dentro un workflow di radiografia.
 *
 * Perché si legge il workflow invece di fidarsi della mappa: i workflow NON possono leggere il disco
 * (il motore non dà loro né fs né env), quindi l'elenco delle dimensioni vive per forza dentro di
 * loro. Una seconda copia in un JSON è una copia che invecchia in silenzio — la forma esatta
 * dell'elenco dei permessi (AR-206) e della coda cresciuta oltre il tetto (AR-807). Qui la copia
 * esiste, ma NON può invecchiare: `verificaMappa` la confronta col vero a ogni cancello.
 */
export function dimensioniDelWorkflow(testo) {
  const chiavi = [];
  const re = /\bkey:\s*['"]([a-z0-9-]+)['"]/g;
  let m;
  while ((m = re.exec(String(testo ?? ""))) !== null) chiavi.push(m[1]);
  return [...new Set(chiavi)];
}

/**
 * La mappa dice le stesse dimensioni che dicono i workflow?
 * @param {object} mappa contenuto di dimensioni-radiografia.json
 * @param {Record<string,string|null>} fonti percorso del workflow → il suo testo (null = illeggibile)
 * @returns {{ok: boolean, cieco: boolean, problemi: string[]}}
 */
export function verificaMappa(mappa, fonti) {
  const problemi = [];
  let cieco = false;
  const case_ = mappa?.case || {};
  for (const [nome, casa] of Object.entries(case_)) {
    const attese = [];
    for (const fonte of casa.fonti || []) {
      const testo = fonti?.[fonte];
      if (testo === null || testo === undefined) {
        cieco = true;
        problemi.push(`⚪ casa «${nome}»: non ho potuto leggere ${fonte} — non chiamo verde una mappa che non ho confrontato`);
        continue;
      }
      attese.push(...dimensioniDelWorkflow(testo));
    }
    if (cieco) continue;
    const dichiarate = new Set(casa.dimensioni || []);
    const vere = new Set(attese);
    for (const k of vere) if (!dichiarate.has(k)) problemi.push(`casa «${nome}»: il workflow ha la dimensione «${k}» e la mappa no`);
    for (const k of dichiarate) if (!vere.has(k)) problemi.push(`casa «${nome}»: la mappa ha la dimensione «${k}» e il workflow no`);
  }
  for (const r of mappa?.regole || []) {
    const casa = case_[r.casa];
    if (!casa) problemi.push(`regola «${r.prefisso}»: la casa «${r.casa}» non esiste`);
    else if (!(casa.dimensioni || []).includes(r.dimensione)) problemi.push(`regola «${r.prefisso}»: la dimensione «${r.dimensione}» non esiste nella casa «${r.casa}»`);
  }
  // ⭐ E OGNI LENTE DEVE GUARDARE QUALCOSA, o dire perché no. Una dimensione senza nessun file
  // assegnato non è neutra: è un pezzo di perimetro che nessuno riguarderà mai, e il verde del
  // cancello lo coprirebbe in silenzio. O ha una regola, o sta in `senza_perimetro` col motivo
  // scritto — che è la stessa regola dei sensori spenti (AR-105) applicata alle lenti.
  const conRegola = new Set((mappa?.regole || []).map((r) => `${r.casa}/${r.dimensione}`));
  for (const [nome, casa] of Object.entries(case_)) {
    for (const d of casa.dimensioni || []) {
      const chiave = `${nome}/${d}`;
      if (conRegola.has(chiave)) continue;
      const perche = (mappa?.senza_perimetro || {})[chiave];
      if (!perche || !String(perche).trim()) problemi.push(`la dimensione «${chiave}» non guarda nessun file e non dice perché: dàlle una regola o dichiarala in senza_perimetro`);
    }
  }
  return { ok: problemi.length === 0, cieco, problemi };
}

/** Vero se il percorso sta sotto il prefisso e ha uno dei suffissi ammessi (nessun suffisso = tutti). */
export function regolaCombacia(regola, percorso) {
  const p = String(percorso ?? "");
  if (!p.startsWith(regola.prefisso)) return false;
  const suff = regola.suffissi || [];
  if (!suff.length) return true;
  return suff.some((s) => p.endsWith(s));
}

/**
 * A quale dimensione appartiene un file toccato. Prima regola che combacia, e non è un dettaglio:
 * una lente per file tiene il costo del riguardare proporzionato al lotto. Le regole stanno in
 * ordine dal più specifico al più largo dentro la mappa.
 * @returns {{casa: string, dimensione: string}|null}
 */
export function regolaPerFile(mappa, { repo, percorso }) {
  const p = String(percorso ?? "");
  if (!p) return null;
  for (const fuori of mappa?.fuori_perimetro || []) {
    if (p.startsWith(fuori.prefisso) && (!fuori.repo || fuori.repo === repo)) return null;
  }
  for (const r of mappa?.regole || []) {
    if (r.repo && r.repo !== repo) continue;
    if (regolaCombacia(r, p)) return { casa: r.casa, dimensione: r.dimensione };
  }
  return null;
}

/** I file toccati divisi in «vanno riguardati» e «fuori perimetro», col perché di ognuno. */
export function perimetroDaControllare(mappa, { repo, file }) {
  const richiesti = [];
  const fuori = [];
  for (const f of file || []) {
    const r = regolaPerFile(mappa, { repo, percorso: f });
    if (r) richiesti.push({ file: f, ...r });
    else fuori.push(f);
  }
  return { richiesti, fuori };
}

/**
 * I file che il lotto ha CANCELLATO non si radiografano: non ci sono più da guardare.
 *
 * 🩻 AR-816, trovato riguardando questo stesso file prima di consegnare. Senza questa divisione un
 * lotto che cancella un file usciva ⚪ (esito 2) — cioè in CI bloccava — chiedendo di riguardare una
 * cosa che non esiste. Un freno che si può soddisfare solo rimettendo il file è un freno che si
 * impara ad aggirare, ed è la malattia che questa casa chiama «cancello sempre rosso».
 */
export function dividiSpariti(file, improntaDi) {
  const vivi = [];
  const spariti = [];
  for (const f of file || []) {
    if (improntaDi(f) === null || improntaDi(f) === undefined) spariti.push(f);
    else vivi.push(f);
  }
  return { vivi, spariti };
}

/** L'impronta di un contenuto: dodici caratteri bastano a dire «questo file è cambiato dopo». */
export function impronta(testo) {
  return createHash("sha256").update(String(testo ?? ""), "utf8").digest("hex").slice(0, 12);
}

/**
 * Il cuore: ogni file richiesto è coperto da una scansione con l'impronta di ADESSO?
 *
 * Tre esiti per file, e sono tre cose diverse per chi legge:
 *   · coperto  → qualcuno ha riguardato quel file DOPO l'ultima modifica;
 *   · stantio  → l'ha riguardato, ma prima dell'ultima modifica (l'impronta non combacia): è il caso
 *                che il difetto vero produce — si guarda, poi si ritocca, e la copertura resta lì a
 *                dire di sì;
 *   · scoperto → nessuno l'ha mai riguardato in quella dimensione.
 * @param {{richiesti: Array, scansioni: Array, improntaDi: (f:string)=>string|null}} arg
 */
export function copertura({ richiesti, scansioni, improntaDi }) {
  const coperti = [];
  const stantii = [];
  const scoperti = [];
  const illeggibili = [];
  for (const r of richiesti || []) {
    const ora = improntaDi(r.file);
    if (ora === null || ora === undefined) {
      illeggibili.push(r);
      continue;
    }
    const candidate = (scansioni || []).filter((s) => s.casa === r.casa && s.dimensione === r.dimensione && s.file && Object.prototype.hasOwnProperty.call(s.file, r.file));
    const buona = candidate.find((s) => s.file[r.file] === ora);
    if (buona) coperti.push({ ...r, quando: buona.quando, modo: buona.modo, trovati: buona.trovati });
    else if (candidate.length) stantii.push({ ...r, quando: candidate[candidate.length - 1].quando });
    else scoperti.push(r);
  }
  return { coperti, stantii, scoperti, illeggibili };
}

/** Raggruppa per dimensione ciò che resta da riguardare: è il comando da lanciare, non un elenco. */
export function daFare(cop, mappa = null) {
  const per = new Map();
  for (const r of [...(cop.scoperti || []), ...(cop.stantii || [])]) {
    const k = `${r.casa}/${r.dimensione}`;
    if (!per.has(k)) per.set(k, { casa: r.casa, dimensione: r.dimensione, file: [], consigliate: [] });
    per.get(k).file.push(r.file);
  }
  // Le lenti CONSIGLIATE: le altre che su quei file vedono qualcosa. Si stampano e non si impongono
  // — una lente obbligatoria per file tiene il costo del riguardare proporzionato al lotto, e una
  // consigliata che si scopre trovare sempre qualcosa si promuove a obbligatoria (è la regola del
  // cantiere: una domanda che trova due volte diventa un guardiano).
  if (mappa) {
    for (const d of per.values()) {
      const viste = new Set();
      for (const f of d.file) {
        for (const r of mappa.regole || []) {
          if (r.casa !== d.casa || r.dimensione !== d.dimensione) continue;
          if (!regolaCombacia(r, f)) continue;
          for (const c of r.consigliate || []) viste.add(c);
          break;
        }
      }
      d.consigliate = [...viste];
    }
  }
  return [...per.values()];
}

/**
 * Il verdetto. `codice` 0/1/2 come in tutta la casa.
 *
 * ⚠️ IL CASO «NIENTE DA RIGUARDARE» NON È UN VERDE MUTO. Un lotto che tocca solo memoria non ha
 * niente da radiografare, ed è legittimo: il codice resta 0, ma la riga dice quante cose ho
 * guardato e quante sono cadute fuori perimetro. «Zero cose esaminate» non si scrive mai come
 * «tutto a posto» — è la regola del collaudo, applicata al suo stesso guardiano.
 */
export function verdetto({ perimetro, cop, cieco = [], mappa = null }) {
  const righe = [];
  const restano = daFare(cop, mappa);
  if (cieco.length) {
    righe.push("⚪ non ho potuto misurare:");
    for (const c of cieco) righe.push(`  · ${c}`);
    return { codice: 2, righe };
  }
  if (!perimetro.richiesti.length) {
    righe.push(`⚪ non applicabile: dei ${perimetro.richiesti.length + perimetro.fuori.length} file toccati nessuno cade in una dimensione di radiografia (${perimetro.fuori.length} fuori perimetro: memoria, consegne, documenti).`);
    return { codice: 0, righe };
  }
  if (cop.illeggibili.length) {
    righe.push(`⚪ ${cop.illeggibili.length} file toccati non li ho potuti leggere (permessi? scritti mentre guardavo?): ${cop.illeggibili.slice(0, 5).map((r) => r.file).join(", ")}`);
  }
  if (!restano.length) {
    righe.push(`✅ ${cop.coperti.length} file riguardati dopo l'ultima modifica, su ${new Set(cop.coperti.map((c) => c.dimensione)).size} dimensioni.`);
    righe.push("   (prova che hai riguardato DOPO aver toccato, non che hai guardato bene: quello è il collaudo)");
    return { codice: cop.illeggibili.length ? 2 : 0, righe };
  }
  righe.push(`❌ ${cop.scoperti.length} file mai riguardati e ${cop.stantii.length} riguardati prima dell'ultima modifica. La radiografia separata di domani li troverebbe per prima.`);
  for (const d of restano) {
    righe.push(`  · ${d.casa}/${d.dimensione} — ${d.file.length} file: ${d.file.slice(0, 4).join(", ")}${d.file.length > 4 ? ` … (+${d.file.length - 4})` : ""}`);
    if (d.consigliate?.length) righe.push(`    lenti consigliate (non obbligatorie): ${d.consigliate.join(", ")}`);
  }
  righe.push("  Riguardali con la lente della dimensione, poi registra ciò che hai visto:");
  righe.push(`    node cervello/radiografia-in-corsa.mjs registra --dimensione ${restano[0].dimensione} --toccati --trovati <quanti> [--schede <id,id>]`);
  return { codice: 1, righe };
}

// ───────────────────────────── il mondo (git, disco, registro) ─────────────────────────────

function leggiJson(percorso) {
  try {
    return JSON.parse(readFileSync(percorso, "utf8"));
  } catch {
    return null;
  }
}

/** Il repo in cui gira il lotto: `ad` (questa casa) o `marketplace` (il sito). */
export function riconosciRepo(dir) {
  if (existsSync(join(dir, "cervello/cancello-lotto.mjs"))) return "ad";
  if (existsSync(join(dir, "app")) && existsSync(join(dir, "package.json"))) return "marketplace";
  return null;
}

/** La base del confronto: l'antenato comune con origin/main, o HEAD se la storia è tagliata. */
function basePerConfronto(dir) {
  const mb = spawnSync("git", ["merge-base", "HEAD", "origin/main"], { cwd: dir, encoding: "utf8" });
  if (mb.status === 0 && mb.stdout.trim()) return mb.stdout.trim();
  return "HEAD";
}

/**
 * I file che il lotto ha toccato: i commit del ramo PIÙ ciò che è ancora sul disco.
 *
 * Le due metà servono tutt'e due: senza i commit non si vede il lavoro già salvato, senza il disco
 * non si vede quello che stai scrivendo adesso — ed è proprio adesso che il freno deve parlare, non
 * a lotto consegnato.
 */
export function fileToccati(dir, base) {
  const fuori = [];
  const visti = new Set();
  const prendi = (args) => {
    try {
      for (const p of percorsiDaGit(args, { cwd: dir })) visti.add(p);
    } catch (e) {
      fuori.push(`git ${args.join(" ")}: ${e?.causaGit || e?.message || "motivo ignoto"}`);
    }
  };
  prendi(["diff", "--name-only", `${base}...HEAD`]);
  prendi(["diff", "--name-only", "HEAD"]);
  prendi(["ls-files", "--others", "--exclude-standard"]);
  return { file: [...visti].sort(), cieco: fuori };
}

function improntaDelFile(dir) {
  return (f) => {
    const p = join(dir, f);
    try {
      if (!existsSync(p) || !statSync(p).isFile()) return null;
      return impronta(readFileSync(p, "utf8"));
    } catch {
      return null;
    }
  };
}

function leggiRegistro() {
  const r = leggiJson(REGISTRO);
  if (r && Array.isArray(r.scansioni)) return r;
  return {
    _cosa_e:
      "Le scansioni di radiografia fatte DENTRO un lotto di riparazione, sul perimetro che il lotto ha toccato. Ogni voce porta l'impronta dei file com'erano quando sono stati riguardati: se il file cambia dopo, la copertura scade da sola. Lo legge cervello/radiografia-in-corsa.mjs, che è cablato nel cancello del lotto.",
    aggiornato: null,
    scansioni: [],
  };
}

/** Una scheda dichiarata trovata esiste davvero dove deve stare? (l'anti «ne ho trovati tre» a voce) */
export function schedaEsiste(casa, id) {
  if (casa === "marketplace") {
    const r = leggiJson(REPERTI_SITO);
    if (!r || !Array.isArray(r.problemi)) return null;
    return r.problemi.some((p) => p.titolo === id);
  }
  const c = leggiJson(CANTIERE);
  if (!c || !Array.isArray(c.difetti)) return null;
  return c.difetti.some((d) => d.id === id);
}

function casaDellaDimensione(mappa, dimensione, casaChiesta) {
  const case_ = Object.entries(mappa?.case || {});
  const candidate = case_.filter(([, c]) => (c.dimensioni || []).includes(dimensione)).map(([n]) => n);
  if (casaChiesta) return candidate.includes(casaChiesta) ? casaChiesta : null;
  if (candidate.length === 1) return candidate[0];
  return null;
}

function argomento(nome, def = null) {
  const i = process.argv.indexOf(nome);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : def;
}

function main() {
  const JSON_MODE = process.argv.includes("--json");
  const dirRepo = resolve(argomento("--repo", AD_ROOT));
  const repo = riconosciRepo(dirRepo);
  const mappa = leggiJson(MAPPA);
  const stampa = (codice, righe, extra = {}) => {
    if (JSON_MODE) console.log(JSON.stringify({ codice, righe, ...extra }, null, 2));
    else righe.forEach((r) => console.log(r));
    process.exit(codice);
  };

  if (!mappa) stampa(2, [`⚪ non ho potuto leggere la mappa delle dimensioni (${MAPPA})`]);

  // ── la mappa è ancora quella dei workflow veri?
  const fonti = {};
  for (const casa of Object.values(mappa.case || {})) {
    for (const f of casa.fonti || []) {
      const p = join(AD_ROOT, f);
      fonti[f] = existsSync(p) ? readFileSync(p, "utf8") : null;
    }
  }
  const vm = verificaMappa(mappa, fonti);
  if (process.argv.includes("--mappa")) {
    if (vm.ok) stampa(0, [`✅ la mappa dichiara le stesse dimensioni dei ${Object.keys(fonti).length} workflow di radiografia`]);
    stampa(vm.cieco ? 2 : 1, [vm.cieco ? "⚪ mappa non confrontata:" : "❌ la mappa non è più allineata ai workflow:", ...vm.problemi.map((p) => `  · ${p}`)]);
  }

  // ── registra una scansione fatta
  //
  // 🩻 TROVATO DALLA RADIOGRAFIA DI QUESTO STESSO LOTTO (AR-814). Prima era `process.argv[2] ===
  // "registra"`: bastava scrivere `--json registra …` e il comando NON registrava — cadeva nel ramo
  // del controllo e usciva 1 o 0 come se avessi chiesto un'altra cosa. Una registrazione che non
  // avviene e non lo dice è la forma peggiore: chi la lancia crede di aver coperto il perimetro.
  if (process.argv.slice(2).includes("registra")) {
    const dimensione = argomento("--dimensione");
    if (!dimensione) stampa(1, ["❌ serve --dimensione <chiave>"]);
    const casa = casaDellaDimensione(mappa, dimensione, argomento("--casa"));
    if (!casa) stampa(1, [`❌ la dimensione «${dimensione}» non esiste in nessuna casa (o sta in più di una: aggiungi --casa)`]);
    if (!repo) stampa(2, [`⚪ non ho riconosciuto il repo in ${dirRepo}`]);

    let file = (argomento("--file") || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (process.argv.includes("--toccati")) {
      const t = fileToccati(dirRepo, argomento("--base") || basePerConfronto(dirRepo));
      if (t.cieco.length) stampa(2, ["⚪ non ho potuto chiedere a git il perimetro:", ...t.cieco.map((c) => `  · ${c}`)]);
      const per = perimetroDaControllare(mappa, { repo, file: t.file });
      file = per.richiesti.filter((r) => r.casa === casa && r.dimensione === dimensione).map((r) => r.file);
    }
    if (!file.length) stampa(1, [`❌ zero file: una scansione che non ha guardato niente non è un verde, è un ⚪. Dimmi cosa hai riguardato (--file o --toccati).`]);

    // 🩻 AR-815, trovato dalla radiografia di questo stesso lotto: un percorso con `..` o assoluto
    // usciva dal repo pur cominciando con un prefisso ammesso (`cervello/../../altrove`), e finiva
    // nel registro come se fosse un file di casa. Qui il perimetro si misura sui percorsi RELATIVI
    // e normalizzati, come li dà git: tutto il resto non è un file del lotto.
    const storti = file.filter((f) => f.startsWith("/") || f.split("/").includes("..") || f.includes("\\"));
    if (storti.length) stampa(1, [`❌ percorsi non ammessi (assoluti o con «..»): ${storti.slice(0, 5).join(", ")} — servono i percorsi relativi alla radice del repo, come li dà git`]);

    // Ogni file dev'essere davvero di questa dimensione: registrare un file sotto la lente sbagliata
    // sarebbe comprare il verde con una riga, che è la scorciatoia numero uno del catalogo.
    const estranei = file.filter((f) => {
      const r = regolaPerFile(mappa, { repo, percorso: f });
      return !r || r.casa !== casa || r.dimensione !== dimensione;
    });
    if (estranei.length) stampa(1, [`❌ questi file non appartengono a ${casa}/${dimensione}: ${estranei.slice(0, 5).join(", ")}`]);

    const imp = improntaDelFile(dirRepo);
    const mancanti = file.filter((f) => imp(f) === null);
    if (mancanti.length) stampa(1, [`❌ non ho potuto leggere: ${mancanti.slice(0, 5).join(", ")}`]);

    const trovatiRaw = argomento("--trovati");
    if (trovatiRaw === null) stampa(1, ["❌ serve --trovati <quanti>: quante cose hai trovato riguardando. Anche zero, ma dichiarato."]);
    const trovati = Number(trovatiRaw);
    if (!Number.isInteger(trovati) || trovati < 0) stampa(1, [`❌ --trovati vuole un numero intero, non «${trovatiRaw}»`]);
    const schede = (argomento("--schede") || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (trovati > 0) {
      if (schede.length !== trovati) stampa(1, [`❌ hai dichiarato ${trovati} cose trovate e ${schede.length} schede: quello che hai visto si scrive, o non l'hai visto.`]);
      const fantasmi = schede.filter((s) => schedaEsiste(casa, s) === false);
      if (fantasmi.length) stampa(1, [`❌ queste schede non esistono nel registro dei difetti: ${fantasmi.join(", ")} — registrale prima (casa «${casa}»).`]);
    }

    const reg = leggiRegistro();
    const voce = {
      quando: nowPiacenza(),
      casa,
      dimensione,
      repo,
      modo: argomento("--modo", "ad"),
      chi: argomento("--chi", "AD"),
      trovati,
      schede,
      nota: argomento("--nota", ""),
      file: Object.fromEntries(file.map((f) => [f, imp(f)])),
    };
    reg.scansioni.push(voce);
    if (reg.scansioni.length > TETTO_SCANSIONI) reg.scansioni = reg.scansioni.slice(-TETTO_SCANSIONI);
    reg.aggiornato = voce.quando;
    const scritto = scriviJsonAtomico(REGISTRO, reg);
    stampa(scritto ? 0 : 2, [
      scritto
        ? `✅ registrata la radiografia di ${casa}/${dimensione} su ${file.length} file — trovati: ${trovati}${schede.length ? ` (${schede.join(", ")})` : ""}`
        : "⚪ la scrittura in memoria è stata fermata dal freno della memoria (sola lettura o sabbiera)",
    ], { voce });
  }

  // ── controlla il perimetro
  if (!repo) stampa(2, [`⚪ non ho riconosciuto il repo in ${dirRepo}: non so con quali regole misurarlo`]);
  const t = fileToccati(dirRepo, argomento("--base") || basePerConfronto(dirRepo));
  const { vivi, spariti } = dividiSpariti(t.file, improntaDelFile(dirRepo));
  const perimetro = perimetroDaControllare(mappa, { repo, file: vivi });
  const reg = leggiRegistro();
  const cop = copertura({ richiesti: perimetro.richiesti, scansioni: reg.scansioni, improntaDi: improntaDelFile(dirRepo) });
  const cieco = [...t.cieco];
  if (!vm.ok) {
    // Una mappa disallineata NON è un dettaglio da stampare in fondo: vuol dire che una dimensione
    // nuova del workflow non copre nessun file, cioè un pezzo di perimetro invisibile per costruzione.
    if (vm.cieco) cieco.push(...vm.problemi);
    else stampa(1, ["❌ la mappa delle dimensioni non è allineata ai workflow:", ...vm.problemi.map((p) => `  · ${p}`)]);
  }
  if (process.argv.includes("--da-fare")) {
    const restano = daFare(cop, mappa);
    stampa(restano.length ? 1 : 0, restano.length ? restano.map((d) => `${d.casa}/${d.dimensione}: ${d.file.join(" ")}`) : ["(niente da riguardare)"], { restano });
  }
  const v = verdetto({ perimetro, cop, cieco, mappa });
  if (spariti.length) v.righe.push(`   (${spariti.length} file cancellati dal lotto: non si radiografano)`);
  stampa(v.codice, v.righe, {
    repo,
    toccati: t.file.length,
    spariti: spariti.length,
    richiesti: perimetro.richiesti.length,
    coperti: cop.coperti.length,
    stantii: cop.stantii.length,
    scoperti: cop.scoperti.length,
    restano: daFare(cop, mappa),
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
