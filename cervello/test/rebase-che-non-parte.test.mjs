#!/usr/bin/env node
// AR-449 — IL CANCELLO CHE DAVA LA COLPA A UN CONFLITTO CHE NON C'ERA.
//
// Il 30/7, dopo tre commit di lavoro sul Pannello, `git-pr.mjs` ha rifiutato di aprire la PR:
//
//   ERRORE rebase pre-PR: Conflitti residui dopo rebase: MyCity-Vault/90-Memoria-AI/
//   AZIONI-IN-ATTESA.md, BACHECA.md, DECISIONI.md, auto-coscienza/cantiere-prove.json,
//   coerenza-fatti.json, salute.json, stampo-check.json, storico-salute.json
//
// Due bugie in una riga: nessun rebase era avvenuto, e quelli non erano conflitti residui. Sul VPS
// il worker tiene sporchi i suoi file; il commit chore di `git-pr.mjs` li esclude apposta; con
// l'albero sporco `git rebase` **si rifiuta di partire**. Il ripiego trattava quel rifiuto come un
// conflitto, non trovava nessun rebase in corso, uscìva dal giro **in silenzio** e proseguiva come
// se fosse andato bene. Poi il controllo con `merge-tree` misurava la normale divergenza dal vecchio
// antenato comune e la chiamava «conflitti residui». Risultato: nessuna PR pubblicabile dal VPS, e
// il vero motivo — un file sporco — mai nominato.
//
// PERCHÉ QUESTA PROVA GUIDA GIT VERO. Il difetto non era leggibile nel codice: ogni singola riga
// aveva senso. Stava in cosa fa git quando l'albero è sporco, e in quale lato è `--theirs` durante un
// rebase (il codice diceva «teniamo la base» e teneva il ramo). Su queste due domande si può solo
// chiedere a git — perciò qui si costruiscono repo veri in una cartella temporanea.
//
// 🟢 Sola lettura sul repo dell'AD: tutto avviene in /tmp.

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";
import { rebasaSuRiferimento, sporcoCheFermaIlRebase } from "../git-pr.mjs";
import { REFERTI_RIGENERATI, RISCRITTI_DAL_WORKER } from "../file-della-macchina.mjs";

const M = "MyCity-Vault/90-Memoria-AI";
const REFERTO = `${M}/auto-coscienza/salute.json`;
const CONTENUTO = `${M}/AZIONI-IN-ATTESA.md`;
const SPORCABILE = "cervello/routing.json"; // dichiarato in RISCRITTI_DAL_WORKER
const CODICE = "pannello/App.tsx";

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Zittisce il log del comando: la prova legge le asserzioni, non la cronaca. */
function zitto(fn) {
  const vero = console.log;
  console.log = () => {};
  try {
    return fn();
  } finally {
    console.log = vero;
  }
}

const temporanee = [];
function git(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}
function scrivi(cwd, percorso, testo) {
  const abs = join(cwd, percorso);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, testo, "utf8");
}
function leggi(cwd, percorso) {
  return readFileSync(join(cwd, percorso), "utf8");
}

/**
 * Un repo con la geometria del caso vero: un ramo di lavoro nato da una base, e `main` che intanto è
 * andato avanti riscrivendo la memoria (il worker).
 *
 * @param opt.ramoTocca  percorsi che il ramo modifica (oltre al codice)
 * @param opt.mainTocca  percorsi che `main` modifica dopo
 */
function repoFinto({ ramoTocca = [], mainTocca = [] } = {}) {
  const cwd = mkdtempSync(join(tmpdir(), "ad-rebase-"));
  temporanee.push(cwd);
  git(["init", "-q", "-b", "main"], cwd);
  git(["config", "user.email", "prova@mycity.local"], cwd);
  git(["config", "user.name", "Prova"], cwd);
  for (const p of [SPORCABILE, REFERTO, CONTENUTO, ...REFERTI_RIGENERATI]) scrivi(cwd, p, "BASE\n");
  scrivi(cwd, CODICE, "export const x = 1\n");
  git(["add", "-A"], cwd);
  git(["commit", "-qm", "base"], cwd);

  git(["checkout", "-q", "-b", "fix/lavoro"], cwd);
  scrivi(cwd, CODICE, "export const x = 2\n");
  for (const p of ramoTocca) scrivi(cwd, p, "RAMO\n");
  git(["add", "-A"], cwd);
  git(["commit", "-qm", "fix: il lavoro vero"], cwd);
  const shaRamoPrima = git(["rev-parse", "HEAD"], cwd);

  git(["checkout", "-q", "main"], cwd);
  for (const p of mainTocca) scrivi(cwd, p, "MAIN\n");
  if (mainTocca.length) {
    git(["add", "-A"], cwd);
    git(["commit", "-qm", "recupero: scritture pendenti"], cwd);
  }
  const main = git(["rev-parse", "HEAD"], cwd);
  git(["checkout", "-q", "fix/lavoro"], cwd);
  return { cfg: { cwd, token: null }, cwd, main, shaRamoPrima, ramo: "fix/lavoro" };
}

