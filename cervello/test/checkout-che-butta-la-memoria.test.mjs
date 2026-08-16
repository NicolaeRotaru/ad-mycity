#!/usr/bin/env node
// 🛟 AR-388 — «Se il cancello della memoria dice no, il server butta via il lavoro che aveva appena
// promesso di tenere.»
//
// IL FATTO. In `cervello/vps/aggiorna-cervello.sh` il recupero delle scritture pendenti finisce con
// due rami che non committano niente e stampano una riga rassicurante:
//
//     ⛔ Scritture pendenti NON committate: il cancello ha detto no (restano sul server).
//
// Novanta righe più sotto c'è `git checkout -f -B`, che le scritture non committate le cancella.
// La frase era falsa nel momento in cui è stata scritta, e nessuno se n'era accorto perché nessun
// test percorreva lo script fino in fondo su un albero sporco. Questa prova lo percorre.
//
// COME. Non si legge il sorgente: si ESEGUE lo script vero in una cartella usa-e-getta, con un
// `git` finto che si comporta come quello vero sui file — `checkout -f` cancella quello che non è
// stato salvato, `stash push` lo sposta da parte — e alla fine si guarda una cosa sola:
// **il file scritto dall'AD esiste ancora da qualche parte?**
//
// COSA PROVA:
//   ① il cancello dice no e la memoria non committata sopravvive (nel worktree o nella stash);
//   ② la messa al sicuro avviene PRIMA del checkout distruttivo, non dopo;
//   ③ con l'albero pulito il freno non scatta: nessuna stash, l'allineamento va avanti (non è una
//      difesa che blocca tutto per stare tranquilla);
//   ④ la decisione pura risponde sul dato, non sul ramo che l'ha chiamata.
//
// NON-VACUITÀ (verificata rompendo il fix apposta, non dedotta): togliendo da aggiorna-cervello.sh
// il blocco `_azione_salvataggio` — cioè rimettendo il `git checkout -f -B` subito dopo il fetch —
// i casi ① e ② diventano ROSSI: il file sparisce e nel registro delle operazioni non c'è nessuno
// STASH prima del CHECKOUT-F.

import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { decidiPrimaDelCheckout, eMemoria, percorsoDaRiga } from "../scritture-a-rischio.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCRIPT = join(REPO, "cervello", "vps", "aggiorna-cervello.sh");
const MEM_DIRS = ["MyCity-Vault", "consegne", "creativi", "memoria-squadra"];

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/**
 * Prepara la cartella usa-e-getta e ci fa girare lo script VERO.
 *
 * `cancello` = che cosa risponde gate_pubblicazione (1 = «no, non pubblicare»).
 * `sporca`   = c'è una scrittura dell'AD non committata?
 * Torna: se il file è sopravvissuto, e l'ordine in cui il git finto è stato chiamato.
 */
function allineamento({ cancello = 1, sporca = true } = {}) {
  const tmp = mkdtempSync(join(tmpdir(), "ar388-"));
  const repo = join(tmp, "repo");
  const stash = join(tmp, "stash");
  const ops = join(tmp, "ops.log");
  const bin = join(tmp, "bin");
  mkdirSync(join(repo, ".git"), { recursive: true });
  mkdirSync(join(repo, "cervello", "vps"), { recursive: true });
  mkdirSync(bin, { recursive: true });
  mkdirSync(stash, { recursive: true });
  writeFileSync(ops, "");
  writeFileSync(join(repo, ".git", "config"), "[core]\n");

  // I due file che lo script carica da $REPO: quello vero delle decisioni, e un cancello finto che
  // dice quello che ci serve. Il resto dello script resta com'è — è il punto della prova.
  for (const f of ["allineamento-esito.sh", "scritture-a-rischio.mjs"]) {
    writeFileSync(join(repo, "cervello", f), readFileSync(join(REPO, "cervello", f), "utf8"));
  }
  writeFileSync(
    join(repo, "cervello", "gate-pubblicazione.sh"),
    ["gate_pubblicazione() {", `  echo GATE >> '${ops}'`, `  return ${cancello}`, "}", ""].join("\n"),
  );

  // La scrittura dell'AD: quaranta minuti di lavoro del motore, ancora non committati.
  const scritto = join(repo, "MyCity-Vault", "STATO.md");
  if (sporca) {
    mkdirSync(join(repo, "MyCity-Vault"), { recursive: true });
    writeFileSync(scritto, "il briefing di stanotte\n");
  }

  // Il `git` finto NON è uno stub d'idea: agisce sui file come quello vero. `checkout -f` butta via
  // ciò che non è stato salvato, `stash push` lo sposta da parte. È l'unico modo perché la domanda
  // «il lavoro è sopravvissuto?» abbia una risposta vera.
  writeFileSync(
    join(bin, "git"),
    `#!/usr/bin/env bash
LOG='${ops}'; R='${repo}'; S='${stash}'
DIRS="${MEM_DIRS.join(" ")}"
a=(); while [ $# -gt 0 ]; do case "$1" in -c) shift 2 ;; *) a+=("$1"); shift ;; esac; done
set -- "\${a[@]+"\${a[@]}"}"
cmd="\${1:-}"; shift 2>/dev/null || true
case "$cmd" in
  rev-parse)
    case "$*" in
      *"--abbrev-ref HEAD"*) echo main ;;
      *--git-path*) echo "$R/.git/inesistente" ;;
      *) echo 0000000 ;;
    esac ;;
  status)
    for d in $DIRS; do
      [ -d "$R/$d" ] || continue
      find "$R/$d" -type f 2>/dev/null | sed "s#^$R/# M #"
    done ;;
  fetch) echo FETCH >> "$LOG" ;;
  rev-list) echo 0 ;;
  add) echo ADD >> "$LOG" ;;
  reset) echo RESET >> "$LOG" ;;
  commit) echo COMMIT >> "$LOG" ;;
  push) echo PUSH >> "$LOG" ;;
  stash)
    echo STASH >> "$LOG"
    n=0
    for d in $DIRS; do
      [ -d "$R/$d" ] || continue
      cp -r "$R/$d" "$S/" 2>/dev/null && rm -rf "$R/$d" && n=1
    done
    [ "$n" = 1 ] || echo "No local changes to save" ;;
  checkout)
    case "$*" in
      *-f*) echo CHECKOUT-F >> "$LOG"; for d in $DIRS; do rm -rf "$R/$d"; done ;;
      *) echo CHECKOUT >> "$LOG" ;;
    esac ;;
  ls-tree) printf 'cervello\\nREADME.md\\nMyCity-Vault\\n' ;;
  log) echo abc1234 ;;
  *) : ;;
esac
exit 0
`,
  );
  // Lo script si comporta da root ricorsivamente: qui deve credere di essere l'utente del worker.
  writeFileSync(join(bin, "id"), `#!/usr/bin/env bash\n[ "\${1:-}" = "-un" ] && { echo mycity; exit 0; }\nexec /usr/bin/id "$@"\n`);
  chmodSync(join(bin, "git"), 0o755);
  chmodSync(join(bin, "id"), 0o755);

  const r = spawnSync("bash", [SCRIPT], {
    encoding: "utf8",
    timeout: 60_000,
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      REPO: repo,
      GIT_PUSH_TOKEN: "finto",
      GIT_REPO: "finto/repo",
      AGGIORNA_SKIP_RESTART: "1",
    },
  });
  const atti = readFileSync(ops, "utf8").split("\n").filter(Boolean);
  const nelWorktree = existsSync(scritto);
  const nellaStash = existsSync(join(stash, "MyCity-Vault", "STATO.md"));
  return { atti, nelWorktree, nellaStash, sopravvissuto: nelWorktree || nellaStash, out: `${r.stdout}${r.stderr}`, status: r.status };
}

