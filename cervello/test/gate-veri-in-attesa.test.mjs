#!/usr/bin/env node
// 🧪 AR-458 — «freno mai costruito» e «freno che aspetta un merge» non sono lo stesso rosso.
//
// LA STORIA VERA. Il 30/7 `gate-veri.mjs` gridava «gate orfano» su L-2026-0730-530. Orfano non era:
// il test esisteva, ma dentro la PR #635 non ancora mergiata — e la `gate_nota` della lezione lo
// diceva per esteso. Il guardiano non la leggeva. Un falso rosso a ogni lezione con un freno in
// coda, e un guardiano che grida al lupo si impara a ignorare: il prezzo lo paga il giorno in cui
// grida per un gate davvero orfano.
//
// QUI SI PROVA che i due stati escono diversi, che il secondo NON fa uscire 1, e che l'attesa ha un
// prezzo: senza numero di PR non vale, e dopo tre settimane torna rossa.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { analizzaGate, codiceUscitaGate } = await import(join(REPO, "cervello/gate-veri.mjs"));
const { classificaGateAssente, GIORNI_ATTESA_MAX } = await import(join(REPO, "cervello/gate-in-attesa.mjs"));

// Un mondo finto: il file del gate NON esiste, che è la situazione di cui parla il difetto.
const esiste = () => false;
const leggi = () => null;
const ADESSO = Date.parse("2026-08-15");
const GIORNI = (n) => new Date(ADESSO - n * 86_400_000).toISOString().slice(0, 10);

const LEZIONE = (id, extra = {}) => ({
  id,
  testo: "…",
  caso_studio_nicola: "Nicola 30/7",
  gate: "node cervello/test/lease-dopo-rebase-ripetuto.test.mjs",
  ...extra,
});

// ── ① la decisione pura ───────────────────────────────────────────────────────

test("⬇️ AR-458 — una nota che nomina la PR trasforma l'orfano in un'attesa, e l'attesa non blocca", () => {
  const c = classificaGateAssente({
    gateNota: "fix su branch fix/lease-rebase-ripetuto-v2 (PR #635), non ancora su main — merge in coda",
    nato: GIORNI(2),
    adesso: ADESSO,
  });
  assert.equal(c.classe, "gate-in-attesa");
  assert.equal(c.bloccante, false, "un freno in coda di merge non è un freno mai costruito");
  assert.equal(c.pr, 635, "l'attesa deve portare il numero della PR: senza, non si può verificare");
});

test("⬇️ AR-458 — un'attesa SENZA numero di PR resta orfana: un'attesa non verificabile è un'esenzione", () => {
  const c = classificaGateAssente({ gateNota: "il test arriva, è in lavorazione", nato: GIORNI(1), adesso: ADESSO });
  assert.equal(c.classe, "gate-orfano");
  assert.equal(c.bloccante, true);
});

