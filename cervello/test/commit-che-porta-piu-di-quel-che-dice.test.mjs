// Le prove del PERIMETRO DELLA RICONCILIAZIONE (cervello/riconcilia-perimetro.mjs).
//
// Il caso vero, 21/8 20:07: un commit intitolato «riconcilia: chiude difetti risolti nel codice»
// conteneva quattro file, e uno di quelli — apprendimento.json — perdeva due lezioni arrivate su
// main da richieste di unione firmate. Le lezioni non le aveva cancellate la riconciliazione: le
// aveva trovate sporche nella cartella e se le è portate dietro, perché la riga in staging era
// `git add <cartella>` invece di `git add <i file che ho scritto io>`.
//
// Le due direzioni contano tutte e due: deve lasciare passare il file che la riconciliazione scrive
// davvero, e deve tenere fuori tutto il resto. Un perimetro che blocca anche il proprio file ferma
// il lavoro giusto, e viene tolto al secondo giro.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { partiziona, percorsoDellaRiga, SCRITTI_DALLA_RICONCILIAZIONE } from "../riconcilia-perimetro.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const AC = "MyCity-Vault/90-Memoria-AI/auto-coscienza";

test("IL CASO DEL 21/8: dei quattro file sporchi ne passa uno solo", () => {
  // Esattamente lo stato che ha prodotto quel commit.
  const porcelain = [
    ` M ${AC}/apprendimento.json`,
    ` M ${AC}/auto-miglioramento.json`,
    ` M ${AC}/cantiere-difetti.json`,
    ` M ${AC}/sentinella-dati.json`,
  ].join("\n");
  const { miei, altrui } = partiziona(porcelain);
  assert.deepEqual(miei, [`${AC}/cantiere-difetti.json`], "la riconciliazione scrive il cantiere, e solo quello");
  assert.equal(altrui.length, 3);
  assert.ok(altrui.includes(`${AC}/apprendimento.json`), "l'archivio delle lezioni NON deve salire a bordo");
});

test("il file suo passa: un perimetro che blocca tutto ferma il lavoro giusto", () => {
  const { miei, altrui } = partiziona(` M ${AC}/cantiere-difetti.json`);
  assert.deepEqual(miei, [`${AC}/cantiere-difetti.json`]);
  assert.deepEqual(altrui, [], "senza intrusi non deve esserci nessun avviso, o si impara a ignorarlo");
});

test("niente di sporco: niente da committare e nessun allarme", () => {
  const { miei, altrui } = partiziona("");
  assert.deepEqual(miei, []);
  assert.deepEqual(altrui, []);
});

test("legge i codici di stato veri di git, non solo « M »", () => {
  // Un file nuovo arriva come «??», uno già in staging come «M ». Sbagliare a leggerli vorrebbe
  // dire lasciar passare un intruso perché è arrivato in un altro modo.
  const { miei, altrui } = partiziona([`?? ${AC}/apprendimento.json`, `M  ${AC}/cantiere-difetti.json`].join("\n"));
  assert.deepEqual(miei, [`${AC}/cantiere-difetti.json`]);
  assert.deepEqual(altrui, [`${AC}/apprendimento.json`]);
});

test("un rinomino conta per la sua destinazione", () => {
  assert.equal(percorsoDellaRiga(`R  ${AC}/vecchio.json -> ${AC}/cantiere-difetti.json`), `${AC}/cantiere-difetti.json`);
});

test("un nome fra virgolette (spazi, accenti) non perde le virgolette per strada", () => {
  assert.equal(percorsoDellaRiga(` M "${AC}/nome con spazi.json"`), `${AC}/nome con spazi.json`);
});

