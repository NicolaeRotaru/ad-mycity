#!/usr/bin/env node
// IL SENSORE CHE NON SUONAVA MENTRE IL LAVORO SPARIVA.
//
// Il difetto delle 7.849 stash è riparato altrove (`stash-che-nessuno-riprende.test.mjs`). Questa
// prova guarda la parte che fa più male: per giorni **nessuno se n'è accorto**. La visita di salute
// non guardava le messe da parte, il giro nemmeno. La macchina lo ha scoperto per caso, di sera,
// perché un errore le è capitato sotto gli occhi.
//
// Un sensore che non può diventare rosso non è un sensore. Qui si verifica che diventi rosso nei tre
// modi in cui il guasto si presenta davvero — tante insieme, poche ma vecchie, e git muto — e che
// resti verde quando non c'è niente, perché un allarme che suona sempre è un allarme spento.
//
// 🟢 Sola lettura sul repo dell'AD: i repo veri si costruiscono in /tmp.

import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";
import { verdetto, leggiStash, riassumi, TETTO_PREDEFINITO, GIORNI_TROPPI } from "../stash-dimenticate.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

const git = (cwd, ...args) =>
  execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

/** Un repo vero con `quante` messe da parte dentro. */
function repoConStash(quante) {
  const dir = mkdtempSync(join(tmpdir(), "sensore-stash-"));
  execFileSync("git", ["init", "-q", dir]);
  git(dir, "config", "user.email", "t@t");
  git(dir, "config", "user.name", "t");
  writeFileSync(join(dir, "dato.json"), "{}\n");
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "base");
  for (let i = 0; i < quante; i++) {
    writeFileSync(join(dir, "dato.json"), `{"giro":${i}}\n`);
    git(dir, "stash", "push", "-m", `finta numero ${i}`);
  }
  return dir;
}

const ADESSO = 1_755_800_000; // un istante fisso: le prove non chiedono l'ora al sistema

// ── il verdetto puro: i tre modi di diventare rosso ──────────────────────────
prova("zero messe da parte → verde", () => {
  assert.equal(verdetto([], ADESSO).esito, "pulito");
});

prova("sopra il tetto → rosso, anche se sono di stamattina", () => {
  const fresche = Array.from({ length: TETTO_PREDEFINITO + 1 }, (_, i) => ({ epoch: ADESSO - 60 * i, rif: `stash@{${i}}` }));
  const v = verdetto(fresche, ADESSO);
  assert.equal(v.esito, "dimenticate", "quattro messe da parte in un'ora non hanno acceso niente");
  assert.match(v.motivo, /il tetto è/);
});

prova("una sola, ma vecchia di giorni → rosso lo stesso", () => {
  const vecchia = [{ epoch: ADESSO - 86400 * (GIORNI_TROPPI + 2), rif: "stash@{0}" }];
  const v = verdetto(vecchia, ADESSO);
  assert.equal(v.esito, "dimenticate", "una messa da parte ferma da giorni è dimenticata, non 'in corso'");
  assert.match(v.motivo, /aspetta da/);
});

prova("una sola e di poco fa → verde: un rebase in corso è normale", () => {
  assert.equal(verdetto([{ epoch: ADESSO - 120, rif: "stash@{0}" }], ADESSO).esito, "pulito");
});

prova("git muto → ⚪ cieco, mai verde", () => {
  const v = verdetto(null, ADESSO);
  assert.equal(v.esito, "cieco", "senza risposta da git il sensore NON deve dire 'pulito'");
});

// ── il sensore vero, su repo veri ────────────────────────────────────────────
prova("su un repo con 4 messe da parte il comando esce 1", () => {
  const dir = repoConStash(4);
  try {
    const r = spawnSync("node", [join(REPO, "cervello/stash-dimenticate.mjs")], { cwd: dir, encoding: "utf8" });
    assert.equal(r.status, 1, `atteso rosso, arrivato ${r.status}\n${r.stdout}${r.stderr}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("su un repo pulito il comando esce 0", () => {
  const dir = repoConStash(0);
  try {
    const r = spawnSync("node", [join(REPO, "cervello/stash-dimenticate.mjs")], { cwd: dir, encoding: "utf8" });
    assert.equal(r.status, 0, `atteso verde, arrivato ${r.status}\n${r.stdout}${r.stderr}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("legge davvero le stash da git, non le indovina", () => {
  const dir = repoConStash(2);
  try {
    const lette = leggiStash(dir);
    assert.equal(lette?.length, 2, `attese 2 messe da parte, lette ${lette?.length}`);
    assert.ok(lette.every((s) => s.epoch > 0), "manca la data: senza, il controllo sulle vecchie non può funzionare");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("fuori da un repo git è ⚪, non verde", () => {
  const dir = mkdtempSync(join(tmpdir(), "senza-git-"));
  try {
    assert.equal(leggiStash(dir), null, "fuori da un repo deve dire 'non ho potuto misurare'");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── il riassunto deve LEGGERE dentro, non dire «non leggibile» ───────────────
// Questa prova nasce da un difetto mio, trovato provando e non rileggendo: chiedevo i file con
// `git stash show --name-only`, ma la porta unica dei percorsi infila `-z` dopo la PRIMA parola e
// `git stash -z show` non è un comando. Il riassunto rispondeva «4 non leggibili» su quattro messe
// da parte sanissime — cioè avrebbe detto a Nicola «non so cosa c'è dentro» proprio mentre decideva
// se buttarle. Un errore silenzioso nel punto esatto in cui serve la verità.
prova("il riassunto legge dentro anche coi nomi accentati e i file non tracciati", () => {
  const dir = mkdtempSync(join(tmpdir(), "riassunto-stash-"));
  try {
    execFileSync("git", ["init", "-q", dir]);
    git(dir, "config", "user.email", "t@t");
    git(dir, "config", "user.name", "t");
    execFileSync("mkdir", ["-p", join(dir, "MyCity-Vault")]);
    writeFileSync(join(dir, "MyCity-Vault", "però-così.md"), "memoria\n");
    writeFileSync(join(dir, "dati.json"), "{}\n");
    git(dir, "add", "-A");
    git(dir, "commit", "-q", "-m", "base");

    writeFileSync(join(dir, "MyCity-Vault", "però-così.md"), "memoria cambiata\n");
    git(dir, "stash", "push", "-q", "-m", "tracciato con l'accento");
    writeFileSync(join(dir, "MyCity-Vault", "mai-visto.md"), "memoria nuova\n");
    git(dir, "stash", "push", "-q", "-u", "-m", "non tracciato");
    writeFileSync(join(dir, "dati.json"), '{"a":1}\n');
    git(dir, "stash", "push", "-q", "-m", "solo dati");

    const r = riassumi(dir, leggiStash(dir));
    assert.equal(r.illeggibili, 0, "dice «non leggibile» su messe da parte sane: non può dirlo a chi decide se buttarle");
    assert.equal(r.con_memoria, 2, `attese 2 con memoria dentro, trovate ${r.con_memoria}`);
    assert.equal(r.solo_dati, 1, `attesa 1 con soli dati, trovate ${r.solo_dati}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

let falliti = 0;
for (const c of casi) {
  console.log(c.ok ? `  ✓ ${c.nome}` : `  ✗ ${c.nome}\n      ${c.err}`);
  if (!c.ok) falliti++;
}
console.log(`\n${casi.length - falliti}/${casi.length} passate`);
process.exit(falliti ? 1 : 0);
