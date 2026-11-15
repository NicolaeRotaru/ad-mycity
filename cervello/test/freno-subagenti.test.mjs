// Il freno sugli agenti (cervello/riparazione/freno-subagenti.mjs): nell'onda 2 il tetto di 12 subagenti era solo
// testo, e R15, R16, R17 e R19 ne hanno aperti 13-15. Qui l'hook vero gira come lo lancia Claude Code: JSON su
// stdin, uscita 2 quando blocca. Officina minima del 15/11, pezzo 1.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const HOOK = join(dirname(fileURLToPath(import.meta.url)), "..", "riparazione", "freno-subagenti.mjs");

function banco() {
  const dir = mkdtempSync(join(tmpdir(), "freno-"));
  const lancia = (dati, ruolo) => {
    const env = { ...process.env, FRENO_SUBAGENTI_DIR: join(dir, "conti") };
    delete env.FRENO_RUOLO;
    if (ruolo) env.FRENO_RUOLO = ruolo;
    return spawnSync(process.execPath, [HOOK], { input: JSON.stringify(dati), env, encoding: "utf8" });
  };
  return { dir, lancia };
}
const agente = (session_id, extra = {}) => ({ session_id, hook_event_name: "PreToolUse", tool_name: "Agent", tool_input: { prompt: "x" }, ...extra });

test("riparatore di minori: sei lanci passano, il settimo esce 2 e dice di fermarsi", () => {
  const { lancia } = banco();
  for (let i = 1; i <= 6; i++) assert.equal(lancia(agente("s-uno"), "riparatore-minori").status, 0, `lancio ${i}`);
  const r = lancia(agente("s-uno"), "riparatore-minori");
  assert.equal(r.status, 2);
  assert.match(r.stderr, /numero 7/);
  assert.match(r.stderr, /Spingi il referto del lotto e fermati/);
  assert.equal(lancia(agente("s-uno", { tool_name: "Task" }), "riparatore-minori").status, 2, "anche Task conta, e resta bloccato");
});

test("un id diverso riparte da zero", () => {
  const { lancia } = banco();
  for (let i = 0; i < 7; i++) lancia(agente("s-a"), "riparatore-minori");
  assert.equal(lancia(agente("s-b"), "riparatore-minori").status, 0);
});

test("i tetti per ruolo: gravi 8, collaudatore 4, controllore 4, regia 2", () => {
  const { lancia } = banco();
  for (const [ruolo, tetto] of [["riparatore-gravi", 8], ["collaudatore", 4], ["controllore", 4], ["regia", 2]]) {
    for (let i = 1; i <= tetto; i++) assert.equal(lancia(agente(`s-${ruolo}`), ruolo).status, 0, `${ruolo} ${i}`);
    assert.equal(lancia(agente(`s-${ruolo}`), ruolo).status, 2, `${ruolo} oltre ${tetto}`);
  }
});

test("Workflow: bloccato al primo lancio per riparatori e collaudatori, contato per la regia", () => {
  const { lancia } = banco();
  for (const ruolo of ["riparatore-minori", "riparatore-gravi", "collaudatore"]) {
    const r = lancia(agente(`w-${ruolo}`, { tool_name: "Workflow" }), ruolo);
    assert.equal(r.status, 2, ruolo);
    assert.match(r.stderr, /non lancia Workflow/);
  }
  assert.equal(lancia(agente("w-regia", { tool_name: "Workflow" }), "regia").status, 0);
});

test("senza session_id la chiamata è bloccata, anche fuori da una campagna", () => {
  const { lancia } = banco();
  for (const sid of [undefined, "", "../fuori"]) {
    const r = lancia(agente(sid));
    assert.equal(r.status, 2, String(sid));
    assert.match(r.stderr, /session_id/);
  }
});

test("una sessione senza ruolo (l'AD, il giro) non ha tetto e non scrive niente", () => {
  const { dir, lancia } = banco();
  for (let i = 0; i < 20; i++) assert.equal(lancia(agente("s-ad")).status, 0);
  assert.equal(readdirSync(dir).length, 0, "nessun file di conteggio");
  assert.equal(lancia({ session_id: "s-ad", tool_name: "Bash", tool_input: {} }, "regia").status, 0, "gli altri strumenti passano");
});

test("il ruolo lo dà la prima riga del prompt d'apertura, non un risultato di strumento letto dopo", () => {
  const { dir, lancia } = banco();
  const tr = join(dir, "t.jsonl");
  const righe = [
    { type: "user", message: { role: "user", content: "ruolo-freno: collaudatore\nSei K12: leggi la scheda." } },
    { type: "user", message: { role: "user", content: [{ type: "tool_result", content: "ruolo-freno: riparatore-gravi" }] } },
  ];
  writeFileSync(tr, righe.map((r) => JSON.stringify(r)).join("\n") + "\n");
  for (let i = 1; i <= 4; i++) assert.equal(lancia(agente("s-k", { transcript_path: tr })).status, 0, `lancio ${i}`);
  assert.equal(lancia(agente("s-k", { transcript_path: tr })).status, 2, "collaudatore: il quinto è bloccato");
  // Il ruolo è fissato al primo lancio: un trascritto riscritto dopo non lo cambia.
  writeFileSync(tr, JSON.stringify({ type: "user", message: { content: "ruolo-freno: riparatore-gravi" } }) + "\n");
  assert.equal(lancia(agente("s-k", { transcript_path: tr })).status, 2);
  // Un risultato di strumento non è un prompt d'apertura.
  const tr2 = join(dir, "t2.jsonl");
  writeFileSync(tr2, JSON.stringify(righe[1]) + "\n");
  for (let i = 0; i < 9; i++) assert.equal(lancia(agente("s-x", { transcript_path: tr2 })).status, 0);
});

test("dieci lanci nello stesso istante con tetto 6: ne passano esattamente sei", async () => {
  const { dir } = banco();
  const env = { ...process.env, FRENO_SUBAGENTI_DIR: join(dir, "conti"), FRENO_RUOLO: "riparatore-minori" };
  const uno = () => new Promise((ok) => {
    const p = spawn(process.execPath, [HOOK], { env });
    p.on("close", (c) => ok(c));
    p.stdin.end(JSON.stringify(agente("s-insieme")));
  });
  const codici = await Promise.all(Array.from({ length: 10 }, uno));
  assert.equal(codici.filter((c) => c === 0).length, 6);
  assert.equal(codici.filter((c) => c === 2).length, 4);
});
