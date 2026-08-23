#!/usr/bin/env node
// 🧪 AR-807 — il punto cieco che si scopriva di rimbalzo.
//
// Il difetto: il controllo che cerca i testi peggiorati legge ogni file fino a 200.000 caratteri e
// poi taglia. Sul tagliato non accusa — dice ⚪ — ed è la cosa giusta: un giudizio su una parte non
// è un giudizio sul tutto. Ma quel ⚪ esce SOLO quando qualcuno tocca quel file, in fondo a un
// elenco lungo, a lotto già finito. Il 23/8 è arrivato come un `exit 2` sulla coda delle azioni, e
// nessuno l'aveva visto arrivare: tre testi vivi erano fuori campo da giorni.
//
// La cura non è alzare il tetto di lettura — quella mossa è già stata fatta e ritirata il 22/8,
// perché una soglia che sale è la mossa che nasconde i problemi. La cura è che il punto cieco sia
// un NUMERO letto a ogni lotto, con un tetto che scende e non risale.
//
// I casi sono costruiti: mordono anche col repo di oggi.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ESENTI, puntoCieco, testiVivi, verdettoCampoVisivo } from "../campo-visivo-memoria.mjs";
import { TETTO_TESTO } from "../cancello-stop.mjs";

const RADICE = join(import.meta.dirname, "..", "..");

// ─────────────────── ① si contano i CARATTERI, non i file ───────────────────

test("un file che raddoppia oltre il campo visivo muove il numero", () => {
  // Il conto per file direbbe «uno» in tutti e due i casi, e un testo potrebbe passare da 210.000 a
  // 500.000 caratteri senza che cambi niente. È la differenza fra dire che c'è un buco e misurarlo.
  const piccolo = puntoCieco([{ nome: "A.md", caratteri: TETTO_TESTO + 10_000 }]);
  const grosso = puntoCieco([{ nome: "A.md", caratteri: TETTO_TESTO + 300_000 }]);
  assert.equal(piccolo.fuoriCampo, 10_000);
  assert.equal(grosso.fuoriCampo, 300_000);
  assert.ok(grosso.fuoriCampo > piccolo.fuoriCampo, "lo stesso file cresciuto deve pesare di più");
});

test("un testo dentro il campo visivo non pesa niente, nemmeno di un carattere", () => {
  const c = puntoCieco([
    { nome: "corto.md", caratteri: 1 },
    { nome: "al-pelo.md", caratteri: TETTO_TESTO },
  ]);
  assert.equal(c.fuoriCampo, 0, "chi sta dentro il campo lo si legge intero: non è debito");
  assert.deepEqual(c.sopra, []);
});

test("i file sopra il campo escono in ordine di quanto testo lasciano fuori", () => {
  const c = puntoCieco([
    { nome: "medio.md", caratteri: TETTO_TESTO + 50 },
    { nome: "peggiore.md", caratteri: TETTO_TESTO + 900 },
    { nome: "minimo.md", caratteri: TETTO_TESTO + 1 },
  ]);
  assert.deepEqual(c.sopra.map((s) => s.nome), ["peggiore.md", "medio.md", "minimo.md"]);
});

// ───────────────── ② l'esenzione è dichiarata, non nascosta ─────────────────

test("DECISIONI resta fuori dal totale ma NON sparisce: esce dichiarato", () => {
  // Append-only per regola di Nicola: può solo crescere. Un tetto che scende su un file che può solo
  // crescere è un rosso che nessuno può far diventare verde, cioè quello che si impara ad aggirare.
  // Ma toglierlo dal totale e non dirlo sarebbe barare: qui deve comparire fra gli esenti.
  const c = puntoCieco([
    { nome: "DECISIONI.md", caratteri: TETTO_TESTO + 600_000 },
    { nome: "viva.md", caratteri: TETTO_TESTO + 1_000 },
  ]);
  assert.equal(c.fuoriCampo, 1_000, "l'esente non entra nel totale");
  assert.equal(c.esenti.length, 1, "l'esente deve restare visibile");
  assert.equal(c.esenti[0].eccesso, 600_000, "e con il suo numero vero accanto");
});

