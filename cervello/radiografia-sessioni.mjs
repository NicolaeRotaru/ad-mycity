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
//   applica --data … [--scrivi] i ricontrolli e le regressioni sul registro, per chiave (🟡 con --scrivi)
//   copertura-dopo            i file letti o eseguiti dai referti, contro la mappa del perimetro
//
// Uscita: 0 verde · 1 rosso · 2 uso sbagliato o non ho potuto misurare · 3 in attesa (mai un verde muto).
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
import { timbroOra } from "./ora-piacenza.mjs";
// Ogni scrittura passa dalla porta della casa: fuori dalla memoria scrive dov'era, dentro rispetta la sola lettura e
// la sabbiera (misura-che-non-sporca, AR-639). Una scrittura fermata non è un verde muto: si dice.
import { scriviJsonAtomico, scriviTestoAtomico } from "./scrivi-json.mjs";
// La forma delle falle riservate è UNA sola per la casa: la stessa del risolutore (regoleNuoviDifetti). Se cambia lì,
// cambia qui: una riservata scritta bene per uno è scritta bene per l'altro.
import { chiaviDoppie, dataVera, TITOLO_RISERVATO, AREE_RISERVATE, PRIVATO } from "./riparazione-sessioni.mjs";

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
export const CAMPI_RISERVATA_RADIOGRAFIA = Object.freeze(["id", "trovato_da", "riservato", "titolo", "file", "severita", "dimensione", "prova_tipo", "prova_eseguita", "verificato", "verificato_da"]);
const SEGNAPOSTI_REFERTO = ['"…"', '"una delle 24 lenti"', '"come lo diresti a voce"', "AAAA-MM-GG HH:MM"];
const SEGNAPOSTI_SCHEDA = ["<sha>", "<ramo>", "<id>", "<regista>", "<cartella>", "{{", "}}", "AAAA-MM-GG HH:MM"];
const BINARIO = /\.(png|jpe?g|gif|webp|avif|ico|svg|bmp|ttf|otf|woff2?|eot|mp3|mp4|webm|mov|pdf|zip)$/i;

