#!/usr/bin/env node
// 🟢 Sola lettura. La porta unica per chiedere a git qualcosa che dipende dalla STORIA.
//
// AR-419/429 — Perché esiste questo file.
//
// `percorsi-git.mjs` è la porta per la domanda «QUALI file»; questa è la porta per la domanda
// «QUANDO». Sono due assi diversi e si rompono in due modi diversi.
//
// Un clone superficiale (`git clone --depth`) è la forma normale in cui questo repo vive dentro un
// cloud agent: `git rev-parse --is-shallow-repository` dice `true` e la storia comincia a un
// **commit di innesto** invece che alla radice. Il punto non è che manchino dei commit — è che il
// commit di innesto **non ha genitori**, quindi git considera NUOVO tutto il suo albero. Misurato
// il 29/7 su questo repo: un solo commit di innesto elencava **1999 file** come «cambiati».
//
// Le risposte che ne escono hanno la stessa forma di quelle vere, e due guardiani le hanno prese
// alla lettera:
//   · `auto-fix.fileCambiatoDa` — chiedeva «questo file è cambiato dalla nascita del difetto?» e si
//     sentiva rispondere «sì» per QUALUNQUE file, perché l'innesto li elenca tutti. La guardia
//     AR-330, nata per rifiutare le chiusure dietro cui non c'è nessuna riparazione, era spenta in
//     ogni sessione cloud — e invece di dirlo firmava «c'è del lavoro dietro questa chiusura».
//   · `allocazione-check.fileToccatiDaGit` — chiedeva i file toccati in sette giorni e ne otteneva
//     4521, di cui 1999 dal solo innesto: la quota di sforzo macchina-vs-business descriveva il
//     magazzino, non la settimana.
//
// La regola che questo file rende vera: **una domanda sulla finestra passata si fa sapendo se la
// storia è intera, e se non lo è la risposta è «cieco», non un numero.** Il metro che la fa
// rispettare è `chiamateSenzaStato()` in fondo — una regola senza metro è la malattia che questi
// lotti curano.
//
// Il perimetro è MISURATO, non dichiarato a occhio (lezione del lotto 33). Ci sono due famiglie di
// domande a git e solo una si ammala:
//   · domande sulla PUNTA (`log -1 --format`, `rev-parse HEAD`) — la punta è reale anche in un
//     clone superficiale: nessun troncamento la tocca, e infatti non entrano nel perimetro;
//   · domande sulla FINESTRA (`--since`, `--before`, `--until`) e sull'ANTENATO (`merge-base`) —
//     hanno bisogno di storia che un clone superficiale può non avere. Sono queste, e solo queste.
//
// Contratto dei guardiani (AR-322): 0 = misurato · 1 = violazione · 2 = non ho potuto misurare.

import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gitLetto } from "./git-github.mjs";
import { curaUnaVolta, verdettoCecita } from "./cecita-curabile.mjs";

/** La chiave con cui questa cecità è registrata fra quelle curabili. */
export const CHIAVE_STORIA = "storia-troncata";

/**
 * Le forme di domanda che un troncamento può falsare. Chi ne usa una deve prima sapere se la storia
 * è intera. (Vedi sopra: le domande sulla punta non sono qui perché la punta non si tronca.)
 */
export const DOMANDE_SULLA_STORIA = ["--since", "--before", "--until", "merge-base"];

/**
 * L'unico modo in cui questo file parla con git — e non è un esecutore suo.
 *
 * Malattia `git-letto-senza-tetto`: `execFileSync` senza `maxBuffer` eredita il limite di 1 MB di
 * Node sullo stdout e muore con ENOBUFS, cioè si rompe PROPRIO quando il lavoro è grosso — nel
 * momento in cui lo strumento che pubblica deve funzionare. Il censo dice a chiare lettere che la
 * cura non è allineare i tetti uno per uno ma avere UN esecutore solo, e quell'esecutore esiste già:
 * `gitLetto` in git-github.mjs. Qui ce n'erano DUE di casa, e il fetch che si cura da solo (AR-800)
 * ne avrebbe aggiunti tre; adesso sono ZERO — passano tutti dalla porta comune, e il conto della
 * malattia in tutto il repo SCENDE da 17 a 15.
 *
 * Nessun ciclo: git-github.mjs non importa questo file (verificato il 26/8).
 *
 * @returns {string|null} lo stdout, oppure `null` se git non ha saputo rispondere
 */
function gitQui(cwd, args, { timeout = 10_000 } = {}) {
  return gitLetto(args, cwd, { timeout });
}

