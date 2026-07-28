#!/usr/bin/env node
// AR-127 — la memoria che mente passa da un'altra porta.
//
// Il cancello condiviso esiste e fa il suo mestiere (`gate_pubblicazione` in
// `cervello/gate-pubblicazione.sh`): ramo, perimetro, guardiani di verità, fail-closed se manca
// `node`. Il problema non era il cancello: erano le porte che non ci passavano.
//
// Misurato il 28/7, e il difetto va rovesciato rispetto a come è scritto. `ritmo.sh`, `monitora.sh` e
// `worker.sh` il cancello lo chiamavano GIÀ (fix del 27/7). Scoperte erano altre due:
//
//   · **`giro.sh`** — il motore principale, quello su cui il cancello era stato modellato, girava
//     ancora una copia scritta a mano: aveva il perimetro (AR-044) ma non il controllo del ramo.
//   · **il recupero di `monitora.sh`** — committa e pusha quello che un run morto ha lasciato a
//     metà, e lo faceva PRIMA che il cancello fosse caricato. È la porta più pericolosa: scatta
//     quando la memoria ha più probabilità di essere incoerente. Negli ultimi 60 commit del VPS quel
//     messaggio compare 6 volte.
//
// Terza volta che questa forma torna: AR-272 (uscite verso il mondo), AR-169 (invarianti del
// registro), ora i push. Quando una regola vive in N posti, prima o poi N-1 restano indietro.

import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { codiceUscita, porteDi, porteScoperte } from "../porte-pubblicazione.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const GUARDIANO = join(REPO, "cervello/porte-check.mjs");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

prova("il caso che ha rotto: un push senza cancello sopra è una porta scoperta", () => {
  const finto = [
    'url="https://token@github.com/x/y.git"',
    'git push "$url" "HEAD:main" 2>/dev/null',
  ].join("\n");
  const porte = porteDi(finto, "finto.sh");
  assert.equal(porte.length, 1);
  assert.equal(porte[0].protetta, false);
  assert.equal(porteScoperte(porte).length, 1);
});

prova("col cancello sopra, la porta è protetta", () => {
  const finto = [
    '. "$SCRIPT_DIR/gate-pubblicazione.sh"',
    'if gate_pubblicazione "$SCRIPT_DIR" "$REPO"; then',
    '  git push "$url" "HEAD:main" 2>/dev/null',
    "fi",
  ].join("\n");
  const [p] = porteDi(finto, "finto.sh");
  assert.equal(p.protetta, true);
  assert.equal(p.gateSopraA, 2, "deve dire DOVE sta il cancello, non solo che c'è");
});

prova("un push dentro un commento non è un push", () => {
  // Senza questo, la riga di motore-ai.sh che VIETA il push libero verrebbe contata come una porta.
  assert.equal(porteDi("# git push non si fa qui", "x.sh").length, 0);
  assert.equal(porteDi("  #   git push \"$url\"", "x.sh").length, 0);
});

prova("riconosce anche le forme avvolte: `if git push` e `timeout N git push`", () => {
  assert.equal(porteDi('if git push "$url" "HEAD:main"; then', "x.sh").length, 1);
  assert.equal(porteDi('    if timeout "$_gt" git push "$url" "HEAD:${branch}"; then', "x.sh").length, 1,
    "worker.sh usa questa forma: non riconoscerla vorrebbe dire dichiarare protetta una porta mai guardata");
});

prova("un'esenzione vale solo se dice PERCHÉ", () => {
  // Un'esenzione senza motivo è il silenzio che stiamo curando, con un'etichetta sopra.
  const porte = porteDi('git push "$url" "HEAD:main"', "esente.sh");
  assert.equal(porteScoperte(porte, { "esente.sh": "boh" }).length, 1, "due parole non sono un motivo");
  assert.equal(porteScoperte(porte, { "esente.sh": "non pubblica: è un commento di divieto, il push vero lo fa git-pr.mjs" }).length, 0);
});

