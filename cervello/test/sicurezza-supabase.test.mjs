import { test } from "node:test";
import assert from "node:assert/strict";
import { daAdvisors } from "../sicurezza-supabase.mjs";

// La forma vera dell'uscita di get_advisors (MCP Supabase, 2026-11-05), accorciata.
const GREZZO = {
  result: {
    lints: [
      { name: "rls_enabled_no_policy", title: "RLS Enabled No Policy", level: "INFO", count: 12, remediation: "https://supabase.com/docs/x",
        findings: [{ metadata: { name: "ai_spend_daily" } }, { metadata: { name: "email_queue" } }] },
      { name: "security_definer_view", title: "Security Definer View", level: "ERROR", count: 7,
        findings: [1, 2, 3, 4, 5, 6, 7].map((n) => ({ metadata: { name: `vista_${n}` } })) },
    ],
  },
};

test("un avviso per tipo, col conto dichiarato da Supabase e al massimo 4 esempi", () => {
  const s = daAdvisors(GREZZO, "2026-11-05 09:50", "Mycity");
  assert.equal(s.aggiornato, "2026-11-05 09:50");
  assert.deepEqual(s.avvisi.map((a) => [a.nome, a.livello, a.quanti]), [["rls_enabled_no_policy", "INFO", 12], ["security_definer_view", "ERROR", 7]]);
  assert.deepEqual(s.avvisi[1].esempi, [], "errori e avvisi: niente nomi nel repository pubblico");
  assert.deepEqual(s.avvisi[0].esempi, ["ai_spend_daily", "email_queue"], "le informazioni tengono i nomi");
  assert.equal(s.avvisi[0].link, "https://supabase.com/docs/x");
});

test("accetta anche {lints} e la lista nuda; senza conto usa il numero dei ritrovamenti", () => {
  assert.equal(daAdvisors({ lints: GREZZO.result.lints }, "x").avvisi.length, 2);
  assert.equal(daAdvisors([{ name: "a", level: "warn", findings: [{}, {}] }], "x").avvisi[0].quanti, 2);
});

test("un'uscita senza la lista non diventa «nessun avviso»: si ferma", () => {
  assert.throws(() => daAdvisors({ error: "progetto in pausa" }, "x"), /non trovo la lista/);
  assert.throws(() => daAdvisors(null, "x"), /non trovo la lista/);
});

test("forma «una voce per oggetto» (senza count né findings): si raggruppa per nome, ogni voce vale 1", () => {
  const s = daAdvisors({ lints: [
    { name: "security_definer_view", level: "ERROR", title: "Security Definer View", metadata: { name: "v1" } },
    { name: "security_definer_view", level: "ERROR", title: "Security Definer View", metadata: { name: "v2" } },
    { name: "rls_enabled_no_policy", level: "INFO", metadata: { name: "t1" } },
  ] }, "x");
  assert.deepEqual(s.avvisi.map((a) => [a.nome, a.quanti, a.esempi]), [["security_definer_view", 2, []], ["rls_enabled_no_policy", 1, ["t1"]]]);
});

test("un'uscita di performance non si salva come controllo di sicurezza", () => {
  assert.throws(() => daAdvisors({ lints: [{ name: "unindexed_foreign_keys", level: "INFO", categories: ["PERFORMANCE"], count: 3 }] }, "x"), /nessun controllo di sicurezza/);
  const misto = daAdvisors({ lints: [{ name: "a", categories: ["SECURITY"], count: 1 }, { name: "b", categories: ["PERFORMANCE"], count: 9 }] }, "x");
  assert.deepEqual(misto.avvisi.map((a) => a.nome), ["a"]);
});

test("l'ora salvata è quella della lettura (--letto o l'ora del file), in formato di Piacenza", async () => {
  const { oraDiPiacenza } = await import("../sicurezza-supabase.mjs");
  assert.equal(oraDiPiacenza(new Date("2026-11-05T08:46:03Z")), "2026-11-05 09:46");
  assert.equal(oraDiPiacenza(new Date("2026-07-01T22:30:00Z")), "2026-07-02 00:30");
});

test("la riga di comando rifiuta un progetto che non è il database del sito", async () => {
  const { spawnSync } = await import("node:child_process");
  const { fileURLToPath } = await import("node:url");
  const script = fileURLToPath(new URL("../sicurezza-supabase.mjs", import.meta.url));
  const r = spawnSync(process.execPath, [script, "scrivi", "/dev/null", "--progetto", "xjljcsorpbqwttrejqte"], { encoding: "utf8" });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /database del sito/);
  const senza = spawnSync(process.execPath, [script, "scrivi", "/dev/null"], { encoding: "utf8" });
  assert.equal(senza.status, 2);
});

test("i nomi si tengono solo per le informazioni: un livello nuovo o vuoto non li salva", () => {
  const s = daAdvisors({ lints: [{ name: "x", level: "", count: 1, findings: [{ metadata: { name: "f_segreta" } }] }, { name: "y", level: "CRITICAL", count: 1, findings: [{ metadata: { name: "g_segreta" } }] }] }, "x");
  assert.ok(!JSON.stringify(s).includes("segreta"));
});

test("oggetti diversi: la stessa funzione in due controlli si conta una volta; con l'elenco incompleto non si inventa", () => {
  const s = daAdvisors({ lints: [
    { name: "anon_fn", level: "WARN", count: 2, findings: [{ metadata: { name: "a" } }, { metadata: { name: "b" } }] },
    { name: "auth_fn", level: "WARN", count: 3, findings: [{ metadata: { name: "a" } }, { metadata: { name: "b" } }, { metadata: { name: "c" } }] },
    { name: "info", level: "INFO", count: 5, findings: [] },
  ] }, "x");
  assert.equal(s.oggetti_distinti, 3);
  const corto = daAdvisors({ lints: [{ name: "anon_fn", level: "WARN", count: 15, findings: [{ metadata: { name: "a" } }] }] }, "x");
  assert.equal(corto.oggetti_distinti, null);
});

test("l'ora predefinita è l'observed_at di Supabase; un'ora nel futuro si rifiuta", async () => {
  const { osservatoIl } = await import("../sicurezza-supabase.mjs");
  const d = osservatoIl({ result: { lints: [{ findings: [{ observed_at: "2026-11-05T08:46:03.569Z" }, { observed_at: "2026-11-05T08:40:00Z" }] }] } });
  assert.equal(d.toISOString(), "2026-11-05T08:46:03.569Z");
  const { spawnSync } = await import("node:child_process");
  const { writeFileSync, mkdtempSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const dir = mkdtempSync(join(tmpdir(), "supa-"));
  const f = join(dir, "grezzo.json");
  writeFileSync(f, JSON.stringify({ lints: [{ name: "a", level: "WARN", count: 1, findings: [{ observed_at: "2099-01-01T00:00:00Z" }] }] }));
  const script = fileURLToPath(new URL("../sicurezza-supabase.mjs", import.meta.url));
  const r = spawnSync(process.execPath, [script, "scrivi", f, "--progetto", "clmpyfvpvfjgeviworth"], { encoding: "utf8" });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /nel futuro/);
});