test("l'esenzione vale per nome esatto: un file che ci somiglia paga", () => {
  const c = puntoCieco([{ nome: "DECISIONI-vecchie.md", caratteri: TETTO_TESTO + 7 }]);
  assert.equal(c.fuoriCampo, 7, "l'esenzione è per un file solo, non per una famiglia di nomi");
});

// ──────────────────────── ③ il verdetto e il tetto ──────────────────────────

test("il punto cieco cresciuto oltre il tetto è una violazione, e dice di quanto", () => {
  const v = verdettoCampoVisivo({ fuoriCampo: 300, sopra: [{ nome: "A.md", eccesso: 300 }], tetto: 200 });
  assert.equal(v.esito, "violazione");
  assert.match(v.motivo, /da 200 a 300/, "chi legge deve vedere il prima e il dopo, non solo un rosso");
  assert.match(v.motivo, /A\.md/, "e quale file l'ha allargato");
});

test("sotto il tetto è debito dichiarato, non un verde", () => {
  const v = verdettoCampoVisivo({ fuoriCampo: 100, sopra: [{ nome: "A.md", eccesso: 100 }], tetto: 200 });
  assert.equal(v.esito, "debito");
  assert.match(v.motivo, /abbassa il tetto/, "un debito sceso va scritto nel tetto, o smette di scendere");
});

test("pari al tetto resta debito: il numero si legge lo stesso", () => {
  const v = verdettoCampoVisivo({ fuoriCampo: 200, sopra: [{ nome: "A.md", eccesso: 200 }], tetto: 200 });
  assert.equal(v.esito, "debito");
  assert.notEqual(v.esito, "ok", "un debito fermo non è una cura");
});

test("zero fuori campo è verde SENZA bisogno del tetto: è la cura, non una tolleranza", () => {
  const v = verdettoCampoVisivo({ fuoriCampo: 0, sopra: [], tetto: 999 });
  assert.equal(v.esito, "ok");
});

test("senza tetto il numero esce lo stesso: un tetto mancante non è un verde", () => {
  const v = verdettoCampoVisivo({ fuoriCampo: 500, sopra: [{ nome: "A.md", eccesso: 500 }], tetto: null });
  assert.equal(v.esito, "debito");
  assert.match(v.motivo, /500/);
});

// ──────────── ④ una cartella che non si legge non è una cartella vuota ──────

test("se la cartella non si legge il perimetro è null, non un elenco vuoto", () => {
  const nulla = testiVivi("/non/esiste/da/nessuna/parte", {
    elenca: () => {
      throw new Error("EACCES");
    },
  });
  assert.equal(nulla, null, "un elenco vuoto direbbe «nessun testo fuori campo»: sarebbe una bugia");
});

test("le sottocartelle non entrano nel perimetro: la storia non si riscrive", () => {
  const nomi = testiVivi("/finto", {
    elenca: () => ["STATO.md", "Storico", "Archivio", "note.txt"],
    tipo: (p) => ({ isFile: () => !/Storico|Archivio$/.test(p) }),
  });
  assert.deepEqual(nomi, ["STATO.md"]);
});

// ───────────── ⑤ `--zero`: il metro con cui una scheda aperta resta rossa ─────────
//
// AR-808 è aperta e la sua prova è questo comando. Il metro del cancello non serve: quello chiede
// «il buco si è allargato?» e sotto il tetto risponde no, giustamente. Una scheda che si chiude da
// sola perché il suo comando esce 0 è peggio di una scheda senza prova.

function conMemoriaFinta(file, argomenti) {
  const dir = mkdtempSync(join(tmpdir(), "memoria-"));
  for (const [nome, quanti] of Object.entries(file)) writeFileSync(join(dir, nome), "x".repeat(quanti));
  let codice = 0;
  try {
    execFileSync("node", [join(RADICE, "cervello/campo-visivo-memoria.mjs"), ...argomenti], {
      env: { ...process.env, MEMORIA_VIVA_DIR: dir },
      encoding: "utf8",
    });
  } catch (e) {
    codice = e.status ?? 1;
  }
  rmSync(dir, { recursive: true, force: true });
  return codice;
}

test("--zero è rosso finché anche un solo carattere resta fuori campo", () => {
  assert.equal(conMemoriaFinta({ "A.md": TETTO_TESTO + 1 }, ["--zero"]), 1, "un carattere di troppo e il comando esce 0: la scheda si chiuderebbe da sola");
});

