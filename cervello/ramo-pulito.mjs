#!/usr/bin/env node
// 🧹 IL RAMO PORTA SOLO IL SUO LAVORO — il freno della famiglia di errori più costosa del registro.
//
// PERCHÉ ESISTE. Ventuno correzioni di Nicola, su questa cosa sola. Undici in un pomeriggio (13/7),
// poi ricadute il 14, il 18, il 19 e il 23. «Impara da questo errore, ormai è 20 volte che
// ricapita». «Ci sono ancora conflitti.» «Hai controllato prima se la pr non avesse conflitti?»
//
// Il meccanismo è sempre lo stesso: apro un ramo per un fix, il worker su `main` intanto riscrive i
// suoi file di diario (auto-coscienza, briefing, quaderni — trentacinque commit «recupero:
// scritture pendenti» in due giorni, uno al minuto), il commit automatico di `git-pr.mjs` se li
// porta dentro perché erano sporchi, e la PR arriva al merge con un conflitto vero. Mai sul codice
// del fix: sempre sul diario.
//
// LA DIFESA CHE C'ERA, e perché non bastava: `git-pr.mjs` aveva `WORKER_AUTO_PATHS`, un elenco
// CHIUSO di quattro percorsi. I file che la macchina riscrive da sola sono decine, e ne nascono di
// nuovi a ogni guardiano che aggiungiamo. Il 23/7 il conflitto è arrivato da
// `consegne/finanza/…-diagnosi-cassa-runway.md`, che nell'elenco non c'era e non poteva esserci.
// Un elenco da allungare a mano è la stessa malattia che questo cantiere cura: protegge finché
// qualcuno si ricorda di aggiornarlo.
//
// LA REGOLA CHE LO SOSTITUISCE. Non chiedo un elenco: chiedo alla STORIA chi scrive quel file. Un
// percorso che negli ultimi giorni è stato toccato SOLO da commit automatici — quelli del worker,
// dei recuperi, degli allineamenti — è diario della macchina. Se domani il worker smette di
// riscriverlo, esce da solo dall'insieme; se nasce un file nuovo, ci entra da solo.
//
// E NON ESCLUDE IN SILENZIO. Un'esclusione automatica è comoda e sbagliata: il giorno che devo
// committare apposta uno di quei file (il cantiere durante un lotto è esattamente questo) me lo
// mangerebbe senza dirlo. Qui il freno FERMA e nomina i file: «questi li riscrive la macchina,
// mettili da parte o committali su main, poi rilancia». La decisione resta di chi lavora, ma
// diventa una decisione presa invece di una sorpresa al merge.
//
// 🟢 Sola lettura: interroga git, non tocca niente.
//
// Uso:
//   node cervello/ramo-pulito.mjs            -> controlla il lavoro in corso + il ramo
//   node cervello/ramo-pulito.mjs --json
//   node cervello/ramo-pulito.mjs --giorni 7 -> quanta storia guardare (default 3)
// Exit: 0 = il ramo porta solo il suo lavoro · 1 = mischia lavoro e diario · 2 = non ho potuto misurare

import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
// La porta unica per gli elenchi di percorsi (AR-339..342): mette lei il `-z`, così un nome di file
// con uno spazio o un accento non torna citato e non sparisce dal confronto. Chiedere `--name-only`
// a git per conto proprio è la cosa che quei quattro difetti hanno chiuso — e il guardiano
// `segreto-in-un-nome-con-l-accento` ha bocciato la prima versione di questo file, che lo faceva.
import { percorsiDaGit } from "./percorsi-git.mjs";

const JSON_MODE = process.argv.includes("--json");
const GIORNI = (() => {
  const i = process.argv.indexOf("--giorni");
  return i >= 0 ? Number(process.argv[i + 1]) || 3 : 3;
})();

/**
 * I messaggi con cui la macchina committa da sola. Non sono nomi di autore: il worker committa con
 * la stessa identità di chi lavora a mano, quindi l'autore non distingue niente — il messaggio sì,
 * perché lo scrivono gli script e ha sempre la stessa forma.
 */
export const FORME_AUTOMATICHE = [
  /^recupero: scritture pendenti/i,
  /^worker: /i,
  /^memoria: /i,
  /^allineo la memoria/i,
  /^chore\(memoria\)/i,
  /^\[auto\]/i,
];

export function eAutomatico(messaggio) {
  return FORME_AUTOMATICHE.some((r) => r.test(String(messaggio || "").trim()));
}

/**
 * Dato l'elenco (commit → file toccati), i percorsi scritti SOLO da commit automatici.
 *
 * «Solo» è la parola che conta: un file che il worker riscrive ma che anche una persona ha toccato
 * apposta in questi giorni NON è diario — è un file di lavoro conteso, e bloccarlo darebbe un
 * guardiano che grida sempre. Quelli si risolvono col rebase, non con un freno all'apertura.
 */
export function fileDiario(commits = []) {
  const auto = new Map(); // percorso → { auto: n, mano: n }
  for (const c of commits) {
    const chi = eAutomatico(c.messaggio) ? "auto" : "mano";
    for (const f of c.file || []) {
      const v = auto.get(f) || { auto: 0, mano: 0 };
      v[chi]++;
      auto.set(f, v);
    }
  }
  const diario = new Set();
  for (const [f, v] of auto) if (v.auto > 0 && v.mano === 0) diario.add(f);
  return diario;
}

/** Un percorso è «codice» se cambiarlo cambia il comportamento della macchina. */
export function eCodice(percorso = "") {
  return /\.(mjs|ts|tsx|js|jsx|sh|bats|yml|yaml)$/.test(percorso);
}

