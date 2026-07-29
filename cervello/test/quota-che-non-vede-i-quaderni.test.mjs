#!/usr/bin/env node
// AR-340 — il guardiano che misura se stiamo lavorando sulla macchina o sul business non
// riconosceva 202 file su 2041, e due terzi di quella zona cieca erano i quaderni dei 120 senior.
//
// Due cause, e nessuna delle due era il calcolo (quello era corretto: i non classificati sono
// esclusi apposta dalla quota, per non abbassarla per finta):
//   · la mappa conosceva l'indirizzo VECCHIO dei quaderni — MyCity-Vault/90-Memoria-AI/memoria-squadra/,
//     una cartella che nessuno scriveva più — e non conosceva `memoria-squadra/` in radice, che è
//     dove chiusura-loop, stampo-check, tasso-lezioni e bootstrap-quaderni scrivono davvero;
//   · i 26 percorsi del vault con l'accento arrivavano da git riscritti in ottali e non
//     corrispondevano a nessun prefisso (stessa radice di AR-339).
// Misurato dopo il fix: da 202 a 52. Poi un merge di `main` ha portato un file nuovo e il tetto ha
// suonato per uno solo (53 contro 52) — la prova che il cancello serve, un'ora dopo averlo acceso.
// La risposta giusta a quel suono non è alzare il numero: è mappare i gruppi con una destinazione
// ovvia. Da 52 a **12**, e i 12 che restano sono ambigui sul serio.
//
// E una terza cosa, che è il vero rimedio: la zona cieca adesso ha un TETTO dichiarato e datato.
// Senza tetto, una mappa che invecchia è indistinguibile da una mappa giusta — ed è esattamente
// così che è passato inosservato che i quaderni avevano cambiato casa.
//
// Non-vacuità, verificata a mano su due rotture indipendenti:
//   ① logica — cambiando `n > tetto` in `false` dentro zonaCiecaOltreIlTetto: il caso «la zona
//      cieca è cresciuta» torna verde e la prova fallisce.
//   ② innesto — togliendo `["memoria-squadra/", "macchina"]` dalla mappa: i 124 quaderni tornano
//      non classificati, il conto sfonda il tetto e la prova fallisce su tre casi.

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import {
  TETTO_NON_CLASSIFICATI,
  destinazioneDi,
  quotaSforzo,
  senzaFantasmi,
  zonaCiecaOltreIlTetto,
} from "../allocazione-check.mjs";
import { separaNul } from "../percorsi-git.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const GUARDIANO = join(REPO, "cervello/allocazione-check.mjs");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

// ── I due casi che passavano ────────────────────────────────────────────────

prova("la casa VERA dei quaderni è in mappa: un ESITO è lavoro sulla macchina, non un file ignoto", () => {
  assert.equal(destinazioneDi("memoria-squadra/tech.md"), "macchina");
  assert.equal(destinazioneDi("memoria-squadra/account-negozi.md"), "macchina");
});

prova("un percorso riscritto da git non è classificabile: è il sintomo, e la porta lo toglie di mezzo", () => {
  const citato = String.raw`"MyCity-Vault/04-Prodotto-Ops/Funzionalit\303\240/Scheda Prodotto.md"`;
  const vero = "MyCity-Vault/04-Prodotto-Ops/Funzionalità/Scheda Prodotto.md";
  assert.equal(destinazioneDi(citato), null, "citato: nessun prefisso può riconoscerlo");
  assert.equal(destinazioneDi(vero), "business", "vero: il vault di Nicola è business");
  // E la porta non produce mai la forma citata, che è la ragione per cui il difetto sparisce.
  assert.deepEqual(separaNul(`${vero}\0`), [vero]);
});

// ── Il tetto: la regola nuova, eseguita ─────────────────────────────────────

prova("la zona cieca ha un tetto, e crescere di uno basta a farlo suonare", () => {
  const sotto = zonaCiecaOltreIlTetto({ non_classificato: TETTO_NON_CLASSIFICATI });
  const sopra = zonaCiecaOltreIlTetto({ non_classificato: TETTO_NON_CLASSIFICATI + 1 });
  assert.equal(sotto.oltre, false, "al tetto esatto si sta dentro: il tetto è il debito di oggi");
  assert.equal(sopra.oltre, true);
  assert.equal(sopra.eccesso, 1);
});

prova("il tetto è un cricchetto: scende con noi, e sotto non si lamenta", () => {
  const r = zonaCiecaOltreIlTetto({ non_classificato: 10 }, 40);
  assert.equal(r.oltre, false);
  assert.equal(r.eccesso, 0);
  assert.equal(r.tetto, 40);
});

