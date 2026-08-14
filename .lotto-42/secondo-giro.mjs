#!/usr/bin/env node
// SECONDO GIRO del lotto 42 — il cancello verde e l'inizio, non la fine.
//
// Delle cinque domande del secondo giro, tre si possono chiedere a una macchina invece che alla
// memoria di chi ha lavorato — che e la cosa meno affidabile che abbiamo. Questo script fa quelle.
// Le altre due (ogni strada passa dal freno? la guardia frena davvero?) restano a mano, perche
// vogliono giudizio: qui vengono solo ELENCATE, per non poterle dimenticare.
//
// Si lancia SUL DIFF INTERO, non sui file che uno si ricorda di aver toccato.
//
// DUE REGOLE DI CASA CHE QUESTO SCRIPT RISPETTA, E CHE IL GUARDIANO MI HA FATTO RISPETTARE:
//  · le porte di git sono due e le uso entrambe apposta: `percorsiDaGit` per i comandi che tornano
//    PERCORSI (mette lei il -z, cosi i nomi con un byte non-ASCII non tornano in ottale — nel vault
//    italiano sono 26 file), `gitLetto` per il resto. Scriversi un execFileSync proprio e la
//    malattia `git-letto-senza-tetto`.
//  · se non riesco a leggere il diff NON proseguo su una lista vuota: una fonte letta a meta
//    produce un verdetto che ha la stessa faccia di uno intero. Un verdetto che non posso emettere
//    si chiama CIECO (uscita 2), non verde.

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { percorsiDaGit } from "../cervello/percorsi-git.mjs";
import { gitLetto } from "../cervello/git-github.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");

const cieco = (perche) => {
  console.log(`⚪ SECONDO GIRO CIECO — non ho potuto guardare il diff: ${perche}`);
  console.log("   Non e un verde: e un «non lo so». Il giro va rifatto dove il diff si legge.");
  process.exit(2);
};

// Il diff intero contro la BASE, non contro HEAD: su un tronco condiviso da piu corsie
// `git diff HEAD` attribuisce a ogni lotto il lavoro di tutti (AR-678).
const base = gitLetto(["rev-parse", "--verify", "origin/main"], REPO) ? "origin/main" : "HEAD";

let daDiff, daStato;
try {
  daDiff = percorsiDaGit(["diff", "--name-only", `${base}...HEAD`], { cwd: REPO });
} catch (e) {
  cieco(`git diff contro ${base} non risponde (${e.message})`);
}
try {
  daStato = percorsiDaGit(["status", "--porcelain"], { cwd: REPO }).map((l) => l.slice(3).trim());
} catch (e) {
  cieco(`git status non risponde (${e.message})`);
}

const toccati = [...daDiff, ...daStato]
  .filter((f, i, a) => f && a.indexOf(f) === i)
  .filter((f) => /\.(mjs|js|ts|tsx|sh)$/.test(f) && existsSync(join(REPO, f)));

// La porzione che NON ho potuto leggere deve arrivare al verdetto, non sparire.
const salti = [];
const leggi = (f) => {
  try { return readFileSync(join(REPO, f), "utf8"); }
  catch (e) { salti.push(`${f}: ${e.code || e.message}`); return null; }
};

const R = [];
const problemi = [];
R.push(`SECONDO GIRO — ${toccati.length} file di codice nel diff (base: ${base})\n`);

// ── ④ Il codice che ho aggiunto e USATO? ────────────────────────────────────
// Un modulo importato e mai chiamato somiglia moltissimo a una difesa attiva.
R.push("④ IL CODICE AGGIUNTO E USATO? (un import che compare una volta sola e solo l'import: il resto e morto)");
let morti = 0;
for (const f of toccati) {
  const src = leggi(f);
  if (src === null) continue;
  for (const m of src.matchAll(/^import\s+\{([^}]+)\}\s+from\s+["'](\.[^"']+)["']/gm)) {
    for (const raw of m[1].split(",")) {
      const sym = raw.trim().split(/\s+as\s+/).pop().trim();
      if (!sym || !/^[A-Za-z_$][\w$]*$/.test(sym)) continue;
      if ((src.match(new RegExp(`\\b${sym}\\b`, "g")) || []).length <= 1) {
        problemi.push(`   ❌ ${f}: importa ${sym} da ${m[2]} e non lo chiama mai`);
        morti++;
      }
    }
  }
}
R.push(morti ? `   ${morti} import morti trovati` : "   ✅ nessun import morto");

