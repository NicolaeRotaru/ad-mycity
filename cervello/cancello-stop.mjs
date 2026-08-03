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
// COSA CONTROLLA — sei cose meccaniche, nessun giudizio:
//   ① difetto chiuso senza prova eseguibile — `verifica.comando`. Un difetto che si chiude senza un
//      comando che possa fallire non è chiuso: è archiviato.
//   ② allarme scritto e non accodato — un file nuovo che contiene 🔴/CRITICO/bloccante mentre la coda
//      che Nicola legge (AZIONI-IN-ATTESA.md) non è stata toccata. È il verdetto senza lettore, colto
//      nell'atto.
//   ③ lezione nuova senza freno — una lezione che non nomina un `gate`. La regola di casa è già
//      questa; qui arriva un giro prima del cancello del lotto.
//   ④ lavoro consegnato senza esito (AR-154) — ho committato codice e non ho lasciato una riga in
//      nessun quaderno. Il rituale esiste dal giorno di AR-009 e dipende da un passo manuale: nello
//      sprint del 21-24/7 il quaderno di @tech è restato fermo per 47 righe mentre le PR si mergiavano.
//
//   ⑤ testo consegnato a Nicola che non si capisce (AR-478) — un file .md nelle cartelle dove lui
//      legge che esce PEGGIORE di come è entrato. Delta verso la base, non totale: sul totale ogni
//      ritocco a un file lungo sarebbe un blocco, e un cancello che non può diventare verde si impara
//      ad aggirarlo.
//   ⑥ messaggio in chat che non si capisce (AR-481) — solo i messaggi lunghi. AR-478 aveva dichiarato
//      questo buco come non colmabile («la chat non è un file»). Era falso: l'hook `Stop` riceve
//      `transcript_path`, cioè il file dove Claude Code scrive la conversazione. La chat È un file.
//
// COSA NON CONTROLLA, e va detto: non sa se ciò che ho scritto sia VERO, non giudica se un fix è
// giusto, e soprattutto **non sa se Nicola ha capito** — conta segnali di forma, non comprensione.
// Un testo può passare tutte e sei le misure e restare oscuro. Sei misure sullo stato del lavoro e
// sulla forma di ciò che consegno, non sulla loro qualità. Dove passa un «forse», qui si tace.
//
// Uso:
//   node cervello/cancello-stop.mjs           # verdetto leggibile (nessun blocco)
//   node cervello/cancello-stop.mjs --hook    # per l'hook Stop: exit 2 = non ti lascio chiudere
//
// Exit: 0 = niente da dire · 2 = c'è qualcosa che stavo per lasciare indietro
//
// 🟢 Sola lettura: non scrive, non tocca git, non modifica file.

import { execFileSync } from "node:child_process";
import { closeSync, existsSync, openSync, readFileSync, readSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { percorsiDaGit } from "./percorsi-git.mjs";
import { misura, parolePeggioNoteAGlossario } from "./si-capisce.mjs";

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
    .filter((d) => !chiusuraLegittima(d.verifica))
    .map((d) => ({ id: d.id, titolo: String(d.titolo || "").slice(0, 80), debole: Boolean(d.verifica) }));
}

/**
 * Le due chiusure che valgono (AR-487).
 *
 * Il difetto, trovato da Nicola il 3/8 usandolo: il controllo pretendeva `verifica.comando` e basta.
 * Ma esistono difetti che NON si chiudono con un comando: quelli che aspettano una DECISIONE sua.
 * Caso vero dello stesso giorno: AR-479, le quattro ore di lettura. Nicola ha deciso «non voglio
 * riscrivere niente». Non c'è nessun comando che possa dimostrare quella frase, ed è giusto così.
 * Il controllo la segnalava come se io avessi chiuso un difetto senza prova.
 *
 * Un controllo che accusa la persona che comanda quando comanda è un controllo che si impara a
 * ignorare — e diventerebbe rumore proprio sul canale dove passano le decisioni.
 *
 * ① `verifica.comando` — la prova forte: un comando che si esegue e può fallire.
 * ② `verifica.tipo === "umano"` CON un `esito` scritto — la decisione di Nicola, messa a verbale.
 *
 * L'`esito` non è burocrazia: è ciò che impedisce alla macchina di chiudersi i difetti da sola
 * scrivendo «umano» e basta. Senza il verbale di cosa è stato deciso, resta una dichiarazione — che
 * è esattamente la cosa che questo controllo esiste per fermare.
 */
