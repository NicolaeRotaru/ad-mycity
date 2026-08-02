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
//   ② allarme scritto e non accodato — 🔴/CRITICO/bloccante in un documento nuovo, oppure AGGIUNTO a
//      una consegna che esisteva già, mentre la coda che Nicola legge (AZIONI-IN-ATTESA.md) non è
//      stata toccata. È il verdetto senza lettore, colto nell'atto.
//   ③ lezione nuova senza freno — una lezione che non nomina un `gate`. La regola di casa è già
//      questa; qui arriva un giro prima del cancello del lotto.
//   ④ lavoro consegnato senza esito (AR-154) — ho committato codice e nessuna riga NUOVA in un
//      quaderno porta la calibrazione «atteso … → reale …». Il rituale esiste dal giorno di AR-009 e
//      dipende da un passo manuale: nello sprint del Pannello il quaderno di @tech salta da 20/7 a
//      25/7 — quattro giorni consecutivi (21, 22, 23, 24) con ZERO righe, mentre le PR si mergiavano
//      a sette al giorno.
//
// COSA NON CONTROLLA, e va detto: non sa se ciò che ho scritto in chat sia vero, non giudica se un fix
// è giusto, e — la più importante — non sa se la riga di esito parli DI QUESTO lavoro. Nessuna regola
// meccanica distingue «ho raccontato il lavoro giusto» da «ho raccontato un lavoro»: quel giudizio
// resta a Nicola, che la riga la legge in Cabina. Quattro misure sullo stato del lavoro, non sulla sua
// qualità. Dove passa un «forse», qui si tace.
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
export function allarmiSenzaCoda(fileNuovi = [], codaToccata = false, consegneModificate = []) {
  if (codaToccata) return [];
  const daiNuovi = fileNuovi.filter((f) => ALLARMI.some((r) => r.test(f.contenuto || ""))).map((f) => f.file);
  // Il buco che restava (1/8): un allarme AGGIUNTO in fondo a una consegna che esisteva già non era
  // un file nuovo, quindi non lo vedeva nessuno. È il caso più probabile dei due — le consegne si
  // aggiornano molto più spesso di quanto nascano.
  const daiModificati = consegneModificate.filter((f) => (f.righe || []).some((r) => ALLARMI.some((m) => m.test(r)))).map((f) => f.file);
  return [...new Set([...daiNuovi, ...daiModificati])];
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

/**
 * La forma di una riga di esito VERA — data, contesto, e la calibrazione `atteso → reale`.
 *
 * Perché la forma e non solo il file (limite ① della prima stesura, 1/8): la prima versione si
 * accontentava che un `memoria-squadra/*.md` comparisse fra i file committati. Bastava una virgola in
 * un quaderno per passare — cioè il freno chiedeva di TOCCARE un file, non di dire com'era andata. E
 * un freno che si può soddisfare senza fare la cosa che difende insegna a soddisfarlo, non a farla.
 *
 * `atteso → reale` è obbligatorio e non è un capriccio di formato: è l'unica parte che vale qualcosa.
 * Il resto — data, contesto, tag — descrive il lavoro; solo la distanza fra ciò che mi aspettavo e
 * ciò che è successo calibra il giudizio della volta dopo. Una riga senza quella è una ricevuta.
 */
export const RIGA_ESITO = /^-\s*\d{4}-\d{2}-\d{2}[^\n]*·[^\n]*\batteso\b[^\n]*→[^\n]*\breale\b/;

/** Le righe AGGIUNTE ai quaderni che sono davvero righe di esito. */
export function esitiScritti(righeAggiunte = []) {
  return righeAggiunte.map((r) => String(r).trim()).filter((r) => RIGA_ESITO.test(r));
}

/**
 * ④ Lavoro di codice CONSEGNATO senza una riga di esito (AR-154).
 *
 * Guarda le righe AGGIUNTE dal ramo, non i file toccati — così chiude anche il limite ②: un quaderno
 * modificato per un altro motivo (una potatura, un riordino) non toglie né aggiunge una riga di
 * esito, e quindi non soddisfa più il freno per sbaglio.
 *
 * COPERTURA DICHIARATA: che la riga parli DI QUESTO lavoro non è verificabile da una macchina —
 * nessuna regola meccanica distingue «ho raccontato il lavoro giusto» da «ho raccontato un lavoro».
 * Quello resta un giudizio di Nicola, che la riga la legge in Cabina → Memoria → Quaderni senior. Il
 * freno garantisce che una riga con la calibrazione dentro esista e arrivi dove lui guarda.
 */
export function consegnaSenzaEsito(fileCommittati = [], righeAggiunteNeiQuaderni = []) {
  const codice = fileCommittati.filter((f) => !CARTELLE_MEMORIA.some((m) => f.startsWith(m)));
  if (!codice.length) return null;
  if (esitiScritti(righeAggiunteNeiQuaderni).length) return null;
  const quaderni = fileCommittati.filter((f) => f.startsWith("memoria-squadra/") && f.endsWith(".md"));
  return { quanti: codice.length, esempio: codice.slice(0, 3), quadernoToccato: quaderni.length > 0 };
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
export function verdetto({ chiusi = [], allarmi = [], lezioni = [], senzaEsito = null, ciechi = [], giaBloccato = false } = {}) {
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
        (senzaEsito.quadernoToccato
          ? `\n   → un quaderno l'ho toccato, ma non c'è nessuna riga nuova con «atteso … → reale …»: quella è la parte che vale.`
          : "") +
        `\n   → node cervello/chiusura-loop.mjs registra <reparto> "<contesto>" "<scorecard>" "<atteso>" "<reale>" "#tag"` +
        `\n   → atteso→reale è la calibrazione: senza, il lavoro è fatto e nessuno impara niente da com'è andato.`,
    );
  }
  // ⚪ CIECO NON È VERDE (limite ③ della prima stesura). Quando non trovo un ramo con cui confrontarmi
  // — clone superficiale, `origin/main` assente — il controllo ④ non gira. Prima quel caso taceva, e
  // un silenzio è indistinguibile da un «va tutto bene»: esattamente la malattia che questo file cura.
  const noteCieche = ciechi.map((c) => `⚪ ${c}`);
  if (!righe.length) return { blocca: false, cieco: noteCieche.length > 0, righe: noteCieche };
  if (giaBloccato) {
    return {
      blocca: false,
      cieco: noteCieche.length > 0,
      righe: ["🛑 il cancello dello stop aveva già fermato questo turno: non blocco una seconda volta.", ...righe, ...noteCieche],
    };
  }
  return { blocca: true, cieco: noteCieche.length > 0, righe: ["🛑 CANCELLO DELLO STOP — stavo per lasciare indietro questo:", ...righe, ...noteCieche] };
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
 * Il buco che restava — «un allarme aggiunto in fondo a un documento che esisteva già non viene
 * visto» — lo chiude `righeAggiunteNelle()` qui sotto, sulle consegne committate.
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

/** La base con cui confrontarsi. `null` = non l'ho trovata, e allora il controllo ④ è CIECO. */
function baseDelRamo() {
  for (const base of ["origin/main", "main"]) {
    try {
      git(["rev-parse", "--verify", "--quiet", base]);
      return base;
    } catch {
      // provo la base successiva: un riferimento assente non e' un verdetto.
    }
  }
  return null;
}

/** I file che questo ramo ha COMMITTATO rispetto alla base: il lavoro consegnato, non quello in corso. */
function fileCommittatiSulRamo(base) {
  // Dalla PORTA, non da git a mano (AR-339): con un nome accentato git restituisce il percorso citato
  // in ottali, e un quaderno con l'accento smetterebbe di contare come esito scritto. Preso dal
  // guardiano che quella regola la fa rispettare — la seconda volta oggi, sullo stesso errore.
  try {
    return percorsiDaGit(["diff", `${base}...HEAD`, "--name-only"], { cwd: REPO });
  } catch {
    return null;
  }
}

/**
 * Le righe AGGIUNTE dal ramo nei file che stanno sotto una certa cartella.
 *
 * Il contenuto di un diff, non i suoi percorsi: qui la porta di AR-339 non serve (quella difende dai
 * NOMI citati in ottali), e infatti i nomi qui non si usano per decidere — si usano per raggruppare.
 * `-U0` perché il contesto non è stato aggiunto da questo lavoro: contarlo darebbe allarmi che c'erano
 * già, cioè un guardiano che accusa il passato.
 */
function righeAggiunteNelle(base, cartella, soloMd = true) {
  let grezzo;
  try {
    grezzo = git(["diff", "-U0", "--no-color", `${base}...HEAD`, "--", cartella]);
  } catch {
    return null;
  }
  const perFile = new Map();
  let corrente = null;
  for (const riga of grezzo.split("\n")) {
    const m = /^\+\+\+ b\/(.+)$/.exec(riga);
    if (m) {
      corrente = m[1] === "/dev/null" || (soloMd && !m[1].endsWith(".md")) ? null : m[1];
      if (corrente && !perFile.has(corrente)) perFile.set(corrente, []);
      continue;
    }
    if (corrente && riga.startsWith("+") && !riga.startsWith("+++")) perFile.get(corrente).push(riga.slice(1));
  }
  return [...perFile.entries()].map(([file, righe]) => ({ file, righe }));
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

  const base = baseDelRamo();
  const committati = base ? fileCommittatiSulRamo(base) : null;
  const righeQuaderni = base ? righeAggiunteNelle(base, "memoria-squadra") : null;
  const consegneModificate = base ? righeAggiunteNelle(base, "consegne") : null;

  const ciechi = [];
  if (!committati || !righeQuaderni) {
    ciechi.push(
      "non ho trovato un ramo con cui confrontarmi (né origin/main né main): il controllo sull'esito del lavoro consegnato NON ha misurato. Il verde qui sotto non copre quella parte.",
    );
  }

  const v = verdetto({
    senzaEsito: committati && righeQuaderni ? consegnaSenzaEsito(committati, righeQuaderni.flatMap((f) => f.righe)) : null,
    chiusi: chiusiSenzaProva(cantierePrima, cantiereDopo),
    allarmi: allarmiSenzaCoda(file, codaToccata, consegneModificate || []),
    lezioni: lezioniSenzaGate(lezPrima, lezDopo),
    ciechi,
    giaBloccato,
  });

  if (!v.righe.length) {
    if (!hook) console.log("✅ niente da lasciare indietro.");
    process.exit(0);
  }

  // Fuori dall'hook vale il contratto dei guardiani (AR-322): 1 = ho trovato qualcosa, 2 = non ho
  // potuto misurare. Dentro l'hook `Stop` il 2 è l'unico codice che BLOCCA la chiusura del turno —
  // quindi lì un cieco NON può uscire 2: un clone superficiale incastrerebbe ogni turno, e un freno
  // che incastra viene spento entro il giorno. È una perdita dichiarata, non un silenzio: nel cancello
  // del lotto (che gira in CI, dove i rami ci sono sempre) il cieco diventa ⚪ ed esce 2.
  const testo = v.righe.join("\n");
  if (v.blocca) {
    console.error(testo);
    process.exit(hook ? 2 : 1);
  }
  console.log(testo);
  if (hook) process.exit(0);
  process.exit(v.cieco && v.righe.every((r) => r.startsWith("⚪")) ? 2 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
