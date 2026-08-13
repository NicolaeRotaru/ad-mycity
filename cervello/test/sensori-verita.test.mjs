#!/usr/bin/env node
// 🧾 LA MALATTIA: i sensori raccontano il falso — un verdetto verde senza aver misurato niente.
//
// AR-587 — la riproduzione della radiografia: da una sessione senza chiavi l'esito usciva "ok"
//   con ZERO sensori d'ambiente misurati; l'unico verde era il guardiano esterno, che guarda un
//   file nel repo ed è verde ovunque. Cura: esito "non_misurato" (cecità dichiarata), exit 1,
//   istruzioni che non affermano cose non misurate.
// AR-590 — un sensore spento per decisione del proprietario (POSTHOG_OFF=1, Nicola 5/7)
//   risultava ancora "ok" nello stato scritto, perché la protezione anti-calpestamento (AR-573)
//   ripristinava il vecchio valore anche per chi era spento apposta.
// AR-591 — nel riassunto gli spenti finivano nel denominatore come se fossero rotti
//   («7/11 ok» con 4 sensori spenti apposta): il denominatore giusto sono i configurati.
//
// Le prove ESEGUONO la logica (funzioni pure + il comando vero in un sottoprocesso con file di
// stato usa-e-getta): niente grep sul sorgente, niente scritture sulla memoria vera.

import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { eSpentoPerDecisione, istruzioniGiro, sintesiSensori, verdettoSensori } from "../lib-sensori-verdetto.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const VERIFICA = join(QUI, "..", "verifica-sensori.mjs");

const casi = [];
const prova = async (nome, fn) => {
  try {
    await fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n").slice(0, 3).join(" | ") });
  }
};

/** Le chiavi che il comando legge: spegnerle tutte = la sessione cloud della radiografia. */
const CHIAVI = [
  "MARKETPLACE_SUPABASE_URL", "MARKETPLACE_SUPABASE_KEY", "MARKETPLACE_SUPABASE_ANON_KEY",
  "STRIPE_SECRET_KEY", "POSTHOG_API_KEY", "POSTHOG_PERSONAL_API_KEY", "POSTHOG_OFF",
  "RESEND_API_KEY", "MARKETPLACE_SITE_URL", "SUPABASE_URL", "SUPABASE_SERVICE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY", "PANNELLO_URL", "CABINA_URL", "TELEGRAM_BOT_TOKEN",
  "N8N_WEBHOOK_URL", "N8N_HEALTH_URL",
];

/** Esegue il comando vero con l'ambiente controllato; il JSON esce anche con exit 1. */
function eseguiVerifica(extraEnv, statoFile) {
  const env = { ...process.env, SENSORI_CECITA_FILE: statoFile };
  for (const k of CHIAVI) env[k] = ""; // stringa vuota: spegne anche se un .env la ripopolerebbe
  Object.assign(env, extraEnv);
  try {
    const out = execFileSync("node", [VERIFICA, "--json"], { env, encoding: "utf8", timeout: 240000, stdio: ["ignore", "pipe", "pipe"] });
    return { json: JSON.parse(out), code: 0 };
  } catch (e) {
    return { json: JSON.parse(String(e.stdout || "{}")), code: e.status ?? 1 };
  }
}

/** Finto sito che risponde 200, in un processo a parte (execFileSync blocca il loop di eventi). */
function fintoSito() {
  const src = `
    import { createServer } from "node:http";
    const srv = createServer((req, res) => { res.writeHead(200); res.end("ok"); });
    srv.listen(0, "127.0.0.1", () => console.log(srv.address().port));
  `;
  const srv = spawn("node", ["--input-type=module", "-e", src], { stdio: ["ignore", "pipe", "inherit"] });
  return new Promise((ok, ko) => {
    const t = setTimeout(() => ko(new Error("il finto sito non è partito")), 10000);
    srv.stdout.once("data", (b) => {
      clearTimeout(t);
      ok({ srv, porta: Number(String(b).trim()) });
    });
  });
}

