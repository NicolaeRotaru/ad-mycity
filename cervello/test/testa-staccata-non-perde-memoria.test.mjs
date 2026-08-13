#!/usr/bin/env node
// AR-628 — il commit di salvataggio che l'allineamento buttava via.
//
// IL CASO VERO. Le tre cadenze (giro, ritmo, monitoraggio) prima di partire committano quello che
// trovano scritto e non salvato: «recupero: scritture pendenti». Subito dopo si allineano al remoto.
// Se HEAD era STACCATO — processo ucciso a metà di un rebase, riavvio del server: sul VPS è successo
// per trentuno ore il 12/8, ed è scritto in aggiorna-cervello.sh — il ramo staccato faceva
// `git checkout -B main FETCH_HEAD`, cioè spostava main sul remoto. Il commit di recupero creato tre
// righe sopra restava senza nessun ref che lo puntasse: memoria persa in silenzio (briefing, righe
// FATTO di azioni, esiti), e rischio di rieseguire azioni già fatte perché la traccia era sparita.
// Il log intanto stampava «HEAD portato su main» come se fosse tutto a posto.
//
// PERCHÉ QUESTA PROVA GIRA SUL CODICE VERO. La cura di AR-028 aveva già coperto il ramo «HEAD è già
// su main» e la sua prova era verde: il difetto è sopravvissuto per due settimane nel ramo accanto,
// in tre copie. Una prova che guardasse una parola nel file sarebbe verde anche adesso. Qui invece
// il blocco di allineamento viene ESTRATTO dai tre script ed ESEGUITO su un repository git vero,
// con HEAD davvero staccato e un commit di recupero davvero da perdere.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SCRIPT = ["cervello/giro.sh", "cervello/ritmo.sh", "cervello/monitora.sh"];

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};
const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

/**
 * Il blocco di allineamento di uno script: da `if [ "$_fetch_ok" = 1 ]; then` fino al suo `fi`,
 * contato per indentazione. Estrarre invece di riscrivere è il punto: se domani qualcuno rimette la
 * riga distruttiva, questa prova esegue QUELLA riga.
 */
function bloccoAllineamento(file) {
  const righe = readFileSync(join(REPO, file), "utf8").split("\n");
  const inizio = righe.findIndex((r) => /^\s*if \[ "\$_fetch_ok" = 1 \]; then\s*$/.test(r));
  assert.notEqual(inizio, -1, `${file}: il blocco di allineamento non esiste più`);
  const dentro = righe[inizio].length - righe[inizio].trimStart().length;
  for (let i = inizio + 1; i < righe.length; i++) {
    const ind = righe[i].length - righe[i].trimStart().length;
    if (/^\s*fi\s*$/.test(righe[i]) && ind === dentro) return righe.slice(inizio, i + 1).join("\n");
  }
  throw new Error(`${file}: blocco di allineamento senza chiusura`);
}

/** Un remoto vero, un locale vero, HEAD staccato e un commit di recupero da salvare. */
function banco() {
  const dir = mkdtempSync(join(tmpdir(), "testa-staccata-"));
  const remoto = join(dir, "remoto");
  const locale = join(dir, "locale");
  mkdirSync(remoto, { recursive: true });
  const id = ["-c", "user.email=t@t", "-c", "user.name=t"];
  execFileSync("git", ["init", "-q", "-b", "main", remoto]);
  writeFileSync(join(remoto, "base.txt"), "uno\n");
  git(remoto, "add", "-A"); execFileSync("git", [...id, "commit", "-qm", "base"], { cwd: remoto });
  execFileSync("git", ["clone", "-q", remoto, locale]);
  execFileSync("git", ["config", "user.email", "t@t"], { cwd: locale });
  execFileSync("git", ["config", "user.name", "t"], { cwd: locale });

  // Il remoto va avanti: senza qualcosa su cui allinearsi il rebase non farebbe niente e la prova
  // sarebbe vacua per costruzione.
  writeFileSync(join(remoto, "nuovo-dal-remoto.txt"), "due\n");
  git(remoto, "add", "-A"); execFileSync("git", [...id, "commit", "-qm", "avanzamento remoto"], { cwd: remoto });

  // Il caso che ha rotto: HEAD staccato, e sopra ci finisce il commit di recupero della memoria.
  git(locale, "checkout", "-q", "--detach");
  writeFileSync(join(locale, "briefing.md"), "il briefing che non deve sparire\n");
  git(locale, "add", "-A");
  execFileSync("git", [...id, "commit", "-qm", "recupero: scritture pendenti da ritmo interrotto"], { cwd: locale });
  git(locale, "fetch", "-q", remoto, "main");   // scrive FETCH_HEAD, come fanno gli script
  return { dir, remoto, locale };
}

