#!/usr/bin/env node
// 🟢 Sola lettura. La porta unica per chiedere a git un elenco di percorsi.
//
// AR-339/340/341 — Perché esiste questo file.
//
// Git, per default, non restituisce i nomi dei file come stanno sul disco: se un percorso contiene
// un byte non-ASCII lo RISCRIVE fra virgolette con l'accento in ottali
// (`"MyCity-Vault/…/Funzionalit\303\240/Carrello e Checkout.md"` — è `core.quotePath`, acceso di
// fabbrica). In un repo con i nomi in italiano non è un caso limite: è il caso normale, e riguarda
// 26 file del vault.
//
// Tre punti del cervello chiedevano elenchi a git e prendevano la risposta alla lettera:
//   · `scan-segreti` — i 26 file non si aprivano, il ciclo li saltava in silenzio e il rapporto
//     diceva comunque «nessun segreto in 2040 file». Un guardiano che non distingue «l'ho letto ed è
//     pulito» da «non sono riuscito ad aprirlo» non è una difesa, è una rassicurazione.
//   · `allocazione-check` — quei 26 percorsi non corrispondevano a nessun prefisso e finivano fra i
//     «non classificati», cioè fuori dalla quota macchina/business.
//   · `git-pr` — un file in conflitto con l'accento non corrispondeva all'elenco degli
//     auto-risolvibili (oggi il difetto è latente e il comportamento è prudente, ma è la stessa porta).
//
// Il rimedio esiste da sempre ed è una lettera: `-z`. Git separa i percorsi con un NUL invece che
// con l'a-capo e, non dovendo più difendersi dagli a-capo nei nomi, smette di citarli. Verificato
// che l'insieme dei percorsi con `-z` è IDENTICO a quello con `core.quotePath=false`: 2041 = 2041,
// zero differenze in entrambe le direzioni.
//
// Regola che questo file rende vera: chi vuole un elenco di percorsi da git passa di qui. Il
// controllo che la fa rispettare è `chiamateFuoriDallaPorta()` in fondo — una regola senza metro è
// la malattia che questi lotti curano.

import { execFileSync } from "node:child_process";

/** Comandi git che restituiscono ELENCHI DI PERCORSI: sono quelli che devono passare dalla porta. */
export const COMANDI_CON_PERCORSI = ["ls-files", "--name-only", "--diff-filter", "--name-status"];

/**
 * Separa l'uscita di un git chiamato con `-z`. Pura: nessuna I/O, così una prova la esegue su
 * ingressi finti — compresi quelli che nel repo non esistono ancora.
 *
 * `-z` termina ogni percorso con un NUL, quindi l'ultimo elemento dello split è sempre vuoto; e con
 * `--pretty=format:` git intercala record vuoti fra un commit e l'altro. Entrambi vanno tolti, ma
 * SENZA `trim()` sul percorso: uno spazio in fondo a un nome di file è legale, e toglierlo
 * significherebbe reintrodurre a mano lo stesso genere di bug che `-z` esiste per chiudere.
 */
export function separaNul(uscita) {
  return String(uscita ?? "")
    .split("\0")
    .filter((p) => p !== "" && p !== "\n");
}

/**
 * Vero se un elenco di percorsi porta i segni della citatura di git — cioè se qualcuno ha chiesto
 * l'elenco senza `-z`. Serve alle prove e ai guardiani: è il sintomo, non la causa.
 */
export function sembraCitato(percorsi = []) {
  return percorsi.some((p) => typeof p === "string" && p.startsWith('"') && p.endsWith('"'));
}

/**
 * Chiede a git un elenco di percorsi e lo restituisce come sta sul disco.
 *
 * @param {string[]} args argomenti di git SENZA `-z` (lo mette questa funzione).
 * @param {{cwd?: string, maxBuffer?: number}} [opts]
 * @returns {string[]} percorsi reali, mai citati, mai vuoti.
 */
