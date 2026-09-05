#!/usr/bin/env node
// 🧪 AR-859 — «IL POSTO NON C'È» NON È «HO GUARDATO E HO TROVATO».
//
// LA MALATTIA, misurata sul codice vero il 28/8: tre strumenti — `test-cervello.mjs`,
// `valida-contratti.mjs`, `chiusura-loop.mjs --sonda` — uscivano **1** dal ramo in cui il posto
// dove dovevano guardare non esiste. Uno esce col codice del reperto senza avere nessun reperto:
// da fuori «la cartella delle prove non c'è» e «tre prove sono rosse» erano la stessa notizia.
// Chi legge va a riparare la cosa sbagliata — `giro.sh` a rc=1 risponde «TEST DEL CERVELLO ROSSI:
// uno o più file di test non passano», cioè manda a leggere i test mentre il guasto è lo strumento.
//
// Questi tre erano gli ultimi, e i più delicati, perché il loro codice d'uscita lo LEGGE qualcuno:
// giro.sh (`vincolo_da_rc`, che il 2 lo traduce già in ⚪) e cancello-lotto.mjs (`esegui`, che il 2
// lo tiene separato da `fallito`). La cura è doppia per costruzione: lo strumento emette il 2, il
// lettore lo sapeva già leggere.
//
// COSA MISURA QUESTO FILE, e in che ordine:
//   ① la decisione pura (`posto-o-contenuto.mjs`) messa in tutti i suoi stati;
//   ② i tre strumenti ESEGUITI in una copia dell'albero DAVVERO spoglia → devono uscire 2;
//   ③ il rovescio, che è la metà che si dimentica: col posto presente e vuoto devono uscire 1.
//      Senza ③ questo file passerebbe anche se qualcuno facesse uscire 2 tutto quanto — cioè se
//      curasse il falso allarme trasformandolo in silenzio, che è peggio.
//
// ⚠️ LA TRAPPOLA DELLA COPIA. `AD_ROOT` è la cartella SOPRA `cervello/`: copiando `cervello/` in una
// cartella nuova, ciò che gli strumenti cercano fuori da lì (il vault, `.claude/agents`) non c'è
// per davvero. Ma `test-cervello.mjs` cerca `cervello/test`, che sta DENTRO la copia e se la porta
// dietro: senza toglierla, quel caso non aprirebbe il ramo e passerebbe senza provare niente.
// Perciò qui la spogliatezza della copia si ASSERISCE prima di lanciare, invece di darla per buona.

import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");

// Il modulo si carica QUI, in cima, non dentro i casi.
import { verdettoPostoVuoto, rigaReferto } from "../posto-o-contenuto.mjs";

// ─────────────────────────────────────────────────────────────────────────────
// ① LA DECISIONE, ESEGUITA
// ─────────────────────────────────────────────────────────────────────────────