test("la CLI esce 1 con gli intrusi e 0 senza: è il segnale che il chiamante legge", () => {
  const cli = join(QUI, "..", "riconcilia-perimetro.mjs");
  const corri = (input) => {
    try {
      const out = execFileSync(process.execPath, [cli], { input, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
      return { code: 0, out };
    } catch (e) {
      return { code: e.status, out: e.stdout };
    }
  };
  const pulito = corri(` M ${AC}/cantiere-difetti.json\n`);
  assert.equal(pulito.code, 0);
  assert.equal(pulito.out.trim(), `${AC}/cantiere-difetti.json`);

  const sporco = corri(` M ${AC}/apprendimento.json\n M ${AC}/cantiere-difetti.json\n`);
  assert.equal(sporco.code, 1, "senza uscita 1 il server non ha modo di accorgersi degli intrusi");
  assert.equal(sporco.out.trim(), `${AC}/cantiere-difetti.json`, "e intanto il suo file lo stampa lo stesso: il lavoro giusto non si ferma");
});

test("il perimetro dichiara ciò che auto-fix scrive davvero, non di più", () => {
  // Se un giorno auto-fix.mjs scriverà un secondo file, questa prova diventa rossa e costringe ad
  // allargare il perimetro NELLO STESSO lavoro — invece di lasciare che si allarghi da solo.
  const sorgente = execFileSync("git", ["show", "HEAD:cervello/auto-fix.mjs"], { encoding: "utf8", cwd: join(QUI, "..", "..") });
  const scritti = [...sorgente.matchAll(/writeJson\(([A-Z_]+),/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(scritti)].sort(), ["CANTIERE", "STORICO"], "auto-fix scrive due archivi: se cambiano, cambia anche il perimetro qui accanto");
  assert.deepEqual([...SCRITTI_DALLA_RICONCILIAZIONE].sort(), ["cantiere-difetti.json", "storico-salute.json"], "e il perimetro li nomina tutti e due: uno di meno bloccherebbe il lavoro giusto sul server");
});

// ── IL FRENO SUL SERVER, eseguito su un repo finto ──────────────────────────────────────────────
//
// Le prove qui sopra misurano la REGOLA. Questa misura che la regola sia collegata: riproduce il
// blocco di `cervello/vps/aggiorna-cervello.sh` — stessa pipeline, stesso perimetro — su un repo
// git vero creato al momento, con la stessa scena del 21/8: il cantiere sporco insieme
// all'archivio delle lezioni. Il commit che ne esce deve contenere UN file, non due.
//
// Senza questo caso, il modulo potrebbe restare sullo scaffale: costruito, provato, e mai chiamato
// da nessuno — che è il modo in cui questa casa si è già fatta male.

test("sul repo vero il commit della riconciliazione porta solo i suoi file", () => {
  const REPO = join(QUI, "..", "..");
  const dove = mkdtempSync(join(tmpdir(), "riconcilia-"));
  const g = (...args) => execFileSync("git", args, { cwd: dove, encoding: "utf8" });
  g("init", "-q", "-b", "main");
  g("config", "user.email", "prova@example.invalid");
  g("config", "user.name", "prova");

  const ac = join(dove, AC);
  mkdirSync(ac, { recursive: true });
  for (const f of ["cantiere-difetti.json", "storico-salute.json", "apprendimento.json"]) {
    writeFileSync(join(ac, f), '{"v":1}\n');
  }
  g("add", "-A");
  g("commit", "-q", "-m", "base");

  // La scena: la riconciliazione ha scritto i suoi due archivi, e QUALCUN ALTRO ha sporcato le lezioni.
  writeFileSync(join(ac, "cantiere-difetti.json"), '{"v":2}\n');
  writeFileSync(join(ac, "storico-salute.json"), '{"v":2}\n');
  writeFileSync(join(ac, "apprendimento.json"), '{"v":"stato vecchio che non deve partire"}\n');

  // La stessa pipeline del server, con lo stesso perimetro.
  const stato = execFileSync("git", ["status", "--porcelain", AC], { cwd: dove, encoding: "utf8" });
  let daCommittare = "";
  try {
    daCommittare = execFileSync(process.execPath, [join(REPO, "cervello/riconcilia-perimetro.mjs")], {
      input: stato,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (e) {
    daCommittare = e.stdout; // uscita 1 = ci sono intrusi, ma i file suoi vanno committati lo stesso
  }
  for (const f of daCommittare.split("\n").filter(Boolean)) g("add", "--", f);
  g("commit", "-q", "-m", "riconcilia: chiude difetti risolti nel codice");

  const dentro = g("show", "--name-only", "--format=", "HEAD").split("\n").filter(Boolean).sort();
  assert.deepEqual(
    dentro,
    [`${AC}/cantiere-difetti.json`, `${AC}/storico-salute.json`],
    "l'archivio delle lezioni NON deve stare in un commit che dice di chiudere difetti",
  );
  const ancoraSporco = execFileSync("git", ["status", "--porcelain", AC], { cwd: dove, encoding: "utf8" });
  assert.match(ancoraSporco, /apprendimento\.json/, "e resta sul disco: non lo si perde, lo si lascia a chi l'ha scritto");
});