prova("il contratto del guardiano: 0 · 1 · 2, e il cieco vince", () => {
  assert.equal(codiceUscita({ scoperte: 0 }), 0);
  assert.equal(codiceUscita({ scoperte: 3 }), 1);
  assert.equal(codiceUscita({ cieco: 1, scoperte: 0 }), 2, "non aver potuto leggere non è un verde");
});

// ── Il guardiano VERO, eseguito ─────────────────────────────────────────────

prova("il guardiano trova le porte scoperte in una cartella finta", () => {
  const dir = mkdtempSync(join(tmpdir(), "mycity-porte-"));
  try {
    writeFileSync(join(dir, "buono.sh"), '. "$D/gate-pubblicazione.sh"\nif gate_pubblicazione "$D" "$R"; then\n  git push "$u" "HEAD:main"\nfi\n');
    writeFileSync(join(dir, "cattivo.sh"), 'git push "$u" "HEAD:main"\n');
    const r = spawnSync("node", [GUARDIANO], { cwd: REPO, encoding: "utf8", env: { ...process.env, PORTE_DIR: dir } });
    assert.equal(r.status, 1, "una porta scoperta è un rosso");
    assert.match(`${r.stdout}${r.stderr}`, /cattivo\.sh/);
    assert.doesNotMatch(`${r.stdout}${r.stderr}`.split("SENZA cancello")[1] || "", /buono\.sh/, "quella protetta non va accusata");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

prova("cartella vuota = CIECO (2), non verde", () => {
  const dir = mkdtempSync(join(tmpdir(), "mycity-porte-vuota-"));
  try {
    const r = spawnSync("node", [GUARDIANO], { cwd: REPO, encoding: "utf8", env: { ...process.env, PORTE_DIR: dir } });
    assert.equal(r.status, 2, "niente da controllare non vuol dire tutto a posto");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ── Il repo vero ────────────────────────────────────────────────────────────

prova("sul cervello VERO ogni porta passa dal cancello", () => {
  const r = spawnSync("node", [GUARDIANO], { cwd: REPO, encoding: "utf8" });
  assert.equal(r.status, 0, `atteso verde:\n${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /5 trovate, 5 passano/, "cinque porte, tutte protette");
});

prova("le due che erano scoperte adesso hanno il cancello davvero", () => {
  // Non basta che il guardiano sia verde: si guarda il codice, perché il guardiano lo ho scritto io.
  const giro = readFileSync(join(REPO, "cervello/giro.sh"), "utf8");
  const iGate = giro.indexOf('gate_pubblicazione "$SCRIPT_DIR" "$REPO" "$branch"');
  const iPush = giro.indexOf('if git push "$url" "HEAD:${branch}" 2>/dev/null; then');
  assert.ok(iGate > 0 && iGate < iPush, "in giro.sh il cancello dev'essere PRIMA del push");

  const mon = readFileSync(join(REPO, "cervello/monitora.sh"), "utf8");
  const blocco = mon.slice(mon.indexOf("recupero: scritture pendenti"), mon.indexOf("recupero: scritture pendenti") + 900);
  assert.match(blocco, /gate_pubblicazione/, "anche il RECUPERO passa dal cancello: è la porta più pericolosa");
  assert.match(blocco, /Recupero NON pubblicato/, "e quando il cancello dice no, lo si scrive invece di tacere");
});

prova("gli script restano validi: un `fi` perso qui spegne il giro", () => {
  // Nel lotto 14 un `fi` perso in una risoluzione di conflitto è passato inosservato fino a `bash -n`.
  for (const f of ["giro.sh", "monitora.sh", "ritmo.sh", "worker.sh", "gate-pubblicazione.sh"]) {
    const r = spawnSync("bash", ["-n", join(REPO, "cervello", f)], { encoding: "utf8" });
    assert.equal(r.status, 0, `${f}: ${r.stderr}`);
  }
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
