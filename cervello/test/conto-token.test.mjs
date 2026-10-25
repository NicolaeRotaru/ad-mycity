// Il contatore vero dei token (node --test).
//
// Il costo di un'ondata era «stimato e mai misurato». Qui si prova che il contatore misura
// davvero, al token: con transcript finti scritti in una cartella temporanea, costruiti con le
// stesse trappole dei file veri — lo stesso messaggio su più righe, una riga troncata, un
// messaggio sintetico — e che con zero misure non dice mai «tutto bene» (uscita 2, non 0).

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { misuraTesto, riassumi, contatori, etichettaDa, trovaWorkflow } from "../conto-token.mjs";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "..", "conto-token.mjs");

const assistente = (id, u, extra = {}) =>
  JSON.stringify({
    type: "assistant",
    message: {
      id,
      model: "claude-opus-5-5",
      usage: { input_tokens: u[0], cache_creation_input_tokens: u[1], cache_read_input_tokens: u[2], output_tokens: u[3] },
    },
    ...extra,
  });
const utente = JSON.stringify({ type: "user", message: { role: "user", content: "vai" } });
// Nei transcript veri dei subagenti OGNI riga porta isSidechain:true (295 su 295 in un agente del
// 25/10). I dati finti devono portarlo anche loro: se il contatore escludesse le righe laterali
// anche nelle cartelle, ogni workflow vero uscirebbe cieco, e con dati più puliti del vero la
// prova non se ne accorgerebbe.
const laterale = (id, u) => assistente(id, u, { isSidechain: true });
const utenteLaterale = JSON.stringify({ type: "user", isSidechain: true, message: { role: "user", content: "vai" } });

// Agente A (analista): 3 turni veri. Il turno 2 compare su DUE righe (pensiero + strumento) con lo
// stesso id: si conta una volta. Più una riga troncata, come un file scritto a metà.
const A = [
  utenteLaterale,
  laterale("m1", [2, 90000, 0, 100]),
  utenteLaterale,
  laterale("m2", [3, 1000, 90000, 200]),
  laterale("m2", [3, 1000, 90000, 200]),
  '{"type":"assistant","isSidechain":true,"message":{"id":"m3","usage":{"input_tok',
  laterale("m3", [1, 500, 91000, 50]),
].join("\n");
// Agente B (verificatore): 2 turni. Il primo turno LEGGE GIÀ DALLA CACHE (49.800): sul disco vero è
// il caso normale (3 lenti su 4 in un workflow del 25/10, 5 su 7 in un altro). Se il primo turno
// perdesse le letture, la quota del contesto fisso — il numero per cui il comando esiste — calerebbe
// in silenzio (dal 71% al 50% su quelle 4 lenti).
const B = [utenteLaterale, laterale("n1", [5, 200, 49800, 10]), laterale("n2", [1, 200, 50000, 20])].join("\n");

function banco() {
  const radice = mkdtempSync(join(tmpdir(), "conto-token-"));
  // La stessa forma del disco vero: <progetto>/<sessione>/subagents/workflows/<runId>/
  const dir = join(radice, "-home-user", "sessione-1", "subagents", "workflows", "wf_abc123-xyz");
  mkdirSync(dir, { recursive: true });
  // L'agente più caro (A) sta nel file che l'alfabeto mette SECONDO: se in uscita è in cima, è
  // l'ordine per entrata ad averlo messo lì, non l'ordine dei nomi.
  writeFileSync(join(dir, "agent-bbb.jsonl"), A + "\n");
  writeFileSync(join(dir, "agent-bbb.meta.json"), JSON.stringify({ agentType: "workflow-subagent", description: "lente:analista", workflowPhase: "Misura" }));
  writeFileSync(join(dir, "agent-aaa.jsonl"), B + "\n");
  writeFileSync(join(dir, "agent-aaa.meta.json"), JSON.stringify({ agentType: "general-purpose", label: "verifica:1", workflowPhase: "Verifica" }));
  writeFileSync(join(dir, "journal.jsonl"), '{"type":"launched"}\n'); // non è un transcript: va ignorato
  return { radice, dir };
}

const lancia = (args, env = {}) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8", env: { ...process.env, ...env } });

test("un messaggio ripetuto su due righe vale UN turno, e la riga rotta si conta senza far cadere niente", () => {
  const m = misuraTesto(A);
  assert.equal(m.turni, 3, "m2 compare due volte: sommarle gonfierebbe il conto");
  assert.equal(m.righe_rotte, 1);
  assert.equal(m.primo_turno, 90002);
  assert.equal(m.input, 6);
  assert.equal(m.scritti_cache, 91500);
  assert.equal(m.letti_cache, 181000);
  assert.equal(m.uscita, 350);
  assert.equal(m.entrata_totale, 272506);
});

