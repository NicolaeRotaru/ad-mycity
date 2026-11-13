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
//   ②b  se la correzione ha file NUOVI (una migrazione, un aiutante): tutti i file nuovi tolti insieme, gli
//       esistenti restano corretti, e le prove devono essere ROSSE sul comportamento; una prova che nomina o
//       importa il file nuovo non decide
//       (12/11 sera: prima un file nuovo dava sempre «la macchina non decide», e una riparazione fatta solo
//       con una migrazione non poteva mai chiudersi);
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
//   --sql <database>   per le prove SQL del sito: ricostruisce il database dalle migrazioni sul disco
//                      (tests/sql/harness/apply.sh) e lancia ogni prova con psql. Vuole PGHOST/PGUSER/…
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
// Per le prove SQL (--sql) il messaggio di psql in modo verboso: P0001 e' il RAISE EXCEPTION con cui ogni prova
// di tests/sql/rls/ dice «controllo rosso».
export const ASSERZIONE = /AssertionError|expected [^\n]{0,160} to (?:be|equal|deeply|strictly|have|include|match|throw|contain|satisfy)\b|ERROR:\s+P0001:/;
/** Un rosso di struttura: manca un nome, un modulo, o il file non si compila. */
// Per SQL: funzione, tabella, colonna, tipo o schema che non esistono (42883, 42P01, 42703, 42704, 3F000).
export const STRUTTURA = /SyntaxError|does not provide an export named|Cannot find module|ERR_MODULE_NOT_FOUND|Failed to (load|resolve)|Transform failed|is not a function|is not defined|is not a constructor|ERROR:\s+(?:42883|42P01|42703|42704|3F000):|MIGRAZIONI_NON_APPLICATE|\b(?:function|relation|column|type|schema|table|view|procedure)\s[^\n]{0,200}?\bdoes not exist\b/;
// L'ultima: le prove SQL del sito avvolgono gli errori (EXCEPTION WHEN OTHERS) e li riscrivono come P0001, e il
// «function … does not exist» resta in una riga INFO: la struttura si legge anche lì (radiografia del 12/11 notte).

/** Il comando per le prove SQL: il database si ricostruisce da tutte le migrazioni sul disco, poi ogni prova. */
export function comandoSql(db, env = process.env) {
  if (!/^[a-z_][a-z0-9_]{0,40}$/.test(String(db))) throw new Error("--sql vuole il nome di un database di prova (lettere minuscole, cifre, _): " + db);
  // apply.sh fa DROP DATABASE … WITH (FORCE): solo un database di prova, e solo su un Postgres locale
  // (radiografia del 12/11 notte). Il nome dice «rimessa», «prova» o «test»; l'host è un socket o localhost.
  if (!/rimessa|prova|test/.test(db) || /^(postgres|template\d*)$/.test(db)) throw new Error("--sql: il nome del database deve dire che è di prova (contenere «rimessa», «prova» o «test»): " + db);
  const host = String(env.PGHOST ?? "");
  if (host && !host.startsWith("/") && !/^(localhost|127\.0\.0\.1|::1)$/.test(host)) throw new Error("--sql gira solo su un Postgres locale (PGHOST socket o localhost), non su " + host);
  // Se il database non si ricostruisce, l'uscita di apply.sh non arriva qui (un RAISE dentro una migrazione
  // sembrerebbe un'asserzione P0001): arriva solo un segno di struttura (collaudo del 12/11 sera).
  return "{ bash tests/sql/harness/apply.sh " + db + " >/dev/null 2>&1 || { echo 'MIGRAZIONI_NON_APPLICATE: il database di prova non si ricostruisce'; exit 1; }; } && n=0 && for f in {prove}; do psql -q -X -d " + db + " -v ON_ERROR_STOP=1 -v VERBOSITY=verbose -f \"$f\" || exit 1; n=$((n+1)); done && echo \"# pass $n\"";
}

