#!/usr/bin/env node
// 🚧 IL CONTRATTO DEI WORKFLOW — quello che ogni corsa su GitHub deve dichiarare prima di partire.
//
// PERCHÉ ESISTE (lotto 39 — AR-635, AR-636, AR-637, AR-638). Quattro difetti diversi, una malattia
// sola: **un workflow nasce copiando quello accanto, e si porta dietro la forma ma non i limiti.**
// Il battito esterno — l'unico guardiano che vive FUORI dal VPS — era l'unico job senza tetto di
// tempo: appeso, sarebbe rimasto cieco sei ore mentre il gruppo di concorrenza teneva in coda i
// controlli dopo. Il deploy del Pannello era l'unico senza `permissions:`, senza tetto e con una
// `curl` senza scadenza. Sei azioni esterne erano agganciate a un'etichetta spostabile invece che a
// un commit. E tre `run:` interpolavano output di step dentro lo script della shell.
//
// LA RADICE, ed è la parte che conta: nessuno di questi limiti era controllato da niente. Vivevano
// nella testa di chi scriveva il file. Un limite che vive nella testa di chi scrive è un limite che
// il file successivo non avrà — ed è esattamente com'è andata, quattro volte su quattro file.
//
// LA CURA non è mettere le righe mancanti (quella è la guarigione di un punto): è che da qui in poi
// un workflow senza i suoi limiti NON PASSI il cancello. Questo modulo è una funzione pura: prende
// i file e restituisce le violazioni. Il test la esegue sui workflow VERI del repo, quindi il
// controllo non può degradare in «cerco una parola in un file» — se domani nasce il quinto workflow
// copiato dal quarto, questo diventa rosso prima che qualcuno se ne accorga in produzione.
//
// Uso da riga di comando:
//   node cervello/contratto-workflow.mjs           # verdetto leggibile, exit 1 se qualcosa manca
//   node cervello/contratto-workflow.mjs --json    # per gli script

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const AD_ROOT = join(QUI, "..");
const CARTELLA = join(AD_ROOT, ".github/workflows");

/**
 * Le esenzioni: un'istanza che resta apposta vuole il PERCHÉ scritto qui dentro.
 * Un'esenzione senza motivo è un silenzio, ed è la cosa che questo modulo cura.
 * Chiave: `<file>#<regola>` oppure `<file>#<regola>#<dettaglio>`.
 */
export const ESENZIONI = {
  // `github.token` non è un dato: è il segnaposto che Actions sostituisce con il token della corsa,
  // e vive solo dentro `env:`. Qui è elencato per completezza — `env:` non è un blocco `run:`, quindi
  // la regola non lo guarda comunque.
};

/** Un ref è un commit vero solo se è uno SHA completo: 40 caratteri esadecimali. */
export const eUnCommit = (ref) => /^[0-9a-f]{40}$/i.test(String(ref || ""));

/** Quanto è indentata una riga (spazi iniziali). Le tab in YAML non sono ammesse: contano 0. */
const indent = (riga) => riga.length - riga.replace(/^ */, "").length;

/**
 * Spezza il testo di un workflow nei suoi blocchi `jobs:` → un blocco per job.
 * Niente libreria YAML apposta: qui non serve interpretare il documento, serve sapere DOVE finisce
 * un job — e l'indentazione basta. Una dipendenza in più su un controllo che deve girare in ogni
 * ambiente (VPS, CI, sessione cloud senza `npm install`) è un modo di renderlo cieco a metà.
 * @param {string} testo
 * @returns {{nome:string, riga:number, corpo:string}[]}
 */
export function jobsDi(testo) {
  const righe = String(testo).split("\n");
  const iJobs = righe.findIndex((r) => /^jobs:\s*$/.test(r));
  if (iJobs === -1) return [];
  const jobs = [];
  let corrente = null;
  for (let i = iJobs + 1; i < righe.length; i++) {
    const riga = righe[i];
    if (/^\s*$/.test(riga) || /^\s*#/.test(riga)) {
      if (corrente) corrente.righe.push(riga);
      continue;
    }
    // Tornati al margine sinistro: la sezione jobs è finita.
    if (indent(riga) === 0) break;
    const testa = riga.match(/^ {2}([A-Za-z0-9_-]+):\s*$/);
    if (testa) {
      if (corrente) jobs.push(corrente);
      corrente = { nome: testa[1], riga: i + 1, righe: [] };
      continue;
    }
    if (corrente) corrente.righe.push(riga);
  }
  if (corrente) jobs.push(corrente);
  return jobs.map((j) => ({ nome: j.nome, riga: j.riga, corpo: j.righe.join("\n") }));
}