prova("① IL CASO CHE HA ROTTO: il cancello dice no e la memoria NON viene buttata", () => {
  const r = allineamento({ cancello: 1, sporca: true });
  assert.ok(r.atti.includes("GATE"), `il cancello non è stato nemmeno chiamato: ${r.out.slice(-400)}`);
  assert.ok(r.atti.includes("CHECKOUT-F"), "lo script non è arrivato al checkout distruttivo: la prova non ha misurato niente");
  assert.equal(r.sopravvissuto, true, "il briefing scritto e non committato è sparito nel checkout -f: è AR-388");
});

prova("② la messa al sicuro avviene PRIMA del checkout, non dopo", () => {
  const r = allineamento({ cancello: 1, sporca: true });
  const iStash = r.atti.indexOf("STASH");
  const iCheck = r.atti.indexOf("CHECKOUT-F");
  assert.ok(iStash >= 0, `nessuna messa al sicuro nel registro degli atti: ${r.atti.join(" → ")}`);
  assert.ok(iStash < iCheck, `ordine trovato: ${r.atti.join(" → ")} — salvare dopo aver cancellato non salva niente`);
});

prova("③ con l'albero pulito il freno non scatta: nessuna messa da parte, si allinea", () => {
  const r = allineamento({ cancello: 0, sporca: false });
  assert.ok(r.atti.includes("CHECKOUT-F"), "l'allineamento non è arrivato in fondo");
  assert.equal(r.atti.filter((a) => a === "STASH").length, 0, "una difesa che scatta sempre viene tolta al primo fastidio");
});

prova("④ la decisione guarda il DATO, non il ramo che l'ha chiamata", () => {
  assert.equal(decidiPrimaDelCheckout({ porcelain: " M MyCity-Vault/STATO.md" }).azione, "metti-da-parte");
  assert.equal(decidiPrimaDelCheckout({ porcelain: "?? consegne/nuovo.md" }).azione, "metti-da-parte", "un file mai visto prima è lavoro come gli altri");
  assert.equal(decidiPrimaDelCheckout({ porcelain: " M cervello/dati.json" }).azione, "procedi", "il codice si allinea DA main: non è lavoro da salvare");
  assert.equal(decidiPrimaDelCheckout({ porcelain: "" }).azione, "procedi");
  assert.deepEqual(decidiPrimaDelCheckout({ porcelain: "R  MyCity-Vault/a.md -> MyCity-Vault/b.md" }).file, ["MyCity-Vault/b.md"], "di un rinominato conta la destinazione: è lì che sta il contenuto");
});

prova("④bis un nome che COMINCIA come una cartella di memoria non è memoria", () => {
  assert.equal(eMemoria("MyCity-Vault"), true);
  assert.equal(eMemoria("MyCity-Vault/x"), true);
  assert.equal(eMemoria("MyCity-Vaulted/x"), false);
  assert.equal(percorsoDaRiga('?? "MyCity-Vault/con spazio.md"'), "MyCity-Vault/con spazio.md");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
