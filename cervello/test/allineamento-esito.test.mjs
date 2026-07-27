#!/usr/bin/env node
// AR-311 / AR-312 / AR-316 — l'allineamento del server non deve dire «fatto» quando non ha fatto niente.
//
// Tre difetti, una radice. Il copione che porta il codice nuovo sul VPS aveva tre modi di mentire:
//
//   AR-311 (bloccante) — se il push dei commit pendenti falliva, stampava un ✗ e TIRAVA DRITTO fino
//     al `checkout -f`, che quei commit li butta. Il lavoro del server spariva per un errore di rete.
//     Un avviso su stderr non è una difesa: è un necrologio.
//   AR-312 — se il fetch falliva, l'allineamento diventava un no-op silenzioso ma il copione usciva 0
//     e watch-main SEGNAVA LO SHA COME VISTO: da lì in poi non ci riprovava più. Il server restava
//     indietro per sempre, dicendo che andava tutto bene.
//   AR-316 — un rinvio è normale (una chat sta lavorando su un ramo). Sei di fila per mezz'ora no:
//     è un worktree bloccato, e nessuno se ne accorge perché ogni singolo rinvio è verde.
//
// La regola che li unisce: **se un passo dell'allineamento non è riuscito, lo SHA non si segna.**
// Segnarlo significa «ho visto questa versione e l'ho applicata». Dirlo senza averlo fatto è la bugia
// che rende il server invisibilmente vecchio.
//
// Qui si eseguono le funzioni VERE di cervello/allineamento-esito.sh.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const SH = join(QUI, "..", "allineamento-esito.sh");
const REPO = join(QUI, "..", "..");
const sh = (cmd) => execFileSync("bash", ["-c", `. "${SH}"; ${cmd}`], { encoding: "utf8" }).trim();

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── AR-311: il caso in cui proseguire DISTRUGGE del lavoro ───────────────────
prova("il caso che ha rotto: se i commit del server non sono pubblicati, NON si allinea", () => {
  // Il `checkout -f` più avanti li butterebbe. È l'unico dei tre esiti in cui tirare dritto
  // distrugge qualcosa invece di lasciare solo il server indietro.
  assert.equal(sh("esito_allineamento 0 1 0"), "5");
  assert.match(sh("motivo_allineamento 5"), /checkout -f li cancellerebbe/);
});

prova("il push pendenti si valuta PER PRIMO, prima di ogni altra cosa", () => {
  // Anche con un fetch rotto E una chat che lavora, se ci sono commit non pubblicati la risposta
  // dev'essere 5: gli altri due casi sono recuperabili, questo no.
  assert.equal(sh("esito_allineamento 0 0 1"), "5");
});

// ── AR-312: il no-op che si dichiara riuscito ────────────────────────────────
prova("il caso che ha rotto: fetch fallito = non ho scaricato niente, quindi non ho allineato", () => {
  assert.equal(sh("esito_allineamento 1 0 0"), "4");
  assert.match(sh("motivo_allineamento 4"), /non ho scaricato niente/);
});

prova("il lavoro vivo su un ramo resta un rinvio normale, non un errore", () => {
  assert.equal(sh("esito_allineamento 1 1 1"), "3");
  assert.match(sh("motivo_allineamento 3"), /sta lavorando su un ramo/);
});

prova("quando è andato tutto bene, dice 0", () => {
  assert.equal(sh("esito_allineamento 1 1 0"), "0");
});

// ── la regola: lo SHA si segna SOLO su un allineamento riuscito ──────────────
prova("il caso che ha rotto: nessun esito diverso da 0 può far segnare lo SHA", () => {
  // Segnare lo SHA significa «ho applicato questa versione». Con rc=4 il server non ha scaricato
  // nulla, con rc=5 non ha allineato apposta: in entrambi i casi segnarlo lo rende invisibilmente
  // vecchio, perché da quel momento non ci riprova più.
  for (const rc of [3, 4, 5]) {
    assert.notEqual(sh(`watch_azione ${rc} 0`), "segna", `rc=${rc} non deve far segnare lo SHA`);
  }
  assert.equal(sh("watch_azione 0 0"), "segna");
});

