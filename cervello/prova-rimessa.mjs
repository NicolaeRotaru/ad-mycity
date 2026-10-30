#!/usr/bin/env node
// 🔁 PROVA RIMESSA — la prova della macchina: tolgo la correzione e guardo se la prova torna rossa.
//
// PERCHE' ESISTE. Il metodo snello delle ondate (CLAUDE.md, paragrafo 🪙, regola ③: «prima la macchina,
// poi l'agente»). Nell'ondata del 28/10, 27 subagenti su 36 controllavano; la domanda che ripetevano di
// piu' era meccanica: «se rimetto il difetto, la prova della squadra diventa rossa?». Qui la stessa
// domanda costa zero agenti. Referto: consegne/audit/2026-10-30-metodo-snello.md.
//
// I TRE PASSI, nel worktree della squadra:
//   ① le prove sul codice di oggi: devono essere VERDI, con almeno una prova vista passare;
//   ② i file corretti riportati com'erano sul commit di base (le prove restano quelle nuove): ROSSE;
//   ③ i file rimessi byte per byte come li ho trovati, e le prove di nuovo VERDI.
// Il contenuto di oggi lo leggo dal disco, non da git: una correzione non ancora committata non si perde.
// Lo rimetto in ogni caso — fine normale, errore, timeout, SIGINT/SIGTERM — e controllo che sia identico.
//
// IL ROSSO CHE NON PROVA NIENTE. Se al passo ② la prova cade solo perche' manca un nome che la correzione
// ha aggiunto («does not provide an export named», «is not a function», «Cannot find module»), e' rossa
// per la struttura, non per il comportamento: la macchina non sa decidere, e lo dice (uscita 3). Lo decide
// il collaudo, rimettendo il difetto com'e' scritto nella scheda. Un rosso senza segni ne' di asserzione
// ne' di struttura vale lo stesso 3: nel dubbio non e' un «regge».
//
// USCITA. 0 regge · 1 non regge (non_verde, non_morde, instabile) · 2 non provato (argomenti, git, tempo
// scaduto, nessuna prova vista passare) · 3 la macchina non decide (rosso_strutturale, rosso_sconosciuto)
// · 4 NON ripristinato: un file non e' tornato com'era (si guarda subito, a mano).
//
// 🟢 Scrive solo i file passati in --file, e li rimette com'erano. Niente git add, niente commit.
//
// Uso:
//   node cervello/prova-rimessa.mjs --repo <worktree> --base <commit> --file a.ts,b.ts --prove tests/unit/x.test.ts [--json]
//   --comando "<comando con {prove}>"   default: npx vitest run --reporter=dot {prove} (il sito usa vitest)
// Il tempo: PROVA_RIMESSA_TIMEOUT_MS per giro (default 150 secondi), tre giri dentro i 540 di «timeout 540».

import { spawn } from "node:child_process";
import { gitEsegui } from "./git-github.mjs";
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, normalize, isAbsolute } from "node:path";

const COMANDO_DEFAULT = "npx vitest run --reporter=dot {prove}";
const TIMEOUT_MS = Number(process.env.PROVA_RIMESSA_TIMEOUT_MS) > 0 ? Number(process.env.PROVA_RIMESSA_TIMEOUT_MS) : 150_000;

/** Un rosso d'asserzione: la prova ha guardato il comportamento ed e' caduta li'. */
// Solo il MESSAGGIO di un'asserzione caduta, mai il codice della prova: vitest stampa la riga che cade
// («expect(nuova(2)).toBe(4)») anche quando cade perche' `nuova` non esiste, e quella riga non e' un'asserzione.
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

/** Il rosso del passo ②: comportamento, struttura o sconosciuto. Un'asserzione vince sulla struttura. */
export function tipoDiRosso(testo) {
  if (ASSERZIONE.test(testo)) return "comportamento";
  if (STRUTTURA.test(testo)) return "strutturale";
  return "sconosciuto";
}