function rebaseFatto(cwd, main) {
  try {
    git(["merge-base", "--is-ancestor", main, "HEAD"], cwd);
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ① IL CASO CHE HA FERMATO OGNI PR
// ─────────────────────────────────────────────────────────────────────────────

prova("il caso di stasera: col file del worker sporco il rebase PARTE e va a buon fine", () => {
  const { cfg, cwd, main, ramo } = repoFinto({ mainTocca: [REFERTO] });
  scrivi(cwd, SPORCABILE, "SPORCO-DAL-WORKER\n"); // esattamente lo stato del VPS
  assert.ok(git(["status", "--porcelain"], cwd).includes(SPORCABILE), "preparazione: il file deve essere sporco");

  const esito = zitto(() => rebasaSuRiferimento(cfg, main, ramo, "main"));

  assert.equal(esito.ahead, "1", "il ramo deve restare un commit oltre la base");
  assert.ok(rebaseFatto(cwd, main), "il ramo deve essere finito SOPRA la base: prima non ci arrivava nemmeno");
});

prova("lo sporco messo da parte torna identico, byte per byte", () => {
  const { cfg, cwd, main, ramo } = repoFinto({ mainTocca: [REFERTO] });
  scrivi(cwd, SPORCABILE, "SPORCO-DAL-WORKER\n");
  zitto(() => rebasaSuRiferimento(cfg, main, ramo, "main"));
  assert.equal(leggi(cwd, SPORCABILE), "SPORCO-DAL-WORKER\n",
    "le scritture pendenti del worker non si buttano: si rimettono dove stavano");
  assert.ok(git(["status", "--porcelain"], cwd).includes(SPORCABILE),
    "e devono risultare ancora da committare, come prima del rebase");
});

prova("un rebase che non parte non viene MAI raccontato come un conflitto", () => {
  const { cfg, cwd, main, ramo } = repoFinto({ mainTocca: [REFERTO] });
  scrivi(cwd, CODICE, "export const x = 999 // non committato\n"); // sporco NON dichiarato
  assert.throws(
    () => zitto(() => rebasaSuRiferimento(cfg, main, ramo, "main")),
    (e) => {
      assert.match(e.message, /albero sporco/, "deve dire la verità: l'albero è sporco");
      assert.match(e.message, /App\.tsx/, "e deve NOMINARE il file, non farlo indovinare");
      assert.doesNotMatch(e.message, /conflitt/i, "la bugia di stasera era chiamarlo conflitto");
      return true;
    }
  );
});

prova("se git rifiuta per un suo motivo, si riporta IL SUO motivo — non si tira avanti", () => {
  // La ② del difetto: `git rebase` esce male senza lasciare un rebase in corso. Prima si uscìva dal
  // giro in silenzio e si proseguiva come se fosse andato bene.
  const { cfg, main, ramo } = repoFinto({ mainTocca: [REFERTO] });
  assert.throws(
    () => zitto(() => rebasaSuRiferimento(cfg, "ramo-che-non-esiste-affatto", ramo, "main")),
    (e) => {
      assert.match(e.message, /non è nemmeno partito/, "il silenzio è il difetto: qui si parla");
      assert.doesNotMatch(e.message, /conflitti residui/, "e non si dà la colpa a un conflitto inventato");
      return true;
    }
  );
  assert.ok(main, "la base finta esiste solo per costruire il repo");
});

// ─────────────────────────────────────────────────────────────────────────────
// ② QUALE LATO VINCE (il commento diceva «la base», il codice teneva il ramo)
// ─────────────────────────────────────────────────────────────────────────────

prova("il referto in conflitto si risolve tenendo LA BASE, non la copia vecchia del ramo", () => {
  const { cfg, cwd, main, ramo } = repoFinto({ ramoTocca: [REFERTO], mainTocca: [REFERTO] });
  const esito = zitto(() => rebasaSuRiferimento(cfg, main, ramo, "main"));
  assert.equal(esito.ahead, "1");
  assert.equal(leggi(cwd, REFERTO), "MAIN\n",
    "con `--theirs` qui restava 'RAMO': il referto vecchio tornava dentro la PR e al merge riscriveva quello nuovo");
});

prova("sul contenuto vero il rebase si FERMA, nomina i file e non lascia il repo a metà", () => {
  const { cfg, cwd, main, ramo, shaRamoPrima } = repoFinto({ ramoTocca: [CONTENUTO], mainTocca: [CONTENUTO] });
  assert.throws(
    () => zitto(() => rebasaSuRiferimento(cfg, main, ramo, "main")),
    (e) => {
      assert.match(e.message, /non decido io/, "una coda di azioni da firmare non si risolve da soli");
      assert.match(e.message, /AZIONI-IN-ATTESA\.md/, "e si dice quale file");
      return true;
    }
  );
  assert.ok(!existsSync(join(cwd, ".git", "rebase-merge")), "il rebase va abortito: niente repo a metà");
  assert.equal(git(["rev-parse", "HEAD"], cwd), shaRamoPrima, "e il ramo deve restare dov'era");
});

// ─────────────────────────────────────────────────────────────────────────────
// ③ LA REGOLA PURA, sui casi che nel repo non esistono
// ─────────────────────────────────────────────────────────────────────────────

prova("un file mai tracciato non ferma il rebase, quindi non è sporco che conti", () => {
  const { parcheggia, altri } = sporcoCheFermaIlRebase("?? consegne/nuovo.md\n!! node_modules/x\n");
  assert.deepEqual(parcheggia, []);
  assert.deepEqual(altri, [], "git lascia dov'è ciò che non traccia: bloccare qui sarebbe gridare a vuoto");
});

prova("il dichiarato si parcheggia, il resto resta a chi lavora", () => {
  const { parcheggia, altri } = sporcoCheFermaIlRebase(
    ` M ${SPORCABILE}\nM  ${CODICE}\nMM ${M}/auto-coscienza/apprendimento.json\n`
  );
  assert.deepEqual(parcheggia, [SPORCABILE, `${M}/auto-coscienza/apprendimento.json`]);
  assert.deepEqual(altri, [CODICE], "il lavoro non committato non lo tocca nessuno al posto tuo");
});

prova("vale anche per lo staged: git rifiuta il rebase anche con l'indice sporco", () => {
  // `M ` (modificato nell'indice) e ` M` (solo nell'albero) fermano entrambi il rebase.
  const { parcheggia } = sporcoCheFermaIlRebase(`M  ${SPORCABILE}\n`);
  assert.deepEqual(parcheggia, [SPORCABILE]);
});

prova("l'elenco dei parcheggiabili è quello dichiarato, non una copia scritta a mano", () => {
  for (const p of RISCRITTI_DAL_WORKER) {
    const { parcheggia, altri } = sporcoCheFermaIlRebase(` M ${p}\n`);
    assert.deepEqual(parcheggia, [p], `${p} è dichiarato riscritto dal worker: deve parcheggiarsi`);
    assert.deepEqual(altri, []);
  }
});

prova("i referti rigenerabili sono un elenco a parte, e non si parcheggiano", () => {
  // Non sono sporcizia del worker da mettere da parte: sono file che il RAMO può avere committato,
  // e si risolvono nel rebase tenendo la base. Confonderli sarebbe curare la malattia sbagliata.
  for (const p of REFERTI_RIGENERATI) {
    const { parcheggia } = sporcoCheFermaIlRebase(` M ${p}\n`);
    assert.deepEqual(parcheggia, [], `${p} non va parcheggiato: va risolto nel rebase`);
  }
});

for (const dir of temporanee) {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    /* /tmp si pulisce da sé */
  }
}

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
