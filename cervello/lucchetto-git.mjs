#!/usr/bin/env node
// 🔒 IL LUCCHETTO SUL WORKTREE, ANCHE DA NODE — AR-277 · AR-298.
//
// Il difetto, con la stessa causa radice detta due volte:
//   AR-298 «chi apre le richieste di modifica lavora sulla stessa cartella degli altri senza mai
//           prendere il lucchetto» → ⑤ «la protezione della risorsa condivisa è una convenzione
//           volontaria, non un cancello. Chiunque aggiunga un componente che tocca git — in
//           qualunque linguaggio — nasce fuori dal protocollo.»
//   AR-277 ⑤ «la risorsa condivisa critica non ha un unico punto di accesso obbligato.»
//
// Verificato sul codice il 29/7: `git-pr.mjs` esegue checkout, rebase, commit e push sul worktree
// condiviso con `execFileSync("git", …)` e la stringa `mycity-sync` non compare né lì né in
// `git-merge.mjs`. Gli script shell (giro, ritmo, monitora, worker) prendono tutti `flock` su
// `.git/mycity-sync.lock`; i due strumenti in Node no, perché il lucchetto è un modo di fare della
// parte in shell che nessuno ha mai scritto come regola.
//
// PERCHÉ NON BASTA «PRENDERE IL LUCCHETTO ANCHE LÌ».
// Sarebbe curare i due punti e lasciare in piedi il modo in cui si sono rotti: il terzo strumento
// che toccherà git nascerà di nuovo fuori. Quindi due pezzi, e il secondo è quello che conta:
//   ① una porta sola — `prendiLucchettoOEsci()`, una riga in testa allo strumento;
//   ② un GUARDIANO — `strumentiFuoriDalLucchetto()` — che elenca gli script Node che mutano il
//      worktree e FALLISCE su quelli che non passano dalla porta. È il pezzo che trasforma una
//      convenzione in un cancello, ed è letteralmente il punto (c) del fix di AR-277.
//
// COME PRENDE IL LUCCHETTO, E PERCHÉ COSÌ.
// Lo stesso file e la stessa primitiva degli script shell (`flock` su `.git/mycity-sync.lock`): due
// meccanismi diversi sullo stesso file non si escluderebbero a vicenda, e avremmo un lucchetto che
// sembra proteggere e non protegge — peggio che non averlo. Node non ha un binding per flock(2),
// quindi lo strumento si RILANCIA una volta sotto `flock`, che tiene il lucchetto per tutto il
// processo figlio e lo rilascia da solo quando quello muore: un crash o un kill non lascia lucchetti
// orfani, esattamente come per gli script.
//
// Il marcatore d'ambiente NON è un interruttore per spegnere il cancello: dice «sono già dentro il
// lucchetto», ed è vero solo perché ce l'ha messo il rilancio. Chi lo esporta a mano si sta mentendo
// da solo — e per questo il guardiano non lo accetta come sostituto della porta.
//
// 🟢 Sola lettura. Uso come guardiano: node cervello/lucchetto-git.mjs [--json]
// Exit (AR-322): 0 = ogni strumento passa dal lucchetto · 1 = strumento scoperto · 2 = cieco

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));

/** Il marcatore che il rilancio mette nell'ambiente del figlio. */
export const MARCATORE = "MYCITY_LUCCHETTO_GIT";

/** Il file di lucchetto, lo STESSO che prendono giro.sh, ritmo.sh, monitora.sh e worker.sh. */
export const FILE_LUCCHETTO = ".git/mycity-sync.lock";

/**
 * I sottocomandi git che toccano la RISORSA CONDIVISA: il worktree o i riferimenti.
 * Sono quelli che vanno serializzati. Leggere non dà fastidio a nessuno e non deve prendere niente:
 * un lucchetto che si prende anche per `git status` rallenta tutto e viene tolto entro la settimana.
 */
export const COMANDI_CHE_MUTANO = new Set([
  "checkout", "switch", "rebase", "merge", "commit", "add", "push", "reset", "clean", "stash",
  "apply", "cherry-pick", "revert", "restore", "rm", "mv", "worktree", "fetch", "pull", "am",
]);

/** Sottocomandi che mutano SOLO con certe opzioni (altrimenti sono elenchi innocui). */
const MUTANO_CON_OPZIONE = { branch: /^-(d|D|m|M|-delete|-move)$/, tag: /^-(d|-delete)$/ };

/**
 * Questo comando git tocca la risorsa condivisa? Pura: la prova la esegue su elenchi finti.
 * @param {string[]} args gli argomenti passati a git, senza la parola «git»
 */
export function mutaLaRisorsa(args = []) {
  const puliti = args.map(String).filter((a) => !a.startsWith("-") || MUTANO_CON_OPZIONE[args[0]]);
  const sub = args.map(String).find((a) => !a.startsWith("-") && !/^-c$/.test(a));
  if (!sub) return false;
  if (COMANDI_CHE_MUTANO.has(sub)) return true;
  const regola = MUTANO_CON_OPZIONE[sub];
  if (regola) return args.slice(1).map(String).some((a) => regola.test(a));
  void puliti;
  return false;
}

/**
 * Il piano di rilancio sotto flock, o `null` se il lucchetto è già in mano.
 * Pura — non lancia niente: restituisce cosa andrebbe lanciato, così un test lo può leggere senza
 * avviare processi. È la regola ③ del cantiere: la decisione sta dove un test la può ESEGUIRE.
 */
export function pianoRiesecuzione({ argv = [], env = {}, repoDir = ".", attesaSec = 600 } = {}) {
  if (env[MARCATORE] === "1") return null;
  const [eseguibile, ...resto] = argv;
  if (!eseguibile) return null;
  return {
    comando: "flock",
    argomenti: ["-w", String(attesaSec), join(repoDir, FILE_LUCCHETTO), eseguibile, ...resto],
    env: { ...env, [MARCATORE]: "1" },
  };
}