test("⬇️ AR-458 — l'attesa SCADE: dopo il massimo torna rossa, perché un'attesa senza fine è un'esenzione", () => {
  const dentro = classificaGateAssente({ gateNota: "PR #635", nato: GIORNI(GIORNI_ATTESA_MAX), adesso: ADESSO });
  assert.equal(dentro.classe, "gate-in-attesa", "l'ultimo giorno buono deve ancora valere");
  const fuori = classificaGateAssente({ gateNota: "PR #635", nato: GIORNI(GIORNI_ATTESA_MAX + 1), adesso: ADESSO });
  assert.equal(fuori.classe, "gate-orfano");
  assert.equal(fuori.bloccante, true);
  assert.match(fuori.motivo, /#635/, "il rosso deve dire QUALE PR si è fermata, o non si può andare a vedere");
});

test("AR-458 — un'attesa senza data di inizio non può scadere mai: resta rossa", () => {
  const c = classificaGateAssente({ gateNota: "PR #635", nato: "", adesso: ADESSO });
  assert.equal(c.classe, "gate-orfano");
  assert.equal(c.pr, 635, "il numero si dice comunque: serve a chiudere il dubbio");
});

// ── ② il guardiano che la usa ─────────────────────────────────────────────────

test("⬇️ AR-458 — nel guardiano l'attesa esce dal mucchio dei bloccanti, ma NON sparisce dal conto", () => {
  const v = analizzaGate(
    [LEZIONE("L-530", { gate_nota: "PR #635, non ancora su main", nato: GIORNI(3) })],
    [{ lezione: "L-530", file: "cervello/test/lease-dopo-rebase-ripetuto.test.mjs", cerca: "x", sostituisci: "" }],
    esiste,
    leggi,
    { adesso: ADESSO },
  );
  assert.equal(v.inAttesa.length, 1, "il freno in coda di merge è ancora contato come orfano");
  assert.equal(v.bloccanti.length, 0, "un'attesa dichiarata fa ancora uscire 1: è il falso rosso del 30/7");
  assert.equal(v.violazioni.length, 1, "l'attesa è sparita dall'elenco: un debito invisibile è un debito perdonato");
  assert.equal(v.violazioni[0].regola, "gate-in-attesa");
  assert.equal(v.veri.length, 0, "un freno che aspetta un merge NON può contare come difesa costruita");
  assert.equal(v.dichiarati, v.veri.length + v.violazioni.length, "nessun gate può sparire dal conto");
});

test("⬇️ AR-458 — il gate davvero orfano resta rosso: la terza strada non è diventata un condono", () => {
  const v = analizzaGate(
    [LEZIONE("L-999", { nato: GIORNI(3) })],
    [{ lezione: "L-999", file: "cervello/test/lease-dopo-rebase-ripetuto.test.mjs", cerca: "x", sostituisci: "" }],
    esiste,
    leggi,
    { adesso: ADESSO },
  );
  assert.equal(v.inAttesa.length, 0);
  assert.equal(v.bloccanti.length, 1);
  assert.equal(v.bloccanti[0].regola, "gate-orfano");
});

test("⬇️ AR-458 — un'attesa scaduta torna fra i bloccanti anche passando dal guardiano", () => {
  const v = analizzaGate(
    [LEZIONE("L-530", { gate_nota: "PR #635, non ancora su main", nato: GIORNI(GIORNI_ATTESA_MAX + 30) })],
    [{ lezione: "L-530", file: "cervello/test/lease-dopo-rebase-ripetuto.test.mjs", cerca: "x", sostituisci: "" }],
    esiste,
    leggi,
    { adesso: ADESSO },
  );
  assert.equal(v.inAttesa.length, 0, "una PR ferma da un mese e mezzo continua a scusare la lezione");
  assert.equal(v.bloccanti.length, 1);
});

test("AR-458 — le altre violazioni non cambiano natura: solo l'orfano ha una terza strada", () => {
  const v = analizzaGate(
    [{ id: "L-x", gate: "ricordarsi di controllare le soglie", gate_nota: "PR #635", nato: GIORNI(1) }],
    [],
    esiste,
    leggi,
    { adesso: ADESSO },
  );
  assert.equal(v.violazioni[0].regola, "gate-senza-comando", "una frase non diventa un'attesa perché cita una PR");
  assert.equal(v.bloccanti.length, 1);
});

// ── ③ il codice d'uscita, che è l'atto vero ───────────────────────────────────

test("⬇️ AR-458 — è il CODICE D'USCITA a non gridare più al lupo: un'attesa dichiarata esce 0", () => {
  const conAttesa = analizzaGate(
    [LEZIONE("L-530", { gate_nota: "PR #635, non ancora su main", nato: GIORNI(3) })],
    [{ lezione: "L-530", file: "cervello/test/lease-dopo-rebase-ripetuto.test.mjs", cerca: "x", sostituisci: "" }],
    esiste,
    leggi,
    { adesso: ADESSO },
  );
  assert.equal(codiceUscitaGate(conAttesa), 0, "il comando esce ancora 1 su un freno che aspetta solo un merge");

  const conOrfano = analizzaGate([LEZIONE("L-999", { nato: GIORNI(3) })], [], esiste, leggi, { adesso: ADESSO });
  assert.equal(codiceUscitaGate(conOrfano), 1, "un gate davvero orfano deve continuare a bloccare");
});

test("AR-458 — `--proprie` resta un freno a sé: la terza strada non l'ha spento", () => {
  const esito = { bloccanti: [], perFile: [{ lezione: "L-1" }] };
  assert.equal(codiceUscitaGate(esito), 0, "senza il flag il debito si mostra, non blocca");
  assert.equal(codiceUscitaGate(esito, { soloProprie: true }), 1);
});

// ── ④ sul repo vero ───────────────────────────────────────────────────────────

test("AR-458 — sul repo VERO il guardiano non inventa attese: il conto segue i dati", async () => {
  const { readFileSync, existsSync } = await import("node:fs");
  const lezioni = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"), "utf8")).lezioni;
  const mutanti = JSON.parse(readFileSync(join(REPO, "cervello/mutanti.json"), "utf8")).mutanti;
  const v = analizzaGate(
    lezioni,
    mutanti,
    (f) => existsSync(join(REPO, f)),
    (f) => {
      try {
        return readFileSync(join(REPO, f), "utf8");
      } catch {
        return null;
      }
    },
  );
  assert.equal(v.dichiarati, v.veri.length + v.violazioni.length, "un gate è sparito dal conto");
  assert.equal(
    v.violazioni.filter((x) => x.regola === "gate-in-attesa").length,
    v.inAttesa.length,
    "l'elenco delle attese non corrisponde a quelle marcate nelle violazioni",
  );
  for (const a of v.inAttesa) assert.ok(Number.isInteger(a.pr), `l'attesa di ${a.lezione} non porta il numero di PR`);
});