/**
 * Il verdetto: questo insieme di file mischia il lavoro con il diario della macchina?
 *
 * Il caso dannoso è UNO SOLO — un ramo che porta codice E diario insieme. Il worker che pubblica
 * solo memoria deve passare (è il suo mestiere), e un ramo di solo codice non ha di che sporcarsi.
 */
export function verdetto(fileDelRamo = [], diario = new Set()) {
  const delDiario = fileDelRamo.filter((f) => diario.has(f));
  const codice = fileDelRamo.filter((f) => eCodice(f) && !diario.has(f));
  const misto = delDiario.length > 0 && codice.length > 0;
  return {
    misto,
    diario: delDiario,
    codice,
    motivo: misto
      ? `il ramo porta ${codice.length} file di lavoro e ${delDiario.length} file che la macchina riscrive da sola: al merge il conflitto arriverà su questi ultimi, non sul tuo fix`
      : "",
  };
}

/**
 * La storia recente come [{messaggio, file[]}], da cui si deduce chi scrive cosa.
 *
 * Passa dalla porta, che aggiunge `-z`: i percorsi arrivano separati da NUL invece che da a-capo,
 * quindi un nome con uno spazio resta un nome solo. Il prezzo è che anche i messaggi arrivano nello
 * stesso flusso — per questo il formato marca l'inizio di ogni commit con un carattere che nei
 * percorsi non può esistere (`\x01`), e ciò che segue fino al NUL successivo è il messaggio.
 */
export function separaCommits(pezzi = []) {
  const commits = [];
  let corrente = null;
  for (const pezzo of pezzi) {
    if (pezzo.startsWith("\x01")) {
      if (corrente) commits.push(corrente);
      corrente = { messaggio: pezzo.slice(1).trim(), file: [] };
    } else if (corrente && pezzo.trim()) {
      corrente.file.push(pezzo.trim());
    }
  }
  if (corrente) commits.push(corrente);
  return commits;
}

function storiaRecente(giorni) {
  let pezzi;
  try {
    pezzi = percorsiDaGit(["log", `--since=${giorni} days ago`, "--name-only", "--format=%x01%s", "origin/main"], {
      cwd: AD_ROOT,
    });
  } catch {
    return null;
  }
  return separaCommits(pezzi);
}

function main() {
  const commits = storiaRecente(GIORNI);
  if (commits === null) {
    return esci(2, "non riesco a leggere la storia di origin/main: senza, non so chi scrive cosa");
  }
  if (!commits.length) {
    return esci(2, `nessun commit su origin/main negli ultimi ${GIORNI} giorni: non ho abbastanza storia per dedurre il diario`);
  }
  const diario = fileDiario(commits);

  // Il lavoro in corso (non ancora committato) e il ramo (già committato): la sorpresa può
  // arrivare da entrambi — dal primo quando `git-pr.mjs` fa il suo commit automatico, dal secondo
  // quando il ramo se li è già portati dentro in un giro precedente.
  let sporco = [];
  let delRamo = [];
  try {
    // Anche qui dalla porta: con `-z` ogni voce è «XY percorso» in un pezzo suo, e un rename non
    // arriva più come «vecchio -> nuovo» da spezzare a mano (era il punto in cui un nome con una
    // freccia dentro avrebbe mentito).
    sporco = percorsiDaGit(["status", "--porcelain"], { cwd: AD_ROOT }).map((v) => v.replace(/^..\s*/, "").trim()).filter(Boolean);
    delRamo = percorsiDaGit(["diff", "--name-only", "origin/main...HEAD"], { cwd: AD_ROOT });
  } catch (e) {
    return esci(2, `non riesco a leggere lo stato del ramo (${e.message}): non posso dire se è pulito`);
  }

  const vSporco = verdetto(sporco, diario);
  const vRamo = verdetto(delRamo, diario);
  const ok = !vSporco.misto && !vRamo.misto;

  if (JSON_MODE) {
    console.log(JSON.stringify({ quando: nowPiacenza(), giorni: GIORNI, diario: [...diario], sporco: vSporco, ramo: vRamo, ok }, null, 2));
    process.exit(ok ? 0 : 1);
  }

  console.log(`\n🧹 IL RAMO PORTA SOLO IL SUO LAVORO — ${nowPiacenza()}\n`);
  console.log(`  File che la macchina riscrive da sola (ultimi ${GIORNI} giorni): ${diario.size}`);
  for (const [dove, v] of [["lavoro in corso", vSporco], ["ramo", vRamo]]) {
    if (!v.misto) continue;
    console.log(`\n  ❌ ${dove}: ${v.motivo}`);
    console.log(`     diario da mettere da parte: ${v.diario.slice(0, 8).join(", ")}${v.diario.length > 8 ? ` …e altri ${v.diario.length - 8}` : ""}`);
  }
  if (ok) {
    console.log(`\n✅ niente diario mescolato al lavoro.`);
    process.exit(0);
  }
  console.log(`\n   Cosa fare: committa quei file su main da soli (non dentro questa PR), oppure`);
  console.log(`   mettili da parte, poi rilancia. Se invece li stai cambiando APPOSTA, committali`);
  console.log(`   con un messaggio che lo dica — così non sono più "solo automatici" e smettono di`);
  console.log(`   contare come diario.`);
  process.exit(1);
}

function esci(codice, messaggio) {
  if (JSON_MODE) console.log(JSON.stringify({ ok: false, cieco: codice === 2, motivo: messaggio }));
  else console.error(`ramo-pulito: ${messaggio}`);
  process.exit(codice);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
