#!/usr/bin/env node
// 🛑 CANCELLO DELLO STOP — l'unico freno che scatta nell'istante in cui dico «fatto».
//
// PERCHÉ ESISTE (Nicola, 31/7). In due giorni la stessa cosa è successa sei volte: un verdetto
// scritto e messo dove nessuno lo legge. Il sorvegliante parlava in un log di debug. watch-main
// contava «1716 rinvii CONSECUTIVI» dentro journalctl. misura-cieca stava per nascere muta uguale.
// Ogni volta ho riparato l'istanza, e ogni volta l'abitudine è rimasta intatta — perché l'abitudine
// non sta nel codice: sta nel MOMENTO in cui chiudo il lavoro.
//
// Quando finisco, scrivo il risultato vicino a dove stavo lavorando: il log è vicino al codice, la
// scheda è vicina al difetto, il file di consegna è vicino al reparto. Nessuno di quei posti è
// Nicola. E non me ne accorgo mai, perché scrivere il verdetto È la sensazione di aver finito.
//
// Tutti gli altri freni guardano il codice. Questo guarda il momento in cui dichiaro di aver finito,
// che è l'unico posto dove quel comportamento si manifesta.
//
// LA PROVA CHE SERVIVA, misurata il 31/7 su me stesso: nove difetti chiusi in quella sessione
// (AR-455, AR-462, AR-465..AR-471) — ZERO con una prova eseguibile. Nove volte «fatto» senza niente
// che potesse dire di no. AR-455 è il caso di scuola: chiuso perché «la riga in settings.json c'è»,
// mentre il freno che quella riga attaccava parlava a nessuno. Chiuso sulla lettera, non sull'effetto.
//
// COSA CONTROLLA — quattro cose meccaniche, nessun giudizio:
//   ① difetto chiuso senza prova eseguibile — `verifica.comando`. Un difetto che si chiude senza un
//      comando che possa fallire non è chiuso: è archiviato.
//   ② allarme scritto e non accodato — un file nuovo che contiene 🔴/CRITICO/bloccante mentre la coda
//      che Nicola legge (AZIONI-IN-ATTESA.md) non è stata toccata. È il verdetto senza lettore, colto
//      nell'atto.
//   ③ lezione nuova senza freno — una lezione che non nomina un `gate`. La regola di casa è già
//      questa; qui arriva un giro prima del cancello del lotto.
//   ④ lavoro consegnato senza esito (AR-154) — ho committato codice e non ho lasciato una riga in
//      nessun quaderno. Il rituale esiste dal giorno di AR-009 e dipende da un passo manuale: nello
//      sprint del Pannello il quaderno di @tech salta da 20/7 a 25/7 — quattro giorni consecutivi
//      (21, 22, 23, 24) con ZERO righe, mentre le PR si mergiavano a sette al giorno.
//
// COSA NON CONTROLLA, e va detto: non sa se ciò che ho scritto in chat sia vero, non legge il
// contenuto dei documenti, non giudica se un fix è giusto. Quattro misure sullo stato del lavoro, non
// sulla sua qualità. Dove passa un «forse», qui si tace.
//
// Uso:
//   node cervello/cancello-stop.mjs           # verdetto leggibile (nessun blocco)
//   node cervello/cancello-stop.mjs --hook    # per l'hook Stop: exit 2 = non ti lascio chiudere
//
// Exit: 0 = niente da dire · 2 = c'è qualcosa che stavo per lasciare indietro
//
// 🟢 Sola lettura: non scrive, non tocca git, non modifica file.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { percorsiDaGit } from "./percorsi-git.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);
const CANTIERE = "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json";
const APPRENDIMENTO = "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json";
const CODA = "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md";