// ── La prova che non puo fallire (AR-694), cercata su tutto il diff ─────────
R.push("\n⑤ PROVE CHE NON POSSONO FALLIRE (caso async lanciato senza await: l'asserzione gira dopo il conteggio)");
let vacue = 0;
for (const f of toccati.filter((x) => /\.test\.mjs$/.test(x))) {
  const src = leggi(f);
  if (src === null) continue;
  for (const m of src.matchAll(/^[ \t]*(?!await\s)(?:\w+\.)?prova\s*\(\s*["'`][^"'`]*["'`]\s*,\s*async\b/gm)) {
    problemi.push(`   ❌ ${f}:${src.slice(0, m.index).split("\n").length} — prova(async …) senza await: un 1=2 qui stampa «pass»`);
    vacue++;
  }
}
R.push(vacue ? `   ${vacue} casi vacui trovati` : "   ✅ nessun caso async non atteso nei test toccati");

// ── ② Cio che ho AFFERMATO e vero? Le prove dichiarate esistono davvero? ────
R.push("\n② LE PROVE DICHIARATE ESISTONO? (un puntatore rotto e «non fatto» travestito da «fatto»)");
const CANTIERE = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
let orfane = 0;
if (!existsSync(CANTIERE)) cieco("il cantiere non e leggibile da qui");
for (const d of JSON.parse(readFileSync(CANTIERE, "utf8")).difetti) {
  const c = d.verifica?.comando;
  if (!c) continue;
  const file = c.replace(/^(node|bash|npx)\s+/, "").split(/\s+/)[0];
  if (/^(cervello|pannello)\//.test(file) && !existsSync(join(REPO, file))) {
    problemi.push(`   ❌ ${d.id}: la prova punta a ${file}, che non esiste`);
    orfane++;
  }
}
R.push(orfane ? `   ${orfane} prove orfane` : "   ✅ ogni prova a comando punta a un file che esiste");

// ── ⑤ I difetti nuovi sono REGISTRATI? ──────────────────────────────────────
R.push("\n⑤ I DIFETTI NUOVI SONO NEL CANTIERE? (non in chat, non nel frammento, non nella mia testa)");
const LOTTO = join(REPO, ".lotto-42");
let nuoviFuori = 0;
const cant = readFileSync(CANTIERE, "utf8");
for (const f of readdirSync(LOTTO).filter((x) => /^corsia-[A-Z]\.json$/.test(x))) {
  let dati;
  try { dati = JSON.parse(readFileSync(join(LOTTO, f), "utf8")); }
  catch (e) { salti.push(`${f}: frammento illeggibile (${e.message})`); continue; }
  for (const n of dati.difetti_nuovi || []) {
    // Prima si chiede alla SCHEDA, poi si ripiega sul titolo. Il ripiego da solo mente: chi
    // registra una scoperta ne riscrive il titolo — è il mestiere, un titolo va reso leggibile —
    // e il confronto per prefisso grida al lupo su cinque cose già fatte.
    //
    // ⚠️ Questa correzione era GIÀ stata fatta in `ricuci.mjs` e non era arrivata qui: due porte
    // sullo stesso atto, una riparata e una no. È il difetto che questo lotto cura, ricapitato a
    // me mentre lo curavo — e l'ha trovato questo script, non io.
    const registrata = n.registrato_come && cant.includes(`"${n.registrato_come}"`);
    const chiave = (n.titolo || "").slice(0, 40);
    if (!registrata && chiave && !cant.includes(chiave)) {
      problemi.push(`   ❌ [${f}] difetto nuovo mai registrato: «${n.titolo}»`);
      nuoviFuori++;
    }
  }
}
R.push(nuoviFuori ? `   ${nuoviFuori} difetti nuovi ancora fuori dal cantiere` : "   ✅ ogni difetto nuovo e registrato");

// ── le due domande che restano a mano ───────────────────────────────────────
R.push(`
── LE DUE CHE NON POSSO CHIEDERE A UNA MACCHINA ────────────────────────────
① OGNI STRADA CHE ARRIVA ALL'ATTO PASSA DAL FRENO?
   Non quella riparata: TUTTE. Cerca l'ATTO, non il fix — per ogni occorrenza chiediti se il
   freno c'e. E il difetto che torna piu spesso: la porta a mano riparata e quella automatica
   lasciata aperta.
③ LA GUARDIA CHE HO SCRITTO FRENA DAVVERO?
   Forzala a fallire — abbassa il tetto, sporca il dato, togli il campo — e pretendi il rosso.
   Un tetto mai superato e indistinguibile da un tetto scollegato: entrambi stampano verde.`);

console.log(R.join("\n"));

// La porzione non letta arriva al verdetto: se ho saltato qualcosa, non sono verde.
if (salti.length) {
  console.log(`\n⚪ ${salti.length} pezzi che NON ho potuto guardare (il verdetto qui sotto non li copre):`);
  salti.forEach((s) => console.log(`   · ${s}`));
}
if (problemi.length) {
  console.log(`\n❌ ${problemi.length} COSE DA GUARDARE:`);
  problemi.forEach((p) => console.log(p));
  console.log("\nUn giro che trova qualcosa rende il giro dopo NON facoltativo.");
  process.exit(1);
}
if (salti.length) process.exit(2);
console.log("\n✅ Le tre domande automatiche non hanno trovato niente, e ho potuto guardare tutto.");