for (const file of SCRIPT) {
  prova(`AR-628 (runtime): ${file} non orfana il commit di recupero con HEAD staccato`, () => {
    const { locale } = banco();
    const script = `
set -uo pipefail
cd "${locale}"
ts(){ echo ORA; }
GIT_ID=(-c user.email=t@t -c user.name=t)
branch=main
_fetch_ok=1
${bloccoAllineamento(file)}
`;
    const out = execFileSync("bash", ["-c", script], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

    // ① Il commit di recupero è ancora RAGGIUNGIBILE dal ramo — non fra i penzolanti.
    const logMain = git(locale, "log", "--oneline", "main");
    assert.match(logMain, /recupero: scritture pendenti/,
      `${file}: il commit di recupero è stato orfanato — la memoria è persa in silenzio\nlog:\n${logMain}\nuscita:\n${out}`);
    // ② Il file che portava è davvero sul disco.
    assert.equal(readFileSync(join(locale, "briefing.md"), "utf8").trim(), "il briefing che non deve sparire");
    // ③ HEAD è tornato sul ramo: era metà del mestiere di quel blocco e non deve essersi perso.
    assert.equal(git(locale, "rev-parse", "--abbrev-ref", "HEAD"), "main", `${file}: HEAD non è tornato sul ramo`);
    // ④ E l'allineamento è avvenuto davvero: c'è anche il commit arrivato dal remoto.
    assert.match(logMain, /avanzamento remoto/, `${file}: non si è allineato al remoto`);
    // ⑤ Lo dice, invece di stampare «tutto a posto» come prima.
    assert.match(out, /staccato/i, `${file}: il log non dice che HEAD era staccato`);
  });
}

prova("AR-628: nessuno dei tre script ha più il ramo distruttivo", () => {
  // La domanda ① del secondo giro: OGNI strada che arriva all'atto passa dal freno? Non quella che
  // ho riparato — tutte. Il difetto era in tre copie proprio perché la cura precedente ne guardò una.
  for (const file of SCRIPT) {
    const testo = readFileSync(join(REPO, file), "utf8")
      .split("\n").filter((r) => !r.trimStart().startsWith("#")).join("\n");
    assert.doesNotMatch(testo, /checkout -B "\$branch" FETCH_HEAD/,
      `${file}: è tornato il checkout che sposta il ramo sul remoto e orfana il commit di recupero`);
    assert.match(testo, /git checkout -B "\$branch" 2>\/dev\/null/,
      `${file}: manca il riaggancio a HEAD prima dell'allineamento`);
  }
});

prova("AR-628: il commit di recupero viene fatto PRIMA dell'allineamento, in tutti e tre", () => {
  // Se un giorno qualcuno spostasse il commit dopo, il fix qui sopra proteggerebbe un commit che non
  // esiste ancora — verde e inutile.
  for (const file of SCRIPT) {
    const testo = readFileSync(join(REPO, file), "utf8");
    const iCommit = testo.indexOf("recupero: scritture pendenti");
    const iAllinea = testo.indexOf('if [ "$_fetch_ok" = 1 ]; then');
    assert.ok(iCommit !== -1, `${file}: non committa più le scritture pendenti`);
    assert.ok(iCommit < iAllinea, `${file}: il commit di recupero è finito DOPO l'allineamento`);
  }
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