/**
 * I commit di innesto dichiarati da git, letti dal file `.git/shallow`.
 *
 * PURA: prende il testo, non il file, così una prova la esegue su un contenuto inventato senza
 * dover costruire un vero clone superficiale.
 */
export function innestiDaFile(testo) {
  return String(testo ?? "")
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => /^[0-9a-f]{7,40}$/i.test(r));
}

/**
 * Lo stato della storia, come verdetto e non come booleano nudo: chi lo riceve deve poter STAMPARE
 * il motivo, altrimenti la cecità resta muta ed è come non averla misurata.
 *
 * `shallow` è la risposta di `git rev-parse --is-shallow-repository`, già ridotta a booleano;
 * `null` significa che git non ha saputo rispondere — e non sapere se la storia è intera è, ai fini
 * di chi deve decidere, indistinguibile dall'averla troncata.
 *
 * @returns {{intera: boolean, motivo: string, innesti: string[]}}
 */
export function statoStoria({ shallow = null, innesti = [] } = {}) {
  const g = Array.isArray(innesti) ? innesti : [];
  if (shallow === null) {
    return { intera: false, motivo: "git non dice se la storia è intera: la tratto come troncata", innesti: g };
  }
  if (shallow || g.length) {
    const quanti = g.length ? ` (${g.length} commit di innesto: ${g.map((s) => s.slice(0, 7)).join(", ")})` : "";
    return {
      intera: false,
      motivo: `clone superficiale${quanti}: il commit di innesto non ha genitori, quindi git elenca TUTTO il suo albero come appena cambiato`,
      innesti: g,
    };
  }
  return { intera: true, motivo: "storia intera", innesti: g };
}

/**
 * Il passaggio che questo modulo esiste per rendere obbligatorio: una misura che dipende dalla
 * storia diventa «cieca» quando la storia non è intera, e si porta dietro il PERCHÉ.
 *
 * PURA. `valore` è ciò che il chiamante avrebbe restituito con la storia intera; non viene nemmeno
 * guardato quando la storia è troncata, perché il punto è che quel numero non si può produrre.
 *
 * @returns {{cieco: boolean, valore: any, motivo: string}}
 */
export function misuraSuStoria(stato, valore, cosa = "questa misura") {
  const s = stato || {};
  if (s.intera) return { cieco: false, valore, motivo: "storia intera: la misura vale" };
  return { cieco: true, valore: null, motivo: `${cosa} non si può misurare — ${s.motivo}` };
}

/**
 * «Questo file è cambiato dalla nascita del difetto?» — il verdetto, separato dalla raccolta.
 *
 * PURA apposta (regola ③ del cantiere): la decisione che conta non è «git ha risposto», è «posso
 * fidarmi di quello che ha risposto». Tenendola dentro `fileCambiatoDa`, insieme allo spawn, l'unica
 * prova possibile sarebbe stata cercare una stringa nel sorgente — ed è esattamente il tipo di prova
 * che ha lasciato vivere questo difetto.
 *
 * `rispostaGit` è l'uscita grezza di `git log --oneline --since=<nascita> -- <file>`, oppure `null`
 * se git ha fallito. Il caso che il difetto cancellava è il PRIMO: git risponde, la risposta non è
 * vuota, e vale comunque zero — perché in un clone superficiale quelle righe includono il commit di
 * innesto, che elenca tutto.
 *
 * @returns {boolean|null} `null` = non lo so (e chi decide lo dirà, invece di dedurre un sì)
 */
export function cambiatoDallaNascita(storia, rispostaGit) {
  if (!storia?.intera) return null;
  if (rispostaGit == null) return null;
  return String(rispostaGit).trim().length > 0;
}

/**
 * La porta impura: chiede a git lo stato della storia del repo.
 *
 * Non lancia mai: se git non c'è o non risponde, `shallow` resta `null` e `statoStoria` tratta il
 * caso come troncato. Un guardiano che esplode dove dovrebbe dire «cieco» è la stessa malattia
 * vista da un'altra faccia.
 */
export function storiaDelRepo(cwd = process.cwd()) {
  let shallow = null;
  const risposta = gitQui(cwd, ["rev-parse", "--is-shallow-repository"]);
  if (risposta !== null) {
    const v = risposta.trim();
    if (v === "true" || v === "false") shallow = v === "true";
  }

  let innesti = [];
  try {
    const dir = (gitQui(cwd, ["rev-parse", "--git-dir"]) || "").trim();
    if (dir) {
      const f = join(cwd, dir, "shallow");
      if (existsSync(f)) innesti = innestiDaFile(readFileSync(f, "utf8"));
      else if (existsSync(dir) && existsSync(join(dir, "shallow"))) innesti = innestiDaFile(readFileSync(join(dir, "shallow"), "utf8"));
    }
  } catch {
    /* l'assenza del file non è un errore: un clone intero non ce l'ha */
  }

  return statoStoria({ shallow, innesti });
}