// ── Opzioni ──────────────────────────────────────────────────────────────────────────────────────
const BOOLEANE = new Set(["json", "scrivi"]);
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
  const fileNelPerimetro = new Set(perimetroFile.map((x) => x.f));
  const compatto = ["# chiave\tstato\tgravita\tdimensione\tfile\ttitolo  (le riservate: solo chiave, stato, gravità e titolo; si legge con grep, mai con Read)"];
  const daRic = [];
  for (const p of problemi) {
    const chiave = chiaveProblema(p);
    const g = String(p.severita ?? "").toLowerCase();
    if (eRiservataTitolo(p.titolo)) { compatto.push([chiave, p.stato, g, "-", "-", piatto(p.titolo)].join("\t")); continue; }
    compatto.push([chiave, p.stato, g, piatto(p.dimensione), piatto(p.file), piatto(p.titolo)].join("\t"));
    if (p.stato !== "aperto" || !temiScelti.includes("S01") || !profilo.ricontrollo.includes(g)) continue;
    if (profiloNome === "funzione" && !fileCitati(p.file).some((c) => fileNelPerimetro.has(c.f))) continue;
    daRic.push({ chiave, gravita: g, file: piatto(p.file), titolo: piatto(p.titolo), primo: primoFile(p.file) });
  }
  scriviTesto(join(opz.cartella, "registro-compatto.txt"), compatto.join("\n") + "\n");
  scriviTesto(join(opz.cartella, "da-ricontrollare.txt"), ["# chiave\tgravita\tfile\ttitolo  (le voci aperte NON riservate del profilo, per S01)", ...daRic.map((v) => [v.chiave, v.gravita, v.file, v.titolo].join("\t"))].join("\n") + "\n");

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
  for (const t of temiScelti) {
    const def = T.temi[t];
    const lotti = t === "S01"
      ? lottiDiVoci(daRic, M.voci_per_lotto_ricontrollo).map((l) => ({ voci: l.voci }))
      : lottiDiFile(perTema[t], M.kb_per_lotto);
    if (lotti.length === 0) continue; // un tema senza file né voci nel perimetro non apre una sessione
    for (const pezzo of spezza(t, lotti, M.lotti_max)) {
      sessioni[pezzo.id] = {
        tema: t, nome: def.nome, rischio: def.rischio, lenti: def.lenti, angoli: def.angoli, prefissi: def.prefissi ?? [],
        tetto: M.tetto_subagenti,
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
  const ordinate = [...ids].sort((a, b) => (sessioni[a].rischio === "alto" ? 0 : 1) - (sessioni[b].rischio === "alto" ? 0 : 1) || a.localeCompare(b));
  const onde = [];
  for (let i = 0; i < ordinate.length; i += M.sessioni_per_onda) onde.push(ordinate.slice(i, i + M.sessioni_per_onda));
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
    voci_da_ricontrollare: daRic.length,
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
    `**Profilo «${piano.profilo}».** ${ric ? `Ricontrolli ${x.lotti.reduce((n, l) => n + l.voci, 0)} voci aperte (gravità: ${piano.ricontrollo.join(", ")}).` : `Cerchi solo: ${piano.gravita_cercate.join(", ") || "niente di nuovo"}.`} ${piano.minori_ammessi ? "I minori nuovi sono ammessi." : `I minori nuovi NON si scrivono: nel registro ne restano aperti ${piano.minori_aperti}, sopra la soglia di ${piano.soglia_minori} (regola ⑳). Un minore visto strada facendo non va nel referto.`}`,
    "",
    `**Onda ${x.onda} · tetto ${x.tetto} subagenti**, cercatori e verificatori insieme. Oltre, chiedi alla regista con send_message prima di lanciarli (regola ⑱).`,
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
function preventivo(opz) {
  if (!opz.cartella) return uso("preventivo --cartella <dir>");
  const piano = leggiPiano(opz);
  const T = caricaTemi(opz);
  const p = calcolaPreventivo(piano, T.stima);
  piano.preventivo = { ...p, calcolato: timbroOra() };
  scriviJson(join(opz.cartella, "piano.json"), piano);
  console.log(`sessioni ${p.sessioni} in ${p.onde} onde · lotti ${p.lotti} · verificatori attesi ${p.verificatori_attesi} · subagenti al massimo per sessione ${p.subagenti_max_per_sessione}`);
  console.log(`stima: circa ${p.usd} $ di listino, circa ${(p.token / 1e6).toFixed(1)} milioni di token (regia e controllore finale compresi)`);
  console.log(`confronto: le 12 sessioni del 6/11 sono costate ${T.costi_6_11.sessioni_12_usd} $ (${T.costi_6_11._fonte})`);
  console.log(`serve la firma di Nicola prima del via: ${p.serve_firma ? "sì (oltre 2 milioni di token o 12 subagenti: regola ⑱)" : "no, ma la fermata 1 la chiede comunque"}`);
  return chiudi("preventivo", [], [], opz, p);
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
      else { if (!nelLotto.has(t)) nelLotto.set(t, new Set()); nelLotto.get(t).add(r[1]); }
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
    }
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
  const attese = commit.length === 0 ? [`${s}: il ramo non ha ancora nessun commit suo`] : [];
  return chiudi("guardia-ramo", rossi, attese, opz, { commit: commit.length, file_toccati: toccati.size });
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
      if (d?.verificato === true && d?.verificato_da !== PRIVATO) rossi.push(`${cx}: in una riservata «verificato_da» vale «${PRIVATO}»`);
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
      if (d?.verificato !== true || vuoto(d?.verificato_da)) rossi.push(`${cx}: a referto finito un ${riservato ? "difetto riservato" : d.severita} è verificato da un altro agente (verificato true e verificato_da)`);
      else if (!riservato && String(d.verificato_da).trim().toLowerCase().startsWith(String(d.trovato_da ?? "").toLowerCase())) rossi.push(`${cx}: l'ha verificato chi l'ha trovato (${d.trovato_da}): chi trova non conferma`);
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
    if (!ctx.daRicontrollare) { attese.push("manca da-ricontrollare.txt: i ricontrolli non si possono controllare"); continue; }
    const v = ctx.daRicontrollare.get(k?.chiave);
    if (!v) { rossi.push(`${cx}: la chiave non è in da-ricontrollare.txt`); continue; }
    if ((k.esito === "non_piu_vero" || k.esito === "cambiato") && vuoto(k?.prova)) rossi.push(`${cx}: «${k.esito}» vuole la prova`);
    if (k.esito === "non_piu_vero" && GRAVI.has(v.gravita)) {
      const ok = k?.prova_tipo === "comando" && k?.prova_eseguita === true && !vuoto(k?.esito_prova);
      if (!ok) (finita ? rossi : attese).push(`${cx}: chiudere un ${v.gravita} vuole una prova a comando eseguita con esito`);
      if (finita && (k?.verificato !== true || vuoto(k?.verificato_da))) rossi.push(`${cx}: chiudere un ${v.gravita} vuole un verificatore (verificato true e verificato_da): nel dubbio resta aperto`);
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
  // l'id di una riservata non si nomina in nessun altro campo (collaudo del 6/11)
  const idRiservate = difetti.filter((d) => d?.riservato === true && !vuoto(d?.id)).map((d) => d.id);
  if (idRiservate.length) {
    const fuori = { ...r, difetti: difetti.filter((d) => d?.riservato !== true) };
    for (const v of [...valori(fuori), ...chiavi(fuori)]) for (const id of idRiservate) if (new RegExp(`\\b${id}\\b`, "i").test(v)) rossi.push(`l'id della riservata ${id} compare in un altro campo: i dettagli vanno solo in chat`);
  }
  // ⑱ il tetto: a referto finito il conto degli agenti c'è, e sta nel tetto o porta il permesso della regista
  const agenti = r.conto?.agenti;
  if (finita) {
    if (typeof agenti !== "number" || agenti < 0) rossi.push("a referto finito «conto.agenti» è il numero di subagenti usati");
    else if (agenti > x.tetto && vuoto(r.conto?.permesso_regista)) rossi.push(`${agenti} subagenti, oltre il tetto di ${x.tetto}, senza «conto.permesso_regista» (regola ⑱)`);
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
  if (!opz.cartella || !opz.onda) return uso("sorveglia --cartella <dir> --onda N");
  const piano = leggiPiano(opz);
  const sess = leggiSessioni(opz);
  if (!sess?.sessioni) return chiudi("sorveglia", [], ["sessioni.json non c'è: nessuna sessione da sorvegliare"], opz);
  const onda = piano.onde[Number(opz.onda) - 1] ?? [];
  const rami = onda.map((s) => sess.sessioni[s]?.ramo).filter(Boolean);
  if (rami.length) gitOk(opz.git, ["fetch", "-q", "origin", ...rami]);
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
const forza = (d) => (d.prova_tipo === "comando" && d.prova_eseguita ? 3 : d.prova_tipo === "umano" ? 2 : 1) * 10 + (3 - SEVERITA.indexOf(d.severita));
/**
 * I doppioni, PURA: contro il registro (stessa chiave, o stesso file a meno di N righe e titoli simili) e fra le
 * sessioni. Le riservate non passano di qui: hanno tutte lo stesso file e titoli quasi uguali.
 * difetti: [{sessione, d}] · registro: [{chiave, stato, titolo, file}]
 */
export function trovaDoppioni(difetti, registro, { righe = 10, soglia = 0.4 } = {}) {
  const nelRegistro = [], regressioni = [], gruppi = [];
  const restano = [];
  for (const { sessione, d } of difetti) {
    if (d.riservato === true) { restano.push({ sessione, d }); continue; }
    const chiave = chiaveProblema(d);
    const uguale = registro.find((v) => v.chiave === chiave)
      ?? registro.find((v) => !eRiservataTitolo(v.titolo) && vicini(d.file, v.file, righe) && somiglianza(d.titolo, v.titolo) >= soglia);
    if (!uguale) { restano.push({ sessione, d }); continue; }
    const voce = { id: d.id, sessione, chiave: uguale.chiave, stato: uguale.stato, come: uguale.chiave === chiave ? "stessa chiave" : "stesso file vicino e titolo simile" };
    (STATI_CHIUSI.has(uguale.stato) ? regressioni : nelRegistro).push(voce);
  }
  const presi = new Set();
  for (let i = 0; i < restano.length; i++) {
    const a = restano[i];
    if (presi.has(a.d.id) || a.d.riservato === true) continue;
    const gruppo = [a];
    for (let j = i + 1; j < restano.length; j++) {
      const b = restano[j];
      if (presi.has(b.d.id) || b.d.riservato === true) continue;
      if (chiaveProblema(a.d) === chiaveProblema(b.d) || (vicini(a.d.file, b.d.file, righe) && somiglianza(a.d.titolo, b.d.titolo) >= soglia)) gruppo.push(b);
    }
    if (gruppo.length < 2) continue;
    const tenuto = [...gruppo].sort((x, y) => forza(y.d) - forza(x.d) || x.d.id.localeCompare(y.d.id))[0];
    gruppo.forEach((g) => presi.add(g.d.id));
    gruppi.push({ tenuto: tenuto.d.id, uniti: gruppo.map((g) => g.d.id).filter((id) => id !== tenuto.d.id), visto_da: [...new Set(gruppo.map((g) => g.sessione))] });
  }
  return { nel_registro: nelRegistro, regressioni_candidate: regressioni, gruppi };
}
function leggiReferti(opz) {
  const d = opz.referti ? resolve(opz.referti) : join(opz.cartella, "referti");
  if (!existsSync(d)) return [];
  return readdirSync(d).filter((f) => /^S\d{2}[b-z]?\.json$/.test(f)).sort().map((f) => ({ nome: f.slice(0, -5), r: leggiJson(join(d, f)) }));
}
function leggiRegistroVoci(opz) {
  const reg = leggiJson(opz.registro);
  return (reg.problemi ?? []).map((p) => ({ chiave: chiaveProblema(p), stato: p.stato, titolo: p.titolo, file: p.file }));
}
function doppioni(opz) {
  if (!opz.cartella) return uso("doppioni --cartella <dir> [--uscita <dir>] [--referti <dir>]");
  const piano = leggiPiano(opz);
  const T = caricaTemi(opz);
  const referti = leggiReferti(opz);
  if (referti.length === 0) return chiudi("doppioni", [], ["nessun referto in referti/"], opz);
  const difetti = referti.flatMap(({ nome, r }) => (r.difetti ?? []).map((d) => ({ sessione: nome, d })));
  const esito = trovaDoppioni(difetti, leggiRegistroVoci(opz), { righe: T.misure.righe_vicine, soglia: T.misure.somiglianza_titoli });
  // dentro una sessione si lancia con --uscita <scratchpad>: il ramo della sessione cambia solo il suo referto
  const uscita = opz.uscita ? resolve(opz.uscita) : opz.cartella;
  scriviJson(join(uscita, "doppioni.json"), { calcolato: timbroOra(), base: piano.base, ...esito });
  const tenuti = new Set(difetti.map((x) => x.d.id));
  esito.nel_registro.forEach((v) => tenuti.delete(v.id));
  esito.regressioni_candidate.forEach((v) => tenuti.delete(v.id));
  esito.gruppi.forEach((g) => g.uniti.forEach((id) => tenuti.delete(id)));
  const righe = difetti.filter((x) => tenuti.has(x.d.id)).map(({ sessione, d }) => d.riservato ? [d.id, sessione, d.severita, PRIVATO, "Falla di sicurezza da chiudere: i dettagli restano fuori dal deposito pubblico"].join("\t") : [d.id, sessione, d.severita, piatto(d.file), piatto(d.titolo)].join("\t"));
  scriviTesto(join(uscita, "trovati.txt"), ["# id\tsessione\tgravita\tfile\ttitolo  (i difetti tenuti dopo i doppioni: la seconda onda li cerca con grep prima di scrivere)", ...righe].join("\n") + "\n");
  console.log(`difetti letti: ${difetti.length} · uguali a voci aperte del registro: ${esito.nel_registro.length} · uguali a voci chiuse (regressioni da verificare): ${esito.regressioni_candidate.length} · gruppi fra sessioni: ${esito.gruppi.length} · tenuti: ${tenuti.size}`);
  return chiudi("doppioni", [], [], opz, { letti: difetti.length, tenuti: tenuti.size });
}

// ── grezzo ───────────────────────────────────────────────────────────────────────────────────────
const CAMPI_GREZZO = ["dimensione", "titolo", "severita", "file", "descrizione", "impatto", "fix", "causa_radice", "prova", "prova_tipo", "prova_eseguita", "esito_prova", "perche_umano", "verificato", "verificato_da"];
export function prossimoR(problemi) {
  return Math.max(0, ...problemi.map((p) => Number(String(p.titolo ?? "").match(/^Falla di sicurezza R(\d+)/)?.[1] ?? 0))) + 1;
}
function grezzo(opz) {
  if (!opz.cartella || !/^\d{4}-\d\d-\d\d$/.test(opz.data ?? "")) return uso("grezzo --cartella <dir> --data AAAA-MM-GG");
  const piano = leggiPiano(opz);
  const dp = join(opz.cartella, "doppioni.json");
  if (!existsSync(dp)) return chiudi("grezzo", ["manca doppioni.json: prima «doppioni»"], [], opz);
  const dop = leggiJson(dp);
  const referti = leggiReferti(opz);
  const rossi = [];
  for (const { nome, r } of referti) if (r.finita !== true) rossi.push(`${nome}: referto non finito`);
  const fuori = new Set([...dop.nel_registro.map((v) => v.id), ...dop.regressioni_candidate.map((v) => v.id), ...dop.gruppi.flatMap((g) => g.uniti)]);
  const visto = new Map(dop.gruppi.map((g) => [g.tenuto, g.visto_da]));
  let r = prossimoR(leggiJson(opz.registro).problemi ?? []);
  const perDim = new Map();
  for (const { nome, r: ref } of referti) for (const d of ref.difetti ?? []) {
    if (fuori.has(d.id)) continue;
    const f = {};
    for (const c of CAMPI_GREZZO) if (d[c] !== undefined) f[c] = d[c];
    if (d.riservato === true) {
      f.titolo = String(d.titolo).replace(/^Falla di sicurezza /, `Falla di sicurezza R${r++} `);
      for (const c of ["descrizione", "impatto", "fix", "causa_radice", "prova", "esito_prova"]) f[c] = "nel referto privato";
    }
    f.giro = 1;
    f.fonte_radiografia = `radiografia ${opz.data} · ${nome}${(visto.get(d.id) ?? []).filter((s) => s !== nome).length ? ` (vista anche da ${visto.get(d.id).filter((s) => s !== nome).join(", ")})` : ""}`;
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
    dimensioni: [...perDim.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([dimensione, findings]) => ({ dimensione, findings })),
  };
  if (!rossi.length) scriviJson(join(opz.cartella, "grezzo.json"), out);
  console.log(`grezzo: ${out.totale} difetti (bloccanti ${out.bloccanti}, gravi ${out.gravi}, minori ${out.minori})${rossi.length ? " — NON scritto" : ` in ${rel(opz, join(opz.cartella, "grezzo.json"))}`}`);
  return chiudi("grezzo", rossi, [], opz, { totale: out.totale });
}

// ── conti ────────────────────────────────────────────────────────────────────────────────────────
function conti(opz) {
  if (!opz.cartella) return uso("conti --cartella <dir>");
  const piano = leggiPiano(opz);
  const referti = leggiReferti(opz);
  const rossi = [], attese = [];
  const attese_sessioni = Object.keys(piano.sessioni);
  for (const s of attese_sessioni) if (!referti.some((x) => x.nome === s)) attese.push(`${s}: referto non ancora in referti/`);
  for (const { nome, r } of referti) {
    if (!piano.sessioni[nome]) { rossi.push(`referti/${nome}.json: non è una sessione del piano`); continue; }
    const { rossi: rr } = regoleReferto(r, contestoReferto(opz, piano, nome));
    const spariti = rr.filter((x) => x.startsWith("id spariti"));
    spariti.forEach((x) => rossi.push(`${nome}: ${x}`));
  }
  const tuttiId = referti.flatMap(({ nome, r }) => (r.difetti ?? []).map((d) => ({ nome, d })));
  const dp = join(opz.cartella, "doppioni.json"), gp = join(opz.cartella, "grezzo.json");
  const fuori = new Map();
  if (existsSync(dp)) {
    const dop = leggiJson(dp);
    dop.nel_registro.forEach((v) => fuori.set(v.id, "nel registro"));
    dop.regressioni_candidate.forEach((v) => fuori.set(v.id, "regressione"));
    dop.gruppi.forEach((g) => g.uniti.forEach((id) => fuori.set(id, `unito a ${g.tenuto}`)));
  } else attese.push("doppioni.json non c'è ancora");
  const nelGrezzo = new Set();
  if (existsSync(gp)) for (const dim of leggiJson(gp).dimensioni ?? []) for (const f of dim.findings ?? []) nelGrezzo.add(f.id_sessione);
  else attese.push("grezzo.json non c'è ancora");
  if (existsSync(dp) && existsSync(gp)) {
    for (const { d } of tuttiId) {
      const dentro = nelGrezzo.has(d.id), via = fuori.has(d.id);
      if (!dentro && !via) rossi.push(`${d.id}: trovato, ma non è né nel grezzo né fra doppioni e regressioni — è sparito`);
      if (dentro && via) rossi.push(`${d.id}: è nel grezzo e insieme ${fuori.get(d.id)}`);
    }
    for (const id of nelGrezzo) if (!tuttiId.some((x) => x.d.id === id)) rossi.push(`${id}: è nel grezzo ma in nessun referto`);
  }
  const per = (g) => tuttiId.filter((x) => x.d.severita === g).length;
  const scartati = referti.reduce((n, { r }) => n + (r.scartati ?? []).length, 0);
  console.log(`referti: ${referti.length} di ${attese_sessioni.length} · difetti trovati: ${tuttiId.length} (bloccanti ${per("bloccante")}, gravi ${per("grave")}, minori ${per("minore")}) · scartati dai verificatori: ${scartati}`);
  if (existsSync(gp)) console.log(`nel grezzo: ${nelGrezzo.size} · fuori dal grezzo per doppione o regressione: ${fuori.size}`);
  return chiudi("conti", rossi, attese, opz, { trovati: tuttiId.length, nel_grezzo: nelGrezzo.size, fuori: fuori.size, scartati });
}

// ── applica ──────────────────────────────────────────────────────────────────────────────────────
/**
 * I ricontrolli e le regressioni sul registro, per CHIAVE (mai per posizione: il digest sposta gli indici). PURA:
 * riceve i problemi e i referti, torna { problemi nuovi, conti, rossi }. Solo quello che regge le regole del
 * referto: un grave chiuso senza verificatore resta aperto (lo dice già valida-referto, qui si ricontrolla).
 */
export function applicaAlRegistro(problemi, referti, { data, base, ora }) {
  const [aa, mm, gg] = data.split("-");
  const campo = `riverifica_${Number(gg)}_${Number(mm)}`;
  const perChiave = new Map();
  problemi.forEach((p, i) => { const k = chiaveProblema(p); if (!perChiave.has(k)) perChiave.set(k, []); perChiave.get(k).push(i); });
  const nuovi = problemi.map((p) => ({ ...p }));
  const rossi = [];
  const conti = { chiusi: 0, riverificati: 0, riaperti: 0 };
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
      v[campo] = { data: ora, esito: k.esito, prova: k.prova ?? null, codice: base, nota: k.nota ?? null };
      conti.riverificati++;
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
  if (nuovi.length !== problemi.length) rossi.push("il numero delle voci è cambiato: applica non toglie e non aggiunge voci");
  return { problemi: nuovi, conti, rossi };
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
  const esito = applicaAlRegistro(reg.problemi ?? [], referti.filter(({ nome, r }) => !rossi.some((x) => x.startsWith(`${nome}:`)) && r.finita === true), { data: opz.data, base: piano.base, ora: timbroOra() });
  rossi.push(...esito.rossi);
  console.log(`ricontrolli applicati: ${esito.conti.riverificati} · chiusi come già riparati: ${esito.conti.chiusi} · regressioni riaperte: ${esito.conti.riaperti}${opz.scrivi ? "" : " (a vuoto: aggiungi --scrivi)"}`);
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