// ── AR-587: il verdetto puro ─────────────────────────────────────────────────
await prova("AR-587 (pura): solo il guardiano-file verde e zero sensori d'ambiente → NON è 'ok', è 'non_misurato'", () => {
  // La fotografia della sessione cloud: tutti i check con chiavi assenti, il watchdog verde.
  const checks = [
    { nome: "supabase_rest", ok: false, configurato: false },
    { nome: "stripe_api", ok: false, configurato: false },
    { nome: "sito_uptime", ok: false, configurato: false },
    { nome: "watchdog_esterno", ok: true, configurato: true, dipende_da_env: false },
  ];
  const v = verdettoSensori(checks);
  assert.equal(v.esito, "non_misurato", `esito ${v.esito}: un file nel repo non è una misura dell'ambiente`);
  assert.equal(v.misurati_ambiente, 0);
  assert.notEqual(v.esito, "ok");
});

await prova("AR-587 (pura): un sensore d'ambiente misurato e ok → 'ok'; misurati ma tutti rotti → 'cieco'", () => {
  const base = [
    { nome: "stripe_api", ok: false, configurato: false },
    { nome: "watchdog_esterno", ok: true, configurato: true, dipende_da_env: false },
  ];
  const conOk = verdettoSensori([...base, { nome: "supabase_rest", ok: true, configurato: true }]);
  assert.equal(conOk.esito, "ok");
  const tuttiRotti = verdettoSensori([...base, { nome: "supabase_rest", ok: false, configurato: true }]);
  assert.equal(tuttiRotti.esito, "cieco", "il watchdog verde non deve coprire i sensori d'ambiente rotti");
});