/**
 * I blocchi `run:` di un workflow, col loro contenuto e la riga in cui iniziano.
 * Serve la stessa cosa di sopra: sapere dove finisce lo script della shell.
 * @param {string} testo
 * @returns {{riga:number, corpo:string}[]}
 */
export function blocchiRun(testo) {
  const righe = String(testo).split("\n");
  const blocchi = [];
  for (let i = 0; i < righe.length; i++) {
    // Le due forme che YAML ammette per lo stesso passo: `run:` sotto un `- name:`, e `- run:` che
    // apre il passo. La seconda mancava, e il caso rotto ci passava attraverso: il perimetro era
    // dedotto dai quattro file esistenti invece che dalla grammatica. È la malattia
    // «perimetro-dedotto-non-misurato», ed è stata la prova di non-vacuità a trovarla.
    const inizio = righe[i].match(/^(\s*(?:-\s+)?)run:\s*(\|-?|>-?)?\s*(.*)$/);
    if (!inizio) continue;
    const dentro = inizio[1].length; // la colonna della chiave `run`, non quella del trattino
    if (inizio[3]) {
      // run: comando-su-una-riga
      blocchi.push({ riga: i + 1, corpo: inizio[3] });
      continue;
    }
    const primaRiga = i + 2; // 1-based: la riga subito dopo `run: |`
    const corpo = [];
    for (let j = i + 1; j < righe.length; j++) {
      if (/^\s*$/.test(righe[j])) { corpo.push(righe[j]); i = j; continue; }
      if (indent(righe[j]) <= dentro) break;
      corpo.push(righe[j]);
      i = j;
    }
    blocchi.push({ riga: primaRiga, corpo: corpo.join("\n") });
  }
  return blocchi;
}

/**
 * IL CONTRATTO. Cinque regole, ognuna nata da un difetto vero e con il suo nome in chiaro.
 *
 * @param {{nome:string, testo:string}[]} file i workflow, già letti
 * @returns {{file:string, regola:string, dove:string, perche:string}[]} le violazioni
 */
