#!/usr/bin/env node
// 🧪 PROVA DEL SITO — le prove mute e mirate che una squadra lancia nel suo worktree.
//
// PERCHE' ESISTE. Una squadra dell'ondata che lancia `npm run verify` legge la suite intera a ogni
// giro: migliaia di righe che entrano nel contesto e ci restano, rilette a ogni turno successivo
// (misura del 25/10: un analista da 29 turni ha letto 3,5 milioni di gettoni dalla cache, circa tre
// quarti di tutta la sua entrata). Qui le stesse tre domande — il tipo regge, il lint regge, le prove
// collegate ai file reggono — costano al massimo 30 righe a schermo. Il resto va in un log, e il
// percorso del log si stampa: chi vuole il dettaglio lo apre, chi non ne ha bisogno non lo paga.
//
// I TRE PASSI (i nomi veri del sito, da package.json e vitest.config.ts):
//   ① tsc --noEmit --pretty false           sul progetto intero (il tipo non si prova a pezzi)
//   ② eslint --quiet <file>                 solo sui file dati, solo gli errori
//   ③ vitest related --run --reporter=dot --passWithNoTests <file>   solo le prove che li importano
// ⚠️ `vitest related` e `--reporter=dot` esistono nella documentazione di vitest; la versione del
// sito (4.1.7 nel package-lock) qui NON si e' potuta provare: il sito non ha node_modules in questa
// macchina. Se il comando non c'e', il passo esce «non ha potuto girare» (2), mai verde.
// `--passWithNoTests` serve perche' un file senza prove collegate farebbe uscire vitest con 1: un
// rosso falso. Ma quel verde vuoto NON e' un verde: esce 2. Il vitest verde conta solo se la sua
// uscita dice «N passed» con N da 1 in su — una prova vista passare, non l'assenza di un errore.
// Perche': un .sql, un .yml o un .sh non li importa nessuna prova, quindi vitest related non trova
// niente; con l'uscita 0 la prova «rossa-poi-verde» della squadra non poteva diventare rossa mai, e
// arrivava nel frammento come «tutto verde». La squadra deve passare in --file anche la prova che ha
// scritto (tests/unit/…): vitest related fa girare i file di prova che gli si danno.
// Se vitest 4 scrivesse il riassunto con altre parole, ogni verde diventerebbe 2 con la nota che lo
// dice: un falso «non provato» si vede e si corregge, un falso verde no.
//
// IL TEMPO. Tutti e tre i passi stanno dentro UN tetto (PROVA_SITO_TIMEOUT_MS, 480 secondi di
// default). Tre numeri che si tengono: 480 qui < «timeout 540» con cui la squadra lancia la prova <
// 600 secondi, il massimo dello strumento Bash di un agente (che senza un timeout dichiarato si ferma a
// 120). Prima il tetto era 840 sotto un «timeout 900»: lo strumento uccideva la prova a 600 secondi,
// prima del verdetto. E un tetto per passo da 600 secondi arrivava a 1.800. Per lo stesso motivo
// la PRIMA riga, con la cartella dei log, esce subito: anche un processo ucciso a meta' lascia la
// strada per leggere quello che ha fatto.
//
// Uscita: 0 = tutto verde · 1 = almeno un passo rosso (una cosa vista vale piu' di una non misurata)
// · 2 = non ha potuto girare o non ha provato niente (repo inesistente, node_modules mancante, comando
// assente, file dato che non esiste o fuori dal repo, eslint che esce 2 per la configurazione, verde
// vuoto, tempo finito). 🟢 Esegue solo prove in sola lettura sul codice: non installa, non scrive nel repo.
// ⚠️ Non risolto, detto: vitest scrive la sua cache in node_modules/.vite, e i worktree delle squadre
// condividono node_modules col link. Un'opzione per spostarla nella 4.1.7 qui non si e' potuta
// provare, e un'opzione sbagliata farebbe fallire ogni prova: per ora resta condivisa.
//
// Uso:
//   node cervello/prova-sito.mjs --repo <worktree del sito> --file app/a.ts,lib/b.tsx
// Per le prove: PROVA_SITO_ESECUTORE=<modulo .mjs> sostituisce chi esegue i comandi (default export
// con la firma di spawnSync), PROVA_SITO_LOG=<cartella> sceglie dove vanno i log,
// PROVA_SITO_TIMEOUT_MS il tetto di tempo di tutti i passi insieme.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