prova("nessun file toccato, nessuna quota inventata", () => {
  const q = quotaSforzo([]);
  assert.equal(q.totale, 0);
  assert.equal(q.quota_macchina, null, "una quota su zero file sarebbe un numero senza fonte");
  assert.equal(zonaCiecaOltreIlTetto(q).oltre, false);
});

prova("un non classificato non può ABBASSARE la quota macchina: si esclude, non si conta come business", () => {
  const soloMacchina = quotaSforzo(["cervello/a.mjs", "memoria-squadra/tech.md"]);
  const conIgnoto = quotaSforzo(["cervello/a.mjs", "memoria-squadra/tech.md", "boh/misterioso.txt"]);
  assert.equal(soloMacchina.quota_macchina, 1);
  assert.equal(conIgnoto.quota_macchina, 1, "l'ignoto non deve diluire la quota: sarebbe un modo di nascondere il meta-lavoro");
  assert.equal(conIgnoto.non_classificato, 1);
});

// ── Il repo VERO ────────────────────────────────────────────────────────────

prova("sul repo vero la zona cieca sta sotto il tetto dichiarato", () => {
  const r = spawnSync("node", [GUARDIANO, "--json"], { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const j = JSON.parse(r.stdout);
  assert.equal(j.sforzo.zona_cieca_oltre, false, `zona cieca ${j.sforzo.non_classificato} oltre il tetto ${j.sforzo.tetto_non_classificati}`);
  assert.ok(j.sforzo.tetto_misurato_il, "un tetto senza data è un numero senza fonte");
  assert.equal(r.status, 0, `atteso verde:\n${r.stdout}${r.stderr}`);
});

prova("e i quaderni sono finiti nel conto giusto: la macchina, non l'ignoto", () => {
  const r = spawnSync("node", [GUARDIANO, "--json"], { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const j = JSON.parse(r.stdout);
  // 120 senior + README + AD: la casa vera ne ha oltre cento, e prima erano TUTTI fra i non classificati.
  assert.ok(j.sforzo.macchina > 1000, `macchina troppo bassa (${j.sforzo.macchina})`);
  assert.ok(
    j.sforzo.non_classificato <= TETTO_NON_CLASSIFICATI,
    `non classificati ${j.sforzo.non_classificato}: prima del fix erano 202, se risalgono la mappa è tornata vecchia`,
  );
});

// ── I FANTASMI (29/7) ───────────────────────────────────────────────────────
// La zona cieca era salita a 17 contro un tetto di 13, e i quattro in più erano appunti temporanei
// di una sessione — committati per sbaglio e GIÀ CANCELLATI. Su disco non esistevano: comparivano
// solo perché `git log --name-only` elenca anche ciò che nasce e muore dentro la finestra.
//
// Mapparli avrebbe legittimato il committare file di scarto; alzare il tetto è vietato (AR-340).
// La verità è che non c'era niente da mappare: un percorso che non esiste più non è «un'area di
// lavoro senza mappa», è rumore — e finché contava, il tetto suonava a seconda di quanti file di
// scarto qualcuno avesse cancellato quella settimana. Un cancello che suona a caso viene aggirato.
//
// La prova gira sul predicato INIETTATO, non sul disco: così riproduce il caso senza dover creare
// e cancellare file veri, e resta vera anche fra un mese quando quei quattro nomi non li ricorderà
// più nessuno.
prova("un percorso sparito non conta come area di lavoro senza mappa", () => {
  const esiste = (p) => !p.startsWith("tmp_");
  const toccati = ["cervello/x.mjs", "tmp_agent_files.txt", "tmp_claude_bold.txt", "memoria-squadra/tech.md"];

  assert.deepEqual(senzaFantasmi(toccati, esiste), ["cervello/x.mjs", "memoria-squadra/tech.md"]);

  // E il conto che ne esce non ha più zona cieca, mentre senza il filtro ne avrebbe due.
  assert.equal(quotaSforzo(senzaFantasmi(toccati, esiste)).non_classificato, 0);
  assert.equal(quotaSforzo(toccati).non_classificato, 2, "senza il filtro i fantasmi contano: è il difetto");
});

prova("il filtro non tocca ciò che esiste: nessun file vero sparisce dal conto", () => {
  // La guardia opposta, e serve: un filtro troppo largo nasconderebbe lavoro VERO dalla quota,
  // che è esattamente ciò che questo guardiano esiste per impedire.
  const tutti = ["cervello/a.mjs", "consegne/intelligence/b.md", "boh/misterioso.txt"];
  assert.deepEqual(senzaFantasmi(tutti, () => true), tutti);
  assert.equal(quotaSforzo(senzaFantasmi(tutti, () => true)).non_classificato, 1, "l'ignoto VERO deve restare ignoto");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
