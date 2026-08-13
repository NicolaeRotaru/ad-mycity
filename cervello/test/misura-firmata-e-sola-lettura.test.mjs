#!/usr/bin/env node
// AR-568 (parziale) — «un comando di sola lettura lanciato da dove mancano le chiavi riscrive la
// memoria dei sensi con la propria cecità».
//
// ⚠️ QUESTO FILE NON CHIUDE AR-568, e dirlo è metà del lavoro. Il difetto chiede quattro cose:
//   (a) ogni file di misura porta `origine` e `copertura`   → qui: fatto per sensori-cecita.json;
//   (b) chi scrive rifiuta di sostituire una misura con una a copertura MINORE → NON fatto;
//   (c) `--sola-lettura` che stampa e non scrive           → qui: fatto per verifica-sensori.mjs;
//   (d) il cancello di pubblicazione ferma chi abbassa la copertura → NON fatto.
// (b) e (d) vivono in file fuori dal territorio di questa corsia, e (b) ha bisogno prima di una
// decisione umana — quali file di misura sono di proprietà del VPS. La copertura scritta qui è il
// numero senza il quale (b) e (d) non sono nemmeno scrivibili: prima di poter rifiutare una misura
// più povera bisogna sapere quanto ha visto quella di prima, e finora non lo sapeva nessuno.
//
// La prova esegue il comando vero e guarda il file sul disco, in tre situazioni.

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { origineMisura } from "../misura-o-cieco.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const VERIFICA = join(REPO, "cervello/verifica-sensori.mjs");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// Stringa vuota e non `delete`: git-github.mjs ripopola dal .env le chiavi ASSENTI dall'ambiente.
const CHIAVI = [
  "MARKETPLACE_SUPABASE_URL", "MARKETPLACE_SUPABASE_KEY", "MARKETPLACE_SUPABASE_ANON_KEY",
  "STRIPE_SECRET_KEY", "POSTHOG_API_KEY", "RESEND_API_KEY", "MARKETPLACE_SITE_URL",
  "SUPABASE_URL", "SUPABASE_SERVICE_KEY", "SUPABASE_SERVICE_ROLE_KEY", "PANNELLO_URL",
  "CABINA_URL", "TELEGRAM_BOT_TOKEN", "N8N_WEBHOOK_URL", "N8N_HEALTH_URL",
];

const dir = mkdtempSync(join(tmpdir(), "ar568-"));

function lancia(args = [], env = {}, statoFile = join(dir, `c-${Math.random().toString(36).slice(2)}.json`)) {
  const spento = Object.fromEntries(CHIAVI.map((k) => [k, ""]));
  const r = spawnSync(process.execPath, [VERIFICA, "--json", ...args], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 120_000,
    env: { ...process.env, ...spento, ...env, SENSORI_CECITA_FILE: statoFile },
  });
  let json = {};
  try {
    json = JSON.parse(r.stdout || "{}");
  } catch { /* il file sul disco resta la cosa che si misura */ }
  return { rc: r.status, json, statoFile, esiste: existsSync(statoFile) };
}

// ── (a) il timbro di provenienza ─────────────────────────────────────────────
prova("origineMisura riconosce il punto d'osservazione, e non inventa un «vps» che non c'è", () => {
  assert.equal(origineMisura({ MYCITY_ORIGINE: "vps" }), "vps", "la dichiarazione esplicita comanda");
  assert.equal(origineMisura({ VPS: "1" }), "vps");
  assert.equal(origineMisura({ CI: "true" }), "cloud", "una sessione di agente è cieca per costruzione: va detto");
  assert.equal(origineMisura({}), "locale", "senza indizi si dice «locale», non «vps»: non si millanta la vista");
});