export function violazioni(file) {
  const fuori = [];
  const accusa = (nome, regola, dove, perche) => {
    if (ESENZIONI[`${nome}#${regola}#${dove}`] || ESENZIONI[`${nome}#${regola}`]) return;
    fuori.push({ file: nome, regola, dove, perche });
  };

  for (const { nome, testo } of file) {
    const jobs = jobsDi(testo);

    // ① TETTO DI TEMPO (AR-635, AR-636). Senza `timeout-minutes` GitHub lascia vivo un job appeso
    //    per 360 minuti. Su un guardiano orario con concorrenza seriale, sei ore appeso = sei ore
    //    cieche: il guasto che il guardiano doveva scoprire passa sotto di lui.
    for (const job of jobs) {
      if (!/^\s*timeout-minutes:\s*\d+/m.test(job.corpo)) {
        accusa(nome, "tetto-di-tempo", `job ${job.nome}`,
          "senza timeout-minutes un job appeso resta vivo 6 ore: il guardiano non guarda e nessuno lo sa");
      }
    }

    // ② PERMESSI DICHIARATI (AR-636). Senza il blocco, il token della corsa eredita il default del
    //    repository — che dal file non si vede. Un potere che non si vede è un potere che nessuno
    //    toglie.
    const permessiInTesta = /^permissions:\s*$/m.test(testo) || /^permissions:\s*\{/m.test(testo);
    for (const job of jobs) {
      const permessiNelJob = /^\s*permissions:/m.test(job.corpo);
      if (!permessiInTesta && !permessiNelJob) {
        accusa(nome, "permessi-dichiarati", `job ${job.nome}`,
          "nessun blocco permissions: il token eredita il default del repository, che qui non si vede");
      }
    }

    // ③ AZIONE AGGANCIATA AL COMMIT (AR-637). Un tag si sposta; un commit no. Chi controlla il
    //    repository dell'azione controlla il codice che gira sul runner con i permessi di questa
    //    corsa — è il meccanismo dell'attacco alla supply chain di marzo 2025.
    for (const [i, riga] of String(testo).split("\n").entries()) {
      const uso = riga.match(/^\s*(?:-\s+)?uses:\s*['"]?([^'"\s#]+)['"]?/);
      if (!uso) continue;
      const rif = uso[1];
      if (rif.startsWith("./") || rif.startsWith("docker://")) continue; // azione locale: nessun terzo
      const [azione, ref] = rif.split("@");
      if (!ref) {
        accusa(nome, "azione-agganciata-al-commit", `riga ${i + 1}: ${azione}`,
          "azione esterna senza nessun riferimento: gira sempre l'ultima versione, chiunque la scriva");
        continue;
      }
      if (!eUnCommit(ref)) {
        accusa(nome, "azione-agganciata-al-commit", `riga ${i + 1}: ${rif}`,
          `«${ref}» è un'etichetta spostabile, non un commit: chi la sposta esegue codice suo su questo runner`);
      }
    }

    // ④ DATO NON FIDATO NEL TERMINALE (AR-638). `${{ }}` dentro `run:` viene sostituito PRIMA che la
    //    shell veda lo script: un apice o un `$(...)` nel valore diventa un comando eseguito col
    //    token della corsa. La forma giusta è passare da `env:` e leggere "$VARIABILE".
    for (const b of blocchiRun(testo)) {
      for (const [k, riga] of b.corpo.split("\n").entries()) {
        for (const e of riga.match(/\$\{\{[^}]*\}\}/g) || []) {
          accusa(nome, "dato-non-fidato-nel-terminale", `riga ${b.riga + k}: ${e.trim()}`,
            "un'espressione sostituita dentro lo script: apici e $(...) nel valore diventano comandi sul runner");
        }
      }
    }

    // ⑤ SCADENZA SULLA CHIAMATA (AR-636). Una `curl` senza deadline contro un endpoint che accetta
    //    la connessione e poi tace resta viva quanto il job. Il tetto di tempo la fermerebbe, ma con
    //    un errore che non dice niente: la scadenza sulla chiamata è quella che dà il messaggio.
    for (const b of blocchiRun(testo)) {
      for (const [k, riga] of b.corpo.split("\n").entries()) {
        if (!/\bcurl\b/.test(riga) || /^\s*#/.test(riga)) continue;
        if (/--max-time|--connect-timeout|\s-m\s+\d/.test(riga)) continue;
        accusa(nome, "scadenza-sulla-chiamata", `riga ${b.riga + k}: ${riga.trim().slice(0, 60)}`,
          "curl senza --max-time: un endpoint che accetta e tace tiene viva la corsa fino al tetto");
      }
    }
  }
  return fuori;
}

/** Legge i workflow dal disco. Separato dalla decisione apposta: la decisione si deve poter provare. */
export function leggiWorkflow(cartella = CARTELLA) {
  return readdirSync(cartella)
    .filter((f) => /\.ya?ml$/.test(f))
    .sort()
    .map((f) => ({ nome: f, testo: readFileSync(join(cartella, f), "utf8") }));
}

if (process.argv[1] && process.argv[1].endsWith("contratto-workflow.mjs")) {
  const file = leggiWorkflow();
  const fuori = violazioni(file);
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ controllati: file.length, violazioni: fuori }, null, 2));
  } else if (fuori.length === 0) {
    console.log(`✅ contratto dei workflow: ${file.length} file, tutti coi loro limiti dichiarati.`);
  } else {
    console.log(`⛔ contratto dei workflow: ${fuori.length} limiti mancanti su ${file.length} file\n`);
    for (const v of fuori) console.log(`   · ${v.file} — ${v.regola} (${v.dove})\n     ${v.perche}`);
  }
  process.exit(fuori.length ? 1 : 0);
}