// ── AR-316: il verde ripetuto all'infinito ───────────────────────────────────
prova("il caso che ha rotto: sei rinvii di fila diventano un allarme, non l'ennesimo verde", () => {
  // Un verde ripetuto all'infinito è indistinguibile da un sistema fermo.
  assert.equal(sh("watch_azione 3 5"), "rimanda", "cinque rinvii: ancora plausibile");
  assert.equal(sh("watch_azione 3 6"), "allarme", "sei ≈ mezz'ora: è un worktree bloccato");
  assert.equal(sh("watch_azione 3 20"), "allarme");
});

prova("il tetto si può alzare, ma non sparire", () => {
  assert.equal(sh("watch_azione 3 6 10"), "rimanda");
  assert.equal(sh("watch_azione 3 10 10"), "allarme");
});

prova("un allineamento riuscito azzera il conto, anche dopo molti rinvii", () => {
  assert.equal(sh("watch_azione 0 99"), "segna", "il rc=0 vince sempre sul contatore");
});

// ── il cablaggio ─────────────────────────────────────────────────────────────
prova("aggiorna-cervello ESCE invece di tirare dritto sui tre casi", () => {
  const src = readFileSync(join(REPO, "cervello/vps/aggiorna-cervello.sh"), "utf8");
  assert.doesNotMatch(src, /\[ "\$_ok_pre" = 1 \] \|\| echo/, "AR-311: un echo non è una difesa, il checkout -f butta i commit");
  // Il difetto NON era «ogni fetch silenziato» — dentro i cicli di riprova `fetch && rebase` va
  // benissimo, il retry è la difesa. Era il fetch seguito da un `checkout -f` CIECO: se il fetch
  // fallisce, FETCH_HEAD resta quello di prima e il ramo viene "allineato" a se stesso, in silenzio.
  assert.doesNotMatch(
    src,
    /git fetch[^\n]*\\\n\s*&& git checkout -f -B/,
    "AR-312: un checkout -f dietro un fetch fallito allinea il ramo a se stesso e dichiara riuscito",
  );
  const uscite = (src.match(/exit "\$_rc_all"/g) || []).length;
  assert.ok(uscite >= 3, `i tre casi devono uscire con un codice, non proseguire (trovate ${uscite})`);
  assert.match(src, /allineamento-esito\.sh/, "le decisioni vengono dal file condiviso");
});

prova("watch-main non segna lo SHA quando l'allineamento non è riuscito", () => {
  const src = readFileSync(join(REPO, "cervello/vps/watch-main.sh"), "utf8");
  assert.match(src, /watch_azione "\$_agg_rc" "\$_rinvii"/, "deve chiedere alla regola condivisa");
  assert.match(src, /RINVII_FILE/, "AR-316: il contatore dei rinvii consecutivi");
  assert.match(src, /rm -f "\$RINVII_FILE"/, "un allineamento riuscito deve azzerare il conto");
  // Il ramo che scrive lo SHA dev'essere raggiungibile SOLO dopo il blocco degli esiti ≠0.
  const iBlocco = src.indexOf('if [ "$_agg_rc" -ne 0 ]');
  const iSha = src.indexOf('echo "$REMOTE_SHA" > "$SHA_FILE"', iBlocco);
  assert.ok(iBlocco > 0 && iSha > iBlocco, "lo SHA si scrive dopo il controllo, non prima");
});

prova("ogni script toccato resta sintatticamente valido", () => {
  // Sono i copioni che portano il codice nuovo sul server: se si rompono, il VPS smette di
  // aggiornarsi e nessuno se ne accorge subito.
  for (const f of ["cervello/vps/aggiorna-cervello.sh", "cervello/vps/watch-main.sh", "cervello/allineamento-esito.sh"]) {
    execFileSync("bash", ["-n", join(REPO, f)], { stdio: "pipe" });
  }
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