export function chiusuraLegittima(verifica) {
  if (!verifica) return false;
  if (typeof verifica.comando === "string" && verifica.comando.trim()) return true;
  if (verifica.tipo === "umano" && typeof verifica.esito === "string" && verifica.esito.trim()) return true;
  return false;
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
 * passo manuale a fine lavoro. Il conto che ha presentato è scritto nella scheda: durante lo sprint
 * del Pannello del 21-24/7 — sette PR al giorno, bug segnalati a raffica — il quaderno di @tech è
 * rimasto fermo al 20/7 per 47 righe, mentre decine di PR venivano mergiate. Non per pigrizia: sotto
 * pressione si chiude il bug dopo, non si registra quello prima. Un rituale che dipende dalla
 * disciplina fallisce esattamente quando serve di più.
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

/**
 * ⑤ I testi che Nicola leggerà e che non si capiscono (AR-478).
 *
 * Nicola, 2/8: «ho perso 2 ore solo per capire due botta e risposta nelle ultime 5 PR» e poi
 * «attacca il misuratore così viene chiamato in automatico, così non lo salti mai quando c'è
 * pressione». Prima di questo, `si-capisce.mjs` esisteva e non lo chiamava NESSUNO: era una buona
 * intenzione, cioè esattamente il tipo di rituale che salta per primo sotto pressione (AR-154).
 *
 * Sta qui e non in un guardiano nuovo per un motivo pratico: questo file gira già in due canali —
 * l'evento `Stop` (l'istante in cui dico «fatto») e il cancello del lotto, che la CI esegue su ogni
 * PR. Un aggancio solo, due porte.
 *
 * PERIMETRO: le cartelle dove Nicola legge, esclusa la storia. Briefing, DECISIONI e Sala Operativa
 * sono il registro di cosa è successo: riscriverli sarebbe cambiare il passato, non spiegarsi meglio.
 */
export const CARTELLE_DI_NICOLA = ["MyCity-Vault/90-Memoria-AI/", "consegne/"];
export const STORIA_ESENTE = /(Briefing\/|DECISIONI\.md|SALA-OPERATIVA\.md|archivio|quaderni\/)/;

export function testiIlleggibili(testi = [], noteAGlossario = null) {
  const fuori = [];
  for (const t of testi) {
    if (!CARTELLE_DI_NICOLA.some((c) => t.file.startsWith(c))) continue;
    if (STORIA_ESENTE.test(t.file)) continue;
    const m = misura(t.contenuto, { noteAGlossario });

    // SI MISURA IL PEGGIORAMENTO, NON IL TOTALE.
    //
    // Il primo giro dal vivo ha bocciato il GLOSSARIO per 48 punti: un file di 500 righe scritto
    // mesi fa, che avevo sfiorato per aggiungerci una parte. Con la regola sul totale, ogni ritocco
    // a un testo lungo diventa un blocco — e un cancello che non può diventare verde viene aggirato
    // al secondo giro. È scritto nella casa, ed è successo davvero al typecheck del Pannello.
    //
    // Il debito vecchio resta debito (misurato, e si riscrive a mano, un testo per volta). Quello che
    // qui NON deve passare è il debito NUOVO: un file che esce peggiore di come è entrato.
    // Un file nuovo entra da zero, quindi ogni suo problema è nuovo: lì la soglia è 0, come deve.
    const prima = t.contenutoPrima == null ? 0 : misura(t.contenutoPrima, { noteAGlossario }).problemi.length;
    if (m.problemi.length <= prima) continue;

    fuori.push({
      file: t.file,
      quanti: m.problemi.length,
      prima,
      nuovi: m.problemi.length - prima,
      primi: m.problemi.slice(0, 3),
    });
  }
  return fuori;
}

/**
 * ⑥ IL MESSAGGIO CHE STO PER MANDARE A NICOLA IN CHAT (AR-481).
 *
 * Era il buco dichiarato di AR-478: «la chat non è misurabile, non è un file, nessun controllo può
 * girarci sopra». Era falso, e l'ho scoperto guardando cosa riceve l'hook `Stop`: insieme a
 * `stop_hook_active` arriva anche `transcript_path`, cioè il percorso del file dove Claude Code
 * scrive tutta la conversazione, i miei messaggi compresi.
 *
 * Quindi la chat È un file — solo, non era il file che stavo guardando. Ed è il posto dove Nicola
 * legge di più: le due ore che ha perso non erano sulle consegne, erano su cinque PR e sulla chat.
 *
 * SOLO I MESSAGGI LUNGHI. Un «fatto, il sito è tornato online» non deve avere tre blocchi e un
 * esempio: chiederglielo sarebbe rumore a ogni turno, e il rumore spegne i freni.
 */
export function messaggioIlleggibile(testo, noteAGlossario = null, precedenti = []) {
  if (!testo || !testo.trim()) return null; // niente da misurare: non accuso nessuno
  const m = misura(testo, { noteAGlossario, precedenti });
  // Le ripetizioni contano anche sui messaggi CORTI: un messaggio breve che ridice una cosa già
  // detta è il caso più frequente, ed è quello che è successo davvero il 3/8.
  const ripetute = m.problemi.filter((p) => p.tipo === "gia-detto");
  if (!m.testoLungo && !ripetute.length) return null;
  const problemi = m.testoLungo ? m.problemi : ripetute;
  if (!problemi.length) return null;
  return { quanti: problemi.length, minuti: m.minuti, primi: problemi.slice(0, 4) };
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
export function verdetto({
  chiusi = [],
  allarmi = [],
  lezioni = [],
  senzaEsito = null,
  illeggibili = [],
  messaggio = null,
  giaBloccato = false,
} = {}) {
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
  for (const t of illeggibili) {
    righe.push(
      `❌ ${t.file} lo leggerà Nicola e questo lavoro gli ha aggiunto ${t.nuovi} punti difficili` +
        ` (era ${t.prima}, adesso ${t.quanti} — AR-478)` +
        t.primi.map((p) => `\n   → ${p.dico}${p.frase ? `\n     «${p.frase}»` : ` (riga ${p.riga})`}`).join("") +
        `\n   → node cervello/si-capisce.mjs ${t.file}` +
        `\n   → la sostanza NON si toglie: i termini tecnici e i ragionamenti restano, si spiegano dove servono.`,
    );
  }
  if (messaggio) {
    righe.push(
      `❌ il messaggio che sto per mandarti in chat ha ${messaggio.quanti} punti che ti costringono a rileggere` +
        ` (~${messaggio.minuti} min di lettura — AR-481)` +
        messaggio.primi.map((p) => `\n   → ${p.dico}${p.frase ? `\n     «${p.frase}»` : ""}`).join("") +
        `\n   → riscrivilo PRIMA di chiudere il turno: la chat è il posto dove Nicola legge di più.` +
        `\n   → la sostanza resta tutta: si riscrive la forma, non si toglie il contenuto.`,
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

// `stderr: "pipe"` NON è cosmetico: senza, il «fatal: path … exists on disk, but not in origin/main»
// di git finiva dentro il verdetto che leggo io, sopra il messaggio vero. Un verdetto sporco si
// legge peggio, ed è esattamente il difetto che questo file esiste per combattere.
const git = (args) =>
  execFileSync("git", args, { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });

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

/** Il testo com'era prima di questo ramo. `null` = non c'era, quindi è tutto nuovo. */
function testoDiBase(percorso) {
  for (const base of ["origin/main", "main"]) {
    try {
      return git(["show", `${base}:${percorso}`]);
    } catch {
      // il file non c'era su quella base, oppure la base non esiste: provo la prossima
    }
  }
  return null;
}

/**
 * I testi che questo lavoro sta consegnando a Nicola: modificati nell'albero di lavoro OPPURE già
 * committati sul ramo. Servono entrambi — il primo prende il testo che sto scrivendo adesso, il
 * secondo quello che ho scritto tre commit fa e che uscirà lo stesso con la PR.
 *
 * Non usa `fileDelLavoro()` perché quello guarda solo i file NUOVI: un testo peggiorato riscrivendolo
 * è il caso più probabile, ed era proprio quello che sfuggiva.
 */
function testiToccati() {
  const percorsi = new Set();
  try {
    for (const r of git(["status", "--porcelain"]).split("\n").filter(Boolean)) {
      const p = r.slice(3).trim().split(" -> ").pop();
      if (p.endsWith(".md")) percorsi.add(p);
    }
  } catch {
    // niente git: resta l'elenco vuoto, e un elenco vuoto non accusa nessuno
  }
  for (const base of ["origin/main", "main"]) {
    try {
      for (const p of percorsiDaGit(["diff", `${base}...HEAD`, "--name-only"], { cwd: REPO })) {
        if (p.endsWith(".md")) percorsi.add(p);
      }
      break;
    } catch {
      // provo la base successiva
    }
  }
  const testi = [];
  for (const p of percorsi) {
    try {
      const abs = join(REPO, p);
      if (!existsSync(abs)) continue;
      testi.push({
        file: p,
        contenuto: readFileSync(abs, "utf8").slice(0, 200_000),
        contenutoPrima: testoDiBase(p),
      });
    } catch {
      // illeggibile: taccio invece di accusare
    }
  }
  return testi;
}

/**
 * L'ultimo messaggio che ho scritto in chat, preso dalla trascrizione della sessione.
 *
 * Legge solo la CODA del file: una sessione lunga arriva a decine di MB, e l'hook ha 20 secondi.
 * La prima riga letta è quasi sempre spezzata a metà, quindi si scarta.
 */
/** Tutti i miei messaggi di testo nella coda letta, dal più vecchio al più recente. */
export function testiAssistente(righeJsonl = []) {
  const fuori = [];
  for (const riga of righeJsonl) {
    let ev;
    try {
      ev = JSON.parse(riga);
    } catch {
      continue;
    }
    if (ev?.type !== "assistant") continue;
    const pezzi = ev?.message?.content;
    if (!Array.isArray(pezzi)) continue;
    const testo = pezzi
      .filter((p) => p?.type === "text" && String(p.text || "").trim())
      .map((p) => p.text)
      .join("\n");
    if (testo.trim()) fuori.push(testo);
  }
  return fuori;
}

export function ultimoTestoAssistente(righeJsonl = []) {
  for (let i = righeJsonl.length - 1; i >= 0; i--) {
    let ev;
    try {
      ev = JSON.parse(righeJsonl[i]);
    } catch {
      continue; // riga spezzata o non-JSON: non è un verdetto, si salta
    }
    if (ev?.type !== "assistant") continue;
    const pezzi = ev?.message?.content;
    if (!Array.isArray(pezzi)) continue;
    const testo = pezzi
      .filter((p) => p?.type === "text" && String(p.text || "").trim())
      .map((p) => p.text)
      .join("\n");
    if (testo.trim()) return testo;
  }
  return null; // nessun messaggio mio nella coda letta: cieco, non accuso nessuno
}

const CODA_TRASCRIZIONE = 2 * 1024 * 1024;

function leggiTrascrizione(percorso) {
  if (!percorso || !existsSync(percorso)) return null;
  try {
    const dim = statSync(percorso).size;
    const da = Math.max(0, dim - CODA_TRASCRIZIONE);
    const fd = openSync(percorso, "r");
    try {
      const buf = Buffer.alloc(Math.min(dim, CODA_TRASCRIZIONE));
      readSync(fd, buf, 0, buf.length, da);
      const righe = buf.toString("utf8").split("\n").filter(Boolean);
      return da > 0 ? righe.slice(1) : righe; // la prima riga è tagliata a metà
    } finally {
      closeSync(fd);
    }
  } catch {
    return null; // trascrizione illeggibile: taccio invece di accusare
  }
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
  let trascrizione = null;
  if (hook) {
    try {
      const ev = JSON.parse(await leggiStdin());
      giaBloccato = Boolean(ev?.stop_hook_active);
      trascrizione = ev?.transcript_path || null;
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
    illeggibili: testiIlleggibili(testiToccati(), parolePeggioNoteAGlossario(REPO)),
    messaggio: (() => {
      const righeT = leggiTrascrizione(trascrizione) || [];
      const miei = testiAssistente(righeT);
      // Gli ultimi 8 messaggi bastano: più indietro di così Nicola non ricorda, e confrontare tutta
      // la sessione renderebbe rosso ogni riepilogo legittimo.
      const precedenti = miei.slice(-9, -1);
      return messaggioIlleggibile(miei[miei.length - 1] || null, parolePeggioNoteAGlossario(REPO), precedenti);
    })(),
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
