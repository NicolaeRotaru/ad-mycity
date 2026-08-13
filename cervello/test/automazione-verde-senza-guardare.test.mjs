#!/usr/bin/env node
// 🧪 AR-370 — IL GUARDIANO DELL'AUTOMAZIONE DIVENTAVA VERDE APPENA LO LANCIAVI DA DOVE I TIMER NON ESISTONO.
//
// Fuori dal VPS non c'è systemd: i controlli sui timer e sul worker venivano saltati e registrati
// come `warn`. Ma `warn` è un esito di MERITO — «l'ho guardato e non mi piace del tutto» — mentre
// qui la verità era «non l'ho guardato». Il verdetto finale contava solo i `fail`, quindi da una
// sessione cloud lo script usciva 0: verde pieno su una macchina di cui non aveva visto né i timer
// né il worker.
//
// La cura non è promuovere il warn a rosso: sarebbe un rosso falso, e un rosso falso si impara a
// ignorare esattamente come un verde falso. La cura è il TERZO esito, che nel contratto dei
// guardiani di casa esiste già: 0 passato · 1 violazione · 2 NON HO POTUTO MISURARE.
//
// Si esegue lo script VERO. Questo test gira da un posto senza systemd (contenitore o sessione
// cloud): se un giorno girasse sul VPS i controlli sarebbero eseguibili e la premessa cadrebbe —
// per questo la premessa è la prima cosa che il test verifica, invece di darla per scontata.

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SUL_VPS = existsSync("/opt/mycity/ad-mycity");
const CON_SYSTEMD = existsSync("/run/systemd/system");

/**
 * Lancia il guardiano vero senza i token in ambiente.
 *
 * Senza token il controllo su GitHub non si può fare — ed è proprio uno dei casi in gioco. Toglierli
 * serve anche a rendere il test ripetibile: con un token valido lo script parlerebbe con la rete, e
 * una prova che dipende dalla rete misura la rete.
 */
function lancia() {
  const env = { ...process.env };
  for (const k of ["GIT_PUSH_TOKEN", "GIT_TOKEN", "GITHUB_TOKEN", "GH_TOKEN", "MARKETPLACE_GIT_TOKEN"]) delete env[k];
  const r = spawnSync(process.execPath, [join(REPO, "cervello", "verifica-automazione.mjs"), "--json"], {
    cwd: REPO,
    encoding: "utf8",
    env,
    timeout: 120_000,
  });
  let j = null;
  try {
    j = JSON.parse(r.stdout);
  } catch {
    throw new Error(`il guardiano non ha prodotto JSON:\n${r.stdout}\n${r.stderr}`);
  }
  return { rc: r.status, j };
}

test("ciò che non si può eseguire qui è dichiarato, non contato come ok", { skip: SUL_VPS ? "sul VPS i controlli si eseguono davvero" : false }, () => {
  const { j } = lancia();
  assert.ok(Array.isArray(j.controlli_non_eseguiti), "il campo dei controlli non eseguiti deve esistere");
  assert.ok(j.controlli_non_eseguiti.length > 0, "senza token e senza systemd qualcosa NON si è potuto misurare");
  for (const c of j.controlli_non_eseguiti) {
    assert.ok(c.nome && c.perche, `ogni ⚪ deve dire cosa e perché: ${JSON.stringify(c)}`);
  }
  // Nessuno dei ⚪ deve essere passato per `ok`: è la confusione esatta che il difetto descriveva.
  const nomiCiechi = new Set(j.controlli_non_eseguiti.map((c) => c.nome));
  for (const c of j.checks) {
    if (nomiCiechi.has(c.nome)) assert.notEqual(c.esito, "ok", `«${c.nome}» non è stato misurato e non può essere ok`);
  }
});

test(
  "con controlli non eseguiti il codice d'uscita non è MAI 0",
  { skip: SUL_VPS ? "sul VPS i controlli si eseguono davvero" : false },
  () => {
    // NOTA — questa prova è stata riscritta dopo che la CI l'ha bocciata, e la bocciatura era giusta.
    // La prima versione pretendeva ZERO rossi: una cosa che dipende da DOVE gira (su un runner
    // GitHub ci sono chiavi che qui non ci sono, e viceversa), non dal difetto. Una prova che
    // fallisce per l'ambiente insegna a ignorarla — cioè il modo in cui muore un freno.
    // Qui si guarda l'invariante, che vale ovunque: se c'è anche un solo controllo non eseguito, il
    // verde non si può dare. E nel caso senza rossi il codice è esattamente 2.
    const { rc, j } = lancia();
    assert.ok(j.controlli_non_eseguiti.length > 0, "senza token e senza systemd qualcosa NON si è potuto misurare");
    assert.notEqual(rc, 0, "prima usciva 0: verde pieno su una macchina che non aveva guardato");

    const rossi = j.checks.filter((c) => c.esito === "fail");
    if (rossi.length === 0) {
      assert.equal(rc, 2, "niente di rotto e qualcosa non misurato: è il ⚪, non il verde");
      assert.equal(j.esito, "cieco", "anche il segnale scritto in memoria deve portare il terzo stato");
    } else {
      assert.equal(rc, 1, `c'è un rosso vero (${rossi.map((r) => r.nome).join(", ")}): il rosso vince sul ⚪`);
    }
  },
);

test("i timer e il worker non spariscono dall'elenco: un controllo che non c'è è più invisibile di uno rosso", { skip: CON_SYSTEMD ? "qui systemd c'è: i controlli si eseguono" : false }, () => {
  const { j } = lancia();
  const nomi = j.checks.map((c) => c.nome);
  for (const atteso of ["timer watch-main", "timer giro (battito 2h)", "worker"]) {
    assert.ok(nomi.includes(atteso), `«${atteso}» deve comparire come ⚪, non mancare del tutto`);
  }
});

test("un binario systemctl senza systemd avviato non basta: sarebbero rossi falsi", () => {
  // Il 13/8 in una sessione cloud `command -v systemctl` rispondeva, nessuna unità era caricata, e
  // ogni `is-active` tornava vuoto: dodici ❌ sparati da un posto che non poteva misurare niente.
  const { j } = lancia();
  const timerRossi = j.checks.filter((c) => c.esito === "fail" && /^timer /.test(c.nome));
  if (!CON_SYSTEMD) {
    assert.deepEqual(timerRossi, [], "senza systemd avviato nessun timer può essere dichiarato rotto");
  }
});