test("se due righe dello stesso id portano numeri diversi (streaming) vale la versione finale", () => {
  const m = misuraTesto([assistente("x", [2, 100, 0, 7]), assistente("x", [2, 100, 0, 300])].join("\n"));
  assert.equal(m.turni, 1);
  assert.equal(m.uscita, 300);
});

test("i messaggi sintetici non sono turni, e nella sessione le righe laterali non sono dell'AD", () => {
  const sint = JSON.stringify({ type: "assistant", message: { id: "s", model: "<synthetic>", usage: { input_tokens: 0, output_tokens: 0 } } });
  const m = misuraTesto([sint, assistente("v", [1, 10, 0, 1])].join("\n"));
  assert.equal(m.turni, 1);
  assert.equal(m.primo_turno, 11, "con il sintetico contato il primo turno sarebbe 0");
  const s = misuraTesto([assistente("lat", [9, 9, 9, 9], { isSidechain: true }), assistente("ad", [1, 2, 3, 4])].join("\n"), { escludiLaterali: true });
  assert.equal(s.turni, 1);
  assert.equal(s.righe_laterali_escluse, 1);
});

test("l'etichetta viene dal meta, e se manca dall'id", () => {
  assert.equal(etichettaDa({ description: "lente:x", label: "y" }, "id"), "lente:x");
  assert.equal(etichettaDa({ label: "y" }, "id"), "y");
  assert.equal(etichettaDa({}, "id"), "id");
  assert.equal(etichettaDa(null, "id"), "id");
});

test("i due contatori e la quota del contesto fisso tornano al token", () => {
  assert.equal(misuraTesto(B).primo_turno, 50005, "5 + 200 + 49800: le letture dalla cache del primo turno sono entrata");
  const r = riassumi([misuraTesto(A), misuraTesto(B)]);
  assert.equal(r.totali.turni, 5);
  assert.deepEqual(contatori({ input: 1, scritti_cache: 2, letti_cache: 3, uscita: 4 }), { con_letture_cache: 10, senza_letture_cache: 7 });
  // A: 90002 × 3 = 270006 · B: 50005 × 2 = 100010 · entrata 272506 + 100206 = 372712
  assert.equal(r.contesto_fisso.token, 370016);
  assert.equal(r.contesto_fisso.stima, true, "è una stima e lo deve dire");
  assert.match(r.contesto_fisso.direzione, /eccesso/, "e deve dire da che parte sbaglia");
  assert.equal(r.contesto_fisso.quota, 370016 / 372712);
});

test("--dir --json: due agenti, i numeri attesi al token", () => {
  const { radice, dir } = banco();
  try {
    const p = lancia(["--dir", dir, "--json"]);
    assert.equal(p.status, 0, p.stderr);
    const j = JSON.parse(p.stdout);
    assert.equal(j.ok, true);
    assert.equal(j.agenti.length, 2, "journal.jsonl non è un agente");
    const [a, b] = j.agenti; // ordinati per entrata, il più caro in cima (sul disco è il secondo)
    assert.deepEqual(
      { etichetta: a.etichetta, tipo: a.tipo, turni: a.turni, primo: a.primo_turno, in: a.input, cc: a.scritti_cache, cr: a.letti_cache, out: a.uscita },
      { etichetta: "lente:analista", tipo: "workflow-subagent", turni: 3, primo: 90002, in: 6, cc: 91500, cr: 181000, out: 350 },
    );
    assert.deepEqual(
      { etichetta: b.etichetta, tipo: b.tipo, turni: b.turni, primo: b.primo_turno, in: b.input, cc: b.scritti_cache, cr: b.letti_cache, out: b.uscita },
      { etichetta: "verifica:1", tipo: "general-purpose", turni: 2, primo: 50005, in: 6, cc: 400, cr: 99800, out: 30 },
    );
    assert.deepEqual(j.totali, { agenti: 2, agenti_misurati: 2, turni: 5, input: 12, scritti_cache: 91900, letti_cache: 280800, uscita: 380, entrata_totale: 372712 });
    // senza = 12 + 91900 + 380 = 92292 · con = 92292 + 280800 = 373092
    assert.deepEqual(j.contatori, { con_letture_cache: 373092, senza_letture_cache: 92292 });
    assert.equal(j.contesto_fisso.token, 370016);
    assert.equal(j.righe_rotte, 1, "la riga rotta si dichiara");
    // Il subtotale per fase va nel referto dell'ondata: si controlla al token, tutti e due i contatori.
    // Misura (A): senza 6 + 91500 + 350 = 91856, con + 181000 = 272856 · Verifica (B): senza 6 + 400 + 30 = 436, con + 99800 = 100236
    assert.deepEqual(j.per_fase, {
      Misura: { agenti: 1, turni: 3, con_letture_cache: 272856, senza_letture_cache: 91856 },
      Verifica: { agenti: 1, turni: 2, con_letture_cache: 100236, senza_letture_cache: 436 },
    });
    assert.deepEqual(j.agenti_senza_usage, []);
    assert.match(j.avvertenza, /non è noto/);
  } finally {
    rmSync(radice, { recursive: true, force: true });
  }
});