/**
 * La stessa porta, ma che PROVA A CURARSI prima di dichiararsi cieca — AR-800.
 *
 * Il difetto non era il ⚪: quello era già giusto. Era che il ⚪ si fermava lì. In ogni sessione
 * cloud il repo arriva come clone superficiale, tre controlli del cancello si dichiarano ciechi, e
 * ogni lotto consegnato da lì porta tre cerchi bianchi che sembrano il prezzo dell'ambiente. Non lo
 * sono: `git fetch --unshallow origin` li toglie in pochi secondi. Provato il 23/8 e di nuovo il
 * 26/8 — `git rev-list --count HEAD` da 50 a settemila, e i tre controlli sono passati dal
 * dichiararsi ciechi al misurare.
 *
 * UNA VOLTA SOLA per processo, e il perché sta in `curaUnaVolta`: otto guardiani che chiedono la
 * stessa storia farebbero otto `fetch`, e un comando ritentato a ogni chiamata trasforma un limite
 * dichiarato in una lentezza inspiegabile.
 *
 * ⚠️ Cosa NON fa: se il fetch fallisce — rete chiusa, permessi, nessun remoto — la cecità resta e si
 * dichiara, col perché. Una cecità che non si può curare va detta lo stesso, ed è la clausola (b)
 * della scheda.
 *
 * @param cwd
 * @param profondita  se dato, `--deepen=N` invece di `--unshallow` (più economico dove basta)
 * @param opzioni     `fetch` e `memoria` iniettabili: una prova deve poter simulare il fallimento
 *                    senza avere una rete, e non deve ereditare i tentativi del caso precedente.
 * @returns lo stato della storia, più `cura: {stato, riga, comando, tentata, riuscita}`
 */
/**
 * Il tentativo vero, con i tre freni che la radiografia del perimetro ha chiesto (26/8, lente
 * `rischio-sicurezza-se`). Un guardiano di sola lettura che si mette a parlare con la rete è una
 * cosa nuova, e va limitata prima di essere utile.
 *
 * ① NIENTE REMOTO, NIENTE TENTATIVO. Senza `origin` il fetch fallirebbe comunque, e nel frattempo
 *    avrebbe speso il suo timeout: un repo staccato (una copia di lavoro, un worktree di prova) non
 *    deve pagare niente.
 * ② UN SOLO TENTATIVO PER TUTTO IL CANCELLO, non per processo. `curaUnaVolta` limita il processo, ma
 *    il cancello ne lancia una decina, ognuno col suo. Con la rete morta il primo avrebbe pagato il
 *    timeout e poi anche tutti gli altri: dieci volte lo stesso muro. Il marcatore in `.git` è
 *    condiviso, quindi il muro si paga una volta e basta.
 * ③ IL MARCATORE SCADE (un'ora). Un fallimento è quasi sempre una rete che al momento non c'è:
 *    tenerselo per sempre trasformerebbe una cecità curabile in una cecità permanente, cioè
 *    esattamente il difetto che questo file cura, riprodotto dalla sua cura.
 *
 * Il timeout è 60 s e non 180: qui non si sta scaricando un repo, si sta chiedendo la storia che il
 * clone non ha portato — se dopo un minuto non è arrivata, la risposta utile è «non adesso».
 */
const MARCATORE = "mycity-cura-storia-tentata";
const SCADENZA_MARCATORE_MS = 60 * 60 * 1000;

function fetchDavvero(cwd, profondita) {
  const gitDir = (gitQui(cwd, ["rev-parse", "--absolute-git-dir"]) || "").trim();
  const segno = gitDir ? join(gitDir, MARCATORE) : null;
  if (segno && existsSync(segno)) {
    try {
      if (Date.now() - statSync(segno).mtimeMs < SCADENZA_MARCATORE_MS) return false; // già provato e fallito, di recente
    } catch {
      /* un marcatore illeggibile non è un tentativo riuscito: si riprova */
    }
  }

  const haOrigin = (gitQui(cwd, ["remote"]) || "")
    .split("\n")
    .some((r) => r.trim() === "origin");
  if (!haOrigin) return false;

  const args = profondita ? ["fetch", `--deepen=${profondita}`, "origin"] : ["fetch", "--unshallow", "origin"];
  if (gitQui(cwd, args, { timeout: 60_000 }) !== null) return true;
  // Fallito: lascia il segno, così gli altri processi del cancello non sbattono sullo stesso muro.
  if (segno) {
    try {
      writeFileSync(segno, `${new Date().toISOString()}\n`);
    } catch {
      /* non poter lasciare il segno costa un tentativo in più, non un errore */
    }
  }
  return false;
}