/** Il tetto delle righe a schermo, in tutto. */
export const MAX_RIGHE = 30;
const MAX_LARGHEZZA = 180; // una riga di tsc puo' portarsi dietro un tipo da 2 KB
/** Il tempo di TUTTI i passi insieme: sotto il «timeout 540» della squadra e i 600 secondi dello strumento Bash. */
export const TEMPO_TOTALE_MS = 480_000;
/** Il tetto dello strumento Bash di un agente (600 secondi al massimo): la prova intera deve finire prima. */
export const TETTO_BASH_MS = 600_000;
const MIN_PASSO_MS = 1_000; // sotto, un passo non fa in tempo a partire: e' un «tempo finito», non un rosso
const DA_LINTARE = /\.(tsx?|jsx?|mjs|cjs)$/;

/** Le righe che portano l'errore, nei formati veri di tsc, eslint e vitest. */
const RIGA_DI_ERRORE = /error TS\d+|\bFAIL\b|✗|×|✖|\berror\b|AssertionError|\bError:|Expected|Received|❯ .+:\d+/;
const NESSUNA_PROVA = /No test files found/i;
/** La prova che vitest ha fatto girare qualcosa: «Tests  3 passed (3)» nel riassunto. */
const PROVE_PASSATE = /\b[1-9]\d* passed\b/;

/** I passi, come dati: chi li esegue e chi li prova leggono la stessa lista. */
export function passi(file) {
  const lintabili = file.filter((f) => DA_LINTARE.test(f));
  return [
    // `rossi` = le uscite che vogliono dire «ho trovato errori nel codice». Le altre sono un comando
    // che non ha potuto lavorare: eslint esce 2 per una configurazione rotta (un plugin che il link a
    // node_modules non risolve), e quello non e' un rosso del fix, e' un «non misurato».
    { nome: "tsc", bin: "tsc", argomenti: ["--noEmit", "--pretty", "false"], rossi: [1, 2] },
    lintabili.length
      ? { nome: "eslint", bin: "eslint", argomenti: ["--quiet", ...lintabili], rossi: [1] }
      : { nome: "eslint", salta: "nessun file da lint fra quelli dati" },
    { nome: "vitest", bin: "vitest", argomenti: ["related", "--run", "--reporter=dot", "--passWithNoTests", ...file], rossi: [1] },
  ];
}

const taglia = (r) => (r.length > MAX_LARGHEZZA ? r.slice(0, MAX_LARGHEZZA - 1) + "…" : r);

/** Le righe d'errore di un'uscita rossa; se nessuna combacia, la coda (un rosso non resta muto). */
export function righeDiErrore(testo, quante) {
  const tutte = String(testo || "").split("\n").map((r) => r.trimEnd()).filter((r) => r.trim());
  const errori = tutte.filter((r) => RIGA_DI_ERRORE.test(r));
  const scelte = (errori.length ? errori : tutte.slice(-quante)).slice(0, quante);
  // Il rientro si mette PRIMA del taglio: dopo, una riga lunga usciva da 184 caratteri, oltre il tetto.
  return { righe: scelte.map((r) => taglia("    " + r.trim())), totali: errori.length };
}

/**
 * Il verdetto di tutti i passi e le righe da stampare, entro MAX_RIGHE. Funzione pura: riceve gli
 * esiti gia' eseguiti ({nome, stato: verde|rosso|cieco|saltato, uscita, log, nota}).
 */