function argomenti(argv) {
  const a = { json: false, comando: COMANDO_DEFAULT };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--json") a.json = true;
    else if (["--repo", "--base", "--file", "--prove", "--comando"].includes(k)) a[k.slice(2)] = argv[++i];
    else throw new Error("argomento sconosciuto: " + k);
  }
  for (const k of ["repo", "base", "file", "prove"]) if (!a[k]) throw new Error("manca --" + k);
  const lista = (s) => String(s).split(",").map((x) => x.trim()).filter(Boolean);
  a.file = lista(a.file);
  a.prove = lista(a.prove);
  for (const p of [...a.file, ...a.prove]) {
    const n = normalize(p);
    if (isAbsolute(p) || n.startsWith("..")) throw new Error("percorso fuori dal repo: " + p + " (scrivilo relativo alla radice del sito)");
  }
  const doppi = a.file.filter((f) => a.prove.includes(f));
  if (doppi.length) throw new Error("un file non puo' essere insieme correzione e prova: " + doppi.join(", "));
  if (!a.comando.includes("{prove}")) throw new Error("--comando deve contenere {prove}");
  return a;
}

const citato = (s) => "'" + String(s).replace(/'/g, "'\\''") + "'";

function giro(repo, comando, prove, figli) {
  return new Promise((risolvi) => {
    const cmd = comando.replace("{prove}", prove.map(citato).join(" "));
    // NODE_TEST_CONTEXT arriva quando chi mi lancia e' dentro `node --test`: il `node --test` figlio
    // parlerebbe col padre invece di stampare il suo riassunto, e i tre verdetti uscirebbero falsi.
    const { NODE_TEST_CONTEXT, ...ambiente } = process.env;
    const figlio = spawn("bash", ["-c", cmd], { cwd: repo, env: ambiente, stdio: ["ignore", "pipe", "pipe"] });
    figli.add(figlio);
    let uscita = "";
    figlio.stdout.on("data", (d) => { uscita += d; });
    figlio.stderr.on("data", (d) => { uscita += d; });
    const sveglia = setTimeout(() => { figlio.scaduto = true; figlio.kill("SIGKILL"); }, TIMEOUT_MS);
    figlio.on("close", (codice) => {
      clearTimeout(sveglia);
      figli.delete(figlio);
      risolvi({ codice, uscita, scaduto: !!figlio.scaduto });
    });
  });
}

export async function provaRimessa(a) {
  const repo = a.repo;
  const passi = [];
  try { gitEsegui(["rev-parse", "--is-inside-work-tree"], repo); } catch (e) { return { esito: "non_provato", uscita: 2, passi, motivo: "non e' un repo git: " + repo }; }
  try { gitEsegui(["rev-parse", "--verify", "--quiet", a.base + "^{commit}"], repo); } catch (e) { return { esito: "non_provato", uscita: 2, passi, motivo: "la base non esiste: " + a.base }; }
  for (const p of a.prove) if (!existsSync(join(repo, p))) return { esito: "non_provato", uscita: 2, passi, motivo: "la prova non c'e': " + p };

  // Cosa c'e' oggi (dal disco) e cosa c'era alla base (da git). null = il file non esiste.
  const oggi = new Map(), base = new Map();
  for (const f of a.file) {
    const p = join(repo, f);
    oggi.set(f, existsSync(p) ? readFileSync(p) : null);
    let b = null;
    // ls-tree prima di show: un file che alla base non c'era (la correzione l'ha creato) non e' un errore.
    try { b = gitEsegui(["ls-tree", "--name-only", a.base, "--", f], repo) ? gitEsegui(["show", a.base + ":" + f], repo, {}, { grezzo: true }) : null; } catch (e) { b = null; }
    base.set(f, b);
    const o = oggi.get(f);
    if ((o === null && b === null) || (o && b && o.equals(b))) return { esito: "non_provato", uscita: 2, passi, motivo: "il file e' uguale alla base, non e' una correzione: " + f };
  }

  const figli = new Set();
  let rimessi = false;
  const rimetti = () => {
    if (rimessi) return [];
    rimessi = true;
    const diversi = [];
    for (const [f, c] of oggi) {
      const p = join(repo, f);
      try {
        if (c === null) { if (existsSync(p)) unlinkSync(p); }
        else { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, c); }
      } catch (e) { /* il controllo qui sotto lo vede */ }
      const ora = existsSync(p) ? readFileSync(p) : null;
      if (!((ora === null && c === null) || (ora && c && ora.equals(c)))) diversi.push(f);
    }
    return diversi;
  };
  const alSegnale = (s) => { for (const f of figli) f.kill("SIGKILL"); const d = rimetti(); process.stderr.write("⛔ fermata da " + s + (d.length ? ": NON RIMESSI " + d.join(", ") : ": file rimessi com'erano") + "\n"); process.exit(d.length ? 4 : 2); };
  const segnali = ["SIGINT", "SIGTERM", "SIGHUP"];
  for (const s of segnali) process.on(s, alSegnale);
  const allUscita = () => { rimetti(); };
  process.on("exit", allUscita);

  const log = [];
  const annota = (nome, g) => log.push("── " + nome + " (uscita " + g.codice + (g.scaduto ? ", tempo scaduto" : "") + ")\n" + g.uscita);
  let r;
  try {
    const g1 = await giro(repo, a.comando, a.prove, figli);
    annota("① codice di oggi", g1);
    if (g1.scaduto) { r = { esito: "non_provato", uscita: 2, motivo: "tempo scaduto al passo ①" }; return r; }
    if (!verde(g1)) {
      const n = passate(g1.uscita);
      r = n === 0 && g1.codice === 0 ? { esito: "non_provato", uscita: 2, motivo: "nessuna prova vista passare: una prova vuota non e' un verde" } : { esito: "non_verde", uscita: 1, motivo: "le prove non sono verdi sul codice di oggi" };
      return r;
    }
    passi.push("① codice di oggi: verde" + (passate(g1.uscita) !== null ? " (" + passate(g1.uscita) + " passate)" : ""));

    for (const [f, b] of base) {
      const p = join(repo, f);
      if (b === null) { if (existsSync(p)) unlinkSync(p); }
      else { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, b); }
    }
    const g2 = await giro(repo, a.comando, a.prove, figli);
    annota("② correzione tolta", g2);
    if (g2.scaduto) { r = { esito: "non_provato", uscita: 2, motivo: "tempo scaduto al passo ②" }; return r; }
    if (verde(g2)) { passi.push("② correzione tolta (" + a.file.length + " file alla base): ancora verde"); r = { esito: "non_morde", uscita: 1, motivo: "con la correzione tolta la prova resta verde: non prova la correzione" }; return r; }
    const tipo = tipoDiRosso(g2.uscita);
    passi.push("② correzione tolta (" + a.file.length + " file alla base): rossa, " + (tipo === "comportamento" ? "sul comportamento" : tipo === "strutturale" ? "ma solo per la struttura (manca un nome o un modulo)" : "per un motivo che non riconosco"));

    const diversi = rimetti();
    if (diversi.length) { r = { esito: "non_ripristinato", uscita: 4, motivo: "NON tornati com'erano: " + diversi.join(", ") }; return r; }
    const g3 = await giro(repo, a.comando, a.prove, figli);
    annota("③ correzione rimessa", g3);
    if (!verde(g3)) { passi.push("③ correzione rimessa: non verde"); r = { esito: "instabile", uscita: 1, motivo: "rimessa la correzione, le prove non tornano verdi: sono instabili" }; return r; }
    passi.push("③ correzione rimessa: verde · file identici a prima");
    r = tipo === "comportamento" ? { esito: "regge", uscita: 0, motivo: "la prova morde: rossa senza la correzione, verde con" }
      : { esito: tipo === "strutturale" ? "rosso_strutturale" : "rosso_sconosciuto", uscita: 3, motivo: "la macchina non decide: il rosso non viene da un'asserzione. Decide il collaudo, rimettendo il difetto com'e' scritto nella scheda" };
    return r;
  } finally {
    const diversi = rimetti();
    for (const s of segnali) process.off(s, alSegnale);
    process.off("exit", allUscita);
    if (diversi.length && r) r = { esito: "non_ripristinato", uscita: 4, motivo: "NON tornati com'erano: " + diversi.join(", ") };
    const file = join(tmpdir(), "prova-rimessa-" + process.pid + "-" + Date.now() + ".log");
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
