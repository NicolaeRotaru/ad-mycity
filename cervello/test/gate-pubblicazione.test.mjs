#!/usr/bin/env node
// AR-314 / AR-310 / AR-315 — il cancello che ferma la memoria bugiarda vale per TUTTI i pubblicatori.
//
// Misurato il 27/7 sui cinque che scrivono su main:
//   giro.sh    guardia-ramo 1 · perimetro 4 · timeout-rete 0 · cancello 7
//   ritmo.sh              1 ·            3 ·              0 ·          0
//   monitora.sh           2 ·            3 ·              0 ·          0
//   worker.sh             3 ·            2 ·              6 ·          0
//   aggiorna-cervello.sh  —  ·  `git add -A` secco  ·     0 ·          0
//
// Il cancello girava in UN pubblicatore su cinque. `ritmo.sh` è quasi riga per riga il blocco di
// `giro.sh` — meno il cancello. Ogni protezione è nata dove qualcuno ha visto rompersi qualcosa e non
// è mai stata portata nelle copie accanto: è «il fix applicato a una copia sola» alla scala del worker.
//
// Qui si ESEGUONO le decisioni vere di cervello/gate-pubblicazione.sh in una bash pulita — non si
// legge il file per vedere se «contiene» qualcosa. L'ultimo caso è il cancello contro la ricaduta:
// controlla che nessuno dei cinque sia rimasto fuori.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SH = join(QUI, "..", "gate-pubblicazione.sh");

/** Esegue una funzione reale del gate e torna il codice di uscita (0 = sì). */
function esito(cmd) {
  try {
    execFileSync("bash", ["-c", `. "${SH}"; ${cmd}`], { encoding: "utf8", stdio: "pipe" });
    return 0;
  } catch (e) {
    return e.status ?? 1;
  }
}
function stdout(cmd) {
  return execFileSync("bash", ["-c", `. "${SH}"; ${cmd}`], { encoding: "utf8" }).trim();
}

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

// ── la guardia del ramo (AR-315) ─────────────────────────────────────────────
prova("il caso che ha rotto: da un ramo di lavoro NON si pubblica", () => {
  // Un ramo abbandonato che prende il posto di main significa mandare in DEPLOY codice non revisionato.
  assert.equal(esito("ramo_ammesso fix/lotto-3 main"), 1);
  assert.equal(esito("ramo_ammesso claude/qualcosa main"), 1);
});

prova("da main si pubblica", () => {
  assert.equal(esito("ramo_ammesso main main"), 0);
});

prova("un ramo vuoto (HEAD staccato, git muto) non passa", () => {
  assert.equal(esito('ramo_ammesso "" main'), 1, "nel dubbio non si pubblica");
});

// ── il perimetro (AR-310) ────────────────────────────────────────────────────
prova("il caso che ha rotto: il codice nello stage blocca la pubblicazione", () => {
  // `git add -A` secco in aggiorna-cervello.sh mandava su main tutto quello che trovava.
  assert.equal(esito(`perimetro_ok "MyCity-Vault/STATO.md\ncervello/giro.sh"`), 1);
  assert.equal(esito(`perimetro_ok "pannello/src/app/page.tsx"`), 1);
  assert.equal(esito(`perimetro_ok ".claude/settings.json"`), 1);
});

prova("le quattro cartelle di memoria passano", () => {
  assert.equal(esito(`perimetro_ok "MyCity-Vault/a.md\nconsegne/b.md\ncreativi/c.png\nmemoria-squadra/tech.md"`), 0);
});

prova("stage vuoto: niente da controllare, passa", () => {
  assert.equal(esito(`perimetro_ok ""`), 0);
});

// ── il verdetto (AR-314, AR-322) ─────────────────────────────────────────────
prova("il caso che ha rotto: un solo guardiano rosso ferma tutto", () => {
  assert.equal(esito("gate_verdetto 1 0 0 0"), 1, "scan-segreti rosso");
  assert.equal(esito("gate_verdetto 0 1 0 0"), 1, "coerenza-fatti rosso");
  assert.equal(esito("gate_verdetto 0 0 0 1"), 1, "vault-sanita rosso");
});

prova("tutti verdi: si pubblica", () => {
  assert.equal(esito("gate_verdetto 0 0 0 0"), 0);
});

prova("fail-closed: un guardiano CIECO vale come bocciato, non come verde", () => {
  // AR-322: rc=2 significa «non ho potuto misurare». Meglio memoria vecchia sul Pannello che memoria
  // che mente — un cancello che assolve quando non sa è un cancello decorativo.
  assert.equal(esito("gate_verdetto 2 0 0 0"), 1);
});

// ── il timeout di rete (AR-299) ──────────────────────────────────────────────
prova("c'è un timeout di rete, e si può alzare dall'ambiente", () => {
  // Senza, il lucchetto resta in mano a una connessione morta e tutti aspettano dieci minuti per niente.
  assert.equal(stdout("gate_timeout_rete"), "60");
  assert.equal(stdout("GIT_NET_TIMEOUT=120 gate_timeout_rete"), "120");
});

// ── il cancello contro la ricaduta ───────────────────────────────────────────
prova("TUTTI E CINQUE i pubblicatori passano dal cancello, non uno solo", () => {
  // È il difetto stesso: la protezione esisteva in giro.sh e in nessun altro. Se il prossimo
  // pubblicatore nasce scoperto, questo test lo dice prima che lo scopra Nicola.
  //
  // ⚠️ Si cerca la CHIAMATA, non la menzione. La prima versione di questo test accettava un file che
  // nominasse `scan-segreti` da qualsiasi parte: togliendo le due righe che invocano davvero il
  // cancello, il test restava verde perché la parola sopravviveva nel commento accanto. Una prova
  // soddisfatta da un commento è la stessa forma di prova debole che il 27/7 ha lasciato passare 91
  // chiusure false — trovata qui provando a rompere il fix, che è esattamente perché lo si prova.
  const CHIAMA_CANCELLO = /gate_pubblicazione\s+"/; // il gate condiviso, invocato con argomenti
  const CHIAMA_SCAN = /node\s+"\$\{?SCRIPT_DIR\}?\/scan-segreti\.mjs"/; // il gate inline storico di giro.sh
  const scoperti = [];
  for (const f of [
    "cervello/giro.sh",
    "cervello/ritmo.sh",
    "cervello/monitora.sh",
    "cervello/worker.sh",
    "cervello/vps/aggiorna-cervello.sh",
  ]) {
    const src = readFileSync(join(REPO, f), "utf8");
    const haCancello = CHIAMA_CANCELLO.test(src) || CHIAMA_SCAN.test(src);
    const haPerimetro = /MEM_DIRS/.test(src);
    if (!haCancello || !haPerimetro) scoperti.push(`${f} (cancello:${haCancello} perimetro:${haPerimetro})`);
  }
  assert.deepEqual(scoperti, [], "questi pubblicatori scrivono su main senza protezione");
});

prova("ogni pubblicatore resta sintatticamente valido", () => {
  // Cambiare gli script che pubblicano la memoria è la cosa più rischiosa che si possa fare qui: se
  // si rompono, la Cabina smette di aggiornarsi e nessuno se ne accorge subito.
  for (const f of ["cervello/giro.sh", "cervello/ritmo.sh", "cervello/monitora.sh", "cervello/worker.sh", "cervello/vps/aggiorna-cervello.sh", "cervello/gate-pubblicazione.sh"]) {
    execFileSync("bash", ["-n", join(REPO, f)], { stdio: "pipe" });
  }
});

// ── esito ────────────────────────────────────────────────────────────────────
let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