export function componi(esiti, maxRighe = MAX_RIGHE) {
  const rossi = esiti.filter((e) => e.stato === "rosso");
  const codice = rossi.length ? 1 : esiti.some((e) => e.stato === "cieco" || e.stato === "vuoto") ? 2 : 0;
  // Una riga per passo + una di chiusura sono fisse; quello che avanza si divide fra i rossi.
  const fisse = esiti.length + 1;
  const perRosso = rossi.length ? Math.max(1, Math.floor((maxRighe - fisse) / rossi.length)) : 0;
  const righe = [];
  for (const e of esiti) {
    if (e.stato === "verde") righe.push(`✅ ${e.nome}${e.nota ? ` — ${e.nota}` : ""}`);
    else if (e.stato === "saltato") righe.push(`➖ ${e.nome}: saltato, ${e.nota}`);
    else if (e.stato === "cieco") righe.push(taglia(`⚪ ${e.nome}: non ha potuto girare — ${e.nota}`));
    else if (e.stato === "vuoto") righe.push(taglia(`⚪ ${e.nome}: nessuna prova ha girato — ${e.nota}`));
    else {
      const { righe: dentro, totali } = righeDiErrore(e.uscita, perRosso);
      righe.push(taglia(`❌ ${e.nome}: rosso (${totali || "nessuna"} righe d'errore) · log ${e.log}`));
      righe.push(...dentro);
    }
  }
  const vuoto = codice === 2 && esiti.some((e) => e.stato === "vuoto");
  const verdetto = codice === 0 ? "✅ tutto verde"
    : codice === 1 ? "❌ qualcosa e' rosso"
    : vuoto ? "⚪ nessuna prova ha girato sui file dati: non e' un verde (metti in --file anche la prova che hai scritto)"
    : "⚪ non ho potuto provare tutto: non e' un verde";
  righe.push(verdetto);
  return { codice, righe: righe.slice(0, maxRighe - 1).concat(righe.length > maxRighe - 1 ? [righe[righe.length - 1]] : []) };
}

/** I controlli prima di lanciare qualcosa: ognuno, se manca, e' un «non ha potuto girare». */
export function prerequisiti(repo, file) {
  if (!repo) return "manca --repo <worktree del sito>";
  if (!existsSync(repo) || !statSync(repo).isDirectory()) return `il repo ${repo} non esiste`;
  if (!existsSync(join(repo, "package.json"))) return `${repo} non ha package.json: non e' il sito`;
  if (!existsSync(join(repo, "node_modules"))) {
    return `${repo} non ha node_modules: collega quello del repo principale (ln -s <repo>/node_modules ${repo}/node_modules), non installare`;
  }
  if (!file.length) return "manca --file a.ts,b.tsx: senza file vitest related girerebbe su niente, e la suite intera non si lancia qui";
  // Un percorso assoluto fuori dal repo, o che ne esce con «..», proverebbe un altro albero: il verde
  // sarebbe di un file che la squadra non ha nel suo worktree.
  const fuori = file.filter((f) => isAbsolute(f) || f.split(/[\\/]/).includes(".."));
  if (fuori.length) return `questi file sono fuori dal repo: ${fuori.slice(0, 5).join(", ")} — si danno relativi alla sua radice`;
  const assenti = file.filter((f) => !existsSync(join(repo, f)));
  if (assenti.length) return `questi file non esistono nel repo: ${assenti.slice(0, 5).join(", ")} — un file sbagliato darebbe un verde su niente`;
  return null;
}