export function storiaDelRepoCurata(cwd = process.cwd(), { fetch = null, memoria = undefined, profondita = null } = {}) {
  const prima = storiaDelRepo(cwd);
  if (prima.intera) {
    return { ...prima, cura: verdettoCecita({ chiave: CHIAVE_STORIA, cieco: false, motivo: prima.motivo }) };
  }

  const daiIlComando = fetch || (() => fetchDavvero(cwd, profondita));

  const esito = curaUnaVolta({
    chiave: CHIAVE_STORIA,
    esegui: daiIlComando,
    rimisura: () => storiaDelRepo(cwd),
    ...(memoria ? { memoria } : {}),
  });

  const dopo = esito.stato;
  return {
    ...dopo,
    cura: {
      ...verdettoCecita({
        chiave: CHIAVE_STORIA,
        cieco: !dopo.intera,
        tentata: esito.tentata,
        riuscita: esito.riuscita,
        motivo: dopo.intera ? prima.motivo : dopo.motivo,
      }),
      tentata: esito.tentata,
      riuscita: esito.riuscita,
    },
  };
}

// ── Il metro ────────────────────────────────────────────────────────────────

/**
 * Come riconosciamo un'invocazione di git nel sorgente — stessa finestra della porta gemella, e per
 * lo stesso motivo: gli argomenti vanno spesso a capo, e il `;` è il confine oltre il quale
 * comincerebbe la chiamata successiva. Copre anche la forma shell (`git log …`), perché legare il
 * metro al linguaggio invece che al bene è l'errore già pagato con AR-380/381/382.
 */
