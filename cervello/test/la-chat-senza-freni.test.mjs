#!/usr/bin/env node
// AR-764 — la chat riceveva otto righe di prosa, sempre le stesse, senza freni.
//
// LA RADICE. Il blocco «CONTESTO MACCHINA» che il worker mette in ogni turno di chat prendeva le
// lezioni con `grep '^- ' LEZIONI-CHAT.md | head -8`. Tre conseguenze, tutte silenziose: sono
// sempre le stesse otto qualunque cosa Nicola chieda; non c'entrano niente col messaggio; e non
// portano il freno, perché in quel file di prosa il campo non esiste proprio.
//
// PERCHÉ ERA LA PORTA PIÙ IMPORTANTE. Le sessioni e il giro passavano già dall'archivio strutturato
// e ricevevano le regole sul tema col loro comando. La chat no — ed è quella che Nicola usa. Per due
// lotti di lavoro sull'apprendimento lui non ha visto cambiare niente, e aveva ragione: il lavoro
// era tutto dietro porte che non attraversa.
//
// PERCHÉ QUESTA PROVA GIRA CON node E NON CON bats. Le tre scene qui sotto eseguono la funzione VERA
// di `worker.sh` dentro un repo usa-e-getta, chiamando bash direttamente. In casa esiste anche una
// prova bats (`cervello/test/contesto-chat.bats`) e resta la mutazione registrata; ma `bats` non è
// installato — `npx` se lo scarica al volo — e un freno che dipende da un download non è un freno.
// Questa gira con quello che c'è sempre.
//
// COSA PROVA QUESTO FILE:
//   ① col messaggio di Nicola arrivano le regole SUL TEMA, e portano il freno;
//   ② senza messaggio il blocco resta esattamente quello di prima: nessuna regressione;
//   ③ se lo strumento non si trova, la chat non resta muta — tiene la lista di sempre. Una memoria
//      che tace perché un pezzo è rotto è peggio di una memoria vecchia.
//
// NON-VACUITÀ (verificata il 17/8): staccando in `worker.sh` la chiamata a `contesto-lezioni.mjs`
// (`if ! lezioni_tema=…` → `if true`), il caso ① diventa ROSSO.
//
// ⚠️ Non scrive niente nel repo vero: ogni scena lavora in una cartella temporanea.

import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const WORKER = join(REPO, "cervello/worker.sh");

/**
 * Esegue la funzione VERA del worker in un repo finto, come fa la prova bats: la si estrae dal file
 * con awk invece di copiarla qui, perché una copia si stacca dall'originale al primo edit.
 */
function contestoChat(messaggio, { scriptDir = join(REPO, "cervello"), lezioniFinte = null } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "chat-freni-"));
  try {
    const sh = (c) => execFileSync("bash", ["-c", c], { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    sh("git init -q -b prova . && git config user.email t@t.local && git config user.name T");
    sh("echo x > base.txt && git add base.txt && git commit -q -m 'commit di partenza'");
    if (lezioniFinte !== null) {
      mkdirSync(join(dir, "MyCity-Vault/90-Memoria-AI"), { recursive: true });
      writeFileSync(join(dir, "MyCity-Vault/90-Memoria-AI/LEZIONI-CHAT.md"), lezioniFinte, "utf8");
    }
    const arg = messaggio === undefined ? "" : ` ${JSON.stringify(messaggio)}`;
    return sh(
      `unset SUPABASE_URL SUPABASE_SERVICE_KEY; SCRIPT_DIR=${JSON.stringify(scriptDir)}; ` +
        `eval "$(awk '/^contesto_macchina_chat\\(\\)/,/^}/' ${JSON.stringify(WORKER)})"; ` +
        `contesto_macchina_chat${arg}`,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ── ① Le regole sul tema arrivano, col loro freno ────────────────────────────────────────────────

test("① col messaggio di Nicola la chat riceve le regole sul tema, e portano il freno", () => {
  const out = contestoChat("apri una PR per la modifica del pannello e controlla i conflitti");
  assert.ok(
    out.includes("SCHEDA PRIMA DI COMINCIARE") || out.includes("PRINCIPI SU QUESTO LAVORO"),
    "col grep di prima qui non arrivava niente di legato al messaggio",
  );
  assert.match(out, /freno:/, "e senza il comando che le fa rispettare sarebbe di nuovo solo prosa");
});

// ── ② Senza messaggio non cambia niente ──────────────────────────────────────────────────────────

test("② senza messaggio il blocco resta quello di prima", () => {
  const out = contestoChat(undefined);
  assert.match(out, /CONTESTO MACCHINA/);
  assert.doesNotMatch(out, /SCHEDA PRIMA DI COMINCIARE/, "niente scheda se non c'è una richiesta da leggere");
});

// ── ③ Se lo strumento manca, la chat non tace ────────────────────────────────────────────────────

test("③ con lo strumento irraggiungibile la chat tiene la lista di sempre", () => {
  const out = contestoChat("un messaggio qualsiasi abbastanza lungo da contare", {
    scriptDir: "/percorso/che/non/esiste",
    lezioniFinte: "- [2026-07-10] la lezione di sempre\n",
  });
  assert.match(out, /CONTESTO MACCHINA/);
  assert.match(out, /la lezione di sempre/, "una memoria muta è peggio di una memoria vecchia");
});
