#!/usr/bin/env node
// 🔁 PROVA RIMESSA — la prova della macchina: tolgo la correzione e guardo se la prova torna rossa.
//
// PERCHE' ESISTE. Il metodo snello delle ondate (CLAUDE.md, paragrafo 🪙, regola ③: «prima la macchina,
// poi l'agente»). Nell'ondata del 28/10, 27 subagenti su 36 controllavano; la domanda che ripetevano di
// piu' era meccanica: «se rimetto il difetto, la prova della squadra diventa rossa?». Qui la stessa
// domanda costa zero agenti. Referto: consegne/audit/2026-10-30-metodo-snello.md.
//
// I PASSI, nel worktree della squadra:
//   ①   le prove sul codice di oggi: devono essere VERDI, con almeno una prova vista passare;
//   ②   UN file corretto alla volta riportato com'era sul commit di base, gli altri restano corretti, e le
//       prove devono essere ROSSE: un file che da solo non le fa cadere non e' provato (collaudo del
//       30/10: due file tolti insieme davano «regge» anche se la prova guardava solo il primo);
//   ③   tutto rimesso come l'ho trovato (byte e permessi), e le prove di nuovo VERDI.
// Il contenuto di oggi lo leggo dal disco, non da git; quello della base esce da `git cat-file --filters`,
// cioe' come lo scriverebbe un checkout (a capo compresi).
//
// IL ROSSO CHE NON PROVA NIENTE. Se al passo ② la prova cade solo perche' manca un nome che la correzione
// ha aggiunto, e' rossa per la struttura, non per il comportamento: la macchina non sa decidere, e lo dice
// (uscita 3). Due segni, e ne basta uno: un messaggio di struttura nell'uscita («is not a function»,
// «does not provide an export named», «Cannot find module»…) vince su qualunque asserzione, perche' le
// asserzioni avvolgono i TypeError e il nome del test o la riga stampata possono dire «expected … to be»;
// oppure le prove nominano un nome esportato che la base non ha («typeof m.doppio» cade senza nessun
// TypeError). Lo decide il collaudo, rimettendo il difetto com'e' scritto nella scheda.
//
// SE MI UCCIDONO. Prima del passo ② scrivo un salvataggio dei file di oggi (in <tmp>/prova-rimessa/). Con
// SIGINT/SIGTERM/SIGHUP rimetto subito. Con kill -9 non posso: la prossima corsa sullo stesso worktree
// trova il salvataggio, ferma il gruppo di processi rimasto orfano e rimette i file prima di fare altro.
// Il prompt delle squadre fa committare PRIMA di lanciarmi: cosi' anche il caso peggiore non perde niente.
// Due corse insieme sullo stesso worktree non si fanno: il blocco si prende prima del passo ①, la seconda
// esce 2. Il recupero rimette solo il file che la corsa uccisa aveva lasciato alla base, e solo se sul disco
// ci sono ancora i suoi byte: lavoro piu' nuovo, o un worktree rifatto, non si toccano.
// LIMITE DICHIARATO: un membro nuovo dentro un oggetto esportato che c'era gia' (`api.doppio` su `api`)
// non lo vedo; una prova che controlla solo che esista («typeof m.api.doppio») puo' darmi un falso «regge».
// Per questo il collaudo rilancia la prova e guarda la variante: la macchina viene prima, non da sola.
//
// USCITA. 0 regge · 1 non regge (non_verde, non_morde, instabile) · 2 non provato (argomenti, git, tempo
// scaduto, nessuna prova vista passare, un'altra corsa in corso) · 3 la macchina non decide
// (rosso_strutturale, rosso_sconosciuto) · 4 NON ripristinato: un file non e' tornato com'era.
//
// 🟢 Scrive solo i file passati in --file, e li rimette com'erano. Niente git add, niente commit.
//
// Uso:
//   node cervello/prova-rimessa.mjs --repo <worktree> --base <commit> --file a.ts,b.ts --prove tests/unit/x.test.ts [--json]
//   --comando "<comando con {prove}>"   default: npx vitest run --reporter=dot {prove} (il sito usa vitest)
// Il tempo: PROVA_RIMESSA_TIMEOUT_MS per giro (default 150 secondi), tutti i giri dentro
// PROVA_RIMESSA_TOTALE_MS (default 480 secondi), sotto i 540 di «timeout 540».