prova("il file di misura scritto porta DA DOVE viene e QUANTO ha visto", () => {
  // Con una chiave presente il file si scrive davvero: è lì che il timbro deve comparire.
  const { statoFile, esiste } = lancia([], { MARKETPLACE_SUPABASE_URL: "http://127.0.0.1:1", MARKETPLACE_SUPABASE_KEY: "finta" });
  assert.equal(esiste, true, "premessa: con una chiave presente il file di misura si scrive");
  const doc = JSON.parse(readFileSync(statoFile, "utf8"));
  assert.ok(doc.origine, "una misura anonima non si può confrontare con nessun'altra: manca `origine`");
  assert.equal(typeof doc.copertura, "number", "senza il numero di copertura, «cieco non sovrascrive vedente» non è scrivibile");
  assert.equal(doc.copertura, 1, `copertura attesa 1 (un solo sensore d'ambiente misurabile), letta ${doc.copertura}`);
});

prova("la copertura è un numero che si muove con quanto si è visto davvero", () => {
  // Due punti d'osservazione diversi devono produrre due coperture diverse, o il numero è una
  // costante travestita da misura e nessun confronto futuro avrebbe senso.
  const povera = lancia([], { MARKETPLACE_SUPABASE_URL: "http://127.0.0.1:1", MARKETPLACE_SUPABASE_KEY: "finta" });
  const ricca = lancia([], {
    MARKETPLACE_SUPABASE_URL: "http://127.0.0.1:1", MARKETPLACE_SUPABASE_KEY: "finta",
    MARKETPLACE_SITE_URL: "http://127.0.0.1:1", STRIPE_SECRET_KEY: "sk_test_finta",
  });
  const a = JSON.parse(readFileSync(povera.statoFile, "utf8")).copertura;
  const b = JSON.parse(readFileSync(ricca.statoFile, "utf8")).copertura;
  assert.ok(b > a, `chi ha guardato più cose deve dichiarare una copertura più alta (${b} contro ${a})`);
});

// ── (c) guarda ma non toccare ────────────────────────────────────────────────
prova("--sola-lettura non crea il file di misura nemmeno quando le chiavi ci sono", () => {
  const { rc, esiste, statoFile } = lancia(["--sola-lettura"], {
    MARKETPLACE_SUPABASE_URL: "http://127.0.0.1:1", MARKETPLACE_SUPABASE_KEY: "finta",
  });
  assert.equal(esiste, false, `--sola-lettura ha comunque scritto ${statoFile}: il «guardo e non tocco» è una promessa non mantenuta`);
  assert.equal(rc, 1, "e il verdetto deve restare quello vero: cieco misurato = 1, non un codice addolcito");
});

prova("--sola-lettura non calpesta un file di misura che esiste già", () => {
  // Il caso vero di AR-568: la memoria dei sensi c'è, l'ha scritta chi poteva vedere, e arriva un
  // comando di diagnosi da fuori. Non deve restare traccia del suo passaggio.
  const statoFile = join(dir, "gia-scritto.json");
  const originale = JSON.stringify({ aggiornato: "2026-08-12 22:00", origine: "vps", copertura: 9, sensori: { supabase_rest: { stato: "ok" } } }, null, 2);
  writeFileSync(statoFile, originale);
  lancia(["--sola-lettura"], { MARKETPLACE_SUPABASE_URL: "http://127.0.0.1:1", MARKETPLACE_SUPABASE_KEY: "finta" }, statoFile);
  assert.equal(readFileSync(statoFile, "utf8"), originale, "il file del VPS è cambiato: la sola lettura ha lasciato impronte");
});

prova("e senza il flag il comando torna a scrivere: la porta non è rimasta chiusa per tutti", () => {
  const { esiste } = lancia([], { MARKETPLACE_SUPABASE_URL: "http://127.0.0.1:1", MARKETPLACE_SUPABASE_KEY: "finta" });
  assert.equal(esiste, true, "senza --sola-lettura la scrittura deve funzionare come prima, o il sensore ha smesso di ricordare");
});

rmSync(dir, { recursive: true, force: true });

let ko = 0;
for (const c of casi) {
  console.log(`  ${c.ok ? "ok" : "NOT ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) ko++;
}
console.log(`# pass ${casi.length - ko}\n# fail ${ko}`);
process.exit(ko ? 1 : 0);