test("--workflow trova la cartella sotto la radice data, anche dal solo inizio dell'id", () => {
  const { radice, dir } = banco();
  try {
    assert.deepEqual(trovaWorkflow(radice, "wf_abc123-xyz"), [dir]);
    assert.deepEqual(trovaWorkflow(radice, "wf_abc"), [dir]);
    assert.deepEqual(trovaWorkflow(radice, "wf_nessuno"), []);
    const p = lancia(["--workflow", "wf_abc"], { CONTO_TOKEN_RADICE: radice });
    assert.equal(p.status, 0, p.stderr);
    assert.match(p.stdout, /con le letture dalla cache: +373\.092/);
    assert.match(p.stdout, /senza le letture dalla cache: 92\.292/);
    assert.match(p.stdout, /STIMA.*per eccesso/);
    const q = lancia(["--workflow", "wf_nessuno"], { CONTO_TOKEN_RADICE: radice });
    assert.equal(q.status, 2);
  } finally {
    rmSync(radice, { recursive: true, force: true });
  }
});

test("--workflow: l'id esatto vince su chi comincia uguale, e un inizio che combacia con più cartelle esce 2", () => {
  const { radice, dir } = banco();
  try {
    // Due cartelle in più, misurabili tutte e due: se il controllo dell'ambiguità sparisse, il
    // comando ne misurerebbe una a caso e uscirebbe 0, con i numeri veri della cartella sbagliata.
    for (const nome of ["wf_abc123-xyz2", "wf_abc999-qqq"]) {
      mkdirSync(join(dirname(dir), nome));
      writeFileSync(join(dirname(dir), nome, "agent-ddd.jsonl"), B + "\n");
    }
    assert.deepEqual(trovaWorkflow(radice, "wf_abc123-xyz"), [dir], "l'id esatto non diventa ambiguo perché un altro comincia così");
    assert.equal(trovaWorkflow(radice, "wf_abc").length, 3);
    const p = lancia(["--workflow", "wf_abc", "--json"], { CONTO_TOKEN_RADICE: radice });
    assert.equal(p.status, 2, "ambiguo: non ho misurato la cartella che volevi");
    assert.match(JSON.parse(p.stdout).motivo, /ambiguo, combacia con 3 cartelle/);
    const q = lancia(["--workflow", "wf_abc123-xyz", "--json"], { CONTO_TOKEN_RADICE: radice });
    assert.equal(q.status, 0, q.stdout);
    assert.equal(JSON.parse(q.stdout).sorgente.percorso, dir);
  } finally {
    rmSync(radice, { recursive: true, force: true });
  }
});

test("--workflow: una cartella della radice che non si legge NON è una cartella vuota → uscita 2, col suo nome", () => {
  const { radice, dir } = banco();
  try {
    // Un'altra sessione dove `subagents` è un collegamento che punta a sé stesso: leggerla dà ELOOP,
    // che non è «qui non c'è niente» (ENOENT). Si usa il collegamento e non un chmod perché chi gira
    // da root legge anche le cartelle senza permessi, e la prova sarebbe verde per cecità.
    // Lì dentro poteva stare un secondo «wf_abc…»: con la ricerca a metà il comando misurerebbe la
    // cartella che ha visto, uscirebbe 0, e l'ambiguità sparirebbe senza che nessuno lo sappia.
    const sessione2 = join(radice, "-home-user", "sessione-2");
    mkdirSync(sessione2, { recursive: true });
    symlinkSync("subagents", join(sessione2, "subagents"));
    assert.throws(() => trovaWorkflow(radice, "wf_abc"), /sessione-2[/\\]subagents[/\\]workflows \(ELOOP\)/);
    const p = lancia(["--workflow", "wf_abc", "--json"], { CONTO_TOKEN_RADICE: radice });
    assert.equal(p.status, 2, "una ricerca a metà non è un verde");
    const j = JSON.parse(p.stdout);
    assert.equal(j.cieco, true);
    assert.match(j.motivo, /non si leggono: .*sessione-2/);
    assert.match(j.motivo, /--dir/, "il motivo dice anche come uscirne");
    // E l'uscita cieca non tocca la strada diretta: la cartella buona si misura con --dir.
    assert.equal(lancia(["--dir", dir]).status, 0);
  } finally {
    rmSync(radice, { recursive: true, force: true });
  }
});