/**
 * Prende il lucchetto rilanciandosi sotto flock; se è già preso, non fa nulla e torna.
 * Da chiamare in TESTA a ogni strumento Node che tocca il worktree condiviso.
 *
 * Se `flock` non esiste (macchina senza util-linux) NON si finge di aver protetto: si avvisa su
 * stderr e si prosegue. Un lucchetto che si crede preso e non lo è sarebbe la bugia peggiore.
 */
export function prendiLucchettoOEsci({ repoDir = process.cwd(), attesaSec = 600 } = {}) {
  const piano = pianoRiesecuzione({ argv: [process.execPath, ...process.argv.slice(1)], env: process.env, repoDir, attesaSec });
  if (!piano) return;
  const haFlock = spawnSync("sh", ["-c", "command -v flock"], { stdio: "ignore" }).status === 0;
  if (!haFlock) {
    console.error(`⚠️  flock assente — nessun lucchetto sul worktree (${MARCATORE} non preso). Vedi AR-298.`);
    return;
  }
  const r = spawnSync(piano.comando, piano.argomenti, { stdio: "inherit", env: piano.env });
  process.exit(r.status === null ? 1 : r.status);
}

// ─────────────────────────────────────────────────────────────────────────────
// IL GUARDIANO — il pezzo che rende la convenzione un cancello (AR-277 punto c)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chi NON deve passare dal lucchetto, e perché. Un'esenzione senza il perché scritto è un silenzio,
 * ed è la forma di difetto che questi lotti curano: qui il motivo è obbligatorio.
 */
export const ESENZIONI = {
  "lucchetto-git.mjs": "è il lucchetto stesso: prenderlo da sé sarebbe un auto-stallo",
  "collega-marketplace.mjs": "lavora sulla copia in `marketplace/`, un altro repo: non tocca il worktree condiviso",
};

/** Trova le chiamate a git che mutano, dentro il testo di uno script. Pura. */
export function chiamateCheMutano(testo = "") {
  const trovate = [];
  const re = /(?:execFileSync|execFile|spawnSync|spawn)\(\s*["'`]git["'`]\s*,\s*\[([^\]]*)\]/g;
  let m;
  while ((m = re.exec(testo))) {
    const args = m[1].split(",").map((s) => s.trim().replace(/^["'`]|["'`]$/g, "")).filter(Boolean);
    if (mutaLaRisorsa(args)) trovate.push({ indice: m.index, args });
  }
  // La forma indiretta: una funzione `git(["push", …])` locale, come in git-pr.mjs.
  const re2 = /\bgit\(\s*\[([^\]]*)\]/g;
  while ((m = re2.exec(testo))) {
    const args = m[1].split(",").map((s) => s.trim().replace(/^["'`]|["'`]$/g, "")).filter(Boolean);
    if (mutaLaRisorsa(args)) trovate.push({ indice: m.index, args });
  }
  return trovate;
}

/** Lo script passa dalla porta? Pura. */
export function passaDalLucchetto(testo = "") {
  return /prendiLucchettoOEsci|lucchetto-git\.mjs/.test(testo);
}

/**
 * Gli strumenti Node che mutano il worktree senza passare dal lucchetto.
 * @param {{nome:string, testo:string}[]} script
 */
export function strumentiFuoriDalLucchetto(script = [], esenzioni = ESENZIONI) {
  const fuori = [];
  for (const s of script) {
    if (esenzioni[s.nome]) continue;
    const mutazioni = chiamateCheMutano(s.testo);
    if (!mutazioni.length) continue;
    if (passaDalLucchetto(s.testo)) continue;
    fuori.push({ nome: s.nome, quante: mutazioni.length, esempi: mutazioni.slice(0, 3).map((x) => x.args.join(" ")) });
  }
  return fuori;
}

function main() {
  const cartella = process.env.LUCCHETTO_DIR || QUI;
  const jsonMode = process.argv.includes("--json");
  if (!existsSync(cartella)) {
    console.error(`⚠️  GUARDIANO CIECO: manca ${cartella}.`);
    process.exit(2);
  }
  const nomi = readdirSync(cartella).filter((f) => f.endsWith(".mjs")).sort();
  if (!nomi.length) {
    console.error("⚠️  GUARDIANO CIECO: nessuno script da controllare.");
    process.exit(2);
  }
  const script = nomi.map((n) => ({ nome: n, testo: readFileSync(join(cartella, n), "utf8") }));
  const fuori = strumentiFuoriDalLucchetto(script);
  const rc = fuori.length ? 1 : 0;

  if (jsonMode) {
    console.log(JSON.stringify({ ok: rc === 0, letti: script.length, fuori, esenzioni: Object.keys(ESENZIONI) }, null, 2));
    process.exit(rc);
  }
  console.log(`\n🔒 LUCCHETTO SUL WORKTREE — ${script.length} script Node letti\n`);
  if (!fuori.length) {
    console.log("✅ Ogni strumento che muta il worktree passa dal lucchetto, o dice perché no.\n");
    process.exit(0);
  }
  console.log(`🕳️  ${fuori.length} strumento/i mutano il worktree SENZA lucchetto:\n`);
  for (const f of fuori) {
    console.log(`   · ${f.nome} — ${f.quante} chiamate che mutano (es: ${f.esempi.join(" · ")})`);
  }
  console.log(`\n   Metti \`prendiLucchettoOEsci()\` in testa, o dichiara il perché in ESENZIONI (lucchetto-git.mjs).\n`);
  process.exit(rc);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