import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, statSync, chmodSync, openSync, closeSync, renameSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, normalize, isAbsolute, resolve } from "node:path";
import { createHash } from "node:crypto";
import { gitEsegui } from "./git-github.mjs";

const COMANDO_DEFAULT = "npx vitest run --reporter=dot {prove}";
const numero = (v, d) => (Number(v) > 0 ? Number(v) : d);
const TIMEOUT_MS = numero(process.env.PROVA_RIMESSA_TIMEOUT_MS, 150_000);
const TOTALE_MS = numero(process.env.PROVA_RIMESSA_TOTALE_MS, 480_000);
const CARTELLA = join(tmpdir(), "prova-rimessa");

// Solo il MESSAGGIO di un'asserzione caduta. Non basta da solo: vedi tipoDiRosso.
export const ASSERZIONE = /AssertionError|expected [^\n]{0,160} to (?:be|equal|deeply|strictly|have|include|match|throw|contain|satisfy)\b/;
/** Un rosso di struttura: manca un nome, un modulo, o il file non si compila. */
export const STRUTTURA = /SyntaxError|does not provide an export named|Cannot find module|ERR_MODULE_NOT_FOUND|Failed to (load|resolve)|Transform failed|is not a function|is not defined|is not a constructor/;

/** Quante prove sono passate, se il riassunto lo dice (vitest o node --test); null se non lo dice. */
export function passate(testo) {
  const t = String(testo || "");
  const v = t.match(/Tests?\s+(?:\d+\s+failed\s*\|\s*)?(\d+)\s+passed/);
  if (v) return Number(v[1]);
  const n = t.match(/^# pass (\d+)/m);
  return n ? Number(n[1]) : null;
}

/** Verde vuol dire: uscita 0 e, se c'e' un riassunto, almeno una prova passata. */
export function verde(giro) {
  if (giro.scaduto || giro.codice !== 0) return false;
  const n = passate(giro.uscita);
  return n === null ? true : n >= 1;
}

/** Il rosso del passo ②. La struttura vince: nel dubbio non e' un «regge». */
export function tipoDiRosso(testo) {
  if (STRUTTURA.test(testo)) return "strutturale";
  if (ASSERZIONE.test(testo)) return "comportamento";
  return "sconosciuto";
}

/** I nomi esportati da un modulo JS/TS, letti col testo (export const/function/class/let/var, export {a as b}). */
export function nomiEsportati(testo) {
  const nomi = new Set();
  const t = String(testo || "");
  for (const m of t.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function\*?|const|let|var|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g)) nomi.add(m[1]);
  for (const m of t.matchAll(/export\s*\{([^}]*)\}/g)) for (const pezzo of m[1].split(",")) { const n = pezzo.trim().split(/\s+as\s+/).pop(); if (n) nomi.add(n); }
  return nomi;
}

/** I nomi che la correzione ha aggiunto (oggi si', alla base no) e che le prove nominano. */
export function nomiNuoviUsati(base, oggi, testoProve) {
  const prima = nomiEsportati(base);
  return [...nomiEsportati(oggi)].filter((n) => !prima.has(n) && new RegExp("\\b" + n.replace(/\$/g, "\\$") + "\\b").test(testoProve));
}

const pulito = (p) => normalize(String(p)).replace(/^\.\//, "");

function argomenti(argv) {
  const a = { json: false, comando: COMANDO_DEFAULT };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--json") a.json = true;
    else if (["--repo", "--base", "--file", "--prove", "--comando"].includes(k)) a[k.slice(2)] = argv[++i];
    else throw new Error("argomento sconosciuto: " + k);
  }
  for (const k of ["repo", "base", "file", "prove"]) if (!a[k]) throw new Error("manca --" + k);
  const lista = (s) => [...new Set(String(s).split(",").map((x) => x.trim()).filter(Boolean).map(pulito))];
  a.file = lista(a.file);
  a.prove = lista(a.prove);
  for (const p of [...a.file, ...a.prove]) if (isAbsolute(p) || p === ".." || p.startsWith("../")) throw new Error("percorso fuori dal repo: " + p + " (scrivilo relativo alla radice del sito)");
  const doppi = a.file.filter((f) => a.prove.includes(f));
  if (doppi.length) throw new Error("un file non puo' essere insieme correzione e prova: " + doppi.join(", "));
  if (!a.comando.includes("{prove}")) throw new Error("--comando deve contenere {prove}");
  return a;
}