/** I nomi che una migrazione CREA (funzione, tabella, vista, tipo), senza lo schema public., che alla base non crea nessuno.
 * `esisteAllaBase` torna true, false, o null se non lo sa: null conta come nome nuovo (la scelta prudente). */
export function nomiCreatiNuovi(sql, esisteAllaBase = () => false) {
  const t = String(sql).replace(/--.*$/gm, "");
  const nomi = new Set();
  for (const m of t.matchAll(/\bcreate\s+(?:or\s+replace\s+)?(?:materialized\s+)?(?:function|table|view|type|procedure)\s+(?:if\s+not\s+exists\s+)?((?:"?[a-z_][\w$]*"?\.)?"?[a-z_][\w$]*"?)/gi)) {
    const nome = m[1].replace(/"/g, "").replace(/^public\./i, "");
    if (!esisteAllaBase(nome)) nomi.add(nome);
  }
  return [...nomi];
}
/** Una migrazione della base crea già quel nome? (git grep sulla base, nelle cartelle delle migrazioni) */
function creatoAllaBase(repo, base, nome) {
  const corto = nome.replace(/^.*\./, "");
  try {
    const fuori = gitEsegui(["grep", "-l", "-i", "-E", "create\\s+(or\\s+replace\\s+)?(materialized\\s+)?(function|table|view|type|procedure)\\s+(if\\s+not\\s+exists\\s+)?(\"?public\"?\\.)?\"?" + corto.replace(/[.$]/g, "\\$&") + "\"?\\b", base, "--", "migrations", "supabase/migrations"], repo);
    return !!String(fuori).trim();
  } catch (e) {
    // git grep esce 1 quando non trova niente: quello è un «no» vero. Ogni altro errore è «non lo so» (null), e chi
    // chiama lo tratta come un nome nuovo: la macchina non decide, invece di dire «regge» su una fonte non letta.
    return e?.status === 1 ? false : null;
  }
}

/** Il testo senza commenti: blocchi e righe «//» per il codice, «--» per l SQL. */
export function senzaCommentiDi(percorso, testo) {
  let t = String(testo || "").replace(/\/\*[\s\S]*?\*\//g, "");
  t = /\.sql$/i.test(percorso) ? t.replace(/--.*$/gm, "") : t.replace(/(^|[^:\\])\/\/.*$/gm, "$1");
  return t;
}

/** I percorsi del deposito che una prova importa (relativi o con «@/»), senza i commenti. */
export function importati(percorso, testo) {
  const fuori = new Set();
  const t = String(testo || "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\])\/\/.*$/gm, "$1");
  for (const m of t.matchAll(/(?:from\s*|import\s*\(\s*|require\(\s*|vi\.mock\(\s*|import\s+)['"]([^'"]+)['"]/g)) {
    const spec = m[1];
    let r;
    if (spec.startsWith("@/")) r = spec.slice(2);
    else if (spec.startsWith(".")) r = normalize(join(dirname(percorso), spec)).replace(/\\/g, "/");
    else continue;
    for (const coda of ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", "/index.ts", "/index.tsx", "/index.js", "/index.mjs"]) fuori.add(r + coda);
  }
  return fuori;
}

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
    else if (["--repo", "--base", "--file", "--prove", "--comando", "--sql"].includes(k)) a[k.slice(2)] = argv[++i];
    else throw new Error("argomento sconosciuto: " + k);
  }
  for (const k of ["repo", "base", "file", "prove"]) if (!a[k]) throw new Error("manca --" + k);
  if (a.sql !== undefined) { if (a.comando !== COMANDO_DEFAULT) throw new Error("--sql e --comando insieme no: --sql scrive lui il comando"); a.comando = comandoSql(a.sql); }
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
    // I file che c'erano alla base: uno alla volta, gli altri restano corretti.
    const nuovi = a.file.filter((f) => base.get(f) === null);
    for (const f of a.file.filter((x) => base.get(x) !== null)) {
      const b = base.get(f), p = join(repo, f);
      toccato = true;
      mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, b);
      const g2 = await lancia("② " + f + " alla base");
      if (!rimettiUno(f)) { r = { esito: "non_ripristinato", uscita: 4, motivo: "NON tornato com'era: " + f }; return r; }
      if (g2.scaduto) { r = no("tempo scaduto al passo ② su " + f); return r; }
      if (verde(g2)) { nonMordono.push(f); passi.push("② " + f + " alla base: ancora verde"); continue; }
      const nuoviNomi = nomiNuoviUsati(b.toString("utf8"), oggi.get(f) ? oggi.get(f).dati.toString("utf8") : "", testoProve);
      const tipo = nuoviNomi.length ? "strutturale" : tipoDiRosso(g2.uscita);
      if (tipo !== "comportamento") dubbi.push({ tipo, testo: f + (nuoviNomi.length ? " (le prove usano nomi nuovi: " + nuoviNomi.join(", ") + ")" : "") });
      passi.push("② " + f + " alla base: rossa, " + (tipo === "comportamento" ? "sul comportamento" : tipo === "strutturale" ? "ma solo per la struttura" : "per un motivo che non riconosco"));
    }
    // I file NUOVI (una migrazione, un aiutante): da soli non c'erano alla base, quindi «riportarli alla base»
    // vuol dire toglierli (12/11 sera, regola firmata da Nicola). Si tolgono TUTTI i file nuovi insieme e gli
    // esistenti restano corretti: così il rosso viene solo dai file nuovi (collaudo del 12/11 sera: togliendo
    // anche gli esistenti, una migrazione estranea accanto a una correzione vera risultava «provata»).
    // Se la prova nomina o importa un file nuovo, il rosso dice solo «manca il file»: la macchina non decide.
    // Ogni file nuovo anche DA SOLO: tolto lui e basta, gli altri restano. Un file nuovo estraneo (una migrazione che
    // apre una tabella) accanto alla riparazione vera dava «regge» col solo passo insieme (radiografia del 12/11 notte).
    if (nuovi.length > 1) for (const f of nuovi) {
      const p = join(repo, f);
      toccato = true;
      if (existsSync(p)) unlinkSync(p);
      const g1 = await lancia("② " + f + " tolto da solo");
      if (!rimettiUno(f)) { r = { esito: "non_ripristinato", uscita: 4, motivo: "NON tornato com'era: " + f }; return r; }
      if (g1.scaduto) { r = no("tempo scaduto al passo ② su " + f); return r; }
      if (verde(g1)) { nonMordono.push(f); passi.push("② " + f + " tolto da solo: ancora verde"); }
      else passi.push("② " + f + " tolto da solo: rossa");
    }
    if (nuovi.length) {
      toccato = true;
      for (const f of nuovi) { const p = join(repo, f); if (existsSync(p)) unlinkSync(p); }
      const g2 = await lancia("② file nuovi tolti insieme: " + nuovi.join(", "));
      const nonRimessi = a.file.filter((f) => !rimettiUno(f));
      if (nonRimessi.length) { r = { esito: "non_ripristinato", uscita: 4, motivo: "NON tornati com'erano: " + nonRimessi.join(", ") }; return r; }
      if (g2.scaduto) { r = no("tempo scaduto al passo ② con la correzione tolta"); return r; }
      const etichetta = nuovi.join(", ");
      if (verde(g2)) { nonMordono.push(...nuovi); passi.push("② file nuovi tolti: ancora verde"); }
      else {
        const importatiDalleProve = new Set(a.prove.flatMap((p) => [...importati(p, readFileSync(join(repo, p), "utf8"))]));
        // Diretto: la prova lo importa, o ne scrive il percorso fuori dai commenti (un import dinamico, un
        // readFileSync, un «esiste?»): guarda il file, non il comportamento (collaudo del 12/11 sera). Un file nuovo
        // di CODICE regge solo se lo usa un file della correzione che c'era già: un aiutante che il sito non usa
        // non cambia niente, e nessuna ricerca nel testo ferma chi spezza il nome (secondo collaudo del 12/11).
        const senzaCommenti = a.prove.map((p) => senzaCommentiDi(p, readFileSync(join(repo, p), "utf8"))).join("\n");
        const usatiDaiVecchi = new Set(a.file.filter((f) => base.get(f) !== null && oggi.get(f)).flatMap((f) => [...importati(f, oggi.get(f).dati.toString("utf8"))]));
        const eCodice = (f) => /\.(?:[cm]?[jt]sx?)$/.test(f);
        const diretti = nuovi.filter((f) => importatiDalleProve.has(f) || senzaCommenti.includes(f) || senzaCommenti.includes(f.replace(/\.[^./]+$/, "")) || (eCodice(f) && !usatiDaiVecchi.has(f)));
        // SQL: una migrazione nuova si prova ricostruendo il database (--sql); e se le prove nominano una funzione,
        // tabella o vista che solo lei crea, il rosso dice solo «il nome manca» (radiografia del 12/11 notte).
        const migrazioni = nuovi.filter((f) => /\.sql$/i.test(f));
        const senzaSql = a.sql === undefined ? migrazioni : [];
        const nomiSql = a.sql !== undefined ? migrazioni.flatMap((f) => nomiCreatiNuovi(oggi.get(f)?.dati.toString("utf8") ?? "", (nome) => creatoAllaBase(repo, a.base, nome)).filter((n) => new RegExp("\\b" + n.replace(/[.$]/g, "\\$&") + "\\b", "i").test(senzaCommenti)).map((n) => f + " crea " + n)) : [];
        const tipo = diretti.length || senzaSql.length || nomiSql.length ? "strutturale" : tipoDiRosso(g2.uscita);
        const perche = diretti.length ? " (un file nuovo è importato o nominato dalle prove, o è codice che nessun file della correzione usa: " + diretti.join(", ") + ")"
          : senzaSql.length ? " (una migrazione si prova con --sql, ricostruendo il database con e senza: " + senzaSql.join(", ") + ")"
          : nomiSql.length ? " (le prove nominano oggetti che solo la migrazione nuova crea: " + nomiSql.join(", ") + ")" : " (alla base non c'era)";
        if (tipo !== "comportamento") dubbi.push({ tipo, testo: etichetta + perche });
        passi.push("② file nuovi tolti: rossa, " + (tipo === "comportamento" ? "sul comportamento" : tipo === "strutturale" ? "ma solo per la struttura" : "per un motivo che non riconosco"));
      }
    }
    const diversi = rimettiTutto();
    if (diversi.length) { r = { esito: "non_ripristinato", uscita: 4, motivo: "NON tornati com'erano: " + diversi.join(", ") }; return r; }
    const g3 = await lancia("③ correzione rimessa");
    if (!verde(g3)) { passi.push("③ correzione rimessa: non verde"); r = { esito: "instabile", uscita: 1, motivo: "rimessa la correzione, le prove non tornano verdi: sono instabili" }; return r; }
    passi.push("③ correzione rimessa: verde · file identici a prima (byte e permessi)");
    if (nonMordono.length) r = { esito: "non_morde", uscita: 1, motivo: "con solo questi file alla base la prova resta verde: " + nonMordono.join(", ") + ". O il file non porta la correzione (toglilo da --file e dillo in nota), o gli serve una prova sua" };
    else if (dubbi.length) r = { esito: dubbi.some((d) => d.tipo === "strutturale") ? "rosso_strutturale" : "rosso_sconosciuto", uscita: 3, motivo: "la macchina non decide su: " + dubbi.map((d) => d.testo).join("; ") + ". Decide il collaudo, rimettendo il difetto com'e' scritto nella scheda" };
    else r = { esito: "regge", uscita: 0, motivo: "la prova morde: cade togliendo ognuno dei file corretti (i nuovi anche da soli e tutti insieme), e torna verde con la correzione" };
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