/** I marcatori d'allarme: le forme con cui questa macchina scrive «questo è grave». */
export const ALLARMI = [/🔴/, /\bCRITICO\b/i, /\bbloccante\b/i];

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — funzioni pure. Prendono DUE stati (prima e dopo) e tornano cosa manca. Pure perché una
// prova le deve poter eseguire su stati finti: se misurassero com'è il repo adesso, domani sarebbero
// verdi o rosse per motivi che non c'entrano con la regola che difendono.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ① I difetti passati a «chiuso» in questo lavoro che non portano un comando capace di fallire.
 *
 * `verifica.comando` è la forma forte: un comando che si esegue. `{file, pattern}` è la forma debole
 * — controlla che una riga esista, cioè la FORMA del codice, e passerebbe identica su un fix rotto.
 * Un difetto chiuso senza nessuna delle due è una dichiarazione, e le dichiarazioni sono esattamente
 * quello che ci ha fatto perdere 31 ore.
 */
export function chiusiSenzaProva(prima = [], dopo = []) {
  const eraChiuso = new Set(prima.filter((d) => d.stato === "chiuso").map((d) => d.id));
  return dopo
    .filter((d) => d.stato === "chiuso" && !eraChiuso.has(d.id))
    .filter((d) => !d.verifica || !d.verifica.comando)
    .map((d) => ({ id: d.id, titolo: String(d.titolo || "").slice(0, 80), debole: Boolean(d.verifica) }));
}

/**
 * ② I file d'allarme scritti mentre la coda di Nicola resta intatta.
 *
 * È il verdetto senza lettore colto nell'atto: ho scritto «🔴 CRITICO» da qualche parte e non ho
 * messo niente dove lui guarda. Se la coda È stata toccata non dico niente — non ho modo di sapere
 * se la riga giusta è quella, e un guardiano che indovina viene spento.
 */
export function allarmiSenzaCoda(fileNuovi = [], codaToccata = false) {
  if (codaToccata) return [];
  return fileNuovi.filter((f) => ALLARMI.some((r) => r.test(f.contenuto || ""))).map((f) => f.file);
}

/**
 * ④ Lavoro di codice CONSEGNATO senza una riga di esito (AR-154).
 *
 * Il rituale «una riga ESITO dopo ogni lavoro 🟡/🔴» esiste dal giorno di AR-009, e dipende da un
 * passo manuale a fine lavoro. Il conto che ha presentato è misurato sul quaderno di @tech: durante
 * lo sprint del Pannello le date saltano da 20/7 a 25/7 — quattro giorni consecutivi (21, 22, 23, 24)
 * con ZERO righe, mentre le PR si mergiavano a sette al giorno. Non per pigrizia: sotto pressione si
 * chiude il bug dopo, non si registra quello prima — saltare la registrazione non rompe niente, e
 * quindi è sempre la prima cosa che salta. Un rituale che dipende dalla disciplina fallisce
 * esattamente quando servirebbe di più.
 *
 * Guarda i COMMIT del ramo, non l'albero di lavoro: a metà lavoro le modifiche non sono committate e
 * l'esito non è ancora dovuto — chiedere lì produrrebbe rumore a ogni turno, e il rumore spegne i
 * freni. Quando invece il lavoro è committato, è consegnato: quello è il momento in cui l'esito è
 * dovuto, ed è lo stesso punto che la scheda AR-154 indica («nel flusso di git-pr»).
 *
 * `memoria` sono le quattro cartelle che questo repo chiama memoria da sempre (le stesse di MEM_DIRS
 * in vps/aggiorna-cervello.sh): tutto il resto è lavoro che qualcuno dovrà rileggere.
 */
export const CARTELLE_MEMORIA = ["MyCity-Vault/", "consegne/", "creativi/", "memoria-squadra/"];

export function consegnaSenzaEsito(fileCommittati = []) {
  const codice = fileCommittati.filter((f) => !CARTELLE_MEMORIA.some((m) => f.startsWith(m)));
  if (!codice.length) return null;
  const quaderni = fileCommittati.filter((f) => f.startsWith("memoria-squadra/") && f.endsWith(".md"));
  if (quaderni.length) return null;
  return { quanti: codice.length, esempio: codice.slice(0, 3) };
}

