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
//   ① la pulizia tiene il PIÙ RECENTE di ogni gruppo di gemelli e annulla gli altri, con la nota;
//   ② un lavoro identico a uno in attesa entra, e il vecchio si annulla: in attesa ne resta uno;
//   ③ non è un doppione ciò che cambia corsia, tipo, conversazione, testo, o nasce già fatto;
//   ④ chi torna in attesa mentre il gemello aspetta si annulla, senza errore; senza gemello torna davvero;
//   ⑤ un lavoro già partito non si tocca, e lo stesso lavoro si può rimettere in coda;
//   ⑥ la migrazione si rilancia senza danni;
//   ⑦ due inserimenti identici nello stesso istante: entrano tutti e due, in attesa ne resta uno;
//   ⑧ riscrivere la stessa riga (upsert sul suo codice) non la scambia per un suo doppione.
//   ⑨ un inserimento che poi non entra (ON CONFLICT … DO NOTHING) non annulla il gemello in attesa;
//   ⑩ una connessione che resta aperta dopo aver accodato non blocca i gemelli che vengono dopo.
// Senza i programmi di PostgreSQL le prove si SALTANO dicendolo: un salto è scritto, un verde finto no.
//
// PERCHÉ IL PIÙ RECENTE (collaudo del 4/11): il worker all'avvio chiude come scaduto ogni lavoro in
// attesa da più di 48 ore. Tenendo il più vecchio e rifiutando i nuovi, alla riaccensione non sarebbe
// partito niente.
//
// NON-VACUITÀ (verificata rompendo la migrazione apposta, il 4/11): vedi in fondo al file l'elenco
// delle mutazioni e dei casi che ognuna fa diventare rossi.

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

const stato = (n) => deve(`select stato from public.lavori where id='${U(n)}';`);
const inAttesa = (testo = GIRO) => deve(`select count(*) from public.lavori where richiesta='${testo}' and tipo='giro' and negozio_id='centro' and gruppo_id is null and stato='in_attesa';`);

test("① la pulizia tiene il più recente dei gemelli e annulla gli altri, con la nota che dice chi resta", { skip: SALTO }, () => {
  assert.equal([stato(1), stato(2), stato(3)].join(" "), "annullato annullato in_attesa");
  const nota = deve(`select risultato from public.lavori where id='${U(1)}';`);
  assert.match(nota, /^\[doppione\] annullato il \d{4}-\d{2}-\d{2} \d{2}:\d{2}: sostituito da un lavoro identico più recente, 00000000-0000-0000-0000-000000000003$/);
  const intatti = deve(`select count(*) from public.lavori where id in ('${U(10)}','${U(11)}','${U(12)}','${U(13)}','${U(14)}') and risultato = '';`);
  assert.equal(intatti, "5", "chi non è un doppione non si tocca");
});

test("② un lavoro identico a uno in attesa entra senza errore, e il vecchio si annulla dicendo chi lo sostituisce", { skip: SALTO }, () => {
  const r = psql(ins(U(20)));
  assert.ok(r.ok, `chi accoda non deve ricevere un errore: ${r.err}`);
  assert.equal(stato(20), "in_attesa");
  assert.equal(stato(3), "annullato");
  assert.match(deve(`select risultato from public.lavori where id='${U(3)}';`), new RegExp(`sostituito da un lavoro identico più recente, ${U(20)}$`));
  assert.equal(inAttesa(), "1");
});

test("③ non è un doppione ciò che cambia corsia, tipo, conversazione, testo, o nasce già fatto", { skip: SALTO }, () => {
  deve(ins(U(30), { negozio: "bottega-2" }));
  deve(ins(U(31), { tipo: "report" }));
  deve(ins(U(32), { gruppo: "chat-b" }));
  deve(ins(U(33), { richiesta: "Un giro diverso" }));
  deve(ins(U(34), { stato: "fatto" }));
  assert.equal(deve(`select count(*) from public.lavori where id in ('${U(30)}','${U(31)}','${U(32)}','${U(33)}','${U(34)}');`), "5");
  assert.equal(stato(20), "in_attesa", "il giro in attesa non si tocca per una cosa diversa");
  assert.equal([stato(11), stato(12), stato(13), stato(14)].join(" "), "in_attesa in_attesa in_attesa in_attesa");
});

test("④ chi torna in attesa mentre il gemello aspetta si annulla senza errore; senza gemello torna davvero", { skip: SALTO }, () => {
  // Il ritento del worker o il recupero di un orfano: U(2) torna in attesa, ma U(20) aspetta già.
  const r = psql(`update public.lavori set stato='in_attesa' where id='${U(2)}';`);
  assert.ok(r.ok, `il ritorno in attesa non deve dare errore, se no il lavoro resta appeso: ${r.err}`);
  assert.equal(stato(2), "annullato");
  assert.match(deve(`select risultato from public.lavori where id='${U(2)}';`), new RegExp(`tornava in attesa, ma lo stesso lavoro aspettava già come ${U(20)}$`));
  assert.equal(stato(20), "in_attesa", "il gemello che aspettava resta");
  // Un lavoro fatto che torna in attesa senza nessun gemello: torna davvero.
  deve(ins(U(35), { stato: "fatto", richiesta: "Un lavoro finito, da rifare" }));
  deve(`update public.lavori set stato='in_attesa' where id='${U(35)}';`);
  assert.equal(stato(35), "in_attesa");
});