const INVOCAZIONE_GIT =
  /(?:execFileSync|execSync|spawnSync)\s*\(\s*["']git["'][^;]{0,400}|(?:gitOrNull|percorsiDaGit|git)\s*\(\s*\[[^;]{0,400}|(?:^|[\s(`$])git\s+(?:log|rev-list|merge-base)[^\n|;)]{0,200}/gm;

/**
 * Toglie i COMMENTI mantenendo il numero di righe, così un riferimento scritto in prosa non venga
 * scambiato per una chiamata.
 *
 * Nato subito: alla prima esecuzione questo guardiano ha accusato `prove-regole.mjs` per la frase
 * «raccolto da chi chiama (`git log -- <file> --since <nato>`)» dentro un JSDoc. Un cancello che
 * suona sulla documentazione che lo descrive è un cancello che viene spento entro la settimana — e
 * il modo di non spegnerlo è renderlo preciso, non alzargli la soglia.
 *
 * Prudente per costruzione: toglie SOLO i blocchi `/* … *\/` e le righe che COMINCIANO (dopo gli
 * spazi) con `//`, `*` o `#`. Un `// …` in coda a una riga di codice resta, e va bene così: fra
 * nascondere una chiamata vera e tenersi un falso positivo raro, il primo errore è quello che
 * spegne la difesa in silenzio — cioè la malattia che questo file cura.
 */
export function senzaCommenti(src) {
  const senzaBlocchi = String(src ?? "").replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  return senzaBlocchi
    .split("\n")
    .map((riga) => (/^\s*(\/\/|\*|#)/.test(riga) ? "" : riga))
    .join("\n");
}

/**
 * Quali punti del codice fanno una domanda sulla finestra passata SENZA sapere se la storia è
 * intera.
 *
 * Pura — prende `[{file, testo}]` e torna le violazioni, così una prova la esegue su sorgenti finti
 * invece che sul repo: un metro provato solo su un repo già sano non dimostra di saper mordere.
 *
 * Un file è a norma se consulta la porta (`storiaDelRepo`/`statoStoria`) oppure se è dichiarato
 * esente con il perché scritto qui sotto — mai in silenzio.
 *
 * @param {{file: string, testo: string}[]} files
 * @returns {{file: string, riga: number, domanda: string}[]}
 */
export function chiamateSenzaStato(files = [], esenti = ESENTI) {
  const fuori = [];
  for (const { file, testo } of files) {
    const nome = String(file);
    if (nome.endsWith("storia-git.mjs")) continue; // la porta: è lei che misura lo stato
    if (esenti.some((e) => nome.endsWith(e.file))) continue;
    const src = senzaCommenti(String(testo || ""));
    // Chi consulta la porta è a norma: la decisione «cieco o no» ce l'ha in mano.
    // `storiaDelRepo` e `storiaDelRepoCurata` sono la stessa porta: la seconda prova a togliere la
    // cecità prima di dichiararla (AR-800). Il `\w*` evita che il metro accusi chi usa la porta
    // migliore — un guardiano che punisce chi cura è il modo più veloce per farlo spegnere.
    if (/storiaDelRepo\w*\s*\(|statoStoria\s*\(/.test(src)) continue;
    for (const m of src.matchAll(INVOCAZIONE_GIT)) {
      const chiamata = m[0];
      const domanda = DOMANDE_SULLA_STORIA.find((d) => chiamata.includes(d));
      if (!domanda) continue;
      fuori.push({ file: nome, riga: src.slice(0, m.index).split("\n").length, domanda });
    }
  }
  return fuori;
}

/**
 * Le esenzioni, ognuna col suo perché — un'esenzione senza motivo è un silenzio, ed è la cosa che
 * stiamo curando.
 */
export const ESENTI = [
  {
    file: "git-pr.mjs",
    perche:
      "chiede `merge-base`/`rev-list` fra due riferimenti ENTRAMBI presenti (il ramo appena creato qui e la punta di origin/main), e il risultato finisce in un'etichetta della PR, non in un verdetto: un conteggio impreciso non fa passare né bocciare niente. I suoi aiuti tornano già null quando git non risponde.",
  },
  {
    file: "vps/aggiorna-cervello.sh",
    perche:
      "gira solo sul VPS, dove il clone è intero per costruzione (nessun --depth nel setup), e le sue domande sono `FETCH_HEAD..HEAD`, cioè la divergenza fra due punte presenti: non guardano indietro nel tempo.",
  },
];

async function check() {
  const { readdirSync, readFileSync: leggi, existsSync: c_e, statSync } = await import("node:fs");
  const { dirname, join: unisci } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const CERVELLO = dirname(fileURLToPath(import.meta.url));
  const json = process.argv.includes("--json");

  if (!c_e(CERVELLO)) {
    console.error("⛔ STORIA-GIT CIECO: non trovo la cartella cervello/");
    process.exit(2);
  }

  // Ricorsiva e su entrambe le estensioni: leggere una cartella sola e una sola estensione è
  // esattamente il buco di AR-381/382, e ripeterlo qui sarebbe curare la malattia con la malattia.
  const files = [];
  const scendi = (dir, rel) => {
    for (const voce of readdirSync(dir)) {
      if (voce === "node_modules" || voce === "test" || voce.startsWith(".")) continue;
      const abs = unisci(dir, voce);
      const r = rel ? `${rel}/${voce}` : voce;
      let st;
      try {
        st = statSync(abs);
      } catch {
        continue;
      }
      if (st.isDirectory()) scendi(abs, r);
      else if (/\.(mjs|sh)$/.test(voce)) files.push({ file: `cervello/${r}`, testo: leggi(abs, "utf8") });
    }
  };
  scendi(CERVELLO, "");

  if (!files.length) {
    console.error("⛔ STORIA-GIT CIECO: nessuno script da leggere in cervello/");
    process.exit(2);
  }

  const fuori = chiamateSenzaStato(files);
  if (json) {
    console.log(JSON.stringify({ esito: fuori.length ? "fuori" : "ok", letti: files.length, fuori, esenti: ESENTI }, null, 2));
  } else {
    console.log(`\n🕰️  PORTA DELLE DOMANDE SULLA STORIA — ${files.length} script letti\n`);
    if (!fuori.length) {
      console.log("✅ Nessuno chiede una finestra passata a git senza sapere se la storia è intera.");
      console.log(`   Esenti dichiarati: ${ESENTI.map((e) => e.file).join(", ")}.`);
    } else {
      console.log(`❌ ${fuori.length} domande sulla finestra passata senza controllo della storia:\n`);
      for (const f of fuori) console.log(`  • ${f.file}:${f.riga} — ${f.domanda}`);
      console.log(`\nUsa storiaDelRepo() da cervello/storia-git.mjs e, se la storia non è intera,`);
      console.log(`dichiara «cieco» invece di produrre un numero: in un clone superficiale il commit`);
      console.log(`di innesto elenca TUTTO il suo albero come appena cambiato (1999 file, 29/7).`);
    }
  }
  process.exit(fuori.length ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) await check();
