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
// SE MI UCCIDONO. Lavoro solo su un worktree PULITO (git status vuoto, a parte il collegamento a node_modules)
// e su file che git vede davvero (ne' ignorati, ne' assume-unchanged): altrimenti mi fermo prima di toccare
// qualunque cosa (uscita 2). Cosi' la correzione vera sta sempre nel commit. Con
// SIGINT/SIGTERM/SIGHUP rimetto subito i file. Con kill -9 non posso: il file resta alla base, la corsa
// dopo lo vede come «modifica non committata», si ferma e dice come rimetterlo (`git checkout HEAD -- <file>`, o `rm` se la correzione l'aveva cancellato).
// Niente salvataggi da recuperare: il ricollaudo del 30/10 ha trovato quattro modi in cui un recupero
// scriveva sopra il lavoro giusto, e la cura alla radice e' non averne bisogno.
// Due corse insieme sullo stesso worktree non si fanno: il blocco sta nella cartella git del worktree, si
// prende prima del passo ① (la seconda esce 2) e sparisce con il worktree. Il log sta li' accanto.
// LIMITE DICHIARATO: un membro nuovo dentro un oggetto esportato che c'era gia' (`api.doppio` su `api`)
// non lo vedo; una prova che controlla solo che esista («typeof m.api.doppio») puo' darmi un falso «regge».
// Per questo il collaudo rilancia la prova e guarda la variante: la macchina viene prima, non da sola.
// LIMITE DICHIARATO: un blocco stantio (corsa uccisa) conteso da due corse nuove nello stesso istante
// puo' farle partire tutte e due; nel giro d'ondata ogni worktree ha un lavoratore solo.
//
// USCITA. 0 regge · 1 non regge (non_verde, non_morde, instabile) · 2 non provato (argomenti, git, tempo
// scaduto, nessuna prova vista passare, un'altra corsa in corso, un file non committato) · 3 la macchina non decide
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
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, statSync, chmodSync, openSync, closeSync } from "node:fs";
import { join, dirname, normalize, isAbsolute } from "node:path";
import { gitEsegui } from "./git-github.mjs";

const COMANDO_DEFAULT = "npx vitest run --reporter=dot {prove}";
const numero = (v, d) => (Number(v) > 0 ? Number(v) : d);
const TIMEOUT_MS = numero(process.env.PROVA_RIMESSA_TIMEOUT_MS, 150_000);
const TOTALE_MS = numero(process.env.PROVA_RIMESSA_TOTALE_MS, 480_000);

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
// Il pid di un blocco vale solo se /proc dice che e' ancora una prova-rimessa: i numeri dei processi si
// riciclano, e un pid riusato da un altro processo terrebbe il worktree bloccato per sempre (ricollaudo del 30/10).
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

  // Il blocco PRIMA del passo ①, nella cartella git del worktree: una seconda corsa che parte mentre la
  // prima ha un file alla base vedrebbe la prova rossa per colpa dell'altra e darebbe un falso «regge».
  let cartellaGit;
  try { cartellaGit = gitEsegui(["rev-parse", "--absolute-git-dir"], repo); } catch (e) { return no("non trovo la cartella git del worktree: " + repo); }
  const blocco = join(cartellaGit, "prova-rimessa.lock");
  ctx.log = join(cartellaGit, "prova-rimessa.log");
  if (!prendiBlocco(blocco)) return no("un'altra prova-rimessa sta lavorando su questo worktree: aspetta che finisca");
  ctx.blocco = blocco;

  // Solo un worktree PULITO: quello che provo dev'essere esattamente il commit. Non bastano i file in --file
  // (ricollaudo del 30/10: un aiuto corretto sul disco ma rimasto fuori dal commit dava «regge» su uno stato
  // che il commit non ha). L'unica cosa ammessa fuori dal commit e' il collegamento a node_modules.
  // true/false se git risponde; null se non risponde: allora non do un consiglio che potrebbe essere sbagliato.
  const nelCommit = (f) => { try { return !!gitEsegui(["--literal-pathspecs", "ls-tree", "--name-only", "HEAD", "--", f], repo); } catch (e) { return null; } };
  let sporchi;
  try { sporchi = gitEsegui(["status", "--porcelain"], repo).split("\n").map((x) => x.trim()).filter(Boolean).filter((x) => !/^\?\? node_modules\/?$/.test(x)); } catch (e) { return no("git status non risponde su " + repo); }
  if (sporchi.length) {
    const consigli = a.file.map((f) => { const c = nelCommit(f); return c === true ? "git -C " + repo + " checkout HEAD -- " + f : c === false ? "rm " + join(repo, f) : "guarda git -C " + repo + " status -- " + f + " (git non mi ha detto se e' nel commit)"; });
    return no("il worktree ha modifiche non committate (" + sporchi.slice(0, 5).join(", ") + (sporchi.length > 5 ? ", …" : "") + "): committa quello che fa parte della correzione e togli il resto. Se una corsa di prova-rimessa e' stata interrotta a meta', un file e' rimasto alla base; si rimette cosi': " + consigli.join(" · "));
  }
  for (const f of a.file) {
    let ignorato = true;
    try { gitEsegui(["check-ignore", "-q", "--", f], repo); } catch (e) { ignorato = false; }
    if (ignorato) return no(f + " e' ignorato da git: non sta nel commit, e una prova su di lui non prova la correzione");
    let voce = "";
    try { voce = gitEsegui(["--literal-pathspecs", "ls-files", "-v", "--", f], repo); } catch (e) { voce = ""; }
    if (/^[a-zS]/.test(voce)) return no(f + " e' segnato assume-unchanged o skip-worktree: git non vede le sue modifiche, e il commit potrebbe non essere quello che provo");
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
  const rimettiTutto = () => { if (!toccato) return []; const diversi = a.file.filter((f) => !rimettiUno(f)); if (!diversi.length) toccato = false; return diversi; };
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
    const g = await giro(repo, a.comando, a.prove, figli, Math.min(TIMEOUT_MS, resta));
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
      if (b === null) { if (existsSync(p)) unlinkSync(p); }
      else { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, b); }
      const g2 = await lancia("② " + f + " alla base");
      if (!rimettiUno(f)) { r = { esito: "non_ripristinato", uscita: 4, motivo: "NON tornato com'era: " + f }; return r; }
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
    // Un log per worktree, nella sua cartella git: riscritto a ogni corsa, sparisce col worktree.
    try { writeFileSync(ctx.log, log.join("\n")); } catch (e) { /* il log e' un di piu' */ }
    if (r) { r.passi = passi; r.log = ctx.log; }
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