/** Esegue i passi con l'esecutore dato (firma di spawnSync) e scrive ogni uscita nel suo log. */
export function eseguiPassi(repo, file, { esecutore = spawnSync, cartellaLog, tempoTotaleMs = TEMPO_TOTALE_MS, adesso = Date.now } = {}) {
  const dirLog = cartellaLog || mkdtempSync(join(tmpdir(), "prova-sito-"));
  mkdirSync(dirLog, { recursive: true });
  const scadenza = adesso() + tempoTotaleMs;
  const esiti = [];
  for (const p of passi(file)) {
    if (p.salta) { esiti.push({ nome: p.nome, stato: "saltato", nota: p.salta }); continue; }
    const bin = join(repo, "node_modules", ".bin", p.bin);
    const log = join(dirLog, `${p.nome}.log`);
    if (!existsSync(bin)) {
      esiti.push({ nome: p.nome, stato: "cieco", nota: `${p.bin} non c'e' in node_modules/.bin`, log });
      continue;
    }
    const tempo = scadenza - adesso();
    if (tempo < MIN_PASSO_MS) {
      esiti.push({ nome: p.nome, stato: "cieco", nota: `tempo finito prima di partire (tetto ${Math.round(tempoTotaleMs / 1000)} secondi per tutti i passi)`, log });
      continue;
    }
    let r;
    try {
      r = esecutore(bin, p.argomenti, { cwd: repo, encoding: "utf8", timeout: tempo, maxBuffer: 64 * 1024 * 1024 });
    } catch (e) {
      r = { status: null, error: e, stdout: "", stderr: "" };
    }
    const uscita = `${r?.stdout || ""}${r?.stderr ? `\n${r.stderr}` : ""}`;
    writeFileSync(log, `$ ${p.bin} ${p.argomenti.join(" ")}\n${uscita}`);
    if (r?.error || r?.status === null || r?.status === undefined) {
      const perche = r?.error?.code === "ETIMEDOUT" ? `oltre ${Math.round(tempo / 1000)} secondi` : r?.error?.message || `fermato (${r?.signal || "senza codice"})`;
      esiti.push({ nome: p.nome, stato: "cieco", nota: `${perche} · log ${log}`, log });
    } else if (r.status === 0) {
      if (p.nome === "vitest" && (NESSUNA_PROVA.test(uscita) || !PROVE_PASSATE.test(uscita))) {
        const nota = NESSUNA_PROVA.test(uscita) ? "nessun file di prova collegato a quelli dati" : "l'uscita non dice «N passed»";
        esiti.push({ nome: p.nome, stato: "vuoto", nota, log }); // la cartella dei log e' gia' nella prima riga
      } else esiti.push({ nome: p.nome, stato: "verde", nota: "", log });
    } else if ((p.rossi || [1]).includes(r.status)) {
      esiti.push({ nome: p.nome, stato: "rosso", uscita, log });
    } else {
      esiti.push({ nome: p.nome, stato: "cieco", nota: `uscita ${r.status}: il comando non ha potuto lavorare (configurazione?), non e' un rosso del codice · log ${log}`, log });
    }
  }
  return { esiti, dirLog };
}

/** I file dati: virgole, spazi e un eventuale «./» davanti; un percorso assoluto dentro il repo diventa relativo. */
export function leggiFile(valore, repo) {
  return String(valore || "")
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean)
    .map((f) => (isAbsolute(f) && repo && f.startsWith(resolve(repo) + "/") ? f.slice(resolve(repo).length + 1) : f.replace(/^\.\//, "")));
}

export function leggiArgomenti(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a !== "--repo" && a !== "--file") return { errore: `«${a}» non e' un argomento che conosco (servono --repo <dir> --file a.ts,b.tsx)` };
    const v = argv[i + 1];
    if (v === undefined || v.startsWith("--")) return { errore: `${a} vuole un valore dopo` };
    o[a.slice(2)] = v;
    i++;
  }
  return o;
}

async function main() {
  const o = leggiArgomenti(process.argv.slice(2));
  const fuori = (righe, codice) => {
    for (const r of righe) console.log(r);
    process.exit(codice);
  };
  if (o.errore) fuori([`⚪ ${o.errore}`], 2);
  const repo = o.repo ? resolve(o.repo) : "";
  const file = leggiFile(o.file, repo);
  const manca = prerequisiti(repo, file);
  if (manca) fuori([`⚪ non ho potuto provare: ${manca}`], 2);

  let esecutore = spawnSync;
  if (process.env.PROVA_SITO_ESECUTORE) {
    try {
      esecutore = (await import(pathToFileURL(resolve(process.env.PROVA_SITO_ESECUTORE)).href)).default;
    } catch (e) {
      fuori([`⚪ non ho potuto caricare l'esecutore ${process.env.PROVA_SITO_ESECUTORE}: ${e.message}`], 2);
    }
  }
  // La cartella dei log si sceglie e si stampa PRIMA dei passi: se la squadra uccide il processo a
  // meta', questa riga c'e' gia', e i log dei passi finiti sono gia' scritti.
  const cartellaLog = process.env.PROVA_SITO_LOG || mkdtempSync(join(tmpdir(), "prova-sito-"));
  console.log(`🧪 prova-sito · ${file.length} file · log in ${cartellaLog}`);
  const tempoTotaleMs = Number(process.env.PROVA_SITO_TIMEOUT_MS) > 0 ? Number(process.env.PROVA_SITO_TIMEOUT_MS) : TEMPO_TOTALE_MS;
  const { esiti } = eseguiPassi(repo, file, { esecutore, cartellaLog, tempoTotaleMs });
  const { codice, righe } = componi(esiti, MAX_RIGHE - 1); // una riga l'ha gia' presa la testa
  fuori(righe, codice);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