test("⑤ un lavoro già partito non si tocca, e lo stesso lavoro si può rimettere in coda", { skip: SALTO }, () => {
  deve(`update public.lavori set stato='in_corso' where id='${U(20)}';`);
  deve(ins(U(40)));
  assert.equal(stato(20), "in_corso", "il lavoro partito non va annullato");
  assert.equal(stato(40), "in_attesa");
});

test("⑥ la migrazione si rilancia senza danni: nessun annullato in più, il freno resta", { skip: SALTO }, () => {
  const prima = deve("select count(*) from public.lavori where stato='annullato';");
  deve(migrazione());
  assert.equal(deve("select count(*) from public.lavori where stato='annullato';"), prima);
  deve(ins(U(41)));
  assert.equal(stato(40), "annullato", "dopo il secondo giro il freno deve esserci ancora");
  assert.equal(inAttesa(), "1");
});

test("⑦ due inserimenti identici nello stesso istante: entrano tutti e due, in attesa ne resta uno", { skip: SALTO }, async () => {
  const testo = "Lavoro lanciato due volte nello stesso istante";
  // Ognuno inserisce e poi tiene aperta la transazione: senza lucchetto tutti e due vedrebbero la
  // coda vuota, perché nessuno dei due ha ancora reso visibile la sua riga, e resterebbero in due.
  const sql = (n) => `begin; ${ins(U(n), { richiesta: testo })} select pg_sleep(0.6); commit;`;
  const [a, b] = await Promise.all([psqlInParallelo(sql(50)), psqlInParallelo(sql(51))]);
  assert.ok(a.ok && b.ok, `nessuno dei due deve ricevere un errore: ${a.err} ${b.err}`);
  assert.equal(inAttesa(testo), "1");
});

test("⑧ riscrivere la stessa riga in attesa (upsert sul suo codice) non la scambia per un suo doppione", { skip: SALTO }, () => {
  deve(`insert into public.lavori (id, stato, tipo, richiesta, negozio_id) values ('${U(41)}', 'in_attesa', 'giro', '${GIRO}', 'centro')
        on conflict (id) do update set esperto = 'qualcuno';`);
  assert.equal(stato(41), "in_attesa");
  assert.equal(deve(`select esperto from public.lavori where id='${U(41)}';`), "qualcuno");
});

test("⑨ un inserimento che poi non entra (ON CONFLICT … DO NOTHING) non annulla il gemello in attesa", { skip: SALTO }, () => {
  // U(10) è un giro «fatto»: riscriverlo col suo codice non deve toccare il giro che aspetta.
  const prima = deve(`select id from public.lavori where stato='in_attesa' and tipo='giro' and richiesta='${GIRO}' and negozio_id='centro' and gruppo_id is null;`);
  deve(`insert into public.lavori (id, stato, tipo, richiesta, negozio_id) values ('${U(10)}', 'in_attesa', 'giro', '${GIRO}', 'centro') on conflict (id) do nothing;`);
  assert.equal(stato(10), "fatto");
  assert.equal(deve(`select id from public.lavori where stato='in_attesa' and tipo='giro' and richiesta='${GIRO}' and negozio_id='centro' and gruppo_id is null;`), prima);
});

test("⑩ una connessione che resta aperta dopo aver accodato non blocca i gemelli che vengono dopo", { skip: SALTO }, async () => {
  const testo = "Lavoro accodato da una connessione che resta aperta";
  // La prima connessione accoda e resta viva, come fanno quelle del servizio REST. La seconda accoda
  // lo stesso lavoro dopo: deve entrare subito, non aspettare che la prima si chiuda.
  const resta = psqlInParallelo(`${ins(U(60), { richiesta: testo })} select pg_sleep(2);`);
  const dopo = psqlInParallelo(`select pg_sleep(0.5); set lock_timeout = '700ms'; ${ins(U(61), { richiesta: testo })}`);
  const [a, b] = await Promise.all([resta, dopo]);
  assert.ok(a.ok, a.err);
  assert.ok(b.ok, `il secondo inserimento è rimasto bloccato dalla connessione aperta: ${b.err}`);
  assert.equal(stato(61), "in_attesa");
  assert.equal(stato(60), "annullato");
});

// MUTAZIONI VERIFICATE il 4/11 (ognuna applicata alla migrazione, prova lanciata, file ripristinato):
//   · la pulizia ordinata dal più vecchio (`order by created_at, id`) ........ ① ② ROSSI
//   · il freno senza l'annullo del vecchio all'inserimento .................... ② ④ ⑥ ⑦ ⑧ ⑩ ROSSI
//   · il freno senza la porta del ritorno in attesa ........................... ④ ROSSO
//   · il freno senza il lucchetto ............................................. ⑦ ROSSO
//   · il lucchetto di sessione al posto di quello di transazione .............. ⑩ ROSSO
//   · l'annullo PRIMA dell'inserimento invece che dopo ........................ ⑨ ROSSO
//   · l'annullo senza `id is distinct from new.id` ............................ ② ③ ④ ⑤ ⑥ ⑦ ⑧ ⑩ ROSSI