test("il posto non c'è → ⚪ 2: non ho guardato niente, quindi non ho trovato niente", () => {
  const v = verdettoPostoVuoto({ postoCe: false, dove: "cervello/test", cerco: "le prove" });
  assert.equal(v.codice, 2);
  assert.equal(v.esito, "cieco");
  assert.match(v.perche, /non c'è/);
});

test("il posto c'è ed è vuoto → ❌ 1: lo zero È il reperto, e non si traveste da ⚪", () => {
  // Questa è la riga che impedisce la cura sbagliata. Fare uscire 2 anche qui spegnerebbe un
  // allarme vero («il cervello non ha rete») invece di correggerlo.
  const v = verdettoPostoVuoto({ postoCe: true, trovati: 0, dove: "cervello/test", cerco: "le prove", reperto: "il cervello non ha rete" });
  assert.equal(v.codice, 1);
  assert.equal(v.esito, "rotto");
  assert.equal(v.perche, "il cervello non ha rete", "il chiamante deve poter dire la SUA notizia grave");
});

test("il posto c'è ma non ho potuto contarlo → ⚪ 2: un buco non è uno zero", () => {
  assert.equal(verdettoPostoVuoto({ postoCe: true, trovati: null, dove: "x" }).codice, 2);
  assert.equal(verdettoPostoVuoto({ postoCe: true, trovati: NaN, dove: "x" }).codice, 2);
});

test("posto pieno → 0, ed è l'unico modo di ottenere un verde", () => {
  assert.equal(verdettoPostoVuoto({ postoCe: true, trovati: 7, dove: "x", cerco: "prove" }).codice, 0);
  // Fail-closed anche per chi la chiama male: senza argomenti non si compra il verde.
  assert.equal(verdettoPostoVuoto().codice, 2);
  assert.equal(verdettoPostoVuoto({}).codice, 2);
});

test("il referto dice le stesse parole per tutti e tre, e sul ⚪ dichiara che non è un verde", () => {
  const r = rigaReferto(verdettoPostoVuoto({ postoCe: false, dove: "x" }));
  assert.match(r, /^⚪/);
  assert.match(r, /AR-859/);
  assert.match(r, /NON è un verde/);
  assert.match(rigaReferto(verdettoPostoVuoto({ postoCe: true, trovati: 0, dove: "x" })), /^❌/);
});

// ─────────────────────────────────────────────────────────────────────────────
// ② I TRE STRUMENTI, ESEGUITI SUL SERIO IN UNA COPIA SPOGLIA
// ─────────────────────────────────────────────────────────────────────────────

// ⚠️ IL SECONDO MODO IN CUI QUESTA PROVA PASSAVA SENZA PROVARE NIENTE, trovato lanciandola dentro
// il banco invece che da sola. `test-cervello.mjs` ha un freno anti-ricorsione: se lo lancia un
// altro banco (`MYCITY_BANCO_PROFONDITA` ≥ 1) sulla suite intera, si ferma e esce **2** dicendo
// «BANCO ANNIDATO». Cioè: il caso «senza la cartella deve uscire 2» risultava verde per colpa del
// freno, non della cura — e il caso gemello «cartella vuota deve uscire 1» diventava rosso.
// Qui la profondità si azzera per i figli (la copia non ha nessuna prova dentro, quindi non può
// ricorrere in niente) e si ASSERISCE che il freno non sia scattato: un 2 comprato dal freno non
// vale come 2 della cura.
const SENZA_FRENO = { ...process.env, MYCITY_BANCO_PROFONDITA: "0" };

function nonEIlFreno(detto, chi) {
  assert.doesNotMatch(
    detto,
    /BANCO ANNIDATO/,
    `${chi}: ha risposto il freno anti-ricorsione, non la cura — questo verdetto non misura niente`,
  );
}

/**
 * Una copia di `cervello/` dentro una cartella nuova: lì attorno non c'è né il vault né
 * `.claude/agents`, quindi il ramo del cieco si apre per davvero e non per finta.
 * @param {string[]} togli percorsi (relativi alla copia) da rimuovere perché la copia sia spoglia.
 */
function albero(togli = []) {
  const dir = mkdtempSync(join(tmpdir(), "ar859-"));
  cpSync(CERVELLO, join(dir, "cervello"), { recursive: true });
  for (const t of togli) rmSync(join(dir, t), { recursive: true, force: true });
  return dir;
}

const CIECHI = [
  {
    nome: "test-cervello",
    args: ["--json"],
    // Sta DENTRO cervello/: la copia se lo porta dietro, va tolto a mano. È la trappola.
    togli: ["cervello/test"],
    devEsserVuoto: "cervello/test",
  },
  {
    nome: "valida-contratti",
    args: ["--json"],
    togli: [],
    devEsserVuoto: "MyCity-Vault/90-Memoria-AI/auto-coscienza",
  },
  {
    nome: "chiusura-loop",
    args: ["--sonda", "--json"],
    togli: [],
    devEsserVuoto: ".claude/agents",
  },
];

for (const c of CIECHI) {
  test(`SUL SERIO: ${c.nome} senza il posto dove guardare esce 2, non 1`, () => {
    const dir = albero(c.togli);
    try {
      // LA COPIA È DAVVERO SPOGLIA? Si asserisce, non si spera: è il modo in cui questo stesso caso
      // ha già ingannato due volte chi l'ha scritto — girava, passava, e non provava niente.
      assert.equal(
        existsSync(join(dir, c.devEsserVuoto)),
        false,
        `la copia contiene ancora ${c.devEsserVuoto}: il ramo del cieco non si aprirebbe e questa prova non proverebbe niente`,
      );
      const r = spawnSync(process.execPath, [join(dir, "cervello", `${c.nome}.mjs`), ...c.args], { encoding: "utf8", env: SENZA_FRENO });
      const detto = `${r.stdout || ""}${r.stderr || ""}`;
      nonEIlFreno(detto, c.nome);
      assert.equal(
        r.status,
        2,
        `${c.nome} senza ${c.devEsserVuoto} deve uscire 2 (non ho potuto misurare), non ${r.status}. Ha detto: ${detto.slice(0, 400)}`,
      );
      // E deve DIRLO, non solo uscire col numero giusto: un 2 muto lo legge la macchina, non Nicola.
      assert.match(detto, /non c'è|cieco/i, `${c.nome} esce 2 ma non dice di non aver potuto guardare`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ③ IL ROVESCIO: il posto c'è ed è vuoto → resta 1, e deve restarlo
// ─────────────────────────────────────────────────────────────────────────────

test("SUL SERIO: test-cervello con la cartella delle prove PRESENTE e VUOTA esce 1 — lo zero è il reperto", () => {
  // Senza questo caso, «curare» il difetto facendo uscire 2 tutto quanto passerebbe: si sarebbe
  // trasformato un falso allarme in un silenzio, che è il modo in cui questa cura si sbaglia.
  const dir = albero(["cervello/test"]);
  try {
    mkdirSync(join(dir, "cervello", "test"), { recursive: true });
    const r = spawnSync(process.execPath, [join(dir, "cervello", "test-cervello.mjs"), "--json"], { encoding: "utf8", env: SENZA_FRENO });
    const detto = `${r.stdout || ""}${r.stderr || ""}`;
    nonEIlFreno(detto, "test-cervello (cartella vuota)");
    assert.equal(r.status, 1, `cartella presente e vuota = reperto (1), non cecità (2). Ha detto: ${detto.slice(0, 400)}`);
    assert.match(detto, /non ha rete/, "e il reperto deve dire QUALE: «il cervello non ha rete»");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("SUL SERIO: chiusura-loop con .claude/agents PRESENTE e VUOTA esce 1 — zero reparti è un reperto", () => {
  const dir = albero([]);
  try {
    mkdirSync(join(dir, ".claude", "agents"), { recursive: true });
    const r = spawnSync(process.execPath, [join(dir, "cervello", "chiusura-loop.mjs"), "--sonda", "--json"], { encoding: "utf8", env: SENZA_FRENO });
    const detto = `${r.stdout || ""}${r.stderr || ""}`;
    assert.equal(r.status, 1, `roster presente e vuoto = reperto (1), non cecità (2). Ha detto: ${detto.slice(0, 400)}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ④ E LA DECISIONE DEVE ESSERE CHIAMATA, non solo importata
// ─────────────────────────────────────────────────────────────────────────────

test("i tre punti malati CHIAMANO la funzione pura, non la importano e basta", () => {
  for (const f of ["test-cervello.mjs", "valida-contratti.mjs", "chiusura-loop.mjs"]) {
    const src = readFileSync(join(CERVELLO, f), "utf8");
    const chiamate = (src.match(/verdettoPostoVuoto\s*\(/g) || []).length;
    assert.ok(chiamate >= 1, `${f} non chiama verdettoPostoVuoto: la decisione è tornata a essere un if scritto a mano`);
  }
});
