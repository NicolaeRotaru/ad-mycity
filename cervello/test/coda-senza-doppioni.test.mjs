#!/usr/bin/env node
// 🚦 LA CODA SENZA DOPPIONI — Nicola, 4/11/2026: «togli tutti i lavori in coda doppi ed impedisci
// che si creano doppioni».
//
// Il 4/11 in coda c'erano 200 lavori in attesa e solo 16 diversi: il battito delle 9 del Pannello
// rimetteva ogni giorno lo stesso giro e gli stessi playbook, e ognuna delle quattro mani che
// scrivono in coda aveva un suo controllo, diverso dagli altri. Il freno adesso è uno, nel database:
// `pannello/sql/lavori-un-solo-in-attesa.sql`.
//
// Una regola che vive nel database si prova solo eseguendola. Questo file accende un Postgres VERO,
// usa e getta, solo sul socket (nessuna porta aperta), ci applica la migrazione e prova:
//   ① la pulizia tiene il più vecchio di ogni gruppo di gemelli e annulla gli altri, con la nota;
//   ② un inserimento identico a uno in attesa si ferma con «lavoro-gia-in-coda» e dice chi aspetta;
//   ③ non è un doppione ciò che cambia corsia, tipo, conversazione, testo, o non è in attesa;
//   ④ rimettere in attesa un lavoro esistente NON si blocca (ritento del worker, recupero orfani);
//   ⑤ quando il lavoro parte, lo stesso lavoro si può rimettere in coda;
//   ⑥ la migrazione si rilancia senza danni;
//   ⑦ due inserimenti identici nello stesso istante: ne passa uno solo.
// Senza i programmi di PostgreSQL le prove si SALTANO dicendolo: un salto è scritto, un verde finto no.
//
// NON-VACUITÀ (verificata rompendo la migrazione apposta, il 4/11):
//   · col freno sull'aggiornamento invece che sull'inserimento, i casi ② ④ ⑥ ⑦ diventano ROSSI;
//   · senza il lucchetto `pg_advisory_xact_lock`, diventa ROSSO il caso ⑦, e solo quello;
//   · con `posto > 0` al posto di `posto > 1` nella pulizia, i casi ① ② ⑤ ⑥ diventano ROSSI.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { chmodSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const MIGRAZIONE = join(import.meta.dirname, "..", "..", "pannello", "sql", "lavori-un-solo-in-attesa.sql");

function cartellaDeiProgrammi() {
  const env = process.env.PG_BIN;
  if (env && existsSync(join(env, "initdb"))) return env;
  const base = "/usr/lib/postgresql";
  if (existsSync(base)) {
    const v = readdirSync(base).filter((x) => existsSync(join(base, x, "bin", "initdb"))).sort((a, b) => Number(b) - Number(a));
    if (v.length) return join(base, v[0], "bin");
  }
  try {
    const c = execFileSync("pg_config", ["--bindir"], { encoding: "utf8" }).trim();
    if (existsSync(join(c, "initdb"))) return c;
  } catch {}
  return null;
}
const BIN = cartellaDeiProgrammi();
const SALTO = BIN ? false : "PostgreSQL non è installato qui: la regola del database non si può eseguire, quindi non la do per buona";

let cartella;
let dati;
const daRoot = process.getuid?.() === 0;
const server = (prog, args) =>
  daRoot
    ? execFileSync("runuser", ["-u", "postgres", "--", join(BIN, prog), ...args], { stdio: "pipe" })
    : execFileSync(join(BIN, prog), args, { stdio: "pipe" });
const argsPsql = () => ["-X", "-q", "-At", "-v", "ON_ERROR_STOP=1", "-h", cartella, "-U", "postgres", "-d", "postgres"];