test("--zero è verde solo quando non resta fuori niente", () => {
  assert.equal(conMemoriaFinta({ "A.md": TETTO_TESTO, "B.md": 10 }, ["--zero"]), 0);
});

test("--zero non guarda il tetto: è una domanda diversa da quella del cancello", () => {
  // Senza `--zero` lo stesso identico stato è verde, perché il tetto lo assolve. È la prova che i
  // due metri sono due, e che la scheda aperta non si appoggia a quello sbagliato.
  assert.equal(conMemoriaFinta({ "A.md": TETTO_TESTO + 1 }, []), 0, "il metro del cancello dovrebbe assolvere: c'è un tetto");
  assert.equal(conMemoriaFinta({ "A.md": TETTO_TESTO + 1 }, ["--zero"]), 1, "e quello della scheda no");
});

// ─────────────────────────── ⑥ SUL REPO VERO ────────────────────────────────

test("SUL REPO VERO: il campo visivo è quello di chi taglia, non un numero riscritto qui", () => {
  // Due dichiarazioni dello stesso numero sono due numeri che si allontanano — è già successo in
  // questa casa, e sta scritto accanto a TETTO_TESTO. Questa riga muore se qualcuno lo ricopia.
  const sorgente = readFileSync(join(RADICE, "cervello/campo-visivo-memoria.mjs"), "utf8");
  assert.match(sorgente, /import \{ TETTO_TESTO \} from "\.\/cancello-stop\.mjs"/, "il campo visivo si chiede, non si ridichiara");
  assert.doesNotMatch(sorgente.replace(/^\/\/[^\n]*$/gm, ""), /200_000|200000/, "nessuna copia del numero nel codice");
});

test("SUL REPO VERO: il cancello del lotto fa girare questo guardiano", () => {
  // Il difetto ricorrente di questa casa è il cancello costruito bene e montato su una porta che non
  // usa nessuno. Un guardiano che il cancello non lancia è un file, non un freno.
  const cancello = readFileSync(join(RADICE, "cervello/cancello-lotto.mjs"), "utf8");
  assert.match(cancello, /campo-visivo-memoria\.mjs/, "il cancello non lancia il guardiano: il freno non è montato su niente");
  assert.match(cancello, /memoria_fuori_campo: Math\.min\(/, "senza la voce nel ratchet il tetto non scende mai, e un tetto fermo smette di essere un tetto");
});

test("SUL REPO VERO: il tetto dichiarato copre il punto cieco di adesso", () => {
  // La prova che tiene viva la cura. Diventa rossa il giorno che un testo vivo cresce oltre il tetto
  // — cioè prima che il buco si allarghi in silenzio, non dopo averlo scoperto di rimbalzo.
  const nomi = testiVivi(join(RADICE, "MyCity-Vault/90-Memoria-AI"));
  assert.ok(nomi && nomi.length > 0, "senza perimetro non si misura niente");
  const misure = nomi.map((n) => ({ nome: n, caratteri: readFileSync(join(RADICE, "MyCity-Vault/90-Memoria-AI", n), "utf8").length }));
  const c = puntoCieco(misure);
  const tetti = JSON.parse(readFileSync(join(RADICE, "cervello/tetti-lotto.json"), "utf8"));
  const tetto = tetti.memoria_fuori_campo;
  assert.equal(typeof tetto, "number", "il tetto deve esistere: senza, il numero non ha un prima");
  assert.ok(
    c.fuoriCampo <= tetto,
    `il punto cieco è salito da ${tetto} a ${c.fuoriCampo} caratteri: ${c.sopra.map((s) => `${s.nome} +${s.eccesso}`).join(" · ")}`,
  );
});

test("SUL REPO VERO: DECISIONI è davvero l'unico esente, e sfonda davvero", () => {
  // L'esenzione non è un'ipotesi comoda: se un giorno quel file rientrasse nel campo, questa riga
  // direbbe che l'esenzione non serve più.
  assert.deepEqual(ESENTI, ["DECISIONI.md"]);
  const dim = readFileSync(join(RADICE, "MyCity-Vault/90-Memoria-AI/DECISIONI.md"), "utf8").length;
  assert.ok(dim > TETTO_TESTO, "se DECISIONI sta dentro il campo, l'esenzione va tolta invece che spiegata");
});