await prova("AR-587 (comando vero): senza chiavi l'esito è 'non_misurato' e l'exit non è 0", () => {
  const dir = mkdtempSync(join(tmpdir(), "sensori-verita-"));
  try {
    const { json, code } = eseguiVerifica({}, join(dir, "cecita.json"));
    const wd = json.checks.find((c) => c.nome === "watchdog_esterno");
    assert.equal(wd?.ok, true, "premessa della riproduzione: il guardiano-file da solo era il vecchio verde");
    assert.equal(json.esito, "non_misurato", `esito '${json.esito}': senza misure vere non può dichiararsi ok`);
    assert.equal(json.sensori_ambiente_misurati, 0);
    assert.notEqual(code, 0, "exit 0 senza aver misurato niente = verde finto");
    assert.match(json.istruzioni_giro, /NESSUN sensore d'ambiente misurato/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

await prova("AR-587: le istruzioni non affermano più «Stripe ok» quando Stripe non è stato misurato", () => {
  assert.doesNotMatch(istruzioniGiro("ok", false), /Stripe ok/i);
  assert.doesNotMatch(istruzioniGiro("non_misurato", false), /ok:/i);
});

// ── AR-590: lo spento per decisione resta spento ─────────────────────────────
await prova("AR-590 (pura): POSTHOG_OFF (spento:true) e motivo 'decisione' sono spenti; la sola chiave assente no", () => {
  assert.equal(eSpentoPerDecisione({ nome: "posthog_api", spento: true }, null), true);
  assert.equal(eSpentoPerDecisione({ nome: "telegram_bot" }, { motivi: { telegram_bot: { motivo: "decisione" } } }), true);
  assert.equal(eSpentoPerDecisione({ nome: "stripe_api" }, { motivi: {} }), false, "chiave assente da qui ≠ spento apposta (AR-573 resta)");
});

await prova("AR-590 (comando vero): PostHog spento su decisione NON resta 'ok' nello stato scritto", async () => {
  const { srv, porta } = await fintoSito();
  const dir = mkdtempSync(join(tmpdir(), "sensori-spento-"));
  const statoFile = join(dir, "cecita.json");
  // Lo stato di partenza è il sintomo vero: posthog memorizzato "ok" da quando era acceso.
  writeFileSync(statoFile, JSON.stringify({
    aggiornato: "2026-07-04 16:20",
    sensori: { posthog_api: { stato: "ok", giri_ciechi: 0, canale: "PostHog API", dettaglio: "projects API ok", ultimo_ok: "2026-07-04 16:20" } },
    meta: { giri_totali: 5 },
  }, null, 2));
  try {
    // POSTHOG_OFF=1 = la decisione di Nicola (5/7); il sito finto apre la porta di scrittura
    // (ambiente configurato), che era la condizione in cui il vecchio "ok" veniva ripristinato.
    const { json } = eseguiVerifica({ POSTHOG_OFF: "1", MARKETPLACE_SITE_URL: `http://127.0.0.1:${porta}` }, statoFile);
    assert.equal(json.stato_persistito, true, "premessa: la porta di scrittura deve essere aperta");
    const stato = JSON.parse(readFileSync(statoFile, "utf8"));
    assert.equal(
      stato.sensori.posthog_api.stato,
      "non_configurato",
      `PostHog spento per decisione risulta '${stato.sensori.posthog_api.stato}': un sensore spento che risulta acceso è un falso`
    );
    // AR-591, sulla stessa corsa vera: denominatore = configurati (sito+watchdog), spenti a parte.
    assert.match(json.sintesi, /^2\/2 ok · \d+ spenti/, `sintesi «${json.sintesi}»: gli spenti non stanno nel denominatore`);
    const spentiDichiarati = Number(json.sintesi.match(/(\d+) spenti/)?.[1]);
    assert.equal(spentiDichiarati, json.checks.length - 2, "gli spenti dichiarati devono essere tutti i non configurati");
  } finally {
    srv.kill();
    rmSync(dir, { recursive: true, force: true });
  }
});

await prova("AR-573 non regredisce: la chiave assente da qui conserva il valore misurato dal VPS", async () => {
  // Stripe ha lo stato "ok" misurato dal VPS; da questa sessione la chiave non c'è (e NON è una
  // decisione): il valore va conservato con la marcatura non_misurato_qui, come prima del fix.
  const { srv, porta } = await fintoSito();
  const dir = mkdtempSync(join(tmpdir(), "sensori-conserva-"));
  const statoFile = join(dir, "cecita.json");
  writeFileSync(statoFile, JSON.stringify({
    sensori: { stripe_api: { stato: "ok", giri_ciechi: 0, canale: "Stripe API", dettaglio: "balance API ok", ultimo_ok: "2026-08-10 14:20" } },
    meta: { giri_totali: 5 },
  }, null, 2));
  try {
    eseguiVerifica({ MARKETPLACE_SITE_URL: `http://127.0.0.1:${porta}` }, statoFile);
    const stato = JSON.parse(readFileSync(statoFile, "utf8"));
    assert.equal(stato.sensori.stripe_api.stato, "ok", "il valore del VPS è stato calpestato: AR-573 regredito");
    assert.ok(stato.sensori.stripe_api.non_misurato_qui, "manca la marcatura non_misurato_qui");
  } finally {
    srv.kill();
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── AR-591: il riassunto puro ────────────────────────────────────────────────
await prova("AR-591 (pura): denominatore = configurati, spenti dichiarati a parte", () => {
  const checks = [
    { nome: "supabase_rest", ok: true, configurato: true },
    { nome: "supabase_memoria", ok: true, configurato: true },
    { nome: "stripe_api", ok: false, configurato: false },
    { nome: "posthog_api", ok: false, configurato: false, spento: true },
    { nome: "resend_api", ok: false, configurato: false },
    { nome: "telegram_bot", ok: false, configurato: false },
  ];
  const s = sintesiSensori(verdettoSensori(checks), 0);
  assert.match(s, /^2\/2 ok/, `«${s}»: 4 sensori spenti contati come rotti nel denominatore`);
  assert.match(s, /4 spenti/, `«${s}»: gli spenti vanno dichiarati, non nascosti`);
  assert.doesNotMatch(s, /2\/6/, "il vecchio denominatore (tutti i check) è tornato");
});

// ── Verdetto del file di prova ───────────────────────────────────────────────
const rossi = casi.filter((c) => !c.ok);
console.log(`TAP version 13\n1..${casi.length}`);
casi.forEach((c, i) => console.log(`${c.ok ? "ok" : "not ok"} ${i + 1} - ${c.nome}${c.ok ? "" : `\n  # ${c.err}`}`));
console.log(`# pass ${casi.length - rossi.length}\n# fail ${rossi.length}`);
process.exit(rossi.length ? 1 : 0);