/** Esegue SQL; se fallisce restituisce l'errore invece di lanciarlo, così le prove lo possono leggere. */
function psql(sql) {
  try {
    return { ok: true, out: execFileSync(join(BIN, "psql"), argsPsql(), { input: sql, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim() };
  } catch (e) {
    return { ok: false, out: String(e.stdout || ""), err: String(e.stderr || e.message) };
  }
}
const deve = (sql) => {
  const r = psql(sql);
  assert.ok(r.ok, `SQL fallito: ${r.err}`);
  return r.out;
};
/** Lo stesso psql, ma lanciato in parallelo: serve alla prova dei due inserimenti nello stesso istante. */
function psqlInParallelo(sql) {
  return new Promise((risolvi) => {
    const p = spawn(join(BIN, "psql"), argsPsql(), { stdio: ["pipe", "pipe", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => risolvi({ ok: code === 0, err }));
    p.stdin.end(sql);
  });
}

// La tabella com'è nel database della memoria, letta dal vivo il 4/11 (information_schema.columns).
const TABELLA = `
  create extension if not exists pgcrypto;
  drop table if exists public.lavori;
  create table public.lavori (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    stato text not null default 'in_attesa',
    tipo text not null default 'analisi',
    richiesta text not null,
    risultato text not null default '',
    esperto text not null default '',
    tentativi int not null default 0,
    riprova_dopo timestamptz,
    gruppo_id text,
    worker_owner text,
    negozio_id text not null
  );`;
const GIRO = "Fai un GIRO DI PERLUSTRAZIONE come AD di MyCity";
const ins = (id, { stato = "in_attesa", tipo = "giro", richiesta = GIRO, negozio = "centro", gruppo = null, giorni = 0 } = {}) =>
  `insert into public.lavori (id, created_at, stato, tipo, richiesta, negozio_id, gruppo_id) values ('${id}', now() - interval '${giorni} days', '${stato}', '${tipo}', '${richiesta}', '${negozio}', ${gruppo ? `'${gruppo}'` : "null"});`;
const U = (n) => `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
const migrazione = () => readFileSync(MIGRAZIONE, "utf8");

before(() => {
  if (!BIN) return;
  cartella = mkdtempSync(join("/tmp", "pg-coda-"));
  chmodSync(cartella, 0o777);
  dati = join(cartella, "dati");
  server("initdb", ["-D", dati, "-U", "postgres", "--auth=trust", "-E", "UTF8", "--no-locale", "--no-sync"]);
  server("pg_ctl", ["-D", dati, "-l", join(cartella, "registro.log"), "-w", "-o", `-k ${cartella} -c listen_addresses='' -F`, "start"]);
  deve(TABELLA);
  // Il quadro del 4/11 in piccolo: tre giri identici in attesa da 30, 10 e 1 giorno...
  deve(ins(U(1), { giorni: 30 }) + ins(U(2), { giorni: 10 }) + ins(U(3), { giorni: 1 }));
  // ...e accanto, cose che NON sono doppioni del giro.
  deve(
    ins(U(10), { stato: "fatto", giorni: 40 }) + // lo stesso testo, ma già fatto
      ins(U(11), { tipo: "playbook", giorni: 5 }) + // stesso testo, altro tipo
      ins(U(12), { negozio: "bottega-1", giorni: 5 }) + // stesso testo, altra corsia
      ins(U(13), { gruppo: "chat-a", giorni: 5 }) + // stesso testo, altra conversazione
      ins(U(14), { richiesta: "Un altro lavoro", giorni: 5 }),
  );
  deve(migrazione());
});

after(() => {
  if (!BIN || !dati) return;
  try {
    server("pg_ctl", ["-D", dati, "-m", "immediate", "-w", "stop"]);
  } finally {
    rmSync(cartella, { recursive: true, force: true });
  }
});

test("① la pulizia tiene il più vecchio dei gemelli e annulla gli altri, con la nota che dice chi resta", { skip: SALTO }, () => {
  const righe = deve(`select id, stato from public.lavori where id in ('${U(1)}','${U(2)}','${U(3)}') order by id;`);
  assert.equal(righe, `${U(1)}|in_attesa\n${U(2)}|annullato\n${U(3)}|annullato`);
  const nota = deve(`select risultato from public.lavori where id='${U(3)}';`);
  assert.match(nota, /\[doppione\] annullato il \d{4}-\d{2}-\d{2} \d{2}:\d{2}: lo stesso lavoro aspettava già in coda come 00000000-0000-0000-0000-000000000001$/);
  const intatti = deve(`select count(*) from public.lavori where id in ('${U(10)}','${U(11)}','${U(12)}','${U(13)}','${U(14)}') and risultato = '';`);
  assert.equal(intatti, "5", "chi non è un doppione non si tocca");
});

test("② un lavoro identico a uno in attesa non entra, e l'errore dice chi aspetta già", { skip: SALTO }, () => {
  const r = psql(ins(U(20)));
  assert.equal(r.ok, false, "il doppione è entrato");
  assert.match(r.err, /lavoro-gia-in-coda/);
  assert.match(r.err, new RegExp(U(1)), "il dettaglio deve dire quale lavoro aspetta già");
  assert.equal(deve(`select count(*) from public.lavori where id='${U(20)}';`), "0");
});

test("③ non è un doppione ciò che cambia corsia, tipo, conversazione, testo, o nasce già fatto", { skip: SALTO }, () => {
  deve(ins(U(30), { negozio: "bottega-2" }));
  deve(ins(U(31), { tipo: "report" }));
  deve(ins(U(32), { gruppo: "chat-b" }));
  deve(ins(U(33), { richiesta: "Un giro diverso" }));
  deve(ins(U(34), { stato: "fatto" }));
  assert.equal(deve(`select count(*) from public.lavori where id in ('${U(30)}','${U(31)}','${U(32)}','${U(33)}','${U(34)}');`), "5");
});

test("④ rimettere in attesa un lavoro che esiste già non si blocca (ritento, recupero degli orfani)", { skip: SALTO }, () => {
  deve(`update public.lavori set stato='in_attesa' where id='${U(2)}';`);
  assert.equal(deve(`select stato from public.lavori where id='${U(2)}';`), "in_attesa");
  deve(`update public.lavori set stato='annullato' where id='${U(2)}';`);
});

test("⑤ quando il lavoro parte, lo stesso lavoro si può rimettere in coda", { skip: SALTO }, () => {
  deve(`update public.lavori set stato='in_corso' where id='${U(1)}';`);
  deve(ins(U(40)));
  assert.equal(deve(`select stato from public.lavori where id='${U(40)}';`), "in_attesa");
});

test("⑥ la migrazione si rilancia senza danni: nessun annullato in più, il freno resta", { skip: SALTO }, () => {
  const prima = deve("select count(*) from public.lavori where stato='annullato';");
  deve(migrazione());
  assert.equal(deve("select count(*) from public.lavori where stato='annullato';"), prima);
  assert.equal(psql(ins(U(41))).ok, false, "dopo il secondo giro il freno deve esserci ancora");
});

test("⑦ due inserimenti identici nello stesso istante: ne passa uno solo", { skip: SALTO }, async () => {
  const testo = "Lavoro lanciato due volte nello stesso istante";
  // Ognuno inserisce e poi tiene aperta la transazione: senza lucchetto tutti e due vedrebbero la
  // coda vuota e passerebbero, perché nessuno dei due ha ancora reso visibile la sua riga.
  const sql = (n) => `begin; ${ins(U(n), { richiesta: testo })} select pg_sleep(0.6); commit;`;
  const [a, b] = await Promise.all([psqlInParallelo(sql(50)), psqlInParallelo(sql(51))]);
  assert.equal([a.ok, b.ok].filter(Boolean).length, 1, `ne doveva passare uno solo: ${a.err} ${b.err}`);
  assert.equal(deve(`select count(*) from public.lavori where richiesta='${testo}' and stato='in_attesa';`), "1");
});