/** ③ Le lezioni nuove che non nominano un freno: una lezione senza gate è una frase. */
export function lezioniSenzaGate(prima = [], dopo = []) {
  const gia = new Set(prima.map((l) => l.id));
  return dopo.filter((l) => !gia.has(l.id) && !String(l.gate || "").trim()).map((l) => l.id);
}

/**
 * Il verdetto. Torna le righe da dire e se si blocca.
 *
 * `giaBloccato` è la valvola anti-cappio: Claude Code passa `stop_hook_active: true` quando sta già
 * ripartendo per colpa di un blocco precedente. Bloccare di nuovo lì significherebbe un turno che non
 * finisce mai — e un freno che incastra viene spento entro il giorno, che è il peggiore degli esiti.
 */
export function verdetto({ chiusi = [], allarmi = [], lezioni = [], senzaEsito = null, giaBloccato = false } = {}) {
  const righe = [];
  for (const d of chiusi) {
    righe.push(
      `❌ ${d.id} l'ho chiuso senza una prova che possa fallire${d.debole ? " (c'è solo la forma debole file+pattern)" : ""}` +
        `\n   → ${d.titolo}\n   → aggiungi "verifica": { "comando": "node cervello/test/…" }, oppure riaprilo: chiuso senza prova è archiviato, non riparato.`,
    );
  }
  for (const f of allarmi) {
    righe.push(
      `❌ ho scritto un allarme in ${f} e non ho messo niente in AZIONI-IN-ATTESA.md` +
        `\n   → chi lo legge, e quando? Se la risposta è «nessuno, se non va a cercarlo», non ho finito.`,
    );
  }
  for (const id of lezioni) {
    righe.push(`❌ la lezione ${id} non nomina nessun freno\n   → una lezione senza gate è una frase: quale comando fallisce se viene violata?`);
  }
  if (senzaEsito) {
    righe.push(
      `❌ ho committato ${senzaEsito.quanti} file di lavoro e non ho lasciato una riga di esito in nessun quaderno (AR-154)` +
        `\n   → ${senzaEsito.esempio.join(", ")}${senzaEsito.quanti > senzaEsito.esempio.length ? ", …" : ""}` +
        `\n   → node cervello/chiusura-loop.mjs registra <reparto> "<contesto>" "<scorecard>" "<atteso>" "<reale>" "#tag"` +
        `\n   → atteso→reale è la calibrazione: senza, il lavoro è fatto e nessuno impara niente da com'è andato.`,
    );
  }
  if (!righe.length) return { blocca: false, righe: [] };
  if (giaBloccato) {
    return {
      blocca: false,
      righe: ["🛑 il cancello dello stop aveva già fermato questo turno: non blocco una seconda volta.", ...righe],
    };
  }
  return { blocca: true, righe: ["🛑 CANCELLO DELLO STOP — stavo per lasciare indietro questo:", ...righe] };
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O — git e filesystem. Sottile per scelta: tutto ciò che decide sta sopra.
// ─────────────────────────────────────────────────────────────────────────────

const git = (args) => execFileSync("git", args, { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

/** Il file com'era all'ultimo commit. `null` = non c'era (e allora «prima» è vuoto, non un errore). */
function daHead(percorso) {
  try {
    return JSON.parse(git(["show", `HEAD:${percorso}`]));
  } catch {
    return null;
  }
}

function daDisco(percorso) {
  try {
    return JSON.parse(readFileSync(join(REPO, percorso), "utf8"));
  } catch {
    return null;
  }
}

/**
 * I documenti NUOVI che questo lavoro ha scritto, col loro contenuto.
 *
 * Solo i file appena creati, e solo `.md`. Non è pigrizia, è la lezione «menzione ≠ istanza» pagata
 * due volte in questo repo: alla prima prova dal vivo il cancello ha accusato `cantiere-difetti.json`
 * di essere un allarme non accodato — mentre quel file NOMINA i bloccanti per mestiere, è il registro.
 * Un guardiano che grida sul proprio registro viene spento entro il giorno.
 *
 * Nessun elenco di file esenti: sarebbe il perimetro letterale di AR-347, e domani un registro nuovo
 * rimetterebbe il falso positivo. La regola è generale — un allarme è un DOCUMENTO che nasce adesso,
 * non un registro che si aggiorna.
 *
 * COPERTURA DICHIARATA: un allarme aggiunto in fondo a un documento che esisteva già non viene visto.
 */
function fileDelLavoro() {
  let righe = [];
  try {
    righe = git(["status", "--porcelain"]).split("\n").filter(Boolean);
  } catch {
    return { file: [], codaToccata: false };
  }
  const codaToccata = righe.some((r) => r.slice(3).trim() === CODA);
  const nuovi = righe.filter((r) => /^(\?\?|A |AM)/.test(r)).map((r) => r.slice(3).trim());
  const file = [];
  for (const p of nuovi) {
    if (!/\.md$/.test(p) || p === CODA) continue;
    try {
      const abs = join(REPO, p);
      if (!existsSync(abs)) continue;
      file.push({ file: p, contenuto: readFileSync(abs, "utf8").slice(0, 200_000) });
    } catch {
      // Illeggibile: non è una colpa, è un file che non posso guardare. Taccio invece di accusare.
    }
  }
  return { file, codaToccata };
}

/** I file che questo ramo ha COMMITTATO rispetto alla base: il lavoro consegnato, non quello in corso. */
function fileCommittatiSulRamo() {
  // Dalla PORTA, non da git a mano (AR-339): con un nome accentato git restituisce il percorso citato
  // in ottali, e un quaderno con l'accento smetterebbe di contare come esito scritto. Preso dal
  // guardiano che quella regola la fa rispettare — la seconda volta oggi, sullo stesso errore.
  for (const base of ["origin/main", "main"]) {
    try {
      return percorsiDaGit(["diff", `${base}...HEAD`, "--name-only"], { cwd: REPO });
    } catch {
      // provo la base successiva: un riferimento assente non e' un verdetto.
    }
  }
  return null; // cieco: non accuso nessuno di non aver scritto l'esito
}

async function leggiStdin() {
  const pezzi = [];
  for await (const p of process.stdin) pezzi.push(p);
  return Buffer.concat(pezzi).toString("utf8");
}

async function main() {
  const argv = process.argv.slice(2);
  const hook = argv.includes("--hook");

  let giaBloccato = false;
  if (hook) {
    try {
      const ev = JSON.parse(await leggiStdin());
      giaBloccato = Boolean(ev?.stop_hook_active);
    } catch {
      // Nessun payload leggibile: proseguo come primo giro. Non è un motivo per tacere.
    }
  }

  const cantierePrima = daHead(CANTIERE)?.difetti || [];
  const cantiereDopo = daDisco(CANTIERE)?.difetti || [];
  const lezPrima = daHead(APPRENDIMENTO)?.lezioni || [];
  const lezDopo = daDisco(APPRENDIMENTO)?.lezioni || [];
  const { file, codaToccata } = fileDelLavoro();

  const committati = fileCommittatiSulRamo();
  const v = verdetto({
    senzaEsito: committati ? consegnaSenzaEsito(committati) : null,
    chiusi: chiusiSenzaProva(cantierePrima, cantiereDopo),
    allarmi: allarmiSenzaCoda(file, codaToccata),
    lezioni: lezioniSenzaGate(lezPrima, lezDopo),
    giaBloccato,
  });

  if (!v.righe.length) {
    if (!hook) console.log("✅ niente da lasciare indietro.");
    process.exit(0);
  }

  // Fuori dall'hook vale il contratto dei guardiani (AR-322): 1 = ho trovato qualcosa. Il 2 è
  // riservato allo `Stop`, dove è l'unico codice che BLOCCA la chiusura del turno.

  // Su `Stop` è stderr + exit 2 il canale che TORNA a me: stdout finirebbe in un log, che è
  // esattamente il difetto per cui questo file esiste.
  const testo = v.righe.join("\n");
  if (v.blocca) {
    console.error(testo);
    process.exit(hook ? 2 : 1);
  }
  console.log(testo);
  process.exit(hook ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
