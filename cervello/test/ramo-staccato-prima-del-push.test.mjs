#!/usr/bin/env node
// 🚧 AR-396 — «Il controllo del ramo prima di pubblicare sta prima del riallineamento, non prima
// dell'invio.»
//
// IL FATTO. `pubblica_memoria` (cervello/gate-pubblicazione.sh) controlla che HEAD sia sul ramo
// giusto prima di spingere la memoria su main. Il commento sopra la funzione lo dichiarava da
// sempre come guardia d'USCITA — «subito prima del push, perché fra il gate e il push passano un
// commit e un rebase» — ma la chiamata stava FUORI dal ciclo, cioè prima del fetch e del rebase.
// Fra il controllo e l'invio passavano proprio le due operazioni che possono staccare HEAD.
//
// PERCHÉ QUESTO FILE ESISTE. Due ragioni, e la seconda è quella che conta.
//   · La prova che aveva chiuso AR-297/AR-315 cercava la PRESENZA del controllo, non la sua
//     POSIZIONE: il banco usava un git finto che rispondeva sempre lo stesso ramo, e in quello
//     scenario il controllo pre-ciclo ferma già tutto da solo. Spostare la chiamata non cambiava
//     nulla nel verde. Serviva uno scenario in cui HEAD si stacca DOPO che il primo controllo è
//     passato: è l'unico in cui la posizione fa la differenza fra fermarsi e pubblicare metà lavoro.
//   · Quello scenario era stato scritto, ma in bats
//     (`cervello/test/ramo-staccato-dopo-il-controllo.bats`), e il motore delle chiusure sa
//     eseguire solo `node cervello/<script>.mjs`: la prova non era rieseguibile, quindi il difetto
//     è rimasto aperto. Qui la stessa scena la monta node, e la eseguono bash e la funzione vera.
//
// COME. Un `git` finto con un CONTATORE: alla prima domanda su `rev-parse --abbrev-ref HEAD`
// risponde `main` (il controllo pre-ciclo passa e si entra nel ciclo), alla seconda risponde `HEAD`
// (staccato dopo fetch e rebase). La prova non guarda il sorgente: guarda se il file `push.log`
// esiste, cioè se il push è partito.
//
// NON-VACUITÀ (verificata rompendo il fix apposta): togliendo da `pubblica_memoria` il ricontrollo
// dentro il ciclo — quello subito prima del `git push` — il caso ① diventa ROSSO: il push parte e
// su main finisce un avanzamento parziale, che dal remoto risulta fast-forward e quindi non se ne
// accorge nessuno.

import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const GATE = join(REPO, "cervello", "gate-pubblicazione.sh");

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
 * Monta la scena e fa girare la funzione VERA.
 * `prima` = che ramo risponde git alla prima domanda · `dopo` = a tutte le successive.
 */
function pubblica(prima, dopo) {
  const tmp = mkdtempSync(join(tmpdir(), "ar396-"));
  const bin = join(tmp, "bin");
  mkdirSync(bin, { recursive: true });
  const contatore = join(tmp, "quante-volte");
  const push = join(tmp, "push.log");
  writeFileSync(
    join(bin, "git"),
    `#!/usr/bin/env bash
case "$*" in
  *"rev-parse --abbrev-ref HEAD"*)
    n=$(cat '${contatore}' 2>/dev/null || echo 0); n=$((n + 1)); echo "$n" > '${contatore}'
    if [ "$n" -le 1 ]; then echo '${prima}'; else echo '${dopo}'; fi
    exit 0 ;;
  *"rev-parse --git-path"*) echo '${tmp}/niente'; exit 0 ;;
  *fetch*)  exit 0 ;;
  *rebase*) exit 0 ;;
  *push*)   echo "$*" >> '${push}'; exit 0 ;;
esac
exit 0
`,
  );
  chmodSync(join(bin, "git"), 0o755);
  const r = spawnSync("bash", ["-c", `. '${GATE}'; pubblica_memoria 'https://finto/repo.git' main 1 5`], {
    encoding: "utf8",
    timeout: 60_000,
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
  });
  return { status: r.status, pushPartito: existsSync(push), testo: `${r.stdout || ""}${r.stderr || ""}` };
}

prova("① IL CASO CHE HA ROTTO: HEAD si stacca DOPO il controllo pre-ciclo → zero push", () => {
  // Il primo controllo dice «siamo su main» e lascia entrare nel ciclo; poi fetch e rebase spostano
  // HEAD su un avanzamento parziale. Solo il controllo al confine dell'atto può vederlo.
  const r = pubblica("main", "HEAD");
  assert.equal(r.pushPartito, false, "il push è partito con HEAD staccato: su main finisce metà lavoro, e risulta fast-forward");
  assert.equal(r.status, 1);
  assert.match(r.testo, /AR-396/, "chi legge deve sapere quale guardia l'ha fermato");
});

prova("② il ramo giusto anche dopo il rebase → il push parte (la prova non è vacua)", () => {
  // Se la funzione rifiutasse sempre, il caso ① non proverebbe niente.
  const r = pubblica("main", "main");
  assert.equal(r.pushPartito, true, "con tutto a posto la memoria deve uscire davvero");
  assert.equal(r.status, 0);
});

prova("③ ramo sbagliato già in partenza → fermato prima del ciclo, zero push", () => {
  // Il vecchio scenario: continua a valere, ma da solo NON distingue le due posizioni — ed è la
  // ragione per cui il difetto era rimasto aperto per settimane con la prova verde.
  const r = pubblica("fix/lotto", "fix/lotto");
  assert.equal(r.pushPartito, false);
  assert.equal(r.status, 1);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