const citato = (s) => "'" + String(s).replace(/'/g, "'\\''") + "'";
const vivo = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
const uccidiGruppo = (pgid) => { try { process.kill(-pgid, "SIGKILL"); } catch (e) { /* gia' finito */ } };
// Un pid o un gruppo salvato si riusa solo se /proc dice che e' ancora nostro: i numeri dei processi si
// riciclano, e un SIGKILL al gruppo sbagliato colpirebbe un processo che non c'entra (ricollaudo del 30/10).
const riga = (pid) => { try { return readFileSync("/proc/" + pid + "/cmdline", "utf8").replace(/\0/g, " "); } catch (e) { return null; } };
const CON_PROC = existsSync("/proc/self/cmdline");
const nostro = (pid, segno) => { const r = riga(pid); return r !== null ? r.includes(segno) : !CON_PROC && vivo(pid); };
function prendiBlocco(p) {
  for (let i = 0; i < 2; i++) {
    try { const fd = openSync(p, "wx"); writeFileSync(fd, String(process.pid)); closeSync(fd); return true; }
    catch (e) {
      if (e.code !== "EEXIST") throw e;
      let pid = 0;
      try { pid = Number(readFileSync(p, "utf8").trim()); } catch (e2) { pid = 0; }
      if (pid && pid !== process.pid && nostro(pid, "prova-rimessa")) return false;
      try { unlinkSync(p); } catch (e2) { /* lo ha tolto qualcun altro */ }
    }
  }
  return false;
}
const scriviAtomico = (p, testo) => { const tmp = p + "." + process.pid + ".tmp"; writeFileSync(tmp, testo); renameSync(tmp, p); };

// Ogni giro in un gruppo di processi suo: il tempo scaduto uccide anche i figli (vitest, «cmd; true»),
// che altrimenti tengono aperta l'uscita e il giro non finisce mai (collaudo del 30/10).
function giro(repo, comando, prove, figli, tetto) {
  return new Promise((risolvi) => {
    const cmd = comando.replace("{prove}", prove.map(citato).join(" "));
    // NODE_TEST_CONTEXT arriva quando chi mi lancia e' dentro `node --test`: il `node --test` figlio
    // parlerebbe col padre invece di stampare il suo riassunto, e i verdetti uscirebbero falsi.
    const { NODE_TEST_CONTEXT, ...ambiente } = process.env;
    const figlio = spawn("bash", ["-c", cmd], { cwd: repo, env: ambiente, stdio: ["ignore", "pipe", "pipe"], detached: true });
    figli.add(figlio.pid);
    let uscita = "";
    let fatto = false;
    const fine = (codice) => { if (fatto) return; fatto = true; clearTimeout(sveglia); figli.delete(figlio.pid); risolvi({ codice, uscita, scaduto: !!figlio.scaduto }); };
    figlio.stdout.on("data", (d) => { uscita += d; });
    figlio.stderr.on("data", (d) => { uscita += d; });
    const sveglia = setTimeout(() => { figlio.scaduto = true; uccidiGruppo(figlio.pid); setTimeout(() => fine(null), 2000); }, tetto);
    figlio.on("close", fine);
  });
}

export async function provaRimessa(a) {
  const ctx = { blocco: null };
  const libera = () => { if (ctx.blocco) { try { if (readFileSync(ctx.blocco, "utf8").trim() === String(process.pid)) unlinkSync(ctx.blocco); } catch (e) { /* gia' tolto */ } ctx.blocco = null; } };
  process.on("exit", libera);
  try { return await corpo(a, ctx); } finally { libera(); process.off("exit", libera); }
}

async function corpo(a, ctx) {
  const repo = a.repo;
  const passi = [];
  const no = (motivo) => ({ esito: "non_provato", uscita: 2, passi, motivo });
  try { gitEsegui(["rev-parse", "--is-inside-work-tree"], repo); } catch (e) { return no("non e' un repo git: " + repo); }
  try { gitEsegui(["rev-parse", "--verify", "--quiet", a.base + "^{commit}"], repo); } catch (e) { return no("la base non esiste: " + a.base); }
  for (const p of a.prove) {
    const q = join(repo, p);
    if (!existsSync(q)) return no("la prova non c'e': " + p);
    if (!statSync(q).isFile()) return no("una prova deve essere un file, non una cartella: " + p);
  }

  mkdirSync(CARTELLA, { recursive: true });
  const chiave = createHash("sha1").update(resolve(repo)).digest("hex").slice(0, 16);
  const salvataggio = join(CARTELLA, chiave + ".json");
  // Il blocco PRIMA del passo ①: una seconda corsa che parte mentre la prima ha un file alla base vedrebbe
  // la prova rossa per colpa dell'altra e darebbe un falso «regge» (ricollaudo del 30/10).
  const blocco = join(CARTELLA, chiave + ".lock");
  if (!prendiBlocco(blocco)) return no("un'altra prova-rimessa sta lavorando su questo worktree: aspetta che finisca");
  ctx.blocco = blocco;

  // Il salvataggio di una corsa uccisa con kill -9. Si rimette SOLO il file che quella corsa aveva lasciato
  // alla base, e solo se sul disco ci sono ancora i byte che lei aveva scritto: se nel frattempo qualcuno ha
  // scritto lavoro nuovo, o il worktree e' stato rifatto, il salvataggio e' vecchio e si mette da parte.
  if (existsSync(salvataggio)) {
    let s = null;
    try { s = JSON.parse(readFileSync(salvataggio, "utf8")); } catch (e) { s = null; }
    if (!s || !s.file) return { esito: "non_ripristinato", uscita: 4, passi, motivo: "c'e' il salvataggio di una corsa interrotta e non riesco a leggerlo: guardalo a mano prima di tutto (" + salvataggio + ")" };
    for (const g of s.pgid || []) if (s.segno && nostro(g, s.segno)) uccidiGruppo(g);
    const l = s.alla_base;
    if (l && s.file[l.file]) {
      const p = join(repo, l.file), x = s.file[l.file];
      const ora = existsSync(p) ? readFileSync(p).toString("base64") : null;
      if (ora === l.dati && ora !== x.dati) {
        if (x.dati === null) { if (existsSync(p)) unlinkSync(p); }
        else { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, Buffer.from(x.dati, "base64")); chmodSync(p, x.modo); }
        const dopo = existsSync(p) ? readFileSync(p).toString("base64") : null;
        if (dopo !== x.dati) return { esito: "non_ripristinato", uscita: 4, passi, motivo: "una corsa interrotta aveva lasciato " + l.file + " alla base, e NON sono riuscito a rimetterlo" };
        passi.push("⚠️ una corsa interrotta aveva lasciato " + l.file + " alla base: l'ho rimesso com'era");
      } else if (ora !== x.dati) {
        renameSync(salvataggio, salvataggio + ".vecchio");
        passi.push("⚠️ il salvataggio di una corsa interrotta e' vecchio: " + l.file + " e' cambiato dopo, e non lo tocco. Messo da parte in " + salvataggio + ".vecchio");
      }
    }
    if (existsSync(salvataggio)) unlinkSync(salvataggio);
  }

  // Cosa c'e' oggi (dal disco, coi permessi) e cosa c'era alla base (come la scriverebbe un checkout).
  const oggi = new Map(), base = new Map();
  for (const f of a.file) {
    const p = join(repo, f);
    oggi.set(f, existsSync(p) ? { dati: readFileSync(p), modo: statSync(p).mode & 0o7777 } : null);
    let b = null;
    try { b = gitEsegui(["--literal-pathspecs", "ls-tree", "--name-only", a.base, "--", f], repo) ? gitEsegui(["cat-file", "--filters", a.base + ":" + f], repo, {}, { grezzo: true }) : null; } catch (e) { b = null; }
    base.set(f, b);
    let uguale = oggi.get(f) === null && b === null;
    if (oggi.get(f) && b) { try { gitEsegui(["--literal-pathspecs", "diff", "--quiet", a.base, "--", f], repo); uguale = true; } catch (e) { uguale = false; } }
    if (uguale) return no("il file e' uguale alla base, non e' una correzione: " + f);
  }

  const figli = new Set();
  const gruppi = new Set();
  let allaBase = null; // { file, dati } — il file che in questo momento ho riportato alla base
  const segno = a.comando.slice(0, 40);
  const scriviSalvataggio = () => scriviAtomico(salvataggio, JSON.stringify({ pid: process.pid, segno, pgid: [...gruppi], alla_base: allaBase, file: Object.fromEntries([...oggi].map(([f, o]) => [f, o ? { dati: o.dati.toString("base64"), modo: o.modo } : { dati: null }])) }));
  const rimettiUno = (f) => {
    const o = oggi.get(f), p = join(repo, f);
    try {
      if (o === null) { if (existsSync(p)) unlinkSync(p); }
      else { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, o.dati); chmodSync(p, o.modo); }
    } catch (e) { /* il controllo qui sotto lo vede */ }
    const ora = existsSync(p) ? { dati: readFileSync(p), modo: statSync(p).mode & 0o7777 } : null;
    return (ora === null && o === null) || (!!ora && !!o && ora.dati.equals(o.dati) && ora.modo === o.modo);
  };
  let toccato = false;
  const rimettiTutto = () => { if (!toccato) return []; const diversi = a.file.filter((f) => !rimettiUno(f)); if (!diversi.length) { toccato = false; try { unlinkSync(salvataggio); } catch (e) { /* gia' tolto */ } } return diversi; };
  const alSegnale = (s) => { for (const g of figli) uccidiGruppo(g); const d = rimettiTutto(); process.stderr.write("⛔ fermata da " + s + (d.length ? ": NON RIMESSI " + d.join(", ") : ": file rimessi com'erano") + "\n"); if (ctx.blocco && !d.length) { try { unlinkSync(ctx.blocco); } catch (e) { /* gia' tolto */ } } process.exit(d.length ? 4 : 2); };
  const segnali = ["SIGINT", "SIGTERM", "SIGHUP"];
  for (const s of segnali) process.on(s, alSegnale);
  const allUscita = () => { rimettiTutto(); };
  process.on("exit", allUscita);

  const inizio = Date.now();
  const log = [];
  const lancia = async (nome) => {
    const resta = TOTALE_MS - (Date.now() - inizio);
    if (resta < 5000) return { codice: null, uscita: "", scaduto: true };
    const prima = new Set(figli);
    const p = giro(repo, a.comando, a.prove, figli, Math.min(TIMEOUT_MS, resta));
    for (const g of figli) if (!prima.has(g)) gruppi.add(g);
    if (toccato) scriviSalvataggio();
    const g = await p;
    log.push("── " + nome + " (uscita " + g.codice + (g.scaduto ? ", tempo scaduto" : "") + ")\n" + g.uscita);
    return g;
  };
  let r;
  try {
    const g1 = await lancia("① codice di oggi");
    if (g1.scaduto) { r = no("tempo scaduto al passo ①"); return r; }
    if (!verde(g1)) {
      r = passate(g1.uscita) === 0 && g1.codice === 0 ? no("nessuna prova vista passare: una prova vuota non e' un verde") : { esito: "non_verde", uscita: 1, motivo: "le prove non sono verdi sul codice di oggi" };
      return r;
    }
    passi.push("① codice di oggi: verde" + (passate(g1.uscita) !== null ? " (" + passate(g1.uscita) + " passate)" : ""));

    const testoProve = a.prove.map((p) => readFileSync(join(repo, p), "utf8")).join("\n");
    const nonMordono = [], dubbi = [];
    for (const f of a.file) {
      const b = base.get(f), p = join(repo, f);
      toccato = true;
      allaBase = { file: f, dati: b === null ? null : b.toString("base64") };
      scriviSalvataggio(); // prima di toccare il disco: un kill -9 da qui in poi si recupera
      if (b === null) { if (existsSync(p)) unlinkSync(p); }
      else { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, b); }
      const g2 = await lancia("② " + f + " alla base");
      if (!rimettiUno(f)) { r = { esito: "non_ripristinato", uscita: 4, motivo: "NON tornato com'era: " + f }; return r; }
      allaBase = null;
      scriviSalvataggio();
      if (g2.scaduto) { r = no("tempo scaduto al passo ② su " + f); return r; }
      if (verde(g2)) { nonMordono.push(f); passi.push("② " + f + " alla base: ancora verde"); continue; }
      const nuovi = nomiNuoviUsati(b ? b.toString("utf8") : "", oggi.get(f) ? oggi.get(f).dati.toString("utf8") : "", testoProve);
      const tipo = b === null || nuovi.length ? "strutturale" : tipoDiRosso(g2.uscita);
      if (tipo !== "comportamento") dubbi.push({ tipo, testo: f + (nuovi.length ? " (le prove usano nomi nuovi: " + nuovi.join(", ") + ")" : b === null ? " (alla base non c'era)" : "") });
      passi.push("② " + f + " alla base: rossa, " + (tipo === "comportamento" ? "sul comportamento" : tipo === "strutturale" ? "ma solo per la struttura" : "per un motivo che non riconosco"));
    }
    const diversi = rimettiTutto();
    if (diversi.length) { r = { esito: "non_ripristinato", uscita: 4, motivo: "NON tornati com'erano: " + diversi.join(", ") }; return r; }
    const g3 = await lancia("③ correzione rimessa");
    if (!verde(g3)) { passi.push("③ correzione rimessa: non verde"); r = { esito: "instabile", uscita: 1, motivo: "rimessa la correzione, le prove non tornano verdi: sono instabili" }; return r; }
    passi.push("③ correzione rimessa: verde · file identici a prima (byte e permessi)");
    if (nonMordono.length) r = { esito: "non_morde", uscita: 1, motivo: "con solo questi file alla base la prova resta verde: " + nonMordono.join(", ") + ". O il file non porta la correzione (toglilo da --file e dillo in nota), o gli serve una prova sua" };
    else if (dubbi.length) r = { esito: dubbi.some((d) => d.tipo === "strutturale") ? "rosso_strutturale" : "rosso_sconosciuto", uscita: 3, motivo: "la macchina non decide su: " + dubbi.map((d) => d.testo).join("; ") + ". Decide il collaudo, rimettendo il difetto com'e' scritto nella scheda" };
    else r = { esito: "regge", uscita: 0, motivo: "la prova morde: cade togliendo ognuno dei file corretti, e torna verde con la correzione" };
    return r;
  } finally {
    const diversi = rimettiTutto();
    for (const s of segnali) process.off(s, alSegnale);
    process.off("exit", allUscita);
    if (diversi.length && r) r = { esito: "non_ripristinato", uscita: 4, motivo: "NON tornati com'erano: " + diversi.join(", ") };
    const file = join(CARTELLA, chiave + ".log"); // uno per worktree, riscritto a ogni corsa: /tmp non si riempie
    try { writeFileSync(file, log.join("\n")); } catch (e) { /* il log e' un di piu' */ }
    if (r) { r.passi = passi; r.log = file; }
  }
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  let a;
  try { a = argomenti(process.argv.slice(2)); } catch (e) { console.error("⛔ " + e.message); process.exit(2); }
  const r = await provaRimessa(a).catch((e) => ({ esito: "non_provato", uscita: 2, motivo: "errore: " + e.message, passi: [] }));
  if (a.json) console.log(JSON.stringify(r));
  else {
    console.log("🔁 PROVA RIMESSA — " + a.repo + " · base " + a.base);
    for (const p of r.passi || []) console.log("  " + p);
    console.log((r.uscita === 0 ? "✅ " : r.uscita === 3 ? "⚪ " : "❌ ") + "ESITO " + r.esito + " — " + r.motivo);
    if (r.log) console.log("  log: " + r.log);
  }
  process.exit(r.uscita);
}