export function percorsiDaGit(args, opts = {}) {
  if (!Array.isArray(args) || !args.length) throw new TypeError("percorsiDaGit: serve un array di argomenti git");
  if (args.includes("-z")) throw new TypeError("percorsiDaGit: il -z lo mette la porta, non il chiamante");

  // `-z` va subito dopo il sottocomando: `git log -z --name-only`, `git ls-files -z --cached`.
  const conZ = [args[0], "-z", ...args.slice(1)];
  let uscita;
  try {
    uscita = execFileSync("git", conZ, {
      cwd: opts.cwd || process.cwd(),
      encoding: "utf8",
      // AR-327: un diff grosso non deve far esplodere lo strumento proprio quando il lavoro è grosso.
      maxBuffer: opts.maxBuffer || 64 * 1024 * 1024,
      // AR-643 — lo stderr di git si CATTURA, non si eredita. Senza questo, un `fatal: …` di git
      // finisce crudo dentro il verdetto che il turno mostra a Nicola: visto dal vivo in questo
      // lotto, «fatal: origin/main...HEAD: no merge base» stampato tre volte sopra il referto, in
      // inglese e senza dire di chi fosse. La riparazione sta QUI, alla porta, e non nei chiamanti:
      // da questa funzione passano cancello-stop, salute, scan-segreti, sorvegliante, collaudo e
      // forma-json — metterla in uno solo di loro lascerebbe gli altri sette a stampare il crudo.
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    // L'errore di git diventa un messaggio DI CASA: dice il comando e il motivo, in una riga sola.
    // Il chiamante decide cosa farne — quello che non deve più succedere è che lo legga Nicola.
    const motivo = String(e?.stderr || e?.message || "").trim().split("\n")[0] || "git non ha detto perché";
    const errore = new Error(`git ${args.join(" ")}: ${motivo}`);
    errore.causaGit = motivo;
    errore.comando = ["git", ...args];
    throw errore;
  }
  return separaNul(uscita);
}

/**
 * Come riconosciamo una chiamata a git nel sorgente. La finestra `[^;]{0,400}` prende gli argomenti
 * anche quando l'array va a capo, e si ferma al `;` per non sconfinare nella chiamata successiva.
 */
const INVOCAZIONE_GIT = /(?:execFileSync|execSync|spawnSync)\s*\(\s*["']git["'][^;]{0,400}|(?:gitOrNull|git)\s*\(\s*\[[^;]{0,400}/g;

/**
 * Il metro della regola: quali punti del codice chiedono elenchi di percorsi a git SENZA passare
 * dalla porta.
 *
 * Pura — prende `[{file, testo}]` e torna le violazioni, così una prova la esegue su sorgenti finti
 * invece che sul repo (che dopo il fix è pulito, e un metro provato solo su un repo sano non
 * dimostra niente). Un punto è in violazione se invoca git con uno dei comandi che restituiscono
 * percorsi e in quella stessa invocazione non compare `-z`.
 *
 * Esenti per costruzione: la porta stessa (è lei che mette il `-z`) e le chiamate a `percorsiDaGit`,
 * che sono la porta usata correttamente.
 *
 * @param {{file: string, testo: string}[]} files
 * @returns {{file: string, riga: number, comando: string}[]}
 */
export function chiamateFuoriDallaPorta(files = []) {
  const fuori = [];
  for (const { file, testo } of files) {
    if (String(file).endsWith("percorsi-git.mjs")) continue; // la porta mette il -z: è la sua definizione
    const src = String(testo || "");
    for (const m of src.matchAll(INVOCAZIONE_GIT)) {
      const chiamata = m[0];
      if (/percorsiDaGit\s*\(/.test(chiamata)) continue; // la porta, usata come si deve
      if (/["']-z["']/.test(chiamata)) continue; // già a norma
      const comando = COMANDI_CON_PERCORSI.find((c) => chiamata.includes(`"${c}`) || chiamata.includes(`'${c}`));
      if (!comando) continue;
      fuori.push({ file, riga: src.slice(0, m.index).split("\n").length, comando });
    }
  }
  return fuori;
}

// ── Il guardiano ────────────────────────────────────────────────────────────
//
// `node cervello/percorsi-git.mjs --check` — nasce VERDE (i quattro punti che scavalcavano la porta
// sono stati portati dentro il 29/7), quindi blocca il PRIMO che uscirà, non il parco esistente.
// È la differenza fra un cancello che dura e uno che viene spento entro la settimana.
//
// Contratto dei guardiani (AR-322): 0 nessuno fuori · 1 qualcuno fuori · 2 non ho potuto misurare.

async function check() {
  const { readdirSync, readFileSync, existsSync } = await import("node:fs");
  const { dirname, join } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const CERVELLO = dirname(fileURLToPath(import.meta.url));
  const json = process.argv.includes("--json");

  if (!existsSync(CERVELLO)) {
    console.error("⛔ PERCORSI-GIT CIECO: non trovo la cartella cervello/");
    process.exit(2);
  }
  const files = readdirSync(CERVELLO)
    .filter((f) => f.endsWith(".mjs"))
    .map((f) => ({ file: `cervello/${f}`, testo: readFileSync(join(CERVELLO, f), "utf8") }));
  if (!files.length) {
    console.error("⛔ PERCORSI-GIT CIECO: nessuno script da leggere in cervello/");
    process.exit(2);
  }

  const fuori = chiamateFuoriDallaPorta(files);
  if (json) {
    console.log(JSON.stringify({ esito: fuori.length ? "fuori" : "ok", letti: files.length, fuori }, null, 2));
  } else if (!fuori.length) {
    console.log(`\n🚪 PORTA DEGLI ELENCHI GIT — ${files.length} script letti\n`);
    console.log("✅ Nessuno chiede percorsi a git fuori dalla porta.");
  } else {
    console.log(`\n🚪 PORTA DEGLI ELENCHI GIT — ${files.length} script letti\n`);
    console.log(`❌ ${fuori.length} chiamate scavalcano la porta:\n`);
    for (const f of fuori) console.log(`  • ${f.file}:${f.riga} — ${f.comando} senza -z`);
    console.log(`\nUsa percorsiDaGit() da cervello/percorsi-git.mjs: git riscrive i nomi con l'accento,`);
    console.log(`e in un vault italiano non è un caso limite (26 file, AR-339/340/341).`);
  }
  process.exit(fuori.length ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) await check();