test("un workflow cieco a metà esce 0 ma lo dice: l'agente senza usage è nominato, i totali contano solo i misurati", () => {
  const { radice, dir } = banco();
  try {
    // Un agente caduto prima della prima risposta vera: il prompt e un messaggio sintetico, niente usage.
    const sint = JSON.stringify({ type: "assistant", isSidechain: true, message: { id: "s", model: "<synthetic>", usage: { input_tokens: 0, output_tokens: 0 } } });
    writeFileSync(join(dir, "agent-ccc.jsonl"), [utenteLaterale, sint].join("\n") + "\n");
    const p = lancia(["--dir", dir, "--json"]);
    assert.equal(p.status, 0, p.stderr);
    const j = JSON.parse(p.stdout);
    assert.deepEqual(j.agenti_senza_usage, ["ccc"], "senza questo elenco il totale conterebbe meno del vero senza dirlo");
    assert.equal(j.totali.agenti, 3);
    assert.equal(j.totali.agenti_misurati, 2);
    assert.equal(j.totali.entrata_totale, 372712, "l'agente cieco non aggiunge niente, e non toglie niente");
    assert.match(lancia(["--dir", dir]).stdout, /1 transcript senza nessun usage: ccc/);
  } finally {
    rmSync(radice, { recursive: true, force: true });
  }
});

test("zero misure non è mai un verde: cartella vuota, assente, o transcript senza usage → uscita 2", () => {
  const radice = mkdtempSync(join(tmpdir(), "conto-token-vuoto-"));
  try {
    const vuota = lancia(["--dir", radice, "--json"]);
    assert.equal(vuota.status, 2, "cartella vuota");
    assert.equal(JSON.parse(vuota.stdout).cieco, true);
    assert.equal(lancia(["--dir", join(radice, "non-esiste")]).status, 2, "cartella assente");
    writeFileSync(join(radice, "agent-zzz.jsonl"), [utente, "{rotta", JSON.stringify({ type: "assistant", message: { id: "q" } })].join("\n"));
    const muta = lancia(["--dir", radice]);
    assert.equal(muta.status, 2, "transcript senza nessun usage");
    assert.match(muta.stderr, /1 righe JSON rotte/);
    assert.equal(lancia([]).status, 2, "comando senza sorgente");
    assert.equal(lancia(["--sessione", join(radice, "manca.jsonl")]).status, 2, "sessione assente");
  } finally {
    rmSync(radice, { recursive: true, force: true });
  }
});

test("--sessione misura il ciclo principale come un agente solo", () => {
  const radice = mkdtempSync(join(tmpdir(), "conto-token-sess-"));
  try {
    const f = join(radice, "sessione.jsonl");
    const principale = (id, u) => assistente(id, u, { isSidechain: false }); // così stanno sul disco vero
    writeFileSync(f, [utente, principale("p1", [2, 160000, 0, 40]), laterale("lat", [1, 1, 1, 1]), principale("p2", [1, 900, 160000, 60])].join("\n"));
    const p = lancia(["--sessione", f, "--json"]);
    assert.equal(p.status, 0, p.stderr);
    const j = JSON.parse(p.stdout);
    assert.equal(j.agenti.length, 1);
    assert.equal(j.agenti[0].turni, 2);
    assert.equal(j.agenti[0].primo_turno, 160002);
    assert.equal(j.agenti[0].righe_laterali_escluse, 1);
  } finally {
    rmSync(radice, { recursive: true, force: true });
  }
});

test("--sessione su un transcript di subagente esce 2 e dice perché: le righe con usage c'erano, erano laterali", () => {
  const radice = mkdtempSync(join(tmpdir(), "conto-token-sub-"));
  try {
    const f = join(radice, "agent-sub.jsonl");
    writeFileSync(f, B + "\n"); // B è un subagente: tutte le sue righe sono isSidechain
    const p = lancia(["--sessione", f]);
    assert.equal(p.status, 2);
    assert.match(p.stderr, /2 righe con usage escluse perché laterali/);
    assert.match(p.stderr, /usa --dir/);
    assert.doesNotMatch(p.stderr, /nessuna riga con usage/, "le righe con usage c'erano: dirlo manda a cercare il guasto altrove");
  } finally {
    rmSync(radice, { recursive: true, force: true });
  }
});
